import React from 'react';

export default function ApplicationSearchInput({ placeholder = 'Tìm kiếm', value, onChange }) {
    return (
        <div className='w-[672px] h-12 rounded-full bg-white/80 backdrop-blur-sm border border-[#E5E7EB] flex items-center px-4 gap-3'
            style={{
                boxShadow: '0px 10px 37px -3px #2B7FFF1A',
            }}
        >
            <svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg' className='shrink-0'>
                <path d='M17.4995 18.5L13.8828 14.8833' stroke='#99A1AF' strokeWidth='1.66667' strokeLinecap='round' strokeLinejoin='round' />
                <path
                    d='M9.16667 16.8333C12.8486 16.8333 15.8333 13.8486 15.8333 10.1667C15.8333 6.48477 12.8486 3.5 9.16667 3.5C5.48477 3.5 2.5 6.48477 2.5 10.1667C2.5 13.8486 5.48477 16.8333 9.16667 16.8333Z'
                    stroke='#99A1AF'
                    strokeWidth='1.66667'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                />
            </svg>

            <input
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className='w-full bg-transparent outline-none text-sm text-[#1D293D] placeholder:text-[#99A1AF]'
            />
        </div>
    );
}

