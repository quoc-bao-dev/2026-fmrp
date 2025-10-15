import apiProducts from "@/Api/apiProducts/products/apiProducts";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import { ColumnTablePopup, HeaderTablePopup } from "@/components/UI/common/TablePopup";
import TagBranch from "@/components/UI/common/Tag/TagBranch";
import { TagColorProduct } from "@/components/UI/common/Tag/TagStatus";
import Loading from "@/components/UI/loading/loading";
import NoData from "@/components/UI/noData/nodata";
import PopupCustom from "@/components/UI/popup";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import useSetingServer from "@/hooks/useConfigNumber";
import useToast from "@/hooks/useToast";
import { formatMoment } from "@/utils/helpers/formatMoment";
import formatMoneyConfig from "@/utils/helpers/formatMoney";
import formatNumberConfig from "@/utils/helpers/formatnumber";
import { useQuery } from "@tanstack/react-query";
import { TickCircle as IconTick, UserEdit as IconUserEdit } from "iconsax-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useProductDetail } from "../../hooks/product/useProductDetail";
import { useProductDetailStage } from "../../hooks/product/useProductDetailStage";
import Popup_Bom from "./popupBom";
import Popup_GiaiDoan from "./popupStage";
const Popup_Detail = React.memo((props) => {
    const isShow = useToast();

    const dataSeting = useSetingServer()

    const formatNumber = (number) => {
        return formatNumberConfig(+number, dataSeting)
    }

    const formatMoney = (number) => {
        return formatMoneyConfig(+number, dataSeting)
    }

    const [open, sOpen] = useState(false);

    const _ToggleModal = (e) => sOpen(e);

    const [tab, sTab] = useState(0);

    const _HandleSelectTab = (e) => sTab(e);

    const [tabBom, sTabBom] = useState(0);

    const _HandleSelectTabBom = (e) => sTabBom(e);

    const [dataBom, sDataBom] = useState([]);

    const [selectedListBom, sSelectedListBom] = useState([]);

    // dữ liệu chi tiết thành  phẩm
    const { data: list, isFetching, isLoading } = useProductDetail(open, props.id)

    // dữ liệu công đoạn
    const { data: dataStage, isFetching: isFetchingStage, isLoading: isLoadingStage, refetch: refetchStage } = useProductDetailStage(open, props.id)

    // dữ liệu định mức BOM
    const { isFetching: isFetchingBom, isLoading: isLoadingBom, refetch: refetchBom } = useQuery({
        queryKey: ["detail_bom_product"],
        queryFn: async () => {
            const params = {
                id: props.id,
            }
            const { data } = await apiProducts.apiDetailBomProducts({ params })

            sDataBom(data?.variations || []);

            sTabBom(data?.variations[0]?.product_variation_option_value_id);

            return data
        },
        enabled: !!open
    })


    useEffect(() => {
        open && sTab(0);
    }, [open]);

    // kiểm tra tab và data có trùng với tab BOM hay không, nếu có thì chuyển tab BOM
    useEffect(() => {
        open && tabBom && sSelectedListBom(dataBom.find((item) => item.product_variation_option_value_id === tabBom));
        open && dataBom && sSelectedListBom(dataBom.find((item) => item.product_variation_option_value_id === tabBom));
    }, [tabBom, dataBom]);

    // 4 tab ở trên popup
    const dataTab = [
        {
            id: 0,
            name: props.dataLang?.information || "information",
        },
        {
            id: 1,
            name: props.dataLang?.category_material_list_variant || "category_material_list_variant",
        },
        {
            id: 2,
            name: props.dataLang?.bom_finishedProduct || "bom_finishedProduct",
        },
        {
            id: 3,
            name: props.dataLang?.stage_finishedProduct || "stage_finishedProduct",
        }
    ]
    return (
        <PopupCustom
            title={"Chi tiết thành phẩm"}
            button={props.children}
            onClickOpen={_ToggleModal.bind(this, true)}
            open={open}
            onClose={_ToggleModal.bind(this, false)}
            nested
            classNameBtn={props.classNameBtn}
        >
            <div className="py-4 xl:w-[1000px] w-[900px] space-y-5">
                <div className="flex items-center space-x-4 border-[#E7EAEE] border-opacity-70 border-b-[1px]">
                    {dataTab?.map((item) => (
                        <button
                            onClick={() => {
                                if ([2, 3].includes(item.id) && props?.dataProduct?.type_products?.id == 2) {
                                    isShow("error", `Bán thành phẩm mua ngoài, không có ${item.name.toLowerCase()}`);
                                } else {
                                    _HandleSelectTab(item.id)
                                }
                            }
                            }
                            className={`${tab === item.id ? "text-[#0F4F9E]  border-b-2 border-[#0F4F9E]" : "hover:text-[#0F4F9E] "}  px-4 py-2 outline-none font-medium`}
                        >
                            {item.name}
                        </button>
                    ))}

                </div>
                {(isFetching || isLoading) ? (
                    <Loading className="h-96" color="#0f4f9e" />
                ) : (
                    <React.Fragment>
                        {tab === 0 && (
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-5">
                                    <div className="p-2 space-y-3 rounded-md bg-slate-100/40">
                                        <div className="flex justify-between">
                                            <h5 className="text-slate-400 text-sm w-[40%]">
                                                {props.dataLang?.client_list_brand || "client_list_brand"}:
                                            </h5>
                                            <div className="w-[55%] flex flex-col gap-1.5 items-end">
                                                {list?.branch?.map((e) => (
                                                    <TagBranch key={e.id.toString()} className="w-fit">
                                                        {e.name}
                                                    </TagBranch>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <h5 className="text-slate-400 text-sm w-[40%]">
                                                {props.dataLang?.category_titel}:
                                            </h5>
                                            <h6 className="w-[55%] text-right">{list?.category_name}</h6>
                                        </div>
                                        <div className="flex justify-between">
                                            <h5 className="text-slate-400 text-sm w-[40%]">
                                                {props.dataLang?.code_finishedProduct}:
                                            </h5>
                                            <h6 className="w-[55%] text-right">{list?.code}</h6>
                                        </div>
                                        <div className="flex justify-between">
                                            <h5 className="text-slate-400 text-sm w-[40%]">
                                                {props.dataLang?.name_finishedProduct}:
                                            </h5>
                                            <h6 className="w-[55%] text-right">{list?.name}</h6>
                                        </div>
                                        <div className="flex justify-between">
                                            <h5 className="text-slate-400 text-sm w-[40%]">
                                                {props.dataLang?.type_finishedProduct}:
                                            </h5>
                                            <div className="w-[55%] text-right">
                                                {/* {props.dataLang[list?.type_products?.name]} */}
                                                {/* <span
                                                    className={`py-[1px] px-1 rounded border h-fit w-fit font-[300] break-words leading-relaxed text-xs
                                                         ${(list?.type_products?.id === 0 && "text-lime-500 border-lime-500") ||
                                                        (list?.type_products?.id === 1 && "text-orange-500 border-orange-500") ||
                                                        (list?.type_products?.id === 2 && "text-sky-500 border-sky-500")
                                                        }`}
                                                >
                                                    {props.dataLang[list?.type_products?.name] || list?.type_products?.name}
                                                </span> */}
                                                <TagColorProduct
                                                    className='!py-1.5' dataLang={props.dataLang}
                                                    dataKey={list?.type_products?.id}
                                                    name={list?.type_products?.name}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <h5 className="text-slate-400 text-sm w-[40%]">{props.dataLang?.unit}:</h5>
                                            <h6 className="w-[55%] text-right">{list?.unit}</h6>
                                        </div>
                                        <div className="flex justify-between">
                                            <h5 className="text-slate-400 text-sm w-[40%]">{props.dataLang?.stock}:</h5>
                                            <h6 className="w-[55%] text-right">
                                                {formatNumber(list?.stock_quantity)}
                                            </h6>
                                        </div>
                                        {props.dataProductExpiry?.is_enable === "1" && (
                                            <div className="flex justify-between">
                                                <h5 className="text-slate-400 text-sm w-[40%]">
                                                    {props.dataLang?.category_material_list_expiry_date}:
                                                </h5>
                                                <h6 className="w-[55%] text-right">{list?.expiry}</h6>
                                            </div>
                                        )}
                                        <div className="flex justify-between">
                                            <h5 className="text-slate-400 text-sm w-[40%]">{props.dataLang?.note}:</h5>
                                            <h6 className="w-[55%] text-right">{list?.note}</h6>
                                        </div>
                                    </div>
                                    <div className="p-2 space-y-3 rounded-md bg-slate-100/40">
                                        <div className="flex justify-between">
                                            <h5 className="text-slate-400 text-sm w-[40%]">Giá bán:</h5>
                                            <h6 className="w-[55%] text-right">
                                                {formatMoney(list?.price_sell)}
                                            </h6>
                                        </div>
                                        <div className="flex justify-between">
                                            <h5 className="text-slate-400 text-sm w-[40%]">
                                                {props.dataLang?.minimum_amount}:
                                            </h5>
                                            <h6 className="w-[55%] text-right">
                                                {formatNumber(list?.quantity_minimum)}
                                            </h6>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col justify-between space-y-3">
                                    <div className="flex p-2 rounded-md bg-slate-100/40">
                                        <h5 className="text-slate-400 text-sm w-[40%]">
                                            {props.dataLang?.avatar || "avatar"}:
                                        </h5>
                                        {list?.images == null ? (
                                            <img
                                                src="/icon/noimagelogo.png"
                                                className="object-contain w-48 h-48 rounded pointer-events-none select-none"
                                            />
                                        ) : (
                                            <Image
                                                width={200}
                                                height={200}
                                                quality={100}
                                                src={list?.images}
                                                alt="thumb type"
                                                className="object-contain w-48 h-48 rounded pointer-events-none select-none"
                                                loading="lazy"
                                                crossOrigin="anonymous"
                                                placeholder="blur"
                                                blurDataURL="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                                            />
                                        )}
                                    </div>
                                    <div className="p-2 space-y-3 rounded-md bg-slate-100/40">
                                        <h4 className="flex space-x-2">
                                            <IconUserEdit size={20} />
                                            <span className="text-[15px] font-medium">Người lập phiếu</span>
                                        </h4>
                                        <div className="flex justify-between">
                                            <h5 className="text-slate-400 text-sm w-[30%]">
                                                {props.dataLang?.creator || "creator"}:
                                            </h5>
                                            <h6 className="w-[65%] text-right">{list?.name_created_by}</h6>
                                        </div>
                                        <div className="flex justify-between">
                                            <h5 className="text-slate-400 text-sm w-[30%]">
                                                {props.dataLang?.date_created || "date_created"}:
                                            </h5>
                                            <h6 className="w-[65%] text-right">{formatMoment(list?.date_created, FORMAT_MOMENT.DATE_TIME_SLASH_LONG)}</h6>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {tab === 1 && (
                            <React.Fragment>
                                {list?.variation_option_value?.length > 0 ? (
                                    <div className="space-y-0.5 min-h-[384px]">
                                        <HeaderTablePopup gridCols={4} >
                                            <ColumnTablePopup textAlign={'center'}>
                                                {props.dataLang?.avatar}
                                            </ColumnTablePopup>
                                            <ColumnTablePopup textAlign={'center'}>
                                                {list?.variation[0]?.name}
                                            </ColumnTablePopup>
                                            <ColumnTablePopup textAlign={'center'}>
                                                {list?.variation[1]?.name ? list?.variation[1]?.name : ""}
                                            </ColumnTablePopup>
                                            <ColumnTablePopup textAlign={'right'}>
                                                {props.dataLang?.price || "price"}
                                            </ColumnTablePopup>
                                        </HeaderTablePopup>
                                        <Customscrollbar className="max-h-[450px]">
                                            <div className="divide-y divide-slate-200">
                                                {list?.variation_option_value?.map((e) => (
                                                    <div
                                                        key={e?.id ? e?.id.toString() : ""}
                                                        className={`${e?.variation_option_2?.length > 0
                                                            ? "grid-cols-4"
                                                            : "grid-cols-4"
                                                            } grid gap-2 px-2 py-2.5 hover:bg-slate-50`}
                                                    >
                                                        <div className="flex items-center self-center justify-center">
                                                            {e?.image == null ? (
                                                                <img
                                                                    src="/icon/noimagelogo.png"
                                                                    className="object-contain w-auto h-20 rounded pointer-events-none select-none"
                                                                />
                                                            ) : (
                                                                <Image
                                                                    width={200}
                                                                    height={200}
                                                                    quality={100}
                                                                    src={e?.image}
                                                                    alt="thumb type"
                                                                    className="object-contain w-auto h-20 rounded pointer-events-none select-none"
                                                                    loading="lazy"
                                                                    crossOrigin="anonymous"
                                                                    blurDataURL="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                                                                />
                                                            )}
                                                        </div>
                                                        <h6 className="self-center px-2 text-xs text-center xl:text-base">
                                                            {e?.name}
                                                        </h6>
                                                        {e?.variation_option_2?.length > 0 ? (
                                                            <div className="self-center space-y-0.5 col-span-2 grid grid-cols-2">
                                                                {e?.variation_option_2?.map((ce) => (
                                                                    <React.Fragment key={ce.id ? ce.id?.toString() : ""}>
                                                                        <h6 className="px-2 text-xs text-center xl:text-base">
                                                                            {ce.name}
                                                                        </h6>
                                                                        <h6 className="px-2 text-xs text-right xl:text-base">
                                                                            {formatMoney(ce.price)}
                                                                        </h6>
                                                                    </React.Fragment>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <h6 className="self-center px-2 text-xs text-right xl:text-base">
                                                                {formatMoney(e?.price)}
                                                            </h6>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </Customscrollbar>
                                    </div>
                                ) : <NoData />}
                            </React.Fragment>
                        )}
                        {tab === 2 && (
                            <>
                                {(isFetchingBom || isLoadingBom) ? (
                                    <Loading className="h-96" color="#0f4f9e" />
                                ) : (
                                    <>
                                        {dataBom?.length > 0 ? (
                                            <div className="space-y-0.5 min-h-[384px]">
                                                <div className="flex items-center justify-start pb-3 space-x-3 overflow-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                                                    {dataBom?.map((e) => (
                                                        <button
                                                            key={e.product_variation_option_value_id.toString()}
                                                            onClick={_HandleSelectTabBom.bind(
                                                                this,
                                                                e.product_variation_option_value_id
                                                            )}
                                                            className={`${tabBom === e.product_variation_option_value_id
                                                                ? "text-[#0F4F9E] bg-[#0F4F9E10]"
                                                                : "hover:text-[#0F4F9E] bg-slate-50/50"
                                                                } outline-none min-w-fit px-3 py-1.5 rounded relative flex items-center`}
                                                        >
                                                            <span>
                                                                {e.name_variation?.includes("NONE")
                                                                    ? "Mặc định"
                                                                    : e.name_variation}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                                <HeaderTablePopup gridCols={13}    >
                                                    <ColumnTablePopup colSpan={3}>
                                                        {props.dataLang?.warehouses_detail_type || "warehouses_detail_type"}
                                                    </ColumnTablePopup>
                                                    <ColumnTablePopup colSpan={2}>
                                                        {props.dataLang?.name || "name"}
                                                    </ColumnTablePopup>
                                                    <ColumnTablePopup colSpan={2}>
                                                        {props.dataLang?.unit}
                                                    </ColumnTablePopup>
                                                    <ColumnTablePopup colSpan={2}>
                                                        {props.dataLang?.norm_finishedProduct || "norm_finishedProduct"}
                                                    </ColumnTablePopup>
                                                    <ColumnTablePopup colSpan={2}>
                                                        % {props.dataLang?.loss_finishedProduct || "loss_finishedProduct"}
                                                    </ColumnTablePopup>
                                                    <ColumnTablePopup colSpan={2}>
                                                        {props.dataLang?.stage_usage_finishedProduct}
                                                    </ColumnTablePopup>
                                                </HeaderTablePopup>

                                                <Customscrollbar className="min-h-[250px] max-h-[450px]">
                                                    <div className="divide-y divide-slate-200">
                                                        {selectedListBom?.items?.map((e, index) => (
                                                            <div
                                                                key={e?.id ? e?.id.toString() : ""}
                                                                className={`grid grid-cols-13 px-2 py-2.5 hover:bg-slate-50 items-center`}
                                                            >
                                                                {/* <h6 className="px-2 xl:text-[15px] text-xs col-span-2">
                                                                    {e?.str_type_item}
                                                                </h6> */}
                                                                <div className="flex items-center justify-center col-span-3 gap-1">
                                                                    {/* <span
                                                                        className={`py-[1px] px-1 rounded border h-fit w-fit font-[300] break-words leading-relaxed text-xs
                                                                     ${(e?.item_type_current === "products" && "text-lime-500 border-lime-500") ||
                                                                            (e?.item_type_current == "semi_products" && "text-orange-500 border-orange-500") ||
                                                                            (e?.item_type_current == "out_side" && "text-sky-500 border-sky-500") ||
                                                                            (e?.item_type_current == "material" && "text-purple-500 border-purple-500") ||
                                                                            (e?.item_type_current == "semi_products_outside" && "text-green-500 border-green-500")
                                                                            }`}
                                                                    >
                                                                        {e?.str_type_item ?? ""}
                                                                    </span> */}
                                                                    <TagColorProduct
                                                                        dataKey={
                                                                            e?.item_type_current === "products" ? 0 :
                                                                                e?.item_type_current === "semi_products" ? 1 :
                                                                                    e?.item_type_current === "out_side" ? 2 :
                                                                                        e?.item_type_current === "material" ? 3 :
                                                                                            e?.item_type_current === "semi_products_outside" ? 4 :
                                                                                                null
                                                                        }
                                                                        lang={false}
                                                                        name={e?.str_type_item}
                                                                    />
                                                                </div>
                                                                <h6 className="col-span-2 px-2 text-xs 2xl:text-base xl:text-sm">
                                                                    <div className="grid grid-cols-1">
                                                                        <h5>{e?.item_name}</h5>
                                                                        <h5 className="text-xs italic">
                                                                            {e?.variation_name}
                                                                        </h5>
                                                                    </div>
                                                                </h6>
                                                                <h6 className="col-span-2 px-2 text-xs text-center 2xl:text-base xl:text-sm">
                                                                    {e?.unit_name}
                                                                </h6>
                                                                <h6 className="col-span-2 px-2 text-xs text-center 2xl:text-base xl:text-sm">
                                                                    {formatNumber(e?.quota)}
                                                                </h6>
                                                                <h6 className="col-span-2 px-2 text-xs text-center 2xl:text-base xl:text-sm">
                                                                    {formatNumber(e?.loss)}%
                                                                </h6>
                                                                <h6 className="col-span-2 px-2 text-xs text-center 2xl:text-base xl:text-sm">
                                                                    {e?.stage_name}
                                                                </h6>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </Customscrollbar>
                                                <div className="flex items-center justify-end space-x-3">
                                                    <Popup_Bom
                                                        dataLang={props.dataLang}
                                                        id={props.id}
                                                        name={list?.name}
                                                        code={list?.code}
                                                        type="edit"
                                                        onRefresh={props.onRefresh}
                                                        onRefreshBom={refetchBom}
                                                    />
                                                </div>
                                            </div>
                                        ) :
                                            <NoData />
                                        }
                                    </>
                                )}
                            </>
                        )}
                        {tab === 3 && (
                            <>
                                {(isFetchingStage || isLoadingStage) ? (
                                    <Loading className="h-96" color="#0f4f9e" />
                                ) : (
                                    <React.Fragment>
                                        {dataStage?.length > 0 ? (
                                            <div className="space-y-0.5 min-h-[384px]">
                                                <HeaderTablePopup gridCols={8}>
                                                    <ColumnTablePopup>
                                                        {props.dataLang?.no || "no"}
                                                    </ColumnTablePopup>
                                                    <ColumnTablePopup colSpan={2}>
                                                        {props.dataLang?.stage_finishedProduct}
                                                    </ColumnTablePopup>
                                                    <ColumnTablePopup colSpan={3}>
                                                        {props.dataLang?.check_first_stage_finishedProduct}
                                                    </ColumnTablePopup>
                                                    <ColumnTablePopup colSpan={2}>
                                                        {props.dataLang?.stage_last_finishedProduct}
                                                    </ColumnTablePopup>
                                                </HeaderTablePopup>
                                                <Customscrollbar className="min-h-[250px] max-h-[450px]" >
                                                    <div className="divide-y divide-slate-200">
                                                        {dataStage?.map((e, index) => (
                                                            <div
                                                                key={e?.id ? e?.id.toString() : ""}
                                                                className={`grid-cols-8 grid gap-2 px-2 py-2.5 hover:bg-slate-50 items-center`}
                                                            >
                                                                <h6 className="px-2 text-xs text-center xl:text-base">
                                                                    {index + 1}
                                                                </h6>
                                                                <h6 className="col-span-2 px-2 text-xs xl:text-base">
                                                                    {e?.stage_name}
                                                                </h6>
                                                                <h6 className="flex justify-center col-span-3 px-2 text-xs text-green-600 xl:text-base">
                                                                    {e?.type == "2" && <IconTick />}
                                                                </h6>
                                                                <h6 className="flex justify-center col-span-2 px-2 text-xs text-green-600 xl:text-base">
                                                                    {e?.final_stage == "1" && <IconTick />}
                                                                </h6>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </Customscrollbar>
                                                <div className="flex items-center justify-end space-x-3">
                                                    <Popup_GiaiDoan
                                                        dataLang={props.dataLang}
                                                        id={props.id}
                                                        name={list?.name}
                                                        onRefresh={refetchStage.bind(this)}
                                                        code={list?.code}
                                                        typeOpen="edit"
                                                        className="px-4 py-2 text-base transition rounded-lg bg-slate-200 hover:opacity-90 hover:scale-105"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <NoData />
                                        )}
                                    </React.Fragment>
                                )}
                            </>
                        )}
                    </React.Fragment>
                )}
            </div>
        </PopupCustom>
    );
});

export default Popup_Detail