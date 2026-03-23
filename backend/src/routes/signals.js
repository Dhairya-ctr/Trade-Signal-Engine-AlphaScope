const express = require('express');
const router = express.Router();
const { fetchCandles, fetchYahooCandles } = require('../services/dataService');
const {
    calculateEMA,
    detectSupportResistance,
    detectBOS,
    detectOrderBlocks,
} = require('../services/indicatorService');
const { generateSignal } = require('../services/signalService');

router.get('/', async (req, res) => {
    try {
        const { symbol = 'BTCUSDT', interval = '1h', source = 'binance' } = req.query;

        const candles = source === 'yahoo'
            ? await fetchYahooCandles(symbol, interval)
            : await fetchCandles(symbol, interval, 200);

        const closes = candles.map(c => c.close);
        const ema = calculateEMA(closes, 50);
        const { supports, resistances } = detectSupportResistance(candles);
        const bosEvents = detectBOS(candles, resistances, supports);
        const orderBlocks = detectOrderBlocks(candles);

        const signal = generateSignal({ candles, ema, supports, resistances, bosEvents, interval });

        res.json({ success: true, data: signal });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;