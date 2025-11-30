export type RiskLevel = 'low' | 'medium' | 'high';

export interface ComplianceRule {
  id: string;
  title: string;
  description: string;
  status?: 'pass' | 'fail' | 'requires_attention';
  markdown?: string;
}

export interface CompliancePresentation {
  headline: string;
  markdown: string;
}

export interface ComplianceLayer {
  id: string;
  label: string;
  summary: string;
  markdown?: string;
  highlights?: string[];
  risk_level?: RiskLevel;
}

export interface CompliancePermitRequirement {
  id: string;
  name: string;
  cost?: string;
  timeline?: string;
  description?: string;
  required?: boolean;
}

export interface ComplianceResult {
  tool_name: string;
  overall_risk_level: RiskLevel;
  key_rules: ComplianceRule[];
  presentation: CompliancePresentation;
  summary?: string;
  timestamp?: string;
  state_overview?: ComplianceLayer;
  city_rules?: ComplianceLayer;
  hoa_guidance?: ComplianceLayer;
  permits?: CompliancePermitRequirement[];
}
