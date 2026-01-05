# Free API Keys Setup Guide

This document explains how to get free API keys for the investment tracking feature.

## Required API Keys (Optional - Fallbacks Available)

The system works with **NO API keys** using free fallback APIs. However, adding API keys improves reliability and rate limits.

---

## 1. Alpha Vantage (Stocks) - OPTIONAL

**Status:** Optional (Yahoo Finance is used as free fallback)

**Why:** Better rate limits and more reliable data

**How to get:**
1. Visit: https://www.alphavantage.co/support/#api-key
2. Fill out the form (name, email, organization)
3. Get your free API key instantly
4. Free tier: 5 API calls per minute, 500 calls per day

**Add to `.env`:**
```
ALPHA_VANTAGE_API_KEY=your_key_here
```

**Priority:** Low (Yahoo Finance works without key)

---

## 2. Finnhub (Stocks) - OPTIONAL

**Status:** Optional (Additional fallback for stocks)

**Why:** Another reliable source for stock data

**How to get:**
1. Visit: https://finnhub.io/register
2. Sign up for free account
3. Get your API key from dashboard
4. Free tier: 60 API calls per minute

**Add to `.env`:**
```
FINNHUB_API_KEY=your_key_here
```

**Priority:** Low (Multiple free fallbacks available)

---

## Free APIs (No Key Required)

These APIs work without any API keys:

### ✅ CoinGecko (Crypto)
- **URL:** https://www.coingecko.com/en/api
- **Rate Limit:** 10-50 calls/minute (free tier)
- **Status:** Already integrated, no key needed

### ✅ Yahoo Finance (Stocks)
- **URL:** https://finance.yahoo.com
- **Rate Limit:** Reasonable limits, no key needed
- **Status:** Fallback for stocks, already integrated

### ✅ metals.live (Gold & Silver)
- **URL:** https://metals.live
- **Rate Limit:** Free tier available
- **Status:** Already integrated, no key needed

### ✅ mfapi.in (Mutual Funds)
- **URL:** https://www.mfapi.in
- **Rate Limit:** Free, no key needed
- **Status:** Already integrated, no key needed

---

## API Priority Order

### Stocks:
1. **Alpha Vantage** (if `ALPHA_VANTAGE_API_KEY` is set)
2. **Finnhub** (if `FINNHUB_API_KEY` is set)
3. **Yahoo Finance** (always available, no key needed) ✅

### Crypto:
1. **CoinGecko** (always available, no key needed) ✅

### Metals:
1. **metals.live** (always available, no key needed) ✅

### Mutual Funds:
1. **mfapi.in** (always available, no key needed) ✅

---

## Environment Variables

Add to your `backend/.env` file:

```env
# Optional - Stock APIs (fallbacks available)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here
FINNHUB_API_KEY=your_finnhub_key_here

# Other existing env variables...
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
# ... etc
```

---

## Testing Without API Keys

The system works **completely without API keys** using:
- Yahoo Finance for stocks (free, no key)
- CoinGecko for crypto (free, no key)
- metals.live for gold/silver (free, no key)
- mfapi.in for mutual funds (free, no key)

**You can start using the feature immediately without any API keys!**

---

## Rate Limits

### Without API Keys (Free APIs):
- **Yahoo Finance:** Reasonable limits, works well for personal use
- **CoinGecko:** 10-50 calls/minute
- **metals.live:** Free tier limits
- **mfapi.in:** Free tier limits

### With API Keys:
- **Alpha Vantage:** 5 calls/minute, 500/day
- **Finnhub:** 60 calls/minute

**Note:** The system includes intelligent caching (5-minute TTL) and request deduplication to minimize API calls.

---

## Troubleshooting

### "API key not configured" warning
- **Solution:** This is normal! The system will use free fallback APIs (Yahoo Finance)
- **Optional:** Add `ALPHA_VANTAGE_API_KEY` or `FINNHUB_API_KEY` to improve reliability

### Rate limit errors
- **Solution:** The system automatically uses cached data and fallback APIs
- **Prevention:** API keys provide better rate limits

### Price data unavailable
- **Check:** All APIs are down (rare)
- **Fallback:** System uses cached data or buy price as fallback
- **Solution:** Wait a few minutes and try again

---

## Summary

✅ **No API keys required** - System works with free APIs  
✅ **Optional keys improve reliability** - Add if you want better rate limits  
✅ **Automatic fallbacks** - System tries multiple APIs  
✅ **Intelligent caching** - Reduces API calls significantly  

**You can start using the investment tracking feature right away!**

