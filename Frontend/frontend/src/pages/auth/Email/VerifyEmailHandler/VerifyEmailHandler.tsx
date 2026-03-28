import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './VerifyEmailHandler.css';

export default function VerifyEmailHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasFetched = useRef(false); // ← key nokta

  useEffect(() => {
    if (hasFetched.current) return; // ← ikinci çalışmayı engelle
    hasFetched.current = true;

    const token = searchParams.get('token');

    if (!token) {
      navigate('/auth/email-verified?error=Token bulunamadı');
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/auth/verify-email?token=${token}`)
      .then(async (res) => {
        if (res.ok) {
          navigate('/auth/email-verified?success=true');
        } else {
          const data = await res.json();
          const msg = data?.message || 'Doğrulama başarısız';
          navigate(`/auth/email-verified?error=${encodeURIComponent(msg)}`);
        }
      })
      .catch(() => {
        navigate('/auth/email-verified?error=Sunucuya bağlanılamadı');
      });
  }, []);

  return (
    <div className="verify-handler-container">
      <div className="verify-handler-card">
        <div className="verify-spinner" />
        <p className="verify-handler-text">Doğrulanıyor...</p>
      </div>
    </div>
  );
}