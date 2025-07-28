import { useEffect, useRef, useState } from 'react'

export const useAutoActiveTabWithUnderline = ({ tabs, activeTab, onAutoActive }) => {
  const [underlineProps, setUnderlineProps] = useState({ left: 0, width: 0 })
  const tabListRefs = useRef([])
  const didAutoActive = useRef(false)

  useEffect(() => {
    let tabToUse = activeTab

    // Auto set tab đầu tiên nếu chưa có
    if (!tabToUse && tabs.length > 0 && !didAutoActive.current) {
      tabToUse = tabs[0]
      onAutoActive?.(tabToUse)
      didAutoActive.current = true
    }

    // Cập nhật underline
    const activeIndex = tabs.findIndex((e) => e.id === tabToUse?.id)
    const activeTabElement = tabListRefs.current[activeIndex]

    if (activeTabElement) {
      const { offsetLeft, offsetWidth } = activeTabElement
      if (underlineProps.left !== offsetLeft || underlineProps.width !== offsetWidth) {
        setUnderlineProps({ left: offsetLeft, width: offsetWidth })
      }
    }
  }, [tabs, activeTab])

  return {
    underlineProps,
    tabListRefs,
  }
}
