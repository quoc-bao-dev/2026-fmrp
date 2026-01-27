import { MagnifyingGlassIcon } from '@/components/icons';
import DropdownFilledIcon from '@/components/icons/common/DropdownFilledIcon';
import { searchWithoutDiacritics } from '@/utils/helpers/stringHelper';
import { Empty, Input, Select } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';

const { Option } = Select;

const CustomRadio = ({ checked }) => {
  return (
    <div className='relative flex items-center justify-center'>
      <div className={`w-4 h-4 rounded-full border ${checked ? 'border-blue-fmrp' : 'border-border-gray-1'} flex items-center justify-center`}>
        {checked && <div className='w-2 h-2 rounded-full bg-blue-fmrp' />}
      </div>
    </div>
  );
};

const SelectSearchableRadio = ({
  isRequired = false,
  label,
  placeholder,
  searchPlaceholder = 'Tìm kiếm',
  options = [],
  value,
  onChange,
  onClear,
  onSearch,
  disabled,
  isError = false,
  errMess,
  icon,
  className,
  mode, // 'multiple' để cho phép chọn nhiều
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [open, setOpen] = useState(false);
  const searchInputRef = useRef(null);

  // Lọc options dựa trên searchValue
  const filteredOptions = useMemo(() => {
    if (!searchValue) return options;

    return options.filter(opt => {
      return searchWithoutDiacritics(opt?.label, searchValue);
    });
  }, [options, searchValue]);

  // Xử lý khi thay đổi giá trị tìm kiếm
  const handleSearch = e => {
    const searchText = e.target.value;
    setSearchValue(searchText);
    if (onSearch) {
      onSearch(searchText);
    }
  };

  // Xử lý khi chọn giá trị
  const handleChange = selectedValue => {
    onChange && onChange(selectedValue);
    // Chỉ đóng dropdown khi không phải multi-select hoặc khi chọn xong trong single select
    if (mode !== 'multiple') {
      setOpen(false);
      setSearchValue(''); // Reset search khi chọn xong
    }
  };

  // Xử lý khi xóa giá trị
  const handleClear = () => {
    setSearchValue('');
    onClear && onClear();
  };

  // Xử lý khi dropdown đóng
  const handleDropdownVisibleChange = visible => {
    setOpen(visible);
    if (!visible) {
      setSearchValue(''); // Reset search khi đóng dropdown
      if (onSearch) {
        onSearch(''); // Gọi lại API với search rỗng
      }
    }
  };

  // Tự động focus vào input search khi dropdown mở
  useEffect(() => {
    if (open && searchInputRef.current) {
      // Delay một chút để đảm bảo DOM đã render
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Kiểm tra option có được chọn không
  const isOptionSelected = optValue => {
    if (!value) return false;

    // Nếu là multi-select mode
    if (mode === 'multiple') {
      if (Array.isArray(value)) {
        return value.includes(optValue);
      }
      return false;
    }

    // Single select mode
    return typeof value === 'object' ? value?.value === optValue : value === optValue;
  };

  return (
    <div className={`group flex flex-col flex-wrap items-start gap-y-2 ${className}`}>
      {/* {label && <InfoFormLabel isRequired={isRequired} label={label} />} */}

      <div className='w-full flex'>
        <div className='relative flex select-with-radio'>
          <span className='absolute left-3 top-1/2 -translate-y-1/2 z-10 text-[#7a7a7a]'>{icon}</span>
          <Select
            className={`placeholder-secondary-color-text-disabled !responsive-text-base placeholder:!responsive-text-base cursor-pointer select-with-radio w-full custom-select-no-bg ${mode === 'multiple'
                ? '[&_.ant-select-selector]:!flex [&_.ant-select-selector]:flex-nowrap [&_.ant-select-selector]:overflow-x-auto [&_.ant-select-selector]:overflow-y-hidden [&_.ant-select-selection-overflow]:flex [&_.ant-select-selection-overflow]:flex-nowrap [&_.ant-select-selection-overflow]:items-center [&_.ant-select-selection-overflow]:gap-1 [&_.ant-select-selection-overflow]:max-w-full [&_.ant-select-selection-item]:flex-shrink-0 [&_.ant-select-selection-item]:max-w-none [&_.ant-select-selection-item-content]:overflow-hidden [&_.ant-select-selection-item-content]:text-ellipsis [&_.ant-select-selection-item-content]:whitespace-nowrap'
                : ''
              }`}
            placeholder={placeholder}
            allowClear
            mode={mode}
            value={mode === 'multiple' ? (Array.isArray(value) ? value : []) : typeof value === 'object' ? value?.value : value}
            // open={true}
            open={open}
            onOpenChange={handleDropdownVisibleChange}
            onChange={handleChange}
            onClear={handleClear}
            disabled={disabled}
            showSearch={false} // Tắt search mặc định của Select, chỉ dùng input trong popupRender
            filterOption={false} // Tắt filter mặc định vì đã tự xử lý
            maxTagCount={mode === 'multiple' ? 1 : undefined}
            maxTagPlaceholder={mode === 'multiple' ? omittedValues => `+${omittedValues.length}` : undefined}
            notFoundContent={
              searchValue && (!filteredOptions || filteredOptions.length === 0) ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='Không tìm thấy kết quả' />
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='Không có dữ liệu' />
              )
            }
            popupRender={menu => (
              <>
                {/* Search bar */}
                {label && <h3 className='p-3 responsive-text-lg font-semibold'>{label}</h3>}
                {searchValue && (
                  <div className='px-2 pb-2'>
                    <div className='relative flex items-center'>
                      <Input
                        ref={searchInputRef}
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={handleSearch}
                        onKeyDown={e => {
                          // Ngăn event bubble lên antd Select (tránh Backspace/Delete tự remove tag đã chọn)
                          e.stopPropagation();
                        }}
                        onMouseDown={e => {
                          // Giữ focus ở input, tránh Select bắt event rồi xóa tag
                          e.stopPropagation();
                        }}
                        onClick={e => {
                          e.stopPropagation();
                        }}
                        className='w-full pr-4'
                        allowClear
                        autoFocus
                      />
                      <div className='absolute right-1 z-10 bg-[#1760B9] p-1 rounded-lg'>
                        <MagnifyingGlassIcon className='size-4 text-white' />
                      </div>
                    </div>
                  </div>
                )}
                {/* Options list */}
                <div className='custom-select-dropdown max-h-[300px] overflow-y-auto select-searchable-scrollbar'>{menu}</div>
              </>
            )}
            optionLabelProp='label'
            status={isError ? 'error' : ''}
            suffixIcon={<DropdownFilledIcon className='size-3 group-hover:text-[#003DA0] group-hover:rotate-180 transition-all duration-300' />}
          >
            {filteredOptions?.map((opt, index) => {
              const isSelected = isOptionSelected(opt.value);
              return (
                <Option key={opt.value} value={opt.value} label={opt.label}>
                  <div className={`${index > 0 && ''}`}>
                    <div className={`flex items-center rounded-md py-1 my-0.5 gap-x-2 responsive-text-sm font-normal text-neutral-07`}>
                      <CustomRadio checked={isSelected} />
                      {/* Avatar hoặc Icon */}
                      {opt.avatar && (
                        <div className='w-8 h-8 rounded-full overflow-hidden flex-shrink-0'>
                          <img
                            src={opt.avatar}
                            alt={opt.label}
                            className='w-full h-full object-cover'
                            onError={e => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      {opt.icon && !opt.avatar && <div className='w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0'>{opt.icon}</div>}
                      {/* Label */}
                      <span className='flex-1'>{opt.label}</span>
                    </div>
                  </div>
                </Option>
              );
            })}
          </Select>
        </div>
      </div>
      {isError && errMess && <label className='text-sm text-red-500'>{errMess}</label>}
    </div>
  );
};

export default SelectSearchableRadio;
