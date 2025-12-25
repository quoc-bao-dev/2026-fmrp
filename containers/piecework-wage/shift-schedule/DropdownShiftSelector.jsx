import { CloseXIcon, SearchIcon } from '@/components/icons';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

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
  const dropdownRef = useRef(null);
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

  // Tính toán vị trí dropdown
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const [usePortal, setUsePortal] = useState(false);

  useEffect(() => {
    if (!open || !triggerRef?.current) return;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();

      // Kiểm tra xem trigger có nằm trong container có overflow không
      let hasOverflowParent = false;
      let currentParent = trigger.parentElement;
      while (currentParent && currentParent !== document.body) {
        const style = window.getComputedStyle(currentParent);
        const overflow = style.overflow;
        const overflowY = style.overflowY;
        if (overflow === 'auto' || overflow === 'hidden' || overflowY === 'auto' || overflowY === 'hidden') {
          hasOverflowParent = true;
          break;
        }
        currentParent = currentParent.parentElement;
      }

      // Nếu có parent với overflow, dùng portal với fixed positioning
      if (hasOverflowParent) {
        setUsePortal(true);
        const dropdownWidth = Math.max(rect.width, 220);
        setPosition({
          top: rect.bottom + window.scrollY + 4,
          left: rect.left + window.scrollX - 8,
          width: dropdownWidth,
        });
        return;
      }

      // Nếu không có overflow, dùng absolute positioning
      setUsePortal(false);

      // Tìm parent container có class 'p-2' (container trong index.jsx)
      let parentForPosition = trigger.closest('.p-2');

      // Nếu không tìm thấy, tìm parent có position relative/absolute/fixed
      if (!parentForPosition) {
        let currentParent = trigger.parentElement;
        while (currentParent && currentParent !== document.body) {
          const style = window.getComputedStyle(currentParent);
          const position = style.position;
          if (position === 'relative' || position === 'absolute' || position === 'fixed') {
            parentForPosition = currentParent;
            break;
          }
          currentParent = currentParent.parentElement;
        }
      }

      // Fallback cuối cùng
      if (!parentForPosition || parentForPosition === document.body) {
        parentForPosition = trigger.offsetParent || document.body;
      }

      const parentRect = parentForPosition ? parentForPosition.getBoundingClientRect() : { left: 0, top: 0, width: 0 };

      // Chiều ngang = width của trigger, tối thiểu 220px
      const dropdownWidth = Math.max(rect.width, 220);

      // Tính vị trí relative với parent
      // Top: từ bottom của trigger đến top của parent + khoảng cách 4px
      const relativeTop = rect.bottom - parentRect.top + 4;

      // Left: từ left của trigger đến left của parent, trừ đi 8px để căn chỉnh
      const relativeLeft = rect.left - parentRect.left - 8;

      setPosition({
        top: relativeTop,
        left: relativeLeft,
        width: dropdownWidth,
      });
    };

    // Cập nhật ngay lập tức
    updatePosition();

    // Cập nhật khi scroll hoặc resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, triggerRef]);

  // Đóng dropdown khi click outside
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = event => {
      // Nếu đang xử lý action từ menu, không làm gì cả
      if (isHandlingMenuActionRef.current) {
        return;
      }

      const target = event.target;
      const dropdown = dropdownRef.current;

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
  }, [open, onClose, triggerRef]);

  // Reset flag khi dropdown mở
  useEffect(() => {
    if (open) {
      // Set flag để tránh đóng dropdown ngay sau khi mở từ menu
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

  if (!open) return null;

  const dropdownContent = (
    <div
      ref={dropdownRef}
      className={`${
        usePortal ? 'fixed' : 'absolute'
      } py-4 px-3 z-[1000] bg-white rounded-lg shadow-[0px_4px_20px_0px_#00000033] max-h-[400px] overflow-hidden flex flex-col gap-4 border border-[#E5E7EB]`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
        minWidth: '220px',
      }}
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
      <div className='flex flex-col'>
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

  // Render bằng portal nếu cần (khi có overflow parent)
  if (usePortal && typeof document !== 'undefined') {
    return createPortal(dropdownContent, document.body);
  }

  return dropdownContent;
};

export default DropdownShiftSelector;
