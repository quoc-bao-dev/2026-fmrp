import apiComons from "@/Api/apiComon/apiComon";
import apiProductionWarehouse from "@/Api/apiManufacture/warehouse/productionWarehouse/apiProductionWarehouse";
import ButtonBack from "@/components/UI/button/buttonBack";
import ButtonSubmit from "@/components/UI/button/buttonSubmit";
import { EmptyExprired } from "@/components/UI/common/EmptyExprired";
import { Container } from "@/components/UI/common/layout";
import InPutNumericFormat from "@/components/UI/inputNumericFormat/inputNumericFormat";
import Loading from "@/components/UI/loading/loading";
import PopupConfim from "@/components/UI/popupConfim/popupConfim";
import { CONFIRMATION_OF_CHANGES, TITLE_DELETE_ITEMS } from "@/constants/delete/deleteItems";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import useFeature from "@/hooks/useConfigFeature";
import useSetingServer from "@/hooks/useConfigNumber";
import useStatusExprired from "@/hooks/useStatusExprired";
import useToast from "@/hooks/useToast";
import { useToggle } from "@/hooks/useToggle";
import { routerProductionWarehouse } from "@/routers/manufacture";
import { isAllowedNumber } from "@/utils/helpers/common";
import { formatMoment } from "@/utils/helpers/formatMoment";
import formatNumberConfig from "@/utils/helpers/formatnumber";
import { SelectCore } from "@/utils/lib/Select";
import { Add, Trash as IconDelete, Minus } from "iconsax-react";
import { debounce } from "lodash";
import moment from "moment/moment";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { BsCalendarEvent } from "react-icons/bs";
import { MdClear } from "react-icons/md";
import { v4 as uuidv4 } from "uuid";

const Index = (props) => {
    const router = useRouter();

    const isShow = useToast();

    const dataSeting = useSetingServer();

    const id = router.query?.id;

    const dataLang = props?.dataLang;

    const { isOpen, isKeyState, handleQueryId } = useToggle();

    const [onFetching, sOnFetching] = useState(false);

    const [onFetchingDetail, sOnFetchingDetail] = useState(false);

    const [onFetchingItemsAll, sOnFetchingItemsAll] = useState(false);

    const [onFetchingExportWarehouse, sOnFetchingExportWarehouse] = useState(false);

    const [onLoading, sOnLoading] = useState(false);

    const [onLoadingChild, sOnLoadingChild] = useState(false);

    const [onSending, sOnSending] = useState(false);

    const [code, sCode] = useState("");

    const [startDate, sStartDate] = useState(new Date());

    const [effectiveDate, sEffectiveDate] = useState(null);

    const [note, sNote] = useState("");

    const [date, sDate] = useState(moment().format(FORMAT_MOMENT.DATE_TIME_LONG));

    const [dataBranch, sDataBranch] = useState([]);

    const [dataItems, sDataItems] = useState([]);

    const [dataWarehouse, sDataWarehouse] = useState([]);

    const statusExprired = useStatusExprired();

    const { dataMaterialExpiry, dataProductExpiry, dataProductSerial } = useFeature();

    //new
    const [listData, sListData] = useState([]);

    const [idBranch, sIdBranch] = useState(null);

    const [idExportWarehouse, sIdExportWarehouse] = useState(null);

    const [load, sLoad] = useState(false);

    const [errDate, sErrDate] = useState(false);

    const [errBranch, sErrBranch] = useState(false);

    const [errWarehouse, sErrWarehouse] = useState(false);

    const [errExportWarehouse, sErrExportWarehouse] = useState(false);

    const [errUnit, sErrUnit] = useState(false);

    const [errQty, sErrQty] = useState(false);

    useEffect(() => {
        router.query && sErrDate(false);
        router.query && sErrBranch(false);
        router.query && sStartDate(new Date());
        router.query && sNote("");
    }, [router.query]);

    const _ServerFetching = async () => {
        sOnLoading(true);
        try {
            const { result } = await apiComons.apiBranchCombobox();
            sDataBranch(result?.map((e) => ({ label: e.name, value: e.id })));
            sOnLoading(false);
            sOnFetching(false);
        } catch (error) { }
    };

    useEffect(() => {
        onFetching && _ServerFetching();
    }, [onFetching]);

    const options = dataItems?.map((e) => ({
        label: `${e.name}
                <span style={{display: none}}>${e.code}</span>
                <span style={{display: none}}>${e.product_variation} </span>
                <span style={{display: none}}>${e.serial} </span>
                <span style={{display: none}}>${e.lot} </span>
                <span style={{display: none}}>${e.expiration_date} </span>
                <span style={{display: none}}>${e.text_type} ${e.unit_name} </span>`,
        value: e.id,
        e,
    }));

    const _ServerFetchingDetailPage = async () => {
        try {
            const rResult = await apiProductionWarehouse.apiDetailPageProductionWarehouse(id);
            sIdBranch({
                label: rResult?.branch_name,
                value: rResult?.branch_id,
            });
            sIdExportWarehouse({
                label: rResult?.warehouse_name,
                value: rResult?.warehouse_id,
            });
            sCode(rResult?.code);
            sStartDate(moment(rResult?.date).toDate());
            sNote(rResult?.note);
            sListData(
                rResult?.items.map((e) => ({
                    id: e?.item?.id,
                    idParenBackend: e?.item?.id,
                    matHang: {
                        e: e?.item,
                        label: `${e.item?.name} <span style={{display: none}}>${e.item?.code + e.item?.product_variation + e.item?.text_type + e.item?.unit_name
                            }</span>`,
                        value: e.item?.id,
                    },
                    child: e?.child.map((ce) => ({
                        idChildBackEnd: Number(ce?.id),
                        id: Number(ce?.id),
                        disabledDate:
                            (ce?.text_type == "material" && dataMaterialExpiry?.is_enable == "1" && false) ||
                            (ce?.text_type == "material" && dataMaterialExpiry?.is_enable == "0" && true) ||
                            (ce?.text_type == "products" && dataProductExpiry?.is_enable == "1" && false) ||
                            (ce?.text_type == "products" && dataProductExpiry?.is_enable == "0" && true),
                        location:
                            ce?.warehouse_location?.location_name ||
                                ce?.warehouse_location?.id ||
                                ce?.warehouse_location?.warehouse_name ||
                                ce?.warehouse_location?.quantity
                                ? {
                                    label: ce?.warehouse_location?.location_name || null,
                                    value: ce?.warehouse_location?.id || null,
                                    warehouse_name: ce?.warehouse_location?.warehouse_name || null,
                                    qty: +ce?.warehouse_location?.quantity || null,
                                }
                                : null,
                        serial: ce?.serial == null ? "" : ce?.serial,
                        lot: ce?.lot == null ? "" : ce?.lot,
                        date: ce?.expiration_date != null ? moment(ce?.expiration_date).toDate() : null,
                        unit: {
                            label: ce?.unit_data.unit,
                            value: ce?.unit_data.id,
                            coefficient: +ce?.unit_data.coefficient,
                        },
                        dataWarehouse: e?.item?.warehouse.map((ye) => ({
                            label: ye?.location_name,
                            value: ye?.id,
                            warehouse_name: ye?.warehouse_name,
                            qty: +ye?.quantity,
                        })),
                        dataUnit: e?.item?.unit?.map((e) => ({
                            label: e?.unit,
                            value: e?.id,
                            coefficient: +e?.coefficient,
                        })),
                        exportQuantity: +ce?.quantity,
                        exchangeValue: +ce?.coefficient,
                        numberOfConversions: +ce?.quantity_exchange,
                        note: ce?.note,
                    })),
                }))
            );
        } catch (error) { }
        sOnFetchingDetail(false);
    };

    useEffect(() => {
        //new
        onFetchingDetail && _ServerFetchingDetailPage();
    }, [onFetchingDetail]);

    useEffect(() => {
        id &&
            JSON.stringify(dataMaterialExpiry) !== "{}" &&
            JSON.stringify(dataProductExpiry) !== "{}" &&
            JSON.stringify(dataProductSerial) !== "{}" &&
            sOnFetchingDetail(true);
    }, [
        JSON.stringify(dataMaterialExpiry) !== "{}" &&
        JSON.stringify(dataProductExpiry) !== "{}" &&
        JSON.stringify(dataProductSerial) !== "{}",
    ]);

    const _ServerFetching_ItemsAll = async () => {
        const params = {
            "filter[branch_id]": idBranch ? idBranch?.value : null,
            "filter[warehouse_id]": idExportWarehouse ? idExportWarehouse?.value : null,
        };

        try {
            const { data } = await apiProductionWarehouse.apiSemiItemsProductionWarehouse("GET", { params: params });

            sDataItems(data?.result);

            sOnFetchingItemsAll(false);
        } catch (error) { }
    };

    const _ServerFetching_ExportWarehouse = async () => {
        try {
            const data = await apiProductionWarehouse.apiComboboxWarehouse({
                params: {
                    "filter[branch_id]": idBranch ? idBranch?.value : null,
                    "filter[warehouse_id]": idExportWarehouse ? idExportWarehouse?.value : null,
                },
            });
            sDataWarehouse(
                data?.map((e) => ({
                    label: e?.warehouse_name,
                    value: e?.id,
                }))
            );
        } catch (error) { }
        sOnFetchingExportWarehouse(false);
    };

    // Khai báo biến để theo dõi timeout

    const _HandleSeachApi = debounce(async (inputValue) => {
        if (idBranch == null || idExportWarehouse == null || inputValue == "") {
            return;
        } else {
            try {
                const { data } = await apiProductionWarehouse.apiSemiItemsProductionWarehouse("POST", {
                    params: {
                        "filter[branch_id]": idBranch ? idBranch?.value : null,
                    },
                    data: {
                        term: inputValue,
                    },
                });
                sDataItems(data?.result);
            } catch (error) { }
        }
    }, 500);

    const resetValue = () => {
        if (isKeyState?.type === "branch") {
            sDataItems([]);
            sListData([]);
            sIdExportWarehouse(null);
            sIdBranch(isKeyState?.value);
        }
        if (isKeyState?.type === "idExportWarehouse") {
            sDataItems([]);
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
                if (type === "branch" && idBranch != value) {
                    handleQueryId({ status: true, initialKey: { type, value } });
                }
            } else {
                sDataItems([]);
                sIdExportWarehouse(null);
                sIdBranch(value);
            }
        } else if (type == "idExportWarehouse" && idExportWarehouse != value) {
            if (listData?.length > 0) {
                if (type === "idExportWarehouse" && idBranch != value) {
                    handleQueryId({ status: true, initialKey: { type, value } });
                }
            } else {
                sIdExportWarehouse(value);
            }
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
        const hasNullKho = listData.some((item) => item.child?.some((childItem) => childItem.location === null));

        const hasNullUnit = listData.some((item) => item.child?.some((childItem) => childItem.unit === null));

        const hasNullQty = listData.some((item) =>
            item.child?.some(
                (childItem) =>
                    childItem.exportQuantity === null ||
                    childItem.exportQuantity === "" ||
                    childItem.exportQuantity == 0
            )
        );

        const isEmpty = listData?.length === 0 ? true : false;

        if (idBranch == null || hasNullKho || hasNullUnit || hasNullQty || isEmpty || idExportWarehouse == null) {
            idBranch == null && sErrBranch(true);
            idExportWarehouse == null && sErrExportWarehouse(true);
            hasNullKho && sErrWarehouse(true);
            hasNullUnit && sErrUnit(true);
            hasNullQty && sErrQty(true);
            if (isEmpty) {
                handleCheckError("Chưa nhập thông tin mặt hàng");
            } else {
                handleCheckError(dataLang?.required_field_null);
            }
        } else {
            sErrWarehouse(false);
            sErrUnit(false);
            sErrQty(false);
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
        sErrExportWarehouse(false);
    }, [idExportWarehouse != null]);

    useEffect(() => {
        router.query && sOnFetching(true);
    }, [router.query]);

    useEffect(() => {
        onFetchingExportWarehouse && _ServerFetching_ExportWarehouse();
        onFetchingItemsAll && _ServerFetching_ItemsAll();
    }, [onFetchingItemsAll, onFetchingExportWarehouse]);

    useEffect(() => {
        idBranch != null && sOnFetchingExportWarehouse(true);
        idBranch == null && sIdExportWarehouse(null);
        idBranch == null && sDataWarehouse([]);
        // sIdExportWarehouse(null);
    }, [idBranch]);

    useEffect(() => {
        idExportWarehouse != null && sOnFetchingItemsAll(true);
        idExportWarehouse == null && sDataItems([]);
    }, [idExportWarehouse]);

    const formatNumber = (number) => {
        return formatNumberConfig(+number, dataSeting);
    };

    const _ServerSending = async () => {
        var formData = new FormData();
        formData.append("code", code);
        formData.append("date", formatMoment(startDate, FORMAT_MOMENT.DATE_TIME_LONG));
        formData.append("branch_id", idBranch?.value);
        formData.append("warehouse_id", idExportWarehouse?.value);
        formData.append("note", note);
        listData.forEach((item, index) => {
            formData.append(`items[${index}][id]`, id ? item?.idParenBackend : "");
            formData.append(`items[${index}][item]`, item?.matHang?.value);
            item?.child?.forEach((childItem, childIndex) => {
                formData.append(`items[${index}][child][${childIndex}][row_id]`, id ? childItem?.idChildBackEnd : "");
                formData.append(`items[${index}][child][${childIndex}][unit]`, childItem?.unit?.value);
                formData.append(`items[${index}][child][${childIndex}][note]`, childItem?.note ? childItem?.note : "");
                formData.append(
                    `items[${index}][child][${childIndex}][location_warehouses_id]`,
                    childItem?.location?.value || 0
                );
                formData.append(`items[${index}][child][${childIndex}][quantity]`, childItem?.exportQuantity);
            });
        });
        try {
            const { isSuccess, message, item } = await apiProductionWarehouse.apiHangdingProductionWarehouse(
                id ? id : undefined,
                formData
            );
            if (isSuccess) {
                isShow("success", `${dataLang[message]}` || message);
                sCode("");
                sStartDate(new Date());
                sIdBranch(null);
                sIdExportWarehouse(null);
                sNote("");
                sErrBranch(false);
                sErrExportWarehouse(false);
                sErrDate(false);
                //new
                sListData([]);
                router.push(routerProductionWarehouse.home);
            } else {
                handleCheckError(
                    `${dataLang[message]} ${item !== undefined && item !== null && item !== "" ? item : ""}`
                );
            }
        } catch (error) { }
        sOnSending(false);
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
                        (value?.e?.text_type === "material" && dataMaterialExpiry?.is_enable === "0" && true) ||
                        (value?.e?.text_type === "products" && dataProductExpiry?.is_enable === "1" && false) ||
                        (value?.e?.text_type === "products" && dataProductExpiry?.is_enable === "0" && true),
                    location: null,
                    unit: null,
                    dataWarehouse: value?.e?.warehouse.map((e) => ({
                        label: e?.location_name,
                        value: e?.id,
                        warehouse_name: e?.warehouse_name,
                        qty: e?.quantity,
                    })),
                    dataUnit: value?.e?.unit.map((e) => ({
                        label: e?.unit,
                        value: e?.id,
                        coefficient: e?.coefficient,
                    })),
                    exportQuantity: null,
                    exchangeValue: null,
                    numberOfConversions: null,
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

    const _HandleAddParent = (value) => {
        sOnLoadingChild(true);

        const checkData = listData?.some((e) => e?.matHang?.value === value?.value);

        if (!checkData) {
            const newData = {
                id: Date.now(),
                idParenBackend: null,
                matHang: value,
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
                        dataWarehouse: value?.e?.warehouse.map((e) => ({
                            label: e?.location_name,
                            value: e?.id,
                            warehouse_name: e?.warehouse_name,
                            qty: e?.quantity,
                        })),
                        unit: {
                            label: value?.e?.unit[0].unit,
                            value: value?.e?.unit[0].id,
                            coefficient: value?.e?.unit[0].coefficient,
                        },
                        dataUnit: value?.e?.unit.map((e) => ({
                            label: e?.unit,
                            value: e?.id,
                            coefficient: e?.coefficient,
                        })),
                        exportQuantity: null,
                        exchangeValue: value?.e?.unit[0].coefficient,
                        numberOfConversions: null,
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
    };

    const _HandleDeleteChild = (parentId, childId) => {
        const newData = listData
            .map((e) => {
                if (e.id === parentId) {
                    const newChild = e.child?.filter((ce) => ce?.id !== childId);
                    return { ...e, child: newChild };
                }
                return e;
            })
            .filter((e) => e.child?.length > 0);
        sListData([...newData]);
    };

    const _HandleDeleteAllChild = (parentId) => {
        const newData = listData
            .map((e) => {
                if (e.id === parentId) {
                    const newChild = e.child?.filter((ce) => ce?.location !== null);
                    return { ...e, child: newChild };
                }
                return e;
            })
            .filter((e) => e.child?.length > 0);
        sListData([...newData]);
    };

    const _HandleChangeChild = (parentId, childId, type, value) => {
        // Tạo một bản sao của listData để thay đổi
        const newData = [...listData];

        // Tìm vị trí của phần tử cần cập nhật trong mảng newData
        const parentIndex = newData.findIndex((e) => e.id === parentId);
        if (parentIndex !== -1) {
            const childIndex = newData[parentIndex].child.findIndex((ce) => ce.id === childId);
            if (childIndex !== -1) {
                // Thực hiện cập nhật dữ liệu tại vị trí tìm thấy
                const updatedChild = {
                    ...newData[parentIndex].child[childIndex],
                };
                if (type === "exportQuantity") {
                    const newSoluongxuat = Number(value?.value);
                    const newSoluongquydoi = newSoluongxuat / Number(updatedChild?.exchangeValue);
                    if (newSoluongquydoi > +updatedChild?.location?.qty) {
                        handleQuantityError(updatedChild?.location?.qty);
                        setTimeout(() => {
                            sLoad(true);
                        }, 500);
                        setTimeout(() => {
                            sLoad(false);
                        }, 1000);
                        updatedChild.exportQuantity = null;
                        updatedChild.numberOfConversions = null;
                    } else {
                        sLoad(false);
                        updatedChild.exportQuantity = newSoluongxuat;
                        updatedChild.numberOfConversions = newSoluongquydoi;
                    }
                } else if (type === "location") {
                    const checkKho = newData[parentIndex].child
                        .map((house) => house)
                        .some((i) => i?.location?.value === value?.value);
                    if (checkKho) {
                        handleCheckError("Vị trí xuất đã được chọn");
                    } else {
                        updatedChild.location = value;
                    }
                } else if (type === "unit") {
                    updatedChild.unit = value;
                    updatedChild.exchangeValue = Number(value?.coefficient);
                } else if (type === "increase") {
                    if (updatedChild.location == null) {
                        handleCheckError("Vui lòng chọn vị trí trước");
                    } else if (updatedChild.unit == null) {
                        handleCheckError("Vui lòng chọn đơn vị tính trước");
                    } else if (
                        updatedChild.numberOfConversions == updatedChild.location?.qty ||
                        (id && updatedChild.numberOfConversions >= updatedChild.location?.qty)
                    ) {
                        handleQuantityError(updatedChild?.location?.qty);
                    } else {
                        updatedChild.exportQuantity = Number(updatedChild.exportQuantity) + 1;
                        updatedChild.numberOfConversions =
                            Number(updatedChild.exportQuantity) * Number(updatedChild.exchangeValue);
                    }
                } else if (type === "decrease") {
                    if (updatedChild.location == null) {
                        handleCheckError("Vui lòng chọn vị trí trước");
                    } else if (updatedChild.unit == null) {
                        handleCheckError("Vui lòng chọn đơn vị tính trước");
                    } else if (updatedChild.exportQuantity >= 2) {
                        updatedChild.exportQuantity = Number(updatedChild.exportQuantity) - 1;
                        updatedChild.numberOfConversions =
                            Number(updatedChild.exportQuantity) * Number(updatedChild.exchangeValue);
                    }
                } else if (type === "note") {
                    updatedChild.note = value?.target.value;
                }
                newData[parentIndex].child[childIndex] = updatedChild;
            }
        }
        sListData(newData);
    };

    const handleQuantityError = (e) => {
        isShow("error", `Số lượng chỉ được bé hơn hoặc bằng ${formatNumber(e)} số lượng tồn`);
        setTimeout(() => {
            sLoad(true);
        }, 500);
        setTimeout(() => {
            sLoad(false);
        }, 1000);
    };

    const _HandleChangeValue = (parentId, value) => {
        sOnLoadingChild(true);
        const checkData = listData?.some((e) => e?.matHang?.value === value?.value);
        if (!checkData) {
            const newData = listData?.map((e) => {
                if (e?.id === parentId) {
                    return {
                        ...e,
                        matHang: value,
                        child: [
                            {
                                idChildBackEnd: null,
                                id: uuidv4(),
                                location: null,
                                dataWarehouse: value?.e?.warehouse.map((e) => ({
                                    label: e?.location_name,
                                    value: e?.id,
                                    warehouse_name: e?.warehouse_name,
                                    qty: e?.quantity,
                                })),
                                disabledDate:
                                    (value?.e?.text_type === "material" &&
                                        dataMaterialExpiry?.is_enable === "1" &&
                                        false) ||
                                    (value?.e?.text_type === "material" &&
                                        dataMaterialExpiry?.is_enable === "0" &&
                                        true) ||
                                    (value?.e?.text_type === "products" &&
                                        dataProductExpiry?.is_enable === "1" &&
                                        false) ||
                                    (value?.e?.text_type === "products" &&
                                        dataProductExpiry?.is_enable === "0" &&
                                        true),
                                unit: {
                                    label: value?.e?.unit[0].unit,
                                    value: value?.e?.unit[0].id,
                                    coefficient: value?.e?.unit[0].coefficient,
                                },

                                dataUnit: value?.e?.unit.map((e) => ({
                                    label: e?.unit,
                                    value: e?.id,
                                    coefficient: e?.coefficient,
                                })),
                                exportQuantity: null,
                                exchangeValue: value?.e?.unit[0].coefficient,
                                numberOfConversions: null,
                                note: "",
                            },
                        ],
                    };
                } else {
                    return e;
                }
            });
            setTimeout(() => {
                sOnLoadingChild(false);
            }, 500);
            sListData([...newData]);
        } else {
            handleCheckError(dataLang?.returns_err_ItemSelect || "returns_err_ItemSelect");
        }
    };

    const handleCheckError = (e) => isShow("error", `${e}`);

    return (
        <React.Fragment>
            <Head>
                <title>{id ? dataLang?.production_warehouse_edit : dataLang?.production_warehouse_add}</title>
            </Head>
            <Container className={"!h-auto"}>
                {statusExprired ? (
                    <EmptyExprired />
                ) : (
                    <div className="flex space-x-1 mt-4 3xl:text-sm 2xl:text-[11px] xl:text-[10px] lg:text-[10px]">
                        <h6 className="text-[#141522]/40">
                            {dataLang?.production_warehouse || "production_warehouse"}
                        </h6>
                        <span className="text-[#141522]/40">/</span>
                        <h6>
                            {" "}
                            {id
                                ? dataLang?.production_warehouse_edit || "production_warehouse_edit"
                                : dataLang?.production_warehouse_add || "production_warehouse_add"}
                        </h6>
                    </div>
                )}
                <div className="h-[97%] space-y-3 overflow-hidden">
                    <div className="flex justify-between items-center">
                        <h2 className=" 2xl:text-lg text-base text-[#52575E] capitalize">
                            {id
                                ? dataLang?.production_warehouse_edit || "production_warehouse_edit"
                                : dataLang?.production_warehouse_add || "production_warehouse_add"}
                        </h2>
                        <div className="flex justify-end items-center mr-2">
                            <ButtonBack
                                onClick={() => router.push(routerProductionWarehouse.home)}
                                dataLang={dataLang}
                            />
                        </div>
                    </div>

                    <div className=" w-full rounded">
                        <div className="">
                            <h2 className="font-normal bg-[#ECF0F4] p-2">
                                {dataLang?.purchase_order_detail_general_informatione ||
                                    "purchase_order_detail_general_informatione"}
                            </h2>
                            <div className="grid grid-cols-10  gap-3 items-center mt-2">
                                <div className="col-span-2">
                                    <label className="text-[#344054] font-normal text-sm mb-1 ">
                                        {dataLang?.import_code_vouchers || "import_code_vouchers"}{" "}
                                    </label>
                                    <input
                                        value={code}
                                        onChange={_HandleChangeInput.bind(this, "code")}
                                        name="fname"
                                        type="text"
                                        placeholder={
                                            dataLang?.purchase_order_system_default || "purchase_order_system_default"
                                        }
                                        className={`focus:border-[#92BFF7] border-[#d0d5dd]  placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal   p-2 border outline-none`}
                                    />
                                </div>
                                <div className="col-span-2 relative">
                                    <label className="text-[#344054] font-normal text-sm mb-1 ">
                                        {dataLang?.import_day_vouchers || "import_day_vouchers"}
                                    </label>
                                    <div className="custom-date-picker flex flex-row">
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
                                            placeholder={
                                                dataLang?.price_quote_system_default || "price_quote_system_default"
                                            }
                                            className={`border ${errDate ? "border-red-500" : "focus:border-[#92BFF7] border-[#d0d5dd]"
                                                } placeholder:text-slate-300 w-full z-[999] bg-[#ffffff] rounded text-[#52575E] font-normal p-2 outline-none cursor-pointer `}
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
                                        isLoading={idBranch != null ? false : onLoading}
                                        isClearable={true}
                                        closeMenuOnSelect={true}
                                        hideSelectedOptions={false}
                                        placeholder={dataLang?.import_branch || "import_branch"}
                                        noOptionsMessage={() => dataLang?.returns_nodata || "returns_nodata"}
                                        className={`${errBranch ? "border-red-500" : "border-transparent"
                                            } placeholder:text-slate-300 w-full z-20 bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border `}
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
                                        {dataLang?.production_warehouse_expWarehouse ||
                                            "production_warehouse_expWarehouse"}{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <SelectCore
                                        options={dataWarehouse}
                                        onChange={_HandleChangeInput.bind(this, "idExportWarehouse")}
                                        isLoading={idBranch != null ? false : onLoading}
                                        value={idExportWarehouse}
                                        isClearable={true}
                                        noOptionsMessage={() => dataLang?.returns_nodata || "returns_nodata"}
                                        closeMenuOnSelect={true}
                                        hideSelectedOptions={false}
                                        placeholder={
                                            dataLang?.production_warehouse_expWarehouse ||
                                            "production_warehouse_expWarehouse"
                                        }
                                        className={`${errExportWarehouse ? "border-red-500" : "border-transparent"
                                            } placeholder:text-slate-300 w-full z-20 bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border `}
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
                                        <label className="text-sm text-red-500">{"Vui lòng chọn kho"}</label>
                                    )}
                                </div>
                                <div className="col-span-2 ">
                                    <label className="text-[#344054] font-normal text-sm mb-1 ">
                                        {dataLang?.production_warehouse_LSX || "production_warehouse_LSX"}
                                    </label>
                                    <SelectCore
                                        options={[]}
                                        onChange={_HandleChangeInput.bind(this, "")}
                                        isLoading={idBranch != null ? false : onLoading}
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
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className=" bg-[#ECF0F4] p-2 grid  grid-cols-12">
                        <div className="font-normal col-span-12">
                            {dataLang?.import_item_information || "import_item_information"}
                        </div>
                    </div>
                    <div className="grid grid-cols-12 items-center  sticky top-0  bg-[#F7F8F9] py-2 z-10">
                        <h4 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] px-2  text-[#667085] uppercase  col-span-3 text-center truncate font-[400]">
                            {dataLang?.import_from_items || "import_from_items"}
                        </h4>
                        <div className="col-span-9">
                            <div className="grid grid-cols-8">
                                <h4 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] px-2  text-[#667085] uppercase  col-span-2   text-center  truncate font-[400]">
                                    {dataLang?.production_warehouse_expLoca || "production_warehouse_expLoca"}
                                </h4>
                                <h4 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] px-2  text-[#667085] uppercase  col-span-1    text-center  truncate font-[400]">
                                    {"ĐVT"}
                                </h4>
                                <h4 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] px-2  text-[#667085] uppercase  col-span-1    text-center  truncate font-[400]">
                                    {dataLang?.production_warehouse_export_quantity ||
                                        "production_warehouse_export_quantity"}
                                </h4>
                                <h4 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] px-2  text-[#667085] uppercase  col-span-1    text-center  truncate font-[400]">
                                    {dataLang?.production_warehouse_exchange_value ||
                                        "production_warehouse_exchange_value"}
                                </h4>
                                <h4 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] px-2  text-[#667085] uppercase  col-span-1    text-center  truncate font-[400]">
                                    {dataLang?.production_warehouse_amount_of_conversion ||
                                        "production_warehouse_amount_of_conversion"}
                                </h4>
                                <h4 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] px-2  text-[#667085] uppercase  col-span-1    text-center  truncate font-[400]">
                                    {dataLang?.production_warehouse_note || "production_warehouse_note"}
                                </h4>
                                <h4 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] px-2  text-[#667085] uppercase  col-span-1    text-center    truncate font-[400]">
                                    {dataLang?.import_from_operation || "import_from_operation"}
                                </h4>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-12 items-center gap-1 py-2">
                        <div className="col-span-3">
                            <SelectCore
                                onInputChange={(event) => {
                                    _HandleSeachApi(event);
                                }}
                                options={options}
                                value={null}
                                onChange={_HandleAddParent.bind(this)}
                                className="col-span-2 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]"
                                placeholder={dataLang?.returns_items || "returns_items"}
                                noOptionsMessage={() => dataLang?.returns_nodata || "returns_nodata"}
                                menuPortalTarget={document.body}
                                formatOptionLabel={(option) => (
                                    <div className="flex items-center  justify-between py-2">
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
                                                    <h5 className="font-medium 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]">
                                                        {option.e?.product_variation}
                                                    </h5>
                                                </div>
                                                <h5 className="text-gray-400 font-medium text-xs 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]">
                                                    {dataLang[option.e?.text_type]}
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
                                        // zIndex: 9999,
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
                                        width: "100%",
                                    }),
                                }}
                            />
                        </div>
                        <div className="col-span-9">
                            <div className="grid grid-cols-8 divide-x border-t border-b border-r border-l">
                                <div className="col-span-2">
                                    {" "}
                                    <SelectCore
                                        classNamePrefix="customDropdowDefault"
                                        placeholder={
                                            dataLang?.production_warehouse_expLoca || "production_warehouse_expLoca"
                                        }
                                        className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]"
                                        isDisabled={true}
                                    />
                                </div>
                                <div className="col-span-1">
                                    <SelectCore
                                        classNamePrefix="customDropdowDefault"
                                        placeholder={dataLang?.production_warehouse_unit || "production_warehouse_unit"}
                                        className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]"
                                        isDisabled={true}
                                    />
                                </div>
                                <div className="col-span-1 flex items-center justify-center">
                                    <button className=" text-gray-400 hover:bg-[#e2f0fe] hover:text-gray-600 font-bold flex items-center justify-center 3xl:p-0 2xl:p-0 xl:p-0 p-0 bg-slate-200 rounded-full">
                                        <Minus className="2xl:scale-100 xl:scale-100 scale-50" size="16" />
                                    </button>
                                    <div className=" text-center 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]  3xl:px-1 2xl:px-0.5 xl:px-0.5 p-0 font-normal  focus:outline-none border-b w-full border-gray-200">
                                        1
                                    </div>
                                    <button className=" text-gray-400 hover:bg-[#e2f0fe] hover:text-gray-600 font-bold flex items-center justify-center 3xl:p-0 2xl:p-0 xl:p-0 p-0 bg-slate-200 rounded-full">
                                        <Add className="2xl:scale-100 xl:scale-100 scale-50" size="16" />
                                    </button>
                                </div>

                                <div className="col-span-1 text-center 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] font-medium pr-3 text-black flex items-center justify-center">
                                    0
                                </div>
                                <div className="col-span-1 text-center 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] font-medium pr-3 text-black  flex items-center justify-center">
                                    1
                                </div>
                                <input
                                    placeholder={dataLang?.returns_note || "returns_note"}
                                    disabled
                                    className=" disabled:bg-gray-50 col-span-1 placeholder:text-slate-300 w-full bg-[#ffffff] 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]  p-1.5 "
                                />
                                <button
                                    title={dataLang?.returns_delete || "returns_delete"}
                                    disabled
                                    className="col-span-1 disabled:opacity-50 transition w-full h-full bg-slate-100  rounded-[5.5px] text-red-500 flex flex-col justify-center items-center"
                                >
                                    <IconDelete />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="h-[400px] overflow-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                        <div className="min:h-[400px] h-[100%] max:h-[800px] w-full">
                            {onFetchingDetail ? (
                                <Loading className="h-10 w-full" color="#0f4f9e" />
                            ) : (
                                <>
                                    {listData?.map((e) => (
                                        <div
                                            key={e?.id?.toString()}
                                            className="grid grid-cols-12 gap-1 items-start my-1"
                                        >
                                            <div className="col-span-3 border border-r p-2 pb-1 h-full">
                                                <div className="relative mt-5">
                                                    <SelectCore
                                                        options={options}
                                                        value={e?.matHang}
                                                        className=""
                                                        onInputChange={(event) => {
                                                            _HandleSeachApi(event);
                                                        }}
                                                        onChange={_HandleChangeValue.bind(this, e?.id)}
                                                        menuPortalTarget={document.body}
                                                        formatOptionLabel={(option) => (
                                                            <div className="flex items-center  justify-between py-2">
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
                                                                            <h5 className="font-medium 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]">
                                                                                {option.e?.product_variation}
                                                                            </h5>
                                                                        </div>
                                                                        <h5 className="text-gray-400 font-medium text-xs 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]">
                                                                            {dataLang[option.e?.text_type]}
                                                                        </h5>
                                                                        <div className="flex items-center gap-2 italic">
                                                                            {dataProductSerial.is_enable === "1" && (
                                                                                <div className="text-[11px] text-[#667085] font-[500]">
                                                                                    Serial:{" "}
                                                                                    {option.e?.serial
                                                                                        ? option.e?.serial
                                                                                        : "-"}
                                                                                </div>
                                                                            )}
                                                                            {dataMaterialExpiry.is_enable === "1" ||
                                                                                dataProductExpiry.is_enable === "1" ? (
                                                                                <>
                                                                                    <div className="text-[11px] text-[#667085] font-[500]">
                                                                                        Lot:{" "}
                                                                                        {option.e?.lot
                                                                                            ? option.e?.lot
                                                                                            : "-"}
                                                                                    </div>
                                                                                    <div className="text-[11px] text-[#667085] font-[500]">
                                                                                        Date:{" "}
                                                                                        {option.e?.expiration_date
                                                                                            ? formatMoment(option.e?.expiration_date, FORMAT_MOMENT.DATE_SLASH_LONG) : "-"}
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
                                                        noOptionsMessage={() =>
                                                            dataLang?.returns_nodata || "returns_nodata"
                                                        }
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
                                                                // zIndex: 9999,
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
                                                                width: "100%",
                                                            }),
                                                        }}
                                                    />
                                                    <button
                                                        onClick={_HandleAddChild.bind(this, e?.id, e?.matHang)}
                                                        className="w-10 h-10 rounded bg-slate-100 flex flex-col justify-center items-center absolute -top-5 right-5 hover:rotate-45 hover:bg-slate-200 transition hover:scale-105 hover:text-red-500 ease-in-out"
                                                    >
                                                        <Add className="" />
                                                    </button>
                                                </div>
                                                {e?.child?.filter((e) => e?.location == null)?.length >= 2 && (
                                                    <button
                                                        onClick={_HandleDeleteAllChild.bind(this, e?.id, e?.matHang)}
                                                        className="w-full rounded mt-1.5 px-5 py-1 overflow-hidden group bg-rose-500 relative hover:bg-gradient-to-r hover:from-rose-500 hover:to-rose-400 text-white hover:ring-2 hover:ring-offset-2 hover:ring-rose-400 transition-all ease-out duration-300"
                                                    >
                                                        <span className="absolute right-0 w-full h-full -mt-8 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease"></span>
                                                        <span className="relative text-xs">
                                                            Xóa {e?.child?.filter((e) => e?.location == null)?.length}{" "}
                                                            hàng chưa chọn vị trí
                                                        </span>
                                                    </button>
                                                )}
                                            </div>
                                            <div className="col-span-9  items-center">
                                                <div className="grid grid-cols-8  3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] border-b divide-x divide-y border-r">
                                                    {load ? (
                                                        <Loading className="h-2 col-span-8" color="#0f4f9e" />
                                                    ) : (
                                                        e?.child?.map((ce, index) => (
                                                            <React.Fragment key={ce?.id?.toString()}>
                                                                <div className="p-1 border-t border-l  flex flex-col col-span-2 justify-center h-full">
                                                                    <SelectCore
                                                                        options={ce?.dataWarehouse}
                                                                        value={ce?.location}
                                                                        isLoading={
                                                                            ce?.location != null
                                                                                ? false
                                                                                : onLoadingChild
                                                                        }
                                                                        onChange={_HandleChangeChild.bind(
                                                                            this,
                                                                            e?.id,
                                                                            ce?.id,
                                                                            "location"
                                                                        )}
                                                                        className={`${errWarehouse && ce?.location == null
                                                                            ? "border-red-500 border"
                                                                            : ""
                                                                            }  my-1 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] placeholder:text-slate-300 w-full  rounded text-[#52575E] font-normal `}
                                                                        placeholder={
                                                                            onLoadingChild
                                                                                ? ""
                                                                                : dataLang?.production_warehouse_expLoca ||
                                                                                "production_warehouse_expLoca"
                                                                        }
                                                                        noOptionsMessage={() =>
                                                                            dataLang?.returns_nodata || "returns_nodata"
                                                                        }
                                                                        menuPortalTarget={document.body}
                                                                        formatOptionLabel={(option) =>
                                                                            option?.label != null && (
                                                                                <div className="">
                                                                                    <div className="flex gap-1"></div>
                                                                                    <div className="flex gap-1">
                                                                                        <h2 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] font-semibold">
                                                                                            {option?.label}
                                                                                        </h2>
                                                                                    </div>
                                                                                    <div className="flex gap-1">
                                                                                        {
                                                                                            <h2 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] font-medium">
                                                                                                {dataLang?.returns_survive ||
                                                                                                    "returns_survive"}
                                                                                                :
                                                                                            </h2>
                                                                                        }
                                                                                        <h2 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] uppercase font-semibold">
                                                                                            {formatNumber(option?.qty)}
                                                                                        </h2>
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        }
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
                                                                        classNamePrefix="customDropdow"
                                                                    />
                                                                </div>
                                                                <div className=" flex flex-col items-center p-1 h-full justify-center">
                                                                    <SelectCore
                                                                        options={ce?.dataUnit}
                                                                        value={ce?.unit}
                                                                        isLoading={
                                                                            ce?.unit == null ? onLoadingChild : false
                                                                        }
                                                                        onChange={_HandleChangeChild.bind(
                                                                            this,
                                                                            e?.id,
                                                                            ce?.id,
                                                                            "unit"
                                                                        )}
                                                                        noOptionsMessage={() =>
                                                                            dataLang?.returns_nodata || "returns_nodata"
                                                                        }
                                                                        placeholder={
                                                                            dataLang?.production_warehouse_unit ||
                                                                            "production_warehouse_unit"
                                                                        }
                                                                        className={`${errUnit && ce?.unit == null
                                                                            ? "border-red-500 border"
                                                                            : ""
                                                                            }  my-1 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] placeholder:text-slate-300 w-full  rounded text-[#52575E] font-normal`}
                                                                        menuPortalTarget={document.body}
                                                                        style={{
                                                                            border: "none",
                                                                            boxShadow: "none",
                                                                            outline: "none",
                                                                        }}
                                                                        formatOptionLabel={(option) => (
                                                                            <div className="flex justify-start flex-wrap items-center">
                                                                                <h2 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] w-full ">
                                                                                    {dataLang?.production_warehouse_unit ||
                                                                                        "production_warehouse_unit"}
                                                                                    : {option?.label}
                                                                                </h2>
                                                                                <h2 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] ">
                                                                                    {`${dataLang?.production_warehouse_exchange_value ||
                                                                                        "production_warehouse_exchange_value"
                                                                                        }: (${option?.coefficient})`}
                                                                                </h2>
                                                                            </div>
                                                                        )}
                                                                        theme={(theme) => ({
                                                                            ...theme,
                                                                            colors: {
                                                                                ...theme.colors,
                                                                                primary25: "#EBF5FF",
                                                                                primary50: "#92BFF7",
                                                                                primary: "#0F4F9E",
                                                                            },
                                                                        })}
                                                                        classNamePrefix="customDropdow"
                                                                    />
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
                                                                            className="2xl:scale-100 xl:scale-100 scale-50"
                                                                            size="16"
                                                                        />
                                                                    </button>

                                                                    <InPutNumericFormat
                                                                        placeholder={
                                                                            (ce?.location == null ||
                                                                                ce?.unit == null) &&
                                                                            "Chọn vị trí và Đvt trước"
                                                                        }
                                                                        disabled={
                                                                            ce?.location == null || ce?.unit == null
                                                                        }
                                                                        className={`${errQty &&
                                                                            (ce?.exportQuantity == null ||
                                                                                ce?.exportQuantity == "" ||
                                                                                ce?.exportQuantity == 0)
                                                                            ? "border-red-500 border-b"
                                                                            : ""
                                                                            }
                                                                            ${(ce?.exportQuantity == null ||
                                                                                ce?.exportQuantity == "" ||
                                                                                ce?.exportQuantity == 0) &&
                                                                            "border-b border-red-500"
                                                                            }
                                                                            placeholder:3xl:text-[11px] placeholder:xxl:text-[9px] placeholder:2xl:text-[8.5px] placeholder:xl:text-[7px] placeholder:lg:text-[6.3px] placeholder:text-[10px] appearance-none text-center  3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] 3xl:px-1 2xl:px-0.5 xl:px-0.5 p-1 font-normal w-full focus:outline-none border-b border-gray-200 disabled:bg-transparent`}
                                                                        onValueChange={_HandleChangeChild.bind(
                                                                            this,
                                                                            e?.id,
                                                                            ce?.id,
                                                                            "exportQuantity"
                                                                        )}
                                                                        value={ce?.exportQuantity}
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
                                                                            className="2xl:scale-100 xl:scale-100 scale-50"
                                                                            size="16"
                                                                        />
                                                                    </button>
                                                                </div>
                                                                <div className="justify-center pr-1  p-0.5 h-full flex flex-col items-center 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]">
                                                                    {ce?.exchangeValue}
                                                                </div>
                                                                <div className="justify-center pr-1  p-0.5 h-full flex flex-col items-center 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]">
                                                                    {formatNumber(
                                                                        ce?.exportQuantity / ce?.exchangeValue || 0
                                                                    )}{" "}
                                                                    {ce?.unit?.label}
                                                                </div>
                                                                <div className="col-span-1 flex items-center justify-center  h-full p-0.5">
                                                                    <input
                                                                        value={ce?.note}
                                                                        onChange={_HandleChangeChild.bind(
                                                                            this,
                                                                            e?.id,
                                                                            ce?.id,
                                                                            "note"
                                                                        )}
                                                                        placeholder="Ghi chú"
                                                                        type="text"
                                                                        className="  placeholder:text-slate-300  w-full bg-white rounded-[5.5px] text-[#52575E] font-normal p-2 outline-none"
                                                                    />
                                                                </div>
                                                                <div className=" h-full p-0.5 flex flex-col items-center justify-center">
                                                                    <button
                                                                        title="Xóa"
                                                                        onClick={_HandleDeleteChild.bind(
                                                                            this,
                                                                            e?.id,
                                                                            ce?.id
                                                                        )}
                                                                        className=" text-red-500 flex flex-col justify-center items-center hover:scale-110 bg-red-50 p-2 rounded-md hover:bg-red-200 transition-all ease-linear animate-bounce-custom"
                                                                    >
                                                                        <IconDelete />
                                                                    </button>
                                                                </div>
                                                            </React.Fragment>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
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
                    <div className="text-right mt-5 space-y-4 col-span-3 flex-col justify-between ">
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
                                <h3>{dataLang?.production_warehouse_totalEx || "production_warehouse_totalEx"}</h3>
                            </div>
                            <div className="font-normal">
                                <h3 className="text-blue-600">
                                    {formatNumber(
                                        listData?.reduce((total, item) => {
                                            item?.child?.forEach((childItem) => {
                                                if (
                                                    childItem.exportQuantity !== undefined &&
                                                    childItem.exportQuantity !== null
                                                ) {
                                                    total += childItem.exportQuantity;
                                                }
                                            });
                                            return total;
                                        }, 0)
                                    )}
                                </h3>
                            </div>
                        </div>
                        <div className="space-x-2">
                            <ButtonBack
                                onClick={() => router.push(routerProductionWarehouse.home)}
                                dataLang={dataLang}
                            />
                            <ButtonSubmit onClick={_HandleSubmit.bind(this)} dataLang={dataLang} loading={onSending} />
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

export default Index;
