// giữ kho

import apiSalesOrder from "@/Api/apiSalesExportProduct/salesOrder/apiSalesOrder";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import { ColumnTablePopup, HeaderTablePopup } from "@/components/UI/common/TablePopup";
import TagBranch from "@/components/UI/common/Tag/TagBranch";
import SelectComponent from "@/components/UI/filterComponents/selectComponent";
import Loading from "@/components/UI/loading/loading";
import PopupCustom from "@/components/UI/popup";
import PopupConfim from "@/components/UI/popupConfim/popupConfim";
import Zoom from "@/components/UI/zoomElement/zoomElement";
import { optionsQuery } from "@/configs/optionsQuery";
import { CONFIRM_DELETION, TITLE_DELETE } from "@/constants/delete/deleteTable";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import useFeature from "@/hooks/useConfigFeature";
import useSetingServer from "@/hooks/useConfigNumber";
import useToast from "@/hooks/useToast";
import { useToggle } from "@/hooks/useToggle";
import { formatMoment } from "@/utils/helpers/formatMoment";
import formatNumberConfig from "@/utils/helpers/formatnumber";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Box1, Trash as IconDelete, SearchNormal1 as IconSearch, TickCircle } from "iconsax-react";
import { useEffect, useState } from "react";
import ModalImage from "react-modal-image";
import { NumericFormat } from "react-number-format";

const initialFetch = {
    onSending: false,
    onFetchingWarehouse: false,
    onFetchingCondition: false,
};
const PopupKeepStock = ({ dataLang, status, id, onRefresh, totalButtons = 0, ...props }) => {
    const dataSeting = useSetingServer()
    const formatNumber = (number) => {
        return formatNumberConfig(+number, dataSeting);
    }

    const isShow = useToast();

    const { dataProductExpiry, dataProductSerial, dataMaterialExpiry } = useFeature()

    const { isOpen, isId, handleQueryId } = useToggle();

    const [data, sData] = useState({});

    const [open, sOpen] = useState(false);

    const [dataClone, sDataClone] = useState({});

    const [dataWarehouse, sDataWarehouse] = useState([]);

    const [isIdWarehouse, sIsIdWarehouse] = useState(null);

    const [errorQuantity, sErrorQuantity] = useState(false);

    const [isFetching, sIsFetching] = useState(initialFetch);
    const showToat = useToast();
    const _ToggleModal = (e) => {
        status == "approved"
            ? sOpen(e)
            : showToat("error", "Trạng thái đơn hàng chưa được duyệt, vui lòng duyệt để giữ kho !");
    };

    const setIsFetch = (e) => sIsFetching((prev) => ({ ...prev, ...e }));

    useEffect(() => {
        sIsIdWarehouse(null);
    }, [open]);

    const { isFetching: isFetchingDetailKeepStookOrder } = useQuery({
        queryKey: ['api_detail_keep_stock_order', id, isIdWarehouse?.value],
        queryFn: async () => {
            const db = await apiSalesOrder.apiDetailKeepStockOrder(id, { params: { "filter[warehouse_id]": isIdWarehouse?.value } })
            sData(db);

            sDataClone(db);

            return db
        },
        enabled: open,
        ...optionsQuery
    })


    useQuery({
        queryKey: ["api_warehouse_combobox_not_system"],
        queryFn: async () => {
            const db = await apiSalesOrder.apiWarehouseComboboxNotSystem()

            sDataWarehouse(db.map((e) => ({ label: e.warehouse_name, value: e.id })));

            return db
        },
        enabled: open
    })

    const handleShow = (idParent, idChild) => {
        sData({
            ...data,
            items: data.items?.map((e) => {
                if (e?.id == idParent) {
                    return {
                        ...e,
                        item: {
                            ...e.item,
                            warehouse_location: e.item.warehouse_location?.map((i) => {
                                if (i.id == idChild) {
                                    return {
                                        ...i,
                                        show: !i.show,
                                        quantity_export: i.show ? i.quantity_export : 0,
                                    };
                                }
                                return i;
                            }),
                        },
                    };
                }
                return e;
            }),
        });
    };

    const handleDeleteItem = async () => {
        isShow("success", "Xóa mặt hàng thành công");

        handleQueryId({ status: false });

        const newItem = data.items?.filter((e) => e.id !== isId);

        sData({ ...data, items: newItem });
    };

    const validateQuantity = (newData, idParent, idChild) => {
        const db = newData?.find((e) => e?.id == idParent);

        const warehouse = db.item?.warehouse_location?.find((child) => child?.id == idChild);

        const quantityCount = db.item?.warehouse_location.reduce(
            (sum, opt) => sum + parseFloat(opt?.quantity_export || 0),
            0
        );

        if (quantityCount > +db.quantity_had_condition) {
            isShow(
                "error",
                `Tổng số lượng không được lớn hơn ${formatNumber(db.quantity_had_condition)} số lượng cần giữ`
            );
            warehouse.quantity_export = "";
            sData(dataClone);
        }
    };

    const handleChange = async (type, value, idParent, idChild) => {
        let newData = [];
        switch (type) {
            case "quantity_export":
                newData = data.items?.map((e) => {
                    if (e?.id === idParent) {
                        return {
                            ...e,
                            item: {
                                ...e.item,
                                warehouse_location: e.item.warehouse_location?.map((i) => {
                                    return {
                                        ...i,
                                        quantity_export: i.id == idChild ? value.value : i.quantity_export,
                                    };
                                }),
                            },
                        };
                    } else {
                        return e;
                    }
                });

                await validateQuantity(newData, idParent, idChild);

                break;
            default:
                newData = data.items;
        }
        sData({ ...data, items: [...newData] });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const checkPropertyRecursive = data?.items.some((e) =>
            e?.item?.warehouse_location?.some(
                (i) => i.show && (i.quantity_export == "" || i.quantity_export == 0 || i.quantity_export == "0")
            )
        );

        if (checkPropertyRecursive) {
            checkPropertyRecursive && sErrorQuantity(true);

            isShow("error", `${dataLang?.required_field_null}`);
        } else {
            setIsFetch({ onSending: true });
        }
    };

    const handingKeepStok = useMutation({
        mutationFn: (data) => {
            return apiSalesOrder.apiHanDingKeepStook(data);
        }
    })

    const sendingData = () => {
        let formData = new FormData();

        formData.append("idOrder", data?.id);

        formData.append("warehouse_id", isIdWarehouse?.value ? isIdWarehouse?.value : "");

        data?.items.forEach((e, index) => {
            formData.append(`items[${index}][order_item_id]`, e?.id ? e?.id : "");

            formData.append(`items[${index}][item]`, e?.item_complex_id ? e?.item_complex_id : "");

            if (e?.item?.warehouse_location?.length > 0) {
                e?.item?.warehouse_location.forEach((i, _) => {
                    if (i.show) {
                        formData.append(`items[${index}][warehouse_location][${_}][id]`, i?.id ? i?.id : "");

                        formData.append(
                            `items[${index}][warehouse_location][${_}][quantity_export]`,
                            i?.quantity_export ? i?.quantity_export : ""
                        );
                    }
                });
            } else {
                formData.append(`items[${index}][warehouse_location]`, "");
            }
        });
        handingKeepStok.mutate(formData, {
            onSuccess: ({ isSuccess, message }) => {
                if (isSuccess) {
                    isShow("success", `${dataLang[message] || message}`);
                    sOpen(false);
                } else {
                    isShow("error", `${dataLang[message] || message}`);
                }
                setIsFetch({ onSending: false });
            },
            onError: (error) => {
            }
        })
    };

    useEffect(() => {
        isFetching.onSending && sendingData();
    }, [isFetching.onSending]);


    return (
        <>
            <PopupCustom
                title={dataLang?.salesOrder_keep_stock || "salesOrder_keep_stock"}
                onClickOpen={_ToggleModal.bind(this, true)}
                open={open}
                onClose={_ToggleModal.bind(this, false)}
                classNameBtn={"w-full"}
                button={
                    <button
                        className={`group rounded-lg w-full p-1 border border-transparent transition-all ease-in-out flex items-center gap-2 responsive-text-sm text-left cursor-pointer
                            ${totalButtons > 3 
                                ? 'hover:bg-primary-05' 
                                : 'hover:border-orange-500 hover:bg-orange-50'
                            }`}
                    >
                        <Box1
                            size={20}
                            className={`size-5 transition-all duration-300 
                                ${totalButtons > 3 ? "text-neutral-03 group-hover:text-neutral-07" : "group-hover:text-orange-500"}`}
                        />
                        {totalButtons > 3 && (
                            <p className="text-neutral-03 group-hover:text-neutral-07 font-normal whitespace-nowrap">
                                {dataLang?.salesOrder_keep_stock || "salesOrder_keep_stock"}
                            </p>
                        )}
                    </button>
                }
            >
                <div className="flex items-center space-x-4 my-2 border-[#E7EAEE] border-opacity-70 border-b-[1px]"></div>
                <div className="3xl:w-[1300px] 2xl:w-[1150px] xl:w-[999px] w-[950px] 3xl:h-auto 2xl:max-h-auto xl:h-auto h-auto ">
                    <div className="flex flex-col pb-1 overflow-auto customsroll scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                        <h2 className="font-normal bg-[#ECF0F4] 3xl:p-2 p-1 3xl:text-[16px] 2xl:text-[16px] xl:text-[15px] text-[15px]">
                            {dataLang?.detail_general_information || "detail_general_information"}
                        </h2>
                        <div className="grid grid-cols-12 min-h-[100px]">
                            <div className="col-span-4">
                                <div className="grid grid-cols-6 my-3 font-medium xl:my-4 ">
                                    <h3 className="3xl:text-[14px] 2xl:text-[13px] xl:text-[12px] text-[11px] col-span-2 whitespace-nowrap">
                                        {dataLang?.sales_product_date || "sales_product_date"}:
                                    </h3>
                                    <h3 className="3xl:text-[14px] 2xl:text-[13px] xl:text-[12px] text-[11px] font-normal items-start col-span-4 ml-3">
                                        {data?.date != null ? formatMoment(data?.date, FORMAT_MOMENT.DATE_TIME_SLASH_LONG) : ""}
                                    </h3>
                                </div>
                                <div className="grid grid-cols-6 my-3 font-medium xl:my-4">
                                    <h3 className="3xl:text-[14px] 2xl:text-[13px] xl:text-[12px] text-[11px] col-span-2">
                                        {dataLang?.sales_product_code || "sales_product_code"}:
                                    </h3>
                                    <h3 className="3xl:text-[14px] 2xl:text-[13px] xl:text-[12px] text-[11px]  font-normal col-span-2 ml-3">
                                        {data?.code}
                                    </h3>
                                </div>
                            </div>

                            <div className="col-span-4 ">
                                <div className="grid grid-cols-6 my-3 font-medium xl:my-4">
                                    <h3 className="3xl:text-[14px] 2xl:text-[13px] xl:text-[12px] text-[11px] col-span-2">
                                        {dataLang?.price_quote_customer || "price_quote_customer"}:
                                    </h3>
                                    <h3 className="3xl:text-[14px] 2xl:text-[13px] xl:text-[12px] text-[11px] font-normal col-span-4">
                                        {data?.client_name}
                                    </h3>
                                </div>
                                <div className="grid grid-cols-6 my-3 font-medium xl:my-4">
                                    <h3 className="3xl:text-[14px] 2xl:text-[13px] xl:text-[12px] text-[11px] col-span-2">
                                        {dataLang?.price_quote_order_status || "price_quote_order_status"}:
                                    </h3>
                                    <h3 className="3xl:text-[12px] 2xl:text-[11px] xl:text-[11px] text-[10px] font-normal col-span-4">
                                        {(data?.status == "un_approved" && (
                                            <span className="border flex justify-center items-center rounded-2xl 3xl:w-24 2xl:w-20 xl:w-[74px] lg:w-[68px] 3xl:h-6 2xl:h-6 xl:h-5 lg:h-5 px-1 bg-red-200 border-red-200 text-red-500">
                                                Chưa Duyệt
                                            </span>
                                        )) ||
                                            (data?.status == "approved" && (
                                                <span className="border flex justify-center items-center rounded-2xl 3xl:w-24 2xl:w-20 xl:w-[74px] lg:w-[68px] 3xl:h-6 2xl:h-6 xl:h-5 lg:h-5 px-1 bg-lime-200 border-lime-200 text-lime-500">
                                                    Đã Duyệt
                                                </span>
                                            ))}
                                    </h3>
                                </div>
                            </div>
                            <div className="col-span-4 ">
                                <div className="grid grid-cols-6 my-3 font-medium xl:my-4">
                                    <h3 className="3xl:text-[14px] 2xl:text-[13px] xl:text-[12px] text-[11px] col-span-2">
                                        {dataLang?.sales_product_staff_in_charge || "sales_product_staff_in_charge"}:
                                    </h3>
                                    <h3 className="3xl:text-[14px] 2xl:text-[13px] xl:text-[12px] text-[11px]  font-normal col-span-2">
                                        {data?.staff_name}
                                    </h3>
                                </div>

                                <div className="grid grid-cols-6 my-3 font-medium xl:my-4">
                                    <h3 className="3xl:text-[14px] 2xl:text-[13px] xl:text-[12px] text-[11px] col-span-2">
                                        {dataLang?.price_quote_branch || "price_quote_branch"}:
                                    </h3>
                                    {/* <h3 className="3xl:text-[14px] 2xl:text-[13px] xl:text-[12px] text-[10px]  col-span-4 mr-2 px-2 max-w-[250px] w-fit max-h-[100px] text-center text-[#0F4F9E]  font-[400] py-0.5 border border-[#0F4F9E] rounded-[5.5px] ">
                                        {data?.branch_name}
                                    </h3> */}
                                    <div className="col-span-4">
                                        <TagBranch className='w-fit'>
                                            {data?.branch_name}
                                        </TagBranch>
                                    </div>
                                </div>
                                <div className="grid grid-cols-6 my-3 font-medium xl:my-4">
                                    <label className="3xl:text-[14px] 2xl:text-[13px] xl:text-[12px] text-[11px] col-span-2">
                                        {dataLang?.salesOrder_warehouse_list || "salesOrder_warehouse_list"}:
                                    </label>
                                    <h3 className="3xl:text-[14px] 2xl:text-[13px] xl:text-[12px] text-[11px]  font-normal col-span-4">
                                        <SelectComponent
                                            className={"border rounded z-20"}
                                            isClearable={true}
                                            placeholder={
                                                dataLang?.salesOrder_select_warehouse || "salesOrder_select_warehouse"
                                            }
                                            options={dataWarehouse}
                                            value={isIdWarehouse}
                                            maxMenuHeight={150}
                                            onChange={(e) => sIsIdWarehouse(e)}
                                        />
                                    </h3>
                                </div>
                            </div>
                        </div>
                        <div className="w-[100%] lx:w-[110%] ">
                            <HeaderTablePopup gridCols={13}>
                                <ColumnTablePopup colSpan={3}>
                                    {dataLang?.price_quote_item || "price_quote_item"}
                                </ColumnTablePopup>
                                <ColumnTablePopup>
                                    {dataLang?.price_quote_from_unit || "price_quote_from_unit"}
                                </ColumnTablePopup>
                                <ColumnTablePopup>
                                    {dataLang?.price_quote_quantity || "price_quote_quantity"}
                                </ColumnTablePopup>
                                <ColumnTablePopup>
                                    {dataLang?.salesOrder_qty_delivered || "salesOrder_qty_delivered"}
                                </ColumnTablePopup>
                                <ColumnTablePopup>
                                    {dataLang?.salesOrder_qty_production || "salesOrder_qty_production"}
                                </ColumnTablePopup>
                                <ColumnTablePopup>
                                    {dataLang?.salesOrder_qty_kept || "salesOrder_qty_kept"}
                                </ColumnTablePopup>
                                <ColumnTablePopup>
                                    {dataLang?.salesOrder_qty_nedds_kept || "salesOrder_qty_nedds_kept"}
                                </ColumnTablePopup>
                                <ColumnTablePopup colSpan={3}>
                                    {dataLang?.salesOrder_warehouse || "salesOrder_warehouse"}
                                </ColumnTablePopup>
                                <ColumnTablePopup>
                                    {dataLang?.salesOrder_action || "salesOrder_action"}
                                </ColumnTablePopup>
                            </HeaderTablePopup>
                            {isFetchingDetailKeepStookOrder ? (
                                <Loading className="max-h-40 2xl:h-[160px]" color="#0f4f9e" />
                            ) : data?.items?.length > 0 ? (
                                <>
                                    <Customscrollbar
                                        className="min-h-[90px] max-h-[170px] 2xl:max-h-[250px] overflow-hidden"
                                    >
                                        <div className="divide-y divide-slate-200 min:h-[200px] h-[100%] max:h-[300px]">
                                            {data?.items?.map((e) => (
                                                <div
                                                    className="grid items-center grid-cols-13 3xl:py-1.5 py-0.5 px-2 hover:bg-slate-100/40"
                                                    key={e?.id?.toString()}
                                                >
                                                    <h6 className="text-[13px] font-medium py-1 col-span-3 text-left">
                                                        <div className="flex items-center gap-2">
                                                            <div>
                                                                {e?.item?.images != null ? (
                                                                    <ModalImage
                                                                        small={e?.item?.images}
                                                                        large={e?.item?.images}
                                                                        alt="Product Image"
                                                                        className="custom-modal-image object-cover rounded w-[50px] h-[50px] mx-auto"
                                                                    />
                                                                ) : (
                                                                    <div className="w-[50px] h-[50px] object-cover  mx-auto">
                                                                        <ModalImage
                                                                            small="/icon/noimagelogo.png"
                                                                            large="/icon/noimagelogo.png"
                                                                            className="object-contain w-full h-full p-1 rounded"
                                                                        ></ModalImage>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h6 className="text-[13px] text-left font-medium capitalize">
                                                                    {e?.item?.name}
                                                                </h6>
                                                                <h6 className="text-[13px] text-left font-medium capitalize">
                                                                    {e?.item?.product_variation}
                                                                </h6>
                                                            </div>
                                                        </div>
                                                    </h6>
                                                    <h6 className="2xl:text-[13px] xl:text-[12px] text-[11px]  px-2 py-0.5 col-span-1  rounded-md text-center break-words">
                                                        {e?.item?.unit_name}
                                                    </h6>
                                                    <h6 className="2xl:text-[13px] xl:text-[12px] text-[11px]  px-2 py-0.5 col-span-1  rounded-md text-center break-words">
                                                        {formatNumber(e?.quantity)}
                                                    </h6>
                                                    <h6 className="2xl:text-[13px] xl:text-[12px] text-[11px]  px-2 py-0.5 col-span-1  rounded-md text-center break-words">
                                                        {formatNumber(e?.quantity_delivery)}
                                                    </h6>
                                                    <h6 className="2xl:text-[13px] xl:text-[12px] text-[11px]  px-2 py-0.5 col-span-1  rounded-md text-center break-words">
                                                        {formatNumber(e?.quantity_plan)}
                                                    </h6>
                                                    <h6 className="2xl:text-[13px] xl:text-[12px] text-[11px]  px-2 py-0.5 col-span-1  rounded-md text-center break-words">
                                                        {formatNumber(e?.quantity_condition)}
                                                    </h6>
                                                    <h6 className="2xl:text-[13px] xl:text-[12px] text-[11px]  px-2 py-0.5 col-span-1  rounded-md text-center break-words">
                                                        {formatNumber(e?.quantity_had_condition)}
                                                    </h6>
                                                    <h6
                                                        className={`2xl:text-[13px] flex items-start ${e?.item?.warehouse_location?.length > 1
                                                            ? "justify-start"
                                                            : "justify-center"
                                                            }  flex-wrap gap-2 xl:text-[12px] text-[11px] py-0.5 col-span-3  rounded-md  break-words`}
                                                    >
                                                        {e?.item?.warehouse_location?.length > 0 ? (
                                                            e?.item?.warehouse_location?.map((i) => {
                                                                return (
                                                                    <div
                                                                        key={i.id}
                                                                        className="w-[48%] grid grid-cols-1 items-start "
                                                                    >
                                                                        <Zoom>
                                                                            <div
                                                                                onClick={() => handleShow(e.id, i.id)}
                                                                                className={`border-gray-400  w-full text-[10px] font-medium bg-white hover:bg-gray-100 transition-all ease-in-out  border rounded-2xl py-1 px-2 flex items-center gap-1`}
                                                                            >
                                                                                <div>
                                                                                    {i.show ? (
                                                                                        <TickCircle
                                                                                            className="bg-blue-600 rounded-full "
                                                                                            color="white"
                                                                                            size={15}
                                                                                        />
                                                                                    ) : (
                                                                                        <div className="w-4 h-4 bg-transparent border border-gray-300 rounded-full" />
                                                                                    )}
                                                                                </div>
                                                                                <div className="flex flex-col items-start jus">
                                                                                    <h3>
                                                                                        {i.location_name} -
                                                                                        <span className="pl-1 text-blue-500">
                                                                                            {i.quantity}
                                                                                        </span>
                                                                                    </h3>
                                                                                    <div className="flex flex-wrap items-center font-oblique">
                                                                                        {dataProductSerial.is_enable ===
                                                                                            "1" ? (
                                                                                            <div className="flex gap-0.5">
                                                                                                <h6 className="text-[8px]">
                                                                                                    Serial:
                                                                                                </h6>
                                                                                                <h6 className="text-[9px] px-1  w-[full] text-left ">
                                                                                                    {i.serial == null ||
                                                                                                        i.serial == ""
                                                                                                        ? "-"
                                                                                                        : i?.serial}
                                                                                                </h6>
                                                                                            </div>
                                                                                        ) : (
                                                                                            ""
                                                                                        )}
                                                                                        {dataMaterialExpiry.is_enable ===
                                                                                            "1" ||
                                                                                            dataProductExpiry.is_enable ===
                                                                                            "1" ? (
                                                                                            <>
                                                                                                <div className="flex gap-0.5">
                                                                                                    <h6 className="text-[8px]">
                                                                                                        Lot:
                                                                                                    </h6>{" "}
                                                                                                    <h6 className="text-[9px] px-1  w-[full] text-left ">
                                                                                                        {i.lot ==
                                                                                                            null ||
                                                                                                            i.lot == ""
                                                                                                            ? "-"
                                                                                                            : i?.lot}
                                                                                                    </h6>
                                                                                                </div>
                                                                                                <div className="flex gap-0.5">
                                                                                                    <h6 className="text-[8px]">
                                                                                                        Date:
                                                                                                    </h6>{" "}
                                                                                                    <h6 className="text-[9px] px-1  w-[full] text-center ">
                                                                                                        {i?.expiration_date ? formatMoment(i?.expiration_date, FORMAT_MOMENT.DATE_SLASH_LONG) : "-"}
                                                                                                    </h6>
                                                                                                </div>
                                                                                            </>
                                                                                        ) : (
                                                                                            ""
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </Zoom>
                                                                        {i.show && (
                                                                            <NumericFormat
                                                                                className={`${i.show &&
                                                                                    errorQuantity &&
                                                                                    (i.quantity_export == "" ||
                                                                                        i.quantity_export == 0 ||
                                                                                        i.quantity_export == "0")
                                                                                    ? "border-red-500 focus:border-red-500"
                                                                                    : "border-gray-300 focus:border-blue-400"
                                                                                    } py-1 px-2 my-1   border outline-none rounded-3xl w-full`}
                                                                                onValueChange={(event) =>
                                                                                    handleChange(
                                                                                        "quantity_export",
                                                                                        event,
                                                                                        e.id,
                                                                                        i.id
                                                                                    )
                                                                                }
                                                                                id={`${i.id}`}
                                                                                value={i.quantity_export}
                                                                                allowNegative={false}
                                                                                decimalScale={0}
                                                                                isNumericString={true}
                                                                                thousandSeparator=","
                                                                                isAllowed={(values) => {
                                                                                    const {
                                                                                        value,
                                                                                        formattedValue,
                                                                                        floatValue,
                                                                                    } = values;
                                                                                    const newValue = +value;
                                                                                    if (newValue > +i.quantity) {
                                                                                        isShow(
                                                                                            "error",
                                                                                            "Số lượng vượt quá số tồn kho."
                                                                                        );
                                                                                        return;
                                                                                    }
                                                                                    if (
                                                                                        newValue >
                                                                                        +e?.quantity_had_condition
                                                                                    ) {
                                                                                        isShow(
                                                                                            "error",
                                                                                            `Số lượng chỉ được bé hơn hoặc bằng ${formatNumber(
                                                                                                e?.quantity_had_condition
                                                                                            )} số lượng cần giữ`
                                                                                        );
                                                                                        return;
                                                                                    }
                                                                                    return true;
                                                                                }}
                                                                            />
                                                                        )}
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <span className="px-3 py-1 font-normal text-red-500 bg-red-200 rounded-2xl">
                                                                Tồn kho hết
                                                            </span>
                                                        )}
                                                    </h6>
                                                    <div className="flex items-center justify-center col-span-1">
                                                        <button
                                                            onClick={(event) =>
                                                                handleQueryId({ id: e.id, status: true })
                                                            }
                                                            type="button"
                                                            title="Xóa"
                                                            className="transition w-[40px] h-10 rounded-[5.5px] hover:text-red-600 text-red-500 flex flex-col justify-center items-center"
                                                        >
                                                            <IconDelete />
                                                        </button>
                                                    </div>
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
                                            {dataLang?.price_quote_table_item_not_found ||
                                                "price_quote_table_item_not_found"}
                                        </h1>
                                        <div className="flex items-center justify-around mt-6 "></div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="grid flex-col justify-between grid-cols-12 mt-2 text-right border-t">
                            <div className="grid grid-cols-7 col-span-7 font-medium text-left">
                                <h3 className="3xl:text-[15px] 2xl:text-[14px] xl:text-[12px] text-[11px] ">
                                    {dataLang?.price_quote_note || "price_quote_note"}
                                </h3>
                                <h3 className="3xl:text-[15px] 2xl:text-[14px] xl:text-[12px] text-[11px] col-span-5 font-normal rounded-lg">
                                    {data?.note}
                                </h3>
                            </div>
                            <div className="col-span-3 space-y-2"></div>
                            <div className="col-span-2 space-y-2">
                                <div className="mt-5 mr-2 space-x-2 text-right">
                                    <button
                                        type="button"
                                        onClick={_ToggleModal.bind(this, false)}
                                        className="button text-[#344054] font-normal text-base py-2 px-4 rounded-[5.5px] border border-solid border-[#D0D5DD] hover:scale-105 transition-all ease-linear"
                                    >
                                        {dataLang?.branch_popup_exit || "branch_popup_exit"}
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        type="submit"
                                        className="button text-[#FFFFFF]  font-normal text-base py-2 px-4 rounded-[5.5px] bg-[#003DA0] hover:scale-105 transition-all ease-linear"
                                    >
                                        {dataLang?.branch_popup_save || "branch_popup_save"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <PopupConfim
                    dataLang={dataLang}
                    type="warning"
                    nameModel={"salesOrder"}
                    title={TITLE_DELETE}
                    subtitle={CONFIRM_DELETION}
                    isOpen={isOpen}
                    save={handleDeleteItem}
                    cancel={() => handleQueryId({ status: false })}
                />
            </PopupCustom>
        </>
    );
};
export default PopupKeepStock;
