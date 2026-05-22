import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowLeft, TrendingUp, TrendingDown, X, Pin } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot } from 'recharts';

export default function StockDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stock, setStock] = useState(null);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pinnedPoints, setPinnedPoints] = useState([]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setPinnedPoints([]);
    Promise.all([api.getStock(id), api.getStockPrices(id)])
      .then(([stockData, priceData]) => {
        const s = stockData.stock || stockData;
        setStock(s);
        setPrices(priceData || []);
      })
      .catch(err => { console.error('Error loading stock:', err); setError(err.message); })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChartClick = useCallback((e) => {
    if (e && e.activePayload && e.activePayload.length > 0) {
      const point = e.activePayload[0].payload;
      // Toggle: if already pinned at this date, remove it
      const exists = pinnedPoints.find(p => p.date === point.date);
      if (exists) {
        setPinnedPoints(prev => prev.filter(p => p.date !== point.date));
      } else {
        setPinnedPoints(prev => [...prev, { date: point.date, close: point.close }]);
      }
    }
  }, [pinnedPoints]);

  const clearPins = () => setPinnedPoints([]);

  if (loading) return <div className="loading-spinner" />;
  if (error) return <div className="empty-state"><h3>Error loading stock</h3><p>{error}</p></div>;
  if (!stock) return <div className="empty-state"><h3>Stock not found</h3></div>;

  const curr = stock.exchange === 'NSE' ? '₹' : '$';
  const last = prices.length > 0 ? prices[prices.length - 1] : null;
  const prev = prices.length > 1 ? prices[prices.length - 2] : null;
  const change = last && prev ? ((last.closePrice - prev.closePrice) / prev.closePrice * 100) : 0;
  const isPositive = change >= 0;
  const chartData = prices.slice(-120).map(p => ({
    date: p.date?.slice(5) || '',
    close: p.closePrice,
    volume: p.volume,
  }));

  const priceStats = last ? [
    { label: 'Open', value: `${curr}${last.openPrice?.toLocaleString('en-IN')}` },
    { label: 'High', value: `${curr}${last.highPrice?.toLocaleString('en-IN')}` },
    { label: 'Low', value: `${curr}${last.lowPrice?.toLocaleString('en-IN')}` },
    { label: 'Close', value: `${curr}${last.closePrice?.toLocaleString('en-IN')}` },
    { label: 'Volume', value: last.volume ? (last.volume / 1000000).toFixed(2) + 'M' : '—' },
  ] : [];

  // Pin colors for multiple reference points
  const pinColors = ['#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#FF6FB7', '#C084FC', '#F97316', '#14B8A6'];

  return (
    <div className="animate-in">
      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/stocks')} style={{ marginBottom: '20px' }}>
        <ArrowLeft size={16} /> Back to Stocks
      </button>

      {/* Header */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div className="stock-avatar" style={{ width: '56px', height: '56px', fontSize: '20px' }}>{stock.symbol?.slice(0, 2)}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>{stock.symbol}</h1>
              <span className={`badge ${stock.exchange === 'NSE' ? 'badge-success' : 'badge-primary'}`}>{stock.exchange}</span>
              <span className="badge badge-neutral">{stock.sector}</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0' }}>{stock.name}</p>
          </div>
          {last && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '28px', fontWeight: 700 }}>{curr}{last.closePrice?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
              <div className={`stock-change ${isPositive ? 'positive' : 'negative'}`} style={{ justifyContent: 'flex-end' }}>
                {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span>{isPositive ? '+' : ''}{change.toFixed(2)}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Price Stats */}
      {priceStats.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {priceStats.map((s, i) => (
            <div key={i} className="card" style={{ textAlign: 'center', padding: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>{s.label}</div>
              <div style={{ fontSize: '18px', fontWeight: 700, marginTop: '4px' }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Price Chart with click-to-pin */}
      {chartData.length > 0 && (
        <div className="card" style={{ marginBottom: '24px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Price Chart (Last 120 Days)</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                <Pin size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Click chart to pin reference points
              </span>
              {pinnedPoints.length > 0 && (
                <button className="btn btn-secondary btn-sm" onClick={clearPins} style={{ padding: '4px 10px', fontSize: '12px' }}>
                  <X size={12} /> Clear {pinnedPoints.length} pin{pinnedPoints.length > 1 ? 's' : ''}
                </button>
              )}
            </div>
          </div>

          {/* Pinned points comparison bar */}
          {pinnedPoints.length > 0 && (
            <div style={{
              display: 'flex', gap: '12px', marginBottom: '12px', padding: '10px 14px',
              background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', flexWrap: 'wrap', alignItems: 'center'
            }}>
              {pinnedPoints.map((p, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px',
                  background: 'var(--bg-card)', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
                  borderLeft: `3px solid ${pinColors[i % pinColors.length]}`
                }}>
                  <span style={{ color: 'var(--text-muted)' }}>{p.date}</span>
                  <span>{curr}{p.close?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  <button onClick={() => setPinnedPoints(prev => prev.filter(pp => pp.date !== p.date))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0', color: 'var(--text-muted)', display: 'flex' }}>
                    <X size={12} />
                  </button>
                </div>
              ))}
              {pinnedPoints.length >= 2 && (
                <div style={{
                  padding: '4px 10px', background: 'var(--bg-card)', borderRadius: '8px',
                  fontSize: '12px', fontWeight: 700,
                  color: pinnedPoints[pinnedPoints.length - 1].close >= pinnedPoints[0].close ? 'var(--accent-green)' : 'var(--accent-red)'
                }}>
                  Δ {((pinnedPoints[pinnedPoints.length - 1].close - pinnedPoints[0].close) / pinnedPoints[0].close * 100).toFixed(2)}%
                  ({curr}{(pinnedPoints[pinnedPoints.length - 1].close - pinnedPoints[0].close).toLocaleString('en-IN', { maximumFractionDigits: 2 })})
                </div>
              )}
            </div>
          )}

          <div style={{ width: '100%', height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} onClick={handleChartClick} style={{ cursor: 'crosshair' }}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5367F5" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#5367F5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '13px' }}
                  cursor={{ stroke: 'var(--accent-purple)', strokeWidth: 1, strokeDasharray: '5 5' }}
                />
                <Area type="monotone" dataKey="close" stroke="#5367F5" fill="url(#priceGrad)" strokeWidth={2} dot={false} />
                {/* Pinned reference lines & dots */}
                {pinnedPoints.map((p, i) => (
                  <ReferenceLine
                    key={`line-${i}`}
                    x={p.date}
                    stroke={pinColors[i % pinColors.length]}
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    label={{
                      value: `${curr}${p.close?.toFixed(1)}`,
                      position: 'top',
                      fill: pinColors[i % pinColors.length],
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  />
                ))}
                {pinnedPoints.map((p, i) => (
                  <ReferenceDot
                    key={`dot-${i}`}
                    x={p.date}
                    y={p.close}
                    r={6}
                    fill={pinColors[i % pinColors.length]}
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Volume Chart - with contrasting tooltip text */}
      {chartData.length > 0 && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>Volume</h3>
          <div style={{ width: '100%', height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#1a1a2e',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                    fontSize: '13px',
                    color: '#ffffff',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  }}
                  labelStyle={{ color: '#ffffff', fontWeight: 600 }}
                  itemStyle={{ color: '#FFD93D' }}
                  cursor={{ fill: 'rgba(83, 103, 245, 0.08)' }}
                />
                <Bar dataKey="volume" fill="#00D09C" radius={[4, 4, 0, 0]} opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
