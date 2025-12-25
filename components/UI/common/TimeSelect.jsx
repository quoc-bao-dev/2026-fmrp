import React, { useRef, useEffect, useState } from 'react'
import { Customscrollbar } from '@/components/UI/common/Customscrollbar'
import { FaCheck } from 'react-icons/fa'

/**
 * Component dropdown chọn giờ hoặc phút (Custom UI)
 * @param {Object} props
 * @param {string} props.value - Giá trị hiện tại (string hoặc number)
 * @param {Function} props.onChange - Callback khi thay đổi giá trị: (value: string) => void
 * @param {'hour' | 'minute'} props.type - Loại: 'hour' (0-23) hoặc 'minute' (0-59)
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.disabled - Disable state
 * @param {string} props.className - Custom className
 * @param {Object} props.error - Error state từ react-hook-form
 * @param {string} props.label - Label text (ví dụ: "giờ", "phút")
 */
const TimeSelect = ({ value, onChange, type = 'hour', placeholder, disabled = false, className = '', error, label }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [inputValue, setInputValue] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const containerRef = useRef(null)
  const dropdownRef = useRef(null)
  const selectedOptionRef = useRef(null)
  const inputRef = useRef(null)

  // Tạo options dựa trên type
  const options = React.useMemo(() => {
    if (type === 'hour') {
      // Giờ: 0-23
      return Array.from({ length: 24 }, (_, i) => ({
        value: String(i).padStart(2, '0'),
        label: String(i).padStart(2, '0'),
      }))
    } else {
      // Phút: 0-59
      return Array.from({ length: 60 }, (_, i) => ({
        value: String(i).padStart(2, '0'),
        label: String(i).padStart(2, '0'),
      }))
    }
  }, [type])

  // Filter options dựa trên search term
  const filteredOptions = React.useMemo(() => {
    if (!searchTerm) return options
    return options.filter(option => option.label.includes(searchTerm))
  }, [options, searchTerm])

  // Convert value sang format string (padStart 2 digits)
  const selectedValue = React.useMemo(() => {
    if (value === null || value === undefined || value === '') return null
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value
    if (isNaN(numValue)) return null
    return String(numValue).padStart(2, '0')
  }, [value])

  // Tìm option đang được chọn
  const selectedOption = React.useMemo(() => {
    if (!selectedValue) return null
    return options.find(opt => opt.value === selectedValue)
  }, [options, selectedValue])

  // Sync inputValue với selectedValue khi không focus
  useEffect(() => {
    if (!isFocused) {
      setInputValue(selectedValue || '')
    }
  }, [selectedValue, isFocused])

  // Validate và format input
  const validateAndFormat = (inputVal) => {
    // Chỉ cho phép số
    const numericValue = inputVal.replace(/[^0-9]/g, '')
    
    if (!numericValue) return ''

    const num = parseInt(numericValue, 10)
    const maxValue = type === 'hour' ? 23 : 59

    // Giới hạn giá trị
    if (num > maxValue) {
      return String(maxValue).padStart(2, '0')
    }

    return numericValue
  }

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value
    const formatted = validateAndFormat(newValue)
    setInputValue(formatted)
    
    // Update value ngay khi nhập (nếu hợp lệ)
    if (formatted && onChange) {
      const numValue = parseInt(formatted, 10)
      if (!isNaN(numValue)) {
        const maxValue = type === 'hour' ? 23 : 59
        if (numValue <= maxValue) {
          onChange(String(numValue).padStart(2, '0'))
        }
      }
    } else if (!formatted && onChange) {
      // Nếu xóa hết, set về empty
      onChange('')
    }
  }

  // Handle input blur - format lại giá trị
  const handleInputBlur = () => {
    setIsFocused(false)
    if (inputValue) {
      const numValue = parseInt(inputValue, 10)
      if (!isNaN(numValue)) {
        const maxValue = type === 'hour' ? 23 : 59
        const finalValue = numValue > maxValue ? maxValue : numValue
        const formatted = String(finalValue).padStart(2, '0')
        setInputValue(formatted)
        if (onChange) {
          onChange(formatted)
        }
      }
    } else {
      // Nếu empty, giữ nguyên giá trị cũ hoặc set về placeholder
      setInputValue(selectedValue || '')
    }
  }

  // Handle input focus
  const handleInputFocus = () => {
    setIsFocused(true)
    setIsOpen(true)
    // Select all text khi focus
    if (inputRef.current) {
      inputRef.current.select()
    }
  }

  // Handle change - trả về string value để tương thích với react-hook-form
  const handleSelect = option => {
    if (onChange && !disabled) {
      onChange(option.value)
      setIsOpen(false)
      setSearchTerm('')
    }
  }

  // Click outside để đóng dropdown
  useEffect(() => {
    const handleClickOutside = event => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Scroll đến option đang được chọn khi mở dropdown
  useEffect(() => {
    if (isOpen && selectedOptionRef.current && dropdownRef.current) {
      setTimeout(() => {
        if (selectedOptionRef.current) {
          selectedOptionRef.current.scrollIntoView({
            behavior: 'instant',
            block: 'center',
          })
        }
      }, 50)
    }
  }, [isOpen, selectedOption])

  // Tính toán vị trí dropdown
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 })

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      })
    }
  }, [isOpen])

  const displayValue = isFocused ? inputValue : (selectedValue || placeholder || (type === 'hour' ? '00' : '00'))
  const hasValue = selectedValue || isFocused

  return (
    <div className={`flex-1 flex flex-col gap-1 ${className}`}>
      <div className='flex items-center gap-2 relative' ref={containerRef}>
        {/* Input field */}
        <div className='flex-1 relative w-[50px]'>
          <div
            className={`w-full px-3 py-2 rounded-[10px] border-none transition-all flex items-center ${
              disabled ? 'bg-gray-100 cursor-not-allowed opacity-50' : 'bg-[#F6F8FA]'
            } ${error ? 'ring-1 ring-[#EE1E1E]' : ''}`}
          >
            <input
              ref={inputRef}
              type='text'
              value={displayValue}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder={placeholder || (type === 'hour' ? '00' : '00')}
              disabled={disabled}
              maxLength={2}
              className={`flex-1 !w-[20px] text-sm bg-transparent border-none outline-none ${
                hasValue ? 'text-[#141522] font-medium' : 'text-[#9295A4]'
              }`}
              onClick={e => {
                e.stopPropagation()
                if (!disabled) {
                  inputRef.current?.focus()
                }
              }}
            />
             {label && <span className='text-sm text-[#9295A4] whitespace-nowrap'>{label}</span>}
          </div>

          {/* Dropdown menu */}
          {isOpen && !disabled && (
            <div
              ref={dropdownRef}
              className='absolute z-[9999] py-2  bg-white border border-[#D0D5DD] rounded-lg shadow-lg mt-1'
              style={{
                top: '100%',
                left: 0,
                width: '100%',
                maxHeight: '200px',
                minHeight: '200px',
              }}
            >
              {/* Options list */}
              <Customscrollbar className='max-h-[190px]' alwaysShowScrollbar={true}>
                <div className='py-1'>
                  {filteredOptions.length > 0 ? (
                    filteredOptions.map(option => {
                      const isSelected = selectedOption && selectedOption.value === option.value
                      return (
                        <div
                          key={option.value}
                          ref={isSelected ? selectedOptionRef : null}
                          onClick={e => {
                            e.stopPropagation()
                            handleSelect(option)
                          }}
                          className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-blue-50 text-[#003DA0] font-medium'
                              : 'text-[#141522] hover:bg-gray-50'
                          }`}
                        >
                          <span>{option.label}</span>
                          {isSelected && <FaCheck className='w-3 h-3 text-[#003DA0]' />}
                        </div>
                      )
                    })
                  ) : (
                    <div className='px-3 py-2 text-sm text-gray-400 text-center'>Không tìm thấy</div>
                  )}
                </div>
              </Customscrollbar>
            </div>
          )}
        </div>
       
      </div>
      {error && <span className='text-xs text-[#EE1E1E]'>{error.message}</span>}
    </div>
  )
}

export default TimeSelect
