/**
 * TRINITY MARKETS â€” Gemini AI 100-Article Daily Generation Engine
 * Generates 100 authentic Forbes/FT-style financial dispatches daily
 * across 10 editorial sections using live market data as source material.
 *
 * Architecture:
 * 1. Pull live market prices (already fetched by MarketService)
 * 2. For each of 10 editorial sections, build a targeted brief
 * 3. Send 10 sequential Gemini API calls â†’ 10 articles each = 100 total
 * 4. Progress callbacks fire after each section completes
 * 5. Cache keyed to today's date â€” auto-expires at midnight
 * 6. Every article carries AI disclosure + financial disclaimer
 *
 * LEGAL COMPLIANCE:
 * - No article body text is copied from any external source
 * - RSS headlines used as editorial topic prompts ONLY (fair use)
 * - Every article labeled "AI-Generated Analysis"
 * - Financial disclaimer appended to all articles
 */

import { CONFIG } from './config.js';


const STORAGE_KEY = 'trinity_ai_articles_v2';
const STORAGE_META_KEY = 'trinity_ai_articles_meta_v2';

// Get today's date string (YYYY-MM-DD) for date-keyed cache
const getTodayKey = () => new Date().toISOString().slice(0, 10);

export class GeminiArticleService {
  constructor(onArticlesReady, onProgress) {
    this.onArticlesReady = onArticlesReady;
    this.onProgress = onProgress || null; // fired after each section: (sectionName, count, total)
    this.isGenerating = false;
    this.allArticles = [];
  }

  /**
   * Main entry point. Returns cached articles if today's cache exists,
   * otherwise kicks off 100-article generation pipeline.
   * @param {Array} liveMarketData - current prices from MarketService
   */
  async getOrGenerateArticles(liveMarketData) {
    const cached = this.loadFromCache();
    if (cached) {
      console.log(`[TRINITY AI] âœ… Serving ${cached.length} cached AI articles (today's edition)`);
      if (this.onArticlesReady) this.onArticlesReady(cached, { fromCache: true });
      return cached;
    }

    return await this.generateAllSections(liveMarketData);
  }

  /**
   * Loads articles from localStorage if they were generated TODAY (date-keyed).
   */
  loadFromCache() {
    try {
      const meta = JSON.parse(localStorage.getItem(STORAGE_META_KEY) || 'null');
      if (!meta || meta.dateKey !== getTodayKey()) return null;

      const articles = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return articles && articles.length > 0 ? articles : null;
    } catch {
      return null;
    }
  }

  getCacheAge() {
    try {
      const meta = JSON.parse(localStorage.getItem(STORAGE_META_KEY) || 'null');
      if (!meta || !meta.generatedAt) return '0h';
      const ageHours = (Date.now() - meta.generatedAt) / (1000 * 60 * 60);
      return `${ageHours.toFixed(1)}h old`;
    } catch {
      return '0h';
    }
  }

  /**
   * Core 100-article pipeline: iterates over all 10 sections,
   * calls Gemini for each, fires progress updates, then caches everything.
   */
  async generateAllSections(marketData) {
    if (this.isGenerating) return null;
    this.isGenerating = true;
    this.allArticles = [];

    const sections = CONFIG.EDITORIAL_SECTIONS || [];
    const marketBrief = this.buildMarketSnapshot(marketData);

    console.log(`[TRINITY AI] ðŸ”„ Starting 100-article generation across ${sections.length} sections...`);

    try {
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        console.log(`[TRINITY AI] Generating section ${i + 1}/${sections.length}: ${section.name}`);

        const sectionArticles = await this.generateSection(section, marketBrief, i);

        if (sectionArticles && sectionArticles.length > 0) {
          this.allArticles.push(...sectionArticles);
        }

        // Fire progress callback so the UI can update live
        if (this.onProgress) {
          this.onProgress(section.name, sectionArticles ? sectionArticles.length : 0, this.allArticles.length);
        }

        // Serve partial results immediately so UI isn't blank
        if (this.onArticlesReady) {
          this.onArticlesReady([...this.allArticles], { fromCache: false, partial: true, count: this.allArticles.length });
        }

        // Respectful delay between sections (avoid rate limiting)
        if (i < sections.length - 1) await this.sleep(1500);
      }

      // Final cache save and callback
      this.saveToCache(this.allArticles);
      if (this.onArticlesReady) {
        this.onArticlesReady(this.allArticles, { fromCache: false, partial: false, count: this.allArticles.length });
      }

      console.log(`[TRINITY AI] âœ… Complete: ${this.allArticles.length} articles generated`);
      return this.allArticles;

    } catch (e) {
      console.error('[TRINITY AI] Generation pipeline error:', e.message);
      return this.allArticles.length > 0 ? this.allArticles : null;
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * Generate 10 articles for a single editorial section.
   */
  async generateSection(section, marketBrief, sectionIndex) {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    const prompt = `${marketBrief}

=== YOUR TASK: ${section.name.toUpperCase()} SECTION ===
Generate exactly 10 original financial news articles for today's (${today}) TRINITY MARKETS edition.
Section focus: ${section.focus}

Rules:
1. Write 100% original analytical prose â€” do NOT copy any real article text
2. Use the real market numbers from the snapshot above wherever relevant
3. Each article must be 350-500 words of dense, analytical prose
4. Cover 10 distinct topics/angles within this section â€” no repetition
5. Tone: authoritative, Bloomberg/FT-style â€” no clickbait, no fluff
6. Include real data points, percentages, and prices in every article
7. Write in present tense as if published today (${today})
8. Diversity: mix of breaking analysis, trend pieces, and outlook pieces

Return a valid JSON array. Each object must have:
- "title": string (compelling headline, max 90 chars)
- "subtitle": string (one-sentence deck, max 160 chars)
- "slug": string (URL-safe, hyphenated, unique, max 60 chars)
- "content": string (full article HTML using <p> tags, 350-500 words, bold key figures with <strong>)
- "takeaways": array of exactly 3 strings (portfolio-manager level insights, max 120 chars each)
- "readTime": string (e.g. "4 min read")
- "region": string (e.g. "New York", "London", "Singapore", "Tokyo", "Washington D.C.", "Frankfurt", "Dubai")
- "authorName": string (realistic financial journalist full name)
- "authorRole": string (e.g. "Senior Markets Correspondent", "Macro Editor", "Crypto Desk Lead")

Return ONLY the raw JSON array. No markdown, no code blocks, no commentary.`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.75,
        maxOutputTokens: 8192,
        topP: 0.9
      }
    };

    const rawText = await this.callGeminiWithFallback(payload);
    if (!rawText) return [];

    return this.parseAndEnrichArticles(rawText, section, sectionIndex);
  }

  /**
   * Shared market snapshot â€” used as context for all 10 section briefs.
   */
  buildMarketSnapshot(marketData) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

    const bySymbol = {};
    (marketData || []).forEach(m => { bySymbol[m.symbol] = m; });

    const fmt = (sym, fallback) => {
      const m = bySymbol[sym];
      if (!m) return fallback;
      return `${m.value} (${m.change || 'N/A'})`;
    };

    return `TRINITY MARKETS â€” LIVE MARKET INTELLIGENCE BRIEF
Date: ${dateStr}, ${timeStr}

=== GLOBAL MARKET SNAPSHOT ===
US EQUITIES:
- S&P 500: ${fmt('SP500', '~5,620')}
- NASDAQ Composite: ${fmt('NASDAQ', '~17,800')}
- Dow Jones: ${fmt('DOW', '~42,100')}
- NVDA: ${fmt('NVDA', 'N/A')} | AAPL: ${fmt('AAPL', 'N/A')} | MSFT: ${fmt('MSFT', 'N/A')}

CRYPTO:
- Bitcoin (BTC): ${fmt('BTC-USD', '~$97,500')} | Market Cap: ${bySymbol['BTC-USD']?.marketCap || '~$1.9T'}
- Ethereum (ETH): ${fmt('ETH-USD', '~$3,400')} | Market Cap: ${bySymbol['ETH-USD']?.marketCap || '~$410B'}
- Solana (SOL): ${fmt('SOL-USD', '~$185')}

MACRO & RATES:
- US 10-Year Treasury Yield: ~4.22%
- Fed Funds Rate: 4.25%-4.50% (Easing bias)
- Gold (XAU/oz): ${fmt('GOLD', '~$2,640')}
- Brent Crude: ${fmt('BRENT', '~$73/bbl')}
- EUR/USD: ${fmt('EUR-USD', '~1.0820')}
- DXY Dollar Index: ~104.2

ASIA MARKETS:
- NIFTY 50: ${fmt('NIFTY50', '~25,800')}
- SENSEX: ${fmt('SENSEX', '~84,200')}
- USD/INR: ${fmt('USD-INR', '~84.50')}
- Nikkei 225: ~38,200 | Hang Seng: ~19,400

REAL ESTATE:
- VNQ REIT ETF: ${fmt('VNQ', 'N/A')} | EQIX: ${fmt('EQIX', 'N/A')}
- US 30-Year Mortgage Rate: ~6.82%`;
  }

  /**
   * Call Gemini API with multi-model fallback.
   */
  async callGeminiWithFallback(payload) {
    if (!CONFIG.GEMINI_API_KEY || CONFIG.GEMINI_API_KEY.trim() === '') {
      console.warn('[TRINITY AI] No Gemini API key configured. Skipping generation.');
      return null;
    }

    const MODELS = [
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro',
      'gemini-pro'
    ];

    for (const model of MODELS) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${CONFIG.GEMINI_API_KEY}`;
      try {
        console.log(`[TRINITY AI] Trying model: ${model}...`);
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const json = await res.json();

        if (json?.error?.code === 503) { await this.sleep(4000); continue; }
        if (json?.error?.code === 404) { continue; }
        if (json?.error?.code === 429) { await this.sleep(6000); continue; }
        if (json?.error?.code === 401 || json?.error?.code === 403) {
          throw new Error(`Auth error: ${json.error.message}`);
        }

        const rawText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) { console.warn(`[TRINITY AI] ${model} returned empty.`); continue; }

        console.log(`[TRINITY AI] âœ… Response from ${model}`);
        return rawText;

      } catch (e) {
        if (e.message.startsWith('Auth error')) throw e;
        console.warn(`[TRINITY AI] ${model} error: ${e.message}`);
      }
    }

    console.warn('[TRINITY AI] All models unavailable. Check API key and quota.');
    return null;
  }

  /**
   * Parse Gemini JSON response and enrich with section metadata + legal disclosures.
   */
  parseAndEnrichArticles(rawText, section, sectionIndex) {
    try {
      let clean = rawText.trim()
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

      const start = clean.indexOf('[');
      const end = clean.lastIndexOf(']');
      if (start === -1 || end === -1) throw new Error('No JSON array found');

      const rawArticles = JSON.parse(clean.slice(start, end + 1));
      const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      const baseOffset = sectionIndex * 10;

      return rawArticles.slice(0, 10).map((a, idx) => ({
        id: `ai-${section.id}-${getTodayKey()}-${idx}`,
        slug: a.slug || `${section.id}-dispatch-${idx + 1}-${Date.now()}`,
        title: a.title || `${section.name} Market Update`,
        subtitle: a.subtitle || `Daily institutional analysis from TRINITY MARKETS.`,
        category: section.name,
        categorySlug: section.categorySlug,
        content: this.injectDisclaimer(a.content || '<p>Dispatch loading...</p>'),
        takeaways: Array.isArray(a.takeaways) ? a.takeaways.slice(0, 3) : ['Market intelligence verified.'],
        readTime: a.readTime || '4 min read',
        date: today,
        timestamp: Date.now() - ((baseOffset + idx) * 45000),
        region: a.region || 'New York',
        source: 'TRINITY AI Editorial',
        sectionId: section.id,
        sectionIcon: section.icon,
        isLead: sectionIndex === 0 && idx === 0,
        isAIGenerated: true,
        aiDisclosure: 'AI-Generated Analysis',
        author: {
          name: a.authorName || 'TRINITY Editorial Desk',
          role: a.authorRole || 'Financial Correspondent',
          avatar: this.getAuthorAvatar(a.authorName)
        },
        image: this.getCategoryImage(section.id, idx)
      }));
    } catch (e) {
      console.error('[TRINITY AI] Parse error:', e.message, rawText.slice(0, 200));
      return [];
    }
  }

  /**
   * Append mandatory AI disclosure + financial disclaimer to every article.
   */
  injectDisclaimer(content) {
    const disclaimer = `
      <div class="article-ai-disclaimer">
        <span class="ai-badge">ðŸ¤– AI-Generated Analysis</span>
        <p><strong>Disclosure:</strong> This article was autonomously generated by TRINITY MARKETS' AI editorial engine using live market data. It is provided for informational purposes only and does <strong>not</strong> constitute financial advice, investment recommendations, or solicitation to buy or sell any securities. Always consult a qualified financial advisor before making investment decisions.</p>
      </div>`;
    return content + disclaimer;
  }

  getAuthorAvatar(name) {
    const encoded = encodeURIComponent((name || 'TRINITY Desk').slice(0, 20));
    return `https://ui-avatars.com/api/?name=${encoded}&background=0a0a0a&color=ffffff&size=120&font-size=0.4&bold=true&format=svg`;
  }

  getCategoryImage(sectionId, idx) {
    const images = {
      'stocks-equities': [
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&auto=format&fit=crop&q=85',
        'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=900&auto=format&fit=crop&q=85',
        'https://images.unsplash.com/photo-1642790551116-18e4f4f0f60e?w=900&auto=format&fit=crop&q=85'
      ],
      'crypto-digital-assets': [
        'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=900&auto=format&fit=crop&q=85',
        'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=900&auto=format&fit=crop&q=85',
        'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=900&auto=format&fit=crop&q=85'
      ],
      'global-macro': [
        'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=900&auto=format&fit=crop&q=85',
        'https://images.unsplash.com/photo-1559526324-593bc073d938?w=900&auto=format&fit=crop&q=85',
        'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=900&auto=format&fit=crop&q=85'
      ],
      'politics-markets': [
        'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=900&auto=format&fit=crop&q=85',
        'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=900&auto=format&fit=crop&q=85',
        'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=900&auto=format&fit=crop&q=85'
      ],
      'private-equity-vc': [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&auto=format&fit=crop&q=85',
        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=900&auto=format&fit=crop&q=85',
        'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=900&auto=format&fit=crop&q=85'
      ],
      'banking-fintech': [
        'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=900&auto=format&fit=crop&q=85',
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&auto=format&fit=crop&q=85',
        'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=900&auto=format&fit=crop&q=85'
      ],
      'energy-commodities': [
        'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=900&auto=format&fit=crop&q=85',
        'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=900&auto=format&fit=crop&q=85',
        'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=900&auto=format&fit=crop&q=85'
      ],
      'commercial-real-estate': [
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&auto=format&fit=crop&q=85',
        'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=900&auto=format&fit=crop&q=85',
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=900&auto=format&fit=crop&q=85'
      ],
      'asia-pacific-markets': [
        'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=900&auto=format&fit=crop&q=85',
        'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=900&auto=format&fit=crop&q=85',
        'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=900&auto=format&fit=crop&q=85'
      ],
      'etf-fund-flows': [
        'https://images.unsplash.com/photo-1642790551116-18e4f4f0f60e?w=900&auto=format&fit=crop&q=85',
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&auto=format&fit=crop&q=85',
        'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=900&auto=format&fit=crop&q=85'
      ]
    };

    const pool = images[sectionId] || images['stocks-equities'];
    return pool[idx % pool.length];
  }

  saveToCache(articles) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
      localStorage.setItem(STORAGE_META_KEY, JSON.stringify({
        dateKey: getTodayKey(),
        generatedAt: Date.now(),
        count: articles.length,
        version: '2.0'
      }));
    } catch (e) {
      console.warn('[TRINITY AI] Cache save failed:', e.message);
    }
  }

  /**
   * Force regeneration â€” clears today's cache and regenerates all 100 articles.
   */
  async forceRegenerate(liveMarketData) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_META_KEY);
    return await this.generateAllSections(liveMarketData);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

