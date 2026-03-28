import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './EmailVerified.css';

export default function EmailVerified() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(5);

  const success = searchParams.get('success');
  const error = searchParams.get('error');

  useEffect(() => {
    if (success === 'true') {
      // Başarılı - 5 saniye sonra login'e git
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [success, navigate]);

  // Success State
  if (success === 'true') {
    return (
      <div className="email-verified-container">
        <div className="verified-background">
          <div className="grid-overlay"></div>
        </div>

        <div className="verified-card success">
          <div className="status-icon success-icon">
            <svg className="checkmark" viewBox="0 0 52 52">
              <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
              <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>

          <h1 className="verified-title">
            <span className="title-line">Email</span>
            <span className="title-line title-line-accent">Doğrulandı!</span>
          </h1>

          <div className="verified-content">
            <p className="status-message">
              ✓ Email adresiniz başarıyla doğrulandı!
            </p>
            <p className="sub-message">
              Artık tüm özelliklere erişebilirsiniz.
            </p>

            <div className="info-box">
              <h3 className="info-title">🎉 Sonraki Adımlar:</h3>
              <ul className="info-list">
                <li>Giriş yapın ve hesabınıza erişin</li>
                <li>Profilinizi tamamlayın</li>
                <li>ComplyMind'ı keşfetmeye başlayın</li>
              </ul>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="login-button"
            >
              Giriş Yap
              <span className="button-arrow">→</span>
            </button>

            <p className="redirect-notice">
              {countdown} saniye içinde giriş sayfasına yönlendirileceksiniz...
            </p>
          </div>
        </div>

        <div className="verified-footer">
          <p>© 2026 ComplyMind. Tüm hakları saklıdır.</p>
        </div>
      </div>
    );
  }

  // Error State
  return (
    <div className="email-verified-container">
      <div className="verified-background">
        <div className="grid-overlay"></div>
      </div>

      <div className="verified-card error">
        <div className="status-icon error-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2"/>
            <line x1="15" y1="9" x2="9" y2="15" strokeWidth="2" strokeLinecap="round"/>
            <line x1="9" y1="9" x2="15" y2="15" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>

        <h1 className="verified-title">
          <span className="title-line">Doğrulama</span>
          <span className="title-line title-line-error">Başarısız</span>
        </h1>

        <div className="verified-content">
          <p className="status-message error-message">
            {error ? decodeURIComponent(error) : 'Geçersiz veya süresi dolmuş doğrulama linki'}
          </p>

          <div className="error-info">
            <p>Bu hatanın nedenleri:</p>
            <ul>
              <li>Doğrulama linkinizin süresi dolmuş olabilir</li>
              <li>Link zaten kullanılmış olabilir</li>
              <li>Email adresiniz zaten doğrulanmış olabilir</li>
            </ul>
          </div>

          <div className="error-actions">
            <button
              onClick={() => navigate('/login')}
              className="primary-button"
            >
              Giriş Yap
            </button>

            <button
              onClick={() => navigate('/signup')}
              className="secondary-button"
            >
              Yeni Hesap Oluştur
            </button>
          </div>
        </div>
      </div>

      <div className="verified-footer">
        <p>© 2026 ComplyMind. Tüm hakları saklıdır.</p>
      </div>
    </div>
  );
}