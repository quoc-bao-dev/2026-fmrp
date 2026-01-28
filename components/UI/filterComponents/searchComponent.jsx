import React, { useState, useEffect } from 'react'
import CloseXIcon from '@/components/icons/common/CloseXIcon'
import { motion, AnimatePresence } from 'framer-motion'
import { SearchIcon } from '@/components/icons'

const SearchComponent = ({
  placeholder,
  onChange,
  dataLang,
  colSpan,
  classInput,
  classNameBox,
  classNameIcon,
  sizeIcon = 24,
  value,
  alwaysOpen = false,
  openWidth, // string | number, ví dụ: "300px" hoặc 300
}) => {
  const [isActive, setIsActive] = useState(alwaysOpen)
  const [inputValue, setInputValue] = useState(value || '')

  const resolvedOpenWidth =
    typeof openWidth === 'number' ? `${openWidth}px` : openWidth

  // Sync với value prop nếu có
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value)
    }
  }, [value])

  // Sync với alwaysOpen prop
  useEffect(() => {
    if (alwaysOpen) {
      setIsActive(true)
    }
  }, [alwaysOpen])

  const handleBoxClick = () => {
    if (!alwaysOpen) {
      setIsActive(!isActive)
    }
  }

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
    onChange && onChange(e)
  }

  const handleClearInput = () => {
    setInputValue('')
    onChange && onChange({ target: { value: '' } })
  }

  // Đóng search khi click ra ngoài (chỉ khi không phải alwaysOpen)
  useEffect(() => {
    if (alwaysOpen) return

    const handleClickOutside = (event) => {
      if (isActive && !event.target.closest('.search-component')) {
        setIsActive(false)
      }
    }

    if (isActive) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isActive, alwaysOpen])

  return (
    <div
      className={`search-component py-1.5 px-2 3xl:py-1.5 3xl:px-2 border bg-white border-border-gray-1 hover:border-new-blue transition-all duration-300 ease-in-out rounded-lg cursor-pointer flex-shrink-0 ${classNameBox} ${
        isActive ? 'border-[#003DA0] shadow-sm' : ''
      }`}
      style={{ height: '42px', minHeight: '42px' }}
    >
      <form className="flex items-center gap-2 h-full w-full">
        <AnimatePresence mode="wait">
          {isActive && (
            <motion.div 
              className="flex items-center h-full min-w-0 overflow-hidden"
              initial={{ width: 0, opacity: 0, x: -10 }}
              animate={{ 
                width: resolvedOpenWidth || 'auto',
                opacity: 1, 
                x: 0,
                transition: {
                  width: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                  opacity: { duration: 0.2, delay: 0.1 },
                  x: { duration: 0.2, delay: 0.1 }
                }
              }}
              exit={{ 
                width: 0, 
                opacity: 0, 
                x: -10,
                transition: {
                  width: { duration: 0.2, delay: 0.1 },
                  opacity: { duration: 0.15 },
                  x: { duration: 0.15 }
                }
              }}
            >
              <motion.input
                className={`${classInput} w-full min-w-0 relative placeholder:text-neutral-05 bg-transparent border-none outline-none focus:outline-none focus:ring-0 responsive-text-base`}
                type="text"
                onChange={handleInputChange}
                value={inputValue}
                placeholder={placeholder || 'Tìm kiếm...'}
                autoFocus={isActive}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.2 }}
              />
              <AnimatePresence>
                {inputValue && (
                  <motion.button
                    type="button"
                    onClick={handleClearInput}
                    className="size-4 text-[#9295A4] hover:text-[#344054] focus:outline-none ml-1 flex-shrink-0"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <CloseXIcon className="size-full" />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
        <div
          className={`transition-all duration-300 ease-in-out flex-shrink-0 ${
            isActive ? 'p-1 rounded-lg bg-[#003DA0]' : 'p-0'
          }`}
          onClick={handleBoxClick}
          style={{ height: 'fit-content' }}
        >
          <SearchIcon
            size={sizeIcon}
            color={`${isActive ? 'white' : '#9295A4'}`}
            className={`${classNameIcon} size-6 flex-shrink-0 transition-colors duration-300`}
          />
        </div>
      </form>
    </div>
  )
}

export default SearchComponent
