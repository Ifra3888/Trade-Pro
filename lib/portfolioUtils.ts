// lib/portfolioUtils.ts

export type Holding = {
  quantity: number;
  totalCost: number;
};

export type Portfolio = {
  cash: number;
  holdings: Record<string, Holding>;
  realizedPnL: number;
};
function buyStock(
  portfolio: Portfolio,
  symbol: string,
  price: number,
  quantity: number
) {
  const fee = price * quantity * 0.01; // 1% fee
  const totalAmount = price * quantity + fee;

  if (portfolio.cash < totalAmount) return;

  portfolio.cash -= totalAmount;

  if (!portfolio.holdings[symbol]) {
    portfolio.holdings[symbol] = {
      quantity: 0,
      totalCost: 0,
    };
  }

  const holding = portfolio.holdings[symbol];

  holding.quantity += quantity;
  holding.totalCost += totalAmount; // IMPORTANT

  return { ...portfolio };
}

function sellStock(
  portfolio: Portfolio,
  symbol: string,
  price: number,
  quantity: number
) {
  const holding = portfolio.holdings[symbol];
  if (!holding || holding.quantity < quantity) return;

  const avgPrice = holding.totalCost / holding.quantity;

  const fee = price * quantity * 0.01;
  const totalSell = price * quantity - fee;

  // ✅ REALIZED PnL
  const profit = (price - avgPrice) * quantity - fee;

  portfolio.realizedPnL += profit;
  portfolio.cash += totalSell;

  // Update holding
  holding.quantity -= quantity;
  holding.totalCost -= avgPrice * quantity;

  // Remove if zero
  if (holding.quantity === 0) {
    delete portfolio.holdings[symbol];
  }

  return { ...portfolio };
}

function getUnrealizedPnL(
  portfolio: Portfolio,
  prices: Record<string, number>
) {
  let total = 0;

  for (const symbol in portfolio.holdings) {
    const holding = portfolio.holdings[symbol];
    const currentPrice = prices[symbol];

    const avgPrice = holding.totalCost / holding.quantity;

    total += (currentPrice - avgPrice) * holding.quantity;
  }

  return total;
}

function getPortfolioValue(
  portfolio: Portfolio,
  prices: Record<string, number>
) {
  let value = portfolio.cash;

  for (const symbol in portfolio.holdings) {
    const holding = portfolio.holdings[symbol];
    value += holding.quantity * prices[symbol];
  }

  return value;
}