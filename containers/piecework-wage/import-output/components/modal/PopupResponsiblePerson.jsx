import { ButtonDelete } from '@/components/UI/button/buttonDelete';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import Loading from '@/components/UI/loading/loading';
import PopupCustom from '@/components/UI/popup';
import ButtonAnimationNew from '@/components/common/button/ButtonAnimationNew';
import { CaretDownIcon, CheckThinIcon, UserPlusIcon } from '@/components/icons';
import CloseXIcon from '@/components/icons/common/CloseXIcon';
import { IMAGES } from '@/constants/images';
import ResponsibleAvatar from '@/containers/manufacture/productions-orders/components/popup/ResponsibleAvatar';
import PersonSelector from '@/containers/piecework-wage/import-output/components/modal/PersonSelector';
import { useSearchStaffs } from '@/hooks/common/useStaffs';
import useToast from '@/hooks/useToast';
import { useListPomStages, useSavePomStagesDetail } from '@/managers/api/piecework-wage/useImportOutput';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const PopupResponsiblePerson = ({ open, onClose, brandId, canManageManagers, po_id, stage_id, start_date = null, end_date = null, search = '' }) => {
  const showToast = useToast();
  const queryClient = useQueryClient();

  const [openCombo, setOpenCombo] = useState(false);
  const [openRoleId, setOpenRoleId] = useState(null);
  const [roleByPerson, setRoleByPerson] = useState({});
  const [anchorRoleRect, setAnchorRoleRect] = useState(null);
  const roleDropdownRef = useRef(null);
  const [roleAnchorEl, setRoleAnchorEl] = useState(null);
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

  const { data: staffs } = useSearchStaffs({ branch_ids: brandId ? [brandId] : [] });

  const { mutate: savePomStagesDetail, isPending: isSaving } = useSavePomStagesDetail({
    onSuccess: data => {
      if (data?.isSuccess) {
        showToast('success', data?.message || 'Lưu thành công');
        queryClient.invalidateQueries({ queryKey: ['api_list_import_output'] });
        queryClient.invalidateQueries({ queryKey: ['api_list_pom_stages'] });
      } else {
        showToast('error', data?.message || 'Lưu thất bại');
      }
      onClose?.();
    },
    onError: error => {
      console.error('Failed to save managers:', error);
      showToast('error', 'Không thể lưu người phụ trách');
    },
  });

  const listStaffs = useMemo(() => {
    return (
      staffs?.data?.staffs?.map(e => ({
        id: e.staffid,
        name: e.full_name,
        avatarUrl: e.profile_image,
      })) || []
    );
  }, [staffs]);

  const roleOptions = [{ label: 'Phụ trách sản xuất', value: 'manufacture' }];

  const handleAddPerson = () => {
    // Phân quyền: chỉ cho phép role is_manager được thêm người phụ trách (nếu có truyền canManageManagers)
    if (canManageManagers === false) {
      showToast('error', 'Bạn không có quyền thực hiện thao tác này');
      return;
    }
    setOpenCombo(true);
  };

  const handleConfirmSelection = newSelected => {
    // Chuẩn hoá dữ liệu từ PersonSelector về format dùng nội bộ
    const normalized = (newSelected || []).map(item => ({
      id: item.id,
      staff_id: item.id,
      staff: {
        full_name: item.name,
        profile_image: item.avatarUrl,
      },
    }));

    // Cập nhật role mapping, giữ vai trò cũ nếu còn tồn tại
    setRoleByPerson(prev => {
      const next = { ...prev };
      // Xoá role của những người không còn được chọn
      Object.keys(next).forEach(id => {
        const stillExists = normalized.some(p => String(p.id) === String(id));
        if (!stillExists) delete next[id];
      });
      // Gán role mặc định nếu chưa có
      normalized.forEach(p => {
        if (!next[p.id]) next[p.id] = 'manufacture';
      });
      return next;
    });

    // Chỉ cập nhật state local, không gọi API
    setSelectedStaffs(normalized);
    setOpenCombo(false);
  };

  const handleSelectRole = (personId, role) => {
    setRoleByPerson(prev => ({ ...prev, [personId]: role }));
    setOpenRoleId(null);
    setAnchorRoleRect(null);
    setRoleAnchorEl(null);
  };

  // Init roleByPerson từ dữ liệu API khi popup mở
  useEffect(() => {
    if (!open || !listPomStages?.staffs) return;

    const prefillRoles = listPomStages.staffs.reduce((acc, cur) => {
      acc[cur.id] = 'manufacture'; // Mặc định là 'manufacture'
      return acc;
    }, {});
    setRoleByPerson(prefillRoles);
    setSelectedStaffs(listPomStages.staffs || []);
  }, [listPomStages, open]);

  const handleSave = () => {
    // Phân quyền: chỉ cho phép role is_manager được lưu
    // if (!canManageManagers) {
    //   showToast('error', 'Bạn không có quyền thực hiện thao tác này');
    //   return;
    // }

    // Lấy danh sách staff_ids từ dữ liệu API
    const staff_ids = selectedStaffs.map(person => Number(person.staff_id)).filter(id => Number.isFinite(id));

    const payload = {
      po_id: po_id,
      stage_id: stage_id,
      staff_ids: staff_ids,
    };

    // Gọi mutation để save
    savePomStagesDetail(payload);
  };

  useEffect(() => {
    if (!openRoleId) return;
    const handler = e => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(e.target)) {
        setOpenRoleId(null);
        setAnchorRoleRect(null);
        setRoleAnchorEl(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openRoleId]);

  useEffect(() => {
    if (!openRoleId || !roleAnchorEl) return;
    const updatePos = () => {
      const rect = roleAnchorEl.getBoundingClientRect();
      setAnchorRoleRect({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right - 240 + window.scrollX,
      });
    };
    updatePos();
    window.addEventListener('scroll', updatePos, true);
    window.addEventListener('resize', updatePos);
    return () => {
      window.removeEventListener('scroll', updatePos, true);
      window.removeEventListener('resize', updatePos);
    };
  }, [openRoleId, roleAnchorEl]);

  return (
    <PopupCustom title='' open={open || false} onClose={onClose} lockScroll={true} closeOnDocumentClick={false} className='popup-list-responsible-person' type='PopupResponsiblePerson'>
      <div className='p-4 w-[554px] h-[319px]- bg-white rounded-[24px] relative flex flex-col gap-4 overflow-hidden'>
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

        {canManageManagers !== false && (
          <PersonSelector
            open={openCombo}
            onClose={() => setOpenCombo(false)}
            onConfirm={handleConfirmSelection}
            selected={selectedStaffs.map(item => ({
              id: item.staff_id,
              name: item.staff?.full_name || '',
              avatarUrl: item.staff?.profile_image || '',
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
        )}

        {/* Content */}
        <div className='flex-1 flex flex-col gap-1 overflow-hidden h-full'>
          {/* Table Header */}
          <div className='flex items-center'>
            <div className='flex-1'>
              <span className='text-[14px] font-semibold leading-[20px] text-[#9295A4]'>Người phụ trách</span>
            </div>
            <div className='flex-1 text-end '>
              <span className='text-[14px] text-end font-semibold leading-[20px] text-[#9295A4]'>Tác vụ</span>
            </div>
          </div>

          <div className='border-b border-[#E7EAEE]'></div>

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
                {selectedStaffs.map(person => (
                  <div key={person.id} className='flex items-center py-4 gap-4 hover:bg-[#F9FAFB] px-2'>
                    <div className='flex-1 flex items-center gap-3'>
                      <ResponsibleAvatar avatarUrl={person.staff?.profile_image} fullName={person.staff?.full_name} size={40} />
                      <span className='text-sm font-medium text-[#101828]'>{person.staff?.full_name}</span>
                    </div>
                    <div className='flex-1 flex justify-end'>
                      <button
                        onClick={() => {
                          // Xoá tạm thời khỏi giao diện; API sẽ được gọi khi nhấn Lưu
                          setSelectedStaffs(prev => prev.filter(person => person.id !== openRoleId));
                          // Xoá role mapping
                          setRoleByPerson(prev => {
                            const clone = { ...prev };
                            delete clone[openRoleId];
                            return clone;
                          });
                          setOpenRoleId(null);
                          setAnchorRoleRect(null);
                          setRoleAnchorEl(null);
                        }}
                        className='w-fit flex items-center justify-between px-4 py-3 text-base text-[#C02A26] hover:bg-[#FDEEEE] transition-colors'
                      >
                        Xoá
                      </button>
                      <ButtonDelete onClick={() => {
                        setSelectedStaffs(prev => prev.filter(person => person.id !== person.id));
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Customscrollbar>

          {/* Add Button */}
          {canManageManagers !== false && (
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
          )}
        </div>
      </div>
    </PopupCustom>
  );
};

export default PopupResponsiblePerson;
