import { MagnifyingGlassIcon } from '@/components/icons';
import { twMerge } from 'tailwind-merge';

const SearchInput = ({ value, onChange, placeholder = 'Tìm kiếm', className = '', inputClassName = '' }) => {
  return (
    <div className={twMerge('relative flex items-center', className)}>
      <span className='absolute left-3 inset-y-0 my-auto text-[#9295A4] flex items-center'>
        <MagnifyingGlassIcon className='size-4' />
      </span>
      <input
        type='text'
        value={value}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={twMerge(
          'w-full border border-[#E5E7EB] rounded-lg pl-9 pr-8 py-2 text-sm text-[#3A3E4C] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500',
          inputClassName
        )}
      />
      {value && (
        <button
          type='button'
          className='absolute inset-y-0 right-2 my-auto size-6 rounded-full flex items-center justify-center text-[#9295A4] hover:text-[#0375F3]'
          onClick={() => onChange?.('')}
          aria-label='Clear search'
        >
          ×
        </button>
      )}
    </div>
  );
};

export default SearchInput;
