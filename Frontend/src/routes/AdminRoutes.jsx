import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import AdminDashboard from '../pages/admin/AdminDashboard';
import DoctorApplications from '../pages/admin/DoctorApplications';
import LabApplications from '../pages/admin/LabApplications';
import Doctors from '../pages/admin/Doctors';
import Labs from '../pages/admin/Labs';
import Appointments from '../pages/admin/Appointments';
import Diagnostics from '../pages/admin/Diagnostics';
import Prescriptions from '../pages/admin/Prescriptions';
import Users from '../pages/admin/Users';
import Notifications from '../pages/admin/Notifications';
import Analytics from '../pages/admin/Analytics';
import Settings from '../pages/admin/Settings';

const AdminRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="doctor-applications" element={<DoctorApplications />} />
      <Route path="lab-applications" element={<LabApplications />} />
      <Route path="doctors" element={<Doctors />} />
      <Route path="labs" element={<Labs />} />
      <Route path="appointments" element={<Appointments />} />
      <Route path="diagnostics" element={<Diagnostics />} />
      <Route path="prescriptions" element={<Prescriptions />} />
      <Route path="users" element={<Users />} />
      <Route path="notifications" element={<Notifications />} />
      <Route path="analytics" element={<Analytics />} />
      <Route path="settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
