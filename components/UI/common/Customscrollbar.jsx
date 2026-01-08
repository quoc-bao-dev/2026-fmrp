import { forwardRef, useEffect, useRef } from 'react'
import SimpleBar from 'simplebar-react'
import 'simplebar-react/dist/simplebar.min.css'

const SimpleBarCustom = forwardRef(({ children, scrollableNodePropsClassName, hideScrollbar, alwaysShowScrollbar = false, horizontalOnly = false, showOnHover = false, ...props }, ref) => {
  const innerRef = useRef(null)

  // Gắn ref
  useEffect(() => {
    if (innerRef.current && ref) {
      ref.current = innerRef.current
    }
  }, [innerRef, ref])

  // Inject global CSS cho hover
  useEffect(() => {
    const styleId = 'customscrollbar-hover-style'
    if (document.getElementById(styleId)) return

    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      [data-simplebar].custom-scrollbar-hovered:not(.horizontal-only) .simplebar-vertical,
      [data-simplebar].custom-scrollbar-hovered:not(.horizontal-only) .simplebar-vertical .simplebar-scrollbar,
      [data-simplebar].custom-scrollbar-hovered:not(.horizontal-only) .simplebar-vertical .simplebar-scrollbar:before {
        opacity: 0.6 !important;
        visibility: visible !important;
      }
      [data-simplebar].custom-scrollbar-hovered.horizontal-only .simplebar-horizontal,
      [data-simplebar].custom-scrollbar-hovered.horizontal-only .simplebar-horizontal .simplebar-scrollbar,
      [data-simplebar].custom-scrollbar-hovered.horizontal-only .simplebar-horizontal .simplebar-scrollbar:before {
        opacity: 1 !important;
        visibility: visible !important;
      }
      [data-simplebar].custom-scrollbar-hovered.horizontal-only [data-simplebar]:not(.custom-scrollbar-hovered) .simplebar-vertical,
      [data-simplebar].custom-scrollbar-hovered:not(.horizontal-only) [data-simplebar]:not(.custom-scrollbar-hovered) .simplebar-horizontal {
        opacity: 0 !important;
        visibility: hidden !important;
      }
      [data-simplebar].custom-scrollbar-hovered .simplebar-scrollbar {
        transition: opacity 0s !important;
      }
    `
    document.head.appendChild(style)

    return () => {
      const existingStyle = document.getElementById(styleId)
      if (existingStyle) existingStyle.remove()
    }
  }, [])

  // Setup hover listeners
  useEffect(() => {
    if (!showOnHover) return

    const findContainer = () => innerRef.current?.closest('[data-simplebar]')

    const isChildSimpleBar = (element, container) => {
      let current = element
      while (current && current !== container) {
        if (current.hasAttribute?.('data-simplebar')) return true
        current = current.parentElement
      }
      return false
    }

    const setupListeners = (container) => {
      const handleEnter = (e) => {
        if (isChildSimpleBar(e.target, container)) return
        e.stopPropagation()
        container.classList.add('custom-scrollbar-hovered')
      }

      const handleLeave = (e) => {
        if (e.relatedTarget && container.contains(e.relatedTarget) && isChildSimpleBar(e.relatedTarget, container)) {
          return
        }
        e.stopPropagation()
        container.classList.remove('custom-scrollbar-hovered')
      }

      container.addEventListener('mouseenter', handleEnter, false)
      container.addEventListener('mouseleave', handleLeave, false)

      return () => {
        container.removeEventListener('mouseenter', handleEnter, false)
        container.removeEventListener('mouseleave', handleLeave, false)
      }
    }

    const container = findContainer()
    if (!container) {
      const timer = setTimeout(() => {
        const element = findContainer()
        if (element) setupListeners(element)
      }, 100)
      return () => clearTimeout(timer)
    }

    return setupListeners(container)
  }, [innerRef, showOnHover])

  // Tính toán styles và classes
  const scrollbarStyle = alwaysShowScrollbar ? { overflow: 'auto' } : {}
  const overflowStyle = alwaysShowScrollbar
    ? { overflowX: 'scroll', overflowY: horizontalOnly ? 'hidden' : (hideScrollbar ? 'hidden' : 'scroll') }
    : horizontalOnly
    ? { overflowX: 'scroll', overflowY: 'hidden' }
    : undefined

  const className = [
    props.className,
    hideScrollbar && 'hide-scrollbar',
    alwaysShowScrollbar && 'show-scrollbar',
    horizontalOnly && 'horizontal-only'
  ].filter(Boolean).join(' ')

  const scrollableClassName = [
    scrollableNodePropsClassName,
    alwaysShowScrollbar && 'always-show-scrollbar',
    horizontalOnly && 'horizontal-only-scrollbar'
  ].filter(Boolean).join(' ')

  const forceVisible = horizontalOnly ? 'x' : (alwaysShowScrollbar ? 'xy' : (props.forceVisible || 'y'))

  return (
    <SimpleBar
      {...props}
      id={props.id}
      data-simplebar-force-visible
      tabIndex={-1}
      scrollableNodeProps={{
        ref: innerRef,
        className: scrollableClassName,
        onScroll: props.onScroll,
        onFocus: props.onFocus ? (e) => e.preventDefault() : undefined,
        tabIndex: -1,
        style: overflowStyle
      }}
      style={{ ...(props.style || {}), ...scrollbarStyle, ...(horizontalOnly ? { overflowY: 'hidden', height: '100%' } : {}) }}
      className={className}
      forceVisible={forceVisible}
      autoHide={!alwaysShowScrollbar}
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
            opacity: 0.8 !important;
          }
          .show-scrollbar .simplebar-horizontal,
          .show-scrollbar .simplebar-horizontal .simplebar-scrollbar {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
          }
          .show-scrollbar .simplebar-horizontal .simplebar-scrollbar:before {
            opacity: 1 !important;
          }
          .show-scrollbar .simplebar-vertical,
          .show-scrollbar .simplebar-vertical .simplebar-scrollbar {
            display: block !important;
            opacity: 1 !important;
            visibility: visible !important;
          }
          .show-scrollbar .simplebar-vertical .simplebar-scrollbar {
            opacity: 0.8 !important;
          }
          .show-scrollbar .simplebar-vertical .simplebar-scrollbar:before {
            opacity: 0.8 !important;
          }
          .horizontal-only .simplebar-vertical {
            display: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
          }
          .horizontal-only .show-scrollbar .simplebar-vertical,
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
          .horizontal-only,
          .horizontal-only .simplebar-wrapper,
          .horizontal-only .simplebar-mask,
          .horizontal-only .simplebar-offset,
          .horizontal-only .simplebar-content-wrapper,
          .horizontal-only .simplebar-content {
            height: 100% !important;
          }
          .horizontal-only .simplebar-content-wrapper,
          .horizontal-only .simplebar-content {
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
          .horizontal-only .show-scrollbar .simplebar-vertical,
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
          .horizontal-only .simplebar-wrapper,
          .horizontal-only .simplebar-mask,
          .horizontal-only .simplebar-offset,
          .horizontal-only .simplebar-content-wrapper,
          .horizontal-only .simplebar-content {
            height: 100% !important;
          }
          .horizontal-only .simplebar-content-wrapper,
          .horizontal-only .simplebar-content {
            max-height: 100% !important;
          }
        `}</style>
      )}
      {children}
    </SimpleBar>
  )
})

export const Customscrollbar = forwardRef((props, ref) => {
  const { alwaysShowScrollbar = false, horizontalOnly = false, showOnHover = false, ...restProps } = props

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
      showOnHover={showOnHover}
      style={props.style || {}}
      className={props.className || 'pb-2'}
    >
      {props.children}
    </SimpleBarCustom>
  )
})
