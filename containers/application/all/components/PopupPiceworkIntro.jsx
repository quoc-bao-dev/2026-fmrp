import React, { useLayoutEffect, useRef, useState } from 'react';
import Popup from './Popup';
import Image from 'next/image';

const IMAGE_CARD = '/application/card-1.png';
const IMAGE_PICEWORK_INTRO = '/application/picework-intro.png';


export default function PiceworkIntroPopup({ isOpen, onClose, onOpenPayment, closeOnBackdropClick = true }) {
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
            panelClassName="!bg-[#F7F9FC] !w-[min(1151px,calc(100vw-32px))] px-9 py-4 2xl:py-9 rounded-3xl gap-6"
            closeOnBackdropClick={closeOnBackdropClick}
        >
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
                                src={IMAGE_CARD}
                                alt="picework-intro"
                                width={137}
                                height={137}
                                className="w-full h-full object-contain"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <h2 className="font-deca font-semibold text-[20px] leading-7 tracking-[0] align-middle capitalize text-[#1C252E]">
                                Lương sản lượng
                            </h2>

                            <p className="font-deca font-normal text-[14px] leading-5 tracking-[0] text-[#1C252E]/70 max-w-[762px]">
                                Thống kê lương và giờ làm của công nhân dựa trên sản lượng thực tế, giúp doanh nghiệp tính lương chính xác, minh bạch và nhanh chóng.
                            </p>

                            <p className="font-deca font-medium text-[16px] leading-6 tracking-[0] text-[#0375F3] w-fit">
                                300.000 đ
                            </p>

                            <button
                                type="button"
                                onClick={onOpenPayment}
                                className="w-fit inline-flex items-center justify-center gap-1 rounded-[40px] border border-white/0 bg-[#0375F3] px-4 py-2 text-[14px] font-deca font-semibold text-white transition-all duration-200 hover:bg-[#0A7FFF] hover:shadow-[0_8px_20px_rgba(3,117,243,0.25)]"
                            >
                                Cài đặt ngay
                            </button>
                        </div>
                    </div>

                    {/* ==== close button ==== */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="size-[36px] rounded-full bg-white flex items-center justify-center hover:bg-slate-100 transition-colors"
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
                    <div className="pt-2 2xl:pt-6" style={tabMaxHeight ? { minHeight: tabMaxHeight } : undefined}>
                        {activeTab === 'intro' ? (
                            <>
                                <p className="font-deca font-normal text-[14px] leading-5 tracking-[0] text-[#141522]">
                                    Thống kê lương và giờ làm của công nhân dựa trên sản lượng thực tế, giúp doanh nghiệp tính lương chính xác, minh bạch và nhanh chóng.
                                </p>

                                <div className="pt-6">
                                    <div className="w-[520px] 2xl:w-[min(749px,100%)] rounded-lg overflow-hidden shadow-[-4px_4px_79.4px_0px_#00000026] bg-white">
                                        <Image
                                            src={IMAGE_PICEWORK_INTRO}
                                            alt="picework-intro"
                                            width={749}
                                            height={421}
                                            className="w-full h-auto object-contain"
                                            onLoad={measureTabHeights}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <p className="font-deca font-normal text-[14px] leading-5 tracking-[0] text-[#141522]">
                                Hướng dẫn
                            </p>
                        )}
                    </div>

                    {/* Hidden measurers to avoid layout jump when switching tabs */}
                    <div className="absolute -left-[99999px] top-0 w-[min(1151px,calc(100vw-32px))] opacity-0 pointer-events-none" aria-hidden="true">
                        <div ref={introMeasureRef} className="pt-6">
                            <p className="font-deca font-normal text-[14px] leading-5 tracking-[0] text-[#141522]">
                                Thống kê lương và giờ làm của công nhân dựa trên sản lượng thực tế, giúp doanh nghiệp tính lương chính xác, minh bạch và nhanh chóng.
                            </p>
                            <div className="pt-6">
                                <div className="w-[520px] 2xl:w-[min(749px,100%)] rounded-lg overflow-hidden shadow-[-4px_4px_79.4px_0px_#00000026] bg-white">
                                    <Image
                                        src={IMAGE_PICEWORK_INTRO}
                                        alt="picework-intro-measure"
                                        width={749}
                                        height={421}
                                        className="w-full h-auto object-contain"
                                        onLoad={measureTabHeights}
                                    />
                                </div>
                            </div>
                        </div>
                        <div ref={guideMeasureRef} className="pt-6">
                            <p className="font-deca font-normal text-[14px] leading-5 tracking-[0] text-[#141522]">Hướng dẫn</p>
                        </div>
                    </div>
                </div>
            </div>

        </Popup>
    );
}

