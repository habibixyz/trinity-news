/**
 * TRINITY MARKETS — Macro Economic Calendar & Catalyst Market Radar Service
 * Provides central bank event countdowns, CPI/Jobs releases, earnings beat/miss track records, and catalyst alert signals.
 */

export class CalendarService {
  constructor() {
    this.events = [
      {
        id: 'fomc-sep-2026',
        title: 'FOMC Interest Rate Decision & Monetary Policy Statement',
        category: 'Central Bank',
        region: 'US',
        flag: '🇺🇸',
        date: '2026-09-24T18:00:00Z',
        impact: 'HIGH',
        forecast: '5.00%',
        previous: '5.25%',
        actual: null,
        description: 'Federal Reserve policy decision on benchmark federal funds target rate range with economic projections dotplot.'
      },
      {
        id: 'cpi-us-aug',
        title: 'US Consumer Price Index (CPI YoY)',
        category: 'Inflation',
        region: 'US',
        flag: '🇺🇸',
        date: '2026-09-28T12:30:00Z',
        impact: 'HIGH',
        forecast: '2.8%',
        previous: '2.9%',
        actual: null,
        description: 'Headline inflation telemetry measuring consumer price basket changes across urban consumers.'
      },
      {
        id: 'ecb-rate-oct',
        title: 'ECB Governing Council Policy Meeting',
        category: 'Central Bank',
        region: 'EU',
        flag: '🇪🇺',
        date: '2026-10-08T12:15:00Z',
        impact: 'HIGH',
        forecast: '3.50%',
        previous: '3.75%',
        actual: null,
        description: 'European Central Bank main refinancing operations and deposit facility rate determination.'
      },
      {
        id: 'nfp-us-sep',
        title: 'US Non-Farm Payrolls & Unemployment Rate',
        category: 'Labor',
        region: 'US',
        flag: '🇺🇸',
        date: '2026-10-02T12:30:00Z',
        impact: 'HIGH',
        forecast: '+175K / 4.1%',
        previous: '+164K / 4.2%',
        actual: null,
        description: 'Bureau of Labor Statistics employment dispatches detailing total non-farm payroll additions.'
      },
      {
        id: 'boj-policy-oct',
        title: 'Bank of Japan Policy Rate & Yield Curve Target',
        category: 'Central Bank',
        region: 'JP',
        flag: '🇯🇵',
        date: '2026-10-15T03:00:00Z',
        impact: 'HIGH',
        forecast: '0.25%',
        previous: '0.25%',
        actual: null,
        description: 'BOJ interest rate decision and Japanese Government Bond (JGB) yield operational target band.'
      }
    ];

    this.earningsMatrix = [
      { symbol: 'NVDA', company: 'NVIDIA Corp', date: '2026-11-18', epsForecast: '$0.68', epsPrev: '$0.52', trackRecord: '8/8 Beats' },
      { symbol: 'AAPL', company: 'Apple Inc.', date: '2026-10-30', epsForecast: '$1.58', epsPrev: '$1.46', trackRecord: '7/8 Beats' },
      { symbol: 'MSFT', company: 'Microsoft Corp', date: '2026-10-24', epsForecast: '$3.10', epsPrev: '$2.95', trackRecord: '8/8 Beats' },
      { symbol: 'PLD', company: 'Prologis Inc. (REIT)', date: '2026-10-17', epsForecast: '$1.34', epsPrev: '$1.28', trackRecord: '6/8 Beats' },
      { symbol: 'EQIX', company: 'Equinix Data Centers', date: '2026-10-29', epsForecast: '$8.20', epsPrev: '$7.85', trackRecord: '8/8 Beats' }
    ];
  }

  getEvents(regionFilter = 'ALL') {
    if (regionFilter === 'ALL') return this.events;
    return this.events.filter(e => e.region === regionFilter);
  }

  getUpcomingEvent() {
    const now = new Date().getTime();
    const sorted = [...this.events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return sorted.find(e => new Date(e.date).getTime() > now) || sorted[0];
  }

  getEarningsMatrix() {
    return this.earningsMatrix;
  }

  calculateCountdown(targetDateStr) {
    const now = new Date().getTime();
    const target = new Date(targetDateStr).getTime();
    const diff = target - now;

    if (diff <= 0) {
      return { days: 0, hours: 0, mins: 0, secs: 0, expired: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, mins, secs, expired: false };
  }
}

export const calendarService = new CalendarService();
