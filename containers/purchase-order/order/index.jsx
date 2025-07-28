import { BtnAction } from "@/components/UI/BtnAction";
import TabFilter from "@/components/UI/TabFilter";
import Breadcrumb from "@/components/UI/breadcrumb/BreadcrumbCustom";
import OnResetData from "@/components/UI/btnResetData/btnReset";
import ButtonAddNew from "@/components/UI/button/buttonAddNew";
import ContainerPagination from "@/components/UI/common/ContainerPagination/ContainerPagination";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import { EmptyExprired } from "@/components/UI/common/EmptyExprired";
import { ColumnTable, HeaderTable, RowItemTable, RowTable } from "@/components/UI/common/Table";
import { TagColorLime, TagColorOrange, TagColorRed, TagColorSky } from "@/components/UI/common/Tag/TagStatus";
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
import PopupDetail from "@/containers/purchase-order/order/components/popup";
import { useSupplierList } from "@/containers/suppliers/supplier/hooks/useSupplierList";
import { useBranchList } from "@/hooks/common/useBranch";
import useSetingServer from "@/hooks/useConfigNumber";
import { useLimitAndTotalItems } from "@/hooks/useLimitAndTotalItems";
import usePagination from "@/hooks/usePagination";
import useActionRole from "@/hooks/useRole";
import useStatusExprired from "@/hooks/useStatusExprired";
import useTab from "@/hooks/useTab";
import { routerOrder } from "@/routers/buyImportGoods";
import { formatMoment } from "@/utils/helpers/formatMoment";
import formatMoneyConfig from "@/utils/helpers/formatMoney";
import { Grid6 } from "iconsax-react";
import { debounce } from "lodash";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { useSelector } from "react-redux";
import { useOrderFilterbar } from "./hooks/useOrderFilterbar";
import { useOrderList, useOrderListCode } from "./hooks/useOrderList";
import { useOrderTypeList } from "./hooks/useOrderTypeList";

const initalState = {
    keySearch: "",
    valueBr: null,
    valueCode: null,
    valueSupplier: null,
    valueOrderType: null,
    valueDate: { startDate: null, endDate: null }
};

const Order = (props) => {
    const dataLang = props.dataLang;

    const router = useRouter();

    const { paginate } = usePagination();

    const dataSeting = useSetingServer();

    const statusExprired = useStatusExprired();

    const [isState, sIsState] = useState(initalState);

    const { handleTab: _HandleSelectTab } = useTab('all');

    const { limit, updateLimit: sLimit } = useLimitAndTotalItems();

    const queryState = (key) => sIsState((prev) => ({ ...prev, ...key }));

    const { is_admin: role, permissions_current: auth } = useSelector((state) => state.auth);

    const { checkAdd, checkExport } = useActionRole(auth, "order");

    const params = {
        search: isState.keySearch,
        limit: limit,
        page: router.query?.page || 1,
        "filter[branch_id]": isState.valueBr != null ? isState.valueBr?.value : null,
        "filter[id]": isState.valueCode != null ? isState.valueCode?.value : null,
        "filter[status_bar]": router.query?.tab ?? null,
        "filter[supplier_id]": isState.valueSupplier ? isState.valueSupplier.value : null,
        "filter[order_type]": isState.valueOrderType ? isState.valueOrderType.value : null,
        "filter[start_date]": isState.valueDate?.startDate != null ? isState.valueDate?.startDate : null,
        "filter[end_date]": isState.valueDate?.endDate != null ? isState.valueDate?.endDate : null,
    }

    const { data: listBr = [] } = useBranchList()

    const { data: listCode = [] } = useOrderListCode()

    const { data: dataListSupplier } = useSupplierList()

    const { data: listOrderType = [] } = useOrderTypeList(dataLang)

    const listSupplier = dataListSupplier?.rResult?.map((e) => ({ label: e.name, value: e.id })) || []

    const { data: dataFilterbar } = useOrderFilterbar(params)

    const { data, isFetching, refetch } = useOrderList(params)

    const _HandleOnChangeKeySearch = debounce(({ target: { value } }) => {
        queryState({ keySearch: value });
        router.replace({
            pathname: router.route,
            query: {
                tab: router.query?.tab,
            },
        });
    }, 500);

    const formatMoney = (number) => {
        return formatMoneyConfig(+number, dataSeting);
    };

    const renderMoneyOrDash = (value) => {
        return Number(value) === 0
            ? "-"
            : <>{formatMoney(value)} <span className="underline">đ</span></>;
    };  

    const statusMap = {
        "0": "Chưa nhập",
        "1": "Nhập 1 phần",
        "2": "Đã nhập đủ",
    };

    const getStatusText = (e) => {
        return e?.status_pay ? statusMap[e.status_pay] || "" : "";
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
                    title: `${dataLang?.purchase_order_table_dayvoucers || "purchase_order_table_dayvoucers"}`,
                    width: { wpx: 100 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.purchase_order_table_code || "purchase_order_table_code"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.purchase_order_table_supplier || "purchase_order_table_supplier"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.purchase_order_table_ordertype || "purchase_order_table_ordertype"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `Số kế hoạch`,
                    // title: `${dataLang?.purchase_order_table_number || "purchase_order_table_number"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.purchase_order_table_total || "purchase_order_table_total"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.purchase_order_table_totalTax || "purchase_order_table_totalTax"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.purchase_order_table_intoMoney || "purchase_order_table_intoMoney"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                // {title: `${dataLang?.purchase_order_table_statusOfSpending || "purchase_order_table_statusOfSpending"}`, width: {wch: 40}, style: {fill: {fgColor: {rgb: "C7DFFB"}}, font: {bold: true}}},
                {
                    title: `${dataLang?.purchase_order_table_importStatus || "purchase_order_table_importStatus"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.purchase_order_table_branch || "purchase_order_table_branch"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.purchase_order_note || "purchase_order_note"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
            ],
            data: data?.rResult?.map((e) => [
                { value: `${e?.id ? e.id : ""}`, style: { numFmt: "0" } },
                { value: `${(e?.date && e?.date != "0000-00-00") ? formatMoment(e?.date, FORMAT_MOMENT.DATE_TIME_SLASH_LONG) : ""}` },
                { value: `${e?.code ? e?.code : ""}` },
                { value: `${e?.supplier_name ? e?.supplier_name : ""}` },
                {
                    value: `${e?.status_plan == "1" ? "KHSX" : e?.order_type ? (e?.order_type == "0" ? "Tạo mới" : "Theo YCHM") : ""}`,
                },
                {
                    value: `${e?.list_production_plan
                        ? e?.list_production_plan?.map((e) => {
                            return e?.reference_no;
                        })
                        : ""
                        }`,
                    // value: `${e?.purchases
                    //     ? e?.purchases?.map((e) => {
                    //         return e?.code;
                    //     })
                    //     : ""
                    //     }`,
                },
                {
                    value: `${e?.total_price ? formatMoney(e?.total_price) : ""}`,
                },
                {
                    value: `${e?.total_tax_price ? formatMoney(e?.total_tax_price) : ""}`,
                },
                {
                    value: `${e?.total_amount ? formatMoney(e?.total_amount) : ""}`,
                },
                // {value: `${e?.import_status ? e?.import_status === "0" && "Chưa chi" || e?.import_status === "1" && "Chi 1 phần" ||  e?.import_status === "2"  &&"Đã chi đủ" : ""}`},
                {
                    value: `${dataLang[e?.import_status] || e?.import_status || ""}`,
                    // value: `${e?.status_pay
                    //     ? (e?.status_pay == "0" && "Chưa nhập") ||
                    //     (e?.status_pay == "1" && "Nhập 1 phần") ||
                    //     (e?.status_pay == "2" && "Đã nhập đủ")
                    //     : ""
                    //     }`,
                },
                { value: `${e?.branch_name ? e?.branch_name : ""}` },
                { value: `${e?.note ? e?.note : ""}` },
            ]),
        },
    ];

    const breadcrumbItems = [
        {
            label: `${dataLang?.purchase_purchase || "purchase_purchase"}`,
            // href: "/",
        },
        {
            label: `${"Đơn hàng mua (PO)"}`,
        },
    ];

    return (
        <React.Fragment>
            <LayOutTableDynamic
                head={<Head>
                    <title>Đơn hàng mua (PO) </title>
                </Head>}

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
                            Đơn hàng mua (PO)
                        </h2>
                        <ButtonAddNew
                            onClick={() => {
                                if (role) {
                                    router.push(routerOrder.form);
                                } else if (checkAdd) {
                                    router.push(routerOrder.form);
                                } else {
                                    isShow("warning", WARNING_STATUS_ROLE);
                                }
                            }}
                            dataLang={dataLang}
                            type="button"
                            className="responsive-text-sm xl:px-5 px-3 xl:py-2.5 py-1.5 bg-background-blue-2 text-white rounded-lg btn-animation hover:scale-105"
                        >
                            {/* {dataLang?.btn_new || "btn_new"} */}
                        </ButtonAddNew>
                    </>
                }
                fillterTab={
                    <>
                        {dataFilterbar && dataFilterbar?.map((e) => {
                            return (
                                <TabFilter
                                    style={{ backgroundColor: "#e2f0fe" }}
                                    dataLang={dataLang}
                                    key={e.id}
                                    onClick={_HandleSelectTab.bind(this, `${e.id}`)}
                                    total={e.count}
                                    active={e.id}
                                    className={"text-[#0F4F9E]"}
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
                                    <SearchComponent
                                        colSpan={1}
                                        dataLang={dataLang}
                                        placeholder={dataLang?.branch_search}
                                        onChange={_HandleOnChangeKeySearch.bind(this)}
                                    />
                                    <div className="z-20 col-span-1">
                                        <DateToDateComponent
                                            value={isState.valueDate}
                                            onChange={(e) => queryState({ valueDate: e })}
                                        />
                                    </div>
                                    <SelectComponent
                                        options={[
                                            {
                                                value: "",
                                                label: dataLang?.purchase_order_table_branch || "purchase_order_table_branch",
                                                isDisabled: true,
                                            },
                                            ...listBr,
                                        ]}
                                        onChange={(e) => queryState({ valueBr: e })}
                                        value={isState.valueBr}
                                        placeholder={dataLang?.purchase_order_table_branch || "purchase_order_table_branch"}
                                        hideSelectedOptions={false}
                                        isClearable={true}
                                        colSpan={1}
                                        className={"w-[150px]"}
                                    />
                                    <SelectComponent
                                        options={[
                                            {
                                                value: "",
                                                label: dataLang?.purchase_order_table_code || "purchase_order_table_code",
                                                isDisabled: true,
                                            },
                                            ...listCode,
                                        ]}
                                        onChange={(e) => queryState({ valueCode: e })}
                                        value={isState.valueCode}
                                        placeholder={dataLang?.purchase_order_table_code || "purchase_order_table_code"}
                                        hideSelectedOptions={false}
                                        isClearable={true}
                                        colSpan={1}
                                        className={"w-[150px]"}
                                    />
                                    <SelectComponent
                                        options={[
                                            {
                                                value: "",
                                                label: dataLang?.purchase_order_table_supplier || "purchase_order_table_supplier",
                                                isDisabled: true,
                                            },
                                            ...listSupplier,
                                        ]}
                                        onChange={(e) => queryState({ valueSupplier: e })}
                                        value={isState.valueSupplier}
                                        placeholder={dataLang?.purchase_order_table_supplier || "purchase_order_table_supplier"}
                                        hideSelectedOptions={false}
                                        isClearable={true}
                                        isSearchable={true}
                                        noOptionsMessage={() => "Không có dữ liệu"}
                                    />
                                    <SelectComponent
                                        options={[
                                            {
                                                value: "",
                                                label: "Loại đặt hàng",
                                                isDisabled: true,
                                            },
                                            ...listOrderType,
                                        ]}
                                        onChange={(e) => queryState({ valueOrderType: e })}
                                        value={isState.valueOrderType}
                                        placeholder={"Loại đặt hàng"}
                                        hideSelectedOptions={false}
                                        isClearable={true}
                                        colSpan={1}
                                        className={"w-[160px]"}
                                    />
                            </div>
                            <div className="col-span-1 xl:col-span-2 lg:col-span-2">
                                <div className="flex items-center justify-end gap-2">
                                    <OnResetData onClick={refetch.bind(this)} sOnFetching={(e) => { }} />
                                    {role == true || checkExport ? (
                                        <div className={``}>
                                            {data?.rResult?.length > 0 && (
                                                <ExcelFileComponent
                                                    dataLang={dataLang}
                                                    filename="Danh sách đơn hàng mua (PO)"
                                                    title="DSDHM (PO)"
                                                    multiDataSet={multiDataSet}
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => isShow("warning", WARNING_STATUS_ROLE)}
                                            className={`xl:px-4 px-3 xl:py-2.5 py-1.5 2xl:text-xs xl:text-xs text-[7px] flex items-center space-x-2 bg-[#C7DFFB] rounded hover:scale-105 transition`}
                                        >
                                            <Grid6 className="scale-75 2xl:scale-100 xl:scale-100" size={18} />
                                            <span>{dataLang?.client_list_exportexcel}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                        <Customscrollbar className="h-full overflow-y-auto">
                            <div className="w-full">
                                <HeaderTable gridCols={13}>
                                    <ColumnTable colSpan={0.5} textAlign={"center"}>
                                        {dataLang?.stt || "STT"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign="left">
                                        {dataLang?.purchase_order_table_dayvoucers || "purchase_order_table_dayvoucers"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"left"}>
                                        {dataLang?.purchase_order_table_code || "purchase_order_table_code"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1.5} textAlign={"left"}>
                                        {dataLang?.purchase_order_table_supplier || "purchase_order_table_supplier"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"left"}>
                                        {dataLang?.purchase_order_table_ordertype || "purchase_order_table_ordertype"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"left"}>
                                        Số Kế hoạch
                                        {/* {dataLang?.purchase_order_table_number || "purchase_order_table_number"} */}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"right"}>
                                        {dataLang?.purchase_order_table_total || "purchase_order_table_total"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"right"}>
                                        {dataLang?.purchase_order_table_totalTax || "purchase_order_table_totalTax"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"right"}>
                                        {dataLang?.purchase_order_table_intoMoney || "purchase_order_table_intoMoney"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"center"}>
                                        {dataLang?.purchase_order_table_importStatus || "purchase_order_table_importStatus"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"left"}>
                                        {dataLang?.purchase_order_note || "purchase_order_note"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"left"}>
                                        {dataLang?.purchase_order_table_branch || "purchase_order_table_branch"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"left"}>
                                        {dataLang?.import_action || "purchase_order_table_operations"}
                                    </ColumnTable>
                                </HeaderTable>
                                {isFetching ? (
                                    <Loading className="h-80" color="#0f4f9e" />
                                ) : data?.rResult?.length > 0 ? (
                                    <div className="divide-y divide-slate-200 min:h-[400px] h-[100%] max:h-[800px] ">
                                        {data?.rResult?.map((e, index) => (
                                            <RowTable key={e?.id} gridCols={13}>
                                                <RowItemTable colSpan={0.5} textAlign={"center"}>
                                                    {index + 1}
                                                </RowItemTable>
                                                <RowItemTable colSpan={1} textAlign="left">
                                                    {(e?.date != null && e?.date != "0000-00-00") ? formatMoment(e?.date, FORMAT_MOMENT.DATE_SLASH_LONG) : ""}
                                                </RowItemTable>
                                                <RowItemTable colSpan={1}>
                                                    <PopupDetail
                                                        dataLang={dataLang}
                                                        className="3xl:text-sm 2xl:text-13 xl:text-xs text-11 font-semibold text-center text-[#003DA0] hover:text-blue-600 transition-all ease-linear cursor-pointer "
                                                        name={e?.code}
                                                        id={e?.id}
                                                    />
                                                </RowItemTable>
                                                <RowItemTable colSpan={1.5} textAlign="left">
                                                    {e.supplier_name}
                                                </RowItemTable>
                                                <RowItemTable
                                                    colSpan={1}
                                                    className={"flex justify-center text-center"}
                                                >

                                                    {e?.status_plan == "1"
                                                        ?
                                                        <TagColorOrange name={"KHSX"} />
                                                        :
                                                        e?.order_type == "0"
                                                            ? (
                                                                <TagColorRed name={"Đặt mới"} />
                                                            ) : (
                                                                <TagColorRed name={"Đặt mới"} />
                                                            )}
                                                    {/* {e?.order_type == "0" ? (
                                                            <TagColorRed name={"Tạo mới"} />
                                                        ) : (
                                                            <TagColorOrange name={"YCMH"} />
                                                        )} */}
                                                </RowItemTable>
                                                <RowItemTable
                                                    colSpan={1}
                                                    className={"flex-col items-center justify-center"}
                                                >
                                                    {e?.list_production_plan?.map((purchase, index) => (
                                                        // id_plan
                                                        // : 
                                                        // "3"
                                                        // id_purchase_order
                                                        // : 
                                                        // "92"
                                                        // reference_no
                                                        // : 
                                                        // "KHSX-22052437"
                                                        <React.Fragment key={purchase?.id_plan}>
                                                            <div className="responsive-text-sm px-1 col-span-1 text-center items-center justify-center flex flex-wrap text-[#0F4F9E]  transition-all ease-in-out">
                                                                {purchase?.reference_no}
                                                            </div>
                                                        </React.Fragment>
                                                    ))}
                                                    {/* {e?.purchases?.map((purchase, index) => (
                                                            <React.Fragment key={purchase.id}>
                                                                <PopupDetailThere
                                                                    dataLang={dataLang}
                                                                    className="3xl:text-base 2xl:text-[12.5px] px-2 col-span-1 text-left flex flex-wrap text-[#0F4F9E] hover:text-blue-600 transition-all ease-in-out"
                                                                    type={e?.order_type}
                                                                    id={purchase.id}
                                                                    name={purchase.code}
                                                                />
                                                            </React.Fragment>
                                                        ))} */}
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
                                                <RowItemTable
                                                    colSpan={1}
                                                    className="flex items-center justify-center text-center "
                                                >
                                                    {(e?.import_status === "not_stocked" && (
                                                        <TagColorSky name={dataLang[e?.import_status] || e?.import_status} />
                                                    )) ||
                                                        (e?.import_status === "stocked_part" && (
                                                            <TagColorOrange name={dataLang[e?.import_status] || e?.import_status} />
                                                        )) ||
                                                        (e?.import_status === "stocked" && (
                                                            <TagColorLime name={dataLang[e?.import_status] || e?.import_status} />
                                                        ))}
                                                </RowItemTable>
                                                <RowItemTable
                                                    colSpan={1}
                                                    textAlign={"text-left"}
                                                    className="truncate "
                                                >
                                                    {e.note}
                                                </RowItemTable>
                                                <RowItemTable colSpan={1}>
                                                    {/* <TagBranch className="w-fit"> */}
                                                        {e?.branch_name}
                                                    {/* </TagBranch> */}
                                                </RowItemTable>
                                                <RowItemTable colSpan={1} className="flex justify-center ">
                                                    <BtnAction
                                                        onRefresh={refetch.bind(this)}
                                                        dataLang={dataLang}
                                                        id={e?.id}
                                                        status={e?.import_status}
                                                        status_pay={e?.status_pay}
                                                        type="order"
                                                        data={e}
                                                        className="bg-slate-100 xl:px-4 px-2 xl:py-1.5 py-1 rounded 2xl:text-base xl:text-xs text-[9px]"
                                                    />
                                                </RowItemTable>
                                            </RowTable>
                                        ))}
                                    </div>
                                ) : (
                                    <NoData />
                                )}
                            </div>
                        </Customscrollbar>
                    </div>
                }

                showTotal={true}
                total={<>
                    <ContainerTotal className="!grid-cols-13">
                        <RowItemTable colSpan={3} textAlign={"end"} className="px-5">
                            {dataLang?.purchase_order_table_total_outside || "purchase_order_table_total_outside"}
                        </RowItemTable>
                        <RowItemTable
                            colSpan={0.5}
                            textAlign={"right"}
                        >
                            {renderMoneyOrDash(data?.rTotal?.total_price)}
                        </RowItemTable>
                        <RowItemTable
                            colSpan={0.5}
                            textAlign={"right"}
                        >
                            {renderMoneyOrDash(data?.rTotal?.total_tax_price)}
                        </RowItemTable>
                        <RowItemTable
                            colSpan={0.5}
                            textAlign={"right"}
                        >
                            {renderMoneyOrDash(data?.rTotal?.total_amount)}
                        </RowItemTable>
                    </ContainerTotal>
                </>}

                pagination={
                    <div className="flex items-center justify-between gap-2">
                        {data?.rResult?.length != 0 && (
                            <ContainerPagination>
                                {/* <TitlePagination dataLang={dataLang} totalItems={data?.output?.iTotalDisplayRecords} /> */}
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
        </React.Fragment>
    );
};

export default Order;
