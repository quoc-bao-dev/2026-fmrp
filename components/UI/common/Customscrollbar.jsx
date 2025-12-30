import { forwardRef, useEffect, useRef } from 'react'
import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'

const SimpleBarCustom = forwardRef(({ children, scrollableNodePropsClassName, hideScrollbar, alwaysShowScrollbar = false, horizontalOnly = false, ...props }, ref) => {
  const innerRef = useRef(null)

  useEffect(() => {
    if (innerRef.current && ref) {
      ref.current = innerRef.current
    }
  }, [innerRef, ref])

  // CSS để luôn hiển thị thanh cuộn khi alwaysShowScrollbar === true
  const scrollbarStyle = alwaysShowScrollbar ? {
    overflow: 'auto'
  } : {};

  return (
    <SimpleBar
      {...props}
      id={props.id}
      data-simplebar-force-visible
      tabIndex={-1}
      scrollableNodeProps={{
        ref: innerRef,
        className: `${scrollableNodePropsClassName || ''} ${alwaysShowScrollbar ? 'always-show-scrollbar' : ''} ${horizontalOnly ? 'horizontal-only-scrollbar' : ''}`,
        onScroll: (e) => {
          if (props.onScroll) {
            props.onScroll(e)
          }
        },
        onFocus: (e) => {
          if (props.onFocus) {
            e.preventDefault()
          }
        },
        tabIndex: -1,
        style: alwaysShowScrollbar ? {
          overflowX: 'scroll',
          overflowY: horizontalOnly ? 'hidden' : (hideScrollbar ? 'hidden' : 'scroll')
        } : (horizontalOnly ? {
          overflowX: 'scroll',
          overflowY: 'hidden'
        } : undefined)
      }} // Gắn ref vào inner scrollable element
      style={{...(props.style || {}), ...scrollbarStyle, ...(horizontalOnly ? { overflowY: 'hidden', height: '100%' } : {})}}
      className={`${props.className} ${hideScrollbar ? 'hide-scrollbar' : ''} ${alwaysShowScrollbar ? 'show-scrollbar' : ''} ${horizontalOnly ? 'horizontal-only' : ''}`}
      forceVisible={horizontalOnly ? 'x' : (alwaysShowScrollbar ? 'xy' : (props.forceVisible || 'y'))}
      autoHide={alwaysShowScrollbar ? false : true}
    >
      {alwaysShowScrollbar && (
        <style jsx global>{`
          .always-show-scrollbar {
            overflow-x: scroll !important;
            overflow-y: ${horizontalOnly ? 'hidden' : (hideScrollbar ? 'hidden' : 'scroll')} !important;
          }
          .horizontal-only-scrollbar {
            overflow-x: scroll !important;
            overflow-y: hidden !important;
          }
          .show-scrollbar::-webkit-scrollbar {
            display: block !important;
            width: 8px;
            height: 8px;
          }
          .show-scrollbar::-webkit-scrollbar:horizontal {
            display: block !important;
            height: 8px;
          }
          .show-scrollbar .simplebar-scrollbar:before {
            opacity: 0.8 !important; /* Thay đổi độ đậm nhạt ở đây (0.0 - 1.0) */
          }
          .show-scrollbar .simplebar-horizontal {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
          }
          .show-scrollbar .simplebar-horizontal .simplebar-scrollbar {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
          }
          .show-scrollbar .simplebar-horizontal .simplebar-scrollbar:before {
            opacity: 1 !important; /* Tăng opacity để thanh cuộn ngang đậm hơn, bằng với thanh cuộn dọc */
          }
          .show-scrollbar .simplebar-vertical {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
          }
          .show-scrollbar .simplebar-vertical .simplebar-scrollbar {
            display: block !important;
            opacity: 0.8 !important;
            visibility: visible !important;
          }
          .show-scrollbar .simplebar-vertical .simplebar-scrollbar:before {
            opacity: 0.8 !important;
          }
          .horizontal-only .simplebar-vertical {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
          }
          .horizontal-only .show-scrollbar .simplebar-vertical {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
          }
          .horizontal-only .show-scrollbar .simplebar-vertical .simplebar-scrollbar {
            display: block !important;
            opacity: 0.8 !important;
            visibility: visible !important;
          }
          .horizontal-only .simplebar-horizontal {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
          }
          ${horizontalOnly ? `
          .horizontal-only {
            height: 100% !important;
          }
          .horizontal-only .simplebar-wrapper {
            height: 100% !important;
          }
          .horizontal-only .simplebar-mask {
            height: 100% !important;
          }
          .horizontal-only .simplebar-offset {
            height: 100% !important;
          }
          .horizontal-only .simplebar-content-wrapper {
            height: 100% !important;
            max-height: 100% !important;
          }
          .horizontal-only .simplebar-content {
            height: 100% !important;
            max-height: 100% !important;
          }
          ` : ''}
        `}</style>
      )}
      {horizontalOnly && !alwaysShowScrollbar && (
        <style jsx global>{`
          .horizontal-only > .simplebar-wrapper > .simplebar-vertical {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
          }
          .horizontal-only .show-scrollbar .simplebar-vertical {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
          }
          .horizontal-only .show-scrollbar .simplebar-vertical .simplebar-scrollbar {
            display: block !important;
            opacity: 0.8 !important;
            visibility: visible !important;
          }
          .horizontal-only [data-simplebar]:not(.horizontal-only) .simplebar-vertical,
          .horizontal-only [data-simplebar]:not(.horizontal-only):hover .simplebar-vertical {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
          }
          .horizontal-only .simplebar-horizontal {
            display: block !important;
          }
          .horizontal-only-scrollbar {
            overflow-x: scroll !important;
            overflow-y: hidden !important;
          }
          .horizontal-only {
            overflow-y: hidden !important;
            height: 100% !important;
          }
          .horizontal-only .simplebar-wrapper {
            height: 100% !important;
          }
          .horizontal-only .simplebar-mask {
            height: 100% !important;
          }
          .horizontal-only .simplebar-offset {
            height: 100% !important;
          }
          .horizontal-only .simplebar-content-wrapper {
            height: 100% !important;
            max-height: 100% !important;
          }
          .horizontal-only .simplebar-content {
            height: 100% !important;
            max-height: 100% !important;
          }
        `}</style>
      )}
      {children}
    </SimpleBar>
  )
})

export const Customscrollbar = forwardRef((props, ref) => {
  const { alwaysShowScrollbar = false, horizontalOnly = false, ...restProps } = props;
  
  return (
    <SimpleBarCustom
      {...restProps}
      ref={ref}
      id={props.id}
      onFocus={props.onFocus}
      onScroll={props.onScroll}
      hideScrollbar={props.hideScrollbar}
      alwaysShowScrollbar={alwaysShowScrollbar}
      horizontalOnly={horizontalOnly}
      style={props.style ? props.style : {}}
      className={`${props.className ? props.className : 'pb-2'}`}
      // className={`${props.className ? props.className : "3xl:h-[83%]  2xl:h-[80%] xxl:h-[80%] xl:h-[81%] lg:h-[84%] pb-2"}
      // className={`${props.className ? props.className : "min:h-[200px] 3xl:h-[83%] xxl:h-[77%] 2xl:h-[79%] xl:h-[78%] lg:h-[84%] max:h-[400px] pb-2"}
      // overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100`}
    >
      {props.children}
    </SimpleBarCustom>
  )
})
