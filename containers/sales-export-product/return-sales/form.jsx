import apiReturnSales from '@/Api/apiSalesExportProduct/returnSales/apiReturnSales'
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
import CalendarBlankIcon from '@/components/icons/common/CalendarBlankIcon'
import { Customscrollbar } from '@/components/UI/common/Customscrollbar'
import InPutMoneyFormat from '@/components/UI/inputNumericFormat/inputMoneyFormat'
import InPutNumericFormat from '@/components/UI/inputNumericFormat/inputNumericFormat'
import PopupConfim from '@/components/UI/popupConfim/popupConfim'
import { CONFIRMATION_OF_CHANGES, TITLE_DELETE_ITEMS } from '@/constants/delete/deleteItems'
import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate'
import { useBranchList } from '@/hooks/common/useBranch'
import { useClientByBranch } from '@/hooks/common/useClients'
import { useSolutionList } from '@/hooks/common/useSolutions'
import { useTaxList } from '@/hooks/common/useTaxs'
import { useWarehouseComboboxlocation } from '@/hooks/common/useWarehouses'
import useFeature from '@/hooks/useConfigFeature'
import useSetingServer from '@/hooks/useConfigNumber'
import useToast from '@/hooks/useToast'
import { useToggle } from '@/hooks/useToggle'
import { isAllowedDiscount, isAllowedNumber } from '@/utils/helpers/common'
import { formatMoment } from '@/utils/helpers/formatMoment'
import formatMoneyConfig from '@/utils/helpers/formatMoney'
import formatNumberConfig from '@/utils/helpers/formatnumber'
import { useQuery } from '@tanstack/react-query'
import { ConfigProvider, DatePicker } from 'antd'
import viVN from 'antd/lib/locale/vi_VN'
import dayjs from 'dayjs'
import { Add, Minus, TableDocument } from 'iconsax-react'
import moment from 'moment/moment'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { LuBriefcase, LuRefreshCcw } from 'react-icons/lu'
import { PiMapPinLight } from 'react-icons/pi'
import { useSelector } from 'react-redux'
import Popup from 'reactjs-popup'
import { routerReturnSales } from 'routers/sellingGoods'
import { v4 as uuidv4 } from 'uuid'
import { useReturnSalesItems } from './hooks/useReturnSalesItems'
import EmptyData from '@/components/UI/emptyData'

const initsFetching = {
  onFetchingCondition: false,
  onLoadingChild: false,
  onSending: false,
  load: false,
}

const initsErors = {
  errClient: false,
  errTreatment: false,
  errBranch: false,
  errWarehouse: false,
  errQuantity: false,
  errSurvive: false,
  errPrice: false,
  errSurvivePrice: false,
}
const initsValue = {
  code: '',
  date: new Date(),
  idBranch: null,
  idClient: null,
  idTreatment: null,
  note: '',
}

const ReturnSalesForm = (props) => {
  const router = useRouter()

  const id = router.query?.id

  const dataLang = props?.dataLang

  const isShow = useToast()

  const { isOpen, isKeyState, handleQueryId } = useToggle()

  const [fetChingData, sFetchingData] = useState(initsFetching)

  const dataSeting = useSetingServer()

  const { dataMaterialExpiry, dataProductSerial, dataProductExpiry } = useFeature()

  const [generalTax, sGeneralTax] = useState()

  const [generalDiscount, sGeneralD] = useState(0)

  const [idChange, sIdChange] = useState(initsValue)

  const [errors, sErrors] = useState(initsErors)

  const [listData, sListData] = useState([])

  const [isTotalMoney, sIsTotalMoney] = useState({
    totalPrice: 0,
    totalDiscountPrice: 0,
    totalDiscountAfterPrice: 0,
    totalTax: 0,
    totalAmount: 0,
  })

  const [searchClient, sSearchClient] = useState(null)

  const authState = useSelector((state) => state.auth)

  const { data: dataTasxes = [] } = useTaxList()

  const { data: listBranch = [] } = useBranchList()

  const { data: dataSolution } = useSolutionList(dataLang)

  const { data: dataItems = [] } = useReturnSalesItems(
    {
      'filter[client_id]': idChange?.idClient !== null ? +idChange?.idClient?.value : null,
      'filter[branch_id]': idChange?.idBranch !== null ? +idChange?.idBranch?.value : null,
    },
    idChange?.idClient?.value != null && idChange?.idBranch?.value != null
  )

  const { data: dataClient } = useClientByBranch(idChange?.idBranch, searchClient)

  const { data: dataWarehouse } = useWarehouseComboboxlocation({
    'filter[branch_id]': idChange?.idBranch ? idChange?.idBranch?.value : null,
  })

  // Tự động chọn chi nhánh đầu tiên từ authState khi component mount
  useEffect(() => {
    if (authState.branch?.length > 0 && !idChange.idBranch) {
      const firstBranch = {
        label: authState.branch[0].name,
        value: authState.branch[0].id,
      }
      sIdChange((list) => ({ ...list, idBranch: firstBranch }))
    }
  }, [])

  const resetAllStates = () => {
    sIdChange(initsValue)
    sErrors(initsErors)
  }

  const formatNumber = (number) => {
    return formatNumberConfig(+number, dataSeting)
  }
  const formatMoney = (number) => {
    return formatMoneyConfig(+number, dataSeting)
  }

  // useEffect(() => {
  //   router.query && resetAllStates()
  // }, [router.query])

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
    queryKey: ['api_page_detail', id],
    queryFn: () => {
      _ServerFetchingDetailPage()
    },
    enabled: !!id,
  })
  const _ServerFetchingDetailPage = async () => {
    const rResult = await apiReturnSales.apiPageDetail(id)
    sListData(
      rResult?.items.map((e) => {
        const child = e?.child.map((ce) => ({
          id: Number(ce?.id),
          idChildBackEnd: Number(ce?.id),
          disabledDate:
            (e.item?.text_type == 'material' && dataMaterialExpiry?.is_enable == '1' && false) ||
            (e.item?.text_type == 'material' && dataMaterialExpiry?.is_enable == '0' && true) ||
            (e.item?.text_type == 'products' && dataProductExpiry?.is_enable == '1' && false) ||
            (e.item?.text_type == 'products' && dataProductExpiry?.is_enable == '0' && true),
          warehouse: {
            label: ce?.location_name,
            value: ce?.location_warehouses_id,
            warehouse_name: ce?.warehouse_name,
          },
          quantityDelivered: e?.item?.quantity_create,
          quantityPay: e?.item?.quantity_returned,
          quantityLeft: e?.item?.quantity_left,
          unit: e?.item?.unit_name,
          quantity: Number(ce?.quantity),
          price: Number(ce?.price),
          discount: Number(ce?.discount_percent),
          tax: {
            tax_rate: ce?.tax_rate || '0',
            value: ce?.tax_id || '0',
            label: ce?.tax_name || 'Miễn thuế',
          },
          note: ce?.note,
        }))
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
    sIdChange({
      code: rResult.code,
      date: moment(rResult?.date).toDate(),
      idBranch: {
        label: rResult?.branch_name,
        value: rResult?.branch_id,
      },
      idClient: {
        label: rResult?.client_name,
        value: rResult?.client_id,
      },
      idTreatment: {
        label: dataLang[rResult?.handling_solution] || rResult?.handling_solution,
        value: rResult?.handling_solution,
      },
      note: rResult?.note,
    })
  }

  const handleSaveStatus = () => {
    isKeyState?.sListData([])
    isKeyState?.sId(isKeyState?.value)
    isKeyState?.idEmty && isKeyState?.idEmty(null)
    handleQueryId({ status: false })
  }

  const handleCancleStatus = () => {
    isKeyState?.sId({ ...isKeyState?.id })
    handleQueryId({ status: false })
  }

  const checkListData = (value, sListData, sId, id, idEmty) => {
    handleQueryId({
      status: true,
      initialKey: { value, sListData, sId, id, idEmty },
    })
  }

  const _HandleChangeInput = (type, value) => {
    const sIdClient = (e) => {
      sIdChange((list) => ({ ...list, idClient: e }))
    }

    const sIdBranch = (e) => {
      sIdChange((list) => ({ ...list, idBranch: e }))
    }

    const onChange = {
      code: () => sIdChange((e) => ({ ...e, code: value.target.value })),

      date: () => sIdChange((e) => ({ ...e, date: formatMoment(value, FORMAT_MOMENT.DATE_TIME_LONG) })),

      startDate: () => sIdChange((e) => ({ ...e, date: new Date() })),

      idClient: () => {
        if (idChange.idClient != value)
          if (listData?.length > 0) {
            checkListData(value, sListData, sIdClient, idChange.idClient)
          } else {
            sIdChange((e) => ({ ...e, idClient: value }))
          }
      },

      treatment: () => sIdChange((e) => ({ ...e, idTreatment: value })),

      note: () => sIdChange((e) => ({ ...e, note: value.target.value })),

      branch: () => {
        if (idChange.idBranch != value)
          if (listData?.length > 0) {
            checkListData(value, sListData, sIdBranch, idChange.idBranch, sIdClient)
          } else {
            sIdChange((e) => ({ ...e, idClient: null, idBranch: value }))
            if (value == null) {
              sIdChange((e) => ({ ...e, idClient: null }))
            }
          }
      },

      generalTax: () => {
        sGeneralTax(value)

        if (listData?.length > 0) {
          const newData = listData.map((e) => {
            const newChild = e?.child.map((ce) => ({ ...ce, tax: value }))
            return { ...e, child: newChild }
          })
          sListData(newData)
        }
      },

      generalDiscount: () => {
        sGeneralD(value?.value)
        if (listData?.length > 0) {
          const newData = listData.map((e) => {
            const newChild = e?.child.map((ce) => ({ ...ce, discount: value?.value }))

            return { ...e, child: newChild }
          })
          sListData(newData)
        }
      },
    }

    onChange[type] && onChange[type]()
  }

  useEffect(() => {
    if (idChange.idBranch !== null) sErrors((prevErrors) => ({ ...prevErrors, errBranch: false }))

    if (idChange.idClient !== null) sErrors((prevErrors) => ({ ...prevErrors, errClient: false }))

    if (idChange.idTreatment !== null) sErrors((prevErrors) => ({ ...prevErrors, errTreatment: false }))
  }, [idChange.idBranch, idChange.idClient, idChange.idTreatment])

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
      quantityDelivered: value?.e?.quantity_create,
      quantityPay: value?.e?.quantity_returned,
      quantityLeft: value?.e?.quantity_left,
      warehouse: null,
      unit: value?.e?.unit_name,
      price: Number(value?.e?.price),
      quantity: value?.e?.quantity_left,
      discount: generalDiscount ? generalDiscount : Number(value?.e?.discount_percent_item),
      tax: generalTax
        ? generalTax
        : {
            label: value?.e?.tax_name == null ? 'Miễn thuế' : value?.e?.tax_name,
            value: value?.e?.tax_id_item ? value?.e?.tax_id_item : '0',
            tax_rate: value?.e?.tax_rate ? value?.e?.tax_rate : '0',
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
    const { newChild } = _DataValueItem(value)

    const newData = listData?.map((e) => {
      if (e?.id == parentId) {
        return {
          ...e,
          child: [...e.child, { ...newChild, quantity: 0, note: '' }],
        }
      } else {
        return e
      }
    })
    sListData(newData)
  }

  const _HandleAddParent = (value) => {
    const selectedValues = value?.map((item) => item?.value) || []

    // Lấy danh sách đã có trong listData
    const existingMap = new Map(
      listData?.map((e) => [e?.matHang?.value, e]) // tạo map để tra nhanh
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

  const _HandleDeleteChild = (parentId, childId) => {
    const newData = listData
      .map((e) => {
        if (e.id === parentId) {
          const newChild = e.child?.filter((ce) => ce?.id != childId)
          return { ...e, child: newChild }
        }
        return e
      })
      .filter((e) => e.child?.length > 0)

    sListData([...newData])
  }

  const _HandleDeleteAllChild = (parentId) => {
    const newData = listData
      .map((e) => {
        if (e.id === parentId) {
          const newChild = e.child?.filter((ce) => ce?.warehouse != null)
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
        switch (type) {
          case 'quantity':
            sErrors((e) => ({ ...e, errSurvive: false }))

            ce.quantity = Number(value?.value)

            validateQuantity(parentId, childId, type)

            break
          case 'increase':
            sErrors((e) => ({ ...e, errSurvive: false }))

            ce.quantity = Number(ce?.quantity) + 1

            validateQuantity(parentId, childId, type)

            break
          case 'decrease':
            sErrors((e) => ({ ...e, errSurvive: false }))

            ce.quantity = Number(ce?.quantity) - 1
            break
          case 'price':
            sErrors((e) => ({ ...e, errSurvivePrice: false }))

            ce.price = Number(value?.value)
            break
          case 'discount':
            ce.discount = Number(value?.value)
            break
          case 'note':
            ce.note = value?.target.value
            break
          case 'warehouse':
            ce.warehouse = value
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
  /// Hàm kiểm tra số lượng
  const validateQuantity = (parentId, childId, type) => {
    const e = listData.find((item) => item?.id == parentId)
    if (!e) return
    const ce = e.child.find((child) => child?.id == childId)
    if (!ce) return

    const checkMsg = (mssg) => {
      isShow('error', `${mssg}`)
      ce.quantity = ''
      HandTimeout()
    }
    const checkChild = e.child.reduce((sum, opt) => sum + parseFloat(opt?.quantity || 0), 0)
    if (type == 'increase' && ce?.quantity > +ce?.quantityLeft) {
      checkMsg(`Số lượng vượt quá ${formatNumber(+ce?.quantityLeft)} số lượng còn lại`)
    } else if (checkChild > +ce?.quantityLeft) {
      checkMsg(`Tổng số lượng vượt quá ${formatNumber(+ce?.quantityLeft)} số lượng còn lại`)
    }
  }

  const HandTimeout = () => {
    setTimeout(() => {
      sErrors((e) => ({ ...e, errQuantity: true }))
      sFetchingData((e) => ({ ...e, load: true }))
    }, 500)
    setTimeout(() => {
      sFetchingData((e) => ({ ...e, load: false }))
    }, 1300)
  }

  const selectItemsLabel = (option) => {
    return (
      <div className="py-2 font-deca">
        <div className="flex items-center gap-3">
          <img
            src={option.e?.images ?? '/icon/noimagelogo.png'}
            alt={option.e?.name}
            className="xl:size-16 size-12 object-cover rounded-md"
          />

          <div className="font-normal 3xl:text-[10px] text-[9px] text-neutral-03 overflow-hidden">
            <h3 className="font-semibold responsive-text-sm truncate text-black">{option.e?.name}</h3>
            <div className="flex gap-2">
              <h5 className="text-typo-blue-4 truncate">
                {option.e?.code} : {option.e?.product_variation}
              </h5>
            </div>
            <div className="flex items-center gap-1">
              <h5>{option.e?.import_code} - </h5>
              <h5>{dataLang[option.e?.text_type]}</h5>
            </div>

            <div className="flex items-center gap-2 italic">
              {dataProductSerial.is_enable === '1' && <div>Serial: {option.e?.serial ? option.e?.serial : '-'}</div>}
              {dataMaterialExpiry.is_enable === '1' || dataProductExpiry.is_enable === '1' ? (
                <>
                  <div>Lot: {option.e?.lot ? option.e?.lot : '-'}</div>
                  <div>
                    Date:{' '}
                    {option.e?.expiration_date
                      ? formatMoment(option.e?.expiration_date, FORMAT_MOMENT.DATE_SLASH_LONG)
                      : '-'}
                  </div>
                </>
              ) : (
                ''
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
  const _HandleSubmit = (e) => {
    e.preventDefault()
    const checkChildItem = (childItem, property) => {
      switch (property) {
        case 'warehouse':
          return (
            childItem.warehouse == null || (id && (!childItem.warehouse?.label || !childItem.warehouse?.warehouse_name))
          )
        case 'quantity':
          return childItem.quantity == null || childItem.quantity == '' || childItem.quantity == 0
        case 'price':
          return childItem.price == null || childItem.price === ''
        default:
          return false
      }
    }

    const checkPropertyRecursive = (list, property) => {
      return list.some((item) => item.child?.some((childItem) => checkChildItem(childItem, property)))
    }

    const hasNullWarehouse = checkPropertyRecursive(listData, 'warehouse')

    const hasNullQuantity = checkPropertyRecursive(listData, 'quantity')

    const hasNullPrice = checkPropertyRecursive(listData, 'price')

    const isEmpty = listData?.length == 0

    if (
      !idChange.idClient ||
      !idChange.idTreatment ||
      !idChange.idBranch ||
      hasNullWarehouse ||
      hasNullQuantity ||
      hasNullPrice ||
      isEmpty
    ) {
      sErrors((e) => ({
        ...e,
        errClient: !idChange.idClient,
        errTreatment: !idChange.idTreatment,
        errBranch: !idChange.idBranch,
        errWarehouse: hasNullWarehouse,
        errQuantity: hasNullQuantity,
        errPrice: hasNullPrice,
      }))
      if (!idChange.idClient || !idChange.idTreatment || !idChange.idBranch) {
        isShow('error', `${dataLang?.required_field_null}`)
      } else if (isEmpty) {
        isShow('error', `Chưa nhập thông tin mặt hàng`)
      } else if (hasNullPrice) {
        isShow('error', `${'Vui lòng nhập đơn giá'}`)
      } else {
        isShow('error', `${dataLang?.required_field_null}`)
      }
    } else {
      sFetchingData((e) => ({ ...e, onSending: true }))
    }
  }
  const _ServerSending = async () => {
    let formData = new FormData()

    formData.append('code', idChange.code ? idChange.code : '')

    formData.append(
      'date',
      formatMoment(idChange.date, FORMAT_MOMENT.DATE_TIME_LONG)
        ? formatMoment(idChange.date, FORMAT_MOMENT.DATE_TIME_LONG)
        : ''
    )
    formData.append('branch_id', idChange.idBranch?.value ? idChange.idBranch?.value : '')
    formData.append('client_id', idChange.idClient?.value ? idChange.idClient?.value : '')
    formData.append('handling_solution', idChange.idTreatment?.value ? idChange.idTreatment?.value : '')
    formData.append('note', idChange.note ? idChange.note : '')
    listData.forEach((item, index) => {
      formData.append(`items[${index}][id]`, id ? item?.idParenBackend : '')
      formData.append(`items[${index}][item]`, item?.matHang?.value)

      const firstChild = item?.child?.[0]

      item?.child?.forEach((childItem, childIndex) => {
        formData.append(`items[${index}][child][${childIndex}][row_id]`, id ? childItem?.idChildBackEnd : '')
        formData.append(`items[${index}][child][${childIndex}][quantity]`, childItem?.quantity)
        formData.append(`items[${index}][child][${childIndex}][tax_id]`, childItem?.tax?.value)
        formData.append(`items[${index}][child][${childIndex}][price]`, childItem?.price)
        formData.append(`items[${index}][child][${childIndex}][location_warehouses_id]`, childItem?.warehouse?.value)
        formData.append(`items[${index}][child][${childIndex}][discount_percent]`, childItem?.discount)
        formData.append(`items[${index}][child][${childIndex}][note]`, firstChild?.note ? firstChild?.note : '')
      })
    })

    const { isSuccess, message } = await apiReturnSales.apiHandingReturnSales(id, formData)

    if (isSuccess) {
      isShow('success', `${dataLang[message] || message}` || message)

      resetAllStates()

      sListData([])

      router.push(routerReturnSales.home)
    } else {
      isShow('error', `${dataLang[message] || message}` || message)
    }
    sFetchingData((e) => ({ ...e, onSending: false }))
  }

  useEffect(() => {
    fetChingData.onSending && _ServerSending()
  }, [fetChingData.onSending])

  // breadcrumb
  const breadcrumbItems = [
    {
      label: `${dataLang?.returnSales_title || 'returnSales_title'}`,
    },
    {
      label: `${dataLang?.returnSales_titleLits || 'returnSales_titleLits'}`,
      href: routerReturnSales.home,
    },
    {
      label: `${
        id ? dataLang?.returnSales_edit || 'returnSales_edit' : dataLang?.returnSales_add || 'returnSales_add'
      }`,
    },
  ]

  return (
    <LayoutOrderManagement
      dataLang={dataLang}
      titleHead={id ? dataLang?.returnSales_edit || 'returnSales_edit' : dataLang?.returnSales_add || 'returnSales_add'}
      breadcrumbItems={breadcrumbItems}
      titleLayout={dataLang?.returnSales_titleLits || 'returnSales_titleLits'}
      searchBar={
        <div className="w-full">
          <SelectSearch
            options={options}
            onChange={(value) => {
              _HandleAddParent(value)
            }}
            value={listData?.map((e) => e?.matHang)}
            formatOptionLabel={(option) => selectItemsLabel(option)}
            placeholder={dataLang?.returns_items || 'returns_items'}
          />
        </div>
      }
      tableLeft={
        <>
          {listData?.length === 0 ? (
            <EmptyData />
          ) : (
            <div>
              <div className="grid grid-cols-12 items-center gap-3 2xl:gap-4 sticky top-0 z-10 py-2 border-b border-gray-100">
                <TableHeader className="text-left col-span-3">
                  {dataLang?.import_from_items || 'import_from_items'}
                </TableHeader>
                <div className="col-span-9">
                  <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.2fr)] gap-3 2xl:gap-4">
                    <TableHeader className="text-center">{dataLang?.PDF_house || 'PDF_house'}</TableHeader>
                    <TableHeader className="text-center">
                      {dataLang?.import_from_quantity || 'import_from_quantity'}
                    </TableHeader>
                    <TableHeader className="text-center">
                      {dataLang?.import_from_unit_price || 'import_from_unit_price'}
                    </TableHeader>
                    {/* Chọn hàng loạt % Chiếu khấu */}
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
                      {dataLang?.import_into_money || 'import_into_money'}
                    </TableHeader>
                  </div>
                </div>
              </div>

              <Customscrollbar className="max-h-[780px] overflow-auto pb-2">
                <div className="h-full w-full">
                  {/* {isFetching ? (
                <Loading className="w-full h-10" color="#0f4f9e" />
              ) : (
                <> */}
                  {listData?.map((e, index) => {
                    const option = e?.matHang
                    const firstChild = e.child[0]
                    const isLast = index === listData.length - 1

                    return (
                      <div
                        key={e?.id?.toString()}
                        className={`grid items-center grid-cols-12 gap-3 2xl:gap-4 py-2 ${
                          isLast ? '' : 'border-b border-[#F3F3F4]'
                        }`}
                      >
                        {/* Mặt hàng */}
                        <div className="h-full col-span-3">
                          <div className="flex items-center justify-between gap-1 xl:gap-2">
                            <div className="flex items-start">
                              <div className="flex xl:flex-row flex-col items-start gap-3">
                                <img
                                  src={option?.e?.images ?? '/icon/noimagelogo.png'}
                                  alt={option?.e?.name}
                                  className="size-12 object-cover rounded-md"
                                />
                                <div className="flex flex-col gap-[2px] responsive-text-xxs overflow-hidden text-neutral-03 font-normal">
                                  <h3 className="font-semibold responsive-text-sm text-brand-color">
                                    {option.e?.name}
                                  </h3>
                                  <div>
                                    {option.e?.code} : {option.e?.product_variation}
                                  </div>
                                  <div>ĐVT: {firstChild?.unit}</div>
                                  {option.e?.import_code && (
                                    <div className="flex items-center gap-1">
                                      <h5>
                                        {option.e?.import_code} - {dataLang[option.e?.text_type]}
                                      </h5>
                                    </div>
                                  )}

                                  <div className="flex items-center gap-2 italic">
                                    {dataProductSerial.is_enable === '1' && (
                                      <div>Serial: {option.e?.serial ? option.e?.serial : '-'}</div>
                                    )}
                                    {dataMaterialExpiry.is_enable === '1' || dataProductExpiry.is_enable === '1' ? (
                                      <div>
                                        Lot: {option.e?.lot ? option.e?.lot : '-'} - Date:{' '}
                                        {option.e?.expiration_date
                                          ? formatMoment(option.e?.expiration_date, FORMAT_MOMENT.DATE_SLASH_LONG)
                                          : '-'}
                                      </div>
                                    ) : (
                                      ''
                                    )}
                                  </div>
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
                              name="optionEmail"
                              type="text"
                              className="focus:border-[#92BFF7] placeholder:responsive-text-xs 2xl:h-7 xl:h-5 py-0 px-1 responsive-text-xs placeholder-slate-300 w-full bg-white rounded-[5.5px] text-[#1C252E] font-normal outline-none placeholder:text-typo-gray-4"
                            />
                          </div>
                          {/* Xóa mặt hàng chưa chọn kho*/}
                          {e?.child?.filter((e) => e?.warehouse == null).length >= 2 && (
                            <button
                              onClick={_HandleDeleteAllChild.bind(this, e?.id, e?.matHang)}
                              className="text-xs text-center w-full rounded-lg mt-2 px-5 py-2 overflow-hidden group bg-rose-500 relative hover:bg-gradient-to-r hover:from-rose-500 hover:to-rose-400 text-white transition-all ease-out duration-300"
                            >
                              Xóa {e?.child?.filter((e) => e?.warehouse == null).length} hàng chưa chọn kho
                            </button>
                          )}
                        </div>
                        <div className="items-center col-span-9">
                          <div className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.2fr)] items-center gap-3 2xl:gap-4 py-1">
                            {/* {fetChingData.load ? (
                          <Loading className="h-2 col-span-8" color="#0f4f9e" />
                        ) : ( */}
                            {e?.child?.map((ce) => (
                              <React.Fragment key={ce?.id?.toString()}>
                                {/* Kho - Vị trí kho */}
                                <div className="flex items-center h-full">
                                  <SelectCustomLabel
                                    dataLang={dataLang}
                                    placeholder={fetChingData.onLoadingChild ? '' : dataLang?.PDF_house || 'PDF_house'}
                                    options={dataWarehouse}
                                    value={ce?.warehouse}
                                    onChange={(value) => _HandleChangeChild(e?.id, ce?.id, 'warehouse', value)}
                                    formatNumber={formatNumber}
                                    isError={
                                      (errors.errWarehouse && ce?.warehouse == null) ||
                                      (errors.errWarehouse &&
                                        (ce?.warehouse?.label == null || ce?.warehouse?.warehouse_name == null))
                                    }
                                    isVisibleLotDate={false}
                                  />
                                </div>
                                {/* Số lượng */}
                                <div className="flex items-center justify-center">
                                  <div
                                    className={`relative flex items-center justify-center h-8 2xl:h-10 3xl:p-2 xl:p-[2px] p-[1px] border rounded-3xl ${
                                      errors.errQuantity &&
                                      (ce?.quantity === null || ce?.quantity === '' || ce?.quantity === 0)
                                        ? 'border-red-500'
                                        : errors.errSurvive
                                        ? 'border-red-500'
                                        : 'focus:border-brand-color hover:border-brand-color border-neutral-N400'
                                    } ${(ce?.quantity === 0 || ce?.quantity === '') && 'border-red-500'}  `}
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
                                      isAllowed={({ floatValue }) => {
                                        if (+floatValue > +ce?.quantityLeft) {
                                          isShow(
                                            'error',
                                            `Số lượng chỉ được bé hơn hoặc bằng ${formatNumber(
                                              +ce?.quantityLeft
                                            )} số lượng còn lại`
                                          )
                                          return false
                                        } else {
                                          return true
                                        }
                                      }}
                                    />
                                    <button
                                      className="2xl:scale-100 xl:scale-90 scale-75 font-bold flex items-center justify-center p-0.5  bg-primary-05 hover:bg-typo-blue-4/50 rounded-full"
                                      onClick={_HandleChangeChild.bind(this, e?.id, ce?.id, 'increase')}
                                    >
                                      <Add size="16" className="scale-75 2xl:scale-100 xl:scale-90" />
                                    </button>
                                    <div className="absolute -top-4 -right-2 p-1 cursor-pointer">
                                      <Popup
                                        trigger={
                                          <div className="relative ">
                                            <TableDocument size="18" color="#4f46e5" className="font-medium" />
                                            <span className="h-2 w-2  absolute top-0 left-1/2  translate-x-[50%] -translate-y-[50%]">
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
                                            Sl đã giao: {formatNumber(+ce?.quantityDelivered)}
                                          </span>
                                          <span className="text-xs font-medium">
                                            Sl đã trả: {formatNumber(ce?.quantityPay)}
                                          </span>
                                          <span className="text-xs font-medium">
                                            Sl còn lại: {formatNumber(ce?.quantityLeft)}
                                          </span>
                                        </div>
                                      </Popup>
                                    </div>
                                  </div>
                                </div>
                                {/* Đơn giá */}
                                <div
                                  className={`flex items-center justify-center h-8 2xl:h-10 py-1 px-2 2xl:px-3 rounded-lg border ${
                                    errors.errPrice && (ce?.price === null || ce?.price === '')
                                      ? 'border-red-500'
                                      : errors.errSurvivePrice && (ce?.price === null || ce?.price === '')
                                      ? 'border-red-500'
                                      : 'border-neutral-N400 focus:border-brand-color hover:border-brand-color'
                                  } ${
                                    (ce?.price === null || ce?.price === '') &&
                                    'border-red-500 hover:border-red-500 focus:border-red-500'
                                  } `}
                                >
                                  <InPutMoneyFormat
                                    className={`appearance-none text-center responsive-text-sm font-semibold w-full mx-0 focus:outline-none`}
                                    onValueChange={_HandleChangeChild.bind(this, e?.id, ce?.id, 'price')}
                                    value={ce?.price}
                                    isAllowed={isAllowedNumber}
                                    isSuffix=" đ"
                                  />
                                </div>
                                {/* % Chiết khấu */}
                                <div className="flex items-center justify-end h-8 2xl:h-10 py-2 px-2 2xl:px-3 rounded-lg border border-neutral-N400 focus:border-brand-color hover:border-brand-color responsive-text-sm font-semibold">
                                  <InPutNumericFormat
                                    className="appearance-none w-full focus:outline-none text-right"
                                    onValueChange={_HandleChangeChild.bind(this, e?.id, ce?.id, 'discount')}
                                    value={ce?.discount}
                                    isAllowed={isAllowedDiscount}
                                    allowNegative={false}
                                  />
                                  <span className="pl-[2px] 2xl:pl-1">%</span>
                                </div>
                                {/* Đơn giá sau chiết khấu */}
                                <div
                                  className={`flex items-center justify-center text-center responsive-text-sm font-semibold`}
                                >
                                  <h3>{formatMoney(Number(ce?.price) * (1 - Number(ce?.discount) / 100))}</h3>
                                  <span className="pl-1 underline">đ</span>
                                </div>
                                {/* % Thuế */}
                                <div className="flex items-center h-full">
                                  <SelectCustomLabel
                                    placeholder={dataLang?.import_from_tax || 'import_from_tax'}
                                    options={taxOptions}
                                    value={ce?.tax}
                                    onChange={(value) => _HandleChangeChild(e?.id, ce?.id, 'tax', value)}
                                    renderOption={(option, isLabel) => (
                                      <div
                                        className={`flex items-center justify-start gap-1 responsive-text-sm ${
                                          isLabel ? 'py-1 2xl:py-2' : ''
                                        }`}
                                      >
                                        <h2 className="">{option?.label}</h2>
                                        {option?.tax_rate !== '0' && option?.tax_rate !== '5' && (
                                          <h2>
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
                                  total={formatMoney(
                                    ce?.price *
                                      (1 - Number(ce?.discount) / 100) *
                                      (1 + Number(ce?.tax?.tax_rate) / 100) *
                                      Number(ce?.quantity)
                                  )}
                                  onDelete={_HandleDeleteChild.bind(this, e?.id, ce?.id)}
                                />
                              </React.Fragment>
                            ))}
                            {/*   )} */}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {/* </>
              )} */}
                </div>
              </Customscrollbar>
            </div>
          )}
        </>
      }
      info={
        <div className="flex flex-col gap-4 relative">
          {/* Mã chứng từ */}
          <DocumentNumber dataLang={dataLang} value={idChange.code} onChange={_HandleChangeInput.bind(this, 'code')} />
          {/* Ngày chứng từ */}
          <div className="flex flex-col flex-wrap items-center gap-y-3">
            <InfoFormLabel label={dataLang?.import_day_vouchers || 'import_day_vouchers'} />

            <div className="relative w-full flex flex-row custom-date-picker date-form">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                <CalendarBlankIcon color="#7a7a7a" className="size-4 opacity-60" />
              </span>
              <ConfigProvider locale={viVN}>
                <DatePicker
                  className="sales-product-date pl-9 placeholder:text-secondary-color-text-disabled cursor-pointer"
                  allowClear={false}
                  placeholder={dataLang?.price_quote_system_default || 'price_quote_system_default'}
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
                      sIdChange((e) => ({ ...e, date: dateString }))
                      _HandleChangeInput('date', dateString)
                    }
                  }}
                />
              </ConfigProvider>
            </div>
          </div>
          {/* Khách hàng */}
          <SelectWithRadio
            isRequired={true}
            label={dataLang?.returnSales_client || 'returnSales_client'}
            placeholderText="Chọn khách hàng"
            options={dataClient}
            value={idChange.idClient}
            onChange={(value) => {
              const newValue = dataClient.find((item) => item.value === value)
              _HandleChangeInput('idClient', newValue)
            }}
            isError={errors.errClient}
            sSearch={sSearchClient}
            dataLang={dataLang}
            icon={<LuBriefcase />}
            errMess={dataLang?.returnSales_errClient || 'returnSales_errClient'}
          />

          {/* Phương thức xử lí */}
          <SelectWithRadio
            isRequired={true}
            label={dataLang?.returns_treatment_methods || 'returns_treatment_methods'}
            placeholderText="Chọn phương thức xử lý"
            options={dataSolution}
            value={idChange.idTreatment}
            onChange={(value) => {
              const newValue = dataSolution.find((item) => item.value === value)
              _HandleChangeInput('treatment', newValue)
            }}
            isError={errors.errTreatment}
            dataLang={dataLang}
            icon={<LuRefreshCcw />}
            errMess={dataLang?.returns_treatment_methods_err || 'returns_treatment_methods_err'}
          />

          {/* Chi nhánh */}
          <SelectWithRadio
            isRequired={true}
            label={dataLang?.import_branch || 'import_branch'}
            placeholderText="Chọn chi nhánh"
            options={listBranch}
            value={idChange.idBranch}
            onChange={(value) => {
              const newValue = listBranch.find((item) => item.value === value)
              _HandleChangeInput('branch', newValue)
            }}
            isError={errors.errBranch}
            icon={<PiMapPinLight />}
            errMess={dataLang?.purchase_order_errBranch || 'purchase_order_errBranch'}
          />
        </div>
      }
      note={
        <div className="flex flex-col">
          <h4 className="responsive-text-base font-normal text-secondary-color-text mb-3 capitalize">
            {dataLang?.returns_reason || 'returns_reason'}
          </h4>
          <div className="w-full pb-6">
            <textarea
              value={idChange.note}
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
      routerBack={routerReturnSales.home}
      onSave={_HandleSubmit.bind(this)}
      onSending={initsFetching.onSending}
      popupConfim={
        <PopupConfim
          dataLang={dataLang}
          type="warning"
          title={TITLE_DELETE_ITEMS}
          nameModel={'change_item'}
          subtitle={CONFIRMATION_OF_CHANGES}
          isOpen={isOpen}
          save={handleSaveStatus}
          cancel={handleCancleStatus}
        />
      }
    />
  )
}

export default ReturnSalesForm
