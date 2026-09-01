import { useState, useEffect } from 'react';
import { Zap, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function ServerStatusBanner() {
  const [status, setStatus] = useState('checking'); // 'checking' | 'waking' | 'ready' | 'hidden'
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let timer;
    let isMounted = true;
    const startTime = Date.now();

    const checkServer = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);

        await api.getStocks();
        clearTimeout(timeoutId);

        if (isMounted) {
          setStatus('hidden');
          return;
        }
      } catch (err) {
        if (isMounted) {
          setStatus('waking');
          timer = setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
          }, 1000);
        }
      }

      // Poll until backend is awake
      const pollInterval = setInterval(async () => {
        try {
          await api.getStocks();
          if (isMounted) {
            clearInterval(pollInterval);
            clearInterval(timer);
            setStatus('ready');

            setTimeout(() => {
              if (isMounted) setStatus('hidden');
            }, 3500);
          }
        } catch {
          // Still waking up
        }
      }, 4000);

      return () => {
        clearInterval(pollInterval);
        clearInterval(timer);
      };
    };

    checkServer();

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  if (status === 'checking' || status === 'hidden') return null;

  if (status === 'ready') {
    return (
      <div style={{
        background: 'rgba(0, 179, 134, 0.12)',
        borderBottom: '1px solid rgba(0, 179, 134, 0.35)',
        backdropFilter: 'blur(10px)',
        color: '#00b386',
        padding: '8px 16px',
        fontSize: '13px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        zIndex: 999
      }}>
        <CheckCircle2 size={16} />
        <span>QuantTrade Engine Connected! Live market data active.</span>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(90deg, #1a1a2e, #16213e)',
      borderBottom: '1px solid rgba(0, 179, 134, 0.3)',
      color: '#ffffff',
      padding: '10px 18px',
      fontSize: '13px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      flexWrap: 'wrap',
      zIndex: 999
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#00b386' }}>
        <Zap size={16} style={{ animation: 'pulse 1.5s infinite' }} />
        <strong>QuantTrade Engine Booting</strong>
      </div>
      
      <span style={{ color: '#9aa0a6' }}>
        Render free tier spins down idle instances. Engine startup takes ~30s (<strong>{elapsedSeconds}s</strong> elapsed).
      </span>

      <div style={{
        width: '120px',
        height: '6px',
        background: 'rgba(255, 255, 255, 0.15)',
        borderRadius: '999px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          width: `${Math.min((elapsedSeconds / 35) * 100, 95)}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #00b386, #06b6d4)',
          transition: 'width 1s linear'
        }} />
      </div>
    </div>
  );
}
