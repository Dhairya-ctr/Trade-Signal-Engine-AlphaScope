function calculateEMA(closes, period) {
    const k = 2 / (period + 1);
    const result = Array(period - 1).fill(null);
    const seed = closes.slice(0, period).reduce((a, b) => a + b, 0) / period;
    result.push(seed);
    for (let i = period; i < closes.length; i++) {
        result.push(closes[i] * k + result[result.length - 1] * (1 - k));
    }
    return result;
}

function detectSupportResistance(candles, lookback = 8) {
    const supports = [], resistances = [];
    for (let i = lookback; i < candles.length - lookback; i++) {
        const win = candles.slice(i - lookback, i + lookback + 1);
        const c = candles[i];
        if (c.low === Math.min(...win.map(x => x.low)))
            supports.push({ price: c.low, index: i, time: c.time });
        if (c.high === Math.max(...win.map(x => x.high)))
            resistances.push({ price: c.high, index: i, time: c.time });
    }
    return { supports: supports.slice(-4), resistances: resistances.slice(-4) };
}

function detectBOS(candles, swingHighs, swingLows) {
    const events = [];
    for (let i = 20; i < candles.length; i++) {
        const c = candles[i];
        for (const sh of swingHighs) {
            if (sh.index < i && candles[i - 1].close <= sh.price && c.close > sh.price)
                events.push({ type: 'bullish', price: sh.price, index: i, time: c.time });
        }
        for (const sl of swingLows) {
            if (sl.index < i && candles[i - 1].close >= sl.price && c.close < sl.price)
                events.push({ type: 'bearish', price: sl.price, index: i, time: c.time });
        }
    }
    return events.slice(-6);
}

function detectCHOCH(bosEvents) {
    return bosEvents.filter((e, i) => i > 0 && bosEvents[i - 1].type !== e.type)
        .map(e => ({ ...e, isCHOCH: true }));
}

function detectOrderBlocks(candles) {
    const obs = [];
    for (let i = 2; i < candles.length - 3; i++) {
        const c = candles[i];
        const next3 = candles.slice(i + 1, i + 4);
        const bullImpulse = next3.every(x => x.close > x.open);
        const bearImpulse = next3.every(x => x.close < x.open);
        if (c.close < c.open && bullImpulse)
            obs.push({ type: 'bullish', high: c.high, low: c.low, time: c.time, index: i });
        if (c.close > c.open && bearImpulse)
            obs.push({ type: 'bearish', high: c.high, low: c.low, time: c.time, index: i });
    }
    return obs.slice(-4);
}

module.exports = {
    calculateEMA,
    detectSupportResistance,
    detectBOS,
    detectCHOCH,
    detectOrderBlocks,
};