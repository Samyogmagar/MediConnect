import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  CalendarCheck,
  FileText,
  Bell,
  Settings,
  LogOut,
  Heart,
  User,
  ChevronDown,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import notificationService from '../../services/notificationService';
import styles from './DashboardLayout.module.css';

const sidebarLinks = [
  { to: '/patient/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/patient/doctors', icon: Search, label: 'Find Doctors' },
  { to: '/patient/appointments', icon: CalendarCheck, label: 'My Appointments' },
  { to: '/patient/records', icon: FileText, label: 'Medical Records' },
  { to: '/patient/notifications', icon: Bell, label: 'Notifications' },
];

const DashboardLayout = ({ children, unreadCount = 0 }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [liveUnreadCount, setLiveUnreadCount] = useState(unreadCount);
  const dropdownRef = useRef(null);

  const refreshUnreadCount = async () => {
    try {
      const res = await notificationService.getUnreadCount();
      setLiveUnreadCount(res.data?.count ?? res.data?.unreadCount ?? 0);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setLiveUnreadCount(unreadCount);
  }, [unreadCount]);

  useEffect(() => {
    refreshUnreadCount();
  }, [location.pathname]);

  useEffect(() => {
    const onRefresh = () => refreshUnreadCount();
    window.addEventListener('notifications:refresh', onRefresh);

    const intervalId = setInterval(refreshUnreadCount, 30000);

    return () => {
      window.removeEventListener('notifications:refresh', onRefresh);
      clearInterval(intervalId);
    };
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <div className={styles.layout}>
      {/* Top navbar */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <Heart className={styles.brandIcon} />
          <span className={styles.brandText}>MediConnect</span>
        </div>
        <div className={styles.topbarRight}>
          <button
            className={styles.notifBtn}
            onClick={() => navigate('/patient/notifications')}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {liveUnreadCount > 0 && (
              <span className={styles.notifBadge}>{liveUnreadCount}</span>
            )}
          </button>
          <div className={styles.userDropdown} ref={dropdownRef}>
            <button
              className={styles.userToggle}
              onClick={() => setDropdownOpen((p) => !p)}
            >
              <div className={styles.avatar}>
                {user?.profileImageUrl ? (
                  <img src={user.profileImageUrl} alt="" className={styles.avatarImg} />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>
              <span className={styles.userName}>{user?.name || 'User'}</span>
              <ChevronDown size={16} className={`${styles.chevron} ${dropdownOpen ? styles.chevronOpen : ''}`} />
            </button>
            {dropdownOpen && (
              <div className={styles.dropdownMenu}>
                <button
                  className={styles.dropdownItem}
                  onClick={() => { setDropdownOpen(false); navigate('/patient/profile'); }}
                >
                  <User size={16} />
                  <span>Profile</span>
                </button>
                <button className={styles.dropdownItem} onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className={styles.body}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <nav className={styles.nav}>
            {sidebarLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.active : ''}`
                }
              >
                <link.icon size={20} />
                <span>{link.label}</span>
                {link.label === 'Notifications' && liveUnreadCount > 0 && (
                  <span className={styles.sidebarBadge}>{liveUnreadCount}</span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className={styles.sidebarBottom}>
            <NavLink
              to="/patient/settings"
              className={styles.navItem}
            >
              <Settings size={20} />
              <span>Settings</span>
            </NavLink>
            <button className={styles.logoutBtn} onClick={handleLogout}>
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
