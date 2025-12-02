import { useEffect, useRef, useState } from 'react';
import { Tooltip } from 'react-tippy';
import Popup from 'reactjs-popup';
import { BellSimpleIcon, ClockIcon } from '../icons';
import { Customscrollbar } from './common/Customscrollbar';
import NoData from './noData/nodata';

const DropdownThongBao = props => {
  const [open, sOpen] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollRef = useRef(null);
  const loadDelayRef = useRef(null);

  const notifications = props?.data || [];

  // Giả định 2 thông báo đầu là chưa đọc (như UI mẫu)
  const unreadCount = Math.min(2, notifications.length);

  useEffect(() => {
    if (!open) {
      setIsLoadingMore(false);
      if (loadDelayRef.current) {
        clearTimeout(loadDelayRef.current);
        loadDelayRef.current = null;
      }
    } else {
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = 0;
        }
      });
    }
  }, [open]);

  useEffect(() => {
    setIsLoadingMore(false);
    if (loadDelayRef.current) {
      clearTimeout(loadDelayRef.current);
      loadDelayRef.current = null;
    }
  }, [notifications?.length]);

  useEffect(() => {
    return () => {
      if (loadDelayRef.current) {
        clearTimeout(loadDelayRef.current);
        loadDelayRef.current = null;
      }
    };
  }, []);

  const badgeCount = unreadCount;

  const triggerContent = (
    <div className='relative inline-flex items-center justify-center w-4 2xl:h-[33px] h-[24px]'>
      {props.children}
      {badgeCount > 0 && (
        <span className='absolute -top-2 2xl:-top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#E42424] text-white text-[10px] leading-4 text-center font-semibold shadow-[0_2px_6px_rgba(0,0,0,0.15)]'>
          {badgeCount}
        </span>
      )}
    </div>
  );

  return (
    <Popup
      trigger={
        <button className='flex items-center justify-center text-slate-200 3xl:text-[18px] 2xl:text-[14px] xl:text-[12px] lg:text-[10px] hover:text-white hover:drop-shadow-[0_0_5px_#eabd7a99]'>
          {open ? (
            triggerContent
          ) : (
            <Tooltip title={'Thông báo'} arrow theme='dark' className='cursor-pointer'>
              {triggerContent}
            </Tooltip>
          )}
        </button>
      }
      closeOnDocumentClick
      arrow={props.position}
      on={['click']}
      open={open}
      onOpen={() => sOpen(true)}
      onClose={() => sOpen(false)}
      position={props.position}
      className={`${props.className}`}
      contentStyle={{ padding: 0, border: 'none', background: 'transparent' }}
    >
      <div className='-translate-x-5'>
        <Customscrollbar
          className='w-[300px] max-h-[600px] rounded-lg overflow-hidden !shadow-[0px_4px_40px_0px_#2F416E1F] border border-[#F2F4F7]'
          ref={scrollRef}
          onScroll={e => {
            const target = e.target;
            if (!isLoadingMore && target.scrollHeight - target.scrollTop - target.clientHeight < 16) {
              if (loadDelayRef.current) clearTimeout(loadDelayRef.current);
              loadDelayRef.current = setTimeout(() => {
                setIsLoadingMore(true);
              }, 500);
            }
          }}
        >
          <div className='relative bg-white flex flex-col font-deca'>
            {notifications?.length === 0 ? (
              <NoData type='noti' classNameImage='h-[230px] object-contain' />
            ) : (
              <>
                <div className='sticky top-0 bg-white z-10 px-3 py-2'>
                  <button type='button' className='responsive-text-sm font-semibold text-[#0375F3]'>
                    Đọc tất cả ({unreadCount})
                  </button>
                </div>
                {notifications?.map((ce, index) => (
                  <div key={index} className={`py-2.5 px-4 flex gap-3 border-b border-[#E8E8E8] ${index < 2 ? 'bg-[#E2F0FE]' : 'bg-white'}`}>
                    <BellSimpleIcon className={`size-5 shrink-0 mt-0.5 ${index < 2 ? 'text-[#0375F3]' : 'text-[#667085]'}`} />
                    <div className='flex flex-col gap-1'>
                      <h5 className={`responsive-text-base font-semibold ${index < 2 ? 'text-[#0375F3]' : 'text-[#4E4E4E]'}`}>{ce?.title}</h5>
                      <div className={`responsive-text-base ${index < 2 ? 'text-[#141522]' : 'text-[#667085]'}`} dangerouslySetInnerHTML={{ __html: ce.description }} />
                      <div className='flex items-center gap-1 responsive-text-xs text-[#9295A4]'>
                        <ClockIcon className='size-3 shrink-0' />
                        <span>{ce.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {notifications.length > 0 && (
              <div className='flex items-center justify-center gap-2 text-[#0375F3] responsive-text-base mx-auto py-2 italic'>
                {isLoadingMore && <span className='w-4 h-4 border-2 border-[#0375F3] border-t-transparent rounded-full animate-spin' aria-label='loading' />}
                <span>{isLoadingMore ? 'Đang tải...' : 'Xem thêm'}</span>
              </div>
            )}
          </div>
        </Customscrollbar>
      </div>
    </Popup>
  );
};

export default DropdownThongBao;
