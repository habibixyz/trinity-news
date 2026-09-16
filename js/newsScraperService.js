/**
 * TRINITY MARKETS - Real-Time Financial Intelligence Ingestion Engine
 * Curates live market dispatches from CNBC, MarketWatch, TechCrunch Enterprise & CoinDesk.
 */

export const NEWS_CHANNELS = [
  {
    id: 'all',
    name: 'All Desks',
    tag: 'FINANCIAL WIRE',
    color: '#000000',
    badgeClass: 'badge-all'
  },
  {
    id: 'cnbc',
    name: 'CNBC Markets',
    tag: 'CNBC',
    color: '#000000',
    feedUrl: 'https://search.cnbc.com/rs/search/combinedlist/view.xml?partnerId=wrss01&id=10000664',
    avatar: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=120&auto=format&fit=crop&q=80',
    badgeClass: 'badge-cnbc',
    defaultCategory: 'Stocks & Equities'
  },
  {
    id: 'marketwatch',
    name: 'MarketWatch Top Stories',
    tag: 'MARKETWATCH',
    color: '#000000',
    feedUrl: 'https://feeds.content.dowjones.io/public/rss/mw_topstories',
    avatar: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=120&auto=format&fit=crop&q=80',
    badgeClass: 'badge-marketwatch',
    defaultCategory: 'Macro & Banking'
  },
  {
    id: 'techcrunch-vc',
    name: 'TechCrunch Venture & M&A',
    tag: 'VENTURE & VC',
    color: '#000000',
    feedUrl: 'https://techcrunch.com/category/venture/feed/',
    avatar: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=120&auto=format&fit=crop&q=80',
    badgeClass: 'badge-techcrunch',
    defaultCategory: 'Private Equity & VC'
  },
  {
    id: 'coindesk',
    name: 'CoinDesk Institutional',
    tag: 'COINDESK',
    color: '#000000',
    feedUrl: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
    avatar: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=120&auto=format&fit=crop&q=80',
    badgeClass: 'badge-coindesk',
    defaultCategory: 'Crypto & Digital Assets'
  }
];

export class NewsScraperService {
  constructor(onUpdateCallback) {
    this.channels = NEWS_CHANNELS;
    this.articles = [];
    this.onUpdate = onUpdateCallback;
    this.isScraping = false;
    this.autoStream = true;
    this.streamInterval = null;
    this.lastScrapedTime = null;
    this.corsProxies = [
      url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
      url => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
      url => url
    ];
  }

  start() {
    this.scrapeAllChannels();
    
    // Auto-stream fresh financial dispatches every 90 seconds
    if (this.autoStream) {
      this.streamInterval = setInterval(() => {
        this.scrapeAllChannels(true);
      }, 90000);
    }
  }

  stop() {
    if (this.streamInterval) {
      clearInterval(this.streamInterval);
      this.streamInterval = null;
    }
  }

  toggleAutoStream() {
    this.autoStream = !this.autoStream;
    if (this.autoStream) {
      this.start();
    } else {
      this.stop();
    }
    return this.autoStream;
  }

  async scrapeAllChannels(isBackground = false) {
    if (this.isScraping) return;
    this.isScraping = true;

    if (this.onUpdate) {
      this.onUpdate(this.articles, { isScraping: true, isBackground });
    }

    const channelPromises = this.channels
      .filter(ch => ch.feedUrl)
      .map(ch => this.scrapeChannelWithFallback(ch));

    const results = await Promise.allSettled(channelPromises);
    const newArticles = [];

    results.forEach((res, idx) => {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        newArticles.push(...res.value);
      }
    });

    if (newArticles.length > 0) {
      // Deduplicate by title similarity
      const unique = [];
      const seenTitles = new Set();

      newArticles.forEach(item => {
        const cleanTitle = item.title.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30);
        if (!seenTitles.has(cleanTitle)) {
          seenTitles.add(cleanTitle);
          unique.push(item);
        }
      });

      // Sort by publication timestamp descending
      unique.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      this.articles = unique.slice(0, 10);
      this.lastScrapedTime = new Date();
    }

    this.isScraping = false;
    if (this.onUpdate) {
      this.onUpdate(this.articles, {
        isScraping: false,
        isBackground,
        lastScraped: this.lastScrapedTime,
        newItemsCount: newArticles.length
      });
    }

    return this.articles;
  }

  async scrapeChannelWithFallback(channel) {
    for (const proxyGen of this.corsProxies) {
      try {
        const targetUrl = proxyGen(channel.feedUrl);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6500);

        const res = await fetch(targetUrl, {
          signal: controller.signal,
          headers: { 'Accept': 'application/rss+xml, application/xml, text/xml; q=0.9, */*; q=0.8' }
        });
        clearTimeout(timeoutId);

        if (!res.ok) continue;
        const xmlText = await res.text();
        const parsed = this.parseRssXml(xmlText, channel);
        if (parsed && parsed.length > 0) {
          return parsed;
        }
      } catch (err) {
        // try next proxy
      }
    }
    return [];
  }

  parseRssXml(xmlString, channel) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlString, 'text/xml');
      const items = Array.from(doc.querySelectorAll('item, entry')).slice(0, 3);

      return items.map((itemNode, idx) => {
        const title = this.getNodeText(itemNode, ['title']) || 'Financial Market Update';
        const link = this.getNodeAttrOrText(itemNode, 'link') || '#';
        const rawDesc = this.getNodeText(itemNode, ['description', 'summary', 'content']) || '';
        const cleanDesc = this.stripHtml(rawDesc).slice(0, 220);
        const pubDateStr = this.getNodeText(itemNode, ['pubDate', 'published', 'dc\\:date', 'date']);
        const pubDate = pubDateStr ? new Date(pubDateStr) : new Date();

        const image = this.extractImage(itemNode, rawDesc, idx);
        const category = this.inferFinancialCategory(title, cleanDesc, channel.defaultCategory);

        return {
          id: `live-${channel.id}-${Date.now()}-${idx}`,
          title: this.cleanEntities(title),
          subtitle: cleanDesc ? `${this.cleanEntities(cleanDesc)}...` : 'Real-time financial intelligence feed dispatch.',
          category: category,
          region: 'Institutional Wire',
          author: {
            name: `${channel.name} Wire`,
            role: 'Financial Correspondent',
            avatar: channel.avatar
          },
          date: this.formatTimeAgo(pubDate),
          timestamp: pubDate.getTime(),
          readTime: '3 min read',
          image: image,
          url: link,
          source: channel.name,
          channelId: channel.id,
          channelTag: channel.tag,
          badgeClass: channel.badgeClass,
          isLiveScraped: true,
          takeaways: [
            "Verified real-time institutional financial intelligence stream.",
            "Cross-market liquidity and pricing impact monitored continuously."
          ],
          content: `
            <p class="lead-para">${this.cleanEntities(cleanDesc || title)}</p>
            <p>This market dispatch was ingested in real time from the <strong>${channel.name}</strong> news wire. As part of our TRINITY Executive curation protocol, our analysts continuously monitor primary liquidity rails, corporate filings, and global regulatory mandates.</p>
            <div class="scraped-source-callout">
              <span class="source-icon">📊</span>
              <div>
                <strong>Primary Financial Source:</strong> ${channel.name}<br>
                <a href="${link}" target="_blank" rel="noopener noreferrer" class="scraped-external-link">Read the primary regulatory / wire filing on ${channel.name} ↗</a>
              </div>
            </div>
          `
        };
      });
    } catch (e) {
      return [];
    }
  }

  inferFinancialCategory(title, desc, fallbackCat = 'Stocks & Equities') {
    const text = `${title} ${desc}`.toLowerCase();
    if (text.includes('real estate') || text.includes('property') || text.includes('reit') || text.includes('housing') || text.includes('mortgage') || text.includes('commercial')) {
      return 'Commercial Real Estate';
    }
    if (text.includes('crypto') || text.includes('bitcoin') || text.includes('ethereum') || text.includes('blockchain') || text.includes('token') || text.includes('solana') || text.includes('btc') || text.includes('eth')) {
      return 'Crypto & Digital Assets';
    }
    if (text.includes('venture') || text.includes('private equity') || text.includes('startup') || text.includes('funding') || text.includes('series') || text.includes('m&a') || text.includes('acquisition') || text.includes('deal')) {
      return 'Private Equity & VC';
    }
    if (text.includes('fed') || text.includes('treasury') || text.includes('inflation') || text.includes('central bank') || text.includes('rate') || text.includes('yield') || text.includes('dollar') || text.includes('debt') || text.includes('macro')) {
      return 'Macro & Banking';
    }
    return fallbackCat;
  }

  getNodeText(parent, tagNames) {
    for (const tag of tagNames) {
      const el = parent.querySelector(tag);
      if (el && el.textContent) return el.textContent.trim();
    }
    return '';
  }

  getNodeAttrOrText(parent, tagName) {
    const el = parent.querySelector(tagName);
    if (!el) return '';
    return el.getAttribute('href') || el.textContent.trim() || '';
  }

  extractImage(itemNode, rawDesc, idx) {
    const enc = itemNode.querySelector('enclosure');
    if (enc && enc.getAttribute('url')) return enc.getAttribute('url');

    const mediaContent = itemNode.querySelector('media\\:content, content');
    if (mediaContent && mediaContent.getAttribute('url')) return mediaContent.getAttribute('url');

    const match = rawDesc.match(/src=["'](https?:\/\/[^"']+\.(?:jpg|jpeg|png|webp))/i);
    if (match && match[1]) return match[1];

    const defaults = [
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80'
    ];
    return defaults[idx % defaults.length];
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
  }

  cleanEntities(text) {
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&#8217;/g, "'")
      .replace(/&#8216;/g, "'")
      .replace(/&#8220;/g, '"')
      .replace(/&#8221;/g, '"')
      .replace(/&#8212;/g, '—')
      .replace(/&#8211;/g, '–');
  }

  formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getArticles() {
    return this.articles;
  }
}
