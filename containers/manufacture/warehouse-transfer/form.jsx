import apiWarehouseTransfer from "@/Api/apiManufacture/warehouse/warehouseTransfer/apiWarehouseTransfer";
import Breadcrumb from "@/components/UI/breadcrumb/BreadcrumbCustom";
import ButtonBack from "@/components/UI/button/buttonBack";
import ButtonSubmit from "@/components/UI/button/buttonSubmit";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import { EmptyExprired } from "@/components/UI/common/EmptyExprired";
import { Container } from "@/components/UI/common/layout";
import InPutNumericFormat from "@/components/UI/inputNumericFormat/inputNumericFormat";
import Loading from "@/components/UI/loading/loading";
import PopupConfim from "@/components/UI/popupConfim/popupConfim";
import { optionsQuery } from "@/configs/optionsQuery";
import { CONFIRMATION_OF_CHANGES, TITLE_DELETE_ITEMS } from "@/constants/delete/deleteItems";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import { useBranchList } from "@/hooks/common/useBranch";
import { useLocationByWarehouseTo } from "@/hooks/common/useWarehouses";
import useFeature from "@/hooks/useConfigFeature";
import useSetingServer from "@/hooks/useConfigNumber";
import useStatusExprired from "@/hooks/useStatusExprired";
import useToast from "@/hooks/useToast";
import { useToggle } from "@/hooks/useToggle";
import { routerWarehouseTransfer } from "@/routers/manufacture";
import { formatMoment } from "@/utils/helpers/formatMoment";
import formatNumberConfig from "@/utils/helpers/formatnumber";
import { SelectCore } from "@/utils/lib/Select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Add, Trash as IconDelete, Minus } from "iconsax-react";
import moment from "moment/moment";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { BsCalendarEvent } from "react-icons/bs";
import { MdClear } from "react-icons/md";
import { v4 as uuidv4 } from "uuid";
import { useWarehouseTransferExport } from "./hooks/useWarehouseTransferExport";
import { useWarehouseTransferItems } from "./hooks/useWarehouseTransferItems";
import { useWarehouseTransferTo } from "./hooks/useWarehouseTransferTo";
/// Hậu viết API
const WarehouseTransferForm = (props) => {
    const router = useRouter();

    const id = router.query?.id;

    const dataLang = props?.dataLang;

    const isShow = useToast();

    const dataSeting = useSetingServer();

    const statusExprired = useStatusExprired();

    const { isOpen, isKeyState, handleQueryId } = useToggle();

    const { dataMaterialExpiry, dataProductExpiry, dataProductSerial } = useFeature();

    const [onSending, sOnSending] = useState(false);

    const [onLoadingChild, sOnLoadingChild] = useState(false);

    const [code, sCode] = useState("");

    const [startDate, sStartDate] = useState(new Date());

    const [note, sNote] = useState("");

    const [date, sDate] = useState(moment().format(FORMAT_MOMENT.DATE_TIME_LONG));

    //new
    const [listData, sListData] = useState([]);

    const [idBranch, sIdBranch] = useState(null);

    const [idExportWarehouse, sIdExportWarehouse] = useState(null);

    const [idReceiveWarehouse, sIdReceiveWarehouse] = useState(null);

    const [load, sLoad] = useState(false);

    const [errQty, sErrQty] = useState(false);

    const [errDate, sErrDate] = useState(false);

    const [errBranch, sErrBranch] = useState(false);

    const [errExportWarehouse, sErrExportWarehouse] = useState(false);

    const [errReceiveWarehouse, sErrReceiveWarehouse] = useState(false);

    const [errWarehouse, sErrWarehouse] = useState(false);

    const [errReceivingLocation, sErrReceivingLocation] = useState(false);

    // danh sách chi nhánh
    const { data: dataBranch = [] } = useBranchList();
    // danh sách kho nhận
    const { data: dataReceiveWarehouse = [] } = useWarehouseTransferTo()
    // danh sách mặt hàng
    const { data: dataItems } = useWarehouseTransferItems(idBranch, idExportWarehouse)
    // danh sách vị trí nhận
    const { data: dataReceivingLocation = [] } = useLocationByWarehouseTo(idReceiveWarehouse)
    // danh sách kho 
    const { data: dataWarehouse = [] } = useWarehouseTransferExport(idBranch, idExportWarehouse)

    // set state lại initital khi render
    useEffect(() => {
        router.query && sErrDate(false);
        router.query && sErrBranch(false);
        router.query && sStartDate(new Date());
        router.query && sIdExportWarehouse(false);
        router.query && sErrReceiveWarehouse(false);
        router.query && sErrReceivingLocation(false);
        router.query && sNote("");
    }, [router.query]);

    // lấy dữ liệu khi sửa
    const { isFetching } = useQuery({
        queryKey: ["api_detail_page_warehouse_transfer", id],
        queryFn: async () => {
            const rResult = await apiWarehouseTransfer.apiGetTransferDetail(id);
            sIdBranch({
                label: rResult?.branch_name_id,
                value: rResult?.branch_id,
            });
            sIdExportWarehouse({
                label: rResult?.warehouses_id_name,
                value: rResult?.warehouses_id,
            });
            sIdReceiveWarehouse({
                label: rResult?.warehouses_to_name,
                value: rResult?.warehouses_to,
            });
            sCode(rResult?.code);
            sStartDate(moment(rResult?.date).toDate());
            sNote(rResult?.note);
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
                                    label: ce?.warehouse_location?.location_name,
                                    value: ce?.warehouse_location?.id,
                                    warehouse_name: ce?.warehouse_location?.warehouse_name,
                                    qty: +ce?.warehouse_location?.quantity,
                                }
                                : null,
                        receivingLocation:
                            ce?.warehouse_location_to?.location_name || ce?.warehouse_location_to?.location_id
                                ? {
                                    label: ce?.warehouse_location_to?.location_name,
                                    value: ce?.warehouse_location_to?.id,
                                }
                                : null,
                        serial: ce?.serial == null ? "" : ce?.serial,
                        lot: ce?.lot == null ? "" : ce?.lot,
                        date: ce?.expiration_date != null ? moment(ce?.expiration_date).toDate() : null,
                        unit: e?.item?.unit_name,
                        dataWarehouse: e?.item?.warehouse.map((ye) => ({
                            label: ye?.location_name,
                            value: ye?.id,
                            warehouse_name: ye?.warehouse_name,
                            qty: +ye?.quantity,
                        })),
                        exportQuantity: +ce?.quantity,
                        note: ce?.note,
                    })),
                }))
            );
            return rResult
        },
        enabled: !!id,
        ...optionsQuery
    })

    // reset lại value khi có mặt hàng
    const resetValue = () => {
        if (isKeyState?.type === "branch") {
            sListData([]);
            sIdBranch(isKeyState?.value);
            sIdExportWarehouse(null);
        }
        if (isKeyState?.type === "idExportWarehouse") {
            sListData([]);
            sIdExportWarehouse(isKeyState?.value);
        }
        if (isKeyState?.type == "idReceiveWarehouse") {
            sIdReceiveWarehouse(isKeyState?.value);
            sListData((prevOption) => {
                const newOption = prevOption.map((item) => {
                    const newChild = item.child?.map((e) => {
                        return { ...e, receivingLocation: null };
                    });
                    return { ...item, child: newChild };
                });
                return newOption;
            });
        }
        handleQueryId({ status: false });
    };

    // change các trường input trong giao diện
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
                sIdExportWarehouse(idBranch != value && null);
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
        } else if (type == "idReceiveWarehouse" && idReceiveWarehouse != value) {
            if (listData?.length > 0) {
                if (type === "idReceiveWarehouse" && idBranch != value) {
                    handleQueryId({ status: true, initialKey: { type, value } });
                }
            } else {
                sIdReceiveWarehouse(value);
            }
        }
    };

    // xóa ngày
    const handleClearDate = (type) => {
        if (type === "effectiveDate") {
        }
        if (type === "startDate") {
            sStartDate(new Date());
        }
    };

    const handleTimeChange = (date) => sStartDate(date);

    // lưu chuyển kho
    const _HandleSubmit = (e) => {
        e.preventDefault();

        const hasNullValue = (listData, conditionFn) => {
            return listData.some((item) => item.child?.some((childItem) => conditionFn(childItem)));
        };

        const hasNullKho = hasNullValue(listData, (childItem) => childItem.location === null);

        const hasNullLocation = hasNullValue(listData, (childItem) => childItem.receivingLocation === null);

        const hasNullQty = hasNullValue(listData, (childItem) => childItem.exportQuantity === null || childItem.exportQuantity === "" || childItem.exportQuantity == 0);

        const isEmpty = listData?.length == 0 ? true : false;

        if (idBranch == null || idExportWarehouse == null || idReceiveWarehouse == null || isEmpty || hasNullKho || hasNullLocation || hasNullQty) {
            idBranch == null && sErrBranch(true);
            idExportWarehouse == null && sErrExportWarehouse(true);
            idReceiveWarehouse == null && sErrReceiveWarehouse(true);
            isEmpty && handleCheckError("Chưa nhập thông tin mặt hàng");
            hasNullKho && sErrWarehouse(true);
            hasNullLocation && sErrReceivingLocation(true);
            hasNullQty && sErrQty(true);
            handleCheckError(
                idBranch != null && idExportWarehouse != null && idReceiveWarehouse != null && isEmpty
                    ? "Chưa nhập thông tin mặt hàng" : dataLang?.required_field_null
            );
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

    //Tham chiếu đến hàm rồi xử lý validate
    useClearErrorEffect(sErrDate, date != null);

    useClearErrorEffect(sErrBranch, idBranch != null);

    useClearErrorEffect(sErrExportWarehouse, idExportWarehouse != null);

    useClearErrorEffect(sErrReceiveWarehouse, idReceiveWarehouse != null);

    useEffect(() => {
        idBranch == null && sIdExportWarehouse(null);
    }, [idBranch]);

    const formatNumber = (number) => {
        return formatNumberConfig(+number, dataSeting);
    };

    const handingWarehouseTransfer = useMutation({
        mutationFn: ({ url, data }) => {
            return apiWarehouseTransfer.apiHandingTransfer(url, data);
        }
    })

    const _ServerSending = async () => {
        let formData = new FormData();
        formData.append("code", code);
        formData.append("date", formatMoment(startDate, FORMAT_MOMENT.DATE_LONG));
        formData.append("branch_id", idBranch?.value);
        formData.append("warehouses_id", idExportWarehouse?.value);
        formData.append("warehouses_to", idReceiveWarehouse?.value);
        formData.append("note", note);
        listData.forEach((item, index) => {
            formData.append(`items[${index}][id]`, id ? item?.idParenBackend : "");
            formData.append(`items[${index}][item]`, item?.item?.value);
            item?.child?.forEach((childItem, childIndex) => {
                formData.append(`items[${index}][child][${childIndex}][row_id]`, id ? childItem?.idChildBackEnd : "");
                formData.append(`items[${index}][child][${childIndex}][note]`, childItem?.note ? childItem?.note : "");
                formData.append(`items[${index}][child][${childIndex}][location_warehouses_id]`, childItem?.location?.value || 0);
                formData.append(`items[${index}][child][${childIndex}][location_warehouses_to]`, childItem?.receivingLocation?.value || 0);
                formData.append(`items[${index}][child][${childIndex}][quantity]`, childItem?.exportQuantity);
            });
        });

        const url = id ? `/api_web/Api_transfer/transfer/${id}?csrf_protection=true` : `/api_web/Api_transfer/transfer/?csrf_protection=true`;
        handingWarehouseTransfer.mutate({ url, data: formData }, {
            onSuccess: ({ isSuccess, message, item }) => {
                if (isSuccess) {
                    isShow("success", dataLang[message]);
                    sCode("");
                    sStartDate(new Date());
                    sIdBranch(null);
                    sIdExportWarehouse(null);
                    sIdReceiveWarehouse(null);
                    sNote("");
                    sErrBranch(false);
                    sErrExportWarehouse(false);
                    sErrReceiveWarehouse(false);
                    sErrDate(false);
                    sListData([]);
                    router.push(routerWarehouseTransfer.home);
                    sOnSending(false);
                } else {
                    handleCheckError(`${dataLang[message]} ${item !== undefined && item !== null && item !== "" ? item : ""}`);
                }
            }
        })
    };

    useEffect(() => {
        onSending && _ServerSending();
    }, [onSending]);

    //add thêm dòng mặt hàng con trong cha mới
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
                    receivingLocation: null,
                    unit: value?.e?.unit_name,
                    dataWarehouse: value?.e?.warehouse.map((e) => ({
                        label: e?.location_name,
                        value: e?.id,
                        warehouse_name: e?.warehouse_name,
                        qty: e?.quantity,
                    })),
                    exportQuantity: null,
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

    // add thêm cha mới
    const _HandleAddParent = (value) => {
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
                        receivingLocation: null,
                        dataWarehouse: value?.e?.warehouse.map((e) => ({
                            label: e?.location_name,
                            value: e?.id,
                            warehouse_name: e?.warehouse_name,
                            qty: e?.quantity,
                        })),
                        unit: value?.e?.unit_name,
                        exportQuantity: null,
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

    // xóa dòng con
    const _HandleDeleteChild = (parentId, childId) => {
        const newData = listData.map((e) => {
            if (e.id === parentId) {
                const newChild = e.child?.filter((ce) => ce?.id !== childId);
                return { ...e, child: newChild };
            }
            return e;
        }).filter((e) => e.child?.length > 0);
        sListData([...newData]);
    };

    // xóa tất cả dòng con
    const _HandleDeleteAllChild = (parentId) => {
        const newData = listData.map((e) => {
            if (e.id === parentId) {
                const newChild = e.child?.filter((ce) => ce?.location !== null || ce?.receivingLocation !== null);
                return { ...e, child: newChild };
            }
            return e;
        }).filter((e) => e.child?.length > 0);
        sListData([...newData]);
    };

    // change dòng con
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
                    const newTypeValue = Number(value?.value);
                    setTimeout(() => {
                        const totalExportQuantity = newData[parentIndex].child.reduce((childTotal, childItem) => childTotal + childItem.exportQuantity, 0);
                        if (totalExportQuantity > +updatedChild.location?.qty) {
                            handleQuantityError(+updatedChild.location?.qty);
                            timeOut();
                            updatedChild.exportQuantity = null;
                        }
                    }, 100);
                    updatedChild.exportQuantity = newTypeValue;
                } else if (type === "location") {
                    updatedChild.location = value;
                } else if (type === "increase") {
                    setTimeout(() => {
                        const totalExportQuantity = newData[parentIndex].child.reduce((childTotal, childItem) => childTotal + childItem.exportQuantity, 0);
                        if (totalExportQuantity > +updatedChild.location?.qty) {
                            timeOut();
                            handleQuantityError(+updatedChild.location?.qty);
                            updatedChild.exportQuantity = null;
                        }
                    }, 100);
                    if (updatedChild.location == null) {
                        handleCheckError("Vui lòng chọn vị trí trước");
                    } else if (
                        updatedChild.exportQuantity == updatedChild.location?.qty || (id && updatedChild.exportQuantity >= updatedChild.location?.qty)
                    ) {
                        handleQuantityError(updatedChild?.location?.qty);
                    } else {
                        updatedChild.exportQuantity = Number(updatedChild.exportQuantity) + 1;
                    }
                } else if (type === "decrease") {
                    if (updatedChild.location == null) {
                        handleCheckError("Vui lòng chọn vị trí trước");
                    } else if (updatedChild.exportQuantity >= 2) {
                        updatedChild.exportQuantity = Number(updatedChild.exportQuantity) - 1;
                    } else {
                        updatedChild.exportQuantity = 0;
                    }
                } else if (type === "note") {
                    updatedChild.note = value?.target.value;
                } else if (type == "receivingLocation") {
                    updatedChild.receivingLocation = value;
                }
                newData[parentIndex].child[childIndex] = updatedChild;
            }
        }
        sListData(newData);
    };

    const handleQuantityError = (e) => {
        isShow("error", `Số lượng chỉ được bé hơn hoặc bằng ${formatNumber(e)} số lượng tồn`, 3000);
    };
    const timeOut = () => {
        setTimeout(() => {
            sLoad(true);
        }, 500);
        setTimeout(() => {
            sLoad(false);
        }, 1000);
    };

    // change value
    const _HandleChangeValue = (parentId, value) => {
        sOnLoadingChild(true);
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
                                disabledDate:
                                    (value?.e?.text_type === "material" && dataMaterialExpiry?.is_enable === "1" && false) ||
                                    (value?.e?.text_type === "material" && dataMaterialExpiry?.is_enable === "0" && true) ||
                                    (value?.e?.text_type === "products" && dataProductExpiry?.is_enable === "1" && false) ||
                                    (value?.e?.text_type === "products" && dataProductExpiry?.is_enable === "0" && true),
                                unit: value?.e?.unit_name,
                                receivingLocation: null,
                                location: null,
                                dataWarehouse: value?.e?.warehouse.map((e) => ({
                                    label: e?.location_name,
                                    value: e?.id,
                                    warehouse_name: e?.warehouse_name,
                                    qty: e?.quantity,
                                })),
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

    const handleCheckError = (e) => isShow("error", e);

    const breadcrumbItems = [
        {
            label: `${dataLang?.Warehouse_title || "Warehouse_title"}`,
            // href: "/",
        },
        {
            label: `${dataLang?.warehouseTransfer_list || "warehouseTransfer_list"}`,
            href: "/manufacture/warehouse-transfer",
        },
        {
            label: id ? dataLang?.warehouseTransfer_titleEdit || "warehouseTransfer_titleEdit" : dataLang?.warehouseTransfer_titleAadd || "warehouseTransfer_titleAadd"
        },
    ];
    return (
        <React.Fragment>
            <Head>
                <title>
                    {id ? dataLang?.warehouseTransfer_titleEdit || "warehouseTransfer_titleEdit" : dataLang?.warehouseTransfer_titleAadd || "warehouseTransfer_titleAadd"}
                </title>
            </Head>
            <Container className="!h-auto">
                {statusExprired ? (
                    <EmptyExprired />
                ) : (
                    <Breadcrumb
                        items={breadcrumbItems}
                        className="3xl:text-sm 2xl:text-xs xl:text-[10px] lg:text-[10px]"
                    />
                )}
                <div className="h-[97%] space-y-3 overflow-hidden">
                    <div className="flex items-center justify-between">
                        <h2 className="text-title-section text-[#52575E] capitalize font-medium">
                            {id ? dataLang?.warehouseTransfer_titleEdit || "warehouseTransfer_titleEdit" : dataLang?.warehouseTransfer_titleAadd || "warehouseTransfer_titleAadd"}
                        </h2>
                        <div className="flex items-center justify-end mr-2">
                            <ButtonBack onClick={() => router.push(routerWarehouseTransfer.home)} dataLang={dataLang} />
                        </div>
                    </div>
                    <div className="w-full rounded ">
                        <div className="">
                            <h2 className="font-normal bg-[#ECF0F4] p-2">
                                {dataLang?.purchase_order_detail_general_informatione || "purchase_order_detail_general_informatione"}
                            </h2>
                            <div className="grid items-center grid-cols-10 gap-3 mt-2">
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
                                <div className="relative col-span-2">
                                    <label className="text-[#344054] font-normal text-sm mb-1 ">
                                        {dataLang?.import_day_vouchers || "import_day_vouchers"}
                                    </label>
                                    <div className="flex flex-row custom-date-picker">
                                        <DatePicker
                                            blur
                                            fixedHeight
                                            selected={startDate}
                                            onSelect={(date) => sStartDate(date)}
                                            onChange={(e) => handleTimeChange(e)}
                                            placeholderText="DD/MM/YYYY"
                                            dateFormat="dd/MM/yyyy"
                                            placeholder={dataLang?.price_quote_system_default || "price_quote_system_default"}
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
                                        {dataLang?.warehouseTransfer_transferWarehouse || "warehouseTransfer_transferWarehouse"}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <SelectCore
                                        options={dataWarehouse}
                                        onChange={_HandleChangeInput.bind(this, "idExportWarehouse")}
                                        value={idExportWarehouse}
                                        isClearable={true}
                                        noOptionsMessage={() => dataLang?.returns_nodata || "returns_nodata"}
                                        closeMenuOnSelect={true}
                                        hideSelectedOptions={false}
                                        placeholder={dataLang?.warehouseTransfer_transferWarehouse || "warehouseTransfer_transferWarehouse"}
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
                                        <label className="text-sm text-red-500">{"Vui lòng chọn kho"}</label>
                                    )}
                                </div>
                                <div className="col-span-2 ">
                                    <label className="text-[#344054] font-normal text-sm mb-1 ">
                                        {dataLang?.warehouseTransfer_receivingWarehouse || "warehouseTransfer_receivingWarehouse"}{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <SelectCore
                                        options={dataReceiveWarehouse}
                                        onChange={_HandleChangeInput.bind(this, "idReceiveWarehouse")}
                                        value={idReceiveWarehouse}
                                        isClearable={true}
                                        noOptionsMessage={() => dataLang?.returns_nodata || "returns_nodata"}
                                        closeMenuOnSelect={true}
                                        hideSelectedOptions={false}
                                        placeholder={dataLang?.warehouseTransfer_receivingWarehouse || "warehouseTransfer_receivingWarehouse"}
                                        className={`${errReceiveWarehouse ? "border-red-500" : "border-transparent"
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
                                    {errReceiveWarehouse && (
                                        <label className="text-sm text-red-500">{"Vui lòng chọn kho"}</label>
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
                            <div className="grid grid-cols-8">
                                <h4 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] px-2  text-[#667085] uppercase  col-span-2   text-center  truncate font-[400]">
                                    {dataLang?.warehouseTransfer_rransferPosition || "warehouseTransfer_rransferPosition"}
                                </h4>
                                <h4 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] px-2  text-[#667085] uppercase  col-span-2   text-center  truncate font-[400]">
                                    {dataLang?.warehouseTransfer_receivingLocation || "warehouseTransfer_receivingLocation"}
                                </h4>
                                <h4 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] px-2  text-[#667085] uppercase  col-span-1    text-center  truncate font-[400]">
                                    {"ĐVT"}
                                </h4>
                                <h4 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] px-2  text-[#667085] uppercase  col-span-1    text-center  truncate font-[400]">
                                    {dataLang?.recall_revenueQty || "recall_revenueQty"}
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
                    <div className="grid items-center grid-cols-12 gap-1 py-2 my-1">
                        <div className="col-span-3">
                            <SelectCore
                                options={dataItems}
                                value={null}
                                onChange={_HandleAddParent.bind(this)}
                                className="col-span-2 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]"
                                placeholder={dataLang?.returns_items || "returns_items"}
                                noOptionsMessage={() => dataLang?.returns_nodata || "returns_nodata"}
                                menuPortalTarget={document.body}
                                formatOptionLabel={(option) => (
                                    <div className="flex items-center justify-between py-2">
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
                            <div className="grid grid-cols-8 border-t border-b border-l border-r divide-x">
                                <div className="col-span-2">
                                    <SelectCore
                                        classNamePrefix="customDropdowDefault"
                                        placeholder={dataLang?.warehouseTransfer_rransferPosition || "warehouseTransfer_rransferPosition"}
                                        className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]"
                                        isDisabled={true}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <SelectCore
                                        classNamePrefix="customDropdowDefault"
                                        placeholder={dataLang?.warehouseTransfer_receivingLocation || "warehouseTransfer_receivingLocation"}
                                        className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]"
                                        isDisabled={true}
                                    />
                                </div>
                                <div></div>
                                <div className="flex items-center justify-center col-span-1">
                                    <button className=" text-gray-400 hover:bg-[#e2f0fe] hover:text-gray-600 font-bold flex items-center justify-center 3xl:p-0 2xl:p-0 xl:p-0 p-0 bg-slate-200 rounded-full">
                                        <Minus className="scale-50 2xl:scale-100 xl:scale-100" size="16" />
                                    </button>
                                    <div className=" text-center 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]  3xl:px-1 2xl:px-0.5 xl:px-0.5 p-0 font-normal  focus:outline-none border-b w-full border-gray-200">
                                        1
                                    </div>
                                    <button className=" text-gray-400 hover:bg-[#e2f0fe] hover:text-gray-600 font-bold flex items-center justify-center 3xl:p-0 2xl:p-0 xl:p-0 p-0 bg-slate-200 rounded-full">
                                        <Add className="scale-50 2xl:scale-100 xl:scale-100" size="16" />
                                    </button>
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
                                            <div className="h-full col-span-3 p-2 pb-1 border">
                                                <div className="relative mt-5">
                                                    <SelectCore
                                                        options={dataItems}
                                                        value={e?.item}
                                                        className=""
                                                        onChange={_HandleChangeValue.bind(this, e?.id)}
                                                        menuPortalTarget={document.body}
                                                        formatOptionLabel={(option) => (
                                                            <div className="flex items-center justify-between py-2">
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
                                                        onClick={_HandleAddChild.bind(this, e?.id, e?.item)}
                                                        className="absolute flex flex-col items-center justify-center w-10 h-10 transition ease-in-out rounded bg-slate-100 -top-5 right-5 hover:rotate-45 hover:bg-slate-200 hover:scale-105 hover:text-red-500"
                                                    >
                                                        <Add className="" />
                                                    </button>
                                                </div>
                                                {e?.child?.filter((e) => e?.location == null && e?.receivingLocation == null)?.length >= 2 && (
                                                    <button
                                                        onClick={_HandleDeleteAllChild.bind(this, e?.id, e?.item)}
                                                        className="w-full rounded mt-1.5 px-5 py-1 overflow-hidden group bg-rose-500 relative hover:bg-gradient-to-r hover:from-rose-500 hover:to-rose-400 text-white hover:ring-2 hover:ring-offset-2 hover:ring-rose-400 transition-all ease-out duration-300"
                                                    >
                                                        <span className="absolute right-0 w-full h-full -mt-8 transition-all duration-1000 transform translate-x-12 bg-white opacity-10 rotate-12 group-hover:-translate-x-40 ease"></span>
                                                        <span className="relative text-xs">
                                                            Xóa{" "}
                                                            {
                                                                e?.child?.filter((e) => e?.location == null && e?.receivingLocation == null)?.length
                                                            }{" "}
                                                            hàng chưa chọn vị trí
                                                        </span>
                                                    </button>
                                                )}
                                            </div>
                                            <div className="items-center col-span-9">
                                                <div className="grid grid-cols-8  3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] border-b divide-x divide-y border-r">
                                                    {load ? (
                                                        <Loading className="h-full col-span-8" color="#0f4f9e" />
                                                    ) : (
                                                        e?.child?.map((ce, index) => (
                                                            <React.Fragment key={ce?.id?.toString()}>
                                                                <div className="flex flex-col justify-center h-full col-span-2 p-1 border-t border-l">
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
                                                                        className={`${errWarehouse && ce?.location == null ? "border-red-500 border" : ""} my-1 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] placeholder:text-slate-300 w-full  rounded text-[#52575E] font-normal `}
                                                                        placeholder={onLoadingChild ? "" : dataLang?.warehouseTransfer_rransferPosition || "warehouseTransfer_rransferPosition"}
                                                                        noOptionsMessage={() => dataLang?.returns_nodata || "returns_nodata"}
                                                                        menuPortalTarget={document.body}
                                                                        formatOptionLabel={(option) => (
                                                                            <div className="">
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
                                                                                        {option?.qty && formatNumber(option?.qty)}
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
                                                                        classNamePrefix="customDropdow"
                                                                    />
                                                                </div>
                                                                <div className="flex flex-col justify-center h-full col-span-2 p-1 border-t border-l">
                                                                    <SelectCore
                                                                        options={dataReceivingLocation}
                                                                        value={ce?.receivingLocation}
                                                                        isLoading={ce?.receivingLocation != null ? false : onLoadingChild}
                                                                        onChange={_HandleChangeChild.bind(
                                                                            this,
                                                                            e?.id,
                                                                            ce?.id,
                                                                            "receivingLocation"
                                                                        )}
                                                                        className={`${errReceivingLocation && ce?.receivingLocation == null ? "border-red-500 border" : ""}  my-1 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] placeholder:text-slate-300 w-full  rounded text-[#52575E] font-normal `}
                                                                        placeholder={onLoadingChild ? "" : dataLang?.warehouseTransfer_receivingLocation || "warehouseTransfer_receivingLocation"}
                                                                        noOptionsMessage={() => dataLang?.returns_nodata || "returns_nodata"}
                                                                        menuPortalTarget={document.body}
                                                                        formatOptionLabel={(option) => (
                                                                            <div className="">
                                                                                <div className="flex gap-1"></div>
                                                                                <div className="flex gap-1">
                                                                                    <h2 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] font-semibold">
                                                                                        {option?.label}
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
                                                                        classNamePrefix="customDropdow"
                                                                    />
                                                                </div>
                                                                <div className="col-span-1 flex items-center justify-center  h-full p-0.5">
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
                                                                        placeholder={
                                                                            (ce?.location == null || ce?.unit == null) && "Chọn vị trí trước"
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
                                                                            "border-red-500 border-b"
                                                                            }
                                                                            placeholder:3xl:text-[11px] placeholder:xxl:text-[9px] placeholder:2xl:text-[8.5px] placeholder:xl:text-[7px] placeholder:lg:text-[6.3px] placeholder:text-[10px] appearance-none text-center  3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]  3xl:px-1 2xl:px-0.5 xl:px-0.5 p-1 disabled:bg-transparent font-normal w-full focus:outline-none border-b border-gray-200 `}
                                                                        onValueChange={_HandleChangeChild.bind(
                                                                            this,
                                                                            e?.id,
                                                                            ce?.id,
                                                                            "exportQuantity"
                                                                        )}
                                                                        value={ce?.exportQuantity}
                                                                        isAllowed={(values) => {
                                                                            const { floatValue } = values;
                                                                            if (floatValue > +ce?.location?.qty) {
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
                                                                <div className="flex items-center justify-center h-full col-span-1 ">
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
                                                                        className="  placeholder:text-slate-300 w-full bg-white rounded-[5.5px] text-[#52575E] font-normal px-1.5 outline-none"
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
                                                                        className="flex flex-col items-center justify-center p-2 text-red-500 transition-all ease-linear rounded-md hover:scale-110 bg-red-50 hover:bg-red-200 animate-bounce-custom"
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
                                <h3>{props.dataLang?.warehouseTransfer_total || "warehouseTransfer_total"}</h3>
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
                            <ButtonBack onClick={() => router.push(routerWarehouseTransfer.home)} dataLang={dataLang} />
                            <ButtonSubmit onClick={_HandleSubmit.bind(this)} dataLang={dataLang} />
                        </div>
                    </div>
                </div>
            </Container>
            <PopupConfim
                dataLang={dataLang}
                type="warning"
                title={
                    isKeyState?.type == "idReceiveWarehouse" ? "Thay đổi sẽ thay đổi vị trí nhận" : TITLE_DELETE_ITEMS
                }
                subtitle={CONFIRMATION_OF_CHANGES}
                isOpen={isOpen}
                save={resetValue}
                nameModel={"change_item"}
                cancel={() => handleQueryId({ status: false })}
            />
        </React.Fragment>
    );
};

export default WarehouseTransferForm;
