import apiProductionsOrders from "@/Api/apiManufacture/manufacture/productionsOrders/apiProductionsOrders";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import TagBranch from "@/components/UI/common/Tag/TagBranch";
import Loading from "@/components/UI/loading/loading";
import NoData from "@/components/UI/noData/nodata";
import PopupConfim from "@/components/UI/popupConfim/popupConfim";
import { optionsQuery } from "@/configs/optionsQuery";
import { CONFIRM_DELETION, TITLE_DELETE_PRODUCTIONS_ORDER } from "@/constants/delete/deleteTable";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import { useBranchList } from "@/hooks/common/useBranch";
import { useInternalPlansSearchCombobox } from "@/hooks/common/useInternalPlans";
import { useItemsVariantSearchCombobox } from "@/hooks/common/useItems";
import { useOrdersSearchCombobox } from "@/hooks/common/useOrder";
import { useToggle } from "@/hooks/useToggle";
import { formatMoment } from "@/utils/helpers/formatMoment";
import { keepPreviousData, useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { ArrowDown2, SearchNormal1 } from "iconsax-react";
import { debounce } from "lodash";
import dynamic from "next/dynamic";
import React, { memo, useContext, useEffect, useRef, useState } from "react";
import { v4 as uddid } from "uuid";
import { ProductionsOrdersContext } from "../../context/productionsOrders";
import { useProductionOrdersCombobox } from "../../hooks/useProductionOrdersCombobox";
import { useProductionOrdersComboboxDetail } from "../../hooks/useProductionOrdersComboboxDetail";
import FilterHeader from "../header/filterHeader";
import ModalDetail from "../modal/modalDetail";
import TabItem from "../ui/DetailProductionOrderList";
import TabSemi from "./tabSemi";
import PopupConfimStage from "../popup/PopupConfimStage";
import { RiDeleteBin5Line } from "react-icons/ri";
import useToast from "@/hooks/useToast";
import OnResetData from "@/components/UI/btnResetData/btnReset";
import Zoom from "@/components/UI/zoomElement/zoomElement";
import PopupRecallRawMaterials from "../popup/PopupRecallRawMaterials";
import { useSelector } from "react-redux";
import FunnelIcon from "@/components/icons/common/FunnelIcon";
import CaretDownIcon from "@/components/icons/common/CaretDownIcon";
import ButtonAnimationNew from "@/components/common/button/ButtonAnimationNew";
import FilterDropdown from "@/components/common/dropdown/FilterDropdown";

import DatePicker from "react-datepicker";
import MagnifyingGlassIcon from "@/components/icons/common/MagnifyingGlassIcon";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/router";

// const PopupConfimStage = dynamic(() => import("../popup/PopupConfimStage"), { ssr: false });
import MultiValue from "@/components/UI/mutiValue/multiValue";
import RadioDropdown from "@/components/common/dropdown/RadioDropdown";
import SelectComponentNew from "@/components/common/select/SelectComponentNew";
import { ContainerFilterTab } from "@/components/UI/common/layout";

const listTab = [
    {
        id: uddid(),
        name: dataLang?.import_finished_product || "import_finished_product",
        type: "products",
    },
    {
        id: uddid(),
        name: dataLang?.materials_planning_semi || "materials_planning_semi",
        type: "semiProduct",
    },
];

const listLsxTab = [
    {
        id: "2323",
        name: "Thông tin",
        count: null,
        type: "products",
    },
    {
        id: "43434",
        name: "Kế hoạch BTP & NVL",
        count: 0,
        type: "semiProduct",
    },
];

const MainTable = ({ dataLang, typeScreen }) => {
    const router = useRouter()

    const tabListRefs = useRef([]);
    const underlineRef = useRef(null)

    const [underlineProps, setUnderlineProps] = useState({ left: 0, width: 0 })

    const typePageMoblie = typeScreen == 'mobile'

    const [isParentId, sIsParentId] = useState(null);

    const isShow = useToast()

    const { data: listBr = [] } = useBranchList()

    const [isMouted, setIsMouted] = useState(false);
    const [isOpenSearch, setIsOpenSearch] = useState(false);

    const { isOpen, handleQueryId, isIdChild, isId } = useToggle();

    const { isStateProvider: isState, queryState } = useContext(ProductionsOrdersContext);

    const { data: listOrders = [] } = useOrdersSearchCombobox(isState.searchOrders);

    const { data: listPlan = [] } = useInternalPlansSearchCombobox(isState.searchPlan);

    const { data: comboboxProductionOrdersDetail = [] } = useProductionOrdersComboboxDetail(isState.searchPODetail)

    const { data: listProducts = [] } = useItemsVariantSearchCombobox(isState.searchItemsVariant);

    const { data: comboboxProductionOrders = [] } = useProductionOrdersCombobox(isState.searchProductionOrders)

    const handleFilter = (type, value) => queryState({ [type]: value, page: 1 });

    const stateFilterDropdown = useSelector(state => state.stateFilterDropdown)

    useEffect(() => {
        setIsMouted(true);
    }, []);


    useEffect(() => {
        const activeIndex = listLsxTab.findIndex(e => e.id === isState?.isTabList)

        const activeTab = tabListRefs.current[activeIndex]
        if (activeTab) {
            const { offsetLeft, offsetWidth } = activeTab
            setUnderlineProps({ left: offsetLeft, width: offsetWidth })
        }
    }, [])

    const convertArrData = (arr) => {
        const newData = arr?.map((e) => {
            return {
                ...e,
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
                        typeFollow: "",
                    };
                }),
                // processBar: [
                //     { id: uddid(), active: true, date: new Date(), title: 'Bồi', status: "Đã điều độ", quantity: 100 },
                //     { id: uddid(), active: true, date: new Date(), title: 'Bế', status: "Đã điều độ", quantity: 150 },
                //     { id: uddid(), active: true, date: new Date(), title: 'Dán TP', status: "Đã điều độ", quantity: 200 },
                //     { id: uddid(), active: false, date: new Date(), title: 'Đóng gói', status: "Đã điều độ", quantity: 0 },
                // ],
                note: "",
            };
        });
        return newData;
    };

    const params = {
        branch_id: isState.valueBr?.value || "",
        _po_id: isState.valueProductionOrders?.value || "",
        search: isState.search == "" ? "" : isState.search,
        _pod_id: isState.valueProductionOrdersDetail?.value || "",
        orders_id: [isState.valueOrders?.value]?.length > 0 ? [isState.valueOrders?.value].map((e) => e) : "",
        date_end: isState.date.dateEnd ? formatMoment(isState.date.dateEnd, FORMAT_MOMENT.DATE_SLASH_LONG) : "",
        internal_plans_id: [isState.valuePlan?.value]?.length > 0 ? [isState.valuePlan?.value].map((e) => e) : "",
        date_start: isState.date.dateStart ? formatMoment(isState.date.dateStart, FORMAT_MOMENT.DATE_SLASH_LONG) : "",
        item_variation_id: isState.valueProducts?.length > 0 ? isState.valueProducts.map((e) => e?.e?.item_variation_id) : null,
    };

    useEffect(() => {
        sIsParentId(null)
    }, [isState.search])

    const fetchState = async (type) => {
        try {
            const { data } = await apiProductionsOrders.apiProductionOrders(isState.page, isState.limit, { params: params });
            const arrayItem = convertArrData(data?.productionOrders);
            queryState({
                countAll: data?.countAll,
                productionOrdersList: arrayItem.map((e, index) => {
                    return {
                        ...e,
                        // showParent: isState?.search ? index == 0 : e?.id == isState.idDetailProductionOrder ? true : !isState.idDetailProductionOrder ? index == 0 : false,
                    };
                }),
                next: data?.next == 1,
            });

            if (type == 'delete') {
                queryState({ idDetailProductionOrder: arrayItem[0]?.id ?? null });
                await fetchisStateRight()
            }
            // if (isState.search == "" && arrayItem[0]?.id) {
            //     queryState({ idDetailProductionOrder: arrayItem[0]?.id });
            // }
            if (isState.search == "") {
                queryState({ idDetailProductionOrder: type == 'delete' ? arrayItem[0]?.id : isState.idDetailProductionOrder ? isState.idDetailProductionOrder : arrayItem[0]?.id });
            } else {
                queryState({ idDetailProductionOrder: arrayItem[0]?.id });
            }
            if (data?.productionOrders?.length == 0) {
                queryState({
                    listDataRight: {
                        ...isState.listDataRight,
                        title: null,
                        statusManufacture: null,
                        dataPPItems: [],
                        dataSemiItems: [],
                    },
                });
            }
            return data;
        } catch (error) {
            throw new Error(error);
        }
    };


    // const { isLoading, isFetching, isRefetching, refetch: refetchProductionsOrders } = useInfiniteQuery({
    //     //     queryKey: ["api_production_orders",
    //     //         isState.page,
    //     //         isState.search,
    //     //         isState.date.dateStart,
    //     //         isState.date.dateEnd,
    //     //         isState.valueProductionOrders,
    //     //         isState.valueProductionOrdersDetail,
    //     //         isState.valueBr,
    //     //         isState.valueOrders,
    //     //         isState.valuePlan,
    //     //         isState.valueProducts],
    //     queryFn: async ({ pageParam = 1 }) => {
    //         const { data } = await apiDashboard.apiGetDashboardMaterialsToPurchase({
    //             params: {
    //                 page: pageParam,
    //                 limit: 10,
    //             }
    //         }
    //         );

    //         return data;
    //     },
    //     getNextPageParam: (lastPage, pages) => {
    //         return lastPage?.next == 1 ? pages?.length + 1 : null;
    //     },
    //     retry: 5,
    //     retryDelay: 5000,
    //     initialPageParam: 1,
    //     ...optionsQuery,
    // });
    const { isLoading, isFetching, isRefetching, refetch: refetchProductionsOrders } = useQuery({
        queryKey: ["api_production_orders",
            isState.page,
            isState.search,
            isState.date.dateStart,
            isState.date.dateEnd,
            isState.valueProductionOrders,
            isState.valueProductionOrdersDetail,
            isState.valueBr,
            isState.valueOrders,
            isState.valuePlan,
            isState.valueProducts],
        queryFn: () => fetchState(),
        // enabled: isState.openModal == false,
        ...optionsQuery
    })


    const fetchisStateSeeMore = async () => {

        try {
            const { data } = await apiProductionsOrders.apiProductionOrders(isState.page, isState.limit, { params: params });
            const item = convertArrData(data?.productionOrders);
            let arrayItem = [...isState.productionOrdersList, ...item];
            queryState({
                countAll: data?.countAll,
                productionOrdersList: arrayItem.map((e, index) => {
                    return {
                        ...e,
                        // showParent: isState?.search ? index == 0 : e?.id == isState.idDetailProductionOrder ? true : !isState.idDetailProductionOrder ? index == 0 : false,
                    };
                }),
                next: data?.next == 1,

            });
            if (isState.search == "") {
                queryState({ idDetailProductionOrder: isState.idDetailProductionOrder ? isState.idDetailProductionOrder : arrayItem[0]?.id });
            } else {
                queryState({ idDetailProductionOrder: arrayItem[0]?.id });
            }
            if (data?.productionOrders?.length == 0) {
                queryState({
                    listDataRight: {
                        ...isState.listDataRight,
                        title: null,
                        statusManufacture: null,
                        dataPPItems: [],
                        dataSemiItems: [],
                    },
                });
            }
            return data
        } catch (error) {
            throw error
        }
    };

    useEffect(() => {
        if (isState.page != 1) {
            fetchisStateSeeMore();
        }
    }, [isState.page]);

    const { isLoading: isLoadingRight, refetch, isRefetching: isRefetchingRight } = useQuery({
        queryKey: ['api_detail_production_orders', isState.idDetailProductionOrder],
        queryFn: () => fetchisStateRight(),
        enabled: !!isState.idDetailProductionOrder,
        placeholderData: keepPreviousData,
        ...optionsQuery
    })

    const fetchisStateRight = async () => {
        try {
            const { data, isSuccess } = await apiProductionsOrders.apiDetailProductionOrders(isState.idDetailProductionOrder);
            if (!isSuccess == 1) {
                return;
            }
            queryState({
                listDataRight: {
                    title: data?.productionOrder?.reference_no,
                    idCommand: data?.productionOrder?.id,
                    statusManufacture: data?.productionOrder?.status_manufacture,
                    dataPPItems: data?.listPOItems?.map((e) => {
                        return {
                            ...e,
                            id: e?.object_id,
                            title: e?.reference_no,
                            showChild: true,
                            arrListData: e?.items_products?.map((i) => {
                                return {
                                    ...i,
                                    id: i?.poi_id,
                                    image: i?.images ? i?.images : "/icon/noimagelogo.png",
                                    name: i?.item_name,
                                    itemVariation: i?.product_variation,
                                    code: i?.item_code,
                                    quantity: +i?.quantity,
                                    unit: i?.unit_name,
                                    processBar: i?.list_stages?.map((j) => {
                                        return {
                                            ...j,
                                            id: uddid(),
                                            active: j?.active == "1",
                                            date: j?.date_active,
                                            title: j?.name_stage,

                                        };
                                    }),
                                    childProducts: i?.semi_products?.map(e => {
                                        return {
                                            ...e,
                                            image: e?.images ? e?.images : "/icon/noimagelogo.png",
                                        }
                                    })
                                };
                            }),
                        };
                    }),
                    dataSemiItems: data?.listSemiItems?.map((e) => {
                        return {
                            ...e,
                            id: e?.object_id,
                            title: e?.reference_no,
                            showChild: true,
                            arrListData: e?.semi_products?.map((i) => {
                                return {
                                    ...i,
                                    id: uddid(),
                                    image: i?.images ? i?.images : "/icon/noimagelogo.png",
                                    name: i?.item_name,
                                    itemVariation: i?.product_variation,
                                    code: i?.item_code,
                                    quantity: +i?.quantity,
                                    unit: i?.unit_name,
                                    processBar: i?.list_stages?.map((j) => {
                                        return {
                                            ...j,
                                            id: uddid(),
                                            active: j?.active == "1",
                                            date: j?.date_active,
                                            title: j?.name_stage,
                                        };
                                    }),
                                    childProducts: {
                                        ...i?.products_parent,
                                        image: i?.products_parent?.images ? i?.products_parent?.images : "/icon/noimagelogo.png",
                                    },
                                };
                            }),
                        };
                    }),
                },
            });
            return data
        } catch (error) {
            throw new Error(error);
        }
    };

    const fetchComboboxProductionOrders = debounce(async (value) => {
        try {
            queryState({ searchProductionOrders: value });
        } catch (error) { }
    }, 500);

    const fetchDataItems = debounce(async (value) => {
        try {
            queryState({ searchItemsVariant: value });
        } catch (error) { }
    }, 500);

    const fetDataOrder = debounce(async (value) => {
        try {
            queryState({ searchOrders: value });
        } catch (error) { }
    }, 500);

    const fetDataPoDetail = debounce(async (value) => {
        try {
            queryState({ searchPODetail: value });
        } catch (error) { }
    }, 500);

    const fetchDataPlan = debounce(async (value) => {
        try {
            queryState({ searchPlan: value });
        } catch (error) { }
    }, 500);

    const handleShow = (id) => {
        queryState({ idDetailProductionOrder: id })
        queryState({
            productionOrdersList: isState.productionOrdersList.map((e) => {
                const showParent = e.id == id;
                // showParent && queryState({ idDetailProductionOrder: id })
                return {
                    ...e,
                    showParent: showParent,
                };
            }),
            openModal: false,
            dataModal: {},
        });
        router.push("/manufacture/productions-orders?tabModal=1")
    };

    const handleActiveTab = (e, type) => {
        if (type === "detail") {
            queryState({ isTab: e });

        } else if (type === "list") {
            queryState({ isTabList: e });
        }
    };

    const handleConfim = async () => {
        try {
            const res = await apiProductionsOrders.apiDeleteProductionOrders(isId)
            if (res?.isSuccess == 1) {
                fetchState('delete')
                isShow("success", `${dataLang[res?.message] || res?.message}`);
            } else {
                isShow("error", `${dataLang[res?.message] || res?.message}`);
            }
            handleQueryId({ status: false });
        } catch (error) {

        }
    };

    const handShowItem = (id, type) => {
        queryState({
            listDataRight: {
                ...isState.listDataRight,
                [type]: isState.listDataRight?.[type]?.map((e) => {
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
        router.push("/manufacture/productions-orders?tabModal=1")
    };

    const onChangeSearch = debounce((e) => {
        queryState({ search: e.target.value, page: 1, openModal: false });
    }, 500);

    const handDeleteItem = (id, type) => {
        queryState({ page: 1 });
        handleQueryId({ status: true, id: id, idChild: type });
    };

    const handleShowModel = (item) => {
        queryState({ openModal: true, dataModal: item });
    };

    const shareProps = {
        dataLang,
        handShowItem,
        handDeleteItem,
        handleShowModel,
        handleFilter,
        fetchComboboxProductionOrders,
        fetDataOrder,
        fetchDataPlan,
        fetchDataItems,
        fetDataPoDetail,
        listBr,
        listOrders,
        listPlan,
        listProducts,
        comboboxProductionOrders,
        comboboxProductionOrdersDetail,
        isLoadingRight,
        refetchProductionsOrders,
        typePageMoblie
    };

    const SearchProduction = memo(() => {
        return (
            <div className="border-b py-2 px-1 flex items-center justify-center bg-[#D0D5DD]/20 ">
                <form className="relative flex items-center w-full">
                    <SearchNormal1
                        size={20}
                        className="absolute 2xl:left-3 z-10 text-[#cccccc] xl:left-[4%] left-[1%]"
                    />
                    <input
                        onChange={(e) => onChangeSearch(e)}
                        className={`relative border border-[#D0D5DD] bg-white outline-[#D0D5DD] focus:outline-[#0F4F9E] ${typePageMoblie ? "pl-7" : "pl-10"} p-0 2xl:py-1.5 py-2.5 rounded-md 2xl:text-base text-xs text-start 2xl:w-full xl:w-full w-[100%]`}
                        type="text"
                        // value={isState.search}
                        placeholder={dataLang?.productions_orders_find || "productions_orders_find"}
                    />
                </form>
            </div>
        )
    })

    // trigger của bộ lọc
    const triggerFilter = (
        <button className={`${stateFilterDropdown?.open ? "text-[#0F4F9E] border-[#3276FA] bg-[#EBF5FF]" : "bg-white text-[#9295A4] hover:text-[#0F4F9E] hover:bg-[#EBF5FF] hover:border-[#3276FA]"} flex items-center space-x-2 border rounded-lg xl:h-10 h-9 px-3 group custom-transition`}>
            <span className="w-5 h-5 shrink-0">
                <FunnelIcon className='w-full h-full ' />
            </span>
            <span className={`${stateFilterDropdown?.open ? "text-[#0F4F9E]" : "text-[#3A3E4C] group-hover:text-[#0F4F9E]"} text-nowrap 3xl:text-base text-sm custom-transition`}>
                {dataLang?.productions_orders_filter || "productions_orders_filter"}
            </span>
            {/* <span className="rounded-full bg-[#0F4F9E] text-white text-xs w-5 h-5 flex items-center justify-center">
                6
            </span> */}
            <span className="w-4 h-4 shrink-0">
                <CaretDownIcon className={`${stateFilterDropdown?.open ? "rotate-180" : "rotate-0"} w-full h-full custom-transition`} />
            </span>
        </button>
    );

    const toggleSearch = () => {
        setIsOpenSearch(!isOpenSearch);
    };

    if (!isMouted) {
        return null;
    }

    return (
        <React.Fragment>
            <div className="flex justify-between items-center w-full">
                <h2 className="3xl:text-2xl xl:text-xl text-base text-[#52575E] capitalize font-medium">
                    {dataLang?.productions_orders || 'productions_orders'}
                </h2>

                <div className="flex items-center gap-2 xl:max-w-[70%]">
                    <div className="relative flex items-center justify-end">
                        {/* Animated Search Input */}
                        <AnimatePresence>
                            {isOpenSearch && (
                                <motion.div
                                    initial={{ width: 0, opacity: 0 }}
                                    animate={{ width: "100%", opacity: 1 }}
                                    exit={{ width: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="overflow-hidden"
                                >
                                    <form className="relative flex items-center w-full">
                                        <input
                                            onChange={(e) => onChangeSearch(e)}
                                            className={`
                                               ${isOpenSearch ? "rounded-l-lg border-r-0 border-[#D0D5DD] focus:border-[#3276FA]" : "rounded-lg border-[#D0D5DD]"}
                                                relative border  bg-white pl-2 xl:h-10 h-9 text-base-default 3xl:w-[300px] w-[280px] focus:outline-none placeholder:text-[#3A3E4C] 3xl:placeholder:text-base placeholder:text-sm placeholder:font-normal`}
                                            type="text"
                                            // value={isState.search}
                                            placeholder={dataLang?.productions_orders_find || "productions_orders_find"}
                                        />
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.div layout transition={{ duration: 0.3, ease: "easeInOut" }}>
                            <ButtonAnimationNew
                                icon={
                                    <div className='size-6 '>
                                        <MagnifyingGlassIcon className='size-full' />
                                    </div>
                                }
                                hideTitle={true}
                                className={`${isOpenSearch ? "rounded-r-lg bg-[#1760B9] text-white border-[#3276FA]" : "rounded-lg text-[#9295A4] border-[#D0D5DD]"} flex items-center justify-center w-12 xl:h-10 h-9 shrink-0 border`}
                                onClick={toggleSearch}
                            />
                        </motion.div>
                    </div>

                    <div className="relative">
                        <DatePicker
                            id="start"
                            portalId="menu-time"
                            calendarClassName="rasta-stripes"
                            clearButtonClassName=""
                            selected={isState.date.dateStart}
                            startDate={isState.date.dateStart}
                            endDate={isState.date.dateEnd}
                            selectsRange
                            onChange={(date) => {
                                const [start, end] = date;
                                queryState({
                                    date: {
                                        dateStart: start,
                                        dateEnd: end,
                                    },
                                });
                            }}
                            isClearable
                            placeholderText={`${dataLang?.productions_orders_day_to_day}...` || 'productions_orders_day_to_day...'}
                            className="p-2 xl:h-10 h-9 text-base-default w-[250px] outline-none focus:outline-none border-[#D0D5DD] focus:border-[#3276FA] focus:bg-[#EBF5FF] placeholder:text-[#3A3E4C] border rounded-md"
                        />
                        {
                            !isState.date.dateStart &&
                            <span className="absolute top-1/2 -translate-y-1/2 right-2 w-4 h-4 shrink-0 text-[#9295A4]">
                                <CaretDownIcon className={`w-full h-full custom-transition`} />
                            </span>
                        }
                    </div>

                    <FilterDropdown
                        trigger={triggerFilter}
                        style={{
                            boxShadow: "0px 20px 24px -4px #10182814, 0px 4px 4px 0px #00000040"
                        }}
                        className="flex flex-col gap-4 border-[#D8DAE5] rounded-lg 3xl:!min-w-[1820px] 2xl:min-w-[1500px] xxl:min-w-[1400px] xl:min-w-[1250px] lg:min-w-[1000px]"
                        dropdownId="dropdownFilterMain"
                    >
                        <div className="3xl:text-xl text-lg text-[#344054] font-medium ">
                            {dataLang?.productions_orders_filter || "productions_orders_filter"}
                        </div>

                        <div className='grid 3xl:grid-cols-7 grid-cols-4 w-full gap-3'>
                            <div className="col-span-1 space-y-1">
                                <h3 className="text-xs text-[#051B44] font-normal">{dataLang?.productions_orders_details_branch || 'productions_orders_details_branch'}</h3>
                                <SelectComponentNew
                                    isClearable={true}
                                    value={isState.valueBr}
                                    onChange={(e) => handleFilter("valueBr", e)}
                                    options={listBr}
                                    classParent="ml-0 !font-semibold focus:ring-none focus:outline-none focus-visible:ring-none focus-visible:outline-none placeholder:text-sm placeholder:text-[#52575E]"
                                    classNamePrefix={"productionSmoothing"}
                                    placeholder={dataLang?.productions_orders_details_all || 'productions_orders_details_all'}
                                />
                            </div>

                            <div className="col-span-1 space-y-1">
                                <h3 className="text-xs text-[#051B44] font-normal">
                                    {dataLang?.productions_orders_sales_order || 'productions_orders_sales_order'}/{dataLang?.productions_orders_internal_plan || 'productions_orders_internal_plan'}
                                </h3>

                                <RadioDropdown />
                            </div>

                            <div className="col-span-1 space-y-1">
                                <h3 className="text-xs text-[#051B44] font-normal">{dataLang?.productions_orders_sales_order || 'productions_orders_sales_order'}</h3>
                                <SelectComponentNew
                                    isClearable={true}
                                    value={isState.valueOrders}
                                    options={listOrders}
                                    onInputChange={(e) => {
                                        fetDataOrder(e);
                                    }}
                                    classParent="ml-0"
                                    onChange={(e) => handleFilter("valueOrders", e)}
                                    classNamePrefix={"productionSmoothing"}
                                    placeholder={dataLang?.productions_orders_sales_order || 'productions_orders_sales_order'}
                                    isDisabled={isState?.seletedRadioFilter?.id !== 1}
                                />
                            </div>

                            <div className="col-span-1 space-y-1">
                                <h3 className="text-xs text-[#051B44] font-normal">{dataLang?.productions_orders_internal_plan || 'productions_orders_internal_plan'}</h3>
                                <SelectComponentNew
                                    isClearable={true}
                                    value={isState.valuePlan}
                                    options={listPlan}
                                    onInputChange={(e) => {
                                        fetchDataPlan(e);
                                    }}
                                    classParent="ml-0"
                                    onChange={(e) => handleFilter("valuePlan", e)}
                                    classNamePrefix={"productionSmoothing"}
                                    placeholder={dataLang?.productions_orders_internal_plan || 'productions_orders_internal_plan'}
                                    isDisabled={isState?.seletedRadioFilter?.id !== 2}
                                />
                            </div>

                            <div className="col-span-1 space-y-1">
                                <h3 className="text-xs text-[#051B44] font-normal">{dataLang?.productions_orders_details_number || 'productions_orders_details_number'}</h3>
                                <SelectComponentNew
                                    isClearable={true}
                                    value={isState.valueProductionOrders}
                                    onInputChange={(e) => {
                                        fetchComboboxProductionOrders(e);
                                    }}
                                    onChange={(e) => handleFilter("valueProductionOrders", e)}
                                    options={comboboxProductionOrders}
                                    classParent="ml-0"
                                    classNamePrefix={"productionSmoothing"}
                                    placeholder={dataLang?.productions_orders_details_number || 'productions_orders_details_number'}
                                />
                            </div>

                            <div className="col-span-1 space-y-1">
                                <h3 className="text-xs text-[#051B44] font-normal">{dataLang?.productions_orders_details_lxs_number || 'productions_orders_details_lxs_number'}</h3>
                                <SelectComponentNew
                                    isClearable={true}
                                    value={isState.valueProductionOrdersDetail}
                                    onInputChange={(e) => {
                                        fetDataPoDetail(e);
                                    }}
                                    onChange={(e) => handleFilter("valueProductionOrdersDetail", e)}
                                    options={comboboxProductionOrdersDetail}
                                    classParent="ml-0"
                                    classNamePrefix={"productionSmoothing"}
                                    placeholder={dataLang?.productions_orders_details_lxs_number || 'productions_orders_details_lxs_number'}
                                />
                            </div>

                            <div className="3xl:col-span-1 col-span-2 space-y-1">
                                <h3 className="text-xs text-[#051B44] font-normal">{dataLang?.productions_orders_item || 'productions_orders_item'}</h3>
                                <SelectComponentNew
                                    isClearable={true}
                                    value={isState.valueProducts}
                                    options={[{ label: "Mặt hàng", value: "", isDisabled: true }, ...listProducts]}
                                    onChange={(e) => handleFilter("valueProducts", e)}
                                    classParent="ml-0"
                                    classNamePrefix={"productionSmoothing"}
                                    placeholder={dataLang?.productions_orders_item || 'productions_orders_item'}
                                    onInputChange={(e) => {
                                        fetchDataItems(e);
                                    }}
                                    isMulti={true}
                                    components={{ MultiValue }}
                                    maxShowMuti={1}
                                    formatOptionLabel={(option) => {

                                        return (
                                            <div className="">
                                                {
                                                    option?.isDisabled ?
                                                        (
                                                            <div className="custom-text">
                                                                <h3 className="text-base font-medium bg-transparent">{option.label}</h3>
                                                            </div>
                                                        )
                                                        :
                                                        (
                                                            <div className="flex items-center gap-2">
                                                                <div className="custom-none max-w-[30px] w-[30px] h-[30px] max-h-[30px]">
                                                                    {
                                                                        option.e?.images != null ?
                                                                            (
                                                                                <img
                                                                                    src={option.e?.images}
                                                                                    alt="Product Image"
                                                                                    className="max-max-w-[30px] w-[30px] h-[30px] max-h-[30px] text-[8px] object-cover rounded"
                                                                                />
                                                                            )
                                                                            :
                                                                            (
                                                                                <div className=" max-w-[30px] w-[30px] h-[30px] max-h-[30px] object-cover  flex items-center justify-center rounded">
                                                                                    <img
                                                                                        src="/icon/noimagelogo.png"
                                                                                        alt="Product Image"
                                                                                        className="max-w-[30px] w-[30px] h-[30px] max-h-[30px] object-cover rounded"
                                                                                    />
                                                                                </div>
                                                                            )
                                                                    }
                                                                </div>
                                                                <div className="custom-text w-full">
                                                                    <h3 className="font-medium 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px]">
                                                                        {option.e?.item_name}
                                                                    </h3>
                                                                    <h5 className="font-medium 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] ">
                                                                        {option.e?.product_variation}
                                                                    </h5>
                                                                </div>
                                                            </div>
                                                        )
                                                }
                                            </div>
                                        );
                                    }}
                                    menuPlacement="auto"
                                    menuPosition="fixed"
                                    styles={{
                                        multiValueLabel: (provided) => ({
                                            ...provided,
                                            "& .custom-none": {
                                                display: "none",
                                            },
                                            "& .custom-text": {
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "5px",
                                                maxWidth: "50px",
                                            },
                                            "& .custom-text h5": {
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                            },
                                        }),

                                        menu: (provided) => ({
                                            ...provided,
                                            width: "125%",
                                            left: "auto",
                                            right: 0, // luôn mở rộng về phía trái từ góc phải của select
                                        }),
                                    }}
                                />
                            </div>
                        </div>
                    </FilterDropdown>


                </div>
            </div>


            <div className='flex items-center 3xl:gap-6 gap-4 w-full'>
                <div className='w-full max-w-[15%] bg-red-500 shrink-0'>
                    Filter
                </div>

                <ContainerFilterTab className="border-b w-full max-w-full relative">
                    {
                        listLsxTab && listLsxTab.map((e, index) => (
                            <button
                                key={e.id}
                                ref={el => tabListRefs.current[index] = el}
                                onClick={() => handleActiveTab(e.id, "list")}
                                className="group relative px-4 py-2 text-sm font-medium outline-none focus:outline-none min-w-fit"
                                style={{
                                    WebkitTapHighlightColor: "transparent",
                                }}
                            >
                                {/* <h3 className={`relative py-[10px] text-sm px-2  font-normal ${isState?.isTabList == e.id ? "text-[#0375F3]" : "text-[#667085]"}  group-hover:text-[#0375F3] transition-all duration-200 ease-linear`} >
                                    {e.name}
                                    <span className={`${e?.count > 0 && `absolute top-0 right-0 3xl:translate-x-[65%] translate-x-1/2 h-[16px] w-[16px] text-[11px] bg-[#ff6f00] text-white rounded-full text-center items-center flex justify-center`} `}>
                                        {e?.count > 0 && e?.count}
                                    </span>
                                </h3> */}

                                <h3 className={`transition-all duration-200 ease-linear ${isState.isTabList === e.id ? "text-[#0375F3]" : "text-[#667085]"} group-hover:text-[#0375F3]`}>
                                    {e.name}
                                    {e.count > 0 && (
                                        <span className="absolute top-0 right-0 translate-x-1/2 h-[16px] w-[16px] text-[11px] bg-[#ff6f00] text-white rounded-full flex items-center justify-center">
                                            {e.count}
                                        </span>
                                    )}
                                </h3>
                            </button>
                        ))
                    }

                    {/* underline */}
                    <motion.div
                        layout
                        ref={underlineRef}
                        className="absolute bottom-0 h-[2px] w-full bg-[#0375F3]"
                        animate={{ left: underlineProps.left, width: underlineProps.width }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                </ContainerFilterTab>
            </div>

            {/* {!typePageMoblie && <FilterHeader {...shareProps} />} */}

            <div className="!mt-[14px]">
                <h1 className="text-[#141522] font-medium text-[13px] my-2">
                    {dataLang?.productions_orders_total || "productions_orders_total"}: {isState?.countAll}
                </h1>
                {
                    typePageMoblie && (
                        <div className="border-b py-2 px-1 flex items-center justify-center bg-[#D0D5DD]/20 ">
                            <form className="relative flex items-center w-full">
                                <SearchNormal1
                                    size={20}
                                    className="absolute 2xl:left-3 z-10 text-[#cccccc] xl:left-[4%] left-[1%]"
                                />
                                <input
                                    onChange={(e) => onChangeSearch(e)}
                                    className={`relative border border-[#D0D5DD] bg-white outline-[#D0D5DD] focus:outline-[#0F4F9E] ${typePageMoblie ? "pl-7" : "pl-10"} p-0 2xl:py-1.5 py-2.5 rounded-md 2xl:text-base text-xs text-start 2xl:w-full xl:w-full w-[100%]`}
                                    type="text"
                                    // value={isState.search}
                                    placeholder={dataLang?.productions_orders_find || "productions_orders_find"}
                                />
                            </form>
                        </div>
                    )
                }

                <div className="flex ">
                    <div className="w-[22%] border-r-0 border-[#D0D5DD] border">
                        {/* {
                            !typePageMoblie && (
                                <div className="border-b py-2 px-1 flex items-center justify-center bg-[#D0D5DD]/20 ">
                                    <form className="relative flex items-center w-full">
                                        <SearchNormal1
                                            size={20}
                                            className="absolute 2xl:left-3 z-10 text-[#cccccc] xl:left-[4%] left-[1%]"
                                        />
                                        <input
                                            onChange={(e) => onChangeSearch(e)}
                                            className={`relative border border-[#D0D5DD] bg-white outline-[#D0D5DD] focus:outline-[#0F4F9E] ${typePageMoblie ? "pl-7" : "pl-10"} p-0 2xl:py-1.5 py-2.5 rounded-md 2xl:text-base text-xs text-start 2xl:w-full xl:w-full w-[100%]`}
                                            type="text"
                                            // value={isState.search}
                                            placeholder={dataLang?.productions_orders_find || "productions_orders_find"}
                                        />
                                    </form>
                                </div>
                            )
                        } */}
                        <Customscrollbar className={`${typePageMoblie ? "h-[85vh]" : "3xl:h-[65vh] xxl:h-[57vh] 2xl:h-[58.5vh] xl:h-[57.6vh] lg:h-[57vh] h-[35vh]"}  overflow-y-auto`}>
                            {
                                (isLoading || isRefetching)
                                    ?
                                    (
                                        <Loading />
                                    )
                                    :
                                    (
                                        isState.productionOrdersList?.length > 0 ?
                                            (
                                                isState.productionOrdersList.map((e, eIndex) => {
                                                    const color = {
                                                        "0": {
                                                            class: 'text-[#FF8F0D] bg-[#FEF8EC]',
                                                            circle: "bg-[#FF8F0D]",
                                                            title: dataLang?.productions_orders_produced ?? "productions_orders_produced"
                                                        },
                                                        "1": {
                                                            class: 'text-blue-500 bg-blue-100',
                                                            circle: "bg-blue-500",
                                                            title: dataLang?.productions_orders_in_progress ?? "productions_orders_in_progress"
                                                        },
                                                        "2": {
                                                            class: 'text-green-500 bg-green-50 ',
                                                            circle: "bg-green-500",
                                                            title: dataLang?.productions_orders_completed ?? "productions_orders_completed"
                                                        }
                                                    }

                                                    return (
                                                        <div
                                                            key={e.id}
                                                            onClick={() => handleShow(e.id)}
                                                            className={`py-2 ${typePageMoblie ? "px-px" : "pl-2 pr-3"}  ${e.id == isState.idDetailProductionOrder && "bg-[#F0F7FF]"} hover:bg-[#F0F7FF] cursor-pointer transition-all ease-linear ${isState.length - 1 == eIndex ? "border-b-none" : "border-b"} `}
                                                        >
                                                            {
                                                                typePageMoblie
                                                                    ?
                                                                    <div className={`flex flex-col items-center gap-1`}>
                                                                        {isState.listDataRight?.title && (
                                                                            // status_manufacture
                                                                            <span className={`${color[e?.status_manufacture]?.class} text-[8px] px-1 py-px rounded-3xl font-medium w-fit h-fit flex items-center gap-1`}>
                                                                                <span className={`${color[e?.status_manufacture]?.circle} h-1 w-1 rounded-full inline-block`} />
                                                                                <p>{color[e?.status_manufacture]?.title}</p>
                                                                            </span>
                                                                        )}
                                                                        <h1 className="text-[8px] font-medium text-[#0F4F9E]">
                                                                            {e.title}
                                                                        </h1>

                                                                    </div>
                                                                    :
                                                                    <div className={`flex justify-between`}>
                                                                        <div className="flex flex-col gap-1">
                                                                            <h1 className="text-[13px] font-medium text-[#0F4F9E]">
                                                                                {e.title}
                                                                            </h1>
                                                                            <h3 className="text-[#667085] font-medium text-[13px]">
                                                                                {dataLang?.materials_planning_create_on ||
                                                                                    "materials_planning_create_on"}{" "}
                                                                                <span className="text-[#141522] font-medium text-[13px]">
                                                                                    {e.time}
                                                                                </span>
                                                                            </h3>
                                                                        </div>

                                                                        {isState.listDataRight?.title && (
                                                                            // status_manufacture
                                                                            <span className={`${color[e?.status_manufacture]?.class} text-xs pl-2 pr-4 py-1.5 rounded-3xl font-medium w-fit h-fit`}>
                                                                                <span className={`${color[e?.status_manufacture]?.circle} h-2 w-2 rounded-full inline-block mr-2`} />
                                                                                {color[e?.status_manufacture]?.title}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                            }
                                                            {!typePageMoblie && (e.id == isState.idDetailProductionOrder) && (
                                                                <div className="flex flex-col w-full gap-2 mt-1">
                                                                    <div className="flex items-center gap-1">
                                                                        <h3 className=" text-[#52575E] font-medium text-[13px]">
                                                                            {dataLang?.materials_planning_foloww_up || "materials_planning_foloww_up"} :
                                                                        </h3>
                                                                        <div className="flex items-center gap-1">
                                                                            {e.followUp.map((i, index) => (
                                                                                <div key={index}>
                                                                                    <h2 className="text-[#191D23] font-medium text-[13px]">
                                                                                        {i.nameFollow}
                                                                                    </h2>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <TagBranch className="w-fit h-fit">{e?.nameBranch}</TagBranch>
                                                                    {/* <div className="flex items-center w-full">
                                                {e.processBar.map((j, JIndex) => {
                                                    return (
                                                        <div key={j.id} className="flex flex-col items-start w-full">
                                                            <p className={`${j.active ? "text-[#0BAA2E]" : "text-gray-500"} font-normal 3xl:text-[10px] text-[9px] flex flex-col`}>
                                                                <span>{j.status}</span>
                                                                <span>({moment(j.date).format('DD/MM/YYYY')})</span>
                                                            </p>

                                                            <li className={`${JIndex == e.processBar.length - 1 ? 'flex w-full relative text-gray-900 '
                                                                :
                                                                `flex w-full relative text-gray-900  after:content-[''] after:w-full after:h-0.5 ${j.active ? 'after:bg-[#00C170]' : 'after:bg-gray-500'}   after:inline-block after:absolute after:top-1 after:left-[25px]`}`}
                                                            >
                                                                <div className="z-10 block whitespace-nowrap">
                                                                    <span className={`w-[10px] h-[10px]  border-2  ${j.active ? 'bg-[#00C170] border-[#00C170]' : 'bg-gray-500 border-gray-500'} rounded-full flex justify-center items-center mx-auto mb-1 text-[13px]`}></span>
                                                                    <p className={`${j.active ? "text-[#0BAA2E]" : "text-gray-500"} font-normal 3xl:text-[11px] text-[10px]`}>
                                                                        {j.title}
                                                                    </p>

                                                                    <p className={` ${j.quantity > 0 ? "opacity-100" : "opacity-0"} text-[#0BAA2E] font-normal text-[10px]`}>
                                                                        SL:
                                                                        <span className="text-[#0BAA2E] font-semibold text-[11px] px-1">
                                                                            {j.quantity > 0 ? formatNumber(j.quantity) : "-"}
                                                                        </span>
                                                                    </p>
                                                                </div>
                                                            </li >
                                                        </div>
                                                    )
                                                })}
                                            </div> */}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )
                                                })
                                            )
                                            :
                                            (
                                                <NoData />
                                            )
                                    )
                            }

                            {
                                isState.next && (
                                    <button
                                        type="button"
                                        onClick={() => queryState({ page: isState.page + 1 })}
                                        className={`block w-full py-1 mx-auto mt-1 ${typePageMoblie ? "text-[10px]" : "text-[13px]"} transition-all duration-200 ease-linear bg-blue-50 hover:bg-blue-200`}
                                    >
                                        {dataLang?.materials_planning_see_more || "materials_planning_see_more"}
                                    </button>
                                )
                            }
                        </Customscrollbar>
                    </div>
                    <div className="w-[78%] border border-[#D0D5DD] ">
                        {
                            (!isLoading) && (isState.listDataRight?.dataPPItems?.length > 0 || isState.listDataRight?.dataSemiItems?.length > 0) && (
                                <div className="flex items-center justify-between px-4 py-1 border-b">
                                    <div className="">
                                        <h1 className={`text-[#52575E] font-normal ${typePageMoblie ? "text-[10px]" : "text-xs"} capitalize`}>
                                            {dataLang?.productions_orders || "productions_orders"}
                                        </h1>
                                        <div className="flex items-center gap-2">
                                            {
                                                isRefetchingRight
                                                    ?
                                                    <div className={`animate-pulse ${typePageMoblie ? "w-[80px]" : "w-[200px]"} h-[20px] bg-gray-100 rounded-2xl`} />
                                                    :
                                                    <h1 className={`text-[#3276FA] font-medium ${typePageMoblie ? "text-xs" : "3xl:text-[20px] text-[16px]"} uppercase`}>
                                                        {isState.listDataRight?.title ?? (dataLang?.productions_orders_no_orders || "productions_orders_no_orders")}
                                                    </h1>
                                            }
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!typePageMoblie && (
                                            <OnResetData sOnFetching={(e) => { }}
                                                onClick={() => {
                                                    refetchProductionsOrders();
                                                    refetch()
                                                }} />
                                        )}
                                        <Zoom
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 1.08 }}
                                            className="w-fit"
                                        >
                                            <PopupConfimStage
                                                dataLang={dataLang}
                                                dataRight={isState}
                                                typePageMoblie={typePageMoblie}
                                                refetch={() => {
                                                    refetchProductionsOrders();
                                                    refetch()
                                                }}
                                            />
                                        </Zoom>

                                        {/* <Zoom
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 1.08 }}
                                        className="w-fit"
                                    >
                                        <PopupRecallRawMaterials
                                            dataLang={dataLang}
                                            dataRight={isState}
                                            refetch={() => {
                                                refetchProductionsOrders();
                                                refetch()
                                            }}
                                        />
                                    </Zoom> */}
                                        {
                                            !typePageMoblie && (
                                                <Zoom
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 1.08 }}
                                                    className="w-fit"
                                                >
                                                    <button
                                                        className="bg-red-100 rounded-lg outline-none focus:outline-none"
                                                        onClick={() => {
                                                            handleQueryId({ status: true, id: isState.idDetailProductionOrder });
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-2 px-3 py-2 ">
                                                            <RiDeleteBin5Line className="text-base text-red-600" />
                                                            <h3 className="text-xs font-medium text-red-600 3xl:text-base">
                                                                {dataLang?.materials_planning_delete || "materials_planning_delete"}
                                                            </h3>
                                                        </div>
                                                    </button>
                                                </Zoom>
                                            )
                                        }
                                    </div>
                                    {/* <button
                        className="bg-red-100 rounded-lg outline-none focus:outline-none"
                        onClick={() => {
                            if (+isState?.countAll == 0) {
                                return isShow(
                                    "error",
                                    dataLang?.materials_planning_please_add || "materials_planning_please_add"
                                );
                            }
                            if (!isState.listDataRight?.title) {
                                return isShow(
                                    "error",
                                    dataLang?.productions_orders_please_select ||
                                        "productions_orders_please_select"
                                );
                            }
                            queryState({ page: 1 });
                            handleQueryId({ status: true, id: isState.listDataRight?.idCommand });
                        }}
                    >
                        <div className="flex items-center gap-2 px-3 py-2 ">
                            <RiDeleteBin5Line className="text-base text-red-600" />
                            <h3 className="text-xs font-medium text-red-600 3xl:text-base">
                                {dataLang?.materials_planning_delete || "materials_planning_delete"}
                            </h3>
                        </div>
                    </button> */}
                                </div>
                            )
                        }
                        {(isLoading || (isRefetchingRight))
                            ?
                            <Loading />
                            :
                            (isState.listDataRight?.dataPPItems?.length > 0 || isState.listDataRight?.dataSemiItems?.length > 0)
                                ?
                                <>
                                    <div className="mx-4">
                                        <div className={`${typePageMoblie ? "my-2" : "my-6"} border-b`}>
                                            <div className="flex items-center gap-4 ">
                                                {listTab.map((e) => (
                                                    <button
                                                        key={e.id}
                                                        onClick={() => handleActiveTab(e.type, "detail")}
                                                        className={`hover:bg-[#F7FBFF] ${isState.isTab == e.type && "border-[#0F4F9E] border-b bg-[#F7FBFF]"} hover:border-[#0F4F9E] hover:border-b group transition-all duration-200 ease-linear outline-none focus:outline-none`}
                                                    >
                                                        <h3 className={`py-[10px] px-2  font-normal ${isState.isTab == e.type ? "text-[#0F4F9E]" : "text-[#667085]"} ${typePageMoblie ? "text-xs" : "3xl:text-base text-[13px]"} group-hover:text-[#0F4F9E] transition-all duration-200 ease-linear`} >
                                                            {e.name}
                                                        </h3>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            {isState.isTab == "products" && <TabItem {...shareProps} />}
                                            {isState.isTab == "semiProduct" && <TabSemi {...shareProps} />}
                                        </div>
                                    </div>
                                </>
                                :
                                <NoData />
                        }
                    </div>
                </div>

                <ModalDetail {...shareProps} />
            </div>
            <PopupConfim
                dataLang={dataLang}
                type="warning"
                title={TITLE_DELETE_PRODUCTIONS_ORDER}
                subtitle={CONFIRM_DELETION}
                isOpen={isOpen}
                save={() => {
                    handleConfim();
                }}
                cancel={() => handleQueryId({ status: false })}
            />
        </React.Fragment>
    );
};
export default MainTable;
