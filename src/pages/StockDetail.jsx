import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, BarChart3 } from 'lucide-react';
import { api } from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function StockDetail() {
  const { id } = useParams();
  const [stock, setStock] = useState(null);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getStock(id),
      api.getStockPrices(id),
    ]).then(([stockData, priceData]) => {
      setStock(stockData.stock || stockData);
      setPrices(priceData);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;
  if (!stock) return <div className="page-container"><p>Stock not found</p></div>;

  const chartData = prices.map(p => ({
    date: p.date,
    close: p.closePrice,
    high: p.highPrice,
    low: p.lowPrice,
    volume: p.volume,
  }));

  const latestPrice = prices.length > 0 ? prices[prices.length - 1].closePrice : 0;
  const firstPrice = prices.length > 0 ? prices[0].closePrice : 0;
  const totalChange = ((latestPrice - firstPrice) / firstPrice * 100).toFixed(2);
  const isPositive = totalChange >= 0;

  const highestPrice = Math.max(...prices.map(p => p.highPrice));
  const lowestPrice = Math.min(...prices.map(p => p.lowPrice));
  const avgVolume = prices.length > 0 ? Math.round(prices.reduce((s, p) => s + p.volume, 0) / prices.length) : 0;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px', fontSize: '13px' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</p>
          <p style={{ color: 'var(--accent-green)', fontFamily: 'JetBrains Mono' }}>${payload[0].value?.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="page-container fade-in">
      <Link to="/stocks" className="btn btn-secondary btn-sm mb-24" style={{ width: 'fit-content' }}>
        <ArrowLeft size={16} /> Back to Stocks
      </Link>

      <div className="flex items-center justify-between mb-24" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="flex items-center gap-12">
            <h1 className="page-title">{stock.symbol}</h1>
            <span className="badge badge-blue">{stock.exchange}</span>
          </div>
          <p className="page-subtitle">{stock.name} · {stock.sector}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="stock-price">${latestPrice.toFixed(2)}</div>
          <div className={`stat-card-change ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '+' : ''}{totalChange}% all time
          </div>
        </div>
      </div>

      <div className="card-grid mb-24">
        <div className="stat-card green">
          <div className="stat-card-label">52W High</div>
          <div className="stat-card-value" style={{ fontSize: '22px' }}>${highestPrice.toFixed(2)}</div>
        </div>
        <div className="stat-card red">
          <div className="stat-card-label">52W Low</div>
          <div className="stat-card-value" style={{ fontSize: '22px' }}>${lowestPrice.toFixed(2)}</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-card-label">Avg Volume</div>
          <div className="stat-card-value" style={{ fontSize: '22px' }}>{(avgVolume / 1000000).toFixed(1)}M</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-card-label">Data Points</div>
          <div className="stat-card-value" style={{ fontSize: '22px' }}>{prices.length}</div>
        </div>
      </div>

      <div className="chart-container mb-24">
        <div className="chart-title"><TrendingUp size={18} /> Price History</div>
        <div style={{ height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickFormatter={(v) => v.substring(5)} interval={Math.floor(chartData.length / 8)} />
              <YAxis stroke="#64748b" fontSize={11} domain={['auto', 'auto']} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="close" stroke="#00d4aa" strokeWidth={2} fill="url(#priceGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-title"><BarChart3 size={18} /> Volume</div>
        <div style={{ height: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickFormatter={(v) => v.substring(5)} interval={Math.floor(chartData.length / 8)} />
              <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
              <Tooltip formatter={(v) => [(v / 1000000).toFixed(2) + 'M', 'Volume']} contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }} />
              <Bar dataKey="volume" fill="rgba(59, 130, 246, 0.5)" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
