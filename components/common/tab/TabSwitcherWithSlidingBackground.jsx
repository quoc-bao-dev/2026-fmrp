import React from 'react';
import { motion } from 'framer-motion';
import { useAutoActiveTabWithUnderline } from '@/hooks/custom/tab/useAutoActiveTabWithUnderline';

const TabSwitcherWithSlidingBackground = ({ buttonClassName = '', className = '', buttonActiveClassName = '', tabs = [], activeTab, onChange }) => {
  const { underlineProps, tabListRefs } = useAutoActiveTabWithUnderline({
    tabs,
    activeTab,
    onAutoActive: onChange,
  });

  return (
    <div className={`relative flex bg-[#C7DFFB] p-1.5 rounded-xl w-fit overflow-hidden ${className}`}>
      {tabs.map((tab, index) => {
        const tagLabel = typeof tab.tag === 'string' ? tab.tag : tab.tag?.label;
        const tagClassName = typeof tab.tag === 'object' ? tab.tag?.className || '' : '';

        return (
          <button
            key={tab.id}
            ref={el => (tabListRefs.current[index] = el)}
            onClick={() => onChange(tab)}
            className={`relative z-10 px-8 py-2 3xl:text-base text-sm-default font-medium transition-all duration-300 ${buttonClassName}`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <span className={activeTab?.id === tab.id ? 'text-white' : 'text-[#11315B]'}>{tab.name}</span>

            {tagLabel && (
              <span
                className={`pointer-events-none absolute -top-2 -right-2 rounded-full px-2 py-0.5 text-[10px] font-semibold leading-none text-white bg-[#f97a4c]`}
                style={{
                  boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
                }}
              >
                {tagLabel}
              </span>
            )}
          </button>
        );
      })}

      {activeTab && underlineProps.left != null && underlineProps.width != null && (
        <motion.div
          className={`absolute top-1.5 bottom-1.5 bg-[#0375F3] rounded-[10px] z-0 ${buttonActiveClassName}`}
          animate={{
            left: underlineProps.left,
            width: underlineProps.width,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </div>
  );
};

export default TabSwitcherWithSlidingBackground;
