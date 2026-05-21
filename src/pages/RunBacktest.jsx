import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, Play, Loader2 } from 'lucide-react';
import { api } from '../services/api';

export default function RunBacktest() {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    stockId: '', strategyId: '', startDate: '2023-03-01', endDate: '2024-12-01', initialCapital: 100000,
  });

  useEffect(() => {
    Promise.all([api.getStocks(), api.getStrategies()])
      .then(([s, st]) => { setStocks(s); setStrategies(st); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setRunning(true);
    try {
      const result = await api.runBacktest({
        stockId: parseInt(form.stockId),
        strategyId: parseInt(form.strategyId),
        startDate: form.startDate,
        endDate: form.endDate,
        initialCapital: parseFloat(form.initialCapital),
      });
      navigate(`/results/${result.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">Run Backtest</h1>
        <p className="page-subtitle">Select a stock and strategy, then execute a simulated trading backtest</p>
      </div>

      <div className="card" style={{ maxWidth: '700px' }}>
        <h3 className="chart-title"><FlaskConical size={18} /> Backtest Configuration</h3>

        {error && (
          <div style={{ background: 'var(--accent-red-glow)', border: '1px solid rgba(255,71,87,0.3)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: '20px', color: 'var(--accent-red)', fontSize: '14px' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Stock</label>
              <select className="form-select" value={form.stockId}
                onChange={(e) => setForm({ ...form, stockId: e.target.value })} required>
                <option value="">Select a stock...</option>
                {stocks.map((s) => <option key={s.id} value={s.id}>{s.symbol} — {s.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Strategy</label>
              <select className="form-select" value={form.strategyId}
                onChange={(e) => setForm({ ...form, strategyId: e.target.value })} required>
                <option value="">Select a strategy...</option>
                {strategies.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input type="date" className="form-input" value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">End Date</label>
              <input type="date" className="form-input" value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Initial Capital ($)</label>
            <input type="number" className="form-input" value={form.initialCapital}
              onChange={(e) => setForm({ ...form, initialCapital: e.target.value })} required min="1000" step="1000" />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={running} style={{ width: '100%', marginTop: '8px' }}>
            {running ? <><Loader2 size={20} className="spinner" style={{ animation: 'spin 0.8s linear infinite' }} /> Running Backtest...</> : <><Play size={20} /> Execute Backtest</>}
          </button>
        </form>
      </div>
    </div>
  );
}
