import { Empty, Radio, Select } from 'antd'

const { Option } = Select

const SelectWithSort = ({
  title,
  placeholderText,
  options,
  value,
  onChange,
  onClear,
  disabled,
  isError = false,
  className = 'select-with-sort w-full',
}) => {
  return (
    <Select
      className={`w-full truncate placeholder-secondary-color-text-disabled placeholder:responsive-text-sm cursor-pointer ${className}`}
      showSearch
      placeholder={placeholderText}
      allowClear
      value={value}
      onChange={onChange}
      onClear={onClear}
      disabled={disabled}
      filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
      notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có dữ liệu" />}
      popupRender={(menu) => (
        <>
          <div className="px-3 responsive-text-lg font-semibold font-deca py-4">{title}</div>
          <div>{menu}</div>
        </>
      )}
      optionLabelProp="label"
      status={isError ? 'error' : ''}
    >
      {options?.map((opt, index) => (
        <Option key={opt.value} value={opt.value} label={opt.label}>
          <div
            className={`flex items-center py-2 gap-x-2 responsive-text-base ${
              index !== options.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            <Radio checked={value === opt.value} />
            {opt.label}
          </div>
        </Option>
      ))}
    </Select>
  )
}

export default SelectWithSort
