import { useRouter } from "next/dist/client/router";
import React, { useRef, useEffect, useLayoutEffect } from "react";
import { useTabContext } from "./common/layout";

const TabFilter = React.memo((props) => {
  const router = useRouter();
  const tabRef = useRef(null);
  const containerRef = useRef(null);
  const { setActiveTabInfo } = useTabContext() || {};
  const isActive =
    router.query?.tab === `${props.active}` ||
    (!router.query?.tab && props.active === "all");

  // Hàm tính toán vị trí chính xác của tab so với container cha
  const calculateTabPosition = (tabElement) => {
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
  };

  // Sử dụng useLayoutEffect để cập nhật vị trí trước khi render
  useLayoutEffect(() => {
    if (tabRef.current && isActive && setActiveTabInfo) {
      const tabElement = tabRef.current;
      if (tabElement) {
        const position = calculateTabPosition(tabElement);

        setActiveTabInfo({
          id: props.active,
          left: position.left,
          width: position.width,
        });
      }
    }
  }, [router.query?.tab, props.active, setActiveTabInfo, isActive]);

  // Cập nhật vị trí tab khi tab active hoặc khi component mount
  useEffect(() => {
    const updateTabPosition = () => {
      if (tabRef.current && isActive && setActiveTabInfo) {
        const tabElement = tabRef.current;
        if (tabElement) {
          const position = calculateTabPosition(tabElement);

          setActiveTabInfo({
            id: props.active,
            left: position.left,
            width: position.width,
          });
        }
      }
    };

    // Cập nhật khi cửa sổ resize
    window.addEventListener("resize", updateTabPosition);

    // Cập nhật khi scroll trên container
    const simplebarContent = tabRef.current?.closest(".simplebar-content");
    if (simplebarContent) {
      simplebarContent.addEventListener("scroll", updateTabPosition);
    }

    // Cập nhật sau khi component mount hoàn chỉnh
    const timer = setTimeout(updateTabPosition, 100);

    return () => {
      window.removeEventListener("resize", updateTabPosition);
      clearTimeout(timer);

      if (simplebarContent) {
        simplebarContent.removeEventListener("scroll", updateTabPosition);
      }
    };
  }, [router.query?.tab, props.active, setActiveTabInfo, isActive]);

  const handleClick = (e) => {
    if (props.onClick) {
      props.onClick(e);

      // Cập nhật lại vị trí tab sau khi click để đảm bảo chính xác
      setTimeout(() => {
        if (tabRef.current && setActiveTabInfo) {
          const tabElement = tabRef.current;
          const position = calculateTabPosition(tabElement);

          setActiveTabInfo({
            id: props.active,
            left: position.left,
            width: position.width,
          });
        }
      }, 50);
    }
  };

  return (
    <div className="relative group" ref={containerRef}>
      <button
        ref={tabRef}
        onClick={handleClick}
        className={`${
          props.className
        } whitespace-nowrap font-medium justify-center responsive-text-base flex gap-2 items-center px-3 py-2.5 outline-none transition-colors duration-200
        ${
          isActive
            ? "text-blue-fmrp"
            : "text-neutral-02 group-hover:text-blue-fmrp/80"
        }
        `}
      >
        {props.children}
        <span
          className={`${
            props?.total > 0 &&
            "py-1 px-2 rounded-full text-white text-xs font-semibold transition-colors duration-200"
          } 
        ${isActive ? "bg-blue-fmrp " : "bg-neutral-02 group-hover:bg-blue-fmrp"}
          
          `}
        >
          {props?.total > 0 && props?.total}
        </span>
      </button>
    </div>
  );
});
export default TabFilter;
