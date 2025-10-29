import { BtnAction } from "@/components/UI/BtnAction";
import Breadcrumb from "@/components/UI/breadcrumb/BreadcrumbCustom";
import OnResetData from "@/components/UI/btnResetData/btnReset";
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
    LayOutTableDynamic
} from "@/components/UI/common/layout";
import DropdowLimit from "@/components/UI/dropdowLimit/dropdowLimit";
import ExcelFileComponent from "@/components/UI/filterComponents/excelFilecomponet";
import SearchComponent from "@/components/UI/filterComponents/searchComponent";
import SelectComponent from "@/components/UI/filterComponents/selectComponent";
import Loading from "@/components/UI/loading/loading";
import NoData from "@/components/UI/noData/nodata";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import { WARNING_STATUS_ROLE } from "@/constants/warningStatus/warningStatus";
import { useBranchList } from "@/hooks/common/useBranch";
import useSetingServer from "@/hooks/useConfigNumber";
import { useLimitAndTotalItems } from "@/hooks/useLimitAndTotalItems";
import usePagination from "@/hooks/usePagination";
import useActionRole from "@/hooks/useRole";
import useStatusExprired from "@/hooks/useStatusExprired";
import useToast from "@/hooks/useToast";
import { formatMoment } from "@/utils/helpers/formatMoment";
import formatNumberConfig from "@/utils/helpers/formatnumber";
import { Grid6 } from "iconsax-react";
import { debounce } from "lodash";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { Fragment, useState } from "react";
import "react-phone-input-2/lib/style.css";
import { useSelector } from "react-redux";
import PopupDetailWarehouseTransfer from "../warehouse-transfer/components/pupup";
import PopupCheckQuality from "./components/popup";
import { useCheckQualityList } from "./hooks/useCheckQualityList";
import Pagination from "/components/UI/pagination";

const initilaState = {
    data: [],
    data_ex: [],
    keySearch: "",
    onFetching: false,
    onFetchingBranch: false,
    idBranch: [],
};

const CheckQuality = (props) => {
    const router = useRouter();

    const isShow = useToast();

    const dataLang = props.dataLang;

    const statusExprired = useStatusExprired();

    const [isState, sIsState] = useState(initilaState);

    const dataSeting = useSetingServer();

    const formatNumber = (num) => formatNumberConfig(+num, dataSeting);

    const { paginate } = usePagination();

    const queryState = (key) => sIsState((prev) => ({ ...prev, ...key }));

    const { is_admin: role, permissions_current: auth } = useSelector(
        (state) => state.auth
    );

    const { checkExport, checkEdit, checkAdd } = useActionRole(
        auth,
        "client_group"
    );

    // đổi type

    const {
        limit,
        updateLimit: sLimit,
        totalItems: totalItem,
        updateTotalItems,
    } = useLimitAndTotalItems();

    const { data: listBranch = [] } = useBranchList();

    const params = {
        search: isState.keySearch,
        limit: limit,
        page: router.query?.page || 1,
        branch_id: isState.idBranch?.value ?? "",
    };

    const { data, isFetching, isLoading, refetch } = useCheckQualityList(params);

    const _HandleOnChangeKeySearch = debounce(({ target: { value } }) => {
        queryState({ keySearch: value });
        router.replace("/manufacture/check-quality");
    }, 500);

    const stringMap = {
        0: "Chưa Duyệt",
        1: "Đã duyệt",
        2: "Không Duyệt",
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
                    title: `${"Ngày"}`,
                    width: { wpx: 100 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${"Số phiếu QC"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${"Số lệnh sản xuất"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${"Số phiếu CK"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${"Số lượng QC"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${"Số lượng đạt"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${"Số lượng lỗi"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${"Ghi chú"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${"Trạng thái"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
            ],
            data: data?.rResult?.map((e) => [
                { value: `${e.id}`, style: { numFmt: "0" } },
                { value: `${formatMoment(e?.date, FORMAT_MOMENT.DATE_SLASH_LONG)}` },
                { value: `${e.reference_no ? e.reference_no : ""}` },
                { value: `${e.reference_no_po ? e.reference_no_po : ""}` },
                {
                    value: `${e.transfer_warehouse
                        ? e.transfer_warehouse?.map((e) => e?.code).join(",")
                        : ""
                        }`,
                },
                { value: `${e.total_quantity ? formatNumber(e.total_quantity) : ""}` },
                {
                    value: `${e.total_quantity_success
                        ? formatNumber(e.total_quantity_success)
                        : ""
                        }`,
                },
                {
                    value: `${e.total_quantity_error ? formatNumber(e.total_quantity_error) : ""
                        }`,
                },
                { value: `${e.note ? e.note : ""}` },
                { value: `${e?.status ? stringMap[e?.status] : ""}` },
            ]),
        },
    ];

    // breadcrumb
    const breadcrumbItems = [
        {
            label: `QC`,
            // href: "/",
        },
        {
            label: `Phiếu kiểm tra chất lượng`,
        },
    ];

    const StatusTag = ({ status }) => {
        return (
            <div
                className={`${status == "0"
                    ? "bg-neutral-01 text-neutral-05 border-border-gray-1"
                    : "bg-green-02 text-green-00 border-green-01"
                    } 
          border rounded-lg px-1.5 py-1 2xl:px-2 2xl:py-1.5 3xl:px-3 3xl:py-2 flex items-center gap-2 ease-in-out transition-all`}
            >
                <span className="3xl:text-sm 2xl:text-13 xl:text-xs text-11 font-medium whitespace-nowrap">
                    {status == "0" ? "Chưa duyệt" : "Đã duyệt"}
                </span>
            </div>
        );
    };
    return (
        <React.Fragment>
            <LayOutTableDynamic
                head={
                    <Head>
                        <title>{"Phiếu kiểm tra chất lượng"}</title>
                    </Head>
                }
                breadcrumb={
                    <>
                        {statusExprired ? (
                            <EmptyExprired />
                        ) : (
                            <Breadcrumb
                                items={breadcrumbItems}
                                className="3xl:text-sm 2xl:text-xs xl:text-[10px] lg:text-[10px]"
                            />
                        )}
                    </>
                }
                titleButton={
                    <>
                        <h2 className="text-title-section text-[#52575E] capitalize font-medium">
                            {"Phiếu kiểm tra chất lượng"}
                        </h2>
                        {/* <ButtonAddNew
                                onClick={() => {
                                    // if (role) {
                                    //     router.push(routerExportToOther.form)
                                    // } else if (checkAdd) {
                                    //     router.push(routerExportToOther.form)
                                    // }
                                    // else {
                                    //     isShow("error", WARNING_STATUS_ROLE)
                                    // }
                                    router.push(routerQc.form);
                                }}
                                dataLang={dataLang}
                            /> */}
                        {/* <div className="flex items-center justify-end">
                                {role == true || checkAdd ? (
                                    <Popup_groupKh
                                        listBr={isState.listBr}
                                        onRefresh={_ServerFetching.bind(this)}
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
                            </div> */}
                    </>
                }
                table={
                    <div className="flex flex-col h-full">
                        <div className="w-full items-center flex justify-between gap-2">
                            <div className="flex gap-3 items-center w-full">
                                <SearchComponent
                                    dataLang={dataLang}
                                    onChange={_HandleOnChangeKeySearch.bind(this)}
                                    colSpan={1}
                                />
                                {/* <DateToDateComponent
                                                // value={isState.valueDate}
                                                // onChange={() => queryState({ valueDate: e })}
                                                colSpan={2}
                                            /> */}
                                <SelectComponent
                                    options={[
                                        {
                                            value: "",
                                            label:
                                                dataLang?.price_quote_branch || "price_quote_branch",
                                            isDisabled: true,
                                        },
                                        ...listBranch,
                                    ]}
                                    isClearable={true}
                                    onChange={(e) => queryState({ idBranch: e })}
                                    value={isState.idBranch}
                                    placeholder={
                                        dataLang?.price_quote_branch || "price_quote_branch"
                                    }
                                    colSpan={2}
                                    closeMenuOnSelect={true}
                                />
                            </div>
                            <div className="flex items-center justify-end space-x-2">
                                <OnResetData
                                    sOnFetching={(e) => { }}
                                    onClick={refetch.bind(this)}
                                />
                                {role == true || checkExport ? (
                                    <div className={``}>
                                        {data?.rResult?.length > 0 && (
                                            <ExcelFileComponent
                                                multiDataSet={multiDataSet}
                                                filename="Phiếu kiểm tra chất lượng"
                                                title="KTTCL"
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
                                            className="scale-75 2xl:scale-100 xl:scale-100"
                                            size={18}
                                        />
                                        <span>{dataLang?.client_list_exportexcel}</span>
                                    </button>
                                )}
                            </div>
                        </div>
                        <Customscrollbar className="3xl:h-[90%] 2xl:h-[95%] xl:h-[85%] lg:h-[90%] pb-2">
                            <div className="w-full">
                                <HeaderTable gridCols={11}>
                                    <ColumnTable colSpan={1} textAlign={"center"}>
                                        {"Ngày"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"center"}>
                                        {"Số phiếu QC"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"center"}>
                                        {"Số lệnh sản xuất"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"center"}>
                                        {"Số phiếu CK"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"center"}>
                                        {"Số lượng QC"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"center"}>
                                        {"Số lượng đạt"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"center"}>
                                        {"Số lượng lỗi"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"center"}>
                                        {"Trạng thái"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"center"}>
                                        {"Ghi chú"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"left"}>
                                        {"Chi nhánh"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"center"}>
                                        {"Tác vụ"}
                                    </ColumnTable>
                                </HeaderTable>
                                {isLoading || isFetching ? (
                                    <Loading className="h-80" color="#0f4f9e" />
                                ) : data?.rResult?.length > 0 ? (
                                    <div className="h-full divide-y divide-slate-200">
                                        {data?.rResult?.map((e) => (
                                            <RowTable gridCols={11} key={e.id.toString()}>
                                                <RowItemTable colSpan={1} textAlign={"center"}>
                                                    {formatMoment(e?.date, FORMAT_MOMENT.DATE_SLASH_LONG)}
                                                </RowItemTable>
                                                <RowItemTable colSpan={1} textAlign={"center"}>
                                                    <PopupCheckQuality
                                                        name={e?.reference_no}
                                                        dataLang={dataLang}
                                                        className="3xl:text-base 2xl:text-[12.5px] xl:text-[11px] font-medium text-[9px] px-2 text-center text-[#0F4F9E] hover:text-[#5599EC] transition-all ease-linear cursor-pointer "
                                                        id={e?.id}
                                                    />
                                                </RowItemTable>
                                                <RowItemTable colSpan={1} textAlign={"center"}>
                                                    {e?.reference_no_po}
                                                </RowItemTable>
                                                <RowItemTable colSpan={1} textAlign={"center"}>
                                                    {e?.transfer_warehouse?.map((i) => (
                                                        <Fragment key={i?.id}>
                                                            <PopupDetailWarehouseTransfer
                                                                dataLang={dataLang}
                                                                className="3xl:text-base 2xl:text-[12.5px] xl:text-[11px] font-medium text-[9px] px-2 text-[#0F4F9E] hover:text-[#5599EC] transition-all ease-linear cursor-pointer "
                                                                name={i?.code}
                                                                id={i?.id}
                                                            />
                                                        </Fragment>
                                                    ))}
                                                </RowItemTable>
                                                <RowItemTable colSpan={1} textAlign={"center"}>
                                                    {e?.total_quantity > 0
                                                        ? formatNumber(e?.total_quantity)
                                                        : "-"}
                                                </RowItemTable>
                                                <RowItemTable colSpan={1} textAlign={"center"}>
                                                    {e?.total_quantity_success > 0
                                                        ? formatNumber(e?.total_quantity_success)
                                                        : "-"}
                                                </RowItemTable>
                                                <RowItemTable
                                                    colSpan={1}
                                                    textAlign={"center"}
                                                    className={"!text-red-500"}
                                                >
                                                    {e?.total_quantity_error > 0
                                                        ? formatNumber(e?.total_quantity_error)
                                                        : "-"}
                                                </RowItemTable>
                                                <RowItemTable
                                                    colSpan={1}
                                                    className={"flex justify-center items-center"}
                                                >
                                                    {/* 0: chưa duyệt
                                                                    1: đã duyệt
                                                                    2: hủy */}
                                                    {/* <BtnStatusApprovedCustom
                                                        type={e?.status}
                                                        className={"!pointer-events-none"}
                                                    /> */}
                                                    <StatusTag status={e?.status} />
                                                </RowItemTable>
                                                <RowItemTable colSpan={1} textAlign={"left"}>
                                                    {e?.note}
                                                </RowItemTable>
                                                <RowItemTable
                                                    colSpan={1}
                                                    className={
                                                        "w-full flex flex-row justify-start items-center"
                                                    }
                                                >
                                                    {e?.branch_name}
                                                    {/* <TagBranch className="w-fit">
                                                        {e?.branch_name}
                                                    </TagBranch> */}
                                                </RowItemTable>
                                                <RowItemTable
                                                    colSpan={1}
                                                    className={"flex justify-center items-center"}
                                                >
                                                    <BtnAction
                                                        onRefresh={refetch.bind(this)}
                                                        onRefreshGroup={() => { }}
                                                        dataLang={dataLang}
                                                        id={e?.id}
                                                        type="check_quality"
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

export default CheckQuality;
