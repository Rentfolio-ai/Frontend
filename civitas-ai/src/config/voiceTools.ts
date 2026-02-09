// FILE: src/config/voiceTools.ts
// Gemini Live function declarations for agentic voice mode.
// Each agent mode (Hunter/Research/Strategist) gets a curated set of tools
// that Gemini Live can call during voice conversations.

import type { AgentMode } from '../types/chat';

// ── Gemini function declaration shape ──

export interface FunctionParameter {
  type: string;
  description: string;
  enum?: string[];
}

export interface FunctionDeclaration {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, FunctionParameter>;
    required?: string[];
  };
}

// ── Tool Definitions ──

const search_properties: FunctionDeclaration = {
  name: 'search_properties',
  description:
    'Search for real estate properties for sale. Use this when the user asks to find properties, deals, homes, or listings in a specific area.',
  parameters: {
    type: 'object',
    properties: {
      city: { type: 'string', description: 'City name, e.g. "Austin"' },
      state: { type: 'string', description: 'Two-letter state code, e.g. "TX"' },
      min_price: { type: 'number', description: 'Minimum price filter in dollars' },
      max_price: { type: 'number', description: 'Maximum price filter in dollars' },
      min_bedrooms: { type: 'integer', description: 'Minimum number of bedrooms' },
      investment_type: {
        type: 'string',
        description: 'Investment strategy filter',
        enum: ['STR', 'LTR', 'Flip', 'MF', 'Land'],
      },
      limit: { type: 'integer', description: 'Max number of results to return (default 5)' },
    },
    required: ['city', 'state'],
  },

};

const get_market_stats: FunctionDeclaration = {
  name: 'get_market_stats',
  description:
    'Get real estate market statistics for a location including median prices, inventory, days on market, and price trends. Use when the user asks about a market, area conditions, or pricing trends.',
  parameters: {
    type: 'object',
    properties: {
      city: { type: 'string', description: 'City name' },
      state: { type: 'string', description: 'Two-letter state code' },
      zip_code: { type: 'string', description: 'ZIP code (alternative to city/state)' },
      data_type: {
        type: 'string',
        description: 'Type of data to retrieve',
        enum: ['Sale', 'Rental', 'All'],
      },
    },
    required: ['city', 'state'],
  },

};

const find_comparable_sales: FunctionDeclaration = {
  name: 'find_comparable_sales',
  description:
    'Find comparable property sales (comps) near a specific address. Use when the user asks about comps, nearby sales, or what similar properties sold for.',
  parameters: {
    type: 'object',
    properties: {
      address: { type: 'string', description: 'Property street address' },
      comp_count: { type: 'integer', description: 'Number of comps to find (default 5)' },
      radius_miles: { type: 'number', description: 'Search radius in miles (default 0.5)' },
    },
    required: ['address'],
  },

};

const detect_deal_killers: FunctionDeclaration = {
  name: 'detect_deal_killers',
  description:
    'Analyze a property for potential red flags and deal killers such as flood zones, environmental issues, title problems, or structural concerns. Use when the user wants to evaluate risks of a specific property.',
  parameters: {
    type: 'object',
    properties: {
      address: { type: 'string', description: 'Property street address' },
      city: { type: 'string', description: 'City name' },
      state: { type: 'string', description: 'Two-letter state code' },
    },
    required: ['address', 'city', 'state'],
  },

};

const get_rental_market_overview: FunctionDeclaration = {
  name: 'get_rental_market_overview',
  description:
    'Get a comprehensive rental market overview for a city including average rents, vacancy rates, rent trends, and demand indicators. Use when the user asks about rental markets or rental income potential.',
  parameters: {
    type: 'object',
    properties: {
      city: { type: 'string', description: 'City name' },
      state: { type: 'string', description: 'Two-letter state code' },
    },
    required: ['city', 'state'],
  },

};

const analyze_rental_income: FunctionDeclaration = {
  name: 'analyze_rental_income',
  description:
    'Estimate rental income for a specific property type in a given market. Use when the user asks how much rent a property could generate.',
  parameters: {
    type: 'object',
    properties: {
      city: { type: 'string', description: 'City name' },
      state: { type: 'string', description: 'Two-letter state code' },
      beds: { type: 'integer', description: 'Number of bedrooms' },
      baths: { type: 'number', description: 'Number of bathrooms' },
      sqft: { type: 'integer', description: 'Square footage (optional)' },
      property_type: { type: 'string', description: 'Property type e.g. "single_family", "condo"' },
    },
    required: ['city', 'state', 'beds', 'baths'],
  },

};

const calculate_cash_flow: FunctionDeclaration = {
  name: 'calculate_cash_flow',
  description:
    'Calculate rental cash flow and investment metrics for a property. Use when the user asks about cash flow, monthly income, ROI, or whether a deal makes financial sense.',
  parameters: {
    type: 'object',
    properties: {
      purchase_price: { type: 'integer', description: 'Purchase price in dollars' },
      estimated_rent: { type: 'integer', description: 'Monthly rental income in dollars' },
      down_payment_percent: { type: 'number', description: 'Down payment percentage (default 20)' },
      interest_rate: { type: 'number', description: 'Mortgage interest rate (default 7.0)' },
      annual_property_tax: { type: 'integer', description: 'Annual property tax in dollars' },
      annual_insurance: { type: 'integer', description: 'Annual insurance cost in dollars' },
      monthly_hoa: { type: 'integer', description: 'Monthly HOA fee in dollars' },
    },
    required: ['purchase_price', 'estimated_rent'],
  },
};

const get_user_portfolio: FunctionDeclaration = {
  name: 'get_user_portfolio',
  description:
    'Retrieve the user\'s real estate investment portfolio including all properties, their values, income, and performance metrics. Use when the user asks about their portfolio, holdings, or investments.',
  parameters: {
    type: 'object',
    properties: {},
  },
};

const simulate_investment_scenario: FunctionDeclaration = {
  name: 'simulate_investment_scenario',
  description:
    'Simulate a real estate investment scenario with different variables to project returns. Use when the user asks "what if" questions about purchase price, appreciation rates, or hold periods.',
  parameters: {
    type: 'object',
    properties: {
      purchase_price: { type: 'integer', description: 'Property purchase price' },
      monthly_rent: { type: 'integer', description: 'Expected monthly rental income' },
      appreciation_rate: { type: 'number', description: 'Annual appreciation rate (default 3%)' },
      hold_years: { type: 'integer', description: 'Number of years to hold (default 5)' },
      down_payment_percent: { type: 'number', description: 'Down payment percentage (default 20)' },
    },
    required: ['purchase_price', 'monthly_rent'],
  },

};

const scan_radar: FunctionDeclaration = {
  name: 'scan_radar',
  description:
    'Pre-Market Radar: Scan for distressed and motivated-seller properties in a market. Returns only properties with significant distress signals — stale listings, price reductions, motivated sellers, economic stress. Use when the user asks about distressed deals, motivated sellers, off-market opportunities, or pre-market intelligence.',
  parameters: {
    type: 'object',
    properties: {
      city: { type: 'string', description: 'City name, e.g. "Austin"' },
      state: { type: 'string', description: 'Two-letter state code, e.g. "TX"' },
      zip_code: { type: 'string', description: 'Optional ZIP code for targeted scan' },
    },
    required: ['city', 'state'],
  },
};

const analyze_str_potential: FunctionDeclaration = {
  name: 'analyze_str_potential',
  description:
    'Analyze short-term rental (Airbnb/VRBO) revenue potential for a property or area. Returns estimated annual revenue, occupancy rate, average daily rate, comparable STR listings, and an STR attractiveness score. Use when the user asks about STR potential, Airbnb income, nightly rates, or vacation rental viability.',
  parameters: {
    type: 'object',
    properties: {
      city: { type: 'string', description: 'City name, e.g. "Austin"' },
      state: { type: 'string', description: 'Two-letter state code, e.g. "TX"' },
      bedrooms: { type: 'integer', description: 'Number of bedrooms (default 2)' },
      baths: { type: 'number', description: 'Number of bathrooms (default 1.0)' },
      latitude: { type: 'number', description: 'Property latitude (optional — enables precise estimate)' },
      longitude: { type: 'number', description: 'Property longitude (optional — enables precise estimate)' },
    },
    required: ['city', 'state'],
  },
};

const get_str_market_overview: FunctionDeclaration = {
  name: 'get_str_market_overview',
  description:
    'Get a comprehensive short-term rental market overview for a city. Provides total active listings, average occupancy, ADR, RevPAR, annual revenue estimates, revenue trends, and a market health assessment. Use when the user asks about STR/Airbnb market conditions, vacation rental demand, or market-level STR performance.',
  parameters: {
    type: 'object',
    properties: {
      city: { type: 'string', description: 'City name, e.g. "Miami"' },
      state: { type: 'string', description: 'Two-letter state code, e.g. "FL"' },
    },
    required: ['city', 'state'],
  },
};

// ── NEW: High-priority tools for voice parity ──

const suggest_actions: FunctionDeclaration = {
  name: 'suggest_actions',
  description:
    'Suggest UI actions the user can take, such as navigating to a page, generating a report, or upgrading their plan. Use when the user needs to do something in the app or when you want to recommend next steps.',
  parameters: {
    type: 'object',
    properties: {
      actions: {
        type: 'string',
        description: 'JSON array of action objects, each with: label (string), tool_name (string, e.g. "navigate_to_upgrade", "generate_report"), style ("primary" or "secondary")',
      },
    },
    required: ['actions'],
  },
};

const get_property_details: FunctionDeclaration = {
  name: 'get_property_details',
  description:
    'Look up detailed information about a specific property by address. Returns full property details including valuation, tax history, owner info, and characteristics. Use when the user asks about a specific property.',
  parameters: {
    type: 'object',
    properties: {
      address: { type: 'string', description: 'Property street address' },
      city: { type: 'string', description: 'City name' },
      state: { type: 'string', description: 'Two-letter state code' },
    },
    required: ['address'],
  },
};

const compare_properties: FunctionDeclaration = {
  name: 'compare_properties',
  description:
    'Compare two or more properties side-by-side on key metrics including price, cash flow, cap rate, ROI, and more. Use when the user wants to compare properties or asks "which is the better deal?".',
  parameters: {
    type: 'object',
    properties: {
      addresses: {
        type: 'string',
        description: 'Comma-separated list of property addresses to compare',
      },
    },
    required: ['addresses'],
  },
};

const generate_report: FunctionDeclaration = {
  name: 'generate_report',
  description:
    'Generate a detailed investment analysis report for a property. The report includes financial projections, market context, risk factors, and an investment score. Use when the user asks for a report, analysis document, or PDF.',
  parameters: {
    type: 'object',
    properties: {
      address: { type: 'string', description: 'Property address' },
      city: { type: 'string', description: 'City name' },
      state: { type: 'string', description: 'Two-letter state code' },
      strategy: {
        type: 'string',
        description: 'Investment strategy',
        enum: ['LTR', 'STR', 'Flip'],
      },
    },
    required: ['address'],
  },
};

const web_search: FunctionDeclaration = {
  name: 'web_search',
  description:
    'Search the web for real-time information about real estate markets, news, regulations, economic data, or any topic the user asks about. Use when you need current information that your training data may not cover.',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'The search query' },
    },
    required: ['query'],
  },
};

// ── Mode → Tool Mapping ──

/** Hunter mode: deal finding, property search, risk detection, distress radar, STR upside */
const HUNTER_TOOLS: FunctionDeclaration[] = [
  search_properties,
  get_market_stats,
  find_comparable_sales,
  detect_deal_killers,
  calculate_cash_flow,
  scan_radar,
  analyze_str_potential,
  // Phase 3 parity tools — added incrementally to avoid setup rejection
  get_property_details,
  compare_properties,
  generate_report,
];

/** Research mode: market analysis, rental data, trends, market health radar, STR intelligence */
const RESEARCH_TOOLS: FunctionDeclaration[] = [
  get_market_stats,
  get_rental_market_overview,
  analyze_rental_income,
  find_comparable_sales,
  calculate_cash_flow,
  scan_radar,
  analyze_str_potential,
  get_str_market_overview,
  // Phase 3 parity tools
  get_property_details,
  compare_properties,
  generate_report,
];

/** Strategist mode: portfolio, scenarios, cash flow modeling, timing radar, STR strategy */
const STRATEGIST_TOOLS: FunctionDeclaration[] = [
  get_user_portfolio,
  calculate_cash_flow,
  simulate_investment_scenario,
  get_market_stats,
  search_properties,
  scan_radar,
  get_str_market_overview,
  // Phase 3 parity tools
  get_property_details,
  compare_properties,
  generate_report,
];

/**
 * Get the Gemini Live tool configuration for a given agent mode.
 * Returns the tools array to include in the setup message.
 */
export function getToolsForMode(mode: AgentMode): object[] {
  const declarations =
    mode === 'hunter'
      ? HUNTER_TOOLS
      : mode === 'research'
        ? RESEARCH_TOOLS
        : STRATEGIST_TOOLS;

  const tools: object[] = [{ functionDeclarations: declarations }];

  // Research mode gets Google Search grounding for live web data
  if (mode === 'research') {
    tools.push({ googleSearch: {} });
  }

  return tools;
}

/**
 * Get mode-specific system instruction additions for tool usage.
 * When cameraActive is true, includes additional instructions for visual property analysis.
 */
export function getToolInstructions(mode: AgentMode, cameraActive = false): string {
  const base = `\n\nTOOL USAGE INSTRUCTIONS:
- You have access to real tools that fetch live data. ALWAYS use them when the user asks about properties, markets, or investments.
- NEVER fabricate, invent, or hallucinate property listings, prices, addresses, or market statistics. Every data point you share must come from a tool result.
- When you call a tool, say a SHORT status message like "Searching now" or "Pulling that up" — then STOP and WAIT silently for the result. Do NOT continue speaking about data you haven't received yet.
- ONLY after you receive the tool response should you describe what was found. Never say "I found some properties" or "I'm seeing options" before the tool returns.
- After getting tool results, summarize the key findings conversationally. Don't read raw data — interpret it.
- If a tool returns an error or no results, say so honestly and immediately. Do NOT make up placeholder data. Suggest trying a different city, widening the price range, or adjusting filters.
- If you are unsure whether a tool succeeded, do NOT guess. Ask the user if they'd like you to try again.

USAGE LIMITS & UPGRADES:
- If a tool returns "error": "limit_reached" or "upgrade_required": true, it means the user has used all their free searches. Tell them clearly: "You've used all your free property searches. To continue searching, you'll need to upgrade to the Pro plan which gives you unlimited searches, reports, and more." Be empathetic but direct.
- If the tool result includes "free_tier_notice" with "searches_remaining", mention it naturally after presenting results. For example: "By the way, that was your last free search" or "You have one search left on your free plan."
- Do NOT hide or ignore these notices — the user needs to know their usage status.`;

  let cameraInstructions = '';
  if (cameraActive) {
    cameraInstructions = `

CAMERA MODE ACTIVE:
- The user is sharing their camera. You can see what they see in real-time.
- When scanning a property exterior: Comment on curb appeal, roof condition, siding, landscaping, lot size, neighborhood feel, and any visible red flags.
- When scanning a property interior: Comment on room condition, flooring, fixtures, natural light, layout flow, renovation needs, and estimated costs.
- When scanning documents/listings: Read key details (price, beds, baths, sqft) and offer quick analysis.
- Be proactive: If you notice something concerning, mention it without being asked.
- Keep your visual observations concise — the user is walking around, not reading an essay.
- You can combine what you see with tool data: if you see a property, offer to search for comps, check market stats, or estimate rental income.`;
  }

  if (mode === 'hunter') {
    return (
      base +
      `\n- You are in HUNTER mode. Focus on finding deals, scouting properties, and evaluating opportunities.
- Proactively search for properties when the user mentions a city or budget.
- Property search results automatically include DISTRESS SCORES for every listing. Highlight high-distress properties and suggest offer strategies based on their signals.
- Property search results may also include STR POTENTIAL data (estimated Airbnb revenue, occupancy, ADR). When present, mention the STR upside alongside the LTR analysis.
- Use analyze_str_potential when the user asks about Airbnb/STR income for a specific property or area. Compare STR revenue against LTR rent to identify the best strategy.
- Use scan_radar to find ONLY distressed deals when the user asks about motivated sellers, off-market opportunities, or pre-market intelligence.
- For distressed properties, mention the distress tier (hot/warming), key signals, and recommended action (e.g. "offer 12% below ask").
- Flag any deal killers or red flags you notice.` +
      cameraInstructions
    );
  }

  if (mode === 'research') {
    return (
      base +
      `\n- You are in RESEARCH mode. Focus on deep market analysis and data-driven insights.
- Pull market stats proactively when the user mentions a location.
- Search results include a MARKET RADAR summary with market distress index, economic outlook, vacancy trends, and price momentum. Focus on interpreting this data for the user.
- Use get_str_market_overview to analyze STR market conditions — total listings, occupancy, ADR, RevPAR, revenue trends. Compare STR vs LTR dynamics.
- Use analyze_str_potential for property-level STR revenue analysis with comparable listings and performance metrics.
- Use scan_radar to analyze market health and distress levels. Report on economic headwinds, buyer leverage, and forecast.
- Compare rental yields (both LTR and STR), analyze trends, and cite specific numbers from both data sources.
- You also have Google Search — use it for current news, regulations, or market events.` +
      cameraInstructions
    );
  }

  // Strategist
  return (
    base +
    `\n- You are in STRATEGIST mode. Focus on portfolio strategy, financial modeling, and long-term planning.
- When the user asks about their portfolio, pull it up with the portfolio tool.
- Search results include TIMING SIGNALS and portfolio exposure analysis. Use these to advise on entry timing, market comparisons, and risk.
- Use get_str_market_overview to evaluate STR market potential when advising on market selection or portfolio diversification into vacation rentals.
- When comparing markets for investment, present both LTR (RentCast) and STR (AirROI) data side by side to give a complete picture.
- Use scan_radar to check distress levels before recommending markets. Advise on optimal entry timing and opportunity windows.
- Run cash flow calculations and investment simulations to back up your advice.
- Think in terms of portfolio allocation, risk diversification, and wealth building.` +
    cameraInstructions
  );
}
