import React from 'react';

const SIZE_MAP = {
  sm: 24,
  md: 32,
  lg: 40,
};

function getInitial(name) {
  if (!name) return '?';
  const trimmed = String(name).trim();
  if (!trimmed) return '?';
  return trimmed.charAt(0).toUpperCase();
}

export default function Avatar({ src, alt, name, size = 'md', status, ring = true, className = '', onError, tooltip }) {
  const px = SIZE_MAP[size] || SIZE_MAP.md;
  const wrapperStyle = {
    width: px,
    height: px,
    borderRadius: px,
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#EEF2FF',
    color: '#374151',
    fontSize: Math.max(10, Math.floor(px * 0.45)),
    fontWeight: 600,
    border: ring ? '2px solid #fff' : 'none',
    boxShadow: ring ? '0 0 0 1px rgba(59,130,246,0.5)' : 'none',
  };

  const statusSize = Math.max(6, Math.floor(px * 0.28));

  return (
    <div className={className} style={wrapperStyle} title={tooltip ? name || alt : undefined} aria-label={alt || name}>
      {src ? <img src={src} alt={alt || name || 'avatar'} onError={onError} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>{getInitial(name || alt)}</span>}

      {status ? (
        <span
          aria-hidden
          style={{
            position: 'absolute',
            right: 1,
            bottom: 1,
            width: statusSize,
            height: statusSize,
            borderRadius: statusSize,
            backgroundColor: status === 'online' ? '#22C55E' : status === 'busy' ? '#F59E0B' : '#9CA3AF',
            outline: '2px solid #fff',
          }}
        />
      ) : null}
    </div>
  );
}
