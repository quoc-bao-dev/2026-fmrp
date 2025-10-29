import apiProductionsOrders from "@/Api/apiManufacture/manufacture/productionsOrders/apiProductionsOrders";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import { ContainerFilterTab } from "@/components/UI/common/layout";
import TagBranch from "@/components/UI/common/Tag/TagBranch";
import { optionsQuery } from "@/configs/optionsQuery";
import useSetingServer from "@/hooks/useConfigNumber";
import formatNumberConfig from "@/utils/helpers/formatnumber";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useRouter } from "next/router";
import { memo, useContext, useEffect, useRef, useState } from "react";
import { FaUpRightAndDownLeftFromCenter } from "react-icons/fa6";
import { ProductionsOrdersContext } from "../../context/productionsOrders";
import TabExportHistory from "./tabExportHistory";
import TabExportSituation from "./tabExportSituation";
import TabInFormation from "./tabInFormation";
import TabProcessingCost from "./tabProcessingCost";
import TabRecallMaterials from "./tabRecallMaterials";
import TabWarehouseHistory from "./tabWarehouseHistory";


const initialState = {
    isTab: 1,
    dataDetail: {},
};

const ModalDetail = memo(({ refetchProductionsOrders, dataLang, typePageMoblie }) => {
    const minWidth = 850; // Đặt giá trị chiều rộng tối thiểu

    const maxWidth = window.innerWidth; // Đặt giá trị chiều rộng tối đa

    const dataSeting = useSetingServer();

    const router = useRouter();

    const tabRefs = useRef([]);

    const [width, setWidth] = useState(minWidth);
    const [isResizing, setIsResizing] = useState(false);
    const [initialX, setInitialX] = useState(null);
    const [initialWidth, setInitialWidth] = useState(null);
    const [isMounted, setIsMounted] = useState(false);
    const [isStateModal, setIsStateModal] = useState(initialState);

    const queryStateModal = (key) => setIsStateModal((x) => ({ ...x, ...key }));

    const { isStateProvider: isState, queryState } = useContext(ProductionsOrdersContext);

    const formatNumber = (num) => formatNumberConfig(+num, dataSeting);

    useEffect(() => {
        // Chờ các refs được gán đầy đủ
        const timer = setTimeout(() => {
            const total = tabRefs.current.reduce((acc, ref) => acc + (ref?.offsetWidth || 0), 0);
            setWidth(total + (20 * 6));
        }, 100);

        return () => clearTimeout(timer);
    }, [isState.openModal]);

    useEffect(() => {
        setIsMounted(true);
    }, [])

    useEffect(() => {
        const handleResize = (event) => {
            if (isResizing) {
                const newWidth = initialWidth + (initialX - event.clientX);
                // Đảm bảo rằng chiều rộng không thể nhỏ hơn giá trị tối thiểu và lớn hơn giá trị tối đa
                setWidth(Math.min(Math.max(newWidth, minWidth), maxWidth));
            }
        };
        const stopResize = () => {
            setIsResizing(false);
            document.body.classList.remove("no-select");
        };
        if (isResizing) {
            document.addEventListener("mousemove", handleResize);
            document.addEventListener("mouseup", stopResize);
        }
        return () => {
            document.removeEventListener("mousemove", handleResize);
            document.removeEventListener("mouseup", stopResize);
        };
    }, [isResizing, initialWidth, initialX, minWidth, maxWidth]);

    const startResize = (event) => {
        setIsResizing(true);
        setInitialX(event.clientX);
        setInitialWidth(width);
        document.body.classList.add("no-select");
    };

    const handleActiveTab = (e) => {
        if (router.query.tab) {
            router.push({
                pathname: router.route,
                query: { ...router.query, tabModal: e, tab: router.query.tab },
            });
        } else {
            router.push({
                pathname: router.route,
                query: { ...router.query, tabModal: e },
            });
        }

        queryStateModal({ isTab: e });
    };
    useEffect(() => {
        handleActiveTab(1)
        queryStateModal({ isTab: 1 })
    }, [isState?.openModal])

    const { data, isLoading } = useQuery({
        queryKey: ["api_item_orders_detail", isState.openModal, isState?.dataModal?.poi_id, router.query?.tabModal, router.query.tab],
        queryFn: async () => {
            const { data } = await apiProductionsOrders.apiItemOrdersDetail(isState?.dataModal?.poi_id);

            const newData = {
                dataDetail: {
                    ...data,
                    poi: {
                        ...data?.poi,
                        stages: data?.poi.stages?.map(e => {
                            return {
                                ...e,
                                active: e?.active == "1",
                                // quantity: 100,
                            }
                        })
                    }
                }
            }
            queryStateModal({ ...newData });
            return newData

        },
        enabled: !!isState.openModal && !!isState?.dataModal?.poi_id,
        placeholderData: keepPreviousData,
        ...optionsQuery,
    })

    const listTab = [
        {
            id: 1,
            name: dataLang?.productions_orders_modal_information || 'productions_orders_modal_information',
            count: 0,
        },
        {
            id: 2,
            name: dataLang?.productions_orders_modal_appeared || 'productions_orders_modal_appeared',
            count: 0,
        },
        {
            id: 3,
            name: dataLang?.productions_orders_modal_history_exporting_materials || 'productions_orders_modal_history_exporting_materials',
            count: data?.dataDetail?.count_suggest_exporting ?? 0,
        },
        {
            id: 4,
            name: dataLang?.productions_orders_modal_history_import_product || 'productions_orders_modal_history_import_product',
            count: data?.dataDetail?.count_purchase_products ?? 0,
        },
        {
            id: 5,
            name: dataLang?.productions_orders_modal_recovery_materials || 'productions_orders_modal_recovery_materials',
            count: data?.dataDetail?.count_purchase_internal ?? 0,
        },
        {
            id: 6,
            name: 'Chi phí NVL',
            // name: dataLang?.productions_orders_modal_costs_processing || 'productions_orders_modal_costs_processing',
            count: 0,
        },
    ];

    const dataTotal = [
        {
            title: dataLang?.productions_orders_details_material_costs || 'productions_orders_details_material_costs',
            number: data?.dataDetail?.cost?.cost_material ? formatNumber(data?.dataDetail?.cost?.cost_material) : 0,
            bgColor: "#EBFEF2",
            bgSmall: "#0BAA2E",
        },
        {
            title: dataLang?.productions_orders_details_other_costs || 'productions_orders_details_other_costs',
            number: data?.dataDetail?.cost?.cost_other ? formatNumber(data?.dataDetail?.cost?.cost_other) : 0,
            bgColor: "#FEF8EC",
            bgSmall: "#FF8F0D",
        },
        {
            title: dataLang?.productions_orders_details_total_costs || 'productions_orders_details_total_costs',
            number: data?.dataDetail?.cost?.total_cost ? formatNumber(data?.dataDetail?.cost?.total_cost) : 0,
            bgColor: "#FFEEF0",
            bgSmall: "#EE1E1E",
        },
    ];

    const shareProps = { queryStateModal, isState, refetchProductionsOrders, isLoading, dataLang, isStateModal, width, listTab, typePageMoblie };

    const components = {
        1: <TabInFormation {...shareProps} />,
        2: <TabExportSituation {...shareProps} />,
        3: <TabExportHistory {...shareProps} />,
        4: <TabWarehouseHistory {...shareProps} />,
        5: <TabRecallMaterials {...shareProps} />,
        6: <TabProcessingCost {...shareProps} />,
    };
    // const findSt

    const color = {
        "0": {
            class: 'text-[#f59e0b] bg-[#fff7ed]',
            circle: "bg-[#f59e0b]",
            title: "Chưa sản xuất"
        },
        "1": {
            class: 'text-[#3b82f6] bg-[#eff6ff]',
            circle: "bg-[#3b82f6]",
            title: "Đang sản xuất"
        },
        "2": {
            class: 'text-[#22c55e] bg-[#f0fdf4]',
            circle: "bg-[#22c55e]",
            title: "Hoàn thành"
        },
        "3": {
            class: 'text-[#ef4444] bg-[#fef2f2]',
            circle: "bg-[#ef4444]",
            title: "Chưa hoàn thành & Quá hạn"
        }
    }

    const getStatusColor = (status) => color[status] ?? {
        class: 'text-[#3b82f6] bg-[#eff6ff]',
        circle: "bg-[#3b82f6]",
        title: "Chưa hoàn thành"
    };
    // const getStatusColor = (status) => color[status] ?? {
    //     class: 'text-[#3b82f6] bg-[#eff6ff]',
    //     circle: "bg-[#3b82f6]",
    //     title: "Chưa hoàn thành"
    // };


    if (!isMounted) return null

    return (
        <Customscrollbar
            style={{
                width: width,
                height: typePageMoblie ? "100vh" : `calc(100vh - ${72}px)`,
                transform: isState.openModal ? "translateX(0%)" : "translateX(100%)",
                maxWidth: "100vw",
            }}
            className={`bg-[#FFFFFF] absolute ${typePageMoblie ? 'top-0' : "top-[9.2%]"} right-0 shadow-md z-[999] transition-all duration-150 ease-linear h-full overflow-y-auto`}
        >
            <div className="pl-3 pr-4">
                <div className="flex justify-between py-4 border-b border-gray-300">
                    <div className="flex items-center gap-2">
                        {/* <FaAngleDoubleRight
                            className="text-sm cursor-pointer text-gray-650"
                            onClick={() => {
                                if (width == 650) {
                                    queryState({ openModal: !isState.openModal, dataModal: {} });
                                } else {
                                    setWidth(650);
                                }
                            }}
                        /> */}
                        <FaUpRightAndDownLeftFromCenter
                            className="text-sm rotate-90 cursor-pointer text-gray-650"
                            onClick={() => setWidth(window.innerWidth)}
                        />
                        <h1 className={`text-[#0F4F9E] ${typePageMoblie ? 'text-sm' : " text-base"} font-medium capitalize`}>
                            {dataLang?.productions_orders_details || "productions_orders_details"}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="">
                            <span className={`${getStatusColor(data?.dataDetail?.poi?.status_item)?.class} ${typePageMoblie ? 'text-xs py-1' : "text-sm py-2"} pl-3 pr-4  rounded-3xl font-medium w-fit h-fit`}>
                                <span className={`${getStatusColor(data?.dataDetail?.poi?.status_item)?.circle} h-2 w-2 rounded-full inline-block mr-2`} />
                                {getStatusColor(data?.dataDetail?.poi?.status_item)?.title}
                            </span>
                        </div>
                        <button
                            onClick={() => {
                                queryState({ openModal: !isState.openModal, dataModal: {} });
                                setWidth(minWidth);
                            }}
                            type="button"
                            className="w-[20px] h-[20px] hover:scale-125 transition-all duration-300 ease-linear"
                        >
                            <Image
                                alt=""
                                src={"/manufacture/x.png"}
                                width={20}
                                height={20}
                                className="object-cover w-full h-full"
                            />
                        </button>
                    </div>
                </div>
                <div className={`grid grid-cols-12 w-auto items-center flex-wrap ${typePageMoblie ? "gap-2" : "gap-4"}`}>
                    <div className={`grid grid-cols-2 ${width >= 1100 ? "col-span-5" : "col-span-12"} `}>
                        <div className="flex flex-col">
                            <div className={`flex items-center ${typePageMoblie ? "gap-px my-1" : "gap-1 my-2"}`}>
                                <h3 className={`${typePageMoblie ? "text-[10px] leading-tight" : "text-[13px]"}`}>{dataLang?.productions_orders_details_number || 'productions_orders_details_number'}:</h3>
                                <h3 className={`${typePageMoblie ? "text-[10px] leading-tight" : "text-[13px]"} font-medium`}>{isStateModal.dataDetail?.poi?.reference_no_po ?? ""}</h3>
                            </div>
                            <div className={`flex items-center col-span-3 ${typePageMoblie ? "gap-px my-1" : "gap-1 my-2"}`}>
                                <h3 className={`${typePageMoblie ? "text-[10px] leading-tight" : "text-[13px]"}`}>{dataLang?.productions_orders_details_plan || 'productions_orders_details_plan'}:</h3>
                                <h3 className={`${typePageMoblie ? "text-[10px] leading-tight" : "text-[13px]"} font-medium`}>{isStateModal.dataDetail?.poi?.reference_no_pp ?? ""}</h3>
                            </div>
                            <div className={`flex items-center ${typePageMoblie ? "gap-px my-1" : "gap-1 my-2"}`}>
                                <h3 className={`${typePageMoblie ? "text-[10px] leading-tight" : "text-[13px]"}`}>{dataLang?.productions_orders_details_lxs_number || 'productions_orders_details_lxs_number'}:</h3>
                                <h3 className={`${typePageMoblie ? "text-[10px] leading-tight" : "text-[13px]"} font-medium`}>{isStateModal.dataDetail?.poi?.reference_no_detail ?? ""}</h3>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <div className={`flex items-center col-span-3 ${typePageMoblie ? "gap-px my-1" : "gap-1 my-2"}`}>
                                <h3 className={`${typePageMoblie ? "text-[10px] leading-tight" : "text-[13px]"}`}>{dataLang?.productions_orders_details_orders || 'productions_orders_details_orders'}:</h3>
                                <h3 className={`${typePageMoblie ? "text-[10px] leading-tight" : "text-[13px]"} font-medium`}>{isStateModal.dataDetail?.poi?.object?.reference_no}</h3>
                            </div>
                            <div className={`flex items-center col-span-3 ${typePageMoblie ? "gap-px my-1" : "gap-1 my-2"}`}>
                                <h3 className={`${typePageMoblie ? "text-[10px] leading-tight" : "text-[13px]"}`}>{dataLang?.productions_orders_details_client || 'productions_orders_details_client'}:</h3>
                                <h3 className={`${typePageMoblie ? "text-[10px] leading-tight" : "text-[13px]"} font-medium`}>{isStateModal.dataDetail?.poi?.object?.company ?? ""}</h3>
                            </div>
                            <div className={`flex items-center ${typePageMoblie ? "gap-px my-1" : "gap-1 my-2"}`}>
                                <h3 className={`${typePageMoblie ? "text-[10px] leading-tight" : "text-[13px]"}`}>{dataLang?.productions_orders_details_branch || 'productions_orders_details_branch'}:</h3>
                                <TagBranch className="w-fit">{isStateModal.dataDetail?.poi?.branch_name}</TagBranch>
                            </div>
                        </div>
                    </div>
                    
                    <div className={`grid grid-cols-3 ${width >= 1100 ? "col-span-7" : "col-span-12"}  gap-5`}>
                        {
                            dataTotal.map((e, i) => (
                                <div
                                    key={i}
                                    style={{ backgroundColor: `${e.bgColor}` }}
                                    className={`w-full ${typePageMoblie ? "p-3" : "p-4"} rounded-md space-y-1.5`}
                                >
                                    <h4 className={`text-[#3A3E4C] font-normal ${width >= 1100 ? "text-base" : "text-xs"}`}>
                                        {e.title}
                                    </h4>
                                    <div className="flex items-end justify-between">
                                        <h6
                                            style={{ backgroundColor: `${e.bgSmall}` }}
                                            className={`${typePageMoblie ? (e?.number > 0 ? "text-xs px-1" : "text-xs px-2") : "text-base px-3"} font-medium text-white  py-1 flex flex-col justify-center items-center rounded-md`}
                                        >
                                            {e?.number}
                                        </h6>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>

                <div className={`${typePageMoblie ? "mt-2" : "mt-4"} border-b`}>
                    <ContainerFilterTab>
                        {
                            listTab.map((e, index) => (
                                <button
                                    key={e.id}
                                    ref={el => tabRefs.current[index] = el}
                                    onClick={() => handleActiveTab(e.id)}
                                    className={`hover:bg-[#F7FBFF] ${isStateModal.isTab == e.id ? "border-[#0F4F9E] border-b-2 bg-[#F7FBFF]" : 'border-b-2  border-transparent'}
                                     group transition-all duration-200 ease-linear outline-none focus:outline-none min-w-fit`}
                                >
                                    <h3 className={`relative ${typePageMoblie ? "py-1.5 text-xs" : "py-[10px] text-[13px]"} px-2  font-normal ${isStateModal.isTab == e.id ? "text-[#0F4F9E]" : "text-[#667085]"}  group-hover:text-[#0F4F9E] transition-all duration-200 ease-linear`} >
                                        {e.name}
                                        <span className={`${e?.count > 0 && `absolute top-0 right-0 3xl:translate-x-[65%] translate-x-1/2 h-[16px] w-[16px]  ${typePageMoblie ? "text-[9px]" : "text-[11px]"}  bg-[#ff6f00]  text-white rounded-full text-center items-center flex justify-center`} `}>
                                            {e?.count > 0 && e?.count}
                                        </span>
                                    </h3>
                                </button>
                            ))
                        }
                    </ContainerFilterTab>
                </div>
                <div className="w-full my-2">{components[isStateModal.isTab]}</div>
            </div>
            <div
                onMouseDown={startResize}
                className="absolute left-0 h-full translate-y-1/2 bg-transparent top-[3%] -translate-x-1/4 cursor-col-resize"
            >
                {/* <RxDragHandleDots1 size={21} className="h-full my-auto" /> */}
                <div className="w-6 h-6">
                    <Image
                        src={'/icon/resize.png'}
                        width={1280}
                        height={1280}
                        alt={''}
                        draggable={false}
                        className={'h-full w-full object-contain my-auto'}
                    />
                </div>
            </div>
        </Customscrollbar>
    );
});

export default ModalDetail;
