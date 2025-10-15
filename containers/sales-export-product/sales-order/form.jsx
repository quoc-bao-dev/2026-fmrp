import apiSalesOrder from '@/Api/apiSalesExportProduct/salesOrder/apiSalesOrder'
import DropdownDiscount from '@/components/common/orderManagement/DropdownDiscount'
import DropdownTax from '@/components/common/orderManagement/DropdownTax'
import InfoFormLabel from '@/components/common/orderManagement/InfoFormLabel'
import ItemTotalAndDelete from '@/components/common/orderManagement/ItemTotalAndDelete'
import LayoutOrderManagement from '@/components/common/orderManagement/LayoutOrderManagement'
import SelectCustomLabel from '@/components/common/orderManagement/SelectCustomLabel'
import SelectSearch from '@/components/common/orderManagement/SelectSearch'
import SelectWithRadio from '@/components/common/orderManagement/SelectWithRadio'
import TableHeader from '@/components/common/orderManagement/TableHeader'
import SelectWithSort from '@/components/common/select/SelectWithSort'
import CalendarBlankIcon from '@/components/icons/common/CalendarBlankIcon'
import { Customscrollbar } from '@/components/UI/common/Customscrollbar'
import EmptyData from '@/components/UI/emptyData'
import InPutMoneyFormat from '@/components/UI/inputNumericFormat/inputMoneyFormat'
import InPutNumericFormat from '@/components/UI/inputNumericFormat/inputNumericFormat'
import PopupConfim from '@/components/UI/popupConfim/popupConfim'
import { optionsQuery } from '@/configs/optionsQuery'
import { CONFIRMATION_OF_CHANGES, TITLE_DELETE_ITEMS } from '@/constants/delete/deleteItems'
import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate'
import { useBranchList } from '@/hooks/common/useBranch'
import { useClientComboboxByBranch } from '@/hooks/common/useClients'
import { useContactCombobox } from '@/hooks/common/useContacts'
import { useStaffComboboxByBranch } from '@/hooks/common/useStaffs'
import { useTaxList } from '@/hooks/common/useTaxs'
import useSetingServer from '@/hooks/useConfigNumber'
import useToast from '@/hooks/useToast'
import { useToggle } from '@/hooks/useToggle'
import { routerSalesOrder } from '@/routers/sellingGoods'
import { isAllowedDiscount, isAllowedNumber } from '@/utils/helpers/common'
import { formatMoment } from '@/utils/helpers/formatMoment'
import formatMoneyConfig from '@/utils/helpers/formatMoney'
import formatNumberConfig from '@/utils/helpers/formatnumber'
import { useQuery } from '@tanstack/react-query'
import { ConfigProvider, DatePicker } from 'antd'
import viVN from 'antd/lib/locale/vi_VN'
import dayjs from 'dayjs'
import 'dayjs/locale/vi'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { AnimatePresence, motion } from 'framer-motion'
import { Add, ArrowDown2, ArrowUp2, Minus } from 'iconsax-react'
import moment from 'moment'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { FiUser } from 'react-icons/fi'
import { LuBriefcase } from 'react-icons/lu'
import { PiHash, PiMapPinLight } from 'react-icons/pi'
import { useSelector } from 'react-redux'
import { v4 as uuidv4 } from 'uuid'
import { useSalesOrderQuotaByBranch } from './hooks/useSalesOrderQuotaByBranch'
import { debounce } from 'lodash'

dayjs.extend(customParseFormat)
dayjs.locale('vi')

const SalesOrderForm = (props) => {
  const [showMoreInfo, setShowMoreInfo] = useState(false)
  const [idProductSale, setIdProductSale] = useState(null)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [selectedPersonalContact, setSelectedPersonalContact] = useState(null)
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [flagStateChange, setFlagStateChange] = useState(false)
  const authState = useSelector((state) => state.auth)

  const [searchClient, sSearchClient] = useState(null)

  // Data Fetching
  const { data: dataBranch = [] } = useBranchList()
  const { data: dataStaffs = [] } = useStaffComboboxByBranch({
    branch_id: selectedBranch != null ? [+selectedBranch]?.map((e) => e) : null,
  })
  const { data: dataPersonContact = [] } = useContactCombobox({
    client_id: selectedCustomer != null ? selectedCustomer : null,
  })
  const { data: dataCustomer = [] } = useClientComboboxByBranch({
    search: searchClient,
    branch_id: selectedBranch !== null ? [selectedBranch]?.map((e) => e) : null,
  })
  const { data: dataTasxes = [] } = useTaxList()

  // Gán chi nhánh đầu tiên vào state selectedBranch khi render
  useEffect(() => {
    if (dataBranch.length > 0 && dataBranch[0]?.value) {
      if (authState.branch?.length > 0 && !selectedBranch) {
        const firstBranch = authState.branch[0].id
        setSelectedBranch(firstBranch)
        setBranch({ label: authState.branch[0].name, value: firstBranch })
      }
    }
  }, [dataBranch, authState.branch])

  // Gán nhân viên theo staff_id từ authState lọc từ mảng dataStaffs
  useEffect(() => {
    if (dataStaffs.length > 0 && authState?.staff_id) {
      const staff = dataStaffs.find((e) => e.value === authState?.staff_id)

      setSelectedStaff(staff?.value)
    }
  }, [dataStaffs, authState?.staff_id])

  // Reset state của ô "khách hàng, nhân viên, người liên lạc" khi ô "chi nhánh" thay đổi, để đổ dữ liệu mới (khi có)
  useEffect(() => {
    if (selectedBranch === undefined) {
      setFlagStateChange(true)
    } else {
      setFlagStateChange(false)
    }
    setSelectedCustomer(null)
    setSelectedStaff(null)
    setSelectedPersonalContact(null)
  }, [selectedBranch])

  // Reset state của ô "người liên lạc" khi ô "khách hàng" thay đổi, để đổ dữ liệu mới (khi có)
  useEffect(() => {
    setSelectedPersonalContact(null)
  }, [selectedCustomer])

  // End Optimize UI

  const router = useRouter()

  const isShow = useToast()

  const dataSeting = useSetingServer()

  const id = router.query?.id

  const dataLang = props?.dataLang

  const { isOpen, isId, isIdChild: status, handleQueryId } = useToggle()

  const [onFetchingItemsAll, setOnFetchingItemsAll] = useState(false)

  const [onFetchingItem, setOnFetchingItem] = useState(false)

  const [onSending, setOnSending] = useState(false)

  const [option, setOption] = useState([])

  const [dataItems, setDataItems] = useState([])

  const [note, setNote] = useState('')

  const [codeProduct, setCodeProduct] = useState('')

  const [totalTax, setTotalTax] = useState()

  const [totalDiscount, setTotalDiscount] = useState(0)

  const [startDate, setStartDate] = useState(dayjs())

  const [deliveryDate, setDeliveryDate] = useState(null)

  const [customer, setCustomer] = useState(null)

  const [contactPerson, setContactPerson] = useState(null)

  const [staff, setStaff] = useState(null)

  const [quote, setQuote] = useState(null)

  const [branch, setBranch] = useState(null)

  const [errDate, setErrDate] = useState(false)

  const [errCustomer, sErrCustomer] = useState(false)

  const [errStaff, setErrStaff] = useState(false)

  const [errQuote, setErrQuote] = useState(false)

  const [errDeliveryDate, setErrDeliveryDate] = useState(false)

  const [errBranch, setErrBranch] = useState(false)

  const [typeOrder, setTypeOrder] = useState('0')

  const [itemsAll, setItemsAll] = useState([])

  const [isTotalMoney, setIsTotalMoney] = useState({
    totalPrice: 0,
    totalDiscountPrice: 0,
    totalDiscountAfterPrice: 0,
    totalTax: 0,
    totalAmount: 0,
  })

  const params = {
    'filter[branch_id]': selectedBranch !== null ? +selectedBranch : null,
    'filter[client_id]': selectedCustomer !== null ? +selectedCustomer : null,
  }

  useEffect(() => {
    router.query && setErrDate(false)
    router.query && sErrCustomer(false)
    router.query && setErrStaff(false)
    router.query && setErrDeliveryDate(false)
    router.query && setErrBranch(false)
    router.query && setStartDate(dayjs())
    router.query && setDeliveryDate(null)
    router.query && setNote('')
  }, [id, router.query])

  // Fetch edit
  useQuery({
    queryKey: ['api_detail_sale_order', id],
    queryFn: async () => {
      const rResult = await apiSalesOrder.apiDetail(id)
      const items = rResult?.items?.map((e) => ({
        price_quote_order_item_id: e?.id,
        id: e.id,
        item: {
          e: e?.item,
          label: `${e.item?.item_name} <span style={{display: none}}>${
            e.item?.code + e.item?.product_variation + e.item?.text_type + e.item?.unit_name
          }</span>`,
          value: e.item?.id,
        },
        quantity: +e?.quantity,
        price: +e?.price,
        discount: +e?.discount_percent,
        tax: { tax_rate: e?.tax_rate, value: e?.tax_id },
        unit: e.item?.unit_name,
        price_after_discount: +e?.price_after_discount,
        note: e?.note,
        total_amount: +e?.price_after_discount * (1 + +e?.tax_rate / 100) * +e?.quantity,
        delivery_date: moment(e?.delivery_date).toDate(),
      }))

      setItemsAll(
        rResult?.items?.map((e) => ({
          label: `${e.item?.item_name} <span style={{display: none}}>${e.item?.code}</span><span style={{display: none}}>${e.item?.product_variation} </span><span style={{display: none}}>${e.item?.text_type} ${e.item?.unit_name} </span>`,
          value: e.item?.id,
          e: e.item,
        }))
      )
      setOption(items)
      setCodeProduct(rResult?.code)

      setContactPerson(
        rResult?.contact_name !== null && rResult?.contact_name !== '0'
          ? { label: rResult?.contact_name, value: rResult?.contact_id }
          : null
      )
      setSelectedPersonalContact(
        rResult?.contact_id !== null && rResult?.contact_id !== '0' ? rResult?.contact_id : null
      )

      setBranch({ label: rResult?.branch_name, value: rResult?.branch_id })
      setSelectedBranch(rResult?.branch_id)

      setStaff({ label: rResult?.staff_name, value: rResult?.staff_id })
      setSelectedStaff(rResult?.staff_id)

      setCustomer({ label: rResult?.client_name, value: rResult?.client_id })
      setSelectedCustomer(rResult?.client_id)

      setStartDate(moment(rResult?.date).toDate())
      setDeliveryDate(moment(rResult?.items[0]?.delivery_date).toDate())

      setNote(rResult?.note)

      if (rResult?.quote_id !== '0' && rResult?.quote_code !== null) {
        setTypeOrder('1')
        // setHidden(true);
        // setQuote({ label: rResult?.quote_code, value: rResult?.quote_id, });
      }
      return rResult
    },
    ...optionsQuery,
    enabled: !!id,
  })

  // fetch items
  const handleFetchingItemsAll = async () => {
    let form = new FormData()

    if (selectedBranch != null) {
      ;[+selectedBranch].forEach((e, index) => form.append(`branch_id[${index}]`, e))
      option.forEach((item, idx) => {
        form.append(`items_id_selected[${idx}]`, item?.item?.value ?? '')
      })
    }
    try {
      const {
        data: { result },
      } = await apiSalesOrder.apiItems(form)

      setDataItems(result)

      setOnFetchingItemsAll(false)
    } catch (error) {}
  }

  const handleFetchingItem = async () => {
    let form = new FormData()
    if (selectedBranch != null) {
      ;[+selectedBranch].forEach((e, index) => form.append(`branch_id[${index}]`, e))
    }
    if (typeOrder === '1') {
      if (quote && quote.value !== null) {
        try {
          const {
            data: { result },
          } = await apiSalesOrder.apiQuotaItems({
            params: {
              'filter[quote_id]': quote !== null ? +quote?.value : null,
            },
          })
          setDataItems(result)

          setOnFetchingItem(false)
        } catch (error) {}
      } else {
        try {
          const {
            data: { result },
          } = await apiSalesOrder.apiItems(form)

          setDataItems(result)

          setOnFetchingItem(false)
        } catch (error) {}
      }
    } else if (typeOrder === '0') {
      try {
        const {
          data: { result },
        } = await apiSalesOrder.apiItems(form)

        setDataItems(result)

        setOnFetchingItem(false)
      } catch (error) {}
    }
  }

  // Set hàng loại % Thuế
  useEffect(() => {
    if (totalTax == null) return
    setOption((prevOption) => {
      const newOption = [...prevOption]
      const thueValue = totalTax?.tax_rate || 0
      const chietKhauValue = totalDiscount || 0
      newOption.forEach((item) => {
        const dongiasauchietkhau = item?.price * (1 - chietKhauValue / 100)
        const thanhTien = dongiasauchietkhau * (1 + thueValue / 100) * item.quantity
        item.tax = totalTax
        item.total_amount = isNaN(thanhTien) ? 0 : thanhTien
      })
      return newOption
    })
  }, [totalTax])

  useEffect(() => {
    if (deliveryDate == null) return
    setOption((prevOption) => {
      const newOption = [...prevOption]

      newOption.forEach((item) => {
        item.delivery_date = deliveryDate || null
      })
      return newOption
    })
  }, [deliveryDate])

  // Set hàng loạt % Chiết khẩu
  useEffect(() => {
    if (totalDiscount == null) return
    setOption((prevOption) => {
      const newOption = [...prevOption]
      const thueValue = totalTax?.tax_rate != undefined ? totalTax?.tax_rate : 0
      const chietKhauValue = totalDiscount ? totalDiscount : 0

      newOption.forEach((item) => {
        const dongiasauchietkhau = item?.price * (1 - chietKhauValue / 100)
        const thanhTien = dongiasauchietkhau * (1 + thueValue / 100) * item.quantity
        // item.tax = totalTax
        item.discount = Number(totalDiscount)
        item.price_after_discount = isNaN(dongiasauchietkhau) ? 0 : dongiasauchietkhau
        item.total_amount = isNaN(thanhTien) ? 0 : thanhTien
      })
      return newOption
    })
  }, [totalDiscount])

  useEffect(() => {
    setCustomer(null) || setContactPerson(null) || setStaff(null)
  }, [])

  useEffect(() => {
    selectedBranch !== null && setOnFetchingItemsAll(true)
    selectedBranch == null && setItemsAll([])
  }, [selectedBranch])

  useEffect(() => {
    quote !== null && setOnFetchingItem(true)
  }, [quote])

  useEffect(() => {
    onFetchingItemsAll && handleFetchingItemsAll()
  }, [onFetchingItemsAll, option, branch])

  useEffect(() => {
    onFetchingItem && handleFetchingItem()
  }, [onFetchingItem])

  // Validate state
  useEffect(() => {
    setErrDate(false)
  }, [startDate != null])

  useEffect(() => {
    sErrCustomer(false)
  }, [selectedCustomer != null])

  useEffect(() => {
    setErrDeliveryDate(false)
  }, [deliveryDate != null])

  useEffect(() => {
    setErrBranch(false)
  }, [selectedBranch != null])

  useEffect(() => {
    setErrStaff(false)
  }, [selectedStaff != null])

  // format number
  const formatNumber = (number) => {
    return formatNumberConfig(+number, dataSeting)
  }

  const formatMoney = (number) => {
    return formatMoneyConfig(+number, dataSeting)
  }

  const resetValue = () => {
    if (status == 'customer') {
      setCustomer(isId)
      setContactPerson(null)
      // setQuote(null);
      setOption([])

      setOnFetchingItem(true)
    }
    if (status == 'branch') {
      setBranch(isId)
      setOption([])
      setCustomer(null)
      setContactPerson(null)
      setStaff(null)
      // setQuote(null);
    }
    if (status == 'typeOrder') {
      setTypeOrder(isId)
      // setHidden(isId === "1");
      // setQuote(isId === "0" ? null : quote);
      isId == 1 && refetchQuote()
      setOnFetchingItem(isId === '0' && true)
      setOnFetchingItemsAll(isId === '1' && true)

      // setDataItems([])
      setTotalTax('')
      setTotalDiscount('')
      setOption([])
    }
    if (status == 'quote') {
      // setQuote(isId);
      setOption([])
      setOnFetchingItemsAll(true)
      setOnFetchingItem(true)
    }
    handleQueryId({ status: false })
  }

  // onChange
  const handleOnChangeInput = (type, value) => {
    if (type === 'codeProduct') {
      setCodeProduct(value.target.value)
    } else if (type === 'customer') {
      if (option?.length >= 1) {
        handleQueryId({ status: true, id: value, idChild: type })
      } else {
        setCustomer(value)
        setContactPerson(null)
        // setQuote(null);
      }
    } else if (type === 'branch') {
      if (option?.length >= 1) {
        handleQueryId({ status: true, id: value, idChild: type })
      } else if (value !== selectedBranch) {
        setBranch(value)
        setCustomer(null)
        setContactPerson(null)
        setStaff(null)
        // setQuote(null);
        setOption([])
      }
    } else if (type === 'contactPerson') {
      setContactPerson(value)
    } else if (type === 'staff') {
      setStaff(value)
    } else if (type === 'typeOrder') {
      handleQueryId({ status: true, idChild: type, id: value.target.value })
    } else if (type === 'quote') {
      if (option?.length >= 1) {
        handleQueryId({ status: true, idChild: type, id: value })
      } else {
        // setQuote(value);
        setOnFetchingItem(true)
      }
    } else if (type === 'note') {
      setNote(value.target.value)
    } else if (type === 'total_tax') {
      setTotalTax(value)
    } else if (type === 'total_delivery_date') {
      setDeliveryDate(value)
    } else if (type === 'totaldiscount') {
      setTotalDiscount(value?.value)
    } else if (type == 'itemAll') {
      setItemsAll(value)
      if (value?.length === 0) {
        //new
        setOption([])
      } else if (value?.length > 0) {
        if (typeOrder === '0') {
          const newData = value?.map((e, index) => {
            const check = option?.find((x) => x?.item?.e?.id == e?.e?.id)
            if (check) {
              return check
            }

            let money = 0
            if (e.e?.tax?.tax_rate == undefined) {
              money = Number(1) * (1 + Number(0) / 100) * Number(e?.e?.quantity)
            } else {
              money = Number(e?.e?.affterDiscount) * (1 + Number(e?.e?.tax?.tax_rate) / 100) * Number(e?.e?.quantity)
            }

            return {
              id: uuidv4(),
              item: {
                e: e?.e,
                label: e?.label,
                value: e?.value,
              },
              unit: e?.e?.unit_name,
              quantity: 1,
              sortIndex: index,
              price: e?.e?.price_sell,
              discount: 0,
              price_after_discount: 1,
              tax: 0,
              price_after_tax: 1,
              total_amount: Number(money.toFixed(2)),
              note: '',
              delivery_date: deliveryDate || null,
            }
          })
          setOption([...newData])
        }
        if (typeOrder === '1' && quote !== null) {
          const newData = value
            ?.map((e, index) => {
              return {
                id: uuidv4(),
                item: {
                  e: e?.e,
                  label: e?.label,
                  value: e?.value,
                },
                unit: e?.e?.unit_name,
                quantity: e?.e?.quantity,
                sortIndex: index,
                price: e?.e?.price_sell,
                discount: e?.e?.discount_percent,
                price_after_discount: +e?.e?.price_sell * (1 - +e?.e?.discount_percent / 100),
                tax: {
                  label: e?.e?.tax_name,
                  value: e?.e?.tax_id,
                  tax_rate: e?.e?.tax_rate,
                },
                price_after_tax:
                  +e?.e?.price_sell * e?.e?.quantity * (1 - +e?.e?.discount_percent / 100) * (1 + e?.e?.tax_rate / 100),
                total_amount:
                  +e?.e?.price_sell *
                  (1 - +e?.e?.discount_percent / 100) *
                  (1 + +e?.e?.tax_rate / 100) *
                  +e?.e?.quantity,
                note: e?.e?.note_item,
                delivery_date: deliveryDate || null,
              }
            })
            .sort((a, b) => b.sortIndex - a.sortIndex)

          setOption([...newData])
        } else if (typeOrder === '1' && quote === null) {
          isShow('error', `${dataLang?.N_quote_selection_required}`)
        }
      }
    }
  }

  const handleOnChangeInputOption = (id, type, value) => {
    var index = option.findIndex((x) => x.id === id)

    if (type == 'unit') {
      option[index].unit = value.target?.value
    } else if (type === 'quantity') {
      option[index].quantity = Number(value?.value)
      if (option[index].tax?.tax_rate == undefined) {
        const tien = Number(option[index].price_after_discount) * (1 + Number(0) / 100) * Number(option[index].quantity)
        option[index].total_amount = Number(tien.toFixed(2))
      } else {
        const tien =
          Number(option[index].price_after_discount) *
          (1 + Number(option[index].tax?.tax_rate) / 100) *
          Number(option[index].quantity)
        option[index].total_amount = Number(tien.toFixed(2))
      }
      setOption([...option])
    } else if (type == 'price') {
      option[index].price = Number(value.value)
      option[index].price_after_discount = +option[index].price * (1 - option[index].discount / 100)
      option[index].price_after_discount = +(Math.round(option[index].price_after_discount + 'e+2') + 'e-2')
      if (option[index].tax?.tax_rate == undefined) {
        const tien = Number(option[index].price_after_discount) * (1 + Number(0) / 100) * Number(option[index].quantity)
        option[index].total_amount = Number(tien.toFixed(2))
      } else {
        const tien =
          Number(option[index].price_after_discount) *
          (1 + Number(option[index].tax?.tax_rate) / 100) *
          Number(option[index].quantity)
        option[index].total_amount = Number(tien.toFixed(2))
      }
    } else if (type == 'discount') {
      option[index].discount = Number(value.value)
      option[index].price_after_discount = +option[index].price * (1 - option[index].discount / 100)
      option[index].price_after_discount = +(Math.round(option[index].price_after_discount + 'e+2') + 'e-2')
      if (option[index].tax?.tax_rate == undefined) {
        const tien = Number(option[index].price_after_discount) * (1 + Number(0) / 100) * Number(option[index].quantity)
        option[index].total_amount = Number(tien.toFixed(2))
      } else {
        const tien =
          Number(option[index].price_after_discount) *
          (1 + Number(option[index].tax?.tax_rate) / 100) *
          Number(option[index].quantity)
        option[index].total_amount = Number(tien.toFixed(2))
      }
    } else if (type == 'tax') {
      option[index].tax = value
      if (option[index].tax?.tax_rate == undefined) {
        const tien = Number(option[index].price_after_discount) * (1 + Number(0) / 100) * Number(option[index].quantity)
        option[index].total_amount = Number(tien.toFixed(2))
      } else {
        const tien =
          Number(option[index].price_after_discount) *
          (1 + Number(option[index].tax?.tax_rate) / 100) *
          Number(option[index].quantity)
        option[index].total_amount = Number(tien.toFixed(2))
      }
    } else if (type == 'note') {
      option[index].note = value?.target?.value
    } else if (type == 'delivery_date') {
      option[index].delivery_date = value
    } else if (type == 'clear_delivery_date') {
      option[index].delivery_date = null
      setDeliveryDate(null)
    } else if (type == 'clearDeliveryDate') {
      setDeliveryDate(null)
      // option[index].delivery_date = null
    }

    setOption([...option])
  }

  const handleIncrease = (id) => {
    const index = option.findIndex((x) => x.id === id)
    const newQuantity = +option[index].quantity + 1

    option[index].quantity = newQuantity
    if (option[index].tax?.tax_rate == undefined) {
      const tien = Number(option[index].price_after_discount) * (1 + Number(0) / 100) * Number(option[index].quantity)
      option[index].total_amount = Number(tien.toFixed(2))
    } else {
      const tien =
        Number(option[index].price_after_discount) *
        (1 + Number(option[index].tax?.tax_rate) / 100) *
        Number(option[index].quantity)
      option[index].total_amount = Number(tien.toFixed(2))
    }
    setOption([...option])
  }

  const handleDecrease = (id) => {
    const index = option.findIndex((x) => x.id === id)
    const newQuantity = Number(option[index].quantity) - 1
    // chỉ giảm số lượng khi nó lớn hơn hoặc bằng 1
    if (newQuantity >= 1) {
      option[index].quantity = Number(newQuantity)
      if (option[index].tax?.tax_rate == undefined) {
        const tien = Number(option[index].price_after_discount) * (1 + Number(0) / 100) * Number(option[index].quantity)
        option[index].total_amount = Number(tien.toFixed(2))
      } else {
        const tien =
          Number(option[index].price_after_discount) *
          (1 + Number(option[index].tax?.tax_rate) / 100) *
          Number(option[index].quantity)
        option[index].total_amount = Number(tien.toFixed(2))
      }
      setOption([...option])
    }
  }

  const _HandleDelete = (id, type) => {
    if (type === 'default') {
      return isShow('error', `${'Mặc định của hệ thống, không thể xóa'}`)
    }
    const newOption = option.filter((x) => x.id !== id) // loại bỏ phần tử cần xóa
    setOption(newOption) // cập nhật lại mảng
  }

  const taxOptions = [{ label: 'Miễn thuế', value: '0', tax_rate: '0' }, ...dataTasxes]

  const totalMoney = (option) => {
    const totalPrice = option.reduce((acc, item) => {
      const totalPrice = item?.price * item?.quantity
      return acc + totalPrice
    }, 0)

    const totalDiscountPrice = option.reduce((acc, item) => {
      const totalDiscountPrice = item?.price * (item?.discount / 100) * item?.quantity
      return acc + totalDiscountPrice
    }, 0)

    const totalDiscountAfterPrice = option.reduce((acc, item) => {
      const tienSauCK = item?.quantity * item?.price_after_discount
      return acc + tienSauCK
    }, 0)

    const totalTax = option.reduce((acc, item) => {
      const totalTaxIem =
        item?.price_after_discount * (isNaN(item?.tax?.tax_rate) ? 0 : item?.tax?.tax_rate / 100) * item?.quantity
      return acc + totalTaxIem
    }, 0)

    const totalAmount = option.reduce((acc, item) => {
      const totalAmount = item?.total_amount
      return acc + totalAmount
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
    const totalPrice = totalMoney(option)
    setIsTotalMoney(totalPrice)
  }, [option])

  const dataOption = option?.map((e) => {
    return {
      item: e?.item?.value,
      quantity: Number(e?.quantity),
      price: e?.price,
      discount_percent: e?.discount,
      tax_id: e?.tax?.value,
      price_quote_item_id: e?.item?.e?.price_quote_item_id,
      note: e?.note,
      id: e?.id,
      delivery_date: e?.delivery_date,
      price_quote_order_item_id: e?.price_quote_order_item_id,
    }
  })

  let newDataOption = dataOption?.filter((e) => e?.item !== undefined)

  // Validate submit
  const handleSubmitValidate = (e) => {
    e.preventDefault()

    let deliveryDateInOption = option.some((e) => e?.delivery_date === null)

    let checkQuantity = option.some((e) => e?.quantity <= 0)

    if (checkQuantity) {
      isShow('error', `${dataLang?.required_field_null}`)
      return
    }

    if (selectedBranch === null || selectedStaff === null) {
      setShowMoreInfo(true)
    }

    if (typeOrder === '0') {
      if (
        startDate == null ||
        selectedCustomer == null ||
        selectedBranch == null ||
        selectedStaff == null ||
        deliveryDateInOption === true
      ) {
        startDate == null && setErrDate(true)
        selectedCustomer == null && sErrCustomer(true)
        selectedBranch == null && setErrBranch(true)
        selectedStaff == null && setErrStaff(true)
        deliveryDateInOption === true && setErrDeliveryDate(true)
        // deliveryDate == null && setErrDeliveryDate(true)
        isShow('error', `${dataLang?.required_field_null}`)
      } else {
        setOnSending(true)
      }
    } else if (typeOrder === '1') {
      if (
        startDate == null ||
        selectedCustomer == null ||
        selectedBranch == null ||
        selectedStaff == null ||
        deliveryDateInOption === true ||
        quote == null
      ) {
        startDate == null && setErrDate(true)
        selectedCustomer == null && sErrCustomer(true)
        selectedBranch == null && setErrBranch(true)
        selectedStaff == null && setErrStaff(true)
        deliveryDateInOption === true && setErrDeliveryDate(true)
        quote?.value == null && setErrQuote(true)
        // deliveryDate == null && setErrDeliveryDate(true)

        isShow('error', `${dataLang?.required_field_null}`)
      } else {
        setOnSending(true)
      }
    }
  }

  // handle submit
  const handleSubmit = async () => {
    let formData = new FormData()
    formData.append('code', codeProduct)
    formData.append('date', formatMoment(startDate, FORMAT_MOMENT.DATE_TIME_LONG))
    formData.append('branch_id', selectedBranch ? selectedBranch : '')
    formData.append('client_id', selectedCustomer ? selectedCustomer : '')
    formData.append('person_contact_id', selectedPersonalContact ? selectedPersonalContact : '')
    formData.append('staff_id', selectedStaff ? selectedStaff : '')
    formData.append('note', note ? note : '')
    formData.append('quote_id', typeOrder === '1' ? quote?.value : '')
    newDataOption.forEach((item, index) => {
      formData.append(`items[${index}][item]`, item?.item != undefined ? item?.item : '')
      formData.append(
        `items[${index}][id]`,
        item?.price_quote_order_item_id != undefined ? item?.price_quote_order_item_id : ''
      )
      formData.append(`items[${index}][quantity]`, item?.quantity.toString())
      formData.append(`items[${index}][price]`, item?.price)
      formData.append(`items[${index}][discount_percent]`, item?.discount_percent)
      formData.append(`items[${index}][tax_id]`, item?.tax_id != undefined ? item?.tax_id : '')
      formData.append(`items[${index}][note]`, item?.note != undefined ? item?.note : '')
      formData.append(
        `items[${index}][delivery_date]`,
        item?.delivery_date != undefined ? formatMoment(item?.delivery_date, FORMAT_MOMENT.DATE_TIME_LONG) : ''
      )
    })

    if (
      isTotalMoney?.totalPrice > 0 &&
      isTotalMoney?.totalDiscountPrice >= 0 &&
      isTotalMoney?.totalDiscountAfterPrice > 0 &&
      isTotalMoney?.totalTax >= 0 &&
      isTotalMoney?.totalAmount > 0
    ) {
      try {
        const { isSuccess, message } = await apiSalesOrder.apiHandingSalesOrder(id, formData)
        if (isSuccess) {
          isShow('success', `${dataLang[message]}` || message)
          setCodeProduct('')
          setStartDate(dayjs())
          setDeliveryDate(dayjs())
          setContactPerson(null)
          setStaff(null)
          setCustomer(null)
          setBranch(null)
          setErrQuote(null)
          setNote('')
          setErrBranch(false)
          setErrDate(false)
          setErrDeliveryDate(false)
          sErrCustomer(false)
          setErrStaff(false)
          setErrQuote(false)
          setOption([])
          router.push(routerSalesOrder.home)
        } else {
          isShow('error', `${dataLang[message]}` || message)
        }
        setOnSending(false)
      } catch (error) {}
    } else {
      isShow(
        'error',
        newDataOption?.length === 0
          ? `Chưa chọn thông tin mặt hàng!`
          : 'Tiền không được âm, vui lòng kiểm tra lại thông tin mặt hàng!'
      )
      setOnSending(false)
    }
  }

  useEffect(() => {
    onSending && handleSubmit()
  }, [onSending])

  // breadcrumb
  const breadcrumbItems = [
    {
      label: `${dataLang?.returnSales_title || 'returnSales_title'}`,
    },
    {
      label: `${dataLang?.sales_product_list || 'sales_product_list'}`,
      href: routerSalesOrder.home,
    },
    {
      label: `${
        id
          ? dataLang?.sales_product_edit_order || 'sales_product_edit_order'
          : dataLang?.sales_product_add_order || 'sales_product_add_order'
      }`,
    },
  ]

  const options = dataItems?.map((e) => {
    return {
      label: `${e.name} <span style={{display: none}}>${e.code}</span><span style={{display: none}}>${e.product_variation} </span><span style={{display: none}}>${e.text_type} ${e.unit_name} </span>`,
      value: e.id,
      e,
    }
  })

  const selectItemsLabel = (option) => (
    <div className="flex p-2 hover:bg-gray-100 rounded-md cursor-pointer items-center justify-between font-deca">
      <div className="flex gap-3 items-start w-[calc(100%-80px)]">
        <img
          src={option.e?.images ?? '/icon/noimagelogo.png'}
          alt={option.e?.name}
          className="xl:size-16 size-12 object-cover rounded-md"
        />
        <div className="flex flex-col 3xl:text-[10px] text-[9px] overflow-hidden w-full">
          <div className="font-semibold responsive-text-sm truncate text-black">{option.e?.name}</div>
          {(option.e?.product_variation || option.e?.product_variation_1) && (
            <div className="text-blue-600 truncate">
              {option.e?.product_variation && `Màu sắc: ${option.e?.product_variation} `}
              {option.e?.product_variation_1 && `- Size: ${option.e?.product_variation_1}`}
            </div>
          )}
          <div className="text-gray-500">
            ĐVT: {option.e?.unit_name} - Tồn: {formatNumber(option.e?.qty_warehouse)}
          </div>
        </div>
      </div>
      <div className="text-red-500 responsive-text-sm min-w-[80px] text-right whitespace-nowrap">
        {formatNumber(option.e?.price_sell || option.e?.price)} đ
      </div>
    </div>
  )


  // const router = useRouter()

  // const isShow = useToast()

  // const dataSeting = useSetingServer()

  // const id = router.query?.id

  // const dataLang = props?.dataLang

  // const { isOpen, isId, isIdChild: status, handleQueryId } = useToggle()

  // const [onFetchingItemsAll, setOnFetchingItemsAll] = useState(false)

  // const [onFetchingItem, setOnFetchingItem] = useState(false)

  // const [onSending, setOnSending] = useState(false)

  // const [option, setOption] = useState([])

  // const [dataItems, setDataItems] = useState([])

  // const [note, setNote] = useState('')

  // const [codeProduct, setCodeProduct] = useState('')

  // const [totalTax, setTotalTax] = useState()

  // const [totalDiscount, setTotalDiscount] = useState(0)

  // const [startDate, setStartDate] = useState(new Date())

  // const [deliveryDate, setDeliveryDate] = useState(null)

  // const [customer, setCustomer] = useState(null)

  // const [contactPerson, setContactPerson] = useState(null)

  // const [staff, setStaff] = useState(null)

  // const [quote, setQuote] = useState(null)

  // const [branch, setBranch] = useState(null)

  // const [errDate, setErrDate] = useState(false)

  // const [errCustomer, sErrCustomer] = useState(false)

  // const [errStaff, setErrStaff] = useState(false)

  // const [errQuote, setErrQuote] = useState(false)

  // const [errDeliveryDate, setErrDeliveryDate] = useState(false)

  // const [errBranch, setErrBranch] = useState(false)

  // const [typeOrder, setTypeOrder] = useState('0')

  // const [itemsAll, setItemsAll] = useState([])

  // const [isTotalMoney, setIsTotalMoney] = useState({
  //   totalPrice: 0,
  //   totalDiscountPrice: 0,
  //   totalDiscountAfterPrice: 0,
  //   totalTax: 0,
  //   totalAmount: 0,
  // })

  // const params = {
  //   'filter[branch_id]': branch !== null ? +branch?.value : null,
  //   'filter[client_id]': customer !== null ? +customer?.value : null,
  // }

  // const { data: dataTasxes = [] } = useTaxList()

  // const { data: dataBranch = [] } = useBranchList()

  // const { data: dataQuotes, refetch: refetchQuote } = useSalesOrderQuotaByBranch(params)

  // const { data: dataPersonContact = [] } = useContactCombobox({
  //   client_id: customer != null ? customer.value : null,
  // })

  // const { data: dataStaffs = [] } = useStaffComboboxByBranch({
  //   branch_id: branch != null ? [+branch?.value]?.map((e) => e) : null,
  // })

  // const { data: dataCustomer = [] } = useClientComboboxByBranch({
  //   search: searchClient,
  //   branch_id: selectedBranch !== null ? [selectedBranch]?.map((e) => e) : null,
  // })

  // onChange
  // const handleOnChangeInput = (type, value) => {
  //   if (type === 'codeProduct') {
  //     setCodeProduct(value.target.value)
  //   } else if (type === 'customer') {
  //     if (option?.length >= 1) {
  //       handleQueryId({ status: true, id: value, idChild: type })
  //     } else {
  //       setCustomer(value)
  //       setContactPerson(null)
  //       // setQuote(null);
  //     }
  //   } else if (type === 'branch') {
  //     if (option?.length >= 1) {
  //       handleQueryId({ status: true, id: value, idChild: type })
  //     } else if (value !== selectedBranch) {
  //       setBranch(value)
  //       setCustomer(null)
  //       setContactPerson(null)
  //       setStaff(null)
  //       // setQuote(null);
  //       setOption([])
  //     }
  //   } else if (type === 'contactPerson') {
  //     setContactPerson(value)
  //   } else if (type === 'staff') {
  //     setStaff(value)
  //   } else if (type === 'typeOrder') {
  //     handleQueryId({ status: true, idChild: type, id: value.target.value })
  //   } else if (type === 'quote') {
  //     if (option?.length >= 1) {
  //       handleQueryId({ status: true, idChild: type, id: value })
  //     } else {
  //       // setQuote(value);
  //       setOnFetchingItem(true)
  //     }
  //   } else if (type === 'note') {
  //     setNote(value.target.value)
  //   } else if (type === 'total_tax') {
  //     setTotalTax(value)
  //   } else if (type === 'total_delivery_date') {
  //     setDeliveryDate(value)
  //   } else if (type === 'totaldiscount') {
  //     setTotalDiscount(value?.value)
  //   } else if (type == 'itemAll') {
  //     setItemsAll(value)
  //     if (value?.length === 0) {
  //       //new
  //       setOption([])
  //     } else if (value?.length > 0) {
  //       if (typeOrder === '0') {
  //         const newData = value?.map((e, index) => {
  //           const check = option?.find((x) => x?.item?.e?.id == e?.e?.id)
  //           if (check) {
  //             return check
  //           }

  //           let money = 0
  //           if (e.e?.tax?.tax_rate == undefined) {
  //             money = Number(1) * (1 + Number(0) / 100) * Number(e?.e?.quantity)
  //           } else {
  //             money = Number(e?.e?.affterDiscount) * (1 + Number(e?.e?.tax?.tax_rate) / 100) * Number(e?.e?.quantity)
  //           }

  //           return {
  //             id: uuidv4(),
  //             item: {
  //               e: e?.e,
  //               label: e?.label,
  //               value: e?.value,
  //             },
  //             unit: e?.e?.unit_name,
  //             quantity: 1,
  //             sortIndex: index,
  //             price: e?.e?.price_sell,
  //             discount: 0,
  //             price_after_discount: 1,
  //             tax: 0,
  //             price_after_tax: 1,
  //             total_amount: Number(money.toFixed(2)),
  //             note: '',
  //             delivery_date: deliveryDate || null,
  //           }
  //         })
  //         setOption([...newData])
  //       }
  //       if (typeOrder === '1' && quote !== null) {
  //         const newData = value
  //           ?.map((e, index) => {
  //             return {
  //               id: uuidv4(),
  //               item: {
  //                 e: e?.e,
  //                 label: e?.label,
  //                 value: e?.value,
  //               },
  //               unit: e?.e?.unit_name,
  //               quantity: e?.e?.quantity,
  //               sortIndex: index,
  //               price: e?.e?.price_sell,
  //               discount: e?.e?.discount_percent,
  //               price_after_discount: +e?.e?.price_sell * (1 - +e?.e?.discount_percent / 100),
  //               tax: {
  //                 label: e?.e?.tax_name,
  //                 value: e?.e?.tax_id,
  //                 tax_rate: e?.e?.tax_rate,
  //               },
  //               price_after_tax:
  //                 +e?.e?.price_sell * e?.e?.quantity * (1 - +e?.e?.discount_percent / 100) * (1 + e?.e?.tax_rate / 100),
  //               total_amount:
  //                 +e?.e?.price_sell *
  //                 (1 - +e?.e?.discount_percent / 100) *
  //                 (1 + +e?.e?.tax_rate / 100) *
  //                 +e?.e?.quantity,
  //               note: e?.e?.note_item,
  //               delivery_date: deliveryDate || null,
  //             }
  //           })
  //           .sort((a, b) => b.sortIndex - a.sortIndex)

  //         setOption([...newData])
  //       } else if (typeOrder === '1' && quote === null) {
  //         isShow('error', `${dataLang?.N_quote_selection_required}`)
  //       }
  //     }
  //   }
  // }

  // // Validate submit
  // const handleSubmitValidate = (e) => {
  //   e.preventDefault()

  //   let deliveryDateInOption = option.some((e) => e?.delivery_date === null)

  //   let checkQuantity = option.some((e) => e?.quantity <= 0)

  //   if (checkQuantity) {
  //     isShow('error', `${dataLang?.required_field_null}`)
  //     return
  //   }

  //   if (selectedBranch === null || selectedStaff === null) {
  //     setShowMoreInfo(true)
  //   }

  //   if (typeOrder === '0') {
  //     if (
  //       startDate == null ||
  //       selectedCustomer == null ||
  //       selectedBranch == null ||
  //       selectedStaff == null ||
  //       deliveryDateInOption === true
  //     ) {
  //       startDate == null && setErrDate(true)
  //       selectedCustomer == null && sErrCustomer(true)
  //       selectedBranch == null && setErrBranch(true)
  //       selectedStaff == null && setErrStaff(true)
  //       deliveryDateInOption === true && setErrDeliveryDate(true)
  //       // deliveryDate == null && setErrDeliveryDate(true)
  //       isShow('error', `${dataLang?.required_field_null}`)
  //     } else {
  //       setOnSending(true)
  //     }
  //   } else if (typeOrder === '1') {
  //     if (
  //       startDate == null ||
  //       selectedCustomer == null ||
  //       selectedBranch == null ||
  //       selectedStaff == null ||
  //       deliveryDateInOption === true ||
  //       quote == null
  //     ) {
  //       startDate == null && setErrDate(true)
  //       selectedCustomer == null && sErrCustomer(true)
  //       selectedBranch == null && setErrBranch(true)
  //       selectedStaff == null && setErrStaff(true)
  //       deliveryDateInOption === true && setErrDeliveryDate(true)
  //       quote?.value == null && setErrQuote(true)
  //       // deliveryDate == null && setErrDeliveryDate(true)

  //       isShow('error', `${dataLang?.required_field_null}`)
  //     } else {
  //       setOnSending(true)
  //     }
  //   }
  // }

  // const selectItemsLabel = (option) => (
  //   <div className="flex p-2 rounded-md cursor-pointer items-center justify-between font-deca">
  //     <div className="flex gap-3 items-start w-[calc(100%-80px)]">
  //       <img
  //         src={option.e?.images ?? '/icon/noimagelogo.png'}
  //         alt={option.e?.name}
  //         className="xl:size-16 size-12 object-cover rounded-md"
  //       />
  //       <div className="flex flex-col 3xl:text-[10px] text-[9px] overflow-hidden w-full">
  //         <div className="font-semibold responsive-text-sm truncate text-black">{option.e?.name}</div>
  //         {(option.e?.product_variation || option.e?.product_variation_1) && (
  //           <div className="text-blue-600 truncate">
  //             {option.e?.product_variation && `Màu sắc: ${option.e?.product_variation} `}
  //             {option.e?.product_variation_1 && `- Size: ${option.e?.product_variation_1}`}
  //           </div>
  //         )}
  //         <div className="text-gray-500">
  //           ĐVT: {option.e?.unit_name} - Tồn: {formatNumber(option.e?.qty_warehouse)}
  //         </div>
  //       </div>
  //     </div>
  //     <div className="text-red-500 responsive-text-sm min-w-[80px] text-right whitespace-nowrap">
  //       {formatNumber(option.e?.price_sell || option.e?.price)} đ
  //     </div>
  //   </div>
  // )

  // useEffect(() => {
  //   onSending && handleSubmit()
  // }, [onSending])

  // useEffect(() => {
  //   router.query && setErrDate(false)
  //   router.query && sErrCustomer(false)
  //   router.query && setErrStaff(false)
  //   router.query && setErrDeliveryDate(false)
  //   router.query && setErrBranch(false)
  //   router.query && setStartDate(dayjs())
  //   router.query && setDeliveryDate(null)
  //   router.query && setNote('')
  // }, [id, router.query])

  // // Fetch edit
  // useQuery({
  //   queryKey: ['api_detail_sale_order', id],
  //   queryFn: async () => {
  //     const rResult = await apiSalesOrder.apiDetail(id)
  //     const items = rResult?.items?.map((e) => ({
  //       price_quote_order_item_id: e?.id,
  //       id: e.id,
  //       item: {
  //         e: e?.item,
  //         label: `${e.item?.item_name} <span style={{display: none}}>${
  //           e.item?.code + e.item?.product_variation + e.item?.text_type + e.item?.unit_name
  //         }</span>`,
  //         value: e.item?.id,
  //       },
  //       quantity: +e?.quantity,
  //       price: +e?.price,
  //       discount: +e?.discount_percent,
  //       tax: { tax_rate: e?.tax_rate, value: e?.tax_id },
  //       unit: e.item?.unit_name,
  //       price_after_discount: +e?.price_after_discount,
  //       note: e?.note,
  //       total_amount: +e?.price_after_discount * (1 + +e?.tax_rate / 100) * +e?.quantity,
  //       delivery_date: moment(e?.delivery_date).toDate(),
  //     }))

  //     setItemsAll(
  //       rResult?.items?.map((e) => ({
  //         label: `${e.item?.item_name} <span style={{display: none}}>${e.item?.code}</span><span style={{display: none}}>${e.item?.product_variation} </span><span style={{display: none}}>${e.item?.text_type} ${e.item?.unit_name} </span>`,
  //         value: e.item?.id,
  //         e: e.item,
  //       }))
  //     )
  //     setOption(items)
  //     setCodeProduct(rResult?.code)

  //     setContactPerson(
  //       rResult?.contact_name !== null && rResult?.contact_name !== '0'
  //         ? { label: rResult?.contact_name, value: rResult?.contact_id }
  //         : null
  //     )
  //     setSelectedPersonalContact(
  //       rResult?.contact_id !== null && rResult?.contact_id !== '0' ? rResult?.contact_id : null
  //     )

  //     setBranch({ label: rResult?.branch_name, value: rResult?.branch_id })
  //     setSelectedBranch(rResult?.branch_id)

  //     setStaff({ label: rResult?.staff_name, value: rResult?.staff_id })
  //     setSelectedStaff(rResult?.staff_id)

  //     setCustomer({ label: rResult?.client_name, value: rResult?.client_id })
  //     setSelectedCustomer(rResult?.client_id)

  //     setStartDate(moment(rResult?.date).toDate())
  //     setDeliveryDate(moment(rResult?.items[0]?.delivery_date).toDate())

  //     setNote(rResult?.note)

  //     if (rResult?.quote_id !== '0' && rResult?.quote_code !== null) {
  //       setTypeOrder('1')
  //       // setHidden(true);
  //       // setQuote({ label: rResult?.quote_code, value: rResult?.quote_id, });
  //     }
  //     return rResult
  //   },
  //   ...optionsQuery,
  //   enabled: !!id,
  // })

  // // Set hàng loại % Thuế
  // useEffect(() => {
  //   if (totalTax == null) return
  //   setOption((prevOption) => {
  //     const newOption = [...prevOption]
  //     const thueValue = totalTax?.tax_rate || 0
  //     const chietKhauValue = totalDiscount || 0
  //     newOption.forEach((item) => {
  //       const dongiasauchietkhau = item?.price * (1 - chietKhauValue / 100)
  //       const thanhTien = dongiasauchietkhau * (1 + thueValue / 100) * item.quantity
  //       item.tax = totalTax
  //       item.total_amount = isNaN(thanhTien) ? 0 : thanhTien
  //     })
  //     return newOption
  //   })
  // }, [totalTax])

  // useEffect(() => {
  //   if (deliveryDate == null) return
  //   setOption((prevOption) => {
  //     const newOption = [...prevOption]

  //     newOption.forEach((item) => {
  //       item.delivery_date = deliveryDate || null
  //     })
  //     return newOption
  //   })
  // }, [deliveryDate])

  // // Set hàng loạt % Chiết khẩu
  // useEffect(() => {
  //   if (totalDiscount == null) return
  //   setOption((prevOption) => {
  //     const newOption = [...prevOption]
  //     const thueValue = totalTax?.tax_rate != undefined ? totalTax?.tax_rate : 0
  //     const chietKhauValue = totalDiscount ? totalDiscount : 0

  //     newOption.forEach((item) => {
  //       const dongiasauchietkhau = item?.price * (1 - chietKhauValue / 100)
  //       const thanhTien = dongiasauchietkhau * (1 + thueValue / 100) * item.quantity
  //       // item.tax = totalTax
  //       item.discount = Number(totalDiscount)
  //       item.price_after_discount = isNaN(dongiasauchietkhau) ? 0 : dongiasauchietkhau
  //       item.total_amount = isNaN(thanhTien) ? 0 : thanhTien
  //     })
  //     return newOption
  //   })
  // }, [totalDiscount])

  // useEffect(() => {
  //   setCustomer(null) || setContactPerson(null) || setStaff(null)
  // }, [])

  // useEffect(() => {
  //   selectedBranch !== null && setOnFetchingItemsAll(true)
  //   selectedBranch == null && setItemsAll([])
  // }, [selectedBranch])

  // useEffect(() => {
  //   quote !== null && setOnFetchingItem(true)
  // }, [quote])

  // // useEffect(() => {
  // //   onFetchingItemsAll && handleFetchingItemsAll()
  // // }, [onFetchingItemsAll])

  // useEffect(() => {
  //   onFetchingItem && handleFetchingItem()
  // }, [onFetchingItem])

  // // Validate state
  // useEffect(() => {
  //   setErrDate(false)
  // }, [startDate != null])

  // useEffect(() => {
  //   sErrCustomer(false)
  // }, [selectedCustomer != null])

  // useEffect(() => {
  //   setErrDeliveryDate(false)
  // }, [deliveryDate != null])

  // useEffect(() => {
  //   setErrBranch(false)
  // }, [selectedBranch != null])

  // useEffect(() => {
  //   setErrStaff(false)
  // }, [selectedStaff != null])

  // // const { data: dataCustomer = [] } = useClientComboboxByBranch({ search: "", branch_id: branch !== null ? [branch?.value]?.map((e) => e) : null, });

  // useEffect(() => {
  //   router.query && setErrDate(false)
  //   router.query && sErrCustomer(false)
  //   router.query && setErrStaff(false)
  //   router.query && setErrDeliveryDate(false)
  //   router.query && setErrBranch(false)
  //   router.query && setStartDate(new Date())
  //   router.query && setDeliveryDate(null)
  //   router.query && setNote('')
  // }, [id, router.query])

  // // Gán chi nhánh đầu tiên vào state selectedBranch khi render
  // useEffect(() => {
  //   if (dataBranch.length > 0 && dataBranch[0]?.value) {
  //     if (authState.branch?.length > 0 && !selectedBranch) {
  //       const firstBranch = authState.branch[0].id
  //       setSelectedBranch(firstBranch)
  //       setBranch({ label: authState.branch[0].name, value: firstBranch })
  //     }
  //   }
  // }, [dataBranch, authState.branch])

  // // Gán nhân viên theo staff_id từ authState lọc từ mảng dataStaffs
  // useEffect(() => {
  //   if (dataStaffs.length > 0 && authState?.staff_id) {
  //     const staff = dataStaffs.find((e) => e.value === authState?.staff_id)

  //     setSelectedStaff(staff?.value)
  //   }
  // }, [dataStaffs, authState?.staff_id])

  // // Reset state của ô "khách hàng, nhân viên, người liên lạc" khi ô "chi nhánh" thay đổi, để đổ dữ liệu mới (khi có)
  // useEffect(() => {
  //   if (selectedBranch === undefined) {
  //     setFlagStateChange(true)
  //   } else {
  //     setFlagStateChange(false)
  //   }
  //   setSelectedCustomer(null)
  //   setSelectedStaff(null)
  //   setSelectedPersonalContact(null)
  // }, [selectedBranch])

  // // Reset state của ô "người liên lạc" khi ô "khách hàng" thay đổi, để đổ dữ liệu mới (khi có)
  // useEffect(() => {
  //   setSelectedPersonalContact(null)
  // }, [selectedCustomer])

  // // Fetch edit
  // useQuery({
  //   queryKey: ['api_detail_sale_order', id],
  //   queryFn: async () => {
  //     const rResult = await apiSalesOrder.apiDetail(id)
  //     const items = rResult?.items?.map((e) => ({
  //       price_quote_order_item_id: e?.id,
  //       id: e.id,
  //       item: {
  //         e: e?.item,
  //         label: `${e.item?.item_name} <span style={{display: none}}>${
  //           e.item?.code + e.item?.product_variation + e.item?.text_type + e.item?.unit_name
  //         }</span>`,
  //         value: e.item?.id,
  //       },
  //       quantity: +e?.quantity,
  //       price: +e?.price,
  //       discount: +e?.discount_percent,
  //       tax: { tax_rate: e?.tax_rate, value: e?.tax_id },
  //       unit: e.item?.unit_name,
  //       price_after_discount: +e?.price_after_discount,
  //       note: e?.note,
  //       total_amount: +e?.price_after_discount * (1 + +e?.tax_rate / 100) * +e?.quantity,
  //       delivery_date: moment(e?.delivery_date).toDate(),
  //     }))

  //     setOption(items)
  //     setCodeProduct(rResult?.code)
  //     setContactPerson(
  //       rResult?.contact_name !== null && rResult?.contact_name !== '0'
  //         ? { label: rResult?.contact_name, value: rResult?.contact_id }
  //         : null
  //     )
  //     setBranch({ label: rResult?.branch_name, value: rResult?.branch_id })
  //     setStaff({ label: rResult?.staff_name, value: rResult?.staff_id })
  //     setCustomer({ label: rResult?.client_name, value: rResult?.client_id })
  //     setStartDate(moment(rResult?.date).toDate())
  //     setNote(rResult?.note)

  //     if (rResult?.quote_id !== '0' && rResult?.quote_code !== null) {
  //       setTypeOrder('1')
  //       // setHidden(true);
  //       // setQuote({ label: rResult?.quote_code, value: rResult?.quote_id, });
  //     }
  //     return rResult
  //   },
  //   ...optionsQuery,
  //   enabled: !!id,
  // })

  // // fetch items
  // const handleFetchingItemsAll = async () => {
  //   let form = new FormData()

  //   if (branch != null) {
  //     ;[+branch?.value].forEach((e, index) => form.append(`branch_id[${index}]`, e))
  //     option.forEach((item, idx) => {
  //       form.append(`items_id_selected[${idx}]`, item?.item?.value ?? '')
  //     })
  //   }
  //   try {
  //     const {
  //       data: { result },
  //     } = await apiSalesOrder.apiItems(form)

  //     setDataItems(result)

  //     setOnFetchingItemsAll(false)
  //   } catch (error) {}
  // }

  // const handleFetchingItem = async () => {
  //   let form = new FormData()
  //   if (branch && branch != null) {
  //     [+branch?.value].forEach((e, index) => form.append(`branch_id[${index}]`, e))
  //     // option.forEach((item, idx) => {
  //     //   form.append(`items_id_selected[${idx}]`, item?.item?.value ?? "");
  //     // });
  //   }
  //   if (typeOrder === '1') {
  //     if (quote && quote.value !== null) {
  //       try {
  //         const {
  //           data: { result },
  //         } = await apiSalesOrder.apiQuotaItems({
  //           params: {
  //             'filter[quote_id]': quote !== null ? +quote?.value : null,
  //           },
  //         })
  //         setDataItems(result)

  //         setOnFetchingItem(false)
  //       } catch (error) {}
  //     } else {
  //       try {
  //         const {
  //           data: { result },
  //         } = await apiSalesOrder.apiItems(form)

  //         setDataItems(result)

  //         setOnFetchingItem(false)
  //       } catch (error) {}
  //     }
  //   } else if (typeOrder === '0') {
  //     try {
  //       const {
  //         data: { result },
  //       } = await apiSalesOrder.apiItems(form)

  //       setDataItems(result)

  //       setOnFetchingItem(false)
  //     } catch (error) {}
  //   }
  // }

  // const options = dataItems?.map((e) => {
  //   return {
  //     label: `${e.name} <span style={{display: none}}>${e.code}</span><span style={{display: none}}>${e.product_variation} </span><span style={{display: none}}>${e.text_type} ${e.unit_name} </span>`,
  //     value: e.id,
  //     e,
  //   }
  // })

  // // tổng thay đổi
  // useEffect(() => {
  //   if (totalTax == null) return
  //   setOption((prevOption) => {
  //     const newOption = [...prevOption]
  //     const thueValue = totalTax?.tax_rate || 0
  //     const chietKhauValue = totalDiscount || 0
  //     newOption.forEach((item, index) => {
  //       const dongiasauchietkhau = item?.price * (1 - chietKhauValue / 100)
  //       const thanhTien = dongiasauchietkhau * (1 + thueValue / 100) * item.quantity
  //       item.tax = totalTax
  //       item.total_amount = isNaN(thanhTien) ? 0 : thanhTien
  //     })
  //     return newOption
  //   })
  // }, [totalTax])

  // useEffect(() => {
  //   if (deliveryDate == null) return
  //   setOption((prevOption) => {
  //     const newOption = [...prevOption]

  //     newOption.forEach((item, index) => {
  //       item.delivery_date = deliveryDate || null
  //     })
  //     return newOption
  //   })
  // }, [deliveryDate])

  // useEffect(() => {
  //   if (totalDiscount == null) return
  //   setOption((prevOption) => {
  //     const newOption = [...prevOption]
  //     const thueValue = totalTax?.tax_rate != undefined ? totalTax?.tax_rate : 0
  //     const chietKhauValue = totalDiscount ? totalDiscount : 0

  //     newOption.forEach((item, index) => {
  //       const dongiasauchietkhau = item?.price * (1 - chietKhauValue / 100)
  //       const thanhTien = dongiasauchietkhau * (1 + thueValue / 100) * item.quantity
  //       item.tax = totalTax
  //       item.discount = Number(totalDiscount)
  //       item.price_after_discount = isNaN(dongiasauchietkhau) ? 0 : dongiasauchietkhau
  //       item.total_amount = isNaN(thanhTien) ? 0 : thanhTien
  //     })
  //     return newOption
  //   })
  // }, [totalDiscount])

  // useEffect(() => {
  //   setCustomer(null) || setContactPerson(null) || setStaff(null)
  // }, [])

  // useEffect(() => {
  //   branch !== null && setOnFetchingItemsAll(true)
  //   branch == null && setItemsAll([])
  // }, [branch])

  // useEffect(() => {
  //   quote !== null && setOnFetchingItem(true)
  // }, [quote])

  // useEffect(() => {
  //   onFetchingItemsAll && handleFetchingItemsAll()
  // }, [onFetchingItemsAll, option, branch])

  // useEffect(() => {
  //   onFetchingItem && handleFetchingItem()
  // }, [onFetchingItem])

  // useEffect(() => {
  //   setErrDate(false)
  // }, [startDate != null])

  // useEffect(() => {
  //   sErrCustomer(false)
  // }, [customer != null])

  // useEffect(() => {
  //   setErrDeliveryDate(false)
  // }, [deliveryDate != null])

  // useEffect(() => {
  //   setErrBranch(false)
  // }, [branch != null])

  // useEffect(() => {
  //   setErrStaff(false)
  // }, [staff != null])

  // search api
  const _HandleSeachApi = debounce(async (inputValue) => {
    if (branch == null) return

    let form = new FormData()

    if (option.length > 0) {
      if (branch != null) {
        ;[+branch?.value].forEach((e, index) => form.append(`branch_id[${index}]`, e))
        option.forEach((item, idx) => {
          form.append(`items_id_selected[${idx}]`, item?.item?.value ?? '')
        })
      }
    }

    form.append('term', inputValue)

    if (typeOrder === '1' && quote && +quote.value) {
      const {
        data: { result },
      } = await apiSalesOrder.apiQuotaItems({
        data: {
          term: inputValue,
        },
        params: {
          'filter[quote_id]': quote ? +quote?.value : null,
        },
      })
      setDataItems(result)
    }
    if (typeOrder === '0') {
      const {
        data: { result },
      } = await apiSalesOrder.apiItems(form)
      setDataItems(result)
    }
  }, 500)

  // format number
  // const formatNumber = (number) => {
  //   return formatNumberConfig(+number, dataSeting)
  // }

  // const formatMoney = (number) => {
  //   return formatMoneyConfig(+number, dataSeting)
  // }

  // const resetValue = () => {
  //   if (status == 'customer') {
  //     setCustomer(isId)
  //     setContactPerson(null)
  //     // setQuote(null);
  //     setOption([])

  //     setOnFetchingItem(true)
  //   }
  //   if (status == 'branch') {
  //     setBranch(isId)
  //     setOption([])
  //     setCustomer(null)
  //     setContactPerson(null)
  //     setStaff(null)
  //     // setQuote(null);
  //   }
  //   if (status == 'typeOrder') {
  //     setTypeOrder(isId)
  //     // setHidden(isId === "1");
  //     // setQuote(isId === "0" ? null : quote);
  //     isId == 1 && refetchQuote()
  //     setOnFetchingItem(isId === '0' && true)
  //     setOnFetchingItemsAll(isId === '1' && true)

  //     // setDataItems([])
  //     setTotalTax('')
  //     setTotalDiscount('')
  //     setOption([])
  //   }
  //   if (status == 'quote') {
  //     // setQuote(isId);
  //     setOption([])
  //     setOnFetchingItemsAll(true)
  //     setOnFetchingItem(true)
  //   }
  //   handleQueryId({ status: false })
  // }

  // change items
  // const handleOnChangeInputOption = (id, type, value) => {
  //   var index = option.findIndex((x) => x.id === id)

  //   if (type == 'unit') {
  //     option[index].unit = value.target?.value
  //   } else if (type === 'quantity') {
  //     option[index].quantity = Number(value?.value)
  //     if (option[index].tax?.tax_rate == undefined) {
  //       const tien = Number(option[index].price_after_discount) * (1 + Number(0) / 100) * Number(option[index].quantity)
  //       option[index].total_amount = Number(tien.toFixed(2))
  //     } else {
  //       const tien =
  //         Number(option[index].price_after_discount) *
  //         (1 + Number(option[index].tax?.tax_rate) / 100) *
  //         Number(option[index].quantity)
  //       option[index].total_amount = Number(tien.toFixed(2))
  //     }
  //     setOption([...option])
  //   } else if (type == 'price') {
  //     option[index].price = Number(value.value)
  //     option[index].price_after_discount = +option[index].price * (1 - option[index].discount / 100)
  //     option[index].price_after_discount = +(Math.round(option[index].price_after_discount + 'e+2') + 'e-2')
  //     if (option[index].tax?.tax_rate == undefined) {
  //       const tien = Number(option[index].price_after_discount) * (1 + Number(0) / 100) * Number(option[index].quantity)
  //       option[index].total_amount = Number(tien.toFixed(2))
  //     } else {
  //       const tien =
  //         Number(option[index].price_after_discount) *
  //         (1 + Number(option[index].tax?.tax_rate) / 100) *
  //         Number(option[index].quantity)
  //       option[index].total_amount = Number(tien.toFixed(2))
  //     }
  //   } else if (type == 'discount') {
  //     option[index].discount = Number(value.value)
  //     option[index].price_after_discount = +option[index].price * (1 - option[index].discount / 100)
  //     option[index].price_after_discount = +(Math.round(option[index].price_after_discount + 'e+2') + 'e-2')
  //     if (option[index].tax?.tax_rate == undefined) {
  //       const tien = Number(option[index].price_after_discount) * (1 + Number(0) / 100) * Number(option[index].quantity)
  //       option[index].total_amount = Number(tien.toFixed(2))
  //     } else {
  //       const tien =
  //         Number(option[index].price_after_discount) *
  //         (1 + Number(option[index].tax?.tax_rate) / 100) *
  //         Number(option[index].quantity)
  //       option[index].total_amount = Number(tien.toFixed(2))
  //     }
  //   } else if (type == 'tax') {
  //     option[index].tax = value
  //     if (option[index].tax?.tax_rate == undefined) {
  //       const tien = Number(option[index].price_after_discount) * (1 + Number(0) / 100) * Number(option[index].quantity)
  //       option[index].total_amount = Number(tien.toFixed(2))
  //     } else {
  //       const tien =
  //         Number(option[index].price_after_discount) *
  //         (1 + Number(option[index].tax?.tax_rate) / 100) *
  //         Number(option[index].quantity)
  //       option[index].total_amount = Number(tien.toFixed(2))
  //     }
  //   } else if (type == 'note') {
  //     option[index].note = value?.target?.value
  //   } else if (type == 'delivery_date') {
  //     option[index].delivery_date = value
  //   } else if (type == 'clear_delivery_date') {
  //     option[index].delivery_date = null
  //     setDeliveryDate(null)
  //   } else if (type == 'clearDeliveryDate') {
  //     setDeliveryDate(null)
  //     // option[index].delivery_date = null
  //   }

  //   setOption([...option])
  // }
  // const handleIncrease = (id) => {
  //   const index = option.findIndex((x) => x.id === id)
  //   const newQuantity = +option[index].quantity + 1

  //   option[index].quantity = newQuantity
  //   if (option[index].tax?.tax_rate == undefined) {
  //     const tien = Number(option[index].price_after_discount) * (1 + Number(0) / 100) * Number(option[index].quantity)
  //     option[index].total_amount = Number(tien.toFixed(2))
  //   } else {
  //     const tien =
  //       Number(option[index].price_after_discount) *
  //       (1 + Number(option[index].tax?.tax_rate) / 100) *
  //       Number(option[index].quantity)
  //     option[index].total_amount = Number(tien.toFixed(2))
  //   }
  //   setOption([...option])
  // }

  // const handleDecrease = (id) => {
  //   const index = option.findIndex((x) => x.id === id)
  //   const newQuantity = Number(option[index].quantity) - 1
  //   // chỉ giảm số lượng khi nó lớn hơn hoặc bằng 1
  //   if (newQuantity >= 1) {
  //     option[index].quantity = Number(newQuantity)
  //     if (option[index].tax?.tax_rate == undefined) {
  //       const tien = Number(option[index].price_after_discount) * (1 + Number(0) / 100) * Number(option[index].quantity)
  //       option[index].total_amount = Number(tien.toFixed(2))
  //     } else {
  //       const tien =
  //         Number(option[index].price_after_discount) *
  //         (1 + Number(option[index].tax?.tax_rate) / 100) *
  //         Number(option[index].quantity)
  //       option[index].total_amount = Number(tien.toFixed(2))
  //     }
  //     setOption([...option])
  //   } else {
  //     return isShow('error', `${'Số lượng tối thiểu là 1 không thể giảm !'}`)
  //   }
  // }
  // const _HandleDelete = (id, type) => {
  //   if (type === 'default') {
  //     return isShow('error', `${'Mặc định của hệ thống, không thể xóa'}`)
  //   }
  //   const newOption = option.filter((x) => x.id !== id) // loại bỏ phần tử cần xóa
  //   setOption(newOption) // cập nhật lại mảng
  // }

  // const taxOptions = [{ label: 'Miễn thuế', value: '0', tax_rate: '0' }, ...dataTasxes]

  // const totalMoney = (option) => {
  //   const totalPrice = option.reduce((acc, item) => {
  //     const totalPrice = item?.price * item?.quantity
  //     return acc + totalPrice
  //   }, 0)

  //   const totalDiscountPrice = option.reduce((acc, item) => {
  //     const totalDiscountPrice = item?.price * (item?.discount / 100) * item?.quantity
  //     return acc + totalDiscountPrice
  //   }, 0)

  //   const totalDiscountAfterPrice = option.reduce((acc, item) => {
  //     const tienSauCK = item?.quantity * item?.price_after_discount
  //     return acc + tienSauCK
  //   }, 0)

  //   const totalTax = option.reduce((acc, item) => {
  //     const totalTaxIem =
  //       item?.price_after_discount * (isNaN(item?.tax?.tax_rate) ? 0 : item?.tax?.tax_rate / 100) * item?.quantity
  //     return acc + totalTaxIem
  //   }, 0)

  //   const totalAmount = option.reduce((acc, item) => {
  //     const totalAmount = item?.total_amount
  //     return acc + totalAmount
  //   }, 0)
  //   return {
  //     totalPrice: totalPrice || 0,
  //     totalDiscountPrice: totalDiscountPrice || 0,
  //     totalDiscountAfterPrice: totalDiscountAfterPrice || 0,
  //     totalTax: totalTax || 0,
  //     totalAmount: totalAmount || 0,
  //   }
  // }

  // useEffect(() => {
  //   const totalPrice = totalMoney(option)
  //   setIsTotalMoney(totalPrice)
  // }, [option])

  // const dataOption = option?.map((e) => {
  //   return {
  //     item: e?.item?.value,
  //     quantity: Number(e?.quantity),
  //     price: e?.price,
  //     discount_percent: e?.discount,
  //     tax_id: e?.tax?.value,
  //     price_quote_item_id: e?.item?.e?.price_quote_item_id,
  //     note: e?.note,
  //     id: e?.id,
  //     delivery_date: e?.delivery_date,
  //     price_quote_order_item_id: e?.price_quote_order_item_id,
  //   }
  // })

  // let newDataOption = dataOption?.filter((e) => e?.item !== undefined)

  // // handle submit
  // const handleSubmit = async () => {
  //   let formData = new FormData()
  //   formData.append('code', codeProduct)
  //   formData.append('date', formatMoment(startDate, FORMAT_MOMENT.DATE_TIME_LONG))
  //   formData.append('branch_id', branch?.value ? branch?.value : '')
  //   formData.append('client_id', selectedCustomer ? selectedCustomer : '')
  //   formData.append('person_contact_id', contactPerson?.value ? contactPerson?.value : '')
  //   formData.append('staff_id', staff?.value ? staff?.value : '')
  //   formData.append('note', note ? note : '')
  //   formData.append('quote_id', typeOrder === '1' ? quote?.value : '')
  //   newDataOption.forEach((item, index) => {
  //     formData.append(`items[${index}][item]`, item?.item != undefined ? item?.item : '')
  //     formData.append(
  //       `items[${index}][id]`,
  //       item?.price_quote_order_item_id != undefined ? item?.price_quote_order_item_id : ''
  //     )
  //     formData.append(`items[${index}][quantity]`, item?.quantity.toString())
  //     formData.append(`items[${index}][price]`, item?.price)
  //     formData.append(`items[${index}][discount_percent]`, item?.discount_percent)
  //     formData.append(`items[${index}][tax_id]`, item?.tax_id != undefined ? item?.tax_id : '')
  //     formData.append(`items[${index}][note]`, item?.note != undefined ? item?.note : '')
  //     formData.append(
  //       `items[${index}][delivery_date]`,
  //       item?.delivery_date != undefined ? formatMoment(item?.delivery_date, FORMAT_MOMENT.DATE_TIME_LONG) : ''
  //     )
  //   })

  //   // if (
  //   //     isTotalMoney?.totalPrice > 0 &&
  //   //     isTotalMoney?.totalDiscountPrice >= 0 &&
  //   //     isTotalMoney?.totalDiscountAfterPrice > 0 &&
  //   //     isTotalMoney?.totalTax >= 0 &&
  //   //     isTotalMoney?.totalAmount > 0
  //   // ) {
  //   try {
  //     const { isSuccess, message } = await apiSalesOrder.apiHandingSalesOrder(id, formData)
  //     if (isSuccess) {
  //       isShow('success', `${dataLang[message]}` || message)
  //       setCodeProduct('')
  //       setStartDate(dayjs())
  //       setDeliveryDate(dayjs())
  //       setContactPerson(null)
  //       setStaff(null)
  //       setCustomer(null)
  //       setBranch(null)
  //       setErrQuote(null)
  //       setNote('')
  //       setErrBranch(false)
  //       setErrDate(false)
  //       setErrDeliveryDate(false)
  //       sErrCustomer(false)
  //       setErrStaff(false)
  //       setErrQuote(false)
  //       setOption([])
  //       router.push(routerSalesOrder.home)
  //     } else {
  //       isShow('error', `${dataLang[message]}` || message)
  //     }
  //     setOnSending(false)
  //   } catch (error) {}
  //   // } else {
  //   //     isShow(
  //   //         'error',
  //   //         newDataOption?.length === 0
  //   //             ? `Chưa chọn thông tin mặt hàng!`
  //   //             : 'Tiền không được âm, vui lòng kiểm tra lại thông tin mặt hàng!'
  //   //     )
  //   //     setOnSending(false)
  //   // }
  // }

  return (
    <LayoutOrderManagement
      dataLang={dataLang}
      titleHead={
        id
          ? dataLang?.sales_product_edit_order || 'sales_product_edit_order'
          : dataLang?.sales_product_add_order || 'sales_product_add_order'
      }
      breadcrumbItems={breadcrumbItems}
      titleLayout={
        id
          ? dataLang?.sales_product_edit_order || 'sales_product_edit_order'
          : dataLang?.sales_product_add_order || 'sales_product_add_order'
      }
      searchBar={
        <div className="w-full">
          <SelectSearch
            options={options}
            onChange={(value) => {
              handleOnChangeInput('itemAll', value)
            }}
            value={option?.map((e) => e?.item)}
            formatOptionLabel={(option) => selectItemsLabel(option)}
            placeholder={dataLang?.returns_items || 'returns_items'}
            setSearch={_HandleSeachApi} // Truyền hàm search vào đây
          />
        </div>
      }
      tableLeft={
        <>
          {option.length <= 0 ? (
            <EmptyData />
          ) : (
            <div>
              {/* Thông tin mặt hàng Header */}
              <div className="grid items-center grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.6fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1.2fr)_minmax(0,0.2fr)] 2xl:gap-x-6 gap-x-4 sticky top-0 py-2 border-b border-gray-100">
                <TableHeader className="text-left">{dataLang?.sales_product_item || 'sales_product_item'}</TableHeader>
                <TableHeader className="text-center">
                  {dataLang?.sales_product_quantity || 'sales_product_quantity'}
                </TableHeader>
                <TableHeader className="text-center">
                  {dataLang?.sales_product_unit_price || 'sales_product_unit_price'}
                </TableHeader>
                {/* Chọn hoàng loạt % chiết khấu */}
                <DropdownDiscount
                  value={totalDiscount}
                  onChange={handleOnChangeInput.bind(this, 'totaldiscount')}
                  dataLang={dataLang}
                />
                <TableHeader className="text-center">{dataLang?.returns_sck || 'returns_sck'}</TableHeader>
                {/* Chọn hàng loại % Thuế */}
                <DropdownTax
                  value={totalTax}
                  onChange={(value) => handleOnChangeInput('total_tax', value)}
                  dataLang={dataLang}
                  taxOptions={taxOptions}
                />
                <TableHeader className="text-right">
                  {dataLang?.sales_product_total_into_money || 'sales_product_total_into_money'}
                </TableHeader>
              </div>
              {/* Thông tin mặt hàng Body */}
              <Customscrollbar className="max-h-[730px] overflow-auto pb-2">
                <div className="h-full w-full">
                  {option.map((e, index) => {
                    const isLast = index === option.length - 1

                    return (
                      <div
                        className={`grid items-center grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.6fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1.2fr)_minmax(0,0.2fr)] 2xl:gap-x-6 gap-x-4 py-1 ${
                          isLast ? '' : 'border-b border-[#F3F3F4]'
                        }`}
                        key={e?.id}
                      >
                        {/* Mặt hàng */}
                        <div className="h-full p-2">
                          <div className="flex items-center justify-between gap-1 xl:gap-2">
                            <div className="flex items-start">
                              <div className="flex xl:flex-row flex-col items-start gap-3">
                                <img
                                  src={e?.item?.e?.images ?? '/icon/noimagelogo.png'}
                                  alt={e?.item?.e?.name}
                                  className="2xl:size-16 size-12 object-cover rounded-md"
                                />
                                <div className="flex flex-col gap-[2px] responsive-text-xxs overflow-hidden text-neutral-03 font-normal">
                                  <h3 className="font-semibold responsive-text-sm text-brand-color">
                                    {e?.item?.e?.name}
                                  </h3>
                                  <p>
                                    Màu sắc: <span>{e?.item?.e?.product_variation}</span> - Size:{' '}
                                  </p>
                                  <p>{e?.item?.e?.product_variation_1 ? e?.item?.e?.product_variation_1 : 'None'}</p>
                                  <p>
                                    ĐVT: <span>{e?.unit}</span> - Tồn: {formatNumber(e?.item?.e?.qty_warehouse)}
                                  </p>
                                </div>
                              </div>
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
                              onChange={(value) => handleOnChangeInputOption(e?.id, 'note', value)}
                              placeholder="Ghi chú"
                              type="text"
                              className="focus:border-[#92BFF7] placeholder:responsive-text-xs 2xl:h-7 xl:h-5 py-0 px-1 responsive-text-xs placeholder-slate-300 w-full bg-white rounded-[5.5px] text-[#1C252E] font-normal outline-none placeholder:text-typo-gray-4"
                            />
                          </div>
                        </div>

                        {/* Số lượng */}
                        <div className="flex items-center justify-center">
                          <div
                            className={`flex items-center justify-center h-8 2xl:h-10 3xl:p-2 xl:p-[2px] p-[1px] rounded-3xl cursor-text border ${
                              e?.quantity <= 0 || e?.quantity == ''
                                ? 'border-red-500'
                                : 'focus:border-brand-color hover:border-brand-color border-neutral-N400'
                            }`}
                          >
                            <button
                              onClick={() => handleDecrease(e?.id)}
                              className="2xl:scale-100 xl:scale-90 scale-75 bg-primary-05 hover:bg-typo-blue-4/50 font-bold flex items-center justify-center p-0.5 rounded-full"
                            >
                              <Minus size="16" className="scale-75 2xl:scale-100 xl:scale-90" />
                            </button>
                            <InPutNumericFormat
                              value={e?.quantity}
                              onValueChange={(value) => handleOnChangeInputOption(e?.id, 'quantity', value)}
                              isAllowed={({ floatValue }) => {
                                if (floatValue == 0) {
                                  return true
                                } else {
                                  return true
                                }
                              }}
                              allowNegative={false}
                              className={`appearance-none text-center responsive-text-sm font-normal w-full focus:outline-none`}
                            />
                            <button
                              onClick={() => handleIncrease(e.id)}
                              className="2xl:scale-100 xl:scale-90 scale-75 bg-primary-05 hover:bg-typo-blue-4/50 font-bold flex items-center justify-center p-0.5 rounded-full"
                            >
                              <Add size="16" className="scale-75 2xl:scale-100 xl:scale-90" />
                            </button>
                          </div>
                        </div>
                        {/* Đơn giá */}
                        <div
                          className={`flex items-center rounded-lg h-8 2xl:h-10 py-1 px-2 2xl:px-3 border ${
                            e?.price === '' ||
                            (e?.price === null
                              ? 'border-red-500'
                              : 'focus:border-brand-color hover:border-brand-color border-neutral-N400')
                          }`}
                        >
                          <InPutMoneyFormat
                            value={e?.price}
                            onValueChange={(value) => handleOnChangeInputOption(e?.id, 'price', value)}
                            isAllowed={isAllowedNumber}
                            allowNegative={false}
                            className="price-input-number cursor-text appearance-none text-center w-full focus:outline-none m-0 responsive-text-sm font-semibold"
                            isSuffix={' đ'}
                          />
                        </div>
                        {/* % Chiết khấu */}
                        <div className="flex items-center justify-center border focus:border-brand-color hover:border-brand-color border-neutral-N400 rounded-lg font-semibold responsive-text-sm text-black-color h-8 2xl:h-10 py-2 px-2 2xl:px-3">
                          <InPutNumericFormat
                            value={e?.discount}
                            onValueChange={(value) => {
                              handleOnChangeInputOption(e?.id, 'discount', value)
                            }}
                            className={`cursor-text appearance-none text-right w-full focus:outline-none`}
                            isAllowed={isAllowedDiscount}
                            isNumericString={true}
                            allowNegative={false}
                          />
                          <span className="pl-[2px] 2xl:pl-1 text-right">%</span>
                        </div>
                        {/* Đơn giá sau chiết khấu */}
                        <div className="flex items-center justify-center text-center font-semibold responsive-text-sm text-black-color">
                          <h3 className={`pl-2`}>{formatNumber(e?.price_after_discount)}</h3>
                          <span className="pl-[2px] 2xl:pl-1 underline">đ</span>
                        </div>
                        {/* % Thuế */}
                        <div className="w-full">
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
                            onChange={(value) => handleOnChangeInputOption(e?.id, 'tax', value)}
                            renderOption={(option, isLabel) => (
                              <div
                                className={`flex items-center justify-start gap-1 responsive-text-sm ${
                                  isLabel ? 'py-1 2xl:py-2' : ''
                                }`}
                              >
                                <h2 className="">{option?.label}</h2>
                                {option?.tax_rate !== '0' && option?.tax_rate !== '5' && (
                                  <h2>
                                    {option?.tax_rate === '20' ? `(${option?.tax_rate}%)` : `${option?.tax_rate}%`}
                                  </h2>
                                )}
                              </div>
                            )}
                          />
                        </div>
                        {/* Thành tiền và nút xoá */}
                        <ItemTotalAndDelete
                          total={formatMoney(e?.total_amount)}
                          onDelete={() => {
                            setIdProductSale(e?.item?.value)
                            _HandleDelete.bind(this, e?.id)()
                          }}
                        />
                      </div>
                    )
                  })}
                </div>
              </Customscrollbar>
            </div>
          )}
        </>
      }
      info={
        <div className="flex flex-col gap-4 relative">
          {/* Số đơn hàng */}
          <div className="flex flex-col flex-wrap items-center gap-y-3">
            <InfoFormLabel label={dataLang?.sales_product_code || 'sales_product_code'} />
            <div className="w-full relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 text-neutral-02">
                <PiHash />
              </span>
              <input
                value={codeProduct}
                onChange={handleOnChangeInput.bind(this, 'codeProduct')}
                name="fname"
                type="text"
                placeholder={dataLang?.system_default || 'system_default'}
                className={`xl1439:text-[15px] xl1439:leading-6 text-[13px] leading-[20px] text-gray-600 font-normal responsive-text-base placeholder:text-sm z-10 pl-8 focus:border-[#0F4F9E] w-full border border-[#d0d5dd] p-2 rounded-lg outline-none cursor-pointer`}
              />
            </div>
          </div>
          {/* Ngày tạo đơn */}
          <div className="flex flex-col flex-wrap items-center gap-y-3 relative">
            <InfoFormLabel isRequired label={'Ngày tạo đơn' || dataLang?.sales_product_date} />
            <div className="w-full">
              <div className="relative w-full flex flex-row custom-date-picker date-form">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                  <CalendarBlankIcon color="#7a7a7a" className="size-4 opacity-60" />
                </span>
                <ConfigProvider locale={viVN}>
                  <DatePicker
                    className="sales-product-date pl-8 placeholder:text-secondary-color-text-disabled cursor-pointer"
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
                        setStartDate(dateString)
                      }
                    }}
                  />
                </ConfigProvider>
              </div>
            </div>

            {errDate && (
              <label className="text-sm text-red-500">{dataLang?.price_quote_errDate || 'price_quote_errDate'}</label>
            )}
          </div>
          {/* Ngày cần hàng */}
          <div className="flex flex-col flex-wrap items-center gap-y-3 relative">
            <InfoFormLabel isRequired label={dataLang?.sales_product_item_date || 'sales_product_item_date'} />
            <div className="w-full">
              <div className="relative flex flex-row custom-date-picker date-form">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                  <CalendarBlankIcon color="#7a7a7a" className="size-4 opacity-60" />
                </span>
                <ConfigProvider locale={viVN}>
                  <DatePicker
                    className="sales-product-date pl-8 placeholder:text-secondary-color-text-disabled cursor-pointer"
                    placeholder="Chọn ngày"
                    format="DD/MM/YYYY"
                    suffixIcon={null}
                    value={deliveryDate ? dayjs(deliveryDate) : null}
                    onChange={(date) => {
                      if (date) {
                        const dateString = date.toDate().toString()
                        setDeliveryDate(dateString)
                      } else {
                        setDeliveryDate(null) // Xử lý khi user xóa date
                      }
                    }}
                    status={errDeliveryDate ? 'error' : ''}
                  />
                </ConfigProvider>
              </div>
              {errDeliveryDate && (
                <label className="text-sm text-red-500">
                  {dataLang?.sales_product_err_delivery_date || 'Vui lòng chọn ngày cần hàng'}
                </label>
              )}
            </div>
          </div>
          {/* Khách hàng */}
          <SelectWithRadio
            isRequired={true}
            label={dataLang?.selectedCustomer || 'Khách hàng'}
            title="Khách hàng"
            placeholderText="Chọn khách hàng"
            options={!!flagStateChange ? [] : dataCustomer}
            value={selectedCustomer}
            onChange={(value) => setSelectedCustomer(value)}
            isError={errCustomer}
            messErr={dataLang?.sales_product_err_customer || 'sales_product_err_customer'}
            isShowAddNew={true}
            sSearch={sSearchClient}
            dataBranch={dataBranch}
            dataLang={dataLang}
            icon={<LuBriefcase />}
          />
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
                <React.Fragment>
                  {/* Nhân viên */}
                  <div className="flex flex-col flex-wrap items-center mb-4 gap-y-3">
                    <InfoFormLabel isRequired label={dataLang?.sales_product_staff_in_charge || 'Nhân viên'} />
                    <div className="w-full">
                      <div className="relative flex flex-row select-with-sort">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                          <FiUser color="#7a7a7a" />
                        </span>
                        <SelectWithSort
                          title={dataLang?.sales_product_staff_in_charge || 'Nhân viên'}
                          placeholderText="Chọn nhân viên"
                          options={!!flagStateChange ? [] : dataStaffs}
                          value={selectedStaff}
                          onChange={(value) => setSelectedStaff(value)}
                          isError={errStaff}
                        />
                      </div>
                      {errStaff && (
                        <label className="text-sm text-red-500">
                          {dataLang?.sales_product_err_staff_in_charge || 'sales_product_err_staff_in_charge'}
                        </label>
                      )}
                    </div>
                  </div>
                  {/* Người liên lạc */}
                  <div className="flex flex-col flex-wrap items-center mb-4 gap-y-3">
                    <InfoFormLabel label={dataLang?.contact_person || 'Người liên lạc'} />
                    <div className="w-full relative flex select-with-sort">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                        <FiUser color="#7a7a7a" />
                      </span>
                      <SelectWithSort
                        title="Người liên lạc"
                        placeholderText="Chọn người liên lạc"
                        options={!!flagStateChange ? [] : dataPersonContact}
                        value={selectedPersonalContact || contactPerson}
                        onChange={(value) => setSelectedPersonalContact(value)}
                      />
                    </div>
                  </div>
                  {/* Chi nhánh */}
                  <div className="flex flex-col flex-wrap items-center mb-4 gap-y-3">
                    <InfoFormLabel isRequired label={dataLang?.branch || 'Chi nhánh'} />
                    <div className="w-full">
                      <div className="relative flex flex-row select-with-sort">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10">
                          <PiMapPinLight color="#7a7a7a" />
                        </div>
                        <SelectWithSort
                          title="Chi nhánh"
                          placeholderText="Chọn chi nhánh"
                          options={dataBranch}
                          value={selectedBranch}
                          onChange={(value) => setSelectedBranch(value)}
                          isError={errBranch}
                        />
                      </div>
                      {errBranch && (
                        <label className="text-sm text-red-500">
                          {dataLang?.sales_product_err_branch || 'sales_product_err_branch'}
                        </label>
                      )}
                    </div>
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
        <div className="w-full mx-auto">
          <h4 className="responsive-text-base font-normal text-secondary-color-text mb-3 capitalize">
            {dataLang?.sales_product_note || 'sales_product_note'}
          </h4>
          <div className="w-full pb-6">
            <textarea
              value={note}
              placeholder="Nhập ghi chú tại đây"
              onChange={handleOnChangeInput.bind(this, 'note')}
              name="fname"
              type="text"
              className="focus:border-brand-color border-gray-200 placeholder-secondary-color-text-disabled placeholder:responsive-text-base w-full h-[80px] max-h-[80px] bg-[#ffffff] rounded-lg text-[#52575E] responsive-text-base font-normal px-3 py-2 border outline-none"
            />
          </div>
        </div>
      }
      isTotalMoney={isTotalMoney}
      routerBack={routerSalesOrder.home}
      onSave={handleSubmitValidate.bind(this)}
      onSending={onSending}
      popupConfim={
        <PopupConfim
          dataLang={dataLang}
          nameModel={'change_item'}
          type="warning"
          title={TITLE_DELETE_ITEMS}
          subtitle={CONFIRMATION_OF_CHANGES}
          isOpen={isOpen}
          save={resetValue}
          cancel={() => handleQueryId({ status: false })}
        />
      }
    />
  )
}

export default SalesOrderForm
