import { CloseXIcon, SearchIcon } from '@/components/icons';
import { useEffect, useRef, useState } from 'react';
import { useFloating, offset, flip, shift, size } from '@floating-ui/react';

// Danh sách các ca có sẵn
const AVAILABLE_SHIFTS = [
  { id: 'morning', label: 'Ca sáng', time: '08:00 - 12:00' },
  { id: 'afternoon', label: 'Ca chiều', time: '11:00 - 16:00' },
  { id: 'noon', label: 'Ca trưa', time: '12:00 - 14:00' },
  { id: 'night', label: 'Ca tối', time: '18:00 - 21:30' },
  { id: 'training', label: 'Training', time: '09:00 - 17:00' },
];

const DropdownShiftSelector = ({
  open,
  onClose,
  triggerRef,
  mode = 'add', // 'add' hoặc 'edit'
  initialShift = null, // Ca hiện tại khi sửa
  onSelect,
  dayIndex,
}) => {
  const [selectedShift, setSelectedShift] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const isHandlingMenuActionRef = useRef(false);

  // Khởi tạo selectedShift khi mở dropdown ở chế độ edit
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialShift) {
        setSelectedShift(initialShift);
      } else {
        setSelectedShift(null);
      }
      setSearchQuery('');
    }
  }, [open, mode, initialShift]);

  // Lọc danh sách ca theo từ khóa tìm kiếm
  const filteredShifts = AVAILABLE_SHIFTS.filter(shift => shift.label.toLowerCase().includes(searchQuery.toLowerCase()));

  // Xử lý chọn ca
  const handleSelectShift = shiftId => {
    setSelectedShift(shiftId);
    onSelect?.(shiftId, dayIndex, mode);
  };

  // Sử dụng Floating UI để tự động tính toán vị trí
  const { refs, floatingStyles, placement, update } = useFloating({
    open,
    onOpenChange: onClose,
    placement: 'bottom-start',
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

  // Xử lý click outside thủ công để tránh lỗi với useDismiss
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = event => {
      // Nếu đang xử lý action từ menu, không làm gì cả
      if (isHandlingMenuActionRef.current) {
        return;
      }

      const target = event.target;
      const dropdown = refs.floating.current;

      // Kiểm tra xem có phải click vào dropdown không
      if (dropdown?.contains(target)) {
        return;
      }

      // Kiểm tra xem có phải click vào trigger không
      if (triggerRef?.current?.contains(target)) {
        return;
      }

      // Kiểm tra xem có phải click vào menu actions không (nếu có)
      const menu = target.closest('[data-shift-menu="true"]');
      if (menu) {
        return;
      }

      // Nếu không phải click vào dropdown hoặc trigger, đóng dropdown
      onClose();
    };

    // Delay việc đăng ký click outside handler để tránh đóng ngay sau khi mở từ menu
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside, true);
    }, 150);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [open, onClose, triggerRef, refs.floating]);

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
    onSelect?.(selectedShift, dayIndex, mode);
    onClose();
  };

  // Chỉ render khi open và có reference element
  if (!open || !triggerRef?.current) return null;

  return (
    <div
      ref={refs.setFloating}
      style={floatingStyles}
      className={`py-4 px-3 z-[1000] bg-white rounded-lg shadow-[0px_4px_20px_0px_#00000033] max-h-[400px] overflow-hidden flex flex-col gap-4 border border-[#E5E7EB] min-w-[220px]`}
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
        {filteredShifts.map(shift => (
          <button
            key={shift.id}
            type='button'
            onClick={e => {
              e.stopPropagation();
              handleSelectShift(shift.id);
            }}
            className={`flex items-center justify-between py-3 px-1 border-b border-[#F3F4F6] hover:bg-[#F9FAFB] cursor-pointer transition-colors ${selectedShift === shift.id ? 'bg-[#ECF3FB]' : ''}`}
          >
            <span className='responsive-text-sm font-medium text-neutral-05 text-left'>
              {shift.label} <span className='text-neutral-02 font-normal'>({shift.time})</span>
            </span>
            <input
              type='radio'
              name='shift'
              value={shift.id}
              checked={selectedShift === shift.id}
              onChange={() => handleSelectShift(shift.id)}
              className='size-4 text-blue-fmrp cursor-pointer outline-none focus:outline-none focus:ring-0'
              onClick={e => e.stopPropagation()}
            />
          </button>
        ))}
        {filteredShifts.length === 0 && <div className='text-center py-4 text-neutral-02 responsive-text-sm'>Không tìm thấy ca nào</div>}
      </div>
      <button
        type='button'
        onClick={e => {
          e.stopPropagation();
          handleSave();
        }}
        className='w-full py-3 px-4 rounded-lg bg-blue-fmrp text-white font-medium responsive-text-sm hover:bg-blue-600 transition-colors'
      >
        Lưu
      </button>
    </div>
  );
};

export default DropdownShiftSelector;
