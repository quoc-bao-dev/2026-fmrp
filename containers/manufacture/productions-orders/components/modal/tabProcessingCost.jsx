// chi phí nvl
import apiProductionsOrders from '@/Api/apiManufacture/manufacture/productionsOrders/apiProductionsOrders'
import OnResetData from '@/components/UI/btnResetData/btnReset'
import ContainerPagination from '@/components/UI/common/ContainerPagination/ContainerPagination'
import { Customscrollbar } from '@/components/UI/common/Customscrollbar'
import { ColumnTable, HeaderTable, RowItemTable, RowTable } from '@/components/UI/common/Table'
import { ContainerTotal } from '@/components/UI/common/layout'
import ExcelFileComponent from '@/components/UI/filterComponents/excelFilecomponet'
import SearchComponent from '@/components/UI/filterComponents/searchComponent'
import Loading from '@/components/UI/loading/loading'
import NoData from '@/components/UI/noData/nodata'
import Pagination from '@/components/UI/pagination'
import { optionsQuery } from '@/configs/optionsQuery'
import useSetingServer from '@/hooks/useConfigNumber'
import { useLimitAndTotalItems } from '@/hooks/useLimitAndTotalItems'
import usePagination from '@/hooks/usePagination'
import formatNumberConfig from '@/utils/helpers/formatnumber'
import { useQuery } from '@tanstack/react-query'
import { debounce } from 'lodash'
import { useRouter } from 'next/router'
import { memo, useState } from 'react'
import ModalImage from 'react-modal-image'
import { useSelector } from 'react-redux'
import { v4 as uddid } from 'uuid'

const initialState = {
  onFetching: false,
  dataTable: [
    {
      id: uddid(),
      image: '/icon/noimagelogo.png',
      name: 'ÁO SƠ MI - S - TRẮNG',
      itemVariation: 'Biến thể 1',
      code: 'SMM',
      unit: 'Cái',
      type: 'materials',
      quantityExport: 500,
      quantityRecall: 500,
      exportCosts: 1000000,
      recoveryCosts: 1000000,
      moneyTone: 2000000,
      //sl gia công
      machiningQuantity: 1000,
      // chi phí gia công
      processingCost: 10000,
    },
  ],
}

const TabProcessingCost = memo(({ isStateModal, width, dataLang, listTab, typePageMoblie }) => {
  const router = useRouter()

  const { paginate } = usePagination()

  const dataSeting = useSetingServer()

  const [isTab, setIsTab] = useState(1)

  const [isSearch, setIsSearch] = useState('')

  const onChangeSearch = debounce((e) => {
    setIsSearch(e.target.value)
  }, 500)

  const [isExportSituation, setIsExportSituation] = useState(initialState)

  const queryStatesetExportSituation = (key) => setIsExportSituation((x) => ({ ...x, ...key }))

  const { is_admin: role, permissions_current: auth } = useSelector((state) => state.auth)

  const { limit, updateLimit: sLimit, updateTotalItems: sTotalItems } = useLimitAndTotalItems()
  // const { checkAdd, checkExport } = useActionRole(auth, "")

  const formatNumber = (num) => formatNumberConfig(+num, dataSeting)

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['api_cost_productions', isSearch, router.query?.page],
    queryFn: async () => {
      let formData = new FormData()

      formData.append('search', isSearch)

      formData.append('page', router.query?.page ?? '')

      formData.append('pod_id', isStateModal?.dataDetail?.poi?.poi_id)

      const { data } = await apiProductionsOrders.apiGetCostProduction(formData)
      return data
    },
    ...optionsQuery,
  })

  const rResultArray = data && Array.isArray(data.rResult) ? data.rResult : []

  const result = rResultArray?.reduce(
    (acc, item) => {
      acc.quantity_import += +item.quantity_import || 0
      acc.quantity_internal += +item.quantity_internal || 0
      acc.amount_import += +item.amount_import || 0
      acc.amount_internal += +item.amount_internal || 0
      acc.amount_final += +item.amount_final || 0
      return acc
    },
    { quantity_import: 0, quantity_internal: 0, amount_import: 0, amount_internal: 0, amount_final: 0 }
  )

  const { quantity_import, quantity_internal, amount_import, amount_internal, amount_final } = result

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
          title: `${'Tên nguyên vật liệu'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${'Biến thể'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${'Đơn vị tính'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${'Số lượng xuất'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${'Số thu hồi'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${'CP xuất NVL'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${'CP thu hồi'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${'Tổng tiền'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
      ],
      data: data?.rResult?.map((e, index) => [
        { value: `${e?.item_id ? e.item_id : ''}`, style: { numFmt: '0' } },
        { value: `${e?.item_name ?? ''}` },
        { value: `${e?.variation ?? ''}` },
        { value: `${e?.unit_name ?? ''}` },
        { value: `${e?.quantity_import ? formatNumber(e?.quantity_import) : ''}` },
        { value: `${e?.quantity_internal ? formatNumber(e?.quantity_internal) : ''}` },
        { value: `${e?.amount_import ? formatNumber(e?.amount_import) : ''}` },
        { value: `${e?.amount_internal ? formatNumber(e?.amount_internal) : ''}` },
        { value: `${e?.amount_final ? formatNumber(e?.amount_final) : ''}` },
      ]),
    },
  ]

  return (
    <div className="h-full">
      <div className="flex items-center justify-between">
        <div className={`${typePageMoblie ? 'hidden' : 'flex'} items-center gap-3`}>
          {/* <h1 className="my-1 text-sm 3xl:text-basse">{listTab[isStateModal.isTab - 1]?.name}</h1> */}
          <div className="relative">
            {/* <select
                            id="select-2"
                            value={isTab}
                            onChange={(value) => {
                                paginate(1)
                                setIsTab(value.target.value)
                            }}
                            className="block w-full px-2 py-1 text-xs border border-teal-500 rounded-lg outline-none focus:border-teal-500 focus:ring-teal-500 disabled:opacity-50 disabled:pointer-events-none text-neutral-500">
                            <option value={1} className='text-sm'>Chi phí NVL xuất sản xuất tại xưởng</option>
                            <option value={2} className='text-sm'>Chi phí NVL xuất gia công ngoài</option>
                            <option value={3} className='text-sm'>Chi phí gia công</option>
                        </select> */}
            <div
              className={` w-full px-2 py-1 block text-sm border border-teal-500 rounded-full outline-none focus:border-teal-500 focus:ring-teal-500 disabled:opacity-50 disabled:pointer-events-none text-neutral-500`}
            >
              Chi phí NVL xuất sản xuất tại xưởng
            </div>
          </div>
        </div>
        <div className={`${typePageMoblie ? 'w-full justify-between' : 'justify-end'} flex items-center gap-1`}>
          <SearchComponent
            colSpan={1}
            sizeIcon={typePageMoblie ? 16 : 20}
            dataLang={dataLang}
            placeholder={dataLang?.branch_search}
            onChange={(e) => onChangeSearch(e)}
            classInput={`border ${typePageMoblie ? ' !pl-7 !py-1.5' : ''}`}
            classNameIcon={`${typePageMoblie ? '!z-[999]' : '!z-[999]'}`}
            classNameBox={`${typePageMoblie ? 'w-1/2' : 'w-[25%]'}`}
          />
          <div className="flex items-center gap-1">
            <OnResetData sOnFetching={(e) => {}} onClick={refetch.bind(this)} />
            {/* <button onClick={() => { }} className={`xl:px-4 px-3 xl:py-2.5 py-1.5 2xl:text-xs xl:text-xs text-[7px] flex items-center space-x-2 bg-[#C7DFFB] rounded hover:scale-105 transition`}>
                            <Grid6 className="scale-75 2xl:scale-100 xl:scale-100" size={18} />
                            <span>{dataLang?.client_list_exportexcel}</span>
                        </button> */}
            {data?.rResult?.length > 0 && (
              <ExcelFileComponent
                dataLang={dataLang}
                filename={'Danh sách dữ liệu chi phí NVL'}
                multiDataSet={multiDataSet}
                title="DSDL chi phí NVL"
              />
            )}
          </div>
          {/* <div>
                            <DropdowLimit sLimit={sLimit} limit={limit} dataLang={dataLang} />
                        </div> */}
        </div>
      </div>
      <Customscrollbar className={`h-[65vh]`}>
        {/* className={`${(width > 1100 ? "3xl:h-[calc(100vh_-_450px)] 2xl:h-[calc(100vh_-_430px)] xl:h-[calc(100vh_-_440px)] h-[calc(100vh_-_455px)]" : '3xl:h-[calc(100vh_-_575px)] 2xl:h-[calc(100vh_-_550px)] xl:h-[calc(100vh_-_530px)] h-[calc(100vh_-_525px)]')
                }  scrollbar-thin scrollbar-thumb-slate-300 bg-white scrollbar-track-slate-100`}> */}
        <div>
          <HeaderTable gridCols={isTab == 1 ? 10 : 9} display={'grid'}>
            <ColumnTable
              colSpan={1}
              textAlign={'center'}
              className={` normal-case ${typePageMoblie ? '!text-[8px]' : '!text-[13px]'}`}
            >
              STT
            </ColumnTable>
            <ColumnTable
              colSpan={3}
              textAlign={'center'}
              className={` normal-case ${typePageMoblie ? '!text-[8px]' : '!text-[13px]'}`}
            >
              {isTab == 1 || isTab == 2 ? 'Tên nguyên vật liệu' : 'Tên thành phẩm'}
            </ColumnTable>
            <ColumnTable
              colSpan={1}
              textAlign={'center'}
              className={` normal-case ${typePageMoblie ? '!text-[8px]' : '!text-[13px]'}`}
            >
              Đơn vị tính
            </ColumnTable>
            <ColumnTable
              colSpan={isTab == 1 ? 1 : 2}
              textAlign={'center'}
              className={` normal-case ${typePageMoblie ? '!text-[8px]' : '!text-[13px]'}`}
            >
              {(isTab == 1 && 'Số lượng xuất') || ((isTab == 2 || isTab == 3) && 'Số lượng gia công')}
            </ColumnTable>
            <ColumnTable
              colSpan={isTab == 1 ? 1 : 2}
              textAlign={'center'}
              className={` normal-case ${typePageMoblie ? '!text-[8px]' : '!text-[13px]'}`}
            >
              {(isTab == 1 && 'Số thu hồi') || (isTab == 2 && 'CP NVL xuất gia công') || (isTab == 3 && 'CP gia công')}
            </ColumnTable>
            {isTab == 1 && (
              <>
                <ColumnTable
                  colSpan={1}
                  textAlign={'center'}
                  className={` normal-case ${typePageMoblie ? '!text-[8px]' : '!text-[13px]'}`}
                >
                  CP xuất NVL
                </ColumnTable>
                <ColumnTable
                  colSpan={1}
                  textAlign={'center'}
                  className={` normal-case ${typePageMoblie ? '!text-[8px]' : '!text-[13px]'}`}
                >
                  CP thu hồi
                </ColumnTable>
                <ColumnTable
                  colSpan={1}
                  textAlign={'center'}
                  className={` normal-case ${typePageMoblie ? '!text-[8px]' : '!text-[13px]'}`}
                >
                  Tổng tiền
                </ColumnTable>
              </>
            )}
          </HeaderTable>
          {isLoading || isRefetching ? (
            <Loading className="h-80" color="#0f4f9e" />
          ) : data?.rResult?.length > 0 ? (
            <div className="divide-y divide-slate-200 min:h-[400px] h-[100%] max:h-[800px]">
              {data?.rResult?.map((e, index) => (
                <RowTable gridCols={isTab == 1 ? 10 : 9} key={`${e?.id?.toString() + '-' + index}`}>
                  <RowItemTable
                    colSpan={1}
                    textAlign={'center'}
                    textSize={`${typePageMoblie ? 'text-[8px]' : '!text-xs'}`}
                  >
                    {index + 1}
                  </RowItemTable>
                  <RowItemTable
                    colSpan={3}
                    textAlign={'left'}
                    className={'flex items-center gap-2'}
                    textSize={`${typePageMoblie ? 'text-[8px]' : '!text-xs'}`}
                  >
                    <ModalImage
                      small={e?.images ? e?.images : '/icon/noimagelogo.png'}
                      large={e?.images ? e?.images : '/icon/noimagelogo.png'}
                      width={36}
                      height={36}
                      alt={e.name}
                      className={`object-cover rounded-md ${
                        typePageMoblie
                          ? 'w-[24px] h-[24px] min-w-[24px] min-h-[24px]'
                          : 'min-w-[36px] min-h-[36px] w-[36px] h-[36px] max-w-[36px] max-h-[36px]'
                      }`}
                    />
                    <div className="flex flex-col">
                      <span className={`${typePageMoblie ? 'text-[8px] leading-tight' : 'text-xs'}`}>
                        {e?.item_name}
                      </span>
                      <div
                        className={`flex items-center gap-1 ${
                          typePageMoblie ? 'text-[6px] leading-tight' : 'text-[11px]'
                        }  italic text-gray-500`}
                      >
                        <span>{e?.item_code}</span>-<span>{e?.variation}</span>
                      </div>
                    </div>
                  </RowItemTable>
                  <RowItemTable
                    colSpan={1}
                    textAlign={'center'}
                    textSize={`${typePageMoblie ? 'text-[8px]' : '!text-xs'}`}
                  >
                    {e?.unit_name}
                  </RowItemTable>
                  <RowItemTable
                    colSpan={isTab == 1 ? 1 : 2}
                    textAlign={'center'}
                    textSize={`${typePageMoblie ? 'text-[8px]' : '!text-xs'}`}
                  >
                    {e?.quantity_import > 0 ? formatNumber(e?.quantity_import) : '-'}
                    {/* {isTab == 1 ? e.quantityExport > 0 ? formatNumber(e.quantityExport) : '-' : e.machiningQuantity > 0 ? formatNumber(e.machiningQuantity) : '-'} */}
                  </RowItemTable>
                  <RowItemTable
                    colSpan={isTab == 1 ? 1 : 2}
                    textAlign={'center'}
                    textSize={`${typePageMoblie ? 'text-[8px]' : '!text-xs'}`}
                  >
                    {e?.quantity_internal > 0 ? formatNumber(e?.quantity_internal) : '-'}
                    {/* {isTab == 1 ? e.quantityRecall > 0 ? formatNumber(e.quantityRecall) : '-' : e.processingCost > 0 ? formatNumber(e.processingCost) : '-'} */}
                  </RowItemTable>
                  {isTab == 1 && (
                    <>
                      <RowItemTable
                        colSpan={1}
                        textAlign={'center'}
                        textSize={`${typePageMoblie ? 'text-[8px]' : '!text-xs'}`}
                      >
                        {e?.amount_import > 0 ? formatNumber(e?.amount_import) : '-'}
                      </RowItemTable>
                      <RowItemTable
                        colSpan={1}
                        textAlign={'center'}
                        textSize={`${typePageMoblie ? 'text-[8px]' : '!text-xs'}`}
                      >
                        {e?.amount_internal > 0 ? formatNumber(e?.amount_internal) : '-'}
                      </RowItemTable>
                      <RowItemTable
                        colSpan={1}
                        textAlign={'center'}
                        textSize={`${typePageMoblie ? 'text-[8px]' : '!text-xs'}`}
                      >
                        {e?.amount_final > 0 ? formatNumber(e?.amount_final) : '-'}
                      </RowItemTable>
                    </>
                  )}
                </RowTable>
              ))}
            </div>
          ) : (
            <NoData />
          )}
        </div>
      </Customscrollbar>
      <ContainerTotal className={`${isTab == 1 ? '!grid-cols-10' : '!grid-cols-9'}`}>
        <ColumnTable colSpan={5} textAlign={'center'} className={`${typePageMoblie ? '' : 'p-2 '}`}>
          {/* {dataLang?.productsWarehouse_total || "productsWarehouse_total"} */}
          Tổng cộng
        </ColumnTable>
        {isTab == 1 && (
          <>
            <ColumnTable
              colSpan={1}
              textAlign={'right'}
              className="flex flex-wrap justify-end gap-2 p-2 mr-1 normal-case"
            >
              {quantity_import > 0 ? formatNumber(quantity_import) : '-'}
            </ColumnTable>
            <ColumnTable
              colSpan={1}
              textAlign={'right'}
              className="flex flex-wrap justify-end gap-2 p-2 mr-1 normal-case"
            >
              {quantity_internal > 0 ? formatNumber(quantity_internal) : '-'}
            </ColumnTable>
            <ColumnTable
              colSpan={1}
              textAlign={'right'}
              className="flex flex-wrap justify-end gap-2 p-2 mr-1 normal-case"
            >
              {amount_import > 0 ? formatNumber(amount_import) : '-'}
            </ColumnTable>
          </>
        )}
        <ColumnTable
          colSpan={isTab == 1 ? 1 : 2}
          textAlign={'right'}
          className="flex flex-wrap justify-end gap-2 p-2 mr-1 normal-case"
        >
          {amount_internal > 0 ? formatNumber(amount_internal) : '-'}
        </ColumnTable>
        <ColumnTable
          colSpan={isTab == 1 ? 1 : 2}
          textAlign={'right'}
          className="flex flex-wrap justify-end gap-2 p-2 mr-1 normal-case"
        >
          {amount_final > 0 ? formatNumber(amount_final) : '-'}
        </ColumnTable>
      </ContainerTotal>
      {/* {isExportSituation.dataTable?.length != 0 && ( */}
      <ContainerPagination>
        {/* <TitlePagination
                    dataLang={dataLang}
                    totalItems={10}
                // totalItems={totalItems?.iTotalDisplayRecords}
                /> */}
        <Pagination
          postsPerPage={limit}
          totalPosts={Number(data?.output?.iTotalDisplayRecords)}
          paginate={paginate}
          currentPage={router.query?.page || 1}
        />
      </ContainerPagination>
      {/* )} */}
    </div>
  )
})

export default TabProcessingCost
