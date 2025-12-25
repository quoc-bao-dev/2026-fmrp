import { EditIcon, EyeIcon, PlusIcon, ThreeDotIcon, TrashIcon } from '@/components/icons';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFloating, offset, flip, shift, useDismiss, useInteractions, autoUpdate } from '@floating-ui/react';
import DropdownShiftSelector from './DropdownShiftSelector';

const SHIFT_CONFIG = {
  morning: {
    label: 'Ca sáng',
    time: '09:37 - 11:30',
    bgClass: 'bg-[#FFF7E6]',
    borderClass: 'border-[#FFD591]',
  },
  noon: {
    label: 'Ca trưa',
    time: '09:37 - 11:30',
    bgClass: 'bg-[#F6FFED]',
    borderClass: 'border-[#B7EB8F]',
  },
  afternoon: {
    label: 'Ca chiều',
    time: '09:37 - 11:30',
    bgClass: 'bg-[#FFF1F0]',
    borderClass: 'border-[#FFCCC7]',
  },
  night: {
    label: 'Ca tối',
    time: '18:00 - 21:30',
    bgClass: 'bg-[#E6F7FF]',
    borderClass: 'border-[#91D5FF]',
  },
  training: {
    label: 'Training',
    time: '09:37 - 11:30',
    bgClass: 'bg-[#F2F2FF]',
    borderClass: 'border-[#E3B3FF]',
  },
  empty: {
    label: '',
    time: '',
    bgClass: 'bg-[#FAFAFA]',
    borderClass: 'border-[#E5E7EB] hover:border-blue-fmrp',
  },
};

const ShiftCell = ({ type, onAddShift, onEditShift, onSelectShift, dayIndex, rowId }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isShiftDropdownOpen, setIsShiftDropdownOpen] = useState(false);
  const [shiftDropdownMode, setShiftDropdownMode] = useState('add');
  const actionBtnRef = useRef(null);
  const addShiftBtnRef = useRef(null);
  const editShiftBtnRef = useRef(null);
  const cellRef = useRef(null); // Ref cho cell div để tính toán vị trí dropdown

  // Sử dụng Floating UI cho menu
  const { refs: menuRefs, floatingStyles: menuFloatingStyles, context: menuContext } = useFloating({
    open: isMenuOpen,
    onOpenChange: setIsMenuOpen,
    placement: 'bottom-start',
    // Tự động cập nhật vị trí khi scroll hoặc resize
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(4),
      flip(),
      shift({ padding: 8 }),
    ],
  });

  // Tự động xử lý click outside cho menu
  const dismiss = useDismiss(menuContext);
  const { getFloatingProps: getMenuFloatingProps } = useInteractions([dismiss]);

  // Gắn reference cho menu
  useEffect(() => {
    if (actionBtnRef.current) {
      menuRefs.setReference(actionBtnRef.current);
    }
  }, [menuRefs]);

  const config = SHIFT_CONFIG[type];
  if (!config) return null;

  // Xử lý mở dropdown thêm ca
  const handleOpenAddShiftDropdown = () => {
    setIsMenuOpen(false);
    // Delay một chút để đảm bảo click event đã được xử lý xong
    setTimeout(() => {
      setShiftDropdownMode('add');
      setIsShiftDropdownOpen(true);
    }, 0);
  };

  // Xử lý mở dropdown sửa ca
  const handleOpenEditShiftDropdown = () => {
    setIsMenuOpen(false);
    // Delay một chút để đảm bảo click event đã được xử lý xong
    setTimeout(() => {
      setShiftDropdownMode('edit');
      setIsShiftDropdownOpen(true);
    }, 0);
  };

  // Xử lý chọn ca từ dropdown
  const handleSelectShift = (shiftId, dayIndex, mode) => {
    onSelectShift?.(shiftId, dayIndex, mode, type);
  };

  // Ô trống: chỉ hiển thị nút PlusIcon ở giữa
  if (type === 'empty') {
    return (
      <>
        <button
          ref={addShiftBtnRef}
          type='button'
          onClick={handleOpenAddShiftDropdown}
          className={`relative group w-full min-h-[50px] h-fit rounded border flex items-center justify-center ${config.bgClass} ${config.borderClass}`}
        >
          <PlusIcon className='size-4 text-[#CCCCCC] group-hover:text-blue-fmrp' />
        </button>
        <DropdownShiftSelector
          open={isShiftDropdownOpen && shiftDropdownMode === 'add'}
          onClose={() => setIsShiftDropdownOpen(false)}
          triggerRef={addShiftBtnRef}
          mode='add'
          onSelect={handleSelectShift}
          dayIndex={dayIndex}
        />
      </>
    );
  }

  const handleToggleMenu = e => {
    e.stopPropagation();
    setIsMenuOpen(prev => !prev);
  };

  const menuPortal =
    isMenuOpen && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={menuRefs.setFloating}
            style={menuFloatingStyles}
            {...getMenuFloatingProps()}
            data-shift-menu='true'
            className='fixed z-[9999] w-32 rounded-lg overflow-hidden border border-[#D8DAE5] bg-white shadow-md'
          >
            <button
              ref={addShiftBtnRef}
              type='button'
              onClick={e => {
                e.stopPropagation();
                e.preventDefault();
                handleOpenAddShiftDropdown();
              }}
              className='w-full p-2 flex items-center gap-3 text-left text-xs text-neutral-07 hover:bg-[#ECF3FB]'
            >
              <PlusIcon className='size-4 text-blue-fmrp' />
              Thêm ca
            </button>
            <button
              ref={editShiftBtnRef}
              type='button'
              onClick={e => {
                e.stopPropagation();
                e.preventDefault();
                handleOpenEditShiftDropdown();
              }}
              className='w-full p-2 flex items-center gap-3 text-left text-xs text-neutral-07 hover:bg-[#ECF3FB]'
            >
              <EditIcon className='size-4 text-green-00' />
              Sửa
            </button>
            <button type='button' className='w-full p-2 flex items-center gap-3 text-left text-xs text-neutral-07 hover:bg-[#ECF3FB]'>
              <TrashIcon className='size-4 text-red-01' />
              Xóa
            </button>
          </div>,
          document.body
        )
      : null;

  // Các ca còn lại: hiển thị label + time + icon
  return (
    <>
      <div ref={cellRef} className={`group relative px-2 py-0.5 w-full min-h-[50px] h-fit rounded border overflow-hidden ${config.bgClass} ${config.borderClass} hover:border-transparent`}>
        {/* Nội dung ca */}
        <div className='flex h-full min-h-11 flex-col justify-center gap-0.5'>
          <p className='responsive-text-sm font-medium text-neutral-05'>{config.label}</p>
          <p className='responsive-text-xs text-neutral-02'>{config.time}</p>
        </div>

        {/* Layer blur + action: luôn hiển thị khi menu mở, hoặc khi hover */}
        <div
          className={`pointer-events-none absolute inset-0 flex items-center justify-center gap-3 bg-black/5 backdrop-blur-[2px] transition-opacity duration-200 ${
            isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <button className='px-4 py-1.5 pointer-events-auto rounded bg-white hover:bg-blue-fmrp text-blue-fmrp hover:text-white flex items-center justify-center'>
            <EyeIcon className='size-4' />
          </button>
          <button
            type='button'
            ref={actionBtnRef}
            onClick={handleToggleMenu}
            className='px-4 py-1.5 pointer-events-auto rounded bg-white hover:bg-blue-fmrp text-blue-fmrp hover:text-white flex items-center justify-center'
          >
            <ThreeDotIcon className='size-4' />
          </button>
        </div>
      </div>
      <DropdownShiftSelector
        open={isShiftDropdownOpen}
        onClose={() => setIsShiftDropdownOpen(false)}
        triggerRef={cellRef}
        mode={shiftDropdownMode}
        initialShift={shiftDropdownMode === 'edit' ? type : null}
        onSelect={handleSelectShift}
        dayIndex={dayIndex}
      />
      {menuPortal}
    </>
  );
};

export default ShiftCell;
