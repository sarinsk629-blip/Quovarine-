/**
 * QuovarineBridge
 * Bridge for integrating Anthropic's Claude with Quovarine workflows
 */

import Anthropic from '@anthropic-ai/sdk';
import { ClaudeMessage, ClaudeResponse, QuovarineConfig } from '../../types/quovarine';
import { PROVIDERS } from '../../config/providers';

export class QuovarineBridge {
  private client: Anthropic;
  private config: QuovarineConfig;
  
  constructor(config?: Partial<QuovarineConfig>) {
    const apiKey = PROVIDERS.anthropic.apiKey;
    
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }
    
    this.client = new Anthropic({
      apiKey,
    });
    
    this.config = {
      model: config?.model || PROVIDERS.anthropic.model,
      thinking_effort: config?.thinking_effort || PROVIDERS.anthropic.thinking_effort,
      max_tokens: config?.max_tokens || 4096,
      temperature: config?.temperature || 1.0,
    };
  }
  
  /**
   * Send a message to Claude and get a response
   */
  async sendMessage(
    messages: ClaudeMessage[],
    options?: Partial<QuovarineConfig>
  ): Promise<ClaudeResponse> {
    try {
      const response = await this.client.messages.create({
        model: options?.model || this.config.model,
        max_tokens: options?.max_tokens || this.config.max_tokens!,
        temperature: options?.temperature || this.config.temperature,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
      });
      
      return response as unknown as ClaudeResponse;
    } catch (error) {
      console.error('[QuovarineBridge] Error sending message:', error);
      throw error;
    }
  }
  
  /**
   * Send a single prompt to Claude
   */
  async sendPrompt(
    prompt: string,
    options?: Partial<QuovarineConfig>
  ): Promise<string> {
    const messages: ClaudeMessage[] = [
      {
        role: 'user',
        content: prompt,
      },
    ];
    
    const response = await this.sendMessage(messages, options);
    
    // Extract text from content blocks
    const textContent = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n');
    
    return textContent;
  }
  
  /**
   * Analyze a task and provide recommendations
   */
  async analyzeTask(task: string, context?: Record<string, unknown>): Promise<string> {
    const contextStr = context 
      ? `\n\nContext:\n${JSON.stringify(context, null, 2)}`
      : '';
    
    const prompt = `You are an autonomous workflow automation system. Analyze the following task and provide recommendations for execution:

Task: ${task}${contextStr}

Provide:
1. Task breakdown
2. Potential risks
3. Recovery strategies
4. Estimated complexity`;
    
    return this.sendPrompt(prompt);
  }
  
  /**
   * Generate recovery plan for a failure
   */
  async generateRecoveryPlan(
    failureDescription: string,
    errorDetails?: string
  ): Promise<string> {
    const errorStr = errorDetails 
      ? `\n\nError Details:\n${errorDetails}`
      : '';
    
    const prompt = `You are a self-healing system. Generate a recovery plan for the following failure:

Failure: ${failureDescription}${errorStr}

Provide:
1. Root cause analysis
2. Immediate recovery steps
3. Long-term prevention measures
4. Rollback strategy if needed`;
    
    return this.sendPrompt(prompt);
  }
  
  /**
   * Get current configuration
   */
  getConfig(): QuovarineConfig {
    return { ...this.config };
  }
  
  /**
   * Update configuration
   */
  updateConfig(config: Partial<QuovarineConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
  }
}
