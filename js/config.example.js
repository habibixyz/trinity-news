/**
 * TRINITY MARKETS — API Configuration Template
 * Copy this file to `js/config.js` and enter your credentials.
 */

export const CONFIG = {
  // Alpha Vantage — Real-time stock, forex, commodity prices
  // Free tier: 500 requests/day | https://www.alphavantage.co
  ALPHA_VANTAGE_KEY: 'YOUR_ALPHA_VANTAGE_KEY',

  // Google Gemini API — AI-generated daily financial article generation
  // https://aistudio.google.com/
  GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY',

  // CoinGecko — Crypto prices (no key required, 10k calls/month free)
  COINGECKO_BASE: 'https://api.coingecko.com/api/v3',

  // Alpha Vantage base URL
  ALPHA_VANTAGE_BASE: 'https://www.alphavantage.co/query',

  // Gemini API Base endpoint (gemini-3.6-flash default)
  GEMINI_API_BASE: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent',

  // Open Exchange Rates (free public /latest/USD endpoint)
  FOREX_BASE: 'https://open.er-api.com/v6/latest/USD',

  // Article generation cache validity (hours)
  ARTICLE_REFRESH_HOURS: 6,

  // How many Daily 10 articles to generate per batch
  DAILY_ARTICLES_COUNT: 10,
};
