import axios from 'axios';

/**
 * Search mutual funds by name
 * Uses mfapi.in search endpoint if available, otherwise searches through known funds
 */
export const searchMutualFunds = async (query) => {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }

    // List of popular Indian Mutual Funds with scheme codes
    // In production, you might want to maintain a database of all MFs
    const popularMFs = [
      { schemeCode: '120503', name: 'SBI Bluechip Fund', category: 'Large Cap', fundHouse: 'SBI Mutual Fund' },
      { schemeCode: '120465', name: 'HDFC Top 100 Fund', category: 'Large Cap', fundHouse: 'HDFC Mutual Fund' },
      { schemeCode: '120503', name: 'ICICI Prudential Bluechip Fund', category: 'Large Cap', fundHouse: 'ICICI Prudential' },
      { schemeCode: '120503', name: 'Axis Bluechip Fund', category: 'Large Cap', fundHouse: 'Axis Mutual Fund' },
      { schemeCode: '120503', name: 'Kotak Bluechip Fund', category: 'Large Cap', fundHouse: 'Kotak Mutual Fund' },
      { schemeCode: '120503', name: 'Mirae Asset Large Cap Fund', category: 'Large Cap', fundHouse: 'Mirae Asset' },
      { schemeCode: '120503', name: 'UTI Large Cap Fund', category: 'Large Cap', fundHouse: 'UTI Mutual Fund' },
      { schemeCode: '120503', name: 'Franklin India Bluechip Fund', category: 'Large Cap', fundHouse: 'Franklin Templeton' },
      { schemeCode: '120503', name: 'DSP Top 100 Equity Fund', category: 'Large Cap', fundHouse: 'DSP Mutual Fund' },
      { schemeCode: '120503', name: 'Aditya Birla Sun Life Frontline Equity Fund', category: 'Large Cap', fundHouse: 'Aditya Birla Sun Life' },
      { schemeCode: '120503', name: 'Nippon India Large Cap Fund', category: 'Large Cap', fundHouse: 'Nippon India' },
      { schemeCode: '120503', name: 'Tata Large Cap Fund', category: 'Large Cap', fundHouse: 'Tata Mutual Fund' },
      { schemeCode: '120503', name: 'Canara Robeco Bluechip Equity Fund', category: 'Large Cap', fundHouse: 'Canara Robeco' },
      { schemeCode: '120503', name: 'Invesco India Largecap Fund', category: 'Large Cap', fundHouse: 'Invesco' },
      { schemeCode: '120503', name: 'Sundaram Large Cap Fund', category: 'Large Cap', fundHouse: 'Sundaram Mutual Fund' },
    ];

    // Filter MFs by search query
    const searchLower = query.toLowerCase().trim();
    const matchingMFs = popularMFs.filter(mf => 
      mf.name.toLowerCase().includes(searchLower) ||
      mf.fundHouse.toLowerCase().includes(searchLower) ||
      mf.category.toLowerCase().includes(searchLower)
    );

    if (matchingMFs.length === 0) {
      return [];
    }

    // Fetch NAV data for matching funds
    const mfPromises = matchingMFs.slice(0, 10).map(async (mf) => {
      try {
        const response = await axios.get(`https://api.mfapi.in/mf/${mf.schemeCode}`, {
          timeout: 10000,
        });

        if (!response.data || !response.data.data || response.data.data.length === 0) {
          return null;
        }

        const navData = response.data.data;
        const latest = navData[0];
        const previous = navData[1] || latest;
        
        const nav = parseFloat(latest.nav);
        const previousNav = parseFloat(previous.nav);
        const change = nav - previousNav;
        const changePercent = previousNav > 0 ? (change / previousNav) * 100 : 0;

        // Get last 30 days for chart
        const chartData = navData.slice(0, 30).reverse().map(item => ({
          date: item.date,
          nav: parseFloat(item.nav),
        }));

        // Calculate returns
        const returns = calculateReturns(navData, nav);

        return {
          schemeCode: mf.schemeCode,
          name: mf.name,
          category: mf.category,
          fundHouse: mf.fundHouse,
          nav: nav,
          change: change,
          changePercent: changePercent,
          date: latest.date,
          chartData: chartData,
          returns: returns,
          schemeType: response.data.meta?.scheme_type || 'N/A',
          schemeCategory: response.data.meta?.scheme_category || mf.category,
          lastUpdated: new Date().toISOString(),
        };
      } catch (error) {
        console.error(`Error fetching MF ${mf.name}:`, error.message);
        return null;
      }
    });

    const results = await Promise.all(mfPromises);
    return results.filter(mf => mf !== null);
  } catch (error) {
    console.error('Error searching mutual funds:', error.message);
    return [];
  }
};

/**
 * Top Indian Mutual Funds with scheme codes
 * These are popular Indian MFs (scheme codes from mfapi.in)
 */
const TOP_INDIAN_MFS = [
  { schemeCode: '120503', name: 'SBI Bluechip Fund', category: 'Large Cap' },
  { schemeCode: '120465', name: 'HDFC Top 100 Fund', category: 'Large Cap' },
  { schemeCode: '120503', name: 'ICICI Prudential Bluechip Fund', category: 'Large Cap' },
  { schemeCode: '120503', name: 'Axis Bluechip Fund', category: 'Large Cap' },
  { schemeCode: '120503', name: 'Kotak Bluechip Fund', category: 'Large Cap' },
  { schemeCode: '120503', name: 'Mirae Asset Large Cap Fund', category: 'Large Cap' },
  { schemeCode: '120503', name: 'UTI Large Cap Fund', category: 'Large Cap' },
  { schemeCode: '120503', name: 'Franklin India Bluechip Fund', category: 'Large Cap' },
  { schemeCode: '120503', name: 'DSP Top 100 Equity Fund', category: 'Large Cap' },
  { schemeCode: '120503', name: 'Aditya Birla Sun Life Frontline Equity Fund', category: 'Large Cap' },
];

// Note: Scheme codes need to be verified from mfapi.in
// For now using placeholder codes - these should be updated with actual scheme codes

/**
 * Get top Indian Mutual Funds with NAV and historical data
 */
export const getTopIndianMFs = async () => {
  try {
    const mfPromises = TOP_INDIAN_MFS.map(async (mf) => {
      try {
        const response = await axios.get(`https://api.mfapi.in/mf/${mf.schemeCode}`, {
          timeout: 10000,
        });

        if (!response.data || !response.data.data || response.data.data.length === 0) {
          return null;
        }

        const navData = response.data.data;
        const latest = navData[0];
        const previous = navData[1] || latest;
        
        const nav = parseFloat(latest.nav);
        const previousNav = parseFloat(previous.nav);
        const change = nav - previousNav;
        const changePercent = previousNav > 0 ? (change / previousNav) * 100 : 0;

        // Get last 30 days for chart
        const chartData = navData.slice(0, 30).reverse().map(item => ({
          date: item.date,
          nav: parseFloat(item.nav),
        }));

        // Calculate 1M, 3M, 6M, 1Y returns if available
        const returns = calculateReturns(navData, nav);

        return {
          schemeCode: mf.schemeCode,
          name: mf.name,
          category: mf.category,
          nav: nav,
          change: change,
          changePercent: changePercent,
          date: latest.date,
          chartData: chartData,
          returns: returns,
          fundHouse: response.data.meta?.fund_house || 'N/A',
          schemeType: response.data.meta?.scheme_type || 'N/A',
          schemeCategory: response.data.meta?.scheme_category || mf.category,
          lastUpdated: new Date().toISOString(),
        };
      } catch (error) {
        console.error(`Error fetching MF ${mf.name}:`, error.message);
        return null;
      }
    });

    const results = await Promise.all(mfPromises);
    return results.filter(mf => mf !== null);
  } catch (error) {
    console.error('Error fetching top Indian MFs:', error.message);
    return [];
  }
};

/**
 * Calculate returns for different periods
 */
const calculateReturns = (navData, currentNav) => {
  const returns = {
    '1M': null,
    '3M': null,
    '6M': null,
    '1Y': null,
  };

  if (!navData || navData.length === 0) {
    return returns;
  }

  const now = new Date();
  
  // Find NAVs for different periods
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

  // Find closest NAV dates
  const findClosestNav = (targetDate) => {
    let closest = null;
    let minDiff = Infinity;
    
    for (const item of navData) {
      const itemDate = new Date(item.date);
      const diff = Math.abs(itemDate - targetDate);
      if (diff < minDiff) {
        minDiff = diff;
        closest = item;
      }
    }
    
    return closest ? parseFloat(closest.nav) : null;
  };

  const nav1M = findClosestNav(oneMonthAgo);
  const nav3M = findClosestNav(threeMonthsAgo);
  const nav6M = findClosestNav(sixMonthsAgo);
  const nav1Y = findClosestNav(oneYearAgo);

  if (nav1M) returns['1M'] = ((currentNav - nav1M) / nav1M) * 100;
  if (nav3M) returns['3M'] = ((currentNav - nav3M) / nav3M) * 100;
  if (nav6M) returns['6M'] = ((currentNav - nav6M) / nav6M) * 100;
  if (nav1Y) returns['1Y'] = ((currentNav - nav1Y) / nav1Y) * 100;

  return returns;
};

/**
 * Get MF fundamentals/details
 */
export const getMFFundamentals = async (schemeCode) => {
  try {
    const response = await axios.get(`https://api.mfapi.in/mf/${schemeCode}`, {
      timeout: 10000,
    });

    if (!response.data) {
      return null;
    }

    const navData = response.data.data || [];
    const latest = navData[0];
    const previous = navData[1] || latest;

    // Calculate various metrics
    const nav = parseFloat(latest.nav);
    const previousNav = parseFloat(previous.nav);
    const change = nav - previousNav;
    const changePercent = previousNav > 0 ? (change / previousNav) * 100 : 0;

    // Get historical data for chart (last 90 days)
    const chartData = navData.slice(0, 90).reverse().map(item => ({
      date: item.date,
      nav: parseFloat(item.nav),
    }));

    const returns = calculateReturns(navData, nav);

    return {
      schemeCode: schemeCode,
      name: response.data.meta?.scheme_name || 'N/A',
      fundHouse: response.data.meta?.fund_house || 'N/A',
      schemeType: response.data.meta?.scheme_type || 'N/A',
      schemeCategory: response.data.meta?.scheme_category || 'N/A',
      nav: nav,
      change: change,
      changePercent: changePercent,
      date: latest.date,
      chartData: chartData,
      returns: returns,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching MF fundamentals for ${schemeCode}:`, error.message);
    return null;
  }
};
