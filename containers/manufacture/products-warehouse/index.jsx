import apiProductsWarehouse from "@/Api/apiManufacture/warehouse/productsWarehouse/apiProductsWarehouse";
import { BtnAction } from "@/components/UI/BtnAction";
import TabFilter from "@/components/UI/TabFilter";
import Breadcrumb from "@/components/UI/breadcrumb/BreadcrumbCustom";
import OnResetData from "@/components/UI/btnResetData/btnReset";
import ButtonWarehouse from "@/components/UI/btnWarehouse/btnWarehouse";
import ButtonAddNew from "@/components/UI/button/buttonAddNew";
import ContainerPagination from "@/components/UI/common/ContainerPagination/ContainerPagination";
import TitlePagination from "@/components/UI/common/ContainerPagination/TitlePagination";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import { EmptyExprired } from "@/components/UI/common/EmptyExprired";
import { ColumnTable, HeaderTable, RowItemTable, RowTable } from "@/components/UI/common/Table";
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
import { useWarehouseComboboxByManufacture } from "@/hooks/common/useWarehouses";
import useSetingServer from "@/hooks/useConfigNumber";
import { useLimitAndTotalItems } from "@/hooks/useLimitAndTotalItems";
import usePagination from "@/hooks/usePagination";
import useActionRole from "@/hooks/useRole";
import useStatusExprired from "@/hooks/useStatusExprired";
import useTab from "@/hooks/useTab";
import useToast from "@/hooks/useToast";
import { useToggle } from "@/hooks/useToggle";
import { routerProductsWarehouse } from "@/routers/manufacture";
import { formatMoment } from "@/utils/helpers/formatMoment";
import formatNumberConfig from "@/utils/helpers/formatnumber";
import { Grid6 } from "iconsax-react";
import { debounce } from "lodash";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { useSelector } from "react-redux";
import LinkWarehouse from "../components/linkWarehouse";
import PopupStatus from "../components/popupStatus";
import PopupDetail from "./components/pupup";
import { useProductsWarehouseCombobox } from "./hooks/useProductsWarehouseCombobox";
import { useProductsWarehouseFillterbar } from "./hooks/useProductsWarehouseFillterbar";
import { useProductsWarehouseList } from "./hooks/useProductsWarehouseList";

const initalState = {
    keySearch: "",
    keySearchCode: "",
    onSending: false,
    idImportWarehouse: null,
    idCode: null,
    idSupplier: null,
    idBranch: null,
    valueDate: { startDate: null, endDate: null },
    dataExport: [],
    refreshing: false,
}
const ProductsWarehouse = (props) => {
    const dataLang = props.dataLang;

    const router = useRouter();

    const isShow = useToast();

    const { paginate } = usePagination();

    const dataSeting = useSetingServer();

    const statusExprired = useStatusExprired();

    const [isState, sIsState] = useState(initalState);

    const { handleTab: _HandleSelectTab } = useTab('all');

    const { isKeyState, isOpen, handleQueryId } = useToggle();

    const queryState = (key) => sIsState((prev) => ({ ...prev, ...key }));

    const { is_admin: role, permissions_current: auth } = useSelector((state) => state.auth);

    const { checkAdd, checkExport } = useActionRole(auth, "productsWarehouse");

    const { limit, updateLimit: sLimit } = useLimitAndTotalItems();

    // params lọc
    const params = {
        search: isState.keySearch,
        limit: limit,
        page: router.query?.page || 1,
        "filter[status_bar]": router.query?.tab ?? null,
        "filter[id]": isState.idCode != null ? isState.idCode?.value : null,
        "filter[branch_id]": isState.idBranch != null ? isState.idBranch.value : null,
        "filter[start_date]": isState.valueDate?.startDate != null ? isState.valueDate?.startDate : null,
        "filter[end_date]": isState.valueDate?.endDate != null ? isState.valueDate?.endDate : null,
        "filter[warehouse_id]": isState.idImportWarehouse != null ? isState.idImportWarehouse?.value : null,
    }

    // danh sách chi nhánh
    const { data: listBranch = [] } = useBranchList()

    // danh sách nhập kho thành phẩm
    const { data, isFetching, refetch } = useProductsWarehouseList(params);

    // danh sách kho nhập
    const { data: listWarehouse = [] } = useWarehouseComboboxByManufacture()

    // danh sách mã chứng từ
    const { data: listCode = [] } = useProductsWarehouseCombobox(isState.keySearchCode);

    // danh sách bộ lọc nhóm
    const { data: dataFillterbar, refetch: refetchFillterbar } = useProductsWarehouseFillterbar({ ...params, limit: 0, "filter[status_bar]": undefined })

    const formatNumber = (number) => {
        return formatNumberConfig(+number, dataSeting);
    };

    // tìm kiếm mã chứng từ
    const _HandleSeachApi = debounce(async (inputValue) => {
        queryState({ keySearchCode: inputValue });
    }, 500);

    // tìm kiếm table
    const _HandleOnChangeKeySearch = debounce(({ target: { value } }) => {
        queryState({ keySearch: value });
        router.replace({
            pathname: router.route,
            query: {
                tab: router.query?.tab,
            },
        });
    }, 500);

    // đổi trạng thái duyệt thủ kho
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

    // đổi trạng thái duyệt thủ kho
    const _HandleChangeInput = (id, checkedUn, type, value) => {
        handleQueryId({
            status: true,
            initialKey: { id, checkedUn, type, value },
        });
    };

    // đổi trạng thái duyệt thủ kho nếu data_export sẽ show poup 
    const _ServerSending = async (checkedWare) => {
        let data = new FormData();
        data.append("warehouseman_id", checkedWare?.checkedpost != "0" ? checkedWare?.checkedpost : "");
        data.append("id", checkedWare?.id);
        try {
            const { isSuccess, message, data_export } = await apiProductsWarehouse.apiHandingStatusWarehouse(data);

            if (isSuccess) {
                isShow("success", `${dataLang[message] || message}`);
                queryState({ refreshing: true });

                await refetch();

                await refetchFillterbar();

                queryState({ onSending: false, refreshing: false });
            } else {
                isShow("error", `${dataLang[message] || message}`);
            }

            if (data_export?.length > 0) {
                queryState({ dataExport: data_export });
            }
        } catch (error) {
            throw error
        }
    };

    // xuất excel
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
                    title: `${dataLang?.productsWarehouse_QtyImport || "productsWarehouse_QtyImport"}`,
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
                { value: `${e?.reference_no_detail ? e?.reference_no_detail : ""}` },
                { value: `${e?.warehouse_name ? e?.warehouse_name : ""}` },
                { value: `${e?.count_item ? formatNumber(e?.count_item) : ""}` },
                { value: `${e?.note ? e?.note : ""}` },
                { value: `${e?.staff_create?.full_name ? e?.staff_create?.full_name : ""}`, },
                { value: `${e?.warehouseman_id === "0" ? "Chưa duyệt kho" : "Đã duyệt kho"}` },
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
            label: `${dataLang?.productsWarehouse_title || "productsWarehouse_title"}`,
        },
    ];

    return (
        <React.Fragment>
            <LayOutTableDynamic
                head={
                    <Head>
                        <title>{dataLang?.productsWarehouse_title || "productsWarehouse_title"}</title>
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
                            {dataLang?.productsWarehouse_title || "productsWarehouse_title"}
                        </h2>
                        <ButtonAddNew
                            onClick={() => {
                                if (role) {
                                    router.push(routerProductsWarehouse.form);
                                } else if (checkAdd) {
                                    router.push(routerProductsWarehouse.form);
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
                        {dataFillterbar && dataFillterbar?.map((e) => {
                            return (
                                <TabFilter
                                    backgroundColor="#e2f0fe"
                                    dataLang={dataLang}
                                    key={e.id}
                                    onClick={_HandleSelectTab.bind(this, e.id)}
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
                                        colSpan={1}
                                        value={isState.valueDate}
                                        onChange={(e) => queryState({ valueDate: e })}
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
                                        isClearable={true}
                                        colSpan={1}
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
                                        placeholder={dataLang?.purchase_order_table_code || "purchase_order_table_code"}
                                        isClearable={true}
                                        colSpan={1}
                                    />
                                    <SelectComponent
                                        options={[
                                            {
                                                value: "",
                                                label: dataLang?.productsWarehouse_warehouseImport || "productsWarehouse_warehouseImport",
                                                isDisabled: true,
                                            },
                                            ...listWarehouse,
                                        ]}
                                        onChange={(e) => queryState({ idImportWarehouse: e })}
                                        value={isState.idImportWarehouse}
                                        placeholder={dataLang?.productsWarehouse_warehouseImport || "productsWarehouse_warehouseImport"}
                                        isClearable={true}
                                        isSearchable={true}
                                    />
                            </div>
                            <div className="col-span-1 xl:col-span-2 lg:col-span-2">
                                <div className="flex items-center justify-end gap-2">
                                    <OnResetData sOnFetching={(e) => { }} onClick={refetch.bind(this)} />
                                    {role == true || checkExport ? (
                                        <div className={``}>
                                            {data?.rResult?.length > 0 && (
                                                <ExcelFileComponent
                                                    dataLang={dataLang}
                                                    filename={"Danh sách nhập kho thành phẩm"}
                                                    title="DSNKTP"
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
                        <Customscrollbar className="h-full overflow-y-auto">
                            <div className="w-full">
                                <HeaderTable gridCols={11} display={"grid"}>
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
                                        {dataLang?.production_warehouse_LSX || "production_warehouse_LSX"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"left"}>
                                        {dataLang?.productsWarehouse_warehouseImport || "productsWarehouse_warehouseImport"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"center"}>
                                        {dataLang?.productsWarehouse_total || "productsWarehouse_total"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1.5} textAlign={"left"}>
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
                                    <Loading className="h-full" color="#0f4f9e" />
                                ) : data?.rResult?.length > 0 ? (
                                    <div className="h-full divide-y divide-slate-200">
                                        {data?.rResult?.map((e, index) => (
                                            <RowTable gridCols={11} key={e.id.toString()}>
                                                <RowItemTable colSpan={0.5} textAlign={"center"}>
                                                    {index + 1}
                                                </RowItemTable>
                                                <RowItemTable colSpan={1} textAlign={"left"}>
                                                    {e?.date != null ? formatMoment(e?.date, FORMAT_MOMENT.DATE_SLASH_LONG) : ""}
                                                </RowItemTable>
                                                <RowItemTable colSpan={1} textAlign={"left"}>
                                                    <PopupDetail
                                                        dataLang={dataLang}
                                                        className="3xl:text-base 2xl:text-[12.5px] xl:text-[11px] font-medium text-[9px] px-2 col-span-1 text-center text-[#0F4F9E] hover:text-[#5599EC] transition-all ease-linear cursor-pointer "
                                                        name={e?.code}
                                                        id={e?.id}
                                                    />
                                                </RowItemTable>
                                                <RowItemTable colSpan={1} textAlign={"left"}>
                                                    {e?.reference_no_detail}
                                                </RowItemTable>
                                                <RowItemTable colSpan={1} textAlign={"left"}>
                                                    <LinkWarehouse
                                                        disbleClick={true}
                                                        colSpan={1}
                                                        warehouse_id={e?.warehouse_id}
                                                        warehouse_name={e?.warehouse_name}
                                                    />
                                                </RowItemTable>

                                                <RowItemTable colSpan={1} textAlign={"center"}>
                                                    {formatNumber(e?.total_quantity)}
                                                </RowItemTable>
                                                <RowItemTable
                                                    colSpan={1.5}
                                                    textAlign={"left"}
                                                    className={"truncate"}
                                                >
                                                    {e?.note}
                                                </RowItemTable>
                                                <RowItemTable
                                                    colSpan={1}
                                                    className={"flex items-center justify-start gap-2"}
                                                >
                                                    <CustomAvatar
                                                        data={e}
                                                        fullName={e?.staff_create?.full_name}
                                                        profileImage={e?.staff_create?.profile_image}
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
                                                <RowItemTable colSpan={1} className="flex justify-center">
                                                    <BtnAction
                                                        onRefresh={refetch.bind(this)}
                                                        onRefreshGroup={refetchFillterbar.bind(this)}
                                                        dataLang={dataLang}
                                                        warehouseman_id={e?.warehouseman_id}
                                                        status_pay={e?.status_pay}
                                                        id={e?.id}
                                                        type="productsWarehouse"
                                                        referenceNoDetail={e?.reference_no_detail}
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
                total={
                    <ContainerTotal className="!grid-cols-22">
                        <RowItemTable colSpan={3.5} textAlign={"center"} className="p-2">
                        </RowItemTable>
                        <RowItemTable colSpan={1} textAlign={"left"} className="p-2">
                            {dataLang?.productsWarehouse_total || "productsWarehouse_total"}
                        </RowItemTable>
                        <RowItemTable
                            colSpan={1}
                            textAlign={"center"}
                            // className="flex flex-wrap gap-2 p-2 mr-1"
                        >
                            {formatNumber(data?.rTotal?.total_count_item)}
                        </RowItemTable>
                    </ContainerTotal>
                }
                pagination={
                    <div className="flex items-center justify-between gap-2">
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
                        <DropdowLimit sLimit={sLimit} limit={limit} dataLang={dataLang} />
                    </div>
                }
            />
            {isState.dataExport?.length > 0 && (
                <PopupStatus
                    type="productsWarehouse"
                    className="hidden"
                    dataExport={isState.dataExport}
                    dataLang={dataLang}
                />
            )}
            <PopupConfim
                dataLang={dataLang}
                type="warning"
                nameModel={"productsWarehouse"}
                title={TITLE_STATUS}
                subtitle={CONFIRMATION_OF_CHANGES}
                isOpen={isOpen}
                save={handleSaveStatus}
                cancel={() => handleQueryId({ status: false })}
            />
        </React.Fragment>
    );
};

export default ProductsWarehouse;
