import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  FlaskConical,
  CalendarCheck,
  Activity,
  Pill,
  Users,
  Bell,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import styles from './Sidebar.module.css';

const navLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/users', icon: Users, label: 'User Management' },
  { to: '/admin/doctors', icon: ClipboardList, label: 'Doctors' },
  { to: '/admin/labs', icon: FlaskConical, label: 'Lab Staff' },
  { to: '/admin/appointments', icon: CalendarCheck, label: 'Appointments' },
  { to: '/admin/diagnostics', icon: Activity, label: 'Diagnostics & Reports' },
  { to: '/admin/prescriptions', icon: Pill, label: 'Prescriptions' },
  { to: '/admin/doctor-applications', icon: FileText, label: 'Doctor Verifications' },
  { to: '/admin/lab-applications', icon: FileText, label: 'Lab Verifications' },
  { to: '/admin/notifications', icon: Bell, label: 'Notifications', hasBadge: true },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
];

const Sidebar = ({ unreadCount = 0 }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <link.icon size={20} />
            <span>{link.label}</span>
            {link.hasBadge && unreadCount > 0 && (
              <span className={styles.badge}>{unreadCount}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className={styles.bottom}>
        <NavLink to="/admin/settings" className={styles.navItem}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
