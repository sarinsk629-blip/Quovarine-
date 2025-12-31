/**
 * Provider Configuration
 * Centralized configuration for AI providers and cloud services
 */

export const PROVIDERS = {
  anthropic: {
    name: 'Anthropic',
    model: process.env.CLAUDE_MODEL || 'claude-opus-4-5-20251101',
    apiKey: process.env.ANTHROPIC_API_KEY,
    baseURL: 'https://api.anthropic.com/v1',
    thinking_effort: (process.env.THINKING_EFFORT || 'high') as 'low' | 'medium' | 'high',
  },
  openai: {
    name: 'OpenAI',
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: 'https://api.openai.com/v1',
  },
  vercel: {
    name: 'Vercel',
    token: process.env.VERCEL_TOKEN,
    orgId: process.env.VERCEL_ORG_ID,
    projectId: process.env.VERCEL_PROJECT_ID,
  },
} as const;

export const APP_CONFIG = {
  name: 'Quovarine',
  version: '0.1.0',
  environment: process.env.NODE_ENV || 'development',
  deploymentUrl: process.env.DEPLOYMENT_URL || 'http://localhost:3000',
} as const;

export function validateProviderConfig(provider: keyof typeof PROVIDERS): boolean {
  if (provider === 'anthropic') {
    const config = PROVIDERS.anthropic;
    return !!(config.apiKey && config.model);
  }
  
  if (provider === 'openai') {
    const config = PROVIDERS.openai;
    return !!config.apiKey;
  }
  
  if (provider === 'vercel') {
    const config = PROVIDERS.vercel;
    return !!(config.token && config.orgId && config.projectId);
  }
  
  return false;
}
