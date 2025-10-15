import { BtnAction } from "@/components/UI/BtnAction";
import Breadcrumb from "@/components/UI/breadcrumb/BreadcrumbCustom";
import OnResetData from "@/components/UI/btnResetData/btnReset";
import ContainerPagination from "@/components/UI/common/ContainerPagination/ContainerPagination";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import { EmptyExprired } from "@/components/UI/common/EmptyExprired";
import { ColumnTable, HeaderTable, RowItemTable, RowTable } from "@/components/UI/common/Table";
import { TagColorOrange, TagColorRed, TagColorSky } from "@/components/UI/common/Tag/TagStatus";
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
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import { WARNING_STATUS_ROLE } from "@/constants/warningStatus/warningStatus";
import { useBranchList } from "@/hooks/common/useBranch";
import { useObjectCombobox } from "@/hooks/common/useObject";
import { usePayment } from "@/hooks/common/usePayment";
import { useChangeValue } from "@/hooks/useChangeValue";
import useSetingServer from "@/hooks/useConfigNumber";
import { useLimitAndTotalItems } from "@/hooks/useLimitAndTotalItems";
import usePagination from "@/hooks/usePagination";
import useActionRole from "@/hooks/useRole";
import useStatusExprired from "@/hooks/useStatusExprired";
import useToast from "@/hooks/useToast";
import { formatMoment } from "@/utils/helpers/formatMoment";
import formatMoneyConfig from "@/utils/helpers/formatMoney";
import { Grid6 } from "iconsax-react";
import { debounce } from "lodash";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import PopupDetailThere from "../components/detailThere";
import PopupDetail from "./components/detail";
import Popup_dspt from "./components/popup";
import { useReceiptsList } from "./hooks/useReceiptsList";


const inistialValue = {
    idBranch: null,
    idObject: null,
    idMethod: null,
    valueDate: { startDate: null, endDate: null },
};


const Receipts = (props) => {
    const dataLang = props.dataLang;

    const router = useRouter();

    const isShow = useToast();

    const { paginate } = usePagination();

    const dataSeting = useSetingServer();

    const statusExprired = useStatusExprired();

    const [keySearch, sKeySearch] = useState("");

    const { limit, updateLimit: sLimit } = useLimitAndTotalItems();

    const { isValue: value, onChangeValue } = useChangeValue(inistialValue);

    const { is_admin: role, permissions_current: auth } = useSelector((state) => state.auth);

    //thay type
    // other_payslips_coupon
    const { checkAdd, checkEdit, checkExport } = useActionRole(auth, "receipts");

    const parameters = {
        limit: limit,
        page: router.query?.page || 1,
        "filter[search]": keySearch,
        "filter[objects]": value.idObject != null ? value.idObject.value : null,
        "filter[branch_id]": value.idBranch != null ? value.idBranch.value : null,
        "filter[payment_mode]": value.idMethod != null ? value.idMethod.value : null,
        "filter[end_date]": value.valueDate?.endDate != null ? value.valueDate?.endDate : null,
        "filter[start_date]": value.valueDate?.startDate != null ? value.valueDate?.startDate : null,
    };

    const { data: listBr = [] } = useBranchList()

    const { data: listPayment = [] } = usePayment()

    const { data: dataObject = [] } = useObjectCombobox(dataLang)

    const { data, refetch, isLoading, isFetching } = useReceiptsList(parameters);

    const _HandleOnChangeKeySearch = debounce(({ target: { value } }) => {
        sKeySearch(value);
    }, 500);

    const formatMoney = (number) => {
        return formatMoneyConfig(+number, dataSeting);
    };

    const renderMoneyOrDash = (value) => {
        return Number(value) === 0
            ? "-"
            : <>{formatMoney(value)} <span className="underline">đ</span></>;
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
                    title: `${dataLang?.payment_date || "payment_date"}`,
                    width: { wpx: 100 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.payment_code || "payment_code"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.payment_obType || "payment_obType"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.payment_ob || "payment_ob"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.payment_typeOfDocument || "payment_typeOfDocument"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.payment_voucherCode || "payment_voucherCode"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.payment_TT_method || "payment_TT_method"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.payment_amountOfMoney || "payment_amountOfMoney"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.payment_creator || "payment_creator"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.payment_branch || "payment_branch"}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.payment_note || "payment_note"}`,
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
                { value: `${e?.objects ? (dataLang[e.objects] !== undefined ? dataLang[e.objects] : "") : ""}` },
                { value: `${e?.object_text ? e?.object_text : ""}` },
                { value: `${e?.type_vouchers ? dataLang[e?.type_vouchers] || e?.type_vouchers : ""}` },
                { value: `${e?.voucher ? e?.voucher.map((e) => e.code).join(", ") : ""}` },
                { value: `${e?.payment_mode_name ? e?.payment_mode_name : ""}` },
                { value: `${e?.total ? formatMoney(e?.total) : ""}` },
                { value: `${e?.staff_name ? e?.staff_name : ""}` },
                { value: `${e?.branch_name ? e?.branch_name : ""}` },
                { value: `${e?.note ? e?.note : ""}` },
            ]),
        },
    ];


    // breadcrumb
    const breadcrumbItems = [
        {
            label: `Công nợ bán`,
            // href: "/",
        },
        {
            label: `${dataLang?.receipts_title || "receipts_title"}`,
        },
    ];

    return (
        <React.Fragment>
            <LayOutTableDynamic
                head={
                    <Head>
                        <title>{dataLang?.receipts_title || "receipts_title"}</title>
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
                            // <div className="flex space-x-1 mt-4 3xl:text-sm 2xl:text-[11px] xl:text-[10px] lg:text-[10px]">
                            //     <h6 className="text-[#141522]/40">{dataLang?.receipts_title || "receipts_title"}</h6>
                            //     <span className="text-[#141522]/40">/</span>
                            //     <h6>{dataLang?.receipts_title || "receipts_title"}</h6>
                            // </div>
                        )}
                    </>
                }
                titleButton={
                    <>
                        <h2 className="text-title-section text-[#52575E] capitalize font-medium">
                            {dataLang?.receipts_title}
                        </h2>
                        <div className="flex items-center justify-end gap-2">
                            {(role == true || checkAdd)
                                ?
                                <Popup_dspt
                                    onRefresh={refetch.bind(this)}
                                    dataLang={dataLang}
                                    className="responsive-text-sm xl:px-5 px-3 xl:py-2.5 py-1.5 bg-background-blue-2 text-white rounded-lg btn-animation hover:scale-105"
                                />
                                :
                                <button
                                    type="button"
                                    onClick={() => {
                                        isShow("error", WARNING_STATUS_ROLE);
                                    }}
                                    className="responsive-text-sm xl:px-5 px-3 xl:py-2.5 py-1.5 bg-background-blue-2 text-white rounded-lg btn-animation hover:scale-105"
                                >
                                    {dataLang?.branch_popup_create_new}
                                </button>
                            }
                        </div>
                    </>
                }
                table={
                    <div className="flex flex-col h-full">
                        <div className="w-full items-center flex justify-between gap-2">
                            <div className="flex gap-3 items-center w-full">
                                {/* <div className="grid grid-cols-10 gap-2"> */}
                                    <SearchComponent
                                        dataLang={dataLang}
                                        onChange={_HandleOnChangeKeySearch.bind(this)}
                                        colSpan={2}
                                    />
                                    <DateToDateComponent
                                        colSpan={2}
                                        value={value.valueDate}
                                        onChange={onChangeValue("valueDate")}
                                    />
                                    <SelectComponent
                                        options={[
                                            {
                                                value: "",
                                                label: dataLang?.price_quote_branch || "price_quote_branch",
                                                isDisabled: true,
                                            },
                                            ...listBr,
                                        ]}
                                        isClearable={true}
                                        value={value.idBranch}
                                        onChange={onChangeValue("idBranch")}
                                        placeholder={dataLang?.price_quote_branch || "price_quote_branch"}
                                        colSpan={2}
                                    />
                                    <SelectComponent
                                        options={[
                                            {
                                                value: "",
                                                label: dataLang?.payment_TT_method || "payment_TT_method",
                                                isDisabled: true,
                                            },
                                            ...listPayment,
                                        ]}
                                        isClearable={true}
                                        onChange={onChangeValue("idMethod")}
                                        value={value.idMethod}
                                        placeholder={dataLang?.payment_TT_method || "payment_TT_method"}
                                        colSpan={2}
                                    />
                                    <SelectComponent
                                        options={[
                                            {
                                                value: "",
                                                label: dataLang?.payment_ob || "payment_ob",
                                                isDisabled: true,
                                            },
                                            ...dataObject,
                                        ]}
                                        isClearable={true}
                                        onChange={onChangeValue("idObject")}
                                        value={value.idObject}
                                        placeholder={dataLang?.payment_ob || "payment_ob"}
                                        colSpan={2}
                                    />
                                {/* </div> */}
                            </div>
                            <div className="col-span-2">
                                <div className="flex items-center justify-end gap-2">
                                    <OnResetData onClick={() => refetch()} sOnFetching={() => { }} />
                                    {(role == true || checkExport)
                                        ?
                                        <div className={``}>
                                            {data?.rResult?.length > 0 && (
                                                <ExcelFileComponent
                                                    multiDataSet={multiDataSet}
                                                    filename={dataLang?.receipts_lits || "receipts_lits"}
                                                    title="DSPT"
                                                    dataLang={dataLang}
                                                />
                                            )}
                                        </div>
                                        :
                                        <button
                                            onClick={() => isShow("error", WARNING_STATUS_ROLE)}
                                            className={`xl:px-4 px-3 xl:py-2.5 py-1.5 2xl:text-xs xl:text-xs text-[7px] flex items-center space-x-2 bg-[#C7DFFB] rounded hover:scale-105 transition`}
                                        >
                                            <Grid6 className="scale-75 2xl:scale-100 xl:scale-100" size={18} />
                                            <span>{dataLang?.client_list_exportexcel}</span>
                                        </button>
                                    }
                                </div>
                            </div>
                        </div>
                        <Customscrollbar className="h-full overflow-y-auto">
                            <div className="w-full">
                                <HeaderTable gridCols={13} display={"grid"}>
                                    <ColumnTable colSpan={0.5} textAlign={"center"}>
                                        {dataLang?.stt || "stt"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"left"}>
                                        {dataLang?.payment_date || "payment_date"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"left"}>
                                        {dataLang?.payment_code || "payment_code"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"left"}>
                                        {dataLang?.payment_obType || "payment_obType"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1.5} textAlign={"left"}>
                                        {dataLang?.payment_ob || "payment_ob"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"left"}>
                                        {dataLang?.payment_typeOfDocument || "payment_typeOfDocument"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"left"}>
                                        {dataLang?.payment_voucherCode || "payment_voucherCode"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={0.5} textAlign={"left"}>
                                        {"PTTT"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"right"}>
                                        {dataLang?.payment_amountOfMoney || "payment_amountOfMoney"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"center"}>
                                        {dataLang?.payment_creator || "payment_creator"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"left"}>
                                        {dataLang?.payment_branch || "payment_branch"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1.5} textAlign={"left"}>
                                        {dataLang?.payment_note || "payment_note"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"center"}>
                                        {dataLang?.payment_action || "payment_action"}
                                    </ColumnTable>
                                </HeaderTable>
                                {(isLoading || isFetching) ? (
                                    <Loading className="h-full" color="#0f4f9e" />
                                ) : data?.rResult?.length > 0 ? (
                                    <div className="h-full divide-y divide-slate-200">
                                        {data?.rResult?.map((e, index) => (
                                            <RowTable gridCols={13} key={e.id.toString()}>
                                                <RowItemTable colSpan={0.5} textAlign={"center"}>
                                                    {index + 1}
                                                </RowItemTable>
                                                <RowItemTable colSpan={1} textAlign={"left"}>
                                                    {e?.date != null ? formatMoment(e?.date, FORMAT_MOMENT.DATE_SLASH_LONG) : ""}
                                                </RowItemTable>
                                                <RowItemTable colSpan={1} textAlign={"left"}>
                                                    <PopupDetail
                                                        dataLang={dataLang}
                                                        className="responsive-text-sm font-medium hover:text-blue-600 transition-all ease-in-out  rounded-md text-center text-[#0F4F9E]"
                                                        name={e?.code}
                                                        id={e?.id}
                                                    />
                                                </RowItemTable>
                                                <RowItemTable
                                                    colSpan={1}
                                                    textAlign={"left"}
                                                    // className={"flex items-center justify-center"}
                                                >
                                                    {
                                                        (e?.objects === "client" && <TagColorSky name={dataLang[e?.objects] || e?.objects} />)
                                                        ||
                                                        (e?.objects === "supplier" && <TagColorOrange name={dataLang[e?.objects] || e?.objects} />)
                                                        ||
                                                        (e?.objects === "other" && <TagColorRed name={dataLang[e?.objects] || e?.objects} />)
                                                    }
                                                </RowItemTable>
                                                <RowItemTable colSpan={1.5} textAlign={"left"}>
                                                    {e?.object_text}
                                                </RowItemTable>
                                                <RowItemTable colSpan={1}>
                                                    { dataLang[e?.type_vouchers] || e?.type_vouchers}
                                                </RowItemTable>
                                                <RowItemTable colSpan={1} className="" textAlign={"left"}>
                                                    {e?.voucher?.map((code, index) => (
                                                        <PopupDetailThere
                                                            key={code?.id}
                                                            dataLang={dataLang}
                                                            className=" hover:text-blue-600 transition-all ease-in-out responsive-text-sm px-2 py-1 rounded-md text-center text-[#0F4F9E]"
                                                            type={code.voucher_type}
                                                            id={code.id}
                                                            name={code?.code}
                                                        >
                                                            {code?.code}
                                                        </PopupDetailThere>
                                                    ))}
                                                </RowItemTable>
                                                <RowItemTable colSpan={0.5} textAlign={"left"}>
                                                    {e?.payment_mode_name}
                                                </RowItemTable>
                                                <RowItemTable colSpan={1} textAlign={"right"} className={"flex items-center justify-end gap-0.5"}>
                                                    {renderMoneyOrDash(e?.total)}
                                                </RowItemTable>
                                                <RowItemTable colSpan={1} textAlign={"center"}>
                                                    <CustomAvatar
                                                        fullName={e?.staff_name}
                                                        profileImage={e?.profile_image}
                                                    />
                                                </RowItemTable>
                                                <RowItemTable colSpan={1}>
                                                    {/* <TagBranch className="w-fit"> */}
                                                        {e?.branch_name}
                                                        {/* </TagBranch> */}
                                                </RowItemTable>
                                                <RowItemTable
                                                    colSpan={1.5}
                                                    textAlign={"left"}
                                                    className={"truncate"}
                                                >
                                                    {e?.note}
                                                </RowItemTable>
                                                <RowItemTable colSpan={1} className="flex justify-center">
                                                    <BtnAction
                                                        onRefresh={refetch.bind(this)}
                                                        dataLang={dataLang}
                                                        id={e?.id}
                                                        type="receipts"
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
                showTotal={true}
                total={
                    <>
                        <ContainerTotal className={"!grid-cols-26"}>
                            <RowItemTable colSpan={7.5} className="p-2" textAlign={"right"}>
                                {dataLang?.purchase_order_table_total_outside || "purchase_order_table_total_outside"}
                            </RowItemTable>
                            <RowItemTable colSpan={1} textAlign={"right"} className="p-2 gap-0.5 flex items-center justify-end">
                                {renderMoneyOrDash(data?.rTotal?.sum_total)}
                            </RowItemTable>
                        </ContainerTotal>
                    </>
                }
            />

        </React.Fragment>
    );
};

export default Receipts;
