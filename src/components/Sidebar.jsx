import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Brain, FlaskConical, TrendingUp, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/stocks', icon: <TrendingUp size={20} />, label: 'Stocks' },
    { path: '/strategies', icon: <Brain size={20} />, label: 'Strategies' },
    { path: '/backtest', icon: <FlaskConical size={20} />, label: 'Run Backtest' },
    { path: '/results', icon: <BarChart3 size={20} />, label: 'Results' },
  ];

  return (
    <>
      <button className="mobile-menu-btn" onClick={() => setIsOpen(true)}
        style={{ position: 'fixed', top: 16, left: 16, zIndex: 101 }}>
        <Menu size={24} />
      </button>

      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo" onClick={() => setIsOpen(false)}>
            <div className="sidebar-logo-icon">📈</div>
            <span className="sidebar-logo-text">QuantTrade</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          <span className="sidebar-section-label">Main Menu</span>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ background: 'var(--gradient-hero)', borderRadius: 'var(--radius-md)', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent-green)', marginBottom: '4px' }}>MARKET STATUS</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Simulation Mode</div>
          </div>
        </div>
      </aside>
    </>
  );
}
