// FILE: src/utils/apiValidator.ts
/**
 * API Response Validator & Logger
 * Validates backend tool results against expected schemas and logs structure issues
 */

import { logger } from './logger';

// ============================================================================
// Expected Schema Definitions
// ============================================================================

interface ExpectedSchema {
  required: string[];
  optional?: string[];
  nested?: Record<string, ExpectedSchema>;
}

const TOOL_SCHEMAS: Record<string, ExpectedSchema> = {
  // request_pnl_calculation output (new validated format)
  request_pnl_calculation: {
    required: ['success'],
    optional: ['error', 'missing_fields', 'validation_error', 'message'],
    nested: {
      result: {
        required: ['strategy', 'year1', 'financing_summary'],
        optional: ['property_address', 'expense_breakdown', 'projections', 'insights'],
      },
    },
  },

  // calculate_pnl_tool output (legacy format)
  calculate_pnl_tool: {
    required: ['strategy'],
    optional: ['property_address', 'success', 'message'],
    nested: {
      year1: {
        required: ['monthly_cashflow', 'annual_cashflow', 'noi'],
        optional: ['gross_scheduled_income', 'vacancy_loss', 'gross_operating_income', 'total_operating_expenses', 'annual_debt_service'],
      },
      financingSummary: {
        required: ['purchase_price', 'down_payment', 'total_cash_invested'],
        optional: ['loan_amount', 'closing_costs', 'monthly_mortgage'],
      },
      metrics: {
        required: ['cap_rate', 'cash_on_cash'],
        optional: ['dscr', 'gross_rent_multiplier', 'break_even_occupancy'],
      },
      flipMetrics: {
        required: ['arv', 'net_profit', 'roi_pct'],
        optional: ['total_project_cost', 'gross_profit', 'hold_time_months', 'annualized_roi'],
      },
      insights: {
        required: ['recommendation'],
        optional: ['summary', 'pros', 'cons'],
      },
    },
  },

  // request_metrics_calculation output (new validated format)
  request_metrics_calculation: {
    required: ['success'],
    optional: ['error', 'missing_fields', 'validation_error', 'message'],
    nested: {
      result: {
        required: ['strategy', 'cash_flow_monthly', 'cap_rate', 'cash_on_cash', 'noi'],
        optional: ['gross_annual_income', 'total_annual_expenses', 'cash_flow_annual', 'dscr', 'annual_debt_service', 'breakeven_occupancy', 'operating_expense_ratio'],
      },
    },
  },

  // compute_metrics_tool output (legacy format)
  compute_metrics_tool: {
    required: ['strategy', 'cash_flow_monthly', 'cap_rate', 'cash_on_cash'],
    optional: ['noi', 'dscr', 'gross_annual_income', 'total_annual_expenses', 'cash_flow_annual', 'annual_debt_service', 'breakeven_occupancy', 'operating_expense_ratio'],
  },

  // check_compliance output
  check_compliance: {
    required: ['overall_risk_level', 'key_rules'],
    optional: ['success', 'message', 'str_legality', 'adu_feasibility', 'permits_required', 'tips', 'sources'],
    nested: {
      location: {
        required: ['city', 'state'],
        optional: ['county'],
      },
      hoa_restrictions: {
        required: [],
        optional: ['has_hoa', 'hoa_name', 'str_allowed', 'min_lease_term', 'notes'],
      },
      zoning_info: {
        required: [],
        optional: ['zone_code', 'zone_description', 'str_compatible', 'adu_compatible'],
      },
    },
  },

  // scout_properties output
  scout_properties: {
    required: ['properties'],
    optional: ['success', 'location', 'total_found', 'center_coordinates', 'str_regulations', 'message'],
  },

  // generate_report output
  generate_report: {
    required: ['report'],
    optional: ['success', 'report_id', 'report_type', 'strategy', 'recommendation', 'generated_at', 'property_address', 'message'],
    nested: {
      property_details: {
        required: [],
        optional: ['price', 'location', 'address', 'roi', 'tier', 'bedrooms', 'bathrooms', 'sqft'],
      },
      metrics: {
        required: [],
        optional: ['strategy', 'gross_annual_income', 'total_annual_expenses', 'noi', 'cap_rate', 'cash_on_cash', 'dscr'],
      },
      sections: {
        required: [],
        optional: ['executive_summary', 'property_overview', 'financial_analysis', 'market_analysis', 'risk_assessment', 'recommendation'],
      },
    },
  },

  // portfolio_analyzer_tool output
  portfolio_analyzer_tool: {
    required: ['total_properties', 'aggregate_metrics'],
    optional: ['success', 'total_value', 'total_investment', 'total_equity', 'tier_distribution', 'performance_ranking', 'recommendations', 'message'],
  },

  // cashflow_timeseries_tool output
  cashflow_timeseries_tool: {
    required: ['summary', 'monthly_breakdown'],
    optional: ['success', 'period_start', 'period_end', 'by_category', 'trends', 'message'],
  },

  // analyze_property_image output (new enhanced vision tool)
  analyze_property_image: {
    required: ['success', 'analysis_type', 'room_type', 'summary'],
    optional: ['timestamp', 'error', 'validation_errors'],
    nested: {
      condition: {
        required: ['overall'],
        optional: ['structural_issues', 'cosmetic_issues', 'safety_concerns'],
      },
      renovation_costs: {
        required: [],
        optional: ['basic_refresh', 'standard_rental', 'premium_upgrade'],
      },
      priorities: {
        required: [],
        optional: ['critical', 'high_impact', 'nice_to_have'],
      },
      image_metadata: {
        required: [],
        optional: ['format', 'width', 'height', 'mode', 'quality_warning'],
      },
    },
  },

  // analyze_renovation_from_image output (legacy vision tool)
  analyze_renovation_from_image: {
    required: ['overall_condition', 'renovation_items', 'total_estimated_cost'],
    optional: ['success', 'room_type', 'roi_impact', 'recommendations', 'message'],
  },
};

// ============================================================================
// Validation Functions
// ============================================================================

interface ValidationResult {
  isValid: boolean;
  toolName: string;
  missingRequired: string[];
  presentFields: string[];
  extraFields: string[];
  nestedIssues: Record<string, ValidationResult>;
}

function validateValue(
  value: unknown,
  type: string,
  _path: string = ''
): { isValid: boolean; error?: string } {
  // Implementation for validateValue would go here
  return { isValid: true };
}

function validateSchema(
  data: unknown,
  schema: ExpectedSchema,
  _path: string = ''
): { missingRequired: string[]; presentFields: string[]; extraFields: string[] } {
  if (!data || typeof data !== 'object') {
    return {
      missingRequired: schema.required,
      presentFields: [],
      extraFields: [],
    };
  }

  const record = data as Record<string, unknown>;
  const allExpected = [...schema.required, ...(schema.optional || [])];
  const presentFields = Object.keys(record);

  const missingRequired = schema.required.filter((key) => !(key in record));
  const extraFields = presentFields.filter((key) => !allExpected.includes(key));

  return { missingRequired, presentFields, extraFields };
}

function validateToolResult(toolName: string, data: unknown): ValidationResult {
  const schema = TOOL_SCHEMAS[toolName];

  if (!schema) {
    logger.warn(`[apiValidator] No schema defined for tool: ${toolName}`);
    return {
      isValid: true,
      toolName,
      missingRequired: [],
      presentFields: Object.keys((data as Record<string, unknown>) || {}),
      extraFields: [],
      nestedIssues: {},
    };
  }

  const { missingRequired, presentFields, extraFields } = validateSchema(data, schema);
  const nestedIssues: Record<string, ValidationResult> = {};

  // Validate nested schemas
  if (schema.nested && data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    for (const [nestedKey, nestedSchema] of Object.entries(schema.nested)) {
      if (nestedKey in record) {
        const nestedResult = validateSchema(record[nestedKey], nestedSchema, nestedKey);
        if (nestedResult.missingRequired.length > 0) {
          nestedIssues[nestedKey] = {
            isValid: nestedResult.missingRequired.length === 0,
            toolName: `${toolName}.${nestedKey}`,
            ...nestedResult,
            nestedIssues: {},
          };
        }
      }
    }
  }

  const isValid = missingRequired.length === 0 && Object.keys(nestedIssues).length === 0;

  return {
    isValid,
    toolName,
    missingRequired,
    presentFields,
    extraFields,
    nestedIssues,
  };
}

// ============================================================================
// Logging Functions
// ============================================================================

/**
 * Log and validate a tool result from the backend
 */
export function logToolResult(toolName: string, data: unknown, context?: string): void {
  const prefix = context ? `[${context}]` : '';

  // Log raw data structure
  logger.debug(`${prefix} Tool Result: ${toolName}`, {
    toolName,
    hasData: !!data,
    dataType: typeof data,
    keys: data && typeof data === 'object' ? Object.keys(data) : [],
  });

  // Validate against schema
  const validation = validateToolResult(toolName, data);

  if (validation.isValid) {
    logger.info(`${prefix} ✅ ${toolName} - Valid structure`, {
      presentFields: validation.presentFields,
    });
  } else {
    logger.warn(`${prefix} ⚠️ ${toolName} - Schema mismatch`, {
      missingRequired: validation.missingRequired,
      extraFields: validation.extraFields,
      nestedIssues: Object.keys(validation.nestedIssues),
    });
  }

  // Log nested issues
  for (const [key, issue] of Object.entries(validation.nestedIssues)) {
    logger.warn(`${prefix} ⚠️ ${toolName}.${key} - Missing fields`, {
      missingRequired: issue.missingRequired,
    });
  }
}

/**
 * Log the full API response structure for debugging
 */
export function logApiResponse(endpoint: string, response: unknown): void {
  if (!response || typeof response !== 'object') {
    logger.warn(`[API] ${endpoint} - Invalid response type: ${typeof response}`);
    return;
  }

  const record = response as Record<string, unknown>;

  logger.info(`[API] ${endpoint} - Response structure`, {
    hasMessage: 'message' in record,
    hasData: 'data' in record,
    hasToolResults: 'tool_results' in record || ('data' in record && record.data && typeof record.data === 'object' && 'tool_results' in (record.data as object)),
    hasThreadId: 'thread_id' in record,
    topLevelKeys: Object.keys(record),
  });

  // Check for tool_results in data
  const data = record.data as Record<string, unknown> | undefined;
  if (data?.tool_results) {
    const toolResults = data.tool_results;

    if (Array.isArray(toolResults)) {
      logger.info(`[API] ${endpoint} - Found ${toolResults.length} tool results`, {
        tools: toolResults.map((tr: any) => tr.tool_name || tr.kind || 'unknown'),
      });

      // Validate each tool result
      toolResults.forEach((tr: any, index: number) => {
        const toolName = tr.tool_name || tr.kind || 'unknown';
        logToolResult(toolName, tr.data || tr, `API:${endpoint}[${index}]`);
      });
    } else if (typeof toolResults === 'object') {
      logger.info(`[API] ${endpoint} - Found tool results object`, {
        keys: Object.keys(toolResults),
      });
    }
  } else {
    logger.debug(`[API] ${endpoint} - No tool_results in response`);
  }
}

/**
 * Log chat message with tool cards
 */
export function logMessageToolCards(messageId: string, tools: unknown[]): void {
  if (!tools || tools.length === 0) {
    logger.debug(`[Message:${messageId}] No tool cards attached`);
    return;
  }

  logger.info(`[Message:${messageId}] ${tools.length} tool cards attached`, {
    kinds: tools.map((t: any) => t.kind || 'unknown'),
    statuses: tools.map((t: any) => t.status || 'unknown'),
  });

  tools.forEach((tool: any, index: number) => {
    if (tool.kind && tool.data) {
      logToolResult(tool.kind, tool.data, `Message:${messageId}[${index}]`);
    }
  });
}

/**
 * Create a summary of what tool results were received
 */
export function summarizeToolResults(toolResults: unknown): string {
  if (!toolResults) return 'No tool results';

  if (Array.isArray(toolResults)) {
    const tools = toolResults.map((tr: any) => tr.tool_name || tr.kind || 'unknown');
    return `${toolResults.length} results: ${tools.join(', ')}`;
  }

  if (typeof toolResults === 'object') {
    return `Object with keys: ${Object.keys(toolResults).join(', ')}`;
  }

  return `Unknown type: ${typeof toolResults}`;
}

export { validateToolResult, type ValidationResult };
