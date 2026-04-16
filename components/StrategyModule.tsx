// components/StrategyModule.tsx - UPDATED WITH FIRESTORE
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Strategy, 
  StrategyRule, 
  IndicatorConfig, 
  IndicatorCalculator,
  StrategyEngine,
  TradingSignal,
  Trade,
  StrategyPerformance 
} from '@/lib/indicators';
import { 
  Plus, Trash2, Copy, Save, TrendingUp, TrendingDown, 
  DollarSign, Percent, Activity, Play, Brain, BarChart3, 
  FolderOpen, Download, Upload, X, ChevronDown, ChevronRight,
  Zap, Target, Shield
} from 'lucide-react';
import { userDataService, UserStrategy } from '@/services/userDataService';
import { useAuth } from '@/components/AuthProvider';

// Mock data generator (replace with your actual market data)
const generateMockData = (days: number = 100) => {
  const data = [];
  let price = 100;
  
  for (let i = 0; i < days; i++) {
    const change = (Math.random() - 0.5) * 4;
    price = Math.max(10, price + change);
    
    data.push({
      timestamp: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000),
      open: price - Math.random() * 2,
      high: price + Math.random() * 3,
      low: price - Math.random() * 3,
      close: price,
      volume: Math.random() * 1000000
    });
  }
  
  return data;
};

// Strategy Card Component - Dark Theme
const StrategyCard: React.FC<{
  strategy: UserStrategy;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}> = ({ strategy, isSelected, onClick, onDelete, onDuplicate }) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-900/20 shadow-lg'
          : 'border-gray-700 bg-gray-800/50 hover:bg-gray-800 hover:border-gray-600'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-100">{strategy.name}</h4>
          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{strategy.description}</p>
        </div>
        <div className="flex gap-1 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            className="p-1 text-gray-500 hover:text-blue-400 transition"
            title="Duplicate strategy"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-gray-500 hover:text-red-400 transition"
            title="Delete strategy"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-700">
        <div className="flex items-center gap-2">
          <BarChart3 size={12} className="text-gray-500" />
          <span className="text-xs text-gray-500">{strategy.rules.length} rules</span>
        </div>
        <div className="text-xs text-gray-500">
          {new Date(strategy.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

// Strategy Builder Component - Dark Theme
const StrategyBuilderComponent: React.FC<{
  onSaveStrategy: (strategy: UserStrategy) => void;
  indicators: IndicatorConfig[];
}> = ({ onSaveStrategy, indicators }) => {
  const [strategyName, setStrategyName] = useState('');
  const [strategyDescription, setStrategyDescription] = useState('');
  const [rules, setRules] = useState<StrategyRule[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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
      description: 'Buy when RSI oversold (below 30), sell when overbought (above 70)',
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
      name: 'Bollinger Band Breakout',
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
      setIsEditing(false);
      setEditingId(null);
    }
    setShowTemplates(false);
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
    if (!strategyName.trim() || rules.length === 0) return;
    
    const strategy: UserStrategy = {
      id: editingId || Date.now().toString(),
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
    setIsEditing(false);
    setEditingId(null);
  };

  const clearForm = () => {
    setStrategyName('');
    setStrategyDescription('');
    setRules([]);
    setIsEditing(false);
    setEditingId(null);
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

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-100">
            {isEditing ? 'Edit Strategy' : 'Strategy Builder'}
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            {isEditing ? 'Modify your existing strategy' : 'Create custom trading strategies with technical indicators'}
          </p>
        </div>
        <div className="flex gap-2">
          {isEditing && (
            <button
              onClick={clearForm}
              className="px-3 py-1.5 text-sm bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition"
            >
              Cancel Edit
            </button>
          )}
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="px-3 py-1.5 text-sm bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition"
          >
            {showTemplates ? 'Hide Templates' : 'Show Templates'}
          </button>
        </div>
      </div>

      {showTemplates && (
        <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
          <h4 className="font-medium text-gray-200 mb-3">Quick Start Templates</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => loadTemplate('goldenCross')}
              className="p-3 bg-gray-800 border border-gray-700 rounded-lg text-left hover:border-blue-500 hover:bg-gray-750 transition"
            >
              <div className="font-medium text-gray-200">Golden Cross</div>
              <div className="text-xs text-gray-400 mt-1">EMA crossover strategy</div>
            </button>
            <button
              onClick={() => loadTemplate('rsiMeanReversion')}
              className="p-3 bg-gray-800 border border-gray-700 rounded-lg text-left hover:border-blue-500 hover:bg-gray-750 transition"
            >
              <div className="font-medium text-gray-200">RSI Mean Reversion</div>
              <div className="text-xs text-gray-400 mt-1">Oversold/Overbought strategy</div>
            </button>
            <button
              onClick={() => loadTemplate('bollingerBreakout')}
              className="p-3 bg-gray-800 border border-gray-700 rounded-lg text-left hover:border-blue-500 hover:bg-gray-750 transition"
            >
              <div className="font-medium text-gray-200">Bollinger Breakout</div>
              <div className="text-xs text-gray-400 mt-1">Volatility-based strategy</div>
            </button>
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Strategy Name</label>
          <input
            type="text"
            value={strategyName}
            onChange={(e) => setStrategyName(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Golden Cross Strategy"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
          <textarea
            value={strategyDescription}
            onChange={(e) => setStrategyDescription(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={2}
            placeholder="Describe your strategy's logic..."
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-300">Trading Rules</label>
            <button
              onClick={addRule}
              className="flex items-center gap-1 px-2 py-1 text-sm bg-blue-900/30 text-blue-400 rounded-lg hover:bg-blue-900/50 transition"
            >
              <Plus size={14} /> Add Rule
            </button>
          </div>

          {rules.length === 0 ? (
            <div className="text-center py-8 bg-gray-900 rounded-lg border-2 border-dashed border-gray-700">
              <Brain size={32} className="mx-auto text-gray-600 mb-2" />
              <p className="text-gray-500 text-sm">No rules added yet</p>
              <p className="text-xs text-gray-600 mt-1">Click "Add Rule" to start building your strategy</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {rules.map((rule, idx) => (
                <div key={rule.id} className="border border-gray-700 rounded-lg p-4 bg-gray-900">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-gray-400">Rule #{idx + 1}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => duplicateRule(rule.id)}
                        className="text-gray-500 hover:text-blue-400 transition"
                        title="Duplicate rule"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={() => removeRule(rule.id)}
                        className="text-gray-500 hover:text-red-400 transition"
                        title="Remove rule"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Condition</label>
                      <select
                        value={rule.condition}
                        onChange={(e) => updateRule(rule.id, 'condition', e.target.value as any)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100"
                      >
                        <option value="CROSS_ABOVE">Crosses Above</option>
                        <option value="CROSS_BELOW">Crosses Below</option>
                        <option value="GREATER_THAN">Greater Than</option>
                        <option value="LESS_THAN">Less Than</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Indicator</label>
                      <select
                        value={rule.indicator1}
                        onChange={(e) => updateRule(rule.id, 'indicator1', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100"
                      >
                        {indicators.map(ind => (
                          <option key={ind.id} value={ind.name}>{ind.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Threshold Value</label>
                      <input
                        type="number"
                        value={rule.value || 0}
                        onChange={(e) => updateRule(rule.id, 'value', parseFloat(e.target.value))}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100"
                        placeholder="Value"
                        step="any"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Action</label>
                      <select
                        value={rule.action}
                        onChange={(e) => updateRule(rule.id, 'action', e.target.value as any)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100"
                      >
                        <option value="BUY" className="text-green-400">Buy Signal</option>
                        <option value="SELL" className="text-red-400">Sell Signal</option>
                        <option value="CLOSE" className="text-yellow-400">Close Position</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500">
                    When {rule.indicator1} {getConditionLabel(rule.condition)} {rule.value}, generate {rule.action} signal
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={saveStrategy}
            disabled={!strategyName.trim() || rules.length === 0}
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition font-medium"
          >
            <Save size={18} /> {isEditing ? 'Update Strategy' : 'Save Strategy'}
          </button>
          {rules.length > 0 && (
            <button
              onClick={clearForm}
              className="px-4 py-2.5 border border-gray-700 rounded-lg hover:bg-gray-700 transition text-gray-300"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Performance Metrics Cards - Dark Theme
const MetricCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
}> = ({ title, value, icon }) => (
  <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-gray-400">{title}</span>
      <div className="p-2 rounded-lg bg-gray-700">{icon}</div>
    </div>
    <div className="text-2xl font-bold text-gray-100">{value}</div>
  </div>
);

// Strategy Tester Component - Dark Theme
const StrategyTesterComponent: React.FC<{
  strategy: UserStrategy;
  data: any[];
  indicators: Record<string, any>;
}> = ({ strategy, data, indicators }) => {
  const [testResults, setTestResults] = useState<{
    signals: TradingSignal[];
    trades: Trade[];
    performance: StrategyPerformance;
    equity: number[];
  } | null>(null);
  
  const [initialCapital, setInitialCapital] = useState(10000);
  const [positionSize, setPositionSize] = useState(0.1);
  const [isTesting, setIsTesting] = useState(false);

  const runBacktest = () => {
    setIsTesting(true);
    
    setTimeout(() => {
      // Convert UserStrategy to Strategy format for the engine
      const engineStrategy: Strategy = {
        id: strategy.id,
        name: strategy.name,
        description: strategy.description,
        rules: strategy.rules,
        enabled: strategy.enabled,
        createdAt: strategy.createdAt
      };
      
      const results = StrategyEngine.evaluateStrategy(
        data,
        indicators,
        engineStrategy,
        initialCapital,
        positionSize
      );
      setTestResults(results);
      setIsTesting(false);
    }, 100);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getPerformanceColor = (value: number) => {
    return value >= 0 ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-100">Backtest Results</h3>
        <p className="text-sm text-gray-400 mt-1">Testing: {strategy.name}</p>
      </div>

      <div className="mb-4 p-3 bg-blue-900/20 rounded-lg border border-blue-800">
        <p className="text-sm text-blue-300">{strategy.description}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Initial Capital</label>
          <input
            type="number"
            value={initialCapital}
            onChange={(e) => setInitialCapital(parseFloat(e.target.value))}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">Position Size (%)</label>
          <input
            type="number"
            value={positionSize * 100}
            onChange={(e) => setPositionSize(parseFloat(e.target.value) / 100)}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100"
            step="5"
          />
        </div>
      </div>

      <button
        onClick={runBacktest}
        disabled={isTesting}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 transition font-medium mb-6"
      >
        <Play size={16} /> {isTesting ? 'Running Backtest...' : 'Run Backtest'}
      </button>

      {testResults && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricCard
              title="Total Profit"
              value={formatCurrency(testResults.performance.totalProfit)}
              icon={<DollarSign size={18} className="text-green-400" />}
            />
            <MetricCard
              title="Win Rate"
              value={`${testResults.performance.winRate.toFixed(1)}%`}
              icon={<Percent size={18} className="text-blue-400" />}
            />
            <MetricCard
              title="Total Trades"
              value={testResults.performance.totalTrades.toString()}
              icon={<Activity size={18} className="text-purple-400" />}
            />
            <MetricCard
              title="Max Drawdown"
              value={`${testResults.performance.maxDrawdown.toFixed(1)}%`}
              icon={<TrendingDown size={18} className="text-red-400" />}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-900 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">Average Profit/Trade</div>
              <div className={`text-sm font-semibold ${getPerformanceColor(testResults.performance.averageProfit)}`}>
                {formatCurrency(testResults.performance.averageProfit)}
              </div>
            </div>
            <div className="p-3 bg-gray-900 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">Sharpe Ratio</div>
              <div className="text-sm font-semibold text-gray-100">
                {testResults.performance.sharpeRatio.toFixed(2)}
              </div>
            </div>
          </div>

          {testResults.trades.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-200 mb-3">Recent Trades</h4>
              <div className="max-h-64 overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-900 border-b border-gray-700">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-400">Entry</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-400">Exit</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-400">Profit</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-400">Return</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {testResults.trades.slice(-5).map((trade, idx) => (
                      <tr key={idx} className="hover:bg-gray-800">
                        <td className="px-3 py-2 text-xs text-gray-300">{formatCurrency(trade.entryPrice)}</td>
                        <td className="px-3 py-2 text-xs text-gray-300">{formatCurrency(trade.exitPrice)}</td>
                        <td className={`px-3 py-2 text-xs font-medium ${getPerformanceColor(trade.profit)}`}>
                          {formatCurrency(trade.profit)}
                        </td>
                        <td className={`px-3 py-2 text-xs font-medium ${getPerformanceColor(trade.profitPercent)}`}>
                          {formatPercent(trade.profitPercent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {!testResults && !isTesting && (
        <div className="text-center py-12 text-gray-500">
          <BarChart3 size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Click "Run Backtest" to test your strategy</p>
        </div>
      )}
    </div>
  );
};

// Main Strategy Module Component - UPDATED with Firestore
export const StrategyModule: React.FC = () => {
  const [strategies, setStrategies] = useState<UserStrategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<UserStrategy | null>(null);
  const [activeTab, setActiveTab] = useState<'builder' | 'tester'>('builder');
  const [marketData] = useState(() => generateMockData(200));
  const [indicators, setIndicators] = useState<Record<string, any>>({});
  const [showImportExport, setShowImportExport] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  const indicatorConfigs: IndicatorConfig[] = [
    { id: '1', name: 'SMA_20', type: 'SMA', params: { period: 20 }, color: '#3B82F6', isVisible: true },
    { id: '2', name: 'EMA_9', type: 'EMA', params: { period: 9 }, color: '#EF4444', isVisible: true },
    { id: '3', name: 'RSI_14', type: 'RSI', params: { period: 14 }, color: '#10B981', isVisible: true },
    { id: '4', name: 'BB_UPPER', type: 'BB', params: { period: 20, stdDev: 2 }, color: '#8B5CF6', isVisible: true },
    { id: '5', name: 'BB_LOWER', type: 'BB', params: { period: 20, stdDev: 2 }, color: '#8B5CF6', isVisible: true },
  ];

  // Load strategies from Firestore
  useEffect(() => {
    const loadStrategies = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        const savedStrategies = await userDataService.getStrategies();
        setStrategies(savedStrategies);
        
        // Load previously selected strategy if any
        const savedSelectedId = localStorage.getItem('selected_strategy_id');
        if (savedSelectedId && savedStrategies.length > 0) {
          const found = savedStrategies.find(s => s.id === savedSelectedId);
          if (found) setSelectedStrategy(found);
        }
      } catch (error) {
        console.error('Error loading strategies:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadStrategies();
  }, [user]);

  // Save selected strategy ID to localStorage (just for UI state, not the actual strategies)
  useEffect(() => {
    if (selectedStrategy) {
      localStorage.setItem('selected_strategy_id', selectedStrategy.id);
    }
  }, [selectedStrategy]);

  // Calculate indicators
  useEffect(() => {
    const prices = marketData.map(d => d.close);
    const calculatedIndicators: Record<string, any> = {};
    
    indicatorConfigs.forEach(config => {
      if (config.type === 'SMA') {
        calculatedIndicators[config.name] = IndicatorCalculator.calculateSMA(prices, config.params.period);
      } else if (config.type === 'EMA') {
        calculatedIndicators[config.name] = IndicatorCalculator.calculateEMA(prices, config.params.period);
      } else if (config.type === 'RSI') {
        calculatedIndicators[config.name] = IndicatorCalculator.calculateRSI(prices, config.params.period);
      } else if (config.type === 'BB') {
        const bb = IndicatorCalculator.calculateBollingerBands(prices, config.params.period, config.params.stdDev);
        if (config.name === 'BB_UPPER') {
          calculatedIndicators[config.name] = bb.upper;
        } else if (config.name === 'BB_LOWER') {
          calculatedIndicators[config.name] = bb.lower;
        }
      }
    });
    
    setIndicators(calculatedIndicators);
  }, []);

  const handleSaveStrategy = async (strategy: UserStrategy) => {
    const existingIndex = strategies.findIndex(s => s.id === strategy.id);
    let newStrategies;
    
    if (existingIndex >= 0) {
      newStrategies = [...strategies];
      newStrategies[existingIndex] = strategy;
      await userDataService.updateStrategy(strategy);
    } else {
      newStrategies = [...strategies, strategy];
      await userDataService.addStrategy(strategy);
    }
    
    setStrategies(newStrategies);
    setSelectedStrategy(strategy);
    setActiveTab('tester');
  };

  const handleDeleteStrategy = async (id: string) => {
    const updated = strategies.filter(s => s.id !== id);
    setStrategies(updated);
    await userDataService.deleteStrategy(id);
    
    if (selectedStrategy?.id === id) {
      setSelectedStrategy(updated.length > 0 ? updated[0] : null);
      if (updated.length === 0) setActiveTab('builder');
    }
  };

  const handleDuplicateStrategy = async (id: string) => {
    const original = strategies.find(s => s.id === id);
    if (original) {
      const duplicated: UserStrategy = {
        ...original,
        id: Date.now().toString(),
        name: `${original.name} (Copy)`,
        createdAt: new Date()
      };
      const newStrategies = [...strategies, duplicated];
      setStrategies(newStrategies);
      await userDataService.addStrategy(duplicated);
      setSelectedStrategy(duplicated);
      setActiveTab('tester');
    }
  };

  const exportStrategies = () => {
    const data = JSON.stringify(strategies, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `strategies_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importStrategies = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          const validated = imported.map((s: any) => ({
            ...s,
            id: Date.now() + Math.random().toString(),
            createdAt: new Date()
          }));
          
          // Save each imported strategy to Firestore
          for (const strategy of validated) {
            await userDataService.addStrategy(strategy);
          }
          
          const allStrategies = [...strategies, ...validated];
          setStrategies(allStrategies);
          alert(`Successfully imported ${validated.length} strategies!`);
        } catch (error) {
          console.error('Failed to import strategies:', error);
          alert('Invalid strategy file');
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  const clearAllStrategies = async () => {
    if (confirm('Are you sure you want to delete all strategies? This cannot be undone.')) {
      for (const strategy of strategies) {
        await userDataService.deleteStrategy(strategy.id);
      }
      setStrategies([]);
      setSelectedStrategy(null);
      setActiveTab('builder');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading strategies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-2xl font-bold text-white">Algorithmic Trading Strategies</h2>
            <p className="text-gray-400 mt-1">Create, backtest, and optimize your trading strategies</p>
            {user && <p className="text-xs text-green-400 mt-1">✓ Saved to cloud - accessible across devices</p>}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowImportExport(!showImportExport)}
              className="px-4 py-2 text-sm bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition flex items-center gap-2 border border-gray-700"
            >
              <FolderOpen size={16} /> Manage Strategies
            </button>
            
            {showImportExport && (
              <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-10">
                <button
                  onClick={exportStrategies}
                  className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2"
                >
                  <Download size={14} /> Export Strategies
                </button>
                <label className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2 cursor-pointer">
                  <Upload size={14} /> Import Strategies
                  <input
                    type="file"
                    accept=".json"
                    onChange={importStrategies}
                    className="hidden"
                  />
                </label>
                {strategies.length > 0 && (
                  <button
                    onClick={clearAllStrategies}
                    className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2 border-t border-gray-700"
                  >
                    <Trash2 size={14} /> Clear All Strategies
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 mb-6">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('builder')}
            className={`pb-3 px-1 font-medium transition ${
              activeTab === 'builder'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Strategy Builder
          </button>
          <button
            onClick={() => setActiveTab('tester')}
            className={`pb-3 px-1 font-medium transition ${
              activeTab === 'tester'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Strategy Tester {!selectedStrategy && strategies.length > 0 && <span className="text-xs text-gray-500 ml-1">(Select a strategy)</span>}
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Strategy List */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-200">Your Strategies</h3>
              <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
                {strategies.length}
              </span>
            </div>
            
            {strategies.length === 0 ? (
              <div className="text-center py-12">
                <Brain size={48} className="mx-auto text-gray-600 mb-3" />
                <p className="text-gray-500 text-sm">No strategies created yet</p>
                <p className="text-xs text-gray-600 mt-1">Build your first strategy in the Builder tab</p>
                <p className="text-xs text-green-500 mt-2">✓ Strategies will be saved to cloud</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-150 overflow-y-auto pr-1 custom-scrollbar">
                {strategies.map(strategy => (
                  <StrategyCard
                    key={strategy.id}
                    strategy={strategy}
                    isSelected={selectedStrategy?.id === strategy.id}
                    onClick={() => setSelectedStrategy(strategy)}
                    onDelete={() => handleDeleteStrategy(strategy.id)}
                    onDuplicate={() => handleDuplicateStrategy(strategy.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Builder/Tester */}
        <div className="lg:col-span-2">
          {activeTab === 'builder' ? (
            <StrategyBuilderComponent
              onSaveStrategy={handleSaveStrategy}
              indicators={indicatorConfigs}
            />
          ) : (
            selectedStrategy && Object.keys(indicators).length > 0 ? (
              <StrategyTesterComponent
                strategy={selectedStrategy}
                data={marketData}
                indicators={indicators}
              />
            ) : (
              <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-12 text-center">
                <BarChart3 size={48} className="mx-auto text-gray-600 mb-3" />
                <p className="text-gray-400">Select a strategy from the left to start backtesting</p>
                {strategies.length === 0 && (
                  <button
                    onClick={() => setActiveTab('builder')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Create Your First Strategy
                  </button>
                )}
              </div>
            )
          )}
        </div>
      </div>

      {/* Add custom scrollbar styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </div>
  );
};