import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateEmail, validateUsername, validatePassword, getPasswordStrength } from '../../../utils/validators';
import { useToast } from '../../../hooks/useToast';
import Toast from '../../../components/Toast';
import './Signup.css';

export default function Signup() {
  const navigate = useNavigate();
  const { toasts, showToast, hideToast } = useToast();
  const [formData, setFormData] = useState({
    username: '',  // ← DEĞİŞTİ: name → username
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = (): boolean => {
    // Boş alan kontrolü
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Tüm alanlar zorunludur');
      return false;
    }

    // Username validasyonu (backend kuralları)
    const usernameValidation = validateUsername(formData.username);
    if (!usernameValidation.isValid) {
      setError(usernameValidation.error || 'Geçersiz kullanıcı adı');
      return false;
    }

    // Email validasyonu
    if (!validateEmail(formData.email)) {
      setError('Geçerli bir e-posta adresi giriniz');
      return false;
    }

    // Password validasyonu (backend kuralları: min 8, büyük harf, rakam, özel karakter)
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors[0]); // İlk hatayı göster
      return false;
    }

    // Şifre eşleşme kontrolü
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Backend'e gönder
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Cookie için
        body: JSON.stringify({
          username: formData.username,
          email: formData.email.toLowerCase().trim(),
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Kayıt başarısız');
      }


      // Başarılı kayıt
      setIsLoading(false);

      // Email'i localStorage'a kaydet
      localStorage.setItem('pendingVerificationEmail', formData.email);

      showToast('Hesabınız oluşturuldu! Lütfen email adresinizi doğrulayın.', 'success');

      // Email verification sayfasına yönlendir
      setTimeout(() => {
        navigate(`/email-verification?email=${encodeURIComponent(formData.email)}`);
      }, 2000);

    } catch (err) {
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="signup-container">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
        />
      ))}

      <div className="signup-background">
        <div className="grid-overlay"></div>
      </div>

      <div className="signup-card">
        <div className="signup-header">
          <h1 className="signup-title">
            <span className="title-line">Hesabınızı</span>
            <span className="title-line title-line-accent">Oluşturun</span>
          </h1>
          <p className="signup-subtitle">Aramıza katılın ve yolculuğunuza başlayın</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          {/* USERNAME ALANI (AD SOYAD YERİNE) */}
          <div className="form-group">
            <label 
              htmlFor="username" 
              className={`form-label ${focusedField === 'username' ? 'focused' : ''}`}
            >
              Kullanıcı Adı
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField(null)}
              className="form-input"
              placeholder="Kullanıcı adınızı giriniz"
              disabled={isLoading}
              autoComplete="username"
            />
            <div className="input-hint">
              3-30 karakter, sadece harf, rakam, - ve _
            </div>
          </div>

          {/* EMAIL ALANI */}
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
              value={formData.email}
              onChange={handleChange}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              className="form-input"
              placeholder="example@email.com"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

          {/* PASSWORD ALANI */}
          <div className="form-group">
            <label 
              htmlFor="password" 
              className={`form-label ${focusedField === 'password' ? 'focused' : ''}`}
            >
              Şifre
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              className="form-input"
              placeholder="••••••••"
              disabled={isLoading}
              autoComplete="new-password"
            />
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div 
                    className={`strength-fill strength-${passwordStrength.strength}`}
                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                  ></div>
                </div>
                <span className="strength-label">{passwordStrength.label}</span>
              </div>
            )}
            <div className="input-hint">
              Min 8 karakter, 1 büyük harf, 1 rakam, 1 özel karakter
            </div>
          </div>

          {/* CONFIRM PASSWORD ALANI */}
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
              value={formData.confirmPassword}
              onChange={handleChange}
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
              {isLoading ? 'Hesap oluşturuluyor...' : 'Hesap Oluştur'}
            </span>
            <span className="button-arrow">→</span>
          </button>

          <div className="form-footer">
            <span className="footer-text">Zaten hesabınız var mı?</span>
            <a href="/login" className="login-link">
              Giriş Yap
            </a>
          </div>
        </form>
      </div>

      <div className="signup-footer">
        <p>© 2026 ComplyMind. Tüm hakları saklıdır.</p>
      </div>
    </div>
  );
}