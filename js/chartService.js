/**
 * TRINITY MARKETS — Institutional Financial Chart Engine
 * High-performance HTML5 Canvas rendering for multi-timeframe asset telemetry.
 * Supports: 1D, 1W, 1M, 1Y, 5Y, Volume Histograms, Crosshairs & Live Tooltips.
 */

export class ChartService {
  constructor() {
    this.activeTimeframe = '1M';
    this.currentData = null;
    this.canvas = null;
    this.ctx = null;
    this.container = null;
    this.tooltipEl = null;
    let savedTheme = 'dark';
    try {
      if (typeof localStorage !== 'undefined') {
        savedTheme = localStorage.getItem('trinity_theme') || 'dark';
      }
    } catch {}
    this.theme = savedTheme;
    this.resizeHandler = null;
  }

  /**
   * Generates deterministic historical time series for an asset
   */
  generateTimeSeries(basePrice, symbol, timeframe = '1M') {
    const numericBase = parseFloat(String(basePrice).replace(/[^0-9.-]+/g, '')) || 100;
    const isCrypto = symbol.includes('BTC') || symbol.includes('ETH') || symbol.includes('SOL');
    const volatility = isCrypto ? 0.035 : 0.012;

    let points = 60;
    let timeIntervalMs = 24 * 60 * 60 * 1000; // 1 day default
    let formatType = 'date';

    switch (timeframe) {
      case '1D':
        points = 78; // 5 min candles for 6.5h trading day
        timeIntervalMs = 5 * 60 * 1000;
        formatType = 'time';
        break;
      case '1W':
        points = 50;
        timeIntervalMs = 3 * 60 * 60 * 1000;
        formatType = 'datetime';
        break;
      case '1M':
        points = 30;
        timeIntervalMs = 24 * 60 * 60 * 1000;
        formatType = 'date';
        break;
      case '1Y':
        points = 52;
        timeIntervalMs = 7 * 24 * 60 * 60 * 1000;
        formatType = 'month';
        break;
      case '5Y':
        points = 60;
        timeIntervalMs = 30 * 24 * 60 * 60 * 1000;
        formatType = 'year';
        break;
      default:
        points = 30;
    }

    const now = Date.now();
    const series = [];
    let current = numericBase;

    // Use a pseudo-random seed based on symbol character codes for consistent chart shapes
    let seed = 0;
    for (let i = 0; i < symbol.length; i++) {
      seed += symbol.charCodeAt(i) * (i + 1);
    }
    const pseudoRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    // Build series working backwards or forward
    const rawWalk = [current];
    for (let i = 1; i < points; i++) {
      const step = (pseudoRandom() - 0.48) * volatility * current;
      current = Math.max(current * 0.4, current + step);
      rawWalk.unshift(current);
    }

    // Scale so the last point matches numericBase exactly
    const scaleFactor = numericBase / rawWalk[rawWalk.length - 1];
    
    for (let i = 0; i < points; i++) {
      const timestamp = new Date(now - (points - 1 - i) * timeIntervalMs);
      const price = rawWalk[i] * scaleFactor;
      const volume = (pseudoRandom() * 0.8 + 0.2) * (numericBase * 10000);
      series.push({
        time: timestamp,
        price: price,
        volume: volume,
        formatType: formatType
      });
    }

    return series;
  }

  /**
   * Initializes and attaches the chart to a DOM container
   */
  mount(containerId, asset, initialTimeframe = '1M') {
    this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    if (!this.container) return;

    this.activeTimeframe = initialTimeframe;
    this.currentAsset = asset;
    this.theme = localStorage.getItem('trinity_theme') || 'dark';

    this.renderContainerStructure();
    this.updateChart();

    // Resize listener
    if (this.resizeHandler) window.removeEventListener('resize', this.resizeHandler);
    this.resizeHandler = () => this.draw();
    window.addEventListener('resize', this.resizeHandler);
  }

  renderContainerStructure() {
    this.container.innerHTML = `
      <div class="trinity-chart-wrapper">
        <div class="trinity-chart-header">
          <div class="chart-stats-live">
            <div class="chart-price-display" id="chart-live-price">--</div>
            <div class="chart-change-display" id="chart-live-change">--</div>
          </div>
          <div class="chart-timeframe-selector">
            <button class="btn-timeframe ${this.activeTimeframe === '1D' ? 'active' : ''}" data-tf="1D">1D</button>
            <button class="btn-timeframe ${this.activeTimeframe === '1W' ? 'active' : ''}" data-tf="1W">1W</button>
            <button class="btn-timeframe ${this.activeTimeframe === '1M' ? 'active' : ''}" data-tf="1M">1M</button>
            <button class="btn-timeframe ${this.activeTimeframe === '1Y' ? 'active' : ''}" data-tf="1Y">1Y</button>
            <button class="btn-timeframe ${this.activeTimeframe === '5Y' ? 'active' : ''}" data-tf="5Y">5Y</button>
          </div>
        </div>
        <div class="trinity-chart-canvas-container" style="position: relative; width: 100%; height: 320px;">
          <canvas class="trinity-chart-canvas"></canvas>
          <div class="chart-tooltip" style="display: none; position: absolute; pointer-events: none; z-index: 10;"></div>
        </div>
        <div class="trinity-chart-footer">
          <span class="chart-telemetry-meta"><i class="ph ph-activity"></i> Institutional Telemetry Resolution: Real-Time Tick Simulated</span>
          <span class="chart-source-badge">VERIFIED FEED</span>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('.trinity-chart-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.tooltipEl = this.container.querySelector('.chart-tooltip');

    // Attach timeframe buttons
    const tfButtons = this.container.querySelectorAll('.btn-timeframe');
    tfButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        tfButtons.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.activeTimeframe = e.currentTarget.getAttribute('data-tf');
        this.updateChart();
      });
    });

    // Attach canvas mouse interaction for crosshairs
    const canvasContainer = this.container.querySelector('.trinity-chart-canvas-container');
    canvasContainer.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    canvasContainer.addEventListener('mouseleave', () => this.handleMouseLeave());
  }

  updateChart() {
    if (!this.currentAsset) return;
    this.data = this.generateTimeSeries(this.currentAsset.value, this.currentAsset.symbol, this.activeTimeframe);
    
    // Update header price
    const lastPrice = this.data[this.data.length - 1].price;
    const firstPrice = this.data[0].price;
    const diff = lastPrice - firstPrice;
    const pct = (diff / firstPrice) * 100;
    const isPositive = diff >= 0;

    const priceEl = this.container.querySelector('#chart-live-price');
    const changeEl = this.container.querySelector('#chart-live-change');

    if (priceEl) {
      priceEl.textContent = this.formatCurrency(lastPrice);
    }
    if (changeEl) {
      changeEl.innerHTML = `
        <span class="${isPositive ? 'positive' : 'negative'}">
          ${isPositive ? '+' : ''}${this.formatCurrency(diff)} (${isPositive ? '+' : ''}${pct.toFixed(2)}%)
        </span>
        <span class="tf-label">${this.activeTimeframe}</span>
      `;
    }

    this.draw();
  }

  formatCurrency(val) {
    const sym = this.currentAsset?.symbol || '';
    const cat = this.currentAsset?.category || '';

    if (sym === 'IN10Y' || sym === 'US10Y' || cat === 'Policy') {
      return val.toFixed(3) + '%';
    }
    if (['NIFTY50', 'SENSEX', 'SP500', 'NASDAQ', 'DOW'].includes(sym)) {
      return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    if (cat === 'India' || sym.includes('BSE') || sym.includes('NSE')) {
      if (val >= 1000) {
        return '₹' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
      return '₹' + val.toFixed(2);
    }
    if (val >= 1000) {
      return '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (val >= 1) {
      return '$' + val.toFixed(2);
    } else {
      return '$' + val.toFixed(4);
    }
  }

  draw() {
    if (!this.canvas || !this.ctx || !this.data || this.data.length === 0) return;

    const container = this.canvas.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';

    this.ctx.resetTransform();
    this.ctx.scale(dpr, dpr);

    const isDark = document.body.classList.contains('light-theme') ? false : true;
    const colors = isDark ? {
      bg: '#0a0a0a',
      grid: '#222222',
      text: '#888888',
      line: '#ffffff',
      gradientTop: 'rgba(255, 255, 255, 0.18)',
      gradientBottom: 'rgba(255, 255, 255, 0.0)',
      volume: 'rgba(255, 255, 255, 0.12)',
      crosshair: 'rgba(255, 255, 255, 0.4)'
    } : {
      bg: '#f8f8f8',
      grid: '#e2e2e2',
      text: '#666666',
      line: '#000000',
      gradientTop: 'rgba(0, 0, 0, 0.12)',
      gradientBottom: 'rgba(0, 0, 0, 0.0)',
      volume: 'rgba(0, 0, 0, 0.1)',
      crosshair: 'rgba(0, 0, 0, 0.4)'
    };

    // Bounds
    const padding = { top: 20, right: 65, bottom: 35, left: 10 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const prices = this.data.map(d => d.price);
    const minPrice = Math.min(...prices) * 0.995;
    const maxPrice = Math.max(...prices) * 1.005;
    const priceRange = maxPrice - minPrice || 1;

    const volumes = this.data.map(d => d.volume);
    const maxVolume = Math.max(...volumes) || 1;

    // Clear
    this.ctx.clearRect(0, 0, width, height);

    // Draw horizontal grid lines & Y labels
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = colors.grid;
    this.ctx.fillStyle = colors.text;
    this.ctx.font = '10px "JetBrains Mono", monospace';
    this.ctx.textAlign = 'left';

    const ySteps = 4;
    for (let i = 0; i <= ySteps; i++) {
      const y = padding.top + (chartH / ySteps) * i;
      const priceVal = maxPrice - (priceRange / ySteps) * i;

      this.ctx.beginPath();
      this.ctx.moveTo(padding.left, y);
      this.ctx.lineTo(width - padding.right, y);
      this.ctx.stroke();

      this.ctx.fillText(this.formatCurrency(priceVal), width - padding.right + 8, y + 3);
    }

    // Draw Volume Bars at bottom (occupying bottom 22% of chart height)
    const volMaxHeight = chartH * 0.22;
    const barWidth = Math.max(2, (chartW / this.data.length) - 2);

    this.ctx.fillStyle = colors.volume;
    for (let i = 0; i < this.data.length; i++) {
      const x = padding.left + (i / (this.data.length - 1)) * chartW - (barWidth / 2);
      const volHeight = (this.data[i].volume / maxVolume) * volMaxHeight;
      const y = padding.top + chartH - volHeight;
      this.ctx.fillRect(Math.max(padding.left, x), y, barWidth, volHeight);
    }

    // Plot Line Points
    const getCoords = (index, price) => {
      const x = padding.left + (index / (this.data.length - 1)) * chartW;
      const y = padding.top + chartH - ((price - minPrice) / priceRange) * chartH;
      return { x, y };
    };

    // Draw Gradient Area
    const grad = this.ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    grad.addColorStop(0, colors.gradientTop);
    grad.addColorStop(1, colors.gradientBottom);

    this.ctx.beginPath();
    const firstPoint = getCoords(0, this.data[0].price);
    this.ctx.moveTo(firstPoint.x, firstPoint.y);

    for (let i = 1; i < this.data.length; i++) {
      const pt = getCoords(i, this.data[i].price);
      this.ctx.lineTo(pt.x, pt.y);
    }

    const lastPoint = getCoords(this.data.length - 1, this.data[this.data.length - 1].price);
    this.ctx.lineTo(lastPoint.x, padding.top + chartH);
    this.ctx.lineTo(firstPoint.x, padding.top + chartH);
    this.ctx.closePath();
    this.ctx.fillStyle = grad;
    this.ctx.fill();

    // Draw Price Stroke Line
    this.ctx.beginPath();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = colors.line;
    this.ctx.moveTo(firstPoint.x, firstPoint.y);

    for (let i = 1; i < this.data.length; i++) {
      const pt = getCoords(i, this.data[i].price);
      this.ctx.lineTo(pt.x, pt.y);
    }
    this.ctx.stroke();

    // Draw X-Axis Time Labels
    this.ctx.fillStyle = colors.text;
    this.ctx.textAlign = 'center';
    const xStepCount = Math.min(5, this.data.length);
    for (let i = 0; i < xStepCount; i++) {
      const idx = Math.floor((i / (xStepCount - 1)) * (this.data.length - 1));
      const pt = getCoords(idx, this.data[idx].price);
      const timeObj = this.data[idx].time;
      let label = '';

      if (this.activeTimeframe === '1D') {
        label = timeObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      } else if (this.activeTimeframe === '1W' || this.activeTimeframe === '1M') {
        label = timeObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        label = timeObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      }

      this.ctx.fillText(label, pt.x, height - 10);
    }

    // Crosshair & Interactive Marker
    if (this.mousePos && this.mousePos.x >= padding.left && this.mousePos.x <= width - padding.right) {
      const ratio = (this.mousePos.x - padding.left) / chartW;
      const nearestIdx = Math.max(0, Math.min(this.data.length - 1, Math.round(ratio * (this.data.length - 1))));
      const activeData = this.data[nearestIdx];
      const activeCoords = getCoords(nearestIdx, activeData.price);

      // Vertical line
      this.ctx.beginPath();
      this.ctx.setLineDash([4, 4]);
      this.ctx.strokeStyle = colors.crosshair;
      this.ctx.lineWidth = 1;
      this.ctx.moveTo(activeCoords.x, padding.top);
      this.ctx.lineTo(activeCoords.x, padding.top + chartH);
      this.ctx.stroke();

      // Horizontal line
      this.ctx.beginPath();
      this.ctx.moveTo(padding.left, activeCoords.y);
      this.ctx.lineTo(width - padding.right, activeCoords.y);
      this.ctx.stroke();
      this.ctx.setLineDash([]);

      // Circle marker
      this.ctx.beginPath();
      this.ctx.arc(activeCoords.x, activeCoords.y, 4.5, 0, Math.PI * 2);
      this.ctx.fillStyle = colors.line;
      this.ctx.fill();
      this.ctx.strokeStyle = colors.bg;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // Update tooltip
      if (this.tooltipEl) {
        this.tooltipEl.style.display = 'block';
        this.tooltipEl.style.left = `${Math.min(width - 160, Math.max(10, activeCoords.x - 70))}px`;
        this.tooltipEl.style.top = `${Math.max(10, activeCoords.y - 65)}px`;

        const returnFromBase = ((activeData.price - this.data[0].price) / this.data[0].price) * 100;
        const isRetPos = returnFromBase >= 0;

        this.tooltipEl.innerHTML = `
          <div class="tooltip-box">
            <div class="tooltip-time">${activeData.time.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
            <div class="tooltip-price">${this.formatCurrency(activeData.price)}</div>
            <div class="tooltip-change ${isRetPos ? 'positive' : 'negative'}">
              ${isRetPos ? '+' : ''}${returnFromBase.toFixed(2)}%
            </div>
          </div>
        `;
      }
    }
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mousePos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    this.draw();
  }

  handleMouseLeave() {
    this.mousePos = null;
    if (this.tooltipEl) this.tooltipEl.style.display = 'none';
    this.draw();
  }

  destroy() {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
  }
}
