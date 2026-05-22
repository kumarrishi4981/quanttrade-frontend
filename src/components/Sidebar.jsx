import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, TrendingUp, Target, Zap, ClipboardList, Sun, Moon, Menu, X } from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/stocks', label: 'Stocks', icon: TrendingUp },
  { path: '/strategies', label: 'Strategies', icon: Target },
  { path: '/backtest', label: 'Run Backtest', icon: Zap },
  { path: '/results', label: 'Results', icon: ClipboardList },
];

export default function Sidebar() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  return (
    <>
      <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="/logo.png" alt="QuantTrade" style={{ width: '36px', height: '36px', borderRadius: '10px' }} />
            <span className="sidebar-logo-text">QuantTrade</span>
          </div>
          <p className="sidebar-tagline">Smart Trading, Simplified</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="theme-toggle-wrapper" onClick={toggleTheme}>
            <Sun size={16} className="theme-icon sun" />
            <div className={`theme-toggle ${theme === 'dark' ? 'dark' : ''}`}>
              <div className="theme-toggle-circle" />
            </div>
            <Moon size={16} className="theme-icon moon" />
          </div>
          <p className="sidebar-version">v1.0.0 • India + Global</p>
        </div>
      </aside>
    </>
  );
}
