'use client';

import { useState, useEffect } from 'react';
import { CandlestickChart } from '@/components/CandlestickChart';
import { Candle } from '@/lib/CandlestickPatterns';
import { generateRandomCandles, generateTrendingCandles } from '@/lib/generateData';

export const CandlestickSection = () => {
  const [candleData, setCandleData] = useState<Candle[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [isAutoUpdating, setIsAutoUpdating] = useState(true);
  const [trendType, setTrendType] = useState<'up' | 'down' | 'sideways'>('sideways');

  

  // Initialize candlestick data
  useEffect(() => {
    const initialCandles = generateTrendingCandles(50, trendType);
    setCandleData(initialCandles);
  }, []);

  // Auto-update candlestick data
  useEffect(() => {
    if (!isAutoUpdating) return;
    
    const interval = setInterval(() => {
      setCandleData(prev => {
        const lastClose = prev[prev.length - 1]?.close || 100;
        const newCandle = generateRandomCandles(1, lastClose)[0];
        const updated = [...prev.slice(-59), newCandle];
        return updated;
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, [isAutoUpdating]);

  return (
    <div className="mt-6 mb-8 bg-gray-800 p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">
          📈 Candlestick Pattern Recognition
        </h2>
        <div className="flex gap-3">
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="bg-gray-800 text-white px-3 py-1 rounded border border-gray-700"
          >
            <option value="AAPL">AAPL - Apple</option>
            <option value="GOOGL">GOOGL - Google</option>
            <option value="MSFT">MSFT - Microsoft</option>
            <option value="AMZN">AMZN - Amazon</option>
            <option value="TSLA">TSLA - Tesla</option>
          </select>
          
          <select
            value={trendType}
            onChange={(e) => {
              const newTrend = e.target.value as 'up' | 'down' | 'sideways';
              setTrendType(newTrend);
              setCandleData(generateTrendingCandles(50, newTrend));
            }}
            className="bg-gray-800 text-white px-3 py-1 rounded border border-gray-700"
          >
            <option value="sideways">Sideways Market</option>
            <option value="up">Bullish Trend</option>
            <option value="down">Bearish Trend</option>
          </select>
          
          <button
            onClick={() => setIsAutoUpdating(!isAutoUpdating)}
            className={`px-4 py-1 rounded transition-colors ${
              isAutoUpdating 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-green-600 hover:bg-green-700'
            } text-white`}
          >
            {isAutoUpdating ? '⏸️ Pause Updates' : '▶️ Start Updates'}
          </button>
          
          <button
            onClick={() => setCandleData(generateTrendingCandles(50, trendType))}
            className="px-4 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors"
          >
            🔄 Reset Chart
          </button>
        </div>
      </div>
      
      <CandlestickChart data={candleData} symbol={selectedSymbol} />
      
      <div className="mt-2 p-3 bg-blue-900/20 border border-blue-800 rounded-lg text-sm">
        <p className="text-blue-300">
          💡 <strong>Learning Opportunity:</strong> Hover over highlighted candles to see pattern descriptions. 
          Use filters to focus on specific patterns. The chart updates in real-time every 5 seconds!
        </p>
      </div>
    </div>
  );
};