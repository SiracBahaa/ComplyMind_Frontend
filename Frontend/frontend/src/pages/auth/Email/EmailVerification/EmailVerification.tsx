import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '../../../../hooks/useToast';
import Toast from '../../../../components/Toast';
import './EmailVerification.css';

export default function EmailVerification() {
  const [searchParams] = useSearchParams();
  const { toasts, showToast, hideToast } = useToast();
  
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [resendTimer, setResendTimer] = useState(0);

  const emailFromUrl = searchParams.get('email');

  useEffect(() => {
    // Email'i URL'den veya localStorage'dan al
    const storedEmail = localStorage.getItem('pendingVerificationEmail');
    setEmail(emailFromUrl || storedEmail || '');
  }, [emailFromUrl]);

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

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

      <div className="verification-card">
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
      </div>

      <div className="verification-footer">
        <p>© 2026 ComplyMind. Tüm hakları saklıdır.</p>
      </div>
    </div>
  );
}