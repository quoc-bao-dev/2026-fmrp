import { ButtonDelete } from '@/components/UI/button/buttonDelete';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import Loading from '@/components/UI/loading/loading';
import PopupCustom from '@/components/UI/popup';
import ButtonAnimationNew from '@/components/common/button/ButtonAnimationNew';
import { CheckThinIcon, UserPlusIcon } from '@/components/icons';
import CloseXIcon from '@/components/icons/common/CloseXIcon';
import { IMAGES } from '@/constants/images';
import ResponsibleAvatar from '@/containers/manufacture/productions-orders/components/popup/ResponsibleAvatar';
import PersonSelector from '@/containers/piecework-wage/import-output/components/modal/PersonSelector';
import { useSocketContext } from '@/context/socket/SocketContext';
import { useSearchStaffs } from '@/hooks/common/useStaffs';
import useToast from '@/hooks/useToast';
import { useListPomStages, useLookupGroupMembers, useSavePomStagesDetail } from '@/managers/api/piecework-wage/useImportOutput';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';

const PopupResponsiblePerson = ({ open, onClose, brandId, po_id, stage_id, cardPage = 1, onSaveSuccess }) => {
  const showToast = useToast();
  const queryClient = useQueryClient();
  const { is_admin: role, permissions_current: auth } = useSelector(state => state.auth);
  const { socket } = useSocketContext()

  // Kiểm tra quyền: có quyền nếu là admin hoặc có quyền is_create
  const hasPermission = role || auth?.production_input?.is_create === '1';

  const [openCombo, setOpenCombo] = useState(false);
  const [selectedStaffs, setSelectedStaffs] = useState([]);

  const { data: listPomStages, isLoading } = useListPomStages(
    {
      po_ids: po_id ? [po_id] : [],
      stage_id: stage_id || null,
    },
    {
      enabled: open && !!po_id && !!stage_id,
    }
  );

  const { data: staffs } = useSearchStaffs({ branch_ids: brandId ? [brandId] : [] }, { enabled: open });
  const { data: listGroupMembers } = useLookupGroupMembers({ limit: 100 }, { enabled: open });

  const { mutate: savePomStagesDetail, isPending: isSaving } = useSavePomStagesDetail({
    onSuccess: data => {
      if (data?.isSuccess) {
        onSaveSuccess?.();
      }
      onClose?.();
    },
    onError: error => {
      console.error('Failed to save managers:', error);
      showToast('error', 'Không thể lưu người phụ trách');
    },
  });

  const listStaffs = useMemo(() => {
    const data = [];
    const staffsList = staffs?.data?.staffs || [];

    // Thêm các nhân viên
    staffsList.forEach(staff => {
      if (staff?.staffid && staff?.full_name) {
        data.push({
          id: String(staff.staffid),
          name: staff.full_name,
          avatarUrl: staff.profile_image,
          type: 'staff',
        });
      }
    });

    // Thêm các nhóm
    const groupMembers = listGroupMembers?.group_members || [];
    groupMembers.forEach(group => {
      if (group?.id && group?.name) {
        data.push({
          id: `group_${group.id}`,
          name: group.name,
          avatarUrl: IMAGES.groupUser,
          type: 'group',
        });
      }
    });

    return data;
  }, [staffs, listGroupMembers]);

  const handleAddPerson = () => {
    // Kiểm tra quyền: không có quyền thì không cho mở
    if (!hasPermission) {
      showToast('error', 'Bạn không có quyền thực hiện thao tác này');
      return;
    }
    setOpenCombo(true);
  };

  const handleConfirmSelection = newSelected => {
    // Chuẩn hoá dữ liệu từ PersonSelector về format dùng nội bộ
    const normalized = (newSelected || []).map(item => {
      const isGroup = item.type === 'group';
      return {
        id: item.id,
        staff_id: item.id,
        staff: {
          full_name: item.name,
          profile_image: isGroup ? IMAGES.groupUser : item.avatarUrl,
        },
        type: item.type || 'staff',
      };
    });

    // Thêm vào đầu danh sách (select later, go first)
    setSelectedStaffs(prev => {
      const existingIds = new Set();
      prev.forEach(p => {
        if (p?.id) existingIds.add(String(p.id));
        if (p?.staff_id) existingIds.add(String(p.staff_id));
      });
      const newItems = normalized.filter(item => !existingIds.has(String(item.id)));
      return [...newItems, ...prev];
    });
    setOpenCombo(false);
  };

  // Init selectedStaffs từ dữ liệu API khi popup mở
  useEffect(() => {
    if (!open || !listPomStages) return;

    const transformed = [];

    // Transform staffs từ API
    const staffsList = listPomStages?.staffs || [];
    staffsList.forEach(staff => {
      if (staff?.id && staff?.staff_id && staff?.staff) {
        transformed.push({
          id: String(staff.staff_id), // đồng bộ với id PersonSelector
          staff_id: String(staff.staff_id),
          staff: {
            full_name: staff.staff?.full_name || '',
            profile_image: staff.staff?.profile_image || null,
          },
          type: 'staff',
        });
      }
    });

    // Transform group_members từ API
    const groupMembers = listPomStages?.group_members || [];
    groupMembers.forEach(group => {
      if (group?.id && group?.name) {
        transformed.push({
          id: `group_${group.id}`,
          staff_id: `group_${group.id}`,
          staff: {
            full_name: group.name || '',
            profile_image: IMAGES.groupUser,
          },
          type: 'group',
        });
      }
    });

    setSelectedStaffs(transformed);
  }, [listPomStages, open]);

  const handleSave = () => {
    // Kiểm tra quyền: không có quyền thì không cho lưu
    if (!hasPermission) {
      showToast('error', 'Bạn không có quyền thực hiện thao tác này');
      return;
    }

    // Tách staff_ids và group_ids
    const staff_ids = [];
    const group_ids = [];

    selectedStaffs.forEach(person => {
      const personId = String(person.staff_id || person.id || '');
      const isGroup = person.type === 'group' || personId.startsWith('group_');

      if (isGroup) {
        // Là nhóm, lấy id từ format "group_${id}"
        const groupId = personId.replace('group_', '');
        const numId = Number(groupId);
        if (Number.isFinite(numId)) {
          group_ids.push(numId);
        }
      } else {
        // Là nhân viên
        const numId = Number(personId);
        if (Number.isFinite(numId)) {
          staff_ids.push(numId);
        }
      }
    });

    const payload = {
      po_id: po_id,
      stage_id: stage_id,
      staff_ids,
      ...(group_ids.length > 0 && { group_ids }), // Chỉ thêm group_ids nếu có
    };

    // Gọi mutation để save
    savePomStagesDetail(payload);
  };

  return (
    <PopupCustom title='' open={open || false} onClose={onClose} lockScroll={true} closeOnDocumentClick={false} className='popup-list-responsible-person' type='PopupResponsiblePerson'>
      <div className='p-4 w-[554px] bg-white rounded-3xl relative flex flex-col gap-4 overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <h2 className='text-[24px] font-bold leading-[20px] capitalize text-[#101828]'>Danh Sách Người Phụ Trách</h2>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300 }}
            onClick={onClose}
            className='flex items-center justify-center w-7 h-7 rounded-full  hover:opacity-80 transition-opacity'
          >
            <CloseXIcon className='size-full' />
          </motion.button>
        </div>

        <PersonSelector
          open={openCombo}
          onClose={() => setOpenCombo(false)}
          onConfirm={handleConfirmSelection}
          selected={selectedStaffs.map(item => ({
            id: item.staff_id || item.id,
            name: item.staff?.full_name || '',
            avatarUrl: item.staff?.profile_image || '',
            type: item.type || 'staff',
          }))}
          data={listStaffs}
          inlineConfirm
          hideFooterActions
          width={300}
        >
          <div className='inline-flex w-fit'>
            <ButtonAnimationNew
              icon={
                <div className='size-6'>
                  <UserPlusIcon className='size-full text-[#11315B]' />
                </div>
              }
              title='Thêm người phụ trách'
              className='3xl:h-10 h-9 xl:px-4 px-2 flex items-center gap-2 xl:text-sm text-xs font-medium text-[#11315B] bg-white border border-[#D0D5DD] hover:bg-[#F7F8F9] hover:shadow-hover-button rounded-lg'
              onClick={handleAddPerson}
            />
          </div>
        </PersonSelector>

        {/* Content */}
        <div className='flex-1 flex flex-col gap-1 overflow-hidden h-full'>
          {/* Table Header */}
          <div className='flex items-center border-b border-[#E7EAEE] pb-1'>
            <div className='flex-1'>
              <span className='text-[14px] font-semibold leading-[20px] text-[#9295A4]'>Người phụ trách</span>
            </div>
            <div className='flex-1 text-end '>
              <span className='text-[14px] text-end font-semibold leading-[20px] text-[#9295A4]'>Tác vụ</span>
            </div>
          </div>

          {/* Danh sách người phụ trách */}
          <Customscrollbar className='max-h-[280px] overflow-y-auto'>
            {isLoading ? (
              <Loading />
            ) : selectedStaffs.length === 0 ? (
              <div className='flex flex-col items-center justify-center gap-2 py-4'>
                <Image src={IMAGES.nodataNotFound} alt='No Data' width={200} height={200} className='object-contain' />
                <span className='text-sm text-[#9295A4]'>Chưa có người phụ trách</span>
              </div>
            ) : (
              <div className='divide-y divide-[#E7EAEE]'>
                {selectedStaffs.map((person, index) => (
                  <div key={`${person.id}_${index}`} className='flex items-center justify-between py-4 gap-4 hover:bg-[#F9FAFB] px-2'>
                    <div className='flex items-center gap-3'>
                      <ResponsibleAvatar avatarUrl={person.staff?.profile_image} fullName={person.staff?.full_name} size={40} />
                      <span className='text-sm font-medium text-[#101828]'>{person.staff?.full_name}</span>
                    </div>
                    <ButtonDelete
                      onClick={() => {
                        // Kiểm tra quyền: không có quyền thì không cho xóa
                        if (!hasPermission) {
                          showToast('error', 'Bạn không có quyền thực hiện thao tác này');
                          return;
                        }
                        // Xoá tạm thời khỏi giao diện; API sẽ được gọi khi nhấn Lưu
                        setSelectedStaffs(prev => prev.filter(p => String(p.id) !== String(person.id)));
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </Customscrollbar>

          {/* Add Button */}
          <div className='flex items-center justify-center gap-4'>
            <div className='flex items-center justify-center'>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`flex items-center gap-4 bg-[#0375F3] text-white px-7 py-3 rounded-[8px] font-medium transition-colors ${
                  isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#0375F3]/90 cursor-pointer'
                }`}
              >
                {isSaving ? (
                  <span className='flex items-center gap-2'>
                    <span className='inline-block h-4 w-4 border-2 border-white/60 border-t-white rounded-full animate-spin' />
                    <span>Đang lưu...</span>
                  </span>
                ) : (
                  <>
                    <CheckThinIcon className='size-5' />
                    <span>Lưu</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PopupCustom>
  );
};

export default PopupResponsiblePerson;
