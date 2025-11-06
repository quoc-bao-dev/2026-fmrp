import apiRecall from "@/Api/apiManufacture/warehouse/recall/apiRecall";
import Breadcrumb from "@/components/UI/breadcrumb/BreadcrumbCustom";
import ButtonBack from "@/components/UI/button/buttonBack";
import ButtonSubmit from "@/components/UI/button/buttonSubmit";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import { EmptyExprired } from "@/components/UI/common/EmptyExprired";
import { Container } from "@/components/UI/common/layout";
import SelectComponent from "@/components/UI/filterComponents/selectComponent";
import InPutNumericFormat from "@/components/UI/inputNumericFormat/inputNumericFormat";
import Loading from "@/components/UI/loading/loading";
import PopupConfim from "@/components/UI/popupConfim/popupConfim";
import { optionsQuery } from "@/configs/optionsQuery";
import { CONFIRMATION_OF_CHANGES, TITLE_DELETE_ITEMS } from "@/constants/delete/deleteItems";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import { useBranchList } from "@/hooks/common/useBranch";
import { useLocationByWarehouseTo, useWarehouseComboboxByManufactureByBranch } from "@/hooks/common/useWarehouses";
import useFeature from "@/hooks/useConfigFeature";
import useSetingServer from "@/hooks/useConfigNumber";
import useStatusExprired from "@/hooks/useStatusExprired";
import useToast from "@/hooks/useToast";
import { useToggle } from "@/hooks/useToggle";
import { routerRecall } from "@/routers/manufacture";
import { isAllowedNumber } from "@/utils/helpers/common";
import { formatMoment } from "@/utils/helpers/formatMoment";
import formatNumberConfig from "@/utils/helpers/formatnumber";
import { SelectCore } from "@/utils/lib/Select";
import { useQuery } from "@tanstack/react-query";
import { Add, Trash as IconDelete, Minus } from "iconsax-react";
import { debounce } from "lodash";
import moment from "moment/moment";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { BsCalendarEvent } from "react-icons/bs";
import { MdClear } from "react-icons/md";
import { NumericFormat } from "react-number-format";
import { v4 as uuidv4 } from "uuid";
import { useRecallItems } from "./hooks/useRecallItems";
const RecallForm = (props) => {
    const router = useRouter();

    const id = router.query?.id;

    const dataLang = props?.dataLang;

    const isShow = useToast();

    const dataSeting = useSetingServer();

    const { isOpen, isKeyState, handleQueryId } = useToggle();

    const [onLoadingChild, sOnLoadingChild] = useState(false);

    const [onSending, sOnSending] = useState(false);

    const [code, sCode] = useState("");

    const [searchItems, sSearchItems] = useState("");

    const [startDate, sStartDate] = useState(new Date());

    const [effectiveDate, sEffectiveDate] = useState(null);

    const [note, sNote] = useState("");

    const { dataMaterialExpiry } = useFeature();

    const [date, sDate] = useState(moment().format(FORMAT_MOMENT.DATE_TIME_LONG));
    //new
    const [idProductionOrder, sIdProductionOrder] = useState(null);

    const statusExprired = useStatusExprired();

    const [listData, sListData] = useState([]);

    const [idBranch, sIdBranch] = useState(null);

    const [idRecalltWarehouse, sIdRecalltWarehouse] = useState(null);

    const [errDate, sErrDate] = useState(false);

    const [errBranch, sErrBranch] = useState(false);

    const [errWarehouse, sErrWarehouse] = useState(false);

    const [errQty, sErrQty] = useState(false);

    const [errLot, sErrLot] = useState(false);

    const [errDateList, sErrDateList] = useState(false);

    const [errRecallWarehouse, sErrRecallWarehouse] = useState(false);

    const [errRecallProductionOrder, sErrRecallProductionOrder] = useState(false);

    const { data: dataBranch = [] } = useBranchList()

    const { data: dataItems } = useRecallItems(searchItems, idBranch, idProductionOrder)

    const { data: dataLocation = [] } = useLocationByWarehouseTo(idRecalltWarehouse, idBranch)

    const { data: dataWarehouse = [] } = useWarehouseComboboxByManufactureByBranch(idBranch)

    useEffect(() => {
        router.query && sErrDate(false);
        router.query && sErrBranch(false);
        router.query && sErrRecallWarehouse(false);
        router.query && sErrRecallProductionOrder(false);
        router.query && sStartDate(new Date());
        router.query && sNote("");
    }, [router.query]);

    const { isFetching } = useQuery({
        queryKey: ['api_detail_page_recall', id],
        queryFn: async () => {
            const rResult = await apiRecall.apiDetailPageRecall(id);
            sIdBranch({
                label: rResult?.branch_name,
                value: rResult?.branch_id,
            });
            sIdRecalltWarehouse({
                label: rResult?.warehouse_name,
                value: rResult?.warehouse_id,
            });
            sListData(
                rResult?.items.map((e) => ({
                    id: e?.item?.id,
                    idParenBackend: e?.item?.id,
                    item: {
                        e: e?.item,
                        label: `${e.item?.name} <span style={{display: none}}>${e.item?.code + e.item?.product_variation + e.item?.text_type + e.item?.unit_name}</span>`,
                        value: e.item?.id,
                    },
                    child: e?.child.map((ce) => ({
                        idChildBackEnd: Number(ce?.id),
                        id: Number(ce?.id),
                        disabledDate:
                            (e.item?.text_type == "material" && dataMaterialExpiry?.is_enable == "1" && false) ||
                            (e.item?.text_type == "material" && dataMaterialExpiry?.is_enable == "0" && true),
                        location:
                            ce?.warehouse?.location_name || ce?.warehouse?.id || ce?.warehouse?.warehouse_name
                                ? {
                                    label: ce?.warehouse?.location_name || null,
                                    value: ce?.warehouse?.id || null,
                                    warehouse_name: ce?.warehouse?.warehouse_name || null,
                                }
                                : null,
                        price: ce?.price,
                        serial: ce?.serial == null ? "" : ce?.serial,
                        lot: ce?.lot == null ? "" : ce?.lot,
                        date: ce?.expiration_date != null ? moment(ce?.expiration_date).toDate() : null,
                        unit: e?.item?.unit_name || e.item?.unit,
                        recallQuantity: +ce?.quantity,
                        note: ce?.note,
                    })),
                }))
            );
            sCode(rResult?.code);
            sStartDate(moment(rResult?.date).toDate());
            sNote(rResult?.note);
            sIdProductionOrder({
                value: rResult?.poi_id,
                label: rResult?.reference_no_detail
            })
        },
        enabled: !!id
    })


    // lsx chi tiết
    const { data: dataProductionOrderItemsByBranch } = useQuery({
        queryKey: ['api_production_order_items_by_branch', idBranch],
        queryFn: async () => {
            const res = await apiRecall.apiProductionOrderItemsByBranch({
                params: {
                    branch_id: idBranch?.value
                }
            });
            return {
                ...res,
                data: {
                    ...res?.data,
                    items: res?.data?.items.map((e) => ({
                        ...e,
                        label: e?.reference_no_detail,
                        value: e?.id
                    }))
                }
            }
        },
        enabled: !!idBranch,
        ...optionsQuery
    })

    const _HandleSeachApi = debounce(async (inputValue) => {
        sSearchItems(inputValue);
    }, 500);

    const resetValue = () => {
        if (isKeyState?.type === "branch") {
            sListData([]);
            sIdBranch(isKeyState?.value);
            sIdRecalltWarehouse(null);
            sIdProductionOrder(null);
        }
        if (isKeyState?.type === "idRecalltWarehouse") {
            sListData([]);
            sIdRecalltWarehouse(isKeyState?.value);
        }
        handleQueryId({ status: false });
    };

    const _HandleChangeInput = (type, value) => {
        if (type == "code") {
            sCode(value.target.value);
        } else if (type === "date") {
            sDate(formatMoment(value.target.value, FORMAT_MOMENT.DATE_TIME_LONG));
        } else if (type === "note") {
            sNote(value.target.value);
        } else if (type == "branch" && idBranch != value) {
            if (listData?.length > 0) {
                if (type === "branch" && idBranch != value) {
                    handleQueryId({ status: true, initialKey: { type, value } });
                }
            } else {
                sIdRecalltWarehouse(null);
                sIdProductionOrder(null);
                sIdBranch(value);
            }
        } else if (type == "idRecalltWarehouse" && idRecalltWarehouse != value) {
            if (listData?.length > 0) {
                handleQueryId({ status: true, initialKey: { type, value } });
            } else {
                sIdRecalltWarehouse(value);
            }
        } else if (type == 'idProductionOrderItem') {
            sIdProductionOrder(value);
        }

    };

    const handleClearDate = (type) => {
        if (type === "effectiveDate") {
            sEffectiveDate(null);
        }
        if (type === "startDate") {
            sStartDate(new Date());
        }
    };
    const handleTimeChange = (date) => {
        sStartDate(date);
    };

    const _HandleSubmit = (e) => {
        e.preventDefault();
        const hasNullOrCondition = (data, conditionFn) => data.some((item) => item.child?.some((childItem) => conditionFn(item, childItem)));

        const hasNullKho = hasNullOrCondition(listData, (item, childItem) => childItem.location === null);

        const hasNullSerial = hasNullOrCondition(listData, (item, childItem) => item?.item.e?.text_type === "products" && (childItem.serial === "" || childItem.serial == null));

        const hasNullLot = hasNullOrCondition(listData, (item, childItem) => !childItem.disabledDate && (childItem.lot === "" || childItem.lot == null));

        const hasNullDate = hasNullOrCondition(listData, (item, childItem) => !childItem.disabledDate && childItem.date === null);

        const hasNullQty = hasNullOrCondition(listData, (item, childItem) => childItem.recallQuantity === null || childItem.recallQuantity === "" || childItem.recallQuantity == 0);

        const isEmpty = listData?.length === 0;

        if (
            idBranch == null ||
            hasNullKho ||
            hasNullQty ||
            isEmpty ||
            idRecalltWarehouse == null ||
            idProductionOrder == null ||
            (dataMaterialExpiry?.is_enable == "1" && hasNullLot) || (dataMaterialExpiry?.is_enable == "1" && hasNullDate)
        ) {
            idBranch == null && sErrBranch(true);
            hasNullKho && sErrWarehouse(true);
            idRecalltWarehouse == null && sErrRecallWarehouse(true);
            idProductionOrder == null && sErrRecallProductionOrder(true);
            hasNullQty && sErrQty(true);
            hasNullKho && sErrWarehouse(true);
            hasNullLot && sErrLot(true);
            hasNullDate && sErrDateList(true);
            if (isEmpty) {
                handleCheckError("Chưa nhập thông tin mặt hàng");
            } else {
                handleCheckError(dataLang?.required_field_null);
            }
        } else {
            sErrWarehouse(false);
            sErrQty(false);
            sErrLot(false);
            sErrDateList(false);
            sErrRecallProductionOrder(false);
            sOnSending(true);
        }
    };

    useEffect(() => {
        sErrDate(false);
    }, [date != null]);

    useEffect(() => {
        sErrBranch(false);
    }, [idBranch != null]);

    useEffect(() => {
        sErrRecallWarehouse(false);
    }, [idRecalltWarehouse != null]);

    useEffect(() => {
        sErrRecallProductionOrder(false);
    }, [idProductionOrder != null]);

    const formatNumber = (number) => {
        return formatNumberConfig(+number, dataSeting);
    };

    const _ServerSending = async () => {
        let formData = new FormData();
        formData.append("code", code);
        formData.append("date", formatMoment(startDate, FORMAT_MOMENT.DATE_TIME_LONG));
        formData.append("branch_id", idBranch?.value);
        formData.append("warehouse_id", idRecalltWarehouse?.value);
        formData.append("poi_id", idProductionOrder?.value ?? 0);
        formData.append("note", note);
        listData.forEach((item, index) => {
            formData.append(`items[${index}][id]`, id ? item?.idParenBackend : "");
            formData.append(`items[${index}][item]`, item?.item?.value);
            item?.child?.forEach((childItem, childIndex) => {
                formData.append(`items[${index}][child][${childIndex}][row_id]`, id ? childItem?.idChildBackEnd : "");
                formData.append(`items[${index}][child][${childIndex}][lot]`, childItem?.lot === null ? "" : childItem?.lot);
                formData.append(`items[${index}][child][${childIndex}][price]`, childItem?.price ?? "");
                formData.append(`items[${index}][child][${childIndex}][expiration_date]`, childItem?.date === null ? "" : formatMoment(childItem?.date, FORMAT_MOMENT.DATE_LONG));
                formData.append(`items[${index}][child][${childIndex}][location_warehouses_id]`, childItem?.location?.value || 0);
                formData.append(`items[${index}][child][${childIndex}][note]`, childItem?.note ? childItem?.note : "");
                formData.append(`items[${index}][child][${childIndex}][quantity]`, childItem?.recallQuantity);
            });
        });
        try {
            const { isSuccess, message } = await apiRecall.apiHandingRecall(id ? id : undefined, formData);
            if (isSuccess) {
                isShow("success", `${dataLang[message]}` || message);
                sCode("");
                sStartDate(new Date());
                sIdBranch(null);
                sNote("");
                sErrBranch(false);
                sErrDate(false);
                sListData([]);
                router.push(routerRecall.home);
                sOnSending(false);
            } else {
                handleCheckError(dataLang[message] || message);
            }
        } catch (error) {
            throw error
        }
    };

    useEffect(() => {
        onSending && _ServerSending();
    }, [onSending]);

    //new
    const _HandleAddChild = (parentId, value) => {
        sOnLoadingChild(true);
        const newData = listData?.map((e) => {
            if (e?.id === parentId) {
                const newChild = {
                    id: uuidv4(),
                    disabledDate:
                        (value?.e?.text_type === "material" && dataMaterialExpiry?.is_enable === "1" && false) ||
                        (value?.e?.text_type === "material" && dataMaterialExpiry?.is_enable === "0" && true),
                    location: null,
                    unit: value?.e?.unit_name || value?.e?.unit,
                    serial: value?.e?.serial ? value?.e?.serial : null,
                    lot: value?.e?.lot ? value?.e?.lot : null,
                    date: value?.e?.expiration_date ? moment(value?.e?.expiration_date).toDate() : null,
                    recallQuantity: null,
                    price: value?.e?.price ? value?.e?.price : null,
                    note: "",
                    idChildBackEnd: null,
                };
                return { ...e, child: [...e.child, newChild] };
            } else {
                return e;
            }
        });
        setTimeout(() => {
            sOnLoadingChild(false);
        }, 500);
        sListData(newData);
    };

    const _HandleAddParent = useCallback((value) => {
        sOnLoadingChild(true);
        const checkData = listData?.some((e) => e?.item?.value === value?.value);
        if (!checkData) {
            const newData = {
                id: Date.now(),
                idParenBackend: null,
                item: value,
                child: [
                    {
                        idChildBackEnd: null,
                        id: uuidv4(),
                        disabledDate:
                            (value?.e?.text_type === "material" && dataMaterialExpiry?.is_enable === "1" && false) ||
                            (value?.e?.text_type === "material" && dataMaterialExpiry?.is_enable === "0" && true),
                        location: null,
                        serial: value?.e?.serial ? value?.e?.serial : null,
                        lot: value?.e?.lot ? value?.e?.lot : null,
                        date: value?.e?.expiration_date ? moment(value?.e?.expiration_date).toDate() : null,
                        unit: value?.e?.unit_name,
                        price: value?.e?.price ? value?.e?.price : null,
                        recallQuantity: null,
                        note: "",
                    },
                ],
            };
            setTimeout(() => {
                sOnLoadingChild(false);
            }, 500);
            sListData([newData, ...listData]);
        } else {
            handleCheckError(dataLang?.returns_err_ItemSelect || "returns_err_ItemSelect");
        }
    }, [listData]);

    const _HandleDeleteChild = useCallback(
        (parentId, childId) => {
            const newData = listData.map((e) => {
                if (e.id === parentId) {
                    const newChild = e.child?.filter((ce) => ce?.id !== childId);
                    return { ...e, child: newChild };
                }
                return e;
            }).filter((e) => e.child?.length > 0);
            sListData([...newData]);
        }, [listData]);

    const _HandleDeleteAllChild = useCallback((parentId) => {
        const newData = listData.map((e) => {
            if (e.id === parentId) {
                const newChild = e.child?.filter((ce) => ce?.location !== null);
                return { ...e, child: newChild };
            }
            return e;
        }).filter((e) => e.child?.length > 0);
        sListData([...newData]);
    }, [listData]);

    const _HandleChangeChild = useCallback((parentId, childId, type, value) => {
        const newData = [...listData];
        const parentIndex = newData.findIndex((e) => e.id === parentId);
        if (parentIndex !== -1) {
            const childIndex = newData[parentIndex].child.findIndex((ce) => ce.id === childId);
            if (childIndex !== -1) {
                // Thực hiện cập nhật dữ liệu tại vị trí tìm thấy
                const updatedChild = {
                    ...newData[parentIndex].child[childIndex],
                };
                if (type === "recallQuantity") {
                    const newQtyImport = Number(value?.value);
                    updatedChild.recallQuantity = newQtyImport;
                } else if (type === "location") {
                    const checkKho = newData[parentIndex].child
                        .map((house) => house)
                        .some((i) => i?.location?.value === value?.value);
                    if (checkKho) {
                        handleCheckError("Vị trí thu hồi đã được chọn");
                    } else {
                        updatedChild.location = value;
                    }
                } else if (type === "serial") {
                    const newTypeValue = value?.target.value;
                    // Kiểm tra xem giá trị mới đã tồn tại trong cả phần tử cha và các phần tử con
                    const existsInParent = newData[parentIndex].child.some((ce) => ce[type] === newTypeValue);
                    const existsInOtherParents = newData.some(
                        (e) => e.id !== parentId && e.child.some((ce) => ce[type] === newTypeValue)
                    );
                    if (existsInParent || existsInOtherParents) {
                        handleQuantityError(`Giá trị ${type} đã tồn tại`);
                        return; // Dừng việc cập nhật nếu có lỗi
                    }
                    updatedChild[type] = newTypeValue;
                } else if (type === "lot") {
                    updatedChild.lot = value?.target.value;
                } else if (type === "date") {
                    updatedChild.date = value;
                } else if (type === "increase") {
                    updatedChild.recallQuantity = Number(updatedChild.recallQuantity) + 1;
                } else if (type === "decrease") {
                    if (updatedChild.recallQuantity >= 2) {
                        updatedChild.recallQuantity = Number(updatedChild.recallQuantity) - 1;
                    }
                } else if (type === "price") {
                    const newPrice = Number(value?.value);
                    updatedChild.price = newPrice;
                } else if (type === "note") {
                    updatedChild.note = value?.target.value;
                }
                newData[parentIndex].child[childIndex] = updatedChild;
            }
        }
        sListData(newData);
    }, [listData]);

    const handleQuantityError = (e) => isShow("error", e);

    const _HandleChangeValue = useCallback((parentId, value) => {
        const checkData = listData?.some((e) => e?.item?.value === value?.value);
        if (!checkData) {
            const newData = listData?.map((e) => {
                if (e?.id === parentId) {
                    return {
                        ...e,
                        item: value,
                        child: [
                            {
                                idChildBackEnd: null,
                                id: uuidv4(),
                                location: null,
                                disabledDate:
                                    (value?.e?.text_type === "material" && dataMaterialExpiry?.is_enable === "1" && false) ||
                                    (value?.e?.text_type === "material" && dataMaterialExpiry?.is_enable === "0" && true),
                                unit: value?.e?.unit_name,
                                price: null,
                                recallQuantity: null,
                                note: "",
                            },
                        ],
                    };
                } else {
                    return e;
                }
            });
            sListData([...newData]);
        } else {
            handleCheckError(dataLang?.returns_err_ItemSelect || "returns_err_ItemSelect");
        }
    }, [listData]);

    const handleCheckError = (e) => isShow("error", `${e}`);


    const breadcrumbItems = [
        {
            label: `${dataLang?.Warehouse_title || "Warehouse_title"}`,
            // href: "/",
        },
        {
            label: `${dataLang?.recall_title || "recall_title"}`,
            href: "/manufacture/recall?tab=all",
        },
        {
            label: id ? dataLang?.recall_title_edit || "recall_title_edit" : dataLang?.recall_title_add || "recall_title_add"
        },
    ];
    return (
        <React.Fragment>
            <Head>
                <title>
                    {id ? dataLang?.recall_title_edit || "recall_title_edit" : dataLang?.recall_title_add || "recall_title_add"}
                </title>
            </Head>
            <Container className="!h-auto">
                <div className="h-[97%] space-y-3 overflow-hidden">
                    {statusExprired ? (
                        <EmptyExprired />
                    ) : (
                        <Breadcrumb
                            items={breadcrumbItems}
                            className="3xl:text-sm 2xl:text-xs xl:text-[10px] lg:text-[10px]"
                        />
                    )}

                    <div className="flex items-center justify-between">
                        <h2 className="text-title-section text-[#52575E] capitalize font-medium">
                            {id ? dataLang?.recall_title_edit || "recall_title_edit" : dataLang?.recall_title_add || "recall_title_add"}
                        </h2>
                        <div className="flex items-center justify-end mr-2">
                            <ButtonBack onClick={() => router.push(routerRecall.home)} dataLang={dataLang} />
                        </div>
                    </div>

                    <div className="w-full rounded ">
                        <div className="">
                            <h2 className="font-normal bg-[#ECF0F4] p-2 ">
                                {dataLang?.purchase_order_detail_general_informatione || "purchase_order_detail_general_informatione"}
                            </h2>
                            <div className="grid items-center grid-cols-10 gap-3 mt-2 ">
                                <div className="col-span-2">
                                    <label className="text-[#344054] font-normal text-sm mb-1 ">
                                        {dataLang?.import_code_vouchers || "import_code_vouchers"}{" "}
                                    </label>
                                    <input
                                        value={code}
                                        onChange={_HandleChangeInput.bind(this, "code")}
                                        name="fname"
                                        type="text"
                                        placeholder={dataLang?.purchase_order_system_default || "purchase_order_system_default"}
                                        className={`focus:border-[#92BFF7] border-[#d0d5dd]  placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal   p-2 border outline-none`}
                                    />
                                </div>
                                <div className="relative col-span-2">
                                    <label className="text-[#344054] font-normal text-sm mb-1 ">
                                        {dataLang?.import_day_vouchers || "import_day_vouchers"}
                                    </label>
                                    <div className="flex flex-row custom-date-picker">
                                        <DatePicker
                                            blur
                                            fixedHeight
                                            showTimeSelect
                                            selected={startDate}
                                            onSelect={(date) => sStartDate(date)}
                                            onChange={(e) => handleTimeChange(e)}
                                            placeholderText="DD/MM/YYYY HH:mm:ss"
                                            dateFormat="dd/MM/yyyy h:mm:ss aa"
                                            timeInputLabel={"Time: "}
                                            placeholder={dataLang?.price_quote_system_default || "price_quote_system_default"}
                                            className={`border ${errDate ? "border-red-500" : "focus:border-[#92BFF7] border-[#d0d5dd]"} placeholder:text-slate-300 w-full z-[999] bg-[#ffffff] rounded text-[#52575E] font-normal p-2 outline-none cursor-pointer `}
                                        />
                                        {startDate && (
                                            <>
                                                <MdClear
                                                    className="absolute right-0 -translate-x-[320%] translate-y-[1%] h-10 text-[#CCCCCC] hover:text-[#999999] scale-110 cursor-pointer"
                                                    onClick={() => handleClearDate("startDate")}
                                                />
                                            </>
                                        )}
                                        <BsCalendarEvent className="absolute right-0 -translate-x-[75%] translate-y-[70%] text-[#CCCCCC] scale-110 cursor-pointer" />
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[#344054] font-normal text-sm mb-1 ">
                                        {dataLang?.import_branch || "import_branch"}{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <SelectComponent
                                        options={dataBranch}
                                        onChange={_HandleChangeInput.bind(this, "branch")}
                                        value={idBranch}
                                        isClearable={true}
                                        closeMenuOnSelect={true}
                                        hideSelectedOptions={false}
                                        placeholder={dataLang?.import_branch || "import_branch"}
                                        noOptionsMessage={() => dataLang?.returns_nodata || "returns_nodata"}
                                        className={`${errBranch ? "border-red-500" : "border-transparent"} placeholder:text-slate-300 w-full z-20 bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border `}
                                        isSearchable={true}
                                        type="form"
                                    />
                                    {errBranch && (
                                        <label className="text-sm text-red-500">
                                            {dataLang?.purchase_order_errBranch || "purchase_order_errBranch"}
                                        </label>
                                    )}
                                </div>
                                <div className="col-span-2 ">
                                    <label className="text-[#344054] font-normal text-sm mb-1 ">
                                        {dataLang?.productsWarehouse_warehouseImport || "productsWarehouse_warehouseImport"}{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <SelectComponent
                                        options={dataWarehouse}
                                        onChange={_HandleChangeInput.bind(this, "idRecalltWarehouse")}
                                        value={idRecalltWarehouse}
                                        isClearable={true}
                                        noOptionsMessage={() => dataLang?.returns_nodata || "returns_nodata"}
                                        closeMenuOnSelect={true}
                                        hideSelectedOptions={false}
                                        placeholder={dataLang?.productsWarehouse_warehouseImport || "productsWarehouse_warehouseImport"}
                                        className={`${errRecallWarehouse ? "border-red-500" : "border-transparent"} placeholder:text-slate-300 w-full z-20 bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border `}
                                        isSearchable={true}
                                        type="form"
                                    />
                                    {errRecallWarehouse && (
                                        <label className="text-sm text-red-500">{"Vui lòng chọn kho"}</label>
                                    )}
                                </div>
                                <div className="col-span-2 ">
                                    <label className="text-[#344054] font-normal text-sm mb-1 ">
                                        {dataLang?.production_warehouse_LSX || "production_warehouse_LSX"}{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <SelectComponent
                                        options={dataProductionOrderItemsByBranch?.data?.items || []}
                                        onChange={_HandleChangeInput.bind(this, "idProductionOrderItem")}
                                        value={idProductionOrder}
                                        isClearable={true}
                                        noOptionsMessage={() => dataLang?.returns_nodata || "returns_nodata"}
                                        closeMenuOnSelect={true}
                                        hideSelectedOptions={false}
                                        placeholder={dataLang?.production_warehouse_LSX || "production_warehouse_LSX"}
                                        className={`${errRecallProductionOrder ? "border-red-500" : "border-transparent"} placeholder:text-slate-300 w-full z-20 bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border `}
                                        isSearchable={true}
                                        type="form"
                                    />
                                    {errRecallWarehouse && (
                                        <label className="text-sm text-red-500">{"Vui lòng chọn LSX"}</label>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className=" bg-[#ECF0F4] p-2 grid  grid-cols-12">
                        <div className="col-span-12 font-normal">
                            {dataLang?.import_item_information || "import_item_information"}
                        </div>
                    </div>

                    <div className="grid grid-cols-12 items-center  sticky top-0  bg-[#F7F8F9] py-2 z-10">
                        <h4 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] px-2  text-[#667085] uppercase  col-span-3 text-center truncate font-[400]">
                            {dataLang?.import_from_items || "import_from_items"}
                        </h4>
                        <div className="col-span-9">
                            <div className={`${dataMaterialExpiry.is_enable == "1" ? "grid-cols-7" : "grid-cols-5"} grid `}      >
                                <h4 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] px-2  text-[#667085] uppercase  col-span-1   text-center  truncate font-[400]">
                                    {dataLang?.productsWarehouse_warehouseLocaImport || "productsWarehouse_warehouseLocaImport"}
                                </h4>
                                {dataMaterialExpiry.is_enable === "1" ? (
                                    <>
                                        <h4 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] px-2  col-span-1  text-[#667085] uppercase  font-[400] text-center">
                                            {"Lot"}
                                        </h4>
                                        <h4 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] px-2  col-span-1  text-[#667085] uppercase  font-[400] text-center">
                                            {props.dataLang?.warehouses_detail_date || "warehouses_detail_date"}
                                        </h4>
                                    </>
                                ) : ""}
                                <h4 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] px-2  text-[#667085] uppercase  col-span-1    text-center  truncate font-[400]">
                                    {"ĐVT"}
                                </h4>
                                <h4 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] px-2  text-[#667085] uppercase  col-span-1    text-center  truncate font-[400]">
                                    {dataLang?.recall_amountRecall || "recall_amountRecall"}
                                </h4>
                                <h4 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] px-2  text-[#667085] uppercase  col-span-1    text-center    truncate font-[400]">
                                    {dataLang?.import_from_note || "import_from_note"}
                                </h4>
                                <h4 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] px-2  text-[#667085] uppercase  col-span-1    text-center    truncate font-[400]">
                                    {dataLang?.import_from_operation || "import_from_operation"}
                                </h4>
                            </div>
                        </div>
                    </div>
                    <div className="grid items-center grid-cols-12 gap-1 py-2">
                        <div className="col-span-3">
                            <SelectComponent
                                options={dataItems}
                                value={null}
                                onInputChange={(event) => {
                                    _HandleSeachApi(event);
                                }}
                                onChange={_HandleAddParent.bind(this)}
                                className="col-span-2 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]"
                                placeholder={dataLang?.returns_items || "returns_items"}
                                noOptionsMessage={() => dataLang?.returns_nodata || "returns_nodata"}
                                menuPortalTarget={document.body}
                                formatOptionLabel={(option) => (
                                    <div className="flex items-center justify-between py-2 cursor-pointer">
                                        <div className="flex items-center gap-2">
                                            <div className="w-[40px] h-h-[60px]">
                                                {option.e?.images != null ? (
                                                    <img
                                                        src={option.e?.images}
                                                        alt="Product Image"
                                                        className="max-w-[30px] h-[40px] text-[8px] object-cover rounded"
                                                    />
                                                ) : (
                                                    <div className=" w-[30px] h-[40px] object-cover  flex items-center justify-center rounded">
                                                        <img
                                                            src="/icon/noimagelogo.png"
                                                            alt="Product Image"
                                                            className="w-[30px] h-[30px] object-cover rounded"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-medium 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]">
                                                    {option.e?.name}
                                                </h3>
                                                <div className="flex gap-2">
                                                    <h5 className="text-gray-400 font-normal 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]">
                                                        {option.e?.code}
                                                    </h5>
                                                    <h5 className="font-medium text-black 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]">
                                                        {option.e?.product_variation}
                                                    </h5>
                                                </div>
                                                <h5 className="text-gray-400 font-medium text-xs 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]">
                                                    {dataLang[option.e?.text_type]}
                                                </h5>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                type="form"
                                styles={{
                                    menuPortal: (base) => ({
                                        ...base,
                                        zIndex: 9999,
                                    }),

                                }}
                            />
                        </div>

                        <div className="col-span-9">
                            <div className={`${dataMaterialExpiry.is_enable == "1" ? "grid-cols-7" : "grid-cols-5"} grid  divide-x border-t border-b border-r border-l`} >
                                <div className="col-span-1">
                                    <SelectCore
                                        classNamePrefix="customDropdowDefault"
                                        placeholder={dataLang?.productsWarehouse_warehouseLocaImport || "productsWarehouse_warehouseLocaImport"}
                                        className="3xl:text-[12px] border-none outline-none 2xl:text-[10px] xl:text-[9.5px] text-[9px]"
                                        isDisabled={true}
                                    />
                                </div>
                                {dataMaterialExpiry.is_enable === "1" ? (
                                    <>
                                        <div className="flex items-center col-span-1 ">
                                            <NumericFormat
                                                className="appearance-none text-center 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] py-2 2xl:px-2 xl:px-1 p-0 font-normal w-[100%]  focus:outline-none border-b-2 border-gray-200"
                                                allowNegative={false}
                                                decimalScale={0}
                                                isNumericString={true}
                                                thousandSeparator=","
                                                disabled
                                            />
                                        </div>
                                        <div className="flex items-center col-span-1 ">
                                            <DatePicker
                                                // selected={effectiveDate}
                                                // blur
                                                placeholderText="dd/mm/yyyy"
                                                // dateFormat="dd/MM/yyyy"
                                                // onSelect={(date) => sEffectiveDate(date)}
                                                // placeholder={dataLang?.price_quote_system_default || "price_quote_system_default"}
                                                disabled
                                                className={`3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] border-b placeholder:text-slate-300 w-full bg-gray-50 rounded text-[#52575E] font-light px-2 py-1.5 text-center outline-none cursor-pointer  `}
                                            />
                                        </div>
                                    </>
                                ) : ""}
                                <div></div>
                                <div className="flex items-center justify-center col-span-1">
                                    <button className=" text-gray-400 hover:bg-[#e2f0fe] hover:text-gray-600 font-bold flex items-center justify-center 3xl:p-0 2xl:p-0 xl:p-0 p-0 bg-slate-200 rounded-full">
                                        <Minus className="scale-50 2xl:scale-100 xl:scale-100" size="16" />
                                    </button>
                                    <div className="mb-0.5 text-center 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]  3xl:px-1 2xl:px-0.5 xl:px-0.5 p-0 font-normal  focus:outline-none border-b w-full border-gray-200">
                                        1
                                    </div>
                                    <button className=" text-gray-400 hover:bg-[#e2f0fe] hover:text-gray-600 font-bold flex items-center justify-center 3xl:p-0 2xl:p-0 xl:p-0 p-0 bg-slate-200 rounded-full">
                                        <Add className="scale-50 2xl:scale-100 xl:scale-100" size="16" />
                                    </button>
                                </div>
                                <input
                                    placeholder={dataLang?.recall_noteChild || "recall_noteChild"}
                                    disabled
                                    className=" disabled:bg-gray-50 col-span-1 placeholder:text-slate-300 w-full bg-[#ffffff] 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]  p-1.5 "
                                />
                                <button
                                    title="Xóa"
                                    disabled
                                    className="col-span-1  disabled:opacity-50 transition w-full h-full bg-slate-100  rounded-[5.5px] text-red-500 flex flex-col justify-center items-center"
                                >
                                    <IconDelete />
                                </button>
                            </div>
                        </div>
                    </div>
                    <Customscrollbar className="max-h-[400px] h-[400px]  overflow-auto pb-2  ">
                        <div className="h-[100%] w-full">
                            {isFetching ? (
                                <Loading className="w-full h-10" color="#0f4f9e" />
                            ) : (
                                <>
                                    {listData?.map((e) => (
                                        <div
                                            key={e?.id?.toString()}
                                            className="grid items-start grid-cols-12 gap-1 my-1"
                                        >
                                            <div className="col-span-3 border border-r p-0.5 pb-1 h-full">
                                                <div className="relative mt-5 mr-1">
                                                    <SelectComponent
                                                        onInputChange={(event) => {
                                                            _HandleSeachApi(event);
                                                        }}
                                                        options={dataItems}
                                                        value={e?.item}
                                                        className=""
                                                        onChange={_HandleChangeValue.bind(this, e?.id)}
                                                        menuPortalTarget={document.body}
                                                        formatOptionLabel={(option) => (
                                                            <div className="flex items-center justify-between py-2 cursor-pointer">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="w-[40px] h-h-[60px]">
                                                                        {option.e?.images != null ? (
                                                                            <img
                                                                                src={option.e?.images}
                                                                                alt="Product Image"
                                                                                className="object-cover rounded"
                                                                            />
                                                                        ) : (
                                                                            <div className=" object-cover  flex items-center justify-center rounded w-[40px] h-h-[60px]">
                                                                                <img
                                                                                    src="/icon/noimagelogo.png"
                                                                                    alt="Product Image"
                                                                                    className="object-cover rounded "
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="font-medium 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]">
                                                                            {option.e?.name}
                                                                        </h3>
                                                                        <div className="flex gap-2">
                                                                            <h5 className="text-gray-400 font-normal 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]">
                                                                                {option.e?.code}
                                                                            </h5>
                                                                            <h5 className="font-medium text-black 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]">
                                                                                {option.e?.product_variation}
                                                                            </h5>
                                                                        </div>
                                                                        <h5 className="text-gray-400 font-medium text-xs 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]">
                                                                            {dataLang[option.e?.text_type]}
                                                                        </h5>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        classNamePrefix="customDropdow"
                                                        type="form"
                                                        styles={{
                                                            menuPortal: (base) => ({
                                                                ...base,
                                                                zIndex: 9999,
                                                            }),
                                                        }}
                                                    />
                                                    <button
                                                        onClick={_HandleAddChild.bind(this, e?.id, e?.item)}
                                                        className="absolute z-30 flex flex-col items-center justify-center w-8 h-8 transition ease-in-out rounded bg-slate-100 -top-4 right-2 hover:rotate-45 hover:bg-slate-200 hover:scale-105 hover:text-red-500"
                                                    >
                                                        <Add />
                                                    </button>
                                                    {e?.child?.filter((e) => e?.location == null).length >= 2 && (
                                                        <button
                                                            onClick={_HandleDeleteAllChild.bind(
                                                                this,
                                                                e?.id,
                                                                e?.item
                                                            )}
                                                            className="w-full rounded mt-1.5 px-5 py-1 overflow-hidden group bg-rose-500 relative hover:bg-gradient-to-r hover:from-rose-500 hover:to-rose-400 text-white hover:ring-2 hover:ring-offset-2 hover:ring-rose-400 transition-all ease-out duration-300"
                                                        >
                                                            <span className="absolute right-0 w-full h-full -mt-12 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease"></span>
                                                            <span className="relative text-xs">
                                                                Xóa{" "}
                                                                {e?.child?.filter((e) => e?.location == null).length}{" "}
                                                                hàng chưa chọn vị trí
                                                            </span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="items-center col-span-9">
                                                <div className={`${dataMaterialExpiry.is_enable == "1" ? "grid-cols-7" : "grid-cols-5"}  3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] border-b divide-x divide-y border-r grid `}>
                                                    {e?.child?.map((ce) => (
                                                        <React.Fragment key={ce?.id?.toString()}>
                                                            <div className="flex flex-col items-center justify-center h-full p-1 border-t border-l ">
                                                                <SelectCore
                                                                    options={dataLocation}
                                                                    value={ce?.location}
                                                                    onChange={_HandleChangeChild.bind(
                                                                        this,
                                                                        e?.id,
                                                                        ce?.id,
                                                                        "location"
                                                                    )}
                                                                    className={`${errWarehouse && ce?.location == null ? "border-red-500 border" : ""}  my-1 3xl:text-[12px] 2xl:text-[10px] cursor-pointer xl:text-[9.5px] text-[9px] placeholder:text-slate-300 w-full  rounded text-[#52575E] font-normal `}
                                                                    placeholder={onLoadingChild ? "" : dataLang?.productsWarehouse_warehouseLocaImport || "productsWarehouse_warehouseLocaImport"}
                                                                    noOptionsMessage={() =>
                                                                        dataLang?.returns_nodata || "returns_nodata"
                                                                    }
                                                                    menuPortalTarget={document.body}
                                                                    formatOptionLabel={(option) => (
                                                                        <div className="cursor-pointer">
                                                                            <div className="flex gap-1">
                                                                                <h2 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] font-semibold">
                                                                                    {option?.label}
                                                                                </h2>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    // type="form"
                                                                    style={{
                                                                        border: "none",
                                                                        boxShadow: "none",
                                                                        outline: "none",
                                                                    }}
                                                                    theme={(theme) => ({
                                                                        ...theme,
                                                                        colors: {
                                                                            ...theme.colors,
                                                                            primary25: "#EBF5FF",
                                                                            primary50: "#92BFF7",
                                                                            primary: "#0F4F9E",
                                                                        },
                                                                    })}
                                                                    styles={{
                                                                        menu: (provided, state) => ({
                                                                            ...provided,
                                                                            // width: "150%",
                                                                        }),
                                                                    }}
                                                                    classNamePrefix="customDropdow"
                                                                />
                                                            </div>

                                                            {dataMaterialExpiry.is_enable == "1" ? (
                                                                <>
                                                                    <div className="col-span-1 ">
                                                                        <div className="flex flex-col items-center justify-center h-full p-1 ">
                                                                            <input
                                                                                value={ce?.lot}
                                                                                disabled={true}
                                                                                className={`border ${ce?.disabledDate
                                                                                    ? "bg-gray-50"
                                                                                    : errLot && (ce?.lot == "" || ce?.lot == null)
                                                                                        ? "border-red-500"
                                                                                        : "focus:border-[#92BFF7] border-[#d0d5dd] "
                                                                                    } placeholder:text-slate-300 w-full disabled:bg-gray-50  bg-[#ffffff]  rounded text-[#52575E] font-normal p-4 outline-none cursor-pointer`}
                                                                                onChange={_HandleChangeChild.bind(
                                                                                    this,
                                                                                    e?.id,
                                                                                    ce?.id,
                                                                                    "lot"
                                                                                )}
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <div className="col-span-1 ">
                                                                        <div className="flex flex-col items-center justify-center w-full h-full p-1 custom-date-picker">
                                                                            <div className="relative col-span-4">
                                                                                <div className="flex flex-row custom-date-picker">
                                                                                    <DatePicker
                                                                                        selected={ce?.date}
                                                                                        blur
                                                                                        // disabled={ce?.disabledDate}
                                                                                        disabled={true}
                                                                                        placeholderText="DD/MM/YYYY"
                                                                                        dateFormat="dd/MM/yyyy"
                                                                                        onSelect={(date) =>
                                                                                            _HandleChangeChild(
                                                                                                e?.id,
                                                                                                ce?.id,
                                                                                                "date",
                                                                                                date
                                                                                            )
                                                                                        }
                                                                                        placeholder={dataLang?.price_quote_system_default || "price_quote_system_default"}
                                                                                        className={`border ${ce?.disabledDate
                                                                                            ? "bg-gray-50"
                                                                                            : errDateList &&
                                                                                                ce?.date == null
                                                                                                ? "border-red-500"
                                                                                                : "focus:border-[#92BFF7] border-[#d0d5dd]"
                                                                                            } placeholder:text-slate-300 w-full bg-[#ffffff] disabled:bg-gray-50 rounded text-[#52575E] font-normal p-4 outline-none cursor-pointer`}
                                                                                    />
                                                                                    {effectiveDate && (
                                                                                        <>
                                                                                            <MdClear
                                                                                                className="absolute right-0 -translate-x-[320%] translate-y-[1%] h-10 text-[#CCCCCC] hover:text-[#999999] scale-110 cursor-pointer"
                                                                                                onClick={() =>
                                                                                                    handleClearDate(
                                                                                                        "effectiveDate"
                                                                                                    )
                                                                                                }
                                                                                            />
                                                                                        </>
                                                                                    )}
                                                                                    <BsCalendarEvent className="absolute right-0 -translate-x-[75%] translate-y-[150%] text-[#CCCCCC] scale-110 cursor-pointer" />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                ""
                                                            )}
                                                            <div className="flex items-center justify-center">
                                                                {ce?.unit}
                                                            </div>
                                                            <div className="flex items-center justify-center  h-full p-0.5">
                                                                <button
                                                                    className=" text-gray-400 hover:bg-[#e2f0fe] hover:text-gray-600 font-bold flex items-center justify-center 3xl:p-0 2xl:p-0 xl:p-0 p-0 bg-slate-200 rounded-full"
                                                                    onClick={_HandleChangeChild.bind(
                                                                        this,
                                                                        e?.id,
                                                                        ce?.id,
                                                                        "decrease"
                                                                    )}
                                                                >
                                                                    <Minus
                                                                        className="scale-50 2xl:scale-100 xl:scale-100"
                                                                        size="16"
                                                                    />
                                                                </button>

                                                                <InPutNumericFormat
                                                                    className={`${errQty &&
                                                                        (ce?.recallQuantity == null || ce?.recallQuantity == "" || ce?.recallQuantity == 0)
                                                                        ? "border-red-500 border-b"
                                                                        : ""
                                                                        }
                                                                        ${(ce?.recallQuantity == null || ce?.recallQuantity == "" || ce?.recallQuantity == 0) &&
                                                                        "border-red-500 border-b"
                                                                        }
                                                                        placeholder:3xl:text-[11px] placeholder:xxl:text-[9px] placeholder:2xl:text-[8.5px] placeholder:xl:text-[7px] placeholder:lg:text-[6.3px] placeholder:text-[10px] appearance-none text-center  3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] 3xl:px-1 2xl:px-0.5 xl:px-0.5 p-0 font-normal w-full focus:outline-none border-b border-gray-200 `}
                                                                    onValueChange={_HandleChangeChild.bind(
                                                                        this,
                                                                        e?.id,
                                                                        ce?.id,
                                                                        "recallQuantity"
                                                                    )}
                                                                    value={ce?.recallQuantity}
                                                                    isAllowed={isAllowedNumber}
                                                                />

                                                                <button
                                                                    className=" text-gray-400 hover:bg-[#e2f0fe] hover:text-gray-600 font-bold flex items-center justify-center 3xl:p-0 2xl:p-0 xl:p-0 p-0 bg-slate-200 rounded-full"
                                                                    onClick={_HandleChangeChild.bind(
                                                                        this,
                                                                        e?.id,
                                                                        ce?.id,
                                                                        "increase"
                                                                    )}
                                                                >
                                                                    <Add
                                                                        className="scale-50 2xl:scale-100 xl:scale-100"
                                                                        size="16"
                                                                    />
                                                                </button>
                                                            </div>
                                                            <div className="col-span-1  flex items-center justify-center  h-full p-0.5">
                                                                <input
                                                                    value={ce?.note}
                                                                    onChange={_HandleChangeChild.bind(
                                                                        this,
                                                                        e?.id,
                                                                        ce?.id,
                                                                        "note"
                                                                    )}
                                                                    placeholder={dataLang?.recall_noteChild || "recall_noteChild"}
                                                                    type="text"
                                                                    className="placeholder:text-slate-300 w-full bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-2 outline-none "
                                                                />
                                                            </div>
                                                            <div className=" h-full p-0.5 flex flex-col items-center justify-center ">
                                                                <button
                                                                    title="Xóa"
                                                                    onClick={_HandleDeleteChild.bind(
                                                                        this,
                                                                        e?.id,
                                                                        ce?.id
                                                                    )}
                                                                    className="flex flex-col items-center justify-center text-red-500 transition-all duration-200 ease-linear hover:scale-105"
                                                                >
                                                                    <IconDelete />
                                                                </button>
                                                            </div>
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </Customscrollbar>
                    <h2 className="font-normal bg-[white]  p-2 border-b border-b-[#a9b5c5]  border-t border-t-[#a9b5c5]">
                        {dataLang?.purchase_total || "purchase_total"}
                    </h2>
                </div>
                <div className="grid grid-cols-12">
                    <div className="col-span-9">
                        <div className="text-[#344054] font-normal text-sm mb-1 ">
                            {dataLang?.returns_reason || "returns_reason"}
                        </div>
                        <textarea
                            value={note}
                            placeholder={dataLang?.returns_reason || "returns_reason"}
                            onChange={_HandleChangeInput.bind(this, "note")}
                            name="fname"
                            type="text"
                            className="focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-[40%] min-h-[220px] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 max-h-[220px] bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-2 border outline-none "
                        />
                    </div>
                    <div className="flex-col justify-between col-span-3 mt-5 space-y-4 text-right ">
                        <div className="flex justify-between "></div>
                        <div className="flex justify-between ">
                            <div className="font-normal">
                                <h3>{dataLang?.production_warehouse_totalItem || "production_warehouse_totalItem"}</h3>
                            </div>
                            <div className="font-normal">
                                <h3 className="text-blue-600">{formatNumber(listData?.length)}</h3>
                            </div>
                        </div>
                        <div className="flex justify-between ">
                            <div className="font-normal">
                                <h3>{dataLang?.recall_totalQty || "recall_totalQty"}</h3>
                            </div>
                            <div className="font-normal">
                                <h3 className="text-blue-600">
                                    {formatNumber(listData?.reduce((total, item) => {
                                        item?.child?.forEach((childItem) => {
                                            if (
                                                childItem.recallQuantity !== undefined &&
                                                childItem.recallQuantity !== null
                                            ) {
                                                total += childItem.recallQuantity;
                                            }
                                        });
                                        return total;
                                    }, 0)
                                    )}
                                </h3>
                            </div>
                        </div>
                        <div className="space-x-2">
                            <ButtonBack onClick={() => router.push(routerRecall.home)} dataLang={dataLang} />
                            <ButtonSubmit onClick={_HandleSubmit.bind(this)} loading={onSending} dataLang={dataLang} />
                        </div>
                    </div>
                </div>
            </Container>
            <PopupConfim
                dataLang={dataLang}
                type="warning"
                title={TITLE_DELETE_ITEMS}
                subtitle={CONFIRMATION_OF_CHANGES}
                isOpen={isOpen}
                save={resetValue}
                nameModel={"change_item"}
                cancel={() => handleQueryId({ status: false })}
            />
        </React.Fragment>
    );
};

export default RecallForm;
