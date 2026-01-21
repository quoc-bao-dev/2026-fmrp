import CheckboxDefault from '@/components/common/checkbox/CheckboxDefault';
import { MagnifyingGlassIcon, PlusIcon, WarningIcon } from '@/components/icons';
import CheckIcon from '@/components/icons/common/CheckIcon';
import CloseXIcon from '@/components/icons/common/CloseXIcon';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import SelectComponent from '@/components/UI/filterComponents/selectComponent';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import { IMAGES } from '@/constants/images';
import { InputNumberCustom } from '@/containers/manufacture/productions-orders/components/popup/PopupCompleteCommand';
import { useHandingFinishedStages } from '@/containers/manufacture/productions-orders/hooks/useHandingFinishedStages';
import { useListFinishedStages } from '@/containers/manufacture/productions-orders/hooks/useListFinishedStages';
import { useLoadOutOfStock } from '@/containers/manufacture/productions-orders/hooks/useLoadOutOfStock';
import useToast from '@/hooks/useToast';
import { useActiveStages } from '@/managers/api/piecework-wage/useImportOutput';
import { useGetQcErrorDetails } from '@/managers/api/qc/useGetQcErrorDetails';
import { searchWithoutDiacritics } from '@/utils/helpers/stringHelper';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import debounce from 'lodash/debounce';
import Image from 'next/image';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PiWarehouseLight } from 'react-icons/pi';
import { Tooltip } from 'react-tippy';
import Popup from 'reactjs-popup';

const ProductRow = memo(({ product, index, updateProductQuantity, updateProductError, handleSelectProduct, errorTags, errorImages, onAddTag, onRemoveTag, onAddImage, onRemoveImage }) => {
  const handleToggleRowSelect = useCallback(() => {
    handleSelectProduct(index, !product.selected);
  }, [index, product.selected, handleSelectProduct]);

  // State riêng cho mỗi row - khởi tạo từ product object nếu có
  const [rowErrorTags, setRowErrorTags] = useState(() => {
    const productIndex = product?.originalIndex ?? index;
    return errorTags[productIndex] || [];
  });
  const [newTagInput, setNewTagInput] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [inputWidth, setInputWidth] = useState(60);
  const [rowErrorImages, setRowErrorImages] = useState(() => {
    const productIndex = product?.originalIndex ?? index;
    const images = errorImages[productIndex] || [];
    return images.map(img => {
      if (typeof img === 'string') {
        return { preview: img, file: null };
      }
      return img;
    });
  });
  const [imageError, setImageError] = useState('');
  const isAddingTagRef = useRef(false);
  const fileInputRef = useRef(null);
  const measureRef = useRef(null);

  // Hook lấy danh sách lỗi QC theo sản phẩm/biến thể
  const { getQcErrorDetails, data: qcErrorDetailsData } = useGetQcErrorDetails({
    onSuccess: data => {
      console.log('QC error details response:', data);
    },
    onError: err => {
      console.error('QC error details error:', err);
    },
  });

  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestions = useMemo(() => qcErrorDetailsData?.data || [], [qcErrorDetailsData]);

  const getQcErrorDetailsRef = useRef(getQcErrorDetails);
  useEffect(() => {
    getQcErrorDetailsRef.current = getQcErrorDetails;
  }, [getQcErrorDetails]);

  const debouncedGetQcErrorDetails = useMemo(
    () =>
      debounce(params => {
        getQcErrorDetailsRef.current?.(params);
      }, 300),
    []
  );

  useEffect(() => {
    return () => {
      debouncedGetQcErrorDetails.cancel();
      // Cleanup preview URLs khi unmount
      rowErrorImages.forEach(img => {
        if (img?.preview && img.preview.startsWith('blob:')) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, [debouncedGetQcErrorDetails]);

  const errorValue = product.error === undefined ? 0 : product.error;
  const hasError = errorValue > 0;
  const productIndex = product?.originalIndex ?? index;

  // Sync state với errorTags và errorImages từ parent
  useEffect(() => {
    const tags = errorTags[productIndex] || [];
    setRowErrorTags(tags);
  }, [errorTags, productIndex]);

  useEffect(() => {
    const images = errorImages[productIndex] || [];
    setRowErrorImages(
      images.map(img => {
        if (typeof img === 'string') {
          return { preview: img, file: null };
        }
        return img;
      })
    );
  }, [errorImages, productIndex]);

  useEffect(() => {
    setShowSuggestions(suggestions.length > 0 && isInputFocused);
  }, [suggestions, isInputFocused]);

  useEffect(() => {
    if (measureRef.current) {
      const width = Math.max(60, measureRef.current.offsetWidth + 0);
      setInputWidth(width);
    }
  }, [newTagInput]);

  // Handlers
  const handleAddTag = useCallback(() => {
    if (isAddingTagRef.current) return;
    if (newTagInput.trim()) {
      isAddingTagRef.current = true;
      const newTag = newTagInput.trim();
      setRowErrorTags(prev => [...prev, newTag]);
      onAddTag(productIndex, newTag);
      setNewTagInput('');
      setInputWidth(60);
      setTimeout(() => {
        isAddingTagRef.current = false;
      }, 100);
    }
  }, [newTagInput, productIndex, onAddTag]);

  const handleKeyDown = useCallback(
    e => {
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        if (newTagInput.trim()) {
          handleAddTag();
        }
        if (e.key === 'Tab') {
          e.target.focus();
        }
        setNewTagInput('');
      }
    },
    [handleAddTag, newTagInput]
  );

  const handleRemoveTag = useCallback(
    tagIndex => {
      setRowErrorTags(prev => prev.filter((_, i) => i !== tagIndex));
      onRemoveTag(productIndex, tagIndex);
    },
    [productIndex, onRemoveTag]
  );

  const handleImageUpload = useCallback(
    e => {
      const files = Array.from(e.target.files || []);
      const MAX_SIZE = 1 * 1024 * 1024; // 1MB
      let hasOversize = false;

      files.forEach(file => {
        if (file.size > MAX_SIZE) {
          hasOversize = true;
          return;
        }
        if (file.type.startsWith('image/')) {
          const preview = URL.createObjectURL(file);
          const imageObj = { file, preview };
          setRowErrorImages(prev => [...prev, imageObj]);
          onAddImage(productIndex, imageObj);
        }
      });

      setImageError(hasOversize ? 'Kích thước ảnh không được vượt quá 1MB' : '');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [productIndex, onAddImage]
  );

  const handleRemoveImage = useCallback(
    imgIndex => {
      setRowErrorImages(prev => {
        const next = [...prev];
        const [removed] = next.splice(imgIndex, 1);
        if (removed?.preview && removed.preview.startsWith('blob:')) {
          URL.revokeObjectURL(removed.preview);
        }
        onRemoveImage(productIndex, imgIndex);
        return next;
      });
    },
    [productIndex, onRemoveImage]
  );

  const handleSuggestionClick = useCallback(
    code => {
      if (code?.trim()) {
        const newTag = code.trim();
        setRowErrorTags(prev => [...prev, newTag]);
        onAddTag(productIndex, newTag);
        setNewTagInput('');
        setShowSuggestions(false);
      }
    },
    [productIndex, onAddTag]
  );

  return (
    <>
      <tr className='hover:bg-gray-50 cursor-pointer' onClick={handleToggleRowSelect}>
        <td className='py-2 text-center border-b border-[#F3F3F4]'>
          <div onClick={e => e.stopPropagation()}>
            <Tooltip title='Chọn' position='bottom' arrow={true}>
              <CheckboxDefault checked={product.selected} onChange={checked => handleSelectProduct(index, checked)} />
            </Tooltip>
          </div>
        </td>
        {/* <td className='py-2 px-3 text-center border-b border-[#F3F3F4] text-sm font-semibold'>{index + 1}</td> */}
        <td className='py-2 px-1 text-left border-b border-[#F3F3F4]'>
          <div className='flex gap-2'>
            <div className='w-16 h-16 rounded flex items-center justify-center'>
              <Image src={product.images || '/icon/default/default.png'} alt={product.item_name} width={200} height={200} className='size-[64px] object-cover rounded' />
            </div>
            <div className='flex flex-col'>
              <h3 className='responsive-text-sm font-semibold text-neutral-07'>{product.item_name}</h3>
              <p className='responsive-text-xxs font-normal text-neutral-03'>{product.product_variation}</p>
              <p className='responsive-text-xs font-normal text-typo-blue-2'>{product.item_code}</p>
              <p className='responsive-text-xs font-normal text-typo-blue-2'>{product.reference_no_detail}</p>
            </div>
          </div>
        </td>
        <td className='py-2 px-1 text-center border-b border-[#F3F3F4]'>
          <div className='flex justify-center'>
            <InputNumberCustom
              state={product.quantity_success}
              setState={value => updateProductQuantity(index, value)}
              allowDecimal={true}
              classNameButton='flex-shrink-0 size-7'
              classNameInput='w-full'
            />
          </div>
        </td>
        <td className='py-2 px-1 text-center border-b border-[#F3F3F4]'>
          <div className='flex justify-center'>
            <InputNumberCustom
              state={errorValue}
              setState={value => updateProductError(index, value)}
              isError={true}
              allowDecimal={true}
              classNameButton='flex-shrink-0 size-7'
              classNameInput='w-full'
            />
          </div>
        </td>
      </tr>
      {/* Phần thông tin lỗi (Tag + Ảnh) cho từng dòng, chỉ hiển thị khi SL lỗi của dòng > 0 */}
      <tr>
        <td colSpan={4} className='p-0 border-0'>
          <AnimatePresence>
            {hasError && (
              <motion.div
                key={`row-error-${product.uniqueId || index}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
                className='bg-gray-50 px-4 py-3 flex flex-col gap-3 w-full'
              >
                {/* Tags Section */}
                <div className='flex flex-col gap-2'>
                  <div className='flex flex-wrap items-center gap-2'>
                    {rowErrorTags.map((tag, tagIndex) => (
                      <span key={tagIndex} className='inline-flex items-center gap-3 px-2 py-1 leading-[20px] bg-blue-100 text-[#141522] rounded-lg text-xs font-medium'>
                        {tag}
                        <button type='button' onClick={() => handleRemoveTag(tagIndex)} className='hover:text-blue-900 focus:outline-none'>
                          <CloseXIcon className='size-4 text-[#003DA0]' />
                        </button>
                      </span>
                    ))}

                    <div className='flex items-center gap-2'>
                      <button
                        type='button'
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
                          isInputFocused ? 'bg-white border border-[#92BFF7] text-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        <div className='relative inline-flex items-center gap-1' style={{ width: `${inputWidth}px`, minWidth: '70px' }}>
                          {!isInputFocused && <PlusIcon className='size-3 flex-shrink-0' />}
                          <span ref={measureRef} className='absolute invisible whitespace-pre text-xs leading-[20px] px-0' style={{ font: 'inherit' }}>
                            {newTagInput || 'Nhập lỗi'}
                          </span>
                          <div className='relative flex-1'>
                            <input
                              type='text'
                              value={newTagInput}
                              onChange={e => {
                                const value = e.target.value;
                                setNewTagInput(value);
                                debouncedGetQcErrorDetails({
                                  item_id: product?.item_id ?? product?.id ?? '',
                                  item_variation_id: product?.item_variation_id ?? product?.item_variation_option_value_id ?? '',
                                  search: value || '',
                                });
                              }}
                              onKeyDown={handleKeyDown}
                              onFocus={() => setIsInputFocused(true)}
                              onBlur={() => {
                                setIsInputFocused(false);
                              }}
                              placeholder='Nhập lỗi'
                              className='w-full leading-[20px] bg-transparent outline-none text-xs'
                            />
                            {isInputFocused && <div className='absolute -bottom-1.5 left-[125%] text-[10px] text-gray-400 truncate'>(Nhấn Enter để nhập tag)</div>}
                            {showSuggestions && (
                              <div className='absolute -left-2 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-[60px] overflow-auto min-w-[80px]'>
                                {suggestions.map(item => (
                                  <button
                                    key={item.id}
                                    type='button'
                                    className='w-full text-left px-3 py-2 text-xs hover:bg-blue-50 truncate'
                                    onMouseDown={e => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }}
                                    onClick={e => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      const code = item.code || '';
                                      if (code.trim()) {
                                        handleSuggestionClick(code.trim());
                                      }
                                      setShowSuggestions(false);
                                    }}
                                  >
                                    {item.code || ''}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Images Section */}
                <div className='flex flex-wrap items-center gap-2'>
                  {rowErrorImages.map((image, imgIndex) => (
                    <div key={imgIndex} className='relative w-[80px] h-[55px] rounded overflow-hidden'>
                      <Image src={image?.preview || '/icon/default/default.png'} alt={`Error ${imgIndex + 1}`} width={80} height={80} className='object-cover w-full h-full' />
                      <button type='button' onClick={() => handleRemoveImage(imgIndex)} className='absolute top-0 right-0 bg-white text-white rounded-full p-1 hover:bg-gray-100'>
                        <svg width='11' height='11' viewBox='0 0 7 7' fill='none' xmlns='http://www.w3.org/2000/svg'>
                          <path
                            d='M6.79406 6.79379C6.68857 6.89928 6.54549 6.95854 6.39631 6.95854C6.24712 6.95854 6.10405 6.89928 5.99856 6.79379L3.47949 4.27472L0.960424 6.79379C0.854935 6.89928 0.711861 6.95854 0.562677 6.95854C0.413492 6.95854 0.270418 6.89928 0.164929 6.79379C0.05944 6.6883 0.000176842 6.54522 0.000177179 6.39604C0.000176842 6.24685 0.05944 6.10378 0.164929 5.99829L2.684 3.47922L0.164929 0.960156C0.05944 0.854667 0.000177137 0.711592 0.000177158 0.562408C0.00017685 0.413224 0.05944 0.27015 0.164929 0.164661C0.270418 0.0591715 0.413492 -9.17209e-05 0.562677 -9.17499e-05C0.711861 -9.1771e-05 0.854935 0.0591714 0.960424 0.164661L3.47949 2.68373L5.99856 0.164661C6.10405 0.0591714 6.24712 -9.1771e-05 6.39631 -9.17499e-05C6.54549 -9.17209e-05 6.68857 0.0591715 6.79406 0.164661C6.89954 0.27015 6.95881 0.413224 6.95881 0.562408C6.95881 0.711592 6.89954 0.854667 6.79406 0.960156L4.27499 3.47922L6.79406 5.99829C6.89954 6.10378 6.95881 6.24685 6.95881 6.39604C6.95881 6.54522 6.89954 6.6883 6.79406 6.79379Z'
                            fill='#444444'
                          />
                        </svg>
                      </button>
                    </div>
                  ))}

                  <button
                    type='button'
                    onClick={() => fileInputRef.current?.click()}
                    className='w-[55px] h-[55px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded hover:border-blue-500 hover:bg-blue-50 transition-colors'
                  >
                    <svg width='28' height='28' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
                      <path
                        d='M8.125 10.8333C8.125 10.336 8.32254 9.85906 8.67417 9.50743C9.02581 9.1558 9.50272 8.95825 10 8.95825C10.4973 8.95825 10.9742 9.1558 11.3258 9.50743C11.6775 9.85906 11.875 10.336 11.875 10.8333C11.875 11.3305 11.6775 11.8074 11.3258 12.1591C10.9742 12.5107 10.4973 12.7083 10 12.7083C9.50272 12.7083 9.02581 12.5107 8.67417 12.1591C8.32254 11.8074 8.125 11.3305 8.125 10.8333Z'
                        fill='#5D5D5D'
                      />
                      <path
                        fillRule='evenodd'
                        clipRule='evenodd'
                        d='M6.22817 6.36833C6.22796 6.02443 6.29553 5.68385 6.42704 5.36608C6.55854 5.04831 6.7514 4.75958 6.99458 4.5164C7.23776 4.27323 7.52649 4.08037 7.84426 3.94886C8.16203 3.81736 8.5026 3.74978 8.84651 3.75H11.1532C11.4971 3.74978 11.8377 3.81736 12.1554 3.94886C12.4732 4.08037 12.7619 4.27323 13.0051 4.5164C13.2483 4.75958 13.4411 5.04831 13.5726 5.36608C13.7042 5.68385 13.7717 6.02443 13.7715 6.36833C13.7717 6.37428 13.7739 6.37998 13.7779 6.38441C13.7819 6.38884 13.7873 6.39171 13.7932 6.3925L15.6515 6.5425C16.484 6.61083 17.1682 7.22583 17.324 8.04667C17.7197 10.1405 17.749 12.287 17.4107 14.3908L17.3298 14.8942C17.2557 15.3553 17.029 15.7783 16.6861 16.0954C16.3431 16.4125 15.9037 16.6054 15.4382 16.6433L13.819 16.7742C11.2771 16.9807 8.7226 16.9807 6.18067 16.7742L4.56151 16.6433C4.09584 16.6054 3.65636 16.4123 3.3134 16.0951C2.97045 15.7778 2.74384 15.3546 2.66984 14.8933L2.58901 14.3908C2.24984 12.2867 2.27984 10.1408 2.67567 8.04667C2.75136 7.64751 2.956 7.28425 3.25814 7.01266C3.56029 6.74108 3.94324 6.57619 4.34817 6.54333L6.20651 6.3925C6.2124 6.39171 6.21782 6.38884 6.2218 6.38441C6.22577 6.37998 6.22803 6.37428 6.22817 6.36833ZM9.99984 7.70833C9.17104 7.70833 8.37618 8.03757 7.79013 8.62362C7.20408 9.20968 6.87484 10.0045 6.87484 10.8333C6.87484 11.6621 7.20408 12.457 7.79013 13.043C8.37618 13.6291 9.17104 13.9583 9.99984 13.9583C10.8286 13.9583 11.6235 13.6291 12.2095 13.043C12.7956 12.457 13.1248 11.6621 13.1248 10.8333C13.1248 10.0045 12.7956 9.20968 12.2095 8.62362C11.6235 8.03757 10.8286 7.70833 9.99984 7.70833Z'
                        fill='#5D5D5D'
                      />
                    </svg>

                    <input ref={fileInputRef} type='file' accept='image/*' multiple onChange={handleImageUpload} className='hidden' />
                  </button>
                </div>
                {imageError && <p className='text-xs text-red-500 mb-2 -mt-2'>{imageError}</p>}
              </motion.div>
            )}
          </AnimatePresence>
        </td>
      </tr>
    </>
  );
});

ProductRow.displayName = 'ProductRow';

const PopupCompleteOrder = ({ stage_id, stage_name, po, isOpen, onClose, is_production_input, timesheet_id, start_date, end_date, is_product, end_timer }) => {
  const showToast = useToast();
  const { onSubmit } = useHandingFinishedStages();
  const queryClient = useQueryClient();

  const { data: dataActiveStages, isLoading: isLoadingActiveStages } = useActiveStages({ po_id: po?.id, stage_id: stage_id, is_product: po?.is_product }, { enabled: isOpen });
  const { data: dataWarehouses, isLoading: isLoadingWarehouses } = useListFinishedStages({
    id: po?.id,
    open: isOpen,
  });
  const { onGetData: onGetDataLoadOutOfStock } = useLoadOutOfStock();

  const [selectAll, setSelectAll] = useState(false);
  const [products, setProducts] = useState([]);
  const [searchProducts, setSearchProducts] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [isWarehouseMissing, setIsWarehouseMissing] = useState(false);
  const [errorTags, setErrorTags] = useState({});
  const [errorImages, setErrorImages] = useState({});
  const [showAutoTooltip, setShowAutoTooltip] = useState(false);
  const [autoTooltipText, setAutoTooltipText] = useState('');
  const [errorNVLData, setErrorNVLData] = useState({ items: [] });
  const [errorNVLDataBefore, setErrorNVLDataBefore] = useState({ items: [] });
  const [isInputPending, setIsInputPending] = useState(false);
  const [dataTableBom, setDataTableBom] = useState(null);
  const hasShownTooltipRef = useRef(false);
  const hasLoadedWarehouseRef = useRef(false);
  const hasLoadedBomRef = useRef(false);

  // Helper function để lưu kho hàng vào localStorage (chung cho tất cả popup)
  const STORAGE_KEY = 'popup_complete_order_warehouse';

  const saveWarehouseToStorage = useCallback(warehouseId => {
    if (warehouseId) {
      try {
        localStorage.setItem(STORAGE_KEY, warehouseId);
      } catch (error) {
        console.error('Error saving warehouse to localStorage:', error);
      }
    }
  }, []);

  const getWarehouseFromStorage = useCallback(() => {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error getting warehouse from localStorage:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (dataActiveStages?.items && Array.isArray(dataActiveStages.items)) {
      const now = Date.now();
      const productsWithUI = dataActiveStages.items.map((item, index) => {
        // Đảm bảo lấy đúng số lượng đạt/lỗi ngay khi mount
        const quantitySuccess = item?.quantity_success ?? item?.quantity_enter ?? 0;
        const quantityError = item?.quantity_error ?? item?.error ?? item?.quantityError ?? 0;

        return {
          ...item,
          images: item.images || IMAGES.noImage,
          quantity_success: quantitySuccess,
          quantityEnterClient: quantitySuccess,
          error: quantityError,
          quantityError: quantityError,
          selected: true, // Tự động chọn tất cả khi mở popup
          originalIndex: index,
          uniqueId: `product-${item.pois_id || item.poi_id || index}`,
          checkOrder: now - index, // Sắp xếp theo thứ tự ban đầu
        };
      });
      setProducts(productsWithUI);
      setSelectAll(true); // Tự động chọn tất cả
    } else if (!isLoadingActiveStages && (!dataActiveStages?.items || dataActiveStages.items.length === 0)) {
      setProducts([]);
      setSelectAll(false);
    }
  }, [dataActiveStages, isLoadingActiveStages]);

  // Tự động chọn tất cả sản phẩm mỗi khi popup được mở
  useEffect(() => {
    if (isOpen && products.length > 0) {
      const now = Date.now();
      setProducts(prevProducts => {
        const updatedProducts = prevProducts.map((product, index) => ({
          ...product,
          selected: true,
          checkOrder: now - (product.originalIndex || index),
        }));

        // Sắp xếp lại: sản phẩm đã chọn lên đầu
        updatedProducts.sort((a, b) => {
          if (a.selected && !b.selected) return -1;
          if (!a.selected && b.selected) return 1;
          if (a.selected && b.selected) {
            return (b.checkOrder || 0) - (a.checkOrder || 0);
          }
          return (a.originalIndex || 0) - (b.originalIndex || 0);
        });

        return updatedProducts;
      });
      setSelectAll(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && products.length > 0 && !hasShownTooltipRef.current) {
      setAutoTooltipText('Chọn thành phẩm để hoàn thành');
      setShowAutoTooltip(false);
      const openDelay = setTimeout(() => {
        setShowAutoTooltip(true);
        hasShownTooltipRef.current = true;
      }, 200);
      const autoCloseTimer = setTimeout(() => {
        setShowAutoTooltip(false);
        setAutoTooltipText('');
      }, 4000);
      return () => {
        clearTimeout(openDelay);
        clearTimeout(autoCloseTimer);
      };
    } else {
      setShowAutoTooltip(false);
      setAutoTooltipText('');
    }
  }, [isOpen, products]);

  useEffect(() => {
    if (!isOpen) {
      hasShownTooltipRef.current = false;
      hasLoadedWarehouseRef.current = false;
      hasLoadedBomRef.current = false;
      setSelectAll(false);
      setSearchProducts('');
      setSelectedWarehouse(null);
      setIsWarehouseMissing(false);
      setErrorTags({});
      setErrorImages({});
      setErrorNVLData({ items: [] });
      setErrorNVLDataBefore({ items: [] });
      setDataTableBom(null);
      setIsInputPending(false);
    }
  }, [isOpen]);

  // Hàm gọi API kiểm tra tồn kho (tương tự onGetBom trong PopupConfimStage)
  const onGetBom = useCallback(
    async items => {
      try {
        setIsInputPending(true);
        const object = {
          isProduct: po?.is_product ? 1 : 0,
          activeStep: {
            type: po?.is_product ? 'TP' : 'BTP',
            item: {
              stage_id: stage_id,
            },
          },
          poId: po?.id,
          arrayMoveBom: [],
        };

        const r = await onGetDataLoadOutOfStock({ object, items });

        if (!r?.data?.boms) {
          setIsInputPending(false);
          return;
        }

        const check = r.data.boms.map(e => {
          const existingBom = dataTableBom?.data?.bomsClientHistory?.find(item => item?.item_id === e?.item_id && item?.pois_id === e?.pois_id);

          return {
            ...e,
            warehouseId: existingBom?.warehouseId || e?.list_warehouse_bom,
          };
        });

        setDataTableBom({
          ...r,
          data: {
            ...r?.data,
            boms: check,
            bomsClientHistory: check,
            bomItemsPod: r?.data?.bomItemsPod || dataTableBom?.data?.bomItemsPod || [],
          },
        });
      } catch (error) {
        console.error('Error in onGetBom:', error);
      } finally {
        setIsInputPending(false);
      }
    },
    [po?.id, po?.is_product, stage_id, onGetDataLoadOutOfStock, dataTableBom]
  );

  const updateProductQuantity = useCallback(
    async (index, value) => {
      setProducts(prevProducts => {
        const updatedProducts = [...prevProducts];
        const product = updatedProducts[index];

        // Tự động chọn sản phẩm khi thay đổi số lượng
        const updatedProduct = {
          ...product,
          quantity_success: value,
          quantityEnterClient: value,
          selected: true,
          checkOrder: Date.now(),
        };

        // Nếu sản phẩm chưa được chọn, di chuyển lên đầu danh sách
        if (!product.selected) {
          updatedProducts.splice(index, 1);
          updatedProducts.unshift(updatedProduct);
        } else {
          updatedProducts[index] = updatedProduct;
        }

        // Sắp xếp lại danh sách: sản phẩm đã chọn lên đầu
        updatedProducts.sort((a, b) => {
          if (a.selected && !b.selected) return -1;
          if (!a.selected && b.selected) return 1;
          if (a.selected && b.selected) {
            return (b.checkOrder || 0) - (a.checkOrder || 0);
          }
          return (a.originalIndex || 0) - (b.originalIndex || 0);
        });

        // Cập nhật selectAll nếu tất cả đều được chọn
        const allSelected = updatedProducts.every(p => p.selected);
        setSelectAll(allSelected);

        // Gọi API kiểm tra tồn kho khi thay đổi số lượng
        onGetBom(updatedProducts);
        return updatedProducts;
      });
    },
    [onGetBom]
  );

  const updateProductError = useCallback(
    async (index, value) => {
      setProducts(prevProducts => {
        const updatedProducts = [...prevProducts];
        const product = updatedProducts[index];

        // Tự động chọn sản phẩm khi thay đổi số lượng lỗi
        const updatedProduct = {
          ...product,
          error: value,
          quantityError: value,
          selected: true,
          checkOrder: Date.now(),
        };

        // Nếu sản phẩm chưa được chọn, di chuyển lên đầu danh sách
        if (!product.selected) {
          updatedProducts.splice(index, 1);
          updatedProducts.unshift(updatedProduct);
        } else {
          updatedProducts[index] = updatedProduct;
        }

        // Sắp xếp lại danh sách: sản phẩm đã chọn lên đầu
        updatedProducts.sort((a, b) => {
          if (a.selected && !b.selected) return -1;
          if (!a.selected && b.selected) return 1;
          if (a.selected && b.selected) {
            return (b.checkOrder || 0) - (a.checkOrder || 0);
          }
          return (a.originalIndex || 0) - (b.originalIndex || 0);
        });

        // Cập nhật selectAll nếu tất cả đều được chọn
        const allSelected = updatedProducts.every(p => p.selected);
        setSelectAll(allSelected);

        // Gọi API kiểm tra tồn kho khi thay đổi số lượng lỗi
        onGetBom(updatedProducts);
        return updatedProducts;
      });
    },
    [onGetBom]
  );

  const handleSelectAll = useCallback(checked => {
    setSelectAll(checked);
    setProducts(prevProducts => {
      const now = Date.now();
      const updatedProducts = prevProducts.map((product, index) => ({
        ...product,
        selected: checked,
        checkOrder: checked ? now - (product.originalIndex || index) : undefined,
      }));

      updatedProducts.sort((a, b) => {
        if (a.selected && !b.selected) return -1;
        if (!a.selected && b.selected) return 1;
        if (a.selected && b.selected) {
          return (b.checkOrder || 0) - (a.checkOrder || 0);
        }
        return (a.originalIndex || 0) - (b.originalIndex || 0);
      });

      // Gọi onGetBom với danh sách đã chọn
      const selectedProducts = updatedProducts.filter(item => item.selected);
      if (selectedProducts.length > 0) {
        onGetBom(selectedProducts);
      }

      return updatedProducts;
    });
  }, [onGetBom]);

  const handleSelectProduct = useCallback((index, checked) => {
    setProducts(prevProducts => {
      const updatedProducts = [...prevProducts];
      const product = updatedProducts[index];

      const updatedProduct = {
        ...product,
        selected: checked,
      };

      if (checked) {
        updatedProducts.splice(index, 1);
        updatedProduct.checkOrder = Date.now();
        updatedProducts.unshift(updatedProduct);
      } else {
        delete updatedProduct.checkOrder;
        updatedProducts[index] = updatedProduct;

        updatedProducts.sort((a, b) => {
          if (a.selected && !b.selected) return -1;
          if (!a.selected && b.selected) return 1;
          if (a.selected && b.selected) {
            return (b.checkOrder || 0) - (a.checkOrder || 0);
          }
          return (a.originalIndex || 0) - (b.originalIndex || 0);
        });
      }

      const allSelected = updatedProducts.every(product => product.selected);
      setSelectAll(allSelected);

      // Gọi onGetBom với danh sách đã chọn
      const selectedProducts = updatedProducts.filter(item => item.selected);
      if (selectedProducts.length > 0) {
        onGetBom(selectedProducts);
      }

      return updatedProducts;
    });
  }, [onGetBom]);

  const handleAddTag = useCallback((index, tag) => {
    setErrorTags(prev => ({
      ...prev,
      [index]: [...(prev[index] || []), tag],
    }));
  }, []);

  const handleRemoveTag = useCallback((index, tagIndex) => {
    setErrorTags(prev => {
      const newTags = { ...prev };
      if (newTags[index]) {
        newTags[index] = newTags[index].filter((_, i) => i !== tagIndex);
        if (newTags[index].length === 0) {
          delete newTags[index];
        }
      }
      return newTags;
    });
  }, []);

  const handleAddImage = useCallback((index, imageObj) => {
    setErrorImages(prev => ({
      ...prev,
      [index]: [...(prev[index] || []), imageObj],
    }));
  }, []);

  const handleRemoveImage = useCallback((index, imageIndex) => {
    setErrorImages(prev => {
      const newImages = { ...prev };
      if (newImages[index]) {
        const [removed] = newImages[index].splice(imageIndex, 1);
        if (removed?.preview) {
          URL.revokeObjectURL(removed.preview);
        }
        if (newImages[index].length === 0) {
          delete newImages[index];
        }
      }
      return newImages;
    });
  }, []);

  const selectedCount = useMemo(() => products.filter(product => product.selected).length, [products]);

  const filteredProducts = useMemo(() => {
    if (!searchProducts.trim()) {
      return products;
    }
    return products.filter(product => {
      return searchWithoutDiacritics(product.item_name || '', searchProducts) || searchWithoutDiacritics(product.item_code || '', searchProducts);
    });
  }, [products, searchProducts]);

  const warehouseOptions = useMemo(() => {
    // Chỉ sử dụng dữ liệu từ API
    if (dataWarehouses?.warehouses && Array.isArray(dataWarehouses.warehouses)) {
      return dataWarehouses.warehouses.map(warehouse => ({
        value: warehouse.id || warehouse.value,
        label: warehouse.name || warehouse.label,
        ...warehouse,
      }));
    }
    // Trả về mảng rỗng nếu chưa có dữ liệu
    return [];
  }, [dataWarehouses?.warehouses]);

  // Tự động chọn kho từ localStorage hoặc từ API khi dữ liệu load xong
  useEffect(() => {
    if (isOpen && warehouseOptions.length > 0 && !isLoadingWarehouses && !hasLoadedWarehouseRef.current) {
      // Ưu tiên: localStorage > warehouse_import_id từ API
      const savedWarehouseId = getWarehouseFromStorage();
      const defaultWarehouseId = savedWarehouseId || dataWarehouses?.warehouse_import_id;

      if (defaultWarehouseId) {
        const foundWarehouse = warehouseOptions.find(w => w.value === defaultWarehouseId || w.id === defaultWarehouseId);
        if (foundWarehouse) {
          setSelectedWarehouse(foundWarehouse);
          // Lưu lại vào localStorage để đảm bảo đồng bộ
          saveWarehouseToStorage(defaultWarehouseId);
        }
      }
      hasLoadedWarehouseRef.current = true;
    }
  }, [isOpen, warehouseOptions, isLoadingWarehouses, dataWarehouses?.warehouse_import_id, getWarehouseFromStorage, saveWarehouseToStorage]);

  const handleWarehouseChange = useCallback(
    option => {
      setSelectedWarehouse(option);
      setIsWarehouseMissing(false);
      // Lưu kho đã chọn vào localStorage
      if (option?.value || option?.id) {
        saveWarehouseToStorage(option.value || option.id);
      } else {
        // Nếu xóa chọn kho, xóa khỏi localStorage
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
          console.error('Error removing warehouse from localStorage:', error);
        }
      }
    },
    [saveWarehouseToStorage]
  );

  const handleConfirm = useCallback(async () => {
    if (isInputPending) {
      showToast('error', 'Vui lòng đợi xử lý dữ liệu hoàn tất');
      return;
    }

    const selectedProducts = products.filter(product => product.selected);

    if (!selectedWarehouse) {
      setIsWarehouseMissing(true);
      showToast('error', 'Vui lòng chọn kho');
      return;
    }

    if (selectedProducts.length === 0) {
      showToast('error', 'Vui lòng chọn ít nhất một sản phẩm');
      return;
    }

    // Chuẩn bị dữ liệu theo cấu trúc useHandingFinishedStages
    const formattedItems =
      selectedProducts.map((product, index) => {
        const quantityEnterClient = product?.quantity_success ?? product?.quantityEnterClient ?? 0;
        const quantityError = product?.error ?? product?.quantityError ?? 0;

        // Lấy tag & ảnh lỗi nếu sau này có UI nhập chi tiết theo từng dòng
        const productIndex = product?.originalIndex ?? index;
        const rowErrorTags = errorTags[productIndex] || [];
        const rowErrorImages = (errorImages[productIndex] || []).map(img => img?.file).filter(Boolean);

        return {
          ...product,
          quantityEnterClient,
          quantityError,
          error_tags: rowErrorTags,
          error_images: rowErrorImages,
        };
      }) || [];

    const payload = {
      poId: po?.id,
      objectData: {
        objectWareHouse: selectedWarehouse,
        dataTableProducts: {
          data: {
            items: formattedItems,
          },
        },
        // Truyền dataTableBom thực tế từ state (đã được cập nhật từ onGetBom)
        dataTableBom: dataTableBom || {
          data: {
            boms: [],
            bomItemsPod: [],
          },
        },
        is_production_input: is_production_input ?? 1,
        timesheet_id: timesheet_id ?? null,
        start_date: start_date ?? null,
        end_date: end_date ?? null,
        is_product: is_product ?? po?.is_product,
        end_timer: end_timer ?? 0,
      },
    };

    const result = await onSubmit(payload);

    if (result?.isSuccess === 1) {
      onClose();
      // Refetch lại list nhập sản lượng khoán sau khi hoàn thành (có socket rồi nên tạm bỏ)
      queryClient.invalidateQueries({ queryKey: ['api_list_import_output'] });
    } else if (result?.data?.errors || result?.data?.errors_before) {
      setErrorNVLData({
        items: [...(result?.data?.errors || [])],
      });
      setErrorNVLDataBefore({
        items: [...(result?.data?.errors_before || [])],
      });
    }
  }, [products, selectedWarehouse, errorTags, errorImages, po?.id, onSubmit, onClose, showToast, queryClient, isInputPending, dataTableBom]);

  // Tự động gọi onGetBom khi popup mở và có products để load bomItemsPod
  useEffect(() => {
    if (isOpen && products.length > 0 && !hasLoadedBomRef.current) {
      hasLoadedBomRef.current = true;
      onGetBom(products);
    }
  }, [isOpen, products.length, onGetBom]);

  return (
    <Popup open={isOpen} closeOnDocumentClick={false} onClose={onClose} className='popup-edit' overlayStyle={{ zIndex: 1100 }}>
      <div className='p-4 flex flex-col gap-4 rounded-3xl w-[700px] max-h-[90vh] bg-neutral-00 font-deca'>
        <div className='flex gap-2 justify-between items-start'>
          <div className='flex flex-col gap-1'>
            <h2 className='responsive-text-2xl font-bold capitalize'>
              Nhập sản lượng công đoạn <span className='text-blue-fmrp'>{stage_name}</span>
            </h2>
            <p className='responsive-text-base text-blue-fmrp'>{po?.reference_no}</p>
          </div>
          <div className='flex flex-col gap-2'>
            <div className='flex gap-2 items-center'>
              <SelectComponent
                options={warehouseOptions}
                value={selectedWarehouse}
                onChange={handleWarehouseChange}
                isClearable={true}
                icon={<PiWarehouseLight color='#9295A4' className='size-4' />}
                closeMenuOnSelect={true}
                hideSelectedOptions={false}
                placeholder={isLoadingWarehouses ? 'Đang tải...' : 'Chọn kho hàng'}
                isLoading={isLoadingWarehouses}
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderRadius: '8px',
                    minHeight: '36px',
                    borderColor: isWarehouseMissing ? '#ef4444' : state.isFocused ? '#0F4F9E' : base.borderColor,
                    boxShadow: 'none',
                    '&:hover': {
                      borderColor: isWarehouseMissing ? '#ef4444' : state.isFocused ? '#0F4F9E' : base.borderColor,
                    },
                  }),
                }}
                isSearchable={true}
              />
              <button onClick={handleConfirm} className='whitespace-nowrap flex items-center gap-2 text-sm font-medium rounded-lg p-2 w-fit text-white bg-blue-fmrp hover:opacity-80'>
                <CheckIcon className='size-4' />
                {`Xác nhận${selectedCount > 0 ? ` (${selectedCount})` : ''}`}
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
            <div className=''>
              <div className='flex gap-x-2 items-center w-full rounded-lg border border-[#D0D5DD] p-1 focus-within:border-transparent focus-within:ring-2 focus-within:ring-blue-500'>
                <input
                  type='text'
                  placeholder='Tìm kiếm theo tên và mã sản phẩm'
                  className='flex-1 border-none outline-none text-[#3A3E4C] placeholder-gray-200 responsive-text-sm'
                  value={searchProducts}
                  onChange={e => setSearchProducts(e.target.value)}
                />
                {searchProducts && (
                  <button type='button' className='rounded-full bg-gray-100 hover:bg-gray-200 text-[#3A3E4C] p-1 transition' aria-label='Xóa tìm kiếm' onClick={() => setSearchProducts('')}>
                    <CloseXIcon className='size-3' />
                  </button>
                )}
                <button type='button' className='rounded-lg bg-[#1760B9] p-1'>
                  <MagnifyingGlassIcon className='size-4 text-white' />
                </button>
              </div>
            </div>
          </div>
        </div>
        {(errorNVLData?.items?.length > 0 || errorNVLDataBefore?.items?.length > 0) && (
          <div className='flex flex-col gap-2'>
            {errorNVLData && errorNVLData?.items?.length > 0 && (
              <div className='py-2 px-3 flex flex-col gap-2 bg-[#FFEEF0] border border-[#991B1B] rounded-lg flex-shrink-0'>
                <div className='flex items-center justify-between gap-2'>
                  <div className='flex items-center gap-1'>
                    <WarningIcon className='size-5' />
                    <h3 className='responsive-text-sm font-normal text-neutral-07'>
                      <span className='font-semibold text-[#EE1E1E]'>{errorNVLData.items.length}</span> nguyên vật liệu dưới đây chưa được xuất kho, vui lòng xuất trước khi hoàn thành!
                    </h3>
                  </div>
                  <CloseXIcon className='size-5 cursor-pointer' onClick={() => setErrorNVLData({ items: [] })} />
                </div>
                <div className='flex flex-col gap-1'>
                  {errorNVLData.items.map((item, index) => (
                    <div key={index} className='px-3 py-1 flex items-center justify-between gap-1'>
                      <div className='flex items-center gap-2'>
                        <Image src={item.images || '/icon/default/default.png'} alt='default' width={36} height={36} className='object-cover rounded' />
                        <div className='flex flex-col'>
                          <h3 className='responsive-text-sm font-semibold text-neutral-07'>{item.item_name}</h3>
                          <p className='responsive-text-xs font-normal text-neutral-03'>{item.product_variation}</p>
                        </div>
                      </div>
                      <p className='responsive-text-sm font-normal text-neutral-07'>
                        <span className='text-lg font-medium text-[#EE1E1E]'>{item.quantity_missing}</span>/{item.unit_name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {errorNVLDataBefore && errorNVLDataBefore?.items?.length > 0 && (
              <div className='py-2 px-3 flex flex-col gap-2 bg-[#FFEEF0] border border-[#991B1B] rounded-lg flex-shrink-0'>
                <div className='flex items-center justify-between gap-2'>
                  <div className='flex items-center gap-1'>
                    <WarningIcon className='size-5' />
                    <h3 className='responsive-text-sm font-normal text-neutral-07'>
                      <span className='font-semibold text-[#EE1E1E]'>{errorNVLDataBefore.items.length}</span> nguyên liệu dưới đây chưa được hoàn thành ở bước trước, vui lòng hoàn thành trước khi đến
                      bước này!
                    </h3>
                  </div>
                  <CloseXIcon className='size-5 cursor-pointer' onClick={() => setErrorNVLDataBefore({ items: [] })} />
                </div>
                <div className='flex flex-col gap-1'>
                  {errorNVLDataBefore.items.map((item, index) => (
                    <div key={index} className='px-3 py-1 flex items-center justify-between gap-1'>
                      <div className='flex items-center gap-2'>
                        <Image src={item.images || '/icon/default/default.png'} alt='default' width={36} height={36} className='object-cover rounded' />
                        <div className='flex flex-col'>
                          <h3 className='responsive-text-sm font-semibold text-neutral-07'>
                            {item.item_name} - <span className='responsive-text-base font-medium text-neutral-03'>({item.stage_name})</span>
                          </h3>
                          <p className='responsive-text-xs font-normal text-neutral-03'>{item.product_variation}</p>
                          <p className='responsive-text-xs font-normal text-typo-blue-2'>{item.reference_no_detail}</p>
                        </div>
                      </div>
                      <p className='responsive-text-sm font-normal text-neutral-07'>
                        <span className='responsive-text-lg font-medium text-[#EE1E1E]'>{item.quantity_missing}</span>/{item.unit_name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <Customscrollbar className='max-h-[60vh] pr-2'>
          <table className='w-full border-separate border-spacing-0 table-fixed'>
            <thead className='sticky top-0 bg-white'>
              <tr>
                <th className='py-2 border-b border-gray-200 text-center text-sm font-semibold text-neutral-02 w-[40px]'>
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
                {/* <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-semibold text-neutral-02 w-[62px]'>STT</th> */}
                <th className='py-2 px-1 border-b border-gray-200 text-left text-sm font-semibold text-neutral-02'>Thành phẩm</th>
                <th className='py-2 px-1 border-b border-gray-200 text-center text-sm font-semibold text-neutral-02 w-[150px]'>SL đạt</th>
                <th className='py-2 px-1 border-b border-gray-200 text-center text-sm font-semibold text-neutral-02 w-[150px]'>SL lỗi</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingActiveStages ? (
                <tr>
                  <td colSpan={4} className='py-8'>
                    <div className='flex items-center justify-center'>
                      <Loading />
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={4} className='py-8'>
                    <NoData type='table' titleText={products.length === 0 ? 'Chưa có sản phẩm' : 'Không tìm thấy sản phẩm'} />
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, index) => (
                  <ProductRow
                    key={product.uniqueId || `product-row-${product.originalIndex !== undefined ? product.originalIndex : index}`}
                    product={product}
                    index={index}
                    updateProductQuantity={updateProductQuantity}
                    updateProductError={updateProductError}
                    handleSelectProduct={handleSelectProduct}
                    errorTags={errorTags}
                    errorImages={errorImages}
                    onAddTag={handleAddTag}
                    onRemoveTag={handleRemoveTag}
                    onAddImage={handleAddImage}
                    onRemoveImage={handleRemoveImage}
                  />
                ))
              )}
            </tbody>
          </table>
        </Customscrollbar>
      </div>
    </Popup>
  );
};

export default PopupCompleteOrder;
