/**
 * Next.js API Route for Claude 4.5 Opus Interactions
 * POST /api/opus - Send prompts to Claude with streaming support
 */

import { NextRequest, NextResponse } from 'next/server';
import { OmniAdapter } from '@/adapters/claude/OmniAdapter';
import { AIProvider, AdapterRequest, QuovarineError } from '@/types/quovarine';

// Track usage for rate limiting
const usageTracker = new Map<string, { requests: number; lastReset: number }>();

/**
 * Rate limiting middleware
 */
function checkRateLimit(identifier: string, maxRequests = 50): boolean {
  const now = Date.now();
  const windowMs = 60000; // 1 minute

  const usage = usageTracker.get(identifier) || { requests: 0, lastReset: now };

  // Reset if window expired
  if (now - usage.lastReset > windowMs) {
    usage.requests = 0;
    usage.lastReset = now;
  }

  // Check limit
  if (usage.requests >= maxRequests) {
    return false;
  }

  // Increment
  usage.requests++;
  usageTracker.set(identifier, usage);

  return true;
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}

/**
 * Authentication middleware
 */
function authenticate(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const apiKey = process.env.API_KEY || process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return true; // No auth configured
  }

  if (!authHeader) {
    return false;
  }

  const token = authHeader.replace('Bearer ', '');
  return secureCompare(token, apiKey);
}

/**
 * POST handler for sending messages to Claude
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication
    if (!authenticate(request)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Rate limiting
    const identifier = request.headers.get('x-forwarded-for') || 'default';
    if (!checkRateLimit(identifier)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { prompt, maxTokens, temperature, thinking, stream, provider } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Invalid prompt' },
        { status: 400 }
      );
    }

    // Create adapter
    const adapter = new OmniAdapter(provider || AIProvider.ANTHROPIC);

    // Build request
    const adapterRequest: AdapterRequest = {
      prompt,
      maxTokens: maxTokens || 64000,
      temperature: temperature ?? 0.7,
      thinking: thinking ?? true,
      stream: stream ?? false
    };

    // Handle streaming vs non-streaming
    if (stream) {
      return handleStreamingResponse(adapter, adapterRequest);
    } else {
      return handleStandardResponse(adapter, adapterRequest);
    }
  } catch (error) {
    console.error('API Error:', error);

    if (error instanceof QuovarineError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          provider: error.provider
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle standard (non-streaming) response
 */
async function handleStandardResponse(
  adapter: OmniAdapter,
  request: AdapterRequest
): Promise<NextResponse> {
  const startTime = Date.now();

  try {
    const response = await adapter.sendMessage(request);

    const result = {
      success: true,
      content: response.content,
      thinking: response.thinking,
      usage: response.usage,
      provider: response.provider,
      model: response.model,
      metadata: {
        ...response.metadata,
        duration: Date.now() - startTime
      }
    };

    return NextResponse.json(result);
  } catch (error) {
    throw error;
  }
}

/**
 * Handle streaming response
 */
async function handleStreamingResponse(
  adapter: OmniAdapter,
  request: AdapterRequest
): Promise<Response> {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of adapter.streamMessage(request)) {
          const data = JSON.stringify(chunk) + '\n';
          controller.enqueue(encoder.encode(data));
        }
        controller.close();
      } catch (error) {
        console.error('Streaming error:', error);
        const errorData = JSON.stringify({
          type: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        }) + '\n';
        controller.enqueue(encoder.encode(errorData));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}

/**
 * GET handler for health check
 */
export async function GET(request: NextRequest) {
  try {
    const adapter = new OmniAdapter();
    const health = await adapter.healthCheck();

    return NextResponse.json({
      healthy: health.healthy,
      provider: health.provider,
      latency: health.latency,
      timestamp: health.timestamp,
      availableProviders: adapter.getAvailableProviders()
    });
  } catch (error) {
    return NextResponse.json(
      {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}
