import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import Loading from "@/components/UI/loading/loading";
import NoData from "@/components/UI/noData/nodata";
import useSetingServer from "@/hooks/useConfigNumber";
import formatNumberConfig from "@/utils/helpers/formatnumber";
import Image from "next/image";
import { memo, useContext } from "react";
import { FiCornerDownRight } from "react-icons/fi";
import ModalImage from "react-modal-image";
import { ProductionsOrdersContext } from "../../context/productionsOrders";
import TimelineChartStage from "./components/TimelineChartStage";

const TabSemi = memo(
    ({ handShowItem, isLoadingRight, dataLang, typePageMoblie }) => {
        const dataSeting = useSetingServer();

        const formatNumber = (num) => formatNumberConfig(+num, dataSeting);

        const { isStateProvider: isState } = useContext(ProductionsOrdersContext);

        return (
            <>
                <div className="my-4">
                    <div
                        className={`grid my-4 ${typePageMoblie ? "grid-cols-7" : "grid-cols-13"
                            }`}
                    >
                        <h4
                            className={`${typePageMoblie ? "col-span-3" : "col-span-4"
                                } px-4 text-[#344054] font-normal ${typePageMoblie ? "text-[9px]" : "text-xs"
                                } uppercase`}
                        >
                            {dataLang?.materials_planning_order || "materials_planning_order"}
                        </h4>
                        <h4
                            className={` text-center text-[#344054] font-normal ${typePageMoblie ? "text-[9px] col-span-1" : "text-xs col-span-1"
                                } uppercase`}
                        >
                            {typePageMoblie
                                ? "ĐVT"
                                : dataLang?.category_unit || "category_unit"}
                        </h4>
                        <h4
                            className={` text-center text-[#344054] font-normal ${typePageMoblie ? "text-[9px] col-span-1" : "text-xs col-span-1"
                                } uppercase`}
                        >
                            {"SL cần"}
                            {/* {dataLang?.warehouses_detail_quantity || "warehouses_detail_quantity"} */}
                        </h4>
                        <h4
                            className={` text-center text-[#344054] font-normal ${typePageMoblie ? "text-[9px] col-span-1" : "text-xs col-span-1"
                                } uppercase`}
                        >
                            {"SL giữ kho"}
                        </h4>
                        <h4
                            className={` text-center text-[#344054] font-normal ${typePageMoblie ? "text-[9px] col-span-1" : "text-xs col-span-1"
                                } uppercase`}
                        >
                            {"SL sản xuất"}
                        </h4>
                        <h4
                            className={`col-span-5 ${typePageMoblie ? "hidden" : "block"
                                } text-center text-[#344054] font-normal text-xs uppercase`}
                        >
                            {"Tiến trình"}
                        </h4>
                    </div>
                </div>
                {isLoadingRight ? (
                    <Loading className="h-80" color="#0f4f9e" />
                ) : (
                    <Customscrollbar className="3xl:h-[52vh] xxl:h-[40vh] 2xl:h-[43vh] xl:h-[40vh] lg:h-[38vh] h-[38vh] overflow-y-auto">
                        {isState?.listDataRight?.dataSemiItems?.length > 0 ? (
                            isState?.listDataRight?.dataSemiItems?.map((e) => (
                                <div key={e.id} className="grid items-center grid-cols-12 ">
                                    <div
                                        onClick={() => handShowItem(e.id, "dataSemiItems")}
                                        className="col-span-12 bg-[#EEF4FD] flex items-center gap-0.5 my-1 rounded cursor-pointer"
                                    >
                                        <Image
                                            src={"/materials_planning/dow.png"}
                                            width={14}
                                            height={17}
                                            alt="dow.png"
                                            className={`object-cover ${e.showChild ? "" : "-rotate-90"
                                                } transition-all duration-150 ease-linear`}
                                        />
                                        <h1
                                            className={`text-[#52575E] font-semibold ${typePageMoblie ? "text-[10px]" : "3xl:text-sm text-xs"
                                                } py-2`}
                                        >
                                            {e.title}
                                        </h1>
                                    </div>
                                    {e.showChild &&
                                        e?.arrListData?.map((i, index) => (
                                            <div
                                                key={i?.id}
                                                className={`grid ${typePageMoblie ? "grid-cols-8" : "grid-cols-13"
                                                    } ${isState.dataModal.id == i?.id ? "bg-gray-100" : ""
                                                    } ${e.arrListData?.length - 1 == index ? "" : "border-b"
                                                    } items-center col-span-12 group transition-all duration-150 ease-in-out`}
                                            >
                                                {typePageMoblie && (
                                                    <div className="col-span-8">
                                                        {i?.quantity_need_manufactures > 0 ? (
                                                            <TimelineChartStage
                                                                data={i?.processBar}
                                                                typePageMoblie={typePageMoblie}
                                                                dataLang={dataLang}
                                                            />
                                                        ) : (
                                                            <p className="text-[10px] font-normal text-center text-red-500">
                                                                Số lượng sản xuất đã hết, quá trình sản xuất đã
                                                                kết thúc
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                                <h4
                                                    className={`col-span-4 text-[#344054] font-normal text-xs flex flex-col py-2 ${typePageMoblie ? "px-2 gap-1" : "px-4 gap-2"
                                                        }`}
                                                >
                                                    <div
                                                        className={`flex items-center gap-1 ${typePageMoblie ? "py-0.5 px-2" : "px-2 py-1"
                                                            } border border-gray-400 rounded-full w-fit`}
                                                    >
                                                        <Image
                                                            src={i?.childProducts?.image}
                                                            // large={i?.childProducts?.image}
                                                            width={18}
                                                            height={18}
                                                            alt={i?.childProducts?.name}
                                                            className="object-cover rounded-md min-w-[18px] min-h-[18px] w-[18px] h-[18px] max-w-[18px] max-h-[18px]"
                                                        />
                                                        <span
                                                            className={`text-[#9295A4] ${typePageMoblie
                                                                    ? "text-[7px] leading-tight"
                                                                    : "text-[11px]"
                                                                }`}
                                                        >
                                                            {i?.childProducts?.item_name} - SL:{" "}
                                                            {i?.childProducts?.quantity > 0
                                                                ? formatNumber(i?.childProducts?.quantity)
                                                                : "-"}{" "}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <FiCornerDownRight size={15} />
                                                        <Image
                                                            src={i?.image}
                                                            // small={i?.image}
                                                            // large={i?.image}
                                                            width={36}
                                                            height={36}
                                                            alt={i?.name}
                                                            className={`object-cover rounded-md ${typePageMoblie
                                                                    ? "w-[24px] h-[24px]"
                                                                    : "min-w-[36px] min-h-[36px] w-[36px] h-[36px] max-w-[36px] max-h-[36px]"
                                                                }`}
                                                        />
                                                        <div className="flex flex-col gap-0.5">
                                                            <h1
                                                                className={`${isState.dataModal.id == i?.id
                                                                        ? "text-[#0F4F9E]"
                                                                        : "text-[#000000]"
                                                                    }  font-semibold ${typePageMoblie
                                                                        ? "text-[10px] leading-tight"
                                                                        : "xl:text-sm text-xs"
                                                                    }`}
                                                            >
                                                                {i?.name}
                                                            </h1>
                                                            <h1
                                                                className={`text-[#9295A4] font-normal ${typePageMoblie
                                                                        ? "text-[8px] leading-tight"
                                                                        : "text-[11px]"
                                                                    }`}
                                                            >
                                                                {i?.code} - {i?.itemVariation}
                                                            </h1>
                                                        </div>
                                                    </div>
                                                </h4>
                                                <h4
                                                    className={`${typePageMoblie ? "col-span-1" : "col-span-1"
                                                        } text-center text-[#344054] font-normal ${typePageMoblie ? "text-[9px]" : "xl:text-sm text-xs"
                                                        } uppercase`}
                                                >
                                                    {i?.unit}
                                                </h4>
                                                <h4
                                                    className={`${typePageMoblie ? "col-span-1" : "col-span-1"
                                                        } text-center text-[#344054] font-normal ${typePageMoblie ? "text-[9px]" : "xl:text-sm text-xs"
                                                        } uppercase`}
                                                >
                                                    {i?.quantity > 0 ? formatNumber(i?.quantity) : "-"}
                                                </h4>
                                                <h4
                                                    className={`${typePageMoblie ? "col-span-1" : "col-span-1"
                                                        } text-center text-[#344054] font-normal ${typePageMoblie ? "text-[9px]" : "xl:text-sm text-xs"
                                                        } uppercase`}
                                                >
                                                    {i?.quantity_keep > 0
                                                        ? formatNumber(i?.quantity_keep)
                                                        : "-"}
                                                </h4>
                                                <h4
                                                    className={`${typePageMoblie ? "col-span-1" : "col-span-1"
                                                        } text-center text-[#344054] font-normal ${typePageMoblie ? "text-[9px]" : "xl:text-sm text-xs"
                                                        } uppercase`}
                                                >
                                                    {i?.quantity_need_manufactures > 0
                                                        ? formatNumber(i?.quantity_need_manufactures)
                                                        : "-"}
                                                </h4>
                                                {!typePageMoblie && (
                                                    <div className="col-span-5">
                                                        {i?.quantity_need_manufactures > 0 ? (
                                                            <TimelineChartStage
                                                                data={i?.processBar}
                                                                dataLang={dataLang}
                                                            />
                                                        ) : (
                                                            <p className="text-xs font-normal text-center text-red-500 xl:text-sm">
                                                                Số lượng sản xuất đã hết, quá trình sản xuất đã
                                                                kết thúc
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                                {/* <h4 className="flex items-center col-span-5">
                                            {i?.processBar.map((j, JIndex) => {
                                                return (
                                                    <div key={j.id} className="flex flex-col items-start w-full">
                                                        <div className={`${j.active ? "text-[#0BAA2E]" : "text-gray-500"} font-normal 3xl:text-[10px] text-[9px] flex flex-col`}>
                                                            {moment(j.date).format('DD/MM/YYYY, HH:mm:ss')}
                                                            <span>{j.status}</span>
                                                            <span>({moment(j.date).format('DD/MM/YYYY')})</span>
                                                        </div>
                                                        <p
                                                            className={`${j.active ? "text-[#0BAA2E]" : "text-gray-500"
                                                                } font-normal 3xl:text-[10px] text-[9px] flex flex-col`}
                                                        >
                                                            <span>{j.status}</span>
                                                            <span>({moment(j.date).format("DD/MM/YYYY")})</span>
                                                        </p>

                                                        <li
                                                            className={`${JIndex == i?.processBar.length - 1
                                                                ? "flex w-full relative text-gray-900 "
                                                                : `flex w-full relative text-gray-900  after:content-[''] after:w-full after:h-0.5 ${j.active
                                                                    ? "after:bg-[#00C170]"
                                                                    : "after:bg-gray-500"
                                                                }   after:inline-block after:absolute after:top-1 after:left-[25px]`
                                                                }`}
                                                        >
                                                            <div className="z-10 block whitespace-nowrap">
                                                                <span
                                                                    className={`w-[10px] h-[10px]  border-2  ${j.active
                                                                        ? "bg-[#00C170] border-[#00C170]"
                                                                        : "bg-gray-500 border-gray-500"
                                                                        } rounded-full flex justify-center items-center mx-auto mb-1 text-sm`}
                                                                ></span>
                                                                <p
                                                                    className={`${j.active
                                                                        ? "text-[#0BAA2E]"
                                                                        : "text-gray-500"
                                                                        } font-normal 3xl:text-[11px] text-[10px]`}
                                                                >
                                                                    {j.title}
                                                                </p>

                                                                <p
                                                                    className={` ${j.quantity > 0 ? "opacity-100" : "opacity-0"
                                                                        } text-[#0BAA2E] font-normal text-[10px]`}
                                                                >
                                                                    SL:
                                                                    <span className="text-[#0BAA2E] font-semibold text-[11px] px-1">
                                                                        {j.quantity > 0
                                                                            ? formatNumber(j.quantity)
                                                                            : "-"}
                                                                    </span>
                                                                </p>
                                                            </div>
                                                        </li>
                                                        <li className={`${JIndex == i?.processBar.length - 1 ? "list-none flex w-full relative text-gray-900 "
                                                            : `list-none flex w-full relative text-gray-900  after:content-[''] after:w-full after:h-0.5 
                                                                    ${j.active ? "after:bg-[#00C170]" : "after:bg-gray-500"} after:inline-block after:absolute after:top-1 after:left-[15px]`}`}
                                                        >
                                                            <div className="z-10 block whitespace-nowrap ">
                                                                <span className={`w-[10px] h-[10px]  border-2  ${j.active ? "bg-[#00C170] border-[#00C170]" : "bg-gray-500 border-gray-500"} rounded-full flex justify-center items-center mx-auto mb-1 text-sm`}></span>
                                                                <p className={`${j.active ? "text-[#0BAA2E]" : "text-gray-500"} font-normal absolute  3xl:text-[11px] text-[10px]`} >
                                                                    {j.title}
                                                                </p>
                                                                <p className={` ${j.quantity > 0 ? "opacity-100" : "opacity-0"} text-[#0BAA2E] font-normal text-[10px]`}  >
                                                                    SL:
                                                                    <span className="text-[#0BAA2E] font-semibold text-[11px] px-1">
                                                                        {j.quantity > 0 ? formatNumber(j.quantity) : "-"}
                                                                    </span>
                                                                </p>
                                                            </div>
                                                        </li>
                                                    </div>
                                                );
                                            })}
                                        </h4> */}
                                            </div>
                                        ))}
                                </div>
                            ))
                        ) : (
                            <NoData />
                        )}
                    </Customscrollbar>
                )}
            </>
        );
    }
);

export default TabSemi;
