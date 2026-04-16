// app/dashboard/page.tsx - FULL WORKING VERSION WITH CHART PREFERENCES
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MultiAssetChart from "@/components/MultiAssetChart";
import PortfolioSection from "@/components/PortfolioSection";
import TradeHistory from "@/components/TradeHistory";
import TradingPanel from "@/components/TradingPanel";
import { TrendingUp as AnalyticsIcon } from "lucide-react";
import { AnalyticsTab } from "@/components/AnalyticsTab";
import {
  Search,
  Bell,
  ShoppingCart,
  User,
  TrendingUp,
  Plus,
  ChevronRight,
  BarChart2,
  PieChart,
  DollarSign,
  Activity,
  Menu,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Globe,
  BookOpen,
  Gift,
  HelpCircle,
  Settings,
} from "lucide-react";
import { CandlestickSection } from "@/components/CandlestickSection";
import { StrategyModule } from "@/components/StrategyModule";
import { useAuth } from "@/components/AuthProvider";
import { userDataService, UserTrade, ChartPreferences } from "@/services/userDataService";
import { auth } from "@/lib/firebase";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const notifications = 3;
  const router = useRouter();
  const { user } = useAuth();
  
  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };
  
  return (
    <motion.header {...fadeInUp} className="flex justify-between items-center p-4 bg-gray-900 text-white">
      <div className="flex items-center space-x-8">
        <motion.span onClick={() => router.push("/")} className="text-2xl font-bold text-blue-500 cursor-pointer" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          TradePro
        </motion.span>
        <nav className="hidden md:block">
          <ul className="flex space-x-4">
            <li><a href="/dashboard" className="text-blue-500 font-semibold flex items-center"><Zap className="mr-1" size={16} />Explore</a></li>
            <li><a href="/dashboard" className="text-gray-300 hover:text-blue-500 transition-colors flex items-center"><Globe className="mr-1" size={16} />Investments</a></li>
            <li><a href="/dashboard" className="text-gray-300 hover:text-blue-500 transition-colors flex items-center"><BookOpen className="mr-1" size={16} />Learn</a></li>
          </ul>
        </nav>
      </div>
      <div className="hidden md:flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="What are you looking for today?" className="pl-10 pr-4 py-2 bg-gray-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <motion.div className="relative cursor-pointer" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Bell className="text-gray-300 hover:text-blue-500 transition-colors" />
          {notifications > 0 && (
            <motion.span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center" initial={{ scale: 0 }} animate={{ scale: 1 }}>
              {notifications}
            </motion.span>
          )}
        </motion.div>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <ShoppingCart className="text-gray-300 hover:text-blue-500 cursor-pointer transition-colors" />
        </motion.div>
        <div className="relative group">
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <User className="text-gray-300 hover:text-blue-500 cursor-pointer transition-colors" />
          </motion.div>
          <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-xl hidden group-hover:block z-20 border border-gray-700">
            <div className="py-2">
              <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-700 truncate">👤 {user?.email}</div>
              <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 transition">🚪 Logout</button>
            </div>
          </div>
        </div>
      </div>
      <div className="md:hidden">
        <motion.button onClick={() => setIsMenuOpen(!isMenuOpen)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          {isMenuOpen ? <X /> : <Menu />}
        </motion.button>
      </div>
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ opacity: 0, x: "100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "100%" }} className="fixed top-0 right-0 h-full w-64 bg-gray-800 p-4 z-50">
            <motion.button onClick={() => setIsMenuOpen(false)} className="relative ml-auto mb-4"><X /></motion.button>
            <nav className="mt-8">
              <ul className="space-y-4">
                <li><a href="/dashboard" className="text-blue-500 font-semibold flex items-center"><Zap className="mr-2" size={16} />Explore</a></li>
                <li><a href="/dashboard" className="text-gray-300 hover:text-blue-500 transition-colors flex items-center"><Globe className="mr-2" size={16} />Investments</a></li>
                <li><a href="/dashboard" className="text-gray-300 hover:text-blue-500 transition-colors flex items-center"><BookOpen className="mr-2" size={16} />Learn</a></li>
                <li><a href="/dashboard" className="text-gray-300 hover:text-blue-500 transition-colors flex items-center"><Gift className="mr-2" size={16} />Rewards</a></li>
                <li><a href="/dashboard" className="text-gray-300 hover:text-blue-500 transition-colors flex items-center"><HelpCircle className="mr-2" size={16} />Support</a></li>
                <li><a href="/dashboard" className="text-gray-300 hover:text-blue-500 transition-colors flex items-center"><Settings className="mr-2" size={16} />Settings</a></li>
                <li className="pt-4 border-t border-gray-700"><button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition-colors flex items-center w-full">🚪 Logout</button></li>
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

const TabSection = () => {
  const [activeTab, setActiveTab] = useState("Stocks");
  return (
    <motion.div {...fadeInUp} className="border-b border-gray-700">
      <div className="container mx-auto px-4">
        <ul className="flex space-x-8 overflow-x-auto">
          {["Stocks", "Mutual Funds", "ETFs", "Options", "Futures", "Watchlist"].map((tab) => (
            <motion.li key={tab} className={`py-2 cursor-pointer whitespace-nowrap ${activeTab === tab ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-300 hover:text-blue-500 transition-colors"}`} onClick={() => setActiveTab(tab)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              {tab}
            </motion.li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

const generateRandomChange = (value: number) => {
  const change = (Math.random() * 2 - 1) * 100;
  const percentChange = (change / value) * 100;
  return { change, percentChange };
};

const MarketIndices = () => {
  const [marketData, setMarketData] = useState([
    { name: "NIFTY50", value: 18245.32, change: 0, percentChange: 0 },
    { name: "SENSEX", value: 61002.57, change: 0, percentChange: 0 },
    { name: "BANKNIFTY", value: 43123.45, change: 0, percentChange: 0 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData((prevData) =>
        prevData.map((index) => {
          const { change, percentChange } = generateRandomChange(index.value);
          const newValue = index.value + change;
          return { ...index, value: newValue, change, percentChange };
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
      {marketData.map((index) => (
        <motion.div key={index.name} className="bg-gray-800 p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <h3 className="font-semibold text-gray-300">{index.name}</h3>
          <div className="flex items-center space-x-2">
            <span className="text-lg text-white">{index.value.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</span>
            <motion.span key={index.change} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-sm flex items-center ${index.change >= 0 ? "text-green-500" : "text-red-500"}`}>
              {index.change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              {index.change.toFixed(2)} ({index.percentChange.toFixed(2)}%)
            </motion.span>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

const StockCard = ({ name, initialPrice }: { name: string; initialPrice: number }) => {
  const [price, setPrice] = useState(initialPrice);
  const [change, setChange] = useState(0);
  const [percentChange, setPercentChange] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const { change: randomChange, percentChange: randomPercentChange } = generateRandomChange(price);
      setPrice((prevPrice) => prevPrice + randomChange);
      setChange(randomChange);
      setPercentChange(randomPercentChange);
    }, 1000);
    return () => clearInterval(interval);
  }, [price]);

  return (
    <motion.div className="bg-gray-800 p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <h3 className="font-semibold text-white mb-2">{name}</h3>
      <div className="flex items-center justify-between">
        <span className="text-lg text-white">{price.toLocaleString("en-IN", { style: "currency", currency: "INR" })}</span>
        <motion.span key={change} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-sm flex items-center ${change >= 0 ? "text-green-500" : "text-red-500"}`}>
          {change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {change.toFixed(2)} ({percentChange.toFixed(2)}%)
        </motion.span>
      </div>
    </motion.div>
  );
};

const MostBought = () => (
  <motion.div {...fadeInUp} className="my-8">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold text-white">Most Bought on TradePro</h2>
      <motion.a href="#" className="text-blue-500 text-sm hover:underline flex items-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>View all <ChevronRight size={16} className="ml-1" /></motion.a>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <StockCard name="Reliance" initialPrice={2345.6} />
      <StockCard name="Tata Motors" initialPrice={456.75} />
      <StockCard name="Suzlon Energy" initialPrice={18.45} />
      <StockCard name="Zomato" initialPrice={82.3} />
    </div>
  </motion.div>
);

const ProductsAndTools = () => {
  const products = [
    { name: "F&O", icon: BarChart2 },
    { name: "IPO", icon: DollarSign },
    { name: "ETFs", icon: PieChart },
    { name: "FDs", icon: TrendingUp },
    { name: "US Stocks", icon: Activity },
  ];
  return (
    <motion.div {...fadeInUp} className="my-8">
      <h2 className="text-xl font-semibold text-white mb-4">Products & tools</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {products.map((product) => (
          <motion.div key={product.name} className="bg-gray-800 p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow text-center cursor-pointer" whileHover={{ scale: 1.05, backgroundColor: "#2D3748" }} whileTap={{ scale: 0.95 }}>
            <motion.div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2" whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
              <product.icon className="text-white" />
            </motion.div>
            <span className="text-gray-300">{product.name}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const TopGainers = () => (
  <motion.div {...fadeInUp} className="my-8">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold text-white">Top Gainers</h2>
      <motion.a href="#" className="text-blue-500 text-sm hover:underline flex items-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>See more <ChevronRight size={16} className="ml-1" /></motion.a>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <StockCard name="TCS" initialPrice={845.6} />
      <StockCard name="HDFC" initialPrice={135.6} />
      <StockCard name="ICICI" initialPrice={345.6} />
      <StockCard name="Airtel" initialPrice={535.6} />
    </div>
  </motion.div>
);

const TopByMarketCap = () => {
  const [expandedCompany, setExpandedCompany] = useState<string | null>(null);
  const companies = [
    { name: "Reliance Industries", marketCap: 1523456.78 },
    { name: "TCS", marketCap: 1234567.89 },
    { name: "HDFC Bank", marketCap: 987654.32 },
    { name: "Infosys", marketCap: 7632.1 },
    { name: "ICICI Bank", marketCap: 5410.98 },
  ];
  return (
    <motion.div {...fadeInUp} className="py-8">
      <h2 className="text-xl font-semibold text-white mb-4">Top by Market Cap</h2>
      <div className="space-y-4">
        {companies.map((company) => (
          <motion.div key={company.name} className="bg-gray-800 p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setExpandedCompany(expandedCompany === company.name ? null : company.name)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <div className="flex justify-between items-center">
              <span className="text-white">{company.name}</span>
              <div className="flex items-center space-x-4">
                <span className="text-gray-300">₹{company.marketCap.toFixed(2)} Cr</span>
                <motion.div animate={{ rotate: expandedCompany === company.name ? 180 : 0 }} transition={{ duration: 0.3 }}>
                  <Plus className="text-blue-500" />
                </motion.div>
              </div>
            </div>
            <AnimatePresence>
              {expandedCompany === company.name && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="mt-4 text-gray-300">
                  <p>Additional information about {company.name} goes here.</p>
                  <motion.button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-full flex items-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>View Details <ChevronRight size={16} className="ml-1" /></motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [dataLoaded, setDataLoaded] = useState(false);
  const [portfolio, setPortfolio] = useState<Record<string, any>>({});
  const [cashBalance, setCashBalance] = useState(10000);
  const [tradeHistory, setTradeHistory] = useState<UserTrade[]>([]);
  const [activeMainTab, setActiveMainTab] = useState<'trading' | 'analytics'>('trading');
  const [analyticsSymbol, setAnalyticsSymbol] = useState<string>('AAPL');
  const [analyticsMarketData, setAnalyticsMarketData] = useState<any[]>([]);
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({
    AAPL: 180,
    TSLA: 250,
    GOOGL: 140
  });
  const [chartPreferences, setChartPreferences] = useState<ChartPreferences>({
    defaultChartType: 'candlestick',
    showVolume: true,
    timeframe: '1M',
    theme: 'dark'
  });

  const transactionCost = 10;

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Load user data from Firestore
  useEffect(() => {
    if (!user) return;

    const loadUserData = async () => {
      try {
        console.log("Loading user data from Firestore for user:", user.email);
        const allData = await userDataService.loadAllUserData();
        
        console.log("All data loaded:", {
          hasPortfolio: !!allData.portfolio,
          tradeCount: allData.tradeHistory?.length || 0,
          watchlistCount: allData.watchlist?.length || 0,
          hasChartPreferences: !!allData.chartPreferences
        });
        
        if (allData.portfolio) {
          setPortfolio(allData.portfolio.holdings || {});
          setCashBalance(allData.portfolio.cashBalance || 10000);
          console.log("Portfolio loaded:", allData.portfolio);
        }
        
        if (allData.tradeHistory && Array.isArray(allData.tradeHistory)) {
          setTradeHistory(allData.tradeHistory);
          console.log(`✅ Loaded ${allData.tradeHistory.length} trades from Firestore:`, allData.tradeHistory);
        } else {
          console.log("No trade history found, initializing empty array");
          setTradeHistory([]);
        }
        
        if (allData.chartPreferences) {
          setChartPreferences(allData.chartPreferences);
          console.log("Chart preferences loaded:", allData.chartPreferences);
        }
        
        setDataLoaded(true);
      } catch (error) {
        console.error('Error loading user data:', error);
        setDataLoaded(true);
      }
    };

    loadUserData();
  }, [user]);

  // Save portfolio to Firestore
  useEffect(() => {
    if (dataLoaded && user && Object.keys(portfolio).length > 0) {
      userDataService.savePortfolio({
        holdings: portfolio,
        cashBalance: cashBalance
      }).catch(err => console.error('Save error:', err));
    }
  }, [portfolio, cashBalance, dataLoaded, user]);

  // Save trade history to Firestore - FIXED
  useEffect(() => {
    if (dataLoaded && user && tradeHistory.length >= 0) {
      userDataService.saveTradeHistory(tradeHistory).catch(err => 
        console.error('Error saving trade history:', err)
      );
    }
  }, [tradeHistory, dataLoaded, user]);

  // Save chart preferences to Firestore
  useEffect(() => {
    if (dataLoaded && user && chartPreferences) {
      userDataService.saveChartPreferences(chartPreferences).catch(err => 
        console.error('Error saving chart preferences:', err)
      );
    }
  }, [chartPreferences, dataLoaded, user]);

  // Generate mock market data for analytics
  useEffect(() => {
    const generateMockDataForSymbol = (symbol: string) => {
      const data = [];
      let basePrice = 150;
      
      switch(symbol) {
        case 'AAPL': basePrice = 175; break;
        case 'GOOGL': basePrice = 140; break;
        case 'MSFT': basePrice = 330; break;
        case 'AMZN': basePrice = 130; break;
        case 'TSLA': basePrice = 250; break;
        case 'TATA': basePrice = 150; break;
        case 'RELIANCE': basePrice = 2500; break;
        case 'TCS': basePrice = 3800; break;
        case 'HDFC': basePrice = 1650; break;
        default: basePrice = 150;
      }
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 200);

      for (let i = 0; i < 200; i++) {
        let trend = 0;
        if (symbol === 'AAPL') trend = 0.3;
        if (symbol === 'TSLA') trend = 0.5;
        if (symbol === 'RELIANCE') trend = 0.2;
        
        const change = ((Math.random() - 0.5) * 4) + trend;
        basePrice += change;
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);

        data.push({
          timestamp: date.toISOString(),
          open: Math.max(10, basePrice - Math.random() * 2),
          high: Math.max(10, basePrice + Math.random() * 3),
          low: Math.max(10, basePrice - Math.random() * 3),
          close: Math.max(10, basePrice),
          volume: Math.random() * 10000000 + 5000000,
          symbol: symbol
        });
      }
      return data;
    };

    setAnalyticsMarketData(generateMockDataForSymbol(analyticsSymbol));
  }, [analyticsSymbol]);

  // Update stock prices periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrices(prev => ({
        AAPL: Math.max(50, prev.AAPL + (Math.random() - 0.5) * 5),
        TSLA: Math.max(100, prev.TSLA + (Math.random() - 0.5) * 8),
        GOOGL: Math.max(80, prev.GOOGL + (Math.random() - 0.5) * 3)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const buyStock = async (symbol: string, quantity: number, price: number) => {
    const totalCost = price * quantity + transactionCost;
    
    if (totalCost > cashBalance) {
      alert(`Insufficient funds! Need $${totalCost.toFixed(2)}, have $${cashBalance.toFixed(2)}`);
      return;
    }

    setPortfolio((prev) => {
      const existing = prev[symbol];
      const newQuantity = (existing?.quantity || 0) + quantity;
      const newTotalCost = (existing?.totalCost || 0) + (price * quantity);
      return {
        ...prev,
        [symbol]: { quantity: newQuantity, totalCost: newTotalCost },
      };
    });

    setCashBalance(prev => prev - totalCost);

    const newTrade: UserTrade = {
      id: Date.now().toString(),
      type: "BUY",
      symbol,
      quantity,
      price,
      time: new Date().toISOString(),
      totalCost: totalCost,
    };

    console.log("Adding new trade:", newTrade);
    console.log("Current trade history length before add:", tradeHistory.length);
    
    await userDataService.addTrade(newTrade);
    
    setTradeHistory((prev) => {
      const updated = [...prev, newTrade];
      console.log("Updated trade history length:", updated.length);
      return updated;
    });
    
    alert(`✅ Successfully bought ${quantity} shares of ${symbol}`);
  };

  const sellStock = async (symbol: string, quantity: number, price: number) => {
    const existing = portfolio[symbol];

    if (!existing || existing.quantity < quantity) {
      alert(`❌ You only have ${existing?.quantity || 0} shares of ${symbol}`);
      return;
    }

    const totalRevenue = price * quantity - transactionCost;
    const newQuantity = existing.quantity - quantity;
    const newTotalCost = existing.totalCost * (newQuantity / existing.quantity);

    setPortfolio((prev) => {
      if (newQuantity === 0) {
        const { [symbol]: _, ...rest } = prev;
        return rest;
      } else {
        return {
          ...prev,
          [symbol]: { quantity: newQuantity, totalCost: newTotalCost },
        };
      }
    });

    setCashBalance(prev => prev + totalRevenue);

    const newTrade: UserTrade = {
      id: Date.now().toString(),
      type: "SELL",
      symbol,
      quantity,
      price,
      time: new Date().toISOString(),
      totalCost: totalRevenue,
    };

    console.log("Adding new sell trade:", newTrade);
    console.log("Current trade history length before add:", tradeHistory.length);
    
    await userDataService.addTrade(newTrade);
    
    setTradeHistory((prev) => {
      const updated = [...prev, newTrade];
      console.log("Updated trade history length:", updated.length);
      return updated;
    });
    
    alert(`✅ Successfully sold ${quantity} shares of ${symbol}`);
  };

  // Show loading state
  if (authLoading || !dataLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading your trading dashboard...</p>
          <p className="text-sm text-gray-400 mt-2">Welcome, {user?.email}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="bg-gray-900 min-h-screen text-gray-300">
      <Header />
      
      {/* User info bar */}
      <div className="bg-gray-800/50 border-b border-gray-700 py-2 px-4 text-center">
        <p className="text-xs text-gray-400">
          Logged in as: <span className="text-blue-400 font-medium">{user.email}</span>
          <span className="mx-2">•</span>
          <span className="text-green-400">✓ Data saved to cloud</span>
        </p>
      </div>

      {/* Main Navigation Tabs */}
      <div className="border-b border-gray-700 sticky top-0 bg-gray-900 z-10">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveMainTab('trading')}
              className={`px-6 py-3 font-medium transition-all ${activeMainTab === 'trading' ? 'text-blue-500 border-b-2 border-blue-500 bg-gray-800/50' : 'text-gray-400 hover:text-gray-200'}`}
            >
              Trading Dashboard
            </button>
            <button
              onClick={() => setActiveMainTab('analytics')}
              className={`px-6 py-3 font-medium transition-all flex items-center space-x-2 ${activeMainTab === 'analytics' ? 'text-blue-500 border-b-2 border-blue-500 bg-gray-800/50' : 'text-gray-400 hover:text-gray-200'}`}
            >
              <AnalyticsIcon size={18} />
              <span>Analytics Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        {activeMainTab === 'trading' ? (
          <> 
            <TabSection />
            <MultiAssetChart />
            <CandlestickSection />
            <div className="mt-8 mb-6 pt-4 border-t border-gray-800">
              <StrategyModule />
            </div>
            <MarketIndices />
            <MostBought />
            <ProductsAndTools />
            <TopGainers />
            <TopByMarketCap />
            
            <TradingPanel 
              buyStock={buyStock}
              sellStock={sellStock}
              portfolio={portfolio}
              cashBalance={cashBalance}
            />
            
            <PortfolioSection 
              portfolio={portfolio}
              currentPrices={currentPrices}
              cashBalance={cashBalance}
            />
            
            <TradeHistory trades={tradeHistory} />
          </>
        ) : (
          <AnalyticsTab
            marketData={analyticsMarketData}
            selectedSymbol={analyticsSymbol}
            onSymbolChange={setAnalyticsSymbol}
          />
        )}
      </main>
    </div>
  );
}