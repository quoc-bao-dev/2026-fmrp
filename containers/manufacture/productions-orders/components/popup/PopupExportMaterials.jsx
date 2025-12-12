import PackageUpgradeButton from '@/components/common/button/PackageUpgradeButton';
import SelectSearch from '@/components/common/orderManagement/SelectSearch';
import TabSwitcherWithSlidingBackground from '@/components/common/tab/TabSwitcherWithSlidingBackground';
import CheckIcon from '@/components/icons/common/CheckIcon';
import CloseXIcon from '@/components/icons/common/CloseXIcon';
import useSetingServer from '@/hooks/useConfigNumber';
import useToast from '@/hooks/useToast';
import { useHandlingExportTotalPO, useListExportProductionOrder, useSaveSuggestExporting } from '@/managers/api/productions-order/useExportProduct';
import { useLookupMaterialsVariant } from '@/managers/api/productions-order/useLookupMaterialsVariant';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import { Lexend_Deca } from '@next/font/google';
import { motion } from 'framer-motion';
import { debounce } from 'lodash';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

const PopupExportMaterials = ({ code, onClose, id, branchId }) => {
  const showToast = useToast();
  const dataSeting = useSetingServer();

  // Kiểm tra có phải gói pro không
  const isProPackage = dataSeting?.package !== '1';

  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(0);
  const [isRenderErrorNVL, setIsRenderErrorNVL] = useState(false);
  const [errorNVLData, setErrorNVLData] = useState({ items: [] });
  const [showAutoTooltip, setShowAutoTooltip] = useState(false);
  const [autoTooltipText, setAutoTooltipText] = useState('');
  const [activeTab, setActiveTab] = useState({ id: 'current', name: 'Nguyên liệu cần xuất' });
  const reexportTabRef = useRef(null);
  const [reexportSelectedCount, setReexportSelectedCount] = useState(0);
  const [isRenderErrorNVLReexport, setIsRenderErrorNVLReexport] = useState(false);
  const [errorNVLDataReexport, setErrorNVLDataReexport] = useState({ items: [] });
  const [selectedItems, setSelectedItems] = useState([]); // Danh sách item đã chọn từ SelectSearch
  const [dataItems, setDataItems] = useState([]); // Danh sách items để hiển thị trong SelectSearch
  const [searchLookupTerm, setSearchLookupTerm] = useState('');
  const [extraMaterials, setExtraMaterials] = useState([]);
  const [existingMaterialItemIds, setExistingMaterialItemIds] = useState(new Set());
  const [refreshWarehousesKey, setRefreshWarehousesKey] = useState(0);

  const { data, isLoading, refetch } = useListExportProductionOrder(id);
  const { onSubmit, isLoading: isLoadingSubmit } = useHandlingExportTotalPO();
  const { onSubmit: onSaveReexport, isLoading: isSavingReexport } = useSaveSuggestExporting();

  const branchIds = Array.isArray(branchId) ? branchId : branchId ? [branchId] : null;
  const lookupMaterialsParams = branchIds
    ? {
        branch_ids: branchIds,
        search: searchLookupTerm?.trim() || '',
        type_products: 'semi_products',
      }
    : null;

  const { data: dataLookupMaterialsVariant } = useLookupMaterialsVariant(lookupMaterialsParams, {
    enabled: !!branchIds,
  });
  const [products, setProducts] = useState(data?.bom || []);

  // Preload hình ảnh exportMaterials.webp khi component mount
  useEffect(() => {
    const img = document.createElement('img');
    img.src = '/popup/exportMaterials.webp';
  }, []);

  useEffect(() => {
    // Xử lý data.bom - có thể là array hoặc object (data.boms)
    let bomArray = [];
    if (data?.bom) {
      if (Array.isArray(data.bom)) {
        bomArray = data.bom;
      } else if (typeof data.bom === 'object') {
        // Nếu là object (như data.boms), convert sang array
        bomArray = Object.values(data.bom);
      }
    }

    if (bomArray.length > 0) {
      const now = Date.now();
      const mappedProducts = bomArray.map((product, index) => {
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
    } else {
      setProducts([]);
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

  const handleConfirmReexport = useCallback(async () => {
    if (!reexportTabRef.current || typeof reexportTabRef.current.buildSubmitPayload !== 'function') {
      showToast('error', 'Không thể lấy dữ liệu xuất thêm');
      return;
    }
    const payload = reexportTabRef.current.buildSubmitPayload();

    if (!payload) return;
    try {
      const response = await onSaveReexport(payload);
      if (response?.isSuccess === 1 || response?.isSuccess === true) {
        showToast('success', response?.message || 'Xuất thêm nguyên liệu thành công');
        reexportTabRef.current?.resetSelections?.();
        // Reset error state
        setIsRenderErrorNVLReexport(false);
        setErrorNVLDataReexport({ items: [] });
        // Xóa các nguyên liệu được thêm từ SelectSearch
        setSelectedItems([]);
        setExtraMaterials([]);
        setSearchLookupTerm('');
      } else {
        // Xử lý khi có lỗi
        if (response?.data?.errors) {
          setErrorNVLDataReexport({ items: response.data.errors });
          setIsRenderErrorNVLReexport(true);
        }
        showToast('error', response?.message || 'Xuất thêm nguyên liệu thất bại');
      }
    } catch (error) {
      showToast('error', error?.message || 'Có lỗi xảy ra khi xuất thêm nguyên liệu');
    }
  }, [onSaveReexport, showToast]);

  const tabList = useMemo(
    () => [
      { id: 'current', name: 'Nguyên liệu theo kế hoạch' },
      {
        id: 'reexport',
        name: 'Nguyên liệu bổ sung',
        tag: { label: 'Mới', className: '!bg-[#0375F3]' },
      },
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
        // Xóa các nguyên liệu được thêm từ SelectSearch
        setSelectedItems([]);
        setExtraMaterials([]);
        setSearchLookupTerm('');
        // Lấy lại tồn kho mới sau khi xuất thành công
        if (typeof refetch === 'function') {
          await refetch();
          setRefreshWarehousesKey(Date.now());
        }
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

  // Đồng bộ dataItems với dữ liệu từ API lookup
  useEffect(() => {
    if (dataLookupMaterialsVariant?.materials) {
      setDataItems(dataLookupMaterialsVariant.materials);
    } else if (!branchIds) {
      setDataItems([]);
    }
  }, [dataLookupMaterialsVariant, branchIds]);

  // Tạo options cho SelectSearch từ dataItems (giống form.jsx)
  const options = useMemo(() => {
    return dataItems?.map(e => ({
      label: `${e.name} <span style={{display: none}}>${e.code}</span><span style={{display: none}}>${e.product_variation} </span><span style={{display: none}}>${e.text_type} ${e.unit_name} </span>`,
      value: e.id,
      e,
    }));
  }, [dataItems]);

  // Component formatOptionLabel giống form.jsx
  const buildVariantKey = useCallback(item => {
    if (!item) return '';
    const source = item.item || item.e || item;
    const itemId = source?.item_id ?? source?.id ?? item?.value ?? '';
    const variationId = source?.item_variation_option_value_id ?? source?.variant_id ?? source?.item_variation_id ?? '';
    return `${itemId}-${variationId}`;
  }, []);

  // Tạo key chỉ dùng item_id để kiểm tra duplicate
  const buildItemIdKey = useCallback(item => {
    if (!item) return '';
    const source = item.item || item.e || item;
    const itemId = source?.item_id ?? item?.item_id ?? source?.id ?? item?.value ?? '';
    return String(itemId || '');
  }, []);

  const bomMaterialKeys = useMemo(() => {
    const keys = new Set();

    // Lấy keys từ products (data.bom - có thể là array hoặc object)
    if (Array.isArray(products)) {
      products.forEach(product => {
        const key = buildVariantKey(product);
        if (key) keys.add(key);
      });
    } else if (products && typeof products === 'object') {
      // Nếu products là object (như data.boms), convert sang array
      Object.values(products).forEach(product => {
        const key = buildVariantKey(product);
        if (key) keys.add(key);
      });
    }

    // Lấy keys từ data.boms (nếu có, là object)
    if (data?.boms && typeof data.boms === 'object') {
      Object.values(data.boms).forEach(material => {
        const key = buildVariantKey(material);
        if (key) keys.add(key);
      });
    }

    // Lấy keys từ data.materials (materials đã có trong danh sách ban đầu)
    if (data?.materials && Array.isArray(data.materials)) {
      data.materials.forEach(material => {
        const key = buildVariantKey(material);
        if (key) keys.add(key);
      });
    }

    return keys;
  }, [products, data?.boms, data?.materials, buildVariantKey]);

  // Tập item_id của các nguyên liệu bổ sung đang có trong extraMaterials (để chặn trùng trong cùng session)
  const extraMaterialItemIds = useMemo(() => {
    const keys = new Set();
    extraMaterials.forEach(mat => {
      const key = buildVariantKey(mat);
      if (key) keys.add(key);
    });
    return keys;
  }, [extraMaterials, buildVariantKey]);

  // Kiểm tra duplicate với nguyên liệu từ:
  // - BOM ban đầu (bomMaterialKeys)
  // - materials từ API tab reexport (existingMaterialItemIds)
  const combinedMaterialKeys = useMemo(() => {
    const keys = new Set();
    bomMaterialKeys.forEach(key => keys.add(key));
    existingMaterialItemIds.forEach(key => keys.add(key));
    return keys;
  }, [bomMaterialKeys, existingMaterialItemIds]);

  const selectItemsLabel = useCallback(
    option => {
      return (
        <div className='flex p-2 cursor-pointer items-center justify-between font-deca'>
          <div className='flex gap-3 items-start w-[calc(100%-80px)]'>
            <div className='flex flex-col 3xl:text-[10px] text-[9px] overflow-hidden w-full'>
              <div className='font-semibold responsive-text-sm truncate text-black'>{option.e?.name}</div>
              <div className='text-gray-500'>{option.e?.code || ''}</div>
              {option.e?.variant_name && <div className='text-blue-600 truncate'>{option.e?.variant_name}</div>}
            </div>
          </div>
          <div className='text-gray-500 responsive-text-sm min-w-[80px] text-right whitespace-nowrap'>Tồn: {formatNumberWithSetting(option.e?.quantity_warehouse)}</div>
        </div>
      );
    },
    [formatNumberWithSetting]
  );

  // Debounced search function (giống form.jsx)
  const _HandleSeachApi = useMemo(() => {
    const handler = debounce(value => {
      setSearchLookupTerm(value || '');
    }, 400);

    return handler;
  }, []);

  useEffect(() => {
    return () => {
      _HandleSeachApi?.cancel?.();
    };
  }, [_HandleSeachApi]);

  // Xử lý khi chọn item từ SelectSearch
  const convertLookupMaterialToBom = useCallback(item => {
    const source = item?.e || item || {};
    const itemId = source.item_id ?? source.id ?? item?.value ?? '';
    const unitName = source.unit_name || source.unit || '';
    const warehouses = Array.isArray(source.warehouses) ? source.warehouses : [];

    // Xử lý variant_id - API trả về variant_id, cần map sang item_variation_option_value_id
    const variantId = source.item_variation_option_value_id ?? source.variant_id ?? null;

    return {
      item_id: itemId,
      item_variation_option_value_id: variantId,
      poi_id: source.poi_id ?? 0,
      pp_id: source.pp_id ?? 0,
      item_name: source.name ?? item?.label ?? '',
      item_code: source.code ?? '',
      product_variation: source.variant_name ?? source.product_variation ?? '',
      unit_name: unitName,
      unit_name_primary: source.unit_name_primary ?? unitName,
      unit_id_primary: source.unit_id_primary ?? 0,
      quantity_total_quota: source.quantity ?? source.qty ?? 0,
      quantity_quota_primary: source.quantity ?? source.qty ?? 0,
      quantity_suggest_exporting: 0,
      type_origin: source.type_origin ?? 'material',
      type_item: source.type_item ?? 'material',
      images: source.images ?? '',
      warehouses,
      quota_exchange: source.quota_exchange ?? 1,
    };
  }, []);

  const handleSelectSearchChange = useCallback(
    value => {
      // Chuẩn hóa value từ SelectSearch về dạng mảng
      const nextSelected = Array.isArray(value) ? value : value ? [value] : [];

      const currentSelectionKeys = new Set(selectedItems.map(item => buildVariantKey(item)).filter(Boolean));

      const validSelectedItems = [];
      const extraMaterialsToAdd = [];

      nextSelected.forEach(item => {
        const source = item.item || item.e || item || {};
        const itemName = source.name || item.label || source.item_name || 'nguyên liệu';

        const itemIdKey = buildVariantKey(item);
        const quantityWarehouse = Number(source.quantity_warehouse ?? 0);

        if (!itemIdKey) return;

        // Bỏ qua kiểm tra trùng cho các item đã được chọn trước đó
        if (currentSelectionKeys.has(itemIdKey)) {
          validSelectedItems.push(item);
          return;
        }

        // 1. Chặn nếu tồn kho bằng 0
        if (!quantityWarehouse || quantityWarehouse <= 0) {
          showToast('error', `"${itemName}" không có tồn kho, vui lòng nhập thêm.`);
          return;
        }

        // 2. Chặn nếu đã tồn tại trong:
        //    - BOM / materials từ API (combinedMaterialKeys)
        //    - extraMaterials hiện tại (extraMaterialItemIds)
        if (combinedMaterialKeys.has(itemIdKey) || extraMaterialItemIds.has(itemIdKey)) {
          showToast('error', `"${itemName}" đã tồn tại trong danh sách nguyên liệu, vui lòng kiểm tra lại.`);
          return;
        }

        // 3. Item hợp lệ -> giữ lại trong selectedItems
        validSelectedItems.push(item);

        // 4. Nếu chưa tồn tại trong extraMaterials thì convert sang bom và thêm mới
        extraMaterialsToAdd.push(convertLookupMaterialToBom(item));
      });

      // Cập nhật selections (chỉ những item hợp lệ)
      setSelectedItems(validSelectedItems);

      // Thêm nguyên liệu bổ sung cho tab reexport (thêm lên đầu)
      if (extraMaterialsToAdd.length > 0) {
        setExtraMaterials(prev => [...extraMaterialsToAdd, ...prev]);
        // Hiển thị toast thành công khi thêm nguyên liệu
        if (extraMaterialsToAdd.length === 1) {
          const addedMaterial = extraMaterialsToAdd[0];
          showToast('success', `Đã thêm nguyên liệu "${addedMaterial.item_name}" thành công!`);
        } else {
          showToast('success', `Đã thêm ${extraMaterialsToAdd.length} nguyên liệu thành công!`);
        }
      }
    },
    [buildVariantKey, combinedMaterialKeys, extraMaterialItemIds, convertLookupMaterialToBom, selectedItems, showToast]
  );

  const handleDuplicateMaterialSelect = useCallback(
    option => {
      const source = option?.item || option?.e || option || {};
      const itemName = source.name || option?.label || source.item_name || 'nguyên liệu';
      showToast('error', `"${itemName}" đã tồn tại trong danh sách nguyên liệu, vui lòng kiểm tra lại.`);
    },
    [showToast]
  );

  return (
    <div className={`p-6 flex flex-col gap-4 rounded-3xl w-[90vw] max-h-[90vh] bg-neutral-00 ${deca.className} ${activeTab?.id === 'current' ? 'xl:w-[1085px]' : '2xl:w-[1280px]'}`}>
      <div className='flex gap-2 justify-between'>
        <div className='flex flex-col gap-1'>
          <h2 className='text-2xl font-bold capitalize'>Xuất kho sản xuất</h2>
          <p className='text-base text-blue-fmrp'>{code}</p>
        </div>
        <div className='flex gap-3 items-center'>
          {activeTab?.id === 'current' && (
            <button
              onClick={handleConfirm}
              disabled={isLoadingSubmit}
              className='flex items-center gap-2 text-sm font-medium rounded-lg py-3 px-4 w-fit text-white bg-blue-fmrp hover:bg-blue-fmrp/80'
            >
              {isLoadingSubmit ? (
                'Đang xử lý...'
              ) : (
                <>
                  <CheckIcon className='size-4' /> Xác nhận {selectedCount > 0 && `(${selectedCount})`}
                </>
              )}
            </button>
          )}
          {activeTab?.id === 'reexport' &&
            (isProPackage ? (
              <button
                onClick={handleConfirmReexport}
                disabled={isSavingReexport}
                className={`flex items-center gap-2 text-sm font-medium rounded-lg py-3 px-4 w-fit text-white ${
                  isSavingReexport ? 'bg-blue-fmrp cursor-not-allowed opacity-70' : 'bg-blue-fmrp hover:bg-blue-fmrp/80'
                }`}
              >
                <CheckIcon className='size-4' /> {isSavingReexport ? 'Đang xử lý...' : `Xuất bổ sung${reexportSelectedCount > 0 ? ` (${reexportSelectedCount})` : ''}`}
              </button>
            ) : (
              <PackageUpgradeButton />
            ))}
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
      <div className='flex items-center justify-between gap-20'>
        <TabSwitcherWithSlidingBackground
          tabs={tabList}
          activeTab={activeTab}
          onChange={setActiveTab}
          className='!p-1 flex-shrink-0 !overflow-visible'
          buttonClassName='!py-1.5 !px-3 !responsive-text-sm'
          buttonActiveClassName='!top-1 !bottom-1'
        />
        {activeTab?.id === 'reexport' && (
          <div className='w-full max-w-[500px]'>
            <SelectSearch
              options={options}
              onChange={handleSelectSearchChange}
              value={selectedItems}
              formatOptionLabel={selectItemsLabel}
              placeholder='Chọn nguyên vật liệu bổ sung ngoài định mức'
              setSearch={_HandleSeachApi}
              className='!border-[#0375F3]'
              classNameBtn='!bg-[#0375F3]'
              showCheckbox={false} // Ẩn checkbox
              multiple={true} // Vẫn cho phép chọn nhiều
              showSelectedCount={false} // Ẩn số lượng đã chọn
              showActiveColor={false} // Ẩn màu active khi item được chọn
              onDuplicateSelect={handleDuplicateMaterialSelect}
              preventDeselectOnClick
            />
          </div>
        )}
      </div>

      {activeTab?.id === 'current' && (
        <PopupExportMaterialsTabCurrent
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          exportSuccess={exportSuccess}
          setExportSuccess={setExportSuccess}
          refreshWarehousesKey={refreshWarehousesKey}
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
          showCompleted={showCompleted}
        />
      )}

      {activeTab?.id === 'reexport' && (
        <PopupExportMaterialsTabReexport
          ref={reexportTabRef}
          poId={data?.poi_id || id}
          onSelectionChange={setReexportSelectedCount}
          isRenderErrorNVL={isRenderErrorNVLReexport}
          setIsRenderErrorNVL={setIsRenderErrorNVLReexport}
          errorNVLData={errorNVLDataReexport}
          formatNumberWithSetting={formatNumberWithSetting}
          extraMaterials={extraMaterials}
          onExistingMaterialItemIdsChange={setExistingMaterialItemIds}
          onRemoveExtraMaterial={materialKey => {
            setExtraMaterials(prev => prev.filter(mat => buildVariantKey(mat) !== materialKey));
            setSelectedItems(prev => prev.filter(item => buildVariantKey(item) !== materialKey));
          }}
        />
      )}
    </div>
  );
};

export default PopupExportMaterials;
