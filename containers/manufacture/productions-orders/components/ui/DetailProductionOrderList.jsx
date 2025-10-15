import Loading from "@/components/UI/loading/loading";
import NoData from "@/components/UI/noData/nodata";
import useSetingServer from "@/hooks/useConfigNumber";
import formatNumberConfig from "@/utils/helpers/formatnumber";
import Image from "next/image";
import React, { memo, useContext, useState, useCallback } from "react";
import NoteIcon from "@/components/icons/common/NoteIcon";
import CaretDownIcon from "@/components/icons/common/CaretDownIcon";
import ProgressStageBar from "@/components/common/progress/ProgressStageBar";
import { AnimatePresence, motion } from "framer-motion";
import { StateContext } from "@/context/_state/productions-orders/StateContext";

const DetailProductionOrderList = memo(({ handleToggleAccordionList, isLoadingRight, dataLang, handleToggleSheetDetail }) => {
    const dataSeting = useSetingServer();
    const formatNumber = useCallback((num) => formatNumberConfig(+num, dataSeting), [dataSeting]);
    const { isStateProvider } = useContext(StateContext);
    const [visibleProducts, setVisibleProducts] = useState({});

    const handleShowMoreProducts = useCallback((itemId, total) => {
        setVisibleProducts((prev) => ({ ...prev, [itemId]: total }));
    }, []);

    const handleToggleAccordion = useCallback((id) => {
        handleToggleAccordionList(id, "listPOItems");
        setVisibleProducts((prev) => ({ ...prev, [id]: 4 }));
    }, [handleToggleAccordionList]);

    const renderProductRow = useCallback((product, index, item, totalLength) => {
        const colorMap = {
            "0": { color: 'bg-[#FF811A]/15 text-[#C25705]', title: dataLang?.productions_orders_produced || "produced" },
            "1": { color: 'bg-[#3ECeF7]/20 text-[#076A94]', title: dataLang?.productions_orders_in_progress || "in progress" },
            "2": { color: 'bg-[#35BD4B]/20 text-[#1A7526]', title: dataLang?.productions_orders_completed || "completed" },
            "3": { color: 'bg-[#F54A45]/20 text-[#C02A26]', title: dataLang?.productions_orders_overdue || "overdue" }
        };
        const color = colorMap[product?.status_item];

        return (
            <div
                key={`product-${index}`}
                onClick={() => handleToggleSheetDetail(product)}
                className={`col-span-16 grid grid-cols-16 gap-2 items-center group hover:bg-gray-100 cursor-pointer transition-all duration-150 ease-in-out 3xl:py-4 py-2 ${totalLength - 1 === index ? "border-transparent" : "border-b"}`}
            >
                <h4 className="col-span-1 flex items-center justify-center text-center text-[#141522] font-semibold xl:text-sm text-xs uppercase px-1">
                    {(index + 1) ?? "-"}
                </h4>

                <h4 className="col-span-5 text-[#344054] font-normal flex items-center py-2 px-1">

                    <div className='flex items-start gap-2'>
                        <div className="2xl:size-16 size-14 shrink-0">
                            <Image
                                alt={product?.name ?? "img"}
                                width={200}
                                height={200}
                                src={product?.images ?? "/icon/default/default.png"}
                                className="size-full object-cover rounded-md"
                            />
                        </div>

                        <div className="flex flex-col 3xl:gap-1 gap-0.5">
                            <p className={`font-semibold 3xl:text-base xl:text-sm text-xs ${isStateProvider?.productionsOrders.dataModal.id === product.id ? "text-[#0F4F9E]" : "text-[#141522] group-hover:text-[#0F4F9E]"}`}>
                                {product.item_name}
                            </p>
                            <div className="space-y-0.5">
                                <p className="text-[#667085] font-normal xl:text-[10px] text-[8px]">
                                    {product.product_variation}

                                </p>

                                <p className="text-[#3276FA] font-normal 3xl:text-sm xl:text-xs text-[10px]">
                                    {product.item_code}
                                </p>

                                <p className="text-[#3276FA] font-normal 3xl:text-sm xl:text-xs text-[10px]">
                                    {product.reference_no_detail}
                                </p>
                            </div>
                        </div>
                    </div>
                </h4>

                <h4 className="col-span-2 text-start text-[#141522] font-semibold xl:text-sm text-xs px-1">
                    {product?.unit_name ?? ""}

                </h4>

                <h4 className="col-span-1 text-start text-[#141522] font-semibold xl:text-sm text-xs uppercase px-1">
                    {product.quantity > 0 ? formatNumber(product.quantity) : "-"}
                </h4>

                <h4 className="col-span-3 flex items-center justify-start px-1">
                    <p className={`${color?.color} 3xl:text-sm text-xs px-2 py-1 rounded font-normal w-fit h-fit`}>{color?.title}</p>
                </h4>

                <h4 className="col-span-4 flex items-center justify-center xl:text-sm text-xs px-1">
                    <ProgressStageBar
                        total={product?.count_stage}
                        done={product?.count_stage_active}
                        quantity={product?.quantity_stage}
                        name_active={product?.stage_name_active ?? ""}
                    />
                </h4>
            </div>
        );
    }, [formatNumber, handleToggleSheetDetail, isStateProvider?.productionsOrders.dataModal.id, dataLang]);

    if (isLoadingRight) return <Loading className="h-80" color="#0f4f9e" />;

    const list = isStateProvider?.productionsOrders?.dataProductionOrderDetail?.listPOItems || [];

    if (!list.length) return <NoData />;

    return (
        <div className="flex flex-col gap-4 h-full">
            {
                list.map((item) => (
                    <div key={`product-${item.id}`} className="grid grid-cols-12 items-start select-none">

                        <div
                            onClick={() => handleToggleAccordion(item.id)}
                            className={`col-span-12 border flex items-center justify-between px-3 rounded-lg cursor-pointer custom-transition group ${item.showChild ? "border-[#3276FA] bg-[#EBF5FF] text-[#0F4F9E]" : "border-[#D0D5DD] bg-white text-[#3A3E4C] hover:border-[#3276FA] hover:bg-[#EBF5FF] hover:text-[#0F4F9E]"}`}
                        >
                            <div className="flex items-center gap-2">
                                <div className={`${item.showChild ? "text-[#0F4F9E]" : "text-[#9295A4] group-hover:text-[#0F4F9E]"} 3xl:size-5 size-4 custom-transition`}>
                                    <NoteIcon className="size-full" />
                                </div>
                                <h1 className="font-normal 3xl:text-base text-sm py-2 space-x-1">
                                    <span>Đơn hàng:</span>
                                    <span>{item.title}</span>
                                </h1>
                                {item.showChild && <span className="rounded-full bg-[#0F4F9E] !text-white xl:text-xs text-[8px] xl:size-5 size-4  flex items-center justify-center">
                                    {item.items_products?.length ?? 0}
                                </span>}
                            </div>
                            <div className={`${item.showChild ? "rotate-180 text-[#0F4F9E]" : "text-[#9295A4] group-hover:text-[#0F4F9E]"} size-4 custom-transition`}>
                                <CaretDownIcon className="size-full" />
                            </div>
                        </div>

                        <AnimatePresence initial={false}>
                            {
                                item.showChild && (
                                    <motion.div
                                        key={`accordion-body-${item.id}-open`}
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                        className="col-span-12 grid grid-cols-16 mt-2"
                                    >
                                        {/* header */}
                                        <div className="col-span-16 grid grid-cols-16 gap-2 py-4 border-b">
                                            <h4 className='xl:text-sm text-xs text-center text-[#9295A4] font-semibold col-span-1 px-1'>
                                                STT
                                            </h4>

                                            <h4 className="xl:text-sm text-xs text-start text-[#9295A4] font-semibold col-span-5 px-1">
                                                {dataLang?.Q_materials_finish_product || "Q_materials_finish_product"}
                                            </h4>

                                            <h4 className="xl:text-sm text-xs text-start text-[#9295A4] font-semibold col-span-2 px-1">
                                                {dataLang?.Q_materials_unit || "Q_materials_unit"}

                                            </h4>

                                            <h4 className="xl:text-sm text-xs text-start text-[#9295A4] font-semibold col-span-1 px-1">
                                                {dataLang?.Q_materials_quantity || "Q_materials_quantity"}

                                            </h4>

                                            <h4 className="xl:text-sm text-xs text-start text-[#9295A4] font-semibold col-span-3 px-1">
                                                {dataLang?.Q_materials_status || "Q_materials_status"}

                                            </h4>

                                            <h4 className="xl:text-sm text-xs text-center text-[#9295A4] font-semibold block col-span-4 px-1">
                                                {dataLang?.Q_materials_progress || "Q_materials_progress"}
                                            </h4>
                                        </div>
                                        {
                                            item.items_products && item.items_products?.slice(0, visibleProducts[item.id] || 4)?.map((product, index) =>
                                                renderProductRow(product, index, item, item.items_products?.length > 4 ? (visibleProducts[item.id] || 4) : item.items_products?.length)
                                            )
                                        }

                                        {/* load more click */}
                                        {
                                            (item.items_products?.length || 0) > (visibleProducts[item.id] || 4) && (
                                                <div className="col-span-16 flex justify-center py-2">
                                                    <button onClick={() => handleShowMoreProducts(item.id, item.items_products.length)} className="text-[#667085] 3xl:text-base text-sm hover:underline">
                                                        Xem thêm ({item.items_products.length - (visibleProducts[item.id] || 4)}) Thành phẩm
                                                    </button>
                                                </div>
                                            )
                                        }
                                    </motion.div>
                                )
                            }
                        </AnimatePresence>
                    </div>
                ))
            }
        </div >
    );
});

export default DetailProductionOrderList;
