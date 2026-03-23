const axios = require('axios');

// ─────────────────────────────────────────────
// BINANCE — Crypto
// ─────────────────────────────────────────────
async function fetchCandles(symbol = 'BTCUSDT', interval = '1h', limit = 200) {
    const { data } = await axios.get('https://api.binance.com/api/v3/klines', {
        params: { symbol, interval, limit },
    });
    return data.map(k => ({
        time: Math.floor(k[0] / 1000),
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5]),
    }));
}

// ─────────────────────────────────────────────
// YAHOO FINANCE — Direct HTTP, no library
// ─────────────────────────────────────────────

const YAHOO_INTERVAL_MAP = {
    '15m': { interval: '15m', range: '5d' },
    '1h': { interval: '60m', range: '1mo' },
    '4h': { interval: '1d', range: '6mo' },
    '1d': { interval: '1d', range: '2y' },
};

async function fetchYahooCandles(symbol, interval = '1d') {
    const map = YAHOO_INTERVAL_MAP[interval] ?? { interval: '1d', range: '2y' };

    // Yahoo Finance v8 chart API — public, no key needed
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}`;

    const { data } = await axios.get(url, {
        params: {
            interval: map.interval,
            range: map.range,
            includePrePost: false,
            events: 'div,splits',
        },
        headers: {
            // Must send browser headers or Yahoo returns 401
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://finance.yahoo.com',
            'Origin': 'https://finance.yahoo.com',
        },
        timeout: 10000,
    });

    const result = data?.chart?.result?.[0];
    if (!result) {
        const errMsg = data?.chart?.error?.description ?? 'No data returned';
        throw new Error(`Yahoo Finance: ${errMsg} (symbol: ${symbol})`);
    }

    const timestamps = result.timestamp ?? [];
    const quote = result.indicators?.quote?.[0] ?? {};
    const opens = quote.open ?? [];
    const highs = quote.high ?? [];
    const lows = quote.low ?? [];
    const closes = quote.close ?? [];
    const volumes = quote.volume ?? [];

    return timestamps
        .map((t, i) => ({
            time: t,
            open: opens[i],
            high: highs[i],
            low: lows[i],
            close: closes[i],
            volume: volumes[i] ?? 0,
        }))
        .filter(c =>
            c.open != null && !isNaN(c.open) &&
            c.high != null && !isNaN(c.high) &&
            c.low != null && !isNaN(c.low) &&
            c.close != null && !isNaN(c.close)
        )
        .map(c => ({
            time: c.time,
            open: +c.open.toFixed(2),
            high: +c.high.toFixed(2),
            low: +c.low.toFixed(2),
            close: +c.close.toFixed(2),
            volume: c.volume,
        }))
        .sort((a, b) => a.time - b.time);
}

// ─────────────────────────────────────────────
// LOCAL SYMBOL SEARCH — instant, no API
// ─────────────────────────────────────────────
const SYMBOL_DB = [
    // NSE India
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries', exchange: 'NSE', source: 'yahoo' },
    { symbol: 'TCS.NS', name: 'Tata Consultancy Services', exchange: 'NSE', source: 'yahoo' },
    { symbol: 'INFY.NS', name: 'Infosys', exchange: 'NSE', source: 'yahoo' },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', exchange: 'NSE', source: 'yahoo' },
    { symbol: 'WIPRO.NS', name: 'Wipro', exchange: 'NSE', source: 'yahoo' },
    { symbol: 'SBIN.NS', name: 'State Bank of India', exchange: 'NSE', source: 'yahoo' },
    { symbol: 'TATAMOTORS.NS', name: 'Tata Motors', exchange: 'NSE', source: 'yahoo' },
    { symbol: 'ADANIENT.NS', name: 'Adani Enterprises', exchange: 'NSE', source: 'yahoo' },
    { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance', exchange: 'NSE', source: 'yahoo' },
    { symbol: 'HCLTECH.NS', name: 'HCL Technologies', exchange: 'NSE', source: 'yahoo' },
    { symbol: 'ICICIBANK.NS', name: 'ICICI Bank', exchange: 'NSE', source: 'yahoo' },
    { symbol: 'AXISBANK.NS', name: 'Axis Bank', exchange: 'NSE', source: 'yahoo' },
    { symbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank', exchange: 'NSE', source: 'yahoo' },
    { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever', exchange: 'NSE', source: 'yahoo' },
    { symbol: 'ITC.NS', name: 'ITC Limited', exchange: 'NSE', source: 'yahoo' },
    { symbol: 'LT.NS', name: 'Larsen & Toubro', exchange: 'NSE', source: 'yahoo' },
    { symbol: 'MARUTI.NS', name: 'Maruti Suzuki', exchange: 'NSE', source: 'yahoo' },
    { symbol: 'ASIANPAINT.NS', name: 'Asian Paints', exchange: 'NSE', source: 'yahoo' },
    { symbol: 'TITAN.NS', name: 'Titan Company', exchange: 'NSE', source: 'yahoo' },
    { symbol: 'SUNPHARMA.NS', name: 'Sun Pharmaceutical', exchange: 'NSE', source: 'yahoo' },
    { symbol: 'ZOMATO.NS', name: 'Zomato', exchange: 'NSE', source: 'yahoo' },
    { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel', exchange: 'NSE', source: 'yahoo' },
    { symbol: 'TATASTEEL.NS', name: 'Tata Steel', exchange: 'NSE', source: 'yahoo' },
    { symbol: 'ONGC.NS', name: 'Oil & Natural Gas Corp', exchange: 'NSE', source: 'yahoo' },
    { symbol: 'NTPC.NS', name: 'NTPC Limited', exchange: 'NSE', source: 'yahoo' },
    { symbol: 'DRREDDY.NS', name: "Dr. Reddy's Laboratories", exchange: 'NSE', source: 'yahoo' },
    { symbol: 'CIPLA.NS', name: 'Cipla', exchange: 'NSE', source: 'yahoo' },
    { symbol: 'DMART.NS', name: 'DMart (Avenue Supermarts)', exchange: 'NSE', source: 'yahoo' },
    { symbol: 'TATAPOWER.NS', name: 'Tata Power', exchange: 'NSE', source: 'yahoo' },
    { symbol: 'APOLLOHOSP.NS', name: 'Apollo Hospitals', exchange: 'NSE', source: 'yahoo' },
    { symbol: '^NSEI', name: 'NIFTY 50 Index', exchange: 'NSE', source: 'yahoo' },
    { symbol: '^BSESN', name: 'BSE SENSEX Index', exchange: 'BSE', source: 'yahoo' },
    { symbol: '^NSEBANK', name: 'NIFTY Bank Index', exchange: 'NSE', source: 'yahoo' },
    // US Stocks
    { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', source: 'yahoo' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ', source: 'yahoo' },
    { symbol: 'GOOGL', name: 'Alphabet (Google)', exchange: 'NASDAQ', source: 'yahoo' },
    { symbol: 'AMZN', name: 'Amazon.com', exchange: 'NASDAQ', source: 'yahoo' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ', source: 'yahoo' },
    { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', source: 'yahoo' },
    { symbol: 'META', name: 'Meta Platforms', exchange: 'NASDAQ', source: 'yahoo' },
    { symbol: 'NFLX', name: 'Netflix', exchange: 'NASDAQ', source: 'yahoo' },
    { symbol: 'AMD', name: 'Advanced Micro Devices', exchange: 'NASDAQ', source: 'yahoo' },
    { symbol: 'JPM', name: 'JPMorgan Chase', exchange: 'NYSE', source: 'yahoo' },
    { symbol: 'BAC', name: 'Bank of America', exchange: 'NYSE', source: 'yahoo' },
    { symbol: 'V', name: 'Visa Inc.', exchange: 'NYSE', source: 'yahoo' },
    { symbol: 'WMT', name: 'Walmart Inc.', exchange: 'NYSE', source: 'yahoo' },
    // Crypto
    { symbol: 'BTCUSDT', name: 'Bitcoin / USDT', exchange: 'Binance', source: 'binance' },
    { symbol: 'ETHUSDT', name: 'Ethereum / USDT', exchange: 'Binance', source: 'binance' },
    { symbol: 'SOLUSDT', name: 'Solana / USDT', exchange: 'Binance', source: 'binance' },
    { symbol: 'BNBUSDT', name: 'BNB / USDT', exchange: 'Binance', source: 'binance' },
    { symbol: 'XRPUSDT', name: 'XRP / USDT', exchange: 'Binance', source: 'binance' },
    { symbol: 'DOGEUSDT', name: 'Dogecoin / USDT', exchange: 'Binance', source: 'binance' },
    { symbol: 'ADAUSDT', name: 'Cardano / USDT', exchange: 'Binance', source: 'binance' },
    { symbol: 'MATICUSDT', name: 'Polygon / USDT', exchange: 'Binance', source: 'binance' },
];

function searchSymbol(query) {
    const q = query.toLowerCase().trim();
    return SYMBOL_DB
        .filter(s =>
            s.symbol.toLowerCase().includes(q) ||
            s.name.toLowerCase().includes(q)
        )
        .slice(0, 8);
}

module.exports = { fetchCandles, fetchYahooCandles, searchSymbol };