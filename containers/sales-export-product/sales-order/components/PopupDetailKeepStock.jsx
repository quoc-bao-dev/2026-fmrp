// Danh sách dữ kho

import apiSalesOrder from "@/Api/apiSalesExportProduct/salesOrder/apiSalesOrder";
import OnResetData from "@/components/UI/btnResetData/btnReset";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import { ColumnTablePopup, HeaderTablePopup } from "@/components/UI/common/TablePopup";
import ExcelFileComponent from "@/components/UI/filterComponents/excelFilecomponet";
import SelectComponent from "@/components/UI/filterComponents/selectComponent";
import Loading from "@/components/UI/loading/loading";
import NoData from "@/components/UI/noData/nodata";
import PopupCustom from "@/components/UI/popup";
import PopupConfim from "@/components/UI/popupConfim/popupConfim";
import { CONFIRM_DELETION, TITLE_DELETE } from "@/constants/delete/deleteTable";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import { useWarehouseByBranch, useWarehouseTranfer } from "@/hooks/common/useWarehouses";
import { useChangeValue } from "@/hooks/useChangeValue";
import useFeature from "@/hooks/useConfigFeature";
import useSetingServer from "@/hooks/useConfigNumber";
import useToast from "@/hooks/useToast";
import { useToggle } from "@/hooks/useToggle";
import { formatMoment } from "@/utils/helpers/formatMoment";
import formatNumberConfig from "@/utils/helpers/formatnumber";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight2, BoxSearch, Trash as IconDelete } from "iconsax-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import ModalImage from "react-modal-image";
import { v4 as uuid } from "uuid";
import { useWarehouseProperties } from "@/containers/manufacture/warehouse-transfer/hooks/useWarehouseProperties";

const Popup_EditDetail = dynamic(() => import("./PopupEditDetail"), { ssr: false });

const initialValues = {
    idTranfer: null,
    idWarehouse: null,
    idStatus: null,
};

const PopupDetailKeepStock = (props) => {
    const { dataLang, id, totalButtons = 0 } = props;

    const [data, sData] = useState({});

    let dataClone = { ...data };

    const isShow = useToast();

    const [open, sOpen] = useState(false);

    const { isOpen, isId, handleQueryId } = useToggle();

    const { isValue, sIsValue, onChangeValue } = useChangeValue(initialValues);

    const dataSeting = useSetingServer();

    const _ToggleModal = (e) => sOpen(e);

    useEffect(() => {
        open && sIsValue(initialValues);
    }, [open]);

    const formatNumber = (number) => {
        return formatNumberConfig(+number, dataSeting);
    };

    const { data: dataWarehouse = [] } = useWarehouseByBranch()

    const { data: dataWarehouseTranfer = [] } = useWarehouseTranfer();

    const { dataMaterialExpiry, dataProductExpiry, dataProductSerial } = useFeature();
    const { isWarehousePropertiesEnabled, warehousePropertyLabels } = useWarehouseProperties();

    const { isFetching: isFetchingListKeepStock, refetch: refetchListKeepStock } = useQuery({
        queryKey: ['api_list_keep_stock'],
        queryFn: async () => {
            const params = {
                "filter[status_bar]": isValue.idStatus?.value,
                "filter[id]": isValue.idTranfer?.value,
                "filter[warehouses_id]": isValue.idWarehouse?.value,
            }
            const db = await apiSalesOrder.apiListKeepOrder(id, { params })

            const newDb = {
                order: db.order,
                transfer: db.transfer.map((e) => {
                    return {
                        ...e,
                        isShow: false,
                    };
                }),
            };

            sData(newDb);

            return db
        },
        enabled: open
    })

    const handleDeleteItem = async () => {

        let { isSuccess, message } = await apiSalesOrder.apiDeleteTransferKeep(isId)

        if (isSuccess) {
            isShow("success", props.dataLang[message] || message);
            refetchListKeepStock()
        } else {
            isShow("error", props.dataLang[message] || message);
        }
        handleQueryId({ status: false });
    };
    const handleShowItem = (id) => {
        const newDb = {
            order: dataClone.order,
            transfer: dataClone.transfer.map((e) => {
                if (e.id == id) {
                    return {
                        ...e,
                        isShow: !e.isShow,
                    };
                }
                return e;
            }),
        };
        sData({ ...newDb });
    };



    const selectArray = [
        {
            id: uuid(),
            options: dataWarehouseTranfer,
            value: isValue.idTranfer,
            placeholder: "Phiếu giữ kho",
            key: "idTranfer",
        },
        {
            id: uuid(),
            options: dataWarehouse,
            value: isValue.idWarehouse,
            placeholder: "Kho chuyển",
            key: "idWarehouse",
            className: "min-w-[300px]",
        },
        {
            id: uuid(),
            options: [
                { label: "Đã duyệt kho", value: "warehouse_confirmed" },
                { label: "Chưa duyệt kho", value: "warehouse_unconfirmed" },
            ],
            value: isValue.idStatus,
            placeholder: "Trạng thái",
            key: "idStatus",
        },
    ];

    const columnArray = [
        {
            id: uuid(),
            title: "id",
            width: 4,
        },
        {
            id: uuid(),
            title: "Ngày chứng từ",
            width: 40,
        },
        {
            id: uuid(),
            title: "Mã chứng từ",
            width: 40,
        },
        {
            id: uuid(),
            title: "Mã đơn hàng",
            width: 40,
        },
        {
            id: uuid(),
            title: "Kho chuyển",
            width: 40,
        },
        {
            id: uuid(),
            title: "Kho nhận",
            width: 40,
        },
        {
            id: uuid(),
            title: "Trạng thái",
            width: 40,
        },
        {
            id: uuid(),
            title: `${dataLang?.note || "note"}`,
            width: 40,
        },
    ];

    const multiDataSet = [
        {
            columns: columnArray?.map((e) => {
                return {
                    title: e?.title,
                    width: { wch: e?.width },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                };
            }),
            data: dataClone?.transfer?.map((e) => [
                { value: `${e?.id ? e.id : ""}`, style: { numFmt: "0" } },
                { value: `${e?.date ? e?.date : ""}` },
                { value: `${e?.code ? e?.code : ""}` },
                { value: `${dataClone?.order.code}` },
                { value: `${e?.warehouses_id_name ? e?.warehouses_id_name : ""}` },
                { value: `${e?.warehouses_to_name ? e?.warehouses_to_name : ""}` },
                { value: `${e?.warehouseman_id == "0" ? "Chưa duyệt kho" : "Đã duyệt kho"}` },
                { value: `${e?.note ? e?.note : ""}` },
            ]),
        },
    ];

    return (
        <>
            <PopupCustom
                title={dataLang?.salesOrder_listarchive || "salesOrder_listarchive"}
                onClickOpen={_ToggleModal.bind(this, true)}
                open={open}
                onClose={_ToggleModal.bind(this, false)}
                classNameBtn={"w-full"}
                button={
                    <button
                        className={`group rounded-lg w-full p-1 border border-transparent transition-all ease-in-out flex items-center gap-2 responsive-text-sm text-left cursor-pointer
                            ${totalButtons > 3
                                ? 'hover:bg-primary-05'
                                : 'hover:border-amber-500 hover:bg-amber-50'
                            }`}
                    >
                        <BoxSearch
                            size={20}
                            className={`size-5 transition-all duration-300 
                                ${totalButtons > 3 ? "text-neutral-03 group-hover:text-neutral-07" : "group-hover:text-amber-500"}`}
                        />
                        {totalButtons > 3 && (
                            <p className="text-neutral-03 group-hover:text-neutral-07 font-normal whitespace-nowrap">
                                {dataLang?.salesOrder_see_stock_keeping || "salesOrder_see_stock_keeping"}
                            </p>
                        )}
                    </button>
                }
            >
                <div className="flex items-center space-x-4 my-2 border-[#E7EAEE] border-opacity-70 border-b-[1px]"></div>
                <div className="3xl:w-[1300px] 2xl:w-[1150px] xl:w-[999px] w-[950px] 3xl:h-auto 2xl:max-h-auto xl:h-auto h-auto ">
                    <div className=" customsroll overflow-auto pb-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 flex flex-col">
                        <div className="flex justify-between grid-cols-11 gap-2 items-center py-2 pl-2 bg-slate-100 w-full rounded-t-lg">
                            <div className="flex items-center gap-2">
                                {selectArray.map((e) => (
                                    <SelectComponent
                                        key={e.id}
                                        isClearable={true}
                                        onChange={onChangeValue(e.key)}
                                        options={[{ label: e.placeholder, value: null, isDisabled: true }, ...e.options]}
                                        value={e.value}
                                        colSpan={2}
                                        className={e.className}
                                        styles={{
                                            placeholder: (base) => ({
                                                ...base,
                                                color: "#cbd5e1",
                                                fontSize: "14px !important",
                                            }),
                                            control: (base, state) => ({
                                                ...base,
                                                border: "none",
                                                outline: "none",
                                                boxShadow: "none",
                                                ...(state.isFocused && {
                                                    boxShadow: "0 0 0 1.5px #0F4F9E",
                                                }),
                                            }),
                                        }}
                                        maxMenuHeight={180}
                                        placeholder={e.placeholder}
                                    />
                                ))}
                            </div>
                            <div className="col-span-5 justify-end flex items-center gap-1 mr-2">
                                <OnResetData onClick={refetchListKeepStock.bind(this)} sOnFetching={(e) => { }} />
                                {dataClone?.transfer?.length > 0 && (
                                    <ExcelFileComponent
                                        multiDataSet={multiDataSet}
                                        dataLang={dataLang}
                                        filename={"Danh sách giữ kho"}
                                        title={"Danh sách giữ kho"}
                                    />
                                )}
                            </div>
                        </div>
                        <div className=" w-[100%]">
                            <HeaderTablePopup gridCols={10} className={"!rounded-none"}>
                                <ColumnTablePopup>
                                    {dataLang?.inventory_dayvouchers || "inventory_dayvouchers"}
                                </ColumnTablePopup>
                                <ColumnTablePopup>
                                    {dataLang?.inventory_vouchercode || "inventory_vouchercode"}
                                </ColumnTablePopup>
                                <ColumnTablePopup>
                                    {dataLang?.salesOrder_code_orders || "salesOrder_code_orders"}
                                </ColumnTablePopup>
                                <ColumnTablePopup colSpan={2}>
                                    {dataLang?.warehouseTransfer_transferWarehouse || "warehouseTransfer_transferWarehouse"}
                                </ColumnTablePopup>
                                <ColumnTablePopup colSpan={2}>
                                    {dataLang?.warehouseTransfer_receivingWarehouse || "warehouseTransfer_receivingWarehouse"}
                                </ColumnTablePopup>
                                <ColumnTablePopup>
                                    {dataLang?.warehouses_localtion_status || "warehouses_localtion_status"}
                                </ColumnTablePopup>
                                <ColumnTablePopup>{dataLang?.inventory_note || "inventory_note"}</ColumnTablePopup>
                                <ColumnTablePopup>
                                    {dataLang?.salesOrder_action || "salesOrder_action"}
                                </ColumnTablePopup>
                            </HeaderTablePopup>
                            {isFetchingListKeepStock ? (
                                <Loading className="max-h-28" color="#0f4f9e" />
                            ) : dataClone?.transfer?.length > 0 ? (
                                <>
                                    <Customscrollbar className="min-h-[90px] max-h-[270px] 2xl:max-h-[350px] overflow-hidden">
                                        <div className=" divide-slate-200 min:h-[270px]  max-h-[370px]">
                                            {dataClone?.transfer?.map((e) => {
                                                return (
                                                    <>
                                                        <div
                                                            className="grid grid-cols-10 hover:bg-slate-50 items-center border-b"
                                                            key={e.id?.toString()}
                                                        >
                                                            <h6 className="text-[13px] flex items-center  px-2 py-2 col-span-1 text-center truncate">
                                                                <ArrowRight2
                                                                    onClick={() => handleShowItem(e.id)}
                                                                    size="22"
                                                                    color="red"
                                                                    variant="Bold"
                                                                    className={`${e.isShow ? "rotate-90 transition-all duration-200 ease-linear" : ""} cursor-pointer`}
                                                                />
                                                                {formatMoment(e?.date, FORMAT_MOMENT.DD_MM_YYYY)}
                                                            </h6>
                                                            <h6 className="text-[13px]   px-2 py-2 col-span-1 text-center break-words">
                                                                {e?.code}
                                                            </h6>
                                                            <h6 className="text-[13px]   px-2 py-2 col-span-1 text-center break-words">
                                                                {dataClone?.order.code}
                                                            </h6>
                                                            <h6 className="text-[13px]   px-2 py-2 col-span-2 text-left break-words">
                                                                {e?.warehouses_id_name}
                                                            </h6>
                                                            <h6 className="text-[13px]   px-2 py-2 col-span-2 text-left break-words">
                                                                {e?.warehouses_to_name}
                                                            </h6>
                                                            <h6
                                                                className={`text-[12px] truncate ${e?.warehouseman_id == "0" ? "bg-blue-200 text-blue-700 px-1.5" : " bg-green-200 text-green-700 px-3"} py-1 col-span-1 font-medium text-center break-words w-fit  mx-auto rounded-2xl`}
                                                            >
                                                                {`${e?.warehouseman_id == "0" ? "Chưa duyệt kho" : "Đã duyệt kho"}`}
                                                            </h6>
                                                            <h6 className="text-[13px]   px-2 py-2 col-span-1 text-center break-words">
                                                                {e?.note}
                                                            </h6>
                                                            <h6 className="text-[13px] flex items-center justify-center gap-4 py-2 col-span-1 font-medium text-center break-words">
                                                                <Popup_EditDetail
                                                                    {...props}
                                                                    id={e.id}
                                                                    sIsFetchingParent={refetchListKeepStock.bind(this)}
                                                                    dataClone={dataClone}
                                                                />
                                                                <button
                                                                    type="button"
                                                                    title="Xóa"
                                                                    onClick={(event) =>
                                                                        handleQueryId({ id: e?.id, status: true })
                                                                    }
                                                                    className="group transition h-10 rounded-[5.5px] hover:text-red-600 text-red-500 flex flex-col justify-center items-center"
                                                                >
                                                                    <IconDelete
                                                                        size={23}
                                                                        className="group-hover:text-red-500 group-hover:scale-110 group-hover:shadow-md "
                                                                    />
                                                                </button>
                                                            </h6>
                                                            {e.isShow && (
                                                                <>
                                                                    <div className="col-span-10 grid  grid-cols-9 mx-5 border-t border-b">
                                                                        <h6 className="text-[13px]   py-2 col-span-1 text-center break-words">
                                                                            STT
                                                                        </h6>
                                                                        <h6 className="text-[13px]   py-2 col-span-2 text-center break-words">
                                                                            Mặt hàng
                                                                        </h6>
                                                                        <h6 className="text-[13px]   py-2 col-span-1 text-center break-words">
                                                                            ĐVT
                                                                        </h6>
                                                                        <h6 className="text-[13px]   py-2 col-span-2 text-center break-words">
                                                                            Vị trí nhận
                                                                        </h6>
                                                                        <h6 className="text-[13px]   py-2 col-span-2 text-center break-words">
                                                                            Vị trí chuyển
                                                                        </h6>
                                                                        <h6 className="text-[13px]   py-2 col-span-1 text-center break-words">
                                                                            Số lượng
                                                                        </h6>
                                                                    </div>

                                                                    <Customscrollbar className="min-h-[90px] mx-5  max-h-[470px] col-span-10 2xl:max-h-[550px] overflow-hidden">
                                                                        <div className="max-h-[300px] col-span-10 grid grid-cols-10 items-center ">
                                                                            {e?.items?.map((e, index) => (
                                                                                <div
                                                                                    className={`col-span-10 ${index == 0 ? "border-t-0" : "border-t"}  overflow-hidden grid grid-cols-9  hover:bg-slate-50 items-center`}
                                                                                    key={e.id}
                                                                                >
                                                                                    <h6 className="text-[13px]   px-2 py-2 col-span-1 text-center break-words">
                                                                                        {index + 1}
                                                                                    </h6>
                                                                                    <h6 className="text-[13px]  px-2 py-2 col-span-2 text-left ">
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
                                                                                                            className="w-full h-full rounded object-contain p-1"
                                                                                                        ></ModalImage>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                            <div>
                                                                                                <h6 className="text-[13px] text-left font-medium capitalize">
                                                                                                    {e?.item?.name}
                                                                                                </h6>
                                                                                                <h6 className="text-[13px] text-left font-medium capitalize">
                                                                                                    {
                                                                                                        e?.item?.product_variation
                                                                                                    }
                                                                                                </h6>
                                                                                                <div className="flex items-center font-oblique flex-wrap">
                                                                                                    {dataProductSerial.is_enable === "1" ? (
                                                                                                        <div className="flex gap-0.5">
                                                                                                            <h6 className="text-[12px]">
                                                                                                                Serial:
                                                                                                            </h6>
                                                                                                            <h6 className="text-[12px]  px-2   w-[full] text-left ">
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
                                                                                                                    {e?.item?.expiration_date ? formatMoment(e?.item?.expiration_date, FORMAT_MOMENT.DD_MM_YYYY) : "-"}
                                                                                                                </h6>
                                                                                                            </div>
                                                                                                        </>
                                                                                                    ) : (
                                                                                                        ""
                                                                                                    )}
                                                                                                </div>
                                                                                                {/* check key item_type là material thì hiển thị thuộc tính kho */}
                                                                                                {e?.item_type === "material" &&
                                                                                                    Array.isArray(warehousePropertyLabels) &&
                                                                                                    warehousePropertyLabels.length > 0 && (
                                                                                                        <div className=" flex flex-wrap gap-x-1 font-oblique">
                                                                                                            {warehousePropertyLabels.map(({ key, label }) => {
                                                                                                                if (!label) return null;
                                                                                                                const value = e?.item?.[key];

                                                                                                                // Nếu isWarehousePropertiesEnabled tắt và thuộc tính không có giá trị → ẩn
                                                                                                                if (!isWarehousePropertiesEnabled && (value == null || value === "")) return null;

                                                                                                                return (
                                                                                                                    <div key={key} className="flex gap-1">
                                                                                                                        <h6 className="text-[11px]">{label}:</h6>
                                                                                                                        <h6 className="text-[11px]">
                                                                                                                            {value == null || value === "" ? "-" : value}
                                                                                                                        </h6>
                                                                                                                    </div>
                                                                                                                );
                                                                                                            })}
                                                                                                        </div>
                                                                                                    )}
                                                                                            </div>
                                                                                        </div>
                                                                                    </h6>
                                                                                    <h6 className="text-[13px]   px-2 py-2 col-span-1 text-center break-words">
                                                                                        {e?.item.unit_name}
                                                                                    </h6>
                                                                                    <h6 className="text-[13px]   px-2 py-2 col-span-2 text-center break-words">
                                                                                        <h6 className="font-medium">
                                                                                            {
                                                                                                e?.warehouse_location?.location_name
                                                                                            }
                                                                                        </h6>
                                                                                    </h6>
                                                                                    <h6 className="text-[13px]    py-2 col-span-2 text-center break-words">
                                                                                        <h6 className="font-medium">
                                                                                            {
                                                                                                e?.warehouse_location_to?.location_name
                                                                                            }
                                                                                        </h6>
                                                                                    </h6>
                                                                                    <h6 className="text-[13px]   py-2 pl-3 col-span-1 font-medium text-center break-words">
                                                                                        {formatNumber(e?.quantity)}
                                                                                    </h6>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </Customscrollbar>
                                                                </>
                                                            )}
                                                        </div>
                                                    </>
                                                );
                                            })}
                                        </div>
                                    </Customscrollbar>
                                </>
                            ) : <NoData />}
                        </div>
                        <div className="text-right mt-2  grid grid-cols-12 flex-col justify-between border-t">
                            <div className="col-span-7 font-medium grid grid-cols-7 text-left"></div>
                            <div className="col-span-3 space-y-2"></div>
                            <div className="col-span-2 space-y-2">
                                <div className="text-right mt-5 mr-2 space-x-2">
                                    <button
                                        type="button"
                                        onClick={_ToggleModal.bind(this, false)}
                                        className="button text-[#344054] font-normal text-base py-2 px-4 rounded-[5.5px] border border-solid border-[#D0D5DD] hover:scale-105 transition-all ease-linear"
                                    >
                                        {dataLang?.branch_popup_exit || "branch_popup_exit"}
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
export default PopupDetailKeepStock;
