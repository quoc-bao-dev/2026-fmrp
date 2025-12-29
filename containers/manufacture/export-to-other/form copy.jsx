import apiExportToOther from "@/Api/apiManufacture/warehouse/exportToOther/apiExportToOther";
import Breadcrumb from "@/components/UI/breadcrumb/BreadcrumbCustom";
import ButtonBack from "@/components/UI/button/buttonBack";
import ButtonSubmit from "@/components/UI/button/buttonSubmit";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import { EmptyExprired } from "@/components/UI/common/EmptyExprired";
import { Container } from "@/components/UI/common/layout";
import InPutNumericFormat from "@/components/UI/inputNumericFormat/inputNumericFormat";
import Loading from "@/components/UI/loading/loading";
import PopupConfim from "@/components/UI/popupConfim/popupConfim";
import { CONFIRMATION_OF_CHANGES, TITLE_DELETE_ITEMS } from "@/constants/delete/deleteItems";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import { useBranchList } from "@/hooks/common/useBranch";
import { useObject, useObjectList } from "@/hooks/common/useObject";
import { useWarehouseComboboxByManufactureByBranch } from "@/hooks/common/useWarehouses";
import useFeature from "@/hooks/useConfigFeature";
import useSetingServer from "@/hooks/useConfigNumber";
import useStatusExprired from "@/hooks/useStatusExprired";
import useToast from "@/hooks/useToast";
import { useToggle } from "@/hooks/useToggle";
import { routerExportToOther } from "@/routers/manufacture";
import { formatMoment } from "@/utils/helpers/formatMoment";
import formatNumberConfig from "@/utils/helpers/formatnumber";
import { CreatableSelectCore } from "@/utils/lib/CreatableSelect";
import { SelectCore } from "@/utils/lib/Select";
import { useQuery } from "@tanstack/react-query";
import { Add, Trash as IconDelete, Minus } from "iconsax-react";
import { debounce } from "lodash";
import moment from "moment/moment";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import { BsCalendarEvent } from "react-icons/bs";
import { MdClear } from "react-icons/md";
import { v4 as uuidv4 } from "uuid";
import { useExportToOtherItems } from "./hooks/useExportToOtherItems";

const ExportToOtherForm = (props) => {
    const router = useRouter();

    const id = router.query?.id;

    const scrollAreaRef = useRef(null);

    const dataSeting = useSetingServer();

    const handleMenuOpen = () => {
        const menuPortalTarget = scrollAreaRef.current;
        return { menuPortalTarget };
    };

    const dataLang = props?.dataLang;

    const isShow = useToast();

    const { isOpen, isKeyState, handleQueryId } = useToggle();

    const [onLoadingChild, sOnLoadingChild] = useState(false);

    const [onSending, sOnSending] = useState(false);

    const [code, sCode] = useState("");

    const [searchItems, setSearchItems] = useState("");

    const [startDate, sStartDate] = useState(new Date());

    const [note, sNote] = useState("");

    const [date, sDate] = useState(moment().format(FORMAT_MOMENT.DATE_TIME_LONG));

    const { dataMaterialExpiry, dataProductExpiry, dataProductSerial } = useFeature();

    const statusExprired = useStatusExprired();

    const [listData, sListData] = useState([]);

    const [idBranch, sIdBranch] = useState(null);

    const [idExportWarehouse, sIdExportWarehouse] = useState(null);

    const [errDate, sErrDate] = useState(false);

    const [errBranch, sErrBranch] = useState(false);

    const [errWarehouse, sErrWarehouse] = useState(false);

    const [errQty, sErrQty] = useState(false);

    const [errExportWarehouse, sErrExportWarehouse] = useState(false);

    const [errObject, sErrObject] = useState(false);

    const [errListObject, sErrListObject] = useState(false);

    const [object, sObject] = useState(null);

    const [listObject, sListObject] = useState(null);

    const { data: dataBranch = [] } = useBranchList();

    const { data: dataObjects = [] } = useObject(dataLang)

    const { data: dataListObject } = useObjectList(dataLang, idBranch, object)

    const { data: dataWarehouses } = useWarehouseComboboxByManufactureByBranch(idBranch, undefined)

    const { data: dataItems } = useExportToOtherItems(idBranch, idExportWarehouse, searchItems)

    useEffect(() => {
        router.query && sErrDate(false);
        router.query && sErrListObject(false);
        router.query && sErrObject(false);
        router.query && sErrBranch(false);
        router.query && sErrExportWarehouse(false);
        router.query && sStartDate(new Date());
        router.query && sNote("");
    }, [router.query]);

    const formatNumber = (number) => {
        return formatNumberConfig(+number, dataSeting);
    };

    const { isFetching } = useQuery({
        queryKey: ["api_export_to_other_page_detail", id],
        queryFn: async () => {
            const rResult = await apiExportToOther.apiDetaiPageExportToOther(id);
            sIdBranch({
                label: rResult?.branch_name,
                value: rResult?.branch_id,
            });
            sIdExportWarehouse({
                label: rResult?.warehouse_name,
                value: rResult?.warehouse_id,
            });

            sCode(rResult?.code);
            sObject({
                label: dataLang[rResult?.object] || rResult?.object,
                value: rResult?.object,
            });
            sListObject(
                rResult?.object === "other"
                    ? {
                        label: rResult?.object_text,
                        value: rResult?.object_text,
                    }
                    : {
                        label: dataLang[rResult?.object_text] || rResult?.object_text,
                        value: rResult?.object_id,
                    }
            );
            sListData(rResult?.items.map((e) => ({
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
                        (e.item?.text_type == "material" && dataMaterialExpiry?.is_enable == "0" && true) ||
                        (e.item?.text_type == "products" && dataProductExpiry?.is_enable == "1" && false) ||
                        (e.item?.text_type == "products" && dataProductExpiry?.is_enable == "0" && true),
                    location:
                        ce?.warehouse_location?.location_name ||
                            ce?.warehouse_location?.id ||
                            ce?.warehouse_location?.warehouse_name ||
                            ce?.warehouse_location?.quantity
                            ? {
                                label: ce?.warehouse_location?.location_name,
                                value: ce?.warehouse_location?.id,
                                warehouse_name: ce?.warehouse_location?.warehouse_name,
                                qty: ce?.warehouse_location?.quantity,
                            }
                            : null,
                    dataWarehouse: e?.item?.warehouseList.map((ye) => ({
                        label: ye?.location_name,
                        value: ye?.id,
                        warehouse_name: ye?.warehouse_name,
                        qty: +ye?.quantity,
                    })),
                    serial: ce?.serial == null ? "" : ce?.serial,
                    lot: ce?.lot == null ? "" : ce?.lot,
                    date: ce?.expiration_date != null ? moment(ce?.expiration_date).toDate() : null,
                    unit: e.item?.unit_name,
                    toOtherQuantity: +ce?.quantity,
                    note: ce?.note,
                })),
            }))
            );
            sStartDate(moment(rResult?.date).toDate());
            sNote(rResult?.note);
        },
        enabled: !!id
    })

    const _HandleSeachApi = debounce(async (inputValue) => {
        if (idBranch == null || idExportWarehouse == null || inputValue == "") {
            return;
        } else {
            setSearchItems(inputValue);
        }
    }, 500);

    const resetValue = () => {
        if (isKeyState?.type === "branch") {
            sListData([]);
            sIdBranch(isKeyState?.value);
            sIdExportWarehouse(null);
            sListObject(null);
        }
        if (isKeyState?.type === "idExportWarehouse") {
            sListData([]);
            sIdExportWarehouse(isKeyState?.value);
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
                handleQueryId({ status: true, initialKey: { type, value } });
            } else {
                sListObject(null);
                sIdExportWarehouse(null);
                sIdBranch(value);
            }
        } else if (type == "idExportWarehouse" && idExportWarehouse != value) {
            if (listData?.length > 0) {
                handleQueryId({ status: true, initialKey: { type, value } });
            } else {
                sIdExportWarehouse(value);
            }
        } else if (type == "object" && object != value) {
            sObject(value);
            sListObject(null);
        } else if (type == "listObject") {
            sListObject(value);
        }
    };

    const handleClearDate = (type) => {
        if (type === "effectiveDate") {
        }
        if (type === "startDate") {
            sStartDate(new Date());
        }
    };
    const handleTimeChange = (date) => {
        sStartDate(date);
    };

    const _HandleAddChild = (parentId, value) => {
        sOnLoadingChild(true);
        const newData = listData?.map((e) => {
            if (e?.id === parentId) {
                const newChild = {
                    id: uuidv4(),
                    disabledDate:
                        (value?.e?.text_type === "material" && dataMaterialExpiry?.is_enable === "1" && false) ||
                        (value?.e?.text_type === "material" && dataMaterialExpiry?.is_enable === "0" && true) ||
                        (value?.e?.text_type === "products" && dataProductExpiry?.is_enable === "1" && false) ||
                        (value?.e?.text_type === "products" && dataProductExpiry?.is_enable === "0" && true),
                    location: null,
                    dataWarehouse: value?.e?.warehouseList.map((e) => ({
                        label: e?.location_name,
                        value: e?.id,
                        warehouse_name: e?.warehouse_name,
                        qty: e?.quantity,
                    })),
                    unit: value?.e?.unit_name || value?.e?.unit,
                    serial: "",
                    lot: "",
                    date: null,
                    toOtherQuantity: null,
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
                            (value?.e?.text_type === "material" && dataMaterialExpiry?.is_enable === "0" && true) ||
                            (value?.e?.text_type === "products" && dataProductExpiry?.is_enable === "1" && false) ||
                            (value?.e?.text_type === "products" && dataProductExpiry?.is_enable === "0" && true),
                        location: null,
                        dataWarehouse: value?.e?.warehouseList.map((e) => ({
                            label: e?.location_name,
                            value: e?.id,
                            warehouse_name: e?.warehouse_name,
                            qty: e?.quantity,
                        })),
                        serial: "",
                        lot: "",
                        date: null,
                        unit: value?.e?.unit_name,

                        toOtherQuantity: null,
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

    const _HandleDeleteChild = useCallback((parentId, childId) => {
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
                const updatedChild = { ...newData[parentIndex].child[childIndex] };
                if (type === "toOtherQuantity") {
                    const qtyExport = Number(value?.value);
                    updatedChild.toOtherQuantity = qtyExport;
                } else if (type === "location") {
                    const checkKho = newData[parentIndex].child.map((house) => house).some((i) => i?.location?.value === value?.value);
                    if (checkKho) {
                        handleCheckError("Vị trí kho đã được chọn");
                    } else {
                        updatedChild.location = value;
                    }
                } else if (type === "increase") {
                    if (updatedChild.location == null) {
                        handleCheckError("Vui lòng chọn vị trí trước");
                    } else if (
                        updatedChild.toOtherQuantity == updatedChild.location?.qty || (id && updatedChild.toOtherQuantity >= updatedChild.location?.qty)
                    ) {
                        handleQuantityError(updatedChild?.location?.qty);
                    } else {
                        updatedChild.toOtherQuantity = Number(updatedChild.toOtherQuantity) + 1;
                    }
                } else if (type === "decrease") {
                    if (updatedChild.toOtherQuantity >= 2) {
                        updatedChild.toOtherQuantity = Number(updatedChild.toOtherQuantity) - 1;
                    }
                } else if (type === "note") {
                    updatedChild.note = value?.target.value;
                }
                newData[parentIndex].child[childIndex] = updatedChild;
            }
        }
        sListData(newData);
    }, [listData]);

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
                                dataWarehouse: value?.e?.warehouseList.map((e) => ({
                                    label: e?.location_name,
                                    value: e?.id,
                                    warehouse_name: e?.warehouse_name,
                                    qty: e?.quantity,
                                })),
                                unit: value?.e?.unit_name,
                                toOtherQuantity: null,
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

    const _HandleSubmit = (e) => {
        e.preventDefault();
        const hasNullOrCondition = (data, conditionFn) => data.some((item) => item.child?.some((childItem) => conditionFn(item, childItem)));
        const hasNullKho = hasNullOrCondition(listData, (item, childItem) => childItem.location === null);
        const hasNullQty = hasNullOrCondition(listData, (item, childItem) => childItem.toOtherQuantity === null || childItem.toOtherQuantity === "" || childItem.toOtherQuantity == 0);

        const isEmpty = listData?.length === 0;

        if (
            idBranch == null ||
            hasNullKho ||
            hasNullQty ||
            object == null ||
            listObject == null ||
            idExportWarehouse == null ||
            isEmpty
        ) {
            object == null && sErrObject(true);
            listObject == null && sErrListObject(true);
            idBranch == null && sErrBranch(true);
            idExportWarehouse == null && sErrExportWarehouse(true);
            hasNullQty && sErrQty(true);
            hasNullKho && sErrWarehouse(true);

            if (isEmpty) {
                handleCheckError("Chưa nhập thông tin mặt hàng");
            } else {
                handleCheckError(dataLang?.required_field_null);
            }
        } else {
            sErrWarehouse(false);
            sErrQty(false);
            sOnSending(true);
        }
    };

    //Hàm set xóa lỗi
    const useClearErrorEffect = (sError, condition) => {
        useEffect(() => {
            sError(false);
        }, [condition]);
    };

    //Tham chiếu đến hàm rồi xử lý
    useClearErrorEffect(sErrDate, date != null);
    useClearErrorEffect(sErrBranch, idBranch != null);
    useClearErrorEffect(sErrObject, object != null);
    useClearErrorEffect(sErrListObject, listObject != null);
    useClearErrorEffect(sErrExportWarehouse, idExportWarehouse != null);

    const _ServerSending = async () => {
        let formData = new FormData();

        formData.append("code", code);

        formData.append("date", formatMoment(startDate, FORMAT_MOMENT.DATE_TIME_LONG));

        formData.append("branch_id", idBranch?.value);

        formData.append("warehouse_id", idExportWarehouse?.value);

        formData.append("object", object?.value);

        if (object?.value == "other") {
            formData.append("object_text", listObject?.value);
        } else {
            formData.append("object_id", listObject?.value);
        }
        formData.append("note", note);
        listData.forEach((item, index) => {
            formData.append(`items[${index}][id]`, id ? item?.idParenBackend : "");
            formData.append(`items[${index}][item]`, item?.item?.value);
            item?.child?.forEach((childItem, childIndex) => {
                formData.append(`items[${index}][child][${childIndex}][row_id]`, id ? childItem?.idChildBackEnd : "");
                formData.append(`items[${index}][child][${childIndex}][location_warehouses_id]`, childItem?.location?.value || 0);
                formData.append(`items[${index}][child][${childIndex}][note]`, childItem?.note ? childItem?.note : "");
                formData.append(`items[${index}][child][${childIndex}][quantity]`, childItem?.toOtherQuantity);
            });
        });
        try {
            const { isSuccess, message } = await apiExportToOther.apiHandingExportToOther(id ? id : undefined, formData);
            if (isSuccess) {
                isShow("success", `${dataLang[message]}` || message);
                sCode("");
                sStartDate(new Date());
                sIdBranch(null);
                sIdExportWarehouse(null);
                sObject(null);
                sListObject(null);
                sNote("");
                sErrBranch(false);
                sErrListObject(false);
                sErrObject(false);
                sErrWarehouse(false);
                sErrDate(false);
                sErrExportWarehouse(false);
                sListData([]);
                router.push(routerExportToOther.home);
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

    const handleCheckError = (e) => isShow("error", `${e}`);

    const handleQuantityError = (e) => {
        isShow("error", `Số lượng chỉ được bé hơn hoặc bằng ${formatNumber(e)} số lượng tồn`);
    };

    // breadcrumb
    const breadcrumbItems = [
        {
            label: `${dataLang?.Warehouse_title || "Warehouse_title"}`,
            // href: "/",
        },
        {
            label: `${dataLang?.exportToOthe_list || "exportToOthe_list"}`,
            href: "/manufacture/export-to-other",
        },
        {
            label: id ? dataLang?.exportToOthe_exporttoOtherEdit || "exportToOthe_exporttoOtherEdit" : dataLang?.exportToOthe_exporttoOtherAdd || "exportToOthe_exporttoOtherAdd",
        },
    ];

    return (
        <React.Fragment>
            <Head>
                <title>
                    {id ? dataLang?.exportToOthe_exporttoOtherEdit || "exportToOthe_exporttoOtherEdit" : dataLang?.exportToOthe_exporttoOtherAdd || "exportToOthe_exporttoOtherAdd"}
                </title>
            </Head>
            <Container className={"!h-auto"}>
                {statusExprired ? (
                    <EmptyExprired />
                ) : (
                    <Breadcrumb
                        items={breadcrumbItems}
                        className="3xl:text-sm 2xl:text-xs xl:text-[10px] lg:text-[10px]"
                    />
                    // <div className="flex space-x-1 mt-4 3xl:text-sm 2xl:text-[11px] xl:text-[10px] lg:text-[10px]">
                    //     <h6 className="text-[#141522]/40">
                    //         {dataLang?.exportToOthe_exporttoOther || "exportToOthe_exporttoOther"}
                    //     </h6>
                    //     <span className="text-[#141522]/40">/</span>
                    //     <h6>
                    //         {id ? dataLang?.exportToOthe_exporttoOtherEdit || "exportToOthe_exporttoOtherEdit" : dataLang?.exportToOthe_exporttoOtherAdd || "exportToOthe_exporttoOtherAdd"}
                    //     </h6>
                    // </div>
                )}
                <div className="h-[97%] space-y-3 overflow-hidden">
                    <div className="flex items-center justify-between">
                        <h2 className="text-title-section text-[#52575E] capitalize font-medium">
                            {id ? dataLang?.exportToOthe_exporttoOtherEdit || "exportToOthe_exporttoOtherEdit" : dataLang?.exportToOthe_exporttoOtherAdd || "exportToOthe_exporttoOtherAdd"}
                        </h2>
                        <div className="flex items-center justify-end mr-2">
                            <ButtonBack onClick={() => router.push(routerExportToOther.home)} dataLang={dataLang} />
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
                                    <SelectCore
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
                                            placeholder: (base) => ({
                                                ...base,
                                                color: "#cbd5e1",
                                            }),
                                            menu: (provided) => ({
                                                ...provided,
                                                zIndex: 9999, // Giá trị z-index tùy chỉnh
                                            }),
                                            control: (base, state) => ({
                                                ...base,
                                                boxShadow: "none",
                                                padding: "2.7px",
                                                ...(state.isFocused && {
                                                    border: "0 0 0 1px #92BFF7",
                                                }),
                                            }),
                                        }}
                                    />
                                    {errBranch && (
                                        <label className="text-sm text-red-500">
                                            {dataLang?.purchase_order_errBranch || "purchase_order_errBranch"}
                                        </label>
                                    )}
                                </div>
                                <div className="col-span-2 ">
                                    <label className="text-[#344054] font-normal text-sm mb-1 ">
                                        {dataLang?.exportToOthe_warehouse || "exportToOthe_warehouse"}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <SelectCore
                                        options={dataWarehouses}
                                        onChange={_HandleChangeInput.bind(this, "idExportWarehouse")}
                                        value={idExportWarehouse}
                                        isClearable={true}
                                        noOptionsMessage={() => dataLang?.returns_nodata || "returns_nodata"}
                                        closeMenuOnSelect={true}
                                        hideSelectedOptions={false}
                                        placeholder={dataLang?.exportToOthe_warehouse || "exportToOthe_warehouse"}
                                        className={`${errExportWarehouse ? "border-red-500" : "border-transparent"} placeholder:text-slate-300 w-full z-20 bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border `}
                                        isSearchable={true}
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
                                            placeholder: (base) => ({
                                                ...base,
                                                color: "#cbd5e1",
                                            }),
                                            menu: (provided) => ({
                                                ...provided,
                                                zIndex: 9999, // Giá trị z-index tùy chỉnh
                                            }),
                                            control: (base, state) => ({
                                                ...base,
                                                boxShadow: "none",
                                                padding: "2.7px",
                                                ...(state.isFocused && {
                                                    border: "0 0 0 1px #92BFF7",
                                                }),
                                            }),
                                        }}
                                    />
                                    {errExportWarehouse && (
                                        <label className="text-sm text-red-500">
                                            {dataLang?.exportToOthe_errWarehouse || "exportToOthe_errWarehouse"}
                                        </label>
                                    )}
                                </div>
                                {/* <div className="col-span-2 ">
                                    <label className="text-[#344054] font-normal text-sm mb-1 ">
                                        {dataLang?.production_warehouse_LSX || "production_warehouse_LSX"}
                                    </label>
                                    <SelectCore
                                        options={[]}
                                        onChange={_HandleChangeInput.bind(this, "")}
                                        value={""}
                                        isClearable={true}
                                        noOptionsMessage={() => dataLang?.returns_nodata || "returns_nodata"}
                                        closeMenuOnSelect={true}
                                        hideSelectedOptions={false}
                                        placeholder={dataLang?.production_warehouse_LSX || "production_warehouse_LSX"}
                                        className={`${"border-transparent"} placeholder:text-slate-300 w-full z-20 bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border `}
                                        isSearchable={true}
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
                                            placeholder: (base) => ({
                                                ...base,
                                                color: "#cbd5e1",
                                            }),
                                            menu: (provided) => ({
                                                ...provided,
                                                zIndex: 9999, // Giá trị z-index tùy chỉnh
                                            }),
                                            control: (base, state) => ({
                                                ...base,
                                                boxShadow: "none",
                                                padding: "2.7px",
                                                ...(state.isFocused && {
                                                    border: "0 0 0 1px #92BFF7",
                                                }),
                                            }),
                                        }}
                                    />
                                </div> */}
                                <div className="col-span-2">
                                    <label className="text-[#344054] font-normal text-sm">
                                        {props.dataLang?.payment_ob || "payment_ob"}{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <SelectCore
                                        closeMenuOnSelect={true}
                                        placeholder={props.dataLang?.payment_ob || "payment_ob"}
                                        options={dataObjects}
                                        isSearchable={true}
                                        onChange={_HandleChangeInput.bind(this, "object")}
                                        value={object}
                                        LoadingIndicator
                                        noOptionsMessage={() => "Không có dữ liệu"}
                                        maxMenuHeight="200px"
                                        isClearable={true}
                                        menuPortalTarget={document.body}
                                        onMenuOpen={handleMenuOpen}
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
                                            placeholder: (base) => ({
                                                ...base,
                                                color: "#cbd5e1",
                                            }),
                                            menuPortal: (base) => ({
                                                ...base,
                                                zIndex: 9999,
                                                position: "absolute",
                                            }),
                                        }}
                                        className={`${errObject ? "border-red-500" : "border-transparent"
                                            }  placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E]  font-normal outline-none border `}
                                    />
                                    {errObject && (
                                        <label className="mb-2 text-sm text-red-500">
                                            {props.dataLang?.payment_errOb || "payment_errOb"}
                                        </label>
                                    )}
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[#344054] font-normal text-sm ">
                                        {props.dataLang?.payment_listOb || "payment_listOb"}{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    {object?.value == "other" ? (
                                        <CreatableSelectCore
                                            options={dataListObject}
                                            placeholder={props.dataLang?.payment_listOb || "payment_listOb"}
                                            onChange={_HandleChangeInput.bind(this, "listObject")}
                                            isClearable={true}
                                            value={listObject}
                                            classNamePrefix="Select"
                                            className={`${errListObject ? "border-red-500" : "border-transparent"} Select__custom removeDivide  placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E]  font-normal outline-none border `}
                                            isSearchable={true}
                                            noOptionsMessage={() => `Chưa có gợi ý`}
                                            formatCreateLabel={(value) => `Tạo "${value}"`}
                                            menuPortalTarget={document.body}
                                            onMenuOpen={handleMenuOpen}
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
                                                placeholder: (base) => ({
                                                    ...base,
                                                    color: "#cbd5e1",
                                                }),
                                                menuPortal: (base) => ({
                                                    ...base,
                                                    zIndex: 9999,
                                                    position: "absolute",
                                                }),
                                                control: (base, state) => ({
                                                    ...base,
                                                    boxShadow: "none",
                                                    ...(state.isFocused && {
                                                        border: "0 0 0 1px #92BFF7",
                                                    }),
                                                }),
                                                dropdownIndicator: (base) => ({
                                                    ...base,
                                                    display: "none",
                                                }),
                                            }}
                                        />
                                    ) : (
                                        <SelectCore
                                            closeMenuOnSelect={true}
                                            placeholder={props.dataLang?.payment_listOb || "payment_listOb"}
                                            options={dataListObject}
                                            isSearchable={true}
                                            onChange={_HandleChangeInput.bind(this, "listObject")}
                                            value={listObject}
                                            LoadingIndicator
                                            noOptionsMessage={() => "Không có dữ liệu"}
                                            maxMenuHeight="200px"
                                            isClearable={true}
                                            menuPortalTarget={document.body}
                                            onMenuOpen={handleMenuOpen}
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
                                                placeholder: (base) => ({
                                                    ...base,
                                                    color: "#cbd5e1",
                                                }),
                                                menuPortal: (base) => ({
                                                    ...base,
                                                    zIndex: 9999,
                                                    position: "absolute",
                                                }),
                                            }}
                                            className={`${errListObject ? "border-red-500" : "border-transparent"
                                                }  placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E]  font-normal outline-none border `}
                                        />
                                    )}
                                    {errListObject && (
                                        <label className="mb-2 text-sm text-red-500">
                                            {object?.value == "other" ? props.dataLang?.exportToOthe_errListOb || "exportToOthe_errListOb" : props.dataLang?.payment_errListOb || "payment_errListOb"}
                                        </label>
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
                            <div className={`grid-cols-5  grid `}>
                                <h4 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] px-2  text-[#667085] uppercase  col-span-1   text-center  truncate font-[400]">
                                    {dataLang?.exportToOthe_location || "exportToOthe_location"}
                                </h4>
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
                            <SelectCore
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
                                                <div>
                                                    <h3 className="font-medium 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]">
                                                        {option.e?.name}
                                                    </h3>
                                                    <div className="flex gap-2">
                                                        <h5 className="text-gray-400 font-normal 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]">
                                                            {option.e?.code}
                                                        </h5>
                                                        <h5 className="font-medium 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]">
                                                            {option.e?.product_variation}
                                                        </h5>
                                                    </div>
                                                    <h5 className="text-gray-400 font-medium text-xs 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]">
                                                        {dataLang[option.e?.text_type] || option.e?.text_type}
                                                    </h5>
                                                    <div className="flex items-center gap-2 italic">
                                                        {dataProductSerial.is_enable === "1" && (
                                                            <div className="text-[11px] text-[#667085] font-[500]">
                                                                Serial: {option.e?.serial ? option.e?.serial : "-"}
                                                            </div>
                                                        )}
                                                        {dataMaterialExpiry.is_enable === "1" || dataProductExpiry.is_enable === "1" ? (
                                                            <>
                                                                <div className="text-[11px] text-[#667085] font-[500]">
                                                                    Lot: {option.e?.lot ? option.e?.lot : "-"}
                                                                </div>
                                                                <div className="text-[11px] text-[#667085] font-[500]">
                                                                    Date:{" "}
                                                                    {option.e?.expiration_date
                                                                        ? formatMoment(option.e?.expiration_date, FORMAT_MOMENT.DATE_SLASH_LONG)
                                                                        : "-"}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            ""
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
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
                                    placeholder: (base) => ({
                                        ...base,
                                        color: "#cbd5e1",
                                    }),
                                    menuPortal: (base) => ({
                                        ...base,
                                        zIndex: 9999,
                                    }),
                                    control: (base, state) => ({
                                        ...base,
                                        ...(state.isFocused && {
                                            border: "0 0 0 1px #92BFF7",
                                            boxShadow: "none",
                                        }),
                                    }),
                                    menu: (provided, state) => ({
                                        ...provided,
                                        // width: "130%",
                                    }),
                                }}
                            />
                        </div>

                        <div className="col-span-9">
                            <div className={`grid-cols-5 grid  divide-x border-t border-b border-r border-l`}>
                                <div className="col-span-1">
                                    <SelectCore
                                        classNamePrefix="customDropdowDefault"
                                        placeholder={dataLang?.exportToOthe_location || "exportToOthe_location"}
                                        className="3xl:text-[12px] border-none outline-none 2xl:text-[10px] xl:text-[9.5px] text-[9px]"
                                        isDisabled={true}
                                    />
                                </div>
                                <div></div>
                                <div className="flex items-center justify-center col-span-1">
                                    <button className=" text-gray-400 hover:bg-[#e2f0fe] hover:text-gray-600 font-bold flex items-center justify-center 3xl:p-0 2xl:p-0 xl:p-0 p-0 bg-slate-200 rounded-full">
                                        <Minus className="scale-50 2xl:scale-100 xl:scale-100" size="16" />
                                    </button>
                                    <div className="mb-0.5 text-center 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] 3xl:px-1 2xl:px-0.5 xl:px-0.5 p-0 font-normal  focus:outline-none border-b w-full border-gray-200">
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
                    <Customscrollbar className="max-h-[400px] h-[400px]  overflow-auto pb-2">
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
                                                <div className="relative mt-5 mr-5">
                                                    <SelectCore
                                                        // onInputChange={_HandleSeachApi.bind(this)}
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
                                                                        <h5 className="text-gray-400 font-normal 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]">
                                                                            {option.e?.code}
                                                                        </h5>
                                                                        <h5 className="font-medium 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]">
                                                                            {option.e?.product_variation}
                                                                        </h5>
                                                                        <h5 className="text-gray-400 font-medium text-xs 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]">
                                                                            {dataLang[option.e?.text_type]}
                                                                        </h5>
                                                                        <div className="flex items-center gap-2 italic">
                                                                            {dataProductSerial.is_enable === "1" && (
                                                                                <div className="text-[11px] text-[#667085] font-[500]">
                                                                                    Serial:{" "}
                                                                                    {option.e?.serial ? option.e?.serial : "-"}
                                                                                </div>
                                                                            )}
                                                                            {dataMaterialExpiry.is_enable === "1" || dataProductExpiry.is_enable === "1" ? (
                                                                                <>
                                                                                    <div className="text-[11px] text-[#667085] font-[500]">
                                                                                        Lot:{" "}
                                                                                        {option.e?.lot ? option.e?.lot : "-"}
                                                                                    </div>
                                                                                    <div className="text-[11px] text-[#667085] font-[500]">
                                                                                        Date:{" "}
                                                                                        {option.e?.expiration_date ? formatMoment(option.e?.expiration_date, FORMAT_MOMENT.DATE_SLASH_LONG) : "-"}
                                                                                    </div>
                                                                                </>
                                                                            ) : (
                                                                                ""
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        classNamePrefix="customDropdow"
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
                                                            placeholder: (base) => ({
                                                                ...base,
                                                                color: "#cbd5e1",
                                                            }),
                                                            menuPortal: (base) => ({
                                                                ...base,
                                                                zIndex: 9999,
                                                            }),
                                                            control: (base, state) => ({
                                                                ...base,
                                                                ...(state.isFocused && {
                                                                    border: "0 0 0 1px #92BFF7",
                                                                    boxShadow: "none",
                                                                }),
                                                            }),
                                                            menu: (provided, state) => ({
                                                                ...provided,
                                                                // width: "130%",
                                                            }),
                                                        }}
                                                    />
                                                    <button
                                                        onClick={_HandleAddChild.bind(this, e?.id, e?.item)}
                                                        className="absolute flex flex-col items-center justify-center w-8 h-8 transition ease-in-out rounded bg-slate-100 -top-4 right-2 hover:rotate-45 hover:bg-slate-200 hover:scale-105 hover:text-red-500"
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
                                                <div
                                                    className={`grid-cols-5 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] border-b divide-x divide-y border-r grid `}
                                                >
                                                    {e?.child?.map((ce) => (
                                                        <React.Fragment key={ce?.id?.toString()}>
                                                            <div className="flex flex-col items-center justify-center h-full p-1 border-t border-l ">
                                                                <SelectCore
                                                                    options={ce?.dataWarehouse}
                                                                    value={ce?.location}
                                                                    isLoading={ce?.location != null ? false : onLoadingChild}
                                                                    onChange={_HandleChangeChild.bind(
                                                                        this,
                                                                        e?.id,
                                                                        ce?.id,
                                                                        "location"
                                                                    )}
                                                                    className={`${errWarehouse && ce?.location == null ? "border-red-500 border" : ""}  my-1 3xl:text-[12px] 2xl:text-[10px] cursor-pointer xl:text-[9.5px] text-[9px] placeholder:text-slate-300 w-full  rounded text-[#52575E] font-normal `}
                                                                    placeholder={onLoadingChild ? "" : dataLang?.exportToOthe_location || "exportToOthe_location"}
                                                                    noOptionsMessage={() => dataLang?.returns_nodata || "returns_nodata"}
                                                                    menuPortalTarget={document.body}
                                                                    formatOptionLabel={(option) => (
                                                                        <div className="cursor-pointer">
                                                                            <div className="flex gap-1">
                                                                                <h2 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] font-semibold">
                                                                                    {option?.label}
                                                                                </h2>
                                                                            </div>
                                                                            <div className="flex gap-1">
                                                                                {option?.qty && (
                                                                                    <h2 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] font-medium">
                                                                                        {dataLang?.returns_survive || "returns_survive"}
                                                                                        :
                                                                                    </h2>
                                                                                )}
                                                                                <h2 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] uppercase font-semibold">
                                                                                    {option?.qty &&
                                                                                        formatNumber(option?.qty)}
                                                                                </h2>
                                                                            </div>
                                                                        </div>
                                                                    )}
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
                                                                    placeholder={ce?.location == null && "Chọn vị trí trước"}
                                                                    disabled={ce?.location == null}
                                                                    className={`${errQty &&
                                                                        (ce?.toOtherQuantity == null ||
                                                                            ce?.toOtherQuantity == "" ||
                                                                            ce?.toOtherQuantity == 0)
                                                                        ? "border-red-500 border-b"
                                                                        : ""
                                                                        }
                                                                        ${ce?.toOtherQuantity == null ||
                                                                            ce?.toOtherQuantity == "" ||
                                                                            ce?.toOtherQuantity == 0
                                                                            ? "border-red-500 border-b"
                                                                            : ""
                                                                        }
                                                                        placeholder:3xl:text-[11px] placeholder:xxl:text-[9px] placeholder:2xl:text-[8.5px] placeholder:xl:text-[7px] placeholder:lg:text-[6.3px] placeholder:text-[10px] appearance-none text-center  3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] 3xl:px-1 2xl:px-0.5 xl:px-0.5 p-1 font-normal w-full focus:outline-none border-b border-gray-200 disabled:bg-transparent`}
                                                                    onValueChange={_HandleChangeChild.bind(
                                                                        this,
                                                                        e?.id,
                                                                        ce?.id,
                                                                        "toOtherQuantity"
                                                                    )}
                                                                    value={ce?.toOtherQuantity}
                                                                    isAllowed={(values) => {
                                                                        const { floatValue } = values;

                                                                        if (+floatValue > +ce?.location?.qty) {
                                                                            handleQuantityError(+ce?.location?.qty);
                                                                            return false;
                                                                        }
                                                                        if (floatValue == 0) {
                                                                            return true;
                                                                        } else {
                                                                            return true;
                                                                        }
                                                                    }}
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
                                                                    className="placeholder:text-slate-300 w-full bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-2 outline-none"
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
                                <h3>{dataLang?.exportToOthe_totalQuantity || "exportToOthe_totalQuantity"}</h3>
                            </div>
                            <div className="font-normal">
                                <h3 className="text-blue-600">
                                    {formatNumber(listData?.reduce((total, item) => {
                                        item?.child?.forEach((childItem) => {
                                            if (
                                                childItem.toOtherQuantity !== undefined &&
                                                childItem.toOtherQuantity !== null
                                            ) {
                                                total += childItem.toOtherQuantity;
                                            }
                                        });
                                        return total;
                                    }, 0)
                                    )}
                                </h3>
                            </div>
                        </div>
                        <div className="space-x-2">
                            <ButtonBack onClick={() => router.push(routerExportToOther.home)} dataLang={dataLang} />
                            <ButtonSubmit loading={onSending} onClick={(e) => _HandleSubmit(e)} dataLang={dataLang} />
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

export default ExportToOtherForm;
