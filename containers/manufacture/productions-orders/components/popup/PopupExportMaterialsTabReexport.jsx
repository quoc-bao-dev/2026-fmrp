import CheckboxDefault from '@/components/common/checkbox/CheckboxDefault';
import { ApproximateEqualsIcon, CheckCircleIcon, MagnifyingGlassIcon, PlusIcon } from '@/components/icons';
import CloseXIcon from '@/components/icons/common/CloseXIcon';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import Loading from '@/components/UI/loading/loading';
import useSetingServer from '@/hooks/useConfigNumber';
import useToast from '@/hooks/useToast';
import { useProductionOrderDetail } from '@/managers/api/productions-order/useProductionOrderDetail';
import { useListSuggestPo } from '@/managers/api/productions-order/useSuggestPo';
import { default as formatNumberConfig } from '@/utils/helpers/formatnumber';
import { AnimatePresence, motion } from 'framer-motion';
import moment from 'moment';
import Image from 'next/image';
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';
import { FiPlus } from 'react-icons/fi';
import { IoIosAlert } from 'react-icons/io';
import { twMerge } from 'tailwind-merge';
import { CustomDropdownRadioGroup, convertWarehousesToDropdownData } from './shared/WarehouseDropdown';
import { Tooltip } from 'react-tippy';
import { IMAGES } from '@/constants/images';
import NoData from '@/components/UI/noData/nodata';

const COLLAPSE_VARIANTS = {
  open: { height: 'auto', opacity: 1 },
  closed: { height: 0, opacity: 0 },
};

const EMPTY_LOT_ROW = {
  lot: '',
  expiration_date: '',
  id_warehouse_custom: '',
  total_quantity: 0,
  quantity: 0,
  quantity_enter: 0,
};

const createUniqueRowId = () => `lot-row-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createLotRow = (warehouses = []) => ({
  id: createUniqueRowId(),
  ...EMPTY_LOT_ROW,
  list_warehouses: warehouses,
});

const normalizeString = value => {
  if (!value) return '';
  return value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

const InputNumberCustom = memo(({ state = 0, setState, className, classNameButton, classNameInput, min = 0, max = Infinity, disabled = false, isError = false, allowDecimal = true }) => {
  const dataSeting = useSetingServer();
  const [inputValue, setInputValue] = useState(state || 0);
  const [formattedValue, setFormattedValue] = useState(formatNumberConfig(state || 0, dataSeting));

  useEffect(() => {
    setInputValue(state || 0);
    setFormattedValue(formatNumberConfig(state || 0, dataSeting));
  }, [state, dataSeting]);

  const parseNumericValue = useCallback(
    value => {
      const strValue = String(value ?? '');
      if (allowDecimal) {
        let cleaned = strValue.replace(/[^\d.]/g, '');
        // Chỉ cho phép 1 dấu chấm
        const parts = cleaned.split('.');
        if (parts.length > 2) {
          cleaned = parts[0] + '.' + parts.slice(1).join('');
        }
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? min : parsed;
      } else {
        const cleaned = strValue.replace(/\D/g, '');
        const parsed = parseInt(cleaned);
        return isNaN(parsed) ? min : parsed;
      }
    },
    [min, allowDecimal]
  );

  const handleInputChange = useCallback(
    e => {
      if (disabled) return;
      const value = e.target.value;

      if (value === '') {
        setInputValue('');
        setFormattedValue('');
        return;
      }

      const numericValue = allowDecimal ? value.replace(/[^\d.]/g, '') : value.replace(/\D/g, '');
      if (numericValue === '') {
        setInputValue('');
        setFormattedValue('');
        return;
      }

      const numValue = parseNumericValue(numericValue);
      setInputValue(numValue);

      if (numericValue.endsWith('.')) {
        setFormattedValue(numericValue);
      } else {
        setFormattedValue(formatNumberConfig(numValue, dataSeting));
      }
    },
    [disabled, allowDecimal, dataSeting, parseNumericValue]
  );

  const handleBlur = useCallback(() => {
    const number = inputValue === '' ? min : parseNumericValue(inputValue);
    const finalValue = number < min ? min : number;
    setState(finalValue);
    setInputValue(finalValue);
    setFormattedValue(formatNumberConfig(finalValue, dataSeting));
  }, [inputValue, min, setState, dataSeting, parseNumericValue]);

  const handleIncrement = useCallback(() => {
    if (disabled) return;
    const current = parseNumericValue(inputValue);
    const newValue = current + 1;
    setState(newValue);
    setInputValue(newValue);
    setFormattedValue(formatNumberConfig(newValue, dataSeting));
  }, [disabled, inputValue, setState, dataSeting, parseNumericValue]);

  const handleDecrement = useCallback(() => {
    if (disabled) return;
    const current = parseNumericValue(inputValue);
    if (current > min) {
      const newValue = current - 1;
      setState(newValue);
      setInputValue(newValue);
      setFormattedValue(formatNumberConfig(newValue, dataSeting));
    }
  }, [disabled, inputValue, min, setState, dataSeting, parseNumericValue]);

  const handleButtonClick = useCallback(
    (e, type) => {
      e.preventDefault();
      e.stopPropagation();
      if (window.getSelection) {
        window.getSelection().removeAllRanges();
      } else if (document.selection) {
        document.selection.empty();
      }
      type === 'increment' ? handleIncrement() : handleDecrement();
    },
    [handleIncrement, handleDecrement]
  );

  return (
    <div
      className={twMerge(
        'p-1 flex items-center rounded-full border border-[#E5E7EB] w-fit h-fit overflow-hidden bg-white',
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#D0D5DD] transition-all duration-200',
        className
      )}
      onMouseDown={e => e.preventDefault()}
    >
      <div
        onClick={e => handleButtonClick(e, 'decrement')}
        onMouseDown={e => e.preventDefault()}
        className={twMerge('size-[34px] rounded-full cursor-pointer bg-primary-05 flex justify-center items-center flex-row', classNameButton)}
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
        className={twMerge('w-20 text-center outline-none text-lg font-normal text-[#1B1A18] bg-transparent', isError && inputValue > 0 ? 'text-red-500' : '', classNameInput)}
      />
      <div
        onClick={e => handleButtonClick(e, 'increment')}
        onMouseDown={e => e.preventDefault()}
        className={twMerge('size-[34px] rounded-full cursor-pointer bg-primary-05 flex justify-center items-center flex-row', classNameButton)}
      >
        <FaPlus className='text-[#25387A] hover:text-green-1' size={10} />
      </div>
    </div>
  );
});

InputNumberCustom.displayName = 'InputNumberCustom';

const CollapseRowWrapper = ({ isOpen, children }) => {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div className='' initial='closed' animate='open' exit='closed' variants={COLLAPSE_VARIANTS} transition={{ duration: 0.3 }}>
          <div>{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const SubProductRow = memo(({ id, isOpen, lot, date, warehouse, listWarehouses, total_quantity, lotRows, setLotRows, onQuantityChange, formatNumber }) => {
  const [selectedWarehouse, setSelectedWarehouse] = useState(warehouse ?? '');
  const [inputValue, setInputValue] = useState(total_quantity || 0);
  const showToast = useToast();
  const prevTotalQuantityRef = useRef(total_quantity);

  useEffect(() => {
    if (total_quantity !== undefined && prevTotalQuantityRef.current !== total_quantity) {
      prevTotalQuantityRef.current = total_quantity;
      setInputValue(total_quantity);
      setLotRows(prev => {
        const currentRow = prev.find(row => row.id === id);
        if (currentRow && currentRow.total_quantity !== total_quantity) {
          return prev.map(row =>
            row.id === id
              ? {
                  ...row,
                  total_quantity: total_quantity,
                  quantity_warehouse: total_quantity,
                  quantity_enter: total_quantity,
                }
              : row
          );
        }
        return prev;
      });
    }
  }, [total_quantity, id, setLotRows]);

  const updateLotRow = useCallback(
    updates => {
      setLotRows(prev =>
        prev.map(row =>
          row.id === id
            ? {
                ...row,
                ...updates,
              }
            : row
        )
      );
    },
    [id, setLotRows]
  );

  const handleWarehouseChange = useCallback(
    option => {
      const isDuplicate = lotRows.some(row => row.id !== id && row.id_warehouse_custom === option.id_warehouse_custom);

      if (isDuplicate) {
        showToast('error', 'Kho hàng này đã được chọn!');
        setSelectedWarehouse('');
        setInputValue(0);
        updateLotRow({
          id_warehouse_custom: '',
          lot: '',
          expiration_date: '',
          total_quantity: 0,
          quantity_warehouse: 0,
          quantity_enter: 0,
          name_location: '',
        });
        return;
      }

      setSelectedWarehouse(option.id_warehouse_custom);
      setInputValue(option.total_quantity);
      updateLotRow({
        id_warehouse_custom: option.id_warehouse_custom,
        lot: option.lot,
        expiration_date: option.expiration_date,
        total_quantity: option.total_quantity,
        quantity_warehouse: option.total_quantity,
        quantity_enter: option.total_quantity,
        name_location: option.name_location,
      });
    },
    [lotRows, id, showToast, updateLotRow]
  );

  const handleQuantityChange = useCallback(
    value => {
      setInputValue(value);
      updateLotRow({ quantity_enter: value });
      if (typeof onQuantityChange === 'function') {
        onQuantityChange();
      }
    },
    [updateLotRow, onQuantityChange]
  );

  const handleDelete = useCallback(() => {
    setLotRows(prev => prev.filter(row => row.id !== id));
  }, [id, setLotRows]);

  return (
    <tr key={id}>
      <td colSpan={5} className={twMerge('p-0 !bg-gradient-to-r from-[#EBF5FF] via-[#E8F4FF] to-[#EBF5FF]')}>
        <CollapseRowWrapper isOpen={isOpen}>
          <table className='w-full border-separate border-spacing-0'>
            <tbody>
              <tr>
                <td className='py-2 px-4 text-left' colSpan={2}>
                  <div className='flex gap-x-4 justify-between items-center'>
                    {selectedWarehouse ? (
                      <div className='flex flex-row gap-x-3 text-[#3276FA] text-xs font-medium'>
                        <p className='px-2 py-1 rounded-lg bg-blue-50'>LOT: {lot}</p>
                        <p className='px-2 py-1 rounded-lg bg-blue-50'>Date: {moment(date).format('DD/MM/YYYY')}</p>
                      </div>
                    ) : (
                      <div className='text-xs font-normal text-[#991B1B] flex items-start gap-2'>
                        {/* <IoIosAlert className='text-[#991B1B] flex-shrink-0 mt-0.5' size={17} />
                          <p>Vui lòng chọn kho hàng của NVL để tiến hành xuất kho!</p> */}
                      </div>
                    )}
                    <CustomDropdownRadioGroup
                      data={convertWarehousesToDropdownData(listWarehouses || [])}
                      value={selectedWarehouse}
                      onChange={handleWarehouseChange}
                      formatNumber={formatNumber}
                      formatDate={date => (date ? moment(date).format('DD/MM/YYYY') : '')}
                    />
                  </div>
                </td>
                <td className='py-2 px-4 text-center w-[200px]'>
                  <div className='flex justify-center'>
                    <InputNumberCustom state={inputValue} setState={handleQuantityChange} className='bg-white' max={Number(total_quantity) || Infinity} allowDecimal={true} />
                  </div>
                </td>
                <td className='py-2 px-4 text-center w-[100px] flex-shrink-0'>
                  <button className='text-gray-400 hover:text-red-600 transition-colors duration-200 p-1 rounded-lg hover:bg-red-50' onClick={handleDelete}>
                    <CloseXIcon className='size-5' />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </CollapseRowWrapper>
      </td>
    </tr>
  );
});

SubProductRow.displayName = 'SubProductRow';

const PopupExportMaterialsTabReexport = forwardRef(({ poId, onSelectionChange }, ref) => {
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [materialsWarehouses, setMaterialsWarehouses] = useState({});
  const [selectedMaterialRows, setSelectedMaterialRows] = useState([]);
  const [hasInitializedProductSelection, setHasInitializedProductSelection] = useState(false);
  const [materialsSearchTerm, setMaterialsSearchTerm] = useState('');

  const { data, isLoading } = useProductionOrderDetail({ id: poId, enabled: !!poId });
  const showToast = useToast();

  // Helper functions
  const getProductId = useCallback(product => {
    return `${product.poi_id || product.item_id || ''}-${product.item_variation_option_value_id || ''}-${product.pp_id || ''}`;
  }, []);

  const getMaterialId = useCallback(material => {
    return `${material.item_id}-${material.item_variation_option_value_id || ''}-${material.pp_id || ''}`;
  }, []);

  // Computed values
  const flatProducts = useMemo(() => {
    if (!data?.listPOItems || !Array.isArray(data.listPOItems)) return [];
    const allProducts = data.listPOItems.flatMap(poItem => poItem.items_products || []);
    return allProducts.map((product, index) => ({
      ...product,
      __originalIndex: index,
    }));
  }, [data]);

  // Reset selection state when poId changes
  useEffect(() => {
    setSelectedProducts([]);
    setSelectAll(false);
    setHasInitializedProductSelection(false);
  }, [poId]);

  // Auto-select all products once data is available
  useEffect(() => {
    if (!hasInitializedProductSelection && flatProducts.length > 0) {
      const allProductIds = flatProducts.map(product => getProductId(product));
      setSelectedProducts(allProductIds);
      setSelectAll(true);
      setHasInitializedProductSelection(true);
    }
  }, [flatProducts, getProductId, hasInitializedProductSelection]);

const products = useMemo(() => {
    if (flatProducts.length === 0) return [];
    const selectedSet = new Set(selectedProducts);
    const selectedList = [];
    const unselectedList = [];

    flatProducts.forEach(product => {
      if (selectedSet.has(getProductId(product))) {
        selectedList.push(product);
      } else {
        unselectedList.push(product);
      }
    });

    return [...selectedList, ...unselectedList];
  }, [flatProducts, selectedProducts, getProductId]);

  // Lấy poi_ids từ các products đã chọn
  const poiIds = useMemo(() => {
    if (selectedProducts.length === 0) return [];
    return products
      .filter(product => selectedProducts.includes(getProductId(product)))
      .map(product => product.poi_id)
      .filter(Boolean);
  }, [selectedProducts, products, getProductId]);

  // Gọi API để lấy materials
  const requestData = useMemo(() => {
    if (poiIds.length === 0 || !poId) return null;
    return {
      po_id: Number(poId),
      poi_ids: poiIds.map(id => Number(id)),
    };
  }, [poiIds, poId]);

  const { data: suggestData, isLoading: isLoadingMaterials } = useListSuggestPo(requestData);

  // Lấy materials trực tiếp từ API response với thứ tự gốc
  const allMaterials = useMemo(() => {
    if (!suggestData) return [];
    const boms = suggestData?.data?.boms || suggestData?.boms || {};
    return Object.values(boms).map((material, index) => ({
      ...material,
      __originalIndex: index,
    }));
  }, [suggestData]);

  const materialMap = useMemo(() => {
    const map = new Map();
    allMaterials.forEach(material => {
      map.set(getMaterialId(material), material);
    });
    return map;
  }, [allMaterials, getMaterialId]);

  const filteredMaterials = useMemo(() => {
    if (!materialsSearchTerm.trim()) return allMaterials;
    const normalizedSearch = normalizeString(materialsSearchTerm);
    return allMaterials.filter(material => normalizeString(material.item_name).includes(normalizedSearch));
  }, [allMaterials, materialsSearchTerm]);

  // Sắp xếp materials: đã chọn lên đầu, bỏ chọn về vị trí cũ
  const materials = useMemo(() => {
    if (filteredMaterials.length === 0) return [];

    const selectedList = filteredMaterials
      .filter(material => selectedMaterialRows.includes(getMaterialId(material)))
      .sort((a, b) => a.__originalIndex - b.__originalIndex);

    const unselectedList = filteredMaterials
      .filter(material => !selectedMaterialRows.includes(getMaterialId(material)))
      .sort((a, b) => a.__originalIndex - b.__originalIndex);

    return [...selectedList, ...unselectedList];
  }, [filteredMaterials, selectedMaterialRows, getMaterialId]);

  // Handlers
  const handleSelectProduct = useCallback((productId, checked) => {
    setHasInitializedProductSelection(true);
    setSelectedProducts(prev => (checked ? [...prev, productId] : prev.filter(id => id !== productId)));
  }, []);

  const handleSelectAll = useCallback(
    checked => {
      setHasInitializedProductSelection(true);
      setSelectAll(checked);
      setSelectedProducts(checked ? products.map(p => getProductId(p)) : []);
    },
    [products, getProductId]
  );

  // Đồng bộ trạng thái checkbox "chọn tất cả" khi người dùng chọn từng sản phẩm
  useEffect(() => {
    if (!products.length) {
      if (selectAll) {
        setSelectAll(false);
      }
      return;
    }

    const isAllSelected = products.every(product => selectedProducts.includes(getProductId(product)));
    if (isAllSelected && !selectAll) {
      setSelectAll(true);
    } else if (!isAllSelected && selectAll) {
      setSelectAll(false);
    }
  }, [products, selectedProducts, getProductId, selectAll]);

  const handleAddLotRow = useCallback(
    material => {
      const materialId = getMaterialId(material);
      const currentState = materialsWarehouses[materialId] || { lotRows: [], isOpen: false };
      const warehouses = Array.isArray(material.warehouses) ? material.warehouses : [];

      setMaterialsWarehouses(prev => ({
        ...prev,
        [materialId]: {
          ...currentState,
          lotRows: [createLotRow(warehouses), ...currentState.lotRows],
          isOpen: true,
        },
      }));
      setSelectedMaterialRows(prev => (prev.includes(materialId) ? prev : [...prev, materialId]));
    },
    [materialsWarehouses, getMaterialId]
  );

  const handleToggleMaterial = useCallback(
    (material, checked) => {
      const materialId = getMaterialId(material);
      if (
        checked &&
        (!Array.isArray(material.warehouses) || material.warehouses.length === 0)
      ) {
        showToast(
          'error',
          `Sản phẩm "${material.item_name}" không có kho hàng. Vui lòng bổ sung kho hàng trước khi chọn!`
        );
        return;
      }
      setSelectedMaterialRows(prev =>
        checked ? [...prev, materialId] : prev.filter(id => id !== materialId)
      );
    },
    [getMaterialId, showToast]
  );

  const handleToggleAllMaterials = useCallback(
    checked => {
      setSelectedMaterialRows(checked ? materials.map(material => getMaterialId(material)) : []);
    },
    [materials, getMaterialId]
  );

  // Cleanup selected materials khi danh sách thay đổi
  useEffect(() => {
    setSelectedMaterialRows(prev => {
      const filtered = prev.filter(id => allMaterials.some(material => getMaterialId(material) === id));
      if (filtered.length === prev.length && filtered.every((id, index) => id === prev[index])) {
        return prev;
      }
      return filtered;
    });
  }, [allMaterials, getMaterialId]);

  // Helper để update materialsWarehouses
  const updateMaterialWarehouse = useCallback((materialId, updater) => {
    setMaterialsWarehouses(prev => ({
      ...prev,
      [materialId]: {
        ...prev[materialId],
        ...(typeof updater === 'function' ? updater(prev[materialId]) : updater),
      },
    }));
  }, []);

  const buildSubmitPayload = useCallback(() => {
    if (!poId) {
      showToast('error', 'Không tìm thấy thông tin PO.');
      return null;
    }

    if (selectedMaterialRows.length === 0) {
      showToast('error', 'Vui lòng chọn ít nhất một nguyên liệu để xuất thêm.');
      return null;
    }

    // Lấy boms gốc từ suggestData
    const originalBoms = suggestData?.data?.boms || suggestData?.boms || {};
    const bomsPayload = {};

    for (const materialId of selectedMaterialRows) {
      const material = materialMap.get(materialId);
      if (!material) continue;

      // Tìm key gốc trong boms (ví dụ: "material__974")
      const originalKey = Object.keys(originalBoms).find(key => {
        const bom = originalBoms[key];
        return getMaterialId(bom) === materialId;
      });

      if (!originalKey) continue;

      const warehouseState = materialsWarehouses[materialId];
      if (!warehouseState || !Array.isArray(warehouseState.lotRows) || warehouseState.lotRows.length === 0) {
        showToast('error', `Vui lòng thêm kho cho nguyên liệu ${material.item_name}.`);
        return null;
      }

      // Lọc và chuẩn bị warehouses với quantity_enter
      const preparedWarehouses = warehouseState.lotRows
        .filter(row => row.id_warehouse_custom && Number(row.quantity_enter) > 0)
        .map(row => {
          // Tìm warehouse gốc để lấy đầy đủ thông tin
          const originalWarehouse = (material.warehouses || []).find(w => w.id_warehouse_custom === row.id_warehouse_custom) || {};
          return {
            ...originalWarehouse,
            type_items: originalWarehouse.type_items || material.type_item,
            item_variation_id: originalWarehouse.item_variation_id || material.item_variation_option_value_id,
            warehouse_id: originalWarehouse.warehouse_id || '',
            location_id: originalWarehouse.location_id || '',
            serial: originalWarehouse.serial ?? null,
            expiration_date: row.expiration_date || originalWarehouse.expiration_date || '',
            lot: row.lot || originalWarehouse.lot || '',
            pois_id: originalWarehouse.pois_id || '0',
            name_location: row.name_location || originalWarehouse.name_location || '',
            name_warehouse: row.name_warehouse || originalWarehouse.name_warehouse || '',
            total_quantity: originalWarehouse.total_quantity ?? 0,
            quantity_warehouse: originalWarehouse.quantity_warehouse || '0',
            id_warehouse_custom: row.id_warehouse_custom,
            quantity_enter: Number(row.quantity_enter || 0),
          };
        });

      if (preparedWarehouses.length === 0) {
        showToast('error', `Vui lòng chọn kho và số lượng xuất thêm cho ${material.item_name}.`);
        return null;
      }

      // Giữ nguyên cấu trúc material gốc, chỉ thay warehouses
      bomsPayload[originalKey] = {
        ...originalBoms[originalKey],
        warehouses: preparedWarehouses,
      };
    }

    if (Object.keys(bomsPayload).length === 0) {
      showToast('error', 'Không có dữ liệu hợp lệ để xuất thêm.');
      return null;
    }

    return {
      po_id: Number(poId),
      poi_ids: poiIds.map(id => Number(id)),
      boms: bomsPayload,
    };
  }, [poId, poiIds, selectedMaterialRows, materialMap, materialsWarehouses, suggestData, getMaterialId, showToast]);

  const resetSelections = useCallback(() => {
    setSelectedMaterialRows([]);
    setMaterialsWarehouses({});
  }, []);

  useEffect(() => {
    if (typeof onSelectionChange === 'function') {
      onSelectionChange(selectedMaterialRows.length);
    }
  }, [selectedMaterialRows, onSelectionChange]);

  useImperativeHandle(
    ref,
    () => ({
      buildSubmitPayload,
      resetSelections,
    }),
    [buildSubmitPayload, resetSelections]
  );

  const dataSeting = useSetingServer();
  const formatNumber = useCallback(number => formatNumberConfig(+number, dataSeting), [dataSeting]);

  return (
    <div className='flex-1 min-h-[60vh] max-h-[80vh] w-full flex flex-col gap-4 h-full'>
      <div className='flex-1 flex gap-4 overflow-hidden'>
        {/* Left Sidebar - Product List */}
        <div className='w-[280px] flex flex-col rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden'>
          <div className='p-3 bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6]'>
            <h2 className='text-sm font-semibold text-[#141522]'>Chọn thành phẩm để xuất kho</h2>
          </div>

          {isLoading ? (
            <div className='flex justify-center items-center h-full min-h-[300px]'>
              <Loading />
            </div>
          ) : products.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-full min-h-[300px] gap-3 p-4'>
              <NoData type='report' titleText='Không có thành phẩm nào'/>
            </div>
          ) : (
            <Customscrollbar className='flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300'>
              <div className='p-2'>
                <div className='flex items-center gap-2 mb-2'>
                  <CheckboxDefault checked={selectAll} onChange={handleSelectAll} label='Chọn tất cả' />
                </div>
                {products.map(product => {
                  const productId = getProductId(product);
                  const isSelected = selectedProducts.includes(productId);

                  return (
                    <div
                      key={productId}
                      className={`p-2 rounded-md mb-2 cursor-pointer transition-all duration-200 ${
                        isSelected ? 'bg-gradient-to-br from-[#EBF5FF] to-[#D0E8FF] shadow-md shadow-blue-100/50' : 'bg-white hover:bg-[#F9FAFB] hover:shadow-sm'
                      }`}
                      onClick={() => handleSelectProduct(productId, !isSelected)}
                    >
                      <div className='flex items-center gap-2'>
                        <div onClick={e => e.stopPropagation()}>
                          <CheckboxDefault checked={isSelected} className='!space-x-0' onChange={checked => handleSelectProduct(productId, checked)} />
                        </div>
                        <div className='w-12 h-12 rounded flex items-center justify-center flex-shrink-0'>
                          <Image src={product.images || '/icon/default/default.png'} alt={product.item_name || 'default'} width={48} height={48} className='object-cover rounded' />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <h4 className='text-sm font-semibold text-[#141522] truncate'>{product.item_name}</h4>
                          {product.reference_no_detail && <p className='text-xs text-new-blue font-medium'>{product.reference_no_detail}</p>}
                          <p className='text-xs text-[#667085] truncate'>{product.item_code}</p>
                          {product.product_variation && <p className='text-[10px] font-normal text-[#667085] truncate mt-0.5'>{product.product_variation}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Customscrollbar>
          )}
        </div>

        {/* Right Content - Materials Detail */}
        <div className='flex-1 flex flex-col rounded-2xl bg-white overflow-hidden'>
          <div className='flex justify-between items-center gap-10 p-2 bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6]'>
            <h3 className='text-sm font-semibold text-[#141522] whitespace-nowrap'>Nguyên liệu của thành phẩm đã chọn ({materials.length})</h3>
            <div className='bg-white flex gap-x-2 items-center w-full rounded-lg border border-[#D0D5DD] px-2 py-1.5 focus-within:border-transparent focus-within:ring-2 focus-within:ring-blue-500'>
              <input
                type='text'
                placeholder='Tìm kiếm theo tên nguyên vật liệu'
                className='flex-1 border-none outline-none text-[#3A3E4C] placeholder-gray-300 text-xs'
                value={materialsSearchTerm}
                onChange={e => setMaterialsSearchTerm(e.target.value)}
              />
              <button className='rounded-lg bg-[#1760B9] p-1'>
                <MagnifyingGlassIcon className='size-3 text-white' />
              </button>
            </div>
          </div>

          {selectedProducts.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-full min-h-[400px] gap-4'>
              <div className='flex flex-col items-center justify-center h-full'>
                <Image src={IMAGES.emptyProductOrder} alt='Không có dữ liệu' width={200} height={200} className='object-cover rounded-md' />
                <div className='flex items-center gap-2 mt-2'>
                  <PlusIcon className='size-4' />
                  <p className='responsive-text-xl font-medium text-neutral-05'>Chọn thành phẩm</p>
                </div>
                <p className='responsive-text-lg text-neutral-03 mt-2'>Chưa chọn thành phẩm. Vui lòng chọn thành phẩm.</p>
              </div>
            </div>
          ) : materials.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-full min-h-[400px] gap-4'>
             <NoData type='report' titleText='Không có nguyên liệu nào cho thành phẩm đã chọn'/>
            </div>
          ) : (
            <div className='overflow-hidden flex-1'>
              <table className='min-w-full border-separate border-spacing-0 table-fixed border-b border-[#E5E7EB]'>
                <thead className='sticky top-0 z-10 responsive-text-base font-normal'>
                  <tr>
                    <th className='pt-3 pb-1 px-4 text-center text-[#667085] w-[62px]'>
                      <CheckboxDefault checked={materials.length > 0 && selectedMaterialRows.length === materials.length} onChange={handleToggleAllMaterials} className='!space-x-0' />
                    </th>
                    <th className='font-normal pt-3 pb-1 pr-4 text-left text-[#667085]'>Nguyên vật liệu</th>
                    <th className='font-normal pt-3 pb-1 px-4 text-center text-[#667085] w-[200px]'>Số lượng cần xuất</th>
                    <th className='font-normal pt-3 pb-1 px-4 text-center text-[#667085] w-[200px]'>Số lượng đã xuất</th>
                    <th className='font-normal pt-3 pb-1 px-4 text-center text-[#667085] w-[100px]'>Thao tác</th>
                  </tr>
                </thead>
              </table>
              <Customscrollbar className='max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300'>
                <table className='min-w-full table-fixed border-separate border-spacing-0'>
                  <tbody>
                    {materials.map(material => {
                      const materialId = getMaterialId(material);
                      const quantityTotal = Number(material.quantity_total_quota || 0);
                      const quantityQuotaPrimary = Number(material.quantity_quota_primary || 0);
                      const quantitySuggestExporting = Number(material.quantity_suggest_exporting || 0);
                      const materialWarehouseState = materialsWarehouses[materialId] || { lotRows: [], isOpen: false };
                      const hasWarehouses = Array.isArray(material.warehouses) && material.warehouses.length > 0;
                      const isSelected = selectedMaterialRows.includes(materialId);
                      return (
                        <>
                          <tr
                            key={materialId}
                            className='hover:bg-gradient-to-r hover:from-[#F9FAFB] hover:to-[#F3F4F6] transition-all duration-200 group cursor-pointer'
                            onClick={() => handleToggleMaterial(material, !isSelected)}
                          >
                            <td className='py-4 px-4 text-center text-sm font-semibold text-[#667085] w-[62px]'>
                              <div onClick={e => e.stopPropagation()}>
                                <CheckboxDefault checked={isSelected} onChange={checked => handleToggleMaterial(material, checked)} className='!space-x-0' />
                              </div>
                            </td>
                            <td className='py-4 pr-4 text-left'>
                              <div className='flex flex-col'>
                                <h3 className='text-sm font-semibold text-[#141522] truncate'>{material.item_name}</h3>
                                <div className='flex flex-col gap-0.5'>
                                  <p className='text-[10px] font-normal text-[#667085]'>{material.product_variation}</p>
                                  <p className='text-xs font-normal text-typo-blue-2'>{material.item_code}</p>
                                </div>
                              </div>
                            </td>
                            <td className='py-4 px-4 text-center w-[200px]'>
                              <div className='flex gap-5 justify-center items-center'>
                                {material.unit_name !== material.unit_name_primary && (
                                  <>
                                    <div className='text-start'>
                                      <p className='text-[#EE1E1E] font-medium text-lg'>
                                        {formatNumber(quantityTotal)} <span className='text-[#141522] font-medium text-xs'>/</span>
                                      </p>
                                      <span className='text-[#141522] text-xs font-medium'>{material.unit_name}</span>
                                    </div>
                                    <span className='text-[#141522] text-base font-medium'>
                                      <ApproximateEqualsIcon className='size-4' />
                                    </span>
                                  </>
                                )}
                                <div className='text-start'>
                                  <p className='text-[#EE1E1E] font-medium text-lg'>
                                    {formatNumber(quantityQuotaPrimary)} <span className='text-[#141522] font-medium text-xs'>/</span>
                                  </p>
                                  <span className='text-[#141522] text-xs font-medium'>{material.unit_name_primary}</span>
                                </div>
                              </div>
                            </td>
                            <td className='py-4 px-4 text-center w-[200px] min-w-[200px] shrink-0'>
                              <div className='flex flex-col items-center gap-1'>
                                <p className='text-base font-semibold text-[#1FC583]'>{formatNumber(quantitySuggestExporting)}</p>
                                <span className='text-xs font-normal text-[#667085]'>{material.unit_name_primary || material.unit_name}</span>
                              </div>
                            </td>
                            <td className='py-4 px-4 text-center w-[100px] min-w-[100px] shrink-0'>
                              <div className='flex justify-center'>
                                <Tooltip title='Bổ sung kho xuất nguyên liệu' position='top' arrow={true}>
                                  <div
                                    onClick={e => {
                                      e.stopPropagation();
                                      handleAddLotRow(material);
                                    }}
                                    className='flex-shrink-0 min-h-[35px] min-w-[35px] cursor-pointer flex justify-center items-center flex-row rounded-full bg-[#EBF5FF] border border-transparent hover:border-[#1760B9] hover:bg-[#D0E8FF] hover:scale-110 transition-all duration-200 ease-out'
                                  >
                                    <FiPlus className='text-[#003DA0] group-hover:text-[#1760B9] transition-colors' size={19} />
                                  </div>
                                </Tooltip>
                              </div>
                            </td>
                          </tr>

                          {materialWarehouseState.lotRows.length > 0 ? (
                            materialWarehouseState.lotRows.map(lot => (
                              <SubProductRow
                                key={lot.id}
                                id={lot.id}
                                lot={lot.lot}
                                date={lot.expiration_date}
                                warehouse={lot.id_warehouse_custom}
                                isOpen={materialWarehouseState.isOpen}
                                setLotRows={updater => {
                                  updateMaterialWarehouse(materialId, prev => ({
                                    lotRows: typeof updater === 'function' ? updater(prev.lotRows || []) : updater,
                                  }));
                                }}
                                listWarehouses={lot.list_warehouses || material.warehouses || []}
                                total_quantity={Number(lot.total_quantity)}
                                lotRows={materialWarehouseState.lotRows}
                                onQuantityChange={() => {}}
                                formatNumber={formatNumber}
                              />
                            ))
                          ) : !hasWarehouses ? (
                            <tr>
                              <td colSpan={5} className='!bg-gradient-to-r from-[#EBF5FF] via-[#E8F4FF] to-[#EBF5FF]'>
                                <div className='py-2 text-xs font-normal text-[#991B1B] flex items-center justify-center gap-2'>
                                  <IoIosAlert className='text-[#991B1B] flex-shrink-0' size={17} />
                                  Vui lòng nhập thêm nguyên vật liệu để tiến hành xuất kho
                                </div>
                              </td>
                            </tr>
                          ) : null}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </Customscrollbar>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default memo(PopupExportMaterialsTabReexport);
