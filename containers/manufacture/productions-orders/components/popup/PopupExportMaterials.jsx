import CheckIcon from '@/components/icons/common/CheckIcon';
import CloseXIcon from '@/components/icons/common/CloseXIcon';
import useSetingServer from '@/hooks/useConfigNumber';
import useToast from '@/hooks/useToast';
import { useHandlingExportTotalPO, useListExportProductionOrder } from '@/managers/api/productions-order/useExportProduct';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import { Lexend_Deca } from '@next/font/google';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import PopupExportMaterialsTabCurrent from './PopupExportMaterialsTabCurrent';
import PopupExportMaterialsTabReexport from './PopupExportMaterialsTabReexport';

const deca = Lexend_Deca({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

export const PopupOrderCompleted = ({ onClose, className }) => {
  return (
    <div className={`p-9 flex flex-col gap-8 justify-center items-center rounded-3xl w-[610px] bg-neutral-00 ${deca.className} ${className}`}>
      <div className='flex items-center gap-2'>
        <CheckIcon className='size-6 text-[#1FC583]' />
        <h3 className='text-2xl font-semibold text-[#25387A]'>Lệnh này đã xuất đủ số lượng</h3>
      </div>
      <div className='flex justify-center'>
        <Image width={267} height={200} src={'/popup/exportMaterials.webp'} alt='exportMaterials' className='object-cover size-full w-[384px]' unoptimized priority />
      </div>
      <button className='w-full py-3 px-5 rounded-xl bg-gradient-to-b from-[#1FC583] to-[#1F9285] text-white text-lg font-medium' onClick={onClose}>
        Đồng ý
      </button>
    </div>
  );
};

const PopupExportMaterials = ({ code, onClose, id }) => {
  const { data, isLoading } = useListExportProductionOrder(id);
  const [selectAll, setSelectAll] = useState(false);
  const [products, setProducts] = useState(data?.bom || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const dataSeting = useSetingServer();
  const showToast = useToast();
  const { onSubmit, isLoading: isLoadingSubmit } = useHandlingExportTotalPO();
  const [exportSuccess, setExportSuccess] = useState(0);
  const [isRenderErrorNVL, setIsRenderErrorNVL] = useState(false);
  const [errorNVLData, setErrorNVLData] = useState({ items: [] });
  const [showAutoTooltip, setShowAutoTooltip] = useState(false);
  const [autoTooltipText, setAutoTooltipText] = useState('');
  const [activeTab, setActiveTab] = useState('current');

  // Preload hình ảnh exportMaterials.webp khi component mount
  useEffect(() => {
    const img = document.createElement('img');
    img.src = '/popup/exportMaterials.webp';
  }, []);

  useEffect(() => {
    if (data?.bom) {
      const now = Date.now();
      const mappedProducts = data.bom.map((product, index) => {
        // Xử lý đặc biệt cho semi_products
        if (product.type_origin === 'semi_products') {
          // Nếu không có warehouses, tạo một warehouse mặc định
          const defaultWarehouse = {
            type_items: product.type_item,
            item_variation_id: product.item_variation_option_value_id,
            warehouse_id: 0,
            location_id: 0,
            serial: '',
            expiration_date: '',
            lot: '',
            pois_id: 0,
            name_location: 'Mặc định',
            name_warehouse: 'Mặc định',
            total_quantity: product.quantity_total_quota,
            quantity_warehouse: product.quantity_total_quota,
            quantity_enter: product.quantity_total_quota,
          };

          return {
            ...product,
            selected: true,
            originalIndex: index,
            checkOrder: now - index, // Đảm bảo semi_products ở đầu và giữ thứ tự ban đầu
            warehouses:
              product.warehouses?.length > 0
                ? product.warehouses.map(w => ({
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
          originalIndex: index,
          warehouses:
            product.warehouses?.map(w => ({
              ...w,
              quantity_enter: w.total_quantity || 0,
            })) || [],
        };
      });

      // Sắp xếp lại: các phần tử được check lên đầu (theo checkOrder), các phần tử uncheck sắp xếp theo originalIndex
      mappedProducts.sort((a, b) => {
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

      setProducts(mappedProducts);
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

  // Tự động hiển thị tooltip khi API load xong và ẩn sau 4 giây
  useEffect(() => {
    // Chỉ hiển thị khi API đã load xong và có data
    if (!isLoading && data?.bom && products.length > 0) {
      setAutoTooltipText('Chọn sản phẩm để xuất kho');
      setShowAutoTooltip(true);

      const timer = setTimeout(() => {
        setShowAutoTooltip(false);
        setAutoTooltipText('');
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      setShowAutoTooltip(false);
      setAutoTooltipText('');
    }
  }, [isLoading, data, products.length]);

  const formatNumberWithSetting = useCallback(number => formatNumberConfig(+number, dataSeting), [dataSeting]);

  const handleSelectAll = useCallback(checked => {
    setSelectAll(checked);
    setProducts(prevProducts => {
      const now = Date.now();
      const updatedProducts = prevProducts.map((product, index) => {
        const isSemiProduct = product.type_origin === 'semi_products';
        const newSelected = isSemiProduct ? true : checked;

        const updatedProduct = {
          ...product,
          selected: newSelected,
        };

        // Nếu check, thêm checkOrder (giữ nguyên thứ tự ban đầu bằng cách dùng originalIndex)
        if (newSelected) {
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
      const isSemiProduct = product.type_origin === 'semi_products';

      // Kiểm tra nếu user đang cố check một product không có kho
      if (checked && !isSemiProduct) {
        const hasWarehouses = product.warehouses && product.warehouses.length > 0;
        if (!hasWarehouses) {
          showToast('error', `Sản phẩm "${product.item_name}" không có kho hàng. Vui lòng bổ sung kho hàng trước khi chọn!`);
          return prevProducts; // Không thay đổi gì, giữ nguyên state
        }
      }

      const newSelected = isSemiProduct ? true : checked;

      // Cập nhật trạng thái selected
      const updatedProduct = {
        ...product,
        selected: newSelected,
      };

      // Nếu được check, chuyển phần tử lên đầu và thêm checkOrder
      if (newSelected) {
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

      const allSelected = updatedProducts.every(product => (product.type_origin === 'semi_products' ? true : product.selected));
      setSelectAll(allSelected);

      return updatedProducts;
    });
  }, []);

  const selectedCount = useMemo(() => products.filter(product => product.selected).length, [products]);

  const tabList = useMemo(
    () => [
      { id: 'current', label: 'Nguyên liệu cần xuất' },
      { id: 'reexport', label: 'Nguyên liệu đã xuất' },
    ],
    []
  );

  const handleConfirm = async () => {
    try {
      // Lấy tất cả sản phẩm semi_products và sản phẩm được chọn khác
      const selectedProducts = products.filter(product => product.type_origin === 'semi_products' || product.selected);

      if (selectedProducts.length === 0) {
        showToast('error', 'Vui lòng chọn ít nhất một sản phẩm!');
        return;
      }

      const hasInvalidWarehouse = selectedProducts.some(product => {
        // Bỏ qua kiểm tra warehouse cho semi_products
        if (product.type_origin === 'semi_products') return false;

        const result = !product.warehouses || product.warehouses.length === 0;
        if (result) {
          console.log('Sản phẩm không có kho:', product.item_name);
        }
        return result;
      });

      if (hasInvalidWarehouse) {
        showToast('error', 'Vui lòng chọn kho cho tất cả sản phẩm được chọn!');
        return;
      }

      const hasInvalidQuantity = selectedProducts.some(product => {
        // Bỏ qua kiểm tra số lượng cho semi_products
        if (product.type_origin === 'semi_products') return false;

        const result = product.warehouses.some(w => !w.quantity_enter || w.quantity_enter === 0);

        return result;
      });

      if (hasInvalidQuantity) {
        showToast('error', 'Vui lòng nhập số lượng xuất kho cho ít nhất một kho!');
        return;
      }

      const requestData = {
        po_id: id,
        is_app: 0,
        bom: selectedProducts.map(product => ({
          type_origin: product.type_origin,
          type_item: product.type_item,
          item_id: product.item_id,
          item_variation_option_value_id: product.item_variation_option_value_id,
          item_code: product.item_code,
          item_name: product.item_name,
          product_variation: product.product_variation,
          quantity_total_quota: product.quantity_total_quota,
          quantity_quota_primary: product.quantity_quota_primary,
          quota_exchange: product.quota_exchange,
          images: product.images || '',
          unit_name_primary: product.unit_name_primary,
          unit_name: product.unit_name,
          ppi_id: product.ppi_id,
          pp_id: product.pp_id,
          warehouses:
            product.type_origin === 'semi_products'
              ? (product.warehouses || []).map(w => ({
                  ...w,
                  quantity_enter: product.quantity_total_quota, // Với semi_products, quantity_enter luôn bằng quantity_total_quota
                }))
              : product.warehouses.map(w => ({
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
        showToast('success', 'Xuất kho thành công!');
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
        showToast('error', response?.message || 'Có lỗi xảy ra khi xuất kho!');
      }
    } catch (error) {
      console.error('Lỗi khi xuất kho:', error);
      showToast('error', 'Có lỗi xảy ra khi xuất kho!');
    }
  };

  // Xử lý tìm kiếm bằng cách kiểm tra từng sản phẩm
  const isProductVisible = useCallback(
    product => {
      if (!searchTerm.trim()) return true;
      return product.item_name.toLowerCase().includes(searchTerm.toLowerCase());
    },
    [searchTerm]
  );

  return showCompleted ? (
    <PopupOrderCompleted onClose={onClose} />
  ) : (
    <div className={`p-6 flex flex-col gap-4 rounded-3xl w-[90vw] xl:w-[1085px] max-h-[90vh] bg-neutral-00 ${deca.className}`}>
      <div className='flex gap-2 justify-between'>
        <div className='flex flex-col gap-1'>
          <h2 className='text-2xl font-bold capitalize'>Xuất kho sản xuất</h2>
          <p className='text-base text-typo-blue-4'>{code}</p>
        </div>
        <div className='flex gap-8 items-center'>
          <button onClick={handleConfirm} disabled={isLoadingSubmit} className='flex items-center gap-2 text-sm font-medium rounded-lg py-3 px-4 w-fit text-white bg-background-blue-2'>
            {isLoadingSubmit ? (
              'Đang xử lý...'
            ) : (
              <>
                <CheckIcon className='size-4' /> Xác nhận {selectedCount > 0 && `(${selectedCount})`}
              </>
            )}
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
      <div className='flex gap-2 bg-[#F5F7FB] p-1 rounded-full w-fit'>
        {tabList.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={twMerge('px-4 py-2 rounded-full text-sm font-medium transition-all', activeTab === tab.id ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B]')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'current' && (
        <PopupExportMaterialsTabCurrent
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          exportSuccess={exportSuccess}
          setExportSuccess={setExportSuccess}
          isRenderErrorNVL={isRenderErrorNVL}
          setIsRenderErrorNVL={setIsRenderErrorNVL}
          errorNVLData={errorNVLData}
          formatNumberWithSetting={formatNumberWithSetting}
          selectAll={selectAll}
          handleSelectAll={handleSelectAll}
          autoTooltipText={autoTooltipText}
          showAutoTooltip={showAutoTooltip}
          setShowAutoTooltip={setShowAutoTooltip}
          setAutoTooltipText={setAutoTooltipText}
          isLoading={isLoading}
          products={products}
          isProductVisible={isProductVisible}
          handleSelectProduct={handleSelectProduct}
          poId={id}
        />
      )}

      {activeTab === 'reexport' && <PopupExportMaterialsTabReexport />}
    </div>
  );
};

export default PopupExportMaterials;
