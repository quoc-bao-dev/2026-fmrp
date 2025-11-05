import { BtnAction } from "@/components/UI/BtnAction";
import TabFilter from "@/components/UI/TabFilter";
import Breadcrumb from "@/components/UI/breadcrumb/BreadcrumbCustom";
import OnResetData from "@/components/UI/btnResetData/btnReset";
import ContainerPagination from "@/components/UI/common/ContainerPagination/ContainerPagination";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import { EmptyExprired } from "@/components/UI/common/EmptyExprired";
import { ColumnTable, HeaderTable, RowItemTable, RowTable } from "@/components/UI/common/Table";
import { TagColorLime, TagColorOrange, TagColorSky } from "@/components/UI/common/Tag/TagStatus";
import { ContainerTotal, LayOutTableDynamic } from "@/components/UI/common/layout";
import DropdowLimit from "@/components/UI/dropdowLimit/dropdowLimit";
import DateToDateComponent from "@/components/UI/filterComponents/dateTodateComponent";
import ExcelFileComponent from "@/components/UI/filterComponents/excelFilecomponet";
import SearchComponent from "@/components/UI/filterComponents/searchComponent";
import SelectComponent from "@/components/UI/filterComponents/selectComponent";
import Loading from "@/components/UI/loading/loading";
import NoData from "@/components/UI/noData/nodata";
import Pagination from "@/components/UI/pagination";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import { WARNING_STATUS_ROLE } from "@/constants/warningStatus/warningStatus";
import { useBranchList } from "@/hooks/common/useBranch";
import useSetingServer from "@/hooks/useConfigNumber";
import { useLimitAndTotalItems } from "@/hooks/useLimitAndTotalItems";
import usePagination from "@/hooks/usePagination";
import useActionRole from "@/hooks/useRole";
import useStatusExprired from "@/hooks/useStatusExprired";
import useTab from "@/hooks/useTab";
import useToast from "@/hooks/useToast";
import { formatMoment } from "@/utils/helpers/formatMoment";
import formatMoneyConfig from "@/utils/helpers/formatMoney";
import formatMoneyOrDash from "@/utils/helpers/formatMoneyOrDash";
import formatNumberConfig from "@/utils/helpers/formatnumber";
import vi from "date-fns/locale/vi";
import { Grid6 } from "iconsax-react";
import { debounce } from "lodash";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useSelector } from "react-redux";
import PopupServieVoucher from "./components/popup";
import PopupDetail from "./components/popupDetail";
import { useServiceVoucherCombobox } from "./hooks/useServiceVoucherCombobox";
import { useServicevVoucherFilterbar } from "./hooks/useServicevVoucherFilterbar";
import { useServicevVoucherList } from "./hooks/useServicevVoucherList";
registerLocale("vi", vi);

const initialState = {
    onFetching: false,
    onFetchingGroup: false,
    keySearch: "",
    keySearchCode: "",
    valueBr: null,
    valueCode: null,
    valueDate: { startDate: null, endDate: null }
};

const ServicevVoucher = (props) => {
    const dataLang = props.dataLang;

    const router = useRouter();

    const isShow = useToast();

    const { paginate } = usePagination();

    const dataSeting = useSetingServer();

    const statusExprired = useStatusExprired();

    const [isState, sIsState] = useState(initialState);

    const { handleTab: _HandleSelectTab } = useTab('all');

    const { limit, updateLimit: sLimit } = useLimitAndTotalItems();

    const { is_admin: role, permissions_current: auth } = useSelector((state) => state.auth);

    const { checkAdd, checkEdit, checkExport } = useActionRole(auth, "servicev_voucher");

    const queryState = (key) => sIsState((prev) => ({ ...prev, ...key }));

    const params = {
        search: isState.keySearch,
        limit: limit,
        page: router.query?.page || 1,
        "filter[status_bar]": router.query?.tab ? router.query?.tab : null,
        "filter[id]": isState.valueCode != null ? isState.valueCode?.value : null,
        "filter[branch_id]": isState.valueBr != null ? isState.valueBr.value : null,
        "filter[start_date]": isState.valueDate?.startDate != null ? isState.valueDate?.startDate : null,
        "filter[end_date]": isState.valueDate?.endDate != null ? isState.valueDate?.endDate : null,
    }

    const { data: listBr = [] } = useBranchList()

    const { data, isFetching, refetch } = useServicevVoucherList(params);

    const { data: listCode = [] } = useServiceVoucherCombobox(isState.keySearchCode);

    const { data: dataFilterbar, refetch: refetchFilter } = useServicevVoucherFilterbar({ ...params, limit: 0, page: undefined, "filter[status_bar]": undefined })

    const _HandleSeachApi = debounce(async (inputValue) => {
        queryState({ keySearchCode: inputValue })
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

    const formatNumber = (number) => {
        return formatNumberConfig(+number, dataSeting);
    };

    const formatMoney = (number) => {
        return formatMoneyConfig(+number, dataSeting);
    };

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
                    title: `${dataLang?.serviceVoucher_day_vouchers || "serviceVoucher_day_vouchers"}`,
                    width: { wpx: 100 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.serviceVoucher_voucher_code || "serviceVoucher_voucher_code"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.serviceVoucher_supplier || "serviceVoucher_supplier"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.serviceVoucher_total_amount || "serviceVoucher_total_amount"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.serviceVoucher_tax_money || "serviceVoucher_tax_money"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.serviceVoucher_into_money || "serviceVoucher_into_money"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.serviceVoucher_status_of_spending || "serviceVoucher_status_of_spending"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.serviceVoucher_note || "serviceVoucher_note"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.serviceVoucher_branch || "serviceVoucher_branch"}`,
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
                { value: `${e?.supplier_name ? e?.supplier_name : ""}` },
                { value: `${e?.total_price ? formatMoney(e?.total_price) : ""}` },
                { value: `${e?.total_tax_price ? formatMoney(e?.total_tax_price) : ""}` },
                { value: `${e?.total_amount ? formatMoney(e?.total_amount) : ""}` },
                // {value: `${e?.status_pay ? e?.status_pay === "0" && "Chưa nhập" || e?.status_pay === "1" && "Nhập 1 phần" ||  e?.status_pay === "2"  && "Đã nhập đủ đủ" : ""}`},
                { value: `${e?.status_pay === "not_spent" && 'Chưa chi' || e?.status_pay === "spent_part" && `Chi 1 phần (${formatNumber(e?.amount_paid)})` || e?.status_pay === "spent" && 'Đã chi đủ'}` },
                { value: `${e?.note ? e?.note : ""}` },
                { value: `${e?.branch_name ? e?.branch_name : ""}` },
            ]),
        },
    ];

    const breadcrumbItems = [
        {
            label: `${dataLang?.serviceVoucher_title || "serviceVoucher_title"}`,
        },
        {
            label: `${dataLang?.serviceVoucher_title_lits || "serviceVoucher_title_lits"}`,
        },
    ]

    return (
        <React.Fragment>
             <LayOutTableDynamic
                head={
                    <Head>
                        <title>{dataLang?.serviceVoucher_title || "serviceVoucher_title"} </title>
                    </Head>
                }
                breadcrumb={
                    <>
                        {statusExprired ? (
                            <EmptyExprired />
                        ) : (
                            <React.Fragment>
                                <Breadcrumb items={breadcrumbItems} className="3xl:text-sm 2xl:text-xs xl:text-[10px] lg:text-[10px]" />
                            </React.Fragment>
                        )}
                    </>
                }
                titleButton={
                    <>
                        <h2 className="text-title-section text-[#52575E] capitalize font-medium">
                            {dataLang?.serviceVoucher_title_lits || "serviceVoucher_title_lits"}
                        </h2>
                       
                        {role == true || checkAdd ? (
                            <PopupServieVoucher
                                onRefreshGroup={refetchFilter.bind(this)}
                                onRefresh={refetch.bind(this)}
                                dataLang={dataLang}
                                className="responsive-text-sm xl:px-5 px-3 xl:py-2.5 py-1.5 bg-background-blue-2 text-white rounded-lg btn-animation hover:scale-105"
                            />
                        ) : (
                            <button
                                type="button"
                                onClick={() => {
                                    isShow("error", WARNING_STATUS_ROLE);
                                }}
                                className="responsive-text-sm xl:px-5 px-3 xl:py-2.5 py-1.5 bg-background-blue-2 text-white rounded-lg btn-animation hover:scale-105"
                            >
                                {dataLang?.branch_popup_create_new}
                            </button>
                        )}
                    </>
                }
                fillterTab={
                    <>
                        {dataFilterbar && dataFilterbar?.map((e) => {
                            return (
                                <div key={e?.id}>
                                    <TabFilter
                                        backgroundColor="#e2f0fe"
                                        dataLang={dataLang}
                                        key={e?.id}
                                        onClick={_HandleSelectTab.bind(this, `${e?.id}`)}
                                        total={e?.count}
                                        active={e?.id}
                                        className={"text-[#0F4F9E] "}
                                    >
                                        {dataLang[e?.name] || e?.name}
                                    </TabFilter>
                                </div>
                            );
                        })}
                    </>
                }
                table={
                    <div className="flex flex-col h-full">
                        <div className="w-full items-center flex justify-between gap-2">
                            <div className="flex gap-3 items-center w-full">
                                <SearchComponent
                                    colSpan={1}
                                    dataLang={dataLang}
                                    onChange={_HandleOnChangeKeySearch.bind(this)}
                                />
                                <DateToDateComponent
                                    colSpan={1}
                                    value={isState.valueDate}
                                    onChange={(e) => queryState({ valueDate: e })}
                                />
                                <SelectComponent
                                    options={[
                                        {
                                            value: "",
                                            label: dataLang?.serviceVoucher_branch || "serviceVoucher_branch",
                                            isDisabled: true,
                                        },
                                        ...listBr,
                                    ]}
                                    colSpan={1}
                                    onChange={(e) => queryState({ valueBr: e })}
                                    value={isState.valueBr}
                                    placeholder={dataLang?.serviceVoucher_branch || "serviceVoucher_branch"}
                                    isClearable={true}
                                />
                                <SelectComponent
                                    onInputChange={(event) => {
                                        _HandleSeachApi(event);
                                    }}
                                    options={[
                                        {
                                            value: "",
                                            label: dataLang?.serviceVoucher_voucher_code || "serviceVoucher_voucher_code",
                                            isDisabled: true,
                                        },
                                        ...listCode,
                                    ]}
                                    onChange={(e) => queryState({ valueCode: e })}
                                    value={isState.valueCode}
                                    placeholder={dataLang?.serviceVoucher_voucher_code || "serviceVoucher_voucher_code"}
                                    colSpan={1}
                                    isClearable={true}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <OnResetData sOnFetching={(e) => { }} onClick={() => refetch()} />
                                {role == true || checkExport ? (
                                    <div className={``}>
                                        {data?.rResult?.length > 0 && (
                                            <ExcelFileComponent
                                                dataLang={dataLang}
                                                filename="Danh sách phiếu dịch vụ"
                                                title="DSPDV"
                                                multiDataSet={multiDataSet}
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
                            </div>
                        </div>

                        <Customscrollbar className="h-full overflow-y-auto">
                            <div className="w-full">
                                <HeaderTable gridCols={16}>
                                    <ColumnTable colSpan={0.5} textAlign={"center"}>
                                        {dataLang?.stt || "stt"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1.5} textAlign={"left"} className={"whitespace-nowrap"}>
                                        {dataLang?.serviceVoucher_day_vouchers || "serviceVoucher_day_vouchers"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1.5} textAlign={"left"} className={"whitespace-nowrap"}>
                                        {dataLang?.serviceVoucher_voucher_code || "serviceVoucher_voucher_code"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={2} textAlign={"left"} className={"whitespace-nowrap"}>
                                        {dataLang?.serviceVoucher_supplier || "serviceVoucher_supplier"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1.5} textAlign={"right"}>
                                        {dataLang?.serviceVoucher_total_amount || "serviceVoucher_total_amount"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1.5} textAlign={"right"}>
                                        {dataLang?.serviceVoucher_tax_money || "serviceVoucher_tax_money"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1.5} textAlign={"right"}>
                                        {dataLang?.serviceVoucher_into_money || "serviceVoucher_into_money"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1.5} textAlign={"center"}>
                                        {dataLang?.serviceVoucher_status_of_spending || "serviceVoucher_status_of_spending"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={2} textAlign={"left"}>
                                        {dataLang?.serviceVoucher_note || "serviceVoucher_note"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"left"}>
                                        {dataLang?.serviceVoucher_branch || "serviceVoucher_branch"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1.5} textAlign={"left"}>
                                        {dataLang?.import_action || "serviceVoucher_operation"}
                                    </ColumnTable>
                                </HeaderTable>
                                {isFetching && !isState.refreshing ? (
                                    <Loading className="h-80" color="#0f4f9e" />
                                ) : data?.rResult?.length > 0 ? (
                                    <>
                                        <div className="divide-y divide-slate-200 min:h-[400px] h-[100%] max:h-[800px]">
                                            {data?.rResult?.map((e, index) => (
                                                <RowTable gridCols={16} key={e.id.toString()}>
                                                    <RowItemTable colSpan={0.5} textAlign={"center"}>
                                                        {index + 1}
                                                    </RowItemTable>
                                                    <RowItemTable colSpan={1.5} textAlign={"left"}>
                                                        {e?.date != null ? formatMoment(e?.date, FORMAT_MOMENT.DATE_SLASH_LONG) : ""}
                                                    </RowItemTable>
                                                    <RowItemTable colSpan={1.5} textAlign={"left"} className={"whitespace-nowrap"}>
                                                        <PopupDetail
                                                            dataLang={dataLang}
                                                            className="responsive-text-sm font-semibold text-center text-[#003DA0] hover:text-blue-600 transition-all ease-linear cursor-pointer"
                                                            name={e?.code}
                                                            id={e?.id}
                                                        />
                                                    </RowItemTable>
                                                    <RowItemTable colSpan={2} textAlign={"left"}>
                                                        {e.supplier_name}
                                                    </RowItemTable>
                                                    <RowItemTable colSpan={1.5} textAlign={"right"}>
                                                        {formatMoney(Number(e.total_price))} <span className="underline">đ</span>
                                                    </RowItemTable>
                                                    <RowItemTable colSpan={1.5} textAlign={"right"}>
                                                        {formatMoneyOrDash(Number(e.total_tax_price))}
                                                    </RowItemTable>
                                                    <RowItemTable colSpan={1.5} textAlign={"right"}>
                                                        {formatMoney(Number(e.total_amount))} <span className="underline">đ</span>
                                                    </RowItemTable>
                                                    <RowItemTable
                                                        colSpan={1.5}
                                                        className="flex items-center mx-auto w-fit"
                                                    >
                                                        {(e?.status_pay === "not_spent" && (
                                                            <TagColorSky name={"Chưa chi"} />
                                                        )) ||
                                                            (e?.status_pay === "spent_part" && (
                                                                <TagColorOrange name={`Chi 1 phần (${formatMoney(e?.amount_paid)})`} />
                                                            )) ||
                                                            (e?.status_pay === "spent" && (<TagColorLime name={"Đã chi đủ"} />))}
                                                    </RowItemTable>
                                                    <RowItemTable
                                                        colSpan={2}
                                                        textAlign={"left"}
                                                        className="truncate"
                                                    >
                                                        {e.note}
                                                    </RowItemTable>
                                                    <RowItemTable colSpan={1}>
                                                        {e?.branch_name}
                                                    </RowItemTable>
                                                    <RowItemTable colSpan={1.5} className="flex">
                                                        <BtnAction
                                                            onRefresh={refetch.bind(this)}
                                                            onRefreshGroup={refetchFilter.bind(this)}
                                                            dataLang={dataLang}
                                                            status_pay={e?.status_pay}
                                                            type="servicev_voucher"
                                                            id={e?.id}
                                                            className="bg-slate-100 xl:px-4 px-2 xl:py-1.5 py-1 rounded 2xl:text-base xl:text-xs text-[9px]"
                                                        />
                                                    </RowItemTable>
                                                </RowTable>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <NoData type="table" />
                                )}
                            </div>
                        </Customscrollbar>
                    </div>
                }
                showTotal={true}
                total={
                    <>
                        <ContainerTotal className={'!grid-cols-32'}>
                            <RowItemTable colSpan={5.5} textAlign={'end'} className="px-5">
                                {dataLang?.import_total || "import_total"}
                            </RowItemTable>
                            <RowItemTable colSpan={1.5} textAlign={'end'} className="flex justify-end gap-0.5">
                                {formatMoneyOrDash(data?.rTotal?.total_price)}
                            </RowItemTable>
                            <RowItemTable colSpan={1.5} textAlign={'end'} className="flex justify-end gap-0.5">
                                {formatMoneyOrDash(data?.rTotal?.total_tax_price)}
                            </RowItemTable>
                            <RowItemTable colSpan={1.5} textAlign={'end'} className="flex justify-end gap-0.5">
                                {formatMoneyOrDash(data?.rTotal?.total_amount)}
                            </RowItemTable>
                        </ContainerTotal>
                    </>
                }
                pagination={
                    <div className="flex items-center justify-between gap-2">
                        {data?.rResult?.length != 0 && (
                            <ContainerPagination>
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
            {/* <Head>
                <title>{dataLang?.serviceVoucher_title || "serviceVoucher_title"} </title>
            </Head>
            <Container>
                {statusExprired ? (
                    <EmptyExprired />
                ) : (
                    <div className="flex space-x-1 mt-4 3xl:text-sm 2xl:text-[11px] xl:text-[10px] lg:text-[10px]">
                        <h6 className="text-[#141522]/40">
                            {dataLang?.serviceVoucher_title || "serviceVoucher_title"}
                        </h6>
                        <span className="text-[#141522]/40">/</span>
                        <h6>{dataLang?.serviceVoucher_title_lits || "serviceVoucher_title_lits"}</h6>
                    </div>
                )}
                <ContainerBody>
                    <div className="space-y-0.5 h-[96%] overflow-hidden">
                        <div className="flex justify-between  mt-1 mr-2">
                            <h2 className=" 2xl:text-lg text-base text-[#52575E] capitalize">
                                {dataLang?.serviceVoucher_title_lits || "serviceVoucher_title_lits"}
                            </h2>
                            <div className="flex justify-end items-center gap-2">
                                {role == true || checkAdd ? (
                                    <PopupServieVoucher
                                        onRefreshGroup={refetchFilter.bind(this)}
                                        onRefresh={refetch.bind(this)}
                                        dataLang={dataLang}
                                        className="responsive-text-sm xl:px-5 px-3 xl:py-2.5 py-1.5 bg-background-blue-2 text-white rounded-lg btn-animation hover:scale-105"
                                    />
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            isShow("error", WARNING_STATUS_ROLE);
                                        }}
                                        className="responsive-text-sm xl:px-5 px-3 xl:py-2.5 py-1.5 bg-background-blue-2 text-white rounded-lg btn-animation hover:scale-105"
                                    >
                                        {dataLang?.branch_popup_create_new}
                                    </button>
                                )}
                            </div>
                        </div>
                        <ContainerFilterTab>
                            {dataFilterbar && dataFilterbar?.map((e) => {
                                return (
                                    <TabFilter
                                        backgroundColor="#e2f0fe"
                                        dataLang={dataLang}
                                        onClick={_HandleSelectTab.bind(this, `${e?.id}`)}
                                        total={e?.count}
                                        active={e?.id}
                                        key={e?.id}
                                        className={"text-[#0F4F9E] "}
                                    >
                                        {dataLang[e?.name] || e?.name}
                                    </TabFilter>
                                );
                            })}
                        </ContainerFilterTab>
                        <ContainerTable>
                            <div className="xl:space-y-3 space-y-2">
                                <div className="bg-slate-100 w-full rounded-t-lg items-center grid grid-cols-6 2xl:xl:p-2 xl:p-1.5 p-1.5">
                                    <div className="col-span-4">
                                        <div className="grid grid-cols-8 gap-2">
                                            <SearchComponent
                                                dataLang={dataLang}
                                                onChange={_HandleOnChangeKeySearch.bind(this)}
                                                colSpan={2}
                                            />
                                            <SelectComponent
                                                options={[
                                                    {
                                                        value: "",
                                                        label: dataLang?.serviceVoucher_branch || "serviceVoucher_branch",
                                                        isDisabled: true,
                                                    },
                                                    ...listBr,
                                                ]}
                                                onChange={(e) => queryState({ valueBr: e })}
                                                value={isState.valueBr}
                                                placeholder={dataLang?.serviceVoucher_branch || "serviceVoucher_branch"}
                                                colSpan={2}
                                                isClearable={true}
                                            />
                                            <SelectComponent
                                                onInputChange={(event) => {
                                                    _HandleSeachApi(event);
                                                }}
                                                options={[
                                                    {
                                                        value: "",
                                                        label: dataLang?.serviceVoucher_voucher_code || "serviceVoucher_voucher_code",
                                                        isDisabled: true,
                                                    },
                                                    ...listCode,
                                                ]}
                                                onChange={(e) => queryState({ valueCode: e })}
                                                placeholder={dataLang?.serviceVoucher_voucher_code || "serviceVoucher_voucher_code"}
                                                isClearable={true}
                                                colSpan={2}
                                            />
                                            <DateToDateComponent
                                                value={isState.valueDate}
                                                colSpan={2}
                                                onChange={(e) => queryState({ valueDate: e })}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <div className="flex space-x-2 items-center justify-end">
                                            <OnResetData sOnFetching={(e) => { }} onClick={() => refetch()} />
                                            {role == true || checkExport ? (
                                                <div className={``}>
                                                    {data?.rResult?.length > 0 && (
                                                        <ExcelFileComponent
                                                            multiDataSet={multiDataSet}
                                                            filename="Danh sách phiếu dịch vụ"
                                                            title="DSPDV"
                                                            dataLang={dataLang}
                                                        />
                                                    )}
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => isShow("error", WARNING_STATUS_ROLE)}
                                                    className={`xl:px-4 px-3 xl:py-2.5 py-1.5 2xl:text-xs xl:text-xs text-[7px] flex items-center space-x-2 bg-[#C7DFFB] rounded hover:scale-105 transition`}
                                                >
                                                    <Grid6 className="2xl:scale-100 xl:scale-100 scale-75" size={18} />
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
                                <div className="w-full">
                                    <HeaderTable gridCols={12}>
                                        <ColumnTable colSpan={1} textAlign={"center"}>
                                            {dataLang?.serviceVoucher_day_vouchers || "serviceVoucher_day_vouchers"}
                                        </ColumnTable>
                                        <ColumnTable colSpan={1} textAlign={"center"}>
                                            {dataLang?.serviceVoucher_voucher_code || "serviceVoucher_voucher_code"}
                                        </ColumnTable>
                                        <ColumnTable colSpan={2} textAlign={"center"}>
                                            {dataLang?.serviceVoucher_supplier || "serviceVoucher_supplier"}
                                        </ColumnTable>
                                        <ColumnTable colSpan={1} textAlign={"center"}>
                                            {dataLang?.serviceVoucher_total_amount || "serviceVoucher_total_amount"}
                                        </ColumnTable>
                                        <ColumnTable colSpan={1} textAlign={"center"}>
                                            {dataLang?.serviceVoucher_tax_money || "serviceVoucher_tax_money"}
                                        </ColumnTable>
                                        <ColumnTable colSpan={1} textAlign={"center"}>
                                            {dataLang?.serviceVoucher_into_money || "serviceVoucher_into_money"}
                                        </ColumnTable>
                                        <ColumnTable colSpan={2} textAlign={"center"}>
                                            {dataLang?.serviceVoucher_status_of_spending || "serviceVoucher_status_of_spending"}
                                        </ColumnTable>
                                        <ColumnTable colSpan={1} textAlign={"center"}>
                                            {dataLang?.serviceVoucher_note || "serviceVoucher_note"}
                                        </ColumnTable>
                                        <ColumnTable colSpan={1} textAlign={"center"}>
                                            {dataLang?.serviceVoucher_branch || "serviceVoucher_branch"}
                                        </ColumnTable>
                                        <ColumnTable colSpan={1} textAlign={"center"}>
                                            {dataLang?.serviceVoucher_operation || "serviceVoucher_operation"}
                                        </ColumnTable>
                                    </HeaderTable>
                                    {isFetching ? (
                                        <Loading className="h-80" color="#0f4f9e" />
                                    ) : data?.rResult?.length > 0 ? (
                                        <>
                                            <div className="divide-y divide-slate-200 min:h-[400px] h-[100%] max:h-[800px]">
                                                {data?.rResult?.map((e) => (
                                                    <RowTable gridCols={12} key={e.id.toString()}>
                                                        <RowItemTable colSpan={1} textAlign={"center"}>
                                                            {e?.date != null ? formatMoment(e?.date, FORMAT_MOMENT.DATE_SLASH_LONG) : ""}
                                                        </RowItemTable>
                                                        <RowItemTable colSpan={1}>
                                                            <PopupDetail
                                                                dataLang={dataLang}
                                                                className="3xl:text-base 2xl:text-[12.5px] xl:text-[11px] font-medium text-[9px] hover:text-blue-600 transition-all ease-in-out px-2 col-span-1 text-center text-[#0F4F9E]  cursor-pointer"
                                                                name={e?.code}
                                                                id={e?.id}
                                                            />
                                                        </RowItemTable>
                                                        <RowItemTable colSpan={2} textAlign={"left"}>
                                                            {e.supplier_name}
                                                        </RowItemTable>
                                                        <RowItemTable colSpan={1} textAlign={"right"}>
                                                            {formatMoney(e.total_price)}
                                                        </RowItemTable>
                                                        <RowItemTable colSpan={1} textAlign={"right"}>
                                                            {formatMoney(e.total_tax_price)}
                                                        </RowItemTable>
                                                        <RowItemTable colSpan={1} textAlign={"right"}>
                                                            {formatMoney(e.total_amount)}
                                                        </RowItemTable>
                                                        <RowItemTable
                                                            colSpan={2}
                                                            className=" flex items-center justify-center w-fit mx-auto"
                                                        >
                                                            {(e?.status_pay === "not_spent" && (
                                                                <TagColorSky name={"Chưa chi"} />
                                                            )) ||
                                                                (e?.status_pay === "spent_part" && (
                                                                    <TagColorOrange name={`Chi 1 phần (${formatNumber(e?.amount_paid)})`} />
                                                                )) ||
                                                                (e?.status_pay === "spent" && (<TagColorLime name={"Đã chi đủ"} />))}
                                                        </RowItemTable>
                                                        <RowItemTable
                                                            colSpan={1}
                                                            textAlign={"left"}
                                                            className="truncate"
                                                        >
                                                            {e.note}
                                                        </RowItemTable>
                                                        <RowItemTable colSpan={1} className={"mx-auto"}>
                                                            <TagBranch className="w-fit">{e?.branch_name}</TagBranch>
                                                        </RowItemTable>
                                                        <RowItemTable colSpan={1} className="flex justify-center">
                                                            <BtnAction
                                                                onRefresh={refetch.bind(this)}
                                                                onRefreshGroup={refetchFilter.bind(this)}
                                                                dataLang={dataLang}
                                                                status_pay={e?.status_pay}
                                                                type="servicev_voucher"
                                                                id={e?.id}
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
                        </ContainerTable>
                    </div>
                    <ContainerTotal>
                        <RowItemTable colSpan={4} textAlign={"center"}>
                            {dataLang?.purchase_order_table_total_outside || "purchase_order_table_total_outside"}
                        </RowItemTable>
                        <RowItemTable colSpan={1} textAlign={"right"} className="justify-end p-2 flex gap-2 flex-wrap">
                            {formatMoney(data?.rTotal?.total_price)}
                        </RowItemTable>
                        <RowItemTable colSpan={1} textAlign={"right"} className="justify-end p-2 flex gap-2 flex-wrap ">
                            {formatMoney(data?.rTotal?.total_tax_price)}
                        </RowItemTable>
                        <RowItemTable colSpan={1} textAlign={"right"} className="justify-end p-2 flex gap-2 flex-wrap">
                            {formatMoney(data?.rTotal?.total_amount)}
                        </RowItemTable>
                    </ContainerTotal>
                    {data?.rResult?.length != 0 && (
                        <ContainerPagination>
                            <TitlePagination dataLang={dataLang} totalItems={data?.output?.iTotalDisplayRecords} />
                            <Pagination
                                postsPerPage={limit}
                                totalPosts={Number(data?.output?.iTotalDisplayRecords)}
                                paginate={paginate}
                                currentPage={router.query?.page || 1}
                            />
                        </ContainerPagination>
                    )}
                </ContainerBody>
            </Container> */}
        </React.Fragment>
    );
};

export default ServicevVoucher;
