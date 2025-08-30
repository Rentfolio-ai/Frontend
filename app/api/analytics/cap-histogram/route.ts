import { NextRequest, NextResponse } from 'next/server';
import { propertyRepository } from '@/lib/property-repository';
import { PropertySearchSchema } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());

    // Convert string params to appropriate types
    const convertedParams: any = {};
    for (const [key, value] of Object.entries(params)) {
      if (['minPrice', 'maxPrice', 'beds', 'baths', 'minCapRate', 'maxCapRate',
           'minCashOnCash', 'maxCashOnCash', 'minYearBuilt', 'maxYearBuilt'].includes(key)) {
        convertedParams[key] = Number(value);
      } else {
        convertedParams[key] = value;
      }
    }

    const filters = PropertySearchSchema.omit({
      page: true,
      limit: true,
      sortBy: true,
      sortOrder: true
    }).parse(convertedParams);

    const capRateData = await propertyRepository.getCapRateDistribution(filters);

    return NextResponse.json(capRateData);
  } catch (error) {
    console.error('Cap rate histogram error:', error);

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid filter parameters' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
