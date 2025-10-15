import CalendarBlankIcon from '@/components/icons/common/CalendarBlankIcon'
import IconStar from '@/components/icons/common/IconStar'
import { Customscrollbar } from '@/components/UI/common/Customscrollbar'
import SelectComponent from '@/components/UI/filterComponents/selectComponent'
import useToast from '@/hooks/useToast'
import Image from 'next/image'
import React, { useEffect } from 'react'
import DatePicker from 'react-datepicker'
import { PiHash, PiMapPinLight, PiCaretDownBold } from 'react-icons/pi'
import { twMerge } from 'tailwind-merge'
import { useSelector } from 'react-redux'

const InFo = ({ dataLang, data, listBranch, handleRemoveBtn, isValue, onChangeValue, tab }) => {
  const showToat = useToast()
  const authState = useSelector((state) => state.auth)

  useEffect(() => {
    // Luôn tạo dateRange mới với 3 ngày từ ngày hiện tại
    const today = new Date()
    const endDate = new Date()
    endDate.setDate(today.getDate() + 2)

    // Luôn cập nhật dateRange mới khi component mount
    onChangeValue('dateRange')({ startDate: today, endDate: endDate })

    // Thêm timeout ngắn để đảm bảo dateRange được áp dụng cho table
    setTimeout(() => {
      onChangeValue('dateRange')({ startDate: today, endDate: endDate })
    }, 500)
  }, [])

  useEffect(() => {
    if (authState.branch?.length > 0 && !isValue.idBrach) {
      const firstBranch = {
        value: authState.branch[0].id,
        label: authState.branch[0].name,
      }
      onChangeValue('idBrach')(firstBranch)
    }
  }, [authState.branch])

  const newArray = data.dataProduction.reduce((acc, current) => {
    const existingItem = acc.find((item) => item.idParent == current.idParent)

    if (!existingItem) {
      acc.push(current)
    }

    return acc
  }, [])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3">
        <label htmlFor="" className="text-typo-gray-4 font-normal responsive-text-base flex items-center gap-1">
          <IconStar />
          {dataLang?.production_plan_form_materials_plan_number || 'production_plan_form_materials_plan_number'}{' '}
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder={dataLang?.auto_text || 'Tự động'}
            disabled={true}
            className="border border-border-gray-1 py-[7px] pl-9 pr-3 rounded-lg placeholder:text-typo-gray-2 placeholder:responsive-text-base text-neutral-05 w-full"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-02">
            <PiHash />
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label htmlFor="start" className="responsive-text-base text-typo-gray-4 font-normal flex items-center gap-1">
          <IconStar />
          {dataLang?.production_plan_form_materials_date || 'production_plan_form_materials_date'}
        </label>
        <div className="relative w-full">
          <DatePicker
            id="start"
            dateFormat={'dd/MM/yyyy h:mm aa'}
            calendarClassName="rasta-stripes"
            selected={isValue.date}
            onChange={onChangeValue('date')}
            monthsShown={2}
            showTimeSelect
            timeFormat="p"
            timeIntervals={15}
            isClearable
            clearButtonClassName="hover:scale-110 transition-all duration-150 ease-linear"
            placeholderText={
              dataLang?.production_plan_form_materials_select_date || 'production_plan_form_materials_select_date'
            }
            className={`py-[8px] pl-9 px-3 placeholder:responsive-text-base responsive-text-base placeholder:text-neutral-05 w-full outline-none focus:outline-none focus:border-[#0F4F9E] focus:border-1 border rounded-lg
                        ${isValue.date == null ? 'border-red-500' : 'border-border-gray-1'}`}
          />
          <CalendarBlankIcon className="size-4 absolute left-3 -translate-y-1/2 top-1/2 opacity-60" />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label htmlFor="start" className="responsive-text-base text-typo-gray-4 font-normal flex items-center gap-1">
          <IconStar />
          {dataLang?.production_plan_form_materials_timeline || 'production_plan_form_materials_timeline'}
        </label>
        <div className="relative w-full">
          <DatePicker
            selected={isValue.dateRange.startDate}
            onChange={(dates) => {
              const [start, end] = dates
              onChangeValue('dateRange')({ startDate: start, endDate: end })
            }}
            startDate={isValue.dateRange.startDate}
            endDate={isValue.dateRange.endDate}
            selectsRange
            monthsShown={2}
            shouldCloseOnSelect={false}
            dateFormat={'dd/MM/yyyy'}
            portalId="menu-time"
            isClearable
            clearButtonClassName="hover:scale-110 transition-all duration-150 ease-linear"
            placeholderText={
              dataLang?.production_plan_form_materials_date_to_date || 'production_plan_form_materials_date_to_date'
            }
            className={`${
              isValue.dateRange.startDate == null || isValue.dateRange.endDate == null
                ? 'border-red-500'
                : 'border-border-gray-1'
            } py-[8px] pl-9 px-3 placeholder:responsive-text-base responsive-text-base placeholder:text-[#6b7280] w-full outline-none focus:outline-none focus:border-[#0F4F9E] focus:border-1 border rounded-lg z-[999] `}
          />
          <CalendarBlankIcon className="size-4 absolute left-3 -translate-y-1/2 top-1/2 opacity-60" />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label htmlFor="start" className="responsive-text-base text-typo-gray-4 font-normal flex items-center gap-1">
          <IconStar />
          {dataLang?.production_plan_form_materials_factory_branch ||
            'production_plan_form_materials_factory_branch'}{' '}
        </label>
        <SelectComponent
          placeholder={
            dataLang?.production_plan_form_materials_select_branch || 'production_plan_form_materials_select_branch'
          }
          isClearable={true}
          value={isValue.idBrach}
          onChange={onChangeValue('idBrach')}
          options={listBranch}
          icon={<PiMapPinLight color="#9295A4" className="size-4" />}
          dropdownIcon={<PiCaretDownBold color="#9295A4" className="size-4" />}
          className="w-full rounded-lg cursor-pointer placeholder:responsive-text-base responsive-text-base"
          styles={{
            control: (baseStyles, state) => ({
              ...baseStyles,
              borderColor: state.isFocused ? '#0F4F9E' : isValue.idBrach == null ? '#ef4444' : baseStyles.borderColor,
              borderRadius: '8px',
              '&:hover': {
                borderColor: state.isFocused ? '#0F4F9E' : isValue.idBrach == null ? '#ef4444' : baseStyles.borderColor,
              },
              boxShadow: state.isFocused ? '0 0 0 1px #0F4F9E' : 'none',
            }),
          }}
        />
      </div>

      <div className="flex flex-col gap-3">
        <label htmlFor="start" className="responsive-text-base text-typo-gray-4 font-normal">
          {dataLang?.production_plan_form_materials_options || 'production_plan_form_materials_options'}
        </label>
        <div className="flex items-center gap-8">
          <div className="flex items-center cursor-pointer">
            <input
              id="default-radio-1"
              type="radio"
              value=""
              checked={isValue.order}
              onChange={() => {
                if (tab == 'order') {
                  onChangeValue('order')(!isValue.order)
                  onChangeValue('internalPlan')(false)
                } else {
                  showToat(
                    'error',
                    dataLang?.production_plan_form_materials_cannot_convert ||
                      'production_plan_form_materials_cannot_convert'
                  )
                }
              }}
              name="default-radio1"
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 cursor-pointer focus:ring-0"
            />
            <label
              htmlFor="default-radio-1"
              className="ml-2 cursor-pointer responsive-text-sm font-medium text-[#52575E]"
            >
              {dataLang?.production_plan_gantt_table_order || 'production_plan_gantt_table_order'}
            </label>
          </div>
          <div className="flex items-center cursor-pointer">
            <input
              id="default-radio-2"
              type="radio"
              value=""
              checked={isValue.internalPlan}
              onChange={() => {
                if (tab == 'plan') {
                  onChangeValue('internalPlan')(!isValue.internalPlan)
                  onChangeValue('order')(false)
                } else {
                  showToat(
                    'error',
                    dataLang?.production_plan_form_materials_cannot_convert_order ||
                      'production_plan_form_materials_cannot_convert_order'
                  )
                }
              }}
              name="default-radio2"
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 cursor-pointer focus:ring-0"
            />
            <label
              htmlFor="default-radio-2"
              className="ml-2 cursor-pointer responsive-text-sm font-medium text-[#52575E]"
            >
              {dataLang?.production_plan_gantt_internal || 'production_plan_gantt_internal'}
            </label>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div
          className={twMerge(
            tab == 'order' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600',
            ' px-3 py-1.5 rounded-lg responsive-text-base font-medium shadow-sm text-center w-full'
          )}
        >
          {tab == 'order'
            ? dataLang?.production_plan_gantt_order || 'production_plan_gantt_order'
            : dataLang?.production_plan_gantt_internal || 'production_plan_gantt_internal'}
        </div>

        <div className="bg-gray-50/80 rounded-lg p-3 border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500 font-medium whitespace-nowrap">
              {dataLang?.selected_items || 'Đã chọn'} ({newArray?.length})
            </span>
            {newArray?.length > 1 && (
              <button
                onClick={() => handleRemoveBtn('deleteAll')}
                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 transition-colors duration-200"
              >
                <Image
                  src="/productionPlan/trash-2.png"
                  width={20}
                  height={20}
                  alt="Delete all"
                  className="opacity-70 hover:opacity-100 transition-opacity"
                />
              </button>
            )}
          </div>
          <Customscrollbar className="">
            <div className="flex flex-wrap items-center gap-2">
              {newArray?.map((e) => (
                <button
                  key={e.idParent}
                  onClick={() => handleRemoveBtn(e.idParent)}
                  type="button"
                  className="group flex items-center gap-2 bg-white hover:bg-red-50 px-3 py-2 rounded-lg border border-gray-200 hover:border-red-200 transition-all duration-200"
                >
                  <span className="text-gray-700 font-medium text-sm">{e.nameOrder}</span>
                  <Image
                    alt="Remove"
                    src="/productionPlan/x.png"
                    width={16}
                    height={16}
                    className="opacity-60 group-hover:opacity-100 transition-opacity"
                  />
                </button>
              ))}
            </div>
          </Customscrollbar>
        </div>
      </div>
    </div>
  )
}
export default React.memo(InFo)
