// components/TradeHistory.tsx
import { symbol } from "framer-motion/client";

type Trade = {
  id?: string;  // Optional ID for better keying in lists
    type: string;
    symbol: string;
    quantity: number;
    price: number;
    time: string;
    date?: string;
    totalCost?: number;  // Add this for total amount
}

type TradeHistoryProps = {
    trades: Trade[]
}

export default function TradeHistory({ trades }: TradeHistoryProps) {
    // Helper function to format date and time
    const formatDateTime = (trade: Trade) => {
        // If trade has a date property, use it
        if (trade.date) {
            return { date: trade.date, time: trade.time };
        }
        
        // If time is stored as a full timestamp
        if (trade.time && trade.time.includes('-')) {
            const dateObj = new Date(trade.time);
            return {
                date: dateObj.toLocaleDateString(),
                time: dateObj.toLocaleTimeString()
            };
        }
        
        // If only time is stored, use today's date
        const today = new Date().toLocaleDateString();
        return { date: today, time: trade.time };
    };

    return (
        <div className="mt-10 bg-gray-800 p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4 text-white">Trade History</h2>
            
            {/* Table Header */}
            <div className="grid grid-cols-6 gap-3 mb-3 text-sm text-gray-400 border-b border-gray-700 pb-2 font-medium">
                <span>Type</span>
                <span>Symbol</span>
                <span>Quantity</span>
                <span>Price</span>
                <span>Total</span>
                <span>Date & Time</span>
            </div>

            {trades.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No trades executed yet. Start trading above!</p>
            ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {trades.slice().reverse().map((trade, index) => {
                        const { date, time } = formatDateTime(trade);
                        const totalAmount = (trade.quantity * trade.price).toFixed(2);
                        
                        return (
                            <div 
                                key={trade.id || index} 
                                className="grid grid-cols-6 gap-3 py-3 border-b border-gray-700 hover:bg-gray-700/30 transition-colors rounded"
                            >
                                <span className={`font-medium ${trade.type === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
                                    {trade.type}
                                </span>
                                <span className="text-white font-medium">{trade.symbol}</span>
                                <span className="text-gray-300">{trade.quantity}</span>
                                <span className="text-gray-300">${trade.price.toFixed(2)}</span>
                                <span className="text-white font-medium">${totalAmount}</span>
                                <span className="text-gray-400 text-sm">
                                    {date} {time}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
            
            {/* Summary Footer */}
            {trades.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-700">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total Trades:</span>
                        <span className="text-white font-medium">{trades.length}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-400">Buy Trades:</span>
                        <span className="text-green-400">{trades.filter(t => t.type === 'BUY').length}</span>
                        <span className="text-gray-400 ml-4">Sell Trades:</span>
                        <span className="text-red-400">{trades.filter(t => t.type === 'SELL').length}</span>
                    </div>
                </div>
            )}
        </div>
    );
}