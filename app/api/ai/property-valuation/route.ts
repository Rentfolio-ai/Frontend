import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { propertyData, marketContext } = await request.json();

    if (!propertyData || !propertyData.address) {
      return NextResponse.json({ error: 'Property data is required' }, { status: 400 });
    }

    // Call your LLM backend API
    const response = await fetch(`${process.env.LLM_BACKEND_URL}/api/property-valuation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LLM_API_KEY}`,
      },
      body: JSON.stringify({
        property: propertyData,
        market: marketContext,
        userId: session.user.email,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM API error: ${response.status}`);
    }

    const llmResult = await response.json();

    return NextResponse.json({
      success: true,
      data: {
        content: llmResult.valuation || llmResult.content,
        confidence: llmResult.confidence || 85,
        generatedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Property valuation error:', error);
    return NextResponse.json(
      { error: 'Failed to get property valuation' },
      { status: 500 }
    );
  }
}
