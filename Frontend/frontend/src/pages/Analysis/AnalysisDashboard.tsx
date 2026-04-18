import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/Toast';
import TriggerAnalysis from './TriggerAnalysis';
import './AnalysisDashboard.css';

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

interface ProjectAnalysis {
  project_id: string;
  repo_full_name: string;
  latest_analysis: {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    started_at: string;
    completed_at?: string;
    total_issues: number;
    critical_count: number;
    high_count: number;
    medium_count: number;
    low_count: number;
  } | null;
}

export default function AnalysisDashboard() {
  const navigate = useNavigate();
  const { toasts, showToast, hideToast } = useToast();
  
  const [repos, setRepos] = useState<Repository[]>([]);
  const [projects, setProjects] = useState<ProjectAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [isPublicMode, setIsPublicMode] = useState(false);

  useEffect(() => {
    fetchRepos();
    fetchProjects();
  }, []);

  const fetchRepos = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/github/repos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data: any = await response.json();
        const transformedRepos = data.repos.map((repo: any) => ({
          id: repo.repo_id,
          name: repo.repo_full_name?.split('/')[1] || 'Unknown',
          full_name: repo.repo_full_name,
          private: repo.is_private,
          html_url: repo.html_url || `https://github.com/${repo.repo_full_name}`,
          description: repo.description || null,
          default_branch: repo.default_branch || 'main',
          updated_at: repo.updated_at || new Date().toISOString(),
        }));
        setRepos(transformedRepos);
      }
    } catch (err) {
      console.error('Repos fetch error:', err);
    }
  };

  const fetchProjects = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setIsLoading(true);

    try {
      // Bu endpoint backend'de henüz yok, eklemen gerekecek
      // Şimdilik mock data kullanıyoruz
      const mockProjects: ProjectAnalysis[] = repos.map(repo => ({
        project_id: `project-${repo.id}`,
        repo_full_name: repo.full_name,
        latest_analysis: null,
      }));

      setProjects(mockProjects);
    } catch (err) {
      console.error('Projects fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerInstalled = (repo: Repository) => {
    setSelectedRepo(repo);
    setIsPublicMode(false);
    setShowTriggerModal(true);
  };

  const handleTriggerPublic = () => {
    setSelectedRepo(null);
    setIsPublicMode(true);
    setShowTriggerModal(true);
  };

  const handleAnalysisTriggered = () => {
    setShowTriggerModal(false);
    fetchProjects();
    showToast('Analiz başlatıldı!', 'success');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'info';
      case 'failed': return 'error';
      default: return 'warning';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Tamamlandı';
      case 'processing': return 'İşleniyor';
      case 'failed': return 'Başarısız';
      case 'pending': return 'Bekliyor';
      default: return 'Bilinmiyor';
    }
  };

  return (
    <div className="analysis-dashboard">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
        />
      ))}

      {/* Header */}
      <div className="analysis-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="page-title">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Kod Analizleri
            </h1>
            <p className="page-subtitle">
              Projelerinizi güvenlik ve kalite açısından analiz edin
            </p>
          </div>
          <div className="header-actions">
            <button 
              onClick={handleTriggerPublic}
              className="trigger-button public"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeWidth="2"/>
              </svg>
              Public Repo Analiz Et
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="analysis-stats">
        <div className="stat-card">
          <div className="stat-icon success">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Tamamlanan</span>
            <span className="stat-value">
              {projects.filter(p => p.latest_analysis?.status === 'completed').length}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon info">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2"/>
              <polyline points="12 6 12 12 16 14" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">İşleniyor</span>
            <span className="stat-value">
              {projects.filter(p => p.latest_analysis?.status === 'processing').length}
            </span>
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
            <span className="stat-label">Toplam Issue</span>
            <span className="stat-value">
              {projects.reduce((sum, p) => sum + (p.latest_analysis?.total_issues || 0), 0)}
            </span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon accent">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Toplam Proje</span>
            <span className="stat-value">{repos.length}</span>
          </div>
        </div>
      </div>

      {/* Repos Grid */}
      {isLoading ? (
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Projeler yükleniyor...</p>
        </div>
      ) : repos.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h3>Henüz repo bağlanmadı</h3>
          <p>GitHub App yükleyerek repolarınıza erişim sağlayın</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="primary-button"
          >
            GitHub'a Git
          </button>
        </div>
      ) : (
        <div className="repos-grid">
          {repos.map((repo) => {
            const project = projects.find(p => p.repo_full_name === repo.full_name);
            const analysis = project?.latest_analysis;

            return (
              <div key={repo.id} className="repo-analysis-card">
                {/* Repo Header */}
                <div className="card-header">
                  <div className="repo-info">
                    <div className="repo-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="repo-name">{repo.name}</h3>
                      <p className="repo-full-name">{repo.full_name}</p>
                    </div>
                  </div>
                  {repo.private && (
                    <span className="repo-badge private">Private</span>
                  )}
                </div>

                {/* Analysis Status */}
                {analysis ? (
                  <div className="analysis-status">
                    <div className="status-header">
                      <span className={`status-badge ${getStatusColor(analysis.status)}`}>
                        {getStatusText(analysis.status)}
                      </span>
                      <span className="analysis-date">
                        {new Date(analysis.started_at).toLocaleDateString('tr-TR')}
                      </span>
                    </div>

                    {analysis.status === 'completed' && (
                      <div className="issues-summary">
                        <div className="issue-stat critical">
                          <span className="issue-count">{analysis.critical_count}</span>
                          <span className="issue-label">Kritik</span>
                        </div>
                        <div className="issue-stat high">
                          <span className="issue-count">{analysis.high_count}</span>
                          <span className="issue-label">Yüksek</span>
                        </div>
                        <div className="issue-stat medium">
                          <span className="issue-count">{analysis.medium_count}</span>
                          <span className="issue-label">Orta</span>
                        </div>
                        <div className="issue-stat low">
                          <span className="issue-count">{analysis.low_count}</span>
                          <span className="issue-label">Düşük</span>
                        </div>
                      </div>
                    )}

                    {analysis.status === 'processing' && (
                      <div className="processing-state">
                        <div className="spinner-small"></div>
                        <span>Analiz ediliyor...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="no-analysis">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" opacity="0.3">
                      <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                      <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <p>Henüz analiz yapılmadı</p>
                  </div>
                )}

                {/* Actions */}
                <div className="card-actions">
                  <button
                    onClick={() => handleTriggerInstalled(repo)}
                    className="action-button primary"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                      <polyline points="10 8 14 12 10 16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {analysis ? 'Yeniden Analiz Et' : 'Analiz Başlat'}
                  </button>
                  {analysis && analysis.status === 'completed' && (
                    <button
                      onClick={() => navigate(`/analysis/${analysis.id}`)}
                      className="action-button secondary"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2"/>
                        <circle cx="12" cy="12" r="3" strokeWidth="2"/>
                      </svg>
                      Detayları Gör
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Trigger Modal */}
      {showTriggerModal && (
        <TriggerAnalysis
          repo={selectedRepo}
          isPublic={isPublicMode}
          onClose={() => setShowTriggerModal(false)}
          onSuccess={handleAnalysisTriggered}
        />
      )}
    </div>
  );
}