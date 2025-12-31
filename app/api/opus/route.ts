/**
 * Opus API Route
 * Endpoint for Claude 4.5 Opus integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { QuovarineBridge } from '@/src/adapters/claude/QuovarineBridge';
import { OpusResponse } from '@/src/types/quovarine';
import { z } from 'zod';

// Request validation schema
const OpusRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  context: z.record(z.unknown()).optional(),
  thinking_effort: z.enum(['low', 'medium', 'high']).optional(),
  max_tokens: z.number().int().positive().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = OpusRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Validation failed: ${validationResult.error.message}`,
        } as OpusResponse,
        { status: 400 }
      );
    }
    
    const { prompt, context, thinking_effort, max_tokens } = validationResult.data;
    
    // Initialize Claude bridge
    const bridge = new QuovarineBridge({
      thinking_effort,
      max_tokens,
    });
    
    // Send prompt to Claude
    let responseText: string;
    let usage = { input_tokens: 0, output_tokens: 0 };
    
    if (context) {
      responseText = await bridge.analyzeTask(prompt, context);
    } else {
      responseText = await bridge.sendPrompt(prompt);
    }
    
    // Get actual usage from the bridge if available
    // For now, we use estimates since the bridge doesn't return usage directly
    // TODO: Update bridge methods to return full response with usage data
    usage = {
      input_tokens: Math.ceil(prompt.length / 4),
      output_tokens: Math.ceil(responseText.length / 4),
    };
    
    const response: OpusResponse = {
      success: true,
      data: {
        text: responseText,
        usage,
      },
    };
    
    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('[Opus API] Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isConfigError = errorMessage.includes('ANTHROPIC_API_KEY');
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      } as OpusResponse,
      { status: isConfigError ? 503 : 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      service: 'Quovarine Opus API',
      version: '0.1.0',
      status: 'active',
      endpoints: {
        POST: {
          description: 'Send prompts to Claude Opus 4.5',
          body: {
            prompt: 'string (required)',
            context: 'object (optional)',
            thinking_effort: 'low | medium | high (optional)',
            max_tokens: 'number (optional)',
          },
        },
      },
    },
    { status: 200 }
  );
}
