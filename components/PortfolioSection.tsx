import React, { useState } from 'react';

interface HoldingData {
  quantity: number;
  totalCost: number;
}

interface HoldingWithPnL {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  currentValue: number;
  invested: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

interface AllocationItem {
  symbol: string;
  value: number;
  percentage: number;
}

interface PortfolioStats {
  totalValue: number;
  totalInvested: number;
  totalPnL: number;
  totalPnLPercent: number;
  cashBalance: number;
  holdingsWithPnL: HoldingWithPnL[];
  allocation: AllocationItem[];
}

type PortfolioProps = {
  portfolio: Record<string, HoldingData>;
  currentPrices?: Record<string, number>;
  cashBalance?: number;
}

export default function PortfolioSection({ portfolio, currentPrices = {}, cashBalance = 0 }: PortfolioProps) {
  const [showAllocation, setShowAllocation] = useState(false);
  
  // Calculate portfolio statistics with PnL
  const calculatePortfolioStats = (): PortfolioStats => {
    let totalValue = cashBalance;
    let totalInvested = 0;
    const holdingsWithPnL: HoldingWithPnL[] = [];
    
    Object.entries(portfolio).forEach(([symbol, data]) => {
      const currentPrice = currentPrices[symbol] || (data.totalCost / data.quantity);
      const currentValue = data.quantity * currentPrice;
      const invested = data.totalCost;
      const unrealizedPnL = currentValue - invested;
      const avgPrice = invested / data.quantity;
      const unrealizedPnLPercent = ((currentPrice - avgPrice) / avgPrice) * 100;
      
      totalValue += currentValue;
      totalInvested += invested;
      
      holdingsWithPnL.push({
        symbol,
        quantity: data.quantity,
        avgPrice,
        currentPrice,
        currentValue,
        invested,
        unrealizedPnL,
        unrealizedPnLPercent
      });
    });
    
    const totalPnL = totalValue - (cashBalance + totalInvested);
    const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
    
    // Calculate allocation percentages
    const totalHoldingsValue = totalValue - cashBalance;
    const allocation: AllocationItem[] = holdingsWithPnL.map(holding => ({
      symbol: holding.symbol,
      value: holding.currentValue,
      percentage: totalHoldingsValue > 0 ? (holding.currentValue / totalHoldingsValue) * 100 : 0
    }));
    
    return { 
      totalValue, 
      totalInvested, 
      totalPnL, 
      totalPnLPercent, 
      holdingsWithPnL,
      allocation: allocation.sort((a, b) => b.value - a.value),
      cashBalance
    };
  };
  
  const stats = calculatePortfolioStats();
  
  return (
    <div className="mt-6 bg-gray-800 p-6 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Your Portfolio</h2>
        {Object.keys(portfolio).length > 0 && (
          <button
            onClick={() => setShowAllocation(!showAllocation)}
            className="text-sm bg-blue-500 px-3 py-1 rounded hover:bg-blue-600 text-white"
          >
            {showAllocation ? 'Show Holdings' : 'Show Allocation'}
          </button>
        )}
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700 p-3 rounded">
          <p className="text-xs text-gray-300">Total Value</p>
          <p className="text-lg font-bold text-white">${stats.totalValue.toFixed(2)}</p>
        </div>
        <div className="bg-gray-700 p-3 rounded">
          <p className="text-xs text-gray-300">Cash Balance</p>
          <p className="text-lg font-bold text-white">${stats.cashBalance.toFixed(2)}</p>
        </div>
        <div className="bg-gray-700 p-3 rounded">
          <p className="text-xs text-gray-300">Total P&L</p>
          <p className={`text-lg font-bold ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${stats.totalPnL.toFixed(2)}
            <span className="text-xs ml-1">({stats.totalPnLPercent.toFixed(2)}%)</span>
          </p>
        </div>
        <div className="bg-gray-700 p-3 rounded">
          <p className="text-xs text-gray-300">Total Invested</p>
          <p className="text-lg font-bold text-white">${stats.totalInvested.toFixed(2)}</p>
        </div>
      </div>

      {Object.keys(portfolio).length === 0 ? (
        <p className="text-gray-400 text-center py-4">No assets purchased yet</p>
      ) : showAllocation ? (
        // Allocation View
        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">Portfolio Allocation</h3>
          <div className="space-y-3">
            {stats.allocation.map((item) => (
              <div key={item.symbol}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{item.symbol}</span>
                  <span className="text-white">
                    ${item.value.toFixed(2)} ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-500 transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Holdings View with PnL
        <div>
          <h3 className="text-lg font-semibold mb-3 text-white">Current Holdings</h3>
          <div className="space-y-3">
            {stats.holdingsWithPnL.map((holding) => (
              <div
                key={holding.symbol}
                className="border-b border-gray-700 py-3 hover:bg-gray-750 transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-semibold text-white">{holding.symbol}</span>
                    <div className="text-sm text-gray-400">
                      {holding.quantity} shares @ ${holding.avgPrice.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-semibold">${holding.currentValue.toFixed(2)}</div>
                    <div className={`text-sm ${holding.unrealizedPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {holding.unrealizedPnL >= 0 ? '+' : ''}{holding.unrealizedPnL.toFixed(2)} 
                      ({holding.unrealizedPnLPercent.toFixed(2)}%)
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}