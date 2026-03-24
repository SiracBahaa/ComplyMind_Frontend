import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../../../hooks/useToast';
import Toast from '../../../components/Toast';
import './EmailVerification.css';

type VerificationStatus = 'pending' | 'verifying' | 'success' | 'error' | 'expired';

export default function EmailVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toasts, showToast, hideToast } = useToast();
  
  const [status, setStatus] = useState<VerificationStatus>('pending');
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [resendTimer, setResendTimer] = useState(0);

  // URL'den token ve email al
  const token = searchParams.get('token');
  const emailFromUrl = searchParams.get('email');

  useEffect(() => {
    // Email'i URL'den veya localStorage'dan al
    const storedEmail = localStorage.getItem('pendingVerificationEmail');
    setEmail(emailFromUrl || storedEmail || '');

    // Eğer token varsa otomatik doğrula
    if (token) {
      console.log('🔑 Token bulundu, doğrulama başlatılıyor:', token);
      verifyEmailWithToken(token);
    } else {
      console.warn('⚠️ Token bulunamadı! URL:', window.location.href);
      setStatus('pending');
    }
  }, [token]);

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // ✅ GÜNCELLENDİ: Token ile email doğrulama (GET request)
  const verifyEmailWithToken = async (verificationToken: string) => {
    setStatus('verifying');
    setErrorMessage('');

    try {
      // ✅ GET request with query parameter
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/verify-email?token=${verificationToken}`,
        {
          method: 'GET',  // ← Backend GET kullanıyor
          credentials: 'include',
        }
      );

      let data;
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      console.log('✅ Verify Email Response:', {
        status: response.status,
        ok: response.ok,
        data: data
      });

      // Hata kontrolü
      if (!response.ok) {
        if (response.status === 400) {
          if (data.message?.toLowerCase().includes('token') && 
              data.message?.toLowerCase().includes('required')) {
            setStatus('error');
            setErrorMessage('Doğrulama token\'ı bulunamadı');
          } else if (data.message?.toLowerCase().includes('expired') ||
                     data.message?.toLowerCase().includes('invalid')) {
            setStatus('expired');
            setErrorMessage('Doğrulama linkinizin süresi dolmuş veya geçersiz');
          } else {
            setStatus('error');
            setErrorMessage(data.message || 'Doğrulama başarısız');
          }
        } else if (response.status === 404) {
          setStatus('error');
          setErrorMessage('Geçersiz doğrulama token\'ı');
        } else {
          setStatus('error');
          setErrorMessage(data.message || `Doğrulama başarısız (${response.status})`);
        }
        showToast(data.message || 'Doğrulama başarısız', 'error');
        return;
      }

      // ✅ SUCCESS (200)
      console.log('✅ Email successfully verified!');
      
      setStatus('success');
      localStorage.removeItem('pendingVerificationEmail');
      showToast('Email adresiniz başarıyla doğrulandı!', 'success');

      // 3 saniye sonra login'e yönlendir
      setTimeout(() => {
        console.log('🚀 Redirecting to /login');
        navigate('/login');
      }, 3000);

    } catch (err) {
      console.error('❌ Verification Error:', err);
      setStatus('error');
      const errorMsg = err instanceof Error ? err.message : 'Doğrulama sırasında bir hata oluştu';
      setErrorMessage(errorMsg);
      showToast(errorMsg, 'error');
    }
  };

  // Email tekrar gönder
  const handleResendEmail = async () => {
    if (!canResend || !email) return;

    setIsResending(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      console.log('🔄 Resend Response:', {
        status: response.status,
        data: data
      });

      if (!response.ok) {
        throw new Error(data.message || 'Email gönderilemedi');
      }

      showToast('Doğrulama emaili tekrar gönderildi. Lütfen gelen kutunuzu kontrol edin.', 'success');
      setCanResend(false);
      setResendTimer(60);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Email gönderilemedi';
      setErrorMessage(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setIsResending(false);
    }
  };

  // Pending - Email gönderildi, onay bekleniyor
  const renderPendingState = () => (
    <>
      <div className="status-icon pending-icon">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="22,6 12,13 2,6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <div className="pending-pulse"></div>
      </div>

      <h1 className="verification-title">
        <span className="title-line">Email</span>
        <span className="title-line title-line-accent">Doğrulama</span>
      </h1>

      <div className="verification-content">
        <p className="status-message">
          <strong>{email}</strong> adresine doğrulama linki gönderdik.
        </p>

        <div className="instruction-box">
          <h3 className="instruction-title">📬 Sonraki Adımlar:</h3>
          <ol className="instruction-list">
            <li>Email gelen kutunuzu kontrol edin</li>
            <li>ComplyMind'dan gelen emaili açın</li>
            <li>Emaildeki doğrulama linkine tıklayın</li>
          </ol>
        </div>

        <div className="help-box">
          <p className="help-title">💡 Email gelmediyse:</p>
          <ul className="help-list">
            <li>Spam klasörünüzü kontrol edin</li>
            <li>Email adresinizin doğru olduğundan emin olun</li>
            <li>Birkaç dakika bekleyin (bazen gecikmeler olabilir)</li>
          </ul>
        </div>

        <button
          onClick={handleResendEmail}
          disabled={!canResend || isResending}
          className="resend-button"
        >
          {isResending ? (
            <>
              <span className="spinner"></span>
              Gönderiliyor...
            </>
          ) : canResend ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="23 4 23 10 17 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Emaili Tekrar Gönder
            </>
          ) : (
            `Tekrar gönder (${resendTimer}s)`
          )}
        </button>

        {errorMessage && (
          <div className="error-box">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L1 15h14L8 1z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M8 6v4M8 11.5v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {errorMessage}
          </div>
        )}
      </div>
    </>
  );

  // Verifying - Link tıklandı, doğrulama yapılıyor
  const renderVerifyingState = () => (
    <>
      <div className="status-icon verifying-icon">
        <div className="spinner-large"></div>
      </div>

      <h1 className="verification-title">
        <span className="title-line">Email</span>
        <span className="title-line title-line-accent">Doğrulanıyor</span>
      </h1>

      <div className="verification-content">
        <p className="status-message">
          Email adresiniz doğrulanıyor, lütfen bekleyin...
        </p>
      </div>
    </>
  );

  // Success - Email doğrulandı
  const renderSuccessState = () => (
    <>
      <div className="status-icon success-icon">
        <svg className="checkmark" viewBox="0 0 52 52">
          <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
          <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
        </svg>
      </div>

      <h1 className="verification-title">
        <span className="title-line">Email</span>
        <span className="title-line title-line-accent">Doğrulandı!</span>
      </h1>

      <div className="verification-content">
        <p className="status-message success-message">
          ✓ Email adresiniz başarıyla doğrulandı!
        </p>

        <p className="redirect-notice">
          Giriş sayfasına yönlendiriliyorsunuz...
        </p>

        <button
          onClick={() => navigate('/login')}
          className="login-button"
        >
          Giriş Yap
          <span className="button-arrow">→</span>
        </button>
      </div>
    </>
  );

  // Error - Doğrulama hatası
  const renderErrorState = () => (
    <>
      <div className="status-icon error-icon">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="2"/>
          <line x1="15" y1="9" x2="9" y2="15" strokeWidth="2" strokeLinecap="round"/>
          <line x1="9" y1="9" x2="15" y2="15" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>

      <h1 className="verification-title">
        <span className="title-line">Doğrulama</span>
        <span className="title-line title-line-error">Başarısız</span>
      </h1>

      <div className="verification-content">
        <p className="status-message error-message">
          {errorMessage || 'Email doğrulama sırasında bir hata oluştu'}
        </p>

        <div className="error-actions">
          <button
            onClick={handleResendEmail}
            disabled={!canResend || isResending}
            className="resend-button primary"
          >
            {isResending ? 'Gönderiliyor...' : 'Yeni Link Gönder'}
          </button>

          <button
            onClick={() => navigate('/signup')}
            className="secondary-button"
          >
            Kayıt Sayfasına Dön
          </button>
        </div>
      </div>
    </>
  );

  // Expired - Link süresi dolmuş
  const renderExpiredState = () => (
    <>
      <div className="status-icon expired-icon">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="2"/>
          <polyline points="12 6 12 12 16 14" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>

      <h1 className="verification-title">
        <span className="title-line">Link Süresi</span>
        <span className="title-line title-line-warning">Dolmuş</span>
      </h1>

      <div className="verification-content">
        <p className="status-message warning-message">
          {errorMessage || 'Doğrulama linkinizin süresi dolmuş'}
        </p>

        <div className="info-box warning">
          <p>Güvenlik nedeniyle doğrulama linkleri 24 saat sonra geçersiz olur.</p>
        </div>

        <button
          onClick={handleResendEmail}
          disabled={!canResend || isResending}
          className="resend-button primary large"
        >
          {isResending ? (
            <>
              <span className="spinner"></span>
              Gönderiliyor...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="23 4 23 10 17 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Yeni Doğrulama Linki Gönder
            </>
          )}
        </button>
      </div>
    </>
  );

  return (
    <div className="email-verification-container">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
        />
      ))}

      <div className="verification-background">
        <div className="grid-overlay"></div>
      </div>

      <div className={`verification-card ${status}-state`}>
        {status === 'pending' && renderPendingState()}
        {status === 'verifying' && renderVerifyingState()}
        {status === 'success' && renderSuccessState()}
        {status === 'error' && renderErrorState()}
        {status === 'expired' && renderExpiredState()}
      </div>

      <div className="verification-footer">
        <p>© 2026 ComplyMind. Tüm hakları saklıdır.</p>
      </div>
    </div>
  );
}