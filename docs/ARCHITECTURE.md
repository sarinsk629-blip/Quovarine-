# Quovarine Architecture

## Overview

Quovarine is a Claude 4.5 Opus integration layer built on **Hexagonal Architecture** (Ports & Adapters) principles with autonomous **self-healing** capabilities. It provides a robust, provider-agnostic interface for AI interactions and multi-cloud deployments.

## Core Principles

### 1. Hexagonal Architecture (Ports & Adapters)

The system is designed with a clear separation between:

- **Core Business Logic**: Independent of external services
- **Ports**: Abstract interfaces defining how the core interacts with the outside world
- **Adapters**: Concrete implementations that connect to external services

This architecture makes the system:
- **Testable**: Core logic can be tested without external dependencies
- **Maintainable**: Changes to external services don't affect core logic
- **Extensible**: New providers can be added without modifying core code

### 2. Self-Healing

The system automatically:
- Monitors all adapters for failures
- Switches to backup providers on failure
- Logs all recovery actions
- Sends alerts for critical issues

### 3. Provider Agnostic

Easy switching between:
- AI Providers: Anthropic Claude, OpenAI, Azure OpenAI
- Cloud Providers: Vercel, AWS Lambda, Azure Functions

### 4. Extended Thinking

Leverages Claude 4.5's Extended Thinking capabilities:
- Configurable thinking effort (low/medium/high)
- Up to 10,000 thinking tokens for complex reasoning
- 64K token output support

### 5. Zero-Human Operation

Designed for autonomous operation via:
- GitHub Actions integration
- Automatic failover
- Self-diagnosis and recovery

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  (Next.js API Routes, Task Execution, User Interface)       │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                      Core Layer                              │
│                                                              │
│  ┌──────────────┐         ┌──────────────┐                │
│  │ TaskSlicer   │         │ SelfHealer   │                │
│  │              │         │              │                │
│  │ - Decompose  │         │ - Monitor    │                │
│  │ - Track      │         │ - Failover   │                │
│  │ - Execute    │         │ - Alert      │                │
│  └──────────────┘         └──────────────┘                │
│                                                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────┴──────────────────────────────────────┐
│                   Adapter Layer (Ports)                      │
│                                                              │
│  ┌────────────────────────────┐  ┌──────────────────────┐  │
│  │      OmniAdapter           │  │  CloudOrchestrator   │  │
│  │                            │  │                      │  │
│  │  - Provider abstraction    │  │  - Multi-cloud mgmt  │  │
│  │  - Automatic failover      │  │  - Health checks     │  │
│  │  - Health monitoring       │  │  - Auto failover     │  │
│  └────────────┬───────────────┘  └──────┬───────────────┘  │
│               │                          │                   │
└───────────────┼──────────────────────────┼──────────────────┘
                │                          │
        ┌───────┴────────┐         ┌──────┴────────┐
        │                │         │               │
┌───────▼──────┐  ┌──────▼──────┐ ┌▼─────────┐ ┌──▼──────┐
│ Claude/      │  │  OpenAI     │ │ Vercel   │ │  AWS    │
│ Anthropic    │  │             │ │          │ │         │
└──────────────┘  └─────────────┘ └──────────┘ └─────────┘
```

---

## Key Components

### 1. QuovarineBridge (`src/adapters/claude/QuovarineBridge.ts`)

**Purpose**: Direct integration with Anthropic's Claude 4.5 API

**Features**:
- Extended Thinking support with configurable budget
- Streaming response handling
- Automatic retry with exponential backoff
- Error handling and categorization
- Health check functionality

**Usage**:
```typescript
import { QuovarineBridge } from '@/adapters/claude/QuovarineBridge';

const bridge = new QuovarineBridge(
  process.env.ANTHROPIC_API_KEY,
  'claude-opus-4-5-20251101',
  'high' // thinking effort
);

const response = await bridge.sendMessage({
  prompt: "Analyze this complex problem...",
  thinking: true,
  maxTokens: 64000
});
```

### 2. OmniAdapter (`src/adapters/claude/OmniAdapter.ts`)

**Purpose**: Provider-agnostic AI adapter implementing the Port pattern

**Features**:
- Unified interface for multiple AI providers
- Automatic failover between providers
- Health monitoring
- Provider priority management

**Usage**:
```typescript
import { OmniAdapter } from '@/adapters/claude/OmniAdapter';
import { AIProvider } from '@/types/quovarine';

const adapter = new OmniAdapter(AIProvider.ANTHROPIC);

// Send message - will automatically failover if primary fails
const response = await adapter.sendMessage({
  prompt: "Your prompt here",
  thinking: true
});

// Check all provider health
const healthMap = await adapter.checkAllProviders();
```

### 3. CloudOrchestrator (`src/adapters/cloud/CloudOrchestrator.ts`)

**Purpose**: Multi-cloud deployment and infrastructure management

**Features**:
- Support for Vercel, AWS, Azure
- Automatic provider detection
- Health checks and failover
- Deployment management

**Usage**:
```typescript
import { CloudOrchestrator } from '@/adapters/cloud/CloudOrchestrator';
import { CloudType } from '@/types/quovarine';

const orchestrator = new CloudOrchestrator(CloudType.VERCEL);

// Deploy with automatic failover
const result = await orchestrator.deploy({
  environment: 'production',
  region: 'us-east-1'
});

// Start continuous health monitoring
orchestrator.startHealthChecks();
```

### 4. TaskSlicer (`src/core/TaskSlicer.ts`)

**Purpose**: Autonomous task decomposition using Claude 4.5

**Features**:
- Breaks large problems into executable tasks
- Tracks dependencies and execution order
- Progress monitoring
- Task state management

**Usage**:
```typescript
import { TaskSlicer } from '@/core/TaskSlicer';

const slicer = new TaskSlicer();

// Decompose a large problem
const queue = await slicer.decompose(`
  Build a complete authentication system with:
  - User registration and login
  - JWT tokens
  - Password reset
  - Email verification
`);

// Execute tasks in order
while (true) {
  const task = slicer.getNextTask();
  if (!task) break;
  
  slicer.startTask(task.id);
  // ... execute task ...
  slicer.completeTask(task.id);
}
```

### 5. SelfHealer (`src/core/SelfHealer.ts`)

**Purpose**: Automatic failure detection and recovery

**Features**:
- Continuous health monitoring
- Automatic provider failover
- Recovery action logging
- Alert generation

**Usage**:
```typescript
import { SelfHealer } from '@/core/SelfHealer';

const healer = new SelfHealer();

// Start monitoring (runs continuously in background)
healer.startMonitoring();

// Get recovery statistics
const stats = healer.getRecoveryStats();
console.log(`Success rate: ${stats.successRate}%`);

// Check current health
const health = await healer.getCurrentHealth();
```

---

## Adding New Providers

### Adding a New AI Provider

1. **Update Types** (`src/types/quovarine.d.ts`):
```typescript
export enum AIProvider {
  ANTHROPIC = 'anthropic',
  OPENAI = 'openai',
  YOUR_PROVIDER = 'your_provider' // Add here
}
```

2. **Update Configuration** (`src/config/providers.ts`):
```typescript
[AIProvider.YOUR_PROVIDER]: {
  enabled: true,
  priority: 4,
  apiKey: process.env.YOUR_PROVIDER_KEY,
  endpoint: 'https://api.yourprovider.com',
  // ... other config
}
```

3. **Implement Adapter** (in `OmniAdapter.ts`):
```typescript
// Add initialization in initializeAdapters()
const yourProviderConfig = PROVIDERS_CONFIG.ai[AIProvider.YOUR_PROVIDER];
if (yourProviderConfig?.enabled) {
  this.fallbackAdapters.set(
    AIProvider.YOUR_PROVIDER,
    new YourProviderAdapter(yourProviderConfig)
  );
}
```

### Adding a New Cloud Provider

1. **Update Types** (`src/types/quovarine.d.ts`):
```typescript
export enum CloudType {
  VERCEL = 'vercel',
  AWS = 'aws',
  YOUR_CLOUD = 'your_cloud' // Add here
}
```

2. **Implement Provider** (in `CloudOrchestrator.ts`):
```typescript
class YourCloudProvider implements CloudProvider {
  name = 'YourCloud';
  type = CloudType.YOUR_CLOUD;
  
  async isAvailable(): Promise<boolean> { /* ... */ }
  async deploy(config: DeploymentConfig): Promise<DeploymentResult> { /* ... */ }
  async healthCheck(): Promise<HealthStatus> { /* ... */ }
  async getMetrics(): Promise<CloudMetrics> { /* ... */ }
}
```

3. **Register in CloudOrchestrator**:
```typescript
if (PROVIDERS_CONFIG.cloud[CloudType.YOUR_CLOUD]?.enabled) {
  this.providers.set(CloudType.YOUR_CLOUD, new YourCloudProvider());
}
```

---

## Configuration

### Environment Variables

See `.env.example` for all available configuration options.

**Required**:
- `ANTHROPIC_API_KEY`: Anthropic API key for Claude access

**Optional**:
- `CLAUDE_MODEL`: Claude model to use (default: claude-opus-4-5-20251101)
- `THINKING_EFFORT`: Thinking budget (low/medium/high)
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`: AWS credentials
- `AZURE_FUNCTIONS_KEY`: Azure Functions key
- `OPENAI_API_KEY`: OpenAI API key for fallback

### Provider Configuration

Edit `src/config/providers.ts` to:
- Enable/disable providers
- Set priority order
- Configure rate limits
- Set timeouts
- Configure retry logic

---

## Self-Healing System

### How It Works

1. **Continuous Monitoring**: Health checks run at configurable intervals (default: 1 minute)

2. **Failure Detection**: Tracks consecutive failures per provider

3. **Automatic Failover**: Switches to backup provider after threshold (default: 3 failures)

4. **Recovery Logging**: Records all recovery actions with timestamps and duration

5. **Alerting**: Sends alerts via console, GitHub Actions, or custom integrations

### Recovery Action Flow

```
Provider Failure Detected
         ↓
Increment Failure Count
         ↓
Threshold Reached? ──No──→ Continue Monitoring
         ↓ Yes
Find Next Available Provider
         ↓
Switch Active Provider
         ↓
Verify New Provider Health
         ↓
Log Recovery Action
         ↓
Send Alert (if configured)
```

---

## API Usage

### Send a Message

```bash
curl -X POST http://localhost:3000/api/opus \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "prompt": "Explain quantum computing",
    "thinking": true,
    "maxTokens": 4000
  }'
```

### Stream a Response

```bash
curl -X POST http://localhost:3000/api/opus \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "prompt": "Write a long essay",
    "stream": true
  }'
```

### Health Check

```bash
curl http://localhost:3000/api/opus
```

---

## Testing

```bash
# Type check
npm run type-check

# Run initialization script
npm run init

# Start development server
npm run dev

# Build for production
npm run build
```

---

## Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

### AWS Lambda

Configure AWS credentials and use the AWS SDK to deploy.

### Azure Functions

Configure Azure credentials and deploy via Azure CLI.

---

## Monitoring and Debugging

### View Recovery History

```typescript
const healer = new SelfHealer();
const history = healer.getRecoveryHistory();
console.log(history);
```

### Export Logs

```typescript
const historyJson = healer.exportHistory();
fs.writeFileSync('recovery-log.json', historyJson);
```

### GitHub Actions Integration

The system automatically logs warnings and errors in GitHub Actions format:

```
::warning::AI Failover: Switched from anthropic to openai
```

---

## Best Practices

1. **Always enable multiple providers** for redundancy
2. **Monitor recovery statistics** to identify patterns
3. **Set appropriate rate limits** based on your API quotas
4. **Use Extended Thinking** for complex reasoning tasks
5. **Configure alerts** for production environments
6. **Test failover** before deploying to production
7. **Keep API keys secure** and rotate regularly

---

## Troubleshooting

### Issue: All providers failing

**Solution**: Check API keys and network connectivity. Review recovery logs for specific error messages.

### Issue: High failover rate

**Solution**: Check provider rate limits. Consider increasing health check interval or adjusting retry configuration.

### Issue: TypeScript compilation errors

**Solution**: Run `npm install` to ensure all dependencies are installed. Check `tsconfig.json` paths configuration.

### Issue: API returns 401 Unauthorized

**Solution**: Verify `ANTHROPIC_API_KEY` is set correctly in `.env` file.

---

## Future Enhancements

- [ ] Add more AI providers (Google Gemini, Cohere, etc.)
- [ ] Implement distributed tracing
- [ ] Add Prometheus metrics export
- [ ] Build web UI for monitoring
- [ ] Add cost tracking and optimization
- [ ] Implement request queuing for rate limit management
- [ ] Add webhook support for alerts
- [ ] Build CLI tool for management

---

## License

MIT

---

## Support

For issues and questions, please open an issue on GitHub.
