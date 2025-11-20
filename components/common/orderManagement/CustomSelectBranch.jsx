import { CaretDownIcon } from "@/components/icons";
import FunnelIcon from '@/components/icons/common/FunnelIcon';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { useBranchAllList } from '@/hooks/common/useBranch';
import useToast from '@/hooks/useToast';
import { useEffect, useRef, useState } from 'react';

const CustomRadio = ({ checked }) => {
  return (
    <div className='relative flex items-center justify-center'>
      <div className={`w-4 h-4 rounded-full border ${checked ? 'border-blue-color' : 'border-border-gray-1'} flex items-center justify-center`}>
        {checked && <div className='w-2 h-2 rounded-full bg-blue-color' />}
      </div>
    </div>
  );
};

const CustomSelectBranch = ({
  placeholderText = 'Chọn chi nhánh',
  value,
  onChange,
  onClear,
  disabled,
  isError = false,
  errMess,
  allowClear = true,
  showSearch = false,
  className = '',
  mode = 'multiple',
  keepOpen = false,
}) => {
  const { data: listBranch } = useBranchAllList();

  // State
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const isShow = useToast();

  // Lấy danh sách các branch được enabled
  const enabledBranches = listBranch?.filter(branch => branch.is_enabled === 1 || branch.is_enabled === true) || [];

  // Kiểm tra xem tất cả các branch enabled đã được chọn chưa
  const allSelected = Array.isArray(value) && enabledBranches.length > 0 && value.length === enabledBranches.length && enabledBranches.every(branch => value.includes(branch.value));

  // Kiểm tra có value được chọn không
  const hasValue = Array.isArray(value) ? value.length > 0 : !!value;

  // Filter danh sách theo search
  const filteredBranches = listBranch?.filter(branch => branch.label.toLowerCase().includes(searchValue.toLowerCase())) || [];

  // Handle click outside để đóng dropdown
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (!keepOpen) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, keepOpen]);

  // Handle toggle dropdown
  const handleToggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // Handle select/deselect item
  const handleSelectItem = branchValue => {
    if (mode === 'multiple') {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(branchValue) ? currentValues.filter(v => v !== branchValue) : [...currentValues, branchValue];
      onChange(newValues);
    } else {
      onChange(branchValue);
      if (!keepOpen) {
        setIsOpen(false);
      }
    }
  };

  // Handle select all
  const handleSelectAll = () => {
    if (allSelected) {
      onChange([]);
    } else {
      // Chỉ chọn các branch có is_enabled === 1
      const allEnabledValues = enabledBranches.map(branch => branch.value);
      onChange(allEnabledValues);
    }
  };

  // Handle clear
  const handleClear = () => {
    onChange(mode === 'multiple' ? [] : null);
    onClear?.();
  };

  // Handle search
  const handleSearchChange = e => {
    setSearchValue(e.target.value);
  };

  // Render selected count
  const renderSelectedCount = () => {
    const selectedCount = Array.isArray(value) ? value.length : 0;
    return (
      <div className='custom-tag-branch'>
        <div className='flex items-center gap-1'>
          <span className='responsive-text-base text-gray-700 whitespace-nowrap'>Lọc chi nhánh</span>
          {selectedCount > 0 && (
            <>
              <span className='bg-[#0F4F9E] text-white responsive-text-xs rounded-full px-1.5 min-w-[16px] shrink-0 h-4 leading-4 text-center'>{selectedCount}</span>
              {allowClear && (
                <button
                  type='button'
                  aria-label='Xóa tất cả lựa chọn'
                  onClick={e => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  className='inline-flex items-center justify-center rounded-full hover:bg-white text-gray-500 hover:text-gray-700 transition-colors size-4'
                >
                  <span className='leading-[120%] text-base'>&times;</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`flex flex-col flex-wrap items-start gap-y-2 w-full group ${hasValue ? 'has-value' : ''}`}>
      <div className='relative flex select-with-radio' ref={dropdownRef}>
        <span className='absolute left-3 top-1/2 -translate-y-1/2 z-10 text-[#7a7a7a]'>
          <FunnelIcon className={`size-4 group-hover:text-[#0F4F9E] transition-all duration-300 funnel-icon ${hasValue ? 'text-[#0F4F9E]' : ''}`} />
        </span>

        {/* Input trigger */}
        <div
          className={`placeholder-secondary-color-text-disabled placeholder:responsive-text-sm cursor-pointer select-with-radio w-full custom-select-no-bg custom-select-branch transition-all duration-300 ${className} ${
            isError ? 'border-red-500' : ''
          }`}
          onClick={handleToggleDropdown}
        >
          <div
            className={`flex items-center justify-between w-full h-10 pl-8 pr-3 py-2 border hover:border-[#3276FA] rounded-lg transition-all duration-300 ${
              hasValue || isOpen ? 'border-[#3276FA] bg-[#EBF5FF]' : 'border-[#D0D5DD] bg-white hover:bg-[#EBF5FF]'
            }`}
          >
            {hasValue ? renderSelectedCount() : <span className='text-gray-700 responsive-text-base'>{placeholderText}</span>}
            <CaretDownIcon
              className={`size-4 text-[#9295A4] group-hover:text-[#0F4F9E] group-hover:rotate-180 transition-all duration-300 caret-icon ${hasValue ? 'text-[#0F4F9E]' : ''} ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className='absolute w-[150%] top-full right-0 z-50 mt-1 bg-white border border-gray-200 rounded-2xl shadow-lg max-h-60 overflow-hidden'>
            {/* Header */}
            <div className='p-4 responsive-text-base font-semibold text-gray-700 border-b border-gray-200'>Lọc chi nhánh</div>

            {/* Search */}
            {showSearch && (
              <div className='px-3 py-2 border-b border-gray-100'>
                <input
                  ref={inputRef}
                  type='text'
                  placeholder='Tìm kiếm...'
                  value={searchValue}
                  onChange={handleSearchChange}
                  className='w-full px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-500'
                />
              </div>
            )}

            {/* Options */}
            <Customscrollbar className='max-h-48 overflow-y-auto'>
              {/* Select All option */}
              {mode === 'multiple' && (
                <div className='flex items-center p-4 gap-x-2 responsive-text-sm font-normal text-neutral-07 cursor-pointer hover:bg-gray-50 border-b border-[#F7F8F9]' onClick={handleSelectAll}>
                  <CustomRadio checked={allSelected} />
                  <span className='font-normal'>Tất cả</span>
                </div>
              )}

              {/* Branch options */}
              {filteredBranches.map((branch, index) => {
                const isChecked = Array.isArray(value) ? value.includes(branch.value) : value === branch.value;

                return (
                  <div
                    key={branch.value}
                    className={`flex items-center p-4 gap-x-2 responsive-text-sm font-normal text-neutral-07 cursor-pointer hover:bg-gray-50 
                      ${branch.is_enabled ? '' : 'opacity-50 cursor-not-allowed'} 
                      ${index !== filteredBranches.length - 1 ? 'border-b border-gray-100' : ''}`}
                    onClick={e => {
                      if (!branch.is_enabled) {
                        e.stopPropagation();
                        isShow('error', 'Không có quyền truy cập chi nhánh này');
                        return;
                      }
                      handleSelectItem(branch.value);
                    }}
                  >
                    <CustomRadio checked={isChecked} />
                    {branch.label}
                  </div>
                );
              })}

              {/* No data */}
              {filteredBranches.length === 0 && <div className='px-3 py-4 text-center text-gray-500'>Không có dữ liệu</div>}
            </Customscrollbar>

            {/* Footer with close button */}
            {keepOpen && (
              <div className='px-3 py-2 border-t border-gray-200 bg-gray-50'>
                <button onClick={() => setIsOpen(false)} className='w-full px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors'>
                  Đóng
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {isError && errMess && <label className='text-sm text-red-500'>{errMess}</label>}
    </div>
  );
};

export default CustomSelectBranch;
