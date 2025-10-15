import React, { useState } from 'react'
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
}) => {
  const [isActive, setIsActive] = useState(false)
  const [inputValue, setInputValue] = useState('')

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

  return (
    <div
      className={`py-1.5 px-2 3xl:py-1.5 3xl:px-2 border bg-white border-border-gray-1 hover:border-new-blue transition-all duration-300 ease-in-out rounded-lg cursor-pointer flex-shrink-0 ${classNameBox}`}
    >
      <form className="flex items-center gap-2">
        <AnimatePresence>
          {isActive && (
            <motion.div className="flex items-center">
              <motion.input
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className={`${classInput} min-w-[180px] 2xl:min-w-[210px] relative placeholder:text-neutral-05 bg-transparent border-none outline-none focus:outline-none focus:ring-0 responsive-text-base`}
                type="text"
                onChange={handleInputChange}
                value={inputValue}
                placeholder={placeholder || 'Tìm kiếm...'}
                autoFocus={isActive}
              />
              {inputValue && (
                <button
                  type="button"
                  onClick={handleClearInput}
                  className="size-4 text-[#9295A4] hover:text-[#344054] focus:outline-none"
                >
                  <CloseXIcon className="size-full" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          whileTap={{ scale: 0.9 }}
          className={`${isActive ? 'p-1 rounded-lg bg-[#003DA0]' : ''}`}
          onClick={handleBoxClick}
        >
          <SearchIcon
            size={isActive ? sizeIcon - 8 : sizeIcon}
            color={`${isActive ? 'white' : '#9295A4'}`}
            className={`${classNameIcon} flex-shrink-0`}
          />
        </motion.div>
      </form>
    </div>
  )
}

export default SearchComponent
