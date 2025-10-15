import apiImport from '@/Api/apiPurchaseOrder/apiImport'
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
import PopupDetailThere from '@/containers/purchase-order/components/PopupDetailThere'
import { useSupplierList } from '@/containers/suppliers/supplier/hooks/useSupplierList'
import { useBranchList } from '@/hooks/common/useBranch'
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
import formatNumberConfig from '@/utils/helpers/formatnumber'
import { useMutation } from '@tanstack/react-query'
import { Grid6 } from 'iconsax-react'
import { debounce } from 'lodash'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import { useSelector } from 'react-redux'
import { routerImport } from 'routers/buyImportGoods'
import PopupDetail from './components/popup'
import { useImportCombobox } from './hooks/useImportCombobox'
import { useImportFilterbar } from './hooks/useImportFilterbar'
import { useImportList } from './hooks/useImportList'

const initalState = {
  onFetching: false,
  onSending: false,
  keySearch: '',
  keySearchCode: '',
  valueBr: null,
  valueCode: null,
  valueSupplier: null,
  valueDate: { startDate: null, endDate: null },
  dataExport: [],
  refreshing: false,
}
const PurchaseImport = (props) => {
  const dataLang = props.dataLang
  // console.log("🚀 ~ PurchaseImport ~ dataLang:", dataLang)

  const router = useRouter()

  const isShow = useToast()

  const { paginate } = usePagination()

  const dataSeting = useSetingServer()

  const statusExprired = useStatusExprired()

  const [checkedWare, sCheckedWare] = useState({})

  const { handleTab: _HandleSelectTab } = useTab('all')

  const [isState, sIsState] = useState(initalState)

  const { isOpen, isKeyState, handleQueryId } = useToggle()

  const queryState = (key) => sIsState((prev) => ({ ...prev, ...key }))

  const { limit, updateLimit: sLimit } = useLimitAndTotalItems()

  const { is_admin: role, permissions_current: auth } = useSelector((state) => state.auth)

  const { checkAdd, checkExport } = useActionRole(auth, 'import')

  const params = {
    search: isState.keySearch,
    limit: limit,
    page: router.query?.page || 1,
    'filter[status_bar]': router.query?.tab ?? null,
    'filter[id]': isState.valueCode != null ? isState.valueCode?.value : null,
    'filter[branch_id]': isState.valueBr != null ? isState.valueBr.value : null,
    'filter[supplier_id]': isState.valueSupplier ? isState.valueSupplier.value : null,
    'filter[start_date]': isState.valueDate?.startDate != null ? isState.valueDate?.startDate : null,
    'filter[end_date]': isState.valueDate?.endDate != null ? isState.valueDate?.endDate : null,
  }

  const newParam = { ...params, limit: 0, 'filter[status_bar]': undefined }

  const { data: dataSupplier } = useSupplierList()

  const { data: listBranch = [] } = useBranchList()

  const { data, isFetching, refetch } = useImportList(params)

  const { data: listCode = [] } = useImportCombobox(isState.keySearchCode)

  const { data: dataFilterBar, refetch: refetchFilterBar } = useImportFilterbar(newParam)

  const listSupplier = dataSupplier?.rResult?.map((e) => ({ label: e.name, value: e.id })) || []

  const _HandleSeachApi = debounce(async (inputValue) => {
    queryState({ keySearchCode: inputValue })
  }, 500)

  const formatNumber = (number) => {
    return formatNumberConfig(+number, dataSeting)
  }

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

  const _HandleOnChangeKeySearch = debounce(({ target: { value } }) => {
    queryState({ keySearch: value })
    router.replace({
      pathname: router.route,
      query: {
        tab: router.query?.tab,
      },
    })
  }, 500)

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
          title: `${dataLang?.import_day_vouchers || 'import_day_vouchers'}`,
          width: { wpx: 100 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.import_code_vouchers || 'import_code_vouchers'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.import_supplier || 'import_supplier'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.import_the_order || 'import_the_order'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.import_total_amount || 'import_total_amount'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.import_tax_money || 'import_tax_money'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.import_into_money || 'import_into_money'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.import_payment_status || 'import_payment_status'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.import_brow_storekeepers || 'import_brow_storekeepers'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.import_branch || 'import_branch'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.import_from_note || 'import_from_note'}`,
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
        { value: `${e?.supplier_name ? e?.supplier_name : ''}` },
        {
          value: `${e?.purchase_order_code ? e?.purchase_order_code : ''}`,
        },
        {
          value: `${e?.total_price ? formatMoney(e?.total_price) : ''}`,
        },
        {
          value: `${e?.total_tax_price ? formatMoney(e?.total_tax_price) : ''}`,
        },
        {
          value: `${e?.total_amount ? formatMoney(e?.total_amount) : ''}`,
        },
        {
          value: `${
            e?.status === '0'
              ? 'Chưa thanh toán'
              : '' || e?.status === '1'
              ? 'Thanh toán 1 phần'
              : '' || e?.status === '2'
              ? 'Thanh toán đủ'
              : ''
          }`,
        },
        {
          value: `${e?.warehouseman_id === '0' ? 'Chưa duyệt kho' : 'Đã duyệt kho'}`,
        },
        { value: `${e?.branch_name ? e?.branch_name : ''}` },
        { value: `${e?.note ? e?.note : ''}` },
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
    }
    handleQueryId({ status: false })
  }

  const _HandleChangeInput = (id, checkedUn, type, value) => {
    handleQueryId({
      status: true,
      initialKey: { id, checkedUn, type, value },
    })
  }

  const handingStatus = useMutation({
    mutationFn: (data) => {
      return apiImport.apiHandingStatus(data)
    },
  })

  const _ServerSending = () => {
    let data = new FormData()
    data.append('warehouseman_id', checkedWare?.checkedpost != '0' ? checkedWare?.checkedpost : '')
    data.append('id', checkedWare?.id)
    handingStatus.mutate(data, {
      onSuccess: async ({ isSuccess, message, data_export }) => {
        if (isSuccess) {
          isShow('success', `${dataLang[message] || message}`)
          queryState({ refreshing: true })
          await refetch()
          await refetchFilterBar()
          queryState({ refreshing: false })
        } else {
          isShow('error', `${dataLang[message] || message}`)
        }
        if (data_export?.length > 0) {
          queryState({ dataExport: data_export })
        }
      },
    })
    queryState({ onSending: false })
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

  const breadcrumbItems = [
    {
      label: `${dataLang?.import_title || 'import_title'}`,
      // href: "/",
    },
    {
      label: `${dataLang?.import_list || 'import_list'}`,
    },
  ]

  return (
    <React.Fragment>
      <LayOutTableDynamic
        head={
          <Head>
            <title>{dataLang?.import_title || 'import_title'} </title>
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
              {dataLang?.import_list || 'import_list'}
            </h2>
            <ButtonAddNew
              onClick={() => {
                if (role) {
                  router.push(routerImport.form)
                } else if (checkAdd) {
                  router.push(routerImport.form)
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
            {dataFilterBar &&
              dataFilterBar?.map((e) => {
                return (
                  <div key={e?.id}>
                    <TabFilter
                      backgroundColor="#e2f0fe"
                      dataLang={dataLang}
                      key={e?.id}
                      onClick={_HandleSelectTab.bind(this, `${e?.id}`)}
                      total={e?.count}
                      active={e?.id}
                      className={'text-[#0F4F9E] '}
                    >
                      {dataLang[e?.name] || e?.name}
                    </TabFilter>
                  </div>
                )
              })}
          </>
        }
        table={
          <div className="flex flex-col h-full">
            <div className="w-full items-center flex justify-between gap-2">
              {/* <div className="flex gap-3 items-center w-full"> */}
              <div className="flex gap-3 items-center w-full">
                <SearchComponent
                  colSpan={1}
                  dataLang={dataLang}
                  // placeholder={dataLang?.search_production_order_code}
                  onChange={_HandleOnChangeKeySearch.bind(this)}
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
                      label: dataLang?.purchase_order_branch || 'purchase_order_branch',
                      isDisabled: true,
                    },
                    ...listBranch,
                  ]}
                  colSpan={1}
                  onChange={(e) => queryState({ valueBr: e })}
                  value={isState.valueBr}
                  placeholder={dataLang?.purchase_order_table_branch || 'purchase_order_table_branch'}
                  isClearable={true}
                />
                <SelectComponent
                  onInputChange={(event) => {
                    _HandleSeachApi(event)
                  }}
                  options={[
                    {
                      value: '',
                      label: dataLang?.purchase_order_vouchercode || 'purchase_order_vouchercode',
                      isDisabled: true,
                    },
                    ...listCode,
                  ]}
                  onChange={(e) => queryState({ valueCode: e })}
                  value={isState.valueCode}
                  placeholder={dataLang?.purchase_order_table_code || 'purchase_order_table_code'}
                  colSpan={1}
                  isClearable={true}
                  // className="min-w-[200px] rounded-md bg-white 2xl:text-base xl:text-xs text-[10px] z-20"
                />
                <SelectComponent
                  options={[
                    {
                      value: '',
                      label: dataLang?.purchase_order_supplier || 'purchase_order_supplier',
                      isDisabled: true,
                    },
                    ...listSupplier,
                  ]}
                  onChange={(e) => queryState({ valueSupplier: e })}
                  value={isState.valueSupplier}
                  placeholder={dataLang?.purchase_order_table_supplier || 'purchase_order_table_supplier'}
                  colSpan={1}
                  isClearable={true}
                  // className="min-w-[200px] rounded-md bg-white 2xl:text-base xl:text-xs text-[10px] z-20"
                  isSearchable={true}
                />
              </div>
              {/* </div> */}
              {/* <div className="col-span-2"> */}
              <div className="flex items-center gap-2">
                <OnResetData sOnFetching={(e) => {}} onClick={() => refetch()} />
                {role == true || checkExport ? (
                  <div className={``}>
                    {data?.rResult?.length > 0 && (
                      <ExcelFileComponent
                        dataLang={dataLang}
                        filename="Danh sách nhập hàng"
                        title={'SDNH'}
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
                <div>{/* <DropdowLimit sLimit={sLimit} limit={limit} dataLang={dataLang} /> */}</div>
              </div>
              {/* </div> */}
            </div>

            <Customscrollbar className="h-full overflow-y-auto">
              <div className="w-full">
                <HeaderTable gridCols={13}>
                  <ColumnTable colSpan={0.5} textAlign={'center'}>
                    {dataLang?.stt || 'stt'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'left'}>
                    {dataLang?.import_day_vouchers || 'import_day_vouchers'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'left'}>
                    {dataLang?.import_code_vouchers || 'import_code_vouchers'}
                  </ColumnTable>
                  <ColumnTable colSpan={2} textAlign={'left'}>
                    {dataLang?.import_supplier || 'import_supplier'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'left'}>
                    {dataLang?.import_the_order || 'import_the_order'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'right'}>
                    {dataLang?.import_total_amount || 'import_total_amount'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'right'}>
                    {dataLang?.import_tax_money || 'import_tax_money'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'right'}>
                    {dataLang?.import_into_money || 'import_into_money'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'center'}>
                    {dataLang?.import_payment_status || 'import_payment_status'}
                  </ColumnTable>
                  <ColumnTable colSpan={1.5} textAlign={'left'}>
                    {dataLang?.import_brow_storekeepers || 'import_brow_storekeepers'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'left'}>
                    {dataLang?.import_branch || 'import_branch'}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={'left'}>
                    {dataLang?.import_action || 'import_action'}
                  </ColumnTable>
                </HeaderTable>
                {isFetching && !isState.refreshing ? (
                  <Loading className="h-80" color="#0f4f9e" />
                ) : data?.rResult?.length > 0 ? (
                  <>
                    <div className="divide-y divide-slate-200 min:h-[400px] h-[100%] max:h-[800px]">
                      {data?.rResult?.map((e, index) => (
                        <RowTable gridCols={13} key={e.id.toString()}>
                          <RowItemTable colSpan={0.5} textAlign={'center'}>
                            {index + 1}
                          </RowItemTable>
                          <RowItemTable colSpan={1} textAlign={'left'}>
                            {e?.date != null ? formatMoment(e?.date, FORMAT_MOMENT.DATE_SLASH_LONG) : ''}
                          </RowItemTable>
                          <RowItemTable colSpan={1} textAlign={'left'}>
                            <PopupDetail
                              dataLang={dataLang}
                              className="responsive-text-sm font-semibold text-center text-[#003DA0] hover:text-blue-600 transition-all ease-linear cursor-pointer "
                              name={e?.code}
                              id={e?.id}
                            />
                          </RowItemTable>
                          <RowItemTable colSpan={2} textAlign={'left'}>
                            {e.supplier_name}
                          </RowItemTable>
                          <RowItemTable colSpan={1} textAlign={'left'}>
                            {e?.purchase_order_code && (
                              <PopupDetailThere
                                className="responsive-text-sm font-semibold text-center text-[#003DA0] hover:text-blue-600 transition-all ease-linear cursor-pointer "
                                name={e?.purchase_order_code}
                                dataLang={dataLang}
                                id={e?.purchase_order_id}
                                type={'typePo'}
                              ></PopupDetailThere>
                            )}
                          </RowItemTable>
                          <RowItemTable colSpan={1} textAlign={'right'}>
                            {formatMoney(e.total_price)} <span className="underline">đ</span>
                          </RowItemTable>
                          <RowItemTable colSpan={1} textAlign={'right'}>
                            {renderMoneyOrDash(e.total_tax_price)}
                          </RowItemTable>
                          <RowItemTable colSpan={1} textAlign={'right'}>
                            {formatMoney(e.total_amount)} <span className="underline">đ</span>
                          </RowItemTable>
                          <RowItemTable colSpan={1} className="flex items-center mx-auto w-fit">
                            {(e?.status_pay === 'not_spent' && <TagColorSky name={'Chưa chi'} />) ||
                              (e?.status_pay === 'spent_part' && (
                                <TagColorOrange name={`Chi 1 phần (${formatMoney(e?.amount_paid)})`} />
                              )) ||
                              (e?.status_pay === 'spent' && <TagColorLime name={'Đã chi đủ'} />)}
                          </RowItemTable>
                          <RowItemTable colSpan={1.5} className="cursor-pointer">
                            <ButtonWarehouse
                              warehouseman_id={e?.warehouseman_id}
                              _HandleChangeInput={_HandleChangeInput}
                              id={e?.id}
                            />
                          </RowItemTable>
                          <RowItemTable colSpan={1}>
                            {/* <TagBranch className="w-fit"> */}
                            {e?.branch_name}
                            {/* </TagBranch> */}
                          </RowItemTable>
                          <RowItemTable colSpan={1} className="flex">
                            <BtnAction
                              onRefresh={refetch.bind(this)}
                              onRefreshGroup={refetchFilterBar.bind(this)}
                              dataLang={dataLang}
                              warehouseman_id={e?.warehouseman_id}
                              status_pay={e?.status_pay}
                              id={e?.id}
                              type="import"
                              className="bg-slate-100 xl:px-4 px-2 xl:py-1.5 py-1 rounded 2xl:text-base xl:text-xs text-[9px]"
                            />
                          </RowItemTable>
                        </RowTable>
                      ))}
                    </div>
                  </>
                ) : (
                  <NoData type="table" />
                )}
              </div>
            </Customscrollbar>
          </div>
        }
        showTotal={true}
        total={
          <>
            <ContainerTotal className={'!grid-cols-26'}>
              <RowItemTable colSpan={4.5} textAlign={'end'} className="px-5">
                {/* {dataLang?.import_total || "import_total"} */}
              </RowItemTable>
              <RowItemTable colSpan={1} textAlign={'start'} className="px-2">
                {dataLang?.import_total || 'import_total'}
              </RowItemTable>
              <RowItemTable colSpan={1} textAlign={'right'} className="flex justify-end gap-0.5">
                {renderMoneyOrDash(data?.rTotal?.total_price)}
              </RowItemTable>
              <RowItemTable colSpan={1} textAlign={'right'} className="flex justify-end gap-0.5">
                {renderMoneyOrDash(data?.rTotal?.total_tax_price)}
              </RowItemTable>
              <RowItemTable colSpan={1} textAlign={'right'} className="flex justify-end gap-0.5">
                {renderMoneyOrDash(data?.rTotal?.total_amount)}
              </RowItemTable>
            </ContainerTotal>
          </>
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
                  currentPage={router.query?.page || 1}
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
        nameModel={'import'}
        title={TITLE_STATUS}
        subtitle={CONFIRMATION_OF_CHANGES}
        isOpen={isOpen}
        save={() => handleSaveStatus()}
        cancel={() => handleQueryId({ status: false })}
      />
    </React.Fragment>
  )
}

export default PurchaseImport
