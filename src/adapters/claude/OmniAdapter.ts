/**
 * OmniAdapter - Hexagonal Architecture Adapter for AI Providers
 * Abstracts different AI providers behind a unified interface
 */

import {
  AIAdapter,
  AIProvider,
  AdapterRequest,
  AdapterResponse,
  StreamChunk,
  HealthStatus,
  QuovarineError,
  ProviderUnavailableError
} from '@/types/quovarine';
import { QuovarineBridge } from './QuovarineBridge';
import { PROVIDERS_CONFIG, AI_PROVIDER_FALLBACK_ORDER } from '@/config/providers';

export class OmniAdapter implements AIAdapter {
  name: string;
  provider: AIProvider;
  private primaryAdapter: QuovarineBridge | null = null;
  private fallbackAdapters: Map<AIProvider, any> = new Map();
  private currentProvider: AIProvider;

  constructor(primaryProvider: AIProvider = AIProvider.ANTHROPIC) {
    this.name = 'OmniAdapter';
    this.provider = primaryProvider;
    this.currentProvider = primaryProvider;
    this.initializeAdapters();
  }

  /**
   * Initialize all available adapters
   */
  private initializeAdapters() {
    // Initialize Anthropic/Claude adapter
    const anthropicConfig = PROVIDERS_CONFIG.ai[AIProvider.ANTHROPIC];
    if (anthropicConfig?.enabled && anthropicConfig.apiKey) {
      try {
        this.primaryAdapter = new QuovarineBridge(
          anthropicConfig.apiKey,
          anthropicConfig.model,
          (process.env.THINKING_EFFORT as 'low' | 'medium' | 'high') || 'high'
        );

        if (this.provider === AIProvider.ANTHROPIC) {
          this.fallbackAdapters.set(AIProvider.ANTHROPIC, this.primaryAdapter);
        }
      } catch (error) {
        console.warn('Failed to initialize Anthropic adapter:', error);
      }
    }

    // Initialize OpenAI adapter (placeholder - can be extended)
    const openaiConfig = PROVIDERS_CONFIG.ai[AIProvider.OPENAI];
    if (openaiConfig?.enabled && openaiConfig.apiKey) {
      // OpenAI adapter implementation would go here
      console.log('OpenAI adapter available as fallback');
    }

    // Initialize Azure OpenAI adapter (placeholder - can be extended)
    const azureConfig = PROVIDERS_CONFIG.ai[AIProvider.AZURE_OPENAI];
    if (azureConfig?.enabled && azureConfig.apiKey) {
      // Azure OpenAI adapter implementation would go here
      console.log('Azure OpenAI adapter available as fallback');
    }
  }

  /**
   * Check if the adapter is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const health = await this.healthCheck();
      return health.healthy;
    } catch {
      return false;
    }
  }

  /**
   * Send a message through the current provider with automatic fallback
   */
  async sendMessage(request: AdapterRequest): Promise<AdapterResponse> {
    const providers = this.getProviderFallbackOrder();

    for (const provider of providers) {
      try {
        const adapter = this.getAdapter(provider);
        if (!adapter) continue;

        this.currentProvider = provider;
        const response = await adapter.sendMessage(request);

        // Add provider info to metadata
        response.metadata = {
          ...response.metadata,
          actualProvider: provider,
          requestedProvider: this.provider,
          fallbackUsed: provider !== this.provider
        };

        return response;
      } catch (error) {
        console.error(`Provider ${provider} failed:`, error);
        
        // If this was the last provider, throw the error
        if (provider === providers[providers.length - 1]) {
          throw new QuovarineError(
            'All providers failed',
            'ALL_PROVIDERS_FAILED',
            provider,
            error instanceof Error ? error : undefined
          );
        }

        // Continue to next provider
        continue;
      }
    }

    throw new ProviderUnavailableError('all');
  }

  /**
   * Stream a message through the current provider
   */
  async *streamMessage(
    request: AdapterRequest
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const providers = this.getProviderFallbackOrder();

    for (const provider of providers) {
      try {
        const adapter = this.getAdapter(provider);
        if (!adapter || !adapter.streamMessage) continue;

        this.currentProvider = provider;

        for await (const chunk of adapter.streamMessage(request)) {
          yield chunk;
        }

        return; // Successfully streamed
      } catch (error) {
        console.error(`Streaming failed for provider ${provider}:`, error);

        // If this was the last provider, throw the error
        if (provider === providers[providers.length - 1]) {
          throw new QuovarineError(
            'All streaming providers failed',
            'ALL_STREAMING_FAILED',
            provider,
            error instanceof Error ? error : undefined
          );
        }

        // Continue to next provider
        continue;
      }
    }

    throw new ProviderUnavailableError('all');
  }

  /**
   * Perform health check on current provider
   */
  async healthCheck(): Promise<HealthStatus> {
    const startTime = Date.now();

    try {
      const adapter = this.getAdapter(this.currentProvider);
      
      if (!adapter) {
        return {
          healthy: false,
          provider: this.currentProvider,
          latency: Date.now() - startTime,
          error: 'Adapter not initialized',
          timestamp: new Date()
        };
      }

      const health = await adapter.healthCheck();

      return {
        healthy: health.healthy,
        provider: this.currentProvider,
        latency: health.latency,
        error: health.error,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        healthy: false,
        provider: this.currentProvider,
        latency: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Get the adapter for a specific provider
   */
  private getAdapter(provider: AIProvider): QuovarineBridge | any | null {
    if (provider === AIProvider.ANTHROPIC) {
      return this.primaryAdapter;
    }

    return this.fallbackAdapters.get(provider) || null;
  }

  /**
   * Get provider fallback order based on configuration
   */
  private getProviderFallbackOrder(): AIProvider[] {
    const order: AIProvider[] = [];
    
    // Start with the requested provider
    if (this.provider && PROVIDERS_CONFIG.ai[this.provider]?.enabled) {
      order.push(this.provider);
    }

    // Add other providers in fallback order
    for (const provider of AI_PROVIDER_FALLBACK_ORDER) {
      if (provider !== this.provider && PROVIDERS_CONFIG.ai[provider]?.enabled) {
        order.push(provider);
      }
    }

    return order;
  }

  /**
   * Switch to a different primary provider
   */
  switchProvider(provider: AIProvider) {
    if (!PROVIDERS_CONFIG.ai[provider]?.enabled) {
      throw new QuovarineError(
        `Provider ${provider} is not enabled`,
        'PROVIDER_NOT_ENABLED',
        provider
      );
    }

    this.provider = provider;
    this.currentProvider = provider;
  }

  /**
   * Get current provider information
   */
  getCurrentProvider(): AIProvider {
    return this.currentProvider;
  }

  /**
   * Get list of available providers
   */
  getAvailableProviders(): AIProvider[] {
    return Array.from(this.fallbackAdapters.keys());
  }

  /**
   * Check health of all providers
   */
  async checkAllProviders(): Promise<Map<AIProvider, HealthStatus>> {
    const healthMap = new Map<AIProvider, HealthStatus>();

    for (const [provider, adapter] of this.fallbackAdapters) {
      try {
        const health = await adapter.healthCheck();
        healthMap.set(provider, {
          healthy: health.healthy,
          provider,
          latency: health.latency,
          error: health.error,
          timestamp: new Date()
        });
      } catch (error) {
        healthMap.set(provider, {
          healthy: false,
          provider,
          latency: 0,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        });
      }
    }

    return healthMap;
  }
}

export default OmniAdapter;
