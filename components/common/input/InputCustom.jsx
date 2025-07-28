import useSetingServer from '@/hooks/useConfigNumber'
import useToast from '@/hooks/useToast'
import formatNumber from '@/utils/helpers/formatnumber'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FaMinus, FaPlus } from 'react-icons/fa'
import { twMerge } from 'tailwind-merge'

const InputCustom = ({
  state = 0,
  setState,
  className,
  classNameButton,
  classNameInput,
  min = 0,
  max = Infinity,
  disabled = false,
  isError = false,
  step = 1,
  allowDecimal = true,
  onChangeComplete = null,
}) => {
  const [inputValue, setInputValue] = useState(state || 0)
  const [formattedValue, setFormattedValue] = useState('')
  const showToast = useToast()
  const isUserTyping = useRef(false)
  const lastValue = useRef(state)
  const dataSeting = useSetingServer()

  useEffect(() => {
    if (!isUserTyping.current && state !== undefined) {
      setInputValue(state)
      // Định dạng số để hiển thị
      if (state?.toString().endsWith('.')) {
        setFormattedValue(state.toString())
      } else {
        setFormattedValue(formatNumber(state, dataSeting))
      }
      lastValue.current = state
    }
  }, [state, dataSeting])

  const parseToNumber = useCallback(
    (value) => {
      if (value === '' || value === '-' || value === null) return 0
      if (typeof value === 'number') {
        // Nếu là số, cũng giới hạn 2 chữ số sau dấu thập phân
        if (allowDecimal) {
          return Math.round(value * 100) / 100
        }
        return value
      }

      // Xử lý chuỗi đầu vào dựa vào allowDecimal
      if (allowDecimal) {
        // Cho phép nhập số thập phân - chỉ xử lý với dấu chấm
        const cleaned = value.toString().replace(/[^\d.]/g, '')

        // Giới hạn 2 chữ số sau dấu thập phân
        const parts = cleaned.split('.')
        if (parts.length === 2 && parts[1].length > 2) {
          const limitedValue = parts[0] + '.' + parts[1].substring(0, 2)
          const parsed = parseFloat(limitedValue)
          return isNaN(parsed) ? min : parsed
        }

        const parsed = parseFloat(cleaned)
        return isNaN(parsed) ? min : parsed
      } else {
        // Chỉ nhận số nguyên
        const cleaned = value.toString().replace(/\D/g, '')
        const parsed = parseInt(cleaned)
        return isNaN(parsed) ? min : parsed
      }
    },
    [allowDecimal, min]
  )

  const updateValue = useCallback(
    (newValue) => {
      // Kiểm tra giới hạn min/max
      if (min !== undefined && newValue < min) newValue = min
      if (max !== undefined && newValue > max) newValue = max

      // Cập nhật state và giá trị hiển thị
      setState(newValue)
      setInputValue(newValue)
      setFormattedValue(formatNumber(newValue, dataSeting))
      lastValue.current = newValue

      // Gọi callback nếu có
      if (onChangeComplete) {
        onChangeComplete(newValue)
      }
    },
    [min, max, setState, onChangeComplete, dataSeting]
  )

  const handleInputChange = useCallback(
    (e) => {
      if (disabled) return
      const value = e.target?.value
      isUserTyping.current = true

      if (value === '') {
        setInputValue('')
        setFormattedValue('')
        return
      }

      // Trường hợp đặc biệt: nếu giá trị hiện tại là số được định dạng và người dùng đang xóa ký tự
      // Chuyển về dạng không định dạng để dễ dàng chỉnh sửa
      if (value.length < formattedValue.length && formattedValue.includes(',')) {
        // Chuyển về dạng không định dạng
        const unformattedValue = inputValue.toString()
        setFormattedValue(unformattedValue)
        return
      }

      // Xử lý chuỗi đầu vào dựa vào allowDecimal
      let numericValue
      if (allowDecimal) {
        // Cho phép nhập số thập phân - Chỉ chấp nhận dấu chấm (.) làm dấu thập phân
        // Loại bỏ tất cả ký tự không phải số hoặc dấu chấm
        numericValue = value.replace(/[^\d.]/g, '')

        // Đảm bảo chỉ có một dấu chấm
        const countDecimal = (numericValue.match(/\./g) || []).length
        if (countDecimal > 1) {
          const lastIndex = numericValue.lastIndexOf('.')
          numericValue =
            numericValue.substring(0, lastIndex) +
            numericValue.charAt(lastIndex) +
            numericValue.substring(lastIndex + 1).replace(/\./g, '')
        }
      } else {
        // Chỉ nhận số nguyên
        numericValue = value.replace(/\D/g, '')
      }

      if (numericValue === '') {
        setInputValue('')
        setFormattedValue('')
        return
      }

      // Nếu đang nhập phần thập phân, giữ nguyên chuỗi để tiếp tục nhập
      if (numericValue.includes('.')) {
        // Giới hạn chỉ cho phép nhập tối đa 2 chữ số sau dấu chấm
        const parts = numericValue.split('.')
        if (parts.length === 2 && parts[1].length > 2) {
          // Nếu phần thập phân có nhiều hơn 2 chữ số, cắt bớt
          numericValue = parts[0] + '.' + parts[1].substring(0, 2)
        }

        setFormattedValue(numericValue)
        const parsedValue = parseFloat(numericValue)
        if (!isNaN(parsedValue)) {
          setInputValue(parsedValue)
        }
        return
      }

      // Chuyển đổi chuỗi thành số
      const numValue = allowDecimal ? parseFloat(numericValue) : parseInt(numericValue)

      if (numValue > max) {
        showToast('error', `Số lượng không được vượt quá ${formatNumber(max, dataSeting)}`)
        return
      }

      setInputValue(numValue)
      setFormattedValue(formatNumber(numValue, dataSeting))
    },
    [disabled, allowDecimal, max, showToast, dataSeting, formattedValue, inputValue]
  )

  const handleBlur = useCallback(() => {
    isUserTyping.current = false

    if (inputValue === '') {
      setState(min)
      setInputValue(min)
      setFormattedValue(formatNumber(min, dataSeting))
      return
    }

    let number = parseToNumber(inputValue)

    // Luôn làm tròn đến 2 chữ số thập phân khi mất focus
    if (allowDecimal) {
      number = Math.round(number * 100) / 100
    }

    if (number < min) {
      setState(min)
      setInputValue(min)
      setFormattedValue(formatNumber(min, dataSeting))
    } else if (number > max) {
      showToast('error', `Số lượng không được vượt quá ${formatNumber(max, dataSeting)}`)
      setState(max)
      setInputValue(max)
      setFormattedValue(formatNumber(max, dataSeting))
    } else {
      setState(number)
      setInputValue(number)
      setFormattedValue(formatNumber(number, dataSeting))
    }
  }, [inputValue, min, max, setState, showToast, parseToNumber, dataSeting, allowDecimal])

  const handleButtonClick = useCallback(
    (operation) => {
      if (disabled) return

      let current = parseToNumber(inputValue === '' ? min : inputValue)
      let result = current

      if (operation === 'increment') {
        result = parseFloat((current + Number(step)).toFixed(10))
        if (result > max) {
          showToast('error', `Giá trị không thể lớn hơn ${formatNumber(max, dataSeting)}`)
          return
        }
      } else {
        result = parseFloat((current - Number(step)).toFixed(10))
        if (result < min) {
          showToast('error', `Giá trị không thể nhỏ hơn ${formatNumber(min, dataSeting)}`)
          return
        }
      }

      if (!allowDecimal) {
        result = Math.floor(result)
      } else {
        // Giới hạn kết quả ở 2 chữ số thập phân
        result = Math.round(result * 100) / 100
      }

      setState(result)
      setInputValue(result)
      setFormattedValue(formatNumber(result, dataSeting))
    },
    [disabled, inputValue, min, step, max, allowDecimal, showToast, parseToNumber, setState, dataSeting]
  )

  return (
    <div
      className={twMerge(
        'p-2 flex items-center border rounded-full shadow-sm border-[#D0D5DD] focus:border-brand-color hover:border-brand-color w-fit h-fit overflow-hidden',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        className
      )}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div
        onClick={() => handleButtonClick('decrement')}
        onMouseDown={(e) => e.preventDefault()}
        className={twMerge(
          'size-9 rounded-full flex-shrink-0 cursor-pointer bg-primary-05 hover:bg-typo-blue-4/50 flex justify-center items-center flex-row',
          classNameButton
        )}
      >
        <FaMinus className="text-[#25387A] hover:text-green-1" size={11} />
      </div>
      <input
        disabled={disabled}
        type="text"
        value={formattedValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onMouseDown={(e) => e.stopPropagation()}
        className={twMerge(
          'w-20 text-center outline-none responsive-text-lg font-normal text-secondary-09 bg-transparent',
          isError && inputValue > 0 ? 'text-red-500' : '',
          classNameInput
        )}
      />
      <div
        onClick={() => handleButtonClick('increment')}
        onMouseDown={(e) => e.preventDefault()}
        className={twMerge(
          'size-9 rounded-full flex-shrink-0 cursor-pointer bg-primary-05 hover:bg-typo-blue-4/50 flex justify-center items-center flex-row',
          classNameButton
        )}
      >
        <FaPlus className="text-[#25387A] hover:text-green-1" size={10} />
      </div>
    </div>
  )
}

export default InputCustom
