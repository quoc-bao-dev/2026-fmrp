import apiProductsWarehouse from "@/Api/apiManufacture/warehouse/productsWarehouse/apiProductsWarehouse";
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
import { useLocationByWarehouseTo, useWarehouseComboboxByManufactureByBranch } from "@/hooks/common/useWarehouses";
import useFeature from "@/hooks/useConfigFeature";
import useSetingServer from "@/hooks/useConfigNumber";
import useStatusExprired from "@/hooks/useStatusExprired";
import useToast from "@/hooks/useToast";
import { useToggle } from "@/hooks/useToggle";
import { routerProductsWarehouse } from "@/routers/manufacture";
import { isAllowedNumber } from "@/utils/helpers/common";
import { formatMoment } from "@/utils/helpers/formatMoment";
import formatNumberConfig from "@/utils/helpers/formatnumber";
import { SelectCore } from "@/utils/lib/Select";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { useProductsWarehouseItems } from "./hooks/useProductsWarehouseItems";

const ProductsWarehouseForm = (props) => {
    const router = useRouter();

    const isShow = useToast();

    const dataSeting = useSetingServer();

    const { isOpen, isKeyState, handleQueryId } = useToggle();

    const id = router.query?.id;

    const dataLang = props?.dataLang;

    const [onLoadingChild, sOnLoadingChild] = useState(false);

    const [onSending, sOnSending] = useState(false);

    const [code, sCode] = useState("");

    const [searchItems, setSearchItems] = useState("");

    const [startDate, sStartDate] = useState(new Date());

    const [effectiveDate, sEffectiveDate] = useState(null);

    const [note, sNote] = useState("");

    const [date, sDate] = useState(moment().format(FORMAT_MOMENT.DATE_TIME_LONG));

    const { dataProductExpiry, dataMaterialExpiry, dataProductSerial } = useFeature();
    //new
    const statusExprired = useStatusExprired();

    const [listData, sListData] = useState([]);

    const [idBranch, sIdBranch] = useState(null);

    const [idImportWarehouse, sIdImportWarehouse] = useState(null);

    const [errDate, sErrDate] = useState(false);

    const [errBranch, sErrBranch] = useState(false);

    const [errWarehouse, sErrWarehouse] = useState(false);

    const [errExportWarehouse, sErrExportWarehouse] = useState(false);

    const [errQty, sErrQty] = useState(false);

    const [errLot, sErrLot] = useState(false);

    const [errDateList, sErrDateList] = useState(false);

    const [errSerial, sErrSerial] = useState(false);

    // danh sách chi nhánh
    const { data: dataBranch = [] } = useBranchList();
    // danh sách vị trí kho
    const { data: dataLocation = [] } = useLocationByWarehouseTo(idImportWarehouse, idBranch)
    // danh sách kho
    const { data: dataWarehouse } = useWarehouseComboboxByManufactureByBranch(idBranch, idImportWarehouse)
    // danh sách mặt hàng
    const { data: dataItems } = useProductsWarehouseItems(searchItems, idBranch)

    // set state mặc định
    useEffect(() => {
        router.query && sErrDate(false);
        router.query && sErrBranch(false);
        router.query && sStartDate(new Date());
        router.query && sNote("");
    }, [router.query]);

    // lấy dữ liệu khi sửa
    const { isFetching } = useQuery({
        queryKey: ['api_products_warehouse_detail', id],
        queryFn: async () => {
            const rResult = await apiProductsWarehouse.apiDetailPagePoductWarehouse(id);
            sIdBranch({
                label: rResult?.branch_name,
                value: rResult?.branch_id,
            });
            sIdImportWarehouse({
                label: rResult?.warehouse_name,
                value: rResult?.warehouse_id,
            });
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
                        (e.item?.text_type == "products" && dataProductExpiry?.is_enable == "1" && false) ||
                        (e.item?.text_type == "products" && dataProductExpiry?.is_enable == "0" && true),
                    location:
                        ce?.warehouse_location?.location_name ||
                            ce?.warehouse_location?.id ||
                            ce?.warehouse_location?.warehouse_name
                            ? {
                                label: ce?.warehouse_location?.location_name || null,
                                value: ce?.warehouse_location?.id || null,
                                warehouse_name: ce?.warehouse_location?.warehouse_name || null,
                            }
                            : null,
                    serial: ce?.serial == null ? "" : ce?.serial,
                    lot: ce?.lot == null ? "" : ce?.lot,
                    date: ce?.expiration_date != null ? moment(ce?.expiration_date).toDate() : null,
                    unit: e.item?.unit_name,
                    importQuantity: +ce?.quantity,
                    exchangeValue: +ce?.coefficient,
                    numberOfConversions: +ce?.quantity_exchange,
                    note: ce?.note,
                })),
            }))
            );
            sCode(rResult?.code);
            sStartDate(moment(rResult?.date).toDate());
            sNote(rResult?.note);
        },
        enabled: !!id,
        ...optionsQuery
    })

    // tìm kiếm mặt hàng
    const _HandleSeachApi = debounce(async (inputValue) => {
        setSearchItems(inputValue);
    }, 500);

    // reset mặt hàng khi thay đổi value
    const resetValue = () => {
        if (isKeyState?.type === "branch") {
            sListData([]);
            sIdImportWarehouse(null);
            sIdBranch(isKeyState?.value);
        }
        if (isKeyState?.type == "idImportWarehouse") {
            sListData([]);
            sIdImportWarehouse(isKeyState?.value);
        }
        handleQueryId({ status: false });
    };

    // change các input và select
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
                sIdBranch(value);
                sIdImportWarehouse(null);
            }
        } else if (type == "idImportWarehouse" && idImportWarehouse != value) {
            if (listData?.length > 0) {
                handleQueryId({ status: true, initialKey: { type, value } });
            } else {
                sIdImportWarehouse(value);
            }
        }
    };

    // xóa ngày
    const handleClearDate = (type) => {
        if (type === "effectiveDate") {
            sEffectiveDate(null);
        }
        if (type === "startDate") {
            sStartDate(new Date());
        }
    };

    // change ngày
    const handleTimeChange = (date) => {
        sStartDate(date);
    };

    // lưu dữ liệu
    const _HandleSubmit = (e) => {
        e.preventDefault();
        const hasNullOrCondition = (data, conditionFn) =>
            data.some((item) => item.child?.some((childItem) => conditionFn(item, childItem)));

        const hasNullWarehouse = hasNullOrCondition(listData, (item, childItem) => childItem.location === null);

        const hasNullSerial = hasNullOrCondition(listData, (item, childItem) => item?.item.e?.text_type === "products" && (childItem.serial === "" || childItem.serial == null));

        const hasNullLot = hasNullOrCondition(listData, (item, childItem) => !childItem.disabledDate && (childItem.lot === "" || childItem.lot == null));

        const hasNullDate = hasNullOrCondition(listData, (item, childItem) => !childItem.disabledDate && childItem.date === null);

        const hasNullQty = hasNullOrCondition(listData, (item, childItem) => childItem.importQuantity === null || childItem.importQuantity === "" || childItem.importQuantity == 0);

        const isEmpty = listData?.length === 0;

        if (
            idBranch == null ||
            hasNullWarehouse ||
            hasNullQty ||
            isEmpty ||
            idImportWarehouse == null ||
            (dataProductSerial?.is_enable == "1" && hasNullSerial) ||
            (dataProductExpiry?.is_enable == "1" && hasNullLot) ||
            (dataProductExpiry?.is_enable == "1" && hasNullDate)
        ) {
            idBranch == null && sErrBranch(true);
            idImportWarehouse == null && sErrExportWarehouse(true);
            hasNullWarehouse && sErrWarehouse(true);
            hasNullQty && sErrQty(true);
            hasNullWarehouse && sErrWarehouse(true);
            hasNullLot && sErrLot(true);
            hasNullSerial && sErrSerial(true);
            hasNullDate && sErrDateList(true);
            if (isEmpty) {
                handleCheckError("Chưa nhập thông tin mặt hàng");
            } else {
                handleCheckError(dataLang?.required_field_null);
            }
        } else {
            sErrWarehouse(false);
            sErrExportWarehouse(false);
            sErrQty(false);
            sErrLot(false);
            sErrSerial(false);
            sErrDateList(false);
            sOnSending(true);
        }
    };

    // check validate các trường
    useEffect(() => {
        sErrDate(false);
    }, [date != null]);

    useEffect(() => {
        sErrBranch(false);
    }, [idBranch != null]);

    useEffect(() => {
        sErrExportWarehouse(false);
    }, [idImportWarehouse != null]);

    useEffect(() => {
        idBranch == null && sIdImportWarehouse(null);
    }, [idBranch]);

    const formatNumber = (number) => {
        return formatNumberConfig(+number, dataSeting);
    };

    // lưu dữ liệu
    const haningProductionsWarehouse = useMutation({
        mutationFn: ({ id, formData }) => {
            return apiProductsWarehouse.apiHandingProdcutsWarehouse(id, formData)
        }
    })

    // lưu dữ liệu
    const _ServerSending = async () => {
        let formData = new FormData();

        formData.append("code", code);

        formData.append("date", formatMoment(startDate, FORMAT_MOMENT.DATE_TIME_LONG));

        formData.append("branch_id", idBranch?.value);

        formData.append("warehouse_id", idImportWarehouse?.value);

        formData.append("note", note);

        listData.forEach((item, index) => {
            formData.append(`items[${index}][id]`, id ? item?.idParenBackend : "");
            formData.append(`items[${index}][item]`, item?.item?.value);
            item?.child?.forEach((childItem, childIndex) => {
                formData.append(`items[${index}][child][${childIndex}][row_id]`, id ? childItem?.idChildBackEnd : "");
                formData.append(`items[${index}][child][${childIndex}][serial]`, childItem?.serial === null ? "" : childItem?.serial);
                formData.append(`items[${index}][child][${childIndex}][lot]`, childItem?.lot === null ? "" : childItem?.lot);
                formData.append(`items[${index}][child][${childIndex}][expiration_date]`, childItem?.date === null ? "" : formatMoment(childItem?.date, FORMAT_MOMENT.DATE_TIME_LONG));
                formData.append(`items[${index}][child][${childIndex}][location_warehouses_id]`, childItem?.location?.value || 0);
                formData.append(`items[${index}][child][${childIndex}][note]`, childItem?.note ? childItem?.note : "");
                formData.append(`items[${index}][child][${childIndex}][quantity]`, childItem?.importQuantity);
            });
        });
        haningProductionsWarehouse.mutate({ id, formData }, {
            onSuccess: ({ isSuccess, message }) => {
                if (isSuccess) {
                    isShow("success", `${dataLang[message]}` || message);
                    sCode("");
                    sStartDate(new Date());
                    sIdBranch(null);
                    sIdImportWarehouse(null);
                    sNote("");
                    sErrBranch(false);
                    sErrDate(false);
                    sErrExportWarehouse(false);
                    sListData([]);
                    router.push(routerProductsWarehouse.home);
                    sOnSending(false);
                } else {
                    handleCheckError(dataLang[message] || message);
                }
            },
            onError: (error) => {
                throw error
            }
        })
    };

    useEffect(() => {
        onSending && _ServerSending();
    }, [onSending]);

    // thêm hàng mặt hàng con
    const _HandleAddChild = (parentId, value) => {
        sOnLoadingChild(true);
        const newData = listData?.map((e) => {
            if (e?.id === parentId) {
                const newChild = {
                    id: uuidv4(),
                    disabledDate:
                        (value?.e?.text_type === "products" && dataProductExpiry?.is_enable === "1" && false) ||
                        (value?.e?.text_type === "products" && dataProductExpiry?.is_enable === "0" && true),
                    location: null,
                    unit: value?.e?.unit_name,
                    serial: "",
                    lot: "",
                    date: null,
                    importQuantity: null,
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

    // thêm mặt hàng cha
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
                            (value?.e?.text_type === "products" && dataProductExpiry?.is_enable === "1" && false) ||
                            (value?.e?.text_type === "products" && dataProductExpiry?.is_enable === "0" && true),
                        location: null,
                        serial: "",
                        lot: "",
                        date: null,
                        unit: value?.e?.unit_name,
                        importQuantity: null,
                        exchangeValue: null,
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

    // xóa dòng mặt hàng con
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

    // xóa tất cả mặt hàng con
    const _HandleDeleteAllChild = (parentId) => {
        const newData = listData.map((e) => {
            if (e.id === parentId) {
                const newChild = e.child?.filter((ce) => ce?.location !== null);
                return { ...e, child: newChild };
            }
            return e;
        }).filter((e) => e.child?.length > 0);
        sListData([...newData]);
    };

    // change dữ liệu hàng con
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
                if (type === "importQuantity") {
                    const newQtyImport = Number(value?.value);
                    updatedChild.importQuantity = newQtyImport;
                } else if (type === "location") {
                    const checkKho = newData[parentIndex].child.map((house) => house).some((i) => i?.location?.value === value?.value);
                    if (checkKho) {
                        handleCheckError("Vị trí nhập đã được chọn");
                    } else {
                        updatedChild.location = value;
                    }
                } else if (type === "serial") {
                    const newTypeValue = value?.target.value;
                    // Kiểm tra xem giá trị mới đã tồn tại trong cả phần tử cha và các phần tử con
                    const existsInParent = newData[parentIndex].child.some((ce) => ce[type] === newTypeValue);
                    const existsInOtherParents = newData.some((e) => e.id !== parentId && e.child.some((ce) => ce[type] === newTypeValue));
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
                    updatedChild.importQuantity = Number(updatedChild.importQuantity) + 1;
                    updatedChild.numberOfConversions =
                        Number(updatedChild.importQuantity) * Number(updatedChild.exchangeValue);
                } else if (type === "decrease") {
                    if (updatedChild.importQuantity >= 2) {
                        updatedChild.importQuantity = Number(updatedChild.importQuantity) - 1;
                        updatedChild.numberOfConversions =
                            Number(updatedChild.importQuantity) * Number(updatedChild.exchangeValue);
                    }
                } else if (type === "note") {
                    updatedChild.note = value?.target.value;
                }
                newData[parentIndex].child[childIndex] = updatedChild;
            }
        }
        sListData(newData);
    };

    const handleQuantityError = (e) => isShow("error", e);

    /// change mặt hàng
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
                                    (value?.e?.text_type === "products" && dataProductExpiry?.is_enable === "1" && false) ||
                                    (value?.e?.text_type === "products" && dataProductExpiry?.is_enable === "0" && true),
                                unit: value?.e?.unit_name,
                                importQuantity: null,
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


    const breadcrumbItems = [
        {
            label: `${dataLang?.Warehouse_title || "Warehouse_title"}`,
            // href: "/",
        },
        {
            label: `${dataLang?.productsWarehouse_title || "productsWarehouse_title"}`,
            href: "/manufacture/products-warehouse",
        },
        {
            label: id ? dataLang?.productsWarehouse_edit || "productsWarehouse_edit" : dataLang?.productsWarehouse_add || "productsWarehouse_add"
        },
    ];

    return (
        <React.Fragment>
            <Head>
                <title>
                    {id ? dataLang?.productsWarehouse_edit || "productsWarehouse_edit" : dataLang?.productsWarehouse_add || "productsWarehouse_add"}
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
                )}
                <div className="h-[97%] space-y-3 overflow-hidden">
                    <div className="flex items-center justify-between">
                        <h2 className="text-title-section text-[#52575E] capitalize font-medium">
                            {id ? dataLang?.productsWarehouse_edit || "productsWarehouse_edit" : dataLang?.productsWarehouse_add || "productsWarehouse_add"}
                        </h2>
                        <div className="flex items-center justify-end mr-2">
                            <ButtonBack onClick={() => router.push(routerProductsWarehouse.home)} dataLang={dataLang} />
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
                                        {dataLang?.productsWarehouse_warehouseImport || "productsWarehouse_warehouseImport"}{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <SelectCore
                                        options={dataWarehouse}
                                        onChange={_HandleChangeInput.bind(this, "idImportWarehouse")}
                                        value={idImportWarehouse}
                                        isClearable={true}
                                        noOptionsMessage={() => dataLang?.returns_nodata || "returns_nodata"}
                                        closeMenuOnSelect={true}
                                        hideSelectedOptions={false}
                                        placeholder={dataLang?.productsWarehouse_warehouseImport || "productsWarehouse_warehouseImport"}
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
                            </div>
                        </div>
                    </div>
                    <div className=" bg-[#ECF0F4] p-2 grid  grid-cols-12">
                        <div className="col-span-12 font-normal">
                            {dataLang?.import_item_information || "import_item_information"}
                        </div>
                    </div>

                    <div className="grid grid-cols-13 items-center  sticky top-0  bg-[#F7F8F9] py-2 z-10">
                        <h4 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] px-2  text-[#667085] uppercase  col-span-3 text-center truncate font-[400]">
                            {dataLang?.import_from_items || "import_from_items"}
                        </h4>
                        <div className="col-span-10">
                            <div
                                className={`${dataProductSerial?.is_enable == "1"
                                    ? "grid-cols-8"
                                    : (dataProductExpiry?.is_enable == "1" || dataMaterialExpiry?.is_enable == "1")
                                        ? "grid-cols-7"
                                        : "grid-cols-5"
                                    } grid `}
                            >
                                <h4 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] px-2  text-[#667085] uppercase  col-span-1   text-center  truncate font-[400]">
                                    {dataLang?.productsWarehouse_warehouseLocaImport || "productsWarehouse_warehouseLocaImport"}
                                </h4>
                                {dataProductSerial?.is_enable === "1" && (
                                    <h4 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] px-2  col-span-1  text-[#667085] uppercase  font-[400] text-center">
                                        {"Serial"}
                                    </h4>
                                )}
                                {
                                    dataMaterialExpiry.is_enable === "1" ||
                                        dataProductExpiry?.is_enable === "1" ? (
                                        <>
                                            <h4 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] px-2  col-span-1  text-[#667085] uppercase  font-[400] text-center">
                                                {"Lot"}
                                            </h4>
                                            <h4 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] px-2  col-span-1  text-[#667085] uppercase  font-[400] text-center">
                                                {props.dataLang?.warehouses_detail_date || "warehouses_detail_date"}
                                            </h4>
                                        </>
                                    ) : (
                                        ""
                                    )
                                }
                                <h4 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] px-2  text-[#667085] uppercase  col-span-1    text-center  truncate font-[400]">
                                    {"ĐVT"}
                                </h4>
                                <h4 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] px-2  text-[#667085] uppercase  col-span-1    text-center  truncate font-[400]">
                                    {dataLang?.productsWarehouse_QtyImport || "productsWarehouse_QtyImport"}
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
                    <div className="grid items-center gap-1 py-2 grid-cols-13">
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

                        <div className="col-span-10">
                            <div
                                className={`${dataProductSerial?.is_enable == "1"
                                    ? "grid-cols-8"
                                    : dataMaterialExpiry.is_enable === "1" ||
                                        dataProductExpiry?.is_enable === "1"
                                        ? "grid-cols-7"
                                        : "grid-cols-5"
                                    } grid  divide-x border-t border-b border-r border-l`}
                            >
                                <div className="col-span-1">
                                    {" "}
                                    <SelectCore
                                        classNamePrefix="customDropdowDefault"
                                        placeholder={dataLang?.productsWarehouse_warehouseLocaImport || "productsWarehouse_warehouseLocaImport"}
                                        className="3xl:text-[12px] border-none outline-none 2xl:text-[10px] xl:text-[9.5px] text-[9px]"
                                        isDisabled={true}
                                    />
                                </div>
                                {dataProductSerial.is_enable === "1" ? (
                                    <div className="col-span-1 ">
                                        <InPutNumericFormat
                                            className="w-full appearance-none text-center 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] py-2 2xl:px-2 xl:px-1 p-0 font-normal  focus:outline-none border-b-2 border-gray-200"
                                            allowNegative={false}
                                            decimalScale={0}
                                            isNumericString={true}
                                            thousandSeparator=","
                                            disabled
                                        />
                                    </div>
                                ) : (
                                    ""
                                )}
                                {
                                    dataMaterialExpiry.is_enable === "1" ||
                                        dataProductExpiry?.is_enable === "1" ? (
                                        <>
                                            <div className="flex items-center col-span-1 ">
                                                <InPutNumericFormat
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
                                                {/* {effectiveDate && (
                                  <>
                                    <MdClear className="absolute right-0 -translate-x-[320%] translate-y-[1%] h-10 text-[#CCCCCC] hover:text-[#999999] scale-110 cursor-pointer" onClick={() => handleClearDate('effectiveDate')} />
                                  </>
                                )}
                                <BsCalendarEvent className="absolute right-0 -translate-x-[75%] translate-y-[70%] text-[#CCCCCC] scale-110 cursor-pointer" /> */}
                                            </div>
                                        </>
                                    ) : (
                                        ""
                                    )
                                }
                                <div></div>
                                <div className="flex items-center justify-center col-span-1">
                                    <button className=" text-gray-400 hover:bg-[#e2f0fe] hover:text-gray-600 font-bold flex items-center justify-center 3xl:p-0 2xl:p-0 xl:p-0 p-0 bg-slate-200 rounded-full">
                                        <Minus className="scale-50 2xl:scale-100 xl:scale-100" size="16" />
                                    </button>
                                    <div className=" text-center 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] 3xl:px-1 2xl:px-0.5 xl:px-0.5 p-0 font-normal  focus:outline-none border-b w-full border-gray-200">
                                        1
                                    </div>
                                    <button className=" text-gray-400 hover:bg-[#e2f0fe] hover:text-gray-600 font-bold flex items-center justify-center 3xl:p-0 2xl:p-0 xl:p-0 p-0 bg-slate-200 rounded-full">
                                        <Add className="scale-50 2xl:scale-100 xl:scale-100" size="16" />
                                    </button>
                                </div>
                                <input
                                    placeholder="Ghi chú"
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
                                            className="grid items-start gap-1 my-1 grid-cols-13"
                                        >
                                            <div className="col-span-3 border border-r p-0.5 pb-1 h-full">
                                                <div className="relative mt-5 mr-5">
                                                    <SelectCore
                                                        onInputChange={(event) => {
                                                            _HandleSeachApi(event);
                                                        }}
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
                                            <div className="items-center col-span-10">
                                                <div
                                                    className={`${dataProductSerial?.is_enable == "1"
                                                        ? "grid-cols-8"
                                                        : dataMaterialExpiry.is_enable === "1" ||
                                                            dataProductExpiry?.is_enable === "1"
                                                            ? "grid-cols-7"
                                                            : "grid-cols-5"
                                                        }  3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] border-b divide-x divide-y border-r grid `}
                                                >
                                                    {e?.child?.map((ce) => (
                                                        <React.Fragment key={ce?.id?.toString()}>
                                                            <div className="flex flex-col items-center justify-center h-full p-1 border-t border-l ">
                                                                <SelectCore
                                                                    options={dataLocation}
                                                                    value={ce?.location}
                                                                    isLoading={
                                                                        ce?.location != null ? false : onLoadingChild
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
                                                                    placeholder={onLoadingChild ? "" : dataLang?.productsWarehouse_warehouseLocaImport || "productsWarehouse_warehouseLocaImport"}
                                                                    noOptionsMessage={() => dataLang?.returns_nodata || "returns_nodata"}
                                                                    menuPortalTarget={document.body}
                                                                    formatOptionLabel={(option) => (
                                                                        <div className="flex gap-1">
                                                                            <h2 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] font-semibold">
                                                                                {option?.label}
                                                                            </h2>
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
                                                                            width: "150%",
                                                                        }),
                                                                    }}
                                                                    classNamePrefix="customDropdow"
                                                                />
                                                            </div>
                                                            {dataProductSerial?.is_enable === "1" ? (
                                                                <div className="col-span-1 ">
                                                                    <div className="flex flex-col items-center justify-center h-full p-1">
                                                                        <input
                                                                            value={ce?.serial}
                                                                            disabled={
                                                                                e?.item?.e?.text_type != "products"
                                                                            }
                                                                            className={`border ${e?.item?.e?.text_type != "products"
                                                                                ? "bg-gray-50"
                                                                                : errSerial && (ce?.serial == "" || ce?.serial == null)
                                                                                    ? "border-red-500"
                                                                                    : "focus:border-[#92BFF7] border-[#d0d5dd] "
                                                                                } placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal p-4 outline-none cursor-pointer`}
                                                                            onChange={_HandleChangeChild.bind(
                                                                                this,
                                                                                e?.id,
                                                                                ce?.id,
                                                                                "serial"
                                                                            )}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                ""
                                                            )}
                                                            {
                                                                dataMaterialExpiry.is_enable ===
                                                                    "1" ||
                                                                    dataProductExpiry?.is_enable === "1" ? (
                                                                    <>
                                                                        <div className="col-span-1 ">
                                                                            <div className="flex flex-col items-center justify-center h-full p-1">
                                                                                <input
                                                                                    value={ce?.lot}
                                                                                    disabled={ce?.disabledDate}
                                                                                    className={`border ${ce?.disabledDate
                                                                                        ? "bg-gray-50"
                                                                                        : errLot && (ce?.lot == "" || ce?.lot == null)
                                                                                            ? "border-red-500"
                                                                                            : "focus:border-[#92BFF7] border-[#d0d5dd]"
                                                                                        } placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal p-4 outline-none cursor-pointer`}
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
                                                                            <div className="custom-date-picker flex justify-center h-full p-0.5 flex-col items-center w-full">
                                                                                <div className="relative col-span-4">
                                                                                    <div className="flex flex-row custom-date-picker">
                                                                                        <DatePicker
                                                                                            selected={ce?.date}
                                                                                            blur
                                                                                            disabled={ce?.disabledDate}
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
                                                                                                } placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal p-4 outline-none cursor-pointer`}
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
                                                                )
                                                            }
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
                                                                        (ce?.importQuantity == null ||
                                                                            ce?.importQuantity == "" ||
                                                                            ce?.importQuantity == 0)
                                                                        ? "border-red-500 border-b"
                                                                        : ""
                                                                        }
                                                                        ${(ce?.importQuantity == null ||
                                                                            ce?.importQuantity == "" ||
                                                                            ce?.importQuantity == 0) &&
                                                                        "border-red-500 border-b"
                                                                        }
                                                                        placeholder:3xl:text-[11px] placeholder:xxl:text-[9px] placeholder:2xl:text-[8.5px] placeholder:xl:text-[7px] placeholder:lg:text-[6.3px] placeholder:text-[10px] appearance-none text-center  3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] 3xl:px-1 2xl:px-0.5 xl:px-0.5 p-0 font-normal w-full focus:outline-none border-b border-gray-200 `}
                                                                    onValueChange={_HandleChangeChild.bind(
                                                                        this,
                                                                        e?.id,
                                                                        ce?.id,
                                                                        "importQuantity"
                                                                    )}
                                                                    value={ce?.importQuantity}
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
                                                                    placeholder="Ghi chú"
                                                                    type="text"
                                                                    className="  placeholder:text-slate-300 w-full bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-2 outline-none "
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
                                                                    className="flex flex-col items-center justify-center text-red-500 "
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
                                <h3>{"Tổng số lượng nhập"}</h3>
                            </div>
                            <div className="font-normal">
                                <h3 className="text-blue-600">
                                    {formatNumber(
                                        listData?.reduce((total, item) => {
                                            item?.child?.forEach((childItem) => {
                                                if (
                                                    childItem.importQuantity !== undefined &&
                                                    childItem.importQuantity !== null
                                                ) {
                                                    total += childItem.importQuantity;
                                                }
                                            });
                                            return total;
                                        }, 0)
                                    )}
                                </h3>
                            </div>
                        </div>
                        <div className="space-x-2">
                            <ButtonBack onClick={() => router.push(routerProductsWarehouse.home)} dataLang={dataLang} />
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

export default ProductsWarehouseForm;
