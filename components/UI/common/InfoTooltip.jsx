import React, { useState, useRef, useEffect } from 'react';
import { InfoCircle } from 'iconsax-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Component InfoTooltip - Hiển thị tooltip khi click vào icon
 * @param {string | React.ReactNode} content - Nội dung tooltip cần hiển thị
 * @param {string} className - Class name cho icon wrapper
 * @param {object} iconProps - Props cho icon (size, className, etc.)
 * @param {string} position - Vị trí tooltip: 'bottom', 'bottom-center', 'top', 'left', 'right'
 * @param {React.ReactNode} icon - Custom icon component (mặc định là InfoCircle)
 */
const InfoTooltip = ({
  content,
  className = '',
  iconProps = {},
  iconSize = 14, // Default giữ nguyên như cũ để không ảnh hưởng nơi khác
  position = 'bottom-center', // 'bottom', 'bottom-center', 'top', 'left', 'right'
  icon: IconComponent = null, // Custom icon component
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef(null);
  const iconRef = useRef(null);

  // Đóng tooltip khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = event => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target) && iconRef.current && !iconRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Animation variants cho tooltip
  const getAnimationY = () => {
    if (position === 'bottom' || position === 'bottom-center') return 10;
    if (position === 'top') return -10;
    return 0;
  };

  const getAnimationX = () => {
    if (position === 'left') return -10;
    if (position === 'right') return 10;
    return 0;
  };

  const getTransformOrigin = () => {
    if (position === 'bottom' || position === 'bottom-center') return 'top center';
    if (position === 'top') return 'bottom center';
    if (position === 'left') return 'center right';
    if (position === 'right') return 'center left';
    return 'center center';
  };

  const tooltipVariants = {
    hidden: {
      opacity: 0,
      y: getAnimationY(),
      x: getAnimationX(),
      scale: 0.95,
      transformOrigin: getTransformOrigin(),
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transformOrigin: getTransformOrigin(),
      transition: {
        duration: 0.2,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      y: getAnimationY(),
      x: getAnimationX(),
      scale: 0.95,
      transformOrigin: getTransformOrigin(),
      transition: {
        duration: 0.15,
        ease: 'easeIn',
      },
    },
  };

  // Tính toán vị trí tooltip
  const getTooltipPosition = () => {
    const baseClasses = 'absolute z-[99999]';
    switch (position) {
      case 'top':
        // Căn theo trục Y bằng bottom-full, trục X sẽ được div con xử lý bằng translateX
        return `${baseClasses} bottom-full left-1/2 mb-2`;
      case 'left':
        // Căn theo trục X bằng right-full, trục Y sẽ được div con xử lý bằng translateY
        return `${baseClasses} right-full top-1/2 mr-2`;
      case 'right':
        return `${baseClasses} left-full top-1/2 ml-2`;
      case 'bottom':
        return `${baseClasses} top-full left-1/2 mt-3`;
      case 'bottom-center':
      default:
        return `${baseClasses} top-full left-1/2 mt-2`;
    }
  };

  // Tách className từ iconProps để xử lý riêng
  const { className: iconClassName, ...restIconProps } = iconProps || {};

  return (
    <div className={`relative inline-flex items-center justify-center !w-fit ${className}`}>
      <button
        ref={iconRef}
        type='button'
        onClick={e => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className='focus:outline-none -focus:ring-2 -focus:ring-blue-500 -focus:ring-offset-1 rounded-full transition-all'
        aria-label='Thông tin'
      >
        {IconComponent ? (
          IconComponent
        ) : (
          <div
            className={`flex items-center justify-center ${iconClassName || ''}`}
            // style={{ width: iconSize, height: iconSize }}
          >
            <InfoCircle variant='Outline' className={`w-full h-full  text-blue-fmrp transition-colors ${isOpen ? 'text-blue-600' : ''}`} {...restIconProps} />
          </div>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div ref={tooltipRef} initial='hidden' animate='visible' exit='exit' variants={tooltipVariants} className={getTooltipPosition()}>
            <div
              className={`
                                relative
                                ${position === 'bottom' || position === 'bottom-center' || position === 'top' ? '-translate-x-1/2' : ''}
                                ${position === 'left' || position === 'right' ? '-translate-y-1/2' : ''}
                            `}
              style={{
                width: 'max-content',
                maxWidth: '300px',
              }}
            >
              <div className='bg-blue-50 rounded-xl shadow-lg border border-blue-200 p-4 relative'>
                {/* Arrow pointer - nằm ở giữa trên cùng của tooltip */}
                <div
                  className={`absolute w-2.5 h-2.5 bg-blue-50 border-l border-t border-blue-200 ${
                    position === 'bottom' || position === 'bottom-center'
                      ? '-top-[6px] left-1/2 -translate-x-1/2 rotate-45'
                      : position === 'top'
                      ? '-bottom-[6px] left-1/2 -translate-x-1/2 rotate-[225deg]'
                      : position === 'left'
                      ? '-right-[6px] top-1/2 -translate-y-1/2 rotate-[135deg]'
                      : '-left-[6px] top-1/2 -translate-y-1/2 rotate-[-45deg]'
                  }`}
                />

                {/* Content */}
                {typeof content === 'string' ? (
                  <p className='!text-sm !text-blue-900 leading-relaxed whitespace-normal !text-start !font-normal normal-case'>{content}</p>
                ) : (
                  <div className='text-sm text-blue-900 leading-relaxed whitespace-normal text-start font-normal normal-case'>{content}</div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InfoTooltip;
