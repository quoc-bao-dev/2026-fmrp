"use client";
import apiInventory from "@/Api/apiManufacture/manufacture/inventory/apiInventory";
import ButtonAnimationNew from "@/components/common/button/ButtonAnimationNew";
import Cardtable from "@/components/common/card/Cardtable";
import Carousel from "@/components/common/carousel/Carousel";
import CheckboxDefault from "@/components/common/checkbox/CheckboxDefault";
import InputNumberCustom from "@/components/common/input/InputNumberCustom";
import BackIcon from "@/components/icons/common/BackIcon";
import PrinterIcon2 from "@/components/icons/common/PrinterIcon2";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import {
  ColumnTable,
  HeaderTable,
  RowItemTable,
  RowTable,
} from "@/components/UI/common/Table";
import NoData from "@/components/UI/noData/nodata";
import useToast from "@/hooks/useToast";
import { Lexend_Deca } from "@next/font/google";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { Add as IconClose } from "iconsax-react";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { twMerge } from "tailwind-merge";
import { useInventoryDetail } from "../hooks/useInventoryDetail";
dayjs.extend(customParseFormat);

const deca = Lexend_Deca({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const PopupPrintTemInventory = ({ id, onClose }) => {
  const showToat = useToast();

  const [open, setOpen] = useState(true);
  const { data, isFetching } = useInventoryDetail(open, id);
  const dispatch = useDispatch();
  const [listItem, setListItem] = useState({});
  const [selectItems, setSelectItems] = useState([]);
  const [isPrintTem, setIsPrintTem] = useState(false);
  const [lisTemItem, setLisTemItem] = useState();
  const [loadingButton, setLoading] = useState(false);
  const [itemQuantities, setItemQuantities] = useState({});

  // Cập nhật listItem khi data từ API trả về
  useEffect(() => {
    if (data && !isFetching && data.items) {
      // Thiết lập mặc định số lượng là 1 cho tất cả items
      const initialQuantities = {};
      data.items.forEach(item => {
        initialQuantities[item.id] = 1;
      });
      setItemQuantities(initialQuantities);
      setListItem([data.items]);
    }
  }, [data, isFetching]);

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    // Nếu dateStr đã là format YYYY-MM-DD thì giữ nguyên, nếu là DD-MM-YYYY thì convert
    if (dateStr.includes("-")) {
      const parts = dateStr.split("-");
      if (parts.length === 3) {
        // Kiểm tra format DD-MM-YYYY
        if (parts[0].length === 2 && parts[2].length === 4) {
          const [day, month, year] = parts;
          return `${year}/${month}/${day}`;
        }
        // Nếu là YYYY-MM-DD thì convert sang YYYY/MM/DD
        if (parts[0].length === 4) {
          return dateStr.replace(/-/g, "/");
        }
      }
    }
    return dateStr;
  };

  //kiểm tra chọn tất cả
  let isAllSelected = false;
  if (listItem.length > 0 && listItem[0]?.length > 0) {
    isAllSelected = selectItems.length === listItem[0].length;
  }

  //kiểm nếu có 1 tem có quantity <= 0 thì ko cho chọn tất cả
  let disableSelectAll = false;
  const isNotSelected = listItem[0]?.some((item) => (item?.quantity_net || 0) <= 0);
  if (isNotSelected) {
    disableSelectAll = true;
  } else {
    disableSelectAll = false;
  }

  const handleSelectAll = (checked) => {
    if (checked) {
      // Đảm bảo tất cả các item đều có quantity = 1 khi chọn tất cả
      const itemsWithDefaultQuantity = listItem[0].map(item => ({
        ...item,
        quantity: 1
      }));
      setSelectItems(itemsWithDefaultQuantity);
    } else {
      setSelectItems([]); // bỏ chọn tất cả
    }
  };

  const handleSelectItem = (item, checked) => {
    if (checked) {
      // Đảm bảo item được chọn có quantity = 1
      setSelectItems((prev) => [...prev, { ...item, quantity: 1 }]); 
    } else {
      setSelectItems((prev) => prev.filter((i) => i.id !== item.id));
    }
  };

  const handleTemTotal = (id, value) => {
    //set lại list item
    setItemQuantities(prev => ({
      ...prev,
      [id]: value
    }));

    // Trường hợp value <= 0 → bỏ chọn item này
    if (value <= 0) {
      setSelectItems((prev) => prev.filter((item) => item.id !== id));
      return;
    }

    // Kiểm tra xem item này đã được chọn chưa
    const isSelected = selectItems.some((item) => item.id === id);

    // Trường hợp value > 0 và item chưa được chọn → thêm vào danh sách chọn
    if (!isSelected) {
      if (!listItem || !listItem[0]) return;
      const itemToAdd = listItem[0].find((item) => item.id === id);
      if (itemToAdd) {
        setSelectItems((prev) => [...prev, { ...itemToAdd, quantity: value }]);
      }
    } else {
      // Nếu item đã được chọn → cập nhật số lượng
      setSelectItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity: value } : item
        )
      );
    }
  };

  const handlePrint = async (type) => {
    setLoading(true);
    if (type === "showTem") {
      let formData = new FormData();
      selectItems.forEach((item, index) => {
        formData.append(`id`, id);
        formData.append(`data[${index}][id]`, item.id);
        formData.append(`data[${index}][code]`, item.item?.code || item.item?.item_code || "");
        formData.append(`data[${index}][name]`, item.item?.name || item.item?.item_name || "");
        formData.append(`data[${index}][variant_main]`, item.item?.product_variation || "");
        formData.append(`data[${index}][lot]`, item.lot || "");
        formData.append(`data[${index}][date]`, item.expiration_date || "");
        formData.append(`data[${index}][serial]`, item.serial || "");
        formData.append(`data[${index}][quality]`, item.quantity);
      });

      try {
        const response = await apiInventory.apiPrintTemInventory(formData);
        if (response.isSuccess === 1) {
          setLisTemItem(response);
          setIsPrintTem(true);
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
        showToat("error", error?.message || "Lỗi khi in tem kiểm kê kho");
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
              className="w-fit text-[#9295A4] cursor-pointer"
              onClick={() => setIsPrintTem(false)}
            >
              <BackIcon />
            </div>
          )}
          <div className="flex flex-col items-start">
            <p className="text-typo-black-1 font-bold text-2xl capitalize">
              {isPrintTem ? "Mẫu tem in của bạn" : "In tem kiểm kê kho"}
            </p>
            {isPrintTem && (
              <p className="text-typo-blue-4 text-base font-medium">
                {`(${selectItems?.length} sản phẩm)`}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-row justify-between items-center gap-x-2">
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
              if (onClose) {
                onClose();
              } else {
                dispatch({
                  type: "statePopupGlobal",
                  payload: {
                    open: false,
                  },
                });
              }
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
            className={`min-h-0 h-full w-full overflow-x-auto bg-white max-h-[60vh]`}
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
                  Sản Phẩm
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
                {isFetching ? (
                  <div className="flex items-center justify-center py-8">
                    <p className="text-gray-500">Đang tải...</p>
                  </div>
                ) : listItem.length > 0 && listItem[0]?.length > 0 ? (
                  listItem[0].map((item, index) => (
                    <RowTable gridCols={12} key={item?.id}>
                      <RowItemTable
                        colSpan={1}
                        textAlign={"center"}
                        className="font-semibold xlg:text-sm leading-2 text-typo-black-1  std:!text-[12px] xl:text-[11px]"
                      >
                        <div className="w-full flex justify-center items-center">
                          <CheckboxDefault
                            checked={selectItems.some((i) => i.id === item?.id)}
                            onChange={(checked) =>
                              handleSelectItem(item, checked)
                            }
                            disabled={(item?.quantity_net || 0) <= 0}
                          />
                        </div>
                      </RowItemTable>

                      <RowItemTable
                        colSpan={1}
                        textAlign={"center"}
                        className="font-semibold xlg:text-sm leading-2 text-typo-black-1  std:!text-[12px] xl:text-[11px] pr-3"
                      >
                        {index + 1}
                      </RowItemTable>
                      <RowItemTable colSpan={7} textAlign={"start"}>
                        <Cardtable
                          lot={item?.lot}
                          name={item?.item?.name || item?.item?.item_name}
                          typeTable="temProducts"
                          imageURL={item?.item?.images}
                          classNameContent="gap-y-0"
                          date={parseDate(item?.expiration_date)}
                          variation={item?.item?.product_variation}
                          serial={item?.serial}
                          warehouse_name={item?.warehouse_name || item?.name_location}
                          location_name={item?.location_name}
                        />
                      </RowItemTable>

                      <RowItemTable colSpan={3} textAlign={"center"}>
                        <div className="w-full items-center flex justify-center">
                          <InputNumberCustom
                            state={itemQuantities[item?.id] || 1}
                            setState={(value) =>
                              handleTemTotal(item?.id, value)
                            }
                            classNameButton="rounded-full bg-[#EBF5FF] hover:bg-[#C7DFFB]"
                            className="p-[4px] bg-white"
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

export default PopupPrintTemInventory;

