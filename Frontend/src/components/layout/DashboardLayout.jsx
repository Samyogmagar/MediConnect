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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useSidebarResize from '../../hooks/useSidebarResize';
import notificationService from '../../services/notificationService';
import NotificationDropdown from '../common/NotificationDropdown';
import styles from './DashboardLayout.module.css';

const navSections = [
  {
    title: 'Care',
    links: [
      { to: '/patient/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/patient/doctors', icon: Search, label: 'Find Doctors' },
      { to: '/patient/appointments', icon: CalendarCheck, label: 'My Appointments' },
      { to: '/patient/records', icon: FileText, label: 'Medical Records' },
      { to: '/patient/notifications', icon: Bell, label: 'Notifications' },
    ],
  },
  {
    title: 'Account',
    links: [
      { to: '/patient/profile', icon: User, label: 'Profile' },
      { to: '/patient/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

const DashboardLayout = ({ children, unreadCount = 0 }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [liveUnreadCount, setLiveUnreadCount] = useState(unreadCount);
  const { sidebarWidth, onResizeHandleMouseDown } = useSidebarResize({
    minWidth: 220,
    maxWidth: 340,
    defaultWidth: 240,
  });
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
    <div className={styles.layout} style={{ '--sidebar-width': `${sidebarWidth}px` }}>
      {/* Top navbar */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <Heart className={styles.brandIcon} />
          <span className={styles.brandText}>MediConnect</span>
        </div>
        <div className={styles.topbarRight}>
          <NotificationDropdown
            role="patient"
            unreadCount={liveUnreadCount}
            onUnreadCountChange={setLiveUnreadCount}
          />
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
        <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ''}`}>
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
                        `${styles.navItem} ${isActive ? styles.active : ''}`
                      }
                      title={sidebarCollapsed ? link.label : ''}
                    >
                      <link.icon size={20} />
                      {!sidebarCollapsed && <span>{link.label}</span>}
                      {link.label === 'Notifications' && liveUnreadCount > 0 && (
                        <span className={styles.sidebarBadge}>{liveUnreadCount}</span>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className={styles.sidebarBottom}>
            <button className={styles.logoutBtn} onClick={handleLogout}>
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
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </aside>

        {/* Main content */}
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
