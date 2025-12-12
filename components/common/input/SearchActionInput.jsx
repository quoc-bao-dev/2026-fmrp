import { CloseXIcon, MagnifyingGlassIcon } from '@/components/icons';
import { twMerge } from 'tailwind-merge';

const SearchActionInput = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Tìm kiếm',
  className = '',
  inputClassName = '',
}) => {
  const handleSearch = () => {
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className={twMerge('flex gap-2 items-center w-full', className)}>
      <div className='flex gap-x-2 items-center w-full rounded-lg border border-[#D0D5DD] px-4 py-2 focus-within:border-transparent focus-within:ring-2 focus-within:ring-blue-500 bg-white'>
        <input
          type='text'
          placeholder={placeholder}
          className={twMerge('flex-1 border-none outline-none text-[#3A3E4C] placeholder-gray-400', inputClassName)}
          value={value}
          onChange={e => onChange?.(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch();
            }
          }}
        />
        {value && (
          <button
            type='button'
            className='rounded-full bg-gray-100 hover:bg-gray-200 text-[#3A3E4C] p-1 transition'
            aria-label='Xóa tìm kiếm'
            onClick={() => onChange?.('')}
          >
            <CloseXIcon className='size-3' />
          </button>
        )}
        <button
          type='button'
          className='rounded-lg bg-[#1760B9] p-1'
          onClick={handleSearch}
          aria-label='Tìm kiếm'
        >
          <MagnifyingGlassIcon className='size-4 text-white' />
        </button>
      </div>
    </div>
  );
};

export default SearchActionInput;

