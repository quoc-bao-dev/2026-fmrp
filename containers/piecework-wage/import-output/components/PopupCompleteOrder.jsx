import CheckboxDefault from '@/components/common/checkbox/CheckboxDefault';
import { MagnifyingGlassIcon } from '@/components/icons';
import CheckIcon from '@/components/icons/common/CheckIcon';
import CloseXIcon from '@/components/icons/common/CloseXIcon';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import SelectComponent from '@/components/UI/filterComponents/selectComponent';
import NoData from '@/components/UI/noData/nodata';
import { InputNumberCustom } from '@/containers/manufacture/productions-orders/components/popup/PopupCompleteCommand';
import { useActiveStages } from '@/managers/api/piecework-wage/useImportOutput';
import { searchWithoutDiacritics } from '@/utils/helpers/stringHelper';
import { IMAGES } from '@/constants/images';
import { Lexend_Deca } from '@next/font/google';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PiWarehouseLight } from 'react-icons/pi';
import { Tooltip } from 'react-tippy';
import Popup from 'reactjs-popup';
import { useListFinishedStages } from '@/containers/manufacture/productions-orders/hooks/useListFinishedStages';

const deca = Lexend_Deca({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

const ProductRow = memo(({ product, index, updateProductQuantity, updateProductError, handleSelectProduct, errorTags, errorImages, onAddTag, onRemoveTag, onAddImage, onRemoveImage }) => {
  const handleToggleRowSelect = useCallback(() => {
    handleSelectProduct(index, !product.selected);
  }, [index, product.selected, handleSelectProduct]);

  const [newTagInput, setNewTagInput] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [inputWidth, setInputWidth] = useState(60);
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef(null);
  const measureRef = useRef(null);
  const errorValue = product.error === undefined ? 0 : product.error;
  const hasError = errorValue > 0;

  useEffect(() => {
    if (hasError) {
      setNewTagInput('');
      setInputWidth(60);
      setIsInputFocused(false);
      setImageError('');
    }
  }, [hasError]);

  useEffect(() => {
    if (measureRef.current) {
      const width = Math.max(60, measureRef.current.offsetWidth + 0);
      setInputWidth(width);
    }
  }, [newTagInput]);

  return (
    <>
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
              <Image src={product.images || '/icon/default/default.png'} alt={product.item_name} width={64} height={64} className='object-cover rounded' />
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
            <InputNumberCustom state={errorValue} setState={value => updateProductError(index, value)} isError={true} allowDecimal={true} />
          </div>
        </td>
      </tr>
    </>
  );
});

ProductRow.displayName = 'ProductRow';

const PopupCompleteOrder = ({ stage_id, po, isOpen, onClose, referenceNo = 'LSX-161225109' }) => {
  const { data: dataActiveStages, isLoading: isLoadingActiveStages } = useActiveStages({ po_id: po?.id, stage_id: stage_id, is_product: po?.is_product }, { enabled: isOpen });
  const { data: dataWarehouses, isLoading: isLoadingWarehouses, refetch: refetchWarehouses } = useListFinishedStages({
    id: po?.id,
    open: isOpen,
  });

  const [selectAll, setSelectAll] = useState(false);
  const [products, setProducts] = useState([]);
  const [searchProducts, setSearchProducts] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [isWarehouseMissing, setIsWarehouseMissing] = useState(false);
  const [errorTags, setErrorTags] = useState({});
  const [errorImages, setErrorImages] = useState({});
  const [showAutoTooltip, setShowAutoTooltip] = useState(false);
  const [autoTooltipText, setAutoTooltipText] = useState('');
  const hasShownTooltipRef = useRef(false);

  // Sử dụng trực tiếp dữ liệu từ API, chỉ thêm các field cần thiết cho UI
  useEffect(() => {
    if (dataActiveStages?.items && Array.isArray(dataActiveStages.items)) {
      const productsWithUI = dataActiveStages.items.map((item, index) => ({
        ...item, 
        images: item.images || IMAGES.noImage,
        quantity_success: item.quantity_enter || 0,
        error: 0,
        selected: false,
        originalIndex: index,
        uniqueId: `product-${item.pois_id || item.poi_id || index}`,
      }));
      setProducts(productsWithUI);
      setSelectAll(false);
    } else if (!isLoadingActiveStages && (!dataActiveStages?.items || dataActiveStages.items.length === 0)) {
      setProducts([]);
      setSelectAll(false);
    }
  }, [dataActiveStages, isLoadingActiveStages]);

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
      setSelectAll(false);
      setSearchProducts('');
      setSelectedWarehouse(null);
      setIsWarehouseMissing(false);
      setErrorTags({});
      setErrorImages({});
    }
  }, [isOpen]);

  const updateProductQuantity = useCallback((index, value) => {
    setProducts(prevProducts => {
      const updatedProducts = [...prevProducts];
      updatedProducts[index] = {
        ...updatedProducts[index],
        quantity_success: value,
      };
      return updatedProducts;
    });
  }, []);

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

      return updatedProducts;
    });
  }, []);

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

      return updatedProducts;
    });
  }, []);

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

  const handleWarehouseChange = useCallback(option => {
    setSelectedWarehouse(option);
    setIsWarehouseMissing(false);
  }, []);

  const handleConfirm = useCallback(() => {
    const selectedProducts = products.filter(product => product.selected);

    if (!selectedWarehouse) {
      setIsWarehouseMissing(true);
      return;
    }

    if (selectedProducts.length === 0) {
      return;
    }

    console.log('Confirm with:', {
      warehouse: selectedWarehouse,
      products: selectedProducts,
      errorTags,
      errorImages,
    });

    // Close popup after confirm
    onClose();
  }, [products, selectedWarehouse, errorTags, errorImages, onClose]);

  return (
    <Popup open={isOpen} closeOnDocumentClick={false} onClose={onClose} className='popup-edit' overlayStyle={{ zIndex: 1100 }}>
      <div className={`p-6 flex flex-col gap-6 rounded-3xl w-[90vw] xl:w-[1085px] max-h-[90vh] bg-neutral-00 ${deca.className}`}>
        <div className='flex gap-2 justify-between items-start'>
          <div className='flex flex-col gap-1'>
            <h2 className='text-2xl font-bold capitalize'>
              Nhập sản lượng công đoạn <span className='text-blue-fmrp'>May</span>
            </h2>
            <p className='responsive-text-base text-blue-fmrp'>{po?.reference_no || referenceNo}</p>
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
                    minHeight: '40px',
                    borderColor: isWarehouseMissing ? '#ef4444' : state.isFocused ? '#0F4F9E' : base.borderColor,
                    boxShadow: 'none',
                    '&:hover': {
                      borderColor: isWarehouseMissing ? '#ef4444' : state.isFocused ? '#0F4F9E' : base.borderColor,
                    },
                  }),
                }}
                isSearchable={true}
              />
              <button onClick={handleConfirm} className='flex items-center gap-2 text-sm font-medium rounded-lg py-2.5 px-4 w-fit text-white bg-blue-fmrp hover:opacity-80'>
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
              <div className='flex gap-x-2 items-center w-full rounded-lg border border-[#D0D5DD] px-3 py-1.5 focus-within:border-transparent focus-within:ring-2 focus-within:ring-blue-500'>
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
        <Customscrollbar className='max-h-[60vh] pr-2'>
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
              {isLoadingActiveStages ? (
                <tr>
                  <td colSpan={5} className='py-8'>
                    <div className='flex items-center justify-center'>
                      <p className='text-sm text-[#667085]'>Đang tải dữ liệu...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className='py-8'>
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
