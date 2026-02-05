import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateEmail } from '../../../utils/validators';
import { useToast } from '../../../hooks/useToast';
import Toast from '../../../components/Toast';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { toasts, showToast, hideToast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  setIsLoading(true);

  // Validation
  if (!formData.email || !formData.password) {
    setError('Tüm alanlar zorunludur');
    setIsLoading(false);
    return;
  }

  if (!validateEmail(formData.email)) {
    setError('Geçerli bir e-posta adresi giriniz');
    setIsLoading(false);
    return;
  }

  // Simulate API call
  setTimeout(() => {
    console.log('Login submitted:', formData);
    
    // Mock başarılı giriş
    localStorage.setItem('mockUser', JSON.stringify({
      email: formData.email,
      name: 'Test Kullanıcı'
    }));
    
    setIsLoading(false);
    
    // Toast göster
    showToast('Giriş başarılı! Hoş geldiniz.', 'success');
    
    // 2 saniye sonra yönlendir (toast görsün diye)
    setTimeout(() => {
      // navigate('/dashboard');
    }, 2000);
  }, 1500);
};

  const handleGitHubLogin = () => {
    console.log('GitHub ile giriş başlatıldı');
    showToast('GitHub OAuth entegrasyonu için backend gereklidir', 'info');
    
    // Mock GitHub login
    setTimeout(() => {
      localStorage.setItem('mockUser', JSON.stringify({
        email: 'github@user.com',
        name: 'GitHub User',
        provider: 'github'
      }));
      showToast('GitHub ile giriş başarılı!', 'success');
    }, 1000);
  };

return (
  <div className="login-container">
    {/* Toast Container */}
    {toasts.map(toast => (
      <Toast
        key={toast.id}
        message={toast.message}
        type={toast.type}
        onClose={() => hideToast(toast.id)}
      />
    ))}
    
    <div className="login-background">
        <div className="grid-overlay"></div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">
            <span className="title-line">Hoş</span>
            <span className="title-line title-line-accent">Geldiniz</span>
          </h1>
          <p className="login-subtitle">Hesabınıza giriş yapın</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
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
              autoComplete="current-password"
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
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </span>
            <span className="button-arrow">→</span>
          </button>

          <div className="divider-container">
            <div className="divider-line"></div>
            <span className="divider-text">veya</span>
            <div className="divider-line"></div>
          </div>

          <button 
            type="button"
            onClick={handleGitHubLogin}
            className="github-button"
          >
            <svg className="github-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub ile Giriş Yap
          </button>

          <div className="form-footer">
            <a href="/forgot-password" className="forgot-link">
              Şifremi unuttum
            </a>
            <span className="divider-dot">•</span>
            <a href="/signup" className="signup-link">
              Hesap oluştur
            </a>
          </div>
        </form>
      </div>

      <div className="login-footer">
        <p>© 2026 ComplyMind. Tüm hakları saklıdır.</p>
      </div>
    </div>
  );
}
