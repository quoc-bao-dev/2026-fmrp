import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import { ColumnTablePopup, GeneralInformation, HeaderTablePopup } from "@/components/UI/common/TablePopup";
import TagBranch from "@/components/UI/common/Tag/TagBranch";
import { TagColorLime, TagColorOrange, TagColorRed, TagColorSky } from "@/components/UI/common/Tag/TagStatus";
import CustomAvatar from "@/components/UI/common/user/CustomAvatar";
import Loading from "@/components/UI/loading/loading";
import ExpandableContent from "@/components/UI/more";
import NoData from "@/components/UI/noData/nodata";
import PopupCustom from "@/components/UI/popup";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import useSetingServer from "@/hooks/useConfigNumber";
import { formatMoment } from "@/utils/helpers/formatMoment";
import { default as formatMoneyConfig, default as formatNumberConfig } from "@/utils/helpers/formatMoney";
import { useState } from "react";
import ModalImage from "react-modal-image";
import { useOrderDetail } from "../hooks/useOrderDetail";
const PopupDetail = (props) => {
    const [open, sOpen] = useState(false);

    const _ToggleModal = (e) => sOpen(e);

    const dataSeting = useSetingServer()

    const formatNumber = (num) => {
        return formatNumberConfig(+num, dataSeting);
    };

    const formatMoney = (number) => {
        return formatMoneyConfig(+number, dataSeting);
    }

    const { data, isFetching } = useOrderDetail(open, props?.id)

    return (
        <>
            <PopupCustom
                title={"Chi tiết phiếu đơn hàng mua (PO)"}
                // title={props.dataLang?.purchase_order_detail_title || "purchase_order_detail_title"}
                button={props?.name}
                onClickOpen={_ToggleModal.bind(this, true)}
                open={open}
                onClose={_ToggleModal.bind(this, false)}
                classNameBtn={props?.className}
            >
                <div className="flex items-center space-x-4 my-2 border-[#E7EAEE] border-opacity-70 border-b-[1px]"></div>
                <div className=" space-x-5 w-[1150px] h-auto">
                    <div>
                        <div className="w-[1150px]">
                            <Customscrollbar className="min:h-[170px] h-[72%] max:h-[100px]">
                                <GeneralInformation  {...props} />
                                <div div className="grid grid-cols-8  min-h-[170px] px-2">
                                    <div className="col-span-3">
                                        <div className="grid grid-cols-2 my-4 font-semibold">
                                            <h3 className=" text-[13px] ">
                                                {props.dataLang?.purchase_order_detail_day_vouchers || "purchase_order_detail_day_vouchers"}
                                            </h3>
                                            <h3 className=" text-[13px]  font-medium">
                                                {data?.date != null ? formatMoment(data?.date, FORMAT_MOMENT.DATE_TIME_SLASH_LONG) : ""}
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-2 my-4 font-semibold">
                                            <h3 className=" text-[13px] ">
                                                {props.dataLang?.purchase_order_detail_delivery_date || "purchase_order_detail_delivery_date"}
                                            </h3>
                                            <h3 className=" text-[13px]  font-medium">
                                                {data?.delivery_date != null ? formatMoment(data?.delivery_date, FORMAT_MOMENT.DATE_SLASH_LONG) : ""}
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-2 my-4 font-semibold">
                                            <h3 className=" text-[13px] ">
                                                {props.dataLang?.purchase_order_detail_voucher_code || "purchase_order_detail_voucher_code"}
                                            </h3>
                                            <h3 className=" text-[13px]  font-medium text-blue-600">
                                                {data?.code}
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-2 my-4 font-semibold">
                                            <h3 className=" text-[13px] ">
                                                {props.dataLang?.purchase_order_table_ordertype || "purchase_order_table_ordertype"}
                                            </h3>
                                            <h3 className=" text-[13px] font-medium flex items-center">
                                                {data?.status_plan == "1"
                                                    ?
                                                    <TagColorOrange className={'!py-0.5'} name='KHSX' /> : data?.order_type == "0"
                                                        ? (
                                                            <TagColorRed className={'!py-0.5'} name={'Tạo mới'} />
                                                        ) : (
                                                            <TagColorOrange className={'!py-0.5'} name='KHSX' />
                                                        )}
                                            </h3>
                                        </div>
                                    </div>

                                    <div className="col-span-2 mx-auto">
                                        <div className="my-4 font-medium text-[13px]">
                                            {"Trạng thái nhập hàng"}
                                        </div>
                                        <div className="flex items-center">
                                            {(data?.import_status === "not_stocked" && (
                                                <TagColorSky className={'!py-1'} name={props.dataLang?.not_stocked || "not_stocked"} />
                                            )) ||
                                                (data?.import_status === "stocked_part" && (
                                                    <TagColorOrange className={'!py-1'} name={props.dataLang[data?.import_status] || data?.import_status} />
                                                )) ||
                                                (data?.import_status === "stocked" && (
                                                    <TagColorLime className={'!py-0.5'} name={props.dataLang[data?.import_status] || data?.import_status} />
                                                ))}
                                        </div>
                                        <div className="my-4 font-medium text-[13px]">
                                            Số kế hoạch
                                            {/* {props.dataLang
                                                ?.purchase_order_table_number || "purchase_order_table_number"} */}
                                        </div>
                                        <div className="flex flex-wrap  gap-2 items-center justify-start text-[13px]">
                                            {/* {data?.purchases
                                                ?.reduce(
                                                    (acc, cur) =>
                                                        acc +
                                                        (acc ? ", " : "") +
                                                        cur.code,
                                                    ""
                                                )
                                                .split("")
                                                .join("")
                                                .replace(/^,/, "")} */}
                                            {data?.list_production_plan
                                                ?.reduce(
                                                    (acc, cur) =>
                                                        acc +
                                                        (acc ? ", " : "") +
                                                        cur?.reference_no,
                                                    ""
                                                )
                                                .split("")
                                                .join("")
                                                .replace(/^,/, "")}

                                        </div>
                                    </div>
                                    <div className="col-span-3 ">
                                        <div className="grid grid-cols-2 my-4 font-semibold">
                                            <h3 className="text-[13px]">
                                                {props.dataLang?.purchase_order_table_supplier || "purchase_order_table_supplier"}
                                            </h3>
                                            <h3 className="text-[13px] font-medium">
                                                {data?.supplier_name}
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-2 col-span-2">
                                            <h3 className="col-span-1 text-[13px] font-medium">
                                                {props.dataLang?.production_warehouse_creator || "production_warehouse_creator"}
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
                                        </div>
                                        <div className="grid grid-cols-2 my-4 font-semibold">
                                            <h3 className="text-[13px]">
                                                {props.dataLang?.purchase_order_table_branch || "purchase_order_table_branch"}
                                            </h3>
                                            <TagBranch className='w-fit'>
                                                {data?.branch_name}
                                            </TagBranch>
                                        </div>
                                    </div>
                                </div>
                                <div className="pr-2 w-[100%]">
                                    <HeaderTablePopup gridCols={12}>
                                        <ColumnTablePopup>
                                            {props.dataLang?.purchase_image || "purchase_image"}
                                        </ColumnTablePopup>
                                        <ColumnTablePopup>
                                            {props.dataLang?.purchase_items || "purchase_items"}
                                        </ColumnTablePopup>
                                        <ColumnTablePopup>
                                            {props.dataLang?.purchase_variant || "purchase_variant"}
                                        </ColumnTablePopup>
                                        <ColumnTablePopup>
                                            {/* {props.dataLang?.purchase_order_purchase_from_unit ||
                          "purchase_order_purchase_from_unit"} */}
                                            {"ĐVT"}
                                        </ColumnTablePopup>
                                        <ColumnTablePopup>
                                            {props.dataLang?.purchase_quantity || "purchase_quantity"}
                                        </ColumnTablePopup>
                                        <ColumnTablePopup>
                                            {props.dataLang?.purchase_order_detail_unit_price || "purchase_order_detail_unit_price"}
                                        </ColumnTablePopup>
                                        <ColumnTablePopup>
                                            {/* {props.dataLang?.purchase_order_detail_discount ||
                          "purchase_order_detail_discount"} */}
                                            {"% CK"}
                                        </ColumnTablePopup>
                                        <ColumnTablePopup colSpan={2}>
                                            {/* {props.dataLang?.purchase_order_detail_after_discount ||
                          "purchase_order_detail_after_discount"} */}
                                            {"Đơn giá SCK"}
                                        </ColumnTablePopup>
                                        <ColumnTablePopup>
                                            {props.dataLang?.purchase_order_detail_tax || "purchase_order_detail_tax"}
                                        </ColumnTablePopup>
                                        <ColumnTablePopup>
                                            {props.dataLang?.purchase_order_detail_into_money || "purchase_order_detail_into_money"}
                                        </ColumnTablePopup>
                                        <ColumnTablePopup>
                                            {props.dataLang?.purchase_order_note || "purchase_order_note"}
                                        </ColumnTablePopup>
                                    </HeaderTablePopup>
                                    {isFetching ? (
                                        <Loading
                                            className="max-h-28"
                                            color="#0f4f9e"
                                        />
                                    ) : data?.item?.length > 0 ? (
                                        <>
                                            <Customscrollbar
                                                className="min-h-[90px] max-h-[100px] 2xl:max-h-[250px]"
                                            >
                                                <div className="divide-y divide-slate-200 min:h-[200px] h-[100%] max:h-[300px]">
                                                    {data?.item?.map((e) => (
                                                        <div
                                                            className="grid items-center grid-cols-12 py-1.5 px-2 hover:bg-slate-100/40 "
                                                            key={e.id?.toString()}
                                                        >
                                                            <h6 className="text-[13px] mx-auto   py-0.5 col-span-1  rounded-md text-center">
                                                                {e?.item?.images != null ? (
                                                                    <ModalImage
                                                                        small={e?.item?.images}
                                                                        large={e?.item?.images}
                                                                        alt="Product Image"
                                                                        className="custom-modal-image object-cover rounded w-[50px] h-[60px]"
                                                                    />
                                                                ) : (
                                                                    <div className="w-[50px] h-[60px] object-cover  flex items-center justify-center rounded">
                                                                        <ModalImage
                                                                            small="/icon/noimagelogo.png"
                                                                            large="/icon/noimagelogo.png"
                                                                            className="object-contain w-full h-full p-1 rounded"
                                                                        >
                                                                            {" "}
                                                                        </ModalImage>
                                                                    </div>
                                                                )}
                                                            </h6>
                                                            <h6 className="text-[13px]   py-0.5 col-span-1 font-medium  text-left">
                                                                {e?.item?.name}
                                                            </h6>
                                                            <h6 className="text-[13px]   py-0.5 col-span-1 font-medium  text-left break-words">
                                                                {e?.item?.product_variation}
                                                            </h6>
                                                            <h6 className="text-[13px]   py-0.5 col-span-1 font-medium  text-center break-words">
                                                                {e?.item?.unit_name}
                                                            </h6>
                                                            <h6 className="text-[13px]   py-0.5 col-span-1 font-medium  text-center mr-1">
                                                                {formatNumber(e?.quantity)}
                                                            </h6>
                                                            <h6 className="text-[13px]   py-0.5 col-span-1 font-medium  text-center">
                                                                {formatMoney(e?.price)}
                                                            </h6>
                                                            <h6 className="text-[13px]   py-0.5 col-span-1 font-medium  text-center">
                                                                {e?.discount_percent + "%"}
                                                            </h6>
                                                            <h6 className="text-[13px]   py-0.5 col-span-2  rounded-md text-center">
                                                                {formatMoney(e?.price_after_discount)}
                                                            </h6>
                                                            <h6 className="text-[13px]   py-0.5 col-span-1 font-medium  text-center ">
                                                                {formatNumber(e?.tax_rate) + "%"}
                                                            </h6>
                                                            <h6 className="text-[13px]   py-0.5 col-span-1 font-medium  text-right mr-3.5">
                                                                {formatMoney(e?.amount)}
                                                            </h6>

                                                            <h6 className="text-[13px]   py-0.5 col-span-1 font-medium  text-left ml-3.5 ">
                                                                {e?.note != undefined ? (
                                                                    <ExpandableContent content={e?.note} />
                                                                ) : (
                                                                    ""
                                                                )}
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
                                        <h3 className="text-[13px] p-1 font-medium">
                                            {props.dataLang?.purchase_order_note || "purchase_order_note"}
                                        </h3>
                                        <textarea
                                            className="resize-none text-[13px] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 placeholder:text-slate-300 w-[90%] min-h-[90px] max-h-[90px] bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-1 outline-none "
                                            disabled
                                            value={data?.note}
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-2">
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
                                    <div className="col-span-3 space-y-2">
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
                                                {formatMoney(data?.total_tax)}
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
