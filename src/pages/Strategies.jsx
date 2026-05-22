import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Plus, Trash2, X } from 'lucide-react';

const typeIcons = { SMA_CROSSOVER: '📊', RSI: '📉', MACD: '📈', BOLLINGER_BANDS: '🎯' };
const typeLabels = { SMA_CROSSOVER: 'SMA Crossover', RSI: 'RSI Reversal', MACD: 'MACD Crossover', BOLLINGER_BANDS: 'Bollinger Bands' };

export default function Strategies() {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', type: 'SMA_CROSSOVER', indicators: [{ indicatorType: 'SMA', period1: 20, period2: 50, threshold1: null, threshold2: null }] });

  useEffect(() => { loadStrategies(); }, []);

  const loadStrategies = () => {
    setLoading(true);
    api.getStrategies().then(setStrategies).catch(console.error).finally(() => setLoading(false));
  };

  const handleTypeChange = (type) => {
    let ind;
    switch (type) {
      case 'SMA_CROSSOVER': ind = { indicatorType: 'SMA', period1: 20, period2: 50, threshold1: null, threshold2: null }; break;
      case 'RSI': ind = { indicatorType: 'RSI', period1: 14, period2: null, threshold1: 30, threshold2: 70 }; break;
      case 'MACD': ind = { indicatorType: 'MACD', period1: 12, period2: 26, threshold1: 9, threshold2: null }; break;
      case 'BOLLINGER_BANDS': ind = { indicatorType: 'BOLLINGER', period1: 20, period2: null, threshold1: 2, threshold2: null }; break;
      default: ind = {};
    }
    setForm({ ...form, type, indicators: [ind] });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await api.createStrategy(form); setShowModal(false); loadStrategies(); } catch (err) { alert(err.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this strategy?')) return;
    try { await api.deleteStrategy(id); loadStrategies(); } catch (err) { alert(err.message); }
  };

  if (loading) return <div className="loading-spinner" />;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Strategies</h1>
          <p className="page-subtitle">{strategies.length} trading strategies configured</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={18} /> Create Strategy</button>
      </div>

      {strategies.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {strategies.map((s, i) => (
            <div key={s.id} className="card" style={{ animationDelay: `${i * 0.05}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '28px' }}>{typeIcons[s.type] || '📊'}</div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>{s.name}</h3>
                    <span className="badge badge-primary" style={{ marginTop: '4px', display: 'inline-block' }}>{typeLabels[s.type] || s.type}</span>
                  </div>
                </div>
                <button className="btn btn-danger btn-sm btn-icon" onClick={() => handleDelete(s.id)}><Trash2 size={14} /></button>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '12px', lineHeight: 1.5 }}>{s.description}</p>
              {s.indicators?.length > 0 && (
                <div style={{ marginTop: '12px', padding: '12px', background: 'var(--bg)', borderRadius: '10px', fontSize: '13px' }}>
                  <div style={{ fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase' }}>Parameters</div>
                  {s.indicators.map((ind, j) => (
                    <div key={j} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {ind.period1 && <span>Period 1: <strong>{ind.period1}</strong></span>}
                      {ind.period2 && <span>Period 2: <strong>{ind.period2}</strong></span>}
                      {ind.threshold1 != null && <span>Threshold 1: <strong>{ind.threshold1}</strong></span>}
                      {ind.threshold2 != null && <span>Threshold 2: <strong>{ind.threshold2}</strong></span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
          <h3>No strategies yet</h3>
          <p>Create your first trading strategy to get started.</p>
          <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setShowModal(true)}><Plus size={18} /> Create Strategy</button>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>Create Strategy</h2>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Strategy Name</label>
                <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Aggressive SMA" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe your strategy..." />
              </div>
              <div className="form-group">
                <label className="form-label">Strategy Type</label>
                <select className="form-select" value={form.type} onChange={e => handleTypeChange(e.target.value)}>
                  <option value="SMA_CROSSOVER">SMA Crossover</option>
                  <option value="RSI">RSI Reversal</option>
                  <option value="MACD">MACD Crossover</option>
                  <option value="BOLLINGER_BANDS">Bollinger Bands</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group"><label className="form-label">Period 1</label><input className="form-input" type="number" value={form.indicators[0]?.period1 || ''} onChange={e => setForm({ ...form, indicators: [{ ...form.indicators[0], period1: parseInt(e.target.value) || null }] })} /></div>
                <div className="form-group"><label className="form-label">Period 2</label><input className="form-input" type="number" value={form.indicators[0]?.period2 || ''} onChange={e => setForm({ ...form, indicators: [{ ...form.indicators[0], period2: parseInt(e.target.value) || null }] })} /></div>
                <div className="form-group"><label className="form-label">Threshold 1</label><input className="form-input" type="number" step="0.1" value={form.indicators[0]?.threshold1 || ''} onChange={e => setForm({ ...form, indicators: [{ ...form.indicators[0], threshold1: parseFloat(e.target.value) || null }] })} /></div>
                <div className="form-group"><label className="form-label">Threshold 2</label><input className="form-input" type="number" step="0.1" value={form.indicators[0]?.threshold2 || ''} onChange={e => setForm({ ...form, indicators: [{ ...form.indicators[0], threshold2: parseFloat(e.target.value) || null }] })} /></div>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Strategy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
