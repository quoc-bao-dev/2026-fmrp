import Image from 'next/image';
import React from 'react';
import { DropdownAvatar } from '@/components/layout/header';
import ApplicationSearchInput from './ApplicationSearchInput';

const IMAGE_APPLICATION = '/application/background-image-2.png';
const IMAGE_LOGO = '/application/logo.png';

export default function ApplicationLayout({ children }) {
    return <div className='min-h-screen relative'>

        <div className="absolute inset-x-0 -top-16 w-full overflow-hidden">
            <Image
                src={IMAGE_APPLICATION}
                className="w-full object-cover"
                alt="background-image"
                width={2000}
                height={2000}
                priority
            />
        </div>

        {/* ===== Header ===== */}
        <div className="relative z-50 flex items-center justify-between px-6 py-4">
            {/* LOGO */}
            <Image src={IMAGE_LOGO}
                className="w-[107.51844787597656px] h-[41.56865310668945px] object-contain"
                alt="logo" width={200} height={80} />

            {/* NAVIGATION */}
            <div className="flex items-center gap-5">

                {/* button home */}
                <button
                    type="button"
                    className="flex items-center gap-1 px-2 py-1 rounded-[31px] bg-white/70 backdrop-blur-sm transition-shadow hover:shadow-[0px_4px_13.6px_0px_rgba(3,117,243,0.28)]"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.0305 1.89292C12.752 1.62962 12.3833 1.48291 12 1.48291C11.6167 1.48291 11.248 1.62962 10.9695 1.89292L3.7035 8.75992C3.48102 8.97045 3.30387 9.22419 3.1829 9.50559C3.06194 9.78699 2.9997 10.0901 3 10.3964V18.7514C3.0004 19.3479 3.23763 19.9198 3.65954 20.3414C4.08145 20.7631 4.65352 20.9999 5.25 20.9999H7.5C8.09674 20.9999 8.66903 20.7629 9.09099 20.3409C9.51295 19.919 9.75 19.3467 9.75 18.7499V14.9999C9.75 14.801 9.82902 14.6102 9.96967 14.4696C10.1103 14.3289 10.3011 14.2499 10.5 14.2499H13.5C13.6989 14.2499 13.8897 14.3289 14.0303 14.4696C14.171 14.6102 14.25 14.801 14.25 14.9999V18.7499C14.25 19.3467 14.4871 19.919 14.909 20.3409C15.331 20.7629 15.9033 20.9999 16.5 20.9999H18.75C19.3467 20.9999 19.919 20.7629 20.341 20.3409C20.7629 19.919 21 19.3467 21 18.7499V10.3949C20.9999 10.0888 20.9373 9.78585 20.8161 9.50472C20.6949 9.22359 20.5176 8.97015 20.295 8.75992L13.0305 1.89292Z" fill="#003DA0" />
                    </svg>

                    <p
                        className="font-medium text-base leading-10 tracking-[-0.006em] text-[#003DA0] capitalize"
                    >
                        Trang quản lý
                    </p>
                </button>

                {/* DROPDOWN AVATAR */}
                <DropdownAvatar />
            </div>
        </div>

        <div className="relative z-50 px-6">
            <h1 className="pt-6 text-center font-bold text-[36px] leading-10 tracking-normal text-[#1D293D]">
                <span className="text-[#0375F3]">Ứng dụng từ FMRP </span>
                Giải pháp tối ưu cho doanh nghiệp
            </h1>

            <div className="pt-8 flex justify-center">
                <ApplicationSearchInput />
            </div>
            {children}
        </div>

    </div>;
}

