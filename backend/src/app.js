const express = require('express');
const cors = require('cors');

const marketDataRoutes = require('./routes/marketData');
const indicatorRoutes = require('./routes/indicators');
const signalRoutes = require('./routes/signals');
const searchRoutes = require('./routes/search'); // ← new

const app = express();
app.use(cors());
app.use(express.json());

app.use('/market-data', marketDataRoutes);
app.use('/indicators', indicatorRoutes);
app.use('/signals', signalRoutes);
app.use('/search', searchRoutes); // ← new

app.listen(3001, () => console.log('Trading backend running on :3001'));