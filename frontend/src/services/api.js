import axios from 'axios';

const BASE = 'http://localhost:3001';

export const fetchMarketData = (symbol, interval, source = 'binance') =>
    axios.get(`${BASE}/market-data`, { params: { symbol, interval, limit: 200, source } });

export const fetchIndicators = (symbol, interval, source = 'binance') =>
    axios.get(`${BASE}/indicators`, { params: { symbol, interval, source } });

export const fetchSignals = (symbol, interval, source = 'binance') =>
    axios.get(`${BASE}/signals`, { params: { symbol, interval, source } });

export const searchSymbols = (q) =>
    axios.get(`${BASE}/search`, { params: { q } });