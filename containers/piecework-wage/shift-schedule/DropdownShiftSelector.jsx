import { CloseXIcon, SearchIcon } from '@/components/icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFloating, offset, flip, shift, size, useDismiss, useInteractions } from '@floating-ui/react';
import { useGetShiftsByBranch } from '@/managers/api/shift-schedule/useGetShiftsByBranch';
import { useSaveShiftSchedule } from '@/managers/api/shift-schedule/useSaveShiftSchedule';
import { useUpdateShiftSchedule } from '@/managers/api/shift-schedule/useUpdateShiftSchedule';
import useToast from '@/hooks/useToast';

// Helper function để format time từ "HH:mm:ss" thành "HH:mm"
const formatTime = timeString => {
  if (!timeString) return '';
  return timeString.substring(0, 5); // Lấy "HH:mm" từ "HH:mm:ss"
};

const DropdownShiftSelector = ({
  open,
  onClose,
  triggerRef,
  mode = 'add', // 'add' hoặc 'edit'
  initialShift = null, // Ca hiện tại khi sửa
  onSelect,
  dayIndex,
  branchIds = [], // Danh sách branch IDs để filter shifts
  staffId, // Staff ID để lưu ca
  date, // Date để lưu ca (YYYY-MM-DD format)
  existingShifts = [], // Danh sách các ca đã được chọn cho ngày này
}) => {
  const [selectedShift, setSelectedShift] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const isHandlingMenuActionRef = useRef(false);
  const showToast = useToast();

  // Tạo params cho API với branch_id array
  const apiParams = useMemo(() => {
    const params = {
      branch_id: [],
    };
    if (branchIds.length > 0) {
      params.branch_id = branchIds;
    }
    return params;
  }, [branchIds]);

  const { data: shiftsResponse, isLoading: isLoadingShifts } = useGetShiftsByBranch({
    params: apiParams,
    enabled: open, // Chỉ fetch khi dropdown mở
  });

  // Hook để lưu ca làm việc
  const { saveShiftSchedule, isLoading: isSaving } = useSaveShiftSchedule({
    onSuccess: () => {
      onSelect?.(selectedShift, dayIndex, mode);
      onClose();
    },
  });

  // Hook để cập nhật ca làm việc
  const { updateShiftSchedule, isLoading: isUpdating } = useUpdateShiftSchedule({
    onSuccess: () => {
      onSelect?.(selectedShift, dayIndex, mode);
      onClose();
    },
  });

  // Map dữ liệu từ API thành format cho dropdown
  const availableShifts = useMemo(() => {
    if (!shiftsResponse || shiftsResponse.result !== 1 || !Array.isArray(shiftsResponse.data)) {
      return [];
    }
    return shiftsResponse.data.map(shift => ({
      id: shift.id,
      label: shift.name,
      time: `${formatTime(shift.time_start)} - ${formatTime(shift.time_end)}`,
      time_start: shift.time_start,
      time_end: shift.time_end,
      branch_id: shift.branch_id,
    }));
  }, [shiftsResponse]);

  // Khởi tạo selectedShift khi mở dropdown ở chế độ edit
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialShift) {
        // Nếu initialShift là object có id, dùng id; nếu là string/number, dùng trực tiếp
        setSelectedShift(typeof initialShift === 'object' && initialShift?.id ? initialShift.id : initialShift);
      } else {
        setSelectedShift(null);
      }
      setSearchQuery('');
    }
  }, [open, mode, initialShift]);

  // Lấy danh sách ID các ca đã được chọn (trừ ca hiện tại nếu đang ở chế độ edit)
  const selectedShiftIds = useMemo(() => {
    const ids = existingShifts.filter(s => s && s !== 'empty' && typeof s === 'object' && s.id).map(s => String(s.id));

    // Nếu đang ở chế độ edit, loại bỏ ca hiện tại khỏi danh sách disabled
    if (mode === 'edit' && initialShift) {
      const currentShiftId = typeof initialShift === 'object' && initialShift?.id ? String(initialShift.id) : String(initialShift);
      return ids.filter(id => id !== currentShiftId);
    }

    return ids;
  }, [existingShifts, mode, initialShift]);

  // Kiểm tra xem ca có được chọn chưa
  const isShiftSelected = shiftId => {
    return selectedShiftIds.includes(String(shiftId));
  };

  // Lọc và sắp xếp danh sách ca: chưa chọn ở trên, đã chọn ở dưới
  const filteredAndSortedShifts = useMemo(() => {
    let filtered = availableShifts;

    // Lọc theo từ khóa tìm kiếm
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(shift => shift.label.toLowerCase().includes(query));
    }

    // Sắp xếp: chưa chọn ở trên, đã chọn ở dưới
    return filtered.sort((a, b) => {
      const aSelected = selectedShiftIds.includes(String(a.id));
      const bSelected = selectedShiftIds.includes(String(b.id));

      if (aSelected && !bSelected) return 1; // a đã chọn, b chưa chọn -> b lên trên
      if (!aSelected && bSelected) return -1; // a chưa chọn, b đã chọn -> a lên trên
      return 0; // Giữ nguyên thứ tự nếu cùng trạng thái
    });
  }, [availableShifts, searchQuery, selectedShiftIds]);

  // Xử lý chọn ca
  const handleSelectShift = shiftId => {
    // Kiểm tra nếu ca đã được chọn
    if (isShiftSelected(shiftId)) {
      const shiftName = availableShifts.find(s => String(s.id) === String(shiftId))?.label || 'Ca này';
      showToast('warning', `${shiftName} đã được chọn cho ngày này`);
      return;
    }

    setSelectedShift(shiftId);
    onSelect?.(shiftId, dayIndex, mode);
  };

  // Sử dụng Floating UI để tự động tính toán vị trí
  const { refs, floatingStyles, placement, update, context } = useFloating({
    open,
    onOpenChange: onClose,
    placement: 'bottom-start',
    // Sử dụng fixed positioning vì render bằng portal
    strategy: 'fixed',
    middleware: [
      // Khoảng cách từ trigger
      offset(4),
      // Tự động flip lên trên nếu không đủ chỗ bên dưới
      flip({
        fallbackAxisSideDirection: 'start',
      }),
      // Tự động shift để không bị tràn ra ngoài viewport
      shift({
        padding: 8,
      }),
      // Giới hạn chiều rộng và chiều cao
      size({
        apply({ availableWidth, availableHeight, elements }) {
          // Đặt chiều rộng tối thiểu và tối đa
          elements.floating.style.width = `${Math.max(220, Math.min(availableWidth, 220))}px`;
          elements.floating.style.maxHeight = `${Math.min(availableHeight - 16, 400)}px`;
        },
        padding: 8,
      }),
    ],
  });

  // Cập nhật reference ngay khi component mount và khi triggerRef thay đổi
  // Sử dụng useEffect với dependency array rỗng để chạy ngay sau khi mount
  useEffect(() => {
    if (triggerRef?.current) {
      refs.setReference(triggerRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy một lần khi mount

  // Cập nhật lại khi triggerRef thay đổi
  useEffect(() => {
    if (triggerRef?.current) {
      refs.setReference(triggerRef.current);
    }
  }, [triggerRef, refs]);

  // Tự động cập nhật vị trí khi scroll, resize hoặc khi open thay đổi
  useEffect(() => {
    if (!open || !triggerRef?.current) return;

    // Delay một chút để đảm bảo floating element đã được render
    const timeoutId = setTimeout(() => {
      update();
    }, 0);

    // Cập nhật khi scroll hoặc resize
    const handleScroll = () => {
      update();
    };
    const handleResize = () => {
      update();
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [open, update, triggerRef]);

  // Sử dụng useDismiss để tự động xử lý click outside
  const dismiss = useDismiss(context, {
    enabled: open,
    outsidePress: event => {
      // Nếu đang xử lý action từ menu, không đóng
      if (isHandlingMenuActionRef.current) {
        return false;
      }
      const target = event.target;
      // Bỏ qua click vào menu actions
      const menu = target.closest('[data-shift-menu="true"]');
      if (menu) {
        return false;
      }
      return true;
    },
    outsidePressEvent: 'mousedown',
    // Bỏ qua click vào trigger (vì chúng ta tự quản lý open/close)
    referencePress: false,
  });

  const { getFloatingProps } = useInteractions([dismiss]);

  // Reset flag khi dropdown mở
  useEffect(() => {
    if (open) {
      isHandlingMenuActionRef.current = true;
      const timeout = setTimeout(() => {
        isHandlingMenuActionRef.current = false;
      }, 150);
      return () => clearTimeout(timeout);
    } else {
      isHandlingMenuActionRef.current = false;
    }
  }, [open]);

  const handleSave = () => {
    if (!selectedShift) {
      return;
    }

    if (!staffId || !date) {
      console.error('Missing staffId or date');
      return;
    }

    // Nếu mode là 'edit', gọi API update; nếu không, gọi API save
    if (mode === 'edit' && initialShift) {
      // Lấy shift_id cũ từ initialShift
      const oldShiftId = typeof initialShift === 'object' && initialShift?.id ? initialShift.id : initialShift;

      // Gọi API để cập nhật ca làm việc
      updateShiftSchedule({
        staff_id: staffId,
        date: date,
        shift_id: oldShiftId,
        new_shift_id: selectedShift,
      });
    } else {
      // Gọi API để lưu ca làm việc
      saveShiftSchedule({
        staff_id: staffId,
        date: date,
        shifts: selectedShift,
      });
    }
  };

  // Chỉ render khi open và có reference element
  if (!open || !triggerRef?.current) return null;

  const dropdownContent = (
    <div
      ref={refs.setFloating}
      style={floatingStyles}
      {...getFloatingProps()}
      className={`py-4 px-3 z-[10000] bg-white rounded-lg shadow-[0px_4px_20px_0px_#00000033] max-h-[400px] overflow-hidden flex flex-col gap-4 border border-[#E5E7EB] min-w-[220px]`}
      onMouseDown={e => e.stopPropagation()}
    >
      {/* Ô tìm kiếm */}
      <div className='relative'>
        <div className='absolute left-3 top-1/2 -translate-y-1/2'>
          <SearchIcon className='size-4 text-[#4A5565]' />
        </div>
        {searchQuery && (
          <button
            type='button'
            onClick={e => {
              e.stopPropagation();
              setSearchQuery('');
            }}
            className='absolute right-6 top-1/2 -translate-y-1/2 flex items-center justify-center hover:bg-[#D0D5DD] rounded-full p-1 transition-colors'
          >
            <CloseXIcon className='size-4 text-[#4A5565]' />
          </button>
        )}
        <input
          type='text'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onMouseDown={e => e.stopPropagation()}
          placeholder='Tìm kiếm'
          className={`w-full p-2.5 bg-[#EAECEF] rounded-lg outline-none focus:border-neutral-03 focus:ring-1 focus:ring-neutral-03 responsive-text-sm text-[#4A5565] ${
            searchQuery ? 'pl-9 pr-9' : 'pl-9'
          }`}
        />
      </div>

      {/* Danh sách các ca */}
      <div className='flex flex-col overflow-y-auto'>
        {isLoadingShifts ? (
          <div className='text-center py-4 text-neutral-02 responsive-text-sm'>Đang tải...</div>
        ) : filteredAndSortedShifts.length > 0 ? (
          filteredAndSortedShifts.map(shift => {
            const isSelected = isShiftSelected(shift.id);
            const isCurrentSelected = selectedShift === shift.id;

            return (
              <button
                key={shift.id}
                type='button'
                disabled={isSelected}
                onClick={e => {
                  e.stopPropagation();
                  handleSelectShift(shift.id);
                }}
                className={`flex items-center justify-between py-3 px-1 border-b border-[#F3F4F6] transition-colors ${
                  isSelected ? 'opacity-50 cursor-not-allowed bg-[#F9FAFB]' : isCurrentSelected ? 'bg-[#ECF3FB] hover:bg-[#ECF3FB] cursor-pointer' : 'hover:bg-[#F9FAFB] cursor-pointer'
                }`}
              >
                <span className={`responsive-text-sm font-medium text-left ${isSelected ? 'text-neutral-02' : 'text-neutral-05'}`}>
                  {shift.label} <span className='text-neutral-02 font-normal'>({shift.time})</span>
                  {isSelected && <span className='text-neutral-02 font-normal text-xs ml-1'>(Đã chọn)</span>}
                </span>
                <input
                  type='radio'
                  name='shift'
                  value={shift.id}
                  checked={isCurrentSelected}
                  disabled={isSelected}
                  onChange={() => handleSelectShift(shift.id)}
                  className='size-4 text-blue-fmrp outline-none focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed'
                  onClick={e => {
                    e.stopPropagation();
                    if (!isSelected) {
                      handleSelectShift(shift.id);
                    }
                  }}
                />
              </button>
            );
          })
        ) : (
          <div className='text-center py-4 text-neutral-02 responsive-text-sm'>Không tìm thấy ca nào</div>
        )}
      </div>
      <button
        type='button'
        onClick={e => {
          e.stopPropagation();
          handleSave();
        }}
        disabled={!selectedShift || isSaving || isUpdating}
        className={`w-full py-3 px-4 rounded-lg bg-blue-fmrp text-white font-medium responsive-text-sm transition-colors ${
          !selectedShift || isSaving || isUpdating ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
        }`}
      >
        {isSaving || isUpdating ? (mode === 'edit' ? 'Đang cập nhật...' : 'Đang lưu...') : mode === 'edit' ? 'Cập nhật' : 'Lưu'}
      </button>
    </div>
  );

  // Render bằng portal để đảm bảo nó luôn ở trên cùng, đặc biệt khi nằm trong dropdown "Xem thêm"
  if (typeof document !== 'undefined') {
    return createPortal(dropdownContent, document.body);
  }

  return null;
};

export default DropdownShiftSelector;
