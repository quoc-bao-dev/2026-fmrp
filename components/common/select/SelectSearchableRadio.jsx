import DropdownFilledIcon from '@/components/icons/common/DropdownFilledIcon';
import { MagnifyingGlassIcon } from '@/components/icons';
import { Empty, Select, Input } from 'antd';
import InfoFormLabel from '../orderManagement/InfoFormLabel';
import { useState, useMemo } from 'react';
import { earchWithoutDiacritics } from '@/utils/helpers/stringHelper';

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
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [open, setOpen] = useState(false);

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
    setOpen(false);
    setSearchValue(''); // Reset search khi chọn xong
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

  // Kiểm tra option có được chọn không
  const isOptionSelected = optValue => {
    if (!value) return false;
    return typeof value === 'object' ? value?.value === optValue : value === optValue;
  };

  return (
    <div className={`group flex flex-col flex-wrap items-start gap-y-2 ${className}`}>
      {/* {label && <InfoFormLabel isRequired={isRequired} label={label} />} */}

      <div className='w-full flex'>
        <div className='relative flex select-with-radio'>
          <span className='absolute left-3 top-1/2 -translate-y-1/2 z-10 text-[#7a7a7a]'>{icon}</span>
          <Select
            className='placeholder-secondary-color-text-disabled !responsive-text-base placeholder:!responsive-text-base cursor-pointer select-with-radio w-full custom-select-no-bg'
            placeholder={placeholder}
            allowClear
            value={typeof value === 'object' ? value?.value : value}
            // open={true}
            open={open}
            onOpenChange={handleDropdownVisibleChange}
            onChange={handleChange}
            onClear={handleClear}
            disabled={disabled}
            filterOption={false} // Tắt filter mặc định vì đã tự xử lý
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
                <h3 className='p-3 responsive-text-lg font-semibold'>{label}</h3>
                <div className='px-2 pb-2'>
                  <div className='relative flex items-center'>
                    <Input placeholder={searchPlaceholder} value={searchValue} onChange={handleSearch} className='w-full pr-4' allowClear />
                    <div className='absolute right-1 z-10 bg-[#1760B9] p-1 rounded-lg'>
                      <MagnifyingGlassIcon className='size-4 text-white' />
                    </div>
                  </div>
                </div>
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
