import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate'
import useFeature from '@/hooks/useConfigFeature'
import { formatMoment } from '@/utils/helpers/formatMoment'
import { Empty, Radio, Select } from 'antd'

const { Option } = Select

const SelectCustomLabel = ({
  dataLang,
  placeholder,
  options,
  value,
  onChange,
  allowClear = false,
  onClear,
  disabled = false,
  isError = false,
  formatNumber,
  renderOption = null,
  isVisibleLotDate = true,
  className = 'select-custom-label',
}) => {
  const { dataMaterialExpiry, dataProductSerial, dataProductExpiry } = useFeature()

  const RenderOption = ({ opt, isLabel }) => {
    return (
      <>
        {renderOption ? (
          renderOption(opt, isLabel)
        ) : (
          <div className={`text-[#1C252E] ${isLabel ? 'py-[3px]' : ''} `}>
            <h2 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] leading-normal font-semibold">
              {opt?.warehouse_name}
            </h2>
            <div className="flex gap-1">
              <h2 className="3xl:text-[11px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] leading-normal font-medium">
                Vị trí kho: {opt?.label}
              </h2>
            </div>
            {isVisibleLotDate && (
              <>
                <div className="flex gap-1">
                  <h2 className="3xl:text-[11px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] leading-normal font-medium">
                    {dataLang?.returns_survive || 'returns_survive'}: {formatNumber(opt?.qty)}
                  </h2>
                </div>

                <div className="flex flex-col gap-1 italic">
                  {dataProductSerial.is_enable === '1' && (
                    <div className="text-[8px] 2xl:text-[11px] text-[#667085] font-[500] leading-normal">
                      Serial: {opt?.serial ? opt?.serial : '-'}
                    </div>
                  )}
                  {dataMaterialExpiry.is_enable === '1' || dataProductExpiry.is_enable === '1' ? (
                    <div className="flex flex-col">
                      <div className="text-[8px] 2xl:text-[11px] text-[#667085] font-[500] leading-normal">
                        Lot: {opt?.lot ? opt?.lot : '-'}
                      </div>
                      <div className="text-[8px] 2xl:text-[11px] text-[#667085] font-[500] leading-normal">
                        Date: {opt?.date ? formatMoment(opt?.date, FORMAT_MOMENT.DATE_SLASH_LONG) : '-'}
                      </div>
                    </div>
                  ) : (
                    ''
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </>
    )
  }

  const valueCustom = value?.value
    ? {
        value: value.value,
        label: <RenderOption opt={value} isLabel={true} />,
      }
    : null

  const handleChange = (value) => {
    const newValue = options?.find((opt) => opt.value === value?.value)

    onChange(newValue)
  }

  return (
    <div className={`flex flex-col items-center justify-center h-full ${className} w-full`}>
      <Select
        className={`placeholder-secondary-color-text-disabled placeholder:responsive-text-sm cursor-pointer w-full ${className}`}
        placeholder={placeholder}
        allowClear={allowClear}
        value={valueCustom || null}
        onChange={handleChange}
        onClear={onClear}
        disabled={disabled}
        labelInValue
        notFoundContent={<Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có dữ liệu" />}
        status={isError ? 'error' : ''}
        styles={{
          popup: {
            root: {
              minWidth: 150,
            },
          },
        }}
      >
        {options?.map((opt, index) => {
          return (
            <Option key={opt.value} value={opt.value} label={opt?.warehouse_name || opt?.label}>
              <div
                className={`flex items-center py-2 gap-x-1 responsive-text-base ${
                  index !== options.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <Radio checked={value?.value === opt.value} />
                <RenderOption opt={opt} isLabel={false} />
              </div>
            </Option>
          )
        })}
      </Select>
    </div>
  )
}

export default SelectCustomLabel
