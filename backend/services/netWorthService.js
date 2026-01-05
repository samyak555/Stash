import Holding from '../models/Holding.js';
import Liability from '../models/Liability.js';
import CashBalance from '../models/CashBalance.js';
import {
  getStockPrices,
  getCryptoPrices,
  getMetalPrices,
  getMutualFundNAVs,
} from './MarketPriceEngine.js';
import fileDB from '../utils/fileDB.js';

/**
 * Calculate Net Worth for a user
 * Net Worth = Assets - Liabilities
 */
export const calculateNetWorth = async (userId) => {
  try {
    // Get all assets
    const [holdings, cashBalances, liabilities] = await Promise.all([
      Holding.find({ userId }).lean(),
      CashBalance.find({ userId }).lean(),
      Liability.find({ userId }).lean(),
    ]);

    // Calculate cash & bank balances
    const totalCash = cashBalances.reduce((sum, cb) => sum + (cb.balance || 0), 0);

    // Calculate investment values
    const stockSymbols = [...new Set(holdings.filter(h => h.assetType === 'stock').map(h => h.symbol))];
    const cryptoSymbols = [...new Set(holdings.filter(h => h.assetType === 'crypto').map(h => h.symbol))];
    const mfSchemeCodes = [...new Set(holdings.filter(h => h.assetType === 'mf').map(h => h.symbol))];
    const hasGold = holdings.some(h => h.assetType === 'gold');
    const hasSilver = holdings.some(h => h.assetType === 'silver');

    // Fetch prices (with fallback to buy price if API fails)
    const [stockPrices, cryptoPrices, mfNavs, metalPrices] = await Promise.all([
      stockSymbols.length > 0 ? getStockPrices(stockSymbols).catch(() => ({})) : Promise.resolve({}),
      cryptoSymbols.length > 0 ? getCryptoPrices(cryptoSymbols).catch(() => ({})) : Promise.resolve({}),
      mfSchemeCodes.length > 0 ? getMutualFundNAVs(mfSchemeCodes).catch(() => ({})) : Promise.resolve({}),
      (hasGold || hasSilver) ? getMetalPrices().catch(() => ({ gold: null, silver: null })) : Promise.resolve({ gold: null, silver: null }),
    ]);

    // Calculate investment values
    let totalStocks = 0;
    let totalCrypto = 0;
    let totalMF = 0;
    let totalGold = 0;
    let totalSilver = 0;

    holdings.forEach((holding) => {
      let currentPrice = holding.buyPrice; // Fallback to buy price
      let priceUnavailable = false;

      switch (holding.assetType) {
        case 'stock':
          const stockPrice = stockPrices[holding.symbol];
          if (stockPrice && !stockPrice.unavailable) {
            currentPrice = stockPrice.price || holding.buyPrice;
          } else {
            priceUnavailable = true;
          }
          totalStocks += holding.quantity * currentPrice;
          break;
        case 'crypto':
          const cryptoPrice = cryptoPrices[holding.symbol];
          if (cryptoPrice && !cryptoPrice.unavailable) {
            currentPrice = cryptoPrice.price || holding.buyPrice;
          } else {
            priceUnavailable = true;
          }
          totalCrypto += holding.quantity * currentPrice;
          break;
        case 'mf':
          const mfNav = mfNavs[holding.symbol];
          if (mfNav && !mfNav.unavailable) {
            currentPrice = mfNav.nav || holding.buyPrice;
          } else {
            priceUnavailable = true;
          }
          totalMF += holding.quantity * currentPrice;
          break;
        case 'gold':
          const goldPrice = metalPrices.gold;
          if (goldPrice && !goldPrice.unavailable) {
            currentPrice = goldPrice.price || holding.buyPrice;
          } else {
            priceUnavailable = true;
          }
          totalGold += holding.quantity * currentPrice;
          break;
        case 'silver':
          const silverPrice = metalPrices.silver;
          if (silverPrice && !silverPrice.unavailable) {
            currentPrice = silverPrice.price || holding.buyPrice;
          } else {
            priceUnavailable = true;
          }
          totalSilver += holding.quantity * currentPrice;
          break;
      }
    });

    // Calculate total assets
    const totalAssets = totalCash + totalStocks + totalCrypto + totalMF + totalGold + totalSilver;

    // Calculate total liabilities
    const totalLiabilities = liabilities.reduce((sum, liab) => sum + (liab.amount || 0), 0);

    // Calculate net worth
    const netWorth = totalAssets - totalLiabilities;

    return {
      assets: {
        cash: totalCash,
        stocks: totalStocks,
        crypto: totalCrypto,
        mutualFunds: totalMF,
        gold: totalGold,
        silver: totalSilver,
        total: totalAssets,
      },
      liabilities: {
        total: totalLiabilities,
        breakdown: liabilities.map(liab => ({
          id: liab._id,
          type: liab.type,
          name: liab.name,
          amount: liab.amount,
          interestRate: liab.interestRate,
          dueDate: liab.dueDate,
        })),
      },
      netWorth: netWorth,
      cashBalances: cashBalances.map(cb => ({
        id: cb._id,
        accountName: cb.accountName,
        accountType: cb.accountType,
        balance: cb.balance,
      })),
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error calculating net worth:', error);
    // Return safe defaults on error
    return {
      assets: {
        cash: 0,
        stocks: 0,
        crypto: 0,
        mutualFunds: 0,
        gold: 0,
        silver: 0,
        total: 0,
      },
      liabilities: {
        total: 0,
        breakdown: [],
      },
      netWorth: 0,
      cashBalances: [],
      lastUpdated: new Date().toISOString(),
      error: 'Unable to calculate net worth',
    };
  }
};

