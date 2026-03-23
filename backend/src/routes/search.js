const express = require('express');
const router = express.Router();
const { searchSymbol } = require('../services/dataService');

router.get('/', async (req, res) => {
    try {
        const { q = '' } = req.query;
        if (q.trim().length < 1) return res.json({ success: true, data: [] });

        // Local search — instant, no external API
        const results = searchSymbol(q);
        res.json({ success: true, data: results });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;