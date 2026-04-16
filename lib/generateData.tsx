// lib/generateData.ts
import { Candle } from './CandlestickPatterns';

export const generateRandomCandle = (index: number, previousClose?: number): Candle => {
  // Start with a base price
  let open: number;
  
  if (previousClose) {
    // Use previous close as open for continuity
    open = previousClose;
  } else {
    // First candle - start around 100
    open = 100 + Math.random() * 20;
  }
  
  // Random price movement (up to ±5%)
  const changePercent = (Math.random() - 0.5) * 0.1;
  const close = open * (1 + changePercent);
  
  // Random high/low based on volatility
  const volatility = Math.abs(close - open) * 1.5 + Math.random() * 5;
  const high = Math.max(open, close) + Math.random() * volatility;
  const low = Math.min(open, close) - Math.random() * volatility;
  
  // Ensure high is actually highest and low is lowest
  const finalHigh = Math.max(open, close, high);
  const finalLow = Math.min(open, close, low);
  
  return {
    open: Number(open.toFixed(2)),
    high: Number(finalHigh.toFixed(2)),
    low: Number(finalLow.toFixed(2)),
    close: Number(close.toFixed(2)),
    timestamp: new Date()
  };
};

// Generate multiple random candles
export const generateRandomCandles = (count: number, startPrice?: number): Candle[] => {
  const candles: Candle[] = [];
  let lastClose = startPrice || 100;
  
  for (let i = 0; i < count; i++) {
    const candle = generateRandomCandle(i, lastClose);
    candles.push(candle);
    lastClose = candle.close;
  }
  
  return candles;
};

// Generate realistic market data with trends
export const generateTrendingCandles = (count: number, trend: 'up' | 'down' | 'sideways' = 'sideways'): Candle[] => {
  const candles: Candle[] = [];
  let lastClose = 100;
  let trendStrength = trend === 'up' ? 0.02 : trend === 'down' ? -0.02 : 0;
  
  for (let i = 0; i < count; i++) {
    let changePercent = (Math.random() - 0.5) * 0.06; // Base volatility
    
    // Add trend bias
    if (trend === 'up') {
      changePercent += 0.01;
    } else if (trend === 'down') {
      changePercent -= 0.01;
    }
    
    // Randomly generate doji-like patterns
    const isDoji = Math.random() < 0.1;
    if (isDoji) {
      changePercent = (Math.random() - 0.5) * 0.01;
    }
    
    // Randomly generate hammer-like patterns
    const isHammer = Math.random() < 0.05;
    
    const open = lastClose;
    let close = open * (1 + changePercent);
    
    // Create hammer pattern (long lower shadow)
    if (isHammer && trend !== 'up') {
      const body = Math.abs(close - open);
      const lowerShadow = body * 2.5;
      // Adjust low to create long lower shadow
      const newLow = Math.min(open, close) - lowerShadow;
      const high = Math.max(open, close) + Math.random() * body * 0.3;
      
      candles.push({
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(newLow.toFixed(2)),
        close: Number(close.toFixed(2)),
        timestamp: new Date()
      });
      
      lastClose = close;
      continue;
    }
    
    const high = Math.max(open, close) + Math.random() * Math.abs(close - open) * 1.2;
    const low = Math.min(open, close) - Math.random() * Math.abs(close - open) * 1.2;
    
    candles.push({
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      timestamp: new Date()
    });
    
    lastClose = close;
  }
  
  return candles;
};