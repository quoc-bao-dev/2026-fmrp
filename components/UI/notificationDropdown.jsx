import { useListNoti, useReadAllNoti, useReadSingleNoti } from '@/hooks/useNotifications';
import useToast from '@/hooks/useToast';
import moment from 'moment';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Tooltip } from 'react-tippy';
import Popup from 'reactjs-popup';
import { BellSimpleIcon, ClockIcon } from '../icons';
import { Customscrollbar } from './common/Customscrollbar';
import Loading from './loading/loading';
import NoData from './noData/nodata';

const DropdownThongBao = ({ notiRead, position, children }) => {
  const [open, sOpen] = useState(false);
  const scrollRef = useRef(null);
  const loadDelayRef = useRef(null);
  const toast = useToast();

  const listParams = useMemo(() => ({ limit: 10, is_web: 1 }), []);
  const { data: notiPages, isLoading: isLoadingNoti, fetchNextPage, hasNextPage, isFetchingNextPage } = useListNoti({ params: listParams, open: open });
  const { mutate: readSingleNoti } = useReadSingleNoti();
  const { mutate: readAllNoti, isLoading: isReadingAll } = useReadAllNoti();

  const notifications = useMemo(() => {
    if (!notiPages?.pages) return [];
    return notiPages.pages.flatMap(page => page?.notifications || []);
  }, [notiPages]);

  const handleClickNotification = ce => {
    if (!ce?.id) return;
    if (ce?.is_read == 0) {
      readSingleNoti({ notification_id: ce.id });
    }
  };

  const handleReadAll = () => {
    if (!notiRead?.check) {
      toast('error', 'Không có thông báo nào để đọc');
      return;
    }
    readAllNoti({is_web: 1});
  };

  useEffect(() => {
    if (!open) {
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
    if (loadDelayRef.current) {
      clearTimeout(loadDelayRef.current);
      loadDelayRef.current = null;
    }
  }, [notifications.length]);

  useEffect(() => {
    return () => {
      if (loadDelayRef.current) {
        clearTimeout(loadDelayRef.current);
        loadDelayRef.current = null;
      }
    };
  }, []);

  const triggerContent = (
    <div className='relative inline-flex items-center justify-center w-4 2xl:h-[33px] h-[24px]'>
      {children}
      {notiRead?.check > 0 && (
        <span className='absolute -top-2 2xl:-top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#E42424] text-white text-[10px] leading-4 text-center font-semibold shadow-[0_2px_6px_rgba(0,0,0,0.15)]'>
          {notiRead?.check}
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
      arrow={position}
      on={['click']}
      open={open}
      onOpen={() => sOpen(true)}
      onClose={() => sOpen(false)}
      position={position}
      contentStyle={{ padding: 0, border: 'none', background: 'transparent' }}
    >
      <div className='-translate-x-5'>
        <Customscrollbar
          className='w-[300px] max-h-[600px] rounded-lg overflow-hidden !shadow-[0px_4px_40px_0px_#2F416E1F] border border-[#F2F4F7]'
          ref={scrollRef}
          onScroll={e => {
            const target = e.target;
            if (!isFetchingNextPage && hasNextPage && target.scrollHeight - target.scrollTop - target.clientHeight < 16) {
              if (loadDelayRef.current) clearTimeout(loadDelayRef.current);
              loadDelayRef.current = setTimeout(() => {
                fetchNextPage().finally(() => {
                  loadDelayRef.current = null;
                });
              }, 500);
            }
          }}
        >
          <div className={`relative bg-white flex flex-col font-deca ${notifications.length === 0 ? 'pb-4' : ''}`}>
            {isLoadingNoti ? (
              <Loading />
            ) : notifications.length === 0 ? (
              <NoData type='noti' classNameImage='h-[150px] object-contain' />
            ) : (
              <>
                <div className='sticky top-0 bg-white z-10 px-3 py-2'>
                  <button
                    type='button'
                    className='responsive-text-sm hover:underline cursor-pointer font-semibold text-[#0375F3] disabled:text-[#93C5FD]'
                    onClick={handleReadAll}
                    disabled={isReadingAll}
                  >
                    {isReadingAll ? 'Đang xử lý...' : `Đọc tất cả (${notiRead?.check})`}
                  </button>
                </div>
                {notifications.map((ce, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer py-2.5 px-4 flex gap-3 border-b  ${ce.is_read == 0 ? 'bg-[#E2F0FE] hover:bg-[#E2F0FE]/50 border-[#E8E8E8]' : 'bg-white hover:bg-gray-50 border-[#E8E8E8]/50'}`}
                    onClick={() => handleClickNotification(ce)}
                  >
                    <BellSimpleIcon className={`size-5 shrink-0 mt-0.5 ${ce.is_read == 0 ? 'text-[#0375F3]' : 'text-[#667085]'}`} />
                    <div className='flex flex-col gap-1'>
                      <h5 className={`responsive-text-base font-semibold ${ce.is_read == 0 ? 'text-[#0375F3]' : 'text-[#4E4E4E]'}`}>{ce?.title}</h5>
                      <div className={`responsive-text-base ${ce.is_read == 0 ? 'text-[#141522]' : 'text-[#667085]'}`} dangerouslySetInnerHTML={{ __html: ce.content }} />
                      <div className='flex items-center gap-1 responsive-text-xs text-[#9295A4]'>
                        <ClockIcon className='size-3 shrink-0' />
                        <span>{moment(ce.date_created).isSame(moment(), 'day') ? `${moment(ce.date_created).format('HH:mm')} Hôm nay` : moment(ce.date_created).format('HH:mm DD/MM/YYYY')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {!isLoadingNoti && hasNextPage && (
              <div className='flex items-center justify-center gap-2 text-[#0375F3] responsive-text-base mx-auto py-2 italic'>
                {isFetchingNextPage && <span className='w-4 h-4 border-2 border-[#0375F3] border-t-transparent rounded-full animate-spin' aria-label='loading' />}
                <span>{isFetchingNextPage ? 'Đang tải...' : 'Xem thêm'}</span>
              </div>
            )}
          </div>
        </Customscrollbar>
      </div>
    </Popup>
  );
};

export default DropdownThongBao;
