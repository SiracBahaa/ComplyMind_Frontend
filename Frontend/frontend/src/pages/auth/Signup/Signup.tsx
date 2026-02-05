import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateEmail, getPasswordStrength } from '../../../utils/validators';
import { useToast } from '../../../hooks/useToast';
import Toast from '../../../components/Toast';
import './Signup.css';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const { toasts, showToast, hideToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Tüm alanlar zorunludur');
      return false;
    }

    if (!validateEmail(formData.email)) {
      setError('Geçerli bir e-posta adresi giriniz');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return false;
    }

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

    // Simulate API call
    setTimeout(() => {
    console.log('Signup submitted:', {
      name: formData.name,
      email: formData.email,
      password: formData.password
    });

    localStorage.setItem('mockUser', JSON.stringify({
      email: formData.email,
      name: formData.name
    }));

    setIsLoading(false);
    showToast('Hesabınız başarıyla oluşturuldu!', 'success');
    
    setTimeout(() => {
      navigate('/login');
      }, 2000);
    }, 1500);
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
          <div className="form-group">
            <label 
              htmlFor="name" 
              className={`form-label ${focusedField === 'name' ? 'focused' : ''}`}
            >
              Ad Soyad
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              className="form-input"
              placeholder="Ahmet Yılmaz"
              disabled={isLoading}
              autoComplete="name"
            />
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
              value={formData.email}
              onChange={handleChange}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              className="form-input"
              placeholder="ornek@email.com"
              disabled={isLoading}
              autoComplete="email"
            />
          </div>

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
