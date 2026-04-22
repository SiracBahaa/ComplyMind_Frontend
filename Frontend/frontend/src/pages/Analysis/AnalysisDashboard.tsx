import { useEffect, useState } from 'react';
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
}

interface Analysis {
  id: string;
  project?: { id: string };     // GET /analysis/:id → summary.project.id olarak gelir
  repo_full_name: string;
  repo_id: number;
  branch: string;
  commit_hash: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  sonar_project_key: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  total_issues?: number;
  critical_issues?: number;
  high_issues?: number;
  medium_issues?: number;
  low_issues?: number;
}

interface AnalysisStats {
  total_analyses: number;
  completed_analyses: number;
  processing_analyses: number;
  failed_analyses: number;
  total_issues: number;
  total_projects: number;
}

type StatusBadge = { text: string; className: string };

// repo_full_name → analysis_id eşleşmesini localStorage'da sakla
const STORAGE_KEY = 'repo_analysis_map';

function getStoredAnalysisMap(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveAnalysisId(repoFullName: string, analysisId: string) {
  const map = getStoredAnalysisMap();
  map[repoFullName] = analysisId;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export default function AnalysisDashboard() {
  const navigate = useNavigate();
  const { toasts, showToast, hideToast } = useToast();

  const [repos, setRepos] = useState<Repository[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [stats, setStats] = useState<AnalysisStats>({
    total_analyses: 0,
    completed_analyses: 0,
    processing_analyses: 0,
    failed_analyses: 0,
    total_issues: 0,
    total_projects: 0,
  });
  const [showTriggerModal, setShowTriggerModal] = useState(false);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);

  useEffect(() => {
    fetchRepos();
    fetchStats();
    const interval = window.setInterval(fetchStats, 5000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (repos.length > 0) {
      fetchAnalysesFromStorage(repos);
      const interval = window.setInterval(() => fetchAnalysesFromStorage(repos), 5000);
      return () => window.clearInterval(interval);
    }
  }, [repos]);

  const fetchRepos = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    setIsLoadingRepos(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/github/repos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const transformedRepos = (data.repos || []).map((repo: any) => ({
          id: repo.repo_id || repo.id,
          name: repo.name || repo.repo_full_name?.split('/')[1] || 'Unknown',
          full_name: repo.full_name || repo.repo_full_name || 'Unknown/Unknown',
          private: repo.private ?? repo.is_private ?? false,
        }));
        setRepos(transformedRepos);
      } else {
        setRepos([]);
      }
    } catch (err) {
      console.error('Failed to fetch repos:', err);
      setRepos([]);
    } finally {
      setIsLoadingRepos(false);
    }
  };

  /**
   * Backend'de GET /analysis (liste) endpoint'i yok.
   * Trigger sonrası dönen analysis_id'leri localStorage'da saklıyoruz.
   * Buradan GET /analysis/:analysisId ile tek tek çekiyoruz.
   */
  const fetchAnalysesFromStorage = async (repoList: Repository[]) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const map = getStoredAnalysisMap();
    const entries = repoList
      .map((repo) => ({ repo, analysisId: map[repo.full_name] }))
      .filter((e) => Boolean(e.analysisId));

    if (entries.length === 0) return;

    try {
      const requests = entries.map(async ({ repo, analysisId }) => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/analysis/${analysisId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            return data ? { ...data, repo_full_name: repo.full_name } : null;
          }
          return null;
        } catch {
          return null;
        }
      });

      const results = (await Promise.all(requests)).filter(Boolean) as Analysis[];
      if (results.length > 0) {
        setAnalyses((prev) => {
          const updated = [...prev];
          results.forEach((newA) => {
            const idx = updated.findIndex((a) => a.repo_full_name === newA.repo_full_name);
            if (idx >= 0) updated[idx] = newA;
            else updated.push(newA);
          });
          return updated;
        });
      }
    } catch (err) {
      console.error('Failed to fetch analyses:', err);
    } finally {
    }
  };

  const fetchStats = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/analysis/queue/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStats((prev) => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleTriggerAnalysis = async (repoFullName: string) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/analysis/trigger/installed`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repo_full_name: repoFullName }),
      });

      if (response.ok) {
        const result = await response.json();
        const analysisId: string | undefined = result.analysis_id;
        const projectId: string | undefined = result.project_id;

        if (analysisId) {
          saveAnalysisId(repoFullName, analysisId);
        }

        if (projectId) {
          // Doğru route: /analysis/project/:projectId
          showToast('Analiz başlatıldı! Detay sayfasına yönlendiriliyorsunuz...', 'success');
          setShowTriggerModal(false);
          window.setTimeout(() => navigate(`/analysis/project/${projectId}`), 1200);
        } else {
          showToast('Analiz başlatıldı!', 'success');
          setShowTriggerModal(false);
          window.setTimeout(() => {
            fetchAnalysesFromStorage(repos);
            fetchStats();
          }, 1000);
        }
      } else {
        const error = await response.json();
        showToast(error.message || 'Analiz başlatılamadı', 'error');
      }
    } catch (err) {
      console.error('Failed to trigger analysis:', err);
      showToast('Analiz başlatılamadı', 'error');
    }
  };

  const getStatusBadge = (status: Analysis['status']): StatusBadge => {
    const badges: Record<Analysis['status'], StatusBadge> = {
      pending: { text: 'Bekliyor', className: 'status-badge pending' },
      processing: { text: 'İşleniyor', className: 'status-badge processing' },
      completed: { text: 'Tamamlandı', className: 'status-badge completed' },
      failed: { text: 'Başarısız', className: 'status-badge failed' },
    };
    return badges[status];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const getRepoLatestAnalysis = (repoFullName: string): Analysis | undefined =>
    analyses
      .filter((a) => a.repo_full_name === repoFullName)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  return (
    <div className="analysis-dashboard">
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => hideToast(toast.id)} />
      ))}

      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Kod Analizi</h1>
          <p className="page-subtitle">Repolarınızı analiz edin ve kod kalitesini izleyin</p>
        </div>
        <button onClick={() => setShowTriggerModal(true)} className="trigger-analysis-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Yeni Analiz Başlat
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon completed">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Tamamlanan</span>
            <span className="stat-value">{stats.completed_analyses}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon processing">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">İşleniyor</span>
            <span className="stat-value">{stats.processing_analyses}</span>
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
            <span className="stat-label">Toplam Issue</span>
            <span className="stat-value">{stats.total_issues}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon info">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Toplam Proje</span>
            <span className="stat-value">{stats.total_projects}</span>
          </div>
        </div>
      </div>

      {isLoadingRepos ? (
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Yükleniyor...</p>
        </div>
      ) : repos.length === 0 ? (
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h3>Henüz repo bağlanmadı</h3>
          <p>Kod analizi yapmak için önce GitHub repolarınızı bağlayın</p>
          <button onClick={() => navigate('/dashboard')} className="primary-button">
            Dashboard'a Git
          </button>
        </div>
      ) : (
        <div className="repos-analysis-grid">
          {repos.map((repo) => {
            const latestAnalysis = getRepoLatestAnalysis(repo.full_name);
            return (
              <div key={repo.id} className="repo-analysis-card">
                <div className="repo-header">
                  <div className="repo-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="repo-info">
                    <h3 className="repo-name">{repo.name}</h3>
                    <span className="repo-full-name">{repo.full_name}</span>
                  </div>
                  {repo.private && <span className="repo-badge private">Private</span>}
                </div>

                {latestAnalysis ? (
                  <>
                    <div className="analysis-status">
                      <span className={getStatusBadge(latestAnalysis.status).className}>
                        {getStatusBadge(latestAnalysis.status).text}
                      </span>
                      <span className="analysis-time">{formatDate(latestAnalysis.created_at)}</span>
                    </div>

                    {latestAnalysis.status === 'completed' && latestAnalysis.total_issues !== undefined && (
                      <div className="issue-summary">
                        <div className="issue-count critical">
                          <span className="count">{latestAnalysis.critical_issues || 0}</span>
                          <span className="label">Kritik</span>
                        </div>
                        <div className="issue-count high">
                          <span className="count">{latestAnalysis.high_issues || 0}</span>
                          <span className="label">Yüksek</span>
                        </div>
                        <div className="issue-count medium">
                          <span className="count">{latestAnalysis.medium_issues || 0}</span>
                          <span className="label">Orta</span>
                        </div>
                        <div className="issue-count low">
                          <span className="count">{latestAnalysis.low_issues || 0}</span>
                          <span className="label">Düşük</span>
                        </div>
                      </div>
                    )}

                    <div className="analysis-actions">
                      {/* Doğru route: /analysis/project/:projectId */}
                      <button
                        onClick={() => navigate(`/analysis/project/${latestAnalysis.project?.id}`)}
                        className="view-details-button"
                      >
                        {latestAnalysis.status === 'completed' ? 'Detayları Gör' : 'Durumu Takip Et'}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <polyline points="9 18 15 12 9 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>

                      <button
                        onClick={() => handleTriggerAnalysis(repo.full_name)}
                        className="reanalyze-button"
                        disabled={latestAnalysis.status === 'processing' || latestAnalysis.status === 'pending'}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <polyline points="23 4 23 10 17 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <polyline points="1 20 1 14 7 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Yeniden Analiz Et
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="no-analysis">
                    <p>Henüz analiz yapılmadı</p>
                    <button onClick={() => handleTriggerAnalysis(repo.full_name)} className="analyze-button">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      İlk Analizi Başlat
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showTriggerModal && (
        <TriggerAnalysis
          repos={repos}
          onClose={() => setShowTriggerModal(false)}
          onTrigger={handleTriggerAnalysis}
        />
      )}
    </div>
  );
}
