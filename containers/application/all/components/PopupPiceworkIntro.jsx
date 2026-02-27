import React, { useLayoutEffect, useRef, useState } from 'react';
import Popup from './Popup';
import Image from 'next/image';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import formatMoney from '@/utils/helpers/formatMoney';

const IMAGE_CARD = '/application/card-1.png';
const IMAGE_PICEWORK_INTRO = '/application/picework-intro.png';

const formatHtml = (rawHtml) => {
    if (!rawHtml || typeof rawHtml !== 'string') return '';

    // Normalize newlines to reduce odd spacing
    let html = rawHtml.replace(/\r\n/g, '\n');

    // Inject classes into <ul> and <li> to control bullet style consistently
    html = html.replace(/<ul(\s[^>]*)?>/gi, (match, attrs = '') => {
        const hasClass = /class\s*=/.test(attrs);
        if (hasClass) {
            return `<ul${attrs.replace(/class=(["'])(.*?)\1/i, (m, q, cls) => ` class=${q}${cls} app-intro-list${q}`)}>`;
        }
        return `<ul${attrs || ''} class="app-intro-list">`;
    });

    html = html.replace(/<li(\s[^>]*)?>/gi, (match, attrs = '') => {
        const hasClass = /class\s*=/.test(attrs);
        if (hasClass) {
            return `<li${attrs.replace(/class=(["'])(.*?)\1/i, (m, q, cls) => ` class=${q}${cls} app-intro-li${q}`)}>`;
        }
        return `<li${attrs || ''} class="app-intro-li">`;
    });

    // Inject tailwind-like classes into <img> to make it responsive with max width 600px
    // Note: classes are used for styling consistency; width/height attributes from API can remain.
    html = html.replace(/<img(\s[^>]*)?>/gi, (match, attrs = '') => {
        const imgClass = 'app-intro-img max-h-[300px] 2xl:max-h-[400px] w-fit h-auto object-contain rounded-lg';
        const hasClass = /class\s*=/.test(attrs);
        if (hasClass) {
            return `<img${attrs.replace(/class=(["'])(.*?)\1/i, (m, q, cls) => ` class=${q}${cls} ${imgClass}${q}`)}>`;
        }
        return `<img${attrs || ''} class="${imgClass}">`;
    });

    return html;
};

export default function PiceworkIntroPopup({
    isOpen,
    onClose,
    onOpenPayment,
    closeOnBackdropClick = true,
    title = 'Lương sản lượng',
    content = 'Thống kê lương và giờ làm của công nhân dựa trên sản lượng thực tế, giúp doanh nghiệp tính lương chính xác, minh bạch và nhanh chóng.',
    introduce,
    directing,
    image,
    type = 'free',
    price = '300.000 đ',
    isInstalled = false,
    appLink,
    isComingSoon = false,
}) {
    const [activeTab, setActiveTab] = useState('intro'); // 'intro' | 'guide'
    const [tabMaxHeight, setTabMaxHeight] = useState(0);
    const introMeasureRef = useRef(null);
    const guideMeasureRef = useRef(null);

    const measureTabHeights = () => {
        const introH = introMeasureRef.current?.getBoundingClientRect?.().height || 0;
        const guideH = guideMeasureRef.current?.getBoundingClientRect?.().height || 0;
        const next = Math.ceil(Math.max(introH, guideH));
        if (next && next !== tabMaxHeight) setTabMaxHeight(next);
    };

    useLayoutEffect(() => {
        if (!isOpen) return;
        measureTabHeights();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    return (
        <Popup
            isOpen={isOpen}
            onClose={onClose}
            ariaLabel="Giới thiệu tính năng"
            panelClassName="!bg-[#F7F9FC] !w-[min(900px,calc(100vw-32px))] px-9 py-4 2xl:py-9 rounded-3xl gap-6"
            closeOnBackdropClick={closeOnBackdropClick}
        >
            <style jsx global>{`
                .app-intro-list {
                    margin-top: 8px;
                    padding-left: 0;
                }
                .app-intro-li {
                    position: relative;
                    padding-left: 14px;
                    margin: 6px 0;
                    list-style: none;
                }
                .app-intro-li::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0.7em;
                    width: 4px;
                    height: 4px;
                    border-radius: 9999px;
                    background: #0375f3;
                    transform: translateY(-50%);
                }
            `}</style>
            {/* ==== container ===== */}
            <div className="flex flex-col gap-6">
                {/* ==== header ===== */}
                <div className="flex items-start justify-between gap-6">

                    {/* ==== info ==== */}

                    <div className="flex gap-6">
                        {/* ==== image ===== */}
                        {/* image 137 x 137 */}
                        <div className="relative isolate size-[137px] rounded-full bg-white flex items-center justify-center shrink-0 before:content-[''] before:absolute before:inset-0 before:rounded-2xl before:bg-[#549AE866] before:blur-[150px] before:-z-10">
                            <Image
                                src={image || IMAGE_CARD}
                                alt={title}
                                width={137}
                                height={137}
                                className="w-full h-full object-contain"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <h2 className="font-deca font-semibold text-[20px] leading-7 tracking-[0] align-middle capitalize text-[#1C252E]">
                                {title}
                            </h2>

                            <p className="font-deca font-normal text-[14px] leading-5 tracking-[0] text-[#1C252E]/70 max-w-[762px]">
                                {content}
                            </p>

                            {price && type !== 'contact' && (
                                <p className="font-deca font-medium text-[16px] leading-6 tracking-[0] text-[#0375F3] w-fit">
                                    {(() => {
                                        const numericPrice = Number(price) || 0;
                                        if (type === 'free' || numericPrice <= 0) {
                                            return 'Miễn phí';
                                        }
                                        return `${formatMoney(numericPrice, null)} đ`;
                                    })()}
                                </p>
                            )}

                            <div className="w-fit">
                                {(() => {
                                    const isInstallButton = !isInstalled && (type === 'free' || type === 'charge') && !isComingSoon;

                                    const handleClick = () => {
                                        // Nếu đã cài đặt: mở ứng dụng
                                        if (isInstalled && appLink) {
                                            if (typeof window !== 'undefined') {
                                                window.location.href = appLink;
                                            }
                                            return;
                                        }

                                        // Nếu là loại liên hệ: mở OA Zalo
                                        if (type === 'contact') {
                                            if (typeof window !== 'undefined') {
                                                window.open('https://zalo.me/fososoft', '_blank', 'noopener,noreferrer');
                                            }
                                            return;
                                        }

                                        // free hoặc có phí (cài đặt): giữ nguyên logic cài đặt hiện tại
                                        if (typeof onOpenPayment === 'function') {
                                            onOpenPayment(type);
                                        }
                                    };

                                    // Nút "Cài đặt ngay" – giữ nguyên giao diện hiện tại
                                    if (isInstallButton) {
                                        return (
                                            <button
                                                type="button"
                                                onClick={handleClick}
                                                className="w-fit inline-flex items-center justify-center gap-1 rounded-[40px] border border-white/0 bg-[#0375F3] px-4 py-2 text-[14px] font-deca font-semibold text-white transition-all duration-200 hover:bg-[#0A7FFF] hover:shadow-[0_8px_20px_rgba(3,117,243,0.25)]"
                                            >
                                                Cài đặt ngay
                                            </button>
                                        );
                                    }

                                    // Các trường hợp khác: Mở / Liên hệ / Sắp ra mắt
                                    // Dùng lại giao diện từ ButtonAction (outline / secondary / primary)
                                    if (isComingSoon) {
                                        // Nút "Sắp ra mắt" (secondary style), disabled
                                        return (
                                            <button
                                                type="button"
                                                disabled
                                                className="inline-flex items-center rounded-[40px] border border-[#899CFD] bg-[#0375F3] px-6 py-3.5 text-sm font-semibold text-white shadow-none opacity-60 cursor-not-allowed"
                                            >
                                                Sắp ra mắt
                                            </button>
                                        );
                                    }

                                    if (type === 'contact') {
                                        // Nút outline – Liên hệ ngay
                                        return (
                                            <button
                                                type="button"
                                                onClick={handleClick}
                                                className="inline-flex items-center gap-2 rounded-[40px] border border-transparent bg-[#EAF2FF] px-2 py-2 text-sm font-semibold text-[#0375F3] shadow-none ring-1 ring-[#0375F3]/40 transition-all duration-200 hover:bg-[#F0F7FF] hover:shadow-[0_6px_16px_rgba(3,117,243,0.15)] active:scale-95"
                                            >
                                                <span className="pl-[12px]">Liên hệ ngay</span>
                                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <rect width="32" height="32" rx="16" fill="#0375F3" />
                                                    <path d="M21.938 11V19.125C21.938 19.3736 21.8392 19.6121 21.6634 19.7879C21.4876 19.9637 21.2491 20.0625 21.0005 20.0625C20.7518 20.0625 20.5134 19.9637 20.3375 19.7879C20.1617 19.6121 20.063 19.3736 20.063 19.125V13.2656L11.6637 21.6633C11.4876 21.8394 11.2487 21.9383 10.9997 21.9383C10.7506 21.9383 10.5117 21.8394 10.3356 21.6633C10.1595 21.4872 10.0605 21.2483 10.0605 20.9992C10.0605 20.7501 10.1595 20.5113 10.3356 20.3352L18.7348 11.9375H12.8755C12.6268 11.9375 12.3884 11.8387 12.2125 11.6629C12.0367 11.4871 11.938 11.2486 11.938 11C11.938 10.7514 12.0367 10.5129 12.2125 10.3371C12.3884 10.1613 12.6268 10.0625 12.8755 10.0625H21.0005C21.2491 10.0625 21.4876 10.1613 21.6634 10.3371C21.8392 10.5129 21.938 10.7514 21.938 11Z" fill="#EAF2FF" />
                                                </svg>
                                            </button>
                                        );
                                    }

                                    if (isInstalled) {
                                        // Nút "Mở" – primary style
                                        return (
                                            <button
                                                type="button"
                                                onClick={handleClick}
                                                className="inline-flex items-center gap-2 rounded-[40px] border border-[#899CFD] bg-[#0375F3] px-2 py-2 text-sm font-semibold text-white shadow-none transition-all duration-200 hover:bg-[#0A7FFF] hover:shadow-[0_8px_20px_rgba(3,117,243,0.3)] active:scale-95"
                                            >
                                                <span className="pl-[12px]">Mở</span>
                                                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <rect width="32" height="32" rx="16" fill="white" />
                                                    <path d="M21.938 11V19.125C21.938 19.3736 21.8392 19.6121 21.6634 19.7879C21.4876 19.9637 21.2491 20.0625 21.0005 20.0625C20.7518 20.0625 20.5134 19.9637 20.3375 19.7879C20.1617 19.6121 20.063 19.3736 20.063 19.125V13.2656L11.6637 21.6633C11.4876 21.8394 11.2487 21.9383 10.9997 21.9383C10.7506 21.9383 10.5117 21.8394 10.3356 21.6633C10.1595 21.4872 10.0605 21.2483 10.0605 20.9992C10.0605 20.7501 10.1595 20.5113 10.3356 20.3352L18.7348 11.9375H12.8755C12.6268 11.9375 12.3884 11.8387 12.2125 11.6629C12.0367 11.4871 11.938 11.2486 11.938 11C11.938 10.7514 12.0367 10.5129 12.2125 10.3371C12.3884 10.1613 12.6268 10.0625 12.8755 10.0625H21.0005C21.2491 10.0625 21.4876 10.1613 21.6634 10.3371C21.8392 10.5129 21.938 10.7514 21.938 11Z" fill="#206AFF" />
                                                </svg>
                                            </button>
                                        );
                                    }

                                    return null;
                                })()}
                            </div>

                        </div>
                    </div>

                    {/* ==== close button ==== */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-shrink-0 size-[36px] rounded-full bg-white flex items-center justify-center hover:bg-slate-100 transition-colors"
                        aria-label="Đóng"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M16.2887 14.962C16.4649 15.1381 16.5638 15.377 16.5638 15.626C16.5638 15.8751 16.4649 16.114 16.2887 16.2901C16.1126 16.4662 15.8737 16.5652 15.6247 16.5652C15.3756 16.5652 15.1367 16.4662 14.9606 16.2901L10.0005 11.3284L5.03874 16.2885C4.86262 16.4647 4.62374 16.5636 4.37467 16.5636C4.1256 16.5636 3.88673 16.4647 3.71061 16.2885C3.53449 16.1124 3.43555 15.8736 3.43555 15.6245C3.43555 15.3754 3.53449 15.1365 3.71061 14.9604L8.67233 10.0003L3.71217 5.03854C3.53605 4.86242 3.43711 4.62355 3.43711 4.37448C3.43711 4.12541 3.53605 3.88654 3.71217 3.71042C3.88829 3.53429 4.12716 3.43535 4.37624 3.43535C4.62531 3.43535 4.86418 3.53429 5.0403 3.71042L10.0005 8.67213L14.9622 3.70963C15.1383 3.53351 15.3772 3.43457 15.6262 3.43457C15.8753 3.43457 16.1142 3.53351 16.2903 3.70963C16.4664 3.88575 16.5654 4.12462 16.5654 4.3737C16.5654 4.62277 16.4664 4.86164 16.2903 5.03776L11.3286 10.0003L16.2887 14.962Z" fill="#1C252E" />
                        </svg>
                    </button>
                </div>

                {/* ==== content ===== */}
                <div>
                    {/* ==== tab ===== */}

                    <div className="flex gap-8 w-full border-b border-b-[#D0D5DD]">
                        <button
                            type="button"
                            onClick={() => setActiveTab('intro')}
                            className={[
                                'h-11 px-2 border-b-2 -mb-[1px]',
                                'font-deca text-[16px] leading-6 text-center',
                                activeTab === 'intro' ? 'border-b-[#0375F3] text-[#0375F3] font-medium' : 'border-b-transparent text-[#9295A4] font-normal hover:text-[#0375F3]',
                            ].join(' ')}
                        >
                            Giới thiệu
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('guide')}
                            className={[
                                'h-11 px-2 border-b-2 -mb-[1px]',
                                'font-deca text-[16px] leading-6 text-center',
                                activeTab === 'guide' ? 'border-b-[#0375F3] text-[#0375F3] font-medium' : 'border-b-transparent text-[#9295A4] font-normal hover:text-[#0375F3]',
                            ].join(' ')}
                        >
                            Hướng dẫn
                        </button>
                    </div>

                    {/* ==== tab content ===== */}
                    <div className="pt-2"></div>

                    <Customscrollbar className="pt-2 2xl:pt-6 h-[356px]">
                        {activeTab === 'intro' ? (
                            <div
                                ref={introMeasureRef}
                                className="font-deca font-normal text-[14px] leading-5 tracking-[0] text-[#141522]"
                                dangerouslySetInnerHTML={{ __html: formatHtml(introduce || content) }}
                            />
                        ) : (
                            <div
                                ref={guideMeasureRef}
                                className="font-deca font-normal text-[14px] leading-5 tracking-[0] text-[#141522]"
                                dangerouslySetInnerHTML={{ __html: formatHtml(directing || 'Hướng dẫn') }}
                            />
                        )}
                    </Customscrollbar>
                </div>
            </div>

        </Popup>
    );
}

