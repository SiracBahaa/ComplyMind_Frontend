import { useState } from 'react';
import './TriggerAnalysis.css';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
}

interface TriggerAnalysisProps {
  repos: Repository[];
  onClose: () => void;
  onTrigger: (repoFullName: string) => Promise<void>;
}

export default function TriggerAnalysis({ repos, onClose, onTrigger }: TriggerAnalysisProps) {
  const [mode, setMode] = useState<'installed' | 'public'>('installed');
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [publicRepoUrl, setPublicRepoUrl] = useState<string>('');
  const [isTriggering, setIsTriggering] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'installed' && !selectedRepo) {
      alert('Lütfen bir repo seçin');
      return;
    }

    if (mode === 'public' && !publicRepoUrl) {
      alert('Lütfen bir GitHub repo URL\'si girin');
      return;
    }

    setIsTriggering(true);

    try {
      if (mode === 'installed') {
        await onTrigger(selectedRepo);
      } else {
        await onTrigger(publicRepoUrl);
      }
    } catch (err) {
      console.error('Trigger error:', err);
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Yeni Analiz Başlat</h2>
          <button onClick={onClose} className="close-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round" />
              <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="mode-selector">
          <button
            className={`mode-button ${mode === 'installed' ? 'active' : ''}`}
            onClick={() => setMode('installed')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Bağlı Repolar
          </button>
          <button
            className={`mode-button ${mode === 'public' ? 'active' : ''}`}
            onClick={() => setMode('public')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <line x1="2" y1="12" x2="22" y2="12" strokeWidth="2" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" strokeWidth="2" />
            </svg>
            Public Repo
          </button>
        </div>

        <form onSubmit={handleSubmit} className="trigger-form">
          {mode === 'installed' ? (
            <div className="form-group">
              <label htmlFor="repo">Repository</label>
              {repos.length === 0 ? (
                <div className="empty-repos">
                  <p>Henüz bağlı repo yok</p>
                  <p className="hint">Önce GitHub repolarınızı bağlayın</p>
                </div>
              ) : (
                <select
                  id="repo"
                  value={selectedRepo}
                  onChange={(e) => setSelectedRepo(e.target.value)}
                  className="form-select"
                  required
                >
                  <option value="">Repo seçin...</option>
                  {repos.map((repo) => (
                    <option key={repo.id} value={repo.full_name}>
                      {repo.full_name}
                      {repo.private && ' (Private)'}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="url">GitHub Repository URL</label>
              <input
                id="url"
                type="text"
                value={publicRepoUrl}
                onChange={(e) => setPublicRepoUrl(e.target.value)}
                placeholder="https://github.com/owner/repo"
                className="form-input"
                required
              />
              <p className="hint">Public repolar için GitHub URL'si girin</p>
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={onClose}
              className="cancel-button"
              disabled={isTriggering}
            >
              İptal
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isTriggering || (mode === 'installed' && repos.length === 0)}
            >
              {isTriggering ? (
                <>
                  <div className="spinner-small"></div>
                  Başlatılıyor...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
