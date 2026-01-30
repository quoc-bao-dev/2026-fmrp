import apiExportToOther from "@/Api/apiManufacture/warehouse/exportToOther/apiExportToOther";
import { BtnAction } from "@/components/UI/BtnAction";
import TabFilter from "@/components/UI/TabFilter";
import Breadcrumb from "@/components/UI/breadcrumb/BreadcrumbCustom";
import OnResetData from "@/components/UI/btnResetData/btnReset";
import ButtonWarehouse from "@/components/UI/btnWarehouse/btnWarehouse";
import ButtonAddNew from "@/components/UI/button/buttonAddNew";
import ContainerPagination from "@/components/UI/common/ContainerPagination/ContainerPagination";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import { EmptyExprired } from "@/components/UI/common/EmptyExprired";
import { ColumnTable, HeaderTable, RowItemTable, RowTable } from "@/components/UI/common/Table";
import { TagColorMore, TagColorOrange, TagColorRed, TagColorSky } from "@/components/UI/common/Tag/TagStatus";
import { ContainerTotal, LayOutTableDynamic } from "@/components/UI/common/layout";
import CustomAvatar from "@/components/UI/common/user/CustomAvatar";
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
import { useObject } from "@/hooks/common/useObject";
import { useWarehouseComboboxByManufacture } from "@/hooks/common/useWarehouses";
import useSetingServer from "@/hooks/useConfigNumber";
import { useLimitAndTotalItems } from "@/hooks/useLimitAndTotalItems";
import usePagination from "@/hooks/usePagination";
import useActionRole from "@/hooks/useRole";
import useStatusExprired from "@/hooks/useStatusExprired";
import useTab from "@/hooks/useTab";
import useToast from "@/hooks/useToast";
import { useToggle } from "@/hooks/useToggle";
import { routerExportToOther } from "@/routers/manufacture";
import { formatMoment } from "@/utils/helpers/formatMoment";
import formatMoneyConfig from "@/utils/helpers/formatMoney";
import { Grid6 } from "iconsax-react";
import { debounce } from "lodash";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { useSelector } from "react-redux";
import LinkWarehouse from "../components/linkWarehouse";
import PopupStatus from "../components/popupStatus";
import PopupDetail from "./components/popup";
import { useExportToOtherCombobox } from "./hooks/useExportToOtherCombobox";
import { useExportToOtherFillterbar } from "./hooks/useExportToOtherFillterbar";
import { useExportToOtherList } from "./hooks/useExportToOtherList";
import { useExportToOtherDetail } from "./hooks/useExportToOtherDetail";
import { PrinterIcon } from "@/components/icons";
import { printExportToOtherPDF } from "./utils/printExportToOtherPDF";

const initialState = {
    onSending: false,
    keySearch: "",
    keySearchCode: "",
    idCode: null,
    idRecallWarehouse: null,
    idSupplier: null,
    idBranch: null,
    idObject: null,
    valueDate: { startDate: null, endDate: null },
    dataExport: [],
    refreshing: false,
};

const ExportToOther = (props) => {
    const dataLang = props.dataLang;

    const isShow = useToast();

    const router = useRouter();

    const dataSeting = useSetingServer();

    const { paginate } = usePagination();

    const statusExprired = useStatusExprired();

    const [isState, sIsState] = useState(initialState);

    const { handleTab: _HandleSelectTab } = useTab('all')

    const { isOpen, isKeyState, handleQueryId } = useToggle();

    const queryState = (key) => sIsState((prev) => ({ ...prev, ...key }));

    const [checkedWare, sCheckedWare] = useState({});

    const [openPrintPdf, setOpenPrintPdf] = useState(false);
    const [selectedPrintId, setSelectedPrintId] = useState(null);

    const { is_admin: role, permissions_current: auth } = useSelector((state) => state.auth);

    const { checkAdd, checkExport } = useActionRole(auth, "exportToOther");

    const { limit, updateLimit: sLimit } = useLimitAndTotalItems();

    const { data: printData, isFetching: isFetchingPrint } = useExportToOtherDetail(openPrintPdf, selectedPrintId);

    const params = {
        search: isState.keySearch,
        limit: limit,
        page: router.query?.page || 1,
        "filter[status_bar]": router.query?.tab ?? null,
        "filter[id]": isState.idCode != null ? isState.idCode?.value : null,
        "filter[branch_id]": isState.idBranch != null ? isState.idBranch.value : null,
        "filter[start_date]": isState.valueDate?.startDate != null ? isState.valueDate?.startDate : null,
        "filter[end_date]": isState.valueDate?.endDate != null ? isState.valueDate?.endDate : null,
        "filter[warehouse_id]": isState.idRecallWarehouse != null ? isState.idRecallWarehouse?.value : null,
        "filter[object]": isState.idObject != null ? isState.idObject?.value : null,
    }

    const { data: listBranch = [] } = useBranchList()

    const { data: listObject = [] } = useObject(dataLang)

    const { data, refetch, isFetching } = useExportToOtherList(params)

    const { data: listWarehouse = [] } = useWarehouseComboboxByManufacture()

    const { data: listCode = [] } = useExportToOtherCombobox(isState.keySearchCode)

    const { data: dataFillterBar, refetch: refetchFillterBar } = useExportToOtherFillterbar({ ...params, page: undefined, limit: 0, "filter[status_bar]": undefined })

    const _HandleSeachApi = debounce(async (inputValue) => {
        try {
            queryState({ keySearchCode: inputValue });
        } catch (error) { }
    }, 500);

    const formatNumber = (number) => {
        return formatMoneyConfig(+number, dataSeting);
    };

    const renderMoneyOrDash = (value) => {
        return Number(value) === 0
            ? "-"
            : <>{formatNumber(value)} <span className="underline">đ</span></>;
    };   

    const _HandleOnChangeKeySearch = debounce(({ target: { value } }) => {
        queryState({ keySearch: value });
        router.replace({
            pathname: router.route,
            query: {
                tab: router.query?.tab,
            },
        });
    }, 500);

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
            _ServerSending(dataChecked)
        }
        handleQueryId({ status: false });
    };

    const _HandleChangeInput = (id, checkedUn, type, value) => {
        handleQueryId({
            status: true,
            initialKey: {
                id,
                checkedUn,
                type,
                value,
            }
        });
    };
    const _ServerSending = async (checkedWare) => {
        let data = new FormData();
        data.append("warehouseman_id", checkedWare?.checkedpost != "0" ? checkedWare?.checkedpost : "");
        data.append("id", checkedWare?.id);
        try {
            const { isSuccess, message, data_export } = await apiExportToOther.apiHandingStatus(data);
            if (isSuccess) {
                isShow("success", dataLang[message] || message);
                queryState({ refreshing: true });
                await refetch()
                await refetchFillterBar()
                queryState({ refreshing: false });
            } else {
                isShow("error", dataLang[message] || message);
            }
            if (data_export?.length > 0) {
                queryState({ dataExport: data_export });
            }
        } catch (error) {
            throw error
        }
        queryState({ onSending: false });
    };

    const handlePrintClick = (id) => {
        setSelectedPrintId(id);
        setOpenPrintPdf(true);
    };

    useEffect(() => {
        if (openPrintPdf && selectedPrintId && printData && !isFetchingPrint) {
            (async () => {
                await printExportToOtherPDF({
                    data: printData,
                    dataLang: dataLang,
                    dataSeting: dataSeting,
                });
            })();
            setOpenPrintPdf(false);
            setSelectedPrintId(null);
        }
    }, [openPrintPdf, selectedPrintId, printData, isFetchingPrint, dataLang, dataSeting]);


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
                    title: `${dataLang?.exportToOthe_objectType || "exportToOthe_objectType"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.production_warehouse_orderNumber || "production_warehouse_orderNumber"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.production_warehouse_expWarehouse || "production_warehouse_expWarehouse"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.production_warehouse_Total_value || "production_warehouse_Total_value"}`,
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
                {
                    title: `${dataLang?.production_warehouse_creator || "production_warehouse_creator"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.import_brow_storekeepers || "import_brow_storekeepers"}`,
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
            ],
            data: data?.rResult?.map((e) => [
                { value: `${e?.id ? e.id : ""}`, style: { numFmt: "0" } },
                { value: `${e?.date ? e?.date : ""}` },
                { value: `${e?.code ? e?.code : ""}` },
                { value: `${"Số LSX chi tiết"}` },
                { value: `${e?.object ? dataLang[e?.object] : ""}` },
                { value: `${e?.warehouse_name ? e?.warehouse_name : ""}` },
                { value: `${e?.amount ? formatNumber(e?.amount) : ""}`, },
                { value: `${e?.note ? e?.note : ""}` },
                { value: `${e?.staff_create?.full_name ? e?.staff_create?.full_name : ""}`, },
                { value: `${e?.warehouseman_id === "0" ? "Chưa duyệt kho" : "Đã duyệt kho"}`, },
                { value: `${e?.branch_name ? e?.branch_name : ""}` },
            ]),
        },
    ];

    // breadcrumb
    const breadcrumbItems = [
        {
            label: `${dataLang?.Warehouse_title || "Warehouse_title"}`,
            // href: "/",
        },
        {
            label: `${dataLang?.exportToOthe_list || "exportToOthe_list"}`,
        },
    ];

    return (
        <React.Fragment>
            <LayOutTableDynamic
                head={
                    <Head>
                        <title>{dataLang?.exportToOthe_exporttoOther || "exportToOthe_exporttoOther"}</title>
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
                            {dataLang?.exportToOthe_list || "exportToOthe_list"}
                        </h2>
                        <ButtonAddNew
                            onClick={() => {
                                if (role) {
                                    router.push(routerExportToOther.form);
                                } else if (checkAdd) {
                                    router.push(routerExportToOther.form);
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
                        {dataFillterBar && dataFillterBar?.map((e) => {
                            return (
                                <TabFilter
                                    dataLang={dataLang}
                                    key={e.id}
                                    onClick={_HandleSelectTab.bind(this, `${e.id}`)}
                                    total={e.count}
                                    active={e.id}
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
                                    <DateToDateComponent
                                        value={isState.valueDate}
                                        onChange={(e) => queryState({ valueDate: e })}
                                        colSpan={1}
                                    />
                                    <SelectComponent
                                        options={[
                                            {
                                                value: "",
                                                label: dataLang?.purchase_order_table_branch || "purchase_order_table_branch",
                                                isDisabled: true,
                                            },
                                            ...listBranch,
                                        ]}
                                        onChange={(e) => queryState({ idBranch: e })}
                                        value={isState.idBranch}
                                        placeholder={dataLang?.purchase_order_table_branch || "purchase_order_table_branch"}
                                        hideSelectedOptions={false}
                                        isClearable={true}
                                        colSpan={1}
                                        className={"w-[150px] 3xl:w-[200px]"}
                                    />
                                    <SelectComponent
                                        options={[
                                            {
                                                value: "",
                                                label: dataLang?.exportToOthe_objectType || "exportToOthe_objectType",
                                                isDisabled: true,
                                            },
                                            ...listObject,
                                        ]}
                                        onChange={(e) => queryState({ idObject: e })}
                                        value={isState.idObject}
                                        placeholder={dataLang?.exportToOthe_objectType || "exportToOthe_objectType"}
                                        isClearable={true}
                                        colSpan={1}
                                        className={"w-[150px] 3xl:w-[200px]"}
                                    />
                                    <SelectComponent
                                        onInputChange={(event) => {
                                            _HandleSeachApi(event);
                                        }}
                                        options={[
                                            {
                                                value: "",
                                                label: dataLang?.purchase_order_table_code || "purchase_order_table_code",
                                                isDisabled: true,
                                            },
                                            ...listCode,
                                        ]}
                                        onChange={(e) => queryState({ idCode: e })}
                                        value={isState.idCode}
                                        placeholder={
                                            dataLang?.purchase_order_table_code || "purchase_order_table_code"
                                        }
                                        hideSelectedOptions={false}
                                        isClearable={true}
                                        colSpan={1}
                                        className={"w-[150px] 3xl:w-[200px]"}
                                    />
                                    <SelectComponent
                                        options={[
                                            {
                                                value: "",
                                                label: dataLang?.exportToOthe_warehouse || "exportToOthe_warehouse",
                                                isDisabled: true,
                                            },
                                            ...listWarehouse,
                                        ]}
                                        onChange={(e) => queryState({ idRecallWarehouse: e })}
                                        value={isState.idRecallWarehouse}
                                        placeholder={dataLang?.exportToOthe_warehouse || "exportToOthe_warehouse"}
                                        hideSelectedOptions={false}
                                        isClearable={true}
                                        colSpan={1}
                                    />
                            </div>
                            <div className="col-span-1 xl:col-span-2 lg:col-span-2">
                                <div className="flex items-center justify-end gap-2">
                                    <OnResetData sOnFetching={(e) => { }} onClick={() => refetch()} />
                                    {role == true || checkExport ? (
                                        <div className={``}>
                                            {data?.rResult?.length > 0 && (
                                                <ExcelFileComponent
                                                    dataLang={dataLang}
                                                    filename={"Danh sách xuất kho khác"}
                                                    title="DSXKK"
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
                        </div>
                        <Customscrollbar className='h-full overflow-y-auto'>
                            <div className="w-full">
                                <HeaderTable gridCols={12} display={"grid"}>
                                    <ColumnTable colSpan={0.5} textAlign={"center"}>
                                        {dataLang?.stt || "stt"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"left"}>
                                        {dataLang?.import_day_vouchers || "import_day_vouchers"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"left"}>
                                        {dataLang?.import_code_vouchers || "import_code_vouchers"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"left"}>
                                        {dataLang?.exportToOthe_objectType || "exportToOthe_objectType"}
                                    </ColumnTable>
                                    {/* <ColumnTable colSpan={1} textAlign={"left"}>
                                        {dataLang?.production_warehouse_LSX || "production_warehouse_LSX"}
                                    </ColumnTable> */}
                                    <ColumnTable colSpan={1.5} textAlign={"left"}>
                                        {dataLang?.exportToOthe_warehouse || "exportToOthe_warehouse"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"left"}>
                                        {dataLang?.exportToOthe_totalValue || "exportToOthe_totalValue"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={2} textAlign={"left"}>
                                        {dataLang?.production_warehouse_note || "production_warehouse_note"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"left"}>
                                        {dataLang?.production_warehouse_creator || "production_warehouse_creator"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"left"}>
                                        {dataLang?.production_warehouse_browse || "production_warehouse_browse"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"left"}>
                                        {dataLang?.import_branch || "import_branch"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"center"}>
                                        {dataLang?.import_action || "import_action"}
                                    </ColumnTable>
                                </HeaderTable>
                                {(isFetching && !isState.refreshing) ? (
                                    <Loading className="h-80" color="#0f4f9e" />
                                ) : data?.rResult?.length > 0 ? (
                                    <>
                                        <div className="h-full divide-y divide-slate-200">
                                            {data?.rResult?.map((e, index) => (
                                                <RowTable gridCols={12} key={e.id.toString()}>
                                                    <RowItemTable colSpan={0.5} textAlign={"center"}>
                                                        {index + 1}
                                                    </RowItemTable>
                                                    <RowItemTable colSpan={1} textAlign={"left"}>
                                                        {e?.date != null ? formatMoment(e?.date, FORMAT_MOMENT.DATE_SLASH_LONG) : ""}
                                                    </RowItemTable>
                                                    <RowItemTable colSpan={1}>
                                                        <PopupDetail
                                                            dataLang={dataLang}
                                                            className="responsive-text-sm font-medium text-center text-[#0F4F9E] hover:text-[#5599EC] transition-all ease-linear cursor-pointer "
                                                            name={e?.code}
                                                            id={e?.id}
                                                        />
                                                    </RowItemTable>
                                                    <RowItemTable
                                                        colSpan={1}
                                                        className="flex"
                                                    >
                                                        {(e?.object == "client" && (
                                                            <TagColorSky name={dataLang[e?.object]} />
                                                        )) ||
                                                            (e?.object == "supplier" && (
                                                                <TagColorOrange name={dataLang[e?.object]} />
                                                            )) ||
                                                            (e?.object == "other" && (
                                                                <TagColorRed name={dataLang[e?.object]} />
                                                            )) ||
                                                            (e?.object == "staff" && (
                                                                <TagColorMore
                                                                    backgroundColor={"#99f6e4"}
                                                                    color={"#0f766e"}
                                                                    name={dataLang[e?.object]}
                                                                />
                                                            ))}
                                                    </RowItemTable>
                                                    {/* <RowItemTable
                                                        colSpan={1}
                                                    ></RowItemTable> */}
                                                    <RowItemTable colSpan={1.5} textAlign={"left"}>
                                                        <LinkWarehouse
                                                            disbleClick={true}
                                                            colSpan={1}
                                                            warehouse_id={e?.warehouse_id}
                                                            warehouse_name={e?.warehouse_name}
                                                        />
                                                    </RowItemTable>

                                                    <RowItemTable colSpan={1} textAlign={"left"}>
                                                        {renderMoneyOrDash(e?.amount)}
                                                    </RowItemTable>
                                                    <RowItemTable
                                                        colSpan={2}
                                                        textAlign={"left"}
                                                        className={"truncate"}
                                                    >
                                                        {e?.note}
                                                    </RowItemTable>
                                                    <RowItemTable colSpan={1}>
                                                        <CustomAvatar
                                                            fullName={e?.staff_create?.full_name}
                                                            profileImage={e?.staff_create?.profile_image}
                                                            data={e}
                                                        />
                                                    </RowItemTable>
                                                    <RowItemTable colSpan={1}>
                                                        <ButtonWarehouse
                                                            warehouseman_id={e?.warehouseman_id}
                                                            _HandleChangeInput={_HandleChangeInput}
                                                            id={e?.id}
                                                        />
                                                    </RowItemTable>
                                                    <RowItemTable colSpan={1}>
                                                        {e?.branch_name}
                                                    </RowItemTable>
                                                    <RowItemTable colSpan={1} className="flex justify-center gap-1">
                                                        <button
                                                            onClick={() => handlePrintClick(e?.id)}
                                                            title="In PDF"
                                                            className="group transition-all duration-200 ease-in-out flex items-center gap-2 2xl:text-sm xl:text-sm text-[8px] text-left cursor-pointer rounded-lg p-1 border border-transparent hover:border-[#003DA0] hover:bg-primary-05 text-neutral-03 hover:text-neutral-07 font-normal whitespace-nowrap"
                                                        >
                                                            <PrinterIcon className="size-5 text-[#003DA0]" />
                                                        </button>
                                                        <BtnAction
                                                            onRefresh={refetch.bind(this)}
                                                            onRefreshGroup={refetchFillterBar.bind(this)}
                                                            dataLang={dataLang}
                                                            warehouseman_id={e?.warehouseman_id}
                                                            status_pay={e?.status_pay}
                                                            id={e?.id}
                                                            type="exportToOther"
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
                    <ContainerTotal className="!grid-cols-24">
                        <RowItemTable colSpan={3.5} className="p-2" textAlign={"center"}>
                        </RowItemTable>
                        <RowItemTable colSpan={1.5} className="p-2" textAlign={"right"}>
                            {dataLang?.exportToOthe_totalValue || "exportToOthe_totalValue"}
                        </RowItemTable>
                        <RowItemTable colSpan={1} className="p-2 mr-1" textAlign={"left"}>
                            {renderMoneyOrDash(data?.rTotal?.amount)}
                        </RowItemTable>
                    </ContainerTotal>
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
            {isState.dataExport?.length > 0 && (
                <PopupStatus
                    type="recall"
                    className="hidden"
                    dataExport={isState.dataExport}
                    dataLang={dataLang}
                />
            )}

            <PopupConfim
                dataLang={dataLang}
                type="warning"
                nameModel={"exportToOther"}
                title={TITLE_STATUS}
                subtitle={CONFIRMATION_OF_CHANGES}
                isOpen={isOpen}
                save={handleSaveStatus}
                cancel={() => handleQueryId({ status: false })}
            />
        </React.Fragment>
    );
};

export default ExportToOther;
