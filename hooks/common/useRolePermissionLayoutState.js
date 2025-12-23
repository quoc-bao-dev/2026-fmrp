import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * State & behavior for RolePermissionLayout (scroll spy, active group, scroll syncing).
 * This hook chỉ lo phần UI/interaction, không fetch hay submit dữ liệu.
 */
const useRolePermissionLayoutState = ({ dataPower, isActivePowerTab , offset = 120 }) => {
  const [activeGroupKey, setActiveGroupKey] = useState(null);
  const isProgrammaticScrollRef = useRef(false);
  const scrollContainerRef = useRef(null);
  const sidebarRef = useRef(null);
  const sidebarButtonRefs = useRef({});
  const sectionRefs = useRef({});

  // Scroll to section when clicking on sidebar item
  const handleScrollToSection = useCallback(groupKey => {
    const section = sectionRefs.current[groupKey];
    if (section && scrollContainerRef.current) {
      const container = scrollContainerRef.current;

      // Active tab ngay lập tức
      setActiveGroupKey(groupKey);

      // Set flag để ngắt scroll spy trong khi scroll
      isProgrammaticScrollRef.current = true;

      // offsetTop là relative to container
      const sectionTop = section.offsetTop;

      // Scroll đến vị trí section cách mép trên container ~120px
      const targetScrollTop = sectionTop - offset;

      let scrollTimeout;
      const handleScrollEnd = () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          isProgrammaticScrollRef.current = false;
          container.removeEventListener('scroll', handleScrollEnd);
        }, 150);
      };

      container.addEventListener('scroll', handleScrollEnd);

      container.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth',
      });

      // Fallback: nếu sau 1s vẫn chưa scroll xong, cho phép check active lại
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
        container.removeEventListener('scroll', handleScrollEnd);
      }, 1000);
    }
  }, []);

  // Scroll spy effect - check khoảng cách từ mép trên container
  useEffect(() => {
    if (!isActivePowerTab || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const sections = Object.values(sectionRefs.current).filter(Boolean);

    const handleScroll = () => {
      // Nếu đang scroll programmatically (từ click), không check active
      if (isProgrammaticScrollRef.current) {
        return;
      }

      const containerTop = container.scrollTop;
      const containerRect = container.getBoundingClientRect();

      let activeSection = null;
      let minDistance = Infinity;

      sections.forEach(section => {
        if (!section) return;

        const sectionTop = section.offsetTop;
        const distanceFromTop = sectionTop - containerTop;

        const sectionRect = section.getBoundingClientRect();
        const isInViewport = sectionRect.bottom > containerRect.top && sectionRect.top < containerRect.bottom;

        if (isInViewport && distanceFromTop >= 0 && distanceFromTop < 100) {
          if (distanceFromTop < minDistance) {
            minDistance = distanceFromTop;
            activeSection = section;
          }
        }
      });

      if (!activeSection && sections.length > 0) {
        minDistance = Infinity;
        sections.forEach(section => {
          if (!section) return;
          const sectionTop = section.offsetTop;
          const distanceFromTop = sectionTop - containerTop;
          const sectionRect = section.getBoundingClientRect();
          const isInViewport = sectionRect.bottom > containerRect.top && sectionRect.top < containerRect.bottom;

          if (isInViewport && distanceFromTop >= -50) {
            const absDistance = Math.abs(distanceFromTop);
            if (absDistance < minDistance) {
              minDistance = absDistance;
              activeSection = section;
            }
          }
        });
      }

      if (activeSection) {
        setActiveGroupKey(activeSection.dataset.groupKey);
      }
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [isActivePowerTab, dataPower]);

  // Auto-scroll sidebar khi tab active nằm ngoài view
  useEffect(() => {
    if (!activeGroupKey || !sidebarRef.current) return;

    const activeButton = sidebarButtonRefs.current[activeGroupKey];
    if (!activeButton) return;

    const sidebar = sidebarRef.current;
    const buttonRect = activeButton.getBoundingClientRect();
    const sidebarRect = sidebar.getBoundingClientRect();

    const isAboveView = buttonRect.top < sidebarRect.top;
    const isBelowView = buttonRect.bottom > sidebarRect.bottom;

    if (isAboveView || isBelowView) {
      activeButton.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeGroupKey]);

  return {
    activeGroupKey,
    scrollContainerRef,
    sidebarRef,
    sidebarButtonRefs,
    sectionRefs,
    handleScrollToSection,
  };
};

export default useRolePermissionLayoutState;


