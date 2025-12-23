import CheckboxDefault from '@/components/common/checkbox/CheckboxDefault';
import { ApproximateEqualsIcon, MagnifyingGlassIcon, PlusIcon } from '@/components/icons';
import CheckIcon from '@/components/icons/common/CheckIcon';
import CloseXIcon from '@/components/icons/common/CloseXIcon';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import { IMAGES } from '@/constants/images';
import useToast from '@/hooks/useToast';
import { useProductionOrderDetail } from '@/managers/api/productions-order/useProductionOrderDetail';
import { useLookupWarehouses, useMaterialsRecall, useSaveRecallMaterials } from '@/managers/api/productions-order/useRecallMaterials';
import formatNumber from '@/utils/helpers/formatnumber';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { IoIosAlert } from 'react-icons/io';
import { useDebounce } from 'use-debounce';
import InputNumberCustom from './shared/InputNumberCustom';
import { CustomDropdownRadioGroup, convertWarehousesToDropdownData } from './shared/WarehouseDropdown';
import useSetingServer from '@/hooks/useConfigNumber';
import PackageUpgradeButton from '@/components/common/button/PackageUpgradeButton';

// Kiểm tra xem material có lot/date hợp lệ không (có ít nhất một lot với lot hoặc expiration_date không rỗng)
const hasValidLotDate = lots => {
  if (!lots || typeof lots !== 'object') return false;
  return Object.values(lots).some(lotItem => {
    const hasLot = lotItem.lot && lotItem.lot.trim() !== '';
    const hasExpirationDate = lotItem.expiration_date && lotItem.expiration_date.trim() !== '';
    const hasSerial = lotItem.serial && lotItem.serial.trim() !== '';
    return hasLot || hasExpirationDate || hasSerial;
  });
};

const mapLotsToDropdown = (itemVariationId, lots) => {
  if (!lots || typeof lots !== 'object') return [];
  const items = Object.values(lots || {}).map(lotItem => ({
    id_warehouse_custom: `${itemVariationId}-${lotItem.lot || 'no-lot'}-${lotItem.expiration_date || 'no-exp'}-${lotItem.serial || 'no-serial'}`,
    name_location: lotItem.serial ? `${lotItem.serial}` : lotItem.lot || 'Lot trống',
    lot: lotItem.lot || '',
    expiration_date: lotItem.expiration_date || '',
    serial: lotItem.serial || '',
    total_quantity: Number(lotItem.quantity_recall || 0),
  }));

  if (items.length === 0) return [];

  return convertWarehousesToDropdownData([
    {
      name_warehouse: 'Lot/Date',
      items,
    },
  ]);
};

const normalizeString = value => {
  if (!value) return '';
  return value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

const PopupRecallMaterials = ({ code, onClose, id, branchId }) => {
  const showToast = useToast();
  const dataSeting = useSetingServer();
  const isProPackage = dataSeting?.package !== '1';

  const [materialsSearchTerm, setMaterialsSearchTerm] = useState('');
  const [warehouseSearchTerm, setWarehouseSearchTerm] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [selectedWarehouses, setSelectedWarehouses] = useState({}); // { materialId: selectedOption }
  const [recallQuantities, setRecallQuantities] = useState({}); // { materialId: quantity }
  const [selectedWarehouseLocation, setSelectedWarehouseLocation] = useState(null); // Selected warehouse location
  const [selectedMaterialIds, setSelectedMaterialIds] = useState([]);
  const [warehouseError, setWarehouseError] = useState(false);

  const [debouncedWarehouseSearch] = useDebounce(warehouseSearchTerm, 500);

  const { data, isLoading } = useProductionOrderDetail({ id: id, enabled: !!id });
  const { data: warehouses, isLoading: isLoadingWarehouses } = useLookupWarehouses({
    is_system: 0,
    branch_ids: [branchId],
    is_location: 1,
    is_system_location: 0,
    ...(debouncedWarehouseSearch && { search: debouncedWarehouseSearch }),
  });
  console.log(warehouses)
  const { data: materialsRecall, isLoading: isLoadingMaterialsRecall } = useMaterialsRecall(
    {
      po_id: id,
      poi_ids: selectedProductIds,
    },
    selectedProductIds.length > 0
  );
  const { mutate: saveRecallMaterials, isPending: isSavingRecall } = useSaveRecallMaterials(onClose);

  // Hiển thị materials từ API (giữ nguyên data, chỉ lọc/search)
  const materials = useMemo(() => {
    let list = Object.values(materialsRecall || {});

    if (!list || list.length === 0) {
      list = [];
    }

    if (materialsSearchTerm.trim()) {
      const normalizedTerm = normalizeString(materialsSearchTerm);
      list = list.filter(material => normalizeString(material.item_name).includes(normalizedTerm));
    }

    return list;
  }, [materialsSearchTerm, materialsRecall]);

  // Map các material đã thu hồi hết
  const fullyRecalledSet = useMemo(() => {
    const set = new Set();
    (materials || []).forEach(item => {
      const exportedQty = Number(item.quantity_export_manufacture || 0);
      const returnedQty = Number(item.quantity_returned || 0);
      if (exportedQty > 0 && returnedQty >= exportedQty) {
        set.add(item.item_variation_id || item.item_id);
      }
    });
    return set;
  }, [materials]);

  // Lấy products để làm phẳng mảng
  const products = useMemo(() => {
    if (!data?.listPOItems || !Array.isArray(data.listPOItems)) return [];
    return data.listPOItems.flatMap(poItem => poItem.items_products || []);
  }, [data]);

  // Mới vào popup: tự động chọn tất cả sản phẩm nếu chưa có gì được chọn
  useEffect(() => {
    if (!products || products.length === 0) return;
    setSelectedProductIds(prev => {
      if (prev.length > 0) return prev;
      return products.map(product => product.poi_id);
    });
  }, [products]);

  // Đồng bộ danh sách materials chọn khi materials thay đổi
  useEffect(() => {
    const validIds = new Set(materials.map(m => m.item_variation_id || m.item_id));
    setSelectedMaterialIds(prev => prev.filter(id => validIds.has(id)));
  }, [materials]);

  // Bỏ chọn các nguyên liệu đã thu hồi hết
  useEffect(() => {
    if (selectedMaterialIds.length === 0) return;
    setSelectedMaterialIds(prev => prev.filter(id => !fullyRecalledSet.has(id)));
  }, [fullyRecalledSet, selectedMaterialIds.length]);

  const handleToggleMaterial = useCallback(
    materialId => {
      if (!materialId) return;
      if (fullyRecalledSet.has(materialId)) {
        showToast('error', 'Nguyên liệu này đã thu hồi hết');
        return;
      }
      setSelectedMaterialIds(prev => (prev.includes(materialId) ? prev.filter(id => id !== materialId) : [...prev, materialId]));
    },
    [fullyRecalledSet, showToast]
  );

  const handleToggleAllMaterials = useCallback(() => {
    if (materials.length === 0) return;
    const selectableIds = materials.map(m => m.item_variation_id || m.item_id).filter(id => !fullyRecalledSet.has(id));

    if (selectableIds.length === 0) {
      showToast('error', 'Tất cả nguyên liệu đã thu hồi hết');
      return;
    }

    if (selectedMaterialIds.length === selectableIds.length) {
      setSelectedMaterialIds([]);
    } else {
      setSelectedMaterialIds(selectableIds);
    }
  }, [materials, selectedMaterialIds.length, fullyRecalledSet, showToast]);

  // Sắp xếp lại danh sách sản phẩm: các sản phẩm đang được chọn sẽ nhảy lên trên
  const displayProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    return [...products].sort((a, b) => {
      const aSelected = selectedProductIds.includes(a.poi_id);
      const bSelected = selectedProductIds.includes(b.poi_id);

      if (aSelected === bSelected) return 0;
      return aSelected ? -1 : 1;
    });
  }, [products, selectedProductIds]);

  // Khi danh sách products thay đổi, loại bỏ các ID sản phẩm không còn tồn tại khỏi selectedProductIds
  useEffect(() => {
    if (!products || products.length === 0) return;

    setSelectedProductIds(prev => {
      const validIds = new Set(products.map(product => product.poi_id));
      const next = prev.filter(id => validIds.has(id));

      if (next.length === prev.length && next.every((id, index) => id === prev[index])) {
        return prev;
      }

      return next;
    });
  }, [products]);

  const handleToggleProduct = useCallback(
    productId => {
      const isCurrentlySelected = selectedProductIds.includes(productId);

      // Nếu đang là lệnh cuối cùng được chọn và user bỏ chọn nó -> chặn + toast
      if (isCurrentlySelected && selectedProductIds.length === 1) {
        showToast('error', 'Phải chọn ít nhất một thành phẩm!');
        return;
      }

      if (isCurrentlySelected) {
        setSelectedProductIds(selectedProductIds.filter(id => id !== productId));
      } else {
        setSelectedProductIds([...selectedProductIds, productId]);
      }
    },
    [selectedProductIds, showToast]
  );

  const handleToggleAllProducts = useCallback(() => {
    // Nếu đang chọn hết và user bấm bỏ chọn hết -> không cho về 0
    if (products.length > 0 && selectedProductIds.length === products.length) {
      showToast('error', 'Phải chọn ít nhất một thành phẩm!');
      return;
    }

    // Ngược lại: set về chọn hết
    setSelectedProductIds(products.map(product => product.poi_id));
  }, [products, selectedProductIds.length, showToast]);

  // Transform dữ liệu từ API sang format phù hợp với convertWarehousesToDropdownData
  const transformedWarehouses = useMemo(() => {
    if (!warehouses?.warehouses || !Array.isArray(warehouses.warehouses)) return [];
    console.log(warehouses.warehouses)
    return warehouses.warehouses.map(warehouse => ({
      name_warehouse: warehouse.name || warehouse.code || '',
      warehouse_id: warehouse.id || '',
      items: (warehouse.locations?.rows || []).map(location => ({
        id_warehouse_custom: `${warehouse.id}-${location.id}`,
        name_location: location.name || location.code || '',
        location_id: location.id || '',
        warehouse_id: warehouse.id || '',
        lot: '', // Không có lot trong dữ liệu này
        expiration_date: '', // Không có expiration_date trong dữ liệu này
        total_quantity: 0, // Không có số lượng trong dữ liệu này
        quantity_warehouse: 0,
      })),
    }));
  }, [warehouses]);
console.log(transformedWarehouses)
  // Format dữ liệu kho hàng để hiển thị trong dropdown
  const warehouseDropdownData = useMemo(() => {
    return convertWarehousesToDropdownData(transformedWarehouses);
  }, [transformedWarehouses]);
console.log(warehouseDropdownData)
  // Sắp xếp materials: ưu tiên các material đã chọn lên đầu, giữ nguyên thứ tự gốc
  const sortedMaterials = useMemo(() => {
    if (!materials || materials.length === 0) return [];
    const getId = item => item.item_variation_id || item.item_id;
    const originalIndexMap = new Map();
    const fullyRecalledMap = new Map();
    materials.forEach((item, index) => {
      originalIndexMap.set(getId(item), index);
      const exportedQty = Number(item.quantity_export_manufacture || 0);
      const returnedQty = Number(item.quantity_returned || 0);
      fullyRecalledMap.set(getId(item), exportedQty > 0 && returnedQty >= exportedQty);
    });

    return [...materials].sort((a, b) => {
      const aId = getId(a);
      const bId = getId(b);
      const aSelected = selectedMaterialIds.includes(aId);
      const bSelected = selectedMaterialIds.includes(bId);
      const aFully = fullyRecalledMap.get(aId);
      const bFully = fullyRecalledMap.get(bId);

      // Ưu tiên: đang chọn -> không chọn; chưa thu hồi hết -> đã thu hồi hết; sau đó theo thứ tự gốc
      if (aSelected !== bSelected) return aSelected ? -1 : 1;
      if (aFully !== bFully) return aFully ? 1 : -1;
      return (originalIndexMap.get(aId) ?? 0) - (originalIndexMap.get(bId) ?? 0);
    });
  }, [materials, selectedMaterialIds]);

  // Kiểm tra xem có material nào có lot/date hợp lệ không
  const hasAnyValidLotDate = useMemo(() => {
    return materials.some(material => hasValidLotDate(material.lots));
  }, [materials]);

  const itemsWithEnterInfo = useMemo(() => {
    if (!materialsRecall || typeof materialsRecall !== 'object') return {};
    const result = {};

    Object.entries(materialsRecall).forEach(([key, item]) => {
      const materialId = item.item_variation_id || item.item_id;
      if (!selectedMaterialIds.includes(materialId)) return; // chỉ gửi những material đã chọn

      const selectedWarehouse = selectedWarehouses[materialId];
      const quantityEnter = Number(recallQuantities[materialId] ?? item.quantity_recall ?? 0);

      result[key] = {
        ...item,
        quantity_enter: Number.isNaN(quantityEnter) ? 0 : quantityEnter,
        lot_enter: selectedWarehouse?.lot || '',
        expiration_date_enter: selectedWarehouse?.expiration_date || '',
        serial_enter: selectedWarehouse?.serial || '',
      };
    });

    return result;
  }, [materialsRecall, recallQuantities, selectedMaterialIds, selectedWarehouses]);

  const handleConfirmRecall = useCallback(() => {
    if (!selectedWarehouseLocation?.warehouse_id) {
      setWarehouseError(true);
      showToast('error', 'Vui lòng chọn kho xuất thu hồi');
      return;
    }

    if (!materialsRecall || Object.keys(materialsRecall).length === 0) {
      showToast('error', 'Không có dữ liệu nguyên liệu để thu hồi');
      return;
    }

    const payload = {
      po_id: id,
      poi_ids: selectedProductIds,
      warehouse_id: selectedWarehouseLocation?.warehouse_id,
      location_id: selectedWarehouseLocation?.location_id,
      items: itemsWithEnterInfo,
    };

    // console.log('saveRecallMaterials payload', payload);

    saveRecallMaterials(payload);
  }, [id, itemsWithEnterInfo, saveRecallMaterials, selectedProductIds, selectedWarehouseLocation, showToast]);

  return (
    <div className={`p-6 px-4 flex flex-col gap-4 rounded-3xl w-[95vw] max-h-[90vh] bg-neutral-00 2xl:w-[80vw] 2xl:max-w-[1500px]`}>
      <div className='flex gap-2 justify-between'>
        <div className='flex flex-col gap-1'>
          <h2 className='text-2xl font-bold capitalize'>Thu hồi nguyên liệu</h2>
          <p className='text-base text-blue-fmrp'>{code || data?.productionOrder?.reference_no || 'LSX-27112571'}</p>
        </div>
        <div className='flex items-center gap-4'>
          <CustomDropdownRadioGroup
            className='w-[300px]'
            data={warehouseDropdownData}
            value={selectedWarehouseLocation?.id_warehouse_custom}
            onChange={option => {
              setSelectedWarehouseLocation(option);
              setWarehouseError(false);
            }}
            placeholder={'Chọn kho hàng'}
            showOnlyWarehouseLocation={true}
            disabled={false}
            isSearchable={true}
            searchValue={warehouseSearchTerm}
            onSearchChange={setWarehouseSearchTerm}
            isLoading={isLoadingWarehouses}
            buttonClassName={`${warehouseError && !selectedWarehouseLocation?.warehouse_id ? 'border-red-500' : ''}`}
          />
          <div className='flex gap-3 items-center'>
            {isProPackage ? (
              <button
                onClick={handleConfirmRecall}
                disabled={isSavingRecall}
                className={`flex items-center gap-2 text-sm font-medium rounded-lg py-3 px-4 w-fit text-white bg-blue-fmrp hover:bg-blue-fmrp/80 disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                <CheckIcon className='size-4' /> {isSavingRecall ? 'Đang lưu...' : 'Thu hồi'}
              </button>
            ) : (
              <PackageUpgradeButton />
            )}
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
      </div>

      <div className='flex-1 min-h-[60vh] max-h-[80vh] w-full flex flex-col gap-4 h-full'>
        <div className='flex-1 flex gap-4 overflow-hidden'>
          {/* Left Sidebar - Product List */}
          <div className='w-[280px] flex flex-col rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden'>
            <div className='p-3 bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6]'>
              <h2 className='text-sm font-semibold text-[#141522]'>Chọn thành phẩm để thu hồi</h2>
            </div>

            {isLoading ? (
              <Loading />
            ) : displayProducts.length === 0 ? (
              <div className='flex flex-col items-center justify-center h-full min-h-[300px] gap-3 p-4'>
                <NoData type='report' titleText='Không có sản phẩm nào' />
              </div>
            ) : (
              <Customscrollbar className='flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300'>
                <div className='p-2'>
                  <div className='flex items-center gap-2 mb-2'>
                    <CheckboxDefault checked={products.length > 0 && selectedProductIds.length === products.length} onChange={handleToggleAllProducts} label='Chọn tất cả' />
                  </div>
                  {displayProducts.map((product, index) => {
                    const isSelected = selectedProductIds.includes(product.poi_id);
                    return (
                      <div
                        key={`product-${index}`}
                        className={`p-2 rounded-md mb-2 cursor-pointer transition-all duration-200 ${
                          isSelected ? 'bg-gradient-to-br from-[#EBF5FF] to-[#D0E8FF] shadow-md shadow-blue-100/50' : 'bg-white hover:bg-[#F9FAFB] hover:shadow-sm'
                        }`}
                        onClick={() => handleToggleProduct(product.poi_id)}
                      >
                        <div className='flex items-center gap-2'>
                          <div onClick={e => e.stopPropagation()}>
                            <CheckboxDefault checked={isSelected} className='!space-x-0' onChange={() => handleToggleProduct(product.poi_id)} />
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
          <div className='flex-1 flex flex-col rounded-t-xl bg-white overflow-hidden'>
            <div className='flex justify-between items-center gap-10 p-2 bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6]'>
              <h3 className='text-sm font-semibold text-[#141522] whitespace-nowrap'>Chọn nguyên liệu cần thu hồi</h3>
              <div className='bg-white flex gap-x-2 items-center w-1/2 rounded-lg border border-[#D0D5DD] px-2 py-1.5 focus-within:border-transparent focus-within:ring-2 focus-within:ring-blue-500'>
                <input
                  type='text'
                  placeholder='Tìm kiếm theo tên nguyên vật liệu'
                  className='flex-1 border-none outline-none text-[#3A3E4C] placeholder-gray-300 text-xs'
                  value={materialsSearchTerm}
                  onChange={e => setMaterialsSearchTerm(e.target.value)}
                />
                {materialsSearchTerm && (
                  <button
                    type='button'
                    onClick={() => setMaterialsSearchTerm('')}
                    className='rounded-full bg-gray-100 hover:bg-gray-200 text-[#3A3E4C] p-1 transition'
                    aria-label='Xóa tìm kiếm'
                  >
                    <CloseXIcon className='size-3' />
                  </button>
                )}
                <button className='rounded-lg bg-[#0375F3] p-1'>
                  <MagnifyingGlassIcon className='size-3 text-white' />
                </button>
              </div>
            </div>

            {false ? (
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
                <NoData type='report' titleText='Không có nguyên liệu nào cho thành phẩm đã chọn' />
              </div>
            ) : (
              <div className='overflow-hidden flex-1'>
                <Customscrollbar className='max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300'>
                  <table className='min-w-full border-collapse table-fixed'>
                    <thead className='sticky top-0 z-10 responsive-text-base font-normal bg-white shadow-[0_1px_0_0_rgb(229,231,235)]'>
                      <tr>
                        <th className='pt-3 pb-1 px-3 text-center text-[#667085]'>
                          <CheckboxDefault checked={materials.length > 0 && selectedMaterialIds.length === materials.length} onChange={handleToggleAllMaterials} className='!space-x-0' />
                        </th>
                        <th className='font-normal pt-3 pb-1 pr-3 text-left text-[#667085] whitespace-nowrap'>Nguyên vật liệu</th>
                        <th className='font-normal pt-3 pb-1 px-3 text-center text-[#667085] whitespace-nowrap'>SL đã xuất</th>
                        <th className='font-normal pt-3 pb-1 px-3 text-center text-[#667085] whitespace-nowrap'>SL đã thu hồi</th>
                        {hasAnyValidLotDate && <th className='font-normal pt-3 pb-1 px-3 text-center text-[#667085] whitespace-nowrap'>Lot/date - Serial</th>}
                        <th className='font-normal pt-3 pb-1 px-3 text-center text-[#667085] whitespace-nowrap'>SL cần thu hồi</th>
                        <th className='font-normal pt-3 pb-1 px-2 text-center text-[#667085] whitespace-nowrap'>Quy đổi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedMaterials.map((material, index) => {
                        const materialId = material.item_variation_id || material.item_id || `material-${index}`;
                        const materialChecked = selectedMaterialIds.includes(materialId);
                        const warehouseData = mapLotsToDropdown(material.item_variation_id, material.lots);
                        const selectedWarehouse = selectedWarehouses[materialId];
                        const recallQuantity = recallQuantities[materialId] || 0;
                        const selectedWarehouseQuantity = Number(selectedWarehouse?.total_quantity ?? 0);
                        const materialHasLotDate = hasValidLotDate(material.lots);
                        const requireSelectLot = materialHasLotDate && !selectedWarehouse?.id_warehouse_custom;
                        const exportedQty = Number(material.quantity_export_manufacture || 0);
                        const returnedQty = Number(material.quantity_returned || 0);
                        const fullyRecalled = exportedQty > 0 && returnedQty >= exportedQty;

                        return (
                          <tr
                            key={`material-${index}`}
                            className='responsive-text-base border-b border-[#E5E7EB]/20 hover:bg-gradient-to-r hover:from-[#F9FAFB] hover:to-[#F3F4F6] transition-all duration-200 group cursor-pointer'
                            onClick={() => handleToggleMaterial(materialId)}
                          >
                            <td className='py-4 px-3 text-center'>
                              <div onClick={e => e.stopPropagation()}>
                                <CheckboxDefault checked={materialChecked} onChange={() => handleToggleMaterial(materialId)} className='!space-x-0' />
                              </div>
                            </td>
                            <td className='py-4 pr-3 text-left'>
                              <div className='flex flex-col'>
                                <h3 className='font-semibold text-[#141522]'>{material?.item_name}</h3>
                                <div className='flex flex-col gap-0.5'>
                                  <p className='text-[10px] font-normal text-[#667085]'>{material?.product_variation}</p>
                                  <p className='text-xs font-normal text-typo-blue-2'>{material?.item_code}</p>
                                </div>
                              </div>
                            </td>
                            <td className='py-4 px-3 text-center'>
                              <div className='flex items-center justify-center'>
                                <div className='flex flex-col items-start gap-1'>
                                  <p className='text-[#141522] font-medium responsive-text-lg'>
                                    {formatNumber(Number(material.quantity_export_manufacture || 0))} <span className='text-[#141522] font-medium text-xs'>/</span>
                                  </p>
                                  <span className='text-[#141522] responsive-text-xs font-medium'>{material.unit_manufacture_name}</span>
                                </div>
                              </div>
                            </td>
                            <td className='py-4 px-3 text-center'>
                              <div className='flex items-center justify-center'>
                                <div className='flex flex-col items-start gap-1'>
                                  <p className='responsive-text-lg font-semibold text-[#141522]'>
                                    {formatNumber(Number(material.quantity_returned || 0))} <span className='text-[#141522] font-medium text-xs'>/</span>
                                  </p>
                                  <span className='responsive-text-xs font-normal text-[#141522]'>{material.unit_manufacture_name}</span>
                                </div>
                              </div>
                            </td>
                            {fullyRecalled ? (
                              <td className='py-4 px-3 text-center' colSpan={hasAnyValidLotDate ? 3 : 2}>
                                <div className='py-2 text-xs font-normal text-[#991B1B] flex items-center justify-center gap-x-[2px]'>
                                  <IoIosAlert className='text-[#991B1B]' size={17} />
                                  Không còn nguyên liệu để thu hồi
                                </div>
                              </td>
                            ) : (
                              <>
                                {hasAnyValidLotDate && (
                                  <td className='py-4 px-2'>
                                    {materialHasLotDate ? (
                                      <div className='flex justify-center items-end' onClick={e => e.stopPropagation()}>
                                        <CustomDropdownRadioGroup
                                          className='w-[200px] 2xl:w-[250px]'
                                          data={warehouseData}
                                          value={selectedWarehouse?.id_warehouse_custom}
                                          onChange={option => {
                                            setSelectedWarehouses(prev => ({
                                              ...prev,
                                              [materialId]: option,
                                            }));
                                            // Gán mặc định SL cần thu hồi bằng tồn lot được chọn
                                            setRecallQuantities(prev => ({
                                              ...prev,
                                              [materialId]: Number(option?.total_quantity ?? 0),
                                            }));
                                            // Tự động chọn material khi chọn lot
                                            setSelectedMaterialIds(prev => (prev.includes(materialId) ? prev : [...prev, materialId]));
                                          }}
                                          placeholder='Chọn Lot/Date - Serial'
                                          showOnlyLotDate={true}
                                          minDropdownWidth={200}
                                          allowClear={true}
                                        />
                                      </div>
                                    ) : null}
                                  </td>
                                )}
                                <td className='py-4 px-2'>
                                  <div
                                    className='flex justify-center items-end'
                                    onClick={e => {
                                      e.stopPropagation();
                                      if (requireSelectLot) {
                                        showToast('error', 'Vui lòng chọn Lot/Date trước khi nhập số lượng');
                                      }
                                    }}
                                  >
                                    <InputNumberCustom
                                      state={recallQuantity}
                                      setState={value => {
                                        setRecallQuantities(prev => ({
                                          ...prev,
                                          [materialId]: value,
                                        }));
                                        // Nếu không yêu cầu Lot/Date, tự chọn material khi user nhập số lượng
                                        if (!materialHasLotDate) {
                                          setSelectedMaterialIds(prev => (prev.includes(materialId) ? prev : [...prev, materialId]));
                                        }
                                      }}
                                      onBeforeChange={() => {
                                        if (requireSelectLot) {
                                          showToast('error', 'Vui lòng chọn Lot/Date trước khi nhập số lượng');
                                          return true; // block change
                                        }
                                        return false;
                                      }}
                                      className='bg-white'
                                      max={materialHasLotDate ? selectedWarehouseQuantity || 0 : Number(material.quantity_recall || 0)}
                                      allowDecimal={true}
                                      useConfigFormat={false}
                                      exceedMessage={materialHasLotDate ? 'Số lượng không được vượt quá số lượng tồn lot được chọn' : 'Số lượng không được vượt quá số lượng cần thu hồi'}
                                    />
                                    <span className='text-[#141522] text-xs font-medium min-w-10 whitespace-nowrap'>/{material.unit_manufacture_name}</span>
                                  </div>
                                </td>
                                <td className='py-4 px-2 text-center min-w-[150px]'>
                                  <div className='flex gap-2 items-center justify-center'>
                                    <div className='text-start'>
                                      <p className='text-blue-fmrp font-medium text-base whitespace-nowrap'>
                                        {formatNumber(recallQuantity)} <span className='text-[#141522] font-medium text-xs'>/</span>
                                      </p>
                                      <span className='text-[#141522] text-xs font-medium'>{material.unit_manufacture_name}</span>
                                    </div>
                                    <ApproximateEqualsIcon className='size-4 text-[#141522]' />
                                    <div className='text-start'>
                                      <p className='text-blue-fmrp font-medium text-base whitespace-nowrap'>
                                        {formatNumber(Number(recallQuantity / Number(material.exchange_manufacture ?? 0)))} <span className='text-[#141522] font-medium text-xs'>/</span>
                                      </p>
                                      <span className='text-[#141522] text-xs font-medium'>{material.unit_parent_name}</span>
                                    </div>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
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
    </div>
  );
};

export default PopupRecallMaterials;
