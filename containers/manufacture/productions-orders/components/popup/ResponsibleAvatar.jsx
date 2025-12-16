import { useState } from 'react';
import AvatarText from '@/components/UI/common/user/AvatarText';

const ResponsibleAvatar = ({ avatarUrl, fullName = '', size = 40, borderColor = '#549AE8', className = '' }) => {
  const [isError, setIsError] = useState(false);

  const dimension = { width: size, height: size };
  const commonClass = `rounded-full bg-white text-[#1760B9] font-semibold flex items-center justify-center shadow-sm overflow-hidden ${className}`.trim();

  return (
    <div
      className={commonClass}
      style={{
        ...dimension,
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor,
      }}
    >
      {avatarUrl && !isError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={fullName}
          className='w-full h-full rounded-full object-cover'
          onError={() => setIsError(true)}
        />
      ) : (
        <AvatarText
          fullName={fullName || '?'}
          className='w-full h-full text-base flex items-center justify-center'
        />
      )}
    </div>
  );
};

export default ResponsibleAvatar;
