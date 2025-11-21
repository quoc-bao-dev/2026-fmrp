import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useDispatch } from 'react-redux';
import { Add as IconClose } from 'iconsax-react';
import RefreshIcon from '@/components/icons/common/Refresh';

const PopupQRCodeHeader = () => {
  const dispatch = useDispatch();
  const DEFAULT_COUNTDOWN = 1;
  const [timerKey, setTimerKey] = useState(0);
  const [countdown, setCountdown] = useState(DEFAULT_COUNTDOWN);

  useEffect(() => {
    setCountdown(DEFAULT_COUNTDOWN);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerKey]);

  const handleClose = () => {
    dispatch({
      type: 'statePopupGlobal',
      payload: { open: false },
    });
  };

  const handleReset = () => {
    setTimerKey(prev => prev + 1);
  };

  return (
    <div
      className='bg-white rounded-2xl p-6 w-[320px] max-w-full flex flex-col items-center gap-4 shadow-[0px_20px_40px_-8px_rgba(16,24,40,0.1)] relative'
      style={{ fontFamily: 'var(--font-lexend-deca)' }}
    >
      <button onClick={handleClose} className='absolute top-3 right-3 flex items-center justify-center size-8 rounded-full hover:bg-slate-100 transition' aria-label='Đóng'>
        <IconClose className='rotate-45' size={24} color='#98A2B3' />
      </button>
      <div className='text-center space-y-1'>
        <p className='text-sm font-medium text-[#1847ED] uppercase tracking-wide'>FMRP App</p>
        <h3 className='text-xl font-semibold text-[#25387A]'>Quét mã QR để đăng nhập</h3>
        <p className='text-sm text-[#667085]'>Mở ứng dụng FMRP trên điện thoại và quét mã dưới đây.</p>
      </div>
      <div className='p-3 rounded-2xl bg-[#F9FAFB] border border-[#EAECF0] flex flex-col items-center gap-3'>
        <Image
          alt='qr-code'
          src='/qr.png'
          width={220}
          height={220}
          quality={100}
          className='object-contain'
          loading='lazy'
          crossOrigin='anonymous'
          blurDataURL='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
        />
        {countdown > 0 ? <p className='text-sm text-[#98A2B3] font-medium'>Mã sẽ hết hạn sau {countdown}s</p> : <p className='text-sm text-[#98A2B3] font-medium'>Mã đã hết hạn, vui lòng tạo lại.</p>}
      </div>
      <div className='w-full flex flex-col gap-2'>
        {countdown === 0 && (
          <button
            onClick={handleReset}
            className='w-full py-2.5 rounded-xl bg-typo-blue-1/10 text-typo-blue-5/90 font-medium text-sm hover:bg-[#EFF4FF] transition flex items-center justify-center gap-2'
          >
            <span>Tạo lại mã QR</span>
            <RefreshIcon size={16} color='currentColor' className='text-typo-blue-5/90 size-5' />
          </button>
        )}
        <button onClick={handleClose} className='w-full py-2.5 rounded-xl bg-typo-blue-5/90 text-white font-medium text-sm hover:bg-typo-blue-5 transition'>
          Đóng
        </button>
      </div>
    </div>
  );
};

export default PopupQRCodeHeader;
