import React, { useEffect, useState } from 'react';

export default function Popup({
    isOpen,
    onClose,
    ariaLabel,
    children,
    panelClassName = '',
    closeOnBackdropClick = true,
}) {
    const [isMounted, setIsMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Mount then fade/zoom in
            setIsMounted(true);
            setIsVisible(false);

            const runShow = () => setIsVisible(true);
            if (typeof window !== 'undefined' && window.requestAnimationFrame) {
                window.requestAnimationFrame(runShow);
            } else {
                setTimeout(runShow, 0);
            }
        } else if (isMounted) {
            // Fade/zoom out, then unmount
            setIsVisible(false);
            const timeout = setTimeout(() => {
                setIsMounted(false);
            }, 200); // match transition duration
            return () => clearTimeout(timeout);
        }
    }, [isOpen, isMounted]);

    if (!isMounted) return null;

    const handleBackdropClick = () => {
        if (!closeOnBackdropClick) return;
        onClose?.();
    };

    return (
        <div
            className={[
                'fixed inset-0 z-[999] flex items-center justify-center',
                'bg-[#25387A40] backdrop-blur-sm transition-opacity duration-200 ease-out',
                isVisible ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
            onClick={handleBackdropClick}
            role="presentation"
        >
            <div
                className={[
                    'bg-white w-[min(640px,calc(100vw-32px))] p-6 rounded-3xl flex flex-col gap-4',
                    'shadow-[1px_0px_0px_0px_#00000026_inset,-6px_0px_24px_0px_#1F232914]',
                    'transform transition-all duration-200 ease-out origin-center',
                    isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2',
                    panelClassName,
                ].join(' ')}
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={ariaLabel}
            >
                {children}
            </div>
        </div>
    );
}

