import React from 'react';
import { ShieldAlert, Building, Landmark, ScrollText, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import type { ComplianceResult, ComplianceLayer, ComplianceRule, CompliancePermitRequirement, RiskLevel } from '../../../types/compliance';
import { cn } from '../../../lib/utils';
import { MarkdownRenderer } from '../../common/MarkdownRenderer';

const riskBadgeStyles: Record<RiskLevel, string> = {
  low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  high: 'bg-rose-100 text-rose-700 border-rose-200',
};

const riskLabel: Record<RiskLevel, string> = {
  low: 'Low Risk',
  medium: 'Moderate Risk',
  high: 'High Risk',
};

const ruleStatusIcon = (rule: ComplianceRule) => {
  switch (rule.status) {
    case 'pass':
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    case 'fail':
      return <ShieldAlert className="w-4 h-4 text-rose-600" />;
    case 'requires_attention':
    default:
      return <AlertTriangle className="w-4 h-4 text-amber-600" />;
  }
};

interface ComplianceCardProps {
  data: ComplianceResult;
}

export const ComplianceCard: React.FC<ComplianceCardProps> = ({ data }) => {
  const { overall_risk_level, key_rules, state_overview, city_rules, hoa_guidance, permits } = data;
  const topRules = key_rules.slice(0, 3);

  return (
    <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-slate-50/80 to-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-primary" />
          <div>
            <h4 className="text-sm font-semibold text-foreground">Compliance Overview</h4>
            {data.summary && <p className="text-xs text-foreground/60 line-clamp-1">{data.summary}</p>}
          </div>
        </div>
        <span className={cn('px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1', riskBadgeStyles[overall_risk_level])}>
          {riskLabel[overall_risk_level]}
        </span>
      </div>

      <div className="p-4 space-y-5">
        <ComplianceLayerBlock title="State Overview" icon={<Landmark className="w-4 h-4" />} layer={state_overview} fallback="State guidance is pending." />
        <ComplianceLayerBlock title="City Rules" icon={<Building className="w-4 h-4" />} layer={city_rules} fallback="City-specific rules are not available." />
        {hoa_guidance && (
          <ComplianceLayerBlock title="HOA Guidance" icon={<ScrollText className="w-4 h-4" />} layer={hoa_guidance} />
        )}

        {topRules.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Top Rules</p>
            <div className="space-y-2">
              {topRules.map(rule => (
                <div key={rule.id} className="p-3 rounded-xl border border-border/40 bg-muted/40">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{rule.title}</p>
                      {rule.description && (
                        <p className="text-xs text-foreground/60 mt-1">{rule.description}</p>
                      )}
                    </div>
                    {ruleStatusIcon(rule)}
                  </div>
                  {rule.markdown && (
                    <MarkdownRenderer content={rule.markdown} className="mt-2 text-xs" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {permits && permits.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">Permit Requirements</p>
            <div className="space-y-2">
              {permits.map(permit => (
                <div key={permit.id} className="p-3 rounded-xl border border-border/40 bg-background/70">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{permit.name}</p>
                    {permit.required && (
                      <span className="text-[10px] uppercase font-semibold text-rose-600">Required</span>
                    )}
                  </div>
                  <div className="text-xs text-foreground/60 mt-1 flex flex-wrap gap-3">
                    {permit.cost && <span>Cost: {permit.cost}</span>}
                    {permit.timeline && <span>Timeline: {permit.timeline}</span>}
                  </div>
                  {permit.description && (
                    <p className="text-xs text-foreground/70 mt-1">{permit.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface ComplianceLayerBlockProps {
  title: string;
  icon: React.ReactNode;
  layer?: ComplianceLayer;
  fallback?: string;
}

const ComplianceLayerBlock: React.FC<ComplianceLayerBlockProps> = ({ title, icon, layer, fallback }) => {
  if (!layer) {
    if (!fallback) return null;
    return (
      <div className="p-3 rounded-xl border border-dashed border-border/40 text-xs text-foreground/60 flex items-center gap-2">
        <Info className="w-4 h-4" />
        {fallback}
      </div>
    );
  }

  return (
    <div className="p-3 rounded-2xl border border-border/40 bg-muted/30 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {icon}
          {layer.label || title}
        </div>
        {layer.risk_level && (
          <span className={cn('px-2 py-0.5 text-[10px] rounded-full font-semibold uppercase tracking-wide', riskBadgeStyles[layer.risk_level])}>
            {riskLabel[layer.risk_level]}
          </span>
        )}
      </div>
      <p className="text-sm text-foreground/70">{layer.summary}</p>
      {layer.markdown && <MarkdownRenderer content={layer.markdown} className="text-xs" />}
      {layer.highlights && layer.highlights.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {layer.highlights.map((highlight) => (
            <span key={highlight} className="text-[11px] px-2 py-1 rounded-full bg-background border border-border/40 text-foreground/70">
              {highlight}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ComplianceCard;
