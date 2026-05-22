import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Zap, Loader2, CheckCircle2 } from 'lucide-react';

export default function RunBacktest() {
  const [stocks, setStocks] = useState([]);
  const [strategies, setStrategies] = useState([]);
  const [form, setForm] = useState({ stockId: '', strategyId: '', startDate: '2023-01-02', endDate: '2024-12-31', initialCapital: 100000 });
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([api.getStocks(), api.getStrategies()]).then(([s, st]) => { setStocks(s); setStrategies(st); });
  }, []);

  const selectedStock = stocks.find(s => s.id === Number(form.stockId));
  const curr = selectedStock?.exchange === 'NSE' ? '₹' : '$';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setRunning(true);
    setResult(null);
    try { const res = await api.runBacktest(form); setResult(res); } catch (err) { alert(err.message); } finally { setRunning(false); }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Run Backtest</h1>
          <p className="page-subtitle">Test your trading strategy against historical data</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: '24px' }}>
        <div className="card">
          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>⚙️ Configure Backtest</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Select Stock</label>
              <select className="form-select" required value={form.stockId} onChange={e => setForm({ ...form, stockId: e.target.value })}>
                <option value="">Choose a stock...</option>
                <optgroup label="🇮🇳 Indian Stocks (NSE)">
                  {stocks.filter(s => s.exchange === 'NSE').map(s => (<option key={s.id} value={s.id}>{s.symbol} — {s.name}</option>))}
                </optgroup>
                <optgroup label="🌍 International Stocks">
                  {stocks.filter(s => s.exchange !== 'NSE').map(s => (<option key={s.id} value={s.id}>{s.symbol} — {s.name}</option>))}
                </optgroup>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Select Strategy</label>
              <select className="form-select" required value={form.strategyId} onChange={e => setForm({ ...form, strategyId: e.target.value })}>
                <option value="">Choose a strategy...</option>
                {strategies.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group"><label className="form-label">Start Date</label><input className="form-input" type="date" required value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">End Date</label><input className="form-input" type="date" required value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /></div>
            </div>
            <div className="form-group">
              <label className="form-label">Initial Capital ({curr})</label>
              <input className="form-input" type="number" required min={1000} value={form.initialCapital} onChange={e => setForm({ ...form, initialCapital: parseFloat(e.target.value) })} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={running}>
              {running ? <><Loader2 size={18} className="spin" /> Running...</> : <><Zap size={18} /> Execute Backtest</>}
            </button>
          </form>
        </div>

        {result && (
          <div className="card animate-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <CheckCircle2 size={24} color="var(--success)" />
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Backtest Complete!</h2>
            </div>
            {result.result && (
              <>
                <div className="grid-2" style={{ gap: '12px', marginBottom: '16px' }}>
                  {[
                    { label: 'Final Capital', value: `${curr}${result.result.finalCapital?.toLocaleString('en-IN')}`, color: result.result.totalReturn > 0 ? 'green' : 'red' },
                    { label: 'Total Return', value: `${result.result.totalReturn > 0 ? '+' : ''}${result.result.totalReturn}%`, color: result.result.totalReturn > 0 ? 'green' : 'red' },
                    { label: 'Win Rate', value: `${result.result.winRate}%`, color: 'purple' },
                    { label: 'Sharpe Ratio', value: result.result.sharpeRatio?.toFixed(2), color: 'purple' },
                    { label: 'Max Drawdown', value: `${result.result.maxDrawdown}%`, color: 'orange' },
                    { label: 'Total Trades', value: result.result.totalTrades, color: 'purple' },
                  ].map((m, i) => (
                    <div key={i} className={`stat-card ${m.color}`} style={{ padding: '14px' }}>
                      <div className="stat-label" style={{ fontSize: '11px' }}>{m.label}</div>
                      <div className="stat-value" style={{ fontSize: '20px' }}>{m.value}</div>
                    </div>
                  ))}
                </div>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate(`/results/${result.id}`)}>View Full Results →</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
