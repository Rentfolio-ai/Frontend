/**
 * GraphQL Queries and Mutations.
 * 
 * Type-safe GraphQL operations for property data.
 */

import { gql } from '@apollo/client';

// ============================================================================
// FRAGMENTS
// ============================================================================

export const PROPERTY_BASIC_FRAGMENT = gql`
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

export const PROPERTY_ENRICHMENT_FRAGMENT = gql`
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

export const PNL_RESULT_FRAGMENT = gql`
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

export const NEIGHBORHOOD_FRAGMENT = gql`
  fragment NeighborhoodData on Neighborhood {
    id
    name
    city
    state
    medianPrice
    medianRent
  }
`;

export const NEIGHBORHOOD_TRAJECTORY_FRAGMENT = gql`
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

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get property with basic info only.
 */
export const GET_PROPERTY_BASIC = gql`
  ${PROPERTY_BASIC_FRAGMENT}
  
  query GetPropertyBasic($address: String!) {
    property(address: $address) {
      ...PropertyBasic
    }
  }
`;

/**
 * Get property with enrichment data.
 */
export const GET_PROPERTY_WITH_ENRICHMENT = gql`
  ${PROPERTY_BASIC_FRAGMENT}
  ${PROPERTY_ENRICHMENT_FRAGMENT}
  
  query GetPropertyWithEnrichment($address: String!) {
    property(address: $address) {
      ...PropertyBasic
      enrichment {
        ...PropertyEnrichmentData
      }
    }
  }
`;

/**
 * Get property with P&L analysis.
 */
export const GET_PROPERTY_WITH_PNL = gql`
  ${PROPERTY_BASIC_FRAGMENT}
  ${PNL_RESULT_FRAGMENT}
  
  query GetPropertyWithPnL(
    $address: String!
    $strategy: String!
    $downPaymentPct: Float
  ) {
    property(address: $address) {
      ...PropertyBasic
      pnlAnalysis(
        strategy: $strategy
        downPaymentPct: $downPaymentPct
      ) {
        ...PnLResultData
      }
    }
  }
`;

/**
 * Get property with everything (enrichment + P&L + comps).
 */
export const GET_PROPERTY_COMPLETE = gql`
  ${PROPERTY_BASIC_FRAGMENT}
  ${PROPERTY_ENRICHMENT_FRAGMENT}
  ${PNL_RESULT_FRAGMENT}
  
  query GetPropertyComplete(
    $address: String!
    $strategy: String!
    $downPaymentPct: Float
    $compsRadius: Float
    $compsLimit: Int
  ) {
    property(address: $address) {
      ...PropertyBasic
      
      enrichment {
        ...PropertyEnrichmentData
      }
      
      pnlAnalysis(
        strategy: $strategy
        downPaymentPct: $downPaymentPct
      ) {
        ...PnLResultData
      }
      
      comps(
        radiusMiles: $compsRadius
        limit: $compsLimit
      ) {
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
`;

/**
 * Search properties with filters.
 */
export const SEARCH_PROPERTIES = gql`
  ${PROPERTY_BASIC_FRAGMENT}
  
  query SearchProperties(
    $filters: PropertyFilters!
    $limit: Int
    $offset: Int
  ) {
    searchProperties(
      filters: $filters
      limit: $limit
      offset: $offset
    ) {
      ...PropertyBasic
    }
  }
`;

/**
 * Get neighborhood with trajectory.
 */
export const GET_NEIGHBORHOOD = gql`
  ${NEIGHBORHOOD_FRAGMENT}
  ${NEIGHBORHOOD_TRAJECTORY_FRAGMENT}
  
  query GetNeighborhood($city: String!, $state: String!) {
    neighborhood(city: $city, state: $state) {
      ...NeighborhoodData
      trajectory {
        ...NeighborhoodTrajectoryData
      }
    }
  }
`;

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Calculate P&L for a property.
 */
export const CALCULATE_PNL = gql`
  ${PNL_RESULT_FRAGMENT}
  
  mutation CalculatePnL(
    $address: String!
    $strategy: String!
    $downPaymentPct: Float
  ) {
    calculatePnl(
      address: $address
      strategy: $strategy
      downPaymentPct: $downPaymentPct
    ) {
      ...PnLResultData
    }
  }
`;

/**
 * Track property view.
 */
export const TRACK_PROPERTY_VIEW = gql`
  mutation TrackPropertyView($propertyId: String!) {
    trackPropertyView(propertyId: $propertyId)
  }
`;
