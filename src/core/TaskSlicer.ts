/**
 * TaskSlicer
 * Breaks down complex workflows into manageable task slices
 */

import { TaskSlice } from '../types/quovarine';

export class TaskSlicer {
  private slices: Map<string, TaskSlice> = new Map();
  
  /**
   * Create a new task slice
   */
  createSlice(
    type: TaskSlice['type'],
    payload: unknown,
    options?: {
      priority?: number;
      dependencies?: string[];
    }
  ): TaskSlice {
    const slice: TaskSlice = {
      id: uuidv4(),
      type,
      priority: options?.priority || 0,
      payload,
      dependencies: options?.dependencies,
      status: 'pending',
      retryCount: 0,
    };
    
    this.slices.set(slice.id, slice);
    return slice;
  }
  
  /**
   * Get a task slice by ID
   */
  getSlice(id: string): TaskSlice | undefined {
    return this.slices.get(id);
  }
  
  /**
   * Update task slice status
   */
  updateSliceStatus(id: string, status: TaskSlice['status'], error?: string): void {
    const slice = this.slices.get(id);
    if (slice) {
      slice.status = status;
      if (error) {
        slice.error = error;
      }
      this.slices.set(id, slice);
    }
  }
  
  /**
   * Increment retry count for a failed slice
   */
  incrementRetry(id: string): number {
    const slice = this.slices.get(id);
    if (slice) {
      slice.retryCount = (slice.retryCount || 0) + 1;
      this.slices.set(id, slice);
      return slice.retryCount;
    }
    return 0;
  }
  
  /**
   * Get all slices ready for execution
   * (pending slices with no dependencies or completed dependencies)
   */
  getReadySlices(): TaskSlice[] {
    return Array.from(this.slices.values())
      .filter(slice => {
        if (slice.status !== 'pending') return false;
        
        if (!slice.dependencies || slice.dependencies.length === 0) {
          return true;
        }
        
        return slice.dependencies.every(depId => {
          const dep = this.slices.get(depId);
          return dep?.status === 'completed';
        });
      })
      .sort((a, b) => b.priority - a.priority);
  }
  
  /**
   * Get all slices
   */
  getAllSlices(): TaskSlice[] {
    return Array.from(this.slices.values());
  }
  
  /**
   * Check if all slices are completed
   */
  isComplete(): boolean {
    return Array.from(this.slices.values()).every(
      slice => slice.status === 'completed'
    );
  }
  
  /**
   * Check if any slices have failed
   */
  hasFailed(): boolean {
    return Array.from(this.slices.values()).some(
      slice => slice.status === 'failed'
    );
  }
  
  /**
   * Clear all slices
   */
  clear(): void {
    this.slices.clear();
  }
}

// For UUID generation using Node.js crypto (better than timestamp + random)
function uuidv4(): string {
  // Use crypto.randomUUID() if available (Node 16+), otherwise fallback
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for environments without crypto.randomUUID()
  const timestamp = Date.now().toString(36);
  const random1 = Math.random().toString(36).substring(2, 15);
  const random2 = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random1}-${random2}`;
}
