# Quovarine

**Claude 4.5 Opus Integration Layer with Hexagonal Architecture**

Quovarine is a production-ready Claude 4.5 Opus integration layer featuring Extended Thinking capabilities, automatic provider failover, and multi-cloud deployment support. Built on Hexagonal Architecture principles for maximum flexibility and maintainability.

---

## 🌟 Features

- **Claude 4.5 Opus Integration**: Full support for Extended Thinking with up to 10K thinking tokens
- **64K Token Output**: Maximum output capacity for complex responses
- **Streaming Responses**: Real-time streaming with Server-Sent Events
- **Hexagonal Architecture**: Clean separation of concerns with Ports & Adapters pattern
- **Self-Healing System**: Automatic failover between AI and cloud providers
- **Multi-Cloud Support**: Vercel, AWS Lambda, and Azure Functions
- **Provider Agnostic**: Easy switching between Anthropic, OpenAI, and Azure OpenAI
- **Autonomous Task Decomposition**: Uses Claude to break large problems into executable tasks
- **Zero-Human Operation**: Designed for autonomous operation via GitHub Actions

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Anthropic API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sarinsk629-blip/Quovarine-.git
cd Quovarine-
```

2. Run the initialization script:
```bash
npm run init
```

This will:
- Check for required environment variables
- Install dependencies
- Validate API connectivity
- Run initial health checks

3. Edit `.env` file with your API keys:
```env
ANTHROPIC_API_KEY=your_actual_api_key_here
CLAUDE_MODEL=claude-opus-4-5-20251101
THINKING_EFFORT=high
```

4. Start the development server:
```bash
npm run dev
```

5. Access the API at `http://localhost:3000/api/opus`

---

## 📚 API Usage

### Send a Message

```bash
curl -X POST http://localhost:3000/api/opus \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain quantum computing in detail",
    "thinking": true,
    "maxTokens": 4000,
    "temperature": 0.7
  }'
```

### Stream a Response

```bash
curl -X POST http://localhost:3000/api/opus \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write a comprehensive essay on AI ethics",
    "stream": true,
    "thinking": true
  }'
```

### Health Check

```bash
curl http://localhost:3000/api/opus
```

---

## 🏗️ Architecture

Quovarine follows Hexagonal Architecture (Ports & Adapters) principles:

```
Application Layer (Next.js API)
         ↓
Core Business Logic (TaskSlicer, SelfHealer)
         ↓
Adapter Layer (OmniAdapter, CloudOrchestrator)
         ↓
External Services (Claude, AWS, Azure, Vercel)
```

### Key Components

- **QuovarineBridge**: Direct Claude 4.5 API integration
- **OmniAdapter**: Provider-agnostic AI adapter with automatic failover
- **CloudOrchestrator**: Multi-cloud deployment management
- **TaskSlicer**: Autonomous task decomposition engine
- **SelfHealer**: Automatic failure detection and recovery

See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed documentation.

---

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | Yes | - | Anthropic API key |
| `CLAUDE_MODEL` | No | `claude-opus-4-5-20251101` | Claude model to use |
| `THINKING_EFFORT` | No | `high` | Thinking budget (low/medium/high) |
| `AWS_ACCESS_KEY_ID` | No | - | AWS credentials |
| `AWS_SECRET_ACCESS_KEY` | No | - | AWS credentials |
| `AZURE_FUNCTIONS_KEY` | No | - | Azure Functions key |
| `OPENAI_API_KEY` | No | - | OpenAI API key (fallback) |

### Provider Configuration

Edit `src/config/providers.ts` to customize:
- Provider priorities
- Rate limits
- Timeouts
- Retry logic
- Health check intervals

---

## 📊 Self-Healing System

Quovarine includes an advanced self-healing system that:

1. **Monitors** all adapters continuously
2. **Detects** failures and tracks consecutive failures
3. **Switches** to backup providers automatically
4. **Logs** all recovery actions with detailed metrics
5. **Alerts** via console, GitHub Actions, or custom integrations

### Example Usage

```typescript
import { SelfHealer } from '@/core/SelfHealer';

const healer = new SelfHealer();

// Start monitoring
healer.startMonitoring();

// Get recovery statistics
const stats = healer.getRecoveryStats();
console.log(`Success rate: ${stats.successRate}%`);

// Check current health
const health = await healer.getCurrentHealth();
```

---

## 🎯 Task Decomposition

Break large problems into executable tasks using Claude:

```typescript
import { TaskSlicer } from '@/core/TaskSlicer';

const slicer = new TaskSlicer();

// Decompose a complex problem
const queue = await slicer.decompose(`
  Build a complete authentication system with:
  - User registration and login
  - JWT tokens
  - Password reset
  - Email verification
`);

// Execute tasks
while (true) {
  const task = slicer.getNextTask();
  if (!task) break;
  
  slicer.startTask(task.id);
  // ... execute task ...
  slicer.completeTask(task.id);
}

// View progress
console.log(slicer.getProgress());
```

---

## 🧪 Testing

```bash
# Type check
npm run type-check

# Build
npm run build

# Run initialization checks
npm run init

# Start development server
npm run dev
```

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

### AWS Lambda

1. Configure AWS credentials in `.env`
2. Use AWS SDK deployment tools

### Azure Functions

1. Configure Azure credentials in `.env`
2. Deploy via Azure CLI

---

## 📖 Documentation

- [Architecture Documentation](docs/ARCHITECTURE.md) - Detailed architecture overview
- [API Reference](docs/ARCHITECTURE.md#api-usage) - Complete API documentation
- [Configuration Guide](docs/ARCHITECTURE.md#configuration) - Configuration options

---

## 🛠️ Development

### Project Structure

```
Quovarine-/
├── app/
│   ├── api/opus/          # Next.js API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── src/
│   ├── adapters/
│   │   ├── claude/        # Claude integration
│   │   │   ├── QuovarineBridge.ts
│   │   │   └── OmniAdapter.ts
│   │   └── cloud/         # Cloud providers
│   │       └── CloudOrchestrator.ts
│   ├── core/
│   │   ├── TaskSlicer.ts  # Task decomposition
│   │   └── SelfHealer.ts  # Self-healing system
│   ├── types/
│   │   └── quovarine.ts   # TypeScript types
│   └── config/
│       └── providers.ts   # Provider configuration
├── scripts/
│   └── quovarine_init.sh  # Initialization script
├── docs/
│   └── ARCHITECTURE.md    # Architecture docs
└── package.json
```

### Adding New Providers

See [ARCHITECTURE.md](docs/ARCHITECTURE.md#adding-new-providers) for instructions on adding new AI or cloud providers.

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📝 License

MIT

---

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Anthropic SDK](https://github.com/anthropics/anthropic-sdk-typescript) - Claude API
- [Zod](https://github.com/colinhacks/zod) - TypeScript-first schema validation

---

## 📞 Support

For issues, questions, or contributions:
- Open an issue on GitHub
- See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed documentation

---

**Initializing Genesis Shell...**  
Current Date and Time (UTC): 2025-12-30 10:19:43  
Current User's Login: sarinsk629-blip

