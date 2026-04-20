import { Stethoscope } from 'lucide-react';
import styles from './DoctorsPageHeader.module.css';

const DoctorsPageHeader = () => {
  return (
    <header className={styles.header}>
      <div className={styles.iconWrap}>
        <Stethoscope size={20} />
      </div>
      <div>
        <h1 className={styles.title}>Find Doctors</h1>
        <p className={styles.subtitle}>
          Browse hospital doctors and book appointments based on specialization and availability.
        </p>
      </div>
    </header>
  );
};

export default DoctorsPageHeader;
