const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

async function fetchJSON(url, options = {}) {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || 'API request failed');
  }
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  // Stocks
  getStocks: () => fetchJSON('/stocks'),
  getStock: (id) => fetchJSON(`/stocks/${id}`),
  getStockPrices: (id) => fetchJSON(`/stocks/${id}/prices`),

  // Strategies
  getStrategies: () => fetchJSON('/strategies'),
  getStrategy: (id) => fetchJSON(`/strategies/${id}`),
  createStrategy: (data) => fetchJSON('/strategies', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  deleteStrategy: (id) => fetchJSON(`/strategies/${id}`, { method: 'DELETE' }),

  // Backtests
  runBacktest: (data) => fetchJSON('/backtests', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getBacktests: () => fetchJSON('/backtests'),
  getBacktest: (id) => fetchJSON(`/backtests/${id}`),
  getBacktestTrades: (id) => fetchJSON(`/backtests/${id}/trades`),

  // Dashboard
  getDashboardSummary: () => fetchJSON('/dashboard/summary'),
};
