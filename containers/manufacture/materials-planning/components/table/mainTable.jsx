import apiMaterialsPlanning from "@/Api/apiManufacture/manufacture/materialsPlanning/apiMaterialsPlanning";
import PlusIcon from "@/components/icons/common/PlusIcon";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import { TagColorOrange } from "@/components/UI/common/Tag/TagStatus";
import PopupConfim from "@/components/UI/popupConfim/popupConfim";
import Zoom from "@/components/UI/zoomElement/zoomElement";
import { optionsQuery } from "@/configs/optionsQuery";
import {
    CONFIRM_DELETION,
    TITLE_DELETE_COMMAND,
} from "@/constants/delete/deleteTable";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import { ProductionsOrdersContext } from "@/containers/manufacture/productions-orders/context/productionsOrders";
import { useBranchList } from "@/hooks/common/useBranch";
import { useInternalPlansSearchCombobox } from "@/hooks/common/useInternalPlans";
import { useOrdersSearchCombobox } from "@/hooks/common/useOrder";
import useSetingServer from "@/hooks/useConfigNumber";
import useToast from "@/hooks/useToast";
import { useToggle } from "@/hooks/useToggle";
import { formatMoment } from "@/utils/helpers/formatMoment";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { SearchNormal1 } from "iconsax-react";
import { debounce } from "lodash";
import dynamic from "next/dynamic";
import React, { useContext, useEffect, useState } from "react";
import { RiDeleteBin5Line } from "react-icons/ri";
import { v4 as uddid } from "uuid";
import FilterHeader from "../header/filterHeader";
import PopupKeepStock from "../popup/popupKeepStock";
import PopupPurchaseBeta from "../popup/popupPurchaseBeta";
import TabItem from "./tabItem";
import TabKeepStock from "./tabKeepStock";
import TabPlan from "./tabPlan";

const ModalDetail = dynamic(
    () =>
        import(
            "@/containers/manufacture/productions-orders/components/modal/modalDetail"
        ),
    { ssr: false }
);

const initialState = {
    isTab: "item",
    countAll: 0,
    productionOrdersList: [],
    listDataRight: {
        title: "",
        poId: null,
        referenceNoPo: "",
        dataPPItems: [],
        dataBom: {
            materialsBom: [],
            productsBom: [],
        },
        dataKeepStock: [],
        dataPurchase: [],
    },
    next: null,
};

const initialValue = {
    page: 1,
    limit: 15,
    search: "",
    dateStart: null,
    dateEnd: null,
    listOrders: [],
    listPlan: [],
    valueOrder: null,
    valuePlan: null,
    valueBr: null,
    searchOrder: "",
    searchPlan: "",
    valueDate: { startDate: null, endDate: null },
};

const MainTable = ({ dataLang }) => {
    const arrButton = [
        // {
        //     id: 1,
        //     name: dataLang?.salesOrder_keep_stock || "salesOrder_keep_stock",
        //     icon: <MdAdd className="text-base text-blue-600" />,
        // },
        // {
        //     id: 2,
        //     name: dataLang?.materials_planning_add_purchase || "materials_planning_add_purchase",
        //     icon: <MdAdd className="text-base text-blue-600" />,
        //     // icon: "/materials_planning/add.png",
        // },
        // {
        //     id: 3,
        //     name: dataLang?.materials_planning_delete || "materials_planning_delete",
        //     icon: <RiDeleteBin5Line className="text-base text-red-600" />,
        //     // icon: "/materials_planning/delete.png",
        // },
        {
            id: 1,
            name: dataLang?.salesOrder_keep_stock || "salesOrder_keep_stock",
            // icon: <MdAdd className="text-base text-blue-600" />,
            icon: <PlusIcon className="text-white" />,
        },
        {
            id: 2,
            name: "Thêm mua hàng",
            // icon: <MdAdd className="text-base text-blue-600" />,
            // icon: "/materials_planning/add.png",
            icon: <PlusIcon className="text-white" />,
        },
        {
            id: 3,
            name: dataLang?.materials_planning_delete || "materials_planning_delete",
            icon: (
                <RiDeleteBin5Line
                    // className="text-base text-red-600"
                    className="text-white"
                />
            ),
            // icon: "/materials_planning/delete.png",
        },
    ];

    const listTab = [
        {
            id: uddid(),
            name: dataLang?.materials_planning_items || "materials_planning_items",
            type: "item",
        },
        {
            id: uddid(),
            name: dataLang?.materials_planning_plan || "materials_planning_plan",
            type: "plan",
        },
        {
            id: uddid(),
            name: "Giữ kho & Mua hàng",
            // name: dataLang?.materials_planning_keep_stock || "materials_planning_keep_stock",
            type: "keepStock",
        },
    ];

    const isShow = useToast();

    const dataSeting = useSetingServer();

    const [isParentId, sIsParentId] = useState(null);

    const [isFetching, sIsFetChing] = useState(false);

    const [isMounted, sIsMounted] = useState(false);

    const [isValue, sIsValue] = useState(initialValue);

    const [dataTable, sDataTable] = useState(initialState);

    const { isOpen, isId, handleQueryId, isIdChild } = useToggle();

    const queryValue = (key) => sIsValue((prve) => ({ ...prve, ...key }));

    const queryState = (key) => sDataTable((prve) => ({ ...prve, ...key }));

    const { data: listBranch = [] } = useBranchList();

    const { data: listOrder = [] } = useOrdersSearchCombobox(isValue.searchOrder);

    const { data: listPlan = [] } = useInternalPlansSearchCombobox(
        isValue.searchPlan
    );

    const {
        isStateProvider: isStateProviderProductions,
        queryState: queryStateProviderProductions,
    } = useContext(ProductionsOrdersContext);

    useEffect(() => {
        sIsMounted(true);
    }, []);

    const convertArrData = (arr) => {
        const newData = arr?.map((e) => {
            return {
                id: e?.id,
                title: e?.reference_no,
                time: formatMoment(e?.date, FORMAT_MOMENT.DATE_SLASH_LONG),
                name: e?.created_by_full_name,
                nameBranch: e?.name_branch,
                productionOrder: [],
                followUp: e?.listObject?.map((i) => {
                    return {
                        id: i?.pp_id,
                        nameFollow: i?.reference_no,
                        typeFollow: i?.object_type == 1 ? "Đơn hàng" : "Kế hoạch nội bộ",
                    };
                }),
                note: "",
            };
        });

        return newData;
    };

    const params = {
        // date_start: isValue.dateStart
        //     ? formatMoment(isValue.dateStart, FORMAT_MOMENT.DATE_SLASH_LONG)
        //     : "",
        // date_end: isValue.dateEnd
        //     ? formatMoment(isValue.dateEnd, FORMAT_MOMENT.DATE_SLASH_LONG)
        //     : "",

        date_start:
            isValue.valueDate?.startDate != null
                ? formatMoment(isValue.valueDate?.startDate, FORMAT_MOMENT.DATE_SLASH_LONG)
                : null,
        date_end:
            isValue.valueDate?.endDate != null ? formatMoment(isValue.valueDate?.endDate, FORMAT_MOMENT.DATE_SLASH_LONG) : null,
        search: isValue.search == "" ? "" : isValue.search,
        orders_id:
            [isValue.valueOrder?.value]?.length > 0
                ? [isValue.valueOrder?.value].map((e) => e)
                : "",
        internal_plans_id:
            [isValue.valuePlan?.value]?.length > 0
                ? [isValue.valuePlan?.value].map((e) => e)
                : "",
        branch_id: isValue.valueBr?.value || "",
    };
    console.log("🚀 ~ params:", params)
    useEffect(() => {
        sIsParentId(null);
    }, [isValue.search]);

    const fetchDataTable = async (page = 1, type) => {
        try {
            const { data } = await apiMaterialsPlanning.apiProductionPlans(
                page,
                isValue.limit,
                { params: params }
            );
            const arrayItem = convertArrData(data?.productionPlans);

            queryState({
                countAll: data?.countAll,
                productionOrdersList: arrayItem,
                next: data?.next == 1,
            });

            sIsParentId(
                isValue.search || type == "delete"
                    ? arrayItem[0]?.id
                    : !isParentId
                        ? arrayItem[0]?.id
                        : isParentId ?? null
            );

            if (type == "submit") {
                refetch();
            }

            if (type == "delete") {
                await fetchDataTableRight(arrayItem[0]?.id);
            }

            if (data?.productionPlans?.length == 0) {
                queryState({
                    listDataRight: {
                        ...dataTable.listDataRight,
                        title: null,
                        referenceNoPo: null,
                        poId: null,
                        dataPPItems: [],
                        dataBom: { productsBom: [], materialsBom: [] },
                        dataKeepStock: [],
                        dataPurchases: [],
                    },
                });
            }
        } catch (error) {
            throw error;
        }
    };

    useEffect(() => {
        if (isMounted) {
            fetchDataTable(isValue.page);
        }
    }, [
        isValue.search,
        isValue.dateStart,
        isValue.dateEnd,
        isValue.valueOrder,
        isValue.valuePlan,
        isValue.valueBr,
        isMounted,
        isValue.valueDate
    ]);

    const fetchDataTableSeeMore = async () => {
        try {
            const { data } = await apiMaterialsPlanning.apiProductionPlans(
                isValue.page,
                isValue.limit,
                { params: params }
            );
            const item = convertArrData(data?.productionPlans);
            let arrayItem = [...dataTable.productionOrdersList, ...item];
            queryState({
                countAll: data?.countAll,
                productionOrdersList: arrayItem,
                next: data?.next == 1,
            });

            if (data?.productionPlans?.length == 0) {
                queryState({
                    listDataRight: {
                        ...dataTable.listDataRight,
                        title: null,
                        poId: null,
                        referenceNoPo: null,
                        dataPPItems: [],
                        dataBom: { productsBom: [], materialsBom: [] },
                        dataKeepStock: [],
                        dataPurchases: [],
                    },
                });
            }
        } catch (error) {
            throw error;
        }
    };

    useEffect(() => {
        if (isValue.page != 1) {
            fetchDataTableSeeMore();
        }
    }, [isValue.page]);

    const fetchDataTableRight = async (id) => {
        try {
            const { data, isSuccess } =
                await apiMaterialsPlanning.apiDetailProductionPlans(id);

            if (isSuccess == 1) {
                queryState({
                    listDataRight: {
                        poId: data?.productionPlan?.po_id,
                        referenceNoPo: data?.productionPlan?.reference_no_po,
                        title: data?.productionPlan?.reference_no,
                        idCommand: data?.productionPlan?.id,
                        dataPPItems: data?.listPPItems?.map((e) => {
                            return {
                                ...e,
                                id: e?.object_id,
                                title: e?.reference_no,
                                showChild: true,
                                arrListData: e?.items?.map((i) => {
                                    return {
                                        id: uddid(),
                                        image: i?.images ? i?.images : "/icon/noimagelogo.png",
                                        name: i?.item_name,
                                        itemVariation: i?.product_variation,
                                        code: i?.item_code,
                                        quantity: +i?.quantity,
                                        unit: i?.unit_name,
                                        timeline: {
                                            start: formatMoment(
                                                i?.timeline_start,
                                                FORMAT_MOMENT.DATE_SLASH_LONG
                                            ),
                                            end: formatMoment(
                                                i?.timeline_end,
                                                FORMAT_MOMENT.DATE_SLASH_LONG
                                            ),
                                        },
                                    };
                                }),
                            };
                        }),
                        dataBom: {
                            productsBom: data?.listBom?.productsBom?.map((e) => {
                                return {
                                    ...e,
                                    id: e?.item_id,
                                    name: e?.item_name,
                                    image: e?.images ? e?.images : "/icon/noimagelogo.png",
                                    unit: e?.unit_name,
                                    use: e?.total_quota, //sl sử dụng
                                    exist: e?.quantity_warehouse, //sl tồn
                                    lack: e?.quantity_rest, //sl thiếu
                                    code: e?.item_code,
                                    itemVariation: e?.item_variation,
                                    quantityKeep: e?.quantity_keep, //sl đã giữ
                                };
                            }),
                            materialsBom: data?.listBom?.materialsBom?.map((e) => {
                                return {
                                    ...e,
                                    id: e?.item_id,
                                    name: e?.item_name,
                                    image: e?.images ? e?.images : "/icon/noimagelogo.png",
                                    unit: e?.unit_name,
                                    use: e?.total_quota, //sl sử dụng
                                    exchange: e?.quota_primary, //sl quy đổi
                                    exist: e?.quantity_warehouse, //sl tồn
                                    lack: e?.quantity_rest, //sl thiếu
                                    code: e?.item_code,
                                    itemVariation: e?.item_variation,
                                    quantityKeep: e?.quantity_keep, //sl đã giữ
                                };
                            }),
                        },
                        dataKeepStock: data?.keepWarehouses?.map((e) => {
                            return {
                                ...e,
                                id: e?.id,
                                title: e?.code,
                                time: formatMoment(e?.date, FORMAT_MOMENT.DATE_SLASH_LONG),
                                user: e?.created_by_name,
                                warehousemanId: e?.warehouseman_id,
                                warehouseFrom: e?.name_w_from,
                                warehouseTo: e?.name_w_to,
                                arrListData: e?.items?.map((i) => {
                                    return {
                                        id: i?.id_transfer,
                                        image: i?.images ? i?.images : "/icon/noimagelogo.png",
                                        name: i?.item_name,
                                        quantity: i?.quantity_net,
                                        unit: i?.unit_name,
                                        lot: i?.lot,
                                        expiration_date: i?.expiration_date,
                                        serial: i?.serial,
                                        code: i?.item_code,
                                        itemVariation: i?.item_variation,
                                        locationFrom: i?.name_location_from,
                                        locationTo: i?.name_location_to,
                                    };
                                }),
                            };
                        }),
                        dataPurchases: data?.purchase_order?.map((e) => {
                            // dataPurchases: data?.purchases?.map((e) => {
                            return {
                                ...e,
                                id: e?.id,
                                title: e?.code,
                                time: formatMoment(e?.date, FORMAT_MOMENT.DATE_SLASH_LONG),
                                user: e?.created_by_name,
                                status: e?.status,
                                arrListData: e?.items?.map((i) => {
                                    return {
                                        id: i?.id_transfer,
                                        image: i?.images ? i?.images : "/icon/noimagelogo.png",
                                        name: i?.item_name,
                                        quantity: i?.quantity_net,
                                        quantityImport: i?.quantity_import,
                                        unit: i?.unit_name,
                                        lot: i?.lot,
                                        expiration_date: i?.expiration_date,
                                        serial: i?.serial,
                                        code: i?.item_code,
                                        itemVariation: i?.item_variation,
                                        processBar: [
                                            {
                                                id: uddid(),
                                                active:
                                                    i?.quantity_order && i?.quantity_order > 0
                                                        ? true
                                                        : false,
                                                title: "Đặt hàng",
                                                quantity: i?.quantity_order,
                                            },
                                            {
                                                id: uddid(),
                                                active:
                                                    i?.quantity_import && i?.quantity_import > 0
                                                        ? true
                                                        : false,
                                                title: "Nhập hàng",
                                                quantity: i?.quantity_import,
                                            },
                                        ],
                                    };
                                }),
                            };
                        }),
                    },
                });
            }
        } catch (error) {
            throw error;
        }
    };

    const { isLoading: isLoadingDataTableRight, refetch } = useQuery({
        queryKey: ["fetch_data_table_right", isParentId],
        queryFn: () => fetchDataTableRight(isParentId),
        enabled: !!isParentId,
        staleTime: 10000,
        placeholderData: keepPreviousData,
        ...optionsQuery,
    });

    const handleActiveTab = (e) => {
        queryState({ isTab: e });
    };

    const handleConfim = async () => {
        const { isSuccess, message } =
            await apiMaterialsPlanning.apiDeleteProductionPlans(isId);
        if (isSuccess == 1) {
            fetchDataTable(1, "delete");
            isShow("success", `${dataLang[message] || message}`);
        } else {
            isShow("error", `${dataLang[message] || message}`);
        }
        handleQueryId({ status: false });
    };

    const handShowItem = (id, type) => {
        queryState({
            listDataRight: {
                ...dataTable.listDataRight,
                [type]: dataTable.listDataRight?.[type]?.map((e) => {
                    if (e.id == id) {
                        return {
                            ...e,
                            showChild: !e.showChild,
                        };
                    }
                    return e;
                }),
            },
        });
    };

    const onChangeSearch = debounce((e) => {
        queryValue({ search: e.target.value, page: 1 });
    }, 500);

    const handDeleteItem = (id, type) => {
        queryValue({ page: 1 });
        handleQueryId({ status: true, id: id, idChild: type });
    };

    const handleConfimDeleteItem = async () => {
        const type = {
            dataKeepStock: `/api_web/Api_transfer/transfer/${isId}?csrf_protection=true`,
            dataPurchases: `/api_web/Api_purchases/purchases/${isId}?csrf_protection=true`,
        };
        const { isSuccess, message } =
            await apiMaterialsPlanning.apiDeletePurchasesTransfer(type[isIdChild]);
        if (isSuccess) {
            fetchDataTable(1, "delete");
            queryValue({ page: 1 });
            isShow("success", dataLang[message] || message);
        } else {
            isShow("error", dataLang[message] || message);
        }
        handleQueryId({ status: false });
    };

    const fetchDataPlan = debounce(async (e) => {
        queryValue({ searchPlan: e });
    }, 500);

    const fetchDataOrder = debounce(async (e) => {
        queryValue({ searchOrder: e });
    }, 500);

    const shareProps = {
        dataTable,
        dataLang,
        filterItem: () => { },
        handShowItem,
        handDeleteItem,
        isFetching: isLoadingDataTableRight,
        isValue,
        listPlan,
        listBranch,
        listOrder,
        queryValue,
        fetchDataTable,
        fetchDataOrder,
        fetchDataPlan,
        refetchProductionsOrders: () => { },
    };

    if (!isMounted) return null;

    return (
        <div className="h-full">
            <FilterHeader {...shareProps} />
            <div className="!mt-[14px]">
                <h1 className="text-[#141522] font-medium text-sm my-2">
                    {dataLang?.materials_planning_total_nvl ||
                        "materials_planning_total_nvl"}
                    : {dataTable?.countAll}
                </h1>
                <div className="flex ">
                    <div className="w-[20%] border-r-0 border-[#d8dae5] border">
                        <div className="border-b py-2 px-1 flex items-center justify-center bg-[#D0D5DD]/20 ">
                            <form className="relative flex items-center w-full">
                                <SearchNormal1
                                    size={20}
                                    className="absolute 2xl:left-3 z-0 text-[#cccccc] xl:left-[4%] left-[1%]"
                                />
                                <input
                                    onChange={(e) => onChangeSearch(e)}
                                    className="relative border border-[#d8dae5] bg-white outline-[#D0D5DD] focus:outline-[#0F4F9E] 2xl:text-left 2xl:pl-10 xl:pl-0 p-0 2xl:py-1.5 py-2.5 rounded-md 2xl:text-base text-xs xl:text-center text-center 2xl:w-full xl:w-full w-[100%]"
                                    type="text"
                                    placeholder={
                                        dataLang?.materials_planning_find_nvl ||
                                        "materials_planning_find_nvl"
                                    }
                                />
                            </form>
                        </div>
                        <Customscrollbar className="3xl:h-[65vh] xxl:h-[54.5vh] 2xl:h-[56vh] xl:h-[56vh] lg:h-[55vh] h-[35vh] overflow-y-auto">
                            {dataTable.productionOrdersList.map((e, eIndex) => (
                                <div
                                    key={e.id}
                                    onClick={() => {
                                        // refetch()
                                        sIsParentId(e.id);
                                    }}
                                    // onClick={() => handleShow(e.id)}
                                    className={`py-2 pl-2 pr-3 ${e.id == isParentId && "bg-[#F0F7FF]"
                                        } hover:bg-[#F0F7FF] cursor-pointer transition-all ease-linear ${dataTable.length - 1 == eIndex
                                            ? "border-b-none"
                                            : "border-b"
                                        } `}
                                >
                                    <div className="flex justify-between">
                                        <div className="flex flex-col gap-1">
                                            <h1 className="3xl:text-base xxl:text-base 2xl:text-sm xl:text-xs lg:text-xs text-sm font-medium text-[#0F4F9E]">
                                                {e.title}
                                            </h1>
                                            <h3 className="text-[#667085] font-normal text-[11px]">
                                                {dataLang?.materials_planning_create_on ||
                                                    "materials_planning_create_on"}{" "}
                                                <span className="text-[#141522] font-medium 3xl:text-xs text-[11px]">
                                                    {e.time}
                                                </span>
                                            </h3>
                                            {/* <TagBranch className="w-fit">{e?.nameBranch}</TagBranch> */}
                                            <p className="responsive-text-sm font-semibold text-wrap py-1">
                                                {e?.nameBranch}
                                            </p>
                                        </div>
                                    </div>
                                    {e.id == isParentId && (
                                        <div className="flex flex-col gap-2 mt-1">
                                            <div className="flex items-center gap-1">
                                                <h3 className=" text-[#52575E] font-normal 3xl:text-sm text-xs">
                                                    {dataLang?.materials_planning_foloww_up ||
                                                        "materials_planning_foloww_up"}{" "}
                                                    :
                                                </h3>
                                                <div className="flex items-center gap-1">
                                                    {e.followUp.map((i) => (
                                                        <React.Fragment key={i.id}>
                                                            <h2 className="text-[#191D23] font-medium 3xl:text-sm text-xs">
                                                                {i.nameFollow}
                                                            </h2>
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {dataTable.next && (
                                <button
                                    type="button"
                                    onClick={() => queryValue({ page: isValue.page + 1 })}
                                    className="block w-full py-1 mx-auto mt-1 text-sm transition-all duration-200 ease-linear bg-blue-50 hover:bg-blue-200"
                                >
                                    {dataLang?.materials_planning_see_more ||
                                        "materials_planning_see_more"}
                                </button>
                            )}
                        </Customscrollbar>
                    </div>
                    <div className="w-[80%] border border-[#d8dae5] ">
                        <div className="flex items-center justify-between px-4 py-1 border-b">
                            <div>
                                <h1 className="text-[#52575E] font-normal text-xs uppercase">
                                    {dataLang?.materials_planning_nvl || "materials_planning_nvl"}
                                </h1>
                                <h1 className="text-[#3276FA] font-medium 3xl:text-[20px] text-[16px] uppercase">
                                    {/* {dataTable.listDataRight?.title ?? (dataLang?.materials_planning_no_nvl || "materials_planning_no_nvl")} <span>{}</span> */}
                                    {dataTable.listDataRight?.title ? (
                                        <div className="flex items-center">
                                            <p>{dataTable.listDataRight?.title}</p>
                                            {dataTable.listDataRight?.referenceNoPo && (
                                                <span>
                                                    /{" "}
                                                    <TagColorOrange
                                                        onClick={() => {
                                                            // queryStateProviderProductions({
                                                            //     openModal: true,
                                                            //     dataModal: {
                                                            //         id: dataTable.listDataRight?.poId
                                                            //     }
                                                            // });
                                                        }}
                                                        name={dataTable.listDataRight?.referenceNoPo}
                                                        className={
                                                            "relative !text-[11px] top-0 3xl:!py-1 !py-1 cursor-pointer select-none"
                                                        }
                                                    />
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        dataLang?.materials_planning_no_nvl ||
                                        "materials_planning_no_nvl"
                                    )}
                                </h1>
                            </div>
                            <div className="flex gap-4">
                                {arrButton.map((e) => (
                                    <Zoom
                                        key={e.id}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 1.08 }}
                                        className="w-fit"
                                    >
                                        {(e.id == 3 && (
                                            <button
                                                // className="bg-red-100 rounded-lg outline-none focus:outline-none"
                                                className=" responsive-text-sm 3xl:py-3 3xl:px-4 py-2 px-3 bg-red-600 text-white rounded-lg btn-animation hover:scale-105 flex items-center gap-x-2"
                                                onClick={() => {
                                                    if (+dataTable?.countAll == 0) {
                                                        return isShow(
                                                            "error",
                                                            dataLang?.materials_planning_please_add ||
                                                            "materials_planning_please_add"
                                                        );
                                                    }
                                                    if (e.id == 3) {
                                                        queryValue({ page: 1 });
                                                        handleQueryId({
                                                            status: true,
                                                            id: dataTable.listDataRight?.idCommand,
                                                        });
                                                    }
                                                }}
                                            >
                                                {e.icon} {e.name}
                                            </button>
                                        )) ||
                                            (e.id == 1 && (
                                                <PopupKeepStock
                                                    id={e.id}
                                                    queryValue={queryValue}
                                                    fetchDataTable={fetchDataTable}
                                                    dataLang={dataLang}
                                                    title={e.name}
                                                    dataTable={dataTable}
                                                    icon={e.icon}
                                                />
                                            )) ||
                                            (e.id == 2 && (
                                                <PopupPurchaseBeta
                                                    id={e.id}
                                                    queryValue={queryValue}
                                                    fetchDataTable={fetchDataTable}
                                                    dataLang={dataLang}
                                                    title={e.name}
                                                    dataTable={dataTable}
                                                    icon={e.icon}
                                                />
                                            ))}
                                    </Zoom>
                                ))}
                            </div>
                        </div>
                        <div className="mx-4">
                            <div className="my-6 border-b ">
                                <div className="flex items-center gap-4 ">
                                    {listTab.map((e) => (
                                        <button
                                            key={e.id}
                                            onClick={() => handleActiveTab(e.type)}
                                            className={`hover:bg-[#F7FBFF] ${dataTable.isTab == e.type
                                                ? "border-[#0F4F9E] border-b bg-[#F7FBFF]"
                                                : "border-b border-transparent"
                                                } hover:border-[#0F4F9E] hover:border-b group transition-all duration-200 ease-linear outline-none focus:outline-none`}
                                        >
                                            <h3
                                                className={`py-[10px] px-2  font-normal ${dataTable.isTab == e.type
                                                    ? "text-[#0F4F9E]"
                                                    : "text-[#667085]"
                                                    } 3xl:text-base text-sm group-hover:text-[#0F4F9E] transition-all duration-200 ease-linear`}
                                            >
                                                {e.name}
                                            </h3>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="">
                                {dataTable.isTab == "item" && <TabItem {...shareProps} />}
                                {dataTable.isTab == "plan" && <TabPlan {...shareProps} />}
                                {dataTable.isTab == "keepStock" && (
                                    <TabKeepStock {...shareProps} />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* <ModalDetail {...shareProps} /> */}
            <PopupConfim
                dataLang={dataLang}
                type="warning"
                title={TITLE_DELETE_COMMAND}
                subtitle={CONFIRM_DELETION}
                isOpen={isOpen}
                save={() => {
                    if (isIdChild) {
                        handleConfimDeleteItem();
                    } else {
                        handleConfim();
                    }
                }}
                cancel={() => handleQueryId({ status: false })}
            />
        </div>
    );
};
export default MainTable;
