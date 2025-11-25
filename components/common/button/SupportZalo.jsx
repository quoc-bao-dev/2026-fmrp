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
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false); // Ref để tránh stale closure
  const hasMovedRef = useRef(false); // Ref để kiểm tra xem có di chuyển chuột khi đang giữ không
  const dragStartY = useRef(0);
  const dragStartX = useRef(0);
  const dragStartBottom = useRef(0);
  const dragStartRight = useRef(0);
  const bubbleRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowText(false);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      hideTimeoutRef.current = setTimeout(() => {
        setTypingCycle(prev => prev + 1);
        setShowText(true);
      }, 3000); // ẩn 2s rồi hiện lại
    }, 6000); // wait một lúc sau khi gõ xong rồi chạy lại

    return () => {
      clearInterval(interval);
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

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

    setBottomPosition(clampedBottom);
    setRightPosition(clampedRight);
  };

  // Xử lý khi thả chuột - tự động về mép phải
  const handleMouseUp = () => {
    setIsDragging(false);
    isDraggingRef.current = false;
    // Tự động di chuyển về mép phải (20px)
    setRightPosition(RIGHT_OFFSET);
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
        right: `${rightPosition}px`,
        cursor: 'grab',
        transition: isDragging ? 'none' : 'right 0.3s ease-out',
      }}
      className='z-[9999] flex items-center gap-1 bg-white rounded-xl p-1 shadow-lg border border-new-blue/50 hover:cursor-grab active:cursor-grabbing'
    >
      {showText && (
        <AnimatedGeneraEachWord
          key={typingCycle}
          text='Hỗ Trợ'
          className='!responsive-text-base font-medium text-new-blue !font-deca px-1'
          classNameWrapper='min-w-0'
          typingSpeed={300}
          loadingDotClassName1='bg-[#BFDBFE]'
          loadingDotClassName2='bg-[#60A5FA]'
          loadingDotClassName3='bg-[#2563EB]'
        />
      )}
      <ZaloIcon className='size-6 2xl:size-8' />
    </Link>
  );
};

export default SupportZalo;
