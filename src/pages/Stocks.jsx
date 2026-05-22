import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const exchangeColors = { NSE: 'badge-success', NASDAQ: 'badge-primary', NYSE: 'badge-warning' };

export default function Stocks() {
  const [stocks, setStocks] = useState([]);
  const [prices, setPrices] = useState({});
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getStocks().then(async (data) => {
      setStocks(data);
      const priceMap = {};
      await Promise.all(data.map(async (s) => {
        try {
          const p = await api.getStockPrices(s.id);
          priceMap[s.id] = p;
        } catch (e) { /* skip */ }
      }));
      setPrices(priceMap);
      setLoading(false);
    });
  }, []);

  const filtered = stocks.filter(s => {
    const matchesFilter = filter === 'all' || (filter === 'indian' && s.exchange === 'NSE') || (filter === 'intl' && s.exchange !== 'NSE');
    const matchesSearch = !search || s.symbol.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getChange = (stockId) => {
    const p = prices[stockId];
    if (!p || p.length < 2) return { value: 0, pct: 0 };
    const last = p[p.length - 1].closePrice;
    const prev = p[p.length - 2].closePrice;
    return { value: last - prev, pct: ((last - prev) / prev * 100) };
  };

  const getCurrency = (exchange) => exchange === 'NSE' ? '₹' : '$';

  if (loading) return <div className="loading-spinner" />;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Stocks</h1>
          <p className="page-subtitle">{stocks.length} stocks • Indian & International markets</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" className="form-input" placeholder="Search stocks..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '42px' }} />
        </div>
        <div className="filter-tabs">
          {[['all', 'All Stocks'], ['indian', '🇮🇳 Indian (NSE)'], ['intl', '🌍 International']].map(([key, label]) => (
            <button key={key} className={`filter-tab ${filter === key ? 'active' : ''}`} onClick={() => setFilter(key)}>{label}</button>
          ))}
        </div>
      </div>

      {/* Stock Cards Grid */}
      <div className="stock-grid">
        {filtered.map((stock, i) => {
          const change = getChange(stock.id);
          const sparkData = (prices[stock.id] || []).slice(-30).map(p => ({ v: p.closePrice }));
          const lastPrice = prices[stock.id]?.length > 0 ? prices[stock.id][prices[stock.id].length - 1].closePrice : 0;
          const isPositive = change.pct >= 0;

          return (
            <div key={stock.id} className="stock-card card" onClick={() => navigate(`/stocks/${stock.id}`)} style={{ cursor: 'pointer', animationDelay: `${i * 0.03}s` }}>
              <div className="stock-card-header">
                <div className="stock-avatar">{stock.symbol.slice(0, 2)}</div>
                <div style={{ flex: 1 }}>
                  <div className="stock-symbol">{stock.symbol}</div>
                  <div className="stock-name">{stock.name}</div>
                </div>
                <span className={`badge ${exchangeColors[stock.exchange] || 'badge-neutral'}`}>{stock.exchange}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '16px' }}>
                <div>
                  <div className="stock-price">{getCurrency(stock.exchange)}{lastPrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                  <div className={`stock-change ${isPositive ? 'positive' : 'negative'}`}>
                    {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    <span>{isPositive ? '+' : ''}{change.pct.toFixed(2)}%</span>
                  </div>
                </div>
                <div style={{ width: '80px', height: '40px' }}>
                  {sparkData.length > 2 && (
                    <ResponsiveContainer width="100%" height={40}>
                      <AreaChart data={sparkData}>
                        <defs>
                          <linearGradient id={`spark-${stock.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={isPositive ? '#00D09C' : '#EB5B3C'} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={isPositive ? '#00D09C' : '#EB5B3C'} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="v" stroke={isPositive ? '#00D09C' : '#EB5B3C'} fill={`url(#spark-${stock.id})`} strokeWidth={1.5} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <h3>No stocks found</h3>
          <p>Try adjusting your search or filter.</p>
        </div>
      )}
    </div>
  );
}
