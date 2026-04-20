import { useEffect, useMemo, useState } from 'react';
import { resolveAssetUrl } from '../../../utils/assetUrl.util';
import styles from './UserAvatar.module.css';

const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const UserAvatar = ({
  src,
  name,
  alt,
  size = 'md',
  shape = 'circle',
  className = '',
  imageClassName = '',
  fallbackClassName = '',
  status,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  const resolvedSrc = useMemo(() => resolveAssetUrl(src), [src]);
  const initials = useMemo(() => getInitials(name), [name]);

  useEffect(() => {
    setImageFailed(false);
  }, [resolvedSrc]);

  const sizeClass = styles[`size${String(size).charAt(0).toUpperCase()}${String(size).slice(1)}`] || '';
  const shapeClass = shape === 'rounded' ? styles.shapeRounded : styles.shapeCircle;

  return (
    <div className={`${styles.root} ${sizeClass} ${shapeClass} ${className}`.trim()}>
      {resolvedSrc && !imageFailed ? (
        <img
          src={resolvedSrc}
          alt={alt || `${name || 'User'} avatar`}
          className={`${styles.image} ${imageClassName}`.trim()}
          onError={() => setImageFailed(true)}
          loading="lazy"
        />
      ) : (
        <span className={`${styles.fallback} ${fallbackClassName}`.trim()}>{initials}</span>
      )}

      {status && <span className={`${styles.statusDot} ${styles[`status${status}`] || ''}`.trim()} aria-hidden="true" />}
    </div>
  );
};

export default UserAvatar;
