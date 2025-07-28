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
import { TagColorProduct } from "@/components/UI/common/Tag/TagStatus";
import {
    LayOutTableDynamic
} from "@/components/UI/common/layout";
import DropdowLimit from "@/components/UI/dropdowLimit/dropdowLimit";
import ExcelFileComponent from "@/components/UI/filterComponents/excelFilecomponet";
import SearchComponent from "@/components/UI/filterComponents/searchComponent";
import SelectComponent from "@/components/UI/filterComponents/selectComponent";
import Loading from "@/components/UI/loading/loading";
import MultiValue from "@/components/UI/mutiValue/multiValue";
import NoData from "@/components/UI/noData/nodata";
import Pagination from "@/components/UI/pagination";
import SelectOptionLever from "@/components/UI/selectOptionLever/selectOptionLever";
import { WARNING_STATUS_ROLE } from "@/constants/warningStatus/warningStatus";
import { useBranchList } from "@/hooks/common/useBranch";
import { useUnitList, useVariantList } from "@/hooks/common/useItems";
import { useProductTypeProducts } from "@/hooks/common/useProductTypeProducts";
import { useStageList } from "@/hooks/common/useStages";
import useFeature from "@/hooks/useConfigFeature";
import useSetingServer from "@/hooks/useConfigNumber";
import { useLimitAndTotalItems } from "@/hooks/useLimitAndTotalItems";
import usePagination from "@/hooks/usePagination";
import useActionRole from "@/hooks/useRole";
import useStatusExprired from "@/hooks/useStatusExprired";
import useTab from "@/hooks/useTab";
import useToast from "@/hooks/useToast";
import formatNumberConfig from "@/utils/helpers/formatnumber";
import { Grid6, TickCircle as IconTick } from "iconsax-react";
import { debounce } from "lodash";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import ModalImage from "react-modal-image";
import { useSelector } from "react-redux";
import ToggleBotAI from "../botAI/components/ToggleBotAI";
import Popup_Detail from "./components/product/PopupDetail";
import Popup_Products from "./components/product/popupProducts";
import { useCategoryOptions } from "./hooks/product/useCategoryOptions";
import { useProductList } from "./hooks/product/useProductList";

const Products = (props) => {
    const dataLang = props.dataLang;

    const isShow = useToast();

    const router = useRouter();

    const feature = useFeature();

    const { paginate } = usePagination();

    const dataSeting = useSetingServer();

    const statusExprired = useStatusExprired();

    const { handleTab: _HandleSelectTab } = useTab();

    const [keySearch, sKeySearch] = useState("");

    const [idBranch, sIdBranch] = useState(null);

    const [openDetail, sOpenDetail] = useState(false);

    const [valueCategory, sValueCategory] = useState(null);

    const [valueFinishedPro, sValueFinishedPro] = useState(null);

    const [dataProductExpiry, sDataProductExpiry] = useState({});

    const { limit, updateLimit: sLimit } = useLimitAndTotalItems();

    const { is_admin: role, permissions_current: auth } = useSelector(
        (state) => state.auth
    );

    const { checkAdd, checkExport } = useActionRole(auth, "products");

    // bộ lọc table
    const params = {
        search: keySearch,
        limit: limit,
        page: router.query?.page || 1,
        "filter[branch_id][]":
            idBranch?.length > 0 ? idBranch.map((e) => e.value) : null,
        "filter[type_products]":
            router.query?.tab === "all" ? 0 : router.query?.tab,
        "filter[category_id]": valueCategory?.value ? valueCategory?.value : "",
        "filter[id]": valueFinishedPro?.value ? valueFinishedPro?.value : "",
    };

    // danh sách đơn vị tính
    const { data: dataUnit } = useUnitList();
    // danh sách công đoạn
    const { data: dataStage } = useStageList(dataLang);
    // dnah sách biến thể
    const { data: dataVariant } = useVariantList();
    // danh sách sản phẩm theo type
    const { data: dataProductType } = useProductTypeProducts(dataLang);
    // danh sách danh mục
    const { data: dataCategory = [] } = useCategoryOptions({});
    // danh sách chi nhánh
    const { data: dataBranchOption = [] } = useBranchList();
    // danh sách sản phẩm
    const { data, isFetching, refetch } = useProductList(params);
    const formatNumber = (number) => {
        return formatNumberConfig(+number, dataSeting);
    };

    // hàm tìm kiếm trong table
    const _HandleOnChangeKeySearch = debounce(({ target: { value } }) => {
        sKeySearch(value);
        router.replace(router.route);
    }, 500);

    // set state trạng thái thành phẩm
    useEffect(() => {
        sDataProductExpiry(feature?.dataProductExpiry);
    }, []);
    // change bộ lọc
    const _HandleFilterOpt = (type, value) => {
        if (type == "category") {
            sValueCategory(value);
        } else if (type == "branch") {
            sIdBranch(value);
        } else if (type == "finishedPro") {
            sValueFinishedPro(value);
        }
    };

    //xuất excel
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
                    title: `${dataLang?.category_titel} `,
                    width: { wpx: 100 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.code_finishedProduct}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.name_finishedProduct}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.type_finishedProduct}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.unit}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.category_material_list_variant}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.stock}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.note}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
                {
                    title: `${dataLang?.client_list_brand}`,
                    width: { wch: 40 },
                    style: {
                        fill: { fgColor: { rgb: "C7DFFB" } },
                        font: { bold: true },
                    },
                },
            ],
            data: data?.rResult?.map((e) => [
                { value: `${e.id}`, style: { numFmt: "0" } },
                { value: `${e.category_name ? e.category_name : ""}` },
                { value: `${e.code ? e.code : ""}` },
                { value: `${e.name ? e.name : ""}` },
                {
                    value: `${e?.type_products?.name ? e?.type_products?.name : ""}`,
                },
                { value: `${e.unit ? e.unit : ""}` },
                { value: `${e.variation ? e.variation?.length : 0}` },
                {
                    value: `${e.stock_quantity ? Number(e?.stock_quantity).toLocaleString() : ""
                        }`,
                },
                { value: `${e.note ? e.note : ""}` },
                { value: `${e.branch ? e.branch?.map((i) => i.name) : ""}` },
            ]),
        },
    ];
    const breadcrumbItems = [
        {
            label: `${dataLang?.header_category_material || "header_category_material"
                }`,
            // href: "/",
        },
        {
            label: `${dataLang?.header_category_finishedProduct_list ||
                "header_category_finishedProduct_list"
                }`,
        },
    ];
    return (
        <div className="min-h-screen relative">
            <LayOutTableDynamic
                head={
                    <Head>
                        <title>{dataLang?.header_category_finishedProduct_list}</title>
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
                            {dataLang?.list_finishedProduct_title}
                        </h2>
                        <div className="flex items-center justify-end gap-2">
                            {role == true || checkAdd ? (
                                <Popup_Products
                                    onRefresh={refetch.bind(this)}
                                    dataProductExpiry={dataProductExpiry}
                                    dataLang={dataLang}
                                    setOpen={sOpenDetail}
                                    isOpen={openDetail}
                                    nameModel={"products"}
                                    className="responsive-text-sm 3xl:py-3 3xl:px-4 py-2 px-3 text-sm font-normal rounded-md bg-background-blue-2 text-white btn-animation hover:scale-105"
                                />
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => {
                                        isShow("error", WARNING_STATUS_ROLE);
                                    }}
                                    className="responsive-text-sm 3xl:py-3 3xl:px-4 py-2 px-3 text-sm font-normal rounded-md bg-background-blue-2 text-white btn-animation hover:scale-105"
                                >
                                    {dataLang?.branch_popup_create_new}
                                </button>
                            )}
                        </div>
                    </>
                }
                fillterTab={
                    <>
                        <div className="flex items-center space-x-4 border-[#E7EAEE] border-opacity-70 border-b-[1px]">
                            <button
                                onClick={_HandleSelectTab.bind(this, "all")}
                                className={`${router.query?.tab === "all"
                                    ? "text-[#0F4F9E]  border-b-2 border-[#0F4F9E]"
                                    : "hover:text-[#0F4F9E] "
                                    } 2xl:text-base text-[15px] px-4 2xl:py-2 py-1 outline-none font-medium`}
                            >
                                {props.dataLang?.all_group}
                            </button>
                            <button
                                onClick={_HandleSelectTab.bind(this, "products")}
                                className={`${router.query?.tab === "products"
                                    ? "text-[#0F4F9E]  border-b-2 border-[#0F4F9E]"
                                    : "hover:text-[#0F4F9E] "
                                    } 2xl:text-base text-[15px] px-4 2xl:py-2 py-1 outline-none font-medium`}
                            >
                                {dataLang?.product}
                            </button>
                            <button
                                onClick={_HandleSelectTab.bind(this, "semi_products")}
                                className={`${router.query?.tab === "semi_products"
                                    ? "text-[#0F4F9E]  border-b-2 border-[#0F4F9E]"
                                    : "hover:text-[#0F4F9E] "
                                    } 2xl:text-base text-[15px] px-4 2xl:py-2 py-1 outline-none font-medium`}
                            >
                                {dataLang?.catagory_finishedProduct_type_semi_products}
                            </button>
                            {/* <button
                                onClick={_HandleSelectTab.bind(this, "semi_products_outside")}
                                className={`${router.query?.tab === "semi_products_outside"
                                    ? "text-[#0F4F9E]  border-b-2 border-[#0F4F9E]"
                                    : "hover:text-[#0F4F9E] "
                                    } 2xl:text-base text-[15px] px-4 2xl:py-2 py-1 outline-none font-medium`}
                            >
                                {dataLang?.catagory_finishedProduct_type_semi_products_outside}
                            </button> */}
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
                                    colSpan={2}
                                />
                                <SelectComponent
                                    options={[
                                        {
                                            value: "",
                                            label:
                                                dataLang?.price_quote_branch || "price_quote_branch",
                                            isDisabled: true,
                                        },
                                        ...dataBranchOption,
                                    ]}
                                    onChange={_HandleFilterOpt.bind(this, "branch")}
                                    value={idBranch}
                                    placeholder={
                                        dataLang?.price_quote_branch || "price_quote_branch"
                                    }
                                    colSpan={4}
                                    components={{ MultiValue }}
                                    isMulti={true}
                                    isClearable={true}
                                    closeMenuOnSelect={false}
                                />
                                <SelectComponent
                                    options={[
                                        {
                                            value: "",
                                            label: dataLang?.category_titel || "category_titel",
                                            isDisabled: true,
                                        },
                                        ...dataCategory,
                                    ]}
                                    formatOptionLabel={SelectOptionLever}
                                    onChange={_HandleFilterOpt.bind(this, "category")}
                                    value={valueCategory}
                                    colSpan={3}
                                    isClearable={true}
                                    placeholder={dataLang?.category_titel || "category_titel"}
                                />
                                {/* <SelectComponent
                                    options={[
                                        {
                                            value: "",
                                            label: `${dataLang?.product}`,
                                            isDisabled: true,
                                        },
                                        ...(Array.isArray(data?.finishedPro)
                                            ? data.finishedPro
                                            : []),
                                    ]}
                                    onChange={_HandleFilterOpt.bind(this, "finishedPro")}
                                    value={valueFinishedPro}
                                    placeholder={dataLang?.product}
                                    colSpan={3}
                                    isClearable={true}
                                    closeMenuOnSelect={false}
                                /> */}
                            </div>
                            <div className="flex items-center justify-end space-x-2">
                                <OnResetData
                                    sOnFetching={() => { }}
                                    onClick={refetch.bind(this)}
                                />
                                {role == true || checkExport ? (
                                    <div className={``}>
                                        {data?.rResult?.length > 0 && (
                                            <ExcelFileComponent
                                                multiDataSet={multiDataSet}
                                                filename={dataLang?.product}
                                                title="DSTP"
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

                        <Customscrollbar className="h-full overflow-y-auto ">
                            <div className="w-full">
                                <HeaderTable gridCols={13}>
                                    <ColumnTable colSpan={1} textAlign={"center"}>
                                        {dataLang?.image || "image"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"left"}>
                                        {dataLang?.category_titel}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"left"}>
                                        {dataLang?.code_finishedProduct ||
                                            "dataLang?.code_finishedProduct"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={2} textAlign={"left"}>
                                        {dataLang?.product}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"center"}>
                                        {dataLang?.unit || "unit"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"center"}>
                                        {dataLang?.category_material_list_variant ||
                                            "category_material_list_variant"}
                                    </ColumnTable>
                                    {/* <ColumnTable colSpan={1} textAlign={'center'}>
                                            {dataLang?.stock || "stock"}
                                        </ColumnTable> */}
                                    <ColumnTable colSpan={1} textAlign={"center"}>
                                        {dataLang?.bom_finishedProduct}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"center"}>
                                        {dataLang?.settings_category_stages_title ||
                                            "settings_category_stages_title"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"left"}>
                                        {dataLang?.note || "note"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={2} textAlign={"left"}>
                                        {dataLang?.client_list_brand || "client_list_brand"}
                                    </ColumnTable>
                                    <ColumnTable colSpan={1} textAlign={"center"}>
                                        {dataLang?.branch_popup_properties ||
                                            "branch_popup_properties"}
                                    </ColumnTable>
                                </HeaderTable>
                                {isFetching ? (
                                    <Loading className="h-80" color="#0f4f9e" />
                                ) : (
                                    <React.Fragment>
                                        {data?.rResult?.length == 0 && <NoData />}
                                        <div className="divide-y divide-slate-200">
                                            {data?.rResult?.map((e) => (
                                                <RowTable key={e?.id.toString()} gridCols={13}>
                                                    <RowItemTable
                                                        colSpan={1}
                                                        className="flex self-center justify-center"
                                                    >
                                                        {e?.images == null ? (
                                                            <ModalImage
                                                                small="/icon/noimagelogo.png"
                                                                large="/icon/noimagelogo.png"
                                                                className="object-cover w-full h-12 rounded"
                                                            />
                                                        ) : (
                                                            <ModalImage
                                                                small={e?.images}
                                                                large={e?.images}
                                                                className="object-contain w-full h-12 rounded"
                                                            />
                                                        )}
                                                    </RowItemTable>
                                                    <RowItemTable colSpan={1} textAlign={"left"}>
                                                        {e?.category_name}
                                                    </RowItemTable>
                                                    <RowItemTable colSpan={1} textAlign={"left"}>
                                                        <Popup_Detail
                                                            id={e?.id}
                                                            dataProduct={e}
                                                            dataProductExpiry={dataProductExpiry}
                                                            dataLang={dataLang}
                                                            classNameBtn="w-full"
                                                        >
                                                            <p className="w-full text-[#0F4F9E] hover:text-blue-500 transition-all ease-linear outline-none break-words">
                                                                {e?.code}
                                                            </p>
                                                        </Popup_Detail>
                                                    </RowItemTable>
                                                    <RowItemTable
                                                        colSpan={2}
                                                        textAlign={"left"}
                                                        className="flex flex-col items-start justify-start gap-y-[4px]"
                                                    >
                                                        <Popup_Detail
                                                            id={e?.id}
                                                            dataProduct={e}
                                                            dataProductExpiry={dataProductExpiry}
                                                            dataLang={dataLang}
                                                        >
                                                            <p className=" text-[#0F4F9E] hover:text-blue-500 transition-all ease-linear w-fit outline-none  text-left">
                                                                {e?.name}
                                                            </p>
                                                        </Popup_Detail>
                                                        {/* <h6 className="flex items-center gap-1"> */}
                                                        <TagColorProduct
                                                            dataLang={dataLang}
                                                            dataKey={e?.type_products?.id}
                                                            name={e?.type_products?.name}
                                                            className="!px-1"
                                                            textSize="text-[11px]"
                                                        />
                                                        {/* </h6> */}
                                                    </RowItemTable>
                                                    <RowItemTable colSpan={1} textAlign={"center"}>
                                                        {e?.unit}
                                                    </RowItemTable>
                                                    <RowItemTable colSpan={1} textAlign={"center"}>
                                                        {formatNumber(e?.variation_count - 1) == 0
                                                            ? ""
                                                            : e?.variation_count - 1}
                                                    </RowItemTable>
                                                    {/* <RowItemTable colSpan={1} textAlign={'center'}>
                                                            {formatNumber(e?.stock_quantity)}
                                                        </RowItemTable> */}
                                                    <RowItemTable
                                                        colSpan={1}
                                                        className="flex items-center justify-center"
                                                    >
                                                        {Number(e?.variation_count) == 0 ? (
                                                            Number(e?.ct_versions) != 0 && (
                                                                <IconTick className="text-green-500" />
                                                            )
                                                        ) : Number(e?.variation_count) >
                                                            Number(e?.ct_versions) ? (
                                                            Number(e?.ct_versions) == 0 ? (
                                                                ""
                                                            ) : (
                                                                formatNumber(e?.ct_versions)
                                                            )
                                                        ) : (
                                                            <IconTick className="text-green-500" />
                                                        )}
                                                    </RowItemTable>
                                                    <RowItemTable
                                                        colSpan={1}
                                                        className="flex items-center justify-center"
                                                    >
                                                        {Number(e?.ct_versions_stage) == 0 ? (
                                                            ""
                                                        ) : (
                                                            <IconTick className="text-green-500" />
                                                        )}
                                                    </RowItemTable>
                                                    <RowItemTable colSpan={1} textAlign={"left"}>
                                                        {e?.note}
                                                    </RowItemTable>
                                                    <RowItemTable colSpan={2}>
                                                        {e?.branch.map((i, index) => (
                                                            <span
                                                                className="flex flex-wrap items-center justify-start gap-2"
                                                                key={index}
                                                            >
                                                                {i.name}
                                                                {/* <TagBranch key={i}>{i.name}</TagBranch> */}
                                                            </span>
                                                        ))}
                                                    </RowItemTable>
                                                    <RowItemTable
                                                        colSpan={1}
                                                        className="pl-2 py-2.5 flex space-x-2 justify-center"
                                                    >
                                                        <BtnAction
                                                            onRefresh={refetch.bind(this)}
                                                            dataLang={dataLang}
                                                            dataProductExpiry={dataProductExpiry}
                                                            id={e.id}
                                                            name={e.name}
                                                            code={e.code}
                                                            dataProduct={e}
                                                            bom={
                                                                Number(e?.variation_count) == 0
                                                                    ? Number(e?.ct_versions) != 0 && true
                                                                    : Number(e?.variation_count) >
                                                                        Number(e?.ct_versions)
                                                                        ? Number(e?.ct_versions) == 0
                                                                            ? false
                                                                            : true
                                                                        : true
                                                            }
                                                            // bom={Number(e?.ct_versions)}
                                                            stage={Number(e?.ct_versions_stage)}
                                                            type="products"
                                                            typeOpen="add"
                                                            className="bg-slate-100 tooltipBoundary xl:px-2 px-1 xl:py-2 py-1.5 rounded xl:text-[13px] text-xs"
                                                        />
                                                    </RowItemTable>
                                                </RowTable>
                                            ))}
                                        </div>
                                    </React.Fragment>
                                )}
                            </div>
                        </Customscrollbar>
                    </div>
                }
                pagination={
                    <div className="flex items-center justify-between gap-2 pr-32">
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
            <div className="fixed bottom-6 right-6 z-[9999]">
                <ToggleBotAI dataLang={dataLang} />
            </div>
        </div>
    );
};
export default Products;
