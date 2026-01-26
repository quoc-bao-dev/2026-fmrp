import { CalendarIcon, ProgressIcon } from '@/components/icons';
import PopupConfim from '@/components/UI/popupConfim/popupConfim';
import { IMAGES } from '@/constants/images';
import useToast from '@/hooks/useToast';
import { usePauseTimer, useResumeTimer, useStartTimer } from '@/managers/api/piecework-wage/useImportOutput';
import formatNumber from '@/utils/helpers/formatnumber';
import { Tooltip } from 'antd';
import moment from 'moment';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import Avatar from './Avatar';
import PopupCompleteOrder from './modal/PopupCompleteOrder';
import TimerControl from './TimerControl';

const formatTime = seconds => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = n => String(n).padStart(2, '0');
  return `${pad(h)} : ${pad(m)} : ${pad(s)}`;
};

const BORDER_COLORS = ['#0375F3', '#1A7526', '#FF641C', '#EEB600', '#9C27B0', '#E91E63', '#00BCD4', '#F44336', '#795548', '#607D8B'];

// Tạo màu dựa trên số cuối của reference_no (0-9)
const getBorderColor = po => {
  // Lấy số cuối của reference_no
  const referenceNo = (po?.reference_no || po?.id || '').toString();
  const lastDigit = referenceNo.match(/\d+$/)?.[0]?.slice(-1);

  // Nếu có số cuối, dùng nó để chọn màu (0-9), nếu không dùng màu đầu tiên
  const colorIndex = lastDigit ? parseInt(lastDigit, 10) : 0;

  return BORDER_COLORS[colorIndex];
};

const ProductionOrderCard = ({ po, stage_id, stage_name, isSelectMode = false, isSelected = false, onToggleSelect, filterParams = {}, onUpdatePo }) => {
  const showToast = useToast();
  const activeTimer = po?.active_timer && Object.keys(po.active_timer || {}).length ? po.active_timer : null;

  // Ref dùng để tick local dựa trên total_timer_with_current
  const timerCalcRef = useRef({
    startMs: null,
    baseSeconds: 0,
    status: null,
  });

  const getInitialStatus = () => {
    if (!po?.is_timer) return 'idle';
    const code = activeTimer?.status;
    if (code === '1') return 'running';
    if (code === '2') return 'paused';
    const total = Number(po?.total_timer);
    if (Number.isFinite(total) && total > 0) return 'completed';
    return 'idle';
  };

  const [statusState, setStatusState] = useState(getInitialStatus);
  const [elapsedSeconds, setElapsedSeconds] = useState(po?.total_timer_with_current);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [showCompletePopup, setShowCompletePopup] = useState(false);
  const [endTimerFlag, setEndTimerFlag] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [timesheetId, setTimesheetId] = useState(activeTimer?.id || null);
  const intervalRef = useRef(null);

  const { mutate: startTimerApi, isPending: isStartingTimer } = useStartTimer();
  const { mutate: pauseTimerApi, isPending: isPausingTimer } = usePauseTimer();
  const { mutate: resumeTimerApi, isPending: isResumingTimer } = useResumeTimer();

  const borderColor = useMemo(() => getBorderColor(po), [po?.reference_no, po?.id]);

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startLocalTick = (baseSeconds = 0) => {
    clearTimer();
    setStatusState('running');
    timerCalcRef.current = {
      ...(timerCalcRef.current || {}),
      startMs: Date.now(),
      baseSeconds: Number(baseSeconds) || 0,
      status: '1',
    };

    intervalRef.current = setInterval(() => {
      const cfg = timerCalcRef.current || {};
      const startMs = cfg.startMs;
      const base = Number(cfg.baseSeconds) || 0;
      if (!startMs) return;
      const nowSec = Math.floor((Date.now() - startMs) / 1000);
      setElapsedSeconds(Math.max(0, base + nowSec));
    }, 1000);
  };

  const ensureTimesheetId = () => {
    const tsId = Number(timesheetId || activeTimer?.id);
    if (!Number.isFinite(tsId)) {
      showToast('error', 'Không tìm thấy mã timesheet');
      return null;
    }
    return tsId;
  };

  const applyPausedUI = frozenSeconds => {
    clearTimer();
    timerCalcRef.current = {
      ...(timerCalcRef.current || {}),
      startMs: null,
      baseSeconds: Number(frozenSeconds) || 0,
      status: '2',
    };
    setStatusState('paused');
    setElapsedSeconds(Number(frozenSeconds) || 0);
  };

  const applyRunningUI = base => {
    const baseSeconds = Number(base) || 0;
    setElapsedSeconds(baseSeconds);
    startLocalTick(baseSeconds);
  };

  const startTimer = () => {
    if (statusState === 'running') return;
    // Nếu đang paused thì gọi resume, còn lại gọi start
    const isResume = statusState === 'paused';

    const poId = Number(po?.id);
    const stageId = Number(stage_id);
    const typeValue = Number(po?.is_product ?? 1); // 0: BTP, 1: TP

    if (!Number.isFinite(poId) || !Number.isFinite(stageId)) {
      showToast('error', 'Thiếu po_id hoặc stage_id');
      return;
    }

    if (isResume) {
      const tsId = ensureTimesheetId();
      if (!tsId) return;

      resumeTimerApi(
        { id: tsId },
        {
          onSuccess: data => {
            if (!data?.isSuccess) return;

            // Sau khi resume thành công, ưu tiên tiếp tục từ giá trị local hiện tại
            // để tránh bị giật về total_timer_with_current cũ (backend có thể chưa kịp sync).
            applyRunningUI(elapsedSeconds);
          },
        }
      );
      return;
    }

    startTimerApi(
      { po_id: poId, stage_id: stageId, type: Number.isFinite(typeValue) ? typeValue : 1 },
      {
        onSuccess: data => {
          if (!data?.isSuccess) return;

          const tsId = data?.data?.id ?? data?.data?.timesheet_id ?? data?.id ?? data?.timesheet_id ?? null;
          if (tsId) setTimesheetId(tsId);

          applyRunningUI(po?.total_timer_with_current);
        },
      }
    );
  };

  const pauseTimer = () => {
    if (statusState !== 'running') return;

    const tsId = ensureTimesheetId();
    if (!tsId) return;

    // Chốt thời gian tại thời điểm bấm, nhưng CHỈ apply lên UI khi API trả isSuccess === 1
    const frozenSeconds = Number(elapsedSeconds) || 0;

    pauseTimerApi(
      { id: tsId },
      {
        onSuccess: data => {
          if (!data?.isSuccess) return;

          applyPausedUI(frozenSeconds);
        },
      }
    );
  };

  const handleStopClick = () => {
    // Mở popup xác nhận thay vì dừng timer ngay
    setShowConfirmPopup(true);
  };

  const confirmStopTimer = () => {
    // clearTimer();
    // setStatusState('completed');
    setShowConfirmPopup(false);
    setEndTimerFlag(1);
    setShowCompletePopup(true);
  };

  const cancelStopTimer = () => {
    setShowConfirmPopup(false);
  };

  useEffect(() => {
    return () => clearTimer();
  }, []);

  useEffect(() => {
    // Đồng bộ khi po thay đổi (socket/refetch)
    const newActive = po?.active_timer && Object.keys(po.active_timer || {}).length ? po.active_timer : null;
    setTimesheetId(newActive?.id || null);

    const nextStatus = getInitialStatus();
    const nextSeconds = po?.total_timer_with_current;

    // Nếu UI đang ở trạng thái paused/completed do thao tác local thì không override elapsedSeconds ngay
    // (tránh nhảy về giá trị cũ khi backend chưa kịp cập nhật total_timer_with_current)
    const shouldSyncSeconds = statusState === 'running' || nextStatus === 'running' || statusState === 'idle';

    setStatusState(nextStatus);
    if (shouldSyncSeconds) {
      setElapsedSeconds(nextSeconds);
    }

    // total_timer_with_current: nếu đang chạy thì lấy số đó chạy tiếp
    if (newActive?.status === '1') {
      startLocalTick(shouldSyncSeconds ? nextSeconds : Number(elapsedSeconds) || 0);
    } else {
      timerCalcRef.current = {
        ...(timerCalcRef.current || {}),
        startMs: null,
        baseSeconds: shouldSyncSeconds ? Number(nextSeconds) || 0 : Number(elapsedSeconds) || 0,
        status: newActive?.status || null,
      };
      clearTimer();
    }
  }, [po?.active_timer, po?.is_timer, po?.total_timer_with_current]);

  const displayTime = formatTime(elapsedSeconds);

  const handleCardClick = () => {
    // Mở popup khi click vào card
    setEndTimerFlag(0);
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

  const orderTextContent = (
    <div className='flex items-center gap-1 flex-wrap'>
      <span className='responsive-text-xs font-normal text-[#667085]'>{displayText}</span>
      {hasMoreOrders && <span className='responsive-text-xs font-normal text-blue-fmrp cursor-pointer hover:underline'>xem thêm</span>}
    </div>
  );

  return (
    <div
      className={`flex flex-col items-start gap-3 p-4 rounded-xl border-2 transition-colors duration-300 ${isSelectMode
        ? isSelected
          ? 'border-[#1760B9] bg-[#EBF5FF]'
          : 'border-[#1760B9]/40 bg-[#F3F4FF] hover:bg-[#F4F8FF]'
        : 'border-[#F3F4F680] bg-white cursor-pointer hover:border-[#C3D7FF] hover:bg-[#F4F8FF] shadow-[0px_8px_7.2px_0px_#0000000A]'
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
          <p className='responsive-text-xxs font-normal text-[#667085]'>{moment(po?.date).format('DD/MM/YYYY')}</p>
        </div>
      </div>
      <div className='w-full'>
        <TimerControl
          showTimerControl={po?.is_timer}
          time={displayTime}
          status={statusState}
          onStart={!isStartingTimer && !isResumingTimer ? startTimer : undefined}
          onPause={!isPausingTimer ? pauseTimer : undefined}
          onStop={handleStopClick}
          onComplete={() => {
            setEndTimerFlag(0);
            setShowCompletePopup(true);
          }}
        />
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
      <PopupCompleteOrder
        stage_id={stage_id}
        stage_name={stage_name}
        po={po}
        isOpen={showCompletePopup}
        onClose={() => setShowCompletePopup(false)}
        is_production_input={1}
        timesheet_id={timesheetId || activeTimer?.id}
        start_date={filterParams?.start_date}
        end_date={filterParams?.end_date}
        is_product={po?.is_product}
        end_timer={endTimerFlag}
      />
      <Avatar group_members_assigned={po?.group_members_assigned || []} staffs_assigned={po?.staffs_assigned || []} />

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
