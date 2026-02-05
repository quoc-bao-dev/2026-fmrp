import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import { ColumnTablePopup, GeneralInformation, HeaderTablePopup } from "@/components/UI/common/TablePopup";
import TagBranch from "@/components/UI/common/Tag/TagBranch";
import { TagWarehouse } from "@/components/UI/common/Tag/TagWarehouse";
import CustomAvatar from "@/components/UI/common/user/CustomAvatar";
import Loading from "@/components/UI/loading/loading";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import useFeature from "@/hooks/useConfigFeature";
import useSetingServer from "@/hooks/useConfigNumber";
import { formatMoment } from "@/utils/helpers/formatMoment";
import formatNumberConfig from "@/utils/helpers/formatnumber";
import ExpandableContent from "components/UI/more";
import vi from "date-fns/locale/vi";
import { SearchNormal1 as IconSearch } from "iconsax-react";
import { useState } from "react";
import { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ModalImage from "react-modal-image";
import { useReturnSalesDetail } from "../hooks/useReturnSalesDetail";
import PopupCustom from "/components/UI/popup";
import { useWarehouseProperties } from "@/containers/manufacture/warehouse-transfer/hooks/useWarehouseProperties";
registerLocale("vi", vi);

const PopupDetail = (props) => {
    const dataSeting = useSetingServer()

    const [open, sOpen] = useState(false);

    const _ToggleModal = (e) => sOpen(e);

    const { dataMaterialExpiry, dataProductExpiry, dataProductSerial } = useFeature();

    const { isWarehousePropertiesEnabled, warehousePropertyLabels } = useWarehouseProperties();

    const formatNumber = (number) => {
        return formatNumberConfig(+number, dataSeting);
    };

    const { data, isFetching } = useReturnSalesDetail(open, props?.id)


    return (
        <>
            <PopupCustom
                title={props.dataLang?.returnSales_detail || "returnSales_detail"}
                button={props?.name}
                onClickOpen={_ToggleModal.bind(this, true)}
                open={open}
                onClose={_ToggleModal.bind(this, false)}
                classNameBtn={props?.className}
            >
                <div className="flex items-center space-x-4 my-2 border-[#E7EAEE] border-opacity-70 border-b-[1px]"></div>
                <div className=" space-x-5 3xl:w-[1200px] 2xl:w-[1150px] w-[1100px] 3xl:h-auto  2xl:h-auto xl:h-[540px] h-[500px] ">
                    <div>
                        <div className="3xl:w-[1200px] 2xl:w-[1150px] w-[1100px]">
                            <div className="min:h-[170px] h-[72%] max:h-[100px]  customsroll overflow-auto pb-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                                <GeneralInformation  {...props} />
                                <div className="grid grid-cols-9  min-h-[100px] px-2 items-center bg-zinc-50">
                                    <div className="col-span-3">
                                        <div className="grid grid-cols-2 my-2 font-medium">
                                            <h3 className=" text-[13px] ">
                                                {props.dataLang?.import_day_vouchers || "import_day_vouchers"}
                                            </h3>
                                            <h3 className=" text-[13px]  font-medium">
                                                {data?.date != null ? formatMoment(data?.date, FORMAT_MOMENT.DATE_SLASH_LONG) : ""}
                                            </h3>
                                        </div>
                                        <div className="grid items-center grid-cols-2 col-span-2">
                                            <h3 className=" text-[13px] font-medium">
                                                {props?.dataLang?.production_warehouse_creator || "production_warehouse_creator"}
                                            </h3>
                                            <div className="grid grid-cols-2 font-medium">
                                                {/* <div className="flex items-center gap-2">
                                                    <div className="relative">
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
                                                    <h6 className="capitalize">{data?.staff_create?.full_name}</h6>
                                                </div> */}
                                                <CustomAvatar
                                                    data={data}
                                                    fullName={data?.staff_create?.full_name}
                                                    profileImage={data?.staff_create?.profile_image}
                                                />
                                            </div>{" "}
                                        </div>
                                        <div className="grid grid-cols-2 my-2 font-medium">
                                            <h3 className=" text-[13px] ">
                                                {props.dataLang?.import_code_vouchers || "import_code_vouchers"}
                                            </h3>
                                            <h3 className=" text-[13px]  font-medium text-blue-600 capitalize">
                                                {data?.code}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="col-span-3">
                                        <div className="grid grid-cols-2 my-2 font-medium">
                                            <h3 className=" text-[13px] ">
                                                {props.dataLang?.returns_form || "returns_form"}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-2">
                                                {(data?.handling_solution === "pay_down" && (
                                                    <div className="cursor-default min-w-[135px] min-w-auto text-center 3xl:text-[11px] 2xl:text-[10px] xl:text-[8px] text-[7px] font-medium text-lime-500 bg-lime-200  border-lime-200  px-2 py-1 border  rounded-2xl">
                                                        {props.dataLang[data?.handling_solution] || data?.handling_solution}
                                                    </div>
                                                )) ||
                                                    (data?.handling_solution === "debt_reduction" && (
                                                        <div className="cursor-default min-w-[135px] text-center 3xl:text-[11px] 2xl:text-[10px] xl:text-[8px] text-[7px] font-medium text-orange-500 bg-orange-200  border-orange-200 px-2 py-1 border   rounded-2xl">
                                                            {props.dataLang[data?.handling_solution] || data?.handling_solution}
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 my-2 font-medium">
                                            <h3 className=" text-[13px] ">
                                                {props.dataLang?.import_from_browse || "import_from_browse"}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-2 ">
                                                <TagWarehouse className="w-fit" data={data} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-3 ">
                                        <div className="grid grid-cols-2 my-2 font-medium">
                                            <h3 className="text-[13px]">
                                                {props.dataLang?.returnSales_client || "returnSales_client"}
                                            </h3>
                                            <h3 className="text-[13px] font-medium capitalize">{data?.client_name}</h3>
                                        </div>

                                        <div className="grid grid-cols-2 my-2 font-medium">
                                            <h3 className="text-[13px]">
                                                {props.dataLang?.import_branch || "import_branch"}
                                            </h3>
                                            <TagBranch className='w-fit'>
                                                {data?.branch_name}
                                            </TagBranch>
                                        </div>
                                    </div>
                                </div>
                                <div className=" w-[100%]">
                                    {/* <div className={`${dataProductSerial.is_enable == "1" ? 
                      (dataMaterialExpiry.is_enable != dataProductExpiry.is_enable ? "grid-cols-12" :dataMaterialExpiry.is_enable == "1" ? "grid-cols-12" :"grid-cols-10" ) :
                       (dataMaterialExpiry.is_enable != dataProductExpiry.is_enable ? "grid-cols-11" : (dataMaterialExpiry.is_enable == "1" ? "grid-cols-11" :"grid-cols-9") ) }  grid sticky top-0 bg-white shadow-lg  z-10`}> */}
                                    <HeaderTablePopup gridCols={14}>
                                        {/* <h4 className="text-[13px] px-2 text-gray-400 uppercase  font-[500] col-span-1 text-center whitespace-nowrap">{props.dataLang?.import_detail_image || "import_detail_image"}</h4> */}
                                        <ColumnTablePopup colSpan={3}>
                                            {props.dataLang?.import_detail_items || "import_detail_items"}
                                        </ColumnTablePopup>
                                        {/* <h4 className="text-[13px] px-2 py-2 text-gray-600 uppercase  font-[600] col-span-1 text-center whitespace-nowrap">{props.dataLang?.import_detail_variant || "import_detail_variant"}</h4>  */}
                                        <ColumnTablePopup colSpan={2}>
                                            {props.dataLang?.delivery_receipt_warehouse || "delivery_receipt_warehouse"}
                                        </ColumnTablePopup>
                                        <ColumnTablePopup colSpan={1}>
                                            {"Tồn kho"}
                                        </ColumnTablePopup>
                                        <ColumnTablePopup colSpan={1}>
                                            {"ĐVT"}
                                        </ColumnTablePopup>
                                        <ColumnTablePopup colSpan={1}>
                                            {props.dataLang?.import_from_quantity || "import_from_quantity"}
                                        </ColumnTablePopup>
                                        <ColumnTablePopup colSpan={1}>
                                            {props.dataLang?.import_from_unit_price || "import_from_unit_price"}
                                        </ColumnTablePopup>
                                        <ColumnTablePopup colSpan={1}>
                                            {"% CK"}
                                        </ColumnTablePopup>
                                        <ColumnTablePopup colSpan={1}>
                                            {props.dataLang?.import_from_price_affter || "import_from_price_affter"}
                                        </ColumnTablePopup>
                                        <ColumnTablePopup colSpan={1}>
                                            {props.dataLang?.import_from_tax || "import_from_tax"}
                                        </ColumnTablePopup>
                                        <ColumnTablePopup colSpan={1}>
                                            {props.dataLang?.import_into_money || "import_into_money"}
                                        </ColumnTablePopup>
                                        <ColumnTablePopup colSpan={1}>
                                            {props.dataLang?.import_from_note || "import_from_note"}
                                        </ColumnTablePopup>
                                    </HeaderTablePopup>
                                    {isFetching ? (
                                        <Loading className="max-h-28" color="#0f4f9e" />
                                    ) : data?.items?.length > 0 ? (
                                        <>
                                            <Customscrollbar className="min:h-[200px] 3xl:h-[82%] 2xl:h-[82%] xl:h-[72%] lg:h-[82%] max:h-[400px] overflow-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100"
                                            >
                                                <div className="divide-y divide-slate-200 min:h-[170px]  max:h-[170px]">
                                                    {data?.items?.map((e) => (
                                                        // <div className={`${dataProductSerial.is_enable == "1" ?
                                                        // (dataMaterialExpiry.is_enable != dataProductExpiry.is_enable ? "grid-cols-12" :dataMaterialExpiry.is_enable == "1" ? "grid-cols-12" :"grid-cols-10" ) :
                                                        // (dataMaterialExpiry.is_enable != dataProductExpiry.is_enable ? "grid-cols-11" : (dataMaterialExpiry.is_enable == "1" ? "grid-cols-11" :"grid-cols-9") ) }  grid hover:bg-slate-50 `} key={e.id?.toString()}>
                                                        <div
                                                            className="grid items-center grid-cols-14 hover:bg-slate-50 "
                                                            key={e.id?.toString()}
                                                        >
                                                            {/* <h6 className="text-[13px]   py-0.5 col-span-1 text-center">
                            {e?.item?.images != null ? (<ModalImage   small={e?.item?.images} large={e?.item?.images} alt="Product Image"  className='custom-modal-image object-cover rounded w-[50px] h-[60px] mx-auto' />):
                              <div className='w-[50px] h-[60px] object-cover  mx-auto'>
                                <ModalImage small="/icon/noimagelogo.png" large="/icon/noimagelogo.png" className='object-contain w-full h-full p-1 rounded' > </ModalImage>
                              </div>
                            }
                            </h6>     
                                        */}
                                                            <h6 className="text-[13px]  px-2 py-2 col-span-3 text-left ">
                                                                <div className="flex items-center gap-2">
                                                                    <div>
                                                                        {e?.item?.images != null ? (
                                                                            <ModalImage
                                                                                small={e?.item?.images}
                                                                                large={e?.item?.images}
                                                                                alt="Product Image"
                                                                                className="custom-modal-image object-cover rounded w-[40px] h-[50px] mx-auto"
                                                                            />
                                                                        ) : (
                                                                            <div className="w-[40px] h-[50px] object-cover  mx-auto">
                                                                                <ModalImage
                                                                                    small="/icon/noimagelogo.png"
                                                                                    large="/icon/noimagelogo.png"
                                                                                    className="object-contain w-full h-full p-1 rounded"
                                                                                >
                                                                                    {" "}
                                                                                </ModalImage>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <h6 className="text-[13px] text-left font-medium capitalize">
                                                                            {e?.item?.name}
                                                                            <p className="text-[10px] text-blue-fmrp">{e?.item?.code}
                                                                                <span className=" text-left font-medium capitalize text-[#000]">
                                                                                    {' '} - {' '} {e?.item?.product_variation}
                                                                                </span></p>
                                                                        </h6>

                                                                        <div className="flex flex-wrap items-center font-oblique">
                                                                            {dataProductSerial.is_enable === "1" ? (
                                                                                <div className="flex gap-0.5">
                                                                                    {/* <h6 className="text-[12px]">Serial:</h6><h6 className="text-[12px]  px-2   w-[full] text-left ">{e.serial == null || e.serial == "" ? "-" : e.serial}</h6>                               */}
                                                                                    <h6 className="text-[11px]">
                                                                                        Serial:
                                                                                    </h6>
                                                                                    <h6 className="text-[11px]  px-2   w-[full] text-left ">
                                                                                        {e?.item?.serial == null || e?.item?.serial == "" ? "-" : e?.item?.serial}
                                                                                    </h6>
                                                                                </div>
                                                                            ) : (
                                                                                ""
                                                                            )}
                                                                            {dataMaterialExpiry.is_enable === "1" || dataProductExpiry.is_enable === "1" ? (
                                                                                <>
                                                                                    <div className="flex gap-0.5">
                                                                                        <h6 className="text-[11px]">
                                                                                            Lot:
                                                                                        </h6>{" "}
                                                                                        <h6 className="text-[11px]  px-2   w-[full] text-left ">
                                                                                            {e?.item?.lot == null || e?.item?.lot == "" ? "-" : e?.item?.lot}
                                                                                        </h6>
                                                                                    </div>
                                                                                    <div className="flex gap-0.5">
                                                                                        <h6 className="text-[11px]">
                                                                                            Date:
                                                                                        </h6>{" "}
                                                                                        <h6 className="text-[11px]  px-2   w-[full] text-center ">
                                                                                            {e?.item?.expiration_date ? formatMoment(e?.item?.expiration_date, FORMAT_MOMENT.DATE_SLASH_LONG) : "-"}
                                                                                        </h6>
                                                                                    </div>
                                                                                </>
                                                                            ) : (
                                                                                ""
                                                                            )}
                                                                            {/* Hiển thị thuộc tính kho cho nguyên vật liệu */}
                                                                            {e?.item_type === 'material' &&
                                                                                Array.isArray(warehousePropertyLabels) &&
                                                                                warehousePropertyLabels.length > 0 && (
                                                                                    <>
                                                                                        {warehousePropertyLabels.map(({ key, label }) => {
                                                                                            if (!label) return null
                                                                                            const value = e?.[key]

                                                                                            // Nếu isWarehousePropertiesEnabled tắt và thuộc tính không có giá trị → ẩn
                                                                                            if (!isWarehousePropertiesEnabled && (value == null || value === '')) return null

                                                                                            return (
                                                                                                <div key={key} className="flex gap-1">
                                                                                                    <h6 className="text-[11px]">
                                                                                                        {label}:
                                                                                                    </h6>
                                                                                                    <h6 className="text-[11px] w-[full] text-left pr-2">
                                                                                                        {value == null || value === '' ? '-' : value}
                                                                                                    </h6>
                                                                                                </div>
                                                                                            )
                                                                                        })}
                                                                                    </>
                                                                                )}

                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </h6>
                                                            {/* <h6 className="text-[13px]   px-2 py-2 col-span-1 text-center break-words">{e?.item?.product_variation}</h6>                 */}
                                                            <h6 className="text-[13px]   px-2 py-2 col-span-2 text-left break-words">
                                                                <h6 className="font-medium">
                                                                    {e?.warehouse_name ? e?.warehouse_name : ""}
                                                                </h6>
                                                                <h6 className="font-medium">
                                                                    {e.location_name ? e.location_name : ""}
                                                                </h6>
                                                            </h6>
                                                            <h6 className="text-[13px]   py-2 col-span-1 font-medium text-center break-words">
                                                                {formatNumber(e?.item?.quantity_left)}
                                                            </h6>
                                                            <h6 className="text-[13px]   py-2 col-span-1 font-medium text-center break-words">
                                                                {e?.item?.unit_name}
                                                            </h6>
                                                            <h6 className="text-[13px]   py-2 col-span-1 font-medium text-center mr-1">
                                                                {formatNumber(e?.quantity)}
                                                            </h6>
                                                            <h6 className="text-[13px]   py-2 col-span-1 font-medium text-center">
                                                                {formatNumber(e?.price)}
                                                            </h6>
                                                            <h6 className="text-[13px]   py-2 col-span-1 font-medium text-center">
                                                                {e?.discount_percent + "%"}
                                                            </h6>
                                                            <h6 className="text-[13px]   py-2 col-span-1 font-medium text-center">
                                                                {formatNumber(e?.price_after_discount)}
                                                            </h6>
                                                            <h6 className="text-[13px]   py-2 col-span-1 font-medium text-center">
                                                                {formatNumber(e?.tax_rate) + "%"}
                                                            </h6>
                                                            <h6 className="text-[13px]   py-2 col-span-1 font-medium text-right ">
                                                                {formatNumber(e?.amount)}
                                                            </h6>
                                                            <h6 className="text-[13px]   py-2 col-span-1 font-medium text-left ml-3.5">
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
                                        <div className=" max-w-[352px] mt-24 mx-auto">
                                            <div className="text-center">
                                                <div className="bg-[#EBF4FF] rounded-[100%] inline-block ">
                                                    <IconSearch />
                                                </div>
                                                <h1 className="textx-[#141522] text-base opacity-90 font-medium">
                                                    {props.dataLang?.purchase_order_table_item_not_found ||
                                                        "purchase_order_table_item_not_found"}
                                                </h1>
                                                <div className="flex items-center justify-around mt-6 ">
                                                    {/* <Popup_dskh onRefresh={_ServerFetching.bind(this)} dataLang={dataLang} className="xl:text-xs text-xs xl:px-5 px-3 xl:py-2.5 py-1.5 bg-gradient-to-l from-[#0F4F9E] via-[#0F4F9E] via-[#296dc1] to-[#0F4F9E] text-white rounded btn-animation hover:scale-105" />     */}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <h2 className="font-medium p-2 text-[13px]  border-[#E7EAEE] border-opacity-70 border-y-[1px]  z-10">
                                    {props.dataLang?.purchase_total || "purchase_total"}
                                </h2>
                                <div className="sticky bottom-0 z-10 grid flex-col justify-between grid-cols-12 mt-2 ">
                                    <div className="col-span-7">
                                        <h3 className="text-[13px] p-1">
                                            {props.dataLang?.returns_reason || "returns_reason"}
                                        </h3>
                                        <textarea
                                            className="resize-none text-[13px] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 placeholder:text-slate-300 w-[90%] min-h-[90px] max-h-[90px] bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-1 outline-none "
                                            disabled
                                            value={data?.note}
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-1 text-right">
                                        <div className="font-medium text-left text-[13px]">
                                            <h3>
                                                {props.dataLang?.import_detail_total_amount ||
                                                    "import_detail_total_amount"}
                                            </h3>
                                        </div>
                                        <div className="font-medium text-left text-[13px]">
                                            <h3>
                                                {props.dataLang?.import_detail_discount || "import_detail_discount"}
                                            </h3>
                                        </div>
                                        <div className="font-medium text-left text-[13px]">
                                            <h3>
                                                {props.dataLang?.import_detail_affter_discount ||
                                                    "import_detail_affter_discount"}
                                            </h3>
                                        </div>
                                        <div className="font-medium text-left text-[13px]">
                                            <h3>
                                                {props.dataLang?.import_detail_tax_money || "import_detail_tax_money"}
                                            </h3>
                                        </div>
                                        <div className="font-medium text-left text-[13px]">
                                            <h3>
                                                {props.dataLang?.import_detail_into_money || "import_detail_into_money"}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="col-span-3 space-y-1 text-right">
                                        <div className="font-medium mr-2.5">
                                            <h3 className="text-right text-blue-600 text-[13px]">
                                                {formatNumber(data?.total_price)}
                                            </h3>
                                        </div>
                                        <div className="font-medium mr-2.5">
                                            <h3 className="text-right text-blue-600 text-[13px]">
                                                {formatNumber(data?.total_discount)}
                                            </h3>
                                        </div>
                                        <div className="font-medium mr-2.5">
                                            <h3 className="text-right text-blue-600 text-[13px]">
                                                {formatNumber(data?.total_price_after_discount)}
                                            </h3>
                                        </div>
                                        <div className="font-medium mr-2.5">
                                            <h3 className="text-right text-blue-600 text-[13px]">
                                                {formatNumber(data?.total_tax)}
                                            </h3>
                                        </div>
                                        <div className="font-medium mr-2.5">
                                            <h3 className="text-right text-blue-600 text-[13px]">
                                                {formatNumber(data?.total_amount)}
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </PopupCustom>
        </>
    );
};
export default PopupDetail;
