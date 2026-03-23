const express = require('express');
const router = express.Router();
const { fetchCandles, fetchYahooCandles } = require('../services/dataService');
const {
    calculateEMA,
    detectSupportResistance,
    detectBOS,
    detectCHOCH,
    detectOrderBlocks,
} = require('../services/indicatorService');

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
        const chochEvents = detectCHOCH(bosEvents);
        const orderBlocks = detectOrderBlocks(candles);

        res.json({
            success: true,
            data: { ema, supports, resistances, bosEvents, chochEvents, orderBlocks },
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;