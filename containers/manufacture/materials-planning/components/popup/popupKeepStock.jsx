import apiMaterialsPlanning from '@/Api/apiManufacture/manufacture/materialsPlanning/apiMaterialsPlanning';
import ButtonCancel from '@/components/UI/button/buttonCancel';
import ButtonSubmit from '@/components/UI/button/buttonSubmit';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { WarehouseSelectDropdown } from '@/components/UI/filterComponents/WarehouseSelectDropdown';
import InPutNumericFormat from '@/components/UI/inputNumericFormat/inputNumericFormat';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import PopupCustom from '@/components/UI/popup';
import Zoom from '@/components/UI/zoomElement/zoomElement';
import CheckboxDefault from '@/components/common/checkbox/CheckboxDefault';
import TabSwitcherWithSlidingBackground from '@/components/common/tab/TabSwitcherWithSlidingBackground';
import SearchInput from '@/components/common/input/SearchInput';
import { Tooltip } from 'react-tippy';
import 'react-tippy/dist/tippy.css';
import { optionsQuery } from '@/configs/optionsQuery';
import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate';
import useFeature from '@/hooks/useConfigFeature';
import useSetingServer from '@/hooks/useConfigNumber';
import useToast from '@/hooks/useToast';
import { formatMoment } from '@/utils/helpers/formatMoment';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Add, Trash as IconDelete, ArrowDown2 as IconDown, TickCircle, Edit2 } from 'iconsax-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { twMerge } from 'tailwind-merge';
import { v4 as uuidv4 } from 'uuid';
import SearchActionInput from '@/components/common/input/SearchActionInput';

const initialState = {
  type: [
    {
      id: uuidv4(),
      label: 'materials_planning_materials',
      value: 'material',
    },
    {
      id: uuidv4(),
      label: 'materials_planning_semi',
      value: 'product',
    },
  ],
};

const initForm = {
  date: new Date(),
  note: '',
  type: 'material',
  arrayItem: [],
  idProductionOrder: null,
};

const PopupKeepStock = ({ dataLang, icon, title, dataTable, className, queryValue, fetchDataTable, hasPermission = true, ...rest }) => {
  const [open, sOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuickSelectHint, setShowQuickSelectHint] = useState(false);

  const isShow = useToast();

  const _ToggleModal = e => sOpen(e);

  const dataSeting = useSetingServer();

  const [isState, sIsState] = useState(initialState);
  const [productionSelectKey, setProductionSelectKey] = useState(0);
  const [activeTab, setActiveTab] = useState({ id: 'material', name: dataLang?.materials_planning_materials || 'materials_planning_materials' });
  const [isQuickSelectMode, setIsQuickSelectMode] = useState(false);
  const [selectedItemsForQuickSelect, setSelectedItemsForQuickSelect] = useState([]);
  const [selectedWarehouseForQuickSelect, setSelectedWarehouseForQuickSelect] = useState(null);

  const form = useForm({ defaultValues: { ...initForm } });

  const { dataMaterialExpiry, dataProductExpiry, dataProductSerial } = useFeature();

  /// lắng nghe thay đổi
  const findValue = form.watch();

  const hangdingMutation = useMutation({
    mutationFn: async formData => {
      return await apiMaterialsPlanning.apiHandlingKeepProductionsPlan(formData);
    },
  });

  const onSubmit = async value => {
    if (value.arrayItem?.length == 0) {
      return isShow('error', dataLang?.materials_planning_no_items || 'materials_planning_no_items');
    }

    let formData = new FormData();
    formData.append('note', value.note);
    formData.append('type', value.type == 'material' ? 1 : 2);
    formData.append('plan_id', dataTable?.listDataRight?.idCommand);
    formData.append('date', formatMoment(value.date, FORMAT_MOMENT.DATE_SLASH_LONG));

    if (value.type == 'product' && value.idProductionOrder) {
      formData.append('ppi_id', value?.idProductionOrder?.ppi_id);
      // Nếu chưa chọn radio level_bom thì mặc định luôn là 0
      const autoLevel = value.idProductionOrder?.selectedLevel?.id ?? 0;
      formData.append('level', autoLevel);
    }

    value.arrayItem?.forEach((e, index) => {
      formData.append(`items[${index}][id]`, e?.idParent);
      formData.append(`items[${index}][item_id]`, e?.item?.item_id);
      formData.append(`items[${index}][item_code]`, e?.item?.item_code);
      formData.append(`items[${index}][item_name]`, e?.item?.name);
      formData.append(`items[${index}][item_variation]`, e?.item?.variation);
      formData.append(`items[${index}][item_variation_option_value_id]`, e?.itemVariationOptionValueId);
      formData.append(`items[${index}][warehouse_id]`, e?.valueWarehouse?.id);
      e?.valueLocation
        ?.filter(x => x.show)
        .forEach((i, locaitonIndex) => {
          formData.append(`items[${index}][location][${locaitonIndex}][location_id]`, i?.location_id);
          formData.append(`items[${index}][location][${locaitonIndex}][location_value]`, typeof i?.newValue == 'number' ? i?.newValue : parseFloat(i?.newValue?.replace(/,/g, '')));
          formData.append(`items[${index}][location][${locaitonIndex}][location_lot]`, i?.lot);
          formData.append(`items[${index}][location][${locaitonIndex}][location_expiration_date]`, i?.expiration_date);
          formData.append(`items[${index}][location][${locaitonIndex}][location_serial]`, i?.serial);
        });
    });

    hangdingMutation.mutate(formData, {
      onSuccess: ({ isSuccess, message }) => {
        if (isSuccess == 1) {
          isShow('success', message);
          queryValue({ page: 1 });
          fetchDataTable(1, 'submit');
          _ToggleModal(false);
          form.reset();
          return;
        }
        isShow('error', message);
      },
    });
  };

  useEffect(() => {
    if (open) {
      form.setValue('arrayItem', []);
      form.setValue('idProductionOrder', null);
      form.clearErrors();
      setIsQuickSelectMode(false);
      setSelectedItemsForQuickSelect([]);
      setSelectedWarehouseForQuickSelect(null);
    }
  }, [findValue.type, open]);

  // Đồng bộ activeTab với form.type
  useEffect(() => {
    const currentType = findValue.type || 'material';
    const tab = isState.type.find(t => t.value === currentType);
    if (tab && activeTab.id !== tab.value) {
      setActiveTab({ id: tab.value, name: dataLang?.[tab.label] || tab.label });
    }
  }, [findValue.type]);

  // Tạo danh sách tabs từ isState.type
  const tabList = isState.type.map(t => ({
    id: t.value,
    name: dataLang?.[t.label] || t.label,
  }));

  const formatNumber = number => {
    return formatNumberConfig(+number, dataSeting);
  };

  const removeItem = id => {
    const updatedData = form.getValues('arrayItem').filter(item => item.id !== id);
    form.setValue('arrayItem', updatedData);
  };

  const { data: dataProductionOrderKeepStok } = useQuery({
    queryKey: ['api_manufactures_production_order_keep_stok', dataTable?.listDataRight?.idCommand, findValue.type],
    queryFn: async () => {
      let formData = new FormData();
      formData.append('pPlan_id', dataTable?.listDataRight?.idCommand);
      const r = await apiMaterialsPlanning.apiManufacturesProductionOrderKeepStok(formData);

      return {
        ...r,
        data: {
          ...r?.data,
          items_poi: r?.data?.items_poi?.map(e => {
            return {
              ...e,
              value: e?.ppi_id,
              label: e?.item_name,
            };
          }),
        },
      };
    },
    enabled: form.watch('type') == 'product',
  });

  const fetchListItem = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      let formData = new FormData();
      // type: 1 nvl, 2 BTP
      formData.append('type', findValue.type == 'material' ? 1 : 2);
      formData.append('pPlan_id', dataTable.listDataRight.idCommand);

      if (findValue.type == 'product' && findValue.idProductionOrder) {
        formData.append('ppi_id', findValue.idProductionOrder?.ppi_id);
        // Nếu chưa chọn radio level_bom thì mặc định luôn là 0
        const autoLevel = findValue.idProductionOrder?.selectedLevel?.id ?? 0;
        formData.append('level', autoLevel);
      }

      const { isSuccess, message, data } = await apiMaterialsPlanning.apiKeepItemsWarehouses(formData);
      const newData = data?.items?.map(e => {
        return {
          child: false,
          id: uuidv4(),
          idParent: e?.id,
          item: {
            item_id: e?.item_id,
            item_code: e?.item_code,
            name: e?.item_name,
            type: e?.type_item,
            image: e?.images,
            variation: e?.item_variation,
          },
          unit: e?.unit_name_parent,
          //sl cần
          quantityNeed: formatNumber(e?.quota_primary),
          quantityNeedAi: formatNumber(e?.quota_primary_ai),
          // sl giữ
          quantityKeepp: formatNumber(e?.quantity_keep),
          // sl tồn
          quantityInventory: formatNumber(e?.quantity_warehouse),
          warehouse: e?.arrW?.map(i => {
            return {
              id: i?.w_id,
              variation_id: i?.item_variation_id,
              label: i?.name_warehouse,
              value: formatNumber(i?.quantity_warehouse),
            };
          }),
          valueWarehouse: null,
          warehouseLocation: [],
          valueLocation: [],
          itemVariationOptionValueId: e?.item_variation_option_value_id,
        };
      });
      form.setValue('arrayItem', newData);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const { isLoading, isFetching, data } = useQuery({
    queryKey: ['api_keep_item_warrehouse', findValue.type, open, findValue.idProductionOrder],
    queryFn: fetchListItem,
    enabled: open,
    ...optionsQuery,
  });

  const fetchListLocationWarehouse = async (item, idWarehouse) => {
    try {
      let formData = new FormData();
      formData.append('w_id', idWarehouse);
      formData.append('type_item', item?.item?.type);
      formData.append('item_variation_option_value_id', item.itemVariationOptionValueId);
      const { isSuccess, message, data } = await apiMaterialsPlanning.apiLocationItemsWarehouse(formData);
      if (data?.locationsWarehouse) {
        // Lấy dữ liệu mới nhất từ form thay vì findValue (có thể chưa cập nhật)
        const currentItems = form.getValues('arrayItem') || [];
        const currentItem = currentItems.find(e => e.id === item.id) || item;

        const quantityNeed = parseFloat(currentItem?.quantityNeedAi?.replace(/,/g, '') || currentItem?.quantityNeed?.replace(/,/g, '') || 0); // Chuyển đổi quantityNeed thành số
        let quantityKeepp = parseFloat(currentItem.quantityKeepp.replace(/,/g, ''));
        let remainingQuantity = quantityNeed - quantityKeepp;
        const newData = currentItems.map(e => {
          if (e.id === item.id) {
            const location = data?.locationsWarehouse?.map(i => {
              const quantityWarehouse = parseFloat(i?.quantity_warehouse.replace(/,/g, ''));
              //  -
              // +e?.quantityKeepp; // Đảm bảo là số
              let newValue = 0; // Khởi tạo newValue
              // Tính toán newValue dựa trên remainingQuantity và quantityWarehouse
              if (remainingQuantity > 0) {
                if (remainingQuantity > quantityWarehouse) {
                  newValue = quantityWarehouse; // Lấy quantityWarehouse
                  remainingQuantity -= quantityWarehouse; // Cập nhật remainingQuantity
                } else {
                  newValue = remainingQuantity; // Nếu remainingQuantity <= quantityWarehouse
                  remainingQuantity = 0; // Đặt remainingQuantity về 0
                }
              }
              // Xác định xem có nên hiển thị vị trí hay không
              const show = remainingQuantity > 0 || newValue > 0; // Đặt show thành true nếu remainingQuantity > 0 hoặc newValue > 0

              return {
                ...i,
                idFe: uuidv4(),
                id: i?.location_id,
                label: i?.name_location,
                value: formatNumber(i?.quantity_warehouse),
                qty: formatNumber(i?.quantity_warehouse),
                newValue: newValue > 0 ? newValue : '', // Đặt newValue
                show: show, // Đặt show dựa trên remainingQuantity
              };
            });
            return {
              ...e,
              valueLocation: location || [],
              warehouseLocation: location || [],
              // Giữ lại valueWarehouse nếu đã được set
              valueWarehouse: e?.valueWarehouse || currentItem?.valueWarehouse || undefined,
            };
          }
          return e;
        });
        form.setValue('arrayItem', newData);
        form.clearErrors();
      }
    } catch (error) {
      throw error;
    }
  };

  const handleShow = (idParent, idChild) => {
    // Lấy dữ liệu mới nhất từ form để tránh race condition
    const currentItems = form.getValues('arrayItem') || [];
    if (!Array.isArray(currentItems) || currentItems.length === 0) return;

    const newData = currentItems.map(e => {
      if (!e) return e;
      const location = e.warehouseLocation?.map(i => {
        if (i.idFe == idChild) {
          return {
            ...i,
            show: !i.show,
          };
        }
        return i;
      });

      if (e?.id == idParent) {
        return {
          ...e,
          valueLocation: location,
          warehouseLocation: location,
        };
      }
      return e;
    });
    form.setValue('arrayItem', newData, { shouldValidate: false });
  };

  const handleIncrease = e => {
    if (!e?.id) return;

    // Lấy dữ liệu mới nhất từ form để tránh race condition với các async operations
    const currentItems = form.getValues('arrayItem') || [];
    if (!Array.isArray(currentItems) || currentItems.length === 0) return;

    // Tìm item trong currentItems để đảm bảo có dữ liệu mới nhất
    const currentItem = currentItems.find(item => item && item.id === e.id);
    if (!currentItem) return;

    const insertIndex = currentItems.findIndex(item => item && item.id === e.id);
    if (insertIndex === -1) return;

    const siblingIndex = currentItems.filter(item => item && item.idParent === currentItem.id).length + 1;
    const childIdPrefix = `${currentItem.id}__child__${String(siblingIndex).padStart(3, '0')}`;

    // Tạo item mới với dữ liệu từ currentItem (đảm bảo có warehouse, location nếu đã được set)
    const newItemId = `${childIdPrefix}__${uuidv4()}`;
    const newItem = {
      ...currentItem,
      id: newItemId,
      idParent: currentItem.id, // Child luôn có idParent là id của parent
      valueLocation: null,
      valueWarehouse: null,
      warehouseLocation: [],
      child: true,
      childOrder: siblingIndex,
    };

    // Tạo array mới với item được insert
    const newData = [...currentItems.slice(0, insertIndex + 1), newItem, ...currentItems.slice(insertIndex + 1)];

    // Sử dụng setTimeout để đảm bảo React Hook Form đã xử lý xong các operations trước đó
    // và tránh conflict với các async operations đang chạy
    setTimeout(() => {
      form.setValue('arrayItem', newData, {
        shouldValidate: false,
        shouldDirty: false,
      });
    }, 0);
  };

  // Xử lý chọn nhanh kho
  const handleToggleQuickSelectMode = () => {
    setIsQuickSelectMode(true);
    setSelectedItemsForQuickSelect([]);
    setSelectedWarehouseForQuickSelect(null);
    setShowQuickSelectHint(true);
  };

  const handleCancelQuickSelectMode = () => {
    setIsQuickSelectMode(false);
    setSelectedItemsForQuickSelect([]);
    setSelectedWarehouseForQuickSelect(null);
    setShowQuickSelectHint(false);
  };

  useEffect(() => {
    if (showQuickSelectHint) {
      const timer = setTimeout(() => setShowQuickSelectHint(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showQuickSelectHint]);

  const handleToggleItemSelection = itemId => {
    // Lấy dữ liệu mới nhất từ form
    const currentItems = form.getValues('arrayItem') || [];

    setSelectedItemsForQuickSelect(prev => {
      const isCurrentlySelected = prev.includes(itemId);

      // Tìm item hiện tại
      const currentItem = currentItems.find(item => item && item.id === itemId);

      if (isCurrentlySelected) {
        // Bỏ chọn: xóa item và tất cả các child items
        const childIds = currentItems.filter(item => item && item.idParent === itemId).map(item => item.id);
        return prev.filter(id => id !== itemId && !childIds.includes(id));
      } else {
        // Chọn: thêm item và tất cả các child items
        const childIds = currentItems.filter(item => item && item.idParent === itemId).map(item => item.id);
        return [...prev, itemId, ...childIds];
      }
    });
  };

  const handleSelectAllItems = checked => {
    // Lấy dữ liệu mới nhất từ form
    const currentItems = form.getValues('arrayItem') || [];
    if (checked) {
      const allItemIds = currentItems.filter(item => item && item.id).map(item => item.id) || [];
      setSelectedItemsForQuickSelect(allItemIds);
    } else {
      setSelectedItemsForQuickSelect([]);
    }
  };

  // Lấy danh sách kho từ các mặt hàng đã chọn
  const getAvailableWarehouses = () => {
    if (selectedItemsForQuickSelect.length === 0) return [];

    // Lấy dữ liệu mới nhất từ form
    const currentItems = form.getValues('arrayItem') || [];
    if (!Array.isArray(currentItems) || currentItems.length === 0) return [];

    const warehousesMap = new Map();
    selectedItemsForQuickSelect.forEach(itemId => {
      if (!itemId) return;
      const item = currentItems.find(x => x && x.id === itemId);
      if (item?.warehouse && Array.isArray(item.warehouse)) {
        item.warehouse.forEach(wh => {
          if (wh && wh.id && !warehousesMap.has(wh.id)) {
            warehousesMap.set(wh.id, wh);
          }
        });
      }
    });

    return Array.from(warehousesMap.values());
  };

  // Xử lý khi chọn kho trong chế độ chọn nhanh
  const handleQuickSelectWarehouse = async warehouse => {
    if (!warehouse || selectedItemsForQuickSelect.length === 0) return;

    // Lấy dữ liệu mới nhất từ form để tránh race condition
    const currentItems = form.getValues('arrayItem') || [];
    if (!Array.isArray(currentItems) || currentItems.length === 0) return;

    const successItems = [];
    const failedItems = [];

    // Cập nhật valueWarehouse cho tất cả các mặt hàng đã chọn
    let updatedItems = currentItems.map(item => {
      if (!item || !item.id) return item;
      if (selectedItemsForQuickSelect.includes(item.id)) {
        // Kiểm tra xem kho có tồn tại trong danh sách kho của mặt hàng không
        const availableWarehouse = item.warehouse?.find(wh => wh && wh.id === warehouse.id);
        if (availableWarehouse) {
          // Gán kho cho mặt hàng
          successItems.push(item);
          return {
            ...item,
            valueWarehouse: warehouse,
          };
        } else {
          // Mặt hàng không có kho này trong danh sách
          failedItems.push(item);
        }
      }
      return item;
    });

    form.setValue('arrayItem', updatedItems, { shouldValidate: false });

    // Fetch location cho từng mặt hàng đã chọn thành công
    const fetchPromises = successItems.map(async item => {
      if (item && warehouse.id) {
        await fetchListLocationWarehouse(item, warehouse.id);
      }
    });

    // Đợi tất cả các promise hoàn thành
    await Promise.all(fetchPromises);

    // Tắt chế độ chọn nhanh
    handleCancelQuickSelectMode();

    // Hiển thị thông báo chi tiết
    if (successItems.length > 0 && failedItems.length > 0) {
      // Có cả thành công và thất bại
      isShow('warning', `Đã chọn kho "${warehouse.label}" cho ${successItems.length} mặt hàng thành công. ${failedItems.length} mặt hàng không có kho này trong danh sách.`);
    } else if (successItems.length > 0) {
      // Tất cả đều thành công
      isShow('success', `Đã chọn kho "${warehouse.label}" cho ${successItems.length} mặt hàng thành công.`);
    } else if (failedItems.length > 0) {
      // Tất cả đều thất bại
      isShow('error', `${failedItems.length} mặt hàng không có kho "${warehouse.label}" trong danh sách.`);
    }
  };

  return (
    <PopupCustom
      title={
        <div className='flex flex-col gap-1'>
          <h2 className='text-2xl font-bold capitalize'>{dataLang?.materials_planning_raw_materials || 'materials_planning_raw_materials'}</h2>
          <p className='text-base text-blue-fmrp'>{dataTable?.listDataRight?.title || dataTable?.listDataRight?.referenceNoPo || ''}</p>
        </div>
      }
      button={
        <div
          // className="bg-blue-100 rounded-lg outline-none focus:outline-none"
          className='responsive-text-sm 3xl:px-4 py-2.5 px-3 bg-blue-fmrp/80 hover:bg-blue-fmrp text-white rounded-lg flex items-center gap-x-2 transition-all duration-300'
          onClick={() => {
            if (!hasPermission) {
              return isShow('error', dataLang?.no_permission || 'Bạn không có quyền thực hiện thao tác này');
            }
            if (+dataTable?.countAll == 0) {
              return isShow('error', dataLang?.materials_planning_please_add || 'materials_planning_please_add');
            }
            _ToggleModal(true);
          }}
        >
          {icon} {title}
        </div>
      }
      open={open}
      onClose={_ToggleModal.bind(this, false)}
      classNameBtn={className}
    >
      <div className='mt-4'>
        {/* ==== Tab Switcher ==== */}
        <div className='flex items-center justify-between gap-4 mb-4'>
          <TabSwitcherWithSlidingBackground
            tabs={tabList}
            activeTab={activeTab}
            onChange={tab => {
              setActiveTab(tab);
              form.setValue('type', tab.id);
            }}
            className='!p-1 flex-shrink-0 !overflow-visible'
            buttonClassName='!py-1.5 !px-3 !responsive-text-sm'
            buttonActiveClassName='!top-1 !bottom-1'
          />

          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-3 w-[360px]'>
              <SearchActionInput value={searchTerm} onChange={setSearchTerm} placeholder='Tìm kiếm theo tên, mã sản phẩm' />
            </div>
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
                  {selectedItemsForQuickSelect?.length > 0 && (
                    <WarehouseSelectDropdown
                      options={getAvailableWarehouses()}
                      value={selectedWarehouseForQuickSelect}
                      onChange={warehouse => {
                        if (warehouse) {
                          handleQuickSelectWarehouse(warehouse);
                        }
                      }}
                      placeholder={selectedItemsForQuickSelect.length === 0 ? 'Vui lòng chọn mặt hàng' : 'Vui lòng chọn kho'}
                      disabled={selectedItemsForQuickSelect.length === 0}
                      formatOptionLabel={option => (
                        <div className='flex flex-col justify-start gap-1'>
                          <h2 className='responsive-text-sm'>{option?.label}</h2>
                          <h2 className='responsive-text-sm'>{`(${dataLang?.materials_planning_exist || 'materials_planning_exist'}: ${option?.value})`}</h2>
                        </div>
                      )}
                      allowClear={false}
                    />
                  )}
                  {selectedItemsForQuickSelect.length === 0 && <span className='absolute- top-[105%] left-2 text-sm text-orange-500 font-medium'>Vui lòng chọn ít nhất 1 mặt hàng</span>}

                  <button onClick={handleCancelQuickSelectMode} className='px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-300 text-sm font-medium'>
                    Hủy
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ==== Select Production Order (chỉ hiển thị khi chọn tab product) ==== */}
        <div className='mb-4'>
          {form.watch('type') == 'product' && (
            <Controller
              name='idProductionOrder'
              rules={{
                required: {
                  value: form.watch('type') == 'product',
                  message: dataLang?.materials_planning_pease_select_product || 'materials_planning_pease_select_product',
                },
              }}
              control={form.control}
              render={({ field, fieldState }) => {
                const handleSelect = option => {
                  if (!option) {
                    field.onChange(null);
                    setProductionSelectKey(prev => prev + 1);
                    return;
                  }
                  if (!option.selectedLevel && Array.isArray(option.level_bom) && option.level_bom.length > 0) {
                    field.onChange({
                      ...option,
                      selectedLevel: option.level_bom[0],
                    });
                  } else {
                    field.onChange(option);
                  }
                  setProductionSelectKey(prev => prev + 1);
                };

                const renderOption = (option, { context } = {}) => {
                  const selectedLevelId = field.value?.ppi_id === option?.ppi_id ? field.value?.selectedLevel?.id : null;
                  const hasMultiLevel = Array.isArray(option?.level_bom) && option.level_bom.length > 1;
                  const displayLevelName = option?.selectedLevel?.name || (selectedLevelId && option?.level_bom?.find(lv => lv.id === selectedLevelId)?.name);

                  // Khi đã chọn: hiển thị gọn kèm level đã chọn
                  if (context === 'value') {
                    return (
                      <div className='flex items-center gap-2 py-1'>
                        <div className='size-[40px] shrink-0'>
                          <img src={option.images ? option.images : '/icon/noimagelogo.png'} alt='Product Image' className='object-cover w-full h-full rounded' />
                        </div>
                        <div className='flex flex-col items-start gap-1 min-w-0'>
                          <h3 className='font-medium responsive-text-sm truncate'>{option?.label}</h3>
                          <div className='flex flex-col items-start gap-2 text-left'>
                            <span className='responsive-text-xs text-[#667085]'>
                              {option?.item_code} - {option?.item_variation}
                            </span>
                            <h5 className='responsive-text-xs'>{option?.reference_no_detail}</h5>
                            {hasMultiLevel && displayLevelName && <span className='px-1 py-[1px] rounded bg-blue-fmrp/10 text-blue-600 text-[9px] font-semibold'>{`BOM ${displayLevelName}`}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  }

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
                          {/* {displayLevelName && <span className='px-1.5 py-[1px] w-fit rounded bg-blue-fmrp/10 text-blue-600 text-[9px] font-medium'>BOM {displayLevelName}</span>} */}
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
                                  handleSelect({
                                    ...option,
                                    selectedLevel: level,
                                  });
                                }}
                              >
                                {levelIndex > 0 && <div className='absolute -left-4 -top-8 w-[1px] h-8 bg-gray-200 z-0' />}
                                <div className='absolute -left-4 -top-4 w-3 h-7 border-l-2 border-b-2 border-gray-200 rounded-bl-lg z-0' />
                                <button
                                  type='button'
                                  className={`w-4 h-4 rounded-full border transition-all duration-200 flex items-center justify-center relative z-10 ${
                                    isActive ? 'border-blue-600' : 'border-gray-300'
                                  }`}
                                  onMouseDown={event => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                  }}
                                  onClick={event => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    handleSelect({
                                      ...option,
                                      selectedLevel: level,
                                    });
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

                return (
                  <div className='relative flex flex-col gap-1'>
                    <WarehouseSelectDropdown
                      key={productionSelectKey}
                      className='w-[600px]'
                      buttonClassName={twMerge('placeholder:text-slate-300 bg-[#ffffff] border border-[#E5E7EB] w-full', fieldState.error ? 'border-red-500' : 'border-[#E5E7EB]')}
                      dropdownClassName='w-[600px]'
                      allowClear={true}
                      placeholder={dataLang?.materials_planning_pease_select_product_placehoder ?? 'materials_planning_pease_select_product_placehoder'}
                      options={dataProductionOrderKeepStok?.data?.items_poi || []}
                      value={field.value}
                      onChange={handleSelect}
                      formatOptionLabel={renderOption}
                      isSearchable={true}
                      hiddenDropdown={true}
                    />
                    {fieldState.error && <span className='text-[12px] text-red-500'>{fieldState.error.message} </span>}
                  </div>
                );
              }}
            />
          )}
        </div>

        {/* ==== Table ==== */}
        <div className='flex-1 min-h-[60vh] max-h-[80vh] w-[1300px] flex flex-col gap-4'>
          {isLoading ? (
            <div className='flex-1 flex justify-center items-center h-full'>
              <Loading className='max-h-40 2xl:h-[160px]' color='#0f4f9e' />
            </div>
          ) : findValue.arrayItem && findValue.arrayItem?.length > 0 ? (
            <div className='overflow-hidden flex-1'>
              <Customscrollbar className={`${form.watch('type') == 'product' ? 'max-h-[calc(60vh-100px)]' : 'max-h-[60vh]'} overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300`}>
                <table className='w-full border-separate' style={{ borderSpacing: '0 4px' }}>
                  <thead className='bg-white sticky top-0 z-[9999] shadow-sm'>
                    <tr>
                      {isQuickSelectMode && (
                        <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[62px]'>
                          <Tooltip title='Bấm vào để chọn tất cả' trigger='manual' open={showQuickSelectHint} position='bottom' theme='dark' distance={12} animation='perspective'>
                            <div className='flex justify-center'>
                              <CheckboxDefault checked={selectedItemsForQuickSelect.length > 0 && selectedItemsForQuickSelect.length === findValue.arrayItem?.length} onChange={handleSelectAllItems} />
                            </div>
                          </Tooltip>
                        </th>
                      )}
                      <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[62px]'>STT</th>
                      <th className='py-2 px-3 border-b border-gray-200 text-left text-sm font-normal text-[#9295A4] w-auto'>{dataLang?.price_quote_item || 'price_quote_item'}</th>
                      <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[120px]'>
                        {dataLang?.materials_planning_qty_need || 'materials_planning_qty_need'}
                      </th>
                      <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[120px] relative'>
                        {dataLang?.materials_planning_qty_need || 'materials_planning_qty_need'}
                        <span className='normal-case whitespace-nowrap flex items-center justify-center gap-1 responsive-text-xxs text-blue-600 font-medium ai-shine-badge'>
                          <Image src='/icon/SparkleYellow.png' alt='logo' width={10} height={10} />
                          <span className='ai-shine-text'>Gợi ý AI</span>
                        </span>
                      </th>
                      <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[120px]'>
                        {dataLang?.materials_planning_qty_held || 'materials_planning_qty_held'}
                      </th>
                      <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[120px]'>
                        {dataLang?.materials_planning_qty_inventory || 'materials_planning_qty_inventory'}
                      </th>
                      <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[200px]'>{dataLang?.salesOrder_warehouse || 'salesOrder_warehouse'}</th>
                      <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[250px]'>
                        {dataLang?.warehouses_localtion_title || 'warehouses_localtion_title'}
                      </th>
                      <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[100px]'>{dataLang?.inventory_operatione || 'inventory_operatione'}</th>
                    </tr>
                  </thead>
                  <tbody className='[&>tr]:mb-1' style={{ gap: '4px' }}>
                    {(() => {
                      // Lấy danh sách items và sắp xếp
                      const currentItems = form.getValues('arrayItem') || [];
                      const filteredItems = currentItems.filter(e => {
                        if (!e || !e.id) return false;
                        if (!searchTerm) return true;
                        const keyword = searchTerm.toLowerCase();
                        const name = e?.item?.name?.toLowerCase() || '';
                        const code = e?.item?.item_code?.toLowerCase() || '';
                        return name.includes(keyword) || code.includes(keyword);
                      });

                      // Nếu đang tìm kiếm mà không có kết quả, hiển thị NoData
                      if (searchTerm && filteredItems.length === 0) {
                        return (
                          <tr>
                            <td colSpan={isQuickSelectMode ? 10 : 9} className='py-6'>
                              <NoData type='report' titleText='Không tìm thấy sản phẩm' />
                            </td>
                          </tr>
                        );
                      }

                      // Helper function để lấy groupId (parent id) của item
                      // Nếu là parent thì groupId = id, nếu là child thì groupId = idParent
                      const getGroupId = item => {
                        if (!item) return null;
                        // Nếu là child, groupId là idParent
                        if (item.child && item.idParent) {
                          return item.idParent;
                        }
                        // Nếu là parent, groupId là chính id của nó
                        return item.id;
                      };

                      // Map vị trí ban đầu của parent trong mảng để giữ thứ tự groups
                      const parentPositionMap = new Map();
                      currentItems.forEach((item, idx) => {
                        if (item && !item.child && item.id) {
                          parentPositionMap.set(item.id, idx);
                        }
                      });

                      // Đánh dấu group nào đã chọn kho (ít nhất một item trong group có valueWarehouse)
                      const groupHasWarehouseMap = new Map();
                      currentItems.forEach(item => {
                        const groupId = getGroupId(item);
                        if (!groupId) return;
                        if (item?.valueWarehouse) {
                          groupHasWarehouseMap.set(groupId, true);
                        } else if (!groupHasWarehouseMap.has(groupId)) {
                          groupHasWarehouseMap.set(groupId, false);
                        }
                      });

                      // Lấy vị trí group trong mảng ban đầu
                      const getGroupPosition = item => {
                        const groupId = getGroupId(item);
                        if (!groupId) return Number.MAX_SAFE_INTEGER;
                        return parentPositionMap.has(groupId) ? parentPositionMap.get(groupId) : Number.MAX_SAFE_INTEGER;
                      };

                      // Lấy thứ tự của child trong group
                      const getChildOrder = item => {
                        if (!item?.child) return 0; // Parent luôn có order = 0
                        if (typeof item.childOrder === 'number') return item.childOrder;
                        // Nếu không có childOrder, thử parse từ id
                        const parentId = item?.idParent;
                        if (parentId) {
                          const match = `${item.id}`.match(new RegExp(`${parentId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}__child__(\\d+)`));
                          if (match && match[1]) {
                            return parseInt(match[1], 10);
                          }
                        }
                        // Fallback: dùng index trong mảng
                        return currentItems.findIndex(x => x && x.id === item.id);
                      };

                      // Kiểm tra group có được chọn trong quick select mode không
                      const isGroupSelected = item => {
                        const groupId = getGroupId(item);
                        if (!groupId) return false;
                        return selectedItemsForQuickSelect.some(selectedId => {
                          if (selectedId === groupId) return true;
                          const selectedItem = currentItems.find(x => x && x.id === selectedId);
                          return selectedItem && getGroupId(selectedItem) === groupId;
                        });
                      };

                      // Sắp xếp items: ưu tiên group cùng nhau
                      const sortedItems = [...filteredItems].sort((a, b) => {
                        const aGroupId = getGroupId(a);
                        const bGroupId = getGroupId(b);

                        // Bước 0: Nếu là quick select mode, ưu tiên group có thành phần đang active (được chọn)
                        if (isQuickSelectMode) {
                          const aGroupSelected = isGroupSelected(a);
                          const bGroupSelected = isGroupSelected(b);
                          if (aGroupSelected !== bGroupSelected) {
                            return aGroupSelected ? -1 : 1;
                          }
                        }

                        // Bước 1: Group có kho được ưu tiên lên đầu
                        const aGroupHasWh = groupHasWarehouseMap.get(aGroupId) ?? false;
                        const bGroupHasWh = groupHasWarehouseMap.get(bGroupId) ?? false;
                        if (aGroupHasWh !== bGroupHasWh) {
                          return aGroupHasWh ? -1 : 1;
                        }

                        // Bước 2: Đảm bảo cùng group nằm gần nhau - sắp xếp theo groupId
                        if (aGroupId !== bGroupId) {
                          // Sắp xếp theo vị trí ban đầu của parent trong group
                          const aGroupPos = getGroupPosition(a);
                          const bGroupPos = getGroupPosition(b);
                          if (aGroupPos !== bGroupPos) {
                            return aGroupPos - bGroupPos;
                          }
                          // Nếu không tìm thấy vị trí, sắp xếp theo groupId để ổn định
                          return (aGroupId || '').localeCompare(bGroupId || '');
                        }

                        // Bước 3: Trong cùng một group, parent đứng trước children
                        const aIsParent = !a?.child;
                        const bIsParent = !b?.child;
                        if (aIsParent !== bIsParent) {
                          return aIsParent ? -1 : 1;
                        }

                        // Bước 4: Nếu cả hai đều là children, sắp xếp theo childOrder
                        if (!aIsParent && !bIsParent) {
                          const aChildOrder = getChildOrder(a);
                          const bChildOrder = getChildOrder(b);
                          return aChildOrder - bChildOrder;
                        }

                        // Bước 5: Nếu cả hai đều là parent (không nên xảy ra trong cùng group), giữ nguyên thứ tự
                        return 0;
                      });

                      // Render danh sách đã sắp xếp
                      return sortedItems.map((e, index) => {
                        // Tìm index thực tế từ id để đảm bảo Controller path luôn đúng, kể cả khi array thay đổi
                        // Sử dụng form.getValues() để lấy dữ liệu mới nhất thay vì findValue
                        const currentItems = form.getValues('arrayItem') || [];
                        const actualIndex = currentItems.findIndex(item => item && item.id === e.id);
                        // Nếu không tìm thấy trong currentItems, fallback về index từ map
                        const finalIndex = actualIndex !== -1 ? actualIndex : index;

                        const isSelected = e?.id && selectedItemsForQuickSelect.includes(e.id);

                        return (
                          <tr
                            key={e?.id?.toString()}
                            className={`relative border-b border-[#E5E7EB]/20 ${
                              isQuickSelectMode ? `cursor-pointer ${isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}` : 'hover:bg-gray-50'
                            }`}
                            onClick={() => {
                              if (isQuickSelectMode && e?.id) {
                                handleToggleItemSelection(e.id);
                              }
                            }}
                          >
                            {isQuickSelectMode && (
                              <td className='py-2 px-3 text-center'>
                                <CheckboxDefault
                                  checked={isSelected}
                                  onChange={event => {
                                    event?.stopPropagation?.();
                                    handleToggleItemSelection(e.id);
                                  }}
                                />
                              </td>
                            )}
                            <td className='py-2 px-3 text-center text-sm font-semibold'>{index + 1}</td>
                            <td className='py-2 px-3 text-left min-w-[290px]'>
                              <div className='flex gap-2 min-w-0 '>
                                {!e?.child && (
                                  <button
                                    className={twMerge(
                                      'font-bold flex items-center justify-center p-0.5 rounded-full shrink-0 self-center transition-all',
                                      (() => {
                                        const currentItems = form.getValues('arrayItem') || [];
                                        const currentItem = currentItems.find(x => x && x.id === e?.id);
                                        const hasWarehouse = currentItem?.valueWarehouse;
                                        return hasWarehouse
                                          ? 'text-blue-600 hover:bg-blue-300 hover:text-blue-500 bg-blue-200 cursor-pointer'
                                          : 'text-gray-400 bg-gray-200 cursor-not-allowed opacity-50';
                                      })()
                                    )}
                                    onClick={ev => {
                                      ev.stopPropagation();
                                      if (e?.id) {
                                        const currentItems = form.getValues('arrayItem') || [];
                                        const currentItem = currentItems.find(x => x && x.id === e?.id);
                                        if (currentItem?.valueWarehouse) {
                                          handleIncrease(e);
                                        }
                                      }
                                    }}
                                    disabled={(() => {
                                      const currentItems = form.getValues('arrayItem') || [];
                                      const currentItem = currentItems.find(x => x && x.id === e?.id);
                                      return !currentItem?.valueWarehouse;
                                    })()}
                                  >
                                    <Add size='20' />
                                  </button>
                                )}
                                {e?.child && <IconDown className='rotate-45 shrink-0' />}
                                <div className='w-16 h-16 rounded flex items-center justify-center flex-shrink-0'>
                                  <Image src={e?.item?.image || '/icon/default/default.png'} alt={e?.item?.name || 'default'} width={64} height={64} className='object-cover rounded' />
                                </div>
                                <div className='flex flex-col gap-1 flex-1 min-w-0 overflow-hidden'>
                                  <h3 className='text-sm font-semibold text-[#141522]'>{e?.item?.name}</h3>
                                  <div className='flex flex-col gap-0.5'>
                                    <p className='text-[10px] font-normal text-[#667085]'>{e?.item?.variation}</p>
                                    <p className='text-xs font-normal text-typo-blue-2'>{e?.item?.item_code}</p>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className='py-2 px-3 text-center'>
                              <span className='text-sm font-medium text-[#141522]'>
                                {e?.quantityNeed == 0 ? (
                                  '-'
                                ) : (
                                  <span>
                                    {`${e?.quantityNeed} / `} <span className='text-[11px] text-[#667085]'>{e?.unit || ''}</span>{' '}
                                  </span>
                                )}
                              </span>
                            </td>
                            <td className='py-2 px-3 text-center'>
                              <span className='text-sm font-medium text-[#141522]'>
                                {e?.quantityNeedAi == 0 ? (
                                  '-'
                                ) : (
                                  <span>
                                    {`${e?.quantityNeedAi} / `} <span className='text-[11px] text-[#667085]'>{e?.unit || ''}</span>{' '}
                                  </span>
                                )}
                              </span>
                            </td>
                            <td className='py-2 px-3 text-center'>
                              <span className='text-sm font-medium text-[#141522]'>
                                {e?.quantityKeepp == 0 ? (
                                  '-'
                                ) : (
                                  <span>
                                    {`${e?.quantityKeepp} / `} <span className='text-[11px] text-[#667085]'>{e?.unit || ''}</span>{' '}
                                  </span>
                                )}
                              </span>
                            </td>
                            <td className='py-2 px-3 text-center'>
                              <span className='text-sm font-medium text-[#141522]'>
                                {e?.quantityInventory == 0 ? (
                                  '-'
                                ) : (
                                  <span>
                                    {`${e?.quantityInventory} / `} <span className='text-[11px] text-[#667085]'>{e?.unit || ''}</span>{' '}
                                  </span>
                                )}
                              </span>
                            </td>
                            <td className='py-2 px-3 text-center'>
                              <Controller
                                key={`warehouse-${e.id}-${finalIndex}`}
                                name={`arrayItem.${finalIndex}.valueWarehouse`}
                                control={form.control}
                                rules={{
                                  required: {
                                    value: (() => {
                                      const currentItems = form.getValues('arrayItem') || [];
                                      return currentItems.find(x => x && x.id == e?.id)?.valueWarehouse ? false : true;
                                    })(),
                                    message: dataLang?.materials_planning_pease_select_warehouse || 'materials_planning_pease_select_warehouse',
                                  },
                                }}
                                render={({ field, fieldState }) => {
                                  const currentItems = form.getValues('arrayItem') || [];
                                  const currentItem = currentItems.find(x => x && x.id == e?.id);
                                  const arrWareHouse = currentItem?.warehouse || [];
                                  const currentValue = currentItem?.valueWarehouse;

                                  return (
                                    <div onClick={ev => ev.stopPropagation()}>
                                      <WarehouseSelectDropdown
                                        className='w-[200px]'
                                        dropdownClassName='!w-[300px]'
                                        options={arrWareHouse}
                                        value={currentValue}
                                        disabled={isQuickSelectMode}
                                        onChange={warehouse => {
                                          if (warehouse) {
                                            fetchListLocationWarehouse(e, warehouse?.id);
                                            field.onChange(warehouse);
                                          } else {
                                            // Xóa kho và vị trí
                                            field.onChange(null);
                                            const currentItems = form.getValues('arrayItem') || [];
                                            const currentItemIndex = currentItems.findIndex(x => x && x.id === e?.id);
                                            if (currentItemIndex !== -1) {
                                              form.setValue(`arrayItem.${currentItemIndex}.valueLocation`, null, { shouldValidate: false });
                                              form.setValue(`arrayItem.${currentItemIndex}.warehouseLocation`, [], { shouldValidate: false });
                                            }
                                          }
                                        }}
                                        placeholder={dataLang?.salesOrder_select_warehouse || 'salesOrder_select_warehouse'}
                                        allowClear={true}
                                        formatOptionLabel={option => (
                                          <div className='flex flex-col justify-start items-start gap-1'>
                                            <h2 className='responsive-text-sm'>{option?.label}</h2>
                                            <h2 className='responsive-text-sm'>{`(${dataLang?.materials_planning_exist || 'materials_planning_exist'}: ${option?.value})`}</h2>
                                          </div>
                                        )}
                                        buttonClassName={fieldState.error ? '!border-red-500' : ''}
                                      />
                                      {fieldState.error && <span className='text-[12px] text-red-500'>{fieldState.error.message}</span>}
                                    </div>
                                  );
                                }}
                              />
                            </td>
                            <td className='py-2 px-3'>
                              <div className='flex flex-col gap-2'>
                                <Controller
                                  key={`location-${e.id}-${finalIndex}`}
                                  name={`arrayItem.${finalIndex}.valueLocation`}
                                  control={form.control}
                                  render={({ field, fieldState }) => {
                                    const currentItems = form.getValues('arrayItem') || [];
                                    const arrWareHouse = currentItems.find(x => x && x.id == e?.id);
                                    return arrWareHouse?.warehouseLocation?.map((x, Iindex) => {
                                      return (
                                        <Controller
                                          key={`location-value-${e.id}-${finalIndex}-${Iindex}-${x.idFe}`}
                                          name={`arrayItem.${finalIndex}.valueLocation.${Iindex}.newValue`}
                                          control={form.control}
                                          rules={{
                                            required: {
                                              value: x.show,
                                              message: dataLang?.materials_planning_enter_quantity || 'materials_planning_enter_quantity',
                                            },
                                            validate: {
                                              fn: value => {
                                                try {
                                                  let mss = '';
                                                  if (x.show && x.newValue == null && value.newValue == null) {
                                                    mss = dataLang?.materials_planning_enter_quantity || 'materials_planning_enter_quantity';
                                                  }
                                                  if (x.show && x.newValue == 0 && value.newValue == 0) {
                                                    mss = dataLang?.materials_planning_must_be_greater || 'materials_planning_must_be_greater';
                                                  }
                                                  return mss || true;
                                                } catch (error) {
                                                  throw error;
                                                }
                                              },
                                            },
                                          }}
                                          render={({ field, fieldState }) => {
                                            return (
                                              <div className='w-full z-[99]' onClick={ev => ev.stopPropagation()}>
                                                <Zoom>
                                                  <div
                                                    onClick={() => handleShow(e.id, x.idFe)}
                                                    className={`border-gray-400 w-full text-[10px] font-medium bg-white hover:bg-gray-100 transition-all ease-in-out border rounded-2xl py-1 px-2 flex items-center gap-1 cursor-pointer`}
                                                  >
                                                    <div>
                                                      {x.show ? (
                                                        <TickCircle className='bg-blue-600 rounded-full' color='white' size={15} />
                                                      ) : (
                                                        <div className='w-4 h-4 bg-transparent border border-gray-300 rounded-full' />
                                                      )}
                                                    </div>
                                                    <div className='flex flex-col items-start'>
                                                      <h3 className=''>
                                                        {x.label} - <span className='pl-1 text-blue-500'>{x.value}</span>
                                                      </h3>
                                                      <div className='flex flex-wrap items-center font-oblique'>
                                                        {dataProductSerial.is_enable === '1' && (
                                                          <div className='flex gap-0.5'>
                                                            <h6 className='text-[8px]'>Serial:</h6>
                                                            <h6 className='text-[9px] px-1 w-[full] text-left'>{x.serial == null || x.serial == '' ? '-' : x?.serial}</h6>
                                                          </div>
                                                        )}
                                                        {(dataMaterialExpiry.is_enable === '1' || dataProductExpiry.is_enable === '1') && (
                                                          <>
                                                            <div className='flex gap-0.5'>
                                                              <h6 className='text-[8px]'>Lot:</h6>
                                                              <h6 className='text-[9px] px-1 w-[full] text-left'>{x.lot == null || x.lot == '' ? '-' : x?.lot}</h6>
                                                            </div>
                                                            <div className='flex gap-0.5'>
                                                              <h6 className='text-[8px]'>Date:</h6>
                                                              <h6 className='text-[9px] px-1 w-[full] text-center'>
                                                                {x?.expiration_date ? formatMoment(x?.expiration_date, FORMAT_MOMENT.DATE_SLASH_LONG) : '-'}
                                                              </h6>
                                                            </div>
                                                          </>
                                                        )}
                                                      </div>
                                                    </div>
                                                  </div>
                                                </Zoom>
                                                {x.show && (
                                                  <InPutNumericFormat
                                                    className={`py-1 px-2 my-1 ${fieldState.error ? 'border-red-500' : 'border-gray-400'} border outline-none rounded-3xl w-full`}
                                                    {...field}
                                                    onValueChange={event => {
                                                      field.onChange({
                                                        ...x,
                                                        newValue: event.value == '' ? null : event.value,
                                                      });
                                                    }}
                                                    value={field.value?.newValue || x?.newValue}
                                                    isAllowed={values => {
                                                      const { floatValue } = values;
                                                      if (floatValue == 0) {
                                                        return true;
                                                      }
                                                      if (floatValue < 0) {
                                                        isShow('error', dataLang?.materials_planning_please_enter_greater || 'materials_planning_please_enter_greater');
                                                        return false;
                                                      }
                                                      return true;
                                                    }}
                                                  />
                                                )}
                                                {x.show && fieldState.error && <span className='text-[12px] text-red-500'>{fieldState.error.message}</span>}
                                              </div>
                                            );
                                          }}
                                        />
                                      );
                                    });
                                  }}
                                />
                              </div>
                            </td>
                            <td className='py-2 px-3 text-center'>
                              <button
                                onClick={ev => {
                                  ev.stopPropagation();
                                  removeItem(e.id);
                                }}
                                type='button'
                                title='Xóa'
                                className='transition w-[40px] h-10 rounded-[5.5px] hover:text-red-600 text-red-500 flex flex-col justify-center items-center'
                              >
                                <IconDelete />
                              </button>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </Customscrollbar>
            </div>
          ) : (
            <div className='flex-1 flex flex-col items-center justify-center h-full min-h-[400px] gap-4'>
              <NoData type='report' titleText='Không có nguyên liệu nào' />
            </div>
          )}
          <div className='mt-5 space-x-2 text-right'>
            <ButtonCancel loading={false} onClick={() => _ToggleModal(false)} dataLang={dataLang} />
            <ButtonSubmit loading={hangdingMutation.isPending} dataLang={dataLang} onClick={() => form.handleSubmit(data => onSubmit(data))()} />
          </div>
        </div>
      </div>
    </PopupCustom>
  );
};

export default PopupKeepStock;
