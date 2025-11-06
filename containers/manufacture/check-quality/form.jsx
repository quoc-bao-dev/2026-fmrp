import { debounce } from "lodash";
import moment from "moment/moment";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { BsCalendarEvent } from "react-icons/bs";
import { MdClear } from "react-icons/md";
import { v4 as uuidv4 } from "uuid";
import { Add, Trash as IconDelete, Minus } from "iconsax-react";
import useSetingServer from "@/hooks/useConfigNumber";
import useStatusExprired from "@/hooks/useStatusExprired";
import useToast from "@/hooks/useToast";
import { useToggle } from "@/hooks/useToggle";
import { EmptyExprired } from "@/components/UI/common/EmptyExprired";
import { Container } from "@/components/UI/common/layout";
import InPutNumericFormat from "@/components/UI/inputNumericFormat/inputNumericFormat";
import Loading from "@/components/UI/loading/loading";
import PopupConfim from "@/components/UI/popupConfim/popupConfim";
import { isAllowedNumber } from "@/utils/helpers/common";
import formatNumberConfig from "@/utils/helpers/formatnumber";
import { SelectCore } from "@/utils/lib/Select";
import { routerQc } from "@/routers/manufacture";
import apiComons from "@/Api/apiComon/apiComon";
import apiInternalPlan from "@/Api/apiManufacture/manufacture/internalPlan/apiInternalPlan";
import ButtonBack from "@/components/UI/button/buttonBack";
import ButtonSubmit from "@/components/UI/button/buttonSubmit";
import { CONFIRMATION_OF_CHANGES, TITLE_DELETE_ITEMS } from "@/constants/delete/deleteItems";
import PopupDetailError from "./components/popupDetailError";
import Breadcrumb from "@/components/UI/breadcrumb/BreadcrumbCustom";
const CheckQualityForm = (props) => {
    const initialState = {
        onFetching: false,
        onFetchingDetail: false,
        onFetchingCondition: false,
        onFetchingItemsAll: false,
        onLoading: false,
        onLoadingChild: false,
        onSending: false,
        load: false,
        errBranch: false,
        errQuantityQc: false,
        errPlan: false,
        errDate: false,
        code: "",
        date: new Date(),
        idBranch: null,
        namePlan: "",
        note: "",
        dateAll: null,
        dataBranch: [],
        dataItems: [],
        listData: [],
        dataDetailedProduction: [],
        idDetailedProduction: null,
        errDetailedProduction: false,
    };

    const router = useRouter();

    const id = router.query?.id;

    const dataLang = props?.dataLang;

    const dataSeting = useSetingServer();

    const statusExprired = useStatusExprired();

    const isShow = useToast();

    const { isOpen, isKeyState, handleQueryId } = useToggle();

    const [isStateQlty, sIsStateQlty] = useState(initialState);

    const queryStateQlty = (key) => sIsStateQlty((prev) => ({ ...prev, ...key }));

    const formatNumber = (number) => {
        return formatNumberConfig(+number, dataSeting);
    };

    const resetAllStates = () => {
        sIsStateQlty(initialState);
    };

    useEffect(() => {
        router.query && resetAllStates();
    }, [router.query]);

    const _ServerFetching = async () => {
        queryStateQlty({ onLoading: true });
        const { result } = await apiComons.apiBranchCombobox();
        queryStateQlty({ dataBranch: result?.map(({ name, id }) => ({ label: name, value: id })), onLoading: false });
    };

    useEffect(() => {
        isStateQlty.onFetching && _ServerFetching();
    }, [isStateQlty.onFetching]);

    const _ServerFetchingDetailPage = async () => {
        const { data } = await apiInternalPlan.apiDetailInternalPlan(id);
        queryStateQlty({
            listData: data?.internalPlansItems.map((e) => {
                return {
                    id: e?.id,
                    idParenBackend: e?.id,
                    matHang: {
                        e: e,
                        label: `${e?.item_name} <span style={{display: none}}>${e?.code + e?.product_variation + e?.text_type + e?.unit_name
                            }</span>`,
                        value: e?.item_id,
                    },
                    unit: e?.unit_name,
                    quantity: Number(e?.quantity),
                    note: e?.note_item,
                    date: moment(e?.date_needed).toDate(),
                };
            }),
            code: data?.internalPlans?.reference_no,
            date: moment(data?.internalPlans?.date).toDate(),
            idBranch: {
                label: data?.internalPlans?.name_branch,
                value: data?.internalPlans?.branch_id,
            },
            namePlan: data?.internalPlans.plan_name,
            note: data?.internalPlans?.note,
            onFetchingDetail: false,
        });
    };

    useEffect(() => {
        isStateQlty.onFetchingDetail && _ServerFetchingDetailPage();
    }, [isStateQlty.onFetchingDetail]);

    const _ServerFetching_ItemsAll = async () => {
        const { data } = await apiComons.apiSearchProductsVariant({
            params: {
                "filter[branch_id]": isStateQlty.idBranch != null ? +isStateQlty.idBranch.value : null,
            },
        });
        queryStateQlty({
            dataItems: data?.result.map((e) => ({
                label: `${e.name}
                <spa style={{display: none}}>${e.code}</spa
                <span style={{display: none}}>${e.text_type} ${e.unit_name} </span>`,
                value: e.id,
                e,
            })),
            onFetchingItemsAll: false,
        });
    };

    const _HandleSeachApi = debounce(async (inputValue) => {
        const { data } = await apiComons.apiSearchProductsVariant({
            params: {
                "filter[branch_id]": isStateQlty.idBranch !== null ? +isStateQlty.idBranch.value : null,
            },
            data: {
                term: inputValue,
            },
        });
        queryStateQlty({
            dataItems: data?.result.map((e) => ({
                label: `${e.name}
                <spa style={{display: none}}>${e.code}</spa
                <span style={{display: none}}>${e.text_type} ${e.unit_name} </span>`,
                value: e.id,
                e,
            })),
        });
    }, 500);

    const handleSaveStatus = () => {
        queryStateQlty({
            dataItems: [],
            listData: [],
            idBranch: isKeyState?.value,
        });
        handleQueryId({ status: false });
    };

    const handleCancleStatus = () => {
        handleQueryId({ status: false });
    };

    const checkListData = (value) => {
        handleQueryId({
            status: true,
            initialKey: { value },
        });
    };

    useEffect(() => {
        id && queryStateQlty({ onFetchingDetail: true });
    }, []);

    useEffect(() => {
        router.query && queryStateQlty({ onFetching: true });
    }, [router.query]);

    useEffect(() => {
        if (isStateQlty.idBranch !== null) {
            queryStateQlty({ errBranch: false, onFetchingItemsAll: true });
        }
    }, [isStateQlty.idBranch]);

    useEffect(() => {
        isStateQlty.onFetchingItemsAll && _ServerFetching_ItemsAll();
    }, [isStateQlty.onFetchingItemsAll]);

    const _DataValueItem = (value) => {
        return {
            parent: {
                id: uuidv4(),
                matHang: value,
                idParenBackend: "",
                unit: value?.e?.unit_name,
                quantityQc: 1,
                quantityReached: 1,
                quantityError: 0,
                date: isStateQlty.dateAll ? isStateQlty.dateAll : "",
                note: null,
            },
        };
    };

    const _HandleAddParent = (value) => {
        const checkData = isStateQlty.listData?.some((e) => e?.matHang?.value == value?.value);
        if (!checkData) {
            const { parent } = _DataValueItem(value);
            queryStateQlty({ listData: [parent, ...isStateQlty.listData] });
            return;
        }
        isShow("error", `${dataLang?.returns_err_ItemSelect || "returns_err_ItemSelect"}`);
    };

    const _HandleDeleteParent = (parentId) => {
        const newData = isStateQlty.listData.filter((e) => e?.id != parentId);
        queryStateQlty({ listData: [...newData] });
    };

    const _HandleChangeChild = (parentId, type, value) => {
        const newData = isStateQlty.listData.map((e) => {
            if (e?.id == parentId) {
                switch (type) {
                    case "quantityQc":
                        e.quantityQc = +value?.value;
                        break;
                    case "quantityError":
                        e.quantityError = +value?.value;
                        break;
                    default:
                }
                e.quantityReached = +e.quantityQc - +e.quantityError;
            }
            return e;
        });
        queryStateQlty({ listData: [...newData] });
    };
    const _HandleChangeValue = (parentId, value) => {
        const checkData = isStateQlty.listData?.some((e) => e?.matHang?.value == value?.value);
        if (!checkData) {
            const newData = isStateQlty.listData?.map((e) => {
                if (e?.id === parentId) {
                    const { parent } = _DataValueItem(value);
                    return parent;
                }
                return e;
            });
            queryStateQlty({ listData: [...newData] });
            return;
        }
        isShow("error", `${dataLang?.returns_err_ItemSelect || "returns_err_ItemSelect"}`);
    };

    const selectItemsLabel = (option) => {
        return (
            <div className="py-1">
                <div className="flex items-center gap-1">
                    <div className="w-[40px] h-[50px]">
                        {option.e?.images != null ? (
                            <img
                                src={option.e?.images}
                                alt="Product Image"
                                className="max-w-[40px] h-[50px] text-[8px] object-cover rounded"
                            />
                        ) : (
                            <div className=" w-[40px] h-[50px] object-cover  flex items-center justify-center rounded">
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
                            {option.e?.item_name}
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
        );
    };

    const handleErrors = (errors, dataLang) => {
        queryStateQlty(errors);
        if (errors.errBranch || errors.errDetailedProduction) {
            isShow("error", `${dataLang?.required_field_null}`);
        } else if (errors.isEmpty) {
            isShow("error", `Chưa nhập thông tin mặt hàng`);
        } else {
            isShow("error", `${dataLang?.required_field_null}`);
        }
    };

    const _HandleSubmit = (e) => {
        e.preventDefault();
        const { listData, idBranch, idDetailedProduction, errDetailedProduction } = isStateQlty;

        const checkNullQuantity = (property) => listData.some((e) => !e[property] || e[property] == 0);

        const hasNullQuantityQc = checkNullQuantity("quantity");

        const hasNullDate = listData.some((e) => e.date == null || e.date == "");

        const isEmpty = listData?.length == 0;

        const checkConditions = [!idBranch, !idDetailedProduction, hasNullQuantityQc, isEmpty, hasNullDate].some(
            (condition) => condition
        );

        if (checkConditions) {
            const errors = {
                errBranch: !idBranch,
                errQuantityQc: hasNullQuantityQc,
                errDetailedProduction: !errDetailedProduction,
                errDate: hasNullDate,
            };
            handleErrors(errors, dataLang);
            return;
        }
        queryStateQlty({ onSending: true });
    };
    const _ServerSending = async () => {
        // let formData = new FormData();
        // formData.append("reference_no", isStateQlty.code ? isStateQlty.code : "");
        // formData.append(
        //     "date",
        //     moment(isStateQlty.date).format("YYYY-MM-DD HH:mm:ss")
        //         ? moment(isStateQlty.date).format("YYYY-MM-DD HH:mm:ss")
        //         : ""
        // );
        // formData.append("branch_id", isStateQlty.idBranch?.value ? isStateQlty.idBranch?.value : "");
        // formData.append("plan_name", isStateQlty.namePlan ? isStateQlty.namePlan : "");
        // formData.append("note", isStateQlty.note ? isStateQlty.note : "");
        // listData.forEach((item, index) => {
        //     formData.append(`items[${index}][id]`, id ? item?.idParenBackend : "");
        //     formData.append(`items[${index}][item_id]`, item?.matHang?.value);
        //     formData.append(`items[${index}][quantity]`, item?.quantity ? item?.quantity : "");
        //     formData.append(`items[${index}][date_needed]`, item?.date ? moment(item?.date).format("DD/MM/YYYY") : "");
        //     formData.append(`items[${index}][note_item]`, item?.note ? item?.note : "");
        // });
        // const url = id
        //     ? `/api_web/api_internal_plan/handling/${id}?csrf_protection=true`
        //     : "/api_web/api_internal_plan/handling?csrf_protection=true";
        // const { isSuccess, message } = await apiInternalPlan.apiHandlingInternalPlan(url, formData);
        // if (isSuccess) {
        //     isShow("success", `${dataLang[message] || message}`);
        //     resetAllStates();
        //     sListData([]);
        //     router.push(routerInternalPlan.home);
        // } else {
        //     isShow("error", `${dataLang[message] || data?.message}`);
        // }
        // sFetchingData((e) => ({ ...e, onSending: false }));
    };

    useEffect(() => {
        isStateQlty.onSending && _ServerSending();
    }, [isStateQlty.onSending]);

    // breadcrumb
    const breadcrumbItems = [
        {
            label: `QC`,
            // href: "/",
        },
        {
            label: `Phiếu kiểm tra chất lượng`,
            href: "/manufacture/check-quality",
        },
        {
            label: id ? "Sửa phiếu kiểm tra chất lượng" : "Tạo phiếu kiểm tra chất lượng",
        },
    ];
    return (
        <React.Fragment>
            <Head>
                <title>{id ? "Sửa phiếu kiểm tra chất lượng" : "Tạo phiếu kiểm tra chất lượng"}</title>
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
                            {id ? "Sửa phiếu kiểm tra chất lượng" : "Tạo phiếu kiểm tra chất lượng"}
                        </h2>
                        <div className="flex items-center justify-end mr-2">
                            <ButtonBack onClick={() => router.push(routerQc.home)} dataLang={dataLang} />
                        </div>
                    </div>

                    <div className="w-full rounded ">
                        <div className="">
                            <h2 className="font-normal bg-[#ECF0F4] p-2 ">
                                {dataLang?.purchase_order_detail_general_informatione ||
                                    "purchase_order_detail_general_informatione"}
                            </h2>
                            <div className="grid items-center grid-cols-8 gap-3 mt-2">
                                <div className="col-span-2">
                                    <label className="text-[#344054] font-normal text-sm mb-1 ">
                                        {dataLang?.import_code_vouchers || "import_code_vouchers"}{" "}
                                    </label>
                                    <input
                                        value={isStateQlty.code}
                                        onChange={(e) => {
                                            queryStateQlty({ code: e.target.value });
                                        }}
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
                                            showTimeSelect
                                            selected={isStateQlty.date}
                                            // onSelect={(date) => sIdChange((e) => ({ ...e, date: date }))}
                                            onChange={(e) => {
                                                queryStateQlty({ date: e });
                                            }}
                                            placeholderText="DD/MM/YYYY HH:mm:ss"
                                            dateFormat="dd/MM/yyyy h:mm:ss aa"
                                            timeInputLabel={"Time: "}
                                            placeholder={
                                                dataLang?.price_quote_system_default || "price_quote_system_default"
                                            }
                                            className={`border ${"focus:border-[#92BFF7] border-[#d0d5dd]"} placeholder:text-slate-300 w-full z-[999] bg-[#ffffff] rounded text-[#52575E] font-normal p-2 outline-none cursor-pointer `}
                                        />
                                        {isStateQlty.date && (
                                            <>
                                                <MdClear
                                                    className="absolute right-0 -translate-x-[320%] translate-y-[1%] h-10 text-[#CCCCCC] hover:text-[#999999] scale-110 cursor-pointer"
                                                    onClick={() => {
                                                        queryStateQlty({ date: undefined });
                                                    }}
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
                                        options={isStateQlty.dataBranch}
                                        onChange={(e) => {
                                            if (isStateQlty.idBranch && isStateQlty.listData?.length > 0) {
                                                checkListData(e);
                                            } else {
                                                queryStateQlty({ idBranch: e });
                                            }
                                        }}
                                        value={isStateQlty.idBranch}
                                        isLoading={isStateQlty.idBranch != null ? false : isStateQlty.onLoading}
                                        isClearable={true}
                                        closeMenuOnSelect={true}
                                        hideSelectedOptions={false}
                                        placeholder={dataLang?.import_branch || "import_branch"}
                                        className={`${isStateQlty.errBranch ? "border-red-500" : "border-transparent"
                                            } placeholder:text-slate-300 w-full z-30 bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border `}
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
                                                // zIndex: 9999, // Giá trị z-index tùy chỉnh
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
                                    {isStateQlty.errBranch && (
                                        <label className="text-sm text-red-500">
                                            {dataLang?.purchase_order_errBranch || "purchase_order_errBranch"}
                                        </label>
                                    )}
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[#344054] font-normal text-sm mb-1 ">
                                        {"Lệnh sản xuất tổng"} <span className="text-red-500">*</span>
                                    </label>
                                    <SelectCore
                                        options={isStateQlty.dataDetailedProduction}
                                        onChange={(e) => {
                                            queryStateQlty({ idDetailedProduction: e });
                                        }}
                                        value={isStateQlty.idDetailedProduction}
                                        isLoading={
                                            isStateQlty.idDetailedProduction != null ? false : isStateQlty.onLoading
                                        }
                                        isClearable={true}
                                        closeMenuOnSelect={true}
                                        hideSelectedOptions={false}
                                        placeholder={"Lệnh sản xuất tổng"}
                                        className={`${isStateQlty.errDetailedProduction ? "border-red-500" : "border-transparent"
                                            } placeholder:text-slate-300 w-full z-30 bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border `}
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
                                                // zIndex: 9999, // Giá trị z-index tùy chỉnh
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
                                    {isStateQlty.errDetailedProduction && (
                                        <label className="text-sm text-red-500">{"Vui lòng chọn LSX chi tiết"}</label>
                                    )}
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[#344054] font-normal text-sm mb-1 ">
                                        {"Kho QC"} <span className="text-red-500">*</span>
                                    </label>
                                    <SelectCore
                                        options={[]}
                                        // onChange={(e) => {
                                        //     queryStateQlty({ idDetailedProduction: e });
                                        // }}
                                        // value={isStateQlty.idDetailedProduction}
                                        // isLoading={
                                        //     isStateQlty.idDetailedProduction != null ? false : isStateQlty.onLoading
                                        // }
                                        isClearable={true}
                                        closeMenuOnSelect={true}
                                        hideSelectedOptions={false}
                                        placeholder={"Kho QC"}
                                        className={`${isStateQlty.errDetailedProduction ? "border-red-500" : "border-transparent"
                                            } placeholder:text-slate-300 w-full z-30 bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border `}
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
                                                // zIndex: 9999, // Giá trị z-index tùy chỉnh
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
                                    {isStateQlty.errDetailedProduction && (
                                        <label className="text-sm text-red-500">{"Vui lòng chọn kho QC"}</label>
                                    )}
                                </div>
                                <div className="col-span-2">
                                    <label className="text-[#344054] font-normal text-sm mb-1 ">
                                        {"Kho lỗi"} <span className="text-red-500">*</span>
                                    </label>
                                    <SelectCore
                                        options={[]}
                                        // onChange={(e) => {
                                        //     queryStateQlty({ idDetailedProduction: e });
                                        // }}
                                        // value={isStateQlty.idDetailedProduction}
                                        // isLoading={
                                        //     isStateQlty.idDetailedProduction != null ? false : isStateQlty.onLoading
                                        // }
                                        isClearable={true}
                                        closeMenuOnSelect={true}
                                        hideSelectedOptions={false}
                                        placeholder={"Kho lỗi"}
                                        className={`${isStateQlty.errDetailedProduction ? "border-red-500" : "border-transparent"
                                            } placeholder:text-slate-300 w-full z-30 bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border `}
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
                                                // zIndex: 9999, // Giá trị z-index tùy chỉnh
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
                                    {isStateQlty.errDetailedProduction && (
                                        <label className="text-sm text-red-500">{"Vui lòng chọn kho lỗi"}</label>
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
                            <div className="grid grid-cols-7">
                                <h4 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] px-2  text-[#667085] uppercase  col-span-1    text-center  truncate font-[400]">
                                    {"Công đoạn"}
                                </h4>
                                <h4 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] px-2  text-[#667085] uppercase  col-span-1    text-center  truncate font-[400]">
                                    {"ĐVT"}
                                </h4>
                                <h4 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] px-2  text-[#667085] uppercase  col-span-1    text-center  truncate font-[400]">
                                    {"Số lượng QC"}
                                </h4>
                                <h4 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] px-2  text-[#667085] uppercase  col-span-1    text-center    truncate font-[400]">
                                    {"Số lượng lỗi"}
                                </h4>
                                <h4 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] px-2  text-[#667085] uppercase  col-span-1    text-center  truncate font-[400]">
                                    {"Số lượng đạt"}
                                </h4>
                                <h4 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] px-2  text-[#667085] uppercase  col-span-1    text-center    truncate font-[400]">
                                    {"Chi tiết lỗi"}
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
                                options={isStateQlty.dataItems}
                                value={null}
                                onInputChange={(e) => {
                                    _HandleSeachApi(e);
                                }}
                                onChange={_HandleAddParent.bind(this)}
                                className="col-span-2 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]"
                                placeholder={dataLang?.returns_items || "returns_items"}
                                noOptionsMessage={() => dataLang?.returns_nodata || "returns_nodata"}
                                menuPortalTarget={document.body}
                                formatOptionLabel={selectItemsLabel}
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
                            <div className="grid grid-cols-7 border-t border-b border-l border-r divide-x rounded">
                                <div className="col-span-1">
                                    <SelectCore
                                        classNamePrefix="customDropdowDefault"
                                        placeholder={"Công đoạn"}
                                        className="3xl:text-[12px] border-none outline-none 2xl:text-[10px] xl:text-[9.5px] text-[9px]"
                                        isDisabled={true}
                                    />
                                </div>
                                <div className="col-span-1"></div>
                                <div className="flex items-center justify-center col-span-1">
                                    <button className=" text-gray-400 hover:bg-[#e2f0fe] hover:text-gray-600 font-bold flex items-center justify-center 3xl:p-0 2xl:p-0 xl:p-0 p-0 bg-slate-200 rounded-full">
                                        <Minus className="scale-50 2xl:scale-100 xl:scale-100" size="16" />
                                    </button>
                                    <div className=" text-center 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]  3xl:px-1 2xl:px-0.5 xl:px-0.5 p-0 font-normal 3xl:w-24 2xl:w-[60px] xl:w-[50px] w-[40px]  focus:outline-none border-b border-gray-200">
                                        1
                                    </div>
                                    <button className=" text-gray-400 hover:bg-[#e2f0fe] hover:text-gray-600 font-bold flex items-center justify-center 3xl:p-0 2xl:p-0 xl:p-0 p-0 bg-slate-200 rounded-full">
                                        <Add className="scale-50 2xl:scale-100 xl:scale-100" size="16" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-center col-span-1">
                                    <button className=" text-gray-400 hover:bg-[#e2f0fe] hover:text-gray-600 font-bold flex items-center justify-center 3xl:p-0 2xl:p-0 xl:p-0 p-0 bg-slate-200 rounded-full">
                                        <Minus className="scale-50 2xl:scale-100 xl:scale-100" size="16" />
                                    </button>
                                    <div className=" text-center 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]  3xl:px-1 2xl:px-0.5 xl:px-0.5 p-0 font-normal 3xl:w-24 2xl:w-[60px] xl:w-[50px] w-[40px]  focus:outline-none border-b border-gray-200">
                                        1
                                    </div>
                                    <button className=" text-gray-400 hover:bg-[#e2f0fe] hover:text-gray-600 font-bold flex items-center justify-center 3xl:p-0 2xl:p-0 xl:p-0 p-0 bg-slate-200 rounded-full">
                                        <Add className="scale-50 2xl:scale-100 xl:scale-100" size="16" />
                                    </button>
                                </div>
                                <div className="col-span-1 flex justify-center items-center 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]">
                                    1
                                </div>
                                <input
                                    placeholder={"Chi tiết lỗi"}
                                    disabled
                                    className=" disabled:bg-gray-50 text-center col-span-1 placeholder:text-slate-300 w-full bg-[#ffffff] 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]  p-[11px] "
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
                    <div className="min-h-[400px] max-h-[400px] overflow-y-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                        <div className="h-[100%] w-full">
                            {isStateQlty.onFetchingDetail ? (
                                <Loading className="w-full h-10" color="#0f4f9e" />
                            ) : (
                                <>
                                    {isStateQlty.listData?.map((e) => (
                                        <div key={e?.id?.toString()} className="grid items-center grid-cols-12 my-1 ">
                                            <div className="h-full col-span-3 ">
                                                <div className="relative">
                                                    <SelectCore
                                                        options={isStateQlty.dataItems}
                                                        value={e?.matHang}
                                                        onInputChange={(event) => {
                                                            _HandleSeachApi(event);
                                                        }}
                                                        className=""
                                                        onChange={_HandleChangeValue.bind(this, e?.id)}
                                                        menuPortalTarget={document.body}
                                                        formatOptionLabel={selectItemsLabel}
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
                                            </div>
                                            <div className="grid items-center grid-cols-7 col-span-9 ml-1 border divide-x">
                                                <div className="col-span-1 flex justify-center  h-full py-0.5 px-1 flex-col items-center ">
                                                    <SelectCore
                                                        options={[]}
                                                        value={null}
                                                        // isLoading={ce?.location != null ? false : onLoadingChild}
                                                        // onChange={_HandleChangeChild.bind(
                                                        //     this,
                                                        //     e?.id,
                                                        //     ce?.id,
                                                        //     "location"
                                                        // )}
                                                        className={`
                                                            ${
                                                            // errWarehouse && ce?.location == null
                                                            //     ? "border-red-500 border"
                                                            //     : ""
                                                            ""
                                                            } 
                                                         my-1 3xl:text-[12px] 2xl:text-[10px] cursor-pointer xl:text-[9.5px] text-[9px] placeholder:text-slate-300 w-full  rounded text-[#52575E] font-normal `}
                                                        placeholder={"Công đoạn"}
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
                                                                <div className="flex gap-1">
                                                                    {/* {option?.qty && (
                                                                        <h2 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] font-medium">
                                                                            {dataLang?.returns_survive ||
                                                                                "returns_survive"}
                                                                            :
                                                                        </h2>
                                                                    )}
                                                                    <h2 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] uppercase font-semibold">
                                                                        {option?.qty && formatNumber(option?.qty)}
                                                                    </h2> */}
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
                                                <div className="flex items-center justify-center col-span-1 py-5 text-sm">
                                                    {e.unit}
                                                </div>
                                                <div className="relative col-span-1 py-5">
                                                    <div className="flex items-center justify-center h-full p-0.5">
                                                        <button
                                                            disabled={
                                                                e.quantityQc === 1 ||
                                                                e.quantityQc === "" ||
                                                                e.quantityQc === null ||
                                                                e.quantityQc === 0
                                                            }
                                                            className=" text-gray-400 hover:bg-[#e2f0fe] hover:text-gray-600 font-bold flex items-center justify-center 3xl:p-0 2xl:p-0 xl:p-0 p-0 bg-slate-200 rounded-full"
                                                            onClick={() => {
                                                                _HandleChangeChild(e?.id, "quantityQc", {
                                                                    value: e.quantityQc - 1,
                                                                });
                                                            }}
                                                        >
                                                            <Minus
                                                                className="scale-50 2xl:scale-100 xl:scale-100"
                                                                size="16"
                                                            />
                                                        </button>
                                                        <InPutNumericFormat
                                                            onValueChange={(event) =>
                                                                _HandleChangeChild(e?.id, "quantityQc", event)
                                                            }
                                                            value={e.quantityQc}
                                                            className={`${isStateQlty.errQuantityQc &&
                                                                (e.quantityQc == null ||
                                                                    e.quantityQc == "" ||
                                                                    e.quantityQc == 0)
                                                                ? "border-b border-red-500"
                                                                : "border-b border-gray-200"
                                                                }
                                                                ${e.quantityQc == null ||
                                                                    e.quantityQc == "" ||
                                                                    e.quantityQc == 0
                                                                    ? "border-b border-red-500"
                                                                    : "border-b border-gray-200"
                                                                }
                                                                appearance-none text-center 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] 3xl:px-1 2xl:px-0.5 xl:px-0.5 p-0 font-normal 3xl:w-24 2xl:w-[60px] xl:w-[50px] w-[40px]  focus:outline-none `}
                                                            isAllowed={isAllowedNumber}
                                                        />
                                                        <button
                                                            className=" text-gray-400 hover:bg-[#e2f0fe] hover:text-gray-600 font-bold flex items-center justify-center 3xl:p-0 2xl:p-0 xl:p-0 p-0 bg-slate-200 rounded-full"
                                                            onClick={() => {
                                                                _HandleChangeChild(e?.id, "quantityQc", {
                                                                    value: e.quantityQc + 1,
                                                                });
                                                            }}
                                                        >
                                                            <Add
                                                                className="scale-50 2xl:scale-100 xl:scale-100"
                                                                size="16"
                                                            />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="relative col-span-1 py-5">
                                                    <div className="flex items-center justify-center h-full p-0.5">
                                                        <button
                                                            disabled={
                                                                e.quantityError === 1 ||
                                                                e.quantityError === "" ||
                                                                e.quantityError === null ||
                                                                e.quantityError === 0
                                                            }
                                                            className=" text-gray-400 hover:bg-[#e2f0fe] hover:text-gray-600 font-bold flex items-center justify-center 3xl:p-0 2xl:p-0 xl:p-0 p-0 bg-slate-200 rounded-full"
                                                            onClick={() => {
                                                                _HandleChangeChild(e?.id, "quantityError", {
                                                                    value: e.quantityError - 1,
                                                                });
                                                            }}
                                                        >
                                                            <Minus
                                                                className="scale-50 2xl:scale-100 xl:scale-100"
                                                                size="16"
                                                            />
                                                        </button>
                                                        <InPutNumericFormat
                                                            onValueChange={(event) =>
                                                                _HandleChangeChild(e?.id, "quantityError", event)
                                                            }
                                                            value={e.quantityError}
                                                            className={`border-b border-gray-200 appearance-none text-center 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] 3xl:px-1 2xl:px-0.5 xl:px-0.5 p-0 font-normal 3xl:w-24 2xl:w-[60px] xl:w-[50px] w-[40px]  focus:outline-none `}
                                                            isAllowed={isAllowedNumber}
                                                        />
                                                        <button
                                                            className=" text-gray-400 hover:bg-[#e2f0fe] hover:text-gray-600 font-bold flex items-center justify-center 3xl:p-0 2xl:p-0 xl:p-0 p-0 bg-slate-200 rounded-full"
                                                            onClick={() => {
                                                                _HandleChangeChild(e?.id, "quantityError", {
                                                                    value: e.quantityError + 1,
                                                                });
                                                            }}
                                                        >
                                                            <Add
                                                                className="scale-50 2xl:scale-100 xl:scale-100"
                                                                size="16"
                                                            />
                                                        </button>
                                                    </div>
                                                </div>
                                                {/* e.quantityReached === "" || */}
                                                <div className="flex items-center justify-center h-full p-0.5 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]">
                                                    {formatNumber(e.quantityReached) || 0}
                                                </div>
                                                <div className="flex items-center justify-center col-span-1 py-4 ">
                                                    <PopupDetailError
                                                        dataLang={dataLang}
                                                        name={`Chi tiết lỗi ${e?.dataDetailError?.length > 0
                                                            ? `(${e?.dataDetailError?.length})`
                                                            : ""
                                                            }`}
                                                        data={isStateQlty.listData}
                                                        id={e?.id}
                                                        quantityError={e.quantityError}
                                                        queryStateQlty={queryStateQlty}
                                                        className={`px-4 py-1.5 rounded-2xl ${e?.dataDetailError && e?.dataDetailError?.length > 0
                                                            ? "bg-blue-300 hover:bg-blue-500/80 text-blue-600 hover:text-white"
                                                            : "bg-gray-300 hover:bg-gray-500/80 text-gray-600 hover:text-white"
                                                            } hover:scale-105 text-xs font-medium text-[9px] text-center   transition-all ease-linear cursor-pointer`}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-center h-full col-span-1">
                                                    <div>
                                                        <button
                                                            title="Xóa"
                                                            onClick={_HandleDeleteParent.bind(this, e.id)}
                                                            className="flex items-center justify-center p-1 text-red-500 transition-all ease-linear rounded-md hover:scale-110 bg-red-50 hover:bg-red-200 animate-bounce-custom"
                                                        >
                                                            <IconDelete size={24} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                    <h2 className="font-normal bg-[white]  p-2 border-b border-b-[#a9b5c5]  border-t border-t-[#a9b5c5]">
                        {dataLang?.purchase_order_table_total_outside || "purchase_order_table_total_outside"}{" "}
                    </h2>
                </div>
                <div className="grid grid-cols-12">
                    <div className="col-span-9">
                        <div className="text-[#344054] font-normal text-sm mb-1 ">
                            {dataLang?.returns_reason || "returns_reason"}
                        </div>
                        <textarea
                            value={isStateQlty.note}
                            placeholder={dataLang?.returns_reason || "returns_reason"}
                            onChange={(e) => {
                                queryStateQlty({ note: e.target.value });
                            }}
                            name="fname"
                            type="text"
                            className="focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-[40%] min-h-[220px] max-h-[220px] bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-2 border outline-none "
                        />
                    </div>
                    <div className="flex-col justify-between col-span-3 mt-5 space-y-4 text-right ">
                        <div className="flex justify-between "></div>
                        <div className="flex justify-between ">
                            <div className="font-normal ">
                                <h3>{"Tổng số lượng QC"}</h3>
                            </div>
                            <div className="font-normal">
                                <h3 className="text-blue-600">
                                    {formatNumber(
                                        isStateQlty.listData?.reduce((accumulator, item) => {
                                            return accumulator + item.quantity;
                                        }, 0)
                                    )}
                                </h3>
                            </div>
                        </div>
                        <div className="flex justify-between ">
                            <div className="font-normal ">
                                <h3>{"Tổng số lượng đạt"}</h3>
                            </div>
                            <div className="font-normal">
                                <h3 className="text-blue-600">
                                    {formatNumber(
                                        isStateQlty.listData?.reduce((accumulator, item) => {
                                            return accumulator + item.quantity;
                                        }, 0)
                                    )}
                                </h3>
                            </div>
                        </div>
                        <div className="flex justify-between ">
                            <div className="font-normal ">
                                <h3>{"Tổng số lượng lỗi"}</h3>
                            </div>
                            <div className="font-normal">
                                <h3 className="text-blue-600">
                                    {formatNumber(
                                        isStateQlty.listData?.reduce((accumulator, item) => {
                                            return accumulator + item.quantity;
                                        }, 0)
                                    )}
                                </h3>
                            </div>
                        </div>
                        <div className="space-x-2">
                            <ButtonBack onClick={() => router.push(routerQc.home)} dataLang={dataLang} />
                            <ButtonSubmit loading={isStateQlty.onSending} onClick={(e) => _HandleSubmit(e)} dataLang={dataLang} />
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
                nameModel={"change_item"}
                save={handleSaveStatus}
                cancel={handleCancleStatus}
            />
        </React.Fragment>
    );
};

export default CheckQualityForm;
