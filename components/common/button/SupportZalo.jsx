import AnimatedGeneraEachWord from '@/components/animations/animation/AnimatedGeneraEachWord';
import { ZaloIcon } from '@/components/icons';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const SupportZalo = () => {
  // ========== CẤU HÌNH ==========
  // Khoảng cách từ mép phải màn hình (px)
  const RIGHT_OFFSET = 24;
  // ===============================

  const [typingCycle, setTypingCycle] = useState(0);
  const [showText, setShowText] = useState(true);
  const hideTimeoutRef = useRef(null);

  // State cho vị trí của bong bóng
  const [bottomPosition, setBottomPosition] = useState(20); // 20px từ dưới lên
  const [rightPosition, setRightPosition] = useState(RIGHT_OFFSET); // 20px từ mép phải
  const [leftPosition, setLeftPosition] = useState(null); // Vị trí từ mép trái (nếu ở bên trái)
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false); // Ref để tránh stale closure
  const hasMovedRef = useRef(false); // Ref để kiểm tra xem có di chuyển chuột khi đang giữ không
  const dragStartY = useRef(0);
  const dragStartX = useRef(0);
  const dragStartBottom = useRef(0);
  const dragStartRight = useRef(0);
  const bubbleRef = useRef(null);
  const iconRef = useRef(null);

  // Tính toán xem icon nằm bên trái hay bên phải màn hình
  const isIconOnLeft = () => {
    if (!bubbleRef.current || typeof window === 'undefined') return false;
    const rect = bubbleRef.current.getBoundingClientRect();
    const iconCenterX = rect.left + rect.width / 2;
    return iconCenterX < window.innerWidth / 2;
  };

  const [isOnLeft, setIsOnLeft] = useState(false);

  // Khởi tạo vị trí ban đầu
  useEffect(() => {
    if (bubbleRef.current) {
      const onLeft = isIconOnLeft();
      setIsOnLeft(onLeft);
      if (onLeft) {
        const bubbleWidth = bubbleRef.current.offsetWidth;
        const calculatedLeft = window.innerWidth - rightPosition - bubbleWidth;
        setLeftPosition(calculatedLeft);
      }
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowText(false);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      hideTimeoutRef.current = setTimeout(() => {
        setTypingCycle(prev => prev + 1);
        setShowText(true);
      }, 5000); // ẩn 2s rồi hiện lại
    }, 9000); // wait một lúc sau khi gõ xong rồi chạy lại

    return () => {
      clearInterval(interval);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
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
    <Link
      href='https://zalo.me/fososoft'
      target='_blank'
      ref={bubbleRef}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
      style={{
        position: 'fixed',
        bottom: `${bottomPosition}px`,
        ...(isOnLeft && leftPosition !== null ? { left: `${leftPosition}px`, right: 'auto' } : { right: `${rightPosition}px`, left: 'auto' }),
        cursor: 'grab',
        transition: 'none',
      }}
      className={`z-[999] relative bg-white rounded-xl p-1 shadow-lg border border-new-blue/50 hover:cursor-grab active:cursor-grabbing flex items-center gap-1 ${
        isOnLeft ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Text - render bên trái hoặc bên phải tùy theo vị trí icon */}
      {showText && (
        <div className='pointer-events-none'>
          <AnimatedGeneraEachWord
            key={typingCycle}
            text='Hỗ Trợ Nhanh'
            className='!responsive-text-base font-medium text-new-blue !font-deca px-1'
            classNameWrapper='min-w-0'
            typingSpeed={150}
            loadingDotClassName1='bg-[#BFDBFE]'
            loadingDotClassName2='bg-[#60A5FA]'
            loadingDotClassName3='bg-[#2563EB]'
          />
        </div>
      )}

      {/* Icon - luôn ở vị trí cố định */}
      <div ref={iconRef} className='relative'>
        {/* Label "Kéo để di chuyển" */}
        <div
          className={`absolute -top-8 whitespace-nowrap rounded-lg bg-slate-900/90 px-2 py-1 text-[10px] tracking-ﬁwide text-white shadow-lg pointer-events-none ${
            isOnLeft
              ? 'left-[-100%] ml-7' // Nếu icon bên trái màn hình, label ở bên phải icon
              : 'right-[-100%] mr-7' // Nếu icon bên phải màn hình, label ở bên trái icon
          }`}
        >
          <span className='relative block'>
            Kéo để di chuyển
            <span
              className={`absolute top-full h-0 w-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900/90 ${
                isOnLeft
                  ? 'left-0' // Mũi tên ở mép trái label (gần icon) khi label ở bên phải
                  : 'right-0' // Mũi tên ở mép phải label (gần icon) khi label ở bên trái
              }`}
            ></span>
          </span>
        </div>
        <ZaloIcon className='size-8 2xl:size-8' />
      </div>
    </Link>
  );
};

export default SupportZalo;
