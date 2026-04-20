import styles from './SkeletonLoader.module.css';

const SkeletonLoader = ({ lines = 3, height = 12 }) => {
  return (
    <div className={styles.stack}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className={styles.line}
          style={{ height: `${height}px`, width: index === lines - 1 ? '72%' : '100%' }}
        />
      ))}
    </div>
  );
};

export default SkeletonLoader;
