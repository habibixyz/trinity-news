/**
 * TRINITY MARKETS — Institutional Editorial Image Resolution Engine
 * 
 * Maps news headlines & beats to high-resolution, context-specific editorial photography.
 * Prevents identical image recycling across daily edition dispatches.
 */

export const TOPIC_RULES = [
  // 1. Aerospace, Defense, Space & Space Tech
  {
    keywords: ['spacex', 'rocket', 'satellite', 'aerospace', 'space', 'orbit', 'nasa', 'boeing', 'lockheed', 'missile', 'defense'],
    images: [
      'https://images.unsplash.com/photo-1517976487502-5f69c7e09ef7?w=1200&auto=format&fit=crop&q=80', // Rocket launch
      'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=1200&auto=format&fit=crop&q=80', // Rocket stage
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80', // Earth from orbit
      'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=1200&auto=format&fit=crop&q=80', // Spacecraft
      'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1200&auto=format&fit=crop&q=80'  // Galaxy telescope
    ]
  },

  // 2. Tesla, Electric Vehicles, Flying Cars & Autonomous Mobility
  {
    keywords: ['tesla', 'flying car', 'musk', 'electric vehicle', 'ev', 'robotaxi', 'autonomous', 'automotive', 'supercharger', 'rivian', 'byd'],
    images: [
      'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1200&auto=format&fit=crop&q=80', // Tesla Model S
      'https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=1200&auto=format&fit=crop&q=80', // EV charging
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&auto=format&fit=crop&q=80', // Cyber aerodynamic car
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&auto=format&fit=crop&q=80', // Luxury vehicle
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&auto=format&fit=crop&q=80'  // Modern sleek vehicle
    ]
  },

  // 3. Semiconductors, Microchips, Nvidia, AMD, TSMC & Silicon
  {
    keywords: ['chip', 'chips', 'chipmaker', 'semiconductor', 'nvidia', 'amd', 'intel', 'tsmc', 'wafer', 'arm', 'broadcom', 'qualcomm', 'micron'],
    images: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80', // Microchip architecture
      'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1200&auto=format&fit=crop&q=80', // Silicon processor
      'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=1200&auto=format&fit=crop&q=80', // Circuitry gold traces
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80'  // High tech fabrication
    ]
  },

  // 4. Data Centers, CoreWeave, Cloud Compute & AI Infrastructure
  {
    keywords: ['data center', 'datacenter', 'coreweave', 'cloud', 'servers', 'compute', 'server', 'rack', 'supercomputer'],
    images: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&auto=format&fit=crop&q=80', // Server rack corridor
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&auto=format&fit=crop&q=80', // High-density cloud racks
      'https://images.unsplash.com/photo-1597852074816-d933c4d2b988?w=1200&auto=format&fit=crop&q=80', // Server blades
      'https://images.unsplash.com/photo-1520869562399-e772f312f722?w=1200&auto=format&fit=crop&q=80'  // Glowing network cables
    ]
  },

  // 5. Artificial Intelligence, ChatGPT, OpenAI, Algorithms & Frontier Tech
  {
    keywords: ['ai', 'artificial intelligence', 'chatgpt', 'openai', 'llm', 'anthropic', 'deepseek', 'copilot', 'algorithm', 'robot', 'automation'],
    images: [
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&auto=format&fit=crop&q=80', // AI neural visualization
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop&q=80', // AI digital mind
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80', // Cyber code flow
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&auto=format&fit=crop&q=80'  // Autonomous robotics
    ]
  },

  // 6. Apple, iPhone, iPad, Mac & Consumer Tech
  {
    keywords: ['apple', 'iphone', 'ipad', 'macbook', 'surface', 'laptop', 'googlebook', 'android', 'device', 'smartphone'],
    images: [
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=1200&auto=format&fit=crop&q=80', // Apple iPhone dark
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&auto=format&fit=crop&q=80', // MacBook pro workspace
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=1200&auto=format&fit=crop&q=80', // iPad tablet
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&auto=format&fit=crop&q=80', // Clean tech laptop
      'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&auto=format&fit=crop&q=80'  // Future laptop screen
    ]
  },

  // 7. Federal Reserve, Inflation, Central Banks, Treasury Yields & Macro
  {
    keywords: ['inflation', 'fed', 'federal reserve', 'powell', 'warsh', 'central bank', 'treasury', 'yield', 'rate cuts', 'rate cut', 'rates', 'monetary', 'bonds', 'imf'],
    images: [
      'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&auto=format&fit=crop&q=80', // Currency bank notes
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&auto=format&fit=crop&q=80', // Central bank pillars
      'https://images.unsplash.com/photo-1621981386829-9b458a2cddde?w=1200&auto=format&fit=crop&q=80', // Global foreign exchange
      'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=1200&auto=format&fit=crop&q=80', // Sovereign currency stack
      'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=1200&auto=format&fit=crop&q=80'  // Government treasury dome
    ]
  },

  // 8. Stock Market, Wall Street, NYSE, Nasdaq, Dow & Earnings
  {
    keywords: ['dow', 'nasdaq', 's&p', 'wall street', 'stocks', 'stock market', 'equities', 'earnings', 'rally', 'slide', 'plunge', 'jump', 'investors'],
    images: [
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80', // Green candlestick rally
      'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&auto=format&fit=crop&q=80', // Multi-monitor trading floor
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80', // Wall Street financial district
      'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=1200&auto=format&fit=crop&q=80', // Trading desk telemetry
      'https://images.unsplash.com/photo-1642543491380-4966a33719b2?w=1200&auto=format&fit=crop&q=80', // Wall St architectural flag
      'https://images.unsplash.com/photo-1612010167108-3e6b327405f0?w=1200&auto=format&fit=crop&q=80'  // Real-time market terminals
    ]
  },

  // 9. Crude Oil, Petroleum, Energy, Gas, OPEC & Tankers
  {
    keywords: ['oil', 'crude', 'petroleum', 'energy', 'gas', 'opec', 'refinery', 'barrel', 'fuel', 'pipeline', 'tanker'],
    images: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80', // Offshore oil rig platform
      'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=1200&auto=format&fit=crop&q=80', // Industrial refinery towers
      'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200&auto=format&fit=crop&q=80', // Power transmission lines
      'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=1200&auto=format&fit=crop&q=80', // Solar clean energy grid
      'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&auto=format&fit=crop&q=80'  // Heavy industrial energy
    ]
  },

  // 10. Gold, Silver, Mining, Copper, Uranium & Commodities
  {
    keywords: ['gold', 'silver', 'metals', 'mining', 'copper', 'uranium', 'bullion', 'commodities', 'commodity'],
    images: [
      'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=1200&auto=format&fit=crop&q=80', // Gold bullion bars
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1200&auto=format&fit=crop&q=80', // Pure gold bullion
      'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=1200&auto=format&fit=crop&q=80', // Mining quarry industrial
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&auto=format&fit=crop&q=80'  // Natural resources landscape
    ]
  },

  // 11. Consumer Brands, Retail, Food, Apparel (KFC, Pepsi, Coke, Nike, etc.)
  {
    keywords: ['kfc', 'coca-cola', 'coke', 'pepsi', 'nike', 'restaurant', 'fast food', 'retail', 'consumer', 'beverage', 'brand', 'sneaker', 'apparel'],
    images: [
      'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=1200&auto=format&fit=crop&q=80', // Classic cold cola bottle
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&auto=format&fit=crop&q=80', // Nike red athletic shoe
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80', // Restaurant dining venue
      'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80', // Modern retail boutique
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80'  // Hospitality dining table
    ]
  },

  // 12. Commercial Real Estate, REITs, Towers, Property & Architecture
  {
    keywords: ['real estate', 'commercial real estate', 'reit', 'property', 'tower', 'skyscraper', 'building', 'lease', 'tenant', 'office space'],
    images: [
      'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=1200&auto=format&fit=crop&q=80', // Modern glass office tower
      'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80', // Urban architectural skyline
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80', // High-end commercial building
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80'  // Corporate headquarters glass
    ]
  },

  // 13. India, Dalal Street, Nifty, Sensex & Emerging Markets
  {
    keywords: ['india', 'dalal street', 'nifty', 'sensex', 'mumbai', 'rbi', 'indonesia', 'asia', 'emerging markets'],
    images: [
      'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&auto=format&fit=crop&q=80', // Mumbai coastal metropolis
      'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&auto=format&fit=crop&q=80', // Modern Indian financial skyline
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&auto=format&fit=crop&q=80', // Monumental architectural heritage
      'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=1200&auto=format&fit=crop&q=80'  // Mumbai night transit
    ]
  },

  // 14. Cryptocurrency, Bitcoin, Ethereum, Solana & Digital Assets
  {
    keywords: ['crypto', 'bitcoin', 'ethereum', 'solana', 'btc', 'eth', 'blockchain', 'token', 'coinbase', 'binance', 'etf'],
    images: [
      'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=1200&auto=format&fit=crop&q=80', // Physical Bitcoin gold coin
      'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=1200&auto=format&fit=crop&q=80', // Ethereum digital symbol
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&auto=format&fit=crop&q=80', // Cryptographic blockchain node
      'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=1200&auto=format&fit=crop&q=80'  // Digital crypto charts
    ]
  },

  // 15. Global Trade, Shipping, Ports, Logistics & Tariffs
  {
    keywords: ['trade', 'tariff', 'tariffs', 'shipping', 'cargo', 'freight', 'port', 'supply chain', 'sanctions', 'customs', 'export'],
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80', // Container shipping cranes
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&auto=format&fit=crop&q=80', // Cargo ship navigating sea
      'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=1200&auto=format&fit=crop&q=80', // Global logistics transit
      'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1200&auto=format&fit=crop&q=80'  // Port containers stack
    ]
  },

  // 16. Banking, Wall Street, FinTech & Credit Syndicates
  {
    keywords: ['bank', 'banking', 'jpmorgan', 'goldman', 'morgan stanley', 'fintech', 'lending', 'debt', 'credit', 'syndicate'],
    images: [
      'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=1200&auto=format&fit=crop&q=80', // Classical financial institution
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80', // Skyscraper corporate headquarters
      'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&auto=format&fit=crop&q=80', // Executive strategic consultation
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&auto=format&fit=crop&q=80'  // Financial analysis review
    ]
  },

  // 17. Private Equity, Venture Capital, Buyouts & Acquisitions
  {
    keywords: ['private equity', 'venture capital', 'vc', 'buyout', 'acquisition', 'merger', 'dry powder', 'sponsor', 'funding'],
    images: [
      'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&auto=format&fit=crop&q=80', // Boardroom deal negotiation
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&auto=format&fit=crop&q=80', // Capital investment documents
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80', // Executive corporate presence
      'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&auto=format&fit=crop&q=80'  // Collaborative strategy session
    ]
  }
];

// Fallback pool of unique corporate / institutional photos per desk
export const DESK_FALLBACK_POOLS = {
  'trending': [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1642543491380-4966a33719b2?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1612010167108-3e6b327405f0?w=1200&auto=format&fit=crop&q=80'
  ],
  'ai-and-frontier-tech': [
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&auto=format&fit=crop&q=80'
  ],
  'stocks-and-equities': [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535320903710-d993d3d77d29?w=1200&auto=format&fit=crop&q=80'
  ],
  'macro-and-banking': [
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=1200&auto=format&fit=crop&q=80'
  ],
  'indian-markets': [
    'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?w=1200&auto=format&fit=crop&q=80'
  ],
  'crypto-and-digital-assets': [
    'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=1200&auto=format&fit=crop&q=80'
  ],
  'energy-and-commodities': [
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=1200&auto=format&fit=crop&q=80'
  ],
  'private-equity-and-vc': [
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&auto=format&fit=crop&q=80'
  ],
  'global-trade': [
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1200&auto=format&fit=crop&q=80'
  ],
  'commercial-real-estate': [
    'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80'
  ],
  'banking-and-fintech': [
    'https://images.unsplash.com/photo-1501167786227-4cba60f6d58f?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1621981386829-9b458a2cddde?w=1200&auto=format&fit=crop&q=80'
  ],
  'policy-and-ratecuts': [
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=1200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=1200&auto=format&fit=crop&q=80'
  ]
};

/**
 * Resolves a context-accurate, non-repeating editorial image for an article headline.
 * 
 * @param {string} headline - The article headline
 * @param {string} categorySlug - The beat slug (e.g. 'trending', 'ai-and-frontier-tech')
 * @param {Set<string>} usedImages - Set of already assigned image URLs to prevent duplicates
 * @returns {string} High-res Unsplash image URL
 */
export function resolveEditorialImage(headline, categorySlug = 'trending', usedImages = new Set()) {
  const normTitle = (headline || '').toLowerCase();

  // 1. Check specific topic rules first
  for (const rule of TOPIC_RULES) {
    const matched = rule.keywords.some(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      return regex.test(normTitle);
    });

    if (matched) {
      // Find an unused image in this topic pool
      for (const img of rule.images) {
        if (!usedImages.has(img)) {
          usedImages.add(img);
          return img;
        }
      }
      // If all images in rule were used, return the first one with a distinct query variant
      const chosen = rule.images[Math.floor(Math.random() * rule.images.length)];
      return chosen;
    }
  }

  // 2. Check desk-specific fallback pool
  const deskPool = DESK_FALLBACK_POOLS[categorySlug] || DESK_FALLBACK_POOLS['trending'];
  for (const img of deskPool) {
    if (!usedImages.has(img)) {
      usedImages.add(img);
      return img;
    }
  }

  // 3. Fallback to any random desk image
  return deskPool[Math.floor(Math.random() * deskPool.length)];
}
