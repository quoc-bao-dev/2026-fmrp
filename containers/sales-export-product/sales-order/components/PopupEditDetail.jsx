// Chi tiết giữ kho

import apiSalesOrder from "@/Api/apiSalesExportProduct/salesOrder/apiSalesOrder";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import Loading from "@/components/UI/loading/loading";
import NoData from "@/components/UI/noData/nodata";
import PopupCustom from "@/components/UI/popup";
import PopupConfim from "@/components/UI/popupConfim/popupConfim";
import { CONFIRM_DELETION, TITLE_DELETE } from "@/constants/delete/deleteTable";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import useFeature from "@/hooks/useConfigFeature";
import useSetingServer from "@/hooks/useConfigNumber";
import useToast from "@/hooks/useToast";
import { useToggle } from "@/hooks/useToggle";
import ToatstNotifi from "@/utils/helpers/alerNotification";
import { formatMoment } from "@/utils/helpers/formatMoment";
import formatNumberConfig from "@/utils/helpers/formatnumber";
import { useMutation } from "@tanstack/react-query";
import { Trash as IconDelete, SearchNormal1 } from "iconsax-react";
import { useEffect, useState } from "react";
import { BiEdit } from "react-icons/bi";
import ModalImage from "react-modal-image";
import { NumericFormat } from "react-number-format";

const initialFetch = {
    onSending: false,
    onLoading: false,
    onFetchingCondition: false,
};
const PopupEditDetail = (props) => {
    const { dataLang, id, dataClone, sIsFetchingParent } = props;
    const showToat = useToast();
    const dataSeting = useSetingServer()

    const formatNumber = (number) => {
        return formatNumberConfig(+number, dataSeting);
    }

    const [data, sData] = useState({});

    const isShow = useToast();

    const { isOpen, isId, handleQueryId } = useToggle();

    const [open, sOpen] = useState(false);

    const { dataProductExpiry, dataProductSerial, dataMaterialExpiry } = useFeature()

    const [isKeySearch, sIsKeySearch] = useState("");

    const [isFetching, sIsFetching] = useState(initialFetch);

    const [errorQuantity, sErrorQuantity] = useState(false);

    const _ToggleModal = (e) => sOpen(e);

    const newData = dataClone?.transfer?.find((e) => e.id == id);

    const setIsFetch = (e) => sIsFetching((prev) => ({ ...prev, ...e }));

    useEffect(() => {
        id && open && sData(dataClone?.transfer?.find((e) => e.id == id));

        id && open && sErrorQuantity(false);
    }, [open]);

    const handleChange = async (type, value, idParent) => {
        let newData = [];

        switch (type) {
            case "quantity":
                newData = data?.items?.map((e) => {
                    if (e.id == idParent) {
                        return {
                            ...e,
                            quantity: value.value,
                        };
                    }
                    return e;
                });
                break;
            default:
                newData = data;
        }

        sData({ ...data, items: newData });
    };

    const handleDeleteItem = () => {
        let hasDelivery = data.items?.some((e) => isId == e.id && e.quantity_delivery > 0);
        handleQueryId({ status: false });
        if (hasDelivery) {
            isShow("error", "Mặt hàng đã giao không thể xóa");
            return data.items;
        }
        isShow("success", "Xóa mặt hàng thành công");
        const newItem = data.items?.filter((e) => e.id !== isId);
        sData({ ...data, items: newItem });
    };

    const handleSearch = (inputValue) => {
        const keyword = inputValue.target.value;

        sIsKeySearch(keyword);

        if (keyword.trim() === "") {
            sData({ ...newData });
        } else {
            const fieldsToSearch = ["item", "warehouse_location_to", "warehouse_location"];

            const filteredItems = newData?.items?.filter((e) =>
                fieldsToSearch.some((field) => {
                    return Object.values(e[field]).some(
                        (value) => typeof value === "string" && value.toLowerCase().includes(keyword.toLowerCase())
                    );
                })
            );
            sData({ ...data, items: [...filteredItems] });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const checkErrorQuantity = data?.items?.some((e) => e.quantity == "" || e.quantity == 0 || e.quantity == "0");

        if (checkErrorQuantity) {
            checkErrorQuantity && sErrorQuantity(true);
            isShow("error", `${dataLang?.required_field_null}`);
        } else {
            setIsFetch({ onSending: true });
        }
    };

    const handdingEditkeppStook = useMutation({
        mutationFn: (data) => {
            return apiSalesOrder.apiHandingTransferCombobox(data);
        }
    })

    const sendingData = () => {
        let formData = new FormData();

        formData.append("idTranfer", data?.id);
        formData.append("idOrder", dataClone?.order?.id);

        data?.items.forEach((e, index) => {
            formData.append(`items[${index}][id]`, e?.id ? e?.id : "");
            formData.append(`items[${index}][quantity]`, e?.quantity ? e?.quantity : "");
        });

        handdingEditkeppStook.mutate(formData, {
            onSuccess: ({ isSuccess, message }) => {
                if (isSuccess) {
                    isShow("success", `${dataLang[message] || message}`);

                    sIsFetchingParent();
                    sOpen(false);
                    setIsFetch({ onSending: false });
                } else {
                    isShow("error", `${dataLang[message] || message}`);
                }
            },
            onError: (error) => {
            },
        })
    };

    useEffect(() => {
        isFetching.onSending && sendingData();
    }, [isFetching.onSending]);

    return (
        <PopupCustom
            title={dataLang?.salesOrder_warehouse_details || "salesOrder_warehouse_details"}
            onClickOpen={_ToggleModal.bind(this, true)}
            open={open}
            onClose={_ToggleModal.bind(this, false)}
            classNameBtn={""}
        >
            <div className="flex items-center space-x-4 my-2 border-[#E7EAEE] border-opacity-70 border-b-[1px]"></div>
            <div className="3xl:w-[1300px] 2xl:w-[1150px] xl:w-[999px] w-[950px] 3xl:h-auto 2xl:max-h-auto xl:h-auto h-auto ">
                <div className=" customsroll overflow-auto pb-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 flex flex-col">
                    <div className="grid grid-cols-12">
                        <form className="flex items-center relative col-span-3">
                            <SearchNormal1
                                size={20}
                                className="absolute 2xl:left-3 z-10 text-[#cccccc] xl:left-[4%] left-[1%]"
                            />
                            <input
                                className="relative border outline-none focus:outline-none focus:border-blue-400 2xl:text-left 2xl:pl-10 xl:pl-0 p-0 2xl:py-1.5 py-2.5 rounded 2xl:text-sm text-xs xl:text-center text-center 2xl:w-full xl:w-full w-[100%]"
                                type="text"
                                value={isKeySearch}
                                onChange={(e) => handleSearch(e)}
                                placeholder={dataLang?.salesOrder_search || "salesOrder_search"}
                            />
                        </form>
                    </div>
                    <div className=" w-[100%]">
                        <div
                            className={`grid-cols-11  grid sticky top-0 bg-white shadow-lg p-2 divide-x z-10 rounded `}
                        >
                            <h4 className="text-[13px] px-2 text-gray-600 uppercase  font-[600] col-span-3 text-center whitespace-nowrap">
                                {dataLang?.inventory_items || "inventory_items"}
                            </h4>
                            <h4 className="text-[13px] px-2 text-gray-600 uppercase  font-[600] col-span-1 text-center whitespace-nowrap">
                                {"ĐVT"}
                            </h4>
                            <h4 className="text-[13px] px-2 text-gray-600 uppercase  font-[600] col-span-2 text-center whitespace-nowrap">
                                {dataLang?.warehouseTransfer_receivingLocation || "warehouseTransfer_receivingLocation"}
                            </h4>
                            <h4 className="text-[13px] px-2 text-gray-600 uppercase  font-[600] col-span-2 text-center whitespace-nowrap">
                                {dataLang?.warehouseTransfer_rransferPosition || "warehouseTransfer_rransferPosition"}
                            </h4>
                            <h4 className="text-[13px] px-2 text-gray-600 uppercase  font-[600] col-span-1 text-center whitespace-nowrap">
                                {dataLang?.salesOrder_Slkeeps_stocks || "salesOrder_Slkeeps_stocks"}
                            </h4>
                            <h4 className="text-[13px] px-2 text-gray-600 uppercase  font-[600] col-span-1 text-center whitespace-nowrap">
                                {dataLang?.salesOrder_Sl_delivered || "salesOrder_Sl_delivered"}
                            </h4>
                            <h4 className="text-[13px] px-2 text-gray-600 uppercase  font-[600] col-span-1 text-center whitespace-nowrap">
                                {dataLang?.salesOrder_action || "salesOrder_action"}
                            </h4>
                        </div>
                        {isFetching.onLoading ? (
                            <Loading className="max-h-28" color="#0f4f9e" />
                        ) : data?.items?.length > 0 ? (
                            <>
                                <Customscrollbar smoothScrolling={true}
                                    className="min-h-[90px] max-h-[170px] 2xl:max-h-[250px] overflow-hidden"
                                >
                                    <div className=" divide-slate-200 min:h-[170px]  max:h-[170px]">
                                        {data?.items?.map((e) => (
                                            <div
                                                className="grid grid-cols-11 hover:bg-slate-50 items-center border-b"
                                                key={e.id}
                                            >
                                                <h6 className="text-[13px]  px-2 py-2 col-span-3 text-left ">
                                                    <div className="flex items-center gap-2">
                                                        <div>
                                                            {e?.item?.images != null ? (
                                                                <ModalImage
                                                                    small={e?.item?.images}
                                                                    large={e?.item?.images}
                                                                    alt="Product Image"
                                                                    className="custom-modal-image object-cover rounded w-[50px] h-[60px] mx-auto"
                                                                />
                                                            ) : (
                                                                <div className="w-[50px] h-[60px] object-cover  mx-auto">
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
                                                                {e?.item?.product_variation}
                                                            </h6>
                                                            <div className="flex items-center font-oblique flex-wrap">
                                                                {dataProductSerial.is_enable === "1" ? (
                                                                    <div className="flex gap-0.5">
                                                                        <h6 className="text-[12px]">Serial:</h6>
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
                                                                            <h6 className="text-[12px]">Lot:</h6>{" "}
                                                                            <h6 className="text-[12px]  px-2   w-[full] text-left ">
                                                                                {e?.item?.lot == null || e?.item?.lot == "" ? "-" : e?.item?.lot}
                                                                            </h6>
                                                                        </div>
                                                                        <div className="flex gap-0.5">
                                                                            <h6 className="text-[12px]">Date:</h6>{" "}
                                                                            <h6 className="text-[12px]  px-2   w-[full] text-center ">
                                                                                {e?.item?.expiration_date ? formatMoment(e?.item?.expiration_date, FORMAT_MOMENT.DATE_SLASH_LONG) : "-"}
                                                                            </h6>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    ""
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </h6>
                                                <h6 className="text-[13px]   px-2 py-2 col-span-1 text-center break-words">
                                                    <h6 className="font-medium">{e?.item.unit_name}</h6>
                                                </h6>
                                                <h6 className="text-[13px]   px-2 py-2 col-span-2 text-center break-words">
                                                    <h6 className="font-medium">
                                                        {e?.warehouse_location?.location_name}
                                                    </h6>
                                                </h6>
                                                <h6 className="text-[13px]   px-2 py-2 col-span-2 text-center break-words">
                                                    <h6 className="font-medium">
                                                        {e?.warehouse_location_to?.location_name}
                                                    </h6>
                                                </h6>
                                                <h6 className="text-[13px]   py-2 col-span-1 font-medium break-words">
                                                    <NumericFormat
                                                        className={`${errorQuantity &&
                                                            (e?.quantity == 0 ||
                                                                e?.quantity == "" ||
                                                                e?.quantity == "0")
                                                            ? "border-b-red-500"
                                                            : "border-b-gray-300"
                                                            } appearance-none bg-transparent  text-center focus:border-b-blue-400 py-1 px-2 my-1   border-b outline-none  w-full`}
                                                        onValueChange={(event) => handleChange("quantity", event, e.id)}
                                                        value={e?.quantity}
                                                        allowNegative={false}
                                                        decimalScale={0}
                                                        isNumericString={true}
                                                        thousandSeparator=","
                                                        isAllowed={(values) => {
                                                            const { value, formattedValue, floatValue } = values;
                                                            const newValue = +value;
                                                            if (newValue == 0) {
                                                                showToat("error", "Số lượng không được bằng 0.");
                                                                return;
                                                            }
                                                            if (newValue > +e.quantity_net) {
                                                                showToat(
                                                                    "error",
                                                                    `Số lượng không lớn hơn ${formatNumber(
                                                                        e?.quantity_net
                                                                    )} số lượng giữ kho`
                                                                );
                                                                return;
                                                            }
                                                            if (newValue < +e?.quantity_delivery) {
                                                                showToat(
                                                                    "error",
                                                                    `Số lượng không được bé hơn ${formatNumber(e?.quantity_delivery)} số lượng đã giao`
                                                                );
                                                                return;
                                                            }
                                                            return true;
                                                        }}
                                                    />
                                                </h6>
                                                <h6 className="text-[13px]   py-2 col-span-1 font-medium text-center break-words">
                                                    {formatNumber(e?.quantity_delivery)}
                                                </h6>
                                                <button
                                                    type="button"
                                                    title="Xóa"
                                                    onClick={(event) => handleQueryId({ id: e.id, status: true })}
                                                    className="group col-span-1 transition h-10 rounded-[5.5px] hover:text-red-600 text-red-500 flex flex-col justify-center items-center"
                                                >
                                                    <IconDelete
                                                        size={23}
                                                        className="group-hover:text-red-500 group-hover:scale-110 group-hover:shadow-md "
                                                    />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </Customscrollbar>
                            </>
                        ) : <NoData />}
                    </div>
                    <div className="text-right mt-2  grid grid-cols-12 flex-col justify-between border-t">
                        <div className="col-span-10 font-medium grid grid-cols-7 text-left"></div>
                        <div className="col-span-2 space-y-2">
                            <div className="text-right mt-5 mr-2 space-x-2">
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
    );
};
export default PopupEditDetail;
