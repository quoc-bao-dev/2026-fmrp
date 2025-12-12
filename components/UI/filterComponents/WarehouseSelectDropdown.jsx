import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MdArrowDropDown, MdClose } from 'react-icons/md';
import { twMerge } from 'tailwind-merge';
import { MagnifyingGlassIcon } from '@/components/icons';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import formatNumber from '@/utils/helpers/formatnumber';

/**
 * Component dropdown chọn kho dùng chung trong hệ thống
 * Dựa trên UI của WarehouseDropdown nhưng đơn giản hóa cho use case chọn kho
 * 
 * @param {Object} props
 * @param {Array} props.options - Danh sách options [{label, value, ...}]
 * @param {Object} props.value - Option được chọn
 * @param {Function} props.onChange - Callback khi chọn option (option) => void
 * @param {String} props.placeholder - Placeholder text
 * @param {String} props.className - Class name cho container
 * @param {Boolean} props.disabled - Disabled state
 * @param {Number} props.dropdownHeight - Chiều cao dropdown
 * @param {Number} props.offset - Offset từ button
 * @param {String} props.maxHeightClass - Class cho max height
 * @param {String} props.buttonClassName - Class cho button
 * @param {String} props.contentClassName - Class cho dropdown content
 * @param {Function} props.formatNumber - Function format số
 * @param {Number} props.minDropdownWidth - Chiều rộng tối thiểu
 * @param {Boolean} props.allowClear - Cho phép clear
 * @param {Function} props.formatOptionLabel - Custom format option label
 * @param {Boolean} props.isSearchable - Cho phép tìm kiếm
 * @param {String} props.dropdownClassName - Class name cho dropdown content để điều chỉnh width
 */
export const WarehouseSelectDropdown = ({
  options = [],
  value,
  onChange,
  placeholder = 'Chọn kho',
  className = '',
  disabled = false,
  dropdownHeight = 320,
  offset = 8,
  maxHeightClass = 'max-h-80',
  buttonClassName = '',
  contentClassName = 'fixed rounded-lg bg-white border border-[#E5E7EB] z-[9999] p-3 shadow-lg',
  formatNumber: formatNumberFn = formatNumber,
  minDropdownWidth = 300,
  allowClear = false,
  formatOptionLabel = null,
  isSearchable = true,
  dropdownClassName = '',
}) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, showAbove: false });
  const [searchValue, setSearchValue] = useState('');
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const showAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    setPosition({
      top: showAbove ? rect.top + window.scrollY - offset : rect.bottom + window.scrollY + offset,
      left: rect.left + window.scrollX,
      width: rect.width,
      showAbove,
    });
  }, [dropdownHeight, offset]);

  useEffect(() => {
    if (!open) return undefined;
    updatePosition();
    const handleScroll = () => updatePosition();
    const handleResize = () => updatePosition();
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = event => {
      if (buttonRef.current && !buttonRef.current.contains(event.target) && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
        setSearchValue(''); // Reset search khi đóng
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Focus vào input search khi mở dropdown
  useEffect(() => {
    if (open && isSearchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [open, isSearchable]);

  // Filter options dựa trên search value
  const filteredOptions = useMemo(() => {
    if (!isSearchable || !searchValue.trim()) return options;
    const searchTerm = searchValue.toLowerCase().trim();
    return options.filter(option => {
      const label = option?.label?.toLowerCase() || '';
      const value = String(option?.value || '').toLowerCase();
      return label.includes(searchTerm) || value.includes(searchTerm);
    });
  }, [options, searchValue, isSearchable]);

  const displayText = useMemo(() => {
    if (!value) return placeholder;
    if (formatOptionLabel) {
      return formatOptionLabel(value);
    }
    // Format mặc định: label (tồn: value)
    return `${value.label} (Tồn: ${formatNumberFn(Number(value.value || 0))})`;
  }, [value, placeholder, formatOptionLabel, formatNumberFn]);

  const dropdownContent = open && !disabled && (
    <div
      ref={dropdownRef}
      className={twMerge(contentClassName, dropdownClassName)}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: dropdownClassName ? undefined : `${Math.max(position.width, minDropdownWidth)}px`,
        minWidth: dropdownClassName ? undefined : `${minDropdownWidth}px`,
        transform: position.showAbove ? 'translateY(-100%)' : 'none',
      }}
    >
      {isSearchable && (
        <div className='mb-3 pb-3 border-b border-[#E5E7EB]'>
          <div className='bg-white flex gap-x-2 items-center rounded-lg border border-[#D0D5DD] px-2 py-1.5 focus-within:border-transparent focus-within:ring-2 focus-within:ring-blue-500'>
            <input
              ref={searchInputRef}
              type='text'
              placeholder='Tìm kiếm...'
              className='flex-1 border-none outline-none text-[#3A3E4C] placeholder-gray-300 text-xs'
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onClick={e => e.stopPropagation()}
            />
            <button
              type='button'
              onClick={e => {
                e.stopPropagation();
                setSearchValue('');
              }}
              className={`rounded-lg p-1 transition-colors ${searchValue ? 'bg-[#0375F3]' : 'bg-transparent'}`}
            >
              <MagnifyingGlassIcon className={`size-3 ${searchValue ? 'text-white' : 'text-[#9295A4]'}`} />
            </button>
          </div>
        </div>
      )}
      {filteredOptions && filteredOptions.length > 0 ? (
        <Customscrollbar className={maxHeightClass}>
          <div className='flex flex-col gap-y-2'>
            {filteredOptions.map(option => {
              // So sánh value: có thể là object với id hoặc so sánh trực tiếp
              const isSelected = value && (
                (value.id && option.id && value.id === option.id) ||
                (value.value && option.value && value.value === option.value) ||
                (value === option) ||
                (typeof value === 'object' && typeof option === 'object' && JSON.stringify(value) === JSON.stringify(option))
              );
              return (
                <div
                  key={option.id || option.value || option.label}
                  className='flex items-center gap-2 py-2 rounded cursor-pointer hover:bg-blue-50 transition-colors px-2'
                  onClick={() => {
                    onChange(option);
                    setOpen(false);
                  }}
                >
                  <div
                    className={twMerge(
                      'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                      isSelected ? 'border-[#0375F3]' : 'border-[#D0D5DD]'
                    )}
                  >
                    {isSelected && <div className='w-2 h-2 rounded-full bg-[#0375F3]' />}
                  </div>
                  {formatOptionLabel ? (
                    <div className='flex-1'>{formatOptionLabel(option)}</div>
                  ) : (
                    <div className='flex flex-col gap-1 w-full'>
                      <span className='text-[#141522] text-xs font-normal'>{option.label}</span>
                      {option.value !== undefined && (
                        <span className='text-neutral-03 text-xs font-normal'>Tồn: {formatNumberFn(Number(option.value || 0))}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Customscrollbar>
      ) : (
        <NoData type='report' titleText={searchValue ? 'Không tìm thấy kết quả' : 'Không có dữ liệu'} />
      )}
    </div>
  );

  return (
    <>
      <div className={twMerge('relative', className || 'w-[300px]')}>
        <button
          type='button'
          ref={buttonRef}
          onClick={() => {
            if (disabled) return;
            setOpen(prev => {
              if (!prev) {
                updatePosition();
              }
              return !prev;
            });
          }}
          className={twMerge(
            'flex justify-between items-center w-full text-[#3A3E4C] font-medium px-3 py-2 text-sm bg-white rounded-xl border border-[#D0D5DD] hover:border-[#D0D5DD] transition-all duration-200',
            disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
            buttonClassName
          )}
        >
          <span className='truncate'>{value ? displayText : <span className='text-[#3A3E4C]'>{placeholder}</span>}</span>
          <div className='flex items-center gap-1'>
            {value && !disabled && allowClear ? (
              <MdClose
                className='text-[#9295A4] hover:text-[#0375F3] shrink-0 cursor-pointer transition-colors'
                size={18}
                onClick={e => {
                  e.stopPropagation();
                  onChange?.(null);
                  setOpen(false);
                }}
              />
            ) : (
              <MdArrowDropDown className='text-[#9295A4] shrink-0' size={25} />
            )}
          </div>
        </button>
      </div>
      {typeof document !== 'undefined' && createPortal(dropdownContent, document.body)}
    </>
  );
};

