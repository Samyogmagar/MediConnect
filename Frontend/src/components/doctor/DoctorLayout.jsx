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
  User,
  Heart,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useSidebarResize from '../../hooks/useSidebarResize';
import notificationService from '../../services/notificationService';
import NotificationDropdown from '../common/NotificationDropdown';
import styles from './DoctorLayout.module.css';

const DoctorLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { sidebarWidth, onResizeHandleMouseDown } = useSidebarResize({
    minWidth: 220,
    maxWidth: 340,
    defaultWidth: 240,
  });

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

  const navSections = [
    {
      title: 'Practice',
      links: [
        { to: '/doctor/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/doctor/appointments', icon: Calendar, label: 'Appointments' },
        { to: '/doctor/availability', icon: Calendar, label: 'Availability' },
      ],
    },
    {
      title: 'Clinical',
      links: [
        { to: '/doctor/patients', icon: Users, label: 'Patients' },
        { to: '/doctor/prescriptions', icon: Pill, label: 'Prescriptions' },
      ],
    },
    {
      title: 'Account',
      links: [
        { to: '/doctor/profile', icon: User, label: 'Profile' },
        { to: '/doctor/notifications', icon: Bell, label: 'Notifications' },
        { to: '/doctor/settings', icon: Settings, label: 'Settings' },
      ],
    },
  ];

  return (
    <div className={styles.layout} style={{ '--sidebar-width': `${sidebarWidth}px` }}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <Heart size={24} className={styles.logoIcon} />
            {!sidebarCollapsed && <span className={styles.logoText}>MediConnect</span>}
            <span className={styles.logoBadge}>Doctor</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {navSections.map((section) => (
            <div className={styles.navSection} key={section.title}>
              {!sidebarCollapsed && <p className={styles.navSectionTitle}>{section.title}</p>}
              <div className={styles.navSectionList}>
                {section.links.map((link) => (
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
              </div>
            </div>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <button className={`${styles.navLink} ${styles.logoutBtn}`} onClick={handleLogout} title="Logout">
            <LogOut size={20} />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>

        {!sidebarCollapsed && (
          <div
            className={styles.resizeHandle}
            onMouseDown={onResizeHandleMouseDown}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize sidebar"
          />
        )}

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
            <NotificationDropdown
              role="doctor"
              unreadCount={unreadCount}
              onUnreadCountChange={setUnreadCount}
            />

            <div className={styles.userMenu}>
              <button
                className={styles.userBtn}
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className={styles.userAvatar}>
                  {user?.profileImageUrl || user?.profilePicture ? (
                    <img src={user.profileImageUrl || user.profilePicture} alt={user.name} />
                  ) : (
                    <span>{user?.name?.charAt(0)}</span>
                  )}
                </div>
                <span className={styles.userName}>{user?.name}</span>
              </button>

              {showUserMenu && (
                <div className={styles.dropdown}>
                  <button onClick={() => navigate('/doctor/profile')}>
                    <User size={16} /> Profile
                  </button>
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
