import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import LabDashboard from '../pages/lab/LabDashboard';
import TestRequests from '../pages/lab/TestRequests';
import AssignedTests from '../pages/lab/AssignedTests';
import UploadReports from '../pages/lab/UploadReports';
import CompletedTests from '../pages/lab/CompletedTests';
import TestManagement from '../pages/lab/TestManagement';
import Notifications from '../pages/lab/Notifications';
import Profile from '../pages/lab/Profile';
import Settings from '../pages/lab/Settings';
import SettingsDebug from '../pages/lab/SettingsDebug';

const LabRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user || user.role !== 'lab') {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="dashboard" element={<LabDashboard />} />
      <Route path="test-requests" element={<TestRequests />} />
      <Route path="assigned-tests" element={<AssignedTests />} />
      <Route path="tests/:id" element={<TestManagement />} />
      <Route path="upload-reports" element={<UploadReports />} />
      <Route path="completed-tests" element={<CompletedTests />} />
      <Route path="notifications" element={<Notifications />} />
      <Route path="profile" element={<Profile />} />
      <Route path="settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/lab/dashboard" replace />} />
    </Routes>
  );
};

export default LabRoutes;
