import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import PopupFeelsCustomer from '../popup/PopupFeelsCustomer';

// config path để ẩn
const HIDDEN_PATHS = [
  '/piecework-wage/import-output',
];

const SupportZalo = () => {
  const router = useRouter();

  // Nếu path hiện tại nằm trong danh sách ẩn thì không render gì
  if (HIDDEN_PATHS.includes(router?.pathname)) {
    return null;
  }

  const dispatch = useDispatch();
  // ========== CẤU HÌNH ==========
  // Khoảng cách từ mép trái màn hình (px) khi ở trạng thái mặc định
  const LEFT_OFFSET = 0;
  // Khoảng cách mặc định từ mép phải (sử dụng khi icon nằm bên phải)
  const RIGHT_OFFSET = 0;
  // ===============================

  // State cho vị trí của bong bóng
  const [bottomPosition, setBottomPosition] = useState(100); // Giá trị tạm thời, sẽ được tính toán lại
  const [rightPosition, setRightPosition] = useState(RIGHT_OFFSET); // Vị trí từ mép phải
  const [leftPosition, setLeftPosition] = useState(LEFT_OFFSET); // Vị trí từ mép trái (mặc định bên trái)
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false); // Ref để tránh stale closure
  const hasMovedRef = useRef(false); // Ref để kiểm tra xem có di chuyển chuột khi đang giữ không
  const dragStartY = useRef(0);
  const dragStartX = useRef(0);
  const dragStartBottom = useRef(0);
  const dragStartRight = useRef(0);
  const bubbleRef = useRef(null);
  const isInitializedRef = useRef(false); // Ref để đảm bảo chỉ tính toán một lần

  // Tính toán xem icon nằm bên trái hay bên phải màn hình
  const isIconOnLeft = () => {
    if (!bubbleRef.current || typeof window === 'undefined') return false;
    const rect = bubbleRef.current.getBoundingClientRect();
    const iconCenterX = rect.left + rect.width / 2;
    return iconCenterX < window.innerWidth / 2;
  };

  const [isOnLeft, setIsOnLeft] = useState(true);

  // Khởi tạo vị trí ban đầu - tính toán để nằm ở giữa màn hình và mặc định bên trái
  useEffect(() => {
    if (typeof window === 'undefined' || isInitializedRef.current) return;

    const calculateInitialPosition = () => {
      if (bubbleRef.current) {
        const bubbleHeight = bubbleRef.current.offsetHeight;
        const bubbleWidth = bubbleRef.current.offsetWidth;
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;

        // Tính toán vị trí bottom để component nằm ở giữa màn hình
        // bottom = (windowHeight - bubbleHeight) / 2
        const centerBottom = (windowHeight - bubbleHeight) / 2;
        setBottomPosition(centerBottom);

        // Mặc định đặt bong bóng ở bên trái với LEFT_OFFSET
        const initialLeft = LEFT_OFFSET;
        const initialRight = windowWidth - bubbleWidth - initialLeft;

        setLeftPosition(initialLeft);
        setRightPosition(initialRight);
        setIsOnLeft(true);

        isInitializedRef.current = true;
      } else {
        // Nếu chưa có ref, thử lại sau một chút
        requestAnimationFrame(calculateInitialPosition);
      }
    };

    // Delay một chút để đảm bảo DOM đã render xong
    requestAnimationFrame(() => {
      requestAnimationFrame(calculateInitialPosition);
    });
  }, []);


  // Cập nhật vị trí icon (trái/phải) khi position thay đổi
  useEffect(() => {
    const updatePosition = () => {
      if (bubbleRef.current) {
        const onLeft = isIconOnLeft();
        setIsOnLeft(onLeft);

        // Tính toán leftPosition từ rightPosition nếu ở bên trái
        if (onLeft) {
          const bubbleWidth = bubbleRef.current.offsetWidth;
          const calculatedLeft = window.innerWidth - rightPosition - bubbleWidth;
          setLeftPosition(calculatedLeft);
        } else {
          setLeftPosition(null);
        }
      }
    };

    // Delay một chút để đảm bảo DOM đã render
    const timeout = setTimeout(updatePosition, 0);
    window.addEventListener('resize', updatePosition);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updatePosition);
    };
  }, [bottomPosition, rightPosition]);

  // Xử lý bắt đầu kéo
  const handleMouseDown = e => {
    e.preventDefault();
    setIsDragging(true);
    isDraggingRef.current = true;
    hasMovedRef.current = false; // Reset flag khi bắt đầu
    dragStartY.current = e.clientY;
    dragStartX.current = e.clientX;
    dragStartBottom.current = bottomPosition;
    dragStartRight.current = rightPosition;
  };

  // Xử lý khi đang kéo
  const handleMouseMove = e => {
    if (!isDraggingRef.current) return;

    // Tính toán vị trí mới dựa trên sự thay đổi của chuột
    const deltaY = dragStartY.current - e.clientY; // clientY giảm khi kéo lên
    const deltaX = e.clientX - dragStartX.current; // clientX tăng khi kéo sang phải

    // Đánh dấu đã di chuyển nếu có thay đổi vị trí
    if (Math.abs(deltaY) > 2 || Math.abs(deltaX) > 2) {
      hasMovedRef.current = true;
    }

    const newBottom = dragStartBottom.current + deltaY;
    const newRight = dragStartRight.current - deltaX; // right giảm khi kéo sang phải

    // Giới hạn vị trí trong màn hình
    const maxBottom = window.innerHeight - (bubbleRef.current?.offsetHeight || 0);
    const minBottom = 0;
    const clampedBottom = Math.max(minBottom, Math.min(maxBottom, newBottom));

    const maxRight = window.innerWidth - (bubbleRef.current?.offsetWidth || 0);
    const minRight = 0;
    const clampedRight = Math.max(minRight, Math.min(maxRight, newRight));

    // Tính toán leftPosition từ rightPosition
    const bubbleWidth = bubbleRef.current?.offsetWidth || 0;
    const calculatedLeft = window.innerWidth - clampedRight - bubbleWidth;

    setBottomPosition(clampedBottom);
    setRightPosition(clampedRight);
    setLeftPosition(calculatedLeft);

    // Cập nhật vị trí icon ngay lập tức trong quá trình kéo
    requestAnimationFrame(() => {
      setIsOnLeft(isIconOnLeft());
    });
  };

  // Xử lý khi thả chuột - giữ nguyên vị trí hiện tại
  const handleMouseUp = () => {
    setIsDragging(false);
    isDraggingRef.current = false;
    // Giữ nguyên vị trí hiện tại, không tự động về mép phải
    // Reset flag sau một chút để onClick có thể kiểm tra
    setTimeout(() => {
      hasMovedRef.current = false;
    }, 0);
  };

  // Xử lý click - ngăn chặn navigation nếu đã kéo
  const handleClick = e => {
    if (hasMovedRef.current || isDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  // Xử lý mở popup góp ý
  const handleOpenFeedback = e => {
    e.stopPropagation();
    if (hasMovedRef.current || isDraggingRef.current) return;

    dispatch({
      type: 'statePopupGlobal',
      payload: {
        open: true,
        allowOutsideClick: false,
        allowEscape: false,
        children: (
          <PopupFeelsCustomer
            onClose={() =>
              dispatch({
                type: 'statePopupGlobal',
                payload: { open: false },
              })
            }
          />
        ),
      },
    });
  };

  // Xử lý mở Zalo OA
  const handleOpenSupport = e => {
    e.stopPropagation();
    if (hasMovedRef.current || isDraggingRef.current) return;

    if (typeof window !== 'undefined') {
      window.open('https://zalo.me/fososoft', '_blank', 'noopener,noreferrer');
    }
  };

  // Thêm event listeners cho mouse move và mouse up
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div
      ref={bubbleRef}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      style={{
        position: 'fixed',
        bottom: `${bottomPosition}px`,
        ...(isOnLeft && leftPosition !== null
          ? { left: `${leftPosition}px`, right: 'auto' }
          : { right: `${rightPosition}px`, left: 'auto' }),
        cursor: 'grab',
        transition: 'none',
        zIndex: 999,
      }}
      className="hover:cursor-grab active:cursor-grabbing"
    >
      <div
        style={{
          width: '56px',
          borderRadius: '16px',
          // Độ trong suốt cực thấp để hiệu ứng blur đẹp nhất
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid #D7EEFF',
        }}
        className="relative flex flex-col items-center justify-center gap-3 py-3 px-1 shadow-xl"
      >
        {/* Label kéo để di chuyển */}
        <div className={`absolute -top-6 ${isOnLeft ? 'left-0' : 'right-0'} flex items-center justify-center gap-1 mb-1`}>
          <p className="py-1 px-2 bg-gray-800 rounded-md font-deca font-medium text-[8px] text-[#ffffff] leading-tight whitespace-nowrap">Kéo để di chuyển</p>
        </div>
        {/* Nút Góp ý */}
        <div
          className="flex flex-col items-center justify-center gap-1 group pointer-events-auto cursor-pointer"
          onClick={handleOpenFeedback}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M24 12C24 17.799 18.627 22.5 12 22.5C10.8115 22.5016 9.62788 22.3473 8.4795 22.041C7.6035 22.485 5.592 23.337 2.208 23.892C1.908 23.94 1.68 23.628 1.7985 23.349C2.3295 22.095 2.8095 20.424 2.9535 18.9C1.116 17.055 0 14.64 0 12C0 6.201 5.373 1.5 12 1.5C18.627 1.5 24 6.201 24 12ZM7.5 12C7.5 12.3978 7.34196 12.7794 7.06066 13.0607C6.77936 13.342 6.39782 13.5 6 13.5C5.60218 13.5 5.22064 13.342 4.93934 13.0607C4.65804 12.7794 4.5 12.3978 4.5 12C4.5 11.6022 4.65804 11.2206 4.93934 10.9393C5.22064 10.658 5.60218 10.5 6 10.5C6.39782 10.5 6.77936 10.658 7.06066 10.9393C7.34196 11.2206 7.5 11.6022 7.5 12ZM13.5 12C13.5 12.3978 13.342 12.7794 13.0607 13.0607C12.7794 13.342 12.3978 13.5 12 13.5C11.6022 13.5 11.2206 13.342 10.9393 13.0607C10.658 12.7794 10.5 12.3978 10.5 12C10.5 11.6022 10.658 11.2206 10.9393 10.9393C11.2206 10.658 11.6022 10.5 12 10.5C12.3978 10.5 12.7794 10.658 13.0607 10.9393C13.342 11.2206 13.5 11.6022 13.5 12ZM18 13.5C18.3978 13.5 18.7794 13.342 19.0607 13.0607C19.342 12.7794 19.5 12.3978 19.5 12C19.5 11.6022 19.342 11.2206 19.0607 10.9393C18.7794 10.658 18.3978 10.5 18 10.5C17.6022 10.5 17.2206 10.658 16.9393 10.9393C16.658 11.2206 16.5 11.6022 16.5 12C16.5 12.3978 16.658 12.7794 16.9393 13.0607C17.2206 13.342 17.6022 13.5 18 13.5Z" fill="#1556D9" />
          </svg>
          <p className="font-deca font-semibold text-[10px] text-[#1556D9]">Góp ý</p>
        </div>

        <div className="w-8 h-[1px] bg-[#CFE8FC]"></div>

        {/* Nút Hỗ trợ */}
        <div
          className="flex flex-col items-center justify-center gap-1 group pointer-events-auto cursor-pointer"
          onClick={handleOpenSupport}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 1.5C10.0109 1.5 8.10322 2.29018 6.6967 3.6967C5.29018 5.10322 4.5 7.01088 4.5 9V15.75H3V9C3 7.8181 3.23279 6.64778 3.68508 5.55585C4.13738 4.46392 4.80031 3.47177 5.63604 2.63604C6.47177 1.80031 7.46392 1.13738 8.55585 0.685084C9.64778 0.232792 10.8181 0 12 0C13.1819 0 14.3522 0.232792 15.4442 0.685084C16.5361 1.13738 17.5282 1.80031 18.364 2.63604C19.1997 3.47177 19.8626 4.46392 20.3149 5.55585C20.7672 6.64778 21 7.8181 21 9V15.75H19.5V9C19.5 8.01509 19.306 7.03982 18.9291 6.12987C18.5522 5.21993 17.9997 4.39314 17.3033 3.6967C16.6069 3.00026 15.7801 2.44781 14.8701 2.0709C13.9602 1.69399 12.9849 1.5 12 1.5Z" fill="#1556D9" />
            <path d="M16.5 12C16.5 11.6022 16.658 11.2206 16.9393 10.9393C17.2206 10.658 17.6022 10.5 18 10.5H21V16.5C21 16.8978 20.842 17.2794 20.5607 17.5607C20.2794 17.842 19.8978 18 19.5 18H18C17.6022 18 17.2206 17.842 16.9393 17.5607C16.658 17.2794 16.5 16.8978 16.5 16.5V12ZM7.5 12C7.5 11.6022 7.34196 11.2206 7.06066 10.9393C6.77936 10.658 6.39782 10.5 6 10.5H3V16.5C3 16.8978 3.15804 17.2794 3.43934 17.5607C3.72064 17.842 4.10218 18 4.5 18H6C6.39782 18 6.77936 17.842 7.06066 17.5607C7.34196 17.2794 7.5 16.8978 7.5 16.5V12Z" fill="#1556D9" />
          </svg>
          <p className="font-deca font-semibold text-[10px] text-[#1556D9]">Hỗ trợ</p>
        </div>
      </div>
    </div>
  );
};

export default SupportZalo;
