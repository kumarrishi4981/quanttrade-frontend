import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Stocks from './pages/Stocks';
import StockDetail from './pages/StockDetail';
import Strategies from './pages/Strategies';
import RunBacktest from './pages/RunBacktest';
import Results from './pages/Results';
import BacktestDetail from './pages/BacktestDetail';

export default function App() {
  return (
    <Router>
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/stocks" element={<Stocks />} />
            <Route path="/stocks/:id" element={<StockDetail />} />
            <Route path="/strategies" element={<Strategies />} />
            <Route path="/backtest" element={<RunBacktest />} />
            <Route path="/results" element={<Results />} />
            <Route path="/results/:id" element={<BacktestDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
