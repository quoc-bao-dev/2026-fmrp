import { TaskActionIcon } from '@/components/icons';
import { AvatarStack } from '@/components/UI/common/user';
import NoData from '@/components/UI/noData/nodata';
import { memo, useState } from 'react';
import PieceworkWageDetailModal from './PieceworkWageDetailModal';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import formatNumber from '@/utils/helpers/formatnumber';
import { formatSecondsToHours } from '@/utils/helpers/formatSecondsToHours';

// Mock data dựa trên hình ảnh
export const mockData = [
  {
    id: 1,
    workers: [{ id: 1, name: 'Nam', avatarUrl: '/icon/default/default.png' }],
    workingHours: '4h',
    quantity: '4 cái',
    pieceworkWage: '1.050.000',
  },
  {
    id: 2,
    workers: [{ id: 1, name: 'Thành', avatarUrl: '/icon/default/default.png' }],
    workingHours: '16h',
    quantity: '4 cái',
    pieceworkWage: '1.150.000',
  },
  {
    id: 3,
    workers: [{ id: 1, name: 'Văn', avatarUrl: '/icon/default/default.png' }],
    workingHours: '4h',
    quantity: '4 cái',
    pieceworkWage: '1.350.000',
  },
  {
    id: 4,
    workers: [{ id: 1, name: 'Huy', avatarUrl: '/icon/default/default.png' }],
    workingHours: '8h',
    quantity: '4 cái',
    pieceworkWage: '1.050.000',
  },
  {
    id: 5,
    workers: [{ id: 1, name: 'Hùng', avatarUrl: '/icon/default/default.png' }],
    workingHours: '8h',
    quantity: '4 cái',
    pieceworkWage: '1.550.000',
  },
  {
    id: 6,
    workers: [{ id: 1, name: 'Quang', avatarUrl: '/icon/default/default.png' }],
    workingHours: '8h',
    quantity: '4 cái',
    pieceworkWage: '750.000',
  },
  {
    id: 7,
    workers: [{ id: 1, name: 'Nguyễn', avatarUrl: '/icon/default/default.png' }],
    workingHours: '8h',
    quantity: '4 cái',
    pieceworkWage: '850.000',
  },
  {
    id: 8,
    workers: [{ id: 1, name: 'Lan', avatarUrl: '/icon/default/default.png' }],
    workingHours: '8h',
    quantity: '4 cái',
    pieceworkWage: '750.000',
  },
];

const PieceworkWageTable = memo(({ productionOutput, po_id }) => {
  const [openDetail, setOpenDetail] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  const handleOpenDetail = item => {
    setSelectedWorker(item);
    setOpenDetail(true);
  };

  const handleCloseDetail = () => {
    setOpenDetail(false);
  };

  // Convert dữ liệu staff từ API sang format AvatarStack cần
  const convertStaffToAvatarFormat = staff => {
    if (!staff) return null;
    return {
      id: staff.staffid || staff.id,
      name: staff.full_name || staff.name,
      avatarUrl: staff.profile_image || staff.avatarUrl || null,
    };
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

        <Customscrollbar className='max-h-[calc(100svh-315px)]'>
          {/* Rows */}
          {productionOutput?.length === 0 ? (
            <div className='h-full flex items-center justify-center py-6'>
              <NoData type='table' />
            </div>
          ) : (
            productionOutput?.map((item, index) => {
              const convertedStaff = convertStaffToAvatarFormat(item.staff);
              return (
                <div
                  key={item.staff_id && item.stage_id ? `${item.staff_id}-${item.stage_id}` : index}
                  className={`col-span-16 grid grid-cols-23 gap-2 items-center group hover:bg-gray-100 transition-all duration-150 ease-in-out py-2  ${productionOutput?.length - 1 === index ? 'border-transparent' : 'border-b'
                    }`}
                >
                  <h4 className='col-span-2 flex items-center justify-center text-center text-[#141522] font-semibold xl:text-sm text-xs uppercase px-1'>{index + 1}</h4>

                  <h4 className='col-span-5 text-[#344054] font-normal flex items-center py-2 px-1'>
                    {convertedStaff ? <AvatarStack people={[convertedStaff]} size={32} /> : null}
                  </h4>

                  <h4 className='col-span-3 text-center text-[#141522] font-semibold xl:text-sm text-xs px-1'>{formatSecondsToHours(item.total_time)}</h4>

                  <h4 className='col-span-3 text-center text-[#141522] font-semibold xl:text-sm text-xs px-1'>{item.total_produced}</h4>

                  <h4 className='col-span-6 text-center text-[#141522] font-semibold xl:text-sm text-xs px-1'>
                    <span className='text-blue-fmrp'>{formatNumber(+item.amount)} đ</span>
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
              );
            })
          )}
        </Customscrollbar>
      </div>
      <div className='hidden'>
        <PieceworkWageDetailModal open={openDetail} onClose={handleCloseDetail} worker={selectedWorker} po_id={po_id} />
      </div>
    </>
  );
});

PieceworkWageTable.displayName = 'PieceworkWageTable';

export default PieceworkWageTable;
