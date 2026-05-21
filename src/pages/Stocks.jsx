import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { api } from '../services/api';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function Stocks() {
  const [stocks, setStocks] = useState([]);
  const [stockPrices, setStockPrices] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStocks()
      .then(async (data) => {
        setStocks(data);
        const priceMap = {};
        for (const stock of data) {
          try {
            const prices = await api.getStockPrices(stock.id);
            priceMap[stock.id] = prices;
          } catch (e) {
            console.error(e);
          }
        }
        setStockPrices(priceMap);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const getLatestPrice = (stockId) => {
    const prices = stockPrices[stockId];
    if (!prices || prices.length === 0) return null;
    return prices[prices.length - 1].closePrice;
  };

  const getPriceChange = (stockId) => {
    const prices = stockPrices[stockId];
    if (!prices || prices.length < 2) return 0;
    const last = prices[prices.length - 1].closePrice;
    const first = prices[0].closePrice;
    return ((last - first) / first * 100).toFixed(2);
  };

  const getSparkData = (stockId) => {
    const prices = stockPrices[stockId];
    if (!prices) return [];
    return prices.filter((_, i) => i % 5 === 0).map(p => ({ v: p.closePrice }));
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header">
        <h1 className="page-title">Stocks</h1>
        <p className="page-subtitle">Browse available stocks with price data for backtesting</p>
      </div>

      <div className="card-grid">
        {stocks.map((stock) => {
          const price = getLatestPrice(stock.id);
          const change = getPriceChange(stock.id);
          const sparkData = getSparkData(stock.id);
          const isPositive = change >= 0;

          return (
            <Link to={`/stocks/${stock.id}`} key={stock.id} style={{ textDecoration: 'none' }}>
              <div className="card stock-card">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="stock-symbol">{stock.symbol}</div>
                    <div className="stock-name">{stock.name}</div>
                  </div>
                  <div className="stock-meta">
                    <span className="badge badge-blue">{stock.sector}</span>
                  </div>
                </div>

                <div style={{ height: '60px', marginTop: '16px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparkData}>
                      <Line
                        type="monotone"
                        dataKey="v"
                        stroke={isPositive ? '#00d4aa' : '#ff4757'}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-between" style={{ marginTop: '12px' }}>
                  <div className="stock-price" style={{ fontSize: '20px' }}>
                    ${price?.toFixed(2) || '—'}
                  </div>
                  <div className={`stat-card-change ${isPositive ? 'positive' : 'negative'}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {isPositive ? '+' : ''}{change}%
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
