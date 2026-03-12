import React, { useState } from 'react';

// Simple deterministic color palette
const COLORS = ['#F97316', '#0EA5E9', '#10B981', '#7C3AED', '#EF4444', '#F59E0B'];

const stringToColor = (str) => {
  if (!str) return COLORS[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
};

const initialsFromName = (name) => {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
};

const Avatar = ({ src, name, size = 40, className = '' }) => {
  const [errored, setErrored] = useState(false);

  const showImage = src && !errored;
  const bg = stringToColor(name || '');
  const initials = initialsFromName(name || '');

  const imgStyle = {
    width: size,
    height: size,
    borderRadius: '50%',
    objectFit: 'cover',
    display: 'block'
  };

  const circleStyle = {
    width: size,
    height: size,
    borderRadius: '50%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: bg,
    color: '#fff',
    fontWeight: 600,
    fontSize: Math.max(12, Math.floor(size / 2.8))
  };

  return (
    <div className={className} style={{ width: size, height: size }}>
      {showImage ? (
        // eslint-disable-next-line jsx-a11y/img-redundant-alt
        <img
          src={src}
          alt={name || 'avatar'}
          style={imgStyle}
          onError={() => setErrored(true)}
        />
      ) : (
        <div style={circleStyle} aria-hidden>
          {initials}
        </div>
      )}
    </div>
  );
};

export default Avatar;
