/**
 * Quovarine Type Definitions
 * Core interfaces for Claude 4.5 Opus Integration Layer
 */

// Task Management Types
export interface Task {
  id: string;
  description: string;
  status: TaskStatus;
  priority: number;
  dependencies: string[];
  estimatedComplexity: number;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  BLOCKED = 'blocked'
}

export interface TaskQueue {
  tasks: Task[];
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
}

// Claude API Types
export interface ClaudeRequest {
  model: string;
  messages: ClaudeMessage[];
  max_tokens: number;
  thinking?: {
    type: 'enabled';
    budget_tokens: number;
  };
  temperature?: number;
  stream?: boolean;
}

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string | ContentBlock[];
}

export interface ContentBlock {
  type: 'text' | 'thinking';
  text?: string;
  thinking?: string;
}

export interface ClaudeResponse {
  id: string;
  type: 'message';
  role: 'assistant';
  content: ContentBlock[];
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface StreamChunk {
  type: 'content_block_start' | 'content_block_delta' | 'content_block_stop' | 'message_start' | 'message_delta' | 'message_stop';
  index?: number;
  delta?: {
    type: 'text_delta' | 'thinking_delta';
    text?: string;
    thinking?: string;
  };
  content_block?: ContentBlock;
}

// Adapter Interface (Hexagonal Architecture)
export interface AIAdapter {
  name: string;
  provider: AIProvider;
  isAvailable(): Promise<boolean>;
  sendMessage(request: AdapterRequest): Promise<AdapterResponse>;
  streamMessage(request: AdapterRequest): AsyncGenerator<StreamChunk, void, unknown>;
  healthCheck(): Promise<HealthStatus>;
}

export enum AIProvider {
  ANTHROPIC = 'anthropic',
  OPENAI = 'openai',
  AZURE_OPENAI = 'azure_openai'
}

export interface AdapterRequest {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  thinking?: boolean;
  stream?: boolean;
  metadata?: Record<string, any>;
}

export interface AdapterResponse {
  content: string;
  thinking?: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  provider: AIProvider;
  model: string;
  metadata?: Record<string, any>;
}

// Cloud Provider Types
export interface CloudProvider {
  name: string;
  type: CloudType;
  isAvailable(): Promise<boolean>;
  deploy(config: DeploymentConfig): Promise<DeploymentResult>;
  healthCheck(): Promise<HealthStatus>;
  getMetrics(): Promise<CloudMetrics>;
}

export enum CloudType {
  VERCEL = 'vercel',
  AWS = 'aws',
  AZURE = 'azure'
}

export interface DeploymentConfig {
  environment: 'development' | 'staging' | 'production';
  region?: string;
  replicas?: number;
  resources?: {
    memory?: string;
    cpu?: string;
  };
}

export interface DeploymentResult {
  success: boolean;
  url?: string;
  error?: string;
  deploymentId: string;
  timestamp: Date;
}

export interface CloudMetrics {
  uptime: number;
  requestCount: number;
  errorRate: number;
  averageLatency: number;
  lastChecked: Date;
}

// Health Check Types
export interface HealthStatus {
  healthy: boolean;
  provider: string;
  latency: number;
  error?: string;
  timestamp: Date;
}

// Self-Healing Types
export interface RecoveryAction {
  id: string;
  timestamp: Date;
  failedProvider: string;
  failoverProvider: string;
  reason: string;
  success: boolean;
  duration: number;
}

export interface SelfHealingConfig {
  enableAutoFailover: boolean;
  maxRetries: number;
  retryDelay: number;
  healthCheckInterval: number;
  alertThreshold: number;
}

// Provider Configuration Types
export interface ProviderConfig {
  enabled: boolean;
  priority: number;
  apiKey?: string;
  endpoint?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  rateLimits?: {
    requestsPerMinute: number;
    tokensPerMinute: number;
  };
  timeout?: number;
}

export interface ProvidersConfiguration {
  ai: {
    [key in AIProvider]?: ProviderConfig;
  };
  cloud: {
    [key in CloudType]?: ProviderConfig;
  };
  selfHealing: SelfHealingConfig;
}

// Error Types
export class QuovarineError extends Error {
  constructor(
    message: string,
    public code: string,
    public provider?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'QuovarineError';
  }
}

export class ProviderUnavailableError extends QuovarineError {
  constructor(provider: string, originalError?: Error) {
    super(
      `Provider ${provider} is unavailable`,
      'PROVIDER_UNAVAILABLE',
      provider,
      originalError
    );
    this.name = 'ProviderUnavailableError';
  }
}

export class RateLimitError extends QuovarineError {
  constructor(provider: string, retryAfter?: number) {
    super(
      `Rate limit exceeded for provider ${provider}`,
      'RATE_LIMIT_EXCEEDED',
      provider
    );
    this.name = 'RateLimitError';
  }
}
