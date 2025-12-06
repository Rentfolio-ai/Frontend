// FILE: src/components/analysis/AssumptionsPanel.tsx
/**
 * Assumptions Panel Component
 * Input form for P&L calculation assumptions
 */
import React from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  Building,
  Wallet,
  Wrench,
  TrendingUp,
  ChevronDown,
  Info,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { PnLAssumptions, InvestmentStrategy } from '../../types/pnl';

interface AssumptionsPanelProps {
  strategy: InvestmentStrategy;
  assumptions: PnLAssumptions;
  onUpdateAssumption: (path: string, value: number | boolean | string | null) => void;
  isFieldOverridden: (field: string) => boolean;
  isLoading?: boolean;
}

interface InputFieldProps {
  label: string;
  field: string;
  value: number | boolean | string | null;
  onChange: (field: string, value: number | boolean | string | null) => void;
  type?: 'number' | 'percent' | 'currency' | 'years' | 'toggle';
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  prefix?: string;
  hint?: string;
  isOverridden?: boolean;
  disabled?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  field,
  value,
  onChange,
  type = 'number',
  min,
  max,
  step = 1,
  suffix,
  prefix,
  hint,
  isOverridden = false,
  disabled = false,
}) => {
  if (type === 'toggle') {
    return (
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground/70">{label}</span>
          {hint && (
            <span className="text-xs text-foreground/40" title={hint}>
              <Info className="w-3 h-3" />
            </span>
          )}
        </div>
        <button
          onClick={() => onChange(field, !value)}
          disabled={disabled}
          className={cn(
            'relative w-11 h-6 rounded-full transition-colors',
            value ? 'bg-primary' : 'bg-muted',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <motion.div
            className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm"
            animate={{ x: value ? 20 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>
    );
  }

  const inputValue = typeof value === 'boolean' ? '' : (value ?? '');
  const displayPrefix = type === 'currency' ? '$' : prefix;
  const displaySuffix = type === 'percent' ? '%' : type === 'years' ? ' years' : suffix;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-sm text-foreground/70 flex items-center gap-2">
          {label}
          {isOverridden && (
            <span className="px-1.5 py-0.5 text-[10px] rounded bg-amber-500/20 text-amber-700 dark:text-amber-400 font-medium">
              Modified
            </span>
          )}
        </label>
        {hint && (
          <span className="text-xs text-foreground/40" title={hint}>
            {hint}
          </span>
        )}
      </div>
      <div className="relative">
        {displayPrefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50 text-sm">
            {displayPrefix}
          </span>
        )}
        <input
          type="number"
          value={inputValue}
          onChange={(e) => {
            const newValue = e.target.value === '' ? null : parseFloat(e.target.value);
            onChange(field, newValue);
          }}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={cn(
            'w-full h-10 rounded-lg border border-border/50 bg-background/50 text-sm transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 focus:bg-background',
            'hover:border-border/80',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            displayPrefix ? 'pl-7' : 'pl-3',
            displaySuffix ? 'pr-12' : 'pr-3'
          )}
        />
        {displaySuffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50 text-sm">
            {displaySuffix}
          </span>
        )}
      </div>
    </div>
  );
};

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const Section: React.FC<SectionProps> = ({ title, icon, children, defaultExpanded = true }) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  return (
    <div className="border-b border-border/50 last:border-b-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-primary/70">{icon}</span>
          <span className="text-sm font-medium text-foreground">{title}</span>
        </div>
        <ChevronDown className={cn(
          'w-4 h-4 text-foreground/50 transition-transform',
          isExpanded && 'rotate-180'
        )} />
      </button>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="px-4 pb-4 space-y-4"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
};

export const AssumptionsPanel: React.FC<AssumptionsPanelProps> = ({
  strategy,
  assumptions,
  onUpdateAssumption,
  isFieldOverridden,
  isLoading = false,
}) => {
  const handleChange = (field: string, value: number | boolean | string | null) => {
    onUpdateAssumption(field, value);
  };

  return (
    <div className={cn('divide-y divide-border/50', isLoading && 'opacity-70 pointer-events-none')}>
      {/* Purchase Section */}
      <Section title="Purchase" icon={<Building className="w-4 h-4" />} defaultExpanded={true}>
        <InputField
          label="Purchase Price"
          field="purchasePrice"
          value={assumptions.purchase.purchasePrice}
          onChange={handleChange}
          type="currency"
          min={0}
          step={10000}
          isOverridden={isFieldOverridden('purchasePrice')}
        />
        <InputField
          label="Closing Costs"
          field="closingCostPct"
          value={assumptions.purchase.closingCostPct}
          onChange={handleChange}
          type="percent"
          min={0}
          max={10}
          step={0.5}
          hint="% of price"
          isOverridden={isFieldOverridden('closingCostPct')}
        />
        <InputField
          label="Renovation / Rehab"
          field="rehabBudget"
          value={assumptions.purchase.rehabBudget}
          onChange={handleChange}
          type="currency"
          min={0}
          step={1000}
          isOverridden={isFieldOverridden('rehabBudget')}
        />
        {(strategy === 'STR' || strategy === 'ADU') && (
          <InputField
            label="Furnishing"
            field="furnishingBudget"
            value={assumptions.purchase.furnishingBudget}
            onChange={handleChange}
            type="currency"
            min={0}
            step={1000}
            hint="Furniture & Decor"
            isOverridden={isFieldOverridden('furnishingBudget')}
          />
        )}
      </Section>

      {/* Financing Section */}
      <Section title="Financing" icon={<Wallet className="w-4 h-4" />} defaultExpanded={true}>
        <InputField
          label="Finance the purchase"
          field="isFinanced"
          value={assumptions.financing.isFinanced}
          onChange={handleChange}
          type="toggle"
        />
        {assumptions.financing.isFinanced && (
          <>
            <InputField
              label="Down Payment"
              field="downPaymentPct"
              value={assumptions.financing.downPaymentPct}
              onChange={handleChange}
              type="percent"
              min={0}
              max={100}
              step={5}
              hint="% of price"
              isOverridden={isFieldOverridden('downPaymentPct')}
            />
            <InputField
              label="Interest Rate"
              field="interestRateAnnual"
              value={assumptions.financing.interestRateAnnual}
              onChange={handleChange}
              type="percent"
              min={0}
              max={20}
              step={0.125}
              hint="Annual rate"
              isOverridden={isFieldOverridden('interestRateAnnual')}
            />
            <InputField
              label="Loan Term"
              field="loanTermYears"
              value={assumptions.financing.loanTermYears}
              onChange={handleChange}
              type="years"
              min={5}
              max={40}
              step={5}
              isOverridden={isFieldOverridden('loanTermYears')}
            />
          </>
        )}
      </Section>

      {/* Income Section - Strategy Dependent */}
      <Section title="Income" icon={<DollarSign className="w-4 h-4" />} defaultExpanded={true}>
        {strategy === 'STR' ? (
          <>
            <InputField
              label="Average Daily Rate (ADR)"
              field="adr"
              value={assumptions.income.str.adr}
              onChange={handleChange}
              type="currency"
              min={0}
              step={10}
              hint="Per night"
              isOverridden={isFieldOverridden('adr')}
            />
            <InputField
              label="Expected Occupancy"
              field="expectedOccupancyPct"
              value={assumptions.income.str.expectedOccupancyPct}
              onChange={handleChange}
              type="percent"
              min={0}
              max={100}
              step={5}
              hint="Annual average"
              isOverridden={isFieldOverridden('expectedOccupancyPct')}
            />
            <InputField
              label="Cleaning Fee"
              field="avgCleaningFeePerBooking"
              value={assumptions.income.str.avgCleaningFeePerBooking}
              onChange={handleChange}
              type="currency"
              min={0}
              step={10}
              hint="Per booking"
              isOverridden={isFieldOverridden('avgCleaningFeePerBooking')}
            />
            <InputField
              label="Platform Fee"
              field="platformFeePct"
              value={assumptions.income.str.platformFeePct}
              onChange={handleChange}
              type="percent"
              min={0}
              max={20}
              step={0.5}
              hint="Airbnb/VRBO cut"
              isOverridden={isFieldOverridden('platformFeePct')}
            />
          </>
        ) : (
          <>
            <InputField
              label="Monthly Rent"
              field="monthlyRent"
              value={assumptions.income.ltr.monthlyRent}
              onChange={handleChange}
              type="currency"
              min={0}
              step={100}
              isOverridden={isFieldOverridden('monthlyRent')}
            />
            <InputField
              label="Vacancy Rate"
              field="vacancyRatePct"
              value={assumptions.income.ltr.vacancyRatePct}
              onChange={handleChange}
              type="percent"
              min={0}
              max={50}
              step={1}
              hint="Annual average"
              isOverridden={isFieldOverridden('vacancyRatePct')}
            />
          </>
        )}
      </Section>

      {/* Expenses Section */}
      <Section title="Operating Expenses" icon={<Wrench className="w-4 h-4" />} defaultExpanded={false}>
        <InputField
          label="Property Tax"
          field="propertyTaxPctOfValue"
          value={assumptions.expenses.propertyTaxPctOfValue}
          onChange={handleChange}
          type="percent"
          min={0}
          max={5}
          step={0.1}
          hint="% of value"
          isOverridden={isFieldOverridden('propertyTaxPctOfValue')}
        />
        <InputField
          label="Insurance"
          field="insuranceAnnual"
          value={assumptions.expenses.insuranceAnnual}
          onChange={handleChange}
          type="currency"
          min={0}
          step={100}
          hint="Per year"
          isOverridden={isFieldOverridden('insuranceAnnual')}
        />
        <InputField
          label="HOA"
          field="hoaMonthly"
          value={assumptions.expenses.hoaMonthly}
          onChange={handleChange}
          type="currency"
          min={0}
          step={50}
          hint="Per month"
          isOverridden={isFieldOverridden('hoaMonthly')}
        />
        <InputField
          label="Property Management"
          field="propertyManagementPctOfIncome"
          value={assumptions.expenses.propertyManagementPctOfIncome}
          onChange={handleChange}
          type="percent"
          min={0}
          max={30}
          step={1}
          hint="% of gross income"
          isOverridden={isFieldOverridden('propertyManagementPctOfIncome')}
        />
        <InputField
          label="Maintenance"
          field="maintenancePctOfIncome"
          value={assumptions.expenses.maintenancePctOfIncome}
          onChange={handleChange}
          type="percent"
          min={0}
          max={20}
          step={1}
          hint="% of gross income"
          isOverridden={isFieldOverridden('maintenancePctOfIncome')}
        />
        <InputField
          label="CapEx Reserve"
          field="capexReservePctOfIncome"
          value={assumptions.expenses.capexReservePctOfIncome}
          onChange={handleChange}
          type="percent"
          min={0}
          max={15}
          step={1}
          hint="% of gross income"
          isOverridden={isFieldOverridden('capexReservePctOfIncome')}
        />
        <InputField
          label="Utilities"
          field="utilitiesMonthly"
          value={assumptions.expenses.utilitiesMonthly}
          onChange={handleChange}
          type="currency"
          min={0}
          step={25}
          hint="Per month"
          isOverridden={isFieldOverridden('utilitiesMonthly')}
        />
        <InputField
          label="Internet"
          field="internetMonthly"
          value={assumptions.expenses.internetMonthly}
          onChange={handleChange}
          type="currency"
          min={0}
          step={10}
          hint="Per month"
          isOverridden={isFieldOverridden('internetMonthly')}
        />
        {strategy === 'STR' && (
          <InputField
            label="Cleaning Cost"
            field="cleaningCostPerBooking"
            value={assumptions.expenses.cleaningCostPerBooking}
            onChange={handleChange}
            type="currency"
            min={0}
            step={10}
            hint="Per turnover"
            isOverridden={isFieldOverridden('cleaningCostPerBooking')}
          />
        )}
        <InputField
          label="Other Expenses"
          field="otherOperatingMonthly"
          value={assumptions.expenses.otherOperatingMonthly}
          onChange={handleChange}
          type="currency"
          min={0}
          step={50}
          hint="Per month"
          isOverridden={isFieldOverridden('otherOperatingMonthly')}
        />
      </Section>

      {/* Projection Section */}
      <Section title="Growth Projections" icon={<TrendingUp className="w-4 h-4" />} defaultExpanded={false}>
        <InputField
          label="Projection Years"
          field="projectionYears"
          value={assumptions.projection.projectionYears}
          onChange={handleChange}
          type="years"
          min={1}
          max={30}
          step={1}
          isOverridden={isFieldOverridden('projectionYears')}
        />
        <InputField
          label="Annual Appreciation"
          field="annualAppreciationPct"
          value={assumptions.projection.annualAppreciationPct}
          onChange={handleChange}
          type="percent"
          min={-10}
          max={15}
          step={0.5}
          hint="Property value growth"
          isOverridden={isFieldOverridden('annualAppreciationPct')}
        />
        <InputField
          label="Rent Growth"
          field="rentGrowthPct"
          value={assumptions.projection.rentGrowthPct}
          onChange={handleChange}
          type="percent"
          min={-5}
          max={10}
          step={0.5}
          hint="Annual income increase"
          isOverridden={isFieldOverridden('rentGrowthPct')}
        />
        <InputField
          label="Expense Growth"
          field="expenseGrowthPct"
          value={assumptions.projection.expenseGrowthPct}
          onChange={handleChange}
          type="percent"
          min={0}
          max={10}
          step={0.5}
          hint="Annual expense increase"
          isOverridden={isFieldOverridden('expenseGrowthPct')}
        />
      </Section>
    </div>
  );
};

export default AssumptionsPanel;
