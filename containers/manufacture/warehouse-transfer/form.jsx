import apiWarehouseTransfer from '@/Api/apiManufacture/warehouse/warehouseTransfer/apiWarehouseTransfer';
import InputCustom from '@/components/common/input/InputCustom';
import ButtonDelete from '@/components/common/orderManagement/ButtonDelete';
import { DocumentDate, DocumentNumber } from '@/components/common/orderManagement/GeneralInfo';
import OrderFormTabs from '@/components/common/orderManagement/OrderFormTabs';
import SelectSearch from '@/components/common/orderManagement/SelectSearch';
import SelectWithRadio from '@/components/common/orderManagement/SelectWithRadio';
import { EditIcon } from '@/components/icons';
import LayoutForm from '@/components/layout/LayoutForm';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { TagColorProduct } from '@/components/UI/common/Tag/TagStatus';
import SelectComponent from '@/components/UI/filterComponents/selectComponent';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import PopupConfim from '@/components/UI/popupConfim/popupConfim';
import { optionsQuery } from '@/configs/optionsQuery';
import { CONFIRMATION_OF_CHANGES, TITLE_DELETE_ITEMS } from '@/constants/delete/deleteItems';
import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate';
import { useBranchList } from '@/hooks/common/useBranch';
import { useLocationByWarehouseTo } from '@/hooks/common/useWarehouses';
import useFeature from '@/hooks/useConfigFeature';
import useSetingServer from '@/hooks/useConfigNumber';
import useStatusExprired from '@/hooks/useStatusExprired';
import useToast from '@/hooks/useToast';
import { useToggle } from '@/hooks/useToggle';
import { routerWarehouseTransfer } from '@/routers/manufacture';
import { formatMoment } from '@/utils/helpers/formatMoment';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Add } from 'iconsax-react';
import moment from 'moment/moment';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useState, useRef } from 'react';
import { PiMapPinLight } from 'react-icons/pi';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { useWarehouseTransferExport } from './hooks/useWarehouseTransferExport';
import { useWarehouseTransferItems } from './hooks/useWarehouseTransferItems';
import { useWarehouseTransferTo } from './hooks/useWarehouseTransferTo';
import { useWarehouseProperties } from './hooks/useWarehouseProperties';

/// Hậu viết API
const WarehouseTransferForm = props => {
  const router = useRouter();

  const id = router.query?.id;
  const dataLang = props?.dataLang;

  const isShow = useToast();

  const authState = useSelector(state => state.auth);
  const dataSeting = useSetingServer();
  const statusExprired = useStatusExprired();
  const { isOpen, isKeyState, handleQueryId } = useToggle();
  const { dataMaterialExpiry, dataProductExpiry, dataProductSerial } = useFeature();

  // Thuộc tính kho
  const { isWarehousePropertiesEnabled, warehousePropertyLabels } = useWarehouseProperties(dataSeting);

  const [onSending, sOnSending] = useState(false);
  const [onLoadingChild, sOnLoadingChild] = useState(false);
  const [code, sCode] = useState('');
  const [startDate, sStartDate] = useState(new Date());
  const [note, sNote] = useState('');
  const [listData, sListData] = useState([]);
  const [idBranch, sIdBranch] = useState(null);
  const [idExportWarehouse, sIdExportWarehouse] = useState(null);
  const [idReceiveWarehouse, sIdReceiveWarehouse] = useState(null);
  const [load, sLoad] = useState(false);
  const [errQty, sErrQty] = useState(false);
  const [errDate, sErrDate] = useState(false);
  const [errBranch, sErrBranch] = useState(false);
  const [errExportWarehouse, sErrExportWarehouse] = useState(false);
  const [errReceiveWarehouse, sErrReceiveWarehouse] = useState(false);
  const [errWarehouse, sErrWarehouse] = useState(false);
  const [errReceivingLocation, sErrReceivingLocation] = useState(false);
  const [isOpenReceivingLocationWarning, sIsOpenReceivingLocationWarning] = useState(false);
  const prevReceiveWarehouseRef = useRef(null);

  // danh sách chi nhánh
  const { data: dataBranch = [] } = useBranchList();
  // danh sách kho nhận
  const { data: dataReceiveWarehouse = [] } = useWarehouseTransferTo();
  // danh sách mặt hàng: chỉ lấy những mặt hàng có tồn kho (warehouse_stock_only = 1)
  const { data: dataItemsRaw } = useWarehouseTransferItems(idBranch, idExportWarehouse, 1);
  // Chỉ lấy những mặt hàng có dữ liệu kho (e.warehouse length > 0) phòng trường hợp API vẫn trả về rỗng
  const dataItems = Array.isArray(dataItemsRaw) ? dataItemsRaw.filter(item => Array.isArray(item?.e?.warehouse) && item.e.warehouse.length > 0) : [];

  // danh sách vị trí nhận
  const { data: dataReceivingLocation = [] } = useLocationByWarehouseTo(idReceiveWarehouse);
  // danh sách kho
  const { data: dataWarehouse = [] } = useWarehouseTransferExport(idBranch, idExportWarehouse);

  const getTypeDataKey = textType => {
    const typeMap = {
      products: 0,
      material: 1,
      semi_products: 2,
    };
    return typeMap[textType] ?? 0;
  };

  // set state lại initital khi render
  useEffect(() => {
    router.query && sErrDate(false);
    router.query && sErrBranch(false);
    router.query && sStartDate(new Date());
    router.query && sIdExportWarehouse(false);
    router.query && sErrReceiveWarehouse(false);
    router.query && sErrReceivingLocation(false);
    router.query && sNote('');
  }, [router.query]);

  // Tự động chọn chi nhánh đầu tiên giống
  useEffect(() => {
    if (authState?.branch?.length > 0 && !idBranch) {
      const firstBranch = {
        value: authState.branch[0].id,
        label: authState.branch[0].name,
      };
      sIdBranch(firstBranch);
    }
  }, [authState?.branch, idBranch]);

  // lấy dữ liệu khi sửa
  const { isFetching } = useQuery({
    queryKey: ['api_detail_page_warehouse_transfer', id],
    queryFn: async () => {
      const rResult = await apiWarehouseTransfer.apiGetTransferDetail(id);
      sIdBranch({
        label: rResult?.branch_name_id,
        value: rResult?.branch_id,
      });
      sIdExportWarehouse({
        label: rResult?.warehouses_id_name,
        value: rResult?.warehouses_id,
      });
      sIdReceiveWarehouse({
        label: rResult?.warehouses_to_name,
        value: rResult?.warehouses_to,
      });
      sCode(rResult?.code);
      sStartDate(moment(rResult?.date).toDate());
      sNote(rResult?.note);
      sListData(
        rResult?.items.map(e => ({
          id: e?.item?.id,
          idParenBackend: e?.item?.id,
          item: {
            e: e?.item,
            label: `${e.item?.name} <span style={{display: none}}>${e.item?.code + e.item?.product_variation + e.item?.text_type + e.item?.unit_name}</span>`,
            value: e.item?.id,
          },
          child: e?.child.map(ce => ({
            idChildBackEnd: Number(ce?.id),
            id: Number(ce?.id),
            disabledDate:
              (ce?.text_type == 'material' && dataMaterialExpiry?.is_enable == '1' && false) ||
              (ce?.text_type == 'material' && dataMaterialExpiry?.is_enable == '0' && true) ||
              (ce?.text_type == 'products' && dataProductExpiry?.is_enable == '1' && false) ||
              (ce?.text_type == 'products' && dataProductExpiry?.is_enable == '0' && true),
            location:
              ce?.warehouse_location?.location_name || ce?.warehouse_location?.id || ce?.warehouse_location?.warehouse_name || ce?.warehouse_location?.quantity
                ? {
                    label: ce?.warehouse_location?.location_name,
                    value: ce?.warehouse_location?.id,
                    warehouse_name: ce?.warehouse_location?.warehouse_name,
                    qty: +ce?.warehouse_location?.quantity,
                  }
                : null,
            receivingLocation:
              ce?.warehouse_location_to?.location_name || ce?.warehouse_location_to?.location_id
                ? {
                    label: ce?.warehouse_location_to?.location_name,
                    value: ce?.warehouse_location_to?.id,
                  }
                : null,
            serial: ce?.serial == null ? '' : ce?.serial,
            lot: ce?.lot == null ? '' : ce?.lot,
            date: ce?.expiration_date != null ? moment(ce?.expiration_date).toDate() : null,
            unit: e?.item?.unit_name,
            dataWarehouse: e?.item?.warehouse.map(ye => ({
              label: ye?.location_name,
              value: ye?.id,
              warehouse_name: ye?.warehouse_name,
              qty: +ye?.quantity,
            })),
            exportQuantity: +ce?.quantity,
            note: ce?.note,
          })),
        }))
      );
      return rResult;
    },
    enabled: !!id,
    ...optionsQuery,
  });

  // reset lại value khi có mặt hàng
  const resetValue = () => {
    if (isKeyState?.type === 'branch') {
      sListData([]);
      sIdBranch(isKeyState?.value);
      sIdExportWarehouse(null);
    }
    if (isKeyState?.type === 'idExportWarehouse') {
      sListData([]);
      sIdExportWarehouse(isKeyState?.value);
    }
    if (isKeyState?.type == 'idReceiveWarehouse') {
      sIdReceiveWarehouse(isKeyState?.value);
      sListData(prevOption => {
        const newOption = prevOption.map(item => {
          const newChild = item.child?.map(e => {
            return { ...e, receivingLocation: null };
          });
          return { ...item, child: newChild };
        });
        return newOption;
      });
    }
    handleQueryId({ status: false });
  };

  // change các trường input trong giao diện
  const _HandleChangeInput = (type, value) => {
    if (type == 'code') {
      sCode(value.target.value);
    } else if (type === 'note') {
      sNote(value.target.value);
    } else if (type == 'branch' && idBranch != value) {
      if (listData?.length > 0) {
        if (type === 'branch' && idBranch != value) {
          handleQueryId({ status: true, initialKey: { type, value } });
        }
      } else {
        sIdExportWarehouse(idBranch != value && null);
        sIdBranch(value);
      }
    } else if (type == 'idExportWarehouse' && idExportWarehouse != value) {
      if (listData?.length > 0) {
        if (type === 'idExportWarehouse' && idBranch != value) {
          handleQueryId({ status: true, initialKey: { type, value } });
        }
      } else {
        sIdExportWarehouse(value);
      }
    } else if (type == 'idReceiveWarehouse' && idReceiveWarehouse != value) {
      // Lưu lại kho nhận hiện tại để có thể quay lại nếu kho mới không có vị trí
      prevReceiveWarehouseRef.current = idReceiveWarehouse || null;
      if (listData?.length > 0) {
        if (type === 'idReceiveWarehouse' && idBranch != value) {
          handleQueryId({ status: true, initialKey: { type, value } });
        }
      } else {
        sIdReceiveWarehouse(value);
      }
    }
  };

  const handleTimeChange = date => sStartDate(date);

  // lưu chuyển kho
  const _HandleSubmit = e => {
    e.preventDefault();

    const hasNullValue = (listData, conditionFn) => {
      return listData.some(item => item.child?.some(childItem => conditionFn(childItem)));
    };

    const hasNullKho = hasNullValue(listData, childItem => childItem.location === null);

    const hasNullLocation = hasNullValue(listData, childItem => childItem.receivingLocation === null);

    const hasNullQty = hasNullValue(listData, childItem => childItem.exportQuantity === null || childItem.exportQuantity === '' || childItem.exportQuantity == 0);

    const isEmpty = listData?.length == 0 ? true : false;

    if (idBranch == null || idExportWarehouse == null || idReceiveWarehouse == null || isEmpty || hasNullKho || hasNullLocation || hasNullQty) {
      idBranch == null && sErrBranch(true);
      idExportWarehouse == null && sErrExportWarehouse(true);
      idReceiveWarehouse == null && sErrReceiveWarehouse(true);
      isEmpty && isShow('error', 'Chưa nhập thông tin mặt hàng');
      hasNullKho && sErrWarehouse(true);
      hasNullLocation && sErrReceivingLocation(true);
      hasNullQty && sErrQty(true);
      isShow('error', idBranch != null && idExportWarehouse != null && idReceiveWarehouse != null && isEmpty ? 'Chưa nhập thông tin mặt hàng' : dataLang?.required_field_null);
    } else {
      sErrWarehouse(false);
      sErrQty(false);
      sOnSending(true);
    }
  };

  //Hàm set xóa lỗi
  const useClearErrorEffect = (sError, condition) => {
    useEffect(() => {
      sError(false);
    }, [condition]);
  };

  //Tham chiếu đến hàm rồi xử lý validate
  useClearErrorEffect(sErrBranch, idBranch != null);
  useClearErrorEffect(sErrExportWarehouse, idExportWarehouse != null);
  useClearErrorEffect(sErrReceiveWarehouse, idReceiveWarehouse != null);

  useEffect(() => {
    idBranch == null && sIdExportWarehouse(null);
  }, [idBranch]);

  // Cảnh báo khi kho nhận không có vị trí nhận
  useEffect(() => {
    if (idReceiveWarehouse && Array.isArray(dataReceivingLocation) && dataReceivingLocation.length === 0) {
      sIsOpenReceivingLocationWarning(true);
    }
  }, [idReceiveWarehouse, dataReceivingLocation]);

  const formatNumber = number => {
    return formatNumberConfig(+number, dataSeting);
  };

  const handingWarehouseTransfer = useMutation({
    mutationFn: ({ url, data }) => {
      return apiWarehouseTransfer.apiHandingTransfer(url, data);
    },
  });

  const _ServerSending = async () => {
    let formData = new FormData();
    formData.append('code', code);
    formData.append('date', formatMoment(startDate, FORMAT_MOMENT.DATE_LONG));
    formData.append('branch_id', idBranch?.value);
    formData.append('warehouses_id', idExportWarehouse?.value);
    formData.append('warehouses_to', idReceiveWarehouse?.value);
    formData.append('note', note);
    listData.forEach((item, index) => {
      formData.append(`items[${index}][id]`, id ? item?.idParenBackend : '');
      formData.append(`items[${index}][item]`, item?.item?.value);
      item?.child?.forEach((childItem, childIndex) => {
        formData.append(`items[${index}][child][${childIndex}][row_id]`, id ? childItem?.idChildBackEnd : '');
        formData.append(`items[${index}][child][${childIndex}][note]`, childItem?.note ? childItem?.note : '');
        formData.append(`items[${index}][child][${childIndex}][location_warehouses_id]`, childItem?.location?.value || 0);
        formData.append(`items[${index}][child][${childIndex}][location_warehouses_to]`, childItem?.receivingLocation?.value || 0);
        formData.append(`items[${index}][child][${childIndex}][quantity]`, childItem?.exportQuantity);
      });
    });

    const url = id ? `/api_web/Api_transfer/transfer/${id}?csrf_protection=true` : `/api_web/Api_transfer/transfer/?csrf_protection=true`;
    handingWarehouseTransfer.mutate(
      { url, data: formData },
      {
        onSuccess: ({ isSuccess, message, item }) => {
          if (isSuccess) {
            isShow('success', dataLang[message]);
            sCode('');
            sStartDate(new Date());
            sIdBranch(null);
            sIdExportWarehouse(null);
            sIdReceiveWarehouse(null);
            sNote('');
            sErrBranch(false);
            sErrExportWarehouse(false);
            sErrReceiveWarehouse(false);
            sErrDate(false);
            sListData([]);
            router.push(routerWarehouseTransfer.home);
            sOnSending(false);
          } else {
            isShow('error', `${dataLang[message]} ${item !== undefined && item !== null && item !== '' ? item : ''}`);
          }
        },
      }
    );
  };

  useEffect(() => {
    onSending && _ServerSending();
  }, [onSending]);

  //add thêm dòng mặt hàng con trong cha mới
  const _HandleAddChild = (parentId, value) => {
    sOnLoadingChild(true);

    const newData = listData?.map(e => {
      if (e?.id === parentId) {
        const newChild = {
          id: uuidv4(),
          disabledDate:
            (value?.e?.text_type === 'material' && dataMaterialExpiry?.is_enable === '1' && false) ||
            (value?.e?.text_type === 'material' && dataMaterialExpiry?.is_enable === '0' && true) ||
            (value?.e?.text_type === 'products' && dataProductExpiry?.is_enable === '1' && false) ||
            (value?.e?.text_type === 'products' && dataProductExpiry?.is_enable === '0' && true),
          location: null,
          receivingLocation: null,
          unit: value?.e?.unit_name,
          dataWarehouse: value?.e?.warehouse.map(e => ({
            label: e?.location_name,
            value: e?.id,
            warehouse_name: e?.warehouse_name,
            qty: e?.quantity,
          })),
          exportQuantity: null,
          note: '',
          idChildBackEnd: null,
        };
        return { ...e, child: [...e.child, newChild] };
      } else {
        return e;
      }
    });

    setTimeout(() => {
      sOnLoadingChild(false);
    }, 500);
    sListData(newData);
  };

  // add thêm cha mới
  const _HandleAddParent = value => {
    sOnLoadingChild(true);

    const checkData = listData?.some(e => e?.item?.value === value?.value);

    if (!checkData) {
      const newData = {
        id: Date.now(),
        idParenBackend: null,
        item: value,
        child: [
          {
            idChildBackEnd: null,
            id: uuidv4(),
            disabledDate:
              (value?.e?.text_type === 'material' && dataMaterialExpiry?.is_enable === '1' && false) ||
              (value?.e?.text_type === 'material' && dataMaterialExpiry?.is_enable === '0' && true) ||
              (value?.e?.text_type === 'products' && dataProductExpiry?.is_enable === '1' && false) ||
              (value?.e?.text_type === 'products' && dataProductExpiry?.is_enable === '0' && true),
            location: null,
            receivingLocation: null,
            dataWarehouse: value?.e?.warehouse.map(e => ({
              label: e?.location_name,
              value: e?.id,
              warehouse_name: e?.warehouse_name,
              qty: e?.quantity,
            })),
            unit: value?.e?.unit_name,
            exportQuantity: null,
            note: '',
          },
        ],
      };
      setTimeout(() => {
        sOnLoadingChild(false);
      }, 500);
      sListData([newData, ...listData]);
    } else {
      isShow('error', dataLang?.returns_err_ItemSelect || 'returns_err_ItemSelect');
    }
  };

  // xóa dòng con
  const _HandleDeleteChild = (parentId, childId) => {
    const newData = listData
      .map(e => {
        if (e.id === parentId) {
          const newChild = e.child?.filter(ce => ce?.id !== childId);
          return { ...e, child: newChild };
        }
        return e;
      })
      .filter(e => e.child?.length > 0);
    sListData([...newData]);
  };

  // change dòng con
  const _HandleChangeChild = (parentId, childId, type, value) => {
    // Tạo một bản sao của listData để thay đổi
    const newData = [...listData];
    // Tìm vị trí của phần tử cần cập nhật trong mảng newData
    const parentIndex = newData.findIndex(e => e.id === parentId);
    if (parentIndex !== -1) {
      const childIndex = newData[parentIndex].child.findIndex(ce => ce.id === childId);
      if (childIndex !== -1) {
        // Thực hiện cập nhật dữ liệu tại vị trí tìm thấy
        const updatedChild = {
          ...newData[parentIndex].child[childIndex],
        };
        if (type === 'exportQuantity') {
          const newTypeValue = typeof value === 'number' ? value : Number(value?.value);
          setTimeout(() => {
            const totalExportQuantity = newData[parentIndex].child.reduce((childTotal, childItem) => childTotal + childItem.exportQuantity, 0);
            if (totalExportQuantity > +updatedChild.location?.qty) {
              handleQuantityError(+updatedChild.location?.qty);
              timeOut();
              updatedChild.exportQuantity = null;
            }
          }, 100);
          updatedChild.exportQuantity = newTypeValue;
        } else if (type === 'location') {
          updatedChild.location = value;
        } else if (type === 'increase') {
          setTimeout(() => {
            const totalExportQuantity = newData[parentIndex].child.reduce((childTotal, childItem) => childTotal + childItem.exportQuantity, 0);
            if (totalExportQuantity > +updatedChild.location?.qty) {
              timeOut();
              handleQuantityError(+updatedChild.location?.qty);
              updatedChild.exportQuantity = null;
            }
          }, 100);
          if (updatedChild.location == null) {
            isShow('error', 'Vui lòng chọn vị trí trước');
          } else if (updatedChild.exportQuantity == updatedChild.location?.qty || (id && updatedChild.exportQuantity >= updatedChild.location?.qty)) {
            handleQuantityError(updatedChild?.location?.qty);
          } else {
            updatedChild.exportQuantity = Number(updatedChild.exportQuantity) + 1;
          }
        } else if (type === 'decrease') {
          if (updatedChild.location == null) {
            isShow('error', 'Vui lòng chọn vị trí trước');
          } else if (updatedChild.exportQuantity >= 2) {
            updatedChild.exportQuantity = Number(updatedChild.exportQuantity) - 1;
          } else {
            updatedChild.exportQuantity = 0;
          }
        } else if (type === 'note') {
          updatedChild.note = value?.target.value;
        } else if (type == 'receivingLocation') {
          updatedChild.receivingLocation = value;
        }
        newData[parentIndex].child[childIndex] = updatedChild;
      }
    }
    sListData(newData);
  };

  const handleQuantityError = e => {
    isShow('error', `Số lượng chỉ được bé hơn hoặc bằng ${formatNumber(e)} số lượng tồn`, 3000);
  };
  const timeOut = () => {
    setTimeout(() => {
      sLoad(true);
    }, 500);
    setTimeout(() => {
      sLoad(false);
    }, 1000);
  };

  const breadcrumbItems = [
    { label: `${dataLang?.Warehouse_title || 'Warehouse_title'}` },
    {
      label: `${dataLang?.warehouseTransfer_list || 'warehouseTransfer_list'}`,
      href: '/manufacture/warehouse-transfer',
    },
    {
      label: id ? dataLang?.warehouseTransfer_titleEdit || 'warehouseTransfer_titleEdit' : dataLang?.warehouseTransfer_titleAadd || 'warehouseTransfer_titleAadd',
    },
  ];

  return (
    <React.Fragment>
      <LayoutForm
        title={id ? dataLang?.warehouseTransfer_titleEdit || 'warehouseTransfer_titleEdit' : dataLang?.warehouseTransfer_titleAadd || 'warehouseTransfer_titleAadd'}
        breadcrumbItems={breadcrumbItems}
        heading={id ? dataLang?.warehouseTransfer_titleEdit || 'warehouseTransfer_titleEdit' : dataLang?.warehouseTransfer_titleAadd || 'warehouseTransfer_titleAadd'}
        dataLang={dataLang}
        statusExprired={statusExprired}
        onSave={_HandleSubmit.bind(this)}
        onExit={() => router.push(routerWarehouseTransfer.home)}
        leftContent={
          <div className='flex flex-col h-full min-h-0'>
            <div className='flex items-center justify-between flex-shrink-0 mb-4'>
              <h2 className='responsive-text-xl font-medium text-brand-color w-full'>Thông tin mặt hàng</h2>
              <SelectSearch
                options={dataItems}
                placeholder='Tìm kiếm mặt hàng'
                value={null}
                multiple={false}
                showCheckbox={false}
                showSelectedCount={false}
                noDataMessage={!idBranch || !idExportWarehouse || !idReceiveWarehouse ? <span className='text-new-blue'>Vui lòng chọn kho chuyển và kho nhận</span> : 'Không có dữ liệu'}
                onChange={_HandleAddParent.bind(this)}
                formatOptionLabel={option => (
                  <div className='flex items-start p-1 cursor-pointer font-deca'>
                    <div className='flex items-center gap-2'>
                      <img src={option.e?.images ?? '/icon/noimagelogo.png'} alt={option?.e?.name} className='size-16 object-cover rounded-md' />
                      <div className='flex flex-col gap-1 3xl:text-[10px] text-[9px] font-normal overflow-hidden w-full'>
                        <h3 className='font-semibold responsive-text-sm truncate text-black'>{option.e?.name}</h3>

                        <h5 className='text-blue-fmrp truncate'>
                          {option.e?.code}: {option?.e?.product_variation}
                        </h5>

                        <div className='flex flex-wrap items-center gap-2 text-neutral-03'>
                          ĐVT: {option.e?.unit_name} - {dataLang[option.e?.text_type]} - {dataLang?.purchase_survive || 'purchase_survive'}:{' '}
                          {option.e?.qty_warehouse ? formatNumber(option.e?.qty_warehouse) : '0'}
                        </div>
                        {option.e?.text_type && (
                          <TagColorProduct dataLang={dataLang} dataKey={getTypeDataKey(option.e?.text_type)} name={option.e?.text_type} className='!px-1' textSize='text-[11px]' />
                        )}
                        {/* Lot / Date */}
                        {dataMaterialExpiry.is_enable === '1' || dataProductExpiry.is_enable === '1' ? (
                          <div className='flex flex-wrap items-center gap-2 text-neutral-03'>
                            <span className=''>Lot: {option.e?.lot ? option.e?.lot : '-'}</span>
                            <span className=''>Date: {option.e?.expiration_date ? formatMoment(option.e?.expiration_date, FORMAT_MOMENT.DATE_SLASH_LONG) : '-'}</span>
                          </div>
                        ) : null}
                        {/* Thuộc tính kho - chỉ hiển thị cho nguyên vật liệu */}
                        {isWarehousePropertiesEnabled && option.e?.text_type === 'material' && (
                          <div className='flex gap-3 text-neutral-03'>
                            {warehousePropertyLabels.map(({ key, label }) => {
                              const value = option.e?.[key];
                              return (
                                <div key={key} className='flex items-start gap-1'>
                                  <span className=' '>{label}</span>
                                  <span>:</span>
                                  <span className='truncate'>{value ?? '-'}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              />
            </div>
            <div className='flex flex-col flex-1 min-h-0 overflow-hidden'>
              <div className='grid grid-cols-20 gap-2 items-center responsive-text-base text-neutral-02 font-semibold py-2 z-10 border-b border-b-[#F3F3F4] flex-shrink-0'>
                <h4 className='col-span-5'>{dataLang?.import_from_items || 'import_from_items'}</h4>
                <h4 className='col-span-3 text-center'>{dataLang?.warehouseTransfer_rransferPosition || 'warehouseTransfer_rransferPosition'}</h4>
                <h4 className='col-span-3 text-center'>{dataLang?.warehouseTransfer_receivingLocation || 'warehouseTransfer_receivingLocation'}</h4>
                <h4 className='col-span-2 text-center'>{'ĐVT'}</h4>
                <h4 className='col-span-3 text-center'>{dataLang?.recall_revenueQty || 'recall_revenueQty'}</h4>
                <h4 className='col-span-3 text-center'>{dataLang?.production_warehouse_note || 'production_warehouse_note'}</h4>
                <h4 className='col-span-1 text-center'></h4>
              </div>
              <Customscrollbar className='flex-1 min-h-0 h-0'>
                {isFetching ? (
                  <Loading className='w-full h-10' color='#0f4f9e' />
                ) : listData?.length === 0 ? (
                  <NoData type='report' titleText='Chưa có mặt hàng. Bắt đầu thêm mặt hàng tại khung tìm kiếm ngay!' className='h-[50vh]' />
                ) : (
                  listData?.map(e => (
                    <div key={e?.id?.toString()} className='grid items-start grid-cols-20 gap-2 py-2 border-b border-b-[#F3F3F4]'>
                      <div className='h-full col-span-5'>
                        <div className='flex items-center justify-between gap-2'>
                          <div className='flex items-center gap-2'>
                            <div className='size-16 flex-shrink-0 rounded-md overflow-hidden'>
                              {e?.item?.e?.images != null ? (
                                <Image src={e?.item?.e?.images} alt='Product Image' className='size-full object-cover' width={64} height={64} />
                              ) : (
                                <Image src='/icon/noimagelogo.png' alt='Product Image' className='size-full object-cover' width={64} height={64} />
                              )}
                            </div>
                            <div className='flex flex-col gap-1'>
                              <h3 className='text-neutral-07 font-medium responsive-text-sm'>{e?.item?.e?.name}</h3>
                              <h5 className='text-neutral-03 font-normal responsive-text-xs'>
                                {e?.item?.e?.code}: {e?.item?.e?.product_variation}
                              </h5>
                              {e?.item?.e?.text_type && (
                                <TagColorProduct dataLang={dataLang} dataKey={getTypeDataKey(e?.item?.e?.text_type)} name={e?.item?.e?.text_type} className='!px-1' textSize='text-[11px]' />
                              )}
                              <div className='flex flex-col italic'>
                                {dataProductSerial.is_enable === '1' && <div className='responsive-text-xs text-[#667085] font-[500]'>Serial: {e?.item?.e?.serial ? e?.item?.e?.serial : '-'}</div>}
                                {dataMaterialExpiry.is_enable === '1' || dataProductExpiry.is_enable === '1' ? (
                                  <>
                                    <div className='responsive-text-xs text-[#667085] font-[500]'>Lot: {e?.item?.e?.lot ? e?.item?.e?.lot : '-'}</div>
                                    <div className='responsive-text-xs text-[#667085] font-[500]'>
                                      Date: {e?.item?.e?.expiration_date ? formatMoment(e?.item?.e?.expiration_date, FORMAT_MOMENT.DATE_SLASH_LONG) : '-'}
                                    </div>
                                  </>
                                ) : (
                                  ''
                                )}
                                {/* Thuộc tính kho - chỉ hiển thị cho nguyên vật liệu */}
                                {isWarehousePropertiesEnabled && e?.item?.e?.text_type === 'material' && (
                                  <div className='flex flex-col text-neutral-03 responsive-text-xs'>
                                    {warehousePropertyLabels.map(({ key, label }) => {
                                      const value = e?.item?.e?.[key];
                                      return (
                                        <div key={key} className='flex items-start gap-1'>
                                          <span className='font-semibold'>{label}</span>
                                          <span>:</span>
                                          <span className='truncate'>{value ?? '-'}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={_HandleAddChild.bind(this, e?.id, e?.item)}
                            className='p-1 transition ease-in-out rounded bg-primary-05 hover:rotate-45 hover:bg-slate-200 hover:scale-105 hover:text-red-500'
                          >
                            <Add className='size-4' />
                          </button>
                        </div>
                      </div>
                      <div className='col-span-15 h-full flex flex-col justify-center'>
                        <div className='grid grid-cols-15 gap-2 items-center'>
                          {load ? (
                            <Loading className='h-full col-span-15' color='#0f4f9e' />
                          ) : (
                            e?.child?.map((ce, index) => (
                              <div key={ce?.id?.toString()} className='col-span-15 grid grid-cols-15 gap-2 '>
                                <div className='col-span-3 flex flex-col justify-center h-fit'>
                                  <SelectComponent
                                    options={ce?.dataWarehouse}
                                    value={ce?.location}
                                    onChange={value => _HandleChangeChild(e?.id, ce?.id, 'location', value)}
                                    placeholder={onLoadingChild ? '' : dataLang?.warehouseTransfer_rransferPosition || 'warehouseTransfer_rransferPosition'}
                                    isClearable={true}
                                    className='w-full'
                                    classParent={`${errWarehouse && ce?.location == null ? 'border-red-500 border' : ''}`}
                                    noOptionsMessage={() => dataLang?.returns_nodata || 'returns_nodata'}
                                    menuPortalTarget={document.body}
                                    formatOptionLabel={option => (
                                      <div className=''>
                                        <div className='flex gap-1'>
                                          <h2 className='3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] font-semibold'>{option?.label}</h2>
                                        </div>
                                        <div className='flex gap-1'>
                                          {option?.qty && <h2 className='3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] font-medium'>{dataLang?.returns_survive || 'returns_survive'}:</h2>}
                                          <h2 className='3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] uppercase font-semibold'>{option?.qty && formatNumber(option?.qty)}</h2>
                                        </div>
                                      </div>
                                    )}
                                  />
                                </div>
                                <div className='col-span-3 flex flex-col justify-center h-fit'>
                                  <SelectComponent
                                    options={dataReceivingLocation}
                                    value={ce?.receivingLocation}
                                    onChange={value => _HandleChangeChild(e?.id, ce?.id, 'receivingLocation', value)}
                                    placeholder={onLoadingChild ? '' : dataLang?.warehouseTransfer_receivingLocation || 'warehouseTransfer_receivingLocation'}
                                    className='w-full'
                                    classParent={`${errReceivingLocation && ce?.receivingLocation == null ? 'border-red-500 border' : ''}`}
                                    noOptionsMessage={() => dataLang?.returns_nodata || 'returns_nodata'}
                                    menuPortalTarget={document.body}
                                    formatOptionLabel={option => (
                                      <div className=''>
                                        <div className='flex gap-1'></div>
                                        <div className='flex gap-1'>
                                          <h2 className='3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] font-semibold'>{option?.label}</h2>
                                        </div>
                                      </div>
                                    )}
                                  />
                                </div>
                                <div className='col-span-2 flex items-center justify-center h-full'>{ce?.unit}</div>
                                <div
                                  className='col-span-3 flex items-center justify-center h-full gap-1'
                                  onClick={() => {
                                    if (!ce?.location || !ce?.unit) {
                                      isShow('error', 'Vui lòng chọn vị trí trước');
                                    }
                                  }}
                                >
                                  <InputCustom
                                    state={ce?.exportQuantity || 0}
                                    setState={val => _HandleChangeChild(e?.id, ce?.id, 'exportQuantity', val)}
                                    min={0}
                                    step={1}
                                    allowDecimal={false}
                                    disabled={false}
                                    className='p-1 w-full'
                                    classNameInput={`w-full text-center ${errQty && (!ce?.exportQuantity || ce?.exportQuantity == 0) ? 'border-red-500' : 'border-gray-200'}`}
                                    classNameButton='size-7'
                                  />
                                </div>
                                <div className='col-span-3 flex gap-1 items-center justify-center h-full'>
                                  <EditIcon className='size-4' />
                                  <input
                                    value={ce?.note}
                                    onChange={_HandleChangeChild.bind(this, e?.id, ce?.id, 'note')}
                                    placeholder='Ghi chú ...'
                                    type='text'
                                    className='placeholder:text-slate-300 w-full bg-white rounded-[5.5px] text-[#52575E] font-normal outline-none'
                                  />
                                </div>
                                <div className='flex items-center justify-center h-full'>
                                  <ButtonDelete onDelete={_HandleDeleteChild.bind(this, e?.id, ce?.id)} />
                                </div>
                              </div>
                            ))
                          )}
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
                <DocumentNumber dataLang={dataLang} value={code} onChange={_HandleChangeInput.bind(this, 'code')} />

                <DocumentDate
                  dataLang={dataLang}
                  value={startDate}
                  onChange={date => {
                    sStartDate(date);
                    handleTimeChange(date);
                  }}
                  errDate={errDate}
                  isRequired={true}
                />

                <SelectWithRadio
                  isRequired={true}
                  label={dataLang?.import_branch || 'import_branch'}
                  placeholderText={dataLang?.import_branch || 'import_branch'}
                  options={dataBranch}
                  value={idBranch}
                  onChange={value => {
                    const newValue = dataBranch.find(item => item.value === value);
                    _HandleChangeInput('branch', newValue);
                  }}
                  isError={errBranch}
                  icon={<PiMapPinLight />}
                  errMess={dataLang?.purchase_order_errBranch || 'purchase_order_errBranch'}
                />

                <SelectWithRadio
                  isRequired={true}
                  label={dataLang?.warehouseTransfer_transferWarehouse || 'warehouseTransfer_transferWarehouse'}
                  placeholderText={dataLang?.warehouseTransfer_transferWarehouse || 'warehouseTransfer_transferWarehouse'}
                  options={dataWarehouse}
                  value={idExportWarehouse}
                  onChange={value => {
                    const newValue = dataWarehouse.find(item => item.value === value);
                    _HandleChangeInput('idExportWarehouse', newValue);
                  }}
                  isError={errExportWarehouse}
                  icon={<PiMapPinLight />}
                  errMess={'Vui lòng chọn kho'}
                />

                <SelectWithRadio
                  isRequired={true}
                  label={dataLang?.warehouseTransfer_receivingWarehouse || 'warehouseTransfer_receivingWarehouse'}
                  placeholderText={dataLang?.warehouseTransfer_receivingWarehouse || 'warehouseTransfer_receivingWarehouse'}
                  options={dataReceiveWarehouse}
                  value={idReceiveWarehouse}
                  onChange={value => {
                    const newValue = dataReceiveWarehouse.find(item => item.value === value);
                    _HandleChangeInput('idReceiveWarehouse', newValue);
                  }}
                  isError={errReceiveWarehouse}
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
                  onChange={_HandleChangeInput.bind(this, 'note')}
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
              <div className='font-normal'>
                <h3>{dataLang?.production_warehouse_totalItem || 'production_warehouse_totalItem'}</h3>
              </div>
              <div className='font-normal'>
                <h3 className='text-blue-600'>{formatNumber(listData?.length)}</h3>
              </div>
            </div>
            <div className='flex justify-between '>
              <div className='font-normal'>
                <h3>{props.dataLang?.warehouseTransfer_total || 'warehouseTransfer_total'}</h3>
              </div>
              <div className='font-normal'>
                <h3 className='text-blue-600'>
                  {formatNumber(
                    listData?.reduce((total, item) => {
                      item?.child?.forEach(childItem => {
                        if (childItem.exportQuantity !== undefined && childItem.exportQuantity !== null) {
                          total += childItem.exportQuantity;
                        }
                      });
                      return total;
                    }, 0)
                  )}
                </h3>
              </div>
            </div>
          </div>
        }
      />

      <PopupConfim
        dataLang={dataLang}
        type='warning'
        title={isKeyState?.type == 'idReceiveWarehouse' ? 'Thay đổi sẽ thay đổi vị trí nhận' : TITLE_DELETE_ITEMS}
        subtitle={CONFIRMATION_OF_CHANGES}
        isOpen={isOpen}
        save={resetValue}
        nameModel={'change_item'}
        cancel={() => handleQueryId({ status: false })}
      />
      <PopupConfim
        dataLang={dataLang}
        type='warning'
        nameModel='bom_require_stage'
        title={dataLang?.warning || 'Cảnh Báo'}
        subtitle={
          <span>
            Kho nhận hiện <span className='font-semibold'>chưa có vị trí nhận</span>. Bạn có muốn tạo vị trí mới không?
          </span>
        }
        isOpen={isOpenReceivingLocationWarning}
        cancelLabel={dataLang?.cancel || 'Hủy'}
        confirmLabel='Tạo vị trí'
        save={() => {
          sIsOpenReceivingLocationWarning(false);
          if (typeof window !== 'undefined') {
            window.open('/warehouses/location', '_blank');
          }
        }}
        cancel={() => {
          sIsOpenReceivingLocationWarning(false);
          // Quay lại kho nhận trước đó (nếu có), không giữ kho không có vị trí
          if (prevReceiveWarehouseRef.current) {
            sIdReceiveWarehouse(prevReceiveWarehouseRef.current);
          } else {
            sIdReceiveWarehouse(null);
          }
        }}
      />
    </React.Fragment>
  );
};

export default WarehouseTransferForm;
