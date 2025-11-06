import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import { ColumnTablePopup, GeneralInformation, HeaderTablePopup } from "@/components/UI/common/TablePopup";
import TagBranch from "@/components/UI/common/Tag/TagBranch";
import { TagColorLime, TagColorOrange, TagColorSky } from "@/components/UI/common/Tag/TagStatus";
import CustomAvatar from "@/components/UI/common/user/CustomAvatar";
import ImagesItem from "@/components/UI/images/ImagesItem";
import Loading from "@/components/UI/loading/loading";
import NoData from "@/components/UI/noData/nodata";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import useSetingServer from "@/hooks/useConfigNumber";
import { formatMoment } from "@/utils/helpers/formatMoment";
import formatNumberConfig from "@/utils/helpers/formatnumber";
import ExpandableContent from "components/UI/more";
import { TickCircle } from "iconsax-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { usePurChasesDetail } from "../hooks/usePurChasesDetail";
import PopupCustom from "/components/UI/popup";

const PopupDetail = (props) => {
    const dispatch = useDispatch();

    const [open, sOpen] = useState(false);

    const _ToggleModal = (e) => sOpen(e);

    const dataSeting = useSetingServer()

    const { data, isFetching } = usePurChasesDetail(open, props?.id);

    let listQty = data?.items;

    let totalQuantity = 0;

    for (let i = 0; i < listQty?.length; i++) {
        totalQuantity += parseInt(listQty[i].quantity);
    }

    const formatNumber = (number) => {
        return formatNumberConfig(+number, dataSeting)
    };

    return (
        <>
            <PopupCustom
                title={props.dataLang?.purchase_detail_title || "purchase_detail_title"}
                button={props?.name}
                onClickOpen={_ToggleModal.bind(this, true)}
                open={open}
                onClose={_ToggleModal.bind(this, false)}
                classNameBtn={props?.className}
            >
                <div className="flex items-center space-x-4 my-3 border-[#E7EAEE] border-opacity-70 border-b-[1px]"></div>
                <div className="mt-4 space-x-5 w-[1050px] h-auto ">
                    <div>
                        <div className="w-[1050px]">
                            <div className="min:h-[170px] h-[72%] max:h-[100px]  overflow-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                                <GeneralInformation  {...props} />
                                <div className="grid grid-cols-8  min-h-[140px] p-2">
                                    <div className="col-span-3">
                                        <div className="grid grid-cols-2 my-4 font-semibold">
                                            <h3 className="col-span-1 text-[13px]">
                                                {props.dataLang?.purchase_day || "purchase_day"}
                                            </h3>
                                            <h3 className="col-span-1 font-medium text-[13px]">
                                                {data?.date != null ? formatMoment(data?.date, FORMAT_MOMENT.DATE_SLASH_LONG) : ""}
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-2 my-4 font-semibold">
                                            <h3 className="col-span-1 text-[13px]">
                                                {props.dataLang?.purchase_code || "purchase_code"}
                                            </h3>
                                            <h3 className="col-span-1 font-medium text-[13px] text-blue-600">
                                                {data?.code}
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-2 my-4 font-semibold">
                                            <h3 className="col-span-1 text-[13px]">
                                                {props.dataLang?.purchase_planNumber || "purchase_planNumber"}
                                            </h3>
                                            <div className="col-span-1 font-medium text-[13px]">
                                                {data?.reference_no}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-span-2 mx-auto">
                                        <div className="my-4 font-semibold text-[13px]">
                                            {props.dataLang?.purchase_orderStatus || "purchase_orderStatus"}
                                        </div>
                                        <div className="flex flex-wrap items-center justify-start gap-2">
                                            {(data?.order_status?.status ===
                                                "purchase_ordered" && (
                                                    <TagColorSky className={'!py-1'} name={props.dataLang[data?.order_status?.status]} />
                                                )) ||
                                                (data?.order_status?.status ===
                                                    "purchase_portion" && (
                                                        <TagColorOrange className={'!py-1'} name={`${props.dataLang[data?.order_status?.status]} (${data?.order_status?.count})`} />
                                                    )) ||
                                                (data?.order_status?.status ===
                                                    "purchase_enough" && (
                                                        <TagColorLime className={'!py-1'} name={`${props.dataLang[data?.order_status?.status]} (${data?.order_status?.count})`} />

                                                    ))}
                                        </div>
                                    </div>
                                    <div className="col-span-3 ">
                                        <div className="grid grid-cols-2 my-4 font-semibold">
                                            <h3 className="col-span-1 text-[13px]">
                                                {props.dataLang?.purchase_status || "purchase_status"}
                                            </h3>
                                            <h3 className="col-span-1 text-[13px]">
                                                {data?.status == 0 &&
                                                    <div className={` font-medium text-[#3b82f6]  rounded-2xl py-1 px-2 w-fit  bg-[#bfdbfe] text-center 3xl:text-[11px] 2xl:text-[10px] xl:text-[8px] text-[7px]`}>
                                                        Chưa duyệt
                                                    </div>
                                                    ||
                                                    data?.status != 0 &&
                                                    <div className={`font-medium gap-1  text-lime-500   rounded-2xl py-1 px-2 w-fit  bg-lime-200 text-center 3xl:text-[11px] 2xl:text-[10px] xl:text-[8px] text-[7px] flex items-center justify-center`}>
                                                        <TickCircle
                                                            className="rounded-full bg-lime-500 animate-pulse "
                                                            color="white"
                                                            size={15}
                                                        />
                                                        <span>
                                                            Đã duyệt
                                                        </span>
                                                    </div>
                                                }
                                            </h3>
                                        </div>
                                        {/* <div className='grid grid-cols-2 my-4 font-medium'>Tổng số lượng</div> */}
                                        <div className="grid grid-cols-2 my-4 font-semibold">
                                            <h3 className="col-span-1 text-[13px]">
                                                {props.dataLang?.purchase_propnent || "purchase_propnent"}
                                            </h3>
                                            {/* <h3 className="col-span-1 text-[13px] font-normal">
                                                {data?.user_create_name}
                                            </h3> */}
                                            <div className="flex items-center gap-2">
                                                <CustomAvatar profileImage={data?.profile_image} fullName={data?.user_create_name} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 my-4 font-semibold">
                                            <h3 className="col-span-1 text-[13px]">
                                                {props.dataLang?.purchase_branch || "purchase_branch"}
                                            </h3>
                                            <TagBranch className='w-fit'>
                                                {data?.branch_name}
                                            </TagBranch>
                                        </div>
                                    </div>
                                </div>
                                <div className="pr-2 w-[100%]">
                                    <HeaderTablePopup gridCols={8}>
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
                                            {props.dataLang?.purchase_unit || "purchase_unit"}
                                        </ColumnTablePopup>
                                        <ColumnTablePopup>
                                            {props.dataLang?.purchase_quantity || "purchase_quantity"}
                                        </ColumnTablePopup>
                                        <ColumnTablePopup>
                                            {"SL đã mua"}
                                        </ColumnTablePopup>
                                        <ColumnTablePopup>
                                            {"SL còn lại"}
                                        </ColumnTablePopup>
                                        <ColumnTablePopup>
                                            {props.dataLang?.purchase_note || "purchase_note"}
                                        </ColumnTablePopup>
                                    </HeaderTablePopup>
                                    {isFetching ? (
                                        <Loading
                                            className="max-h-28"
                                            color="#0f4f9e"
                                        />
                                    ) : data?.items?.length > 0 ? (
                                        <>
                                            <Customscrollbar className="min-h-[150px] max-h-[200px] 2xl:max-h-[166px] overflow-y-auto overflow-x-hidden">
                                                <div className="divide-y divide-slate-200 min:h-[200px] h-[100%] max:h-[300px]">
                                                    {data?.items?.map((e) => (
                                                        <div
                                                            className="grid items-center grid-cols-8 py-1.5 px-2 hover:bg-slate-100/40 "
                                                            key={e.id.toString()}
                                                        >
                                                            <h6 className="text-[13px]   py-0.5 col-span-1  rounded-md text-center mx-auto">
                                                                {/* {e?.item?.images != null ? (
                                                                    <ModalImage
                                                                        small={e?.item?.images}
                                                                        large={e?.item?.images}
                                                                        alt="Product Image"
                                                                        className="object-cover rounded w-[50px] h-[60px]"
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
                                                                )} */}
                                                                {/* <ImagesModal
                                                                    data={{
                                                                        images: e?.item?.images,
                                                                        nameAlt: e?.item?.name
                                                                    }}
                                                                /> */}
                                                                <ImagesItem data={e?.item} />

                                                            </h6>

                                                            <h6 className="text-[13px] font-medium  px-2 py-0.5 col-span-1 text-left">
                                                                {e?.item?.name}
                                                            </h6>
                                                            <h6 className="text-[13px] font-medium  px-2 py-0.5 col-span-1 text-left break-words">
                                                                {
                                                                    e?.item?.product_variation
                                                                }
                                                            </h6>
                                                            <h6 className="text-[13px] font-medium  px-2 py-0.5 col-span-1 text-center break-words">
                                                                {
                                                                    e?.item?.unit_name
                                                                }
                                                            </h6>
                                                            <h6 className="text-[13px] font-medium  px-2 py-0.5 col-span-1 text-center">
                                                                {formatNumber(e?.quantity)}
                                                            </h6>
                                                            <h6 className="text-[13px] font-medium  px-2 py-0.5 col-span-1 text-center">
                                                                {formatNumber(e?.quantity_create)}
                                                            </h6>
                                                            <h6 className="text-[13px] font-medium  px-2 py-0.5 col-span-1 text-center">
                                                                {Number(e?.quantity_left) < 0 ? "Đặt dư" + " " + formatNumber(Number(Math.abs(e?.quantity_left))) : formatNumber(e?.quantity_left)}
                                                            </h6>
                                                            <h6 className="text-[13px] font-medium  px-2 py-0.5 col-span-1 text-left">
                                                                <ExpandableContent content={e?.note ?? ''} />
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
                                <h2 className="font-medium p-2  border-b border-b-[#E7EAEE]  border-t z-10 border-t-[#E7EAEE] text-[13px] border-opacity-70">
                                    {props.dataLang?.purchase_total || "purchase_total"}
                                </h2>
                                <div className="grid flex-col justify-between grid-cols-12 mt-5 ">
                                    <div className="col-span-9">
                                        <h3 className="text-[13px] p-1 font-medium">
                                            {props.dataLang?.purchase_note || "import_from_note"}
                                        </h3>
                                        <textarea
                                            className="resize-none text-[13px] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 placeholder:text-slate-300 w-[90%] min-h-[70px]  max-h-[70px] bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-1 outline-none "
                                            disabled
                                            value={data?.note}
                                        />
                                    </div>
                                    <div className="col-span-3 space-y-2">
                                        <div className="flex justify-between ">
                                            <div className="font-normal text-[13px]">
                                                <h3 className="font-medium">
                                                    {props.dataLang?.purchase_totalCount || "purchase_totalCount"}
                                                </h3>
                                            </div>
                                            <div className="font-normal text-[13px]">
                                                <h3 className="text-blue-600">
                                                    {formatNumber(totalQuantity)}
                                                </h3>
                                            </div>
                                        </div>
                                        <div className="flex justify-between ">
                                            <div className="font-normal text-[13px]">
                                                <h3 className="font-medium">
                                                    {props.dataLang?.purchase_totalItem || "purchase_totalItem"}
                                                </h3>
                                            </div>
                                            <div className="font-normal text-[13px]">
                                                <h3 className="text-blue-600">
                                                    {formatNumber(data?.items?.length)}
                                                </h3>
                                            </div>
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
