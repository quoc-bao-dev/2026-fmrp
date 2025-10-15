import React, { useRef, useState, useEffect } from 'react'
import { Customscrollbar } from '@/components/UI/common/Customscrollbar'
import { ColumnTable } from '@/components/UI/common/Table'
import Loading from '@/components/UI/loading/loading'
import NoData from '@/components/UI/noData/nodata'

const TableSection = ({
  fixedColumns = [],
  scrollableColumns = [],
  groupedHeaders = null, // New prop for grouped headers
  data = [],
  renderFixedRow,
  renderScrollableRow,
  renderFooter,
  isFetching,
}) => {
  const scrollbarRef = useRef(null)
  const headerScrollRef = useRef(null)
  const footerScrollRef = useRef(null)
  const [isScrolled, setIsScrolled] = useState(false)

  // Check initial scroll position when component mounts
  useEffect(() => {
    const checkInitialScroll = () => {
      if (scrollbarRef.current) {
        try {
          const scrollableEl = scrollbarRef.current.getScrollElement
            ? scrollbarRef.current.getScrollElement()
            : scrollbarRef.current.querySelector('.simplebar-content-wrapper')

          if (scrollableEl && scrollableEl.scrollLeft > 5) {
            setIsScrolled(true)
          }
        } catch (error) {
          console.error('Error accessing scroll element:', error)
        }
      }
    }

    setTimeout(checkInitialScroll, 10)
  }, [])

  // Helper function to get the scrollable element from Customscrollbar
  const getScrollableContentElement = () => {
    if (!scrollbarRef.current) return null

    try {
      // Try to get the scrollable element using the component's method if available
      if (typeof scrollbarRef.current.getScrollElement === 'function') {
        return scrollbarRef.current.getScrollElement()
      }

      // Otherwise try to find it in the DOM structure
      const simplebarEl = scrollbarRef.current.querySelector('.simplebar-content-wrapper')
      if (simplebarEl) return simplebarEl

      // If using a different scrollbar implementation or direct ref to a div
      return scrollbarRef.current
    } catch (error) {
      console.error('Error getting scrollable element:', error)
      return null
    }
  }

  // Unified scroll handler for all scrollable elements
  const handleSyncScroll = (e, sourceType) => {
    try {
      const scrollElement = e.target
      if (scrollElement && typeof scrollElement.scrollLeft === 'number') {
        const scrollLeft = scrollElement.scrollLeft

        // Sync all other elements based on which element triggered the scroll
        if (sourceType !== 'content') {
          // If header or footer triggered the scroll, sync content
          const contentScrollable = getScrollableContentElement()
          if (contentScrollable) {
            contentScrollable.scrollLeft = scrollLeft
          }
        }

        if (sourceType !== 'header' && headerScrollRef.current) {
          // If content or footer triggered the scroll, sync header
          headerScrollRef.current.scrollLeft = scrollLeft
        }

        if (sourceType !== 'footer' && footerScrollRef.current) {
          // If content or header triggered the scroll, sync footer
          footerScrollRef.current.scrollLeft = scrollLeft
        }

        // Update shadow effect
        if (scrollLeft > 5) {
          setIsScrolled(true)
        } else {
          setIsScrolled(false)
        }
      }
    } catch (error) {
      console.error('Error in scroll handler:', error)
    }
  }

  // Specific handlers that call the unified handler with source type
  const handleContentScroll = (e) => handleSyncScroll(e, 'content')
  const handleHeaderScroll = (e) => handleSyncScroll(e, 'header')
  const handleFooterScroll = (e) => handleSyncScroll(e, 'footer')

  // Render multi-level headers
  const renderMultiLevelHeaders = () => {
    if (!groupedHeaders) {
      // Fallback to original single-level headers
      return (
        <div className="flex z-30 bg-white border-x border-t border-[#E0E0E1]">
          {/* Fixed columns header */}
          <div
            className={`flex sticky left-0 z-20 bg-white border-b border-[#E0E0E1] ${
              isScrolled
                ? 'after:absolute after:top-0 after:-right-[20px] after:w-[20px] after:h-full after:[background-image:linear-gradient(90deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.05)_50%,transparent_100%)]'
                : ''
            }`}
          >
            {fixedColumns.map((column, index) => (
              <ColumnTable
                key={index}
                className={`flex items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 !responsive-text-sm font-semibold flex-shrink-0 ${
                  column.width
                } ${column.textAlign === 'center' ? 'justify-center' : column.textAlign === 'end' ? 'justify-end' : ''}`}
              >
                {column.title}
              </ColumnTable>
            ))}
          </div>

          {/* Scrollable columns header */}
          <div
            className="flex bg-white border-b border-[#E0E0E1] overflow-auto no-scrollbar w-full"
            ref={headerScrollRef}
            style={{ overflowY: 'hidden' }}
            onScroll={handleHeaderScroll}
          >
            {scrollableColumns.map((column, index) => (
              <ColumnTable
                key={index}
                className={`flex items-center py-2 px-3 ${
                  index !== scrollableColumns.length - 1 ? 'border-r border-[#E0E0E1]' : ''
                }  items-center text-neutral-07 !responsive-text-sm font-semibold flex-shrink-0 ${column.width} ${
                  column.textAlign === 'center' ? 'justify-center' : column.textAlign === 'end' ? 'justify-end' : ''
                }`}
              >
                {column.title}
              </ColumnTable>
            ))}
          </div>
        </div>
      )
    }

    // Multi-level headers
    return (
      <div className="z-30 bg-white border-x border-t border-[#E0E0E1]">
        {/* First level - Group headers */}
        <div className="flex">
          {/* Fixed columns header - spans both levels */}
          <div
            className={`flex sticky left-0 z-20 bg-white ${
              isScrolled
                ? 'after:absolute after:top-0 after:-right-[20px] after:w-[20px] after:h-full after:[background-image:linear-gradient(90deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.05)_50%,transparent_100%)]'
                : ''
            }`}
          >
            {fixedColumns.map((column, index) => (
              <ColumnTable
                key={index}
                className={`flex items-center py-2 px-3 border-r border-b border-[#E0E0E1] text-neutral-07 !responsive-text-sm font-semibold flex-shrink-0 ${
                  column.width
                } ${column.textAlign === 'center' ? 'justify-center' : column.textAlign === 'end' ? 'justify-end' : ''}`}
                style={{ minHeight: '80px' }} // Span both header levels
              >
                {column.title}
              </ColumnTable>
            ))}
          </div>

          {/* Scrollable group headers */}
          <div
            className="flex bg-white overflow-auto no-scrollbar w-full"
            ref={headerScrollRef}
            style={{ overflowY: 'hidden' }}
            onScroll={handleHeaderScroll}
          >
            {/* First row - Group headers */}
                {scrollableColumns && scrollableColumns.length > 0 && (
                  scrollableColumns.map((column, index) => (
                    <div
                      key={`single-${index}`}
                      className={`flex items-center justify-center py-2 px-3 border-r border-b border-[#E0E0E1] text-neutral-07 !responsive-text-sm font-semibold bg-white flex-shrink-0 ${column.width} ${
                        column.textAlign === 'center' ? 'justify-center' : column.textAlign === 'end' ? 'justify-end' : ''
                      }`}
                      // style={{ minHeight: '80px' }} // Span both header levels like fixed columns
                    >
                      {column.title}
                    </div>
                  ))
                )}
            <div className="flex flex-col w-full">
              <div className="flex">
                {/* Single-level scrollable columns that span both header levels */}
                
                {groupedHeaders.map((group, groupIndex) => {
                  // Calculate total width for this group by summing all its columns
                  const totalGroupWidth = group.columns.reduce((total, col) => {
                    // Extract the base width number from Tailwind class (e.g., "w-32" -> 32, "w-32 2xl:w-36" -> 32)
                    const match = col.width.match(/w-(\d+)/)
                    if (match) {
                      const widthNum = parseInt(match[1])
                      // Convert Tailwind width units to pixels
                      // w-14 = 56px, w-24 = 96px, w-32 = 128px, w-36 = 144px, etc.
                      return total + (widthNum * 4)
                    }
                    // Fallback width if pattern doesn't match
                    return total + 128
                  }, 0)
                  
                  return (
                    <div
                      key={groupIndex}
                      className={`flex items-center justify-center py-2 px-3 border-r border-b border-[#E0E0E1] text-neutral-07 !responsive-text-sm font-semibold flex-shrink-0`}
                      style={{ 
                        width: `${totalGroupWidth}px`,
                        minWidth: `${totalGroupWidth}px`,
                        maxWidth: `${totalGroupWidth}px`
                      }}
                    >
                      {group.title}
                    </div>
                  )
                })}
              </div>
              
              {/* Second row - Sub headers */}
              <div className="flex">
                {groupedHeaders.map((group, groupIndex) => (
                  <div key={groupIndex} className="flex">
                    {group.columns.map((column, colIndex) => (
                      <ColumnTable
                        key={`${groupIndex}-${colIndex}`}
                        className={`flex items-center py-2 px-3 border-r border-b border-[#E0E0E1] text-neutral-07 !responsive-text-sm font-semibold flex-shrink-0 ${column.width} ${
                          column.textAlign === 'center' ? 'justify-center' : column.textAlign === 'end' ? 'justify-end' : ''
                        }`}
                      >
                        {column.title}
                      </ColumnTable>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full relative overflow-hidden flex flex-col">
      {/* Header row with fixed and scrollable columns */}
      {renderMultiLevelHeaders()}

      <Customscrollbar
        className="h-full flex-1 overflow-auto border-x border-b border-[#E0E0E1]"
        onScroll={handleContentScroll}
        ref={scrollbarRef}
        alwaysShowScrollbar={true}
      >
        <div className="relative min-w-full w-max h-full">
          {isFetching ? (
            <Loading color="#0f4f9e" />
          ) : data?.length > 0 ? (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Table rows */}
              {data.map((item, rowIndex) => (
                <div className={`flex relative`} key={rowIndex}>
                  {/* Fixed columns */}
                  <div
                    className={`flex sticky left-0 z-20 bg-white border-b border-[#E0E0E1] ${
                      isScrolled
                        ? 'after:absolute after:top-0 after:-right-[20px] after:w-[20px] after:h-full after:[background-image:linear-gradient(90deg,rgba(0,0,0,0.12)_0%,rgba(0,0,0,0.05)_50%,transparent_100%)]'
                        : ''
                    }`}
                  >
                    {renderFixedRow(item, rowIndex)}
                  </div>

                  {/* Scrollable columns */}
                  <div className="flex bg-white border-b border-[#E0E0E1] w-full">{renderScrollableRow(item, rowIndex)}</div>
                </div>
              ))}
            </div>
          ) : (
            <NoData type="report" classNameImage="w-[245px]"/>
          )}
        </div>
      </Customscrollbar>

      {/* Footer row - moved outside scrollbar to stay fixed at bottom */}
      {renderFooter && (
        <div className="flex sticky bottom-0 z-10 bg-white w-full">
          <div
            className="flex overflow-auto no-scrollbar w-full"
            ref={footerScrollRef}
            style={{ overflowY: 'hidden' }}
            onScroll={handleFooterScroll}
          >
            {renderFooter()}
          </div>
        </div>
      )}
    </div>
  )
}

export default TableSection
