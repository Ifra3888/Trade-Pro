// components/StrategyBuilder.tsx
import React, { useState } from 'react';
import { Strategy, StrategyRule, IndicatorConfig } from '@/lib/indicators';
import { Plus, Trash2, Copy, Save, X } from 'lucide-react';

interface StrategyBuilderProps {
  onSaveStrategy: (strategy: Strategy) => void;
  indicators: IndicatorConfig[];
  existingStrategies?: Strategy[];
}

export const StrategyBuilder: React.FC<StrategyBuilderProps> = ({ 
  onSaveStrategy, 
  indicators,
  existingStrategies = [] 
}) => {
  const [strategyName, setStrategyName] = useState('');
  const [strategyDescription, setStrategyDescription] = useState('');
  const [rules, setRules] = useState<StrategyRule[]>([]);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // Pre-defined strategy templates
  const templates = {
    goldenCross: {
      name: 'Golden Cross Strategy',
      description: 'Buy when fast EMA crosses above slow EMA, sell on opposite cross',
      rules: [
        {
          id: Date.now().toString(),
          condition: 'CROSS_ABOVE' as const,
          indicator1: 'EMA_9',
          value: 0,
          action: 'BUY' as const,
          weight: 100
        },
        {
          id: (Date.now() + 1).toString(),
          condition: 'CROSS_BELOW' as const,
          indicator1: 'EMA_9',
          value: 0,
          action: 'SELL' as const,
          weight: 100
        }
      ]
    },
    rsiMeanReversion: {
      name: 'RSI Mean Reversion',
      description: 'Buy when RSI oversold, sell when overbought',
      rules: [
        {
          id: Date.now().toString(),
          condition: 'LESS_THAN' as const,
          indicator1: 'RSI_14',
          value: 30,
          action: 'BUY' as const,
          weight: 100
        },
        {
          id: (Date.now() + 1).toString(),
          condition: 'GREATER_THAN' as const,
          indicator1: 'RSI_14',
          value: 70,
          action: 'SELL' as const,
          weight: 100
        }
      ]
    },
    bollingerBreakout: {
      name: 'Bollinger Breakout',
      description: 'Buy when price touches lower band, sell at upper band',
      rules: [
        {
          id: Date.now().toString(),
          condition: 'LESS_THAN' as const,
          indicator1: 'BB_LOWER',
          value: 0,
          action: 'BUY' as const,
          weight: 100
        },
        {
          id: (Date.now() + 1).toString(),
          condition: 'GREATER_THAN' as const,
          indicator1: 'BB_UPPER',
          value: 0,
          action: 'SELL' as const,
          weight: 100
        }
      ]
    }
  };

  const loadTemplate = (templateKey: string) => {
    const template = templates[templateKey as keyof typeof templates];
    if (template) {
      setStrategyName(template.name);
      setStrategyDescription(template.description);
      setRules(template.rules.map(rule => ({ ...rule, id: Date.now() + Math.random().toString() })));
      setSelectedTemplate(templateKey);
    }
  };

  const addRule = () => {
    const newRule: StrategyRule = {
      id: Date.now().toString(),
      condition: 'CROSS_ABOVE',
      indicator1: indicators[0]?.name || '',
      value: 0,
      action: 'BUY',
      weight: 100
    };
    setRules([...rules, newRule]);
  };

  const updateRule = (ruleId: string, field: keyof StrategyRule, value: any) => {
    const updatedRules = rules.map(rule => 
      rule.id === ruleId ? { ...rule, [field]: value } : rule
    );
    setRules(updatedRules);
  };

  const removeRule = (ruleId: string) => {
    setRules(rules.filter(rule => rule.id !== ruleId));
  };

  const duplicateRule = (ruleId: string) => {
    const ruleToDuplicate = rules.find(rule => rule.id === ruleId);
    if (ruleToDuplicate) {
      const duplicatedRule = {
        ...ruleToDuplicate,
        id: Date.now().toString()
      };
      setRules([...rules, duplicatedRule]);
    }
  };

  const saveStrategy = () => {
    const strategy: Strategy = {
      id: Date.now().toString(),
      name: strategyName,
      description: strategyDescription,
      rules: rules,
      enabled: true,
      createdAt: new Date()
    };
    onSaveStrategy(strategy);
    
    // Reset form
    setStrategyName('');
    setStrategyDescription('');
    setRules([]);
    setSelectedTemplate('');
  };

  const validateStrategy = (): boolean => {
    if (!strategyName.trim()) return false;
    if (rules.length === 0) return false;
    
    // Check if all rules have required fields
    for (const rule of rules) {
      if (!rule.indicator1) return false;
      if (rule.condition === 'BETWEEN' && (rule.value === undefined || rule.value2 === undefined)) {
        return false;
      }
      if (rule.condition !== 'BETWEEN' && rule.value === undefined) {
        return false;
      }
    }
    
    return true;
  };

  const getConditionLabel = (condition: string): string => {
    const labels: Record<string, string> = {
      'CROSS_ABOVE': 'Crosses Above',
      'CROSS_BELOW': 'Crosses Below',
      'GREATER_THAN': 'Greater Than',
      'LESS_THAN': 'Less Than',
      'BETWEEN': 'Between'
    };
    return labels[condition] || condition;
  };

  const getActionColor = (action: string): string => {
    switch (action) {
      case 'BUY': return 'text-green-600';
      case 'SELL': return 'text-red-600';
      case 'CLOSE': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Build Custom Strategy</h3>
        <button
          onClick={() => setIsAdvancedMode(!isAdvancedMode)}
          className="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 transition"
        >
          {isAdvancedMode ? 'Basic Mode' : 'Advanced Mode'}
        </button>
      </div>

      {/* Templates Section */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Quick Start Templates</h4>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => loadTemplate('goldenCross')}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Golden Cross
          </button>
          <button
            onClick={() => loadTemplate('rsiMeanReversion')}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            RSI Mean Reversion
          </button>
          <button
            onClick={() => loadTemplate('bollingerBreakout')}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            Bollinger Breakout
          </button>
        </div>
        {selectedTemplate && (
          <p className="text-sm text-blue-700 mt-2">
            Loaded template: {templates[selectedTemplate as keyof typeof templates]?.name}
          </p>
        )}
      </div>
      
      {/* Basic Information */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Strategy Name *
        </label>
        <input
          type="text"
          value={strategyName}
          onChange={(e) => setStrategyName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Golden Cross Strategy"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={strategyDescription}
          onChange={(e) => setStrategyDescription(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          placeholder="Describe your strategy's logic and goals..."
        />
      </div>

      {/* Rules Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-gray-800">Trading Rules</h4>
          <button
            onClick={addRule}
            className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
          >
            <Plus size={16} /> Add Rule
          </button>
        </div>

        {rules.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-500">No rules added yet. Click "Add Rule" to start building your strategy.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule, idx) => (
              <div key={rule.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-medium text-gray-500">Rule #{idx + 1}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => duplicateRule(rule.id)}
                      className="text-gray-500 hover:text-blue-600 transition"
                      title="Duplicate rule"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() => removeRule(rule.id)}
                      className="text-gray-500 hover:text-red-600 transition"
                      title="Remove rule"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Condition</label>
                    <select
                      value={rule.condition}
                      onChange={(e) => updateRule(rule.id, 'condition', e.target.value as any)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    >
                      <option value="CROSS_ABOVE">Crosses Above</option>
                      <option value="CROSS_BELOW">Crosses Below</option>
                      <option value="GREATER_THAN">Greater Than</option>
                      <option value="LESS_THAN">Less Than</option>
                      <option value="BETWEEN">Between</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Indicator</label>
                    <select
                      value={rule.indicator1}
                      onChange={(e) => updateRule(rule.id, 'indicator1', e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                    >
                      {indicators.map(ind => (
                        <option key={ind.id} value={ind.name}>{ind.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  {rule.condition === 'BETWEEN' ? (
                    <>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Lower Bound</label>
                        <input
                          type="number"
                          value={rule.value || 0}
                          onChange={(e) => updateRule(rule.id, 'value', parseFloat(e.target.value))}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          placeholder="Min value"
                          step="any"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Upper Bound</label>
                        <input
                          type="number"
                          value={rule.value2 || 0}
                          onChange={(e) => updateRule(rule.id, 'value2', parseFloat(e.target.value))}
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                          placeholder="Max value"
                          step="any"
                        />
                      </div>
                    </>
                  ) : (
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Value</label>
                      <input
                        type="number"
                        value={rule.value || 0}
                        onChange={(e) => updateRule(rule.id, 'value', parseFloat(e.target.value))}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                        placeholder="Threshold value"
                        step="any"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Action</label>
                    <select
                      value={rule.action}
                      onChange={(e) => updateRule(rule.id, 'action', e.target.value as any)}
                      className={`w-full border border-gray-300 rounded px-3 py-2 text-sm font-medium ${getActionColor(rule.action)}`}
                    >
                      <option value="BUY">Buy Signal</option>
                      <option value="SELL">Sell Signal</option>
                      <option value="CLOSE">Close Position</option>
                    </select>
                  </div>
                  
                  {isAdvancedMode && (
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Weight (1-100)</label>
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={rule.weight || 100}
                        onChange={(e) => updateRule(rule.id, 'weight', parseInt(e.target.value))}
                        className="w-full"
                      />
                      <div className="text-center text-xs text-gray-500 mt-1">
                        {rule.weight}%
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-gray-400 mt-2">
                  When {rule.indicator1} {getConditionLabel(rule.condition)}{' '}
                  {rule.condition === 'BETWEEN' 
                    ? `${rule.value} and ${rule.value2}` 
                    : rule.value}, generate {rule.action} signal
                  {isAdvancedMode && ` with ${rule.weight}% confidence`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Strategy Summary */}
      {rules.length > 0 && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg">
          <h5 className="font-semibold text-gray-700 mb-2">Strategy Summary</h5>
          <div className="text-sm text-gray-600">
            <p><strong>Total Rules:</strong> {rules.length}</p>
            <p><strong>Buy Signals:</strong> {rules.filter(r => r.action === 'BUY').length}</p>
            <p><strong>Sell Signals:</strong> {rules.filter(r => r.action === 'SELL').length}</p>
            <p><strong>Close Signals:</strong> {rules.filter(r => r.action === 'CLOSE').length}</p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={saveStrategy}
          disabled={!validateStrategy()}
          className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
        >
          <Save size={18} /> Save Strategy
        </button>
        <button
          onClick={() => {
            setStrategyName('');
            setStrategyDescription('');
            setRules([]);
            setSelectedTemplate('');
          }}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Clear All
        </button>
      </div>
      
      {/* Validation Messages */}
      {!validateStrategy() && (
        <div className="mt-4 text-sm text-red-600">
          {!strategyName.trim() && <p>• Please enter a strategy name</p>}
          {rules.length === 0 && <p>• Please add at least one rule</p>}
        </div>
      )}</div>
  );
}