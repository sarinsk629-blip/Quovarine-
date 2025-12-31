#!/bin/bash

# Quovarine Initialization Script
# Sets up the Quovarine environment and verifies configuration

set -e

echo "🚀 Initializing Quovarine..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js installation
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}✗ Node.js version must be 18 or higher${NC}"
    echo "Current version: $(node -v)"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v) detected${NC}"
echo ""

# Check npm installation
echo "Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v) detected${NC}"
echo ""

# Check for .env file
echo "Checking environment configuration..."
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ .env file not found${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo -e "${YELLOW}⚠ Please edit .env file with your API keys and tokens${NC}"
    echo ""
else
    echo -e "${GREEN}✓ .env file found${NC}"
fi

# Validate required environment variables
source .env 2>/dev/null || true

MISSING_VARS=()

if [ -z "$ANTHROPIC_API_KEY" ] || [ "$ANTHROPIC_API_KEY" = "your_anthropic_api_key" ]; then
    MISSING_VARS+=("ANTHROPIC_API_KEY")
fi

if [ -z "$VERCEL_TOKEN" ] || [ "$VERCEL_TOKEN" = "your_vercel_token" ]; then
    MISSING_VARS+=("VERCEL_TOKEN")
fi

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠ Missing or unconfigured environment variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    echo ""
    echo "Please configure these variables in your .env file"
    echo ""
fi

# Install dependencies
echo "Installing dependencies..."
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Build the project
echo "Building project..."
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi
echo ""

# Verify TypeScript configuration
echo "Verifying TypeScript configuration..."
if [ -f tsconfig.json ]; then
    echo -e "${GREEN}✓ TypeScript configured${NC}"
else
    echo -e "${RED}✗ tsconfig.json not found${NC}"
fi
echo ""

# Check directory structure
echo "Verifying directory structure..."
REQUIRED_DIRS=("src/adapters/claude" "src/adapters/cloud" "src/core" "src/types" "src/config" "app/api/health" "app/api/opus")
ALL_DIRS_OK=true

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓ $dir${NC}"
    else
        echo -e "${RED}✗ $dir missing${NC}"
        ALL_DIRS_OK=false
    fi
done
echo ""

# Summary
echo "════════════════════════════════════════════"
echo "        Quovarine Initialization Complete"
echo "════════════════════════════════════════════"
echo ""

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠ Action Required:${NC}"
    echo "  Configure missing environment variables in .env"
    echo ""
fi

echo "Next steps:"
echo "  1. Configure .env with your API keys"
echo "  2. Run: npm run dev"
echo "  3. Visit: http://localhost:3000"
echo "  4. Test health: http://localhost:3000/api/health"
echo "  5. Test Opus: http://localhost:3000/api/opus"
echo ""
echo "For deployment:"
echo "  1. Set GitHub secrets (VERCEL_TOKEN, etc.)"
echo "  2. Push to main branch"
echo "  3. GitHub Actions will handle deployment"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"
