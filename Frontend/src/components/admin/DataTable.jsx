import styles from './DataTable.module.css';

/**
 * Reusable data table for admin pages
 * @param {Array} columns - [{ key, label, render? }]
 * @param {Array} rows - data array
 * @param {Function} onRowAction - (row, action) callback
 * @param {string} emptyMessage
 * @param {boolean} loading
 */
const DataTable = ({ columns = [], rows = [], emptyMessage = 'No data found', loading = false }) => {
  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={styles.th}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={styles.empty}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, idx) => (
              <tr key={row._id || row.id || idx} className={styles.row}>
                {columns.map((col) => (
                  <td key={col.key} className={styles.td}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
