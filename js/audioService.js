/**
 * TRINITY MARKETS — Audio Broadcast & Voice Synthesis Service
 * Provides institutional audio news anchor narration, dispatch playback, and studio broadcast queue.
 */

export class AudioService {
  constructor() {
    this.synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.currentArticle = null;
    this.rate = 1.0;
    this.pitch = 1.0;
    this.volume = 1.0;
    this.voices = [];
    this.selectedVoice = null;
    this.onStateChangeCallbacks = [];
    this.onProgressCallbacks = [];

    if (this.synth) {
      this.initVoices();
      if (typeof window !== 'undefined' && window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  initVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices() || [];
    // Prefer high quality English voices (Google US English, Natural, Samantha, Alex, Daniel)
    const preferred = this.voices.find(v => 
      v.lang.startsWith('en') && (
        v.name.includes('Natural') || 
        v.name.includes('Google US English') || 
        v.name.includes('Samantha') || 
        v.name.includes('Daniel') ||
        v.name.includes('Karen') ||
        v.name.includes('Microsoft Guy') ||
        v.name.includes('Microsoft Aria')
      )
    ) || this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];

    this.selectedVoice = preferred || null;
  }

  getVoices() {
    return this.voices;
  }

  setVoiceByName(name) {
    const found = this.voices.find(v => v.name === name);
    if (found) this.selectedVoice = found;
  }

  onStateChange(cb) {
    this.onStateChangeCallbacks.push(cb);
  }

  onProgress(cb) {
    this.onProgressCallbacks.push(cb);
  }

  notifyStateChange() {
    this.onStateChangeCallbacks.forEach(cb => cb({
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      article: this.currentArticle,
      rate: this.rate
    }));
  }

  speakText(text, title = 'TRINITY Broadcast Dispatch', options = {}) {
    if (!this.synth) {
      console.warn('Speech synthesis not supported in this browser.');
      return false;
    }

    this.stop();

    // Clean markdown syntax from text for smooth narration
    const cleanText = text
      .replace(/#+\s+/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/>\s+/g, '')
      .replace(/---/g, '')
      .trim();

    const fullScript = `${title}. ${cleanText}`;
    const utterance = new SpeechSynthesisUtterance(fullScript);
    
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    utterance.rate = options.rate || this.rate;
    utterance.pitch = options.pitch || this.pitch;
    utterance.volume = options.volume || this.volume;

    utterance.onstart = () => {
      this.isPlaying = true;
      this.isPaused = false;
      this.currentArticle = { title, text };
      this.notifyStateChange();
    };

    utterance.onend = () => {
      this.isPlaying = false;
      this.isPaused = false;
      this.currentUtterance = null;
      this.notifyStateChange();
    };

    utterance.onerror = (e) => {
      console.error('Audio synthesis error:', e);
      this.isPlaying = false;
      this.isPaused = false;
      this.currentUtterance = null;
      this.notifyStateChange();
    };

    utterance.onboundary = (e) => {
      if (e.name === 'word') {
        const charIndex = e.charIndex;
        const progress = Math.min(100, Math.round((charIndex / fullScript.length) * 100));
        this.onProgressCallbacks.forEach(cb => cb({ charIndex, total: fullScript.length, progress }));
      }
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
    return true;
  }

  speakArticle(article) {
    if (!article) return false;
    const bodyText = article.content || article.excerpt || article.summary || '';
    const scriptText = `Dispatch by ${article.author || 'Trinity Board'}. Category: ${article.category || 'Macro'}. ${bodyText}`;
    return this.speakText(scriptText, article.title, { rate: this.rate });
  }

  pause() {
    if (this.synth && this.isPlaying && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
      this.notifyStateChange();
    }
  }

  resume() {
    if (this.synth && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.notifyStateChange();
    }
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isPlaying = false;
      this.isPaused = false;
      this.currentUtterance = null;
      this.notifyStateChange();
    }
  }

  togglePlayPause() {
    if (this.isPlaying) {
      if (this.isPaused) {
        this.resume();
      } else {
        this.pause();
      }
    }
  }

  setRate(newRate) {
    this.rate = parseFloat(newRate);
    if (this.isPlaying && this.currentArticle) {
      const current = this.currentArticle;
      this.speakText(current.text, current.title, { rate: this.rate });
    } else {
      this.notifyStateChange();
    }
  }

  generateStudioBroadcastScript(marketData, articles = []) {
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const topStory = articles[0] ? articles[0].title : 'Equities and Global Commodities show mixed momentum amid Central Bank rate reviews.';
    
    // Pick key tickers
    const sp500 = marketData.find(m => m.symbol === 'SPY') || { price: 512.40, change: '+0.85%' };
    const nvda = marketData.find(m => m.symbol === 'NVDA') || { price: 128.50, change: '+2.40%' };
    const btc = marketData.find(m => m.symbol === 'BTC') || { price: 67450, change: '+1.90%' };
    const gold = marketData.find(m => m.symbol === 'XAU/USD') || { price: 2380.50, change: '+0.45%' };
    const us10y = marketData.find(m => m.symbol === 'US10Y') || { price: '4.22%', change: '-3bps' };

    return `Welcome to TRINITY MARKETS Live Studio Broadcast. The time is ${timeStr}. Our top dispatches: ${topStory}. Turning to real-time telemetry: S and P 500 ETF is trading at ${sp500.price}, change ${sp500.change}. Nvidia at ${nvda.price}, change ${nvda.change}. Bitcoin spot at ${btc.price}, change ${btc.change}. Spot Gold at ${gold.price}, up ${gold.change}. US 10-Year Treasury Yield stands at ${us10y.price}. Stay tuned for autonomous macro dispatches from the Trinity AI desk.`;
  }
}

export const audioService = new AudioService();
