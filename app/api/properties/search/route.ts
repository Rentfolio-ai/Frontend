import { NextRequest, NextResponse } from 'next/server';
import { propertyRepository } from '@/lib/property-repository';
import { PropertySearchSchema } from '@/lib/validations';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = PropertySearchSchema.parse(body);

    const result = await propertyRepository.search(validatedData);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Search error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid search parameters' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    // Convert string params to appropriate types
    const convertedParams: any = {};
    for (const [key, value] of Object.entries(params)) {
      if (['minPrice', 'maxPrice', 'beds', 'baths', 'minCapRate', 'maxCapRate',
           'minCashOnCash', 'maxCashOnCash', 'minYearBuilt', 'maxYearBuilt',
           'page', 'limit'].includes(key)) {
        convertedParams[key] = Number(value);
      } else {
        convertedParams[key] = value;
      }
    }

    const validatedData = PropertySearchSchema.parse(convertedParams);
    const result = await propertyRepository.search(validatedData);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Search error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid search parameters' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
