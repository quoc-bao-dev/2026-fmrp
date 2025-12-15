import apiMaterialsPlanning from '@/Api/apiManufacture/manufacture/materialsPlanning/apiMaterialsPlanning';
import { ButtonAddNew } from '@/components/common/button/AddNew';
import PopupRequestUpdateVersion from '@/components/common/popup/PopupRequestUpdateVersion';
import ButtonCancel from '@/components/UI/button/buttonCancel';
import ButtonSubmit from '@/components/UI/button/buttonSubmit';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { ColumnTablePopup, HeaderTablePopup } from '@/components/UI/common/TablePopup';
import SearchActionInput from '@/components/common/input/SearchActionInput';
import SelectComponent from '@/components/UI/filterComponents/selectComponent';
import InPutNumericFormat from '@/components/UI/inputNumericFormat/inputNumericFormat';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import PopupCustom from '@/components/UI/popup';
import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate';
import Popup_dsncc from '@/containers/suppliers/supplier/components/popup/popup';
import { useSupplierList } from '@/containers/suppliers/supplier/hooks/useSupplierList';
import { useProvinceList } from '@/hooks/common/useAddress';
import { useBranchList } from '@/hooks/common/useBranch';
import useSetingServer from '@/hooks/useConfigNumber';
import useToast from '@/hooks/useToast';
import { formatMoment } from '@/utils/helpers/formatMoment';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash as IconDelete } from 'iconsax-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { BsCalendarEvent } from 'react-icons/bs';
import { MdClear } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

const initialState = {
  onFetching: false,
  type: [
    // {
    //     id: uuidv4(),
    //     label: "materials_planning_semi",
    //     value: "product",
    // },
    {
      id: uuidv4(),
      label: 'materials_planning_materials',
      value: 'material',
    },
  ],
  arrayItem: [],
};

const initForm = {
  date: new Date(),
  note: '',
  type: 'material',
  purchaseName: 'Yêu cầu mua hàng (PR)',
  arrayItem: [],
  idBranch: null,
  supplier: null,
};

const PopupPurchaseBeta = ({ dataLang, icon, title, dataTable, className, queryValue, fetchDataTable, hasPermission = true, ...rest }) => {
  const isShow = useToast();

  const dispatch = useDispatch();

  const [open, sOpen] = useState(false);

  const _ToggleModal = e => sOpen(e);

  const dataSeting = useSetingServer();
  const queryClient = useQueryClient();

  const [openSupplierPopup, sOpenSupplierPopup] = useState(false);
  const { data: listProvince = [] } = useProvinceList({ enabled: openSupplierPopup });
  const { data: listBranch = [] } = useBranchList({});

  const [isState, sIsState] = useState(initialState);
  const [searchTerm, setSearchTerm] = useState('');

  const queryState = key => sIsState(prev => ({ ...prev, ...key }));

  const form = useForm({ defaultValues: { ...initForm } });

  const { data: listSuppiler, refetch: refetchSupplierList } = useSupplierList({
    'filter[branch_id]': form.watch('idBranch'),
  });

  const dataSupplier = form.watch('idBranch') ? listSuppiler?.rResult?.map(e => ({ label: e.name, value: e.id })) : [];

  const handleCloseSupplierPopup = () => sOpenSupplierPopup(false);

  const handleSupplierCreated = async newSupplier => {
    handleCloseSupplierPopup();

    // Lấy supplier ID từ response
    const supplierId = newSupplier?.submitId || newSupplier?.data?.submitId || newSupplier?.id;

    if (supplierId) {
      // Invalidate và refetch danh sách nhà cung cấp
      await queryClient.invalidateQueries({
        queryKey: ['api_supplier_list', { 'filter[branch_id]': form.watch('idBranch') }],
      });

      // Đợi refetch xong và tìm nhà cung cấp vừa thêm
      const refetchResult = await refetchSupplierList();
      const updatedSupplierList = refetchResult?.data;

      if (updatedSupplierList?.rResult) {
        // Tìm nhà cung cấp vừa thêm trong danh sách đã refetch
        const foundSupplier = updatedSupplierList.rResult.find(s => String(s.id) === String(supplierId));

        if (foundSupplier) {
          // Tự động chọn nhà cung cấp vừa thêm
          form.setValue('supplier', { label: foundSupplier.name, value: foundSupplier.id }, { shouldDirty: true, shouldTouch: true });
          return;
        }
      }
    }
  };

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'arrayItem',
  });

  /// lắng nghe thay đổi
  const findValue = form.watch();

  const formatNumber = number => {
    return formatNumberConfig(+number, dataSeting);
  };

  const normalizeText = text => {
    if (!text) return '';
    return text.normalize('NFC');
  };

  const removeItem = e => {
    // const updatedData = findValue.arrayItem.filter((item) => item.id !== e?.id);
    // console.log("updatedData", updatedData);
    // form.setValue("arrayItem", updatedData, { shouldDirty: true, shouldTouch: true }); // Cập nhật lại state
    // form.clearErrors("arrayItem");
    remove(e);
    form.clearErrors('arrayItem');
  };

  const fetchListItem = async () => {
    try {
      queryState({ onFetching: true });
      await new Promise(resolve => setTimeout(resolve, 500));
      let formData = new FormData();
      // type: 1 nvl, 2 BTP
      // type_object: 2 YCMH
      formData.append('type_object', 2);
      formData.append('type', findValue.type == 'material' ? 1 : 2);
      formData.append('pPlan_id', dataTable.listDataRight.idCommand);
      const { isSuccess, message, data } = await apiMaterialsPlanning.apiKeepItemsWarehouses(formData);

      const newData = data?.items?.map(e => {
        return {
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
          // sl giữ
          quantityKeepp: formatNumber(e?.quantity_keep),
          // sl còn lại
          quantityRest: formatNumber(e?.quantity_rest),
          quantityNeedAI: e?.quantity_need_ai,
          // sl đã mua
          quantityPurchased: formatNumber(e?.quantity_purchase),
          quantity: e?.quantity_need_ai && +e?.quantity_need_ai > 0 ? formatNumber(e?.quantity_need_ai) : '',

          itemVariationOptionValueId: e?.item_variation_option_value_id,
        };
      });

      form.setValue('arrayItem', newData);
      form.setValue('idBranch', data?.branch_id);
      queryState({ onFetching: false });
    } catch (error) {
      throw new error();
    }
  };

  useEffect(() => {
    if (open) {
      form.clearErrors('arrayItem');
      form.setValue('arrayItem', []);
      fetchListItem();
    }
  }, [findValue.type, open]);

  const hangdingMutation = useMutation({
    mutationFn: async data => {
      return await apiMaterialsPlanning.apiHandlingOrderProductionPlan(data);
    },
  });

  const onSubmit = async value => {
    if (value.arrayItem.length == 0) {
      return shhowToat('error', dataLang?.materials_planning_no_items_purchase || 'materials_planning_no_items_purchase');
    }

    let formData = new FormData();
    formData.append('note', value.note ?? '');
    formData.append('name', value.purchaseName ?? '');
    formData.append('type', value.type == 'material' ? 1 : 2);
    formData.append('plan_id', dataTable?.listDataRight?.idCommand);

    formData.append('date', formatMoment(value.date, FORMAT_MOMENT.DATE_TIME_SLASH_LONG));
    formData.append('suppliers_id', value?.supplier?.value ?? '');
    formData.append('branch_id', value?.idBranch ?? '');
    value.arrayItem?.forEach((e, index) => {
      formData.append(`items[${index}][id]`, e?.idParent);
      formData.append(`items[${index}][quantity]`, typeof e?.quantity == 'number' ? e?.quantity : parseFloat(e?.quantity?.replace(/,/g, '')));
      formData.append(`items[${index}][item_id]`, e?.item?.item_id);
      formData.append(`items[${index}][item_variation_option_value_id]`, e?.itemVariationOptionValueId);
      formData.append(`items[${index}][quantity_rest]`, typeof e?.quantityNeedAI === 'number' ? e?.quantityNeedAI : parseFloat(e?.quantityNeedAI?.replace(/,/g, '')));
      formData.append(`items[${index}][quantity_purchase]`, typeof e?.quantityPurchased == 'number' ? e?.quantityPurchased : parseFloat(e?.quantityPurchased?.replace(/,/g, '')));
    });

    hangdingMutation.mutate(formData, {
      onSuccess: ({ isSuccess, message }) => {
        if (isSuccess) {
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
  return (
    <>
      <PopupCustom
        title={
          <div className='flex flex-col gap-1'>
            <h2 className='text-2xl font-bold capitalize'>{title || dataLang?.materials_planning_raw_materials || 'materials_planning_raw_materials'}</h2>
            <p className='text-base text-blue-fmrp'>{dataTable?.listDataRight?.title || dataTable?.listDataRight?.referenceNoPo || ''}</p>
          </div>
        }
        button={
          <div
            className='bg-blue-100 rounded-lg outline-none focus:outline-none'
            onClick={() => {
              if (!hasPermission) {
                return isShow('error', dataLang?.no_permission || 'Bạn không có quyền thực hiện thao tác này');
              }
              if (dataSeting?.package == '1') {
                dispatch({
                  type: 'statePopupGlobal',
                  payload: {
                    open: true,
                    children: (
                      <PopupRequestUpdateVersion>
                        <p className='text-start xlg:text-2xl text-xl leading-[32px] font-semibold text-[#141522]'>
                          Theo dõi đơn hàng theo nhà cung cấp để nguyên vật liệu luôn <span className='text-[#0375F3]'>đúng và đủ</span>.
                        </p>
                      </PopupRequestUpdateVersion>
                    ),
                  },
                });
                return;
              }
              if (+dataTable?.countAll == 0) {
                return isShow('error', dataLang?.materials_planning_please_add || 'materials_planning_please_add');
              }
              _ToggleModal(true);
            }}
          >
            <div
              // className="flex items-center gap-2 px-3 py-2 "
              className=' responsive-text-sm 3xl:px-4 py-2.5 px-3 bg-blue-fmrp/80 hover:bg-blue-fmrp text-white rounded-lg flex items-center gap-x-2 transition-all duration-300'
            >
              {icon} {title}
              {/* <h3 className="text-xs font-medium text-blue-600 3xl:text-base">
              {title}
            </h3> */}
            </div>
          </div>
        }
        open={open}
        onClose={_ToggleModal.bind(this, false)}
        classNameBtn={className}
      >
        <div className='mt-4'>
          <div className='flex items-center space-x-4 my-2 border-[#E7EAEE] border-opacity-70 border-b-[1px]'></div>
          <div className='flex justify-between items-end pb-4'>
            <div className=''>
              <div className='flex items-center justify-between   mb-2'>
                <label className='text-[#344054] font-normal text-sm'>
                  {dataLang?.purchase_order_table_supplier} <span className='text-red-500'>*</span>
                </label>
                <ButtonAddNew onClick={() => sOpenSupplierPopup(true)} title={dataLang?.suppliers_supplier_add || 'Thêm nhanh NCC'} />
              </div>
              <Controller
                name='supplier'
                rules={{
                  required: {
                    value: true,
                    message: dataLang?.purchase_order_errSupplier || 'purchase_order_errSupplier',
                  },
                }}
                control={form.control}
                render={({ field, fieldState }) => {
                  return (
                    <div className=' relative w-[400px]'>
                      <SelectComponent
                        className={`${
                          fieldState.error ? 'border-red-500' : 'border-transparent'
                        } w-full placeholder:text-slate-300 bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border `}
                        isClearable={true}
                        placeholder={dataLang?.purchase_order_supplier ?? 'purchase_order_supplier'}
                        options={dataSupplier}
                        {...field}
                        onChange={event => {
                          field.onChange(event);
                        }}
                        styles={{
                          menu: (provided, state) => ({
                            ...provided,
                            width: '100%',
                            zIndex: 999,
                          }),
                          menuPortal: base => ({
                            ...base,
                            zIndex: 9999999,
                            position: 'absolute',
                          }),
                        }}
                        value={field.value}
                        maxMenuHeight={150}
                      />
                      {fieldState.error && <span className='text-[12px]  text-red-500'>{fieldState.error.message} </span>}
                    </div>
                  );
                }}
              />
            </div>
            <div className='w-[320px]'>
              <SearchActionInput value={searchTerm} onChange={setSearchTerm} placeholder='Tìm kiếm theo tên, mã sản phẩm' />
            </div>
          </div>

          <div className='flex-1 min-h-[60vh] max-h-[80vh] w-[1200px] flex flex-col gap-4'>
            {isState.onFetching ? (
              <div className='flex-1 flex justify-center items-center h-full'>
                <Loading className='max-h-40 2xl:h-[160px]' color='#0f4f9e' />
              </div>
            ) : fields?.length > 0 ? (
              <div className='overflow-hidden flex-1'>
                <Customscrollbar className='max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300'>
                  <table className='w-full border-separate' style={{ borderSpacing: '0 4px' }}>
                    <thead className='bg-white sticky top-0 z-[9999] shadow-sm'>
                      <tr>
                        <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[62px]'>STT</th>
                        <th className='py-2 px-3 border-b border-gray-200 text-left text-sm font-normal text-[#9295A4] w-auto'>{dataLang?.price_quote_item || 'price_quote_item'}</th>
                        <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[100px]'>{dataLang?.materials_planning_dvt || 'materials_planning_dvt'}</th>
                        <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[140px]'>
                          {dataLang?.materials_planning_qty_need_by || 'materials_planning_qty_need_by'}
                        </th>
                        <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[140px]'>
                          {dataLang?.materials_planning_qty_requested || 'materials_planning_qty_requested'}
                        </th>
                        <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[140px] relative'>
                          {dataLang?.materials_planning_qty_buys || 'materials_planning_qty_buys'}
                          <span className='normal-case whitespace-nowrap flex items-center justify-center gap-1 responsive-text-xxs text-blue-600 font-medium ai-shine-badge'>
                            <Image src='/icon/SparkleYellow.png' alt='logo' width={10} height={10} />
                            <span className='ai-shine-text'>Gợi ý AI</span>
                          </span>
                        </th>
                        <th className='py-2 px-3 border-b border-gray-200 text-center text-sm font-normal text-[#9295A4] w-[90px]'>{dataLang?.inventory_operatione || 'inventory_operatione'}</th>
                      </tr>
                    </thead>
                    <tbody className='[&>tr]:mb-1' style={{ gap: '4px' }}>
                      {(() => {
                        const filteredItems = (fields || []).filter(e => {
                          if (!e || !e.id) return false;
                          if (!searchTerm) return true;
                          const keyword = normalizeText(searchTerm.toLowerCase().trim());
                          if (!keyword) return true;
                          const name = normalizeText((e?.item?.name || '').toLowerCase().trim());
                          const code = normalizeText((e?.item?.item_code || '').toLowerCase().trim());
                          const variation = normalizeText((e?.item?.variation || '').toLowerCase().trim());

                          return name.includes(keyword) || code.includes(keyword) || variation.includes(keyword);


                        });

                        if (searchTerm && filteredItems.length === 0) {
                          return (
                            <tr>
                              <td colSpan={7} className='py-6'>
                                <NoData type='report' titleText='Không tìm thấy sản phẩm' />
                              </td>
                            </tr>
                          );
                        }

                        return filteredItems.map((e, index) => {
                          return (
                            <tr key={e?.id?.toString()} className='relative border-b border-[#E5E7EB]/20 hover:bg-gray-50'>
                              <td className='py-2 px-3 text-center text-sm font-semibold'>{index + 1}</td>
                              <td className='py-2 px-3 text-left'>
                                <div className='flex gap-2 min-w-0'>
                                  <div className='w-16 h-16 rounded flex items-center justify-center flex-shrink-0'>
                                    <Image
                                      src={e?.item?.image || '/icon/default/default.png'}
                                      alt={e?.item?.name || 'default'}
                                      width={64}
                                      height={64}
                                      className='object-cover rounded aspect-square w-16 h-16 '
                                    />
                                  </div>
                                  <div className='flex flex-col gap-1 flex-1 min-w-0 overflow-hidden'>
                                    <h3 className='text-sm font-semibold text-[#141522] line-clamp-1'>{e?.item?.name}</h3>
                                    <div className='flex flex-col gap-0.5'>
                                      <p className='text-[10px] font-normal text-[#667085] line-clamp-1'>{e?.item?.variation}</p>
                                      <p className='text-xs font-normal text-typo-blue-2 line-clamp-1'>{e?.item?.item_code}</p>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className='py-2 px-3 text-center text-sm font-medium text-[#141522]'>{e?.unit || '-'}</td>
                              <td className='py-2 px-3 text-center'>
                                <span className='text-sm font-medium text-[#141522]'>
                                  {e?.quantityRest == 0 ? '-' : `${e?.quantityRest} / `}
                                  {e?.quantityRest == 0 ? '' : <span className='text-[11px] text-[#667085]'>{e?.unit || ''}</span>}
                                </span>
                              </td>
                              <td className='py-2 px-3 text-center'>
                                <span className='text-sm font-medium text-[#141522]'>
                                  {e?.quantityPurchased == 0 ? '-' : `${e?.quantityPurchased} / `}
                                  {e?.quantityPurchased == 0 ? '' : <span className='text-[11px] text-[#667085]'>{e?.unit || ''}</span>}
                                </span>
                              </td>
                              <td className='py-2 px-3 text-center'>
                                <Controller
                                  name={`arrayItem.${index}.quantity`}
                                  control={form.control}
                                  rules={{
                                    required: {
                                      value: true,
                                      message: dataLang?.materials_planning_enter_quantity || 'materials_planning_enter_quantity',
                                    },
                                    validate: {
                                      fn: value => {
                                        try {
                                          let mss = '';
                                          if (value == null) {
                                            mss = dataLang?.materials_planning_enter_quantity || 'materials_planning_enter_quantity';
                                          }
                                          if (value == 0) {
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
                                      <div className='flex flex-col items-center justify-center'>
                                        <InPutNumericFormat
                                          className={`${
                                            fieldState.error ? 'border-red-500' : 'border-gray-200'
                                          } cursor-default appearance-none text-center 3xl:text-[13px] 2xl:text-[12px] xl:text-[11px] text-[10px] py-1 px-0.5 font-normal w-[80px] focus:outline-none border-b-2`}
                                          {...field}
                                          onValueChange={event => field.onChange(event.value == '' ? null : +event.value)}
                                          isAllowed={() => true}
                                        />
                                        {fieldState.error && <span className='text-[12px] text-red-500'>{fieldState.error.message} </span>}
                                      </div>
                                    );
                                  }}
                                />
                              </td>
                              <td className='py-2 px-3 text-center'>
                                <button
                                  onClick={() => removeItem(index)}
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
              <div className='flex-1 flex flex-col items-center justify-center h-full min-h-[300px] gap-4'>
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
      <Popup_dsncc
        dataLang={dataLang}
        nameModel='suppliers'
        listProvince={listProvince}
        listBr={listBranch}
        openExternal={openSupplierPopup}
        onCloseExternal={handleCloseSupplierPopup}
        onRefresh={handleSupplierCreated}
        classNameBtnAdd='hidden'
        // className="hidden"
      />
    </>
  );
};

export default PopupPurchaseBeta;
