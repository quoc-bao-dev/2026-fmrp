import CalendarBlankIcon from '@/components/icons/common/CalendarBlankIcon'
import DropdownFilledIcon from '@/components/icons/common/DropdownFilledIcon'
import styleDatePickerReport from '@/configs/configDatePickerReport'
import { useEffect, useState } from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import Datepicker from 'react-tailwindcss-datepicker'
import { IoClose } from 'react-icons/io5'

const DateToDateReport = ({ placeholder, value, onChange, className }) => {
  const [dateValue, setDateValue] = useState(
    value || {
      startDate: undefined,
      endDate: undefined,
    }
  )

  // Thiết lập giá trị mặc định khi component được tạo
  useEffect(() => {
    // Nếu không có giá trị được truyền vào từ props, sử dụng giá trị mặc định
    if (!value) {
      const defaultValue = {
        startDate: undefined,
        endDate: undefined,
      }
      setDateValue(defaultValue)
      if (onChange) {
        onChange(defaultValue)
      }
    }
  }, [])

  useEffect(() => {
    if (value) {
      setDateValue(value)
    }
  }, [value])

  const handleValueChange = (newValue) => {
    setDateValue(newValue)
    if (onChange) {
      onChange(newValue)
    }
  }

  // Xác định nếu có ngày được chọn
  const hasSelectedDates =
    dateValue?.startDate !== undefined &&
    dateValue?.startDate !== null &&
    dateValue?.endDate !== undefined &&
    dateValue?.endDate !== null

  // Hàm xử lý sự kiện xóa date range
  const handleClearDates = (e) => {
    e.stopPropagation()
    const clearedValue = {
      startDate: null,
      endDate: null,
    }
    setDateValue(clearedValue)
    if (onChange) {
      onChange(clearedValue)
    }
  }

  return (
    <div
      id="parentDatepicker"
      className={`z-50 flex items-center parentDatepicker rounded-lg bg-white border border-border-gray-1 group hover:border-new-blue cursor-pointer transition-all duration-300 ease-in-out relative ${
        hasSelectedDates ? 'w-auto' : 'w-[150px]'
      } ${className}`}
    >
      <CalendarBlankIcon size={17} color="#9295A4" className="absolute left-3 top-1/2 -translate-y-1/2 z-10" />
      <Datepicker
        {...styleDatePickerReport}
        value={dateValue}
        onChange={handleValueChange}
        placeholder={placeholder || 'Giai đoạn'}
        toggleClassName="hidden"
        containerClassName="px-[2px] w-full"
        displayFormat="DD/MM/YYYY"
        asSingle={false}
        useRange={true}
      />
      {hasSelectedDates && (
        <div
          className="absolute right-2 top-1/2 -translate-y-1/2 z-[11] cursor-pointer bg-gray-100 rounded-full p-0.5"
          onClick={handleClearDates}
        >
          <IoClose size={16} className="text-neutral-07" />
        </div>
      )}
      <DropdownFilledIcon className="absolute right-3 top-1/2 -translate-y-1/2 z-10 group-hover:text-new-blue group-hover:rotate-180 transition-all duration-300 ease-in-out" />
    </div>
  )
}

export default DateToDateReport
