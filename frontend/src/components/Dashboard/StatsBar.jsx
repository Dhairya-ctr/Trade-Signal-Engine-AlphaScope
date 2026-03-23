export default function StatsBar({ candles, indicators, signal }) {
    if (!candles.length) return null;

    const last = candles[candles.length - 1];
    const first = candles[0];
    const pct = ((last.close - first.close) / first.close * 100).toFixed(2);
    const isUp = pct >= 0;
    const ema = indicators?.ema?.filter(Boolean).pop();
    const aboveEMA = last.close > ema;
    const lastBOS = indicators?.bosEvents?.at(-1);

    const stats = [
        { label: 'Last Price', value: '$' + last.close.toLocaleString(), color: 'white' },
        { label: '24h Change', value: (isUp ? '+' : '') + pct + '%', color: isUp ? '#22d3a5' : '#f43f5e' },
        { label: 'EMA 50', value: ema ? '$' + ema.toFixed(0) : '—', color: '#fbbf24' },
        { label: 'Trend', value: aboveEMA ? '▲ BULL' : '▼ BEAR', color: aboveEMA ? '#22d3a5' : '#f43f5e' },
        { label: 'Last BOS', value: lastBOS ? lastBOS.type.toUpperCase() : 'NONE', color: lastBOS?.type === 'bullish' ? '#22d3a5' : '#f43f5e' },
        { label: 'Active Signal', value: signal?.signal ?? '—', color: signal?.signal === 'BUY' ? '#22d3a5' : signal?.signal === 'SELL' ? '#f43f5e' : '#606075' },
    ];

    return (
        <div style={styles.bar}>
            {stats.map(s => (
                <div key={s.label} style={styles.item}>
                    <div style={styles.label}>{s.label}</div>
                    <div style={{ ...styles.value, color: s.color }}>{s.value}</div>
                </div>
            ))}
        </div>
    );
}

const styles = {
    bar: { display: 'flex', borderBottom: '1px solid #1a1a24', background: '#0d0d10', overflowX: 'auto' },
    item: { padding: '10px 20px', borderRight: '1px solid #1a1a24', flexShrink: 0 },
    label: { fontSize: 10, color: '#606075', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 2, fontFamily: 'Consolas, monospace' },
    value: { fontSize: 15, fontWeight: 600, fontFamily: 'Consolas, monospace' },
};