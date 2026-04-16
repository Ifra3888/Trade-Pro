# TradePro - Advanced Trading Platform

![TradePro Banner](https://i.ibb.co/C1jWyk9/1.jpg)

## 🚀 Live Demo

[View Live Demo](https://trade-pro.vercel.app)

## 📋 Overview

TradePro is a comprehensive trading simulation platform that provides users with real-time market data, portfolio management, technical analysis tools, and educational trading features. Built with modern web technologies, it offers a realistic trading experience without involving real money.

## ✨ Features

### 1. 🔐 User Authentication & Data Persistence
- Secure user authentication using Firebase
- Persistent storage of portfolio, trade history, and preferences
- Cross-device synchronization
- Watchlist and custom indicators saved to cloud

### 2. 📊 Multi-Asset Charting
- Display and compare multiple assets on same chart
- Toggle visibility of individual assets
- Customizable chart types (line, candlestick, bar)
- Real-time data updates
- Support for stocks, ETFs, and cryptocurrencies

### 3. 💼 Portfolio Simulation
- Simulated buying and selling with real-time market data
- Track portfolio value, P&L, and individual asset performance
- Transaction costs ($10 per trade)
- Portfolio allocation visualization
- Realized and unrealized gains/losses tracking

### 4. 📈 Candlestick Pattern Recognition
- Automatic detection of common patterns (hammer, doji, engulfing)
- Visual markers on charts with tooltips
- Real-time pattern updates
- Filter and highlight specific patterns

### 5. ⚙️ Custom Trading Indicators
- Create custom technical indicators (Bollinger Bands, Moving Averages)
- Define trading rules (e.g., "Buy when price crosses MA50")
- Backtest strategies on historical data
- Real-time strategy performance tracking

### 6. 📉 Analytics Dashboard
- Professional metrics: RSI, Moving Averages, Volatility
- Customizable dashboard layout
- Time range selection (50D, 100D, 200D, All)
- Export reports to PDF
- Price alerts and notifications

### 7. 📱 Fully Responsive Design
- Mobile-first approach
- Touch-friendly interface
- Hamburger menu for mobile navigation
- Responsive charts and components

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework for production |
| **TypeScript** | Type safety and better DX |
| **Tailwind CSS** | Styling and responsive design |
| **Firebase** | Authentication & Firestore database |
| **Framer Motion** | Animations and transitions |
| **Recharts** | Charting and data visualization |
| **Lucide React** | Icons |
| **jsPDF** | PDF report generation |

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase account

### Step 1: Clone the repository

```bash
git clone https://github.com/Ifra3888/trade_pro.git
cd trade_pro
