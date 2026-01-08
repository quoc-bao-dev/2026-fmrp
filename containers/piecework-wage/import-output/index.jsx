import SelectSearchableRadio from '@/components/common/select/SelectSearchableRadio';
import {
  CalendarIcon,
  CaretDownIcon,
  CheckDoubleIcon,
  Clock2Icon,
  ClockIcon,
  CloseXIcon,
  EqualizerIcon,
  FunnelIcon,
  PresentationChartIcon,
  ProgressIcon,
  SearchIcon,
  ThreeDotIcon,
  UserGroupIcon,
  UserPlus2Icon,
  UsersIcon,
} from '@/components/icons';
import FilterDropdown from '@/components/common/dropdown/FilterDropdown';
import { DropdownAvatar } from '@/components/layout/header';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import InfoTooltip from '@/components/UI/common/InfoTooltip';
import Loading from '@/components/UI/loading/loading';
import PopupConfim from '@/components/UI/popupConfim/popupConfim';
import DateToDateComponent from '@/components/UI/filterComponents/dateTodateComponent';
import { IMAGES } from '@/constants/images';
import { useSearchStaffs } from '@/hooks/common/useStaffs';
import { useListImportOutput, useListImportOutputItems, useLookupStages } from '@/managers/api/piecework-wage/useImportOutput';
import formatNumber from '@/utils/helpers/formatnumber';
import { searchWithoutDiacritics } from '@/utils/helpers/stringHelper';
import { Popover, Tooltip } from 'antd';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaPause, FaPlay, FaStop } from 'react-icons/fa';
import { useDebounce } from 'use-debounce';
import { useSelector } from 'react-redux';
import PopupCompleteOrder from './components/PopupCompleteOrder';
import moment from 'moment';

const Avatar = () => {
  return (
    <div className='flex items-center gap-2 justify-between w-full'>
      <div className='p-1 flex rounded-full bg-[#D6EAFE]'>
        <Image src='/shift-schedule.png' alt='default' width={100} height={100} className='size-[30px] bg-[#E2E5E9] rounded-full overflow-hidden object-cover border-2 border-[#549AE8] -ml-0 z-1' />
        <Image src='/shift-schedule.png' alt='default' width={100} height={100} className='size-[30px] bg-[#E2E5E9] rounded-full overflow-hidden object-cover border-2 border-[#549AE8] -ml-2 z-[2]' />
        <Image src='/shift-schedule.png' alt='default' width={100} height={100} className='size-[30px] bg-[#E2E5E9] rounded-full overflow-hidden object-cover border-2 border-[#549AE8] -ml-2 z-[3]' />
      </div>
    </div>
  );
};

const TimerControl = ({ time = '00 : 00 : 00', status = 'idle', onStart, onPause, onStop, onComplete }) => {
  // 4 trạng thái: 'idle', 'running', 'paused', 'completed'
  const renderButtons = () => {
    switch (status) {
      case 'idle':
        // Chưa bắt đầu: chỉ hiển thị nút "Bắt đầu"
        return (
          <button
            onClick={onStart}
            className='p-1.5 !pl-2 aspect-1 rounded-full flex items-center gap-1 bg-[#4BBA5E] shadow-[0px_2px_8px_0px_#4CD96466] hover:bg-[#3FA550] hover:shadow-[0px_4px_12px_0px_#4CD96499] transition-all duration-200 active:scale-95'
          >
            <FaPlay className='size-5 p-0.5 text-white' />
            {/* <span className='responsive-text-sm font-medium text-white whitespace-nowrap'>Bắt đầu</span> */}
          </button>
        );

      case 'running':
        // Đang chạy: hiển thị nút "Dừng" và "Kết thúc"
        return (
          <>
            <button
              onClick={onPause}
              className='p-1.5 rounded-xl flex items-center gap-1 bg-[#F5BF40] shadow-[0px_2px_8px_0px_#EEC52126] hover:bg-[#E5AF30] hover:shadow-[0px_4px_12px_0px_#EEC52140] transition-all duration-200 active:scale-95'
            >
              <FaPause className='size-5 p-0.5 text-white' />
              <span className='responsive-text-sm font-medium text-white whitespace-nowrap'>Dừng</span>
            </button>
            <button
              onClick={onStop}
              className='p-1.5 rounded-xl flex items-center gap-1 bg-[#F4646B] shadow-[0px_2px_8px_0px_#FB2C3633] hover:bg-[#E4545B] hover:shadow-[0px_4px_12px_0px_#FB2C3655] transition-all duration-200 active:scale-95'
            >
              <FaStop className='size-5 p-0.5 text-white' />
              <span className='responsive-text-sm font-medium text-white whitespace-nowrap'>Kết thúc</span>
            </button>
          </>
        );

      case 'paused':
        // Tạm dừng: hiển thị nút "Tiếp tục" và "Kết thúc"
        return (
          <>
            <button
              onClick={onStart}
              className='p-1.5 rounded-xl flex items-center gap-1 bg-[#4BBA5E] shadow-[0px_2px_8px_0px_#4CD96466] hover:bg-[#3FA550] hover:shadow-[0px_4px_12px_0px_#4CD96499] transition-all duration-200 active:scale-95'
            >
              <FaPlay className='size-5 p-0.5 text-white' />
              <span className='responsive-text-sm font-medium text-white whitespace-nowrap'>Tiếp tục</span>
            </button>
            <button
              onClick={onStop}
              className='p-1.5 rounded-xl flex items-center gap-1 bg-[#F4646B] shadow-[0px_2px_8px_0px_#FB2C3633] hover:bg-[#E4545B] hover:shadow-[0px_4px_12px_0px_#FB2C3655] transition-all duration-200 active:scale-95'
            >
              <FaStop className='size-5 p-0.5 text-white' />
              <span className='responsive-text-sm font-medium text-white whitespace-nowrap'>Kết thúc</span>
            </button>
          </>
        );

      case 'completed':
        // Hoàn thành: chỉ hiển thị nút "Hoàn thành"
        return (
          <button
            onClick={onComplete}
            className='p-1.5 rounded-xl flex items-center gap-1 bg-[#9F9F9F] shadow-[0px_2px_8px_0px_#9F9F9F] hover:bg-[#8F8F8F] hover:shadow-[0px_4px_12px_0px_#9F9F9FCC] transition-all duration-200 active:scale-95'
          >
            <CheckDoubleIcon className='size-5 p-0.5 text-white' />
            <span className='responsive-text-sm font-medium text-white whitespace-nowrap'>Hoàn thành</span>
          </button>
        );

      default:
        return null;
    }
  };

  // const containerBg = status === 'running' || status === 'completed' ? 'bg-[#DFF3E2]' : 'bg-[#E8E8E8]';

  return (
    <div className={`w-full flex justify-between items-center gap-2 rounded-2xl `}>
      <div className='flex items-center gap-1'>
        <Clock2Icon className='size-5 text-[#4E4E4E]' />
        <p className='responsive-text-xs font-semibold text-[#4E4E4E] whitespace-nowrap'>{time}</p>
      </div>
      <div className='flex items-center gap-1'>{renderButtons()}</div>
    </div>
  );
};

const parseTimeString = (timeString = '00 : 00 : 00') => {
  const parts = timeString.split(':').map(part => parseInt(part.trim(), 10));
  if (parts.length !== 3 || parts.some(isNaN)) return 0;
  const [h, m, s] = parts;
  return h * 3600 + m * 60 + s;
};

const formatTime = seconds => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = n => String(n).padStart(2, '0');
  return `${pad(h)} : ${pad(m)} : ${pad(s)}`;
};

// Component dropdown hiển thị nhân viên/nhóm đang làm và tạm dừng
const ProcessStatusDropdown = ({ processName }) => {
  const [open, setOpen] = useState(false);

  // Dữ liệu ảo cho "Đang làm"
  const doingData = [
    {
      id: 1,
      name: 'Thành',
      type: 'staff',
      avatar: '/shift-schedule.png',
    },
    {
      id: 2,
      name: 'Nhóm may',
      type: 'group',
    },
  ];

  // Dữ liệu ảo cho "Tạm dừng"
  const pausedData = [
    {
      id: 3,
      name: 'Quang',
      type: 'staff',
      avatar: '/shift-schedule.png',
    },
    {
      id: 4,
      name: 'Hùng',
      type: 'staff',
      avatar: '/shift-schedule.png',
    },
    {
      id: 5,
      name: 'Nhóm may',
      type: 'group',
    },
  ];

  const dropdownContent = (
    <div className='w-[240px] bg-white rounded-lg shadow-lg overflow-hidden'>
      <Customscrollbar className='max-h-[400px]'>
        {/* Section Đang làm */}
        <div className=''>
          <h4 className='responsive-text-base font-semibold text-[#1A7526] p-3 border-b border-[#F7F8F9]'>Đang làm</h4>
          <div className='flex flex-col'>
            {doingData.map(item => (
              <div key={item.id} className='flex items-center gap-2 px-3 py-2 rounded-lg'>
                {item.type === 'staff' ? (
                  <div className='size-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#549AE8]'>
                    <Image src={item.avatar} alt={item.name} width={40} height={40} className='w-full h-full object-cover' />
                  </div>
                ) : (
                  <div className='size-10 rounded-full flex items-center justify-center flex-shrink-0 bg-[#4F7AED] border-2 border-[#4F7AED]'>
                    <UserGroupIcon className='size-6 text-white' />
                  </div>
                )}
                <span className='responsive-text-sm font-normal text-neutral-07 flex-1'>{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className='border-t border-[#F7F8F9]' />

        {/* Section Tạm dừng */}
        <div className=''>
          <h4 className='responsive-text-base font-semibold text-red-01 p-3 border-b border-[#F7F8F9]'>Tạm dừng</h4>
          <div className='flex flex-col'>
            {pausedData.map(item => (
              <div key={item.id} className='flex items-center gap-2 px-3 py-2 rounded-lg'>
                {item.type === 'staff' ? (
                  <div className='size-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#549AE8]'>
                    <Image src={item.avatar} alt={item.name} width={40} height={40} className='w-full h-full object-cover' />
                  </div>
                ) : (
                  <div className='size-10 rounded-full flex items-center justify-center flex-shrink-0 bg-[#4F7AED] border-2 border-[#4F7AED]'>
                    <UserGroupIcon className='size-6 text-white' />
                  </div>
                )}
                <span className='responsive-text-sm font-normal text-neutral-07 flex-1'>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </Customscrollbar>
    </div>
  );

  return (
    <Popover content={dropdownContent} placement='bottomRight' trigger='click' overlayClassName='process-status-dropdown' open={open} onOpenChange={setOpen}>
      <button className={`p-1 rounded-lg transition-all duration-300 ${open ? 'bg-[#667085]/30 text-white' : 'bg-transparent hover:bg-[#667085]/30 text-[#667085] hover:text-white'}`}>
        <ThreeDotIcon className='size-5' />
      </button>
    </Popover>
  );
};

const ProductionOrderCard = ({ borderColor = '#EEB600', status = 'idle', time = '00 : 00 : 00', po, stage_id, stage_name }) => {
  const [statusState, setStatusState] = useState(status);
  const [elapsedSeconds, setElapsedSeconds] = useState(parseTimeString(time));
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showCompletePopup, setShowCompletePopup] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const intervalRef = useRef(null);

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startTimer = () => {
    if (statusState === 'running') return;
    clearTimer();
    setStatusState('running');
    intervalRef.current = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
  };

  const pauseTimer = () => {
    clearTimer();
    setStatusState('paused');
  };

  const handleStopClick = () => {
    // Mở popup xác nhận thay vì dừng timer ngay
    setShowConfirmPopup(true);
  };

  const confirmStopTimer = () => {
    clearTimer();
    setStatusState('completed');
    setShowConfirmPopup(false);
  };

  const cancelStopTimer = () => {
    setShowConfirmPopup(false);
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  const displayTime = formatTime(elapsedSeconds);

  const handleCardClick = () => {
    // Mở popup khi click vào card
    setShowCompletePopup(true);
  };

  // Tổng số sản phẩm hiển thị trong card
  const items = po?.items || [];
  const totalItems = items.length || 1;
  const visibleItemsCount = isExpanded || totalItems <= 3 ? totalItems : 3;
  const remainingItems = totalItems > 3 ? totalItems - visibleItemsCount : 0;

  const objects = po?.objects || [];
  const objectRefs = objects.map(obj => obj?.reference_no).filter(Boolean);
  const totalOrders = objectRefs.length;
  const displayedOrders = objectRefs.slice(0, 2);
  const remainingOrders = totalOrders > 2 ? objectRefs.slice(2) : [];
  const hasMoreOrders = remainingOrders.length > 0;

  const displayText = totalOrders > 0 ? `Đơn hàng ${displayedOrders.join(', ')}${hasMoreOrders ? ', ...' : ''}` : 'Đơn hàng';

  const allOrdersText = totalOrders > 0 ? objectRefs.join(', ') : '';

  const formattedDate = po?.date ? po.date.split(' ')[0]?.split('-')?.reverse()?.join('/') : '';

  const orderTextContent = (
    <div className='flex items-center gap-1 flex-wrap'>
      <span className='responsive-text-xs font-normal text-[#667085]'>{displayText}</span>
      {hasMoreOrders && <span className='responsive-text-xs font-normal text-blue-fmrp cursor-pointer hover:underline'>xem thêm</span>}
    </div>
  );

  return (
    <div className='flex flex-col items-start gap-3 p-4 rounded-xl bg-white border border-[#F3F4F680] cursor-pointer hover:border-blue-fmrp' onClick={handleCardClick}>
      <div className='w-full flex items-center justify-between gap-2'>
        <div className='py-0.5 px-2 border-l-2' style={{ borderColor }}>
          <h4 className='responsive-text-lg font-semibold mb-1' style={{ color: borderColor }}>
            {po?.reference_no || '---'}
          </h4>
          {hasMoreOrders ? (
            <Tooltip title={allOrdersText} placement='top' overlayClassName='order-tooltip'>
              {orderTextContent}
            </Tooltip>
          ) : (
            <p className='responsive-text-xs font-normal text-[#667085]'>{displayText}</p>
          )}
        </div>
        <div className='flex items-center gap-1.5'>
          <CalendarIcon className='size-3.5 text-[#667085]' />
          <p className='responsive-text-xxs font-normal text-[#667085]'>{formattedDate}</p>
        </div>
      </div>
      <div onClick={e => e.stopPropagation()} className='w-full'>
        <TimerControl time={displayTime} status={statusState} onStart={startTimer} onPause={pauseTimer} onStop={handleStopClick} onComplete={() => setShowCompletePopup(true)} />
      </div>
      <PopupConfim
        isOpen={showConfirmPopup}
        onClose={cancelStopTimer}
        save={confirmStopTimer}
        cancel={cancelStopTimer}
        title='Xác nhận kết thúc'
        subtitle='Bạn có chắc chắn muốn kết thúc công việc này không?'
        nameModel='timer_stop'
        forceConfirm={true}
      />
      <PopupCompleteOrder stage_id={stage_id} stage_name={stage_name} po={po} isOpen={showCompletePopup} onClose={() => setShowCompletePopup(false)} />
      <Avatar />

      <div className='px-1 flex items-center gap-3 w-1/2'>
        <div className='flex items-center gap-1 flex-shrink-0'>
          <ProgressIcon className='size-4 text-[#99A1AF]' />
          <p className='responsive-text-xs font-normal text-[#667085]'>Tiến trình</p>
          <p className='responsive-text-xs font-medium text-blue-fmrp ml-1'>4/5</p>
        </div>
        <div className='relative bg-[#EEEFF0] rounded-full h-1.5 w-full overflow-hidden'>
          <div className='absolute left-0 top-0 bg-blue-fmrp rounded-full h-full w-3/4' />
        </div>
      </div>
      <div className='flex flex-col gap-1 w-full'>
        {items.slice(0, visibleItemsCount).map((item, index) => (
          <div key={index} className='p-1 flex items-center gap-2 w-full'>
            <Image
              src={item?.images || IMAGES.noImage}
              alt={item?.item_name || 'default'}
              width={100}
              height={100}
              className='size-11 bg-[#E2E5E9] rounded-lg overflow-hidden object-cover border border-[#DDDDE2]'
            />
            <div className='flex flex-col flex-1'>
              <div className='flex items-center gap-2'>
                <span className='responsive-text-xxs font-normal text-blue-fmrp'>{item?.item_code || '--'}</span>
                <span className='responsive-text-xxs font-normal text-[#D0D5DD]'>|</span>
                <span className='responsive-text-xxs font-normal text-blue-fmrp'>{item?.reference_no_detail || '--'}</span>
              </div>
              <div className='flex flex-col gap-0.5'>
                <h4 className='responsive-text-sm font-semibold text-[#141522]'>{item?.item_name || '---'}</h4>
                <p className='responsive-text-xxs font-normal text-[#667085]'>
                  SL: {formatNumber(+(item?.quantity_rest ?? 0))} {item?.unit_name || ''}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {totalItems > 3 && (
        <button
          type='button'
          className='px-1 text-left responsive-text-sm font-normal text-[#1760B9] hover:underline'
          onClick={e => {
            e.stopPropagation();
            setIsExpanded(prev => !prev);
          }}
        >
          {isExpanded ? 'Thu gọn' : `Xem thêm (${remainingItems})`}
        </button>
      )}
    </div>
  );
};

// Component StageColumn để quản lý infinite scroll cho từng stage
const StageColumn = ({ stage }) => {
  const [page, setPage] = useState(1);
  const [allPos, setAllPos] = useState(stage?.items?.pos || []);
  const [hasMore, setHasMore] = useState(stage?.items?.next || false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [shouldFetch, setShouldFetch] = useState(false); // Flag để kiểm soát việc gọi API
  const scrollContainerRef = useRef(null);

  const { data: listImportOutputItemsData, isLoading } = useListImportOutputItems(
    {
      stage_id: stage.stage_id,
      is_check_po: 1,
      page: page,
      limit: 10,
    },
    {
      enabled: shouldFetch && page > 1 && hasMore, // Chỉ gọi API khi shouldFetch = true và page > 1 và còn dữ liệu
    }
  );

  // Cập nhật dữ liệu khi có response mới từ API
  useEffect(() => {
    if (page > 1 && shouldFetch && !isLoading) {
      // Kiểm tra nếu response là mảng rỗng
      if (Array.isArray(listImportOutputItemsData) && listImportOutputItemsData.length === 0) {
        // Dữ liệu rỗng, dừng load more
        setHasMore(false);
        setIsLoadingMore(false);
        setShouldFetch(false);
        return;
      }

      // Kiểm tra nếu có dữ liệu (pos là mảng và có phần tử)
      if (listImportOutputItemsData?.pos && Array.isArray(listImportOutputItemsData.pos)) {
        if (listImportOutputItemsData.pos.length > 0) {
          // Có dữ liệu mới, merge vào danh sách
          setAllPos(prev => [...prev, ...listImportOutputItemsData.pos]);
          setHasMore(listImportOutputItemsData.next || false);
          setIsLoadingMore(false);
          setShouldFetch(false);
        } else {
          // pos là mảng rỗng, dừng load more
          setHasMore(false);
          setIsLoadingMore(false);
          setShouldFetch(false);
        }
      } else if (listImportOutputItemsData !== undefined) {
        // Response không có cấu trúc pos như mong đợi, dừng load more
        setHasMore(false);
        setIsLoadingMore(false);
        setShouldFetch(false);
      }
    }
  }, [listImportOutputItemsData, page, isLoading, isLoadingMore, shouldFetch]);

  // Khởi tạo dữ liệu từ stage ban đầu khi stage thay đổi
  useEffect(() => {
    if (stage?.items?.pos) {
      setAllPos(stage.items.pos);
      setHasMore(stage.items.next || false);
      setPage(1);
      setIsLoadingMore(false);
      setShouldFetch(false); // Reset flag khi stage thay đổi
    }
  }, [stage?.stage_id, stage?.items?.pos?.length]);

  // Xử lý scroll để load more
  const handleScroll = useCallback(
    e => {
      const target = e.target;
      const { scrollTop, scrollHeight, clientHeight } = target;
      const scrollBottom = scrollHeight - scrollTop - clientHeight;

      // Khi cuộn gần cuối (còn 100px), load thêm dữ liệu
      if (scrollBottom < 100 && hasMore && !isLoadingMore && !isLoading && !shouldFetch) {
        setIsLoadingMore(true);
        setShouldFetch(true); // Set flag để cho phép gọi API
        setPage(prev => prev + 1);
      }
    },
    [hasMore, isLoadingMore, isLoading, shouldFetch]
  );

  const totalCount = Number(stage?.items?.total_count || 0);

  return (
    <div className='w-[394px] flex-shrink-0 rounded-t-2xl pt-1 flex flex-col gap-3 bg-[#EBEBEB]/50 h-full'>
      <div className='px-4 py-3 flex flex-col gap-3 flex-shrink-0'>
        <div className='flex items-center gap-2 justify-between'>
          <div className='flex items-center gap-2 w-[70%]'>
            <PresentationChartIcon className='size-6' />
            <h3 className='responsive-text-2xl font-medium text-blue-fmrp truncate' title={stage.stage_name}>{stage.stage_name}</h3>
            <span className='bg-[#FD2424] min-w-4 h-4 flex items-center justify-center rounded-full px-1 responsive-text-xs font-normal text-white -mt-3 -ml-1'>{totalCount}</span>
          </div>
          <div className='border border-transparent hover:border-blue-fmrp hover:bg-blue-fmrp/10 rounded-lg p-1 cursor-pointer transition-all duration-300'>

          <UserPlus2Icon className='size-6 flex-shrink-0'/>
          </div>
        </div>
        <div className='flex items-center justify-between gap-2 bg-[#FFFFFF66] border border-white rounded-[14px] px-3 py-[14px]'>
          <div className='flex items-center gap-3'>
            <p className='responsive-text-base font-semibold text-[#1A7526]'>Tổng lệnh: {totalCount}</p>
          </div>
          <ProcessStatusDropdown processName={stage.stage_name} />
        </div>
      </div>
      <Customscrollbar className='flex-1 min-h-0 h-full' showOnHover={true} onScroll={handleScroll} ref={scrollContainerRef}>
        <div className='flex flex-col gap-2.5 px-4 pb-4'>
          {allPos.length > 0 ? (
            <>
              {allPos.map((po, index) => (
                <ProductionOrderCard
                  key={`${stage.stage_id}-${po.id}-${po.reference_no}-${index}`}
                  borderColor='#1A7526'
                  status='idle'
                  time='00 : 00 : 00'
                  po={po}
                  stage_id={stage.stage_id}
                  stage_name={stage.stage_name}
                />
              ))}
              {isLoadingMore && (
                <div className='flex items-center justify-center py-4'>
                  <p className='responsive-text-sm font-normal text-[#667085]'>Đang tải thêm...</p>
                </div>
              )}
            </>
          ) : (
            <div className='flex flex-col items-center justify-center gap-2 py-6 text-center text-[#637381]'>
              <Image src={IMAGES.nodataStage || IMAGES.nodata} alt='nodata' width={80} height={80} className='object-contain' />
              <p className='responsive-text-sm font-normal'>Chưa có lệnh sản xuất ở công đoạn này.</p>
            </div>
          )}
        </div>
      </Customscrollbar>
    </div>
  );
};

const ImportOutput = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchStaff, setSearchStaff] = useState('');
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [searchProcess, setSearchProcess] = useState('');
  const [debouncedSearchProcess] = useDebounce(searchProcess, 300);
  const [searchReferenceNo, setSearchReferenceNo] = useState('');
  const [debouncedSearchReferenceNo] = useDebounce(searchReferenceNo, 300);
  const [dateFilter, setDateFilter] = useState({
    dateStart: null,
    dateEnd: null,
  });

  const stateFilterDropdown = useSelector(state => state.stateFilterDropdown);

  const { isLoading: isLoadingListImportOutput, data: listImportOutput } = useListImportOutput({
    start_date: dateFilter.dateStart ? moment(dateFilter.dateStart).format('DD/MM/YYYY') : null,
    end_date: dateFilter.dateEnd ? moment(dateFilter.dateEnd).format('DD/MM/YYYY') : null,
    staff_id: selectedEmployee?.value,
    stage_ids: selectedProcess?.value,
    search: debouncedSearchReferenceNo || '',
  });
  const { data: listStaffs } = useSearchStaffs();
  const { data: listStages } = useLookupStages({ search: debouncedSearchProcess || '' });

  // Lấy dữ liệu nhân viên từ API
  const staffs = listStaffs?.data?.staffs || [];

  // Lấy dữ liệu công đoạn từ API (đã được filter từ server)
  const stagesList = listStages?.stages || [];

  // Dữ liệu ảo cho nhóm
  const mockGroups = [
    {
      id: 1,
      name: 'Nhóm may',
      code: 'NM001',
    },
    {
      id: 2,
      name: 'Nhóm cắt',
      code: 'NC001',
    },
    {
      id: 3,
      name: 'Nhóm thêu',
      code: 'NT001',
    },
  ];

  // Format options cho SelectSearchableRadio với filter theo search
  const employeeOptions = useMemo(() => {
    const options = [];

    // Filter nhân viên theo search
    const filteredStaffs = searchStaff
      ? staffs.filter(staff => {
          return searchWithoutDiacritics(staff?.full_name || '', searchStaff);
        })
      : staffs;

    // Thêm các nhân viên
    filteredStaffs.forEach(staff => {
      if (staff?.staffid && staff?.full_name) {
        options.push({
          value: String(staff.staffid),
          label: staff.full_name,
          avatar: staff.profile_image || IMAGES.noImage, // Fallback nếu không có avatar
        });
      }
    });

    // Filter nhóm theo search
    const filteredGroups = searchStaff
      ? mockGroups.filter(group => {
          return searchWithoutDiacritics(group.name, searchStaff) || searchWithoutDiacritics(group.code, searchStaff);
        })
      : mockGroups;

    // Thêm các nhóm
    filteredGroups.forEach(group => {
      options.push({
        value: `group_${group.id}`,
        label: group.name,
        icon: <UsersIcon className='size-6 text-blue-fmrp' />,
      });
    });

    return options;
  }, [searchStaff, staffs]);

  // Xử lý khi chọn nhân viên
  const handleEmployeeChange = value => {
    if (value === 'all') {
      setSelectedEmployee(null);
    } else {
      const selectedOption = employeeOptions.find(opt => opt.value === value);
      setSelectedEmployee(selectedOption ? { value, label: selectedOption.label } : null);
    }
  };

  // Xử lý khi search
  const handleEmployeeSearch = searchText => {
    setSearchStaff(searchText);
  };

  // Xử lý khi clear
  const handleEmployeeClear = () => {
    setSelectedEmployee(null);
    setSearchStaff('');
  };

  // Format options cho SelectSearchableRadio công đoạn (dữ liệu đã được filter từ API)
  const processOptions = useMemo(() => {
    return stagesList
      .filter(stage => stage?.id && stage?.name)
      .map(stage => ({
        value: String(stage.id),
        label: stage.name,
      }));
  }, [stagesList]);

  // Xử lý khi chọn công đoạn
  const handleProcessChange = value => {
    if (value === 'all') {
      setSelectedProcess(null);
    } else {
      const selectedOption = processOptions.find(opt => opt.value === value);
      setSelectedProcess(selectedOption ? { value, label: selectedOption.label } : null);
    }
  };

  // Xử lý khi search công đoạn
  const handleProcessSearch = searchText => {
    setSearchProcess(searchText);
  };

  // Xử lý khi clear công đoạn
  const handleProcessClear = () => {
    setSelectedProcess(null);
    setSearchProcess('');
  };

  const stages = listImportOutput?.stages || [];
  const hasStages = stages.length > 0;

  // Tính số lượng filter đang active
  const activeFilterCount = useMemo(() => {
    let count = 0;

    // Đếm date filter (chỉ tính 1 nếu có startDate hoặc endDate)
    if (dateFilter.dateStart || dateFilter.dateEnd) count++;

    return count;
  }, [dateFilter.dateStart, dateFilter.dateEnd]);

  // Trigger button cho FilterDropdown
  const triggerFilterAll = (
    <button
      className={`${
        stateFilterDropdown?.open || activeFilterCount > 0
          ? 'text-[#0F4F9E] border-[#3276FA] bg-[#EBF5FF]'
          : 'bg-white text-[#9295A4] border-[#D0D5DD] hover:text-[#0F4F9E] hover:bg-[#EBF5FF] hover:border-[#3276FA]'
      } flex items-center space-x-2 border rounded-lg h-10 px-3 group custom-transition`}
    >
      <span className='size-4 shrink-0'>
        <EqualizerIcon className='w-full h-full' />
      </span>
      <span className={`${stateFilterDropdown?.open || activeFilterCount > 0 ? 'text-[#0F4F9E]' : 'text-[#3A3E4C] group-hover:text-[#0F4F9E]'} text-nowrap text-sm custom-transition`}>Lọc</span>
      {activeFilterCount > 0 && <span className='rounded-full bg-[#0F4F9E] text-white text-xs size-5 flex items-center justify-center'>{activeFilterCount}</span>}
      <span className='size-3.5 shrink-0'>
        <CaretDownIcon className={`${stateFilterDropdown?.open || activeFilterCount > 0 ? 'rotate-180' : 'rotate-0'} w-full h-full custom-transition`} />
      </span>
    </button>
  );

  return (
    <div className='flex flex-col gap-5 h-screen max-h-screen'>
      <Head>
        <title>Nhập sản lượng</title>
      </Head>
      <header className='sticky top-0 z-10 pr-4 pl-8 py-5 bg-new-blue flex gap-10 items-center justify-between'>
        <Link href='/' className='relative flex items-center gap-5'>
          <Image
            alt=''
            src='/LOGO_HEADER.png'
            width={100}
            height={45}
            quality={100}
            className='3xl:w-[110px] 2xl:w-[100px] xl:w-[90px] w-[90px] h-auto object-contain'
            loading='lazy'
            crossOrigin='anonymous'
            placeholder='blur'
            blurDataURL='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
          />
          <h2 className='p-2 rounded-full bg-[#E2F0FE] responsive-text-base font-medium text-new-blue capitalize'>Trang quản lý</h2>
        </Link>
        <div className='flex items-center gap-3'>
          <button className='h-10 bg-white px-4 py-2 rounded-lg flex items-center gap-2 border border-[#D0D5DD]'>
            <ClockIcon className='size-5 text-black' />
            <span className='responsive-text-sm font-medium text[#25387A]'>Ca sáng</span>
          </button>
          <DropdownAvatar />
        </div>
      </header>
      <div className='flex flex-col gap-4 flex-1 min-h-0 max-h-full overflow-hidden'>
        <div className='flex items-center justify-between px-6'>
          <div className='flex items-center gap-2'>
            <h2 className='responsive-text-4xl font-medium text-neutral-07 capitalize'>Nhập sản lượng</h2>
            <InfoTooltip
              content=''
              iconProps={{
                className: '2xl:size-[21px] xl:size-[18px] size-[16px]',
              }}
            />
          </div>
          <div className='flex items-center gap-2'>
            <div className='h-10 w-[340px] bg-white px-3 py-2 rounded-lg flex items-center justify-between gap-2 border border-[#D0D5DD]'>
              <input
                className='flex-1 border-none outline-none responsive-text-base text[#3A3E4C]'
                placeholder='Tìm kiếm mã lệnh sản xuất'
                value={searchReferenceNo}
                onChange={e => setSearchReferenceNo(e.target.value)}
                onClick={e => e.stopPropagation()}
              />
              {searchReferenceNo && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setSearchReferenceNo('');
                  }}
                  className='flex items-center justify-center p-0.5 rounded hover:bg-[#F3F4F6] transition-colors'
                >
                  <CloseXIcon className='size-4 text-[#667085]' />
                </button>
              )}
              <div className='p-1 rounded-lg bg-[#1760B9]'>
                <SearchIcon className='size-4 text-white' />
              </div>
            </div>
            <SelectSearchableRadio
              placeholder='Lọc nhân viên'
              label='Lọc nhân viên'
              searchPlaceholder='Tìm nhân viên'
              options={employeeOptions}
              value={selectedEmployee}
              onChange={handleEmployeeChange}
              onSearch={handleEmployeeSearch}
              onClear={handleEmployeeClear}
              icon={<FunnelIcon className='size-4 text-[#003DA0]' />}
              className='w-auto min-w-[180px] [&_.ant-select-selector]:h-10 [&_.ant-select-selector]:border-[#D0D5DD]'
            />
            <SelectSearchableRadio
              placeholder='Lọc công đoạn'
              label='Lọc công đoạn'
              searchPlaceholder='Tìm công đoạn'
              options={processOptions}
              value={selectedProcess}
              onChange={handleProcessChange}
              onSearch={handleProcessSearch}
              onClear={handleProcessClear}
              icon={<FunnelIcon className='size-4 text-[#003DA0]' />}
              className='w-auto min-w-[180px] [&_.ant-select-selector]:h-10 [&_.ant-select-selector]:border-[#D0D5DD]'
            />
            <FilterDropdown
              trigger={triggerFilterAll}
              classNameContainer='!w-auto'
              style={{
                boxShadow: '0px 20px 24px -4px #10182814, 0px 4px 4px 0px #00000040',
              }}
              className='z-[999] flex flex-col gap-4 border-[#D8DAE5] rounded-lg min-w-[400px]'
              dropdownId='dropdownFilterImportOutput'
            >
              <div className='text-lg text-[#344054] font-medium'>Bộ lọc</div>
              <div className='space-y-1'>
                <h3 className='text-xs text-[#051B44] font-normal'>Thời gian</h3>
                <DateToDateComponent
                  placeholder='dd/mm/yyyy → dd/mm/yyyy'
                  value={{
                    startDate: dateFilter.dateStart || null,
                    endDate: dateFilter.dateEnd || null,
                  }}
                  onChange={value => {
                    setDateFilter({
                      dateStart: value?.startDate || null,
                      dateEnd: value?.endDate || null,
                    });
                  }}
                  className='text-base-default w-full'
                />
              </div>
            </FilterDropdown>
          </div>
        </div>

        <div className='w-full h-full flex-1 min-h-0 overflow-y-hidden'>
          {isLoadingListImportOutput ? (
            <div className='flex items-center justify-center h-full'>
              <Loading />
            </div>
          ) : hasStages ? (
            <Customscrollbar horizontalOnly={true} showOnHover={true} className='flex-1 min-h-0 h-full overflow-y-hidden'>
              <div className='px-6 flex gap-2 w-full h-full min-w-max overflow-y-hidden'>
                {stages.map(stage => (
                  <StageColumn key={stage.stage_id} stage={stage} />
                ))}
              </div>
            </Customscrollbar>
          ) : (
            <div className='flex flex-col gap-4 h-full w-full items-center justify-center'>
              <Image src={IMAGES.nodataStage || IMAGES.nodata} alt='nodata' width={165} height={165} className='object-contain' />
              <p className='responsive-text-sm font-normal text-[#637381]'>Chưa có công đoạn, vui lòng thiết kế ngay.</p>
              <Link href='/settings/category?tab=stages&page=1' className='px-3 py-2 rounded-lg responsive-text-lg font-medium text-white bg-blue-fmrp'>
                Thiết kế công đoạn
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportOutput;
