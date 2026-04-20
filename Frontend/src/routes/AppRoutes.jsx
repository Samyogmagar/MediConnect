import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home';
import About from '../pages/About';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import OAuthCallback from '../pages/auth/OAuthCallback';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import PatientRoutes from './PatientRoutes';
import AdminRoutes from './AdminRoutes';
import DoctorRoutes from './DoctorRoutes';
import LabRoutes from './LabRoutes';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/auth/oauth/callback/:provider" element={<OAuthCallback />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/patient/*" element={<PatientRoutes />} />
      <Route path="/doctor/*" element={<DoctorRoutes />} />
      <Route path="/lab/*" element={<LabRoutes />} />
      <Route path="/admin/*" element={<AdminRoutes />} />
      {/* Catch-all — redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
