import { useSetings } from "@/hooks/useAuth";
import { useWarehouseProperties } from "@/containers/manufacture/warehouse-transfer/hooks/useWarehouseProperties";
import Image from "next/image";
import { useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

const Cardtable = ({
    imageURL,
    name,
    variation,
    code,
    typeProduct,
    typeTable,
    dataLang,
    date,
    classNameImage = "",
    classNameContent = "",
    serial,
    lot,
    warehouse_name,
    location_name,
    item_type,
    value_1,
    value_2,
    value_3
}) => {
    //xứ lý cho card table print tem 
    const [dataMaterialExpiry, setDataMaterialExpiry] = useState({});
    const [dataProductExpiry, setDataProductExpiry] = useState({});
    const [dataProductSerial, setDataProductSerial] = useState({});
    const { data: dataSetting, isLoading } = useSetings();
    const { isWarehousePropertiesEnabled, warehousePropertyLabels } = useWarehouseProperties();
    useEffect(() => {
        if (!isLoading && dataSetting) {
            setDataMaterialExpiry(dataSetting.dataMaterialExpiry);
            setDataProductExpiry(dataSetting.dataProductExpiry);
            setDataProductSerial(dataSetting.dataProductSerial);
        }
    }, [isLoading, dataSetting]);
    //---

    return (
        <div className=" w-full h-full flex flex-row items-start gap-x-2">
            {/* <div
                className={twMerge(
                    "rounded bg-gray-100 2xl:size-14 size-10 shrink-0 overflow-hidden",
                    classNameImage
                )}
            >
                <Image
                    alt="default"
                    src={imageURL || "/icon/default/default.png"}
                    width={200}
                    height={200}
                    quality={100}
                    className="size-full object-cover"
                />
            </div> */}
            <div
                className={twMerge(
                    "flex flex-col items-start justify-start gap-y-0.5 w-full",
                    classNameContent
                )}
            >
                <h3 className="font-semibold responsive-text-sm text-typo-black-1">
                    {name}
                </h3>
                <p className="responsive-text-xxs font-normal text-typo-gray-2">
                    {variation || "(none)"}
                </p>
                {warehouse_name && location_name && (
                    <p className="responsive-text-xs font-normal text-typo-gray-2">
                        {warehouse_name} - {location_name}
                    </p>
                )}
                {code && (
                    <p className="responsive-text-xs font-normal text-typo-blue-2">
                        {code}
                    </p>
                )}

                {typeTable === "temProducts" && (
                    <>
                        {dataMaterialExpiry?.is_enable === "1" &&
                            dataProductExpiry?.is_enable === "1" && (
                                <p className="responsive-text-xs font-normal text-typo-blue-2">
                                    LOT: {lot ?? " - "}
                                </p>
                            )}
                        {dataMaterialExpiry?.is_enable === "1" &&
                            dataProductExpiry?.is_enable === "1" && (
                                <p className="responsive-text-xs font-normal text-typo-blue-2">
                                    Date: {date ?? " - "}
                                </p>
                            )}
                        {dataProductSerial?.is_enable === "1" && (
                            <p className="responsive-text-xs font-normal text-typo-blue-2">
                                Serial: {serial ?? " - "}
                            </p>
                        )}

                        {/* Hiển thị thuộc tính kho cho nguyên vật liệu */}
                        {(item_type === "material") &&
                            Array.isArray(warehousePropertyLabels) &&
                            warehousePropertyLabels.length > 0 &&
                            warehousePropertyLabels.map(({ key, label }) => {
                                if (!label) return null;
                                const value = key === 'value_1' ? value_1 : key === 'value_2' ? value_2 : value_3;

                                // Nếu isWarehousePropertiesEnabled tắt và thuộc tính không có giá trị → ẩn
                                if (!isWarehousePropertiesEnabled && (value == null || value === '')) return null;

                                return (
                                    <p key={key} className="responsive-text-xs font-normal text-typo-blue-2">
                                        {label}: {value == null || value === '' ? ' - ' : value}
                                    </p>
                                );
                            })}
                    </>
                )}

                {/* {typeTable === "products" && (
                    <div
                        className={twMerge(
                            "rounded xl:px-1 px-[2px] w-fit",
                            typeProduct === "semi_products"
                                ? "bg-background-green-1/20 text-typo-green-1 "
                                : "bg-background-blue-1/20 text-typo-blue-3 "
                        )}
                    >
                        <p className="xl:text-[6px] font-medium xlg:leading-4 leading-2 text-[4px]">
                            {typeProduct === "semi_products"
                                ? dataLang?.semi_products
                                : dataLang?.semi_products_outside}
                        </p>
                    </div>
                )} */}
            </div>
        </div>
    );
};

export default Cardtable;
