import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ResponsibleAvatar from './ResponsibleAvatar';

const AvatarStack = ({ people = [], size = 40, className = '' }) => {
  const [hoverId, setHoverId] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const avatarRefs = useRef({});

  if (!people || people.length === 0) return null;

  const visible = people.slice(0, 3);
  const remaining = people.length - visible.length;

  const updateTooltipPosition = personId => {
    const avatarElement = avatarRefs.current[personId];
    if (avatarElement) {
      const rect = avatarElement.getBoundingClientRect();
      setTooltipPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX + rect.width / 2,
      });
    }
  };

  const handleMouseEnter = personId => {
    setHoverId(personId);
    updateTooltipPosition(personId);
  };

  useEffect(() => {
    if (hoverId) {
      updateTooltipPosition(hoverId);
      const handleScroll = () => {
        updateTooltipPosition(hoverId);
      };
      const handleResize = () => {
        updateTooltipPosition(hoverId);
      };
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [hoverId]);

  const hoveredPerson = visible.find(person => person.id === hoverId);

  return (
    <>
      <div className={`inline-flex items-center pl-1.5 py-1.5 bg-[#EBF5FF] rounded-full overflow-visible relative z-0 ${Number(remaining) > 0 ? '' : 'pr-1.5'} ${className}`}>
        {visible.map((person, idx) => {
          return (
            <div
              key={person.id}
              ref={el => (avatarRefs.current[person.id] = el)}
              className='relative overflow-visible z-10'
              onMouseEnter={() => handleMouseEnter(person.id)}
              onMouseLeave={() => setHoverId(null)}
              style={idx > 0 ? { marginLeft: -8 } : undefined}
            >
              <ResponsibleAvatar avatarUrl={person.avatarUrl} fullName={person.name} size={size} />
            </div>
          );
        })}

        {remaining > 0 && (
          <div
            className={`left-[-8px] relative z-50 rounded-full border-2 border-[#549AE8] bg-[#D1D1D1] text-[#606060] font-semibold flex items-center justify-center shadow-sm`}
            style={{ width: size, height: size }}
          >
            +{remaining}
          </div>
        )}

        {visible.length === 1 && <p className='px-2 text-xs max-w-[100px] truncate font-medium'> {visible[0].name}</p>}
      </div>

      {hoveredPerson &&
        createPortal(
          <div
            className='fixed z-[9999] pointer-events-none'
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className='relative'>
              <div className='absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-[#0375F3]' />
              <div className='px-3 py-2 bg-[#0375F3] text-white rounded-[12px] text-sm font-semibold shadow-lg whitespace-nowrap truncate'>{hoveredPerson.name}</div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default AvatarStack;
