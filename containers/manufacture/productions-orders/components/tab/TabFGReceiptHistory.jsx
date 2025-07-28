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
import { useMaterialReturn } from '@/managers/api/productions-order/useMaterialReturn'
import React, { useCallback, useContext, useMemo, useState } from 'react'
import { PiCaretDownBold, PiTable } from 'react-icons/pi'
import ModalImage from 'react-modal-image'
import { useDebounce } from 'use-debounce'
import formatNumberConfig from '@/utils/helpers/formatnumber'
import moment from 'moment/moment'
import { formatMoment } from '@/utils/helpers/formatMoment'
import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate'
import { useFGReceiptHistory } from '@/managers/api/productions-order/useFGReceiptHistory'

const TabFGReceiptHistory = ({ dataLang, ...props }) => {
  const [isLoadingTable, setIsLoadingTable] = useState(false)
  const [isOpenSearch, setIsOpenSearch] = useState(false)
  const { isStateProvider, queryStateProvider } = useContext(StateContext)

  const [searchFgReceiptHistory] = useDebounce(
    isStateProvider?.productionsOrders?.searchSheet?.searchFgReceiptHistory,
    1000
  )

  const {
    data: dataFGReceiptHistory,
    isLoading: isLoadingFGReceiptHistory,
    refetch: refetchFGReceiptHistory,
    isRefetching: iisRefetchingFGReceiptHistory,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useFGReceiptHistory({
    idTabSheet: isStateProvider?.productionsOrders?.isTabSheet?.id,
    poiId: isStateProvider?.productionsOrders?.poiId,
    enabled: !!isStateProvider?.productionsOrders?.poiId && isStateProvider?.productionsOrders?.isTabSheet?.id == 4,
    isSearch: searchFgReceiptHistory,
    limit: isStateProvider?.productionsOrders?.limitSheet?.limitFGReceiptHistory,
  })

  const flagFGReceiptHistory = useMemo(
    () => (dataFGReceiptHistory ? dataFGReceiptHistory?.pages?.flatMap((page) => page.rResult) : []),
    [dataFGReceiptHistory]
  )

  const totalDataCountFGReceiptHistory = dataFGReceiptHistory?.pages?.[0]?.output?.iTotalRecords || 0

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
          searchFgReceiptHistory: e.target.value,
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
          title: 'Ngày CT',
          width: { wch: 4 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${'Phiếu nhập'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${'Nguyên vật liệu'}`,
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
        ...[
          dataProductSerial.is_enable === '1' && {
            title: `${'Serial'}`,
            width: { wch: 40 },
            style: {
              fill: { fgColor: { rgb: 'C7DFFB' } },
              font: { bold: true },
            },
          },
          (dataProductExpiry.is_enable === '1' || dataMaterialExpiry.is_enable === '1') && {
            title: `${'Lot'}`,
            width: { wch: 40 },
            style: {
              fill: { fgColor: { rgb: 'C7DFFB' } },
              font: { bold: true },
            },
          },
          (dataProductExpiry.is_enable === '1' || dataMaterialExpiry.is_enable === '1') && {
            title: `${'Date'}`,
            width: { wch: 40 },
            style: {
              fill: { fgColor: { rgb: 'C7DFFB' } },
              font: { bold: true },
            },
          },
        ].filter(Boolean),
        {
          title: `${'Đơn vị tính'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${'Số lượng'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${'Kho hàng'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${'Vị trí kho'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
        {
          title: `${'Ghi chú'}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: 'C7DFFB' } },
            font: { bold: true },
          },
        },
      ],
      data: flagFGReceiptHistory?.map((e, index) => [
        { value: `${e?.id ? e.id : ''}`, style: { numFmt: '0' } },
        { value: `${e?.date ? formatMoment(e.date, FORMAT_MOMENT.DATE_SLASH_LONG) : ''}` },
        { value: `${e?.reference_no ?? ''}` },
        { value: `${e?.item_name ?? ''}` },
        { value: `${e?.variation ?? ''}` },
        ...[
          dataProductSerial.is_enable === '1' && { value: `${e?.serial ?? ''}` },
          (dataProductExpiry.is_enable === '1' || dataMaterialExpiry.is_enable === '1') && { value: `${e?.lot ?? ''}` },
          (dataProductExpiry.is_enable === '1' || dataMaterialExpiry.is_enable === '1') && {
            value: `${e?.expiration_date ? formatMoment(e?.expiration_date, FORMAT_MOMENT.DATE_SLASH_LONG) : ''}`,
          },
        ].filter(Boolean),
        { value: `${e?.unit_name ?? ''}` },
        { value: `${e?.quantity ? formatNumber(e?.quantity) : ''}` },
        { value: `${e?.warehouse?.name ?? ''}` },
        { value: `${e?.location?.name ?? ''}` },
        { value: `${e?.note_item ?? ''}` },
      ]),
    },
  ]

  return (
    <div className="flex flex-col 3xl:gap-6 gap-4">
      <div className="flex items-center justify-end gap-3">
        <AnimatedSearchInput
          isOpen={isOpenSearch}
          onToggle={toggleSearch}
          value={isStateProvider?.productionsOrders?.searchSheet?.searchFgReceiptHistory}
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

            refetchFGReceiptHistory()

            setTimeout(() => {
              setIsLoadingTable(false)
            }, 500)
          }}
          title="Tải lại"
          className="3xl:h-10 h-9 xl:px-4 px-2 flex items-center gap-2 xl:text-sm text-xs font-normal text-[#0BAA2E] border border-[#0BAA2E] hover:bg-[#EBFEF2] hover:shadow-hover-button rounded-lg"
        />

        {flagFGReceiptHistory?.length > 0 && (
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

      <div className="grid grid-cols-16 mt-2">
        {/* header */}
        <div className="col-span-16 grid grid-cols-16 gap-2 py-3 border-b">
          <h4 className="text-xs-default text-center text-[#9295A4] font-semibold col-span-1 px-1">STT</h4>

          <h4 className="text-xs-default text-start text-[#9295A4] font-semibold col-span-2 px-1">Ngày chứng từ</h4>

          <h4 className="text-xs-default text-start text-[#9295A4] font-semibold col-span-2 px-1">Mã chứng từ</h4>

          <h4 className="text-xs-default text-start text-[#9295A4] font-semibold 2xl:col-span-3 col-span-4 px-1">
            Mặt hàng
          </h4>

          <h4 className="text-xs-default text-start text-[#9295A4] font-semibold block 2xl:col-span-2 col-span-3 px-1">
            Kho thành phẩm
          </h4>

          <h4 className="text-xs-default text-center text-[#9295A4] font-semibold block 2xl:col-span-2 col-span-1 px-1">
            SL
          </h4>

          <h4 className="text-xs-default text-center text-[#9295A4] font-semibold block col-span-2 px-1">Kho QC</h4>

          <h4 className="text-xs-default text-center text-[#9295A4] font-semibold block 2xl:col-span-2 col-span-1 px-1">
            SL Lỗi
          </h4>
        </div>

        <div className="col-span-16 grid grid-cols-16 min-h-[240px]">
          {isLoadingFGReceiptHistory || isLoadingTable ? (
            <Loading className="3xl:h-full 2xl:h-full xl:h-full h-full col-span-16" />
          ) : flagFGReceiptHistory && flagFGReceiptHistory?.length > 0 ? (
            flagFGReceiptHistory?.map((product, index) => (
              <div
                key={`product-${index}`}
                // onClick={() => handleShowModel(product)}
                className={`${
                  flagFGReceiptHistory?.length - 1 !== index ? 'border-[#F3F3F4]' : 'border-transparent'
                } border-b col-span-16 grid grid-cols-16 items-start group hover:bg-gray-100 group cursor-pointer custom-transition`}
              >
                <h4 className="col-span-1 flex items-center justify-center text-center h-full text-[#141522] font-semibold text-sm-default uppercase 3xl:py-4 py-2 px-1">
                  {index + 1 ?? '-'}
                </h4>

                <h4 className="col-span-2 flex flex-col justify-center gap-1 h-full text-[#141522] 3xl:py-4 py-2 px-1">
                  <div className="text-sm-default font-semibold">
                    {product?.date ? formatMoment(product?.date, FORMAT_MOMENT.DATE_SLASH_LONG) : '-'}
                  </div>

                  <div className="text-xs-default font-normal">
                    {product?.date ? formatMoment(product?.date, FORMAT_MOMENT.TIME_LONG) : ''}
                  </div>
                </h4>

                <h4
                  className={`${
                    product?.code ? 'text-start' : 'text-center'
                  } flex items-center size-full col-span-2 text-[#141522] font-semibold text-sm-default 3xl:py-4 py-2 px-1`}
                >
                  {product?.code ?? '-'}
                </h4>

                <h4 className="2xl:col-span-3 col-span-4 flex items-center size-full text-[#344054] font-normal gap-2 3xl:py-4 py-2 px-1">
                  <div className="flex items-start justify-start w-full gap-2">
                    <ModalImage
                      small={
                        product?.product?.images && product?.product?.images !== ''
                          ? product?.product?.images
                          : '/icon/default/default.png'
                      }
                      large={
                        product?.product?.images && product?.product?.images !== ''
                          ? product?.product?.images
                          : '/icon/default/default.png'
                      }
                      width={200}
                      height={200}
                      alt={product?.product?.item_name ?? 'image'}
                      className={`3xl:size-10 3xl:min-w-10 size-8 min-w-8 text-xs-default object-cover rounded-md shrink-0`}
                    />

                    <div className="flex flex-col 3xl:gap-1 gap-0.5">
                      <p className={`font-semibold text-sm-default text-[#141522] group-hover:text-[#0F4F9E]`}>
                        {product?.product?.item_name ?? ''}
                      </p>

                      <p className="text-[#667085] font-normal xl:text-[10px] text-[8px]">
                        {product?.product?.variation ?? ''}
                      </p>

                      {/* <p className="text-[#3276FA] font-normal 3xl:text-sm xl:text-xs text-[10px]">
                                                            {product?.product?.item_code ?? ""}
                                                        </p> */}

                      <div className="flex flex-col gap-0.5">
                        {dataProductSerial.is_enable === '1' && (
                          <div className="flex items-center gap-0.5">
                            <h6 className={`3xl:text-xs text-[10px] font-normal text-[#3276FA] uppercase`}>Serial:</h6>
                            <h6 className={`3xl:text-xs text-[10px] font-normal text-[#3276FA] w-full text-left`}>
                              {product?.serial == null || product?.serial == '' ? '-' : product?.serial}
                            </h6>
                          </div>
                        )}
                        {(dataProductExpiry.is_enable === '1' || dataMaterialExpiry.is_enable === '1') && (
                          <>
                            <div className="flex items-center gap-0.5">
                              <h6 className={`3xl:text-xs text-[10px] font-normal text-[#3276FA] uppercase`}>Lot:</h6>{' '}
                              <h6
                                className={`3xl:text-xs text-[10px] font-normal text-[#3276FA] px-2 w-full text-left`}
                              >
                                {product?.lot == null || product?.lot == '' ? '-' : product?.lot}
                              </h6>
                            </div>
                            <div className="flex items-center gap-0.5">
                              <h6 className={`3xl:text-xs text-[10px] font-normal text-[#3276FA] uppercase`}>Date:</h6>{' '}
                              <h6
                                className={`3xl:text-xs text-[10px] font-normal text-[#3276FA] px-2 w-full text-left`}
                              >
                                {product?.expiration_date
                                  ? formatMoment(product?.expiration_date, FORMAT_MOMENT.DATE_SLASH_LONG)
                                  : '-'}
                              </h6>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </h4>

                <h4
                  className={`${
                    product?.warehouse?.name ? 'text-start' : 'text-center'
                  } flex items-center size-full 2xl:col-span-2 col-span-3 text-[#141522] font-semibold text-sm-default 3xl:py-4 py-2 px-1`}
                >
                  {product?.warehouse?.name ?? '-'}
                </h4>

                <h4
                  className={`flex items-center justify-center size-full 2xl:col-span-2 col-span-1 text-center text-[#141522] font-semibold text-sm-default 3xl:py-4 py-2 px-1`}
                >
                  {+product?.quantity > 0 ? formatNumber(+product?.quantity) : '-'}
                </h4>

                <h4
                  className={`${
                    product?.name_warehouse_qc ? 'justify-center' : 'justify-center'
                  } bg-[#FFEEF0] group-hover:bg-[#FFEEF0] flex items-center size-full col-span-2 text-[#141522] font-semibold text-sm-default 3xl:py-4 py-2 px-1 custom-transition`}
                >
                  {product?.name_warehouse_qc && product?.name_warehouse_qc !== '' ? product?.name_warehouse_qc : '-'}
                </h4>

                <h4
                  className={`flex items-center justify-center bg-[#FFEEF0] group-hover:bg-[#FFEEF0] 2xl:col-span-2 col-span-1 size-full text-[#141522] font-semibold text-sm-default 3xl:py-4 py-2 px-1 custom-transition`}
                >
                  {product?.quantity_error > 0 ? product?.quantity_error : '-'}
                </h4>
              </div>
            ))
          ) : (
            <NoData className="mt-0 col-span-16" type="table" />
          )}
        </div>

        {flagFGReceiptHistory?.length > 0 && !isLoadingTable && (
          <div className="col-span-16 flex item justify-between">
            <div />

            {hasNextPage && (
              <div className=" flex justify-center py-2">
                <button
                  onClick={() => {
                    const currentLimit = isStateProvider?.productionsOrders?.limitSheet?.limitFGReceiptHistory || 0
                    const newLimit = Math.min(currentLimit + 5, totalDataCountFGReceiptHistory) // tăng thêm 5, nhưng không vượt quá total

                    queryStateProvider({
                      productionsOrders: {
                        ...isStateProvider.productionsOrders,
                        limitSheet: {
                          ...isStateProvider.productionsOrders.limitSheet,
                          limitFGReceiptHistory: newLimit,
                        },
                      },
                    })
                  }}
                  disabled={isFetchingNextPage}
                  className="flex items-center gap-2 text-[#667085] 3xl:text-base text-sm hover:underline"
                >
                  <span>Xem thêm mặt hàng</span>
                  <PiCaretDownBold className="3xl:size-5 size-4" />
                </button>
              </div>
            )}

            <LimitListDropdown
              limit={isStateProvider?.productionsOrders?.limitSheet?.limitFGReceiptHistory}
              sLimit={(value) => {
                queryStateProvider({
                  productionsOrders: {
                    ...isStateProvider?.productionsOrders,
                    limitSheet: {
                      ...isStateProvider?.productionsOrders?.limitSheet,
                      limitFGReceiptHistory: value,
                    },
                  },
                })
              }}
              dataLang={{ display: 'Hiển thị', on: 'trên', lsx: 'BTP' }}
              total={totalDataCountFGReceiptHistory}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default TabFGReceiptHistory
