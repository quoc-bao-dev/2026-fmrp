import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { ColumnTablePopup, GeneralInformation, HeaderTablePopup } from '@/components/UI/common/TablePopup';
import TagBranch from '@/components/UI/common/Tag/TagBranch';
import CustomAvatar from '@/components/UI/common/user/CustomAvatar';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate';
import useFeature from '@/hooks/useConfigFeature';
import useSetingServer from '@/hooks/useConfigNumber';
import useToast from '@/hooks/useToast';
import { formatMoment } from '@/utils/helpers/formatMoment';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import { useState } from 'react';
import ModalImage from 'react-modal-image';
import { useCheckQualityDetail } from '../hooks/useCheckQualityDetail';
import PopupCustom from '/components/UI/popup';

const PopupCheckQuality = props => {
  const isShow = useToast();

  const initilaState = {
    open: false,
  };

  const dataSeting = useSetingServer();

  const formatNumber = num => formatNumberConfig(+num, dataSeting);

  const [isState, sIsState] = useState(initilaState);

  const queryState = key => sIsState(prev => ({ ...prev, ...key }));

  const { data, isLoading } = useCheckQualityDetail(isState.open, props?.id);

  const { dataMaterialExpiry, dataProductExpiry, dataProductSerial } = useFeature();

  return (
    <PopupCustom
      title={'Chi tiết kiểm tra chất lượng'}
      button={props?.name}
      onClickOpen={() => queryState({ open: true })}
      open={isState.open}
      onClose={() => queryState({ open: false })}
      classNameBtn={`${props?.className}`}
    >
      <div className='flex items-center space-x-4 my-2 border-[#E7EAEE] border-opacity-70 border-b-[1px]' />

      <div className='3xl:w-[1200px] 2xl:w-[1100px] xl:w-[999px] w-[950px] 3xl:h-auto 2xl:max-h-auto xl:h-auto h-auto '>
        <div className='flex flex-col pb-1 overflow-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100'>
          <GeneralInformation {...props} />
          <div className='grid grid-cols-12 min-h-[100px]'>
            <div className='col-span-4'>
              <div className='grid items-center grid-cols-6 my-3 font-semibold xl:my-4 '>
                <h3 className='3xl:text-[14px] 2xl:text-[13px] xl:text-[12px] text-[11px] col-span-2 whitespace-nowrap '>{'Ngày'}</h3>
                <h3 className='3xl:text-[14px] 2xl:text-[13px] xl:text-[12px] text-[11px] font-medium items-start col-span-4 ml-3'>
                  {data?.qc?.date ? formatMoment(data?.qc?.date, FORMAT_MOMENT.DATE_SLASH_LONG) : ''}
                </h3>
              </div>
              <div className='grid items-center grid-cols-6 my-3 font-semibold xl:my-4 '>
                <h3 className='3xl:text-[14px] 2xl:text-[13px] xl:text-[12px] text-[11px] col-span-2'>{'Số phiếu QC'}</h3>
                <h3 className='3xl:text-[14px] 2xl:text-[13px] xl:text-[12px] text-[11px]  font-medium col-span-2 ml-3'>{data?.qc?.reference_no}</h3>
              </div>
            </div>

            <div className='col-span-4 '>
              <div className='grid items-center grid-cols-6 my-3 font-semibold xl:my-4 '>
                <h3 className='3xl:text-[14px] 2xl:text-[13px] xl:text-[12px] text-[11px] col-span-2'>{'Số LSX chi tiết'}</h3>
                <h3 className='3xl:text-[14px] 2xl:text-[13px] xl:text-[12px] text-[11px]  font-medium col-span-2 ml-3'>{data?.qc?.reference_no_po}</h3>
              </div>
              <div className='grid items-center grid-cols-6 my-3 font-semibold xl:my-4 '>
                <h3 className='3xl:text-[14px] 2xl:text-[13px] xl:text-[12px] text-[11px] col-span-2'>{'Người tạo'}</h3>
                <h3 className='3xl:text-[12px] 2xl:text-[11px] xl:text-[11px] text-[10px] font-normal col-span-4'>
                  <CustomAvatar fullName={data?.qc?.staff_name} profileImage={data?.qc?.profile_image} />
                </h3>
              </div>
            </div>
            <div className='col-span-4 '>
              <div className='grid items-center grid-cols-6 my-3 font-semibold xl:my-4 '>
                <h3 className='3xl:text-[14px] 2xl:text-[13px] xl:text-[12px] text-[11px] col-span-2'>{'Chi nhánh'}</h3>
                <h3 className='3xl:text-[12px] 2xl:text-[11px] xl:text-[11px] text-[10px] font-normal col-span-4'>
                  <TagBranch className='w-fit'>{data?.qc?.name_branch}</TagBranch>
                </h3>
              </div>
              <div className='grid items-center grid-cols-6 my-3 font-semibold xl:my-4 '>
                <h3 className='3xl:text-[14px] 2xl:text-[13px] xl:text-[12px] text-[11px] col-span-2'>{'Số phiếu CK'} :</h3>
                <h3 className='text-[#0F4F9E] 3xl:text-[12px] 2xl:text-[11px] xl:text-[11px] text-[10px] font-medium col-span-4'>{data?.qc?.list_transfer_warehouse?.map(e => e?.code).join(', ')}</h3>
              </div>
            </div>
          </div>
          <div className='w-full pr-2'>
            <HeaderTablePopup gridCols={8} display='grid'>
              <ColumnTablePopup colSpan={2}>Mặt hàng</ColumnTablePopup>
              <ColumnTablePopup colSpan={1}>Kho chọn QC</ColumnTablePopup>
              <ColumnTablePopup colSpan={1}>Vị trí chọn QC</ColumnTablePopup>
              <ColumnTablePopup colSpan={1}>Công đoạn</ColumnTablePopup>
              <ColumnTablePopup colSpan={1}>{'Số lượng QC'}</ColumnTablePopup>
              <ColumnTablePopup colSpan={1}>{'Số lượng đạt'}</ColumnTablePopup>
              <ColumnTablePopup colSpan={1}>{'Số lượng lỗi'}</ColumnTablePopup>
            </HeaderTablePopup>
            {isLoading ? (
              <Loading className='h-20 2xl:h-[160px]' color='#0f4f9e' />
            ) : data?.qc?.items?.length > 0 ? (
              <Customscrollbar className='min-h-[90px] max-h-[170px] 2xl:max-h-[250px] overflow-hidden'>
                <div className='divide-y divide-slate-200 h-[100%]'>
                  {data?.qc?.items?.map(e => (
                    <div className='grid items-center grid-cols-8 py-1.5 px-2 hover:bg-slate-100/40' key={e.id?.toString()}>
                      <h6 className='text-[13px] py-0.5 col-span-2  rounded-md text-left flex items-center gap-2'>
                        {e?.images != null ? (
                          <ModalImage small={e?.images} large={e?.images} alt='Product Image' className='custom-modal-image object-cover rounded w-[50px] h-[60px]' />
                        ) : (
                          // <Lightbox
                          //     small={e?.images ?? "/icon/noimagelogo.png"}
                          //     large={e?.images ?? "/icon/noimagelogo.png"}
                          //     alt="Hello World!"
                          //     onClose={() => {

                          //     }}
                          // />
                          <div className='w-[50px] h-[60px] object-cover  flex items-center justify-center rounded'>
                            <ModalImage small='/icon/noimagelogo.png' large='/icon/noimagelogo.png' className='object-contain w-full h-full p-1 rounded' />
                          </div>
                        )}

                        <div className=''>
                          <h6 className='text-[13px] text-left font-medium capitalize'>{e?.item_name}</h6>
                          <h6 className='text-xs font-medium text-left capitalize'>{e?.item_variation}</h6>
                          <div className='flex flex-wrap items-center font-oblique text-typo-blue-2'>
                            {e?.serial != null && e?.serial != '' && dataProductSerial.is_enable === '1' ? (
                              <div className='flex gap-0.5 '>
                                <h6 className='text-[12px]'>Serial:</h6>
                                <h6 className='text-[12px]  px-2   w-[full] text-left '>{e?.serial == null || e?.serial == '' ? '-' : e?.serial}</h6>
                              </div>
                            ) : (
                              ''
                            )}
                            {dataMaterialExpiry.is_enable === '1' || dataProductExpiry.is_enable === '1' ? (
                              <>
                                {e?.lot && (
                                  <div className='flex gap-0.5'>
                                    <h6 className='text-[12px]'>Lot:</h6> <h6 className='text-[12px]  px-2   w-[full] text-left '>{e?.lot == null || e?.lot == '' ? '-' : e?.lot}</h6>
                                  </div>
                                )}
                                {e?.expiration_date && (
                                  <div className='flex gap-0.5'>
                                    <h6 className='text-[12px]'>Date:</h6>{' '}
                                    <h6 className='text-[12px]  px-2   w-[full] text-center '>{e?.expiration_date ? formatMoment(e?.expiration_date, FORMAT_MOMENT.DATE_SLASH_LONG) : '-'}</h6>
                                  </div>
                                )}
                              </>
                            ) : (
                              ''
                            )}
                          </div>
                        </div>
                      </h6>

                      <h6 className='text-[13px]  px-2 py-0.5 col-span-1  rounded-md text-center break-words'>{e?.name_warehouse}</h6>
                      <h6 className='text-[13px]  px-2 py-0.5 col-span-1  rounded-md text-center'>{e?.name_warehouse_location}</h6>
                      <h6 className='text-[13px]  px-2 py-0.5 col-span-1  rounded-md text-center'>{e?.stage_name}</h6>
                      <h6 className='text-[13px]  px-2 py-0.5 col-span-1  rounded-md text-center'>{e?.quantity > 0 ? formatNumber(e?.quantity) : '-'}</h6>
                      <h6 className='text-[13px]  px-2 py-0.5 col-span-1  rounded-md text-center'>{e?.quantity_success > 0 ? formatNumber(e?.quantity_success) : '-'}</h6>
                      <h6 className='text-[12px] text-red-500 px-2 col-span-1 rounded-md text-center whitespace-normal'>{e?.quantity_error > 0 ? formatNumber(e?.quantity_error) : '-'}</h6>
                    </div>
                  ))}
                </div>
              </Customscrollbar>
            ) : (
              <NoData />
            )}
          </div>
          <h2 className='font-normal p-2 3xl:text-[16px] 2xl:text-[16px] xl:text-[15px] text-[15px] border-[#E7EAEE] border-opacity-70 border-y-[1px]  z-10'>
            {props.dataLang?.purchase_total || 'purchase_total'}
          </h2>

          <div className='grid flex-col justify-between grid-cols-12 mt-2 text-right'>
            <div className='grid grid-cols-7 col-span-7 font-medium text-left'>
              <h3 className='3xl:text-[15px] 2xl:text-[14px] xl:text-[12px] text-[11px] '>{props.dataLang?.price_quote_note || 'price_quote_note'}</h3>
              <h3 className='3xl:text-[15px] 2xl:text-[14px] xl:text-[12px] text-[11px] col-span-5 font-normal rounded-lg'>{data?.qc?.note}</h3>
            </div>
            <div className='col-span-2 space-y-2'>
              <div className='font-normal text-left 3xl:text-[15px] 2xl:text-[14px] xl:text-[12px] text-[11px]'>
                <h3>{'Tổng số lượng QC'}</h3>
              </div>
              <div className='font-normal text-left 3xl:text-[15px] 2xl:text-[14px] xl:text-[12px] text-[11px]'>
                <h3>{'Tổng số lượng đạt'}</h3>
              </div>
              <div className='font-normal text-left 3xl:text-[15px] 2xl:text-[14px] xl:text-[12px] text-[11px]'>
                <h3>{'Tổng số lượng lỗi'}</h3>
              </div>
            </div>
            <div className='col-span-3 space-y-2'>
              <div className='font-normal mr-2.5'>
                <h3 className='text-right text-blue-600 3xl:text-[15px] 2xl:text-[14px] xl:text-[12px] text-[11px]'>{formatNumber(data?.qc?.total_quantity)}</h3>
              </div>
              <div className='font-normal mr-2.5'>
                <h3 className='text-right text-blue-600 3xl:text-[15px] 2xl:text-[14px] xl:text-[12px] text-[11px]'>{formatNumber(data?.qc?.total_quantity_success)}</h3>
              </div>
              <div className='font-normal mr-2.5'>
                <h3 className='text-right text-blue-600 3xl:text-[15px] 2xl:text-[14px] xl:text-[12px] text-[11px]'>{formatNumber(data?.qc?.total_quantity_error)}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PopupCustom>
  );
};
export default PopupCheckQuality;
