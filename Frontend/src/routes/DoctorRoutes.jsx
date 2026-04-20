import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import DoctorDashboard from '../pages/doctor/DoctorDashboard';
import Appointments from '../pages/doctor/Appointments';
import Patients from '../pages/doctor/Patients';
import MedicalRecords from '../pages/doctor/MedicalRecords';
import Prescriptions from '../pages/doctor/Prescriptions';
import Notifications from '../pages/doctor/Notifications';
import AssignLabTest from '../pages/doctor/AssignLabTest';
import Availability from '../pages/doctor/Availability';
import Settings from '../pages/doctor/Settings';
import Profile from '../pages/doctor/Profile';

const DoctorRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user || user.role !== 'doctor') {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="dashboard" element={<DoctorDashboard />} />
      <Route path="appointments" element={<Appointments />} />
      <Route path="patients" element={<Patients />} />
      <Route path="records" element={<MedicalRecords />} />
      <Route path="prescriptions" element={<Prescriptions />} />
      <Route path="availability" element={<Availability />} />
      <Route path="notifications" element={<Notifications />} />
      <Route path="assign-lab-test" element={<AssignLabTest />} />
      <Route path="settings" element={<Settings />} />
      <Route path="profile" element={<Profile />} />
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
};

export default DoctorRoutes;
