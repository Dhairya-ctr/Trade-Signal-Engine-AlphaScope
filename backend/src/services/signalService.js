const PROXIMITY = 0.008; // 0.8% threshold

function isNear(price, level) {
    return Math.abs(price - level) / price < PROXIMITY;
}

function generateSignal({ candles, ema, supports, resistances, bosEvents }) {
    const last = candles[candles.length - 1];
    const price = last.close;
    const currentEMA = ema.filter(Boolean).pop();

    if (!currentEMA || !bosEvents.length) {
        return {
            signal: 'NEUTRAL',
            confidence: 0,
            price,
            time: last.time,
            reasons: ['Insufficient data']
        };
    }

    const lastBOS = bosEvents[bosEvents.length - 1];

    let buyScore = 0;
    let sellScore = 0;
    const reasons = [];

    // =====================
    // 1. EMA TREND
    // =====================
    if (price > currentEMA) {
        buyScore++;
        reasons.push('Price above EMA 50');
    } else {
        sellScore++;
        reasons.push('Price below EMA 50');
    }

    // =====================
    // 2. BOS STRUCTURE
    // =====================
    if (lastBOS.type === 'bullish') {
        buyScore++;
        reasons.push('Bullish BOS confirmed');
    } else {
        sellScore++;
        reasons.push('Bearish BOS confirmed');
    }

    // =====================
    // 3. SUPPORT / RESISTANCE (FIXED LOGIC ✅)
    // =====================
    const nearSupport = supports.some(s => isNear(price, s.price));
    const nearResistance = resistances.some(r => isNear(price, r.price));

    // Apply ONLY if aligned with direction
    if (nearSupport && buyScore > sellScore) {
        buyScore++;
        reasons.push('Near support zone');
    }

    if (nearResistance && sellScore > buyScore) {
        sellScore++;
        reasons.push('Near resistance zone');
    }

    // =====================
    // 4. FINAL DECISION
    // =====================
    const maxScore = 3;
    const finalScore = Math.max(buyScore, sellScore);
    const confidence = Math.min(finalScore / maxScore, 1);

    if (sellScore >= 3) {
        return {
            signal: 'SELL',
            confidence,
            price,
            time: last.time,
            reasons
        };
    }

    if (buyScore >= 3) {
        return {
            signal: 'BUY',
            confidence,
            price,
            time: last.time,
            reasons
        };
    }

    return {
        signal: 'NEUTRAL',
        confidence,
        price,
        time: last.time,
        reasons
    };
}

module.exports = { generateSignal };