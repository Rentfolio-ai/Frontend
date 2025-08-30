import { NextRequest, NextResponse } from 'next/server';
import { llmService } from '@/shared/lib/llm-service';
import { z } from 'zod';

const ChatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  context: z.string().optional(),
  conversationId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context } = ChatRequestSchema.parse(body);

    const response = await llmService.generateChatResponse(message, context);

    return NextResponse.json({
      success: true,
      response: response.content,
      confidence: response.confidence,
      metadata: response.metadata,
    });
  } catch (error) {
    console.error('AI chat failed:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid message format', details: error.errors },
        { status: 400 }
      );
    }

    // Fallback response if LLM is unavailable
    const fallbackResponses = [
      "I'm currently experiencing technical difficulties, but I'd be happy to help you with real estate questions once the connection is restored.",
      "My AI systems are temporarily offline, but you can still explore the dashboard for market insights and property analysis.",
      "I'm having trouble connecting to my knowledge base right now. Please try again in a moment, or feel free to browse the available market data."
    ];

    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

    return NextResponse.json({
      success: true,
      response: randomResponse,
      confidence: 0.50,
      fallback: true,
      metadata: { source: 'fallback' },
    });
  }
}

// Streaming endpoint for real-time chat
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const message = searchParams.get('message');
  const context = searchParams.get('context');

  if (!message) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  try {
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of llmService.streamChatResponse(message, context || undefined)) {
            const data = encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`);
            controller.enqueue(data);
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Streaming setup failed:', error);
    return NextResponse.json({ error: 'Streaming not available' }, { status: 500 });
  }
}
