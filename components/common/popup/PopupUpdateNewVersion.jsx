import apiVersionApplication from "@/Api/apiVersion/apiNewVersion";
import ProgressBar from "@/components/common/progress/ProgressBar";
import { SealCheckIcon } from "@/components/icons";
import useToast from "@/hooks/useToast";
import { Lexend_Deca } from "@next/font/google";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { twMerge } from "tailwind-merge";

const deca = Lexend_Deca({
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});
const PopupUpdateNewVersion = ({ version, setHasNewVersion }) => {
    const { version_current, version_new } = version ?? {};
    const [percentUpdate, setPercentUpdate] = useState(0);
    const [isUpdate, setIsUpdate] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [canRetry, setCanRetry] = useState(false);
    const isPausedRef = useRef(false); //state  ngưng lại để call api updateNewVersion

    const dispatch = useDispatch();
    const queryClient = useQueryClient();
    const showToat = useToast();

    const updateNewVersion = useMutation({
        mutationFn: () => {
            return apiVersionApplication.apiPostUpdateNewVersion();
        },
        retry: 10,
        retryDelay: 1000,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["versionApplication"] });
            isPausedRef.current = false;
        },
        onError: () => {
            isPausedRef.current = true;
            showToat("error", "Vui lòng thử cập nhật lại");
            setCanRetry(true); // cho phép hiện nút retry
        },
    });

    const handleUpdateNewVersion = () => {
        setIsUpdate(true);
    };

    useEffect(() => {
        setIsUpdate(false);
    }, [canRetry]);

    useEffect(() => {
        if (!isUpdate) return;
        let percentUpdateTemp = 0;
        const interval = setInterval(() => {
            // không tăng nếu API lỗi
            if (percentUpdateTemp >= 75 && isPausedRef.current) return;

            percentUpdateTemp += 5;
            setPercentUpdate(percentUpdateTemp);

            //load 75% thì gọi api
            if (percentUpdateTemp === 75) {
                // setIsProgressPaused(true)
                isPausedRef.current = true;
                updateNewVersion.mutate();
            }

            // Khi đạt 100% và đã xác nhận xong
            if (percentUpdateTemp >= 100) {
                clearInterval(interval);
                setIsComplete(true);
                setHasNewVersion(false)
            }
        }, 400);

        return () => clearInterval(interval);
    }, [isUpdate]);

    useEffect(() => {
        // tự động tắt popup khi hoàn thành cập nhật
        if (isComplete) {
            setTimeout(() => {
                dispatch({
                    type: "statePopupGlobal",
                    payload: { open: false },
                });
                showToat("success", "Cập nhật phiên bản thành công");
            }, 700);
        }
    }, [isComplete]);

    return (
        <div className="">
            <div
                style={{
                    boxShadow: `0px 20px 40px -8px rgba(16, 24, 40, 0.1)`,
                }}
                className={`bg-[#ffffff] pb-8 pt-[105px] px-[64px] rounded-2xl w-fit h-fit max-w-[570px] relative flex flex-col gap-y-8 ${deca.className} items-center justify-center`}
            >
                {/* title */}
                <div className="w-full flex flex-col justify-center items-center gap-y-5">
                    <h3 className="font-semibold text-[28px] text-typo-black-2 leading-9 text-center">
                        Cập nhật phiên bản mới{" "}
                        <span className="font-bold text-typo-blue-3">
                            v{version_new?.version ?? "1.0"}
                        </span>{" "}
                        - Trải nghiệm mượt hơn!
                    </h3>
                    <p className="font-medium text-base text-typo-gray-1 w-[70%] text-center">
                        Chúng tôi vừa phát hành Phiên bản{" "}
                        <span className="font-semibold text-typo-gray-2">
                            v{version_new?.version ?? "1.0"}
                        </span>{" "}
                        với nhiều cải tiến quan trọng:
                    </p>
                </div>

                {/* content */}
                <div className="flex flex-col rounded-2xl bg-background-blue-3 w-full h-fit gap-y-5 p-6">
                    {/* {children} */}
                    {version_new &&
                        version_new?.description.length > 0 &&
                        version_new?.description.map((item, index) => (
                            <div
                                className="flex flex-row gap-x-2 items-center justify-center"
                                key={index}
                            >
                                <SealCheckIcon />
                                <p className="flex-1 text-sm font-medium text-typo-gray-3">
                                    {item}
                                </p>
                            </div>
                        ))}
                </div>

                {isUpdate && (
                    <div className="flex flex-col items-start w-full h-fit gap-y-5">
                        <h3 className="text-typo-gray-1 font-medium text-base">
                            Tiến trình cập nhật:
                        </h3>
                        <ProgressBar
                            percentUpdateVersion={percentUpdate}
                            typeProgress="updateVersion"
                        />
                    </div>
                )}

                {/* button */}
                <button
                    className={twMerge(
                        "rounded-lg text-white bg-blue-fmrp py-[10px] px-[18px] w-fit border border-transparent transition-all duration-200 text-base font-normal",
                        isUpdate
                            ? "cursor-not-allowed disabled:hover:opacity-100 disabled:bg-gray-500/20 disabled:text-white disabled:border-transparent disabled:cursor-not-allowed disabled:pointer-events-auto"
                            : "hover:bg-white hover:text-blue-fmrp hover:border-blue-fmrp "
                    )}
                    onClick={() => {
                        handleUpdateNewVersion();
                    }}
                    disabled={isUpdate}
                >
                    {canRetry ? "Cập nhật lại" : "Cập nhật ngay"}
                </button>

                <div className="absolute top-0  -translate-y-1/2 select-none">
                    <Image
                        alt="rocket"
                        src="/popup/rocket.gif"
                        width={600}
                        height={600}
                        quality={100}
                        className="h-[130px] w-[140px] select-none"
                        draggable={false}
                        layout={"responsive"}
                        unoptimized={true}
                    />
                </div>
            </div>
        </div>
    );
};

export default PopupUpdateNewVersion;
