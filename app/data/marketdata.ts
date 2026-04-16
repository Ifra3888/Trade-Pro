export const initialStocks = [
  { symbol: "AAPL", price: 180 },
  { symbol: "TSLA", price: 250 },
  { symbol: "GOOGL", price: 140 },
  { symbol: "AMZN", price: 120 },
  { symbol: "MSFT", price: 330 },
];

export function generateRandomPrice(price: number) {
  const change = (Math.random() - 0.5) * 5;
  return +(price + change).toFixed(2);
}