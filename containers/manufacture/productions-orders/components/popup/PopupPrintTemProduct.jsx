"use client";
import { Lexend_Deca } from "@next/font/google";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Add as IconClose } from "iconsax-react";
import PrinterIcon2 from "@/components/icons/common/PrinterIcon2";
import CheckboxDefault from "@/components/common/checkbox/CheckboxDefault";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import InputNumberCustom from "@/components/common/input/InputNumberCustom";
import Cardtable from "@/components/common/card/Cardtable";
import {
    ColumnTable,
    HeaderTable,
    RowItemTable,
    RowTable,
} from "@/components/UI/common/Table";
import BackIcon from "@/components/icons/common/BackIcon";
import { twMerge } from "tailwind-merge";
import Carousel from "@/components/common/carousel/Carousel";
import NoData from "@/components/UI/noData/nodata";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import apiProducts from "@/Api/apiProducts/products/apiProducts";
import ButtonAnimationNew from "@/components/common/button/ButtonAnimationNew";
dayjs.extend(customParseFormat);

const deca = Lexend_Deca({
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const PopupPrintTemProduct = ({ dataItem, idManufacture }) => {
    const dispatch = useDispatch();
    const [listItem, setListItem] = useState(dataItem ?? []);
    const [selectItems, setSelectItems] = useState([]);

    const [isPrintTem, setIsPrintTem] = useState(false);
    const [lisTemItem, setLisTemItem] = useState();
    const [loadingButton, setLoading] = useState(false);
    //kiểm tra chọn tất cả
    let isAllSelected = false;
    if (dataItem.length > 0) {
        isAllSelected = selectItems.length === listItem.length;
    }

    //kiểm nếu có 1 tem có quality < 0 thì ko cho chọn tất cả
    let disableSelectAll = false;
    const isNotSelected = listItem.some((item) => item.quality === 0);
    if (isNotSelected) {
        disableSelectAll = true;
    } else {
        disableSelectAll = false;
    }

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectItems(listItem); // chọn tất cả
        } else {
            setSelectItems([]); // bỏ chọn tất cả
        }
    };

    const handleSelectItem = (item, checked) => {
        if (checked) {
            setSelectItems((prev) => [...prev, item]);
        } else {
            setSelectItems((prev) => prev.filter((i) => i.idItem !== item.idItem));
        }
    };

    const handleTemTotal = (id, value) => {
        //set lại list item
        setListItem((prev) =>
            prev.map((item) =>
                item.idItem === id ? { ...item, quality: value } : item
            )
        );

        const isSelected = selectItems.some((item) => item.idItem === id);
        // Trường hợp value <= 0 → bỏ chọn nếu đang chọn
        if (value <= 0) {
            if (isSelected) {
                setSelectItems((prev) => prev.filter((item) => item.idItem !== id));
            }
            return;
        }

        // Trường hợp value > 0  và đã được tích chọn
        if (isSelected) {
            setSelectItems((prev) =>
                prev.map((item) =>
                    item.idItem === id ? { ...item, quality: value } : item
                )
            );
        } else {
            // chưa tích chọn tăng giảm để chọn
            const itemToAdd = listItem.find((item) => item.idItem === id);
            if (itemToAdd) {
                setSelectItems((prev) => [...prev, { ...itemToAdd, quality: value }]);
            }
        }
    };

    const handlePrint = async (type) => {
        setLoading(true);
        if (type === "showTem") {
            let formData = new FormData();
            const parseDate = (dateStr) => {
                const [day, month, year] = dateStr.split("/");
                return `${year}-${month}-${day}`;
            };
            const formatData = selectItems.map((item, index) => {
                return {
                    ...item,
                    expiration_date: item.expiration_date
                        ? parseDate(item.expiration_date)
                        : null,
                };
            });
            formatData.forEach((item, index) => {
                formData.append(`id`, idManufacture);
                formData.append(`data[${index}][id]`, item.id);
                formData.append(`data[${index}][code]`, item.item_code);
                formData.append(`data[${index}][name]`, item.item_name);
                formData.append(`data[${index}][variant_main]`, item.item_variation);
                formData.append(`data[${index}][lot]`, item.lot || "");
                formData.append(`data[${index}][date]`, item.expiration_date || "");
                formData.append(`data[${index}][serial]`, item.serial || "");
                formData.append(`data[${index}][quality]`, item.quality);
            });

            // // 👉 Log FormData
            // for (let pair of formData.entries()) {
            //     console.log(pair[0] + ": " + pair[1]);
            // }
            try {
                const response = await apiProducts.apiPrintItemsManufactures(formData);
                if (response.isSuccess === 1) {
                    setLisTemItem(response);
                    setIsPrintTem(true);
                    setLoading(false);
                }
            } catch (error) {
                setLoading(false);
                throw new Error(error);
            }
        } else {
            window.open(lisTemItem?.pdf_url, "_blank");
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                boxShadow: `0px 20px 40px -8px rgba(16, 24, 40, 0.1)`,
            }}
            className={` bg-[#ffffff] xlg:p-9 p-8 lg:p-7 rounded-[24px] min-w-[700px] max-w-[700px] h-fit relative flex flex-col justify-center items-center ${deca.className} gap-y-6`}
        >
            <div className="flex flex-row justify-between items-center w-full ">
                <div className="flex flex-row justify-start items-center flex-1 gap-x-6">
                    {isPrintTem && (
                        <div
                            className="w-fit text-[#9295A4]"
                            onClick={() => setIsPrintTem(false)}
                        >
                            <BackIcon />
                        </div>
                    )}
                    <div className="flex flex-col items-start">
                        <p className="text-typo-black-1 font-bold text-2xl capitalize">
                            {isPrintTem ? "Mẫu tem in của bạn" : "In tem thành phẩm"}
                        </p>
                        {isPrintTem && (
                            <p className="text-typo-blue-4 text-base font-medium">
                                {`(${selectItems?.length} sản phẩm)`}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex flex-row justify-between items-center gap-x-2">
                    {/* <button
                        className={twMerge(
                            "flex flex-row gap-x-2 px-3 py-[10px] justify-center items-center text-white font-medium text-sm  rounded-lg",
                            selectItems.length <= 0
                                ? "bg-gray-200 cursor-not-allowed"
                                : "bg-background-blue-2  cursor-pointer"
                        )}
                        onClick={() => handlePrint(isPrintTem ? "printTem" : "showTem")}
                        disabled={selectItems.length <= 0}
                    >
                        <PrinterIcon2 /> In tem
                    </button> */}
                    <ButtonAnimationNew
                        icon={
                            <div className="size-4">
                                <PrinterIcon2 className="size-full" />
                            </div>
                        }
                        title="In tem"
                        className={twMerge(
                            "3xl:h-10 h-9 xl:px-4 px-2 flex items-center gap-2 xl:text-sm text-white font-medium text-sm  rounded-lg bg-background-blue-2 border ",
                            selectItems.length <= 0 || loadingButton
                                ? "border-transparent"
                                : "hover:bg-[#F7F8F9] hover:shadow-hover-button hover:border-[#25387A] hover:text-[#25387A] "
                        )}
                        onClick={() => handlePrint(isPrintTem ? "printTem" : "showTem")}
                        isLoading={loadingButton}
                        disabled={selectItems.length <= 0 || loadingButton}
                    />
                    <button
                        onClick={() => {
                            dispatch({
                                type: "statePopupGlobal",
                                payload: {
                                    open: false,
                                },
                            });
                        }}
                        className="flex flex-col items-center justify-center transition rounded-full outline-none hover:opacity-80 hover:scale-105 mb-2"
                    >
                        <IconClose className="rotate-45" color="#9295A4" size={34} />
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-0 h-full w-full">
                {isPrintTem ? (
                    <div className="relative w-full">
                        <Carousel lisTemItem={lisTemItem} />
                    </div>
                ) : (
                    <Customscrollbar
                        className={`min-h-0 h-full w-full overflow-x-auto bg-white`}
                    >
                        <div>
                            <HeaderTable
                                gridCols={12}
                                display={"grid"}
                                className="pt-0 px-2 pb-1"
                            >
                                <ColumnTable
                                    colSpan={1}
                                    textAlign={"center"}
                                    className={`normal-case leading-2 text-typo-gray-5 3xl:!text-[14px] xl:text-[11px] px-0`}
                                >
                                    <div className="w-full flex justify-center items-center">
                                        <CheckboxDefault
                                            checked={isAllSelected}
                                            onChange={handleSelectAll}
                                            disabled={disableSelectAll}
                                        />
                                    </div>
                                </ColumnTable>
                                <ColumnTable
                                    colSpan={1}
                                    textAlign={"center"}
                                    className={`border-none normal-case leading-2 text-typo-gray-1 3xl:px-3 px-1 std:!text-[13px] xl:text-[11px]`}
                                >
                                    STT
                                </ColumnTable>
                                <ColumnTable
                                    colSpan={7}
                                    textAlign={"start"}
                                    className={`border-none  normal-case leading-2 text-typo-gray-1 std:!text-[13px] xl:text-[11px]`}
                                >
                                    Thành Phẩm
                                </ColumnTable>
                                <ColumnTable
                                    colSpan={3}
                                    textAlign={"center"}
                                    className={`px-0 border-none normal-case leading-2 text-typo-gray-1 std:!text-[13px] xl:text-[11px]`}
                                >
                                    SL tem in
                                </ColumnTable>
                            </HeaderTable>
                            <div className="divide-y divide-slate-200 h-[100%] ">
                                {listItem.length > 0 ? (
                                    listItem.map((item, index) => (
                                        <RowTable gridCols={12} key={item.idItem}>
                                            <RowItemTable
                                                colSpan={1}
                                                textAlign={"center"}
                                                // textSize={`"!text-sm"`}
                                                className="font-semibold xlg:text-sm leading-2 text-typo-black-1  std:!text-[12px] xl:text-[11px]"
                                            >
                                                <div className="w-full flex justify-center items-center">
                                                    <CheckboxDefault
                                                        checked={selectItems.some(
                                                            (i) => i.idItem === item.idItem
                                                        )}
                                                        onChange={(checked) =>
                                                            handleSelectItem(item, checked)
                                                        }
                                                        disabled={item.quality <= 0}
                                                    />
                                                </div>
                                            </RowItemTable>

                                            {/* stt */}
                                            <RowItemTable
                                                colSpan={1}
                                                textAlign={"center"}
                                                // textSize={`"!text-sm"`}
                                                className="font-semibold xlg:text-sm leading-2 text-typo-black-1  std:!text-[12px] xl:text-[11px] pr-3"
                                            >
                                                {index + 1}
                                            </RowItemTable>
                                            <RowItemTable
                                                colSpan={7}
                                                textAlign={"start"}
                                            // textSize={`"!text-xs"`}
                                            >
                                                {/* card */}
                                                <Cardtable
                                                    lot={item?.lot}
                                                    name={item?.item_name}
                                                    typeTable="temProducts"
                                                    // classNameImage="2xl:size-10 size-8"
                                                    imageURL={item?.images}
                                                    classNameContent="gap-y-0"
                                                    date={item?.expiration_date}
                                                    variation={item?.item_variation}
                                                    serial={item?.serial}
                                                    warehouse_name={item?.warehouse_name}
                                                    location_name={item?.location_name}
                                                />
                                            </RowItemTable>

                                            <RowItemTable
                                                colSpan={3}
                                                textAlign={"center"}
                                            // textSize={`"!text-sm"`}
                                            // className="font-semibold  leading-2 text-typo-black-1 std:text-[12px] xl:text-[11px]"
                                            >
                                                <div className="w-full items-center flex justify-center">
                                                    <InputNumberCustom
                                                        state={item?.quality}
                                                        setState={(value) =>
                                                            handleTemTotal(item.idItem, value)
                                                        }
                                                        classNameButton="rounded-full bg-[#EBF5FF] hover:bg-[#C7DFFB]"
                                                        className="p-[4px]"
                                                    // disabled={
                                                    //     !selectItems.some((i) => i.idItem === item.idItem)
                                                    // }
                                                    />
                                                </div>
                                            </RowItemTable>
                                        </RowTable>
                                    ))
                                ) : (
                                    <>
                                        <NoData className="mt-0 col-span-16" type="table" />
                                    </>
                                )}
                            </div>
                        </div>
                    </Customscrollbar>
                )}
            </div>
        </div>
    );
};

export default PopupPrintTemProduct;
