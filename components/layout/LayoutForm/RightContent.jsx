import React from 'react'

const RightContent = ({ children, className = '' }) => {
  return (
    <div className={`w-full lg:w-1/4 h-fit flex flex-col gap-6 ${className}`}>
      {children}
    </div>
  )
}

export default RightContent 