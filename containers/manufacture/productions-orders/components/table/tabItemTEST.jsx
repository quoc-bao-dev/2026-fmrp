import ProgressStageBar from "@/components/common/progress/ProgressStageBar";
import Loading from "@/components/UI/loading/loading";
import NoData from "@/components/UI/noData/nodata";
import useSetingServer from "@/hooks/useConfigNumber";
import formatNumberConfig from "@/utils/helpers/formatnumber";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import React, { memo, useContext, useState } from "react";
import { ProductionsOrdersContext } from "../../context/productionsOrders";
import { CaretDownIcon, NoteIcon } from "@/components/icons";

const TabItem = memo(({ handShowItem, isLoadingRight, dataLang, handleShowModel, typePageMoblie }) => {
    const dataSeting = useSetingServer();

    const formatNumber = (num) => formatNumberConfig(+num, dataSeting);

    const { isStateProvider: isState } = useContext(ProductionsOrdersContext);
    const [visibleProducts, setVisibleProducts] = useState({});

    const handleShowMoreProducts = (itemId, total) => {
        setVisibleProducts((prev) => ({
            ...prev,
            [itemId]: total,
        }));
    };

    return (
        <React.Fragment>
            {
                isLoadingRight ?
                    (
                        <Loading className="h-80" color="#0f4f9e" />
                    )
                    :
                    (
                        <div className='flex flex-col gap-4 h-full'>
                            {
                                isState?.dataProductionOrderDetail?.listPOItems?.length > 0 ?
                                    (
                                        isState?.dataProductionOrderDetail?.listPOItems?.map((item) => {
                                            return (
                                                <div
                                                    key={`accordion-${item.id}`}
                                                    className="grid grid-cols-12 items-start select-none"
                                                >
                                                    {/* title accordion */}
                                                    <div
                                                        onClick={() => {
                                                            handShowItem(item.id, "listPOItems")
                                                            // ✅ Reset visible products về 4
                                                            setVisibleProducts((prev) => ({
                                                                ...prev,
                                                                [item.id]: 4,
                                                            }));

                                                        }}
                                                        className={`select-none ${item.showChild ? "border-[#3276FA] bg-[#EBF5FF] text-[#0F4F9E]" : "border-[#D0D5DD] bg-white text-[#3A3E4C] hover:border-[#3276FA] hover:bg-[#EBF5FF] hover:text-[#0F4F9E]"} col-span-12 border flex items-center justify-between px-3 rounded-lg cursor-pointer custom-transition group`}
                                                    >
                                                        <div className='flex items-center gap-2'>
                                                            <div className={`${item.showChild ? "text-[#0F4F9E]" : "text-[#9295A4] group-hover:text-[#0F4F9E]"} 3xl:size-5 size-4 custom-transition`}>
                                                                <NoteIcon className={`size-full`} />
                                                            </div>

                                                            <h1 className={`font-normal 3xl:text-base text-sm py-2 space-x-1`}>
                                                                <span>
                                                                    Đơn hàng:
                                                                </span>
                                                                <span>
                                                                    {item.title}
                                                                </span>
                                                            </h1>

                                                            {
                                                                item.showChild &&
                                                                <span className="rounded-full bg-[#0F4F9E] !text-white text-xs xl:size-5 size-4 flex items-center justify-center">
                                                                    {item?.items_products?.length ?? 0}
                                                                </span>
                                                            }
                                                        </div>

                                                        <div className={`${item.showChild ? "rotate-180 text-[#0F4F9E]" : "text-[#9295A4] group-hover:text-[#0F4F9E]"} size-4 custom-transition`}>
                                                            <CaretDownIcon className='size-full' />
                                                        </div>
                                                    </div>

                                                    <AnimatePresence initial={false} mode="wait">
                                                        {
                                                            item.showChild &&
                                                            <motion.div
                                                                key={`accordion-body-${item.id}-${item.showChild ? "open" : "closed"}`}
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                                className='col-span-12 grid grid-cols-16 mt-2'
                                                            >
                                                                {/* header  */}
                                                                <div className={`col-span-16 grid grid-cols-16 gap-2 py-4 border-b`}>
                                                                    <h4 className={`3xl:text-sm text-xs text-start text-[#9295A4] font-semibold col-span-5`}>
                                                                        {dataLang?.Q_materials_finish_product || "Q_materials_finish_product"}
                                                                    </h4>
                                                                    <h4 className={`3xl:text-sm text-xs text-start text-[#9295A4] font-semibold col-span-2`}>
                                                                        {dataLang?.Q_materials_unit || "Q_materials_unit"}
                                                                    </h4>
                                                                    <h4 className={`3xl:text-sm text-xs text-center text-[#9295A4] font-semibold col-span-1`}>
                                                                        {dataLang?.Q_materials_quantity || "Q_materials_quantity"}
                                                                    </h4>
                                                                    <h4 className={`3xl:text-sm text-xs text-center text-[#9295A4] font-semibold col-span-3`}>
                                                                        {dataLang?.Q_materials_status || "Q_materials_status"}
                                                                    </h4>
                                                                    <h4 className={`3xl:text-sm text-xs text-center text-[#9295A4] font-semibold block col-span-5`}>
                                                                        {dataLang?.Q_materials_progress || "Q_materials_progress"}
                                                                    </h4>
                                                                </div>

                                                                {
                                                                    item?.items_products && item?.items_products?.slice(0, visibleProducts[item.id] || 4)?.map((product, index) => {
                                                                        const color = {
                                                                            "0": {
                                                                                color: 'bg-[#FF811A]/15 text-[#C25705]',
                                                                                title: dataLang?.productions_orders_produced ?? "productions_orders_produced"
                                                                            },
                                                                            "1": {
                                                                                color: 'bg-[#3ECeF7]/20 text-[#076A94]',
                                                                                title: dataLang?.productions_orders_in_progress ?? "productions_orders_in_progress"
                                                                            },
                                                                            "2": {
                                                                                color: 'bg-[#35BD4B]/20 text-[#1A7526]',
                                                                                title: dataLang?.productions_orders_completed ?? "productions_orders_completed"
                                                                            }
                                                                        }

                                                                        return (
                                                                            <div
                                                                                key={`product-${index}`}
                                                                                // key={`product-${product.id}`}
                                                                                onClick={() => handleShowModel(product)}
                                                                                className={`col-span-16 grid grid-cols-16 gap-2 items-center group hover:bg-gray-100 cursor-pointer transition-all duration-150 ease-in-out py-4
                                                                        ${item?.items_products?.slice(0, visibleProducts[item.id] || 4)?.length - 1 == index ? "border-red-500" : "border-b"}
                                                                    `}
                                                                            >
                                                                                <h4 className={`col-span-5 text-[#344054] font-normal flex items-center py-2 px-4 gap-2`}>
                                                                                    <div className='3xl:size-16 size-14 shrink-0'>
                                                                                        <Image
                                                                                            alt={product?.name}
                                                                                            width={200}
                                                                                            height={200}
                                                                                            src={product?.images ?? "/icon/default/default.png"}
                                                                                            className="size-full object-cover rounded-md"
                                                                                        />
                                                                                    </div>

                                                                                    <div className="flex flex-col gap-1">
                                                                                        <p className={`${isState.dataModal.id == product.id ? "text-[#0F4F9E]" : "text-[#141522] group-hover:text-[#0F4F9E]"} font-semibold 3xl:text-base text-sm custom-transition`}>
                                                                                            {product.item_name}
                                                                                        </p>

                                                                                        <div className='space-y-0.5'>
                                                                                            <p className={`text-[#667085] font-normal text-[10px]`}>
                                                                                                {product.product_variation}
                                                                                            </p>

                                                                                            <p className={`text-[#3276FA] font-normal 3xl:text-sm text-xs`}>
                                                                                                {product.item_code}
                                                                                            </p>
                                                                                            <p className={`text-[#3276FA] font-normal 3xl:text-sm text-xs`}>
                                                                                                {product.reference_no_detail}
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>
                                                                                </h4>

                                                                                <h4 className={`col-span-2 text-start text-[#141522] font-semibold xl:text-sm text-xs`}>
                                                                                    {product?.unit_name ?? ""}
                                                                                </h4>

                                                                                <h4 className={`col-span-1 text-center text-[#141522] font-semibold xl:text-sm text-xs uppercase`}>
                                                                                    {product.quantity > 0 ? formatNumber(product.quantity) : "-"}
                                                                                </h4>

                                                                                <h4 className={`col-span-3 flex items-center justify-center xl:text-sm text-xs`}>
                                                                                    <p className={`${color[product?.status_item]?.color} text-sm px-2 py-1 rounded font-normal w-fit h-fit`}>
                                                                                        {color[product?.status_item]?.title}
                                                                                    </p>
                                                                                </h4>

                                                                                <h4 className={`col-span-5 flex items-center justify-center xl:text-sm text-xs`}>
                                                                                    <ProgressStageBar
                                                                                        total={product?.count_stage}
                                                                                        done={product?.count_stage_active}
                                                                                        quantity={product?.quantity_stage}
                                                                                        name_active={product?.stage_name_active ?? ""}
                                                                                    />
                                                                                </h4>
                                                                            </div>

                                                                        )
                                                                    })
                                                                }

                                                                {
                                                                    (item.items_products?.length || 0) > (visibleProducts[item.id] || 4) && (
                                                                        <div className="col-span-16 flex justify-center py-2">
                                                                            <button
                                                                                onClick={() => handleShowMoreProducts(item.id, item.items_products.length)}
                                                                                className="text-[#667085] 3xl:text-base text-sm hover:underline"
                                                                            >
                                                                                Xem thêm ({item.items_products.length - (visibleProducts[item.id] || 4)}) Thành phẩm
                                                                            </button>
                                                                        </div>
                                                                    )
                                                                }
                                                            </motion.div>
                                                        }
                                                    </AnimatePresence>
                                                </div>
                                            )
                                        })
                                    )
                                    :
                                    (
                                        <NoData />
                                    )
                            }
                        </div>
                    )
            }
        </React.Fragment>
    );
});

export default TabItem;
