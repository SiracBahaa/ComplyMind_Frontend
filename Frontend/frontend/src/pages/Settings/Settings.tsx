import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { validatePassword, passwordsMatch } from '../../utils/validators';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/Toast';
import './Settings.css';

interface UserProfile {
  id: string;
  username: string;
  email: string | null;
  display_name: string | null;
  email_verified: boolean;
  status: string;
  created_at: string;
  last_login_at: string | null;
  has_password: boolean;
  oauth_providers: string[];
}

export default function Settings() {
  const navigate = useNavigate();
  const { toasts, showToast, hideToast } = useToast();
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Profile Update
  const [displayName, setDisplayName] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  // Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Account Delete
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Profil yüklenemedi');
      }

      const data = await response.json();
      setUser(data);
      setDisplayName(data.display_name || '');
      
      console.log('✅ User Profile:', data);
      
    } catch (err) {
      console.error('Profile fetch error:', err);
      showToast('Profil yüklenemedi', 'error');
      setTimeout(() => navigate('/login'), 2000);
    } finally {
      setIsLoading(false);
    }
  };

  // Update Profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      showToast('Görünen ad boş olamaz', 'error');
      return;
    }

    setIsUpdatingProfile(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          display_name: displayName.trim()
        }),
      });

      if (!response.ok) {
        throw new Error('Profil güncellenemedi');
      }

      const data = await response.json();
      setUser(data);
      showToast('Profil başarıyla güncellendi!', 'success');
      
    } catch (err) {
      console.error('Profile update error:', err);
      showToast('Profil güncellenemedi', 'error');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      showToast('Tüm alanları doldurun', 'error');
      return;
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      showToast(passwordValidation.errors[0], 'error');
      return;
    }

    if (!passwordsMatch(newPassword, confirmNewPassword)) {
      showToast('Yeni şifreler eşleşmiyor', 'error');
      return;
    }

    setIsChangingPassword(true);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/me/password`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Şifre değiştirilemedi');
      }

      showToast('Şifre başarıyla değiştirildi! Yeniden giriş yapın.', 'success');
      
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      
      setTimeout(() => {
        localStorage.removeItem('access_token');
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      console.error('Password change error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Şifre değiştirilemedi';
      showToast(errorMsg, 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

// Delete Account
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      showToast('Lütfen "DELETE" yazarak onaylayın', 'error');
      return;
    }

    if (!deletePassword) {
      if (user?.has_password) {
        showToast('Şifrenizi girin', 'error');
      } else {
        showToast('Kullanıcı adınızı girin', 'error');
      }
      return;
    }

    // Username kontrolü (OAuth kullanıcıları için) - FRONTEND VALIDATION
    if (!user?.has_password && deletePassword.toLowerCase() !== user?.username.toLowerCase()) {
      showToast('Kullanıcı adı hatalı', 'error');
      return;
    }

    setIsDeleting(true);

    try {
      const token = localStorage.getItem('access_token');
      
      // Backend'e gönderilecek body
      const requestBody = user?.has_password 
        ? { password: deletePassword }           // ← Şifre varsa
        : { confirmation: deletePassword };      // ← OAuth ise username (confirmation olarak)

      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/me/delete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Hesap silinemedi');
      }

      showToast('Hesabınız kalıcı olarak silindi', 'success');
      
      setTimeout(() => {
        localStorage.removeItem('access_token');
        navigate('/signup');
      }, 2000);
      
    } catch (err) {
      console.error('Account delete error:', err);
      const errorMsg = err instanceof Error ? err.message : 'Hesap silinemedi';
      showToast(errorMsg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="settings-loading">
        <div className="spinner-large"></div>
        <p className="loading-text">Yükleniyor...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getProviderName = (provider: string) => {
    const names: Record<string, string> = {
      'github': 'GitHub',
      'google': 'Google',
      'facebook': 'Facebook',
    };
    return names[provider] || provider;
  };

  const getProviderIcon = (provider: string) => {
    if (provider === 'github') {
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="settings-container">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
        />
      ))}

      <header className="settings-header">
        <button onClick={() => navigate('/dashboard')} className="back-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="19" y1="12" x2="5" y2="12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="12 19 5 12 12 5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Dashboard'a Dön
        </button>
        <h1 className="settings-title">
          <span className="title-line">Hesap</span>
          <span className="title-line title-line-accent">Ayarları</span>
        </h1>
      </header>

      <div className="settings-content">
        {/* Account Info */}
        <section className="settings-section">
          <div className="section-header">
            <h2 className="section-title">Hesap Bilgileri</h2>
            <p className="section-description">Temel hesap bilgileriniz</p>
          </div>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Kullanıcı Adı</span>
              <span className="info-value">{user.username}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Email</span>
              <div className="info-value-with-badge">
                <span className="info-value">{user.email}</span>
                {user.email_verified && (
                  <span className="verified-badge-small">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Doğrulanmış
                  </span>
                )}
              </div>
            </div>
            <div className="info-item">
              <span className="info-label">Hesap Durumu</span>
              <span className={`status-badge ${user.status}`}>
                {user.status === 'active' ? 'Aktif' : user.status}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Kayıt Tarihi</span>
              <span className="info-value">
                {new Date(user.created_at).toLocaleDateString('tr-TR')}
              </span>
            </div>
          </div>
        </section>

        {/* Update Profile */}
        <section className="settings-section">
          <div className="section-header">
            <h2 className="section-title">Profil Bilgileri</h2>
            <p className="section-description">Görünen adınızı güncelleyin</p>
          </div>
          <form onSubmit={handleUpdateProfile} className="settings-form">
            <div className="form-group">
              <label htmlFor="displayName" className="form-label">
                Görünen Ad
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="form-input"
                placeholder="Görünen adınızı girin"
                disabled={isUpdatingProfile}
              />
              <span className="form-hint">
                Bu isim diğer kullanıcılara görünecektir
              </span>
            </div>
            <button
              type="submit"
              className="submit-button"
              disabled={isUpdatingProfile}
            >
              {isUpdatingProfile ? (
                <>
                  <span className="spinner-small"></span>
                  Güncelleniyor...
                </>
              ) : (
                'Profili Güncelle'
              )}
            </button>
          </form>
        </section>

        {/* OAuth Connections */}
        {user.oauth_providers.length > 0 && (
          <section className="settings-section">
            <div className="section-header">
              <h2 className="section-title">Bağlı Hesaplar</h2>
              <p className="section-description">
                OAuth ile bağlı hesaplarınız
              </p>
            </div>
            <div className="oauth-connections">
              {user.oauth_providers.map((provider, index) => (
                <div key={index} className="oauth-item">
                  <div className="oauth-icon github">
                    {getProviderIcon(provider)}
                  </div>
                  <div className="oauth-info">
                    <span className="oauth-provider">
                      {getProviderName(provider)}
                    </span>
                    <span className="oauth-date">
                      Bağlı hesap
                    </span>
                  </div>
                  {!user.has_password && (
                    <span className="oauth-badge primary">
                      Ana Giriş Yöntemi
                    </span>
                  )}
                </div>
              ))}
            </div>
            {!user.has_password && (
              <div className="info-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <line x1="12" y1="16" x2="12" y2="12" strokeWidth="2"/>
                  <line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="2"/>
                </svg>
                {getProviderName(user.oauth_providers[0])} ile giriş yaptığınız için şifre belirlemeniz gerekmiyor. {getProviderName(user.oauth_providers[0])} hesabınız ana giriş yönteminizdir.
              </div>
            )}
          </section>
        )}

        {/* Change Password - Only if has_password is true */}
        {user.has_password && (
          <section className="settings-section">
            <div className="section-header">
              <h2 className="section-title">Şifre Değiştir</h2>
              <p className="section-description">
                Güvenliğiniz için güçlü bir şifre kullanın
              </p>
            </div>
            <form onSubmit={handleChangePassword} className="settings-form">
              <div className="form-group">
                <label htmlFor="currentPassword" className="form-label">
                  Mevcut Şifre
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="form-input"
                  placeholder="••••••••"
                  disabled={isChangingPassword}
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword" className="form-label">
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-input"
                  placeholder="••••••••"
                  disabled={isChangingPassword}
                />
                <span className="form-hint">
                  Min 8 karakter, 1 büyük harf, 1 rakam, 1 özel karakter
                </span>
              </div>
              <div className="form-group">
                <label htmlFor="confirmNewPassword" className="form-label">
                  Yeni Şifre Tekrar
                </label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="form-input"
                  placeholder="••••••••"
                  disabled={isChangingPassword}
                />
              </div>
              <button
                type="submit"
                className="submit-button"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <>
                    <span className="spinner-small"></span>
                    Değiştiriliyor...
                  </>
                ) : (
                  'Şifreyi Değiştir'
                )}
              </button>
              <div className="warning-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"/>
                  <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2"/>
                </svg>
                Şifrenizi değiştirdiğinizde tüm oturumlar sonlandırılacak ve yeniden giriş yapmanız gerekecek.
              </div>
            </form>
          </section>
        )}

        {/* Delete Account */}
        <section className="settings-section danger-zone">
          <div className="section-header">
            <h2 className="section-title">Tehlikeli Bölge</h2>
            <p className="section-description">
              Hesabınızı kalıcı olarak silin
            </p>
          </div>
          <div className="danger-content">
            <div className="danger-info">
              <h3 className="danger-title">Hesabı Sil</h3>
              <p className="danger-text">
                Hesabınızı sildiğinizde tüm verileriniz kalıcı olarak silinecektir. Bu işlem geri alınamaz.
              </p>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="danger-button"
            >
              Hesabı Sil
            </button>
          </div>
        </section>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Hesabı Kalıcı Olarak Sil</h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="modal-close"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="warning-box error">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"/>
                  <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2"/>
                </svg>
                <div>
                  <strong>Bu işlem geri alınamaz!</strong>
                  <p>Hesabınız ve tüm verileriniz kalıcı olarak silinecektir.</p>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="deleteConfirmation" className="form-label">
                  Onaylamak için "DELETE" yazın
                </label>
                <input
                  type="text"
                  id="deleteConfirmation"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  className="form-input"
                  placeholder="DELETE"
                  disabled={isDeleting}
                />
              </div>
              
              {/* Şifre varsa şifre, yoksa username */}
              {user.has_password ? (
                <div className="form-group">
                  <label htmlFor="deletePassword" className="form-label">
                    Şifreniz
                  </label>
                  <input
                    type="password"
                    id="deletePassword"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="form-input"
                    placeholder="••••••••"
                    disabled={isDeleting}
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label htmlFor="deleteUsername" className="form-label">
                    Kullanıcı Adınız
                  </label>
                  <input
                    type="text"
                    id="deleteUsername"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    className="form-input"
                    placeholder={user.username}
                    disabled={isDeleting}
                  />
                  <span className="form-hint">
                    Güvenlik için kullanıcı adınızı girin: <strong>{user.username}</strong>
                  </span>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="modal-button secondary"
                disabled={isDeleting}
              >
                İptal
              </button>
              <button
                onClick={handleDeleteAccount}
                className="modal-button danger"
                disabled={isDeleting}
              >
                {isDeleting ? 'Siliniyor...' : 'Hesabı Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}