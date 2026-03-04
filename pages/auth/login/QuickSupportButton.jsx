import React, { useEffect, useState } from 'react';

const DEFAULT_TYPING_SPEED = 120; // ms per character
const DEFAULT_PAUSE_AFTER_TYPED = 3500; // ms
const DEFAULT_DOTS_SPEED = 350; // ms

/**
 * Nút hỗ trợ nhanh với hiệu ứng typing text + dấu chấm
 * @param {Object} props
 * @param {number} props.typingSpeed - Thời gian gõ 1 ký tự (ms)
 * @param {number} props.repeatDelay - Thời gian tạm dừng sau khi gõ xong trước khi lặp lại (ms)
 */
const QuickSupportButton = ({ typingSpeed = DEFAULT_TYPING_SPEED, repeatDelay = DEFAULT_PAUSE_AFTER_TYPED }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [dotsCount, setDotsCount] = useState(0);

    const fullText = 'Hỗ trợ nhanh';
    const isTyping = displayedText.length < fullText.length;

    // Hiệu ứng gõ chữ + lặp lại sau khi gõ xong
    useEffect(() => {
        let timeoutId;

        if (displayedText.length < fullText.length) {
            timeoutId = setTimeout(() => {
                setDisplayedText(prev => fullText.slice(0, prev.length + 1));
            }, typingSpeed);
        } else {
            // Hoàn thành gõ → tạm dừng rồi reset để lặp lại
            timeoutId = setTimeout(() => {
                setDisplayedText('');
            }, repeatDelay);
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [displayedText, typingSpeed, repeatDelay]);

    // Hiệu ứng 3 dấu chấm nhảy lên xuống khi đang gõ
    useEffect(() => {
        if (!isTyping) {
            setDotsCount(0);
            return;
        }

        const interval = setInterval(() => {
            setDotsCount(prev => (prev + 1) % 4); // 0 -> 3
        }, DEFAULT_DOTS_SPEED);

        return () => clearInterval(interval);
    }, [isTyping]);

    const handleClick = () => {
        if (typeof window !== 'undefined') {
            window.open('https://zalo.me/fososoft', '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <button
            type='button'
            onClick={handleClick}
            className='flex items-center justify-center gap-2 cursor-pointer px-3 py-1.5 shadow-xl'
            style={{
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid #D7EEFF',
            }}
        >
            <svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                    fillRule='evenodd'
                    clipRule='evenodd'
                    d='M12 1.5C10.0109 1.5 8.10322 2.29018 6.6967 3.6967C5.29018 5.10322 4.5 7.01088 4.5 9V15.75H3V9C3 7.8181 3.23279 6.64778 3.68508 5.55585C4.13738 4.46392 4.80031 3.47177 5.63604 2.63604C6.47177 1.80031 7.46392 1.13738 8.55585 0.685084C9.64778 0.232792 10.8181 0 12 0C13.1819 0 14.3522 0.232792 15.4442 0.685084C16.5361 1.13738 17.5282 1.80031 18.364 2.63604C19.1997 3.47177 19.8626 4.46392 20.3149 5.55585C20.7672 6.64778 21 7.8181 21 9V15.75H19.5V9C19.5 8.01509 19.306 7.03982 18.9291 6.12987C18.5522 5.21993 17.9997 4.39314 17.3033 3.6967C16.6069 3.00026 15.7801 2.44781 14.8701 2.0709C13.9602 1.69399 12.9849 1.5 12 1.5Z'
                    fill='#1556D9'
                />
                <path
                    d='M16.5 12C16.5 11.6022 16.658 11.2206 16.9393 10.9393C17.2206 10.658 17.6022 10.5 18 10.5H21V16.5C21 16.8978 20.842 17.2794 20.5607 17.5607C20.2794 17.842 19.8978 18 19.5 18H18C17.6022 18 17.2206 17.842 16.9393 17.5607C16.658 17.2794 16.5 16.8978 16.5 16.5V12ZM7.5 12C7.5 11.6022 7.34196 11.2206 7.06066 10.9393C6.77936 10.658 6.39782 10.5 6 10.5H3V16.5C3 16.8978 3.15804 17.2794 3.43934 17.5607C3.72064 17.842 4.10218 18 4.5 18H6C6.39782 18 6.77936 17.842 7.06066 17.5607C7.34196 17.2794 7.5 16.8978 7.5 16.5V12Z'
                    fill='#1556D9'
                />
                <path
                    fillRule='evenodd'
                    clipRule='evenodd'
                    d='M20.25 12.75C20.4489 12.75 20.6397 12.829 20.7803 12.9697C20.921 13.1103 21 13.3011 21 13.5V18C21 18.9946 20.6049 19.9484 19.9017 20.6517C19.1984 21.3549 18.2446 21.75 17.25 21.75H12C11.8011 21.75 11.6103 21.671 11.4697 21.5303C11.329 21.3897 11.25 21.1989 11.25 21C11.25 20.8011 11.329 20.6103 11.4697 20.4697C11.6103 20.329 11.8011 20.25 12 20.25H17.25C17.8467 20.25 18.419 20.0129 18.841 19.591C19.2629 19.169 19.5 18.5967 19.5 18V13.5C19.5 13.3011 19.579 13.1103 19.7197 12.9697C19.8603 12.829 20.0511 12.75 20.25 12.75Z'
                    fill='#1556D9'
                />
                <path
                    d='M9.75 21C9.75 20.6022 9.90804 20.2206 10.1893 19.9393C10.4706 19.658 10.8522 19.5 11.25 19.5H12.75C13.1478 19.5 13.5294 19.658 13.8107 19.9393C14.092 20.2206 14.25 20.6022 14.25 21C14.25 21.3978 14.092 21.7794 13.8107 22.0607C13.5294 22.342 13.1478 22.5 12.75 22.5H11.25C10.8522 22.5 10.4706 22.342 10.1893 22.0607C9.90804 21.7794 9.75 21.3978 9.75 21Z'
                    fill='#1556D9'
                />
            </svg>

            <p className='font-deca font-semibold text-[12px] text-[#1556D9] flex items-center gap-1'>
                <span>{displayedText}</span>
                {isTyping && (
                    <span className='inline-flex items-end overflow-hidden h-[1em]'>
                        {Array.from({ length: dotsCount }).map((_, idx) => (
                            <span
                                key={idx}
                                className='text-[#1556D9]'
                                style={{
                                    animation: 'jump 0.6s ease-in-out infinite',
                                    animationDelay: `${idx * 0.1}s`,
                                }}
                            >
                                .
                            </span>
                        ))}
                    </span>
                )}
            </p>

            <style jsx>{`
        @keyframes jump {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-2px);
          }
          100% {
            transform: translateY(0);
          }
        }
      `}</style>
        </button>
    );
};

export default QuickSupportButton;

