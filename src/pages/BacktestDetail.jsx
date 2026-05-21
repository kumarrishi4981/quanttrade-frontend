import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, BarChart3, Target, Shield, Zap } from 'lucide-react';
import { api } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function BacktestDetail() {
  const { id } = useParams();
  const [backtest, setBacktest] = useState(null);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getBacktest(id),
      api.getBacktestTrades(id),
    ]).then(([bt, tr]) => {
      setBacktest(bt);
      setTrades(tr);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!backtest) return <div className="page-container"><p>Backtest not found</p></div>;

  const r = backtest.result;
  const isProfit = r && r.totalReturn >= 0;

  // Build equity curve from trades
  const equityData = trades
    .filter(t => t.portfolioValue)
    .map(t => ({ date: t.date, value: t.portfolioValue }));

  // Add initial point
  if (equityData.length > 0) {
    equityData.unshift({ date: backtest.startDate, value: backtest.initialCapital });
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px', fontSize: '13px' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</p>
          <p style={{ color: 'var(--accent-green)', fontFamily: 'JetBrains Mono' }}>${payload[0].value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page-container fade-in">
      <Link to="/results" className="btn btn-secondary btn-sm mb-24" style={{ width: 'fit-content' }}>
        <ArrowLeft size={16} /> Back to Results
      </Link>

      <div className="flex items-center justify-between mb-24" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">{backtest.stock?.symbol} · {backtest.strategy?.name}</h1>
          <p className="page-subtitle">{backtest.startDate} → {backtest.endDate} · Initial: ${backtest.initialCapital?.toLocaleString()}</p>
        </div>
        <div>
          <span className={`badge ${backtest.status === 'COMPLETED' ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '14px', padding: '6px 16px' }}>
            {backtest.status}
          </span>
        </div>
      </div>

      {r && (
        <>
          <div className="card-grid mb-24">
            <div className={`stat-card ${isProfit ? 'green' : 'red'}`}>
              <div className="stat-card-header">
                <span className="stat-card-label">Total Return</span>
                <div className={`stat-card-icon ${isProfit ? 'green' : 'red'}`}><TrendingUp size={20} /></div>
              </div>
              <div className="stat-card-value" style={{ color: isProfit ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {isProfit ? '+' : ''}{r.totalReturn}%
              </div>
              <div className="stat-card-change" style={{ color: 'var(--text-secondary)' }}>
                ${backtest.initialCapital?.toLocaleString()} → ${r.finalCapital?.toLocaleString()}
              </div>
            </div>

            <div className="stat-card blue">
              <div className="stat-card-header">
                <span className="stat-card-label">Sharpe Ratio</span>
                <div className="stat-card-icon blue"><Shield size={20} /></div>
              </div>
              <div className="stat-card-value">{r.sharpeRatio}</div>
            </div>

            <div className="stat-card amber">
              <div className="stat-card-header">
                <span className="stat-card-label">CAGR</span>
                <div className="stat-card-icon amber"><Zap size={20} /></div>
              </div>
              <div className="stat-card-value">{r.cagr}%</div>
            </div>

            <div className="stat-card red">
              <div className="stat-card-header">
                <span className="stat-card-label">Max Drawdown</span>
                <div className="stat-card-icon red"><Target size={20} /></div>
              </div>
              <div className="stat-card-value">-{r.maxDrawdown}%</div>
            </div>
          </div>

          <div className="metrics-grid mb-24">
            <div className="metric-item">
              <div className="metric-label">Win Rate</div>
              <div className="metric-value text-green">{r.winRate}%</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Total Trades</div>
              <div className="metric-value">{r.totalTrades}</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Profitable</div>
              <div className="metric-value text-green">{r.profitableTrades}</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Losing</div>
              <div className="metric-value text-red">{r.losingTrades}</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Avg Win</div>
              <div className="metric-value text-green">${r.avgWin?.toLocaleString()}</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Avg Loss</div>
              <div className="metric-value text-red">${r.avgLoss?.toLocaleString()}</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Profit Factor</div>
              <div className="metric-value">{r.profitFactor}</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Largest Win</div>
              <div className="metric-value text-green">${r.largestWin?.toLocaleString()}</div>
            </div>
          </div>

          {equityData.length > 1 && (
            <div className="chart-container mb-24">
              <div className="chart-title"><TrendingUp size={18} /> Equity Curve</div>
              <div style={{ height: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={equityData}>
                    <defs>
                      <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isProfit ? '#00d4aa' : '#ff4757'} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={isProfit ? '#00d4aa' : '#ff4757'} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="value" stroke={isProfit ? '#00d4aa' : '#ff4757'} strokeWidth={2} fill="url(#equityGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}

      {trades.length > 0 && (
        <div className="card">
          <h3 className="chart-title"><BarChart3 size={18} /> Trade Log ({trades.length} trades)</h3>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>P&L</th>
                  <th>Portfolio</th>
                  <th>Signal</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t, i) => (
                  <tr key={t.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td>{t.date}</td>
                    <td>
                      <span className={`badge ${t.type === 'BUY' ? 'badge-green' : 'badge-red'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td>${t.price?.toFixed(2)}</td>
                    <td>{t.quantity}</td>
                    <td>
                      {t.pnl != null ? (
                        <span className={t.pnl >= 0 ? 'text-green' : 'text-red'} style={{ fontWeight: 600 }}>
                          {t.pnl >= 0 ? '+' : ''}${t.pnl.toFixed(2)}
                        </span>
                      ) : '—'}
                    </td>
                    <td>${t.portfolioValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ fontFamily: 'Inter', fontSize: '12px', color: 'var(--text-secondary)' }}>{t.signal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
