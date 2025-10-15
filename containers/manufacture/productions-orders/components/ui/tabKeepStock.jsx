import { Customscrollbar } from '@/components/UI/common/Customscrollbar'
import { TagWarehouse } from '@/components/UI/common/Tag/TagWarehouse'
import Loading from '@/components/UI/loading/loading'
import NoData from '@/components/UI/noData/nodata'
import Zoom from '@/components/UI/zoomElement/zoomElement'
import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate'
import useFeature from '@/hooks/useConfigFeature'
import useSetingServer from '@/hooks/useConfigNumber'
import { formatMoment } from '@/utils/helpers/formatMoment'
import formatNumberConfig from '@/utils/helpers/formatnumber'
import { useState } from 'react'
import ModalImage from 'react-modal-image'
import { AnimatePresence, motion } from 'framer-motion'

const TabKeepStock = ({ dataTable, handShowItem, handDeleteItem, isFetching, dataLang }) => {
  const dataSeting = useSetingServer()
  const formatNumber = (num) => formatNumberConfig(+num, dataSeting)
  const { dataMaterialExpiry, dataProductExpiry, dataProductSerial } = useFeature()
  const [isTab, setIsTab] = useState('dataKeepStock')
  
  return (
    <div className="flex flex-col gap-2 mt-2">
      <div className="flex items-center justify-start gap-8">
        <h1 className=" text-[#11315B] font-normal 3xl:text-lg text-base">
          {/* Giữ kho & Mua hàng */}
          {dataLang?.materials_planning_plan_status || 'materials_planning_plan_status'}
        </h1>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsTab('dataKeepStock')}
            className={`${
              isTab === 'dataKeepStock' ? 'border-green-500' : 'border-[#EBFEF2]'
            } bg-[#EBFEF2] border text-[#0BAA2E] py-1 px-[10px] font-normal text-xs w-fit rounded-md  flex gap-1 items-center`}
          >
            {dataLang?.materials_planning_keep_tock || 'materials_planning_keep_tock'}
            <span className="bg-[#0BAA2E] text-white 3xl:px-[8.5px] px-[7px] py-0.5 rounded-full">
              {dataTable?.listDataRight?.dataKeepStock?.length ?? 0}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setIsTab('dataPurchases')}
            className={`${
              isTab === 'dataPurchases' ? 'border-[#EE1E1E]' : 'border-[#FFEEF0]'
            } bg-[#FFEEF0] border text-[#EE1E1E] py-1 px-[10px] font-normal text-xs w-fit rounded-md  flex gap-1 items-center`}
          >
            {'Đơn mua'}
            <span className="bg-[#EE1E1E] text-white 3xl:px-[8.5px] px-[7px] py-0.5 rounded-full">
              {dataTable?.listDataRight?.dataPurchases?.length ?? 0}
            </span>
          </button>
        </div>
      </div>
      {isFetching ? (
        <Loading className="h-80" color="#0f4f9e" />
      ) : dataTable?.listDataRight?.[isTab]?.length > 0 ? (
        <Customscrollbar className="h-full overflow-y-auto  scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 ">
          {dataTable?.listDataRight?.[isTab]?.map((e) => (
            <div key={e.id} className="my-3 border rounded-lg">
              <div className="px-2">
                <div onClick={() => handShowItem(e.id, isTab)} className="cursor-pointer">
                  <div className="flex items-center justify-between my-2">
                    <h3 className="text-[#191D23] font-semibold 3xl:text-base text-sm">{e.title}</h3>
                    <div className="flex items-center gap-6 mr-3">
                      <Zoom whileHover={{ scale: 1.05 }} whileTap={{ scale: 1.08 }} className="w-fit">
                        <h3
                          onClick={(event) => {
                            event.stopPropagation()
                            handShowItem(e.id, isTab)
                          }}
                          className={`cursor-pointer text-[#3276FA] font-normal xl:text-sm text-xs border-b border-[#3276FA] w-fit`}
                        >
                          {e.showChild
                            ? dataLang?.materials_planning_hide || 'materials_planning_hide'
                            : dataLang?.materials_planning_show_more || 'materials_planning_show_more'}
                        </h3>
                      </Zoom>
                      <Zoom whileHover={{ scale: 1.05 }} whileTap={{ scale: 1.08 }} className="w-fit">
                        <h3
                          onClick={(event) => {
                            event.stopPropagation()
                            handDeleteItem(e.id, isTab)
                          }}
                          className="cursor-pointer text-[#EE1E1E] font-normal xl:text-sm text-xs border-b border-[#EE1E1E] w-fit"
                        >
                          {dataLang?.materials_planning_delete || 'materials_planning_delete'}
                        </h3>
                      </Zoom>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 my-2">
                    <h5 className="text-[#3A3E4C] font-normal xl:text-sm text-xs">
                      {e.time}
                      <span className="px-2 text-[#9295A4] font-normal xl:text-sm text-xs">
                        {dataLang?.materials_planning_by || 'materials_planning_by'}
                      </span>
                      <span className="capitalize">{e.user}</span>
                    </h5>
                    {isTab === 'dataKeepStock' && <TagWarehouse data={{ warehouseman_id: e?.warehousemanId }} />}
                  </div>
                  {isTab === 'dataKeepStock' && (
                    <div className="flex items-center gap-5 my-2">
                      <h5 className="text-[#3A3E4C] font-normal xl:text-sm text-xs">
                        <span className="pr-2 text-[#9295A4] font-normal xl:text-sm text-xs">
                          {dataLang?.warehouseTransfer_transferWarehouse || 'warehouseTransfer_transferWarehouse'} :
                        </span>
                        {e.warehouseFrom}
                      </h5>
                      <h5 className="text-[#3A3E4C] font-normal xl:text-sm text-xs">
                        <span className="pr-2 text-[#9295A4] font-normal xl:text-sm text-xs">
                          {dataLang?.warehouseTransfer_receivingWarehouse || 'warehouseTransfer_receivingWarehouse'} :
                        </span>
                        {e.warehouseTo}
                      </h5>
                    </div>
                  )}
                </div>
                <AnimatePresence>
                  {e.showChild && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div
                        className={`grid ${
                          isTab === 'dataPurchases' ? 'grid-cols-10' : 'grid-cols-12'
                        } py-2 bg-[#EEF4FD] rounded`}
                      >
                        <h4 className={`col-span-4 px-4 text-[#344054] font-normal text-xs`}>
                          {dataLang?.inventory_items || 'inventory_items'}
                        </h4>
                        <h4 className="col-span-2 px-4 text-center text-[#344054] font-normal text-xs ">
                          {dataLang?.purchase_unit || 'purchase_unit'}
                        </h4>
                        <h4 className="col-span-2 flex items-center gap-2 justify-center text-[#344054] font-normal text-xs ">
                          {isTab === 'dataKeepStock' &&
                            (dataLang?.materials_planning_quantity_kept || 'materials_planning_quantity_kept')}
                          {isTab === 'dataPurchases' && 'Số lượng đã mua'}
                        </h4>
                        <h4
                          className={`${
                            isTab === 'dataKeepStock' ? 'col-span-2 text-center px-4' : 'col-span-2 text-center px-0'
                          }   text-[#344054] font-normal text-xs`}
                        >
                          {isTab === 'dataKeepStock' &&
                            (dataLang?.warehouseTransfer_rransferPosition || 'warehouseTransfer_rransferPosition')}
                          {isTab === 'dataPurchases' && 'Số lượng đã nhập'}
                        </h4>
                        {isTab === 'dataKeepStock' && (
                          <h4 className={`col-span-2 px-4 text-center text-[#344054] font-normal text-xs`}>
                            {dataLang?.warehouseTransfer_receivingLocation || 'warehouseTransfer_receivingLocation'}
                          </h4>
                        )}
                      </div>
                      <div>
                        {e.arrListData.map((i, index) => (
                          <motion.div
                            key={i.id-index}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.05 }}
                            className={`grid ${
                              isTab === 'dataPurchases' ? 'grid-cols-10' : 'grid-cols-12'
                            }  items-center ${e.arrListData?.length - 1 == index ? '' : 'border-b'} `}
                          >
                            <h4 className="flex items-center col-span-4 gap-2 px-4 py-2">
                              <ModalImage
                                small={i.image}
                                large={i.image}
                                width={36}
                                height={36}
                                alt={i.name}
                                className="object-cover rounded-md min-w-[36px] min-h-[36px] w-[36px] h-[36px] max-w-[36px] max-h-[36px]"
                              />
                              <div className="flex flex-col gap-0.5">
                                <h1 className="text-[#0F4F9E] font-semibold xl:text-sm text-xs">{i.name}</h1>
                                <h1 className="text-[#9295A4] font-normal text-[11px]">
                                  {i.code} - {i.itemVariation}
                                </h1>
                                <div className="flex flex-wrap items-center font-oblique">
                                  {dataProductSerial.is_enable === '1' && (
                                    <div className="flex gap-0.5">
                                      <h6 className="text-[12px]">Serial:</h6>
                                      <h6 className="text-[10px]  px-2   w-[full] text-left ">
                                        {i?.serial == null || i?.serial == '' ? '-' : i?.serial}
                                      </h6>
                                    </div>
                                  )}
                                  {(dataMaterialExpiry.is_enable === '1' || dataProductExpiry.is_enable === '1') && (
                                    <>
                                      <div className="flex gap-0.5">
                                        <h6 className="text-[10px]">Lot:</h6>{' '}
                                        <h6 className="text-[10px]  px-2   w-[full] text-left ">
                                          {i?.lot == null || i?.lot == '' ? '-' : i?.lot}
                                        </h6>
                                      </div>
                                      <div className="flex gap-0.5">
                                        <h6 className="text-[10px]">Date:</h6>{' '}
                                        <h6 className="text-[10px]  px-2   w-[full] text-center ">
                                          {i?.expiration_date
                                            ? formatMoment(i?.expiration_date, FORMAT_MOMENT.DATE_SLASH_LONG)
                                            : '-'}
                                        </h6>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </h4>
                            <h4 className="col-span-2 text-center text-[#52575E] font-normal xl:text-sm text-xs">
                              {i.unit}
                            </h4>
                            <h4 className="col-span-2 text-center text-[#141522] font-semibold xl:text-sm text-xs">
                              {i.quantity > 0 ? formatNumber(i.quantity) : '-'}
                            </h4>
                            {isTab === 'dataKeepStock' && (
                              <>
                                <h4 className="col-span-2 text-center text-[#52575E] font-normal xl:text-sm text-xs">
                                  {i.locationFrom}
                                </h4>
                                <h4 className="col-span-2 text-center text-[#52575E] font-normal xl:text-sm text-xs">
                                  {i.locationTo}
                                </h4>
                              </>
                            )}
                            {isTab === 'dataPurchases' && (
                              <div className="col-span-2 text-center">
                                {i?.quantityImport > 0 ? formatNumber(i?.quantityImport) : '-'}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </Customscrollbar>
      ) : (
        <NoData className="!mt-0" />
      )}
    </div>
  )
}

export default TabKeepStock
