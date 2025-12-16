import PopupCustom from '@/components/UI/popup';
import ButtonAnimationNew from '@/components/common/button/ButtonAnimationNew';
import { UserPlusIcon } from '@/components/icons';
import CloseXIcon from '@/components/icons/common/CloseXIcon';
import { useSearchStaffs } from '@/hooks/common/useStaffs';
import useToast from '@/hooks/useToast';
import { Lexend_Deca } from '@next/font/google';
import { motion } from 'framer-motion';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import ResponsibleAvatar from './ResponsibleAvatar';
import ResponsiblePersonComboBox from './ResponsiblePersonComboBox';
import { StateContext } from '@/context/_state/productions-orders/StateContext';
import { useSaveProductionOrderManagers } from '@/managers/api/productions-order/useSaveProductionOrderManagers';

const deca = Lexend_Deca({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

const PopupListResponsiblePerson = props => {
  const dispatch = useDispatch();
  const { isStateProvider } = useContext(StateContext);
  const showToast = useToast();

  const statePopupListResponsiblePerson = useSelector(state => state.statePopupListResponsiblePerson);
  const [openCombo, setOpenCombo] = useState(false);
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [openRoleId, setOpenRoleId] = useState(null);
  const [roleByPerson, setRoleByPerson] = useState({});
  const [anchorRoleRect, setAnchorRoleRect] = useState(null);
  const roleDropdownRef = useRef(null);
  const [roleAnchorEl, setRoleAnchorEl] = useState(null);

  // Lấy branch_id từ production order
  const { data: staffs } = useSearchStaffs({ branch_ids: [props.brandId] });

  // Hook để save production order managers
  const { saveProductionOrderManagers, isLoading: isSaving } = useSaveProductionOrderManagers({
    onSuccess: (response) => {
      // Đóng popup sau khi save thành công
      handleClose();
      // Trigger refetch detail (if provided)
      props?.onRefreshDetail?.();
      // Trigger refetch managers list (avatar/table) nếu có
      props?.onRefreshManagers?.();
    },
    onError: (error) => {
      console.error('Failed to save managers:', error);
    }
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

  const roleOptions = [
    { label: 'Quản lý', value: 'manager' },
    { label: 'Phụ trách BTP & NVL', value: 'btp_nvl' },
    { label: 'Phụ trách sản xuất', value: 'manufacture' }
  ];

  const handleClose = () => {
    dispatch({ type: 'statePopupListResponsiblePerson', payload: { open: false } });
  };

  const handleAddPerson = () => {
    // Phân quyền: chỉ cho phép role is_manager được thêm người phụ trách (nếu có truyền canManageManagers)
    if (props?.canManageManagers === false) {
      showToast('error', 'Bạn không có quyền thực hiện thao tác này');
      return;
    }
    setOpenCombo(true);
  };

  const handleTogglePerson = person => {
    setSelectedPeople(prev => {
      const exists = prev.find(item => item.id === person.id);
      if (exists) {
        return prev.filter(item => item.id !== person.id);
      }
      return [...prev, person];
    });
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
    const list = props?.initialManagers || [];

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
  }, [props?.initialManagers, statePopupListResponsiblePerson?.open]);

  const handleSave = () => {
    // Phân quyền: chỉ cho phép role is_manager được lưu
    if (!props?.canManageManagers) {
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

    // Lấy po_id từ production order detail
    const po_id = isStateProvider?.productionsOrders?.idDetailProductionOrder || 50;
    
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
        is_manufacture
      };
    });

    const payload = {
      po_id,
      items
    };

    // Gọi mutation để save
    saveProductionOrderManagers(payload);
  };

console.log('canManageManagers', props?.canManageManagers );


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
    <PopupCustom
      title=''
      open={statePopupListResponsiblePerson?.open || false}
      onClose={handleClose}
      lockScroll={true}
      closeOnDocumentClick={false}
      className='popup-list-responsible-person'
      type='popupListResponsiblePerson'
    >
      <div className={`${deca.className} w-[554px] h-[319px]- bg-white rounded-[24px] relative flex flex-col overflow-hidden`}>
        {/* Header */}
        <div className='flex items-center justify-between px-4 pt-2 pb-4'>
          <h2 className='text-[24px] font-bold leading-[20px] capitalize text-[#101828]'>Danh Sách Người Phụ Trách</h2>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300 }}
            onClick={handleClose}
            className='flex items-center justify-center w-7 h-7 rounded-full  hover:opacity-80 transition-opacity'
          >
            <CloseXIcon className='size-full' />
          </motion.button>
        </div>

        <div className='px-4'>
          {props?.canManageManagers !== false && (
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
        </div>
        {/* Content */}
        <div className='flex-1 flex flex-col overflow-hidden h-full'>
          {/* Table Header */}
          <div className='flex items-center px-4 py-3 mt-4'>
            <div className='flex-1'>
              <span className='text-[14px] font-semibold leading-[20px] text-[#9295A4]'>Người phụ trách</span>
            </div>
            <div className='flex-1 text-end '>
              <span className='text-[14px] text-end font-semibold leading-[20px] text-[#9295A4]'>Vai trò phụ trách</span>
            </div>
          </div>

          <div className='border-b border-[#E7EAEE] mx-4'></div>

          {/* Danh sách người phụ trách */}
          <div className='mx-4 max-h-[280px] overflow-y-auto'>
            {selectedPeople.length === 0 ? (
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
                        {props?.canManageManagers === false ? (
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
                            className={`flex items-center gap-2 px-4 py-2 rounded-[8px] border text-sm font-medium transition-colors ${
                              openRoleId === person.id ? 'bg-[#EBF5FF] border-[#3276FA] text-[#1F3A63]' : 'bg-white border-[#EBEDF1] text-[#4B5563]'
                            }`}
                            style={{ borderRadius: '8px' }}
                          >
                            {roleOptions.find(opt => opt.value === roleByPerson[person.id])?.label || 'Chọn vai trò'}
                            <svg
                              width='9'
                              height='5'
                              viewBox='0 0 9 5'
                              fill='none'
                              xmlns='http://www.w3.org/2000/svg'
                              className={`transition-transform duration-200 ${openRoleId === person.id ? 'rotate-180' : ''}`}
                            >
                              <path
                                d='M8.2217 4.26873C8.19333 4.33726 8.14528 4.39584 8.08362 4.43705C8.02196 4.47827 7.94946 4.50028 7.8753 4.5003H0.375295C0.301084 4.50035 0.228525 4.47839 0.166802 4.43719C0.105079 4.39599 0.056969 4.3374 0.0285619 4.26884C0.000154685 4.20028 -0.00727205 4.12484 0.00722185 4.05205C0.0217158 3.97927 0.0574786 3.91243 0.109983 3.85998L3.85998 0.109982C3.89481 0.0751162 3.93617 0.0474568 3.98169 0.0285852C4.02722 0.00971359 4.07601 0 4.1253 0C4.17458 0 4.22337 0.00971359 4.2689 0.0285852C4.31442 0.0474568 4.35578 0.0751162 4.39061 0.109982L8.14061 3.85998C8.19304 3.91246 8.22872 3.9793 8.24316 4.05206C8.25759 4.12481 8.25013 4.20022 8.2217 4.26873Z'
                                fill={openRoleId === person.id ? '#3276FA' : '#8E94A4'}
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Button */}
          {props?.canManageManagers !== false && (
            <div className='px-2 py-3 mt-6 flex items-center justify-center gap-4 h-[68px]'>
              <div className='flex items-center justify-center'>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`flex items-center gap-4 bg-[#0375F3] text-white px-7 py-3 rounded-[8px] font-medium transition-colors ${
                    isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#0375F3]/90 cursor-pointer'
                  }`}
                >
                  <svg width='13' height='10' viewBox='0 0 13 10' fill='none' xmlns='http://www.w3.org/2000/svg'>
                    <path
                      d='M12.2529 0.0625C12.4355 0.0626004 12.6102 0.135563 12.7393 0.264648C12.8683 0.393745 12.9413 0.568426 12.9414 0.750977C12.9414 0.928867 12.8709 1.09845 12.748 1.22656L12.7383 1.2373L4.73828 9.2373C4.67442 9.30137 4.59819 9.35203 4.51465 9.38672C4.43114 9.42136 4.34138 9.43945 4.25098 9.43945C4.1606 9.43941 4.07077 9.42138 3.9873 9.38672C3.90397 9.35206 3.82839 9.30121 3.76465 9.2373L0.264648 5.7373C0.200721 5.67338 0.149849 5.59719 0.115234 5.51367C0.0806189 5.4301 0.0625 5.34045 0.0625 5.25C0.0625068 5.15956 0.0806255 5.06988 0.115234 4.98633C0.149848 4.90285 0.200743 4.8266 0.264648 4.7627C0.328484 4.69895 0.403969 4.64783 0.487305 4.61328C0.570774 4.57871 0.660632 4.56157 0.750977 4.56152C0.841304 4.56152 0.931179 4.57876 1.01465 4.61328C1.09814 4.64786 1.17436 4.69882 1.23828 4.7627L4.25195 7.77637L4.2959 7.73242L11.7656 0.264648C11.8948 0.135473 12.0702 0.0625 12.2529 0.0625Z'
                      fill='white'
                      stroke='white'
                      strokeWidth='0.125'
                    />
                  </svg>
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
                borderRadius: '16px',
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
                <span>Xoá</span>
              </button>
            </div>
          </div>,
          document.body
        )}
    </PopupCustom>
  );
};

export default PopupListResponsiblePerson;
