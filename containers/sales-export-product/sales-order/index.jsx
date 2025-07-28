import apiSalesOrder from '@/Api/apiSalesExportProduct/salesOrder/apiSalesOrder'
import { BtnAction } from '@/components/UI/BtnAction'
import TabFilter from '@/components/UI/TabFilter'
import Breadcrumb from '@/components/UI/breadcrumb/BreadcrumbCustom'
import OnResetData from '@/components/UI/btnResetData/btnReset'
import ButtonWarehouse from '@/components/UI/btnWarehouse/btnWarehouse'
import ButtonAddNew from '@/components/UI/button/buttonAddNew'
import ContainerPagination from '@/components/UI/common/ContainerPagination/ContainerPagination'
import { Customscrollbar } from '@/components/UI/common/Customscrollbar'
import { EmptyExprired } from '@/components/UI/common/EmptyExprired'
import { ColumnTable, HeaderTable, RowItemTable, RowTable } from '@/components/UI/common/Table'
import { TagColorLime, TagColorOrange, TagColorSky } from '@/components/UI/common/Tag/TagStatus'
import { ContainerTotal, LayOutTableDynamic } from '@/components/UI/common/layout'
import DropdowLimit from '@/components/UI/dropdowLimit/dropdowLimit'
import DateToDateComponent from '@/components/UI/filterComponents/dateTodateComponent'
import ExcelFileComponent from '@/components/UI/filterComponents/excelFilecomponet'
import SearchComponent from '@/components/UI/filterComponents/searchComponent'
import SelectComponent from '@/components/UI/filterComponents/selectComponent'
import Loading from '@/components/UI/loading/loading'
import NoData from '@/components/UI/noData/nodata'
import Pagination from '@/components/UI/pagination'
import PopupConfim from '@/components/UI/popupConfim/popupConfim'
import { CONFIRMATION_OF_CHANGES, TITLE_STATUS } from '@/constants/changeStatus/changeStatus'
import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate'
import { WARNING_STATUS_ROLE } from '@/constants/warningStatus/warningStatus'
import { useBranchList } from '@/hooks/common/useBranch'
import { useClientCombobox } from '@/hooks/common/useClients'
import useSetingServer from '@/hooks/useConfigNumber'
import { useLimitAndTotalItems } from '@/hooks/useLimitAndTotalItems'
import usePagination from '@/hooks/usePagination'
import useActionRole from '@/hooks/useRole'
import useStatusExprired from '@/hooks/useStatusExprired'
import useTab from '@/hooks/useTab'
import useToast from '@/hooks/useToast'
import { useToggle } from '@/hooks/useToggle'
import { routerSalesOrder } from '@/routers/sellingGoods'
import { formatMoment } from '@/utils/helpers/formatMoment'
import formatMoney from '@/utils/helpers/formatMoney'
import { useMutation } from '@tanstack/react-query'
import vi from 'date-fns/locale/vi'
import { Grid6 } from 'iconsax-react'
import { debounce } from 'lodash'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { registerLocale } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useSelector } from 'react-redux'
import PopupDetailProduct from './components/PopupDetailProduct'
import { useSalesOrderCombobox } from './hooks/useSalesOrderCombobox'
import { useSalesOrderFilterbar } from './hooks/useSalesOrderFilterbar'
import { useSalesOrderList } from './hooks/useSalesOrderList'
registerLocale('vi', vi)

const initialValue = {
  idBranch: null,
  idQuoteCode: null,
  idCustomer: null,
  valueDate: { startDate: null, endDate: null },
  keySearchClient: '',
  keySearchCode: '',
}
const SalesOrder = (props) => {
  const dataLang = props.dataLang

  const router = useRouter()

  const isShow = useToast()

  const dataSeting = useSetingServer()

  const { handleTab: _HandleSelectTab } = useTab()

  const { paginate } = usePagination()

  const statusExprired = useStatusExprired()

  const [refreshing, setRefreshing] = useState(false)

  const [keySearch, sKeySearch] = useState('')

  const [isExpanded, setIsExpanded] = useState(false)

  const [valueChange, sValueChange] = useState(initialValue)

  const { limit, updateLimit: sLimit } = useLimitAndTotalItems()

  const { isOpen, isKeyState, isIdChild: status, handleQueryId } = useToggle()

  const { is_admin: role, permissions_current: auth } = useSelector((state) => state.auth)

  const { checkAdd, checkExport } = useActionRole(auth, 'sales_product')

  const [checkedWare, sCheckedWare] = useState({})

  const toggleShowAll = () => setIsExpanded(!isExpanded)

  const _HandleChangeInput = (id, checkedUn, type, value) => {
    handleQueryId({
      status: true,
      initialKey: { id, checkedUn, type, value },
    })
  }

  const handleSaveStatus = () => {
    if (isKeyState?.type === 'browser') {
      const checked = isKeyState.value.target.checked
      const warehousemanId = isKeyState.value.target.value

      // Xử lý thay đổi trạng thái đơn hàng
      const newStatus = checked ? 'approved' : 'un_approved'
      handlePostStatus(isKeyState?.id, newStatus)
    }
    handleQueryId({ status: false })
  }

  const params = {
    search: keySearch,
    limit: limit,
    page: router.query?.page || 1,
    'filter[branch_id]': valueChange.idBranch != null ? valueChange.idBranch.value : null,
    'filter[status_bar]': router.query?.tab ?? null,
    'filter[id]': valueChange.idQuoteCode != null ? valueChange.idQuoteCode?.value : null,
    'filter[client_id]': valueChange.idCustomer != null ? valueChange.idCustomer.value : null,
    'filter[start_date]': valueChange.valueDate?.startDate != null ? valueChange.valueDate?.startDate : null,
    'filter[end_date]': valueChange.valueDate?.endDate != null ? valueChange.valueDate?.endDate : null,
  }

  const { data: dataBranch = [] } = useBranchList()

  const { data, isFetching, refetch } = useSalesOrderList(params)

  const { data: dataCode = [] } = useSalesOrderCombobox(valueChange.keySearchCode)

  const { data: dataClient = [] } = useClientCombobox(valueChange.keySearchClient)

  const { data: dataFilterBar, refetch: refetchFilterBar } = useSalesOrderFilterbar({ ...params, page: undefined })

  const handleSearchApi = debounce(async (value) => {
    sValueChange((e) => ({ ...e, keySearchClient: value }))
  }, 500)

  const handleSearchApiOrders = debounce(async (value) => {
    sValueChange((e) => ({ ...e, keySearchCode: value }))
  }, 500)

  const onChangeFilter = (type) => (event) => sValueChange((e) => ({ ...e, [type]: event }))

  const handleOnChangeKeySearch = debounce(({ target: { value } }) => {
    sKeySearch(value)
    router.replace({
      pathname: router.route,
      query: { tab: router.query?.tab },
    })
  }, 500)

  useEffect(() => {
    dataSeting?.tables_pagination_limit && sLimit(dataSeting?.tables_pagination_limit)
  }, [dataSeting?.tables_pagination_limit])

  const formatNumber = (number) => {
    const money = formatMoney(+number, dataSeting)
    return money
  }
  // excel
  const multiDataSet = [
    {
      columns: [
        {
          title: 'ID',
          width: { wch: 4 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.sales_product_date || 'sales_product_date'}`,
          width: { wpx: 100 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.sales_product_code || 'sales_product_code'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.customer || 'customer'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.sales_product_type_order || 'sales_product_type_order'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.sales_product_quote || 'sales_product_quote'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.sales_product_total || 'sales_product_total'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.sales_product_staff_in_charge || 'sales_product_staff_in_charge'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.status_table || 'status_table'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.sales_product_order_process || 'sales_product_order_process'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.note || 'note'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.branch || 'branch'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
      ],
      data: data?.rResult?.map((e) => [
        { value: `${e?.id ? e.id : ''}`, style: { numFmt: '0' } },
        { value: `${e?.date ? e?.date : ''}` },
        { value: `${e?.code ? e?.code : ''}` },
        { value: `${e?.client_name ? e?.client_name : ''}` },
        {
          value: `${e?.quote_code !== null && e?.quote_id !== '0' ? 'Phiếu báo giá' : 'Tạo mới'}`,
        },
        { value: `${e?.quote_code ? e?.quote_code : ''}` },

        {
          value: `${e?.total_amount ? formatNumber(e?.total_amount) : 0}`,
        },
        { value: `${e?.staff_name ? e?.staff_name : ''}` },
        {
          value: `${
            e?.status ? (e?.status === 'un_approved' && 'Chưa duyệt') || (e?.status === 'approved' && 'Đã duyệt') : ''
          }`,
        },
        { value: `${e?.process ? e?.process : ''}` },
        { value: `${e?.note ? e?.note : ''}` },

        { value: `${e?.branch_name ? e?.branch_name : ''}` },
      ]),
    },
  ]

  const toggleStatus = () => {
    const index = data?.rResult.findIndex((x) => x.id == isKeyState)

    let newStatus = ''

    if (data?.rResult[index].status == 'approved') {
      newStatus = 'un_approved'
    } else if (data?.rResult[index].status == 'un_approved') {
      newStatus = 'approved'
    }

    handlePostStatus(isKeyState, newStatus)

    handleQueryId({ status: false })
  }

  const handingStatus = useMutation({
    mutationFn: ({ data, id, status }) => {
      return apiSalesOrder.apiHandingStatus(id, status, data)
    },
  })

  const handlePostStatus = (id, newStatus) => {
    const formData = new FormData()

    formData.append('id', id)

    formData.append('status', newStatus)

    handingStatus.mutate(
      { data: formData, id: id, stt: newStatus },
      {
        onSuccess: async ({ isSuccess, message }) => {
          if (isSuccess) {
            isShow('success', `${dataLang?.change_status_when_order || 'change_status_when_order'}` || message)
            setRefreshing(true)
            await refetch()
            await refetchFilterBar()
            setRefreshing(false)
          } else {
            isShow('error', `${dataLang[message] || message}` || message)
          }
        },
        onError: (error) => {},
      }
    )
  }

  // breadcrumb
  const breadcrumbItems = [
    {
      label: `${dataLang?.returnSales_title || 'returnSales_title'}`,
      // href: "/",
    },
    {
      label: `${dataLang?.sales_product_list || 'sales_product_list'}`,
    },
  ]

  return (
    <React.Fragment>
      <LayOutTableDynamic
        head={
          <Head>
            <title>{dataLang?.sales_product_list || 'sales_product_list'} </title>
          </Head>
        }
        breadcrumb={
          <>
            {statusExprired ? (
              <EmptyExprired />
            ) : (
              <React.Fragment>
                <Breadcrumb items={breadcrumbItems} className="3xl:text-sm 2xl:text-xs xl:text-[10px] lg:text-[10px]" />
              </React.Fragment>
            )}
          </>
        }
        titleButton={
          <>
            <h2 className="text-title-section text-[#52575E] capitalize font-medium">
              {dataLang?.sales_product_list || 'sales_product_list'}
            </h2>
            <div className={` flex justify-end items-center`}>
              <ButtonAddNew
                onClick={() => {
                  if (role) {
                    router.push(routerSalesOrder.form)
                  } else if (checkAdd) {
                    router.push(routerSalesOrder.form)
                  } else {
                    isShow('error', WARNING_STATUS_ROLE)
                  }
                }}
                dataLang={dataLang}
              />
            </div>
          </>
        }
        fillterTab={
          <>
            {dataFilterBar &&
              dataFilterBar?.map((e) => {
                return (
                  <TabFilter
                    style={{
                      backgroundColor: '#e2f0fe',
                    }}
                    dataLang={dataLang}
                    key={e?.id}
                    onClick={_HandleSelectTab.bind(this, `${e?.id}`)}
                    total={e?.count}
                    active={e?.id}
                    className={'text-[#0F4F9E]'}
                  >
                    {dataLang[e?.name]}
                  </TabFilter>
                )
              })}
          </>
        }
        table={
          <div className="flex flex-col h-full">
            <div className="w-full items-center flex justify-between gap-2">
              <div className="flex gap-3 items-center w-full">
                <div className="col-span-1">
                  <SearchComponent dataLang={dataLang} onChange={handleOnChangeKeySearch} />
                </div>
                <div className="z-20 col-span-1">
                  <DateToDateComponent value={valueChange.valueDate} onChange={onChangeFilter('valueDate')} />
                </div>
                <div className="col-span-1">
                  <SelectComponent
                    options={[
                      {
                        value: '',
                        label: dataLang?.price_quote_branch || 'price_quote_branch',
                        isDisabled: true,
                      },
                      ...dataBranch,
                    ]}
                    onChange={onChangeFilter('idBranch')}
                    value={valueChange.idBranch}
                    placeholder={dataLang?.price_quote_branch || 'price_quote_branch'}
                    isClearable={true}
                  />
                </div>
                <div className="col-span-1">
                  <SelectComponent
                    isLoading={dataCode == [] ? true : false}
                    options={[
                      {
                        value: '',
                        label: dataLang?.sales_product_code || 'sales_product_code',
                        isDisabled: true,
                      },
                      ...dataCode,
                    ]}
                    onChange={onChangeFilter('idQuoteCode')}
                    onInputChange={(e) => {
                      handleSearchApiOrders(e)
                    }}
                    value={valueChange.idQuoteCode}
                    placeholder={dataLang?.sales_product_code || 'sales_product_code'}
                    isClearable={true}
                  />
                </div>
                <div className="col-span-1">
                  <SelectComponent
                    options={[
                      {
                        value: '',
                        label: dataLang?.price_quote_customer || 'price_quote_customer',
                        isDisabled: true,
                      },
                      ...dataClient,
                    ]}
                    onInputChange={(e) => {
                      handleSearchApi(e)
                    }}
                    onChange={onChangeFilter('idCustomer')}
                    value={valueChange.idCustomer}
                    placeholder={dataLang?.price_quote_customer || 'price_quote_customer'}
                    isClearable={true}
                  />
                </div>
              </div>
              <div className="col-span-1 xl:col-span-2 lg:col-span-2">
                <div className="flex items-center justify-end gap-2">
                  <OnResetData sOnFetching={() => {}} onClick={refetch.bind(this)} />
                  {role == true || checkExport ? (
                    <div className={``}>
                      {data?.rResult?.length > 0 && (
                        <ExcelFileComponent
                          dataLang={dataLang}
                          filename="Danh sách đơn hàng bán"
                          title="DSĐHB"
                          multiDataSet={multiDataSet}
                        />
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => isShow('error', WARNING_STATUS_ROLE)}
                      className={`xl:px-4 px-3 xl:py-2.5 py-1.5 2xl:text-xs xl:text-xs text-[7px] flex items-center space-x-2 bg-[#C7DFFB] rounded hover:scale-105 transition`}
                    >
                      <Grid6 className="scale-75 2xl:scale-100 xl:scale-100" size={18} />
                      <span>{dataLang?.client_list_exportexcel}</span>
                    </button>
                  )}
                  <div></div>
                </div>
              </div>
            </div>
            <Customscrollbar className="h-full overflow-y-auto ">
              <div className="w-full">
                <HeaderTable gridCols={13}>
                  <ColumnTable colSpan={0.5} textAlign={'center'}>
                    {dataLang?.stt || 'STT'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'left'} className={'whitespace-nowrap'}>
                    {dataLang?.sales_product_date || 'sales_product_date'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'left'}>
                    {dataLang?.sales_product_code || 'sales_product_code'}
                  </ColumnTable>
                  <ColumnTable colSpan={1.5} textAlign={'left'}>
                    {dataLang?.customer || 'customer'}
                  </ColumnTable>
                  {/* <ColumnTable colSpan={1} textAlign={"center"}>
                    {dataLang?.sales_product_type_order ||
                      "sales_product_type_order"}
                  </ColumnTable> */}
                  <ColumnTable colSpan={1} textAlign={'right'}>
                    {dataLang?.sales_product_total_into_money || 'sales_product_total_into_money'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'center'}>
                    {dataLang?.sales_product_status || 'sales_product_status'}
                  </ColumnTable>
                  <ColumnTable colSpan={1.5} textAlign={'center'}>
                    {dataLang?.sales_product_statusTT || 'sales_product_statusTT'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'left'}>
                    {dataLang?.branch || 'branch'}
                  </ColumnTable>
                  <ColumnTable colSpan={4} textAlign={'center'}>
                    {dataLang?.sales_product_order_process || 'sales_product_order_process'}
                  </ColumnTable>
                  <ColumnTable colSpan={0.5} textAlign={'center'} className={'whitespace-nowrap'}>
                    {dataLang?.sales_product_action || 'sales_product_action'}
                  </ColumnTable>
                </HeaderTable>
                {/* {loading ? */}
                {isFetching && !refreshing ? (
                  <Loading className="h-80" color="#0f4f9e" />
                ) : data?.rResult?.length > 0 ? (
                  <>
                    <div className="divide-y divide-slate-200 min:h-[400px] h-[100%] max:h-[800px] ">
                      {data?.rResult?.map((e, index) => (
                        <RowTable gridCols={13} key={`data-${e.id.toString()}`}>
                          <RowItemTable colSpan={0.5} textAlign={'center'}>
                            {index + 1}
                          </RowItemTable>
                          <RowItemTable colSpan={1} textAlign="left">
                            {e?.date != null ? formatMoment(e?.date, FORMAT_MOMENT.DATE_SLASH_LONG) : ''}
                          </RowItemTable>
                          <RowItemTable colSpan={1} textAlign={'left'}>
                            <PopupDetailProduct
                              dataLang={dataLang}
                              className="3xl:text-sm 2xl:text-13 xl:text-xs text-11 font-medium col-span-1 text-center text-[#0F4F9E] hover:text-blue-500 transition-all duration-200 ease-in-out cursor-pointer"
                              name={e?.code ? e?.code : ''}
                              id={e?.id}
                            />
                          </RowItemTable>
                          <RowItemTable colSpan={1.5} textAlign="left">
                            {e?.client_name}
                          </RowItemTable>
                          <RowItemTable colSpan={1} textAlign={'right'}>
                            {formatNumber(e.total_amount)} <span className="underline">đ</span>
                          </RowItemTable>

                          <RowItemTable colSpan={1} textAlign={'center'}>
                            <ButtonWarehouse
                              warehouseman_id={e?.status === 'approved' ? '1' : '0'}
                              _HandleChangeInput={_HandleChangeInput}
                              id={e?.id}
                            />
                          </RowItemTable>
                          <RowItemTable colSpan={1.5} className={'flex items-center justify-center'}>
                            {(['payment_unpaid'].includes(e?.status_payment) && (
                              <TagColorSky
                                className={'text-center'}
                                name={dataLang[e?.status_payment] || e?.status_payment}
                              />
                            )) ||
                              (['payment_partially_paid'].includes(e?.status_payment) && (
                                <TagColorOrange
                                  className={''}
                                  name={`${dataLang[e?.status_payment] || e?.status_payment} (${formatNumber(
                                    e?.total_payment
                                  )})`}
                                />
                              )) ||
                              (['payment_paid'].includes(e?.status_payment) && (
                                <TagColorLime name={dataLang[e?.status_payment] || e?.status_payment} />
                              ))}
                          </RowItemTable>
                          <RowItemTable colSpan={1}>{e?.branch_name}</RowItemTable>

                          <RowItemTable colSpan={4}>
                            <div className="grid grid-cols-4 items-start py-2 pl-12 relative">
                              {e?.process.map((item, i) => {
                                const isValue = [
                                  'production_plan',
                                  'produced_at_company',
                                  'import_warehouse',
                                  'delivery',
                                ].includes(item?.code)
                                const isValueDelivery = ['delivery'].includes(item?.code)

                                return (
                                  <div
                                    className={`${i === e?.process.length - 1 ? ' relative' : 'relative'}`}
                                    key={`process-${i}`}
                                  >
                                    {!['keep_stock', 'import_outsourcing'].includes(item?.code) && (
                                      <>
                                        <div className="flex items-center">
                                          <div
                                            className={`${
                                              item?.active
                                                ? `h-2 w-2 rounded-full bg-green-500`
                                                : `h-2 w-2 rounded-full bg-gray-400`
                                            } `}
                                          />
                                          {!isValueDelivery && (
                                            <div
                                              className={`${
                                                item?.active
                                                  ? `w-full bg-green-500 h-0.5 `
                                                  : `w-full bg-gray-200 h-0.5 dark:bg-gray-400`
                                              }`}
                                            />
                                          )}
                                        </div>
                                        <div className="mt-2 3xl:w-[120px] xxl:w-[90px] 2xl:w-[90px] xl:w-[70px] lg:w-[50px]">
                                          <div
                                            className={`${
                                              item?.active ? 'text-green-500' : 'text-slate-500'
                                            } block w-full text-center mb-2 responsive-text-sm font-semibold leading-none absolute 3xl:translate-x-[-38%] 2xl:translate-x-[-40%] xl:translate-x-[-40%] translate-x-[-40%] 3xl:translate-y-[-10%] 2xl:translate-y-[-20%] xl:translate-y-[-20%] translate-y-[-20%]`}
                                          >
                                            <div className="flex flex-col items-center justify-center w-full gap-1">
                                              <h6>{dataLang[item?.name]}</h6>
                                              {isValueDelivery && (
                                                <h6
                                                  className={`${
                                                    item?.active && isValueDelivery
                                                      ? 'text-green-500'
                                                      : 'text-orange-500'
                                                  } responsive-text-sm`}
                                                >{`(${dataLang[item?.status] || item?.status})`}</h6>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </>
                                    )}
                                    <p
                                      className={`${
                                        isValueDelivery ? '3xl:mt-8 mt-7' : 'mt-3'
                                      } py-2 text-blue-700 text-center cursor-pointer responsive-text-sm left-0 translate-x-[-40%]  font-semibold`}
                                    >
                                      {/* <p className="text-blue-700 cursor-pointer  3xl:text-[9.5px] xxl:text-[9px] 2xl:text-[9px] xl:text-[7.5px] lg:text-[6px] text-[7px]  left-0 3xl:-translate-x-[17%] 2xl:-translate-x-1/3 xl:-translate-x-1/3 lg:-translate-x-1/3 -translate-x-1/4 3xl:translate-y-[10%] xxl:translate-y-1/3 2xl:translate-y-1/3 xl:translate-y-1/2 lg:translate-y-full translate-y-1/2 font-semibold"> */}

                                      {item?.reference &&
                                        item?.reference
                                          .slice(0, isExpanded ? item?.reference?.length : 2)
                                          .map((ci, index) => (
                                            <div className="flex flex-col" key={index}>
                                              {ci?.reference_no}
                                            </div>
                                          ))}
                                      {item?.reference && item?.reference?.length > 2 && (
                                        <button onClick={toggleShowAll}>{isExpanded ? 'Rút gọn' : 'Xem thêm'}</button>
                                      )}
                                    </p>
                                  </div>
                                )
                              })}
                            </div>
                          </RowItemTable>
                          <RowItemTable colSpan={0.5}>
                            <BtnAction
                              onRefresh={refetch.bind(this)}
                              dataLang={dataLang}
                              status={e?.status}
                              id={e?.id}
                              type="sales_product"
                            />
                          </RowItemTable>
                        </RowTable>
                      ))}
                    </div>
                  </>
                ) : (
                  <NoData />
                )}
              </div>
            </Customscrollbar>
          </div>
        }
        pagination={
          <div className="flex items-center justify-between gap-2">
            {data?.rResult?.length != 0 && (
              <ContainerPagination>
                {/* <TitlePagination
                  dataLang={dataLang}
                  totalItems={data?.output?.iTotalDisplayRecords}
                /> */}
                <Pagination
                  postsPerPage={limit}
                  totalPosts={Number(data?.output?.iTotalDisplayRecords)}
                  paginate={paginate}
                  currentPage={router.query?.page ? router.query?.page : 1}
                />
              </ContainerPagination>
            )}
            <DropdowLimit sLimit={sLimit} limit={limit} dataLang={dataLang} />
          </div>
        }
        total={
          <>
            <ContainerTotal className={'grid-cols-26'}>
              <RowItemTable colSpan={2.5} textAlign={'end'} className="p-2"></RowItemTable>
              <RowItemTable colSpan={1} textAlign={'start'} className="p-2">
                {dataLang?.total_outside || 'total_outside'}
              </RowItemTable>
              <RowItemTable colSpan={1.5} textAlign={'end'} className="whitespace-nowrap p-0">
                {formatNumber(data?.rTotal?.total_amount)} <span className="underline">đ</span>
              </RowItemTable>
            </ContainerTotal>
          </>
        }
        showTotal={true}
      />
      <PopupConfim
        dataLang={dataLang}
        type="warning"
        nameModel={'sales_product'}
        title={TITLE_STATUS}
        subtitle={CONFIRMATION_OF_CHANGES}
        isOpen={isOpen}
        save={() => handleSaveStatus()}
        cancel={() => handleQueryId({ status: false })}
      />
    </React.Fragment>
  )
}
export default SalesOrder
