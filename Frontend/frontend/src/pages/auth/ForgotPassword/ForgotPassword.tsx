import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateEmail } from '../../../utils/validators';
import { useToast } from '../../../hooks/useToast';
import Toast from '../../../components/Toast';
import './ForgotPassword.css';

type Status = 'form' | 'loading' | 'success';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { toasts, showToast, hideToast } = useToast();
  const [status, setStatus] = useState<Status>('form');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('E-posta adresi gereklidir');
      return;
    }

    if (!validateEmail(email)) {
      setError('Geçerli bir e-posta adresi giriniz');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Email gönderilemedi');
      }

      // ✅ Başarılı - Email gönderildi
      setStatus('success');
      showToast('Şifre sıfırlama linki email adresinize gönderildi', 'success');

    } catch (err) {
      setStatus('form');
      const errorMsg = err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    }
  };

  const renderForm = () => (
    <form onSubmit={handleEmailSubmit} className="forgot-form">
      <div className="form-header">
        <h2 className="form-title">E-posta Adresiniz</h2>
        <p className="form-description">
          Şifre sıfırlama linki göndereceğimiz e-posta adresinizi girin
        </p>
      </div>

      <div className="form-group">
        <label 
          htmlFor="email" 
          className={`form-label ${focusedField === 'email' ? 'focused' : ''}`}
        >
          E-posta Adresi
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
          onFocus={() => setFocusedField('email')}
          onBlur={() => setFocusedField(null)}
          className="form-input"
          placeholder="ornek@email.com"
          disabled={status === 'loading'}
          autoComplete="email"
          autoFocus
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
          {status === 'loading' ? 'Gönderiliyor...' : 'Şifre Sıfırlama Linki Gönder'}
        </span>
        <span className="button-arrow">→</span>
      </button>
    </form>
  );

  const renderSuccess = () => (
    <div className="success-container">
      <div className="success-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="22,6 12,13 2,6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2 className="success-title">Email Gönderildi!</h2>
      <p className="success-description">
        <strong>{email}</strong> adresine şifre sıfırlama linki gönderdik.
      </p>

      <div className="info-box">
        <h3 className="info-title">📬 Sonraki Adımlar:</h3>
        <ol className="info-list">
          <li>Email gelen kutunuzu kontrol edin</li>
          <li>ComplyMind'dan gelen emaili açın</li>
          <li>Emaildeki şifre sıfırlama linkine tıklayın</li>
          <li>Yeni şifrenizi oluşturun</li>
        </ol>
      </div>

      <div className="help-box">
        <p className="help-title">💡 Email gelmediyse:</p>
        <ul className="help-list">
          <li>Spam klasörünüzü kontrol edin</li>
          <li>Email adresinizin doğru olduğundan emin olun</li>
          <li>Birkaç dakika bekleyin</li>
        </ul>
      </div>

      <button
        onClick={() => setStatus('form')}
        className="secondary-button"
      >
        Başka Email Dene
      </button>
    </div>
  );

  return (
    <div className="forgot-password-container">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
        />
      ))}

      <div className="forgot-background">
        <div className="grid-overlay"></div>
      </div>

      <div className="forgot-card">
        <div className="forgot-header">
          <h1 className="forgot-title">
            <span className="title-line">Şifremi</span>
            <span className="title-line title-line-accent">Unuttum</span>
          </h1>
        </div>

        {status === 'form' && renderForm()}
        {status === 'loading' && renderForm()}
        {status === 'success' && renderSuccess()}

        {status !== 'success' && (
          <div className="form-footer">
            <a href="/login" className="back-link">
              ← Giriş sayfasına dön
            </a>
          </div>
        )}
      </div>

      <div className="forgot-footer">
        <p>© 2026 ComplyMind. Tüm hakları saklıdır.</p>
      </div>
    </div>
  );
}