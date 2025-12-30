import { TaskActionIcon } from '@/components/icons';
import { AvatarStack } from '@/components/UI/common/user';
import NoData from '@/components/UI/noData/nodata';
import { memo, useState } from 'react';
import PieceworkWageDetailModal from './PieceworkWageDetailModal';

// Mock data dựa trên hình ảnh
const mockData = [
  {
    id: 1,
    workers: [{ id: 1, name: 'Thành', avatarUrl: '/icon/default/default.png' }],
    workingHours: '4h',
    quantity: '4 cái',
    pieceworkWage: '1.250.000',
  },
  {
    id: 2,
    workers: [{ id: 1, name: 'Thành', avatarUrl: '/icon/default/default.png' }],
    workingHours: '16h',
    quantity: '4 cái',
    pieceworkWage: '1.250.000',
  },
  {
    id: 3,
    workers: [{ id: 1, name: 'Thành', avatarUrl: '/icon/default/default.png' }],
    workingHours: '4h',
    quantity: '4 cái',
    pieceworkWage: '1.250.000',
  },
  {
    id: 4,
    workers: [{ id: 1, name: 'Thành', avatarUrl: '/icon/default/default.png' }],
    workingHours: '8h',
    quantity: '4 cái',
    pieceworkWage: '1.250.000',
  },
  {
    id: 5,
    workers: [{ id: 1, name: 'Thành', avatarUrl: '/icon/default/default.png' }],
    workingHours: '8h',
    quantity: '4 cái',
    pieceworkWage: '1.250.000',
  },
  {
    id: 6,
    workers: [{ id: 1, name: 'Thành', avatarUrl: '/icon/default/default.png' }],
    workingHours: '8h',
    quantity: '4 cái',
    pieceworkWage: '1.250.000',
  },
  {
    id: 7,
    workers: [{ id: 1, name: 'Thành', avatarUrl: '/icon/default/default.png' }],
    workingHours: '8h',
    quantity: '4 cái',
    pieceworkWage: '1.250.000',
  },
  {
    id: 8,
    workers: [{ id: 1, name: 'Thành', avatarUrl: '/icon/default/default.png' }],
    workingHours: '8h',
    quantity: '4 cái',
    pieceworkWage: '1.250.000',
  },
];

const PieceworkWageTable = memo(() => {
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  const handleOpenDetail = item => {
    setSelectedWorker(item);
    setOpenDetail(true);
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
  };

  return (
    <>
      <div className='flex flex-col gap-0 h-full'>
        {/* Header */}
        <div className='col-span-16 grid grid-cols-23 gap-2 pb-4 border-b'>
          <h4 className='xl:text-sm text-xs text-center text-[#9295A4] font-semibold col-span-2 px-1'>STT</h4>
          <h4 className='xl:text-sm text-xs text-start text-[#9295A4] font-semibold col-span-5 px-1'>Công nhân</h4>
          <h4 className='xl:text-sm text-xs text-center text-[#9295A4] font-semibold col-span-3 px-1'>Giờ làm</h4>
          <h4 className='xl:text-sm text-xs text-center text-[#9295A4] font-semibold col-span-3 px-1'>Số lượng</h4>
          <h4 className='xl:text-sm text-xs text-center text-[#9295A4] font-semibold col-span-6 px-1'>Lương sản lượng</h4>
          <h4 className='xl:text-sm text-xs text-center text-[#9295A4] font-semibold col-span-4 px-1'>Tác vụ</h4>
        </div>

        <div className='max-h-[390px] overflow-y-auto'>
          {/* Rows */}
          {mockData.length === 0 ? (
            <div className='h-full flex items-center justify-center py-6'>
              <NoData type='table' />
            </div>
          ) : (
            mockData.map((item, index) => (
              <div
                key={item.id}
                className={`col-span-16 grid grid-cols-23 gap-2 items-center group hover:bg-gray-100 transition-all duration-150 ease-in-out py-2  ${
                  mockData.length - 1 === index ? 'border-transparent' : 'border-b'
                }`}
              >
                <h4 className='col-span-2 flex items-center justify-center text-center text-[#141522] font-semibold xl:text-sm text-xs uppercase px-1'>{index + 1}</h4>

                <h4 className='col-span-5 text-[#344054] font-normal flex items-center py-2 px-1'>
                  <AvatarStack people={item.workers} size={32} />
                </h4>

                <h4 className='col-span-3 text-center text-[#141522] font-semibold xl:text-sm text-xs px-1'>{item.workingHours}</h4>

                <h4 className='col-span-3 text-center text-[#141522] font-semibold xl:text-sm text-xs px-1'>{item.quantity}</h4>

                <h4 className='col-span-6 text-center text-[#141522] font-semibold xl:text-sm text-xs px-1'>
                  <span className='text-blue-fmrp'>{item.pieceworkWage}</span>
                </h4>

                <h4 className='col-span-4 flex items-center justify-center px-1'>
                  <button
                    className='flex items-center justify-center gap-2 cursor-pointer bg-blue-fmrp hover:opacity-80 transition-opacity'
                    style={{
                      height: 34,
                      borderRadius: 8,
                      opacity: 1,
                      padding: 8,
                    }}
                    onClick={() => handleOpenDetail(item)}
                  >
                    <TaskActionIcon color='#F7F7F7' className='size-4' />
                    <span className='text-[#F7F7F7] text-sm'>Chi tiết</span>
                  </button>
                </h4>
              </div>
            ))
          )}
        </div>
      </div>
      <PieceworkWageDetailModal open={openDetail} onClose={handleCloseDetail} worker={selectedWorker} />
    </>
  );
});

PieceworkWageTable.displayName = 'PieceworkWageTable';

export default PieceworkWageTable;
