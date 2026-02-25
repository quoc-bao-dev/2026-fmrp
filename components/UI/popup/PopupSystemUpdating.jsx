import PopupCustom from '@/components/UI/popup';
import { WarningIcon } from '@/components/icons';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const IndeterminateProgressBar = () => {
  return (
    <div className='w-full text-center'>
      <div className='relative h-1.5 bg-[#DDDDE2] rounded-full overflow-hidden'>
        <div className='absolute inset-0'>
          <div className='h-full w-1/3 bg-gradient-to-r from-[#2B70DE] to-[#65B6EF] rounded-full progress-bar-indeterminate' />
        </div>
      </div>

      <style jsx>{`
        .progress-bar-indeterminate {
          position: absolute;
          left: 0;
          animation: progress-indeterminate 3s ease-in-out infinite;
        }

        @keyframes progress-indeterminate {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(200%);
          }
        }
      `}</style>
    </div>
  );
};

const PopupSystemUpdating = ({ open = false }) => {
  const [percentUpdate, setPercentUpdate] = useState(0);
  const settings = useSelector(state => state.setings);

  useEffect(() => {
    // Reset khi đóng
    if (!open) {
      setPercentUpdate(0);
      return;
    }

    setPercentUpdate(0);
  }, [open]);

  return (
    <PopupCustom
      open={open}
      // Không cho phép đóng bằng click ra ngoài hay nút X
      onClose={() => { }}
      lockScroll={true}
      closeOnDocumentClick={false}
      className='popup-system-updating'
      type='no-close'
    >
      <div
        className="pb-8 pt-[105px] px-[24px] md:px-[40px] lg:px-[56px] max-w-[655px] relative flex flex-col gap-8 items-center justify-center"
      >
        <div className='absolute -top-4 -translate-y-1/2 right-[46%] translate-x-1/2 select-none'>
          <Image
            alt='rocket'
            src='/popup/rocket.gif'
            width={600}
            height={600}
            quality={100}
            className='!w-[80%] select-none -rotate-45'
            draggable={false}
            layout='responsive'
            unoptimized={true}
          />
        </div>

        <div className='flex flex-col items-center justify-center gap-5'>
          <h3 className='font-semibold capitalize responsive-text-4xl leading-[140%] text-typo-black-2'>
            {settings?.content_noti}
          </h3>
          <IndeterminateProgressBar />
        </div>

        <div className='flex gap-3 w-full'>
          <WarningIcon className="text-[#EE1E1E] size-[26px]" />
          <p className='font-medium responsive-text-base text-[#9295A4]'>
            {settings?.content_note}
          </p>
        </div>
      </div>
    </PopupCustom>
  );
};

export default PopupSystemUpdating;
