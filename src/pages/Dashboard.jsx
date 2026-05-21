import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, BarChart3, Brain, FlaskConical, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { api } from '../services/api';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardSummary()
      .then(setSummary)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your trading strategies and backtesting performance</p>
      </div>

      <div className="card-grid mb-24">
        <div className="stat-card green">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Stocks</span>
            <div className="stat-card-icon green"><TrendingUp size={20} /></div>
          </div>
          <div className="stat-card-value">{summary?.totalStocks || 0}</div>
          <div className="stat-card-change positive">Available for analysis</div>
        </div>

        <div className="stat-card blue">
          <div className="stat-card-header">
            <span className="stat-card-label">Strategies</span>
            <div className="stat-card-icon blue"><Brain size={20} /></div>
          </div>
          <div className="stat-card-value">{summary?.totalStrategies || 0}</div>
          <div className="stat-card-change" style={{ color: 'var(--accent-blue)' }}>Trading algorithms</div>
        </div>

        <div className="stat-card purple">
          <div className="stat-card-header">
            <span className="stat-card-label">Backtests Run</span>
            <div className="stat-card-icon purple"><FlaskConical size={20} /></div>
          </div>
          <div className="stat-card-value">{summary?.totalBacktests || 0}</div>
          <div className="stat-card-change" style={{ color: 'var(--accent-purple)' }}>{summary?.completedBacktests || 0} completed</div>
        </div>

        <div className="stat-card amber">
          <div className="stat-card-header">
            <span className="stat-card-label">Best Return</span>
            <div className="stat-card-icon amber"><BarChart3 size={20} /></div>
          </div>
          <div className="stat-card-value">
            {summary?.bestReturn != null ? `${summary.bestReturn}%` : '—'}
          </div>
          {summary?.bestReturnStock && (
            <div className="stat-card-change positive">
              {summary.bestReturnStock} · {summary.bestReturnStrategy}
            </div>
          )}
        </div>
      </div>

      {summary?.avgReturn != null && (
        <div className="card-grid mb-24">
          <div className="stat-card green">
            <div className="stat-card-header">
              <span className="stat-card-label">Avg Return</span>
              <div className="stat-card-icon green">
                {summary.avgReturn >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
              </div>
            </div>
            <div className="stat-card-value" style={{ color: summary.avgReturn >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              {summary.avgReturn}%
            </div>
          </div>
          <div className="stat-card blue">
            <div className="stat-card-header">
              <span className="stat-card-label">Avg Sharpe Ratio</span>
              <div className="stat-card-icon blue"><BarChart3 size={20} /></div>
            </div>
            <div className="stat-card-value">{summary.avgSharpeRatio}</div>
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="chart-title"><FlaskConical size={18} /> Recent Backtests</h3>
        {summary?.recentBacktests?.length > 0 ? (
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Stock</th>
                  <th>Strategy</th>
                  <th>Status</th>
                  <th>Return</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {summary.recentBacktests.map((bt) => (
                  <tr key={bt.id}>
                    <td><span className="stock-symbol" style={{ fontSize: '14px' }}>{bt.stock}</span></td>
                    <td>{bt.strategy}</td>
                    <td>
                      <span className={`badge ${bt.status === 'COMPLETED' ? 'badge-green' : bt.status === 'FAILED' ? 'badge-red' : 'badge-amber'}`}>
                        {bt.status}
                      </span>
                    </td>
                    <td>
                      {bt.totalReturn != null ? (
                        <span className={bt.totalReturn >= 0 ? 'text-green' : 'text-red'}>
                          {bt.totalReturn >= 0 ? '+' : ''}{bt.totalReturn}%
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      <Link to={`/results/${bt.id}`} className="btn btn-sm btn-secondary">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🧪</div>
            <p className="empty-state-text">No backtests yet. Run your first backtest to see results here.</p>
            <Link to="/backtest" className="btn btn-primary">Run Backtest</Link>
          </div>
        )}
      </div>
    </div>
  );
}
