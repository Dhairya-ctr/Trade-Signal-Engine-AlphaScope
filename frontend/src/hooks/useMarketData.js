import { useState, useEffect, useCallback } from 'react';
import { fetchMarketData, fetchIndicators, fetchSignals } from '../services/api';

export function useMarketData(symbol, interval, source) {
    const [candles, setCandles] = useState([]);
    const [indicators, setIndicators] = useState(null);
    const [signal, setSignal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [mktRes, indRes, sigRes] = await Promise.all([
                fetchMarketData(symbol, interval, source),
                fetchIndicators(symbol, interval, source),
                fetchSignals(symbol, interval, source),
            ]);

            setCandles(mktRes.data.data);
            setIndicators(indRes.data.data);
            setSignal(sigRes.data.data);
        } catch (err) {
            setError(err.response?.data?.error ?? err.message);
        } finally {
            setLoading(false);
        }
    }, [symbol, interval, source]);

    // ← Clear old data immediately when symbol/interval/source changes
    useEffect(() => {
        setCandles([]);
        setIndicators(null);
        setSignal(null);
        setLoading(true);
        load();

        const delay = source === 'binance' ? 30000 : 60000;
        const timer = setInterval(load, delay);
        return () => clearInterval(timer);
    }, [load, source]);

    return { candles, indicators, signal, loading, error, reload: load };
}