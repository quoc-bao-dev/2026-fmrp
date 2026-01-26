import CheckboxDefault from '@/components/common/checkbox/CheckboxDefault';
import SearchActionInput from '@/components/common/input/SearchActionInput';
import TabSwitcherWithSlidingBackground from '@/components/common/tab/TabSwitcherWithSlidingBackground';
import { CloseXIcon, WarningIcon } from '@/components/icons';
import { WarehouseSelectDropdown } from '@/components/UI/filterComponents/WarehouseSelectDropdown';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import PopupCustom from '@/components/UI/popup';
import useToast from '@/hooks/useToast';
import useSetingServer from '@/hooks/useConfigNumber';
import { useWarehouseProperties } from '@/containers/manufacture/warehouse-transfer/hooks/useWarehouseProperties';
import { useListRecallKeepStock, useProductionOrderKeepStok, useSaveRecoveryKeepStock } from '@/managers/api/productions-order/useRecallKeepStock';
import { useLookupWarehouses } from '@/managers/api/productions-order/useRecallMaterials';
import formatNumber from '@/utils/helpers/formatnumber';
import { searchWithoutDiacritics } from '@/utils/helpers/stringHelper';
import { Edit2 } from 'iconsax-react';
import moment from 'moment';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { IoIosAlert } from 'react-icons/io';
import { Tooltip } from 'react-tippy';
import 'react-tippy/dist/tippy.css';
import InputNumberCustom from './shared/InputNumberCustom';
import { convertWarehousesToDropdownData, CustomDropdownRadioGroup } from './shared/WarehouseDropdown';

const tabs = [
  { id: 'material', name: 'Nguyên vật liệu' },
  { id: 'product', name: 'Bán thành phẩm' },
];

const PopupRecallStock = ({ className, forceOpen = false, onForceClose, poId, codeLSX, branchId, ppId }) => {
  const showToast = useToast();
  const dataSeting = useSetingServer();
  const { isWarehousePropertiesEnabled, warehousePropertyLabels } = useWarehouseProperties(dataSeting);
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState({ id: 'material', name: 'Nguyên vật liệu' });
  const [searchTerm, setSearchTerm] = useState('');
  // Lưu state riêng cho từng tab
  const [warehouseSelectionsByTab, setWarehouseSelectionsByTab] = useState({ material: {}, product: {} });
  const [selectedItemsByTab, setSelectedItemsByTab] = useState({ material: [], product: [] });
  const [quantityByItemByTab, setQuantityByItemByTab] = useState({ material: {}, product: {} });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showQuickSelectHint, setShowQuickSelectHint] = useState(true);
  const [isQuickSelectMode, setIsQuickSelectMode] = useState(false);
  const [selectedWarehouseForQuickSelect, setSelectedWarehouseForQuickSelect] = useState(null);
  const [errorBanner, setErrorBanner] = useState({ message: '', errors: [] });

  // Lấy state của tab hiện tại
  const selectedItems = selectedItemsByTab[activeTab.id] || [];
  const warehouseSelections = warehouseSelectionsByTab[activeTab.id] || {};
  const quantityByItem = quantityByItemByTab[activeTab.id] || {};

  // Tính toán params cho useListRecallKeepStock dựa trên tab và selectedProduct
  const recallKeepStockParams = useMemo(() => {
    if (activeTab.id === 'product') {
      // Tab product: cần ppi_id và level
      if (!selectedProduct?.ppi_id) return null;
      return {
        po_id: poId,
        type: 2,
        ppi_id: selectedProduct.ppi_id,
        level: selectedProduct?.selectedLevel?.id ?? 0,
      };
    } else {
      // Tab material: chỉ cần type = 1
      return {
        po_id: poId,
        type: 1,
      };
    }
  }, [activeTab.id, poId, selectedProduct]);

  const shouldFetchRecallKeepStock = useMemo(() => {
    if (!poId || !open) return false;
    if (activeTab.id === 'product') {
      // Tab product: chỉ fetch khi đã chọn sản phẩm
      return !!selectedProduct?.ppi_id;
    }
    // Tab material: fetch ngay khi mở
    return true;
  }, [poId, open, activeTab.id, selectedProduct]);

  const { data: dataListRecallKeepStock, isLoading: isLoadingListRecallKeepStock } = useListRecallKeepStock(recallKeepStockParams, shouldFetchRecallKeepStock);
  const { data: dataProductionOrderKeepStok, isLoading: isLoadingProductionOrder } = useProductionOrderKeepStok({ pPlan_id: ppId, is_recovery: 1 }, activeTab.id === 'product' && open);
  const { data: warehousesLookup, isLoading: isLoadingWarehouses } = useLookupWarehouses(
    {
      is_system: 0,
      is_location: 1,
      branch_ids: [branchId],
      is_system_location: 0,
    },
    !!open
  );

  const handleClose = () => {
    setOpen(false);
    setSearchTerm('');
    setWarehouseSelectionsByTab({ material: {}, product: {} });
    setSelectedProduct(null);
    setSelectedItemsByTab({ material: [], product: [] });
    setQuantityByItemByTab({ material: {}, product: {} });
    setIsQuickSelectMode(false);
    setSelectedWarehouseForQuickSelect(null);
    setShowQuickSelectHint(true);
    setErrorBanner({ message: '', errors: [] });
    onForceClose?.();
  };

  const handleSaveError = errorData => {
    setErrorBanner({
      message: errorData.message || 'Thu hồi nguyên liệu thất bại',
      errors: errorData.errors || [],
    });
  };

  const { mutate: saveRecoveryKeepStock, isPending: isLoadingSubmit } = useSaveRecoveryKeepStock(handleClose, ppId, handleSaveError);

  const rawItems = dataListRecallKeepStock?.isSuccess ? dataListRecallKeepStock?.data?.items || [] : [];

  const getItemId = item => `${item?.item_variation_id || item?.id_items || 'item'}-${item?.lot || 'lot'}-${item?.expiration_date || ''}`;
  const getMaxRecoverable = item => Math.max(0, Number(item?.quantity_keep ?? 0) - Number(item?.quantity_exported ?? 0) - Number(item?.quantity_recovered ?? 0));
  const selectIfSelectable = (item, itemId) => {
    if (!item || getMaxRecoverable(item) <= 0) return;
    setSelectedItemsByTab(prev => ({
      ...prev,
      [activeTab.id]: prev[activeTab.id]?.includes(itemId) ? prev[activeTab.id] : [...(prev[activeTab.id] || []), itemId],
    }));
  };

  const items = useMemo(() => {
    if (!Array.isArray(rawItems)) return [];
    return rawItems;
  }, [rawItems]);

  const transformedWarehouses = useMemo(() => {
    if (!warehousesLookup?.warehouses || !Array.isArray(warehousesLookup.warehouses)) return [];

    return warehousesLookup.warehouses.map(warehouse => ({
      name_warehouse: warehouse.name || warehouse.code || '',
      warehouse_id: warehouse.id || '',
      items: (warehouse.locations?.rows || []).map(location => ({
        id_warehouse_custom: `${warehouse.id}-${location.id}`,
        name_location: location.name || location.code || '',
        location_id: location.id || '',
        warehouse_id: warehouse.id || '',
        lot: '',
        expiration_date: '',
        total_quantity: 0,
        quantity_warehouse: 0,
      })),
    }));
  }, [warehousesLookup]);

  const warehouseDropdownData = useMemo(() => convertWarehousesToDropdownData(transformedWarehouses), [transformedWarehouses]);

  const productOptions = useMemo(() => {
    if (activeTab.id !== 'product') return [];
    return dataProductionOrderKeepStok?.data?.items_poi || [];
  }, [activeTab.id, dataProductionOrderKeepStok]);

  // Gán sẵn số lượng mặc định = tối đa có thể thu hồi cho mọi dòng ngay khi dữ liệu thay đổi
  useEffect(() => {
    if (!open || !Array.isArray(rawItems) || rawItems.length === 0) return;

    setQuantityByItemByTab(prev => {
      // Reset lại tất cả giá trị cho tab hiện tại khi dữ liệu thay đổi
      const updatedQuantities = {};

      rawItems.forEach(item => {
        const itemId = getItemId(item);
        updatedQuantities[itemId] = getMaxRecoverable(item);
      });

      return { ...prev, [activeTab.id]: updatedQuantities };
    });
  }, [rawItems, activeTab.id, open]);

  const handleSelectProduct = option => {
    if (!option) {
      setSelectedProduct(null);
      return;
    }
    if (!option.selectedLevel && Array.isArray(option.level_bom) && option.level_bom.length > 0) {
      setSelectedProduct({
        ...option,
        selectedLevel: option.level_bom[0],
      });
    } else {
      setSelectedProduct(option);
    }
  };

  const renderProductOption = (option, { context } = {}) => {
    if (!option) return null;

    const hasMultiLevel = Array.isArray(option?.level_bom) && option.level_bom.length > 0;
    const selectedLevelId = selectedProduct?.ppi_id === option?.ppi_id ? selectedProduct?.selectedLevel?.id : null;
    const displayLevelName = option?.selectedLevel?.name || (selectedLevelId && option.level_bom?.find(lv => lv.id === selectedLevelId)?.name) || (hasMultiLevel ? option.level_bom[0]?.name : null);

    // Hiển thị value đã chọn
    if (context === 'value') {
      return (
        <div className='flex items-center gap-2'>
          <div className='size-[60px] shrink-0'>
            <img src={option.images ? option.images : '/icon/noimagelogo.png'} alt='Product Image' className='object-cover w-full h-full rounded-md' />
          </div>
          <div className='flex flex-col items-start gap-1 min-w-0'>
            <h3 className='font-medium responsive-text-sm truncate'>{option?.label}</h3>
            <div className='flex flex-col gap-0.5 items-start text-left'>
              <span className='responsive-text-xs text-[#667085]'>
                {option?.item_code} - {option?.item_variation}
              </span>
              <h5 className='responsive-text-xs'>{option?.reference_no_detail}</h5>
              {hasMultiLevel && displayLevelName && <span className='px-1 py-[1px] rounded bg-blue-fmrp/10 text-blue-600 text-[9px]/[150%] font-semibold'>{`BOM ${displayLevelName}`}</span>}
            </div>
          </div>
        </div>
      );
    }

    // Hiển thị trong menu dropdown
    return (
      <div className='flex flex-col gap-2 py-1'>
        <div className='flex items-center gap-2 w-full'>
          <div className='size-[60px] shrink-0 z-[2]'>
            <img src={option.images ? option.images : '/icon/noimagelogo.png'} alt='Product Image' className='object-cover w-full h-full rounded' />
          </div>
          <div className='flex flex-col gap-1 text-left'>
            <h3 className='font-medium responsive-text-sm'>{option?.label}</h3>
            <h5 className='responsive-text-xs'>
              {option?.item_code} - {option?.item_variation}
            </h5>
            <h5 className='responsive-text-xs'>{option?.reference_no_detail}</h5>
          </div>
        </div>
        {hasMultiLevel && (
          <div className='flex flex-col gap-2 pl-12 relative z-1'>
            {option.level_bom.map((level, levelIndex) => {
              const isActive = selectedLevelId === level.id;
              return (
                <label
                  key={`${option.ppi_id}_${level.id}`}
                  className='relative flex items-center gap-2 cursor-pointer'
                  onMouseDown={event => {
                    event.preventDefault();
                    event.stopPropagation();
                  }}
                  onClick={event => {
                    event.preventDefault();
                    event.stopPropagation();
                    // Cập nhật selectedProduct với level BOM được chọn
                    setSelectedProduct(prev => (prev && prev.ppi_id === option.ppi_id ? { ...prev, selectedLevel: level } : { ...option, selectedLevel: level }));
                  }}
                >
                  {levelIndex > 0 && <div className='absolute -left-4 -top-8 w-[1px] h-8 bg-gray-200 z-0' />}
                  <div className='absolute -left-4 -top-4 w-3 h-7 border-l-2 border-b-2 border-gray-200 rounded-bl-lg z-0' />
                  <button
                    type='button'
                    className={`w-4 h-4 rounded-full border transition-all duration-200 flex items-center justify-center relative z-10 ${isActive ? 'border-blue-600' : 'border-gray-300'}`}
                    onMouseDown={event => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                    onClick={event => {
                      event.preventDefault();
                      event.stopPropagation();
                      setSelectedProduct(prev => (prev && prev.ppi_id === option.ppi_id ? { ...prev, selectedLevel: level } : { ...option, selectedLevel: level }));
                    }}
                  >
                    {isActive && <span className='w-2 h-2 rounded-full bg-blue-600' />}
                  </button>
                  <span
                    className={`px-1.5 py-1 rounded responsive-text-xs font-semibold relative z-10 transition-all duration-300 ${
                      isActive ? 'bg-blue-600 text-white shadow-sm ring-1 ring-blue-100' : 'bg-blue-fmrp/10 text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    BOM {level.name}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  let filteredItems = items;

  if (searchTerm.trim()) {
    filteredItems = filteredItems.filter(item => {
      const name = item?.item_name || '';
      const code = item?.item_code || '';
      const variation = item?.variant_name || '';
      return searchWithoutDiacritics(name, searchTerm) || searchWithoutDiacritics(code, searchTerm) || searchWithoutDiacritics(variation, searchTerm);
    });
  }

  // Sắp xếp: các item đã chọn lên đầu
  filteredItems = [...filteredItems].sort((a, b) => {
    const aIsSelected = selectedItems.includes(getItemId(a));
    const bIsSelected = selectedItems.includes(getItemId(b));
    const aNoRemaining = getMaxRecoverable(a) <= 0;
    const bNoRemaining = getMaxRecoverable(b) <= 0;

    // Ưu tiên: còn số lượng -> đã hết; trong cùng nhóm, ưu tiên item đang được chọn
    if (aNoRemaining !== bNoRemaining) return aNoRemaining ? 1 : -1;
    if (aIsSelected !== bIsSelected) return aIsSelected ? -1 : 1;
    return 0; // Giữ nguyên thứ tự nếu cùng trạng thái
  });

  const selectableIds = useMemo(() => filteredItems.filter(item => getMaxRecoverable(item) > 0).map(item => getItemId(item)), [filteredItems]);
  const allSelectableSelected = useMemo(() => selectableIds.length > 0 && selectableIds.every(id => selectedItems.includes(id)), [selectableIds, selectedItems]);

  const handleSelectWarehouse = (itemId, warehouse, item) => {
    setWarehouseSelectionsByTab(prev => ({
      ...prev,
      [activeTab.id]: {
        ...prev[activeTab.id],
        [itemId]: warehouse?.id_warehouse_custom || '',
      },
    }));
    selectIfSelectable(item, itemId);
  };

  const handleChangeQuantity = (itemId, value, item) => {
    setQuantityByItemByTab(prev => ({
      ...prev,
      [activeTab.id]: {
        ...prev[activeTab.id],
        [itemId]: value,
      },
    }));
    selectIfSelectable(item, itemId);
  };

  const handleToggleItemSelection = (item, itemId) => {
    if (getMaxRecoverable(item) <= 0) {
      showToast('error', 'Không còn nguyên liệu để thu hồi');
      return;
    }
    setSelectedItemsByTab(prev => {
      const currentTabItems = prev[activeTab.id] || [];
      if (currentTabItems.includes(itemId)) {
        return {
          ...prev,
          [activeTab.id]: currentTabItems.filter(id => id !== itemId),
        };
      } else {
        return {
          ...prev,
          [activeTab.id]: [...currentTabItems, itemId],
        };
      }
    });
  };

  const handleSelectAllItems = checked => {
    if (checked) {
      if (selectableIds.length === 0) {
        showToast('error', 'Không còn nguyên liệu nào để thu hồi');
        return;
      }
      setSelectedItemsByTab(prev => ({
        ...prev,
        [activeTab.id]: selectableIds,
      }));
    } else {
      setSelectedItemsByTab(prev => ({
        ...prev,
        [activeTab.id]: [],
      }));
    }
  };

  // Xử lý chọn nhanh kho
  const handleToggleQuickSelectMode = () => {
    setIsQuickSelectMode(true);
    setSelectedItemsByTab(prev => ({
      ...prev,
      [activeTab.id]: [],
    }));
    setSelectedWarehouseForQuickSelect(null);
    setShowQuickSelectHint(true);
  };

  const handleCancelQuickSelectMode = () => {
    setIsQuickSelectMode(false);
    setSelectedItemsByTab(prev => ({
      ...prev,
      [activeTab.id]: [],
    }));
    setSelectedWarehouseForQuickSelect(null);
    setShowQuickSelectHint(false);
  };

  // Lấy danh sách kho từ các mặt hàng đã chọn (trả về warehouseDropdownData format)
  const getAvailableWarehouses = () => {
    if (selectedItems.length === 0) return [];
    return warehouseDropdownData || [];
  };

  // Xử lý khi chọn kho trong chế độ chọn nhanh
  const handleQuickSelectWarehouse = warehouse => {
    if (!warehouse || selectedItems.length === 0) return;
    setSelectedWarehouseForQuickSelect(warehouse?.id_warehouse_custom || '');

    // Cập nhật warehouse cho tất cả các mặt hàng đã chọn
    selectedItems.forEach(itemId => {
      handleSelectWarehouse(itemId, warehouse);
    });

    // Reset selected warehouse và tắt chế độ chọn nhanh
    setSelectedWarehouseForQuickSelect(null);
    handleCancelQuickSelectMode();
  };

  const handleSubmit = () => {
    // Reset error banner khi submit lại
    setErrorBanner({ message: '', errors: [] });

    if (!selectedItems.length) {
      showToast('error', 'Vui lòng chọn ít nhất 1 nguyên liệu hoặc bán thành phẩm để thu hồi.');
      return;
    }

    const ppId = dataListRecallKeepStock?.data?.pp_id;
    const itemsPayload =
      rawItems
        // Chỉ lấy những dòng đang được chọn
        .filter(item => selectedItems.includes(getItemId(item)))
        .map(item => {
          const id = getItemId(item);
          const quantity_enter = Number(quantityByItem[id] || 0);
          const selectedWarehouse = warehouseSelections[id] || '';
          const [warehouse_id_enter = null, location_id_enter = null] = selectedWarehouse ? selectedWarehouse.split('-') : [];

          return {
            ...item,
            quantity_enter,
            warehouse_id_enter,
            location_id_enter,
          };
        }) || [];

    if (!itemsPayload.length) {
      showToast('error', 'Vui lòng nhập thông tin cho các dòng đã chọn.');
      return;
    }

    // Cảnh báo nếu còn dòng chưa nhập số lượng hoặc chưa chọn kho/vị trí
    const invalidItems = itemsPayload.filter(it => !(Number(it.quantity_enter) > 0 && it.warehouse_id_enter && it.location_id_enter));
    if (invalidItems.length) {
      showToast('error', 'Vui lòng nhập số lượng > 0 và chọn kho/vị trí cho tất cả dòng đã chọn.');
      return;
    }

    const payload = {
      po_id: poId,
      type: activeTab.id === 'product' ? 2 : 1,
      pp_id: ppId,
      ...(activeTab.id === 'product' && selectedProduct?.ppi_id
        ? {
            ppi_id: selectedProduct.ppi_id,
            level: selectedProduct?.selectedLevel?.id ?? 0,
          }
        : {}),
      items: itemsPayload,
    };

    saveRecoveryKeepStock(payload);
  };

  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
      onForceClose?.();
    }
  }, [forceOpen, onForceClose]);

  useEffect(() => {
    if (open) {
      setSelectedItemsByTab({ material: [], product: [] });
      setShowQuickSelectHint(true);
      setIsQuickSelectMode(false);
      setSelectedWarehouseForQuickSelect(null);
    }
  }, [open]);

  useEffect(() => {
    if (showQuickSelectHint) {
      const timer = setTimeout(() => setShowQuickSelectHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showQuickSelectHint]);

  return (
    <PopupCustom
      title={
        <div className='flex flex-col gap-1'>
          <h2 className='text-2xl font-bold capitalize'>Thu hồi giữ kho nguyên vật liệu</h2>
          <p className='text-base text-blue-fmrp'>{codeLSX || ''}</p>
        </div>
      }
      open={open}
      onClose={handleClose}
      classNameBtn={className}
      classNameModeltime='!w-[1200px] max-w-[95vw] xl:max-w-[1200px] max-h-[95vh]'
    >
      <div className='mt-4'>
        {errorBanner.errors.length > 0 && (
          <div className='py-3 px-4 flex flex-col gap-3 bg-[#FFEEF0] border border-[#991B1B] rounded-lg shadow-sm mb-4'>
            <div className='flex items-start justify-between gap-3'>
              <div className='flex items-start gap-2'>
                <WarningIcon className='size-5 text-[#C81E1E]' />
                <div className='flex flex-col gap-1'>
                  <h3 className='text-sm font-semibold text-[#EE1E1E]'>{errorBanner.errors.length} lỗi khi thu hồi</h3>
                  {errorBanner.message && <p className='text-xs font-normal text-neutral-07'>{errorBanner.message}</p>}
                </div>
              </div>
              <button type='button' onClick={() => setErrorBanner({ message: '', errors: [] })} className='p-1 rounded-full hover:bg-[#F8D7DA] transition' aria-label='Đóng cảnh báo lỗi'>
                <CloseXIcon className='size-4 text-[#991B1B]' />
              </button>
            </div>
            <div className='flex flex-col gap-2 max-h-60 overflow-auto pr-2.5 scrollbar-thin scrollbar-thumb-[#F4B4B8] scrollbar-track-[#FFE3E6]'>
              {errorBanner.errors.map((errorItem, index) => (
                <div
                  key={`${errorItem.item_code || index}-${errorItem.lot || 'lot'}-${errorItem.expiration_date || ''}-${index}`}
                  className='px-3 py-2 bg-white rounded-md border border-[#F4B4B8] flex flex-col gap-1'
                >
                  <p className='text-sm font-medium text-[#991B1B]'>
                    Số lượng thu hồi không đủ: {formatNumber(errorItem.quantity_enter || 0)} (thiếu {formatNumber(errorItem.quantity_missing || 0)})
                  </p>
                  <div className='flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-neutral-06'>
                    <span>
                      Mã hàng: <span className='font-semibold text-neutral-07'>{errorItem.item_code || '—'}</span>
                    </span>
                    <span>
                      Tên hàng: <span className='font-semibold text-neutral-07'>{errorItem.item_name || '—'}</span>
                    </span>
                    {errorItem.item_variation && (
                      <span>
                        Biến thể: <span className='font-semibold text-neutral-07'>{errorItem.item_variation}</span>
                      </span>
                    )}
                    {errorItem.lot && (
                      <span>
                        Lot: <span className='font-semibold text-neutral-07'>{errorItem.lot}</span>
                      </span>
                    )}
                    {errorItem.expiration_date && (
                      <span>
                        Date: <span className='font-semibold text-neutral-07'>{moment(errorItem.expiration_date).format('DD/MM/YYYY')}</span>
                      </span>
                    )}
                    {Array.isArray(warehousePropertyLabels) &&
                      warehousePropertyLabels.length > 0 &&
                      warehousePropertyLabels.map(({ key, label }) => {
                        if (!label) return null;
                        const value = errorItem?.[key];

                        // Nếu isWarehousePropertiesEnabled tắt và thuộc tính không có giá trị → ẩn
                        if (!isWarehousePropertiesEnabled && (value == null || value === '')) return null;

                        return (
                          <span key={key}>
                            {label}: <span className='font-semibold text-neutral-07'>{value == null || value === '' ? '-' : value}</span>
                          </span>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className='flex items-center justify-between gap-4 my-4'>
          <TabSwitcherWithSlidingBackground
            tabs={tabs}
            activeTab={activeTab}
            onChange={tab => {
              setActiveTab(tab);
            }}
            className='!p-1 flex-shrink-0 !overflow-visible'
            buttonClassName='!py-1.5 !px-3 !responsive-text-sm'
            buttonActiveClassName='!top-1 !bottom-1'
          />

          <div className='flex items-center gap-3'>
            <SearchActionInput value={searchTerm} onChange={setSearchTerm} placeholder='Tìm kiếm theo tên, mã sản phẩm' className='w-[320px]' />
            {!isQuickSelectMode ? (
              <button
                onClick={handleToggleQuickSelectMode}
                className='px-4 py-2 bg-blue-fmrp text-white rounded-lg hover:bg-blue-fmrp/80 transition-all duration-300 text-sm font-medium flex items-center gap-2'
              >
                <Edit2 size='18' variant='Bold' />
                Chọn kho nhanh
              </button>
            ) : (
              <div className='relative'>
                <div className='flex items-center gap-3'>
                  {selectedItems?.length > 0 ? (
                    <CustomDropdownRadioGroup
                      data={getAvailableWarehouses()}
                      value={selectedWarehouseForQuickSelect || ''}
                      onChange={option => {
                        if (option) {
                          handleQuickSelectWarehouse(option);
                        }
                      }}
                      placeholder='Vui lòng chọn kho'
                      className='w-[300px]'
                      allowClear={false}
                      minDropdownWidth={300}
                      showOnlyWarehouseLocation
                    />
                  ) : (
                    <span className='text-sm text-orange-500 font-medium'>Vui lòng chọn ít nhất 1 mặt hàng</span>
                  )}

                  <button onClick={handleCancelQuickSelectMode} className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-300 text-sm font-medium'>
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {activeTab.id === 'product' && (
          <div className='mb-4 flex items-center gap-3'>
            <WarehouseSelectDropdown
              className='w-[360px]'
              dropdownClassName='!w-[360px]'
              options={productOptions}
              value={selectedProduct}
              onChange={handleSelectProduct}
              placeholder='Chọn bán thành phẩm'
              allowClear
              isLoading={isLoadingProductionOrder}
              formatOptionLabel={renderProductOption}
              hiddenDropdown={true}
              buttonClassName='px-2'
            />
          </div>
        )}

        <div className='flex-1 max-h-[60vh] flex flex-col gap-4'>
          <div className='overflow-hidden flex-1 relative'>
            <div className={`min-h-[40vh] overflow-y-auto pr-2 ${errorBanner.errors.length > 0 ? 'max-h-[40vh]' : 'max-h-[60vh]'}`}>
              <table className='w-full border-separate' style={{ borderSpacing: '0 4px' }}>
                <thead className='bg-white sticky top-[-1px] z-[2] shadow-sm'>
                  <tr>
                    <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[62px]'>
                      <Tooltip title='Bấm vào để chọn tất cả' trigger='manual' open={showQuickSelectHint && isQuickSelectMode} position='bottom' theme='dark' distance={12} animation='perspective'>
                        <div className='flex justify-center'>
                          <CheckboxDefault checked={allSelectableSelected} onChange={handleSelectAllItems} />
                        </div>
                      </Tooltip>
                    </th>
                    <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[62px]'>STT</th>
                    <th className='py-2 px-3 border-b border-gray-200 text-left text-sm font-normal text-[#9295A4] w-auto whitespace-nowrap'>Mặt hàng</th>
                    <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[120px]'>SL đã giữ</th>
                    <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[120px]'>SL đã xuất</th>
                    <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[120px] whitespace-nowrap'>SL đã thu hồi</th>
                    <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[250px]'>Kho nhận</th>
                    <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[200px]'>Số lượng</th>
                  </tr>
                </thead>
                <tbody className='[&>tr]:mb-1' style={{ gap: '4px' }}>
                  {isLoadingListRecallKeepStock ? (
                    <tr>
                      <td colSpan={9} className='py-8 text-center text-sm text-[#667085]'>
                        <Loading />
                      </td>
                    </tr>
                  ) : !filteredItems.length ? (
                    <tr>
                      <td colSpan={9} className='py-8'>
                        <NoData
                          type='report'
                          className='min-h-[400px]'
                          titleText={activeTab.id === 'product' && !selectedProduct ? 'Vui lòng chọn bán thành phẩm' : dataListRecallKeepStock?.message || 'Không có dữ liệu'}
                        />
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((e, index) => {
                      const itemId = getItemId(e);
                      const maxRecoverable = Math.max(0, Number(e?.quantity_keep ?? 0) - Number(e?.quantity_exported ?? 0) - Number(e?.quantity_recovered ?? 0));
                      const isSelected = selectedItems.includes(itemId);
                      const isSelectable = maxRecoverable > 0;
                      return (
                        <tr
                          key={itemId}
                          className={`relative cursor-pointer border-b border-[#E5E7EB]/20 ${
                            isQuickSelectMode ? `${isSelectable && isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}` : 'hover:bg-gray-50'
                          }`}
                          onClick={() => {
                            handleToggleItemSelection(e, itemId);
                          }}
                        >
                          <td className='py-2 px-3 text-center' onClick={ev => ev.stopPropagation()}>
                            <CheckboxDefault
                              checked={isSelected}
                              onChange={event => {
                                event?.stopPropagation?.();
                                handleToggleItemSelection(e, itemId);
                              }}
                            />
                          </td>
                          <td className='py-2 px-3 text-center text-sm font-semibold'>{index + 1}</td>
                          <td className='py-2 px-3 text-left min-w-[290px]'>
                            <div className='flex gap-2 min-w-0 '>
                              <div className='w-16 h-16 rounded flex items-center justify-center flex-shrink-0'>
                                <Image src={e?.image || '/icon/default/default.png'} alt={e?.item_name || 'default'} width={64} height={64} className='object-cover rounded' />
                              </div>
                              <div className='flex flex-col'>
                                <h3 className='text-sm font-semibold text-[#141522]'>{e?.item_name}</h3>
                                <p className='text-[10px] font-normal text-[#667085]'>{e?.variant_name}</p>
                                <p className='text-xs font-normal text-typo-blue-2'>{e?.item_code}</p>
                                {e?.serial && <p className='text-[10px] font-normal text-[#667085]'>Serial: {e?.serial}</p>}
                                {(e?.lot || e?.expiration_date) && (
                                  <p className='text-[10px] font-normal text-[#667085]'>
                                    Lot{e?.lot ? `: ${e.lot}` : ''}
                                    {e?.lot && e?.expiration_date ? ' - ' : ''}
                                    {e?.expiration_date ? `Date: ${moment(e.expiration_date).format('DD/MM/YYYY')}` : ''}
                                  </p>
                                )}
                                {activeTab.id === 'material' && Array.isArray(warehousePropertyLabels) && warehousePropertyLabels.length > 0 && (
                                  <div className='flex gap-1 flex-wrap'>
                                    {warehousePropertyLabels.map(({ key, label }) => {
                                      if (!label) return null;
                                      const value = e?.[key];
                                      // Hiển thị nếu isWarehousePropertiesEnabled bật HOẶC thuộc tính có giá trị
                                      if (!isWarehousePropertiesEnabled && (value == null || value === '')) return null;
                                      return (
                                        <div key={key} className='flex gap-0.5 text-[#667085]'>
                                          <h6 className='text-[10px]'>{label}:</h6>
                                          <h6 className='text-[10px] px-1 text-left'>{value == null || value === '' ? '-' : value}</h6>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className='py-2 px-3 text-center whitespace-nowrap'>
                            <span className='text-sm font-medium text-[#141522]'>
                              {`${formatNumber(+(e?.quantity_keep ?? 0))} / `} <span className='text-[11px] text-[#667085]'>{e?.unit_name || ''}</span>
                            </span>
                          </td>
                          <td className='py-2 px-3 text-center whitespace-nowrap'>
                            <span className='text-sm font-medium text-[#141522]'>
                              {+(e?.quantity_exported ?? 0) === 0 ? (
                                '-'
                              ) : (
                                <>
                                  {`${formatNumber(+(e?.quantity_exported ?? 0))} / `}
                                  <span className='text-[11px] text-[#667085]'>{e?.unit_name || ''}</span>
                                </>
                              )}
                            </span>
                          </td>
                          <td className='py-2 px-3 text-center whitespace-nowrap'>
                            <span className='text-sm font-medium text-[#141522]'>
                              {+(e?.quantity_recovered ?? 0) === 0 ? (
                                '-'
                              ) : (
                                <>
                                  {`${formatNumber(+(e?.quantity_recovered ?? 0))} / `}
                                  <span className='text-[11px] text-[#667085]'>{e?.unit_name || ''}</span>
                                </>
                              )}
                            </span>
                          </td>
                          {maxRecoverable <= 0 ? (
                            <td className='py-2 px-3 text-center text-[#991B1B] text-xs font-medium' colSpan={2}>
                              <div className='flex items-center justify-center gap-1 py-2'>
                                <IoIosAlert className='text-[#991B1B]' size={17} />
                                Không còn nguyên liệu để thu hồi
                              </div>
                            </td>
                          ) : (
                            <>
                              <td className='py-2 px-3 text-center max-w-[250px]' onClick={ev => ev.stopPropagation()}>
                                <CustomDropdownRadioGroup
                                  data={warehouseDropdownData}
                                  value={warehouseSelections[itemId] || ''}
                                  onChange={option => handleSelectWarehouse(itemId, option, e)}
                                  placeholder='Chọn kho'
                                  className='w-full'
                                  allowClear
                                  minDropdownWidth={250}
                                  disabled={isQuickSelectMode}
                                  showOnlyWarehouseLocation
                                  isSearchable
                                  isLoading={isLoadingWarehouses}
                                />
                              </td>
                              <td className='py-2 px-3' onClick={ev => ev.stopPropagation()}>
                                <InputNumberCustom
                                  state={+(quantityByItem[itemId] || 0)}
                                  setState={value => handleChangeQuantity(itemId, value, e)}
                                  min={0}
                                  max={maxRecoverable}
                                  className='w-full justify-between'
                                  classNameInput='w-16 text-sm'
                                  useConfigFormat={false}
                                  underflowMessage='Số lượng phải lớn hơn hoặc bằng 0'
                                />
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className='flex gap-2 justify-end'>
            <div onClick={handleClose} className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-300 text-sm font-medium'>
              Thoát
            </div>
            <button
              onClick={handleSubmit}
              disabled={isLoadingSubmit}
              className='px-4 py-2 bg-blue-fmrp text-white rounded-lg hover:bg-blue-fmrp/80 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 text-sm font-medium'
            >
              Thu hồi
            </button>
          </div>
        </div>
      </div>
    </PopupCustom>
  );
};

export default PopupRecallStock;
