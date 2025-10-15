import { motion } from 'framer-motion'
import { createContext, forwardRef, useContext, useRef, useState } from 'react'
import { Customscrollbar } from './Customscrollbar'

// Tạo context để lưu trữ thông tin active tab
export const TabContext = createContext(null)

export const useTabContext = () => useContext(TabContext)

// Component tạo hiệu ứng gạch chân cho tab active
export const AnimatedTabUnderline = () => {
  const { activeTabInfo } = useTabContext() || {}
  const prevPositionRef = useRef(null)

  if (!activeTabInfo || activeTabInfo.left === undefined || activeTabInfo.width === undefined) {
    return null
  }

  // Lưu vị trí trước đó để animation có thể chạy từ vị trí cũ đến vị trí mới
  const from = prevPositionRef.current || { left: activeTabInfo.left, width: 0 }
  prevPositionRef.current = { left: activeTabInfo.left, width: activeTabInfo.width }

  return (
    <motion.div
      className="absolute bottom-0 h-[2px] bg-typo-blue-4 z-10"
      initial={{ left: from.left, width: from.width }}
      animate={{ left: activeTabInfo.left, width: activeTabInfo.width }}
      transition={{
        type: 'spring',
        stiffness: 500,
        damping: 30,
      }}
    />
  )
}

export const ContainerFilterTab = forwardRef(({ children, className }, ref) => {
  // Lưu trữ thông tin active tab
  const [activeTabInfo, setActiveTabInfo] = useState(null)

  return (
    <TabContext.Provider value={{ activeTabInfo, setActiveTabInfo }}>
      <div className="relative">
        <Customscrollbar
          forceVisible="x"
          ref={ref}
          className={`${className} overflow-x-auto h-fit demo4 simplebar-scrollable-x relative`}
          scrollableNodePropsClassName="[&>div]:flex [&>div]:items-center [&>div]:justify-start [&>div]:space-x-4 [&>div]:xl:space-x-4 h-fit"
        >
          {children}
          <hr className="!ml-0 absolute bottom-0 left-0 right-0 border-b border-t-0 border-border-gray-1 z-[-1]" />
        </Customscrollbar>
        <AnimatedTabUnderline />
      </div>
    </TabContext.Provider>
  )
})

export const Container = ({ children, className }) => {
  return (
    <div
      className={`xl:pt-[72px] pt-[60px] 3xl:px-6 2xl:px-4 xl:px-4 px-3 3xl:space-y-2 space-y-1 overflow-hidden h-screen ${className}`}
    >
      {children}
    </div>
  )
}

export const ContainerBody = ({ children }) => {
  return (
    <div className=" gap-1 3xl:h-[95%] h-[95%] overflow-hidden col-span-7 flex-col justify-between">
      <div className="h-[100%] flex flex-col justify-between overflow-hidden">
        {/* <div className="col-span-7 h-[100%] flex flex-col justify-between overflow-hidden"> */}
        {children}
      </div>
    </div>
  )
}

export const ContainerTotal = ({ children, className }) => {
  return <div className={`${className ? className : ''} grid grid-cols-12 bg-gray-100 items-center`}>{children}</div>
}
export const ContainerTable = ({ children }) => {
  return <div className="w-full h-full">{children}</div>
}

export const LayOutTableDynamic = ({
  head,
  breadcrumb,
  titleButton,
  fillterTab,
  table,
  pagination,
  showTotal = false,
  total,
}) => {
  return (
    <>
      {head}
      <Container>
        {breadcrumb}
        <ContainerBody>
          <div className="flex flex-col h-full overflow-hidden gap-y-3">
            <div className="flex justify-between mt-1 pr-1">{titleButton}</div>
            {fillterTab && (
              <div className="w-full h-fit">
                <ContainerFilterTab>{fillterTab}</ContainerFilterTab>
              </div>
            )}
            <div className="flex flex-col flex-1 min-h-0">
              <ContainerTable className="flex-1 min-h-0 overflow-hidden">{table}</ContainerTable>
            </div>
            {showTotal && <div className="w-full h-fit ">{total}</div>}
            <div className="w-full h-fit ">{pagination}</div>
          </div>
        </ContainerBody>
      </Container>
    </>
  )
}
