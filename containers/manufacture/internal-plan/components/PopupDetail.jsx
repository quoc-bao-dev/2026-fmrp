import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import { ColumnTablePopup, GeneralInformation, HeaderTablePopup } from "@/components/UI/common/TablePopup";
import TagBranch from "@/components/UI/common/Tag/TagBranch";
import { TagColorLime, TagColorRed } from "@/components/UI/common/Tag/TagStatus";
import CustomAvatar from "@/components/UI/common/user/CustomAvatar";
import Loading from "@/components/UI/loading/loading";
import ExpandableContent from "@/components/UI/more";
import PopupCustom from "@/components/UI/popup";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import useSetingServer from "@/hooks/useConfigNumber";
import { formatMoment } from "@/utils/helpers/formatMoment";
import formatNumberConfig from "@/utils/helpers/formatnumber";
import { SearchNormal1 as IconSearch } from "iconsax-react";
import { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import ModalImage from "react-modal-image";
import { useInternalPlanDetail } from "../hooks/useInternalPlanDetail";
const PopupDetail = (props) => {

    const [open, sOpen] = useState(false);

    const dataSeting = useSetingServer();

    const _ToggleModal = (e) => sOpen(e);

    const formatNumber = (number) => {
        return formatNumberConfig(+number, dataSeting);
    };

    const { data, isFetching } = useInternalPlanDetail(open, props?.id);

    return (
        <>
            <PopupCustom
                title={props.dataLang?.internal_plan_detail || "internal_plan_detail"}
                button={props?.name}
                onClickOpen={_ToggleModal.bind(this, true)}
                open={open}
                onClose={_ToggleModal.bind(this, false)}
                classNameBtn={props?.className}
            >
                <div className="flex items-center space-x-4 my-2 border-[#E7EAEE] border-opacity-70 border-b-[1px]"></div>
                <div className=" space-x-5 3xl:w-[1000px] 2xl:w-[900px] w-[900px] 3xl:h-auto  2xl:h-auto xl:h-[540px] h-[500px] ">
                    <div>
                        <div className="3xl:w-[1000px] 2xl:w-[900px] w-[900px]">
                            <div className="min:h-[170px] h-[72%] max:h-[100px]  customsroll overflow-auto pb-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                                <GeneralInformation {...props} />
                                <div className="grid grid-cols-9  min-h-[70px] px-2  bg-zinc-50">
                                    <div className="col-span-3">
                                        <div className="grid grid-cols-2 my-2 font-medium">
                                            <h3 className=" text-[13px] ">
                                                {props.dataLang?.import_day_vouchers || "import_day_vouchers"}
                                            </h3>
                                            <h3 className=" text-[13px]  font-medium">
                                                {data?.internalPlans?.date != null ? formatMoment(data?.internalPlans?.date, FORMAT_MOMENT.DATE_SLASH_LONG) : ""}
                                            </h3>
                                        </div>
                                        <div className="grid items-center grid-cols-2 col-span-2">
                                            <h3 className=" text-[13px] font-medium">
                                                {props?.dataLang?.production_warehouse_creator || "production_warehouse_creator"}
                                            </h3>
                                            <div className="font-medium">
                                                <CustomAvatar
                                                    profileImage={data?.internalPlans?.created_by_profile_image}
                                                    fullName={data?.internalPlans?.created_by_full_name}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-3">
                                        <div className="grid grid-cols-2 my-2 font-medium">
                                            <h3 className=" text-[13px] ">
                                                {props.dataLang?.import_code_vouchers || "import_code_vouchers"}
                                            </h3>
                                            <h3 className=" text-[13px]  font-medium text-blue-600 capitalize">
                                                {data?.internalPlans?.reference_no}
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-2 my-2 font-medium">
                                            <h3 className=" text-[13px] ">
                                                {props.dataLang?.internal_plan_name || "internal_plan_name"}
                                            </h3>
                                            <h3 className=" text-[13px]  font-medium capitalize">
                                                {data?.internalPlans?.plan_name}
                                            </h3>
                                        </div>
                                    </div>
                                    <div className="col-span-3 ">
                                        <div className="grid grid-cols-2 my-2 font-medium">
                                            <h3 className="text-[13px]">
                                                {props.dataLang?.internal_plan_status || "internal_plan_status"}
                                            </h3>
                                            <h3 className=" w-fit">
                                                {/* <span className="flex items-center justify-center gap-1 font-normal text-lime-500  rounded-xl py-0.5 px-2 min-w-[135px]  bg-lime-200 text-center text-[13px]">
                                                    <TickCircle
                                                        className="rounded-full bg-lime-500"
                                                        color="white"
                                                        size={15}
                                                    />
                                                    {"Đã lập KHNVL"}
                                                </span> */}
                                                {data?.internalPlans.status == "1" && (
                                                    <TagColorLime name={"Đã Duyệt"} />
                                                )}
                                                {data?.internalPlans.status == "0" && (
                                                    <TagColorRed name={"Chưa Duyệt"} />
                                                )}
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-2 my-2 font-medium">
                                            <h3 className="text-[13px]">
                                                {props.dataLang?.import_branch || "import_branch"}
                                            </h3>
                                            <TagBranch className="w-fit">{data?.internalPlans?.name_branch}</TagBranch>
                                        </div>
                                    </div>
                                </div>
                                <div className=" w-[100%]">
                                    <HeaderTablePopup gridCols={12}>
                                        <ColumnTablePopup colSpan={4}>
                                            {props.dataLang?.import_detail_items || "import_detail_items"}
                                        </ColumnTablePopup>
                                        <ColumnTablePopup colSpan={2}>{"ĐVT"}</ColumnTablePopup>
                                        <ColumnTablePopup colSpan={2}>
                                            {props.dataLang?.import_from_quantity || "import_from_quantity"}
                                        </ColumnTablePopup>
                                        <ColumnTablePopup colSpan={2}>
                                            {props.dataLang?.internal_plan_date || "internal_plan_date"}
                                        </ColumnTablePopup>
                                        <ColumnTablePopup colSpan={2}>
                                            {props.dataLang?.import_from_note || "import_from_note"}
                                        </ColumnTablePopup>
                                    </HeaderTablePopup>
                                    {isFetching ? (
                                        <Loading className="max-h-28" color="#0f4f9e" />
                                    ) : data?.internalPlansItems?.length > 0 ? (
                                        <>
                                            <Customscrollbar className="min-h-[250px] max-h-[250px] 2xl:max-h-[250px]">
                                                <div className="divide-y divide-slate-200 min:h-[250px]  max:h-[250px]">
                                                    {data?.internalPlansItems?.map((e, index) => (
                                                        <div
                                                            className={`grid grid-cols-12 hover:bg-slate-50 items-center`}
                                                            key={e.id?.toString()}
                                                        >
                                                            <h6 className="text-[13px]  px-2 py-2 col-span-4 text-left ">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="">
                                                                        {e?.images != null ? (
                                                                            <ModalImage
                                                                                small={e?.images}
                                                                                large={e?.images}
                                                                                alt="Product Image"
                                                                                className="custom-modal-image object-cover rounded w-[40px] h-[40px] mx-auto"
                                                                            />
                                                                        ) : (
                                                                            <div className="w-[40px] h-[40px] object-cover  mx-auto ">
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
                                                                        <h6 className='text-[13px] text-left font-medium capitalize'>{e?.item_name}
                                                                            <p className="text-[11px] text-blue-fmrp font-normal">{e?.item_code} <span className=" text-left capitalize text-[#000]">
                                                                                {' '} - {' '} {e?.product_variation}
                                                                            </span></p>
                                                                        </h6>
                                                                        {/* <div className="flex flex-wrap items-center font-oblique">
                                                                            {dataProductSerial.is_enable === "1" ? (
                                                                                <div className="flex gap-0.5">
                                                                                    <h6 className="text-[12px]">
                                                                                        Serial:
                                                                                    </h6>
                                                                                    <h6 className="text-[12px]  px-2   w-[full] text-left ">
                                                                                        {e?.item?.serial == null ||
                                                                                        e?.item?.serial == ""
                                                                                            ? "-"
                                                                                            : e?.item?.serial}
                                                                                    </h6>
                                                                                </div>
                                                                            ) : (
                                                                                ""
                                                                            )}
                                                                            {dataMaterialExpiry.is_enable === "1" ||
                                                                            dataProductExpiry.is_enable === "1" ? (
                                                                                <>
                                                                                    <div className="flex gap-0.5">
                                                                                        <h6 className="text-[12px]">
                                                                                            Lot:
                                                                                        </h6>{" "}
                                                                                        <h6 className="text-[12px]  px-2   w-[full] text-left ">
                                                                                            {e?.item?.lot == null ||
                                                                                            e?.item?.lot == ""
                                                                                                ? "-"
                                                                                                : e?.item?.lot}
                                                                                        </h6>
                                                                                    </div>
                                                                                    <div className="flex gap-0.5">
                                                                                        <h6 className="text-[12px]">
                                                                                            Date:
                                                                                        </h6>{" "}
                                                                                        <h6 className="text-[12px]  px-2   w-[full] text-center ">
                                                                                            {e?.item?.expiration_date
                                                                                                ? moment(
                                                                                                      e?.item
                                                                                                          ?.expiration_date
                                                                                                  ).format("DD/MM/YYYY")
                                                                                                : "-"}
                                                                                        </h6>
                                                                                    </div>
                                                                                </>
                                                                            ) : (
                                                                                ""
                                                                            )}
                                                                        </div> */}
                                                                    </div>
                                                                </div>
                                                            </h6>
                                                            <h6 className="text-[13px]   py-2 col-span-2 font-medium text-center ">
                                                                {e?.unit_name}
                                                            </h6>
                                                            <h6 className="text-[13px]   py-2 col-span-2 font-medium text-center ">
                                                                {formatNumber(e?.quantity)}
                                                            </h6>
                                                            <h6 className="text-[13px]   py-2 col-span-2 font-medium text-center ">
                                                                {formatMoment(e?.date_needed, FORMAT_MOMENT.DATE_SLASH_LONG)}
                                                            </h6>

                                                            <h6 className="text-[13px]   py-2 col-span-2 font-medium text-left ml-3.5">
                                                                {e?.note_item != undefined ? (
                                                                    <ExpandableContent content={e?.note_item} />
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
                                            value={data?.internalPlans?.note}
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-1 text-right">
                                        <div className="font-medium text-left text-[13px]">
                                            <h3>{props.dataLang?.internal_plan_total || "internal_plan_total"}</h3>
                                        </div>
                                    </div>
                                    <div className="col-span-3 space-y-1 text-right">
                                        <div className="font-medium mr-2.5">
                                            <h3 className="text-right text-blue-600 text-[13px]">
                                                {formatNumber(data?.internalPlans?.total_quantity)}
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
