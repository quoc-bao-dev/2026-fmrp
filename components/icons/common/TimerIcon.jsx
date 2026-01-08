'use client';

import React from 'react';

const TimerIcon = ({ size = 24, color = 'currentColor', className = '', ...props }) => {
  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg' className={className} {...props}>
      <path d='M12 19C15.866 19 19 15.866 19 12C19 8.13401 15.866 5 12 5C8.13401 5 5 8.13401 5 12C5 15.866 8.13401 19 12 19Z' stroke={color} strokeWidth='2' />
      <path
        d='M5.96499 3.13574C5.28659 3.31743 4.66799 3.67453 4.17138 4.17114C3.67478 4.66774 3.31768 5.28635 3.13599 5.96474M18.035 3.13574C18.7134 3.31743 19.332 3.67453 19.8286 4.17114C20.3252 4.66774 20.6823 5.28635 20.864 5.96474M12 7.99974V11.7497C12 11.8877 12.112 11.9997 12.25 11.9997H15'
        stroke={color}
        strokeWidth='2'
        strokeLinecap='round'
      />
    </svg>
  );
};

export default TimerIcon;
