/**
 * TaskSlicer - Autonomous Task Decomposition Engine
 * Uses Claude 4.5 to break large problems into executable tasks
 */

import { OmniAdapter } from '@/adapters/claude/OmniAdapter';
import {
  Task,
  TaskQueue,
  TaskStatus,
  AIProvider,
  AdapterRequest,
  QuovarineError
} from '@/types/quovarine';
import { z } from 'zod';

// Zod schema for task validation
const TaskSchema = z.object({
  id: z.string(),
  description: z.string(),
  priority: z.number().min(1).max(10),
  dependencies: z.array(z.string()),
  estimatedComplexity: z.number().min(1).max(10)
});

const TaskQueueSchema = z.object({
  tasks: z.array(TaskSchema)
});

export class TaskSlicer {
  private adapter: OmniAdapter;
  private taskQueue: TaskQueue;

  constructor(provider: AIProvider = AIProvider.ANTHROPIC) {
    this.adapter = new OmniAdapter(provider);
    this.taskQueue = {
      tasks: [],
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0
    };
  }

  /**
   * Decompose a large problem into smaller executable tasks
   */
  async decompose(problemStatement: string): Promise<TaskQueue> {
    const prompt = this.buildDecompositionPrompt(problemStatement);

    try {
      const request: AdapterRequest = {
        prompt,
        maxTokens: 16000,
        temperature: 0.3, // Lower temperature for more structured output
        thinking: true // Use Extended Thinking for better decomposition
      };

      const response = await this.adapter.sendMessage(request);

      // Parse the response to extract tasks
      const tasks = this.parseTasks(response.content);

      // Validate and create task queue
      this.taskQueue = {
        tasks: tasks.map(task => ({
          ...task,
          status: TaskStatus.PENDING,
          createdAt: new Date()
        })),
        totalTasks: tasks.length,
        completedTasks: 0,
        failedTasks: 0
      };

      return this.taskQueue;
    } catch (error) {
      throw new QuovarineError(
        'Failed to decompose problem',
        'DECOMPOSITION_FAILED',
        this.adapter.provider,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Build the decomposition prompt
   */
  private buildDecompositionPrompt(problemStatement: string): string {
    return `You are an expert software architect and task planner. Your job is to decompose a large problem into smaller, executable tasks.

PROBLEM STATEMENT:
${problemStatement}

Please analyze this problem and break it down into a list of specific, actionable tasks. For each task:
1. Assign a unique ID (task-1, task-2, etc.)
2. Provide a clear, concise description
3. Set a priority (1-10, where 10 is highest)
4. List any task dependencies (by ID)
5. Estimate complexity (1-10, where 10 is most complex)

Return your response as a JSON array with this exact structure:
{
  "tasks": [
    {
      "id": "task-1",
      "description": "Task description here",
      "priority": 8,
      "dependencies": [],
      "estimatedComplexity": 5
    }
  ]
}

Guidelines:
- Each task should be independently executable
- Tasks should be ordered by logical execution sequence
- Include setup/configuration tasks first
- Include validation/testing tasks last
- Be specific about what needs to be done
- Consider dependencies carefully

Return ONLY the JSON, no additional text.`;
  }

  /**
   * Parse tasks from Claude's response
   */
  private parseTasks(response: string): Omit<Task, 'status' | 'createdAt'>[] {
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate with Zod
      const validated = TaskQueueSchema.parse(parsed);

      return validated.tasks;
    } catch (error) {
      console.error('Failed to parse tasks:', error);
      console.error('Response:', response);

      // Return a fallback task
      return [{
        id: 'task-fallback',
        description: 'Manual task decomposition required',
        priority: 10,
        dependencies: [],
        estimatedComplexity: 10
      }];
    }
  }

  /**
   * Get the current task queue
   */
  getQueue(): TaskQueue {
    return this.taskQueue;
  }

  /**
   * Get next task to execute (respecting dependencies)
   */
  getNextTask(): Task | null {
    const completedIds = new Set(
      this.taskQueue.tasks
        .filter(t => t.status === TaskStatus.COMPLETED)
        .map(t => t.id)
    );

    // Find highest priority pending task with satisfied dependencies
    const availableTasks = this.taskQueue.tasks
      .filter(task => {
        if (task.status !== TaskStatus.PENDING) return false;
        
        // Check if all dependencies are completed
        return task.dependencies.every(depId => completedIds.has(depId));
      })
      .sort((a, b) => b.priority - a.priority);

    return availableTasks[0] || null;
  }

  /**
   * Mark a task as in progress
   */
  startTask(taskId: string): Task | null {
    const task = this.taskQueue.tasks.find(t => t.id === taskId);
    if (task && task.status === TaskStatus.PENDING) {
      task.status = TaskStatus.IN_PROGRESS;
      return task;
    }
    return null;
  }

  /**
   * Mark a task as completed
   */
  completeTask(taskId: string): Task | null {
    const task = this.taskQueue.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = TaskStatus.COMPLETED;
      task.completedAt = new Date();
      this.taskQueue.completedTasks++;
      return task;
    }
    return null;
  }

  /**
   * Mark a task as failed
   */
  failTask(taskId: string, error: string): Task | null {
    const task = this.taskQueue.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = TaskStatus.FAILED;
      task.error = error;
      task.completedAt = new Date();
      this.taskQueue.failedTasks++;
      return task;
    }
    return null;
  }

  /**
   * Mark a task as blocked
   */
  blockTask(taskId: string, reason: string): Task | null {
    const task = this.taskQueue.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = TaskStatus.BLOCKED;
      task.error = reason;
      return task;
    }
    return null;
  }

  /**
   * Get task execution progress
   */
  getProgress(): {
    total: number;
    completed: number;
    failed: number;
    inProgress: number;
    pending: number;
    percentComplete: number;
  } {
    const inProgress = this.taskQueue.tasks.filter(
      t => t.status === TaskStatus.IN_PROGRESS
    ).length;
    const pending = this.taskQueue.tasks.filter(
      t => t.status === TaskStatus.PENDING
    ).length;

    return {
      total: this.taskQueue.totalTasks,
      completed: this.taskQueue.completedTasks,
      failed: this.taskQueue.failedTasks,
      inProgress,
      pending,
      percentComplete: this.taskQueue.totalTasks > 0
        ? (this.taskQueue.completedTasks / this.taskQueue.totalTasks) * 100
        : 0
    };
  }

  /**
   * Get tasks by status
   */
  getTasksByStatus(status: TaskStatus): Task[] {
    return this.taskQueue.tasks.filter(t => t.status === status);
  }

  /**
   * Get task by ID
   */
  getTaskById(taskId: string): Task | undefined {
    return this.taskQueue.tasks.find(t => t.id === taskId);
  }

  /**
   * Reset the task queue
   */
  reset() {
    this.taskQueue = {
      tasks: [],
      totalTasks: 0,
      completedTasks: 0,
      failedTasks: 0
    };
  }

  /**
   * Export task queue as JSON
   */
  export(): string {
    return JSON.stringify(this.taskQueue, null, 2);
  }

  /**
   * Import task queue from JSON
   */
  import(json: string): TaskQueue {
    try {
      const data = JSON.parse(json);
      
      // Validate with Zod schema
      const validated = TaskQueueSchema.parse(data);
      
      // Add status and timestamps to tasks
      this.taskQueue = {
        tasks: validated.tasks.map(task => ({
          ...task,
          status: TaskStatus.PENDING,
          createdAt: new Date()
        })),
        totalTasks: validated.tasks.length,
        completedTasks: 0,
        failedTasks: 0
      };
      
      return this.taskQueue;
    } catch (error) {
      throw new QuovarineError(
        'Failed to import task queue: Invalid data format',
        'IMPORT_FAILED',
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }
}

export default TaskSlicer;
