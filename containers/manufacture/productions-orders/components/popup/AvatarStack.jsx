import { useState } from 'react';
import ResponsibleAvatar from './ResponsibleAvatar';

const AvatarStack = ({ people = [] }) => {
  const [hoverId, setHoverId] = useState(null);

  if (!people || people.length === 0) return null;

  const visible = people.slice(0, 3);
  const remaining = people.length - visible.length;

  return (
    <div className='inline-flex items-center px-2 py-2 bg-[#EBF5FF] rounded-full overflow-visible relative z-0'>
      {visible.map((person, idx) => {
        return (
          <div
            key={person.id}
            className='relative overflow-visible z-10'
            onMouseEnter={() => setHoverId(person.id)}
            onMouseLeave={() => setHoverId(null)}
            style={idx > 0 ? { marginLeft: -8 } : undefined}
          >
            <ResponsibleAvatar avatarUrl={person.avatarUrl} fullName={person.name} size={40} />

            {hoverId === person.id && (
              <div className='absolute left-1/2 -translate-x-1/2 mt-2 top-full z-50'>
                <div className='relative'>
                  <div className='absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-[#0375F3]' />
                  <div className='px-3 py-2 bg-[#0375F3] text-white rounded-[12px] text-sm font-semibold shadow-lg whitespace-nowrap'>{person.name}</div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {remaining > 0 && (
        <div className='w-10 h-10 left-[-8px] relative z-50 rounded-full border-2 border-[#549AE8] bg-[#D1D1D1] text-[#606060] font-semibold flex items-center justify-center shadow-sm'>
          +{remaining}
        </div>
      )}

      {visible.length === 1 && <p className='px-2'> {visible[0].name}</p>}
    </div>
  );
};

export default AvatarStack;
