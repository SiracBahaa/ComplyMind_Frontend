import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import EmailVerification from './pages/auth/Email/EmailVerification';
import EmailVerified from './pages/auth/Email/EmailVerified';
import VerifyEmailHandler from './pages/auth/Email/VerifyEmailHandler';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import GitHubCallback from './pages/auth/GitHubCallback';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/auth/verify-email" element={<VerifyEmailHandler />} />  {/* token işler → email-verified'a yönlendirir */}
        <Route path="/auth/email-verified" element={<EmailVerified />} />     {/* sonuç ekranı */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/auth/oauth-callback" element={<GitHubCallback />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;