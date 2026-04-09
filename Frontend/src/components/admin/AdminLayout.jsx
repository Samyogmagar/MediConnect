import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronDown } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Sidebar from './Sidebar';
import notificationService from '../../services/notificationService';
import styles from './AdminLayout.module.css';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

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
    <div className={styles.layout}>
      {/* Top bar */}
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <div className={styles.logo}>
            <svg viewBox="0 0 24 24" className={styles.logoIcon} fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <span className={styles.brandName}>MediConnect</span>
          <span className={styles.roleBadge}>Super Admin</span>
        </div>

        <div className={styles.topbarRight}>
          <button
            className={styles.notifBtn}
            onClick={() => navigate('/admin/notifications')}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className={styles.notifBadge}>{unreadCount}</span>
            )}
          </button>

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
        <Sidebar unreadCount={unreadCount} />
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
