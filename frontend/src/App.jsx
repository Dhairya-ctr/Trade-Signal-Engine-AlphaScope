import { useState, useEffect, useRef } from 'react';
import { useMarketData } from './hooks/useMarketData';
import { searchSymbols } from './services/api';
import CandlestickChart from './components/Chart/CandlestickChart';
import StatsBar from './components/Dashboard/StatsBar';
import SignalPanel from './components/Dashboard/SignalPanel';

// ── Preset markets ──
const PRESETS = [
    // Crypto
    { label: 'BTC/USDT', symbol: 'BTCUSDT', source: 'binance', group: 'Crypto' },
    { label: 'ETH/USDT', symbol: 'ETHUSDT', source: 'binance', group: 'Crypto' },
    { label: 'SOL/USDT', symbol: 'SOLUSDT', source: 'binance', group: 'Crypto' },
    { label: 'BNB/USDT', symbol: 'BNBUSDT', source: 'binance', group: 'Crypto' },
    // Indian NSE
    { label: 'RELIANCE', symbol: 'RELIANCE.NS', source: 'yahoo', group: 'NSE India' },
    { label: 'TCS', symbol: 'TCS.NS', source: 'yahoo', group: 'NSE India' },
    { label: 'INFY', symbol: 'INFY.NS', source: 'yahoo', group: 'NSE India' },
    { label: 'HDFCBANK', symbol: 'HDFCBANK.NS', source: 'yahoo', group: 'NSE India' },
    { label: 'TATAMOTORS', symbol: 'TATAMOTORS.NS', source: 'yahoo', group: 'NSE India' },
    { label: 'WIPRO', symbol: 'WIPRO.NS', source: 'yahoo', group: 'NSE India' },
    { label: 'SBIN', symbol: 'SBIN.NS', source: 'yahoo', group: 'NSE India' },
    { label: 'ADANIENT', symbol: 'ADANIENT.NS', source: 'yahoo', group: 'NSE India' },
    // US Stocks
    { label: 'AAPL', symbol: 'AAPL', source: 'yahoo', group: 'US Stocks' },
    { label: 'TSLA', symbol: 'TSLA', source: 'yahoo', group: 'US Stocks' },
    { label: 'NVDA', symbol: 'NVDA', source: 'yahoo', group: 'US Stocks' },
    { label: 'MSFT', symbol: 'MSFT', source: 'yahoo', group: 'US Stocks' },
];

const INTERVALS = ['15m', '1h', '4h', '1d'];

export default function App() {
    const [preset, setPreset] = useState(PRESETS[0]);
    const [interval, setInterval] = useState('1d');

    // ── Search state ──
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearch, setShowSearch] = useState(false);
    const searchRef = useRef(null);

    const { candles, indicators, signal, loading, error, reload } =
        useMarketData(preset.symbol, interval, preset.source);

    // ── Live search with debounce ──
    useEffect(() => {
        if (searchQuery.length < 1) { setSearchResults([]); return; }
        const timer = setTimeout(async () => {
            try {
                const res = await searchSymbols(searchQuery);
                setSearchResults(res.data.data ?? []);
            } catch { setSearchResults([]); }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // ── Close search on outside click ──
    useEffect(() => {
        const handler = e => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSearch(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    function selectSearchResult(result) {
        setPreset({
            label: result.symbol,
            symbol: result.symbol,
            source: result.source, // ← comes from local DB now (binance or yahoo)
            group: result.exchange,
        });
        setSearchQuery('');
        setSearchResults([]);
        setShowSearch(false);
    }
    return (
        <div style={s.root}>

            {/* ── Top Bar ── */}
            <div style={s.topbar}>
                <div style={s.brand}>
                    <div style={s.brandIcon}>◈</div>
                    <div>
                        <div style={s.brandName}>AlphaScope</div>
                        <div style={s.brandSub}>SMC · Signal Engine v2.1</div>
                    </div>
                </div>

                <div style={s.controls}>

                    {/* Preset dropdown */}
                    <select
                        value={preset.label}
                        onChange={e => {
                            const found = PRESETS.find(p => p.label === e.target.value);
                            if (found) setPreset(found);
                        }}
                        style={s.select}
                    >
                        {['Crypto', 'NSE India', 'US Stocks'].map(group => (
                            <optgroup key={group} label={`── ${group}`}>
                                {PRESETS.filter(p => p.group === group).map(p => (
                                    <option key={p.label} value={p.label}>{p.label}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>

                    {/* Live symbol search */}
                    <div style={s.searchWrap} ref={searchRef}>
                        <input
                            style={s.searchInput}
                            placeholder="Search any stock…"
                            value={searchQuery}
                            onChange={e => { setSearchQuery(e.target.value); setShowSearch(true); }}
                            onFocus={() => setShowSearch(true)}
                        />
                        {showSearch && searchResults.length > 0 && (
                            <div style={s.searchDropdown}>
                                {searchResults.map(r => (
                                    <div
                                        key={r.symbol}
                                        style={s.searchItem}
                                        onMouseDown={() => selectSearchResult(r)}
                                    >
                                        <div style={s.searchSymbol}>{r.symbol}</div>
                                        <div style={s.searchName}>{r.name}</div>
                                        <div style={s.searchExchange}>{r.exchange}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Interval buttons */}
                    {INTERVALS.map(iv => (
                        <button
                            key={iv}
                            onClick={() => setInterval(iv)}
                            style={{ ...s.ivBtn, ...(interval === iv ? s.ivBtnActive : {}) }}
                        >
                            {iv.toUpperCase()}
                        </button>
                    ))}
                </div>

                <div style={s.liveBadge}>
                    <div style={{ ...s.liveDot, background: loading ? '#fbbf24' : '#22d3a5' }} />
                    {loading ? 'LOADING' : preset.source === 'yahoo' ? 'YAHOO' : 'BINANCE'}
                </div>
            </div>

            {/* ── Stats Bar ── */}
            <StatsBar candles={candles} indicators={indicators} signal={signal} />

            {/* ── Error Banner ── */}
            {error && (
                <div style={s.errorBanner}>
                    ⚠ {error}
                    <button onClick={reload} style={s.retryBtn}>Retry</button>
                </div>
            )}

            {/* ── Main Layout ── */}
            <div style={s.main}>
                <div style={s.chartArea}>
                    <div style={s.chartToolbar}>
                        <span style={s.toolbarLabel}>
                            {preset.label} · {interval.toUpperCase()} · EMA 50 · S/R Levels · BOS Signals
                        </span>
                        <button onClick={reload} style={s.refreshBtn}>↻ Refresh</button>
                    </div>
                    <div style={s.chartWrap}>
                        {loading && !candles.length ? (
                            <div style={s.loader}>
                                <div style={s.loaderDot} />
                                Loading {preset.label}...
                            </div>
                        ) : (
                            <CandlestickChart
                                candles={candles}
                                indicators={indicators}
                                signal={signal}
                            />
                        )}
                    </div>
                </div>

                <div style={s.rightPanel}>
                    <SignalPanel signal={signal} indicators={indicators} />
                </div>
            </div>
        </div>
    );
}

const s = {
    root: { display: 'flex', flexDirection: 'column', height: '100vh', background: '#070709', color: '#f0f0f8', fontFamily: 'system-ui,sans-serif', overflow: 'hidden' },
    topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid #1a1a24', background: '#0d0d10', flexShrink: 0, gap: 12 },
    brand: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
    brandIcon: { width: 28, height: 28, background: 'linear-gradient(135deg,#6366f1,#a78bfa)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 },
    brandName: { fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px' },
    brandSub: { fontSize: 10, color: '#606075', fontFamily: 'Consolas,monospace' },
    controls: { display: 'flex', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'center', flexWrap: 'wrap' },
    select: { background: '#1a1a24', border: '1px solid #2a2a3a', color: '#f0f0f8', padding: '6px 10px', borderRadius: 7, fontFamily: 'Consolas,monospace', fontSize: 12, cursor: 'pointer', outline: 'none' },
    searchWrap: { position: 'relative' },
    searchInput: { background: '#1a1a24', border: '1px solid #2a2a3a', color: '#f0f0f8', padding: '6px 12px', borderRadius: 7, fontFamily: 'system-ui,sans-serif', fontSize: 12, outline: 'none', width: 180 },
    searchDropdown: { position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#13131a', border: '1px solid #2a2a3a', borderRadius: 8, zIndex: 100, maxHeight: 280, overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' },
    searchItem: { padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #1a1a24', display: 'flex', gap: 8, alignItems: 'center' },
    searchSymbol: { fontSize: 12, fontWeight: 600, fontFamily: 'Consolas,monospace', color: '#f0f0f8', minWidth: 80 },
    searchName: { fontSize: 11, color: '#a0a0b8', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    searchExchange: { fontSize: 10, color: '#606075', fontFamily: 'Consolas,monospace' },
    ivBtn: { padding: '5px 10px', background: 'transparent', border: '1px solid #2a2a3a', color: '#a0a0b8', borderRadius: 6, fontSize: 11, cursor: 'pointer', fontFamily: 'Consolas,monospace' },
    ivBtnActive: { background: '#6366f1', borderColor: '#6366f1', color: '#fff' },
    liveBadge: { display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'rgba(34,211,165,0.08)', border: '1px solid rgba(34,211,165,0.25)', borderRadius: 20, fontSize: 11, color: '#22d3a5', fontFamily: 'Consolas,monospace', flexShrink: 0 },
    liveDot: { width: 6, height: 6, borderRadius: '50%', transition: 'background 0.3s' },
    errorBanner: { display: 'flex', alignItems: 'center', gap: 12, padding: '8px 20px', background: 'rgba(244,63,94,0.1)', borderBottom: '1px solid rgba(244,63,94,0.3)', color: '#f43f5e', fontSize: 12, fontFamily: 'Consolas,monospace', flexShrink: 0 },
    retryBtn: { padding: '3px 10px', background: 'rgba(244,63,94,0.2)', border: '1px solid #f43f5e40', borderRadius: 4, color: '#f43f5e', cursor: 'pointer', fontSize: 11 },
    main: { display: 'grid', gridTemplateColumns: '1fr 290px', flex: 1, overflow: 'hidden' },
    chartArea: { display: 'flex', flexDirection: 'column', borderRight: '1px solid #1a1a24', overflow: 'hidden' },
    chartToolbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', borderBottom: '1px solid #1a1a24', background: '#0d0d10', flexShrink: 0 },
    toolbarLabel: { fontSize: 11, color: '#606075', fontFamily: 'Consolas,monospace' },
    refreshBtn: { padding: '4px 10px', background: 'transparent', border: '1px solid #2a2a3a', borderRadius: 5, color: '#a0a0b8', cursor: 'pointer', fontSize: 11, fontFamily: 'Consolas,monospace' },
    chartWrap: { flex: 1, position: 'relative', overflow: 'hidden' },
    loader: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#606075', fontFamily: 'Consolas,monospace', fontSize: 13, gap: 12 },
    loaderDot: { width: 8, height: 8, borderRadius: '50%', background: '#6366f1', animation: 'none' },
    rightPanel: { display: 'flex', flexDirection: 'column', overflow: 'hidden' },
};