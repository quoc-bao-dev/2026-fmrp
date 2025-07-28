import ButtonAnimationNew from '@/components/common/button/ButtonAnimationNew'
import LimitListDropdown from '@/components/common/dropdown/LimitListDropdown'
import ExcelFileComponent from '@/components/common/excel/ExcelFileComponent'
import AnimatedSearchInput from '@/components/common/search/AnimatedSearchInput'
import ArrowCounterClockwiseIcon from '@/components/icons/common/ArrowCounterClockwiseIcon'
import Loading from '@/components/UI/loading/loading'
import NoData from '@/components/UI/noData/nodata'
import { StateContext } from '@/context/_state/productions-orders/StateContext'
import useFeature from '@/hooks/useConfigFeature'
import useSetingServer from '@/hooks/useConfigNumber'
import React, { useCallback, useContext, useMemo, useState } from 'react'
import { PiCaretDownBold, PiTable } from 'react-icons/pi'
import ModalImage from 'react-modal-image'
import { useDebounce } from 'use-debounce'
import formatNumberConfig from '@/utils/helpers/formatnumber'
import TabSwitcherWithSlidingBackground from '@/components/common/tab/TabSwitcherWithSlidingBackground'
import { useMaterialOutput } from '@/managers/api/productions-order/useMaterialOutput'
import { TagColorProductNew } from '@/components/common/tag/TagStatusNew'
import StackedBarChart from '../ui/StackedBarChart'

const tabs = [
  { id: 'dashboard', name: 'Biểu đồ thống kê' },
  { id: 'table', name: 'Danh sách dữ liệu' },
]

const dataChartFake = [
  {
    type_products: 'semi_products',
    type_item: 'product',
    item_id: '84',
    item_variation_option_value_id: '626',
    item_code: 'KHUNGPC',
    item_name: 'Khung đỡ Porsche Cayenne S chính hãng',
    unit_name: 'Cái',
    unit_name_primary: 'Cái',
    quantity_total_quota: '2',
    quantity_quota_primary: '2',
    quota_exchange: '1',
    quantity_exported: 2,
    quantity_rest: 2,
    quantity_recovery: 3,
    images: null,
    product_variation: '(NONE)',
  },
  {
    type_products: 'semi_products_outside',
    type_item: 'product',
    item_id: '85',
    item_variation_option_value_id: '636',
    item_code: 'LOGOPC2023',
    item_name: 'LOGO PORSCHE 2023',
    unit_name: 'Cái',
    unit_name_primary: 'Cái',
    quantity_total_quota: '2',
    quantity_quota_primary: '2',
    quota_exchange: '1',
    quantity_exported: '2.0000',
    quantity_rest: 0,
    quantity_recovery: 0,
    images: null,
    product_variation: '(NONE)',
  },
  {
    type_products: 'materials',
    type_item: 'material',
    item_id: '11116',
    item_variation_option_value_id: '944',
    item_code: 'CU99',
    item_name: 'Đồng 99%',
    unit_name: 'kg',
    unit_name_primary: 'kg',
    quantity_total_quota: '22',
    quantity_quota_primary: '22',
    quota_exchange: '1',
    quantity_exported: '22.0000',
    quantity_rest: 0,
    quantity_recovery: 0,
    images: null,
    product_variation: '(NONE)',
  },
  {
    type_products: 'materials',
    type_item: 'material',
    item_id: '11126',
    item_variation_option_value_id: '955',
    item_code: 'Sơn',
    item_name: 'Sơn xe',
    unit_name: 'Lọ',
    unit_name_primary: 'Lọ',
    quantity_total_quota: '20.2',
    quantity_quota_primary: '20.2',
    quota_exchange: '1',
    quantity_exported: '20.2000',
    quantity_rest: 30.2,
    quantity_recovery: 40.2,
    images: null,
    product_variation: '(NONE)',
  },
]

const TabMaterialOutputTab = ({ dataLang, ...props }) => {
  const [isLoadingTable, setIsLoadingTable] = useState(false)
  const [isOpenSearch, setIsOpenSearch] = useState(false)
  const [activeTab, setActiveTab] = useState(tabs[0]) // tab biểu đồ
  const [limit, setLimit] = useState(5)

  const { isStateProvider, queryStateProvider } = useContext(StateContext)

  const [searchMaterialOutput] = useDebounce(
    isStateProvider?.productionsOrders?.searchSheet?.searchMaterialOutput,
    1000
  )

  const {
    data: dataMaterialOutput,
    isLoading: isLoadingMaterialOutput,
    refetch: refetchMaterialOutput,
  } = useMaterialOutput({
    idTabSheet: isStateProvider?.productionsOrders?.isTabSheet?.id,
    poiId: isStateProvider?.productionsOrders?.poiId,
    enabled: !!isStateProvider?.productionsOrders?.poiId && isStateProvider?.productionsOrders?.isTabSheet?.id == 2,
  })

  const { dataProductExpiry, dataProductSerial, dataMaterialExpiry } = useFeature()

  const dataSeting = useSetingServer()

  const formatNumber = useCallback((num) => formatNumberConfig(+num, dataSeting), [dataSeting])

  // toggle click vào ra ô search
  const toggleSearch = () => {
    setIsOpenSearch(!isOpenSearch)
  }

  const onChangeSearch = (e) => {
    queryStateProvider({
      productionsOrders: {
        ...isStateProvider?.productionsOrders,
        searchSheet: {
          ...isStateProvider?.productionsOrders?.searchSheet,
          searchMaterialOutput: e.target.value,
        },
      },
    })
  }

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
          title: 'Nguyên vật liệu',
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: 'Biến thể',
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: 'Mã nguyên vật liệu',
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
        // {
        //     title: `${'Loại'}`,
        //     width: { wch: 40 },
        //     style: {
        //         fill: { fgColor: { rgb: "C7DFFB" } },
        //         font: { bold: true },
        //     },
        // },
        {
          title: `${'Kế hoạch'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${'Đề xuất'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${'Còn lại'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${'Thu hồi'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
      ],
      data: dataMaterialOutput?.map((e, index) => [
        { value: `${e?.item_id ? e.item_id : ''}`, style: { numFmt: '0' } },
        { value: `${e?.item_name ? e?.item_name : ''}` },
        { value: `${e?.product_variation ?? ''}` },
        { value: `${e?.item_code ?? ''}` },
        { value: `${e?.unit_name ?? ''}` },
        { value: `${+e?.quantity_total_quota ? formatNumber(+e?.quantity_total_quota) : '0'}` },
        { value: `${+e?.quantity_exported ? formatNumber(+e?.quantity_exported) : '0'}` },
        { value: `${+e?.quantity_rest ? formatNumber(+e?.quantity_rest) : '0'}` },
        { value: `${+e?.quantity_recovery ? formatNumber(+e?.quantity_recovery) : '0'}` },
      ]),
    },
  ]

  const filteredData = useMemo(() => {
    if (!searchMaterialOutput) return dataMaterialOutput

    const keyword = searchMaterialOutput.toLowerCase()

    return (
      dataMaterialOutput?.filter((item) => {
        const name = item?.item_name?.toLowerCase() || ''
        const code = item?.item_code?.toLowerCase() || ''
        const variation = item?.product_variation?.toLowerCase() || ''
        const reference = item?.reference_no?.toLowerCase() || ''

        return (
          name.includes(keyword) || code.includes(keyword) || variation.includes(keyword) || reference.includes(keyword)
        )
      }) || []
    )
  }, [searchMaterialOutput, dataMaterialOutput])

  return (
    <div className="flex flex-col 3xl:gap-6 gap-4">
      <div className="flex items-center justify-between gap-2">
        <TabSwitcherWithSlidingBackground tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        {activeTab?.id == 'table' && (
          <div className="flex items-center justify-end gap-3">
            <AnimatedSearchInput
              isOpen={isOpenSearch}
              onToggle={toggleSearch}
              value={isStateProvider?.productionsOrders?.searchSheet?.searchMaterialOutput}
              onChange={onChangeSearch}
              placeholder={dataLang?.productions_orders_find_table || 'Tìm kiếm...'}
            />

            <ButtonAnimationNew
              icon={
                <div className="3xl:size-5 size-4">
                  <ArrowCounterClockwiseIcon className="size-full" />
                </div>
              }
              onClick={() => {
                setIsLoadingTable(true)

                refetchMaterialOutput()

                setTimeout(() => {
                  setIsLoadingTable(false)
                }, 500)
              }}
              title="Tải lại"
              className="3xl:h-10 h-9 xl:px-4 px-2 flex items-center gap-2 xl:text-sm text-xs font-normal text-[#0BAA2E] border border-[#0BAA2E] hover:bg-[#EBFEF2] hover:shadow-hover-button rounded-lg"
            />

            {dataMaterialOutput?.length > 0 && (
              <ExcelFileComponent
                dataLang={dataLang}
                filename={'Danh sách dữ liệu thu hồi NVL'}
                multiDataSet={multiDataSet}
                title="DSDL Thu hồi NVL"
              >
                <ButtonAnimationNew
                  icon={
                    <div className="3xl:size-5 size-4">
                      <PiTable className="size-full" />
                    </div>
                  }
                  // onClick={() => {
                  //     handleQueryId({ status: true, id: isStateProvider?.productionsOrders.idDetailProductionOrder });
                  // }}
                  title="Xuất Excel"
                  className="3xl:h-10 h-9 xl:px-4 px-2 flex items-center gap-2 xl:text-sm text-xs font-normal text-[#0375F3] border border-[#0375F3] hover:bg-[#0375F3]/5 hover:shadow-hover-button rounded-lg"
                />
              </ExcelFileComponent>
            )}
          </div>
        )}
      </div>
      {
        activeTab?.id == 'dashboard' && (
          // <>
          //     Hello
          // </>
          <StackedBarChart
            rawData={dataMaterialOutput}
            dataLang={dataLang}
            multiDataSet={multiDataSet}
            isLoadingMaterialOutput={isLoadingMaterialOutput}
          />
        )
        // <StackedBarChart2 rawData={dataChartFake} />
      }
      {activeTab?.id == 'table' && (
        <React.Fragment>
          <div className="grid grid-cols-16 mt-2">
            {/* header */}
            <div className="col-span-16 grid grid-cols-16 gap-2 py-3 border-b">
              <h4 className="text-xs-default text-center text-[#9295A4] font-semibold col-span-1 px-1">STT</h4>

              <h4 className="text-xs-default text-start text-[#9295A4] font-semibold col-span-3 px-1">
                Nguyên vật liệu
              </h4>

              <h4 className="text-xs-default text-start text-[#9295A4] font-semibold col-span-1 px-1">ĐVT</h4>

              <h4 className="text-xs-default text-start text-[#9295A4] font-semibold col-span-3 px-1">Loại</h4>

              <h4 className="text-xs-default text-center text-[#9295A4] font-semibold block col-span-2 px-1">
                Kế hoạch
              </h4>

              <h4 className="text-xs-default text-center text-[#9295A4] font-semibold block col-span-2 px-1">
                Đề xuất
              </h4>

              <h4 className="text-xs-default text-center text-[#9295A4] font-semibold block col-span-2 px-1">
                Còn lại
              </h4>

              <h4 className="text-xs-default text-center text-[#9295A4] font-semibold block col-span-2 px-1">
                Thu hồi
              </h4>
            </div>

            <div className="col-span-16 grid grid-cols-16 min-h-[240px]">
              {isLoadingMaterialOutput || isLoadingTable ? (
                <Loading className="3xl:h-full 2xl:h-full xl:h-full h-full col-span-16" />
              ) : filteredData && filteredData?.length > 0 ? (
                filteredData?.slice(0, limit)?.map((product, index) => (
                  <div
                    key={`product-${index}`}
                    // onClick={() => handleShowModel(product)}
                    className={`${
                      filteredData?.slice(0, limit)?.length - 1 !== index ? 'border-[#F3F3F4]' : 'border-transparent'
                    } border-b col-span-16 grid grid-cols-16 gap-2 items-start group hover:bg-gray-100 cursor-pointer transition-all duration-150 ease-in-out`}
                  >
                    <h4 className="col-span-1 flex items-center justify-center size-full text-center text-[#141522] font-semibold text-sm-default uppercase 3xl:py-4 py-2 px-1">
                      {index + 1 ?? '-'}
                    </h4>

                    <h4 className="col-span-3 flex items-center justify-center size-full text-[#344054] font-normal gap-2 3xl:py-4 py-2 px-1">
                      <div className="flex items-start justify-start w-full gap-2">
                        <ModalImage
                          small={
                            product?.images && product?.images !== '' ? product?.images : '/icon/default/default.png'
                          }
                          large={
                            product?.images && product?.images !== '' ? product?.images : '/icon/default/default.png'
                          }
                          width={200}
                          height={200}
                          alt={product?.item_name ?? 'image'}
                          className={`3xl:size-10 3xl:min-w-10 size-8 min-w-8 text-xs-default object-cover rounded-md shrink-0`}
                        />

                        <div className="flex flex-col 3xl:gap-1 gap-0.5">
                          <p className={`font-semibold text-sm-default text-[#141522] group-hover:text-[#0F4F9E]`}>
                            {product?.item_name ?? ''}
                          </p>

                          <p className="text-[#667085] font-normal xl:text-[10px] text-[8px]">
                            {product?.product_variation ?? ''}
                          </p>

                          <p className="text-[#3276FA] font-normal 3xl:text-sm xl:text-xs text-[10px]">
                            {product?.item_code ?? ''}
                          </p>
                        </div>
                      </div>
                    </h4>

                    <h4 className="col-span-1 flex items-center justify-start size-full text-start text-[#141522] font-semibold text-sm-default 3xl:py-4 py-2 px-1">
                      {product?.unit_name ?? '-'}
                    </h4>

                    <h4 className="col-span-3 flex flex-col justify-center size-full gap-1 text-[#141522] 3xl:py-4 py-2 px-1">
                      <TagColorProductNew
                        dataKey={
                          product?.type_products === 'products'
                            ? 0
                            : product?.type_products === 'semi_products'
                            ? 1
                            : product?.type_products === 'out_side'
                            ? 2
                            : product?.type_products === 'materials'
                            ? 3
                            : product?.type_products === 'semi_products_outside'
                            ? 4
                            : null
                        }
                        className={'!px-2 !py-1 !rounded-[4px] !font-normal 3xl:text-sm xl:text-xs text-[13px]'}
                        dataLang={dataLang}
                        name={product?.type_products}
                      />
                    </h4>

                    <h4
                      className={`col-span-2 flex items-center justify-center size-full text-center text-[#141522] font-semibold text-sm-default 3xl:py-4 py-2 px-1`}
                    >
                      {+product?.quantity_total_quota > 0 ? formatNumber(+product?.quantity_total_quota) : '-'}
                    </h4>

                    <h4
                      className={`col-span-2 flex items-center justify-center size-full text-[#141522] font-semibold text-sm-default 3xl:py-4 py-2 px-1`}
                    >
                      {+product?.quantity_exported > 0 ? formatNumber(+product?.quantity_exported) : '-'}
                    </h4>

                    <h4
                      className={`col-span-2 flex items-center justify-center size-full text-[#141522] font-semibold text-sm-default 3xl:py-4 py-2 px-1`}
                    >
                      {+product?.quantity_rest > 0 ? formatNumber(+product?.quantity_rest) : '-'}
                    </h4>

                    <h4
                      className={`col-span-2 flex items-center justify-center size-full text-[#141522] font-semibold text-sm-default 3xl:py-4 py-2 px-1`}
                    >
                      {+product?.quantity_recovery > 0 ? formatNumber(+product?.quantity_recovery) : '-'}
                    </h4>
                  </div>
                ))
              ) : (
                <NoData className="mt-0 col-span-16" type="table" />
              )}
            </div>

            {/* load more click */}
            {filteredData?.length > 0 && !isLoadingTable && (
              <div className="col-span-16 flex item justify-between">
                <div />
                {
                  // (dataMaterialOutputi?.length || 0) > (visibleProducts["info"] || 4) && (
                  limit < filteredData.length && (
                    <div className=" flex justify-center py-2">
                      <button
                        onClick={() => setLimit(filteredData.length)}
                        className="flex items-center gap-2 text-[#667085] 3xl:text-base xl:text-sm text-xs hover:underline"
                      >
                        <div className="space-x-2">
                          <span>Xem Thêm</span>
                          <span>({filteredData.length - limit})</span>
                          <span>Nguyên Vật Liệu</span>
                        </div>
                        <PiCaretDownBold className="3xl:size-5 size-4" />
                      </button>
                    </div>
                  )
                }

                <LimitListDropdown
                  limit={limit}
                  sLimit={(value) => setLimit(value)}
                  dataLang={{ display: 'Hiển thị', on: 'trên', lsx: 'BTP' }}
                  total={filteredData.length}
                />
              </div>
            )}
          </div>
        </React.Fragment>
      )}
    </div>
  )
}

export default TabMaterialOutputTab
