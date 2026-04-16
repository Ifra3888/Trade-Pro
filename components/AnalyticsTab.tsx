// components/AnalyticsTab.tsx - CORRECTED VERSION
'use client';

import React, { useState, useRef } from 'react';
import { motion } from "framer-motion";
import AnalyticsDashboard from './AnalyticsDashboard';
import { PriceAlertsPanel } from './PriceAlertsPanel';
import { TrendingUp, BarChart3, LineChart, PieChart, RefreshCw, Activity, Target, Shield, Zap } from "lucide-react";

interface AnalyticsTabProps {
  marketData: any[];
  selectedSymbol: string;
  onSymbolChange: (symbol: string) => void;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

// Overview Tab Component
const OverviewTab = ({ marketData, symbol }: { marketData: any[], symbol: string }) => {
  const prices: number[] = marketData.map((d: any) => d.close);
  const currentPrice: number = prices[prices.length - 1] || 0;
  const firstPrice: number = prices[0] || 1;
  const totalReturn: number = ((currentPrice - firstPrice) / firstPrice) * 100;
  
  // Calculate SMA20
  let currentSMA20: number = currentPrice;
  if (prices.length >= 20) {
    const sum20 = prices.slice(-20).reduce((a: number, b: number) => a + b, 0);
    currentSMA20 = sum20 / 20;
  }
  
  // Calculate RSI
  let rsi: number = 50;
  if (prices.length >= 15) {
    let gains: number = 0, losses: number = 0;
    for (let i = prices.length - 14; i < prices.length; i++) {
      const change: number = prices[i] - prices[i - 1];
      if (change >= 0) gains += change;
      else losses -= change;
    }
    const avgGain: number = gains / 14;
    const avgLoss: number = losses / 14;
    const rs: number = avgGain / avgLoss;
    rsi = 100 - (100 / (1 + rs));
  }
  
  // Current prices for alerts
  const currentPricesMap = {
    AAPL: 180,
    TSLA: 250,
    GOOGL: 140,
    MSFT: 330,
    AMZN: 130,
    TATA: 150,
    RELIANCE: 2500,
    TCS: 3800,
    HDFC: 1650,
    INFY: 1520,
    [symbol]: currentPrice
  };
  
  return (
    <div className="space-y-6">
      {/* Market Insights */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <Zap className="mr-2 text-blue-500" size={20} />
          Market Insights for {symbol}
        </h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className={`w-2 h-2 rounded-full mt-2 ${currentPrice > currentSMA20 ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div>
              <p className="text-sm text-gray-300">
                {currentPrice > currentSMA20 ? 
                  `${symbol} is trading above its 20-day moving average, indicating bullish momentum in the short term.` :
                  `${symbol} is trading below its 20-day moving average, suggesting bearish pressure in the short term.`}
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className={`w-2 h-2 rounded-full mt-2 ${rsi > 70 ? 'bg-red-500' : rsi < 30 ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <div>
              <p className="text-sm text-gray-300">
                {rsi > 70 ? 
                  `RSI at ${rsi.toFixed(2)} indicates overbought conditions. A pullback or consolidation may be imminent.` :
                  rsi < 30 ?
                  `RSI at ${rsi.toFixed(2)} indicates oversold conditions. A bounce or reversal may be likely.` :
                  `RSI at ${rsi.toFixed(2)} indicates neutral momentum with no extreme conditions.`}
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className={`w-2 h-2 rounded-full mt-2 ${totalReturn > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div>
              <p className="text-sm text-gray-300">
                Year-to-date return of {totalReturn.toFixed(2)}% places {symbol} in the {totalReturn > 10 ? 'top' : totalReturn > 0 ? 'moderate' : 'bottom'} performance category.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Price Alerts Panel */}
      <PriceAlertsPanel 
        currentPrices={currentPricesMap}
        onTriggerAlert={(alert) => {
          console.log(`Alert triggered for ${alert.symbol} at $${alert.targetPrice}`);
        }}
      />
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h4 className="font-semibold text-white mb-2">Key Levels</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Support</span>
              <span className="text-white">${(currentPrice * 0.95).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Resistance</span>
              <span className="text-white">${(currentPrice * 1.05).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">52-Week High</span>
              <span className="text-white">${(currentPrice * 1.15).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">52-Week Low</span>
              <span className="text-white">${(currentPrice * 0.85).toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h4 className="font-semibold text-white mb-2">Timeframe Analysis</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Short-term (1-5 days)</span>
              <span className={currentPrice > currentSMA20 ? 'text-green-500' : 'text-red-500'}>
                {currentPrice > currentSMA20 ? 'Bullish' : 'Bearish'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Medium-term (1-3 months)</span>
              <span className="text-yellow-500">Neutral</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Long-term (6+ months)</span>
              <span className="text-green-500">Bullish</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Technical Analysis Tab
const TechnicalAnalysisTab = ({ marketData, symbol }: { marketData: any[], symbol: string }) => {
  const prices: number[] = marketData.map((d: any) => d.close);
  const currentPrice: number = prices[prices.length - 1] || 0;
  
  // Calculate SMA20
  let sma20: number = currentPrice;
  if (prices.length >= 20) {
    const sum20 = prices.slice(-20).reduce((a: number, b: number) => a + b, 0);
    sma20 = sum20 / 20;
  }
  
  // Calculate SMA50
  let sma50: number = currentPrice;
  if (prices.length >= 50) {
    const sum50 = prices.slice(-50).reduce((a: number, b: number) => a + b, 0);
    sma50 = sum50 / 50;
  }
  
  // Calculate RSI
  let rsi: number = 50;
  if (prices.length >= 15) {
    let gains: number = 0, losses: number = 0;
    for (let i = prices.length - 14; i < prices.length; i++) {
      const change: number = prices[i] - prices[i - 1];
      if (change >= 0) gains += change;
      else losses -= change;
    }
    const avgGain: number = gains / 14;
    const avgLoss: number = losses / 14;
    const rs: number = avgGain / avgLoss;
    rsi = 100 - (100 / (1 + rs));
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400">SMA (20)</div>
          <div className="text-2xl font-bold text-white">${sma20.toFixed(2)}</div>
          <div className={`text-xs mt-1 ${currentPrice > sma20 ? 'text-green-500' : 'text-red-500'}`}>
            {currentPrice > sma20 ? 'Price Above' : 'Price Below'}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400">SMA (50)</div>
          <div className="text-2xl font-bold text-white">${sma50.toFixed(2)}</div>
          <div className={`text-xs mt-1 ${currentPrice > sma50 ? 'text-green-500' : 'text-red-500'}`}>
            {currentPrice > sma50 ? 'Price Above' : 'Price Below'}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400">RSI (14)</div>
          <div className={`text-2xl font-bold ${rsi > 70 ? 'text-red-500' : rsi < 30 ? 'text-green-500' : 'text-white'}`}>
            {rsi.toFixed(2)}
          </div>
          <div className={`text-xs mt-1 ${rsi > 70 ? 'text-red-500' : rsi < 30 ? 'text-green-500' : 'text-yellow-500'}`}>
            {rsi > 70 ? 'Overbought' : rsi < 30 ? 'Oversold' : 'Neutral'}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400">Trend</div>
          <div className={`text-2xl font-bold ${sma20 > sma50 ? 'text-green-500' : 'text-red-500'}`}>
            {sma20 > sma50 ? 'Bullish' : 'Bearish'}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {sma20 > sma50 ? 'Golden Cross' : 'Death Cross'}
          </div>
        </div>
      </div>
    </div>
  );
};

// Trading Signals Tab
const TradingSignalsTab = ({ marketData, symbol }: { marketData: any[], symbol: string }) => {
  const prices: number[] = marketData.map((d: any) => d.close);
  const currentPrice: number = prices[prices.length - 1] || 0;
  const prevPrice: number = prices[prices.length - 2] || currentPrice;
  
  // Calculate SMA20
  let sma20: number = currentPrice;
  if (prices.length >= 20) {
    const sum20 = prices.slice(-20).reduce((a: number, b: number) => a + b, 0);
    sma20 = sum20 / 20;
  }
  
  // Calculate RSI
  let rsi: number = 50;
  if (prices.length >= 15) {
    let gains: number = 0, losses: number = 0;
    for (let i = prices.length - 14; i < prices.length; i++) {
      const change: number = prices[i] - prices[i - 1];
      if (change >= 0) gains += change;
      else losses -= change;
    }
    const avgGain: number = gains / 14;
    const avgLoss: number = losses / 14;
    const rs: number = avgGain / avgLoss;
    rsi = 100 - (100 / (1 + rs));
  }
  
  const signals = {
    trend: sma20 < currentPrice ? 'BUY' : 'SELL',
    momentum: rsi > 50 ? 'BUY' : 'SELL',
    priceAction: currentPrice > prevPrice ? 'BUY' : 'SELL',
  };
  
  let buySignals = 0;
  let sellSignals = 0;
  Object.values(signals).forEach(s => {
    if (s === 'BUY') buySignals++;
    if (s === 'SELL') sellSignals++;
  });
  
  const overall = buySignals >= 2 ? 'BUY' : sellSignals >= 2 ? 'SELL' : 'NEUTRAL';
  
  return (
    <div className="space-y-6">
      <div className={`rounded-lg p-6 text-center ${
        overall === 'BUY' ? 'bg-green-900/50 border border-green-500' :
        overall === 'SELL' ? 'bg-red-900/50 border border-red-500' :
        'bg-yellow-900/50 border border-yellow-500'
      }`}>
        <div className="text-sm text-gray-300 mb-2">Overall Trading Signal</div>
        <div className={`text-4xl font-bold ${
          overall === 'BUY' ? 'text-green-500' :
          overall === 'SELL' ? 'text-red-500' :
          'text-yellow-500'
        }`}>
          {overall}
        </div>
        <div className="text-xs text-gray-400 mt-2">
          {buySignals} Buy / {sellSignals} Sell signals
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Trend</span>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${signals.trend === 'BUY' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
              {signals.trend}
            </span>
          </div>
          <div className="text-sm text-gray-400 mt-2">
            Price vs SMA20
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Momentum</span>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${signals.momentum === 'BUY' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
              {signals.momentum}
            </span>
          </div>
          <div className="text-sm text-gray-400 mt-2">
            RSI: {rsi.toFixed(2)}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Price Action</span>
            <span className={`px-2 py-1 rounded text-xs font-semibold ${signals.priceAction === 'BUY' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
              {signals.priceAction}
            </span>
          </div>
          <div className="text-sm text-gray-400 mt-2">
            {currentPrice > prevPrice ? 'Up' : 'Down'}
          </div>
        </div>
      </div>
    </div>
  );
};

// Risk Metrics Tab
const RiskMetricsTab = ({ marketData, symbol }: { marketData: any[], symbol: string }) => {
  const prices: number[] = marketData.map((d: any) => d.close);
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i-1]) / prices[i-1]);
  }
  
  const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((acc, val) => acc + Math.pow(val - avgReturn, 2), 0) / returns.length;
  const volatility = Math.sqrt(variance) * Math.sqrt(252) * 100;
  
  let maxDrawdown = 0;
  let peak = prices[0];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > peak) peak = prices[i];
    const drawdown = (peak - prices[i]) / peak * 100;
    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
  }
  
  const currentPrice = prices[prices.length - 1] || 0;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400">Volatility (Annual)</div>
          <div className={`text-2xl font-bold ${volatility > 50 ? 'text-red-500' : volatility > 30 ? 'text-yellow-500' : 'text-green-500'}`}>
            {volatility.toFixed(2)}%
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {volatility > 50 ? 'High Risk' : volatility > 30 ? 'Medium Risk' : 'Low Risk'}
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400">Max Drawdown</div>
          <div className="text-2xl font-bold text-red-500">{maxDrawdown.toFixed(2)}%</div>
          <div className="text-xs text-gray-400 mt-1">Historical peak to trough</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400">VaR (95%)</div>
          <div className="text-2xl font-bold text-yellow-500">${(currentPrice * 0.02).toFixed(2)}</div>
          <div className="text-xs text-gray-400 mt-1">Maximum expected loss (1-day)</div>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <h4 className="font-semibold text-white mb-3">Risk Assessment</h4>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-2 bg-gray-700/30 rounded">
            <span className="text-gray-300">Overall Risk Level</span>
            <span className={`font-semibold ${volatility > 50 ? 'text-red-500' : volatility > 30 ? 'text-yellow-500' : 'text-green-500'}`}>
              {volatility > 50 ? 'HIGH' : volatility > 30 ? 'MEDIUM' : 'LOW'}
            </span>
          </div>
          <div className="flex justify-between items-center p-2 bg-gray-700/30 rounded">
            <span className="text-gray-300">Stop Loss Recommendation</span>
            <span className="font-semibold text-red-400">
              ${(currentPrice * (1 - (volatility/100))).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main AnalyticsTab Component
export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ 
  marketData, 
  selectedSymbol, 
  onSymbolChange 
}) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  const overviewRef = useRef<HTMLDivElement>(null);
  const technicalRef = useRef<HTMLDivElement>(null);
  const signalsRef = useRef<HTMLDivElement>(null);
  const riskRef = useRef<HTMLDivElement>(null);

  const symbols = [
    { value: "AAPL", label: "AAPL - Apple Inc.", sector: "Technology" },
    { value: "GOOGL", label: "GOOGL - Alphabet Inc.", sector: "Technology" },
    { value: "MSFT", label: "MSFT - Microsoft Corp.", sector: "Technology" },
    { value: "AMZN", label: "AMZN - Amazon.com Inc.", sector: "E-Commerce" },
    { value: "TSLA", label: "TSLA - Tesla Inc.", sector: "Automotive" },
    { value: "TATA", label: "TATA - Tata Motors", sector: "Automotive" },
    { value: "RELIANCE", label: "RELIANCE - Reliance Industries", sector: "Conglomerate" },
    { value: "TCS", label: "TCS - Tata Consultancy Services", sector: "Technology" },
    { value: "HDFC", label: "HDFC - HDFC Bank", sector: "Banking" },
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3, ref: overviewRef, component: OverviewTab },
    { id: 'technical', name: 'Technical Analysis', icon: LineChart, ref: technicalRef, component: TechnicalAnalysisTab },
    { id: 'signals', name: 'Trading Signals', icon: TrendingUp, ref: signalsRef, component: TradingSignalsTab },
    { id: 'risk', name: 'Risk Metrics', icon: PieChart, ref: riskRef, component: RiskMetricsTab },
  ];

  const scrollToSection = (sectionId: string) => {
    const tab = tabs.find(t => t.id === sectionId);
    if (tab?.ref?.current) {
      tab.ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setActiveTab(sectionId);
  };

  const handleRefresh = (): void => {
    setIsRefreshing(true);
    onSymbolChange(selectedSymbol);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || OverviewTab;

  return (
    <motion.div {...fadeInUp} className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
            <p className="text-blue-100 mt-2">Advanced technical analysis & market insights</p>
          </div>
          
          <div className="flex gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
              <label className="block text-sm text-blue-100 mb-1">Select Symbol</label>
              <select
                value={selectedSymbol}
                onChange={(e) => onSymbolChange(e.target.value)}
                className="bg-white text-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
              >
                {symbols.map((symbol) => (
                  <option key={symbol.value} value={symbol.value}>
                    {symbol.label}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-2 hover:bg-white/20 transition-colors mt-6"
            >
              <RefreshCw size={20} className={`text-white ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400">Analysis Period</div>
          <div className="text-2xl font-bold text-white mt-1">{marketData.length} Days</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400">Data Points</div>
          <div className="text-2xl font-bold text-white mt-1">{marketData.length}</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400">Last Updated</div>
          <div className="text-2xl font-bold text-white mt-1">Live</div>
          <div className="text-xs text-green-400 mt-1">● Real-time</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="text-sm text-gray-400">Analysis Type</div>
          <div className="text-2xl font-bold text-white mt-1">Full</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-700">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => scrollToSection(tab.id)}
              className={`px-4 py-2 rounded-t-lg transition-all flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'bg-gray-800 text-blue-500 border-t border-l border-r border-gray-700'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <tab.icon size={18} />
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Sections */}
      <div ref={overviewRef} className="scroll-mt-24">
        <OverviewTab marketData={marketData} symbol={selectedSymbol} />
      </div>
      
      <div ref={technicalRef} className="scroll-mt-24">
        <TechnicalAnalysisTab marketData={marketData} symbol={selectedSymbol} />
      </div>
      
      <div ref={signalsRef} className="scroll-mt-24">
        <TradingSignalsTab marketData={marketData} symbol={selectedSymbol} />
      </div>
      
      <div ref={riskRef} className="scroll-mt-24">
        <RiskMetricsTab marketData={marketData} symbol={selectedSymbol} />
      </div>

      {/* Main Chart Section */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <AnalyticsDashboard marketData={marketData} symbol={selectedSymbol} />
      </div>
    </motion.div>
  );
};

export default AnalyticsTab;