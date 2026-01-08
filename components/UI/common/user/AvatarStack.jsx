import React from 'react';
import Avatar from './Avatar';

const SIZE_MAP = {
  sm: 24,
  md: 32,
  lg: 40,
};

export default function AvatarStack({ items = [], max = 3, size = 'md', overlap = 0.35, showNames = false, tooltip = true, counterPlacement = 'end', ring = true, className = '' }) {
  const count = items.length;
  const px = SIZE_MAP[size] || SIZE_MAP.md;
  const spacing = Math.floor(px * overlap);

  if (count === 0) return null;

  if (count === 1 && showNames) {
    const user = items[0];
    return (
      <div
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'rgba(59,130,246,0.08)',
          border: '1px solid rgba(59,130,246,0.25)',
          padding: '6px 10px 6px 6px',
          borderRadius: 9999,
        }}
      >
        <Avatar src={user.src} alt={user.name} name={user.name} size={size} ring={ring} tooltip={tooltip} />
        <span
          style={{
            fontWeight: 600,
            color: '#111827',
            whiteSpace: 'nowrap',
          }}
          title={tooltip ? user.name : undefined}
        >
          {user.name}
        </span>
      </div>
    );
  }

  const cap = Math.max(0, max);
  const visible = cap > 0 ? items.slice(0, cap) : [];
  const rest = Math.max(0, count - visible.length);
  const order = counterPlacement === 'start' ? ['counter', ...visible] : [...visible, 'counter'];

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'rgba(59,130,246,0.08)',
        border: '1px solid rgba(59,130,246,0.25)',
        padding: 6,
        borderRadius: 9999,
      }}
    >
      <div style={{ display: 'inline-flex', position: 'relative', paddingLeft: 0 }}>
        {order.map((entry, idx) => {
          if (entry === 'counter') {
            if (rest <= 0) return null;
            return (
              <div
                key='more-counter'
                style={{
                  marginLeft: idx === 0 ? 0 : -spacing,
                  zIndex: 1,
                }}
              >
                <CounterAvatar value={rest} size={size} ring={ring} />
              </div>
            );
          }

          const user = entry;
          const isFirst = idx === 0 || (idx === 1 && order[0] === 'counter');
          return (
            <div
              key={user.id || idx}
              style={{
                marginLeft: isFirst ? 0 : -spacing,
                zIndex: idx + 2,
              }}
            >
              <Avatar src={user.src} alt={user.name} name={user.name} size={size} ring={ring} tooltip={tooltip} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CounterAvatar({ value, size = 'md', ring = true }) {
  const px = SIZE_MAP[size] || SIZE_MAP.md;
  return (
    <div
      title={`+${value} more`}
      aria-label={`+${value} more`}
      style={{
        width: px,
        height: px,
        borderRadius: px,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E5E7EB',
        color: '#374151',
        fontWeight: 700,
        fontSize: Math.max(10, Math.floor(px * 0.45)),
        border: ring ? '2px solid #fff' : 'none',
        boxShadow: ring ? '0 0 0 1px rgba(59,130,246,0.5)' : 'none',
      }}
    >
      +{value}
    </div>
  );
}
