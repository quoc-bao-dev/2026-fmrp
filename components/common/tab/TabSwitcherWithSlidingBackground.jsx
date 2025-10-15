import React from 'react'
import { motion } from 'framer-motion'
import { useAutoActiveTabWithUnderline } from '@/hooks/custom/tab/useAutoActiveTabWithUnderline'

const TabSwitcherWithSlidingBackground = ({ className = '', tabs = [], activeTab, onChange }) => {
  const { underlineProps, tabListRefs } = useAutoActiveTabWithUnderline({
    tabs,
    activeTab,
    onAutoActive: onChange,
  })

  return (
    <div className={`relative flex bg-[#C7DFFB] p-1 rounded-xl w-fit overflow-hidden ${className}`}>
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          ref={(el) => (tabListRefs.current[index] = el)}
          onClick={() => onChange(tab)}
          className={`relative z-10 px-8 py-2.5 3xl:text-base text-sm-default font-medium transition-all duration-300`}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <span className={activeTab?.id === tab.id ? 'text-white' : 'text-[#11315B]'}>{tab.name}</span>
        </button>
      ))}

      {activeTab && underlineProps.left != null && underlineProps.width != null && (
        <motion.div
          className="absolute top-1 bottom-1 bg-[#0375F3] rounded-[10px] z-0"
          animate={{
            left: underlineProps.left,
            width: underlineProps.width,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </div>
  )
}

export default TabSwitcherWithSlidingBackground
