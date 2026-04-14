import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/Toast';
import './Dashboard.css';

interface UserInfo {
  username: string;
  email: string;
  display_name?: string;
  email_verified: boolean;
  status: string;
  last_login_at: string | null;
}

interface Repository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  default_branch: string;
  updated_at: string;
}

interface GitHubStatus {
  connected: boolean;
  installation: any | null;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { toasts, showToast, hideToast } = useToast();

  const [user, setUser] = useState<UserInfo | null>(null);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [githubStatus, setGithubStatus] = useState<GitHubStatus>({
    connected: false,
    installation: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [isSyncingRepos, setIsSyncingRepos] = useState(false);

  const mapBackendRepos = (backendRepos: any[]): Repository[] => {
    return backendRepos.map((repo: any) => ({
      id: repo.repo_id ?? repo.id,
      name: repo.name || repo.repo_full_name?.split('/')[1] || 'Unknown',
      full_name: repo.full_name || repo.repo_full_name || 'Unknown/Unknown',
      private: repo.private ?? repo.is_private ?? false,
      html_url:
        repo.html_url ||
        `https://github.com/${repo.full_name || repo.repo_full_name}`,
      description: repo.description || null,
      default_branch: repo.default_branch || 'main',
      updated_at: repo.updated_at || new Date().toISOString(),
    }));
  };

  useEffect(() => {
    fetchUserProfile();
    fetchGitHubStatus();
    fetchRepos();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get('github_connected') === 'true') {
      showToast('GitHub başarıyla bağlandı!', 'success');
      fetchGitHubStatus();
      fetchRepos();
      window.history.replaceState({}, document.title, window.location.pathname);
    }
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
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
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

      setTimeout(() => {
        localStorage.removeItem('access_token');
        navigate('/login');
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGitHubStatus = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/github/status`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setGithubStatus(data);
        console.log('✅ GitHub Status:', data);
      }
    } catch (err) {
      console.error('GitHub status error:', err);
    }
  };

  const fetchRepos = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setIsLoadingRepos(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/github/repos`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          setRepos([]);
          return;
        }
        throw new Error('Repolar yüklenemedi');
      }

      const data: any = await response.json();
      setRepos(mapBackendRepos(data.repos || []));
    } catch (err) {
      console.error('Repos fetch error:', err);
      setRepos([]);
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const handleConnectGitHub = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/github/install`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('GitHub App URL alınamadı');
      }

      const data = await response.json();
      window.location.href = data.installation_url;
    } catch (err) {
      console.error('Connect GitHub error:', err);
      showToast('GitHub bağlantısı başarısız', 'error');
    }
  };

  const handleAddRepo = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/github/install`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('GitHub App URL alınamadı');
      }

      const data = await response.json();
      window.location.href = data.installation_url;
    } catch (err) {
      console.error('Add repo error:', err);
      showToast('Repo ekleme başarısız', 'error');
    }
  };

  const handleSyncRepos = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setIsSyncingRepos(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/github/repos/sync`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Senkronizasyon başarısız');
      }

      const data: any = await response.json();
      setRepos(mapBackendRepos(data.repos || []));
      await fetchGitHubStatus();
      showToast('Repolar başarıyla senkronize edildi!', 'success');
    } catch (err) {
      console.error('Sync repos error:', err);
      showToast('Repolar senkronize edilemedi', 'error');
    } finally {
      setIsSyncingRepos(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
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
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
        />
      ))}

      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-text">ComplyMind</span>
          </div>
        </div>

        <div className="header-right">
          <div className="user-info">
            <div className="user-avatar">
              {user?.display_name?.charAt(0).toUpperCase() ||
                user?.username?.charAt(0).toUpperCase() ||
                'U'}
            </div>

            <div className="user-details">
              <span className="user-name">
                {user?.display_name || user?.username}
              </span>
              <span className="user-email">{user?.email}</span>
            </div>

            {user.email_verified && (
              <div className="verified-badge" title="Email doğrulanmış">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="22 4 12 14.01 9 11.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>

          <button onClick={handleLogout} className="logout-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="16 17 21 12 16 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="21" y1="12" x2="9" y2="12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Çıkış Yap
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <aside className="dashboard-sidebar">
          <nav className="sidebar-nav">
            <a href="#" className="nav-item active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="7" height="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="14" y="3" width="7" height="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="14" y="14" width="7" height="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="3" y="14" width="7" height="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Dashboard
            </a>

            <a href="#" className="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="14 2 14 8 20 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="16" y1="13" x2="8" y2="13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="16" y1="17" x2="8" y2="17" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="10 9 9 9 8 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Uyumluluk
            </a>

            <a href="#" className="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Risk Yönetimi
            </a>

            <a href="#" className="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 11l3 3L22 4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Görevler
            </a>

            <a href="#" className="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="12 6 12 12 16 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Denetimler
            </a>

            <a href="/settings" className="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Ayarlar
            </a>
          </nav>
        </aside>

        <main className="dashboard-main">
          <section className="welcome-section">
            <h1 className="page-title">
              Hoş geldin, <span className="accent">{user?.display_name || user?.username}</span>
            </h1>
            <p className="page-subtitle">İşte bugünün uyumluluk durumu özeti</p>
            {user.last_login_at && (
              <p className="last-login">
                Son giriş: {new Date(user.last_login_at).toLocaleString('tr-TR')}
              </p>
            )}
          </section>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon success">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round" />
                  <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round" />
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
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="14 2 14 8 20 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Bağlı Repolar</span>
                <span className="stat-value">{repos.length}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon accent">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="22 4 12 14.01 9 11.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="stat-content">
                <span className="stat-label">Uyumluluk Oranı</span>
                <span className="stat-value">89%</span>
              </div>
            </div>
          </div>

          <div className="content-grid full-width">
            <div className="content-card">
              <div className="card-header">
                <h2 className="card-title">GitHub Repoları</h2>

                <div className="card-header-actions">
                  {githubStatus.connected && (
                    <button onClick={handleAddRepo} className="add-repo-button">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <line x1="12" y1="5" x2="12" y2="19" strokeWidth="2" strokeLinecap="round" />
                        <line x1="5" y1="12" x2="19" y2="12" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      Repo Ekle
                    </button>
                  )}

                  {githubStatus.connected ? (
                    <button
                      onClick={handleSyncRepos}
                      className="sync-button"
                      disabled={isSyncingRepos}
                    >
                      {isSyncingRepos ? (
                        <>
                          <span className="spinner-small"></span>
                          Senkronize ediliyor...
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="23 4 23 10 17 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <polyline points="1 20 1 14 7 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          Senkronize Et
                        </>
                      )}
                    </button>
                  ) : (
                    <button onClick={handleConnectGitHub} className="connect-github-button">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                      GitHub'ı Bağla
                    </button>
                  )}
                </div>
              </div>

              {isLoadingRepos ? (
                <div className="repos-loading">
                  <div className="spinner-medium"></div>
                  <p>Repolar yükleniyor...</p>
                </div>
              ) : !githubStatus.connected ? (
                <div className="empty-state">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <h3>GitHub App Bağlantısı Yok</h3>
                  <p>Repolarınıza erişim sağlamak için GitHub App'i yükleyin</p>
                  <button onClick={handleConnectGitHub} className="connect-github-button-large">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    GitHub App'i Yükle
                  </button>
                </div>
              ) : repos.length === 0 ? (
                <div className="empty-state">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <h3>Henüz repo seçilmedi</h3>
                  <p>GitHub App yüklü ama hiç repo seçilmemiş. GitHub'da repo erişimini güncelle.</p>
                </div>
              ) : (
                <div className="repos-grid">
                  {repos.map((repo) => (
                    <div key={repo.id} className="repo-card">
                      <div className="repo-header">
                        <div className="repo-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>

                        <div className="repo-info">
                          <h3 className="repo-name">{repo.name}</h3>
                          {repo.private && <span className="repo-badge private">Private</span>}
                        </div>
                      </div>

                      {repo.description && (
                        <p className="repo-description">{repo.description}</p>
                      )}

                      <div className="repo-meta">
                        <span className="repo-branch">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <line x1="6" y1="3" x2="6" y2="15" strokeWidth="2" strokeLinecap="round" />
                            <circle cx="18" cy="6" r="3" strokeWidth="2" />
                            <circle cx="6" cy="18" r="3" strokeWidth="2" />
                            <path d="M18 9a9 9 0 0 1-9 9" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                          {repo.default_branch}
                        </span>

                        <span className="repo-updated">
                          {new Date(repo.updated_at).toLocaleDateString('tr-TR')}
                        </span>
                      </div>

                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="repo-link"
                      >
                        GitHub'da Görüntüle
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <polyline points="15 3 21 3 21 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <line x1="10" y1="14" x2="21" y2="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="content-grid">
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

          <div className="activity-section">
            <div className="card-header">
              <h2 className="card-title">Son Aktiviteler</h2>
            </div>

            <div className="activity-feed">
              <div className="activity-item">
                <div className="activity-icon success">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="2" />
                    <polyline points="14 2 14 8 20 8" strokeWidth="2" />
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
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" />
                    <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
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
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth="2" />
                    <polyline points="22 4 12 14.01 9 11.01" strokeWidth="2" />
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