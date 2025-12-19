import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { ColumnTablePopup, HeaderTablePopup } from '@/components/UI/common/TablePopup';
import TagBranch from '@/components/UI/common/Tag/TagBranch';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import PopupCustom from '@/components/UI/popup';
import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate';
import useSetingServer from '@/hooks/useConfigNumber';
import { formatMoment } from '@/utils/helpers/formatMoment';
import formatMoneyConfig from '@/utils/helpers/formatMoney';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import { UserEdit as IconUserEdit } from 'iconsax-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useItemDetail } from '../../hooks/items/useItemDetail';

const Popup_Detail = React.memo(props => {
  const dataSeting = useSetingServer();

  const [open, sOpen] = useState(false);
  const [tab, sTab] = useState(0);

  const _ToggleModal = e => sOpen(e);
  const _HandleSelectTab = e => sTab(e);

  const formatNumber = number => {
    return formatNumberConfig(+number, dataSeting);
  };
  const formatMoney = number => {
    return formatMoneyConfig(+number, dataSeting);
  };

  const { isLoading, isFetching, data: list } = useItemDetail(open, props.id);

  useEffect(() => {
    open && sTab(0);
  }, [open]);

  return (
    <PopupCustom
      title={
        <div>
          Chi tiết nguyên vật liệu{' '}
          <span className='text-blue-fmrp'>
            ({list?.name ? ` ${list.name}` : ''} {list?.code ? ` - ${list.code}` : ''})
          </span>
        </div>
      }
      button={props.children}
      onClickOpen={_ToggleModal.bind(this, true)}
      open={open}
      onClose={_ToggleModal.bind(this, false)}
      classNameBtn={props.classNameBtn}
    >
      <div className='py-4 w-[800px] space-y-5'>
        <div className='flex items-center space-x-4 border-[#E7EAEE] border-opacity-70 border-b-[1px]'>
          <button onClick={_HandleSelectTab.bind(this, 0)} className={`${tab === 0 ? 'text-[#0F4F9E]  border-b-2 border-[#0F4F9E]' : 'hover:text-[#0F4F9E] '}  px-4 py-2 outline-none font-medium`}>
            {props.dataLang?.information || 'information'}
          </button>
          <button onClick={_HandleSelectTab.bind(this, 1)} className={`${tab === 1 ? 'text-[#0F4F9E]  border-b-2 border-[#0F4F9E]' : 'hover:text-[#0F4F9E] '}  px-4 py-2 outline-none font-medium`}>
            {props.dataLang?.category_material_list_variant || 'category_material_list_variant'}
          </button>
        </div>
        {isLoading || isFetching ? (
          <Loading className='h-96' color='#0f4f9e' />
        ) : (
          <React.Fragment>
            {tab === 0 ? (
              <div className='grid grid-cols-2 gap-5'>
                <div className='p-2 space-y-3 rounded-md bg-slate-100/40'>
                  <div className='flex justify-between'>
                    <h5 className='text-slate-400 text-sm w-[40%]'>{props.dataLang?.client_list_brand || 'client_list_brand'}:</h5>
                    <div className='w-[55%] flex flex-col items-end gap-1.5 '>
                      {list?.branch?.map(e => {
                        return (
                          <TagBranch key={e.id.toString()} className='w-fit'>
                            {e.name}
                          </TagBranch>
                        );
                      })}
                    </div>
                  </div>
                  <div className='flex justify-between'>
                    <h5 className='text-slate-400 text-sm w-[40%]'>{props.dataLang?.category_titel || 'category_titel'}:</h5>
                    <h6 className='w-[55%] text-right'>{list?.category_name}</h6>
                  </div>
                  <div className='flex justify-between'>
                    <h5 className='text-slate-400 text-sm w-[40%]'>{props.dataLang?.category_material_list_code || 'category_material_list_code'}:</h5>
                    <h6 className='w-[55%] text-right'>{list?.code}</h6>
                  </div>
                  <div className='flex justify-between'>
                    <h5 className='text-slate-400 text-sm w-[40%]'>{props.dataLang?.category_material_list_name || 'category_material_list_name'}:</h5>
                    <h6 className='w-[55%] text-right'>{list?.name}</h6>
                  </div>
                  <div className='flex justify-between'>
                    <h5 className='text-slate-400 text-sm w-[40%]'>{props.dataLang?.category_material_list_cost_price || 'category_material_list_cost_price'}:</h5>
                    <h6 className='w-[55%] text-right'>{formatMoney(list?.import_price)}</h6>
                  </div>
                  <div className='flex justify-between'>
                    <h5 className='text-slate-400 text-sm w-[40%]'>{props.dataLang?.minimum_amount || 'minimum_amount'}:</h5>
                    <h6 className='w-[55%] text-right'>{formatNumber(list?.minimum_quantity)}</h6>
                  </div>
                  {props.dataMaterialExpiry?.is_enable === '1' ? (
                    <div className='flex justify-between'>
                      <h5 className='text-slate-400 text-sm w-[40%]'>{props.dataLang?.category_material_list_expiry_date || 'category_material_list_expiry_date'}:</h5>
                      <h6 className='w-[55%] text-right'>
                        {Number(list?.expiry).toLocaleString()} {props.dataLang?.date || 'date'}
                      </h6>
                    </div>
                  ) : (
                    ''
                  )}
                  <div className='flex justify-between'>
                    <h5 className='text-slate-400 text-sm w-[40%]'>{props.dataLang?.category_material_list_purchase_unit || 'category_material_list_purchase_unit'}:</h5>
                    <h6 className='w-[55%] text-right'>{list?.unit}</h6>
                  </div>
                  <h5 className='text-slate-400 text-[15px] font-medium'>{props.dataLang?.category_material_list_converting_unit || 'category_material_list_converting_unit'}</h5>
                  <div className='flex justify-between'>
                    <h5 className='text-slate-400 text-sm w-[40%]'>{props.dataLang?.unit || 'unit'}:</h5>
                    <h6 className='w-[55%] text-right'>{list?.unit_convert}</h6>
                  </div>
                  <div className='flex justify-between'>
                    <h5 className='text-slate-400 text-sm w-[40%]'>{props.dataLang?.category_material_list_converting_amount || 'category_material_list_converting_amount'}:</h5>
                    <h6 className='w-[55%] text-right'>{formatNumber(list?.coefficient)}</h6>
                  </div>
                </div>
                <div className='flex flex-col justify-between space-y-3'>
                  <div className='flex p-2 rounded-md bg-slate-100/40'>
                    <h5 className='text-slate-400 text-sm w-[40%]'>{props.dataLang?.avatar || 'avatar'}:</h5>
                    {list?.images == null ? (
                      <img src='/icon/noimagelogo.png' className='object-contain w-48 h-48 rounded pointer-events-none select-none' />
                    ) : (
                      <Image
                        width={200}
                        height={200}
                        quality={100}
                        src={list?.images}
                        alt='thumb type'
                        className='object-contain w-48 h-48 rounded pointer-events-none select-none'
                        loading='lazy'
                        crossOrigin='anonymous'
                        blurDataURL='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
                      />
                    )}
                  </div>
                  <div className='p-2 space-y-3 rounded-md bg-slate-100/40'>
                    <h4 className='flex space-x-2'>
                      <IconUserEdit size={20} />
                      <span className='text-[15px] font-medium'>Người lập phiếu</span>
                    </h4>
                    <div className='flex justify-between'>
                      <h5 className='text-slate-400 text-sm w-[30%]'>{props.dataLang?.creator || 'creator'}:</h5>
                      <h6 className='w-[65%] text-right'>{list?.created_by}</h6>
                    </div>
                    <div className='flex justify-between'>
                      <h5 className='text-slate-400 text-sm w-[30%]'>{props.dataLang?.date_created || 'date_created'}:</h5>
                      <h6 className='w-[65%] text-right'>{formatMoment(list?.date_created, FORMAT_MOMENT.DATE_SLASH_LONG)}</h6>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <React.Fragment>
                {list?.variation?.length > 0 ? (
                  <div className='space-y-2 min-h-[384px]'>
                    <HeaderTablePopup gridCols={list?.variation[1] ? 3 : 2}>
                      <ColumnTablePopup>Hình đại diện</ColumnTablePopup>
                      <ColumnTablePopup>{list?.variation[0]?.name}</ColumnTablePopup>
                      {list?.variation[1] && <ColumnTablePopup>{list?.variation[1]?.name}</ColumnTablePopup>}
                    </HeaderTablePopup>
                    <Customscrollbar className='min-h-[400px] max-h-[450px]'>
                      <div className='divide-y divide-slate-200'>
                        {list?.variation_option_value?.map(e => (
                          <div key={e?.id ? e?.id.toString() : ''} className={`${list?.variation[1] ? 'grid-cols-3' : 'grid-cols-2'} grid gap-2 px-2 py-2.5 hover:bg-slate-50`}>
                            <div className='flex self-center justify-center'>
                              {e?.image == null ? (
                                <img src='/icon/noimagelogo.png' className='object-contain w-auto h-20 rounded pointer-events-none select-none' />
                              ) : (
                                <Image
                                  width={200}
                                  height={200}
                                  quality={100}
                                  src={e?.image}
                                  alt='thumb type'
                                  className='object-contain w-auto h-20 rounded pointer-events-none select-none'
                                  loading='lazy'
                                  crossOrigin='anonymous'
                                  blurDataURL='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
                                />
                              )}
                            </div>
                            <h6 className='self-center px-2 text-xs text-center xl:text-base'>{e?.name}</h6>
                            {e?.variation_option_2?.length > 0 && (
                              <div className='self-center space-y-0.5'>
                                {e?.variation_option_2?.map(ce => (
                                  <React.Fragment key={ce.id?.toString()}>
                                    <h6 className='px-2 text-xs text-center xl:text-base'>{ce.name}</h6>
                                  </React.Fragment>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </Customscrollbar>
                  </div>
                ) : (
                  <NoData />
                )}
              </React.Fragment>
            )}
          </React.Fragment>
        )}
      </div>
    </PopupCustom>
  );
});

export default Popup_Detail;
