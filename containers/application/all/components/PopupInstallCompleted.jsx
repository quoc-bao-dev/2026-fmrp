import React from 'react';
import Image from 'next/image';
import Popup from './Popup';
import { useApplicationInstall } from '@/context/application/ApplicationInstallContext';


const IMAGE_INSTALL_COMPLETED = '/application/install-complete.png';
export default function PopupInstallCompleted({ isOpen, onClose, onStart, closeOnBackdropClick = true }) {
    const { featureName } = useApplicationInstall();
    return (
        <Popup
            isOpen={isOpen}
            onClose={onClose}
            ariaLabel="Cài đặt hoàn tất"
            panelClassName="!p-0 !bg-transparent !shadow-none !w-auto"
            closeOnBackdropClick={closeOnBackdropClick}
        >
            <div
                className={[
                    'relative flex flex-col items-center justify-start text-center',
                    'bg-white rounded-2xl shadow-[0px_20px_40px_-8px_rgba(16,24,40,0.10)]',
                    'w-[min(600px,calc(100vw-32px))] h-[383px]-',
                    'gap-[20px] pt-[180px] pr-[64px] pb-[32px] pl-[64px]',
                ].join(' ')}
            >
                {/* image: width 292; height 273.7 */}
                <div className="absolute top-[25px] left-1/2 -translate-x-1/2 -translate-y-1/2 select-none">
                    <Image
                        src={IMAGE_INSTALL_COMPLETED}
                        alt="install-complete"
                        width={292}
                        height={274}
                        className="w-[292px] h-[274px] object-contain"
                        priority
                        unoptimized
                        draggable={false}
                    />
                </div>

                <h2 className="font-deca font-semibold text-[28px] leading-[35px] tracking-[0] text-[#101828] text-center capitalize">
                    Cài đặt hoàn tất!
                </h2>

                <p className="font-deca font-medium text-[22px] leading-6 tracking-[0] text-[#667085] text-center">
                    Tính năng <span className="text-[#0375F3]">{featureName || 'Lương Sản Lượng'}</span>
                    {' '}đã sẵn sàng để sử dụng
                </p>

                <div className="flex justify-center w-full">
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 rounded-[40px] border border-[#899CFD] bg-[#0375F3] px-2 py-2 text-sm font-semibold text-white shadow-none transition-all duration-200 hover:bg-[#0A7FFF] hover:shadow-[0_8px_20px_rgba(3,117,243,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                        onClick={onStart || onClose}
                    >
                        <span className="pl-[12px]">Bắt đầu trải nghiệm</span>
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="32" height="32" rx="16" fill="white" />
                            <path d="M21.938 11V19.125C21.938 19.3736 21.8392 19.6121 21.6634 19.7879C21.4876 19.9637 21.2491 20.0625 21.0005 20.0625C20.7518 20.0625 20.5134 19.9637 20.3375 19.7879C20.1617 19.6121 20.063 19.3736 20.063 19.125V13.2656L11.6637 21.6633C11.4876 21.8394 11.2487 21.9383 10.9997 21.9383C10.7506 21.9383 10.5117 21.8394 10.3356 21.6633C10.1595 21.4872 10.0605 21.2483 10.0605 20.9992C10.0605 20.7501 10.1595 20.5113 10.3356 20.3352L18.7348 11.9375H12.8755C12.6268 11.9375 12.3884 11.8387 12.2125 11.6629C12.0367 11.4871 11.938 11.2486 11.938 11C11.938 10.7514 12.0367 10.5129 12.2125 10.3371C12.3884 10.1613 12.6268 10.0625 12.8755 10.0625H21.0005C21.2491 10.0625 21.4876 10.1613 21.6634 10.3371C21.8392 10.5129 21.938 10.7514 21.938 11Z" fill="#206AFF" />
                        </svg>
                    </button>
                </div>
            </div>
        </Popup>
    );
}

