<<<<<<< HEAD
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
=======
# 🚀 Quovarine

[![Deploy to Vercel](https://github.com/sarinsk629-blip/Quovarine-/actions/workflows/deploy.yml/badge.svg)](https://github.com/sarinsk629-blip/Quovarine-/actions/workflows/deploy.yml)
[![Self-Healing Monitor](https://github.com/sarinsk629-blip/Quovarine-/actions/workflows/self-heal.yml/badge.svg)](https://github.com/sarinsk629-blip/Quovarine-/actions/workflows/self-heal.yml)

> **An autonomous system designed to automate and streamline administrative workflows**

Quovarine combines intelligent automation with self-healing capabilities to eliminate manual overhead and ensure continuous operation of critical business processes. Built on Next.js 14 with automated CI/CD and error recovery systems.

---

## 📋 Table of Contents

- [Features](#-features)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Self-Healing System](#-self-healing-system)
- [Health Monitoring](#-health-monitoring)
- [Environment Variables](#-environment-variables)
- [Development](#-development)
- [Contributing](#-contributing)

---

## ✨ Features

- **🤖 Autonomous Workflow Automation** - Intelligent task automation for administrative processes
- **⚡ Zero-Downtime Deployments** - Automated CI/CD pipeline with Vercel integration
- **🔄 Self-Healing Architecture** - Automatic error detection and recovery with rollback capabilities
- **📊 Real-time Health Monitoring** - Continuous system health checks and performance monitoring
- **🎨 Modern UI** - Dark, futuristic theme built with Next.js 14 and Tailwind CSS
- **🔐 Production-Ready** - Comprehensive error handling and security best practices
>>>>>>> main

---

## 🏗️ Architecture

<<<<<<< HEAD
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
=======
Quovarine implements a three-tier self-monitoring and recovery system:

### 1. **Application Layer**
   - Next.js 14 with React Server Components
   - TypeScript for type safety
   - Tailwind CSS for styling
   - Built-in API health endpoint

### 2. **Deployment & CI/CD Layer**
   - GitHub Actions for automated deployment
   - Vercel for hosting and edge functions
   - Automated health checks post-deployment
   - Build verification and testing

### 3. **Self-Healing Layer**
   - Monitors deployment workflows
   - Automatic rollback on failure
   - Recovery notifications via GitHub Actions summary
   - Python-based external health monitoring

```
┌─────────────────────────────────────────────────┐
│          Application (Next.js 14)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │   Pages  │  │   APIs   │  │  Health  │     │
│  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────┐
│       CI/CD Pipeline (GitHub Actions)           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  Build   │→ │  Deploy  │→ │  Verify  │     │
│  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────┘
                    ▼
┌─────────────────────────────────────────────────┐
│      Self-Healing System (Auto-Recovery)        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │  Monitor │→ │ Rollback │→ │  Notify  │     │
│  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────┘
>>>>>>> main
```

---

<<<<<<< HEAD
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
=======
## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+ (for health monitoring)
- Git
- A Vercel account (for deployment)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/sarinsk629-blip/Quovarine-.git
   cd Quovarine-
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Python Health Monitor Setup

1. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Run health monitor**
   ```bash
   python scripts/health_monitor.py
   ```

---

## 📁 Project Structure

```
Quovarine-/
├── .github/
│   └── workflows/
│       ├── deploy.yml          # Main CI/CD pipeline
│       └── self-heal.yml       # Self-healing workflow
├── app/
│   ├── api/
│   │   └── health/
│   │       └── route.ts        # Health check endpoint
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Homepage
├── scripts/
│   └── health_monitor.py       # Python health monitor
├── .env.example                # Environment template
├── .gitignore                  # Git ignore rules
├── next.config.js              # Next.js configuration
├── package.json                # Node dependencies
├── postcss.config.js           # PostCSS config
├── requirements.txt            # Python dependencies
├── tailwind.config.js          # Tailwind CSS config
├── tsconfig.json               # TypeScript config
└── README.md                   # This file
>>>>>>> main
```

---

## 🚢 Deployment

<<<<<<< HEAD
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
=======
### Setting Up Vercel Deployment

1. **Create a Vercel project**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import your GitHub repository
   - Note your Project ID and Org ID from project settings

2. **Generate Vercel Token**
   - Go to [Vercel Account Tokens](https://vercel.com/account/tokens)
   - Create a new token with appropriate permissions
   - Save the token securely

3. **Configure GitHub Secrets**
   Go to your repository **Settings → Secrets and variables → Actions** and add:
   
   - `VERCEL_TOKEN` - Your Vercel authentication token
   - `VERCEL_ORG_ID` - Your Vercel team/user ID
   - `VERCEL_PROJECT_ID` - Your Vercel project ID

4. **Deploy**
   - Push to the `main` branch
   - GitHub Actions will automatically build and deploy
   - Check the Actions tab for deployment status

### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

---

## 🔄 Self-Healing System

Quovarine implements an intelligent self-healing system that:

### How It Works

1. **Monitoring**: The `self-heal.yml` workflow monitors all deployments
2. **Detection**: Automatically detects failed deployments
3. **Recovery**: Attempts to rollback to the last successful deployment
4. **Verification**: Validates the rollback with health checks
5. **Notification**: Reports recovery actions via GitHub Actions summary

### Workflow Triggers

- Activates when the main deployment workflow fails
- Uses workflow_run trigger for seamless monitoring
- No manual intervention required

### Recovery Process

```
Failed Deployment Detected
         ↓
Fetch Last Successful Deployment
         ↓
Promote Previous Version
         ↓
Verify Health Status
         ↓
Notify Team of Actions Taken
```

### Viewing Recovery Reports

Check the **Actions** tab in GitHub to see:
- Self-healing activation logs
- Rollback details
- Post-recovery health status
- Recommended next steps

---

## 🏥 Health Monitoring

### Built-in Health Endpoint

The application includes a health check API at `/api/health` that returns:

```json
{
  "status": "healthy",
  "timestamp": "2025-12-30T08:44:00.000Z",
  "service": "quovarine",
  "version": "0.1.0",
  "uptime": 123.45,
  "environment": "production"
}
```

### Python Health Monitor

The `scripts/health_monitor.py` script provides:

- **Automated Health Checks**: Validates deployment status
- **Retry Logic**: Exponential backoff for transient failures
- **Detailed Logging**: Timestamped logs with error details
- **Standalone Operation**: Can run independently of CI/CD

**Usage:**
```bash
# Set DEPLOYMENT_URL in .env
export DEPLOYMENT_URL=https://your-deployment.vercel.app

# Run monitor
python scripts/health_monitor.py
```

**Features:**
- Configurable retry attempts (default: 5)
- Exponential backoff (2s → 4s → 8s → 16s → 32s)
- Maximum backoff cap (60s)
- JSON-formatted logs

---

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `VERCEL_TOKEN` | Authentication token | [Vercel Account Tokens](https://vercel.com/account/tokens) |
| `VERCEL_ORG_ID` | Organization/Team ID | Vercel Dashboard → Settings → General |
| `VERCEL_PROJECT_ID` | Project ID | Project Settings → General |
| `DEPLOYMENT_URL` | Production URL | After first deployment |
| `OPENAI_API_KEY` | OpenAI API key (optional) | [OpenAI API Keys](https://platform.openai.com/api-keys) |

### Setting Up Environment Variables

**For Local Development:**
```bash
cp .env.example .env
# Edit .env with your values
```

**For GitHub Actions:**
- Repository Settings → Secrets and variables → Actions
- Add each secret individually

**For Vercel:**
- Project Settings → Environment Variables
- Add variables for Production, Preview, and Development

---

## 💻 Development

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Run ESLint
```

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Tailwind CSS for styling
- React Server Components where possible

### Adding New Features

1. Create feature branch
2. Implement changes
3. Test locally with `npm run dev`
4. Build to verify: `npm run build`
5. Create pull request
6. Automated CI/CD will deploy on merge to main
>>>>>>> main

---

## 🤝 Contributing

<<<<<<< HEAD
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
=======
Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- Write clear commit messages
- Include tests for new features
- Follow existing code style
- Update documentation as needed

---

## 📄 License

This project is part of the Quovarine autonomous workflow automation system.

---

## 🆘 Troubleshooting

### Deployment Fails

1. Check GitHub Actions logs
2. Verify all secrets are set correctly
3. Ensure Vercel project is properly configured
4. Check self-healing workflow for automatic recovery

### Health Check Fails

1. Verify `DEPLOYMENT_URL` is correct
2. Check if deployment is complete
3. Review application logs in Vercel
4. Run health monitor script for detailed diagnostics

### Build Errors

1. Clear cache: `rm -rf .next node_modules`
2. Reinstall: `npm install`
3. Check Node.js version (18+)
4. Verify all dependencies are installed
>>>>>>> main

---

## 📞 Support

<<<<<<< HEAD
For issues, questions, or contributions:
- Open an issue on GitHub
- See [ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed documentation

---

**Initializing Genesis Shell...**  
Current Date and Time (UTC): 2025-12-30 10:19:43  
Current User's Login: sarinsk629-blip

=======
For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review GitHub Actions logs for deployment issues

---

<div align="center">

**Built with ❤️ by the Quovarine Team**

*Automating the future, one workflow at a time*

</div>
>>>>>>> main
