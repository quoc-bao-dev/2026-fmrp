import { RefreshIcon } from '@/components/icons';
import { IMAGES } from '@/constants/images';
import { useCreateSessionAppLoginQR } from '@/managers/api/auth/useCreateSessionAppLoginQR';
import { getOrCreateTabSession } from '@/utils/helpers/sessionStorage';
import { Add as IconClose } from 'iconsax-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { useDispatch } from 'react-redux';

const PopupQRCodeHeader = () => {
  const dispatch = useDispatch();
  const [timerKey, setTimerKey] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [sessionData, setSessionData] = useState(null);

  const { createSessionApp, isLoading } = useCreateSessionAppLoginQR({
    onSuccess: res => {
      const ttl = Number(res?.data?.ttl) || 0;
      setSessionData(res?.data || null);
      setCountdown(ttl);
      // Khi tạo session mới thành công thì reset lại countdown theo ttl
      setTimerKey(prev => prev + 1);
    },
  });

  // Tự động load session QR khi mở modal (component mount)
  useEffect(() => {
    const session_web = getOrCreateTabSession();
    createSessionApp({ session_web });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!countdown) return;
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
    const session_web = getOrCreateTabSession();
    createSessionApp({ session_web });
  };

  return (
    <div className='bg-white rounded-2xl p-6  max-w-full flex flex-col items-center gap-4 shadow-[0px_20px_40px_-8px_rgba(16,24,40,0.1)] relative' style={{ fontFamily: 'var(--font-lexend-deca)' }}>
      <button onClick={handleClose} className='absolute top-3 right-3 flex items-center justify-center size-8 rounded-full hover:bg-slate-100 transition' aria-label='Đóng'>
        <IconClose className='rotate-45' size={24} color='#98A2B3' />
      </button>
      <div className='text-center space-y-1'>
        <p className='text-sm font-medium text-[#1847ED] uppercase tracking-wide'>FMRP App</p>
        <h3 className='text-xl font-semibold text-[#25387A]'>Quét mã QR để đăng nhập</h3>
        <p className='text-sm text-[#667085]'>Mở ứng dụng FMRP trên điện thoại và quét mã dưới đây.</p>
      </div>
      <div className='flex gap-2'>
        <div className='p-3 rounded-2xl bg-[#F9FAFB] border border-[#EAECF0] flex flex-col items-center gap-3'>
          <div className='relative'>
            <div className={`bg-white p-3 rounded-xl shadow-sm ${!sessionData?.session_token || countdown <= 0 ? 'blur-md' : ''}`}>
              {sessionData?.session_token ? (
                <QRCode value={sessionData.session_token} size={220} bgColor='#ffffff' fgColor='#000000' level='M' />
              ) : (
                <div className='w-[220px] h-[220px] flex items-center justify-center text-xs text-[#98A2B3]'>Đang tạo mã QR...</div>
              )}
            </div>
            {(!sessionData?.session_token || countdown <= 0) && (
              <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
                <span className='px-3 py-1 rounded-full bg-black/60 text-white text-xs'>{countdown <= 0 ? 'Mã đã hết hạn' : 'Đang tạo mã QR...'}</span>
              </div>
            )}
          </div>
          {countdown > 0 ? (
            <p className='text-sm text-[#98A2B3] font-medium'>Mã sẽ hết hạn sau {countdown}s</p>
          ) : (
            <p className='text-sm text-[#98A2B3] font-medium'>Mã đã hết hạn, vui lòng tạo lại.</p>
          )}
        </div>
        <div>
          <Image src={IMAGES.qrDownloadApp} alt='qr-download-app' width={220} height={220} className='w-full aspect-1 object-cover' />
          <p className='text-sm text-[#98A2B3] font-medium'>Tải ứng dụng FMRP</p>
          <div className='flex gap-2 items-center justify-center'>

          <div
            onClick={() => {
              window.open('https://bom.so/mrpbeta');
            }}
            className='3xl:w-[200px] xxl:w-[180px] w-[160px] h-auto aspect-3.38/1 cursor-pointer'
          >
            <Image src={IMAGES.appstore} alt='appstore' width={200} height={100} className='size-full object-contain aspect-3.38/1' />
          </div>

          <div
            onClick={() => {
              window.open('https://bom.so/mrpbeta');
            }}
            className='3xl:w-[200px] xxl:w-[180px] w-[160px] h-auto aspect-3.38/1 cursor-pointer'
          >
            <Image src={IMAGES.googleplay} alt='googleplay' width={200} height={100} className='size-full object-contain aspect-3.38/1' />
          </div>
          </div>

        </div>
      </div>

      <div className='w-full flex flex-col gap-2'>
        {countdown === 0 && (
          <button
            onClick={handleReset}
            disabled={isLoading}
            className='w-full py-2.5 rounded-xl bg-typo-blue-1/10 text-typo-blue-5/90 font-medium text-sm hover:bg-[#EFF4FF] transition flex items-center justify-center gap-2'
          >
            <span>{isLoading ? 'Đang tạo mã QR...' : 'Tạo lại mã QR'}</span>
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
