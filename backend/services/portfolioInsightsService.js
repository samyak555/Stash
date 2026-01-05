import Holding from '../models/Holding.js';
import fileDB from '../utils/fileDB.js';
import {
  getCryptoPrices,
  getMetalPrices,
} from './MarketPriceEngine.js';

/**
 * Generate descriptive portfolio insights (NO ADVICE)
 */
export const getPortfolioInsights = async (userId) => {
  try {
    const holdings = await Holding.find({ userId }).lean();
    const expenses = fileDB.findExpenses({ user: userId });
    const incomes = fileDB.findIncomes({ user: userId });

    const insights = [];

    // 1. Asset Allocation Summary
    if (holdings.length > 0) {
      const totalInvested = holdings.reduce((sum, h) => sum + (h.investedAmount || 0), 0);
      const allocation = {
        stocks: 0,
        crypto: 0,
        mutualFunds: 0,
        gold: 0,
        silver: 0,
      };

      holdings.forEach(h => {
        if (allocation[h.assetType] !== undefined) {
          allocation[h.assetType] += h.investedAmount || 0;
        }
      });

      const allocationPercent = {};
      Object.keys(allocation).forEach(key => {
        allocationPercent[key] = totalInvested > 0 
          ? ((allocation[key] / totalInvested) * 100).toFixed(1)
          : 0;
      });

      insights.push({
        type: 'asset_allocation',
        title: 'Asset Allocation',
        description: `Your portfolio is distributed as: Stocks ${allocationPercent.stocks}%, Crypto ${allocationPercent.crypto}%, Mutual Funds ${allocationPercent.mf}%, Gold ${allocationPercent.gold}%, Silver ${allocationPercent.silver}%`,
        data: allocationPercent,
      });
    }

    // 2. Monthly Savings Trend
    if (incomes.length > 0 && expenses.length > 0) {
      const monthlyData = {};
      
      [...incomes, ...expenses].forEach(item => {
        const date = new Date(item.date || item.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { income: 0, expenses: 0 };
        }
        
        if (item.amount && item.source) {
          // It's income
          monthlyData[monthKey].income += parseFloat(item.amount) || 0;
        } else if (item.amount && item.category) {
          // It's expense
          monthlyData[monthKey].expenses += parseFloat(item.amount) || 0;
        }
      });

      const monthlySavings = Object.keys(monthlyData)
        .sort()
        .slice(-6) // Last 6 months
        .map(month => ({
          month,
          savings: monthlyData[month].income - monthlyData[month].expenses,
        }));

      const avgSavings = monthlySavings.length > 0
        ? monthlySavings.reduce((sum, m) => sum + m.savings, 0) / monthlySavings.length
        : 0;

      insights.push({
        type: 'savings_trend',
        title: 'Monthly Savings Trend',
        description: `Your average monthly savings over the last ${monthlySavings.length} months is ₹${avgSavings.toFixed(2)}`,
        data: monthlySavings,
        average: avgSavings,
      });
    }

    // 3. Expense vs Income Movement
    if (incomes.length > 0 && expenses.length > 0) {
      const totalIncome = incomes.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
      const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0;

      insights.push({
        type: 'expense_income',
        title: 'Expense vs Income',
        description: `Your savings rate is ${savingsRate}%. You've earned ₹${totalIncome.toFixed(2)} and spent ₹${totalExpenses.toFixed(2)}`,
        data: {
          income: totalIncome,
          expenses: totalExpenses,
          savingsRate: parseFloat(savingsRate),
        },
      });
    }

    // 4. Crypto Volatility Indicator
    const cryptoHoldings = holdings.filter(h => h.assetType === 'crypto');
    if (cryptoHoldings.length > 0) {
      const cryptoSymbols = [...new Set(cryptoHoldings.map(h => h.symbol))];
      try {
        const cryptoPrices = await getCryptoPrices(cryptoSymbols);
        const changes = Object.values(cryptoPrices)
          .filter(p => p && !p.unavailable && p.changePercent !== undefined)
          .map(p => Math.abs(p.changePercent));

        if (changes.length > 0) {
          const avgVolatility = changes.reduce((sum, c) => sum + c, 0) / changes.length;
          const volatilityLevel = avgVolatility > 5 ? 'high' : avgVolatility > 2 ? 'medium' : 'low';

          insights.push({
            type: 'crypto_volatility',
            title: 'Crypto Volatility',
            description: `Your crypto holdings show ${volatilityLevel} volatility with an average 24h change of ${avgVolatility.toFixed(2)}%`,
            data: {
              averageChange: avgVolatility,
              level: volatilityLevel,
            },
          });
        }
      } catch (error) {
        console.warn('Could not fetch crypto volatility:', error.message);
      }
    }

    // 5. Gold Exposure Percentage
    const goldHoldings = holdings.filter(h => h.assetType === 'gold');
    if (goldHoldings.length > 0) {
      const totalInvested = holdings.reduce((sum, h) => sum + (h.investedAmount || 0), 0);
      const goldInvested = goldHoldings.reduce((sum, h) => sum + (h.investedAmount || 0), 0);
      const goldExposure = totalInvested > 0 ? ((goldInvested / totalInvested) * 100).toFixed(1) : 0;

      insights.push({
        type: 'gold_exposure',
        title: 'Gold Exposure',
        description: `${goldExposure}% of your portfolio is allocated to gold`,
        data: {
          percentage: parseFloat(goldExposure),
          amount: goldInvested,
        },
      });
    }

    return {
      insights,
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error generating portfolio insights:', error);
    return {
      insights: [],
      generatedAt: new Date().toISOString(),
      error: 'Unable to generate insights',
    };
  }
};

