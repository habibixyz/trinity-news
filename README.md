# TRINITY MARKETS | The Financial Intelligence Journal

> **Authoritative Macro Analysis, Capital Allocations, and Private Market Architecture**  
> An institutional-grade financial markets magazine powered by real-time market data and autonomous Gemini AI analysis.

---

## 🏛️ Executive Overview

**TRINITY MARKETS** is a next-generation financial publication built to *Forbes* / *Financial Times* editorial standards. Designed with a strict high-contrast monochrome aesthetic, TRINITY combines real-time multi-asset market telemetry with autonomous Gemini AI editorial dispatches to deliver institutional intelligence with **zero placeholders, zero fake tickers, and zero modal popups**.

Every feature, category, article, columnist essay, and market ticker quote resides on its own dedicated, bookmarkable URL slug.

---

## ✨ Core Pillars & Architecture

### 1. High-Contrast Monochrome Aesthetic
- **Strict Black & White Visual Hierarchy**: Engineered using pure editorial typography (`Cinzel`, `Newsreader`, `JetBrains Mono`, `Plus Jakarta Sans`).
- **Zero Distracting Rainbows**: High-contrast, readability-first layout inspired by classic Swiss financial journals and Bloomberg Terminals.
- **Dual Aesthetic Modes**: High-contrast Dark Velvet Mode (default) and Crisp Light Paper Mode.

### 2. Multi-Asset Real-Time Telemetry
TRINITY aggregates live financial data from multiple verified primary sources:
- **Equities & ETFs**: NVDA, AAPL, MSFT, SPY, QQQ (*Alpha Vantage Global Quote*)
- **Commercial Real Estate (REITs)**: Vanguard Real Estate (VNQ), Prologis (PLD), Equinix (EQIX)
- **Digital Assets**: Bitcoin (BTC), Ethereum (ETH), Solana (SOL) (*CoinGecko API*)
- **Global Macro & Commodities**: Gold spot (XAU/USD), US 10-Year Treasury yield, EUR/USD (*Alpha Vantage Currency / Open Exchange Rates*)

### 3. "The Daily 10" — Autonomous AI Editorial Pipeline
- TRINITY pulls live market rates and constructs a structured editorial brief.
- Connects directly to Google's **Gemini 3.6 Flash** model to write 10 deeply researched, 400–600 word institutional financial dispatches.
- Real numerical market data is directly embedded within the editorial prose.
- Features automatic multi-model failover (`gemini-3.6-flash` → `gemini-3.7-flash` → `gemini-3.8-flash` → `flash-latest`) and smart 6-hour client-side caching.

### 4. Dedicated 13-Page Full Client-Side Routing (Zero Modals)
No feature is hidden behind popup modals:
- `#/` — Editorial Magazine Cover & Lead Story
- `#/category/:slug` — Sector Hubs (*Stocks, Commercial Real Estate, Crypto, Private Equity, Macro*)
- `#/article/:slug` — Dedicated Longform Reader with font controls, key takeaways, and metric badges
- `#/terminal` — Institutional Financial Telemetry Hub with multi-asset filtering
- `#/ticker/:symbol` — Dedicated Asset Quote page with 52-week ranges, volume, and telemetry
- `#/wire` — Live Telemetry Radar Wire & Scraped Wires
- `#/perspectives` & `#/perspectives/:slug` — Founding Voices & Executive Essay Readers
- `#/briefing` — Daily Executive Morning Briefing
- `#/bureaus` — Global Financial Bureaus (*New York, London, Singapore, Dubai, Tokyo, Frankfurt*)
- `#/saved` — Local Bookmark & Reading Portfolio
- `#/search` — Fast Archive Search Engine (`⌘K`)
- `#/settings` — Journal Preferences & Theme Configuration

---

## 🚀 Quick Start Guide

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Node.js (v18+) or any static HTTP file server

### 1. Clone the Repository
```bash
git clone https://github.com/habibixyz/trinity-news.git
cd trinity-news
```

### 2. Configure API Keys
Copy the example configuration file:
```bash
cp js/config.example.js js/config.js
```
Open `js/config.js` and input your keys:
- **Alpha Vantage**: [Get Free API Key](https://www.alphavantage.co/support/#api-key)
- **Google Gemini API**: [Get Gemini Key](https://aistudio.google.com/)

*(Keys can also be dynamically customized via the in-browser Settings page).*

### 3. Launch Local Server
```bash
# Option A: Using Node.js built-in HTTP server
node -e "
const http = require('http');
const fs = require('fs');
const path = require('path');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png' };
http.createServer((req, res) => {
  let file = '.' + (req.url === '/' ? '/index.html' : req.url.split('?')[0]);
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not Found'); }
    else { res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'text/plain' }); res.end(data); }
  });
}).listen(5500, () => console.log('TRINITY running at http://localhost:5500'));"

# Option B: Using npx serve or python
npx serve -l 5500
# or
python -m http.server 5500
```
Open **[http://localhost:5500](http://localhost:5500)** in your browser.

---

## 📂 Project Structure

```
trinity-news/
├── index.html                   # Master HTML5 Semantic Layout (13 modular page views)
├── .gitignore                   # Safe Git ignore for credentials and cache
├── .env.example                 # Environment variables reference template
├── README.md                    # Project documentation
├── js/
│   ├── app.js                   # Application coordinator & client-side router
│   ├── config.js                # API Credentials & configuration
│   ├── config.example.js        # Developer configuration template
│   ├── geminiArticleService.js  # Autonomous Gemini AI editorial pipeline
│   ├── marketService.js         # Multi-asset live price feeds & micro-ticks
│   ├── newsData.js              # High-grade fallback articles & editorial opinions
│   └── newsScraperService.js    # Multi-wire RSS syndication scraper
└── styles/
    └── main.css                 # Complete luxury monochrome design system
```

---

## 🔒 Security & Privacy

- `.gitignore` is strictly configured to prevent environment variables, secret tokens, and OS cache from being committed.
- API keys stored in `js/config.js` or `localStorage` are only utilized for direct client-to-API requests from your browser session.

---

## 📄 License

MIT License © 2026 TRINITY MARKETS JOURNAL. All institutional rights reserved.
