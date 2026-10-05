/**
 * TRINITY MARKETS — Institutional Financial Chart Engine
 * High-performance HTML5 Canvas rendering for multi-timeframe asset telemetry.
 * Supports: Line/Candlestick OHLC modes, SMA 10/20, RSI (14), Volume Histograms, 
 * Interactive Crosshairs & Hover Tooltips, and Deterministic SVG Sparklines.
 */

export class ChartService {
  constructor() {
    this.activeTimeframe = '1M';
    this.chartMode = 'candlestick'; // 'line' | 'candlestick'
    this.showSMA = true;
    this.showRSI = true;
    this.showVolume = true;
    this.currentData = null;
    this.canvas = null;
    this.ctx = null;
    this.container = null;
    this.tooltipEl = null;
    this.hoverIndex = null;
    this.hoverPos = null;
    
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
   * Generates a deterministic, crisp SVG Sparkline for CoinGecko/CoinMarketCap style tables
   * @param {number|string} basePrice 
   * @param {string} symbol 
   * @param {boolean} isPositive 
   * @param {number} width 
   * @param {number} height 
   */
  generateSvgSparkline(basePrice, symbol = 'ASSET', isPositive = true, width = 135, height = 40) {
    const numericBase = parseFloat(String(basePrice).replace(/[^0-9.-]+/g, '')) || 100;
    let seed = 0;
    for (let i = 0; i < symbol.length; i++) {
      seed += symbol.charCodeAt(i) * (i + 13);
    }
    const pseudoRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    const pointsCount = 22;
    const values = [numericBase];
    const targetTrend = isPositive ? 1.05 : 0.95;
    
    for (let i = 1; i < pointsCount; i++) {
      const progress = i / (pointsCount - 1);
      const noise = (pseudoRandom() - 0.5) * 0.04;
      const trend = 1 + (targetTrend - 1) * progress;
      values.push(numericBase * trend * (1 + noise));
    }

    if (isPositive && values[values.length - 1] <= values[0]) {
      values[values.length - 1] = values[0] * 1.03;
    } else if (!isPositive && values[values.length - 1] >= values[0]) {
      values[values.length - 1] = values[0] * 0.97;
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = (max - min) || 1;
    const pad = 5;
    const chartH = height - pad * 2;
    const chartW = width - pad * 2;

    const coords = values.map((val, idx) => {
      const x = pad + (idx / (pointsCount - 1)) * chartW;
      const y = pad + chartH - ((val - min) / range) * chartH;
      return [x, y];
    });

    const pathD = coords.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt[0].toFixed(1)},${pt[1].toFixed(1)}`, '');
    const areaD = `${pathD} L ${coords[coords.length - 1][0].toFixed(1)},${height - 1} L ${coords[0][0].toFixed(1)},${height - 1} Z`;

    const strokeColor = isPositive ? '#10b981' : '#ef4444';
    const gradId = `spark_${symbol.replace(/[^a-zA-Z0-9]/g, '')}_${isPositive ? 'pos' : 'neg'}`;

    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" class="trinity-sparkline-svg" preserveAspectRatio="none" aria-label="7-Day ${symbol} Sparkline">
        <defs>
          <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${strokeColor}" stop-opacity="0.32"/>
            <stop offset="100%" stop-color="${strokeColor}" stop-opacity="0.0"/>
          </linearGradient>
        </defs>
        <path d="${areaD}" fill="url(#${gradId})" />
        <path d="${pathD}" fill="none" stroke="${strokeColor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="${coords[coords.length - 1][0].toFixed(1)}" cy="${coords[coords.length - 1][1].toFixed(1)}" r="2.5" fill="${strokeColor}" />
      </svg>
    `;
  }

  /**
   * Generates deterministic historical time series for an asset with OHLC & volume
   */
  generateTimeSeries(basePrice, symbol, timeframe = '1M') {
    const numericBase = parseFloat(String(basePrice).replace(/[^0-9.-]+/g, '')) || 100;
    const isCrypto = symbol.includes('BTC') || symbol.includes('ETH') || symbol.includes('SOL') || symbol.includes('BNB') || symbol.includes('XRP');
    const volatility = isCrypto ? 0.032 : 0.012;

    let points = 50;
    let timeIntervalMs = 24 * 60 * 60 * 1000;
    let formatType = 'date';

    switch (timeframe) {
      case '1H':
        points = 60;
        timeIntervalMs = 60 * 1000;
        formatType = 'time';
        break;
      case '24H':
      case '1D':
        points = 60;
        timeIntervalMs = 15 * 60 * 1000;
        formatType = 'time';
        break;
      case '7D':
      case '1W':
        points = 56;
        timeIntervalMs = 3 * 60 * 60 * 1000;
        formatType = 'datetime';
        break;
      case '1M':
        points = 45;
        timeIntervalMs = 24 * 60 * 60 * 1000;
        formatType = 'date';
        break;
      case '1Y':
        points = 52;
        timeIntervalMs = 7 * 24 * 60 * 60 * 1000;
        formatType = 'month';
        break;
      case 'ALL':
      case '5Y':
        points = 60;
        timeIntervalMs = 30 * 24 * 60 * 60 * 1000;
        formatType = 'year';
        break;
      default:
        points = 45;
    }

    const now = Date.now();
    let seed = 0;
    for (let i = 0; i < symbol.length; i++) {
      seed += symbol.charCodeAt(i) * (i + 1);
    }
    const pseudoRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    let current = numericBase;
    const rawWalk = [current];
    for (let i = 1; i < points; i++) {
      const step = (pseudoRandom() - 0.48) * volatility * current;
      current = Math.max(current * 0.4, current + step);
      rawWalk.unshift(current);
    }

    const scaleFactor = numericBase / rawWalk[rawWalk.length - 1];
    const series = [];
    
    for (let i = 0; i < points; i++) {
      const timestamp = new Date(now - (points - 1 - i) * timeIntervalMs);
      const close = rawWalk[i] * scaleFactor;
      const prevClose = i > 0 ? series[i - 1].close : close * (1 - (pseudoRandom() - 0.5) * volatility);
      const open = prevClose;
      const spread = Math.abs(close - open) + (close * volatility * 0.5);
      const high = Math.max(open, close) + pseudoRandom() * spread;
      const low = Math.min(open, close) - pseudoRandom() * spread;
      const volume = (pseudoRandom() * 0.8 + 0.2) * (numericBase * 10000);

      series.push({
        time: timestamp,
        open,
        high,
        low,
        close,
        price: close,
        volume,
        formatType
      });
    }

    // Calculate Indicators
    this.calculateSMA(series, 10, 'sma10');
    this.calculateSMA(series, 20, 'sma20');
    this.calculateRSI(series, 14);

    return series;
  }

  calculateSMA(series, period, key) {
    for (let i = 0; i < series.length; i++) {
      if (i < period - 1) {
        series[i][key] = null;
      } else {
        let sum = 0;
        for (let j = i - period + 1; j <= i; j++) {
          sum += series[j].close;
        }
        series[i][key] = sum / period;
      }
    }
  }

  calculateRSI(series, period = 14) {
    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period && i < series.length; i++) {
      const diff = series[i].close - series[i - 1].close;
      if (diff >= 0) gains += diff;
      else losses += Math.abs(diff);
    }

    let avgGain = gains / period;
    let avgLoss = losses / period;

    for (let i = 0; i < series.length; i++) {
      if (i < period) {
        series[i].rsi = 50;
      } else {
        const diff = series[i].close - series[i - 1].close;
        const gain = diff >= 0 ? diff : 0;
        const loss = diff < 0 ? Math.abs(diff) : 0;

        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;

        if (avgLoss === 0) {
          series[i].rsi = 100;
        } else {
          const rs = avgGain / avgLoss;
          series[i].rsi = 100 - (100 / (1 + rs));
        }
      }
    }
  }

  mount(containerId, asset, initialTimeframe = '1M') {
    this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    if (!this.container) return;

    this.activeTimeframe = initialTimeframe;
    this.currentAsset = asset;
    this.theme = localStorage.getItem('trinity_theme') || 'dark';

    this.renderContainerStructure();
    this.updateChart();

    if (!this.resizeHandler) {
      this.resizeHandler = () => this.drawChart();
      window.addEventListener('resize', this.resizeHandler);
    }
  }

  renderContainerStructure() {
    this.container.innerHTML = `
      <div class="chart-wrapper-inner">
        <div class="chart-control-bar">
          <div class="timeframe-selector">
            <button class="tf-btn ${this.activeTimeframe === '24H' || this.activeTimeframe === '1D' ? 'active' : ''}" data-tf="24H">24H</button>
            <button class="tf-btn ${this.activeTimeframe === '7D' || this.activeTimeframe === '1W' ? 'active' : ''}" data-tf="7D">7D</button>
            <button class="tf-btn ${this.activeTimeframe === '1M' ? 'active' : ''}" data-tf="1M">1M</button>
            <button class="tf-btn ${this.activeTimeframe === '1Y' ? 'active' : ''}" data-tf="1Y">1Y</button>
            <button class="tf-btn ${this.activeTimeframe === 'ALL' || this.activeTimeframe === '5Y' ? 'active' : ''}" data-tf="ALL">ALL</button>
          </div>
          
          <div class="chart-mode-selector">
            <button class="mode-btn ${this.chartMode === 'candlestick' ? 'active' : ''}" data-mode="candlestick" title="Candlestick OHLC">🕯️ Candles</button>
            <button class="mode-btn ${this.chartMode === 'line' ? 'active' : ''}" data-mode="line" title="Smooth Area Line">📈 Line</button>
            <button class="indicator-btn ${this.showSMA ? 'active' : ''}" id="toggleSMABtn">SMA (10/20)</button>
            <button class="indicator-btn ${this.showVolume ? 'active' : ''}" id="toggleVolBtn">Volume</button>
            <button class="indicator-btn ${this.showRSI ? 'active' : ''}" id="toggleRSIBtn">RSI (14)</button>
          </div>
        </div>
        <div class="canvas-container" style="position: relative; width: 100%; height: 420px; overflow: hidden; border-radius: var(--radius-sm); border: 1px solid var(--border-subtle);">
          <canvas id="trinityChartCanvas" style="display: block; cursor: crosshair;"></canvas>
          <div class="chart-tooltip" id="chartTooltip" style="display: none; position: absolute; pointer-events: none; z-index: 20;"></div>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('#trinityChartCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.tooltipEl = this.container.querySelector('#chartTooltip');

    // Attach control listeners
    this.container.querySelectorAll('.tf-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.container.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.activeTimeframe = e.target.getAttribute('data-tf');
        this.updateChart();
      });
    });

    this.container.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.container.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.chartMode = e.target.getAttribute('data-mode');
        this.drawChart();
      });
    });

    const smaBtn = this.container.querySelector('#toggleSMABtn');
    if (smaBtn) {
      smaBtn.addEventListener('click', () => {
        this.showSMA = !this.showSMA;
        smaBtn.classList.toggle('active', this.showSMA);
        this.drawChart();
      });
    }

    const volBtn = this.container.querySelector('#toggleVolBtn');
    if (volBtn) {
      volBtn.addEventListener('click', () => {
        this.showVolume = !this.showVolume;
        volBtn.classList.toggle('active', this.showVolume);
        this.drawChart();
      });
    }

    const rsiBtn = this.container.querySelector('#toggleRSIBtn');
    if (rsiBtn) {
      rsiBtn.addEventListener('click', () => {
        this.showRSI = !this.showRSI;
        rsiBtn.classList.toggle('active', this.showRSI);
        this.drawChart();
      });
    }

    // Attach interactive crosshair & tooltip handlers
    this.canvas.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
    this.canvas.addEventListener('mouseleave', () => this.handleCanvasMouseLeave());
  }

  handleCanvasMouseMove(e) {
    if (!this.currentData || this.currentData.length === 0 || !this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const parent = this.canvas.parentElement;
    const width = parent.clientWidth;
    const margin = { top: 25, right: 75, bottom: this.showRSI ? 85 : 30, left: 15 };
    const chartW = width - margin.left - margin.right;

    // Determine nearest data point index
    const clampedX = Math.max(margin.left, Math.min(margin.left + chartW, x));
    const ratio = (clampedX - margin.left) / chartW;
    const index = Math.round(ratio * (this.currentData.length - 1));

    if (index >= 0 && index < this.currentData.length) {
      this.hoverIndex = index;
      this.hoverPos = { x, y };
      this.drawChart();
      this.updateTooltip(this.currentData[index], x, y, width);
    }
  }

  handleCanvasMouseLeave() {
    this.hoverIndex = null;
    this.hoverPos = null;
    if (this.tooltipEl) {
      this.tooltipEl.style.display = 'none';
    }
    this.drawChart();
  }

  updateTooltip(point, mouseX, mouseY, containerWidth) {
    if (!this.tooltipEl) return;
    const isDark = (this.theme === 'dark');
    const isBullish = point.close >= point.open;
    const changePct = ((point.close - point.open) / point.open) * 100;
    const changeSign = changePct >= 0 ? '+' : '';
    const color = isBullish ? '#10b981' : '#ef4444';

    let dateStr = point.time.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (point.formatType === 'time') {
      dateStr = point.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    const fmt = (n) => {
      if (n >= 1000) return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      if (n >= 1) return n.toFixed(2);
      return n.toFixed(4);
    };

    this.tooltipEl.innerHTML = `
      <div style="background: ${isDark ? '#0c0c12' : '#ffffff'}; border: 1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.18)'}; padding: 0.65rem 0.85rem; border-radius: 6px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; min-width: 170px;">
        <div style="color: var(--text-muted); font-size: 0.65rem; margin-bottom: 0.35rem; display: flex; justify-content: space-between;">
          <span>${dateStr}</span>
          <span style="color: ${color}; font-weight: 700;">${changeSign}${changePct.toFixed(2)}%</span>
        </div>
        <div style="font-size: 1.05rem; font-weight: 800; color: ${color}; margin-bottom: 0.4rem;">
          ${this.currentAsset?.symbol?.includes('INR') || this.currentAsset?.symbol?.includes('NIFTY') || this.currentAsset?.symbol?.includes('SENSEX') || this.currentAsset?.symbol === 'RELIANCE' || this.currentAsset?.symbol === 'TCS' ? '₹' : '$'}${fmt(point.close)}
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.25rem 0.5rem; color: var(--text-secondary); font-size: 0.68rem;">
          <div><span style="color: var(--text-muted);">Open:</span> ${fmt(point.open)}</div>
          <div><span style="color: var(--text-muted);">High:</span> ${fmt(point.high)}</div>
          <div><span style="color: var(--text-muted);">Low:</span> ${fmt(point.low)}</div>
          <div><span style="color: var(--text-muted);">Vol:</span> ${(point.volume / 1000000).toFixed(1)}M</div>
          ${point.rsi ? `<div style="grid-column: 1/-1; padding-top: 0.2rem; border-top: 1px solid var(--border-subtle);"><span style="color: #8b5cf6;">RSI(14):</span> ${point.rsi.toFixed(1)}</div>` : ''}
        </div>
      </div>
    `;

    // Positioning logic (keep within canvas bounds)
    this.tooltipEl.style.display = 'block';
    const tooltipWidth = 190;
    let leftPos = mouseX + 15;
    if (leftPos + tooltipWidth > containerWidth - 20) {
      leftPos = mouseX - tooltipWidth - 15;
    }
    let topPos = Math.max(10, mouseY - 60);

    this.tooltipEl.style.left = `${leftPos}px`;
    this.tooltipEl.style.top = `${topPos}px`;
  }

  updateChart() {
    if (!this.currentAsset) return;
    this.currentData = this.generateTimeSeries(
      this.currentAsset.rawPrice || this.currentAsset.value || this.currentAsset.price || 100,
      this.currentAsset.symbol || 'ASSET',
      this.activeTimeframe
    );
    this.drawChart();
  }

  drawChart() {
    if (!this.canvas || !this.currentData || this.currentData.length === 0) return;

    const parent = this.canvas.parentElement;
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0); // reset transform
    this.ctx.scale(dpr, dpr);

    const isDark = (this.theme === 'dark');
    const bgColor = isDark ? '#09090d' : '#ffffff';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
    const textColor = isDark ? '#71717a' : '#71717a';
    const greenColor = '#10b981';
    const redColor = '#ef4444';
    const accentColor = isDark ? '#ffffff' : '#000000';

    this.ctx.fillStyle = bgColor;
    this.ctx.fillRect(0, 0, width, height);

    // Calculate layout regions
    const margin = { top: 25, right: 75, bottom: this.showRSI ? 85 : 30, left: 15 };
    const chartW = width - margin.left - margin.right;
    const chartH = height - margin.top - margin.bottom;

    const highs = this.currentData.map(d => d.high);
    const lows = this.currentData.map(d => d.low);
    const minP = Math.min(...lows) * 0.995;
    const maxP = Math.max(...highs) * 1.005;

    // Draw Horizontal Grid Lines & Price Labels
    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 1;

    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const y = margin.top + (chartH / gridLines) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(margin.left, y);
      this.ctx.lineTo(margin.left + chartW, y);
      this.ctx.stroke();

      const priceVal = maxP - ((maxP - minP) / gridLines) * i;
      this.ctx.fillStyle = textColor;
      this.ctx.font = '10px "JetBrains Mono", monospace';
      this.ctx.fillText(priceVal >= 1000 ? priceVal.toFixed(1) : priceVal.toFixed(2), margin.left + chartW + 8, y + 3);
    }

    const getX = (idx) => margin.left + (chartW / (this.currentData.length - 1)) * idx;
    const getY = (val) => margin.top + chartH - ((val - minP) / (maxP - minP)) * chartH;

    // Volume Histogram (drawn at bottom of main chart area)
    if (this.showVolume) {
      const maxVol = Math.max(...this.currentData.map(d => d.volume));
      const volH = chartH * 0.22;
      const barW = Math.max(2, (chartW / this.currentData.length) * 0.6);

      this.currentData.forEach((d, i) => {
        const x = getX(i) - barW / 2;
        const vH = (d.volume / maxVol) * volH;
        const y = margin.top + chartH - vH;
        this.ctx.fillStyle = d.close >= d.open ? 'rgba(16, 185, 129, 0.22)' : 'rgba(239, 68, 68, 0.22)';
        this.ctx.fillRect(x, y, barW, vH);
      });
    }

    // Main Chart Rendering (Candlesticks vs Line)
    if (this.chartMode === 'candlestick') {
      const candleW = Math.max(3, (chartW / this.currentData.length) * 0.65);

      this.currentData.forEach((d, i) => {
        const x = getX(i);
        const openY = getY(d.open);
        const closeY = getY(d.close);
        const highY = getY(d.high);
        const lowY = getY(d.low);
        const isBullish = d.close >= d.open;
        const color = isBullish ? greenColor : redColor;

        // Wick
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1.4;
        this.ctx.beginPath();
        this.ctx.moveTo(x, highY);
        this.ctx.lineTo(x, lowY);
        this.ctx.stroke();

        // Body
        this.ctx.fillStyle = color;
        const topY = Math.min(openY, closeY);
        const bH = Math.max(2, Math.abs(closeY - openY));
        this.ctx.fillRect(x - candleW / 2, topY, candleW, bH);
      });

    } else { // Smooth Line mode
      this.ctx.strokeStyle = accentColor;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();

      this.currentData.forEach((d, i) => {
        const x = getX(i);
        const y = getY(d.close);
        if (i === 0) this.ctx.moveTo(x, y);
        else this.ctx.lineTo(x, y);
      });
      this.ctx.stroke();

      // Gradient Fill Under Line
      const grad = this.ctx.createLinearGradient(0, margin.top, 0, margin.top + chartH);
      grad.addColorStop(0, isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.12)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      this.ctx.fillStyle = grad;
      this.ctx.lineTo(margin.left + chartW, margin.top + chartH);
      this.ctx.lineTo(margin.left, margin.top + chartH);
      this.ctx.closePath();
      this.ctx.fill();
    }

    // SMA 10 & 20 Overlays
    if (this.showSMA) {
      this.drawSMALine(this.currentData, 'sma10', '#3b82f6', getX, getY);
      this.drawSMALine(this.currentData, 'sma20', '#f59e0b', getX, getY);
    }

    // RSI Sub-chart Panel
    if (this.showRSI) {
      const rsiYTop = height - 68;
      const rsiH = 46;

      this.ctx.fillStyle = isDark ? '#0c0c11' : '#f4f4f7';
      this.ctx.fillRect(margin.left, rsiYTop, chartW, rsiH);

      this.ctx.strokeStyle = gridColor;
      this.ctx.strokeRect(margin.left, rsiYTop, chartW, rsiH);

      // 70 / 30 Overbought/Oversold thresholds
      this.ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
      this.ctx.setLineDash([3, 3]);
      this.ctx.beginPath();
      const y70 = rsiYTop + rsiH - (70 / 100) * rsiH;
      this.ctx.moveTo(margin.left, y70);
      this.ctx.lineTo(margin.left + chartW, y70);
      this.ctx.stroke();

      this.ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
      this.ctx.beginPath();
      const y30 = rsiYTop + rsiH - (30 / 100) * rsiH;
      this.ctx.moveTo(margin.left, y30);
      this.ctx.lineTo(margin.left + chartW, y30);
      this.ctx.stroke();
      this.ctx.setLineDash([]);

      // Label RSI
      this.ctx.fillStyle = textColor;
      this.ctx.font = '9px "JetBrains Mono", monospace';
      this.ctx.fillText('RSI(14)', margin.left + 5, rsiYTop + 12);
      this.ctx.fillText('70', margin.left + chartW + 5, y70 + 3);
      this.ctx.fillText('30', margin.left + chartW + 5, y30 + 3);

      // Plot RSI curve
      this.ctx.strokeStyle = '#8b5cf6';
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.currentData.forEach((d, i) => {
        const x = getX(i);
        const rsiVal = d.rsi || 50;
        const rY = rsiYTop + rsiH - (rsiVal / 100) * rsiH;
        if (i === 0) this.ctx.moveTo(x, rY);
        else this.ctx.lineTo(x, rY);
      });
      this.ctx.stroke();
    }

    // Crosshair Lines & Right Price Badge when Hovered
    if (this.hoverIndex !== null && this.hoverIndex >= 0 && this.hoverIndex < this.currentData.length) {
      const activePoint = this.currentData[this.hoverIndex];
      const hX = getX(this.hoverIndex);
      const hY = getY(activePoint.close);

      this.ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)';
      this.ctx.lineWidth = 1;
      this.ctx.setLineDash([4, 4]);

      // Vertical line
      this.ctx.beginPath();
      this.ctx.moveTo(hX, margin.top);
      this.ctx.lineTo(hX, margin.top + chartH);
      this.ctx.stroke();

      // Horizontal line
      this.ctx.beginPath();
      this.ctx.moveTo(margin.left, hY);
      this.ctx.lineTo(margin.left + chartW, hY);
      this.ctx.stroke();
      this.ctx.setLineDash([]);

      // Glowing dot at active price
      this.ctx.fillStyle = activePoint.close >= activePoint.open ? greenColor : redColor;
      this.ctx.beginPath();
      this.ctx.arc(hX, hY, 4, 0, Math.PI * 2);
      this.ctx.fill();

      // Price badge on right axis
      const badgeText = activePoint.close.toFixed(2);
      this.ctx.fillStyle = activePoint.close >= activePoint.open ? greenColor : redColor;
      this.ctx.fillRect(margin.left + chartW + 2, hY - 9, 68, 18);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 9px "JetBrains Mono", monospace';
      this.ctx.fillText(badgeText, margin.left + chartW + 6, hY + 4);
    }
  }

  drawSMALine(data, key, color, getX, getY) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 1.5;
    this.ctx.beginPath();
    let started = false;

    data.forEach((d, i) => {
      if (d[key] !== null && d[key] !== undefined) {
        const x = getX(i);
        const y = getY(d[key]);
        if (!started) {
          this.ctx.moveTo(x, y);
          started = true;
        } else {
          this.ctx.lineTo(x, y);
        }
      }
    });
    if (started) this.ctx.stroke();
  }
}

export const chartService = new ChartService();
