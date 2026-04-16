// components/StrategyTester.tsx
import React, { useState, useEffect } from 'react';
import { Strategy, StrategyEngine, TradingSignal, Trade, StrategyPerformance } from '@/lib/indicators';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Percent, Activity, AlertCircle } from 'lucide-react';

interface StrategyTesterProps {
  strategy: Strategy;
  data: any[];
  indicators: Record<string, any>;
}

export const StrategyTester: React.FC<StrategyTesterProps> = ({ strategy, data, indicators }) => {
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
    
    // Simulate async backtest
    setTimeout(() => {
      const results = StrategyEngine.evaluateStrategy(
        data,
        indicators,
        strategy,
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
    return value >= 0 ? 'text-green-600' : 'text-red-600';
  };

  // Prepare chart data
  const chartData = testResults?.equity.map((value, idx) => ({
    index: idx,
    equity: value,
    returns: idx > 0 ? ((value - testResults.equity[idx - 1]) / testResults.equity[idx - 1]) * 100 : 0
  })) || [];

  return (
    <div className="bg-white rounded-lg shadow-xl p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Strategy Backtest</h3>
      
      {/* Strategy Info */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Testing: {strategy.name}</h4>
        <p className="text-sm text-blue-700">{strategy.description}</p>
      </div>

      {/* Test Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Initial Capital
          </label>
          <input
            type="number"
            value={initialCapital}
            onChange={(e) => setInitialCapital(parseFloat(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Position Size (% of capital)
          </label>
          <input
            type="number"
            value={positionSize * 100}
            onChange={(e) => setPositionSize(parseFloat(e.target.value) / 100)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            step="1"
            min="1"
            max="100"
          />
        </div>
      </div>

      <button
        onClick={runBacktest}
        disabled={isTesting}
        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition mb-6"
      >
        {isTesting ? 'Running Backtest...' : 'Run Backtest'}
      </button>

      {/* Results */}
      {testResults && (
        <div className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <DollarSign size={18} />
                <span className="text-sm">Total Profit</span>
              </div>
              <div className={`text-xl font-bold ${getPerformanceColor(testResults.performance.totalProfit)}`}>
                {formatCurrency(testResults.performance.totalProfit)}
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Percent size={18} />
                <span className="text-sm">Win Rate</span>
              </div>
              <div className="text-xl font-bold text-blue-600">
                {testResults.performance.winRate.toFixed(1)}%
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Activity size={18} />
                <span className="text-sm">Total Trades</span>
              </div>
              <div className="text-xl font-bold text-gray-800">
                {testResults.performance.totalTrades}
              </div>
              <div className="text-xs text-gray-500">
                Wins: {testResults.performance.winningTrades} | Losses: {testResults.performance.losingTrades}
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <TrendingUp size={18} />
                <span className="text-sm">Sharpe Ratio</span>
              </div>
              <div className="text-xl font-bold text-gray-800">
                {testResults.performance.sharpeRatio.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Equity Curve */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-3">Equity Curve</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any) => formatCurrency(value)}
                  labelFormatter={(label) => `Trade #${label}`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="equity" 
                  stroke="#3B82F6" 
                  name="Equity"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Trade List */}
          {testResults.trades.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Trade History</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Entry Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Entry Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Exit Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Exit Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Profit</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Return</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {testResults.trades.slice(-10).map((trade, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm">{new Date(trade.entryTime).toLocaleDateString()}</td>
                        <td className="px-4 py-2 text-sm">{formatCurrency(trade.entryPrice)}</td>
                        <td className="px-4 py-2 text-sm">{new Date(trade.exitTime).toLocaleDateString()}</td>
                        <td className="px-4 py-2 text-sm">{formatCurrency(trade.exitPrice)}</td>
                        <td className={`px-4 py-2 text-sm font-medium ${getPerformanceColor(trade.profit)}`}>
                          {formatCurrency(trade.profit)}
                        </td>
                        <td className={`px-4 py-2 text-sm font-medium ${getPerformanceColor(trade.profitPercent)}`}>
                          {formatPercent(trade.profitPercent)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {testResults.trades.length > 10 && (
                <p className="text-xs text-gray-500 mt-2">Showing last 10 of {testResults.trades.length} trades</p>
              )}
            </div>
          )}

          {/* Risk Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2 text-red-600 mb-1">
                <TrendingDown size={18} />
                <span className="text-sm">Maximum Drawdown</span>
              </div>
              <div className="text-xl font-bold text-red-600">
                {testResults.performance.maxDrawdown.toFixed(2)}%
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 text-green-600 mb-1">
                <Activity size={18} />
                <span className="text-sm">Average Profit per Trade</span>
              </div>
              <div className={`text-xl font-bold ${getPerformanceColor(testResults.performance.averageProfit)}`}>
                {formatCurrency(testResults.performance.averageProfit)}
              </div>
            </div>
          </div>
        </div>
      )}

      {!testResults && !isTesting && (
        <div className="text-center py-12 text-gray-500">
          <AlertCircle size={48} className="mx-auto mb-3 opacity-50" />
          <p>Click "Run Backtest" to test your strategy</p>
        </div>
      )}
    </div>
  );
};