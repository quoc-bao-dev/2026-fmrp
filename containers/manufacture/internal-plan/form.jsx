import apiInternalPlan from '@/Api/apiManufacture/manufacture/internalPlan/apiInternalPlan'
import { Customscrollbar } from '@/components/UI/common/Customscrollbar'
import Loading from '@/components/UI/loading/loading'
import PopupConfim from '@/components/UI/popupConfim/popupConfim'
import ButtonDelete from '@/components/common/orderManagement/ButtonDelete'
import InfoFormLabel from '@/components/common/orderManagement/InfoFormLabel'
import OrderFormTabs from '@/components/common/orderManagement/OrderFormTabs'
import QuantitySelector from '@/components/common/orderManagement/QuantitySelector'
import SelectSearch from '@/components/common/orderManagement/SelectSearch'
import SelectWithRadio from '@/components/common/orderManagement/SelectWithRadio'
import TableHeader from '@/components/common/orderManagement/TableHeader'
import LayoutForm from '@/components/layout/LayoutForm'
import { optionsQuery } from '@/configs/optionsQuery'
import { CONFIRMATION_OF_CHANGES, TITLE_DELETE_ITEMS } from '@/constants/delete/deleteItems'
import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate'
import { useBranchList } from '@/hooks/common/useBranch'
import useSetingServer from '@/hooks/useConfigNumber'
import useStatusExprired from '@/hooks/useStatusExprired'
import useToast from '@/hooks/useToast'
import { useToggle } from '@/hooks/useToggle'
import { routerInternalPlan } from '@/routers/manufacture'
import { isAllowedNumber } from '@/utils/helpers/common'
import { formatMoment } from '@/utils/helpers/formatMoment'
import formatNumberConfig from '@/utils/helpers/formatnumber'
import { useQuery } from '@tanstack/react-query'
import { ConfigProvider, DatePicker as DatePickerAntd, Dropdown } from 'antd'
import viVN from 'antd/lib/locale/vi_VN'
import dayjs from 'dayjs'
import { ArrowDown2 } from 'iconsax-react'
import { debounce } from 'lodash'
import moment from 'moment/moment'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { BsCalendarEvent, BsClipboardCheck } from 'react-icons/bs'
import { CiSearch } from 'react-icons/ci'
import { PiMapPinLight } from 'react-icons/pi'
import { useSelector } from 'react-redux'
import { v4 as uuidv4 } from 'uuid'
import { useInternalPlanItems } from './hooks/useInternalPlanItems'

const initsFetching = {
  onLoading: false,
  onLoadingChild: false,
  onSending: false,
  load: false,
}

const initsErors = {
  errBranch: false,
  errQuantity: false,
  errPlan: false,
  errDate: false,
}

const initsValue = {
  code: '',
  date: new Date(),
  idBranch: null,
  namePlan: '',
  note: '',
  dateAll: null,
}
const InternalPlanForm = (props) => {
  const router = useRouter()

  const isShow = useToast()

  const id = router.query?.id

  const dataLang = props?.dataLang

  const dataSeting = useSetingServer()

  const statusExprired = useStatusExprired()

  const [searchItems, sSearchItems] = useState('')

  const { isOpen, isKeyState, handleQueryId } = useToggle()

  const [fetChingData, sFetchingData] = useState(initsFetching)

  const [idChange, sIdChange] = useState(initsValue)

  const [errors, sErrors] = useState(initsErors)

  const [listData, sListData] = useState([])

  const { data: dataBranch = [] } = useBranchList()

  const { data: dataItems } = useInternalPlanItems(idChange.idBranch, searchItems)

  const formatNumber = (number) => {
    return formatNumberConfig(+number, dataSeting)
  }

  // Gắn chi nhánh đầu tiên vào state idBranch
  //   useEffect(() => {
  //     if (dataBranch.length > 0) {
  //       sIdChange((list) => ({ ...list, idBranch: dataBranch[0] }))
  //     }
  //   }, [dataBranch, router.query])

  const resetAllStates = () => {
    sIdChange(initsValue)
    sErrors(initsErors)
  }

  useEffect(() => {
    router.query && resetAllStates()
  }, [router.query])

  // Tự động chọn chi nhánh đầu tiên từ authState khi component mount
  const { is_admin, branch } = useSelector((state) => state.auth)
  useEffect(() => {
    if (branch?.length > 0 && !idChange.idBranch) {
      const firstBranch = {
        label: branch[0].name,
        value: branch[0].id,
      }
      sIdChange((list) => ({ ...list, idBranch: firstBranch }))
    }
  }, [branch])

  const { isFetching } = useQuery({
    queryKey: ['api_internal_plan_page_detail', id],
    queryFn: async () => {
      const { data } = await apiInternalPlan.apiDetailInternalPlan(id)
      sListData(
        data?.internalPlansItems.map((e) => {
          return {
            id: e?.id,
            idParenBackend: e?.id,
            item: {
              e: e,
              label: `${e?.item_name} <span style={{display: none}}>${
                e?.code + e?.product_variation + e?.text_type + e?.unit_name
              }</span>`,
              value: e?.item_id,
            },
            unit: e?.unit_name,
            quantity: Number(e?.quantity),
            note: e?.note_item,
            date: moment(e?.date_needed).toDate(),
          }
        })
      )
      sIdChange({
        code: data?.internalPlans?.reference_no,
        date: moment(data?.internalPlans?.date).toDate(),
        idBranch: {
          label: data?.internalPlans?.name_branch,
          value: data?.internalPlans?.branch_id,
        },
        namePlan: data?.internalPlans.plan_name,
        note: data?.internalPlans?.note,
      })
    },
    enabled: !!id,
    ...optionsQuery,
  })

  const _HandleSeachApi = debounce(async (inputValue) => {
    try {
      sSearchItems(inputValue)
    } catch (error) {}
  }, 500)

  const handleSaveStatus = () => {
    isKeyState?.sListData([])
    isKeyState?.sId(isKeyState?.value)
    handleQueryId({ status: false })
  }

  const handleCancleStatus = () => {
    isKeyState?.sId({ ...isKeyState?.id })
    handleQueryId({ status: false })
  }

  const checkListData = (value, sListData, sId, id) => {
    handleQueryId({
      status: true,
      initialKey: {
        value,
        sListData,
        sId,
        id,
      },
    })
  }

  const sIdBranch = (e) => {
    sIdChange((list) => ({ ...list, idBranch: e }))
  }

  const checkValue = (data) => {
    sIdChange((e) => ({ ...e, ...data }))
  }

  const handleChangeCode = (value) => {
    checkValue({ code: value.target.value })
  }

  const handleChangeDate = (value) => {
    checkValue({ date: formatMoment(value, FORMAT_MOMENT.DATE_TIME_LONG) })
  }

  const handleStartDate = () => {
    checkValue({ date: new Date() })
  }

  const handleChangeNamePlan = (value) => {
    checkValue({ namePlan: value.target.value })
  }

  const handleChangeNote = (value) => {
    checkValue({ note: value.target.value })
  }

  const handleBranchChange = (value) => {
    if (idChange.idBranch !== value) {
      if (listData?.length > 0) {
        checkListData(value, sListData, sIdBranch, idChange.idBranch)
      } else {
        checkValue({ idBranch: value })
      }
    }
  }

  const handleDateAllChange = (value) => {
    checkValue({ dateAll: value })
    if (listData?.length > 0) {
      const newData = listData.map((e) => ({
        ...e,
        date: value,
      }))
      sListData(newData)
    }
  }

  const _HandleChangeInput = (type, value) => {
    const onChange = {
      code: () => handleChangeCode(value),
      date: () => handleChangeDate(value),
      startDate: () => handleStartDate(),
      namePlan: () => handleChangeNamePlan(value),
      note: () => handleChangeNote(value),
      branch: () => handleBranchChange(value),
      dateAll: () => handleDateAllChange(value),
    }
    onChange[type]?.()
  }

  useEffect(() => {
    if (idChange.idBranch !== null) sErrors((prevErrors) => ({ ...prevErrors, errBranch: false }))
  }, [idChange.idBranch])

  useEffect(() => {
    if (idChange.namePlan !== null) sErrors((prevErrors) => ({ ...prevErrors, errPlan: false }))
  }, [idChange.namePlan])

  const _DataValueItem = (value) => {
    return {
      parent: {
        id: uuidv4(),
        item: value,
        idParenBackend: '',
        unit: value?.e?.unit_name,
        quantity: 1,
        date: idChange.dateAll ? idChange.dateAll : '',
        note: null,
      },
    }
  }

  const _HandleAddParent = (value) => {
    // Tạo Map để tra xem item đã có trong listData chưa
    const selectedValues = value?.map((item) => item?.value) || []

    // Lấy danh sách đã có trong listData
    const existingMap = new Map(
      listData?.map((e) => [e?.item?.value, e]) // tạo map để tra nhanh
    )

    // Danh sách mới: nếu đã có thì dùng lại, nếu chưa có thì tạo mới bằng _DataValueItem
    const updatedList = selectedValues.map((val) => {
      if (existingMap.has(val)) {
        return existingMap.get(val) // dùng lại item cũ
      } else {
        return _DataValueItem(value.find((v) => v?.value === val))?.parent // tạo mới
      }
    })

    sListData(updatedList)
  }

  const _HandleDeleteParent = (parentId) => {
    const newData = listData.filter((e) => e?.id !== parentId)
    sListData([...newData])
  }

  const _HandleChangeChild = (parentId, type, value) => {
    const newData = listData.map((e) => {
      if (e?.id == parentId) {
        switch (type) {
          case 'quantity':
            e.quantity = Number(value?.value)
            break
          case 'increase':
            e.quantity = Number(e?.quantity) + 1
            break
          case 'decrease':
            e.quantity = Number(e?.quantity) - 1
            break
          case 'date':
            e.date = value
            break
          case 'note':
            e.note = value?.target.value
            break
          default:
        }
      }
      return e
    })
    sListData([...newData])
  }

  const selectItemsLabel = (option, isOnTable = false) => (
    <div className="py-1 font-deca">
      <div className="flex items-center gap-3">
        <img
          src={option.e?.images ?? '/icon/noimagelogo.png'}
          alt={option.e?.name}
          className={`xl:size-16 size-12 object-cover rounded-md`}
        />
        <div className="flex flex-col gap-1 3xl:text-[10px] text-[9px]">
          <h3 className={`font-semibold responsive-text-sm truncate ${isOnTable ? 'text-brand-color' : 'text-black'}`}>
            {option.e?.item_name}
          </h3>
          <h3 className={`flex ${isOnTable ? 'text-neutral-03' : 'text-blue-color'}`}>
            {option.e?.code} - {option.e?.product_variation}
          </h3>
          <h5 className="text-neutral-03">
            {dataLang[option.e?.text_type]} {isOnTable && `- ĐVT: ${option.e?.unit_name}`}
          </h5>
        </div>
      </div>
    </div>
  )

  const _HandleSubmit = (e) => {
    e.preventDefault()

    const hasNullQuantity = listData.some((e) => e.quantity == '' || e.quantity == null || e.quantity <= 0)

    const hasNullDate = listData.some((e) => e.date == null || e.date == '')

    const isEmpty = listData?.length == 0

    if (!idChange.idBranch || !idChange.namePlan || hasNullQuantity || isEmpty || hasNullDate) {
      sErrors((e) => ({
        ...e,
        errBranch: !idChange.idBranch,
        errQuantity: hasNullQuantity,
        errPlan: !idChange.namePlan,
        errDate: hasNullDate,
      }))
      if (!idChange.idBranch || !idChange.namePlan) {
        isShow('error', `${dataLang?.required_field_null}`)
      } else if (isEmpty) {
        isShow('error', `Chưa nhập thông tin mặt hàng`)
      } else {
        isShow('error', `${dataLang?.required_field_null}`)
      }
    } else {
      sFetchingData((e) => ({ ...e, onSending: true }))
    }
  }
  const _ServerSending = async () => {
    let formData = new FormData()
    formData.append('reference_no', idChange.code ? idChange.code : '')

    formData.append(
      'date',
      formatMoment(idChange.date, FORMAT_MOMENT.DATE_TIME_LONG)
        ? formatMoment(idChange.date, FORMAT_MOMENT.DATE_TIME_LONG)
        : ''
    )

    formData.append('branch_id', idChange.idBranch?.value ? idChange.idBranch?.value : '')

    formData.append('plan_name', idChange.namePlan ? idChange.namePlan : '')

    formData.append('note', idChange.note ? idChange.note : '')

    listData.forEach((item, index) => {
      formData.append(`items[${index}][id]`, id ? item?.idParenBackend : '')

      formData.append(`items[${index}][item_id]`, item?.item?.value)

      formData.append(`items[${index}][quantity]`, item?.quantity ? item?.quantity : '')

      formData.append(
        `items[${index}][date_needed]`,
        item?.date ? formatMoment(item?.date, FORMAT_MOMENT.DATE_SLASH_LONG) : ''
      )

      formData.append(`items[${index}][note_item]`, item?.note ? item?.note : '')
    })

    const url = id
      ? `/api_web/api_internal_plan/handling/${id}?csrf_protection=true`
      : '/api_web/api_internal_plan/handling?csrf_protection=true'

    try {
      const { isSuccess, message } = await apiInternalPlan.apiHandlingInternalPlan(url, formData)
      if (isSuccess) {
        isShow('success', `${dataLang[message] || message}`)

        resetAllStates()

        sListData([])

        router.push(routerInternalPlan.home)

        sFetchingData((e) => ({ ...e, onSending: false }))
      } else {
        isShow('error', `${dataLang[message] || data?.message}`)
      }
    } catch (error) {
      throw error
    }
  }

  useEffect(() => {
    fetChingData.onSending && _ServerSending()
  }, [fetChingData.onSending])

  // breadcrumb
  const breadcrumbItems = [
    {
      label: `Sản xuất`,
    },
    {
      label: `${dataLang?.internal_plan || 'internal_plan'}`,
      href: '/manufacture/internal-plan',
    },
    {
      label: id
        ? dataLang?.internal_plan_edit || 'internal_plan_edit'
        : dataLang?.internal_plan_add || 'internal_plan_add',
    },
  ]

  return (
    <>
      <LayoutForm
        title={
          id ? dataLang?.internal_plan_edit || 'internal_plan_edit' : dataLang?.internal_plan_add || 'internal_plan_add'
        }
        heading={
          id ? dataLang?.internal_plan_edit || 'internal_plan_edit' : dataLang?.internal_plan_add || 'internal_plan_add'
        }
        breadcrumbItems={breadcrumbItems}
        statusExprired={statusExprired}
        onSave={(e) => _HandleSubmit(e)}
        onExit={() => router.push(routerInternalPlan.home)}
        loading={fetChingData.onSending}
        leftContent={
          <div>
            {/* Left Header */}
            <div className="flex justify-between items-center">
              <div className="w-full 2xl:text-[20px] xl:text-lg font-medium text-brand-color capitalize">
                {dataLang?.import_item_information || 'import_item_information'}
              </div>
              <div className="relative w-full">
                <SelectSearch
                  options={dataItems}
                  onChange={(value) => {
                    _HandleAddParent(value)
                  }}
                  value={listData?.map((e) => e?.item)}
                  formatOptionLabel={(option) => selectItemsLabel(option)}
                  placeholder={dataLang?.returns_items || 'returns_items'}
                />

                <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#1760B9] p-1.5 rounded-lg pointer-events-none">
                  <CiSearch className="text-white responsive-text-lg" />
                </div>
              </div>
            </div>

            {/* Table header */}
            <div className="grid grid-cols-12 gap-6 items-center sticky top-0 py-2 z-10 mt-4 border-b border-gray-100">
              <TableHeader className="col-span-4 text-left">
                {dataLang?.import_from_items || 'import_from_items'}
              </TableHeader>
              <div className="col-span-8">
                <div className="grid grid-cols-4 gap-6">
                  <TableHeader className="col-span-1 text-center">
                    {dataLang?.import_from_quantity || 'import_from_quantity'}
                  </TableHeader>
                  {/* Chọn hàng loạt ngày cần hàng */}
                  <Dropdown
                    overlay={
                      <div className="border px-4 py-5 shadow-lg bg-white rounded-lg">
                        <p className="3xl:text-base 2xl:text-sm text-[12px] font-normal font-deca text-secondary-color-text mb-2">
                          Chọn hoàng loạt ngày cần hàng
                        </p>
                        <ConfigProvider locale={viVN}>
                          <DatePickerAntd
                            className="sales-product-date placeholder:text-secondary-color-text-disabled cursor-pointer"
                            placeholder={'Chọn ngày'}
                            allowClear={false}
                            format="DD/MM/YYYY"
                            suffixIcon={null}
                            value={idChange.dateAll ? dayjs(idChange.dateAll) : null}
                            onChange={(date) => {
                              const dateString = date?.toDate().toString()
                              _HandleChangeInput('dateAll', dateString)
                            }}
                          />
                        </ConfigProvider>
                      </div>
                    }
                    trigger={['click']}
                    placement="bottomCenter"
                    arrow
                  >
                    <div className="inline-flex items-center justify-between cursor-pointer w-[90%]">
                      <TableHeader className="text-start">
                        {dataLang?.internal_plan_dateFrom || 'internal_plan_dateFrom'}
                      </TableHeader>
                      <ArrowDown2 size={16} className="text-neutral-02 font-medium" />
                    </div>
                  </Dropdown>
                  <TableHeader className="col-span-1 text-center">
                    {dataLang?.import_from_note || 'import_from_note'}
                  </TableHeader>
                  <TableHeader className="col-span-1 text-center">
                    {dataLang?.import_from_operation || 'import_from_operation'}
                  </TableHeader>
                </div>
              </div>
            </div>

            <Customscrollbar className="max-h-[780px] overflow-auto pb-2">
              <div className="h-[100%] w-full">
                {isFetching ? (
                  <Loading className="w-full h-10" color="#0f4f9e" />
                ) : (
                  <>
                    {listData?.map((e, index) => {
                      const isLast = index === listData.length - 1

                      return (
                        <div
                          key={e?.id?.toString()}
                          className={`grid items-center grid-cols-12 gap-6 my-1 ${
                            isLast ? '' : 'border-b border-gray-100'
                          }`}
                        >
                          {/* Mặt hàng */}
                          <div className="h-full col-span-4">{selectItemsLabel(e.item, true)}</div>
                          <div className="grid grid-cols-4 gap-6 items-center col-span-8">
                            {/* Số lượng */}
                            <div className="relative col-span-1 py-5">
                              <QuantitySelector
                                ce={e}
                                clsxErrorBorder={`${
                                  errors.errQuantity && (e.quantity === null || e.quantity === '' || e.quantity === 0)
                                    ? 'border-red-500'
                                    : 'focus:border-brand-color hover:border-brand-color border-neutral-N400'
                                } ${
                                  e.quantity === null || e.quantity === '' || e.quantity === 0
                                    ? 'border-red-500 hover:border-red-500 focus:border-red-500'
                                    : ''
                                }`}
                                onValueChange={_HandleChangeChild.bind(this, e.id, 'quantity')}
                                isAllowedNumber={isAllowedNumber}
                                disabledMinus={e.quantity <= 1 || e.quantity === '' || e.quantity === null}
                                onDecrease={_HandleChangeChild.bind(this, e?.id, 'decrease')}
                                onIncrease={_HandleChangeChild.bind(this, e?.id, 'increase')}
                              />
                            </div>
                            {/* Ngày cần hàng */}
                            <div className="flex flex-col items-center justify-center col-span-1 py-3">
                              <ConfigProvider locale={viVN}>
                                <DatePickerAntd
                                  className="sales-product-date placeholder:text-secondary-color-text-disabled cursor-pointer"
                                  status={errors.errDate && (e.date == null || e.date == '') ? 'error' : ''}
                                  allowClear={false}
                                  placeholder={'Chọn ngày'}
                                  format="DD/MM/YYYY"
                                  suffixIcon={null}
                                  value={e.date ? dayjs(e.date) : null}
                                  onChange={(date) => {
                                    const dateString = date?.toDate().toString()
                                    _HandleChangeChild(e?.id, 'date', dateString)
                                  }}
                                />
                              </ConfigProvider>
                            </div>
                            {/* Ghi chú */}
                            <div className="flex items-center justify-center col-span-1 h-8 2xl:h-10 3xl:p-2 p-[2px] border focus:border-brand-color hover:border-brand-color border-neutral-N400 rounded-lg">
                              <input
                                value={e.note}
                                onChange={_HandleChangeChild.bind(this, e.id, 'note')}
                                placeholder={dataLang?.delivery_receipt_note || 'delivery_receipt_note'}
                                type="text"
                                className="pl-2 placeholder:text-slate-300 text-xs px-1 w-full bg-[#ffffff] font-normal outline-none"
                              />
                            </div>
                            {/* Thao tác */}
                            <div className="flex items-center justify-center h-full col-span-1">
                              <ButtonDelete onDelete={_HandleDeleteParent.bind(this, e.id)} />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </>
                )}
              </div>
            </Customscrollbar>
          </div>
        }
        info={
          <OrderFormTabs
            info={
              <div className="flex flex-col gap-3 mt-2">
                {/* Mã chứng từ */}
                <div className="flex flex-col flex-wrap items-center gap-y-3">
                  <InfoFormLabel label={dataLang?.import_code_vouchers || 'import_code_vouchers'} />
                  <div className="w-full relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 text-gray-500">#</span>
                    <input
                      value={idChange.code}
                      onChange={_HandleChangeInput.bind(this, 'code')}
                      name="fname"
                      type="text"
                      placeholder={dataLang?.purchase_order_system_default || 'purchase_order_system_default'}
                      className={`xl1439:text-[15px] xl1439:leading-6 text-[13px] leading-[20px] text-gray-600 font-normal placeholder:text-sm z-10 pl-8 hover:border-[#0F4F9E] focus:border-[#0F4F9E] w-full border border-[#d0d5dd] p-2 rounded-lg outline-none cursor-text`}
                    />
                  </div>
                </div>
                {/* Ngày chứng từ */}
                <div className="flex flex-col flex-wrap items-center gap-y-3">
                  <InfoFormLabel isRequired={true} label={dataLang?.import_day_vouchers || 'import_day_vouchers'} />
                  <div className="relative w-full flex flex-row custom-date-picker date-form">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 text-sm">
                      <BsCalendarEvent color="#7a7a7a" />
                    </span>
                    <ConfigProvider locale={viVN}>
                      <DatePickerAntd
                        className="sales-product-date pl-8 placeholder:text-secondary-color-text-disabled cursor-pointer"
                        allowClear={false}
                        placeholder="Chọn ngày"
                        format="DD/MM/YYYY HH:mm"
                        showTime={{
                          defaultValue: dayjs('00:00', 'HH:mm'),
                          format: 'HH:mm',
                        }}
                        suffixIcon={null}
                        value={dayjs(idChange.date)}
                        onChange={(date) => {
                          if (date) {
                            const dateString = date.toDate().toString()
                            _HandleChangeInput(dateString, 'date')
                            sIdChange((e) => ({ ...e, date: dateString }))
                          }
                        }}
                      />
                    </ConfigProvider>
                  </div>
                </div>
                {/* Tên kế hoạch */}
                <div className="flex flex-col gap-y-2">
                  <div className="flex flex-col flex-wrap items-center gap-y-3">
                    <InfoFormLabel isRequired={true} label={dataLang?.internal_plan_name || 'internal_plan_name'} />
                    <div className="w-full relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-[#7a7a7a] text-sm">
                        <BsClipboardCheck />
                      </span>
                      <input
                        value={idChange.namePlan}
                        onChange={_HandleChangeInput.bind(this, 'namePlan')}
                        name="fname"
                        type="text"
                        placeholder={dataLang?.internal_plan_name || 'internal_plan_name'}
                        className={`xl1439:text-[15px] xl1439:leading-6 text-[13px] leading-[20px] text-gray-600 font-normal placeholder:text-sm z-10 pl-8 w-full border p-2 rounded-lg outline-none cursor-text
                        ${
                          errors.errPlan
                            ? 'border-red-500'
                            : 'hover:border-[#0F4F9E] focus:border-[#0F4F9E] border-[#d0d5dd]'
                        }`}
                      />
                    </div>
                  </div>
                  {errors.errPlan && (
                    <label className="text-sm text-red-500">
                      {dataLang?.internal_plan_errName || 'internal_plan_errName'}
                    </label>
                  )}
                </div>
                {/* Chi nhánh */}
                <SelectWithRadio
                  isRequired={true}
                  label={dataLang?.import_branch || 'import_branch'}
                  placeholderText="Chọn chi nhánh"
                  options={dataBranch}
                  value={idChange.idBranch}
                  onChange={(value) => {
                    const newValue = dataBranch.find((item) => item.value === value)
                    _HandleChangeInput('branch', newValue)
                  }}
                  isError={errors.errBranch}
                  icon={<PiMapPinLight />}
                  errMess={dataLang?.purchase_order_errBranch || 'purchase_order_errBranch'}
                />
              </div>
            }
            note={
              <div className="w-full">
                <div className="responsive-text-base font-normal text-secondary-color-text mb-3 capitalize">
                  {dataLang?.returns_reason || 'returns_reason'}
                </div>
                <textarea
                  value={idChange.note}
                  placeholder={dataLang?.returns_reason || 'returns_reason'}
                  onChange={_HandleChangeInput.bind(this, 'note')}
                  name="fname"
                  type="text"
                  className="focus:border-brand-color border-gray-200 placeholder-secondary-color-text-disabled placeholder:responsive-text-base w-full h-[80px] max-h-[80px] bg-[#ffffff] rounded-lg text-[#52575E] responsive-text-base font-normal px-3 py-2 border outline-none"
                />
              </div>
            }
          />
        }
        total={
          <div className="flex justify-between">
            <div className="font-normal ">
              <h3>{dataLang?.internal_plan_total || 'internal_plan_total'}</h3>
            </div>
            <div className="font-normal">
              <h3 className="text-blue-600">
                {formatNumber(
                  listData?.reduce((accumulator, item) => {
                    return accumulator + item.quantity
                  }, 0)
                )}
              </h3>
            </div>
          </div>
        }
      />
      <PopupConfim
        dataLang={dataLang}
        type="warning"
        title={TITLE_DELETE_ITEMS}
        subtitle={CONFIRMATION_OF_CHANGES}
        isOpen={isOpen}
        nameModel={'change_item'}
        save={handleSaveStatus}
        cancel={handleCancleStatus}
      />
    </>
  )
}

export default InternalPlanForm
