import { useState } from 'react';
import './TriggerAnalysis.css';

interface Repository {
  id: number;
  name: string;
  full_name: string;
}

interface TriggerAnalysisProps {
  repo: Repository | null;
  isPublic: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TriggerAnalysis({ repo, isPublic, onClose, onSuccess }: TriggerAnalysisProps) {
  const [publicUrl, setPublicUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const endpoint = isPublic 
        ? '/analysis/trigger/public'
        : '/analysis/trigger/installed';

      const body = isPublic
        ? { repo_url: publicUrl }
        : { repo_full_name: repo?.full_name };

      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Analiz başlatılamadı');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {isPublic ? 'Public Repo Analizi' : 'Repo Analizi'}
          </h2>
          <button onClick={onClose} className="modal-close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round"/>
              <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {isPublic ? (
            <div className="form-group">
              <label htmlFor="repo-url">Repository URL</label>
              <input
                type="url"
                id="repo-url"
                value={publicUrl}
                onChange={(e) => setPublicUrl(e.target.value)}
                placeholder="https://github.com/username/repo"
                required
                className="form-input"
              />
              <p className="form-help">
                Public GitHub repository URL'sini girin
              </p>
            </div>
          ) : (
            <div className="repo-preview">
              <div className="repo-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 className="repo-name">{repo?.name}</h3>
                <p className="repo-full-name">{repo?.full_name}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="error-message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round"/>
                <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          <div className="analysis-info">
            <h4>Analiz kapsamı:</h4>
            <ul>
              <li>Güvenlik açıkları (OWASP Top 10)</li>
              <li>Kod kalitesi ve maintainability</li>
              <li>Teknik borç analizi</li>
              <li>Best practice kontrolleri</li>
            </ul>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="button-secondary"
              disabled={isSubmitting}
            >
              İptal
            </button>
            <button
              type="submit"
              className="button-primary"
              disabled={isSubmitting || (isPublic && !publicUrl)}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-small"></span>
                  Başlatılıyor...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                    <polyline points="10 8 14 12 10 16" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Analizi Başlat
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}