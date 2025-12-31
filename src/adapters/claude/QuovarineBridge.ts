/**
 * QuovarineBridge - Main Claude 4.5 Opus Integration
 * Handles direct communication with Anthropic API with Extended Thinking support
 */

import Anthropic from '@anthropic-ai/sdk';
import {
  StreamChunk,
  AdapterRequest,
  AdapterResponse,
  AIProvider,
  QuovarineError,
  RateLimitError,
  ProviderUnavailableError
} from '@/types/quovarine';
import { CLAUDE_CONFIG, RETRY_CONFIG, TIMEOUT_CONFIG } from '@/config/providers';

export class QuovarineBridge {
  private client: Anthropic;
  private model: string;
  private maxTokens: number;
  private thinkingEffort: 'low' | 'medium' | 'high';

  constructor(
    apiKey?: string,
    model?: string,
    thinkingEffort: 'low' | 'medium' | 'high' = 'high'
  ) {
    if (!apiKey && !process.env.ANTHROPIC_API_KEY) {
      throw new QuovarineError(
        'Anthropic API key is required',
        'MISSING_API_KEY',
        AIProvider.ANTHROPIC
      );
    }

    this.client = new Anthropic({
      apiKey: apiKey || process.env.ANTHROPIC_API_KEY
    });

    this.model = model || process.env.CLAUDE_MODEL || CLAUDE_CONFIG.models.opus;
    this.maxTokens = CLAUDE_CONFIG.maxOutputTokens;
    this.thinkingEffort = thinkingEffort;
  }

  /**
   * Send a message to Claude with optional Extended Thinking
   */
  async sendMessage(
    request: AdapterRequest,
    retryCount = 0
  ): Promise<AdapterResponse> {
    try {
      const claudeRequest: Anthropic.MessageCreateParams = {
        model: this.model,
        max_tokens: request.maxTokens || this.maxTokens,
        messages: [
          {
            role: 'user',
            content: request.prompt
          }
        ],
        temperature: request.temperature ?? CLAUDE_CONFIG.defaultTemperature
      };

      // Add Extended Thinking if requested
      // Note: Extended Thinking is a feature that may require specific API access
      if (request.thinking) {
        try {
          // Cast to Record to add experimental thinking parameter
          (claudeRequest as unknown as Record<string, unknown>).thinking = {
            type: 'enabled',
            budget_tokens: CLAUDE_CONFIG.thinkingEffort[this.thinkingEffort]
          };
        } catch (error) {
          console.warn('Extended Thinking feature may not be available:', error);
          // Continue without thinking - non-critical feature
        }
      }

      const response = await this.client.messages.create(claudeRequest);

      return this.parseResponse(response);
    } catch (error) {
      return this.handleError(error, request, retryCount);
    }
  }

  /**
   * Stream a message response from Claude
   */
  async *streamMessage(
    request: AdapterRequest
  ): AsyncGenerator<StreamChunk, void, unknown> {
    try {
      const claudeRequest: Anthropic.MessageCreateParams = {
        model: this.model,
        max_tokens: request.maxTokens || this.maxTokens,
        messages: [
          {
            role: 'user',
            content: request.prompt
          }
        ],
        temperature: request.temperature ?? CLAUDE_CONFIG.defaultTemperature,
        stream: true
      };

      // Add Extended Thinking if requested
      // Note: Extended Thinking is a feature that may require specific API access
      if (request.thinking) {
        try {
          // Cast to Record to add experimental thinking parameter
          (claudeRequest as unknown as Record<string, unknown>).thinking = {
            type: 'enabled',
            budget_tokens: CLAUDE_CONFIG.thinkingEffort[this.thinkingEffort]
          };
        } catch (error) {
          console.warn('Extended Thinking feature may not be available:', error);
          // Continue without thinking - non-critical feature
        }
      }

      const stream = await this.client.messages.create(claudeRequest);

      for await (const chunk of stream) {
        yield this.parseStreamChunk(chunk);
      }
    } catch (error) {
      throw this.createError(error);
    }
  }

  /**
   * Health check for Claude API
   */
  async healthCheck(): Promise<{ healthy: boolean; latency: number; error?: string }> {
    const startTime = Date.now();
    
    try {
      await Promise.race([
        this.client.messages.create({
          model: this.model,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'ping' }]
        }),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Health check timeout')), TIMEOUT_CONFIG.healthCheck)
        )
      ]);

      const latency = Date.now() - startTime;
      return { healthy: true, latency };
    } catch (error) {
      const latency = Date.now() - startTime;
      return {
        healthy: false,
        latency,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Parse Anthropic response into standard format
   */
  private parseResponse(response: Anthropic.Message): AdapterResponse {
    let textContent = '';
    let thinkingContent = '';

    for (const block of response.content) {
      if (block.type === 'text') {
        textContent += block.text;
      }
      // Note: Thinking content extraction may require specific API features
      // Check for thinking property on the block if available
      const blockWithThinking = block as unknown as Record<string, unknown>;
      if (blockWithThinking.thinking) {
        thinkingContent += String(blockWithThinking.thinking);
      }
    }

    return {
      content: textContent,
      thinking: thinkingContent || undefined,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens
      },
      provider: AIProvider.ANTHROPIC,
      model: response.model,
      metadata: {
        id: response.id,
        stopReason: response.stop_reason
      }
    };
  }

  /**
   * Parse streaming chunk
   */
  private parseStreamChunk(chunk: unknown): StreamChunk {
    const c = chunk as Record<string, unknown>;
    return {
      type: c.type,
      index: c.index,
      delta: c.delta,
      content_block: c.content_block
    } as StreamChunk;
  }

  /**
   * Handle errors with retry logic
   */
  private async handleError(
    error: unknown,
    request: AdapterRequest,
    retryCount: number
  ): Promise<AdapterResponse> {
    const quovarineError = this.createError(error);

    // Check if we should retry
    if (retryCount < RETRY_CONFIG.maxAttempts && this.isRetryable(error)) {
      const delay = Math.min(
        RETRY_CONFIG.initialDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, retryCount),
        RETRY_CONFIG.maxDelay
      );

      await this.sleep(delay);
      return this.sendMessage(request, retryCount + 1);
    }

    throw quovarineError;
  }

  /**
   * Create appropriate QuovarineError from raw error
   */
  private createError(error: unknown): QuovarineError {
    if (error instanceof Anthropic.APIError) {
      if (error.status === 429) {
        return new RateLimitError(AIProvider.ANTHROPIC);
      }

      return new QuovarineError(
        error.message,
        `ANTHROPIC_API_ERROR_${error.status}`,
        AIProvider.ANTHROPIC,
        error
      );
    }

    const err = error as { code?: string; message?: string };
    if (err.code && RETRY_CONFIG.retryableErrors.includes(err.code)) {
      return new ProviderUnavailableError(AIProvider.ANTHROPIC, error as Error);
    }

    return new QuovarineError(
      err.message || 'Unknown error',
      'UNKNOWN_ERROR',
      AIProvider.ANTHROPIC,
      error as Error
    );
  }

  /**
   * Check if error is retryable
   */
  private isRetryable(error: unknown): boolean {
    if (error instanceof Anthropic.APIError) {
      return RETRY_CONFIG.retryableStatusCodes.includes(error.status || 0);
    }

    const err = error as { code?: string };
    if (err.code) {
      return RETRY_CONFIG.retryableErrors.includes(err.code);
    }

    return false;
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return {
      model: this.model,
      maxTokens: this.maxTokens,
      thinkingEffort: this.thinkingEffort,
      thinkingBudget: CLAUDE_CONFIG.thinkingEffort[this.thinkingEffort]
    };
  }

  /**
   * Update model dynamically
   */
  setModel(model: string) {
    this.model = model;
  }

  /**
   * Update thinking effort
   */
  setThinkingEffort(effort: 'low' | 'medium' | 'high') {
    this.thinkingEffort = effort;
  }
}

export default QuovarineBridge;
