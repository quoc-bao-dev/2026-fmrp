import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { ColumnTablePopup, GeneralInformation, HeaderTablePopup } from '@/components/UI/common/TablePopup';
import TagBranch from '@/components/UI/common/Tag/TagBranch';
import { TagWarehouse } from '@/components/UI/common/Tag/TagWarehouse';
import CustomAvatar from '@/components/UI/common/user/CustomAvatar';
import Loading from '@/components/UI/loading/loading';
import ExpandableContent from '@/components/UI/more';
import NoData from '@/components/UI/noData/nodata';
import PopupCustom from '@/components/UI/popup';
import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate';
import LinkWarehouse from '@/containers/manufacture/components/linkWarehouse';
import { useWarehouseProperties } from '@/containers/manufacture/warehouse-transfer/hooks/useWarehouseProperties';
import useFeature from '@/hooks/useConfigFeature';
import useSetingServer from '@/hooks/useConfigNumber';
import { formatMoment } from '@/utils/helpers/formatMoment';
import formatMoneyConfig from '@/utils/helpers/formatMoney';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import { useState } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import ModalImage from 'react-modal-image';
import { useExportToOtherDetail } from '../hooks/useExportToOtherDetail';

const PopupDetail = props => {
  const [open, sOpen] = useState(false);

  const _ToggleModal = e => sOpen(e);

  const dataSeting = useSetingServer();
  const { isWarehousePropertiesEnabled, warehousePropertyLabels } = useWarehouseProperties(dataSeting);

  const { data, isFetching } = useExportToOtherDetail(open, props?.id);

  const { dataMaterialExpiry, dataProductExpiry, dataProductSerial } = useFeature();

  const formatNumber = number => {
    return formatNumberConfig(+number, dataSeting);
  };

  const formatMoney = number => {
    return formatMoneyConfig(+number, dataSeting);
  };

  return (
    <>
      <PopupCustom
        title={props.dataLang?.exportToOthe_detail || 'exportToOthe_detail'}
        button={props?.name}
        onClickOpen={_ToggleModal.bind(this, true)}
        open={open}
        onClose={_ToggleModal.bind(this, false)}
        classNameBtn={props?.className}
      >
        <div className='flex items-center space-x-4 my-2 border-[#E7EAEE] border-opacity-70 border-b-[1px]'></div>
        <div className=' space-x-5 3xl:w-[1200px] 2xl:w-[1150px] w-[1100px] 3xl:h-auto  2xl:h-auto xl:h-[540px] h-[500px] '>
          <div>
            <div className='3xl:w-[1200px] 2xl:w-[1150px] w-[1100px]'>
              <Customscrollbar className='min:h-[170px] h-[72%] max:h-[100px] overflow-auto pb-1'>
                <GeneralInformation {...props} />
                <div className='grid grid-cols-9  min-h-[100px] px-2 items-center bg-zinc-50'>
                  <div className='col-span-3'>
                    <div className='grid grid-cols-2 my-2 font-medium'>
                      <h3 className=' text-[13px] '>{props.dataLang?.import_day_vouchers || 'import_day_vouchers'}</h3>
                      <h3 className=' text-[13px]  font-medium'>{data?.date != null ? formatMoment(data?.date, FORMAT_MOMENT.DATE_SLASH_LONG) : ''}</h3>
                    </div>
                    <div className='grid grid-cols-2 my-2 font-medium'>
                      <h3 className=' text-[13px] '>{props.dataLang?.import_code_vouchers || 'import_code_vouchers'}</h3>
                      <h3 className=' text-[13px]  font-medium text-blue-600 capitalize'>{data?.code}</h3>
                    </div>
                    <div className='grid grid-cols-2 my-2 font-medium'>
                      <h3 className=' text-[13px] '>{props.dataLang?.exportToOthe_object || 'exportToOthe_object'}</h3>
                      <h3 className=' text-[13px]  font-medium text-green-600 capitalize'>{props.dataLang[data?.object_text] || data?.object_text}</h3>
                    </div>
                  </div>
                  <div className='col-span-3'>
                    <div className='grid grid-cols-2 my-2 font-medium'>
                      <h3 className=' text-[13px] '>{props?.dataLang?.production_warehouse_LSX || 'production_warehouse_LSX'}</h3>
                    </div>
                    <div className='grid grid-cols-2 my-2 font-medium'>
                      <h3 className=' text-[13px] '>{props.dataLang?.import_from_browse || 'import_from_browse'}</h3>
                      <div className='flex flex-wrap items-center gap-2 '>
                        <TagWarehouse data={data} />
                      </div>
                    </div>
                    <div className='grid grid-cols-2 my-2 font-medium'>
                      <h3 className='text-[13px]'>{props?.dataLang?.exportToOthe_warehouse || 'exportToOthe_warehouse'}</h3>
                      <h3 className='text-[13px] font-medium capitalize'>
                        <LinkWarehouse open={open} disbleClick={true} warehouse_id={data?.warehouse_id} warehouse_name={data?.warehouse_name} />
                      </h3>
                    </div>
                  </div>
                  <div className='col-span-3 '>
                    <div className='grid grid-cols-2 my-2 font-medium'>
                      <h3 className='text-[13px]'>{props?.dataLang?.production_warehouse_Total_value || 'production_warehouse_Total_value'}</h3>
                      <h3 className='text-[13px] font-medium capitalize'>{formatMoney(data?.amount)}</h3>
                    </div>
                    <div className='grid grid-cols-2 my-2 font-medium'>
                      <h3 className=' text-[13px] '>{props?.dataLang?.production_warehouse_creator || 'production_warehouse_creator'}</h3>
                      <div className='flex items-center gap-2'>
                        <CustomAvatar data={data} profileImage={data?.staff_create?.profile_image} fullName={data?.staff_create?.full_name} />
                      </div>
                    </div>
                    <div className='grid grid-cols-2 my-2 font-medium'>
                      <h3 className='text-[13px]'>{props.dataLang?.import_branch || 'import_branch'}</h3>
                      <TagBranch className='w-fit'>{data?.branch_name}</TagBranch>
                    </div>
                  </div>
                </div>
                <div className=' w-[100%]'>
                  <HeaderTablePopup gridCols={9}>
                    <ColumnTablePopup colSpan={3}>{props.dataLang?.import_detail_items || 'import_detail_items'}</ColumnTablePopup>
                    <ColumnTablePopup>{props.dataLang?.exportToOthe_location || 'exportToOthe_location'}</ColumnTablePopup>
                    <ColumnTablePopup>{'ĐVT'}</ColumnTablePopup>
                    <ColumnTablePopup>{props.dataLang?.production_warehouse_inventory || 'production_warehouse_inventory'}</ColumnTablePopup>
                    <ColumnTablePopup>{props.dataLang?.recall_revenueQty || 'recall_revenueQty'}</ColumnTablePopup>
                    <ColumnTablePopup colSpan={2}>{props.dataLang?.import_from_note || 'import_from_note'}</ColumnTablePopup>
                  </HeaderTablePopup>
                  {isFetching ? (
                    <Loading className='max-h-28' color='#0f4f9e' />
                  ) : data?.items?.length > 0 ? (
                    <Customscrollbar className='min-h-[150px] max-h-[170px] 2xl:max-h-[250px]' alwaysShowScrollbar>
                      <div className='divide-y divide-slate-200 min:h-[170px]  max:h-[170px]'>
                        {data?.items?.map(e => (
                          <div className='grid items-center grid-cols-9 border-b hover:bg-slate-50' key={e.id?.toString()}>
                            <h6 className='text-[13px]  px-2 py-2 col-span-3 text-left '>
                              <div className='flex items-center gap-2'>
                                <div>
                                  {e?.item?.images != null ? (
                                    <ModalImage small={e?.item?.images} large={e?.item?.images} alt='Product Image' className='custom-modal-image object-cover rounded w-[50px] h-[60px] mx-auto' />
                                  ) : (
                                    <div className='w-[50px] h-[60px] object-cover  mx-auto'>
                                      <ModalImage small='/icon/noimagelogo.png' large='/icon/noimagelogo.png' className='object-contain w-full h-full p-1 rounded'>
                                        {' '}
                                      </ModalImage>
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <h6 className='text-[13px] text-left font-medium capitalize'>{e?.item?.name}</h6>
                                  <h6 className='text-[13px] text-left font-medium capitalize'>{e?.item?.product_variation}</h6>
                                  <div className='flex flex-wrap items-center font-oblique'>
                                    {dataProductSerial.is_enable === '1' ? (
                                      <div className='flex gap-0.5'>
                                        <h6 className='text-[12px]'>Serial:</h6>
                                        <h6 className='text-[12px]  px-2   w-[full] text-left '>{e.serial == null || e.serial == '' ? '-' : e.serial}</h6>
                                      </div>
                                    ) : (
                                      ''
                                    )}
                                    {dataMaterialExpiry.is_enable === '1' || dataProductExpiry.is_enable === '1' ? (
                                      <>
                                        <div className='flex gap-0.5'>
                                          <h6 className='text-[12px]'>Lot:</h6> <h6 className='text-[12px]  px-2   w-[full] text-left '>{e.lot == null || e.lot == '' ? '-' : e.lot}</h6>
                                        </div>
                                        <div className='flex gap-0.5'>
                                          <h6 className='text-[12px]'>Hạn sử dụng:</h6>{' '}
                                          <h6 className='text-[12px]  px-2   w-[full] text-center '>{e.expiration_date ? formatMoment(e.expiration_date, FORMAT_MOMENT.DATE_SLASH_LONG) : '-'}</h6>
                                        </div>
                                      </>
                                    ) : (
                                      ''
                                    )}
                                  </div>
                                  {isWarehousePropertiesEnabled && warehousePropertyLabels.length > 0 && e?.item?.text_type === 'material' && (
                                    <div className='flex gap-1 flex-wrap italic'>
                                      {warehousePropertyLabels.map(({ key, label }) => {
                                        if (!label) return null;
                                        const value = e?.item?.[key];
                                        return (
                                          <div key={key} className='flex gap-0.5'>
                                            <h6 className='text-[12px]'>{label}:</h6>
                                            <h6 className='text-[12px]'>{value ?? '-'}</h6>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </h6>
                            <h6 className='text-[13px]   px-2 py-2 col-span-1 text-center break-words'>
                              <h6 className='font-medium'>{e?.warehouse_location?.location_name}</h6>
                            </h6>
                            <h6 className='text-[13px]   py-2 col-span-1 font-medium text-center break-words'>{e?.item?.unit_name}</h6>
                            <h6 className='text-[13px]   py-2 col-span-1 font-medium text-center break-words'>{formatNumber(e?.warehouse_location?.quantity)}</h6>
                            <h6 className='text-[13px]   py-2 col-span-1 font-medium text-center mr-1'>{formatNumber(e?.quantity)}</h6>
                            <h6 className='text-[13px]   py-2 col-span-2 font-medium text-left ml-3.5'>{e?.note != undefined ? <ExpandableContent content={e?.note} /> : ''}</h6>
                          </div>
                        ))}
                      </div>
                    </Customscrollbar>
                  ) : (
                    <NoData />
                  )}
                </div>
                <h2 className='font-medium p-2 text-[13px]  border-[#E7EAEE] border-opacity-70 border-y-[1px]  z-10'>{props.dataLang?.purchase_total || 'purchase_total'}</h2>
                <div className='sticky bottom-0 z-10 grid flex-col justify-between grid-cols-12 mt-2 '>
                  <div className='col-span-7'>
                    <h3 className='text-[13px] p-1'>{props.dataLang?.returns_reason || 'returns_reason'}</h3>
                    <textarea
                      className='resize-none text-[13px] scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 placeholder:text-slate-300 w-[90%] min-h-[90px] max-h-[90px] bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-1 outline-none '
                      disabled
                      value={data?.note}
                    />
                  </div>
                  <div className='col-span-2 space-y-1 text-right'>
                    <div className='font-medium text-left text-[13px]'>
                      <h3>{props?.dataLang?.production_warehouse_totalItem || 'production_warehouse_totalItem'}</h3>
                    </div>
                    <div className='font-medium text-left text-[13px]'>
                      <h3>{props.dataLang?.exportToOthe_totalQuantity || 'exportToOthe_totalQuantity'}</h3>
                    </div>
                  </div>
                  <div className='col-span-3 space-y-1 text-right'>
                    <div className='font-medium mr-2.5'>
                      <h3 className='text-right text-blue-600 text-[13px]'>{formatNumber(data?.items?.length)}</h3>
                    </div>
                    <div className='font-medium mr-2.5'>
                      <h3 className='text-right text-blue-600 text-[13px]'>{formatNumber(data?.items?.reduce((total, item) => total + Number(item.quantity), 0))}</h3>
                    </div>
                  </div>
                </div>
              </Customscrollbar>
            </div>
          </div>
        </div>
      </PopupCustom>
    </>
  );
};
export default PopupDetail;
