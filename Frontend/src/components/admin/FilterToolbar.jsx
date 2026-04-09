import styles from './FilterToolbar.module.css';

const FilterToolbar = ({
  searchValue = '',
  onSearchChange,
  filters = [],
  actions = [],
  placeholder = 'Search...',
}) => {
  return (
    <div className={styles.toolbar}>
      <div className={styles.left}>
        <input
          className={styles.search}
          type="search"
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
        />
        {filters.map((filter) => (
          <label key={filter.key} className={styles.filter}>
            <span className={styles.filterLabel}>{filter.label}</span>
            <select
              value={filter.value}
              onChange={(e) => filter.onChange?.(e.target.value)}
              className={styles.select}
            >
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
      <div className={styles.actions}>
        {actions.map((action) => (
          <button
            key={action.label}
            className={action.variant === 'primary' ? styles.primaryBtn : styles.secondaryBtn}
            onClick={action.onClick}
            type="button"
          >
            {action.icon}
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterToolbar;
