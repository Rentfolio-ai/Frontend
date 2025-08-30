import { NextRequest, NextResponse } from 'next/server';
import { llmService } from '@/shared/lib/llm-service';
import { z } from 'zod';

const InsightsRequestSchema = z.object({
  marketData: z.object({
    location: z.string(),
    timeframe: z.string(),
    metrics: z.object({
      avgPrice: z.number(),
      medianCapRate: z.number(),
      totalListings: z.number(),
      priceGrowth: z.number(),
    }),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { marketData } = InsightsRequestSchema.parse(body);

    const insights = await llmService.generateMarketInsights(marketData);

    return NextResponse.json({
      success: true,
      insights: insights.content,
      confidence: insights.confidence,
      metadata: insights.metadata,
    });
  } catch (error) {
    console.error('AI insights generation failed:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    // Fallback to mock insights if LLM is unavailable
    const fallbackInsights = {
      market_sentiment: "neutral",
      key_insights: [
        "Market showing stable growth patterns",
        "Cap rates remain competitive in current environment",
        "Inventory levels suggest balanced market conditions"
      ],
      investment_recommendation: "Continue monitoring market conditions for optimal entry points",
      confidence_score: 75,
      risk_factors: ["Interest rate volatility", "Economic uncertainty"],
      opportunities: ["Emerging neighborhoods", "Value-add properties"]
    };

    return NextResponse.json({
      success: true,
      insights: JSON.stringify(fallbackInsights),
      confidence: 0.75,
      fallback: true,
      metadata: { source: 'fallback' },
    });
  }
}
