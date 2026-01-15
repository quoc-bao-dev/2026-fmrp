import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { ColumnTablePopup, GeneralInformation, HeaderTablePopup } from '@/components/UI/common/TablePopup';
import TagBranch from '@/components/UI/common/Tag/TagBranch';
import CustomAvatar from '@/components/UI/common/user/CustomAvatar';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import PopupCustom from '@/components/UI/popup';
import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate';
import useFeature from '@/hooks/useConfigFeature';
import useSetingServer from '@/hooks/useConfigNumber';
import { formatMoment } from '@/utils/helpers/formatMoment';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import { PopupParent } from '@/utils/lib/Popup';
import { useState } from 'react';
import ModalImage from 'react-modal-image';
import { useInventoryDetail } from '../hooks/useInventoryDetail';
const PopupDetail = props => {
  const [open, sOpen] = useState(false);

  const _ToggleModal = e => sOpen(e);

  const { dataMaterialExpiry, dataProductExpiry, dataProductSerial } = useFeature();

  const dataSeting = useSetingServer();

  // Cài đặt thuộc tính kho từ settings
  const isWarehousePropertiesEnabled = dataSeting?.is_warehouse_properties === '1';
  const warehouseProperties = Array.isArray(dataSeting?.warehouse_properties) ? dataSeting.warehouse_properties : [];
  const warehousePropertyLabels = warehouseProperties.filter(p => ['value_1', 'value_2', 'value_3'].includes(p.name)).map(p => ({ key: p.name, label: p.value }));
  const showWarehouseAttributes = isWarehousePropertiesEnabled;

  const { data, isFetching } = useInventoryDetail(open, props?.id);

  //copy arr
  let listQty = data?.items || [];
  //Tổng số lượng trong kho lúc kiểm kê
  let totalQuantity = listQty?.reduce((acc, item) => acc + parseInt(item?.quantity), 0);
  //Tổng số lượng thực
  let quantity_net = listQty?.reduce((acc, item) => acc + parseInt(item?.quantity_net), 0);
  //Tổng số lượng chênh lệch
  let quantity_diff = listQty?.reduce((acc, item) => acc + parseInt(item?.quantity_diff), 0);
  //Thành tiền
  let amount = listQty?.reduce((acc, item) => acc + parseInt(item?.amount), 0);

  const formatNumber = number => {
    return formatNumberConfig(+number, dataSeting);
  };
  return (
    <>
      <PopupCustom
        title={props.dataLang?.inventory_title_detail || 'inventory_title_detail'}
        button={props?.name}
        onClickOpen={_ToggleModal.bind(this, true)}
        open={open}
        onClose={_ToggleModal.bind(this, false)}
        classNameBtn={props?.className}
      >
        {/* <div className="mt-4 space-x-5 3xl:w-[1250px] 2xl:w-[1100px] w-[1050px] h-auto"> */}
        <div className=' space-x-5 3xl:w-[1250px] 2xl:w-[1100px] w-[1050px] 3xl:h-auto  2xl:h-auto xl:h-[540px] h-[500px] '>
          <div>
            <div className='3xl:w-[1250px] 2xl:w-[1100px] w-[1050px]'>
              <div className='min:h-[170px] h-[72%] max:h-[100px]  overflow-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100'>
                <GeneralInformation {...props} />
                <div className='grid grid-cols-13 gap-2  min-h-[110px] p-2'>
                  <div className='col-span-3'>
                    <div className='my-4 font-medium grid grid-cols-2'>
                      <h3 className='col-span-1 text-[13px]'>{props.dataLang?.inventory_dayvouchers || 'inventory_dayvouchers'}</h3>
                      <h3 className='col-span-1 text-[13px] font-medium'>{data?.date != null ? formatMoment(data?.date, FORMAT_MOMENT.DATE_SLASH_LONG) : ''}</h3>
                    </div>
                    <div className='my-4 font-medium grid grid-cols-2'>
                      <h3 className='col-span-1 text-[13px]'>{props.dataLang?.inventory_vouchercode || 'inventory_vouchercode'}</h3>
                      <h3 className='col-span-1 text-[13px] font-medium'>{data?.code}</h3>
                    </div>
                  </div>
                  <div className='col-span-3 '>
                    <div className='my-4 font-medium grid grid-cols-2'>
                      <h3 className='col-span-1 text-[13px]'>{props.dataLang?.inventory_warehouse || 'inventory_warehouse'}</h3>
                      <h3 className='col-span-1 font-medium text-[13px]'>{data?.warehouse_name}</h3>
                    </div>
                    <div className='my-4 font-medium grid grid-cols-2'>
                      <h3 className='col-span-1 text-[13px]'>{props.dataLang?.inventory_total_item || 'inventory_total_item'}</h3>
                      <h3 className='col-span-1 font-medium text-[13px]'>{formatNumber(data?.total_item)}</h3>
                    </div>
                  </div>
                  <div className='col-span-3'>
                    <div className='my-4 font-medium grid grid-cols-2'>
                      <h3 className='col-span-1 text-[13px]'>{props.dataLang?.inventory_creator || 'inventory_creator'}</h3>
                      <h3 className='flex items-center gap-1 col-span-1 text-[13px]'>
                        <CustomAvatar data={data} profileImage={data?.staff_create_image} fullName={data?.staff_create_name} />
                      </h3>
                    </div>
                    <div className='my-4 font-medium grid grid-cols-2'>
                      <h3 className='col-span-1 text-[13px]'>{props.dataLang?.inventory_status || 'inventory_status'}</h3>
                      <h3 className='col-span-1 cursor-pointer'>
                        <PopupParent
                          className='dropdown-avt '
                          key={data?.staff_create_id}
                          trigger={open => (
                            <span className='border border-orange-500 text-orange-500 p-1 rounded-md text-[13px]'>
                              {' '}
                              {data?.adjusted ? data?.adjusted.split('|||').length + ' ' + ' Điều chỉnh' : ''}
                            </span>
                          )}
                          position='top center'
                          on={['hover']}
                          arrow={false}
                        >
                          <span className='bg-[#003DA0] text-white rounded p-1.5 text-[13px]'>
                            {data?.adjusted
                              ?.split('|||')
                              ?.map(item => item?.split('--')[1])
                              ?.map(e => e)
                              .join(', ')}{' '}
                          </span>
                        </PopupParent>
                      </h3>
                    </div>
                  </div>
                  <div className='col-span-3 '>
                    {/* <div className='my-4 font-medium grid grid-cols-2'><h3 className='col-span-1 text-[13px]'>{props.dataLang?.inventory_note || "inventory_note"}</h3><h3 className='col-span-1 font-normal text-[13px]'>{data?.note}</h3></div> */}
                    <div className='my-4 font-medium grid grid-cols-2'>
                      <h3 className='col-span-1 text-[13px]'>{props.dataLang?.inventory_branch || 'inventory_branch'}</h3>
                      <TagBranch className='w-fit'>{data?.branch_name}</TagBranch>
                    </div>
                  </div>
                </div>
                <div className='pr-2 w-[100%]'>
                  <HeaderTablePopup gridCols={14}>
                    <ColumnTablePopup colSpan={3}>{props.dataLang?.inventory_items || 'inventory_items'}</ColumnTablePopup>
                    <ColumnTablePopup>{'Kho - VTK'}</ColumnTablePopup>
                    <ColumnTablePopup>{props.dataLang?.inventory_unit || 'inventory_unit'}</ColumnTablePopup>
                    <ColumnTablePopup>{props.dataLang?.inventory_unit_price || 'inventory_unit_price'}</ColumnTablePopup>
                    <ColumnTablePopup colSpan={2}>{props.dataLang?.inventory_qty_inventory || 'inventory_qty_inventory'}</ColumnTablePopup>
                    <ColumnTablePopup colSpan={2}>{props.dataLang?.inventory_actual_quantity || 'inventory_actual_quantity'}</ColumnTablePopup>
                    <ColumnTablePopup>{props.dataLang?.inventory_qty_difference || 'inventory_qty_difference'}</ColumnTablePopup>
                    <ColumnTablePopup colSpan={2}>{props.dataLang?.inventory_qty_into_money || 'inventory_qty_into_money'}</ColumnTablePopup>
                    <ColumnTablePopup>{props.dataLang?.inventory_handle || 'inventory_handle'}</ColumnTablePopup>
                  </HeaderTablePopup>
                  {isFetching ? (
                    <Loading className='max-h-28' color='#0f4f9e' />
                  ) : data?.items?.length > 0 ? (
                    <>
                      <Customscrollbar className='min-h-[90px] max-h-[200px] 2xl:max-h-[250px]'>
                        <div className='divide-y divide-slate-200 min:h-[170px]  max:h-[170px]'>
                          {data?.items?.map(e => (
                            <div className='grid grid-cols-14 hover:bg-slate-50 items-center border-b' key={e.id?.toString()}>
                              <h6 className='text-[13px]  px-2 py-2 col-span-3 text-left '>
                                <div className='flex items-center gap-2'>
                                  <div>
                                    {e?.item?.images != null ? (
                                      <ModalImage small={e?.item?.images} large={e?.item?.images} alt='Product Image' className='custom-modal-image object-cover rounded w-[40px] h-[50px] mx-auto' />
                                    ) : (
                                      <div className='w-[40px] h-[50px] object-cover  mx-auto'>
                                        <ModalImage small='/icon/noimagelogo.png' large='/icon/noimagelogo.png' className='w-full h-full rounded object-contain p-1'>
                                          {' '}
                                        </ModalImage>
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <h6 className='text-[13px] text-left font-medium capitalize'>{e?.item?.name}</h6>
                                    <h6 className='text-[13px] text-left font-medium capitalize'>{e?.item?.product_variation}</h6>
                                    <div className='flex items-center font-oblique flex-wrap'>
                                      {dataProductSerial.is_enable === '1' ? (
                                        <div className='flex gap-0.5'>
                                          {/* <h6 className="text-[12px]">Serial:</h6><h6 className="text-[12px]  px-2   w-[full] text-left ">{e.serial == null || e.serial == "" ? "-" : e.serial}</h6>                               */}
                                          <h6 className='text-[11px]'>Serial:</h6>
                                          <h6 className='text-[11px]  px-2   w-[full] text-left '>{e?.serial == null || e?.serial == '' ? '-' : e?.serial}</h6>
                                        </div>
                                      ) : (
                                        ''
                                      )}
                                      {dataMaterialExpiry.is_enable === '1' || dataProductExpiry.is_enable === '1' ? (
                                        <>
                                          <div className='flex gap-0.5'>
                                            <h6 className='text-[11px]'>Lot:</h6> <h6 className='text-[11px]  px-2   w-[full] text-left '>{e?.lot == null || e?.lot == '' ? '-' : e?.lot}</h6>
                                          </div>
                                          <div className='flex gap-0.5'>
                                            <h6 className='text-[11px]'>Date:</h6>{' '}
                                            <h6 className='text-[11px]  px-2   w-[full] text-center '>{e?.expiration_date ? formatMoment(e?.expiration_date, FORMAT_MOMENT.DATE_SLASH_LONG) : '-'}</h6>
                                          </div>
                                        </>
                                      ) : (
                                        ''
                                      )}
                                    </div>
                                    {/* Thuộc tính kho - chỉ hiển thị cho nguyên vật liệu */}
                                    {showWarehouseAttributes && (e?.item?.text_type === 'material' || e?.text_type === 'material') && warehousePropertyLabels.length > 0 && (
                                      <div className='flex flex-col italic'>
                                        {warehousePropertyLabels.map(({ key, label }) => {
                                          const value = e?.[key] ?? e?.item?.[key];
                                          const valueString = value !== undefined && value !== null && value !== '' ? String(value) : '-';
                                          // Nếu cả label và value đều rỗng thì bỏ qua
                                          if (!label) return null;
                                          return (
                                            <div key={key} className='flex items-center gap-1'>
                                              <span className='text-[11px] font-medium text-gray-700 truncate'>{label}:</span>
                                              <span className='text-[11px] text-gray-900 truncate max-w-[120px]'>{valueString}</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </h6>
                              <h6 className='text-[13px]   px-2 py-2 col-span-1 text-left break-words'>
                                <h6 className='font-medium'>{e?.name_location}</h6>
                              </h6>
                              <h6 className='text-[13px]   py-2 col-span-1 font-medium text-center break-words'>{e?.item?.unit_name}</h6>
                              <h6 className='text-[13px]   py-2 col-span-1 font-medium text-center break-words'>{formatNumber(e?.price)}</h6>
                              <h6 className='text-[13px]   py-2 col-span-2 font-medium text-center break-words'>{formatNumber(e?.quantity)}</h6>
                              <h6 className='text-[13px]   py-2 col-span-2 font-medium text-center break-words'>{formatNumber(e?.quantity_net)}</h6>
                              <h6 className='text-[13px]   py-2 col-span-1 font-medium text-center mr-1'>{formatNumber(e?.quantity_diff)}</h6>
                              <h6 className='text-[13px]   py-2 col-span-2 font-medium text-center'>{formatNumber(e?.amount)}</h6>
                              <h6 className={`${e?.handling != '' ? 'text-left text-[13px] px-2 py-1 col-span-1' : 'text-right 2xl:text-[12px] xl:text-[13px] text-[12px]  px-2 py-0.5 col-span-1'}`}>
                                {e?.handling != '' && props.dataLang[e?.handling]} {formatNumber(Math.abs(e?.quantity_diff))}
                              </h6>
                            </div>
                          ))}
                        </div>
                      </Customscrollbar>
                    </>
                  ) : (
                    <NoData />
                  )}
                </div>
                <h2 className='font-medium p-2  border-b border-b-[#E7EAEE]  border-t z-10 border-t-[#E7EAEE] text-[13px] border-opacity-70'>{props.dataLang?.purchase_total || 'purchase_total'}</h2>
                <div className=' mt-2  grid grid-cols-12 flex-col justify-between sticky bottom-0  z-10 '>
                  <div className='col-span-7'>
                    <h3 className='text-[13px] font-medium p-1'>{props.dataLang?.import_from_note || 'import_from_note'}</h3>
                    <textarea
                      className='resize-none text-[13px]  scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 placeholder:text-slate-300 w-[90%] min-h-[90px] max-h-[90px] bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-1 outline-none '
                      disabled
                      value={data?.note}
                    />
                  </div>
                  <div className='col-span-3 space-y-1 text-right'>
                    <div className=' text-left text-[13px] font-medium'>
                      <h3>{props.dataLang?.inventory_total_quantity_inventory || 'inventory_total_quantity_inventory'}</h3>
                    </div>
                    <div className=' text-left text-[13px] font-medium'>
                      <h3>{props.dataLang?.inventory_actual_total_amount || 'inventory_actual_total_amount'}</h3>
                    </div>
                    <div className=' text-left text-[13px] font-medium'>
                      <h3>{props.dataLang?.inventory_total_amount_difference || 'inventory_total_amount_difference'}</h3>
                    </div>
                    <div className=' text-left text-[13px] font-medium'>
                      <h3>{props.dataLang?.inventory_qty_into_money || 'inventory_qty_into_money'}</h3>
                    </div>
                  </div>
                  <div className='col-span-2 space-y-1 text-right'>
                    <div className='font-normal mr-2.5'>
                      <h3 className='text-right text-blue-600 text-[13px]'>{formatNumber(totalQuantity)}</h3>
                    </div>
                    <div className='font-normal mr-2.5'>
                      <h3 className='text-right text-blue-600 text-[13px]'>{formatNumber(quantity_net)}</h3>
                    </div>
                    <div className='font-normal mr-2.5'>
                      <h3 className='text-right text-blue-600 text-[13px]'>{formatNumber(quantity_diff)}</h3>
                    </div>
                    <div className='font-normal mr-2.5'>
                      <h3 className='text-right text-blue-600 text-[13px]'>{formatNumber(amount)}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopupCustom>
    </>
  );
};
export default PopupDetail;
