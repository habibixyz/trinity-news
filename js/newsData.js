/**
 * TRINITY MARKETS - The Financial Intelligence Journal
 * Curated Institutional Analysis: Stocks, Commercial Real Estate, Crypto, Private Equity & Macro
 */

export const CATEGORY_MAP = {
  "stocks-and-equities": {
    name: "Stocks & Equities",
    tagline: "Wall Street, Semiconductor Monopolies, Tech Megacaps & Quantitative Volatility",
    icon: "📈",
    leadTicker: "S&P 500: 7,585.73 (-0.45%)"
  },
  "commercial-real-estate": {
    name: "Commercial Real Estate",
    tagline: "Manhattan & London Trophy Buyouts, 14%+ Private Debt & Data Center Campuses",
    icon: "🏢",
    leadTicker: "VNQ REIT: $94.20 (+0.85%)"
  },
  "crypto-and-digital-assets": {
    name: "Crypto & Digital Assets",
    tagline: "Sovereign Bitcoin Reserves, $500B Tokenized Treasuries & Layer-1 Settlement",
    icon: "⚡",
    leadTicker: "BTC: $76,010.00 (-1.97%)"
  },
  "private-equity-and-vc": {
    name: "Private Equity & VC",
    tagline: "$100B Sovereign Compute Vehicles, Autonomous Freight M&A & Family Office Allocations",
    icon: "💼",
    leadTicker: "Global Dry Powder: $2.49T"
  },
  "macro-and-banking": {
    name: "Macro & Banking",
    tagline: "Repo Facilities, 10-Year Treasury Yields & Nuclear Energy Renaissance",
    icon: "🌐",
    leadTicker: "US 10Y: 4.182% (+0.034)"
  }
};

export const MARKET_DATA = [
  // Major Indices & Equities
  { symbol: "SP500", name: "S&P 500 Index", category: "Stocks", value: "7,585.73", rawPrice: 7585.73, change: "-0.45%", changeVal: -34.25, high24h: "7,617.26", low24h: "7,572.69", positive: false, volume: "$82.4B", marketCap: "$48.2T", exchange: "NYSE / CBOE", description: "Benchmark index tracking 500 of the largest publicly traded corporations in the United States." },
  { symbol: "NASDAQ", name: "NASDAQ Composite", category: "Stocks", value: "25,981.57", rawPrice: 25981.57, change: "-0.78%", changeVal: -204.60, high24h: "26,190.40", low24h: "25,890.10", positive: false, volume: "$64.1B", marketCap: "$28.5T", exchange: "NASDAQ", description: "Technology-heavy benchmark index reflecting global compute, semiconductor, and software capitalization." },
  { symbol: "DOW", name: "Dow Jones Industrial", category: "Stocks", value: "52,093.11", rawPrice: 52093.11, change: "-0.63%", changeVal: -328.50, high24h: "52,420.00", low24h: "51,980.30", positive: false, volume: "$21.8B", marketCap: "$14.1T", exchange: "NYSE", description: "Price-weighted index of 30 prominent blue-chip industrial, banking, and commercial corporations." },
  { symbol: "US10Y", name: "10-Year Treasury Yield", category: "Macro", value: "4.182%", rawPrice: 4.182, change: "+0.034", changeVal: 0.034, high24h: "4.210%", low24h: "4.150%", positive: true, volume: "$410B/day", marketCap: "Sovereign Debt", exchange: "US Treasury", description: "The benchmark risk-free discount rate governing global sovereign debt and commercial valuation models." },
  { symbol: "NVDA", name: "NVIDIA Corporation", category: "Stocks", value: "$212.17", rawPrice: 212.17, change: "+0.57%", changeVal: +1.21, high24h: "$215.40", low24h: "$210.80", positive: true, volume: "$38.5B", marketCap: "$5.21T", exchange: "NASDAQ", description: "The dominant sovereign AI compute fabric and GPU architecture designer commanding 88% datacenter share." },
  { symbol: "AAPL", name: "Apple Inc.", category: "Stocks", value: "$331.34", rawPrice: 331.34, change: "-0.52%", changeVal: -1.74, high24h: "$334.80", low24h: "$330.10", positive: false, volume: "$18.2B", marketCap: "$4.98T", exchange: "NASDAQ", description: "Consumer hardware and edge intelligence platform with an active installed base exceeding 2.4 billion devices." },
  { symbol: "MSFT", name: "Microsoft Corporation", category: "Stocks", value: "$497.12", rawPrice: 497.12, change: "-1.64%", changeVal: -8.30, high24h: "$506.00", low24h: "$495.20", positive: false, volume: "$19.6B", marketCap: "$4.82T", exchange: "NASDAQ", description: "Hyperscale cloud infrastructure, enterprise software stack, and sovereign compute operator." },

  // Digital Assets & Crypto
  { symbol: "BTC-USD", name: "Bitcoin (BTC)", category: "Crypto", value: "$76,010.00", rawPrice: 76010.00, change: "-1.97%", changeVal: -1526.00, high24h: "$77,536.00", low24h: "$74,967.97", positive: false, volume: "$34.2B", marketCap: "$1.51T", exchange: "Decentralized L1 / CME", description: "Immutable digital bearer asset and sovereign treasury reserve asset with strict programmatic 21M supply cap." },
  { symbol: "ETH-USD", name: "Ethereum (ETH)", category: "Crypto", value: "$2,404.18", rawPrice: 2404.18, change: "-3.56%", changeVal: -88.80, high24h: "$2,492.99", low24h: "$2,358.88", positive: false, volume: "$18.9B", marketCap: "$289.4B", exchange: "Decentralized L1", description: "The primary programmable settlement layer for tokenized real-world assets, treasuries, and decentralized finance." },
  { symbol: "SOL-USD", name: "Solana (SOL)", category: "Crypto", value: "$97.33", rawPrice: 97.33, change: "-3.91%", changeVal: -3.96, high24h: "$101.39", low24h: "$95.82", positive: false, volume: "$4.8B", marketCap: "$45.6B", exchange: "Decentralized L1", description: "High-throughput execution environment handling over 2,500 transactions per second for retail and payment rails." },

  // Real Estate & REITs
  { symbol: "VNQ", name: "Vanguard Real Estate REIT", category: "Real Estate", value: "$94.20", rawPrice: 94.20, change: "+0.85%", changeVal: +0.79, high24h: "$94.80", low24h: "$93.50", positive: true, volume: "$1.4B", marketCap: "$68.2B", exchange: "NYSE Arca", description: "Broad exposure index tracking publicly traded American real estate investment trusts (REITs)." },
  { symbol: "PLD", name: "Prologis Logistics REIT", category: "Real Estate", value: "$128.45", rawPrice: 128.45, change: "+1.12%", changeVal: +1.42, high24h: "$129.20", low24h: "$127.10", positive: true, volume: "$840M", marketCap: "$118.5B", exchange: "NYSE", description: "Global leader in logistics and industrial real estate with 1.2 billion square feet of automated distribution centers." },
  { symbol: "EQIX", name: "Equinix Data Centers", category: "Real Estate", value: "$885.60", rawPrice: 885.60, change: "+2.04%", changeVal: +17.70, high24h: "$892.00", low24h: "$874.50", positive: true, volume: "$620M", marketCap: "$84.1B", exchange: "NASDAQ", description: "Digital infrastructure REIT operating over 260 international colocation and interconnection data centers." },

  // Commodities & FX
  { symbol: "GOLD", name: "Gold Spot (Oz)", category: "Macro", value: "$4,367.30", rawPrice: 4367.30, change: "+0.80%", changeVal: +34.60, high24h: "$4,385.00", low24h: "$4,330.10", positive: true, volume: "$145B/day", marketCap: "$19.8T", exchange: "COMEX / London Bullion", description: "The premier physical store of value and historical bedrock of sovereign central bank balance sheet reserves." },
  { symbol: "BRENT", name: "Brent Crude Oil", category: "Macro", value: "$108.19", rawPrice: 108.19, change: "-0.52%", changeVal: -0.56, high24h: "$109.80", low24h: "$107.40", positive: false, volume: "$68B/day", marketCap: "Physical Commodity", exchange: "ICE", description: "International benchmark price for physical crude oil extracted from the North Sea basin." },
  { symbol: "EUR-USD", name: "Euro / US Dollar", category: "Forex", value: "1.1538", rawPrice: 1.1538, change: "+0.14%", changeVal: +0.0016, high24h: "1.1560", low24h: "1.1510", positive: true, volume: "$1.1T/day", marketCap: "Forex Currency Pair", exchange: "Global Interbank", description: "The highest-volume foreign exchange currency pair reflecting macroeconomic balances between Europe and the US." }
];

export const BREAKING_NEWS = [
  {
    id: "brk-1",
    tag: "CAPITAL FLOWS",
    headline: "Blackstone and sovereign funds close $22B pan-European AI data center infrastructure vehicle",
    time: "6 mins ago",
    impact: "high"
  },
  {
    id: "brk-2",
    tag: "DIGITAL ASSETS",
    headline: "Institutional custody inflows surpass $1.4B daily as sovereign wealth treasuries expand BTC reserves",
    time: "21 mins ago",
    impact: "high"
  },
  {
    id: "brk-3",
    tag: "WALL STREET",
    headline: "Federal Reserve repo facility signals balanced dollar liquidity ahead of quarterly bond auction",
    time: "42 mins ago",
    impact: "medium"
  }
];

export const LIVE_WIRE = [
  {
    id: "wire-1",
    time: "4 mins ago",
    region: "Wall Street",
    category: "Stocks & Equities",
    categorySlug: "stocks-and-equities",
    headline: "Semiconductor foundry capacity book indicates 14% higher forward ASP for enterprise AI silicon.",
    fullText: "Global semiconductor fabrication syndicates reported unprecedented forward purchase commitments for 2nm and 3nm compute wafers, locking in average selling price increases through late 2027. Hyperscale operators continue to prioritize raw compute density over cost containment."
  },
  {
    id: "wire-2",
    time: "12 mins ago",
    region: "London / Mayfair",
    category: "Commercial Real Estate",
    categorySlug: "commercial-real-estate",
    headline: "Prime London commercial trophy assets record 18% surge in institutional private equity bid volume.",
    fullText: "Sovereign wealth offices and private debt syndicates have aggressively recapitalized high-profile commercial holdings across Mayfair and the City of London, taking advantage of structured debt refinancing windows to capture historic stabilized yields."
  },
  {
    id: "wire-3",
    time: "26 mins ago",
    region: "Global Macro",
    category: "Crypto & Digital Assets",
    categorySlug: "crypto-and-digital-assets",
    headline: "Ethereum Layer-1 daily settlement volume hits record $48B amidst interbank tokenized treasury trials.",
    fullText: "Settlement metrics on public smart contract rails crossed new all-time highs as global financial institutions processed overnight repo transactions and short-term debt tokens with instantaneous finality."
  },
  {
    id: "wire-4",
    time: "39 mins ago",
    region: "Silicon Valley",
    category: "Private Equity & VC",
    categorySlug: "private-equity-and-vc",
    headline: "Enterprise AI orchestration platforms command median 28x forward revenue valuations in Series C rounds.",
    fullText: "Venture mega-funds have consolidated dry powder into vertical infrastructure layers, rewarding startups that provide automated regulatory compliance and deterministic model execution."
  },
  {
    id: "wire-5",
    time: "54 mins ago",
    region: "Tokyo / Frankfurt",
    category: "Macro & Banking",
    categorySlug: "macro-and-banking",
    headline: "G10 sovereign yield curves flatten as central bank monetary committee prepares liquidity adjustments.",
    fullText: "International fixed income desks observed synchronized yield curve compression across 2-year and 10-year sovereign paper, indicating strong institutional appetite for high-grade duration."
  }
];

// The Executive 10 - Curated Daily Financial Magazine Stories with Slugs
export const ARTICLES = [
  {
    id: "art-lead-1",
    slug: "sovereign-compute-era-100b-infrastructure",
    isLead: true,
    title: "The Sovereign Compute Era: Why Private Equity Is Deploying $100B Into High-Density Grid Infrastructure",
    subtitle: "As gigawatt-scale data clusters become the new strategic energy reserve, institutional capital is pivoting from traditional real estate to power-backed compute assets.",
    category: "Private Equity & VC",
    categorySlug: "private-equity-and-vc",
    region: "Global Markets",
    author: {
      name: "Marcus Vance",
      role: "Managing Editor, Institutional Capital",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    },
    date: "Today's Executive Edition",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&auto=format&fit=crop&q=80",
    caption: "High-voltage substation and computational campus under construction in northern Virginia.",
    tags: ["Private Equity", "Infrastructure", "Energy", "Artificial Intelligence"],
    takeaways: [
      "Private equity mega-funds have allocated over $100B in 2026 alone toward behind-the-meter power generation and data centers.",
      "Access to 500MW+ grid interconnects now commands higher asset valuation premiums than physical land or prime urban real estate.",
      "Sovereign wealth funds from the Middle East and Asia are structuring joint ventures with nuclear operators to guarantee 24/7 baseload power."
    ],
    content: `
      <p class="lead-para">Across the private capital corridors of New York, London, and Abu Dhabi, the definition of institutional infrastructure has undergone its most dramatic repricing since the birth of commercial telecommunications.</p>
      
      <p>For decades, pension funds and sovereign wealth allocators treated prime office towers and logistics hubs as the gold standard of defensive yield. Today, an unprecedented bottleneck has inverted that hierarchy: energy interconnects and high-density compute capacity.</p>
      
      <h3>The Megawatt Premium</h3>
      <p>The race to construct sovereign artificial intelligence clusters has outpaced traditional grid development timelines by nearly five to one. As a consequence, private credit funds and infrastructure syndicates are acquiring power generation assets directly at the source—purchasing retired nuclear facilities, natural gas cogeneration plants, and geothermal leases.</p>
      
      <blockquote>
        "Power is the new prime location. A plot of land in rural Ohio with an approved 1-gigawatt electrical interconnect is now worth more per acre than prime commercial acreage in Manhattan."
        <cite>— TRINITY Private Capital Quarterly</cite>
      </blockquote>
      
      <p>As institutional treasuries seek defensive, inflation-protected cash flows with exponential technological upside, compute infrastructure represents the intersection of physical real estate, sovereign security, and high-frequency digital commerce.</p>
    `
  },
  {
    id: "art-2",
    slug: "prime-commercial-recapitalization-manhattan-london",
    title: "Prime Commercial Recapitalization: Inside the $14B Institutional Buyout of Manhattan & London Trophy Assets",
    subtitle: "Family offices and private debt funds are stepping into discounted prime commercial towers, securing historic entry yields.",
    category: "Commercial Real Estate",
    categorySlug: "commercial-real-estate",
    region: "Manhattan & London",
    author: {
      name: "Claire Moreau",
      role: "Real Estate & Asset Wealth Lead",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    },
    date: "Today's Executive Edition",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
    caption: "Midtown Manhattan architectural skyline reflecting morning institutional trading hours.",
    tags: ["Real Estate", "REITs", "Private Debt", "Trophy Assets"],
    takeaways: [
      "Distressed Class-A office conversions are generating double-digit yields for private equity sponsors.",
      "Prime London & New York luxury residential developments hit 15-year pricing highs due to global wealth migration."
    ],
    content: `
      <p>The great commercial debt maturity wall of 2025–2026 has transitioned from a crisis of liquidity into one of the most lucrative acquisition windows in modern real estate history.</p>
      <p>Sovereign family offices and opportunistic credit funds have deployed over $14B in the past 90 days, recapitalizing iconic Midtown Manhattan and City of London assets at 35% to 50% discounts to pre-2022 replacement cost.</p>
      <p>With newly structured debt stacks and premium amenitization programs, institutional landlords are reporting 94%+ leasing occupancy from private banking, hedge fund, and luxury consumer tenants.</p>
    `
  },
  {
    id: "art-3",
    slug: "sovereign-bitcoin-reserve-layer1-treasury",
    title: "The Sovereign Bitcoin Reserve: How Central Banks and Sovereign Wealth Funds Are Quietly Accumulating Layer-1 Liquidity",
    subtitle: "Beyond retail sentiment, global treasuries are integrating unseizable digital liquidity into sovereign foreign exchange reserves.",
    category: "Crypto & Digital Assets",
    categorySlug: "crypto-and-digital-assets",
    region: "Global Macro",
    author: {
      name: "Arthur Pendelton",
      role: "Senior Digital Asset Strategist",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
    },
    date: "Today's Executive Edition",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=800&auto=format&fit=crop&q=80",
    caption: "Institutional hardware security modules safeguarding multi-billion dollar digital asset custody reserves.",
    tags: ["Crypto", "Bitcoin", "Sovereign Reserves", "Central Banks"],
    takeaways: [
      "Over 7 global sovereign entities have established formal digital asset strategic reserve protocols.",
      "Institutional custodial volume on Ethereum and Bitcoin settlement layers exceeded $1.8T annualized."
    ],
    content: `
      <p>The historical debate over cryptocurrency legitimacy within sovereign finance has concluded. In its place is a silent, high-stakes competition among nation-state balance sheets to secure strategic reserves of cryptographic collateral.</p>
      <p>As geopolitical weaponization of traditional clearing networks intensifies, sovereign wealth funds from Latin America, the Gulf, and Central Asia have recognized Bitcoin and tokenized gold as immutable, bearer-instrument collateral.</p>
      <p>Interbank settlement experiments using Layer-1 rails have verified sub-second transaction finality, fundamentally altering the economics of international cross-border foreign exchange trade.</p>
    `
  },
  {
    id: "art-4",
    slug: "algorithmic-monopoly-hbm-semiconductors-wallstreet",
    title: "Wall Street's Algorithmic Monopoly: The High-Bandwidth Memory Architecture Reshaping Tech Megacap Valuations",
    subtitle: "NVIDIA, TSMC, and memory fabric leaders consolidate dominance as forward hardware orders lock in through 2028.",
    category: "Stocks & Equities",
    categorySlug: "stocks-and-equities",
    region: "Wall Street",
    author: {
      name: "Victoria Stirling",
      role: "Chief Equities Analyst",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
    },
    date: "Today's Executive Edition",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80",
    caption: "High-frequency equities order book execution feed inside a tier-one Wall Street trading firm.",
    tags: ["Stocks", "Semiconductors", "NVIDIA", "Wall Street"],
    takeaways: [
      "Tech megacap cash flows reached an aggregate $480B annualized, driving unprecedented corporate share buybacks.",
      "High-Bandwidth Memory (HBM4) supply deficits create pricing power unmatched in industrial history."
    ],
    content: `
      <p>On Wall Street, the traditional semiconductor cyclicality has broken down. In its place stands a generational capital expenditure supercycle driven by sovereign compute and enterprise AI deployment.</p>
      <p>Institutional portfolio managers have concentrated over 38% of active equity fund flows into the semiconductor supply chain—focusing specifically on advanced packaging, high-bandwidth memory, and optical interconnects.</p>
      <p>With major tech conglomerates committing hundreds of billions in annual capex through the end of the decade, the moat surrounding tier-one silicon foundries has become virtually insurmountable.</p>
    `
  },
  {
    id: "art-5",
    slug: "autonomous-logistics-freight-private-equity-consolidation",
    title: "The Second Wave of Autonomous Logistics: Inside the $8.5B Multi-Corporate Transportation Consolidation",
    subtitle: "Private equity conglomerates are purchasing freight networks and automating long-haul intermodal routes.",
    category: "Private Equity & VC",
    categorySlug: "private-equity-and-vc",
    region: "Americas & Europe",
    author: {
      name: "Marcus Vance",
      role: "Managing Editor, Institutional Capital",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    },
    date: "Today's Executive Edition",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80",
    caption: "Automated logistics hub operating 24/7 container transfer operations in Rotterdam.",
    tags: ["M&A", "Logistics", "Autonomous Systems", "Private Equity"],
    takeaways: [
      "Autonomous freight corridors have reduced per-mile transit operating costs by 42%.",
      "Consolidation across trucking and maritime carriers is creating vertically integrated logistics monopolies."
    ],
    content: `
      <p>Behind the consumer-facing discussions of automation lies a massive, multi-billion-dollar restructuring of global physical supply chains.</p>
      <p>Private equity consortiums are systematically rolling up regional freight carriers, retrofitting fleets with autonomous highway guidance systems, and integrating them with robotic intermodal port facilities.</p>
      <p>The resulting operational efficiency has expanded gross operating margins from 8% to over 26%, making logistics infrastructure one of the hottest target sectors for mid-market private capital.</p>
    `
  },
  {
    id: "art-6",
    slug: "private-credit-luxury-high-rises-14-percent-yields",
    title: "Private Credit in Luxury Residential High-Rises: Why Institutional Lenders Are Capturing 14%+ Yields",
    subtitle: "As regional banks pull back, non-bank private credit syndicates dominate the financing of ultra-luxury skyline developments.",
    category: "Commercial Real Estate",
    categorySlug: "commercial-real-estate",
    region: "Miami, Dubai, London",
    author: {
      name: "Claire Moreau",
      role: "Real Estate & Asset Wealth Lead",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    },
    date: "Today's Executive Edition",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80",
    caption: "Ultra-luxury residential waterfront high-rise development under private credit construction financing.",
    tags: ["Real Estate", "Private Credit", "Luxury Markets", "Yields"],
    takeaways: [
      "Private credit assets under management in real estate crossed $1.7T globally.",
      "Prime residential units in Miami and Dubai achieved record price-per-square-foot transaction velocity."
    ],
    content: `
      <p>The traditional banking system's regulatory retrenchment has created a golden era for private credit in luxury residential development.</p>
      <p>Institutional debt funds are underwriting senior construction facilities for trophy waterfront and city-center towers, capturing net yields between 12% and 15% with conservative 55% loan-to-value cushions.</p>
      <p>Driven by affluent international buyers seeking safe-haven real estate assets, pre-sales in these developments routinely cover 80% of total construction debt before vertical groundbreaking commences.</p>
    `
  },
  {
    id: "art-7",
    slug: "tokenized-treasuries-500b-institutional-blockchain",
    title: "The Tokenized Treasury Revolution: Why $500B of US Debt Is Migrating to Public Blockchain Rails",
    subtitle: "Wall Street giants BlackRock and Franklin Templeton lead the migration of short-term government paper into 24/7 liquid smart contracts.",
    category: "Crypto & Digital Assets",
    categorySlug: "crypto-and-digital-assets",
    region: "Fintech & Banking",
    author: {
      name: "Arthur Pendelton",
      role: "Senior Digital Asset Strategist",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
    },
    date: "Today's Executive Edition",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=80",
    caption: "Digital securities ledger tracking institutional yield transfers in real time.",
    tags: ["Tokenization", "Treasury Bills", "DeFi", "Wall Street"],
    takeaways: [
      "Tokenized US Treasury volume expanded 400% year-over-year, becoming the primary collateral for digital finance.",
      "Institutional treasuries now earn instantaneous compound yield on intraday idle cash."
    ],
    content: `
      <p>The most consequential innovation in institutional fixed income is not a new interest rate derivative, but the programmable tokenization of government debt.</p>
      <p>By issuing US Treasury bills directly as regulatory-compliant tokens on Ethereum and specialized institutional chains, asset managers enable 24/7 instant settlement and continuous collateral rehypothecation without intermediary clearing delays.</p>
      <p>Corporate treasuries are actively replacing static commercial paper holdings with yield-bearing tokenized cash equivalents, unlocking billions in working capital efficiency.</p>
    `
  },
  {
    id: "art-8",
    slug: "nuclear-renaissance-uranium-smr-energy-economics",
    title: "The Nuclear Renaissance: Uranium Futures and SMR Deployments Transform Heavy Industry Energy Economics",
    subtitle: "Long-term contracts for Small Modular Reactors surge as steel, tech, and chemical leaders lock in 30-year energy security.",
    category: "Macro & Banking",
    categorySlug: "macro-and-banking",
    region: "Global Industry",
    author: {
      name: "Victoria Stirling",
      role: "Chief Equities Analyst",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
    },
    date: "Today's Executive Edition",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=800&auto=format&fit=crop&q=80",
    caption: "Modern carbon-free industrial nuclear power generation facility cooling tower.",
    tags: ["Energy", "Nuclear", "Uranium", "Heavy Industry"],
    takeaways: [
      "Uranium spot prices and forward utility contracts reached multi-decade highs.",
      "Private tech and industrial consortiums have co-invested $32B in SMR licensing and site deployment."
    ],
    content: `
      <p>Energy transition realism has sparked a powerful structural bull market in nuclear power infrastructure and uranium enrichment contracts.</p>
      <p>Heavy manufacturing conglomerates, hyperscale data center operators, and sovereign utilities are entering into 30-year power purchase agreements with next-generation Small Modular Reactor (SMR) developers.</p>
      <p>With baseload zero-carbon energy commanding premium prices, uranium extraction assets and nuclear engineering firms are recording their strongest forward order backlogs in half a century.</p>
    `
  },
  {
    id: "art-9",
    slug: "zeroday-options-quantitative-liquidity-volatility-sp500",
    title: "Zero-Day Options and Quantitative Liquidity: How High-Frequency Algorithms Transformed Market Volatility",
    subtitle: "0DTE derivative flows now account for over 50% of S&P 500 options volume, compressing intraday swings while altering tail risk.",
    category: "Stocks & Equities",
    categorySlug: "stocks-and-equities",
    region: "Wall Street & Chicago",
    author: {
      name: "Arthur Pendelton",
      role: "Senior Digital Asset Strategist",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
    },
    date: "Today's Executive Edition",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop&q=80",
    caption: "Trading desks monitoring volatility surface and gamma exposure profiles.",
    tags: ["Options", "Quantitative Trading", "Volatility", "Wall Street"],
    takeaways: [
      "Intraday 0DTE options volume surpassed $1.2T in notional turnover per trading session.",
      "Market-maker delta and gamma hedging dynamics now dominate equity index intraday price action."
    ],
    content: `
      <p>The microstructure of Wall Street's benchmark equity indices has been fundamentally rewritten by the proliferation of same-day expiration options.</p>
      <p>Quantitative hedge funds and market-making consortiums deploy automated delta-neutral algorithms that absorb volatility during normal trading hours, while introducing unprecedented gamma sensitivity around major macroeconomic data releases.</p>
      <p>Institutional desks are utilizing custom dynamic hedging overlays to navigate this new liquidity regime without suffering portfolio drag.</p>
    `
  },
  {
    id: "art-10",
    slug: "family-office-hard-asset-rotation-farmland-gold",
    title: "The Great Family Office Rotation: Allocating 35% of Multi-Billion Portfolios Into Uncorrelated Hard Assets",
    subtitle: "Farmland, private water rights, prime commercial real estate, and rare physical commodities replace 60/40 balanced funds.",
    category: "Private Equity & VC",
    categorySlug: "private-equity-and-vc",
    region: "Wealth & Family Offices",
    author: {
      name: "Claire Moreau",
      role: "Real Estate & Asset Wealth Lead",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    },
    date: "Today's Executive Edition",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop&q=80",
    caption: "High-yield agricultural acreage and institutional water rights asset holdings.",
    tags: ["Family Offices", "Wealth Management", "Hard Assets", "Private Equity"],
    takeaways: [
      "Top-tier family offices reduced public fixed income exposure to historic lows below 12%.",
      "Direct investments in income-producing agricultural land, timberland, and water rights grew by 38%."
    ],
    content: `
      <p>Among the world's largest single-family offices and multi-billion-dollar private endowments, the classic 60/40 stock and bond allocation has been permanently decommissioned.</p>
      <p>Faced with long-term sovereign debt expansion and persistent currency debasement risks, wealth custodians have engineered a comprehensive pivot toward real, cash-flowing physical assets with zero correlation to public market volatility.</p>
      <p>From high-grade productive farmland in the American Midwest to commercial trophy real estate in London and tokenized gold reserves, multi-generational capital is prioritizing physical preservation and perpetual yield over speculative momentum.</p>
    `
  },
  {
    id: "art-11",
    slug: "datacenter-reit-megawatt-pricing-power-pld-eqix",
    title: "The Datacenter REIT Supercycle: How Prologis and Equinix Monetize 500MW Interconnect Backlogs",
    subtitle: "Industrial real estate giants capture 22% annual rental rate escalation as hyperscalers bid for high-voltage computational power corridors.",
    category: "Commercial Real Estate",
    categorySlug: "commercial-real-estate",
    region: "Virginia & Frankfurt",
    author: {
      name: "Claire Moreau",
      role: "Real Estate & Asset Wealth Lead",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    },
    date: "Today's Executive Edition",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80",
    caption: "High-density enterprise server architecture operating inside an Equinix colocation campus.",
    tags: ["REITs", "Data Centers", "Real Estate", "Prologis"],
    takeaways: [
      "Forward datacenter colocation lease pricing surged 22% year-over-year in North American primary markets.",
      "Industrial logistics REITs holding grandfathered utility interconnects trade at a 40% net asset value premium."
    ],
    content: `
      <p>Industrial real estate investment trusts have completed an extraordinary transformation from warehouse operators into the primary landlords of the computational economy.</p>
      <p>By securing multi-hundred-megawatt substation commitments before local utility grid saturation, operators like Equinix and Prologis have created insurmountable supply barriers around core digital infrastructure corridors.</p>
      <p>Institutional allocators are rerouting billions from office real estate into specialized digital infrastructure REITs, locking in CPI-indexed 20-year master lease agreements with investment-grade tenants.</p>
    `
  },
  {
    id: "art-12",
    slug: "sovereign-ai-foundry-monopolies-asml-tsmc-valuation",
    title: "The Sovereign Foundry Monopoly: Extreme Ultraviolet Lithography and the $6 Trillion Tech Moat",
    subtitle: "ASML and TSMC command impenetrable pricing power as forward orders for 2nm process nodes reach complete capacity through 2028.",
    category: "Stocks & Equities",
    categorySlug: "stocks-and-equities",
    region: "Taiwan & Netherlands",
    author: {
      name: "Victoria Stirling",
      role: "Chief Equities Analyst",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
    },
    date: "Today's Executive Edition",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80",
    caption: "Precision optical cleanroom during semiconductor photolithography wafer inspection.",
    tags: ["Semiconductors", "ASML", "TSMC", "Equities"],
    takeaways: [
      "High-NA EUV machinery orders represent a $42B forward delivery pipeline through late 2028.",
      "Pure-play foundry gross margins expanded to 54.2%, defying broader global manufacturing contractions."
    ],
    content: `
      <p>In the global equity markets, few monopolies are as mathematically absolute as the advanced semiconductor lithography and fabrication ecosystem.</p>
      <p>With each cutting-edge fabrication facility requiring over $20B in capital expenditure, sovereign governments in North America, Europe, and Asia are subsidizing foundry clusters to guarantee domestic silicon independence.</p>
      <p>For equity portfolio managers, the semiconductor hardware supply chain represents the ultimate non-discretionary tollbooth of the global technology sector.</p>
    `
  },
  {
    id: "art-13",
    slug: "tokenized-real-estate-syndication-commercial-liquidity",
    title: "Fractionalizing Mayfair and Manhattan: The $80B Rise of Regulatory-Compliant Tokenized Real Estate",
    subtitle: "Tier-one property developers partner with digital asset custodians to issue secondary-liquid security tokens for commercial skyscrapers.",
    category: "Crypto & Digital Assets",
    categorySlug: "crypto-and-digital-assets",
    region: "London & New York",
    author: {
      name: "Arthur Pendelton",
      role: "Senior Digital Asset Strategist",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
    },
    date: "Today's Executive Edition",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80",
    caption: "High-density institutional trading floor in London overlooking Canary Wharf.",
    tags: ["Tokenization", "Real Estate", "Securities", "Smart Contracts"],
    takeaways: [
      "Secondary market trading in tokenized commercial real estate expanded 280% in the last four quarters.",
      "Minimum investment thresholds for trophy commercial equity dropped from $25M to $10,000 for verified accredited allocators."
    ],
    content: `
      <p>The illiquidity discount that has historically plagued commercial real estate is rapidly evaporating under institutional tokenization frameworks.</p>
      <p>By wrapping institutional equity into regulated smart contracts on public-permissioned blockchains, property sponsors can raise capital globally while providing limited partners with continuous secondary exit liquidity.</p>
      <p>Sovereign regulatory approvals across the UK, Switzerland, and Singapore have paved the way for massive pension funds to syndicate trophy real estate assets without underwriting cumbersome private placement memorandums.</p>
    `
  },
  {
    id: "art-14",
    slug: "direct-lending-private-debt-replaces-syndicated-bank-loans",
    title: "The $2 Trillion Private Debt Empire: How Non-Bank Direct Lenders Displaced Wall Street Syndication Desks",
    subtitle: "Mega-sponsors Blackstone, Ares, and Apollo underwrite $5B+ buyout debt packages entirely off-balance-sheet, capturing 11% senior secured coupons.",
    category: "Private Equity & VC",
    categorySlug: "private-equity-and-vc",
    region: "Wall Street & Charlotte",
    author: {
      name: "Marcus Vance",
      role: "Managing Editor, Institutional Capital",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    },
    date: "Today's Executive Edition",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80",
    caption: "Executive boardroom negotiation during a multi-billion dollar private credit debt syndication.",
    tags: ["Private Debt", "Direct Lending", "Private Equity", "Blackstone"],
    takeaways: [
      "Direct lending now finances over 78% of all mid-market private equity leveraged buyouts.",
      "Default rates across top-quartile private credit funds remain below 1.4% due to strict maintenance covenant structures."
    ],
    content: `
      <p>The golden age of traditional commercial bank syndication is over. In its place stands an elite group of private credit managers who dictate the borrowing terms of corporate America.</p>
      <p>Free from regulatory reserve capital mandates, private debt funds offer sponsors speed of execution, custom amortization structures, and total confidentiality for multi-billion-dollar corporate acquisitions.</p>
      <p>Insurance companies and pension funds have permanently reallocated sovereign bond portfolios into senior secured direct loans, anchoring long-term institutional cash flow generation.</p>
    `
  },
  {
    id: "art-15",
    slug: "sovereign-debt-yield-curve-repression-gold-all-time-highs",
    title: "Sovereign Debt Repression: Why Central Bank Gold Accumulation Reached Century-Record Velocities",
    subtitle: "As G10 fiscal deficits expand past $3.5T annually, sovereign monetary authorities accelerate non-dollar reserve diversification.",
    category: "Macro & Banking",
    categorySlug: "macro-and-banking",
    region: "Zurich & Washington",
    author: {
      name: "Victoria Stirling",
      role: "Chief Equities Analyst",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
    },
    date: "Today's Executive Edition",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop&q=80",
    caption: "Physical gold bullion reserves stored in sovereign underground bank vault chambers.",
    tags: ["Gold", "Central Banks", "Sovereign Debt", "Macro"],
    takeaways: [
      "Global central banks added 1,180 metric tons of physical gold to national balance sheets over the trailing 12 months.",
      "Non-Western foreign exchange reserves held in US Treasuries fell to a 30-year low of 48% of total allocations."
    ],
    content: `
      <p>A profound tectonic shift is quietly recalibrating the balance sheets of sovereign central banks across the Eastern Hemisphere and Emerging Markets.</p>
      <p>Recognizing the mathematical certainty of perpetual fiscal expansion in developed market economies, sovereign monetary authorities are systematically exchanging sovereign paper for unencumbered physical gold and bearer assets.</p>
      <p>This structural institutional bidding has established an unyielding floor beneath bullion prices, redefining gold not as an archaic relic, but as the paramount tier-one riskless asset of modern sovereign finance.</p>
    `
  }
];

export const EDITORIAL_OPINIONS = [
  {
    id: "op-1",
    slug: "end-of-fiat-friction-digital-layer1",
    author: "Arthur Pendelton",
    role: "Senior Digital Asset Strategist",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    title: "The End of Fiat Friction: Why Digital Layer-1s Are Sovereign Infrastructure",
    snippet: "Within a decade, central banks that fail to integrate decentralized bearer-instrument liquidity will find their monetary policy authority severely diminished.",
    thesis: `
      <p class="lead-para">The architectural flaw in traditional cross-border settlement is not transaction speed; it is counterparty risk and multi-jurisdictional correspondent banking friction.</p>
      <p>As sovereign entities observe the geopolitical weaponization of central clearing utilities, the strategic value of decentralized, neutral Layer-1 settlement rails has become indisputable.</p>
      <p>Institutions that establish early node infrastructure and tokenized liquidity bridges will command the monetary crossroads of the 21st century.</p>
    `
  },
  {
    id: "op-2",
    slug: "urban-trophy-paradox-prime-real-estate",
    author: "Claire Moreau",
    role: "Real Estate & Asset Wealth Lead",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    title: "The Urban Trophy Paradox: Why Prime Assets Outperform General Real Estate",
    snippet: "In a world of remote work and automated commerce, top-tier trophy real estate in London, New York, and Dubai commands an ever-widening quality premium.",
    thesis: `
      <p class="lead-para">The divergence between commodity real estate and ultra-prime trophy assets has reached an unprecedented historical spread.</p>
      <p>While generic commercial assets struggle with refinancing obligations, iconic city-center landmarks in New York, London, and Dubai continue to set global price-per-square-foot transaction records.</p>
      <p>For global capital custodians, prime urban density is not just an asset class—it is an unreplicable store of generational wealth.</p>
    `
  },
  {
    id: "op-3",
    slug: "semiconductor-power-grids-geopolitical-currency",
    author: "Victoria Stirling",
    role: "Chief Equities Analyst",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    title: "Semiconductor Power Grids: The New Geopolitical Currency",
    snippet: "The balance of technological power will no longer be measured in patent filings, but in gigawatts of baseload power securely dedicated to AI compute.",
    thesis: `
      <p class="lead-para">In the macroeconomic battle for compute supremacy, silicon design is only half the equation. The true limiting factor is the physical electron.</p>
      <p>Nations that secure behind-the-meter nuclear baseload capacity and high-density electrical grid substations will dictate the training schedules of next-generation artificial intelligence models.</p>
      <p>Energy sovereignty and algorithmic superiority have officially converged into a single asset allocation thesis.</p>
    `
  }
];

export const FINANCIAL_BUREAUS = [
  {
    city: "New York",
    desk: "Wall Street & North American Markets",
    address: "280 Park Avenue, Manhattan, NY",
    lead: "Marcus Vance",
    status: "OPEN • LIVE TRADING",
    focus: "Equities, Private Debt, Derivatives & Macro"
  },
  {
    city: "London",
    desk: "European Banking & Prime Real Estate",
    address: "100 Bishopsgate, City of London, UK",
    lead: "Claire Moreau",
    status: "OPEN • LIVE TRADING",
    focus: "Trophy Commercial Real Estate, Cross-Border M&A & Sovereign Wealth"
  },
  {
    city: "Singapore",
    desk: "Asia-Pacific Wealth & Digital Asset Hub",
    address: "Marina Bay Financial Centre, Singapore",
    lead: "Arthur Pendelton",
    status: "AFTER HOURS TELEMETRY",
    focus: "Layer-1 Infrastructure, Tokenized Treasuries & Trade Settlement"
  },
  {
    city: "Dubai",
    desk: "Gulf Sovereign Capital & Energy Infrastructure",
    address: "DIFC Gate Precinct 4, Dubai, UAE",
    lead: "Victoria Stirling",
    status: "OPEN • LIVE TRADING",
    focus: "Sovereign Compute Vehicles, Hydrogen Infrastructure & Family Offices"
  },
  {
    city: "Tokyo",
    desk: "Asia Equities & Quantitative Architecture",
    address: "Otemachi Financial City, Tokyo, Japan",
    lead: "Kenji Takahashi",
    status: "CLOSED • RE-OPENING 09:00 JST",
    focus: "Semiconductor Memory, Robotics & Central Bank FX Telemetry"
  },
  {
    city: "Frankfurt",
    desk: "European Central Bank & Industrial Power",
    address: "Taunusanlage 8, Frankfurt am Main, Germany",
    lead: "Erich von Weber",
    status: "OPEN • LIVE TRADING",
    focus: "Eurozone Liquidity, Nuclear Energy PPAs & Industrial Debt"
  }
];

// Helper functions for router
export function findArticleBySlugOrId(slugOrId, scrapedArticles = [], aiArticles = []) {
  let storedAi = [];
  try {
    storedAi = JSON.parse(localStorage.getItem('trinity_ai_articles') || '[]');
  } catch {}
  const all = [...aiArticles, ...storedAi, ...ARTICLES, ...scrapedArticles];
  const target = decodeURIComponent(slugOrId || '').toLowerCase().trim();
  return all.find(a => (a.slug && a.slug.toLowerCase().trim() === target) || (a.id && a.id.toLowerCase().trim() === target));
}

export function findArticlesByCategorySlug(catSlug, scrapedArticles = [], aiArticles = []) {
  let storedAi = [];
  try {
    storedAi = JSON.parse(localStorage.getItem('trinity_ai_articles') || '[]');
  } catch {}
  const all = [...aiArticles, ...storedAi, ...ARTICLES, ...scrapedArticles];
  const catData = CATEGORY_MAP[catSlug];
  if (!catData) return all;
  return all.filter(a => a.category === catData.name || a.categorySlug === catSlug);
}

export function findTickerBySymbol(sym) {
  const cleanSym = (sym || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return MARKET_DATA.find(m => m.symbol.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() === cleanSym) || MARKET_DATA[0];
}

export function findPerspectiveBySlugOrId(slugOrId) {
  return EDITORIAL_OPINIONS.find(o => o.slug === slugOrId || o.id === slugOrId) || EDITORIAL_OPINIONS[0];
}
