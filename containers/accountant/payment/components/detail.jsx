import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import TagBranch from "@/components/UI/common/Tag/TagBranch";
import { TagColorMore, TagColorOrange, TagColorRed, TagColorSky } from "@/components/UI/common/Tag/TagStatus";
import CustomAvatar from "@/components/UI/common/user/CustomAvatar";
import Loading from "@/components/UI/loading/loading";
import NoData from "@/components/UI/noData/nodata";
import PopupCustom from "@/components/UI/popup";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import useSetingServer from "@/hooks/useConfigNumber";
import { formatMoment } from "@/utils/helpers/formatMoment";
import formatMoneyConfig from "@/utils/helpers/formatMoney";
import React, { useState } from "react";
import { usePaymentDetail } from "../hooks/usePaymentDetail";
import { ColumnTablePopup, HeaderTablePopup } from "@/components/UI/common/TablePopup";


const PopupDetail = (props) => {
    const dataSeting = useSetingServer()
    const [open, sOpen] = useState(false);
    const _ToggleModal = (e) => sOpen(e);
    const formatNumber = (number) => {
        return formatMoneyConfig(+number, dataSeting)
    };
    const { data, isLoading } = usePaymentDetail(open, props?.id)

    return (
        <PopupCustom
            title={props.dataLang?.payment_detail || "payment_detail"}
            button={props?.name}
            onClickOpen={_ToggleModal.bind(this, true)}
            open={open}
            onClose={_ToggleModal.bind(this, false)}
            classNameBtn={props?.className}
        >
            <div className="flex items-center mb-2 border-b border-gray-100"></div>
            <div className="w-[50vw] h-auto">
                <div className="w-full">
                    <Customscrollbar className="max-h-[85vh]">
                        {/* Phần thông tin chi tiết */}
                        <div className="rounded-lg overflow-hidden border border-gray-100 shadow-sm mb-3">
                            <h2 className="font-semibold bg-blue-50 p-3 text-[14px] text-blue-700 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {props.dataLang?.import_detail_info || "import_detail_info"}
                            </h2>
                            <div className="px-4 py-3 bg-white">
                                <div className="grid grid-cols-4 gap-4 max-h-[300px] overflow-auto px-1">
                                    {/* <div className="col-span-1 space-y-3"> */}
                                        <div className="flex flex-col">
                                            <span className="text-[12px] text-gray-500">
                                                {props.dataLang?.import_day_vouchers || "import_day_vouchers"}
                                            </span>
                                            <span className="text-[14px] font-medium">
                                                {data?.date != null ? formatMoment(data?.date, FORMAT_MOMENT.DATE_SLASH_LONG) : ""}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[12px] text-gray-500">
                                                {props.dataLang?.payment_creator || "payment_creator"}
                                            </span>
                                            <div className="flex items-center mt-1">
                                                <CustomAvatar fullName={data?.staff_name} profileImage={data?.profile_image} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[12px] text-gray-500">
                                                {props.dataLang?.payment_obType || "payment_obType"}
                                            </span>
                                            <div className="flex items-center mt-1">
                                                {
                                                    (data?.objects === "client" && (<TagColorSky name={props.dataLang[data?.objects] || data?.objects} />))
                                                    ||
                                                    (data?.objects === "supplier" && (<TagColorOrange name={props.dataLang[data?.objects] || data?.objects} />))
                                                    ||
                                                    (data?.objects === "other" && (<TagColorRed name={props.dataLang[data?.objects] || data?.objects} />))
                                                }
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[12px] text-gray-500">
                                                {props.dataLang?.payment_typeOfDocument || "payment_typeOfDocument"}
                                            </span>
                                            <div className="flex items-center mt-1">
                                                {
                                                    (data?.type_vouchers === "import" && (<TagColorMore color={'#a855f7'} backgroundColor={"#e9d5ff"} name={props.dataLang[data?.type_vouchers] || data?.type_vouchers} />))
                                                    ||
                                                    (data?.type_vouchers === "deposit" && (<TagColorMore color={'#06b6d4'} backgroundColor={"#a5f3fc"} name={props.dataLang[data?.type_vouchers] || data?.type_vouchers} />))
                                                    ||
                                                    (data?.type_vouchers === "service" && (<TagColorRed name={props.dataLang[data?.type_vouchers] || data?.type_vouchers} />))
                                                    ||
                                                    (data?.type_vouchers === "order" && (<TagColorMore color={'#22c55e'} backgroundColor={'#bbf7d0'} name={props.dataLang[data?.type_vouchers] || data?.type_vouchers} />))
                                                }
                                            </div>
                                        </div>
                                    {/* </div> */}
                                    {/* <div className="col-span-1 space-y-3"> */}
                                        <div className="flex flex-col">
                                            <span className="text-[12px] text-gray-500">
                                                {props.dataLang?.payment_code || "payment_code"}
                                            </span>
                                            <span className="text-[14px] font-medium text-blue-600">
                                                {data?.code}
                                            </span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[12px] text-gray-500">
                                                {props.dataLang?.payment_TT_method || "payment_TT_method"}
                                            </span>
                                            <span className="text-[14px] font-medium">{data?.payment_mode_name}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[12px] text-gray-500">
                                                {props.dataLang?.payment_ob || "payment_ob"}
                                            </span>
                                            <span className="text-[14px] font-medium">{data?.object_text}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[12px] text-gray-500">{"Chi nhánh"}</span>
                                            <div className="mt-1">
                                                <TagBranch className="w-fit">
                                                    {data?.branch_name}
                                                </TagBranch>
                                            </div>
                                        </div>
                                    {/* </div> */}
                                </div>
                                <div className="border-t border-gray-100 mt-3 pt-3">
                                    <span className="text-[12px] text-gray-500 block mb-1">
                                        {props.dataLang?.payment_voucherCode || "payment_voucherCode"}
                                    </span>
                                    <div className="flex flex-wrap gap-2 font-medium">
                                        {data?.voucher?.map((code, index) => (
                                            <span key={code?.id} className="px-2 py-1 bg-gray-50 rounded-md text-[13px] border border-gray-200">
                                                {code.code}
                                                {index !== data?.voucher.length - 1 ? "" : ""}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Phần khấu trừ tiền cọc */}
                        {data?.type_vouchers == "import" && data.tbDeductDeposit?.length > 0 && (
                            <div className="rounded-lg overflow-hidden border border-gray-100 shadow-sm mb-3">
                                <div className="grid grid-cols-4 bg-gray-50 border-b">
                                    <div className="px-3 py-2 text-[13px] font-medium text-gray-600 text-center border-r">
                                        {props.dataLang?.payment_numberEnterd || "payment_numberEnterd"}
                                    </div>
                                    <div className="px-3 py-2 text-[13px] font-medium text-gray-600 text-center border-r">
                                        {props.dataLang?.payment_numberSlips || "payment_numberSlips"}
                                    </div>
                                    <div className="px-3 py-2 text-[13px] font-medium text-gray-600 text-center border-r">
                                        {props.dataLang?.payment_deductionMoney || "payment_deductionMoney"}
                                    </div>
                                    <div className="px-3 py-2 text-[13px] font-medium text-gray-600 text-center">
                                        {props.dataLang?.payment_cashInReturn || "payment_cashInReturn"}
                                    </div>
                                </div>
                                <div className="bg-white">
                                    <Customscrollbar className={`${data.tbDeductDeposit.length > 3 ? "max-h-[150px]" : ""}`}>
                                        {data.tbDeductDeposit.map((e, index) => (
                                            <div key={index} className="grid grid-cols-4 border-b hover:bg-gray-50 transition-colors">
                                                <div className="p-2 text-center">
                                                    <span className="px-2 py-1 inline-block text-purple-600 bg-purple-100 rounded-lg text-xs font-medium">
                                                        {e.import_code}
                                                    </span>
                                                </div>
                                                <div className="p-2 text-center">
                                                    <span className="px-2 py-1 inline-block text-orange-600 bg-orange-100 rounded-lg text-xs font-medium">
                                                        {e.payslip_code}
                                                    </span>
                                                </div>
                                                <div className="p-2 text-center text-sm">
                                                    {formatNumber(e.deposit_amount)}
                                                </div>
                                                <div className="p-2 text-center text-sm">
                                                    {formatNumber(e.amount_left)}
                                                </div>
                                            </div>
                                        ))}
                                    </Customscrollbar>
                                </div>
                            </div>
                        )}

                        {/* Phần thông tin chi phí */}
                        <div className="rounded-lg overflow-hidden border border-gray-100 shadow-sm mb-3">
                            <h2 className="font-semibold bg-blue-50 p-3 text-[14px] text-blue-700 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {props.dataLang?.payment_costInfo || "payment_costInfo"}
                            </h2>
                            <div className="bg-white">
                                <HeaderTablePopup gridCols={5} className="!rounded-none !bg-gray-50">
                                    <ColumnTablePopup>
                                        #
                                    </ColumnTablePopup>
                                    <ColumnTablePopup colSpan={2}>
                                        {props.dataLang?.payment_costs || "payment_costs"}
                                    </ColumnTablePopup>
                                    <ColumnTablePopup colSpan={2}>
                                        {props.dataLang?.payment_amountOfMoney || "payment_amountOfMoney"}
                                    </ColumnTablePopup>
                                </HeaderTablePopup>
                                {isLoading ? (
                                    <Loading className="max-h-28" color="#0f4f9e" />
                                ) : data?.detail?.length > 0 ? (
                                    <Customscrollbar className="max-h-[200px]">
                                        <div className="divide-y divide-gray-100">
                                            {data?.detail?.map((e, index) => (
                                                <div
                                                    className="grid grid-cols-5 hover:bg-gray-50 transition-colors"
                                                    key={e.id?.toString()}
                                                >
                                                    <div className="col-span-1 py-3 text-center">
                                                        <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-medium">
                                                            {index + 1}
                                                        </span>
                                                    </div>
                                                    <div className="col-span-2 py-3 pl-2 text-[13px] text-gray-700">
                                                        {e?.costs_name}
                                                    </div>
                                                    <div className="col-span-2 py-3 text-center text-[13px] font-medium">
                                                        {formatNumber(e?.total)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Customscrollbar>
                                ) : <NoData />}
                            </div>
                        </div>

                        {/* Phần tổng số tiền và ghi chú */}
                        <div className="rounded-lg overflow-hidden border border-gray-100 shadow-sm">
                            <h2 className="font-semibold bg-blue-50 p-3 text-[14px] text-blue-700 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                {props.dataLang?.purchase_total || "purchase_total"}
                            </h2>
                            <div className="bg-white p-4">
                                <div className="grid grid-cols-12 gap-4">
                                    <div className="col-span-7">
                                        <span className="text-[13px] text-gray-500 block mb-2">
                                            {props.dataLang?.import_from_note || "import_from_note"}
                                        </span>
                                        <textarea
                                            className="w-full p-3 min-h-[80px] text-[13px] bg-gray-50 border border-gray-200 rounded-lg resize-none outline-none"
                                            disabled
                                            value={data?.note}
                                        />
                                    </div>
                                    <div className="col-span-5">
                                        <div className="bg-gray-50 p-4 rounded-lg h-full flex flex-col justify-center">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[13px] text-gray-600 font-medium">
                                                    {props.dataLang?.import_detail_total_amount || "import_detail_total_amount"}
                                                </span>
                                                <span className="text-[18px] font-bold text-blue-600">
                                                    {formatNumber(data?.total)} <span className="underline">đ</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Customscrollbar>
                </div>
            </div>
        </PopupCustom>
    );
};

export default PopupDetail;
