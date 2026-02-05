import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateEmail } from '../../../utils/validators';
import { useToast } from '../../../hooks/useToast';
import Toast from '../../../components/Toast';
import './ForgotPassword.css';

type Step = 'email' | 'code' | 'password' | 'success';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { toasts, showToast, hideToast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Mock code for testing
  const [mockCode] = useState('123456');

  // Step 1: Request reset code
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

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log('Reset code request sent to:', email);
      showToast(`Kod ${email} adresine gönderildi (Test: ${mockCode})`, 'success');
      
      setCurrentStep('code');
      setIsLoading(false);
    }, 1000);
  };

  // Step 2: Verify reset code
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!resetCode) {
      setError('Doğrulama kodu gereklidir');
      return;
    }

    if (resetCode.length !== 6) {
      setError('Doğrulama kodu 6 haneli olmalıdır');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (resetCode === mockCode) {
        console.log('Code verified successfully');
        showToast('Kod doğrulandı!', 'success');
        setCurrentStep('password');
      } else {
        showToast('Geçersiz kod. Test kodu: ' + mockCode, 'error');
        setError('Geçersiz kod. Test kodu: ' + mockCode);
      }
      setIsLoading(false);
    }, 800);
  };

  // Step 3: Set new password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Tüm alanlar zorunludur');
      return;
    }

    if (newPassword.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log('Password reset successfully for:', email);
      showToast('Şifreniz başarıyla sıfırlandı!', 'success');
      setCurrentStep('success');
      setIsLoading(false);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }, 1000);
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: 'email', label: '1', title: 'E-posta' },
      { key: 'code', label: '2', title: 'Kod' },
      { key: 'password', label: '3', title: 'Şifre' },
    ];

    const stepIndex = steps.findIndex(s => s.key === currentStep);

    return (
      <div className="step-indicator">
        {steps.map((step, index) => (
          <div key={step.key} className="step-item-wrapper">
            <div 
              className={`step-item ${
                index <= stepIndex ? 'active' : ''
              } ${index < stepIndex ? 'completed' : ''}`}
            >
              <span className="step-number">{step.label}</span>
              <span className="step-title">{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <div className={`step-line ${index < stepIndex ? 'completed' : ''}`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderEmailStep = () => (
    <form onSubmit={handleEmailSubmit} className="forgot-form">
      <div className="form-header">
        <h2 className="form-title">E-posta Adresiniz</h2>
        <p className="form-description">
          Şifre sıfırlama kodu göndereceğimiz e-posta adresinizi girin
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
          disabled={isLoading}
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
        className={`submit-button ${isLoading ? 'loading' : ''}`}
        disabled={isLoading}
      >
        <span className="button-text">
          {isLoading ? 'Gönderiliyor...' : 'Kod Gönder'}
        </span>
        <span className="button-arrow">→</span>
      </button>
    </form>
  );

  const renderCodeStep = () => (
    <form onSubmit={handleCodeSubmit} className="forgot-form">
      <div className="form-header">
        <h2 className="form-title">Doğrulama Kodu</h2>
        <p className="form-description">
          <strong>{email}</strong> adresine gönderilen 6 haneli kodu girin
        </p>
      </div>

      <div className="form-group">
        <label 
          htmlFor="code" 
          className={`form-label ${focusedField === 'code' ? 'focused' : ''}`}
        >
          Doğrulama Kodu
        </label>
        <input
          type="text"
          id="code"
          name="code"
          value={resetCode}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
            setResetCode(value);
            setError('');
          }}
          onFocus={() => setFocusedField('code')}
          onBlur={() => setFocusedField(null)}
          className="form-input code-input"
          placeholder="000000"
          disabled={isLoading}
          maxLength={6}
          autoFocus
        />
        <div className="code-hint">
          Test kodu: <strong>{mockCode}</strong> | 
          <button 
            type="button" 
            className="resend-button"
            onClick={handleEmailSubmit}
            disabled={isLoading}
          >
            Yeniden gönder
          </button>
        </div>
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
        className={`submit-button ${isLoading ? 'loading' : ''}`}
        disabled={isLoading}
      >
        <span className="button-text">
          {isLoading ? 'Doğrulanıyor...' : 'Kodu Doğrula'}
        </span>
        <span className="button-arrow">→</span>
      </button>
    </form>
  );

  const renderPasswordStep = () => (
    <form onSubmit={handlePasswordSubmit} className="forgot-form">
      <div className="form-header">
        <h2 className="form-title">Yeni Şifre</h2>
        <p className="form-description">
          Hesabınız için yeni bir şifre oluşturun
        </p>
      </div>

      <div className="form-group">
        <label 
          htmlFor="newPassword" 
          className={`form-label ${focusedField === 'newPassword' ? 'focused' : ''}`}
        >
          Yeni Şifre
        </label>
        <input
          type="password"
          id="newPassword"
          name="newPassword"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            setError('');
          }}
          onFocus={() => setFocusedField('newPassword')}
          onBlur={() => setFocusedField(null)}
          className="form-input"
          placeholder="••••••••"
          disabled={isLoading}
          autoComplete="new-password"
          autoFocus
        />
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
          disabled={isLoading}
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
        className={`submit-button ${isLoading ? 'loading' : ''}`}
        disabled={isLoading}
      >
        <span className="button-text">
          {isLoading ? 'Kaydediliyor...' : 'Şifreyi Sıfırla'}
        </span>
        <span className="button-arrow">→</span>
      </button>
    </form>
  );

  const renderSuccessStep = () => (
    <div className="success-container">
      <div className="success-icon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2"/>
          <path d="M20 32l8 8 16-16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h2 className="success-title">Şifreniz Sıfırlandı!</h2>
      <p className="success-description">
        Şifreniz başarıyla değiştirildi. Yeni şifrenizle giriş yapabilirsiniz.
      </p>
      <div className="redirect-notice">
        Giriş sayfasına yönlendiriliyorsunuz...
      </div>
    </div>
  );

  return (
    <div className="forgot-password-container">
      {/* Toast Container */}
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
          {currentStep !== 'success' && renderStepIndicator()}
        </div>

        {currentStep === 'email' && renderEmailStep()}
        {currentStep === 'code' && renderCodeStep()}
        {currentStep === 'password' && renderPasswordStep()}
        {currentStep === 'success' && renderSuccessStep()}

        {currentStep !== 'success' && (
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