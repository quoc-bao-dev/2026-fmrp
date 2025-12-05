import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MdArrowDropDown, MdClose } from 'react-icons/md';
import { twMerge } from 'tailwind-merge';
import { MagnifyingGlassIcon } from '@/components/icons';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';

const defaultFormatDate = value => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN');
};

const defaultFormatNumber = value => value;

export const convertWarehousesToDropdownData = listWarehouses => {
  if (!Array.isArray(listWarehouses)) return [];
  const groups = {};

  listWarehouses.forEach(warehouse => {
    if (!warehouse?.name_warehouse) return;
    if (!groups[warehouse.name_warehouse]) {
      groups[warehouse.name_warehouse] = [];
    }
    if (Array.isArray(warehouse.items) && warehouse.items.length > 0) {
      warehouse.items.forEach(item => {
        if (!item) return;
        const rawTotal = item.total_quantity ?? item.quantity_warehouse ?? 0;
        const numericTotal = Number(rawTotal);
        const resolvedTotal = !rawTotal || Number.isNaN(numericTotal) || numericTotal === 0 ? Number(item.quantity_warehouse ?? item.total_quantity ?? 0) : numericTotal;

        groups[warehouse.name_warehouse].push({
          name_location: item.name_location,
          name_warehouse: warehouse.name_warehouse,
          lot: item.lot,
          expiration_date: item.expiration_date,
          total_quantity: Number.isNaN(resolvedTotal) ? 0 : resolvedTotal,
          id_warehouse_custom: item.id_warehouse_custom,
          warehouse_id: item.warehouse_id || warehouse.warehouse_id || '',
          location_id: item.location_id || warehouse.location_id || '',
        });
      });
    } else {
      const rawTotal = warehouse.total_quantity ?? warehouse.quantity_warehouse ?? 0;
      const numericTotal = Number(rawTotal);
      const fallbackTotal = !rawTotal || Number.isNaN(numericTotal) || numericTotal === 0 ? Number(warehouse.quantity_warehouse ?? warehouse.total_quantity ?? 0) : numericTotal;

      groups[warehouse.name_warehouse].push({
        name_location: warehouse.name_location,
        name_warehouse: warehouse.name_warehouse,
        lot: warehouse.lot,
        expiration_date: warehouse.expiration_date,
        total_quantity: Number.isNaN(fallbackTotal) ? 0 : fallbackTotal,
        id_warehouse_custom: warehouse.id_warehouse_custom,
        warehouse_id: warehouse.warehouse_id || '',
        location_id: warehouse.location_id || '',
      });
    }
  });

  return Object.entries(groups).map(([label, options]) => ({
    label,
    options,
  }));
};

export const CustomDropdownRadioGroup = ({
  data = [],
  value,
  onChange,
  placeholder = 'Chọn kho hàng',
  className = '',
  disabled = false,
  dropdownHeight = 320,
  offset = 8,
  maxHeightClass = 'max-h-80',
  buttonClassName = '',
  contentClassName = 'fixed rounded-xl bg-white border border-[#E5E7EB] z-[9999] p-3 shadow-lg',
  formatDate = defaultFormatDate,
  formatNumber = defaultFormatNumber,
  showOnlyLotDate = false,
  showOnlyWarehouseLocation = false,
  minDropdownWidth = 300,
  isSearchable = false,
  searchValue = '',
  onSearchChange = null,
  isLoading = false,
  allowClear = false,
}) => {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, showAbove: false });
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const hasOpenedRef = useRef(false);

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

  // Ghi nhận đã từng mở dropdown bằng thao tác người dùng
  useEffect(() => {
    if (open) {
      hasOpenedRef.current = true;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const handleClickOutside = event => {
      // Không đóng dropdown khi đang loading
      if (isLoading) return;
      if (buttonRef.current && !buttonRef.current.contains(event.target) && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, isLoading]);

  // Focus vào input search khi mở dropdown
  useEffect(() => {
    if (open && isSearchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [open, isSearchable]);

  // Giữ dropdown mở khi đang loading
  useEffect(() => {
    // Chỉ tự mở lại khi người dùng đã từng mở dropdown
    if (isLoading && !open && isSearchable && hasOpenedRef.current) {
      setOpen(true);
      updatePosition();
    }
  }, [isLoading, open, isSearchable, updatePosition]);

  const selectedOption = useMemo(() => {
    for (const group of data || []) {
      const found = group.options?.find(option => option.id_warehouse_custom === value);
      if (found) {
        return { option: found, group };
      }
    }
    return null;
  }, [data, value]);

  const displayText = selectedOption
    ? showOnlyLotDate
      ? `LOT: ${selectedOption.option.lot} | Date: ${formatDate(selectedOption.option.expiration_date)} | Tồn: ${formatNumber(Number(selectedOption.option.total_quantity))}`
      : showOnlyWarehouseLocation
      ? `${selectedOption.group.label} - ${selectedOption.option.name_location}`
      : `${selectedOption.group.label} - ${selectedOption.option.name_location}`
    : placeholder;

  const dropdownContent = open && !disabled && (
    <div
      ref={dropdownRef}
      className={contentClassName}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${Math.max(position.width, minDropdownWidth)}px`,
        minWidth: `${minDropdownWidth}px`,
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
              onChange={e => onSearchChange?.(e.target.value)}
              onClick={e => e.stopPropagation()}
            />
            <button
              type='button'
              onClick={e => {
                e.stopPropagation();
                onSearchChange?.('');
              }}
              className={`rounded-lg p-1 transition-colors ${searchValue ? 'bg-[#0375F3]' : 'bg-transparent'}`}
            >
              <MagnifyingGlassIcon className={`size-3 ${searchValue ? 'text-white' : 'text-[#9295A4]'}`} />
            </button>
          </div>
        </div>
      )}
      {isLoading ? (
        <div className='py-8 px-4 flex items-center justify-center min-h-[200px]'>
          <Loading className='!h-auto !bg-transparent' />
        </div>
      ) : data && data.length > 0 ? (
        <Customscrollbar className={maxHeightClass}>
          <div className='flex flex-col gap-y-2'>
            {data.map((group, groupIndex) => (
              <div key={groupIndex} className='flex-shrink-0 w-full'>
                {!showOnlyLotDate && <p className='font-semibold text-[#003DA0] uppercase text-xs'>{group.label}</p>}
                <div>
                  {group.options?.map(option => {
                    const isSelected = value === option.id_warehouse_custom;
                    return (
                      <div
                        key={option.id_warehouse_custom}
                        className='flex items-center gap-2 py-2 rounded cursor-pointer hover:bg-blue-50 transition-colors px-2'
                        onClick={() => {
                          onChange(option);
                          setOpen(false);
                        }}
                      >
                        <div className={twMerge('w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0', isSelected ? 'border-[#0375F3]' : 'border-[#D0D5DD]')}>
                          {isSelected && <div className='w-2 h-2 rounded-full bg-[#0375F3]' />}
                        </div>
                        {showOnlyLotDate ? (
                          <div className='flex gap-2 justify-between w-full items-center'>
                            <div className='flex flex-col gap-1'>
                              <span className='text-[#3276FA] text-xs font-normal'>LOT: {option.lot}</span>
                              <span className='text-[#3276FA] text-xs font-normal'>Date: {formatDate(option.expiration_date)}</span>
                              <span className='text-neutral-03 text-xs font-normal'>SL còn lại : {formatNumber(Number(option.total_quantity))}</span>
                            </div>
                          </div>
                        ) : showOnlyWarehouseLocation ? (
                          <div className='flex flex-col w-full'>
                            <span className='text-[#141522] text-xs font-normal'>{option.name_location}</span>
                          </div>
                        ) : (
                          <div className='flex flex-col gap-2 w-full'>
                            <span className='text-[#141522] text-xs font-normal'>{option.name_location}</span>
                            <div className='flex gap-2 justify-between'>
                              <div className='flex flex-col gap-1'>
                                <span className='text-[#3276FA] text-xs font-normal'>LOT: {option.lot}</span>
                                <span className='text-[#3276FA] text-xs font-normal'>Date: {formatDate(option.expiration_date)}</span>
                              </div>
                              <span className='text-neutral-03 text-xs font-normal'>Tồn: {formatNumber(Number(option.total_quantity))}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Customscrollbar>
      ) : (
        <NoData type='report' titleText={searchValue ? 'Không tìm thấy kết quả' : 'Không có dữ liệu'} />
      )}
    </div>
  );

  return (
    <>
      <div className={twMerge('relative w-[300px]', className)}>
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
            'flex justify-between items-center w-full text-[#3A3E4C] font-medium px-3 py-2 text-sm bg-white rounded-xl border border-[#E5E7EB] hover:border-[#D0D5DD] transition-all duration-200',
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
