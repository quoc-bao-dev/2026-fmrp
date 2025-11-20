import React from 'react';

const ProgressCollapseArrowIcon = ({ width = 20, height = 14, className = '', stroke = '#696969', ...props }) => {
  return (
    <svg width={width} height={height} viewBox='0 0 20 14' fill='none' xmlns='http://www.w3.org/2000/svg' className={className} {...props}>
      <path d='M0.799805 9.71826L9.65837 0.858608C9.73648 0.780492 9.86313 0.780492 9.94123 0.858608L18.7998 9.71826' stroke={stroke} strokeWidth='1.6' strokeLinecap='round' />
      <path d='M3.79883 12.7173L9.6574 6.858C9.73551 6.77988 9.86215 6.77988 9.94026 6.858L15.7988 12.7173' stroke={stroke} strokeLinecap='round' />
    </svg>
  );
};

export default ProgressCollapseArrowIcon;
