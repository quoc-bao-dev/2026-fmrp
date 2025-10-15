import InfoFormLabel from '@/components/common/orderManagement/InfoFormLabel'
import DropdownFilledIcon from '@/components/icons/common/DropdownFilledIcon'
import { Empty, Select, Tag } from 'antd'
import { useRef, useState } from 'react'

const { Option } = Select

const CustomRadio = ({ checked }) => {
  return (
    <div className="relative flex items-center justify-center">
      <div
        className={`w-4 h-4 rounded-full border ${
          checked ? 'border-blue-color' : 'border-border-gray-1'
        } flex items-center justify-center`}
      >
        {checked && <div className="w-2 h-2 rounded-full bg-blue-color" />}
      </div>
    </div>
  )
}

const CustomCheckbox = ({ checked }) => {
  return (
    <div className="relative flex items-center justify-center">
      <div
        className={`w-4 h-4 rounded border ${
          checked ? 'border-blue-color bg-blue-color' : 'border-border-gray-1'
        } flex items-center justify-center`}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 1L3.5 6.5L1 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </div>
  )
}

const SelectSearchReport = ({
  isRequired = false,
  label,
  placeholder,
  options = [],
  value,
  onChange,
  onSearch,
  onClear,
  disabled,
  isError = false,
  errMess,
  icon,
  className,
  mode = 'single', // 'single' or 'multiple'
}) => {
  const [searchValue, setSearchValue] = useState('')
  const [open, setOpen] = useState(false)
  const inputRef = useRef(null)
  const selectRef = useRef(null)

  // Xử lý khi thay đổi giá trị tìm kiếm
  const handleSearch = (value) => {
    setSearchValue(value)
    onSearch && onSearch(value)
  }

  // Lọc options dựa trên searchValue để hiển thị
  const filteredOptions = searchValue 
    ? options?.filter(opt => 
        (opt?.label?.toLowerCase() ?? '').includes(searchValue.toLowerCase()) ||
        (opt?.code?.toLowerCase() ?? '').includes(searchValue.toLowerCase())
      ) 
    : options

  // Xử lý khi chọn giá trị
  const handleChange = (selectedValue) => {
    onChange && onChange(selectedValue)
    if (mode === 'single') {
      setOpen(false)
      setSearchValue('') // Reset search khi chọn xong
      // Blur input để bỏ focus
      setTimeout(() => {
        if (selectRef.current) {
          selectRef.current.blur()
        }
      }, 100)
    }
  }

  // Xử lý khi xóa giá trị
  const handleClear = () => {
    setSearchValue('')
    onClear && onClear()
  }

  // Xử lý khi dropdown đóng
  const handleDropdownVisibleChange = (visible) => {
    setOpen(visible)
    if (!visible) {
      setSearchValue('') // Reset search khi đóng dropdown
    }
  }

  // Tùy chỉnh hiển thị giá trị đã chọn
  const customTagRender = (props) => {
    const { label, closable, onClose } = props
    return (
      <Tag
        className="flex items-center bg-[#EBF2FF] text-[#003DA0] px-2 py-1 rounded-md ml-1 mr-0 whitespace-nowrap"
        closable={closable}
        onClose={onClose}
      >
        {label}
      </Tag>
    )
  }

  return (
    <div className={`group flex flex-col flex-wrap items-start gap-y-2 ${className}`}>
      {label && <InfoFormLabel isRequired={isRequired} label={label} />}

      <div className="h-[42px] relative flex select-with-radio w-full">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-[#7a7a7a]">{icon}</span>
        <Select
          ref={selectRef}
          className="placeholder-secondary-color-text-disabled !responsive-text-base placeholder:!responsive-text-base cursor-pointer select-with-radio w-full custom-select-no-bg"
          placeholder={placeholder}
          allowClear
          value={value}
          open={open}
          mode={mode === 'multiple' ? 'multiple' : undefined}
          onDropdownVisibleChange={handleDropdownVisibleChange}
          onChange={handleChange}
          onClear={handleClear}
          disabled={disabled}
          showSearch
          searchValue={searchValue}
          onSearch={handleSearch}
          filterOption={false} // Tắt filter mặc định vì đã tự xử lý
          notFoundContent={
            searchValue && (!filteredOptions || filteredOptions.length === 0) ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không tìm thấy kết quả" />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nhập để tìm kiếm" />
            )
          }
          tagRender={mode === 'multiple' ? customTagRender : undefined}
          maxTagCount={mode === 'multiple' ? 'responsive' : undefined}
          maxTagPlaceholder={(omittedValues) => `+${omittedValues.length} đã chọn`}
          menuItemSelectedIcon={null}
          optionLabelProp="label"
          status={isError ? 'error' : ''}
          suffixIcon={
            <DropdownFilledIcon className="size-3 group-hover:text-[#003DA0] group-hover:rotate-180 transition-all duration-300" />
          }
        >
          {filteredOptions?.map((opt, index) => {
            const isSelected =
              mode === 'multiple'
                ? Array.isArray(value) && value.some((item) => item.value === opt.value)
                : value?.value === opt.value

            return (
              <Option key={opt.value} value={opt.value} label={opt.label} className="ant-custom">
                <div className={`${index > 0 && 'border-t border-[#F7F8F9]'}`}>
                  <div className="flex items-center rounded-md p-2 my-0.5 gap-x-2">
                    {mode === 'multiple' ? (
                      <CustomCheckbox checked={isSelected} />
                    ) : (
                      <CustomRadio checked={isSelected} />
                    )}
                    <div className="flex flex-col gap-1">
                      <span className="responsive-text-sm font-normal text-neutral-07">{opt.label}</span>
                      <span className="text-blue-color flex flex-wrap responsive-text-xs">{opt.code}</span>
                    </div>
                  </div>
                </div>
              </Option>
            )
          })}
        </Select>
      </div>
      {isError && errMess && <label className="text-sm text-red-500">{errMess}</label>}
    </div>
  )
}

export default SelectSearchReport
