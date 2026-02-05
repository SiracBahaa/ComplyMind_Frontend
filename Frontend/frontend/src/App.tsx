import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// TROUBLESHOOTING.md yapısına göre importlar:
import Login from './pages/auth/Login/Login';
import Signup from './pages/auth/Signup/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;