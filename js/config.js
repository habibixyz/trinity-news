/**
 * TRINITY MARKETS — API Configuration
 * 100-Article Daily Pipeline Configuration
 * Production-safe: credentials read from localStorage or browser Settings page.
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
  ALPHA_VANTAGE_KEY: getStoredKey('trinity_alpha_vantage_key', 'demo'),

  // Google Gemini API — AI-generated daily financial article generation
  GEMINI_API_KEY: getStoredKey('trinity_gemini_api_key', ''),

  // CoinGecko — Crypto prices (no key required, free)
  COINGECKO_BASE: 'https://api.coingecko.com/api/v3',

  // Alpha Vantage base URL
  ALPHA_VANTAGE_BASE: 'https://www.alphavantage.co/query',

  // Gemini API Base endpoint
  GEMINI_API_BASE: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',

  // Open Exchange Rates (free public /latest/USD endpoint)
  FOREX_BASE: 'https://open.er-api.com/v6/latest/USD',

  // RSS-to-JSON API (free, handles CORS for browser RSS consumption)
  RSS2JSON_BASE: 'https://api.rss2json.com/v1/api.json',

  // Article generation cache validity — auto-expires at midnight daily
  ARTICLE_REFRESH_HOURS: 20,

  // How many total articles to generate per day
  DAILY_ARTICLES_COUNT: 100,

  // How many articles per section (10 sections x 10 = 100)
  ARTICLES_PER_SECTION: 10,

  // ============================================================
  // 10 EDITORIAL SECTIONS — Global Coverage, Finance-First
  // ============================================================
  EDITORIAL_SECTIONS: [
    {
      id: 'stocks-equities',
      name: 'Stocks & Equities',
      icon: '📈',
      categorySlug: 'stocks-and-equities',
      focus: 'S&P 500, NASDAQ, Dow Jones, FTSE, Nikkei, earnings reports, stock analysis, corporate results, market cap changes, sector rotation, analyst upgrades/downgrades',
      rssFeeds: [
        'https://search.cnbc.com/rs/search/combinedlist/view.xml?partnerId=wrss01&id=10000664',
        'https://feeds.content.dowjones.io/public/rss/mw_topstories'
      ]
    },
    {
      id: 'crypto-digital-assets',
      name: 'Crypto & Digital Assets',
      icon: '₿',
      categorySlug: 'crypto-and-digital-assets',
      focus: 'Bitcoin, Ethereum, Solana, altcoins, DeFi protocols, NFTs, crypto regulation, blockchain technology, institutional crypto adoption, Bitcoin ETF flows, stablecoin policy',
      rssFeeds: [
        'https://www.coindesk.com/arc/outboundfeeds/rss/',
        'https://cointelegraph.com/rss'
      ]
    },
    {
      id: 'global-macro',
      name: 'Global Macro & Policy',
      icon: '🌍',
      categorySlug: 'macro-and-banking',
      focus: 'Federal Reserve, ECB, Bank of England, interest rates, inflation CPI, GDP growth, monetary policy, treasury yields, US dollar index, global trade balances, recession risk',
      rssFeeds: [
        'https://feeds.content.dowjones.io/public/rss/mw_topstories',
        'https://search.cnbc.com/rs/search/combinedlist/view.xml?partnerId=wrss01&id=10000664'
      ]
    },
    {
      id: 'politics-markets',
      name: 'Politics & Markets',
      icon: '🏛️',
      categorySlug: 'policy-and-ratecuts',
      focus: 'Trump economic policy, White House executive orders affecting markets, tariffs, trade wars, congressional legislation on finance, election market impact, geopolitical risk premiums, NATO/G7 economic decisions',
      rssFeeds: [
        'https://search.cnbc.com/rs/search/combinedlist/view.xml?partnerId=wrss01&id=10000664',
        'https://feeds.content.dowjones.io/public/rss/mw_topstories'
      ]
    },
    {
      id: 'private-equity-vc',
      name: 'Private Equity & VC',
      icon: '🚀',
      categorySlug: 'private-equity-and-vc',
      focus: 'Venture capital funding rounds, PE acquisitions, M&A activity, startup valuations, IPO filings, SPAC activity, unicorn deals, LBO transactions, fund closings',
      rssFeeds: [
        'https://techcrunch.com/category/venture/feed/',
        'https://feeds.content.dowjones.io/public/rss/mw_topstories'
      ]
    },
    {
      id: 'banking-fintech',
      name: 'Banking & Fintech',
      icon: '🏦',
      categorySlug: 'macro-and-banking',
      focus: 'JPMorgan Chase, Goldman Sachs, Bank of America, Citigroup, CBDC developments, fintech disruption, payment systems, bank earnings, credit markets, Basel III regulations, digital banking',
      rssFeeds: [
        'https://search.cnbc.com/rs/search/combinedlist/view.xml?partnerId=wrss01&id=10000664',
        'https://feeds.content.dowjones.io/public/rss/mw_topstories'
      ]
    },
    {
      id: 'energy-commodities',
      name: 'Energy & Commodities',
      icon: '⚡',
      categorySlug: 'stocks-and-equities',
      focus: 'Brent crude oil, WTI, OPEC+ production decisions, natural gas prices, gold XAU, silver, copper, lithium, rare earth minerals, renewable energy investments, carbon credits, LNG trade',
      rssFeeds: [
        'https://feeds.content.dowjones.io/public/rss/mw_topstories',
        'https://search.cnbc.com/rs/search/combinedlist/view.xml?partnerId=wrss01&id=10000664'
      ]
    },
    {
      id: 'commercial-real-estate',
      name: 'Commercial Real Estate',
      icon: '🏢',
      categorySlug: 'commercial-real-estate',
      focus: 'REIT performance, office vacancy crisis, industrial real estate boom, data center demand, retail property market, housing affordability, commercial mortgage lending, property valuations',
      rssFeeds: [
        'https://feeds.content.dowjones.io/public/rss/mw_topstories',
        'https://search.cnbc.com/rs/search/combinedlist/view.xml?partnerId=wrss01&id=10000664'
      ]
    },
    {
      id: 'asia-pacific-markets',
      name: 'Asia-Pacific Markets',
      icon: '🌏',
      categorySlug: 'indian-markets',
      focus: 'Nikkei 225, Hang Seng, ASX 200, KOSPI, Shanghai Composite, India NIFTY50/SENSEX, Bank of Japan policy, PBOC stimulus, China economy, RBI rate decisions, yen weakness, yuan devaluation, semiconductor supply chains',
      rssFeeds: [
        'https://search.cnbc.com/rs/search/combinedlist/view.xml?partnerId=wrss01&id=10000664',
        'https://feeds.content.dowjones.io/public/rss/mw_topstories'
      ]
    },
    {
      id: 'etf-fund-flows',
      name: 'ETF & Fund Flows',
      icon: '📊',
      categorySlug: 'stocks-and-equities',
      focus: 'ETF inflows and outflows, hedge fund positioning, mutual fund performance, index rebalancing events, passive vs active investing, institutional 13F filings, Blackrock, Vanguard, State Street allocations',
      rssFeeds: [
        'https://feeds.content.dowjones.io/public/rss/mw_topstories',
        'https://search.cnbc.com/rs/search/combinedlist/view.xml?partnerId=wrss01&id=10000664'
      ]
    }
  ]
};
