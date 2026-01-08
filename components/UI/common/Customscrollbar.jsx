import { forwardRef, useEffect, useRef } from 'react'
import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'

const SimpleBarCustom = forwardRef(({ children, scrollableNodePropsClassName, hideScrollbar, alwaysShowScrollbar = false, ...props }, ref) => {
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
        className: `${scrollableNodePropsClassName || ''} ${alwaysShowScrollbar ? 'always-show-scrollbar' : ''}`,
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
          overflowY: hideScrollbar ? 'hidden' : 'scroll'
        } : undefined
      }} // Gắn ref vào inner scrollable element
      style={{...(props.style || {}), ...scrollbarStyle}}
      className={`${props.className} ${hideScrollbar ? 'hide-scrollbar' : ''} ${alwaysShowScrollbar ? 'show-scrollbar' : ''}`}
      forceVisible={alwaysShowScrollbar ? 'xy' : (props.forceVisible || 'y')}
      autoHide={alwaysShowScrollbar ? false : true}
    >
      {alwaysShowScrollbar && (
        <style jsx global>{`
          .always-show-scrollbar {
            overflow-x: scroll !important;
            overflow-y: ${hideScrollbar ? 'hidden' : 'scroll'} !important;
          }
          .show-scrollbar::-webkit-scrollbar {
            display: block !important;
            width: 8px;
            height: 8px;
          }
          .show-scrollbar .simplebar-scrollbar:before {
            opacity: 0.5 !important;
          }
        `}</style>
      )}
      {children}
    </SimpleBar>
  )
})

export const Customscrollbar = forwardRef((props, ref) => {
  const { alwaysShowScrollbar = false, ...restProps } = props;
  
  return (
    <SimpleBarCustom
      {...restProps}
      ref={ref}
      id={props.id}
      onFocus={props.onFocus}
      onScroll={props.onScroll}
      hideScrollbar={props.hideScrollbar}
      alwaysShowScrollbar={alwaysShowScrollbar}
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
