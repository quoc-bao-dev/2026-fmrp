import { IMAGES } from '@/constants/images';
import Image from 'next/image';
import React from 'react';

const MobileWarningModal = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[9999] flex items-end'>
      <div className='absolute inset-0 bg-black/50 backdrop-blur-sm' />
      <div className='relative w-full bg-white rounded-t-3xl shadow-2xl animate-slide-up max-h-[85vh] overflow-y-auto'>
        <div className='px-6 py-8 flex flex-col items-center'>
          <Image src={IMAGES.warningMobile} width={250} height={100} priority/>
          <div className='text-center mb-8 bg-[#EBF5FF] p-2 rounded-lg'>
            <h3 className='text-[#11315B] font-semibold text-2xl mb-3'>Phiên bản FMRP Web hiện chỉ hỗ trợ trên máy tính!</h3>
            <p className='text-[#667085] text-base leading-relaxed'>
              Hãy dùng máy tính
              <br /> để trải nghiệm tốt hơn nhé!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(MobileWarningModal);
