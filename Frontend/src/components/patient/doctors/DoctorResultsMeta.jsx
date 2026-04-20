import styles from './DoctorResultsMeta.module.css';

const DoctorResultsMeta = ({ count, total, activeFilters }) => {
  return (
    <section className={styles.metaWrap}>
      <div className={styles.countBlock}>
        <p className={styles.label}>Doctors Found</p>
        <p className={styles.countValue}>
          {count} <span>of {total}</span>
        </p>
      </div>

      <div className={styles.filtersBlock}>
        {activeFilters.length > 0 ? (
          activeFilters.map((item) => (
            <span className={styles.filterTag} key={item}>
              {item}
            </span>
          ))
        ) : (
          <span className={styles.noFilters}>No active filters</span>
        )}
      </div>
    </section>
  );
};

export default DoctorResultsMeta;
