import { TrashIcon } from '@/components/icons';

export const ButtonDelete = ({ onClick, title, text = 'Xóa', className = '' }) => {
  return (
    <button
      type='button'
      onClick={onClick}
      title={title}
      className={`group rounded-lg p-1 border border-transparent transition-all ease-in-out flex items-center justify-center hover:border-red-01 hover:bg-red-02 gap-1 cursor-pointer ${className}`}
    >
      <TrashIcon className='size-5 text-red-01' />
      {/* {text} */}
    </button>
  );
};