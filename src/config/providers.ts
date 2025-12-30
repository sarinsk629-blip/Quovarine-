/**
 * Quovarine Provider Configuration
 * Centralized configuration for all AI and Cloud providers
 */

import { ProvidersConfiguration, AIProvider, CloudType } from '@/types/quovarine';

export const PROVIDERS_CONFIG: ProvidersConfiguration = {
  ai: {
    [AIProvider.ANTHROPIC]: {
      enabled: true,
      priority: 1,
      apiKey: process.env.ANTHROPIC_API_KEY,
      endpoint: 'https://api.anthropic.com/v1/messages',
      model: process.env.CLAUDE_MODEL || 'claude-opus-4-5-20251101',
      maxTokens: 64000,
      temperature: 0.7,
      rateLimits: {
        requestsPerMinute: 50,
        tokensPerMinute: 100000
      },
      timeout: 300000 // 5 minutes for extended thinking
    },
    [AIProvider.OPENAI]: {
      enabled: !!process.env.OPENAI_API_KEY,
      priority: 2,
      apiKey: process.env.OPENAI_API_KEY,
      endpoint: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-4-turbo-preview',
      maxTokens: 4096,
      temperature: 0.7,
      rateLimits: {
        requestsPerMinute: 60,
        tokensPerMinute: 150000
      },
      timeout: 120000
    },
    [AIProvider.AZURE_OPENAI]: {
      enabled: false,
      priority: 3,
      apiKey: process.env.AZURE_OPENAI_KEY,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      model: 'gpt-4',
      maxTokens: 4096,
      temperature: 0.7,
      rateLimits: {
        requestsPerMinute: 60,
        tokensPerMinute: 120000
      },
      timeout: 120000
    }
  },
  cloud: {
    [CloudType.VERCEL]: {
      enabled: true,
      priority: 1,
      apiKey: process.env.VERCEL_TOKEN,
      endpoint: 'https://api.vercel.com',
      timeout: 60000
    },
    [CloudType.AWS]: {
      enabled: !!process.env.AWS_ACCESS_KEY_ID,
      priority: 2,
      apiKey: process.env.AWS_ACCESS_KEY_ID,
      endpoint: process.env.AWS_REGION || 'us-east-1',
      timeout: 60000
    },
    [CloudType.AZURE]: {
      enabled: !!process.env.AZURE_FUNCTIONS_KEY,
      priority: 3,
      apiKey: process.env.AZURE_FUNCTIONS_KEY,
      endpoint: process.env.AZURE_REGION || 'eastus',
      timeout: 60000
    }
  },
  selfHealing: {
    enableAutoFailover: true,
    maxRetries: 3,
    retryDelay: 2000, // 2 seconds
    healthCheckInterval: 60000, // 1 minute
    alertThreshold: 3 // Alert after 3 consecutive failures
  }
};

// Model-specific configurations
export const CLAUDE_CONFIG = {
  models: {
    opus: 'claude-opus-4-5-20251101',
    sonnet: 'claude-sonnet-4-20250514',
    haiku: 'claude-3-5-haiku-20241022'
  },
  thinkingEffort: {
    low: 1000,
    medium: 5000,
    high: 10000
  },
  maxOutputTokens: 64000,
  defaultTemperature: 0.7
};

// Fallback priority order for AI providers
export const AI_PROVIDER_FALLBACK_ORDER = [
  AIProvider.ANTHROPIC,
  AIProvider.OPENAI,
  AIProvider.AZURE_OPENAI
];

// Fallback priority order for Cloud providers
export const CLOUD_PROVIDER_FALLBACK_ORDER = [
  CloudType.VERCEL,
  CloudType.AWS,
  CloudType.AZURE
];

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  windowMs: 60000, // 1 minute
  maxRequests: 50,
  maxTokens: 100000,
  enableBurst: true,
  burstMultiplier: 1.5
};

// Timeout configurations
export const TIMEOUT_CONFIG = {
  healthCheck: 5000, // 5 seconds
  standardRequest: 30000, // 30 seconds
  extendedThinking: 300000, // 5 minutes
  streamingChunk: 10000 // 10 seconds between chunks
};

// Retry configuration
export const RETRY_CONFIG = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  retryableErrors: [
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    'ECONNREFUSED'
  ]
};

// Logging configuration
export const LOGGING_CONFIG = {
  level: process.env.LOG_LEVEL || 'info',
  enableConsole: true,
  enableFile: false,
  logRequests: true,
  logResponses: false, // Set to true for debugging
  logThinking: true,
  redactSecrets: true
};

export default PROVIDERS_CONFIG;
