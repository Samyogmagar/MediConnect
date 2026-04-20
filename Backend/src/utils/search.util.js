/**
 * Escape user input for safe regex construction.
 */
export const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Build case-insensitive regex from user-provided search text.
 * Returns null for empty input.
 */
export const buildSearchRegex = (search) => {
  const trimmed = String(search || '').trim();
  if (!trimmed) return null;
  return new RegExp(escapeRegex(trimmed), 'i');
};
