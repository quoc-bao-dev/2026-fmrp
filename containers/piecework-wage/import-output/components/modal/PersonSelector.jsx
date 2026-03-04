import { CheckThinIcon, MagnifyingGlassIcon } from '@/components/icons';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import AvatarText from '@/components/UI/common/user/AvatarText';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import PopupConfim from '@/components/UI/popupConfim/popupConfim';
import { IMAGES } from '@/constants/images';
import useToast from '@/hooks/useToast';
import { useLookupGroupMembers, useLookupStaffs } from '@/managers/api/piecework-wage/useImportOutput';
import { searchWithoutDiacritics } from '@/utils/helpers/stringHelper';
import { autoUpdate, flip, offset, shift, size, useDismiss, useFloating, useInteractions } from '@floating-ui/react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const ResponsibleAvatar = ({ avatarUrl, fullName = '', size = 40, borderColor = '#549AE8', className = '' }) => {
  const [isError, setIsError] = useState(false);

  const dimension = { width: size, height: size };
  const commonClass = `rounded-full bg-white text-[#1760B9] font-semibold flex items-center justify-center shadow-sm overflow-hidden ${className}`.trim();

  return (
    <div
      className={commonClass}
      style={{
        ...dimension,
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor,
      }}
    >
      {avatarUrl && !isError ? (
        <Image src={avatarUrl} width={size} height={size} alt={fullName} className='w-full h-full rounded-full object-cover' onError={() => setIsError(true)} />
      ) : (
        <AvatarText fullName={fullName || '?'} className='w-full h-full text-base flex items-center justify-center' />
      )}
    </div>
  );
};

// Helper function to compare arrays by IDs
const areArraysEqual = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false;
  const ids1 = new Set(arr1.map(item => item?.id));
  const ids2 = new Set(arr2.map(item => item?.id));
  if (ids1.size !== ids2.size) return false;
  for (const id of ids1) {
    if (!ids2.has(id)) return false;
  }
  return true;
};

const PersonSelector = ({
  open,
  onClose,
  onConfirm,
  onApplySelected,
  onCancelSelectMode,
  onSaveAsDefault,
  selected = [],
  data = [], // Deprecated: sẽ không dùng nữa, dữ liệu sẽ lấy từ API
  className,
  children,
  onSelectMode,
  selectedProductionOrdersCount = 0,
  isSelectMode = false,
  inlineConfirm = false,
  hideFooterActions = false,
  width = 230,
  filterParams = {},
}) => {
  const [search, setSearch] = useState('');
  const [localSelected, setLocalSelected] = useState(selected);
  const lastSelectedIdRef = useRef(null);
  const lastActionRef = useRef(null); // select | deselect
  const prevOpenRef = useRef(open);
  const prevSelectedRef = useRef(selected);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isNoStaffWarningOpen, setIsNoStaffWarningOpen] = useState(false);
  const triggerRef = useRef(null);
  const inputRef = useRef(null);
  const showToast = useToast();
  const router = useRouter();
  const [saveAsDefault, setSaveAsDefault] = useState(false);

  // Gọi API lấy nhân viên và nhóm khi mở PersonSelector
  const { data: listStaffs, isLoading: isLoadingStaffs } = useLookupStaffs({ is_shift_scheduling: 1, branch_ids: [filterParams?.branch_ids] }, { enabled: open });
  const { data: listGroupMembers, isLoading: isLoadingGroupMembers } = useLookupGroupMembers({ limit: 100, is_shift_scheduling: 1, branch_ids: [filterParams?.branch_ids] }, { enabled: open });

  // Format dữ liệu nhân viên và nhóm từ API
  const responsiblePersonData = useMemo(() => {
    const formattedData = [];
    const staffs = listStaffs?.staffs || [];

    // Thêm các nhân viên
    staffs
      .filter(staff => staff?.staffid && staff?.full_name)
      .forEach(staff => {
        formattedData.push({
          id: String(staff.staffid),
          name: staff.full_name,
          avatarUrl: staff.profile_image,
          type: 'staff',
        });
      });

    // Thêm các nhóm
    const groupMembers = listGroupMembers?.group_members || [];
    groupMembers.forEach(group => {
      if (group?.id && group?.name) {
        formattedData.push({
          id: `group_${group.id}`,
          name: group.name,
          avatarUrl: IMAGES.groupUser,
          type: 'group',
        });
      }
    });

    return formattedData;
  }, [listStaffs, listGroupMembers]);

  const isLoading = isLoadingStaffs || isLoadingGroupMembers;

  // Reset localSelected về selected mới nhất khi mở popup hoặc khi selected thay đổi
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      // Popup vừa mở - reset localSelected về selected mới nhất
      setLocalSelected(selected);
      setSearch(''); // Reset search khi mở
      prevSelectedRef.current = selected;
    } else if (open) {
      // Popup đang mở - check nếu selected thay đổi thì update localSelected
      if (!areArraysEqual(prevSelectedRef.current, selected)) {
        setLocalSelected(selected);
        prevSelectedRef.current = selected;
      }
    } else {
      // Popup đóng - update prevSelectedRef để track selected mới nhất
      prevSelectedRef.current = selected;
      // Reset lại checkbox lưu mặc định khi đóng
      setSaveAsDefault(false);
    }
    prevOpenRef.current = open;
  }, [open, selected]);

  // Focus vào input khi popup mở
  useEffect(() => {
    if (open && inputRef.current) {
      // Sử dụng setTimeout để đảm bảo DOM đã render xong
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [open]);

  // Kiểm tra nếu ca làm việc không có nhân viên (is_staff === 0)
  useEffect(() => {
    if (open && !isLoadingStaffs && listStaffs) {
      const isStaff = Number(listStaffs?.is_staff) || 0;
      if (isStaff === 0) {
        // Đóng PersonSelector và hiển thị popup cảnh báo
        onClose?.();
        setIsNoStaffWarningOpen(true);
      }
    }
  }, [open, isLoadingStaffs, listStaffs, onClose]);

  // Sử dụng Floating UI để tự động tính toán vị trí
  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: isOpen => {
      if (!isOpen) {
        onClose?.();
      }
    },
    placement: 'bottom-start',
    middleware: [
      offset(8), // Khoảng cách giữa trigger và dropdown
      flip({
        fallbackPlacements: ['bottom-start', 'bottom-end'],
        padding: 16,
      }),
      shift({
        padding: 16,
      }),
      size({
        apply({ availableHeight, elements }) {
          // Giới hạn chiều cao tối đa là 414px nhưng không vượt quá khoảng trống
          const maxHeight = Math.min(500, availableHeight);
          elements.floating.style.maxHeight = `${maxHeight}px`;
        },
        padding: 16,
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  // Xử lý click outside với xác nhận nếu có thay đổi
  const dismiss = useDismiss(context, {
    enabled: open && !isConfirmOpen && !isSelectMode, // Không cho phép đóng khi đang ở chế độ chọn
    outsidePress: () => {
      // Nếu đang mở popup confirm hoặc đang ở chế độ chọn thì bỏ qua click outside
      if (isConfirmOpen || isSelectMode) {
        return false;
      }

      const hasChanges = !areArraysEqual(localSelected, selected);
      if (hasChanges) {
        setIsConfirmOpen(true);
        return false; // Ngăn đóng dropdown
      }
      return true; // Cho phép đóng dropdown
    },
  });

  const { getReferenceProps, getFloatingProps } = useInteractions([dismiss]);

  const hasPersonSelected = useMemo(() => (Array.isArray(localSelected) ? localSelected.length > 0 : false), [localSelected]);

  const filtered = useMemo(() => {
    const term = search.trim();
    const peopleList = Array.isArray(responsiblePersonData) ? responsiblePersonData : [];
    if (!term) return peopleList;
    return peopleList.filter(p => searchWithoutDiacritics(p?.name || '', term));
  }, [search, responsiblePersonData]);

  const isSelected = id => localSelected?.some(item => item.id === id);

  const toggleLocal = person => {
    setLocalSelected(prev => {
      const exists = prev.find(item => item.id === person.id);
      if (exists) {
        lastActionRef.current = 'deselect';
        lastSelectedIdRef.current = null;
        return prev.filter(item => item.id !== person.id);
      }
      lastActionRef.current = 'select';
      lastSelectedIdRef.current = person.id;
      // Đưa phần tử mới chọn lên đầu danh sách
      return [person, ...prev];
    });
  };

  useEffect(() => {
    if (!open) return;
    if (lastActionRef.current !== 'select') return;
    if (!lastSelectedIdRef.current) return;
    const el = document.querySelector(`[data-rpcb-item="${lastSelectedIdRef.current}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    lastActionRef.current = null;
  }, [localSelected, open]);

  // Merge refs cho trigger element
  const setTriggerRef = node => {
    triggerRef.current = node;
    refs.setReference(node);
    // Merge với ref có sẵn nếu có
    if (children && typeof children.ref === 'function') {
      children.ref(node);
    } else if (children && children.ref) {
      children.ref.current = node;
    }
  };

  const triggerElement =
    children &&
    React.cloneElement(children, {
      ref: setTriggerRef,
      ...getReferenceProps(),
    });

  const handleConfirmAll = () => {
    if (isSelectMode) {
      showToast('error', 'Vui lòng hoàn thành chế độ chọn lệnh trước khi áp dụng tất cả');
      return;
    }
    if (!hasPersonSelected) {
      showToast('error', 'Vui lòng chọn ít nhất một người phụ trách trước khi áp dụng');
      return;
    }
    onConfirm?.(localSelected);
    if (saveAsDefault && typeof onSaveAsDefault === 'function') {
      onSaveAsDefault(localSelected);
    }
    onClose?.();
  };

  const handleSelectModeAction = () => {
    if (!hasPersonSelected) {
      showToast('error', 'Vui lòng chọn ít nhất một người phụ trách trước khi chọn lệnh');
      return;
    }
    if (isSelectMode) {
      // Đang ở chế độ chọn lệnh
      if (selectedProductionOrdersCount > 0) {
        onApplySelected?.(localSelected);
        onClose?.();
      } else {
        showToast('error', 'Vui lòng chọn ít nhất một lệnh sản xuất để áp dụng');
      }
    } else {
      // Chưa vào chế độ chọn lệnh
      showToast('success', 'Vui lòng chọn các lệnh sản xuất cần áp dụng');
      onSelectMode?.(localSelected);
    }
  };

  return (
    <>
      {triggerElement}
      {open &&
        createPortal(
          <div
            ref={refs.setFloating}
            className={`font-deca p-3 bg-white rounded-[16px] shadow-xl flex flex-col gap-2 overflow-hidden ${className}`}
            style={{
              ...floatingStyles,
              width,
              minWidth: triggerRef.current ? Math.max(width, triggerRef.current.getBoundingClientRect().width || 0) : width,
              zIndex: 1000,
            }}
            {...getFloatingProps()}
          >
            {/* Search */}
            <div className='w-full flex items-center gap-2'>
              <div className='min-w-0 flex-1 flex items-center gap-3 pl-2 pr-1 py-1 border border-[#D0D5DD] rounded-lg bg-white focus-within:ring-1 focus-within:ring-[#1760B9]'>
                <input
                  ref={inputRef}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder='Tìm người phụ trách'
                  className='flex-1 min-w-0 text-sm text-[#101828] outline-none placeholder:text-[#9295A4]'
                />
                <div className='w-8 h-8 flex-shrink-0 rounded-lg bg-[#1760B9] flex items-center justify-center'>
                  <MagnifyingGlassIcon className='size-5 text-white' />
                </div>
              </div>
            </div>

            {/* List */}
            <Customscrollbar className='flex-1 min-h-0'>
              {isLoading ? (
                <div className='flex items-center justify-center py-8'>
                  <Loading />
                </div>
              ) : (
                <div className='space-y-1'>
                  {filtered
                    .slice()
                    .sort((a, b) => {
                      const aSelected = isSelected(a.id);
                      const bSelected = isSelected(b.id);

                      // Phần tử đã chọn lên đầu, chưa chọn ở sau
                      if (aSelected && !bSelected) return -1;
                      if (!aSelected && bSelected) return 1;

                      // Nếu cả hai đều đã chọn, sắp xếp theo thứ tự trong localSelected (phần tử mới chọn lên trước)
                      if (aSelected && bSelected) {
                        const aIndex = localSelected.findIndex(item => item.id === a.id);
                        const bIndex = localSelected.findIndex(item => item.id === b.id);
                        return aIndex - bIndex;
                      }

                      // Cả hai đều chưa chọn, giữ nguyên thứ tự
                      return 0;
                    })
                    .map(person => {
                      const active = isSelected(person.id);
                      return (
                        <div key={person.id}>
                          <button
                            data-rpcb-item={person.id}
                            onClick={() => toggleLocal(person)}
                            className={`w-full flex items-center gap-3 p-1.5 rounded-[10px] text-left transition-colors  border-[#E7EAEE] ${active ? 'bg-[#EBF5FF]' : 'bg-white hover:bg-[#F6F8FB]'
                              }`}
                          >
                            <ResponsibleAvatar avatarUrl={person.avatarUrl} fullName={person.name} size={32} className='!min-w-8 !max-w-8 !min-h-8 !max-h-8 !h-8 !w-8 text-base' />
                            <div className='flex-1 text-sm text-[#101828]'>{person.name}</div>
                            {active && <CheckThinIcon className='size-4 text-[#1760B9]' />}
                          </button>
                        </div>
                      );
                    })}
                  {filtered.length === 0 && !isLoading && (
                    <NoData type='person' titleText='Không tìm thấy người phù hợp' />
                  )}
                </div>
              )}
            </Customscrollbar>
            {inlineConfirm ? (
              <div className='flex items-center justify-center w-full pt-2 z-10'>
                <button
                  className='w-full text-blue-fmrp bg-white border border-blue-fmrp px-4 py-2.5 text-sm rounded-[8px] font-medium hover:bg-blue-fmrp/20 transition-colors truncate'
                  onClick={handleConfirmAll}
                >
                  Xác nhận
                </button>
              </div>
            ) : (
              !hideFooterActions && (
                <div className='flex flex-col items-center justify-center gap-2 w-full z-10'>
                  <div className='w-full flex flex-col gap-1.5'>
                    {!isSelectMode && (
                      <label className='flex items-center gap-2 cursor-pointer text-xs text-[#667085] hover:text-[#344054] transition-colors'>
                        <input
                          type='checkbox'
                          checked={saveAsDefault}
                          onChange={e => setSaveAsDefault(e.target.checked)}
                          className='w-4 h-4 rounded border-[#D0D5DD] text-[#0375F3] focus:ring-[#0375F3] cursor-pointer'
                        />
                        <span>Lưu làm mặc định cho công đoạn này</span>
                      </label>
                    )}
                    <button
                      className='w-full bg-[#0375F3] text-white px-4 py-2.5 text-sm rounded-[8px] font-medium hover:bg-[#0375F3]/90 transition-colors truncate'
                      onClick={handleConfirmAll}
                    >
                      Áp dụng tất cả
                    </button>

                  </div>
                  {!isSelectMode ? (
                    <button
                      className='w-full text-blue-fmrp bg-white border border-blue-fmrp px-4 py-2.5 text-sm rounded-[8px] font-medium hover:bg-blue-fmrp/20 transition-colors truncate'
                      onClick={handleSelectModeAction}
                    >
                      Tùy chọn lệnh
                    </button>
                  ) : (
                    <div className='flex items-center gap-2 w-full'>
                      <button
                        className='text-[#DC2626] bg-white border border-[#DC2626] px-4 py-[9px] text-sm rounded-[8px] font-medium hover:bg-[#FEE2E2] hover:border-[#DC2626] transition-colors truncate'
                        onClick={() => {
                          onCancelSelectMode?.();
                        }}
                      >
                        Hủy
                      </button>
                      <button
                        className='flex-1 bg-[#0375F3] text-white px-4 py-2.5 text-sm rounded-[8px] font-medium hover:bg-[#0375F3]/90 transition-colors truncate'
                        onClick={handleSelectModeAction}
                      >
                        {selectedProductionOrdersCount > 0
                          ? `Áp dụng (${selectedProductionOrdersCount})`
                          : 'Tùy chọn lệnh'}
                      </button>
                    </div>
                  )}
                </div>
              )
            )}
          </div>,
          document.body
        )}
      <PopupConfim
        type='warning'
        title='Bạn có muốn huỷ thao tác này không?'
        subtitle='Các thay đổi chọn người phụ trách sẽ không được lưu.'
        isOpen={isConfirmOpen}
        forceConfirm
        save={() => {
          setIsConfirmOpen(false);
          onClose?.();
        }}
        cancel={() => {
          setIsConfirmOpen(false);
        }}
      />
      <PopupConfim
        type='warning'
        title='Cảnh báo'
        subtitle='Ca làm việc này không có nhân viên. Bạn có muốn xếp ca không?'
        isOpen={isNoStaffWarningOpen}
        forceConfirm
        save={() => {
          setIsNoStaffWarningOpen(false);
          onClose?.();
          router.push('/piecework-wage/shift-schedule');
        }}
        cancel={() => {
          setIsNoStaffWarningOpen(false);
          onClose?.();
        }}
      />
    </>
  );
};

export default PersonSelector;
