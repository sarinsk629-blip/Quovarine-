/**
 * Quovarine Type Definitions
 * Core types for the Quovarine autonomous workflow system
 */

export interface QuovarineConfig {
  model: string;
  thinking_effort?: 'low' | 'medium' | 'high';
  max_tokens?: number;
  temperature?: number;
}

export interface TaskSlice {
  id: string;
  type: 'analysis' | 'execution' | 'validation' | 'recovery';
  priority: number;
  payload: unknown;
  dependencies?: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  retryCount?: number;
  error?: string;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  service: string;
  version: string;
  uptime: number;
  environment: string;
  checks?: HealthCheck[];
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  timestamp: string;
}

export interface DeploymentStatus {
  id: string;
  url: string;
  status: 'pending' | 'building' | 'ready' | 'error';
  timestamp: string;
  checks?: HealthCheck[];
}

export interface CloudProvider {
  name: string;
  type: 'vercel' | 'aws' | 'gcp' | 'azure';
  authenticate: () => Promise<boolean>;
  deploy: (config: DeploymentConfig) => Promise<DeploymentStatus>;
  healthCheck: () => Promise<HealthStatus>;
}

export interface DeploymentConfig {
  projectId: string;
  environment: 'production' | 'preview' | 'development';
  envVars?: Record<string, string>;
}

export interface RecoveryAction {
  type: 'rollback' | 'retry' | 'alert' | 'scale';
  target: string;
  reason: string;
  timestamp: string;
  automated: boolean;
}

export interface WorkflowContext {
  taskId: string;
  startTime: string;
  slices: TaskSlice[];
  provider: CloudProvider;
  config: QuovarineConfig;
}

// Claude API specific types
export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeResponse {
  id: string;
  type: string;
  role: string;
  content: Array<{
    type: string;
    text: string;
  }>;
  model: string;
  stop_reason: string;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface OpusRequest {
  prompt: string;
  context?: Record<string, unknown>;
  thinking_effort?: 'low' | 'medium' | 'high';
  max_tokens?: number;
}

export interface OpusResponse {
  success: boolean;
  data?: {
    text: string;
    usage: {
      input_tokens: number;
      output_tokens: number;
    };
  };
  error?: string;
}
