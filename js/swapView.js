/**
 * TRINITY MARKETS — Institutional Relay Bridge & Execution Desk
 * Production Interface for api.relay.link
 *
 * Fully Integrated Features:
 * - Real-time On-Chain Swaps (Base & Solana SVM)
 * - Live Wallet Balances & Intelligent Gas-Buffered MAX Auto-Fill
 * - Real-Time High Price Impact & Spread Warnings
 * - Recent Swaps Transaction History Drawer with Live Explorer Proofs
 * - EIP-6963 Multi-Wallet Discovery & Selector Modal
 * - Direct Fiat-to-Crypto Onramp (Robinhood Connect & Coinbase Pay)
 */

import { swapService, SUPPORTED_CHAINS, CURATED_TOKENS } from './swapService.js';

let activeCardTab = 'bridge'; // 'bridge' | 'deposit' | 'onramp'
let showSlippageDrawer = false;
let showAdvancedOptions = false;
let showRouteDetails = false;
let tokenModalContext = null; // 'from' | 'to'
let selectedModalChainId = null;
let quoteDebounceTimer = null;
let quoteCountdownTimer = null;
let quoteCountdownSeconds = 15;
let depositPollInterval = null;

// Fiat Onramp State
let onrampState = {
  provider: 'robinhood', // 'robinhood' | 'coinbase'
  targetAsset: 'ETH',
  targetChainId: 8453,
  fiatAmount: 100
};

/**
 * Security: Strict HTML escaping to prevent DOM XSS from external token/wallet inputs
 */
function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Security: Sanitize outbound URLs to prevent javascript: pseudo-protocol execution
 */
function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '#';
  const clean = url.trim();
  if (clean.startsWith('https://') || clean.startsWith('http://') || clean.startsWith('#')) {
    return clean;
  }
  return '#';
}

export function renderSwapDesk(container, appInstance) {
  if (!container) return;

  const state = swapService.state;
  const fromChain = swapService.getChain(state.fromChainId);
  const toChain = swapService.getChain(state.toChainId);
  const fromToken = state.fromToken;
  const toToken = state.toToken;
  const wallets = swapService.wallets;
  const recentSwaps = state.recentSwaps || [];

  container.innerHTML = `
      <!-- Slim Desk Header -->
      <header class="relay-desk-header">
        <div class="relay-brand-pill">
          <span class="relay-status-live-dot"></span>
          <span>TRINITY BRIDGE &amp; SWAP</span>
        </div>

        <div class="relay-wallets-cluster">
          <!-- History Drawer Trigger -->
          <button class="relay-history-btn" id="relayHistoryBtn" title="Transaction Settlement History">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>Activity${recentSwaps.length ? ` <span class="history-count-badge">${recentSwaps.length}</span>` : ''}</span>
          </button>

          <!-- EVM Wallet Button -->
          <button class="relay-wallet-btn ${wallets.evm ? 'connected' : ''}" id="relayEvmWalletBtn" title="${wallets.evm ? 'Connected: ' + wallets.evm : 'Connect EVM Wallet'}">
            <img src="${wallets.evmProviderInfo?.icon || 'https://assets.relay.link/icons/8453/light.png'}" width="13" height="13" style="border-radius: 50%;">
            <span>${wallets.evm ? truncateAddress(wallets.evm) : 'Connect EVM'}</span>
          </button>

          <!-- Solana Wallet Button -->
          <button class="relay-wallet-btn ${wallets.solana ? 'connected' : ''}" id="relaySolanaWalletBtn" title="${wallets.solana ? 'Connected: ' + wallets.solana : 'Connect Solana Wallet'}">
            <img src="https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png" width="13" height="13" style="border-radius: 50%;">
            <span>${wallets.solana ? truncateAddress(wallets.solana) : 'Connect Solana'}</span>
          </button>
        </div>
      </header>

      <!-- Primary Relay Card -->
      <main class="relay-card">
        <!-- Navigation Tabs -->
        <div class="relay-card-tabs">
          <div class="relay-tabs-left">
            <button class="relay-tab-btn ${activeCardTab === 'bridge' ? 'active' : ''}" id="tabBridgeBtn">Instant Bridge</button>
            <button class="relay-tab-btn ${activeCardTab === 'deposit' ? 'active' : ''}" id="tabDepositBtn">Deposit Address</button>
            <button class="relay-tab-btn ${activeCardTab === 'onramp' ? 'active' : ''}" id="tabOnrampBtn">Buy Crypto (Fiat)</button>
          </div>

          <button class="relay-settings-btn" id="relaySettingsBtn" title="Slippage settings">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
        </div>

        <!-- Slippage Drawer -->
        ${showSlippageDrawer ? `
          <div class="relay-slippage-drawer">
            <span>Slippage Tolerance</span>
            <div class="relay-slippage-pills">
              <button class="slippage-pill ${state.slippageTolerance === '0.1' ? 'active' : ''}" data-slip="0.1">0.1%</button>
              <button class="slippage-pill ${state.slippageTolerance === '0.5' ? 'active' : ''}" data-slip="0.5">0.5%</button>
              <button class="slippage-pill ${state.slippageTolerance === '1.0' ? 'active' : ''}" data-slip="1.0">1.0%</button>
            </div>
          </div>
        ` : ''}

        <!-- Card Body -->
        <div class="relay-card-body">
          ${activeCardTab === 'bridge' ? renderBridgeWorkspace(state, fromChain, toChain, fromToken, toToken) : (activeCardTab === 'deposit' ? renderDepositWorkspace(state, fromChain, toChain, fromToken, toToken) : renderOnrampWorkspace(state, wallets))}
        </div>
      </main>

    <!-- Token & Chain Selector Modal -->
    <div class="relay-modal-backdrop hidden" id="relayTokenModalBackdrop">
      <div class="relay-modal" id="relayTokenModal">
        <div class="relay-modal-header">
          <span class="relay-modal-title">Select Token &amp; Chain</span>
          <button class="relay-modal-close" id="relayCloseTokenModal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="relay-search-bar-wrap">
          <input type="text" class="relay-search-input" id="relayTokenSearchInput" placeholder="Search by name, symbol, or paste address..." autofocus>
        </div>

        <div class="relay-chain-tabs-bar" id="relayChainTabsBar">
          <button class="relay-chain-tab ${!selectedModalChainId ? 'active' : ''}" data-cid="all">All Chains</button>
          ${SUPPORTED_CHAINS.slice(0, 8).map(c => `
            <button class="relay-chain-tab ${selectedModalChainId === c.id ? 'active' : ''}" data-cid="${c.id}">
              <img src="${c.icon}" width="14" height="14" style="border-radius: 50%;">
              <span>${c.displayName}</span>
            </button>
          `).join('')}
        </div>

        <div class="relay-token-list" id="relayTokenListContainer">
          <!-- Populated dynamically -->
        </div>
      </div>
    </div>

    <!-- EIP-6963 Multi-Wallet Discovery Modal -->
    <div class="relay-modal-backdrop hidden" id="relayWalletModalBackdrop">
      <div class="relay-modal" style="max-width: 380px;">
        <div class="relay-modal-header">
          <span class="relay-modal-title">Select Web3 EVM Wallet</span>
          <button class="relay-modal-close" id="relayCloseWalletModal">&times;</button>
        </div>
        <div class="relay-wallet-providers-list" id="relayWalletProvidersList">
          <!-- Populated with discovered EIP-6963 providers -->
        </div>
      </div>
    </div>

    <!-- Recent Swaps Transaction History Modal -->
    <div class="relay-modal-backdrop hidden" id="relayHistoryModalBackdrop">
      <div class="relay-modal" style="max-width: 460px;">
        <div class="relay-modal-header">
          <div>
            <span class="relay-modal-title">Activity &amp; Settlement Proofs</span>
            <span style="display: block; font-size: 0.72rem; color: #64748b; margin-top: 0.15rem;">Live on-chain solver execution receipts</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            ${recentSwaps.length ? `<button class="relay-clear-history-btn" id="relayClearHistoryBtn">Clear</button>` : ''}
            <button class="relay-modal-close" id="relayCloseHistoryModal">&times;</button>
          </div>
        </div>

        <div class="relay-history-body" id="relayHistoryListContainer">
          ${renderRecentSwapsList(recentSwaps)}
        </div>
      </div>
    </div>

    <!-- Real-time Live Execution Modal -->
    <div class="relay-exec-modal-backdrop hidden" id="relayExecModalBackdrop">
      <div class="relay-exec-card" id="relayExecModalCard">
        <div class="relay-exec-title" id="relayExecTitle">Bridge in Progress</div>
        <div class="relay-exec-sub" id="relayExecSubtitle">Tracking live on-chain solver settlement...</div>

        <div class="relay-stepper" id="relayExecStepper">
          <div class="relay-step-item" id="stepWallet">
            <div class="relay-step-circle active" id="stepCircleWallet">1</div>
            <div class="relay-step-info">
              <span class="relay-step-name">Wallet Signature</span>
              <span class="relay-step-desc" id="stepDescWallet">Please confirm transaction in your wallet</span>
            </div>
          </div>

          <div class="relay-step-item" id="stepDeposit">
            <div class="relay-step-circle" id="stepCircleDeposit">2</div>
            <div class="relay-step-info">
              <span class="relay-step-name">Origin Confirmation</span>
              <span class="relay-step-desc" id="stepDescDeposit">Broadcasting to blockchain mempool</span>
              <a href="#" target="_blank" class="relay-step-link hidden" id="originTxLink">View on Explorer &nearr;</a>
            </div>
          </div>

          <div class="relay-step-item" id="stepFill">
            <div class="relay-step-circle" id="stepCircleFill">3</div>
            <div class="relay-step-info">
              <span class="relay-step-name">Relay Solver Fill</span>
              <span class="relay-step-desc" id="stepDescFill">Solver providing instant destination delivery</span>
              <a href="#" target="_blank" class="relay-step-link hidden" id="destTxLink">View Destination Delivery &nearr;</a>
            </div>
          </div>
        </div>

        <button class="relay-exec-close-btn" id="relayExecCloseBtn">Dismiss</button>
      </div>
    </div>
  `;

  attachEventHandlers(container, appInstance);

  // Trigger balance fetch in background if wallet connected
  if (wallets[fromChain.vmType]) {
    swapService.getTokenBalance().then(bal => {
      if (bal !== null) {
        const balEl = container.querySelector('#relayBalanceDisplay');
        if (balEl) balEl.innerText = `${bal} ${fromToken.symbol}`;
      }
    });
  }

  // Trigger initial quote fetch if not already populated
  if (!state.quote && !state.isFetchingQuote && state.fromAmount) {
    fetchQuote(container, appInstance);
  }

  // Start quote auto-refresh countdown
  startQuoteCountdown(container, appInstance);
}

function renderBridgeWorkspace(state, fromChain, toChain, fromToken, toToken) {
  const quote = state.quote;
  const isFetching = state.isFetchingQuote;
  const error = state.quoteError;

  const outAmount = quote?.details?.currencyOut?.amountFormatted 
    ? parseFloat(quote.details.currencyOut.amountFormatted).toFixed(5)
    : (quote ? '0.00' : '0.00');

  const usdValue = quote?.details?.currencyOut?.amountUsd
    ? `~$${parseFloat(quote.details.currencyOut.amountUsd).toFixed(2)}`
    : '';

  const solverFeeUsd = quote?.fees?.relayer?.amountUsd
    ? `$${parseFloat(quote.fees.relayer.amountUsd).toFixed(3)}`
    : '$0.02';

  const gasFeeUsd = quote?.fees?.gas?.amountUsd
    ? `$${parseFloat(quote.fees.gas.amountUsd).toFixed(3)}`
    : '~$0.05';

  const timeEstimate = quote?.details?.timeEstimate
    ? `${quote.details.timeEstimate}s`
    : '~2.5s';

  // Calculate rate
  let rateDisplay = '';
  if (quote && state.fromAmount && parseFloat(state.fromAmount) > 0 && parseFloat(outAmount) > 0) {
    const rate = (parseFloat(outAmount) / parseFloat(state.fromAmount)).toFixed(4);
    rateDisplay = `1 ${fromToken.symbol} = ${rate} ${toToken.symbol}`;
  }

  const userBalance = state.userBalance !== null ? `${state.userBalance} ${fromToken.symbol}` : (state.isFetchingBalance ? '...' : '--');
  const priceImpact = state.priceImpact || quote?.priceImpactPct || 0;

  return `
    <!-- Pay Input Box -->
    <div class="relay-input-box">
      <div class="relay-input-header">
        <span>You pay</span>
        <span>Balance: <span id="relayBalanceDisplay">${userBalance}</span> <button class="relay-max-btn" id="relayMaxAmountBtn">MAX</button></span>
      </div>

      <div class="relay-input-row">
        <input type="text" class="relay-amount-input" id="relayAmountInput" value="${state.fromAmount || ''}" placeholder="0.0" inputmode="decimal">
        
        <div class="relay-selector-pill" id="relayFromSelectorBtn">
          <div class="relay-token-icons-wrapper">
            <img class="relay-token-icon" src="${fromToken.logoURI || fromChain.icon}" alt="${fromToken.symbol}">
            <img class="relay-chain-badge-icon" src="${fromChain.icon}" alt="${fromChain.displayName}">
          </div>
          <div class="relay-token-name-col">
            <span class="relay-token-symbol">${fromToken.symbol}</span>
            <span class="relay-chain-label">${fromChain.displayName}</span>
          </div>
          <svg class="relay-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>

      <div class="relay-sub-value">
        <span>${quote?.details?.currencyIn?.amountUsd ? `~$${parseFloat(quote.details.currencyIn.amountUsd).toFixed(2)}` : ''}</span>
      </div>
    </div>

    <!-- Center Flip Button -->
    <div class="relay-flip-container">
      <button class="relay-flip-btn" id="relayFlipPairBtn" title="Switch assets">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
      </button>
    </div>

    <!-- Receive Input Box -->
    <div class="relay-input-box" style="margin-top: -6px;">
      <div class="relay-input-header">
        <span>You receive</span>
      </div>

      <div class="relay-input-row">
        <div class="relay-amount-output ${isFetching ? 'skeleton' : ''}">
          ${isFetching ? 'Calculating...' : outAmount}
        </div>

        <div class="relay-selector-pill" id="relayToSelectorBtn">
          <div class="relay-token-icons-wrapper">
            <img class="relay-token-icon" src="${toToken.logoURI || toChain.icon}" alt="${toToken.symbol}">
            <img class="relay-chain-badge-icon" src="${toChain.icon}" alt="${toChain.displayName}">
          </div>
          <div class="relay-token-name-col">
            <span class="relay-token-symbol">${toToken.symbol}</span>
            <span class="relay-chain-label">${toChain.displayName}</span>
          </div>
          <svg class="relay-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>

      <div class="relay-sub-value">
        <span>${usdValue}</span>
      </div>
    </div>

    <!-- Price Impact Warning Banner -->
    ${priceImpact >= 2.5 ? `
      <div class="relay-warning-banner ${priceImpact >= 10 ? 'critical' : 'warning'}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <span>${priceImpact >= 10 ? '🚨 Severe Price Impact' : '⚠️ Elevated Price Impact'}: <strong>-${priceImpact.toFixed(1)}%</strong> spread due to pair liquidity depth.</span>
      </div>
    ` : ''}

    <!-- Collapsible Advanced Options -->
    <div class="relay-options-panel">
      <div class="relay-option-row">
        <label class="relay-checkbox-label">
          <input type="checkbox" class="relay-checkbox" id="relayTopupGasCheckbox" ${state.topupGas ? 'checked' : ''}>
          <span>Top up destination gas (${toChain.nativeToken.symbol})</span>
        </label>
        <button class="relay-max-btn" id="toggleRecipientBtn">${showAdvancedOptions ? 'Hide recipient' : '+ Custom recipient'}</button>
      </div>

      ${showAdvancedOptions ? `
        <div class="relay-recipient-input-wrapper">
          <input type="text" class="relay-recipient-input" id="relayCustomRecipientInput" value="${state.recipientAddress || ''}" placeholder="Enter destination ${toChain.displayName} address...">
        </div>
      ` : ''}
    </div>

    <!-- Route & Rate Summary -->
    <div class="relay-route-summary">
      <div class="relay-rate-bar" id="toggleRouteBar">
        <span>${rateDisplay || 'Trinity Instant Mesh'}</span>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span class="relay-countdown-pill" id="quoteCountdownDisplay">${quoteCountdownSeconds}s</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
      </div>

      ${showRouteDetails ? `
        <div class="relay-route-details">
          <div class="relay-detail-item">
            <span>Relay Solver Fee</span>
            <span class="relay-detail-val">${solverFeeUsd}</span>
          </div>
          <div class="relay-detail-item">
            <span>Estimated Network Gas</span>
            <span class="relay-detail-val">${gasFeeUsd}</span>
          </div>
          <div class="relay-detail-item">
            <span>Price Impact</span>
            <span class="relay-detail-val" style="color: ${priceImpact > 2 ? '#ef4444' : '#10b981'};">${priceImpact.toFixed(2)}%</span>
          </div>
          <div class="relay-detail-item">
            <span>Expected Settlement Speed</span>
            <span class="relay-detail-val" style="color: #10b981;">${timeEstimate}</span>
          </div>
          <div class="relay-detail-item">
            <span>Route</span>
            <span class="relay-detail-val">${fromChain.shortName} &rarr; Relay Solver &rarr; ${toChain.shortName}</span>
          </div>
        </div>
      ` : ''}
    </div>

    <!-- Primary Action CTA -->
    ${error ? `
      <button class="relay-submit-btn error" disabled>${error}</button>
    ` : `
      <button class="relay-submit-btn" id="relayExecuteBtn" ${isFetching ? 'disabled' : ''}>
        ${isFetching ? 'Fetching Live Rate...' : `Bridge to ${toChain.displayName}`}
      </button>
    `}
  `;
}

function renderDepositWorkspace(state, fromChain, toChain, fromToken, toToken) {
  const depositData = state.depositData;

  if (!depositData) {
    return `
      <div class="relay-deposit-card">
        <p style="font-size: 0.85rem; color: #94a3b8; margin: 0.5rem 0 1.25rem;">
          Bridge from <strong>Binance</strong>, <strong>Coinbase</strong>, or any external wallet directly to your destination without connecting a Web3 wallet.
        </p>

        <div class="relay-input-box" style="text-align: left; margin-bottom: 1rem;">
          <div class="relay-input-header">
            <span>Send Amount</span>
          </div>
          <div class="relay-input-row">
            <input type="text" class="relay-amount-input" id="relayDepositAmountInput" value="${state.fromAmount || '0.05'}" placeholder="0.0">
            <div class="relay-selector-pill" id="relayDepositFromSelector">
              <img class="relay-token-icon" src="${fromToken.logoURI || fromChain.icon}">
              <span class="relay-token-symbol">${fromToken.symbol}</span>
            </div>
          </div>
        </div>

        <div style="text-align: left; margin-bottom: 1rem;">
          <label style="font-size: 0.75rem; color: #64748b; margin-bottom: 0.35rem; display: block;">Recipient (${toChain.displayName} Address)</label>
          <input type="text" class="relay-recipient-input" id="relayDepositRecipientInput" value="${state.recipientAddress || ''}" placeholder="Paste your ${toChain.displayName} receiving address...">
        </div>

        <button class="relay-submit-btn" id="relayGenDepositAddrBtn">
          Generate Deposit Address
        </button>
      </div>
    `;
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(depositData.depositAddress)}`;

  return `
    <div class="relay-deposit-card">
      <div style="font-size: 0.82rem; color: #94a3b8;">
        Send <strong>${depositData.minimumAmount} ${depositData.currency.symbol}</strong> on <strong>${depositData.chain.displayName}</strong> to:
      </div>

      <div class="relay-qr-wrapper">
        <img class="relay-qr-img" src="${qrUrl}" alt="Deposit QR">
      </div>

      <div class="relay-deposit-addr-box">
        <span class="relay-deposit-addr-text" id="depositAddrText">${depositData.depositAddress}</span>
        <button class="relay-copy-btn" id="copyDepositAddrBtn">Copy</button>
      </div>

      <div class="relay-listener-status">
        <div class="relay-status-live-dot"></div>
        <span>Listening for incoming blockchain deposit...</span>
      </div>

      <button class="relay-submit-btn" id="resetDepositBtn" style="margin-top: 1.25rem; background: #1a1e28; color: #fff;">
        Generate New Address
      </button>
    </div>
  `;
}

function renderOnrampWorkspace(state, wallets) {
  const defaultDest = onrampState.targetChainId === 792703809 ? (wallets.solana || '') : (wallets.evm || '');

  return `
    <div class="relay-onramp-card">
      <div class="relay-onramp-header">
        <span class="relay-onramp-badge">INSTITUTIONAL FIAT ONRAMP</span>
        <p class="relay-onramp-desc">Purchase crypto with credit card, Apple Pay, or bank transfer directly into your destination wallet.</p>
      </div>

      <!-- Provider Toggle -->
      <div class="relay-onramp-providers">
        <button class="onramp-provider-card ${onrampState.provider === 'robinhood' ? 'active' : ''}" data-provider="robinhood">
          <div class="onramp-provider-title">
            <span style="color:#00c805; font-weight:800;">●</span> Robinhood Connect
          </div>
          <div class="onramp-provider-sub">0% promotional fee • Fast US &amp; Global</div>
        </button>
        <button class="onramp-provider-card ${onrampState.provider === 'coinbase' ? 'active' : ''}" data-provider="coinbase">
          <div class="onramp-provider-title">
            <span style="color:#0052ff; font-weight:800;">●</span> Coinbase Pay
          </div>
          <div class="onramp-provider-sub">Instant debit &amp; bank transfer</div>
        </button>
      </div>

      <!-- Target Asset Picker -->
      <div style="margin: 1.25rem 0 0.75rem; text-align: left;">
        <label style="font-size: 0.75rem; color: #94a3b8; display: block; margin-bottom: 0.4rem;">Select Asset to Purchase</label>
        <div class="relay-onramp-assets">
          <button class="onramp-asset-btn ${onrampState.targetAsset === 'ETH' ? 'active' : ''}" data-asset="ETH" data-cid="8453">
            <img src="https://assets.relay.link/icons/1/light.png" width="14" height="14">
            <span>ETH (Base)</span>
          </button>
          <button class="onramp-asset-btn ${onrampState.targetAsset === 'SOL' ? 'active' : ''}" data-asset="SOL" data-cid="792703809">
            <img src="https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png" width="14" height="14">
            <span>SOL (Solana)</span>
          </button>
          <button class="onramp-asset-btn ${onrampState.targetAsset === 'USDC' ? 'active' : ''}" data-asset="USDC" data-cid="8453">
            <img src="https://assets.relay.link/icons/8453/currencies/0x833589fcd6edb6e08f4c7c32d4f71b54bda02913/light.png" width="14" height="14">
            <span>USDC (Base)</span>
          </button>
        </div>
      </div>

      <!-- Amount Selector & Quick Chips -->
      <div style="margin: 1rem 0; text-align: left;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
          <label style="font-size: 0.75rem; color: #94a3b8;">Amount in USD</label>
          <span style="font-size: 0.72rem; color: #64748b;">Min $20 &bull; Max $10,000</span>
        </div>
        <div class="relay-input-box" style="margin-bottom: 0.5rem;">
          <div class="relay-input-row">
            <span style="font-size: 1.25rem; font-weight: 700; color: #64748b; margin-right: 0.35rem;">$</span>
            <input type="number" class="relay-amount-input" id="onrampAmountInput" value="${onrampState.fiatAmount}" placeholder="100" min="20">
            <span style="font-family: var(--font-mono); font-size: 0.82rem; color: #94a3b8;">USD</span>
          </div>
        </div>
        <div class="onramp-amount-chips">
          <button class="onramp-chip ${onrampState.fiatAmount === 50 ? 'active' : ''}" data-amt="50">$50</button>
          <button class="onramp-chip ${onrampState.fiatAmount === 100 ? 'active' : ''}" data-amt="100">$100</button>
          <button class="onramp-chip ${onrampState.fiatAmount === 250 ? 'active' : ''}" data-amt="250">$250</button>
          <button class="onramp-chip ${onrampState.fiatAmount === 500 ? 'active' : ''}" data-amt="500">$500</button>
        </div>
      </div>

      <!-- Receiving Address -->
      <div style="margin: 1rem 0 1.25rem; text-align: left;">
        <label style="font-size: 0.75rem; color: #94a3b8; display: block; margin-bottom: 0.4rem;">Receiving Wallet Address</label>
        <input type="text" class="relay-recipient-input" id="onrampDestAddress" value="${defaultDest}" placeholder="Connect wallet or paste recipient address...">
      </div>

      <button class="relay-submit-btn" id="launchOnrampBtn">
        Launch ${onrampState.provider === 'robinhood' ? 'Robinhood Connect' : 'Coinbase Pay'} &nearr;
      </button>
    </div>
  `;
}

function renderRecentSwapsList(recentSwaps) {
  if (!recentSwaps || !recentSwaps.length) {
    return `
      <div class="relay-history-empty">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <p style="margin: 0.75rem 0 0.25rem; color: #cbd5e1; font-weight: 600; font-size: 0.9rem;">No transactions yet</p>
        <span style="color: #64748b; font-size: 0.75rem;">Your on-chain settlement receipts will appear here automatically.</span>
      </div>
    `;
  }

  return recentSwaps.map(s => {
    const fromChain = swapService.getChain(s.fromChainId);
    const toChain = swapService.getChain(s.toChainId);
    const statusClass = s.status === 'success' ? 'success' : (s.status === 'processing' ? 'processing' : 'refunded');
    const statusLabel = s.status === 'success' ? 'SETTLED' : (s.status === 'processing' ? 'PROCESSING' : (s.status || 'DONE').toUpperCase());
    const dateFormatted = new Date(s.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const originLink = s.originTxHash ? sanitizeUrl(s.originExplorer || `${fromChain.explorer}/tx/${s.originTxHash}`) : null;
    const destLink = s.destinationTxHash ? sanitizeUrl(s.destExplorer || `${toChain.explorer}/tx/${s.destinationTxHash}`) : null;

    return `
      <div class="relay-history-item">
        <div class="relay-history-top">
          <div class="relay-history-pair">
            <span style="font-weight: 700; color: #fff;">${escapeHTML(s.fromAmount)} ${escapeHTML(s.fromToken?.symbol || 'ETH')}</span>
            <span style="color: #64748b; margin: 0 0.35rem;">&rarr;</span>
            <span style="font-weight: 700; color: #10b981;">${escapeHTML(s.expectedOutput)} ${escapeHTML(s.toToken?.symbol || 'SOL')}</span>
          </div>
          <span class="relay-status-pill ${statusClass}">${escapeHTML(statusLabel)}</span>
        </div>

        <div class="relay-history-sub">
          <span>${escapeHTML(fromChain.displayName)} &rarr; ${escapeHTML(toChain.displayName)} &bull; ${escapeHTML(dateFormatted)}</span>
          <div class="relay-history-links">
            ${originLink ? `<a href="${originLink}" target="_blank" rel="noopener noreferrer" class="relay-hist-link">Origin Tx &nearr;</a>` : ''}
            ${destLink ? `<a href="${destLink}" target="_blank" rel="noopener noreferrer" class="relay-hist-link" style="color: #10b981;">Dest Tx &nearr;</a>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function attachEventHandlers(container, appInstance) {
  // Navigation Tabs
  const tabBridge = container.querySelector('#tabBridgeBtn');
  const tabDeposit = container.querySelector('#tabDepositBtn');
  const tabOnramp = container.querySelector('#tabOnrampBtn');

  if (tabBridge) {
    tabBridge.onclick = () => {
      activeCardTab = 'bridge';
      swapService.state.useDepositAddress = false;
      renderSwapDesk(container, appInstance);
    };
  }
  if (tabDeposit) {
    tabDeposit.onclick = () => {
      activeCardTab = 'deposit';
      swapService.state.useDepositAddress = true;
      renderSwapDesk(container, appInstance);
    };
  }
  if (tabOnramp) {
    tabOnramp.onclick = () => {
      activeCardTab = 'onramp';
      renderSwapDesk(container, appInstance);
    };
  }

  // History Drawer Handler
  const historyBtn = container.querySelector('#relayHistoryBtn');
  const historyModal = container.querySelector('#relayHistoryModalBackdrop');
  const closeHistoryBtn = container.querySelector('#relayCloseHistoryModal');
  const clearHistoryBtn = container.querySelector('#relayClearHistoryBtn');

  if (historyBtn && historyModal) {
    historyBtn.onclick = () => historyModal.classList.remove('hidden');
  }
  if (closeHistoryBtn && historyModal) {
    closeHistoryBtn.onclick = () => historyModal.classList.add('hidden');
  }
  if (historyModal) {
    historyModal.onclick = (e) => {
      if (e.target === historyModal) historyModal.classList.add('hidden');
    };
  }
  if (clearHistoryBtn) {
    clearHistoryBtn.onclick = () => {
      swapService.clearRecentSwaps();
      renderSwapDesk(container, appInstance);
    };
  }

  // Slippage toggle
  const settingsBtn = container.querySelector('#relaySettingsBtn');
  if (settingsBtn) {
    settingsBtn.onclick = () => {
      showSlippageDrawer = !showSlippageDrawer;
      renderSwapDesk(container, appInstance);
    };
  }

  // Slippage pills
  container.querySelectorAll('.slippage-pill').forEach(btn => {
    btn.onclick = () => {
      swapService.state.slippageTolerance = btn.dataset.slip;
      renderSwapDesk(container, appInstance);
    };
  });

  // Wallet Connection Handlers (with EIP-6963 Modal Check)
  const evmBtn = container.querySelector('#relayEvmWalletBtn');
  if (evmBtn) {
    evmBtn.onclick = async () => {
      if (swapService.wallets.evm) {
        swapService.disconnectWallet('evm');
        renderSwapDesk(container, appInstance);
        fetchQuote(container, appInstance);
      } else {
        const res = await swapService.connectEvmWallet();
        if (res.needsSelection && res.providers?.length) {
          openWalletSelectorModal(res.providers, container, appInstance);
        } else {
          renderSwapDesk(container, appInstance);
          fetchQuote(container, appInstance);
        }
      }
    };
  }

  const solBtn = container.querySelector('#relaySolanaWalletBtn');
  if (solBtn) {
    solBtn.onclick = async () => {
      if (swapService.wallets.solana) {
        swapService.disconnectWallet('solana');
      } else {
        await swapService.connectSolanaWallet();
      }
      renderSwapDesk(container, appInstance);
      fetchQuote(container, appInstance);
    };
  }

  // Amount Input
  const amountInput = container.querySelector('#relayAmountInput');
  if (amountInput) {
    amountInput.oninput = (e) => {
      swapService.state.fromAmount = e.target.value;
      debounceQuote(container, appInstance);
    };
  }

  // Max Button with intelligent gas buffering
  const maxBtn = container.querySelector('#relayMaxAmountBtn');
  if (maxBtn) {
    maxBtn.onclick = () => {
      const state = swapService.state;
      const balStr = state.userBalance;
      if (balStr && !isNaN(parseFloat(balStr)) && parseFloat(balStr) > 0) {
        const balNum = parseFloat(balStr);
        let maxVal;
        const fromToken = state.fromToken;
        const isNative = !fromToken.address || fromToken.address === '0x0000000000000000000000000000000000000000' || fromToken.symbol === 'SOL';
        if (isNative) {
          // Reserve gas buffer: 0.003 for ETH, 0.01 for SOL
          const gasBuffer = fromToken.symbol === 'SOL' ? 0.01 : 0.003;
          maxVal = Math.max(0, balNum - gasBuffer).toFixed(4);
        } else {
          maxVal = balNum.toString();
        }
        swapService.state.fromAmount = maxVal;
        if (amountInput) amountInput.value = maxVal;
        fetchQuote(container, appInstance);
      } else {
        // Fallback default
        swapService.state.fromAmount = '0.1';
        if (amountInput) amountInput.value = '0.1';
        fetchQuote(container, appInstance);
      }
    };
  }

  // Flip Pair Button
  const flipBtn = container.querySelector('#relayFlipPairBtn');
  if (flipBtn) {
    flipBtn.onclick = () => {
      const state = swapService.state;
      const prevFromChain = state.fromChainId;
      const prevToChain = state.toChainId;
      const prevFromToken = state.fromToken;
      const prevToToken = state.toToken;

      state.fromChainId = prevToChain;
      state.toChainId = prevFromChain;
      state.fromToken = prevToToken;
      state.toToken = prevFromToken;

      renderSwapDesk(container, appInstance);
      fetchQuote(container, appInstance);
    };
  }

  // Selector Pills
  const fromPill = container.querySelector('#relayFromSelectorBtn');
  if (fromPill) {
    fromPill.onclick = () => openTokenModal('from', container, appInstance);
  }

  const toPill = container.querySelector('#relayToSelectorBtn');
  if (toPill) {
    toPill.onclick = () => openTokenModal('to', container, appInstance);
  }

  // Route details toggle
  const routeBar = container.querySelector('#toggleRouteBar');
  if (routeBar) {
    routeBar.onclick = () => {
      showRouteDetails = !showRouteDetails;
      renderSwapDesk(container, appInstance);
    };
  }

  // Destination Gas Topup Checkbox
  const topupCb = container.querySelector('#relayTopupGasCheckbox');
  if (topupCb) {
    topupCb.onchange = (e) => {
      swapService.state.topupGas = e.target.checked;
      fetchQuote(container, appInstance);
    };
  }

  // Custom Recipient toggle & input
  const toggleRecipientBtn = container.querySelector('#toggleRecipientBtn');
  if (toggleRecipientBtn) {
    toggleRecipientBtn.onclick = () => {
      showAdvancedOptions = !showAdvancedOptions;
      renderSwapDesk(container, appInstance);
    };
  }

  const recipientInput = container.querySelector('#relayCustomRecipientInput');
  if (recipientInput) {
    recipientInput.onchange = (e) => {
      swapService.state.recipientAddress = e.target.value.trim();
      fetchQuote(container, appInstance);
    };
  }

  // Deposit Mode Handlers
  const genDepositBtn = container.querySelector('#relayGenDepositAddrBtn');
  if (genDepositBtn) {
    genDepositBtn.onclick = async () => {
      const depAmt = container.querySelector('#relayDepositAmountInput')?.value || '0.05';
      const depRecip = container.querySelector('#relayDepositRecipientInput')?.value || '';
      swapService.state.fromAmount = depAmt;
      swapService.state.recipientAddress = depRecip;
      swapService.state.useDepositAddress = true;

      genDepositBtn.disabled = true;
      genDepositBtn.innerText = 'Generating Address...';

      const res = await swapService.getQuote({ useDepositAddress: true });
      if (res.ok) {
        renderSwapDesk(container, appInstance);
        startDepositWatcher(container, appInstance);
      } else {
        alert(res.error || 'Failed to generate deposit address');
        genDepositBtn.disabled = false;
        genDepositBtn.innerText = 'Generate Deposit Address';
      }
    };
  }

  const copyBtn = container.querySelector('#copyDepositAddrBtn');
  if (copyBtn) {
    copyBtn.onclick = () => {
      const text = container.querySelector('#depositAddrText')?.innerText;
      if (text) {
        navigator.clipboard.writeText(text);
        copyBtn.innerText = 'Copied!';
        setTimeout(() => { copyBtn.innerText = 'Copy'; }, 2000);
      }
    };
  }

  const resetDepositBtn = container.querySelector('#resetDepositBtn');
  if (resetDepositBtn) {
    resetDepositBtn.onclick = () => {
      swapService.state.depositData = null;
      renderSwapDesk(container, appInstance);
    };
  }

  // Onramp Workspace Event Handlers
  container.querySelectorAll('.onramp-provider-card').forEach(card => {
    card.onclick = () => {
      onrampState.provider = card.dataset.provider;
      renderSwapDesk(container, appInstance);
    };
  });

  container.querySelectorAll('.onramp-asset-btn').forEach(btn => {
    btn.onclick = () => {
      onrampState.targetAsset = btn.dataset.asset;
      onrampState.targetChainId = Number(btn.dataset.cid);
      renderSwapDesk(container, appInstance);
    };
  });

  container.querySelectorAll('.onramp-chip').forEach(chip => {
    chip.onclick = () => {
      onrampState.fiatAmount = Number(chip.dataset.amt);
      renderSwapDesk(container, appInstance);
    };
  });

  const onrampAmtInput = container.querySelector('#onrampAmountInput');
  if (onrampAmtInput) {
    onrampAmtInput.oninput = (e) => {
      onrampState.fiatAmount = Number(e.target.value) || 50;
    };
  }

  const launchOnrampBtn = container.querySelector('#launchOnrampBtn');
  if (launchOnrampBtn) {
    launchOnrampBtn.onclick = () => {
      const destAddr = container.querySelector('#onrampDestAddress')?.value.trim();
      if (!destAddr) {
        alert('Please connect a wallet or enter a destination wallet address.');
        return;
      }

      if (onrampState.provider === 'robinhood') {
        const url = `https://connect.robinhood.com/?asset=${encodeURIComponent(onrampState.targetAsset)}&walletAddress=${encodeURIComponent(destAddr)}&fiatAmount=${encodeURIComponent(onrampState.fiatAmount)}`;
        window.open(url, '_blank', 'width=480,height=720,noopener,noreferrer');
      } else {
        const url = `https://pay.coinbase.com/buy/select-asset?destinationWallets=${encodeURIComponent(JSON.stringify([{ address: destAddr, assets: [onrampState.targetAsset] }]))}&presetFiatAmount=${encodeURIComponent(onrampState.fiatAmount)}`;
        window.open(url, '_blank', 'width=480,height=720,noopener,noreferrer');
      }
    };
  }

  // Execute Bridge Button
  const execBtn = container.querySelector('#relayExecuteBtn');
  if (execBtn) {
    execBtn.onclick = () => executeBridgeFlow(container, appInstance);
  }

  // Modal Closers
  const modalClose = container.querySelector('#relayCloseTokenModal');
  const modalBackdrop = container.querySelector('#relayTokenModalBackdrop');
  if (modalClose) modalClose.onclick = closeTokenModal;
  if (modalBackdrop) {
    modalBackdrop.onclick = (e) => {
      if (e.target === modalBackdrop) closeTokenModal();
    };
  }

  const closeWalletModal = container.querySelector('#relayCloseWalletModal');
  const walletBackdrop = container.querySelector('#relayWalletModalBackdrop');
  if (closeWalletModal && walletBackdrop) {
    closeWalletModal.onclick = () => walletBackdrop.classList.add('hidden');
    walletBackdrop.onclick = (e) => {
      if (e.target === walletBackdrop) walletBackdrop.classList.add('hidden');
    };
  }

  const execClose = container.querySelector('#relayExecCloseBtn');
  const execBackdrop = container.querySelector('#relayExecModalBackdrop');
  if (execClose) execClose.onclick = () => execBackdrop.classList.add('hidden');
}

function openWalletSelectorModal(providers, container, appInstance) {
  const modal = document.getElementById('relayWalletModalBackdrop');
  const list = document.getElementById('relayWalletProvidersList');
  if (!modal || !list) return;

  list.innerHTML = providers.map(p => {
    const safeIcon = sanitizeUrl(p.info.icon);
    const safeName = escapeHTML(p.info.name || 'Web3 Wallet');
    const safeRdns = escapeHTML(p.info.rdns || 'EIP-6963 Injected Provider');
    const safeUuid = escapeHTML(p.info.uuid || '');

    return `
      <div class="relay-wallet-provider-item" data-uuid="${safeUuid}">
        <img src="${safeIcon}" width="28" height="28" style="border-radius: 6px;" onerror="this.src='https://assets.relay.link/icons/8453/light.png'">
        <div style="flex: 1; text-align: left;">
          <div style="font-weight: 700; color: #fff; font-size: 0.9rem;">${safeName}</div>
          <div style="font-size: 0.72rem; color: #64748b;">${safeRdns}</div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
    `;
  }).join('');

  list.querySelectorAll('.relay-wallet-provider-item').forEach(item => {
    item.onclick = async () => {
      const uuid = item.dataset.uuid;
      const selected = providers.find(p => p.info.uuid === uuid);
      modal.classList.add('hidden');
      await swapService.connectEvmWithProvider(selected);
      renderSwapDesk(container, appInstance);
      fetchQuote(container, appInstance);
    };
  });

  modal.classList.remove('hidden');
}

function debounceQuote(container, appInstance) {
  if (quoteDebounceTimer) clearTimeout(quoteDebounceTimer);
  quoteDebounceTimer = setTimeout(() => {
    fetchQuote(container, appInstance);
  }, 450);
}

async function fetchQuote(container, appInstance) {
  quoteCountdownSeconds = 15;
  const res = await swapService.getQuote();
  renderSwapDesk(container, appInstance);
}

function startQuoteCountdown(container, appInstance) {
  if (quoteCountdownTimer) clearInterval(quoteCountdownTimer);
  quoteCountdownTimer = setInterval(() => {
    quoteCountdownSeconds--;
    const display = document.getElementById('quoteCountdownDisplay');
    if (display) display.innerText = `${quoteCountdownSeconds}s`;

    if (quoteCountdownSeconds <= 0) {
      quoteCountdownSeconds = 15;
      if (!swapService.state.isFetchingQuote && activeCardTab === 'bridge') {
        swapService.getQuote().then(() => {
          renderSwapDesk(container, appInstance);
        });
      }
    }
  }, 1000);
}

function startDepositWatcher(container, appInstance) {
  if (depositPollInterval) clearInterval(depositPollInterval);
  const data = swapService.state.depositData;
  if (!data || !data.checkEndpoint) return;

  depositPollInterval = setInterval(async () => {
    try {
      const endpoint = data.checkEndpoint.startsWith('http') ? data.checkEndpoint : `${swapService.apiBase}${data.checkEndpoint}`;
      const res = await fetch(endpoint);
      if (res.ok) {
        const body = await res.json();
        const status = (body.status || '').toLowerCase();
        if (status === 'success') {
          clearInterval(depositPollInterval);
          alert(`✅ Deposit successful! Funds have been delivered to your destination wallet.`);
          swapService.state.depositData = null;
          renderSwapDesk(container, appInstance);
        }
      }
    } catch {}
  }, 3000);
}

async function executeBridgeFlow(container, appInstance) {
  const quote = swapService.state.quote;
  if (!quote) return;

  const modal = document.getElementById('relayExecModalBackdrop');
  const stepWallet = document.getElementById('stepCircleWallet');
  const stepDeposit = document.getElementById('stepCircleDeposit');
  const stepFill = document.getElementById('stepCircleFill');
  const descWallet = document.getElementById('stepDescWallet');
  const descDeposit = document.getElementById('stepDescDeposit');
  const descFill = document.getElementById('stepDescFill');
  const originLink = document.getElementById('originTxLink');
  const destLink = document.getElementById('destTxLink');
  const title = document.getElementById('relayExecTitle');
  const subtitle = document.getElementById('relayExecSubtitle');

  if (modal) modal.classList.remove('hidden');

  // Reset steps
  stepWallet.className = 'relay-step-circle active';
  stepDeposit.className = 'relay-step-circle';
  stepFill.className = 'relay-step-circle';
  originLink.rel = 'noopener noreferrer';
  destLink.rel = 'noopener noreferrer';
  originLink.classList.add('hidden');
  destLink.classList.add('hidden');

  const result = await swapService.executeOnChainSwap(quote, (progress) => {
    if (progress.action === 'Token Approval') {
      descWallet.innerText = 'Approving token in wallet...';
    } else if (progress.action === 'Relay Deposit' || progress.action === 'Wallet Signature') {
      descWallet.innerText = 'Please sign deposit in your wallet...';
    } else if (progress.action === 'Deposit Broadcasted' || progress.action === 'Solana Broadcast Confirmed') {
      stepWallet.className = 'relay-step-circle done';
      stepWallet.innerText = '✓';
      stepDeposit.className = 'relay-step-circle active';
      descDeposit.innerText = 'Transaction mined. Waiting for Relay solver sweep...';
      if (progress.txHash) {
        originLink.href = sanitizeUrl(swapService.getChain(swapService.state.fromChainId).explorer + '/tx/' + progress.txHash);
        originLink.classList.remove('hidden');
      }
    } else if (progress.action === 'Solver Settlement' || progress.action === 'Relay Solver Mesh') {
      stepDeposit.className = 'relay-step-circle done';
      stepDeposit.innerText = '✓';
      stepFill.className = 'relay-step-circle active';
      descFill.innerText = progress.text || 'Solver fronting funds on destination...';
      if (progress.destinationTxHash) {
        destLink.href = sanitizeUrl(swapService.getChain(swapService.state.toChainId).explorer + '/tx/' + progress.destinationTxHash);
        destLink.classList.remove('hidden');
      }
    }
  });

  if (result.ok) {
    stepFill.className = 'relay-step-circle done';
    stepFill.innerText = '✓';
    title.innerText = 'Bridge Complete!';
    subtitle.innerText = 'Funds have been delivered on destination.';
    if (result.destExplorerUrl) {
      destLink.href = sanitizeUrl(result.destExplorerUrl);
      destLink.classList.remove('hidden');
    }
  } else if (result.cancelled) {
    title.innerText = 'Signature Cancelled';
    subtitle.innerText = result.error;
    stepWallet.className = 'relay-step-circle';
  } else {
    title.innerText = 'Transaction Failed';
    subtitle.innerText = result.error;
  }
}

function openTokenModal(context, container, appInstance) {
  tokenModalContext = context;
  const modal = document.getElementById('relayTokenModalBackdrop');
  if (modal) {
    modal.classList.remove('hidden');
    const input = document.getElementById('relayTokenSearchInput');
    if (input) {
      input.value = '';
      input.focus();
    }
    populateTokenList('', selectedModalChainId || (context === 'from' ? swapService.state.fromChainId : swapService.state.toChainId), container, appInstance);
  }
}

function closeTokenModal() {
  const modal = document.getElementById('relayTokenModalBackdrop');
  if (modal) modal.classList.add('hidden');
}

async function populateTokenList(term, chainId, container, appInstance) {
  const listEl = document.getElementById('relayTokenListContainer');
  if (!listEl) return;

  listEl.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: #64748b; font-size: 0.8rem;">Loading tokens...</div>';

  const tokens = await swapService.searchTokens(term, chainId);

  if (!tokens.length) {
    listEl.innerHTML = '<div style="padding: 1.5rem; text-align: center; color: #64748b; font-size: 0.8rem;">No tokens found for this search.</div>';
    return;
  }

  listEl.innerHTML = tokens.map(t => {
    const safeLogo = sanitizeUrl(t.logoURI || 'https://assets.relay.link/icons/1/light.png');
    const safeSym = escapeHTML(t.symbol);
    const safeName = escapeHTML(t.name);
    const safeAddr = escapeHTML(t.address);
    const safePrice = escapeHTML(t.priceUsd || '');
    const chainName = escapeHTML(swapService.getChain(t.chainId || chainId).displayName);

    return `
    <div class="relay-token-row" data-sym="${safeSym}" data-addr="${safeAddr}" data-cid="${t.chainId || chainId}">
      <div class="relay-token-left">
        <img class="relay-row-icon" src="${safeLogo}" onerror="this.src='https://assets.relay.link/icons/1/light.png'">
        <div>
          <div class="relay-row-sym">${safeSym}</div>
          <div class="relay-row-sub">${safeName}</div>
        </div>
      </div>
      <div style="text-align: right;">
        <div style="font-family: var(--font-mono); font-size: 0.78rem; color: #fff;">${safePrice}</div>
        <div style="font-size: 0.65rem; color: #64748b;">${chainName}</div>
      </div>
    </div>
  `;
  }).join('');

  listEl.querySelectorAll('.relay-token-row').forEach(row => {
    row.onclick = () => {
      const sym = row.dataset.sym;
      const addr = row.dataset.addr;
      const cid = Number(row.dataset.cid);
      const chosen = tokens.find(t => t.address.toLowerCase() === addr.toLowerCase()) || {
        symbol: sym,
        address: addr,
        chainId: cid,
        decimals: 18,
        logoURI: 'https://assets.relay.link/icons/1/light.png'
      };

      if (tokenModalContext === 'from') {
        swapService.state.fromChainId = cid;
        swapService.state.fromToken = chosen;
      } else {
        swapService.state.toChainId = cid;
        swapService.state.toToken = chosen;
      }

      closeTokenModal();
      renderSwapDesk(container, appInstance);
      fetchQuote(container, appInstance);
    };
  });
}

function truncateAddress(addr) {
  if (!addr) return '';
  return addr.slice(0, 6) + '...' + addr.slice(-4);
}
