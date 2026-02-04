import React from 'react';
import Image from 'next/image';
import Popup from './Popup';
import { useApplicationInstall } from '@/context/application/ApplicationInstallContext';

export default function PopupPaymentSuccess({ isOpen, onClose, closeOnBackdropClick = true }) {
    const { paymentResult, featureName } = useApplicationInstall();

    return (
        <Popup isOpen={isOpen} onClose={onClose} ariaLabel="Thanh toán thành công" panelClassName="!bg-[#F9FAFC] !w-[min(821px,calc(100vw-32px))] px-6 2xl:px-9 py-6 2xl:py-9 rounded-3xl gap-6" closeOnBackdropClick={closeOnBackdropClick}>
            {/* Header */}
            <Header onClose={onClose} />

            {/* Content */}
            <div className="w-full max-h-[80vh] flex flex-col items-center justify-center gap-3 2xl:gap-6 pt-4 2xl:pt-9 font-deca">
                <div className="">
                    <Image
                        width={323}
                        height={250}
                        src={"/popup/commandCompleted.webp"}
                        alt="commandCompleted"
                        className="object-cover w-[270px] 2xl:w-[323px]"
                        priority
                        unoptimized
                    />
                </div>
                <div className="flex gap-4 w-full">
                    <div className="p-3 py-2 2xl:py-3 rounded-xl border border-[#919EAB3D] w-full">
                        <h3 className="text-lg font-medium text-[#637381]">
                            Ngày mua hàng:
                        </h3>
                        <p className="text-lg font-medium text-[#1C252E]">
                            {paymentResult?.date_create || '--'}
                        </p>
                    </div>
                    <div className="p-3 py-2 2xl:py-3 rounded-xl border border-[#919EAB3D] w-full">
                        <h3 className="text-lg font-medium text-[#637381]">
                            Mã đơn hàng:
                        </h3>
                        <p className="text-lg font-medium text-[#003DA0]">
                            {paymentResult?.code || '--'}
                        </p>
                    </div>
                </div>
                <p className="text-base 2xl:text-lg font-normal text-[#637381] "
                    style={{
                        fontFamily: "'Lexend Deca', sans-serif",
                        fontWeight: 400,
                        fontStyle: "normal",
                        fontSize: "16px",
                        lineHeight: "28px",
                        letterSpacing: "0%",
                    }}
                >
                    🎉 Cảm ơn bạn đã tin tưởng sử dụng tính năng{' '}
                    <span className="text-[#003DA0]">{featureName || 'Lương sản lượng'}</span>
                    <br className='py-6' />
                    Bạn có thể tải về hóa đơn ngay tại đây hoặc kiểm tra email đã đăng ký
                    tài khoản để xem chi tiết.
                    <br /> Nếu cần hỗ trợ thêm trong quá trình sử dụng, đừng ngần ngại
                    liên hệ{" "}
                    <a href="https://zalo.me/fososoft" target="_blank" className="text-[#0375F3] underline">bộ phận CSKH</a> của
                    chúng tôi. Đội ngũ FMRP luôn sẵn sàng đồng hành cùng bạn!
                </p>
                <div className="w-full">
                    <p className="text-base 2xl:text-lg font-normal text-[#1C252E]"
                        style={{
                            fontFamily: "'Lexend Deca', sans-serif",
                            fontWeight: 500,
                            fontStyle: "normal",
                            fontSize: "16px",
                            lineHeight: "24px",
                            letterSpacing: "0%",
                        }}
                    >
                        Trân trọng, <br />
                        Đội ngũ FMRP <br /> Quản lý xưởng dễ dàng hơn bao giờ hết.
                    </p>
                </div>
                <div className="flex justify-center">
                    <button
                        type="button"
                        className="h-[60px] inline-flex items-center justify-center gap-3 rounded-[12px] px-5 py-4 text-[18px] leading-7 font-medium text-white font-deca bg-[linear-gradient(170.14deg,#1FC583_5.11%,#1F9285_95.28%)] shadow-[0_10px_24px_rgba(31,197,131,0.22)] transition-all duration-200 hover:-translate-y-[1px] hover:brightness-[1.02] hover:shadow-[0_14px_30px_rgba(31,197,131,0.30)] active:translate-y-0 active:brightness-[0.98] focus:outline-none"
                    >
                        Tải về hoá đơn
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M23.2434 11.6737C23.0728 7.26937 19.4128 3.75 15.0056 3.75C13.4725 3.75024 11.9697 4.17718 10.6655 4.98303C9.36129 5.78888 8.30709 6.94183 7.62094 8.31281C7.05066 9.44941 6.75249 10.703 6.75 11.9747C6.75294 12.1679 6.68282 12.3551 6.55367 12.4989C6.42453 12.6426 6.24587 12.7323 6.05344 12.75C5.95055 12.7573 5.84724 12.7434 5.74999 12.709C5.65273 12.6746 5.56362 12.6205 5.48821 12.5502C5.41281 12.4798 5.35273 12.3946 5.31175 12.2999C5.27076 12.2053 5.24974 12.1032 5.25 12C5.24921 10.951 5.41827 9.90874 5.75063 8.91375C5.77252 8.84995 5.77681 8.78143 5.76303 8.7154C5.74925 8.64937 5.71791 8.58828 5.67232 8.53856C5.62674 8.48885 5.56858 8.45235 5.50399 8.43292C5.4394 8.41348 5.37077 8.41182 5.30531 8.42813C4.00577 8.75203 2.8517 9.50083 2.02639 10.5556C1.20107 11.6104 0.751828 12.9107 0.75 14.25C0.75 17.5491 3.53906 20.25 6.84375 20.25H15C16.1105 20.2488 17.2094 20.0236 18.2309 19.588C19.2524 19.1523 20.1755 18.5151 20.9451 17.7145C21.7147 16.9139 22.3149 15.9662 22.7098 14.9283C23.1047 13.8904 23.2862 12.7834 23.2434 11.6737ZM17.7806 15.5306L14.7806 18.5306C14.711 18.6004 14.6283 18.6557 14.5372 18.6934C14.4462 18.7312 14.3486 18.7506 14.25 18.7506C14.1514 18.7506 14.0538 18.7312 13.9628 18.6934C13.8717 18.6557 13.789 18.6004 13.7194 18.5306L10.7194 15.5306C10.5786 15.3899 10.4996 15.199 10.4996 15C10.4996 14.801 10.5786 14.6101 10.7194 14.4694C10.8601 14.3286 11.051 14.2496 11.25 14.2496C11.449 14.2496 11.6399 14.3286 11.7806 14.4694L13.5 16.1897V10.5C13.5 10.3011 13.579 10.1103 13.7197 9.96967C13.8603 9.82902 14.0511 9.75 14.25 9.75C14.4489 9.75 14.6397 9.82902 14.7803 9.96967C14.921 10.1103 15 10.3011 15 10.5V16.1897L16.7194 14.4694C16.8601 14.3286 17.051 14.2496 17.25 14.2496C17.449 14.2496 17.6399 14.3286 17.7806 14.4694C17.9214 14.6101 18.0004 14.801 18.0004 15C18.0004 15.199 17.9214 15.3899 17.7806 15.5306Z" fill="white" />
                        </svg>

                    </button>

                </div>
            </div>
        </Popup>
    );
}


const Header = ({ onClose }) => (
    <div className="flex items-center justify-between">
        <div className="w-[32px]"></div>
        <div className="flex items-center gap-3">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M30.4172 11.3634L14.3659 27.4134C14.1802 27.5991 13.9597 27.7465 13.717 27.847C13.4744 27.9476 13.2143 27.9993 12.9516 27.9993C12.6889 27.9993 12.4288 27.9476 12.1861 27.847C11.9434 27.7465 11.7229 27.5991 11.5372 27.4134L2.5847 18.4134C2.21029 18.0384 2 17.5302 2 17.0003C2 16.4704 2.21029 15.9621 2.5847 15.5871L5.5847 12.5871C5.95848 12.2132 6.4651 12.0026 6.99378 12.0012C7.52245 11.9998 8.03018 12.2077 8.40595 12.5796L12.9859 16.9884L12.9997 17.0021L24.5909 5.58088C24.9658 5.20761 25.4732 4.99805 26.0022 4.99805C26.5312 4.99805 27.0386 5.20761 27.4134 5.58088L30.4134 8.52588C30.6008 8.71151 30.7495 8.93236 30.8512 9.17571C30.9528 9.41907 31.0053 9.68012 31.0057 9.94385C31.006 10.2076 30.9542 10.4688 30.8532 10.7124C30.7522 10.956 30.604 11.1772 30.4172 11.3634Z" fill="url(#paint0_linear_15801_93763)" />
                <defs>
                    <linearGradient id="paint0_linear_15801_93763" x1="6.61389" y1="-5.19373" x2="21.9462" y2="48.2824" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#1FC583" />
                        <stop offset="1" stopColor="#1F9285" />
                    </linearGradient>
                </defs>
            </svg>

            <h2 className="font-deca font-semibold text-[24px] leading-8 tracking-[0] align-middle text-[#25387A]">
                Thanh toán thành công!
            </h2>
        </div>
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
);