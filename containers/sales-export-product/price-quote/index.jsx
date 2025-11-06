import apiPriceQuocte from "@/Api/apiSalesExportProduct/priceQuote/apiPriceQuocte";
import { BtnAction } from "@/components/UI/BtnAction";
import TabFilter from "@/components/UI/TabFilter";
import OnResetData from "@/components/UI/btnResetData/btnReset";
import { BtnStatusApproved } from "@/components/UI/btnStatusApproved/BtnStatusApproved";
import ButtonAddNew from "@/components/UI/button/buttonAddNew";
import ContainerPagination from "@/components/UI/common/ContainerPagination/ContainerPagination";
import TitlePagination from "@/components/UI/common/ContainerPagination/TitlePagination";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import { EmptyExprired } from "@/components/UI/common/EmptyExprired";
import { ColumnTable, HeaderTable, RowItemTable, RowTable } from "@/components/UI/common/Table";
import TagBranch from "@/components/UI/common/Tag/TagBranch";
import { Container, ContainerBody, ContainerFilterTab, ContainerTable, ContainerTotal, } from "@/components/UI/common/layout";
import DropdowLimit from "@/components/UI/dropdowLimit/dropdowLimit";
import DateToDateComponent from "@/components/UI/filterComponents/dateTodateComponent";
import ExcelFileComponent from "@/components/UI/filterComponents/excelFilecomponet";
import SearchComponent from "@/components/UI/filterComponents/searchComponent";
import SelectComponent from "@/components/UI/filterComponents/selectComponent";
import Loading from "@/components/UI/loading/loading";
import NoData from "@/components/UI/noData/nodata";
import Pagination from "@/components/UI/pagination";
import PopupConfim from "@/components/UI/popupConfim/popupConfim";
import { CONFIRMATION_OF_CHANGES, TITLE_STATUS } from "@/constants/changeStatus/changeStatus";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import { WARNING_STATUS_ROLE } from "@/constants/warningStatus/warningStatus";
import { useBranchList } from "@/hooks/common/useBranch";
import { useClientCombobox } from "@/hooks/common/useClients";
import useSetingServer from "@/hooks/useConfigNumber";
import { useLimitAndTotalItems } from "@/hooks/useLimitAndTotalItems";
import usePagination from "@/hooks/usePagination";
import useActionRole from "@/hooks/useRole";
import useStatusExprired from "@/hooks/useStatusExprired";
import useTab from "@/hooks/useTab";
import useToast from "@/hooks/useToast";
import { useToggle } from "@/hooks/useToggle";
import { routerPriceQuote } from "@/routers/sellingGoods";
import { formatMoment } from "@/utils/helpers/formatMoment";
import formatMoney from "@/utils/helpers/formatMoney";
import { useMutation } from "@tanstack/react-query";
import vi from "date-fns/locale/vi";
import { Grid6, TickCircle } from "iconsax-react";
import { debounce } from "lodash";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useSelector } from "react-redux";
import PopupDetailQuote from "./components/PopupDetailQuote";
import { usePriceQuocteListFilterbar } from "./hooks/usePriceQuocteListFilterbar";
import { usePriceQuoteCombobox } from "./hooks/usePriceQuoteCombobox";
import { usePriceQuoteList } from "./hooks/usePriceQuoteList";
registerLocale("vi", vi);

const initData = {
    keySearch: "",
    keySearchCode: "",
    keySearchCient: "",
    idBranch: null,
    idQuoteCode: null,
    idCustomer: null,
    refreshing: false,
    valueDate: { startDate: null, endDate: null },
};
const PriceQuote = (props) => {
    const dataLang = props.dataLang;

    const router = useRouter();

    const isShow = useToast();

    const { handleTab } = useTab();

    const { paginate } = usePagination();

    const dataSeting = useSetingServer();

    const statusExprired = useStatusExprired();

    const [isState, sIsState] = useState(initData);

    const { limit, updateLimit: sLimit } = useLimitAndTotalItems();

    const { isOpen, isId, isIdChild: status, handleQueryId } = useToggle();

    const { is_admin: role, permissions_current: auth } = useSelector((state) => state.auth);

    const { checkAdd, checkExport } = useActionRole(auth, "price_quote");

    const queryState = (key) => sIsState((prev) => ({ ...prev, ...key }));

    const formatNumber = (number) => {
        return formatMoney(+number, dataSeting);
    };

    const params = {
        search: isState.keySearch,
        limit: limit,
        page: router.query?.page || 1,
        "filter[branch_id]": isState.idBranch != null ? isState.idBranch.value : null,
        "filter[id]": isState.idQuoteCode != null ? isState.idQuoteCode?.value : null,
        "filter[status_bar]": router.query?.tab ?? null,
        "filter[client_id]": isState.idCustomer ? isState.idCustomer.value : null,
        "filter[start_date]": isState.valueDate?.startDate != null ? isState.valueDate?.startDate : null,
        "filter[end_date]": isState.valueDate?.endDate != null ? isState.valueDate?.endDate : null,
    }

    const paramsFilter = {
        limit: 0,
        search: isState.keySearch,
        "filter[branch_id]": isState.idBranch != null ? isState.idBranch.value : null,
    }

    const { data: listBr = [] } = useBranchList({});

    const { data: listCustomer = [] } = useClientCombobox(isState.keySearchCient)

    const { data: dataPriceQuoteCombobox = [] } = usePriceQuoteCombobox(isState.keySearchCode);

    const { data: dataPriceQuote, isLoading, isFetching, refetch } = usePriceQuoteList(params);

    const { data: dataFilter, refetch: refetchFilter } = usePriceQuocteListFilterbar(paramsFilter)

    const handleSearchClientsApi = debounce(async (value) => {
        queryState({ keySearchCient: value });
    }, 500);

    const handleSearchApi = debounce(async (value) => {
        queryState({ keySearchCode: value });
    }, 500);

    const _HandleOnChangeKeySearch = debounce(({ target: { value } }) => {
        queryState({ keySearch: value });
        router.replace({
            pathname: router.route,
            query: {
                tab: router.query?.tab,
            },
        });
    }, 500);

    // excel
    const multiDataSet = [
        {
            columns: [
                {
                    title: "ID",
                    width: { wch: 4 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.price_quote_date || "price_quote_date"}`,
                    width: { wpx: 100 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.price_quote_code || "price_quote_code"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.price_quote_customer || "price_quote_customer"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.price_quote_total || "price_quote_total"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.price_quote_tax_money || "price_quote_tax_money"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.price_quote_into_money || "price_quote_into_money"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.price_quote_effective_date || "price_quote_effective_date"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.price_quote_order_status || "price_quote_order_status"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.price_quote_branch || "price_quote_branch"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.price_quote_note || "price_quote_note"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
            ],
            data: dataPriceQuote?.rResult?.map((e) => [
                { value: `${e?.id ? e.id : ""}`, style: { numFmt: "0" } },
                { value: `${e?.date ? e?.date : ""}` },
                { value: `${e?.reference_no ? e?.reference_no : ""}` },
                { value: `${e?.client_name ? e?.client_name : ""}` },
                // tiền chưa!
                {
                    value: `${e?.total_price ? formatNumber(e?.total_price) : ""}`,
                },
                {
                    value: `${e?.total_tax_price ? formatNumber(e?.total_tax_price) : ""}`,
                },
                {
                    value: `${e?.total_amount ? formatNumber(e?.total_amount) : ""}`,
                },

                { value: `${e?.validity ? e?.validity : ""}` },
                // order status chưa
                // {value: `${e?.import_status ? e?.import_status === "0" && "Chưa chi" || e?.import_status === "1" && "Chi 1 phần" ||  e?.import_status === "2"  &&"Đã chi đủ" : ""}`},
                {
                    value: `${e?.status
                        ? (e?.status === "not_confirmed" && "Chưa duyệt") ||
                        (e?.status === "confirmed" && "Đã duyệt") ||
                        (e?.status === "no_confirmed" && "Không duyệt") ||
                        (e?.status === "ordered" && "Đã tạo đơn đặt hàng")
                        : ""
                        }`,
                },

                { value: `${e?.branch_name ? e?.branch_name : ""}` },
                { value: `${e?.note ? e?.note : ""}` },
            ]),
        },
    ];
    // chuyen doi trang thai don bao gia
    const handleDelete = () => {
        const index = dataPriceQuote?.rResult.findIndex((x) => x.id === isId);

        let newStatus = "";

        if (dataPriceQuote?.rResult[index].status === "not_confirmed") {
            newStatus = "confirmed";
        } else if (dataPriceQuote?.rResult[index].status === "confirmed") {
            newStatus = "not_confirmed";
        } else if (dataPriceQuote?.rResult[index].status === "no_confirmed") {
            newStatus = "confirmed";
        }

        _ServerPostStatus(isId, newStatus);

        handleQueryId({ status: false });
    };

    const handleNoconfim = () => {
        const index = dataPriceQuote?.rResult.findIndex((x) => x.id === isId);

        const newStatus = dataPriceQuote?.rResult[index].status === "no_confirmed" ? "not_confirmed" : "no_confirmed";

        _ServerPostStatus(isId, newStatus);

        handleQueryId({ status: false });
    };

    const handleToggleOrdered = (id) => {
        const index = dataPriceQuote?.rResult.findIndex((x) => x.id === id);

        if (dataPriceQuote?.rResult[index].status === "ordered") {
            isShow("error", `${dataLang?.no_change_status_when_order || "no_change_status_when_order"}`);
        }
    };

    const handingStatus = useMutation({
        mutationFn: ({ data, id, stt }) => {
            return apiPriceQuocte.apiHandingStatus(id, stt, data)
        }
    })

    const _ServerPostStatus = (id, newStatus) => {
        const formData = new FormData();

        formData.append("id", id);

        formData.append("status", newStatus);

        handingStatus.mutate({ data: formData, id: id, stt: newStatus }, {
            onSuccess: async ({ isSuccess }) => {
                if (isSuccess !== false) {
                    isShow("success", `${dataLang?.change_status_when_order || "change_status_when_order"}`);
                    queryState({ refreshing: true })
                    await refetch();
                    await refetchFilter();
                    queryState({ refreshing: false })
                }
            },
            onError: (err) => {
            },
        })
    };

    // search

    return (
        <React.Fragment>
            <Head>
                <title>{dataLang?.price_quote || "price_quote"} </title>
            </Head>
            <Container>
                {statusExprired ? (
                    <EmptyExprired />
                ) : (
                    <div className="flex space-x-1 mt-4 3xl:text-sm 2xl:text-[11px] xl:text-[10px] lg:text-[10px]">
                        <h6 className="text-[#141522]/40">{dataLang?.price_quote || "price_quote"}</h6>
                        <span className="text-[#141522]/40">/</span>
                        <h6>{dataLang?.price_quote_list || "price_quote"}</h6>
                    </div>
                )}

                <ContainerBody>
                    <div className="space-y-0.5 h-[96%] overflow-hidden">
                        <div className="flex justify-between mt-1 mr-2">
                            <h2 className=" 2xl:text-lg text-base text-[#52575E] capitalize">
                                {dataLang?.price_quote || "price_quote"}
                            </h2>
                            <ButtonAddNew
                                onClick={() => {
                                    if (role) {
                                        router.push(routerPriceQuote.form);
                                    } else if (checkAdd) {
                                        router.push(routerPriceQuote.form);
                                    } else {
                                        isShow("error", WARNING_STATUS_ROLE);
                                    }
                                }}
                                dataLang={dataLang}
                            />
                        </div>

                        <ContainerFilterTab>
                            {dataFilter && dataFilter?.map((e) => {
                                return (
                                    <TabFilter
                                        dataLang={dataLang}
                                        key={e?.id}
                                        onClick={() => handleTab(e?.id)}
                                        total={e?.count}
                                        active={e?.id}
                                    >
                                        {dataLang[e?.name]}
                                    </TabFilter>
                                );
                            })}
                        </ContainerFilterTab>
                        <ContainerTable>
                            <div className="space-y-2 xl:space-y-3">
                                <div className="bg-slate-100 w-full rounded-t-lg items-center grid grid-cols-7 2xl:grid-cols-9  xl:col-span-8 lg:col-span-7 2xl:xl:p-2 xl:p-1.5 p-1.5">
                                    <div className="flex gap-3 items-center w-full">
                                        <div className="grid grid-cols-5 gap-2">
                                            <div className="col-span-1">
                                                <SearchComponent
                                                    dataLang={dataLang}
                                                    onChange={_HandleOnChangeKeySearch.bind(this)}
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <SelectComponent
                                                    options={[
                                                        {
                                                            value: "",
                                                            label: dataLang?.price_quote_branch || "price_quote_branch",
                                                            isDisabled: true,
                                                        },
                                                        ...listBr,
                                                    ]}
                                                    onChange={(e) => queryState({ idBranch: e })}
                                                    value={isState.idBranch}
                                                    placeholder={dataLang?.price_quote_select_branch || "price_quote_select_branch"}
                                                    isClearable={true}
                                                    closeMenuOnSelect={true}
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <SelectComponent
                                                    options={[
                                                        {
                                                            value: "",
                                                            label: dataLang?.price_quote_select_code || "price_quote_select_code",
                                                            isDisabled: true,
                                                        },
                                                        ...dataPriceQuoteCombobox,
                                                    ]}
                                                    onInputChange={(e) => {
                                                        handleSearchApi(e)
                                                    }}
                                                    onChange={(e) => queryState({ idQuoteCode: e })}
                                                    value={isState.idQuoteCode}
                                                    placeholder={dataLang?.price_quote_code || "price_quote_code"}
                                                    isClearable={true}
                                                />
                                            </div>
                                            <div className="col-span-1">
                                                <SelectComponent
                                                    options={[
                                                        {
                                                            value: "",
                                                            label: dataLang?.price_quote_select_customer || "price_quote_select_customer",
                                                            isDisabled: true,
                                                        },
                                                        ...listCustomer,
                                                    ]}
                                                    onInputChange={(e) => {
                                                        handleSearchClientsApi()
                                                    }}
                                                    onChange={(e) => queryState({ idCustomer: e })}
                                                    value={isState.idCustomer}
                                                    placeholder={
                                                        dataLang?.price_quote_customer || "price_quote_customer"
                                                    }
                                                    isClearable={true}
                                                />
                                            </div>
                                            <div className="z-20 col-span-1">
                                                <DateToDateComponent
                                                    value={isState.valueDate}
                                                    onChange={(e) => queryState({ valueDate: e })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-1 xl:col-span-2 lg:col-span-2">
                                        <div className="flex items-center justify-end gap-2">
                                            <OnResetData onClick={refetch.bind(this)} sOnFetching={(e) => { }} />
                                            {role == true || checkExport ? (
                                                <div className={``}>
                                                    {dataPriceQuote?.rResult?.length > 0 && (
                                                        <ExcelFileComponent
                                                            filename={"Danh sách báo giá"}
                                                            title={"DSBG"}
                                                            multiDataSet={multiDataSet}
                                                            dataLang={dataLang}
                                                        />
                                                    )}
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => isShow("error", WARNING_STATUS_ROLE)}
                                                    className={`xl:px-4 px-3 xl:py-2.5 py-1.5 2xl:text-xs xl:text-xs text-[7px] flex items-center space-x-2 bg-[#C7DFFB] rounded hover:scale-105 transition`}
                                                >
                                                    <Grid6 className="scale-75 2xl:scale-100 xl:scale-100" size={18} />
                                                    <span>{dataLang?.client_list_exportexcel}</span>
                                                </button>
                                            )}
                                            <div>
                                                <DropdowLimit sLimit={sLimit} limit={limit} dataLang={dataLang} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Customscrollbar>
                                <div className="w-[100%] lg:w-[100%] ">
                                    <HeaderTable gridCols={12}>
                                        <ColumnTable colSpan={1} textAlign={"center"}>
                                            {dataLang?.price_quote_date || "price_quote_table_date"}
                                        </ColumnTable>
                                        <ColumnTable colSpan={1} textAlign={"center"}>
                                            {dataLang?.price_quote_code || "price_quote_table_code"}
                                        </ColumnTable>
                                        <ColumnTable colSpan={2} textAlign={"center"}>
                                            {dataLang?.price_quote_customer || "price_quote_table_customer"}
                                        </ColumnTable>
                                        <ColumnTable colSpan={1} textAlign={"center"}>
                                            {dataLang?.price_quote_total || "price_quote_table_total"}
                                        </ColumnTable>
                                        <ColumnTable colSpan={1} textAlign={"center"}>
                                            {dataLang?.price_quote_tax_money || "price_quote_tax_money"}
                                        </ColumnTable>
                                        <ColumnTable colSpan={1} textAlign={"center"}>
                                            {dataLang?.price_quote_into_money || "price_quote_into_money"}
                                        </ColumnTable>
                                        <ColumnTable colSpan={1} textAlign={"center"}>
                                            {dataLang?.price_quote_effective_date || "price_quote_table_effective_date"}
                                        </ColumnTable>
                                        <ColumnTable colSpan={1} textAlign={"center"}>
                                            {dataLang?.price_quote_order_status || "price_quote_order_status"}
                                        </ColumnTable>
                                        <h4 className="2xl:text-[14px] xl:text-[10px] text-[8px] px-2 text-gray-600 uppercase col-span-1 font-[600] text-left">
                                            {dataLang?.price_quote_note || "price_quote_note"}
                                        </h4>
                                        <ColumnTable colSpan={1} textAlign={"center"}>
                                            {dataLang?.price_quote_branch || "price_quote_branch"}
                                        </ColumnTable>
                                        <ColumnTable colSpan={1} textAlign={"center"}>
                                            {dataLang?.price_quote_operations || "price_quote_operations"}
                                        </ColumnTable>
                                    </HeaderTable>
                                    {(isFetching && !isState.refreshing) ? (
                                        <Loading className="h-80" color="#0f4f9e" />
                                    ) : dataPriceQuote?.rResult?.length > 0 ? (
                                        <>
                                            <div className="divide-y divide-slate-200 min:h-[400px] h-[100%] max:h-[800px] ">
                                                {dataPriceQuote?.rResult?.map((e) => (
                                                    <RowTable gridCols={12} key={e.id.toString()}>
                                                        <RowItemTable colSpan={1} textAlign="center">
                                                            {e?.date != null
                                                                ? formatMoment(e?.date, FORMAT_MOMENT.DATE_SLASH_LONG)
                                                                : ""}
                                                        </RowItemTable>

                                                        <RowItemTable colSpan={1} textAlign={"center"}>
                                                            <PopupDetailQuote
                                                                dataLang={dataLang}
                                                                className="3xl:text-sm 2xl:text-13 xl:text-xs text-11 font-medium px-2 col-span-1 text-center text-[#0F4F9E] hover:text-blue-500 transition-all duration-200 ease-in-out cursor-pointer"
                                                                name={e?.reference_no}
                                                                id={e?.id}
                                                            />
                                                        </RowItemTable>

                                                        <RowItemTable colSpan={2} textAlign={"left"}>
                                                            {e.client_name}
                                                        </RowItemTable>

                                                        <RowItemTable textAlign={"right"}>
                                                            {formatNumber(e.total_price)}
                                                        </RowItemTable>

                                                        <RowItemTable colSpan={1} textAlign={"right"}>
                                                            {formatNumber(e.total_tax_price)}
                                                        </RowItemTable>

                                                        <RowItemTable colSpan={1} textAlign={"right"}>
                                                            {formatNumber(e.total_amount)}
                                                        </RowItemTable>

                                                        <RowItemTable colSpan={1} textAlign={"right"}>
                                                            {e?.validity != null ? formatMoment(e?.validity, FORMAT_MOMENT.DATE_SLASH_LONG) : ""}
                                                        </RowItemTable>

                                                        <RowItemTable
                                                            colSpan={1}
                                                            className="flex items-center justify-center text-center "
                                                        >
                                                            <h6 className="3xl:text-[12px] 2xl:text-[10px] xl:text-[9px] text-[8px] col-span-1 flex items-center justify-center text-center cursor-pointer">
                                                                {(e?.status === "confirmed" && (
                                                                    <BtnStatusApproved
                                                                        onClick={() =>
                                                                            handleQueryId({
                                                                                id: e?.id,
                                                                                status: true,
                                                                                idChild: "confirmed",
                                                                            })
                                                                        }
                                                                        type="1"
                                                                    />
                                                                )) ||
                                                                    (e?.status === "not_confirmed" && (
                                                                        <BtnStatusApproved
                                                                            onClick={() =>
                                                                                handleQueryId({
                                                                                    id: e?.id,
                                                                                    status: true,
                                                                                    idChild: "not_confirmed",
                                                                                })
                                                                            }
                                                                            type="0"
                                                                        />
                                                                    )) ||
                                                                    (e?.status === "no_confirmed" && (
                                                                        <BtnStatusApproved
                                                                            onClick={() =>
                                                                                handleQueryId({
                                                                                    id: e?.id,
                                                                                    status: true,
                                                                                    idChild: "no_confirmed",
                                                                                })
                                                                            }
                                                                            title="Không duyệt"
                                                                            type="2"
                                                                        />
                                                                    )) ||
                                                                    (e?.status === "ordered" && (
                                                                        <div
                                                                            className={`cursor-pointer 3xl:text-[13px] 2xl:text-[10px] xl:text-[9px] text-[7px] 
                                                                            3xl:w-[120px] 3xl:h-8 2xl:w-[90px] 2xl:h-7 xl:w-[82px] xl:h-6 lg:w-[68px]  lg:h-5 border-orange-400 text-white bg-orange-500 hover:bg-orange-600
                                                                            transition-all relative duration-300 ease-in-out  hover:text-white border 3xl:px-0.5 py-1 rounded-md  font-normal flex justify-center items-center gap-1`}
                                                                            onClick={() => handleToggleOrdered(e?.id)}
                                                                        >
                                                                            Đã tạo đơn
                                                                            <TickCircle className="text-right 3xl:w-5 3xl:h-5 2xl:w-4 2xl:h-4  xl:w-3.5 xl:h-3.5 lg:w-3 lg:h-3" />
                                                                        </div>
                                                                    ))}
                                                            </h6>
                                                        </RowItemTable>
                                                        <RowItemTable colSpan={1} textAlign={"left"}>
                                                            {e?.note}
                                                        </RowItemTable>
                                                        <RowItemTable colSpan={1} className="mx-auto w-fit">
                                                            <TagBranch>{e?.branch_name}</TagBranch>
                                                        </RowItemTable>
                                                        <RowItemTable
                                                            colSpan={1}
                                                            className="flex items-center justify-center"
                                                        >
                                                            <BtnAction
                                                                onRefresh={refetch.bind(this)}
                                                                dataLang={dataLang}
                                                                status={e?.status}
                                                                id={e?.id}
                                                                type="price_quote"
                                                            />
                                                        </RowItemTable>
                                                    </RowTable>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <NoData />
                                    )}
                                </div>
                            </Customscrollbar>
                        </ContainerTable>
                    </div>
                    <ContainerTotal>
                        <ColumnTable colSpan={4} textAlign={"center"} className="p-2">
                            {dataLang?.price_quote_total_outside || "price_quote_total_outside"}
                        </ColumnTable>
                        <ColumnTable
                            colSpan={1}
                            textAlign={"right"}
                            className="flex flex-wrap justify-end gap-2 p-2 mr-1"
                        >
                            {/* <h3 className="font-normal 3xl:text-base 2xl:text-[12.5px] xl:text-[11px] text-[9px]"> */}
                            {formatNumber(dataPriceQuote?.rTotal?.total_price)}
                            {/* </h3> */}
                        </ColumnTable>
                        <ColumnTable
                            colSpan={1}
                            textAlign={"right"}
                            className="flex flex-wrap justify-end gap-2 p-2 mr-1"
                        >
                            {formatNumber(dataPriceQuote?.rTotal?.total_tax_price)}
                        </ColumnTable>
                        <ColumnTable
                            colSpan={1}
                            textAlign={"right"}
                            className="flex flex-wrap justify-end gap-2 p-2 mr-1"
                        >
                            {formatNumber(dataPriceQuote?.rTotal?.total_amount)}
                        </ColumnTable>
                    </ContainerTotal>
                    {dataPriceQuote?.rResult?.length != 0 && (
                        <ContainerPagination>
                            <TitlePagination dataLang={dataLang} totalItems={dataPriceQuote?.output?.iTotalDisplayRecords} />
                            <Pagination
                                postsPerPage={limit}
                                totalPosts={Number(dataPriceQuote?.output?.iTotalDisplayRecords)}
                                paginate={paginate}
                                currentPage={router.query?.page || 1}
                            />
                        </ContainerPagination>
                    )}
                </ContainerBody>
            </Container>
            <PopupConfim
                dataLang={dataLang}
                type="warning"
                nameModel={"price_quote_status"}
                title={TITLE_STATUS}
                status={status}
                subtitle={CONFIRMATION_OF_CHANGES}
                isOpen={isOpen}
                save={handleDelete}
                handleNoconfim={handleNoconfim}
                cancel={() => handleQueryId({ status: false })}
            />
        </React.Fragment>
    );
};

export default PriceQuote;
