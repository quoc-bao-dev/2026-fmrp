import React from 'react';
import { CloseXIcon, MagnifyingGlassIcon } from '@/components/icons';

const SearchInput = ({ value, onChange, placeholder = 'Tìm kiếm', className = '', onClear, ...props }) => {
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { value: '' } });
    }
  };

  return (
    <div className={`flex gap-x-2 items-center rounded-lg border border-[#D0D5DD] px-4 py-2 focus-within:border-transparent focus-within:ring-2 focus-within:ring-blue-500 ${className}`}>
      <input
        type='text'
        placeholder={placeholder}
        className='flex-1 border-none outline-none text-[#3A3E4C] placeholder-gray-200'
        value={value || ''}
        onChange={onChange}
        {...props}
      />
      {value && (
        <button
          type='button'
          className='rounded-full bg-gray-100 hover:bg-gray-200 text-[#3A3E4C] p-1 transition'
          aria-label='Xóa tìm kiếm'
          onClick={handleClear}
        >
          <CloseXIcon className='size-3' />
        </button>
      )}
      <button type='button' className='rounded-lg bg-[#1760B9] p-1'>
        <MagnifyingGlassIcon className='size-4 text-white' />
      </button>
    </div>
  );
};

export default SearchInput;

