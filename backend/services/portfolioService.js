import Holding from '../models/Holding.js';
import {
  getStockPrice,
  getStockPrices,
  getCryptoPrice,
  getCryptoPrices,
  getMetalPrice,
  getMutualFundNAV,
  getMutualFundNAVs,
} from './MarketPriceEngine.js';

/**
 * Calculate portfolio metrics for a user with optimized price fetching
 */
export const calculatePortfolio = async (userId) => {
  try {
    // Get all holdings for the user
    const holdings = await Holding.find({ userId }).lean();

    if (holdings.length === 0) {
      return {
        totalInvested: 0,
        totalCurrentValue: 0,
        totalProfitLoss: 0,
        totalProfitLossPercent: 0,
        holdings: [],
        assetAllocation: {},
        bestPerformer: null,
        worstPerformer: null,
      };
    }

    // Extract unique symbols by asset type for batch fetching
    const stockSymbols = [...new Set(holdings.filter(h => h.assetType === 'stock').map(h => h.symbol))];
    const cryptoSymbols = [...new Set(holdings.filter(h => h.assetType === 'crypto').map(h => h.symbol))];
    const mfSchemeCodes = [...new Set(holdings.filter(h => h.assetType === 'mf').map(h => h.symbol))];
    const hasGold = holdings.some(h => h.assetType === 'gold');
    const hasSilver = holdings.some(h => h.assetType === 'silver');

    // Batch fetch all prices
    const [stockPrices, cryptoPrices, mfNavs, metalPrices] = await Promise.all([
      stockSymbols.length > 0 ? getStockPrices(stockSymbols).catch(() => ({})) : Promise.resolve({}),
      cryptoSymbols.length > 0 ? getCryptoPrices(cryptoSymbols).catch(() => ({})) : Promise.resolve({}),
      mfSchemeCodes.length > 0 ? getMutualFundNAVs(mfSchemeCodes).catch(() => ({})) : Promise.resolve({}),
      (hasGold || hasSilver) ? getMetalPrices().catch(() => ({ gold: null, silver: null })) : Promise.resolve({ gold: null, silver: null }),
    ]);

    // Map holdings with prices
    const holdingsWithPrices = holdings.map((holding) => {
      let currentPrice = 0;
      let priceData = null;
      let priceUnavailable = false;

      try {
        switch (holding.assetType) {
          case 'stock':
            priceData = stockPrices[holding.symbol];
            if (priceData && !priceData.unavailable) {
              currentPrice = priceData.price || 0;
            } else {
              priceUnavailable = true;
              currentPrice = holding.buyPrice; // Fallback to buy price
            }
            break;
          case 'crypto':
            priceData = cryptoPrices[holding.symbol];
            if (priceData && !priceData.unavailable) {
              currentPrice = priceData.price || 0;
            } else {
              priceUnavailable = true;
              currentPrice = holding.buyPrice; // Fallback to buy price
            }
            break;
          case 'gold':
            priceData = metalPrices.gold;
            if (priceData && !priceData.unavailable) {
              currentPrice = priceData.price || 0;
            } else {
              priceUnavailable = true;
              currentPrice = holding.buyPrice; // Fallback to buy price
            }
            break;
          case 'silver':
            priceData = metalPrices.silver;
            if (priceData && !priceData.unavailable) {
              currentPrice = priceData.price || 0;
            } else {
              priceUnavailable = true;
              currentPrice = holding.buyPrice; // Fallback to buy price
            }
            break;
          case 'mf':
            priceData = mfNavs[holding.symbol];
            if (priceData && !priceData.unavailable) {
              currentPrice = priceData.nav || 0;
            } else {
              priceUnavailable = true;
              currentPrice = holding.buyPrice; // Fallback to buy price
            }
            break;
          default:
            currentPrice = holding.buyPrice;
        }
      } catch (error) {
        console.error(`Error processing price for ${holding.symbol}:`, error.message);
        currentPrice = holding.buyPrice; // Fallback to buy price
        priceUnavailable = true;
      }

      const currentValue = holding.quantity * currentPrice;
      const profitLoss = currentValue - holding.investedAmount;
      const profitLossPercent = holding.investedAmount > 0
        ? (profitLoss / holding.investedAmount) * 100
        : 0;

      return {
        ...holding,
        currentPrice,
        currentValue,
        profitLoss,
        profitLossPercent,
        priceData: priceData || null,
        priceUnavailable,
      };
    });

    // Calculate totals
    const totalInvested = holdings.reduce((sum, h) => sum + (h.investedAmount || 0), 0);
    const totalCurrentValue = holdingsWithPrices.reduce((sum, h) => sum + (h.currentValue || 0), 0);
    const totalProfitLoss = totalCurrentValue - totalInvested;
    const totalProfitLossPercent = totalInvested > 0
      ? (totalProfitLoss / totalInvested) * 100
      : 0;

    // Calculate asset allocation
    const assetAllocation = {};
    holdingsWithPrices.forEach(holding => {
      if (!assetAllocation[holding.assetType]) {
        assetAllocation[holding.assetType] = {
          invested: 0,
          currentValue: 0,
          count: 0,
        };
      }
      assetAllocation[holding.assetType].invested += holding.investedAmount || 0;
      assetAllocation[holding.assetType].currentValue += holding.currentValue || 0;
      assetAllocation[holding.assetType].count += 1;
    });

    // Calculate percentages
    Object.keys(assetAllocation).forEach(type => {
      const allocation = assetAllocation[type];
      allocation.percentage = totalCurrentValue > 0
        ? (allocation.currentValue / totalCurrentValue) * 100
        : 0;
      allocation.profitLoss = allocation.currentValue - allocation.invested;
      allocation.profitLossPercent = allocation.invested > 0
        ? (allocation.profitLoss / allocation.invested) * 100
        : 0;
    });

    // Find best and worst performers
    const sortedByPerformance = [...holdingsWithPrices].sort(
      (a, b) => (b.profitLossPercent || 0) - (a.profitLossPercent || 0)
    );
    const bestPerformer = sortedByPerformance.length > 0 && sortedByPerformance[0].profitLossPercent > 0
      ? sortedByPerformance[0]
      : null;
    const worstPerformer = sortedByPerformance.length > 0 && sortedByPerformance[sortedByPerformance.length - 1].profitLossPercent < 0
      ? sortedByPerformance[sortedByPerformance.length - 1]
      : null;

    return {
      totalInvested,
      totalCurrentValue,
      totalProfitLoss,
      totalProfitLossPercent,
      holdings: holdingsWithPrices,
      assetAllocation,
      bestPerformer: bestPerformer ? {
        symbol: bestPerformer.symbol,
        name: bestPerformer.name,
        profitLossPercent: bestPerformer.profitLossPercent,
        assetType: bestPerformer.assetType,
      } : null,
      worstPerformer: worstPerformer ? {
        symbol: worstPerformer.symbol,
        name: worstPerformer.name,
        profitLossPercent: worstPerformer.profitLossPercent,
        assetType: worstPerformer.assetType,
      } : null,
    };
  } catch (error) {
    console.error('Error calculating portfolio:', error);
    // Return partial portfolio even on error
    const holdings = await Holding.find({ userId }).lean();
    return {
      totalInvested: holdings.reduce((sum, h) => sum + (h.investedAmount || 0), 0),
      totalCurrentValue: holdings.reduce((sum, h) => sum + (h.investedAmount || 0), 0), // Use invested as fallback
      totalProfitLoss: 0,
      totalProfitLossPercent: 0,
      holdings: holdings.map(h => ({
        ...h,
        currentPrice: h.buyPrice,
        currentValue: h.investedAmount,
        profitLoss: 0,
        profitLossPercent: 0,
        priceUnavailable: true,
      })),
      assetAllocation: {},
      bestPerformer: null,
      worstPerformer: null,
    };
  }
};

/**
 * Get portfolio summary (lightweight, for dashboard)
 */
export const getPortfolioSummary = async (userId) => {
  try {
    const portfolio = await calculatePortfolio(userId);
    return {
      totalInvested: portfolio.totalInvested,
      totalCurrentValue: portfolio.totalCurrentValue,
      totalProfitLoss: portfolio.totalProfitLoss,
      totalProfitLossPercent: portfolio.totalProfitLossPercent,
      bestPerformer: portfolio.bestPerformer,
      holdingCount: portfolio.holdings.length,
    };
  } catch (error) {
    console.error('Error getting portfolio summary:', error);
    // Return safe fallback
    const holdings = await Holding.find({ userId }).lean();
    return {
      totalInvested: holdings.reduce((sum, h) => sum + (h.investedAmount || 0), 0),
      totalCurrentValue: holdings.reduce((sum, h) => sum + (h.investedAmount || 0), 0),
      totalProfitLoss: 0,
      totalProfitLossPercent: 0,
      bestPerformer: null,
      holdingCount: holdings.length,
    };
  }
};
