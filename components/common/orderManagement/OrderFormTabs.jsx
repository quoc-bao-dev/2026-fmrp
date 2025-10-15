import { motion } from 'framer-motion'
import { useState } from 'react'

// Tab items
const tabItems = [
  {
    key: 'info',
    label: 'Thông tin chung',
  },
  {
    key: 'note',
    label: 'Ghi chú',
  },
]
const OrderFormTabs = ({ info, note }) => {
  const [activeTab, setActiveTab] = useState('info')

  return (
    <div className="w-full">
      {/* Tab header */}
      <div className="w-full flex items-center space-x-2 bg-blue-100 p-1 mb-6 rounded-xl relative">
        {tabItems.map((tab) => (
          <div className="w-full relative" key={tab.key}>
            {activeTab === tab.key && (
              <motion.div
                layoutId="active-tab-bg"
                className="absolute inset-0 bg-blue-color rounded-lg"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <button
              onClick={() => setActiveTab(tab.key)}
              className={`relative w-full py-2 responsive-text-sm font-medium rounded-lg z-10 transition-all duration-300 ${
                activeTab === tab.key ? 'text-white' : 'text-[#11315B]'
              } `}
            >
              <span className="lg:px-1">{tab.label}</span>
            </button>
          </div>
        ))}
      </div>
      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'info' && info}
        {activeTab === 'note' && note}
      </div>
    </div>
  )
}

export default OrderFormTabs
