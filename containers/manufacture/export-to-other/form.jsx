import apiExportToOther from '@/Api/apiManufacture/warehouse/exportToOther/apiExportToOther';
import InputCustom from '@/components/common/input/InputCustom';
import ButtonDelete from '@/components/common/orderManagement/ButtonDelete';
import { DocumentDate, DocumentNumber } from '@/components/common/orderManagement/GeneralInfo';
import OrderFormTabs from '@/components/common/orderManagement/OrderFormTabs';
import SelectSearch from '@/components/common/orderManagement/SelectSearch';
import SelectWithRadio from '@/components/common/orderManagement/SelectWithRadio';
import { EditIcon } from '@/components/icons';
import LayoutForm from '@/components/layout/LayoutForm';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import SelectComponent from '@/components/UI/filterComponents/selectComponent';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import PopupConfim from '@/components/UI/popupConfim/popupConfim';
import { CONFIRMATION_OF_CHANGES, TITLE_DELETE_ITEMS } from '@/constants/delete/deleteItems';
import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate';
import { useBranchList } from '@/hooks/common/useBranch';
import { useObject, useObjectList } from '@/hooks/common/useObject';
import { useWarehouseComboboxByManufactureByBranch } from '@/hooks/common/useWarehouses';
import useFeature from '@/hooks/useConfigFeature';
import useSetingServer from '@/hooks/useConfigNumber';
import useStatusExprired from '@/hooks/useStatusExprired';
import useToast from '@/hooks/useToast';
import { useToggle } from '@/hooks/useToggle';
import { routerExportToOther, routerWarehouseTransfer } from '@/routers/manufacture';
import { formatMoment } from '@/utils/helpers/formatMoment';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import { useQuery } from '@tanstack/react-query';
import { Add } from 'iconsax-react';
import { debounce } from 'lodash';
import moment from 'moment/moment';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import { PiMapPinLight } from 'react-icons/pi';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { useExportToOtherItems } from './hooks/useExportToOtherItems';
import { TagColorProduct } from '@/components/UI/common/Tag/TagStatus';

const ExportToOtherForm = props => {
  const dataLang = props?.dataLang;
  const router = useRouter();
  const isShow = useToast();

  const id = router.query?.id;
  const authState = useSelector(state => state.auth);
  const dataSeting = useSetingServer();

  const { dataMaterialExpiry, dataProductExpiry, dataProductSerial } = useFeature();
  const statusExprired = useStatusExprired();

  const { isOpen, isKeyState, handleQueryId } = useToggle();
  const [onLoadingChild, sOnLoadingChild] = useState(false);
  const [onSending, sOnSending] = useState(false);
  const [code, sCode] = useState('');
  const [searchItems, setSearchItems] = useState('');
  const [startDate, sStartDate] = useState(new Date());
  const [note, sNote] = useState('');
  const [date, sDate] = useState(moment().format(FORMAT_MOMENT.DATE_TIME_LONG));
  const [listData, sListData] = useState([]);
  const [idBranch, sIdBranch] = useState(null);
  const [idExportWarehouse, sIdExportWarehouse] = useState(null);
  const [errDate, sErrDate] = useState(false);
  const [errBranch, sErrBranch] = useState(false);
  const [errWarehouse, sErrWarehouse] = useState(false);
  const [errQty, sErrQty] = useState(false);
  const [errExportWarehouse, sErrExportWarehouse] = useState(false);
  const [errObject, sErrObject] = useState(false);
  const [errListObject, sErrListObject] = useState(false);
  const [object, sObject] = useState(null);
  const [listObject, sListObject] = useState(null);

  const { data: dataBranch = [] } = useBranchList();
  const { data: dataObjects = [] } = useObject(dataLang);
  const { data: dataListObject } = useObjectList(dataLang, idBranch, object);
  const { data: dataWarehouses } = useWarehouseComboboxByManufactureByBranch(idBranch, undefined);
  const { data: dataItems } = useExportToOtherItems(idBranch, idExportWarehouse, searchItems);

  useEffect(() => {
    router.query && sErrDate(false);
    router.query && sErrListObject(false);
    router.query && sErrObject(false);
    router.query && sErrBranch(false);
    router.query && sErrExportWarehouse(false);
    router.query && sStartDate(new Date());
    router.query && sNote('');
  }, [router.query]);

  // Tự động chọn chi nhánh đầu tiên
  useEffect(() => {
    if (authState?.branch?.length > 0 && !idBranch) {
      const firstBranch = {
        value: authState.branch[0].id,
        label: authState.branch[0].name,
      };
      sIdBranch(firstBranch);
    }
  }, [authState?.branch, idBranch]);

  const formatNumber = number => {
    return formatNumberConfig(+number, dataSeting);
  };

  const { isFetching } = useQuery({
    queryKey: ['api_export_to_other_page_detail', id],
    queryFn: async () => {
      const rResult = await apiExportToOther.apiDetaiPageExportToOther(id);
      sIdBranch({
        label: rResult?.branch_name,
        value: rResult?.branch_id,
      });
      sIdExportWarehouse({
        label: rResult?.warehouse_name,
        value: rResult?.warehouse_id,
      });

      sCode(rResult?.code);
      sObject({
        label: dataLang[rResult?.object] || rResult?.object,
        value: rResult?.object,
      });
      sListObject(
        rResult?.object === 'other'
          ? {
              label: rResult?.object_text,
              value: rResult?.object_text,
            }
          : {
              label: dataLang[rResult?.object_text] || rResult?.object_text,
              value: rResult?.object_id,
            }
      );
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
              (e.item?.text_type == 'material' && dataMaterialExpiry?.is_enable == '1' && false) ||
              (e.item?.text_type == 'material' && dataMaterialExpiry?.is_enable == '0' && true) ||
              (e.item?.text_type == 'products' && dataProductExpiry?.is_enable == '1' && false) ||
              (e.item?.text_type == 'products' && dataProductExpiry?.is_enable == '0' && true),
            location:
              ce?.warehouse_location?.location_name || ce?.warehouse_location?.id || ce?.warehouse_location?.warehouse_name || ce?.warehouse_location?.quantity
                ? {
                    label: ce?.warehouse_location?.location_name,
                    value: ce?.warehouse_location?.id,
                    warehouse_name: ce?.warehouse_location?.warehouse_name,
                    qty: ce?.warehouse_location?.quantity,
                  }
                : null,
            dataWarehouse: e?.item?.warehouseList.map(ye => ({
              label: ye?.location_name,
              value: ye?.id,
              warehouse_name: ye?.warehouse_name,
              qty: +ye?.quantity,
            })),
            serial: ce?.serial == null ? '' : ce?.serial,
            lot: ce?.lot == null ? '' : ce?.lot,
            date: ce?.expiration_date != null ? moment(ce?.expiration_date).toDate() : null,
            unit: e.item?.unit_name,
            toOtherQuantity: +ce?.quantity,
            note: ce?.note,
          })),
        }))
      );
      sStartDate(moment(rResult?.date).toDate());
      sNote(rResult?.note);
    },
    enabled: !!id,
  });

  const _HandleSeachApi = debounce(async inputValue => {
    if (idBranch == null || idExportWarehouse == null || object == null || listObject == null) {
      return;
    } else {
      setSearchItems(inputValue || '');
    }
  }, 500);

  const resetValue = () => {
    if (isKeyState?.type === 'branch') {
      sListData([]);
      sIdBranch(isKeyState?.value);
      sIdExportWarehouse(null);
      sListObject(null);
    }
    if (isKeyState?.type === 'idExportWarehouse') {
      sListData([]);
      sIdExportWarehouse(isKeyState?.value);
    }
    handleQueryId({ status: false });
  };

  const _HandleChangeInput = (type, value) => {
    if (type == 'code') {
      sCode(value.target.value);
    } else if (type === 'date') {
      sDate(formatMoment(value.target.value, FORMAT_MOMENT.DATE_TIME_LONG));
    } else if (type === 'note') {
      sNote(value.target.value);
    } else if (type == 'branch' && idBranch != value) {
      if (listData?.length > 0) {
        handleQueryId({ status: true, initialKey: { type, value } });
      } else {
        sListObject(null);
        sIdExportWarehouse(null);
        sIdBranch(value);
      }
    } else if (type == 'idExportWarehouse' && idExportWarehouse != value) {
      if (listData?.length > 0) {
        handleQueryId({ status: true, initialKey: { type, value } });
      } else {
        sIdExportWarehouse(value);
      }
    } else if (type == 'object' && object != value) {
      sObject(value);
      sListObject(null);
    } else if (type == 'listObject') {
      sListObject(value);
    }
  };

  const handleTimeChange = date => {
    sStartDate(date);
  };

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
          dataWarehouse: value?.e?.warehouseList.map(e => ({
            label: e?.location_name,
            value: e?.id,
            warehouse_name: e?.warehouse_name,
            qty: e?.quantity,
          })),
          unit: value?.e?.unit_name || value?.e?.unit,
          serial: '',
          lot: '',
          date: null,
          toOtherQuantity: null,
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

  const _HandleAddParent = useCallback(
    value => {
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
              dataWarehouse: value?.e?.warehouseList.map(e => ({
                label: e?.location_name,
                value: e?.id,
                warehouse_name: e?.warehouse_name,
                qty: e?.quantity,
              })),
              serial: '',
              lot: '',
              date: null,
              unit: value?.e?.unit_name,

              toOtherQuantity: null,
              note: '',
            },
          ],
        };
        setTimeout(() => {
          sOnLoadingChild(false);
        }, 500);
        sListData([newData, ...listData]);
      } else {
        handleCheckError(dataLang?.returns_err_ItemSelect || 'returns_err_ItemSelect');
      }
    },
    [listData]
  );

  const _HandleDeleteChild = useCallback(
    (parentId, childId) => {
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
    },
    [listData]
  );

  const _HandleChangeChild = useCallback(
    (parentId, childId, type, value) => {
      const newData = [...listData];
      const parentIndex = newData.findIndex(e => e.id === parentId);
      if (parentIndex !== -1) {
        const childIndex = newData[parentIndex].child.findIndex(ce => ce.id === childId);
        if (childIndex !== -1) {
          // Thực hiện cập nhật dữ liệu tại vị trí tìm thấy
          const updatedChild = { ...newData[parentIndex].child[childIndex] };
          if (type === 'toOtherQuantity') {
            const qtyExport = typeof value === 'object' && value?.value !== undefined ? Number(value?.value) : Number(value);
            updatedChild.toOtherQuantity = qtyExport;
            // Reset lỗi số lượng khi người dùng nhập số lượng hợp lệ
            if (qtyExport > 0 && qtyExport !== null && qtyExport !== undefined) {
              sErrQty(false);
            }
          } else if (type === 'location') {
            const checkKho = newData[parentIndex].child.map(house => house).some(i => i?.location?.value === value?.value);
            if (checkKho) {
              handleCheckError('Vị trí kho đã được chọn');
            } else {
              updatedChild.location = value;
            }
          } else if (type === 'increase') {
            if (updatedChild.location == null) {
              handleCheckError('Vui lòng chọn vị trí trước');
            } else if (updatedChild.toOtherQuantity == updatedChild.location?.qty || (id && updatedChild.toOtherQuantity >= updatedChild.location?.qty)) {
              handleQuantityError(updatedChild?.location?.qty);
            } else {
              updatedChild.toOtherQuantity = Number(updatedChild.toOtherQuantity) + 1;
            }
          } else if (type === 'decrease') {
            if (updatedChild.location == null) {
              handleCheckError('Vui lòng chọn vị trí trước');
            } else if (updatedChild.toOtherQuantity >= 2) {
              updatedChild.toOtherQuantity = Number(updatedChild.toOtherQuantity) - 1;
            }
          } else if (type === 'note') {
            updatedChild.note = value?.target.value;
          }
          newData[parentIndex].child[childIndex] = updatedChild;
        }
      }
      sListData(newData);
    },
    [listData]
  );

  const _HandleSubmit = e => {
    e.preventDefault();
    const hasNullOrCondition = (data, conditionFn) => data.some(item => item.child?.some(childItem => conditionFn(item, childItem)));
    const hasNullKho = hasNullOrCondition(listData, (item, childItem) => childItem.location === null);
    const hasNullQty = hasNullOrCondition(listData, (item, childItem) => childItem.toOtherQuantity === null || childItem.toOtherQuantity === '' || childItem.toOtherQuantity == 0);

    const isEmpty = listData?.length === 0;

    if (idBranch == null || hasNullKho || hasNullQty || object == null || listObject == null || idExportWarehouse == null || isEmpty) {
      object == null && sErrObject(true);
      listObject == null && sErrListObject(true);
      idBranch == null && sErrBranch(true);
      idExportWarehouse == null && sErrExportWarehouse(true);
      hasNullQty && sErrQty(true);
      hasNullKho && sErrWarehouse(true);

      if (isEmpty) {
        handleCheckError('Chưa nhập thông tin mặt hàng');
      } else {
        handleCheckError(dataLang?.required_field_null);
      }
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

  //Tham chiếu đến hàm rồi xử lý
  useClearErrorEffect(sErrDate, date != null);
  useClearErrorEffect(sErrBranch, idBranch != null);
  useClearErrorEffect(sErrObject, object != null);
  useClearErrorEffect(sErrListObject, listObject != null);
  useClearErrorEffect(sErrExportWarehouse, idExportWarehouse != null);

  const _ServerSending = async () => {
    let formData = new FormData();

    formData.append('code', code);
    formData.append('date', formatMoment(startDate, FORMAT_MOMENT.DATE_TIME_LONG));
    formData.append('branch_id', idBranch?.value);
    formData.append('warehouse_id', idExportWarehouse?.value);
    formData.append('object', object?.value);
    if (object?.value == 'other') {
      formData.append('object_text', listObject?.value);
    } else {
      formData.append('object_id', listObject?.value);
    }
    formData.append('note', note);
    listData.forEach((item, index) => {
      formData.append(`items[${index}][id]`, id ? item?.idParenBackend : '');
      formData.append(`items[${index}][item]`, item?.item?.value);
      item?.child?.forEach((childItem, childIndex) => {
        formData.append(`items[${index}][child][${childIndex}][row_id]`, id ? childItem?.idChildBackEnd : '');
        formData.append(`items[${index}][child][${childIndex}][location_warehouses_id]`, childItem?.location?.value || 0);
        formData.append(`items[${index}][child][${childIndex}][note]`, childItem?.note ? childItem?.note : '');
        formData.append(`items[${index}][child][${childIndex}][quantity]`, childItem?.toOtherQuantity);
      });
    });
    try {
      const { isSuccess, message } = await apiExportToOther.apiHandingExportToOther(id ? id : undefined, formData);
      if (isSuccess) {
        isShow('success', `${dataLang[message]}` || message);
        sCode('');
        sStartDate(new Date());
        sIdBranch(null);
        sIdExportWarehouse(null);
        sObject(null);
        sListObject(null);
        sNote('');
        sErrBranch(false);
        sErrListObject(false);
        sErrObject(false);
        sErrWarehouse(false);
        sErrDate(false);
        sErrExportWarehouse(false);
        sListData([]);
        router.push(routerExportToOther.home);
        sOnSending(false);
      } else {
        handleCheckError(dataLang[message] || message);
      }
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    onSending && _ServerSending();
  }, [onSending]);

  const handleCheckError = e => isShow('error', `${e}`);

  const handleQuantityError = e => {
    isShow('error', `Số lượng chỉ được bé hơn hoặc bằng ${formatNumber(e)} số lượng tồn`);
  };

  const getTypeDataKey = textType => {
    const typeMap = {
      products: 0,
      material: 1,
      semi_products: 2,
    };
    return typeMap[textType] ?? 0;
  };

  // breadcrumb
  const breadcrumbItems = [
    {
      label: `${dataLang?.Warehouse_title || 'Warehouse_title'}`,
    },
    {
      label: `${dataLang?.exportToOthe_list || 'exportToOthe_list'}`,
      href: '/manufacture/export-to-other',
    },
    {
      label: id ? dataLang?.exportToOthe_exporttoOtherEdit || 'exportToOthe_exporttoOtherEdit' : dataLang?.exportToOthe_exporttoOtherAdd || 'exportToOthe_exporttoOtherAdd',
    },
  ];

  return (
    <React.Fragment>
      <LayoutForm
        title={id ? dataLang?.exportToOthe_exporttoOtherEdit || 'exportToOthe_exporttoOtherEdit' : dataLang?.exportToOthe_exporttoOtherAdd || 'exportToOthe_exporttoOtherAdd'}
        breadcrumbItems={breadcrumbItems}
        heading={id ? dataLang?.exportToOthe_exporttoOtherEdit || 'exportToOthe_exporttoOtherEdit' : dataLang?.exportToOthe_exporttoOtherAdd || 'exportToOthe_exporttoOtherAdd'}
        dataLang={dataLang}
        statusExprired={statusExprired}
        onSave={_HandleSubmit.bind(this)}
        onExit={() => router.push(routerWarehouseTransfer.home)}
        leftContent={
          <div className='flex flex-col h-full min-h-0'>
            <div className='flex items-center justify-between flex-shrink-0 mb-4'>
              <h2 className='responsive-text-xl font-medium text-brand-color w-full'>Thông tin mặt hàng</h2>
              <SelectSearch
                options={!idBranch || !idExportWarehouse || !object || !listObject ? [] : (dataItems || [])}
                placeholder='Tìm kiếm mặt hàng'
                value={null}
                multiple={false}
                showCheckbox={false}
                showSelectedCount={false}
                setSearch={_HandleSeachApi}
                noDataMessage={
                  !idBranch || !idExportWarehouse || !object || !listObject ? <span className='text-new-blue'>Vui lòng chọn kho xuất, đối tượng và danh sách đối tượng</span> : 'Không có dữ liệu'
                }
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
                        <div className='flex items-center gap-2 italic'>
                          {dataProductSerial.is_enable === '1' && option.e?.text_type !== 'material' && (
                            <div className='responsive-text-xs text-[#667085] font-[500]'>Serial: {option.e?.serial ? option.e?.serial : '-'}</div>
                          )}
                          {dataMaterialExpiry.is_enable === '1' || dataProductExpiry.is_enable === '1' ? (
                            <>
                              <div className='responsive-text-xs text-[#667085] font-[500]'>Lot: {option.e?.lot ? option.e?.lot : '-'}</div>
                              <div className='responsive-text-xs text-[#667085] font-[500]'>
                                Date: {option.e?.expiration_date ? formatMoment(option.e?.expiration_date, FORMAT_MOMENT.DATE_SLASH_LONG) : '-'}
                              </div>
                            </>
                          ) : (
                            ''
                          )}
                        </div>
                        {option.e?.text_type && (
                          <TagColorProduct dataLang={dataLang} dataKey={getTypeDataKey(option.e?.text_type)} name={option.e?.text_type} className='!px-1' textSize='text-[11px]' />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              />
            </div>
            <div className='flex flex-col flex-1 min-h-0 overflow-hidden'>
              <div className='grid grid-cols-20 gap-2 items-center responsive-text-base text-neutral-02 font-semibold py-2 z-10 border-b border-b-[#F3F3F4] flex-shrink-0'>
                <h4 className='col-span-6'>{dataLang?.import_from_items || 'import_from_items'}</h4>
                <h4 className='col-span-4 text-center'>Vị trí xuất</h4>
                <h4 className='col-span-2 text-center'>{'ĐVT'}</h4>
                <h4 className='col-span-4 text-center'>{dataLang?.recall_revenueQty || 'recall_revenueQty'}</h4>
                <h4 className='col-span-3 text-center'>{dataLang?.production_warehouse_note || 'production_warehouse_note'}</h4>
                <h4 className='col-span-1 text-center'></h4>
              </div>
              <Customscrollbar className='flex-1 min-h-0 h-0'>
                {isFetching ? (
                  <Loading className='w-full min-h-[50vh]' color='#0f4f9e' />
                ) : listData?.length === 0 ? (
                  <NoData type='report' titleText='Chưa có mặt hàng. Bắt đầu thêm mặt hàng tại khung tìm kiếm ngay!' className='min-h-[50vh]' />
                ) : (
                  listData?.map(e => (
                    <div key={e?.id?.toString()} className='grid items-start grid-cols-20 gap-2 py-2 border-b border-b-[#F3F3F4]'>
                      <div className='h-full col-span-6'>
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
                                {dataProductSerial.is_enable === '1' && e?.item?.e?.text_type !== 'material' && <div className='responsive-text-xs text-[#667085] font-[500]'>Serial: {e?.item?.e?.serial ? e?.item?.e?.serial : '-'}</div>}
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
                      <div className='col-span-14'>
                        <div className='grid grid-cols-14 gap-2'>
                          {isFetching ? (
                            <Loading className='h-full col-span-14' color='#0f4f9e' />
                          ) : (
                            e?.child?.map((ce, index) => (
                              <div key={ce?.id?.toString()} className='col-span-14 grid grid-cols-14 gap-2'>
                                <div className='col-span-4 flex flex-col justify-center h-fit'>
                                  <SelectComponent
                                    options={ce?.dataWarehouse}
                                    value={ce?.location}
                                    onChange={value => _HandleChangeChild(e?.id, ce?.id, 'location', value)}
                                    placeholder={onLoadingChild ? '' : dataLang?.exportToOthe_location || 'exportToOthe_location'}
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
                                <div className='col-span-2 flex items-center justify-center h-full'>{ce?.unit}</div>
                                <div className='col-span-4 flex items-center justify-center h-full gap-1 relative'>
                                  {!ce?.location && (
                                    <div
                                      className='absolute inset-0 z-10 cursor-not-allowed'
                                      onClick={() => {
                                        isShow('error', 'Vui lòng chọn vị trí trước');
                                      }}
                                    />
                                  )}
                                  <InputCustom
                                    state={ce?.toOtherQuantity || 0}
                                    setState={val => {
                                      _HandleChangeChild(e?.id, ce?.id, 'toOtherQuantity', { value: val });
                                    }}
                                    min={0}
                                    max={ce?.location?.qty ? Number(ce.location.qty) : Infinity}
                                    step={1}
                                    allowDecimal={false}
                                    className='p-1 w-full'
                                    classNameInput='w-full text-center'
                                    classNameButton='size-7'
                                    isError={errQty && (ce?.toOtherQuantity == null || ce?.toOtherQuantity === '' || ce?.toOtherQuantity == 0)}
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
                  label={dataLang?.exportToOthe_warehouse || 'exportToOthe_warehouse'}
                  placeholderText={dataLang?.exportToOthe_warehouse || 'exportToOthe_warehouse'}
                  options={dataWarehouses}
                  value={idExportWarehouse}
                  onChange={value => {
                    const newValue = dataWarehouses.find(item => item.value === value);
                    _HandleChangeInput('idExportWarehouse', newValue);
                  }}
                  isError={errExportWarehouse}
                  icon={<PiMapPinLight />}
                  errMess={'Vui lòng chọn kho'}
                />

                <SelectWithRadio
                  isRequired={true}
                  label={dataLang?.payment_ob || 'payment_ob'}
                  placeholderText={dataLang?.payment_ob || 'payment_ob'}
                  options={dataObjects}
                  value={object}
                  onChange={value => {
                    const newValue = dataObjects.find(item => item.value === value);
                    _HandleChangeInput('object', newValue);
                  }}
                  isError={errObject}
                  icon={<PiMapPinLight />}
                  errMess={'Vui lòng chọn đối tượng'}
                />
                <SelectWithRadio
                  isRequired={true}
                  label={dataLang?.payment_listOb || 'payment_listOb'}
                  placeholderText={dataLang?.payment_listOb || 'payment_listOb'}
                  options={dataListObject}
                  value={listObject}
                  onChange={value => {
                    const newValue = dataListObject.find(item => item.value === value);
                    _HandleChangeInput('listObject', newValue);
                  }}
                  isError={errListObject}
                  icon={<PiMapPinLight />}
                  errMess={'Vui lòng chọn danh sách đối tượng'}
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
                <h3>{dataLang?.exportToOthe_totalQuantity || 'exportToOthe_totalQuantity'}</h3>
              </div>
              <div className='font-normal'>
                <h3 className='text-blue-600'>
                  {formatNumber(
                    listData?.reduce((total, item) => {
                      item?.child?.forEach(childItem => {
                        if (childItem.toOtherQuantity !== undefined && childItem.toOtherQuantity !== null) {
                          total += childItem.toOtherQuantity;
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
        title={TITLE_DELETE_ITEMS}
        subtitle={CONFIRMATION_OF_CHANGES}
        isOpen={isOpen}
        save={resetValue}
        nameModel={'change_item'}
        cancel={() => handleQueryId({ status: false })}
      />
    </React.Fragment>
  );
};

export default ExportToOtherForm;
