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
  RATE_CUT_TRACKER,
  UPCOMING_FINANCIAL_EVENTS,
  MARKET_PULSE_KPIS,
  ETF_FLOW_DATA,
  INSTITUTIONAL_RESEARCH_REPORTS,
  findArticleBySlugOrId,
  findArticlesByCategorySlug,
  findTickerBySymbol,
  findPerspectiveBySlugOrId
} from './newsData.js';
import { MarketService } from './marketService.js';
import { NewsScraperService } from './newsScraperService.js';
import { GeminiArticleService } from './geminiArticleService.js';
import { ChartService } from './chartService.js';
import { audioService } from './audioService.js';
import { aiCopilotService } from './aiCopilotService.js';
import { calendarService } from './calendarService.js';

class TrinityMarketsApp {
  constructor() {
    let savedTheme = 'dark';
    let savedBookmarks = [];
    try {
      if (typeof localStorage !== 'undefined') {
        savedTheme = localStorage.getItem('trinity_theme') || 'dark';
        savedBookmarks = JSON.parse(localStorage.getItem('trinity_bookmarks') || '[]');
      }
    } catch {}

    this.state = {
      theme: savedTheme,
      currentRoute: '',
      terminalCategory: 'All',
      terminalSearchQuery: '',
      savedBookmarks: savedBookmarks,
      activeArticle: null,
      fontSizeLevel: 1,
      isSpeaking: false,
      speechUtterance: null,
      aiArticles: [],
      aiArticlesLoading: true
    };

    this.marketService = new MarketService((data, meta) => this.onMarketUpdate(data, meta));
    this.scraperService = new NewsScraperService((articles, meta) => this.onScraperUpdate(articles, meta));
    this.geminiService = new GeminiArticleService(
      (articles, meta) => this.onGeminiArticlesReady(articles, meta),
      (sectionName, count, total) => this.onGeminiProgress(sectionName, count, total)
    );
    this.chartService = new ChartService();
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.init();
    }
  }

  init() {
    this.applyTheme(this.state.theme);
    this.renderDynamicDate();
    this.renderMarketTickerBar();
    this.updateBookmarkCount();
    this.setupEventListeners();

    // Kick off daily edition load immediately and retain promise for direct link resolvers
    this.articlesLoadPromise = this.loadGeminiArticles().catch(err => console.warn('[TRINITY AI]', err));

    // Initialize Router immediately so all tabs and navigation work
    window.addEventListener('hashchange', () => this.handleRouting());
    this.handleRouting();

    // Start background services asynchronously
    try {
      this.marketService.start();
      this.scraperService.start();
    } catch (e) {
      console.warn('[TRINITY] Service start note:', e);
    }

    // Register PWA Service Worker for offline intelligence
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').then(reg => {
        console.log('[TRINITY] Service Worker active with scope:', reg.scope);
      }).catch(err => {
        console.warn('[TRINITY] Service Worker registration note:', err.message);
      });
    }
  }

  /**
   * Re-renders whatever view the user is currently on (Home, Article, Category, Trending)
   * once the latest daily edition dispatches finish fetching.
   */
  reRenderCurrentRoute() {
    const route = this.state.currentRoute || '';
    if (route.startsWith('article/')) {
      const slug = route.replace('article/', '').split('?')[0];
      this.renderArticleView(slug);
    } else if (route.startsWith('category/')) {
      const cat = route.replace('category/', '').split('?')[0];
      this.renderCategoryView(cat);
    } else if (route === 'trending') {
      this.renderCategoryView('trending');
    } else if (route === 'briefing') {
      this.renderBriefingView();
    } else if (!route || route === '/' || route === 'home') {
      this.renderHomeView();
    }
  }

  /**
   * Load Gemini-generated articles. Uses date-keyed cache (today's edition)
   * or triggers fresh 100-article generation pipeline with progress UI.
   */
  async loadGeminiArticles() {
    // 1. First: load pre-generated static daily edition (zero AI API calls for visitors)
    try {
      const res = await fetch('./data/daily-edition.json?_t=' + Date.now());
      if (res.ok) {
        const edition = await res.json();
        if (Array.isArray(edition) && edition.length > 0) {
          this.state.aiArticles = edition;
          this.state.aiArticlesLoading = false;
          console.log(`[TRINITY] ✅ Loaded ${edition.length} published daily edition dispatches (0ms wait, 0 AI calls)`);
          this.updateArticleCountBadge(edition.length);

          // Ingest metadata if available
          try {
            const metaRes = await fetch('./data/daily-edition-meta.json?_t=' + Date.now());
            if (metaRes.ok) {
              const meta = await metaRes.json();
              this.state.lastEditionTimestamp = meta.generatedAt || null;
              if (meta.trendingCount) {
                console.log(`[TRINITY] 🔥 ${meta.trendingCount} trending high-velocity dispatches active`);
              }
            }
          } catch {}

          this.startAutonomousLiveWatcher();
          this.reRenderCurrentRoute();
          return;
        }
      }
    } catch (e) {
      console.log('[TRINITY] Notice: daily-edition.json fetch note, falling back to cache/library:', e.message);
    }

    // 2. Second: check browser local cache if previously generated
    const cached = this.geminiService.loadFromCache();
    if (cached && cached.length > 0) {
      this.state.aiArticles = cached;
      this.state.aiArticlesLoading = false;
      const cacheAge = this.geminiService.getCacheAge();
      console.log(`[TRINITY] ✅ Loaded ${cached.length} AI articles from today's cache (${cacheAge})`);
      this.updateArticleCountBadge(cached.length);
      this.startAutonomousLiveWatcher();
      this.reRenderCurrentRoute();
      return;
    }

    // 3. Fallback: serve institutional ARTICLES library instantly
    this.state.aiArticles = ARTICLES;
    this.state.aiArticlesLoading = false;
    this.updateArticleCountBadge(ARTICLES.length);
    this.startAutonomousLiveWatcher();
    this.reRenderCurrentRoute();
  }

  /**
   * Autonomous Background Watcher:
   * Periodically checks data/daily-edition-meta.json.
   * If a newly generated edition arrives (via GitHub Actions, daemon, or server cron),
   * it hot-reloads the articles and updates the UI seamlessly without a full page reload!
   */
  startAutonomousLiveWatcher() {
    if (this._editionWatcherInterval) return;
    this._editionWatcherInterval = setInterval(async () => {
      try {
        const metaRes = await fetch(`./data/daily-edition-meta.json?_t=${Date.now()}`);
        if (!metaRes.ok) return;
        const meta = await metaRes.json();
        if (meta.generatedAt && meta.generatedAt !== this.state.lastEditionTimestamp) {
          console.log('[TRINITY AUTONOMOUS] ⚡ Newer edition detected:', meta.generatedAt);
          const dataRes = await fetch(`./data/daily-edition.json?_t=${Date.now()}`);
          if (dataRes.ok) {
            const freshArticles = await dataRes.json();
            if (Array.isArray(freshArticles) && freshArticles.length > 0) {
              this.state.lastEditionTimestamp = meta.generatedAt;
              this.state.aiArticles = freshArticles;
              this.updateArticleCountBadge(freshArticles.length);
              this.showToast(`⚡ Synchronized ${freshArticles.length} fresh dispatches (${meta.trendingCount || 0} trending)`);
              if (!this.state.currentRoute || this.state.currentRoute === '/' || this.state.currentRoute === 'home') {
                this.renderHomeView();
              } else if (this.state.currentRoute === 'trending') {
                this.renderCategoryView('trending');
              }
            }
          }
        }
      } catch (err) {
        // Silent catch for background polling
      }
    }, 180000); // Check every 3 minutes
  }

  /**
   * Fired after each of the 10 sections completes generation.
   * Updates the progress bar and counter badge.
   */
  onGeminiProgress(sectionName, sectionCount, totalSoFar) {
    const sectionsCompleted = Math.ceil(totalSoFar / 10);
    this.showGenerationProgress(sectionsCompleted, 10, `${sectionName} (${totalSoFar} articles ready)`);
    this.updateArticleCountBadge(totalSoFar);
  }

  /**
   * Show/update the generation progress overlay (silent for regular users).
   */
  showGenerationProgress(completed, total, label) {
    const pct = Math.round((completed / total) * 100);
    console.log(`[TRINITY AI] Pipeline sync: ${pct}% (${completed}/${total} sections) — ${label}`);

    // Clean up any lingering overlay from previous versions
    const existing = document.getElementById('generationProgressOverlay');
    if (existing) existing.remove();

    // Only render visual popup if dev debug flag is explicitly enabled
    if (localStorage.getItem('trinity_dev_debug') === 'true') {
      let overlay = document.getElementById('generationProgressOverlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'generationProgressOverlay';
        overlay.className = 'gen-progress-overlay';
        document.body.appendChild(overlay);
      }
      overlay.innerHTML = `
        <div class="gen-progress-box">
          <div class="gen-progress-header">
            <span class="gen-progress-icon">⚡</span>
            <div>
              <div class="gen-progress-title">Syncing Editorial Pipeline</div>
              <div class="gen-progress-label">${label}</div>
            </div>
            <span class="gen-progress-pct">${pct}%</span>
          </div>
          <div class="gen-progress-bar-track">
            <div class="gen-progress-bar-fill" style="width: ${pct}%"></div>
          </div>
          <div class="gen-progress-sections">${completed}/${total} sections complete</div>
        </div>
      `;
      if (pct >= 100) {
        setTimeout(() => { overlay.remove(); }, 1800);
      }
    }
  }

  /**
   * Update the article count badge in the header.
   */
  updateArticleCountBadge(count) {
    const badge = document.getElementById('articleCountBadge');
    if (badge) badge.textContent = `${count} articles today`;
  }

  cleanProseContent(html) {
    if (!html) return '';
    return html
      .replace(/&lt;a[\s\S]*?&lt;\/a&gt;/gi, '')
      .replace(/<a[\s\S]*?<\/a>/gi, '')
      .replace(/&lt;a[^>]*&gt;/gi, '')
      .replace(/&lt;\/a&gt;/gi, '')
      .replace(/<a[^>]*>/gi, '')
      .replace(/<\/a>/gi, '')
      .replace(/https?:\/\/[^\s"'<>]+/gi, '')
      .replace(/target=["'][^"']*["']/gi, '')
      .replace(/href=["'][^"']*["']/gi, '')
      .replace(/<p>\s*<\/p>/gi, '')
      .trim();
  }

  /* ==================== Safe Author Extraction Helper ==================== */
  getSafeAuthor(author) {
    return {
      name: 'TRINITY Editorial Desk',
      role: (author && typeof author === 'object' && author.role && !author.role.includes('Correspondent') ? author.role : 'Institutional Financial Intelligence'),
      avatar: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=150&auto=format&fit=crop&q=80'
    };
  }

  /* ==================== Dynamic SEO & Schema Engine ==================== */
  updateSEO(options = {}) {
    const {
      title = 'TRINITY MARKETS | The Financial Intelligence Journal',
      description = 'TRINITY MARKETS delivers authoritative institutional analysis across Stocks, Commercial Real Estate, Crypto & Digital Assets, Private Equity, and Global Macro.',
      image = 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&auto=format&fit=crop&q=80',
      type = 'website',
      article = null
    } = options;

    document.title = title;

    const metaDesc = document.getElementById('meta-description');
    if (metaDesc) metaDesc.setAttribute('content', description);

    const canonical = document.getElementById('canonical-url');
    if (canonical) canonical.setAttribute('href', window.location.href);

    const ogTitle = document.getElementById('meta-og-title');
    if (ogTitle) ogTitle.setAttribute('content', title);

    const ogDesc = document.getElementById('meta-og-desc');
    if (ogDesc) ogDesc.setAttribute('content', description);

    const ogType = document.getElementById('meta-og-type');
    if (ogType) ogType.setAttribute('content', type);

    const ogUrl = document.getElementById('meta-og-url');
    if (ogUrl) ogUrl.setAttribute('content', window.location.href);

    const ogImg = document.getElementById('meta-og-image');
    if (ogImg) ogImg.setAttribute('content', image);

    const twTitle = document.getElementById('meta-tw-title');
    if (twTitle) twTitle.setAttribute('content', title);

    const twDesc = document.getElementById('meta-tw-desc');
    if (twDesc) twDesc.setAttribute('content', description);

    const twImg = document.getElementById('meta-tw-image');
    if (twImg) twImg.setAttribute('content', image);

    const jsonLdScript = document.getElementById('json-ld-schema');
    if (jsonLdScript) {
      if (article) {
        const schemaData = {
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          "headline": article.title,
          "description": article.subtitle || description,
          "image": [article.image || image],
          "datePublished": article.date || "2026-03-31",
          "author": {
            "@type": "Person",
            "name": typeof article.author === 'string' ? article.author : (article.author?.name || "Trinity Research Desk")
          },
          "publisher": {
            "@type": "Organization",
            "name": "TRINITY MARKETS",
            "logo": {
              "@type": "ImageObject",
              "url": "https://trinitymarkets.com/logo.png"
            }
          },
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": window.location.href
          }
        };
        jsonLdScript.textContent = JSON.stringify(schemaData, null, 2);
      } else {
        const schemaData = {
          "@context": "https://schema.org",
          "@type": "NewsMediaOrganization",
          "name": "TRINITY MARKETS",
          "url": "https://trinitymarkets.com",
          "description": description
        };
        jsonLdScript.textContent = JSON.stringify(schemaData, null, 2);
      }
    }
  }

  /* ==================== Unified Multi-Page Routing Engine ==================== */
  handleRouting() {
    try {
      const rawHash = window.location.hash || '#/';
      const hash = rawHash.replace(/^#\/?/, '').trim(); // clean route
      this.state.currentRoute = hash;

      // Stop audio narration when changing pages
      this.stopAudioNarration();

      // Clean up article reading progress bar listener
      if (this._cleanupProgressBar) { this._cleanupProgressBar(); this._cleanupProgressBar = null; }

      // Scroll to top
      window.scrollTo({ top: 0, behavior: 'instant' });


      // Update active nav indicators (sidebar links)
      document.querySelectorAll('#categoryNavMenu .sidebar-link, #categoryNavMenu .nav-link-btn').forEach(btn => {
        const routeAttr = btn.dataset.route || '';
        const isMatch = (routeAttr === 'home' && (!hash || hash === '/' || hash === 'home')) ||
                        (routeAttr && hash === routeAttr) ||
                        (routeAttr && hash.startsWith(routeAttr));
        btn.classList.toggle('active', isMatch);
      });

      // 13 Full-Page Routes
      if (!hash || hash === '/' || hash === 'home') {
        this.showView('viewHome');
        this.renderHomeView();
        this.updateSEO({
          title: "TRINITY MARKETS | The Financial Intelligence Journal",
          description: "TRINITY MARKETS delivers authoritative institutional analysis across Stocks, Commercial Real Estate, Crypto & Digital Assets, Private Equity, and Global Macro."
        });
      } else if (hash.startsWith('article/')) {
        const slug = hash.replace('article/', '').split('?')[0];
        this.showView('viewArticle');
        this.renderArticleView(slug);
      } else if (hash.startsWith('category/')) {
        const catSlug = hash.replace('category/', '').split('?')[0];
        this.showView('viewCategory');
        this.renderCategoryView(catSlug);
      } else if (hash === 'trending' || hash.startsWith('trending')) {
        this.showView('viewCategory');
        this.renderCategoryView('trending');
        this.updateSEO({
          title: "Trending Market Movers & High-Velocity Telemetry | TRINITY MARKETS",
          description: "Real-time trending market dispatches, volume anomalies, volatility breakouts, and high-beta catalysts."
        });
      } else if (hash === 'data' || hash.startsWith('data')) {
        this.showView('viewData');
        this.renderDataDashboardView();
        this.updateSEO({
          title: "Institutional Data & ETF Dashboard | TRINITY MARKETS",
          description: "Real-time macroeconomic telemetry, sector heatmaps, ETF flows, and rate decision analytics."
        });
      } else if (hash === 'research' || hash.startsWith('research')) {
        this.showView('viewResearch');
        this.renderResearchView();
        this.updateSEO({
          title: "Institutional Research & Intelligence Reports | TRINITY MARKETS",
          description: "Deep research papers, institutional filings, and macro financial models."
        });
      } else if (hash === 'live' || hash.startsWith('live')) {
        this.showView('viewLive');
        this.renderLiveStudioView();
        this.updateSEO({
          title: "24/7 AI Audio Broadcast Studio | TRINITY MARKETS",
          description: "Live financial broadcast stream with AI audio anchor, lower-third telemetry, and breaking market dispatches."
        });
      } else if (hash === 'calendar' || hash.startsWith('calendar')) {
        this.showView('viewCalendar');
        this.renderCalendarView();
        this.updateSEO({
          title: "Macro Economic Calendar & Earnings Matrix | TRINITY MARKETS",
          description: "Central Bank rate decisions, CPI releases, jobs reports, and quarterly earnings beat/miss track records."
        });
      } else if (hash.startsWith('terminal')) {
        this.showView('viewTerminal');
        this.renderTerminalView();
        this.updateSEO({
          title: "Institutional Market Terminal | TRINITY MARKETS",
          description: "Interactive market telemetry terminal for financial analysts, wealth managers, and institutional funds."
        });
      } else if (hash.startsWith('ticker/')) {
        const symbol = hash.replace('ticker/', '').split('?')[0];
        this.showView('viewTicker');
        this.renderTickerView(symbol);
      } else if (hash.startsWith('wire')) {
        this.showView('viewWire');
        this.renderWireView();
        this.updateSEO({
          title: "Live Telemetry Radar Wire | TRINITY MARKETS",
          description: "Breaking financial radar wire updating live with global rate cuts, M&A filings, and market telemetry."
        });
      } else if (hash === 'perspectives' || hash.startsWith('perspectives')) {
        this.showView('viewPerspectives');
        this.renderPerspectivesView();
        this.updateSEO({
          title: "Institutional Perspectives & Columnists | TRINITY MARKETS",
          description: "Exclusive opinion columns and strategic macro breakdowns from chief economists and quantitative analysts."
        });
      } else if (hash.startsWith('perspective/')) {
        const id = hash.replace('perspective/', '').split('?')[0];
        this.showView('viewPerspectiveDetail');
        this.renderPerspectiveDetailView(id);
      } else if (hash.startsWith('briefing') || hash.startsWith('newsletter')) {
        this.showView('viewBriefing');
        this.renderBriefingView();
        this.updateSEO({
          title: "Daily Executive 10 Briefing | TRINITY MARKETS",
          description: "Curated daily executive 10 briefing summarizing market movers, rate decisions, and capital flows."
        });
      } else if (hash.startsWith('bureaus')) {
        this.showView('viewBureaus');
        this.renderBureausView();
        this.updateSEO({
          title: "Global Financial Bureaus | TRINITY MARKETS",
          description: "Global dispatch hubs across New York, London, Tokyo, Mumbai, and Singapore."
        });
      } else if (hash.startsWith('saved')) {
        this.showView('viewSaved');
        this.renderSavedView();
        this.updateSEO({
          title: "Saved Portfolio | TRINITY MARKETS",
          description: "Your saved institutional intelligence reports and bookmarks."
        });
      } else if (hash.startsWith('search')) {
        this.showView('viewSearch');
        const urlParams = new URLSearchParams(hash.split('?')[1] || '');
        const query = urlParams.get('q') || '';
        this.renderSearchView(query);
        this.updateSEO({
          title: "Intelligence Search Terminal | TRINITY MARKETS",
          description: "Search institutional dispatches, filing disclosures, and market research."
        });
      } else if (hash.startsWith('settings')) {
        this.showView('viewSettings');
        this.renderSettingsView();
        this.updateSEO({
          title: "Journal Settings | TRINITY MARKETS",
          description: "Customize reader telemetry, theme preferences, and data feed settings."
        });
      } else {
        this.showView('viewHome');
        this.renderHomeView();
        this.updateSEO({
          title: "TRINITY MARKETS | The Financial Intelligence Journal",
          description: "TRINITY MARKETS delivers authoritative institutional analysis across Stocks, Commercial Real Estate, Crypto & Digital Assets, Private Equity, and Global Macro."
        });
      }
    } catch (err) {
      console.error('[TRINITY ROUTER ERROR]', err);
    }
  }

  showView(viewId) {
    document.querySelectorAll('.app-page-view').forEach(v => {
      v.classList.toggle('hidden', v.id !== viewId);
    });
  }

  navigate(route) {
    const cleanRoute = (route || '').replace(/^#\/?/, '').trim();
    const targetHash = `#/${cleanRoute}`;
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    } else {
      this.handleRouting();
    }
  }

  /* ==================== PAGE VIEW 1: Home Cover View ==================== */
  renderHomeView() {
    this.renderMarketPulseBarometer();
    this.renderHeroAndWire();
    this.renderTrendingFilterBar();
    this.renderDaily10Cards();
    this.renderMacroRadar();
    this.renderPerspectivesList();
  }

  renderMarketPulseBarometer() {
    const container = document.getElementById('marketPulseBarometer');
    if (!container) return;

    container.innerHTML = `
      <div class="market-pulse-grid">
        ${MARKET_PULSE_KPIS.map(kpi => `
          <div class="pulse-kpi-card" onclick="window.trinityApp.navigate('data')">
            <div class="pulse-kpi-top">
              <span class="pulse-kpi-label">${kpi.icon || ''} ${kpi.label}</span>
              ${kpi.change ? `<span class="pulse-kpi-change ${kpi.positive ? 'pos' : 'neg'}">${kpi.positive ? '▲' : '▼'} ${kpi.change}</span>` : ''}
            </div>
            <div class="pulse-kpi-value">${kpi.value}</div>
            <div class="pulse-kpi-subtext">${kpi.subtext || kpi.sublabel || ''}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  renderMacroRadar() {
    const container = document.getElementById('macroEventsRadarContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="macro-radar-wrapper">
        <div class="rate-cut-cards-grid">
          ${RATE_CUT_TRACKER.map(cb => {
            const probNum = parseInt(cb.cutProbability25bps) || 50;
            return `
              <div class="rate-cut-card">
                <div class="rate-cut-header">
                  <div>
                    <div class="cb-name">${cb.centralBank}</div>
                    <span class="cb-stance-pill">${cb.policyStance}</span>
                  </div>
                  <div class="cb-rate-huge">${cb.currentRate}</div>
                </div>

                <div class="cb-prob-bar-wrap">
                  <div class="cb-prob-label">
                    <span>Rate Cut Probability (25 bps)</span>
                    <span style="font-weight: 800; color: var(--text-primary);">${cb.cutProbability25bps}</span>
                  </div>
                  <div class="cb-prob-bar-bg">
                    <div class="cb-prob-bar-fill" style="width: ${probNum}%;"></div>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-family: var(--font-mono); font-size: 0.72rem; padding: 0.4rem 0; border-top: 1px solid var(--border-subtle);">
                  <div><span style="color: var(--text-muted);">Inflation:</span> <span style="font-weight: 700; color: var(--text-primary);">${cb.inflationRate.split(' ')[0]}</span></div>
                  <div><span style="color: var(--text-muted);">Real GDP:</span> <span style="font-weight: 700; color: var(--text-primary);">${cb.growthOutlook}</span></div>
                </div>

                <p class="cb-context">${cb.context}</p>
              </div>
            `;
          }).join('')}
        </div>

        <div class="events-ledger-card">
          <div class="events-ledger-header">
            <div class="events-ledger-title">Upcoming Macro Financial Events & Rate Decision Calendar</div>
            <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-muted);">LIVE COUNTDOWN & CONSENSUS</span>
          </div>
          <div class="events-ledger-list">
            ${UPCOMING_FINANCIAL_EVENTS.map(evt => `
              <div class="event-row">
                <div class="event-date-col">
                  <div class="event-date-primary">${evt.date}</div>
                  <div class="event-date-time">${evt.time} • ${evt.region}</div>
                </div>
                <div class="event-name-col">
                  <div class="event-name-title">${evt.event}</div>
                  <div class="event-name-desc">${evt.details}</div>
                </div>
                <div class="event-consensus-col">
                  <span class="event-consensus-lbl">Market Consensus:</span>
                  <span class="event-consensus-val">${evt.consensus}</span>
                </div>
                <div>
                  <span class="impact-badge ${evt.impact.toLowerCase()}">${evt.impact}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
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
              <img src="${this.getSafeAuthor(leadArticle.author).avatar}" alt="${this.getSafeAuthor(leadArticle.author).name}">
              <div class="author-info">
                <div class="name">${this.getSafeAuthor(leadArticle.author).name}</div>
                <div class="role">${this.getSafeAuthor(leadArticle.author).role}</div>
              </div>
            </div>
            <div class="card-actions">
              <button class="action-btn ${isSaved ? 'bookmarked' : ''}" onclick="window.trinityApp.toggleBookmark('${leadArticle.id}', event)" title="Save Dispatch">
                ${isSaved ? 'Saved' : 'Save'}
              </button>
              <button class="action-btn" onclick="window.trinityApp.shareArticle('${leadArticle.id}', event)" title="Share Dispatch">
                Share
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

  renderTrendingFilterBar() {
    const container = document.getElementById('trendingFilterBar');
    if (!container) return;

    const all = this.getAllArticles();
    const trendingCount = all.filter(a => a.isTrending || a.categorySlug === 'trending').length;

    const filterOptions = [
      { id: 'all', label: `All Dispatches (${all.length})` },
      { id: 'trending', label: `🔥 Trending Now (${trendingCount})`, isTrending: true },
      { id: 'ai-and-frontier-tech', label: 'AI & Frontier Tech' },
      { id: 'stocks-and-equities', label: 'Stocks & Equities' },
      { id: 'macro-and-banking', label: 'Macro & Banking' },
      { id: 'indian-markets', label: 'Indian Markets & Dalal St' },
      { id: 'crypto-and-digital-assets', label: 'Crypto & Digital' },
      { id: 'energy-and-commodities', label: 'Energy & Commodities' },
      { id: 'global-trade', label: 'Global Trade & Policy' },
      { id: 'banking-and-fintech', label: 'Banking & Fintech' },
      { id: 'private-equity-and-vc', label: 'PE & VC' },
      { id: 'commercial-real-estate', label: 'Real Estate' }
    ];

    const currentFilter = this.state.homeCategoryFilter || 'all';

    container.innerHTML = filterOptions.map(opt => `
      <button class="trending-pill-btn ${opt.isTrending ? 'pill-trending' : ''} ${currentFilter === opt.id ? 'active' : ''}" onclick="window.trinityApp.filterHomeArticles('${opt.id}')">
        ${opt.label}
      </button>
    `).join('');
  }

  filterHomeArticles(filterId) {
    this.state.homeCategoryFilter = filterId;
    this.renderTrendingFilterBar();
    this.renderDaily10Cards(filterId);
  }

  renderDaily10Cards(filterCategory = null) {
    const container = document.getElementById('newsCardsGrid');
    if (!container) return;

    const activeFilter = filterCategory || this.state.homeCategoryFilter || 'all';
    const all = this.getAllArticles();
    // Prioritize full-length editorial dispatches (exclude short 3-line live wire snippets from magazine cover)
    const longForm = all.filter(a => !a.isLead && !a.isLiveScraped);
    let items = longForm.length > 0 ? longForm : all.filter(a => !a.isLead);

    if (activeFilter === 'trending') {
      items = items.filter(a => a.isTrending || a.categorySlug === 'trending' || (a.tags && a.tags.some(t => t.toLowerCase().includes('trending'))));
    } else if (activeFilter !== 'all') {
      items = items.filter(a => a.categorySlug === activeFilter || (a.category && a.category.toLowerCase().includes(activeFilter.replace(/-/g, ' '))));
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem; color: var(--text-muted); font-family: var(--font-mono); font-size: 0.88rem;">
          No dispatches found in this category for today's edition.
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(story => {
      const isSaved = this.state.savedBookmarks.includes(story.id);
      const slugLink = `#/article/${story.slug || story.id}`;
      const auth = this.getSafeAuthor(story.author);
      const isTrending = story.isTrending || story.categorySlug === 'trending';

      return `
        <article class="story-card" data-article-id="${story.id}">
          <a href="${slugLink}" class="story-media">
            <img src="${story.image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&auto=format&fit=crop&q=85'}" alt="${story.title}" loading="lazy">
            <div class="story-tags-overlay">
              ${isTrending ? `<span class="story-trending-tag">🔥 TRENDING</span>` : ''}
              <span class="story-category-tag">${story.category}</span>
            </div>
          </a>
          <div class="story-content">
            <div class="story-meta">
              <span class="story-source-name">${story.source || story.region || 'TRINITY'}</span>
              <span>•</span>
              <span>${story.date || 'Today'}</span>
              <span>•</span>
              <span>${story.readTime || '5 min read'}</span>
              ${story.trendingVelocity ? `<span class="trending-velocity-tag">${story.trendingVelocity}</span>` : ''}
            </div>
            <h3 class="story-title">
              <a href="${slugLink}">${story.title}</a>
            </h3>
            <p class="story-excerpt">${story.subtitle || ''}</p>
            <div class="story-footer">
              <div class="author-chip">
                <img src="${auth.avatar}" alt="${auth.name}">
                <div class="author-info">
                  <div class="name">${auth.name}</div>
                  <div class="role">${auth.role}</div>
                </div>
              </div>
              <div class="card-actions">
                <button class="action-btn ${isSaved ? 'bookmarked' : ''}" onclick="window.trinityApp.toggleBookmark('${story.id}', event)" title="Save Dispatch">
                  ${isSaved ? 'Saved' : 'Save'}
                </button>
                <button class="action-btn" onclick="window.trinityApp.shareArticle('${story.id}', event)" title="Share">
                  Share
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
  async renderArticleView(slug) {
    const container = document.getElementById('standaloneArticleContainer');
    if (!container) return;

    const rawTarget = decodeURIComponent(slug || '').toLowerCase().trim();
    const normTarget = rawTarget.replace(/[^a-z0-9]/g, '');

    const findMatch = (list) => {
      if (!Array.isArray(list)) return null;
      return list.find(a => {
        if (!a) return false;
        const s = (a.slug || '').toLowerCase().trim();
        const id = (a.id || '').toLowerCase().trim();
        return (
          s === rawTarget ||
          id === rawTarget ||
          s.replace(/[^a-z0-9]/g, '') === normTarget ||
          id.replace(/[^a-z0-9]/g, '') === normTarget
        );
      });
    };

    let all = this.getAllArticles();
    let article = findMatch(all);

    if (!article) {
      article = findArticleBySlugOrId(slug, this.scraperService ? this.scraperService.getArticles() : [], this.state.aiArticles || []);
    }

    // If still loading daily edition from disk/network, show elegant loader and await completion!
    if (!article && this.state.aiArticlesLoading && this.articlesLoadPromise) {
      container.innerHTML = `
        <div style="text-align: center; padding: 6rem 1rem;">
          <div style="width: 32px; height: 32px; border: 2px solid var(--border-subtle); border-top-color: var(--text-primary); border-radius: 50%; margin: 0 auto 1.5rem auto; animation: spin 0.8s linear infinite;"></div>
          <div style="font-family: var(--font-mono); font-size: 0.75rem; letter-spacing: 0.1em; color: var(--text-muted); text-transform: uppercase;">Retrieving Institutional Dispatch...</div>
        </div>
      `;
      try {
        await this.articlesLoadPromise;
        all = this.getAllArticles();
        article = findMatch(all) || findArticleBySlugOrId(slug, this.scraperService ? this.scraperService.getArticles() : [], this.state.aiArticles || []);
      } catch (e) {}
    }

    // Safety fallback: direct fetch of daily-edition.json
    if (!article) {
      try {
        const res = await fetch('./data/daily-edition.json?_t=' + Date.now());
        if (res.ok) {
          const directList = await res.json();
          article = findMatch(directList);
          if (article && (!this.state.aiArticles || this.state.aiArticles.length === 0)) {
            this.state.aiArticles = directList;
            this.updateArticleCountBadge(directList.length);
          }
        }
      } catch (e) {}
    }

    if (!article) {
      container.innerHTML = `
        <div style="text-align: center; padding: 6rem 1rem;">
          <div style="font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.1em; color: var(--text-muted); text-transform: uppercase; margin-bottom: 1.5rem;">Dispatch Not Found</div>
          <h2 style="font-family: var(--font-serif); font-size: 2.2rem; margin-bottom: 1rem;">The requested dispatch could not be found.</h2>
          <p style="color: var(--text-secondary); margin-bottom: 2.5rem; max-width: 400px; margin-left: auto; margin-right: auto;">Explore today's verified executive dispatches on the main cover.</p>
          <a href="#/" class="btn-scrape-now" style="display: inline-flex;">← Return to Today's Cover</a>
        </div>
      `;
      return;
    }

    this.state.activeArticle = article;
    this.updateSEO({
      title: `${article.title} | TRINITY MARKETS`,
      description: article.subtitle || 'Institutional financial analysis dispatch from TRINITY MARKETS.',
      image: article.image,
      type: 'article',
      article: article
    });

    const isSaved = this.state.savedBookmarks.includes(article.id);
    const catSlug = article.categorySlug || 'stocks-and-equities';
    const safeAuthor = this.getSafeAuthor(article.author);

    // Get 3 related articles
    const related = this.getAllArticles()
      .filter(a => a.id !== article.id && (a.category === article.category || a.categorySlug === catSlug))
      .slice(0, 3);

    // Get next/prev articles in the same category
    const sameCategory = this.getAllArticles().filter(a => a.categorySlug === catSlug);
    const currentIdx = sameCategory.findIndex(a => a.id === article.id);
    const prevArticle = currentIdx > 0 ? sameCategory[currentIdx - 1] : null;
    const nextArticle = currentIdx < sameCategory.length - 1 ? sameCategory[currentIdx + 1] : null;

    // Share URL
    const shareUrl = `${window.location.origin}${window.location.pathname}#/article/${article.slug || article.id}`;
    const encodedTitle = encodeURIComponent(article.title);
    const encodedUrl = encodeURIComponent(shareUrl);

    container.innerHTML = `
      <!-- Reading Progress Bar -->
      <div class="article-progress-bar" id="articleProgressBar"></div>

      <!-- Breadcrumb -->
      <nav class="article-breadcrumb">
        <a href="#/">Cover</a>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        <a href="#/category/${catSlug}">${article.category}</a>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        <span>${(article.slug || article.id).slice(0, 40)}…</span>
      </nav>

      <!-- Two-column article layout -->
      <div class="article-layout-grid">

        <!-- LEFT: Main Article Column -->
        <div class="article-main-col">

          <!-- Article Header -->
          <header class="standalone-article-header">
            <div class="reader-meta-pills">
              <a href="#/category/${catSlug}" class="reader-category-pill">${article.category}</a>
              ${article.region ? `<span class="reader-region-pill"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10z"/></svg>${article.region}</span>` : ''}
            </div>

            <h1 class="standalone-headline">${article.title}</h1>
            <p class="standalone-subtitle">${article.subtitle || ''}</p>

            <!-- Author + Meta toolbar -->
            <div class="standalone-toolbar">
              <div class="article-author-block">
                <img class="author-avatar-lg" src="${safeAuthor.avatar}" alt="${safeAuthor.name}" onerror="this.src='https://ui-avatars.com/api/?name=TRINITY+Desk&background=0a0a0a&color=ffffff&size=80&format=svg'">
                <div>
                  <div class="author-name-lg">${safeAuthor.name}</div>
                  <div class="author-role-lg">${safeAuthor.role}</div>
                  <div class="article-date-meta">
                    <span>${article.date || 'Today'}</span>
                    <span class="meta-dot">·</span>
                    <span>${article.readTime || '5 min read'}</span>
                  </div>
                </div>
              </div>

              <div class="article-action-group">
                <button class="reader-btn" id="standaloneAudioBtn" onclick="window.trinityApp.toggleAudioNarration()" title="Listen">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                  <span id="standaloneAudioText">Listen</span>
                </button>
                <div class="reader-font-group">
                  <button class="reader-btn reader-btn-font" onclick="window.trinityApp.adjustFontSize('dec')">A−</button>
                  <button class="reader-btn reader-btn-font" onclick="window.trinityApp.adjustFontSize('inc')">A+</button>
                </div>
                <button class="reader-btn ${isSaved ? 'bookmarked' : ''}" onclick="window.trinityApp.toggleBookmark('${article.id}', event)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                  ${isSaved ? 'Saved' : 'Save'}
                </button>
                <button class="reader-btn" onclick="window.trinityApp.exportArticlePDF()" title="Print PDF">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  PDF
                </button>
              </div>
            </div>
          </header>

          <!-- Hero Image -->
          <div class="standalone-hero-img">
            <img src="${article.image}" alt="${article.title}" loading="lazy">
            ${article.caption ? `<div class="reader-caption">${article.caption}</div>` : `<div class="reader-caption">TRINITY MARKETS · ${article.category} · ${article.date || 'Today'}</div>`}
          </div>

          <!-- Article Body -->
          <div class="reader-article-prose" id="readerProseContent">
            ${this.cleanProseContent(article.content)}
          </div>

          <!-- Editorial Notice -->
          <div class="article-editorial-note" style="margin: 2rem 0; padding: 1rem 1.25rem; border-left: 3px solid var(--border-subtle); background: var(--bg-surface); font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5; border-radius: var(--radius-sm);">
            <strong>Editorial Notice:</strong> TRINITY MARKETS delivers authoritative macro and market intelligence synthesized from verified primary liquidity and regulatory filing telemetry. Analysis is provided for institutional informational purposes only.
          </div>

          <!-- Key Takeaways -->
          ${article.takeaways && article.takeaways.length ? `
          <div class="takeaways-box">
            <div class="takeaways-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              Key Takeaways for Portfolio Managers
            </div>
            <ul class="takeaways-list">
              ${article.takeaways.map(t => `<li>${t}</li>`).join('')}
            </ul>
          </div>
          ` : ''}

          <!-- Share Bar -->
          <div class="article-share-bar">
            <span class="share-label">Share this dispatch</span>
            <div class="share-btn-group">
              <a href="https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}" target="_blank" rel="noopener" class="share-btn share-twitter" title="Share on X/Twitter">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.735-8.835L1.254 2.25H8.08l4.259 5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Post
              </a>
              <a href="https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}" target="_blank" rel="noopener" class="share-btn share-linkedin" title="Share on LinkedIn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                LinkedIn
              </a>
              <a href="https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}" target="_blank" rel="noopener" class="share-btn share-whatsapp" title="Share via WhatsApp">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M11.938 0C5.351 0 0 5.351 0 11.938c0 2.101.549 4.079 1.508 5.789L0 24l6.502-1.683A11.876 11.876 0 0 0 11.938 23.875C18.524 23.875 24 18.524 24 11.938 24 5.351 18.524 0 11.938 0z"/></svg>
                WhatsApp
              </a>
              <button class="share-btn share-copy" onclick="window.trinityApp.shareArticle('${article.id}', event)" title="Copy link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copy Link
              </button>
            </div>
          </div>

          <!-- Prev / Next navigation -->
          <nav class="article-prev-next">
            ${prevArticle ? `
            <a href="#/article/${prevArticle.slug || prevArticle.id}" class="article-nav-btn article-nav-prev">
              <div class="nav-arrow">←</div>
              <div class="nav-text">
                <div class="nav-label">Previous Dispatch</div>
                <div class="nav-title">${prevArticle.title.slice(0, 65)}…</div>
              </div>
            </a>` : '<div class="nav-placeholder"></div>'}
            ${nextArticle ? `
            <a href="#/article/${nextArticle.slug || nextArticle.id}" class="article-nav-btn article-nav-next">
              <div class="nav-text" style="text-align: right;">
                <div class="nav-label">Next Dispatch</div>
                <div class="nav-title">${nextArticle.title.slice(0, 65)}…</div>
              </div>
              <div class="nav-arrow">→</div>
            </a>` : '<div class="nav-placeholder"></div>'}
          </nav>

          <!-- Related Articles (Clean text-only institutional headline list — NO extra images) -->
          ${related.length > 0 ? `
          <div class="article-related-section">
            <div class="section-head" style="margin-bottom: 1.25rem;">
              <div>
                <h3 class="section-title" style="font-size: 1.15rem;">More from ${article.category}</h3>
              </div>
              <a href="#/category/${catSlug}" class="btn-scrape-now">View All Sector Dispatches →</a>
            </div>
            <div class="article-related-list">
              ${related.map((rel, idx) => `
              <a href="#/article/${rel.slug || rel.id}" class="related-text-item">
                <div class="related-item-num">${String(idx + 1).padStart(2, '0')}</div>
                <div class="related-item-content">
                  <div class="related-item-title">${rel.title}</div>
                  <div class="related-item-meta">
                    <span class="related-item-cat">${rel.category}</span>
                    <span class="meta-dot">·</span>
                    <span>${rel.date || 'Today'}</span>
                    <span class="meta-dot">·</span>
                    <span>${rel.readTime || '5 min read'}</span>
                  </div>
                </div>
                <div class="related-item-arrow">→</div>
              </a>`).join('')}
            </div>
          </div>
          ` : ''}

        </div>

        <!-- RIGHT: Sticky Sidebar -->
        <aside class="article-sidebar">

          <!-- Quick Info Card -->
          <div class="article-sidebar-card">
            <div class="sidebar-card-label">Dispatch Info</div>
            <div class="dispatch-info-grid">
              <div><div class="dispatch-info-key">Category</div><div class="dispatch-info-val">${article.category}</div></div>
              <div><div class="dispatch-info-key">Region</div><div class="dispatch-info-val">${article.region || 'Global'}</div></div>
              <div><div class="dispatch-info-key">Read time</div><div class="dispatch-info-val">${article.readTime || '5 min'}</div></div>
              <div><div class="dispatch-info-key">Published</div><div class="dispatch-info-val">${article.date || 'Today'}</div></div>
            </div>
          </div>

          <!-- Cite / Save card -->
          <div class="article-sidebar-card">
            <div class="sidebar-card-label">Actions</div>
            <div class="sidebar-actions-stack">
              <button class="sidebar-action-btn ${isSaved ? 'saved' : ''}" onclick="window.trinityApp.toggleBookmark('${article.id}', event)">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="${isSaved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                ${isSaved ? 'Saved to Portfolio' : 'Save Dispatch'}
              </button>
              <button class="sidebar-action-btn" onclick="window.trinityApp.copyCitation('${article.id}')">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Copy Citation
              </button>
              <button class="sidebar-action-btn" onclick="window.trinityApp.exportArticlePDF()">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                Export PDF
              </button>
            </div>
          </div>

          <!-- Disclaimer -->
          <div class="article-sidebar-card article-sidebar-disclaimer">
            <div class="sidebar-card-label">Disclaimer</div>
            <p>TRINITY MARKETS content is AI-generated for informational purposes only. This is <strong>not financial advice</strong>. Past performance does not guarantee future results. Always consult a licensed financial advisor.</p>
          </div>

        </aside>
      </div>
    `;

    this.applyFontScaling();

    // Inject reading progress bar
    this._initReadingProgress();
  }

  _initReadingProgress() {
    const bar = document.getElementById('articleProgressBar');
    if (!bar) return;
    const prose = document.getElementById('readerProseContent');
    if (!prose) return;
    const onScroll = () => {
      const proseRect = prose.getBoundingClientRect();
      const totalHeight = prose.offsetHeight;
      const scrolled = Math.max(0, -proseRect.top);
      const pct = Math.min(100, Math.round((scrolled / totalHeight) * 100));
      bar.style.width = pct + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    // Clean up on next navigation
    this._cleanupProgressBar = () => window.removeEventListener('scroll', onScroll);
  }


  /* ==================== PAGE VIEW 3: Dedicated Category / Sector Hub Page ==================== */
  renderCategoryView(catSlug) {
    const container = document.getElementById('categoryPageContainer');
    if (!container) return;

    const cleanCatSlug = (catSlug || '').toLowerCase().trim();
    const slugAliases = {
      'trending': 'trending',
      'trending-news': 'trending',
      'india': 'indian-markets',
      'dalal-street': 'indian-markets',
      'policy': 'policy-and-ratecuts',
      'ratecuts': 'policy-and-ratecuts',
      'stocks': 'stocks-and-equities',
      'equities': 'stocks-and-equities',
      'real-estate': 'commercial-real-estate',
      'crypto': 'crypto-and-digital-assets',
      'pe-vc': 'private-equity-and-vc',
      'private-equity': 'private-equity-and-vc',
      'macro': 'macro-and-banking',
      'banking': 'banking-and-fintech',
      'fintech': 'banking-and-fintech',
      'ai': 'ai-and-frontier-tech',
      'tech': 'ai-and-frontier-tech',
      'energy': 'energy-and-commodities',
      'commodities': 'energy-and-commodities',
      'trade': 'global-trade',
      'geopolitics': 'global-trade'
    };
    const resolvedSlug = slugAliases[cleanCatSlug] || cleanCatSlug;

    const catData = CATEGORY_MAP[resolvedSlug] || CATEGORY_MAP[cleanCatSlug] || {
      name: "Financial Sector",
      tagline: "Institutional market intelligence and capital allocation analysis.",
      icon: "📊",
      leadTicker: "Active Markets Terminal"
    };

    this.updateSEO({
      title: `${catData.name} | TRINITY MARKETS`,
      description: `Institutional market intelligence, deep research dispatches, and filing analytics for ${catData.name}.`,
      type: 'website'
    });
    const all = this.getAllArticles();

    const articles = all.filter(a => {
      if (!a) return false;
      const aCat = (a.category || '').toLowerCase();
      const aSlug = (a.categorySlug || '').toLowerCase();
      const targetCatName = (catData.name || '').toLowerCase();

      return (
        aSlug === resolvedSlug ||
        aSlug === cleanCatSlug ||
        aCat === targetCatName ||
        (resolvedSlug === 'trending' && (a.isTrending || aSlug.includes('trending') || aCat.includes('trending') || (a.tags && a.tags.some(t => t.toLowerCase().includes('trending'))))) ||
        (resolvedSlug === 'ai-and-frontier-tech' && (aCat.includes('ai') || aCat.includes('frontier') || aSlug.includes('ai') || (a.tags && a.tags.some(t => t.toLowerCase().includes('ai') || t.toLowerCase().includes('semiconductor'))))) ||
        (resolvedSlug === 'energy-and-commodities' && (aCat.includes('energy') || aCat.includes('commodit') || aSlug.includes('energy') || (a.tags && a.tags.some(t => t.toLowerCase().includes('oil') || t.toLowerCase().includes('energy') || t.toLowerCase().includes('commodit'))))) ||
        (resolvedSlug === 'global-trade' && (aCat.includes('trade') || aCat.includes('geopolitic') || aSlug.includes('trade') || (a.tags && a.tags.some(t => t.toLowerCase().includes('trade') || t.toLowerCase().includes('tariff') || t.toLowerCase().includes('geopolitic'))))) ||
        (resolvedSlug === 'banking-and-fintech' && (aCat.includes('fintech') || aCat.includes('banking') || aSlug.includes('banking') || (a.tags && a.tags.some(t => t.toLowerCase().includes('bank') || t.toLowerCase().includes('fintech'))))) ||
        (resolvedSlug === 'indian-markets' && (aCat.includes('india') || aSlug.includes('india') || (a.tags && a.tags.some(t => t.toLowerCase().includes('india') || t.toLowerCase().includes('rbi'))))) ||
        (resolvedSlug === 'policy-and-ratecuts' && (aCat.includes('policy') || aCat.includes('rate') || aSlug.includes('policy') || (a.tags && a.tags.some(t => t.toLowerCase().includes('rate') || t.toLowerCase().includes('policy') || t.toLowerCase().includes('fed') || t.toLowerCase().includes('rbi'))))) ||
        (resolvedSlug === 'stocks-and-equities' && (aCat.includes('stock') || aCat.includes('equit') || aSlug.includes('stock') || (a.tags && a.tags.some(t => t.toLowerCase().includes('stock') || t.toLowerCase().includes('equity') || t.toLowerCase().includes('semiconductor'))))) ||
        (resolvedSlug === 'commercial-real-estate' && (aCat.includes('real estate') || aCat.includes('reit') || aSlug.includes('real-estate') || (a.tags && a.tags.some(t => t.toLowerCase().includes('real estate') || t.toLowerCase().includes('reit'))))) ||
        (resolvedSlug === 'crypto-and-digital-assets' && (aCat.includes('crypto') || aCat.includes('digital') || aSlug.includes('crypto') || (a.tags && a.tags.some(t => t.toLowerCase().includes('crypto') || t.toLowerCase().includes('bitcoin') || t.toLowerCase().includes('token'))))) ||
        (resolvedSlug === 'private-equity-and-vc' && (aCat.includes('private equity') || aCat.includes('vc') || aSlug.includes('private-equity') || (a.tags && a.tags.some(t => t.toLowerCase().includes('private equity') || t.toLowerCase().includes('debt') || t.toLowerCase().includes('infrastructure'))))) ||
        (resolvedSlug === 'macro-and-banking' && (aCat.includes('macro') || aCat.includes('bank') || aSlug.includes('macro') || (a.tags && a.tags.some(t => t.toLowerCase().includes('macro') || t.toLowerCase().includes('yield') || t.toLowerCase().includes('gold') || t.toLowerCase().includes('energy')))))
      );
    });

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
          <p class="section-subtitle">Deep Research, Sector Blogs & Verified Filings</p>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <a href="#/data" class="btn-scrape-now">📊 Data Dashboard</a>
          <a href="#/terminal" class="btn-scrape-now">Open Terminal →</a>
        </div>
      </div>

      <div class="news-cards-grid">
        ${articles.map(story => {
          const auth = this.getSafeAuthor(story.author);
          return `
          <article class="story-card">
            <a href="#/article/${story.slug || story.id}" class="story-media">
              <img src="${story.image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&auto=format&fit=crop&q=85'}" alt="${story.title}" loading="lazy">
              <div class="story-tags-overlay">
                <span class="story-category-tag">${story.category || catData.name}</span>
              </div>
            </a>
            <div class="story-content">
              <div class="story-meta">
                <span>${story.date || 'Today'}</span> • <span>${story.readTime || '5 min read'}</span>
              </div>
              <h3 class="story-title">
                <a href="#/article/${story.slug || story.id}">${story.title}</a>
              </h3>
              <p class="story-excerpt">${story.subtitle || ''}</p>
              <div class="story-footer">
                <div class="author-chip">
                  <img src="${auth.avatar}" alt="${auth.name}">
                  <div class="author-info">
                    <div class="name">${auth.name}</div>
                    <div class="role">${auth.role}</div>
                  </div>
                </div>
                <div class="card-actions">
                  <button class="action-btn" onclick="window.trinityApp.toggleBookmark('${story.id}', event)" title="Save Dispatch">
                    Save
                  </button>
                  <button class="action-btn" onclick="window.trinityApp.shareArticle('${story.id}', event)" title="Share Dispatch">
                    Share
                  </button>
                </div>
              </div>
            </div>
          </article>
        `;
        }).join('')}
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

        <!-- Interactive Institutional Chart Engine -->
        <div id="tickerChartContainer" style="margin-top: 1.5rem;"></div>
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

    // Mount interactive chart
    setTimeout(() => {
      if (this.chartService) {
        this.chartService.mount('tickerChartContainer', ticker);
      }
    }, 50);
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

  /* ==================== PAGE VIEW 14: Dedicated The Block-Style Data Dashboard ==================== */
  renderDataDashboardView() {
    const container = document.getElementById('dataPageContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="section-head">
        <div>
          <div class="header-edition-tag">INSTITUTIONAL TELEMETRY DESK</div>
          <h1 class="section-title">Institutional Data & ETF Inflow Dashboard</h1>
          <p class="section-subtitle">Real-Time Global ETF Capital Flows, Derivatives Open Interest, Sovereign Spreads & Dalal Street Inflows</p>
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn-scrape-now" onclick="window.trinityApp.renderDataDashboardView(); window.trinityApp.showToast('✓ Data Telemetry Synced')">
            <span>🔄</span>
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      <!-- High-Level KPI Strip -->
      <div class="market-pulse-barometer" style="margin-bottom: 2.5rem;">
        <div class="market-pulse-grid">
          ${MARKET_PULSE_KPIS.map(kpi => `
            <div class="pulse-kpi-card">
              <div class="pulse-kpi-top">
                <span class="pulse-kpi-label">${kpi.icon || ''} ${kpi.label}</span>
                ${kpi.change ? `<span class="pulse-kpi-change ${kpi.positive ? 'pos' : 'neg'}">${kpi.positive ? '▲' : '▼'} ${kpi.change}</span>` : ''}
              </div>
              <div class="pulse-kpi-value">${kpi.value}</div>
              <div class="pulse-kpi-subtext">${kpi.subtext || kpi.sublabel || ''}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="data-dashboard-grid" style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem; margin-bottom: 3rem;">
        <!-- ETF Flows Table -->
        <div class="etf-flows-card" style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.75rem;">
            <div>
              <h3 style="font-family: var(--font-serif); font-size: 1.3rem; margin: 0; color: var(--text-primary);">Global & Dalal Street ETF Net Inflows</h3>
              <p style="font-family: var(--font-sans); font-size: 0.78rem; color: var(--text-muted); margin: 0.2rem 0 0 0;">24-Hour Rolling Net Creation/Redemption Volumes</p>
            </div>
            <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-muted);">SOURCE: BLOOMBERG / DEPOSITORIES</span>
          </div>

          <div class="data-table-responsive" style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-family: var(--font-sans); font-size: 0.85rem;">
              <thead>
                <tr style="border-bottom: 1px solid var(--border-subtle); text-align: left; color: var(--text-muted); font-size: 0.75rem; font-family: var(--font-mono);">
                  <th style="padding: 0.6rem 0.5rem;">TICKER</th>
                  <th style="padding: 0.6rem 0.5rem;">FUND NAME</th>
                  <th style="padding: 0.6rem 0.5rem; text-align: right;">AUM</th>
                  <th style="padding: 0.6rem 0.5rem; text-align: right;">24H NET INFLOW</th>
                </tr>
              </thead>
              <tbody>
                ${ETF_FLOW_DATA.map(etf => `
                  <tr style="border-bottom: 1px solid var(--border-subtle);">
                    <td style="padding: 0.8rem 0.5rem; font-family: var(--font-mono); font-weight: 700; color: var(--text-primary);">
                      <a href="#/terminal" style="text-decoration: none; color: inherit;">${etf.ticker}</a>
                    </td>
                    <td style="padding: 0.8rem 0.5rem; color: var(--text-secondary); font-weight: 500;">${etf.name}</td>
                    <td style="padding: 0.8rem 0.5rem; text-align: right; font-family: var(--font-mono); font-weight: 700;">${etf.aum}</td>
                    <td style="padding: 0.8rem 0.5rem; text-align: right; font-family: var(--font-mono); font-weight: 800; color: ${etf.positive ? '#10b981' : '#ef4444'};">
                      ${etf.netFlow24h}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Macro Liquidity Radar -->
        <div class="liquidity-metrics-card" style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem;">
          <div style="border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.75rem;">
            <h3 style="font-family: var(--font-serif); font-size: 1.3rem; margin: 0; color: var(--text-primary);">Macro Yield & Liquidity Spreads</h3>
            <p style="font-family: var(--font-sans); font-size: 0.78rem; color: var(--text-muted); margin: 0.2rem 0 0 0;">Sovereign Debt Differential & Volatility Indices</p>
          </div>

          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--bg-tertiary); border-radius: var(--radius-sm);">
              <div>
                <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-primary);">India 10Y vs US 10Y Spread</div>
                <div style="font-size: 0.7rem; color: var(--text-muted);">IN10Y (6.824%) - US10Y (4.182%)</div>
              </div>
              <div style="font-family: var(--font-mono); font-size: 1.05rem; font-weight: 800; color: var(--text-primary);">+264 bps</div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--bg-tertiary); border-radius: var(--radius-sm);">
              <div>
                <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-primary);">FII Monthly Dalal St Net Flow</div>
                <div style="font-size: 0.7rem; color: var(--text-muted);">Foreign Institutional Inflows (Equities)</div>
              </div>
              <div style="font-family: var(--font-mono); font-size: 1.05rem; font-weight: 800; color: #10b981;">+₹28,450 Cr</div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--bg-tertiary); border-radius: var(--radius-sm);">
              <div>
                <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-primary);">CBOE Volatility Index (VIX)</div>
                <div style="font-size: 0.7rem; color: var(--text-muted);">Implied 30-day S&P 500 Volatility</div>
              </div>
              <div style="font-family: var(--font-mono); font-size: 1.05rem; font-weight: 800; color: #10b981;">14.82 (-3.4%)</div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; background: var(--bg-tertiary); border-radius: var(--radius-sm);">
              <div>
                <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-primary);">India Domestic SIP Run-Rate</div>
                <div style="font-size: 0.7rem; color: var(--text-muted);">Monthly Retail Mutual Fund Inflow</div>
              </div>
              <div style="font-family: var(--font-mono); font-size: 1.05rem; font-weight: 800; color: #10b981;">₹24,500 Cr/mo</div>
            </div>
          </div>

          <div style="margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--border-subtle);">
            <a href="#/terminal" class="btn-scrape-now" style="width: 100%; text-align: center; justify-content: center;">Open Full Terminal Quotes →</a>
          </div>
        </div>
      </div>

      <!-- Rate Cut Probability Radar Included on Data Dashboard -->
      <div class="macro-radar-section" style="margin-bottom: 3rem;">
        <div class="section-head">
          <div>
            <h2 class="section-title">🏛️ Global Central Bank Easing Matrix</h2>
            <p class="section-subtitle">Real-Time Rate Cut Probabilities & Sovereign Guidance</p>
          </div>
        </div>
        <div class="rate-cut-cards-grid">
          ${RATE_CUT_TRACKER.map(cb => {
            const probNum = parseInt(cb.cutProbability25bps) || 50;
            return `
              <div class="rate-cut-card">
                <div class="rate-cut-header">
                  <div>
                    <div class="cb-name">${cb.centralBank}</div>
                    <span class="cb-stance-pill">${cb.policyStance}</span>
                  </div>
                  <div class="cb-rate-huge">${cb.currentRate}</div>
                </div>

                <div class="cb-prob-bar-wrap">
                  <div class="cb-prob-label">
                    <span>Rate Cut Probability (25 bps)</span>
                    <span style="font-weight: 800; color: var(--text-primary);">${cb.cutProbability25bps}</span>
                  </div>
                  <div class="cb-prob-bar-bg">
                    <div class="cb-prob-bar-fill" style="width: ${probNum}%;"></div>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-family: var(--font-mono); font-size: 0.72rem; padding: 0.4rem 0; border-top: 1px solid var(--border-subtle);">
                  <div><span style="color: var(--text-muted);">Inflation:</span> <span style="font-weight: 700; color: var(--text-primary);">${cb.inflationRate.split(' ')[0]}</span></div>
                  <div><span style="color: var(--text-muted);">Real GDP:</span> <span style="font-weight: 700; color: var(--text-primary);">${cb.growthOutlook}</span></div>
                </div>

                <p class="cb-context">${cb.context}</p>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  /* ==================== PAGE VIEW 15: Dedicated Institutional Research Desk ==================== */
  renderResearchView() {
    const container = document.getElementById('researchPageContainer');
    if (!container) return;

    container.innerHTML = `
      <div class="section-head">
        <div>
          <div class="header-edition-tag">INSTITUTIONAL RESEARCH DESK</div>
          <h1 class="section-title">Institutional Deep-Dive Reports & Whitepapers</h1>
          <p class="section-subtitle">Exhaustive Quantitative Research for Sovereign Wealth Funds, Private Equity General Partners, and Institutional Allocators</p>
        </div>
        <a href="#/" class="btn-scrape-now">← Back to Cover</a>
      </div>

      <div class="research-reports-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 2rem; margin-top: 2rem; margin-bottom: 3.5rem;">
        ${INSTITUTIONAL_RESEARCH_REPORTS.map(rep => `
          <div class="research-card" style="background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 1.75rem; display: flex; flex-direction: column; justify-content: space-between; transition: transform 0.2s ease, border-color 0.2s ease;">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                <span style="font-family: var(--font-mono); font-size: 0.7rem; font-weight: 700; text-transform: uppercase; background: var(--bg-tertiary); padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); color: var(--text-primary);">${rep.category}</span>
                <span style="font-family: var(--font-mono); font-size: 0.72rem; color: var(--text-muted);">${rep.pages} • ${rep.date}</span>
              </div>

              <h2 style="font-family: var(--font-serif); font-size: 1.35rem; line-height: 1.35; margin: 0 0 0.75rem 0; color: var(--text-primary);">
                <a href="${rep.downloadUrl}" style="text-decoration: none; color: inherit;">${rep.title}</a>
              </h2>

              <div style="font-size: 0.78rem; font-family: var(--font-sans); color: var(--text-muted); margin-bottom: 1rem;">
                Authors: <strong style="color: var(--text-primary);">${rep.author}</strong>
              </div>

              <p style="font-size: 0.88rem; line-height: 1.6; color: var(--text-secondary); margin-bottom: 1.25rem;">
                ${rep.summary}
              </p>

              <div style="display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1.5rem;">
                ${rep.tags.map(t => `<span style="font-family: var(--font-mono); font-size: 0.68rem; padding: 0.15rem 0.4rem; background: var(--bg-secondary); border: 1px solid var(--border-subtle); border-radius: 3px; color: var(--text-secondary);">#${t}</span>`).join('')}
              </div>
            </div>

            <div style="display: flex; gap: 0.75rem; border-top: 1px solid var(--border-subtle); padding-top: 1.25rem;">
              <a href="${rep.downloadUrl}" class="btn-scrape-now" style="flex: 1; text-align: center; justify-content: center; font-size: 0.8rem;">
                Read Full Dispatch ↗
              </a>
              <button class="action-btn" onclick="window.trinityApp.showToast('Citation copied for research report');" title="Cite Report" style="padding: 0 0.6rem; font-size: 0.72rem;">
                Cite
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
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
          <span style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-primary); display: inline-flex; align-items: center; gap: 0.4rem;">
            <span style="width: 7px; height: 7px; border-radius: 50%; background: #10b981; display: inline-block;"></span> 60s Live Feed
          </span>
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

        <!-- Advanced Developer & API Integration (Collapsible) -->
        <details style="margin-top: 1rem; border-top: 1px solid var(--border-subtle); padding-top: 1.25rem;">
          <summary style="font-size: 0.82rem; font-weight: 600; color: var(--text-muted); cursor: pointer; user-select: none; display: flex; align-items: center; gap: 0.4rem;">
            ⚙️ Advanced Developer & API Integration
          </summary>
          <div style="margin-top: 1.25rem; display: flex; flex-direction: column; gap: 1.25rem;">
            <div class="settings-row" style="flex-direction: column; align-items: flex-start; gap: 0.75rem; border-bottom: none; padding-bottom: 0;">
              <div>
                <div style="font-weight: 700; color: var(--text-primary);">Google Gemini AI API Key</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">Powers real-time "Daily 10" financial article generation</div>
              </div>
              <div style="display: flex; gap: 0.5rem; width: 100%; max-width: 600px; flex-wrap: wrap;">
                <input type="password" id="geminiKeyInput" class="market-search-input" style="flex: 1; min-width: 240px; padding: 0.35rem 0.75rem; font-size: 0.78rem;" placeholder="Enter Gemini API Key..." value="${localStorage.getItem('trinity_gemini_api_key') || ''}">
                <button class="btn-scrape-now" onclick="const val = document.getElementById('geminiKeyInput').value.trim(); if(val){ localStorage.setItem('trinity_gemini_api_key', val); window.trinityApp.forceGeminiRegeneration(); window.trinityApp.showToast('Gemini API Key Saved'); } else { localStorage.removeItem('trinity_gemini_api_key'); window.trinityApp.showToast('Gemini Key Removed'); }">
                  Save Key
                </button>
                <button class="btn-test-key" onclick="window.trinityApp.testGeminiAPI()">
                  Test Connection
                </button>
              </div>
              <div id="geminiTestFeedback" class="api-test-feedback"></div>
            </div>

            <div class="settings-row" style="flex-direction: column; align-items: flex-start; gap: 0.75rem; border-bottom: none; padding-bottom: 0;">
              <div>
                <div style="font-weight: 700; color: var(--text-primary);">Alpha Vantage Market Key</div>
                <div style="font-size: 0.8rem; color: var(--text-secondary);">Powers live equities, REITs, and commodity forex feeds</div>
              </div>
              <div style="display: flex; gap: 0.5rem; width: 100%; max-width: 600px; flex-wrap: wrap;">
                <input type="password" id="avKeyInput" class="market-search-input" style="flex: 1; min-width: 240px; padding: 0.35rem 0.75rem; font-size: 0.78rem;" placeholder="Enter Alpha Vantage Key..." value="${localStorage.getItem('trinity_alpha_vantage_key') || 'O4Y0MFDAF40SYJ4J'}">
                <button class="btn-scrape-now" onclick="const val = document.getElementById('avKeyInput').value.trim(); if(val){ localStorage.setItem('trinity_alpha_vantage_key', val); window.trinityApp.showToast('Alpha Vantage Key Saved'); }">
                  Save Key
                </button>
                <button class="btn-test-key" onclick="window.trinityApp.testAlphaVantageAPI()">
                  Test Connection
                </button>
              </div>
              <div id="avTestFeedback" class="api-test-feedback"></div>
            </div>
          </div>
        </details>
      </div>
    `;
  }

  /* ==================== PAGE VIEW 16: 24/7 AI Audio Broadcast Studio (`#/live`) ==================== */
  renderLiveStudioView() {
    const container = document.getElementById('liveStudioContainer');
    if (!container) return;

    const liveMarkets = this.marketService ? this.marketService.getMarkets() : MARKET_DATA;
    const topArticles = this.state.aiArticles && this.state.aiArticles.length > 0 ? this.state.aiArticles : ARTICLES;
    const leadStory = topArticles[0] || ARTICLES[0];

    container.innerHTML = `
      <div class="studio-header-strip">
        <div class="studio-brand-title">
          <span>TRINITY LIVE</span>
          <span class="live-tv-tag">BROADCAST 24/7</span>
        </div>
        <div style="font-family: var(--font-mono); font-size: 0.8rem; color: #888;">
          AUDIO STREAM • REAL-TIME TELEMETRY • AUTONOMOUS AI ANCHOR
        </div>
        <button class="btn-scrape-now" id="studioStartBroadcastBtn" style="border-color: #ef4444; color: #ef4444; font-weight: 800; cursor: pointer;">
          🎙️ Start AI Voice Anchor
        </button>
      </div>

      <div class="studio-layout-grid">
        <div class="studio-main-stage">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #222; padding-bottom: 0.75rem;">
            <span style="font-family: var(--font-mono); font-size: 0.75rem; color: #ef4444; text-transform: uppercase; font-weight: 800;">BREAKING DISPATCH</span>
            <span style="font-family: var(--font-mono); font-size: 0.75rem; color: #888;">LIVE ANCHOR NARRATION</span>
          </div>

          <h2 style="font-family: var(--font-display); font-size: 1.8rem; line-height: 1.3; color: #fff;">${leadStory.title}</h2>
          <p style="font-family: var(--font-sans); font-size: 1rem; color: #ccc; line-height: 1.6;">${leadStory.excerpt || leadStory.subtitle}</p>

          <div style="margin-top: 1rem; background: #141414; border: 1px solid #262626; border-radius: 6px; padding: 1.25rem;">
            <div style="font-family: var(--font-mono); font-size: 0.75rem; color: #888; margin-bottom: 0.75rem;">LIVE MARKET TELEMETRY RADAR</div>
            <div id="liveStudioChartCanvasContainer" style="height: 320px; width: 100%;"></div>
          </div>
        </div>

        <aside class="studio-side-wire">
          <div style="font-family: var(--font-mono); font-size: 0.8rem; font-weight: 800; color: #fff; text-transform: uppercase; border-bottom: 1px solid #262626; padding-bottom: 0.5rem;">
            ⚡ LIVE TELEMETRY RADAR WIRE
          </div>
          <div class="wire-stream-list" style="display: flex; flex-direction: column; gap: 0.85rem;">
            ${topArticles.slice(1, 6).map(a => `
              <div class="wire-stream-item" style="border-bottom: 1px solid #1a1a1a; padding-bottom: 0.75rem;">
                <div style="font-family: var(--font-mono); font-size: 0.68rem; color: #ef4444;">${a.category || 'MACRO'}</div>
                <a href="#/article/${a.slug}" style="font-size: 0.88rem; font-weight: 700; color: #eee; line-height: 1.4; display: block; margin-top: 0.2rem;">${a.title}</a>
              </div>
            `).join('')}
          </div>
        </aside>
      </div>
    `;

    // Mount Chart in studio
    const sp500 = liveMarkets.find(m => m.symbol === 'SPY') || liveMarkets[0];
    setTimeout(() => {
      this.chartService.mount('liveStudioChartCanvasContainer', sp500, '1D');
    }, 50);

    const broadcastBtn = container.querySelector('#studioStartBroadcastBtn');
    if (broadcastBtn) {
      broadcastBtn.addEventListener('click', () => {
        const script = audioService.generateStudioBroadcastScript(liveMarkets, topArticles);
        audioService.speakText(script, 'TRINITY LIVE BROADCAST ANCHOR');
        this.showAudioPlayerBar('TRINITY LIVE BROADCAST ANCHOR');
      });
    }
  }

  /* ==================== PAGE VIEW 17: Macro Economic Calendar (`#/calendar`) ==================== */
  renderCalendarView() {
    const container = document.getElementById('calendarPageContainer');
    if (!container) return;

    const nextEvent = calendarService.getUpcomingEvent();
    const countdown = calendarService.calculateCountdown(nextEvent.date);
    const events = calendarService.getEvents();
    const earnings = calendarService.getEarningsMatrix();

    container.innerHTML = `
      <div class="section-head">
        <div>
          <h1 class="section-title">Macro Economic Calendar & Earnings Matrix</h1>
          <p class="section-subtitle">Central Bank Rate Decisions, CPI Releases, NFP Payrolls & Corporate Earnings Beats</p>
        </div>
      </div>

      <div class="calendar-countdown-hero" style="margin-top: 1.5rem;">
        <div>
          <span style="font-family: var(--font-mono); font-size: 0.75rem; color: #ef4444; font-weight: 800; text-transform: uppercase;">NEXT HIGH-IMPACT CATALYST</span>
          <h2 style="font-family: var(--font-display); font-size: 1.4rem; font-weight: 800; color: var(--text-primary); margin-top: 0.3rem;">${nextEvent.flag} ${nextEvent.title}</h2>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.2rem;">${nextEvent.description}</p>
        </div>

        <div class="countdown-digits">
          <div class="digit-box">
            <div class="digit-num">${String(countdown.days).padStart(2, '0')}</div>
            <div class="digit-lbl">Days</div>
          </div>
          <div class="digit-box">
            <div class="digit-num">${String(countdown.hours).padStart(2, '0')}</div>
            <div class="digit-lbl">Hours</div>
          </div>
          <div class="digit-box">
            <div class="digit-num">${String(countdown.mins).padStart(2, '0')}</div>
            <div class="digit-lbl">Mins</div>
          </div>
          <div class="digit-box">
            <div class="digit-num">${String(countdown.secs).padStart(2, '0')}</div>
            <div class="digit-lbl">Secs</div>
          </div>
        </div>
      </div>

      <div style="margin-top: 2rem;">
        <h3 style="font-family: var(--font-mono); font-size: 0.9rem; text-transform: uppercase; color: var(--text-primary); margin-bottom: 1rem;">📅 Upcoming Central Bank & Macro Releases</h3>
        <table class="macro-events-table">
          <thead>
            <tr>
              <th>Region</th>
              <th>Event Title</th>
              <th>Category</th>
              <th>Impact</th>
              <th>Forecast</th>
              <th>Previous</th>
            </tr>
          </thead>
          <tbody>
            ${events.map(e => `
              <tr>
                <td style="font-family: var(--font-mono);">${e.flag} ${e.region}</td>
                <td style="font-weight: 700; color: var(--text-primary);">${e.title}</td>
                <td><span style="background: var(--bg-tertiary); padding: 0.2rem 0.5rem; border-radius: 4px; font-family: var(--font-mono); font-size: 0.72rem;">${e.category}</span></td>
                <td><span style="color: #ef4444; font-weight: 800; font-family: var(--font-mono); font-size: 0.75rem;">HIGH</span></td>
                <td style="font-family: var(--font-mono); font-weight: 700; color: var(--text-primary);">${e.forecast}</td>
                <td style="font-family: var(--font-mono); color: var(--text-muted);">${e.previous}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div style="margin-top: 3rem;">
        <h3 style="font-family: var(--font-mono); font-size: 0.9rem; text-transform: uppercase; color: var(--text-primary); margin-bottom: 1rem;">📊 Corporate Earnings Beat/Miss Track Record</h3>
        <table class="macro-events-table">
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Company</th>
              <th>Report Date</th>
              <th>EPS Forecast</th>
              <th>Prior EPS</th>
              <th>Track Record</th>
            </tr>
          </thead>
          <tbody>
            ${earnings.map(em => `
              <tr>
                <td style="font-family: var(--font-mono); font-weight: 900; color: var(--text-primary);">${em.symbol}</td>
                <td style="font-weight: 600;">${em.company}</td>
                <td style="font-family: var(--font-mono);">${em.date}</td>
                <td style="font-family: var(--font-mono); font-weight: 700;">${em.epsForecast}</td>
                <td style="font-family: var(--font-mono); color: var(--text-muted);">${em.epsPrev}</td>
                <td><span style="color: #10b981; font-weight: 800; font-family: var(--font-mono); font-size: 0.75rem;">${em.trackRecord}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  setupAudioAndCopilot() {
    const copilotBtn = document.getElementById('openCopilotBtn');
    const copilotDrawer = document.getElementById('aiCopilotDrawer');
    const copilotBackdrop = document.getElementById('copilotBackdrop');
    const closeCopilotBtn = document.getElementById('closeCopilotBtn');

    const toggleCopilot = (forceOpen = null) => {
      if (copilotDrawer && copilotBackdrop) {
        const isCurrentlyHidden = copilotDrawer.classList.contains('hidden');
        const shouldBeHidden = forceOpen === true ? false : (forceOpen === false ? true : !isCurrentlyHidden);
        copilotDrawer.classList.toggle('hidden', shouldBeHidden);
        copilotBackdrop.classList.toggle('hidden', shouldBeHidden);
        if (!shouldBeHidden) {
          document.getElementById('copilotInput')?.focus();
        }
      }
    };
    this.toggleCopilot = toggleCopilot;

    copilotBtn?.addEventListener('click', () => toggleCopilot());
    closeCopilotBtn?.addEventListener('click', () => toggleCopilot(false));
    copilotBackdrop?.addEventListener('click', () => toggleCopilot(false));

    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
        e.preventDefault();
        toggleCopilot();
      }
    });

    const copilotForm = document.getElementById('copilotInputForm');
    const copilotInput = document.getElementById('copilotInput');
    const copilotBody = document.getElementById('copilotChatBody');

    const sendCopilotQuery = async (queryText) => {
      if (!queryText || !queryText.trim()) return;
      const text = queryText.trim();
      if (copilotInput) copilotInput.value = '';

      const userDiv = document.createElement('div');
      userDiv.className = 'copilot-msg user';
      userDiv.innerHTML = `<div class="msg-content">${text}</div>`;
      copilotBody?.appendChild(userDiv);
      copilotBody.scrollTop = copilotBody.scrollHeight;

      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'copilot-msg system';
      loadingDiv.innerHTML = `<div class="copilot-avatar">🧠</div><div class="msg-content"><em>Analyzing quantitative market telemetry...</em></div>`;
      copilotBody?.appendChild(loadingDiv);
      copilotBody.scrollTop = copilotBody.scrollHeight;

      try {
        const liveMarkets = this.marketService ? this.marketService.getMarkets() : MARKET_DATA;
        const answer = await aiCopilotService.ask(text, liveMarkets, this.state.activeArticle);
        loadingDiv.querySelector('.msg-content').innerHTML = answer.replace(/\n/g, '<br>').replace(/###\s+/g, '<strong>').replace(/\*\*/g, '');
      } catch (err) {
        loadingDiv.querySelector('.msg-content').innerHTML = `<span style="color:#ef4444;">Error: ${err.message}</span>`;
      }
      copilotBody.scrollTop = copilotBody.scrollHeight;
    };

    copilotForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      sendCopilotQuery(copilotInput.value);
    });

    document.getElementById('copilotPromptChips')?.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip-btn');
      if (chip) {
        sendCopilotQuery(chip.dataset.query);
      }
    });

    const audioBar = document.getElementById('globalAudioPlayerBar');
    const playPauseBtn = document.getElementById('audioPlayPauseBtn');
    const stopBtn = document.getElementById('audioStopBtn');
    const closeAudioBtn = document.getElementById('closeAudioBarBtn');
    const speedSelect = document.getElementById('audioSpeedSelect');
    const audioTitleInfo = document.getElementById('audioTitleInfo');

    audioService.onStateChange(({ isPlaying, isPaused, article }) => {
      if (audioBar) {
        audioBar.classList.toggle('hidden', !isPlaying && !isPaused);
      }
      const playIcon = document.getElementById('audioPlayIcon');
      const pauseIcon = document.getElementById('audioPauseIcon');
      if (playIcon && pauseIcon) {
        playIcon.style.display = isPlaying && !isPaused ? 'none' : 'block';
        pauseIcon.style.display = isPlaying && !isPaused ? 'block' : 'none';
      }
      if (article && audioTitleInfo) {
        audioTitleInfo.textContent = `Narrating: ${article.title}`;
      }
    });

    playPauseBtn?.addEventListener('click', () => audioService.togglePlayPause());
    stopBtn?.addEventListener('click', () => audioService.stop());
    closeAudioBtn?.addEventListener('click', () => {
      audioService.stop();
      audioBar?.classList.add('hidden');
    });
    speedSelect?.addEventListener('change', (e) => audioService.setRate(e.target.value));
  }

  showAudioPlayerBar(title) {
    const audioBar = document.getElementById('globalAudioPlayerBar');
    const audioTitleInfo = document.getElementById('audioTitleInfo');
    if (audioBar) audioBar.classList.remove('hidden');
    if (audioTitleInfo && title) audioTitleInfo.textContent = `Narrating: ${title}`;
  }

  /* ==================== Theme & Market Telemetry ==================== */
  applyTheme(theme) {
    this.state.theme = theme;
    localStorage.setItem('trinity_theme', theme);
    document.body.className = `theme-${theme}`;

    // Update hamburger menu theme button label and icon
    const themeLabel = document.getElementById('menuThemeLabel');
    const themeIcon = document.getElementById('menuThemeIcon');
    if (themeLabel) {
      themeLabel.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    }
    if (themeIcon) {
      themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  toggleTheme() {
    const newTheme = this.state.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
    this.showToast(`Switched to ${newTheme === 'dark' ? 'Dark Mode' : 'Light Paper Mode'}`);
    if (this.chartService) {
      this.chartService.draw();
    }
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
   * Called by GeminiArticleService when AI articles are ready (partial or full batch).
   * Replaces static ARTICLES with freshly generated content and re-renders UI.
   */
  onGeminiArticlesReady(articles, meta = {}) {
    if (!articles || articles.length === 0) return;
    this.state.aiArticles = articles;
    this.state.aiArticlesLoading = false;

    const source = meta.fromCache ? 'cache' : 'Gemini AI';
    console.log(`[TRINITY] ✅ ${articles.length} articles ready from ${source} (partial: ${meta.partial || false})`);

    // Update article count badge
    this.updateArticleCountBadge(articles.length);

    // Show completion toast only when fully done (not on partial deliveries)
    if (!meta.fromCache && !meta.partial) {
      this.showToast(`✓ ${articles.length} Fresh AI Dispatches Ready — Today's Edition`);
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
   * Force Gemini to regenerate all 100 articles using latest market prices.
   * Triggered by the "Sync Primary Feeds" button.
   */
  async forceGeminiRegeneration() {
    const btnText = document.getElementById('scrapeNowText');
    const scrapeBtn = document.getElementById('scrapeNowBtn');

    if (btnText) btnText.textContent = 'Generating 100 Dispatches...';
    if (scrapeBtn) scrapeBtn.style.opacity = '0.6';

    this.showToast('🤖 Generating 100 fresh articles across 10 sections...');
    this.showGenerationProgress(0, 10, 'Starting full regeneration...');

    const liveData = this.marketService ? this.marketService.getMarkets() : MARKET_DATA;
    await this.geminiService.forceRegenerate(liveData);

    if (btnText) btnText.textContent = 'Sync Primary Feeds';
    if (scrapeBtn) scrapeBtn.style.opacity = '1';
  }

  getAllArticles() {
    const aiArticles = this.state.aiArticles || [];
    let storedAi = [];
    try {
      // Use new v2 cache key for 100-article daily edition
      storedAi = JSON.parse(localStorage.getItem('trinity_ai_articles_v2') || '[]');
    } catch {}
    const scraped = this.scraperService ? this.scraperService.getArticles() : [];

    // Combine AI articles (100/day), curated ARTICLES fallback library, and live scraped wire items
    const combined = [...aiArticles, ...storedAi, ...ARTICLES, ...scraped];
    const seen = new Set();
    const uniqueArticles = [];
    for (const a of combined) {
      if (!a) continue;
      const key = (a.slug || a.id || '').toLowerCase().trim();
      if (key && !seen.has(key)) {
        seen.add(key);
        uniqueArticles.push(a);
      }
    }
    return uniqueArticles;
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
      if (navigator.share) {
        navigator.share({
          title: article.title,
          text: article.subtitle,
          url: shareUrl
        }).catch(() => {
          navigator.clipboard?.writeText(shareUrl);
          this.showToast(`URL Copied: ${shareUrl}`);
        });
      } else {
        navigator.clipboard?.writeText(shareUrl);
        this.showToast(`URL Copied: ${shareUrl}`);
      }
    }
  }

  copyCitation(articleId) {
    const allArticles = this.getAllArticles();
    const article = allArticles.find(a => a.id === articleId) || this.state.activeArticle;
    if (!article) return;

    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const citation = `${article.author?.name || 'TRINITY Intelligence Desk'}. "${article.title}." TRINITY MARKETS Journal, ${article.date || today}, ${window.location.href}.`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(citation).then(() => {
        this.showToast('📋 Bibliographic citation copied to clipboard');
      }).catch(() => {
        this.showToast('Citation ready');
      });
    }
  }

  exportArticlePDF() {
    window.print();
  }

  async testGeminiAPI() {
    const input = document.getElementById('geminiKeyInput');
    const feedback = document.getElementById('geminiTestFeedback');
    const key = (input ? input.value.trim() : '') || localStorage.getItem('trinity_gemini_api_key');

    if (!key) {
      if (feedback) {
        feedback.className = 'api-test-feedback error';
        feedback.textContent = '❌ Please enter a Gemini API Key before testing.';
      }
      return;
    }

    if (feedback) {
      feedback.className = 'api-test-feedback';
      feedback.style.display = 'block';
      feedback.style.background = 'var(--bg-tertiary)';
      feedback.style.color = 'var(--text-secondary)';
      feedback.textContent = '🔄 Testing Gemini connection...';
    }

    const startTime = Date.now();
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Respond with the word "OK" only.' }] }]
        })
      });

      const elapsed = Date.now() - startTime;
      if (res.ok) {
        if (feedback) {
          feedback.className = 'api-test-feedback success';
          feedback.textContent = `✅ Gemini Connection Successful (${elapsed}ms latency). Ready for Daily 10 generation.`;
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        if (feedback) {
          feedback.className = 'api-test-feedback error';
          feedback.textContent = `❌ Gemini Error (${res.status}): ${errorData?.error?.message || 'Invalid API Key or quota exhausted'}`;
        }
      }
    } catch (err) {
      if (feedback) {
        feedback.className = 'api-test-feedback error';
        feedback.textContent = `❌ Network Connection Error: ${err.message}`;
      }
    }
  }

  async testAlphaVantageAPI() {
    const input = document.getElementById('avKeyInput');
    const feedback = document.getElementById('avTestFeedback');
    const key = (input ? input.value.trim() : '') || localStorage.getItem('trinity_alpha_vantage_key') || 'O4Y0MFDAF40SYJ4J';

    if (!key) {
      if (feedback) {
        feedback.className = 'api-test-feedback error';
        feedback.textContent = '❌ Please enter an Alpha Vantage API Key before testing.';
      }
      return;
    }

    if (feedback) {
      feedback.className = 'api-test-feedback';
      feedback.style.display = 'block';
      feedback.style.background = 'var(--bg-tertiary)';
      feedback.style.color = 'var(--text-secondary)';
      feedback.textContent = '🔄 Testing Alpha Vantage telemetry connection...';
    }

    const startTime = Date.now();
    try {
      const res = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=NVDA&apikey=${key}`);
      const elapsed = Date.now() - startTime;

      if (res.ok) {
        const data = await res.json();
        if (data['Global Quote'] && data['Global Quote']['05. price']) {
          if (feedback) {
            feedback.className = 'api-test-feedback success';
            feedback.textContent = `✅ Alpha Vantage Active (${elapsed}ms). NVDA Quote: $${parseFloat(data['Global Quote']['05. price']).toFixed(2)}`;
          }
        } else if (data['Note'] || data['Information']) {
          if (feedback) {
            feedback.className = 'api-test-feedback error';
            feedback.textContent = `⚠️ Rate Limited: ${data['Note'] || data['Information']}`;
          }
        } else {
          if (feedback) {
            feedback.className = 'api-test-feedback error';
            feedback.textContent = `❌ Alpha Vantage returned unexpected payload. Verify key validity.`;
          }
        }
      } else {
        if (feedback) {
          feedback.className = 'api-test-feedback error';
          feedback.textContent = `❌ HTTP ${res.status} from Alpha Vantage`;
        }
      }
    } catch (err) {
      if (feedback) {
        feedback.className = 'api-test-feedback error';
        feedback.textContent = `❌ Network Error: ${err.message}`;
      }
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
    // Theme Toggle (in Header and in Hamburger Menu)
    const handleThemeToggle = () => {
      this.toggleTheme();
    };
    document.getElementById('themeToggleBtn')?.addEventListener('click', handleThemeToggle);
    document.getElementById('menuThemeToggleBtn')?.addEventListener('click', handleThemeToggle);

    // AI Copilot Launch Button in Hamburger Menu
    document.getElementById('menuCopilotBtn')?.addEventListener('click', () => {
      // Close mobile sidebar
      const sidebar = document.getElementById('mainSidebar');
      const overlay = document.getElementById('sidebarOverlay');
      if (sidebar) sidebar.classList.remove('sidebar-open');
      if (overlay) overlay.classList.add('hidden');

      const copilotDrawer = document.getElementById('aiCopilotDrawer');
      const copilotBackdrop = document.getElementById('copilotBackdrop');
      if (copilotDrawer && copilotBackdrop) {
        copilotDrawer.classList.remove('hidden');
        copilotBackdrop.classList.remove('hidden');
        document.getElementById('copilotInput')?.focus();
      }
    });

    // Sync Button in Header and in Hamburger Menu
    const handleSyncFeeds = async () => {
      // Close mobile sidebar
      const sidebar = document.getElementById('mainSidebar');
      const overlay = document.getElementById('sidebarOverlay');
      if (sidebar) sidebar.classList.remove('sidebar-open');
      if (overlay) overlay.classList.add('hidden');

      await this.forceGeminiRegeneration();
      if (this.scraperService) {
        this.scraperService.scrapeAllChannels(true);
      }
      this.showToast('✓ Primary financial feeds synchronized');
    };
    document.getElementById('scrapeNowBtn')?.addEventListener('click', handleSyncFeeds);
    document.getElementById('menuSyncBtn')?.addEventListener('click', handleSyncFeeds);

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

    // Dedicated Header Nav Menu Click Delegator
    const categoryNavMenu = document.getElementById('categoryNavMenu');
    if (categoryNavMenu) {
      categoryNavMenu.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        const href = link.getAttribute('href') || '';
        if (href.startsWith('#/')) {
          e.preventDefault();
          const route = href.replace(/^#\/?/, '');
          this.navigate(route);
        }
      });
    }

    // Global Hash Link Click Delegator
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;
      const href = link.getAttribute('href') || '';
      if (href.startsWith('#/')) {
        e.preventDefault();
        const route = href.replace(/^#\/?/, '');
        this.navigate(route);
      }
    });

    // Global Keybindings (⌘K -> Search Page)
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.navigate('search');
      }
    });

    // Setup Audio and AI Copilot Listeners
    this.setupAudioAndCopilot();
  }
}

// Instantiate immediately & export globally
const trinityApp = new TrinityMarketsApp();
if (typeof window !== 'undefined') {
  window.trinityApp = trinityApp;
}
export default trinityApp;
