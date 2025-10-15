import apiInternalPlan from "@/Api/apiManufacture/manufacture/internalPlan/apiInternalPlan";
import { BtnAction } from "@/components/UI/BtnAction";
import OnResetData from "@/components/UI/btnResetData/btnReset";
import { BtnStatusApproved } from "@/components/UI/btnStatusApproved/BtnStatusApproved";
import ButtonAddNew from "@/components/UI/button/buttonAddNew";
import ContainerPagination from "@/components/UI/common/ContainerPagination/ContainerPagination";
import TitlePagination from "@/components/UI/common/ContainerPagination/TitlePagination";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import { EmptyExprired } from "@/components/UI/common/EmptyExprired";
import {
    ColumnTable,
    HeaderTable,
    RowItemTable,
    RowTable,
} from "@/components/UI/common/Table";
import TagBranch from "@/components/UI/common/Tag/TagBranch";
import {
    Container,
    ContainerBody,
    ContainerTable,
    LayOutTableDynamic,
} from "@/components/UI/common/layout";
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
import {
    CONFIRMATION_OF_CHANGES,
    TITLE_STATUS,
} from "@/constants/changeStatus/changeStatus";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import { WARNING_STATUS_ROLE } from "@/constants/warningStatus/warningStatus";
import { useBranchList } from "@/hooks/common/useBranch";
import { useLimitAndTotalItems } from "@/hooks/useLimitAndTotalItems";
import usePagination from "@/hooks/usePagination";
import useActionRole from "@/hooks/useRole";
import useStatusExprired from "@/hooks/useStatusExprired";
import useToast from "@/hooks/useToast";
import { useToggle } from "@/hooks/useToggle";
import { routerInternalPlan } from "@/routers/manufacture";
import { formatMoment } from "@/utils/helpers/formatMoment";
import { Grid6 } from "iconsax-react";
import { debounce } from "lodash";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { useSelector } from "react-redux";
import { useInternalPlanList } from "./hooks/useInternalPlanList";
import Breadcrumb from "@/components/UI/breadcrumb/BreadcrumbCustom";
import ButtonWarehouse from "@/components/UI/btnWarehouse/btnWarehouse";

const PopupDetail = dynamic(() => import("./components/PopupDetail"), {
    ssr: false,
});

const initsId = {
    idBranch: null,
    valueDate: { startDate: null, endDate: null },
};

const InternalPlan = (props) => {
    const dataLang = props.dataLang;

    const router = useRouter();

    const isShow = useToast();

    const { paginate } = usePagination();

    const statusExprired = useStatusExprired();

    const [idFillter, sIdFillter] = useState(initsId);

    const [refreshing, setRefreshing] = useState(false);

    const [keySearch, sKeySearch] = useState("");

    const { limit, updateLimit: sLimit } = useLimitAndTotalItems();

    const { isOpen, isId, isIdChild: status, handleQueryId } = useToggle();

    const { is_admin: role, permissions_current: auth } = useSelector(
        (state) => state.auth
    );

    const { checkAdd, checkEdit, checkExport } = useActionRole(
        auth,
        "internal_plan"
    );

    const params = {
        search: keySearch,
        limit: limit,
        page: router.query?.page || 1,
        branch_id: idFillter.idBranch != null ? idFillter.idBranch.value : null,
        start_date:
            idFillter?.valueDate?.startDate != null
                ? formatMoment(
                    idFillter?.valueDate?.startDate,
                    FORMAT_MOMENT.DATE_SLASH_LONG
                )
                : null,
        end_date:
            idFillter?.valueDate?.endDate != null
                ? formatMoment(
                    idFillter?.valueDate?.endDate,
                    FORMAT_MOMENT.DATE_SLASH_LONG
                )
                : null,
    };

    const { data: dataBranch = [] } = useBranchList();

    const { data, isFetching, refetch } = useInternalPlanList(params);

    const handlePostStatus = async (id, newStatus) => {
        try {
            const { isSuccess, message } = await apiInternalPlan.apiPostStatus(
                id,
                newStatus
            );
            if (isSuccess == 1) {
                isShow("success", `${dataLang[message] || message}`);
                handleQueryId({ status: false });
                setRefreshing(true);
                await refetch();
                setRefreshing(false);
                return;
            }
            isShow("error", `${dataLang[message] || message}`);
        } catch (error) {
            throw error;
        }
    };

    const onChangeFilter = (type) => (event) =>
        sIdFillter((e) => ({ ...e, [type]: event }));

    const handleOnChangeKeySearch = debounce(({ target: { value } }) => {
        sKeySearch(value);
        router.replace({
            pathname: router.route,
            query: {
                tab: router.query?.tab,
            },
        });
    }, 500);

    const toggleStatus = () => {
        handlePostStatus(isId, status);
    };

    const _HandleChangeInput = (id, checkedUn, type, value) => {

        handleQueryId({
            status: true,
            initialKey: { id, checkedUn, type, value },
        });
    };

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
                    title: `${dataLang?.internal_plan_name || "internal_plan_name"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.internal_plan_status || "internal_plan_status"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.internal_plan_creators || "internal_plan_creators"
                        }`,
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
                    title: `${dataLang?.import_branch || "import_branch"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
            ],
            data: data?.rResult?.map((e, index) => [
                { value: `${e?.id ? e.id : ""}`, style: { numFmt: "0" } },
                { value: `${e?.date ? e?.date : ""}` },
                { value: `${e?.reference_no ? e?.reference_no : ""}` },
                { value: `${e?.plan_name ? e?.plan_name : ""}` },
                { value: `${index % 2 == 0 ? "Chưa lập KHNVL" : "Đã lập KHNVL"}` },
                { value: `${e?.created_by_full_name ? e?.created_by_full_name : ""}` },
                { value: `${e?.note ? e?.note : ""}` },
                { value: `${e?.name_branch ? e?.name_branch : ""}` },
            ]),
        },
    ];

    // breadcrumb
    const breadcrumbItems = [
        {
            label: `Sản xuất`,
            // href: "/",
        },
        {
            label: `${dataLang?.internal_plan || "internal_plan"}`,
        },
    ];

    return (
        <React.Fragment>
            <LayOutTableDynamic
                head={
                    <Head>
                        <title>{dataLang?.internal_plan || "internal_plan"}</title>
                    </Head>
                }
                breadcrumb={
                    <>
                        {statusExprired ? (
                            <EmptyExprired />
                        ) : (
                            // <div className="flex space-x-1 mt-4 3xl:text-sm 2xl:text-[11px] xl:text-[10px] lg:text-[10px]">
                            //     <h6 className="text-[#141522]/40">{dataLang?.internal_planEnd || "internal_planEnd"}</h6>
                            //     <span className="text-[#141522]/40">/</span>
                            //     <h6>{dataLang?.internal_plan || "internal_plan"}</h6>
                            // </div>
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
                            {dataLang?.internal_plan || "internal_plan"}
                        </h2>
                        <div className="flex items-center justify-end gap-2">
                            <ButtonAddNew
                                onClick={() => {
                                    if (role || checkAdd) {
                                        router.push(routerInternalPlan.form);
                                    } else {
                                        isShow("error", WARNING_STATUS_ROLE);
                                    }
                                }}
                                dataLang={dataLang}
                            />
                        </div>
                    </>
                }
                table={
                    <div className="flex flex-col h-full">
                        <div className="w-full items-center flex justify-between gap-2">
                            <div className="flex gap-3 items-center w-full">
                                <SearchComponent
                                    dataLang={dataLang}
                                    colSpan={3}
                                    onChange={handleOnChangeKeySearch.bind(this)}
                                />
                                <SelectComponent
                                    colSpan={3}
                                    options={[
                                        {
                                            value: "",
                                            label:
                                                dataLang?.price_quote_branch || "price_quote_branch",
                                            isDisabled: true,
                                        },
                                        ...dataBranch,
                                    ]}
                                    onChange={onChangeFilter("idBranch")}
                                    value={idFillter.idBranch}
                                    placeholder={
                                        dataLang?.price_quote_branch || "price_quote_branch"
                                    }
                                    hideSelectedOptions={false}
                                    isClearable={true}
                                    isSearchable={true}
                                    noOptionsMessage={() => "Không có dữ liệu"}
                                    closeMenuOnSelect={true}
                                />
                                <DateToDateComponent
                                    className="col-span-3"
                                    value={idFillter.valueDate}
                                    onChange={onChangeFilter("valueDate")}
                                    colSpan={3}
                                />
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <OnResetData sOnFetching={() => { }} onClick={() => refetch()} />
                                {role == true || checkExport ? (
                                    <div className={``}>
                                        {data?.rResult?.length > 0 && (
                                            <ExcelFileComponent
                                                dataLang={dataLang}
                                                filename={"Danh sách kế hoạch nội bộ"}
                                                multiDataSet={multiDataSet}
                                                title="DSKHNB"
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
                        <Customscrollbar className="h-full overflow-y-auto">
                            <div className="w-full">
                                <HeaderTable gridCols={10}>
                                    <ColumnTable colSpan={0.5} textAlign={"center"}>
                                        STT
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"center"}>
                                        {dataLang?.import_day_vouchers || "import_day_vouchers"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1.5} textAlign={"center"}>
                                        {dataLang?.import_code_vouchers || "import_code_vouchers"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={2} textAlign={"left "}>
                                        {dataLang?.internal_plan_name || "internal_plan_name"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"center"}>
                                        {dataLang?.internal_plan_status || "internal_plan_status"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"left"}>
                                        {dataLang?.internal_plan_creators ||
                                            "internal_plan_creators"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"left"}>
                                        {dataLang?.import_branch || "import_branch"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"left"}>
                                        {dataLang?.recall_noteChild || "recall_noteChild"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"center"}>
                                        {dataLang?.import_action || "import_action"}
                                    </ColumnTable>
                                </HeaderTable>
                                {isFetching && !refreshing ? (
                                    <Loading className="h-full" color="#0f4f9e" />
                                ) : data?.rResult?.length > 0 ? (
                                    <>
                                        <div className="divide-y divide-slate-200 h-[100%]">
                                            {data?.rResult?.map((e, index) => (
                                                <RowTable key={e.id.toString()} gridCols={10}>
                                                    <RowItemTable colSpan={0.5} textAlign={"center"}>
                                                        {index + 1}
                                                    </RowItemTable>
                                                    <RowItemTable colSpan={1} textAlign={"center"}>
                                                        {e?.date != null
                                                            ? formatMoment(
                                                                e?.date,
                                                                FORMAT_MOMENT.DATE_SLASH_LONG
                                                            )
                                                            : ""}
                                                    </RowItemTable>
                                                    <RowItemTable colSpan={1.5} textAlign={"center"}>
                                                        <PopupDetail
                                                            dataLang={dataLang}
                                                            className="3xl:text-base 2xl:text-[12.5px] xl:text-[11px] font-medium text-[9px] px-2 col-span-1 text-center text-[#0F4F9E] hover:text-[#5599EC] transition-all ease-linear cursor-pointer "
                                                            name={e?.reference_no}
                                                            id={e?.id}
                                                        />
                                                    </RowItemTable>
                                                    <RowItemTable colSpan={2} textAlign={"left"}>
                                                        {e.plan_name}
                                                    </RowItemTable>
                                                    <RowItemTable colSpan={1} className="mx-auto">
                                                        {/* <BtnStatusApproved
                                                            onClick={() =>
                                                                handleQueryId({
                                                                    id: e?.id,
                                                                    status: true,
                                                                    idChild: e.status == "1" ? "0" : "1",
                                                                })
                                                            }
                                                            type={e.status == "1" ? "1" : "0"}
                                                        /> */}
                                                        <ButtonWarehouse
                                                            warehouseman_id={e.status == "1" ? "1" : "0"}
                                                            _HandleChangeInput={() =>
                                                                handleQueryId({
                                                                    id: e?.id,
                                                                    status: true,
                                                                    idChild: e.status == "1" ? "0" : "1",
                                                                })
                                                            }
                                                            id={e?.id}
                                                        />
                                                    </RowItemTable>
                                                    <RowItemTable
                                                        colSpan={1}
                                                        textAlign={"left"}
                                                        className="flex items-center space-x-1"
                                                    >
                                                        <CustomAvatar
                                                            classNameAvatar="max-w-[26%] w-[26%]"
                                                            profileImage={e?.created_by_profile_image}
                                                            fullName={e?.created_by_full_name}
                                                        />
                                                    </RowItemTable>
                                                    <RowItemTable colSpan={1}>
                                                        {/* <TagBranch className="w-fit">
                                                            {e?.name_branch}
                                                        </TagBranch> */}
                                                        <span className="flex flex-wrap items-center justify-start gap-2">
                                                            {e?.name_branch}
                                                        </span>
                                                    </RowItemTable>
                                                    <RowItemTable
                                                        colSpan={1}
                                                        textAlign={"left"}
                                                        className="truncate"
                                                    >
                                                        {e.note}
                                                    </RowItemTable>
                                                    <RowItemTable
                                                        colSpan={1}
                                                        className="flex justify-center"
                                                    >
                                                        <BtnAction
                                                            onRefresh={refetch.bind(this)}
                                                            dataLang={dataLang}
                                                            id={e?.id}
                                                            status={e?.status}
                                                            type="internal_plan"
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
                        <DropdowLimit dataLang={dataLang} sLimit={sLimit} limit={limit} />
                    </div>
                }
            />
            <PopupConfim
                dataLang={dataLang}
                type="warning"
                nameModel={"internal_plan"}
                title={TITLE_STATUS}
                subtitle={CONFIRMATION_OF_CHANGES}
                isOpen={isOpen}
                status={status}
                save={toggleStatus}
                cancel={() => handleQueryId({ status: false })}
            />
        </React.Fragment>
    );
};

export default InternalPlan;
