import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import { ColumnTablePopup, GeneralInformation, HeaderTablePopup } from "@/components/UI/common/TablePopup";
import TagBranch from "@/components/UI/common/Tag/TagBranch";
import { TagColorLime, TagColorOrange, TagColorSky } from "@/components/UI/common/Tag/TagStatus";
import CustomAvatar from "@/components/UI/common/user/CustomAvatar";
import Loading from "@/components/UI/loading/loading";
import NoData from "@/components/UI/noData/nodata";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import useSetingServer from "@/hooks/useConfigNumber";
import { formatMoment } from "@/utils/helpers/formatMoment";
import formatMoneyConfig from "@/utils/helpers/formatMoney";
import formatNumberConfig from "@/utils/helpers/formatnumber";
import ExpandableContent from "components/UI/more";
import { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { useServiceVoucherDetail } from "../hooks/useServiceVoucherDetail";
import PopupCustom from "/components/UI/popup";

const PopupDetail = (props) => {
    const [open, sOpen] = useState(false);

    const _ToggleModal = (e) => sOpen(e);

    const dataSeting = useSetingServer();

    const formatNumber = (number) => {
        return formatNumberConfig(+number, dataSeting);
    }

    const formatMoney = (number) => {
        return formatMoneyConfig(+number, dataSeting);
    }

    const { data, isFetching } = useServiceVoucherDetail(open, props?.id);


    return (
        <>
            <PopupCustom
                title={props.dataLang?.serviceVoucher_service_voucher_details || "serviceVoucher_service_voucher_details"}
                button={props?.name}
                onClickOpen={_ToggleModal.bind(this, true)}
                open={open}
                onClose={_ToggleModal.bind(this, false)}
                classNameBtn={props?.className}
            >
                <div className="flex items-center space-x-4 my-2 border-[#E7EAEE] border-opacity-70 border-b-[1px]"></div>
                <div className=" space-x-5 w-[999px]  2xl:h-auto xl:h-auto h-[650px] ">
                    <div>
                        <div className="w-[999px]">
                            <Customscrollbar className="min:h-[170px] h-[72%] max:h-[100px]">
                                <GeneralInformation  {...props} />
                                <div className="grid grid-cols-8  min-h-[100px] px-2">
                                    <div className="col-span-3">
                                        <div className="grid grid-cols-2 my-4 font-semibold">
                                            <h3 className=" text-[13px] ">
                                                {props.dataLang?.serviceVoucher_day_vouchers || "serviceVoucher_day_vouchers"}
                                            </h3>
                                            <h3 className=" text-[13px]  font-medium">
                                                {data?.date != null ? formatMoment(data?.date, FORMAT_MOMENT.DATE_SLASH_LONG) : ""}
                                            </h3>
                                        </div>
                                        <div className="grid items-center grid-cols-2 my-2 font-medium">
                                            <h3 className=" text-[13px] ">
                                                {props?.dataLang?.production_warehouse_creator || "production_warehouse_creator"}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                {/* <div className="relative">
                                                    <ImageErrors
                                                        src={data?.staff_create?.profile_image}
                                                        width={25}
                                                        height={25}
                                                        defaultSrc="/user-placeholder.jpg"
                                                        alt="Image"
                                                        className="object-cover min-w-6 max-w-6 min-h-6 max-h-6 h-6 w-6 rounded-[100%] text-left cursor-pointer"
                                                    />
                                                    <span className="h-2 w-2 absolute 3xl:bottom-full 3xl:translate-y-[150%] 3xl:left-1/2  3xl:translate-x-[100%] 2xl:bottom-[80%] 2xl:translate-y-full 2xl:left-1/2 bottom-[50%] left-1/2 translate-x-full translate-y-full">
                                                        <span className="relative inline-flex w-2 h-2 rounded-full bg-lime-500">
                                                            <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-lime-400"></span>
                                                        </span>
                                                    </span>
                                                </div>
                                                <h6 className="capitalize">
                                                    {
                                                        data?.staff_create?.full_name
                                                    }
                                                </h6> */}
                                                <CustomAvatar
                                                    data={data}
                                                    fullName={data?.staff_create?.full_name}
                                                    profileImage={data?.staff_create?.profile_image}
                                                />
                                            </div>
                                        </div>{" "}
                                        <div className="grid grid-cols-2 my-4 font-semibold">
                                            <h3 className=" text-[13px] ">
                                                {props.dataLang?.serviceVoucher_voucher_code || "serviceVoucher_voucher_code"}
                                            </h3>
                                            <h3 className=" text-[13px]  font-medium text-blue-600">
                                                {data?.code}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="col-span-2 mx-auto">
                                        <div className="my-4 font-semibold text-[13px]">
                                            {props.dataLang?.serviceVoucher_status_of_spending || "serviceVoucher_status_of_spending"}
                                        </div>
                                        <div className="flex flex-wrap items-center justify-center gap-2">
                                            {(data?.status_pay === "not_spent" && (
                                                <TagColorSky className={'!py-1'} name={"Chưa chi"} />
                                            )) ||
                                                (data?.status_pay === "spent_part" && (
                                                    <TagColorOrange name={`Chi 1 phần ${formatNumber(data?.amount_paid)}`} />
                                                )) ||
                                                (data?.status_pay === "spent" && (
                                                    <TagColorLime className={'!py-1'} name={"Đã chi đủ"} />
                                                ))}
                                        </div>
                                    </div>

                                    <div className="col-span-3 ">
                                        <div className="grid grid-cols-2 my-4 font-semibold">
                                            <h3 className="text-[13px] ">
                                                {props.dataLang?.purchase_order_table_supplier || "purchase_order_table_supplier"}
                                            </h3>
                                            <h3 className="text-[13px] font-medium ">
                                                {data?.supplier_name}
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-2 my-4 font-semibold">
                                            <h3 className="text-[13px]">
                                                {props.dataLang?.purchase_order_table_branch || "purchase_order_table_branch"}
                                            </h3>
                                            <TagBranch className=" w-fit">
                                                {data?.branch_name}
                                            </TagBranch>
                                        </div>
                                    </div>
                                </div>
                                <div className=" w-[100%] ">
                                    <HeaderTablePopup gridCols={12}>
                                        <ColumnTablePopup colSpan={2} textAlign={"left"}>
                                            {props.dataLang?.serviceVoucher_services_arising || "serviceVoucher_services_arising"}
                                        </ColumnTablePopup>
                                        <ColumnTablePopup>
                                            {/* {props.dataLang?.serviceVoucher_quantity ||
                          "serviceVoucher_quantity"} */}
                                            {"SL"}
                                        </ColumnTablePopup>
                                        <ColumnTablePopup>
                                            {props.dataLang?.serviceVoucher_unit_price || "serviceVoucher_unit_price"}
                                        </ColumnTablePopup>
                                        <ColumnTablePopup>
                                            {"% CK"}
                                        </ColumnTablePopup>
                                        <ColumnTablePopup colSpan={2} >
                                            {props.dataLang?.import_from_price_affter || "import_from_price_affter"}
                                        </ColumnTablePopup>
                                        <ColumnTablePopup>
                                            {props.dataLang?.serviceVoucher_tax || "serviceVoucher_tax"}
                                        </ColumnTablePopup>
                                        <ColumnTablePopup colSpan={2} >
                                            {props.dataLang?.serviceVoucher_into_money || "serviceVoucher_into_money"}
                                        </ColumnTablePopup>
                                        <ColumnTablePopup colSpan={2}>
                                            {props.dataLang?.serviceVoucher_note || "serviceVoucher_note"}
                                        </ColumnTablePopup>
                                    </HeaderTablePopup>
                                    {isFetching ? (
                                        <Loading
                                            className="max-h-28"
                                            color="#0f4f9e"
                                        />
                                    ) : data?.item?.length > 0 ? (
                                        <>
                                            <Customscrollbar className="min-h-[90px] max-h-[170px] 2xl:max-h-[250px] overflow-hidden">
                                                <div className="divide-y divide-slate-200 min:h-[300px] h-[100%] max:h-[400px]">
                                                    {data?.item?.map((e) => (
                                                        <div
                                                            className="grid items-center grid-cols-12 py-1.5 px-2 hover:bg-slate-100/40 "
                                                            key={e.id?.toString()}
                                                        >
                                                            <h6 className="text-[13px]  px-2 py-0.5 col-span-2  font-medium text-left">
                                                                {e?.name}
                                                            </h6>
                                                            <h6 className="text-[13px]  px-2 py-0.5 col-span-1  font-medium text-center">
                                                                {formatNumber(e?.quantity)}
                                                            </h6>
                                                            <h6 className="text-[13px]  px-2 py-0.5 col-span-1  font-medium text-center">
                                                                {formatMoney(e?.price)}
                                                            </h6>
                                                            <h6 className="text-[13px]  px-2 py-0.5 col-span-1  font-medium text-center">
                                                                {e?.discount_percent + "%"}
                                                            </h6>
                                                            <h6 className="text-[13px]  px-2 py-0.5 col-span-2  font-medium text-center">
                                                                {formatMoney(e?.price_after_discount)}
                                                            </h6>
                                                            <h6 className="text-[13px]  px-2 py-0.5 col-span-1  font-medium text-center">
                                                                {formatMoney(e?.tax_rate) + "%"}
                                                            </h6>
                                                            <h6 className="text-[13px]  px-2 py-0.5 col-span-2  font-medium text-right">
                                                                {formatMoney(e?.amount)}
                                                            </h6>
                                                            <h6 className="text-[13px]  px-2 py-0.5 col-span-2  font-medium text-left">
                                                                {e?.note !=
                                                                    undefined ? (
                                                                    <ExpandableContent content={e?.note} />
                                                                ) : ""}
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
                                <h2 className="font-medium p-2 text-[13px]  border-[#E7EAEE] border-opacity-70 border-y-[1px]  z-10">
                                    {props.dataLang?.purchase_total || "purchase_total"}
                                </h2>
                                <div className="sticky bottom-0 z-10 grid flex-col justify-between grid-cols-12 mt-2 ">
                                    <div className="col-span-7">
                                        <div>
                                            <div className="text-[#344054] font-semibold 2xl:text-[12px] xl:text-[13px] text-[13px] mb-1 ">
                                                {props.dataLang?.purchase_note || "purchase_note"}
                                            </div>
                                            <textarea
                                                value={data?.note}
                                                disabled
                                                name="fname"
                                                type="text"
                                                className="text-[13px]  placeholder:text-slate-300 w-[80%] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 min-h-[100px] max-h-[100px] resize-none bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-medium p-2 outline-none "
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-2 mt-2 space-y-2">
                                        <div className="font-semibold text-left text-[13px]">
                                            <h3>
                                                {props.dataLang?.purchase_order_table_total || "purchase_order_table_total"}
                                            </h3>
                                        </div>
                                        <div className="font-semibold text-left text-[13px]">
                                            <h3>
                                                {props.dataLang?.purchase_order_detail_discounty || "purchase_order_detail_discounty"}
                                            </h3>
                                        </div>
                                        <div className="font-semibold text-left text-[13px]">
                                            <h3>
                                                {props.dataLang?.purchase_order_detail_money_after_discount || "purchase_order_detail_money_after_discount"}
                                            </h3>
                                        </div>
                                        <div className="font-semibold text-left text-[13px]">
                                            <h3>
                                                {props.dataLang?.purchase_order_detail_tax_money || "purchase_order_detail_tax_money"}
                                            </h3>
                                        </div>
                                        <div className="font-semibold text-left text-[13px]">
                                            <h3>
                                                {props.dataLang?.purchase_order_detail_into_money || "purchase_order_detail_into_money"}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="col-span-3 mt-2 space-y-2">
                                        <div className="font-medium mr-2.5">
                                            <h3 className="text-right text-blue-600 text-[13px]">
                                                {formatMoney(data?.total_price)}
                                            </h3>
                                        </div>
                                        <div className="font-medium mr-2.5">
                                            <h3 className="text-right text-blue-600 text-[13px]">
                                                {formatMoney(data?.total_discount)}
                                            </h3>
                                        </div>
                                        <div className="font-medium mr-2.5">
                                            <h3 className="text-right text-blue-600 text-[13px]">
                                                {formatMoney(data?.total_price_after_discount)}
                                            </h3>
                                        </div>
                                        <div className="font-medium mr-2.5">
                                            <h3 className="text-right text-blue-600 text-[13px]">
                                                {formatMoney(data?.total_tax_price)}
                                            </h3>
                                        </div>
                                        <div className="font-medium mr-2.5">
                                            <h3 className="text-right text-blue-600 text-[13px]">
                                                {formatMoney(data?.total_amount)}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                            </Customscrollbar>
                        </div>
                    </div>
                </div>
            </PopupCustom>
        </>
    );
};
export default PopupDetail;
