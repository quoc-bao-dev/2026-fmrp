import apiInventory from '@/Api/apiManufacture/warehouse/inventory/apiInventory';
import apiDashboard from '@/Api/apiDashboard/apiDashboard';
import ButtonDelete from '@/components/common/orderManagement/ButtonDelete';
import { DocumentDate, DocumentNumber } from '@/components/common/orderManagement/GeneralInfo';
import OrderFormTabs from '@/components/common/orderManagement/OrderFormTabs';
import SelectSearch from '@/components/common/orderManagement/SelectSearch';
import SelectWithRadio from '@/components/common/orderManagement/SelectWithRadio';
import { WarningIcon } from '@/components/icons';
import CloseXIcon from '@/components/icons/common/CloseXIcon';
import LayoutForm from '@/components/layout/LayoutForm';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { TagColorProduct } from '@/components/UI/common/Tag/TagStatus';
import SelectComponent from '@/components/UI/filterComponents/selectComponent';
import InPutNumericFormat from '@/components/UI/inputNumericFormat/inputNumericFormat';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import PopupCustom from '@/components/UI/popup';
import { optionsQuery } from '@/configs/optionsQuery';
import { useImportItemByOrder } from '@/containers/purchase-order/import/hooks/useImportItemByOrder';
import { useBranchList } from '@/hooks/common/useBranch';
import { useLocationByWarehouseInventory, useWarehouseInventory } from '@/hooks/common/useWarehouses';
import { useAuththentication } from '@/hooks/useAuth';
import useFeature from '@/hooks/useConfigFeature';
import useSetingServer from '@/hooks/useConfigNumber';
import useStatusExprired from '@/hooks/useStatusExprired';
import useToast from '@/hooks/useToast';
import { isAllowedNumber } from '@/utils/helpers/common';
import formatMoneyConfig from '@/utils/helpers/formatMoney';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import { CreatableSelectCore } from '@/utils/lib/CreatableSelect';
import { useQuery } from '@tanstack/react-query';
import { Add } from 'iconsax-react';
import moment from 'moment';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { PiMapPinLight } from 'react-icons/pi';
import { useDebounce } from 'use-debounce';
import PopupImportExcel from './components/popupImportExcel';

const InventoryForm = props => {
  const isShow = useToast();
  const dataLang = props.dataLang;
  const router = useRouter();
  const dispatch = useDispatch();
  const statusExprired = useStatusExprired();
  const scrollAreaRef = useRef(null);
  const dataSeting = useSetingServer();
  const [onSending, sOnSending] = useState(false);
  const [dataChoose, sDataChoose] = useState([]);
  const [voucherdate, sVoucherdate] = useState(new Date());
  const [code, sCode] = useState('');
  const [warehouse, sWarehouse] = useState(null);
  const [branch, sBranch] = useState(null);
  const [note, sNote] = useState('');
  const [errWareHouse, sErrWareHouse] = useState(false);
  const [errBranch, sErrBranch] = useState(false);
  const [errProduct, sErrProduct] = useState(false);
  const [errNullLocate, sErrNullLocate] = useState(false);
  const [errNullLot, sErrNullLot] = useState(false);
  const [errNullDate, sErrNullDate] = useState(false);
  const [errNullSerial, sErrNullSerial] = useState(false);
  const [errNullQty, sErrNullQty] = useState(false);
  const [errData, sErrData] = useState([]);
  const [isSubmitted, sIsSubmitted] = useState(false);
  const [dataErr, sDataErr] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [debouncedInputValue] = useDebounce(inputValue, 500);

  const handleSearchInput = useCallback(
    value => {
      if (!warehouse) {
        sErrWareHouse(true);
        isShow('error', 'Vui lòng chọn kho hàng trước khi tìm kiếm mặt hàng');
        return;
      }
      setInputValue(value);
    },
    [warehouse, isShow]
  );

  // [Import] [step 1] Khởi tạo state hiển thị banner lỗi khi import Excel
  const [importErrorBanner, setImportErrorBanner] = useState({
    message: '',
    totalErrors: 0,
    items: [],
  });

  const { data: dataAuth } = useAuththentication();
  const { data: dataBranch = [] } = useBranchList();
  const { data: dataWareHouse } = useWarehouseInventory(branch?.value);
  const { data: dataPstWH } = useLocationByWarehouseInventory(warehouse?.value);
  const { dataMaterialExpiry, dataProductExpiry, dataProductSerial } = useFeature();
  const isExpiryEnabled = dataMaterialExpiry?.is_enable === '1' || dataProductExpiry?.is_enable === '1';
  const { data: dataItems = [] } = useImportItemByOrder(null, null, branch, null, debouncedInputValue, warehouse);

  const options = dataItems?.map(e => ({
    label: `${e.name}`,
    value: e.id,
    e,
  }));

  const formatNumber = number => {
    return formatNumberConfig(+number, dataSeting);
  };

  const formatMoney = number => {
    return formatMoneyConfig(+number, dataSeting);
  };

  const getTypeDataKey = textType => {
    const typeMap = {
      products: 0,
      material: 1,
      semi_products: 2,
    };
    return typeMap[textType] ?? 0;
  };

  const handleMenuOpen = () => {
    const menuPortalTarget = scrollAreaRef.current;
    return { menuPortalTarget };
  };

  // Refetch dữ liệu feature mỗi khi vào component để đảm bảo có dữ liệu mới nhất
  useEffect(() => {
    const fetchFeature = async () => {
      try {
        const fature = await apiDashboard.apiFeature();
        const newData = {
          dataMaterialExpiry: fature.find((x) => x.code == "material_expiry"),
          dataProductExpiry: fature.find((x) => x.code == "product_expiry"),
          dataProductSerial: fature.find((x) => x.code == "product_serial"),
        };
        dispatch({ type: "setings/feature", payload: newData });
      } catch (error) {
        console.error('Failed to fetch feature data:', error);
      }
    };
    fetchFeature();
  }, [dispatch]);

  useEffect(() => {
    const branch = dataAuth?.branch[0];
    if (branch) {
      sBranch({
        value: branch.id,
        label: branch.name,
      });
    }
  }, [dataAuth]);

  // Khi đổi kho, cần lấy lại dữ liệu tồn kho để hiển thị đúng SL phần mềm cho từng vị trí
  useEffect(() => {
    if (!warehouse?.value || dataChoose.length === 0) return;

    const refreshInventoryByWarehouse = async () => {
      try {
        const updatedItems = await Promise.all(
          dataChoose.map(async item => {
            const { isSuccess } = await apiInventory.apiGetVariantInventoryVariation({
              data: {
                id: item.id,
                warehouse_id: warehouse.value,
              },
            });

            if (!isSuccess?.result || isSuccess.result.length === 0) return item;

            const variant = isSuccess.result[0];
            const mappedWarehouse =
              variant?.warehouse?.map(wh => ({
                label: wh?.location_name,
                value: wh?.id,
                warehouse_name: wh?.warehouse_name,
                qty: wh?.quantity,
              })) || [];

            return {
              ...item,
              checkExpiry: variant?.expiry === '1' ? '1' : '0',
              checkSerial: variant?.serial === '1' ? '1' : '0',
              dataLot:
                variant?.lot_array?.map(lot => ({
                  label: lot,
                  value: lot,
                })) || [],
              dataSerial:
                variant?.serial_array?.length > 0
                  ? variant.serial_array.map(serial => ({
                      label: serial,
                      value: serial,
                    }))
                  : [],
              dataWarehouse: mappedWarehouse,
              checkChild:
                variant?.warehouse?.map(ce => ({
                  amount: null,
                  quantity: Number(ce.quantity),
                  serial: ce.serial,
                  lot: ce.lot,
                  date: ce.expiration_date ? moment(ce.expiration_date).format('DD/MM/yyyy') : null,
                  locate: ce.location_id,
                })) || [],
              child: item.child.map(child => ({
                ...child,
                dataWarehouse: mappedWarehouse,
                // Reset quantity để lấy lại SL phần mềm đúng khi người dùng chọn vị trí/serial mới
                quantity: null,
              })),
            };
          })
        );
        sDataChoose(updatedItems);
      } catch (error) {
        console.error('Failed to refresh inventory by warehouse', error);
      }
    };

    refreshInventoryByWarehouse();
  }, [warehouse?.value]);

  // Cố định ngày kiểm kê là ngày hôm nay
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    sVoucherdate(today);
  }, []);

  const _HandleChangeValue = (type, value) => {
    if (type === 'code') {
      sCode(value?.target.value);
    } else if (type === 'warehouse') {
      sWarehouse(value);
      // Khi đổi kho hàng, chỉ reset dữ liệu đã nhập (giữ lại danh sách mặt hàng)
      sDataChoose(prev =>
        prev.map(item => ({
          ...item,
          child: item.child.map(child => ({
            ...child,
            locate: null,
            amount: null,
            lot: null,
            date: null,
            serial: null,
            quantity: null,
            price: null,
          })),
        }))
      );
      setSelectedItem(null);
      setImportErrorBanner({ message: '', totalErrors: 0, items: [] });
      setInputValue('');
      sErrProduct(false);
      sErrNullLocate(false);
      sErrNullLot(false);
      sErrNullDate(false);
      sErrNullSerial(false);
      sErrNullQty(false);
    } else if (type === 'branch') {
      sBranch(value);
      sWarehouse(null);
    } else if (type === 'note') {
      sNote(value?.target.value);
    }
  };

  // [Import] [step 2] Tiếp nhận response import: cập nhật banner lỗi và ánh xạ dữ liệu hợp lệ về state bảng
  const _HandleImportExcelResult = useCallback(
    response => {
      if (!response) {
        setImportErrorBanner({ message: '', totalErrors: 0, items: [] });
        return;
      }

      const errorItemsRaw = Array.isArray(response?.errors) ? response.errors : [];
      const mappedErrors = errorItemsRaw.map((item, index) => ({
        row: item?.row ?? index + 1,
        message: item?.message ?? '',
        code_items: item?.code_items ?? '',
        location_code: item?.location_code ?? '',
        name_items: item?.name_items ?? '',
      }));

      setImportErrorBanner({
        message: response?.message ?? '',
        totalErrors: response?.total_errors ?? mappedErrors.length,
        items: mappedErrors,
      });

      if (Array.isArray(response?.data) && response.data.length > 0) {
        const mapRowsToInventoryItems = rows => {
          const groupedMap = new Map();
          // cách ánh xạ dữ liệu từ response import Excel về state bảng
          rows.forEach((row, index) => {
            const baseKey = row?.id || `${row?.item_id || 'item'}__${row?.item_variation_id || 0}__${row?.type || 'product'}`;
            if (!groupedMap.has(baseKey)) {
              // Response đã có đầy đủ expiry và serial, sử dụng trực tiếp
              const checkExpiryValue = row?.expiry !== undefined 
                ? (row?.expiry === '1' || row?.expiry === 1 ? '1' : '0')
                : (row?.lot || row?.date ? '1' : '0'); // Fallback: nếu không có expiry, dựa vào lot/date
              
              // serial có thể là '1', '0', null, hoặc string (serial number)
              // Nếu serial là '1' hoặc '0' => checkSerial
              // Nếu serial là string (serial number) => checkSerial = '1'
              // Nếu serial là null => checkSerial = '0'
              let checkSerialValue = '0';
              if (row?.serial !== undefined && row?.serial !== null) {
                if (row?.serial === '1' || row?.serial === 1) {
                  checkSerialValue = '1';
                } else if (row?.serial === '0' || row?.serial === 0) {
                  checkSerialValue = '0';
                } else if (typeof row?.serial === 'string' && row?.serial !== '') {
                  // Nếu serial là string không rỗng (serial number), có nghĩa là item có serial
                  checkSerialValue = '1';
                }
              }

              groupedMap.set(baseKey, {
                id: baseKey,
                code: row?.code || '',
                name: row?.name || '',
                img: row?.image || null,
                variant: row?.product_variation || '',
                type: row?.type || '',
                checkExpiry: checkExpiryValue,
                checkSerial: checkSerialValue,
                show: true,
                dataLot: [],
                dataSerial: [],
                dataWarehouse: [],
                child: [],
                checkChild: [],
              });
            }

            const parent = groupedMap.get(baseKey);
            parent.code = row?.code ?? parent.code;
            parent.name = row?.name ?? parent.name;
            parent.variant = row?.product_variation ?? parent.variant;
            parent.type = row?.type ?? parent.type;

            // Cập nhật checkExpiry từ response (response đã có đầy đủ thông tin)
            if (row?.expiry !== undefined) {
              parent.checkExpiry = row?.expiry === '1' || row?.expiry === 1 ? '1' : '0';
            } else if (row?.lot || row?.date) {
              // Fallback: nếu không có expiry trong response nhưng có lot/date, set checkExpiry = '1'
              parent.checkExpiry = '1';
            }
            
            // Cập nhật checkSerial từ response (response đã có đầy đủ thông tin)
            if (row?.serial !== undefined && row?.serial !== null) {
              if (row?.serial === '1' || row?.serial === 1) {
                parent.checkSerial = '1';
              } else if (row?.serial === '0' || row?.serial === 0) {
                parent.checkSerial = '0';
              } else if (typeof row?.serial === 'string' && row?.serial !== '') {
                // Nếu serial là string không rỗng (serial number), có nghĩa là item có serial
                parent.checkSerial = '1';
              }
            }

            if (row?.lot) {
              const lotOption = { value: row.lot, label: row.lot };
              if (!parent.dataLot.some(option => option.value === lotOption.value)) {
                parent.dataLot.push(lotOption);
              }
            }

            if (row?.serial) {
              const serialOption = { value: row.serial, label: row.serial };
              if (!parent.dataSerial.some(option => option.value === serialOption.value)) {
                parent.dataSerial.push(serialOption);
              }
            }

            const childDate = row?.date ? moment(row.date).toDate() : null;
            const childLocate = row?.location_id
              ? {
                  value: row.location_id,
                  label: row.location_name || row.location_code || '',
                  code: row.location_code || '',
                }
              : null;

            const childItem = {
              id: Date.now() + index,
              locate: childLocate,
              amount: Number(row?.quantity_net ?? 0),
              lot: row?.lot ? { value: row.lot, label: row.lot } : null,
              date: childDate,
              serial: row?.serial ?? null,
              quantity: Number(row?.quantity ?? 0),
              price: Number(row?.price ?? 0),
              dataWarehouse: [],
            };

            const isChildDuplicated = parent.child.some(existing => {
              const existingDate = existing.date ? moment(existing.date).format('YYYY-MM-DD') : '';
              const currentDate = childDate ? moment(childDate).format('YYYY-MM-DD') : '';
              return (
                (existing.locate?.value || '') === (childLocate?.value || '') &&
                (existing.lot?.value || '') === (childItem.lot?.value || '') &&
                (existing.serial || '') === (childItem.serial || '') &&
                existingDate === currentDate
              );
            });

            if (!isChildDuplicated) {
              parent.child.push(childItem);
            }

            const checkChildEntry = {
              amount: Number(row?.quantity_net ?? 0),
              quantity: Number(row?.quantity ?? 0),
              serial: row?.serial ?? null,
              lot: row?.lot ?? null,
              date: row?.date ? moment(row.date).format('DD/MM/yyyy') : null,
              locate: row?.location_id ?? null,
            };

            const isCheckChildDuplicated = parent.checkChild.some(entry => {
              return entry.locate === checkChildEntry.locate && entry.lot === checkChildEntry.lot && entry.serial === checkChildEntry.serial && entry.date === checkChildEntry.date;
            });

            if (!isCheckChildDuplicated) {
              parent.checkChild.push(checkChildEntry);
            }
          });

          return Array.from(groupedMap.values());
        };

        const mappedInventoryItems = mapRowsToInventoryItems(response.data);

        sDataChoose(prev => {
          const merged = new Map(prev.map(item => [item.id, item]));
          const newItemsToFetch = [];
          
          mappedInventoryItems.forEach(item => {
            const existingItem = merged.get(item.id);
            if (existingItem) {
              // Nếu item đã tồn tại, giữ nguyên checkExpiry và checkSerial từ dữ liệu thực tế (từ API)
              merged.set(item.id, {
                ...item,
                checkExpiry: existingItem.checkExpiry,
                checkSerial: existingItem.checkSerial,
                dataWarehouse: existingItem.dataWarehouse || item.dataWarehouse,
              });
            } else {
              // Vì response đã có đầy đủ expiry và serial, chỉ cần gọi API nếu thiếu thông tin này
              // Hoặc cần lấy thêm dataLot, dataSerial, dataWarehouse, checkChild
              if (item.checkExpiry === undefined || item.checkSerial === undefined) {
                newItemsToFetch.push(item);
              }
              merged.set(item.id, item);
            }
          });
          
          // Chỉ gọi API nếu thiếu thông tin checkExpiry/checkSerial (backward compatibility)
          // Hoặc cần lấy thêm dataLot, dataSerial, dataWarehouse, checkChild cho item mới
          if (newItemsToFetch.length > 0 && warehouse?.value) {
            Promise.all(
              newItemsToFetch.map(async item => {
                try {
                  const { isSuccess } = await apiInventory.apiGetVariantInventoryVariation({
                    data: {
                      id: item.id,
                      warehouse_id: warehouse.value,
                    },
                  });
                  
                  if (isSuccess?.result && isSuccess.result.length > 0) {
                    const variant = isSuccess.result[0];
                    return {
                      itemId: item.id,
                      checkExpiry: variant?.expiry === '1' ? '1' : '0',
                      checkSerial: variant?.serial === '1' ? '1' : '0',
                      dataLot: variant?.lot_array?.map(lot => ({ label: lot, value: lot })) || [],
                      dataSerial: variant?.serial_array?.map(serial => ({ label: serial, value: serial })) || [],
                      dataWarehouse: variant?.warehouse?.map(wh => ({
                        label: wh?.location_name,
                        value: wh?.id,
                        warehouse_name: wh?.warehouse_name,
                        qty: wh?.quantity,
                      })) || [],
                      checkChild: variant?.warehouse?.map(ce => ({
                        amount: null,
                        quantity: Number(ce.quantity),
                        serial: ce.serial,
                        lot: ce.lot,
                        date: ce.expiration_date ? moment(ce.expiration_date).format('DD/MM/yyyy') : null,
                        locate: ce.location_id,
                      })) || [],
                    };
                  }
                } catch (error) {
                  console.error(`Failed to fetch variant info for item ${item.id}:`, error);
                  return null;
                }
              })
            ).then(results => {
              // Cập nhật lại state sau khi fetch xong
              sDataChoose(prev => {
                const updated = prev.map(item => {
                  const fetchedData = results.find(r => r && r.itemId === item.id);
                  if (fetchedData) {
                    return {
                      ...item,
                      checkExpiry: fetchedData.checkExpiry || item.checkExpiry,
                      checkSerial: fetchedData.checkSerial || item.checkSerial,
                      dataLot: fetchedData.dataLot.length > 0 ? fetchedData.dataLot : item.dataLot,
                      dataSerial: fetchedData.dataSerial.length > 0 ? fetchedData.dataSerial : item.dataSerial,
                      dataWarehouse: fetchedData.dataWarehouse.length > 0 ? fetchedData.dataWarehouse : item.dataWarehouse,
                      checkChild: fetchedData.checkChild.length > 0 ? fetchedData.checkChild : item.checkChild,
                    };
                  }
                  return item;
                });
                return updated;
              });
            });
          }
          
          return Array.from(merged.values());
        });
      }
    },
    [sDataChoose]
  );

  useEffect(() => {
    warehouse !== null && sErrWareHouse(false);
  }, [warehouse]);

  const [selectedItem, setSelectedItem] = useState(null);

  // Xử lý khi chọn item từ SelectSearch
  const _HandleAddParent = useCallback(
    async value => {
      if (!value) return;

      // Kiểm tra xem item đã tồn tại chưa
      const checkData = dataChoose?.some(e => {
        const itemId = e.id?.toString();
        const valueId = value?.value?.toString();
        return itemId === valueId || itemId?.includes(valueId);
      });

      if (checkData) {
        isShow('error', 'Mặt hàng này đã được thêm vào danh sách');
        return;
      }

      if (!warehouse) {
        isShow('error', 'Vui lòng chọn kho hàng');
        sErrWareHouse(true);
        return;
      }

      setSelectedItem(value);
    },
    [dataChoose, warehouse, isShow, sErrWareHouse]
  );

  // Gọi API để lấy thông tin chi tiết của item
  const { isFetching: isFetchingItem } = useQuery({
    queryKey: ['api_inventory_variation_by_id', selectedItem?.value, warehouse?.value],
    queryFn: async () => {
      if (!selectedItem || !warehouse) return null;

      const { isSuccess } = await apiInventory.apiGetVariantInventoryVariation({
        data: {
          id: selectedItem?.value,
          warehouse_id: warehouse?.value,
        },
      });

      if (isSuccess?.result) {
        const mappedItems = isSuccess.result.map(e => ({
          id: e.id,
          code: e.code,
          name: e.name,
          img: e.images,
          variant: e.product_variation,
          type: e.text_type,
          checkExpiry: e.expiry === '1' ? '1' : '0',
          // e.serial là chuỗi "0" hoặc "1" => cần so sánh giá trị, không dùng truthy
          checkSerial: e.serial === '1' ? '1' : '0',
          show: true,
          dataLot:
            e.lot_array?.map(lot => ({
              label: lot,
              value: lot,
            })) || [],
          dataSerial:
            e.serial_array?.length > 0
              ? e.serial_array.map(serial => ({
                  label: serial,
                  value: serial,
                }))
              : [],
          dataWarehouse:
            e?.warehouse?.map(wh => ({
              label: wh?.location_name,
              value: wh?.id,
              warehouse_name: wh?.warehouse_name,
              qty: wh?.quantity,
            })) || [],
          child: [
            {
              id: Date.now(),
              locate: null,
              amount: null,
              lot: null,
              date: null,
              serial: null,
              quantity: null,
              price: null,
              dataWarehouse:
                e?.warehouse?.map(wh => ({
                  label: wh?.location_name,
                  value: wh?.id,
                  warehouse_name: wh?.warehouse_name,
                  qty: wh?.quantity,
                })) || [],
            },
          ],
          checkChild:
            e?.warehouse?.map(ce => ({
              amount: null,
              quantity: Number(ce.quantity),
              serial: ce.serial,
              lot: ce.lot,
              date: ce.expiration_date ? moment(ce.expiration_date).format('DD/MM/yyyy') : null,
              locate: ce.location_id,
            })) || [],
        }));

        // Lọc các item chưa có trong dataChoose
        const newItems = mappedItems.filter(item => !dataChoose.some(existing => existing.id === item.id));

        if (newItems.length > 0) {
          sDataChoose(prev => [...prev, ...newItems]);
        }

        setSelectedItem(null);
      }

      return isSuccess;
    },
    enabled: !!selectedItem && !!warehouse,
    ...optionsQuery,
  });

  const _HandleActionItem = (id, type) => {
    if (type === 'add') {
      const newData = dataChoose.map(e => {
        if (e.id === id) {
          e.child.push({
            id: Date.now(),
            locate: null,
            amount: null,
            lot: null,
            date: null,
            serial: null,
            quantity: null,
            price: null,
            dataWarehouse: e?.dataWarehouse || [],
          });
          return { ...e, show: true };
        }
        return e;
      });
      sDataChoose([...newData]);
    }
  };

  const _HandleDeleteChild = (parentId, id) => {
    const newData = dataChoose
      .map(e => {
        if (e.id === parentId) {
          const newChild = e.child?.filter(ce => ce.id !== id);
          return { ...e, child: newChild };
        }
        return e;
      })
      .filter(e => e.child.length > 0);
    sDataChoose([...newData]);
  };

  const _HandleChangeChild = (parentId, id, type, value) => {
    const newData = dataChoose.map(e => {
      if (e.id === parentId) {
        let updatedDataLot = e.dataLot || [];
        const newChild = e.child?.map(ce => {
          if (ce.id === id) {
            if (type === 'amount') {
              ce.amount = Number(value?.value);
              return { ...ce };
            } else if (type === 'locate') {
              ce.locate = value;
              // Nếu bỏ chọn vị trí kho, reset quantity về 0
              if (value === null || value === undefined) {
                ce.quantity = 0;
              } else if (ce?.locate !== null && ce.locate?.value != null) {
                // Lấy quantity từ checkChild dựa trên locate khi chỉ chọn locate (chưa có lot/date/serial)
                const locateValue = ce.locate.value;
                const checkByLocate = e.checkChild?.find(item => {
                  // So sánh với cả string và number để đảm bảo khớp
                  return String(item.locate) === String(locateValue) || Number(item.locate) === Number(locateValue);
                });
                if (checkByLocate && checkByLocate.quantity != null) {
                  ce.quantity = Number(checkByLocate.quantity);
                } else {
                  ce.quantity = 0;
                }
              }
              // Gọi các hàm kiểm tra trùng lặp khi có đủ điều kiện
              e?.checkExpiry === '1' && ce?.locate !== null && ce?.lot !== null && ce.date !== null && _HandleCheckSameLot(parentId, id, ce?.locate, ce?.lot, ce?.date);
              e?.checkSerial === '1' && ce?.locate !== null && ce?.serial !== null && _HandleCheckSameSerial(parentId, id, ce?.locate, ce?.serial);
              e?.checkExpiry === '0' && e?.checkSerial == '0' && _HandleCheckSameLoca(parentId, id, ce?.locate);
              return { ...ce };
            } else if (type === 'lot') {
              ce.lot = value;
              
              // Nếu bỏ chọn lot, reset lot về null và tìm quantity với lot = null trong checkChild
              if (value === null || value === undefined) {
                ce.lot = null;
                // Tìm trong checkChild với locate và lot = null để lấy quantity ban đầu
                if (ce?.locate !== null) {
                  const locateValue = ce.locate.value;
                  // Tìm trong checkChild dựa trên locate và lot = null
                  const checkByLocateAndNullLot = e.checkChild?.find(item => {
                    return (
                      (String(item.locate) === String(locateValue) || Number(item.locate) === Number(locateValue)) &&
                      (item.lot === null || item.lot === undefined || item.lot === '')
                    );
                  });
                  if (checkByLocateAndNullLot && checkByLocateAndNullLot.quantity != null) {
                    ce.quantity = Number(checkByLocateAndNullLot.quantity);
                  } else {
                    // Nếu không tìm thấy, set quantity về 0
                    ce.quantity = 0;
                  }
                } else {
                  ce.quantity = 0;
                }
              } else {
                // Nếu tạo lot mới (value có label và value), thêm vào dataLot nếu chưa tồn tại
                if (value && typeof value === 'object' && value.label && value.value) {
                  const lotExists = updatedDataLot.some(lot => lot.value === value.value);
                  if (!lotExists) {
                    updatedDataLot = [...updatedDataLot, { label: value.label, value: value.value }];
                  }
                }
                // Kiểm tra lot có khớp với dữ liệu trong checkChild không
                if (ce?.locate !== null && ce?.lot !== null) {
                  const locateValue = ce.locate.value;
                  const lotValue = ce.lot.value;
                  // Tìm trong checkChild dựa trên locate và lot (chưa cần date)
                  const checkByLocateAndLot = e.checkChild?.find(item => {
                    return (
                      (String(item.locate) === String(locateValue) || Number(item.locate) === Number(locateValue)) &&
                      item.lot === lotValue
                    );
                  });
                  if (checkByLocateAndLot && checkByLocateAndLot.quantity != null) {
                    ce.quantity = Number(checkByLocateAndLot.quantity);
                  } else {
                    // Nếu không tìm thấy lot trùng với dữ liệu, set quantity về 0
                    ce.quantity = 0;
                  }
                }
              }
              ce?.locate !== null && ce?.lot !== null && ce.date !== null && _HandleCheckSameLot(parentId, id, ce?.locate, ce?.lot, ce?.date);
              return { ...ce };
            } else if (type === 'date') {
              ce.date = value;
              ce?.locate !== null && ce?.lot !== null && ce.date !== null && _HandleCheckSameLot(parentId, id, ce?.locate, ce?.lot, ce?.date);
              return { ...ce };
            } else if (type === 'serial') {
              // Xử lý serial: ưu tiên value?.target?.value (từ input event), sau đó là value nếu là string
              let serialValue = '';
              if (value?.target !== undefined) {
                // Nếu có target, lấy giá trị từ input (kể cả chuỗi rỗng)
                serialValue = value.target.value || '';
              } else if (typeof value === 'string') {
                // Nếu value là string, sử dụng trực tiếp
                serialValue = value;
              } else {
                // Mặc định là chuỗi rỗng
                serialValue = '';
              }
              ce.serial = serialValue;
              // Lấy quantity từ checkChild dựa trên locate và serial khi nhập serial
              if (ce?.locate !== null && ce?.serial !== null && ce.serial !== '') {
                const locateValue = ce.locate.value;
                const serialValue = ce.serial;
                const checkByLocateAndSerial = e.checkChild?.find(item => {
                  return (String(item.locate) === String(locateValue) || Number(item.locate) === Number(locateValue)) && item.serial === serialValue;
                });
                if (checkByLocateAndSerial && checkByLocateAndSerial.quantity != null) {
                  ce.quantity = Number(checkByLocateAndSerial.quantity);
                }
              }
              setTimeout(() => {
                e?.checkSerial == '1' && ce?.locate !== null && ce?.serial !== null && ce.serial !== '' && _HandleCheckSameSerial(parentId, id, ce?.locate, ce?.serial);
              }, 1000);
              return { ...ce };
            } else if (type === 'price') {
              return { ...ce, price: Number(value?.value) };
            }
          }
          return ce;
        });
        return { ...e, child: newChild, dataLot: updatedDataLot };
      }
      return e;
    });
    sDataChoose([...newData]);
  };

  const _HandleCheckSameLot = (parentId, id, locate, lot, date) => {
    setTimeout(() => {
      const newData = dataChoose.map(e => {
        if (e.id === parentId) {
          const checkData = e.child
            ?.filter(ce => ce?.id !== id)
            ?.some(item => item?.locate?.value === locate?.value && item.lot?.value === lot?.value && moment(item.date).format('DD/MM/yyyy') == moment(date).format('DD/MM/yyyy'));
          const newChild = e.child
            ?.map(ce => {
              if (ce.id == id && checkData) {
                isShow('error', `Trùng mặt hàng`);
                return {
                  ...ce,
                  locate: null,
                  amount: null,
                  lot: null,
                  date: null,
                  serial: null,
                  quantity: null,
                  price: null,
                };
              }
              return ce;
            })
            .filter(item => item.locate !== null);
          return { ...e, child: newChild };
        }
        return e;
      });
      const parent = newData.find(item => item.id === parentId);
      if (!parent) return null;
      const child = parent.child.find(e => e.id === id) || null;
      // if(!child) return null;
      const check = parent.checkChild.find(e => e.locate === child?.locate?.value && e.lot === child.lot?.value && e.date === moment(child.date).format('DD/MM/yyyy'));
      const newData1 = newData.map(e => {
        if (e.id === parentId) {
          const newChild = e.child?.map(ce => {
            if (ce.id === id) {
              return { ...ce, quantity: check?.quantity || 0 };
            }
            return ce;
          });
          return { ...e, child: newChild };
        }
        return e;
      });
      sDataChoose([...newData1]);
    }, 500);
  };

  const _HandleCheckSameSerial = (parentId, id, locate, serial) => {
    setTimeout(() => {
      const dataChild = dataChoose?.map(e => e?.child)?.flatMap(innerList => innerList);
      const checkData = dataChild?.some(item => item?.serial === serial && item?.id !== id);

      const newData = dataChoose?.map(e => {
        if (e.id === parentId && checkData) {
          isShow('error', `Trùng serial`);

          return {
            ...e,
            child: e?.child?.filter(ce => ce?.id !== id),
          };
        }
        return e;
      });
      const parent = newData?.find(item => item.id === parentId) || null;
      const child = parent?.child.find(e => e.id === id) || null;
      const check = parent?.checkChild.find(e => e.locate === child?.locate?.value && e.serial === child?.serial);

      const newData1 = newData.map(e => {
        if (e.id === parentId) {
          const newChild = e.child?.map(ce => {
            if (ce.id === id) {
              return { ...ce, quantity: check?.quantity || 0 };
            }
            return ce;
          });
          return { ...e, child: newChild };
        }
        return e;
      });
      sDataChoose([...newData1]);
    }, 1000);
  };

  const _HandleCheckSameLoca = (parentId, id, locate) => {
    setTimeout(() => {
      const newData = dataChoose.map(e => {
        if (e.id === parentId) {
          const checkData = e.child?.filter(ce => ce?.id !== id)?.some(item => item?.locate?.value === locate?.value);
          const newChild = e.child
            ?.map(ce => {
              if (ce.id == id && checkData) {
                isShow('error', `Trùng mặt hàng`);
                return {
                  ...ce,
                  locate: null,
                  amount: null,
                  lot: null,
                  date: null,
                  serial: null,
                  quantity: null,
                  price: null,
                };
              }
              return ce;
            })
            .filter(item => item.locate !== null);
          return { ...e, child: newChild };
        }
        return e;
      });
      // sLoadingData(true)

      const parent = newData.find(item => item.id === parentId);
      if (!parent) return null;
      const child = parent.child.find(e => e.id === id) || null;
      const check = parent.checkChild.find(e => e.locate === child?.locate?.value);
      const newData1 = newData.map(e => {
        if (e.id === parentId) {
          const newChild = e.child?.map(ce => {
            if (ce.id === id) {
              return { ...ce, quantity: check?.quantity || 0 };
            }
            return ce;
          });
          return { ...e, child: newChild };
        }
        return e;
      });

      sDataChoose([...newData1]);
    }, 1000);
  };

  const _ServerSending = async () => {
    let formData = new FormData();
    formData.append('code', code);
    formData.append('date', voucherdate);
    formData.append('warehouse', warehouse?.value);
    formData.append('branch', branch?.value);
    formData.append('note', note);
    dataChoose?.forEach((item, index) => {
      formData.append(`data[${index}][id]`, item?.id);
      formData.append(`data[${index}][code]`, item?.code);
      formData.append(`data[${index}][image]`, item?.img);
      formData.append(`data[${index}][variant]`, item?.variant);
      formData.append(`data[${index}][type]`, item?.type);
      formData.append(`data[${index}][name]`, item?.name);
      item?.child.forEach((itemChild, indexChild) => {
        formData.append(`data[${index}][child][${indexChild}][id]`, itemChild?.id);
        formData.append(`data[${index}][child][${indexChild}][date]`, itemChild?.date);
        formData.append(`data[${index}][child][${indexChild}][locate]`, itemChild?.locate?.value || null);
        formData.append(`data[${index}][child][${indexChild}][price]`, itemChild?.price || 0);
        formData.append(`data[${index}][child][${indexChild}][quantity_net]`, itemChild?.amount || 0);
        formData.append(`data[${index}][child][${indexChild}][quantity]`, itemChild?.quantity || 0);
        formData.append(`data[${index}][child][${indexChild}][lot]`, itemChild?.lot?.value || null);
        formData.append(`data[${index}][child][${indexChild}][serial]`, itemChild?.serial || null);
      });
    });
    try {
      const { isSuccess, message, items_error, result } = await apiInventory.apiHandingInventory(formData);
      if (isSuccess) {
        sIsSubmitted(false);

        sErrData([]);

        isShow('success', `${dataLang[message]}` || message);

        setTimeout(() => {
          router.back();
        }, 1000);
      } else {
        isShow('error', `${dataLang[message]}` || message);

        sErrData(items_error);

        sIsSubmitted(true);

        const hasStatus2 = items_error?.some(item => item.status === 2);

        if (hasStatus2) {
          sDataErr(true);
        } else {
          sDataErr(false);
        }
      }
    } catch (error) {
      throw error;
    }
    sOnSending(false);
  };

  useEffect(() => {
    onSending && _ServerSending();
  }, [onSending]);

  const _HandleSubmit = e => {
    e.preventDefault();

    const checkErrNullLocate = dataChoose.some(item => item.child.some(itemChild => itemChild.locate === null));

    const checkErrNullLot = dataChoose.some(item => isExpiryEnabled && item.checkExpiry === '1' && item.child.some(itemChild => itemChild.lot === null));

    const checkErrNullDate = dataChoose.some(item => isExpiryEnabled && item.checkExpiry === '1' && item.child.some(itemChild => itemChild.date === null));

    const checkErrNullSerial = dataChoose.some(item => dataProductSerial?.is_enable === '1' && item.checkSerial === '1' && item.child.some(itemChild => itemChild.serial === null));

    const ChildData = dataChoose?.map(e => e?.child)?.flatMap(e => e);
    const checkErrNullQty = ChildData?.some(e => e?.amount === null);
    const hasEmptyChild = dataChoose.some(item => item.child.length === 0);

    if (
      branch == null ||
      warehouse == null ||
      dataChoose.length == 0 ||
      checkErrNullLocate ||
      (dataProductSerial?.is_enable == '1' && checkErrNullSerial) ||
      (isExpiryEnabled && checkErrNullLot) ||
      (isExpiryEnabled && checkErrNullDate) ||
      hasEmptyChild ||
      checkErrNullQty
    ) {
      branch == null && sErrBranch(true);
      warehouse == null && sErrWareHouse(true);
      dataChoose.length == 0 && sErrProduct(true);
      checkErrNullLocate && sErrNullLocate(true);
      checkErrNullLot && sErrNullLot(true);
      checkErrNullDate && sErrNullDate(true);
      checkErrNullSerial && sErrNullSerial(true);
      checkErrNullQty && sErrNullQty(true);
      if (hasEmptyChild) {
        isShow('error', `Thêm thông tin mặt hàng`);
      } else {
        isShow('error', `${dataLang?.required_field_null}`);
      }
    } else {
      sErrBranch(false);
      sErrWareHouse(false);
      sErrProduct(false);
      sErrNullLocate(false);
      sOnSending(true);
    }
  };

  const checkDuplicateSerial = () => {
    if (!isSubmitted) return [];
    const duplicateIds = [];
    if (isSubmitted) {
      dataChoose?.forEach(parentItem => {
        parentItem.child.forEach(childItem => {
          const hasDuplicate = errData?.some(responseItem => {
            return responseItem.serial === childItem.serial && Number(responseItem.id) === childItem.id;
          });

          if (hasDuplicate) {
            duplicateIds.push(childItem.id);
          }
        });
      });
    }

    return duplicateIds;
  };
  // Trong render của component
  const duplicateIds = checkDuplicateSerial();

  const breadcrumbItems = [
    {
      label: `${dataLang?.Warehouse_title || 'Warehouse_title'}`,
    },
    {
      label: `${dataLang?.inventory_title || 'inventory_title'}`,
      href: '/manufacture/inventory',
    },
    {
      label: `Thêm Phiếu Kiểm Kê Kho`,
    },
  ];
  console.log(dataChoose);
  return (
    <LayoutForm
      title='Thêm phiếu kiểm kê kho'
      breadcrumbItems={breadcrumbItems}
      heading='Thêm phiếu kiểm kê kho'
      dataLang={dataLang}
      statusExprired={statusExprired}
      onSave={_HandleSubmit.bind(this)}
      onExit={() => router.push('/manufacture/inventory')}
      buttonAction={
        <PopupImportExcel
          dataLang={props.dataLang}
          sDataErr={sDataErr}
          warehouse={warehouse}
          sErrWareHouse={sErrWareHouse}
          sDataChoose={sDataChoose}
          dataChoose={dataChoose}
          // [Import] [step 3] Đăng ký callback nhận dữ liệu import từ popup
          onImportResult={_HandleImportExcelResult}
        />
      }
      error={
        importErrorBanner?.items?.length > 0 && (
          <div className='py-3 px-4 flex flex-col gap-3 bg-[#FFEEF0] border border-[#991B1B] rounded-lg shadow-sm'>
            <div className='flex items-start justify-between gap-3'>
              <div className='flex items-start gap-2'>
                <WarningIcon className='size-5 text-[#C81E1E]' />
                <div className='flex flex-col gap-1'>
                  <h3 className='text-sm font-semibold text-[#EE1E1E]'>{importErrorBanner?.totalErrors || importErrorBanner?.items?.length} lỗi khi đọc file Excel</h3>
                  {importErrorBanner?.message && <p className='text-xs font-normal text-neutral-07'>{importErrorBanner.message}</p>}
                </div>
              </div>
              <button
                type='button'
                onClick={() => setImportErrorBanner({ message: '', totalErrors: 0, items: [] })}
                className='p-1 rounded-full hover:bg-[#F8D7DA] transition'
                aria-label='Đóng cảnh báo lỗi import'
              >
                <CloseXIcon className='size-4 text-[#991B1B]' />
              </button>
            </div>
            <div className='flex flex-col gap-2 max-h-60 overflow-auto pr-1 scrollbar-thin scrollbar-thumb-[#F4B4B8] scrollbar-track-[#FFE3E6]'>
              {importErrorBanner.items.map((errorItem, index) => (
                <div key={`${errorItem.row || index}-${errorItem.code_items || 'code'}-${index}`} className='px-3 py-2 bg-white rounded-md border border-[#F4B4B8] flex flex-col gap-1'>
                  <p className='text-sm font-medium text-[#991B1B]'>{errorItem.message || 'Dòng dữ liệu không hợp lệ'}</p>
                  <div className='flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-neutral-06'>
                    <span>
                      Mã hàng: <span className='font-semibold text-neutral-07'>{errorItem.code_items || '—'}</span>
                    </span>
                    <span>
                      Tên hàng: <span className='font-semibold text-neutral-07'>{errorItem.name_items || '—'}</span>
                    </span>
                    <span>
                      Vị trí kho: <span className='font-semibold text-neutral-07'>{errorItem.location_code || '—'}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      }
      leftContent={
        <div className='flex flex-col h-full min-h-0'>
          <div className='flex items-center justify-between flex-shrink-0 mb-4'>
            <h2 className='responsive-text-xl font-medium text-brand-color w-full'>Thông tin mặt hàng</h2>
            <SelectSearch
              options={warehouse ? options : []}
              placeholder='Tìm kiếm mặt hàng'
              value={null}
              multiple={false}
              showCheckbox={false}
              showSelectedCount={false}
              setSearch={handleSearchInput}
              keepSearchOnSelect={true}
              noDataMessage={!branch ? <span className='text-new-blue'>Vui lòng chọn chi nhánh</span> : !warehouse ? <span className='text-new-blue'>Vui lòng chọn kho hàng</span> : 'Không có dữ liệu'}
              onChange={_HandleAddParent}
              formatOptionLabel={option => (
                <div className='flex items-start cursor-pointer font-deca'>
                  <div className='flex items-center gap-1 xl:gap-2'>
                    <Image src={option.e?.images ?? '/icon/noimagelogo.png'} alt={option?.e?.name} width={64} height={64} className='size-16 object-cover rounded-md flex-shrink-0' />
                    <div className='flex flex-col gap-1 3xl:text-[10px] text-[9px] font-normal overflow-hidden w-full'>
                      <h3 className='font-semibold responsive-text-sm truncate text-black'>{option.e?.name}</h3>

                      <h5 className='text-blue-fmrp truncate'>
                        {option.e?.code}: {option?.e?.product_variation}
                      </h5>

                      <div className='flex flex-wrap items-center gap-2 text-neutral-03'>
                        ĐVT: {option.e?.unit_name} - {dataLang[option.e?.text_type]} - {dataLang?.purchase_survive || 'purchase_survive'}:{' '}
                        {option.e?.qty_warehouse ? formatNumber(option.e?.qty_warehouse) : '0'}
                      </div>
                      {option.e?.text_type && <TagColorProduct dataLang={dataLang} dataKey={getTypeDataKey(option.e?.text_type)} name={option.e?.text_type} className='!px-1' textSize='text-[11px]' />}
                    </div>
                  </div>
                </div>
              )}
            />
          </div>
          <div className='flex flex-col flex-1 min-h-0 overflow-hidden'>
            <div
              className={`${
                dataProductSerial?.is_enable === '1' ? (isExpiryEnabled ? 'grid-cols-25' : 'grid-cols-19') : isExpiryEnabled ? 'grid-cols-22' : 'grid-cols-16'
              } grid gap-2 items-center responsive-text-base text-neutral-02 font-semibold py-2 z-10 border-b border-b-[#F3F3F4] flex-shrink-0`}
            >
              <h4 className='col-span-4'>{dataLang?.import_from_items || 'import_from_items'}</h4>
              <h4 className='col-span-3 text-center'>Vị trí kho</h4>
              {dataProductSerial?.is_enable === '1' ? <h4 className='col-span-3 text-center'>Serial</h4> : null}
              {isExpiryEnabled ? (
                <>
                  <h4 className='col-span-3 text-center'>Lot</h4>
                  <h4 className='col-span-3 text-center'>Date</h4>
                </>
              ) : null}
              <h4 className='col-span-3 text-center'>Đơn giá</h4>
              <h4 className='col-span-3 text-center'>SL thực</h4>
              <h4 className='col-span-2 text-right whitespace-nowrap'>Thành tiền</h4>
              <h4 className='col-span-1 text-center'></h4>
            </div>
            <Customscrollbar className='flex-1 min-h-0 h-0'>
              {isFetchingItem ? (
                <Loading className='w-full h-10' color='#0f4f9e' />
              ) : dataChoose?.length === 0 ? (
                <NoData type='report' titleText='Chưa có mặt hàng. Bắt đầu thêm mặt hàng tại khung tìm kiếm ngay!' className='min-h-[50vh]' />
              ) : (
                dataChoose?.map(e => (
                  <div
                    key={e?.id?.toString()}
                    className={`${
                      dataProductSerial?.is_enable === '1' ? (isExpiryEnabled ? 'grid-cols-25' : 'grid-cols-19') : isExpiryEnabled ? 'grid-cols-22' : 'grid-cols-16'
                    } grid items-start gap-2 py-2 border-b border-b-[#F3F3F4]`}
                  >
                    <div className='h-full col-span-4'>
                      <div className='flex items-center justify-between gap-1 xl:gap-2'>
                        <div className='flex items-center gap-2'>
                          <div className='size-10 xl:size-12 flex-shrink-0 rounded-md overflow-hidden'>
                            <Image src={e?.img ?? '/icon/noimagelogo.png'} alt='Product Image' className='size-full object-cover' width={64} height={64} />
                          </div>
                          <div className='flex flex-col gap-1'>
                            <h3 className='text-neutral-07 font-medium responsive-text-sm'>{e?.name}</h3>
                            <h5 className='text-neutral-03 font-normal responsive-text-xs'>
                              {e?.code}: {e?.variant}
                            </h5>
                            {e?.type && <TagColorProduct dataLang={dataLang} dataKey={getTypeDataKey(e?.type)} name={e?.type} className='!px-1' textSize='text-[11px]' />}
                          </div>
                        </div>
                        <button
                          onClick={_HandleActionItem.bind(this, e?.id, 'add')}
                          className='p-0.5 xl:p-1 transition ease-in-out rounded bg-primary-05 hover:rotate-45 hover:bg-slate-200 hover:scale-105 hover:text-red-500'
                        >
                          <Add className='size-4' />
                        </button>
                      </div>
                    </div>
                    <div className={`${dataProductSerial?.is_enable === '1' ? (isExpiryEnabled ? 'col-span-21' : 'col-span-15') : isExpiryEnabled ? 'col-span-18' : 'col-span-12'}`}>
                      <div className={`${dataProductSerial?.is_enable === '1' ? (isExpiryEnabled ? 'grid-cols-21' : 'grid-cols-15') : isExpiryEnabled ? 'grid-cols-18' : 'grid-cols-12'} grid gap-2`}>
                        {e?.child?.map((ce, index) => (
                          <div
                            key={ce?.id?.toString()}
                            className={`${
                              dataProductSerial?.is_enable === '1'
                                ? isExpiryEnabled
                                  ? 'col-span-21 grid grid-cols-21'
                                  : 'col-span-15 grid grid-cols-15'
                                : isExpiryEnabled
                                ? 'col-span-18 grid grid-cols-18'
                                : 'col-span-12 grid grid-cols-12'
                            } gap-1`}
                          >
                            <div className='col-span-3 flex flex-col justify-center h-fit'>
                              <SelectComponent
                                options={dataPstWH || []}
                                value={ce?.locate}
                                onChange={value => _HandleChangeChild(e?.id, ce?.id, 'locate', value)}
                                placeholder='Vị trí kho'
                                isClearable={true}
                                className='w-full'
                                classParent={`${errNullLocate && ce.locate == null ? 'border-red-500 border rounded-lg' : ''}`}
                                noOptionsMessage={() => dataLang?.no_data_found || 'no_data_found'}
                                menuPortalTarget={document.body}
                              />
                            </div>
                            {dataProductSerial?.is_enable === '1' ? (
                              <div className='col-span-3 flex flex-col justify-center h-fit'>
                                <input
                                  disabled={e?.checkSerial == '0'}
                                  value={ce?.serial || ''}
                                  onChange={event => _HandleChangeChild(e?.id, ce?.id, 'serial', event)}
                                  className={`${
                                    e?.checkSerial == '0' ? 'bg-gray-100' : errNullSerial && (ce.serial === null || ce.serial === '') ? 'border-red-500' : 'border-gray-200'
                                  } !h-[38px] rounded-lg appearance-none text-center p-2 text-neutral-07 responsive-text-base font-medium placeholder:font-normal w-full focus:outline-none focus:border-brand-color hover:border-brand-color border border-neutral-N400`}
                                  placeholder='Nhập serial'
                                />
                                {isSubmitted && duplicateIds.includes(ce.id) && <span className='text-red-500 text-[10px] mt-1'>Serial đã tồn tại trong phần mềm</span>}
                              </div>
                            ) : null}
                            {isExpiryEnabled ? (
                              <div className='col-span-3 flex flex-col justify-center h-fit'>
                                <CreatableSelectCore
                                  isDisabled={e?.checkExpiry == '0'}
                                  placeholder={'Lot'}
                                  options={e?.dataLot}
                                  value={ce?.lot}
                                  onChange={_HandleChangeChild.bind(this, e?.id, ce?.id, 'lot')}
                                  isClearable={true}
                                  classNamePrefix='Select'
                                  className={`${
                                    e?.checkExpiry == '0' ? 'border-transparent' : errNullLot && ce.lot == null ? 'border-red-500 border' : 'border-transparent'
                                  } Select__custom removeDivide placeholder:text-slate-300 w-full bg-[#ffffff] rounded-lg text-[#52575E] font-normal outline-none border text-[13px]`}
                                  isSearchable={true}
                                  menuPortalTarget={document.body}
                                  onMenuOpen={handleMenuOpen}
                                  noOptionsMessage={() => `Chưa có gợi ý`}
                                  formatCreateLabel={value => `Tạo "${value}"`}
                                  style={{
                                    border: 'none',
                                    boxShadow: 'none',
                                    outline: 'none',
                                    borderRadius: '8px',
                                  }}
                                  theme={theme => ({
                                    ...theme,
                                    colors: {
                                      ...theme.colors,
                                      primary25: '#EBF5FF',
                                      primary50: '#92BFF7',
                                      primary: '#0F4F9E',
                                    },
                                  })}
                                  styles={{
                                    placeholder: base => ({
                                      ...base,
                                      color: '#cbd5e1',
                                      borderRadius: '8px',
                                    }),
                                    menuPortal: base => ({
                                      ...base,
                                      zIndex: 9999,
                                      position: 'absolute',
                                    }),
                                    control: (base, state) => ({
                                      ...base,
                                      boxShadow: 'none',
                                      ...(state.isFocused && {
                                        border: '0 0 0 1px #92BFF7',
                                      }),
                                      borderRadius: '8px',
                                    }),
                                  }}
                                />
                              </div>
                            ) : null}
                            {isExpiryEnabled ? (
                              <div className='col-span-3 flex flex-col justify-center h-fit [&>div]:gap-y-0 [&>div]:w-full [&>div>div:first-child]:hidden'>
                                <DocumentDate
                                  dataLang={dataLang}
                                  value={ce?.date}
                                  onChange={date => _HandleChangeChild(e?.id, ce?.id, 'date', date)}
                                  errDate={errNullDate && ce?.date == null}
                                  isRequired={false}
                                  label=''
                                  showTime={false}
                                  format='DD/MM/YYYY'
                                  disabled={e?.checkExpiry == '0'}
                                  height='h-[38px]'
                                />
                              </div>
                            ) : null}
                            <div className='col-span-3 flex flex-col justify-center h-fit'>
                              <InPutNumericFormat
                                value={ce?.price}
                                onValueChange={value => _HandleChangeChild(e?.id, ce?.id, 'price', value)}
                                className='h-[38px] rounded-lg appearance-none text-center p-2 text-neutral-07 responsive-text-base font-medium placeholder:font-normal w-full focus:outline-none focus:border-brand-color hover:border-brand-color border border-neutral-N400'
                                isAllowed={isAllowedNumber}
                                placeholder='Nhập đơn giá'
                              />
                            </div>
                            <div className='col-span-3 flex flex-col justify-center h-fit'>
                              <InPutNumericFormat
                                value={ce?.amount}
                                placeholder='Nhập số lượng'
                                onValueChange={value => _HandleChangeChild(e?.id, ce?.id, 'amount', value)}
                                className={`${
                                  errNullQty && ce?.amount == null ? 'border-red-500' : 'border-gray-200'
                                } h-[38px] appearance-none text-center p-2 rounded-lg text-neutral-07 responsive-text-base font-medium placeholder:font-normal w-full focus:outline-none focus:border-brand-color hover:border-brand-color border border-neutral-N400`}
                                isAllowed={values => {
                                  const { floatValue, value } = values;
                                  // Nếu xóa hết (giá trị rỗng hoặc null) thì trả về true (hiển thị về 0)
                                  if (value === '' || value === null || typeof value === 'undefined') {
                                    return true;
                                  }
                                  if (e?.checkSerial == '1') {
                                    return floatValue >= 0 && floatValue < 2;
                                  } else {
                                    return floatValue >= 0;
                                  }
                                }}
                              />
                              <h3 className='mt-1 responsive-text-xxs'>SL phần mềm: {formatNumber(ce?.quantity || 0)}</h3>
                              <h3 className='responsive-text-xxs text-blue-fmrp'>Chênh lệch: {(ce?.amount != null && formatNumber(ce?.amount - (ce?.quantity || 0))) || 0}</h3>
                            </div>
                            <div className='col-span-2 text-right pt-2 h-full z-[2]'>{(ce?.amount != null && formatNumber(ce?.amount * (ce?.price || 0))) || 0}</div>
                            <div className='flex pt-2 justify-center h-full'>
                              <ButtonDelete onDelete={_HandleDeleteChild.bind(this, e?.id, ce?.id)} className='h-fit' />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </Customscrollbar>
          </div>
        </div>
      }
      info={
        <OrderFormTabs
          info={
            <div className='flex flex-col gap-3'>
              <DocumentNumber dataLang={dataLang} value={code} onChange={_HandleChangeValue.bind(this, 'code')} />

              <DocumentDate
                dataLang={dataLang}
                value={voucherdate}
                onChange={date => {
                  // Không cho phép thay đổi ngày, luôn giữ ngày hôm nay
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  sVoucherdate(today);
                  isShow('error', 'Ngày kiểm kê được cố định là ngày hôm nay');
                }}
                showTime={false}
                isRequired={true}
              />

              <SelectWithRadio
                isRequired={true}
                label={dataLang?.import_branch || 'import_branch'}
                placeholderText={dataLang?.import_branch || 'import_branch'}
                options={dataBranch}
                value={branch}
                onChange={value => {
                  const newValue = dataBranch.find(item => item.value === value);
                  _HandleChangeValue('branch', newValue);
                }}
                isError={errBranch}
                icon={<PiMapPinLight />}
                errMess={dataLang?.purchase_order_errBranch || 'purchase_order_errBranch'}
              />

              <SelectWithRadio
                isRequired={true}
                label='Kho hàng'
                placeholderText='Chọn kho hàng'
                options={dataWareHouse}
                value={warehouse}
                onChange={value => {
                  const newValue = dataWareHouse.find(item => item.value === value);
                  _HandleChangeValue('warehouse', newValue);
                }}
                isError={errWareHouse}
                icon={<PiMapPinLight />}
                errMess={'Vui lòng chọn kho'}
              />
            </div>
          }
          note={
            <div className='flex flex-col gap-6'>
              <div className='text-typo-gray-4 font-normal responsive-text-base'>{dataLang?.purchase_order_note || 'purchase_order_note'}</div>
              <textarea
                value={note}
                placeholder={dataLang?.purchase_order_note || 'purchase_order_note'}
                onChange={_HandleChangeValue.bind(this, 'note')}
                name='fname'
                type='text'
                className='responsive-text-base placeholder:responsive-text-base focus:border-[#92BFF7] border-[#919EAB3D] placeholder:text-slate-300 w-full min-h-[220px] bg-[#ffffff] rounded-[5.5px] font-normal p-2 border outline-none text-[#919EAB]'
              />
            </div>
          }
        />
      }
      total={
        <div className='flex flex-col gap-3 justify-between text-right '>
          <div className='flex justify-between '>
            <h3 className='text-base'>Tổng số lượng :</h3>
            <h3 className='text-blue-fmrp'>
              {formatNumber(
                dataChoose.reduce((acc, obj) => {
                  return (
                    acc +
                    obj.child?.reduce((acc2, obj2) => {
                      return acc2 + obj2.quantity;
                    }, 0)
                  );
                }, 0)
              )}
            </h3>
          </div>
          <div className='flex justify-between '>
            <h3 className='text-base'>Tổng số lượng thực : </h3>
            <h3 className='text-blue-fmrp'>
              {formatNumber(
                dataChoose.reduce((acc, obj) => {
                  return (
                    acc +
                    obj.child?.reduce((acc2, obj2) => {
                      return acc2 + obj2.amount;
                    }, 0)
                  );
                }, 0)
              )}
            </h3>
          </div>
          <div className='flex gap-2 justify-between '>
            <h3 className='text-base text-left'>Tổng số lượng chênh lệch : </h3>
            <h3 className='text-blue-fmrp'>
              {formatNumber(
                dataChoose.reduce((acc, obj) => {
                  return (
                    acc +
                    obj.child?.reduce((acc2, obj2) => {
                      return acc2 + (obj2.amount - obj2.quantity);
                    }, 0)
                  );
                }, 0)
              )}
            </h3>
          </div>
          <div className='flex justify-between '>
            <h3 className='text-base'>Thành tiền : </h3>
            <h3 className='text-blue-fmrp'>
              {formatMoney(
                dataChoose.reduce((acc, obj) => {
                  return (
                    acc +
                    obj.child?.reduce((acc2, obj2) => {
                      return acc2 + obj2.amount * obj2.price;
                    }, 0)
                  );
                }, 0)
              )}
            </h3>
          </div>
          <PopupStatus
            dataErr={dataErr}
            sDataErr={sDataErr}
            isSubmitted={isSubmitted}
            sIsSubmitted={sIsSubmitted}
            db={sDataChoose}
            dataChoose={dataChoose}
            dataLang={dataLang}
            errData={errData}
            setOpen={true}
          />
        </div>
      }
    />
  );
};

const PopupStatus = props => {
  const dataLang = props?.dataLang;
  const [onFetching, sOnFetching] = useState(false);

  const [open, sOpen] = useState(false);

  const dataSeting = useSetingServer();

  const formatnumber = num => {
    return formatNumberConfig(+num, dataSeting);
  };

  const _HandleClose = () => {
    sOpen(false);
    props.sDataErr(false);
  };
  useEffect(() => {
    if (props.dataErr) {
      sOpen(true);
    } else {
      sOpen(false);
    }
  }, [props]);

  const newDataChoose = props?.errData
    ?.filter(errItem => errItem.status === 2)
    .map(errItem => {
      const matchingChild = props?.dataChoose?.find(dataItem => dataItem.child.some(childItem => childItem.id.toString() === errItem.id));
      return {
        ...errItem,
        name: matchingChild && matchingChild.name,
      };
    });

  const _HandleSave = e => {
    const updatedData = props?.dataChoose.map(parent => {
      const updatedChild = parent.child.map(child => {
        const matchedItem = props?.errData?.find(item => item.id_parent === parent.id && Number(item.id) === child.id);
        if (matchedItem) {
          return {
            ...child,
            quantity: isNaN(Number(matchedItem.check_quantity_stock)) ? 0 : Number(matchedItem.check_quantity_stock),
          };
        } else {
          return child;
        }
      });
      return { ...parent, child: updatedChild };
    });
    props.db(updatedData);
    sOpen(false);
    props.sDataErr(false);
  };

  return (
    <PopupCustom title={'Phiếu kiểm kê bị thay đổi về số lượng thực' + ' ' + `${moment(new Date()).format('DD/MM/YYYY')}`} open={open} onClose={_HandleClose.bind(this)} classNameBtn={props.className}>
      <div className='mt-4 space-x-5 w-[990px] h-auto'>
        <div className='min:h-[200px] h-[82%] max:h-[500px] overflow-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100'>
          <div className='pr-2 w-[100%] lx:w-[120%] '>
            <div className='grid-cols-10 grid sticky top-0 bg-white z-10 border-b border-slate-200'>
              <h4 className='text-[13px] px-2 text-[#667085] uppercase col-span-2 font-[300] text-center'>Tên hàng</h4>
              <h4 className='text-[13px] px-2 text-[#667085] uppercase col-span-2 font-[300] text-center'>Số lượng thay đổi</h4>
              <h4 className='text-[13px] px-2 text-[#667085] uppercase col-span-2 font-[300] text-center'>Số lượng thực</h4>
              <h4 className='text-[13px] px-2 text-[#667085] uppercase col-span-2 font-[300] text-center'>Chênh lệch</h4>
              <h4 className='text-[13px] px-2 text-[#667085] uppercase col-span-2 font-[300] text-center'>Xử lý</h4>
            </div>
            {onFetching ? (
              <Loading className='h-50' color='#0f4f9e' />
            ) : newDataChoose?.length > 0 ? (
              <>
                <div className='divide-y divide-slate-200 min:h-[400px] h-[100%] max:h-[800px] mt-2 '>
                  {newDataChoose?.map(e => (
                    <div className='grid-cols-10 grid hover:bg-slate-50 items-center'>
                      <h6 className='text-[13px] px-2 col-span-2 text-center capitalize'>{e?.name}</h6>
                      <h6 className='text-[13px] px-2 col-span-2 text-center capitalize'>{formatnumber(e?.check_quantity_stock)}</h6>
                      <h6 className='text-[13px] px-2 col-span-2 text-center capitalize'>{formatnumber(e?.quantity_net)}</h6>
                      <h6 className='text-[13px] px-2 col-span-2 text-center capitalize'>{formatnumber(e?.quantity_net - e?.check_quantity_stock)}</h6>
                      <h6 className='text-[13px] px-2 col-span-2 text-center capitalize'>
                        {e?.quantity_net - e?.check_quantity_stock > 0
                          ? `Mặt hàng cần điều chỉnh tăng ${formatnumber(e?.quantity_net) - formatnumber(e?.check_quantity_stock)}`
                          : `Mặt hàng cần điều chỉnh giảm ${Math.abs(formatnumber(e?.quantity_net) - formatnumber(e?.check_quantity_stock))}`}
                      </h6>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <NoData />
            )}
          </div>
          <div className='mt-4 space-x-2 text-right'>
            <button onClick={_HandleClose.bind(this)} className='button text-[#344054] font-normal text-base py-2 px-4 rounded-lg border border-solid border-[#D0D5DD]'>
              {dataLang?.purchase_order_purchase_back || 'purchase_order_purchase_back'}
            </button>
            <button onClick={_HandleSave.bind(this)} type='submit' className='button text-[#FFFFFF]  font-normal text-base py-2 px-4 rounded-lg bg-blue-fmrp'>
              {'Cập nhật'}
            </button>
          </div>
        </div>
      </div>
    </PopupCustom>
  );
};

export default InventoryForm;
