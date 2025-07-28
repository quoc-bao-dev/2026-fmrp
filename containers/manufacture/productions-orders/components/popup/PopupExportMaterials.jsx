import apiProductionsOrders from "@/Api/apiManufacture/manufacture/productionsOrders/apiProductionsOrders";
import CheckboxDefault from "@/components/common/checkbox/CheckboxDefault";
import CheckCircle from "@/components/icons/common/CheckCircle";
import CheckIcon from "@/components/icons/common/CheckIcon";
import CloseXIcon from "@/components/icons/common/CloseXIcon";
import MagnifyingGlassIcon from "@/components/icons/common/MagnifyingGlassIcon";
import WarningIcon from "@/components/icons/common/WarningIcon";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import useSetingServer from "@/hooks/useConfigNumber";
import useToast from "@/hooks/useToast";
import {
  useHandlingExportTotalPO,
  useListExportProductionOrder,
} from "@/managers/api/productions-order/useExportProduct";
import {
  default as formatNumber,
  default as formatNumberConfig,
} from "@/utils/helpers/formatnumber";
import { Lexend_Deca } from "@next/font/google";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { IoIosAlert } from "react-icons/io";
import { MdArrowDropDown } from "react-icons/md";
import { Tooltip } from "react-tippy";
import { twMerge } from "tailwind-merge";

const deca = Lexend_Deca({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

const formatDate = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

const convertWarehousesToDropdownData = (list_warehouses) => {
  const groups = {};
  list_warehouses.forEach((w) => {
    if (!groups[w.name_warehouse]) {
      groups[w.name_warehouse] = [];
    }
    w.items.forEach((item) => {
      groups[w.name_warehouse].push({
        name_location: item.name_location,
        lot: item.lot,
        expiration_date: item.expiration_date,
        total_quantity: item.total_quantity,
        id_warehouse_custom: item.id_warehouse_custom,
      });
    });
  });
  return Object.entries(groups).map(([label, options]) => ({
    label,
    options,
  }));
};

const CustomDropdownRadioGroup = ({
  data,
  value,
  onChange,
  placeholder = "Chọn kho hàng",
  className = "",
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  let selectedOption, selectedLabelGroup;
  data.forEach((group) => {
    const found = group.options.find(
      (option) => option.id_warehouse_custom === value
    );
    if (found) {
      selectedOption = found;
      selectedLabelGroup = group;
    }
  });

  const displayText = selectedOption
    ? `${selectedLabelGroup.label} - ${selectedOption.name_location}`
    : placeholder;

  return (
    <div className={`relative ${className}`} ref={ref}>
      <button
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={twMerge(
          "flex justify-between items-center w-[300px] text-[#3A3E4C] font-medium border border-[#D0D5DD] px-3 py-2 text-sm bg-white rounded-lg",
          disabled && "opacity-50 cursor-not-allowed pointer-events-none"
        )}
      >
        <span className="truncate">
          {value ? (
            displayText
          ) : (
            <span className="text-[#3A3E4C]">{placeholder}</span>
          )}
        </span>
        <MdArrowDropDown className="text-[#9295A4]" size={25} />
      </button>

      {open && !disabled && (
        <div className="absolute top-full mt-1 left-0 min-w-max w-full rounded-xl bg-[#FFFFFF] shadow-sm border z-50 p-3">
          <Customscrollbar className="max-h-80 ">
            <div className="flex gap-y-2 flex-col">
              {data.map((group, groupIndex) => (
                <div
                  key={groupIndex}
                  className="flex-shrink-0 w-full"
                  // style={{ minWidth: `${minColumnWidth}px` }}
                >
                  <p className="font-semibold text-[#003DA0] uppercase text-xs ">
                    {group.label}
                  </p>
                  <div>
                    {group.options.map((option, idx) => {
                      return (
                        <div
                          key={option.id_warehouse_custom}
                          className="flex items-center gap-2 py-2 rounded cursor-pointer hover:bg-blue-50 transition-colors px-2"
                          onClick={() => {
                            onChange(option);
                            setOpen(false);
                          }}
                        >
                          <div
                            className={twMerge(
                              "w-4 h-4 rounded-full border-2  flex items-center justify-center flex-shrink-0",
                              value === option.id_warehouse_custom
                                ? "border-[#0375F3]"
                                : "border-[#D0D5DD]"
                            )}
                          >
                            {value === option.id_warehouse_custom && (
                              <div className="w-2 h-2 rounded-full bg-[#0375F3]" />
                            )}
                          </div>
                          <div className="flex flex-col gap-2 w-full">
                            <span className="text-[#141522] text-xs font-normal">
                              {option.name_location}
                            </span>
                            <div className="flex gap-2 justify-between">
                              <div className="flex flex-col gap-1">
                                <span className="text-[#3276FA] text-xs font-normal">
                                  LOT: {option.lot}
                                </span>
                                <span className="text-[#3276FA] text-xs font-normal">
                                  Date: {formatDate(option.expiration_date)}
                                </span>
                              </div>
                              <span className="text-neutral-03 text-xs font-normal">
                                Tồn:{" "}
                                {formatNumber(Number(option.total_quantity))}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </Customscrollbar>
        </div>
      )}
    </div>
  );
};

const InputNumberCustom = memo(
  ({
    state = 0,
    setState,
    className,
    classNameButton,
    classNameInput,
    min = 0,
    max = Infinity,
    disabled = false,
    isError = false,
    allowDecimal = true, // Thêm prop cho phép nhập số thập phân
  }) => {
    const [inputValue, setInputValue] = useState(state || 0);
    const [formattedValue, setFormattedValue] = useState(
      formatNumber(state || 0)
    );
    const showToast = useToast();
    const dataSeting = useSetingServer();

    useEffect(() => {
      setInputValue(state || 0);
      setFormattedValue(formatNumber(state || 0));
    }, [state]);

    // Xử lý nhập liệu
    const handleInputChange = useCallback(
      (e) => {
        if (disabled) return;
        const value = e.target.value;

        if (value === "") {
          setInputValue("");
          setFormattedValue("");
          return;
        }

        // Xử lý chuỗi đầu vào dựa vào allowDecimal
        let numericValue;
        if (allowDecimal) {
          // Cho phép nhập số thập phân - Chỉ chấp nhận dấu chấm (.) làm dấu thập phân
          // Loại bỏ tất cả ký tự không phải số hoặc dấu chấm
          numericValue = value.replace(/[^\d.]/g, "");
          
          // Đảm bảo chỉ có một dấu chấm
          const countDecimal = (numericValue.match(/\./g) || []).length;
          if (countDecimal > 1) {
            const lastIndex = numericValue.lastIndexOf('.');
            numericValue = numericValue.substring(0, lastIndex) + 
                          numericValue.charAt(lastIndex) +
                          numericValue.substring(lastIndex + 1).replace(/\./g, '');
          }
        } else {
          // Chỉ nhận số nguyên
          numericValue = value.replace(/\D/g, "");
        }

        if (numericValue === "") {
          setInputValue("");
          setFormattedValue("");
          return;
        }

        // Chuyển đổi chuỗi thành số
        const numValue = allowDecimal 
          ? parseFloat(numericValue) 
          : parseInt(numericValue);
        
        if (numValue > max) {
          showToast(
            "error",
            `Số lượng không được vượt quá ${formatNumber(max)}`
          );
          return;
        }
        
        setInputValue(numValue);

        // Khi đang nhập, hiển thị giá trị đúng định dạng
        // Với số thập phân, giữ nguyên dạng để người dùng tiếp tục nhập
        if (numericValue.endsWith('.')) {
          setFormattedValue(numericValue);
        } else {
          setFormattedValue(formatNumber(numValue));
        }
      },
      [disabled, allowDecimal, max, showToast]
    );

    const parseToNumber = useCallback(
      (value) => {
        if (allowDecimal) {
          // Cho phép nhập số thập phân - chỉ xử lý với dấu chấm
          const cleaned = value.toString().replace(/[^\d.]/g, "");
          const parsed = parseFloat(cleaned);
          return isNaN(parsed) ? min : parsed;
        } else {
          // Chỉ nhận số nguyên
          const cleaned = value.toString().replace(/\D/g, "");
          const parsed = parseInt(cleaned);
          return isNaN(parsed) ? min : parsed;
        }
      },
      [min, allowDecimal]
    );

    // Khi blur, cập nhật lại state cha và format lại
    const handleBlur = useCallback(() => {
      if (inputValue === "") {
        setState(min);
        setInputValue(min);
        setFormattedValue(formatNumber(min));
        return;
      }

      const number = parseToNumber(inputValue);

      if (number < min) {
        setState(min);
        setInputValue(min);
        setFormattedValue(formatNumber(min));
      } else if (number > max) {
        showToast("error", `Số lượng không được vượt quá ${formatNumber(max)}`);
        setState(max);
        setInputValue(max);
        setFormattedValue(formatNumber(max));
      } else {
        setState(number);
        setInputValue(number);
        setFormattedValue(formatNumber(number));
      }
    }, [inputValue, min, max, setState, showToast, parseToNumber]);

    // Cộng/trừ luôn dùng số
    const handleChange = useCallback(
      (type) => {
        if (disabled) return;
        const current = parseToNumber(inputValue);
        let result = current;
        if (type === "increment" && current < max) {
          result = current + 1;
        } else if (type === "increment" && current >= max) {
          showToast(
            "error",
            `Số lượng không được vượt quá ${formatNumber(max)}`
          );
          return;
        }
        if (type === "decrement" && current > min) result = current - 1;
        setState(result);
        setInputValue(result);
        setFormattedValue(formatNumber(result));
      },
      [disabled, inputValue, max, min, setState, showToast, parseToNumber]
    );

    // Khi click nút +/-
    const handleButtonClick = useCallback(
      (e, type) => {
        e.preventDefault();
        e.stopPropagation();

        if (window.getSelection) {
          window.getSelection().removeAllRanges();
        } else if (document.selection) {
          document.selection.empty();
        }

        handleChange(type);
      },
      [handleChange]
    );

    return (
      <div
        className={twMerge(
          "p-2 flex items-center border rounded-full shadow-sm border-[#D0D5DD] w-fit h-fit overflow-hidden bg-white",
          disabled ? "opacity-50 cursor-not-allowed" : "",
          className
        )}
        onMouseDown={(e) => e.preventDefault()}
      >
        <div
          onClick={(e) => handleButtonClick(e, "decrement")}
          onMouseDown={(e) => e.preventDefault()}
          className={twMerge(
            "size-9 rounded-full cursor-pointer bg-primary-05 flex justify-center items-center flex-row",
            classNameButton
          )}
        >
          <FaMinus className="text-[#25387A] hover:text-green-1" size={11} />
        </div>
        <input
          disabled={disabled}
          type="text"
          value={formattedValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onMouseDown={(e) => e.stopPropagation()}
          className={twMerge(
            "w-20 text-center outline-none text-lg font-normal text-[#1B1A18] bg-transparent",
            isError && inputValue > 0 ? "text-red-500" : "",
            classNameInput
          )}
        />
        <div
          onClick={(e) => handleButtonClick(e, "increment")}
          onMouseDown={(e) => e.preventDefault()}
          className={twMerge(
            "size-9 rounded-full cursor-pointer bg-primary-05 flex justify-center items-center flex-row",
            classNameButton
          )}
        >
          <FaPlus className="text-[#25387A] hover:text-green-1" size={10} />
        </div>
      </div>
    );
  }
);

InputNumberCustom.displayName = "InputNumberCustom";

const variantsContent = {
  open: { height: "auto", opacity: 1 },
  closed: { height: 0, opacity: 0 },
};

export const PopupOrderCompleted = ({ onClose, className }) => {
  return (
    <div
      className={`p-9 flex flex-col gap-8 justify-center items-center rounded-3xl w-[610px] bg-neutral-00 ${deca.className} ${className}`}
    >
      <div className="flex items-center gap-2">
        <CheckIcon className="size-6 text-[#1FC583]" />
        <h3 className="text-2xl font-semibold text-[#25387A]">
          Lệnh này đã xuất đủ số lượng
        </h3>
      </div>
      <div className="flex justify-center">
        <Image
          width={267}
          height={200}
          src={"/popup/exportMaterials.png"}
          alt="exportMaterials"
          className="object-cover size-full"
        />
      </div>
      <button
        className="w-full py-3 px-5 rounded-xl bg-gradient-to-b from-[#1FC583] to-[#1F9285] text-white text-lg font-medium"
        onClick={onClose}
      >
        Đồng ý
      </button>
    </div>
  );
};

const CollapseRowWrapper = ({ isOpen, children }) => {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          className=""
          initial="closed"
          animate="open"
          exit="closed"
          variants={variantsContent}
          transition={{ duration: 0.3 }}
        >
          <div>{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const SubProductRow = memo(
  ({
    id,
    isOpen,
    lot,
    date,
    quantity,
    typeOrigin,
    setLotRows,
    updateProductQuantity,
    index,
    warehouse,
    lastIndex,
    listWarehouses,
    total_quantity,
    lotRows,
  }) => {
    const [selectedWarehouse, setSelectedWarehouse] = useState(warehouse ?? "");
    const [inputValue, setInputValue] = useState(total_quantity || 0);
    const showToast = useToast();

    // Thêm biến để kiểm tra xem có phải là semi_products không
    const isSemiProduct = typeOrigin === "semi_products";

    useEffect(() => {
      if (total_quantity !== undefined) {
        setInputValue(total_quantity);
        setLotRows((prev) =>
          prev.map((row) =>
            row.id === id
              ? {
                  ...row,
                  total_quantity: total_quantity,
                  quantity_warehouse: total_quantity,
                  quantity_enter: total_quantity,
                }
              : row
          )
        );
      }
    }, [total_quantity, id, setLotRows]);

    const handleWarehouseChange = (option) => {
      const isDuplicate = lotRows.some(
        (row) =>
          row.id !== id &&
          row.id_warehouse_custom === option.id_warehouse_custom
      );

      if (isDuplicate) {
        showToast("error", "Kho hàng này đã được chọn!");
        setSelectedWarehouse("");
        setInputValue(0);
        setLotRows((prev) =>
          prev.map((row) =>
            row.id === id
              ? {
                  ...row,
                  id_warehouse_custom: "",
                  lot: "",
                  expiration_date: "",
                  total_quantity: 0,
                  quantity_warehouse: 0,
                  quantity_enter: 0,
                  name_location: "",
                }
              : row
          )
        );
        return;
      }

      setSelectedWarehouse(option.id_warehouse_custom);
      setInputValue(option.total_quantity);
      setLotRows((prev) =>
        prev.map((row) =>
          row.id === id
            ? {
                ...row,
                id: option.id_warehouse_custom,
                id_warehouse_custom: option.id_warehouse_custom,
                lot: option.lot,
                expiration_date: option.expiration_date,
                total_quantity: option.total_quantity,
                quantity_warehouse: option.total_quantity,
                quantity_enter: option.total_quantity,
                name_location: option.name_location,
              }
            : row
        )
      );
    };

    const handleQuantityChange = (value) => {
      setInputValue(value);
      setLotRows((prev) => {
        const newLotRows = prev.map((row) =>
          row.id === id
            ? {
                ...row,
                quantity_enter: value,
              }
            : row
        );
        return newLotRows;
      });
    };

    return (
      <tr key={id}>
        <td
          colSpan={12}
          className={twMerge(
            "p-0 !bg-[#EBF5FF80]",
            index === 0 && "border-t border-[#F3F3F4]",
            index === lastIndex && "border-b border-[#F3F3F4]"
          )}
        >
          <CollapseRowWrapper isOpen={isOpen}>
            <table
              className={twMerge(
                "w-full border-separate border-spacing-0",
                isSemiProduct && "opacity-50 !cursor-not-allowed"
              )}
            >
              <tbody>
                <tr>
                  <td className="py-2 px-3 text-center  w-[62px]"></td>
                  <td className="py-2 px-3 text-center w-[62px]"></td>
                  <td className="py-2 px-3 text-left ">
                    <div className=" flex gap-x-4 justify-between items-center">
                      {selectedWarehouse ? (
                        <div className="flex flex-row gap-x-2 text-[#3276FA] text-xs font-normal">
                          <p>LOT: {lot}</p>
                          <p>Date: {formatDate(date)}</p>
                        </div>
                      ) : (
                        <div className="text-xs font-normal text-[#991B1B] flex items-start gap-x-[2px]">
                          <IoIosAlert className="text-[#991B1B]" size={17} />
                          <p>
                            Vui lòng chọn kho hàng của NVL để tiến hành xuất
                            kho!
                          </p>
                        </div>
                      )}
                      <CustomDropdownRadioGroup
                        data={convertWarehousesToDropdownData(
                          listWarehouses || []
                        )}
                        value={selectedWarehouse}
                        onChange={(option) => {
                          if (isSemiProduct) return;
                          handleWarehouseChange(option);
                        }}
                        disabled={isSemiProduct}
                      />
                    </div>
                  </td>
                  <td className="py-2 px-3 text-center w-[200px]">
                    <div className="flex justify-start">
                      <InputNumberCustom
                        state={inputValue}
                        setState={handleQuantityChange}
                        className="bg-white"
                        disabled={isSemiProduct}
                        max={Number(total_quantity) || Infinity}
                        allowDecimal={true}
                      />
                    </div>
                  </td>
                  <td className="py-2 px-3 text-center w-[100px]">
                    <button
                      className={twMerge(
                        "text-gray-400 hover:text-red-600",
                        typeOrigin === "semi_products" &&
                          "opacity-50 cursor-not-allowed hover:text-gray-400"
                      )}
                      onClick={() => {
                        if (typeOrigin === "semi_products") return;
                        setLotRows((prev) =>
                          prev.filter((row) => row.id !== id)
                        );
                      }}
                      disabled={typeOrigin === "semi_products"}
                    >
                      <CloseXIcon className="size-5" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </CollapseRowWrapper>
        </td>
      </tr>
    );
  }
);

const ProductRow = memo(
  ({
    product,
    index,
    handleSelectProduct,
    classNameButton,
    po_id,
    isVisible = true,
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [lotRows, setLotRows] = useState([]);

    // Khởi tạo lotRows khi component mount hoặc product thay đổi
    useEffect(() => {
      if (product.warehouses?.length > 0) {
        setLotRows(
          product.warehouses.map((w) => ({
            ...w,
            id: w.id_warehouse_custom,
            quantity: w.total_quantity || 0,
            list_warehouses: product.list_warehouses || [],
          }))
        );
        setIsOpen(true);
      }
    }, [product]);

    // Cập nhật warehouses của product khi lotRows thay đổi
    useEffect(() => {
      // Chỉ cập nhật nếu lotRows thực sự thay đổi và khác với warehouses hiện tại
      const updatedWarehouses = lotRows.map((row) => ({
        ...row,
        quantity_enter: row.quantity_enter || row.total_quantity || 0,
      }));

      // So sánh với warehouses hiện tại
      const isWarehousesChanged =
        JSON.stringify(updatedWarehouses) !==
        JSON.stringify(product.warehouses);

      if (isWarehousesChanged) {
        product.warehouses = updatedWarehouses;
      }
    }, [lotRows]);

    const handleAddLotRow = async () => {
      setIsOpen(true);
      try {
        const formData = new FormData();
        formData.append("type_item", product.type_item);
        formData.append("type_origin", product.type_origin);
        formData.append(
          "item_variation_option_value_id",
          product.item_variation_option_value_id
        );
        formData.append("pp_id", product.pp_id);
        formData.append("po_id", po_id);
        const res = await apiProductionsOrders.apiGetWarehousesBOM(formData);
        const warehouses = res?.data?.warehouses || [];

        setLotRows((prev) => [
          {
            id: Date.now(),
            lot: "",
            expiration_date: "",
            id_warehouse_custom: "",
            total_quantity: 0,
            quantity: 0,
            quantity_enter: 0,
            list_warehouses: warehouses,
          },
          ...prev,
        ]);
      } catch (err) {
        setLotRows((prev) => [
          {
            id: Date.now(),
            lot: "",
            expiration_date: "",
            id_warehouse_custom: "",
            total_quantity: 0,
            quantity: 0,
            quantity_enter: 0,
            list_warehouses: [],
          },
          ...prev,
        ]);
      }
    };

    return isVisible ? (
      <>
        <tr className="hover:bg-gray-50">
          <td className="py-2 px-3 text-center w-[62px]">
            <CheckboxDefault
              checked={product.selected}
              onChange={(checked) => handleSelectProduct(index, checked)}
              disabled={product.type_origin === "semi_products"}
            />
          </td>
          <td className="py-2 px-3 text-center text-sm font-semibold w-[62px]">
            {index + 1}
          </td>
          <td className="py-2 px-3 text-left">
            <div className="flex gap-2">
              <div className="w-16 h-16 rounded flex items-center justify-center">
                <Image
                  src={product.images || "/icon/default/default.png"}
                  alt={product.name}
                  width={64}
                  height={64}
                  className="object-cover rounded"
                />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-semibold text-[#141522] truncate">
                  {product.item_name}
                </h3>
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] font-normal text-[#667085]">
                    {product.product_variation}
                  </p>
                  <p className="text-xs font-normal text-typo-blue-2">
                    {product.item_code}
                  </p>
                </div>
              </div>
            </div>
          </td>
          <td className="py-2 px-3 text-center w-[200px]">
            <div className="flex  justify-center">
              <div className="text-start">
                <p className="text-[#EE1E1E] font-medium text-lg">
                  {formatNumber(Number(product.quantity_total_quota))}{" "}
                  <span className="text-[#141522] font-medium text-xs">/</span>
                </p>
                <span className="text-[#141522] text-xs font-medium">
                  {product.unit_name_primary}
                </span>
              </div>
            </div>
          </td>
          <td className="py-2 px-3 text-center w-[100px]">
            <div className="flex justify-center">
              {product.type_origin !== "semi_products" && (
                <div
                  onClick={handleAddLotRow}
                  className={twMerge(
                    "min-h-[35px] min-w-[35px] flex justify-center items-center flex-row rounded-full bg-[#EBF5FF] border border-transparent hover:border-[#1760B9] hover:bg-[#D0E8FF] hover:scale-110 transition-all duration-200 ease-out",
                    classNameButton
                  )}
                >
                  <FiPlus
                    className="text-[#003DA0] hover:text-green-1"
                    size={19}
                  />
                </div>
              )}
            </div>
          </td>
        </tr>

        {lotRows.length > 0 ? (
          lotRows.map((lot, index) => (
            <SubProductRow
              key={lot.id}
              id={lot.id}
              lot={lot.lot}
              date={lot.expiration_date}
              quantity={lot.quantity_enter || lot.total_quantity || 0}
              warehouse={lot.id_warehouse_custom}
              isOpen={isOpen}
              index={index}
              setLotRows={setLotRows}
              listWarehouses={lot.list_warehouses ?? product.list_warehouses}
              updateProductQuantity={(i, value) =>
                setLotRows((prev) =>
                  prev.map((row, j) =>
                    j === index
                      ? {
                          ...row,
                          quantity_enter: value,
                        }
                      : row
                  )
                )
              }
              lastIndex={lotRows.length - 1}
              typeOrigin={product.type_origin}
              total_quantity={Number(lot.total_quantity)}
              lotRows={lotRows}
            />
          ))
        ) : (
          <tr>
            <td colSpan={12} className="!bg-[#EBF5FF80]">
              <div className="py-2 text-xs font-normal text-[#991B1B] flex items-center justify-center gap-x-[2px]">
                <IoIosAlert className="text-[#991B1B]" size={17} />
                Vui lòng nhập thêm nguyên vật liệu để tiến hành xuất kho
              </div>
            </td>
          </tr>
        )}
      </>
    ) : null;
  }
);

const PopupExportMaterials = ({ code, onClose, id }) => {
  const { data, isLoading } = useListExportProductionOrder(id);
  const [selectAll, setSelectAll] = useState(false);
  const [products, setProducts] = useState(data?.bom || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);
  const dataSeting = useSetingServer();
  const showToast = useToast();
  const { onSubmit, isLoading: isLoadingSubmit } = useHandlingExportTotalPO();
  const [exportSuccess, setExportSuccess] = useState(0);
  const [isRenderErrorNVL, setIsRenderErrorNVL] = useState(false);
  const [errorNVLData, setErrorNVLData] = useState({ items: [] });

  useEffect(() => {
    if (data?.bom) {
      setProducts(
        data.bom.map((product) => {
          // Xử lý đặc biệt cho semi_products
          if (product.type_origin === "semi_products") {
            // Nếu không có warehouses, tạo một warehouse mặc định
            const defaultWarehouse = {
              type_items: product.type_item,
              item_variation_id: product.item_variation_option_value_id,
              warehouse_id: 0,
              location_id: 0,
              serial: "",
              expiration_date: "",
              lot: "",
              pois_id: 0,
              name_location: "Mặc định",
              name_warehouse: "Mặc định",
              total_quantity: product.quantity_total_quota,
              quantity_warehouse: product.quantity_total_quota,
              quantity_enter: product.quantity_total_quota,
            };

            return {
              ...product,
              selected: true,
              warehouses:
                product.warehouses?.length > 0
                  ? product.warehouses.map((w) => ({
                      ...w,
                      quantity_enter: product.quantity_total_quota,
                      total_quantity: product.quantity_total_quota,
                      quantity_warehouse: product.quantity_total_quota,
                    }))
                  : [defaultWarehouse],
            };
          }

          // Xử lý cho các sản phẩm thông thường
          return {
            ...product,
            selected: false,
            warehouses:
              product.warehouses?.map((w) => ({
                ...w,
                quantity_enter: w.total_quantity || 0,
              })) || [],
          };
        })
      );
    }
  }, [data]);

  //kiểm tra products rỗng
  useEffect(() => {
    if (!isLoading && (!products || products.length === 0)) {
      setShowCompleted(true);
    } else {
      setShowCompleted(false);
    }
  }, [products, isLoading]);

  // useEffect(() => {
  //   if (!searchTerm.trim()) {
  //     setVisibleProducts(products);
  //   } else {
  //     const filtered = products.filter((product) =>
  //       product.item_name.toLowerCase().includes(searchTerm.toLowerCase())
  //     );
  //     setVisibleProducts(filtered);
  //   }
  // }, [searchTerm, products]);

  const formatNumber = (number) => {
    return formatNumberConfig(+number, dataSeting);
  };

  const handleSelectAll = useCallback((checked) => {
    setSelectAll(checked);
    setProducts((prevProducts) =>
      prevProducts.map((product) => ({
        ...product,
        selected: product.type_origin === "semi_products" ? true : checked,
      }))
    );
  }, []);

  const handleSelectProduct = useCallback((index, checked) => {
    setProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      updatedProducts[index] = {
        ...updatedProducts[index],
        selected:
          updatedProducts[index].type_origin === "semi_products"
            ? true
            : checked,
      };

      const allSelected = updatedProducts.every((product) =>
        product.type_origin === "semi_products" ? true : product.selected
      );
      setSelectAll(allSelected);

      return updatedProducts;
    });
  }, []);

  const selectedCount = useMemo(
    () => products.filter((product) => product.selected).length,
    [products]
  );
  const confirmButtonClass = useMemo(
    () =>
      `flex items-center gap-2 text-sm font-medium rounded-lg py-3 px-4 w-fit text-white ${
        selectedCount > 0 ? "bg-background-blue-2" : "bg-neutral-02"
      } `,
    [selectedCount]
  );

  const handleConfirm = async () => {
    try {
      // Lấy tất cả sản phẩm semi_products và sản phẩm được chọn khác
      const selectedProducts = products.filter(
        (product) => product.type_origin === "semi_products" || product.selected
      );

      if (selectedProducts.length === 0) {
        showToast("error", "Vui lòng chọn ít nhất một sản phẩm!");
        return;
      }

      const hasInvalidWarehouse = selectedProducts.some((product) => {
        // Bỏ qua kiểm tra warehouse cho semi_products
        if (product.type_origin === "semi_products") return false;

        const result = !product.warehouses || product.warehouses.length === 0;
        if (result) {
          console.log("Sản phẩm không có kho:", product.item_name);
        }
        return result;
      });

      if (hasInvalidWarehouse) {
        showToast("error", "Vui lòng chọn kho cho tất cả sản phẩm được chọn!");
        return;
      }

      const hasInvalidQuantity = selectedProducts.some((product) => {
        // Bỏ qua kiểm tra số lượng cho semi_products
        if (product.type_origin === "semi_products") return false;

        const result = product.warehouses.some(
          (w) => !w.quantity_enter || w.quantity_enter === 0
        );

        return result;
      });

      if (hasInvalidQuantity) {
        showToast(
          "error",
          "Vui lòng nhập số lượng xuất kho cho ít nhất một kho!"
        );
        return;
      }

      const requestData = {
        po_id: id,
        is_app: 0,
        bom: selectedProducts.map((product) => ({
          type_origin: product.type_origin,
          type_item: product.type_item,
          item_id: product.item_id,
          item_variation_option_value_id:
            product.item_variation_option_value_id,
          item_code: product.item_code,
          item_name: product.item_name,
          product_variation: product.product_variation,
          quantity_total_quota: product.quantity_total_quota,
          quantity_quota_primary: product.quantity_quota_primary,
          quota_exchange: product.quota_exchange,
          images: product.images || "",
          unit_name_primary: product.unit_name_primary,
          unit_name: product.unit_name,
          ppi_id: product.ppi_id,
          pp_id: product.pp_id,
          warehouses:
            product.type_origin === "semi_products"
              ? (product.warehouses || []).map((w) => ({
                  ...w,
                  quantity_enter: product.quantity_total_quota, // Với semi_products, quantity_enter luôn bằng quantity_total_quota
                }))
              : product.warehouses.map((w) => ({
                  type_items: w.type_items,
                  item_variation_id: w.item_variation_id,
                  warehouse_id: w.warehouse_id,
                  location_id: w.location_id,
                  serial: w.serial,
                  expiration_date: w.expiration_date,
                  lot: w.lot,
                  pois_id: w.pois_id,
                  name_location: w.name_location,
                  name_warehouse: w.name_warehouse,
                  total_quantity: w.total_quantity,
                  quantity_warehouse: w.quantity_warehouse,
                  quantity_enter: w.quantity_enter,
                })),
        })),
        bom_semi_keep: data?.bom_semi_keep || {},
        bom_poi: data?.bom_poi || {},
      };

      const response = await onSubmit(requestData);
      if (response?.isSuccess === 1) {
        const totalProductsExported = selectedProducts.length;
        setExportSuccess(totalProductsExported);
        showToast("success", "Xuất kho thành công!");
        setSelectAll(false);
        // Reset error state
        setIsRenderErrorNVL(false);
        setErrorNVLData({ items: [] });
      } else {
        // Xử lý khi có lỗi
        if (response?.data?.errors) {
          setErrorNVLData({ items: response.data.errors });
          setIsRenderErrorNVL(true);
        }
        showToast("error", response?.message || "Có lỗi xảy ra khi xuất kho!");
      }
    } catch (error) {
      console.error("Lỗi khi xuất kho:", error);
      showToast("error", "Có lỗi xảy ra khi xuất kho!");
    }
  };

  // Xử lý tìm kiếm bằng cách kiểm tra từng sản phẩm
  const isProductVisible = useCallback(
    (product) => {
      if (!searchTerm.trim()) return true;
      return product.item_name.toLowerCase().includes(searchTerm.toLowerCase());
    },
    [searchTerm]
  );

  return showCompleted ? (
    <PopupOrderCompleted onClose={onClose} />
  ) : (
    <div
      className={`p-6 flex flex-col gap-6 rounded-3xl w-[90vw] xl:w-[1085px] max-h-[90vh] bg-neutral-00 ${deca.className}`}
    >
      <div className="flex gap-2 justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold capitalize">Xuất kho sản xuất</h2>
          <p className="text-base text-typo-blue-4">{code}</p>
        </div>
        <div className="flex gap-8 items-center">
          <button
            onClick={handleConfirm}
            disabled={selectedCount === 0 || isLoadingSubmit}
            className={confirmButtonClass}
          >
            {isLoadingSubmit ? (
              "Đang xử lý..."
            ) : (
              <>
                <CheckIcon className="size-4" /> Xác nhận{" "}
                {selectedCount > 0 && `(${selectedCount})`}
              </>
            )}
          </button>
          <motion.div
            whileHover={{ scale: 1.2, rotate: 90 }}
            whileTap={{ scale: 0.9, rotate: -90 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="size-6 shrink-0 text-neutral-02 cursor-pointer"
            onClick={onClose}
          >
            <CloseXIcon className="size-full" />
          </motion.div>
        </div>
      </div>
      {/* search */}
      <div className="flex gap-x-2 items-center w-full rounded-lg border border-[#D0D5DD] px-4 py-2 focus-within:border-transparent focus-within:ring-2 focus-within:ring-blue-500">
        <input
          type="text"
          placeholder="Tìm kiếm theo tên nguyên vật liệu"
          className="flex-1 border-none outline-none text-[#3A3E4C] placeholder-gray-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="rounded-lg bg-[#1760B9] p-1">
          <MagnifyingGlassIcon className="size-4 text-white" />
        </button>
      </div>

      {exportSuccess > 0 && (
        <div className="py-2 px-3 flex gap-2 items-center justify-between bg-green-02 border border-green-00 rounded-lg">
          <div className="flex items-center gap-1">
            <CheckCircle className="text-[#064E3B]" />
            <p className="text-sm font-normal text-neutral-07">
              Xin chúc mừng,{" "}
              <span className="font-semibold">{exportSuccess}</span> nguyên vật
              liệu đã được xuất kho thành công.
            </p>
          </div>
          <button
            className="size-4 text-neutral-02"
            onClick={() => setExportSuccess(0)}
          >
            <CloseXIcon className="size-full" />
          </button>
        </div>
      )}

      {isRenderErrorNVL && (
        <div className="py-2 px-3 flex flex-col gap-2 bg-[#FFEEF0] border border-[#991B1B] rounded-lg">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <WarningIcon className="size-5" />
              <h3 className="text-sm font-normal text-neutral-07">
                Thiếu{" "}
                <span className="font-semibold text-[#EE1E1E]">
                  {errorNVLData.items.length}
                </span>{" "}
                nguyên vật liệu
              </h3>
            </div>
            <CloseXIcon
              className="size-5 cursor-pointer"
              onClick={() => setIsRenderErrorNVL(false)}
            />
          </div>
          <div className="flex flex-col gap-1">
            {errorNVLData.items.map((item, index) => (
              <div
                key={index}
                className="px-3 py-1 flex items-center justify-between gap-1"
              >
                <div className="flex items-center gap-2">
                  <Image
                    src={item.images || "/icon/default/default.png"}
                    alt={item.item_name}
                    width={36}
                    height={36}
                    className="object-cover rounded"
                  />
                  <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-semibold text-neutral-07">
                      {item.item_name}
                    </h3>
                    <p className="text-xs font-normal text-neutral-03">
                      {item.product_variation}
                    </p>
                    <div className="flex items-center gap-3 text-neutral-03">
                      <p className="text-xs font-normal text-[#3276FA]">
                        LOT: {item.lot}
                      </p>
                      <p className="text-xs font-normal text-[#3276FA]">
                        Date: {formatDate(item.expiration_date)}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-sm font-normal text-neutral-07">
                  <span className="text-lg font-medium text-[#EE1E1E]">
                    {formatNumber(item.quantity_missing)}
                  </span>
                  /{item.unit_name_primary}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* table */}
      <div className="overflow-hidden">
        <table className="min-w-full border-separate border-spacing-0 table-fixed">
          <thead className="bg-white sticky top-0 z-10">
            <tr>
              <th className="py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[62px]">
                <Tooltip title="Chọn tất cả" position="bottom" arrow={true}>
                  <CheckboxDefault
                    checked={selectAll}
                    onChange={handleSelectAll}
                  />
                </Tooltip>
              </th>
              <th className="py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[62px]">
                STT
              </th>
              <th className="py-2 px-3 border-b border-gray-200 text-left text-sm font-normal text-[#9295A4]">
                Nguyên vật liệu
              </th>
              <th className="py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[200px]">
                Số lượng
              </th>
              <th className="py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[115px]">
                Thao tác
              </th>
            </tr>
          </thead>
        </table>
        <Customscrollbar className="h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
          <table className="min-w-full table-fixed border-separate border-spacing-0">
            <tbody>
              {products.map((product, index) => (
                <ProductRow
                  key={`product-row-${product.id || index}`}
                  product={product}
                  index={index}
                  handleSelectProduct={handleSelectProduct}
                  po_id={id}
                  isVisible={isProductVisible(product)}
                />
              ))}
            </tbody>
          </table>
        </Customscrollbar>
      </div>
    </div>
  );
};

export default PopupExportMaterials;
