import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Heart, Menu } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useSidebarResize from '../../hooks/useSidebarResize';
import Sidebar from './Sidebar';
import notificationService from '../../services/notificationService';
import NotificationDropdown from '../common/NotificationDropdown';
import styles from './AdminLayout.module.css';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { sidebarWidth, onResizeHandleMouseDown } = useSidebarResize({
    minWidth: 220,
    maxWidth: 340,
    defaultWidth: 240,
  });

  const fetchUnread = async () => {
    try {
      const res = await notificationService.getUnreadCount();
      setUnreadCount(res.data?.count ?? res.data?.unreadCount ?? 0);
    } catch {
      /* silent */
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUnread();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className={styles.layout} style={{ '--sidebar-width': `${sidebarWidth}px` }}>
      {/* Top bar */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setMobileSidebarOpen((prev) => !prev)}
            aria-label="Toggle sidebar"
          >
            <Menu size={18} />
          </button>

          <div className={styles.logo}>
            <Heart className={styles.logoIcon} />
          </div>
          <span className={styles.brandName}>MediConnect</span>
          <span className={styles.roleBadge}>Super Admin</span>
        </div>

        <div className={styles.topbarRight}>
          <NotificationDropdown
            role="admin"
            unreadCount={unreadCount}
            onUnreadCountChange={setUnreadCount}
          />

          <div className={styles.userSection}>
            <button
              className={styles.userBtn}
              onClick={() => setShowUserMenu((v) => !v)}
            >
              <div className={styles.avatar}>
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <span className={styles.userName}>{user?.name || 'Admin User'}</span>
              <ChevronDown size={14} />
            </button>
            {showUserMenu && (
              <div className={styles.dropdown}>
                <button onClick={handleLogout} className={styles.dropdownItem}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className={styles.body}>
        {mobileSidebarOpen && (
          <button
            className={styles.mobileBackdrop}
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        )}

        <Sidebar
          unreadCount={unreadCount}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
          sidebarWidth={sidebarWidth}
          onResizeHandleMouseDown={onResizeHandleMouseDown}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />
        <main className={`${styles.main} ${sidebarCollapsed ? styles.mainCollapsed : ''}`}>{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
