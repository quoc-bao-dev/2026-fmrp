import { Empty } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import { CiSearch } from 'react-icons/ci'
import CheckboxDefault from '../checkbox/CheckboxDefault'

const SelectSearch = ({ options, onChange, value = [], formatOptionLabel, placeholder, setSearch }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const containerRef = useRef(null)
  const menuRef = useRef(null)
  const inputRef = useRef(null)

  const filteredOptions = options;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e) => {
    const value = e.target.value
    setSearchText(value)
    setSearch && setSearch(value)
  }

  const handleSelect = (option) => {
    if (!value) {
      onChange([option])
    } else {
      const isSelected = value.some((item) => item.value === option.value)
      if (isSelected) {
        onChange(value.filter((item) => item.value !== option.value))
      } else {
        onChange([...value, option])
      }
    }
  }

  const handleSelectAll = () => {
    const allSelected = options.every(opt => value.some(item => item.value === opt.value));
    if (allSelected) {
      // Bỏ chọn tất cả: chỉ bỏ các option đang hiển thị (theo search/options), giữ lại các phần tử đã chọn trước đó không nằm trong options hiện tại
      const remain = value.filter(item => !options.some(opt => opt.value === item.value));
      onChange(remain);
    } else {
      // Chọn tất cả: push các option mới vào đầu value cũ (không trùng lặp)
      const newOptions = options.filter(opt => !value.some(item => item.value === opt.value));
      onChange([...newOptions, ...value]);
    }
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      <div
        className={`flex flex-wrap items-center gap-1 min-h-[40px] px-3 py-1 bg-white cursor-pointer rounded-lg transition-all duration-300 ${
          isFocused ? 'border border-[#003DA0]' : 'border border-[#d9d9d9]'
        }`}
        onClick={() => {
          setIsOpen(true)
          setIsFocused(true)
          setTimeout(() => inputRef.current?.focus(), 0)
        }}
      >
        <input
          ref={inputRef}
          type="text"
          className="flex-grow outline-none min-w-[50px] text-sm placeholder:text-slate-300"
          placeholder={placeholder}
          value={searchText}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => !isOpen && setIsFocused(false)}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#1760B9] p-1 rounded-lg">
          <CiSearch className="text-white responsive-text-lg" />
        </div>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white border rounded-lg shadow-[0_20px_40px_-4px_#919EAB3D,0_0_2_0_#919EAB3D] z-50">
          <div className="2xl:p-6 p-5 pl-4 flex items-center justify-between gap-4 border-b">
            <CheckboxDefault
              label={'Chọn mặt hàng'}
              checked={options.every(opt => value.some(item => item.value === opt.value))}
              onChange={handleSelectAll}
            />
            <p className="responsive-text-sm font-normal text-blue-color">{value.length} đã chọn</p>
          </div>

          <div
            ref={menuRef}
            className="max-h-[400px] overflow-y-auto"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <div className="p-1 flex flex-col gap-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <React.Fragment key={option.value}>
                    {index > 0 && <hr className="border-[#F3F3F4]" />}
                    <div
                      className="flex items-center px-3 2xl:px-5 py-2 hover:bg-[#0000000A] rounded-lg cursor-pointer"
                      onClick={() => handleSelect(option)}
                    >
                      <div className="mr-2">
                        <CheckboxDefault
                          checked={value.some((item) => item.value === option.value)}
                          onChange={() => handleSelect(option)}
                          onClick={e => e.stopPropagation()}
                        />
                      </div>
                      <div className="flex-grow">
                        {formatOptionLabel ? formatOptionLabel(option) : <div className="text-sm">{option.label}</div>}
                      </div>
                    </div>
                  </React.Fragment>
                ))
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có dữ liệu" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SelectSearch
