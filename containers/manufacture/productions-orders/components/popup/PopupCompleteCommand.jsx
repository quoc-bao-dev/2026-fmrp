import Loading from "@/components/common/loading/loading/LoadingComponent";
import CheckIcon from "@/components/icons/common/CheckIcon";
import CloseXIcon from "@/components/icons/common/CloseXIcon";
import WarningIcon from "@/components/icons/common/WarningIcon";
import { StateContext } from "@/context/_state/productions-orders/StateContext";
import useSetingServer from "@/hooks/useConfigNumber";
import useToast from "@/hooks/useToast";
import {
  useHandlingProductCompleted,
  useProductCompleted,
} from "@/managers/api/productions-order/useProductCompleted";
import { useQRCodProductCompleted } from "@/managers/api/productions-order/useQR";
import {
  default as formatNumber,
  default as formatNumberConfig,
} from "@/utils/helpers/formatnumber";
import { Lexend_Deca } from "@next/font/google";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { Tooltip } from "react-tippy";
import { twMerge } from "tailwind-merge";

const deca = Lexend_Deca({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

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
  }) => {
    const [inputValue, setInputValue] = useState(state || 0);
    const [formattedValue, setFormattedValue] = useState(
      formatNumber(state || 0)
    );

    useEffect(() => {
      setInputValue(state || 0);
      setFormattedValue(formatNumber(state || 0));
    }, [state]);

    const parseToNumber = useCallback(
      (value) => {
        const cleaned = value.toString().replace(/\D/g, "");
        const parsed = parseInt(cleaned);
        return isNaN(parsed) ? min : parsed;
      },
      [min]
    );

    const handleChange = useCallback(
      (type) => {
        if (disabled) return;
        const current = parseToNumber(state);
        let result = current;
        if (type === "increment" && current < max) result = current + 1;
        if (type === "decrement" && current > min) result = current - 1;
        setState(result);
      },
      [disabled, state, parseToNumber, max, min, setState]
    );

    const handleInputChange = useCallback(
      (e) => {
        if (disabled) return;
        const value = e.target.value;

        if (value === "") {
          setInputValue("");
          setFormattedValue("");
          return;
        }

        const numericValue = value.replace(/\D/g, "");

        if (numericValue === "") {
          setInputValue("");
          setFormattedValue("");
          return;
        }

        const numValue = parseInt(numericValue);
        setInputValue(numValue);
        setFormattedValue(formatNumber(numValue));
      },
      [disabled]
    );

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
        setState(max);
        setInputValue(max);
        setFormattedValue(formatNumber(max));
      } else {
        setState(number);
        setInputValue(number);
        setFormattedValue(formatNumber(number));
      }
    }, [inputValue, min, max, parseToNumber, setState]);

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
          "p-2 flex items-center border rounded-full shadow-sm border-[#D0D5DD] w-fit h-fit overflow-hidden",
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
            "w-20 text-center outline-none text-lg font-normal text-secondary-09 bg-transparent",
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

const CheckboxDefault = memo(
  ({
    label,
    checked,
    defaultChecked,
    onChange,
    disabled = false,
    className = "",
  }) => {
    return (
      <label
        className={`inline-flex items-center space-x-2 cursor-pointer ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${className}`}
      >
        <input
          type="checkbox"
          className="peer hidden"
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
        />
        <div
          className={twMerge(
            "w-5 h-5 border-[1px] border-[#D0D5DD] rounded-md flex items-center justify-center transition",
            checked ? "bg-[#0375F3] border-[#0375F3]" : "bg-white"
          )}
        >
          {checked && (
            <svg
              width="12"
              height="9"
              viewBox="0 0 12 9"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-5"
            >
              <path
                d="M10.6663 1L4.24967 7.41667L1.33301 4.5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
        {label && <span className="text-sm text-gray-700">{label}</span>}
      </label>
    );
  }
);

CheckboxDefault.displayName = "CheckboxDefault";

const ProductRow = memo(
  ({
    product,
    index,
    updateProductQuantity,
    updateProductError,
    handleSelectProduct,
  }) => {
    return (
      <tr className="hover:bg-gray-50">
        <td className="py-2 px-3 text-center border-b border-[#F3F3F4]">
          <CheckboxDefault
            checked={product.selected}
            onChange={(checked) => handleSelectProduct(index, checked)}
          />
        </td>
        <td className="py-2 px-3 text-center border-b border-[#F3F3F4] text-sm font-semibold">
          {index + 1}
        </td>
        <td className="py-2 px-3 text-left border-b border-[#F3F3F4]">
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
              <h3 className="text-sm font-semibold text-neutral-07 truncate">
                {product.item_name}
              </h3>
              <div className="flex flex-col gap-0.5">
                <p className="text-[10px] font-normal text-neutral-03">
                  {product.product_variation}
                </p>
                <p className="text-xs font-normal text-typo-blue-2">
                  {product.item_code}
                </p>
                <p className="text-xs font-normal text-typo-blue-2">
                  {product.reference_no_detail}
                </p>
              </div>
            </div>
          </div>
        </td>
        <td className="py-2 px-3 text-center border-b border-[#F3F3F4]">
          <div className="flex justify-center">
            <InputNumberCustom
              state={product.quantity_success}
              setState={(value) => updateProductQuantity(index, value)}
            />
          </div>
        </td>
        <td className="py-2 px-3 text-center border-b border-[#F3F3F4]">
          <div className="flex justify-center">
            <InputNumberCustom
              state={product.error === undefined ? 0 : product.error}
              setState={(value) => updateProductError(index, value)}
              isError={true}
            />
          </div>
        </td>
      </tr>
    );
  }
);

ProductRow.displayName = "ProductRow";

export const PopupOrderCompleted = ({ onClose, className }) => {
  return (
    <div
      className={`p-9 flex flex-col gap-8 justify-center items-center rounded-3xl w-[610px] bg-neutral-00 ${deca.className} ${className}`}
    >
      <div className="w-full flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CheckIcon className="size-5 text-[#1FC583]" />
          <h3 className="text-2xl font-semibold text-[#25387A]">
            Lệnh sản xuất đã được hoàn thành
          </h3>
        </div>
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
      <div className="flex justify-center">
        <Image
          width={267}
          height={200}
          src={"/popup/commandCompleted.webp"}
          alt="commandCompleted"
          className="object-cover size-full"
        />
      </div>
      <p className="text-base text-typo-black-4">
        Xin chúc mừng, lệnh sản xuất của bạn đã được hoàn thành đầy đủ!
      </p>
    </div>
  );
};

const PopupCompleteCommand = ({ onClose }) => {
  const [selectAll, setSelectAll] = useState(false);
  const { isStateProvider } = useContext(StateContext);
  const { data: productCompleted, isLoading } = useProductCompleted(
    isStateProvider?.productionsOrders.idDetailProductionOrder
  );
  const [products, setProducts] = useState([]);

  const { data: QRCode } = useQRCodProductCompleted(
    isStateProvider?.productionsOrders.idDetailProductionOrder
  );
  const showToast = useToast();

  const {
    onSubmit: handleProductCompleted,
    isLoading: isLoadingSubmit,
    isSuccess,
    isError,
    error,
    data,
  } = useHandlingProductCompleted();

  const [isRenderErrorNVL, setIsRenderErrorNVL] = useState(false);
  const [errorNVLData, setErrorNVLData] = useState({
    items: [],
    message: "",
  });

  useEffect(() => {
    if (productCompleted?.data?.items) {
      const itemsWithDefaults = productCompleted.data.items.map((item) => ({
        ...item,
        selected: false,
        quantity_rest: item.quantity_rest || 0,
        quantity_success: item.quantity_rest || 0,
        error: item.error || 0,
      }));
      setProducts(itemsWithDefaults);
      setSelectAll(false);
      console.log(itemsWithDefaults)
    }
  }, [productCompleted]);

  useEffect(() => {
    if (isSuccess && data) {
      const responseData = data;
      if (
        responseData.isSuccess === false &&
        responseData.data &&
        responseData.data.errors
      ) {
        setIsRenderErrorNVL(true);
        setErrorNVLData({
          items: responseData.data.errors || [],
          message: responseData.message || "Số lượng NVL/BTP không đủ để xuất",
        });
        showToast(
          "error",
          responseData.message || "Số lượng NVL/BTP không đủ để xuất"
        );
      } else if (responseData.isSuccess === 1) {
        setIsRenderErrorNVL(false);
        setSelectAll(false);
        showToast(
          "success",
          responseData.message || "Hoàn thành công đoạn thành công"
        );
        
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    }
  }, [isSuccess, data, onClose]);

  const handleConfirm = useCallback(async () => {
    const selectedProducts = products.filter((product) => product.selected);

    try {
      const formatData = selectedProducts.map((product) => ({
        ...product,
        quantity_success: product.quantity_success || 0,
        quantity_error: product.error || 0,
        // quantity1: product.error || 0,
      }));
      await handleProductCompleted({
        po_id: isStateProvider?.productionsOrders.idDetailProductionOrder,
        items: formatData,
      });
    } catch (error) {
      showToast(
        "error",
        error?.message || "Có lỗi xảy ra khi cập nhật sản phẩm hoàn thành!"
      );
    }
  }, [
    products,
    handleProductCompleted,
    isStateProvider?.productionsOrders.idDetailProductionOrder,
    showToast,
  ]);

  const updateProductQuantity = useCallback(
    (index, value) => {
      if (value === 0) {
        showToast("error", "SL đạt không được phép bằng 0!");
        return;
      }

      setProducts((prevProducts) => {
        const updatedProducts = [...prevProducts];
        updatedProducts[index] = {
          ...updatedProducts[index],
          quantity_success: value,
        };
        console.log(updatedProducts)
        return updatedProducts;
      });
    },
    [showToast]
  );

  const updateProductError = useCallback((index, value) => {
    setProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      updatedProducts[index] = {
        ...updatedProducts[index],
        error: value,
      };
      return updatedProducts;
    });
  }, []);

  const handleSelectAll = useCallback((checked) => {
    setSelectAll(checked);
    setProducts((prevProducts) =>
      prevProducts.map((product) => ({
        ...product,
        selected: checked,
      }))
    );
  }, []);

  const handleSelectProduct = useCallback((index, checked) => {
    setProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      updatedProducts[index] = {
        ...updatedProducts[index],
        selected: checked,
      };

      const allSelected = updatedProducts.every((product) => product.selected);
      setSelectAll(allSelected);

      return updatedProducts;
    });
  }, []);

  const selectedCount = useMemo(
    () => products.filter((product) => product.selected).length,
    [products]
  );
  const dataSeting = useSetingServer();

  const formatNumber = (number) => {
    return formatNumberConfig(+number, dataSeting);
  };
  const confirmButtonClass = useMemo(
    () =>
      `flex items-center gap-2 text-sm font-medium rounded-lg py-3 px-4 w-fit text-white ${
        selectedCount > 0 ? "bg-background-blue-2" : "bg-neutral-02"
      } ${isLoadingSubmit ? "opacity-70 cursor-not-allowed" : ""}`,
    [selectedCount, isLoadingSubmit]
  );

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : products.length === 0 ? (
        <PopupOrderCompleted onClose={onClose} />
      ) : (
        <div
          className={`p-6 flex flex-col gap-6 rounded-3xl w-[90vw] xl:w-[1085px] max-h-[90vh] bg-neutral-00 ${deca.className}`}
        >
          <div className="flex gap-2 justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold capitalize">
                Hoàn thành tổng lệnh
              </h2>
              <p className="text-base text-typo-blue-4">
                {QRCode?.data?.reference_no}
              </p>
            </div>
            <div className="flex gap-8 items-center">
              <Tooltip
                title="Quét QR để hoàn thành công đoạn trên app FMRP"
                position="left"
                arrow={true}
              >
                <Image
                  src={QRCode?.data?.qr || "/qrCode/QR.png"}
                  alt="complete-command"
                  width={50}
                  height={50}
                  className="rounded-[4px]"
                />
              </Tooltip>
              <button
                onClick={handleConfirm}
                disabled={selectedCount === 0 || isLoadingSubmit}
                className={confirmButtonClass}
              >
                {isLoadingSubmit ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                ) : (
                  <CheckIcon className="size-4" />
                )}
                {isLoadingSubmit
                  ? "Đang xử lý..."
                  : `Xác nhận${selectedCount > 0 ? ` (${selectedCount})` : ""}`}
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

          {isRenderErrorNVL && (
            <div className="py-2 px-3 flex flex-col gap-2 bg-[#FFEEF0] border border-[#991B1B] rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <WarningIcon className="size-5" />
                  <h3 className="text-sm font-normal text-neutral-07">
                    <span className="font-semibold text-[#EE1E1E]">
                      {errorNVLData.items.length}
                    </span>{" "}
                    nguyên vật liệu dưới đây chưa được xuất kho, vui lòng xuất trước khi hoàn thành!
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
                        src={"/icon/default/default.png"}
                        alt="default"
                        width={36}
                        height={36}
                        className="object-cover rounded"
                      />
                      <div className="flex flex-col gap-0.5">
                        <h3 className="text-sm font-semibold text-neutral-07">
                          {item.item_name}
                        </h3>
                        <p className="text-xs font-normal text-neutral-03">
                          {item.product_variation}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-normal text-neutral-07">
                      <span className="text-lg font-medium text-[#EE1E1E]">
                        {formatNumber(item.quantity_missing)}
                      </span>
                      /{item.unit_name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <table className="min-w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th className="py-2 px-3 border-b border-gray-200 text-center text-sm font-semibold text-neutral-02 w-[62px]">
                  <Tooltip title="Chọn tất cả" position="bottom" arrow={true}>
                    <CheckboxDefault
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                  </Tooltip>
                </th>
                <th className="py-2 px-3 border-b border-gray-200 text-center text-sm font-semibold text-neutral-02 w-[62px]">
                  STT
                </th>
                <th className="py-2 px-3 border-b border-gray-200 text-left text-sm font-semibold text-neutral-02">
                  Thành phẩm
                </th>
                <th className="py-2 px-3 border-b border-gray-200 text-center text-sm font-semibold text-neutral-02 w-[200px]">
                  SL đạt
                </th>
                <th className="py-2 px-3 border-b border-gray-200 text-center text-sm font-semibold text-neutral-02 w-[200px]">
                  SL lỗi
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <ProductRow
                  key={`product-row-${product.id || index}`}
                  product={product}
                  index={index}
                  updateProductQuantity={updateProductQuantity}
                  updateProductError={updateProductError}
                  handleSelectProduct={handleSelectProduct}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default PopupCompleteCommand;
