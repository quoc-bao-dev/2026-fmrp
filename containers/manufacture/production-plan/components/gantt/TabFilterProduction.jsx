import { useRouter } from "next/dist/client/router";
import React, { useRef, useEffect, useCallback } from "react";
import { useTabContext } from "@/components/UI/common/layout";

const TabFilterProduction = React.memo((props) => {
  const router = useRouter();
  const tabRef = useRef(null);
  const containerRef = useRef(null);
  const { setActiveTabInfo } = useTabContext() || {};
  const hasUpdatedRef = useRef(false);

  const isActive =
    router.query?.tab === `${props.active}` ||
    (!router.query?.tab && props.active === "all");

  // Hàm tính toán vị trí chính xác của tab so với container cha
  const calculateTabPosition = useCallback((tabElement) => {
    // Tìm container cha - simplebar-content
    const simplebarContent = tabElement.closest(".simplebar-content");

    if (simplebarContent) {
      // Tính toán vị trí tương đối so với container
      const containerRect = simplebarContent.getBoundingClientRect();
      const tabRect = tabElement.getBoundingClientRect();

      // Tính toán left tương đối so với container
      const relativeLeft =
        tabRect.left - containerRect.left + simplebarContent.scrollLeft;

      return {
        left: relativeLeft,
        width: tabRect.width,
      };
    }

    // Fallback nếu không tìm thấy container
    return {
      left: tabElement.offsetLeft,
      width: tabElement.offsetWidth,
    };
  }, []);

  // Hàm cập nhật vị trí - chỉ cập nhật một lần
  const updatePosition = useCallback(() => {
    if (!tabRef.current || !isActive || !setActiveTabInfo) return;

    const tabElement = tabRef.current;
    if (!tabElement) return;

    const position = calculateTabPosition(tabElement);

    setActiveTabInfo({
      id: props.active,
      left: position.left,
      width: position.width,
    });
  }, [isActive, setActiveTabInfo, props.active, calculateTabPosition]);

  // Chỉ cập nhật một lần khi mount và tab active
  useEffect(() => {
    if (isActive && tabRef.current && !hasUpdatedRef.current) {
      // Sử dụng double RAF để đảm bảo DOM đã được render
      const raf1 = requestAnimationFrame(() => {
        const raf2 = requestAnimationFrame(() => {
          updatePosition();
          hasUpdatedRef.current = true;
        });
        return () => cancelAnimationFrame(raf2);
      });

      return () => {
        cancelAnimationFrame(raf1);
      };
    }
  }, [isActive, updatePosition]);

  // Reset flag khi tab thay đổi
  useEffect(() => {
    if (!isActive) {
      hasUpdatedRef.current = false;
    }
  }, [isActive]);

  // Cập nhật vị trí tab khi resize hoặc scroll (chỉ khi tab active)
  useEffect(() => {
    if (!isActive || !setActiveTabInfo) return;

    let ticking = false;
    const throttledUpdate = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updatePosition();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Cập nhật khi cửa sổ resize
    window.addEventListener("resize", throttledUpdate, { passive: true });

    // Cập nhật khi scroll trên container
    const simplebarContent = tabRef.current?.closest(".simplebar-content");
    if (simplebarContent) {
      simplebarContent.addEventListener("scroll", throttledUpdate, { passive: true });
    }

    return () => {
      window.removeEventListener("resize", throttledUpdate);
      if (simplebarContent) {
        simplebarContent.removeEventListener("scroll", throttledUpdate);
      }
    };
  }, [isActive, props.active, setActiveTabInfo, updatePosition]);

  const handleClick = (e) => {
    if (props.onClick) {
      // Cập nhật vị trí ngay khi click - đây là cách chính để cập nhật
      // Sử dụng double RAF để đảm bảo DOM đã được render
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (tabRef.current && setActiveTabInfo) {
            const tabElement = tabRef.current;
            const position = calculateTabPosition(tabElement);
            
            setActiveTabInfo({
              id: props.active,
              left: position.left,
              width: position.width,
            });
            
            // Đánh dấu đã cập nhật
            hasUpdatedRef.current = true;
          }
        });
      });
      
      props.onClick(e);
    }
  };

  return (
    <div className="relative group" ref={containerRef}>
      <button
        ref={tabRef}
        onClick={handleClick}
        className={`${
          props.className
        } whitespace-nowrap font-medium justify-center responsive-text-base flex gap-2 items-center px-4 py-2.5 outline-none transition-colors duration-200
        ${
          isActive
            ? "text-typo-blue-4"
            : "text-neutral-02 group-hover:text-typo-blue-4/80"
        }
        `}
        style={props.style}
      >
        {props.children}
        <span
          className={`${
            props?.total > 0 &&
            "py-1 px-2 rounded-full text-white text-xs font-semibold transition-colors duration-200"
          } 
        ${isActive ? "bg-background-blue-2 " : "bg-neutral-02 group-hover:bg-background-blue-2"}
          
          `}
        >
          {props?.total > 0 && props?.total}
        </span>
      </button>
    </div>
  );
});

TabFilterProduction.displayName = "TabFilterProduction";

export default TabFilterProduction;

