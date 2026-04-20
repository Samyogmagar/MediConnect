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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import styles from './Sidebar.module.css';

const navSections = [
  {
    title: 'Overview',
    links: [
      { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
      { to: '/admin/notifications', icon: Bell, label: 'Notifications', hasBadge: true },
    ],
  },
  {
    title: 'Management',
    links: [
      { to: '/admin/users', icon: Users, label: 'User Management' },
      { to: '/admin/doctors', icon: ClipboardList, label: 'Doctors' },
      { to: '/admin/labs', icon: FlaskConical, label: 'Lab Staff' },
    ],
  },
  {
    title: 'Clinical',
    links: [
      { to: '/admin/appointments', icon: CalendarCheck, label: 'Appointments' },
      { to: '/admin/diagnostics', icon: Activity, label: 'Diagnostics & Reports' },
      { to: '/admin/prescriptions', icon: Pill, label: 'Prescriptions' },
    ],
  },
  {
    title: 'Verification',
    links: [
      { to: '/admin/doctor-applications', icon: FileText, label: 'Doctor Verifications' },
      { to: '/admin/lab-applications', icon: FileText, label: 'Lab Verifications' },
      { to: '/admin/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

const Sidebar = ({
  unreadCount = 0,
  collapsed = false,
  onToggleCollapse,
  sidebarWidth = 240,
  onResizeHandleMouseDown,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleNavAction = () => {
    if (mobileOpen && onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleLogout = async () => {
    await logout();
    handleNavAction();
    navigate('/login');
  };

  return (
    <aside
      className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''} ${mobileOpen ? styles.mobileOpen : ''}`}
      style={{ '--sidebar-width': `${sidebarWidth}px` }}
    >
      <nav className={styles.nav}>
        {navSections.map((section) => (
          <div className={styles.navSection} key={section.title}>
            {!collapsed && <p className={styles.navSectionTitle}>{section.title}</p>}
            <div className={styles.navSectionList}>
              {section.links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.active : ''}`
                  }
                  title={collapsed ? link.label : ''}
                  onClick={handleNavAction}
                >
                  <link.icon size={20} />
                  {!collapsed && <span>{link.label}</span>}
                  {link.hasBadge && unreadCount > 0 && (
                    <span className={styles.badge}>{unreadCount}</span>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className={styles.bottom}>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      <button
        className={styles.collapseBtn}
        onClick={onToggleCollapse}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {!collapsed && (
        <div
          className={styles.resizeHandle}
          onMouseDown={onResizeHandleMouseDown}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize sidebar"
        />
      )}
    </aside>
  );
};

export default Sidebar;
