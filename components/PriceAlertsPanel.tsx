// components/PriceAlertsPanel.tsx - FIXED VERSION
'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Trash2, Plus, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  currentPrice: number;
  status: 'active' | 'triggered' | 'cancelled';
  createdAt: Date;
  triggeredAt?: Date;
}

interface PriceAlertsPanelProps {
  currentPrices?: Record<string, number>; // Made optional with default
  onTriggerAlert?: (alert: PriceAlert) => void;
}

export const PriceAlertsPanel: React.FC<PriceAlertsPanelProps> = ({ 
  currentPrices = {}, // Default to empty object
  onTriggerAlert 
}) => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [newAlertSymbol, setNewAlertSymbol] = useState('');
  const [newAlertPrice, setNewAlertPrice] = useState('');
  const [showAlertNotification, setShowAlertNotification] = useState<PriceAlert | null>(null);

  // Load alerts from localStorage
  useEffect(() => {
    const savedAlerts = localStorage.getItem('price_alerts');
    if (savedAlerts) {
      try {
        const parsed = JSON.parse(savedAlerts);
        setAlerts(parsed.map((a: any) => ({
          ...a,
          createdAt: new Date(a.createdAt),
          triggeredAt: a.triggeredAt ? new Date(a.triggeredAt) : undefined
        })));
      } catch (e) {
        console.error('Failed to parse saved alerts:', e);
      }
    }
  }, []);

  // Save alerts to localStorage
  useEffect(() => {
    if (alerts.length > 0) {
      localStorage.setItem('price_alerts', JSON.stringify(alerts));
    } else {
      localStorage.removeItem('price_alerts');
    }
  }, [alerts]);

  // Check price alerts
  useEffect(() => {
    const interval = setInterval(() => {
      alerts.forEach(alert => {
        if (alert.status === 'active') {
          const currentPrice = currentPrices?.[alert.symbol] || 0;
          if (currentPrice > 0 && currentPrice >= alert.targetPrice) {
            // Trigger the alert
            const updatedAlert = { ...alert, status: 'triggered' as const, triggeredAt: new Date() };
            setAlerts(prev => prev.map(a => a.id === alert.id ? updatedAlert : a));
            setShowAlertNotification(updatedAlert);
            
            // Play sound notification (optional)
            try {
              const audio = new Audio('/notification.mp3');
              audio.play().catch(e => console.log('Audio not supported'));
            } catch(e) {}
            
            if (onTriggerAlert) onTriggerAlert(updatedAlert);
            
            // Hide notification after 10 seconds
            setTimeout(() => setShowAlertNotification(null), 10000);
          }
        }
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [alerts, currentPrices, onTriggerAlert]);

  const addAlert = () => {
    // Validate inputs
    if (!newAlertSymbol.trim()) {
      alert('Please enter a stock symbol');
      return;
    }
    
    if (!newAlertPrice.trim() || isNaN(parseFloat(newAlertPrice))) {
      alert('Please enter a valid price');
      return;
    }
    
    const symbol = newAlertSymbol.toUpperCase();
    const targetPrice = parseFloat(newAlertPrice);
    const currentPrice = currentPrices?.[symbol] || 0;
    
    // Check if alert already exists for this symbol
    const existingAlert = alerts.find(a => a.symbol === symbol && a.status === 'active');
    if (existingAlert) {
      alert(`You already have an active alert for ${symbol}`);
      return;
    }
    
    const newAlert: PriceAlert = {
      id: Date.now().toString(),
      symbol: symbol,
      targetPrice: targetPrice,
      currentPrice: currentPrice,
      status: 'active',
      createdAt: new Date()
    };
    
    setAlerts([...alerts, newAlert]);
    setNewAlertSymbol('');
    setNewAlertPrice('');
    setShowAddAlert(false);
    
    // Show confirmation
    const confirmMsg = document.createElement('div');
    confirmMsg.className = 'fixed bottom-20 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    confirmMsg.innerText = `✅ Alert set for ${symbol} at $${targetPrice.toFixed(2)}`;
    document.body.appendChild(confirmMsg);
    setTimeout(() => confirmMsg.remove(), 3000);
  };

  const cancelAlert = (id: string) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, status: 'cancelled' as const } : a));
  };

  const deleteAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const activeAlerts = alerts.filter(a => a.status === 'active');
  const triggeredAlerts = alerts.filter(a => a.status === 'triggered');

  // Popular stocks for suggestions
  const popularStocks = ['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'AMZN', 'META', 'RELIANCE', 'TCS', 'HDFC', 'INFY'];

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      {/* Alert Notification Popup */}
      <AnimatePresence>
        {showAlertNotification && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-xl p-4 max-w-sm"
          >
            <div className="flex items-start space-x-3">
              <div className="bg-yellow-400 rounded-full p-2">
                <Bell size={20} className="text-gray-900" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white">🎯 Price Alert Triggered!</h4>
                <p className="text-sm text-gray-200">
                  {showAlertNotification.symbol} has reached ${showAlertNotification.targetPrice.toFixed(2)}
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  Target: ${showAlertNotification.targetPrice.toFixed(2)} | Current: ${(currentPrices?.[showAlertNotification.symbol] || 0).toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => setShowAlertNotification(null)}
                className="text-gray-300 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Bell size={20} className="text-blue-500" />
          <h3 className="font-semibold text-white">Price Alerts</h3>
          <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded-full">
            {activeAlerts.length} Active
          </span>
        </div>
        <button
          onClick={() => setShowAddAlert(true)}
          className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center gap-1"
        >
          <Plus size={14} /> Add Alert
        </button>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div className="p-4 border-b border-gray-700">
          <h4 className="text-sm text-gray-400 mb-2">Active Alerts</h4>
          <div className="space-y-2">
            {activeAlerts.map(alert => {
              const currentPrice = currentPrices?.[alert.symbol] || 0;
              const percentageToTarget = currentPrice > 0 ? (currentPrice / alert.targetPrice * 100) : 0;
              const isNearTarget = percentageToTarget >= 90;
              
              return (
                <div key={alert.id} className={`rounded-lg p-3 flex justify-between items-center ${isNearTarget ? 'bg-yellow-900/30 border border-yellow-700' : 'bg-gray-700/50'}`}>
                  <div>
                    <div className="font-semibold text-white">{alert.symbol}</div>
                    <div className="text-sm text-gray-400">
                      Target: ${alert.targetPrice.toFixed(2)} | Current: ${currentPrice.toFixed(2)}
                    </div>
                    {isNearTarget && (
                      <div className="text-xs text-yellow-400 mt-1">
                        ⚡ Getting close! {percentageToTarget.toFixed(0)}% to target
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => cancelAlert(alert.id)}
                      className="px-2 py-1 text-xs bg-yellow-600 hover:bg-yellow-700 text-white rounded transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="p-1 text-red-400 hover:text-red-300 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Triggered Alerts */}
      {triggeredAlerts.length > 0 && (
        <div className="p-4">
          <h4 className="text-sm text-gray-400 mb-2">Triggered Alerts</h4>
          <div className="space-y-2">
            {triggeredAlerts.map(alert => (
              <div key={alert.id} className="bg-purple-900/30 border border-purple-700 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <div className="font-semibold text-purple-300">{alert.symbol}</div>
                  <div className="text-sm text-gray-400">
                    Hit ${alert.targetPrice.toFixed(2)} on {alert.triggeredAt?.toLocaleDateString()} at {alert.triggeredAt?.toLocaleTimeString()}
                  </div>
                </div>
                <button
                  onClick={() => deleteAlert(alert.id)}
                  className="p-1 text-red-400 hover:text-red-300 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {alerts.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <Bell size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No price alerts set</p>
          <p className="text-xs mt-1">Click "Add Alert" to get notified when a stock hits your target price</p>
        </div>
      )}

      {/* Add Alert Modal */}
      <AnimatePresence>
        {showAddAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">Set Price Alert</h3>
                <button
                  onClick={() => setShowAddAlert(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Stock Symbol</label>
                  <input
                    type="text"
                    value={newAlertSymbol}
                    onChange={(e) => setNewAlertSymbol(e.target.value.toUpperCase())}
                    placeholder="e.g., AAPL, TSLA, GOOGL"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    list="stock-suggestions"
                  />
                  <datalist id="stock-suggestions">
                    {popularStocks.map(stock => (
                      <option key={stock} value={stock} />
                    ))}
                  </datalist>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Target Price ($)</label>
                  <input
                    type="number"
                    value={newAlertPrice}
                    onChange={(e) => setNewAlertPrice(e.target.value)}
                    placeholder="Enter target price"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    step="0.01"
                    min="0"
                  />
                </div>
                
                <div className="bg-blue-900/30 p-3 rounded-lg">
                  <p className="text-xs text-blue-300">
                    💡 You'll receive a notification when the price reaches or exceeds your target.
                  </p>
                </div>
                
                <button
                  onClick={addAlert}
                  disabled={!newAlertSymbol.trim() || !newAlertPrice.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Set Alert
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};