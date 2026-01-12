import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import PopupCustom from '@/components/UI/popup';
import ButtonAnimationNew from '@/components/common/button/ButtonAnimationNew';
import { CaretDownIcon, CheckThinIcon, UserPlusIcon } from '@/components/icons';
import CloseXIcon from '@/components/icons/common/CloseXIcon';
import ResponsibleAvatar from '@/containers/manufacture/productions-orders/components/popup/ResponsibleAvatar';
import ResponsiblePersonComboBox from '@/containers/manufacture/productions-orders/components/popup/ResponsiblePersonComboBox';
import { StateContext } from '@/context/_state/productions-orders/StateContext';
import { useSearchStaffs } from '@/hooks/common/useStaffs';
import useToast from '@/hooks/useToast';
import { useSaveProductionOrderManagers } from '@/managers/api/productions-order/useSaveProductionOrderManagers';
import { motion } from 'framer-motion';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const PopupResponsiblePerson = ({ open, onClose, brandId, initialManagers = [], canManageManagers, onRefreshManagers, po_id }) => {
  const { isStateProvider } = useContext(StateContext);
  const showToast = useToast();

  const [openCombo, setOpenCombo] = useState(false);
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [openRoleId, setOpenRoleId] = useState(null);
  const [roleByPerson, setRoleByPerson] = useState({});
  const [anchorRoleRect, setAnchorRoleRect] = useState(null);
  const roleDropdownRef = useRef(null);
  const [roleAnchorEl, setRoleAnchorEl] = useState(null);

  // Lấy po_id từ props hoặc context
  const finalPoId = po_id || isStateProvider?.productionsOrders?.idDetailProductionOrder || 50;

  // Lấy branch_id từ production order
  const { data: staffs } = useSearchStaffs({ branch_ids: brandId ? [brandId] : [] });

  // Hook để save production order managers
  const { saveProductionOrderManagers, isLoading: isSaving } = useSaveProductionOrderManagers({
    onSuccess: response => {
      // Đóng popup sau khi save thành công
      onClose?.();
      // Trigger refetch managers list (avatar/table) nếu có
      onRefreshManagers?.();
    },
    onError: error => {
      console.error('Failed to save managers:', error);
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
    setSelectedPeople(newSelected || []);
    setOpenCombo(false);
  };

  const handleSelectRole = (personId, role) => {
    setRoleByPerson(prev => ({ ...prev, [personId]: role }));
    setOpenRoleId(null);
    setAnchorRoleRect(null);
    setRoleAnchorEl(null);
  };

  // Prefill / reset theo lệnh sản xuất hiện tại
  useEffect(() => {
    if (!open) return;

    const list = initialManagers || [];

    // Set selected people
    const prefillPeople = list.map(item => ({
      recordId: item.recordId,
      id: item.id,
      name: item.name,
      avatarUrl: item.avatarUrl || '',
    }));
    setSelectedPeople(prefillPeople);

    // Set role mapping
    const prefillRoles = list.reduce((acc, cur) => {
      acc[cur.id] = cur.role || '';
      return acc;
    }, {});
    setRoleByPerson(prefillRoles);
  }, [initialManagers, open]);

  const handleSave = () => {
    // Phân quyền: chỉ cho phép role is_manager được lưu
    if (!canManageManagers) {
      showToast('error', 'Bạn không có quyền thực hiện thao tác này');
      return;
    }

    // Chỉ kiểm tra quyền nếu có người được chọn
    if (selectedPeople.length > 0) {
      const peopleWithoutRole = selectedPeople.filter(person => !roleByPerson[person.id]);
      if (peopleWithoutRole.length > 0) {
        showToast('error', 'Vui lòng chọn quyền cho tất cả người phụ trách');
        return;
      }
    }

    // Transform dữ liệu từ selectedPeople và roleByPerson
    const items = selectedPeople.map(person => {
      const roleValue = roleByPerson[person.id] || '';

      // Map role value thành các flags
      const is_manager = roleValue === 'manager' ? 1 : 0;
      const is_btp_nvl = roleValue === 'btp_nvl' ? 1 : 0;
      const is_manufacture = roleValue === 'manufacture' ? 1 : 0;

      return {
        id: person.recordId ?? 0,
        staff_id: person.id,
        is_manager,
        is_btp_nvl,
        is_manufacture,
      };
    });

    const payload = {
      po_id: finalPoId,
      items,
    };

    // Gọi mutation để save
    saveProductionOrderManagers(payload);
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
          <ResponsiblePersonComboBox open={openCombo} onClose={() => setOpenCombo(false)} onConfirm={handleConfirmSelection} selected={selectedPeople} data={listStaffs}>
            <div className='inline-flex'>
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
          </ResponsiblePersonComboBox>
        )}
        
        {/* Content */}
        <div className='flex-1 flex flex-col gap-1 overflow-hidden h-full'>
          {/* Table Header */}
          <div className='flex items-center'>
            <div className='flex-1'>
              <span className='text-[14px] font-semibold leading-[20px] text-[#9295A4]'>Người phụ trách</span>
            </div>
            <div className='flex-1 text-end '>
              <span className='text-[14px] text-end font-semibold leading-[20px] text-[#9295A4]'>Vai trò phụ trách</span>
            </div>
          </div>

          <div className='border-b border-[#E7EAEE]'></div>

          {/* Danh sách người phụ trách */}
          <Customscrollbar className='max-h-[280px] overflow-y-auto'>
            {selectedPeople.length !== 0 ? (
              <div className='py-4 text-sm text-[#9295A4]'>Chưa có người phụ trách</div>
            ) : (
              <div className='divide-y divide-[#E7EAEE]'>
                {selectedPeople.map(person => (
                  <div key={person.id} className='flex items-center py-4 gap-4'>
                    <div className='flex-1 flex items-center gap-3'>
                      <ResponsibleAvatar avatarUrl={person.avatarUrl} fullName={person.name} size={40} />
                      <span className='text-sm font-medium text-[#101828]'>{person.name}</span>
                    </div>
                    <div className='flex-1 flex justify-end'>
                      <div className='relative'>
                        {canManageManagers === false ? (
                          <div className='flex items-center gap-2 px-4 py-2 rounded-[8px] border text-sm font-medium bg-[#F9FAFB] border-[#EBEDF1] text-[#4B5563] cursor-default'>
                            {roleOptions.find(opt => opt.value === roleByPerson[person.id])?.label || 'Chưa gán vai trò'}
                          </div>
                        ) : (
                          <button
                            onClick={e => {
                              setRoleAnchorEl(e.currentTarget);
                              const rect = e.currentTarget.getBoundingClientRect();
                              setAnchorRoleRect({
                                top: rect.bottom + window.scrollY + 8,
                                left: rect.right - 240 + window.scrollX,
                              });
                              setOpenRoleId(prev => (prev === person.id ? null : person.id));
                            }}
                            className={`flex rounded-lg items-center gap-2 px-4 py-2 border text-sm font-medium transition-colors ${
                              openRoleId === person.id ? 'bg-[#EBF5FF] border-[#3276FA] text-[#1F3A63]' : 'bg-white border-[#EBEDF1] text-[#4B5563]'
                            }`}
                          >
                            {roleOptions.find(opt => opt.value === roleByPerson[person.id])?.label || 'Chọn vai trò'}
                            <CaretDownIcon className={`size-4 transition-transform duration-200 ${openRoleId === person.id ? 'rotate-180 text-[#3276FA]' : 'text-[#8E94A4]'}`} />
                          </button>
                        )}
                      </div>
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
                  <CheckThinIcon className='size-5' />
                  Lưu
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {openRoleId &&
        anchorRoleRect &&
        createPortal(
          <div className='fixed inset-0 z-[1600] pointer-events-none'>
            <div
              ref={roleDropdownRef}
              className='pointer-events-auto w-60 bg-white border border-[#EBEDF1] rounded-[16px] shadow-lg overflow-hidden'
              style={{
                position: 'absolute',
                top: anchorRoleRect.top,
                left: anchorRoleRect.left,
              }}
            >
              {roleOptions.map(option => {
                const active = roleByPerson[openRoleId] === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelectRole(openRoleId, option.value)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-base transition-colors ${active ? 'bg-[#EBF5FF] text-[#1F3A63]' : 'text-[#101828] hover:bg-[#F4F6FA]'}`}
                  >
                    <span>{option.label}</span>
                    {active && (
                      <svg width='16' height='12' viewBox='0 0 16 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <path d='M5.99973 9.1998L1.79973 4.9998L0.399727 6.3998L5.99973 11.9998L15.9997 1.9998L14.5997 0.599804L5.99973 9.1998Z' fill='#3276FA' />
                      </svg>
                    )}
                  </button>
                );
              })}
              <button
                onClick={() => {
                  // Xoá khỏi bảng & đưa lại vào combo
                  setSelectedPeople(prev => prev.filter(p => p.id !== openRoleId));
                  setRoleByPerson(prev => {
                    const clone = { ...prev };
                    delete clone[openRoleId];
                    return clone;
                  });
                  setOpenRoleId(null);
                  setAnchorRoleRect(null);
                  setRoleAnchorEl(null);
                }}
                className='w-full flex items-center justify-between px-4 py-3 text-base text-[#C02A26] hover:bg-[#FDEEEE] transition-colors'
              >
                Xoá
              </button>
            </div>
          </div>,
          document.body
        )}
    </PopupCustom>
  );
};

export default PopupResponsiblePerson;
