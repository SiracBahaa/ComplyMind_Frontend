import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '../../hooks/useToast';
import Toast from '../../components/Toast';
import './AnalysisDetail.css';

interface AnalysisSummary {
  id: string;
  project_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  sonarqube_project_key: string;
  total_issues: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
}

interface Issue {
  id: string;
  key: string;
  rule: string;
  severity: 'BLOCKER' | 'CRITICAL' | 'MAJOR' | 'MINOR' | 'INFO';
  type: 'BUG' | 'VULNERABILITY' | 'CODE_SMELL' | 'SECURITY_HOTSPOT';
  component: string;
  line?: number;
  message: string;
  status: string;
}

interface Metrics {
  reliability_rating: string;
  security_rating: string;
  sqale_rating: string;
  coverage?: string;
  duplicated_lines_density?: string;
  ncloc?: string;
}

export default function AnalysisDetail() {
  const { analysisId } = useParams<{ analysisId: string }>();
  const navigate = useNavigate();
  const { toasts, showToast, hideToast } = useToast();

  const [analysis, setAnalysis] = useState<AnalysisSummary | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'issues' | 'metrics'>('issues');
  const [filterSeverity, setFilterSeverity] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');

  useEffect(() => {
    if (analysisId) {
      fetchAnalysisSummary();
      fetchIssues();
      fetchMetrics();
    }
  }, [analysisId]);

  const fetchAnalysisSummary = async () => {
    const token = localStorage.getItem('access_token');
    if (!token || !analysisId) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/analysis/${analysisId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      }
    } catch (err) {
      console.error('Analysis summary fetch error:', err);
      showToast('Analiz özeti yüklenemedi', 'error');
    }
  };

  const fetchIssues = async () => {
    const token = localStorage.getItem('access_token');
    if (!token || !analysisId) return;

    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      if (filterSeverity) params.append('severity', filterSeverity);
      if (filterType) params.append('type', filterType);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/analysis/${analysisId}/issues?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setIssues(data.issues || []);
      }
    } catch (err) {
      console.error('Issues fetch error:', err);
      showToast('Issue\'lar yüklenemedi', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMetrics = async () => {
    const token = localStorage.getItem('access_token');
    if (!token || !analysisId) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/analysis/${analysisId}/metrics`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (err) {
      console.error('Metrics fetch error:', err);
    }
  };

  useEffect(() => {
    if (analysisId) {
      fetchIssues();
    }
  }, [filterSeverity, filterType]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'BLOCKER':
      case 'CRITICAL':
        return 'critical';
      case 'MAJOR':
        return 'high';
      case 'MINOR':
        return 'medium';
      case 'INFO':
        return 'low';
      default:
        return 'low';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'BUG':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M8 2v4M16 2v4M6 6h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" strokeWidth="2"/>
            <path d="M8 11h8M8 15h5" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case 'VULNERABILITY':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 8v4M12 16h.01" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case 'CODE_SMELL':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2"/>
            <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case 'SECURITY_HOTSPOT':
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="9" x2="12" y2="13" strokeWidth="2" strokeLinecap="round"/>
            <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      default:
        return null;
    }
  };

  if (!analysis) {
    return (
      <div className="analysis-detail loading">
        <div className="spinner-large"></div>
        <p>Analiz detayı yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="analysis-detail">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
        />
      ))}

      {/* Header */}
      <div className="detail-header">
        <button onClick={() => navigate('/analysis')} className="back-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="15 18 9 12 15 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Geri
        </button>

        <div className="header-info">
          <h1 className="page-title">Analiz Detayı</h1>
          <div className="header-meta">
            <span className={`status-badge ${analysis.status}`}>
              {analysis.status === 'completed' ? 'Tamamlandı' : analysis.status}
            </span>
            <span className="analysis-date">
              {new Date(analysis.started_at).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card total">
          <div className="card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2"/>
              <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round"/>
              <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="card-content">
            <span className="card-label">Toplam Issue</span>
            <span className="card-value">{analysis.total_issues}</span>
          </div>
        </div>

        <div className="summary-card critical">
          <div className="card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2"/>
              <line x1="15" y1="9" x2="9" y2="15" strokeWidth="2" strokeLinecap="round"/>
              <line x1="9" y1="9" x2="15" y2="15" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="card-content">
            <span className="card-label">Kritik</span>
            <span className="card-value">{analysis.critical_count}</span>
          </div>
        </div>

        <div className="summary-card high">
          <div className="card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeWidth="2"/>
              <line x1="12" y1="9" x2="12" y2="13" strokeWidth="2" strokeLinecap="round"/>
              <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="card-content">
            <span className="card-label">Yüksek</span>
            <span className="card-value">{analysis.high_count}</span>
          </div>
        </div>

        <div className="summary-card medium">
          <div className="card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2"/>
              <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round"/>
              <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="card-content">
            <span className="card-label">Orta</span>
            <span className="card-value">{analysis.medium_count}</span>
          </div>
        </div>

        <div className="summary-card low">
          <div className="card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2"/>
              <path d="M12 16v-4M12 8h.01" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="card-content">
            <span className="card-label">Düşük</span>
            <span className="card-value">{analysis.low_count}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="detail-tabs">
        <button
          className={`tab ${activeTab === 'issues' ? 'active' : ''}`}
          onClick={() => setActiveTab('issues')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2"/>
            <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round"/>
            <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Issues ({analysis.total_issues})
        </button>
        <button
          className={`tab ${activeTab === 'metrics' ? 'active' : ''}`}
          onClick={() => setActiveTab('metrics')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="12" y1="20" x2="12" y2="10" strokeWidth="2" strokeLinecap="round"/>
            <line x1="18" y1="20" x2="18" y2="4" strokeWidth="2" strokeLinecap="round"/>
            <line x1="6" y1="20" x2="6" y2="16" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Metrics
        </button>
      </div>

      {/* Content */}
      <div className="detail-content">
        {activeTab === 'issues' && (
          <>
            {/* Filters */}
            <div className="filters-bar">
              <div className="filter-group">
                <label>Severity:</label>
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Tümü</option>
                  <option value="BLOCKER">Blocker</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="MAJOR">Major</option>
                  <option value="MINOR">Minor</option>
                  <option value="INFO">Info</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Type:</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="filter-select"
                >
                  <option value="">Tümü</option>
                  <option value="BUG">Bug</option>
                  <option value="VULNERABILITY">Vulnerability</option>
                  <option value="CODE_SMELL">Code Smell</option>
                  <option value="SECURITY_HOTSPOT">Security Hotspot</option>
                </select>
              </div>
            </div>

            {/* Issues List */}
            {isLoading ? (
              <div className="loading-state">
                <div className="spinner-medium"></div>
                <p>Issue'lar yükleniyor...</p>
              </div>
            ) : issues.length === 0 ? (
              <div className="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20 6 9 17 4 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3>Harika! Hiç issue bulunamadı</h3>
                <p>Bu filtrelerle eşleşen issue yok</p>
              </div>
            ) : (
              <div className="issues-list">
                {issues.map((issue) => (
                  <div key={issue.id} className={`issue-card ${getSeverityColor(issue.severity)}`}>
                    <div className="issue-header">
                      <div className="issue-type">
                        {getTypeIcon(issue.type)}
                        <span>{issue.type.replace('_', ' ')}</span>
                      </div>
                      <span className={`severity-badge ${getSeverityColor(issue.severity)}`}>
                        {issue.severity}
                      </span>
                    </div>

                    <h3 className="issue-title">{issue.message}</h3>

                    <div className="issue-meta">
                      <span className="issue-component">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="2"/>
                          <polyline points="14 2 14 8 20 8" strokeWidth="2"/>
                        </svg>
                        {issue.component.split(':').pop()}
                      </span>
                      {issue.line && (
                        <span className="issue-line">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="4 7 4 4 20 4 20 7" strokeWidth="2" strokeLinecap="round"/>
                            <line x1="9" y1="20" x2="15" y2="20" strokeWidth="2" strokeLinecap="round"/>
                            <line x1="12" y1="4" x2="12" y2="20" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          Line {issue.line}
                        </span>
                      )}
                    </div>

                    <div className="issue-rule">
                      <code>{issue.rule}</code>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'metrics' && metrics && (
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-header">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="2"/>
                </svg>
                <h3>Reliability</h3>
              </div>
              <div className="metric-value">{metrics.reliability_rating || 'N/A'}</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2"/>
                </svg>
                <h3>Security</h3>
              </div>
              <div className="metric-value">{metrics.security_rating || 'N/A'}</div>
            </div>

            <div className="metric-card">
              <div className="metric-header">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3>Maintainability</h3>
              </div>
              <div className="metric-value">{metrics.sqale_rating || 'N/A'}</div>
            </div>

            {metrics.coverage && (
              <div className="metric-card">
                <div className="metric-header">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="22 4 12 14.01 9 11.01" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <h3>Coverage</h3>
                </div>
                <div className="metric-value">{metrics.coverage}%</div>
              </div>
            )}

            {metrics.duplicated_lines_density && (
              <div className="metric-card">
                <div className="metric-header">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2"/>
                  </svg>
                  <h3>Duplications</h3>
                </div>
                <div className="metric-value">{metrics.duplicated_lines_density}%</div>
              </div>
            )}

            {metrics.ncloc && (
              <div className="metric-card">
                <div className="metric-header">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="16 18 22 12 16 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="8 6 2 12 8 18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <h3>Lines of Code</h3>
                </div>
                <div className="metric-value">{parseInt(metrics.ncloc).toLocaleString()}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}