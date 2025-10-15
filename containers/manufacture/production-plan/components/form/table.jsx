import InputCustom from '@/components/common/input/InputCustom'
import CalendarBlankIcon from '@/components/icons/common/CalendarBlankIcon'
import { Customscrollbar } from '@/components/UI/common/Customscrollbar'
import { TagColorRed } from '@/components/UI/common/Tag/TagStatus'
import Loading from '@/components/UI/loading/loading'
import NoData from '@/components/UI/noData/nodata'
import useToast from '@/hooks/useToast'
import formatNumber from '@/utils/helpers/formatnumber'
import { FnlocalStorage } from '@/utils/helpers/localStorage'
import { TickCircle as IconTick } from 'iconsax-react'
import Image from 'next/image'
import React, { useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { IoClose } from 'react-icons/io5'

const Table = ({ dataLang, data, isLoading, handleRemoveItem, handChangeTable, dateRange }) => {
  const showToast = useToast()
  const { getItem } = FnlocalStorage()
  const getLocalStorageTab = getItem('tab')
  
  useEffect(() => {
    if (dateRange?.startDate && dateRange?.endDate && data?.dataProduction?.length > 0) {
      data.dataProduction.forEach(item => {
        handChangeTable(item.idParent, item.id, { startDate: dateRange.startDate, endDate: dateRange.endDate }, 'date')
      })
    }
  }, [])

  useEffect(() => {
    if (dateRange?.startDate && dateRange?.endDate && data?.dataProduction?.length > 0) {
      const startDate = dateRange.startDate
      const endDate = dateRange.endDate
      data.dataProduction.forEach(item => {
        if (item.date?.startDate !== startDate || item.date?.endDate !== endDate) {
          handChangeTable(item.idParent, item.id, { startDate, endDate }, 'date')
        }
      })
    }
  }, [dateRange?.startDate, dateRange?.endDate])

  return (
    <div className="flex flex-col gap-4 2xl:gap-6">
      <h2 className="responsive-text-xl font-medium text-brand-color">Thông tin thành phẩm</h2>
      <div className="flex flex-col">
        <div className="grid grid-cols-30 items-center border-b border-[#F3F3F4] rounded">
          <h3 className="text-[#64748B] col-span-3 py-2 px-2 text-center font-medium responsive-text-sm capitalize flex items-center">
            {getLocalStorageTab == 'order' ? 'Đơn hàng' : 'Kế hoạch nội bộ'}
          </h3>
          <h3 className="text-[#64748B] col-span-7 py-2 px-2 text-left font-medium responsive-text-sm capitalize">
            Thành phẩm
            {/* {dataLang?.production_plan_form_materials_finished_product || 'production_plan_form_materials_finished_product'} */}
          </h3>
          <h3 className="text-[#64748B] col-span-5 py-2 text-center font-medium responsive-text-sm capitalize">
            Định mức BOM
            {/* {dataLang?.production_plan_form_materials_bom_rate || 'production_plan_form_materials_bom_rate'} */}
          </h3>
          <h3 className="text-[#64748B] col-span-2 py-2 px-2 text-center font-medium responsive-text-sm capitalize">
            Đơn vị
            {/* {dataLang?.production_plan_form_materials_unit || 'production_plan_form_materials_unit'} */}
          </h3>
          <h3 className="text-[#64748B] col-span-3 py-2 text-center font-medium responsive-text-sm capitalize">
            Công đoạn
            {/* {dataLang?.production_plan_form_materials_stage || 'production_plan_form_materials_stage'} */}
          </h3>
          <h3 className="text-[#64748B] col-span-3 py-2 text-center font-medium responsive-text-sm capitalize">
            SL Trong kho
            {/* {dataLang?.production_plan_form_materials_in_stock || 'production_plan_form_materials_in_stock'} */}
          </h3>
          <h3 className="text-[#64748B] col-span-3 py-2 px-2 text-center font-medium responsive-text-sm capitalize">
            SL Cần
            {/* {dataLang?.production_plan_form_materials_need || 'production_plan_form_materials_need'} */}
          </h3>
          {/* {/* <h3 className="text-[#64748B] col-span-5 py-2 px-2 text-center font-medium responsive-text-sm capitalize"> */}
          {/* {dataLang?.production_plan_form_materials_timeline || 'production_plan_form_materials_timeline'} */}
          {/* Timeline SX */}
          {/* </h3> */}
          <h3 className="text-[#64748B] col-span-3 py-2 text-center font-medium responsive-text-sm capitalize">
            {dataLang?.production_plan_form_materials_expected || 'production_plan_form_materials_expected'}
          </h3>
          <h3 className="text-[#64748B] col-span-1 py-2 px-2 text-center font-medium responsive-text-sm capitalize">
            {/* {dataLang?.production_plan_form_materials_task || 'production_plan_form_materials_task'} */}
          </h3>
        </div>
        <Customscrollbar className="overflow-y-auto overflow-hidden">
          {isLoading ? (
            <Loading className="h-80" color="#0f4f9e" />
          ) : data.dataProduction?.length > 0 ? (
            data.dataProduction?.map((i, index) => {
              return (
                <div
                  key={i?.id}
                  className={`grid grid-cols-30 items-center border-b border-[#F3F3F4] ${
                    index === data.dataProduction.length - 1 ? 'border-b-0' : ''
                  }`}
                >
                  <h3 className="text-[#64748B] col-span-3 py-2 px-2 text-center font-medium responsive-text-sm capitalize flex items-center">
                    {i?.nameOrder}
                  </h3>
                  <div className="text-[#64748B] col-span-7 py-2 text-center font-medium 3xl:text-sm text-xs capitalize flex items-center gap-2">
                    {i.images != null ? (
                      <Image
                        src={i.images}
                        width={100}
                        height={100}
                        alt={i.name}
                        className="object-cover rounded-md min-w-16 max-w-16 w-16 max-h-16 min-h-16 h-16"
                      />
                    ) : (
                      <Image
                        width={100}
                        height={100}
                        src="/icon/noimagelogo.png"
                        alt="No image"
                        className="object-cover rounded-md min-w-16 max-w-16 w-16 max-h-16 min-h-16 h-16"
                      />
                    )}

                    <div className="flex flex-col gap-1">
                      <h2 className="text-[#000000] responsive-text-sm font-medium text-left">{i?.name}</h2>
                      <h3 className="text-[#9295A4] responsive-text-xs font-normal text-left">
                        {i?.desription} - {i?.productVariation}
                      </h3>
                    </div>
                  </div>
                  <h3 className="py-2 col-span-5 px-3 font-medium mx-auto">
                    {i?.bom == '1' ? (
                      <IconTick className="text-green-500" />
                    ) : (
                      <TagColorRed name={'Biến thể không có BOM'} className="w-fit flex text-center items-center" />
                    )}
                  </h3>
                  <h3 className="text-[#64748B] col-span-2 py-2 text-center font-medium responsive-text-sm capitalize ">
                    {i.unitName}
                  </h3>
                  <h3 className="py-2 col-span-3 font-medium mx-auto">
                    {i?.stage == '1' ? (
                      <IconTick className="text-green-500" />
                    ) : (
                      <TagColorRed name={'Không có CĐ'} className="w-fit text-center flex items-center" />
                    )}
                  </h3>
                  <h3 className="text-[#64748B] col-span-3 py-2 text-center font-medium responsive-text-sm capitalize">
                    {formatNumber(i?.quantityWarehouse)}
                  </h3>
                  <div className="text-[#64748B] col-span-3 py-2 text-center flex items-center justify-center">
                    <InputCustom
                      state={i?.quantityRemaining}
                      setState={(value) => {
                        if (value < 0) {
                          showToast(
                            'error',
                            dataLang?.production_plan_form_materials_qty_needs_to_be_greater ||
                              'production_plan_form_materials_qty_needs_to_be_greater'
                          )
                          return
                        }
                        const numericValue = parseFloat(value) || 0
                        handChangeTable(i.idParent, i.id, numericValue, 'quantityRemaining')
                      }}
                      allowDecimal={true}
                      disabled={false}
                      min={0}
                      step={1}
                      classNameButton="size-5 2xl:size-6"
                      classNameInput={`w-full !responsive-text-sm text-center ${
                        i?.quantityRemaining == null || i?.quantityRemaining === '' || i?.quantityRemaining === 0
                          ? '!border-red-500'
                          : '!border-[#D8DAE5]'
                      }`}
                      className="py-1 px-1 2xl:px-1.5 border-[#DDDDE2]"
                    />
                  </div>
                  {/* <div className="text-[#64748B] col-span-5 py-2 px-1 text-center font-medium 3xl:text-sm text-xs capitalize">
                    <div className="relative w-full">
                      <DatePicker
                        selected={i.date.startDate}
                        onChange={(dates) => {
                          const [start, end] = dates
                          handChangeTable(i.idParent, i.id, { startDate: start, endDate: end }, 'date')
                        }}
                        startDate={i.date.startDate}
                        endDate={i.date.endDate}
                        selectsRange
                        monthsShown={2}
                        shouldCloseOnSelect={false}
                        dateFormat={'dd/MM/yyyy'}
                        portalId="menu-time"
                        isClearable
                        clearButtonClassName="mr-1 mt-2 2xl:mt-2.5 bg-gray-200 hover:bg-gray-300 size-4 my-auto rounded-full transition-all duration-150 ease-linear after:-translate-y-1/2 after:content-[''] after:absolute after:left-1/2 after:top-1/2 after:w-1 after:h-1 after:bg-red-500 after:rounded-full after:-translate-x-1/2 after:translate-y-1/2"
                        placeholderText={
                          dataLang?.production_plan_form_materials_date_to_date ||
                          'production_plan_form_materials_date_to_date'
                        }
                        className={`py-2 pl-5 pr-1 responsive-text-sm placeholder:text-[#6b7280] w-full outline-none focus:outline-none focus:border-[#0F4F9E] focus:border-1 border rounded-[6px]
                                ${
                                  i.date.startDate == null || i.date.endDate == null
                                    ? 'border-red-500'
                                    : 'border-[#E1E1E1]'
                                }  `}
                      />
                      <CalendarBlankIcon className="size-4 absolute left-1 -translate-y-1/2 top-1/2" />
                    </div>
                  </div> */}
                  <h3 className="text-[#64748B] col-span-3 py-2 text-center font-medium responsive-text-sm capitalize px-2">
                    {i?.deliveryDate}
                  </h3>
                  <div className="flex items-center justify-center py-2">
                    <div
                      className="flex items-center justify-center p-1 rounded-full bg-grey-300 hover:bg-gray-300 cursor-pointer"
                      onClick={() => handleRemoveItem(i.id)}
                    >
                      <IoClose className="size-4 text-grey-700" />
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <NoData />
          )}
        </Customscrollbar>
      </div>
    </div>
  )
}
export default React.memo(Table)
