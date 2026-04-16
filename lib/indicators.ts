// lib/indicators.ts

// Configuration interface for custom indicators
export interface IndicatorConfig {
  id: string;
  name: string;
  type: 'SMA' | 'EMA' | 'RSI' | 'BB' | 'MACD' | 'STOCH';
  params: Record<string, number>;
  color: string;
  isVisible: boolean;
}

// Strategy definition interface
export interface Strategy {
  id: string;
  name: string;
  description: string;
  rules: StrategyRule[];
  enabled: boolean;
  createdAt: Date;
  performance?: StrategyPerformance;
}

// Individual rule within a strategy
export interface StrategyRule {
  id: string;
  condition: 'CROSS_ABOVE' | 'CROSS_BELOW' | 'GREATER_THAN' | 'LESS_THAN' | 'BETWEEN';
  indicator1: string;
  indicator2?: string; // For cross conditions
  value?: number; // For comparison conditions
  value2?: number; // For BETWEEN condition
  action: 'BUY' | 'SELL' | 'CLOSE';
  weight: number; // For combining multiple signals
}

// Performance tracking
export interface StrategyPerformance {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalProfit: number;
  winRate: number;
  averageProfit: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

// Trading signal
export interface TradingSignal {
  index: number;
  timestamp: Date;
  price: number;
  action: 'BUY' | 'SELL' | 'CLOSE';
  rule: StrategyRule;
  confidence: number;
}

// Trade record
export interface Trade {
  id: string;
  entryIndex: number;
  exitIndex: number;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  profit: number;
  profitPercent: number;
  entryTime: Date;
  exitTime: Date;
}

// Main indicator calculator class
export class IndicatorCalculator {
  
  /**
   * Simple Moving Average
   * Calculates average price over specified period
   */
  static calculateSMA(data: number[], period: number): number[] {
    if (data.length < period) return [];
    
    const result: number[] = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
    return result;
  }

  /**
   * Exponential Moving Average
   * Gives more weight to recent prices
   */
  static calculateEMA(data: number[], period: number): number[] {
    if (data.length === 0) return [];
    
    const multiplier = 2 / (period + 1);
    const ema: number[] = [data[0]];
    
    for (let i = 1; i < data.length; i++) {
      const value = (data[i] - ema[i - 1]) * multiplier + ema[i - 1];
      ema.push(value);
    }
    return ema;
  }

  /**
   * Relative Strength Index
   * Measures momentum and overbought/oversold conditions
   */
  static calculateRSI(data: number[], period: number = 14): number[] {
    if (data.length < period + 1) return [];
    
    const changes: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];
    
    // Calculate price changes
    for (let i = 1; i < data.length; i++) {
      const change = data[i] - data[i - 1];
      changes.push(change);
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? -change : 0);
    }
    
    // Calculate initial averages
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    const rsi: number[] = [];
    
    // First RSI value
    if (avgLoss === 0) {
      rsi.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    }
    
    // Calculate subsequent RSI values
    for (let i = period; i < gains.length; i++) {
      avgGain = (avgGain * (period - 1) + gains[i]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
      
      if (avgLoss === 0) {
        rsi.push(100);
      } else {
        const rs = avgGain / avgLoss;
        rsi.push(100 - (100 / (1 + rs)));
      }
    }
    
    return rsi;
  }

  /**
   * Bollinger Bands
   * Shows volatility and potential overbought/oversold conditions
   */
  static calculateBollingerBands(
    data: number[], 
    period: number = 20, 
    stdDev: number = 2
  ): { upper: number[]; middle: number[]; lower: number[] } {
    if (data.length < period) {
      return { upper: [], middle: [], lower: [] };
    }
    
    const sma = this.calculateSMA(data, period);
    const upper: number[] = [];
    const lower: number[] = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const mean = sma[i - period + 1];
      const squaredDiffs = slice.map(value => Math.pow(value - mean, 2));
      const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
      const std = Math.sqrt(variance);
      
      upper.push(mean + stdDev * std);
      lower.push(mean - stdDev * std);
    }
    
    return { upper, middle: sma, lower };
  }

  /**
   * MACD (Moving Average Convergence Divergence)
   * Shows trend direction and momentum
   */
  static calculateMACD(
    data: number[],
    fastPeriod: number = 12,
    slowPeriod: number = 26,
    signalPeriod: number = 9
  ): { macd: number[]; signal: number[]; histogram: number[] } {
    const fastEMA = this.calculateEMA(data, fastPeriod);
    const slowEMA = this.calculateEMA(data, slowPeriod);
    
    // Calculate MACD line (difference between fast and slow EMA)
    const macd: number[] = [];
    const minLength = Math.min(fastEMA.length, slowEMA.length);
    
    for (let i = 0; i < minLength; i++) {
      macd.push(fastEMA[i + (fastEMA.length - minLength)] - slowEMA[i + (slowEMA.length - minLength)]);
    }
    
    // Calculate signal line (EMA of MACD)
    const signal = this.calculateEMA(macd, signalPeriod);
    
    // Calculate histogram (MACD - Signal)
    const histogram: number[] = [];
    for (let i = 0; i < signal.length; i++) {
      histogram.push(macd[i + (macd.length - signal.length)] - signal[i]);
    }
    
    return { macd, signal, histogram };
  }

  /**
   * Stochastic Oscillator
   * Compares closing price to price range over time
   */
  static calculateStochastic(
    highs: number[],
    lows: number[],
    closes: number[],
    period: number = 14,
    smoothK: number = 3,
    smoothD: number = 3
  ): { k: number[]; d: number[] } {
    if (closes.length < period) return { k: [], d: [] };
    
    const rawK: number[] = [];
    
    // Calculate %K
    for (let i = period - 1; i < closes.length; i++) {
      const highestHigh = Math.max(...highs.slice(i - period + 1, i + 1));
      const lowestLow = Math.min(...lows.slice(i - period + 1, i + 1));
      const currentClose = closes[i];
      
      const kValue = ((currentClose - lowestLow) / (highestHigh - lowestLow)) * 100;
      rawK.push(kValue);
    }
    
    // Smooth %K
    const k = this.calculateSMA(rawK, smoothK);
    
    // Calculate %D (SMA of %K)
    const d = this.calculateSMA(k, smoothD);
    
    return { k, d };
  }
}

// Strategy evaluation engine
export class StrategyEngine {
  
  /**
   * Evaluate a strategy on historical data
   */
  static evaluateStrategy(
    data: any[],
    indicators: Record<string, any>,
    strategy: Strategy,
    initialCapital: number = 10000,
    positionSize: number = 0.1 // 10% of capital per trade
  ): { signals: TradingSignal[]; trades: Trade[]; performance: StrategyPerformance; equity: number[] } {
    
    const signals: TradingSignal[] = [];
    const trades: Trade[] = [];
    const equity: number[] = [];
    
    let capital = initialCapital;
    let currentPosition: Trade | null = null;
    let activeSignals: TradingSignal[] = [];
    
    for (let i = 0; i < data.length; i++) {
      let buyConfidence = 0;
      let sellConfidence = 0;
      let closeConfidence = 0;
      
      // Evaluate each rule
      for (const rule of strategy.rules) {
        const conditionMet = this.evaluateCondition(rule, indicators, data, i);
        
        if (conditionMet) {
          const signal: TradingSignal = {
            index: i,
            timestamp: data[i].timestamp,
            price: data[i].close,
            action: rule.action,
            rule: rule,
            confidence: rule.weight
          };
          
          activeSignals.push(signal);
          
          // Aggregate confidence by action
          switch (rule.action) {
            case 'BUY':
              buyConfidence += rule.weight;
              break;
            case 'SELL':
              sellConfidence += rule.weight;
              break;
            case 'CLOSE':
              closeConfidence += rule.weight;
              break;
          }
        }
      }
      
      // Determine action based on highest confidence
      let finalAction: 'BUY' | 'SELL' | 'CLOSE' | null = null;
      let maxConfidence = 0;
      
      if (buyConfidence > maxConfidence && buyConfidence > 0) {
        maxConfidence = buyConfidence;
        finalAction = 'BUY';
      }
      if (sellConfidence > maxConfidence && sellConfidence > 0) {
        maxConfidence = sellConfidence;
        finalAction = 'SELL';
      }
      if (closeConfidence > maxConfidence && closeConfidence > 0) {
        maxConfidence = closeConfidence;
        finalAction = 'CLOSE';
      }
      
      // Execute action
      if (finalAction === 'BUY' && !currentPosition) {
        const quantity = (capital * positionSize) / data[i].close;
        currentPosition = {
          id: `trade_${Date.now()}_${i}`,
          entryIndex: i,
          exitIndex: -1,
          entryPrice: data[i].close,
          exitPrice: 0,
          quantity: quantity,
          profit: 0,
          profitPercent: 0,
          entryTime: data[i].timestamp,
          exitTime: new Date()
        };
        capital -= quantity * data[i].close;
        
        signals.push({
          index: i,
          timestamp: data[i].timestamp,
          price: data[i].close,
          action: 'BUY',
          rule: strategy.rules.find(r => r.action === 'BUY')!,
          confidence: maxConfidence
        });
      } 
      else if ((finalAction === 'SELL' || finalAction === 'CLOSE') && currentPosition) {
        const sellValue = currentPosition.quantity * data[i].close;
        const profit = sellValue - (currentPosition.quantity * currentPosition.entryPrice);
        const profitPercent = (profit / (currentPosition.quantity * currentPosition.entryPrice)) * 100;
        
        currentPosition.exitIndex = i;
        currentPosition.exitPrice = data[i].close;
        currentPosition.profit = profit;
        currentPosition.profitPercent = profitPercent;
        currentPosition.exitTime = data[i].timestamp;
        
        trades.push(currentPosition);
        capital += sellValue;
        
        signals.push({
          index: i,
          timestamp: data[i].timestamp,
          price: data[i].close,
          action: 'SELL',
          rule: strategy.rules.find(r => r.action === finalAction)!,
          confidence: maxConfidence
        });
        
        currentPosition = null;
      }
      
      // Track equity curve
      const positionValue = currentPosition 
        ? currentPosition.quantity * data[i].close 
        : 0;
      equity.push(capital + positionValue);
      
      // Clear active signals for next iteration
      activeSignals = [];
    }
    
    // Calculate performance metrics
    const winningTrades = trades.filter(t => t.profit > 0);
    const losingTrades = trades.filter(t => t.profit < 0);
    const totalProfit = trades.reduce((sum, t) => sum + t.profit, 0);
    const totalReturns = (equity[equity.length - 1] - initialCapital) / initialCapital;
    
    // Calculate maximum drawdown
    let maxDrawdown = 0;
    let peak = equity[0];
    for (let i = 1; i < equity.length; i++) {
      if (equity[i] > peak) {
        peak = equity[i];
      }
      const drawdown = (peak - equity[i]) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    
    // Calculate Sharpe Ratio (simplified)
    const returns: number[] = [];
    for (let i = 1; i < equity.length; i++) {
      returns.push((equity[i] - equity[i-1]) / equity[i-1]);
    }
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    const sharpeRatio = stdDev === 0 ? 0 : (avgReturn / stdDev) * Math.sqrt(252); // Annualized
    
    const performance: StrategyPerformance = {
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      totalProfit: totalProfit,
      winRate: trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0,
      averageProfit: trades.length > 0 ? totalProfit / trades.length : 0,
      maxDrawdown: maxDrawdown * 100,
      sharpeRatio: sharpeRatio
    };
    
    return { signals, trades, performance, equity };
  }
  
  /**
   * Evaluate a single condition
   */
  private static evaluateCondition(
    rule: StrategyRule,
    indicators: Record<string, any>,
    data: any[],
    index: number
  ): boolean {
    const indicator1Value = indicators[rule.indicator1]?.[index];
    
    if (indicator1Value === undefined) return false;
    
    switch (rule.condition) {
      case 'CROSS_ABOVE':
        const prevValue = indicators[rule.indicator1]?.[index - 1];
        return prevValue !== undefined && 
               prevValue <= (rule.value || 0) && 
               indicator1Value > (rule.value || 0);
               
      case 'CROSS_BELOW':
        const prevValue2 = indicators[rule.indicator1]?.[index - 1];
        return prevValue2 !== undefined && 
               prevValue2 >= (rule.value || 0) && 
               indicator1Value < (rule.value || 0);
               
      case 'GREATER_THAN':
        return indicator1Value > (rule.value || 0);
        
      case 'LESS_THAN':
        return indicator1Value < (rule.value || 0);
        
      case 'BETWEEN':
        return indicator1Value > (rule.value || 0) && 
               indicator1Value < (rule.value2 || 0);
        
      default:
        return false;
    }
  }
  
  /**
   * Backtest a strategy with multiple parameter combinations
   */
  static optimizeStrategy(
    data: any[],
    baseStrategy: Strategy,
    paramRanges: Record<string, number[]>,
    indicators: Record<string, any>
  ): Array<{ params: Record<string, number>; performance: StrategyPerformance }> {
    const results: { params: Record<string, number>; performance: StrategyPerformance }[] = [];
    
    // This is a simplified optimization - would need to be expanded
    // for production use
    
    return results;
  }
}

// Helper function to calculate returns
export function calculateReturns(equity: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < equity.length; i++) {
    returns.push((equity[i] - equity[i-1]) / equity[i-1]);
  }
  return returns;
}

// Helper function to calculate drawdown
export function calculateDrawdown(equity: number[]): number[] {
  const drawdowns: number[] = [];
  let peak = equity[0];
  
  for (let i = 0; i < equity.length; i++) {
    if (equity[i] > peak) {
      peak = equity[i];
    }
    const drawdown = ((peak - equity[i]) / peak) * 100;
    drawdowns.push(drawdown);
  }
  
  return drawdowns;
}