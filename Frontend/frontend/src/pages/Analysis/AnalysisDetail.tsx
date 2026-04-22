import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/Toast';
import './AnalysisDetail.css';

interface Analysis {
  id: string;
  repo_full_name: string;
  branch: string;
  commit_hash: string | null;
  status: string;
  sonar_project_key: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

interface Issue {
  key: string;
  rule: string;
  severity: 'BLOCKER' | 'CRITICAL' | 'MAJOR' | 'MINOR' | 'INFO';
  component: string;
  line: number | null;
  message: string;
  type: 'BUG' | 'VULNERABILITY' | 'CODE_SMELL' | 'SECURITY_HOTSPOT';
  status: string;
  effort: string | null;
  debt: string | null;
  author: string | null;
  creation_date: string;
  update_date: string;
  tags: string[];
  code_snippet?: string;
  ai_fix?: AIFix;
}

interface AIFix {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fix_code: string | null;
  explanation: string | null;
  confidence_score: number | null;
  created_at: string;
  completed_at: string | null;
}

interface Metrics {
  reliability_rating: string;
  security_rating: string;
  maintainability_rating: string;
  coverage: string;
  duplications: string;
  bugs: number;
  vulnerabilities: number;
  code_smells: number;
  technical_debt: string;
  ncloc: number;
  complexity: number;
}

type SeverityFilter = 'all' | 'BLOCKER' | 'CRITICAL' | 'MAJOR' | 'MINOR' | 'INFO';
type TypeFilter = 'all' | 'BUG' | 'VULNERABILITY' | 'CODE_SMELL' | 'SECURITY_HOTSPOT';

// Boş response body'sini güvenli şekilde JSON'a çevirir
async function safeJson<T>(response: Response): Promise<T | null> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export default function AnalysisDetail() {
  // Bu bileşen artık projectId üzerinden açılır: /project/:projectId
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toasts, showToast, hideToast } = useToast();

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  // analysis.id — fetchIssues/fetchMetrics/requestAIFix için kullanılır
  const [currentAnalysisId, setCurrentAnalysisId] = useState<string | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'issues' | 'metrics'>('issues');
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
  const [requestingFix, setRequestingFix] = useState<string | null>(null);

  // Analiz tamamlanana kadar polling için ref
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  useEffect(() => {
    if (!projectId) return;
    fetchLatestAnalysis();
    return () => stopPolling();
  }, [projectId]);

  // filter değişince veya currentAnalysisId hazır olunca issue'ları çek
  useEffect(() => {
    if (currentAnalysisId) {
      fetchCurrentIssues();
    }
  }, [currentAnalysisId, severityFilter, typeFilter]);

  // currentAnalysisId hazır olunca metrikleri çek
  useEffect(() => {
    if (currentAnalysisId) {
      fetchMetrics();
    }
  }, [currentAnalysisId]);

  /**
   * GET /analysis/project/:projectId/latest
   * Projenin en son analizini (herhangi bir status'ta) getirir.
   * Buradan aldığımız analysis.id'yi currentAnalysisId olarak saklarız.
   */
  const fetchLatestAnalysis = async () => {
    const token = localStorage.getItem('access_token');
    if (!token || !projectId) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/analysis/project/${projectId}/latest`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.ok) {
        const data = await safeJson<Analysis>(response);
        if (data) {
          setAnalysis(data);
          setCurrentAnalysisId(data.id);

          // pending veya processing ise polling başlat
          if (data.status === 'pending' || data.status === 'processing') {
            if (!pollingRef.current) {
              pollingRef.current = setInterval(async () => {
                const r = await fetch(
                  `${import.meta.env.VITE_API_URL}/analysis/project/${projectId}/latest`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                if (r.ok) {
                  const updated = await safeJson<Analysis>(r);
                  if (updated) {
                    setAnalysis(updated);
                    setCurrentAnalysisId(updated.id);
                    if (updated.status === 'completed' || updated.status === 'failed') {
                      stopPolling();
                    }
                  }
                }
              }, 5000);
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch latest analysis:', err);
      showToast('Analiz bilgileri yüklenemedi', 'error');
    }
  };

  /**
   * GET /analysis/project/:projectId/current
   * En son TAMAMLANAN analizin issue'larını döner (filtered).
   * Commit1'de 5 issue vardıysa, commit2 push'ta 3 issue kaldıysa
   * bu endpoint 3 issue döner — geçmiş veriler sızmaz.
   */
  const fetchCurrentIssues = async () => {
    const token = localStorage.getItem('access_token');
    if (!token || !projectId) return;

    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      if (severityFilter !== 'all') params.append('severity', severityFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/analysis/project/${projectId}/current?${params}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.ok) {
        const data = await safeJson<{ analysis: unknown; issues: { items: Issue[] } }>(response);
        setIssues(data?.issues?.items ?? []);
      }
    } catch (err) {
      console.error('Failed to fetch current issues:', err);
      showToast("Issue'lar yüklenemedi", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * GET /analysis/:analysisId/metrics
   * Belirli bir analiz'in metriklerini getirir.
   * currentAnalysisId (latest'tan gelen) kullanılır.
   */
  const fetchMetrics = async () => {
    const token = localStorage.getItem('access_token');
    if (!token || !currentAnalysisId) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/analysis/${currentAnalysisId}/metrics`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.ok) {
        const data = await safeJson<Metrics>(response);
        if (data) setMetrics(data);
        // data null ise (boş body) — analiz henüz tamamlanmadı, sessizce geç
      }
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
    }
  };

  /**
   * POST /analysis/:analysisId/issues/:issueKey/fix
   * AI düzeltme isteği — currentAnalysisId üzerinden gider.
   */
  const requestAIFix = async (issueKey: string) => {
    const token = localStorage.getItem('access_token');
    if (!token || !currentAnalysisId) return;

    setRequestingFix(issueKey);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/analysis/${currentAnalysisId}/issues/${issueKey}/fix`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        showToast('AI düzeltme isteği gönderildi', 'success');
        setTimeout(() => fetchCurrentIssues(), 2000);
      } else {
        showToast('AI düzeltme isteği başarısız', 'error');
      }
    } catch (err) {
      console.error('Failed to request AI fix:', err);
      showToast('AI düzeltme isteği başarısız', 'error');
    } finally {
      setRequestingFix(null);
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = {
      BLOCKER: 'severity-blocker',
      CRITICAL: 'severity-critical',
      MAJOR: 'severity-major',
      MINOR: 'severity-minor',
      INFO: 'severity-info',
    };
    return colors[severity] || 'severity-info';
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactElement> = {
      BUG: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 9V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4M8 8H3m18 0h-5M10 14a2 2 0 1 0 4 0 2 2 0 1 0-4 0zM9 18h-.01M15 18h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      VULNERABILITY: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 8v4m0 4h.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      CODE_SMELL: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round" />
          <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ),
      SECURITY_HOTSPOT: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10" strokeWidth="2" />
          <circle cx="12" cy="12" r="3" strokeWidth="2" />
        </svg>
      ),
    };
    return icons[type] || icons.CODE_SMELL;
  };

  const getRatingBadge = (rating: string) => {
    const badges: Record<string, { text: string; className: string }> = {
      A: { text: 'A', className: 'rating-badge rating-a' },
      B: { text: 'B', className: 'rating-badge rating-b' },
      C: { text: 'C', className: 'rating-badge rating-c' },
      D: { text: 'D', className: 'rating-badge rating-d' },
      E: { text: 'E', className: 'rating-badge rating-e' },
    };
    return badges[rating] || badges['E'];
  };

  const getMetricChange = (current: number, previous: number | undefined) => {
    if (previous === undefined) return null;
    const diff = current - previous;
    if (diff === 0) return null;
    return {
      value: Math.abs(diff),
      isIncrease: diff > 0,
      percentage: ((Math.abs(diff) / previous) * 100).toFixed(1),
    };
  };

  // Analiz yüklenmediyse loading göster
  if (!analysis) {
    return (
      <div className="analysis-detail">
        <div className="loading-state">
          <div className="spinner-large"></div>
          <p>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Analiz henüz tamamlanmadıysa özel ekran
  if (analysis.status === 'pending' || analysis.status === 'processing') {
    return (
      <div className="analysis-detail">
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => hideToast(toast.id)} />
        ))}
        <div className="detail-header">
          <button onClick={() => navigate('/analysis')} className="back-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="15 18 9 12 15 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Geri
          </button>
          <div className="header-info">
            <h1 className="repo-title">{analysis.repo_full_name}</h1>
          </div>
        </div>
        <div className="analysis-processing-state">
          <div className="spinner-large"></div>
          <h3>{analysis.status === 'pending' ? 'Analiz Kuyruğa Alındı' : 'Analiz İşleniyor...'}</h3>
          <p>
            {analysis.status === 'pending'
              ? 'Analiz başlamak için sıra bekliyor. Bu sayfa otomatik olarak güncellenecek.'
              : 'Kod analiz ediliyor, lütfen bekleyin. Bu işlem birkaç dakika sürebilir.'}
          </p>
          <span className="processing-status-badge">
            {analysis.status === 'pending' ? 'Bekliyor' : 'İşleniyor'}
          </span>
        </div>
      </div>
    );
  }

  // Analiz başarısız olduysa
  if (analysis.status === 'failed') {
    return (
      <div className="analysis-detail">
        {toasts.map((toast) => (
          <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => hideToast(toast.id)} />
        ))}
        <div className="detail-header">
          <button onClick={() => navigate('/analysis')} className="back-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="15 18 9 12 15 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Geri
          </button>
          <div className="header-info">
            <h1 className="repo-title">{analysis.repo_full_name}</h1>
          </div>
        </div>
        <div className="analysis-failed-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <line x1="15" y1="9" x2="9" y2="15" strokeWidth="2" strokeLinecap="round" />
            <line x1="9" y1="9" x2="15" y2="15" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <h3>Analiz Başarısız</h3>
          <p>Analiz sırasında bir hata oluştu. Lütfen tekrar deneyin.</p>
          <button onClick={() => navigate('/analysis')} className="back-to-analysis-button">
            Analize Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analysis-detail">
      {toasts.map((toast) => (
        <Toast key={toast.id} message={toast.message} type={toast.type} onClose={() => hideToast(toast.id)} />
      ))}

      {/* Header */}
      <div className="detail-header">
        <button onClick={() => navigate('/analysis')} className="back-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="15 18 9 12 15 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Geri
        </button>

        <div className="header-info">
          <h1 className="repo-title">{analysis.repo_full_name}</h1>
          <div className="analysis-meta">
            <span className="meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="6" y1="3" x2="6" y2="15" strokeWidth="2" strokeLinecap="round" />
                <circle cx="18" cy="6" r="3" strokeWidth="2" />
                <circle cx="6" cy="18" r="3" strokeWidth="2" />
                <path d="M18 9a9 9 0 0 1-9 9" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {analysis.branch}
            </span>
            {analysis.commit_hash && (
              <span className="meta-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <circle cx="12" cy="12" r="3" strokeWidth="2" />
                </svg>
                {analysis.commit_hash.substring(0, 7)}
              </span>
            )}
            <span className="meta-item">
              {new Date(analysis.created_at).toLocaleString('tr-TR')}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="detail-tabs">
        <button
          className={`tab ${activeTab === 'issues' ? 'active' : ''}`}
          onClick={() => setActiveTab('issues')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Issues ({issues.length})
        </button>
        <button
          className={`tab ${activeTab === 'metrics' ? 'active' : ''}`}
          onClick={() => setActiveTab('metrics')}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="12" y1="20" x2="12" y2="10" strokeWidth="2" strokeLinecap="round" />
            <line x1="18" y1="20" x2="18" y2="4" strokeWidth="2" strokeLinecap="round" />
            <line x1="6" y1="20" x2="6" y2="16" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Metrikler
        </button>
      </div>

      {/* Issues Tab */}
      {activeTab === 'issues' && (
        <div className="issues-section">
          <div className="filters">
            <div className="filter-group">
              <label>Şiddet:</label>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value as SeverityFilter)}
                className="filter-select"
              >
                <option value="all">Tümü</option>
                <option value="BLOCKER">Blocker</option>
                <option value="CRITICAL">Critical</option>
                <option value="MAJOR">Major</option>
                <option value="MINOR">Minor</option>
                <option value="INFO">Info</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Tip:</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
                className="filter-select"
              >
                <option value="all">Tümü</option>
                <option value="BUG">Bug</option>
                <option value="VULNERABILITY">Vulnerability</option>
                <option value="CODE_SMELL">Code Smell</option>
                <option value="SECURITY_HOTSPOT">Security Hotspot</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="loading-state">
              <div className="spinner-medium"></div>
              <p>Issues yükleniyor...</p>
            </div>
          ) : issues.length === 0 ? (
            <div className="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3>Harika! Hiç issue bulunamadı</h3>
              <p>Bu filtre ile eşleşen herhangi bir sorun yok</p>
            </div>
          ) : (
            <div className="issues-list">
              {issues.map((issue) => (
                <div key={issue.key} className="issue-card">
                  <div className="issue-header" onClick={() => setExpandedIssue(expandedIssue === issue.key ? null : issue.key)}>
                    <div className="issue-type-icon">{getTypeIcon(issue.type)}</div>
                    <div className="issue-info">
                      <h3 className="issue-message">{issue.message}</h3>
                      <div className="issue-meta">
                        <span className={`severity-badge ${getSeverityColor(issue.severity)}`}>
                          {issue.severity}
                        </span>
                        <span className="issue-rule">{issue.rule}</span>
                        {issue.line && (
                          <span className="issue-location">
                            {issue.component.split(':').pop()} : {issue.line}
                          </span>
                        )}
                      </div>
                    </div>
                    <button className="expand-button" onClick={(e) => { e.stopPropagation(); setExpandedIssue(expandedIssue === issue.key ? null : issue.key); }}>
                      <svg
                        width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        style={{ transform: expandedIssue === issue.key ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                      >
                        <polyline points="6 9 12 15 18 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>

                  {expandedIssue === issue.key && (
                    <div className="issue-details">
                      {issue.code_snippet && (
                        <div className="code-snippet">
                          <div className="snippet-header">
                            <span>Kod Parçası</span>
                            <span className="line-number">Line {issue.line}</span>
                          </div>
                          <pre><code>{issue.code_snippet}</code></pre>
                        </div>
                      )}

                      <div className="ai-fix-section">
                        {issue.ai_fix ? (
                          <div className="ai-fix">
                            <div className="ai-fix-header">
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="10" strokeWidth="2" />
                                <path d="M12 16v-4M12 8h.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <span>AI Düzeltme Önerisi</span>
                              {issue.ai_fix.confidence_score && (
                                <span className="confidence-score">
                                  Güven: {(issue.ai_fix.confidence_score * 100).toFixed(0)}%
                                </span>
                              )}
                            </div>
                            {issue.ai_fix.status === 'completed' && issue.ai_fix.fix_code ? (
                              <>
                                {issue.ai_fix.explanation && (
                                  <p className="ai-explanation">{issue.ai_fix.explanation}</p>
                                )}
                                <div className="ai-code">
                                  <div className="code-header">Önerilen Düzeltme:</div>
                                  <pre><code>{issue.ai_fix.fix_code}</code></pre>
                                </div>
                              </>
                            ) : issue.ai_fix.status === 'processing' ? (
                              <div className="ai-processing">
                                <div className="spinner-small"></div>
                                <span>AI düzeltme hazırlanıyor...</span>
                              </div>
                            ) : issue.ai_fix.status === 'failed' ? (
                              <div className="ai-failed">
                                <span>AI düzeltme oluşturulamadı</span>
                                <button onClick={() => requestAIFix(issue.key)} className="retry-button" disabled={requestingFix === issue.key}>
                                  Tekrar Dene
                                </button>
                              </div>
                            ) : (
                              <div className="ai-pending">
                                <div className="spinner-small"></div>
                                <span>AI düzeltme bekleniyor...</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <button onClick={() => requestAIFix(issue.key)} className="request-ai-fix-button" disabled={requestingFix === issue.key}>
                            {requestingFix === issue.key ? (
                              <><div className="spinner-small"></div>İstek Gönderiliyor...</>
                            ) : (
                              <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                                  <path d="M12 16v-4M12 8h.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                AI Düzeltme İste
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {issue.tags && issue.tags.length > 0 && (
                        <div className="issue-tags">
                          {issue.tags.map((tag) => (
                            <span key={tag} className="tag">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Metrics Tab */}
      {activeTab === 'metrics' && (
        <div className="metrics-section">
          {metrics ? (
            <>
              <div className="metrics-grid">
                {[
                  { label: 'Güvenilirlik', rating: metrics.reliability_rating, value: metrics.bugs, unit: 'Bug', prevValue: undefined },
                  { label: 'Güvenlik', rating: metrics.security_rating, value: metrics.vulnerabilities, unit: 'Vulnerability', prevValue: undefined },
                  { label: 'Sürdürülebilirlik', rating: metrics.maintainability_rating, value: metrics.code_smells, unit: 'Code Smell', prevValue: undefined },
                ].map(({ label, rating, value, unit, prevValue }) => {
                  const change = getMetricChange(value, prevValue);
                  return (
                    <div className="metric-card" key={label}>
                      <div className="metric-header">
                        <span className="metric-label">{label}</span>
                        <span className={getRatingBadge(rating).className}>{getRatingBadge(rating).text}</span>
                      </div>
                      <div className="metric-value">
                        <span className="value">{value}</span>
                        <span className="unit">{unit}</span>
                      </div>
                      {change && (
                        <div className={`metric-change ${change.isIncrease ? 'negative' : 'positive'}`}>
                          {change.isIncrease ? '↑' : '↓'} {change.value} ({change.percentage}%)
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="metric-card">
                  <div className="metric-header">
                    <span className="metric-label">Teknik Borç</span>
                  </div>
                  <div className="metric-value">
                    <span className="value">{metrics.technical_debt}</span>
                  </div>
                </div>
              </div>

              <div className="additional-metrics">
                {[
                  { label: 'Test Coverage', value: metrics.coverage != null ? `${metrics.coverage}%` : '-' },
                  { label: 'Kod Tekrarı', value: metrics.duplications != null ? `${metrics.duplications}%` : '-' },
                  { label: 'Kod Satırı', value: metrics.ncloc != null ? metrics.ncloc.toLocaleString() : '-' },
                  { label: 'Karmaşıklık', value: metrics.complexity != null ? metrics.complexity.toLocaleString() : '-' },
                ].map(({ label, value }) => (
                  <div className="metric-row" key={label}>
                    <span className="metric-label">{label}</span>
                    <span className="metric-value">{value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="loading-state">
              <div className="spinner-medium"></div>
              <p>Metrikler yükleniyor...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}