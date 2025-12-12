import CheckboxDefault from '@/components/common/checkbox/CheckboxDefault';
import Loading from '@/components/common/loading/loading/LoadingComponent';
import { WarningIcon } from '@/components/icons';
import CheckIcon from '@/components/icons/common/CheckIcon';
import CloseXIcon from '@/components/icons/common/CloseXIcon';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import SelectComponent from '@/components/UI/filterComponents/selectComponent';
import { StateContext } from '@/context/_state/productions-orders/StateContext';
import useSetingServer from '@/hooks/useConfigNumber';
import useToast from '@/hooks/useToast';
import { useHandlingProductCompleted, useProductCompleted } from '@/managers/api/productions-order/useProductCompleted';
import { useQRCodProductCompleted } from '@/managers/api/productions-order/useQR';
import { default as formatNumber, default as formatNumberConfig } from '@/utils/helpers/formatnumber';
import { Lexend_Deca } from '@next/font/google';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { PiWarehouseLight } from 'react-icons/pi';
import { Tooltip } from 'react-tippy';
import { twMerge } from 'tailwind-merge';

const deca = Lexend_Deca({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
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
    allowDecimal = true, // Thêm prop cho phép nhập số thập phân
  }) => {
    const [inputValue, setInputValue] = useState(state || 0);
    const [formattedValue, setFormattedValue] = useState(formatNumber(state || 0));

    useEffect(() => {
      setInputValue(state || 0);
      setFormattedValue(formatNumber(state || 0));
    }, [state]);

    const dataSeting = useSetingServer();

    const handleInputChange = useCallback(
      e => {
        if (disabled) return;
        const value = e.target.value;

        if (value === '') {
          setInputValue('');
          setFormattedValue('');
          return;
        }

        // Xử lý chuỗi đầu vào dựa vào allowDecimal
        let numericValue;
        if (allowDecimal) {
          // Cho phép nhập số thập phân - Chỉ chấp nhận dấu chấm (.) làm dấu thập phân
          // Loại bỏ tất cả ký tự không phải số hoặc dấu chấm
          numericValue = value.replace(/[^\d.]/g, '');

          // Đảm bảo chỉ có một dấu chấm
          const countDecimal = (numericValue.match(/\./g) || []).length;
          if (countDecimal > 1) {
            const lastIndex = numericValue.lastIndexOf('.');
            numericValue = numericValue.substring(0, lastIndex) + numericValue.charAt(lastIndex) + numericValue.substring(lastIndex + 1).replace(/\./g, '');
          }
        } else {
          // Chỉ nhận số nguyên
          numericValue = value.replace(/\D/g, '');
        }

        if (numericValue === '') {
          setInputValue('');
          setFormattedValue('');
          return;
        }

        // Chuyển đổi chuỗi thành số
        const numValue = allowDecimal ? parseFloat(numericValue) : parseInt(numericValue);

        setInputValue(numValue);

        // Khi đang nhập, hiển thị giá trị đúng định dạng
        // Với số thập phân, giữ nguyên dạng để người dùng tiếp tục nhập
        if (numericValue.endsWith('.')) {
          setFormattedValue(numericValue);
        } else {
          setFormattedValue(formatNumber(numValue));
        }
      },
      [disabled, allowDecimal, dataSeting]
    );

    const parseToNumber = useCallback(
      value => {
        if (allowDecimal) {
          // Cho phép nhập số thập phân - chỉ xử lý với dấu chấm
          const cleaned = value.toString().replace(/[^\d.]/g, '');
          const parsed = parseFloat(cleaned);
          return isNaN(parsed) ? min : parsed;
        } else {
          // Chỉ nhận số nguyên
          const cleaned = value.toString().replace(/\D/g, '');
          const parsed = parseInt(cleaned);
          return isNaN(parsed) ? min : parsed;
        }
      },
      [min, allowDecimal]
    );

    const handleChange = useCallback(
      type => {
        if (disabled) return;
        const current = parseToNumber(state);
        let result = current;
        if (type === 'increment' && current < max) result = current + 1;
        if (type === 'decrement' && current > min) result = current - 1;
        setState(result);
      },
      [disabled, state, parseToNumber, max, min, setState]
    );

    const handleBlur = useCallback(() => {
      if (inputValue === '') {
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
        className={twMerge('p-1 flex items-center border rounded-full shadow-sm border-[#D0D5DD] w-fit h-fit overflow-hidden', disabled ? 'opacity-50 cursor-not-allowed' : '', className)}
        onMouseDown={e => e.preventDefault()}
        onClick={e => e.stopPropagation()}
      >
        <div
          onClick={e => handleButtonClick(e, 'decrement')}
          onMouseDown={e => e.preventDefault()}
          className={twMerge('size-9 rounded-full cursor-pointer bg-primary-05 flex justify-center items-center flex-row', classNameButton)}
        >
          <FaMinus className='text-[#25387A] hover:text-green-1' size={11} />
        </div>
        <input
          disabled={disabled}
          type='text'
          value={formattedValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onMouseDown={e => e.stopPropagation()}
          onClick={e => e.stopPropagation()}
          className={twMerge('w-20 text-center outline-none text-lg font-normal text-secondary-09 bg-transparent', isError && inputValue > 0 ? 'text-red-500' : '', classNameInput)}
        />
        <div
          onClick={e => handleButtonClick(e, 'increment')}
          onMouseDown={e => e.preventDefault()}
          className={twMerge('size-9 rounded-full cursor-pointer bg-primary-05 flex justify-center items-center flex-row', classNameButton)}
        >
          <FaPlus className='text-[#25387A] hover:text-green-1' size={10} />
        </div>
      </div>
    );
  }
);

InputNumberCustom.displayName = 'InputNumberCustom';

// const CheckboxDefault = memo(
//   ({
//     label,
//     checked,
//     defaultChecked,
//     onChange,
//     disabled = false,
//     className = "",
//   }) => {
//     return (
//       <label
//         className={`inline-flex items-center space-x-2 cursor-pointer ${
//           disabled ? "opacity-50 cursor-not-allowed" : ""
//         } ${className}`}
//       >
//         <input
//           type="checkbox"
//           className="peer hidden"
//           checked={checked}
//           defaultChecked={defaultChecked}
//           onChange={(e) => onChange?.(e.target.checked)}
//           disabled={disabled}
//         />
//         <div
//           className={twMerge(
//             "w-5 h-5 border-[1px] border-[#D0D5DD] rounded-md flex items-center justify-center transition",
//             checked ? "bg-[#0375F3] border-[#0375F3]" : "bg-white"
//           )}
//         >
//           {checked && (
//             <svg
//               width="12"
//               height="9"
//               viewBox="0 0 12 9"
//               fill="none"
//               xmlns="http://www.w3.org/2000/svg"
//               className="h-5"
//             >
//               <path
//                 d="M10.6663 1L4.24967 7.41667L1.33301 4.5"
//                 stroke="white"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               />
//             </svg>
//           )}
//         </div>
//         {label && <span className="text-sm text-gray-700">{label}</span>}
//       </label>
//     );
//   }
// );

// CheckboxDefault.displayName = "CheckboxDefault";

const ProductRow = memo(({ product, index, updateProductQuantity, updateProductError, handleSelectProduct }) => {
  const handleToggleRowSelect = useCallback(() => {
    handleSelectProduct(index, !product.selected);
  }, [index, product.selected, handleSelectProduct]);

  return (
    <tr className='hover:bg-gray-50 cursor-pointer' onClick={handleToggleRowSelect}>
      <td className='py-2 px-3 text-center border-b border-[#F3F3F4]'>
        <div onClick={e => e.stopPropagation()}>
          <Tooltip title='Chọn' position='bottom' arrow={true}>
            <CheckboxDefault checked={product.selected} onChange={checked => handleSelectProduct(index, checked)} />
          </Tooltip>
        </div>
      </td>
      <td className='py-2 px-3 text-center border-b border-[#F3F3F4] text-sm font-semibold'>{index + 1}</td>
      <td className='py-2 px-3 text-left border-b border-[#F3F3F4]'>
        <div className='flex gap-2'>
          <div className='w-16 h-16 rounded flex items-center justify-center'>
            <Image src={product.images || '/icon/default/default.png'} alt={product.name} width={64} height={64} className='object-cover rounded' />
          </div>
          <div className='flex flex-col gap-1'>
            <h3 className='text-sm font-semibold text-neutral-07 truncate'>{product.item_name}</h3>
            <div className='flex flex-col gap-0.5'>
              <p className='text-[10px] font-normal text-neutral-03'>{product.product_variation}</p>
              <p className='text-xs font-normal text-typo-blue-2'>{product.item_code}</p>
              <p className='text-xs font-normal text-typo-blue-2'>{product.reference_no_detail}</p>
            </div>
          </div>
        </div>
      </td>
      <td className='py-2 px-3 text-center border-b border-[#F3F3F4]'>
        <div className='flex justify-center'>
          <InputNumberCustom state={product.quantity_success} setState={value => updateProductQuantity(index, value)} allowDecimal={true} />
        </div>
      </td>
      <td className='py-2 px-3 text-center border-b border-[#F3F3F4]'>
        <div className='flex justify-center'>
          <InputNumberCustom state={product.error === undefined ? 0 : product.error} setState={value => updateProductError(index, value)} isError={true} allowDecimal={true} />
        </div>
      </td>
    </tr>
  );
});

ProductRow.displayName = 'ProductRow';

export const PopupOrderCompleted = ({ onClose, className }) => {
  return (
    <div className={`p-9 flex flex-col gap-8 justify-center items-center rounded-3xl w-[610px] bg-neutral-00 ${deca.className} ${className}`}>
      <div className='w-full flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <CheckIcon className='size-5 text-[#1FC583]' />
          <h3 className='text-2xl font-semibold text-[#25387A]'>Lệnh sản xuất đã được hoàn thành</h3>
        </div>
        <motion.div
          whileHover={{ scale: 1.2, rotate: 90 }}
          whileTap={{ scale: 0.9, rotate: -90 }}
          transition={{ type: 'spring', stiffness: 300 }}
          className='size-6 shrink-0 text-neutral-02 cursor-pointer'
          onClick={onClose}
        >
          <CloseXIcon className='size-full' />
        </motion.div>
      </div>
      <div className='flex justify-center'>
        <Image width={267} height={200} src={'/popup/commandCompleted.webp'} alt='commandCompleted' className='object-cover size-full w-[384px]' unoptimized />
      </div>
      <p className='text-base text-typo-black-4'>Xin chúc mừng, lệnh sản xuất của bạn đã được hoàn thành đầy đủ!</p>
    </div>
  );
};

const PopupCompleteCommand = ({ onClose }) => {
  const [selectAll, setSelectAll] = useState(false);
  const { isStateProvider } = useContext(StateContext);
  const { data: productCompleted, isLoading } = useProductCompleted(isStateProvider?.productionsOrders.idDetailProductionOrder);
  const warehouses = productCompleted?.data?.warehouses;
  // console.log(productCompleted)
  const [products, setProducts] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [showAutoTooltip, setShowAutoTooltip] = useState(false);
  const [autoTooltipText, setAutoTooltipText] = useState('');
  const { data: QRCode } = useQRCodProductCompleted(isStateProvider?.productionsOrders.idDetailProductionOrder);
  const showToast = useToast();

  const { onSubmit: handleProductCompleted, isLoading: isLoadingSubmit, isSuccess, isError, error, data } = useHandlingProductCompleted();

  const [isRenderErrorNVL, setIsRenderErrorNVL] = useState(false);
  const [errorNVLData, setErrorNVLData] = useState({
    items: [],
    message: '',
  });
  const hasShownTooltipRef = useRef(false);
  const [isWarehouseMissing, setIsWarehouseMissing] = useState(false);

  // Preload hình ảnh commandCompleted.webp khi component mount
  useEffect(() => {
    const img = document.createElement('img');
    img.src = '/popup/commandCompleted.webp';
  }, []);

  useEffect(() => {
    if (productCompleted?.data?.items) {
      const itemsWithDefaults = productCompleted.data.items.map((item, index) => ({
        ...item,
        selected: false,
        originalIndex: index,
        uniqueId: `product-${item.item_id || item.id || index}-${item.item_variation_option_value_id || item.reference_no_detail || index}-${index}`,
        quantity_rest: item.quantity_rest || 0,
        quantity_success: item.quantity_rest || 0,
        error: item.error || 0,
      }));
      setProducts(itemsWithDefaults);
      setSelectAll(false);
      // Reset flag khi data mới được load
      hasShownTooltipRef.current = false;
    }
  }, [productCompleted]);

  useEffect(() => {
    setSelectedWarehouse(null);
    setIsWarehouseMissing(false);
  }, [warehouses]);

  useEffect(() => {
    // Chỉ hiển thị tooltip một lần khi data mới được load, không phải mỗi lần products thay đổi
    if (!isLoading && productCompleted?.data?.items && productCompleted.data.items.length > 0 && !hasShownTooltipRef.current) {
      setAutoTooltipText('Chọn thành phẩm để hoàn thành');
      // Trì hoãn 1-2 nhịp để DOM anchor render ổn định rồi mới bật tooltip
      setShowAutoTooltip(false);
      let rafId;
      const openDelay = setTimeout(() => {
        rafId = requestAnimationFrame(() => {
          setShowAutoTooltip(true);
          hasShownTooltipRef.current = true;
        });
      }, 200);
      const autoCloseTimer = setTimeout(() => {
        setShowAutoTooltip(false);
        setAutoTooltipText('');
      }, 4000);
      return () => {
        if (rafId) cancelAnimationFrame(rafId);
        clearTimeout(openDelay);
        clearTimeout(autoCloseTimer);
      };
    } else {
      // Nếu đã hiển thị tooltip rồi hoặc không có data, đảm bảo nó không hiển thị
      setShowAutoTooltip(false);
      setAutoTooltipText('');
    }
  }, [isLoading, productCompleted]);

  useEffect(() => {
    if (isSuccess && data) {
      const responseData = data;
      if (responseData.isSuccess === false && responseData.data && responseData.data.errors) {
        setIsRenderErrorNVL(true);
        setErrorNVLData({
          items: responseData.data.errors || [],
          message: responseData.message || 'Số lượng NVL/BTP không đủ để xuất',
        });
        showToast('error', responseData.message || 'Số lượng NVL/BTP không đủ để xuất');
      } else if (responseData.isSuccess === false) {
        setIsRenderErrorNVL(false);
        showToast('error', responseData.message || 'Có lỗi xảy ra khi hoàn thành công đoạn!');
      } else if (responseData.isSuccess === 1) {
        setIsRenderErrorNVL(false);
        setSelectAll(false);
        showToast('success', responseData.message || 'Hoàn thành công đoạn thành công');

        setTimeout(() => {
          onClose();
        }, 2000);
      }
    }
  }, [isSuccess, data, onClose]);

  const handleConfirm = useCallback(async () => {
    if (isLoadingSubmit) return;
    const selectedProducts = products.filter(product => product.selected);

    if (!selectedWarehouse) {
      setIsWarehouseMissing(true);
      showToast('error', 'Vui lòng chọn kho hàng!');
      return;
    }

    // Điều kiện 1: Phải chọn ít nhất 1 sản phẩm
    if (selectedProducts.length === 0) {
      showToast('error', 'Vui lòng chọn ít nhất một thành phẩm để hoàn thành!');
      return;
    }

    // Điều kiện 2: SL đạt > 0 cho tất cả SP được chọn
    const invalidQtyZero = selectedProducts.find(p => !p.quantity_success || Number(p.quantity_success) <= 0);
    if (invalidQtyZero) {
      showToast('error', 'Vui lòng nhập SL đạt lớn hơn 0 cho sản phẩm được chọn!');
      return;
    }

    try {
      const formatData = selectedProducts.map(product => ({
        ...product,
        quantity_success: product.quantity_success || 0,
        quantity_error: product.error || 0,
      }));
      await handleProductCompleted({
        po_id: isStateProvider?.productionsOrders.idDetailProductionOrder,
        warehouse_id: selectedWarehouse?.value,
        items: formatData,
      });
    } catch (error) {
      showToast('error', error?.message || 'Có lỗi xảy ra khi cập nhật sản phẩm hoàn thành!');
    }
  }, [products, handleProductCompleted, isStateProvider?.productionsOrders.idDetailProductionOrder, showToast, isLoadingSubmit, selectedWarehouse, setIsWarehouseMissing]);

  const updateProductQuantity = useCallback(
    (index, value) => {
      if (value === 0) {
        showToast('error', 'SL đạt không được phép bằng 0!');
        return;
      }

      setProducts(prevProducts => {
        const updatedProducts = [...prevProducts];
        updatedProducts[index] = {
          ...updatedProducts[index],
          quantity_success: value,
        };
        return updatedProducts;
      });
    },
    [showToast]
  );

  const updateProductError = useCallback((index, value) => {
    setProducts(prevProducts => {
      const updatedProducts = [...prevProducts];
      updatedProducts[index] = {
        ...updatedProducts[index],
        error: value,
      };
      return updatedProducts;
    });
  }, []);

  const handleSelectAll = useCallback(checked => {
    setSelectAll(checked);
    setProducts(prevProducts => {
      const now = Date.now();
      const updatedProducts = prevProducts.map((product, index) => {
        const updatedProduct = {
          ...product,
          selected: checked,
        };

        // Nếu check, thêm checkOrder (giữ nguyên thứ tự ban đầu bằng cách dùng originalIndex)
        if (checked) {
          updatedProduct.checkOrder = now - (product.originalIndex || index);
        } else {
          // Nếu uncheck, xóa checkOrder
          delete updatedProduct.checkOrder;
        }

        return updatedProduct;
      });

      // Sắp xếp lại: các phần tử được check lên đầu (theo checkOrder), các phần tử uncheck sắp xếp theo originalIndex
      updatedProducts.sort((a, b) => {
        // Phần tử được check luôn ở đầu
        if (a.selected && !b.selected) return -1;
        if (!a.selected && b.selected) return 1;

        // Nếu cả hai đều được check, sắp xếp theo checkOrder (check gần nhất ở đầu)
        if (a.selected && b.selected) {
          return (b.checkOrder || 0) - (a.checkOrder || 0);
        }

        // Cả hai đều uncheck, sắp xếp theo originalIndex
        return (a.originalIndex || 0) - (b.originalIndex || 0);
      });

      return updatedProducts;
    });
  }, []);

  const handleSelectProduct = useCallback((index, checked) => {
    setProducts(prevProducts => {
      const updatedProducts = [...prevProducts];
      const product = updatedProducts[index];

      // Cập nhật trạng thái selected
      const updatedProduct = {
        ...product,
        selected: checked,
      };

      // Nếu được check, chuyển phần tử lên đầu và thêm checkOrder
      if (checked) {
        // Xóa phần tử khỏi vị trí hiện tại
        updatedProducts.splice(index, 1);
        // Thêm checkOrder để giữ thứ tự check
        updatedProduct.checkOrder = Date.now();
        // Chèn vào đầu mảng
        updatedProducts.unshift(updatedProduct);
      } else {
        // Nếu uncheck, xóa checkOrder và cập nhật
        delete updatedProduct.checkOrder;
        updatedProducts[index] = updatedProduct;

        // Sắp xếp lại: các phần tử được check lên đầu (theo checkOrder), các phần tử uncheck sắp xếp theo originalIndex
        updatedProducts.sort((a, b) => {
          // Phần tử được check luôn ở đầu
          if (a.selected && !b.selected) return -1;
          if (!a.selected && b.selected) return 1;

          // Nếu cả hai đều được check, sắp xếp theo checkOrder (check gần nhất ở đầu)
          if (a.selected && b.selected) {
            return (b.checkOrder || 0) - (a.checkOrder || 0);
          }

          // Cả hai đều uncheck, sắp xếp theo originalIndex
          return (a.originalIndex || 0) - (b.originalIndex || 0);
        });
      }

      const allSelected = updatedProducts.every(product => product.selected);
      setSelectAll(allSelected);

      return updatedProducts;
    });
  }, []);

  const selectedCount = useMemo(() => products.filter(product => product.selected).length, [products]);
  const dataSeting = useSetingServer();

  const formatNumber = number => {
    return formatNumberConfig(+number, dataSeting);
  };

  const warehouseImportId = productCompleted?.data?.warehouse_import_id;

  const warehouseOptions = useMemo(() => {
    if (!warehouses) return [];
    return warehouses.map(warehouse => ({
      value: warehouse.id,
      label: warehouse.name,
      ...warehouse,
    }));
  }, [warehouses]);

  useEffect(() => {
    if (!warehouseOptions.length) {
      setSelectedWarehouse(null);
      setIsWarehouseMissing(false);
      return;
    }

    const matchedWarehouse = warehouseOptions.find(option => `${option.value}` === `${warehouseImportId}`);

    setSelectedWarehouse(matchedWarehouse || null);
    setIsWarehouseMissing(false);
  }, [warehouseOptions, warehouseImportId]);

  const handleWarehouseChange = useCallback(option => {
    setSelectedWarehouse(option);
    setIsWarehouseMissing(false);
  }, []);

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : products.length === 0 ? (
        <PopupOrderCompleted onClose={onClose} />
      ) : (
        <div className={`p-6 flex flex-col gap-6 rounded-3xl w-[90vw] xl:w-[1085px] max-h-[90vh] bg-neutral-00 ${deca.className}`}>
          <div className='flex gap-2 justify-between'>
            <div className='flex flex-col gap-1'>
              <h2 className='text-2xl font-bold capitalize'>Hoàn thành tổng lệnh</h2>
              <p className='text-base text-blue-fmrp'>{QRCode?.data?.reference_no}</p>
            </div>
            <div className='flex gap-2 items-center'>
              <SelectComponent
                options={warehouseOptions}
                value={selectedWarehouse}
                onChange={handleWarehouseChange}
                isClearable={true}
                icon={<PiWarehouseLight color='#9295A4' className='size-4' />}
                closeMenuOnSelect={true}
                hideSelectedOptions={false}
                placeholder='Chọn kho hàng'
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderRadius: '8px',
                    borderColor: isWarehouseMissing ? '#ef4444' : state.isFocused ? '#0F4F9E' : base.borderColor,
                    boxShadow: 'none',
                    '&:hover': {
                      borderColor: isWarehouseMissing ? '#ef4444' : state.isFocused ? '#0F4F9E' : base.borderColor,
                    },
                  }),
                }}
                isSearchable={true}
              />
              <Tooltip title='Quét QR để hoàn thành công đoạn trên app FMRP' position='left' arrow={true}>
                <Image src={QRCode?.data?.qr || '/qrCode/QR.png'} alt='complete-command' width={50} height={50} className='rounded-[4px]' />
              </Tooltip>

              <button onClick={handleConfirm} disabled={isLoadingSubmit} className='flex items-center gap-2 text-sm font-medium rounded-lg py-3 px-4 w-fit text-white bg-blue-fmrp'>
                {isLoadingSubmit ? <span className='animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white'></span> : <CheckIcon className='size-4' />}
                {isLoadingSubmit ? 'Đang xử lý...' : `Xác nhận${selectedCount > 0 ? ` (${selectedCount})` : ''}`}
              </button>
              <motion.div
                whileHover={{ scale: 1.2, rotate: 90 }}
                whileTap={{ scale: 0.9, rotate: -90 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className='size-6 shrink-0 text-neutral-02 cursor-pointer'
                onClick={onClose}
              >
                <CloseXIcon className='size-full' />
              </motion.div>
            </div>
          </div>
          <Customscrollbar className='max-h-[60vh] pr-2'>
            {isRenderErrorNVL && (
              <div className='py-2 px-3 flex flex-col gap-2 bg-[#FFEEF0] border border-[#991B1B] rounded-lg'>
                <div className='flex items-center justify-between gap-2'>
                  <div className='flex items-center gap-1'>
                    <WarningIcon className='size-5 text-[#991B1B]' />
                    <h3 className='text-sm font-normal text-neutral-07'>
                      <span className='font-semibold text-[#EE1E1E]'>{errorNVLData.items.length}</span> nguyên vật liệu dưới đây chưa được xuất kho, vui lòng xuất trước khi hoàn thành!
                    </h3>
                  </div>
                  <CloseXIcon className='size-5 cursor-pointer' onClick={() => setIsRenderErrorNVL(false)} />
                </div>
                <div className='flex flex-col gap-1'>
                  {errorNVLData.items.map((item, index) => (
                    <div key={index} className='px-3 py-1 flex items-center justify-between gap-1'>
                      <div className='flex items-center gap-2'>
                        <Image src={'/icon/default/default.png'} alt='default' width={36} height={36} className='object-cover rounded' />
                        <div className='flex flex-col gap-0.5'>
                          <h3 className='text-sm font-semibold text-neutral-07'>{item.item_name}</h3>
                          <p className='text-xs font-normal text-neutral-03'>{item.product_variation}</p>
                        </div>
                      </div>
                      <p className='text-sm font-normal text-neutral-07'>
                        <span className='text-lg font-medium text-[#EE1E1E]'>{formatNumber(item.quantity_missing)}</span>/{item.unit_name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <table className='min-w-full border-separate border-spacing-0'>
              <thead className='sticky top-0 bg-white'>
                <tr>
                  <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-semibold text-neutral-02 w-[62px]'>
                    <Tooltip
                      key={showAutoTooltip ? 'guide-open' : 'guide-closed'}
                      title={autoTooltipText}
                      position='top'
                      arrow={true}
                      trigger='manual'
                      open={showAutoTooltip && !!autoTooltipText}
                      onRequestClose={() => {
                        setShowAutoTooltip(false);
                        setAutoTooltipText('');
                      }}
                    >
                      <span className='inline-flex'>
                        <Tooltip title={'Chọn tất cả'} position='top' arrow={true}>
                          <CheckboxDefault checked={selectAll} onChange={handleSelectAll} />
                        </Tooltip>
                      </span>
                    </Tooltip>
                  </th>
                  <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-semibold text-neutral-02 w-[62px]'>STT</th>
                  <th className='py-2 px-3 border-b border-gray-200 text-left text-sm font-semibold text-neutral-02'>Thành phẩm</th>
                  <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-semibold text-neutral-02 w-[200px]'>SL đạt</th>
                  <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-semibold text-neutral-02 w-[200px]'>SL lỗi</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <ProductRow
                    key={product.uniqueId || `product-row-${product.originalIndex !== undefined ? product.originalIndex : index}`}
                    product={product}
                    index={index}
                    updateProductQuantity={updateProductQuantity}
                    updateProductError={updateProductError}
                    handleSelectProduct={handleSelectProduct}
                  />
                ))}
              </tbody>
            </table>
          </Customscrollbar>
        </div>
      )}
    </>
  );
};

export default PopupCompleteCommand;
