import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Lexend_Deca } from '@next/font/google';
import ProgressBar from '@/components/common/progress/ProgressBar';
import Popup from './Popup';
import { useGetInstallStatus } from '@/managers/api/parcel/useInstallParcel';

const deca = Lexend_Deca({
    subsets: ['latin'],
    weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export default function PopupProcessInstall({ isOpen, onClose, onComplete, data: dataProp, closeOnBackdropClick = true }) {
    const [isUpdate, setIsUpdate] = useState(false);
    const [percentUpdate, setPercentUpdate] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const startedRef = useRef(false);

    // Gọi API kiểm tra trạng thái cài đặt parcel khi popup mở
    const { data: _ } = useGetInstallStatus({
        enabled: isOpen,
    });



    const handleUpdate = () => {
        setIsComplete(false);
        setPercentUpdate(0);
        setIsUpdate(true);

        let percentUpdateTemp = 0;
        const interval = window.setInterval(() => {
            percentUpdateTemp += 5;
            setPercentUpdate(percentUpdateTemp);

            if (percentUpdateTemp >= 100) {
                window.clearInterval(interval);
                setIsComplete(true);
                setIsUpdate(false);
                window.setTimeout(() => {
                    onClose?.();
                    onComplete?.();
                }, 700);
            }
        }, 400);
    };

    useEffect(() => {
        if (!isOpen) {
            startedRef.current = false;
            setIsUpdate(false);
            setIsComplete(false);
            setPercentUpdate(0);
            return;
        }

        if (startedRef.current) return;
        startedRef.current = true;
        handleUpdate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    return (
        <Popup
            isOpen={isOpen}
            onClose={onClose}
            ariaLabel="Cập nhật phiên bản"
            panelClassName="!p-0 !bg-transparent !shadow-none !w-auto"
            closeOnBackdropClick={closeOnBackdropClick}
        >
            {/* UI lấy từ PopupUpdateNewVersion.jsx (95-159) */}
            <div className="">
                <div
                    style={{
                        boxShadow: `0px 20px 40px -8px rgba(16, 24, 40, 0.1)`,
                    }}
                    className={`bg-[#ffffff] pb-8 pt-[105px] px-[64px] rounded-2xl w-fit h-fit max-w-[570px] relative flex flex-col gap-y-8 ${deca.className} items-center justify-center`}
                >
                    <div className="absolute top-0  -translate-y-1/2 select-none">
                        <Image
                            alt="rocket"
                            src="/popup/rocket.gif"
                            width={600}
                            height={600}
                            quality={100}
                            className="h-[130px] w-[140px] select-none"
                            style={{ transform: "rotate(-45deg)" }}
                            draggable={false}
                            unoptimized={true}
                        />
                    </div>

                    {/* title */}
                    <div className="w-full flex flex-col justify-center items-center gap-y-5">
                        <h3 className=" capitalize font-semibold text-[28px] text-typo-black-2 leading-9">
                            Vui lòng đợi trong giây lát, chúng tôi đang cài đặt tính năng <span className="font-bold text-typo-blue-3">lương sản lượng</span>
                        </h3>
                    </div>

                    <div className="flex flex-col items-start w-full h-fit gap-y-5">
                        <h3 className="text-typo-gray-1 font-medium text-base">Tiến trình cài đặt:</h3>
                        <ProgressBar percentUpdateVersion={percentUpdate} typeProgress="updateVersion" />
                    </div>

                    <div className="flex gap-3 w-full">
                        <div className="w-[32px] flex-shrink-0">
                            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M28.4137 10.0288L21.9713 3.58625C21.5951 3.21232 21.0867 3.00169 20.5562 3H11.4438C10.9133 3.00169 10.4049 3.21232 10.0288 3.58625L3.58625 10.0288C3.21232 10.4049 3.00169 10.9133 3 11.4438V20.5562C3.00169 21.0867 3.21232 21.5951 3.58625 21.9713L10.0288 28.4137C10.4049 28.7877 10.9133 28.9983 11.4438 29H20.5562C21.0867 28.9983 21.5951 28.7877 21.9713 28.4137L28.4137 21.9713C28.7877 21.5951 28.9983 21.0867 29 20.5562V11.4438C28.9983 10.9133 28.7877 10.4049 28.4137 10.0288ZM15 10C15 9.73478 15.1054 9.48043 15.2929 9.29289C15.4804 9.10536 15.7348 9 16 9C16.2652 9 16.5196 9.10536 16.7071 9.29289C16.8946 9.48043 17 9.73478 17 10V17C17 17.2652 16.8946 17.5196 16.7071 17.7071C16.5196 17.8946 16.2652 18 16 18C15.7348 18 15.4804 17.8946 15.2929 17.7071C15.1054 17.5196 15 17.2652 15 17V10ZM16 23C15.7033 23 15.4133 22.912 15.1666 22.7472C14.92 22.5824 14.7277 22.3481 14.6142 22.074C14.5006 21.7999 14.4709 21.4983 14.5288 21.2074C14.5867 20.9164 14.7296 20.6491 14.9393 20.4393C15.1491 20.2296 15.4164 20.0867 15.7074 20.0288C15.9983 19.9709 16.2999 20.0007 16.574 20.1142C16.8481 20.2277 17.0824 20.42 17.2472 20.6666C17.412 20.9133 17.5 21.2033 17.5 21.5C17.5 21.8978 17.342 22.2794 17.0607 22.5607C16.7794 22.842 16.3978 23 16 23Z" fill="#EE1E1E" />
                            </svg>
                        </div>

                        <p
                            className="font-deca font-medium text-[16px] leading-6 tracking-normal text-[#9295A4]"
                        >
                            Quá trình cập nhật có thể mất vài phút. Vui lòng không đóng ứng dụng hoặc tắt máy!
                        </p>
                    </div>

                </div>
            </div>
        </Popup>
    );
}

