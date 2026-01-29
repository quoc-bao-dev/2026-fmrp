import TabSwitcherWithUnderline from '@/components/common/tab/TabSwitcherWithUnderline';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import PopupCustom from '@/components/UI/popup';
import { useDetailStaffByPo, useHistoryPurchaseProduct, useHistoryTimers } from '@/managers/api/productions-order/useProductionOutput';
import formatMoneyOrDash from '@/utils/helpers/formatMoneyOrDash';
import formatNumber from '@/utils/helpers/formatnumber';
import { formatSecondsToHours, formatSecondsToHoursMinutesSeconds } from '@/utils/helpers/formatSecondsToHours';
import moment from 'moment';
import Image from 'next/image';
import { memo, useEffect, useRef, useState } from 'react';

const tabs = [
  { id: 'quantity', name: 'Lịch sử nhập sản lượng' },
  { id: 'time', name: 'Lịch sử bấm giờ' },
];

const PieceworkWageDetailModal = ({ open, onClose, worker, po_id }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const quantityScrollRef = useRef(null);
  const timeScrollRef = useRef(null);

  // State cho tab "Lịch sử nhập sản lượng"
  const [allQuantityItems, setAllQuantityItems] = useState([]);
  const [quantityCursor, setQuantityCursor] = useState(0);
  const [quantityHasMore, setQuantityHasMore] = useState(false);
  const [isLoadingMoreQuantity, setIsLoadingMoreQuantity] = useState(false);

  // State cho tab "Lịch sử bấm giờ"
  const [allTimeItems, setAllTimeItems] = useState([]);
  const [timeCursor, setTimeCursor] = useState(0);
  const [timeHasMore, setTimeHasMore] = useState(false);
  const [isLoadingMoreTime, setIsLoadingMoreTime] = useState(false);

  const { data: detailStaff } = useDetailStaffByPo({ po_id: po_id, staff_id: worker?.staff_id }, { enabled: open });

  // Hook cho tab "Lịch sử nhập sản lượng"
  const { data: historyPurchaseProduct, isLoading: isLoadingQuantity } = useHistoryPurchaseProduct(
    {
      po_id: po_id,
      staff_id: worker?.staff_id,
      cursor: quantityCursor,
      limit: 20,
    },
    { enabled: !!po_id && !!worker?.staff_id && activeTab?.id === 'quantity' && (quantityCursor === 0 || (quantityCursor > 0 && quantityHasMore)) && open }
  );

  // Hook cho tab "Lịch sử bấm giờ"
  const { data: historyTimers, isLoading: isLoadingTime } = useHistoryTimers(
    {
      po_id: po_id,
      staff_id: worker?.staff_id,
      cursor: timeCursor,
      limit: 20,
    },
    { enabled: !!po_id && !!worker?.staff_id && activeTab?.id === 'time' && (timeCursor === 0 || (timeCursor > 0 && timeHasMore)) && open }
  );

  // Reset khi mở modal hoặc thay đổi worker/po_id
  useEffect(() => {
    if (open && po_id && worker?.staff_id) {
      // Reset state khi modal mở với po_id hoặc worker mới
      setAllQuantityItems([]);
      setQuantityCursor(0);
      setQuantityHasMore(false);
      setIsLoadingMoreQuantity(false);
      setAllTimeItems([]);
      setTimeCursor(0);
      setTimeHasMore(false);
      setIsLoadingMoreTime(false);
    } else if (!open) {
      // Reset khi modal đóng
      setAllQuantityItems([]);
      setQuantityCursor(0);
      setQuantityHasMore(false);
      setIsLoadingMoreQuantity(false);
      setAllTimeItems([]);
      setTimeCursor(0);
      setTimeHasMore(false);
      setIsLoadingMoreTime(false);
    }
  }, [open, po_id, worker?.staff_id]);

  // Cập nhật danh sách items cho tab "Lịch sử nhập sản lượng"
  useEffect(() => {
    if (historyPurchaseProduct?.items && !isLoadingQuantity && activeTab?.id === 'quantity') {
      if (quantityCursor === 0) {
        // Lần đầu tiên, reset danh sách
        setAllQuantityItems(historyPurchaseProduct.items);
      } else {
        // Load thêm, merge vào danh sách
        setAllQuantityItems(prev => [...prev, ...historyPurchaseProduct.items]);
      }
      setQuantityHasMore(historyPurchaseProduct.has_more || false);
      setIsLoadingMoreQuantity(false);
    }
  }, [historyPurchaseProduct, quantityCursor, isLoadingQuantity, activeTab?.id]);

  // Cập nhật danh sách items cho tab "Lịch sử bấm giờ"
  useEffect(() => {
    if (historyTimers?.items && !isLoadingTime && activeTab?.id === 'time') {
      if (timeCursor === 0) {
        // Lần đầu tiên, reset danh sách
        setAllTimeItems(historyTimers.items);
      } else {
        // Load thêm, merge vào danh sách
        setAllTimeItems(prev => [...prev, ...historyTimers.items]);
      }
      setTimeHasMore(historyTimers.has_more || false);
      setIsLoadingMoreTime(false);
    }
  }, [historyTimers, timeCursor, isLoadingTime, activeTab?.id]);

  // Handler scroll để load more cho tab "Lịch sử nhập sản lượng"
  const handleQuantityScroll = e => {
    const target = e.target;
    const { scrollTop, scrollHeight, clientHeight } = target;
    const scrollBottom = scrollHeight - scrollTop - clientHeight;

    // Khi cuộn gần cuối (còn 50px), load thêm dữ liệu
    if (scrollBottom < 50 && quantityHasMore && !isLoadingMoreQuantity && !isLoadingQuantity && allQuantityItems.length > 0) {
      const lastItem = allQuantityItems[allQuantityItems.length - 1];
      if (lastItem?.ppi_id) {
        setIsLoadingMoreQuantity(true);
        setQuantityCursor(Number(lastItem.ppi_id));
      }
    }
  };

  // Handler scroll để load more cho tab "Lịch sử bấm giờ"
  const handleTimeScroll = e => {
    const target = e.target;
    const { scrollTop, scrollHeight, clientHeight } = target;
    const scrollBottom = scrollHeight - scrollTop - clientHeight;

    // Khi cuộn gần cuối (còn 50px), load thêm dữ liệu
    if (scrollBottom < 50 && timeHasMore && !isLoadingMoreTime && !isLoadingTime && allTimeItems.length > 0) {
      const lastItem = allTimeItems[allTimeItems.length - 1];
      if (lastItem?.id) {
        setIsLoadingMoreTime(true);
        setTimeCursor(Number(lastItem.id));
      }
    }
  };

  useEffect(() => {
    // Scroll về đầu table khi chuyển tab
    if (activeTab?.id === 'quantity' && quantityScrollRef.current) {
      quantityScrollRef.current.scrollTo({
        top: 0,
        behavior: 'instant',
      });
    } else if (activeTab?.id === 'time' && timeScrollRef.current) {
      timeScrollRef.current.scrollTo({
        top: 0,
        behavior: 'instant',
      });
    }
  }, [activeTab]);

  return (
    <PopupCustom
      title={
        <div className='flex items-center justify-between w-full'>
          <h2 className='text-[20px] leading-5 font-semibold text-[#141522]'>Chi tiết lương sản lượng</h2>
        </div>
      }
      classNameModeltime='px-6 2xl:px-10 3xl:px-12 py-4 2xl:py-5 3xl:py-6 flex flex-col gap-2'
      lockScroll={true}
      open={open}
      classNameIconClose='size-8 bg-white hover:bg-slate-200 text-[#9295A4] hover:text-slate-800'
      onClose={onClose}
    >
      {/* Thông tin công nhân + Tổng giờ/chi phí */}
      <div className='flex items-start justify-between gap-8 px-4 w-[1000px]'>
        {/* Cột 1 - Thông tin công nhân */}
        <div className='flex-1 flex flex-col gap-3'>
          <h3 className='text-[20px] leading-5 font-medium text-[#11315B] mb-2'>Thông tin công nhân</h3>
          <div className='flex flex-col gap-3 text-[16px] leading-none'>
            <div className='flex gap-2'>
              <span className='font-light text-[#3A3E4C] min-w-[83px]'>Tên:</span>
              <span className='font-medium text-[#0375F3]'>{detailStaff?.staff?.full_name}</span>
            </div>
            <div className='flex gap-2'>
              <span className='font-light text-[#3A3E4C] min-w-[83px]'>Chi nhánh:</span>
              <span className='font-medium text-[#141522]'>{detailStaff?.staff_branchs?.map(branch => branch.branch_name).join(', ')}</span>
            </div>
            <div className='flex gap-2'>
              <span className='font-light text-[#3A3E4C] min-w-[83px]'>Nhóm:</span>
              <span className='font-medium text-[#141522]'>{detailStaff?.group_member?.group_name || '-'}</span>
            </div>
          </div>
        </div>

        {/* Cột 2 - Tổng giờ làm & Tổng chi phí */}
        <div className='flex flex-col gap-3 w-[366px]'>
          <div className='flex items-center justify-between w-full rounded-lg px-4 py-3 bg-[#FFF1E4]'>
            <span className='text-[14px] font-medium text-[#667085]'>Tổng giờ làm</span>
            <span className='text-[24px] leading-7 font-semibold text-[#DC6803]'>{formatSecondsToHours(detailStaff?.total_time)}/tuần</span>
          </div>
          <div className='flex items-center justify-between w-full rounded-lg px-4 py-3 bg-[#E2F0FF]'>
            <span className='text-[14px] font-medium text-[#667085]'>Tổng chi phí</span>
            <span className='text-[24px] leading-7 font-semibold text-[#0375F3]'>{formatMoneyOrDash(+detailStaff?.amount)}</span>
          </div>
        </div>
      </div>

      <div className='flex flex-col gap-0'>
        {/* Tabs */}
        <div className='mt-4'>
          <TabSwitcherWithUnderline
            className=''
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {/* Nội dung theo tab */}
        {activeTab?.id === 'quantity' ? (
          <div className='mt-4 flex flex-col overflow-hidden flex-1 min-h-[360px]'>
            {/* Header table – tham khảo PopupConfimStage */}
            <div className='grid grid-cols-24 items-center border-b border-[#F3F3F4] bg-white flex-shrink-0 py-2'>
              <h3 className='col-span-2 text-center text-sm font-semibold text-[#9295A4] py-2 px-1'>STT</h3>
              <h3 className='col-span-4 text-sm font-semibold text-[#9295A4] px-2'>Ngày</h3>
              <h3 className='col-span-7 text-sm font-semibold text-[#9295A4] px-2'>Sản phẩm</h3>
              <h3 className='col-span-3 text-sm font-semibold text-[#9295A4] text-center px-2'>Công đoạn</h3>
              <h3 className='col-span-3 text-sm font-semibold text-[#9295A4] text-center px-2'>Đơn giá</h3>
              <h3 className='col-span-2 text-sm font-semibold text-[#9295A4] text-center px-2'>Số lượng</h3>
              <h3 className='col-span-3 text-sm font-semibold text-[#9295A4] text-center px-2'>Thành tiền</h3>
            </div>

            <Customscrollbar ref={quantityScrollRef} className='flex-1 min-h-0 max-h-[300px]' onScroll={handleQuantityScroll}>
              {!allQuantityItems || allQuantityItems.length === 0 ? (
                isLoadingQuantity ? <Loading /> : <NoData />
              ) : (
                <>
                  {allQuantityItems.map((row, index) => {
                    return (
                      <div
                        key={row.ppi_id}
                        className={`grid grid-cols-24 gap-2 items-center py-3 ${index === allQuantityItems.length - 1 ? '' : 'border-b border-[#F3F3F4]'
                          }`}
                      >
                        <div className='col-span-2 flex items-center justify-center text-xs font-semibold text-[#141522]'>{index + 1}</div>
                        <div className='col-span-4 text-sm font-semibold text-[#141522]'>{moment(row.date).format('DD/MM/YYYY')}</div>
                        <div className='col-span-7 flex items-center gap-3 px-2'>
                          <div className='h-12 w-12 rounded-lg bg-[#F3F4F6] flex items-center justify-center overflow-hidden flex-shrink-0'>
                            <Image src={row.item?.images || '/icon/default/default.png'} alt={row.item?.item_name} width={48} height={48} className='object-cover' />
                          </div>
                          <div className='flex flex-col gap-0.5 min-w-0'>
                            <span className='text-sm font-semibold text-[#141522] truncate'>{row.item?.item_name}</span>
                            <span className='text-xs text-[#667085]'>{row.item?.variation}</span>
                            <span className='text-xs text-[#0375F3] truncate'>{row.item?.item_code}</span>
                            <span className='text-xs text-[#0375F3] truncate'>{row.reference_no_detail}</span>
                          </div>
                        </div>
                        <div className='col-span-3 text-sm font-semibold text-[#141522] text-center'>{row.stage_name}</div>
                        <div className='col-span-3 text-sm font-semibold text-[#0375F3] text-center'>{formatMoneyOrDash(+row.price_salary)}</div>
                        <div className='col-span-2 text-sm font-semibold text-[#141522] text-center'>{formatNumber(+row.quantity_success)}</div>
                        <div className='col-span-3 text-sm font-semibold text-[#0375F3] text-center'>{formatMoneyOrDash(+row.amount_salary_success)}</div>
                      </div>
                    );
                  })}
                  {isLoadingMoreQuantity && (
                    <div className='flex items-center justify-center py-4'>
                      <span className='text-sm text-[#9295A4]'>Đang tải thêm...</span>
                    </div>
                  )}
                </>
              )}
            </Customscrollbar>
          </div>
        ) : (
          <div className='mt-4 flex flex-col overflow-hidden flex-1 min-h-[360px]'>
            {/* Header table */}
            <div className='grid grid-cols-24 items-center border-b border-[#F3F3F4] bg-white flex-shrink-0 py-2'>
              <h3 className='col-span-4 text-center text-sm font-semibold text-[#9295A4] py-2 px-1'>STT</h3>
              <h3 className='col-span-5 text-sm font-semibold text-[#9295A4] px-2'>Ngày</h3>
              <h3 className='col-span-5 text-sm font-semibold text-[#9295A4] text-center px-2'>Bắt đầu</h3>
              <h3 className='col-span-5 text-sm font-semibold text-[#9295A4] text-center px-2'>Kết thúc</h3>
              <h3 className='col-span-5 text-sm font-semibold text-[#9295A4] text-center px-2'>Tổng thời gian</h3>
            </div>

            <Customscrollbar ref={timeScrollRef} className='flex-1 min-h-0 max-h-[300px]' onScroll={handleTimeScroll}>
              {!allTimeItems || allTimeItems.length === 0 ? (
                isLoadingTime ? <Loading /> : <NoData />
              ) : (
                <>
                  {allTimeItems.map((row, index) => {
                    // Format thời gian từ "2026-01-21 10:40:06" sang "10:40:06"
                    const formatTime = dateString => {
                      if (!dateString) return '-';
                      return moment(dateString).format('HH:mm:ss');
                    };

                    return (
                      <div
                        key={row.id}
                        className={`grid grid-cols-24 gap-2 items-center py-6 ${index === allTimeItems.length - 1 ? '' : 'border-b border-[#F3F3F4]'}`}
                      >
                        <div className='col-span-4 flex items-center justify-center text-xs font-semibold text-[#141522]'>{index + 1}</div>
                        <div className='col-span-5 text-sm font-semibold text-[#141522]'>{moment(row.start_time).format('DD/MM/YYYY')}</div>
                        <div className='col-span-5 text-sm font-semibold text-center' style={{ color: '#19B133' }}>
                          {formatTime(row.start_time)}
                        </div>
                        <div className='col-span-5 text-sm font-semibold text-center' style={{ color: '#FF0606' }}>
                          {row.end_time ? formatTime(row.end_time) : row.status_name || '-'}
                        </div>
                        <div className='col-span-5 text-sm font-semibold text-center' style={{ color: '#DC6803' }}>
                          {formatSecondsToHoursMinutesSeconds(row.total_time)}
                        </div>
                      </div>
                    );
                  })}
                  {isLoadingMoreTime && (
                    <div className='flex items-center justify-center py-4'>
                      <span className='text-sm text-[#9295A4]'>Đang tải thêm...</span>
                    </div>
                  )}
                </>
              )}
            </Customscrollbar>
          </div>
        )}
      </div>
    </PopupCustom>
  );
};

export default memo(PieceworkWageDetailModal);
