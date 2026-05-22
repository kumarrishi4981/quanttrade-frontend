import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { ArrowLeft, TrendingUp, TrendingDown, Award, BarChart3, Activity, Shield, Target, Layers } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function BacktestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [backtest, setBacktest] = useState(null);
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getBacktest(id), api.getBacktestTrades(id)])
      .then(([bt, tr]) => { setBacktest(bt); setTrades(tr); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-spinner" />;
  if (!backtest) return <div className="empty-state"><h3>Backtest not found</h3></div>;

  const r = backtest.result || {};
  const curr = backtest.stock?.exchange === 'NSE' ? '₹' : '$';
  const isPositive = r.totalReturn > 0;
  const equityData = trades.filter(t => t.portfolioValue).map((t, i) => ({
    date: t.date?.slice(5),
    value: t.portfolioValue,
  }));

  const metrics = [
    { label: 'Final Capital', value: `${curr}${r.finalCapital?.toLocaleString('en-IN')}`, icon: Award, color: isPositive ? 'green' : 'red' },
    { label: 'Total Return', value: `${isPositive ? '+' : ''}${r.totalReturn}%`, icon: TrendingUp, color: isPositive ? 'green' : 'red' },
    { label: 'CAGR', value: `${r.cagr}%`, icon: Activity, color: 'purple' },
    { label: 'Sharpe Ratio', value: r.sharpeRatio?.toFixed(2), icon: BarChart3, color: 'purple' },
    { label: 'Max Drawdown', value: `${r.maxDrawdown}%`, icon: TrendingDown, color: 'red' },
    { label: 'Win Rate', value: `${r.winRate}%`, icon: Target, color: r.winRate >= 50 ? 'green' : 'orange' },
    { label: 'Profit Factor', value: r.profitFactor?.toFixed(2), icon: Shield, color: r.profitFactor >= 1 ? 'green' : 'red' },
    { label: 'Total Trades', value: r.totalTrades, icon: Layers, color: 'purple' },
  ];

  return (
    <div className="animate-in">
      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/results')} style={{ marginBottom: '20px' }}>
        <ArrowLeft size={16} /> Back to Results
      </button>

      {/* Header */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="stock-avatar" style={{ width: '56px', height: '56px', fontSize: '20px' }}>{backtest.stock?.symbol?.slice(0, 2)}</div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 700, margin: 0 }}>{backtest.stock?.symbol} • {backtest.strategy?.name}</h1>
              <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0', fontSize: '14px' }}>
                {backtest.startDate} → {backtest.endDate} • Initial: {curr}{backtest.initialCapital?.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          <div className={`badge ${isPositive ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '18px', padding: '8px 20px' }}>
            {isPositive ? '+' : ''}{r.totalReturn}%
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        {metrics.map((m, i) => (
          <div key={i} className={`stat-card ${m.color}`} style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="stat-card-content">
              <div className="stat-label">{m.label}</div>
              <div className="stat-value" style={{ fontSize: '22px' }}>{m.value}</div>
            </div>
            <div className={`stat-icon ${m.color}`}><m.icon size={20} /></div>
          </div>
        ))}
      </div>

      {/* Equity Curve */}
      {equityData.length > 0 && (
        <div className="card chart-container" style={{ marginBottom: '24px' }}>
          <h3 style={{ marginBottom: '16px' }}>📈 Equity Curve</h3>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={equityData}>
                <defs>
                  <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isPositive ? '#00D09C' : '#EB5B3C'} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={isPositive ? '#00D09C' : '#EB5B3C'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="value" stroke={isPositive ? '#00D09C' : '#EB5B3C'} fill="url(#eqGrad)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Trade Log */}
      <div className="card">
        <h3 style={{ marginBottom: '16px' }}>📋 Trade Log ({trades.length} trades)</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
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
                <tr key={i} className="animate-in" style={{ animationDelay: `${i * 0.02}s` }}>
                  <td style={{ fontSize: '13px' }}>{t.date}</td>
                  <td>
                    <span className={`badge ${t.type === 'BUY' ? 'badge-success' : 'badge-danger'}`}>{t.type}</span>
                  </td>
                  <td className="text-semibold">{curr}{t.price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                  <td>{t.quantity}</td>
                  <td>
                    {t.pnl != null ? (
                      <span style={{ color: t.pnl >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                        {t.pnl >= 0 ? '+' : ''}{curr}{t.pnl?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </span>
                    ) : '—'}
                  </td>
                  <td>{curr}{t.portfolioValue?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</td>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t.signal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
