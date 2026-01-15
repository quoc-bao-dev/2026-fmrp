import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ResponsibleAvatar from './ResponsibleAvatar';

const AvatarStack = ({ people = [], size = 40, className = '' }) => {
  const [hoverId, setHoverId] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const avatarRefs = useRef({});
  const remainingRef = useRef(null);

  if (!people || people.length === 0) return null;

  const visible = people.slice(0, 3);
  const remaining = people.length - visible.length;
  const remainingPeople = people.slice(3);

  const updateTooltipPosition = element => {
    if (element) {
      const rect = element.getBoundingClientRect();
      setTooltipPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX + rect.width / 2,
      });
    }
  };

  const handleMouseEnter = personId => {
    setHoverId(personId);
    const element = avatarRefs.current[personId];
    if (element) {
      updateTooltipPosition(element);
    }
  };

  const handleRemainingMouseEnter = () => {
    setHoverId('remaining');
    if (remainingRef.current) {
      updateTooltipPosition(remainingRef.current);
    }
  };

  useEffect(() => {
    if (hoverId) {
      if (hoverId === 'remaining') {
        if (remainingRef.current) {
          updateTooltipPosition(remainingRef.current);
        }
      } else {
        const element = avatarRefs.current[hoverId];
        if (element) {
          updateTooltipPosition(element);
        }
      }
      const handleScroll = () => {
        if (hoverId === 'remaining') {
          if (remainingRef.current) {
            updateTooltipPosition(remainingRef.current);
          }
        } else {
          const element = avatarRefs.current[hoverId];
          if (element) {
            updateTooltipPosition(element);
          }
        }
      };
      const handleResize = () => {
        if (hoverId === 'remaining') {
          if (remainingRef.current) {
            updateTooltipPosition(remainingRef.current);
          }
        } else {
          const element = avatarRefs.current[hoverId];
          if (element) {
            updateTooltipPosition(element);
          }
        }
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
  const isHoveringRemaining = hoverId === 'remaining';

  return (
    <>
      <div className={`inline-flex items-center p-1.5 bg-[#EBF5FF] rounded-full overflow-visible relative z-0 ${Number(remaining) > 0 ? '' : 'pr-1.5'} ${className}`}>
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
            ref={remainingRef}
            className={`ml-[-8px] relative z-50 rounded-full border-2 border-[#549AE8] bg-[#D1D1D1] text-[#606060] font-semibold flex items-center justify-center shadow-sm cursor-pointer`}
            style={{ width: size, height: size }}
            onMouseEnter={handleRemainingMouseEnter}
            onMouseLeave={() => setHoverId(null)}
          >
            +{remaining}
          </div>
        )}

        {visible.length === 1 && <p className='px-2 text-xs max-w-[100px] truncate font-medium'> {visible[0].name}</p>}
      </div>

      {(hoveredPerson || isHoveringRemaining) &&
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
              {isHoveringRemaining ? (
                <div className='px-3 py-2 bg-[#0375F3] text-white rounded-[12px] text-sm font-semibold shadow-lg max-w-[200px]'>
                  <div className='flex flex-col gap-1'>
                    {remainingPeople.map((person, index) => (
                      <div key={person.id || index} className='whitespace-nowrap truncate'>
                        {person.name}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className='px-3 py-2 bg-[#0375F3] text-white rounded-[12px] text-sm font-semibold shadow-lg whitespace-nowrap truncate'>{hoveredPerson?.name}</div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default AvatarStack;
