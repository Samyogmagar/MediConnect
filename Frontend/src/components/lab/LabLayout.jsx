import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Upload,
  CheckCircle2,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Heart,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import notificationService from '../../services/notificationService';
import styles from './LabLayout.module.css';

const LabLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationService.getUnreadCount();
      setUnreadCount(res.data?.count ?? 0);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUnreadCount();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/lab/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/lab/test-requests', icon: FileText, label: 'Test Requests' },
    { to: '/lab/assigned-tests', icon: ClipboardList, label: 'Assigned Tests' },
    { to: '/lab/upload-reports', icon: Upload, label: 'Upload Reports' },
    { to: '/lab/completed-tests', icon: CheckCircle2, label: 'Reports' },
    { to: '/lab/notifications', icon: Bell, label: 'Notifications', badge: unreadCount },
  ];

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.collapsed : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>
            <Heart size={24} className={styles.logoIcon} />
            {!sidebarCollapsed && <span className={styles.logoText}>MediConnect</span>}
            <span className={styles.logoBadge}>Laboratory</span>
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
              {link.badge > 0 && (
                <span className={styles.navBadge}>{link.badge}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <NavLink
            to="/lab/settings"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ''}`
            }
            title="Settings"
          >
            <Settings size={20} />
            {!sidebarCollapsed && <span>Settings</span>}
          </NavLink>
          <button
            className={`${styles.navLink} ${styles.logoutBtn}`}
            onClick={handleLogout}
            title="Logout"
          >
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
            <h2 className={styles.greeting}>{user?.professionalDetails?.labName || user?.name}</h2>
            {user?.address?.city && (
              <span className={styles.labLocation}>{user.address.city}</span>
            )}
          </div>
          <div className={styles.navbarRight}>
            <NavLink to="/lab/notifications" className={styles.notifBtn} title="Notifications">
              <Bell size={20} />
              {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}
            </NavLink>

            <div className={styles.userMenu}>
              <button
                className={styles.userBtn}
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className={styles.userAvatar}>
                  {user?.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt={user.name} />
                  ) : (
                    <span>{user?.name?.charAt(0)}</span>
                  )}
                </div>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{user?.professionalDetails?.labName || user?.name}</span>
                  <span className={styles.userSubtext}>{user?.address?.city ? `${user.address.city} Lab Center` : 'Lab Center'}</span>
                </div>
              </button>

              {showUserMenu && (
                <div className={styles.dropdown}>
                  <NavLink to="/lab/settings" className={styles.dropdownItem} onClick={() => setShowUserMenu(false)}>
                    <Settings size={16} /> Settings
                  </NavLink>
                  <button className={styles.dropdownItem} onClick={handleLogout}>
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

export default LabLayout;
