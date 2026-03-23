export default function SignalPanel({ signal, indicators }) {
    if (!signal) return <div style={styles.empty}>Loading signal...</div>;

    const cls = signal.signal?.toLowerCase() ?? 'neutral';
    const colors = { buy: '#22d3a5', sell: '#f43f5e', neutral: '#606075' };
    const color = colors[cls] || colors.neutral;
    const ema = indicators?.ema?.filter(Boolean).pop();
    const lastBOS = indicators?.bosEvents?.at(-1);
    const obs = indicators?.orderBlocks ?? [];

    return (
        <div style={styles.wrap}>

            {/* ── Active Signal ── */}
            <div style={styles.section}>
                <div style={styles.sectionTitle}>Active Signal</div>
                <div style={{ ...styles.card, borderColor: color + '40', background: color + '10' }}>
                    <div style={{ ...styles.topBar, background: color }} />
                    <div style={styles.cardHead}>
                        <span style={{ ...styles.badge, color, background: color + '25' }}>{signal.signal}</span>
                        <span style={styles.conf}>{Math.round((signal.confidence ?? 0) * 100)}% conf.</span>
                    </div>
                    <div style={{ ...styles.price, color }}>${(signal.price ?? 0).toLocaleString()}</div>
                    <ul style={styles.reasons}>
                        {(signal.reasons ?? []).map((r, i) => (
                            <li key={i} style={styles.reason}><span style={{ color: '#22d3a5' }}>✓</span> {r}</li>
                        ))}
                    </ul>
                    {signal.signal !== 'NEUTRAL' && (
                        <div style={styles.confBar}>
                            <div style={styles.confLabels}>
                                <span>Confidence</span>
                                <span>{Math.round((signal.confidence ?? 0) * 100)}%</span>
                            </div>
                            <div style={styles.confTrack}>
                                <div style={{ ...styles.confFill, width: `${(signal.confidence ?? 0) * 100}%`, background: color }} />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Indicators ── */}
            <div style={styles.section}>
                <div style={styles.sectionTitle}>Indicator Values</div>
                {[
                    ['EMA 50', ema ? '$' + ema.toFixed(0) : '—', '#fbbf24'],
                    ['Last BOS', lastBOS ? lastBOS.type.toUpperCase() : 'NONE', lastBOS?.type === 'bullish' ? '#22d3a5' : '#f43f5e'],
                    ['Order Blocks', obs.length + ' active', '#a78bfa'],
                    ['Supports', (indicators?.supports?.length ?? 0) + ' zones', '#22d3a5'],
                    ['Resistances', (indicators?.resistances?.length ?? 0) + ' zones', '#f43f5e'],
                ].map(([name, val, c]) => (
                    <div key={name} style={styles.indRow}>
                        <span style={styles.indName}>{name}</span>
                        <span style={{ ...styles.indVal, color: c }}>{val}</span>
                    </div>
                ))}
            </div>

            {/* ── S/R Levels ── */}
            <div style={styles.section}>
                <div style={styles.sectionTitle}>S/R Levels</div>
                {[
                    ...(indicators?.resistances ?? []).map(r => ({ ...r, kind: 'R' })),
                    ...(indicators?.supports ?? []).map(s => ({ ...s, kind: 'S' })),
                ].sort((a, b) => b.price - a.price).map((lvl, i) => {
                    const dist = ((signal.price - lvl.price) / lvl.price * 100).toFixed(2);
                    const c = lvl.kind === 'R' ? '#f43f5e' : '#22d3a5';
                    return (
                        <div key={i} style={styles.lvlRow}>
                            <span style={{ ...styles.lvlTag, color: c, background: c + '20' }}>{lvl.kind}</span>
                            <span style={styles.lvlPrice}>${lvl.price.toLocaleString()}</span>
                            <span style={styles.lvlDist}>{dist > 0 ? '+' : ''}{dist}%</span>
                        </div>
                    );
                })}
            </div>

        </div>
    );
}

const styles = {
    wrap: { display: 'flex', flexDirection: 'column', overflowY: 'auto', background: '#0d0d10' },
    empty: { padding: 20, color: '#606075', fontFamily: 'Consolas, monospace', fontSize: 13 },
    section: { padding: '14px 16px', borderBottom: '1px solid #1a1a24' },
    sectionTitle: { fontSize: 10, textTransform: 'uppercase', letterSpacing: '1px', color: '#606075', fontFamily: 'Consolas, monospace', marginBottom: 10 },
    card: { borderRadius: 10, padding: 14, border: '1px solid', position: 'relative', overflow: 'hidden' },
    topBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 2 },
    cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    badge: { padding: '3px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700, fontFamily: 'Consolas, monospace', letterSpacing: 1 },
    conf: { fontSize: 11, color: '#606075', fontFamily: 'Consolas, monospace' },
    price: { fontSize: 22, fontWeight: 700, fontFamily: 'Consolas, monospace', marginBottom: 8 },
    reasons: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 },
    reason: { fontSize: 11, color: '#a0a0b8', display: 'flex', gap: 6 },
    confBar: { marginTop: 12 },
    confLabels: { display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#606075', fontFamily: 'Consolas, monospace', marginBottom: 4 },
    confTrack: { height: 3, background: '#1a1a24', borderRadius: 2, overflow: 'hidden' },
    confFill: { height: '100%', borderRadius: 2, transition: 'width 0.4s ease' },
    indRow: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #111118' },
    indName: { fontSize: 12, color: '#a0a0b8', fontFamily: 'Consolas, monospace' },
    indVal: { fontSize: 12, fontWeight: 500, fontFamily: 'Consolas, monospace' },
    lvlRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #111118' },
    lvlTag: { fontSize: 10, padding: '2px 6px', borderRadius: 3, fontFamily: 'Consolas, monospace', fontWeight: 700 },
    lvlPrice: { fontSize: 12, fontFamily: 'Consolas, monospace', color: '#f0f0f8' },
    lvlDist: { fontSize: 11, fontFamily: 'Consolas, monospace', color: '#606075' },
};