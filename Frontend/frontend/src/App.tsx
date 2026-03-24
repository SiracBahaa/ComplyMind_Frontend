import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import EmailVerification from './pages/auth/EmailVerification';
import ResetPassword from './pages/auth/ResetPassword';  // ← YENİ

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<EmailVerification />} />  {/* ← YENİ */}
        <Route path="/" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />  {/* ← YENİ */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;