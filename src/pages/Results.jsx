import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Eye } from 'lucide-react';
import { api } from '../services/api';

export default function Results() {
  const [backtests, setBacktests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getBacktests()
      .then(setBacktests)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">Backtest Results</h1>
        <p className="page-subtitle">View and analyze all your completed backtesting runs</p>
      </div>

      {backtests.length > 0 ? (
        <div className="card">
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Stock</th>
                  <th>Strategy</th>
                  <th>Period</th>
                  <th>Capital</th>
                  <th>Return</th>
                  <th>Sharpe</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {backtests.map((bt, i) => (
                  <tr key={bt.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td><span className="stock-symbol" style={{ fontSize: '14px' }}>{bt.stock?.symbol}</span></td>
                    <td style={{ fontFamily: 'Inter' }}>{bt.strategy?.name}</td>
                    <td style={{ fontSize: '12px' }}>{bt.startDate} → {bt.endDate}</td>
                    <td>${bt.initialCapital?.toLocaleString()}</td>
                    <td>
                      {bt.result ? (
                        <span className={bt.result.totalReturn >= 0 ? 'text-green' : 'text-red'} style={{ fontWeight: 700 }}>
                          {bt.result.totalReturn >= 0 ? '+' : ''}{bt.result.totalReturn}%
                        </span>
                      ) : '—'}
                    </td>
                    <td>{bt.result?.sharpeRatio || '—'}</td>
                    <td>
                      <span className={`badge ${bt.status === 'COMPLETED' ? 'badge-green' : bt.status === 'FAILED' ? 'badge-red' : 'badge-amber'}`}>
                        {bt.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/results/${bt.id}`} className="btn btn-secondary btn-sm">
                        <Eye size={14} /> Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📊</div>
            <p className="empty-state-text">No backtest results yet. Run your first backtest!</p>
            <Link to="/backtest" className="btn btn-primary">Run Backtest</Link>
          </div>
        </div>
      )}
    </div>
  );
}
