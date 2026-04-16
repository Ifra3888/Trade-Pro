// services/portfolioService.ts
export interface Holding {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  invested: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

export interface Trade {
  symbol: string;
  quantity: number;
  price: number;
  type: 'buy' | 'sell';
  id: string;
  timestamp: number;
  totalCost: number;
}
export interface PortfolioSummary {
  totalValue: number;
  cashBalance: number;
  totalPnL: number;
  totalPnLPercent: number;
  totalInvested: number;
  holdings: Holding[];
  allocation: { symbol: string; value: number; percentage: number; color?: string }[];
}
type Allocation= {
  symbol: string;
  value: number;
  percentage: number;
  color?: string;
}
export class PortfolioService {
  static calculatePortfolioSummary(
    holdings: { symbol: string; quantity: number; avgPrice: number }[],
    currentPrices: Record<string, number>,
    cashBalance: number
  ): PortfolioSummary {
    let totalHoldingsValue = 0;
    let totalInvested = 0;
    const allocations: Allocation[] = [];
    
    
    const holdingsWithCurrent = holdings.map((holding) => {
      const currentPrice = currentPrices[holding.symbol] || holding.avgPrice;
      const value = holding.quantity * currentPrice;
      const invested = holding.quantity * holding.avgPrice;
      const unrealizedPnL = value - invested;
      const unrealizedPnLPercent = ((currentPrice - holding.avgPrice) / holding.avgPrice) * 100;
      
      totalHoldingsValue += value;
      totalInvested += invested;
      
      return {
        ...holding,
        currentPrice,
        value,
        invested,
        unrealizedPnL,
        unrealizedPnLPercent
      };
    });
    
    // Calculate allocation percentages
    holdingsWithCurrent.forEach((holding) => {
      allocations.push({
        symbol: holding.symbol,
        value: holding.value,
        percentage: totalHoldingsValue > 0 ? (holding.value / totalHoldingsValue) * 100 : 0
      });
    });
    
    const totalValue = cashBalance + totalHoldingsValue;
    const totalPnL = totalValue - (cashBalance + totalInvested);
    const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
    
    return {
      totalValue,
      cashBalance,
      totalPnL,
      totalPnLPercent,
      totalInvested,
      holdings: holdingsWithCurrent,
      allocation: allocations.sort((a, b) => b.value - a.value)
      
    };
  }

  static calculateRealizedPnL(trades: Trade[]): { totalRealizedPnL: number } {
  let realizedPnL = 0;
  
  trades.forEach((trade) => {
    if (trade.type === 'sell' || trade.type === 'buy') {
      const costBasis = trade.quantity * trade.price;
      const proceeds = trade.totalCost;
      realizedPnL += proceeds - costBasis;
    }
  });
  
  return { totalRealizedPnL: realizedPnL };
}
}