import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { ChevronRight, TrendingUp, TrendingDown, Zap } from 'lucide-react';

export default function Results() {
  const [backtests, setBacktests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getBacktests().then(setBacktests).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner" />;

  const getCurrency = (bt) => bt.stock?.exchange === 'NSE' ? '₹' : '$';

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Backtest Results</h1>
          <p className="page-subtitle">{backtests.length} backtests completed</p>
        </div>
      </div>

      {backtests.length > 0 ? (
        <div className="card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr><th>Stock</th><th>Strategy</th><th>Period</th><th>Initial</th><th>Final</th><th>Return</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {backtests.map((bt, i) => {
                  const curr = getCurrency(bt);
                  const ret = bt.result?.totalReturn;
                  const isPositive = ret > 0;
                  return (
                    <tr key={bt.id} className="animate-in" style={{ animationDelay: `${i * 0.03}s` }}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="stock-avatar-sm">{bt.stock?.symbol?.slice(0, 2)}</div>
                          <div>
                            <div className="text-semibold">{bt.stock?.symbol}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{bt.stock?.exchange}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="badge badge-primary">{bt.strategy?.name}</span></td>
                      <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{bt.startDate} → {bt.endDate}</td>
                      <td className="text-semibold">{curr}{bt.initialCapital?.toLocaleString('en-IN')}</td>
                      <td className="text-semibold">{curr}{bt.result?.finalCapital?.toLocaleString('en-IN')}</td>
                      <td>{ret != null ? <span className={`badge ${isPositive ? 'badge-success' : 'badge-danger'}`}>{isPositive ? '+' : ''}{ret}%</span> : '—'}</td>
                      <td><span className={`badge ${bt.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>{bt.status}</span></td>
                      <td><Link to={`/results/${bt.id}`} className="btn btn-secondary btn-sm btn-icon"><ChevronRight size={16} /></Link></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
          <h3>No backtest results yet</h3>
          <p>Run your first backtest to see results here!</p>
          <Link to="/backtest" className="btn btn-primary" style={{ marginTop: '16px' }}><Zap size={16} /> Run Backtest</Link>
        </div>
      )}
    </div>
  );
}
