import apiDeliveryReceipt from '@/Api/apiSalesExportProduct/deliveryReceipt/apiDeliveryReceipt'
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
import { ContainerTotal, LayOutTableDynamic } from '@/components/UI/common/layout'
import CustomAvatar from '@/components/UI/common/user/CustomAvatar'
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
import { formatMoment } from '@/utils/helpers/formatMoment'
import formatMoneyConfig from '@/utils/helpers/formatMoney'
import { Grid6 } from 'iconsax-react'
import { debounce } from 'lodash'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import { useSelector } from 'react-redux'
import { routerDeliveryReceipt } from 'routers/sellingGoods'
import PopupDetailProduct from '../sales-order/components/PopupDetailProduct'
import PopupDetail from './components/PopupDetail'
import { useDeliveryReceipCombobox } from './hooks/useDeliveryReceipCombobox'
import { useDeliveryReceiptFilterbar } from './hooks/useDeliveryReceiptFilterbar'
import { useDeliveryReceiptList } from './hooks/useDeliveryReceiptList'

const initialState = {
  keySearch: '',
  keySearchCode: '',
  keySearchClient: '',
  idBranch: null,
  idDelivery: null,
  idCustomer: null,
  refreshing: false,
  valueDate: { startDate: null, endDate: null },
}
const DeliveryReceipt = (props) => {
  const dataLang = props.dataLang

  const router = useRouter()

  const isShow = useToast()

  const dataSeting = useSetingServer()

  const { paginate } = usePagination()

  const statusExprired = useStatusExprired()

  const [checkedWare, sCheckedWare] = useState({})

  const [isState, sIsState] = useState(initialState)

  const { handleTab: _HandleSelectTab } = useTab('-1')

  const { isOpen, isKeyState, handleQueryId } = useToggle()

  const { limit, updateLimit: sLimit } = useLimitAndTotalItems()

  const queryState = (key) => sIsState((prev) => ({ ...prev, ...key }))

  const { is_admin: role, permissions_current: auth } = useSelector((state) => state.auth)

  const { checkAdd, checkExport } = useActionRole(auth, 'deliveryReceipt')

  const params = {
    limit: limit,
    search: isState.keySearch,
    page: router.query?.page || 1,
    status: router.query?.tab ? router.query?.tab : -1,
    branch_id: isState.idBranch != null ? isState.idBranch.value : null,
    delivery_id: isState.idDelivery != null ? isState.idDelivery?.value : null,
    customer_id: isState.idCustomer != null ? isState.idCustomer.value : null,
    start_date: isState.valueDate?.startDate != null ? isState.valueDate?.startDate : null,
    end_date: isState.valueDate?.endDate != null ? isState.valueDate?.endDate : null,
  }

  const { data: listBranch = [] } = useBranchList({})

  const { data, isFetching, refetch } = useDeliveryReceiptList(params)

  const { data: listClient = [] } = useClientCombobox(isState.keySearchClient)

  const { data: listDelivery = [] } = useDeliveryReceipCombobox(isState.keySearchCode)

  const { data: dataFilterbar, refetch: refetchFilterBar } = useDeliveryReceiptFilterbar(params)

  const handleSearchApiClient = debounce(async (value) => {
    queryState({ keySearchClient: value })
  }, 500)

  const handleSearchApiOrders = debounce(async (value) => {
    queryState({ keySearchCode: value })
  }, 500)

  const handleOnChangeKeySearch = debounce(({ target: { value } }) => {
    queryState({ keySearch: value })
    router.replace({
      pathname: router.route,
      query: {
        tab: router.query?.tab,
      },
    })
  }, 500)

  const formatMoney = (number) => {
    return formatMoneyConfig(+number, dataSeting)
  }

  const renderMoneyOrDash = (value) => {
    return Number(value) === 0 ? (
      '-'
    ) : (
      <>
        {formatMoney(value)} <span className="underline">đ</span>
      </>
    )
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
          title: `${dataLang?.delivery_receipt_date || 'delivery_receipt_date'}`,
          width: { wpx: 100 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.delivery_receipt_code || 'delivery_receipt_code'}`,
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
          title: `${dataLang?.delivery_receipt_address1 || 'delivery_receipt_address1'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.delivery_receipt_OrderNumber || 'delivery_receipt_OrderNumber'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.delivery_receipt_intoMoney || 'delivery_receipt_intoMoney'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.delivery_receipt_Creator || 'delivery_receipt_Creator'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.delivery_receipt_BrowseStorekeepers || 'delivery_receipt_BrowseStorekeepers'}`,
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
        { value: `${e?.reference_no ? e?.reference_no : ''}` },
        { value: `${e?.name_client ? e?.name_client : ''}` },
        { value: `${e?.name_address_delivery ? e?.name_address_delivery : ''}` },
        { value: `${e?.reference_no_order ? e?.reference_no_order : ''}` },
        { value: `${e?.grand_total ? formatMoney(e?.grand_total) : 0}` },
        { value: `${e?.created_by_full_name ? e?.created_by_full_name : ''}` },
        { value: `${e?.warehouseman_id === '0' ? 'Chưa duyệt kho' : 'Đã duyệt kho'}` },
        { value: `${e?.note ? e?.note : ''}` },
        { value: `${e?.name_branch ? e?.name_branch : ''}` },
      ]),
    },
  ]

  const handleSaveStatus = () => {
    if (isKeyState?.type === 'browser') {
      const checked = isKeyState.value.target.checked
      const warehousemanId = isKeyState.value.target.value
      const dataChecked = {
        checked: checked,
        warehousemanId: warehousemanId,
        id: isKeyState?.id,
        checkedpost: isKeyState?.checkedUn,
      }
      sCheckedWare(dataChecked)
      queryState({ data: [...data?.rResult] })
    }

    handleQueryId({ status: false })
  }

  const _HandleChangeInput = (id, checkedUn, type, value) => {
    handleQueryId({
      status: true,
      initialKey: { id, checkedUn, type, value },
    })
  }

  const _ServerSending = async () => {
    let data = new FormData()
    data.append('warehouseman_id', checkedWare?.checkedpost != '0' ? checkedWare?.checkedpost : '')
    data.append('id', checkedWare?.id)

    try {
      const { isSuccess, message, alert_type } = await apiDeliveryReceipt.apiHandingWarehouse(data)

      if (isSuccess) {
        isShow(alert_type, dataLang[message] || message)
        queryState({ refreshing: true })
        await refetch()
        await refetchFilterBar()
        queryState({ refreshing: false })
      } else {
        isShow(alert_type, dataLang[message] || message)
      }
      queryState({ onSending: false })
    } catch (error) {
      throw error
    }
  }

  useEffect(() => {
    isState.onSending && _ServerSending()
  }, [isState.onSending])

  useEffect(() => {
    checkedWare.id != null && queryState({ onSending: true })
  }, [checkedWare])

  useEffect(() => {
    checkedWare.id != null && queryState({ onSending: true })
  }, [checkedWare.id != null])

  // breadcrumb
  const breadcrumbItems = [
    {
      label: `${dataLang?.returnSales_title || 'returnSales_title'}`,
      // href: "/",
    },
    {
      label: `${dataLang?.delivery_receipt_list || 'delivery_receipt_list'}`,
    },
  ]

  return (
    <React.Fragment>
      <LayOutTableDynamic
        head={
          <Head>
            <title>{dataLang?.delivery_receipt_list || 'delivery_receipt_list'} </title>
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
              {dataLang?.delivery_receipt_list || 'delivery_receipt_list'}
            </h2>
            <ButtonAddNew
              onClick={() => {
                if (role) {
                  router.push(routerDeliveryReceipt.form)
                } else if (checkAdd) {
                  router.push(routerDeliveryReceipt.form)
                } else {
                  isShow('error', WARNING_STATUS_ROLE)
                }
              }}
              dataLang={dataLang}
            />
          </>
        }
        fillterTab={
          <>
            {dataFilterbar &&
              dataFilterbar?.map((e) => {
                return (
                  <TabFilter
                    key={e?.id}
                    dataLang={dataLang}
                    onClick={_HandleSelectTab.bind(this, `${e?.id}`)}
                    total={e?.count}
                    active={e?.id}
                  >
                    {e?.name}
                  </TabFilter>
                )
              })}
          </>
        }
        table={
          <div className="flex flex-col h-full">
            <div className="w-full items-center flex justify-between gap-2">
              <div className="flex gap-3 items-center w-full">
                <SearchComponent
                  colSpan={1}
                  dataLang={dataLang}
                  placeholder={dataLang?.branch_search}
                  onChange={handleOnChangeKeySearch.bind(this)}
                />
                <DateToDateComponent
                  colSpan={1}
                  value={isState.valueDate}
                  onChange={(e) => queryState({ valueDate: e })}
                />
                <SelectComponent
                  options={[
                    {
                      value: '',
                      label: dataLang?.price_quote_branch || 'price_quote_branch',
                      isDisabled: true,
                    },
                    ...listBranch,
                  ]}
                  onChange={(e) => queryState({ idBranch: e })}
                  value={isState.idBranch}
                  placeholder={dataLang?.price_quote_branch || 'price_quote_branch'}
                  isClearable={true}
                  colSpan={1}
                />
                <SelectComponent
                  options={[
                    {
                      value: '',
                      label: dataLang?.delivery_receipt_code || 'delivery_receipt_code',
                      isDisabled: true,
                    },
                    ...listDelivery,
                  ]}
                  onInputChange={(e) => {
                    handleSearchApiOrders(e)
                  }}
                  onChange={(e) => queryState({ idDelivery: e })}
                  value={isState.idDelivery}
                  placeholder={dataLang?.delivery_receipt_code || 'delivery_receipt_code'}
                  isClearable={true}
                  colSpan={1}
                />
                <SelectComponent
                  options={[
                    {
                      value: '',
                      label: dataLang?.price_quote_customer || 'price_quote_customer',
                      isDisabled: true,
                    },
                    ...listClient,
                  ]}
                  onChange={(e) => queryState({ idCustomer: e })}
                  value={isState.idCustomer}
                  onInputChange={(e) => {
                    handleSearchApiClient(e)
                  }}
                  placeholder={dataLang?.price_quote_customer || 'price_quote_customer'}
                  isClearable={true}
                  colSpan={1}
                />
              </div>
              <div className="col-span-1 xl:col-span-2 lg:col-span-2">
                <div className="flex items-center justify-end gap-2">
                  <OnResetData onClick={refetch.bind(this)} sOnFetching={(e) => {}} />
                  {role == true || checkExport ? (
                    <div className={``}>
                      {data?.rResult?.length > 0 && (
                        <ExcelFileComponent
                          dataLang={dataLang}
                          filename={dataLang?.delivery_receipt_list || 'delivery_receipt_list'}
                          title={'DSPGH'}
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
                </div>
              </div>
            </div>
            <Customscrollbar className="h-full overflow-y-auto">
              {/* className="min:h-[200px] 3xl:h-[82%] 2xl:h-[82%] xl:h-[72%] lg:h-[82%] max:h-[400px] overflow-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100" */}
              <div className="w-full">
                <HeaderTable gridCols={12}>
                  <ColumnTable colSpan={0.5} textAlign={'center'}>
                    {dataLang?.stt || 'stt'}
                  </ColumnTable>
                  <ColumnTable textAlign="left">
                    {dataLang?.delivery_receipt_date || 'delivery_receipt_date'}
                  </ColumnTable>
                  <ColumnTable textAlign="left">
                    {dataLang?.delivery_receipt_code || 'delivery_receipt_code'}
                  </ColumnTable>
                  <ColumnTable textAlign="left" colSpan={1}>
                    {dataLang?.price_quote_customer || 'price_quote_table_customer'}
                  </ColumnTable>
                  <ColumnTable textAlign="left" colSpan={1.5}>
                    {dataLang?.delivery_receipt_address1 || 'delivery_receipt_address1'}
                  </ColumnTable>
                  <ColumnTable textAlign="left">
                    {dataLang?.delivery_receipt_OrderNumber || 'delivery_receipt_OrderNumber'}
                  </ColumnTable>
                  <ColumnTable textAlign="right">
                    {dataLang?.price_quote_into_money || 'price_quote_into_money'}
                  </ColumnTable>
                  <ColumnTable textAlign="left">
                    {dataLang?.delivery_receipt_Creator || 'delivery_receipt_Creator'}
                  </ColumnTable>
                  <ColumnTable textAlign="left">
                    {dataLang?.delivery_receipt_BrowseStorekeepers || 'delivery_receipt_BrowseStorekeepers'}
                  </ColumnTable>
                  <ColumnTable textAlign="left">{dataLang?.price_quote_note || 'price_quote_note'}</ColumnTable>
                  <ColumnTable textAlign="left">{dataLang?.price_quote_branch || 'price_quote_branch'}</ColumnTable>
                  <ColumnTable textAlign="center">
                    {dataLang?.price_quote_operations || 'price_quote_operations'}
                  </ColumnTable>
                </HeaderTable>
                {isFetching && !isState.refreshing ? (
                  <Loading className="h-80" color="#0f4f9e" />
                ) : data?.rResult?.length > 0 ? (
                  <>
                    <div className="divide-y divide-slate-200 min:h-[400px] h-[100%] max:h-[800px] ">
                      {data?.rResult?.map((e, index) => (
                        <RowTable key={e?.id} gridCols={12}>
                          <RowItemTable colSpan={0.5} textAlign={'center'}>
                            {index + 1}
                          </RowItemTable>
                          <RowItemTable colSpan={1} textAlign="left">
                            {e?.date != null ? formatMoment(e?.date, FORMAT_MOMENT.DATE_SLASH_LONG) : ''}
                          </RowItemTable>
                          <RowItemTable colSpan={1}>
                            <PopupDetail
                              dataLang={dataLang}
                              className=" transition-all text-[#0F4F9E] hover:text-blue-600 ease-linear  cursor-pointer" // className="text-left"
                              name={e?.reference_no}
                              id={e?.id}
                            />
                          </RowItemTable>
                          <RowItemTable colSpan={1} textAlign={'left'}>
                            {e.name_client}
                          </RowItemTable>

                          <RowItemTable colSpan={1.5} textAlign={'left'}>
                            {e.name_address_delivery}
                          </RowItemTable>
                          <RowItemTable>
                            <PopupDetailProduct
                              dataLang={dataLang}
                              className="text-left"
                              name={
                                <h1 className=" transition-all text-[#0F4F9E] hover:text-blue-600 ease-linear  cursor-pointer">
                                  {e?.reference_no_order}
                                </h1>
                              }
                              id={e?.order_id}
                            />
                          </RowItemTable>
                          <RowItemTable colSpan={1} textAlign={'right'}>
                            {renderMoneyOrDash(e.grand_total)}
                          </RowItemTable>
                          <RowItemTable colSpan={1} textAlign={'left'} className="flex items-center space-x-1">
                            {/* <div className="relative">
                                                                <ModalImage
                                                                    small={e?.created_by_profile_image ? e?.created_by_profile_image : "/user-placeholder.jpg"}
                                                                    large={e?.created_by_profile_image ? e?.created_by_profile_image : "/user-placeholder.jpg"}
                                                                    className="object-cover w-6 h-6 rounded-full "
                                                                >
                                                                    <div className="">
                                                                        <ImageErrors
                                                                            src={e?.created_by_profile_image}
                                                                            width={25}
                                                                            height={25}
                                                                            defaultSrc="/user-placeholder.jpg"
                                                                            alt="Image"
                                                                            className="object-cover min-w-6 max-w-6 min-h-6 max-h-6 h-6 w-6  rounded-[100%] text-left cursor-pointer"
                                                                        />
                                                                    </div>
                                                                </ModalImage>
                                                                <span className="h-2 w-2 absolute 3xl:bottom-full 3xl:translate-y-[150%] 3xl:left-1/2  3xl:translate-x-[100%] 2xl:bottom-[80%] 2xl:translate-y-full 2xl:left-1/2 bottom-[50%] left-1/2 translate-x-full translate-y-full">
                                                                    <span className="relative inline-flex w-2 h-2 rounded-full bg-lime-500">
                                                                        <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-lime-400"></span>
                                                                    </span>
                                                                </span>
                                                            </div>
                                                            <h6 className="capitalize">{e?.created_by_full_name}</h6> */}
                            <CustomAvatar
                              data={e}
                              fullName={e?.created_by_full_name}
                              profileImage={e?.created_by_profile_image}
                            />
                          </RowItemTable>

                          <RowItemTable colSpan={1}>
                            <ButtonWarehouse
                              warehouseman_id={e?.warehouseman_id}
                              _HandleChangeInput={_HandleChangeInput}
                              id={e?.id}
                            />
                          </RowItemTable>

                          <RowItemTable colSpan={1} textAlign={'left'}>
                            {e?.note}
                          </RowItemTable>
                          <RowItemTable colSpan={1}>
                            {/* <TagBranch> */}
                            {e?.name_branch}
                            {/* </TagBranch> */}
                          </RowItemTable>
                          <RowItemTable colSpan={1} className="flex items-center justify-center ">
                            <BtnAction
                              onRefresh={refetch.bind(this)}
                              onRefreshGroup={refetchFilterBar.bind(this)}
                              dataLang={dataLang}
                              warehouseman_id={e?.warehouseman_id}
                              id={e?.id}
                              type="deliveryReceipt"
                              className="bg-slate-100 flex items-center xl:px-4 px-2 xl:py-1.5 py-1 rounded 2xl:!text-sm xl:!text-xs !text-[9px]"
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
        showTotal={true}
        total={
          <ContainerTotal>
            <RowItemTable colSpan={2.5} textAlign={'end'} className="px-5">
              {/* {dataLang?.total_outside || "total_outside"} */}
            </RowItemTable>
            <RowItemTable colSpan={0.5} textAlign={'start'}>
              {dataLang?.total_outside || 'total_outside'}
            </RowItemTable>
            <RowItemTable colSpan={0.5} textAlign={'end'} className="whitespace-nowrap">
              {/* {formatMoney(data?.rTotal?.grand_total)} */}
              {renderMoneyOrDash(data?.rTotal?.grand_total)}
            </RowItemTable>
            {/* <div className="flex flex-wrap justify-end col-span-1 gap-2 p-2 text-right">
                            <h3 className="font-normal 3xl:text-base 2xl:text-[12.5px] xl:text-[11px] text-[9px]"></h3>
                        </div> */}
          </ContainerTotal>
        }
        pagination={
          <div className="flex items-center justify-between gap-2">
            {data?.rResult?.length != 0 && (
              <ContainerPagination>
                {/* <TitlePagination dataLang={dataLang} totalItems={data?.output?.iTotalDisplayRecords} /> */}
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
      />
      <PopupConfim
        dataLang={dataLang}
        type="warning"
        nameModel={'deliveryReceipt'}
        title={TITLE_STATUS}
        subtitle={CONFIRMATION_OF_CHANGES}
        isOpen={isOpen}
        save={handleSaveStatus}
        cancel={() => handleQueryId({ status: false })}
      />
    </React.Fragment>
  )
}

export default DeliveryReceipt
