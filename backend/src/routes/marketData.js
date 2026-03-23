const express = require('express');
const router = express.Router();
const { fetchCandles, fetchYahooCandles } = require('../services/dataService');

router.get('/', async (req, res) => {
    try {
        const { symbol = 'BTCUSDT', interval = '1h', source = 'binance' } = req.query;

        const candles = source === 'yahoo'
            ? await fetchYahooCandles(symbol, interval)
            : await fetchCandles(symbol, interval, 200);

        res.json({ success: true, data: candles, source, symbol });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;