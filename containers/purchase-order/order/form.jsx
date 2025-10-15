import apiOrder from '@/Api/apiPurchaseOrder/apiOrder'
import InputCustom from '@/components/common/input/InputCustom'
import ButtonDelete from '@/components/common/orderManagement/ButtonDelete'
import DropdownDiscount from '@/components/common/orderManagement/DropdownDiscount'
import DropdownTax from '@/components/common/orderManagement/DropdownTax'
import { DocumentDate, DocumentNumber } from '@/components/common/orderManagement/GeneralInfo'
import MenuList from '@/components/common/orderManagement/MenuList'
import OrderFormTabs from '@/components/common/orderManagement/OrderFormTabs'
import SelectCustomLabel from '@/components/common/orderManagement/SelectCustomLabel'
import SelectSearch from '@/components/common/orderManagement/SelectSearch'
import SelectWithRadio from '@/components/common/orderManagement/SelectWithRadio'
import LayoutForm from '@/components/layout/LayoutForm'
import { Customscrollbar } from '@/components/UI/common/Customscrollbar'
import EmptyData from '@/components/UI/emptyData'
import SelectItemComponent, { MenuListClickAll } from '@/components/UI/filterComponents/selectItemComponent'
import InPutMoneyFormat from '@/components/UI/inputNumericFormat/inputMoneyFormat'
import InPutNumericFormat from '@/components/UI/inputNumericFormat/inputNumericFormat'
import MultiValue from '@/components/UI/mutiValue/multiValue'
import PopupConfim from '@/components/UI/popupConfim/popupConfim'
import { optionsQuery } from '@/configs/optionsQuery'
import { CONFIRMATION_OF_CHANGES, TITLE_DELETE_ITEMS } from '@/constants/delete/deleteItems'
import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate'
import { useSupplierList } from '@/containers/suppliers/supplier/hooks/useSupplierList'
import { useBranchList } from '@/hooks/common/useBranch'
import { useStaffOptions } from '@/hooks/common/useStaffs'
import { useTaxList } from '@/hooks/common/useTaxs'
import useSetingServer from '@/hooks/useConfigNumber'
import useStatusExprired from '@/hooks/useStatusExprired'
import useToast from '@/hooks/useToast'
import { useToggle } from '@/hooks/useToggle'
import { routerOrder } from '@/routers/buyImportGoods'
import { isAllowedDiscount } from '@/utils/helpers/common'
import { formatMoment } from '@/utils/helpers/formatMoment'
import formatMoneyConfig from '@/utils/helpers/formatMoney'
import formatNumberConfig from '@/utils/helpers/formatnumber'
import { useQuery } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDown2, ArrowUp2 } from 'iconsax-react'
import moment from 'moment/moment'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { PiMapPinLight } from 'react-icons/pi'
import { useSelector } from 'react-redux'
import { useOrderByPurchase } from './hooks/useOrderByPurchase'
import { debounce } from 'lodash'

const OrderForm = (props) => {
  const isShow = useToast()
  const router = useRouter()
  const id = router.query?.id
  const dataLang = props?.dataLang

  const statusExprired = useStatusExprired()
  const dataSeting = useSetingServer()
  const authState = useSelector((state) => state.auth)

  const { isOpen, isKeyState, handleQueryId } = useToggle()
  const [onFetchingItemsAll, sOnFetchingItemsAll] = useState(false)
  const [onSending, sOnSending] = useState(false)
  const [sortedArr, setSortedArr] = useState([])
  const [optionType, sOptionType] = useState('0')
  const [dataItems, sDataItems] = useState([])
  const [startDate, sStartDate] = useState(new Date())
  const [delivery_dateNew, sDelivery_dateNew] = useState(new Date())
  const [code, sCode] = useState('')
  const [note, sNote] = useState('')
  const [tax, sTax] = useState()
  const [discount, sDiscount] = useState(0)
  const [idSupplier, sIdSupplier] = useState(null)
  const [idStaff, sIdStaff] = useState(null)
  const [idPurchases, sIdPurchases] = useState([])
  const [idBranch, sIdBranch] = useState(null)
  const [errDate, sErrDate] = useState(false)
  const [errSupplier, sErrSupplier] = useState(false)
  const [errStaff, sErrStaff] = useState(false)
  const [errPurchase, sErrPurchase] = useState(false)
  const [errBranch, sErrBranch] = useState(false)
  const [itemAll, sItemAll] = useState([])
  const [option, sOption] = useState([
    {
      id: Date.now(),
      items: null,
      unit: 1,
      quantity: 1,
      price: 1,
      discount: 0,
      affterDiscount: 1,
      tax: 0,
      priceAffterTax: 1,
      total: 1,
      note: '',
      purchases_order_item_id: '',
    },
  ])
  const [showMoreInfo, setShowMoreInfo] = useState(false)

  useEffect(() => {
    if (authState.branch?.length > 0 && !idBranch) {
      const firstBranch = {
        value: authState.branch[0].id,
        label: authState.branch[0].name,
      }
      sIdBranch(firstBranch)
    }
  }, [authState.branch])

  useEffect(() => {
    if (option.length > 0) {
      const slicedArr = option.slice(1)
      const arr = slicedArr.sort((a, b) => b.id - a.id)
      setSortedArr([])
    }
  }, [])

  const { data: dataTasxes = [] } = useTaxList()
  const { data: dataBranch = [] } = useBranchList()
  const { data: listSuppiler } = useSupplierList({
    'filter[branch_id]': idBranch != null ? idBranch.value : null,
  })
  const { data: listDataStaff = [] } = useStaffOptions({
    'filter[branch_id]': idBranch != null ? idBranch.value : null,
  })

  const dataSupplier = idBranch ? listSuppiler?.rResult?.map((e) => ({ label: e.name, value: e.id })) : []

  const dataStaff = idBranch ? listDataStaff : []

  const { data: dataPurchases = [] } = useOrderByPurchase(
    {
      'filter[branch_id]': idBranch != null ? idBranch?.value : -1,
      purchase_order_id: id ? id : '',
    },
    optionType
  )

  useEffect(() => {
    router.query && sErrDate(false)
    router.query && sErrSupplier(false)
    router.query && sErrStaff(false)
    router.query && sErrPurchase(false)
    router.query && sErrBranch(false)
    router.query && sNote('')
    router.query && sStartDate(new Date())
    router.query && sDelivery_dateNew(new Date())
  }, [router.query])

  useQuery({
    queryKey: ['detail_order', id],
    queryFn: () => _ServerFetchingDetail(),
    enabled: !!id,
  })

  const _ServerFetchingDetail = async () => {
    try {
      const rResult = await apiOrder.apiDetailOrder(id)

      const itemlast = [{ items: null }]

      const itemsConver = rResult?.item?.map((e) => {
        return {
          purchases_order_item_id: e?.purchases_order_item_id,
          id: e.purchases_order_item_id,
          items: {
            e: e?.item,
            label: `${e.item?.name} <span style={{display: none}}>${
              e.item?.code + e.item?.product_variation + e.item?.text_type + e.item?.unit_name
            }</span>`,
            value: e.item?.id,
          },
          quantity: Number(e?.quantity),
          price: Number(e?.price),
          id_plan: e?.id_plan,
          discount: Number(e?.discount_percent),
          tax: { tax_rate: e?.tax_rate, value: e?.tax_id },
          unit: e.item?.unit_name,
          affterDiscount: Number(e?.price_after_discount),
          note: e?.note,
          total: Number(e?.price_after_discount) * (1 + Number(e?.tax_rate) / 100) * Number(e?.quantity),
        }
      })
      const item = itemlast?.concat(itemsConver)

      sOption(item)
      setSortedArr(itemsConver)

      // Cập nhật itemAll để active các sản phẩm đã được chọn
      const selectedItems = itemsConver.map((item) => ({
        label: item.items.label,
        value: item.items.value,
        e: item.items.e,
      }))
      sItemAll(selectedItems)

      sCode(rResult?.code)

      sIdStaff({
        label: rResult?.staff_name,
        value: rResult.staff_id,
      })

      sIdBranch({
        label: rResult?.branch_name,
        value: rResult?.branch_id,
      })

      sIdSupplier({
        label: rResult?.supplier_name,
        value: rResult?.supplier_id,
      })

      sStartDate(rResult?.date || !rResult?.date == '0000-00-00' ? moment(rResult?.date).toDate() : null)

      sDelivery_dateNew(
        rResult?.delivery_date || !rResult?.delivery_date == '0000-00-00'
          ? moment(rResult?.delivery_date).toDate()
          : null
      )

      sOptionType(rResult?.order_type)

      sIdPurchases(
        rResult?.purchases?.map((e) => ({
          label: e.code,
          value: e.id,
        }))
      )

      sOnFetchingItemsAll(rResult?.order_type === '0' ? true : false)

      if (rResult?.order_type === '1') {
        refetchItems()
      }

      sNote(rResult?.note)
    } catch (error) {}
  }

  const resetValue = () => {
    if (isKeyState?.type === 'optionType') {
      sOptionType(isKeyState?.value.target.value)

      sIdPurchases(isKeyState?.value.target.value === '0' ? [] : idPurchases)

      sOnFetchingItemsAll(isKeyState?.value.target.value === '0' && true)

      if (isKeyState?.value.target.value === '1') {
        refetchItems()
      }

      sTax('')

      sDiscount('')
      setSortedArr([])
      sOption([
        {
          id: Date.now(),
          items: null,
          unit: 1,
          quantity: 1,
          price: 1,
          discount: 0,
          affterDiscount: 1,
          tax: 0,
          priceAffterTax: 1,
          total: 1,
          note: '',
        },
      ])
    }
    if (isKeyState?.type === 'purchases') {
      sIdPurchases(isKeyState?.value)
      setSortedArr([])
      sOption([
        {
          id: Date.now(),
          items: null,
          unit: 1,
          quantity: 1,
          price: 1,
          discount: 0,
          affterDiscount: 1,
          tax: 0,
          priceAffterTax: 1,
          total: 1,
          note: '',
        },
      ])
    }
    if (isKeyState?.type === 'branch') {
      sIdBranch(isKeyState?.value)

      sIdPurchases([])
      setSortedArr([])
      sOption([
        {
          id: Date.now(),
          items: null,
          unit: 1,
          quantity: 1,
          price: 1,
          discount: 0,
          affterDiscount: 1,
          tax: 0,
          priceAffterTax: 1,
          total: 1,
          note: '',
        },
      ])
    }
    handleQueryId({ status: false })
  }

  const _HandleChangeInput = (type, value) => {
    if (type === 'optionType') {
      handleQueryId({ status: true, initialKey: { type, value } })
    } else if (type == 'code') {
      sCode(value.target.value)
    } else if (type === 'date') {
      sSelectedDate(formatMoment(value.target.value, FORMAT_MOMENT.DATE_TIME_LONG))
    } else if (type === 'supplier') {
      sIdSupplier(value)
      sOnFetchingItemsAll(true)
    } else if (type === 'staff') {
      sIdStaff(value)
    } else if (type === 'delivery_dateNew') {
      sDelivery_dateNew(value)
    } else if (type === 'purchases' && idPurchases != value) {
      if (sortedArr?.length > 0) {
        handleQueryId({ status: true, initialKey: { type, value } })
      } else {
        sIdPurchases(value)
      }
    } else if (type === 'note') {
      sNote(value.target.value)
    } else if (type == 'branch' && idBranch != value) {
      if (sortedArr?.length > 0) {
        handleQueryId({ status: true, initialKey: { type, value } })
      } else {
        sIdBranch(value)
        sIdPurchases([])
        sIdSupplier(null)
        sIdStaff(null)
        setSortedArr([])
        sOption([
          {
            id: Date.now(),
            items: null,
            unit: 1,
            quantity: 1,
            price: 1,
            discount: 0,
            affterDiscount: 1,
            tax: 0,
            priceAffterTax: 1,
            total: 1,
            note: '',
          },
        ])
      }
    } else if (type == 'tax') {
      sTax(value)
    } else if (type == 'discount') {
      sDiscount(typeof value === 'object' ? value?.value : value)
    } else if (type == 'itemAll') {
      if (value?.length == 0) {
        setSortedArr([])
        sItemAll([])
      } else {
        const previousItemValues = new Set(itemAll.map((item) => item.value))
        const currentItemValues = new Set(value.map((item) => item.value))

        const hasRemovedItems = itemAll.some((item) => !currentItemValues.has(item.value))

        if (hasRemovedItems) {
          const newSortedArr = sortedArr.filter((item) => item?.items?.value && currentItemValues.has(item.items.value))
          setSortedArr(newSortedArr)
        }

        const existingItemIds = new Set(sortedArr.map((item) => item?.items?.value))

        const newItems = value.filter((item) => !existingItemIds.has(item.value))

        if (newItems.length > 0) {
          const newItemsFormatted = newItems.map((item) => {
            const itemPrice = Number(item?.e?.price || 1)
            const itemDiscount = Number(discount || 0)
            const itemQuantity = idPurchases?.length ? Number(item?.e?.quantity_left || 1) : 1
            const itemTaxRate = Number(item?.e?.tax?.tax_rate || 0)

            const affterDiscount = itemPrice * (1 - itemDiscount / 100)

            let total = affterDiscount * (1 + itemTaxRate / 100) * itemQuantity
            total = isNaN(total) ? 0 : Number(total.toFixed(2))

            return {
              id: Date.now() + Math.random(),
              items: item,
              unit: item?.e?.unit_name,
              quantity: itemQuantity,
              price: itemPrice,
              discount: itemDiscount,
              affterDiscount: affterDiscount,
              tax: tax ? tax : 0,
              priceAffterTax: 1,
              total: total,
              note: '',
            }
          })

          setSortedArr([...sortedArr, ...newItemsFormatted])
        }

        sItemAll(value)
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

  const handleClearDateNew = (type) => {
    if (type === 'effectiveDateNew') {
    }
    if (type === 'delivery_dateNew') {
      sDelivery_dateNew(new Date())
    }
  }

  useEffect(() => {
    if (tax == null) return
    setSortedArr((prevOption) => {
      const newOption = [...prevOption]

      const taxValue = Number(tax?.tax_rate || 0)

      const chietKhauValue = Number(discount || 0)

      newOption.forEach((item, index) => {
        if (!item.id) return

        const dongiasauchietkhau = Number(item?.price) * (1 - chietKhauValue / 100)

        const total = dongiasauchietkhau * (1 + taxValue / 100) * Number(item.quantity)

        item.tax = tax
        item.discount = Number(chietKhauValue)
        item.affterDiscount = isNaN(dongiasauchietkhau) ? 0 : dongiasauchietkhau
        item.total = isNaN(total) ? 0 : Number(total.toFixed(2))
      })
      return newOption
    })
  }, [tax])

  useEffect(() => {
    if (discount == null) return
    setSortedArr((prevOption) => {
      const newOption = [...prevOption]

      const taxValue = Number(tax?.tax_rate != undefined ? tax?.tax_rate : 0)

      const chietKhauValue = Number(discount ? discount : 0)

      newOption.forEach((item, index) => {
        if (!item.id) return

        const dongiasauchietkhau = Number(item?.price) * (1 - chietKhauValue / 100)

        const total = dongiasauchietkhau * (1 + taxValue / 100) * Number(item.quantity)

        item.tax = tax

        item.discount = Number(discount)

        item.affterDiscount = isNaN(dongiasauchietkhau) ? 0 : dongiasauchietkhau

        item.total = isNaN(total) ? 0 : Number(total.toFixed(2))
      })
      return newOption
    })
  }, [discount])

  const { refetch: refetchItems } = useQuery({
    queryKey: ['api_data_items_variant', idPurchases],
    queryFn: async () => {
      const { data } = await apiOrder.apiSearchItems({
        params: {
          branch_id: idBranch != null ? +idBranch?.value : '',
          'filter[purchases_id]': idPurchases?.length > 0 ? idPurchases.map((e) => e.value) : -1,
          purchase_order_id: id ? id : '',
          id_suppliers: idSupplier?.value ?? '',
        },
      })
      sDataItems(data.result)

      return data
    },
    ...optionsQuery,
    enabled: idPurchases?.length > 0,
  })

  useQuery({
    queryKey: ['api_dataItems_variantAll', onFetchingItemsAll, idSupplier],
    queryFn: async () => {
      _ServerFetching_ItemsAll()
    },
    ...optionsQuery,
    enabled: !!onFetchingItemsAll,
  })

  const _HandleSeachApi = debounce(async (inputValue) => {
    if (optionType === '0' && idBranch != null) {
      let form = new FormData()
      form.append(`branch_id[]`, +idBranch?.value ? +idBranch?.value : '')
      form.append(`term`, inputValue)
      form.append(`id_suppliers`, idSupplier?.value ?? '')
      sortedArr?.map((item, index) => {
        form.append(`items_id_selected[${index}]`, item.items?.value.toString())
      })
      const { data } = await apiOrder.apiSearchProductItems(form)
      sDataItems(data?.result)
    } else {
      return
    }
  }, 500)

  const _ServerFetching_ItemsAll = async () => {
    console.log('FormData:', FormData)
    if (optionType == '0') {
      let form = new FormData()
      form.append(`branch_id[]`, +idBranch?.value ? +idBranch?.value : '')
      form.append('id_suppliers', idSupplier?.value ?? '')

      // Thêm từng phần tử với chỉ mục
      sortedArr?.map((item, index) => {
        form.append(`items_id_selected[${index}]`, item.items?.value.toString())
      })
      
      try {
        const { data } = await apiOrder.apiSearchProductItems(form)

        sDataItems(data?.result)

        // Đánh dấu các sản phẩm đã chọn sau khi tải dữ liệu
        if (sortedArr?.length > 0 && data?.result?.length > 0) {
          const selectedItemIds = new Set(sortedArr.map((item) => item.items?.value))
          const matchedItems = data.result
            .filter((item) => selectedItemIds.has(item.id))
            .map((item) => ({
              label: `${item.name} <span style={{display: none}}>${item.code}</span><span style={{display: none}}>${item.product_variation} </span><span style={{display: none}}>${item.text_type} ${item.unit_name} </span>`,
              value: item.id,
              e: item,
            }))

          if (matchedItems.length > 0) {
            sItemAll(matchedItems)
          }
        }
      } catch (error) {}
    } else {
      try {
        const { data } = await apiOrder.apiSearchItems({
          params: {
            branch_id: idBranch != null ? +idBranch?.value : '',
            purchase_order_id: id,
            id_suppliers: idSupplier?.value ?? '',
            // Sửa: items_id_selected là mảng
            // items_id_selected: sortedArr?.map((item) => item.items?.value) ?? [],
          },
        })
        sDataItems(data?.result)

        // Đánh dấu các sản phẩm đã chọn sau khi tải dữ liệu
        if (sortedArr?.length > 0 && data?.result?.length > 0) {
          const selectedItemIds = new Set(sortedArr.map((item) => item.items?.value))
          const matchedItems = data.result
            .filter((item) => selectedItemIds.has(item.id))
            .map((item) => ({
              label: `${item.name} <span style={{display: none}}>${item.code}</span><span style={{display: none}}>${item.product_variation} </span><span style={{display: none}}>${item.text_type} ${item.unit_name} </span>`,
              value: item.id,
              e: item,
            }))

          if (matchedItems.length > 0) {
            sItemAll(matchedItems)
          }
        }
      } catch (error) {}
    }
    sOnFetchingItemsAll(false)
  }

  const options = dataItems?.map((e) => ({
    label: `${e.name} - ${e.code} - ${e.product_variation} - ${e.text_type} ${e.unit_name}`,
    // label: `${e.name} <span style={{display: none}}>${e.code}</span><span style={{display: none}}>${e.product_variation} </span><span style={{display: none}}>${e.text_type} ${e.unit_name} </span>`,
    value: e.id,
    e,
  }))

  useEffect(() => {
    const check = () => {
      sOnFetchingItemsAll(true)
    }

    if (!idBranch) {
      sIdSupplier(null)
      sIdStaff(null)
      sIdPurchases([])
    }

    if (optionType == '1') {
      idBranch != null && check()
      idPurchases?.length == 0 && sDataItems([])
      idBranch != null && refetchItems()
    } else {
      idBranch == null && sDataItems([])
      idBranch != null && check()
    }
  }, [idBranch])

  useEffect(() => {
    idPurchases?.length == 0 && sDataItems([])
  }, [idPurchases])

  // Đồng bộ dataItems và itemAll để đảm bảo các sản phẩm đã chọn được hiển thị
  useEffect(() => {
    if (dataItems?.length > 0 && sortedArr?.length > 0) {
      // Tạo một map các sản phẩm đã chọn để tìm kiếm nhanh
      const selectedItemsMap = new Map(sortedArr.map((item) => [item.items?.value, item.items]))

      // Tìm các sản phẩm đã chọn trong dataItems
      const matchedItems = dataItems
        .filter((item) => selectedItemsMap.has(item.id))
        .map((item) => ({
          label: `${item.name} <span style={{display: none}}>${item.code}</span><span style={{display: none}}>${item.product_variation} </span><span style={{display: none}}>${item.text_type} ${item.unit_name} </span>`,
          value: item.id,
          e: item,
        }))

      // Cập nhật itemAll nếu có sự thay đổi
      if (matchedItems.length > 0 && itemAll.length !== matchedItems.length) {
        sItemAll(matchedItems)
      }
    }
  }, [dataItems])

  const dataOption = sortedArr?.map((e) => {
    return {
      item: e?.items?.value,
      quantity: Number(e?.quantity),
      price: e?.price,
      discount_percent: e?.discount,
      tax_id: e?.tax?.value,
      purchases_item_id: e?.items?.e?.purchases_item_id,
      note: e?.note,
      id: e?.id,
      id_plan: e?.id_plan,
      purchases_order_item_id: e?.purchases_order_item_id,
    }
  })

  const newDataOption = dataOption?.filter((e) => e?.item !== undefined)

  const _HandleSubmit = (e) => {
    e.preventDefault()
    const check = newDataOption.some((e) => e?.price < 0 || e?.price === '' || e?.quantity <= 0 || e?.quantity === '')
    if (optionType == '0') {
      if (idSupplier == null || idStaff == null || idBranch == null || check) {
        idSupplier == null && sErrSupplier(true)
        idStaff == null && sErrStaff(true)
        idBranch == null && sErrBranch(true)
        if (idBranch === null || idStaff === null) {
          setShowMoreInfo(true)
        }
        isShow('error', `${dataLang?.required_field_null}`)
      } else {
        sOnSending(true)
      }
    } else {
      if (idSupplier == null || idStaff == null || idBranch == null || check) {
        idSupplier == null && sErrSupplier(true)
        idStaff == null && sErrStaff(true)
        idBranch == null && sErrBranch(true)
        if (idBranch === null || idStaff === null) {
          setShowMoreInfo(true)
        }
        isShow('error', `${dataLang?.required_field_null}`)
      } else {
        sOnSending(true)
      }
    }
  }

  useEffect(() => {
    sErrSupplier(false)
  }, [idSupplier != null])

  useEffect(() => {
    sErrStaff(false)
  }, [idStaff != null])

  useEffect(() => {
    sErrBranch(false)
  }, [idBranch != null])

  useEffect(() => {
    sErrPurchase(false)
  }, [idPurchases?.length > 0])

  const hiddenOptions = idPurchases?.length > 3 ? idPurchases?.slice(0, 3) : []

  const fakeDataPurchases = idBranch != null ? dataPurchases.filter((x) => !hiddenOptions.includes(x.value)) : []

  const formatNumber = (number) => {
    return formatNumberConfig(+number, dataSeting)
  }

  const formatMoney = (number) => {
    return formatMoneyConfig(+number, dataSeting)
  }

  const _HandleChangeInputOption = (id, type, index3, value) => {
    const index = sortedArr.findIndex((x) => x.id === id)
    if (type == 'items') {
      if (sortedArr[index].items) {
        sortedArr[index].items = value
        sortedArr[index].unit = value?.e?.unit_name
        sortedArr[index].quantity = idPurchases?.length ? Number(value?.e?.quantity_left) : 1
        sortedArr[index].total =
          Number(sortedArr[index].affterDiscount) * (1 + Number(0) / 100) * Number(sortedArr[index].quantity)
      } else {
        let moneyClient = 0
        if (value.e?.tax?.tax_rate == undefined) {
          moneyClient = Number(1) * (1 + Number(0) / 100) * Number(value?.e?.quantity_left)
        } else {
          moneyClient =
            Number(value?.e?.affterDiscount) * (1 + Number(value?.e?.tax?.tax_rate) / 100) * Number(value?.e?.quantity)
        }
        const newData = {
          id: Date.now(),
          items: value,
          unit: value?.e?.unit_name,
          quantity: idPurchases?.length ? Number(value?.e?.quantity_left) : 1,
          price: value?.e?.price,
          discount: discount ? discount : 0,
          affterDiscount: 1,
          tax: tax ? tax : 0,
          priceAffterTax: 1,
          total: moneyClient.toFixed(2),
          note: '',
        }
        if (newData.discount) {
          newData.affterDiscount *= 1 - Number(newData.discount) / 100
        }
        if (newData.tax?.e?.tax_rate == undefined) {
          const money = Number(newData.affterDiscount) * (1 + Number(0) / 100) * Number(newData.quantity)
          newData.total = Number(money.toFixed(2))
        } else {
          const money =
            Number(newData.affterDiscount) * (1 + Number(newData.tax?.e?.tax_rate) / 100) * Number(newData.quantity)
          newData.total = Number(money.toFixed(2))
        }
        sortedArr.push(newData)
      }
    } else if (type == 'unit') {
      sortedArr[index].unit = value.target?.value
    } else if (type === 'quantity') {
      sortedArr[index].quantity = Number(value?.value)
      if (sortedArr[index].tax?.tax_rate == undefined) {
        const money =
          Number(sortedArr[index].affterDiscount) * (1 + Number(0) / 100) * Number(sortedArr[index].quantity)
        sortedArr[index].total = Number(money.toFixed(2))
      } else {
        const money =
          Number(sortedArr[index].affterDiscount) *
          (1 + Number(sortedArr[index].tax?.tax_rate) / 100) *
          Number(sortedArr[index].quantity)
        sortedArr[index].total = Number(money.toFixed(2))
      }
      setSortedArr([...sortedArr])
    } else if (type == 'price') {
      sortedArr[index].price = Number(value.value)
      sortedArr[index].affterDiscount = +sortedArr[index].price * (1 - Number(sortedArr[index].discount) / 100)
      sortedArr[index].affterDiscount = +(Math.round(sortedArr[index].affterDiscount + 'e+2') + 'e-2')
      if (sortedArr[index].tax?.tax_rate == undefined) {
        const money =
          Number(sortedArr[index].affterDiscount) * (1 + Number(0) / 100) * Number(sortedArr[index].quantity)
        sortedArr[index].total = Number(money.toFixed(2)) || 0
      } else {
        const money =
          Number(sortedArr[index].affterDiscount) *
          (1 + Number(sortedArr[index].tax?.tax_rate) / 100) *
          Number(sortedArr[index].quantity)
        sortedArr[index].total = Number(money.toFixed(2)) || 0
      }
    } else if (type == 'discount') {
      sortedArr[index].discount = Number(value.value)
      sortedArr[index].affterDiscount = +sortedArr[index].price * (1 - Number(sortedArr[index].discount) / 100)
      sortedArr[index].affterDiscount = +(Math.round(sortedArr[index].affterDiscount + 'e+2') + 'e-2')
      if (sortedArr[index].tax?.tax_rate == undefined) {
        const money =
          Number(sortedArr[index].affterDiscount) * (1 + Number(0) / 100) * Number(sortedArr[index].quantity)
        sortedArr[index].total = Number(money.toFixed(2)) || 0
      } else {
        const money =
          Number(sortedArr[index].affterDiscount) *
          (1 + Number(sortedArr[index].tax?.tax_rate) / 100) *
          Number(sortedArr[index].quantity)
        sortedArr[index].total = Number(money.toFixed(2)) || 0
      }
    } else if (type == 'tax') {
      sortedArr[index].tax = value
      if (sortedArr[index].tax?.tax_rate == undefined) {
        const money =
          Number(sortedArr[index].affterDiscount) * (1 + Number(0) / 100) * Number(sortedArr[index].quantity)
        sortedArr[index].total = Number(money.toFixed(2)) || 0
      } else {
        const money =
          Number(sortedArr[index].affterDiscount) *
          (1 + Number(sortedArr[index].tax?.tax_rate) / 100) *
          Number(sortedArr[index].quantity)
        sortedArr[index].total = Number(money.toFixed(2)) || 0
      }
    } else if (type == 'note') {
      sortedArr[index].note = value?.target?.value
    }
    setSortedArr([...sortedArr])
  }

  const _HandleDelete = (id) => {
    const itemToDelete = sortedArr.find((x) => x.id === id)

    const newOption = sortedArr.filter((x) => x.id !== id)
    setSortedArr(newOption)

    if (itemToDelete) {
      const newItemAll = itemAll.filter((item) => item.value !== itemToDelete.items.value)
      sItemAll(newItemAll)
    }
  }

  const taxOptions = [{ label: 'Miễn thuế', value: '0', tax_rate: '0' }, ...dataTasxes]

  const caculateMoney = (option) => {
    const total = sortedArr.reduce((accumulator, currentValue) => {
      const price = Number(currentValue?.price || 0)
      const quantity = Number(currentValue?.quantity || 0)
      return accumulator + price * quantity
    }, 0)

    const totalDiscount = sortedArr.reduce((acc, item) => {
      const price = Number(item?.price || 0)
      const discount = Number(item?.discount || 0)
      const quantity = Number(item?.quantity || 0)
      const caculate = price * (discount / 100) * quantity
      return acc + (isNaN(caculate) ? 0 : caculate)
    }, 0)

    const totalAfftertDiscount = sortedArr.reduce((acc, item) => {
      const quantity = Number(item?.quantity || 0)
      const affterDiscount = Number(item?.affterDiscount || 0)
      const caculate = quantity * affterDiscount
      return acc + (isNaN(caculate) ? 0 : caculate)
    }, 0)

    const totalTax = sortedArr.reduce((acc, item) => {
      const affterDiscount = Number(item?.affterDiscount || 0)
      const taxRate = isNaN(Number(item?.tax?.tax_rate)) ? 0 : Number(item?.tax?.tax_rate) / 100
      const quantity = Number(item?.quantity || 0)
      const caculate = affterDiscount * taxRate * quantity
      return acc + (isNaN(caculate) ? 0 : caculate)
    }, 0)

    const totalMoney = sortedArr.reduce((acc, item) => {
      const total = Number(item?.total || 0)
      return acc + (isNaN(total) ? 0 : total)
    }, 0)

    return {
      total: total || 0,
      totalDiscount: totalDiscount || 0,
      totalAfftertDiscount: totalAfftertDiscount || 0,
      totalTax: totalTax || 0,
      totalMoney: totalMoney || 0,
    }
  }

  const [totalMoney, setTotalMoney] = useState({
    total: 0,
    totalDiscount: 0,
    totalAfftertDiscount: 0,
    totalTax: 0,
    totalMoney: 0,
  })

  useEffect(() => {
    const totalMoney = caculateMoney(option)
    setTotalMoney(totalMoney)
  }, [sortedArr])

  const _ServerSending = async () => {
    let formData = new FormData()
    formData.append('code', code)
    formData.append('date', formatMoment(startDate, FORMAT_MOMENT.DATE_TIME_LONG))
    formData.append('delivery_date', formatMoment(delivery_dateNew, FORMAT_MOMENT.DATE_LONG))
    formData.append('suppliers_id', idSupplier.value)
    formData.append('order_type ', optionType)
    formData.append('branch_id', idBranch.value)
    formData.append('staff_id', idStaff.value)
    formData.append('note', note)
    if (optionType === '1') {
      idPurchases?.map((e, index) => {
        return formData.append(`purchase[${index}][id]`, e?.value)
      })
    }
    newDataOption.forEach((item, index) => {
      formData.append(
        `items[${index}][purchases_item_id]`,
        item?.purchases_item_id != undefined ? item?.purchases_item_id : ''
      )
      formData.append(
        `items[${index}][purchases_order_item_id]`,
        item?.purchases_order_item_id != undefined ? item?.purchases_order_item_id : ''
      )
      formData.append(`items[${index}][id_plan]`, item?.id_plan ? item?.id_plan : '0')
      formData.append(`items[${index}][item]`, item?.item)
      formData.append(`items[${index}][id]`, router.query?.id ? item?.id : '')
      formData.append(`items[${index}][quantity]`, item?.quantity.toString())
      formData.append(`items[${index}][price]`, item?.price)
      formData.append(`items[${index}][discount_percent]`, item?.discount_percent)
      formData.append(`items[${index}][tax_id]`, item?.tax_id != undefined ? item?.tax_id : '')
      formData.append(`items[${index}][note]`, item?.note != undefined ? item?.note : '')
    })
    try {
      const { isSuccess, message } = await apiOrder.apiHandingOrder(id, formData)
      if (isSuccess) {
        isShow('success', dataLang[message] || message)
        sCode('')
        sStartDate(new Date())
        sDelivery_dateNew(new Date())
        sIdStaff(null)
        sIdSupplier(null)
        sIdBranch(null)
        sOptionType('0')
        sIdPurchases([])
        sNote('')
        sErrBranch(false)
        sErrDate(false)
        sErrPurchase(false)
        sErrSupplier(false)
        sOption([
          {
            id: Date.now(),
            items: null,
            unit: '',
            quantity: 0,
            note: '',
          },
        ])
        setSortedArr([])
        router.push(routerOrder.home)
      } else {
        // console.log(newDataOption)
        // if (newDataOption.length === 0) {
        //   isShow('error', `Chưa nhập thông tin mặt hàng`)
        // } else {
        isShow('error', dataLang[message] || message)
        // }
      }
    } catch (error) {}
    sOnSending(false)
  }

  useEffect(() => {
    onSending && _ServerSending()
  }, [onSending])

  const _HandleSelectAll = () => {
    // Lấy danh sách ID của các mặt hàng đã tồn tại
    const existingItemIds = new Set(sortedArr.map((item) => item?.items?.value))

    const newData = dataItems.map((item, index) => {
      const itemPrice = Number(item?.price || 1)
      const itemDiscount = Number(discount || 0)
      const itemQuantity = idPurchases?.length ? Number(item?.quantity_left || 1) : 1
      const itemTaxRate = Number(item?.tax?.tax_rate || 0)

      // Tính affterDiscount
      const affterDiscount = itemPrice * (1 - itemDiscount / 100)

      // Tính total
      let total = affterDiscount * (1 + itemTaxRate / 100) * itemQuantity
      total = isNaN(total) ? 0 : Number(total.toFixed(2))

      return {
        id: Date.now() + index,
        items: {
          label: `${item?.name} <span style={{display: none}}>${item?.code}</span><span style={{display: none}}>${item?.product_variation} </span><span style={{display: none}}>${item?.text_type} ${item?.unit_name} </span>`,
          value: item?.id,
          e: item,
        },
        unit: item?.unit_name,
        quantity: itemQuantity,
        price: itemPrice,
        discount: itemDiscount,
        affterDiscount: affterDiscount,
        tax: tax ? tax : 0,
        priceAffterTax: 1,
        total: total,
        note: '',
      }
    })

    // Lọc bỏ các mặt hàng đã có trong sortedArr
    const uniqueNewData = newData.filter((item) => !existingItemIds.has(item.items.value))

    sItemAll([...sortedArr, ...uniqueNewData])
    setSortedArr([...sortedArr, ...uniqueNewData])
  }

  const breadcrumbItems = [
    {
      label: `${dataLang?.purchase_purchase || 'purchase_purchase'}`,
      href: '/purchase-order/order',
    },
    {
      label: `${'Đơn hàng mua (PO)'}`,
      href: '/purchase-order/order',
    },
    {
      label: `${'Thông tin đơn hàng mua (PO)'}`,
    },
  ]

  // Tự động chọn nhân viên hiện tại khi có dữ liệu nhân viên
  useEffect(() => {
    if (listDataStaff?.length > 0 && authState.staff_id && !id) {
      const currentStaff = listDataStaff.find((staff) => staff.value === authState.staff_id)
      if (currentStaff) {
        sIdStaff(currentStaff)
      }
    }
  }, [listDataStaff, authState.staff_id, id])

  return (
    <React.Fragment>
      <LayoutForm
        title={
          id
            ? dataLang?.purchase_order_edit_order || 'purchase_order_edit_order'
            : dataLang?.purchase_order_add_order || 'purchase_order_add_order'
        }
        breadcrumbItems={breadcrumbItems}
        heading={'Thông tin đơn hàng mua (PO)'}
        dataLang={dataLang}
        statusExprired={statusExprired}
        onSave={_HandleSubmit.bind(this)}
        onExit={() => router.push(routerOrder.home)}
        leftContent={
          <>
            <div className="flex items-center justify-between">
              <h2 className="responsive-text-xl font-medium text-brand-color w-full">Thông tin mặt hàng</h2>
              <SelectSearch
                options={[...options]}
                placeholder={dataLang?.N_search_product || 'Tìm kiếm mặt hàng'}
                value={itemAll}
                onChange={(value) => {
                  _HandleChangeInput('itemAll', value)
                }}
                setSearch={_HandleSeachApi}
                MenuList={(props) => (
                  <MenuList
                    dataItems={itemAll}
                    handleSelectAll={_HandleSelectAll.bind(this)}
                    handleDeleteAll={() => {
                      setSortedArr([])
                      sItemAll([])
                    }}
                    {...props}
                  />
                )}
                formatOptionLabel={(option) => (
                  <div className="flex items-start p-1 cursor-pointer font-deca">
                    <div className="flex items-center gap-2">
                      <img
                        src={option.e?.images ?? '/icon/noimagelogo.png'}
                        alt={option?.e?.name}
                        className="size-16 object-cover rounded-md"
                      />
                      <div className="flex flex-col gap-1 3xl:text-[10px] text-[9px] font-normal overflow-hidden w-full">
                        <h3 className="font-semibold responsive-text-sm truncate text-black">{option.e?.name}</h3>

                        <h5 className="text-blue-color truncate">
                          {option.e?.code}: {option?.e?.product_variation}
                        </h5>

                        <div className="flex flex-wrap items-center gap-2 text-neutral-03">
                          ĐVT: {option.e?.unit_name} - {dataLang[option.e?.text_type]} -{' '}
                          {dataLang?.purchase_survive || 'purchase_survive'}:{' '}
                          {option.e?.qty_warehouse ? formatNumber(option.e?.qty_warehouse) : '0'}
                          {optionType == '1' && (
                            <span className="flex items-center gap-1">
                              - Số lượng: {formatNumber(option.e?.quantity_left)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              />
            </div>
            {sortedArr.length === 0 ? (
              <EmptyData />
            ) : (
              <>
                <div className="grid grid-cols-26 items-center">
                  <h4 className="col-span-6 responsive-text-sm font-semibold text-neutral-02 py-2 px-3">
                    {dataLang?.purchase_order_purchase_from_item || 'purchase_order_purchase_from_item'}
                    {idPurchases?.length > 0 && (
                      <SelectItemComponent
                        options={[...options]}
                        closeMenuOnSelect={false}
                        dataLang={dataLang}
                        onChange={_HandleChangeInput.bind(this, 'itemAll')}
                        value={null}
                        isMulti
                        maxShowMuti={0}
                        components={{
                          MenuList: (props) => (
                            <MenuListClickAll
                              {...props}
                              onClickSelectAll={_HandleSelectAll.bind(this)}
                              onClickDeleteSelectAll={() => {
                                setSortedArr([])
                                sItemAll([])
                              }}
                            />
                          ),
                          MultiValue,
                        }}
                        placeholder={dataLang?.import_click_items || 'import_click_items'}
                        className="rounded-md bg-white  2xl:text-[12px] xl:text-[13px] text-[12.5px] z-20"
                        isSearchable={true}
                        noOptionsMessage={() => 'Không có dữ liệu'}
                        menuPortalTarget={document.body}
                        styles={{
                          menu: {
                            width: '100%',
                          },
                        }}
                      />
                    )}
                  </h4>
                  <h4 className="col-span-4 text-center responsive-text-sm font-semibold text-neutral-02 py-2 px-3">
                    {dataLang?.purchase_quantity || 'purchase_quantity'}
                  </h4>
                  <h4 className="col-span-3 text-right responsive-text-sm font-semibold text-neutral-02 py-2 px-3">
                    {dataLang?.purchase_order_detail_unit_price || 'purchase_order_detail_unit_price'}
                  </h4>
                  <div className="col-span-3 px-3">
                    <DropdownDiscount
                      value={discount}
                      onChange={(val) => _HandleChangeInput('discount', val)}
                      dataLang={dataLang}
                      className="w-full"
                    />
                  </div>
                  <h4 className="col-span-3 text-right responsive-text-sm font-semibold text-neutral-02 py-2 px-3">
                    {dataLang?.purchase_order_detail_after_discount || 'purchase_order_detail_after_discount'}
                  </h4>
                  <div className="col-span-3 px-3">
                    <DropdownTax
                      value={tax}
                      totalTax={tax}
                      onChange={(val) => _HandleChangeInput('tax', val)}
                      dataLang={dataLang}
                      taxOptions={taxOptions}
                    />
                  </div>

                  <h4 className="col-span-3 text-right responsive-text-sm font-semibold text-neutral-02 py-2 px-3">
                    {dataLang?.purchase_order_detail_into_money || 'purchase_order_detail_into_money'}
                  </h4>
                  <h4 className="col-span-1 responsive-text-sm font-semibold text-neutral-02 py-2 px-3"></h4>
                </div>
                <Customscrollbar className="overflow-auto">
                  <div className="w-full h-full">
                    <React.Fragment>
                      <div className="divide-y divide-slate-200">
                        {sortedArr.length === 0 ? (
                          <EmptyData />
                        ) : (
                          sortedArr.map((e, index) => (
                            <div className="grid grid-cols-26" key={e?.id}>
                              <div className="col-span-6 py-2 2xl:px-4 px-2 flex flex-col gap-2 2xl:gap-3">
                                <div className="flex items-center gap-2">
                                  <div className="size-16 flex-shrink-0">
                                    <img
                                      src={e?.items?.e?.images || '/icon/noimagelogo.png'}
                                      alt="Product Image"
                                      className="object-cover rounded size-full"
                                    />
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <h3 className="responsive-text-sm font-semibold text-new-blue">
                                      {e?.items?.e?.name}
                                    </h3>
                                    <div className="flex gap-1">
                                      <h5 className="responsive-text-xxs text-neutral-03 font-normal">
                                        {e?.items?.e?.code}
                                      </h5>
                                      <h5 className="responsive-text-xxs text-neutral-03 font-normal">
                                        {e?.items?.e?.product_variation}
                                      </h5>
                                    </div>
                                    <h5
                                      className={`${
                                        optionType == '1' ? '' : 'flex items-center gap-1'
                                      } responsive-text-xxs text-neutral-03 font-normal`}
                                    >
                                      {dataLang[e?.items?.e?.text_type]} {optionType == '1' ? '-' : ''}{' '}
                                      {optionType == '1' ? e?.items?.e?.purchases_code : ''}{' '}
                                      {optionType != '1' && (
                                        <>
                                          <h5>-</h5>
                                          <h5 className="responsive-text-xxs text-neutral-03 font-normal">
                                            {dataLang?.purchase_survive || 'purchase_survive'}:
                                          </h5>
                                          <h5 className="responsive-text-xxs text-neutral-03 font-normal">
                                            {e?.items?.e?.qty_warehouse ? e?.items?.e?.qty_warehouse : '0'}
                                          </h5>
                                        </>
                                      )}
                                    </h5>
                                    {optionType == '1' && (
                                      <div className="flex items-center gap-2 text-gray-400">
                                        <h5 className="responsive-text-xxs text-neutral-03 font-normal">Số lượng:</h5>
                                        <h5 className="responsive-text-xxs text-neutral-03 font-normal">
                                          {formatNumber(e?.items?.e?.quantity_left)}
                                        </h5>
                                        {'-'}
                                        <h5 className="responsive-text-xxs text-neutral-03 font-normal">
                                          {dataLang?.purchase_survive || 'purchase_survive'}:
                                        </h5>
                                        <h5 className="responsive-text-xxs text-neutral-03 font-normal">
                                          {e?.items?.e?.qty_warehouse ? formatNumber(e?.items?.e?.qty_warehouse) : '0'}
                                        </h5>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center justify-center">
                                  <Image
                                    src={'/icon/pen.svg'}
                                    alt="icon pen"
                                    width={16}
                                    height={16}
                                    className="size-3 object-cover"
                                  />
                                  <input
                                    value={e?.note}
                                    onChange={_HandleChangeInputOption.bind(this, e?.id, 'note', index)}
                                    name="optionEmail"
                                    placeholder={dataLang?.delivery_receipt_note || 'delivery_receipt_note'}
                                    type="text"
                                    className="responsive-text-xs placeholder:responsive-text-xs 2xl:h-7 xl:h-5 py-0 px-1 w-full text-[#1C252E] font-normal outline-none placeholder:text-typo-gray-4"
                                  />
                                </div>
                              </div>
                              <div className="col-span-4 p-1 flex items-center justify-center">
                                <div className="flex items-center justify-center">
                                  <InputCustom
                                    state={e?.quantity}
                                    setState={(value) => _HandleChangeInputOption(e?.id, 'quantity', e, { value })}
                                    min={1}
                                    step={1}
                                    className={`border p-1 ${
                                      e?.quantity === 0 || e?.quantity === ''
                                        ? 'border-red-500'
                                        : 'border-[#D0D5DD] focus:border-brand-color hover:border-brand-color'
                                    }`}
                                    classNameInput={`text-center !responsive-text-sm w-full`}
                                    classNameButton="size-7"
                                  />
                                </div>
                              </div>
                              <div className="col-span-3 flex items-center justify-center p-1">
                                <div className="relative w-full">
                                  <InPutMoneyFormat
                                    value={e?.price}
                                    onValueChange={_HandleChangeInputOption.bind(this, e?.id, 'price', index)}
                                    readOnly={false}
                                    className={`${
                                      (e?.price < 0 && 'border-red-500') || (e?.price === '' && 'border-red-500')
                                    } rounded-lg appearance-none text-right py-2 pr-5 2xl:pr-6 pl-2 text-neutral-07 responsive-text-sm font-semibold w-full focus:outline-none focus:border-brand-color hover:border-brand-color border border-neutral-N400`}
                                  />
                                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-07 responsive-text-sm font-semibold underline">
                                    đ
                                  </span>
                                </div>
                              </div>
                              <div className="col-span-3 flex items-center justify-center p-1">
                                <div className="relative w-full">
                                  <InPutNumericFormat
                                    value={e?.discount}
                                    onValueChange={_HandleChangeInputOption.bind(this, e?.id, 'discount', index)}
                                    className="rounded-lg appearance-none text-right py-2 pr-5 2xl:pr-6 pl-2 text-neutral-07 responsive-text-sm font-semibold w-full focus:outline-none focus:border-brand-color hover:border-brand-color border border-neutral-N400"
                                    isAllowed={isAllowedDiscount}
                                  />
                                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-07 responsive-text-sm font-semibold">
                                    %
                                  </span>
                                </div>
                              </div>
                              <h3 className="col-span-3 flex gap-1 items-center justify-end px-2 responsive-text-sm font-semibold text-neutral-07">
                                {formatNumber(e?.affterDiscount || 0)}
                                <span className="text-neutral-07 underline">đ</span>
                              </h3>
                              <div className="col-span-3 p-1 flex items-center justify-center">
                                <SelectCustomLabel
                                  placeholder={dataLang?.import_from_tax || 'import_from_tax'}
                                  options={taxOptions}
                                  value={
                                    e?.tax
                                      ? {
                                          label: taxOptions.find((item) => item.value === e?.tax?.value)?.label,
                                          value: e?.tax?.value,
                                          tax_rate: e?.tax?.tax_rate,
                                        }
                                      : null
                                  }
                                  onChange={(value) => _HandleChangeInputOption(e?.id, 'tax', index, value)}
                                  renderOption={(option, isLabel) => (
                                    <div
                                      className={`flex items-center justify-start gap-1 text-[#1C252E] ${
                                        isLabel ? 'py-1 2xl:py-2' : ''
                                      }`}
                                    >
                                      <h2 className="responsive-text-sm leading-normal whitespace-nowrap">
                                        {option?.label}
                                      </h2>
                                      {option?.tax_rate !== '0' && option?.tax_rate !== '5' && (
                                        <h2 className="responsive-text-sm leading-normal">
                                          {option?.tax_rate === '20'
                                            ? `(${option?.tax_rate}%)`
                                            : `${option?.tax_rate}%`}
                                        </h2>
                                      )}
                                    </div>
                                  )}
                                  isVisibleLotDate={false}
                                  isKeepOpen={true}
                                />
                              </div>
                              <div className="col-span-3 flex items-center justify-end">
                                <h3 className="px-4 responsive-text-sm font-semibold text-neutral-07">
                                  {formatNumber(Number(e?.total || 0))}{' '}
                                  <span className="text-neutral-07 underline">đ</span>
                                </h3>
                              </div>
                              <div className="col-span-1 flex items-center justify-center">
                                <ButtonDelete onDelete={_HandleDelete.bind(this, e?.id)} />
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </React.Fragment>
                  </div>
                </Customscrollbar>
              </>
            )}
          </>
        }
        info={
          <OrderFormTabs
            info={
              <div className="flex flex-col gap-3">
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
                  label={dataLang?.purchase_order_table_supplier}
                  placeholderText={dataLang?.purchase_order_supplier || 'purchase_order_supplier'}
                  options={dataSupplier}
                  value={idSupplier}
                  onChange={(value) => {
                    const newValue = dataSupplier.find((item) => item.value === value)
                    _HandleChangeInput('supplier', newValue)
                  }}
                  isError={errSupplier}
                  icon={<PiMapPinLight />}
                  errMess={dataLang?.purchase_order_errSupplier || 'purchase_order_errSupplier'}
                />

                {/* Ngày giao hàng */}
                <DocumentDate
                  dataLang={dataLang}
                  value={delivery_dateNew}
                  onChange={(date) => _HandleChangeInput('delivery_dateNew', date)}
                  errDate={errDate}
                  isRequired={true}
                  label={dataLang?.purchase_order_detail_delivery_date || 'purchase_order_detail_delivery_date'}
                  showTime={false}
                />

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
                      <React.Fragment>
                        {/* Nhân viên */}
                        <SelectWithRadio
                          isRequired={true}
                          label={dataLang?.purchase_order_staff || 'purchase_order_staff'}
                          placeholderText={dataLang?.purchase_order_staff || 'purchase_order_staff'}
                          options={dataStaff}
                          value={idStaff}
                          onChange={(value) => {
                            const newValue = dataStaff.find((item) => item.value === value)
                            _HandleChangeInput('staff', newValue)
                          }}
                          isError={errStaff}
                          icon={<PiMapPinLight />}
                          errMess={dataLang?.purchase_order_errStaff || 'purchase_order_errStaff'}
                        />
                        {/* Chi nhánh */}
                        <div className="mt-4">
                          <SelectWithRadio
                            isRequired={true}
                            label={dataLang?.purchase_order_table_branch || 'purchase_order_table_branch'}
                            placeholderText={dataLang?.purchase_order_branch || 'purchase_order_branch'}
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
                      </React.Fragment>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Xem thêm Button */}
                <div className="flex items-center justify-center p-1 hover:underline">
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
              <div className="flex flex-col gap-6">
                <div className="text-typo-gray-4 font-normal responsive-text-base">
                  {dataLang?.purchase_order_note || 'purchase_order_note'}
                </div>
                <textarea
                  value={note}
                  placeholder={dataLang?.purchase_order_note || 'purchase_order_note'}
                  onChange={_HandleChangeInput.bind(this, 'note')}
                  name="fname"
                  type="text"
                  className="responsive-text-base placeholder:responsive-text-base focus:border-[#92BFF7] border-[#919EAB3D] placeholder:text-slate-300 w-full min-h-[220px] bg-[#ffffff] rounded-[5.5px] font-normal p-2 border outline-none text-[#919EAB]"
                />
              </div>
            }
          />
        }
        total={
          <div className="flex flex-col gap-3 justify-between text-right ">
            <div className="flex justify-between ">
              <div className="font-normal">
                <h3>{dataLang?.purchase_order_table_total || 'purchase_order_table_total'}</h3>
              </div>
              <div className="font-normal">
                <h3 className="text-blue-600">{formatMoney(totalMoney.total)}</h3>
              </div>
            </div>
            <div className="flex justify-between ">
              <div className="font-normal">
                <h3>{dataLang?.purchase_order_detail_discounty || 'purchase_order_detail_discounty'}</h3>
              </div>
              <div className="font-normal">
                <h3 className="text-blue-600">{formatMoney(totalMoney.totalDiscount)}</h3>
              </div>
            </div>
            <div className="flex justify-between ">
              <div className="font-normal">
                <h3>
                  {dataLang?.purchase_order_detail_money_after_discount || 'purchase_order_detail_money_after_discount'}
                </h3>
              </div>
              <div className="font-normal">
                <h3 className="text-blue-600">{formatMoney(totalMoney.totalAfftertDiscount)}</h3>
              </div>
            </div>
            <div className="flex justify-between ">
              <div className="font-normal">
                <h3>{dataLang?.purchase_order_detail_tax_money || 'purchase_order_detail_tax_money'}</h3>
              </div>
              <div className="font-normal">
                <h3 className="text-blue-600">{formatMoney(totalMoney.totalTax)}</h3>
              </div>
            </div>
            <div className="flex justify-between ">
              <div className="font-normal">
                <h3>{dataLang?.purchase_order_detail_into_money || 'purchase_order_detail_into_money'}</h3>
              </div>
              <div className="font-normal">
                <h3 className="text-blue-600">{formatMoney(totalMoney.totalMoney)}</h3>
              </div>
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
        save={resetValue}
        nameModel={'change_item'}
        cancel={() => handleQueryId({ status: false })}
      />
    </React.Fragment>
  )
}

export default OrderForm
