import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Mutation = {
  __typename?: 'Mutation';
  calculatePnl?: Maybe<PnLResult>;
  trackPropertyView: Scalars['Boolean']['output'];
};


export type MutationCalculatePnlArgs = {
  address?: InputMaybe<Scalars['String']['input']>;
  downPaymentPct?: InputMaybe<Scalars['Float']['input']>;
  propertyId?: InputMaybe<Scalars['String']['input']>;
  strategy?: Scalars['String']['input'];
};


export type MutationTrackPropertyViewArgs = {
  propertyId: Scalars['String']['input'];
  userId?: InputMaybe<Scalars['String']['input']>;
};

export type Neighborhood = {
  __typename?: 'Neighborhood';
  city: Scalars['String']['output'];
  id: Scalars['String']['output'];
  medianPrice?: Maybe<Scalars['Float']['output']>;
  medianRent?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  properties: Array<Property>;
  state: Scalars['String']['output'];
  trajectory?: Maybe<NeighborhoodTrajectory>;
};


export type NeighborhoodPropertiesArgs = {
  limit?: Scalars['Int']['input'];
  maxPrice?: InputMaybe<Scalars['Float']['input']>;
  minPrice?: InputMaybe<Scalars['Float']['input']>;
};

export type NeighborhoodTrajectory = {
  __typename?: 'NeighborhoodTrajectory';
  confidence: Scalars['Float']['output'];
  daysOnMarketTrend?: Maybe<Scalars['String']['output']>;
  grade: Scalars['String']['output'];
  inventoryTrend?: Maybe<Scalars['String']['output']>;
  priceGrowth1yr?: Maybe<Scalars['Float']['output']>;
  priceGrowth3yr?: Maybe<Scalars['Float']['output']>;
  priceGrowth5yr?: Maybe<Scalars['Float']['output']>;
  reasoning: Scalars['String']['output'];
  signals: Array<Scalars['String']['output']>;
  trend: Scalars['String']['output'];
};

export type PnLResult = {
  __typename?: 'PnLResult';
  annualCashflow: Scalars['Float']['output'];
  annualRent: Scalars['Float']['output'];
  capRate: Scalars['Float']['output'];
  capex: Scalars['Float']['output'];
  cashOnCash: Scalars['Float']['output'];
  closingCosts: Scalars['Float']['output'];
  debtServiceCoverage: Scalars['Float']['output'];
  downPayment: Scalars['Float']['output'];
  grossIncome: Scalars['Float']['output'];
  hoa: Scalars['Float']['output'];
  insurance: Scalars['Float']['output'];
  loanAmount: Scalars['Float']['output'];
  maintenance: Scalars['Float']['output'];
  management: Scalars['Float']['output'];
  monthlyCashflow: Scalars['Float']['output'];
  monthlyRent: Scalars['Float']['output'];
  mortgagePayment: Scalars['Float']['output'];
  noi: Scalars['Float']['output'];
  otherIncome: Scalars['Float']['output'];
  propertyTax: Scalars['Float']['output'];
  purchasePrice: Scalars['Float']['output'];
  strategy: Scalars['String']['output'];
  totalExpenses: Scalars['Float']['output'];
  totalInvestment: Scalars['Float']['output'];
  utilities: Scalars['Float']['output'];
  vacancy: Scalars['Float']['output'];
  year1Cashflow?: Maybe<Scalars['Float']['output']>;
  year2Cashflow?: Maybe<Scalars['Float']['output']>;
  year3Cashflow?: Maybe<Scalars['Float']['output']>;
  year4Cashflow?: Maybe<Scalars['Float']['output']>;
  year5Cashflow?: Maybe<Scalars['Float']['output']>;
};

export type Property = {
  __typename?: 'Property';
  address: Scalars['String']['output'];
  bathrooms: Scalars['Float']['output'];
  bedrooms: Scalars['Int']['output'];
  city: Scalars['String']['output'];
  comps: Array<Property>;
  enrichment?: Maybe<PropertyEnrichment>;
  id: Scalars['String']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  lat: Scalars['Float']['output'];
  listedDate?: Maybe<Scalars['String']['output']>;
  lon: Scalars['Float']['output'];
  lotSize?: Maybe<Scalars['Float']['output']>;
  neighborhood?: Maybe<Neighborhood>;
  pnlAnalysis?: Maybe<PnLResult>;
  price: Scalars['Float']['output'];
  propertyType?: Maybe<Scalars['String']['output']>;
  sqft: Scalars['Int']['output'];
  state: Scalars['String']['output'];
  status: Scalars['String']['output'];
  yearBuilt?: Maybe<Scalars['Int']['output']>;
  zipCode: Scalars['String']['output'];
};


export type PropertyCompsArgs = {
  limit?: Scalars['Int']['input'];
  radiusMiles?: Scalars['Float']['input'];
};


export type PropertyPnlAnalysisArgs = {
  downPaymentPct?: InputMaybe<Scalars['Float']['input']>;
  interestRate?: InputMaybe<Scalars['Float']['input']>;
  loanTermYears?: InputMaybe<Scalars['Int']['input']>;
  strategy?: Scalars['String']['input'];
};

export type PropertyEnrichment = {
  __typename?: 'PropertyEnrichment';
  hoaFee?: Maybe<Scalars['Float']['output']>;
  insuranceEstimate?: Maybe<Scalars['Float']['output']>;
  lastSaleDate?: Maybe<Scalars['String']['output']>;
  lastSalePrice?: Maybe<Scalars['Float']['output']>;
  lotSize?: Maybe<Scalars['Float']['output']>;
  propertyTax?: Maybe<Scalars['Float']['output']>;
  rentEstimate?: Maybe<Scalars['Float']['output']>;
  rentRangeHigh?: Maybe<Scalars['Float']['output']>;
  rentRangeLow?: Maybe<Scalars['Float']['output']>;
  schoolRating?: Maybe<Scalars['Float']['output']>;
  transitScore?: Maybe<Scalars['Int']['output']>;
  walkabilityScore?: Maybe<Scalars['Int']['output']>;
  yearBuilt?: Maybe<Scalars['Int']['output']>;
};

export type PropertyFilters = {
  city?: InputMaybe<Scalars['String']['input']>;
  maxBathrooms?: InputMaybe<Scalars['Float']['input']>;
  maxBedrooms?: InputMaybe<Scalars['Int']['input']>;
  maxPrice?: InputMaybe<Scalars['Float']['input']>;
  maxSqft?: InputMaybe<Scalars['Int']['input']>;
  minBathrooms?: InputMaybe<Scalars['Float']['input']>;
  minBedrooms?: InputMaybe<Scalars['Int']['input']>;
  minPrice?: InputMaybe<Scalars['Float']['input']>;
  minSqft?: InputMaybe<Scalars['Int']['input']>;
  propertyType?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  zipCode?: InputMaybe<Scalars['String']['input']>;
};

export type Query = {
  __typename?: 'Query';
  neighborhood?: Maybe<Neighborhood>;
  property?: Maybe<Property>;
  searchProperties: Array<Property>;
};


export type QueryNeighborhoodArgs = {
  city?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
};


export type QueryPropertyArgs = {
  address?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySearchPropertiesArgs = {
  filters: PropertyFilters;
  limit?: Scalars['Int']['input'];
  offset?: Scalars['Int']['input'];
};

export type PropertyBasicFragment = { __typename?: 'Property', id: string, address: string, city: string, state: string, zipCode: string, price: number, bedrooms: number, bathrooms: number, sqft: number, lat: number, lon: number, status: string, imageUrl?: string | null };

export type PropertyEnrichmentDataFragment = { __typename?: 'PropertyEnrichment', rentEstimate?: number | null, rentRangeLow?: number | null, rentRangeHigh?: number | null, propertyTax?: number | null, hoaFee?: number | null, insuranceEstimate?: number | null, schoolRating?: number | null, walkabilityScore?: number | null, transitScore?: number | null, lastSaleDate?: string | null, lastSalePrice?: number | null, yearBuilt?: number | null, lotSize?: number | null };

export type PnLResultDataFragment = { __typename?: 'PnLResult', strategy: string, purchasePrice: number, downPayment: number, loanAmount: number, closingCosts: number, totalInvestment: number, monthlyRent: number, annualRent: number, grossIncome: number, mortgagePayment: number, propertyTax: number, insurance: number, hoa: number, maintenance: number, vacancy: number, capex: number, management: number, utilities: number, totalExpenses: number, noi: number, monthlyCashflow: number, annualCashflow: number, capRate: number, cashOnCash: number, debtServiceCoverage: number, year1Cashflow?: number | null, year2Cashflow?: number | null, year3Cashflow?: number | null, year4Cashflow?: number | null, year5Cashflow?: number | null };

export type NeighborhoodDataFragment = { __typename?: 'Neighborhood', id: string, name: string, city: string, state: string, medianPrice?: number | null, medianRent?: number | null };

export type NeighborhoodTrajectoryDataFragment = { __typename?: 'NeighborhoodTrajectory', grade: string, confidence: number, trend: string, priceGrowth1yr?: number | null, priceGrowth3yr?: number | null, priceGrowth5yr?: number | null, inventoryTrend?: string | null, daysOnMarketTrend?: string | null, signals: Array<string>, reasoning: string };

export type GetPropertyBasicQueryVariables = Exact<{
  address: Scalars['String']['input'];
}>;


export type GetPropertyBasicQuery = { __typename?: 'Query', property?: { __typename?: 'Property', id: string, address: string, city: string, state: string, zipCode: string, price: number, bedrooms: number, bathrooms: number, sqft: number, lat: number, lon: number, status: string, imageUrl?: string | null } | null };

export type GetPropertyWithEnrichmentQueryVariables = Exact<{
  address: Scalars['String']['input'];
}>;


export type GetPropertyWithEnrichmentQuery = { __typename?: 'Query', property?: { __typename?: 'Property', id: string, address: string, city: string, state: string, zipCode: string, price: number, bedrooms: number, bathrooms: number, sqft: number, lat: number, lon: number, status: string, imageUrl?: string | null, enrichment?: { __typename?: 'PropertyEnrichment', rentEstimate?: number | null, rentRangeLow?: number | null, rentRangeHigh?: number | null, propertyTax?: number | null, hoaFee?: number | null, insuranceEstimate?: number | null, schoolRating?: number | null, walkabilityScore?: number | null, transitScore?: number | null, lastSaleDate?: string | null, lastSalePrice?: number | null, yearBuilt?: number | null, lotSize?: number | null } | null } | null };

export type GetPropertyWithPnLQueryVariables = Exact<{
  address: Scalars['String']['input'];
  strategy: Scalars['String']['input'];
  downPaymentPct?: InputMaybe<Scalars['Float']['input']>;
}>;


export type GetPropertyWithPnLQuery = { __typename?: 'Query', property?: { __typename?: 'Property', id: string, address: string, city: string, state: string, zipCode: string, price: number, bedrooms: number, bathrooms: number, sqft: number, lat: number, lon: number, status: string, imageUrl?: string | null, pnlAnalysis?: { __typename?: 'PnLResult', strategy: string, purchasePrice: number, downPayment: number, loanAmount: number, closingCosts: number, totalInvestment: number, monthlyRent: number, annualRent: number, grossIncome: number, mortgagePayment: number, propertyTax: number, insurance: number, hoa: number, maintenance: number, vacancy: number, capex: number, management: number, utilities: number, totalExpenses: number, noi: number, monthlyCashflow: number, annualCashflow: number, capRate: number, cashOnCash: number, debtServiceCoverage: number, year1Cashflow?: number | null, year2Cashflow?: number | null, year3Cashflow?: number | null, year4Cashflow?: number | null, year5Cashflow?: number | null } | null } | null };

export type GetPropertyCompleteQueryVariables = Exact<{
  address: Scalars['String']['input'];
  strategy: Scalars['String']['input'];
  downPaymentPct?: InputMaybe<Scalars['Float']['input']>;
  compsRadius?: InputMaybe<Scalars['Float']['input']>;
  compsLimit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetPropertyCompleteQuery = { __typename?: 'Query', property?: { __typename?: 'Property', id: string, address: string, city: string, state: string, zipCode: string, price: number, bedrooms: number, bathrooms: number, sqft: number, lat: number, lon: number, status: string, imageUrl?: string | null, enrichment?: { __typename?: 'PropertyEnrichment', rentEstimate?: number | null, rentRangeLow?: number | null, rentRangeHigh?: number | null, propertyTax?: number | null, hoaFee?: number | null, insuranceEstimate?: number | null, schoolRating?: number | null, walkabilityScore?: number | null, transitScore?: number | null, lastSaleDate?: string | null, lastSalePrice?: number | null, yearBuilt?: number | null, lotSize?: number | null } | null, pnlAnalysis?: { __typename?: 'PnLResult', strategy: string, purchasePrice: number, downPayment: number, loanAmount: number, closingCosts: number, totalInvestment: number, monthlyRent: number, annualRent: number, grossIncome: number, mortgagePayment: number, propertyTax: number, insurance: number, hoa: number, maintenance: number, vacancy: number, capex: number, management: number, utilities: number, totalExpenses: number, noi: number, monthlyCashflow: number, annualCashflow: number, capRate: number, cashOnCash: number, debtServiceCoverage: number, year1Cashflow?: number | null, year2Cashflow?: number | null, year3Cashflow?: number | null, year4Cashflow?: number | null, year5Cashflow?: number | null } | null, comps: Array<{ __typename?: 'Property', id: string, address: string, city: string, state: string, zipCode: string, price: number, bedrooms: number, bathrooms: number, sqft: number, lat: number, lon: number, status: string, imageUrl?: string | null }>, neighborhood?: { __typename?: 'Neighborhood', id: string, name: string, city: string, state: string } | null } | null };

export type SearchPropertiesQueryVariables = Exact<{
  filters: PropertyFilters;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type SearchPropertiesQuery = { __typename?: 'Query', searchProperties: Array<{ __typename?: 'Property', id: string, address: string, city: string, state: string, zipCode: string, price: number, bedrooms: number, bathrooms: number, sqft: number, lat: number, lon: number, status: string, imageUrl?: string | null }> };

export type GetNeighborhoodQueryVariables = Exact<{
  city: Scalars['String']['input'];
  state: Scalars['String']['input'];
}>;


export type GetNeighborhoodQuery = { __typename?: 'Query', neighborhood?: { __typename?: 'Neighborhood', id: string, name: string, city: string, state: string, medianPrice?: number | null, medianRent?: number | null, trajectory?: { __typename?: 'NeighborhoodTrajectory', grade: string, confidence: number, trend: string, priceGrowth1yr?: number | null, priceGrowth3yr?: number | null, priceGrowth5yr?: number | null, inventoryTrend?: string | null, daysOnMarketTrend?: string | null, signals: Array<string>, reasoning: string } | null } | null };

export type CalculatePnLMutationVariables = Exact<{
  address: Scalars['String']['input'];
  strategy: Scalars['String']['input'];
  downPaymentPct?: InputMaybe<Scalars['Float']['input']>;
}>;


export type CalculatePnLMutation = { __typename?: 'Mutation', calculatePnl?: { __typename?: 'PnLResult', strategy: string, purchasePrice: number, downPayment: number, loanAmount: number, closingCosts: number, totalInvestment: number, monthlyRent: number, annualRent: number, grossIncome: number, mortgagePayment: number, propertyTax: number, insurance: number, hoa: number, maintenance: number, vacancy: number, capex: number, management: number, utilities: number, totalExpenses: number, noi: number, monthlyCashflow: number, annualCashflow: number, capRate: number, cashOnCash: number, debtServiceCoverage: number, year1Cashflow?: number | null, year2Cashflow?: number | null, year3Cashflow?: number | null, year4Cashflow?: number | null, year5Cashflow?: number | null } | null };

export type TrackPropertyViewMutationVariables = Exact<{
  propertyId: Scalars['String']['input'];
}>;


export type TrackPropertyViewMutation = { __typename?: 'Mutation', trackPropertyView: boolean };

export const PropertyBasicFragmentDoc = gql`
    fragment PropertyBasic on Property {
  id
  address
  city
  state
  zipCode
  price
  bedrooms
  bathrooms
  sqft
  lat
  lon
  status
  imageUrl
}
    `;
export const PropertyEnrichmentDataFragmentDoc = gql`
    fragment PropertyEnrichmentData on PropertyEnrichment {
  rentEstimate
  rentRangeLow
  rentRangeHigh
  propertyTax
  hoaFee
  insuranceEstimate
  schoolRating
  walkabilityScore
  transitScore
  lastSaleDate
  lastSalePrice
  yearBuilt
  lotSize
}
    `;
export const PnLResultDataFragmentDoc = gql`
    fragment PnLResultData on PnLResult {
  strategy
  purchasePrice
  downPayment
  loanAmount
  closingCosts
  totalInvestment
  monthlyRent
  annualRent
  grossIncome
  mortgagePayment
  propertyTax
  insurance
  hoa
  maintenance
  vacancy
  capex
  management
  utilities
  totalExpenses
  noi
  monthlyCashflow
  annualCashflow
  capRate
  cashOnCash
  debtServiceCoverage
  year1Cashflow
  year2Cashflow
  year3Cashflow
  year4Cashflow
  year5Cashflow
}
    `;
export const NeighborhoodDataFragmentDoc = gql`
    fragment NeighborhoodData on Neighborhood {
  id
  name
  city
  state
  medianPrice
  medianRent
}
    `;
export const NeighborhoodTrajectoryDataFragmentDoc = gql`
    fragment NeighborhoodTrajectoryData on NeighborhoodTrajectory {
  grade
  confidence
  trend
  priceGrowth1yr
  priceGrowth3yr
  priceGrowth5yr
  inventoryTrend
  daysOnMarketTrend
  signals
  reasoning
}
    `;
export const GetPropertyBasicDocument = gql`
    query GetPropertyBasic($address: String!) {
  property(address: $address) {
    ...PropertyBasic
  }
}
    ${PropertyBasicFragmentDoc}`;

/**
 * __useGetPropertyBasicQuery__
 *
 * To run a query within a React component, call `useGetPropertyBasicQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPropertyBasicQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPropertyBasicQuery({
 *   variables: {
 *      address: // value for 'address'
 *   },
 * });
 */
export function useGetPropertyBasicQuery(baseOptions: Apollo.QueryHookOptions<GetPropertyBasicQuery, GetPropertyBasicQueryVariables> & ({ variables: GetPropertyBasicQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPropertyBasicQuery, GetPropertyBasicQueryVariables>(GetPropertyBasicDocument, options);
      }
export function useGetPropertyBasicLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPropertyBasicQuery, GetPropertyBasicQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPropertyBasicQuery, GetPropertyBasicQueryVariables>(GetPropertyBasicDocument, options);
        }
// @ts-ignore
export function useGetPropertyBasicSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetPropertyBasicQuery, GetPropertyBasicQueryVariables>): Apollo.UseSuspenseQueryResult<GetPropertyBasicQuery, GetPropertyBasicQueryVariables>;
export function useGetPropertyBasicSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPropertyBasicQuery, GetPropertyBasicQueryVariables>): Apollo.UseSuspenseQueryResult<GetPropertyBasicQuery | undefined, GetPropertyBasicQueryVariables>;
export function useGetPropertyBasicSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPropertyBasicQuery, GetPropertyBasicQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPropertyBasicQuery, GetPropertyBasicQueryVariables>(GetPropertyBasicDocument, options);
        }
export type GetPropertyBasicQueryHookResult = ReturnType<typeof useGetPropertyBasicQuery>;
export type GetPropertyBasicLazyQueryHookResult = ReturnType<typeof useGetPropertyBasicLazyQuery>;
export type GetPropertyBasicSuspenseQueryHookResult = ReturnType<typeof useGetPropertyBasicSuspenseQuery>;
export type GetPropertyBasicQueryResult = Apollo.QueryResult<GetPropertyBasicQuery, GetPropertyBasicQueryVariables>;
export const GetPropertyWithEnrichmentDocument = gql`
    query GetPropertyWithEnrichment($address: String!) {
  property(address: $address) {
    ...PropertyBasic
    enrichment {
      ...PropertyEnrichmentData
    }
  }
}
    ${PropertyBasicFragmentDoc}
${PropertyEnrichmentDataFragmentDoc}`;

/**
 * __useGetPropertyWithEnrichmentQuery__
 *
 * To run a query within a React component, call `useGetPropertyWithEnrichmentQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPropertyWithEnrichmentQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPropertyWithEnrichmentQuery({
 *   variables: {
 *      address: // value for 'address'
 *   },
 * });
 */
export function useGetPropertyWithEnrichmentQuery(baseOptions: Apollo.QueryHookOptions<GetPropertyWithEnrichmentQuery, GetPropertyWithEnrichmentQueryVariables> & ({ variables: GetPropertyWithEnrichmentQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPropertyWithEnrichmentQuery, GetPropertyWithEnrichmentQueryVariables>(GetPropertyWithEnrichmentDocument, options);
      }
export function useGetPropertyWithEnrichmentLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPropertyWithEnrichmentQuery, GetPropertyWithEnrichmentQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPropertyWithEnrichmentQuery, GetPropertyWithEnrichmentQueryVariables>(GetPropertyWithEnrichmentDocument, options);
        }
// @ts-ignore
export function useGetPropertyWithEnrichmentSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetPropertyWithEnrichmentQuery, GetPropertyWithEnrichmentQueryVariables>): Apollo.UseSuspenseQueryResult<GetPropertyWithEnrichmentQuery, GetPropertyWithEnrichmentQueryVariables>;
export function useGetPropertyWithEnrichmentSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPropertyWithEnrichmentQuery, GetPropertyWithEnrichmentQueryVariables>): Apollo.UseSuspenseQueryResult<GetPropertyWithEnrichmentQuery | undefined, GetPropertyWithEnrichmentQueryVariables>;
export function useGetPropertyWithEnrichmentSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPropertyWithEnrichmentQuery, GetPropertyWithEnrichmentQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPropertyWithEnrichmentQuery, GetPropertyWithEnrichmentQueryVariables>(GetPropertyWithEnrichmentDocument, options);
        }
export type GetPropertyWithEnrichmentQueryHookResult = ReturnType<typeof useGetPropertyWithEnrichmentQuery>;
export type GetPropertyWithEnrichmentLazyQueryHookResult = ReturnType<typeof useGetPropertyWithEnrichmentLazyQuery>;
export type GetPropertyWithEnrichmentSuspenseQueryHookResult = ReturnType<typeof useGetPropertyWithEnrichmentSuspenseQuery>;
export type GetPropertyWithEnrichmentQueryResult = Apollo.QueryResult<GetPropertyWithEnrichmentQuery, GetPropertyWithEnrichmentQueryVariables>;
export const GetPropertyWithPnLDocument = gql`
    query GetPropertyWithPnL($address: String!, $strategy: String!, $downPaymentPct: Float) {
  property(address: $address) {
    ...PropertyBasic
    pnlAnalysis(strategy: $strategy, downPaymentPct: $downPaymentPct) {
      ...PnLResultData
    }
  }
}
    ${PropertyBasicFragmentDoc}
${PnLResultDataFragmentDoc}`;

/**
 * __useGetPropertyWithPnLQuery__
 *
 * To run a query within a React component, call `useGetPropertyWithPnLQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPropertyWithPnLQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPropertyWithPnLQuery({
 *   variables: {
 *      address: // value for 'address'
 *      strategy: // value for 'strategy'
 *      downPaymentPct: // value for 'downPaymentPct'
 *   },
 * });
 */
export function useGetPropertyWithPnLQuery(baseOptions: Apollo.QueryHookOptions<GetPropertyWithPnLQuery, GetPropertyWithPnLQueryVariables> & ({ variables: GetPropertyWithPnLQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPropertyWithPnLQuery, GetPropertyWithPnLQueryVariables>(GetPropertyWithPnLDocument, options);
      }
export function useGetPropertyWithPnLLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPropertyWithPnLQuery, GetPropertyWithPnLQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPropertyWithPnLQuery, GetPropertyWithPnLQueryVariables>(GetPropertyWithPnLDocument, options);
        }
// @ts-ignore
export function useGetPropertyWithPnLSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetPropertyWithPnLQuery, GetPropertyWithPnLQueryVariables>): Apollo.UseSuspenseQueryResult<GetPropertyWithPnLQuery, GetPropertyWithPnLQueryVariables>;
export function useGetPropertyWithPnLSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPropertyWithPnLQuery, GetPropertyWithPnLQueryVariables>): Apollo.UseSuspenseQueryResult<GetPropertyWithPnLQuery | undefined, GetPropertyWithPnLQueryVariables>;
export function useGetPropertyWithPnLSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPropertyWithPnLQuery, GetPropertyWithPnLQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPropertyWithPnLQuery, GetPropertyWithPnLQueryVariables>(GetPropertyWithPnLDocument, options);
        }
export type GetPropertyWithPnLQueryHookResult = ReturnType<typeof useGetPropertyWithPnLQuery>;
export type GetPropertyWithPnLLazyQueryHookResult = ReturnType<typeof useGetPropertyWithPnLLazyQuery>;
export type GetPropertyWithPnLSuspenseQueryHookResult = ReturnType<typeof useGetPropertyWithPnLSuspenseQuery>;
export type GetPropertyWithPnLQueryResult = Apollo.QueryResult<GetPropertyWithPnLQuery, GetPropertyWithPnLQueryVariables>;
export const GetPropertyCompleteDocument = gql`
    query GetPropertyComplete($address: String!, $strategy: String!, $downPaymentPct: Float, $compsRadius: Float, $compsLimit: Int) {
  property(address: $address) {
    ...PropertyBasic
    enrichment {
      ...PropertyEnrichmentData
    }
    pnlAnalysis(strategy: $strategy, downPaymentPct: $downPaymentPct) {
      ...PnLResultData
    }
    comps(radiusMiles: $compsRadius, limit: $compsLimit) {
      ...PropertyBasic
    }
    neighborhood {
      id
      name
      city
      state
    }
  }
}
    ${PropertyBasicFragmentDoc}
${PropertyEnrichmentDataFragmentDoc}
${PnLResultDataFragmentDoc}`;

/**
 * __useGetPropertyCompleteQuery__
 *
 * To run a query within a React component, call `useGetPropertyCompleteQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPropertyCompleteQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPropertyCompleteQuery({
 *   variables: {
 *      address: // value for 'address'
 *      strategy: // value for 'strategy'
 *      downPaymentPct: // value for 'downPaymentPct'
 *      compsRadius: // value for 'compsRadius'
 *      compsLimit: // value for 'compsLimit'
 *   },
 * });
 */
export function useGetPropertyCompleteQuery(baseOptions: Apollo.QueryHookOptions<GetPropertyCompleteQuery, GetPropertyCompleteQueryVariables> & ({ variables: GetPropertyCompleteQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetPropertyCompleteQuery, GetPropertyCompleteQueryVariables>(GetPropertyCompleteDocument, options);
      }
export function useGetPropertyCompleteLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetPropertyCompleteQuery, GetPropertyCompleteQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetPropertyCompleteQuery, GetPropertyCompleteQueryVariables>(GetPropertyCompleteDocument, options);
        }
// @ts-ignore
export function useGetPropertyCompleteSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetPropertyCompleteQuery, GetPropertyCompleteQueryVariables>): Apollo.UseSuspenseQueryResult<GetPropertyCompleteQuery, GetPropertyCompleteQueryVariables>;
export function useGetPropertyCompleteSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPropertyCompleteQuery, GetPropertyCompleteQueryVariables>): Apollo.UseSuspenseQueryResult<GetPropertyCompleteQuery | undefined, GetPropertyCompleteQueryVariables>;
export function useGetPropertyCompleteSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetPropertyCompleteQuery, GetPropertyCompleteQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetPropertyCompleteQuery, GetPropertyCompleteQueryVariables>(GetPropertyCompleteDocument, options);
        }
export type GetPropertyCompleteQueryHookResult = ReturnType<typeof useGetPropertyCompleteQuery>;
export type GetPropertyCompleteLazyQueryHookResult = ReturnType<typeof useGetPropertyCompleteLazyQuery>;
export type GetPropertyCompleteSuspenseQueryHookResult = ReturnType<typeof useGetPropertyCompleteSuspenseQuery>;
export type GetPropertyCompleteQueryResult = Apollo.QueryResult<GetPropertyCompleteQuery, GetPropertyCompleteQueryVariables>;
export const SearchPropertiesDocument = gql`
    query SearchProperties($filters: PropertyFilters!, $limit: Int, $offset: Int) {
  searchProperties(filters: $filters, limit: $limit, offset: $offset) {
    ...PropertyBasic
  }
}
    ${PropertyBasicFragmentDoc}`;

/**
 * __useSearchPropertiesQuery__
 *
 * To run a query within a React component, call `useSearchPropertiesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchPropertiesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchPropertiesQuery({
 *   variables: {
 *      filters: // value for 'filters'
 *      limit: // value for 'limit'
 *      offset: // value for 'offset'
 *   },
 * });
 */
export function useSearchPropertiesQuery(baseOptions: Apollo.QueryHookOptions<SearchPropertiesQuery, SearchPropertiesQueryVariables> & ({ variables: SearchPropertiesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<SearchPropertiesQuery, SearchPropertiesQueryVariables>(SearchPropertiesDocument, options);
      }
export function useSearchPropertiesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<SearchPropertiesQuery, SearchPropertiesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<SearchPropertiesQuery, SearchPropertiesQueryVariables>(SearchPropertiesDocument, options);
        }
// @ts-ignore
export function useSearchPropertiesSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<SearchPropertiesQuery, SearchPropertiesQueryVariables>): Apollo.UseSuspenseQueryResult<SearchPropertiesQuery, SearchPropertiesQueryVariables>;
export function useSearchPropertiesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SearchPropertiesQuery, SearchPropertiesQueryVariables>): Apollo.UseSuspenseQueryResult<SearchPropertiesQuery | undefined, SearchPropertiesQueryVariables>;
export function useSearchPropertiesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<SearchPropertiesQuery, SearchPropertiesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<SearchPropertiesQuery, SearchPropertiesQueryVariables>(SearchPropertiesDocument, options);
        }
export type SearchPropertiesQueryHookResult = ReturnType<typeof useSearchPropertiesQuery>;
export type SearchPropertiesLazyQueryHookResult = ReturnType<typeof useSearchPropertiesLazyQuery>;
export type SearchPropertiesSuspenseQueryHookResult = ReturnType<typeof useSearchPropertiesSuspenseQuery>;
export type SearchPropertiesQueryResult = Apollo.QueryResult<SearchPropertiesQuery, SearchPropertiesQueryVariables>;
export const GetNeighborhoodDocument = gql`
    query GetNeighborhood($city: String!, $state: String!) {
  neighborhood(city: $city, state: $state) {
    ...NeighborhoodData
    trajectory {
      ...NeighborhoodTrajectoryData
    }
  }
}
    ${NeighborhoodDataFragmentDoc}
${NeighborhoodTrajectoryDataFragmentDoc}`;

/**
 * __useGetNeighborhoodQuery__
 *
 * To run a query within a React component, call `useGetNeighborhoodQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetNeighborhoodQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetNeighborhoodQuery({
 *   variables: {
 *      city: // value for 'city'
 *      state: // value for 'state'
 *   },
 * });
 */
export function useGetNeighborhoodQuery(baseOptions: Apollo.QueryHookOptions<GetNeighborhoodQuery, GetNeighborhoodQueryVariables> & ({ variables: GetNeighborhoodQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetNeighborhoodQuery, GetNeighborhoodQueryVariables>(GetNeighborhoodDocument, options);
      }
export function useGetNeighborhoodLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetNeighborhoodQuery, GetNeighborhoodQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetNeighborhoodQuery, GetNeighborhoodQueryVariables>(GetNeighborhoodDocument, options);
        }
// @ts-ignore
export function useGetNeighborhoodSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<GetNeighborhoodQuery, GetNeighborhoodQueryVariables>): Apollo.UseSuspenseQueryResult<GetNeighborhoodQuery, GetNeighborhoodQueryVariables>;
export function useGetNeighborhoodSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetNeighborhoodQuery, GetNeighborhoodQueryVariables>): Apollo.UseSuspenseQueryResult<GetNeighborhoodQuery | undefined, GetNeighborhoodQueryVariables>;
export function useGetNeighborhoodSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetNeighborhoodQuery, GetNeighborhoodQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetNeighborhoodQuery, GetNeighborhoodQueryVariables>(GetNeighborhoodDocument, options);
        }
export type GetNeighborhoodQueryHookResult = ReturnType<typeof useGetNeighborhoodQuery>;
export type GetNeighborhoodLazyQueryHookResult = ReturnType<typeof useGetNeighborhoodLazyQuery>;
export type GetNeighborhoodSuspenseQueryHookResult = ReturnType<typeof useGetNeighborhoodSuspenseQuery>;
export type GetNeighborhoodQueryResult = Apollo.QueryResult<GetNeighborhoodQuery, GetNeighborhoodQueryVariables>;
export const CalculatePnLDocument = gql`
    mutation CalculatePnL($address: String!, $strategy: String!, $downPaymentPct: Float) {
  calculatePnl(
    address: $address
    strategy: $strategy
    downPaymentPct: $downPaymentPct
  ) {
    ...PnLResultData
  }
}
    ${PnLResultDataFragmentDoc}`;
export type CalculatePnLMutationFn = Apollo.MutationFunction<CalculatePnLMutation, CalculatePnLMutationVariables>;

/**
 * __useCalculatePnLMutation__
 *
 * To run a mutation, you first call `useCalculatePnLMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCalculatePnLMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [calculatePnLMutation, { data, loading, error }] = useCalculatePnLMutation({
 *   variables: {
 *      address: // value for 'address'
 *      strategy: // value for 'strategy'
 *      downPaymentPct: // value for 'downPaymentPct'
 *   },
 * });
 */
export function useCalculatePnLMutation(baseOptions?: Apollo.MutationHookOptions<CalculatePnLMutation, CalculatePnLMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CalculatePnLMutation, CalculatePnLMutationVariables>(CalculatePnLDocument, options);
      }
export type CalculatePnLMutationHookResult = ReturnType<typeof useCalculatePnLMutation>;
export type CalculatePnLMutationResult = Apollo.MutationResult<CalculatePnLMutation>;
export type CalculatePnLMutationOptions = Apollo.BaseMutationOptions<CalculatePnLMutation, CalculatePnLMutationVariables>;
export const TrackPropertyViewDocument = gql`
    mutation TrackPropertyView($propertyId: String!) {
  trackPropertyView(propertyId: $propertyId)
}
    `;
export type TrackPropertyViewMutationFn = Apollo.MutationFunction<TrackPropertyViewMutation, TrackPropertyViewMutationVariables>;

/**
 * __useTrackPropertyViewMutation__
 *
 * To run a mutation, you first call `useTrackPropertyViewMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useTrackPropertyViewMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [trackPropertyViewMutation, { data, loading, error }] = useTrackPropertyViewMutation({
 *   variables: {
 *      propertyId: // value for 'propertyId'
 *   },
 * });
 */
export function useTrackPropertyViewMutation(baseOptions?: Apollo.MutationHookOptions<TrackPropertyViewMutation, TrackPropertyViewMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<TrackPropertyViewMutation, TrackPropertyViewMutationVariables>(TrackPropertyViewDocument, options);
      }
export type TrackPropertyViewMutationHookResult = ReturnType<typeof useTrackPropertyViewMutation>;
export type TrackPropertyViewMutationResult = Apollo.MutationResult<TrackPropertyViewMutation>;
export type TrackPropertyViewMutationOptions = Apollo.BaseMutationOptions<TrackPropertyViewMutation, TrackPropertyViewMutationVariables>;