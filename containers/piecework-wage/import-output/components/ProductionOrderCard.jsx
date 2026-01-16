import { CalendarIcon, CheckDoubleIcon, Clock2Icon, ProgressIcon, UserPlusIcon } from '@/components/icons';
import AvatarText from '@/components/UI/common/user/AvatarText';
import PopupConfim from '@/components/UI/popupConfim/popupConfim';
import { IMAGES } from '@/constants/images';
import formatNumber from '@/utils/helpers/formatnumber';
import { Tooltip } from 'antd';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FaPause, FaPlay, FaStop } from 'react-icons/fa';
import PopupCompleteOrder from './modal/PopupCompleteOrder';
import PopupResponsiblePerson from './modal/PopupResponsiblePerson';

const Avatar = ({ group_members_assigned, staffs_assigned, onClick }) => {
  // Transform staffs_assigned và group_members_assigned thành format thống nhất
  const avatarList = useMemo(() => {
    const list = [];

    // Thêm nhân viên
    (staffs_assigned || []).forEach(staff => {
      list.push({
        id: String(staff?.staffid),
        name: staff?.full_name || '',
        profile_image: staff?.profile_image || null,
        type: 'staff',
      });
    });

    // Thêm nhóm (transform từ cấu trúc group_members_assigned)
    (group_members_assigned || []).forEach(group => {
      list.push({
        id: `group_${group?.id}`,
        name: group?.name || '',
        profile_image: null, // Nhóm không có profile_image, sẽ dùng icon nhóm
        type: 'group',
      });
    });

    return list;
  }, [staffs_assigned, group_members_assigned]);

  if (avatarList.length === 0) {
    return (
      <Tooltip title='Thêm người phụ trách' placement='top'>
        <button
          className='cursor-pointer flex items-center justify-start w-fit p-2 rounded-lg border border-[#003DA0] hover:bg-[#EBF5FF] transition-colors'
          onClick={e => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          <UserPlusIcon className='size-5 text-[#11315B]' />
        </button>
      </Tooltip>
    );
  }
  const isSingle = avatarList.length === 1;
  const maxDisplay = 10;
  const displayAvatars = avatarList.slice(0, maxDisplay);
  const remainingCount = avatarList.length > maxDisplay ? avatarList.length - maxDisplay : 0;

  return (
    <div
      className='flex items-center gap-2 justify-between w-fit cursor-pointer hover:opacity-80 transition-opacity'
      onClick={e => {
        e.stopPropagation();
        onClick?.();
      }}
    >
      <div className='p-1 flex items-center gap-1 rounded-full bg-[#D6EAFE]'>
        {displayAvatars.map((item, index) => {
          const isFirst = index === 0;
          const hasImage = item?.profile_image && item.profile_image.trim() !== '';
          const itemName = item?.name || 'Chưa có tên';
          const isGroup = item?.type === 'group';

          return (
            <Tooltip key={item?.id || index} title={itemName} placement='top'>
              {hasImage ? (
                <Image
                  src={item.profile_image}
                  alt={itemName}
                  width={100}
                  height={100}
                  className={`size-[30px] bg-[#E2E5E9] rounded-full overflow-hidden object-cover border-2 border-[#549AE8] ${isFirst ? '' : '-ml-3'} z-1 cursor-pointer`}
                />
              ) : isGroup ? (
                <Image
                  src={IMAGES.groupUser}
                  alt={itemName}
                  width={100}
                  height={100}
                  className={`size-[30px] bg-[#E2E5E9] rounded-full overflow-hidden object-cover border-2 border-[#549AE8] ${isFirst ? '' : '-ml-3'} z-1 cursor-pointer`}
                />
              ) : (
                <div className={`size-[30px] rounded-full overflow-hidden border-2 border-[#549AE8] flex items-center justify-center bg-white ${isFirst ? '' : '-ml-3'} z-1 cursor-pointer`}>
                  <AvatarText fullName={itemName} className='w-full h-full text-base flex items-center justify-center' />
                </div>
              )}
            </Tooltip>
          );
        })}
        {remainingCount > 0 && (
          <Tooltip title={`Còn ${remainingCount} người khác`} placement='top'>
            <div
              className={`size-[30px] rounded-full overflow-hidden border-2 border-[#549AE8] flex items-center justify-center bg-[#549AE8] text-white font-semibold responsive-text-xs -ml-3 z-1 cursor-pointer`}
            >
              +{remainingCount}
            </div>
          </Tooltip>
        )}
        {isSingle && (
          <span className='responsive-text-sm mr-1 font-medium text-[#101828] truncate max-w-[160px]' title={avatarList[0]?.name || ''}>
            {avatarList[0]?.name || ''}
          </span>
        )}
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

  return (
    <div className={`w-full flex justify-between items-center gap-2 rounded-2xl `}>
      <div className='flex items-center gap-1'>
        <Clock2Icon className='size-5 text-[#4E4E4E]' />
        <p className='responsive-text-xs font-semibold text-[#4E4E4E] whitespace-nowrap'>{time}</p>
      </div>
      <div
        className='flex items-center gap-1'
        onClick={e => {
          e.stopPropagation();
        }}
      >
        {renderButtons()}
      </div>
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

const ProductionOrderCard = ({ status = 'idle', time = '00 : 00 : 00', po, stage_id, stage_name, isSelectMode = false, isSelected = false, onToggleSelect, cardPage = 1, onRefetchPage }) => {
  const [statusState, setStatusState] = useState(status);
  const [elapsedSeconds, setElapsedSeconds] = useState(parseTimeString(time));
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showCompletePopup, setShowCompletePopup] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showResponsiblePersonPopup, setShowResponsiblePersonPopup] = useState(false);
  const intervalRef = useRef(null);

  // Tạo màu dựa trên số cuối của reference_no (0-9)
  const borderColor = useMemo(() => {
    const colors = [
      '#0375F3', // 0 - Màu xanh dương
      '#1A7526', // 1 - Màu xanh lá
      '#FF641C', // 2 - Màu cam
      '#EEB600', // 3 - Màu vàng
      '#9C27B0', // 4 - Màu tím
      '#E91E63', // 5 - Màu hồng
      '#00BCD4', // 6 - Màu cyan
      '#F44336', // 7 - Màu đỏ
      '#795548', // 8 - Màu nâu
      '#607D8B', // 9 - Màu xám xanh
    ];

    // Lấy số cuối của reference_no
    const referenceNo = (po?.reference_no || po?.id || '').toString();
    const lastDigit = referenceNo.match(/\d+$/)?.[0]?.slice(-1);

    // Nếu có số cuối, dùng nó để chọn màu (0-9), nếu không dùng màu đầu tiên
    const colorIndex = lastDigit ? parseInt(lastDigit, 10) : 0;

    return colors[colorIndex];
  }, [po?.reference_no, po?.id]);

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
    if (showResponsiblePersonPopup) return;
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
    <div
      className={`flex flex-col items-start gap-3 p-4 rounded-xl border transition-colors duration-300 ${
        isSelectMode
          ? isSelected
            ? 'border-[#1760B9] bg-[#EBF5FF] cursor-pointer'
            : 'border-[#1760B9]/40 bg-[#F3F4FF] cursor-pointer hover:border-blue-fmrp'
          : 'border-[#F3F4F680] bg-white cursor-pointer hover:border-blue-fmrp'
      }`}
      onClick={
        isSelectMode
          ? e => {
              e.stopPropagation();
              onToggleSelect?.();
            }
          : handleCardClick
      }
    >
      {isSelectMode && (
        <input
          type='checkbox'
          checked={isSelected}
          onChange={e => {
            e.stopPropagation();
            onToggleSelect?.();
          }}
          onClick={e => e.stopPropagation()}
          className='w-4 h-4 text-[#1760B9] rounded border-[#D0D5DD] focus:ring-[#1760B9] cursor-pointer flex-shrink-0'
        />
      )}
      <div className='w-full flex items-center justify-between gap-2'>
        <div className='py-0.5 px-2 border-l-2' style={{ borderColor }}>
          <h4 className='responsive-text-lg font-semibold mb-1' style={{ color: borderColor }}>
            {po?.reference_no || '---'}
          </h4>
          {hasMoreOrders ? (
            <Tooltip title={allOrdersText} placement='top' classNames={{ root: 'order-tooltip' }}>
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
      <div className='w-full'>
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
      <Avatar group_members_assigned={po?.group_members_assigned || []} staffs_assigned={po?.staffs_assigned || []} onClick={() => setShowResponsiblePersonPopup(true)} />
      <PopupResponsiblePerson
        open={showResponsiblePersonPopup}
        onClose={() => setShowResponsiblePersonPopup(false)}
        brandId={po?.branch_id}
        po_id={po?.id}
        stage_id={stage_id}
        cardPage={cardPage}
        onSaveSuccess={onRefetchPage}
      />

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
          <div key={index} className='p-1 flex items-center gap-2 w-full hover:bg-[#E3F0FF] rounded-lg'>
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

export default ProductionOrderCard;
