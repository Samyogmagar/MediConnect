import { Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import styles from './DoctorSearchToolbar.module.css';

const DoctorSearchToolbar = ({
  searchQuery,
  onSearchChange,
  specializations,
  specialization,
  onSpecializationChange,
  availabilityFilter,
  onAvailabilityFilterChange,
  sortBy,
  onSortChange,
  hasActiveFilters,
  onClearFilters,
}) => {
  return (
    <section className={styles.toolbar}>
      <div className={styles.searchBox}>
        <Search size={18} className={styles.searchIcon} />
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search doctor name, specialization, or department"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className={styles.controlsWrap}>
        <label className={styles.controlLabel}>
          <span>
            <SlidersHorizontal size={14} /> Specialization
          </span>
          <select
            className={styles.select}
            value={specialization}
            onChange={(e) => onSpecializationChange(e.target.value)}
          >
            <option value="">All Specializations</option>
            {specializations.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.controlLabel}>
          <span>Availability</span>
          <select
            className={styles.select}
            value={availabilityFilter}
            onChange={(e) => onAvailabilityFilterChange(e.target.value)}
          >
            <option value="all">All Availability</option>
            <option value="available_today">Available Today</option>
            <option value="bookable">Any Upcoming Slots</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </label>

        <label className={styles.controlLabel}>
          <span>Sort By</span>
          <select className={styles.select} value={sortBy} onChange={(e) => onSortChange(e.target.value)}>
            <option value="recommended">Recommended</option>
            <option value="experience_high">Most Experience</option>
            <option value="fee_low">Lowest Fee</option>
            <option value="fee_high">Highest Fee</option>
            <option value="name_az">Name (A-Z)</option>
          </select>
        </label>

        <button
          type="button"
          className={styles.clearBtn}
          disabled={!hasActiveFilters}
          onClick={onClearFilters}
        >
          <RotateCcw size={14} />
          Clear
        </button>
      </div>
    </section>
  );
};

export default DoctorSearchToolbar;
