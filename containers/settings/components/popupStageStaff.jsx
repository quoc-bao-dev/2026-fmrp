import { ButtonDelete } from '@/components/UI/button/buttonDelete';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import NoData from '@/components/UI/noData/nodata';
import PopupCustom from '@/components/UI/popup';
import PopupConfim from '@/components/UI/popupConfim/popupConfim';
import Avatar from '@/containers/piecework-wage/import-output-mobile/components/Avatar';
import { useState } from 'react';
import { useDeleteStageStaff, useStageStaff } from '../hooks/useStage';

const PopupStageStaff = ({ open, onClose, stageId }) => {
  const params = { stage_id: stageId, limit: 100, page: 1 };
  const { data } = useStageStaff(params);
  const { mutate: deleteStageStaff, isPending: isDeleting } = useDeleteStageStaff(params);
  const [staffDeleting, setStaffDeleting] = useState(null);

  const staffs = data?.output?.aaData || [];

  const openConfirmDelete = staff => {
    if (!staff?.id || isDeleting) return;
    setStaffDeleting(staff);
  };

  const closeConfirmDelete = () => {
    setStaffDeleting(null);
  };

  const handleConfirmDelete = () => {
    if (!staffDeleting?.id || isDeleting) return;

    deleteStageStaff(staffDeleting.id, {
      onSettled: () => {
        closeConfirmDelete();
      },
    });
  };

  return (
    <>
      <PopupCustom title='Sửa nhân viên mặc định' button={null} open={open} onClose={onClose}>
        <div className='w-[40vw] min-h-[40vh] mt-4 flex flex-col gap-6'>
          <div className='flex flex-col'>
            <div className='flex items-center justify-between border-b border-[#F3F3F4]'>
              <h3 className='py-2 px-3 responsive-text-sm text-[#9295A4]'>Nhân viên</h3>
              <h3 className='py-2 px-3 responsive-text-sm text-[#9295A4]'>Tác vụ</h3>
            </div>
            <Customscrollbar className='max-h-[35vh]'>
              <div className='divide-y divide-[#F3F3F4] '>
                {staffs.length === 0 ? (
                  <NoData />
                ) : (
                  staffs.map(staff => (
                    <div key={staff?.id} className='p-3 flex items-center justify-between hover:bg-gray-50'>
                      <Avatar staffs_assigned={[staff]} group_members_assigned={[]} showOnly={true} />
                      <ButtonDelete onClick={() => openConfirmDelete(staff)} />
                    </div>
                  ))
                )}
              </div>
            </Customscrollbar>
          </div>
        </div>
      </PopupCustom>

      <PopupConfim
        isOpen={!!staffDeleting}
        onClose={closeConfirmDelete}
        cancel={closeConfirmDelete}
        save={handleConfirmDelete}
        title='Xác nhận xóa nhân viên'
        subtitle={`Bạn có chắc chắn muốn xóa ${staffDeleting?.full_name || 'nhân viên này'} khỏi công đoạn không?`}
        nameModel='change_item'
        confirmLabel='Xóa'
        cancelLabel='Hủy'
        forceConfirm
      />
    </>
  );
};

export default PopupStageStaff;
