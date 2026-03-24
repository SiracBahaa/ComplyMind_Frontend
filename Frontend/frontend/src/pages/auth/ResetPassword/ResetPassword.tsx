import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { validatePassword, passwordsMatch } from '../../../utils/validators';
import { useToast } from '../../../hooks/useToast';
import Toast from '../../../components/Toast';
import './ResetPassword.css';

type ResetStatus = 'form' | 'loading' | 'success' | 'error';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toasts, showToast, hideToast } = useToast();

  const [status, setStatus] = useState<ResetStatus>('form');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    const errorFromUrl = searchParams.get('error');

    if (errorFromUrl) {
      // URL'de hata var - token geçersiz/expired
      setStatus('error');
      setError(decodeURIComponent(errorFromUrl));
      showToast(decodeURIComponent(errorFromUrl), 'error');
    } else if (tokenFromUrl) {
      // Token var - form göster
      setToken(tokenFromUrl);
      setStatus('form');
    } else {
      // Token yok - error
      setStatus('error');
      setError('Geçersiz şifre sıfırlama linki');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!password || !confirmPassword) {
      setError('Tüm alanlar zorunludur');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors[0]);
      return;
    }

    if (!passwordsMatch(password, confirmPassword)) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          token: token,
          password: password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Şifre sıfırlama başarısız');
      }

      // ✅ Başarılı
      setStatus('success');
      showToast('Şifreniz başarıyla değiştirildi!', 'success');

      // 3 saniye sonra login'e yönlendir
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err) {
      setStatus('form');
      const errorMsg = err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    }
  };

  // Form durumu
  const renderForm = () => (
    <>
      <div className="reset-header">
        <h1 className="reset-title">
          <span className="title-line">Şifrenizi</span>
          <span className="title-line title-line-accent">Sıfırlayın</span>
        </h1>
        <p className="reset-subtitle">
          Hesabınız için yeni bir güçlü şifre oluşturun
        </p>
      </div>

      <form onSubmit={handleSubmit} className="reset-form">
        <div className="form-group">
          <label 
            htmlFor="password" 
            className={`form-label ${focusedField === 'password' ? 'focused' : ''}`}
          >
            Yeni Şifre
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError('');
            }}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            className="form-input"
            placeholder="••••••••"
            disabled={status === 'loading'}
            autoComplete="new-password"
            autoFocus
          />
          <div className="input-hint">
            Min 8 karakter, 1 büyük harf, 1 rakam, 1 özel karakter
          </div>
        </div>

        <div className="form-group">
          <label 
            htmlFor="confirmPassword" 
            className={`form-label ${focusedField === 'confirmPassword' ? 'focused' : ''}`}
          >
            Şifre Tekrarı
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError('');
            }}
            onFocus={() => setFocusedField('confirmPassword')}
            onBlur={() => setFocusedField(null)}
            className="form-input"
            placeholder="••••••••"
            disabled={status === 'loading'}
            autoComplete="new-password"
          />
        </div>

        {error && (
          <div className="error-message">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L1 15h14L8 1z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M8 6v4M8 11.5v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        )}

        <button 
          type="submit" 
          className={`submit-button ${status === 'loading' ? 'loading' : ''}`}
          disabled={status === 'loading'}
        >
          <span className="button-text">
            {status === 'loading' ? 'Kaydediliyor...' : 'Şifreyi Sıfırla'}
          </span>
          <span className="button-arrow">→</span>
        </button>
      </form>
    </>
  );

  // Success durumu
  const renderSuccess = () => (
    <>
      <div className="status-icon success-icon">
        <svg className="checkmark" viewBox="0 0 52 52">
          <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
          <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
        </svg>
      </div>

      <h1 className="reset-title">
        <span className="title-line">Şifre</span>
        <span className="title-line title-line-accent">Değiştirildi!</span>
      </h1>

      <div className="success-content">
        <p className="status-message">
          ✓ Şifreniz başarıyla değiştirildi!
        </p>
        <p className="sub-message">
          Artık yeni şifrenizle giriş yapabilirsiniz.
        </p>

        <button
          onClick={() => navigate('/login')}
          className="login-button"
        >
          Giriş Yap
          <span className="button-arrow">→</span>
        </button>

        <p className="redirect-notice">
          3 saniye içinde giriş sayfasına yönlendirileceksiniz...
        </p>
      </div>
    </>
  );

  // Error durumu
  const renderError = () => (
    <>
      <div className="status-icon error-icon">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="2"/>
          <line x1="15" y1="9" x2="9" y2="15" strokeWidth="2" strokeLinecap="round"/>
          <line x1="9" y1="9" x2="15" y2="15" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>

      <h1 className="reset-title">
        <span className="title-line">Geçersiz</span>
        <span className="title-line title-line-error">Link</span>
      </h1>

      <div className="error-content">
        <p className="status-message error-message">
          {error || 'Şifre sıfırlama linki geçersiz veya süresi dolmuş'}
        </p>

        <button
          onClick={() => navigate('/forgot-password')}
          className="secondary-button"
        >
          Yeni Link Talep Et
        </button>
      </div>
    </>
  );

  return (
    <div className="reset-password-container">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
        />
      ))}

      <div className="reset-background">
        <div className="grid-overlay"></div>
      </div>

      <div className={`reset-card ${status}-state`}>
        {status === 'form' && renderForm()}
        {status === 'loading' && renderForm()}
        {status === 'success' && renderSuccess()}
        {status === 'error' && renderError()}
      </div>

      <div className="reset-footer">
        <p>© 2026 ComplyMind. Tüm hakları saklıdır.</p>
      </div>
    </div>
  );
}