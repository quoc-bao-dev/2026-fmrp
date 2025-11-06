import PopupCustom from "@/components/UI/popup";
import useToast from "@/hooks/useToast";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { v4 } from "uuid";
import ButtonSubmit from "../button/buttonSubmit";

const PopupUpdateVersion = (props) => {
    const { dataLang } = props

    const isShow = useToast()

    const dispatch = useDispatch();

    const [isSubmitted, setIsSubmitted] = useState(false);

    const statePopupUpdateVersion = useSelector((state) => state.statePopupUpdateVersion);

    const { register, handleSubmit, formState: { errors }, setValue, control, watch, reset } = useForm();

    const onSubmit = () => {
        setIsSubmitted(true);
        setTimeout(() => {
            dispatch({ type: "statePopupUpdateVersion", payload: { open: false } });
            setIsSubmitted(false);
        }, 4000);
    };

    // useEffect(() => {
    //     setTimeout(() => {
    //         dispatch({ type: "statePopupUpdateVersion", payload: { open: true } });
    //     }, 4000);
    // }, [])

    const data = [
        {
            id: v4(),
            name: 'Tăng tốc hiệu suất, giúp thao tác nhanh và mượt hơn.'
        },
        {
            id: v4(),
            name: 'Giao diện tối ưu, trực quan và dễ sử dụng hơn.'
        },
        {
            id: v4(),
            name: 'Bổ sung tính năng mới: [Mô tả ngắn về tính năng mới].'
        },
        {
            id: v4(),
            name: 'Sửa lỗi & nâng cấp bảo mật, đảm bảo hệ thống ổn định và an toàn hơn'
        }
    ]

    return (
        <PopupCustom
            title={''}
            open={statePopupUpdateVersion.open}
            onClose={() => {
                dispatch({ type: "statePopupUpdateVersion", payload: { open: false } });
                setIsSubmitted(false);
            }}
            type={"popupUpdateVersion"}
            lockScroll={true}
            closeOnDocumentClick={false}
            className='popup-updated-version'
        >
            <div className='w-[500px] h-fit bg-white rounded-xl relative px-[40px] pb-2'>

                <div className="flex items-center justify-center h-full pt-[56px]">
                    {
                        isSubmitted
                            ?
                            <div className="">
                                <div className="flex flex-col gap-4">
                                    <h3 className="text-[#101828] font-semibold text-[28px] text-left capitalize">
                                        Vui lòng đợi trong giây lát, chúng tôi đang nâng cấp hệ thống để mang lại trải nghiệm tốt hơn cho bạn!
                                    </h3>
                                    <p className="text-[#9295A4] font-medium text-base text-center max-w-[70%]">
                                        Tiến trình cập nhật:
                                    </p>
                                </div>
                            </div>
                            :
                            <div className="relative flex flex-col items-center justify-center gap-4">
                                <div className="h-[110] w-[122px] absolute -top-1/2 translate-y-[85%] left-1/2 -translate-x-1/2">
                                    <Image
                                        src={isSubmitted ? '/icon/roketCenter.png' : '/icon/roketRight.png'}
                                        alt=""
                                        width={1280}
                                        height={1024}
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <h3 className="text-[#101828] font-semibold text-[28px] text-center capitalize">
                                        Cập nhật phiên bản mới v3.0 - Trải nghiệm mượt hơn!
                                    </h3>
                                    <p className="text-[#9295A4] font-medium text-base text-center max-w-[70%]">
                                        Chúng tôi vừa phát hành Phiên bản v3.0 với nhiều cải tiến quan trọng:
                                    </p>
                                </div>
                                <div className="bg-[#EBF5FF] rounded-2xl p-6 flex flex-col gap-3">
                                    {
                                        data?.map(e => {
                                            return (
                                                <div className="flex items-center gap-2" key={e?.id}>
                                                    <div className="h-[21px] w-[21px] min-w-[21px]">
                                                        <Image
                                                            src={'/icon/check.png'}
                                                            alt=""
                                                            width={1280}
                                                            height={1024}
                                                            className="object-cover w-full h-full"
                                                        />
                                                    </div>
                                                    <div className="text-[#3A3E4C] font-medium text-sm">
                                                        {e.name}
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                </div>
                                <ButtonSubmit
                                    onClick={() => onSubmit()}
                                    title='Cập nhật ngay'
                                    className='text-base font-normal w-fit rounded-[8px]'
                                />
                            </div>
                    }
                </div>
            </div>
        </PopupCustom>
    );
};

export default PopupUpdateVersion;
