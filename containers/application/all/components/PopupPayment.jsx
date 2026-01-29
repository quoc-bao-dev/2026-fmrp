import React, { useEffect, useState } from 'react';
import Popup from './Popup';

const IMAGE_PAYMENT_INFO = '/application/payment-info.png';
const IMAGE_BANK = '/application/bank.png';

export default function PopupPayment({ isOpen, onClose, onPaymentSuccess, closeOnBackdropClick = true }) {
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        if (!isOpen) {
            setCountdown(10);
            return;
        }

        setCountdown(10);

        const intervalId = window.setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    window.clearInterval(intervalId);
                    onPaymentSuccess?.();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [isOpen, onPaymentSuccess]);

    return (
        <Popup
            isOpen={isOpen}
            onClose={onClose}
            ariaLabel="Thanh toán tính năng"
            panelClassName="!bg-[#F7F9FC] !w-[min(1149px,calc(100vw-32px))] px-9 py-4 2xl:py-9 rounded-3xl gap-6"
            closeOnBackdropClick={closeOnBackdropClick}
        >
            {/* ==== header ===== */}
            <div className="flex items-start justify-between gap-6 pb-3 border-b border-b-[#919EAB33]">

                <div className="flex items-center gap-2">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M25.9992 18C26.0018 18.4077 25.8779 18.8062 25.6446 19.1407C25.4114 19.4751 25.0802 19.729 24.6967 19.8675L18.2405 22.2425L15.8655 28.6938C15.7248 29.0758 15.4704 29.4056 15.1364 29.6385C14.8025 29.8714 14.4051 29.9963 13.998 29.9963C13.5908 29.9963 13.1935 29.8714 12.8595 29.6385C12.5256 29.4056 12.2711 29.0758 12.1305 28.6938L9.74922 22.25L3.29672 19.875C2.91463 19.7344 2.58488 19.4799 2.35195 19.146C2.11903 18.812 1.99414 18.4147 1.99414 18.0075C1.99414 17.6003 2.11903 17.203 2.35195 16.869C2.58488 16.5351 2.91463 16.2806 3.29672 16.14L9.75297 13.765L12.128 7.31375C12.2686 6.93166 12.5231 6.60191 12.857 6.36898C13.191 6.13606 13.5883 6.01117 13.9955 6.01117C14.4026 6.01117 14.8 6.13606 15.1339 6.36898C15.4679 6.60191 15.7223 6.93166 15.863 7.31375L18.238 13.77L24.6892 16.145C25.0721 16.2815 25.4035 16.533 25.638 16.8651C25.8724 17.1971 25.9986 17.5935 25.9992 18ZM18.9992 6H20.9992V8C20.9992 8.26522 21.1046 8.51957 21.2921 8.70711C21.4797 8.89464 21.734 9 21.9992 9C22.2644 9 22.5188 8.89464 22.7063 8.70711C22.8939 8.51957 22.9992 8.26522 22.9992 8V6H24.9992C25.2644 6 25.5188 5.89464 25.7063 5.70711C25.8939 5.51957 25.9992 5.26522 25.9992 5C25.9992 4.73478 25.8939 4.48043 25.7063 4.29289C25.5188 4.10536 25.2644 4 24.9992 4H22.9992V2C22.9992 1.73478 22.8939 1.48043 22.7063 1.29289C22.5188 1.10536 22.2644 1 21.9992 1C21.734 1 21.4797 1.10536 21.2921 1.29289C21.1046 1.48043 20.9992 1.73478 20.9992 2V4H18.9992C18.734 4 18.4797 4.10536 18.2921 4.29289C18.1046 4.48043 17.9992 4.73478 17.9992 5C17.9992 5.26522 18.1046 5.51957 18.2921 5.70711C18.4797 5.89464 18.734 6 18.9992 6ZM29.9992 10H28.9992V9C28.9992 8.73478 28.8939 8.48043 28.7063 8.29289C28.5188 8.10536 28.2644 8 27.9992 8C27.734 8 27.4797 8.10536 27.2921 8.29289C27.1046 8.48043 26.9992 8.73478 26.9992 9V10H25.9992C25.734 10 25.4797 10.1054 25.2921 10.2929C25.1046 10.4804 24.9992 10.7348 24.9992 11C24.9992 11.2652 25.1046 11.5196 25.2921 11.7071C25.4797 11.8946 25.734 12 25.9992 12H26.9992V13C26.9992 13.2652 27.1046 13.5196 27.2921 13.7071C27.4797 13.8946 27.734 14 27.9992 14C28.2644 14 28.5188 13.8946 28.7063 13.7071C28.8939 13.5196 28.9992 13.2652 28.9992 13V12H29.9992C30.2644 12 30.5188 11.8946 30.7063 11.7071C30.8939 11.5196 30.9992 11.2652 30.9992 11C30.9992 10.7348 30.8939 10.4804 30.7063 10.2929C30.5188 10.1054 30.2644 10 29.9992 10Z" fill="#0375F3" />
                    </svg>

                    <h2 className="font-deca font-semibold text-[24px] leading-8 tracking-[0] align-middle text-[#25387A]">
                        Thanh toán tính năng
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

            {/* ==== content ===== */}
            <div className="pt-0 2xl:pt-6">
                <div className="flex gap-6 justify-between">

                    {/* ===== left content ===== */}
                    <div className="w-[475px]">
                        <h2 className="font-deca font-semibold text-[20px] leading-7 tracking-[0] align-middle text-[#1C252E]">
                            Thông tin tính năng
                        </h2>

                        <div className="pt-4">
                            <p className="font-deca font-normal text-[14px] leading-5 tracking-[0] text-[#637381]">
                                Tên tính năng
                            </p>

                            <h3 className="pt-1 font-deca font-medium text-[18px] leading-7 tracking-[0] text-[#1C252E]">
                                Lương sản lượng
                            </h3>
                        </div>

                        <div className="pt-4">
                            <p className="font-deca font-normal text-[14px] leading-5 tracking-[0] text-[#637381]">
                                Đơn giá
                            </p>

                            <h3 className="pt-1 font-deca font-medium text-[18px] leading-7 tracking-[0] text-[#1C252E]">
                                300.000 đ
                            </h3>
                        </div>

                        <div className="pt-9">
                            <div className="pt-6 border-t border-t-[#919EAB3D]">
                                <div className="flex justify-between items-center">
                                    <p className="font-deca font-medium text-[16px] leading-5 tracking-[0] text-[#637381]">
                                        Số tiền cần thanh toán
                                    </p>

                                    <p className="font-deca font-bold text-[24px] leading-8 tracking-[0] align-middle text-[#0375F3]">
                                        300.000 đ
                                    </p>
                                </div>
                            </div>

                            {/* countdown mock payment */}
                            <p className="pt-4 font-deca text-sm text-[#637381]">
                                Đang kiểm tra thanh toán...{' '}
                                <span className="font-semibold text-[#0375F3]">
                                    {countdown > 0 ? `${countdown}s` : 'Hoàn tất'}
                                </span>
                            </p>
                        </div>
                    </div>

                    <div className="self-stretch w-px bg-[#919EAB3D]" />

                    {/* ===== right content ===== */}
                    <div className="w-[475px]">
                        <div className="">
                            <h2
                                className="font-deca font-semibold text-[20px] leading-7 tracking-[0] align-middle text-[#1C252E]"
                            >
                                Thông tin chuyển khoản
                            </h2>

                            <div className="pt-2 2xl:pt-[36px]">
                                <div
                                    className=" h-[150px] 2xl:h-[200px] w-full flex items-center justify-center"
                                >
                                    <img
                                        src={IMAGE_PAYMENT_INFO}
                                        alt="QR thanh toán"
                                        className="max-h-full max-w-full object-contain"
                                    />
                                </div>

                                <div className="pt-2 2xl:pt-9">
                                    {/* bank info */}
                                    <div className="flex gap-3">
                                        {/* image */}
                                        <div
                                            className="w-12 h-12 flex items-center justify-center"
                                        >
                                            <img
                                                src={IMAGE_BANK}
                                                alt="Ngân hàng"
                                                className="w-full h-full object-contain"
                                            />
                                        </div>

                                        <div className="">
                                            <h3
                                                className="font-deca font-semibold text-[18px] leading-7 tracking-[0] text-[#1C252E]"
                                            >
                                                MB Bank
                                            </h3>

                                            <p
                                                className="pt-1 font-deca font-normal text-[14px] leading-5 tracking-[0] text-[#637381]"
                                            >
                                                Ngân hàng quân đội - Chi nhánh TP HCM
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 2xl:gap-4 mt-6">
                                        <div className="">
                                            <h4
                                                className=" font-deca font-normal text-[14px] leading-5 tracking-[0] text-[#637381]"
                                            >
                                                Số tài khoản
                                            </h4>

                                            <div className="pt-2 flex justify-between">
                                                <p
                                                    className="font-deca font-medium text-[18px] leading-7 tracking-[0] text-[#1C252E]"
                                                >
                                                    881688
                                                </p>

                                                <div
                                                    className="cursor-pointer rounded-full p-1 hover:bg-slate-100 transition-colors"
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M5 9.16699C5 6.80997 5 5.63146 5.73223 4.89923C6.46447 4.16699 7.64298 4.16699 10 4.16699H12.5C14.857 4.16699 16.0355 4.16699 16.7678 4.89923C17.5 5.63146 17.5 6.80997 17.5 9.16699V13.3337C17.5 15.6907 17.5 16.8692 16.7678 17.6014C16.0355 18.3337 14.857 18.3337 12.5 18.3337H10C7.64298 18.3337 6.46447 18.3337 5.73223 17.6014C5 16.8692 5 15.6907 5 13.3337V9.16699Z" stroke="#637381" stroke-width="1.5" />
                                                        <path d="M5 15.8337C3.61929 15.8337 2.5 14.7144 2.5 13.3337V8.33366C2.5 5.19096 2.5 3.61961 3.47631 2.6433C4.45262 1.66699 6.02397 1.66699 9.16667 1.66699H12.5C13.8807 1.66699 15 2.78628 15 4.16699" stroke="#637381" stroke-width="1.5" />
                                                    </svg>

                                                </div>
                                            </div>
                                        </div>

                                        <div className="">
                                            <h4
                                                className="font-deca font-normal text-[14px] leading-5 tracking-[0] text-[#637381]"
                                            >
                                                Tên chủ tài khoản
                                            </h4>

                                            <div className="pt-2 flex justify-between">
                                                <p
                                                    className="font-deca font-medium text-[18px] leading-7 tracking-[0] text-[#1C252E]"
                                                >
                                                    COng ty TNHH cong nghe FOSO
                                                </p>

                                                <div
                                                    className="cursor-pointer rounded-full p-1 hover:bg-slate-100 transition-colors"
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M5 9.16699C5 6.80997 5 5.63146 5.73223 4.89923C6.46447 4.16699 7.64298 4.16699 10 4.16699H12.5C14.857 4.16699 16.0355 4.16699 16.7678 4.89923C17.5 5.63146 17.5 6.80997 17.5 9.16699V13.3337C17.5 15.6907 17.5 16.8692 16.7678 17.6014C16.0355 18.3337 14.857 18.3337 12.5 18.3337H10C7.64298 18.3337 6.46447 18.3337 5.73223 17.6014C5 16.8692 5 15.6907 5 13.3337V9.16699Z" stroke="#637381" stroke-width="1.5" />
                                                        <path d="M5 15.8337C3.61929 15.8337 2.5 14.7144 2.5 13.3337V8.33366C2.5 5.19096 2.5 3.61961 3.47631 2.6433C4.45262 1.66699 6.02397 1.66699 9.16667 1.66699H12.5C13.8807 1.66699 15 2.78628 15 4.16699" stroke="#637381" stroke-width="1.5" />
                                                    </svg>

                                                </div>
                                            </div>
                                        </div>

                                        <div className="">
                                            <h4
                                                className="font-deca font-normal text-[14px] leading-5 tracking-[0] text-[#637381]"
                                            >
                                                Nội dung chuyển khoản
                                            </h4>

                                            <div className="pt-2 flex justify-between">
                                                <p
                                                    className="font-deca font-medium text-[18px] leading-7 tracking-[0] text-[#1C252E]"
                                                >
                                                    JQKA268
                                                </p>

                                                <div
                                                    className="cursor-pointer rounded-full p-1 hover:bg-slate-100 transition-colors"
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M5 9.16699C5 6.80997 5 5.63146 5.73223 4.89923C6.46447 4.16699 7.64298 4.16699 10 4.16699H12.5C14.857 4.16699 16.0355 4.16699 16.7678 4.89923C17.5 5.63146 17.5 6.80997 17.5 9.16699V13.3337C17.5 15.6907 17.5 16.8692 16.7678 17.6014C16.0355 18.3337 14.857 18.3337 12.5 18.3337H10C7.64298 18.3337 6.46447 18.3337 5.73223 17.6014C5 16.8692 5 15.6907 5 13.3337V9.16699Z" stroke="#637381" stroke-width="1.5" />
                                                        <path d="M5 15.8337C3.61929 15.8337 2.5 14.7144 2.5 13.3337V8.33366C2.5 5.19096 2.5 3.61961 3.47631 2.6433C4.45262 1.66699 6.02397 1.66699 9.16667 1.66699H12.5C13.8807 1.66699 15 2.78628 15 4.16699" stroke="#637381" stroke-width="1.5" />
                                                    </svg>

                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2 2xl:pt-6 ">
                                    <div className="flex gap-2">
                                        <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M10 3.875C8.39303 3.875 6.82214 4.35152 5.486 5.24431C4.14985 6.1371 3.10844 7.40605 2.49348 8.8907C1.87852 10.3753 1.71762 12.009 2.03112 13.5851C2.34463 15.1612 3.11846 16.6089 4.25476 17.7452C5.39106 18.8815 6.8388 19.6554 8.4149 19.9689C9.99099 20.2824 11.6247 20.1215 13.1093 19.5065C14.594 18.8916 15.8629 17.8502 16.7557 16.514C17.6485 15.1779 18.125 13.607 18.125 12C18.1227 9.84581 17.266 7.78051 15.7427 6.25727C14.2195 4.73403 12.1542 3.87727 10 3.875ZM10 18.875C8.64026 18.875 7.31105 18.4718 6.18046 17.7164C5.04987 16.9609 4.16868 15.8872 3.64833 14.6309C3.12798 13.3747 2.99183 11.9924 3.2571 10.6588C3.52238 9.32513 4.17716 8.10013 5.13864 7.13864C6.10013 6.17716 7.32514 5.52237 8.65876 5.2571C9.99238 4.99183 11.3747 5.12798 12.631 5.64833C13.8872 6.16868 14.9609 7.04987 15.7164 8.18045C16.4718 9.31104 16.875 10.6403 16.875 12C16.8729 13.8227 16.1479 15.5702 14.8591 16.8591C13.5702 18.1479 11.8227 18.8729 10 18.875ZM11.25 15.75C11.25 15.9158 11.1842 16.0747 11.0669 16.1919C10.9497 16.3092 10.7908 16.375 10.625 16.375C10.2935 16.375 9.97554 16.2433 9.74112 16.0089C9.5067 15.7745 9.375 15.4565 9.375 15.125V12C9.20924 12 9.05027 11.9342 8.93306 11.8169C8.81585 11.6997 8.75 11.5408 8.75 11.375C8.75 11.2092 8.81585 11.0503 8.93306 10.9331C9.05027 10.8158 9.20924 10.75 9.375 10.75C9.70652 10.75 10.0245 10.8817 10.2589 11.1161C10.4933 11.3505 10.625 11.6685 10.625 12V15.125C10.7908 15.125 10.9497 15.1908 11.0669 15.3081C11.1842 15.4253 11.25 15.5842 11.25 15.75ZM8.75 8.5625C8.75 8.37708 8.80499 8.19582 8.908 8.04165C9.01101 7.88748 9.15743 7.76732 9.32874 7.69636C9.50004 7.62541 9.68854 7.60684 9.8704 7.64301C10.0523 7.67919 10.2193 7.76848 10.3504 7.89959C10.4815 8.0307 10.5708 8.19775 10.607 8.3796C10.6432 8.56146 10.6246 8.74996 10.5536 8.92127C10.4827 9.09257 10.3625 9.23899 10.2084 9.342C10.0542 9.44502 9.87292 9.5 9.6875 9.5C9.43886 9.5 9.20041 9.40123 9.02459 9.22541C8.84878 9.0496 8.75 8.81114 8.75 8.5625Z" fill="#637381" />
                                        </svg>
                                        <p
                                            className="font-deca font-normal text-[16px] leading-6 tracking-[0] align-middle text-[#637381]"
                                        >
                                            Vui lòng quét mã QR thanh toán trên bằng ứng dụng ngân hàng để thực hiện việc nâng cấp gói.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Popup >
    );
}

