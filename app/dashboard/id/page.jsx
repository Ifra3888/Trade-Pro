// app/dashboard/[id]/page.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  Bell,
  ShoppingCart,
  User,
  Eye,
  PlusCircle,
  Menu,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  DollarSign,
  BarChart2,
  Zap,
  LogOut,
  Settings,
  HelpCircle,
  TrendingUp,
  Star,
  XCircle,
  Check,
} from "lucide-react";
import { Chart } from "react-google-charts";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { auth } from "@/lib/firebase";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

// Popular stocks for search suggestions
const POPULAR_STOCKS = [
  { symbol: "RELIANCE", name: "Reliance Industries", price: 2345.6 },
  { symbol: "TCS", name: "Tata Consultancy Services", price: 3845.2 },
  { symbol: "HDFC", name: "HDFC Bank", price: 1650.8 },
  { symbol: "INFY", name: "Infosys", price: 1520.3 },
  { symbol: "ICICIBANK", name: "ICICI Bank", price: 1120.5 },
  { symbol: "SBIN", name: "State Bank of India", price: 620.4 },
  { symbol: "BHARTIARTL", name: "Bharti Airtel", price: 1120.0 },
  { symbol: "ITC", name: "ITC Limited", price: 445.2 },
  { symbol: "WIPRO", name: "Wipro", price: 485.6 },
  { symbol: "TATAMOTORS", name: "Tata Motors", price: 890.3 },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "NIFTY50 up by 1.2%", read: false, time: "2 min ago", type: "market" },
    { id: 2, text: "Your order for RELIANCE executed", read: false, time: "15 min ago", type: "order" },
    { id: 3, text: "TCS target price updated by analysts", read: true, time: "1 hour ago", type: "news" },
  ]);
  const [cartItems, setCartItems] = useState([
    { id: 1, symbol: "RELIANCE", quantity: 10, price: 2345.6, type: "buy" },
  ]);
  const router = useRouter();
  const { user } = useAuth();

  // Refs for closing dropdowns when clicking outside
  const searchRef = useRef(null);
  const notificationsRef = useRef(null);
  const cartRef = useRef(null);
  const userMenuRef = useRef(null);

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setIsCartOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search functionality
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
      const results = POPULAR_STOCKS.filter(stock => 
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  const handleStockSelect = (symbol) => {
    router.push(`/dashboard/${symbol}`);
    setShowSearchResults(false);
    setSearchQuery("");
  };

  // Notification functions
  const handleNotificationClick = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (!isNotificationsOpen) {
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    }
  };

  const markNotificationRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setIsNotificationsOpen(false);
  };

  // Cart functions
  const handleCartClick = () => {
    setIsCartOpen(!isCartOpen);
  };

  const removeFromCart = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.quantity * item.price), 0);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <motion.header
      {...fadeInUp}
      className="flex justify-between items-center p-4 bg-gray-900 text-white sticky top-0 z-50"
    >
      <div className="flex items-center space-x-8">
        <motion.span
          onClick={() => router.push("/dashboard")}
          className="text-2xl font-bold text-blue-500 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          TradePro
        </motion.span>
        <nav className="hidden md:block">
          <ul className="flex space-x-4">
            <li>
              <button
                onClick={() => router.push("/dashboard")}
                className="text-blue-500 font-semibold flex items-center hover:text-blue-400 transition-colors cursor-pointer"
              >
                <Zap className="mr-1" size={16} />
                Explore
              </button>
            </li>
            <li>
              <button
                onClick={() => router.push("/dashboard")}
                className="text-gray-300 hover:text-blue-500 transition-colors flex items-center cursor-pointer"
              >
                <BarChart2 className="mr-1" size={16} />
                Investments
              </button>
            </li>
            <li>
              <button
                onClick={() => router.push("/dashboard")}
                className="text-gray-300 hover:text-blue-500 transition-colors flex items-center cursor-pointer"
              >
                <TrendingUp className="mr-1" size={16} />
                Learn
              </button>
            </li>
          </ul>
        </nav>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Search Bar with Results */}
        <div className="relative hidden md:block" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => searchQuery.trim() && setShowSearchResults(true)}
            placeholder="Search for stocks like RELIANCE, TCS..."
            className="pl-10 pr-4 py-2 bg-gray-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-80"
          />
          
          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50 max-h-96 overflow-y-auto">
              {searchResults.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => handleStockSelect(stock.symbol)}
                  className="w-full px-4 py-3 hover:bg-gray-700 transition flex items-center justify-between border-b border-gray-700 last:border-0 text-left"
                >
                  <div>
                    <div className="font-semibold text-white">{stock.symbol}</div>
                    <div className="text-xs text-gray-400">{stock.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400">₹{stock.price}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={handleNotificationClick}
            className="relative p-1 hover:bg-gray-800 rounded-full transition-colors"
          >
            <Bell className="text-gray-300 hover:text-blue-500 cursor-pointer transition-colors" size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          
          {/* Notifications Dropdown */}
          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
              <div className="flex justify-between items-center p-3 border-b border-gray-700">
                <h3 className="font-semibold text-white">Notifications</h3>
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-xs text-gray-400 hover:text-blue-400"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => markNotificationRead(notification.id)}
                      className={`p-3 border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition ${!notification.read ? 'bg-gray-700/50' : ''}`}
                    >
                      <div className="text-sm text-white">{notification.text}</div>
                      <div className="text-xs text-gray-400 mt-1">{notification.time}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Cart */}
        <div className="relative" ref={cartRef}>
          <button
            onClick={handleCartClick}
            className="relative p-1 hover:bg-gray-800 rounded-full transition-colors"
          >
            <ShoppingCart className="text-gray-300 hover:text-blue-500 cursor-pointer transition-colors" size={20} />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {cartItems.length}
              </span>
            )}
          </button>
          
          {/* Cart Dropdown */}
          {isCartOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
              <div className="p-3 border-b border-gray-700">
                <h3 className="font-semibold text-white">Your Orders</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {cartItems.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    Your cart is empty
                  </div>
                ) : (
                  <>
                    {cartItems.map((item) => (
                      <div key={item.id} className="p-3 border-b border-gray-700 flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-white">{item.symbol}</div>
                          <div className="text-xs text-gray-400">
                            {item.quantity} shares @ ₹{item.price}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-green-400">
                            ₹{(item.quantity * item.price).toFixed(2)}
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="p-3 border-t border-gray-700">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-300">Total:</span>
                        <span className="text-white font-bold">₹{getCartTotal().toFixed(2)}</span>
                      </div>
                      <button 
                        onClick={() => alert("Checkout feature coming soon!")}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                      >
                        Proceed to Checkout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="p-1 hover:bg-gray-800 rounded-full transition-colors"
          >
            <User className="text-gray-300 hover:text-blue-500 cursor-pointer transition-colors" size={20} />
          </button>
          
          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-50">
              <div className="py-2">
                <div className="px-4 py-3 border-b border-gray-700">
                  <p className="text-sm text-gray-300">Signed in as</p>
                  <p className="text-sm font-semibold text-white truncate">
                    {user?.email || "Guest User"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    router.push("/dashboard");
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition flex items-center space-x-2"
                >
                  <BarChart2 size={16} />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => {
                    alert("Watchlist feature coming soon!");
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition flex items-center space-x-2"
                >
                  <Star size={16} />
                  <span>Watchlist</span>
                </button>
                <button
                  onClick={() => {
                    alert("Settings - Coming soon!");
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition flex items-center space-x-2"
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
                <button
                  onClick={() => {
                    alert("Help & Support - Coming soon!");
                    setIsUserMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition flex items-center space-x-2"
                >
                  <HelpCircle size={16} />
                  <span>Help & Support</span>
                </button>
                <div className="border-t border-gray-700 mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition flex items-center space-x-2"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-1 hover:bg-gray-800 rounded-full transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <Menu className="text-gray-300 hover:text-blue-500 cursor-pointer transition-colors" size={20} />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed top-0 right-0 h-full w-64 bg-gray-800 p-4 z-50 shadow-xl">
          <button
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-4 right-4 p-1 hover:bg-gray-700 rounded-full"
          >
            <X size={20} />
          </button>
          <nav className="mt-16">
            <ul className="space-y-4">
              <li>
                <button
                  onClick={() => {
                    router.push("/dashboard");
                    setIsMenuOpen(false);
                  }}
                  className="text-blue-500 font-semibold flex items-center w-full"
                >
                  <Zap className="mr-2" size={16} />
                  Explore
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    router.push("/dashboard");
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-300 hover:text-blue-500 transition-colors flex items-center w-full"
                >
                  <BarChart2 className="mr-2" size={16} />
                  Investments
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    router.push("/dashboard");
                    setIsMenuOpen(false);
                  }}
                  className="text-gray-300 hover:text-blue-500 transition-colors flex items-center w-full"
                >
                  <TrendingUp className="mr-2" size={16} />
                  Learn
                </button>
              </li>
              <li className="pt-4 border-t border-gray-700">
                <button
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 transition-colors flex items-center w-full"
                >
                  <LogOut className="mr-2" size={16} />
                  Logout
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </motion.header>
  );
};

const Breadcrumb = ({ stock }) => (
  <motion.div
    {...fadeInUp}
    className="flex items-center space-x-2 text-sm text-gray-400 my-4"
  >
    <button onClick={() => window.location.href = "/dashboard"} className="hover:text-blue-500 cursor-pointer">
      Home
    </button>
    <span>/</span>
    <button onClick={() => window.location.href = "/dashboard"} className="hover:text-blue-500 cursor-pointer">
      Stocks
    </button>
    <span>/</span>
    <span className="text-blue-500">{stock}</span>
  </motion.div>
);

const generateRandomData = (currentValue, points) => {
  const data = [["Time", "Low", "Open", "Close", "High"]];

  for (let i = 0; i < points; i++) {
    const time = new Date(Date.now() - i * 5000).toLocaleTimeString();
    const open = currentValue + Math.random() * 10 - 5;
    const close = open + Math.random() * 10 - 5;
    const low = Math.min(open, close) - Math.random() * 5;
    const high = Math.max(open, close) + Math.random() * 5;
    data.push([time, low, open, close, high]);
  }

  return data;
};

const StockChart = ({ stock }) => {
  const [timeRange, setTimeRange] = useState("5M");
  const [data, setData] = useState(generateRandomData(425371, 5));
  const [currentValue, setCurrentValue] = useState(425371);
  const [change, setChange] = useState({ value: 0, percentage: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const points = getDataPoints(timeRange);
      const newCandle = generateRandomData(currentValue, 1);
      setData(prev => [...prev.slice(-points), ...newCandle.slice(1)]);
      const newPrice = newCandle[newCandle.length - 1][3];
      setCurrentValue(newPrice);
      const initialValue = data[1]?.[2] || currentValue;
      const changeValue = newPrice - initialValue;
      const changePercentage = (changeValue / initialValue) * 100;
      setChange({ value: changeValue, percentage: changePercentage });
    }, 5000);

    return () => clearInterval(interval);
  }, [timeRange, currentValue]);

  const getDataPoints = (range) => {
    switch (range) {
      case "5M": return 5;
      case "10M": return 10;
      case "15M": return 15;
      case "30M": return 30;
      case "1H": return 60;
      default: return 5;
    }
  };

  const options = useMemo(
    () => ({
      backgroundColor: "transparent",
      chartArea: { width: "90%", height: "80%" },
      hAxis: {
        textStyle: { color: "#9CA3AF" },
        baselineColor: "#4B5563",
        gridlines: { color: "transparent" },
        format: "HH:mm",
      },
      vAxis: {
        textStyle: { color: "#9CA3AF" },
        baselineColor: "#4B5563",
        gridlines: { color: "#4B5563" },
      },
      legend: { position: "none" },
      candlestick: {
        fallingColor: { strokeWidth: 0, fill: "#EF4444" },
        risingColor: { strokeWidth: 0, fill: "#10B981" },
      },
      animation: {
        startup: true,
        duration: 1000,
        easing: "out",
      },
    }),
    []
  );

  const handleCreateAlert = () => {
    alert(`✅ Alert set for ${stock} at price $${currentValue.toFixed(2)}`);
  };

  const handleAddToWatchlist = () => {
    alert(`⭐ ${stock} added to your watchlist!`);
  };

  return (
    <motion.div
      {...fadeInUp}
      className="bg-gray-800 p-6 rounded-lg shadow-lg my-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{stock}</h2>
          <div className="flex items-center space-x-2">
            <span className="text-3xl font-bold text-white">
              {currentValue.toFixed(2)}
            </span>
            <motion.span
              className={`flex items-center ${
                change.value >= 0 ? "text-green-500" : "text-red-500"
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={change.value}
            >
              {change.value >= 0 ? (
                <ArrowUpRight size={20} className="mr-1" />
              ) : (
                <ArrowDownRight size={20} className="mr-1" />
              )}
              {change.value > 0 ? "+" : ""}
              {change.value.toFixed(2)} ({change.percentage.toFixed(2)}%)
            </motion.span>
          </div>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <button
            onClick={handleCreateAlert}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors flex items-center cursor-pointer"
          >
            <PlusCircle className="inline-block mr-2" size={16} />
            Create Alert
          </button>
          <button
            onClick={handleAddToWatchlist}
            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors flex items-center cursor-pointer"
          >
            <Eye className="inline-block mr-2" size={16} />
            Watchlist
          </button>
        </div>
      </div>
      <Chart
        chartType="CandlestickChart"
        width="100%"
        height="400px"
        data={data}
        options={options}
      />
      <div className="flex justify-between mt-4 overflow-x-auto">
        {["5M", "10M", "15M", "30M", "1H"].map((range) => (
          <button
            key={range}
            className={`text-sm ${
              timeRange === range ? "text-blue-500" : "text-gray-300"
            } hover:text-blue-500 transition-colors flex items-center cursor-pointer`}
            onClick={() => setTimeRange(range)}
          >
            <Clock size={14} className="mr-1" />
            {range}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

const OptionsTable = ({ stock }) => {
  const [options, setOptions] = useState([
    { strike: 25400, callPrice: 115.15, callChange: 17.0, putPrice: 97.55, putChange: -15.55 },
    { strike: 25300, callPrice: 95.4, callChange: -10.9, putPrice: 96.65, putChange: 28.85 },
    { strike: 25200, callPrice: 78.5, callChange: 32.78, putPrice: 73.65, putChange: -12.25 },
    { strike: 25100, callPrice: 29.7, callChange: -10.14, putPrice: 28.3, putChange: 20.74 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setOptions((prevOptions) =>
        prevOptions.map((option) => ({
          ...option,
          callPrice: Math.max(0, option.callPrice + (Math.random() - 0.5) * 5),
          callChange: option.callChange + (Math.random() - 0.5) * 10,
          putPrice: Math.max(0, option.putPrice + (Math.random() - 0.5) * 5),
          putChange: option.putChange + (Math.random() - 0.5) * 10,
        }))
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div {...fadeInUp} className="bg-gray-800 p-6 rounded-lg shadow-lg my-6 overflow-x-auto">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <DollarSign size={24} className="mr-2" />
        Top {stock} Options
      </h3>
      <table className="w-full text-left">
        <thead>
          <tr className="text-gray-400 border-b border-gray-700">
            <th className="py-2">Strike</th><th className="py-2">Call</th><th className="py-2">Put</th>
          </tr>
        </thead>
        <tbody>
          {options.map((option, index) => (
            <tr key={index} className="border-b border-gray-700">
              <td className="py-2 text-white">{option.strike}</td>
              <td className="py-2">
                <div className="text-white">{option.callPrice.toFixed(2)}</div>
                <div className={option.callChange >= 0 ? "text-green-500" : "text-red-500"}>
                  {option.callChange > 0 ? <ArrowUpRight size={14} className="inline mr-1" /> : <ArrowDownRight size={14} className="inline mr-1" />}
                  {option.callChange.toFixed(2)}%
                </div>
              </td>
              <td className="py-2">
                <div className="text-white">{option.putPrice.toFixed(2)}</div>
                <div className={option.putChange >= 0 ? "text-green-500" : "text-red-500"}>
                  {option.putChange > 0 ? <ArrowUpRight size={14} className="inline mr-1" /> : <ArrowDownRight size={14} className="inline mr-1" />}
                  {option.putChange.toFixed(2)}%
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
};

const OpenInterest = () => {
  const [oiData, setOiData] = useState({ totalPutOI: 3513795, putCallRatio: 0.99, totalCallOI: 3555969 });

  useEffect(() => {
    const interval = setInterval(() => {
      setOiData((prev) => ({
        totalPutOI: Math.max(0, prev.totalPutOI + Math.floor((Math.random() - 0.5) * 10000)),
        putCallRatio: Math.max(0, prev.putCallRatio + (Math.random() - 0.5) * 0.02),
        totalCallOI: Math.max(0, prev.totalCallOI + Math.floor((Math.random() - 0.5) * 10000)),
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div {...fadeInUp} className="bg-gray-800 p-6 rounded-lg shadow-lg py-6 mb-6">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
        <BarChart2 size={24} className="mr-2" />
        Open Interest (OI)
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><div className="text-gray-400">Total Put OI</div><div className="text-white text-xl">{oiData.totalPutOI.toLocaleString()}</div></div>
        <div><div className="text-gray-400">Put/Call ratio</div><div className="text-white text-xl">{oiData.putCallRatio.toFixed(2)}</div></div>
        <div><div className="text-gray-400">Total Call OI</div><div className="text-white text-xl">{oiData.totalCallOI.toLocaleString()}</div></div>
      </div>
    </motion.div>
  );
};

export default function StockDetailPage({ params }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="h-40 w-40 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-white text-2xl font-bold">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-gray-300">
      <Header />
      <main className="container mx-auto px-4">
        <Breadcrumb stock={params.id} />
        <StockChart stock={params.id} />
        <OptionsTable stock={params.id} />
        <OpenInterest />
      </main>
    </div>
  );
}