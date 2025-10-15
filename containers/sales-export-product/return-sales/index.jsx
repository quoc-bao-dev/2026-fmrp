import apiReturnSales from "@/Api/apiSalesExportProduct/returnSales/apiReturnSales";
import { BtnAction } from "@/components/UI/BtnAction";
import TabFilter from "@/components/UI/TabFilter";
import Breadcrumb from "@/components/UI/breadcrumb/BreadcrumbCustom";
import OnResetData from "@/components/UI/btnResetData/btnReset";
import ButtonWarehouse from "@/components/UI/btnWarehouse/btnWarehouse";
import ButtonAddNew from "@/components/UI/button/buttonAddNew";
import ContainerPagination from "@/components/UI/common/ContainerPagination/ContainerPagination";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import { EmptyExprired } from "@/components/UI/common/EmptyExprired";
import {
    ColumnTable,
    HeaderTable,
    RowItemTable,
    RowTable,
} from "@/components/UI/common/Table";
import {
    TagColorOrange,
    TagColorSky,
} from "@/components/UI/common/Tag/TagStatus";
import {
    ContainerTotal,
    LayOutTableDynamic
} from "@/components/UI/common/layout";
import DropdowLimit from "@/components/UI/dropdowLimit/dropdowLimit";
import DateToDateComponent from "@/components/UI/filterComponents/dateTodateComponent";
import ExcelFileComponent from "@/components/UI/filterComponents/excelFilecomponet";
import SearchComponent from "@/components/UI/filterComponents/searchComponent";
import SelectComponent from "@/components/UI/filterComponents/selectComponent";
import Loading from "@/components/UI/loading/loading";
import NoData from "@/components/UI/noData/nodata";
import Pagination from "@/components/UI/pagination";
import PopupConfim from "@/components/UI/popupConfim/popupConfim";
import {
    CONFIRMATION_OF_CHANGES,
    TITLE_STATUS,
} from "@/constants/changeStatus/changeStatus";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import { WARNING_STATUS_ROLE } from "@/constants/warningStatus/warningStatus";
import PopupDetail from "@/containers/sales-export-product/return-sales/components/PopupDetail";
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
import { formatMoment } from "@/utils/helpers/formatMoment";
import formatMoneyConfig from "@/utils/helpers/formatMoney";
import { useMutation } from "@tanstack/react-query";
import { Grid6 } from "iconsax-react";
import { debounce } from "lodash";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { useSelector } from "react-redux";
import { routerReturnSales } from "routers/sellingGoods";
import { useReturnSalesCombobox } from "./hooks/useReturnSalesCombobox";
import { useReturnSalesFilterbar } from "./hooks/useReturnSalesFilterbar";
import { useReturnSalesList } from "./hooks/useReturnSalesList";

const initsArr = {
    dataExport: [],
    idBranch: null,
    idCode: null,
    idClient: null,
    valueDate: { startDate: null, endDate: null },
    keySearch: "",
    keySearchCode: "",
    keySearchClient: "",
    onSending: false,
    refreshing: false,
};
const ReturnSales = (props) => {
    const dataLang = props.dataLang;

    const router = useRouter();

    const tabPage = router.query?.tab;

    const isShow = useToast();

    const dataSeting = useSetingServer();

    const { paginate } = usePagination();

    const statusExprired = useStatusExprired();

    const { handleTab: _HandleSelectTab } = useTab("all");

    const [isState, sIsState] = useState(initsArr);

    const { isOpen, isKeyState, handleQueryId } = useToggle();

    const { limit, updateLimit: sLimit } = useLimitAndTotalItems();

    const { is_admin: role, permissions_current: auth } = useSelector(
        (state) => state.auth
    );

    const { checkAdd, checkExport } = useActionRole(auth, "returnSales");

    const queryState = (key) => sIsState((prev) => ({ ...prev, ...key }));

    const formatMoney = (number) => {
        return formatMoneyConfig(+number, dataSeting);
    };

    const renderMoneyOrDash = (value) => {
        return Number(value) === 0
            ? "-"
            : <>{formatMoney(value)} <span className="underline">đ</span></>;
    };  

    const params = {
        search: isState.keySearch,
        limit: limit,
        page: router.query?.page || 1,
        "filter[status_bar]": tabPage ?? null,
        "filter[id]": isState.idCode != null ? isState.idCode?.value : null,
        "filter[branch_id]":
            isState.idBranch != null ? isState.idBranch.value : null,
        "filter[client_id]": isState?.idClient ? isState?.idClient.value : null,
        "filter[start_date]":
            isState?.valueDate?.startDate != null
                ? isState?.valueDate?.startDate
                : null,
        "filter[end_date]":
            isState?.valueDate?.endDate != null ? isState?.valueDate?.endDate : null,
    };

    const { data: listBranch = [] } = useBranchList();

    const { data, isFetching, refetch } = useReturnSalesList(params);

    const { data: listClient = [] } = useClientCombobox(isState.keySearchClient);

    const { data: listCode = [] } = useReturnSalesCombobox(isState.keySearchCode);

    const { data: dataFilterBar, refetch: refetchFilterBar } =
        useReturnSalesFilterbar(params);

    const handleSearchCodesApi = debounce(async (inputValue) => {
        queryState({ keySearchCode: inputValue });
    }, 500);

    const handleSearchClientsApi = debounce((value) => {
        queryState({ keySearchClient: value });
    }, 500);

    const onChangeFilter = (type, value) => queryState({ [type]: value });

    const handleOnChangeKeySearch = debounce(({ target: { value } }) => {
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
                    title: `${dataLang?.import_day_vouchers || "import_day_vouchers"}`,
                    width: { wpx: 100 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.import_code_vouchers || "import_code_vouchers"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.import_supplier || "import_supplier"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.import_total_amount || "import_total_amount"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.import_tax_money || "import_tax_money"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.import_into_money || "import_into_money"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${"Hình thức"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.import_brow_storekeepers || "import_brow_storekeepers"
                        }`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.import_branch || "import_branch"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.import_from_note || "import_from_note"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
            ],
            data: data?.rResult?.map((e) => [
                { value: `${e?.id ? e.id : ""}`, style: { numFmt: "0" } },
                { value: `${e?.date ? e?.date : ""}` },
                { value: `${e?.code ? e?.code : ""}` },
                { value: `${e?.client_name ? e?.client_name : ""}` },
                { value: `${e?.total_price ? formatMoney(e?.total_price) : ""}` },
                {
                    value: `${e?.total_tax_price ? formatMoney(e?.total_tax_price) : ""}`,
                },
                { value: `${e?.total_amount ? formatMoney(e?.total_amount) : ""}` },
                {
                    value: `${e?.handling_solution
                        ? dataLang[e?.handling_solution] || e?.handling_solution
                        : ""
                        }`,
                },
                {
                    value: `${e?.warehouseman_id === "0" ? "Chưa duyệt kho" : "Đã duyệt kho"
                        }`,
                },
                { value: `${e?.branch_name ? e?.branch_name : ""}` },
                { value: `${e?.note ? e?.note : ""}` },
            ]),
        },
    ];

    const handleSaveStatus = () => {
        if (isKeyState?.type === "browser") {
            const checked = isKeyState.value.target.checked;
            const warehousemanId = isKeyState.value.target.value;
            const dataChecked = {
                checked: checked,
                warehousemanId: warehousemanId,
                id: isKeyState?.id,
                checkedpost: isKeyState?.checkedUn,
            };
            _ServerSending(dataChecked);
        }

        handleQueryId({ status: false });
    };

    const _HandleChangeInput = (id, checkedUn, type, value) => {
        handleQueryId({
            status: true,
            initialKey: { id, checkedUn, type, value },
        });
    };

    const handingStatus = useMutation({
        mutationFn: (data) => {
            return apiReturnSales.apiHandingStatus(data);
        },
    });

    const _ServerSending = (checkedWare) => {
        let data = new FormData();

        data.append(
            "warehouseman_id",
            checkedWare?.checkedpost != "0" ? checkedWare?.checkedpost : ""
        );

        data.append("id", checkedWare?.id);

        handingStatus.mutate(data, {
            onSuccess: async ({ isSuccess, message, alert_type, data_export }) => {
                if (isSuccess) {
                    isShow(alert_type, dataLang[message] || message);
                } else {
                    isShow("error", dataLang[message] || message);
                }
                queryState({ refreshing: true });
                await refetch();
                await refetchFilterBar();
                queryState({ refreshing: false });
                if (data_export?.length > 0) {
                    queryState({ dataExport: [...data_export] });
                }
                queryState({ onSending: false });
            },
            onError: (error) => { },
        });
    };

    // breadcrumb
    const breadcrumbItems = [
        {
            label: `${dataLang?.returnSales_title || "returnSales_title"}`,
            // href: "/",
        },
        {
            label: `${dataLang?.returnSales_titleLits || "returnSales_titleLits"}`,
        },
    ];

    return (
        <React.Fragment>
            <LayOutTableDynamic
                head={
                    <Head>
                        <title>
                            {dataLang?.returnSales_titleLits || "returnSales_titleLits"}{" "}
                        </title>
                    </Head>
                }
                breadcrumb={
                    <>
                        {statusExprired ? (
                            <EmptyExprired />
                        ) : (
                            <React.Fragment>
                                <Breadcrumb
                                    items={breadcrumbItems}
                                    className="3xl:text-sm 2xl:text-xs xl:text-[10px] lg:text-[10px]"
                                />
                            </React.Fragment>
                        )}
                    </>
                }
                titleButton={
                    <>
                        <h2 className="text-title-section text-[#52575E] capitalize font-medium">
                            {dataLang?.returnSales_titleLits || "returnSales_titleLits"}
                        </h2>
                        <ButtonAddNew
                            onClick={() => {
                                if (role) {
                                    router.push(routerReturnSales.form);
                                } else if (checkAdd) {
                                    router.push(routerReturnSales.form);
                                } else {
                                    isShow("error", WARNING_STATUS_ROLE);
                                }
                            }}
                            dataLang={dataLang}
                        />
                    </>
                }
                fillterTab={
                    <>
                        {dataFilterBar &&
                            dataFilterBar?.map((e) => {
                                return (
                                    <TabFilter
                                        key={e?.id}
                                        dataLang={dataLang}
                                        onClick={_HandleSelectTab.bind(this, `${e?.id}`)}
                                        total={e?.count}
                                        active={e?.id}
                                    >
                                        {dataLang[e?.name] || e?.name}
                                    </TabFilter>
                                );
                            })}
                    </>
                }
                table={
                    <div className="flex flex-col h-full">
                        <div className="w-full items-center flex justify-between gap-2">
                            <div className="flex gap-3 items-center w-full">
                                    <div className="col-span-1">
                                        <SearchComponent
                                            dataLang={dataLang}
                                            onChange={handleOnChangeKeySearch.bind(this)}
                                        />
                                    </div>
                                    <div className="z-20 col-span-1">
                                        <DateToDateComponent
                                            value={isState.valueDate}
                                            onChange={onChangeFilter.bind(this, "valueDate")}
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <SelectComponent
                                            options={[
                                                {
                                                    value: "",
                                                    label:
                                                        dataLang?.price_quote_branch ||
                                                        "price_quote_branch",
                                                    isDisabled: true,
                                                },
                                                ...listBranch,
                                            ]}
                                            onChange={onChangeFilter.bind(this, "idBranch")}
                                            value={isState.idBranch}
                                            placeholder={
                                                dataLang?.price_quote_select_branch ||
                                                "price_quote_select_branch"
                                            }
                                            hideSelectedOptions={false}
                                            isClearable={true}
                                            className="3xl:text-[16px] 2xl:text-[16px] xl:text-[13px] lg:text-[12px] w-full rounded-xl bg-white z-20"
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <SelectComponent
                                            options={[
                                                {
                                                    value: "",
                                                    label:
                                                        dataLang?.purchase_order_table_code ||
                                                        "purchase_order_table_code",
                                                    isDisabled: true,
                                                },
                                                ...listCode,
                                            ]}
                                            onInputChange={(e) => {
                                                handleSearchCodesApi(e);
                                            }}
                                            onChange={onChangeFilter.bind(this, "idCode")}
                                            value={isState.idCode}
                                            placeholder={
                                                dataLang?.purchase_order_table_code ||
                                                "purchase_order_table_code"
                                            }
                                            isClearable={true}
                                            className="3xl:text-[16px] 2xl:text-[16px] xl:text-[13px] lg:text-[12px] w-full rounded-md bg-white z-20"
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <SelectComponent
                                            options={[
                                                {
                                                    value: "",
                                                    label:
                                                        dataLang?.price_quote_select_customer ||
                                                        "price_quote_select_customer",
                                                    isDisabled: true,
                                                },
                                                ...listClient,
                                            ]}
                                            onInputChange={(e) => {
                                                handleSearchClientsApi(e);
                                            }}
                                            onChange={onChangeFilter.bind(this, "idClient")}
                                            value={isState.idClient}
                                            placeholder={
                                                dataLang?.price_quote_customer || "price_quote_customer"
                                            }
                                            isClearable={true}
                                            className="3xl:text-[16px] 2xl:text-[16px] xl:text-[13px] lg:text-[12px] w-full rounded-md bg-white z-20"
                                        />
                                    </div>
                            </div>
                            <div className="col-span-1 xl:col-span-2 lg:col-span-2">
                                <div className="flex justify-end items-center gap-2">
                                    <OnResetData
                                        onClick={refetch.bind(this)}
                                        sOnFetching={(e) => { }}
                                    />
                                    <div>
                                        {role == true || checkExport ? (
                                            <div className={``}>
                                                {data?.rResult?.length > 0 && (
                                                    <ExcelFileComponent
                                                        classBtn="!px-1"
                                                        filename={
                                                            dataLang?.returnSales_titleEx ||
                                                            "returnSales_titleEx"
                                                        }
                                                        title={"DSTLHB"}
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
                                                <Grid6
                                                    className="2xl:scale-100 xl:scale-100 scale-75"
                                                    size={18}
                                                />
                                                <span>{dataLang?.client_list_exportexcel}</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Customscrollbar className="h-full overflow-y-auto">
                            <div className="w-[100%] lg:w-[100%] ">
                                <HeaderTable gridCols={10}>
                                    <ColumnTable colSpan={0.5} textAlign={"center"}>
                                        {dataLang?.stt || "stt"}
                                    </ColumnTable>
                                    <ColumnTable textAlign="left" colSpan={1}>
                                        {dataLang?.import_day_vouchers || "import_day_vouchers"}
                                    </ColumnTable>
                                    <ColumnTable textAlign={"left"} colSpan={1}>
                                        {dataLang?.import_code_vouchers || "import_code_vouchers"}
                                    </ColumnTable>
                                    <ColumnTable textAlign={"left"} colSpan={1}>
                                        {dataLang?.returnSales_client || "returnSales_client"}
                                    </ColumnTable>
                                    <ColumnTable textAlign={"right"} colSpan={1}>
                                        {dataLang?.import_total_amount || "import_total_amount"}
                                    </ColumnTable>
                                    <ColumnTable textAlign={"right"} colSpan={1}>
                                        {dataLang?.import_tax_money || "import_tax_money"}
                                    </ColumnTable>
                                    <ColumnTable textAlign={"right"} colSpan={1}>
                                        {dataLang?.import_into_money || "import_into_money"}
                                    </ColumnTable>
                                    <ColumnTable textAlign={"center"} colSpan={1}>
                                        {dataLang?.returns_form || "returns_form"}
                                    </ColumnTable>
                                    <ColumnTable textAlign={"left"} colSpan={1}>
                                        {dataLang?.import_brow_storekeepers ||
                                            "import_brow_storekeepers"}
                                    </ColumnTable>
                                    <ColumnTable textAlign={"left"} colSpan={1}>
                                        {dataLang?.import_branch || "import_branch"}
                                    </ColumnTable>
                                    <ColumnTable textAlign={"center"} colSpan={0.5}>
                                        {dataLang?.import_action || "import_action"}
                                    </ColumnTable>
                                </HeaderTable>
                                {isFetching && !isState.refreshing ? (
                                    <Loading className="h-80" color="#0f4f9e" />
                                ) : data?.rResult?.length > 0 ? (
                                    <>
                                        <div className="divide-y divide-slate-200 min:h-[400px] h-[100%] max:h-[800px]">
                                            {data?.rResult?.map((e, index) => (
                                                <RowTable gridCols={10} key={e.id.toString()}>
                                                    <RowItemTable colSpan={0.5} textAlign={"center"}>
                                                        {index + 1}
                                                    </RowItemTable>
                                                    <RowItemTable textAlign={"left"} colSpan={1}>
                                                        {e?.date != null
                                                            ? formatMoment(
                                                                e?.date,
                                                                FORMAT_MOMENT.DATE_SLASH_LONG
                                                            )
                                                            : ""}
                                                    </RowItemTable>
                                                    <RowItemTable colSpan={1} textAlign={"left"}>
                                                        <PopupDetail
                                                            dataLang={dataLang}
                                                            className="3xl:text-sm 2xl:text-13 xl:text-xs text-11 font-semibold text-center text-[#003DA0] hover:text-blue-600 transition-all ease-linear cursor-pointer "
                                                            name={e?.code}
                                                            id={e?.id}
                                                        />
                                                    </RowItemTable>
                                                    <RowItemTable colSpan={1} textAlign={"left"}>
                                                        {e.client_name}
                                                    </RowItemTable>
                                                    <RowItemTable colSpan={1} textAlign={"right"}>
                                                        {renderMoneyOrDash(e.total_price)}
                                                    </RowItemTable>
                                                    <RowItemTable colSpan={1} textAlign={"right"}>
                                                        {renderMoneyOrDash(e.total_tax_price)}
                                                    </RowItemTable>
                                                    <RowItemTable colSpan={1} textAlign={"right"}>
                                                        {renderMoneyOrDash(e.total_amount)}
                                                    </RowItemTable>
                                                    <RowItemTable colSpan={1} className=" mx-auto">
                                                        {(e?.handling_solution === "pay_down" && (
                                                            <TagColorSky
                                                                className={"!py-1"}
                                                                name={
                                                                    dataLang[e?.handling_solution] ||
                                                                    e?.handling_solution
                                                                }
                                                            />
                                                        )) ||
                                                            (e?.handling_solution === "debt_reduction" && (
                                                                <TagColorOrange
                                                                    className={"!py-1"}
                                                                    name={
                                                                        dataLang[e?.handling_solution] ||
                                                                        e?.handling_solution
                                                                    }
                                                                />
                                                            ))}
                                                    </RowItemTable>
                                                    <RowItemTable colSpan={1}>
                                                        <ButtonWarehouse
                                                            warehouseman_id={e?.warehouseman_id}
                                                            _HandleChangeInput={_HandleChangeInput}
                                                            id={e?.id}
                                                        />
                                                    </RowItemTable>
                                                    <RowItemTable colSpan={1}>
                                                        {/* <TagBranch> */}
                                                            {e?.branch_name}
                                                            {/* </TagBranch> */}
                                                    </RowItemTable>
                                                    <RowItemTable
                                                        colSpan={0.5}
                                                        className="flex justify-center"
                                                    >
                                                        <BtnAction
                                                            onRefresh={refetch.bind(this)}
                                                            onRefreshGroup={refetchFilterBar.bind(this)}
                                                            dataLang={dataLang}
                                                            warehouseman_id={e?.warehouseman_id}
                                                            id={e?.id}
                                                            type="returnSales"
                                                            className="bg-slate-100 xl:px-4 px-2 xl:py-1.5 py-1 rounded 2xl:text-base xl:text-xs text-[9px]"
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
                    </div>
                }
                showTotal={true}
                total={
                    <>
                        <ContainerTotal className={"!grid-cols-20"}>
                            <RowItemTable colSpan={3.5} textAlign={"right"} className="p-2">
                                {dataLang?.import_total || "import_total"}
                            </RowItemTable>
                            <RowItemTable colSpan={1} textAlign={"right"}>
                                {renderMoneyOrDash(data?.rTotal?.total_price)}
                            </RowItemTable>
                            <RowItemTable colSpan={1} textAlign={"right"}>
                                {renderMoneyOrDash(data?.rTotal?.total_tax_price)}
                            </RowItemTable>
                            <RowItemTable colSpan={1} textAlign={"right"}>
                                {renderMoneyOrDash(data?.rTotal?.total_amount)}
                            </RowItemTable>
                        </ContainerTotal>
                    </>
                }

                pagination={
                    <div className="flex items-center justify-between gap-2">
                        {data?.rResult?.length != 0 && (
                            <ContainerPagination>
                                {/* <TitlePagination
                                    dataLang={dataLang}
                                    totalItems={data?.output?.iTotalDisplayRecords}
                                /> */}
                                <Pagination
                                    postsPerPage={limit}
                                    totalPosts={Number(data?.output?.iTotalDisplayRecords)}
                                    paginate={paginate}
                                    currentPage={router.query?.page || 1}
                                />
                            </ContainerPagination>
                        )}

                        <DropdowLimit sLimit={sLimit} limit={limit} dataLang={dataLang} />
                    </div>
                }
            />
            <PopupConfim
                dataLang={dataLang}
                type="warning"
                nameModel={"returnSales"}
                title={TITLE_STATUS}
                subtitle={CONFIRMATION_OF_CHANGES}
                isOpen={isOpen}
                save={handleSaveStatus}
                cancel={() => handleQueryId({ status: false })}
            />
        </React.Fragment>
    );
};

export default ReturnSales;
