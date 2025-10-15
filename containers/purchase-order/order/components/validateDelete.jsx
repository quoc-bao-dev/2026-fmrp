import apiOrder from "@/Api/apiPurchaseOrder/apiOrder";
import TrashIcon from "@/components/icons/common/TrashIcon";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import NoData from "@/components/UI/noData/nodata";
import PopupCustom from "@/components/UI/popup";
import { WARNING_STATUS_ROLE } from "@/constants/warningStatus/warningStatus";
import useActionRole from "@/hooks/useRole";
import useToast from "@/hooks/useToast";
import { useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { useSelector } from "react-redux";

const PopupTableValidateDelete = (props) => {
    const _ToggleModal = (e) => props.handleQueryId({ status: e });

    const { is_admin: role, permissions_current: auth } = useSelector((state) => state.auth);

    const { checkDelete, checkEdit } = useActionRole(auth, props?.type);

    const isShow = useToast()

    useEffect(() => {
        props.isOpenValidate && _HandleDelete();
    }, [props.isOpenValidate]);

    const _HandleDelete = async () => {
        try {
            const { isSuccess, message } = await apiOrder.apiDeleteOrder(props?.id)
            if (isSuccess) {
                isShow("success", props.dataLang[message] || message);
                props.onRefresh && props.onRefresh();
            } else {
                isShow("error", props.dataLang[message] || message);
            }
        } catch (error) { }
        props.handleQueryId({ status: false });
    };

    return (
        <>
            <PopupCustom
                title={props.dataLang?.purchase_order_title || "purchase_order_title"}
                button={
                    <div
                        onClick={() => {
                            if (role || checkDelete) {
                                _ToggleModal(true)
                            } else {
                                isShow("error", WARNING_STATUS_ROLE);
                            }
                        }}
                        className="group transition-all ease-in-out flex items-center justify-center text-left cursor-pointer w-full rounded-lg p-1 gap-2 2xl:text-sm xl:text-sm text-[8px] hover:bg-red-02 border border-transparent hover:border-red-01"
                        data-tooltip-id="delete-tooltip"
                        data-tooltip-content="Xóa phiếu"
                        >
                            <TrashIcon
                                color="#EE1E1E"
                                className="size-5 transition-all duration-300"
                            />
                    </div>}
                open={props.isOpen && props.data?.payment_code?.length > 0}
                onClose={_ToggleModal.bind(this, false)}
                classNameBtn={props?.className}
            >
                <div className="flex items-center space-x-4 my-2 border-[#E7EAEE] border-opacity-70 border-b-[1px]"></div>
                <div className=" space-x-5 w-[400px]  h-500px ">
                    <div>
                        <div className="w-[400px]">
                            <div className="min:h-[170px] h-[72%] max:h-[100px]  customsroll overflow-auto pb-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                                <h2 className="font-normal bg-[#ECF0F4] p-2 text-[13px]">
                                    {props?.dataLang?.purchase_order_detail_general_informatione || "purchase_order_detail_general_informatione"}
                                </h2>
                                <div className="w-[100%] lx:w-[110%] ">
                                    <div className="grid grid-cols-12 sticky top-0 bg-slate-100  z-10">
                                        <h4 className="text-[13px] px-2 text-[#667085] uppercase col-span-2 font-[400] text-center">
                                            {"#"}
                                        </h4>
                                        <h4 className="text-[13px] px-2 text-[#667085] uppercase col-span-10 font-[400] text-center">
                                            {"Mã phiếu chi"}
                                        </h4>
                                    </div>
                                    {props.data?.payment_code?.length > 0 ? (
                                        <>
                                            <Customscrollbar
                                                className="min-h-[90px] max-h-[170px] 2xl:max-h-[250px]"
                                            >
                                                <div className="divide-y divide-slate-200 min:h-[200px] h-[100%] max:h-[300px]">
                                                    {props.data?.payment_code?.map((e, index) => (
                                                        <div
                                                            className="grid items-center grid-cols-12 py-1.5 px-2 hover:bg-slate-100/40 "
                                                            key={e.id?.toString()}
                                                        >
                                                            <h6 className="text-[13px] px-2  py-0.5 col-span-2  rounded-md text-center ">
                                                                {index + 1}
                                                            </h6>
                                                            <h6 className="text-[13px]   py-0.5 col-span-10 rounded-md text-center ">
                                                                {e}
                                                            </h6>
                                                        </div>
                                                    ))}
                                                </div>
                                            </Customscrollbar>
                                        </>
                                    ) : (
                                        <NoData />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </PopupCustom>
        </>
    );
};
export default PopupTableValidateDelete;
