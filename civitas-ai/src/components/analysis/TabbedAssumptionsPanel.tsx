/**
 * TabbedAssumptionsPanel - Categorized assumptions interface
 * Organizes inputs into Purchase, Income, Expenses, and Projections tabs
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building, TrendingUp, Receipt, Calendar, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SmartInput } from './SmartInput';
import type { InvestmentStrategy } from '../../types/pnl';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: Tab[] = [
  { id: 'purchase', label: 'Purchase', icon: Building },
  { id: 'income', label: 'Income', icon: TrendingUp },
  { id: 'expenses', label: 'Expenses', icon: Receipt },
  { id: 'projections', label: 'Projections', icon: Calendar },
];

interface TabbedAssumptionsPanelProps {
  strategy: InvestmentStrategy;
  assumptions: Record<string, any>;
  onUpdate: (field: string, value: any) => void;
  isFieldOverridden: (field: string) => boolean;
  dataSources?: Record<string, { source: string; confidence: 'high' | 'medium' | 'low' }>;
  className?: string;
}

export const TabbedAssumptionsPanel: React.FC<TabbedAssumptionsPanelProps> = ({
  strategy,
  assumptions,
  onUpdate,
  isFieldOverridden,
  dataSources = {},
  className,
}) => {
  const [activeTab, setActiveTab] = useState('purchase');
  const [expandedAdvanced, setExpandedAdvanced] = useState<Record<string, boolean>>({});

  const toggleAdvanced = (section: string) => {
    setExpandedAdvanced((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Purchase Tab Content
  const PurchaseTab = () => (
    <div className="space-y-4">
      <SmartInput
        label="Purchase Price"
        value={assumptions.purchase_price || 0}
        onChange={(val) => onUpdate('purchase_price', val)}
        format="currency"
        shortcuts={{ up: 10000, down: 10000, shift_up: 50000, shift_down: 50000 }}
        suggestions={[450000, 500000, 550000, 600000]}
        dataSource={dataSources.purchase_price?.source}
        confidence={dataSources.purchase_price?.confidence}
        tooltip="Total purchase price of the property"
        helpText="Median in area: $650,000"
      />
      
      <SmartInput
        label="Down Payment"
        value={assumptions.down_payment_pct || 0}
        onChange={(val) => onUpdate('down_payment_pct', val)}
        format="percentage"
        shortcuts={{ up: 5, down: 5 }}
        suggestions={[20, 25, 30, 40]}
        tooltip="Percentage of purchase price paid upfront"
        helpText={`$${((assumptions.purchase_price || 0) * (assumptions.down_payment_pct || 0) / 100).toLocaleString()}`}
      />
      
      <SmartInput
        label="Interest Rate"
        value={assumptions.mortgage_rate_pct || 0}
        onChange={(val) => onUpdate('mortgage_rate_pct', val)}
        format="percentage"
        shortcuts={{ up: 0.25, down: 0.25 }}
        dataSource={dataSources.mortgage_rate_pct?.source || 'FRED'}
        confidence={dataSources.mortgage_rate_pct?.confidence || 'high'}
        tooltip="Annual mortgage interest rate"
      />
      
      <SmartInput
        label="Loan Term"
        value={assumptions.loan_term_years || 30}
        onChange={(val) => onUpdate('loan_term_years', val)}
        suffix="years"
        suggestions={[15, 20, 30]}
        tooltip="Length of mortgage in years"
      />
      
      {/* Advanced Purchase Options */}
      <button
        onClick={() => toggleAdvanced('purchase')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground/70 transition-colors mt-6"
      >
        <motion.div
          animate={{ rotate: expandedAdvanced.purchase ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
        <span>Advanced Purchase Options</span>
      </button>
      
      <AnimatePresence>
        {expandedAdvanced.purchase && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-4 overflow-hidden"
          >
            <SmartInput
              label="Closing Costs"
              value={assumptions.closing_costs_pct || 2.5}
              onChange={(val) => onUpdate('closing_costs_pct', val)}
              format="percentage"
              tooltip="Percentage of purchase price for closing costs"
            />
            
            <SmartInput
              label="Repair Budget"
              value={assumptions.repair_budget || 0}
              onChange={(val) => onUpdate('repair_budget', val)}
              format="currency"
              shortcuts={{ up: 5000, down: 5000 }}
              tooltip="Initial repair and renovation budget"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Income Tab Content
  const IncomeTab = () => (
    <div className="space-y-4">
      {strategy === 'STR' ? (
        <>
          <SmartInput
            label="Average Daily Rate (ADR)"
            value={assumptions.adr || 0}
            onChange={(val) => onUpdate('adr', val)}
            format="currency"
            shortcuts={{ up: 10, down: 10, shift_up: 50, shift_down: 50 }}
            suggestions={[150, 200, 250, 300]}
            dataSource={dataSources.adr?.source}
            confidence={dataSources.adr?.confidence}
            tooltip="Average nightly rate for short-term rental"
            helpText="Based on comparable STRs in area"
          />
          
          <SmartInput
            label="Expected Occupancy"
            value={assumptions.expected_occupancy_pct || 0}
            onChange={(val) => onUpdate('expected_occupancy_pct', val)}
            format="percentage"
            shortcuts={{ up: 5, down: 5 }}
            suggestions={[50, 60, 70, 80]}
            tooltip="Percentage of days booked per year"
          />
        </>
      ) : (
        <>
          <SmartInput
            label="Monthly Rent"
            value={assumptions.monthly_rent || 0}
            onChange={(val) => onUpdate('monthly_rent', val)}
            format="currency"
            shortcuts={{ up: 100, down: 100, shift_up: 500, shift_down: 500 }}
            suggestions={[2000, 2500, 3000, 3500]}
            dataSource={dataSources.monthly_rent?.source || 'Census'}
            confidence={dataSources.monthly_rent?.confidence || 'high'}
            tooltip="Expected monthly rent for long-term rental"
            helpText="Median in ZIP: $2,450"
          />
          
          <SmartInput
            label="Vacancy Rate"
            value={assumptions.vacancy_rate_pct || 5}
            onChange={(val) => onUpdate('vacancy_rate_pct', val)}
            format="percentage"
            shortcuts={{ up: 1, down: 1 }}
            dataSource={dataSources.vacancy_rate_pct?.source}
            confidence={dataSources.vacancy_rate_pct?.confidence}
            tooltip="Expected percentage of time property sits vacant"
          />
        </>
      )}
      
      {/* Advanced Income Options */}
      <button
        onClick={() => toggleAdvanced('income')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground/70 transition-colors mt-6"
      >
        <motion.div
          animate={{ rotate: expandedAdvanced.income ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
        <span>Advanced Income Options</span>
      </button>
      
      <AnimatePresence>
        {expandedAdvanced.income && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-4 overflow-hidden"
          >
            <SmartInput
              label="Annual Rent Growth"
              value={assumptions.rent_growth_pct || 3}
              onChange={(val) => onUpdate('rent_growth_pct', val)}
              format="percentage"
              tooltip="Expected annual increase in rental income"
            />
            
            <SmartInput
              label="Other Income"
              value={assumptions.other_income || 0}
              onChange={(val) => onUpdate('other_income', val)}
              format="currency"
              tooltip="Additional monthly income (parking, laundry, etc.)"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Expenses Tab Content
  const ExpensesTab = () => (
    <div className="space-y-4">
      <SmartInput
        label="Property Tax Rate"
        value={assumptions.property_tax_rate_pct || 1.94}
        onChange={(val) => onUpdate('property_tax_rate_pct', val)}
        format="percentage"
        shortcuts={{ up: 0.1, down: 0.1 }}
        dataSource={dataSources.property_tax_rate_pct?.source}
        confidence={dataSources.property_tax_rate_pct?.confidence}
        tooltip="Annual property tax as % of property value"
        helpText={`$${((assumptions.purchase_price || 0) * (assumptions.property_tax_rate_pct || 0) / 100 / 12).toLocaleString()}/mo`}
      />
      
      <SmartInput
        label="Insurance"
        value={assumptions.insurance_monthly || 150}
        onChange={(val) => onUpdate('insurance_monthly', val)}
        format="currency"
        shortcuts={{ up: 25, down: 25 }}
        tooltip="Monthly insurance premium"
      />
      
      <SmartInput
        label="HOA Fees"
        value={assumptions.hoa_monthly || 0}
        onChange={(val) => onUpdate('hoa_monthly', val)}
        format="currency"
        shortcuts={{ up: 50, down: 50 }}
        tooltip="Monthly HOA or condo fees"
      />
      
      <SmartInput
        label="Maintenance Reserve"
        value={assumptions.maintenance_pct || 1}
        onChange={(val) => onUpdate('maintenance_pct', val)}
        format="percentage"
        shortcuts={{ up: 0.5, down: 0.5 }}
        suggestions={[0.5, 1, 1.5, 2]}
        tooltip="Annual maintenance budget as % of property value"
      />
      
      <SmartInput
        label="Property Management"
        value={assumptions.property_mgmt_pct || 10}
        onChange={(val) => onUpdate('property_mgmt_pct', val)}
        format="percentage"
        shortcuts={{ up: 1, down: 1 }}
        suggestions={[0, 8, 10, 12]}
        tooltip="Property management fee as % of rent"
      />
      
      {/* Advanced Expense Options */}
      <button
        onClick={() => toggleAdvanced('expenses')}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground/70 transition-colors mt-6"
      >
        <motion.div
          animate={{ rotate: expandedAdvanced.expenses ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
        <span>Advanced Expense Options</span>
      </button>
      
      <AnimatePresence>
        {expandedAdvanced.expenses && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-4 overflow-hidden"
          >
            <SmartInput
              label="Utilities"
              value={assumptions.utilities_monthly || 0}
              onChange={(val) => onUpdate('utilities_monthly', val)}
              format="currency"
              tooltip="Monthly utilities if landlord-paid"
            />
            
            <SmartInput
              label="CapEx Reserve"
              value={assumptions.capex_pct || 0.5}
              onChange={(val) => onUpdate('capex_pct', val)}
              format="percentage"
              tooltip="Annual capital expenditure reserve as % of property value"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Projections Tab Content
  const ProjectionsTab = () => (
    <div className="space-y-4">
      <SmartInput
        label="Holding Period"
        value={assumptions.holding_period_years || 5}
        onChange={(val) => onUpdate('holding_period_years', val)}
        suffix="years"
        shortcuts={{ up: 1, down: 1 }}
        suggestions={[5, 10, 15, 20, 30]}
        tooltip="Expected years to hold property"
      />
      
      <SmartInput
        label="Property Appreciation"
        value={assumptions.appreciation_rate_pct || 3}
        onChange={(val) => onUpdate('appreciation_rate_pct', val)}
        format="percentage"
        shortcuts={{ up: 0.5, down: 0.5 }}
        suggestions={[2, 3, 4, 5]}
        tooltip="Expected annual property value growth"
      />
      
      <SmartInput
        label="Selling Costs"
        value={assumptions.selling_costs_pct || 7}
        onChange={(val) => onUpdate('selling_costs_pct', val)}
        format="percentage"
        tooltip="Expected costs when selling (realtor, closing, etc.)"
      />
      
      <SmartInput
        label="Annual Expense Growth"
        value={assumptions.expense_growth_pct || 2}
        onChange={(val) => onUpdate('expense_growth_pct', val)}
        format="percentage"
        tooltip="Expected annual increase in expenses"
      />
    </div>
  );

  const getTabContent = () => {
    switch (activeTab) {
      case 'purchase':
        return <PurchaseTab />;
      case 'income':
        return <IncomeTab />;
      case 'expenses':
        return <ExpensesTab />;
      case 'projections':
        return <ProjectionsTab />;
      default:
        return <PurchaseTab />;
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-black/5 border border-black/8">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg transition-all',
                isActive
                  ? 'bg-[#C08B5C] text-white shadow-lg shadow-[#C08B5C]/30'
                  : 'text-muted-foreground hover:text-foreground/80 hover:bg-black/5'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {getTabContent()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
