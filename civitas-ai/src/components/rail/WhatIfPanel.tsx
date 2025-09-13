// FILE: src/components/rail/WhatIfPanel.tsx
import React, { useState } from 'react';
import { Card } from '../primitives/Card';
import { Button } from '../primitives/Button';

interface WhatIfScenario {
  id: string;
  title: string;
  description: string;
  inputs: { label: string; value: string; unit?: string }[];
  impact: { metric: string; value: string; change: string }[];
}

const sampleScenarios: WhatIfScenario[] = [
  {
    id: '1',
    title: 'Rent Increase',
    description: 'What if rents increase by 5% next year?',
    inputs: [
      { label: 'Rent Increase', value: '5', unit: '%' },
      { label: 'Current Rent', value: '2400', unit: '/mo' }
    ],
    impact: [
      { metric: 'Monthly Revenue', value: '$2,520', change: '+$120' },
      { metric: 'Annual ROI', value: '9.2%', change: '+0.8%' },
      { metric: 'Break Even', value: '6.1 years', change: '-1.1 years' }
    ]
  },
  {
    id: '2',
    title: 'Interest Rate Change',
    description: 'Impact of 1% interest rate increase',
    inputs: [
      { label: 'Rate Increase', value: '1', unit: '%' },
      { label: 'Loan Amount', value: '300K', unit: '' }
    ],
    impact: [
      { metric: 'Monthly Payment', value: '$1,895', change: '+$180' },
      { metric: 'Cash Flow', value: '$625', change: '-$180' },
      { metric: 'Cap Rate', value: '5.8%', change: '-0.4%' }
    ]
  }
];

export const WhatIfPanel: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const toggleScenario = (scenarioId: string) => {
    setSelectedScenario(selectedScenario === scenarioId ? null : scenarioId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-h2">What-If Scenarios</h3>
      </div>

      <div className="space-y-3">
        {sampleScenarios.map(scenario => (
          <Card key={scenario.id} padding="sm">
            <div className="space-y-3">
              {/* Scenario Header */}
              <div>
                <button
                  onClick={() => toggleScenario(scenario.id)}
                  className="w-full text-left flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-semibold text-sm">{scenario.title}</h4>
                    <p className="text-xs text-foreground/70 mt-1">
                      {scenario.description}
                    </p>
                  </div>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      selectedScenario === scenario.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>

              {/* Expanded Content */}
              {selectedScenario === scenario.id && (
                <div className="space-y-4 pt-2 border-t border-border">
                  {/* Inputs */}
                  <div>
                    <div className="text-xs text-foreground/60 mb-2">Inputs</div>
                    <div className="space-y-2">
                      {scenario.inputs.map((input, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{input.label}</span>
                          <span className="font-medium">
                            {input.value}{input.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Impact */}
                  <div>
                    <div className="text-xs text-foreground/60 mb-2">Impact</div>
                    <div className="space-y-2">
                      {scenario.impact.map((impact, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span>{impact.metric}</span>
                          <div className="text-right">
                            <div className="font-medium">{impact.value}</div>
                            <div className={`text-xs ${
                              impact.change.startsWith('+') ? 'text-success' : 
                              impact.change.startsWith('-') ? 'text-danger' : 
                              'text-foreground/60'
                            }`}>
                              {impact.change}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                    <Button variant="primary" size="sm" className="flex-1">
                      Apply
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Create New Scenario */}
      <Button variant="outline" className="w-full justify-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Create New Scenario
      </Button>

      {/* Empty State */}
      {sampleScenarios.length === 0 && (
        <div className="text-center py-8 text-foreground/60">
          <svg
            className="w-12 h-12 mx-auto mb-4 text-foreground/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm">No scenarios yet</p>
          <p className="text-xs mt-1">Create scenarios to model different outcomes</p>
        </div>
      )}
    </div>
  );
};