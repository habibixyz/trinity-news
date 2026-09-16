/**
 * TRINITY MARKETS - Complete 13-Page Full Routing Controller
 * Every news item, sector, tool, columnist, ticker, and bureau has its own dedicated page and slug.
 * Powered by: Alpha Vantage (stocks), CoinGecko (crypto), Gemini AI (editorial articles)
 */

import {
  CATEGORY_MAP,
  MARKET_DATA,
  BREAKING_NEWS,
  LIVE_WIRE,
  ARTICLES,
  EDITORIAL_OPINIONS,
  FINANCIAL_BUREAUS,
  findArticleBySlugOrId,
  findArticlesByCategorySlug,
  findTickerBySymbol,
  findPerspectiveBySlugOrId
} from './newsData.js';
import { MarketService } from './marketService.js';
import { NewsScraperService } from './newsScraperService.js';
import { GeminiArticleService } from './geminiArticleService.js';

class TrinityMarketsApp {
  constructor() {
    this.state = {
      theme: localStorage.getItem('trinity_theme') || 'dark',
      currentRoute: '',
      terminalCategory: 'All',
      terminalSearchQuery: '',
      savedBookmarks: JSON.parse(localStorage.getItem('trinity_bookmarks') || '[]'),
      activeArticle: null,
      fontSizeLevel: 1, // 0: standard, 1: comfortable, 2: large
      isSpeaking: false,
      speechUtterance: null,
      aiArticles: [],         // Gemini-generated Daily 10 articles
      aiArticlesLoading: true // Show loading state while Gemini generates
    };

    this.marketService = new MarketService((data, meta) => this.onMarketUpdate(data, meta));
    this.scraperService = new NewsScraperService((articles, meta) => this.onScraperUpdate(articles, meta));
    this.geminiService = new GeminiArticleService((articles, meta) => this.onGeminiArticlesReady(articles, meta));
    this.init();
  }

  init() {
    this.applyTheme(this.state.theme);
    this.renderDynamicDate();
    this.renderMarketTickerBar();
    this.updateBookmarkCount();
    this.setupEventListeners();
    this.marketService.start();
    this.scraperService.start();

    // Load cached AI articles immediately (shows in under 50ms if cached)
    // Then generate fresh ones if cache is expired
    this.loadGeminiArticles();

    // Initialize Router
    window.addEventListener('hashchange', () => this.handleRouting());
    window.addEventListener('load', () => this.handleRouting());
    this.handleRouting();
  }

  /**
   * Load Gemini-generated articles. Uses cached version if fresh (<6h old),
   * otherwise waits for market prices then generates fresh articles.
   */
  async loadGeminiArticles() {
    // First: serve from cache instantly if available
    const cached = this.geminiService.loadFromCache();
    if (cached) {
      this.state.aiArticles = cached;
      this.state.aiArticlesLoading = false;
      const cacheAge = this.geminiService.getCacheAge();
      console.log(`[TRINITY] ✅ Loaded ${cached.length} AI articles from cache (${cacheAge})`);
      if (!this.state.currentRoute || this.state.currentRoute === '/' || this.state.currentRoute === 'home') {
        this.renderHomeView();
      }
      return;
    }

    // No cache: wait a moment for market service to fetch real prices, then generate
    console.log('[TRINITY] 🔄 No cached articles — generating with Gemini AI after market data loads...');
    this.state.aiArticlesLoading = true;

    // Wait up to 8 seconds for market data to initialize before generating
    await new Promise(resolve => setTimeout(resolve, 8000));
    const liveData = this.marketService ? this.marketService.getMarkets() : MARKET_DATA;
    await this.geminiService.getOrGenerateArticles(liveData);
  }

  /* ==================== Unified Multi-Page Routing Engine ==================== */
  handleRouting() {
    const rawHash = window.location.hash || '#/';
    const hash = rawHash.replace(/^#\/?/, ''); // clean route
    this.state.currentRoute = hash;

    // Stop audio narration when changing pages
    this.stopAudioNarration();

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Update active nav indicators
    document.querySelectorAll('#categoryNavMenu .nav-link-btn').forEach(btn => {
      const routeAttr = btn.dataset.route;
      const isMatch = (routeAttr === 'home' && (!hash || hash === '/')) ||
                      (routeAttr && hash.startsWith(routeAttr));
      btn.classList.toggle('active', isMatch);
    });

    // 13 Full-Page Routes
    if (!hash || hash === '/' || hash === 'home') {
      this.showView('viewHome');
      this.renderHomeView();
      document.title = "TRINITY MARKETS | The Financial Intelligence Journal";
    } else if (hash.startsWith('article/')) {
      const slug = hash.replace('article/', '').split('?')[0];
      this.showView('viewArticle');
      this.renderArticleView(slug);
    } else if (hash.startsWith('category/')) {
      const catSlug = hash.replace('category/', '').split('?')[0];
      this.showView('viewCategory');
      this.renderCategoryView(catSlug);
    } else if (hash.startsWith('terminal')) {
      this.showView('viewTerminal');
      this.renderTerminalView();
      document.title = "Institutional Market Terminal | TRINITY MARKETS";
    } else if (hash.startsWith('ticker/')) {
      const symbol = hash.replace('ticker/', '').split('?')[0];
      this.showView('viewTicker');
      this.renderTickerView(symbol);
    } else if (hash.startsWith('wire')) {
      this.showView('viewWire');
      this.renderWireView();
      document.title = "Live Telemetry Radar Wire | TRINITY MARKETS";
    } else if (hash.startsWith('perspectives')) {
      this.showView('viewPerspectives');
      this.renderPerspectivesView();
      document.title = "Institutional Perspectives & Columnists | TRINITY MARKETS";
    } else if (hash.startsWith('perspective/')) {
      const id = hash.replace('perspective/', '').split('?')[0];
      this.showView('viewPerspectiveDetail');
      this.renderPerspectiveDetailView(id);
    } else if (hash.startsWith('briefing') || hash.startsWith('newsletter')) {
      this.showView('viewBriefing');
      this.renderBriefingView();
      document.title = "Daily Executive 10 Briefing | TRINITY MARKETS";
    } else if (hash.startsWith('bureaus')) {
      this.showView('viewBureaus');
      this.renderBureausView();
      document.title = "Global Financial Bureaus | TRINITY MARKETS";
    } else if (hash.startsWith('saved')) {
      this.showView('viewSaved');
      this.renderSavedView();
      document.title = "Saved Portfolio | TRINITY MARKETS";
    } else if (hash.startsWith('search')) {
      this.showView('viewSearch');
      const urlParams = new URLSearchParams(hash.split('?')[1] || '');
      const query = urlParams.get('q') || '';
      this.renderSearchView(query);
      document.title = "Intelligence Search Terminal | TRINITY MARKETS";
    } else if (hash.startsWith('settings')) {
      this.showView('viewSettings');
      this.renderSettingsView();
      document.title = "Journal Settings | TRINITY MARKETS";
    } else {
      this.showView('viewHome');
      this.renderHomeView();
    }
  }

  showView(viewId) {
    document.querySelectorAll('.app-page-view').forEach(v => {
      v.classList.toggle('hidden', v.id !== viewId);
    });
  }

  navigate(route) {
    window.location.hash = `#/${route.replace(/^\/?/, '')}`;
  }

  /* ==================== PAGE VIEW 1: Home Cover View ==================== */
  renderHomeView() {
    this.renderHeroAndWire();
    this.renderDaily10Cards();
    this.renderPerspectivesList();
  }

  renderHeroAndWire() {
    const heroSection = document.getElementById('heroSection');
    if (!heroSection) return;

    const allArticles = this.getAllArticles();
    const leadArticle = allArticles.find(a => a.isLead) || allArticles[0];
    const isSaved = this.state.savedBookmarks.includes(leadArticle.id);
    const slugLink = `#/article/${leadArticle.slug || leadArticle.id}`;

    const leadHtml = `
      <article class="lead-story-card">
        <a href="${slugLink}" class="lead-media-wrap">
          <img src="${leadArticle.image}" alt="${leadArticle.title}" loading="lazy">
          <div class="lead-category-pill">${leadArticle.category}</div>
        </a>
        <div class="lead-body">
          <div class="lead-meta">
            <span>📅 ${leadArticle.date}</span>
            <span>•</span>
            <span>⏱️ ${leadArticle.readTime}</span>
          </div>
          <h2 class="lead-headline">
            <a href="${slugLink}">${leadArticle.title}</a>
          </h2>
          <p class="lead-subtitle">${leadArticle.subtitle}</p>
          
          <div class="takeaways-box">
            <div class="takeaways-title">Executive Briefing & Key Takeaways</div>
            <ul class="takeaways-list">
              ${leadArticle.takeaways ? leadArticle.takeaways.map(t => `<li>${t}</li>`).join('') : `<li>Primary financial markets intelligence verified.</li>`}
            </ul>
          </div>

          <div class="card-footer">
            <div class="author-chip">
              <img src="${leadArticle.author.avatar}" alt="${leadArticle.author.name}">
              <div class="author-info">
                <div class="name">${leadArticle.author.name}</div>
                <div class="role">${leadArticle.author.role}</div>
              </div>
            </div>
            <div class="card-actions">
              <button class="action-btn ${isSaved ? 'bookmarked' : ''}" onclick="window.trinityApp.toggleBookmark('${leadArticle.id}', event)" title="Save Dispatch">
                🔖
              </button>
              <button class="action-btn" onclick="window.trinityApp.shareArticle('${leadArticle.id}', event)" title="Share Dispatch">
                🔗
              </button>
            </div>
          </div>
        </div>
      </article>
    `;

    const wireHtml = `
      <aside class="side-wire-column">
        <div class="wire-box">
          <div class="wire-header">
            <div class="wire-title-wrap">
              <span class="wire-title">Market Intelligence Radar</span>
            </div>
            <a href="#/wire" class="wire-refresh-btn">FULL WIRE ↗</a>
          </div>
          <div class="wire-stream">
            ${LIVE_WIRE.slice(0, 5).map(w => `
              <div class="wire-item" onclick="window.trinityApp.navigate('wire')">
                <div class="wire-item-meta">
                  <span>${w.time}</span>
                  <span class="wire-tag">${w.category}</span>
                </div>
                <div class="wire-item-headline">${w.headline}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </aside>
    `;

    heroSection.innerHTML = leadHtml + wireHtml;
  }

  renderDaily10Cards() {
    const container = document.getElementById('newsCardsGrid');
    if (!container) return;

    const items = this.getAllArticles().filter(a => !a.isLead).slice(0, 9);

    container.innerHTML = items.map(story => {
      const isSaved = this.state.savedBookmarks.includes(story.id);
      const slugLink = `#/article/${story.slug || story.id}`;

      return `
        <article class="story-card" data-article-id="${story.id}">
          <a href="${slugLink}" class="story-media">
            <img src="${story.image}" alt="${story.title}" loading="lazy">
            <div class="story-tags-overlay">
              <span class="story-category-tag">${story.category}</span>
            </div>
          </a>
          <div class="story-content">
            <div class="story-meta">
              <span class="story-source-name">${story.source || story.region}</span>
              <span>•</span>
              <span>${story.date}</span>
              <span>•</span>
              <span>${story.readTime}</span>
            </div>
            <h3 class="story-title">
              <a href="${slugLink}">${story.title}</a>
            </h3>
            <p class="story-excerpt">${story.subtitle}</p>
            <div class="story-footer">
              <div class="author-chip">
                <img src="${story.author.avatar}" alt="${story.author.name}">
                <div class="author-info">
                  <div class="name">${story.author.name}</div>
                  <div class="role">${story.author.role}</div>
                </div>
              </div>
              <div class="card-actions">
                <button class="action-btn ${isSaved ? 'bookmarked' : ''}" onclick="window.trinityApp.toggleBookmark('${story.id}', event)" title="Save Dispatch">
                  🔖
                </button>
                <button class="action-btn" onclick="window.trinityApp.shareArticle('${story.id}', event)" title="Share">
                  🔗
                </button>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  renderPerspectivesList() {
    const container = document.getElementById('foundingColumnsGrid');
    if (!container) return;

    container.innerHTML = EDITORIAL_OPINIONS.map(op => `
      <div class="columnist-card" onclick="window.trinityApp.navigate('perspective/${op.slug || op.id}')">
        <div class="columnist-head">
          <img src="${op.avatar}" alt="${op.author}">
          <div>
            <div class="columnist-name">${op.author}</div>
            <div class="columnist-role">${op.role}</div>
          </div>
        </div>
        <div class="columnist-quote-icon">“</div>
        <h3 class="columnist-title">${op.title}</h3>
        <p class="columnist-snippet">${op.snippet}</p>
      </div>
    `).join('');
  }

  /* ==================== PAGE VIEW 2: Dedicated Standalone Article Page ==================== */
  renderArticleView(slug) {
    const container = document.getElementById('standaloneArticleContainer');
    if (!container) return;

    const article = findArticleBySlugOrId(slug, this.scraperService ? this.scraperService.getArticles() : []);

    if (!article) {
      container.innerHTML = `
        <div style="text-align: center; padding: 4rem 1rem;">
          <h2 style="font-family: var(--font-display); font-size: 2rem; margin-bottom: 1rem;">Dispatch Not Found</h2>
          <p style="color: var(--text-secondary); margin-bottom: 2rem;">The requested financial dispatch could not be found or has expired.</p>
          <a href="#/" class="btn-scrape-now" style="display: inline-flex;">← Return to Daily 10 Cover</a>
        </div>
      `;
      return;
    }

    this.state.activeArticle = article;
    document.title = `${article.title} | TRINITY MARKETS`;

    const isSaved = this.state.savedBookmarks.includes(article.id);
    const catSlug = article.categorySlug || 'stocks-and-equities';
    const related = this.getAllArticles().filter(a => a.id !== article.id && (a.category === article.category || a.categorySlug === catSlug)).slice(0, 2);

    container.innerHTML = `
      <nav class="article-breadcrumb">
        <a href="#/">Cover</a>
        <span>/</span>
        <a href="#/category/${catSlug}">${article.category}</a>
        <span>/</span>
        <span>${article.slug || article.id}</span>
      </nav>

      <header class="standalone-article-header">
        <div class="reader-meta-pills">
          <a href="#/category/${catSlug}" class="reader-category-pill">${article.category}</a>
          ${article.channelTag ? `<span class="reader-category-pill" style="background: var(--bg-tertiary); color: var(--text-primary);">${article.channelTag} WIRE</span>` : ''}
        </div>

        <h1 class="standalone-headline">${article.title}</h1>
        <p class="standalone-subtitle">${article.subtitle}</p>

        <div class="standalone-toolbar">
          <div class="author-chip">
            <img src="${article.author.avatar}" alt="${article.author.name}">
            <div class="author-info">
              <div class="name">${article.author.name}</div>
              <div class="role">${article.author.role}</div>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
            <button class="reader-btn" id="standaloneAudioBtn" onclick="window.trinityApp.toggleAudioNarration()" title="Listen to narration">
              <span>🔊</span>
              <span id="standaloneAudioText">Listen</span>
            </button>
            <div class="reader-font-group">
              <button class="reader-btn reader-btn-font" onclick="window.trinityApp.adjustFontSize('dec')">A−</button>
              <button class="reader-btn reader-btn-font" onclick="window.trinityApp.adjustFontSize('inc')">A+</button>
            </div>
            <button class="reader-btn ${isSaved ? 'bookmarked' : ''}" onclick="window.trinityApp.toggleBookmark('${article.id}', event)" title="Save dispatch">
              🔖 <span>${isSaved ? 'Saved' : 'Save'}</span>
            </button>
            <button class="reader-btn" onclick="window.trinityApp.shareArticle('${article.id}', event)" title="Share link">
              🔗 <span>Share</span>
            </button>
          </div>
        </div>
      </header>

      <div class="standalone-hero-img">
        <img src="${article.image}" alt="${article.title}">
        ${article.caption ? `<div class="reader-caption">${article.caption}</div>` : ''}
      </div>

      <div class="reader-article-prose" id="readerProseContent">
        ${article.content}
      </div>

      ${article.takeaways ? `
        <div class="takeaways-box" style="margin-top: 3rem;">
          <div class="takeaways-title">Summary & Regulatory Mandate</div>
          <ul class="takeaways-list">
            ${article.takeaways.map(t => `<li>${t}</li>`).join('')}
          </ul>
        </div>
      ` : ''}

      <div style="margin-top: 4rem; padding-top: 2rem; border-top: 2px solid var(--text-primary);">
        <div class="section-head">
          <div>
            <h3 class="section-title" style="font-size: 1.3rem;">Related ${article.category} Dispatches</h3>
          </div>
          <a href="#/category/${catSlug}" class="btn-scrape-now">View All ${article.category} →</a>
        </div>

        <div class="news-cards-grid" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));">
          ${related.map(rel => `
            <article class="story-card">
              <a href="#/article/${rel.slug || rel.id}" class="story-media">
                <img src="${rel.image}" alt="${rel.title}" loading="lazy">
              </a>
              <div class="story-content">
                <div class="story-meta">
                  <span>${rel.date}</span> • <span>${rel.readTime}</span>
                </div>
                <h4 class="story-title" style="font-size: 1.1rem;">
                  <a href="#/article/${rel.slug || rel.id}">${rel.title}</a>
                </h4>
              </div>
            </article>
          `).join('')}
        </div>
      </div>
    `;

    this.applyFontScaling();
  }

  /* ==================== PAGE VIEW 3: Dedicated Category / Sector Hub Page ==================== */
  renderCategoryView(catSlug) {
    const container = document.getElementById('categoryPageContainer');
    if (!container) return;

    const catData = CATEGORY_MAP[catSlug] || {
      name: "Financial Sector",
      tagline: "Institutional market intelligence and capital allocation analysis.",
      icon: "📊",
      leadTicker: "Active Markets Terminal"
    };

    document.title = `${catData.name} | TRINITY MARKETS`;
    const articles = findArticlesByCategorySlug(catSlug, this.scraperService ? this.scraperService.getArticles() : []);

    container.innerHTML = `
      <div class="sector-hero-banner">
        <div class="sector-meta-badge">${catData.icon} SECTOR INTELLIGENCE HUB</div>
        <h1 class="sector-title">${catData.name}</h1>
        <p class="sector-tagline">${catData.tagline}</p>
        <div class="sector-ticker-pill">
          <span>● LIVE BENCHMARK:</span>
          <span>${catData.leadTicker}</span>
        </div>
      </div>

      <div class="section-head">
        <div>
          <h2 class="section-title">Sector Dispatches (${articles.length})</h2>
          <p class="section-subtitle">Deep Research & Verified Filings</p>
        </div>
        <a href="#/terminal" class="btn-scrape-now">Open Sector Tickers →</a>
      </div>

      <div class="news-cards-grid">
        ${articles.map(story => `
          <article class="story-card">
            <a href="#/article/${story.slug || story.id}" class="story-media">
              <img src="${story.image}" alt="${story.title}" loading="lazy">
              <div class="story-tags-overlay">
                <span class="story-category-tag">${story.category}</span>
              </div>
            </a>
            <div class="story-content">
              <div class="story-meta">
                <span>${story.date}</span> • <span>${story.readTime}</span>
              </div>
              <h3 class="story-title">
                <a href="#/article/${story.slug || story.id}">${story.title}</a>
              </h3>
              <p class="story-excerpt">${story.subtitle}</p>
              <div class="story-footer">
                <div class="author-chip">
                  <img src="${story.author.avatar}" alt="${story.author.name}">
                  <div class="author-info">
                    <div class="name">${story.author.name}</div>
                    <div class="role">${story.author.role}</div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        `).join('')}
      </div>
    `;
  }

  /* ==================== PAGE VIEW 4: Dedicated Market Terminal ==================== */
  renderTerminalView() {
    const grid = document.getElementById('terminalGrid');
    if (!grid) return;

    const rawData = this.marketService ? this.marketService.getMarkets() : MARKET_DATA;
    const cat = this.state.terminalCategory;
    const query = (this.state.terminalSearchQuery || '').toLowerCase().trim();

    const filtered = rawData.filter(item => {
      const matchCat = (cat === 'All' || item.category === cat);
      const matchQuery = !query || 
        item.symbol.toLowerCase().includes(query) || 
        (item.name && item.name.toLowerCase().includes(query)) ||
        item.category.toLowerCase().includes(query);
      return matchCat && matchQuery;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">No financial assets match query.</div>`;
      return;
    }

    grid.innerHTML = filtered.map(m => {
      const arrow = m.positive ? '▲' : '▼';
      const posClass = m.positive ? 'pos' : 'neg';

      return `
        <div class="market-card" onclick="window.trinityApp.navigate('ticker/${m.symbol}')">
          <div class="market-card-top">
            <div>
              <span class="market-badge-type">${m.category}</span>
              <div class="market-card-symbol">${m.symbol}</div>
              <div class="market-card-name">${m.name || m.symbol}</div>
            </div>
            <div style="font-family: var(--font-mono); font-size: 0.85rem; font-weight: 700;" class="${posClass}">
              ${arrow} ${m.change}
            </div>
          </div>

          <div class="market-card-price">${m.value}</div>

          <div class="market-card-metrics">
            <div>
              <span class="metric-lbl">24h High</span>
              <span class="metric-val">${m.high24h || '--'}</span>
            </div>
            <div>
              <span class="metric-lbl">24h Low</span>
              <span class="metric-val">${m.low24h || '--'}</span>
            </div>
            <div>
              <span class="metric-lbl">View Quote</span>
              <span class="metric-val" style="text-decoration: underline;">Page →</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /* ==================== PAGE VIEW 5: Dedicated Single Ticker Page ==================== */
  renderTickerView(symbol) {
    const container = document.getElementById('tickerPageContainer');
    if (!container) return;

    const ticker = findTickerBySymbol(symbol);
    document.title = `${ticker.symbol} Quote & Financial Telemetry | TRINITY MARKETS`;

    const arrow = ticker.positive ? '▲' : '▼';
    const posClass = ticker.positive ? 'pos' : 'neg';

    // Related sector news
    const relatedNews = this.getAllArticles().slice(0, 3);

    container.innerHTML = `
      <nav class="article-breadcrumb">
        <a href="#/">Cover</a>
        <span>/</span>
        <a href="#/terminal">Market Terminal</a>
        <span>/</span>
        <span>${ticker.symbol}</span>
      </nav>

      <div class="ticker-hero-box">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
          <div>
            <span class="market-badge-type" style="font-size: 0.75rem;">${ticker.category} • ${ticker.exchange || 'GLOBAL EXCHANGE'}</span>
            <h1 style="font-family: var(--font-mono); font-size: 2.75rem; font-weight: 900; margin: 0.25rem 0;">${ticker.symbol}</h1>
            <p style="color: var(--text-secondary); font-size: 1.1rem;">${ticker.name}</p>
          </div>
          <div style="text-align: right;">
            <div style="font-family: var(--font-mono); font-size: 1.25rem; font-weight: 800;" class="${posClass}">
              ${arrow} ${ticker.change} (${ticker.changeVal ? (ticker.changeVal > 0 ? `+${ticker.changeVal}` : ticker.changeVal) : ''})
            </div>
            <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono);">LAST SYNC: ${this.marketService ? this.marketService.getLastUpdatedTime() : 'LIVE'}</div>
          </div>
        </div>

        <div class="ticker-big-price-row">
          <div class="ticker-huge-val">${ticker.value}</div>
        </div>

        <p style="color: var(--text-secondary); max-width: 800px; line-height: 1.6; margin-bottom: 1rem;">
          ${ticker.description || 'Institutional real-time liquidity quote monitored continuously across global primary exchanges.'}
        </p>

        <div class="ticker-stat-grid">
          <div class="ticker-stat-item">
            <div class="ticker-stat-label">24h High Range</div>
            <div class="ticker-stat-number">${ticker.high24h || '--'}</div>
          </div>
          <div class="ticker-stat-item">
            <div class="ticker-stat-label">24h Low Range</div>
            <div class="ticker-stat-number">${ticker.low24h || '--'}</div>
          </div>
          <div class="ticker-stat-item">
            <div class="ticker-stat-label">Estimated Volume</div>
            <div class="ticker-stat-number">${ticker.volume || '$14.2B'}</div>
          </div>
          <div class="ticker-stat-item">
            <div class="ticker-stat-label">Market Capitalization</div>
            <div class="ticker-stat-number">${ticker.marketCap || 'Institutional Asset'}</div>
          </div>
        </div>
      </div>

      <div class="section-head">
        <div>
          <h2 class="section-title">Related Market Dispatches</h2>
          <p class="section-subtitle">Intelligence Relevant to ${ticker.symbol}</p>
        </div>
        <a href="#/terminal" class="btn-scrape-now">← Back to All Assets</a>
      </div>

      <div class="news-cards-grid">
        ${relatedNews.map(story => `
          <article class="story-card">
            <a href="#/article/${story.slug || story.id}" class="story-media">
              <img src="${story.image}" alt="${story.title}">
            </a>
            <div class="story-content">
              <h3 class="story-title">
                <a href="#/article/${story.slug || story.id}">${story.title}</a>
              </h3>
              <p class="story-excerpt">${story.subtitle}</p>
            </div>
          </article>
        `).join('')}
      </div>
    `;
  }

  /* ==================== PAGE VIEW 6: Dedicated Live Wire Page ==================== */
  renderWireView() {
    const container = document.getElementById('wirePageContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="section-head">
        <div>
          <h1 class="section-title">Live Telemetry Radar Wire</h1>
          <p class="section-subtitle">Real-Time Macro, Wall Street & Cryptographic Dispatches 24/7</p>
        </div>
        <button class="btn-scrape-now" onclick="window.trinityApp.scraperService.scrapeAllChannels(); window.trinityApp.showToast('✓ Wires Synchronized');">
          <span>🔄</span>
          <span>Sync Live Wires</span>
        </button>
      </div>

      <div style="margin-top: 2rem;">
        ${LIVE_WIRE.map(item => `
          <div class="wire-full-card">
            <div class="wire-full-card-meta">
              <span class="wire-tag">${item.category}</span>
              <span>•</span>
              <span>${item.region}</span>
              <span>•</span>
              <span>${item.time}</span>
            </div>
            <h2 style="font-family: var(--font-serif); font-size: 1.45rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.75rem;">
              ${item.headline}
            </h2>
            <p style="color: var(--text-secondary); line-height: 1.6; font-size: 0.95rem;">
              ${item.fullText || item.headline}
            </p>
            <div style="margin-top: 1rem;">
              <a href="#/category/${item.categorySlug || 'stocks-and-equities'}" class="btn-scrape-now" style="display: inline-flex; font-size: 0.72rem;">
                Explore ${item.category} Hub →
              </a>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /* ==================== PAGE VIEW 7: Dedicated Perspectives Hub ==================== */
  renderPerspectivesView() {
    const container = document.getElementById('perspectivesPageContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="section-head">
        <div>
          <h1 class="section-title">Institutional Perspectives & Essays</h1>
          <p class="section-subtitle">Deep Theses from Senior Correspondents and Financial Economists</p>
        </div>
      </div>

      <div class="columns-grid" style="grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); margin-top: 2rem;">
        ${EDITORIAL_OPINIONS.map(op => `
          <div class="columnist-card" onclick="window.trinityApp.navigate('perspective/${op.slug || op.id}')">
            <div class="columnist-head">
              <img src="${op.avatar}" alt="${op.author}">
              <div>
                <div class="columnist-name">${op.author}</div>
                <div class="columnist-role">${op.role}</div>
              </div>
            </div>
            <div class="columnist-quote-icon">“</div>
            <h3 class="columnist-title">${op.title}</h3>
            <p class="columnist-snippet">${op.snippet}</p>
            <div style="margin-top: 1.25rem; font-family: var(--font-mono); font-size: 0.75rem; text-decoration: underline;">
              Read Full Essay →
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /* ==================== PAGE VIEW 8: Dedicated Single Perspective Page ==================== */
  renderPerspectiveDetailView(slugOrId) {
    const container = document.getElementById('perspectiveDetailContainer');
    if (!container) return;

    const op = findPerspectiveBySlugOrId(slugOrId);
    document.title = `${op.title} | TRINITY MARKETS`;

    container.innerHTML = `
      <nav class="article-breadcrumb">
        <a href="#/">Cover</a>
        <span>/</span>
        <a href="#/perspectives">Perspectives</a>
        <span>/</span>
        <span>${op.author}</span>
      </nav>

      <div style="max-width: 840px; margin: 0 auto;">
        <header class="standalone-article-header">
          <div class="reader-meta-pills">
            <span class="reader-category-pill">INSTITUTIONAL ESSAY</span>
          </div>
          <h1 class="standalone-headline">${op.title}</h1>
          
          <div class="standalone-toolbar">
            <div class="author-chip">
              <img src="${op.avatar}" alt="${op.author}" style="width: 48px; height: 48px;">
              <div class="author-info">
                <div class="name" style="font-size: 1rem;">${op.author}</div>
                <div class="role">${op.role}</div>
              </div>
            </div>
            <a href="#/perspectives" class="btn-scrape-now">← All Columnists</a>
          </div>
        </header>

        <div class="reader-article-prose" style="font-size: 1.25rem;">
          ${op.thesis || `<p class="lead-para">${op.snippet}</p>`}
        </div>
      </div>
    `;
  }

  /* ==================== PAGE VIEW 9: Dedicated Morning Briefing Page ==================== */
  renderBriefingView() {
    const container = document.getElementById('briefingPageContainer');
    if (!container) return;

    const allArticles = this.getAllArticles().slice(0, 10);
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    container.innerHTML = `
      <div class="sector-hero-banner" style="text-align: center;">
        <div class="sector-meta-badge">DAILY 06:00 GMT EXECUTIVE INTELLIGENCE</div>
        <h1 class="sector-title">The Morning Markets Dispatch</h1>
        <p class="sector-tagline" style="margin: 0 auto 1.5rem;">${dateStr} • Curated 10 Core Financial Dispatches for Global Allocators</p>
      </div>

      <div class="section-head">
        <div>
          <h2 class="section-title">Today's 10 Briefing Items</h2>
          <p class="section-subtitle">Verified Institutional Summaries</p>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 1.5rem; margin-top: 2rem;">
        ${allArticles.map((art, idx) => `
          <div class="wire-full-card">
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.5rem;">
              <span class="wire-tag">DISPATCH #${idx + 1} • ${art.category}</span>
              <span style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--text-muted);">${art.readTime}</span>
            </div>
            <h3 style="font-family: var(--font-serif); font-size: 1.4rem; font-weight: 700; margin-bottom: 0.5rem;">
              <a href="#/article/${art.slug || art.id}">${art.title}</a>
            </h3>
            <p style="color: var(--text-secondary); line-height: 1.55; margin-bottom: 1rem;">
              ${art.subtitle}
            </p>
            <div style="display: flex; gap: 1rem; align-items: center;">
              <a href="#/article/${art.slug || art.id}" class="btn-scrape-now">Read Full Dispatch →</a>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /* ==================== PAGE VIEW 10: Dedicated Financial Bureaus Page ==================== */
  renderBureausView() {
    const container = document.getElementById('bureausPageContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="section-head">
        <div>
          <h1 class="section-title">Global Financial Bureaus</h1>
          <p class="section-subtitle">TRINITY Editorial Desks & Regulatory Telemetry Hubs</p>
        </div>
      </div>

      <div class="bureau-grid" style="margin-top: 2rem;">
        ${FINANCIAL_BUREAUS.map(b => `
          <div class="bureau-card">
            <div class="bureau-status-live">${b.status}</div>
            <h2 class="bureau-city-title">${b.city}</h2>
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem; font-weight: 600;">${b.desk}</p>
            <div style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.5rem;">
              📍 ${b.address}
            </div>
            <div style="font-family: var(--font-mono); font-size: 0.78rem; color: var(--text-primary); margin-bottom: 0.75rem;">
              👤 Bureau Chief: <strong>${b.lead}</strong>
            </div>
            <div style="font-size: 0.82rem; color: var(--text-secondary); border-top: 1px solid var(--border-subtle); padding-top: 0.75rem;">
              Key Coverage: ${b.focus}
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /* ==================== PAGE VIEW 11: Dedicated Saved Reading Portfolio ==================== */
  renderSavedView() {
    const grid = document.getElementById('savedCardsGrid');
    if (!grid) return;

    const allArticles = this.getAllArticles();
    const saved = allArticles.filter(a => this.state.savedBookmarks.includes(a.id));

    if (saved.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <div style="font-size: 2.5rem; margin-bottom: 1rem;">🔖</div>
          <h3 style="font-family: var(--font-display); font-size: 1.5rem; color: var(--text-primary); margin-bottom: 0.5rem;">Your Portfolio is Empty</h3>
          <p>Bookmark any article using the 🔖 button across the journal to save it for offline review.</p>
          <a href="#/" class="btn-scrape-now" style="display: inline-flex; margin-top: 1.5rem;">Explore The Daily 10 Cover →</a>
        </div>
      `;
      return;
    }

    grid.innerHTML = saved.map(story => `
      <article class="story-card">
        <a href="#/article/${story.slug || story.id}" class="story-media">
          <img src="${story.image}" alt="${story.title}" loading="lazy">
        </a>
        <div class="story-content">
          <div class="story-meta">
            <span>${story.date}</span> • <span>${story.readTime}</span>
          </div>
          <h3 class="story-title">
            <a href="#/article/${story.slug || story.id}">${story.title}</a>
          </h3>
          <p class="story-excerpt">${story.subtitle}</p>
          <div class="story-footer">
            <button class="action-btn bookmarked" onclick="window.trinityApp.toggleBookmark('${story.id}', event)" title="Remove from saved">
              🔖
            </button>
          </div>
        </div>
      </article>
    `).join('');
  }

  /* ==================== PAGE VIEW 12: Dedicated Search Terminal ==================== */
  renderSearchView(query = '') {
    const input = document.getElementById('searchPageInput');
    const grid = document.getElementById('searchPageCardsGrid');
    if (!grid) return;

    if (input) input.value = query;
    const cleanQuery = query.toLowerCase().trim();
    const allArticles = this.getAllArticles();

    if (!cleanQuery) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
          <p>Type keywords, ticker symbols (e.g. NVDA, BTC), sovereign funds, or asset classes above.</p>
        </div>
      `;
      return;
    }

    const matches = allArticles.filter(a => 
      a.title.toLowerCase().includes(cleanQuery) ||
      a.subtitle.toLowerCase().includes(cleanQuery) ||
      a.category.toLowerCase().includes(cleanQuery) ||
      (a.tags && a.tags.some(t => t.toLowerCase().includes(cleanQuery)))
    );

    if (matches.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
          <p>No financial dispatches matched "${query}".</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = matches.map(story => `
      <article class="story-card">
        <a href="#/article/${story.slug || story.id}" class="story-media">
          <img src="${story.image}" alt="${story.title}" loading="lazy">
        </a>
        <div class="story-content">
          <div class="story-meta">
            <span>${story.date}</span> • <span>${story.readTime}</span>
          </div>
          <h3 class="story-title">
            <a href="#/article/${story.slug || story.id}">${story.title}</a>
          </h3>
          <p class="story-excerpt">${story.subtitle}</p>
        </div>
      </article>
    `).join('');
  }

  /* ==================== PAGE VIEW 13: Dedicated Journal Settings Page ==================== */
  renderSettingsView() {
    const container = document.getElementById('settingsPageContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="section-head">
        <div>
          <h1 class="section-title">Journal Settings & Preferences</h1>
          <p class="section-subtitle">Customize Your Editorial Reading Experience & Financial Telemetry</p>
        </div>
      </div>

      <div class="settings-box" style="margin-top: 2rem;">
        <div class="settings-row">
          <div>
            <div style="font-weight: 700; color: var(--text-primary);">Editorial Theme Mode</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">Toggle between High-Contrast Dark and Monochrome Light Paper</div>
          </div>
          <button class="btn-scrape-now" onclick="window.trinityApp.toggleTheme()">
            <span>🌓</span>
            <span>${this.state.theme === 'dark' ? 'Light Paper' : 'Dark Mode'}</span>
          </button>
        </div>

        <div class="settings-row">
          <div>
            <div style="font-weight: 700; color: var(--text-primary);">Audio Narration Speed</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">Default reading pace for executive text-to-speech</div>
          </div>
          <span style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-primary);">0.95x Optimal</span>
        </div>

        <div class="settings-row">
          <div>
            <div style="font-weight: 700; color: var(--text-primary);">Market Telemetry Sync</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">Real-time exchange quote refresh frequency</div>
          </div>
          <span style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-primary);">60s Live Feed</span>
        </div>

        <div class="settings-row">
          <div>
            <div style="font-weight: 700; color: var(--text-primary);">Saved Portfolio Cache</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">${this.state.savedBookmarks.length} bookmarked dispatches in browser storage</div>
          </div>
          <button class="btn-scrape-now" onclick="localStorage.removeItem('trinity_bookmarks'); window.trinityApp.state.savedBookmarks = []; window.trinityApp.updateBookmarkCount(); window.trinityApp.renderSettingsView(); window.trinityApp.showToast('Saved Portfolio Cleared');">
            Clear Cache
          </button>
        </div>
      </div>
    `;
  }

  /* ==================== Theme & Market Telemetry ==================== */
  applyTheme(theme) {
    this.state.theme = theme;
    localStorage.setItem('trinity_theme', theme);
    document.body.className = `theme-${theme}`;
  }

  toggleTheme() {
    const newTheme = this.state.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
    this.showToast(`Switched to ${newTheme === 'dark' ? 'Dark Mode' : 'Light Paper Mode'}`);
    if (this.state.currentRoute === 'settings') {
      this.renderSettingsView();
    }
  }

  renderDynamicDate() {
    const dateEl = document.getElementById('currentDynamicDate');
    if (!dateEl) return;
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
  }

  onMarketUpdate(data, meta = {}) {
    this.renderMarketTickerBar(data);
    const timeTag = document.getElementById('marketsTimeTag');
    if (timeTag) {
      timeTag.textContent = meta.isSyncing ? 'SYNCING...' : `LIVE ${this.marketService.getLastUpdatedTime()}`;
    }
    if (this.state.currentRoute === 'terminal') {
      this.renderTerminalView();
    }
  }

  renderMarketTickerBar(customData = null) {
    const track = document.getElementById('marketsTrack');
    if (!track) return;
    const data = customData || (this.marketService ? this.marketService.getMarkets() : MARKET_DATA);

    const itemsHtml = data.map(m => {
      const arrow = m.positive ? '▲' : '▼';
      const posClass = m.positive ? 'pos' : 'neg';
      return `
        <a href="#/ticker/${m.symbol}" class="market-item" title="View ${m.name || m.symbol} dedicated quote page">
          <span class="market-category-tag">${m.category}</span>
          <span class="market-sym">${m.symbol}</span>
          <span class="market-val">${m.value}</span>
          <span class="market-chg ${posClass}">${arrow} ${m.change}</span>
        </a>
      `;
    }).join('');

    track.innerHTML = itemsHtml + itemsHtml;
  }

  onScraperUpdate(articles, meta = {}) {
    const btnText = document.getElementById('scrapeNowText');
    const scrapeBtn = document.getElementById('scrapeNowBtn');

    if (meta.isScraping) {
      if (btnText) btnText.textContent = 'Syncing Wires...';
      if (scrapeBtn) scrapeBtn.style.opacity = '0.6';
    } else {
      if (btnText) btnText.textContent = 'Sync Primary Feeds';
      if (scrapeBtn) scrapeBtn.style.opacity = '1';

      if (meta.newItemsCount && meta.newItemsCount > 0 && !meta.isBackground) {
        this.showToast(`✓ Synchronized ${meta.newItemsCount} live dispatches`);
      }
    }

    if (!this.state.currentRoute || this.state.currentRoute === 'home' || this.state.currentRoute === '/') {
      this.renderHomeView();
    }
  }

  /**
   * Called by GeminiArticleService when AI articles are ready.
   * Replaces static ARTICLES with freshly generated content.
   */
  onGeminiArticlesReady(articles, meta = {}) {
    if (!articles || articles.length === 0) return;
    this.state.aiArticles = articles;
    this.state.aiArticlesLoading = false;

    const source = meta.fromCache ? 'cache' : 'Gemini AI';
    console.log(`[TRINITY] ✅ ${articles.length} articles ready from ${source}`);

    if (!meta.fromCache) {
      this.showToast(`✓ ${articles.length} Fresh AI Dispatches Generated`);
    }

    // Re-render current page if on home or briefing
    const route = this.state.currentRoute;
    if (!route || route === '/' || route === 'home' || route === '') {
      this.renderHomeView();
    } else if (route === 'briefing') {
      this.renderBriefingView();
    }
  }

  /**
   * Force Gemini to regenerate all articles using latest market prices.
   * Triggered by the "Sync Primary Feeds" button.
   */
  async forceGeminiRegeneration() {
    const btnText = document.getElementById('scrapeNowText');
    const scrapeBtn = document.getElementById('scrapeNowBtn');

    if (btnText) btnText.textContent = 'Generating AI Dispatches...';
    if (scrapeBtn) scrapeBtn.style.opacity = '0.6';

    this.showToast('🤖 Generating 10 fresh dispatches via Gemini AI...');

    const liveData = this.marketService ? this.marketService.getMarkets() : MARKET_DATA;
    await this.geminiService.forceRegenerate(liveData);

    if (btnText) btnText.textContent = 'Sync Primary Feeds';
    if (scrapeBtn) scrapeBtn.style.opacity = '1';
  }

  getAllArticles() {
    // Priority order: 1) Gemini AI articles (real, current), 2) fallback static articles
    const aiArticles = this.state.aiArticles || [];
    const scraped = this.scraperService ? this.scraperService.getArticles() : [];

    if (aiArticles.length > 0) {
      // AI articles + scraped live wire items blended
      return [...aiArticles, ...scraped];
    }

    // Fallback to static articles while AI generates
    return [...ARTICLES, ...scraped];
  }

  /* ==================== Audio Narration & Tools ==================== */
  toggleAudioNarration() {
    if (this.state.isSpeaking) {
      this.stopAudioNarration();
    } else {
      this.startAudioNarration();
    }
  }

  startAudioNarration() {
    if (!this.state.activeArticle) return;
    if (!('speechSynthesis' in window)) {
      this.showToast('Speech narration not supported.');
      return;
    }

    window.speechSynthesis.cancel();
    const textToRead = `${this.state.activeArticle.title}. By ${this.state.activeArticle.author.name}. ${this.state.activeArticle.subtitle}`;
    this.state.speechUtterance = new SpeechSynthesisUtterance(textToRead);
    this.state.speechUtterance.rate = 0.95;

    this.state.speechUtterance.onend = () => this.stopAudioNarration();
    window.speechSynthesis.speak(this.state.speechUtterance);
    this.state.isSpeaking = true;

    const btn = document.getElementById('standaloneAudioBtn');
    if (btn) btn.style.background = 'var(--text-primary)';
    if (btn) btn.style.color = 'var(--text-inverse)';
    const text = document.getElementById('standaloneAudioText');
    if (text) text.textContent = 'Pause';
    this.showToast('Audio Narration Active 🔊');
  }

  stopAudioNarration() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.state.isSpeaking = false;
    const btn = document.getElementById('standaloneAudioBtn');
    if (btn) {
      btn.style.background = '';
      btn.style.color = '';
    }
    const text = document.getElementById('standaloneAudioText');
    if (text) text.textContent = 'Listen';
  }

  adjustFontSize(direction) {
    if (direction === 'inc') {
      this.state.fontSizeLevel = Math.min(2, this.state.fontSizeLevel + 1);
    } else {
      this.state.fontSizeLevel = Math.max(0, this.state.fontSizeLevel - 1);
    }
    this.applyFontScaling();
  }

  applyFontScaling() {
    const prose = document.getElementById('readerProseContent');
    if (!prose) return;
    const sizes = ['1.08rem', '1.24rem', '1.42rem'];
    const lineHeights = ['1.8', '1.85', '1.9'];
    prose.style.fontSize = sizes[this.state.fontSizeLevel];
    prose.style.lineHeight = lineHeights[this.state.fontSizeLevel];
  }

  /* ==================== Bookmarking & Sharing ==================== */
  toggleBookmark(articleId, event) {
    if (event) event.stopPropagation();

    const idx = this.state.savedBookmarks.indexOf(articleId);
    if (idx > -1) {
      this.state.savedBookmarks.splice(idx, 1);
      this.showToast('Dispatch removed from saved list');
    } else {
      this.state.savedBookmarks.push(articleId);
      this.showToast('Dispatch saved to portfolio 🔖');
    }

    localStorage.setItem('trinity_bookmarks', JSON.stringify(this.state.savedBookmarks));
    this.updateBookmarkCount();

    if (this.state.currentRoute === 'saved') {
      this.renderSavedView();
    } else if (!this.state.currentRoute || this.state.currentRoute === 'home') {
      this.renderHomeView();
    }
  }

  updateBookmarkCount() {
    const countEl = document.getElementById('bookmarkCountBadge');
    if (countEl) {
      countEl.textContent = this.state.savedBookmarks.length;
    }
  }

  shareArticle(articleId, event) {
    if (event) event.stopPropagation();
    const allArticles = this.getAllArticles();
    const article = allArticles.find(a => a.id === articleId);
    if (article) {
      const shareUrl = `${window.location.origin}${window.location.pathname}#/article/${article.slug || article.id}`;
      navigator.clipboard?.writeText(shareUrl);
      this.showToast(`URL Copied: ${shareUrl}`);
    }
  }

  showToast(text) {
    const toast = document.getElementById('toastMsg');
    const toastText = document.getElementById('toastText');
    if (!toast || !toastText) return;

    toastText.textContent = text;
    toast.classList.add('show');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3200);
  }

  /* ==================== Event Listeners ==================== */
  setupEventListeners() {
    // Theme Toggle in Header
    document.getElementById('themeToggleBtn')?.addEventListener('click', () => {
      this.toggleTheme();
    });

    // Sync Button → triggers Gemini AI regeneration with live market prices
    document.getElementById('scrapeNowBtn')?.addEventListener('click', async () => {
      await this.forceGeminiRegeneration();
      // Also sync RSS feeds in the background
      if (this.scraperService) {
        this.scraperService.scrapeAllChannels(true);
      }
    });

    // Terminal Refresh
    document.getElementById('refreshTerminalBtn')?.addEventListener('click', async () => {
      if (this.marketService) {
        await this.marketService.fetchLivePrices();
        this.renderTerminalView();
        this.showToast('✓ Terminal quotes synchronized');
      }
    });

    // Terminal Category Tabs
    document.querySelectorAll('#terminalCategoryTabs .market-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#terminalCategoryTabs .market-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.terminalCategory = btn.dataset.marketCat;
        this.renderTerminalView();
      });
    });

    // Terminal Search Input
    document.getElementById('terminalSearchInput')?.addEventListener('input', (e) => {
      this.state.terminalSearchQuery = e.target.value;
      this.renderTerminalView();
    });

    // Standalone Search Input
    document.getElementById('searchPageInput')?.addEventListener('input', (e) => {
      this.renderSearchView(e.target.value);
    });

    // Global Keybindings (⌘K -> Search Page)
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.navigate('search');
      }
    });
  }
}

// Instantiate globally
window.addEventListener('DOMContentLoaded', () => {
  window.trinityApp = new TrinityMarketsApp();
});
