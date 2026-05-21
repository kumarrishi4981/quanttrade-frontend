import { useState, useEffect } from 'react';
import { Brain, Plus, Trash2, Settings2 } from 'lucide-react';
import { api } from '../services/api';

export default function Strategies() {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', type: 'SMA_CROSSOVER',
    indicators: [{ indicatorType: 'SMA', period1: 20, period2: 50, threshold1: null, threshold2: null }],
  });

  useEffect(() => { loadStrategies(); }, []);

  const loadStrategies = () => {
    api.getStrategies()
      .then(setStrategies)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleTypeChange = (type) => {
    let indicators;
    switch (type) {
      case 'SMA_CROSSOVER':
        indicators = [{ indicatorType: 'SMA', period1: 20, period2: 50, threshold1: null, threshold2: null }];
        break;
      case 'RSI':
        indicators = [{ indicatorType: 'RSI', period1: 14, period2: null, threshold1: 30, threshold2: 70 }];
        break;
      case 'MACD':
        indicators = [{ indicatorType: 'MACD', period1: 12, period2: 26, threshold1: 9, threshold2: null }];
        break;
      case 'BOLLINGER_BANDS':
        indicators = [{ indicatorType: 'BOLLINGER', period1: 20, period2: null, threshold1: 2, threshold2: null }];
        break;
      default:
        indicators = [];
    }
    setForm({ ...form, type, indicators });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createStrategy(form);
      setShowForm(false);
      setForm({ name: '', description: '', type: 'SMA_CROSSOVER', indicators: [{ indicatorType: 'SMA', period1: 20, period2: 50, threshold1: null, threshold2: null }] });
      loadStrategies();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this strategy?')) return;
    try {
      await api.deleteStrategy(id);
      loadStrategies();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'SMA_CROSSOVER': return 'badge-green';
      case 'RSI': return 'badge-purple';
      case 'MACD': return 'badge-blue';
      case 'BOLLINGER_BANDS': return 'badge-amber';
      default: return 'badge-blue';
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="page-container fade-in">
      <div className="flex items-center justify-between mb-24" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 className="page-title">Strategies</h1>
          <p className="page-subtitle">Manage your trading algorithms and indicator configurations</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={18} /> New Strategy
        </button>
      </div>

      {showForm && (
        <div className="card mb-24" style={{ border: '1px solid rgba(0, 212, 170, 0.2)' }}>
          <h3 className="chart-title"><Settings2 size={18} /> Create Strategy</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Strategy Name</label>
                <input className="form-input" placeholder="e.g. Golden Cross" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select className="form-select" value={form.type} onChange={(e) => handleTypeChange(e.target.value)}>
                  <option value="SMA_CROSSOVER">SMA Crossover</option>
                  <option value="RSI">RSI</option>
                  <option value="MACD">MACD</option>
                  <option value="BOLLINGER_BANDS">Bollinger Bands</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input className="form-input" placeholder="Describe your strategy" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="card" style={{ background: 'var(--bg-tertiary)', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: 'var(--accent-cyan)' }}>Indicator Parameters</h4>
              {form.indicators.map((ind, i) => (
                <div className="form-row" key={i}>
                  <div className="form-group">
                    <label className="form-label">Period 1</label>
                    <input type="number" className="form-input" value={ind.period1 || ''}
                      onChange={(e) => { const inds = [...form.indicators]; inds[i].period1 = parseInt(e.target.value) || null; setForm({ ...form, indicators: inds }); }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Period 2</label>
                    <input type="number" className="form-input" value={ind.period2 || ''}
                      onChange={(e) => { const inds = [...form.indicators]; inds[i].period2 = parseInt(e.target.value) || null; setForm({ ...form, indicators: inds }); }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Threshold 1</label>
                    <input type="number" step="0.1" className="form-input" value={ind.threshold1 || ''}
                      onChange={(e) => { const inds = [...form.indicators]; inds[i].threshold1 = parseFloat(e.target.value) || null; setForm({ ...form, indicators: inds }); }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Threshold 2</label>
                    <input type="number" step="0.1" className="form-input" value={ind.threshold2 || ''}
                      onChange={(e) => { const inds = [...form.indicators]; inds[i].threshold2 = parseFloat(e.target.value) || null; setForm({ ...form, indicators: inds }); }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-12">
              <button type="submit" className="btn btn-primary">Create Strategy</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {strategies.length > 0 ? (
        <div className="card">
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Parameters</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {strategies.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600, fontFamily: 'Inter', color: 'var(--text-bright)' }}>{s.name}</td>
                    <td><span className={`badge ${getTypeColor(s.type)}`}>{s.type.replace('_', ' ')}</span></td>
                    <td style={{ fontFamily: 'Inter', color: 'var(--text-secondary)', maxWidth: '250px' }}>{s.description || '—'}</td>
                    <td>
                      {s.indicators?.map((ind, i) => (
                        <span key={i} style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          P1:{ind.period1 || '—'} P2:{ind.period2 || '—'} T1:{ind.threshold1 || '—'} T2:{ind.threshold2 || '—'}
                        </span>
                      ))}
                    </td>
                    <td>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>
                        <Trash2 size={14} />
                      </button>
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
            <div className="empty-state-icon">🧠</div>
            <p className="empty-state-text">No strategies created yet.</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <Plus size={18} /> Create First Strategy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
