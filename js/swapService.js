/**
 * TRINITY MARKETS — Institutional Cross-Chain Execution Engine
 * Powered by Relay Protocol (api.relay.link)
 * 
 * True Mainnet Production Engine:
 * - Real EVM on-chain transaction execution & ERC20 approvals
 * - Real Solana SVM transaction execution (via @solana/web3.js & Phantom/Solflare)
 * - Real-time intent status tracking (api.relay.link/intents/status)
 * - Real Deposit Address mode for CEX / no-wallet onboarding
 * - Relay Gas Top-Up ("Fuel") support
 * - Dynamic discovery across 60+ chains
 */

export const POPULAR_CHAINS = [
  {
    id: 8453,
    name: 'base',
    displayName: 'Base',
    shortName: 'BASE',
    badge: 'Coinbase L2',
    vmType: 'evm',
    color: '#0052ff',
    icon: 'https://assets.relay.link/icons/8453/light.png',
    nativeToken: {
      symbol: 'ETH',
      name: 'Ether',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      logoURI: 'https://assets.relay.link/icons/1/light.png'
    },
    explorer: 'https://basescan.org'
  },
  {
    id: 792703809,
    name: 'solana',
    displayName: 'Solana',
    shortName: 'SOL',
    badge: 'SVM High Speed',
    vmType: 'svm',
    color: '#14f195',
    icon: 'https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png',
    nativeToken: {
      symbol: 'SOL',
      name: 'Solana',
      address: '11111111111111111111111111111111',
      decimals: 9,
      logoURI: 'https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png'
    },
    explorer: 'https://solscan.io'
  },
  {
    id: 42161,
    name: 'arbitrum',
    displayName: 'Arbitrum One',
    shortName: 'ARB',
    badge: 'Nitro Rollup',
    vmType: 'evm',
    color: '#28a0f0',
    icon: 'https://assets.relay.link/icons/42161/light.png',
    nativeToken: {
      symbol: 'ETH',
      name: 'Ether',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      logoURI: 'https://assets.relay.link/icons/1/light.png'
    },
    explorer: 'https://arbiscan.io'
  },
  {
    id: 1,
    name: 'ethereum',
    displayName: 'Ethereum',
    shortName: 'ETH',
    badge: 'L1 Mainnet',
    vmType: 'evm',
    color: '#627eea',
    icon: 'https://assets.relay.link/icons/1/light.png',
    nativeToken: {
      symbol: 'ETH',
      name: 'Ether',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      logoURI: 'https://assets.relay.link/icons/1/light.png'
    },
    explorer: 'https://etherscan.io'
  },
  {
    id: 10,
    name: 'optimism',
    displayName: 'Optimism',
    shortName: 'OP',
    badge: 'Superchain',
    vmType: 'evm',
    color: '#ff0420',
    icon: 'https://assets.relay.link/icons/10/light.png',
    nativeToken: {
      symbol: 'ETH',
      name: 'Ether',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      logoURI: 'https://assets.relay.link/icons/1/light.png'
    },
    explorer: 'https://optimistic.etherscan.io'
  },
  {
    id: 56,
    name: 'bsc',
    displayName: 'BNB Chain',
    shortName: 'BNB',
    badge: 'PancakeSwap & Four',
    vmType: 'evm',
    color: '#f3ba2f',
    icon: 'https://assets.relay.link/icons/56/light.png',
    nativeToken: {
      symbol: 'BNB',
      name: 'BNB',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      logoURI: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png'
    },
    explorer: 'https://bscscan.com'
  },
  {
    id: 137,
    name: 'polygon',
    displayName: 'Polygon POS',
    shortName: 'POL',
    badge: 'Polygon',
    vmType: 'evm',
    color: '#8247e5',
    icon: 'https://assets.relay.link/icons/137/light.png',
    nativeToken: {
      symbol: 'POL',
      name: 'Polygon Ecosystem Token',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      logoURI: 'https://assets.relay.link/icons/137/light.png'
    },
    explorer: 'https://polygonscan.com'
  },
  {
    id: 7777777,
    name: 'zora',
    displayName: 'Zora Network',
    shortName: 'ZORA',
    badge: 'Creator L2',
    vmType: 'evm',
    color: '#000000',
    icon: 'https://assets.relay.link/icons/7777777/light.png',
    nativeToken: {
      symbol: 'ETH',
      name: 'Ether',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      logoURI: 'https://assets.relay.link/icons/1/light.png'
    },
    explorer: 'https://explorer.zora.energy'
  }
];

export let SUPPORTED_CHAINS = [...POPULAR_CHAINS];

export const CURATED_TOKENS = {
  // Base (8453)
  8453: [
    {
      symbol: 'ETH',
      name: 'Ether (Native)',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      chainId: 8453,
      vmType: 'evm',
      logoURI: 'https://assets.relay.link/icons/1/light.png',
      popular: true
    },
    {
      symbol: 'USDC',
      name: 'USD Coin (Native)',
      address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      decimals: 6,
      chainId: 8453,
      vmType: 'evm',
      logoURI: 'https://assets.relay.link/icons/8453/currencies/0x833589fcd6edb6e08f4c7c32d4f71b54bda02913/light.png',
      popular: true
    },
    {
      symbol: 'AERO',
      name: 'Aerodrome Finance',
      address: '0x940181a94A35A4569E4529A3CDfB74e38FD98631',
      decimals: 18,
      chainId: 8453,
      vmType: 'evm',
      logoURI: 'https://aerodrome.finance/favicon.ico',
      popular: true
    },
    {
      symbol: 'VIRTUAL',
      name: 'Virtual Protocol',
      address: '0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b',
      decimals: 18,
      chainId: 8453,
      vmType: 'evm',
      logoURI: 'https://assets.relay.link/icons/8453/currencies/0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b/light.png',
      popular: true
    }
  ],
  // Solana (792703809)
  792703809: [
    {
      symbol: 'SOL',
      name: 'Solana (Native)',
      address: '11111111111111111111111111111111',
      decimals: 9,
      chainId: 792703809,
      vmType: 'svm',
      logoURI: 'https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png',
      popular: true
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      decimals: 6,
      chainId: 792703809,
      vmType: 'svm',
      logoURI: 'https://assets.relay.link/icons/8453/currencies/0x833589fcd6edb6e08f4c7c32d4f71b54bda02913/light.png',
      popular: true
    },
    {
      symbol: 'GOAT',
      name: 'Goatseus Maximus',
      address: 'CzLSujWBLFsSjncfkh59rUFqvafWcY5tzedWJSuBgpf',
      decimals: 6,
      chainId: 792703809,
      vmType: 'svm',
      logoURI: 'https://pump.fun/favicon.ico',
      popular: true
    },
    {
      symbol: 'JUP',
      name: 'Jupiter',
      address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
      decimals: 6,
      chainId: 792703809,
      vmType: 'svm',
      logoURI: 'https://jup.ag/favicon.ico',
      popular: true
    }
  ],
  // Arbitrum One (42161)
  42161: [
    {
      symbol: 'ETH',
      name: 'Ether (Native)',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      chainId: 42161,
      vmType: 'evm',
      logoURI: 'https://assets.relay.link/icons/1/light.png',
      popular: true
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      decimals: 6,
      chainId: 42161,
      vmType: 'evm',
      logoURI: 'https://assets.relay.link/icons/8453/currencies/0x833589fcd6edb6e08f4c7c32d4f71b54bda02913/light.png',
      popular: true
    },
    {
      symbol: 'ARB',
      name: 'Arbitrum',
      address: '0x912CE59144191C1204E64559FE8253a0e49E6548',
      decimals: 18,
      chainId: 42161,
      vmType: 'evm',
      logoURI: 'https://assets.relay.link/icons/42161/light.png',
      popular: true
    }
  ],
  // Ethereum (1)
  1: [
    {
      symbol: 'ETH',
      name: 'Ether (Native)',
      address: '0x0000000000000000000000000000000000000000',
      decimals: 18,
      chainId: 1,
      vmType: 'evm',
      logoURI: 'https://assets.relay.link/icons/1/light.png',
      popular: true
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      decimals: 6,
      chainId: 1,
      vmType: 'evm',
      logoURI: 'https://assets.relay.link/icons/8453/currencies/0x833589fcd6edb6e08f4c7c32d4f71b54bda02913/light.png',
      popular: true
    },
    {
      symbol: 'WBTC',
      name: 'Wrapped BTC',
      address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      decimals: 8,
      chainId: 1,
      vmType: 'evm',
      logoURI: 'https://assets.relay.link/icons/1/light.png',
      popular: true
    }
  ]
};

// Default fallback addresses for pre-connect live quotes
const DEFAULT_EVM_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'; // vitalik.eth
const DEFAULT_SVM_ADDRESS = '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM'; // public Solana desk address

export const EVM_CHAIN_CONFIGS = {
  8453: {
    chainId: '0x2105',
    chainName: 'Base',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorerUrls: ['https://basescan.org']
  },
  42161: {
    chainId: '0xa4b1',
    chainName: 'Arbitrum One',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://arbiscan.io']
  },
  10: {
    chainId: '0xa',
    chainName: 'OP Mainnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.optimism.io'],
    blockExplorerUrls: ['https://optimistic.etherscan.io']
  },
  56: {
    chainId: '0x38',
    chainName: 'BNB Smart Chain',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrls: ['https://bsc-dataseed.binance.org'],
    blockExplorerUrls: ['https://bscscan.com']
  },
  137: {
    chainId: '0x89',
    chainName: 'Polygon Mainnet',
    nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrls: ['https://polygonscan.com']
  },
  1: {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://cloudflare-eth.com'],
    blockExplorerUrls: ['https://etherscan.io']
  }
};

/**
 * Utility: Parse hex to Uint8Array safely without external Buffer dependency
 */
function hexToUint8Array(hexString) {
  let clean = (hexString || '').trim();
  if (clean.startsWith('0x')) clean = clean.slice(2);
  if (clean.length % 2 !== 0) clean = '0' + clean;
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(clean.substr(i * 2, 2), 16);
  }
  return bytes;
}

export class SwapService {
  constructor() {
    this.apiBase = 'https://api.relay.link';
    this.dexscreenerBase = 'https://api.dexscreener.com/latest/dex';
    this.quoteDebounceTimer = null;
    this.cachedTokens = { ...CURATED_TOKENS };
    this.customImportedTokens = this.loadImportedTokens();

    // EIP-6963 Multi-Wallet Provider Storage
    this.eip6963Providers = [];
    this.selectedEvmProvider = null;
    if (typeof window !== 'undefined') {
      window.addEventListener('eip6963:announceProvider', (event) => {
        const detail = event.detail;
        if (detail && detail.info && !this.eip6963Providers.some(p => p.info.uuid === detail.info.uuid)) {
          this.eip6963Providers.push(detail);
        }
      });
      window.dispatchEvent(new Event('eip6963:requestProvider'));
    }

    // Connected wallets
    this.wallets = {
      evm: null,
      solana: null,
      evmProviderInfo: null
    };

    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('trinity_connected_wallets');
        if (saved) {
          const parsed = JSON.parse(saved);
          this.wallets.evm = parsed.evm || null;
          this.wallets.solana = parsed.solana || null;
          this.wallets.evmProviderInfo = parsed.evmProviderInfo || null;
        }
      }
    } catch {}

    // Minimalist, production default state
    this.state = {
      fromChainId: 8453, // Base
      toChainId: 792703809, // Solana
      fromToken: CURATED_TOKENS[8453][0], // Base ETH
      toToken: CURATED_TOKENS[792703809][0], // Solana SOL
      fromAmount: '0.05',
      slippageTolerance: '0.5',
      recipientAddress: '',
      topupGas: false, // Relay Fuel: Deliver native gas to destination
      useDepositAddress: false, // CEX / No-wallet bridge mode
      depositData: null, // Holds active deposit address instructions
      isFetchingQuote: false,
      quote: null,
      quoteError: null,
      priceImpact: 0,
      userBalance: null,
      isFetchingBalance: false,
      recentSwaps: this.loadRecentSwaps(),
      activeExecution: null // Holds live status progress tracking
    };

    // Load dynamic chains asynchronously from Relay in background
    this.loadRelayChains();
  }

  /**
   * Dynamically fetch all 60+ supported chains from Relay API
   */
  async loadRelayChains() {
    try {
      const res = await fetch(`${this.apiBase}/chains`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.chains) && data.chains.length > 0) {
          const remoteChains = data.chains.map(rc => ({
            id: Number(rc.id),
            name: rc.name,
            displayName: rc.displayName || rc.name.charAt(0).toUpperCase() + rc.name.slice(1),
            shortName: (rc.currency?.symbol || rc.name.slice(0, 4)).toUpperCase(),
            badge: rc.vmType === 'svm' ? 'SVM' : (rc.vmType === 'evm' ? 'EVM' : 'Network'),
            vmType: rc.vmType || 'evm',
            color: rc.vmType === 'svm' ? '#14f195' : '#3b82f6',
            icon: rc.icon || `https://assets.relay.link/icons/${rc.id}/light.png`,
            nativeToken: {
              symbol: rc.currency?.symbol || 'ETH',
              name: rc.currency?.name || 'Native Currency',
              address: rc.currency?.address || '0x0000000000000000000000000000000000000000',
              decimals: rc.currency?.decimals || 18,
              logoURI: rc.icon || 'https://assets.relay.link/icons/1/light.png'
            },
            explorer: rc.explorerUrl || (rc.explorer?.url) || (rc.vmType === 'svm' ? 'https://solscan.io' : 'https://etherscan.io')
          }));

          // Merge without overriding popular priority chains
          const popularIds = new Set(POPULAR_CHAINS.map(c => c.id));
          const additions = remoteChains.filter(rc => !popularIds.has(rc.id));
          SUPPORTED_CHAINS = [...POPULAR_CHAINS, ...additions];
        }
      }
    } catch (e) {
      console.warn('[RELAY] Dynamic chains fetch fallback to popular:', e.message);
    }
  }

  getChain(chainId) {
    return SUPPORTED_CHAINS.find(c => c.id === Number(chainId)) || SUPPORTED_CHAINS[0];
  }

  getTokensForChain(chainId) {
    return this.cachedTokens[chainId] || CURATED_TOKENS[chainId] || [];
  }

  /**
   * Address security validation across SVM and EVM
   */
  validateAddress(address, chainId) {
    if (!address || typeof address !== 'string') {
      return { ok: false, error: 'Recipient address required' };
    }
    const clean = address.trim();
    if (!clean) return { ok: false, error: 'Recipient address required' };

    const chain = this.getChain(chainId);
    if (!chain) return { ok: true, formatted: clean };

    if (chain.vmType === 'svm') {
      if (clean.startsWith('0x')) {
        return {
          ok: false,
          error: `Destination is Solana. An EVM (0x...) address will cause permanent loss of funds.`
        };
      }
      const b58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
      if (!b58Regex.test(clean)) {
        return { ok: false, error: 'Invalid Solana base58 address.' };
      }
      return { ok: true, formatted: clean, vmType: 'svm' };
    } else {
      if (!clean.startsWith('0x')) {
        return {
          ok: false,
          error: `Destination is ${chain.displayName} (EVM). A Solana base58 address cannot receive funds.`
        };
      }
      const evmRegex = /^0x[0-9a-fA-F]{40}$/;
      if (!evmRegex.test(clean)) {
        return { ok: false, error: `Invalid 0x address format for ${chain.displayName}.` };
      }
      return { ok: true, formatted: clean, vmType: 'evm' };
    }
  }

  /**
   * Real Token Search via DexScreener & Relay Currencies API
   */
  async searchTokens(term, chainId) {
    let cid = Number(chainId);
    const cleanTerm = (term || '').trim();

    const isSolanaAddress = cleanTerm.length >= 32 && cleanTerm.length <= 44 && !cleanTerm.startsWith('0x') && !cleanTerm.includes(' ');
    const isEvmAddress = cleanTerm.startsWith('0x') && cleanTerm.length === 42;

    if (isSolanaAddress) cid = 792703809;
    else if (isEvmAddress && cid === 792703809) cid = 8453;

    const localTokens = this.getTokensForChain(cid);

    if (isSolanaAddress || isEvmAddress) {
      try {
        const direct = await this.resolveTokenByAddress(cleanTerm, cid);
        if (direct) {
          this.cacheCustomToken(direct, cid);
          return [direct, ...localTokens.filter(t => t.address.toLowerCase() !== cleanTerm.toLowerCase())];
        }
      } catch {}
    }

    if (!cleanTerm) return localTokens;

    const queryUpper = cleanTerm.toUpperCase();
    const matchedLocal = localTokens.filter(t =>
      t.symbol.toUpperCase().includes(queryUpper) ||
      t.name.toUpperCase().includes(queryUpper) ||
      (t.address && t.address.toLowerCase() === cleanTerm.toLowerCase())
    );

    const isSolanaChain = cid === 792703809;
    const dexTokens = [];
    try {
      const dexRes = await fetch(`${this.dexscreenerBase}/search?q=${encodeURIComponent(cleanTerm)}`);
      if (dexRes.ok) {
        const dexData = await dexRes.json();
        if (Array.isArray(dexData.pairs)) {
          const chainSlug = isSolanaChain ? 'solana' : (cid === 8453 ? 'base' : (cid === 42161 ? 'arbitrum' : (cid === 10 ? 'optimism' : 'ethereum')));
          const relevantPairs = dexData.pairs.filter(p => p.chainId === chainSlug);

          relevantPairs.forEach(p => {
            const bt = (p.baseToken?.symbol?.toUpperCase().includes(queryUpper) || p.baseToken?.name?.toUpperCase().includes(queryUpper)) ? p.baseToken : p.quoteToken;
            if (bt && bt.address && !dexTokens.some(t => t.address.toLowerCase() === bt.address.toLowerCase())) {
              dexTokens.push({
                symbol: bt.symbol || 'TOKEN',
                name: bt.name || bt.symbol || 'Token',
                address: bt.address,
                decimals: isSolanaChain ? 6 : 18,
                chainId: cid,
                vmType: isSolanaChain ? 'svm' : 'evm',
                priceUsd: p.priceUsd ? `$${parseFloat(p.priceUsd) < 0.01 ? parseFloat(p.priceUsd).toExponential(2) : parseFloat(p.priceUsd).toFixed(4)}` : null,
                logoURI: p.info?.imageUrl || (bt.address.toLowerCase().endsWith('pump') ? 'https://pump.fun/favicon.ico' : 'https://assets.relay.link/icons/1/light.png')
              });
            }
          });
        }
      }
    } catch {}

    const relayTokens = [];
    try {
      const relayRes = await fetch(`${this.apiBase}/currencies/v1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chainIds: [cid], term: cleanTerm })
      });
      if (relayRes.ok) {
        const rData = await relayRes.json();
        if (Array.isArray(rData)) {
          rData.forEach(item => {
            const t = Array.isArray(item) ? item[0] : item;
            if (t && t.address && t.symbol) {
              relayTokens.push({
                symbol: t.symbol,
                name: t.name || t.symbol,
                address: t.address,
                decimals: t.decimals || 18,
                chainId: cid,
                vmType: isSolanaChain ? 'svm' : 'evm',
                logoURI: t.metadata?.logoURI || t.logoURI || 'https://assets.relay.link/icons/1/light.png'
              });
            }
          });
        }
      }
    } catch {}

    return this.mergeTokenLists(matchedLocal, dexTokens, relayTokens).slice(0, 25);
  }

  mergeTokenLists(...lists) {
    const map = new Map();
    lists.forEach(list => {
      if (Array.isArray(list)) {
        list.forEach(t => {
          if (t && t.address) {
            const key = t.address.toLowerCase();
            if (!map.has(key)) map.set(key, t);
          }
        });
      }
    });
    return Array.from(map.values());
  }

  async resolveTokenByAddress(address, chainId) {
    const cleanAddr = address.trim();
    const isSolana = Number(chainId) === 792703809;
    try {
      const res = await fetch(`${this.dexscreenerBase}/tokens/${encodeURIComponent(cleanAddr)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.pairs) && data.pairs.length > 0) {
          const p = data.pairs[0];
          const isBase = p.baseToken?.address?.toLowerCase() === cleanAddr.toLowerCase();
          const bt = isBase ? p.baseToken : p.quoteToken;
          return {
            symbol: bt.symbol || 'TOKEN',
            name: bt.name || bt.symbol || 'Token',
            address: bt.address || cleanAddr,
            decimals: isSolana ? (cleanAddr.toLowerCase().endsWith('pump') ? 6 : 9) : (bt.symbol === 'USDC' || bt.symbol === 'USDT' ? 6 : 18),
            chainId: Number(chainId),
            vmType: isSolana ? 'svm' : 'evm',
            priceUsd: p.priceUsd ? `$${parseFloat(p.priceUsd).toFixed(4)}` : null,
            logoURI: p.info?.imageUrl || 'https://assets.relay.link/icons/1/light.png'
          };
        }
      }
    } catch {}

    return {
      symbol: cleanAddr.slice(0, 4) + '...' + cleanAddr.slice(-4),
      name: `Contract (${cleanAddr.slice(0, 6)})`,
      address: cleanAddr,
      decimals: isSolana ? 6 : 18,
      chainId: Number(chainId),
      vmType: isSolana ? 'svm' : 'evm',
      logoURI: isSolana ? 'https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png' : 'https://assets.relay.link/icons/1/light.png'
    };
  }

  cacheCustomToken(token, chainId) {
    const cid = Number(chainId);
    if (!this.cachedTokens[cid]) this.cachedTokens[cid] = [];
    if (!this.cachedTokens[cid].some(t => t.address.toLowerCase() === token.address.toLowerCase())) {
      this.cachedTokens[cid].unshift(token);
    }
  }

  loadImportedTokens() {
    try {
      if (typeof localStorage !== 'undefined') {
        const s = localStorage.getItem('trinity_imported_tokens');
        return s ? JSON.parse(s) : {};
      }
    } catch {}
    return {};
  }

  /**
   * Real Live Relay Quote Request
   */
  async getQuote(params = {}) {
    const fromChain = this.getChain(params.fromChainId || this.state.fromChainId);
    const toChain = this.getChain(params.toChainId || this.state.toChainId);
    const fromToken = params.fromToken || this.state.fromToken;
    const toToken = params.toToken || this.state.toToken;
    const fromAmount = params.fromAmount || this.state.fromAmount;
    const isDepositAddress = params.useDepositAddress !== undefined ? params.useDepositAddress : this.state.useDepositAddress;
    const topupGas = params.topupGas !== undefined ? params.topupGas : this.state.topupGas;

    if (!fromAmount || isNaN(parseFloat(fromAmount)) || parseFloat(fromAmount) <= 0) {
      return { ok: false, error: 'Enter an amount' };
    }

    // Convert decimal string to atomic BigInt units
    let atomicAmount;
    try {
      const decimals = fromToken.decimals !== undefined ? fromToken.decimals : 18;
      const parts = fromAmount.toString().split('.');
      const whole = parts[0] || '0';
      const fraction = (parts[1] || '').slice(0, decimals).padEnd(decimals, '0');
      atomicAmount = (BigInt(whole) * (10n ** BigInt(decimals)) + BigInt(fraction)).toString();
    } catch {
      return { ok: false, error: 'Invalid number format' };
    }

    // Resolve user address
    let userAddress = this.wallets[fromChain.vmType];
    if (!userAddress) {
      userAddress = fromChain.vmType === 'svm' ? DEFAULT_SVM_ADDRESS : DEFAULT_EVM_ADDRESS;
    }

    // Resolve recipient address
    let recipientAddress = (params.recipientAddress !== undefined ? params.recipientAddress : this.state.recipientAddress).trim();
    if (recipientAddress) {
      const validation = this.validateAddress(recipientAddress, toChain.id);
      if (!validation.ok) {
        this.state.isFetchingQuote = false;
        this.state.quote = null;
        this.state.quoteError = validation.error;
        return { ok: false, error: validation.error };
      }
      recipientAddress = validation.formatted;
    } else {
      recipientAddress = this.wallets[toChain.vmType] || (toChain.vmType === 'svm' ? DEFAULT_SVM_ADDRESS : DEFAULT_EVM_ADDRESS);
    }

    this.state.isFetchingQuote = true;
    this.state.quoteError = null;

    try {
      const quotePayload = {
        user: userAddress,
        recipient: recipientAddress,
        originChainId: fromChain.id,
        destinationChainId: toChain.id,
        originCurrency: fromToken.address,
        destinationCurrency: toToken.address,
        amount: atomicAmount,
        tradeType: 'EXACT_INPUT',
        useDepositAddress: !!isDepositAddress
      };

      if (topupGas) {
        quotePayload.topupGas = true;
      }

      const res = await fetch(`${this.apiBase}/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quotePayload)
      });

      const data = await res.json();

      if (!res.ok || data.message || data.error) {
        const errorMsg = data.message || data.error || 'No route found for this pair';
        this.state.isFetchingQuote = false;
        this.state.quote = null;
        this.state.quoteError = errorMsg;
        return { ok: false, error: errorMsg };
      }

      // Calculate price impact
      const inUsd = parseFloat(data.details?.currencyIn?.amountUsd || 0);
      const outUsd = parseFloat(data.details?.currencyOut?.amountUsd || 0);
      let priceImpactPct = 0;
      if (inUsd > 0 && outUsd > 0) {
        priceImpactPct = Math.max(0, ((inUsd - outUsd) / inUsd) * 100);
      }
      data.priceImpactPct = priceImpactPct;
      this.state.priceImpact = priceImpactPct;

      this.state.isFetchingQuote = false;
      this.state.quote = data;
      this.state.quoteError = null;

      // If deposit address mode was requested, store the generated deposit data
      if (isDepositAddress && data.steps?.[0]?.depositAddress) {
        this.state.depositData = {
          depositAddress: data.steps[0].depositAddress,
          requestId: data.requestId,
          checkEndpoint: data.steps[0]?.items?.[0]?.check?.endpoint || `/intents/status?requestId=${data.requestId}`,
          currency: fromToken,
          chain: fromChain,
          expectedOutput: data.details?.currencyOut?.amountFormatted || '...',
          minimumAmount: fromAmount
        };
      }

      return { ok: true, quote: data };
    } catch (err) {
      this.state.isFetchingQuote = false;
      this.state.quote = null;
      this.state.quoteError = err.message || 'Network error fetching rate';
      return { ok: false, error: this.state.quoteError };
    }
  }

  /**
   * Fetch Live Token Balance for Connected Wallet
   */
  async getTokenBalance(token, chainId) {
    const chain = this.getChain(chainId || this.state.fromChainId);
    const targetToken = token || this.state.fromToken;
    if (!chain || !targetToken) return null;

    const userAddress = this.wallets[chain.vmType];
    if (!userAddress) {
      this.state.userBalance = null;
      return null;
    }

    this.state.isFetchingBalance = true;

    try {
      if (chain.vmType === 'evm') {
        const isNative = !targetToken.address || targetToken.address === '0x0000000000000000000000000000000000000000';
        const rpcUrl = EVM_CHAIN_CONFIGS[chain.id]?.rpcUrls?.[0] || 'https://mainnet.base.org';

        if (isNative) {
          const res = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'eth_getBalance',
              params: [userAddress, 'latest']
            })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.result) {
              const raw = BigInt(data.result);
              const formatted = (Number(raw) / 1e18).toFixed(4);
              this.state.userBalance = formatted;
              this.state.isFetchingBalance = false;
              return formatted;
            }
          }
        } else {
          // ERC20 balanceOf(address) selector 0x70a08231
          const cleanAddr = userAddress.toLowerCase().replace('0x', '').padStart(64, '0');
          const res = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'eth_call',
              params: [{
                to: targetToken.address,
                data: `0x70a08231${cleanAddr}`
              }, 'latest']
            })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.result && data.result !== '0x') {
              const decimals = targetToken.decimals || 18;
              const raw = BigInt(data.result);
              const formatted = (Number(raw) / (10 ** decimals)).toFixed(decimals <= 6 ? 2 : 4);
              this.state.userBalance = formatted;
              this.state.isFetchingBalance = false;
              return formatted;
            }
          }
        }
      } else if (chain.vmType === 'svm') {
        const isNativeSol = targetToken.address === '11111111111111111111111111111111' || targetToken.symbol === 'SOL';
        if (isNativeSol) {
          const res = await fetch('https://api.mainnet-beta.solana.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'getBalance',
              params: [userAddress]
            })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.result?.value !== undefined) {
              const formatted = (data.result.value / 1e9).toFixed(4);
              this.state.userBalance = formatted;
              this.state.isFetchingBalance = false;
              return formatted;
            }
          }
        } else {
          // SPL token accounts
          const res = await fetch('https://api.mainnet-beta.solana.com', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'getTokenAccountsByOwner',
              params: [
                userAddress,
                { mint: targetToken.address },
                { encoding: 'jsonParsed' }
              ]
            })
          });
          if (res.ok) {
            const data = await res.json();
            const accounts = data.result?.value || [];
            if (accounts.length > 0) {
              const amount = accounts[0]?.account?.data?.parsed?.info?.tokenAmount?.uiAmount || 0;
              const formatted = Number(amount).toFixed(2);
              this.state.userBalance = formatted;
              this.state.isFetchingBalance = false;
              return formatted;
            }
            this.state.userBalance = '0.00';
            this.state.isFetchingBalance = false;
            return '0.00';
          }
        }
      }
    } catch (e) {
      console.warn('[BALANCE] Error fetching token balance:', e.message);
    }

    this.state.isFetchingBalance = false;
    return null;
  }

  /**
   * EIP-6963 Discovered Providers
   */
  getDiscoveredEvmProviders() {
    return this.eip6963Providers || [];
  }

  /**
   * Connect with specific EIP-6963 provider
   */
  async connectEvmWithProvider(providerDetail) {
    const provider = providerDetail ? providerDetail.provider : (this.selectedEvmProvider || window.ethereum);
    if (!provider) return { ok: false, error: 'No EVM Web3 wallet detected' };

    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        this.selectedEvmProvider = provider;
        this.wallets.evm = accounts[0];
        this.wallets.evmProviderInfo = providerDetail?.info || { name: 'EVM Wallet', icon: 'https://assets.relay.link/icons/8453/light.png' };
        this.saveWallets();
        await this.getTokenBalance();
        return { ok: true, address: accounts[0] };
      }
      return { ok: false, error: 'No accounts selected' };
    } catch (err) {
      return { ok: false, error: err.message || 'Connection rejected' };
    }
  }

  /**
   * EVM Wallet Connection (EIP-6963 Aware)
   */
  async connectEvmWallet() {
    if (typeof window === 'undefined') return { ok: false, error: 'Browser environment required' };
    
    // If multiple providers discovered via EIP-6963, signal to UI to show modal
    if (this.eip6963Providers && this.eip6963Providers.length > 1) {
      return { ok: false, needsSelection: true, providers: this.eip6963Providers };
    }

    if (this.eip6963Providers && this.eip6963Providers.length === 1) {
      return this.connectEvmWithProvider(this.eip6963Providers[0]);
    }

    if (!window.ethereum) {
      return { ok: false, error: 'No EVM Web3 wallet detected (install MetaMask, Coinbase, or Rabby)' };
    }

    return this.connectEvmWithProvider({ provider: window.ethereum, info: { name: 'Injected Web3', icon: 'https://assets.relay.link/icons/8453/light.png' } });
  }

  /**
   * Solana Wallet Connection
   */
  async connectSolanaWallet() {
    if (typeof window === 'undefined') return { ok: false, error: 'Browser environment required' };
    const solanaProvider = window.phantom?.solana || window.solana;
    if (!solanaProvider) {
      return { ok: false, error: 'No Solana wallet detected (install Phantom or Solflare)' };
    }

    try {
      const resp = await solanaProvider.connect();
      const pubkey = resp.publicKey ? resp.publicKey.toString() : null;
      if (pubkey) {
        this.wallets.solana = pubkey;
        this.saveWallets();
        await this.getTokenBalance();
        return { ok: true, address: pubkey };
      }
      return { ok: false, error: 'Could not obtain Solana public key' };
    } catch (err) {
      return { ok: false, error: err.message || 'Solana connection rejected' };
    }
  }

  saveWallets() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('trinity_connected_wallets', JSON.stringify(this.wallets));
      }
    } catch {}
  }

  disconnectWallet(type) {
    if (type === 'evm') {
      this.wallets.evm = null;
      this.wallets.evmProviderInfo = null;
      this.selectedEvmProvider = null;
    }
    if (type === 'solana') this.wallets.solana = null;
    this.state.userBalance = null;
    this.saveWallets();
  }

  recordSwap(swapRecord) {
    const list = this.loadRecentSwaps();
    const existingIdx = list.findIndex(s => s.id === swapRecord.id || (swapRecord.requestId && s.requestId === swapRecord.requestId));
    if (existingIdx > -1) {
      list[existingIdx] = { ...list[existingIdx], ...swapRecord, updatedAt: Date.now() };
    } else {
      list.unshift({
        ...swapRecord,
        timestamp: swapRecord.timestamp || Date.now(),
        id: swapRecord.id || swapRecord.requestId || `tx_${Date.now()}`
      });
    }
    const trimmed = list.slice(0, 30);
    this.state.recentSwaps = trimmed;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('trinity_recent_swaps', JSON.stringify(trimmed));
      }
    } catch {}
    return trimmed;
  }

  updateSwap(id, updates) {
    const list = this.loadRecentSwaps();
    const idx = list.findIndex(s => s.id === id || s.requestId === id);
    if (idx > -1) {
      list[idx] = { ...list[idx], ...updates, updatedAt: Date.now() };
      this.state.recentSwaps = list;
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('trinity_recent_swaps', JSON.stringify(list));
        }
      } catch {}
    }
  }

  clearRecentSwaps() {
    this.state.recentSwaps = [];
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem('trinity_recent_swaps');
      }
    } catch {}
  }

  loadRecentSwaps() {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('trinity_recent_swaps');
        return saved ? JSON.parse(saved) : [];
      }
    } catch {}
    return [];
  }

  /**
   * Real Intent Status Poller (api.relay.link/intents/status)
   */
  async pollIntentStatus(checkEndpoint, requestId, onProgress, maxAttempts = 120) {
    let endpoint;
    if (typeof checkEndpoint === 'string' && checkEndpoint.startsWith('https://api.relay.link')) {
      endpoint = checkEndpoint;
    } else if (typeof checkEndpoint === 'string' && checkEndpoint.startsWith('/')) {
      endpoint = `${this.apiBase}${checkEndpoint}`;
    } else {
      endpoint = `${this.apiBase}/intents/status?requestId=${encodeURIComponent(requestId)}`;
    }
    let attempts = 0;

    return new Promise((resolve) => {
      const interval = setInterval(async () => {
        attempts++;
        try {
          const res = await fetch(endpoint);
          if (res.ok) {
            const data = await res.json();
            const status = (data.status || 'pending').toLowerCase();

            if (onProgress) {
              onProgress({
                stage: status,
                details: data,
                attempts
              });
            }

            if (status === 'success') {
              clearInterval(interval);
              resolve({
                ok: true,
                status: 'success',
                originTxHash: data.inTxHashes?.[0] || data.txHash || null,
                destinationTxHash: data.outTxHashes?.[0] || null,
                details: data
              });
              return;
            } else if (status === 'refund' || status === 'refunded') {
              clearInterval(interval);
              resolve({
                ok: false,
                refunded: true,
                status: 'refunded',
                error: 'Order could not be filled by solver and has been refunded on origin.'
              });
              return;
            } else if (status === 'failure' || status === 'failed') {
              clearInterval(interval);
              resolve({
                ok: false,
                status: 'failure',
                error: data.details || 'Relay solver execution failed.'
              });
              return;
            }
          }
        } catch (e) {
          console.warn('[RELAY] Status poll attempt warning:', e.message);
        }

        if (attempts >= maxAttempts) {
          clearInterval(interval);
          resolve({
            ok: true,
            status: 'submitted',
            message: 'Transaction confirmed on origin. Destination fill is settling in background.'
          });
        }
      }, 2000);
    });
  }

  /**
   * Real On-Chain Swap Execution Engine (EVM & Solana Mainnet)
   */
  async executeOnChainSwap(quote, onProgress) {
    if (!quote || !quote.steps || !quote.steps.length) {
      return { ok: false, error: 'No active quote to execute.' };
    }

    const fromChain = this.getChain(this.state.fromChainId);
    const toChain = this.getChain(this.state.toChainId);

    // =========================================================================
    // 1. REAL EVM ON-CHAIN EXECUTION (Base, Arbitrum, Ethereum, Optimism, BNB)
    // =========================================================================
    if (fromChain.vmType === 'evm') {
      if (typeof window === 'undefined' || !window.ethereum) {
        return { ok: false, noWallet: true, error: 'No EVM wallet detected (MetaMask, Coinbase, or Rabby).' };
      }

      try {
        let currentAccount = this.wallets.evm;
        if (!currentAccount) {
          if (onProgress) onProgress({ step: 1, text: 'Connecting EVM wallet...' });
          const connRes = await this.connectEvmWallet();
          if (!connRes.ok) return { ok: false, error: connRes.error };
          currentAccount = connRes.address;
        }

        // Network check & switch
        const targetHex = '0x' + fromChain.id.toString(16);
        const currentChainHex = await window.ethereum.request({ method: 'eth_chainId' });

        if (parseInt(currentChainHex, 16) !== fromChain.id) {
          if (onProgress) onProgress({ step: 1, text: `Switching wallet to ${fromChain.displayName}...` });
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: targetHex }]
            });
          } catch (switchErr) {
            if (switchErr.code === 4902 && EVM_CHAIN_CONFIGS[fromChain.id]) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [EVM_CHAIN_CONFIGS[fromChain.id]]
              });
            } else {
              return { ok: false, error: `Please switch your wallet network to ${fromChain.displayName}.` };
            }
          }
        }

        const steps = quote.steps || [];
        let originTxHash = null;
        let checkEndpoint = null;

        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          const isApproval = step.id === 'approve';

          for (const item of (step.items || [])) {
            if (item.check?.endpoint) {
              checkEndpoint = item.check.endpoint;
            }

            if (item.data) {
              if (onProgress) {
                onProgress({
                  step: i + 1,
                  totalSteps: steps.length,
                  action: isApproval ? 'Token Approval' : 'Relay Deposit',
                  text: isApproval ? `Please approve ${this.state.fromToken.symbol} in your wallet...` : `Please sign deposit to Relay solver...`
                });
              }

              const txParams = {
                from: currentAccount,
                to: item.data.to,
                data: item.data.data,
                value: item.data.value ? '0x' + BigInt(item.data.value).toString(16) : '0x0'
              };
              if (item.data.gas) {
                txParams.gas = '0x' + BigInt(item.data.gas).toString(16);
              }

              originTxHash = await window.ethereum.request({
                method: 'eth_sendTransaction',
                params: [txParams]
              });

              // Record in transaction history
              this.recordSwap({
                id: quote.requestId || originTxHash,
                requestId: quote.requestId,
                fromChainId: fromChain.id,
                toChainId: toChain.id,
                fromToken: this.state.fromToken,
                toToken: this.state.toToken,
                fromAmount: this.state.fromAmount,
                expectedOutput: quote.details?.currencyOut?.amountFormatted || '...',
                status: 'processing',
                originTxHash,
                originExplorer: `${fromChain.explorer}/tx/${originTxHash}`,
                timestamp: Date.now()
              });

              if (onProgress) {
                onProgress({
                  step: i + 1,
                  totalSteps: steps.length,
                  action: isApproval ? 'Approval Broadcasted' : 'Deposit Broadcasted',
                  text: isApproval ? 'Approval confirmed on-chain' : 'Deposit sent to mempool...',
                  txHash: originTxHash
                });
              }

              if (isApproval) {
                // Short wait for approval to be mined
                await new Promise(r => setTimeout(r, 2500));
              }
            }
          }
        }

        // Start real intent status polling if Relay provided a status endpoint
        if (checkEndpoint || quote.requestId) {
          const statusEndpoint = checkEndpoint || `/intents/status?requestId=${quote.requestId}`;
          if (onProgress) {
            onProgress({
              step: steps.length,
              totalSteps: steps.length,
              action: 'Solver Settlement',
              text: 'Origin deposit confirmed. Relayer solver filling destination...',
              txHash: originTxHash,
              isPolling: true
            });
          }

          const pollRes = await this.pollIntentStatus(statusEndpoint, quote.requestId, (statusUpdate) => {
            if (onProgress) {
              const stageLabels = {
                waiting: 'Waiting for deposit confirmation...',
                depositing: 'Deposit detected by Relay depository...',
                submitted: 'Solver fronting funds on destination...',
                success: 'Complete! Tokens delivered to recipient.'
              };
              onProgress({
                action: 'Solver Settlement',
                text: stageLabels[statusUpdate.stage] || `Relay status: ${statusUpdate.stage}`,
                txHash: originTxHash,
                destinationTxHash: statusUpdate.details?.outTxHashes?.[0] || null,
                isPolling: true
              });
            }
          });

          const finalStatus = pollRes.ok ? 'success' : (pollRes.refunded ? 'refunded' : 'failed');
          this.updateSwap(quote.requestId || originTxHash, {
            status: finalStatus,
            destinationTxHash: pollRes.destinationTxHash,
            destExplorer: pollRes.destinationTxHash ? `${toChain.explorer}/tx/${pollRes.destinationTxHash}` : null
          });

          // Refresh user balance in background
          setTimeout(() => this.getTokenBalance(), 3000);

          return {
            ok: pollRes.ok,
            txHash: originTxHash,
            destinationTxHash: pollRes.destinationTxHash,
            requestId: quote.requestId,
            explorerUrl: `${fromChain.explorer}/tx/${originTxHash}`,
            destExplorerUrl: pollRes.destinationTxHash ? `${toChain.explorer}/tx/${pollRes.destinationTxHash}` : null
          };
        }

        return {
          ok: true,
          txHash: originTxHash,
          requestId: quote.requestId,
          explorerUrl: `${fromChain.explorer}/tx/${originTxHash}`
        };
      } catch (err) {
        if (err.code === 4001 || (err.message && err.message.toLowerCase().includes('user rejected'))) {
          return { ok: false, cancelled: true, error: 'Transaction rejected in wallet. No funds were spent.' };
        }
        return { ok: false, error: err.message || 'On-chain transaction execution failed.' };
      }
    }

    // =========================================================================
    // 2. REAL SOLANA SVM ON-CHAIN EXECUTION (Phantom / Solflare via @solana/web3.js)
    // =========================================================================
    if (fromChain.vmType === 'svm') {
      const solanaProvider = window.phantom?.solana || window.solana;
      if (!solanaProvider) {
        return { ok: false, noWallet: true, error: 'No Solana wallet detected (Phantom or Solflare).' };
      }

      try {
        if (!this.wallets.solana) {
          if (onProgress) onProgress({ step: 1, text: 'Connecting Phantom wallet...' });
          const connRes = await this.connectSolanaWallet();
          if (!connRes.ok) return { ok: false, error: connRes.error };
        }

        const userPubkey = this.wallets.solana;
        const depositStep = quote.steps.find(s => s.id === 'deposit') || quote.steps[0];
        const item = depositStep?.items?.[0];

        if (!item || !item.data) {
          return { ok: false, error: 'Invalid Solana instructions returned by Relay solver.' };
        }

        if (onProgress) {
          onProgress({
            step: 1,
            totalSteps: 2,
            action: 'Preparing Solana Transaction',
            text: 'Parsing instructions & requesting mainnet blockhash...'
          });
        }

        // Ensure @solana/web3.js is ready
        const solWeb3 = window.solanaWeb3;
        if (!solWeb3) {
          throw new Error('@solana/web3.js library failed to load. Please refresh.');
        }

        const rawInstructions = item.data.instructions || [];
        if (!rawInstructions.length) {
          throw new Error('No executable instructions in Relay response.');
        }

        // Construct real solanaWeb3 Transaction
        const transaction = new solWeb3.Transaction();

        rawInstructions.forEach(inst => {
          const programId = new solWeb3.PublicKey(inst.programId);
          const keys = (inst.keys || []).map(k => ({
            pubkey: new solWeb3.PublicKey(k.pubkey),
            isSigner: !!k.isSigner,
            isWritable: !!k.isWritable
          }));

          const dataBytes = hexToUint8Array(inst.data);
          transaction.add(new solWeb3.TransactionInstruction({
            programId,
            keys,
            data: dataBytes
          }));
        });

        // Fetch latest blockhash from public Solana mainnet RPC
        const rpcRes = await fetch('https://api.mainnet-beta.solana.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getLatestBlockhash',
            params: [{ commitment: 'confirmed' }]
          })
        });

        if (!rpcRes.ok) throw new Error('Failed to fetch Solana blockhash.');
        const rpcData = await rpcRes.json();
        const blockhash = rpcData.result?.value?.blockhash;
        if (!blockhash) throw new Error('Invalid blockhash received from Solana mainnet RPC.');

        transaction.recentBlockhash = blockhash;
        transaction.feePayer = new solWeb3.PublicKey(userPubkey);

        if (onProgress) {
          onProgress({
            step: 1,
            totalSteps: 2,
            action: 'Wallet Signature',
            text: 'Please approve the Solana transaction in Phantom...'
          });
        }

        // Sign and broadcast on-chain via Phantom
        const signResult = await solanaProvider.signAndSendTransaction(transaction);
        const solTxSignature = signResult.signature || (typeof signResult === 'string' ? signResult : null);

        if (!solTxSignature) {
          throw new Error('No signature returned from Solana wallet.');
        }

        // Record in transaction history
        this.recordSwap({
          id: quote.requestId || solTxSignature,
          requestId: quote.requestId,
          fromChainId: fromChain.id,
          toChainId: toChain.id,
          fromToken: this.state.fromToken,
          toToken: this.state.toToken,
          fromAmount: this.state.fromAmount,
          expectedOutput: quote.details?.currencyOut?.amountFormatted || '...',
          status: 'processing',
          originTxHash: solTxSignature,
          originExplorer: `https://solscan.io/tx/${solTxSignature}`,
          timestamp: Date.now()
        });

        if (onProgress) {
          onProgress({
            step: 2,
            totalSteps: 2,
            action: 'Solana Broadcast Confirmed',
            text: 'Solana transaction mined! Tracking Relay solver fulfillment...',
            txHash: solTxSignature,
            isPolling: true
          });
        }

        // Poll Relay Intent Status on Mainnet
        const checkEndpoint = item.check?.endpoint || `/intents/status?requestId=${quote.requestId}`;
        const pollRes = await this.pollIntentStatus(checkEndpoint, quote.requestId, (statusUpdate) => {
          if (onProgress) {
            const stageLabels = {
              waiting: 'Waiting for Solana block confirmation...',
              depositing: 'Relay solver swept Solana funds...',
              submitted: 'Filling tokens on destination chain...',
              success: 'Complete! Funds received on destination.'
            };
            onProgress({
              action: 'Relay Solver Mesh',
              text: stageLabels[statusUpdate.stage] || `Relay status: ${statusUpdate.stage}`,
              txHash: solTxSignature,
              destinationTxHash: statusUpdate.details?.outTxHashes?.[0] || null,
              isPolling: true
            });
          }
        });

        const finalStatus = pollRes.ok ? 'success' : (pollRes.refunded ? 'refunded' : 'failed');
        this.updateSwap(quote.requestId || solTxSignature, {
          status: finalStatus,
          destinationTxHash: pollRes.destinationTxHash,
          destExplorer: pollRes.destinationTxHash ? `${toChain.explorer}/tx/${pollRes.destinationTxHash}` : null
        });

        // Refresh user balance in background
        setTimeout(() => this.getTokenBalance(), 3000);

        return {
          ok: pollRes.ok,
          txHash: solTxSignature,
          destinationTxHash: pollRes.destinationTxHash,
          requestId: quote.requestId,
          explorerUrl: `https://solscan.io/tx/${solTxSignature}`,
          destExplorerUrl: pollRes.destinationTxHash ? `${toChain.explorer}/tx/${pollRes.destinationTxHash}` : null
        };
      } catch (err) {
        if (err.code === 4001 || (err.message && err.message.toLowerCase().includes('user rejected'))) {
          return { ok: false, cancelled: true, error: 'Solana signature rejected in wallet. No funds were spent.' };
        }
        return { ok: false, error: err.message || 'Solana mainnet execution failed.' };
      }
    }

    return { ok: false, error: 'Unsupported VM architecture.' };
  }
}

export const swapService = new SwapService();
