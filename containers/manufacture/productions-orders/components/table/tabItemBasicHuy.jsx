import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import Loading from "@/components/UI/loading/loading";
import NoData from "@/components/UI/noData/nodata";
import useSetingServer from "@/hooks/useConfigNumber";
import formatNumberConfig from "@/utils/helpers/formatnumber";
import Image from "next/image";
import { memo, useContext } from "react";
import { FiCornerDownRight } from "react-icons/fi";
import { ProductionsOrdersContext } from "../../context/productionsOrders";
import TimelineChartStage from "./components/TimelineChartStage";

const TabItem = memo(({ handShowItem, isLoadingRight, dataLang, handleShowModel, typePageMoblie }) => {
    const dataSeting = useSetingServer();

    const formatNumber = (num) => formatNumberConfig(+num, dataSeting);

    const { isStateProvider: isState } = useContext(ProductionsOrdersContext);

    return (
        <>
            <div className="my-4">
                <div className={`grid grid-cols-12 my-4`}>
                    <h4 className={` px-4 text-[#344054] font-normal ${typePageMoblie ? "text-[9px] col-span-8" : "text-xs col-span-4"} uppercase`}>
                        {dataLang?.materials_planning_order || "materials_planning_order"}
                    </h4>
                    <h4 className={` text-center text-[#344054] font-normal ${typePageMoblie ? "text-[9px] col-span-2" : "text-xs col-span-1"} uppercase`}>
                        {typePageMoblie ? "ĐVT" : (dataLang?.category_unit || "category_unit")}
                    </h4>
                    <h4 className={` text-center text-[#344054] font-normal ${typePageMoblie ? "text-[9px] col-span-2" : "text-xs col-span-2"} uppercase`}>
                        {typePageMoblie ? "SL" : (dataLang?.warehouses_detail_quantity || "warehouses_detail_quantity")}
                    </h4>
                    <h4 className={` text-center text-[#344054] font-normal ${typePageMoblie ? "hidden" : "block text-xs col-span-5"} uppercase`}>
                        {"Tiến trình"}
                    </h4>
                </div>
            </div>

            {
                isLoadingRight ?
                    (
                        <Loading className="h-80" color="#0f4f9e" />
                    )
                    :
                    (
                        <Customscrollbar className="3xl:h-[52vh] xxl:h-[40vh] 2xl:h-[43vh] xl:h-[40vh] lg:h-[38vh] h-[38vh] overflow-y-auto">
                            {
                                isState?.listDataRight?.dataPPItems?.length > 0 ?
                                    (
                                        isState?.listDataRight?.dataPPItems?.map((e) => (
                                            <div key={e.id} className="grid items-center h-auto grid-cols-12">
                                                <div
                                                    onClick={() => handShowItem(e.id, "dataPPItems")}
                                                    className="col-span-12 bg-[#EEF4FD] flex items-center gap-0.5 my-1 rounded cursor-pointer"
                                                >
                                                    <Image
                                                        src={"/materials_planning/dow.png"}
                                                        width={14}
                                                        height={17}
                                                        alt="dow.png"
                                                        className={`object-cover ${e.showChild ? "" : "-rotate-90"} transition-all duration-150 ease-linear`}
                                                    />
                                                    <h1 className={`text-[#52575E] font-semibold ${typePageMoblie ? "text-[10px]" : "3xl:text-sm text-xs"} py-2`}>{e.title}</h1>
                                                </div>
                                                {
                                                    e.showChild && e.arrListData.map((i, index) => (
                                                        <div
                                                            key={i.id}
                                                            onClick={() => handleShowModel(i)}
                                                            className={`grid grid-cols-12 ${isState.dataModal.id == i.id ? "bg-gray-100" : ""} ${e.arrListData?.length - 1 == index ? "" : "border-b"}   
                                            items-center col-span-12 group hover:bg-gray-100 cursor-pointer transition-all duration-150 ease-in-out`}
                                                        >
                                                            {
                                                                typePageMoblie && (
                                                                    <div className={`col-span-12`}>
                                                                        <TimelineChartStage data={i?.processBar} dataLang={dataLang} typePageMoblie={typePageMoblie} />
                                                                    </div>
                                                                )
                                                            }
                                                            {
                                                                // typePageMoblie
                                                                //     ?
                                                                //     <h4 className={`col-span-8 text-[#344054] font-normal text-xs flex flex-col py-2 ${typePageMoblie ? "gap-1 px-1" : "px-4 gap-2"}`}>
                                                                //         <div className="flex items-start gap-1">
                                                                //             <Image
                                                                //                 src={i.image}
                                                                //                 // large={i.image}
                                                                //                 width={36}
                                                                //                 height={36}
                                                                //                 alt={i.name}
                                                                //                 className={`object-cover rounded-md ${typePageMoblie ? "w-[24px] h-[24px]" : "min-w-[36px] min-h-[36px] w-[36px] h-[36px] max-w-[36px] max-h-[36px]"}`}
                                                                //             />
                                                                //             <div className="flex flex-col gap-0.5">
                                                                //                 <h1 className={`${isState.dataModal.id == i.id ? "text-[#0F4F9E]" : "text-[#000000]"} group-hover:text-[#0F4F9E] font-semibold 
                                                                //                 ${typePageMoblie ? "text-[10px] leading-tight" : "xl:text-sm text-xs"}`}     >
                                                                //                     {i.name}
                                                                //                 </h1>
                                                                //                 <h1 className={`text-[#9295A4] font-normal ${typePageMoblie ? "text-[8px] leading-tight" : "text-[11px]"}`}>
                                                                //                     {i.code} - {i.itemVariation}
                                                                //                 </h1>
                                                                //             </div>
                                                                //         </div>
                                                                //         <ProductList data={i.childProducts} typePageMoblie={typePageMoblie} />
                                                                //     </h4>
                                                                //     :
                                                                <h4 className={` text-[#344054] font-normal text-xs flex items-start py-2 ${typePageMoblie ? "gap-1 col-span-8 px-2" : "px-4 gap-2 col-span-4"}`}>
                                                                    <Image
                                                                        src={i.image}
                                                                        // large={i.image}
                                                                        width={36}
                                                                        height={36}
                                                                        alt={i.name}
                                                                        className={`object-cover rounded-md ${typePageMoblie ? "w-[24px] h-[24px]" : "min-w-[36px] min-h-[36px] w-[36px] h-[36px] max-w-[36px] max-h-[36px]"}`}
                                                                    />
                                                                    <div className="flex flex-col gap-0.5">
                                                                        <h1 className={`${isState.dataModal.id == i.id ? "text-[#0F4F9E]" : "text-[#000000]"} group-hover:text-[#0F4F9E] font-semibold 
                                                ${typePageMoblie ? "text-[10px] leading-tight" : "xl:text-sm text-xs"}`}     >
                                                                            {i.name}
                                                                        </h1>
                                                                        <h1 className={`text-[#9295A4] font-normal ${typePageMoblie ? "text-[8px] leading-tight" : "text-[11px]"}`}>
                                                                            {i.code} - {i.itemVariation}
                                                                        </h1>
                                                                        <div className="flex flex-col gap-2">
                                                                            {/* {i.childProducts.map((e) => {
                                                            return (
                                                                <div className="flex items-center gap-1">
                                                                    <FiCornerDownRight size={15} />
                                                                    <div className="flex items-center gap-1 px-2 py-1 border border-gray-400 rounded-xl">
                                                                        <ModalImage
                                                                            small={e.image}
                                                                            large={e.image}
                                                                            width={18}
                                                                            height={18}
                                                                            alt={e.name}
                                                                            className="object-cover rounded-md min-w-[18px] min-h-[18px] w-[18px] h-[18px] max-w-[18px] max-h-[18px]"
                                                                        />
                                                                        <span className="text-[#9295A4] text-[11px]">
                                                                            {e.item_code} - SL:{" "}
                                                                            {e.quota_primary > 0
                                                                                ? formatNumber(e.quota_primary)
                                                                                : "-"}{" "}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })} */}
                                                                            <ProductList data={i.childProducts} typePageMoblie={typePageMoblie} />
                                                                            {/* <Tree data={i.childProducts} /> */}
                                                                        </div>
                                                                    </div>
                                                                </h4>
                                                            }
                                                            <h4 className={` text-center text-[#344054] font-normal  ${typePageMoblie ? "text-[9px] col-span-2" : "xl:text-sm text-xs col-span-1"} uppercase`}>
                                                                {i.unit}
                                                            </h4>
                                                            <h4 className={` text-center text-[#344054] font-normal ${typePageMoblie ? "text-[9px] col-span-2" : "xl:text-sm text-xs col-span-2"} uppercase`}>
                                                                {i.quantity > 0 ? formatNumber(i.quantity) : "-"}
                                                            </h4>

                                                            {
                                                                !typePageMoblie && (
                                                                    <div className={`col-span-5`}>
                                                                        <TimelineChartStage data={i?.processBar} dataLang={dataLang} typePageMoblie={typePageMoblie} />

                                                                        {/* {i.processBar.map((j, JIndex) => {
                                                return (
                                                    <div key={j.id} className="flex flex-col items-start w-full">
                                                        <p
                                                            className={`${j?.active ? ' text-[#10b981]' : j?.begin_production == 1 ? "text-orange-600 " : "text-gray-500"}  font-normal 3xl:text-[10px] text-[9px] flex flex-col`}
                                                        >
                                                            <span>{j.status}</span>
                                                            <span className={j.date ? '' : 'opacity-0'}>{formatMoment(j.date, FORMAT_MOMENT.DATE_SLASH_LONG)}</span>
                                                        </p>

                                                        <li
                                                            className={`${JIndex == i.processBar.length - 1
                                                                ? "list-none flex w-full relative text-gray-900 "
                                                                : `list-none flex w-full relative text-gray-900  after:content-[''] after:w-full after:h-0.5 
                                                                    ${j?.active ? ' after:bg-[#10b981]' : j?.begin_production == 1 ? "after:bg-orange-600 " : "after:bg-gray-500"} after:inline-block after:absolute after:top-1 after:left-[15px]`
                                                                }`}
                                                        >
                                                            <div className="z-10 flex flex-col whitespace-nowrap">
                                                                <span className={`w-[10px] h-[10px]  border-2  ${j?.active ? ' bg-[#10b981] border-[#10b981]' : j?.begin_production == 1 ? "bg-orange-600 border-orange-600 " : "bg-gray-500 border-gray-500"} rounded-full flex justify-center items-center mx-auto mb-1 text-sm`}
                                                                ></span>

                                                            </div>
                                                            <div className="relative block w-full top-5">

                                                                <p className={` ${j?.active ? ' text-[#10b981]' : j?.begin_production == 1 ? "text-orange-600 " : "text-gray-500"} font-normal absolute  3xl:text-[11px] text-[10px]`}
                                                                >
                                                                    {j.title}
                                                                </p>

                                                                <p className={` ${j?.dtPurchaseProduct?.quantity > 0 ? "opacity-100" : "opacity-0"}
                                                                
                                                                ${j?.active ? ' text-[#10b981]' : j?.begin_production == 1 ? "text-orange-600 " : "text-gray-500"}
                                                                
                                                              font-normal text-[10px] `} >
                                                                    SL:
                                                                    <span className={` ${j?.active ? ' text-[#10b981]' : j?.begin_production == 1 ? "text-orange-600 " : "text-gray-500"} font-semibold text-[11px] px-1`}>
                                                                        {j.dtPurchaseProduct?.quantity > 0 ? formatNumber(j.dtPurchaseProduct?.quantity) : "-"}
                                                                    </span>
                                                                </p>
                                                            </div>

                                                        </li>
                                                    </div>
                                                );
                                            })} */}
                                                                    </div>
                                                                )
                                                            }
                                                        </div>

                                                    ))
                                                }
                                            </div>
                                        ))
                                    )
                                    :
                                    (
                                        <NoData />
                                    )
                            }
                        </Customscrollbar>
                    )
            }
        </>
    );
});

const RenderHtml = ({ item, typePageMoblie }) => {
    const dataSeting = useSetingServer();
    const formatNumber = (num) => formatNumberConfig(+num, dataSeting);

    return (
        <div className="flex items-center gap-1 my-1">
            <FiCornerDownRight size={typePageMoblie ? 11 : 15} />
            <div className={`flex items-center gap-1 ${typePageMoblie ? "py-0.5 px-2" : "px-2 py-1"} border border-gray-400 rounded-full`}>
                <Image
                    src={item.image ?? "/icon/noimagelogo.png"}
                    // large={item.image ?? "/icon/noimagelogo.png"}
                    width={18}
                    height={18}
                    alt={item.item_name}
                    className="object-cover rounded-md min-w-[18px] min-h-[18px] w-[18px] h-[18px] max-w-[18px] max-h-[18px]"
                />
                <span className={`text-[#9295A4] ${typePageMoblie ? "text-[7px] leading-tight" : "text-[11px]"} `}>
                    {item.item_name} - SL: {item.quota_primary > 0 ? formatNumber(item.quota_primary) : "-"}
                </span>
            </div>
        </div>
    );
};

const ChildProduct = ({ product }) => {
    return (
        <div className="flex flex-col gap-2">
            <RenderHtml typePageMoblie={typePageMoblie} item={product} />
            {product?.sub && product?.sub?.length > 0 && product?.sub.map((child) => {
                return (
                    <div key={child?.id} className={`${typePageMoblie ? "ml-0" : 'ml-4'}`}>
                        <ChildProduct typePageMoblie={typePageMoblie} product={child} />
                    </div>
                );
            })}
        </div>
    );
};

// Component hiển thị sản phẩm
const ProductItem = ({ item, typePageMoblie }) => {
    return (
        <div className="flex flex-col gap-2">
            <RenderHtml item={item} typePageMoblie={typePageMoblie} />
            {item.sub.map((product) => {
                return (
                    <div key={product?.id} className="ml-4">
                        <ChildProduct product={product} typePageMoblie={typePageMoblie} />
                    </div>
                );
            })}
        </div>
    );
};

// Component hiển thị danh sách sản phẩm
const ProductList = ({ data, typePageMoblie }) => (
    <div>
        {data?.map((item) => (
            <ProductItem key={item.id} item={item} typePageMoblie={typePageMoblie} />
        ))}
    </div>
);
// Trong ứng dụng của bạn

export default TabItem;
