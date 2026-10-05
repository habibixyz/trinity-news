# TRINITY MARKETS | The Financial Intelligence Journal

> **Authoritative Macro Analysis, Capital Allocations, and Private Market Architecture**  
> An institutional-grade financial markets magazine powered by real-time market data, trending web telemetry, and autonomous Gemini AI analysis.

---

## 🏛️ Executive Overview

**TRINITY MARKETS** is an institutional financial publication built to *Forbes* / *Financial Times* editorial standards. Designed with a strict high-contrast monochrome aesthetic, TRINITY combines real-time multi-asset market telemetry with an **autonomous trending news ingestion & synthesis engine** to deliver institutional intelligence with **zero placeholders, zero fake tickers, and zero modal popups**.

Every feature, sector category, trending dispatch, columnar essay, and market ticker quote resides on its own dedicated, bookmarkable URL slug.

---

## ✨ Autonomous Daily News & Trending Architecture

### 1. Expanded 12 Global Coverage Desks (65–70+ Full-Length Articles Daily)
TRINITY autonomously generates **65+ comprehensive, 450–550 word analytical reports** across 12 distinct global beats every day:
1. 🔥 **Trending & Market Movers** — Ingests live Google News Top Business & Global breaking feeds; tagged with live momentum velocity & rank.
2. **AI & Frontier Tech** — Clustered GPU capex, semiconductor monopolies, sovereign LLM infrastructure.
3. **Stocks & Equities** — Wall Street earnings, forward multiples, S&P 500 / NASDAQ capital flows.
4. **Macro & Central Banking** — Federal Reserve, ECB, Treasury yield curve inversion, and term premiums.
5. **Indian Markets & Dalal St** — Nifty 50, Sensex, FII/DII systematic inflows, sovereign capex.
6. **Crypto & Digital Assets** — Bitcoin reserves, spot ETF liquidity, tokenized RWAs, Layer-1 rails.
7. **Energy & Critical Commodities** — Brent crude, uranium, copper electrification deficits, OPEC+ policy.
8. **Private Equity & VC** — Dry powder deployment, mega-buyouts, venture deal terms.
9. **Global Trade & Geopolitics** — Tariff architectures, nearshoring, supply chain margins.
10. **Commercial Real Estate** — Data center campuses, logistics REITs, trophy asset recapitalizations.
11. **Banking & Global Fintech** — Tier-1 bank syndicates, repo liquidity, Basel III reserves.
12. **Policy & Rate Cuts** — Global easing cycles, central bank terminal rate expectations.

### 2. Live Trending Detection & Velocity Scoring
- Ingests real-time Google News Top Stories (`/rss`), Business Topics (`/topic/BUSINESS`), Technology Topics (`/topic/TECHNOLOGY`), and World News (`/topic/WORLD`).
- Automatically ranks high-momentum stories and tags them with:
  - `isTrending: true`
  - `trendingScore` (e.g. 94–99)
  - `trendingBadge: "🔥 TRENDING NOW"`
  - `trendingVelocity: "+145% volume surge"`
- Homepage includes an interactive **Trending Market Radar** pill filter bar and a dedicated `#/trending` hub.

### 3. Fully Autonomous Multi-Tier Refresh Pipeline
News updates run 100% autonomously without manual intervention across three layers:
- **GitHub Actions Scheduled Workflow**: Runs 4 times a day (`0 0,6,12,18 * * *`) every 6 hours on GitHub's infrastructure, commits, and pushes fresh dispatches automatically.
- **Background Daemon Worker (`scripts/autonomous-daemon.js`)**: Can run locally or on a server 24/7 (`npm run daemon`). It monitors the edition age and triggers synthesis automatically every 6 hours.
- **Embedded Server Watcher (`server.js`)**: Automatically checks the edition age upon server start and executes autonomous regeneration in the background if the edition is stale.
- **Client Hot-Reload Watcher (`js/app.js`)**: Polling listener checks `data/daily-edition-meta.json` every 3 minutes. When a newer edition is published, it hot-reloads the dispatches in memory and updates the UI without a jarring full-page reload!

---

## 🚀 Commands & Usage

### Autonomous Generation Commands
```bash
# Generate full daily edition (65+ articles across all 12 desks)
npm run generate

# Ingest and update Trending desk dispatches only
npm run generate:trending

# Run the 24/7 background autonomous daemon scheduler
npm run daemon

# Start the local server (with built-in autonomous news monitor)
npm start
```

### Manual CLI Overrides
```bash
# Fast mode for rapid testing (24 articles)
node scripts/generate-daily-edition.js --fast

# Specify your Gemini API key directly
node scripts/generate-daily-edition.js --key=YOUR_GEMINI_KEY

# Customize refresh cadence (e.g. 4 hours) via environment variable
ARTICLE_REFRESH_HOURS=4 npm run daemon
```

---

## 📂 Project Structure

```
trinity-news/
├── index.html                           # Semantic Layout & Modular View Containers
├── .github/
│   └── workflows/
│       └── generate-daily-edition.yml   # 6-Hour Scheduled Autonomous GitHub Action
├── data/
│   ├── daily-edition.json               # Full published edition (65+ verified dispatches)
│   └── daily-edition-meta.json          # Edition metadata, article & trending count
├── js/
│   ├── app.js                           # App coordinator, client routing, autonomous live watcher
│   ├── config.js                        # API credentials & editorial configuration
│   ├── geminiArticleService.js          # In-browser client generation fallback
│   ├── marketService.js                 # Multi-asset live price feeds & micro-ticks
│   ├── newsData.js                      # Category map, benchmark indices & editorial essays
│   └── newsScraperService.js            # Live telemetry wire scraper
├── scripts/
│   ├── generate-daily-edition.js        # Core ingestion & synthesis engine (12 desks)
│   └── autonomous-daemon.js             # 24/7 autonomous scheduler & background daemon
├── server.js                            # HTTP server with autonomous boot checker & API routes
└── styles/
    └── main.css                         # Luxury monochrome design system & trending styles
```

---

## 🔒 Security & Privacy

- `.gitignore` prevents secrets, `.env`, and cache from being committed.
- Strips 100% of third-party external journalist bylines and wire links.
- All reports re-attributed to TRINITY MARKETS' proprietary institutional masthead.

---

## 📄 License

MIT License © 2026 TRINITY MARKETS JOURNAL. All institutional rights reserved.
