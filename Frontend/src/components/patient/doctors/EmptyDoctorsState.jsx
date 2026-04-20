import { SearchX } from 'lucide-react';
import Button from '../../common/Button';
import styles from './EmptyDoctorsState.module.css';

const EmptyDoctorsState = ({ hasFilters, onClearFilters }) => {
  return (
    <section className={styles.emptyState}>
      <div className={styles.iconWrap}>
        <SearchX size={24} />
      </div>
      <h3 className={styles.title}>No doctors match your filters</h3>
      <p className={styles.description}>
        Try changing specialization, availability, or search keywords to find available hospital doctors.
      </p>
      {hasFilters && (
        <Button variant="secondary" size="sm" onClick={onClearFilters}>
          Reset Filters
        </Button>
      )}
    </section>
  );
};

export default EmptyDoctorsState;
