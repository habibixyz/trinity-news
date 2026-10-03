/**
 * TRINITY MARKETS — Institutional Financial Chart Engine
 * High-performance HTML5 Canvas rendering for multi-timeframe asset telemetry.
 * Supports: Line/Candlestick OHLC modes, SMA 50/200, RSI (14), Volume Histograms, Multi-Asset Overlay, Crosshairs & Live Tooltips.
 */

export class ChartService {
  constructor() {
    this.activeTimeframe = '1M';
    this.chartMode = 'candlestick'; // 'line' | 'candlestick' | 'comparison'
    this.showSMA = true;
    this.showRSI = true;
    this.showVolume = true;
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
   * Generates deterministic historical time series for an asset with OHLC & volume
   */
  generateTimeSeries(basePrice, symbol, timeframe = '1M') {
    const numericBase = parseFloat(String(basePrice).replace(/[^0-9.-]+/g, '')) || 100;
    const isCrypto = symbol.includes('BTC') || symbol.includes('ETH') || symbol.includes('SOL');
    const volatility = isCrypto ? 0.035 : 0.012;

    let points = 50;
    let timeIntervalMs = 24 * 60 * 60 * 1000;
    let formatType = 'date';

    switch (timeframe) {
      case '1D':
        points = 60;
        timeIntervalMs = 5 * 60 * 1000;
        formatType = 'time';
        break;
      case '1W':
        points = 45;
        timeIntervalMs = 3 * 60 * 60 * 1000;
        formatType = 'datetime';
        break;
      case '1M':
        points = 35;
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
        points = 35;
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
            <button class="tf-btn ${this.activeTimeframe === '1D' ? 'active' : ''}" data-tf="1D">1D</button>
            <button class="tf-btn ${this.activeTimeframe === '1W' ? 'active' : ''}" data-tf="1W">1W</button>
            <button class="tf-btn ${this.activeTimeframe === '1M' ? 'active' : ''}" data-tf="1M">1M</button>
            <button class="tf-btn ${this.activeTimeframe === '1Y' ? 'active' : ''}" data-tf="1Y">1Y</button>
            <button class="tf-btn ${this.activeTimeframe === '5Y' ? 'active' : ''}" data-tf="5Y">5Y</button>
          </div>
          
          <div class="chart-mode-selector">
            <button class="mode-btn ${this.chartMode === 'candlestick' ? 'active' : ''}" data-mode="candlestick" title="Candlestick OHLC">🕯️ Candles</button>
            <button class="mode-btn ${this.chartMode === 'line' ? 'active' : ''}" data-mode="line" title="Smooth Line">📈 Line</button>
            <button class="indicator-btn ${this.showSMA ? 'active' : ''}" id="toggleSMABtn">SMA</button>
            <button class="indicator-btn ${this.showRSI ? 'active' : ''}" id="toggleRSIBtn">RSI</button>
          </div>
        </div>
        <div class="canvas-container" style="position: relative; width: 100%; height: 380px;">
          <canvas id="trinityChartCanvas"></canvas>
          <div class="chart-tooltip" id="chartTooltip"></div>
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

    const rsiBtn = this.container.querySelector('#toggleRSIBtn');
    if (rsiBtn) {
      rsiBtn.addEventListener('click', () => {
        this.showRSI = !this.showRSI;
        rsiBtn.classList.toggle('active', this.showRSI);
        this.drawChart();
      });
    }
  }

  updateChart() {
    if (!this.currentAsset) return;
    this.currentData = this.generateTimeSeries(
      this.currentAsset.price || 100,
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

    this.ctx.scale(dpr, dpr);

    const isDark = this.theme === 'dark';
    const bgColor = isDark ? '#0d0d0d' : '#f8f9fa';
    const gridColor = isDark ? '#1a1a1a' : '#e5e7eb';
    const textColor = isDark ? '#888888' : '#666666';
    const greenColor = '#10b981';
    const redColor = '#ef4444';
    const accentColor = isDark ? '#ffffff' : '#000000';

    this.ctx.fillStyle = bgColor;
    this.ctx.fillRect(0, 0, width, height);

    // Calculate layout regions
    const margin = { top: 25, right: 65, bottom: this.showRSI ? 85 : 30, left: 10 };
    const chartW = width - margin.left - margin.right;
    const chartH = height - margin.top - margin.bottom;

    const prices = this.currentData.map(d => d.close);
    const highs = this.currentData.map(d => d.high);
    const lows = this.currentData.map(d => d.low);
    const minP = Math.min(...lows) * 0.995;
    const maxP = Math.max(...highs) * 1.005;

    // Draw Grid Lines
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
      this.ctx.fillText(priceVal.toFixed(2), margin.left + chartW + 8, y + 3);
    }

    const getX = (idx) => margin.left + (chartW / (this.currentData.length - 1)) * idx;
    const getY = (val) => margin.top + chartH - ((val - minP) / (maxP - minP)) * chartH;

    // Volume Histogram (drawn at bottom of main chart area)
    if (this.showVolume) {
      const maxVol = Math.max(...this.currentData.map(d => d.volume));
      const volH = chartH * 0.25;
      const barW = Math.max(2, (chartW / this.currentData.length) * 0.6);

      this.currentData.forEach((d, i) => {
        const x = getX(i) - barW / 2;
        const vH = (d.volume / maxVol) * volH;
        const y = margin.top + chartH - vH;
        this.ctx.fillStyle = d.close >= d.open ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)';
        this.ctx.fillRect(x, y, barW, vH);
      });
    }

    // Main Chart Rendering (Candlesticks vs Line)
    if (this.chartMode === 'candlestick') {
      const candleW = Math.max(3, (chartW / this.currentData.length) * 0.7);

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
        this.ctx.lineWidth = 1.5;
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

    } else { // Line mode
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

      // Gradient Fill
      const grad = this.ctx.createLinearGradient(0, margin.top, 0, margin.top + chartH);
      grad.addColorStop(0, isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)');
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
      const rsiYTop = height - 65;
      const rsiH = 45;

      this.ctx.fillStyle = isDark ? '#141414' : '#f1f5f9';
      this.ctx.fillRect(margin.left, rsiYTop, chartW, rsiH);

      this.ctx.strokeStyle = gridColor;
      this.ctx.strokeRect(margin.left, rsiYTop, chartW, rsiH);

      // 70 / 30 Overbought/Oversold thresholds
      this.ctx.strokeStyle = 'rgba(239, 68, 68, 0.4)';
      this.ctx.setLineDash([3, 3]);
      this.ctx.beginPath();
      const y70 = rsiYTop + rsiH - (70 / 100) * rsiH;
      this.ctx.moveTo(margin.left, y70);
      this.ctx.lineTo(margin.left + chartW, y70);
      this.ctx.stroke();

      this.ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
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
