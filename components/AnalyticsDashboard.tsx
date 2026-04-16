// components/AnalyticsDashboard.tsx - CORRECTED VERSION
'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, ComposedChart, Bar, Area
} from 'recharts';
import { motion } from "framer-motion";
import { Download, Bell, RefreshCw, TrendingUp, TrendingDown, AlertCircle, BarChart2 } from 'lucide-react';
import jsPDF from 'jspdf';


interface AnalyticsDashboardProps {
  marketData: any[];
  symbol: string;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ marketData, symbol }) => {
  const [indicators, setIndicators] = useState({
    sma20: [] as number[],
    sma50: [] as number[],
    rsi: [] as number[],
   
    volume: [] as number[],
   
    bollingerUpper: [] as number[],
    bollingerLower: [] as number[],
    bollingerMiddle: [] as number[],
   
  });
  
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    'price', 'sma20', 'sma50'
  ]);
  const [timeRange, setTimeRange] = useState(100);
  const [lastAlert, setLastAlert] = useState<string | null>(null);
  const [priceAlerts, setPriceAlerts] = useState<{ price: number; symbol: string }[]>([]);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  // Calculate indicators whenever marketData changes
  useEffect(() => {
    if (marketData && marketData.length > 0) {
      calculateAllIndicators();
    }
  }, [marketData]);

  // Check for price alerts
  useEffect(() => {
    if (marketData.length > 0 && priceAlerts.length > 0) {
      const currentPrice = marketData[marketData.length - 1]?.close;
      priceAlerts.forEach(alert => {
        if (currentPrice >= alert.price && alert.symbol === symbol) {
          setLastAlert(`🎯 Price target reached! ${symbol} hit $${currentPrice.toFixed(2)}`);
          setTimeout(() => setLastAlert(null), 5000);
        }
      });
    }
  }, [marketData, priceAlerts, symbol]);

  const calculateSMA = (data: number[], period: number) => {
    const result = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
    return result;
  };

  const calculateEMA = (data: number[], period: number) => {
    const multiplier = 2 / (period + 1);
    const ema = [data[0]];
    for (let i = 1; i < data.length; i++) {
      ema.push((data[i] - ema[i - 1]) * multiplier + ema[i - 1]);
    }
    return ema;
  };

  const calculateRSI = (data: number[], period: number) => {
    const rsi = [];
    for (let i = period; i < data.length; i++) {
      let gains = 0, losses = 0;
      for (let j = i - period + 1; j <= i; j++) {
        const change = data[j] - data[j - 1];
        if (change >= 0) gains += change;
        else losses -= change;
      }
      const avgGain = gains / period;
      const avgLoss = losses / period;
      const rs = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }
    return rsi;
  };

  const calculateBollingerBands = (data: number[], period: number, stdDev: number) => {
    const upper = [], lower = [], middle = [];
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const mean = slice.reduce((a, b) => a + b, 0) / period;
      const variance = slice.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / period;
      const std = Math.sqrt(variance);
      middle.push(mean);
      upper.push(mean + stdDev * std);
      lower.push(mean - stdDev * std);
    }
    return { upper, lower, middle };
  };

  
  const calculateAllIndicators = () => {
    const prices = marketData.map((d: any) => d.close);
    const volumes = marketData.map((d: any) => d.volume);
    
    const sma20 = calculateSMA(prices, 20);
    const sma50 = calculateSMA(prices, 50);
    const rsi = calculateRSI(prices, 14);
   
    const bollinger = calculateBollingerBands(prices, 20, 5);
   
    
    const sma20Aligned = new Array(prices.length).fill(null);
    const sma50Aligned = new Array(prices.length).fill(null);
    const rsiAligned = new Array(prices.length).fill(null);
   
    const bollingerUpperAligned = new Array(prices.length).fill(null);
    const bollingerLowerAligned = new Array(prices.length).fill(null);
    const bollingerMiddleAligned = new Array(prices.length).fill(null);
    
    
    for (let i = 0; i < sma20.length; i++) sma20Aligned[i + 19] = sma20[i];
    for (let i = 0; i < sma50.length; i++) sma50Aligned[i + 49] = sma50[i];
    for (let i = 0; i < rsi.length; i++) rsiAligned[i + 14] = rsi[i];
   
    for (let i = 0; i < bollinger.upper.length; i++) {
      bollingerUpperAligned[i + 19] = bollinger.upper[i];
      bollingerLowerAligned[i + 19] = bollinger.lower[i];
      bollingerMiddleAligned[i + 19] = bollinger.middle[i];
    }
    
    
    setIndicators({
      sma20: sma20Aligned, sma50: sma50Aligned, rsi: rsiAligned,
      volume: volumes,
     
      bollingerUpper: bollingerUpperAligned, bollingerLower: bollingerLowerAligned,
      bollingerMiddle: bollingerMiddleAligned
     
    });
  };

  const getChartData = () => {
    const data = [];
    const startIdx = Math.max(0, marketData.length - timeRange);
    
    for (let i = startIdx; i < marketData.length; i++) {
      const dataPoint: any = {
        date: new Date(marketData[i].timestamp).toLocaleDateString(),
        price: marketData[i].close,
        high: marketData[i].high,
        low: marketData[i].low,
        open: marketData[i].open,
        volume: marketData[i].volume,
      };
      
      if (selectedMetrics.includes('sma20') && indicators.sma20[i]) dataPoint.sma20 = indicators.sma20[i];
      if (selectedMetrics.includes('sma50') && indicators.sma50[i]) dataPoint.sma50 = indicators.sma50[i];
     
      if (selectedMetrics.includes('rsi') && indicators.rsi[i]) dataPoint.rsi = indicators.rsi[i];
     
      if (selectedMetrics.includes('bollinger') && indicators.bollingerUpper[i]) {
        dataPoint.bollingerUpper = indicators.bollingerUpper[i];
        dataPoint.bollingerLower = indicators.bollingerLower[i];
        dataPoint.bollingerMiddle = indicators.bollingerMiddle[i];
      }
     
      data.push(dataPoint);
    }
    return data;
  };

  const getCurrentMetrics = () => {
    const lastIndex = marketData.length - 1;
    const firstPrice = marketData[0]?.close || 1;
    const lastPrice = marketData[lastIndex]?.close || 0;
    
    return {
      currentPrice: lastPrice,
      currentRSI: indicators.rsi[lastIndex] || 50,
     
      sma20Current: indicators.sma20[lastIndex] || lastPrice,
      sma50Current: indicators.sma50[lastIndex] || lastPrice,
      currentVolume: marketData[lastIndex]?.volume || 0,
      priceChange: ((lastPrice - firstPrice) / firstPrice * 100) || 0,
      volumeChange: ((marketData[lastIndex]?.volume - marketData[0]?.volume) / marketData[0]?.volume * 100) || 0
    };
  };

  const currentMetrics = getCurrentMetrics();

  const toggleMetric = (metric: string) => {
    setSelectedMetrics(prev =>
      prev.includes(metric) ? prev.filter(m => m !== metric) : [...prev, metric]
    );
  };

  const getSignalStrength = (rsi: number) => {
    if (rsi > 80) return { text: 'Strong Overbought', color: 'text-red-600', action: 'Consider Selling' };
    if (rsi > 70) return { text: 'Overbought', color: 'text-red-500', action: 'Watch for reversal' };
    if (rsi < 20) return { text: 'Strong Oversold', color: 'text-green-600', action: 'Consider Buying' };
    if (rsi < 30) return { text: 'Oversold', color: 'text-green-500', action: 'Watch for bounce' };
    return { text: 'Neutral', color: 'text-gray-500', action: 'No clear signal' };
  };

 

// components/AnalyticsDashboard.tsx - REPLACE the handleExportReport function

const handleExportReport = () => {
  setLastAlert(`📄 Generating PDF report for ${symbol}...`);
  
  // Create PDF document
  const pdf = new jsPDF('p', 'mm', 'a4');
  let yPosition = 20;
  
  // Helper function to add text safely
  const addText = (text: string, x: number, y: number, fontSize?: number) => {
    if (fontSize) pdf.setFontSize(fontSize);
    // Remove any special characters that might cause issues
    const cleanText = text.replace(/[^\x20-\x7E]/g, '');
    pdf.text(cleanText, x, y);
  };
  
  // Title
  pdf.setFontSize(22);
  pdf.setTextColor(37, 99, 235);
  addText('TradePro Analytics Report', 20, yPosition, 22);
  yPosition += 10;
  
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  addText(`${symbol} - Technical Analysis Report`, 20, yPosition, 16);
  yPosition += 8;
  
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  addText(`Generated on: ${new Date().toLocaleString()}`, 20, yPosition, 10);
  yPosition += 15;
  
  // Current Market Data Section
  pdf.setFontSize(14);
  pdf.setTextColor(37, 99, 235);
  addText('1. Current Market Data', 20, yPosition, 14);
  yPosition += 8;
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  
  // Format numbers properly
  const currentPriceFormatted = currentMetrics.currentPrice.toFixed(2);
  const rsiFormatted = currentMetrics.currentRSI.toFixed(2);
 
  const sma20Formatted = currentMetrics.sma20Current.toFixed(2);
  const sma50Formatted = currentMetrics.sma50Current.toFixed(2);
  const volumeFormatted = (currentMetrics.currentVolume / 1000000).toFixed(2);
  
  // Market data rows
  const marketDataRows = [
    { label: 'Current Price:', value: `$${currentPriceFormatted}` },
    { label: 'RSI (14):', value: rsiFormatted },
    
    { label: 'SMA (20):', value: `$${sma20Formatted}` },
    { label: 'SMA (50):', value: `$${sma50Formatted}` },
    { label: 'Volume:', value: `${volumeFormatted} Million` },
  ];
  
  marketDataRows.forEach((row, index) => {
    const rowY = yPosition + (index * 7);
    addText(row.label, 20, rowY, 10);
    addText(row.value, 80, rowY, 10);
  });
  yPosition += (marketDataRows.length * 7) + 10;
  
  // Technical Signals Section
  pdf.setFontSize(14);
  pdf.setTextColor(37, 99, 235);
  addText('2. Technical Signals', 20, yPosition, 14);
  yPosition += 8;
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  
  // Calculate signals without emojis
  const trendSignal = currentMetrics.sma20Current > currentMetrics.sma50Current ? 'Bullish' : 'Bearish';
  const momentumSignal = currentMetrics.currentRSI > 50 ? 'Positive' : 'Negative';
  let riskSignal = 'Moderate';
  
  const signalRows = [
    { label: 'Trend:', value: trendSignal },
    { label: 'Momentum:', value: momentumSignal },
    { label: 'Risk Level:', value: riskSignal },
  ];
  
  signalRows.forEach((row, index) => {
    const rowY = yPosition + (index * 7);
    addText(row.label, 20, rowY, 10);
    addText(row.value, 80, rowY, 10);
  });
  yPosition += (signalRows.length * 7) + 10;
  
  // RSI Analysis
  pdf.setFontSize(14);
  pdf.setTextColor(37, 99, 235);
  addText('3. RSI Analysis', 20, yPosition, 14);
  yPosition += 8;
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  
  let rsiStatus = '';
  let rsiRecommendation = '';
  if (currentMetrics.currentRSI > 70) {
    rsiStatus = 'Overbought';
    rsiRecommendation = 'Consider taking profits or waiting for a pullback before buying.';
  } else if (currentMetrics.currentRSI < 30) {
    rsiStatus = 'Oversold';
    rsiRecommendation = 'Potential buying opportunity. Look for reversal signals.';
  } else {
    rsiStatus = 'Neutral';
    rsiRecommendation = 'No extreme signals. Wait for clearer direction.';
  }
  
  addText(`RSI Value: ${rsiFormatted}`, 20, yPosition, 10);
  yPosition += 7;
  addText(`Status: ${rsiStatus}`, 20, yPosition, 10);
  yPosition += 7;
  addText(`Recommendation: ${rsiRecommendation}`, 20, yPosition, 10);
  yPosition += 15;
  
  // Moving Average Analysis
  pdf.setFontSize(14);
  pdf.setTextColor(37, 99, 235);
  addText('4. Moving Average Analysis', 20, yPosition, 14);
  yPosition += 8;
  
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  
  let maStatus = '';
  let maRecommendation = '';
  if (currentMetrics.sma20Current > currentMetrics.sma50Current) {
    maStatus = 'Golden Cross (Bullish)';
    maRecommendation = 'Uptrend confirmed. Consider maintaining or adding positions.';
  } else {
    maStatus = 'Death Cross (Bearish)';
    maRecommendation = 'Downtrend indicated. Consider reducing exposure or waiting.';
  }
  
  addText(`SMA 20: $${sma20Formatted}`, 20, yPosition, 10);
  yPosition += 7;
  addText(`SMA 50: $${sma50Formatted}`, 20, yPosition, 10);
  yPosition += 7;
  addText(`Status: ${maStatus}`, 20, yPosition, 10);
  yPosition += 7;
  addText(`Recommendation: ${maRecommendation}`, 20, yPosition, 10);
  yPosition += 15;
  
  
 
  
  // Final Summary
 
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  
  // Generate final recommendation
  let finalRecommendation = '';
  let finalOutlook = '';
  
  if (currentMetrics.sma20Current > currentMetrics.sma50Current && currentMetrics.currentRSI < 70 && currentMetrics.currentRSI > 30) {
    finalRecommendation = 'BUY / HOLD';
    finalOutlook = 'Bullish outlook with favorable technical indicators.';
  } else if (currentMetrics.sma20Current < currentMetrics.sma50Current && currentMetrics.currentRSI > 30) {
    finalRecommendation = 'SELL / REDUCE';
    finalOutlook = 'Bearish signals detected. Consider reducing exposure.';
  } else if (currentMetrics.currentRSI < 30) {
    finalRecommendation = 'ACCUMULATE';
    finalOutlook = 'Oversold conditions suggest potential reversal to the upside.';
  } else if (currentMetrics.currentRSI > 70) {
    finalRecommendation = 'TAKE PROFITS';
    finalOutlook = 'Overbought conditions suggest potential pullback.';
  } else {
    finalRecommendation = 'NEUTRAL';
    finalOutlook = 'Mixed signals. Wait for clearer direction.';
  }
  
  // Add a box for final recommendation
  pdf.setFillColor(37, 99, 235, 20);
  pdf.rect(20, yPosition - 3, 170, 30, 'F');
  addText(`Final Recommendation: ${finalRecommendation}`, 25, yPosition + 5, 11);
  yPosition += 10;
  addText(`Outlook: ${finalOutlook}`, 25, yPosition + 5, 10);
  yPosition += 25;
  
  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(128, 128, 128);
  addText('This is an automated report generated by TradePro Analytics Dashboard.', 20, 275, 8);
  addText(`Data as of: ${new Date().toLocaleString()}`, 20, 282, 8);
  addText(`© ${new Date().getFullYear()} TradePro - All rights reserved.`, 20, 289, 8);
  
  // Save the PDF
  pdf.save(`${symbol}_analysis_report_${new Date().toISOString().split('T')[0]}.pdf`);
  setLastAlert(`✅ PDF Report exported successfully for ${symbol}`);
  setTimeout(() => setLastAlert(null), 3000);
};
  const handleSetPriceAlert = () => {
    const price = prompt(`Enter target price for ${symbol}:`, currentMetrics.currentPrice.toFixed(2));
    if (price && !isNaN(parseFloat(price))) {
      setPriceAlerts([...priceAlerts, { price: parseFloat(price), symbol }]);
      setLastAlert(`🔔 Price alert set for ${symbol} at $${parseFloat(price).toFixed(2)}`);
      setTimeout(() => setLastAlert(null), 3000);
    }
  };


  const handleRefreshData = () => {
    calculateAllIndicators();
    setLastAlert(`🔄 Data refreshed for ${symbol}`);
    setTimeout(() => setLastAlert(null), 2000);
  };

  const signal = getSignalStrength(currentMetrics.currentRSI);

  return (
    <div className="space-y-6">
      {/* Alert Toast */}
      {lastAlert && (
        <div className="fixed top-20 right-4 z-50 bg-gray-800 border-l-4 border-blue-500 rounded-lg shadow-lg p-4 max-w-md">
          <div className="flex items-center space-x-2">
            <AlertCircle className="text-blue-500" size={20} />
            <p className="text-white text-sm">{lastAlert}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{symbol} Analytics Dashboard</h2>
            <p className="text-blue-100 mt-1">Complete Technical Analysis & Market Insights</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">${currentMetrics.currentPrice.toFixed(2)}</div>
            <div className={`text-sm flex items-center justify-end ${currentMetrics.priceChange >= 0 ? 'text-green-300' : 'text-red-300'}`}>
              {currentMetrics.priceChange >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
              {currentMetrics.priceChange >= 0 ? '+' : ''}{currentMetrics.priceChange.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-gray-800 rounded-lg shadow p-4 border border-gray-700">
          <div className="text-sm text-gray-400">Current Price</div>
          <div className="text-2xl font-bold text-white">${currentMetrics.currentPrice.toFixed(2)}</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg shadow p-4 border border-gray-700">
          <div className="text-sm text-gray-400">RSI (14)</div>
          <div className={`text-2xl font-bold ${currentMetrics.currentRSI > 70 ? 'text-red-500' : currentMetrics.currentRSI < 30 ? 'text-green-500' : 'text-white'}`}>
            {currentMetrics.currentRSI.toFixed(2)}
          </div>
          <div className={`text-xs ${signal.color}`}>{signal.text}</div>
        </div>
        
       
        
        <div className="bg-gray-800 rounded-lg shadow p-4 border border-gray-700">
          <div className="text-sm text-gray-400">SMA 20</div>
          <div className="text-2xl font-bold text-white">${currentMetrics.sma20Current.toFixed(2)}</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg shadow p-4 border border-gray-700">
          <div className="text-sm text-gray-400">SMA 50</div>
          <div className="text-2xl font-bold text-white">${currentMetrics.sma50Current.toFixed(2)}</div>
        </div>
        
        <div className="bg-gray-800 rounded-lg shadow p-4 border border-gray-700">
          <div className="text-sm text-gray-400">Volume</div>
          <div className="text-2xl font-bold text-white">{(currentMetrics.currentVolume / 1000000).toFixed(2)}M</div>
        </div>
      </div>

      {/* Chart Controls */}
      <div className="bg-gray-800 rounded-lg shadow p-4 border border-gray-700">
        <div className="flex flex-wrap justify-between items-center mb-4">
          <div className="flex flex-wrap gap-2">
            {['price', 'sma20', 'sma50', 'bollinger', 'rsi', 'volume'].map(metric => (
              <button
                key={metric}
                onClick={() => toggleMetric(metric)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  selectedMetrics.includes(metric) 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {metric.toUpperCase()}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2 mt-2 sm:mt-0">
            {[50, 100, 200].map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  timeRange === range ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {range}D
              </button>
            ))}
            <button
              onClick={() => setTimeRange(marketData.length)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                timeRange === marketData.length ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All
            </button>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={500}>
          <ComposedChart data={getChartData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis yAxisId="left" stroke="#9CA3AF" />
            <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#F3F4F6' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px', color: '#F3F4F6' }} />
            
            {selectedMetrics.includes('price') && (
              <Line yAxisId="left" type="monotone" dataKey="price" stroke="#3B82F6" name="Price" strokeWidth={2} dot={false} />
            )}
            {selectedMetrics.includes('sma20') && (
              <Line yAxisId="left" type="monotone" dataKey="sma20" stroke="#10B981" name="SMA 20" strokeWidth={1.5} dot={false} />
            )}
            {selectedMetrics.includes('sma50') && (
              <Line yAxisId="left" type="monotone" dataKey="sma50" stroke="#F59E0B" name="SMA 50" strokeWidth={1.5} dot={false} />
            )}
            {selectedMetrics.includes('bollinger') && (
              <>
                <Line yAxisId="left" type="monotone" dataKey="bollingerUpper" stroke="#EF4444" name="Bollinger Upper" strokeWidth={1} dot={false} strokeDasharray="5 5" />
                <Line yAxisId="left" type="monotone" dataKey="bollingerLower" stroke="#EAB308" name="Bollinger Lower" strokeWidth={1} dot={false} strokeDasharray="5 5" />
              </>
            )}
            {selectedMetrics.includes('volume') && (
              <Bar yAxisId="right" dataKey="volume" fill="#60A5FA" name="Volume" opacity={0.3} />
            )}
            {selectedMetrics.includes('rsi') && (
              <Line yAxisId="right" type="monotone" dataKey="rsi" stroke="#F97316" name="RSI" strokeWidth={1.5} dot={false} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={handleExportReport}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-3 transition-colors"
        >
          <Download size={18} />
          <span>Export PDF Report</span>
        </button>
        <button
          onClick={handleSetPriceAlert}
          className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-3 transition-colors"
        >
          <Bell size={18} />
          <span>Set Price Alert</span>
        </button>
       
        <button
          onClick={handleRefreshData}
          className="flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-3 transition-colors"
        >
          <RefreshCw size={18} />
          <span>Refresh Data</span>
        </button>
      </div>
    </div>
  );
};

// Default export at the end
export default AnalyticsDashboard;