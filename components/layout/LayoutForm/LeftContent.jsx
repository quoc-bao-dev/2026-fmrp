import React from 'react'

const LeftContent = ({ children, className = '' }) => {
  return (
    <div className={`w-full xl:w-[calc(75%-16px)] 2xl:w-[calc(75%-24px)] flex flex-col gap-6 bg-white border border-gray-200 shadow-sm rounded-2xl py-6 px-4 ${className}`}>
      {children}
    </div>
  )
}

export default LeftContent 