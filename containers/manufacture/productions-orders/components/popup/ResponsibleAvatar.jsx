import { useState } from 'react';
import AvatarText from '@/components/UI/common/user/AvatarText';

const ResponsibleAvatar = ({ avatarUrl, fullName = '', size = 40, borderColor = '#549AE8', className = '' }) => {
  const [isError, setIsError] = useState(false);

  const dimension = { width: size, height: size };
  const commonClass = `rounded-full -border-2 bg-white text-[#1760B9] font-semibold flex items-center justify-center shadow-sm ${className}`.trim();

  return (
    <div
      className={commonClass}
      style={{
        ...dimension,
        borderColor,
      }}
    >
      {avatarUrl && !isError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt={fullName} className='w-10 h-10 rounded-full object-cover  border-[#549AE8] border-2' onError={() => setIsError(true)} />
      ) : (
        <AvatarText fullName={fullName || '?'} className='!min-w-10 !max-w-10 !min-h-10 !max-h-10 !w-10 !h-10 text-base  border-[#549AE8] border-2' />
      )}
    </div>
  );
};

export default ResponsibleAvatar;
