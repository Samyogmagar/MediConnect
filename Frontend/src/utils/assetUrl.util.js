const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const getApiOrigin = () => {
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return 'http://localhost:5000';
  }
};

export const resolveAssetUrl = (source) => {
  if (!source || typeof source !== 'string') return '';

  if (source.startsWith('data:') || source.startsWith('blob:')) {
    return source;
  }

  if (source.startsWith('http://') || source.startsWith('https://')) {
    try {
      const parsed = new URL(source);

      // Uploaded files should always be served by this backend origin,
      // even if older records store a stale absolute host.
      if (parsed.pathname.startsWith('/uploads/')) {
        return `${getApiOrigin()}${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
    } catch {
      return source;
    }

    return source;
  }

  if (source.startsWith('/')) {
    return `${getApiOrigin()}${source}`;
  }

  return `${getApiOrigin()}/${source}`;
};
