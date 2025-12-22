import BreadcrumbCustom from "@/components/UI/breadcrumb/BreadcrumbCustom";
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
import { AvatarStack } from "@/components/UI/common/user";
import { LayOutTableDynamic } from "@/components/UI/common/layout";
import DropdowLimit from "@/components/UI/dropdowLimit/dropdowLimit";
import ExcelFileComponent from "@/components/UI/filterComponents/excelFilecomponet";
import SearchComponent from "@/components/UI/filterComponents/searchComponent";
import SelectComponent from "@/components/UI/filterComponents/selectComponent";
import Loading from "@/components/UI/loading/loading";
import LoadingButton from "@/components/UI/loading/loadingButton";
import NoData from "@/components/UI/noData/nodata";
import Pagination from "@/components/UI/pagination";
import PopupConfim from "@/components/UI/popupConfim/popupConfim";
import { WARNING_STATUS_ROLE } from "@/constants/warningStatus/warningStatus";
import { CONFIRM_DELETION, TITLE_DELETE } from "@/constants/delete/deleteTable";
import { useBranchList } from "@/hooks/common/useBranch";
import { useLimitAndTotalItems } from "@/hooks/useLimitAndTotalItems";
import usePagination from "@/hooks/usePagination";
import useActionRole from "@/hooks/useRole";
import useStatusExprired from "@/hooks/useStatusExprired";
import useToast from "@/hooks/useToast";
import { TrashIcon } from "@/components/icons";
import EditIcon from "@/components/icons/common/EditIcon";
import PopupGroupPiecework from "./components/PopupGroupPiecework";
import { Grid6 } from "iconsax-react";
import { debounce } from "lodash";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";

const MOCK_DATA = [
    {
        id: 1,
        name: "Nhóm Gia Công",
        quantity: 3,
        employees: [
            {
                id: 1,
                name: "Thành",
                full_name: "Nguyễn Văn Thành",
                avatar: null,
                profile_image: null,
            },
        ],
        branch_name: "Hồ Chí Minh",
        branch_id: 1,
    },
    {
        id: 2,
        name: "Nhóm Gia Công",
        quantity: 3,
        employees: [
            {
                id: 2,
                name: "Mai",
                full_name: "Trần Thị Mai",
                avatar: null,
                profile_image: null,
            },
            {
                id: 3,
                name: "Hùng",
                full_name: "Lê Văn Hùng",
                avatar: null,
                profile_image: null,
            },
        ],
        branch_name: "Hồ Chí Minh",
        branch_id: 1,
    },
    {
        id: 3,
        name: "Nhóm Gia Công",
        quantity: 3,
        employees: [
            {
                id: 4,
                name: "Lan",
                full_name: "Phạm Thị Lan",
                avatar: null,
                profile_image: null,
            },
            {
                id: 5,
                name: "Dũng",
                full_name: "Hoàng Văn Dũng",
                avatar: null,
                profile_image: null,
            },
            {
                id: 6,
                name: "Hoa",
                full_name: "Võ Thị Hoa",
                avatar: null,
                profile_image: null,
            },
        ],
        branch_name: "Hồ Chí Minh",
        branch_id: 1,
    },
    {
        id: 4,
        name: "Nhóm Gia Công",
        quantity: 3,
        employees: [
            {
                id: 7,
                name: "Nam",
                full_name: "Đỗ Văn Nam",
                avatar: null,
                profile_image: null,
            },
            {
                id: 8,
                name: "Linh",
                full_name: "Bùi Thị Linh",
                avatar: null,
                profile_image: null,
            },
            {
                id: 9,
                name: "Tuấn",
                full_name: "Ngô Văn Tuấn",
                avatar: null,
                profile_image: null,
            },
            // {
            //     id: 10,
            //     name: "Hương",
            //     full_name: "Đinh Thị Hương",
            //     avatar: null,
            //     profile_image: null,
            // },
            // {
            //     id: 11,
            //     name: "Khoa",
            //     full_name: "Lý Văn Khoa",
            //     avatar: null,
            //     profile_image: null,
            // },
        ],
        branch_name: "Hồ Chí Minh",
        branch_id: 1,
    },
    {
        id: 5,
        name: "Nhóm Gia Công",
        quantity: 0,
        employees: [],
        branch_name: "Hồ Chí Minh",
        branch_id: 1,
    },
    {
        id: 6,
        name: "Nhóm Gia Công",
        quantity: 3,
        employees: [
            {
                id: 12,
                name: "Anh",
                full_name: "Vũ Văn Anh",
                avatar: null,
                profile_image: null,
            },
            {
                id: 13,
                name: "Bình",
                full_name: "Trương Văn Bình",
                avatar: null,
                profile_image: null,
            },
            {
                id: 14,
                name: "Cường",
                full_name: "Phan Văn Cường",
                avatar: null,
                profile_image: null,
            },
            // {
            //     id: 15,
            //     name: "Dương",
            //     full_name: "Lâm Văn Dương",
            //     avatar: null,
            //     profile_image: null,
            // },
        ],
        branch_name: "Hồ Chí Minh",
        branch_id: 1,
    },
    {
        id: 7,
        name: "Nhóm Gia Công",
        quantity: 3,
        employees: [
            {
                id: 16,
                name: "Thành",
                full_name: "Nguyễn Văn Thành",
                avatar: null,
                profile_image: null,
            },
        ],
        branch_name: "Hồ Chí Minh",
        branch_id: 1,
    },
];

const initialState = {
    keySearch: "",
    idBranch: null,
    idGroup: null,
};

const PieceworkWage = (props) => {
    const dataLang = props.dataLang;
    const isShow = useToast();
    const router = useRouter();
    const statusExprired = useStatusExprired();
    const { paginate } = usePagination();
    const { limit, updateLimit: sLimit } = useLimitAndTotalItems();

    const [isState, sIsState] = useState(initialState);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const queryState = (key) => sIsState((prev) => ({ ...prev, ...key }));

    const { is_admin: role, permissions_current: auth } = useSelector(
        (state) => state.auth
    );

    const { checkExport, checkEdit, checkAdd, checkDelete } = useActionRole(
        auth,
        "piecework_wage_group"
    );

    // Danh sách chi nhánh
    const { data: listBranch = [] } = useBranchList();

    // Bộ lọc
    const params = {
        search: isState.keySearch,
        limit: limit,
        page: router.query?.page || 1,
        "filter[branch_id]": isState.idBranch?.value ?? null,
        "filter[group_id]": isState.idGroup?.value ?? null,
    };

    // Hook useMemo để return danh sách table
    const tableData = useMemo(() => {
        let filteredData = [...MOCK_DATA];

        // Filter theo search
        if (params.search) {
            const searchLower = params.search.toLowerCase();
            filteredData = filteredData.filter(
                (item) =>
                    item.name?.toLowerCase().includes(searchLower) ||
                    item.branch_name?.toLowerCase().includes(searchLower)
            );
        }

        // Filter theo branch_id
        if (params["filter[branch_id]"]) {
            filteredData = filteredData.filter(
                (item) => item.branch_id === params["filter[branch_id]"]
            );
        }

        // Filter theo group_id (nếu có)
        if (params["filter[group_id]"]) {
            filteredData = filteredData.filter(
                (item) => item.id === params["filter[group_id]"]
            );
        }

        // Pagination
        const startIndex = (params.page - 1) * params.limit;
        const endIndex = startIndex + params.limit;
        const paginatedData = filteredData.slice(startIndex, endIndex);

        return {
            rResult: paginatedData,
            output: {
                iTotalDisplayRecords: filteredData.length,
            },
        };
    }, [
        params.search,
        params["filter[branch_id]"],
        params["filter[group_id]"],
        params.page,
        params.limit,
    ]);

    // TODO: Thay thế bằng hook thực tế khi có API
    // const { data, isFetching, refetch } = usePieceworkWageGroupList(params);
    const data = tableData;
    const isFetching = false;
    const refetch = () => {};

    // Hàm tìm kiếm
    const _HandleOnChangeKeySearch = debounce(({ target: { value } }) => {
        queryState({ keySearch: value });
        router.replace("/piecework-wage");
    }, 500);

    // Xuất Excel
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
                    title: `${dataLang?.piecework_wage_group_name || "Tên tổ nhóm"}`,
                    width: { wpx: 100 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.piecework_wage_group_quantity || "Số lượng"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.piecework_wage_group_branch || "Chi nhánh"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
            ],
            data: data?.rResult?.map((e) => [
                { value: `${e.id}`, style: { numFmt: "0" } },
                { value: `${e.name ? e.name : ""}` },
                { value: `${e.quantity ? e.quantity : ""}` },
                { value: `${e.branch_name ? e.branch_name : ""}` },
            ]),
        },
    ];

    const breadcrumbItems = [
        {
            label: `${dataLang?.piecework_wage || "Lương sản lượng"}`,
        },
        {
            label: `${dataLang?.piecework_wage_group_list || "Danh sách tổ/ nhóm"}`,
        },
    ];

    // TODO: Thay thế bằng hàm xử lý thực tế
    const handleEdit = (id) => {
        console.log("Edit", id);
    };

    const handleOpenDeletePopup = (id) => {
        if (isDeleting) return;
        setDeleteTarget(id);
    };

    const handleDelete = async () => {
        if (!deleteTarget || isDeleting) return;
        setIsDeleting(true);

        try {
            // TODO: Call API xóa tổ/nhóm
            console.log("Delete", deleteTarget);
            // await deletePieceworkWageGroup(deleteTarget);
            isShow("success", dataLang?.deleted_successfully || "Xóa thành công");
            refetch();
            setDeleteTarget(null);
        } catch (error) {
            console.error("Delete error:", error);
            isShow("error", dataLang?.delete_failed || "Xóa thất bại");
        } finally {
            setIsDeleting(false);
        }
    };

    const popupSubtitle = isDeleting ? (
        <span className="inline-flex items-center gap-2 text-[#003DA0]">
            <LoadingButton hiddenTitle className="w-4 h-4 text-[#003DA0]" />
            <span>{dataLang?.processing || "Đang xử lý..."}</span>
        </span>
    ) : (
        CONFIRM_DELETION
    );

    return (
        <div className="min-h-screen relative">
            <LayOutTableDynamic
                head={
                    <Head>
                        <title>
                            {dataLang?.piecework_wage_group_list ||
                                "Danh sách tổ/ nhóm"}
                        </title>
                    </Head>
                }
                breadcrumb={
                    <>
                        {statusExprired ? (
                            <EmptyExprired />
                        ) : (
                            <React.Fragment>
                                <BreadcrumbCustom
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
                            {dataLang?.piecework_wage_group_list ||
                                "Danh sách tổ/ nhóm"}
                        </h2>
                        <div className="flex items-center justify-end gap-2">
                            {role == true || checkAdd ? (
                                <PopupGroupPiecework
                                    dataLang={dataLang}
                                    onRefresh={refetch}
                                    listBranch={listBranch}
                                    defaultBranch={isState.idBranch}
                                    className="responsive-text-sm 3xl:py-3 3xl:px-4 py-2 px-3 text-sm font-normal rounded-md bg-blue-fmrp text-white btn-animation hover:scale-105"
                                />
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => {
                                        isShow("error", WARNING_STATUS_ROLE);
                                    }}
                                    className="responsive-text-sm 3xl:py-3 3xl:px-4 py-2 px-3 text-sm font-normal bg-blue-fmrp text-white rounded-lg btn-animation hover:scale-105"
                                >
                                    {dataLang?.branch_popup_create_new || "+ Tạo mới"}
                                </button>
                            )}
                        </div>
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
                                <SelectComponent
                                    options={[
                                        {
                                            value: "",
                                            label:
                                                dataLang?.price_quote_branch ||
                                                "Chi nhánh",
                                            isDisabled: true,
                                        },
                                        ...listBranch,
                                    ]}
                                    colSpan={1}
                                    onChange={(e) => queryState({ idBranch: e })}
                                    value={isState.idBranch}
                                    placeholder={
                                        dataLang?.price_quote_branch || "Chi nhánh"
                                    }
                                    isClearable={true}
                                />
                                <SelectComponent
                                    options={[
                                        {
                                            value: "",
                                            label:
                                                dataLang?.piecework_wage_group ||
                                                "Tổ nhóm",
                                            isDisabled: true,
                                        },
                                        // TODO: Thay thế bằng danh sách tổ nhóm thực tế
                                        [],
                                    ]}
                                    colSpan={1}
                                    onChange={(e) => queryState({ idGroup: e })}
                                    value={isState.idGroup}
                                    placeholder={
                                        dataLang?.piecework_wage_group || "Tổ nhóm"
                                    }
                                    isClearable={true}
                                />
                            </div>

                            <div className="flex items-center justify-end space-x-2">
                                <OnResetData
                                    sOnFetching={(e) => {}}
                                    onClick={() => refetch()}
                                />
                                {role == true || checkExport ? (
                                    <div className={``}>
                                        {data?.rResult?.length > 0 && (
                                            <ExcelFileComponent
                                                multiDataSet={multiDataSet}
                                                filename="Danh sách tổ/ nhóm"
                                                title="DSTN"
                                                dataLang={dataLang}
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <button
                                        onClick={() =>
                                            isShow("error", WARNING_STATUS_ROLE)
                                        }
                                        className={`xl:px-4 px-3 xl:py-2.5 py-1.5 2xl:text-xs xl:text-xs text-[7px] flex items-center space-x-2 bg-[#C7DFFB] rounded hover:scale-105 transition`}
                                    >
                                        <Grid6
                                            className="scale-75 2xl:scale-100 xl:scale-100"
                                            size={18}
                                        />
                                        <span>
                                            {dataLang?.client_list_exportexcel ||
                                                "Xuất Excel"}
                                        </span>
                                    </button>
                                )}
                            </div>
                        </div>
                        <Customscrollbar className="h-full overflow-y-auto">
                            <div className="w-full">
                                <HeaderTable gridCols={12}>
                                    <ColumnTable colSpan={0.5} textAlign={"center"}>
                                        {dataLang?.stt || "STT"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={2.5} textAlign={"left"}>
                                        {dataLang?.piecework_wage_group_name ||
                                            "Tên tổ nhóm"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={2} textAlign={"center"}>
                                        {dataLang?.piecework_wage_group_quantity ||
                                            "Số lượng"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={2.5} textAlign={"left"}>
                                        {dataLang?.piecework_wage_group_employees ||
                                            "Nhân viên"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={2} textAlign={"left"}>
                                        {dataLang?.piecework_wage_group_branch ||
                                            "Chi nhánh"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={2.5} textAlign={"center"}>
                                        {dataLang?.branch_popup_properties || "Tác vụ"}
                                    </ColumnTable>
                                </HeaderTable>

                                {isFetching ? (
                                    <Loading className="h-80" color="#0f4f9e" />
                                ) : data?.rResult?.length > 0 ? (
                                    <>
                                        <div className="divide-y divide-slate-200 h-[100%]">
                                            {data?.rResult?.map((e, index) => {
                                                // Format employees data for AvatarStack
                                                const employeesData =
                                                    e?.employees?.map((emp) => ({
                                                        id: emp?.id,
                                                        name: emp?.name || emp?.full_name,
                                                        avatarUrl: emp?.avatar || emp?.profile_image,
                                                    })) || [];

                                                return (
                                                    <RowTable
                                                        gridCols={12}
                                                        key={e.id.toString()}
                                                    >
                                                        <RowItemTable
                                                            colSpan={0.5}
                                                            textAlign={"center"}
                                                        >
                                                            {index + 1}
                                                        </RowItemTable>
                                                        <RowItemTable
                                                            colSpan={2.5}
                                                            textAlign={"left"}
                                                        >
                                                            {e.name}
                                                        </RowItemTable>
                                                        <RowItemTable
                                                            colSpan={2}
                                                            textAlign={"center"}
                                                        >
                                                            <span
                                                                style={{
                                                                    color: "#003DA0",
                                                                }}
                                                            >
                                                                {e.quantity || 0}
                                                            </span>
                                                        </RowItemTable>
                                                        <RowItemTable
                                                            colSpan={2.5}
                                                            textAlign={"left"}
                                                        >
                                                            {employeesData.length > 0 ? (
                                                                <PopupGroupPiecework
                                                                    dataLang={dataLang}
                                                                    onRefresh={refetch}
                                                                    listBranch={listBranch}
                                                                    defaultBranch={isState.idBranch}
                                                                    trigger={
                                                                        <div className="inline-flex cursor-pointer">
                                                                            <AvatarStack
                                                                                people={employeesData}
                                                                                size={32}
                                                                            />
                                                                        </div>
                                                                    }
                                                                    buttonClassName="inline-flex"
                                                                />
                                                            ) : (
                                                                <span className="text-sm text-[#9295A4]">
                                                                    Chưa có nhân viên
                                                                </span>
                                                            )}
                                                        </RowItemTable>
                                                        <RowItemTable
                                                            colSpan={2}
                                                            textAlign={"left"}
                                                        >
                                                            {e.branch_name || ""}
                                                        </RowItemTable>
                                                        <RowItemTable
                                                            colSpan={2.5}
                                                            className="flex items-center justify-center space-x-2 text-center"
                                                        >
                                                            {role == true || checkEdit ? (
                                                                <PopupGroupPiecework
                                                                    dataLang={dataLang}
                                                                    onRefresh={refetch}
                                                                    listBranch={listBranch}
                                                                    defaultBranch={isState.idBranch}
                                                                    trigger={
                                                                        <button
                                                                            type="button"
                                                                            className="group hover:border-blue-500 hover:bg-blue-50 rounded-lg w-fit p-1 border border-transparent transition-all ease-in-out flex items-center gap-2 responsive-text-sm text-left cursor-pointer"
                                                                            title="Sửa"
                                                                        >
                                                                            <EditIcon
                                                                                className="size-5 text-[#003DA0]"
                                                                            />
                                                                        </button>
                                                                    }
                                                                    buttonClassName="inline-flex"
                                                                />
                                                            ) : (
                                                                <EditIcon
                                                                    className="cursor-pointer size-5 text-gray-400"
                                                                    onClick={() =>
                                                                        isShow(
                                                                            "error",
                                                                            WARNING_STATUS_ROLE
                                                                        )
                                                                    }
                                                                />
                                                            )}
                                                            {role == true || checkDelete ? (
                                                                <button
                                                                    onClick={() =>
                                                                        handleOpenDeletePopup(e.id)
                                                                    }
                                                                    className="group hover:border-red-01 hover:bg-red-02 rounded-lg w-fit p-1 border border-transparent transition-all ease-in-out flex items-center gap-2 responsive-text-sm text-left cursor-pointer"
                                                                    title="Xóa"
                                                                >
                                                                    <TrashIcon className="size-5 text-[#EE1E1E]" />
                                                                </button>
                                                            ) : (
                                                                <TrashIcon
                                                                    className="cursor-pointer size-5 text-gray-400"
                                                                    onClick={() =>
                                                                        isShow(
                                                                            "error",
                                                                            WARNING_STATUS_ROLE
                                                                        )
                                                                    }
                                                                />
                                                            )}
                                                        </RowItemTable>
                                                    </RowTable>
                                                );
                                            })}
                                        </div>
                                    </>
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
                                <Pagination
                                    postsPerPage={limit}
                                    totalPosts={Number(
                                        data?.output?.iTotalDisplayRecords
                                    )}
                                    paginate={paginate}
                                    currentPage={router.query?.page || 1}
                                />
                            </ContainerPagination>
                        )}

                        <DropdowLimit
                            sLimit={sLimit}
                            limit={limit}
                            dataLang={dataLang}
                        />
                    </div>
                }
            />
            {deleteTarget && (
                <PopupConfim
                    dataLang={dataLang}
                    type="warning"
                    nameModel="piecework_wage_group"
                    title={TITLE_DELETE}
                    subtitle={popupSubtitle}
                    isOpen={!!deleteTarget}
                    save={() => {
                        if (!isDeleting) {
                            handleDelete();
                        }
                    }}
                    cancel={() => {
                        if (!isDeleting) {
                            setDeleteTarget(null);
                        }
                    }}
                    onClose={() => {
                        if (!isDeleting) {
                            setDeleteTarget(null);
                        }
                    }}
                />
            )}
        </div>
    );
};

export default PieceworkWage;

