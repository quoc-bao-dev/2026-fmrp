import apiReturns from '@/Api/apiPurchaseOrder/apiReturns'
import { Customscrollbar } from '@/components/UI/common/Customscrollbar'
import EmptyData from '@/components/UI/emptyData'
import InPutMoneyFormat from '@/components/UI/inputNumericFormat/inputMoneyFormat'
import InPutNumericFormat from '@/components/UI/inputNumericFormat/inputNumericFormat'
import Loading from '@/components/UI/loading/loading'
import PopupConfim from '@/components/UI/popupConfim/popupConfim'
import DropdownDiscount from '@/components/common/orderManagement/DropdownDiscount'
import DropdownTax from '@/components/common/orderManagement/DropdownTax'
import { DocumentDate, DocumentNumber } from '@/components/common/orderManagement/GeneralInfo'
import ItemTotalAndDelete from '@/components/common/orderManagement/ItemTotalAndDelete'
import LayoutOrderManagement from '@/components/common/orderManagement/LayoutOrderManagement'
import SelectCustomLabel from '@/components/common/orderManagement/SelectCustomLabel'
import SelectSearch from '@/components/common/orderManagement/SelectSearch'
import SelectWithRadio from '@/components/common/orderManagement/SelectWithRadio'
import TableHeader from '@/components/common/orderManagement/TableHeader'
import { optionsQuery } from '@/configs/optionsQuery'
import { CONFIRMATION_OF_CHANGES, TITLE_DELETE_ITEMS } from '@/constants/delete/deleteItems'
import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate'
import { useSupplierList } from '@/containers/suppliers/supplier/hooks/useSupplierList'
import { useBranchList } from '@/hooks/common/useBranch'
import { useTaxList } from '@/hooks/common/useTaxs'
import { useTreatmentList } from '@/hooks/common/useTreatment'
import useFeature from '@/hooks/useConfigFeature'
import useSetingServer from '@/hooks/useConfigNumber'
import useToast from '@/hooks/useToast'
import { useToggle } from '@/hooks/useToggle'
import { isAllowedDiscount, isAllowedNumber } from '@/utils/helpers/common'
import { formatMoment } from '@/utils/helpers/formatMoment'
import formatMoneyConfig from '@/utils/helpers/formatMoney'
import formatNumberConfig from '@/utils/helpers/formatnumber'
import { PopupParent } from '@/utils/lib/Popup'
import { useMutation, useQueries, useQuery } from '@tanstack/react-query'
import { Add, Minus, TableDocument } from 'iconsax-react'
import moment from 'moment/moment'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { LuRefreshCcw } from 'react-icons/lu'
import { PiMapPinLight, PiUsersLight } from 'react-icons/pi'
import { NumericFormat } from 'react-number-format'
import { useSelector } from 'react-redux'
import { routerReturns } from 'routers/buyImportGoods'
import { v4 as uuidv4 } from 'uuid'
import { useReturnItemsBySupplier } from './hooks/useReturnItemsBySupplier'

const PurchaseReturnsForm = (props) => {
  const router = useRouter()

  const isShow = useToast()

  const id = router.query?.id

  const dataLang = props?.dataLang

  const dataSeting = useSetingServer()

  const { isOpen, isKeyState, handleQueryId } = useToggle()

  const [onSending, sOnSending] = useState(false)

  const [tax, sTax] = useState()

  const [discount, sDiscount] = useState(0)

  const [code, sCode] = useState('')

  const [startDate, sStartDate] = useState(new Date())

  const [note, sNote] = useState('')

  const [date, sDate] = useState(moment().format(FORMAT_MOMENT.DATE_TIME_LONG))

  //new
  const [listData, sListData] = useState([])

  const [parents, sParents] = useState([])

  const [qtyHouse, sQtyHouse] = useState(null)

  const [idSupplier, sIdSupplier] = useState(null)

  const [idTreatment, sIdTreatment] = useState(null)

  const [idBranch, sIdBranch] = useState(null)

  const [load, sLoad] = useState(false)

  const [errSupplier, sErrSupplier] = useState(false)

  const [errDate, sErrDate] = useState(false)

  const [errTreatment, sErrTreatment] = useState(false)

  const [errBranch, sErrBranch] = useState(false)

  const [errWarehouse, sErrWarehouse] = useState(false)

  const [errAmount, sErrAmount] = useState(false)

  const [errSurvive, sErrSurvive] = useState(false)

  const { dataMaterialExpiry, dataProductExpiry, dataProductSerial } = useFeature()

  const { data: dataTasxes = [] } = useTaxList()

  const { data: listBranch = [] } = useBranchList()

  const { data: dataDepartment = [] } = useTreatmentList(dataLang)

  const params = {
    'filter[supplier_id]': idSupplier ? idSupplier?.value : null,
    'filter[branch_id]': idBranch ? idBranch?.value : null,
  }

  const { data: dataItems = [] } = useReturnItemsBySupplier(idSupplier, params)

  const { data: listSupplier } = useSupplierList({
    'filter[branch_id]': idBranch != null ? idBranch.value : null,
  })

  const dataSupplier = idBranch ? listSupplier?.rResult?.map((e) => ({ label: e?.name, value: e?.id, e })) : []

  // Lấy danh sách kho theo từng parent id
  const queries = parents.map((item) => ({
    queryKey: ['api_quantity_stock_id', item.id, idBranch],
    queryFn: async () => {
      const result = await apiReturns.apiQuantityStock(item.id, { params: { 'filter[branch_id]': idBranch?.value } })

      return result?.map((e) => ({
        parentId: item.id,
        label: e?.name,
        value: e?.id,
        warehouse_name: e?.warehouse_name,
        qty: e?.quantity,
      }))
    },
    enabled: !!parents,
    ...optionsQuery,
  }))

  const results = useQueries({ queries })

  const dataWarehouses = results.flatMap((query) => query.data ?? [])

  const [isTotalMoney, sIsTotalMoney] = useState({
    totalPrice: 0,
    totalDiscountPrice: 0,
    totalDiscountAfterPrice: 0,
    totalTax: 0,
    totalAmount: 0,
  })

  const authState = useSelector((state) => state.auth)

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
    router.query && sErrTreatment(false)
    router.query && sErrBranch(false)
    router.query && sStartDate(new Date())
    router.query && sNote('')
    router.query && sIdSupplier(null)
  }, [router.query])

  const taxOptions = [{ label: 'Miễn thuế', value: '0', tax_rate: '0' }, ...dataTasxes]

  const { isFetching } = useQuery({
    queryKey: ['api_detailpage', id],
    queryFn: async () => {
      const rResult = await apiReturns.apiDetailPageReturns(id)

      sListData(
        rResult?.items.map((e) => ({
          id: e?.item?.id,
          item: {
            e: e?.item,
            label: `${e.item?.name} <span style={{display: none}}>${
              e.item?.code + e.item?.product_variation + e.item?.text_type + e.item?.unit_name
            }</span>`,
            value: e.item?.id,
          },
          child: e?.child.map((ce) => ({
            id: Number(ce?.id),
            disabledDate:
              (e.item?.text_type == 'material' && dataMaterialExpiry?.is_enable == '1' && false) ||
              (e.item?.text_type == 'material' && dataMaterialExpiry?.is_enable == '0' && true) ||
              (e.item?.text_type == 'products' && dataProductExpiry?.is_enable == '1' && false) ||
              (e.item?.text_type == 'products' && dataProductExpiry?.is_enable == '0' && true),
            kho: {
              label: ce?.location_name,
              value: ce?.location_warehouses_id,
              warehouse_name: ce?.warehouse_name,
              qty: ce?.quantity_warehouse,
            },
            serial: ce?.serial == null ? '' : ce?.serial,
            quantityLeft: Number(e?.item?.quantity_left),
            quantityReturned: Number(e?.item?.quantity_returned),
            quantityCreate: Number(e?.item?.quantity_create),
            lot: ce?.lot == null ? '' : ce?.lot,
            date: ce?.expiration_date != null ? moment(ce?.expiration_date).toDate() : null,
            unit: e?.item?.unit_name,
            amount: Number(ce?.quantity),
            price: Number(ce?.price),
            discount: Number(ce?.discount_percent),
            tax: {
              tax_rate: ce?.tax_rate,
              value: ce?.tax_id,
              label: taxOptions.find((tax) => tax.value === ce?.tax_id)?.label,
            },
            note: ce?.note,
          })),
        }))
      )

      const checkQty = rResult?.items
        ?.map((e) => e?.item)
        .reduce((obj, e) => {
          obj.id = e?.id
          obj.qty = Number(e?.quantity_left)
          return obj
        }, {})

      const checkQty1 = rResult?.items?.map((e) => ({
        id: e?.item?.id,
        qty: Number(e?.item?.quantity_left),
      }))

      sParents(checkQty1)

      sQtyHouse(checkQty?.qty)
      sCode(rResult?.code)
      sIdBranch({
        label: rResult?.branch_name,
        value: rResult?.branch_id,
      })
      sIdSupplier({
        label: rResult?.supplier_name,
        value: rResult?.supplier_id,
      })
      sIdTreatment({
        label: dataLang[rResult?.treatment_methods_name],
        value: rResult?.treatment_methods,
      })
      sStartDate(moment(rResult?.date).toDate())
      sNote(rResult?.note)
      return rResult
    },
    enabled: !!id,
    ...optionsQuery,
  })

  const resetValue = () => {
    if (isKeyState?.type === 'supplier') {
      sListData([])
      sIdSupplier(isKeyState?.value)
    }
    if (isKeyState?.type === 'branch') {
      sListData([])
      sIdSupplier(null)
      sIdBranch(isKeyState?.value)
    }
    handleQueryId({ status: false })
  }

  const totalMoney = (listData = []) => {
    let totalPrice = listData?.reduce((accumulator, item) => {
      const childTotal = item.child?.reduce((childAccumulator, childItem) => {
        const product = Number(childItem?.price) * Number(childItem?.amount)
        return childAccumulator + product
      }, 0)
      return accumulator + childTotal
    }, 0)

    let totalDiscountPrice = listData?.reduce((accumulator, item) => {
      const childTotal = item.child?.reduce((childAccumulator, childItem) => {
        const product = Number(childItem?.price) * (Number(childItem?.discount) / 100) * Number(childItem?.amount)
        return childAccumulator + product
      }, 0)
      return accumulator + childTotal
    }, 0)

    let totalDiscountAfterPrice = listData?.reduce((accumulator, item) => {
      const childTotal = item.child?.reduce((childAccumulator, childItem) => {
        const product = Number(childItem?.price * (1 - childItem?.discount / 100)) * Number(childItem?.amount)
        return childAccumulator + product
      }, 0)
      return accumulator + childTotal
    }, 0)
    let totalTax = listData?.reduce((accumulator, item) => {
      const childTotal = item.child?.reduce((childAccumulator, childItem) => {
        const product =
          Number(childItem?.price * (1 - childItem?.discount / 100)) *
          (isNaN(childItem?.tax?.tax_rate) ? 0 : Number(childItem?.tax?.tax_rate) / 100) *
          Number(childItem?.amount)
        return childAccumulator + product
      }, 0)
      return accumulator + childTotal
    }, 0)
    let totalAmount = listData?.reduce((accumulator, item) => {
      const childTotal = item.child?.reduce((childAccumulator, childItem) => {
        const product =
          Number(childItem?.price * (1 - childItem?.discount / 100)) *
          (1 + Number(childItem?.tax?.tax_rate) / 100) *
          Number(childItem?.amount)
        return childAccumulator + product
      }, 0)
      return accumulator + childTotal
    }, 0)
    return {
      totalPrice: totalPrice || 0,
      totalDiscountPrice: totalDiscountPrice || 0,
      totalDiscountAfterPrice: totalDiscountAfterPrice || 0,
      totalTax: totalTax || 0,
      totalAmount: totalAmount || 0,
    }
  }

  useEffect(() => {
    const totalPrice = totalMoney(listData)
    sIsTotalMoney(totalPrice)
  }, [listData])

  const _HandleChangeInput = (type, value) => {
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
        sIdSupplier(null)
      }
      if (listData.length === 0) {
        sIdSupplier(value)
      }
    } else if (type === 'treatment') {
      sIdTreatment(value)
    } else if (type === 'note') {
      sNote(value.target.value)
    } else if (type == 'branch' && idBranch != value) {
      if (listData?.length > 0) {
        if (type === 'branch' && idBranch != value) {
          handleQueryId({ status: true, initialKey: { type, value } })
        }
      } else {
        sIdBranch(value)
        sIdSupplier(null)
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

  const handleTimeChange = (date) => {
    sStartDate(date)
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

  useEffect(() => {
    sErrTreatment(false)
  }, [idTreatment != null])

  const formatNumber = (number) => {
    return formatNumberConfig(+number, dataSeting)
  }

  const formatMoney = (number) => {
    return formatMoneyConfig(+number, dataSeting)
  }

  const handingReturn = useMutation({
    mutationFn: (data) => {
      return apiReturns.apiHandingReturn(id, data)
    },
  })

  const _HandleSubmit = (e) => {
    e.preventDefault()

    const hasNullKho = listData.some((item) =>
      item.child?.some(
        (childItem) =>
          childItem.kho === null || (id && (childItem.kho?.label === null || childItem.kho?.warehouse_name === null))
      )
    )

    const hasNullAmount = listData.some((item) =>
      item.child?.some((childItem) => childItem.amount === null || childItem.amount === '' || childItem.amount == 0)
    )

    const isTotalExceeded = listData?.some(
      (e) =>
        !hasNullKho &&
        e.child?.some((opt) => {
          const amount = parseFloat(opt?.amount) || 0
          const qty = parseFloat(opt?.kho?.qty) || 0
          return amount > qty
        })
    )

    const isEmpty = listData?.length === 0 ? true : false
    if (
      idSupplier == null ||
      idBranch == null ||
      idTreatment == null ||
      hasNullKho ||
      hasNullAmount ||
      isTotalExceeded ||
      isEmpty
    ) {
      idSupplier == null && sErrSupplier(true)
      idBranch == null && sErrBranch(true)
      idTreatment == null && sErrTreatment(true)
      hasNullKho && sErrWarehouse(true)
      hasNullAmount && sErrAmount(true)
      if (isEmpty) {
        isShow('error', `Chưa nhập thông tin mặt hàng`)
      } else if (isTotalExceeded) {
        sErrSurvive(true)
        isShow('error', `${dataLang?.returns_err_QtyNotQexceed || 'returns_err_QtyNotQexceed'}`)
      } else {
        isShow('error', `${dataLang?.required_field_null}`)
      }
    } else {
      sErrSurvive(false)
      sErrWarehouse(false)
      sErrAmount(false)
      sOnSending(true)
    }
  }

  const _ServerSending = () => {
    let formData = new FormData()
    formData.append('code', code)
    formData.append('date', formatMoment(startDate, FORMAT_MOMENT.DATE_TIME_LONG))
    formData.append('branch_id', idBranch?.value)
    formData.append('supplier_id', idSupplier?.value)
    formData.append('treatment_methods', idTreatment?.value)
    formData.append('note', note)

    const firstChild = listData?.[0]?.child?.[0]

    listData.forEach((item, index) => {
      formData.append(`items[${index}][id]`, item?.id)
      formData.append(`items[${index}][item]`, item?.item?.value)
      item?.child?.forEach((childItem, childIndex) => {
        formData.append(`items[${index}][child][${childIndex}][id]`, childItem?.id)
        {
          id &&
            formData.append(
              `items[${index}][child][${childIndex}][row_id]`,
              typeof childItem?.id == 'number' ? childItem?.id : 0
            )
        }
        formData.append(`items[${index}][child][${childIndex}][quantity]`, childItem?.amount)
        formData.append(`items[${index}][child][${childIndex}][unit_name]`, childItem?.unit)
        formData.append(`items[${index}][child][${childIndex}][note]`, firstChild?.note || childItem?.note || '')
        formData.append(`items[${index}][child][${childIndex}][tax_id]`, childItem?.tax?.value)
        formData.append(`items[${index}][child][${childIndex}][price]`, childItem?.price)
        formData.append(`items[${index}][child][${childIndex}][location_warehouses_id]`, childItem?.kho?.value)
        formData.append(`items[${index}][child][${childIndex}][discount_percent]`, childItem?.discount)
      })
    })

    handingReturn.mutate(formData, {
      onSuccess: ({ isSuccess, message }) => {
        if (isSuccess) {
          isShow('success', dataLang[message] || message)
          sCode('')
          sStartDate(new Date())
          sIdSupplier(null)
          sIdBranch(null)
          sIdTreatment(null)
          sNote('')
          sErrBranch(false)
          sErrDate(false)
          sErrTreatment(false)
          sErrSupplier(false)
          sListData([])
          router.push(routerReturns.home)
        } else {
          isShow('error', dataLang[message] || message)
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
        sQtyHouse(value?.e?.quantity_left)
        const newChild = {
          id: uuidv4(),
          disabledDate:
            (value?.e?.text_type === 'material' && dataMaterialExpiry?.is_enable === '1' && false) ||
            (value?.e?.text_type === 'material' && dataMaterialExpiry?.is_enable === '0' && true) ||
            (value?.e?.text_type === 'products' && dataProductExpiry?.is_enable === '1' && false) ||
            (value?.e?.text_type === 'products' && dataProductExpiry?.is_enable === '0' && true),
          quantityLeft: Number(value?.e?.quantity_left),
          quantityReturned: Number(value?.e?.quantity_returned),
          quantityCreate: Number(value?.e?.quantity_create),
          kho: null,
          unit: value?.e?.unit_name,
          price: Number(value?.e?.price),
          // amount: Number(value?.e?.quantity_create) || 1,
          amount: null,
          discount: discount ? discount : Number(value?.e?.discount_percent),
          priceAfter: Number(value?.e?.price_after_discount),
          tax: tax
            ? tax
            : {
                label: value?.e?.tax_name == null ? 'Miễn thuế' : value?.e?.tax_name,
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

  const _DataValueItem = (value) => {
    return {
      id: value.value,
      item: value,
      child: [
        {
          id: uuidv4(),
          disabledDate:
            (value?.e?.text_type === 'material' && dataMaterialExpiry?.is_enable === '1' && false) ||
            (value?.e?.text_type === 'material' && dataMaterialExpiry?.is_enable === '0' && true) ||
            (value?.e?.text_type === 'products' && dataProductExpiry?.is_enable === '1' && false) ||
            (value?.e?.text_type === 'products' && dataProductExpiry?.is_enable === '0' && true),
          kho: null,
          unit: value?.e?.unit_name,
          quantityLeft: Number(value?.e?.quantity_left),
          quantityReturned: Number(value?.e?.quantity_returned),
          quantityCreate: Number(value?.e?.quantity_create),
          price: Number(value?.e?.price),
          amount: Number(value?.e?.quantity_left),
          discount: discount ? discount : Number(value?.e?.discount_percent),
          priceAfter: Number(value?.e?.price_after_discount),
          tax: tax
            ? tax
            : {
                label: value?.e?.tax_name == null ? 'Miễn thuế' : value?.e?.tax_name,
                value: value?.e?.tax_id,
                tax_rate: value?.e?.tax_rate,
              },
          totalMoney: Number(value?.e?.amount),
          note: value?.e?.note,
        },
      ],
    }
  }

  const _HandleAddParent = (value) => {
    const firstItem = value?.[0]
    if (firstItem) {
      sQtyHouse(firstItem?.e?.quantity_left) // Đang bị sai
    }

    sParents(value?.map((e) => ({ id: e?.value, qty: Number(e?.e?.quantity_left) })))

    // Tạo Map để tra xem item đã có trong listData chưa
    const existingMap = new Map(listData?.map((e) => [e?.item?.value, e]))

    // Tạo danh sách cập nhật
    const updatedList = value?.map((item) => {
      const existing = existingMap.get(item?.value)
      return existing ? existing : _DataValueItem(item)
    })

    sListData(updatedList)
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

  const _HandleDeleteAllChild = (parentId) => {
    const newData = listData
      .map((e) => {
        if (e.id === parentId) {
          const newChild = e.child?.filter((ce) => ce?.kho !== null)
          return { ...e, child: newChild }
        }
        return e
      })
      .filter((e) => e.child?.length > 0)
    sListData([...newData])
  }

  const FunCheckQuantity = (parentId, childId) => {
    const e = listData.find((item) => item?.id == parentId)
    if (!e) return
    const ce = e.child.find((child) => child?.id == childId)
    if (!ce) return
    const checkChild = e.child.reduce((sum, opt) => sum + parseFloat(opt?.amount || 0), 0)

    if (checkChild > qtyHouse) {
      isShow('error', `Tổng số lượng chỉ được bé hơn hoặc bằng ${formatNumber(qtyHouse)} số lượng còn lại`)
      ce.amount = ''
      setTimeout(() => {
        sLoad(true)
      }, 500)
      setTimeout(() => {
        sLoad(false)
      }, 1000)
    }
  }

  const _HandleChangeChild = (parentId, childId, type, value) => {
    const newData = listData.map((e) => {
      if (e?.id === parentId) {
        const newChild = e.child?.map((ce) => {
          var index = e.child.findIndex((x) => x?.id === childId)
          if (ce?.id === childId) {
            if (type === 'amount') {
              sErrSurvive(false)
              ce.amount = Number(value?.value)
              FunCheckQuantity(parentId, childId)
              return { ...ce }
            } else if (type === 'increase') {
              sErrSurvive(false)

              const totalSoLuong = e.child.reduce((sum, opt) => sum + parseFloat(opt?.amount || 0), 0)

              if (ce?.id === childId && totalSoLuong == qtyHouse) {
                isShow('error', `Tổng số lượng chỉ được bé hơn hoặc bằng ${formatNumber(qtyHouse)} số lượng còn lại`)

                return { ...ce }
              } else if (ce?.id === childId && totalSoLuong == Number(ce?.kho?.qty)) {
                isShow(
                  'error',
                  `Tổng số lượng chỉ được bé hơn hoặc bằng ${formatNumber(Number(ce?.kho?.qty))} số lượng còn lại`
                )

                return { ...ce }
              } else if (ce?.id === childId && totalSoLuong > Number(ce?.kho?.qty)) {
                isShow(
                  'error',
                  `Tổng số lượng chỉ được bé hơn hoặc bằng ${formatNumber(Number(ce?.kho?.qty))} số lượng tồn`
                )

                return { ...ce }
              } else if (ce?.id === childId && totalSoLuong > qtyHouse) {
                isShow('error', `Tổng số lượng chỉ được bé hơn hoặc bằng ${formatNumber(qtyHouse)} số lượng tồn`)

                return { ...ce }
              } else {
                return {
                  ...ce,
                  amount: Number(Number(ce?.amount) + 1),
                }
              }
            } else if (type === 'decrease') {
              sErrSurvive(false)
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
            } else if (type === 'kho') {
              const checkKho = e?.child?.map((house) => house)?.some((i) => i?.kho?.value === value?.value)
              sErrSurvive(false)
              if (checkKho) {
                isShow('error', `${dataLang?.returns_err_Warehouse || 'returns_err_Warehouse'}`)
                return { ...ce }
              } else {
                return { ...ce, kho: value }
              }
            } else if (type === 'tax') {
              return { ...ce, tax: value }
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

  const breadcrumbItems = [
    {
      label: `${dataLang?.returns_title || 'returns_title'}`,
    },
    {
      label: `${dataLang?.returns_list || 'returns_list'}`,
      href: routerReturns.home,
    },
    {
      label: `${
        id
          ? dataLang?.returns_title_edit || 'returns_title_edit'
          : dataLang?.returns_title_child || 'returns_title_child'
      }`,
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
          alt={option?.e?.name || 'Product image'}
          className={`${isOnTable ? 'size-12' : 'xl:size-16 size-12'} object-cover rounded-md`}
        />
        <div className="flex flex-col gap-1 3xl:text-[10px] text-[9px] font-normal overflow-hidden w-full">
          <h3 className={`font-semibold responsive-text-sm ${isOnTable ? 'text-brand-color' : 'text-black'}`}>
            {option.e?.name || option.e?.item_name}
          </h3>
          <h5 className={`${isOnTable ? 'text-neutral-03' : 'text-blue-color'} truncate`}>
            {option.e?.code}: {option.e?.product_variation}
          </h5>
          <h5 className="flex flex-wrap items-center text-neutral-03">
            {option.e?.import_code} - {`(ĐGSCK: ${formatMoney(option.e?.price_after_discount)}) -`}{' '}
            {dataLang[option.e?.text_type]}
          </h5>
          {isOnTable && <h5 className="text-neutral-03">ĐVT: {option.e?.unit_name}</h5>}
          <div className="flex items-center gap-2 italic text-neutral-03">
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
  console.log('listData', listData)

  return (
    <LayoutOrderManagement
      dataLang={dataLang}
      titleHead={
        id
          ? dataLang?.returns_title_edit || 'returns_title_edit'
          : dataLang?.returns_title_child || 'returns_title_child'
      }
      breadcrumbItems={breadcrumbItems}
      titleLayout={
        id
          ? dataLang?.returns_title_edit || 'returns_title_edit'
          : dataLang?.returns_title_child || 'returns_title_child'
      }
      searchBar={
        <div className="flex flex-col w-full">
          <SelectSearch
            options={dataItems}
            onChange={(value) => {
              _HandleAddParent(value)
            }}
            value={listData?.map((e) => e?.item)}
            formatOptionLabel={(option) => selectItemsLabel(option)}
            placeholder={dataLang?.returns_items || 'returns_items'}
          />
        </div>
      }
      tableLeft={
        <>
          {listData.length === 0 ? (
            <EmptyData />
          ) : (
            <div>
              {/* Thông tin mặt hàng header */}
              <div className="grid grid-cols-12 gap-3 2xl:gap-4 items-center sticky top-0 py-2 z-10 border-b border-gray-100">
                <TableHeader className="text-left col-span-3">
                  {dataLang?.import_from_items || 'import_from_items'}
                </TableHeader>
                <div className="col-span-9">
                  <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.6fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1.2fr)_minmax(0,0.2fr)] gap-3 2xl:gap-4">
                    <TableHeader className="text-center">{dataLang?.returns_point || 'returns_point'}</TableHeader>
                    <TableHeader className="text-center">
                      {dataLang?.import_from_quantity || 'import_from_quantity'}
                    </TableHeader>
                    <TableHeader className="text-center">
                      {dataLang?.import_from_unit_price || 'import_from_unit_price'}
                    </TableHeader>
                    {/* Chọn hoàng loạt % chiết khấu */}
                    <DropdownDiscount
                      value={discount}
                      onChange={_HandleChangeInput.bind(this, 'discount')}
                      dataLang={dataLang}
                    />
                    <TableHeader className="text-center">{dataLang?.returns_sck || 'returns_sck'}</TableHeader>
                    {/* Chọn hàng loại % Thuế */}
                    <DropdownTax
                      value={tax}
                      onChange={_HandleChangeInput.bind(this, 'tax')}
                      dataLang={dataLang}
                      taxOptions={taxOptions}
                    />

                    <TableHeader className="text-right">
                      {dataLang?.import_into_money || 'import_into_money'}
                    </TableHeader>
                  </div>
                </div>
              </div>
              {/* Thông tin mặt hàng body */}
              <Customscrollbar className="max-h-[760px] overflow-auto pb-2 ">
                <div className="h-[100%] w-full">
                  {isFetching ? (
                    <Loading className="w-full h-10" color="#0f4f9e" />
                  ) : (
                    <>
                      {listData?.map((e, index) => {
                        const firstChild = e?.child?.[0]
                        const isLast = index === listData.length - 1

                        return (
                          <div
                            key={e?.id?.toString()}
                            className={`grid items-center grid-cols-12 gap-3 2xl:gap-4 my-1 ${
                              isLast ? '' : 'border-b border-[#F3F3F4]'
                            }`}
                          >
                            {/* Mặt hàng */}
                            <div className="h-full col-span-3">
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
                              <div className="flex items-center justify-center">
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
                              {e?.child?.filter((e) => e?.kho == null).length >= 2 && (
                                <button
                                  onClick={_HandleDeleteAllChild.bind(this, e?.id, e?.item)}
                                  className="text-xs text-center w-full rounded-lg mt-2 px-5 py-2 overflow-hidden group bg-rose-500 relative hover:bg-gradient-to-r hover:from-rose-500 hover:to-rose-400 text-white transition-all ease-out duration-300"
                                >
                                  Xóa {e?.child?.filter((e) => e?.kho == null).length} hàng chưa chọn kho
                                </button>
                              )}
                            </div>
                            <div className="col-span-9">
                              <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.6fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1.2fr)_minmax(0,0.2fr)] gap-3 2xl:gap-4 items-center">
                                {load ? (
                                  <Loading className="h-2 col-span-8" color="#0f4f9e" />
                                ) : (
                                  e?.child?.map((ce) => (
                                    <React.Fragment key={ce?.id?.toString()}>
                                      {/* Kho Trả - Vị trí trả */}
                                      <div className="flex flex-col justify-center">
                                        <SelectCustomLabel
                                          dataLang={dataLang}
                                          placeholder={dataLang?.returns_point || 'returns_point'}
                                          options={dataWarehouses.filter((o) => o.parentId === e.id)}
                                          value={ce?.kho}
                                          onChange={_HandleChangeChild.bind(this, e?.id, ce?.id, 'kho')}
                                          isError={
                                            (errWarehouse && ce?.kho == null) ||
                                            (errWarehouse &&
                                              (ce?.kho?.label == null || ce?.kho?.warehouse_name == null))
                                          }
                                          renderOption={(option) => {
                                            return (
                                              (option?.warehouse_name || option?.label || option?.qty) && (
                                                <div>
                                                  <div className="flex gap-1 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] leading-normal font-semibold">
                                                    <h2>
                                                      {dataLang?.returns_wareshoue || 'returns_wareshoue'}:{' '}
                                                      {option?.warehouse_name}
                                                    </h2>
                                                  </div>
                                                  <div className="flex gap-1 3xl:text-[11px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] leading-normal font-medium">
                                                    <h2>
                                                      {dataLang?.returns_wareshouePosition ||
                                                        'returns_wareshouePosition'}
                                                      : {option?.label}
                                                    </h2>
                                                  </div>
                                                  <div className="flex gap-1 2xl:text-[11px] xl:text-[9.5px] text-[9px] leading-normal font-medium">
                                                    <h2>
                                                      {dataLang?.returns_survive || 'returns_survive'}:{' '}
                                                      {formatNumber(option?.qty)}
                                                    </h2>
                                                  </div>
                                                </div>
                                              )
                                            )
                                          }}
                                        />
                                      </div>
                                      {/* Số lượng */}
                                      <div
                                        className={`relative flex items-center justify-center 3xl:p-2 xl:p-[2px] p-[1px] border rounded-3xl ${
                                          errAmount && (ce?.amount === null || ce?.amount === '' || ce?.amount === 0)
                                            ? 'border-red-500'
                                            : errSurvive
                                            ? 'border-red-500'
                                            : 'focus:border-brand-color hover:border-brand-color border-neutral-N400'
                                        } ${
                                          ce?.amount === null || ce?.amount === '' || ce?.amount === 0
                                            ? 'border-red-500 hover:border-red-500 focus:border-red-500'
                                            : ''
                                        }`}
                                      >
                                        <button
                                          disabled={
                                            ce?.amount === 1 ||
                                            ce?.amount === '' ||
                                            ce?.amount === null ||
                                            ce?.amount === 0
                                          }
                                          className="2xl:scale-100 xl:scale-90 scale-75 hover:bg-typo-blue-4/50 font-bold flex items-center justify-center p-0.5 bg-primary-05 rounded-full"
                                          onClick={_HandleChangeChild.bind(this, e?.id, ce?.id, 'decrease')}
                                        >
                                          <Minus className="scale-50 2xl:scale-100 xl:scale-100" size="16" />
                                        </button>
                                        <InPutNumericFormat
                                          onValueChange={_HandleChangeChild.bind(this, e?.id, ce?.id, 'amount')}
                                          value={ce?.amount || null}
                                          className={`appearance-none text-center responsive-text-sm font-normal w-full focus:outline-none`}
                                          isAllowed={(values) => {
                                            if (!values.value) return true
                                            const { floatValue } = values
                                            if (floatValue > ce?.quantityLeft || floatValue > qtyHouse) {
                                              isShow(
                                                'error',
                                                `${props.dataLang?.returns_err_Qty || 'returns_err_Qty'} ${formatNumber(
                                                  ce?.quantityLeft
                                                )}`
                                              )
                                            }
                                            return floatValue <= ce?.quantityLeft
                                          }}
                                          allowNegative={false}
                                        />
                                        <button
                                          className="2xl:scale-100 xl:scale-90 scale-75 hover:bg-typo-blue-4/50 font-bold flex items-center justify-center p-0.5  bg-primary-05 rounded-full"
                                          onClick={_HandleChangeChild.bind(this, e?.id, ce?.id, 'increase')}
                                        >
                                          <Add className="scale-50 2xl:scale-100 xl:scale-100" size="16" />
                                        </button>
                                        <div className="absolute -top-4 -right-2 p-1 cursor-pointer">
                                          <PopupParent
                                            trigger={
                                              <div className="relative">
                                                <TableDocument size="18" color="#4f46e5" className="font-medium" />
                                                <span className="h-2 w-2  absolute top-0 left-1/2  translate-x-[50%] -translate-y-[50%]">
                                                  <span className="relative inline-flex w-2 h-2 bg-indigo-500 rounded-full">
                                                    <span className="absolute inline-flex w-full h-full bg-indigo-400 rounded-full opacity-75 animate-ping"></span>
                                                  </span>
                                                </span>
                                              </div>
                                            }
                                            position="left center"
                                            on={['hover', 'focus']}
                                          >
                                            <div className="flex flex-col bg-primary-06 px-2.5 py-0.5 rounded-lg font-deca">
                                              <span className="text-xs font-medium">
                                                {dataLang?.returns_sldn || 'returns_sldn'}:{' '}
                                                {formatNumber(ce?.quantityCreate)}{' '}
                                              </span>
                                              <span className="text-xs font-medium">
                                                {dataLang?.returns_sldt || 'returns_sldt'}:{' '}
                                                {formatNumber(ce?.quantityReturned)}
                                              </span>
                                              <span className="text-xs font-medium">
                                                {dataLang?.returns_slcl || 'returns_slcl'}:{' '}
                                                {formatNumber(ce?.quantityLeft)}
                                              </span>
                                            </div>
                                          </PopupParent>
                                        </div>
                                      </div>
                                      {/* Đơn giá */}
                                      <div
                                        className={`flex items-center justify-center py-2 px-2 2xl:px-3 rounded-lg border ${
                                          ce?.price === '' || ce?.price === null
                                            ? 'border-red-500'
                                            : 'focus:border-brand-color hover:border-brand-color border-neutral-N400'
                                        }`}
                                      >
                                        <InPutMoneyFormat
                                          className={`appearance-none text-center responsive-text-sm font-semibold w-full focus:outline-none`}
                                          onValueChange={_HandleChangeChild.bind(this, e?.id, ce?.id, 'price')}
                                          value={ce?.price}
                                          allowNegative={false}
                                          isAllowed={isAllowedNumber}
                                          isSuffix=" đ"
                                        />
                                      </div>
                                      {/* % Chiết khấu */}
                                      <div className="flex items-center justify-end py-2 px-2 2xl:px-3 rounded-lg border border-neutral-N400 focus:border-brand-color hover:border-brand-color responsive-text-sm font-semibold">
                                        <NumericFormat
                                          className="appearance-none w-full focus:outline-none text-right"
                                          onValueChange={_HandleChangeChild.bind(this, e?.id, ce?.id, 'discount')}
                                          value={ce?.discount}
                                          isAllowed={isAllowedDiscount}
                                          suffix=" %"
                                          allowNegative={false}
                                        />
                                      </div>
                                      {/* Đơn giá sau Chiết khấu */}
                                      <div className="flex items-center justify-center text-center responsive-text-sm font-semibold">
                                        <h3>{formatMoney(Number(ce?.price) * (1 - Number(ce?.discount) / 100))}</h3>
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
                                        total={formatMoney(
                                          ce?.price *
                                            (1 - Number(ce?.discount) / 100) *
                                            (1 + Number(ce?.tax?.tax_rate) / 100) *
                                            Number(ce?.amount)
                                        )}
                                        onDelete={_HandleDeleteChild.bind(this, e?.id, ce?.id)}
                                      />
                                    </React.Fragment>
                                  ))
                                )}
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
        <div className="flex flex-col gap-4 relative">
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
            errDate={errDate}
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
          {/* Phương thức xử lí */}
          <SelectWithRadio
            isRequired={true}
            label={dataLang?.returns_treatment_methods || 'returns_treatment_methods'}
            placeholderText="Chọn phương thức xử lý"
            options={dataDepartment}
            value={idTreatment}
            onChange={(value) => {
              const newValue = dataDepartment.find((item) => item.value === value)
              _HandleChangeInput('treatment', newValue)
            }}
            isError={errTreatment}
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
            value={idBranch}
            onChange={(value) => {
              const newValue = listBranch.find((item) => item.value === value)
              _HandleChangeInput('branch', newValue)
            }}
            isError={errBranch}
            icon={<PiMapPinLight />}
            errMess={dataLang?.purchase_order_errBranch || 'purchase_order_errBranch'}
          />
        </div>
      }
      note={
        <div>
          <div className="responsive-text-base font-normal text-secondary-color-text mb-3 capitalize">
            {dataLang?.returns_reason || 'returns_reason'}
          </div>
          <textarea
            value={note}
            placeholder={dataLang?.returns_reason || 'returns_reason'}
            onChange={_HandleChangeInput.bind(this, 'note')}
            name="fname"
            type="text"
            className="focus:border-brand-color border-gray-200 placeholder-secondary-color-text-disabled placeholder:responsive-text-base w-full h-[80px] max-h-[80px] bg-[#ffffff] rounded-lg text-[#52575E] responsive-text-base font-normal px-3 py-2 border outline-none"
          />
        </div>
      }
      isTotalMoney={isTotalMoney}
      routerBack={routerReturns.home}
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

export default PurchaseReturnsForm
