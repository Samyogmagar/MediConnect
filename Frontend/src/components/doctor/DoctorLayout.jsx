import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Pill,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import notificationService from '../../services/notificationService';
import styles from './DoctorLayout.module.css';

const DoctorLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationService.getUnreadCount();
      setUnreadCount(res.data?.count ?? res.data?.unreadCount ?? 0);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUnreadCount();
  }, [location.pathname]);

  useEffect(() => {
    const onRefresh = () => fetchUnreadCount();
    window.addEventListener('notifications:refresh', onRefresh);

    const intervalId = setInterval(fetchUnreadCount, 30000);

    return () => {
      window.removeEventListener('notifications:refresh', onRefresh);
      clearInterval(intervalId);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/doctor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/doctor/appointments', icon: Calendar, label: 'Appointments' },
    { to: '/doctor/availability', icon: Calendar, label: 'Availability' },
    { to: '/doctor/patients', icon: Users, label: 'Patients' },
    { to: '/doctor/prescriptions', icon: Pill, label: 'Prescriptions' },
    { to: '/doctor/notifications', icon: Bell, label: 'Notifications' },
  ];

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            {!sidebarCollapsed && <span className={styles.logoText}>MediConnect</span>}
            <span className={styles.logoBadge}>Doctor</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.active : ''}`
              }
              title={sidebarCollapsed ? link.label : ''}
            >
              <link.icon size={20} />
              {!sidebarCollapsed && <span>{link.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <NavLink 
            to="/doctor/settings"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
            title="Settings"
          >
            <Settings size={20} />
            {!sidebarCollapsed && <span>Settings</span>}
          </NavLink>
          <button className={`${styles.navLink} ${styles.logoutBtn}`} onClick={handleLogout} title="Logout">
            <LogOut size={20} />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>

        <button
          className={styles.collapseBtn}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>

      {/* Main Content */}
      <div className={styles.main}>
        {/* Top Navbar */}
        <header className={styles.navbar}>
          <div className={styles.navbarLeft}>
            <h2 className={styles.greeting}>Welcome, Dr. {user?.name}</h2>
          </div>
          <div className={styles.navbarRight}>
            <button
              className={styles.notifBtn}
              title="Notifications"
              onClick={() => navigate('/doctor/notifications')}
            >
              <Bell size={20} />
              {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
            </button>

            <div className={styles.userMenu}>
              <button
                className={styles.userBtn}
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className={styles.userAvatar}>
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name} />
                  ) : (
                    <span>{user?.name?.charAt(0)}</span>
                  )}
                </div>
                <span className={styles.userName}>{user?.name}</span>
              </button>

              {showUserMenu && (
                <div className={styles.dropdown}>
                  <button onClick={handleLogout}>
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
};

export default DoctorLayout;
