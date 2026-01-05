import axios from 'axios';

/**
 * Get top cryptocurrencies with detailed data including fundamentals
 */
export const getTopCryptos = async (limit = 20) => {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: limit,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h,7d,30d',
      },
      timeout: 15000,
    });

    if (!response.data || response.data.length === 0) {
      return [];
    }

    // Fetch detailed data for each coin to get fundamentals
    const coinIds = response.data.map(coin => coin.id).join(',');
    const detailsResponse = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        ids: coinIds,
        order: 'market_cap_desc',
        sparkline: true,
        price_change_percentage: '24h,7d,30d',
      },
      timeout: 15000,
    });

    const coins = response.data.map(coin => {
      const detail = detailsResponse.data.find(d => d.id === coin.id);
      
      return {
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        image: coin.image,
        currentPrice: coin.current_price,
        marketCap: coin.market_cap,
        marketCapRank: coin.market_cap_rank,
        fullyDilutedValuation: coin.fully_diluted_valuation,
        totalVolume: coin.total_volume,
        high24h: coin.high_24h,
        low24h: coin.low_24h,
        priceChange24h: coin.price_change_24h,
        priceChangePercentage24h: coin.price_change_percentage_24h,
        priceChangePercentage7d: coin.price_change_percentage_7d_in_currency,
        priceChangePercentage30d: coin.price_change_percentage_30d_in_currency,
        circulatingSupply: coin.circulating_supply,
        totalSupply: coin.total_supply,
        maxSupply: coin.max_supply,
        ath: coin.ath, // All-time high
        athChangePercentage: coin.ath_change_percentage,
        athDate: coin.ath_date,
        atl: coin.atl, // All-time low
        atlChangePercentage: coin.atl_change_percentage,
        atlDate: coin.atl_date,
        sparkline: detail?.sparkline_in_7d?.price || [],
        lastUpdated: coin.last_updated,
      };
    });

    return coins;
  } catch (error) {
    console.error('Error fetching top cryptos:', error.message);
    return [];
  }
};

/**
 * Get crypto fundamentals by ID
 */
export const getCryptoFundamentals = async (coinId) => {
  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: true,
        developer_data: true,
        sparkline: true,
      },
      timeout: 15000,
    });

    if (!response.data) {
      return null;
    }

    const data = response.data;
    return {
      id: data.id,
      symbol: data.symbol.toUpperCase(),
      name: data.name,
      description: data.description?.en || '',
      marketCap: data.market_data?.market_cap?.usd || 0,
      fullyDilutedValuation: data.market_data?.fully_diluted_valuation?.usd || 0,
      totalVolume: data.market_data?.total_volume?.usd || 0,
      circulatingSupply: data.market_data?.circulating_supply || 0,
      totalSupply: data.market_data?.total_supply || 0,
      maxSupply: data.market_data?.max_supply || 0,
      currentPrice: data.market_data?.current_price?.usd || 0,
      priceChange24h: data.market_data?.price_change_24h || 0,
      priceChangePercentage24h: data.market_data?.price_change_percentage_24h || 0,
      high24h: data.market_data?.high_24h?.usd || 0,
      low24h: data.market_data?.low_24h?.usd || 0,
      ath: data.market_data?.ath?.usd || 0,
      athChangePercentage: data.market_data?.ath_change_percentage?.usd || 0,
      atl: data.market_data?.atl?.usd || 0,
      atlChangePercentage: data.market_data?.atl_change_percentage?.usd || 0,
      marketCapRank: data.market_cap_rank || 0,
      homepage: data.links?.homepage?.[0] || '',
      blockchainSite: data.links?.blockchain_site?.[0] || '',
      github: data.links?.repos_url?.github?.[0] || '',
      twitter: data.links?.twitter_screen_name || '',
      subreddit: data.links?.subreddit_url || '',
      lastUpdated: data.last_updated,
    };
  } catch (error) {
    console.error(`Error fetching crypto fundamentals for ${coinId}:`, error.message);
    return null;
  }
};

