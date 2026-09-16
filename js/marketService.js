/**
 * TRINITY MARKETS — Live Market Data Service
 * Sources: CoinGecko (crypto), Alpha Vantage (stocks/commodities/forex), Open Exchange Rates (FX)
 * Micro-tick simulation between real API refreshes for live exchange feel.
 */

import { MARKET_DATA } from './newsData.js';
import { CONFIG } from './config.js';

export class MarketService {
  constructor(onUpdateCallback) {
    this.data = JSON.parse(JSON.stringify(MARKET_DATA));
    this.onUpdate = onUpdateCallback;
    this.isFetching = false;
    this.lastUpdated = new Date();
    this.syncInterval = null;
    this.tickInterval = null;
    this.status = 'initializing';
    // Track Alpha Vantage calls (500/day limit — space them out)
    this.alphaVantageCallCount = parseInt(sessionStorage.getItem('av_calls') || '0');
    this.MAX_AV_CALLS_PER_SESSION = 60; // conservative per session
  }

  start() {
    // First fetch immediately on start
    this.fetchLivePrices();

    // Refresh real prices every 60 seconds (balance rate limits)
    this.syncInterval = setInterval(() => {
      this.fetchLivePrices();
    }, 60000);

    // Micro-tick every 3s for live trading feel between API refreshes
    this.tickInterval = setInterval(() => {
      this.simulateMicroTick();
    }, 3000);
  }

  stop() {
    if (this.syncInterval) clearInterval(this.syncInterval);
    if (this.tickInterval) clearInterval(this.tickInterval);
  }

  getMarkets() {
    return this.data;
  }

  getLastUpdatedTime() {
    return this.lastUpdated.toLocaleTimeString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
  }

  async fetchLivePrices() {
    if (this.isFetching) return;
    this.isFetching = true;
    this.status = 'syncing';

    if (this.onUpdate) this.onUpdate(this.data, { isSyncing: true, lastUpdated: this.lastUpdated });

    // Run all three sources in parallel — each gracefully degrades if it fails
    await Promise.allSettled([
      this.fetchCryptoFromCoinGecko(),
      this.fetchStocksFromAlphaVantage(),
      this.fetchForexFromOpenER()
    ]);

    this.lastUpdated = new Date();
    this.isFetching = false;
    this.status = 'live';

    if (this.onUpdate) {
      this.onUpdate(this.data, { isSyncing: false, lastUpdated: this.lastUpdated });
    }
  }

  /* ==================== SOURCE 1: CoinGecko Crypto (No Key Required) ==================== */
  async fetchCryptoFromCoinGecko() {
    try {
      const ids = 'bitcoin,ethereum,solana';
      const url = `${CONFIG.COINGECKO_BASE}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&price_change_percentage=24h&sparkline=false`;

      const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
      if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`);
      const coins = await res.json();

      // Mapping CoinGecko id → our MARKET_DATA symbol
      const geckoToSymbol = {
        bitcoin: 'BTC-USD',
        ethereum: 'ETH-USD',
        solana: 'SOL-USD'
      };

      coins.forEach(coin => {
        const sym = geckoToSymbol[coin.id];
        if (!sym) return;
        const target = this.data.find(m => m.symbol === sym);
        if (!target) return;

        const price = coin.current_price;
        const changePct = coin.price_change_percentage_24h || 0;
        const high = coin.high_24h;
        const low = coin.low_24h;
        const marketCap = coin.market_cap;
        const volume = coin.total_volume;

        target.direction = price >= target.rawPrice ? 'up' : 'down';
        target.rawPrice = price;
        target.value = this.formatPrice(price, true);
        target.change = `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%`;
        target.changeVal = coin.price_change_24h || 0;
        target.positive = changePct >= 0;
        target.high24h = this.formatPrice(high, true);
        target.low24h = this.formatPrice(low, true);
        target.marketCap = this.formatLargeNumber(marketCap);
        target.volume = this.formatLargeNumber(volume);
        target.lastTick = Date.now();
        target.dataSource = 'CoinGecko Live';
      });

      console.log('[TRINITY] ✅ CoinGecko crypto prices updated');
    } catch (e) {
      console.warn('[TRINITY] CoinGecko fetch failed, falling back to Binance:', e.message);
      // Fallback to Binance if CoinGecko fails
      await this.fetchCryptoFromBinanceFallback();
    }
  }

  async fetchCryptoFromBinanceFallback() {
    try {
      const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
      const url = `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(JSON.stringify(symbols))}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const json = await res.json();

      const map = { 'BTCUSDT': 'BTC-USD', 'ETHUSDT': 'ETH-USD', 'SOLUSDT': 'SOL-USD' };

      json.forEach(item => {
        const sym = map[item.symbol];
        if (!sym) return;
        const target = this.data.find(m => m.symbol === sym);
        if (!target) return;

        const price = parseFloat(item.lastPrice);
        const changePct = parseFloat(item.priceChangePercent);

        target.direction = price >= target.rawPrice ? 'up' : 'down';
        target.rawPrice = price;
        target.value = this.formatPrice(price, true);
        target.change = `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%`;
        target.positive = changePct >= 0;
        target.high24h = this.formatPrice(parseFloat(item.highPrice), true);
        target.low24h = this.formatPrice(parseFloat(item.lowPrice), true);
        target.lastTick = Date.now();
        target.dataSource = 'Binance Live';
      });

      console.log('[TRINITY] ✅ Binance fallback crypto prices updated');
    } catch (e) {
      console.warn('[TRINITY] Binance fallback also failed:', e.message);
    }
  }

  /* ==================== SOURCE 2: Alpha Vantage Stocks & Commodities ==================== */
  async fetchStocksFromAlphaVantage() {
    // Prioritized symbols — most important first given rate limits
    const stockSymbols = [
      { avSym: 'NVDA', trinSym: 'NVDA', prefix: '$' },
      { avSym: 'AAPL', trinSym: 'AAPL', prefix: '$' },
      { avSym: 'MSFT', trinSym: 'MSFT', prefix: '$' },
      { avSym: 'SPY', trinSym: 'SP500', prefix: '', isIndex: true },   // SPY as S&P 500 proxy
      { avSym: 'QQQ', trinSym: 'NASDAQ', prefix: '', isIndex: true },  // QQQ as NASDAQ proxy
      { avSym: 'VNQ', trinSym: 'VNQ', prefix: '$' },
      { avSym: 'PLD', trinSym: 'PLD', prefix: '$' },
      { avSym: 'EQIX', trinSym: 'EQIX', prefix: '$' },
    ];

    // Space out AV calls to respect rate limits (max ~5 req/min on free tier)
    for (let i = 0; i < stockSymbols.length; i++) {
      if (this.alphaVantageCallCount >= this.MAX_AV_CALLS_PER_SESSION) {
        console.warn('[TRINITY] Alpha Vantage session limit reached — using cached/simulated data');
        break;
      }

      const item = stockSymbols[i];
      await this.fetchSingleAlphaVantageQuote(item);

      // Wait 12 seconds between calls to respect 5 req/min free tier limit
      if (i < stockSymbols.length - 1) {
        await this.sleep(12000);
      }
    }

    // Fetch Gold and Oil via Alpha Vantage commodity endpoints
    await this.fetchCommoditiesAlphaVantage();
  }

  async fetchSingleAlphaVantageQuote({ avSym, trinSym, prefix, isIndex }) {
    try {
      const url = `${CONFIG.ALPHA_VANTAGE_BASE}?function=GLOBAL_QUOTE&symbol=${avSym}&apikey=${CONFIG.ALPHA_VANTAGE_KEY}`;
      const res = await fetch(url);
      if (!res.ok) return;
      const json = await res.json();

      this.alphaVantageCallCount++;
      sessionStorage.setItem('av_calls', this.alphaVantageCallCount.toString());

      const q = json['Global Quote'];
      if (!q || !q['05. price']) {
        console.warn(`[TRINITY] Alpha Vantage: no data for ${avSym}`, json);
        return;
      }

      const price = parseFloat(q['05. price']);
      const changePct = parseFloat(q['10. change percent']?.replace('%', '') || '0');
      const changeAmt = parseFloat(q['09. change'] || '0');
      const high = parseFloat(q['03. high'] || price);
      const low = parseFloat(q['04. low'] || price);
      const volume = q['06. volume'];

      const target = this.data.find(m => m.symbol === trinSym);
      if (!target) return;

      target.direction = price >= target.rawPrice ? 'up' : 'down';
      target.rawPrice = price;
      target.value = isIndex
        ? price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : `${prefix}${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      target.change = `${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%`;
      target.changeVal = changeAmt;
      target.positive = changePct >= 0;
      target.high24h = `${prefix}${high.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      target.low24h = `${prefix}${low.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      if (volume) target.volume = this.formatLargeNumber(parseInt(volume));
      target.lastTick = Date.now();
      target.dataSource = 'Alpha Vantage Live';

      console.log(`[TRINITY] ✅ Alpha Vantage ${avSym}: ${target.value} (${target.change})`);
    } catch (e) {
      console.warn(`[TRINITY] Alpha Vantage failed for ${avSym}:`, e.message);
    }
  }

  async fetchCommoditiesAlphaVantage() {
    // Gold via Alpha Vantage GLOBAL_QUOTE on XAU (uses forex endpoint)
    try {
      if (this.alphaVantageCallCount >= this.MAX_AV_CALLS_PER_SESSION) return;

      const goldUrl = `${CONFIG.ALPHA_VANTAGE_BASE}?function=CURRENCY_EXCHANGE_RATE&from_currency=XAU&to_currency=USD&apikey=${CONFIG.ALPHA_VANTAGE_KEY}`;
      const res = await fetch(goldUrl);
      if (res.ok) {
        const json = await res.json();
        this.alphaVantageCallCount++;
        sessionStorage.setItem('av_calls', this.alphaVantageCallCount.toString());

        const rate = json['Realtime Currency Exchange Rate'];
        if (rate && rate['5. Exchange Rate']) {
          const price = parseFloat(rate['5. Exchange Rate']);
          const target = this.data.find(m => m.symbol === 'GOLD');
          if (target) {
            target.direction = price >= target.rawPrice ? 'up' : 'down';
            target.rawPrice = price;
            target.value = `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            target.lastTick = Date.now();
            target.dataSource = 'Alpha Vantage Live';
            console.log(`[TRINITY] ✅ Gold (XAU): ${target.value}`);
          }
        }
      }
    } catch (e) {
      console.warn('[TRINITY] Gold fetch failed:', e.message);
    }
  }

  /* ==================== SOURCE 3: Open Exchange Rates (Forex) ==================== */
  async fetchForexFromOpenER() {
    try {
      const res = await fetch(CONFIG.FOREX_BASE);
      if (!res.ok) return;
      const json = await res.json();
      const rates = json.rates;
      if (!rates) return;

      const fxMap = [
        { trinSym: 'EUR-USD', price: rates.EUR ? 1 / rates.EUR : null, digits: 4 },
      ];

      fxMap.forEach(fx => {
        if (!fx.price) return;
        const target = this.data.find(m => m.symbol === fx.trinSym);
        if (!target) return;

        target.direction = fx.price >= target.rawPrice ? 'up' : 'down';
        target.rawPrice = fx.price;
        target.value = fx.price.toFixed(fx.digits);
        target.lastTick = Date.now();
        target.dataSource = 'Open Exchange Rates Live';
      });

      console.log('[TRINITY] ✅ Forex rates updated');
    } catch (e) {
      console.warn('[TRINITY] Forex fetch failed:', e.message);
    }
  }

  /* ==================== Micro-Tick Simulation (Between API Refreshes) ==================== */
  simulateMicroTick() {
    // Only tick 2 random assets per interval for performance
    for (let i = 0; i < 2; i++) {
      const idx = Math.floor(Math.random() * this.data.length);
      const item = this.data[idx];
      if (!item) continue;

      const deltaFactor = (Math.random() * 0.0006) - 0.0003;
      const oldPrice = item.rawPrice;
      const newPrice = Math.max(0.01, oldPrice * (1 + deltaFactor));

      item.rawPrice = newPrice;
      item.direction = newPrice >= oldPrice ? 'up' : 'down';
      item.lastTick = Date.now();

      // Format price based on category
      if (['Crypto'].includes(item.category)) {
        item.value = this.formatPrice(newPrice, true);
      } else if (item.category === 'Forex') {
        item.value = newPrice.toFixed(newPrice > 20 ? 2 : 4);
      } else if (['SP500', 'NASDAQ', 'DOW'].includes(item.symbol)) {
        item.value = newPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      } else {
        item.value = `$${newPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
    }

    if (this.onUpdate) {
      this.onUpdate(this.data, { isSyncing: false, isTick: true, lastUpdated: this.lastUpdated });
    }
  }

  /* ==================== Utility Helpers ==================== */
  formatPrice(price, isCrypto = false) {
    if (price >= 1000) {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (price >= 1) {
      return `$${price.toFixed(2)}`;
    }
    return `$${price.toFixed(4)}`;
  }

  formatLargeNumber(num) {
    if (!num || isNaN(num)) return 'N/A';
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
