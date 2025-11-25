import AnimatedGeneraEachWord from '@/components/animations/animation/AnimatedGeneraEachWord';
import { ZaloIcon } from '@/components/icons';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const SupportZalo = () => {
  const [typingCycle, setTypingCycle] = useState(0);
  const [showText, setShowText] = useState(true);
  const hideTimeoutRef = useRef(null);

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

  return (
    <Link href='https://zalo.me/fososoft' target='_blank' className='fixed bottom-5 right-[11%] 2xl:right-[10%] z-[9999] flex items-center gap-1 bg-white rounded-xl p-1 shadow-lg border border-new-blue/50'>
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
      <ZaloIcon className='size-6 2xl:size-8'/>
    </Link>
  );
};

export default SupportZalo;
