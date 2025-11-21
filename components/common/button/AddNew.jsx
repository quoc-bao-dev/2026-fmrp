import { PiPlus } from 'react-icons/pi';

export const ButtonAddNew = ({ onClick, title, text = 'Thêm mới', className = '' }) => {
  return (
    <button
      type='button'
      onClick={onClick}
      title={title}
      className={`text-[#0375F3] hover:text-[#1760B9] font-normal text-[11px] flex gap-1 items-center cursor-pointer ${className}`}
    >
      <PiPlus className='text-sm' />
      {text}
    </button>
  );
};