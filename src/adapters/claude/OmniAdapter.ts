/**
 * OmniAdapter
 * Universal adapter for multi-provider AI integration
 */

import { QuovarineBridge } from './QuovarineBridge';
import { QuovarineConfig } from '../../types/quovarine';

export type AdapterProvider = 'claude' | 'openai';

export interface AdapterOptions {
  provider: AdapterProvider;
  config?: Partial<QuovarineConfig>;
}

export class OmniAdapter {
  private provider: AdapterProvider;
  private claudeBridge?: QuovarineBridge;
  
  constructor(options: AdapterOptions) {
    this.provider = options.provider;
    
    if (this.provider === 'claude') {
      this.claudeBridge = new QuovarineBridge(options.config);
    }
  }
  
  /**
   * Send a prompt to the active provider
   */
  async sendPrompt(
    prompt: string,
    options?: Partial<QuovarineConfig>
  ): Promise<string> {
    switch (this.provider) {
      case 'claude':
        if (!this.claudeBridge) {
          throw new Error('Claude bridge not initialized');
        }
        return this.claudeBridge.sendPrompt(prompt, options);
        
      case 'openai':
        // OpenAI integration would go here
        throw new Error('OpenAI provider not yet implemented');
        
      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }
  
  /**
   * Analyze a task using the active provider
   */
  async analyzeTask(task: string, context?: Record<string, unknown>): Promise<string> {
    switch (this.provider) {
      case 'claude':
        if (!this.claudeBridge) {
          throw new Error('Claude bridge not initialized');
        }
        return this.claudeBridge.analyzeTask(task, context);
        
      case 'openai':
        throw new Error('OpenAI provider not yet implemented');
        
      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }
  
  /**
   * Generate a recovery plan using the active provider
   */
  async generateRecoveryPlan(
    failureDescription: string,
    errorDetails?: string
  ): Promise<string> {
    switch (this.provider) {
      case 'claude':
        if (!this.claudeBridge) {
          throw new Error('Claude bridge not initialized');
        }
        return this.claudeBridge.generateRecoveryPlan(failureDescription, errorDetails);
        
      case 'openai':
        throw new Error('OpenAI provider not yet implemented');
        
      default:
        throw new Error(`Unsupported provider: ${this.provider}`);
    }
  }
  
  /**
   * Switch to a different provider
   */
  switchProvider(provider: AdapterProvider, config?: Partial<QuovarineConfig>): void {
    this.provider = provider;
    
    if (provider === 'claude') {
      this.claudeBridge = new QuovarineBridge(config);
    }
  }
  
  /**
   * Get current provider
   */
  getCurrentProvider(): AdapterProvider {
    return this.provider;
  }
  
  /**
   * Get provider configuration
   */
  getConfig(): QuovarineConfig | undefined {
    switch (this.provider) {
      case 'claude':
        return this.claudeBridge?.getConfig();
      default:
        return undefined;
    }
  }
}
