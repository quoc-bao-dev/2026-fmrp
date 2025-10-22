import React, { useState, useEffect } from 'react'
import SearchIcon from '@/components/icons/common/SearchIcon'
import CloseXIcon from '@/components/icons/common/CloseXIcon'
import { motion, AnimatePresence } from 'framer-motion'

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
}) => {
  const [isActive, setIsActive] = useState(false)
  const [inputValue, setInputValue] = useState(value || '')

  // Sync với value prop nếu có
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value)
    }
  }, [value])

  const handleBoxClick = () => {
    setIsActive(!isActive)
  }

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
    onChange && onChange(e)
  }

  const handleClearInput = () => {
    setInputValue('')
    onChange && onChange({ target: { value: '' } })
  }

  // Đóng search khi click ra ngoài
  useEffect(() => {
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
  }, [isActive])

  return (
    <div
      className={`search-component py-1.5 px-2 3xl:py-1.5 3xl:px-2 border bg-white border-border-gray-1 hover:border-new-blue transition-all duration-300 ease-in-out rounded-lg cursor-pointer flex-shrink-0 ${classNameBox} ${
        isActive ? 'border-[#003DA0] shadow-sm' : ''
      }`}
      style={{ height: '42px', minHeight: '42px' }}
    >
      <form className="flex items-center gap-2 h-full">
        <AnimatePresence mode="wait">
          {isActive && (
            <motion.div 
              className="flex items-center h-full"
              initial={{ width: 0, opacity: 0, x: -10 }}
              animate={{ 
                width: 'auto', 
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
                className={`${classInput} min-w-[180px] 2xl:min-w-[210px] relative placeholder:text-neutral-05 bg-transparent border-none outline-none focus:outline-none focus:ring-0 responsive-text-base`}
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
                    className="size-4 text-[#9295A4] hover:text-[#344054] focus:outline-none ml-1"
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
          className={`transition-all duration-300 ease-in-out ${
            isActive ? 'p-1 rounded-lg bg-[#003DA0]' : 'p-0'
          }`}
          onClick={handleBoxClick}
          style={{ height: 'fit-content' }}
        >
          <SearchIcon
            size={sizeIcon}
            color={`${isActive ? 'white' : '#9295A4'}`}
            className={`${classNameIcon} flex-shrink-0 transition-colors duration-300`}
          />
        </div>
      </form>
    </div>
  )
}

export default SearchComponent
