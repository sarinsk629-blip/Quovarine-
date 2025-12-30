#!/bin/bash

###############################################################################
# Quovarine Initialization Script
# Validates environment, installs dependencies, and performs health checks
###############################################################################

set -e

echo "======================================"
echo "  Quovarine Claude 4.5 Initialization"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "ℹ $1"
}

# Check if .env file exists
echo "Step 1: Checking environment configuration..."
if [ ! -f .env ]; then
    print_warning ".env file not found"
    if [ -f .env.example ]; then
        print_info "Copying .env.example to .env"
        cp .env.example .env
        print_warning "Please edit .env and add your API keys"
        exit 1
    else
        print_error ".env.example not found"
        exit 1
    fi
else
    print_success ".env file found"
fi

# Source environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check required environment variables
echo ""
echo "Step 2: Validating required environment variables..."

REQUIRED_VARS=("ANTHROPIC_API_KEY")
OPTIONAL_VARS=("AWS_ACCESS_KEY_ID" "AZURE_FUNCTIONS_KEY" "OPENAI_API_KEY")

all_required_present=true
for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        print_error "$var is not set"
        all_required_present=false
    else
        print_success "$var is set"
    fi
done

if [ "$all_required_present" = false ]; then
    print_error "Required environment variables are missing"
    exit 1
fi

echo ""
print_info "Optional variables:"
for var in "${OPTIONAL_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        print_warning "$var is not set (optional)"
    else
        print_success "$var is set"
    fi
done

# Check Node.js version
echo ""
echo "Step 3: Checking Node.js version..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required (found: $(node -v))"
    exit 1
else
    print_success "Node.js version: $(node -v)"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
else
    print_success "npm version: $(npm -v)"
fi

# Install dependencies
echo ""
echo "Step 4: Installing dependencies..."
if npm install; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Run TypeScript type check
echo ""
echo "Step 5: Running TypeScript type check..."
if npm run type-check; then
    print_success "TypeScript compilation successful"
else
    print_warning "TypeScript compilation had errors (may be expected if Next.js not fully configured)"
fi

# Test API connectivity (if ANTHROPIC_API_KEY is set)
echo ""
echo "Step 6: Testing API connectivity..."

if [ -n "$ANTHROPIC_API_KEY" ]; then
    print_info "Testing Anthropic API connection..."
    
    # Simple API test using curl
    response=$(curl -s -w "%{http_code}" -o /tmp/api_test.txt \
        -X POST https://api.anthropic.com/v1/messages \
        -H "x-api-key: $ANTHROPIC_API_KEY" \
        -H "anthropic-version: 2023-06-01" \
        -H "content-type: application/json" \
        -d '{
            "model": "'"${CLAUDE_MODEL:-claude-opus-4-5-20251101}"'",
            "max_tokens": 10,
            "messages": [{"role": "user", "content": "ping"}]
        }' 2>&1)
    
    http_code="${response: -3}"
    
    if [ "$http_code" = "200" ]; then
        print_success "Anthropic API connection successful"
    else
        print_warning "Anthropic API test returned status $http_code"
        if [ "$http_code" = "401" ]; then
            print_error "Invalid API key"
        elif [ "$http_code" = "429" ]; then
            print_warning "Rate limit reached (API key is valid)"
        fi
    fi
    
    rm -f /tmp/api_test.txt
else
    print_warning "ANTHROPIC_API_KEY not set, skipping API test"
fi

# Create necessary directories
echo ""
echo "Step 7: Creating necessary directories..."
mkdir -p logs tmp
print_success "Directories created"

# Summary
echo ""
echo "======================================"
echo "  Initialization Complete!"
echo "======================================"
echo ""
print_info "Next steps:"
echo "  1. Review your .env file and ensure all API keys are correct"
echo "  2. Run 'npm run dev' to start the development server"
echo "  3. Test the API at http://localhost:3000/api/opus"
echo ""
print_info "For more information, see docs/ARCHITECTURE.md"
echo ""
