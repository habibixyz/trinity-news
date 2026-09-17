/**
 * TRINITY MARKETS — API Configuration
 * Production-safe configuration: Reads credentials securely from localStorage
 * or environment overrides so secrets are never pushed to git repositories.
 */

const getStoredKey = (storageKey, fallback = '') => {
  try {
    if (typeof localStorage !== 'undefined') {
      const val = localStorage.getItem(storageKey);
      if (val && val.trim().length > 0) return val.trim();
    }
  } catch {
    // Ignore storage errors
  }
  return fallback;
};

export const CONFIG = {
  // Alpha Vantage — Real-time stock, forex, commodity prices
  // Set in browser Settings or via localStorage.setItem('trinity_alpha_vantage_key', '...')
  ALPHA_VANTAGE_KEY: getStoredKey('trinity_alpha_vantage_key', 'demo'),

  // Google Gemini API — AI-generated daily financial article generation
  // Set in browser Settings or via localStorage.setItem('trinity_gemini_api_key', '...')
  GEMINI_API_KEY: getStoredKey('trinity_gemini_api_key', ''),

  // CoinGecko — Crypto prices (no key required, 10k calls/month free)
  COINGECKO_BASE: 'https://api.coingecko.com/api/v3',

  // Alpha Vantage base URL
  ALPHA_VANTAGE_BASE: 'https://www.alphavantage.co/query',

  // Gemini API Base endpoint (gemini-1.5-flash default)
  GEMINI_API_BASE: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',

  // Open Exchange Rates (free public /latest/USD endpoint)
  FOREX_BASE: 'https://open.er-api.com/v6/latest/USD',

  // Article generation cache validity (hours)
  ARTICLE_REFRESH_HOURS: 6,

  // How many Daily 10 articles to generate per batch
  DAILY_ARTICLES_COUNT: 10,
};
