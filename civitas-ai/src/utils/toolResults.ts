import type { ToolCard } from '@/types/chat';
import type { ToolResultRecord, ToolResultStatus } from '@/types/toolResults';
import type { ComplianceResult } from '@/types/compliance';
import type { DealAnalyzerData } from '@/components/chat/tool-cards/DealAnalyzerCard';
import { pnlOutputToCardData } from '@/components/chat/tool-cards/DealAnalyzerCard';
import type { ValuationData } from '@/components/chat/tool-cards/ValuationCard';
import { valuationResponseToCardData } from '@/components/chat/tool-cards/ValuationCard';
import type { PnLOutput } from '@/types/pnl';
import { logger } from './logger';

interface RawToolResult {
  id?: string;
  tool_name?: string;
  name?: string;
  kind?: string;
  title?: string;
  headline?: string;
  summary?: string;
  description?: string;
  status?: string;
  state?: string;
  timestamp?: string;
  inputs?: Record<string, unknown>;
  data?: unknown;
  payload?: unknown;
  result?: unknown;
  output?: unknown;
  fullOutput?: unknown;
  pnl_output?: unknown;
  presentation?: unknown;
}

const DEFAULT_TITLES: Record<string, string> = {
  roi_analysis: 'ROI Analysis',
  market_data: 'Market Analysis',
  property_comparison: 'Property Search Results',
  property_comparison_table: 'Property Comparison',
  alert: 'Alert',
  deal_analyzer: 'P&L Analysis',
  compliance_check: 'Compliance Overview',
  valuation: 'Valuation Analysis',
  portfolio_analysis: 'Portfolio Analysis',
  cashflow_timeseries: 'Cashflow Trends',
  renovation_analysis: 'Renovation Analysis',
  report: 'Investment Report',
  // Backend tool names
  scout_properties: 'Property Search Results',
  compare_properties: 'Property Comparison',
  request_financial_analysis: 'P&L Analysis',               // Current financial analysis tool
  request_pnl_calculation: 'P&L Analysis (Validated)',      // New validated PNL tool
  request_flip_analysis: 'Flip Analysis',                   // New dedicated Flip tool
  calculate_pnl_tool: 'P&L Analysis',                       // Legacy PNL tool
  request_metrics_calculation: 'Deal Metrics (Validated)',  // New validated metrics tool
  compute_metrics_tool: 'Deal Metrics Summary',             // Legacy metrics tool
  check_compliance: 'Compliance Overview',
  get_market_stats: 'Market Statistics',
  portfolio_analyzer_tool: 'Portfolio Analysis',
  cashflow_timeseries_tool: 'Cashflow Trends',
  analyze_property_image: 'Property Image Analysis',         // New enhanced vision tool
  analyze_renovation_from_image: 'Renovation Analysis',      // Legacy vision tool
  generate_report: 'Investment Report',
  generated_report: 'Investment Report',
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;

const getStringFromRecord = (record: Record<string, unknown> | undefined, key: string): string | undefined =>
  record ? getString(record[key]) : undefined;

const looksLikeToolResult = (value: unknown): value is RawToolResult => {
  if (!isObject(value)) return false;
  return (
    'tool_name' in value ||
    'kind' in value ||
    'title' in value ||
    'summary' in value ||
    'data' in value ||
    'result' in value
  );
};

const toTitleCase = (value?: string): string | undefined => {
  if (!value) return undefined;
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
};

const deriveKind = (rawKind?: string, toolName?: string): ToolCard['kind'] | undefined => {
  const candidate = (rawKind || toolName || '').toLowerCase();
  switch (candidate) {
    case 'roi':
    case 'roi_analysis':
      return 'roi_analysis';
    case 'market':
    case 'market_data':
    case 'get_market_stats': // Backend tool name
    case 'market_stats':
      return 'market_data';
    case 'comparison':
    case 'property_comparison':
    case 'scout_properties': // Backend tool name
      return 'property_comparison';
    case 'compare_properties': // Backend tool name for comparison table
    case 'property_comparison_table':
      return 'property_comparison_table';
    case 'alert':
      return 'alert';
    case 'deal_analyzer':
    case 'deal_analysis':
    case 'pnl':
    case 'pnl_analysis':
    case 'pnl_calculation':
    case 'request_financial_analysis':   // Current financial analysis tool
    case 'request_pnl_calculation':      // New validated PNL tool
    case 'request_flip_analysis':        // New dedicated Flip tool
    case 'calculate_pnl_tool':           // Legacy PNL tool
    case 'request_metrics_calculation':  // New validated metrics tool
    case 'compute_metrics_tool':         // Legacy metrics tool
      return 'deal_analyzer';
    case 'compliance_check':
    case 'compliance':
    case 'str_compliance':
    case 'check_compliance': // Backend tool name
      return 'compliance_check';
    case 'valuation':
    case 'valuation_analysis':
    case 'str_valuation':
    case 'property_valuation':
      return 'valuation';
    case 'portfolio_analyzer_tool': // Backend tool name
    case 'portfolio_analyzer':
    case 'portfolio':
      return 'portfolio_analysis';
    case 'cashflow_timeseries_tool': // Backend tool name
    case 'cashflow_timeseries':
    case 'cashflow':
      return 'cashflow_timeseries';
    case 'analyze_property_image':        // New enhanced vision tool
    case 'analyze_renovation_from_image': // Legacy vision tool
    case 'renovation_analysis':
    case 'property_image_analysis':
    case 'vision':
      return 'renovation_analysis';
    case 'generate_report': // Backend tool name
    case 'generated_report':
      return 'generated_report';
    case 'report':
      return 'alert';
    case 'draft_email':
    case 'send_email':
      return 'send_email';
    case 'draft_text':
    case 'send_text':
      return 'send_text';
    default:
      return undefined;
  }
};

const deriveStatus = (status?: string): ToolResultStatus => {
  if (!status) return 'success';
  const normalized = status.toLowerCase();
  if (normalized.includes('error') || normalized.includes('fail')) {
    return 'error';
  }
  if (normalized.includes('warn')) {
    return 'warning';
  }
  return 'success';
};

const coercePayload = (raw: RawToolResult): unknown =>
  raw.data ?? raw.result ?? raw.output ?? raw.payload ?? raw.pnl_output ?? raw.fullOutput;

const isDealAnalyzerData = (value: unknown): value is DealAnalyzerData => {
  if (!isObject(value)) return false;
  const record = value as Record<string, unknown>;
  if (typeof record['strategy'] !== 'string') return false;
  if (!isObject(record['pnlSummary'])) return false;
  const summary = record['pnlSummary'] as Record<string, unknown>;
  return typeof summary['monthlyCashflow'] === 'number';
};

const isPnLOutput = (value: unknown): value is PnLOutput => {
  if (!isObject(value)) return false;
  const record = value as Record<string, unknown>;
  return isObject(record['meta']) && isObject(record['year1']) && isObject(record['financingSummary']);
};

const isComplianceResult = (value: unknown): value is ComplianceResult => {
  if (!isObject(value)) return false;
  const record = value as Record<string, unknown>;
  return typeof record['overall_risk_level'] === 'string' && Array.isArray(record['key_rules']);
};

// Type guard for backend's CalculatePnLOutput format (legacy calculate_pnl_tool)
const isBackendPnLOutput = (value: unknown): boolean => {
  if (!isObject(value)) return false;
  const record = value as Record<string, unknown>;
  // Backend format has: strategy, year1, financingSummary, metrics
  return (
    typeof record['strategy'] === 'string' &&
    isObject(record['year1']) &&
    isObject(record['financingSummary']) &&
    isObject(record['metrics'])
  );
};

// Type guard for new validated PNL format (request_pnl_calculation)
const isValidatedPnLOutput = (value: unknown): boolean => {
  if (!isObject(value)) return false;
  const record = value as Record<string, unknown>;
  // New format: {success: true, result: {strategy, year1, financing_summary}}
  if (typeof record['success'] !== 'boolean') return false;
  if (!record['success']) return false; // Only handle success cases here
  const result = record['result'];
  if (!isObject(result)) return false;
  const resultRecord = result as Record<string, unknown>;
  return (
    typeof resultRecord['strategy'] === 'string' &&
    isObject(resultRecord['year1']) &&
    isObject(resultRecord['financing_summary'])
  );
};

// Type guard for failed PNL validation (request_pnl_calculation with success=false)
const isFailedPnLValidation = (value: unknown): boolean => {
  if (!isObject(value)) return false;
  const record = value as Record<string, unknown>;
  return record['success'] === false;
};

// Convert failed PNL validation to error data for display
const failedPnLToErrorData = (output: Record<string, unknown>): DealAnalyzerData => {
  return {
    strategy: 'LTR', // Default strategy for error cases
    pnlSummary: {
      monthlyCashflow: 0,
      cashOnCash: 0,
      capRate: 0,
      noi: 0,
    },
    validationError: {
      error: output['error'] as string | undefined,
      missingFields: output['missing_fields'] as string[] | undefined,
      validationMessage: output['validation_error'] as string | undefined,
      message: output['message'] as string | undefined,
    },
  };
};

// Convert new validated PNL format to DealAnalyzerData
const validatedPnLToCardData = (output: Record<string, unknown>, propertyAddress?: string): DealAnalyzerData => {
  const result = output['result'] as Record<string, unknown>;
  const strategy = result['strategy'] as string;
  const year1 = result['year1'] as Record<string, unknown>;
  const financing = result['financing_summary'] as Record<string, unknown>;
  const insights = result['insights'] as Record<string, unknown> | undefined;
  const flipMetrics = year1['flip'] as Record<string, unknown> | undefined;

  // New format uses cashflow_before_taxes (annual), need to divide by 12 for monthly
  const annualCashflow = (year1['cashflow_before_taxes'] as number) ?? 0;
  const monthlyCashflow = annualCashflow / 12;

  const isFlip = strategy === 'Flip';

  return {
    strategy: strategy as 'STR' | 'LTR' | 'ADU' | 'MF' | 'Flip',
    propertyId: null,
    propertyAddress: propertyAddress ?? result['property_address'] as string | undefined,
    pnlSummary: {
      monthlyCashflow,
      annualCashflow,
      capRate: (year1['cap_rate'] as number) ?? 0,
      cashOnCash: (year1['cash_on_cash_return'] as number) ?? 0,
      noi: (year1['noi'] as number) ?? 0,
      dscr: (year1['dscr'] as number) ?? 0,
      grossRevenue: (year1['gross_potential_income'] as number) ?? (year1['effective_gross_income'] as number) ?? 0,
    },
    financingSummary: {
      purchasePrice: (financing['purchase_price'] as number) ?? 0,
      downPayment: (financing['down_payment'] as number) ?? 0,
      loanAmount: (financing['loan_amount'] as number) ?? 0,
      closingCosts: (financing['closing_costs'] as number) ?? 0,
      totalCashInvested: (financing['total_cash_invested'] as number) ?? 0,
      monthlyMortgage: (financing['monthly_mortgage'] as number) ?? 0,
    },
    flipMetrics: isFlip && flipMetrics ? {
      arv: (flipMetrics['arv'] as number) ?? 0,
      totalProjectCost: ((flipMetrics['rehab_cost'] as number) ?? 0) + ((financing['purchase_price'] as number) ?? 0), // Approx total cost
      grossProfit: (flipMetrics['projected_profit'] as number) ?? 0, // Using projected profit as gross for now
      netProfit: (flipMetrics['projected_profit'] as number) ?? 0,
      roiPct: (flipMetrics['hold_time_roi'] as number) ?? 0,
      holdTimeMonths: (flipMetrics['hold_time_months'] as number) ?? 6,
      annualizedRoi: flipMetrics['annualized_roi'] as number | undefined,
    } : undefined,
    recommendation: insights ? {
      verdict: (insights['recommendation'] as 'BUY' | 'NEGOTIATE' | 'PASS') ?? 'NEGOTIATE',
      summary: (insights['summary'] as string) ?? '',
      pros: insights['pros'] as string[] | undefined,
      cons: insights['cons'] as string[] | undefined,
    } : undefined,
    isValidated: true, // Mark as validated
  };
};

// Convert backend CalculatePnLOutput to DealAnalyzerData (legacy format)
const backendPnLToCardData = (output: Record<string, unknown>, propertyAddress?: string): DealAnalyzerData => {
  const strategy = output['strategy'] as string;
  const year1 = output['year1'] as Record<string, unknown>;
  const financing = output['financingSummary'] as Record<string, unknown>;
  const metrics = output['metrics'] as Record<string, unknown>;
  const flipMetrics = output['flipMetrics'] as Record<string, unknown> | undefined;
  const insights = output['insights'] as Record<string, unknown> | undefined;

  // Map to DealAnalyzerData format
  const isFlip = strategy === 'Flip';

  return {
    strategy: strategy as 'STR' | 'LTR' | 'ADU' | 'MF' | 'Flip',
    propertyId: output['property_id'] as string | null ?? null,
    propertyAddress: propertyAddress ?? output['property_address'] as string | undefined,
    pnlSummary: {
      monthlyCashflow: (year1['monthly_cashflow'] as number) ?? 0,
      annualCashflow: (year1['annual_cashflow'] as number) ?? 0,
      capRate: (metrics['cap_rate'] as number) ?? 0,
      cashOnCash: (metrics['cash_on_cash'] as number) ?? 0,
      noi: (year1['noi'] as number) ?? 0,
      dscr: (metrics['dscr'] as number) ?? 0,
      grossRevenue: (year1['gross_scheduled_income'] as number) ?? 0,
    },
    financingSummary: {
      purchasePrice: (financing['purchase_price'] as number) ?? 0,
      downPayment: (financing['down_payment'] as number) ?? 0,
      loanAmount: (financing['loan_amount'] as number) ?? 0,
      closingCosts: (financing['closing_costs'] as number) ?? 0,
      totalCashInvested: (financing['total_cash_invested'] as number) ?? 0,
      monthlyMortgage: (financing['monthly_mortgage'] as number) ?? 0,
    },
    flipMetrics: isFlip && flipMetrics ? {
      arv: (flipMetrics['arv'] as number) ?? 0,
      totalProjectCost: (flipMetrics['total_project_cost'] as number) ?? 0,
      grossProfit: (flipMetrics['gross_profit'] as number) ?? 0,
      netProfit: (flipMetrics['net_profit'] as number) ?? 0,
      roiPct: (flipMetrics['roi_pct'] as number) ?? 0,
      holdTimeMonths: (flipMetrics['hold_time_months'] as number) ?? 6,
      annualizedRoi: flipMetrics['annualized_roi'] as number | undefined,
    } : undefined,
    recommendation: insights ? {
      verdict: (insights['recommendation'] as 'BUY' | 'NEGOTIATE' | 'PASS') ?? 'NEGOTIATE',
      summary: (insights['summary'] as string) ?? '',
      pros: (insights['pros'] as string[]) ?? [],
      cons: (insights['cons'] as string[]) ?? [],
    } : undefined,
  };
};

// ============================================================================
// Metrics Calculation Type Guards & Converters
// ============================================================================

// Type guard for new validated metrics format (request_metrics_calculation with success=true)
const isValidatedMetricsOutput = (value: unknown): boolean => {
  if (!isObject(value)) return false;
  const record = value as Record<string, unknown>;
  if (typeof record['success'] !== 'boolean') return false;
  if (!record['success']) return false;
  const result = record['result'];
  if (!isObject(result)) return false;
  const resultRecord = result as Record<string, unknown>;
  return (
    typeof resultRecord['strategy'] === 'string' &&
    typeof resultRecord['cash_flow_monthly'] === 'number' &&
    typeof resultRecord['cap_rate'] === 'number' &&
    typeof resultRecord['cash_on_cash'] === 'number'
  );
};

// Type guard for legacy compute_metrics_tool output
const isLegacyMetricsOutput = (value: unknown): boolean => {
  if (!isObject(value)) return false;
  const record = value as Record<string, unknown>;
  // Legacy format has direct access to metrics fields
  return (
    typeof record['strategy'] === 'string' &&
    typeof record['cash_flow_monthly'] === 'number' &&
    typeof record['cap_rate'] === 'number' &&
    typeof record['cash_on_cash'] === 'number' &&
    !('result' in record) // Not the new format
  );
};

// Convert new validated metrics format to DealAnalyzerData
const validatedMetricsToCardData = (output: Record<string, unknown>, propertyAddress?: string): DealAnalyzerData => {
  const result = output['result'] as Record<string, unknown>;
  const strategy = result['strategy'] as string;

  return {
    strategy: strategy as 'STR' | 'LTR' | 'ADU' | 'MF' | 'Flip',
    propertyId: null,
    propertyAddress,
    pnlSummary: {
      monthlyCashflow: (result['cash_flow_monthly'] as number) ?? 0,
      annualCashflow: (result['cash_flow_annual'] as number) ?? 0,
      capRate: (result['cap_rate'] as number) ?? 0,
      cashOnCash: (result['cash_on_cash'] as number) ?? 0,
      noi: (result['noi'] as number) ?? 0,
      dscr: (result['dscr'] as number) ?? 0,
      grossRevenue: (result['gross_annual_income'] as number) ?? 0,
    },
    isValidated: true,
  };
};

// Convert legacy metrics format to DealAnalyzerData
const legacyMetricsToCardData = (output: Record<string, unknown>, propertyAddress?: string): DealAnalyzerData => {
  const strategy = output['strategy'] as string;

  return {
    strategy: (strategy as 'STR' | 'LTR' | 'ADU' | 'MF' | 'Flip') ?? 'LTR',
    propertyId: null,
    propertyAddress,
    pnlSummary: {
      monthlyCashflow: (output['cash_flow_monthly'] as number) ?? 0,
      annualCashflow: (output['cash_flow_annual'] as number) ?? 0,
      capRate: (output['cap_rate'] as number) ?? 0,
      cashOnCash: (output['cash_on_cash'] as number) ?? 0,
      noi: (output['noi'] as number) ?? 0,
      dscr: (output['dscr'] as number) ?? 0,
      grossRevenue: (output['gross_annual_income'] as number) ?? 0,
    },
  };
};

const extractDealAnalyzerData = (raw: RawToolResult): DealAnalyzerData | undefined => {
  const payload = coercePayload(raw);
  if (isDealAnalyzerData(payload)) {
    return payload;
  }

  const payloadRecord = isObject(payload) ? (payload as Record<string, unknown>) : undefined;

  // Check for failed PNL validation (request_pnl_calculation with success=false)
  if (payloadRecord && isFailedPnLValidation(payloadRecord)) {
    return failedPnLToErrorData(payloadRecord);
  }

  // Check for nested data object with failed validation
  if (payloadRecord && isObject(payloadRecord['data']) && isFailedPnLValidation(payloadRecord['data'] as Record<string, unknown>)) {
    return failedPnLToErrorData(payloadRecord['data'] as Record<string, unknown>);
  }

  // Check for new validated PNL format (request_pnl_calculation with success=true)
  if (payloadRecord && isValidatedPnLOutput(payloadRecord)) {
    const inputsRecord = raw.inputs as Record<string, unknown> | undefined;
    const result = payloadRecord['result'] as Record<string, unknown>;
    const propertyAddress = getStringFromRecord(inputsRecord, 'address')
      ?? getStringFromRecord(result, 'property_address');
    return validatedPnLToCardData(payloadRecord, propertyAddress);
  }

  // Check for nested data object with new validated format
  if (payloadRecord && isObject(payloadRecord['data']) && isValidatedPnLOutput(payloadRecord['data'] as Record<string, unknown>)) {
    const data = payloadRecord['data'] as Record<string, unknown>;
    const inputsRecord = raw.inputs as Record<string, unknown> | undefined;
    const result = data['result'] as Record<string, unknown>;
    const propertyAddress = getStringFromRecord(inputsRecord, 'address')
      ?? getStringFromRecord(result, 'property_address');
    return validatedPnLToCardData(data, propertyAddress);
  }

  // Check for backend CalculatePnLOutput format (legacy calculate_pnl_tool)
  if (payloadRecord && isBackendPnLOutput(payloadRecord)) {
    const inputsRecord = raw.inputs as Record<string, unknown> | undefined;
    const propertyAddress = getStringFromRecord(inputsRecord, 'address')
      ?? getStringFromRecord(payloadRecord, 'property_address');
    return backendPnLToCardData(payloadRecord, propertyAddress);
  }

  // Check for nested data object with legacy backend format
  if (payloadRecord && isObject(payloadRecord['data']) && isBackendPnLOutput(payloadRecord['data'] as Record<string, unknown>)) {
    const data = payloadRecord['data'] as Record<string, unknown>;
    const inputsRecord = raw.inputs as Record<string, unknown> | undefined;
    const propertyAddress = getStringFromRecord(inputsRecord, 'address')
      ?? getStringFromRecord(data, 'property_address');
    return backendPnLToCardData(data, propertyAddress);
  }

  // Check for new validated metrics format (request_metrics_calculation with success=true)
  if (payloadRecord && isValidatedMetricsOutput(payloadRecord)) {
    const inputsRecord = raw.inputs as Record<string, unknown> | undefined;
    const propertyAddress = getStringFromRecord(inputsRecord, 'address');
    return validatedMetricsToCardData(payloadRecord, propertyAddress);
  }

  // Check for nested data object with new validated metrics format
  if (payloadRecord && isObject(payloadRecord['data']) && isValidatedMetricsOutput(payloadRecord['data'] as Record<string, unknown>)) {
    const data = payloadRecord['data'] as Record<string, unknown>;
    const inputsRecord = raw.inputs as Record<string, unknown> | undefined;
    const propertyAddress = getStringFromRecord(inputsRecord, 'address');
    return validatedMetricsToCardData(data, propertyAddress);
  }

  // Check for legacy compute_metrics_tool format
  if (payloadRecord && isLegacyMetricsOutput(payloadRecord)) {
    const inputsRecord = raw.inputs as Record<string, unknown> | undefined;
    const propertyAddress = getStringFromRecord(inputsRecord, 'address');
    return legacyMetricsToCardData(payloadRecord, propertyAddress);
  }

  // Check for nested data object with legacy metrics format
  if (payloadRecord && isObject(payloadRecord['data']) && isLegacyMetricsOutput(payloadRecord['data'] as Record<string, unknown>)) {
    const data = payloadRecord['data'] as Record<string, unknown>;
    const inputsRecord = raw.inputs as Record<string, unknown> | undefined;
    const propertyAddress = getStringFromRecord(inputsRecord, 'address');
    return legacyMetricsToCardData(data, propertyAddress);
  }

  // Legacy PnLOutput format (frontend calculator)
  const nestedPnLOutput = (() => {
    if (isPnLOutput(payload)) return payload;
    if (!payloadRecord) return undefined;
    const fromPnlOutput = payloadRecord['pnl_output'];
    if (isPnLOutput(fromPnlOutput)) return fromPnlOutput;
    const fromFullOutput = payloadRecord['fullOutput'];
    if (isPnLOutput(fromFullOutput)) return fromFullOutput;
    return undefined;
  })();

  if (nestedPnLOutput) {
    const inputsRecord = raw.inputs as Record<string, unknown> | undefined;
    const propertyIdFromInputs = getStringFromRecord(inputsRecord, 'propertyId')
      ?? getStringFromRecord(inputsRecord, 'property_id');
    const propertyAddressFromInputs = getStringFromRecord(inputsRecord, 'propertyAddress')
      ?? getStringFromRecord(inputsRecord, 'property_address');
    const propertyAddressFromPayload = getStringFromRecord(payloadRecord, 'propertyAddress');
    const propertyAddress = propertyAddressFromInputs || propertyAddressFromPayload;
    const propertyIdCandidate = propertyIdFromInputs ?? (typeof nestedPnLOutput.meta?.propertyId === 'string' ? nestedPnLOutput.meta.propertyId : null);
    return pnlOutputToCardData(nestedPnLOutput, propertyIdCandidate ?? null, propertyAddress);
  }
  return undefined;
};

const extractComplianceData = (raw: RawToolResult): ComplianceResult | undefined => {
  const payload = coercePayload(raw);
  if (isComplianceResult(payload)) {
    return payload;
  }
  if (isObject(payload)) {
    if (isComplianceResult(payload.result)) {
      return payload.result;
    }
    if (isComplianceResult(payload.data)) {
      return payload.data;
    }
  }
  return undefined;
};

const isValuationResponse = (value: unknown): value is {
  cash_on_cash_roi: number;
  cap_rate: number;
  monthly_cash_flow: number;
  [key: string]: unknown;
} => {
  if (!isObject(value)) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record['cash_on_cash_roi'] === 'number' &&
    typeof record['cap_rate'] === 'number' &&
    typeof record['monthly_cash_flow'] === 'number'
  );
};

const extractValuationData = (raw: RawToolResult): ValuationData | undefined => {
  const payload = coercePayload(raw);

  // Check if payload is already ValuationData-like
  if (isValuationResponse(payload)) {
    const inputsRecord = raw.inputs as Record<string, unknown> | undefined;
    const propertyData = inputsRecord?.['property_data'] as Record<string, unknown> | undefined;
    const propertyAddress = getStringFromRecord(inputsRecord, 'property_address')
      ?? getStringFromRecord(propertyData, 'address')
      ?? (propertyData ? `${propertyData['city'] ?? ''}, ${propertyData['state'] ?? ''}`.trim().replace(/^,|,$/g, '') : undefined);

    // Extract compliance summary if present
    const complianceSummary = (() => {
      const compliance = (payload as Record<string, unknown>)['compliance_summary'];
      if (isObject(compliance)) {
        const c = compliance as Record<string, unknown>;
        if (typeof c['overall_risk_level'] === 'string') {
          return {
            overall_risk_level: c['overall_risk_level'] as 'low' | 'medium' | 'high',
            key_issues: Array.isArray(c['key_issues']) ? c['key_issues'].filter((i): i is string => typeof i === 'string') : undefined,
            permits_required: typeof c['permits_required'] === 'number' ? c['permits_required'] : undefined,
          };
        }
      }
      return undefined;
    })();

    // Extract appreciation data if present
    const appreciation = (() => {
      const appr = (payload as Record<string, unknown>)['appreciation'];
      if (isObject(appr)) {
        const a = appr as Record<string, unknown>;
        if (typeof a['years'] === 'number' && typeof a['percent'] === 'number') {
          return {
            years: a['years'],
            percent: a['percent'],
            source: typeof a['source'] === 'string' ? a['source'] : undefined,
            vintage: typeof a['vintage'] === 'string' ? a['vintage'] : undefined,
          };
        }
      }
      return undefined;
    })();

    // Extract risk factors if present
    const riskFactors = (() => {
      const rf = (payload as Record<string, unknown>)['risk_factors'];
      if (isObject(rf)) {
        return rf as ValuationData['risk_factors'];
      }
      return undefined;
    })();

    return valuationResponseToCardData(payload, {
      property_address: propertyAddress,
      strategy: typeof (payload as Record<string, unknown>)['strategy'] === 'string'
        ? ((payload as Record<string, unknown>)['strategy'] as 'STR' | 'LTR')
        : 'STR',
      flip_roi: typeof (payload as Record<string, unknown>)['flip_roi'] === 'number'
        ? (payload as Record<string, unknown>)['flip_roi'] as number
        : undefined,
      noi: typeof (payload as Record<string, unknown>)['noi'] === 'number'
        ? (payload as Record<string, unknown>)['noi'] as number
        : undefined,
      total_investment: typeof (payload as Record<string, unknown>)['total_investment'] === 'number'
        ? (payload as Record<string, unknown>)['total_investment'] as number
        : undefined,
      appreciation,
      risk_factors: riskFactors,
      overall_risk_level: typeof (payload as Record<string, unknown>)['overall_risk_level'] === 'string'
        ? (payload as Record<string, unknown>)['overall_risk_level'] as 'low' | 'medium' | 'high'
        : undefined,
      compliance_summary: complianceSummary,
    });
  }

  // Check for nested valuation object
  if (isObject(payload)) {
    const valuation = (payload as Record<string, unknown>)['valuation'];
    if (isValuationResponse(valuation)) {
      const inputsRecord = raw.inputs as Record<string, unknown> | undefined;
      const propertyData = inputsRecord?.['property_data'] as Record<string, unknown> | undefined;
      const propertyAddress = getStringFromRecord(inputsRecord, 'property_address')
        ?? getStringFromRecord(propertyData, 'address')
        ?? (propertyData ? `${propertyData['city'] ?? ''}, ${propertyData['state'] ?? ''}`.trim().replace(/^,|,$/g, '') : undefined);

      return valuationResponseToCardData(valuation, {
        property_address: propertyAddress,
        strategy: 'STR',
      });
    }
  }

  return undefined;
};

// ============================================================================
// Vision Analysis Data Extractor
// ============================================================================

const extractVisionData = (raw: RawToolResult): Record<string, unknown> | undefined => {
  const payload = coercePayload(raw);
  if (!payload || !isObject(payload)) return undefined;

  const payloadRecord = payload as Record<string, unknown>;

  // Check if it's nested in a 'data' field
  const data = isObject(payloadRecord['data'])
    ? payloadRecord['data'] as Record<string, unknown>
    : payloadRecord;

  // New enhanced format (analyze_property_image)
  if (typeof data['analysis_type'] === 'string' || typeof data['success'] === 'boolean') {
    return {
      success: data['success'] ?? true,
      analysis_type: data['analysis_type'] ?? 'renovation',
      room_type: data['room_type'] ?? 'auto',
      timestamp: data['timestamp'],
      condition: data['condition'],
      renovation_costs: data['renovation_costs'],
      priorities: data['priorities'],
      recommendations: data['recommendations'],
      summary: data['summary'] ?? data['message'],
      image_metadata: data['image_metadata'],
      error: data['error'],
      validation_errors: data['validation_errors'],
    };
  }

  // Legacy format (analyze_renovation_from_image) - convert to new format
  if (typeof data['overall_condition'] === 'string' || data['renovation_items']) {
    const totalCost = data['total_estimated_cost'] as Record<string, number> | undefined;
    const hasValidCosts = totalCost && (totalCost.low > 0 || totalCost.high > 0);
    return {
      success: data['success'] ?? true,
      analysis_type: 'renovation',
      room_type: data['room_type'] ?? 'auto',
      renovation_costs: hasValidCosts ? {
        basic_refresh: totalCost.low > 0 ? { total: totalCost.low, breakdown: [] } : undefined,
        standard_rental: (totalCost.low > 0 && totalCost.high > 0)
          ? { total: Math.round((totalCost.low + totalCost.high) / 2), breakdown: [] }
          : undefined,
        premium_upgrade: totalCost.high > 0 ? { total: totalCost.high, breakdown: [] } : undefined,
      } : undefined,
      summary: data['message'] ?? 'Renovation analysis complete',
    };
  }

  // Fallback - just return the payload as-is
  return payloadRecord;
};

const toolResultToCard = (raw: RawToolResult): ToolCard | null => {
  const kind = deriveKind(raw.kind, raw.tool_name || raw.name);
  // SUPPRESSED: These tools work silently (no success cards shown)
  const toolName = raw.tool_name || raw.name;
  const suppressedTools = ['get_market_stats', 'scan_market', 'hunt_deals', 'scout_properties'];
  if (toolName && suppressedTools.includes(toolName)) return null;
  const status = deriveStatus(raw.status || raw.state);
  const title = raw.title || raw.headline || DEFAULT_TITLES[kind ?? ''] || toTitleCase(raw.tool_name || raw.name) || 'Tool Result';
  const description = raw.summary || raw.description || raw.headline || '';
  const id = raw.id || `${raw.tool_name || kind || 'tool'}-${raw.timestamp || Date.now()}`;

  const base: ToolCard = {
    id,
    title,
    description,
    status,
    kind: kind ?? 'generic',
    data: undefined,
  };

  if (kind === 'deal_analyzer') {
    const dealAnalyzerData = extractDealAnalyzerData(raw);
    if (!dealAnalyzerData) return null;
    return { ...base, data: dealAnalyzerData };
  }

  if (kind === 'compliance_check') {
    const compliance = extractComplianceData(raw);
    if (!compliance) return null;
    return { ...base, data: compliance };
  }

  if (kind === 'valuation') {
    const valuationData = extractValuationData(raw);
    if (!valuationData) return null;
    return { ...base, data: valuationData };
  }

  if (kind === 'renovation_analysis') {
    const visionData = extractVisionData(raw);
    if (!visionData) return null;
    return { ...base, data: visionData };
  }

  const payload = coercePayload(raw);
  if (!payload && base.kind === 'generic') {
    return null;
  }
  return { ...base, data: payload };
};

const toRecord = (raw: RawToolResult): ToolResultRecord => {
  const kind = deriveKind(raw.kind, raw.tool_name || raw.name);
  return {
    id: raw.id || `${raw.tool_name || kind || 'tool'}-${raw.timestamp || Date.now()}`,
    tool_name: raw.tool_name || raw.name || kind || 'tool',
    title: raw.title || raw.headline || DEFAULT_TITLES[kind ?? ''] || toTitleCase(raw.tool_name || raw.name) || 'Tool Result',
    summary: raw.summary || raw.description || raw.headline || 'Result ready',
    inputs: raw.inputs || {},
    timestamp: raw.timestamp || new Date().toISOString(),
    status: deriveStatus(raw.status || raw.state),
    kind,
    data: coercePayload(raw),
  };
};

const coerceToolResultArray = (raw: unknown): RawToolResult[] => {
  logger.info('[toolResults] Coercing tool result array', {
    inputType: typeof raw,
    isArray: Array.isArray(raw),
    isObject: isObject(raw),
  });

  if (Array.isArray(raw)) {
    const filtered = raw.filter(looksLikeToolResult) as RawToolResult[];
    logger.info('[toolResults] Filtered array results', {
      inputCount: raw.length,
      outputCount: filtered.length,
      toolNames: filtered.map(r => r.tool_name || r.kind || 'unknown'),
    });
    return filtered;
  }

  if (looksLikeToolResult(raw)) {
    logger.info('[toolResults] Single result object', {
      toolName: (raw as RawToolResult).tool_name || (raw as RawToolResult).kind,
    });
    return [raw as RawToolResult];
  }

  if (isObject(raw)) {
    const entries = Object.entries(raw)
      .filter(([, value]) => looksLikeToolResult(value))
      .map(([key, value]) => ({ ...(value as RawToolResult), tool_name: (value as RawToolResult).tool_name || key }));
    logger.info('[toolResults] Extracted from object', {
      keys: Object.keys(raw),
      extractedCount: entries.length,
    });
    return entries;
  }

  logger.warn('[toolResults] ⚠️ No valid tool results found');
  return [];
};

export const toolResultsToToolCards = (raw: unknown): ToolCard[] => {
  logger.info('[toolResults] Converting to tool cards', {
    hasInput: !!raw,
  });

  const results = coerceToolResultArray(raw);
  const cards = results
    .map((result, index) => {
      const card = toolResultToCard(result);
      if (card) {
        logger.info(`[toolResults] ✅ Created card [${index}]`, {
          kind: card.kind,
          title: card.title,
          hasData: !!card.data,
          dataKeys: card.data && typeof card.data === 'object' ? Object.keys(card.data) : [],
        });
      } else {
        logger.warn(`[toolResults] ❌ Failed to create card [${index}]`, {
          toolName: result.tool_name || result.kind,
          hasData: !!coercePayload(result),
        });
      }
      return card;
    })
    .filter((card): card is ToolCard => Boolean(card));

  logger.info('[toolResults] Tool cards created', {
    inputCount: results.length,
    outputCount: cards.length,
    kinds: cards.map(c => c.kind),
  });

  return cards;
};

export const toolResultsToRecords = (raw: unknown): ToolResultRecord[] =>
  coerceToolResultArray(raw).map(toRecord);