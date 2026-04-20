import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import PatientDashboard from '../pages/patient/PatientDashboard';
import DoctorSearch from '../pages/patient/DoctorSearch';
import BookAppointment from '../pages/patient/BookAppointment';
import MyAppointments from '../pages/patient/MyAppointments';
import MedicalRecords from '../pages/patient/MedicalRecords';
import Notifications from '../pages/patient/Notifications';
import Settings from '../pages/patient/Settings';
import Profile from '../pages/patient/Profile';
import DoctorProfile from '../pages/patient/DoctorProfile';

const PatientRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user || user.role !== 'patient') {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="dashboard" element={<PatientDashboard />} />
      <Route path="doctors" element={<DoctorSearch />} />
      <Route path="doctors/:doctorId" element={<DoctorProfile />} />
      <Route path="book/:doctorId" element={<BookAppointment />} />
      <Route path="book-appointment/:doctorId" element={<BookAppointment />} />
      <Route path="appointments" element={<MyAppointments />} />
      <Route path="records" element={<MedicalRecords />} />
      <Route path="notifications" element={<Notifications />} />
      <Route path="settings" element={<Settings />} />
      <Route path="profile" element={<Profile />} />
      <Route path="*" element={<Navigate to="/patient/dashboard" replace />} />
    </Routes>
  );
};

export default PatientRoutes;
