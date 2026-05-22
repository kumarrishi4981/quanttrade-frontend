import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { TrendingUp, BarChart3, Target, Activity, ChevronRight, Zap } from 'lucide-react';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardSummary().then(setSummary).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner" />;

  const stats = [
    { label: 'Total Stocks', value: summary?.totalStocks || 0, icon: TrendingUp, color: 'purple', sub: 'Indian + Global' },
    { label: 'Active Strategies', value: summary?.totalStrategies || 0, icon: Target, color: 'green', sub: 'SMA, RSI, MACD, BB' },
    { label: 'Backtests Run', value: summary?.totalBacktests || 0, icon: BarChart3, color: 'orange', sub: `${summary?.completedBacktests || 0} completed` },
    { label: 'Best Return', value: summary?.bestReturn ? `${summary.bestReturn}%` : '—', icon: Activity, color: summary?.bestReturn > 0 ? 'green' : 'red', sub: summary?.bestReturnStock || 'Run a backtest' },
  ];

  return (
    <div className="animate-in">
      {/* Hero Banner - no images */}
      <div className="hero-banner">
        <div className="hero-content" style={{ maxWidth: '100%' }}>
          <h1>Welcome to QuantTrade 📈</h1>
          <p>Backtest your trading strategies on Indian & International stocks. Build, test, and analyze — all in one place.</p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <Link to="/backtest" className="btn btn-light"><Zap size={16} /> Run Backtest</Link>
            <Link to="/stocks" className="btn btn-light-outline">Browse Stocks</Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid-4" style={{ margin: '28px 0' }}>
        {stats.map((s, i) => (
          <div key={i} className={`stat-card ${s.color}`} style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="stat-card-content">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
            <div className={`stat-icon ${s.color}`}>
              <s.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Backtests */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Backtests</h2>
          <Link to="/results" className="btn btn-secondary btn-sm">View All <ChevronRight size={16} /></Link>
        </div>
        {summary?.recentBacktests?.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr><th>Stock</th><th>Strategy</th><th>Return</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {summary.recentBacktests.map((bt, i) => (
                  <tr key={i} className="animate-in" style={{ animationDelay: `${i * 0.05}s` }}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="stock-avatar-sm">{(bt.stock || '??').slice(0, 2)}</div>
                        <span className="text-semibold">{bt.stock}</span>
                      </div>
                    </td>
                    <td>{bt.strategy}</td>
                    <td><span className={`badge ${bt.totalReturn > 0 ? 'badge-success' : 'badge-danger'}`}>{bt.totalReturn > 0 ? '+' : ''}{bt.totalReturn}%</span></td>
                    <td><span className="badge badge-primary">{bt.status}</span></td>
                    <td><Link to={`/results/${bt.id}`} className="btn btn-secondary btn-sm btn-icon"><ChevronRight size={16} /></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <h3>No backtests yet</h3>
            <p>Run your first backtest to see results here!</p>
            <Link to="/backtest" className="btn btn-primary" style={{ marginTop: '16px' }}><Zap size={16} /> Run Backtest</Link>
          </div>
        )}
      </div>
    </div>
  );
}
