import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GitHubCallback.css';

export default function GitHubCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const handled = useRef(false); // StrictMode double-invoke koruması

  useEffect(() => {
    if (handled.current) return; // İkinci çalışmayı engelle
    handled.current = true;

    try {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');

      if (!accessToken) {
        throw new Error('Access token bulunamadı');
      }

      localStorage.setItem('access_token', accessToken);
      window.history.replaceState(null, '', window.location.pathname);
      navigate('/dashboard', { replace: true });

    } catch (err) {
      console.error('GitHub callback error:', err);
      setError('GitHub ile giriş başarısız oldu');
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    }
  }, [navigate]);



  if (error) {
    return (
      <div className="github-callback-container">
        <div className="callback-background">
          <div className="grid-overlay"></div>
        </div>

        <div className="callback-card error">
          <div className="status-icon error-icon">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2"/>
              <line x1="15" y1="9" x2="9" y2="15" strokeWidth="2" strokeLinecap="round"/>
              <line x1="9" y1="9" x2="15" y2="15" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>

          <h1 className="callback-title">
            <span className="title-line">Giriş</span>
            <span className="title-line title-line-error">Başarısız</span>
          </h1>

          <p className="error-message">{error}</p>
          <p className="redirect-notice">Giriş sayfasına yönlendiriliyorsunuz...</p>
        </div>

        <div className="callback-footer">
          <p>© 2026 ComplyMind. Tüm hakları saklıdır.</p>
        </div>
      </div>
    );
  }

  // Loading state
  return (
    <div className="github-callback-container">
      <div className="callback-background">
        <div className="grid-overlay"></div>
      </div>

      <div className="callback-card">
        <div className="status-icon loading-icon">
          <svg className="spinner" viewBox="0 0 50 50">
            <circle
              className="spinner-path"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="4"
            />
          </svg>
        </div>

        <h1 className="callback-title">
          <span className="title-line">GitHub ile</span>
          <span className="title-line title-line-accent">Giriş Yapılıyor</span>
        </h1>

        <p className="status-message">
          Lütfen bekleyin...
        </p>
      </div>

      <div className="callback-footer">
        <p>© 2026 ComplyMind. Tüm hakları saklıdır.</p>
      </div>
    </div>
  );
}