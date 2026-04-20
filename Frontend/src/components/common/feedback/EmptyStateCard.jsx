import Button from '../Button';
import styles from './EmptyStateCard.module.css';

const EmptyStateCard = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className={styles.card}>
      {Icon ? (
        <div className={styles.iconWrap}>
          <Icon size={22} />
        </div>
      ) : null}
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {actionLabel && onAction ? (
        <Button variant="secondary" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
};

export default EmptyStateCard;
