/**
 * Quovarine Usage Example
 * Demonstrates how to use the main components
 */

import { OmniAdapter } from './src/adapters/claude/OmniAdapter';
import { TaskSlicer } from './src/core/TaskSlicer';
import { SelfHealer } from './src/core/SelfHealer';
import { AIProvider } from './src/types/quovarine';

/**
 * Example 1: Basic AI Interaction
 */
async function basicExample() {
  console.log('\n=== Example 1: Basic AI Interaction ===\n');

  const adapter = new OmniAdapter(AIProvider.ANTHROPIC);

  // Check health
  const health = await adapter.healthCheck();
  console.log('Health Status:', health);

  // Send a message
  const response = await adapter.sendMessage({
    prompt: 'Explain the concept of Hexagonal Architecture in software development.',
    thinking: true,
    maxTokens: 1000
  });

  console.log('Response:', response.content);
  console.log('Thinking Process:', response.thinking);
  console.log('Usage:', response.usage);
}

/**
 * Example 2: Streaming Response
 */
async function streamingExample() {
  console.log('\n=== Example 2: Streaming Response ===\n');

  const adapter = new OmniAdapter(AIProvider.ANTHROPIC);

  console.log('Streaming response...');

  for await (const chunk of adapter.streamMessage({
    prompt: 'Write a short poem about artificial intelligence.',
    maxTokens: 500
  })) {
    if (chunk.delta?.text) {
      process.stdout.write(chunk.delta.text);
    }
  }

  console.log('\n\nStreaming complete!');
}

/**
 * Example 3: Task Decomposition
 */
async function taskDecompositionExample() {
  console.log('\n=== Example 3: Task Decomposition ===\n');

  const slicer = new TaskSlicer();

  // Decompose a complex problem
  const queue = await slicer.decompose(`
    Create a REST API for a blog platform with:
    - User authentication (JWT)
    - CRUD operations for blog posts
    - Comment system
    - Search functionality
    - API documentation with Swagger
  `);

  console.log(`\nTotal tasks: ${queue.totalTasks}`);
  console.log('\nTask breakdown:');

  queue.tasks.forEach((task, index) => {
    console.log(`\n${index + 1}. ${task.description}`);
    console.log(`   Priority: ${task.priority}, Complexity: ${task.estimatedComplexity}`);
    console.log(`   Dependencies: ${task.dependencies.join(', ') || 'None'}`);
  });

  // Simulate task execution
  console.log('\n\nExecuting tasks...');

  while (true) {
    const task = slicer.getNextTask();
    if (!task) break;

    console.log(`\nStarting: ${task.description}`);
    slicer.startTask(task.id);

    // Simulate work
    await new Promise(resolve => setTimeout(resolve, 1000));

    slicer.completeTask(task.id);
    console.log(`✓ Completed: ${task.description}`);
  }

  const progress = slicer.getProgress();
  console.log(`\n\nAll tasks completed! (${progress.percentComplete}%)`);
}

/**
 * Example 4: Self-Healing System
 */
async function selfHealingExample() {
  console.log('\n=== Example 4: Self-Healing System ===\n');

  const healer = new SelfHealer();

  // Start monitoring
  console.log('Starting self-healing monitoring...');
  healer.startMonitoring();

  // Let it run for a bit
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Get current health
  const health = await healer.getCurrentHealth();
  console.log('\nCurrent Health Status:');
  console.log('AI Provider:', health.ai);
  console.log('Cloud Providers:', health.cloud);

  // Get recovery stats
  const stats = healer.getRecoveryStats();
  console.log('\nRecovery Statistics:');
  console.log(`Total Recovery Actions: ${stats.total}`);
  console.log(`Successful: ${stats.successful}`);
  console.log(`Failed: ${stats.failed}`);
  console.log(`Success Rate: ${stats.successRate.toFixed(2)}%`);

  // Stop monitoring
  healer.stopMonitoring();
  console.log('\nMonitoring stopped.');
}

/**
 * Example 5: Provider Failover Simulation
 */
async function failoverExample() {
  console.log('\n=== Example 5: Provider Failover ===\n');

  const adapter = new OmniAdapter(AIProvider.ANTHROPIC);

  // Check all providers
  console.log('Checking all providers...');
  const healthMap = await adapter.checkAllProviders();

  console.log('\nProvider Health Status:');
  for (const [provider, health] of healthMap) {
    console.log(`${provider}: ${health.healthy ? '✓ Healthy' : '✗ Unhealthy'} (${health.latency}ms)`);
  }

  // Get available providers
  const available = adapter.getAvailableProviders();
  console.log('\nAvailable Providers:', available);

  // Send message (will use primary or fallback)
  console.log('\nSending message with automatic failover...');
  const response = await adapter.sendMessage({
    prompt: 'Hello, Claude! Test message.',
    maxTokens: 100
  });

  console.log(`Response from: ${response.metadata?.actualProvider || response.provider}`);
  console.log(`Fallback used: ${response.metadata?.fallbackUsed ? 'Yes' : 'No'}`);
}

/**
 * Example 6: Extended Thinking Demo
 */
async function extendedThinkingExample() {
  console.log('\n=== Example 6: Extended Thinking ===\n');

  const adapter = new OmniAdapter(AIProvider.ANTHROPIC);

  console.log('Using Extended Thinking to solve a complex problem...\n');

  const response = await adapter.sendMessage({
    prompt: `
      Design a distributed caching system that can handle:
      - 1 million requests per second
      - Sub-10ms latency
      - Automatic failover
      - Cache invalidation strategies
      
      Explain your reasoning step by step.
    `,
    thinking: true, // Enable Extended Thinking
    maxTokens: 4000,
    temperature: 0.3
  });

  console.log('=== Thinking Process ===');
  console.log(response.thinking || 'No thinking process captured');

  console.log('\n=== Final Answer ===');
  console.log(response.content);

  console.log('\n=== Usage Statistics ===');
  console.log(`Input Tokens: ${response.usage.inputTokens}`);
  console.log(`Output Tokens: ${response.usage.outputTokens}`);
  console.log(`Total Tokens: ${response.usage.inputTokens + response.usage.outputTokens}`);
}

/**
 * Run all examples
 */
async function runAllExamples() {
  try {
    // Note: These examples require valid API keys in .env
    console.log('Quovarine Usage Examples');
    console.log('========================');
    console.log('\nNote: Make sure you have valid API keys configured in .env');

    // Uncomment the examples you want to run:

    // await basicExample();
    // await streamingExample();
    // await taskDecompositionExample();
    // await selfHealingExample();
    // await failoverExample();
    // await extendedThinkingExample();

    console.log('\n\nAll examples completed!');
  } catch (error) {
    console.error('Error running examples:', error);
  }
}

// Export for use as a module
export {
  basicExample,
  streamingExample,
  taskDecompositionExample,
  selfHealingExample,
  failoverExample,
  extendedThinkingExample,
  runAllExamples
};

// Run if called directly
if (require.main === module) {
  runAllExamples();
}
