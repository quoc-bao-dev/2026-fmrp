import InputCustom from '@/components/common/input/InputCustom'
import CalendarBlankIcon from '@/components/icons/common/CalendarBlankIcon'
import CheckIcon from '@/components/icons/common/CheckIcon'
import CloseXIcon from '@/components/icons/common/CloseXIcon'
import KanbanIcon from '@/components/icons/common/KanbanIcon'
import TrashIcon from '@/components/icons/common/TrashIcon'
import WarningIcon from '@/components/icons/common/WarningIcon'
import ButtonSubmit from '@/components/UI/button/buttonSubmit'
import { Customscrollbar } from '@/components/UI/common/Customscrollbar'
import SelectComponent from '@/components/UI/filterComponents/selectComponent'
import Loading from '@/components/UI/loading/loading'
import NoData from '@/components/UI/noData/nodata'
import PopupCustom from '@/components/UI/popup'
import useFeature from '@/hooks/useConfigFeature'
import useSetingServer from '@/hooks/useConfigNumber'
import useToast from '@/hooks/useToast'
import formatNumberConfig from '@/utils/helpers/formatnumber'
import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import DatePicker from 'react-datepicker'
import { FaCheckCircle } from 'react-icons/fa'
import { PiWarehouseLight } from 'react-icons/pi'
import { useActiveStages } from '../../hooks/useActiveStages'
import { useHandingFinishedStages } from '../../hooks/useHandingFinishedStages'
import { useListFinishedStages } from '../../hooks/useListFinishedStages'
import { useLoadOutOfStock } from '../../hooks/useLoadOutOfStock'
import { PopupOrderCompleted } from './PopupCompleteCommand'

const initialState = {
  open: false,
  objectWareHouse: null,
  dataTableProducts: null,
  dataTableBom: null,
  arrayMoveBom: [],
}

const PopupConfimStage = ({ dataLang, dataRight, refetch: refetchMainTable, typePageMoblie }) => {
  const tableRef = useRef(null)
  const isToast = useToast()
  const tableRefTotal = useRef(null)
  const dataSeting = useSetingServer()

  const [errorNVLData, setErrorNVLData] = useState({ items: [] })
  const [errorNVLDataBefore, setErrorNVLDataBefore] = useState({ items: [] })
  const [isInputPending, setIsInputPending] = useState(false)
  const [isState, setState] = useState(initialState)
  const [isOrderCompleted, setIsOrderCompleted] = useState(false)
  const [activeStep, setActiveStep] = useState({ type: null, item: null })

  const formatNumber = (number) => {
    return formatNumberConfig(+number, dataSeting)
  }

  const queryState = (data) => setState((prev) => ({ ...prev, ...data }))

  const { onGetData, isLoading: isLoadingActiveStages } = useActiveStages()
  const { isLoading: isLoadingSubmit, onSubmit } = useHandingFinishedStages()
  const { dataProductExpiry, dataMaterialExpiry, dataProductSerial } = useFeature()

  const { data, isLoading, refetch } = useListFinishedStages({
    id: dataRight?.idDetailProductionOrder,
    open: isState.open,
  })

  const {
    data: dataLoadOutOfStock,
    isLoading: isLoadingLoadOutOfStock,
    onGetData: onGetDataLoadOutOfStock,
  } = useLoadOutOfStock()

  const resetErrors = () => {
    setErrorNVLData({ items: [] })
    setErrorNVLDataBefore({ items: [] })
  }

  const checkItemFinalStage = isState.dataTableProducts?.data?.items?.some((e) => e?.final_stage == 1)
  const showSerialColumns = checkItemFinalStage && dataProductSerial.is_enable === '1'
  const showExpiryColumns = checkItemFinalStage && dataProductExpiry.is_enable === '1'

  const handleSelectStep = async (type, e, action) => {
    if (action == 'click' && e?.stage_id == activeStep?.item?.stage_id && type == activeStep?.type) return

    resetErrors()
    setActiveStep({ type, item: e })

    const payload = {
      id: dataRight?.idDetailProductionOrder,
      is_product: type == 'TP' ? 1 : 0,
      stage_id: e?.stage_id,
    }

    const r = await onGetData(payload)

    queryState({ dataTableProducts: r, arrayMoveBom: [] })

    onGetBom(
      {
        isProduct: type === 'TP' ? 1 : 0,
        activeStep: {
          type,
          item: e,
        },
        poId: dataRight?.idDetailProductionOrder,
        arrayMoveBom: [],
      },
      r?.data?.items
    )
  }

  const handleSubmit = async () => {
    if (isInputPending) {
      isToast('error', 'Vui lòng đợi xử lý dữ liệu hoàn tất')
      return
    }

    if (!isState.objectWareHouse) {
      isToast('error', 'Vui lòng kiểm tra dữ liệu')
      return
    }

    const r = await onSubmit({
      poId: dataRight?.idDetailProductionOrder,
      objectData: isState,
    })

    if (r?.isSuccess == 1) {
      refetch()
      refetchMainTable()

      if (r?.data?.status_manufacture == '2') {
        // Đóng popup khi đã hoàn thành công đoạn cuối (status_manufacture == '2')
        isToast('success', 'Lệnh sản xuất đã được hoàn thành')
        queryState({ open: false })
        setIsOrderCompleted(false)
      } else {
        queryState({
          open: true,
          dataTableProducts: null,
          dataTableBom: null,
          arrayMoveBom: [],
        })
        handleSelectStep(activeStep?.type, activeStep?.item, 'auto')
      }
    } else if (r?.data?.errors || r?.data?.errors_before) {
      setErrorNVLData({
        items: [...(r?.data?.errors || [])],
      })
      setErrorNVLDataBefore({
        items: [...(r?.data?.errors_before || [])],
      })
    }
  }

  useEffect(() => {
    if (!tableRef?.current || !tableRefTotal?.current) return
    const handleScroll = () => {
      if (tableRef.current && tableRefTotal.current) {
        tableRefTotal.current.scrollLeft = tableRef.current.scrollLeft
      }
    }

    const table = tableRef.current
    table.addEventListener('scroll', handleScroll)
    return () => table.removeEventListener('scroll', handleScroll)
  }, [])

  const { totalQuantity, totalQuantityError, totalQuantityEntered, totalQuantityEnter } = useMemo(() => {
    if (!isState.dataTableProducts?.data?.items?.length) {
      return {
        totalQuantity: 0,
        totalQuantityError: 0,
        totalQuantityEntered: 0,
        totalQuantityEnter: 0
      }
    }

    return {
      totalQuantity: isState.dataTableProducts?.data?.totalQuantityEnterClient || 0,
      totalQuantityError: isState.dataTableProducts?.data?.totalQuantityError || 0,
      totalQuantityEnter: isState.dataTableProducts?.data?.totalQuantityEnter || 0,
      totalQuantityEntered: isState.dataTableProducts?.data?.totalQuantityEntered || 0
    }
  }, [isState.dataTableProducts?.data])

  const updateSerialsGeneric = (item, value, type) => {
    const quantity = value?.floatValue ?? value?.value ?? 0

    if (!showSerialColumns) {
      return {
        ...item,
        [type === 'serialError' ? 'quantityError' : 'quantityEnterClient']: quantity
      }
    }

    let existingSerials = [...(item[type] || [])]

    const getMaxSerial = (list) =>
      list.length > 0
        ? Math.max(...list.map((s) => parseInt(s.value.split('-').pop(), 10)).filter((n) => !isNaN(n)))
        : 0

    const maxSerialFromSerial = getMaxSerial(item.serial || [])
    const maxSerialFromError = getMaxSerial(item.serialError || [])
    const globalMaxSerial = Math.max(maxSerialFromSerial, maxSerialFromError, item?.max_serial_number ?? 0)

    if (quantity > existingSerials.length) {
      const startSerial = globalMaxSerial + 1
      const additionalSerials = [...Array(quantity - existingSerials.length)].map((_, i) => ({
        value: `${item?.ref}-${(startSerial + i).toString().padStart(2, '0')}`,
        isDuplicate: false,
      }))
      existingSerials = [...existingSerials, ...additionalSerials]
    } else if (quantity < existingSerials.length) {
      existingSerials = existingSerials.slice(0, quantity).map((s) => ({ ...s, isDuplicate: false }))
    }

    const valuesList = existingSerials.map((s) => s?.value).filter(Boolean)
    existingSerials = existingSerials.map((s) => ({
      ...s,
      isDuplicate: valuesList.indexOf(s?.value) !== valuesList.lastIndexOf(s?.value),
    }))

    return {
      ...item,
      [type === 'serialError' ? 'quantityError' : 'quantityEnterClient']: quantity,
      [type]: existingSerials,
    }
  }

  const handleChange = ({ table, type, value, row, index }) => {
    setIsInputPending(true)

    if (table === 'product') {
      const quantityEnterClient = 'quantityEnterClient'
      const quantityError = 'quantityError'
      const checkType = [quantityEnterClient, quantityError].includes(type)

      const newData = isState.dataTableProducts?.data?.items?.map((item) => {
        if (item?.poi_id === row?.poi_id) {
          if (checkType) {
            return updateSerialsGeneric(item, value, type === quantityEnterClient ? 'serial' : 'serialError')
          }

          if (type === 'serial' || type === 'serialError') {
            let updatedArray = Array.isArray(item[type]) ? [...item[type]] : []
            updatedArray[index] = { value, isDuplicate: false }

            const valuesList = updatedArray.map((s) => s?.value).filter(Boolean)
            updatedArray = updatedArray.map((s) => ({
              ...s,
              isDuplicate: valuesList.indexOf(s?.value) !== valuesList.lastIndexOf(s?.value),
            }))

            if (updatedArray[index].isDuplicate) {
              isToast('error', `${type === 'serial' ? 'Serial' : 'Serial lỗi'} đã tồn tại!`)
            }

            return { ...item, [type]: updatedArray }
          }

          return { ...item, [type]: checkType ? value?.floatValue : value }
        }
        return item
      })

      queryState({
        dataTableProducts: {
          ...isState.dataTableProducts,
          data: {
            ...isState.dataTableProducts?.data,
            items: newData,
          },
        },
      })

      if (type === 'serial' || type === 'serialError') {
        onGetBom(
          {
            isProduct: activeStep.type === 'TP' ? 1 : 0,
            activeStep: {
              type: activeStep.type,
              item: activeStep.item,
            },
            poId: dataRight?.idDetailProductionOrder,
            arrayMoveBom: isState.arrayMoveBom,
          },
          newData
        )
      } else {
        // Đặt isInputPending về false cho các trường hợp khác như lot, date
        setIsInputPending(false)
      }
    }

    if (table === 'bom' && isState.dataTableBom?.data?.boms) {
      const newData = isState.dataTableBom.data.boms.map((item) => 
        item?._id === row?._id ? { ...item, [type]: value } : item
      )

      queryState({
        dataTableBom: {
          ...isState.dataTableBom,
          data: {
            ...isState.dataTableBom?.data,
            boms: newData,
            bomsClientHistory: newData,
          },
        },
      })
      setIsInputPending(false)
    }
  }

  const handleRemove = (type, row) => {
    if (type === 'bom' && row?.type_bom === 'product_before') {
      isToast('error', 'Đây là thành phẩm công đoạn bước trước, không thể xóa')
      return
    }

    const stateKey = type === 'product' ? 'dataTableProducts' : 'dataTableBom'
    const stateData = type === 'product' ? 'items' : 'boms'

    const newData = isState[stateKey]?.data[stateData]?.filter(
      (item) => (item?.poi_id || item?._id) !== (row?.poi_id || row?._id)
    )

    queryState({
      [stateKey]: {
        ...isState[stateKey],
        data: {
          ...isState[stateKey]?.data,
          [stateData]: newData,
        },
      },
      arrayMoveBom: [...isState.arrayMoveBom, row]
    })

    onGetBom(
      {
        isProduct: type === 'product' ? 1 : 0,
        activeStep: {
          type,
          item: activeStep.item,
        },
        arrayMoveBom: [...isState.arrayMoveBom, row],
        poId: dataRight?.idDetailProductionOrder,
      },
      type === 'product' ? newData : isState.dataTableProducts?.data?.items
    )
  }

  const onGetBom = useCallback(async (object, items) => {
    try {
      const r = await onGetDataLoadOutOfStock({ object, items })

      if (!r?.data?.boms) return

      const check = r.data.boms.map((e) => {
        const existingBom = isState.dataTableBom?.data?.bomsClientHistory?.find(
          (item) => item?.item_id === e?.item_id && item?.pois_id === e?.pois_id
        )

        return {
          ...e,
          warehouseId: existingBom?.warehouseId || e?.list_warehouse_bom,
        }
      })

      queryState({
        dataTableBom: {
          ...r,
          data: {
            ...r?.data,
            boms: check,
            bomsClientHistory: check,
          },
        },
      })
    } catch (error) {
      console.error('Error in onGetBom:', error)
    } finally {
      setIsInputPending(false)
    }
  }, [isState.dataTableProducts, isState.dataTableBom, activeStep])

  const getPriorityItem = (semi, products) => {
    const semiItem = semi?.find((item) => item.active === '0')
    if (semiItem) return { object: semiItem, type: 'BTP' }

    const productItem = products?.find((item) => item.active === '0')
    if (productItem) return { object: productItem, type: 'TP' }

    return null
  }

  useEffect(() => {
    if (isState.open) {
      if (data?.po?.status_manufacture === '2') {
        // Không mở popup khi status_manufacture == '2'
        queryState({ open: false })
        isToast('success', 'Lệnh SX đã được hoàn thành')
      } else {
        setIsOrderCompleted(false)
        const s = getPriorityItem(data?.stage_semi_products || [], data?.stage_products || [])
        if (s) {
          handleSelectStep(s?.type, s?.object, 'auto')
        }
      }
    }
  }, [isState.open, data])

  useEffect(() => {
    if (isState.open) {
      queryState({ ...initialState, open: true })
      return
    }
    queryState({ ...initialState })
    setIsOrderCompleted(false)
  }, [isState.open])

  const handleQuantityChange = async (value, row, type) => {
    try {
      setIsInputPending(true)
      
      const simulatedValue = { floatValue: value }
      const serialType = type === 'quantityEnterClient' ? 'serial' : 'serialError'
      
      const newData = isState.dataTableProducts?.data?.items?.map((item) => {
        if (item?.poi_id === row?.poi_id) {
          return updateSerialsGeneric(item, simulatedValue, serialType)
        }
        return item
      })
      
      queryState({
        dataTableProducts: {
          ...isState.dataTableProducts,
          data: {
            ...isState.dataTableProducts?.data,
            items: newData,
          },
        },
      })
      
      const object = {
        isProduct: activeStep.type === 'TP' ? 1 : 0,
        activeStep: {
          type: activeStep.type,
          item: activeStep.item,
        },
        poId: dataRight?.idDetailProductionOrder,
        arrayMoveBom: isState.arrayMoveBom,
      }
      
      const r = await onGetDataLoadOutOfStock({ object, items: newData })
      
      if (!r?.data?.boms) return

      const check = r.data.boms.map((e) => {
        const existingBom = isState.dataTableBom?.data?.bomsClientHistory?.find(
          (item) => item?.item_id === e?.item_id && item?.pois_id === e?.pois_id
        )

        return {
          ...e,
          warehouseId: existingBom?.warehouseId || e?.list_warehouse_bom,
        }
      })

      queryState({
        dataTableBom: {
          ...r,
          data: {
            ...r?.data,
            boms: check,
            bomsClientHistory: check,
          },
        },
      })
    } catch (error) {
      console.error('Error in handleQuantityChange:', error)
    } finally {
      setIsInputPending(false)
    }
  }

  const getTotals = useMemo(() => {
    if (!isState.dataTableProducts?.data?.items?.length) {
      return {
        totalQuantityEnterClient: 0,
        totalQuantityError: 0,
        totalQuantityEnter: 0,
        totalQuantityEntered: 0
      }
    }

    return isState.dataTableProducts.data.items.reduce(
      (totals, item) => ({
        totalQuantityEnterClient: totals.totalQuantityEnterClient + Number(item?.quantityEnterClient || 0),
        totalQuantityError: totals.totalQuantityError + Number(item?.quantityError || 0),
        totalQuantityEnter: totals.totalQuantityEnter + Number(item?.quantity_enter || 0),
        totalQuantityEntered: totals.totalQuantityEntered + Number(item?.quantity_entered || 0)
      }),
      { totalQuantityEnterClient: 0, totalQuantityError: 0, totalQuantityEnter: 0, totalQuantityEntered: 0 }
    )
  }, [isState.dataTableProducts?.data?.items])

  return (
    <>
      {isOrderCompleted ? (
        <PopupCustom
          onClickOpen={() => {
            if (dataRight?.listDataRight?.statusManufacture === '2') {
              isToast('error', 'Lệnh SX đã được hoàn thành')
              return
            }
            queryState({ open: true })
          }}
          lockScroll={true}
          open={isState.open}
        >
          <PopupOrderCompleted
            className={'!p-6'}
            onClose={() => {
              setIsOrderCompleted(false)
              queryState({ open: false })
            }}
          />
        </PopupCustom>
      ) : (
        <PopupCustom
          title={
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-1">
                <h2 className="responsive-text-2xl font-bold text-neutral-07">Hoàn thành chi tiết công đoạn</h2>
                <span className="text-typo-blue-4 responsive-text-base">
                  (Số lệnh sản xuất: {data?.po?.reference_no})
                </span>
              </div>
              <div className="mr-8">
                <ButtonSubmit
                  loading={isLoadingSubmit}
                  title="Xác nhận"
                  onClick={handleSubmit}
                  icon={<CheckIcon className="size-4" />}
                  className={`py-2.5 2xl:py-3 px-3 2xl:px-4 text-white rounded-lg !responsive-text-base flex items-center gap-2
                  ${
                    isState.objectWareHouse && !isInputPending
                      ? 'bg-typo-blue-4'
                      : 'bg-neutral-02 hover:bg-neutral-02 !cursor-not-allowed'
                  }
                 `}
                />
              </div>
            </div>
          }
          classNameModeltime="px-6 2xl:px-10 3xl:px-12 py-4 2xl:py-5 3xl:py-6 flex flex-col gap-6"
          button={
            <div className="flex items-center gap-2 w-full">
              <span className="3xl:size-5 size-4 text-[#0375F3] shrink-0">
                <KanbanIcon className="size-full" />
              </span>
              <span className="3xl:text-base text-sm font-normal text-[#101828] text-left">Hoàn thành chi tiết CĐ</span>
            </div>
          }
          classNameBtn={'!w-full'}
          onClickOpen={() => {
            if (dataRight?.listDataRight?.statusManufacture === '2') {
              isToast('error', 'Lệnh SX đã được hoàn thành')
              return
            }
            queryState({ open: true })
          }}
          lockScroll={true}
          open={isState.open}
          classNameIconClose="size-8 bg-white hover:bg-slate-200 text-[#9295A4] hover:text-slate-800"
          onClose={() => {
            resetErrors()
            queryState({ open: false })
          }}
        >
          <div className="w-[90vw] xl:h-[80vh] h-[575px] overflow-">
            <div className="grid grid-cols-16 h-full gap-4">
              {/* Left Panels */}
              <div className="flex col-span-3 max-h-full min-h-0">
                <div className="flex flex-col h-full max-h-full border border-primary-05 rounded-lg flex-1">
                  {/* Công đoạn BTP */}
                  {data?.stage_semi_products?.length > 0 && (
                    <div className="flex-1 border-b border-primary-05">
                      <div className="p-3 font-medium responsive-text-base border-b border-primary-05">
                        Công đoạn BTP
                      </div>
                      <Customscrollbar className="hover:overflow-y-auto overflow-y-hidden">
                        {data?.stage_semi_products?.length > 0 ? (
                          data?.stage_semi_products?.map((e) => (
                            <li
                              key={e?.stage_id}
                              onClick={() => handleSelectStep('BTP', e, 'click')}
                              className={`p-3 cursor-pointer ${
                                activeStep.type == 'BTP' && activeStep?.item?.stage_id == e?.stage_id
                                  ? 'bg-gradient-to-r from-[#0375F336] to-[#C4C4C400] border-l-4 border-[#0375F3]'
                                  : 'hover:bg-gray-100'
                              } ${
                                e?.active == '1' ? 'text-typo-blue-4' : 'text-gray-500'
                              } responsive-text-base list-none flex items-center gap-2 transition-all duration-200 ease-linear select-none`}
                            >
                              <div className="min-w-[16px] flex items-center justify-center">
                                {e?.active == '1' ? (
                                  <FaCheckCircle size="16" className="text-typo-blue-4" />
                                ) : (
                                  <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                )}
                              </div>
                              <p>{e?.name_stage}</p>
                            </li>
                          ))
                        ) : (
                          <NoData classNameTitle="!text-[13px]" />
                        )}
                      </Customscrollbar>
                    </div>
                  )}

                  {/* Công đoạn TP */}
                  {data?.stage_products?.length > 0 && (
                    <div className="flex-1">
                      <div className="p-3 font-medium responsive-text-base border-b border-primary-05">
                        Công đoạn TP
                      </div>
                      <Customscrollbar className="hover:overflow-y-auto overflow-y-hidden">
                        {data?.stage_products?.length > 0 ? (
                          data?.stage_products?.map((e) => (
                            <li
                              key={e?.stage_id}
                              onClick={() => handleSelectStep('TP', e, 'click')}
                              className={`p-3 cursor-pointer ${
                                activeStep.type == 'TP' && activeStep?.item?.stage_id == e?.stage_id
                                  ? 'bg-gradient-to-r from-[#0375F336] to-[#C4C4C400] border-l-4 border-[#0375F3]'
                                  : 'hover:bg-gray-100 '
                              } ${
                                e?.active == '1' ? 'text-typo-blue-4' : 'text-gray-500'
                              } responsive-text-base list-none flex items-center gap-2 transition-all duration-150 ease-linear select-none`}
                            >
                              <div className="min-w-[16px] flex items-center justify-center">
                                {e?.active == '1' ? (
                                  <FaCheckCircle size="16" className="text-typo-blue-4" />
                                ) : (
                                  <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                                )}
                              </div>
                              <p>{e?.name_stage}</p>
                            </li>
                          ))
                        ) : (
                          <NoData classNameTitle="!text-[13px]" />
                        )}
                      </Customscrollbar>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Panel */}
              <div className="col-span-13 flex flex-col gap-2">
                {errorNVLData && errorNVLData?.items?.length > 0 && (
                  <div className="py-2 px-3 flex flex-col gap-2 bg-[#FFEEF0] border border-[#991B1B] rounded-lg">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <WarningIcon className="size-5" />
                        <h3 className="text-sm font-normal text-neutral-07">
                          <span className="font-semibold text-[#EE1E1E]">{errorNVLData.items.length}</span> nguyên vật
                          liệu dưới đây chưa được xuất kho, vui lòng xuất trước khi hoàn thành!
                        </h3>
                      </div>
                      <CloseXIcon className="size-5 cursor-pointer" onClick={() => setErrorNVLData({ items: [] })} />
                    </div>
                    <div className="flex flex-col gap-1">
                      {errorNVLData.items.map((item, index) => (
                        <div key={index} className="px-3 py-1 flex items-center justify-between gap-1">
                          <div className="flex items-center gap-2">
                            <Image
                              src={item.images || '/icon/default/default.png'}
                              alt="default"
                              width={36}
                              height={36}
                              className="object-cover rounded"
                            />
                            <div className="flex flex-col gap-0.5">
                              <h3 className="text-sm font-semibold text-neutral-07">{item.item_name}</h3>
                              <p className="text-xs font-normal text-neutral-03">{item.product_variation}</p>
                            </div>
                          </div>
                          <p className="text-sm font-normal text-neutral-07">
                            <span className="text-lg font-medium text-[#EE1E1E]">
                              {formatNumber(item.quantity_missing)}
                            </span>
                            /{item.unit_name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {errorNVLDataBefore && errorNVLDataBefore?.items?.length > 0 && (
                  <div className="py-2 px-3 flex flex-col gap-2 bg-[#FFEEF0] border border-[#991B1B] rounded-lg">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <WarningIcon className="size-5" />
                        <h3 className="text-sm font-normal text-neutral-07">
                          <span className="font-semibold text-[#EE1E1E]">{errorNVLDataBefore.items.length}</span> nguyên
                          liệu dưới đây chưa được hoàn thành ở bước trước, vui lòng hoàn thành trước khi đến bước này!
                        </h3>
                      </div>
                      <CloseXIcon
                        className="size-5 cursor-pointer"
                        onClick={() => setErrorNVLDataBefore({ items: [] })}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      {errorNVLDataBefore.items.map((item, index) => (
                        <div key={index} className="px-3 py-1 flex items-center justify-between gap-1">
                          <div className="flex items-center gap-2">
                            <Image
                              src={item.images || '/icon/default/default.png'}
                              alt="default"
                              width={36}
                              height={36}
                              className="object-cover rounded"
                            />
                            <div className="flex flex-col gap-0.5">
                              <h3 className="text-sm font-semibold text-neutral-07">
                                {item.item_name} - <span className="responsive-text-base font-medium text-neutral-03">({item.stage_name})</span>
                              </h3>
                              <p className="text-xs font-normal text-neutral-03">{item.product_variation}</p>
                              <p className="responsive-text-xs font-normal text-typo-blue-2">{item.reference_no_detail}</p>
                            </div>
                          </div>
                          <p className="text-sm font-normal text-neutral-07">
                            <span className="text-lg font-medium text-[#EE1E1E]">
                              {formatNumber(item.quantity_missing)}
                            </span>
                            /{item.unit_name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex col-span-13 h-full w-full max-h-full overflow-auto">
                  <div className="flex flex-col gap-6 max-h-full w-full">
                    {/* Nhập thành phẩm */}
                    <div className="flex items-center justify-between">
                      <div className="responsive-text-xl font-normal">Nhập thành phẩm</div>
                      <div className="w-1/3 m-0.5">
                        <SelectComponent
                          options={data?.warehouses || []}
                          onChange={(e) => queryState({ objectWareHouse: e })}
                          value={isState.objectWareHouse}
                          isClearable={true}
                          icon={<PiWarehouseLight color="#9295A4" className="size-4" />}
                          closeMenuOnSelect={true}
                          hideSelectedOptions={false}
                          placeholder={'Kho thành phẩm'}
                          styles={{
                            control: (base, state) => ({
                              ...base,
                              borderColor: state.isFocused
                                ? '#0F4F9E'
                                : isState.objectWareHouse == null
                                ? '#ef4444'
                                : base.borderColor,
                              borderRadius: '8px',
                              '&:hover': {
                                borderColor: state.isFocused
                                  ? '#0F4F9E'
                                  : isState.objectWareHouse == null
                                  ? '#ef4444'
                                  : base.borderColor,
                              },
                            }),
                          }}
                          isSearchable={true}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col overflow-hidden flex-1">
                      <div className="grid grid-cols-25 items-center border-b border-[#F3F3F4]">
                        <h3 className="col-span-1 responsive-text-sm text-neutral-02 py-2 px-1 font-semibold text-center">
                          STT
                        </h3>
                        <h3
                          className={`responsive-text-sm text-neutral-02 p-2 font-semibold ${
                            showExpiryColumns || showSerialColumns ? 'col-span-4' : 'col-span-6'
                          }`}
                        >
                          Mặt hàng
                        </h3>
                        <h3 className="col-span-2 responsive-text-sm text-neutral-02 font-semibold ">Đơn vị tính</h3>
                        <h3
                          className={`responsive-text-sm text-neutral-02 p-2 font-semibold text-center
                              ${showExpiryColumns || showSerialColumns ? 'col-span-3' : 'col-span-4'}
                              `}
                        >
                          SL hoàn thành
                        </h3>
                        {showSerialColumns && (
                          <div className="col-span-3 responsive-text-sm text-neutral-02 text-center font-semibold">
                            Serial hoàn thành
                          </div>
                        )}
                        <div
                          className={`responsive-text-sm text-neutral-02 p-2 font-semibold text-center
                              ${showExpiryColumns || showSerialColumns ? 'col-span-3' : 'col-span-4'}
                              `}
                        >
                          SL lỗi
                        </div>
                        {showSerialColumns && (
                          <div className="col-span-3 responsive-text-sm text-neutral-02 p-2 text-center font-semibold">
                            Serial lỗi
                          </div>
                        )}
                        {showExpiryColumns && (
                          <>
                            <div className="col-span-3 responsive-text-sm text-neutral-02 p-2 font-semibold">Lot</div>
                            <div className="col-span-3 responsive-text-sm text-neutral-02 p-2 font-semibold">
                              {dataLang?.warehouses_detail_date ?? 'warehouses_detail_date'}
                            </div>
                          </>
                        )}
                        <div
                          className={`whitespace-nowrap text-center responsive-text-sm text-neutral-02 font-semibold
                              ${showExpiryColumns || showSerialColumns ? 'col-span-2' : 'col-span-3 p-2'}
                              `}
                        >
                          SL cần nhập
                        </div>
                        <div
                          className={`whitespace-nowrap text-center responsive-text-sm text-neutral-02 p-1 font-semibold
                              ${showExpiryColumns || showSerialColumns ? 'col-span-2' : 'col-span-3'}
                              `}
                        >
                          SL đã nhập
                        </div>
                        <div className="col-span-2 responsive-text-sm text-neutral-02 text-center font-semibold ">
                          Thao tác
                        </div>
                      </div>
                      <Customscrollbar className="flex-1 max-h-full">
                        {isLoadingActiveStages && activeStep.type == 'TP' ? (
                          <div className="flex justify-center items-center h-40">
                            <Loading className="!h-[100px] w-full mx-auto" />
                          </div>
                        ) : isState.dataTableProducts?.data?.items?.length > 0 ? (
                          isState.dataTableProducts?.data?.items?.map((row, index) => (
                            <div className="grid grid-cols-25 items-center h-full" key={index}>
                              <div className="col-span-1 py-2 px-1 flex justify-center items-center">
                                <p className="responsive-text-sm text-neutral-07 font-semibold">{index + 1}</p>
                              </div>
                              <div
                                className={`flex gap-2 p-2 ${
                                  showExpiryColumns || showSerialColumns ? 'col-span-4' : 'col-span-6'
                                }`}
                              >
                                <Image
                                  src={row?.images ? row?.images : '/icon/noimagelogo.png'}
                                  width={100}
                                  height={100}
                                  alt={row?.images ? row?.images : '/icon/noimagelogo.png'}
                                  className="object-cover rounded-md min-w-10 min-h-10 w-10 h-10 max-w-10 max-h-10"
                                />
                                <div className="flex flex-col gap-1">
                                  <p className="responsive-text-sm text-neutral-07 font-semibold">{row?.item_name}</p>
                                  <p className="responsive-text-xs text-neutral-03 font-normal">
                                    {row?.product_variation}
                                  </p>
                                  <p className="responsive-text-xs text-typo-blue-2 font-normal">
                                    {row?.reference_no_detail}
                                  </p>
                                </div>
                              </div>

                              <h3 className="col-span-2 p-2 responsive-text-sm text-neutral-07 font-semibold">
                                {row?.unit_name}
                              </h3>
                              <div
                                className={`p-2 ${
                                  showExpiryColumns || showSerialColumns ? 'col-span-3' : 'col-span-4'
                                }`}
                              >
                                <InputCustom
                                  state={row?.quantityEnterClient || 0}
                                  setState={(value) => handleQuantityChange(value, row, 'quantityEnterClient')}
                                  className={`${
                                    !row?.quantityEnterClient && !row?.quantityError
                                      ? '!border-red-500'
                                      : '!border-gray-200'
                                  } !w-full p-1`}
                                  classNameInput="w-full !responsive-text-sm"
                                  classNameButton="size-6 2xl:size-8"
                                  min={0}
                                  max={Infinity}
                                  disabled={false}
                                  isError={false}
                                  step={1}
                                  debounceTime={500}
                                />
                              </div>
                              {showSerialColumns && (
                                <Customscrollbar
                                  className={`col-span-3 py-2 ${
                                    isState.dataTableProducts?.data?.items?.length <= 1
                                      ? 'max-h-[calc(80vh-136px)]'
                                      : 'max-h-60'
                                  }`}
                                >
                                  {showSerialColumns ? (
                                    <div className="flex flex-col gap-1">
                                      {[...Array(Math.ceil(Math.max(0, Number(row?.quantityEnterClient) || 0)))].map(
                                        (_, sIndex) => {
                                          return (
                                            <input
                                              key={sIndex}
                                              value={row.serial?.[sIndex]?.value || ''}
                                              onChange={(e) => {
                                                handleChange({
                                                  table: 'product',
                                                  type: 'serial',
                                                  value: e.target.value.trim(),
                                                  row,
                                                  index: sIndex,
                                                })
                                              }}
                                              className={`border text-center py-1 px-1 w-full focus:outline-none rounded-md responsive-text-sm text-neutral-07 font-medium ${
                                                row.serial?.[sIndex]?.isDuplicate ? 'border-red-500' : 'border-gray-200'
                                              }`}
                                            />
                                          )
                                        }
                                      )}
                                    </div>
                                  ) : null}
                                </Customscrollbar>
                              )}

                              <div
                                className={`p-2 ${
                                  showExpiryColumns || showSerialColumns ? 'col-span-3' : 'col-span-4'
                                }`}
                              >
                                <InputCustom
                                  state={row?.quantityError || 0}
                                  setState={(value) => handleQuantityChange(value, row, 'quantityError')}
                                  className={`${
                                    !row?.quantityEnterClient && !row?.quantityError
                                      ? '!border-red-500'
                                      : '!border-gray-200'
                                  } !w-full p-1`}
                                  classNameInput="w-full !responsive-text-sm"
                                  classNameButton="size-6 2xl:size-8"
                                  min={0}
                                  max={Infinity}
                                  disabled={false}
                                  isError={false}
                                  step={1}
                                  debounceTime={500}
                                />
                              </div>
                              {showSerialColumns && (
                                <Customscrollbar
                                  className={`col-span-3 py-2 ${
                                    isState.dataTableProducts?.data?.items?.length <= 1
                                      ? 'max-h-[calc(80vh-136px)]'
                                      : 'max-h-60'
                                  }`}
                                >
                                  <div className="flex flex-col gap-1">
                                    {showSerialColumns && [...Array(Math.ceil(Math.max(0, Number(row?.quantityError) || 0)))].map(
                                      (_, sIndex) => {
                                        return (
                                          <input
                                            key={sIndex}
                                            value={row.serialError?.[sIndex]?.value || ''}
                                            onChange={(e) => {
                                              handleChange({
                                                table: 'product',
                                                type: 'serialError',
                                                value: e.target.value.trim(),
                                                row,
                                                index: sIndex,
                                              })
                                            }}
                                            className={`border text-center py-1 px-1 w-full focus:outline-none rounded-md responsive-text-sm text-neutral-07 font-medium ${
                                              row.serialError?.[sIndex]?.isDuplicate
                                                ? 'border-red-500'
                                                : 'border-gray-200'
                                            }`}
                                          />
                                        )
                                      }
                                    )}
                                  </div>
                                </Customscrollbar>
                              )}
                              {showExpiryColumns && (
                                <>
                                  <div className="col-span-3">
                                    <input
                                      value={row?.lot || ''}
                                      disabled={
                                        (dataProductExpiry?.is_enable == '1' && false) ||
                                        (dataProductExpiry?.is_enable == '0' && true)
                                      }
                                      onChange={(e) => {
                                        handleChange({
                                          table: 'product',
                                          type: 'lot',
                                          value: e.target.value,
                                          row,
                                        })
                                      }}
                                      className="border text-center rounded-lg responsive-text-sm text-neutral-07 font-semibold py-2 px-1 w-full focus:outline-none border-gray-200"
                                    />
                                  </div>
                                  <div className="col-span-3 p-2 text-sm">
                                    <div className="relative">
                                      <DatePicker
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText={dataLang?.warehouses_detail_date ?? 'warehouses_detail_date'}
                                        selected={row?.date}
                                        disabled={
                                          (dataProductExpiry?.is_enable == '1' && false) ||
                                          (dataProductExpiry?.is_enable == '0' && true)
                                        }
                                        portalId="menu-time"
                                        onChange={(e) => {
                                          handleChange({
                                            table: 'product',
                                            type: 'date',
                                            value: e,
                                            row,
                                          })
                                        }}
                                        className="border-gray-200 bg-transparent disabled:bg-gray-100 relative z-1 placeholder:text-slate-300 w-full rounded-lg text-[#52575E] p-2 pl-6 border outline-none responsive-text-sm"
                                      />
                                      <CalendarBlankIcon className="size-4 absolute left-1.5 -translate-y-1/2 top-1/2 opacity-60" />
                                    </div>
                                  </div>
                                </>
                              )}
                              <h3
                                className={`p-2 responsive-text-sm text-neutral-07 font-semibold text-center
                                  ${showExpiryColumns || showSerialColumns ? 'col-span-2' : 'col-span-3'}
                                  `}
                              >
                                {formatNumber(row?.quantity_enter)}
                              </h3>
                              <h3
                                className={`p-2 responsive-text-sm text-neutral-07 font-semibold text-center
                                  ${showExpiryColumns || showSerialColumns ? 'col-span-2' : 'col-span-3'}
                                  `}
                              >
                                {formatNumber(row?.quantity_entered)}
                              </h3>
                              <div className="col-span-2 p-2 flex justify-center items-center">
                                <button
                                  onClick={() => handleRemove('product', row)}
                                  className="group hover:border-red-01 hover:bg-red-02 rounded-lg w-fit p-1 border border-transparent transition-all ease-in-out flex items-center gap-2 responsive-text-sm text-left cursor-pointer"
                                >
                                  <TrashIcon className="size-5 2xl:size-6 text-[#EE1E1E]" />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="col-span-25 p-2 text-center text-red-500 h-40 my-auto flex justify-center items-center">
                            Không có mặt hàng để hoàn thành
                          </div>
                        )}
                      </Customscrollbar>
                      <div className="grid grid-cols-25 items-center bg-[#CCCCCC40] rounded">
                        <h3
                          className={`p-2 text-center text-neutral-07 responsive-text-base font-medium
                          ${showExpiryColumns || showSerialColumns ? 'col-span-7' : 'col-span-9'}
                          `}
                        >
                          TỔNG CỘNG
                        </h3>
                        <h3
                          className={`p-2 text-center text-neutral-07 responsive-text-base font-medium
                          ${showExpiryColumns || showSerialColumns ? 'col-span-3' : 'col-span-4'}
                          `}
                        >
                          {formatNumber(getTotals.totalQuantityEnterClient)}
                        </h3>
                        {showSerialColumns && (
                          <div className="col-span-3 responsive-text-sm text-neutral-02 text-center font-semibold">
                            {formatNumber(getTotals.totalQuantityEnterClient)}
                          </div>
                        )}
                        <div
                          className={`p-2 responsive-text-sm text-neutral-07 font-semibold text-center
                          ${showExpiryColumns || showSerialColumns ? 'col-span-3' : 'col-span-4'}
                          `}
                        >
                          {formatNumber(getTotals.totalQuantityError)}
                        </div>
                        {showSerialColumns && (
                          <div className="col-span-3 responsive-text-sm text-neutral-02 p-2 text-center font-semibold">
                            {formatNumber(getTotals.totalQuantityError)}
                          </div>
                        )}
                        {showExpiryColumns && (
                          <>
                            <div className="col-span-3 responsive-text-sm text-neutral-02 p-2 font-semibold"></div>
                            <div className="col-span-3 responsive-text-sm text-neutral-02 p-2 font-semibold"></div>
                          </>
                        )}
                        <div
                          className={`whitespace-nowrap text-center responsive-text-sm text-neutral-07 font-semibold
                          ${showExpiryColumns || showSerialColumns ? 'col-span-2' : 'col-span-3 p-2'}
                          `}
                        >
                          {formatNumber(getTotals.totalQuantityEnter)}
                        </div>
                        <div
                          className={`whitespace-nowrap text-center responsive-text-sm text-neutral-07 font-semibold
                          ${showExpiryColumns || showSerialColumns ? 'col-span-2' : 'col-span-3 p-2'}
                          `}
                        >
                          {formatNumber(getTotals.totalQuantityEntered)}
                        </div>
                        <div className="col-span-2 responsive-text-sm text-neutral-02 text-center font-semibold "></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PopupCustom>
      )}
    </>
  )
}

export default PopupConfimStage