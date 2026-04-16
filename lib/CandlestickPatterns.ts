// lib/patterns.ts

export type Candle = {
  open: number;
  high: number;
  low: number;
  close: number;
  timestamp?: Date;
};

export type Pattern = {
  type: string;
  index: number;
  description: string;
  direction?: 'bullish' | 'bearish' | 'neutral' ;
};



// 🟡 DOJI → very small body
export const isDoji = (c: Candle, threshold: number = 0.1) => {
  const bodySize = Math.abs(c.open - c.close);
  const totalRange = c.high - c.low;
  return totalRange > 0 && bodySize < totalRange * threshold;
};

// 🟢 HAMMER → long lower shadow, small body at top
export const isHammer = (c: Candle) => {
  const body = Math.abs(c.open - c.close);
  const lowerShadow = Math.min(c.open, c.close) - c.low;
  const upperShadow = c.high - Math.max(c.open, c.close);
  
  // Lower shadow at least 2x body, upper shadow small
  return lowerShadow > body * 2 && upperShadow < body * 0.3;
};

// 🌙 SHOOTING STAR → long upper shadow, small body at bottom
export const isShootingStar = (c: Candle) => {
  const body = Math.abs(c.open - c.close);
  const upperShadow = c.high - Math.max(c.open, c.close);
  const lowerShadow = Math.min(c.open, c.close) - c.low;
  
  return upperShadow > body * 2 && lowerShadow < body * 0.3;
};

// 🔵 ENGULFING → current candle fully covers previous
export const isEngulfing = (prev: Candle, curr: Candle) :{isEngulfing: boolean, direction?: 'bullish' | 'bearish' }=> {
  const prevBullish = prev.close > prev.open;
  const currBullish = curr.close > curr.open;
  
  type EngulfingResult = {
    isEngulfing: boolean;
    direction?: 'bullish' | 'bearish';
  };

  // Bullish engulfing (green covers red)
  const bullish = !prevBullish && currBullish && 
                  curr.open < prev.close && curr.close > prev.open;
  
  // Bearish engulfing (red covers green)
  const bearish = prevBullish && !currBullish && 
                  curr.open > prev.close && curr.close < prev.open;
  
  return { isEngulfing: bullish || bearish, direction: bullish ? 'bullish' : bearish ? 'bearish' : undefined };
};

// 🔥 MAIN FUNCTION
export const detectPatterns = (candles: Candle[]): Pattern[] => {
  const patterns: Pattern[] = [];

 

  for (let i = 0; i < candles.length; i++) {
    const curr = candles[i];
    
    // Doji (can be on any candle)
    if (isDoji(curr)) {
      patterns.push({
        type: "Doji",
        index: i,
        description: "Market indecision - potential reversal or continuation signal",
        direction: 'neutral'
      });
    }

    // Hammer (needs context, typically after downtrend)
    if (isHammer(curr)) {
      patterns.push({
        type: "Hammer",
        index: i,
        description: "Bullish reversal signal - buyers rejecting lower prices",
        direction: 'bullish'
      });
    }

    // Shooting Star
    if (isShootingStar(curr)) {
      patterns.push({
        type: "Shooting Star",
        index: i,
        description: "Bearish reversal signal - sellers rejecting higher prices",
        direction: 'bearish'
      });
    }

    // Engulfing (needs previous candle)
    if (i > 0) {
      const prev = candles[i - 1];
      const engulfingResult = isEngulfing(prev, curr);
      
      if (engulfingResult.isEngulfing) {
        patterns.push({
          type: "Engulfing",
          index: i,
          description: `${engulfingResult.direction === 'bullish' ? 'Bullish' : 'Bearish'} engulfing - strong trend reversal signal`,
          direction: engulfingResult.direction
        });
      }
    }
  }

  return patterns;
};

// Helper to filter patterns by type
export const filterPatterns = (patterns: Pattern[], types: string[]): Pattern[] => {
  if (types.length === 0) return patterns;
  return patterns.filter(p => types.includes(p.type));
};