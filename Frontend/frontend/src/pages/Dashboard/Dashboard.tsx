import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/Toast';
import './Dashboard.css';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  display_name: string | null;
  email_verified: boolean;
  status: string;
  created_at: string;
  last_login_at: string | null;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { toasts, showToast, hideToast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        if (response.status === 401) {
          // Token geçersiz, login'e yönlendir
          localStorage.removeItem('access_token');
          navigate('/login');
          return;
        }
        throw new Error('Profil bilgileri alınamadı');
      }

      const data = await response.json();
      setUser(data);
      
    } catch (err) {
      console.error('Profile fetch error:', err);
      showToast('Profil bilgileri yüklenemedi', 'error');
      
      // Token sorunu varsa login'e yönlendir
      setTimeout(() => {
        localStorage.removeItem('access_token');
        navigate('/login');
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Backend'e logout isteği gönder
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Token'ı temizle ve login'e yönlendir
      localStorage.removeItem('access_token');
      navigate('/login');
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner-large"></div>
        <p className="loading-text">Yükleniyor...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-container">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
        />
      ))}

      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-text">ComplyMind</span>
          </div>
        </div>
        <div className="header-right">
          <div className="user-info">
            <div className="user-avatar">
              {user.display_name?.charAt(0).toUpperCase() || 
               user.username?.charAt(0).toUpperCase() || 
               'U'}
            </div>
            <div className="user-details">
              <span className="user-name">
                {user.display_name || user.username}
              </span>
              <span className="user-email">{user.email}</span>
            </div>
            {user.email_verified && (
              <div className="verified-badge" title="Email doğrulanmış">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="22 4 12 14.01 9 11.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className="logout-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="16 17 21 12 16 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="21" y1="12" x2="9" y2="12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Çıkış Yap
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="dashboard-content">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            <a href="#" className="nav-item active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="7" height="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="14" y="3" width="7" height="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="14" y="14" width="7" height="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="3" y="14" width="7" height="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Dashboard
            </a>
            <a href="#" className="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="14 2 14 8 20 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="16" y1="13" x2="8" y2="13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="16" y1="17" x2="8" y2="17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="10 9 9 9 8 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Uyumluluk
            </a>
            <a href="#" className="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Risk Yönetimi
            </a>
            <a href="#" className="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 11l3 3L22 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Görevler
            </a>
            <a href="#" className="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="12 6 12 12 16 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Denetimler
            </a>
            <a href="/settings" className="nav-item">  {/* href="#" yerine */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Ayarlar
            </a>
          </nav>
        </aside>

        {/* Main Area */}
        <main className="dashboard-main">
          {/* Welcome Section */}
          <section className="welcome-section">
            <h1 className="page-title">
              Hoş geldin, <span className="accent">{user.display_name || user.username}</span>
            </h1>
            <p className="page-subtitle">
              İşte bugünün uyumluluk durumu özeti
            </p>
            {user.last_login_at && (
              <p className="last-login">
                Son giriş: {new Date(user.last_login_at).toLocaleString('tr-TR')}
              </p>
            )}
          </section>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon success">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Tamamlanan Görevler</span>
                <span className="stat-value">24</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon warning">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                  <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Bekleyen Riskler</span>
                <span className="stat-value">7</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon info">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="14 2 14 8 20 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Aktif Politikalar</span>
                <span className="stat-value">12</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon accent">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="22 4 12 14.01 9 11.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Uyumluluk Oranı</span>
                <span className="stat-value">89%</span>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="content-grid">
            {/* Recent Tasks */}
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">Son Görevler</h2>
                <a href="#" className="card-link">Tümünü Gör →</a>
              </div>
              <div className="task-list">
                <div className="task-item">
                  <div className="task-checkbox checked"></div>
                  <div className="task-info">
                    <span className="task-name">KVKK Veri Envanteri Güncelleme</span>
                    <span className="task-meta">2 saat önce tamamlandı</span>
                  </div>
                </div>
                <div className="task-item">
                  <div className="task-checkbox checked"></div>
                  <div className="task-info">
                    <span className="task-name">ISO 27001 Risk Değerlendirmesi</span>
                    <span className="task-meta">5 saat önce tamamlandı</span>
                  </div>
                </div>
                <div className="task-item">
                  <div className="task-checkbox"></div>
                  <div className="task-info">
                    <span className="task-name">Çalışan Güvenlik Eğitimi</span>
                    <span className="task-meta">Yarın teslim</span>
                  </div>
                </div>
                <div className="task-item">
                  <div className="task-checkbox"></div>
                  <div className="task-info">
                    <span className="task-name">Tedarikçi Değerlendirme Raporu</span>
                    <span className="task-meta">3 gün kaldı</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Overview */}
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">Risk Durumu</h2>
                <a href="#" className="card-link">Detaylar →</a>
              </div>
              <div className="risk-overview">
                <div className="risk-item high">
                  <div className="risk-bar">
                    <div className="risk-fill" style={{ width: '75%' }}></div>
                  </div>
                  <div className="risk-info">
                    <span className="risk-label">Yüksek Risk</span>
                    <span className="risk-count">3</span>
                  </div>
                </div>
                <div className="risk-item medium">
                  <div className="risk-bar">
                    <div className="risk-fill" style={{ width: '50%' }}></div>
                  </div>
                  <div className="risk-info">
                    <span className="risk-label">Orta Risk</span>
                    <span className="risk-count">7</span>
                  </div>
                </div>
                <div className="risk-item low">
                  <div className="risk-bar">
                    <div className="risk-fill" style={{ width: '25%' }}></div>
                  </div>
                  <div className="risk-info">
                    <span className="risk-label">Düşük Risk</span>
                    <span className="risk-count">12</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="activity-section">
            <div className="card-header">
              <h2 className="card-title">Son Aktiviteler</h2>
            </div>
            <div className="activity-feed">
              <div className="activity-item">
                <div className="activity-icon success">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="activity-content">
                  <span className="activity-text">
                    <strong>{user.display_name || user.username}</strong> "ISO 27001 İç Denetim" görevini tamamladı
                  </span>
                  <span className="activity-time">15 dakika önce</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon info">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="2"/>
                    <polyline points="14 2 14 8 20 8" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="activity-content">
                  <span className="activity-text">
                    Yeni politika eklendi: <strong>"Uzaktan Çalışma Politikası"</strong>
                  </span>
                  <span className="activity-time">1 saat önce</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon warning">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                    <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"/>
                    <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="activity-content">
                  <span className="activity-text">
                    <strong>Kritik</strong> bir risk tespit edildi: "Veri Yedekleme Hatası"
                  </span>
                  <span className="activity-time">3 saat önce</span>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon success">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth="2"/>
                    <polyline points="22 4 12 14.01 9 11.01" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="activity-content">
                  <span className="activity-text">
                    <strong>Zeynep Kaya</strong> KVKK eğitimini tamamladı
                  </span>
                  <span className="activity-time">5 saat önce</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}