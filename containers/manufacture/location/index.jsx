import apiLocationWarehouse from "@/Api/apiManufacture/warehouse/apiWarehouseLocation/apiWarehouseLocation";
import { BtnAction } from "@/components/UI/BtnAction";
import Breadcrumb from "@/components/UI/breadcrumb/BreadcrumbCustom";
import OnResetData from "@/components/UI/btnResetData/btnReset";
import ContainerPagination from "@/components/UI/common/ContainerPagination/ContainerPagination";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import { EmptyExprired } from "@/components/UI/common/EmptyExprired";
import { ColumnTable, HeaderTable, RowItemTable, RowTable } from "@/components/UI/common/Table";
import { LayOutTableDynamic } from "@/components/UI/common/layout";
import DropdowLimit from "@/components/UI/dropdowLimit/dropdowLimit";
import ExcelFileComponent from "@/components/UI/filterComponents/excelFilecomponet";
import SearchComponent from "@/components/UI/filterComponents/searchComponent";
import SelectComponent from "@/components/UI/filterComponents/selectComponent";
import Loading from "@/components/UI/loading/loading";
import MultiValue from "@/components/UI/mutiValue/multiValue";
import NoData from "@/components/UI/noData/nodata";
import Pagination from "@/components/UI/pagination";
import PopupConfim from "@/components/UI/popupConfim/popupConfim";
import { CONFIRMATION_OF_CHANGES, TITLE_STATUS } from "@/constants/changeStatus/changeStatus";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import { WARNING_STATUS_ROLE } from "@/constants/warningStatus/warningStatus";
import { useLimitAndTotalItems } from "@/hooks/useLimitAndTotalItems";
import usePagination from "@/hooks/usePagination";
import useActionRole from "@/hooks/useRole";
import useStatusExprired from "@/hooks/useStatusExprired";
import useToast from "@/hooks/useToast";
import { useToggle } from "@/hooks/useToggle";
import { formatMoment } from "@/utils/helpers/formatMoment";
import { useMutation } from "@tanstack/react-query";
import { Grid6, Edit as IconEdit } from "iconsax-react";
import { debounce } from "lodash";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useWarehouseList } from "../warehouse/hooks/useWarehouseList";
import PopupLocationWarehouse from "./components/popup";
import { useLocationList } from "./hooks/useLocationList";

const initialState = {
    keySearch: "",
    valueWarehouse: null,
    onSending: null,
};
const Location = (props) => {
    const dataLang = props.dataLang;

    const router = useRouter();

    const isShow = useToast();

    const { paginate } = usePagination();

    const [status, sStatus] = useState(null);

    const [active, sActive] = useState(null);

    const statusExprired = useStatusExprired();

    const [isState, sIsState] = useState(initialState);

    const { limit, updateLimit: sLimit } = useLimitAndTotalItems();

    const { isOpen, isId, isKeyState, handleQueryId } = useToggle();

    const queryState = (key) => sIsState((prev) => ({ ...prev, ...key }));

    const { is_admin: role, permissions_current: auth } = useSelector((state) => state.auth);

    const { checkAdd, checkEdit, checkExport } = useActionRole(auth, "warehouse_location");

    // parasm lọc
    const params = {
        search: isState.keySearch,
        limit: limit,
        page: router.query?.page || 1,
        "filter[warehouse_id]": isState.valueWarehouse ? isState.valueWarehouse?.value : null,
    };

    // danh sách vị trí kho
    const { data, isFetching, isLoading, refetch } = useLocationList(params)

    // danh sách kho hàng
    const { data: listWarehouse } = useWarehouseList()

    // convert mảng danh sách kho hàng
    const dataWarehouse = listWarehouse?.rResult?.map((e) => ({ label: e.name, value: e.id })) || [];

    // 1true 0 fal, xóa vị trí kho hàng
    const handleDelete = async () => {
        sActive(isKeyState);
        let index = data?.rResult.findIndex((x) => x.id === isKeyState);

        if (index !== -1) {
            let newStatus = data.rResult[index].status === "0" ? "1" : "0";
            sStatus(newStatus);
            data.rResult[index].status = newStatus
        }
        mutateStatus.mutate();
        handleQueryId({ status: false });
    };

    // đổi trạng thái hoạt động vị trí kho
    const mutateStatus = useMutation({
        mutationFn: async () => {
            try {
                const { isSuccess, message } = await apiLocationWarehouse.apiHandingStatus(active, {
                    data: {
                        status: status,
                    },
                });
                if (isSuccess) {
                    isShow("success", `${dataLang[message] || message}`);
                } else {
                    isShow("error", `${dataLang[message] || message}`);
                }
                await refetch()
            } catch (error) { }
        }
    })

    // tìm kiếm vị trí kho
    const _HandleOnChangeKeySearch = debounce(({ target: { value } }) => {
        queryState({ keySearch: value });
        router.replace({
            pathname: router.route,
            query: {
                page: router.query?.page,
            },
        });
    }, 500);

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
                    title: `${dataLang?.warehouses_localtion_ware || "warehouses_localtion_ware"}`,
                    width: { wpx: 100 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.warehouses_localtion_code || "warehouses_localtion_code"}`,
                    width: { wpx: 100 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.warehouses_localtion_NAME || "warehouses_localtion_NAME"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.warehouses_localtion_status || "warehouses_localtion_status"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.warehouses_localtion_date || "warehouses_localtion_date"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
            ],
            data: data?.rResult?.map((e) => [
                { value: `${e.id}`, style: { numFmt: "0" } },
                { value: `${e.warehouse_name ? e.warehouse_name : ""}` },
                { value: `${e.code ? e.code : ""}` },
                { value: `${e.name ? e.name : ""}` },
                { value: `${e.status ? (e.status == "1" ? "Đang sử dụng" : "Không sử dụng") : ""}` },
                { value: `${e.date_create ? e.date_create : ""}` },
            ]),
        },
    ];


    const breadcrumbItems = [
        {
            label: `${dataLang?.Warehouse_title || "Warehouse_title"}`,
            // href: "/",
        },
        {
            label: `${dataLang?.warehouses_localtion_title || "warehouses_localtion_title"}`,
        },
    ];

    return (
        <>
            <LayOutTableDynamic
                head={
                    <Head>
                        <title>{dataLang?.warehouses_localtion_title || "warehouses_localtion_title"}</title>
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

                titleButton={
                    <>
                        <h2 className="text-title-section text-[#52575E] capitalize font-medium">
                            {dataLang?.warehouses_localtion_title || "warehouses_localtion_title"}
                        </h2>
                        <div className="flex items-center justify-end gap-2">
                            {role == true || checkAdd ? (
                                <PopupLocationWarehouse
                                    isState={isState}
                                    dataWarehouse={dataWarehouse}
                                    onRefresh={refetch.bind(this)}
                                    dataLang={dataLang}
                                    className="responsive-text-sm xl:px-5 px-3 xl:py-2.5 py-1.5 bg-blue-fmrp text-white rounded-lg btn-animation hover:scale-105"
                                />
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => {
                                        isShow("error", WARNING_STATUS_ROLE);
                                    }}
                                    className="responsive-text-sm xl:px-5 px-3 xl:py-2.5 py-1.5 bg-blue-fmrp text-white rounded-lg btn-animation hover:scale-105"
                                >
                                    {dataLang?.branch_popup_create_new}
                                </button>
                            )}
                        </div>
                    </>
                }
                table={
                    <div className="flex flex-col h-full overflow-hidden">
                        <div className="w-full items-center flex justify-between gap-2">
                            <div className="flex gap-3 items-center w-full">
                                {/* <div className="grid grid-cols-9 gap-2"> */}
                                    <SearchComponent
                                        colSpan={2}
                                        onChange={_HandleOnChangeKeySearch.bind(this)}
                                        dataLang={dataLang}
                                    />
                                    <SelectComponent
                                        placeholder={"kho hàng"}
                                        colSpan={2}
                                        onChange={(e) => queryState({ valueWarehouse: e })}
                                        value={isState.valueWarehouse}
                                        components={{ MultiValue }}
                                        aria-label={"kho hàng"}
                                        options={[
                                            {
                                                value: "",
                                                label: "kho hàng",
                                                isDisabled: true,
                                            },
                                            ...dataWarehouse,
                                        ]}
                                        isClearable={true}
                                        noOptionsMessage={() => "Không có dữ liệu"}
                                    />
                                {/* </div> */}
                            </div>
                            <div className="col-span-2">
                                <div className="flex items-center justify-end space-x-2">
                                    <OnResetData sOnFetching={(e) => { }} onClick={refetch.bind(this)} />
                                    {role == true || checkExport ? (
                                        <div className={``}>
                                            {data?.rResult?.length > 0 && (
                                                <ExcelFileComponent
                                                    filename="Vị trí kho"
                                                    title="Vtk"
                                                    dataSet={multiDataSet}
                                                    data={multiDataSet}
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
                                </div>
                            </div>
                        </div>
                        <Customscrollbar className="h-full overflow-y-auto">
                            <div className="w-full">
                                <HeaderTable display={"grid"} gridCols={12}>
                                    <ColumnTable colSpan={1} textAlign={"center"}>
                                        {dataLang?.stt || "stt"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={2} textAlign={"left"}>
                                        {dataLang?.warehouses_localtion_ware}
                                    </ColumnTable>
                                    <ColumnTable colSpan={2} textAlign={"left"}>
                                        {dataLang?.warehouses_localtion_code}
                                    </ColumnTable>
                                    <ColumnTable colSpan={2} textAlign={"left"}>
                                        {dataLang?.warehouses_localtion_NAME}
                                    </ColumnTable>
                                    <ColumnTable colSpan={2} textAlign={"left"}>
                                        {dataLang?.warehouses_localtion_status}
                                    </ColumnTable>
                                    <ColumnTable colSpan={2} textAlign={"left"}>
                                        {dataLang?.warehouses_localtion_date}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"center"}>
                                        {dataLang?.branch_popup_properties}
                                    </ColumnTable>
                                </HeaderTable>
                                {isLoading ? (
                                    <Loading className="h-80" color="#0f4f9e" />
                                ) : data?.rResult?.length > 0 ? (
                                    <div className="h-full divide-y divide-slate-200">
                                        {data?.rResult?.map((e, index) => (
                                            <RowTable gridCols={12} key={e?.id?.toString()}>
                                                <RowItemTable colSpan={1} textAlign={"center"}>
                                                    {index + 1}
                                                </RowItemTable>
                                                <RowItemTable colSpan={2} textAlign={"left"}>
                                                    {e.warehouse_name}
                                                </RowItemTable>
                                                <RowItemTable colSpan={2} textAlign={"left"}>
                                                    {e.code}
                                                </RowItemTable>
                                                <RowItemTable colSpan={2} textAlign={"left"}>
                                                    {e.name}
                                                </RowItemTable>
                                                <RowItemTable colSpan={2} textAlign={"left"}>
                                                    <label
                                                        htmlFor={e.id}
                                                        className="relative inline-flex items-center cursor-pointer"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only peer"
                                                            value={e.status}
                                                            id={e.id}
                                                            checked={e.status == "0" ? false : true}
                                                            onChange={() =>
                                                                handleQueryId({
                                                                    initialKey: e.id,
                                                                    status: true,
                                                                })
                                                            }
                                                        />

                                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                                    </label>
                                                </RowItemTable>
                                                <RowItemTable colSpan={2} textAlign={"left"}>
                                                    {e?.date_create != null
                                                        ? formatMoment(e.date_create, FORMAT_MOMENT.TIME_SHORT)
                                                        : ""}
                                                </RowItemTable>

                                                <RowItemTable
                                                    colSpan={1}
                                                    className="flex items-center justify-center space-x-2 text-center"
                                                >
                                                    {role == true || checkEdit ? (
                                                        <PopupLocationWarehouse
                                                            onRefresh={refetch.bind(this)}
                                                            warehouse_name={e.warehouse_name}
                                                            warehouse_id={e.warehouse_id}
                                                            isState={isState}
                                                            className="text-xs xl:text-base "
                                                            dataLang={dataLang}
                                                            dataWarehouse={dataWarehouse}
                                                            name={e.name}
                                                            code={e.code}
                                                            id={e?.id}
                                                        />
                                                    ) : (
                                                        <IconEdit
                                                            className="cursor-pointer"
                                                            onClick={() =>
                                                                isShow("error", WARNING_STATUS_ROLE)
                                                            }
                                                        />
                                                    )}
                                                    <BtnAction
                                                        onRefresh={refetch.bind(this)}
                                                        onRefreshGroup={() => { }}
                                                        dataLang={dataLang}
                                                        id={e?.id}
                                                        type="warehouse_location"
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
            />
            <PopupConfim
                dataLang={dataLang}
                type="warning"
                title={TITLE_STATUS}
                subtitle={CONFIRMATION_OF_CHANGES}
                isOpen={isOpen}
                save={handleDelete}
                nameModel="warehouse_location_status"
                cancel={() => handleQueryId({ status: false })}
            />
        </>
    );
};

export default Location;
