import apiImport from '@/Api/apiPurchaseOrder/apiImport'
import DropdownDiscount from '@/components/common/orderManagement/DropdownDiscount'
import DropdownTax from '@/components/common/orderManagement/DropdownTax'
import { DocumentDate, DocumentNumber } from '@/components/common/orderManagement/GeneralInfo'
import InfoFormLabel from '@/components/common/orderManagement/InfoFormLabel'
import ItemTotalAndDelete from '@/components/common/orderManagement/ItemTotalAndDelete'
import LayoutOrderManagement from '@/components/common/orderManagement/LayoutOrderManagement'
import SelectCustomLabel from '@/components/common/orderManagement/SelectCustomLabel'
import SelectSearch from '@/components/common/orderManagement/SelectSearch'
import SelectWithRadio from '@/components/common/orderManagement/SelectWithRadio'
import TableHeader from '@/components/common/orderManagement/TableHeader'
import TextareaNote from '@/components/common/orderManagement/TextareaNote'
import { Customscrollbar } from '@/components/UI/common/Customscrollbar'
import { TagColorProduct } from '@/components/UI/common/Tag/TagStatus'
import EmptyData from '@/components/UI/emptyData'
import InPutMoneyFormat from '@/components/UI/inputNumericFormat/inputMoneyFormat'
import InPutNumericFormat from '@/components/UI/inputNumericFormat/inputNumericFormat'
import Loading from '@/components/UI/loading/loading'
import PopupConfim from '@/components/UI/popupConfim/popupConfim'
import { CONFIRMATION_OF_CHANGES, TITLE_DELETE_ITEMS } from '@/constants/delete/deleteItems'
import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate'
import { useSupplierList } from '@/containers/suppliers/supplier/hooks/useSupplierList'
import { useBranchList } from '@/hooks/common/useBranch'
import { useTaxList } from '@/hooks/common/useTaxs'
import { useWarehouseComboboxlocation } from '@/hooks/common/useWarehouses'
import useFeature from '@/hooks/useConfigFeature'
import useSetingServer from '@/hooks/useConfigNumber'
import useToast from '@/hooks/useToast'
import { useToggle } from '@/hooks/useToggle'
import { routerImport } from '@/routers/buyImportGoods'
import { isAllowedDiscount, isAllowedNumber } from '@/utils/helpers/common'
import { formatMoment } from '@/utils/helpers/formatMoment'
import formatMoneyConfig from '@/utils/helpers/formatMoney'
import formatNumberConfig from '@/utils/helpers/formatnumber'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ConfigProvider, DatePicker as DatePickerAntd, Dropdown } from 'antd'
import viVN from 'antd/lib/locale/vi_VN'
import dayjs from 'dayjs'
import { AnimatePresence, motion } from 'framer-motion'
import { Add, ArrowDown2, Minus } from 'iconsax-react'
import moment from 'moment/moment'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { PiClipboardTextLight, PiMapPinLight, PiUsersLight } from 'react-icons/pi'
import { useSelector } from 'react-redux'
import { v4 as uuidv4 } from 'uuid'
import { useImportBySupplier } from './hooks/useImportBySupplier'
import { useImportItemByOrder } from './hooks/useImportItemByOrder'

const PurchaseImportForm = (props) => {
  const router = useRouter()

  const id = router.query?.id

  const dataSeting = useSetingServer()

  const dataLang = props?.dataLang

  const isShow = useToast()

  const { isOpen, isKeyState, handleQueryId } = useToggle()

  const [onSending, sOnSending] = useState(false)

  const [tax, sTax] = useState()

  const [discount, sDiscount] = useState(0)

  const [code, sCode] = useState('')

  const [searchOrder, sSearchOrder] = useState('')

  const [startDate, sStartDate] = useState(new Date())

  const [effectiveDate, sEffectiveDate] = useState(null)

  const [note, sNote] = useState('')

  const [date, sDate] = useState(moment().format(FORMAT_MOMENT.DATE_TIME_LONG))

  const { dataMaterialExpiry, dataProductExpiry, dataProductSerial } = useFeature()
  //new
  const [listData, sListData] = useState([])

  const [idSupplier, sIdSupplier] = useState(null)

  const [idSurplusWarehouse, sIdSurplusWarehouse] = useState(null)

  const [idTheOrder, sIdTheOrder] = useState(null)

  const [idBranch, sIdBranch] = useState(null)

  const [errSupplier, sErrSupplier] = useState(false)

  const [errDate, sErrDate] = useState(false)

  const [errDateList, sErrDateList] = useState(false)

  const [errBranch, sErrBranch] = useState(false)

  const [errWarehouse, sErrWarehouse] = useState(false)

  const [errLot, sErrLot] = useState(false)

  const [errSerial, sErrSerial] = useState(false)

  const [warehouseAll, sWarehouseAll] = useState(null)

  const [total, setTotal] = useState({
    totalMoney: 0,
    totalDiscount: 0,
    toalAffterDiscount: 0,
    totalTax: 0,
    totalAmountMoney: 0,
  })

  const [inputValue, setInputValue] = useState('')

  const authState = useSelector((state) => state.auth)

  const { data: dataBranch = [] } = useBranchList()

  const { data: dataTasxes = [] } = useTaxList()

  const { data: dataItems = [] } = useImportItemByOrder(id, idTheOrder, idBranch, idSupplier, inputValue)

  const { data: dataTheOrder = [] } = useImportBySupplier(idSupplier, id, searchOrder)

  const { data: dataWarehouse } = useWarehouseComboboxlocation({
    'filter[branch_id]': idBranch ? idBranch?.value : null,
  })

  const { data: dataSupplierList } = useSupplierList({ 'filter[branch_id]': idBranch != null ? idBranch.value : null })

  const dataSupplier = idBranch ? dataSupplierList?.rResult?.map((e) => ({ label: e?.name, value: e?.id })) : []

  // Tự động chọn chi nhánh đầu tiên từ authState khi component mount
  useEffect(() => {
    if (authState.branch?.length > 0 && !idBranch) {
      const firstBranch = {
        label: authState.branch[0].name,
        value: authState.branch[0].id,
      }
      sIdBranch(firstBranch)
    }
  }, [])

  useEffect(() => {
    router.query && sErrDate(false)
    router.query && sErrSupplier(false)
    router.query && sErrBranch(false)
    router.query && sErrSerial(false)
    router.query && sErrLot(false)
    router.query && sErrDateList(false)
    router.query && sStartDate(new Date())
    router.query && sNote('')
  }, [router.query])

  const { isFetching } = useQuery({
    queryKey: ['api_detail_page_import', id],
    queryFn: async () => {
      const rResult = await apiImport.apiDetailPageImport(id)
      console.log('rResult', rResult)

      sListData(
        rResult?.items.map((e) => ({
          id: e?.item?.id,
          item: {
            e: e?.item,
            label: `${e.item?.name} <span style={{display: none}}>${
              e.item?.code + e.item?.product_variation + e.item?.text_type + e.item?.unit_name
            }</span>`,
            value:
              e.item?.purchase_order_item_id === '0' ? e.item?.id : e.item?.id + '__' + e.item?.purchase_order_item_id,
            // value: e.item?.id,
          },
          child: e?.child.map((ce) => ({
            id: Number(ce?.id),
            id_plan: ce?.id_plan,
            purchase_order_item_id: ce?.purchase_order_item_id,
            reference_no_plan: ce?.reference_no_plan,
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
            serial: ce?.serial == null ? '' : ce?.serial,
            lot: ce?.lot == null ? '' : ce?.lot,
            date: ce?.expiration_date != null ? moment(ce?.expiration_date).toDate() : null,
            unit: e?.item?.unit_name,
            amount: Number(ce?.quantity),
            price: Number(ce?.price),
            discount: Number(ce?.discount_percent),
            tax: {
              tax_rate: ce?.tax_rate,
              value: ce?.tax_id,
              label: ce?.tax_id && !ce?.tax_name ? 'Miễn thuế' : ce?.tax_name,
            },
            note: ce?.note,
          })),
        }))
      )
      sIdSurplusWarehouse(
        rResult?.warehouse_id > 0
          ? {
              label: rResult?.location_name,
              value: rResult?.warehouse_id,
              warehouse_name: rResult?.warehouse_name,
            }
          : null
      )
      sCode(rResult?.code)
      sIdBranch({ label: rResult?.branch_name, value: rResult?.branch_id })
      sIdSupplier({ label: rResult?.supplier_name, value: rResult?.supplier_id })
      sIdTheOrder(
        rResult?.purchase_order_id ? { label: rResult?.purchase_order_code, value: rResult?.purchase_order_id } : null
      )
      sStartDate(moment(rResult?.date).toDate())
      sNote(rResult?.note)
      return rResult
    },
    enabled: !!id,
  })

  const resetValue = () => {
    if (isKeyState?.type === 'supplier') {
      sListData([])
      sIdSupplier(isKeyState?.value)
      sIdTheOrder(null)
    }
    if (isKeyState?.type === 'theorder') {
      sListData([])
      sIdTheOrder(isKeyState?.value)
    }
    if (isKeyState?.type === 'branch') {
      sListData([])
      sIdBranch(isKeyState.value)
    }
    handleQueryId({ status: false })
  }

  useEffect(() => {
    sWarehouseAll(null)
  }, [idBranch])

  const _DataValueItem = (e, index) => {
    return {
      id: uuidv4(),
      time: index,
      item: e,
      child: [
        {
          id_plan: e?.e?.id_plan,
          reference_no_plan: e?.e?.reference_no_plan,
          warehouse: null,
          disabledDate:
            (e?.e?.text_type === 'material' && dataMaterialExpiry?.is_enable === '1' && false) ||
            (e?.e?.text_type === 'material' && dataMaterialExpiry?.is_enable === '0' && true) ||
            (e?.e?.text_type === 'products' && dataProductExpiry?.is_enable === '1' && false) ||
            (e?.e?.text_type === 'products' && dataProductExpiry?.is_enable === '0' && true),
          serial: '',
          lot: '',
          date: null,
          unit: e?.e?.unit_name,
          amount: Number(e?.e?.quantity_left) || 1,
          price: e?.e?.price,
          discount: 0, // Changed from: discount ? discount : e?.e?.discount_percent
          priceAfter: Number(e?.e?.price_after_discount),
          tax: tax
            ? tax
            : {
                label: e?.e?.tax_name,
                value: e?.e?.tax_id || 0,
                tax_rate: e?.e?.tax_rate,
              },
          totalMoney: Number(e?.e?.amount),
          note: e?.e?.note,
        },
      ],
    }
  }

  const _HandleChangeInput = (type, value) => {
    console.log('_HandleChangeInput', type, value)

    if (type == 'code') {
      sCode(value.target.value)
    } else if (type === 'date') {
      sDate(formatMoment(value.target.value, FORMAT_MOMENT.DATE_TIME_LONG))
    } else if (type === 'supplier' && idSupplier != value) {
      if (listData?.length > 0) {
        if (type === 'supplier' && idSupplier != value) {
          handleQueryId({ status: true, initialKey: { type, value } })
        }
      } else {
        sIdTheOrder(null)
        sIdSupplier(null)
        sWarehouseAll(null)
      }
      if (listData.length === 0) {
        sIdSupplier(value)
        sIdTheOrder(null)
      }
    } else if (type === 'theorder') {
      if (listData?.length > 0) {
        if (type === 'theorder' && idTheOrder != value) {
          handleQueryId({ status: true, initialKey: { type, value } })
        }
      }
      if (listData.length == 0) {
        sIdTheOrder(value)
      }
    } else if (type === 'note') {
      sNote(value.target.value)
    } else if (type == 'branch' && idBranch != value) {
      if (listData?.length > 0) {
        if (type === 'branch' && idBranch != value) {
          handleQueryId({ status: true, initialKey: { type, value } })
        }
      } else {
        sIdBranch(value)
        sIdTheOrder(null)
        sIdSupplier(null)
        sWarehouseAll(null)
      }
    } else if (type == 'idSurplusWarehouse') {
      sIdSurplusWarehouse(value)
    } else if (type == 'itemAll') {
      if (value?.length === 0) {
        // Nếu không còn mặt hàng nào được chọn, xóa toàn bộ danh sách
        sListData([])
      } else {
        // Xóa các item không còn trong value
        const updatedListData = listData.filter(existingItem =>
          value.some(selectedItem => selectedItem.value === existingItem.item.value)
        )
        // Thêm các mặt hàng mới được chọn
        const newSelectedItems = value.filter(selectedItem =>
          !updatedListData.some(existingItem => existingItem.item.value === selectedItem.value)
        )
        const newData = newSelectedItems.map((e, index) =>
          _DataValueItem(e, updatedListData.length + index)
        )
        sListData([...newData, ...updatedListData])
      }
    } else if (type === 'warehouseAll') {
      sWarehouseAll(value)
      if (listData?.length > 0) {
        const newData = listData.map((e) => {
          const newChild = e?.child.map((ce) => {
            return { ...ce, warehouse: value }
          })
          return { ...e, child: newChild }
        })
        sListData(newData)
      }
    } else if (type == 'tax') {
      sTax(value)
      if (listData?.length > 0) {
        const newData = listData.map((e) => {
          const newChild = e?.child.map((ce) => {
            return { ...ce, tax: value }
          })
          return { ...e, child: newChild }
        })
        sListData(newData)
      }
    } else if (type == 'discount') {
      sDiscount(value?.value)
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

  const _HandleSubmit = (e) => {
    e.preventDefault()

    const hasNullWarehouse = listData.some((item) =>
      item.child?.some(
        (childItem) =>
          childItem?.id_plan == 0 &&
          (childItem.warehouse === null ||
            (id && (childItem.warehouse?.label === null || childItem.warehouse?.warehouse_name === null)))
      )
    )

    const hasNullSerial = listData.some(
      (item) =>
        item?.item.e?.text_type === 'products' &&
        item.child?.some((childItem) => childItem.serial === '' || childItem.serial == null)
    )

    const hasNullLot = listData.some((item) =>
      item.child?.some((childItem) => !childItem.disabledDate && (childItem.lot === '' || childItem.lot == null))
    )

    const hasNullDate = listData.some((item) =>
      item.child?.some((childItem) => !childItem.disabledDate && childItem.date === null)
    )

    const checkNumber = listData.some((item) =>
      item.child?.some(
        (childItem) =>
          childItem.price === '' ||
          childItem.price === null ||
          childItem.amount === '' ||
          childItem.amount === 0 ||
          childItem.amount === null
      )
    )
    if (
      idSupplier == null ||
      idBranch == null ||
      // idTheOrder == null ||
      hasNullWarehouse ||
      (dataProductSerial?.is_enable == '1' && hasNullSerial) ||
      // ((dataProductExpiry?.is_enable == "1" || dataMaterialExpiry?.is_enable == "1") && hasNullLot) ||
      // ((dataProductExpiry?.is_enable == "1" || dataMaterialExpiry?.is_enable == "1") && hasNullDate) ||
      checkNumber
    ) {
      idSupplier == null && sErrSupplier(true)
      idBranch == null && sErrBranch(true)
      // idTheOrder == null && sErrTheOrder(true);
      hasNullWarehouse && sErrWarehouse(true)
      // hasNullLot && sErrLot(true);
      hasNullSerial && sErrSerial(true)
      // hasNullDate && sErrDateList(true);
      isShow('error', `${dataLang?.required_field_null}`)
    } else {
      sErrWarehouse(false)
      sErrLot(false)
      sErrSerial(false)
      sErrDateList(false)
      sOnSending(true)
    }
  }
  useEffect(() => {
    sErrDate(false)
  }, [date != null])

  useEffect(() => {
    sErrSupplier(false)
  }, [idSupplier != null])

  useEffect(() => {
    sErrBranch(false)
  }, [idBranch != null])

  const options = dataItems?.map((e) => ({
    label: `${e.name} <span style={{display: none}}>${e.code}</span><span style={{display: none}}>${e.product_variation} </span><span style={{display: none}}>${e.text_type} ${e.unit_name} </span>`,
    value: e.id,
    e,
  }))

  useEffect(() => {
    idBranch == null && sIdTheOrder(null)
  }, [idBranch])

  const taxOptions = [{ label: 'Miễn thuế', value: '0', tax_rate: '0' }, ...dataTasxes]

  const formatNumber = (number) => {
    return formatNumberConfig(+number, dataSeting)
  }

  const formatMoney = (number) => {
    return formatMoneyConfig(+number, dataSeting)
  }

  const caculateAmount = (option) => {
    const totalPrice = option?.reduce((accumulator, item) => {
      const childTotal = item.child?.reduce((childAccumulator, childItem) => {
        const product = Number(childItem?.price) * Number(childItem?.amount)
        return childAccumulator + product
      }, 0)
      return accumulator + childTotal
    }, 0)

    const totalDiscountPrice = option?.reduce((accumulator, item) => {
      const childTotal = item.child?.reduce((childAccumulator, childItem) => {
        const product = Number(childItem?.price) * (Number(childItem?.discount) / 100) * Number(childItem?.amount)
        return childAccumulator + product
      }, 0)
      return accumulator + childTotal
    }, 0)

    const totalDiscountAfterPrice = option?.reduce((accumulator, item) => {
      const childTotal = item.child?.reduce((childAccumulator, childItem) => {
        const product = Number(childItem?.price * (1 - childItem?.discount / 100)) * Number(childItem?.amount)
        return childAccumulator + product
      }, 0)
      return accumulator + childTotal
    }, 0)

    const totalTax = option?.reduce((accumulator, item) => {
      const childTotal = item.child?.reduce((childAccumulator, childItem) => {
        const product =
          Number(childItem?.price * (1 - childItem?.discount / 100)) *
          (isNaN(childItem?.tax?.tax_rate) ? 0 : Number(childItem?.tax?.tax_rate) / 100) *
          Number(childItem?.amount)
        return childAccumulator + product
      }, 0)
      return accumulator + childTotal
    }, 0)
console.log(option)
    const totalAmount = option?.reduce((accumulator, item) => {
      const childTotal = item.child?.reduce((childAccumulator, childItem) => {
        const product =
          Number(childItem?.price * ((1 - childItem?.discount / 100) || 0)) *
          (1 + Number(childItem?.tax?.tax_rate || 0) / 100) *
          Number(childItem?.amount)
        return childAccumulator + product
      }, 0)
      return accumulator + childTotal
    }, 0)

    console.log('Chi tiết tính toán:', {
      totalPrice,
      totalDiscountPrice,
      totalDiscountAfterPrice,
      totalTax,
      totalAmount
    })

    return {
      totalPrice: totalPrice || 0,
      totalDiscountPrice: totalDiscountPrice || 0,
      totalDiscountAfterPrice: totalDiscountAfterPrice || 0,
      totalTax: totalTax || 0,
      totalAmount: totalAmount || 0,
    }
  }

  useEffect(() => {
    const totalMoney = caculateAmount(listData)
    setTotal(totalMoney)
  }, [listData])

  const handleTimeChange = (date) => {
    sStartDate(date)
  }

  const handingImport = useMutation({
    mutationFn: (data) => {
      return apiImport.apiHandingImport(id, data)
    },
  })

  const _ServerSending = () => {
    let formData = new FormData()
    formData.append('code', code)
    formData.append('date', formatMoment(startDate, FORMAT_MOMENT.DATE_TIME_LONG))
    formData.append('branch_id', idBranch.value)
    formData.append('suppliers_id', idSupplier.value)
    formData.append('id_order', idTheOrder?.value ? idTheOrder?.value : 0)
    formData.append('warehouse_id', idSurplusWarehouse?.value ?? 0)
    formData.append('note', note)
    listData.forEach((item, index) => {
      formData.append(`items[${index}][id]`, item?.id)
      formData.append(`items[${index}][item]`, item?.item?.value)
      formData.append(`items[${index}][purchase_order_item_id]`, item?.item?.e?.purchase_order_item_id ?? 0)
      item?.child?.forEach((childItem, childIndex) => {
        formData.append(`items[${index}][child][${childIndex}][id]`, childItem?.id)
        formData.append(`items[${index}][child][${childIndex}][id_plan]`, childItem?.id_plan ?? 0)
        {
          id &&
            formData.append(
              `items[${index}][child][${childIndex}][row_id]`,
              typeof childItem?.id == 'number' ? childItem?.id : 0
            )
        }
        formData.append(`items[${index}][child][${childIndex}][quantity]`, childItem?.amount)
        formData.append(
          `items[${index}][child][${childIndex}][serial]`,
          childItem?.serial === null ? '' : childItem?.serial
        )
        formData.append(`items[${index}][child][${childIndex}][lot]`, childItem?.lot === null ? '' : childItem?.lot)
        formData.append(
          `items[${index}][child][${childIndex}][expiration_date]`,
          childItem?.date === null ? '' : formatMoment(childItem?.date, FORMAT_MOMENT.DATE_TIME_LONG)
        )
        formData.append(`items[${index}][child][${childIndex}][unit_name]`, childItem?.unit)
        formData.append(`items[${index}][child][${childIndex}][note]`, childItem?.note ? childItem?.note : '')
        formData.append(`items[${index}][child][${childIndex}][tax_id]`, childItem?.tax?.value ?? 0)
        formData.append(`items[${index}][child][${childIndex}][price]`, childItem?.price)
        if (childItem?.id_plan) {
          formData.append(
            `items[${index}][child][${childIndex}][location_warehouses_id]`,
            childItem?.id_plan == 0 ? childItem?.warehouse?.value : ''
          )
        } else {
          formData.append(
            `items[${index}][child][${childIndex}][location_warehouses_id]`,
            childItem?.warehouse?.value ? childItem?.warehouse?.value : 0
          )
        }
        formData.append(
          `items[${index}][child][${childIndex}][discount_percent]`,
          childItem?.discount ? childItem?.discount : ''
        )
      })
    })
    handingImport.mutate(formData, {
      onSuccess: ({ isSuccess, message }) => {
        if (isSuccess) {
          isShow('success', dataLang[message] || message)
          sCode('')
          sStartDate(new Date())
          sIdSupplier(null)
          sIdBranch(null)
          sIdTheOrder(null)
          sNote('')
          sErrBranch(false)
          sErrDate(false)
          // sErrTheOrder(false);
          sErrSupplier(false)
          sListData([])
          router.push(routerImport.home)
        } else {
          // if (total.totalPrice == 0) {
          //   isShow('error', `Chưa nhập thông tin mặt hàng`)
          // } else {
            isShow('error', dataLang[message] || message)
          // }
        }
      },
    })
    sOnSending(false)
  }

  useEffect(() => {
    onSending && _ServerSending()
  }, [onSending])

  //new
  const _HandleAddChild = (parentId, value) => {
    const newData = listData?.map((e) => {
      if (e?.id === parentId) {
        const newChild = {
          id: uuidv4(),
          id_plan: value?.e?.id_plan,
          reference_no_plan: value?.e?.reference_no_plan,
          disabledDate:
            (value?.e?.text_type === 'material' && dataMaterialExpiry?.is_enable === '1' && false) ||
            (value?.e?.text_type === 'material' && dataMaterialExpiry?.is_enable === '0' && true) ||
            (value?.e?.text_type === 'products' && dataProductExpiry?.is_enable === '1' && false) ||
            (value?.e?.text_type === 'products' && dataProductExpiry?.is_enable === '0' && true),
          warehouse: warehouseAll ? warehouseAll : null,
          serial: '',
          lot: '',
          date: null,
          unit: value?.e?.unit_name,
          price: value?.e?.price,
          amount: 1,
          discount: 0, // Changed from: discount ? discount : Number(value?.e?.discount_percent),
          priceAfter: Number(value?.e?.price_after_discount),
          tax: tax
            ? tax
            : {
                label: value?.e?.tax_name,
                // label: value?.e?.tax_name == null ? "Miễn thuế" : value?.e?.tax_name,
                value: value?.e?.tax_id,
                tax_rate: value?.e?.tax_rate,
              },
          totalMoney: Number(value?.e?.amount),
          note: value?.e?.note,
        }
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
    sListData([...newData])
  }

  const _HandleChangeChild = (parentId, childId, type, value) => {
    const newData = listData.map((e) => {
      if (e?.id === parentId) {
        const newChild = e?.child?.map((ce) => {
          if (ce?.id === childId) {
            if (type === 'amount') {
              return { ...ce, amount: Number(value?.value) }
            } else if (type === 'increase') {
              return {
                ...ce,
                amount: Number(Number(ce?.amount) + 1),
              }
            } else if (type === 'decrease') {
              if (Number(ce?.amount) <= 1) {
                handleQuantityError('Số lượng tối thiểu là 1')
                return ce
              }
              return {
                ...ce,
                amount: Number(Number(ce?.amount) - 1),
              }
            } else if (type === 'price') {
              return { ...ce, price: Number(value?.value) }
            } else if (type === 'discount') {
              return { ...ce, discount: Number(value?.value) }
            } else if (type === 'note') {
              return { ...ce, note: value?.target.value }
            } else if (type === 'warehouse') {
              return { ...ce, warehouse: value }
            } else if (type === 'tax') {
              return { ...ce, tax: value }
            }
            //  else if (type === "serial") {
            //     return { ...ce, serial: value?.target.value };
            else if (type === 'lot') {
              return { ...ce, lot: value?.target.value }
            } else if (type === 'serial') {
              const isValueExists = e.child.some(
                (otherCe) => otherCe[type] === value?.target.value && otherCe.id !== childId
              )

              if (isValueExists) {
                handleQuantityError(`Giá trị ${type} đã tồn tại`)
                return ce // Trả về giá trị ban đầu nếu đã tồn tại
              } else {
                const otherElements = listData.filter(
                  (otherE) =>
                    otherE.id !== parentId && otherE.child.some((otherCe) => otherCe[type] === value?.target.value)
                )

                if (otherElements.length > 0) {
                  handleQuantityError(`Giá trị ${type} đã tồn tại ở các phần tử khác`)
                  return ce // Trả về giá trị ban đầu nếu đã tồn tại ở phần tử khác
                } else {
                  return {
                    ...ce,
                    [type]: value?.target.value,
                  }
                }
              }
            } else if (type === 'date') {
              return { ...ce, date: value }
            }
          } else {
            return ce
          }
        })
        return { ...e, child: newChild }
      } else {
        return e
      }
    })
    sListData([...newData])
  }

  const handleQuantityError = (e) => isShow('error', e)

  const breadcrumbItems = [
    {
      label: `${dataLang?.import_title || 'import_title'}`,
    },
    {
      label: `${dataLang?.import_list || 'import_list'}`,
      href: routerImport.home,
    },
    {
      label: `${id ? dataLang?.import_from_title_edit : dataLang?.import_from_title_add}`,
    },
  ]

  const selectItemsLabel = (option, isOnTable = false) => (
    <div className={`flex items-start py-2 font-deca ${!isOnTable && 'cursor-pointer'}`}>
      <div
        className={`flex ${isOnTable && 'xl:flex-row flex-col'} ${
          isOnTable ? 'xl:items-center items-start' : 'items-center'
        } gap-3`}
      >
        <img
          src={option.e?.images ?? '/icon/noimagelogo.png'}
          alt={option?.e.name}
          className={`${isOnTable ? 'size-12' : 'xl:size-16 size-12'} object-cover rounded-md`}
        />
        <div className="flex flex-col gap-1 3xl:text-[10px] text-[9px] font-normal overflow-hidden w-full">
          <div
            className={`font-semibold responsive-text-sm truncate ${
              isOnTable ? 'text-brand-color xl:w-fit max-w-[75px]' : 'text-black'
            }`}
          >
            {option.e?.name}
          </div>

          <div className={`${isOnTable ? 'text-neutral-03' : 'text-blue-color'} flex flex-wrap`}>
            {option.e?.code}: {option?.e?.product_variation}
          </div>

          <div className="flex flex-wrap items-center text-neutral-03">
            {isOnTable && `ĐVT: ${option.e?.unit_name} - `} {dataLang[option.e?.text_type]} -{' '}
            {dataLang?.purchase_survive || 'purchase_survive'}:{' '}
            {option.e?.qty_warehouse ? formatNumber(option.e?.qty_warehouse) : '0'}
          </div>
          {!isOnTable && option?.e?.id_plan > 0 && (
            <TagColorProduct lang={false} dataKey={1} name={option?.e?.reference_no_plan} />
          )}
        </div>
      </div>
    </div>
  )
console.log(listData)
  return (
    <LayoutOrderManagement
      dataLang={dataLang}
      titleHead={id ? dataLang?.import_from_title_edit : dataLang?.import_from_title_add}
      breadcrumbItems={breadcrumbItems}
      titleLayout={dataLang?.import_title || 'import_title'}
      searchBar={
        <SelectSearch
          options={options}
          onChange={_HandleChangeInput.bind(this, 'itemAll')}
          value={listData?.map((e) => e?.item)}
          formatOptionLabel={(option) => selectItemsLabel(option)}
          placeholder={dataLang?.import_click_items || 'import_click_items'}
          setSearch={setInputValue}
        />
      }
      tableLeft={
        <>
          {listData.length === 0 ? (
            <EmptyData />
          ) : (
            <div>
              <div className="grid grid-cols-13 items-center gap-3 sticky top-0 z-10 py-2 border-b border-gray-100">
                <TableHeader className="col-span-2 text-left">
                  {dataLang?.import_from_items || 'import_from_items'}
                </TableHeader>

                <div className="col-span-11">
                  <div
                    className={`${
                      dataProductSerial?.is_enable == '1'
                        ? dataMaterialExpiry?.is_enable != dataProductExpiry?.is_enable
                          ? 'grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(0,0.8fr)_minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,1.1fr)_minmax(0,0.2fr)]'
                          : dataMaterialExpiry?.is_enable == '1'
                          ? 'grid-cols-[repeat(11_minmax(0_1fr))]'
                          : 'grid-cols-[minmax(0,1.5fr)_minmax(0,1.1fr)_minmax(0,1.3fr)_minmax(0,1.3fr)_minmax(0,1.1fr)_minmax(0,1.3fr)_minmax(0,1.1fr)_minmax(0,1.4fr)_minmax(0,0.2fr)]'
                        : dataMaterialExpiry?.is_enable != dataProductExpiry?.is_enable
                        ? 'grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(0,0.8fr)_minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,1.1fr)_minmax(0,0.2fr)]'
                        : dataMaterialExpiry?.is_enable == '1'
                        ? 'grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(0,0.8fr)_minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,1.1fr)_minmax(0,0.2fr)]'
                        : 'grid-cols-[minmax(0,1.5fr)_minmax(0,1.3fr)_minmax(0,1.3fr)_minmax(0,1.1fr)_minmax(0,1.3fr)_minmax(0,1.1fr)_minmax(0,1.3fr)_minmax(0,0.2fr)]'
                    } grid items-center gap-3`}
                  >
                    <Dropdown
                      overlay={
                        <div className="border px-4 py-5 shadow-lg bg-white rounded-lg">
                          <p className="3xl:text-base 2xl:text-sm text-[12px] font-normal font-deca text-secondary-color-text mb-2">
                            Chọn nhanh kho - Vị trí
                          </p>
                          <SelectCustomLabel
                            dataLang={dataLang}
                            placeholder={'Chọn nhanh kho - Vị trí'}
                            options={dataWarehouse}
                            value={warehouseAll}
                            onChange={_HandleChangeInput.bind(this, 'warehouseAll')}
                            isVisibleLotDate={false}
                          />
                        </div>
                      }
                      trigger={['click']}
                      placement="bottomCenter"
                      arrow
                    >
                      <div className="inline-flex items-center justify-between cursor-pointer group">
                        <TableHeader className="text-start group-hover:text-neutral-05">
                          {dataLang?.PDF_house || 'PDF_house'}
                        </TableHeader>
                        <ArrowDown2 size={16} className="text-neutral-02 font-medium group-hover:text-neutral-05" />
                      </div>
                    </Dropdown>

                    {dataProductSerial?.is_enable === '1' && (
                      <TableHeader className="col-span-1 text-center">{'Serial'}</TableHeader>
                    )}
                    {(dataMaterialExpiry?.is_enable === '1' || dataProductExpiry?.is_enable === '1') && (
                      <>
                        <TableHeader className="col-span-1 text-center">{'Lot'}</TableHeader>
                        <TableHeader className="col-span-1 text-center">
                          {props.dataLang?.warehouses_detail_date || 'Date'}
                        </TableHeader>
                      </>
                    )}
                    <TableHeader className="col-span-1 text-center">
                      {dataLang?.import_from_quantity || 'import_from_quantity'}
                    </TableHeader>
                    <TableHeader className="col-span-1 text-center">
                      {dataLang?.import_from_unit_price || 'import_from_unit_price'}
                    </TableHeader>

                    <DropdownDiscount value={discount} onChange={_HandleChangeInput.bind(this, 'discount')} />

                    <TableHeader className="col-span-1 text-center">Đơn giá SCK</TableHeader>

                    <DropdownTax
                      taxOptions={taxOptions}
                      totalTax={tax}
                      onChange={_HandleChangeInput.bind(this, 'tax')}
                      dataLang={dataLang}
                    />

                    <TableHeader className="col-span-1 text-right">
                      {dataLang?.import_into_money || 'import_into_money'}
                    </TableHeader>
                  </div>
                </div>
              </div>

              <Customscrollbar className="max-h-[840px] overflow-auto pb-2">
                <div className="h-full">
                  {isFetching ? (
                    <Loading className="h-[840px]" color="#0f4f9e" />
                  ) : (
                    <>
                      {listData?.map((e, index) => {
                        const firstChild = e?.child?.[0]
                        const isLast = index === listData.length - 1

                        return (
                          <div
                            key={e?.id?.toString()}
                            className={`grid items-start gap-3 py-2 grid-cols-13 ${
                              isLast ? '' : 'border-b border-[#F3F3F4]'
                            }`}
                          >
                            {/* Mặt hàng */}
                            <div className="col-span-2 h-full">
                              <div className="flex items-center justify-between gap-1 xl:gap-2">
                                {selectItemsLabel(e?.item, true)}
                                <button
                                  onClick={_HandleAddChild.bind(this, e?.id, e?.item)}
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
                                  // onChange={_HandleChangeChild.bind(this, e?.id, ce?.id, 'note')}
                                  placeholder={dataLang?.delivery_receipt_note || 'delivery_receipt_note'}
                                  name="optionEmail"
                                  type="text"
                                  className="focus:border-[#92BFF7] placeholder:responsive-text-xs 2xl:h-7 xl:h-5 py-0 px-1 responsive-text-xs placeholder-slate-300 w-full bg-white rounded-[5.5px] text-[#1C252E] font-normal outline-none placeholder:text-typo-gray-4"
                                />
                              </div>
                            </div>
                            <div className="h-full col-span-11">
                              <div
                                className={`${
                                  dataProductSerial?.is_enable == '1'
                                    ? dataMaterialExpiry?.is_enable != dataProductExpiry?.is_enable
                                      ? 'grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(0,0.8fr)_minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,1.1fr)_minmax(0,0.2fr)]'
                                      : dataMaterialExpiry?.is_enable == '1'
                                      ? 'grid-cols-[repeat(11_minmax(0_1fr))]'
                                      : 'grid-cols-[minmax(0,1.5fr)_minmax(0,1.1fr)_minmax(0,1.3fr)_minmax(0,1.3fr)_minmax(0,1.1fr)_minmax(0,1.3fr)_minmax(0,1.1fr)_minmax(0,1.4fr)_minmax(0,0.2fr)]'
                                    : dataMaterialExpiry?.is_enable != dataProductExpiry?.is_enable
                                    ? 'grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(0,0.8fr)_minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,1.1fr)_minmax(0,0.2fr)]'
                                    : dataMaterialExpiry?.is_enable == '1'
                                    ? 'grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.8fr)_minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(0,0.8fr)_minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,1.1fr)_minmax(0,0.2fr)]'
                                    : 'grid-cols-[minmax(0,1.5fr)_minmax(0,1.3fr)_minmax(0,1.3fr)_minmax(0,1.1fr)_minmax(0,1.3fr)_minmax(0,1.1fr)_minmax(0,1.3fr)_minmax(0,0.2fr)]'
                                } grid items-center justify-center gap-3 h-full py-1`}
                              >
                                {e?.child?.map((ce) => (
                                  <React.Fragment key={ce?.id?.toString()}>
                                    {/* Kho - Vị trí */}
                                    <div className={`flex flex-col items-center justify-center`}>
                                      {ce?.id_plan > 0 && ce?.reference_no_plan ? (
                                        <TagColorProduct
                                          lang={false}
                                          dataKey={6}
                                          name={`Vị trí theo ${ce?.reference_no_plan}`}
                                          className="3xl:!text-[13px] xl:!text-[10px] !text-[9px]"
                                        />
                                      ) : (
                                        <SelectCustomLabel
                                          dataLang={dataLang}
                                          placeholder={dataLang?.PDF_house || 'PDF_house'}
                                          options={dataWarehouse}
                                          value={ce?.warehouse}
                                          onChange={_HandleChangeChild.bind(this, e?.id, ce?.id, 'warehouse')}
                                          isError={
                                            (errWarehouse && ce?.warehouse == null) ||
                                            (errWarehouse &&
                                              (ce?.warehouse?.label == null || ce?.warehouse?.warehouse_name == null))
                                          }
                                          isVisibleLotDate={false}
                                        />
                                      )}
                                    </div>
                                    {dataProductSerial.is_enable === '1' ? (
                                      <div className="col-span-1">
                                        <div className="flex justify-center flex-col items-center">
                                          <input
                                            value={ce?.serial}
                                            disabled={e?.item?.e?.text_type != 'products'}
                                            className={`border ${
                                              e?.item?.e?.text_type != 'products'
                                                ? 'bg-gray-50'
                                                : errSerial && (ce?.serial == '' || ce?.serial == null)
                                                ? 'border-red-500'
                                                : 'focus:border-brand-color hover:border-brand-color border-neutral-N400'
                                            } placeholder:text-secondary-color-text-disabled w-full rounded-lg font-normal p-2 outline-none responsive-text-sm ${
                                              e?.item?.e?.text_type != 'products' ? 'cursor-not-allowed' : 'cursor-text'
                                            }`}
                                            onChange={_HandleChangeChild.bind(this, e?.id, ce?.id, 'serial')}
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      ''
                                    )}
                                    {dataMaterialExpiry.is_enable === '1' || dataProductExpiry.is_enable === '1' ? (
                                      <>
                                        {/* Lot */}
                                        <div>
                                          <div className="flex justify-center items-center">
                                            <input
                                              value={ce?.lot}
                                              disabled={ce?.disabledDate}
                                              className={`border ${
                                                ce?.disabledDate
                                                  ? 'bg-gray-50'
                                                  : errLot && (ce?.lot == '' || ce?.lot == null)
                                                  ? 'border-red-500'
                                                  : ' focus:border-brand-color hover:border-brand-color border-neutral-N400'
                                              } placeholder:text-secondary-color-text-disabled w-full rounded-lg font-normal p-2 outline-none cursor-text responsive-text-sm`}
                                              onChange={_HandleChangeChild.bind(this, e?.id, ce?.id, 'lot')}
                                              placeholder={
                                                dataLang?.purchase_order_system_default ||
                                                'purchase_order_system_default'
                                              }
                                            />
                                          </div>
                                        </div>
                                        {/* Date */}
                                        <div>
                                          <div className="flex justify-center items-center">
                                            <ConfigProvider locale={viVN}>
                                              <DatePickerAntd
                                                className="p-[6.7px]"
                                                isError={errDateList && ce?.date == null}
                                                allowClear={false}
                                                placeholder={'DD/MM/YYYY'}
                                                disabled={ce?.disabledDate}
                                                format="DD/MM/YYYY"
                                                suffixIcon={null}
                                                value={ce?.date ? dayjs(ce?.date) : null}
                                                onChange={(date) => {
                                                  if (date) {
                                                    const dateString = date.toDate().toString()
                                                    _HandleChangeChild(e?.id, ce?.id, 'date', dateString)
                                                  }
                                                }}
                                              />
                                            </ConfigProvider>
                                          </div>
                                        </div>
                                      </>
                                    ) : (
                                      ''
                                    )}
                                    {/* Số lượng */}
                                    <div
                                      className={`flex items-center justify-center h-8 2xl:h-10 3xl:p-2 xl:p-[2px] p-[1px] border rounded-3xl ${
                                        ce?.amount === '' || ce?.amount === null || ce?.amount === 0
                                          ? 'border-red-500'
                                          : 'focus:border-brand-color hover:border-brand-color border-neutral-N400'
                                      }`}
                                    >
                                      <button
                                        className="2xl:scale-100 xl:scale-90 scale-75 hover:bg-typo-blue-4/50 font-bold flex items-center justify-center p-0.5 bg-primary-05 rounded-full"
                                        onClick={_HandleChangeChild.bind(this, e?.id, ce?.id, 'decrease')}
                                      >
                                        <Minus className="scale-50 2xl:scale-100 xl:scale-100" size="16" />
                                      </button>
                                      <InPutNumericFormat
                                        onValueChange={_HandleChangeChild.bind(this, e?.id, ce?.id, 'amount')}
                                        value={ce?.amount}
                                        isAllowed={isAllowedNumber}
                                        className={`appearance-none text-center responsive-text-sm font-normal w-full focus:outline-none`}
                                        allowNegative={false}
                                      />
                                      <button
                                        className="2xl:scale-100 xl:scale-90 scale-75 hover:bg-typo-blue-4/50 font-bold flex items-center justify-center p-0.5  bg-primary-05 rounded-full"
                                        onClick={_HandleChangeChild.bind(this, e?.id, ce?.id, 'increase')}
                                      >
                                        <Add className="scale-50 2xl:scale-100 xl:scale-100" size="16" />
                                      </button>
                                    </div>
                                    {/* Đơn giá */}
                                    <div
                                      className={`flex items-center justify-center h-8 2xl:h-10 py-1 px-2 2xl:px-3 rounded-lg border ${
                                        ce?.price === '' || ce?.price === null
                                          ? 'border-red-500'
                                          : 'focus:border-brand-color hover:border-brand-color border-neutral-N400'
                                      }`}
                                    >
                                      <InPutMoneyFormat
                                        className={`appearance-none text-center responsive-text-sm font-semibold w-full mx-0 focus:outline-none`}
                                        onValueChange={_HandleChangeChild.bind(this, e?.id, ce?.id, 'price')}
                                        value={ce?.price}
                                        isSuffix=" đ"
                                        allowNegative={false}
                                      />
                                    </div>
                                    {/* % CK */}
                                    <div className="flex items-center justify-end h-8 2xl:h-10 py-2 px-2 2xl:px-3 rounded-lg border focus:border-brand-color hover:border-brand-color border-neutral-N400 responsive-text-sm font-semibold">
                                      <InPutNumericFormat
                                        className="appearance-none w-full focus:outline-none text-right"
                                        onValueChange={_HandleChangeChild.bind(this, e?.id, ce?.id, 'discount')}
                                        value={ce?.discount || 0}
                                        isAllowed={isAllowedDiscount}
                                        allowNegative={false}
                                      />
                                    </div>
                                    {/* Đơn giá sau CK */}
                                    <div className="flex items-center justify-center text-center responsive-text-sm font-semibold">
                                      <h3>{formatMoney(Number(ce?.price) * (1 - Number(ce?.discount) / 100))}</h3>
                                      <span className="pl-1 underline">đ</span>
                                    </div>
                                    {/* Thuế */}
                                    <div className="flex items-center">
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
                                    {/* Thành tiền và nút xóa */}
                                    <ItemTotalAndDelete
                                      total={formatMoney(
                                        ce?.price *
                                          (1 - Number(ce?.discount || 0) / 100) *
                                          (1 + Number(ce?.tax?.tax_rate ? ce?.tax?.tax_rate : 0) / 100) *
                                          Number(ce?.amount)
                                      )}
                                      onDelete={_HandleDeleteChild.bind(this, e?.id, ce?.id)}
                                    />
                                  </React.Fragment>
                                ))}
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
          )}
        </>
      }
      info={
        <div className="flex flex-col gap-4">
          {/* Mã chứng từ */}
          <DocumentNumber dataLang={dataLang} value={code} onChange={_HandleChangeInput.bind(this, 'code')} />
          {/* Ngày chứng từ */}
          <DocumentDate
            dataLang={dataLang}
            value={startDate}
            onChange={(date) => {
              sStartDate(date)
              handleTimeChange(date)
            }}
          />

          {/* Nhà cung cấp */}
          <SelectWithRadio
            isRequired={true}
            label={dataLang?.import_supplier || 'import_supplier'}
            placeholderText="Chọn nhà cung cấp"
            options={dataSupplier}
            value={idSupplier}
            onChange={(value) => {
              const newValue = dataSupplier.find((item) => item.value === value)
              _HandleChangeInput('supplier', newValue)
            }}
            isError={errSupplier}
            icon={<PiUsersLight />}
            errMess={dataLang?.purchase_order_errSupplier || 'purchase_order_errSupplier'}
          />
          
          {/* Đơn đặt hàng (PO) */}
          <SelectWithRadio
            isRequired={false}
            label={dataLang?.import_the_orders || 'import_the_orders'}
            placeholderText="Chọn đơn đặt hàng"
            options={dataTheOrder}
            value={idTheOrder}
            onChange={(value) => {
              const newValue = dataTheOrder.find((item) => item.value === value)
              _HandleChangeInput('theorder', newValue)
            }}
            sSearch={sSearchOrder}
            icon={<PiClipboardTextLight />}
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
          {/* Chọn kho nhập dư (nếu có) */}
          <AnimatePresence mode="wait">
            {idTheOrder && (
              <motion.div
                key="select-animate"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                exit={{ scaleX: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="col-span-2 origin-left"
              >
                <div className="w-full flex flex-col gap-y-2">
                  <InfoFormLabel isRequired={false} label={'Chọn kho nhập dư (nếu có)'} />
                  <div className="w-full flex">
                    <div className="relative flex w-full">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-[#7a7a7a]">
                        <PiMapPinLight />
                      </span>
                      <SelectCustomLabel
                        className="select-with-radio w-full"
                        dataLang={dataLang}
                        placeholder={'Chọn kho nhập dư'}
                        options={dataWarehouse}
                        value={idSurplusWarehouse}
                        onChange={_HandleChangeInput.bind(this, 'idSurplusWarehouse')}
                        allowClear={true}
                        renderOption={(option) => (
                          <div className="z-20 font-deca xl1439:text-[15px] text-[13px] leading-5">
                            <h2>
                              {dataLang?.import_Warehouse || 'import_Warehouse'}: {option?.warehouse_name}
                            </h2>
                            <h2>
                              {dataLang?.import_Warehouse_location || 'import_Warehouse_location'}: {option?.label}
                            </h2>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      }
      note={
        <TextareaNote
          label={dataLang?.purchase_order_note || 'purchase_order_note'}
          value={note}
          onChange={_HandleChangeInput.bind(this, 'note')}
        />
      }
      isTotalMoney={total}
      routerBack={routerImport.home}
      onSave={_HandleSubmit.bind(this)}
      onSending={onSending}
      popupConfim={
        <PopupConfim
          dataLang={dataLang}
          type="warning"
          title={TITLE_DELETE_ITEMS}
          subtitle={CONFIRMATION_OF_CHANGES}
          isOpen={isOpen}
          save={resetValue}
          nameModel={'change_item'}
          cancel={() => handleQueryId({ status: false })}
        />
      }
    />
  )
}

export default PurchaseImportForm
