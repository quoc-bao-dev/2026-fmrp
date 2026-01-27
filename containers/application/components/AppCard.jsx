import React from 'react';
import Image from 'next/image';

export default function AppCard({ title, description, imageSrc }) {
    return (
        <div className='rounded-2xl bg-white/70 backdrop-blur-sm border border-[#E5E7EB] overflow-hidden'>
            <div className='relative w-full h-[160px]'>
                <Image src={imageSrc} alt={title} fill className='object-cover' />
            </div>
            <div className='p-4'>
                <h3 className='text-[#1D293D] font-semibold'>{title}</h3>
                {description ? <p className='text-sm text-[#667085] mt-1'>{description}</p> : null}
            </div>
        </div>
    );
}

