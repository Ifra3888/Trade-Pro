import React, { useState } from 'react';

type TradingPanelProps = {
  buyStock: (symbol: string, quantity: number, price: number) => void;
  sellStock: (symbol: string, quantity: number, price: number) => void;
  portfolio?: Record<string, any>;
  cashBalance?: number;
}

const stocks = [
  { symbol: 'AAPL', price: 180 },
  { symbol: 'TSLA', price: 250 },
  { symbol: 'GOOGL', price: 140 },
  { symbol: 'AMZN', price: 120 },
  { symbol: 'MSFT', price: 300 },
  { symbol: 'TCS', price: 350 },
  { symbol: 'RELIANCE', price: 200 },
  { symbol: 'TATA', price: 150 },
  { symbol: 'HDFC', price: 100 },
];

export default function TradingPanel({ buyStock, sellStock, portfolio = {}, cashBalance = 10000 }: TradingPanelProps) {
  const [selectedStock, setSelectedStock] = useState(stocks[0]);
  const [quantity, setQuantity] = useState(1);
  const [showConfirmation, setShowConfirmation] = useState<{ type: 'BUY' | 'SELL'; symbol: string; quantity: number; price: number } | null>(null);

  const currentHolding = portfolio[selectedStock.symbol];
  const maxSellQuantity = currentHolding?.quantity || 0;
  const totalCost = selectedStock.price * quantity;

  const handleBuy = () => {
    if (quantity < 1) {
      alert('Please enter a valid quantity');
      return;
    }
    if (totalCost > cashBalance) {
      alert(`Insufficient funds! You need $${totalCost.toFixed(2)} but have $${cashBalance.toFixed(2)}`);
      return;
    }
    setShowConfirmation({ type: 'BUY', symbol: selectedStock.symbol, quantity, price: selectedStock.price });
  };
// checkout the bug for number of holdings and column should be added totalt quantty x 
  const handleSell = () => {
    if (quantity < 1) {
      alert('Please enter a valid quantity');
      return;
    }
    if (quantity > maxSellQuantity) {
      alert(`You only have ${maxSellQuantity} shares of ${selectedStock.symbol}`);
      return;
    }
    setShowConfirmation({ type: 'SELL', symbol: selectedStock.symbol, quantity, price: selectedStock.price });
  };

  const confirmTrade = () => {
    if (showConfirmation) {
      if (showConfirmation.type === 'BUY') {
        buyStock(showConfirmation.symbol, showConfirmation.quantity, showConfirmation.price);
      } else {
        sellStock(showConfirmation.symbol, showConfirmation.quantity, showConfirmation.price);
      }
      setShowConfirmation(null);
      setQuantity(1);
    }
  };

  return (
    <>
      <div className="bg-gray-800 p-6 rounded-xl mb-6">
        <h2 className="text-xl font-semibold mb-4 text-white">Simulated Trading</h2>
        
        {/* Stock Selection */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {stocks.map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => setSelectedStock(stock)}
              className={`p-4 rounded-lg transition-all ${
                selectedStock.symbol === stock.symbol
                  ? 'bg-blue-600 border-2 border-blue-400'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <div className="text-white font-bold text-lg">{stock.symbol}</div>
              <div className="text-gray-300">${stock.price}</div>
              {portfolio[stock.symbol] && (
                <div className="text-xs text-gray-400 mt-1">
                  Own: {portfolio[stock.symbol].quantity} shares
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Trading Controls */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2"
            />
          </div>

          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300">Total Cost/Revenue:</span>
              <span className="text-white font-semibold">${totalCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-gray-300">Your Balance:</span>
              <span className="text-white">${cashBalance.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleBuy}
              disabled={quantity < 1}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buy {selectedStock.symbol}
            </button>
            <button
              onClick={handleSell}
              disabled={quantity < 1 || maxSellQuantity === 0}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sell {selectedStock.symbol}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4 text-white">Confirm {showConfirmation.type}</h3>
            <div className="space-y-2 mb-6">
              <p className="text-gray-300">
                <span className="font-semibold">Symbol:</span> {showConfirmation.symbol}
              </p>
              <p className="text-gray-300">
                <span className="font-semibold">Quantity:</span> {showConfirmation.quantity}
              </p>
              <p className="text-gray-300">
                <span className="font-semibold">Price:</span> ${showConfirmation.price}
              </p>
              <p className="text-gray-300">
                <span className="font-semibold">Total:</span> ${(showConfirmation.quantity * showConfirmation.price).toFixed(2)}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={confirmTrade}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConfirmation(null)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}