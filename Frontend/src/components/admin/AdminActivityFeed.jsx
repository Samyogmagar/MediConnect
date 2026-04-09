import { Calendar, FileText, FlaskConical, UserPlus, Pill } from 'lucide-react';
import StatusBadge from './StatusBadge';
import styles from './AdminActivityFeed.module.css';

const iconMap = {
  appointment: Calendar,
  diagnostic: FlaskConical,
  prescription: Pill,
  registration: UserPlus,
  report: FileText,
};

const AdminActivityFeed = ({ items = [] }) => {
  if (items.length === 0) {
    return <div className={styles.empty}>No activity yet</div>;
  }

  return (
    <div className={styles.list}>
      {items.map((item) => {
        const Icon = iconMap[item.type] || FileText;
        return (
          <div key={item.id} className={styles.item}>
            <div className={styles.iconWrap}>
              <Icon size={16} />
            </div>
            <div className={styles.content}>
              <div className={styles.titleRow}>
                <span className={styles.title}>{item.title}</span>
                {item.status && <StatusBadge status={item.status} />}
              </div>
              <span className={styles.meta}>{item.meta}</span>
            </div>
            <span className={styles.time}>{item.time}</span>
          </div>
        );
      })}
    </div>
  );
};

export default AdminActivityFeed;
