import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import { AnalysisDashboard, AnalysisDetail } from './pages/Analysis';
import EmailVerification from './pages/auth/Email/EmailVerification';
import EmailVerified from './pages/auth/Email/EmailVerified';
import VerifyEmailHandler from './pages/auth/Email/VerifyEmailHandler';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import GitHubCallback from './pages/auth/GitHubCallback';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth sayfaları — layout yok */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/email-verification" element={<EmailVerification />} />
        <Route path="/auth/verify-email" element={<VerifyEmailHandler />} />
        <Route path="/auth/email-verified" element={<EmailVerified />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/oauth-callback" element={<GitHubCallback />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Protected sayfalar — Layout (header + sidebar) ile sarılı */}
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/settings" element={<Layout><Settings /></Layout>} />
        <Route path="/analysis" element={<Layout><AnalysisDashboard /></Layout>} />
        <Route path="/analysis/project/:projectId" element={<Layout><AnalysisDetail /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;