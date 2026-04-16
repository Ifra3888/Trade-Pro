// services/userDataService.ts
import { db, auth } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';

export interface UserPortfolio {
  holdings: Record<string, { quantity: number; totalCost: number }>;
  cashBalance: number;
}

export interface UserTrade {
  id: string;
  type: 'BUY' | 'SELL';
  symbol: string;
  quantity: number;
  price: number;
  time: string;  // Now stores full ISO string like "2024-01-15T14:30:00.000Z"
  totalCost: number;
}

export interface UserStrategy {
  id: string;
  name: string;
  description: string;
  rules: any[];
  enabled: boolean;
  createdAt: Date;
}

export interface UserPreferences {
  theme: 'dark' | 'light';
  defaultChartType: 'line' | 'bar';
  emailNotifications: boolean;
  priceAlerts: boolean;
}

export interface ChartPreferences {
  defaultChartType: 'line' | 'candlestick' | 'bar';
  showVolume: boolean;
  timeframe: '1D' | '1W' | '1M' | '3M' | '1Y';
  theme: 'dark' | 'light';
}

class UserDataService {
  private getUserId(): string | null {
    return auth.currentUser?.uid || null;
  }

  private async getUserDoc() {
    const userId = this.getUserId();
    if (!userId) throw new Error('User not authenticated');
    return doc(db, 'users', userId);
  }

  // Portfolio Methods
  async getPortfolio(): Promise<UserPortfolio | null> {
    try {
      const userDoc = await this.getUserDoc();
      const docSnap = await getDoc(userDoc);
      if (docSnap.exists()) {
        return docSnap.data().portfolio || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting portfolio:', error);
      return null;
    }
  }

  async getStrategies(): Promise<UserStrategy[]> {
    try {
      const userDoc = await this.getUserDoc();
      const docSnap = await getDoc(userDoc);
      if (docSnap.exists()) {
        const strategies = docSnap.data().strategies || [];
        // Convert Firestore timestamps back to Date objects
        return strategies.map((s: any) => ({
          ...s,
          createdAt: s.createdAt?.toDate?.() || new Date(s.createdAt)
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting strategies:', error);
      return [];
    }
  }

  async saveStrategies(strategies: UserStrategy[]): Promise<void> {
    try {
      const userDoc = await this.getUserDoc();
      // Convert Date objects to ISO strings for Firestore
      const strategiesForFirestore = strategies.map(s => ({
        ...s,
        createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt
      }));
      await setDoc(userDoc, { strategies: strategiesForFirestore }, { merge: true });
      console.log(`Saved ${strategies.length} strategies to Firestore`);
    } catch (error) {
      console.error('Error saving strategies:', error);
      throw error;
    }
  }

  async addStrategy(strategy: UserStrategy): Promise<void> {
    try {
      const currentStrategies = await this.getStrategies();
      const updatedStrategies = [...currentStrategies, strategy];
      await this.saveStrategies(updatedStrategies);
      console.log(`Added strategy: ${strategy.name}`);
    } catch (error) {
      console.error('Error adding strategy:', error);
      throw error;
    }
  }

  async updateStrategy(strategy: UserStrategy): Promise<void> {
    try {
      const currentStrategies = await this.getStrategies();
      const index = currentStrategies.findIndex(s => s.id === strategy.id);
      if (index !== -1) {
        currentStrategies[index] = strategy;
        await this.saveStrategies(currentStrategies);
        console.log(`Updated strategy: ${strategy.name}`);
      }
    } catch (error) {
      console.error('Error updating strategy:', error);
      throw error;
    }
  }

  async deleteStrategy(strategyId: string): Promise<void> {
    try {
      const currentStrategies = await this.getStrategies();
      const updatedStrategies = currentStrategies.filter(s => s.id !== strategyId);
      await this.saveStrategies(updatedStrategies);
      console.log(`Deleted strategy with id: ${strategyId}`);
    } catch (error) {
      console.error('Error deleting strategy:', error);
      throw error;
    }
  }

  async savePortfolio(portfolio: UserPortfolio): Promise<void> {
    try {
      const userDoc = await this.getUserDoc();
      await setDoc(userDoc, { portfolio }, { merge: true });
      console.log('Portfolio saved successfully');
    } catch (error) {
      console.error('Error saving portfolio:', error);
      throw error;
    }
  }

  // Trade History Methods - UPDATED with better debugging
  async getTradeHistory(): Promise<UserTrade[]> {
    try {
      const userDoc = await this.getUserDoc();
      const docSnap = await getDoc(userDoc);
      console.log('Fetching trade history from Firestore...');
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const trades = data.tradeHistory || [];
        console.log(`Found ${trades.length} trades in Firestore:`, trades);
        return trades;
      }
      console.log('No trade history document found');
      return [];
    } catch (error) {
      console.error('Error getting trade history:', error);
      return [];
    }
  }

  async saveTradeHistory(trades: UserTrade[]): Promise<void> {
    try {
      const userDoc = await this.getUserDoc();
      await setDoc(userDoc, { tradeHistory: trades }, { merge: true });
      console.log(`Saved ${trades.length} trades to Firestore`);
    } catch (error) {
      console.error('Error saving trade history:', error);
      throw error;
    }
  }

  async addTrade(trade: UserTrade): Promise<void> {
    try {
      const userDoc = await this.getUserDoc();
      // Get current trades first
      const currentTrades = await this.getTradeHistory();
      const updatedTrades = [...currentTrades, trade];
      await setDoc(userDoc, { tradeHistory: updatedTrades }, { merge: true });
      console.log(`Added new trade: ${trade.type} ${trade.symbol} - Total trades: ${updatedTrades.length}`);
    } catch (error) {
      console.error('Error adding trade:', error);
      throw error;
    }
  }

  // Watchlist Methods
  async getWatchlist(): Promise<string[]> {
    try {
      const userDoc = await this.getUserDoc();
      const docSnap = await getDoc(userDoc);
      if (docSnap.exists()) {
        return docSnap.data().watchlist || [];
      }
      return [];
    } catch (error) {
      console.error('Error getting watchlist:', error);
      return [];
    }
  }

  async addToWatchlist(symbol: string): Promise<void> {
    try {
      const userDoc = await this.getUserDoc();
      await updateDoc(userDoc, {
        watchlist: arrayUnion(symbol)
      });
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      throw error;
    }
  }

  async removeFromWatchlist(symbol: string): Promise<void> {
    try {
      const userDoc = await this.getUserDoc();
      await updateDoc(userDoc, {
        watchlist: arrayRemove(symbol)
      });
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      throw error;
    }
  }

  // Preferences Methods
  async getPreferences(): Promise<UserPreferences | null> {
    try {
      const userDoc = await this.getUserDoc();
      const docSnap = await getDoc(userDoc);
      if (docSnap.exists()) {
        return docSnap.data().preferences || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting preferences:', error);
      return null;
    }
  }

  async savePreferences(preferences: UserPreferences): Promise<void> {
    try {
      const userDoc = await this.getUserDoc();
      await setDoc(userDoc, { preferences }, { merge: true });
    } catch (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  }

  // Chart Preferences Methods
  async getChartPreferences(): Promise<ChartPreferences | null> {
    try {
      const userDoc = await this.getUserDoc();
      const docSnap = await getDoc(userDoc);
      if (docSnap.exists()) {
        return docSnap.data().chartPreferences || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting chart preferences:', error);
      return null;
    }
  }

  async saveChartPreferences(preferences: ChartPreferences): Promise<void> {
    try {
      const userDoc = await this.getUserDoc();
      await setDoc(userDoc, { chartPreferences: preferences }, { merge: true });
      console.log('Chart preferences saved successfully');
    } catch (error) {
      console.error('Error saving chart preferences:', error);
      throw error;
    }
  }

  // Load all user data at once
  async loadAllUserData() {
    try {
      const userDoc = await this.getUserDoc();
      const docSnap = await getDoc(userDoc);
      
      console.log('Loading all user data from Firestore...');
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('Raw data from Firestore:', data);
        
        // Convert strategies dates if needed
        const strategies = (data.strategies || []).map((s: any) => ({
          ...s,
          createdAt: s.createdAt?.toDate?.() || new Date(s.createdAt)
        }));
        
        return {
          portfolio: data.portfolio || null,
          tradeHistory: data.tradeHistory || [],
          watchlist: data.watchlist || [],
          preferences: data.preferences || null,
          strategies: strategies,
          chartPreferences: data.chartPreferences || null,
        };
      }
      
      console.log('No existing user document, creating new one');
      return {
        portfolio: null,
        tradeHistory: [],
        watchlist: [],
        preferences: null,
        strategies: [],
        chartPreferences: null,
      };
    } catch (error) {
      console.error('Error loading all user data:', error);
      return {
        portfolio: null,
        tradeHistory: [],
        watchlist: [],
        preferences: null,
        strategies: [],
        chartPreferences: null,
      };
    }
  }

  // Clear all user data (for testing)
  async clearAllUserData(): Promise<void> {
    try {
      const userDoc = await this.getUserDoc();
      await setDoc(userDoc, {
        portfolio: { holdings: {}, cashBalance: 10000 },
        tradeHistory: [],
        watchlist: [],
        preferences: null,
        strategies: [],
        chartPreferences: null
      });
      console.log('Cleared all user data');
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }
}

export const userDataService = new UserDataService();