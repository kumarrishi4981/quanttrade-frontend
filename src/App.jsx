import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ServerStatusBanner from './components/ServerStatusBanner';

// Pages - lazy load to optimize bundles
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Stocks = lazy(() => import('./pages/Stocks'));
const StockDetail = lazy(() => import('./pages/StockDetail'));
const Strategies = lazy(() => import('./pages/Strategies'));
const RunBacktest = lazy(() => import('./pages/RunBacktest'));
const Results = lazy(() => import('./pages/Results'));
const BacktestDetail = lazy(() => import('./pages/BacktestDetail'));

export default function App() {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <ServerStatusBanner />
          <Suspense fallback={
            <div className="loading-spinner" style={{ minHeight: '80vh' }}>
              <div className="spinner" />
            </div>
          }>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/stocks" element={<Stocks />} />
              <Route path="/stocks/:id" element={<StockDetail />} />
              <Route path="/strategies" element={<Strategies />} />
              <Route path="/backtest" element={<RunBacktest />} />
              <Route path="/results" element={<Results />} />
              <Route path="/results/:id" element={<BacktestDetail />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </Router>
  );
}
