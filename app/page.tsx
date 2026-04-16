"use client";
import {
  ArrowRight,
  BarChart2,
  Bell,
  Book,
  Globe,
  Menu,
  PieChart,
  Shield,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

const Animatedsection = ({ children }: any) => {
  const ref = useRef(null);
  const isinview = useInView(ref, { once: true, amount: 0.2 });
  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isinview ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.section>
  );
};

const FeatureBox = ({ icon, title, description, delay }: any) => {
  const [ishovered, setishovered] = useState(false);
  
  return (
    <motion.div
      whileHover={{ scale: 1.05, boxShadow: "0 10px 40px rgba(59,130,246,0.3)" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      onHoverStart={() => setishovered(true)}
      onHoverEnd={() => setishovered(false)}
      className="bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col items-center text-center h-full relative overflow-hidden cursor-pointer"
    >
      <motion.div
        animate={{ scale: ishovered ? 1.2 : 1, rotate: ishovered ? 360 : 0 }}
        transition={{ duration: 0.3 }}
        className="text-blue-500 mb-4 relative z-10"
      >
        {icon}
      </motion.div>
      <h3 className="text-xl font-semibold mb-2 text-white relative z-10">
        {title}
      </h3>
      <p className="text-gray-300 mb-4 grow relative z-10">
        {description}
      </p>
      <motion.button
        whileHover={{ x: 5 }}
        className="mt-auto text-blue-500 flex items-center text-sm font-medium relative z-10"
      >
        Learn More <ArrowRight className="ml-1" size={16} />
      </motion.button>
      <motion.div
        className="absolute inset-0 bg-blue-600 opacity-0"
        animate={{ opacity: ishovered ? 0.1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default function Home() {
  const router = useRouter();
  const containeref = useRef(null);
  const [ismenuopen, setismenuopen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on client side
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (ismenuopen && !target.closest('.mobile-menu') && !target.closest('.menu-button')) {
        setismenuopen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [ismenuopen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (ismenuopen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [ismenuopen]);

  const tradingFeatures = [
    {
      icon: <Globe size={isMobile ? 24 : 32} />,
      title: "Global Markets",
      description: "Access a wide range of international markets and trade various assets from a single platform.",
    },
    {
      icon: <Zap size={isMobile ? 24 : 32} />,
      title: "Real-time Data",
      description: "Stay informed with lightning-fast, real-time market data and instant trade execution.",
    },
    {
      icon: <Shield size={isMobile ? 24 : 32} />,
      title: "Secure Trading",
      description: "Trade with confidence using our advanced encryption and multi-factor authentication systems.",
    },
    {
      icon: <PieChart size={isMobile ? 24 : 32} />,
      title: "Portfolio Analysis",
      description: "Gain insights into your portfolio performance with comprehensive analysis tools and reports.",
    },
    {
      icon: <Bell size={isMobile ? 24 : 32} />,
      title: "Price Alerts",
      description: "Never miss a trading opportunity with customizable price alerts and notifications.",
    },
    {
      icon: <Book size={isMobile ? 24 : 32} />,
      title: "Trading Education",
      description: "Enhance your trading skills with our extensive library of educational resources and webinars.",
    },
  ];

  return (
    <div ref={containeref} className="bg-gray-900 min-h-screen font-sans text-white overflow-x-hidden">
      {/* Header */}
      <header className="container mx-auto px-4 py-4 md:py-6 flex justify-between items-center relative z-20">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-2xl md:text-3xl font-bold text-blue-500 cursor-pointer"
          onClick={() => router.push("/")}
        >
          TradePro
        </motion.div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-6">
            {["Markets", "Trading", "Analysis", "Learn"].map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <span className="text-gray-300 hover:text-blue-500 transition-colors cursor-pointer">
                  {item}
                </span>
              </motion.li>
            ))}
          </ul>
        </nav>
        
        {/* Desktop Button */}
        <motion.button
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hidden md:block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          onClick={() => router.push("/login")}
        >
          Start Trading
        </motion.button>
        
        {/* Mobile Menu Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="md:hidden text-white menu-button z-30 relative"
          onClick={(e) => {
            e.stopPropagation();
            setismenuopen(!ismenuopen);
          }}
        >
          {ismenuopen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
      </header>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {ismenuopen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="mobile-menu fixed top-0 right-0 h-full w-64 bg-gray-800 z-40 p-6 shadow-xl md:hidden"
            style={{ top: 0, paddingTop: "80px" }}
          >
            <nav>
              <ul className="space-y-6">
                {["Markets", "Trading", "Analysis", "Learn", "Login", "Sign Up"].map((item) => (
                  <li key={item}>
                    <button
                      onClick={() => {
                        setismenuopen(false);
                        if (item === "Login") router.push("/login");
                        if (item === "Sign Up") router.push("/signup");
                      }}
                      className="text-gray-300 hover:text-blue-500 transition-colors text-lg w-full text-left py-2"
                    >
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="container mx-auto px-4">
        {/* Hero Section */}
        <Animatedsection>
          <div className="text-center py-12 md:py-20">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-6xl font-bold mb-4 md:mb-6"
            >
              Trade <span className="text-blue-500">Smarter</span>, Not Harder
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-2xl text-gray-400 mb-8 md:mb-12 px-4"
            >
              Access global markets with real-time data and advanced trading tools
            </motion.p>
            <motion.button
              onClick={() => router.push("/signup")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="bg-blue-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-md text-lg md:text-xl hover:bg-blue-700 transition-colors flex items-center mx-auto"
            >
              Open Free Account <ArrowRight className="ml-2" />
            </motion.button>
          </div>
        </Animatedsection>

        {/* Advanced Trading Tools Section */}
        <Animatedsection>
          <div className="py-12 md:py-20">
            <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8">
                  Advanced Trading Tools
                </h2>
                <ul className="space-y-4 md:space-y-6">
                  {["Real-time market data", "Advanced charting", "Risk management tools"].map((item, index) => (
                    <motion.li
                      whileHover={!isMobile ? { scale: 1.05, color: "#3B82f6" } : {}}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      key={index}
                      className="flex items-center text-gray-300 text-lg md:text-xl"
                    >
                      <BarChart2 className="mr-4 text-blue-500" size={isMobile ? 20 : 28} /> {item}
                    </motion.li>
                  ))}
                </ul>
              </div>
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-gray-800 p-4 md:p-8 rounded-2xl shadow-2xl overflow-hidden"
              >
                <img
                  className="w-full rounded-xl"
                  src="https://i.ibb.co/C1jWyk9/1.jpg"
                  alt="Trading platform screenshot"
                />
              </motion.div>
            </div>
          </div>
        </Animatedsection>

        {/* Market Analysis Section */}
        <Animatedsection>
          <div className="py-12 md:py-20">
            <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="bg-gray-800 p-4 md:p-8 rounded-2xl shadow-2xl overflow-hidden order-2 md:order-1"
              >
                <img
                  src="https://i.ibb.co/0K3ZTzt/2.jpg"
                  alt="Market analysis feature"
                  className="w-full rounded-xl"
                />
              </motion.div>
              <div className="order-1 md:order-2">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8">
                  Market Analysis at Your Fingertips
                </h2>
                <p className="text-gray-300 text-lg md:text-xl mb-6 md:mb-8">
                  Get in-depth market analysis and make informed trading decisions.
                </p>
                <motion.div
                  className="flex items-center bg-gray-800 p-4 md:p-6 rounded-xl"
                  whileHover={!isMobile ? { scale: 1.05 } : {}}
                >
                  <TrendingUp className="text-blue-500 mr-4 md:mr-6" size={isMobile ? 32 : 48} />
                  <div>
                    <div className="text-3xl md:text-5xl font-bold text-blue-500">500+</div>
                    <p className="text-gray-300 text-base md:text-xl">
                      Global markets available for trading
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </Animatedsection>

        {/* Why Choose TradePro Section */}
        <Animatedsection>
          <div className="py-12 md:py-20">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center mb-8 md:mb-12"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Why Choose TradePro?
                </h2>
                <p className="text-base md:text-xl text-gray-300 px-4">
                  Experience the advantage of professional-grade trading tools and resources.
                </p>
              </motion.div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {tradingFeatures.map((feature, index) => (
                  <FeatureBox
                    key={index}
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                    delay={index * 0.1}
                  />
                ))}
              </div>
            </div>
          </div>
        </Animatedsection>

        {/* CTA Section */}
        <Animatedsection>
          <div className="bg-blue-600 rounded-2xl p-8 md:p-12 text-center my-12 md:my-20">
            <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6">
              Ready to Start Trading?
            </h2>
            <p className="text-base md:text-xl mb-6 md:mb-8 px-4">
              Join thousands of traders and start your journey to financial success.
            </p>
            <motion.button 
              onClick={() => router.push("/signup")}
              className="bg-white text-blue-600 px-6 md:px-8 py-3 md:py-4 rounded-md text-lg md:text-xl font-bold hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create Free Account
            </motion.button>
          </div>
        </Animatedsection>
      </main>
    </div>
  );
}