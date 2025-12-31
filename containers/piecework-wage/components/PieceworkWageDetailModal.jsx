import PopupCustom from '@/components/UI/popup';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import Image from 'next/image';
import { useState, memo, useEffect, useRef } from 'react';

const quantityHistoryMock = [
  {
    id: 1,
    date: '25/12/2025',
    productName: 'Áo sơ mi basic 01',
    thumbnail: '/icon/default/default.png',
    productCode: 'TP-000001',
    reference: 'LSXCT-13032519',
    stage: 'May',
    unitPrice: '300.000 đ',
    quantity: 2,
    amount: '2.000.000 đ',
  },
  {
    id: 2,
    date: '25/12/2025',
    productName: 'Áo sơ mi basic 01',
    thumbnail: '/icon/default/default.png',
    productCode: 'TP-000001',
    reference: 'LSXCT-13032519',
    stage: 'Cắt',
    unitPrice: '300.000 đ',
    quantity: 4,
    amount: '300.000 đ',
  },
  {
    id: 3,
    date: '25/12/2025',
    productName: 'Áo sơ mi basic 01',
    thumbnail: '/icon/default/default.png',
    productCode: 'TP-000001',
    reference: 'LSXCT-13032519',
    stage: 'May',
    unitPrice: '300.000 đ',
    quantity: 1,
    amount: '300.000 đ',
  },
  {
    id: 4,
    date: '25/12/2025',
    productName: 'Áo sơ mi basic 01',
    thumbnail: '/icon/default/default.png',
    productCode: 'TP-000001',
    reference: 'LSXCT-13032519',
    stage: 'May',
    unitPrice: '300.000 đ',
    quantity: 1,
    amount: '300.000 đ',
  },
  {
    id: 5,
    date: '25/12/2025',
    productName: 'Áo sơ mi basic 01',
    thumbnail: '/icon/default/default.png',
    productCode: 'TP-000001',
    reference: 'LSXCT-13032519',
    stage: 'Cắt',
    unitPrice: '300.000 đ',
    quantity: 2,
    amount: '300.000 đ',
  },
];

const timeHistoryMock = [
  {
    id: 1,
    date: '25/12/2025',
    startTime: '09:00:12',
    endTime: '15:34:12',
    totalTime: '6h30p',
  },
  {
    id: 2,
    date: '25/12/2025',
    startTime: '09:00:12',
    endTime: '15:34:12',
    totalTime: '6h30p',
  },
  {
    id: 3,
    date: '25/12/2025',
    startTime: '09:00:12',
    endTime: '15:34:12',
    totalTime: '6h30p',
  },
  {
    id: 4,
    date: '25/12/2025',
    startTime: '09:00:12',
    endTime: '15:34:12',
    totalTime: '6h30p',
  },
  {
    id: 5,
    date: '25/12/2025',
    startTime: '09:00:12',
    endTime: '15:34:12',
    totalTime: '6h30p',
  },
];

const tabs = [
  { id: 'quantity', label: 'Lịch sử nhập sản lượng' },
  { id: 'time', label: 'Lịch sử bấm giờ' },
];

const PieceworkWageDetailModal = ({ open, onClose, worker }) => {
  const [activeTab, setActiveTab] = useState('quantity');
  const quantityScrollRef = useRef(null);
  const timeScrollRef = useRef(null);

  useEffect(() => {
    // Scroll về đầu table khi chuyển tab
    if (activeTab === 'quantity' && quantityScrollRef.current) {
      quantityScrollRef.current.scrollTo({
        top: 0,
        behavior: 'instant',
      });
    } else if (activeTab === 'time' && timeScrollRef.current) {
      timeScrollRef.current.scrollTo({
        top: 0,
        behavior: 'instant',
      });
    }
  }, [activeTab]);

  const workerName = worker?.workers?.[0]?.name || 'Nguyễn Thành';

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
              <span className='font-medium text-[#0375F3]'>{workerName}</span>
            </div>
            <div className='flex gap-2'>
              <span className='font-light text-[#3A3E4C] min-w-[83px]'>Chi nhánh:</span>
              <span className='font-medium text-[#141522]'>Hồ Chí Minh</span>
            </div>
            <div className='flex gap-2'>
              <span className='font-light text-[#3A3E4C] min-w-[83px]'>Nhóm:</span>
              <span className='font-medium text-[#141522]'>May 1</span>
            </div>
          </div>
        </div>

        {/* Cột 2 - Tổng giờ làm & Tổng chi phí */}
        <div className='flex flex-col gap-3 w-[366px]'>
          <div className='flex items-center justify-between w-full rounded-lg px-4 py-3 bg-[#FFF1E4]'>
            <span className='text-[14px] font-medium text-[#667085]'>Tổng giờ làm</span>
            <span className='text-[24px] leading-7 font-semibold text-[#DC6803]'>20 giờ/tuần</span>
          </div>
          <div className='flex items-center justify-between w-full rounded-lg px-4 py-3 bg-[#E2F0FF]'>
            <span className='text-[14px] font-medium text-[#667085]'>Tổng chi phí</span>
            <span className='text-[24px] leading-7 font-semibold text-[#0375F3]'>2.000.000 đ</span>
          </div>
        </div>
      </div>

      <div className='flex flex-col gap-0'>
        {/* Tabs */}
        <div className='mt-6 border-b border-[#E4E7EC] flex gap-6'>
          {tabs.map(tab => (
            <button
              key={tab.id}
              type='button'
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium whitespace-nowrap ${activeTab === tab.id ? 'text-[#0375F3] border-b-2 border-[#0375F3]' : 'text-[#667085]'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Nội dung theo tab */}
        {activeTab === 'quantity' ? (
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

            <Customscrollbar ref={quantityScrollRef} className='flex-1 min-h-0 max-h-[300px]'>
              {quantityHistoryMock.map((row, index) => (
                <div key={row.id} className={`grid grid-cols-24 gap-2 items-center py-3 ${index === quantityHistoryMock.length - 1 ? '' : 'border-b border-[#F3F3F4]'}`}>
                  <div className='col-span-2 flex items-center justify-center text-xs font-semibold text-[#141522]'>{index + 1}</div>

                  <div className='col-span-4 text-sm font-semibold text-[#141522]'>{row.date}</div>

                  <div className='col-span-7 flex items-center gap-3 px-2'>
                    <div className='h-12 w-12 rounded-lg bg-[#F3F4F6] flex items-center justify-center overflow-hidden'>
                      <Image src={row.thumbnail} alt={row.productName} width={48} height={48} className='object-cover' />
                    </div>
                    <div className='flex flex-col gap-0.5'>
                      <span className='text-sm font-semibold text-[#141522]'>{row.productName}</span>
                      <span className='text-xs text-[#667085]'>(none)</span>
                      <span className='text-xs text-[#0375F3]'>{row.productCode}</span>
                      <span className='text-xs text-[#0375F3]'>{row.reference}</span>
                    </div>
                  </div>

                  <div className='col-span-3 text-sm font-semibold text-[#141522] text-center'>{row.stage}</div>

                  <div className='col-span-3 text-sm font-semibold text-[#0375F3] text-center'>{row.unitPrice}</div>

                  <div className='col-span-2 text-sm font-semibold text-[#141522] text-center'>{row.quantity}</div>

                  <div className='col-span-3 text-sm font-semibold text-[#0375F3] text-center'>{row.amount}</div>
                </div>
              ))}
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

            <Customscrollbar ref={timeScrollRef} className='flex-1 min-h-0 max-h-[300px]'>
              {timeHistoryMock.map((row, index) => (
                <div key={row.id} className={`grid grid-cols-24 gap-2 items-center py-6 ${index === timeHistoryMock.length - 1 ? '' : 'border-b border-[#F3F3F4]'}`}>
                  <div className='col-span-4 flex items-center justify-center text-xs font-semibold text-[#141522]'>{index + 1}</div>

                  <div className='col-span-5 text-sm font-semibold text-[#141522]'>{row.date}</div>

                  <div className='col-span-5 text-sm font-semibold text-center' style={{ color: '#19B133' }}>
                    {row.startTime}
                  </div>

                  <div className='col-span-5 text-sm font-semibold text-center' style={{ color: '#FF0606' }}>
                    {row.endTime}
                  </div>

                  <div className='col-span-5 text-sm font-semibold text-center' style={{ color: '#DC6803' }}>
                    {row.totalTime}
                  </div>
                </div>
              ))}
            </Customscrollbar>
          </div>
        )}
      </div>
    </PopupCustom>
  );
};

export default memo(PieceworkWageDetailModal);
