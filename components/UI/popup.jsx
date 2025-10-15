import { PopupParent } from "@/utils/lib/Popup";
import { Lexend_Deca } from "@next/font/google";
import { Add as IconClose } from "iconsax-react";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import 'simplebar-react/dist/simplebar.min.css';
import { twMerge } from "tailwind-merge";

const deca = Lexend_Deca({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
});

const Popup = (props) => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch({ type: "statePopupParent", payload: props.open });
    }, [props.open])
    return (
        <React.Fragment>
            <button className={props.classNameBtn} onClick={props.onClickOpen} >
                {props.button}
            </button>
            <PopupParent
                open={props.open}
                closeOnDocumentClick={props?.closeOnDocumentClick || false}
                onClose={props.onClose}
                lockScroll={props.lockScroll}
                repositionOnResiz
                // repositionOnResiz={props.repositionOnResiz}
                className={`${props.className} popup-edit`}
            >
                <div 
                    onClick={(e) => e.stopPropagation()}
                    className={`${deca.className} bg-[#ffffff] p-4 shadow-xl rounded-xl w-full ${props?.classNameModeltime}`}
                >
                    <div className={`${props.classNameTittle ? props.classNameTittle : "items-center"} flex justify-between`}>
                        <div className={`flex items-center gap-4 w-full ${props?.classNameTittle}`}>
                            <div className="text-[#101828] font-medium !text-base !capitalize w-full">
                                {props.title}
                            </div>
                        </div>

                        {
                            (props?.type || !props.onClose)
                                ?
                                ""
                                :
                                <button
                                    onClick={props.onClose}
                                    className={twMerge(`flex flex-col items-center justify-center transition rounded-full outline-none w-7 h-7 bg-slate-200 hover:opacity-80 hover:scale-105 ${props?.classNameIconClose}`)}
                                >
                                    <IconClose className="rotate-45 size-full" />
                                </button>
                        }
                    </div>

                    {props.children}

                </div>
            </PopupParent>
        </React.Fragment>
    );
};

export default Popup;
