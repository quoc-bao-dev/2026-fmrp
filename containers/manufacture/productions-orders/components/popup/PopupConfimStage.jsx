import PackageUpgradeButton from '@/components/common/button/PackageUpgradeButton';
import { KanbanIcon, WarningIcon } from '@/components/icons';
import CheckIcon from '@/components/icons/common/CheckIcon';
import CloseXIcon from '@/components/icons/common/CloseXIcon';
import ButtonSubmit from '@/components/UI/button/buttonSubmit';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import SelectComponent from '@/components/UI/filterComponents/selectComponent';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import PopupCustom from '@/components/UI/popup';
import useFeature from '@/hooks/useConfigFeature';
import useSetingServer from '@/hooks/useConfigNumber';
import useToast from '@/hooks/useToast';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FaCheckCircle } from 'react-icons/fa';
import { PiWarehouseLight } from 'react-icons/pi';
import { useActiveStages } from '../../hooks/useActiveStages';
import { useHandingFinishedStages } from '../../hooks/useHandingFinishedStages';
import { useListFinishedStages } from '../../hooks/useListFinishedStages';
import { useLoadOutOfStock } from '../../hooks/useLoadOutOfStock';
import { PopupProductionOrderStatus } from './PopupCompleteCommand';
import ProductRow from './ProductRow';

const initialState = {
  open: false,
  objectWareHouse: null,
  dataTableProducts: null,
  dataTableBom: null,
  arrayMoveBom: [],
};

const PopupConfimStage = ({ dataLang, dataRight, refetch: refetchMainTable, typePageMoblie }) => {
  const tableRef = useRef(null);
  const isToast = useToast();
  const tableRefTotal = useRef(null);
  const dataSeting = useSetingServer();

  // Kiểm tra có phải gói pro không
  const isProPackage = dataSeting?.package !== '1';

  const [errorNVLData, setErrorNVLData] = useState({ items: [] });
  const [errorNVLDataBefore, setErrorNVLDataBefore] = useState({ items: [] });
  const [isInputPending, setIsInputPending] = useState(false);
  const [isState, setState] = useState(initialState);
  const [isWarehouseMissing, setIsWarehouseMissing] = useState(false);
  const [isOrderCompleted, setIsOrderCompleted] = useState(false);
  // UI lỗi khi xác nhận hoàn thành công đoạn
  const [confirmErrorTags, setConfirmErrorTags] = useState([]);
  const [confirmNewTagInput, setConfirmNewTagInput] = useState('');
  const [confirmIsInputFocused, setConfirmIsInputFocused] = useState(false);
  const [confirmInputWidth, setConfirmInputWidth] = useState(60);
  const [confirmErrorImages, setConfirmErrorImages] = useState([]);
  const [confirmImageError, setConfirmImageError] = useState('');
  const confirmFileInputRef = useRef(null);
  const confirmMeasureRef = useRef(null);
  const confirmIsAddingTagRef = useRef(false);
  const [activeStep, setActiveStep] = useState({ type: null, item: null });

  const formatNumber = number => {
    return formatNumberConfig(+number, dataSeting);
  };

  const queryState = data => setState(prev => ({ ...prev, ...data }));

  const { onGetData, isLoading: isLoadingActiveStages } = useActiveStages();
  const { isLoading: isLoadingSubmit, onSubmit } = useHandingFinishedStages();
  const { dataProductExpiry, dataMaterialExpiry, dataProductSerial } = useFeature();

  const { data, isLoading, refetch } = useListFinishedStages({
    id: dataRight?.idDetailProductionOrder,
    open: isState.open,
  });

  const { data: dataLoadOutOfStock, isLoading: isLoadingLoadOutOfStock, onGetData: onGetDataLoadOutOfStock } = useLoadOutOfStock();

  function resetErrors() {
    setErrorNVLData({ items: [] });
    setErrorNVLDataBefore({ items: [] });
    setIsWarehouseMissing(false);
  }

  const checkItemFinalStage = isState.dataTableProducts?.data?.items?.some(e => e?.final_stage == 1);
  const showSerialColumns = checkItemFinalStage && dataProductSerial.is_enable === '1';
  const showExpiryColumns = checkItemFinalStage && dataProductExpiry.is_enable === '1';

  const handleSelectStep = async (type, e, action) => {
    if (action == 'click' && e?.stage_id == activeStep?.item?.stage_id && type == activeStep?.type) return;

    resetErrors();
    setActiveStep({ type, item: e });

    const payload = {
      id: dataRight?.idDetailProductionOrder,
      is_product: type == 'TP' ? 1 : 0,
      stage_id: e?.stage_id,
    };

    const r = await onGetData(payload);

    queryState({ dataTableProducts: r, arrayMoveBom: [] });

    onGetBom(
      {
        isProduct: type === 'TP' ? 1 : 0,
        activeStep: {
          type,
          item: e,
        },
        poId: dataRight?.idDetailProductionOrder,
        arrayMoveBom: [],
      },
      r?.data?.items
    );
  };

  const handleSubmit = async () => {
    if (isInputPending) {
      isToast('error', 'Vui lòng đợi xử lý dữ liệu hoàn tất');
      return;
    }

    if (!isState.objectWareHouse) {
      setIsWarehouseMissing(true);
      isToast('error', 'Vui lòng chọn kho hàng');
      return;
    }

    // Chuẩn bị payload giống cấu trúc bên PopupCompleteCommand (kèm id uuid, tag, ảnh)
    const formatData =
      isState.dataTableProducts?.data?.items?.map(item => {
        const id = item?.id || uuidv4();
        // Lấy error_tags và error_images từ mỗi row object (mỗi row độc lập)
        const error_tags = item?.error_tags || [];
        const error_images = (item?.error_images || []).map(img => img?.file).filter(Boolean);

        return {
          ...item,
          id,
          quantity_success: item?.quantityEnterClient || 0,
          quantity_error: item?.quantityError || 0,
          error_tags,
          error_images,
        };
      }) || [];

    const payload = {
      po_id: dataRight?.idDetailProductionOrder,
      warehouse_id: isState?.objectWareHouse?.value || isState?.objectWareHouse,
      items: formatData,
    };

    // Log key FormData tương tự PopupCompleteCommand
    const errorImagesFormKeys = {};
    formatData.forEach((item, itemIndex) => {
      item.error_tags?.forEach((tag, tagIndex) => {
        errorImagesFormKeys[`items[${itemIndex}][error_tags][${tagIndex}]`] = tag;
      });
      item.error_images?.forEach((file, imgIndex) => {
        errorImagesFormKeys[`error_images[${item.id}][${imgIndex}]`] = file || null;
      });
    });

    // Gọi submit với objectData đã gắn id, error_tags, error_images để FormData bám đúng
    const r = await onSubmit({
      poId: dataRight?.idDetailProductionOrder,
      objectData: {
        ...isState,
        dataTableProducts: {
          ...isState.dataTableProducts,
          data: {
            ...isState.dataTableProducts?.data,
            items: formatData,
          },
        },
      },
    });

    if (r?.isSuccess == 1) {
      refetch();
      refetchMainTable();

      if (r?.data?.status_manufacture == '2') {
        // Hiển thị popup hoàn thành khi đã xong công đoạn cuối
        isToast('success', 'Lệnh sản xuất đã được hoàn thành');
        setIsOrderCompleted(true);
        queryState(prev => ({ ...prev, open: true }));
      } else {
        queryState({
          open: true,
          dataTableProducts: null,
          dataTableBom: null,
          arrayMoveBom: [],
        });
        handleSelectStep(activeStep?.type, activeStep?.item, 'auto');
      }
    } else if (r?.data?.errors || r?.data?.errors_before) {
      setErrorNVLData({
        items: [...(r?.data?.errors || [])],
      });
      setErrorNVLDataBefore({
        items: [...(r?.data?.errors_before || [])],
      });
    }
  };

  useEffect(() => {
    if (!tableRef?.current || !tableRefTotal?.current) return;
    const handleScroll = () => {
      if (tableRef.current && tableRefTotal.current) {
        tableRefTotal.current.scrollLeft = tableRef.current.scrollLeft;
      }
    };

    const table = tableRef.current;
    table.addEventListener('scroll', handleScroll);
    return () => table.removeEventListener('scroll', handleScroll);
  }, []);

  const { totalQuantity, totalQuantityError, totalQuantityEntered, totalQuantityEnter } = useMemo(() => {
    if (!isState.dataTableProducts?.data?.items?.length) {
      return {
        totalQuantity: 0,
        totalQuantityError: 0,
        totalQuantityEntered: 0,
        totalQuantityEnter: 0,
      };
    }

    return {
      totalQuantity: isState.dataTableProducts?.data?.totalQuantityEnterClient || 0,
      totalQuantityError: isState.dataTableProducts?.data?.totalQuantityError || 0,
      totalQuantityEnter: isState.dataTableProducts?.data?.totalQuantityEnter || 0,
      totalQuantityEntered: isState.dataTableProducts?.data?.totalQuantityEntered || 0,
    };
  }, [isState.dataTableProducts?.data]);

  const updateSerialsGeneric = (item, value, type) => {
    const quantity = value?.floatValue ?? value?.value ?? 0;

    if (!showSerialColumns) {
      return {
        ...item,
        [type === 'serialError' ? 'quantityError' : 'quantityEnterClient']: quantity,
      };
    }

    let existingSerials = [...(item[type] || [])];

    const getMaxSerial = list => (list.length > 0 ? Math.max(...list.map(s => parseInt(s.value.split('-').pop(), 10)).filter(n => !isNaN(n))) : 0);

    const maxSerialFromSerial = getMaxSerial(item.serial || []);
    const maxSerialFromError = getMaxSerial(item.serialError || []);
    const globalMaxSerial = Math.max(maxSerialFromSerial, maxSerialFromError, item?.max_serial_number ?? 0);

    if (quantity > existingSerials.length) {
      const startSerial = globalMaxSerial + 1;
      const additionalSerials = [...Array(quantity - existingSerials.length)].map((_, i) => ({
        value: `${item?.ref}-${(startSerial + i).toString().padStart(2, '0')}`,
        isDuplicate: false,
      }));
      existingSerials = [...existingSerials, ...additionalSerials];
    } else if (quantity < existingSerials.length) {
      existingSerials = existingSerials.slice(0, quantity).map(s => ({ ...s, isDuplicate: false }));
    }

    const valuesList = existingSerials.map(s => s?.value).filter(Boolean);
    existingSerials = existingSerials.map(s => ({
      ...s,
      isDuplicate: valuesList.indexOf(s?.value) !== valuesList.lastIndexOf(s?.value),
    }));

    return {
      ...item,
      [type === 'serialError' ? 'quantityError' : 'quantityEnterClient']: quantity,
      [type]: existingSerials,
    };
  };

  const handleChange = ({ table, type, value, row, index }) => {
    setIsInputPending(true);

    if (table === 'product') {
      const quantityEnterClient = 'quantityEnterClient';
      const quantityError = 'quantityError';
      const checkType = [quantityEnterClient, quantityError].includes(type);

      const newData = isState.dataTableProducts?.data?.items?.map(item => {
        if (item?.poi_id === row?.poi_id) {
          if (checkType) {
            return updateSerialsGeneric(item, value, type === quantityEnterClient ? 'serial' : 'serialError');
          }

          if (type === 'serial' || type === 'serialError') {
            let updatedArray = Array.isArray(item[type]) ? [...item[type]] : [];
            updatedArray[index] = { value, isDuplicate: false };

            const valuesList = updatedArray.map(s => s?.value).filter(Boolean);
            updatedArray = updatedArray.map(s => ({
              ...s,
              isDuplicate: valuesList.indexOf(s?.value) !== valuesList.lastIndexOf(s?.value),
            }));

            if (updatedArray[index].isDuplicate) {
              isToast('error', `${type === 'serial' ? 'Serial' : 'Serial lỗi'} đã tồn tại!`);
            }

            return { ...item, [type]: updatedArray };
          }

          return { ...item, [type]: checkType ? value?.floatValue : value };
        }
        return item;
      });

      queryState({
        dataTableProducts: {
          ...isState.dataTableProducts,
          data: {
            ...isState.dataTableProducts?.data,
            items: newData,
          },
        },
      });

      if (type === 'serial' || type === 'serialError') {
        onGetBom(
          {
            isProduct: activeStep.type === 'TP' ? 1 : 0,
            activeStep: {
              type: activeStep.type,
              item: activeStep.item,
            },
            poId: dataRight?.idDetailProductionOrder,
            arrayMoveBom: isState.arrayMoveBom,
          },
          newData
        );
      } else {
        // Đặt isInputPending về false cho các trường hợp khác như lot, date
        setIsInputPending(false);
      }
    }

    if (table === 'bom' && isState.dataTableBom?.data?.boms) {
      const newData = isState.dataTableBom.data.boms.map(item => (item?._id === row?._id ? { ...item, [type]: value } : item));

      queryState({
        dataTableBom: {
          ...isState.dataTableBom,
          data: {
            ...isState.dataTableBom?.data,
            boms: newData,
            bomsClientHistory: newData,
          },
        },
      });
      setIsInputPending(false);
    }
  };

  const getItemKey = (item, type) => {
    if (type === 'product') {
      const poi = item?.poi_id ?? 'poi';
      const bom = item?.bom_id ?? 'bom';
      const pois = item?.pois_id ?? 'pois';
      return `${poi}-${bom}-${pois}`;
    }
    return item?._id ?? item?.id ?? item?.item_id ?? 'default';
  };

  const handleRemove = (type, row) => {
    if (type === 'bom' && row?.type_bom === 'product_before') {
      isToast('error', 'Đây là thành phẩm công đoạn bước trước, không thể xóa');
      return;
    }

    const stateKey = type === 'product' ? 'dataTableProducts' : 'dataTableBom';
    const stateData = type === 'product' ? 'items' : 'boms';

    const rowKey = getItemKey(row, type);
    const newData = isState[stateKey]?.data[stateData]?.filter(item => getItemKey(item, type) !== rowKey);

    queryState({
      [stateKey]: {
        ...isState[stateKey],
        data: {
          ...isState[stateKey]?.data,
          [stateData]: newData,
        },
      },
      arrayMoveBom: [...isState.arrayMoveBom, row],
    });

    onGetBom(
      {
        isProduct: type === 'product' ? 1 : 0,
        activeStep: {
          type,
          item: activeStep.item,
        },
        arrayMoveBom: [...isState.arrayMoveBom, row],
        poId: dataRight?.idDetailProductionOrder,
      },
      type === 'product' ? newData : isState.dataTableProducts?.data?.items
    );
  };

  const onGetBom = useCallback(
    async (object, items) => {
      try {
        const r = await onGetDataLoadOutOfStock({ object, items });

        if (!r?.data?.boms) return;

        const check = r.data.boms.map(e => {
          const existingBom = isState.dataTableBom?.data?.bomsClientHistory?.find(item => item?.item_id === e?.item_id && item?.pois_id === e?.pois_id);

          return {
            ...e,
            warehouseId: existingBom?.warehouseId || e?.list_warehouse_bom,
          };
        });

        queryState({
          dataTableBom: {
            ...r,
            data: {
              ...r?.data,
              boms: check,
              bomsClientHistory: check,
            },
          },
        });
      } catch (error) {
        console.error('Error in onGetBom:', error);
      } finally {
        setIsInputPending(false);
      }
    },
    [isState.dataTableProducts, isState.dataTableBom, activeStep]
  );

  const getPriorityItem = (semi, products) => {
    const semiItem = semi?.find(item => item.active === '0');
    if (semiItem) return { object: semiItem, type: 'BTP' };

    const productItem = products?.find(item => item.active === '0');
    if (productItem) return { object: productItem, type: 'TP' };

    return null;
  };

  useEffect(() => {
    if (!isState.open) return;

    if (data?.po?.status_manufacture === '2') {
      setIsOrderCompleted(true);
      return;
    }

    setIsOrderCompleted(false);
    const s = getPriorityItem(data?.stage_semi_products || [], data?.stage_products || []);
    if (s) {
      handleSelectStep(s?.type, s?.object, 'auto');
    }
  }, [isState.open, data]);

  useEffect(() => {
    if (isState.open) {
      queryState({ ...initialState, open: true });
      setIsWarehouseMissing(false);
      return;
    }
    queryState({ ...initialState });
    setIsOrderCompleted(false);
    setIsWarehouseMissing(false);
  }, [isState.open]);

  const handleQuantityChange = async (value, row, type) => {
    try {
      setIsInputPending(true);

      const simulatedValue = { floatValue: value };
      const serialType = type === 'quantityEnterClient' ? 'serial' : 'serialError';

      const newData = isState.dataTableProducts?.data?.items?.map(item => {
        if (item?.poi_id === row?.poi_id) {
          return updateSerialsGeneric(item, simulatedValue, serialType);
        }
        return item;
      });

      queryState({
        dataTableProducts: {
          ...isState.dataTableProducts,
          data: {
            ...isState.dataTableProducts?.data,
            items: newData,
          },
        },
      });

      const object = {
        isProduct: activeStep.type === 'TP' ? 1 : 0,
        activeStep: {
          type: activeStep.type,
          item: activeStep.item,
        },
        poId: dataRight?.idDetailProductionOrder,
        arrayMoveBom: isState.arrayMoveBom,
      };

      const r = await onGetDataLoadOutOfStock({ object, items: newData });

      if (!r?.data?.boms) return;

      const check = r.data.boms.map(e => {
        const existingBom = isState.dataTableBom?.data?.bomsClientHistory?.find(item => item?.item_id === e?.item_id && item?.pois_id === e?.pois_id);

        return {
          ...e,
          warehouseId: existingBom?.warehouseId || e?.list_warehouse_bom,
        };
      });

      queryState({
        dataTableBom: {
          ...r,
          data: {
            ...r?.data,
            boms: check,
            bomsClientHistory: check,
          },
        },
      });
    } catch (error) {
      console.error('Error in handleQuantityChange:', error);
    } finally {
      setIsInputPending(false);
    }
  };

  const getTotals = useMemo(() => {
    if (!isState.dataTableProducts?.data?.items?.length) {
      return {
        totalQuantityEnterClient: 0,
        totalQuantityError: 0,
        totalQuantityEnter: 0,
        totalQuantityEntered: 0,
      };
    }

    return isState.dataTableProducts.data.items.reduce(
      (totals, item) => ({
        totalQuantityEnterClient: totals.totalQuantityEnterClient + Number(item?.quantityEnterClient || 0),
        totalQuantityError: totals.totalQuantityError + Number(item?.quantityError || 0),
        totalQuantityEnter: totals.totalQuantityEnter + Number(item?.quantity_enter || 0),
        totalQuantityEntered: totals.totalQuantityEntered + Number(item?.quantity_entered || 0),
      }),
      { totalQuantityEnterClient: 0, totalQuantityError: 0, totalQuantityEnter: 0, totalQuantityEntered: 0 }
    );
  }, [isState.dataTableProducts?.data?.items]);

  // --- Handlers cho phần Tag + Ảnh lỗi khi xác nhận ---
  const handleConfirmAddTag = useCallback(() => {
    if (confirmIsAddingTagRef.current) return;
    if (confirmNewTagInput.trim()) {
      confirmIsAddingTagRef.current = true;
      setConfirmErrorTags(prev => [...prev, confirmNewTagInput.trim()]);
      setConfirmNewTagInput('');
      setConfirmInputWidth(60);
      setTimeout(() => {
        confirmIsAddingTagRef.current = false;
      }, 100);
    }
  }, [confirmNewTagInput]);

  useEffect(() => {
    if (confirmMeasureRef.current) {
      const width = Math.max(60, confirmMeasureRef.current.offsetWidth + 0);
      setConfirmInputWidth(width);
    }
  }, [confirmNewTagInput]);

  const handleConfirmKeyDown = useCallback(
    e => {
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        if (confirmNewTagInput.trim()) {
          handleConfirmAddTag();
        }
        if (e.key === 'Tab') {
          e.target.focus();
        }
        setConfirmNewTagInput('');
      }
    },
    [handleConfirmAddTag, confirmNewTagInput]
  );

  const handleConfirmRemoveTag = useCallback(tagIndex => {
    setConfirmErrorTags(prev => prev.filter((_, i) => i !== tagIndex));
  }, []);

  const handleConfirmImageUpload = useCallback(e => {
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
        setConfirmErrorImages(prev => [...prev, { file, preview }]);
      }
    });

    setConfirmImageError(hasOversize ? 'Kích thước ảnh không được vượt quá 1MB' : '');
    if (confirmFileInputRef.current) {
      confirmFileInputRef.current.value = '';
    }
  }, []);

  const handleConfirmRemoveImage = useCallback(imgIndex => {
    setConfirmErrorImages(prev => {
      const next = [...prev];
      const [removed] = next.splice(imgIndex, 1);
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return next;
    });
  }, []);

  return (
    <>
      {isOrderCompleted ? (
        <PopupCustom
          onClickOpen={() => {
            if (dataRight?.listDataRight?.statusManufacture === '2') {
              isToast('error', 'Lệnh SX đã được hoàn thành');
              return;
            }
            queryState({ open: true });
            setIsWarehouseMissing(false);
          }}
          lockScroll={true}
          open={isState.open}
        >
          <PopupProductionOrderStatus
            className={'!p-6'}
            onClose={() => {
              setIsOrderCompleted(false);
              queryState({ open: false });
            }}
          />
        </PopupCustom>
      ) : (
        <PopupCustom
          title={
            <div className='flex items-center justify-between w-full'>
              <div className='flex flex-col gap-1'>
                <h2 className='responsive-text-2xl font-bold text-neutral-07'>Hoàn thành chi tiết công đoạn</h2>
                <span className='text-blue-fmrp responsive-text-base'>(Số lệnh sản xuất: {data?.po?.reference_no})</span>
              </div>
              <div className='mr-8'>
                {isProPackage ? (
                  <ButtonSubmit
                    loading={isLoadingSubmit}
                    title='Xác nhận'
                    onClick={handleSubmit}
                    icon={<CheckIcon className='size-4' />}
                    className={`py-2.5 2xl:py-3 px-3 2xl:px-4 text-white rounded-lg !responsive-text-base flex items-center gap-2 bg-blue-fmrp hover:opacity-80`}
                  />
                ) : (
                  <PackageUpgradeButton />
                )}
              </div>
            </div>
          }
          classNameModeltime='px-6 2xl:px-10 3xl:px-12 py-4 2xl:py-5 3xl:py-6 flex flex-col gap-6'
          button={
            <div className='flex items-center gap-2 w-full'>
              <span className='3xl:size-5 size-4 text-[#0375F3] shrink-0'>
                <KanbanIcon className='size-full' />
              </span>
              <span className='3xl:text-base text-sm font-normal text-[#101828] text-left'>Hoàn thành chi tiết công đoạn</span>
            </div>
          }
          classNameBtn={'!w-full'}
          onClickOpen={() => {
            if (dataRight?.listDataRight?.statusManufacture === '2') {
              isToast('error', 'Lệnh SX đã được hoàn thành');
              return;
            }
            queryState({ open: true });
            setIsWarehouseMissing(false);
          }}
          lockScroll={true}
          open={isState.open}
          classNameIconClose='size-8 bg-white hover:bg-slate-200 text-[#9295A4] hover:text-slate-800'
          onClose={() => {
            resetErrors();
            queryState({ open: false });
            setIsWarehouseMissing(false);
          }}
        >
          <div className='w-[90vw] xl:h-[80vh] h-[575px]'>
            <div className='grid grid-cols-16 h-full gap-4 max-h-[80vh]'>
              {/* Left Panels */}
              <div className='flex col-span-3 max-h-full min-h-0'>
                <div className='flex flex-col h-full max-h-full border border-primary-05 rounded-lg flex-1'>
                  {/* Công đoạn BTP */}
                  {data?.stage_semi_products?.length > 0 && (
                    <div className='flex-1 border-b border-primary-05 min-h-0 flex flex-col overflow-hidden'>
                      <div className='p-3 font-medium responsive-text-base border-b border-primary-05 flex-shrink-0'>Công đoạn BTP</div>
                      <Customscrollbar className='flex-1 min-h-0'>
                        {data?.stage_semi_products?.length > 0 ? (
                          data?.stage_semi_products?.map(e => (
                            <li
                              key={e?.stage_id}
                              onClick={() => handleSelectStep('BTP', e, 'click')}
                              className={`p-3 cursor-pointer ${
                                activeStep.type == 'BTP' && activeStep?.item?.stage_id == e?.stage_id
                                  ? 'bg-gradient-to-r from-[#0375F336] to-[#C4C4C400] border-l-4 border-[#0375F3]'
                                  : 'hover:bg-gray-100'
                              } ${e?.active == '1' ? 'text-blue-fmrp' : 'text-gray-500'} responsive-text-base list-none flex items-center gap-2 transition-all duration-200 ease-linear select-none`}
                            >
                              <div className='min-w-[16px] flex items-center justify-center'>
                                {e?.active == '1' ? <FaCheckCircle size='16' className='text-blue-fmrp' /> : <div className='w-1 h-1 bg-gray-500 rounded-full'></div>}
                              </div>
                              <p>{e?.name_stage}</p>
                            </li>
                          ))
                        ) : (
                          <NoData classNameTitle='!text-[13px]' />
                        )}
                      </Customscrollbar>
                    </div>
                  )}

                  {/* Công đoạn TP */}
                  {data?.stage_products?.length > 0 && (
                    <div className='flex-1 min-h-0 flex flex-col overflow-hidden'>
                      <div className='p-3 font-medium responsive-text-base border-b border-primary-05 flex-shrink-0'>Công đoạn TP</div>
                      <Customscrollbar className='flex-1 min-h-0'>
                        {data?.stage_products?.length > 0 ? (
                          data?.stage_products?.map(e => (
                            <li
                              key={e?.stage_id}
                              onClick={() => handleSelectStep('TP', e, 'click')}
                              className={`p-3 cursor-pointer ${
                                activeStep.type == 'TP' && activeStep?.item?.stage_id == e?.stage_id
                                  ? 'bg-gradient-to-r from-[#0375F336] to-[#C4C4C400] border-l-4 border-[#0375F3]'
                                  : 'hover:bg-gray-100 '
                              } ${e?.active == '1' ? 'text-blue-fmrp' : 'text-gray-500'} responsive-text-base list-none flex items-center gap-2 transition-all duration-150 ease-linear select-none`}
                            >
                              <div className='min-w-[16px] flex items-center justify-center'>
                                {e?.active == '1' ? <FaCheckCircle size='16' className='text-blue-fmrp' /> : <div className='w-1 h-1 bg-gray-500 rounded-full'></div>}
                              </div>
                              <p>{e?.name_stage}</p>
                            </li>
                          ))
                        ) : (
                          <NoData classNameTitle='!text-[13px]' />
                        )}
                      </Customscrollbar>
                    </div>
                  )}
                </div>
              </div>

              {/* TODO: */}
              {/* Right Panel */}
              <div className='col-span-13 flex flex-col gap-2 min-h-0'>
                {errorNVLData && errorNVLData?.items?.length > 0 && (
                  <div className='py-2 px-3 flex flex-col gap-2 bg-[#FFEEF0] border border-[#991B1B] rounded-lg flex-shrink-0'>
                    <div className='flex items-center justify-between gap-2'>
                      <div className='flex items-center gap-1'>
                        <WarningIcon className='size-5' />
                        <h3 className='text-sm font-normal text-neutral-07'>
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

                {errorNVLDataBefore && errorNVLDataBefore?.items?.length > 0 && (
                  <div className='py-2 px-3 flex flex-col gap-2 bg-[#FFEEF0] border border-[#991B1B] rounded-lg flex-shrink-0'>
                    <div className='flex items-center justify-between gap-2'>
                      <div className='flex items-center gap-1'>
                        <WarningIcon className='size-5' />
                        <h3 className='text-sm font-normal text-neutral-07'>
                          <span className='font-semibold text-[#EE1E1E]'>{errorNVLDataBefore.items.length}</span> nguyên liệu dưới đây chưa được hoàn thành ở bước trước, vui lòng hoàn thành trước khi
                          đến bước này!
                        </h3>
                      </div>
                      <CloseXIcon className='size-5 cursor-pointer' onClick={() => setErrorNVLDataBefore({ items: [] })} />
                    </div>
                    <div className='flex flex-col gap-1'>
                      {errorNVLDataBefore.items.map((item, index) => (
                        <div key={index} className='px-3 py-1 flex items-center justify-between gap-1'>
                          <div className='flex items-center gap-2'>
                            <Image src={item.images || '/icon/default/default.png'} alt='default' width={36} height={36} className='object-cover rounded' />
                            <div className='flex flex-col gap-0.5'>
                              <h3 className='text-sm font-semibold text-neutral-07'>
                                {item.item_name} - <span className='responsive-text-base font-medium text-neutral-03'>({item.stage_name})</span>
                              </h3>
                              <p className='text-xs font-normal text-neutral-03'>{item.product_variation}</p>
                              <p className='responsive-text-xs font-normal text-typo-blue-2'>{item.reference_no_detail}</p>
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

                <div className='flex col-span-13 h-full w-full min-h-0'>
                  <div className='flex flex-col gap-6 h-full w-full min-h-0 flex-1'>
                    {/* Nhập thành phẩm */}
                    <div className='flex items-center justify-between flex-shrink-0'>
                      <div className='responsive-text-xl font-normal'>Nhập thành phẩm</div>
                      <div className='w-1/3 m-0.5'>
                        <SelectComponent
                          options={data?.warehouses || []}
                          onChange={e => {
                            setIsWarehouseMissing(false);
                            queryState({ objectWareHouse: e });
                          }}
                          value={isState.objectWareHouse}
                          isClearable={true}
                          icon={<PiWarehouseLight color='#9295A4' className='size-4' />}
                          closeMenuOnSelect={true}
                          hideSelectedOptions={false}
                          placeholder='Chọn kho hàng'
                          styles={{
                            control: (base, state) => ({
                              ...base,
                              borderColor: state.isFocused ? '#0F4F9E' : isWarehouseMissing ? '#ef4444' : base.borderColor,
                              borderRadius: '8px',
                              '&:hover': {
                                borderColor: state.isFocused ? '#0F4F9E' : isWarehouseMissing ? '#ef4444' : base.borderColor,
                              },
                            }),
                            placeholder: base => ({
                              ...base,
                              color: '#cbd5e1',
                            }),
                          }}
                          isSearchable={true}
                        />
                        {/* {isWarehouseMissing && <p className='mt-1 text-xs text-[#EE1E1E]'>Chưa chọn kho</p>} */}
                      </div>
                    </div>

                    <div className='flex flex-col overflow-hidden flex-1 min-h-0'>
                      <div className='grid grid-cols-25 items-center border-b border-[#F3F3F4] sticky top-0 bg-white flex-shrink-0 z-10'>
                        <h3 className='col-span-1 responsive-text-sm text-neutral-02 py-2 px-1 font-semibold text-center'>STT</h3>
                        <h3 className={`responsive-text-sm text-neutral-02 p-2 font-semibold ${showExpiryColumns || showSerialColumns ? 'col-span-4' : 'col-span-6'}`}>Mặt hàng</h3>
                        <h3 className='col-span-2 responsive-text-sm text-neutral-02 font-semibold '>Đơn vị tính</h3>
                        <h3
                          className={`responsive-text-sm text-neutral-02 p-2 font-semibold text-center
                              ${showExpiryColumns || showSerialColumns ? 'col-span-3' : 'col-span-4'}
                              `}
                        >
                          SL hoàn thành
                        </h3>
                        {showSerialColumns && <div className='col-span-3 responsive-text-sm text-neutral-02 text-center font-semibold'>Serial hoàn thành</div>}
                        <div
                          className={`responsive-text-sm text-neutral-02 p-2 font-semibold text-center
                              ${showExpiryColumns || showSerialColumns ? 'col-span-3' : 'col-span-4'}
                              `}
                        >
                          SL lỗi
                        </div>
                        {showSerialColumns && <div className='col-span-3 responsive-text-sm text-neutral-02 p-2 text-center font-semibold'>Serial lỗi</div>}
                        {showExpiryColumns && (
                          <>
                            <div className='col-span-3 responsive-text-sm text-neutral-02 p-2 font-semibold'>Lot</div>
                            <div className='col-span-3 responsive-text-sm text-neutral-02 p-2 font-semibold'>{dataLang?.warehouses_detail_date ?? 'warehouses_detail_date'}</div>
                          </>
                        )}
                        <div
                          className={`whitespace-nowrap text-center responsive-text-sm text-neutral-02 font-semibold
                              ${showExpiryColumns || showSerialColumns ? 'col-span-2' : 'col-span-3 p-2'}
                              `}
                        >
                          SL cần nhập
                        </div>
                        <div
                          className={`whitespace-nowrap text-center responsive-text-sm text-neutral-02 p-1 font-semibold
                              ${showExpiryColumns || showSerialColumns ? 'col-span-2' : 'col-span-3'}
                              `}
                        >
                          SL đã nhập
                        </div>
                        <div className='col-span-2 responsive-text-sm text-neutral-02 text-center font-semibold '>Thao tác</div>
                      </div>
                      <Customscrollbar className='flex-1 min-h-0'>
                        {isLoadingActiveStages && activeStep.type == 'TP' ? (
                          <div className='flex justify-center items-center h-40'>
                            <Loading className='!h-[100px] w-full mx-auto' />
                          </div>
                        ) : isState.dataTableProducts?.data?.items?.length > 0 ? (
                          isState.dataTableProducts?.data?.items?.map((row, index) => (
                            <ProductRow
                              key={index}
                              row={row}
                              index={index}
                              showExpiryColumns={showExpiryColumns}
                              showSerialColumns={showSerialColumns}
                              formatNumber={formatNumber}
                              handleQuantityChange={handleQuantityChange}
                              handleChange={handleChange}
                              handleRemove={handleRemove}
                              dataProductExpiry={dataProductExpiry}
                              dataLang={dataLang}
                              itemsLength={isState.dataTableProducts?.data?.items?.length}
                            />
                          ))
                        ) : (
                          <div className='col-span-25 p-2 text-center text-red-500 h-40 my-auto flex justify-center items-center'>Không có mặt hàng để hoàn thành</div>
                        )}
                      </Customscrollbar>
                      <div className='grid grid-cols-25 items-center bg-[#CCCCCC40] rounded flex-shrink-0'>
                        <h3
                          className={`p-2 text-center text-neutral-07 responsive-text-base font-medium
                          ${showExpiryColumns || showSerialColumns ? 'col-span-7' : 'col-span-9'}
                          `}
                        >
                          TỔNG CỘNG
                        </h3>
                        <h3
                          className={`p-2 text-center text-neutral-07 responsive-text-base font-medium
                          ${showExpiryColumns || showSerialColumns ? 'col-span-3' : 'col-span-4'}
                          `}
                        >
                          {formatNumber(getTotals.totalQuantityEnterClient)}
                        </h3>
                        {showSerialColumns && <div className='col-span-3 responsive-text-sm text-neutral-02 text-center font-semibold'>{formatNumber(getTotals.totalQuantityEnterClient)}</div>}
                        <div
                          className={`p-2 responsive-text-sm text-neutral-07 font-semibold text-center
                          ${showExpiryColumns || showSerialColumns ? 'col-span-3' : 'col-span-4'}
                          `}
                        >
                          {formatNumber(getTotals.totalQuantityError)}
                        </div>
                        {showSerialColumns && <div className='col-span-3 responsive-text-sm text-neutral-02 p-2 text-center font-semibold'>{formatNumber(getTotals.totalQuantityError)}</div>}
                        {showExpiryColumns && (
                          <>
                            <div className='col-span-3 responsive-text-sm text-neutral-02 p-2 font-semibold'></div>
                            <div className='col-span-3 responsive-text-sm text-neutral-02 p-2 font-semibold'></div>
                          </>
                        )}
                        <div
                          className={`whitespace-nowrap text-center responsive-text-sm text-neutral-07 font-semibold
                          ${showExpiryColumns || showSerialColumns ? 'col-span-2' : 'col-span-3 p-2'}
                          `}
                        >
                          {formatNumber(getTotals.totalQuantityEnter)}
                        </div>
                        <div
                          className={`whitespace-nowrap text-center responsive-text-sm text-neutral-07 font-semibold
                          ${showExpiryColumns || showSerialColumns ? 'col-span-2' : 'col-span-3 p-2'}
                          `}
                        >
                          {formatNumber(getTotals.totalQuantityEntered)}
                        </div>
                        <div className='col-span-2 responsive-text-sm text-neutral-02 text-center font-semibold '></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PopupCustom>
      )}
    </>
  );
};

export default PopupConfimStage;
