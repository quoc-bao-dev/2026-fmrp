import apiDeliveryReceipt from '@/Api/apiSalesExportProduct/deliveryReceipt/apiDeliveryReceipt'
import DropdownDiscount from '@/components/common/orderManagement/DropdownDiscount'
import DropdownTax from '@/components/common/orderManagement/DropdownTax'
import { DocumentNumber } from '@/components/common/orderManagement/GeneralInfo'
import InfoFormLabel from '@/components/common/orderManagement/InfoFormLabel'
import ItemTotalAndDelete from '@/components/common/orderManagement/ItemTotalAndDelete'
import LayoutOrderManagement from '@/components/common/orderManagement/LayoutOrderManagement'
import SelectCustomLabel from '@/components/common/orderManagement/SelectCustomLabel'
import SelectSearch from '@/components/common/orderManagement/SelectSearch'
import SelectWithRadio from '@/components/common/orderManagement/SelectWithRadio'
import TableHeader from '@/components/common/orderManagement/TableHeader'
import { Customscrollbar } from '@/components/UI/common/Customscrollbar'
import EmptyData from '@/components/UI/emptyData'
import InPutMoneyFormat from '@/components/UI/inputNumericFormat/inputMoneyFormat'
import InPutNumericFormat from '@/components/UI/inputNumericFormat/inputNumericFormat'
import Loading from '@/components/UI/loading/loading'
import PopupConfim from '@/components/UI/popupConfim/popupConfim'
import { CONFIRMATION_OF_CHANGES, TITLE_DELETE_ITEMS } from '@/constants/delete/deleteItems'
import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate'
import { useBranchList } from '@/hooks/common/useBranch'
import { useClientComboboxByFilterBranch } from '@/hooks/common/useClients'
import { useStaffOptions } from '@/hooks/common/useStaffs'
import { useTaxList } from '@/hooks/common/useTaxs'
import useFeature from '@/hooks/useConfigFeature'
import useSetingServer from '@/hooks/useConfigNumber'
import useToast from '@/hooks/useToast'
import { useToggle } from '@/hooks/useToggle'
import { isAllowedDiscount, isAllowedNumber } from '@/utils/helpers/common'
import { formatMoment } from '@/utils/helpers/formatMoment'
import formatMoneyConfig from '@/utils/helpers/formatMoney'
import formatNumberConfig from '@/utils/helpers/formatnumber'
import { PopupParent } from '@/utils/lib/Popup'
import { useQuery } from '@tanstack/react-query'
import { ConfigProvider, DatePicker } from 'antd'
import viVN from 'antd/lib/locale/vi_VN'
import dayjs from 'dayjs'
import { AnimatePresence, motion } from 'framer-motion'
import { Add, ArrowDown2, ArrowUp2, Minus, TableDocument } from 'iconsax-react'
import moment from 'moment/moment'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { AiFillPlusCircle } from 'react-icons/ai'
import { BsCalendarEvent } from 'react-icons/bs'
import { LuBriefcase } from 'react-icons/lu'
import { PiMapPinLight, PiUser } from 'react-icons/pi'
import { TbNotes } from 'react-icons/tb'
import { useSelector } from 'react-redux'
import { components } from 'react-select'
import { routerDeliveryReceipt } from 'routers/sellingGoods'
import { v4 as uuidv4 } from 'uuid'
import PopupAddress from './components/PopupAddress'
import { useDeliveryReceipItemAll } from './hooks/useDeliveryReceipItemAll'
import CalendarBlankIcon from '@/components/icons/common/CalendarBlankIcon'

const DeliveryReceiptForm = (props) => {
  // Router and API hooks
  const router = useRouter()

  const dataSeting = useSetingServer()

  const id = router.query?.id

  const dataLang = props?.dataLang

  const isShow = useToast()

  const { isOpen, isKeyState, handleQueryId } = useToggle()

  const authState = useSelector((state) => state.auth)

  const { dataMaterialExpiry, dataProductExpiry } = useFeature()

  // State Variables

  const [showMoreInfo, setShowMoreInfo] = useState(false)

  const [onFetchingProductOrder, sOnFetchingProductOrder] = useState(false)

  const [onFetchingAddress, sOnFetchingAddress] = useState(false)

  const [openPopupAddress, sOpenPopupAddress] = useState(false)

  const [onSending, sOnSending] = useState(false)

  const [generalTax, sThuetong] = useState()

  const [generalDiscount, sChietkhautong] = useState(0)

  const [code, sCode] = useState('')

  const [startDate, sStartDate] = useState(new Date())

  const [note, sNote] = useState('')

  const [date, sDate] = useState(moment().format(FORMAT_MOMENT.DATE_TIME_LONG))

  const [dataProductOrder, sDataProductOrder] = useState([])

  const [dataAddress, sDataAddress] = useState([])

  const [listData, sListData] = useState([])

  const [idBranch, sIdBranch] = useState(null)

  const [idClient, sIdClient] = useState(null)

  const [idContactPerson, sIdContactPerson] = useState(null)

  const [idStaff, sIdStaff] = useState(null)

  const [idProductOrder, sIdProductOrder] = useState(null)

  const [idAddress, sIdAddress] = useState(null)

  const [itemAll, sItemAll] = useState([])

  const [load, sLoad] = useState(false)

  const [errClient, sErrClient] = useState(false)

  const [errStaff, sErrStaff] = useState(false)

  const [errProductOrder, sErrProductOrder] = useState(false)

  const [errDate, sErrDate] = useState(false)

  const [errAddress, sErrAddress] = useState(false)

  const [errBranch, sErrBranch] = useState(false)

  const [errWarehouse, sErrWarehouse] = useState(false)

  const [errQuantity, sErrQuantity] = useState(false)

  const [errSurvive, sErrSurvive] = useState(false)

  const [errPrice, sErrPrice] = useState(false)

  const [errSurvivePrice, sErrSurvivePrice] = useState(false)

  const [searchClient, sSearchClient] = useState(null)

  const [isTotalMoney, sIsTotalMoney] = useState({
    totalPrice: 0,
    totalDiscountPrice: 0,
    totalDiscountAfterPrice: 0,
    totalTax: 0,
    totalAmount: 0,
  })

  // API Hooks
  const { data: dataTasxes = [] } = useTaxList()

  const { data: dataBranch = [] } = useBranchList()

  const { data: dataStaff = [] } = useStaffOptions({
    'filter[branch_id]': idBranch !== null ? +idBranch?.value : null,
  })

  const { data: dataClient = [] } = useClientComboboxByFilterBranch(idBranch, {
    'filter[branch_id]': idBranch != null ? idBranch.value : null,
    ...(searchClient !== null && { search: searchClient }),
  })

  const { data: dataItems } = useDeliveryReceipItemAll({
    'filter[order_id]': idProductOrder !== null ? +idProductOrder?.value : null,
    'filter[delivery_id]': id ? id : '',
  })

  const [isFirstRender, sIsFirstRender] = useState(true)

  // Gắn chi nhánh đầu tiên vào state idBranch
  useEffect(() => {
    if (dataBranch.length > 0 && authState.branch?.length > 0 && !idBranch) {
      const firstBranch = {
        value: authState.branch[0].id,
        label: authState.branch[0].name,
      }
      sIdBranch(firstBranch)
    }
  }, [dataBranch, authState.branch, router.query])

  // Gắn người dùng đầu tiên vào state idStaff
  useEffect(() => {
    if (dataStaff.length > 0 && authState?.staff_id && isFirstRender) {
      const staff = dataStaff.find((e) => e.value === authState?.staff_id)
      sIdStaff(staff)
      sIsFirstRender(false)
    }
  }, [dataStaff, isFirstRender, authState?.staff_id, router.query])

  const formatNumber = (number) => {
    return formatNumberConfig(+number, dataSeting)
  }

  const formatMoney = (number) => {
    return formatMoneyConfig(+number, dataSeting)
  }

  const _HandleClosePopupAddress = (e) => {
    sOpenPopupAddress(e)
    !e && _ServerFetching_Address()
  }

  const resetAllStates = () => {
    // sCode('')
    // sStartDate(new Date())
    // sIdBranch(null)
    // sIdClient(null)
    // sIdContactPerson(null)
    // sIdProductOrder(null)
    // sIdStaff(null)
    // sIdAddress(null)
    // sNote('')
    // sErrBranch(false)
    // sErrDate(false)
    // sErrClient(false)
    // sErrProductOrder(false)
    // sErrQuantity(false)
    // sErrStaff(false)
    // sErrSurvive(false)
    // sErrSurvivePrice(false)
    // sErrWarehouse(false)
    sIsFirstRender(true)
  }

  useEffect(() => {
    router.query && resetAllStates()
  }, [router.query])

  const options = dataItems?.map((e) => ({
    label: `${e.name}
            <span style={{display: none}}>${e.code}</span>
            <span style={{display: none}}>${e.product_variation} </span>
            <span style={{display: none}}>${e.serial} </span>
            <span style={{display: none}}>${e.lot} </span>
            <span style={{display: none}}>${e.expiration_date} </span>
            <span style={{display: none}}>${e.text_type} ${e.unit_name} </span>`,
    value: e.id,
    e,
  }))

  const { isFetching } = useQuery({
    queryKey: ['api_detail_page', id],
    queryFn: async () => {
      const rResult = await apiDeliveryReceipt.apiDetailPage(id)

      sListData(
        rResult?.items.map((e) => {
          const warehouseList = e?.item?.warehouseList || []

          const child = e?.child.map((ce) => {
            const warehouse = warehouseList?.find((item) => item.id === ce?.warehouse_use_id)

            return {
              id: Number(ce?.id),
              idChildBackEnd: Number(ce?.id),
              disabledDate:
                (e.item?.text_type == 'material' && dataMaterialExpiry?.is_enable == '1' && false) ||
                (e.item?.text_type == 'material' && dataMaterialExpiry?.is_enable == '0' && true) ||
                (e.item?.text_type == 'products' && dataProductExpiry?.is_enable == '1' && false) ||
                (e.item?.text_type == 'products' && dataProductExpiry?.is_enable == '0' && true),
              warehouse: {
                label: warehouse?.location_name,
                value: warehouse?.id,
                warehouse_name: warehouse?.warehouse_name,
                qty: warehouse?.quantity,
                lot: warehouse?.lot,
                date: warehouse?.expiration_date,
                serial: warehouse?.serial,
              },
              dataWarehouse: e?.item?.warehouseList?.map((s) => ({
                label: s?.location_name,
                value: s?.id,
                warehouse_name: s?.warehouse_name,
                qty: s?.quantity,
                lot: s?.lot,
                date: s?.expiration_date,
                serial: s?.serial,
              })),
              quantityStock: e?.item?.quantity,
              quantityDelive: e?.item?.quantity_delivery,
              unit: e?.item?.unit_name,
              quantity: Number(ce?.quantity),
              price: Number(ce?.price),
              discount: Number(ce?.discount_percent_item),
              tax: {
                tax_rate: ce?.tax_rate_item,
                value: ce?.tax_id_item,
                label: ce?.tax_name_item || 'Miễn thuế',
              },
              note: ce?.note_item,
            }
          })
          return {
            id: e?.item?.id,
            idParenBackend: e?.item?.id,
            matHang: {
              e: e?.item,
              label: `${e.item?.name} <span style={{display: none}}>${
                e.item?.code + e.item?.product_variation + e.item?.text_type + e.item?.unit_name
              }</span>`,
              value: e.item?.id,
            },
            child: child,
          }
        })
      )
      sCode(rResult?.reference_no)
      sIdBranch({
        label: rResult?.branch_name,
        value: rResult?.branch_id,
      })
      sStartDate(moment(rResult?.date).toDate())
      sNote(rResult?.note)
      sIdAddress({ label: rResult?.name_address_delivery, value: rResult?.address_delivery_id })
      sIdClient({ label: rResult?.customer_name, value: rResult?.customer_id })
      sIdStaff({ label: rResult?.staff_full_name, value: rResult?.staff_id })
      sIdProductOrder({ label: rResult?.order_code, value: rResult?.order_id })
      sIdContactPerson(
        rResult?.person_contact_id != 0 && {
          label: rResult?.person_contact_name,
          value: rResult?.person_contact_id,
        }
      )

      return rResult
    },
    enabled: !!id,
  })

  const _ServerFetching_ProductOrder = async () => {
    let data = new FormData()

    data.append('branch_id', idBranch !== null ? +idBranch?.value || +idBranch : null)

    data.append('client_id', idClient !== null ? +idClient.value || +idClient : null)

    id && data.append('filter[delivery_id]', id ? id : '')

    try {
      const { results } = await apiDeliveryReceipt.apiSearchOrdersToCustomer(data)

      sDataProductOrder(results?.map((e) => ({ label: e.text, value: e.id })))

      sOnFetchingProductOrder(false)
    } catch (error) {}
  }

  const _ServerFetching_Address = async () => {
    let data = new FormData()
    data.append('client_id', idClient !== null ? +idClient.value || +idClient : null)
    try {
      const rResult = await apiDeliveryReceipt.apiGetShippingClient(data)

      sDataAddress(rResult?.map((e) => ({ label: e.address, value: e.id })))

      sOnFetchingAddress(false)
    } catch (error) {}
  }

  const handleSaveStatus = () => {
    isKeyState?.sListData([])
    isKeyState?.sId(isKeyState?.value)
    isKeyState?.sIdStaff && isKeyState?.sIdStaff(null)
    isKeyState?.idEmty && isKeyState?.idEmty(null)
    handleQueryId({ status: false })
  }

  const handleCancleStatus = () => {
    isKeyState?.sId({ ...isKeyState?.id })
    handleQueryId({ status: false })
  }

  const checkListData = (value, sListData, sId, id, idEmty, sIdStaff) => {
    return handleQueryId({
      status: true,
      initialKey: { value, sListData, sId, id, idEmty, sIdStaff },
    })
  }

  const _HandleChangeInput = (type, value) => {
    if (type == 'code') {
      sCode(value.target.value)
    } else if (type === 'date') {
      sDate(formatMoment(value.target.value, FORMAT_MOMENT.DATE_TIME_LONG))
    } else if (type === 'idClient' && idClient != value) {
      if (listData?.length > 0) {
        checkListData(value, sListData, sIdClient, idClient, sIdProductOrder)
      } else {
        sIdClient(value)
        sIdProductOrder(null)
        sIdContactPerson(null)
        if (value == null) {
          sDataProductOrder([])
        }
      }
    } else if (type === 'idContactPerson') {
      sIdContactPerson(value)
    } else if (type === 'idStaff' && idStaff != value) {
      sIdStaff(value)
    } else if (type === 'idProductOrder' && idProductOrder != value) {
      if (listData?.length > 0) {
        checkListData(value, sListData, sIdProductOrder, idProductOrder)
      } else {
        sIdProductOrder(value)
      }
    } else if (type === 'idAddress') {
      sIdAddress(value)
    } else if (type === 'itemAll' && itemAll != value) {
      sItemAll(value)
      if (value?.length === 0) {
        sListData([])
      } else if (value?.length > 0) {
        const listDataMap = new Map(listData.map((item) => [item?.id, item]))
        const valueMap = new Map(value.map((item) => [item?.value, item]))

        const uniqueList = value.filter((item) => !listDataMap.has(item?.value))
        const matchedList = listData.filter((item) => valueMap.has(item?.id))

        const newData = uniqueList?.map((e) => {
          const parent = _DataValueItem(e).parent
          return parent
        })
        if (matchedList?.length > 0) {
          sListData([...matchedList, ...newData])
        } else {
          sListData([...newData])
        }
      }
    } else if (type === 'note') {
      sNote(value.target.value)
    } else if (type == 'branch' && idBranch != value) {
      if (listData?.length > 0) {
        checkListData(value, sListData, sIdBranch, idBranch, sIdClient, sIdStaff)
      } else {
        sIdBranch(value)
        sIdClient(null)
        sIdProductOrder(null)
        sIdContactPerson(null)
        sIdStaff(null)
      }
    } else if (type == 'generalTax') {
      sThuetong(value)
      if (listData?.length > 0) {
        const newData = listData.map((e) => {
          const newChild = e?.child.map((ce) => {
            return { ...ce, tax: value }
          })
          return { ...e, child: newChild }
        })
        sListData(newData)
      }
    } else if (type == 'generalDiscount') {
      sChietkhautong(value?.value)
      if (listData?.length > 0) {
        const newData = listData.map((e) => {
          const newChild = e?.child.map((ce) => {
            return { ...ce, discount: value?.value }
          })
          return { ...e, child: newChild }
        })
        sListData(newData)
      }
    }
  }

  const handleClearDate = (type) => {
    if (type === 'effectiveDate') {
    }
    if (type === 'startDate') {
      sStartDate(new Date())
    }
  }
  const handleTimeChange = (date) => {
    sStartDate(date)
  }

  useEffect(() => {
    sErrDate(false)
  }, [date != null])

  useEffect(() => {
    sErrClient(false)
  }, [idClient != null])

  useEffect(() => {
    sErrStaff(false)
  }, [idStaff != null])

  useEffect(() => {
    sErrBranch(false)
  }, [idBranch != null])

  useEffect(() => {
    sErrProductOrder(false)
  }, [idProductOrder != null])

  useEffect(() => {
    sErrAddress(false)
  }, [idAddress != null])

  useEffect(() => {
    if (idBranch == null) {
      sIdClient(null)
      sIdProductOrder(null)
      sDataProductOrder([])
      sIdStaff(null)
    }
  }, [idBranch])

  useEffect(() => {
    idBranch != null && idClient != null && sOnFetchingProductOrder(true)
  }, [idBranch, idClient])

  useEffect(() => {
    if (idClient == null) {
      sIdProductOrder(null)
      sDataProductOrder([])
    } else {
      sOnFetchingAddress(true)
    }
  }, [idClient])

  const useFetchingEffect = (condition, serverFetchFunction) => {
    useEffect(() => {
      if (condition) {
        serverFetchFunction()
      }
    }, [condition, serverFetchFunction])
  }

  useFetchingEffect(onFetchingProductOrder, _ServerFetching_ProductOrder)
  useFetchingEffect(onFetchingAddress, _ServerFetching_Address)

  const totalMoney = (listData = []) => {
    let totalPrice = 0
    let totalDiscountPrice = 0
    let totalDiscountAfterPrice = 0
    let totalTax = 0
    let totalAmount = 0

    for (const item of listData) {
      for (const child of item.child || []) {
        const price = Number(child?.price) || 0
        const quantity = Number(child?.quantity) || 0
        const discount = Number(child?.discount) || 0
        const taxRate = Number(child?.tax?.tax_rate) || 0

        const priceTotal = price * quantity
        const discountAmount = price * (discount / 100) * quantity
        const priceAfterDiscount = price * (1 - discount / 100) * quantity
        const taxAmount = priceAfterDiscount * (taxRate / 100)
        const finalAmount = priceAfterDiscount * (1 + taxRate / 100)

        totalPrice += priceTotal
        totalDiscountPrice += discountAmount
        totalDiscountAfterPrice += priceAfterDiscount
        totalTax += taxAmount
        totalAmount += finalAmount
      }
    }

    return {
      totalPrice,
      totalDiscountPrice,
      totalDiscountAfterPrice,
      totalTax,
      totalAmount,
    }
  }

  useEffect(() => {
    const totalPrice = totalMoney(listData)
    sIsTotalMoney(totalPrice)
  }, [listData])

  const taxOptions = [{ label: 'Miễn thuế', value: '0', tax_rate: '0' }, ...dataTasxes]

  const _DataValueItem = (value) => {
    const newChild = {
      id: uuidv4(),
      idChildBackEnd: '',
      disabledDate:
        (value?.e?.text_type === 'material' && dataMaterialExpiry?.is_enable === '1' && false) ||
        (value?.e?.text_type === 'material' && dataMaterialExpiry?.is_enable === '0' && true) ||
        (value?.e?.text_type === 'products' && dataProductExpiry?.is_enable === '1' && false) ||
        (value?.e?.text_type === 'products' && dataProductExpiry?.is_enable === '0' && true),
      quantityStock: value?.e?.quantity,
      quantityDelive: value?.e?.quantity_delivery,
      warehouse: null,
      dataWarehouse: value?.e?.warehouseList?.map((e) => ({
        label: e?.location_name,
        value: e?.id,
        warehouse_name: e?.warehouse_name,
        qty: e?.quantity,
        lot: e?.lot,
        date: e?.expiration_date,
        serial: e?.serial,
      })),
      unit: value?.e?.unit_name,
      price: Number(value?.e?.price),
      quantity: Number(value?.e?.quantity) - Number(value?.e?.quantity_delivery),
      discount: generalDiscount ? generalDiscount : Number(value?.e?.discount_percent_item),
      tax: generalTax
        ? generalTax
        : {
            label: value?.e?.tax_name == null ? 'Miễn thuế' : value?.e?.tax_name,
            value: value?.e?.tax_id_item,
            tax_rate: value?.e?.tax_rate_item,
          },
      note: value?.e?.note_item,
    }
    return {
      newChild: newChild,
      parent: {
        id: uuidv4(),
        matHang: value,
        idParenBackend: '',
        child: [newChild],
      },
    }
  }

  const _HandleAddChild = (parentId, value) => {
    const newData = listData?.map((e) => {
      if (e?.id === parentId) {
        const { newChild } = _DataValueItem(value)
        return { ...e, child: [...e.child, newChild] }
      } else {
        return e
      }
    })
    sListData(newData)
  }

  const _HandleDeleteChild = (parentId, childId) => {
    const newData = listData
      .map((e) => {
        if (e.id === parentId) {
          const newChild = e.child?.filter((ce) => ce?.id !== childId)
          return { ...e, child: newChild }
        }
        return e
      })
      .filter((e) => e.child?.length > 0)
    sItemAll([...newData])
    sListData([...newData])
  }

  const _HandleDeleteAllChild = (parentId) => {
    const newData = listData
      .map((e) => {
        if (e.id === parentId) {
          const newChild = e.child?.filter((ce) => ce?.warehouse !== null)
          return { ...e, child: newChild }
        }
        return e
      })
      .filter((e) => e.child?.length > 0)
    sListData([...newData])
  }

  const _HandleChangeChild = (parentId, childId, type, value) => {
    const newData = listData.map((e) => {
      if (e?.id !== parentId) return e
      const newChild = e.child?.map((ce) => {
        if (ce?.id !== childId) return ce
        const quantityAmount = +ce?.quantityStock - +ce?.quantityDelive
        const totalSoLuong = e.child.reduce((sum, opt) => sum + parseFloat(opt?.quantity || 0), 0)
        const checkWarehouse = e?.child?.some((i) => i?.warehouse?.value === value?.value)

        switch (type) {
          case 'quantity':
            sErrSurvive(false)
            ce.quantity = Number(value?.value)
            FunCheckQuantity(parentId, childId)
            break

          case 'increase':
            sErrSurvive(false)
            if (+ce.quantity === +ce?.warehouse?.qty) {
              isShow(
                'error',
                `Số lượng chỉ được bé hơn hoặc bằng ${formatNumber(+ce?.warehouse?.qty)} số lượng tồn kho`,
                3000
              )
            } else if (+ce.quantity === quantityAmount) {
              isShow(
                'error',
                `Số lượng chỉ được bé hơn hoặc bằng ${formatNumber(quantityAmount)} số lượng chưa giao`,
                3000
              )
            } else if (+ce.quantity > +ce?.warehouse?.qty) {
              isShow(
                'error',
                `Số lượng chỉ được bé hơn hoặc bằng ${formatNumber(+ce?.warehouse?.qty)} số lượng tồn kho`,
                3000
              )
            } else if (+ce.quantity > quantityAmount) {
              isShow(
                'error',
                `Số lượng chỉ được bé hơn hoặc bằng ${formatNumber(quantityAmount)} số lượng chưa giao`,
                3000
              )
            } else {
              ce.quantity = Number(ce?.quantity) + 1
            }
            FunCheckQuantity(parentId, childId)
            break

          case 'decrease':
            sErrSurvive(false)
            ce.quantity = Number(ce?.quantity) - 1
            break

          case 'price':
            sErrSurvivePrice(false)
            ce.price = Number(value?.value)
            break

          case 'discount':
            ce.discount = Number(value?.value)
            break

          case 'note':
            ce.note = value?.target.value
            break

          case 'warehouse':
            if (!checkWarehouse && +ce?.quantity > +value?.qty) {
              isShow('error', `Số lượng chưa giao vượt quá ${formatNumber(+value?.qty)} số lượng tồn kho`)
              ce.warehouse = value
              ce.quantity = value?.qty
              FunCheckQuantity(parentId, childId)
            } else if (!checkWarehouse && totalSoLuong > quantityAmount) {
              FunCheckQuantity(parentId, childId)
              ce.warehouse = value
            } else if (checkWarehouse) {
              isShow('error', `Kho - vị trí kho đã được chọn`)
            } else {
              ce.warehouse = value
            }
            break

          case 'tax':
            ce.tax = value
            break

          default:
        }

        return { ...ce }
      })

      return { ...e, child: newChild }
    })

    sListData([...newData])
  }

  const FunCheckQuantity = (parentId, childId) => {
    const e = listData.find((item) => item?.id == parentId)
    if (!e) return

    const ce = e.child.find((child) => child?.id == childId)
    if (!ce) return

    // const checkChild = e.child.reduce((sum, opt) => sum + parseFloat(opt?.quantity || 0), 0)
    // const quantityAmount = +ce?.quantityStock - +ce?.quantityDelive
  }

  const handleSelectAll = (type) => {
    if (type == 'addAll') {
      const newData = [...dataItems]?.map((e) => {
        const { parent } = _DataValueItem({ e: e })
        return parent
      })
      sListData([...newData])
      return
    } else {
      sListData([])
      return
    }
  }

  const MenuList = (props) => {
    return (
      <components.MenuList {...props}>
        {dataItems?.length > 0 && (
          <div className="grid items-center grid-cols-2 cursor-pointer">
            <div
              className="hover:bg-[#0000000A] p-2 col-span-1 text-center 3xl:text-[16px] 2xl:text-[16px] xl:text-[14px] text-[13px] font-deca"
              onClick={() => handleSelectAll('addAll')}
            >
              Chọn tất cả
            </div>
            <div
              className="hover:bg-[#0000000A] p-2 col-span-1 text-center 3xl:text-[16px] 2xl:text-[16px] xl:text-[14px] text-[13px] font-deca"
              onClick={() => handleSelectAll('deleteAll')}
            >
              Bỏ chọn tất cả
            </div>
          </div>
        )}
        {props.children}
      </components.MenuList>
    )
  }

  const selectItemsLabel = (option) => {
    let quantityUndelived = +option?.e?.quantity - +option?.e?.quantity_delivery
    return (
      <div className="flex items-start p-2 rounded-md cursor-pointer font-deca">
        <div className="flex items-center gap-3">
          <img
            src={option.e?.images ?? '/icon/noimagelogo.png'}
            alt={option?.e.name}
            className="xl:size-16 size-12 object-cover rounded-md"
          />
          <div className="flex flex-col gap-1 3xl:text-[10px] text-[9px] font-normal overflow-hidden w-full">
            <div className="font-semibold responsive-text-sm truncate text-black">{option.e.name}</div>
            <div className="text-blue-600 truncate">
              {option.e?.code}: {option.e?.product_variation}
            </div>
            <div className="flex flex-wrap items-center gap-1 text-neutral-03">
              <div className="flex items-center gap-1">
                <h5>
                  {dataLang[option.e?.text_type]} {dataLang?.delivery_receipt_quantity || 'delivery_receipt_quantity'}:{' '}
                  {option.e?.quantity ? formatNumber(+option.e?.quantity) : '0'} -{' '}
                </h5>
              </div>
              <div className="flex items-center gap-1">
                <h5>
                  {dataLang?.delivery_receipt_quantity_undelivered_order || 'Số lượng'}:{' '}
                  {quantityUndelived ? formatNumber(+quantityUndelived) : '0'} -{' '}
                </h5>
              </div>
              <div className="flex items-center gap-1">
                <h5>
                  {dataLang?.delivery_receipt_quantity_delivered_order || 'delivery_receipt_quantity_delivered_order'}:{' '}
                  {option.e?.quantity_delivery ? formatNumber(+option.e?.quantity_delivery) : '0'}
                </h5>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const _HandleSubmit = (e) => {
    e.preventDefault()

    const hasNullWarehouse = listData.some((item) =>
      item.child?.some(
        (childItem) =>
          childItem.warehouse === null ||
          (id && (childItem.warehouse?.label === null || childItem.warehouse?.warehouse_name === null))
      )
    )

    const hasNullQuantity = listData.some((item) =>
      item.child?.some(
        (childItem) => childItem.quantity === null || childItem.quantity === '' || childItem.quantity == 0
      )
    )
    const hasNullPrice = listData.some((item) =>
      item.child?.some((childItem) => childItem.price === null || childItem.price === '')
    )

    const isTotalExceeded = listData?.some(
      (e) =>
        !hasNullWarehouse &&
        e.child?.some((opt) => {
          const quantity = parseFloat(opt?.quantity) || 0
          const qty = parseFloat(opt?.warehouse?.qty) || 0

          return quantity > qty
        })
    )

    const isEmpty = listData?.length === 0 ? true : false

    if (idBranch == null || idStaff == null) {
      setShowMoreInfo(true)
    }

    if (
      idClient == null ||
      idStaff == null ||
      idBranch == null ||
      idProductOrder == null ||
      idAddress == null ||
      hasNullWarehouse ||
      hasNullQuantity ||
      hasNullPrice ||
      isTotalExceeded ||
      isEmpty
    ) {
      idClient == null && sErrClient(true)
      idAddress == null && sErrAddress(true)
      idStaff == null && sErrStaff(true)
      idBranch == null && sErrBranch(true)
      idProductOrder == null && sErrProductOrder(true)
      hasNullWarehouse && sErrWarehouse(true)
      hasNullQuantity && sErrQuantity(true)
      hasNullPrice && sErrPrice(true)
      if (isEmpty) {
        isShow('error', `Chưa nhập thông tin mặt hàng`)
      } else if (isTotalExceeded) {
        sErrSurvive(true)
        isShow('error', `${dataLang?.returns_err_QtyNotQexceed || 'returns_err_QtyNotQexceed'}`)
      } else if (hasNullPrice) {
        sErrSurvivePrice(true)
        isShow('error', `${'Vui lòng nhập đơn giá'}`)
      } else {
        isShow('error', `${dataLang?.required_field_null}`)
      }
    } else {
      sOnSending(true)
    }
  }
  const _ServerSending = async () => {
    let formData = new FormData()
    formData.append('code', code ? code : '')
    formData.append(
      'date',
      formatMoment(startDate, FORMAT_MOMENT.DATE_TIME_LONG) ? formatMoment(startDate, FORMAT_MOMENT.DATE_TIME_LONG) : ''
    )
    formData.append('branch_id', idBranch?.value ? idBranch?.value : '')
    formData.append('client_id', idClient?.value ? idClient?.value : '')
    formData.append('person_contact_id', idContactPerson?.value ? idContactPerson?.value : '')
    formData.append('address_id', idAddress?.value ? idAddress?.value : '')
    formData.append('staff_id', idStaff?.value ? idStaff?.value : '')
    formData.append('product_order_id', idProductOrder?.value ? idProductOrder?.value : '')
    formData.append('note', note ? note : '')

    const firstChild = listData?.[0]?.child[0]

    listData.forEach((item, index) => {
      formData.append(`items[${index}][id]`, id ? item?.idParenBackend : '')
      formData.append(`items[${index}][item]`, item?.matHang?.value)
      item?.child?.forEach((childItem, childIndex) => {
        formData.append(`items[${index}][child][${childIndex}][row_id]`, id ? childItem?.idChildBackEnd : '')
        formData.append(`items[${index}][child][${childIndex}][warehouse_id]`, childItem?.warehouse?.value || 0)
        formData.append(`items[${index}][child][${childIndex}][quantity]`, childItem?.quantity)
        formData.append(`items[${index}][child][${childIndex}][price]`, childItem?.price)
        formData.append(`items[${index}][child][${childIndex}][discount]`, childItem?.discount)
        formData.append(`items[${index}][child][${childIndex}][tax]`, childItem?.tax?.value)
        formData.append(`items[${index}][child][${childIndex}][note]`, firstChild?.note ? firstChild?.note : '')
      })
    })
    try {
      const { isSuccess, message } = await apiDeliveryReceipt.apiHangdingDeliveryReceipt(id, formData)
      if (isSuccess) {
        isShow('success', `${dataLang[message] || message}`)
        resetAllStates()
        sListData([])
        router.push(routerDeliveryReceipt.home)
        sOnSending(false)
      } else {
        isShow('error', `${dataLang[message] || message}`)
        sOnSending(false)
      }
    } catch (error) {
      sOnSending(false)
    }
  }

  useEffect(() => {
    onSending && _ServerSending()
  }, [onSending])

  const breadcrumbItems = [
    {
      label: `${dataLang?.returnSales_title || 'returnSales_title'}`,
    },
    {
      label: `${dataLang?.delivery_receipt_list || 'delivery_receipt_list'}`,
      href: routerDeliveryReceipt.home,
    },
    {
      label: `${
        id
          ? dataLang?.delivery_receipt_edit || 'delivery_receipt_edit'
          : dataLang?.delivery_receipt_add || 'delivery_receipt_add'
      }`,
    },
  ]

  return (
    <LayoutOrderManagement
      dataLang={dataLang}
      titleHead={
        id
          ? dataLang?.delivery_receipt_edit || 'delivery_receipt_edit'
          : dataLang?.delivery_receipt_add || 'delivery_receipt_add'
      }
      breadcrumbItems={breadcrumbItems}
      titleLayout={id ? 'Sửa Phiếu Giao Hàng' : 'Thêm Phiếu Giao Hàng'}
      searchBar={
        <div className="w-full">
          <SelectSearch
            options={idProductOrder ? options : []}
            onChange={_HandleChangeInput.bind(this, 'itemAll')}
            value={itemAll?.value ? itemAll?.value : listData?.map((e) => e?.matHang)}
            MenuList={MenuList}
            formatOptionLabel={(option) => selectItemsLabel(option)}
            placeholder={'Chọn nhanh mặt hàng'}
          />
        </div>
      }
      tableLeft={
        <>
          {listData.length === 0 ? (
            <EmptyData />
          ) : (
            <div>
              {/* Thông tin mặt hàng Header */}
              <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.6fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,0.2fr)] gap-4 2xl:gap-5 items-center sticky top-0 z-10 py-2 mb-2 border-b border-gray-100">
                <TableHeader className="text-left">{dataLang?.import_from_items || 'import_from_items'}</TableHeader>
                <TableHeader className="text-center">Kho - Vị trí kho</TableHeader>
                <TableHeader className="text-center">Số lượng</TableHeader>
                <TableHeader className="text-center">Đơn giá</TableHeader>
                {/* Chọn hoàng loạt % chiết khấu */}
                <DropdownDiscount
                  value={generalDiscount}
                  onChange={_HandleChangeInput.bind(this, 'generalDiscount')}
                  dataLang={dataLang}
                />
                <TableHeader className="text-center">{dataLang?.returns_sck || 'returns_sck'}</TableHeader>
                {/* Chọn hàng loại % Thuế */}
                <DropdownTax
                  value={generalTax}
                  onChange={_HandleChangeInput.bind(this, 'generalTax')}
                  dataLang={dataLang}
                  taxOptions={taxOptions}
                />
                <TableHeader className="text-right">
                  {dataLang?.sales_product_total_into_money || 'sales_product_total_into_money'}
                </TableHeader>
              </div>

              {/* Thông tin mặt hàng Body */}
              <Customscrollbar className="max-h-[780px] pb-2">
                <div className="w-full h-full">
                  {isFetching ? (
                    <Loading className="w-full h-10" color="#0f4f9e" />
                  ) : (
                    <>
                      {listData?.map((e, index) => {
                        const option = e?.matHang
                        const firstChild = e?.child[0]
                        const isLast = index === listData.length - 1

                        return (
                          <div
                            key={e?.id?.toString()}
                            className={`grid items-center grid-cols-[minmax(0,2fr)_minmax(0,7fr)] gap-4 2xl:gap-5 my-1 py-4 ${
                              isLast ? '' : 'border-b border-[#F3F3F4]'
                            }`}
                          >
                            {/* Mặt hàng */}
                            <div className="h-full p-2">
                              <div className="flex items-center justify-between gap-1 xl:gap-2">
                                <div className="flex items-start">
                                  <div className="flex xl:flex-row flex-col items-start gap-3">
                                    <img
                                      src={option.e?.images ?? '/icon/noimagelogo.png'}
                                      alt={option?.e.name}
                                      className="size-12 object-cover rounded-md"
                                    />
                                    <div className="flex flex-col gap-1 3xl:text-[10px] text-[9px] overflow-hidden w-full text-neutral-03 font-normal">
                                      <h4 className="font-semibold responsive-text-sm text-brand-color">
                                        {option.e.name}
                                      </h4>
                                      <h5>
                                        {option.e?.code}: {option.e?.product_variation}
                                      </h5>
                                      <h5>ĐVT: {option.e?.unit_name}</h5>
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={_HandleAddChild.bind(this, e?.id, e?.matHang)}
                                  className="flex items-center justify-center xl:size-7 size-5 transition ease-in-out rounded text-typo-blue-1 bg-primary-05 hover:rotate-45 hover:hover:bg-[#e2f0fe] hover:scale-105 hover:text-red-500"
                                >
                                  <Add />
                                </button>
                              </div>
                              {/* Ghi chú */}
                              <div className="flex items-center justify-center mt-2">
                                <Image
                                  src={'/icon/pen.svg'}
                                  alt="icon pen"
                                  width={16}
                                  height={16}
                                  className="size-3 object-cover"
                                />
                                <input
                                  value={firstChild?.note}
                                  onChange={_HandleChangeChild.bind(this, e?.id, firstChild?.id, 'note')}
                                  placeholder={dataLang?.delivery_receipt_note || 'delivery_receipt_note'}
                                  type="text"
                                  className="focus:border-[#92BFF7] placeholder:responsive-text-xs 2xl:h-7 xl:h-5 py-0 px-1 responsive-text-xs placeholder-slate-300 w-full bg-white rounded-[5.5px] text-[#1C252E] font-normal outline-none placeholder:text-typo-gray-4"
                                />
                              </div>
                              {e?.child?.filter((e) => e?.warehouse == null).length >= 2 && (
                                <button
                                  onClick={_HandleDeleteAllChild.bind(this, e?.id, e?.matHang)}
                                  className="text-xs text-center w-full rounded-lg mt-2 px-5 py-2 overflow-hidden group bg-rose-500 relative hover:bg-gradient-to-r hover:from-rose-500 hover:to-rose-400 text-white transition-all ease-out duration-300"
                                >
                                  Xóa {e?.child?.filter((e) => e?.warehouse == null).length} hàng chưa chọn kho
                                </button>
                              )}
                            </div>
                            {/* Body */}
                            <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.6fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,0.2fr)] gap-4 2xl:gap-5 items-center">
                              {e?.child?.map((ce) => {
                                const discountedPrice = formatMoney(
                                  Number(ce?.price) * (1 - Number(ce?.discount) / 100)
                                )
                                return (
                                  <React.Fragment key={ce?.id?.toString()}>
                                    {/* Kho - Vị trí kho */}
                                    <div className="flex flex-col justify-center h-full select-custom-label">
                                      <SelectCustomLabel
                                        dataLang={dataLang}
                                        placeholder={dataLang?.PDF_house || 'PDF_house'}
                                        options={ce?.dataWarehouse}
                                        value={ce?.warehouse}
                                        onChange={(value) => _HandleChangeChild(e?.id, ce?.id, 'warehouse', value)}
                                        formatNumber={formatNumber}
                                        isError={errWarehouse}
                                      />
                                    </div>
                                    {/* Số lượng */}
                                    <div className="flex items-center justify-center">
                                      <div
                                        className={`relative flex items-center justify-center 3xl:p-2 xl:p-[2px] p-[1px] border rounded-3xl ${
                                          errQuantity &&
                                          (ce?.quantity == null || ce?.quantity == '' || ce?.quantity == 0)
                                            ? 'border-red-500'
                                            : errSurvive
                                            ? ' border-red-500'
                                            : 'focus:border-brand-color hover:border-brand-color border-neutral-N400'
                                        }  ${
                                          (ce?.quantity == 0 && 'border-red-500') ||
                                          (ce?.quantity == '' && 'border-red-500')
                                        } `}
                                      >
                                        <button
                                          disabled={
                                            ce?.quantity === 1 ||
                                            ce?.quantity === '' ||
                                            ce?.quantity === null ||
                                            ce?.quantity === 0
                                          }
                                          className="2xl:scale-100 xl:scale-90 scale-75 font-bold flex items-center justify-center p-0.5 bg-primary-05 hover:bg-typo-blue-4/50 rounded-full"
                                          onClick={_HandleChangeChild.bind(this, e?.id, ce?.id, 'decrease')}
                                        >
                                          <Minus size="16" className="scale-75 2xl:scale-100 xl:scale-90" />
                                        </button>
                                        <InPutNumericFormat
                                          onValueChange={_HandleChangeChild.bind(this, e?.id, ce?.id, 'quantity')}
                                          value={ce?.quantity || null}
                                          className={`appearance-none text-center responsive-text-sm font-normal w-full focus:outline-none`}
                                          allowNegative={false}
                                          isAllowed={(values) => {
                                            const { value } = values
                                            const newValue = +value
                                            const quantityAmount = +ce?.quantityStock - +ce?.quantityDelive

                                            if (newValue > +ce?.warehouse?.qty) {
                                              isShow(
                                                'error',
                                                `Số lượng chỉ được bé hơn hoặc bằng ${formatNumber(
                                                  +ce?.warehouse?.qty
                                                )} số lượng tồn kho`
                                              )
                                              return
                                            } else if (newValue > quantityAmount) {
                                              isShow(
                                                'error',
                                                `Số lượng chỉ được bé hơn hoặc bằng ${formatNumber(
                                                  quantityAmount
                                                )} số lượng chưa giao`
                                              )
                                              return
                                            }
                                            return true
                                          }}
                                        />
                                        <button
                                          className="2xl:scale-100 xl:scale-90 scale-75 font-bold flex items-center justify-center p-0.5 bg-primary-05 hover:bg-typo-blue-4/50 rounded-full"
                                          onClick={_HandleChangeChild.bind(this, e?.id, ce?.id, 'increase')}
                                        >
                                          <Add size="16" className="scale-75 2xl:scale-100 xl:scale-90" />
                                        </button>
                                        <div className="absolute -top-4 -right-2 p-1 cursor-pointer">
                                          <PopupParent
                                            trigger={
                                              <div className="relative">
                                                <TableDocument size="18" color="#4f46e5" className="font-medium" />
                                                <span className="h-2 w-2 absolute top-0 left-1/2  translate-x-[50%] -translate-y-[50%]">
                                                  <span className="relative inline-flex w-2 h-2 bg-indigo-500 rounded-full">
                                                    <span className="absolute inline-flex w-full h-full bg-indigo-400 rounded-full opacity-75 animate-ping"></span>
                                                  </span>
                                                </span>
                                              </div>
                                            }
                                            position="bottom center"
                                            on={['hover', 'focus']}
                                          >
                                            <div className="flex flex-col bg-primary-06 px-2.5 py-0.5 rounded-lg font-deca">
                                              <span className="text-xs font-medium">
                                                Sl tồn: {ce?.warehouse == null ? 0 : formatNumber(+ce?.warehouse?.qty)}
                                              </span>

                                              <span className="text-xs font-medium">
                                                Sl đã giao: {formatNumber(ce?.quantityDelive)}
                                              </span>
                                              <span className="text-xs font-medium">
                                                Sl chưa giao: {formatNumber(ce?.quantityStock - ce?.quantityDelive)}
                                              </span>
                                            </div>
                                          </PopupParent>
                                        </div>
                                      </div>
                                    </div>
                                    {/* Đơn giá */}
                                    <div
                                      className={`flex items-center justify-center py-2 px-2 2xl:px-3 rounded-lg border ${
                                        errPrice && (ce?.price === null || ce?.price === '')
                                          ? 'border-red-500'
                                          : errSurvivePrice && (ce?.price === null || ce?.price === '')
                                          ? 'border-red-500'
                                          : 'focus:border-brand-color hover:border-brand-color border-neutral-N400'
                                      } ${ce?.price === '' || (ce?.price === null && 'border-red-500')} `}
                                    >
                                      <InPutMoneyFormat
                                        className={`appearance-none text-center responsive-text-sm font-semibold w-full focus:outline-none `}
                                        onValueChange={_HandleChangeChild.bind(this, e?.id, ce?.id, 'price')}
                                        isAllowed={isAllowedNumber}
                                        value={ce?.price}
                                        isSuffix=" đ"
                                        allowNegative={false}
                                      />
                                    </div>
                                    {/* % Chiết khấu */}
                                    <div className="flex items-center justify-end py-2 px-2 2xl:px-3 rounded-lg border focus:border-brand-color hover:border-brand-color border-neutral-N400 responsive-text-sm font-semibold">
                                      <InPutNumericFormat
                                        className="appearance-none w-full focus:outline-none text-right"
                                        onValueChange={_HandleChangeChild.bind(this, e?.id, ce?.id, 'discount')}
                                        value={ce?.discount}
                                        isAllowed={isAllowedDiscount}
                                        allowNegative={false}
                                      />
                                      <span className="2xl:pl-1">%</span>
                                    </div>
                                    {/* Đơn giá sau CK */}
                                    <div className="flex items-center justify-center text-center responsive-text-sm font-semibold">
                                      <h3>{discountedPrice}</h3>
                                      <span className="pl-1 underline">đ</span>
                                    </div>
                                    {/* % Thuế */}
                                    <div className="flex justify-center">
                                      <SelectCustomLabel
                                        placeholder={dataLang?.import_from_tax || 'import_from_tax'}
                                        options={taxOptions}
                                        value={ce?.tax}
                                        onChange={(value) => _HandleChangeChild(e?.id, ce?.id, 'tax', value)}
                                        renderOption={(option, isLabel) => (
                                          <div
                                            className={`flex items-center justify-start gap-1 text-[#1C252E] ${
                                              isLabel ? 'py-1 2xl:py-2' : ''
                                            }`}
                                          >
                                            <h2 className="responsive-text-sm leading-normal">{option?.label}</h2>
                                            {option?.tax_rate !== '0' && option?.tax_rate !== '5' && (
                                              <h2 className="responsive-text-sm leading-normal">
                                                {option?.tax_rate === '20'
                                                  ? `(${option?.tax_rate}%)`
                                                  : `${option?.tax_rate}%`}
                                              </h2>
                                            )}
                                          </div>
                                        )}
                                      />
                                    </div>
                                    {/* Thành tiền và nút xóa*/}
                                    <ItemTotalAndDelete
                                      total={formatNumber(
                                        ce?.price *
                                          (1 - Number(ce?.discount) / 100) *
                                          (1 + Number(ce?.tax?.tax_rate) / 100) *
                                          Number(ce?.quantity)
                                      )}
                                      onDelete={_HandleDeleteChild.bind(this, e?.id, ce?.id)}
                                    />
                                  </React.Fragment>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </>
                  )}
                </div>
              </Customscrollbar>
            </div>
          )}
        </>
      }
      info={
        <div className="flex flex-col gap-4 relative">
          {/* Mã chứng từ */}
          <DocumentNumber dataLang={dataLang} value={code} onChange={_HandleChangeInput.bind(this, 'code')} />
          {/* Ngày chứng từ */}
          <div className="flex flex-col flex-wrap items-center gap-y-3">
            <InfoFormLabel isRequired={true} label={dataLang?.import_day_vouchers || 'import_day_vouchers'} />

            <div className="relative w-full flex flex-row custom-date-picker date-form">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                <CalendarBlankIcon color="#7a7a7a" className="size-4 opacity-60" />
              </span>
              <ConfigProvider locale={viVN}>
                <DatePicker
                  className="sales-product-date pl-9 placeholder:text-secondary-color-text-disabled cursor-pointer"
                  status={errDate ? 'error' : ''}
                  allowClear={false}
                  placeholder="Chọn ngày"
                  format="DD/MM/YYYY HH:mm"
                  showTime={{
                    defaultValue: dayjs('00:00', 'HH:mm'),
                    format: 'HH:mm',
                  }}
                  suffixIcon={null}
                  value={dayjs(startDate)}
                  onChange={(date) => {
                    if (date) {
                      const dateString = date.toDate().toString()
                      sStartDate(dateString)
                    }
                  }}
                />
              </ConfigProvider>
            </div>
          </div>

          {/* Khách hàng */}
          <SelectWithRadio
            isRequired={true}
            label="Khách hàng"
            placeholderText="Chọn khách hàng"
            options={dataClient}
            value={idClient}
            onChange={(value) => {
              const newValue = dataClient.find((item) => item.value === value)
              _HandleChangeInput('idClient', newValue)
            }}
            isError={errClient}
            sSearch={sSearchClient}
            dataLang={dataLang}
            icon={<LuBriefcase />}
            errMess={dataLang?.sales_product_err_customer || 'sales_product_err_customer'}
          />

          {/* Đơn hàng bán */}
          <SelectWithRadio
            isRequired={true}
            label={dataLang?.delivery_receipt_product_order || 'delivery_receipt_product_order'}
            placeholderText="Chọn đơn hàng bán"
            options={dataProductOrder}
            value={idProductOrder}
            onChange={(value) => {
              const newValue = dataProductOrder.find((item) => item.value === value)
              _HandleChangeInput('idProductOrder', newValue)
            }}
            isError={errProductOrder}
            icon={<TbNotes />}
            errMess={dataLang?.delivery_receipt_err_select_product_order || 'delivery_receipt_err_select_product_order'}
          />

          {/* Địa chỉ giao hàng */}
          <div className="flex flex-col gap-y-2">
            <div className="relative flex flex-col select-with-radio">
              <SelectWithRadio
                isRequired={true}
                label={dataLang?.address || 'address'}
                placeholderText="Chọn địa chỉ giao hàng"
                options={dataAddress}
                value={idAddress}
                onChange={(value) => {
                  const newValue = dataAddress.find((item) => item.value === value)
                  _HandleChangeInput('idAddress', newValue)
                }}
                isError={errAddress}
                icon={<PiMapPinLight />}
              />
              <AiFillPlusCircle
                onClick={() => _HandleClosePopupAddress(true)}
                className="text-[13px] xl:text-base right-7 xl:right-8 top-[60%] 2xl:scale-150 scale-125 cursor-pointer text-sky-400 hover:text-sky-500 bg-white 3xl:hover:scale-[1.7] 2xl:hover:scale-[1.6] hover:scale-150 hover:rotate-180 transition-all ease-in-out absolute "
              />
              <PopupAddress
                dataLang={dataLang}
                clientId={idClient?.value || idClient}
                handleFetchingAddress={_ServerFetching_Address}
                openPopupAddress={openPopupAddress}
                handleClosePopupAddress={() => _HandleClosePopupAddress(false)}
                className="hidden"
              />
            </div>
            {errAddress && (
              <label className="text-sm text-red-500">
                {dataLang?.delivery_receipt_err_select_address || 'delivery_receipt_err_select_address'}
              </label>
            )}
          </div>
          {/* Xem thêm thông tin */}
          <AnimatePresence initial={false}>
            {showMoreInfo && (
              <motion.div
                key="more-info"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-y-3">
                  {/* Nhân viên */}
                  <SelectWithRadio
                    isRequired={true}
                    label={dataLang?.sales_product_staff_in_charge || 'Nhân viên'}
                    placeholderText="Chọn nhân viên"
                    options={dataStaff}
                    value={idStaff}
                    onChange={(value) => {
                      const newValue = dataStaff.find((item) => item.value === value)
                      _HandleChangeInput('idStaff', newValue)
                    }}
                    isError={errStaff}
                    icon={<PiUser />}
                    errMess={dataLang?.delivery_receipt_err_userStaff || 'delivery_receipt_err_userStaff'}
                  />

                  {/* Chi nhánh */}
                  <SelectWithRadio
                    isRequired={true}
                    label={dataLang?.import_branch || 'import_branch'}
                    placeholderText="Chọn chi nhánh"
                    options={dataBranch}
                    value={idBranch}
                    onChange={(value) => {
                      const newValue = dataBranch.find((item) => item.value === value)
                      _HandleChangeInput('branch', newValue)
                    }}
                    isError={errBranch}
                    icon={<PiMapPinLight />}
                    errMess={dataLang?.purchase_order_errBranch || 'purchase_order_errBranch'}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Xem thêm Button */}
          <div className="flex items-center justify-center p-1 pb-6 hover:underline">
            <button
              onClick={() => setShowMoreInfo(!showMoreInfo)}
              className="text-gray-700 text-sm font-normal inline-flex items-center gap-x-1"
            >
              {showMoreInfo ? (
                <span className="inline-flex items-center gap-x-1">
                  Ẩn bớt
                  <ArrowUp2 size={16} />
                </span>
              ) : (
                <span className="inline-flex items-center gap-x-1">
                  Xem thêm
                  <ArrowDown2 size={16} />
                </span>
              )}
            </button>
          </div>
        </div>
      }
      note={
        <div className="w-full mx-auto">
          <h4 className="responsive-text-base font-normal text-secondary-color-text mb-3 capitalize">
            {dataLang?.returns_reason || 'returns_reason'}
          </h4>
          <div className="w-full pb-6">
            <textarea
              value={note}
              placeholder={dataLang?.returns_reason || 'returns_reason'}
              onChange={_HandleChangeInput.bind(this, 'note')}
              name="fname"
              type="text"
              className="focus:border-brand-color border-gray-200 placeholder-secondary-color-text-disabled placeholder:responsive-text-base w-full h-[80px] max-h-[80px] bg-[#ffffff] rounded-lg text-[#52575E] responsive-text-base font-normal px-3 py-2 border outline-none"
            />
          </div>
        </div>
      }
      isTotalMoney={isTotalMoney}
      routerBack={routerDeliveryReceipt.home}
      onSave={_HandleSubmit.bind(this)}
      onSending={onSending}
      popupConfim={
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
      }
    />
  )
}

export default DeliveryReceiptForm
