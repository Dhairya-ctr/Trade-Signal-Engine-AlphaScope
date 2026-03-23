import { useEffect, useRef } from 'react';
import {
    createChart,
    CrosshairMode,
    CandlestickSeries,
    LineSeries,
    createSeriesMarkers,
} from 'lightweight-charts';

export default function CandlestickChart({ candles, indicators, signal }) {
    const containerRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current || !candles.length) return;

        if (chartRef.current) {
            chartRef.current.remove();
            chartRef.current = null;
        }

        const chart = createChart(containerRef.current, {
            layout: {
                background: { color: '#070709' },
                textColor: '#606075',
            },
            grid: {
                vertLines: { color: '#111118' },
                horzLines: { color: '#111118' },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: { color: '#2a2a3a', labelBackgroundColor: '#1a1a24' },
                horzLine: { color: '#2a2a3a', labelBackgroundColor: '#1a1a24' },
            },
            rightPriceScale: {
                borderColor: '#1a1a24',
                scaleMargins: { top: 0.1, bottom: 0.15 },
            },
            timeScale: {
                borderColor: '#1a1a24',
                timeVisible: true,
                secondsVisible: false,
            },
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight,
        });

        chartRef.current = chart;

        // ── 1. Candlestick series ──
        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: '#22d3a5',
            downColor: '#f43f5e',
            borderUpColor: '#22d3a5',
            borderDownColor: '#f43f5e',
            wickUpColor: '#22d3a5',
            wickDownColor: '#f43f5e',
        });
        candleSeries.setData(candles);

        // ── 2. EMA line ──
        if (indicators?.ema) {
            const emaPoints = indicators.ema
                .map((v, i) => (v !== null && candles[i] ? { time: candles[i].time, value: v } : null))
                .filter(Boolean);

            if (emaPoints.length) {
                const emaSeries = chart.addSeries(LineSeries, {
                    color: '#fbbf24',
                    lineWidth: 1.5,
                    priceLineVisible: false,
                    lastValueVisible: true,
                    title: 'EMA 50',
                });
                emaSeries.setData(emaPoints);
            }
        }

        // ── 3. Support price lines ──
        indicators?.supports?.forEach(s => {
            candleSeries.createPriceLine({
                price: s.price,
                color: '#22d3a580',
                lineWidth: 1,
                lineStyle: 1,
                axisLabelVisible: true,
                title: 'S',
            });
        });

        // ── 4. Resistance price lines ──
        indicators?.resistances?.forEach(r => {
            candleSeries.createPriceLine({
                price: r.price,
                color: '#f43f5e80',
                lineWidth: 1,
                lineStyle: 1,
                axisLabelVisible: true,
                title: 'R',
            });
        });

        // ── 5. ORDER BLOCKS ──
        // Draw as a band using two price lines (top and bottom of the OB zone)
        // + a colored line series spanning the OB candle range
        // ── 5. ORDER BLOCKS ──
        if (indicators?.orderBlocks?.length) {
            indicators.orderBlocks.forEach(ob => {
                const isBull = ob.type === 'bullish';

                // Bullish OB = bright teal/green zone
                // Bearish OB = bright orange zone (distinct from red S/R lines)
                const colorTop = isBull ? '#00ffcc' : '#ff8c00';
                const colorMid = isBull ? '#00ffcc' : '#ff8c00';
                const colorBot = isBull ? '#00ffcc' : '#ff8c00';

                // Top line — solid, bright, labeled
                candleSeries.createPriceLine({
                    price: ob.high,
                    color: colorTop,
                    lineWidth: 2,
                    lineStyle: 0,
                    axisLabelVisible: true,
                    title: isBull ? '▲ OB' : '▼ OB',
                });

                // Middle band — very thick to simulate fill
                const mid = (ob.high + ob.low) / 2;
                candleSeries.createPriceLine({
                    price: mid,
                    color: colorMid + '50', // 30% opacity fill
                    lineWidth: 12,
                    lineStyle: 0,
                    axisLabelVisible: false,
                });

                // Bottom line — dashed
                candleSeries.createPriceLine({
                    price: ob.low,
                    color: colorBot,
                    lineWidth: 2,
                    lineStyle: 2,
                    axisLabelVisible: false,
                });
            });
        }

        // ── 6. Signal markers ──
        if (signal?.signal && signal.signal !== 'NEUTRAL' && signal.time) {
            try {
                createSeriesMarkers(candleSeries, [{
                    time: signal.time,
                    position: signal.signal === 'BUY' ? 'belowBar' : 'aboveBar',
                    color: signal.signal === 'BUY' ? '#22d3a5' : '#f43f5e',
                    shape: signal.signal === 'BUY' ? 'arrowUp' : 'arrowDown',
                    text: signal.signal,
                    size: 2,
                }]);
            } catch (e) {
                // marker outside visible range — safe to ignore
            }
        }

        chart.timeScale().fitContent();

        // ── Resize observer ──
        const ro = new ResizeObserver(() => {
            if (chartRef.current && containerRef.current) {
                chartRef.current.applyOptions({
                    width: containerRef.current.clientWidth,
                    height: containerRef.current.clientHeight,
                });
            }
        });
        ro.observe(containerRef.current);

        return () => { ro.disconnect(); };

    }, [candles, indicators, signal]);

    // True unmount cleanup
    useEffect(() => {
        return () => {
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{ width: '100%', height: '100%', minHeight: 400 }}
        />
    );
}