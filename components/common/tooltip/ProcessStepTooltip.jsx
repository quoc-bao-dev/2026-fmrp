import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * ProcessStepTooltip - Custom Tooltip component sử dụng portal để render ra ngoài container
 * Giúp tooltip luôn hiển thị trên cùng, không bị ảnh hưởng bởi z-index của parent
 *
 * @param {React.ReactNode} children - Nội dung trigger element
 * @param {Array} references - Mảng các reference objects để hiển thị trong tooltip
 * @param {Object} dataLang - Object chứa các text đa ngôn ngữ
 */
const ProcessStepTooltip = ({ children, references, dataLang }) => {
  const triggerRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const calculatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    // Position tooltip ở phía dưới (bottom)
    const top = rect.bottom + scrollY + 8;
    const left = rect.left + scrollX + rect.width / 2;

    setCoords({ top, left });
  };

  const handleMouseEnter = () => {
    calculatePosition();
    setVisible(true);
  };

  const handleMouseLeave = () => {
    setVisible(false);
  };

  useEffect(() => {
    if (visible) {
      calculatePosition();
      const handleScroll = () => calculatePosition();
      const handleResize = () => calculatePosition();

      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [visible]);

  return (
    <>
      <div ref={triggerRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className='w-full h-full'>
        {children}
      </div>

      {mounted &&
        visible &&
        createPortal(
          <div
            className='fixed z-[999999] pointer-events-none'
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: 'translateX(-50%)',
            }}
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
          >
            <div className='relative'>
              {/* Arrow */}
              <div className='absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-x-[8px] border-x-transparent border-b-[8px] border-b-black' />
              {/* Tooltip content */}
              <div className='bg-black text-white text-xs font-medium p-2 rounded-lg shadow-lg max-w-[250px]'>
                <div className={`space-y-1.5 ${references?.length > 5 ? 'max-h-[200px] overflow-y-auto' : ''}`}>
                  {references?.map((ref, refIndex) => (
                    <div key={refIndex} className='text-xs font-medium whitespace-nowrap'>
                      {ref?.reference_no || ''}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default ProcessStepTooltip;
