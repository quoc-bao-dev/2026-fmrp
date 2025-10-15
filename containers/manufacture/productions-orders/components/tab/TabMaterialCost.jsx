import React, { useCallback, useContext, useMemo, useState } from 'react'
import { PiCaretDownBold, PiTable } from 'react-icons/pi'
import { useMaterialCost } from '@/managers/api/productions-order/useMaterialCost'
import { StateContext } from '@/context/_state/productions-orders/StateContext'
import formatNumberConfig from '@/utils/helpers/formatnumber'
import useSetingServer from '@/hooks/useConfigNumber'
import ModalImage from 'react-modal-image'
import { useDebounce } from 'use-debounce'

import NoData from '@/components/UI/noData/nodata'
import Loading from '@/components/UI/loading/loading'
import LimitListDropdown from '@/components/common/dropdown/LimitListDropdown'
import ButtonAnimationNew from '@/components/common/button/ButtonAnimationNew'
import ExcelFileComponent from '@/components/common/excel/ExcelFileComponent'
import AnimatedSearchInput from '@/components/common/search/AnimatedSearchInput'
import ArrowCounterClockwiseIcon from '@/components/icons/common/ArrowCounterClockwiseIcon'

const TabMaterialCost = ({ dataLang, ...props }) => {
  const [isLoadingTable, setIsLoadingTable] = useState(false)
  const [isOpenSearch, setIsOpenSearch] = useState(false)
  const { isStateProvider, queryStateProvider } = useContext(StateContext)

  const [searchMaterialCost] = useDebounce(isStateProvider?.productionsOrders?.searchSheet?.searchMaterialCost, 1000)

  const {
    data: dataMaterialCost,
    isLoading: isLoadingMaterialCost,
    refetch: refetchMaterialCost,
    isRefetching: isRefetchingMaterialCost,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useMaterialCost({
    idTabSheet: isStateProvider?.productionsOrders?.isTabSheet?.id,
    poiId: isStateProvider?.productionsOrders?.poiId,
    enabled: !!isStateProvider?.productionsOrders?.poiId && isStateProvider?.productionsOrders?.isTabSheet?.id == 6,
    isSearch: searchMaterialCost,
    limit: isStateProvider?.productionsOrders?.limitSheet?.limitMaterialCost,
  })

  const flagMaterialCost = useMemo(
    () => (dataMaterialCost ? dataMaterialCost.pages.flatMap((page) => page.rResult) : []),
    [dataMaterialCost]
  )

  const totalDataCount = dataMaterialCost?.pages?.[0]?.output?.iTotalRecords || 0

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
          searchMaterialCost: e.target.value,
        },
      },
    })
  }

  const dataSeting = useSetingServer()

  const formatNumber = useCallback((num) => formatNumberConfig(+num, dataSeting), [dataSeting])

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
          title: `${'Nguyên Vật Liệu'}`,
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
      data: flagMaterialCost?.map((e, index) => [
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
    <div className="flex flex-col 3xl:gap-6 gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="3xl:text-xl xl:text-lg text-base font-medium text-[#11315B] capitalize">
          chi phí NVL sản xuất tại xưởng
        </div>

        <div className="flex items-center justify-end gap-3">
          <AnimatedSearchInput
            isOpen={isOpenSearch}
            onToggle={toggleSearch}
            value={isStateProvider?.productionsOrders?.searchSheet?.searchMaterialCost}
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
              refetchMaterialCost()

              setTimeout(() => {
                setIsLoadingTable(false)
              }, 500)
            }}
            title="Tải lại"
            className="3xl:h-10 h-9 xl:px-4 px-2 flex items-center gap-2 xl:text-sm text-xs font-normal text-[#0BAA2E] border border-[#0BAA2E] hover:bg-[#EBFEF2] hover:shadow-hover-button rounded-lg"
          />

          {flagMaterialCost?.length > 0 && (
            <ExcelFileComponent
              dataLang={dataLang}
              filename={'Danh sách dữ liệu chi phí NVL'}
              multiDataSet={multiDataSet}
              title="DSDL chi phí NVL"
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
      </div>

      <div className="grid grid-cols-16 mt-2">
        {/* header */}
        <div className="col-span-16 grid grid-cols-16 gap-2 py-3 border-b">
          <h4 className="text-xs-default text-center text-[#9295A4] font-semibold col-span-1">STT</h4>

          <h4 className="text-xs-default text-start text-[#9295A4] font-semibold col-span-3">Nguyên vật liệu</h4>

          <h4 className="text-xs-default text-start text-[#9295A4] font-semibold col-span-2">ĐVT</h4>

          <h4 className="text-xs-default text-center text-[#9295A4] font-semibold col-span-2">Số lượng xuất</h4>

          <h4 className="text-xs-default text-center text-[#9295A4] font-semibold block col-span-2">Số thu hồi</h4>

          <h4 className="text-xs-default text-start text-[#9295A4] font-semibold block col-span-2">CP xuất NVL</h4>

          <h4 className="text-xs-default text-center text-[#9295A4] font-semibold block col-span-2">CP thu hồi</h4>

          <h4 className="text-xs-default text-start text-[#9295A4] font-semibold block col-span-2">Tổng tiền</h4>
        </div>

        <div className="col-span-16 grid grid-cols-16 min-h-[240px]">
          {isLoadingMaterialCost || isLoadingTable ? (
            <Loading className="3xl:h-full 2xl:h-full xl:h-full h-full col-span-16" />
          ) : flagMaterialCost && flagMaterialCost?.length > 0 ? (
            flagMaterialCost?.map((product, index) => (
              <div
                key={`product-${index}`}
                // onClick={() => handleShowModel(product)}
                className={`${
                  flagMaterialCost?.length - 1 !== index ? 'border-[#F3F3F4]' : 'border-transparent'
                } border-b col-span-16 grid grid-cols-16 gap-2 items-start group hover:bg-gray-100 cursor-pointer transition-all duration-150 ease-in-out`}
              >
                <h4 className="col-span-1 flex items-center justify-center text-center size-full text-[#141522] font-semibold text-sm-default uppercase 3xl:py-4 py-2">
                  {index + 1 ?? '-'}
                </h4>

                <h4 className="col-span-3 flex items-center size-full text-[#344054] font-normal gap-2 3xl:py-4 py-2">
                  <div className="flex items-start justify-start w-full gap-2">
                    <ModalImage
                      small={product?.images ? product?.images : '/icon/default/default.png'}
                      large={product?.images ? product?.images : '/icon/default/default.png'}
                      width={200}
                      height={200}
                      alt={product?.item_name ?? 'image'}
                      className={`3xl:size-10 3xl:min-w-10 size-8 min-w-8 text-xs-default object-cover rounded-md shrink-0`}
                    />

                    <div className="flex flex-col 3xl:gap-1 gap-0.5">
                      <p className={`font-semibold text-sm-default text-[#141522] group-hover:text-[#0F4F9E]`}>
                        {product.item_name ?? ''}
                      </p>

                      <p className="text-[#667085] font-normal xl:text-[10px] text-[8px]">{product.variation ?? ''}</p>

                      <p className="text-[#3276FA] font-normal 3xl:text-sm xl:text-xs text-[10px]">
                        {product.item_code ?? ''}
                      </p>
                    </div>
                  </div>
                </h4>

                <h4 className="col-span-2 flex items-center text-start size-full text-[#141522] font-semibold text-sm-default 3xl:py-4 py-2">
                  {product?.unit_name ?? ''}
                </h4>

                <h4
                  className={`${
                    +product.quantity_import > 0 ? 'justify-start' : 'justify-start'
                  } col-span-2 flex items-center justify-center text-center size-full text-[#141522] font-semibold text-sm-default 3xl:py-4 py-2`}
                >
                  {+product.quantity_import > 0 ? formatNumber(+product.quantity_import) : '-'}
                </h4>

                <h4
                  className={`${
                    +product.quantity_internal > 0 ? 'justify-start' : 'justify-start'
                  } col-span-2 flex items-center justify-center text-center size-full text-[#141522] font-semibold text-sm-default 3xl:py-4 py-2`}
                >
                  {+product.quantity_internal > 0 ? formatNumber(+product.quantity_internal) : '-'}
                </h4>

                <h4
                  className={`${
                    +product.amount_import > 0 ? 'justify-start' : 'justify-start'
                  } col-span-2 flex items-center justify-start text-start size-full text-[#141522] font-semibold text-sm-default 3xl:py-4 py-2`}
                >
                  {+product.amount_import > 0 ? `${formatNumber(+product.amount_import)} đ` : '-'}
                </h4>

                <h4
                  className={`${
                    +product.amount_internal > 0 ? 'justify-center' : 'justify-center'
                  } col-span-2 flex items-center text-center size-full text-[#141522] font-semibold text-sm-default 3xl:py-4 py-2`}
                >
                  {+product.amount_internal > 0 ? `${formatNumber(+product.amount_internal)} đ` : '-'}
                </h4>

                <h4
                  className={`${
                    +product.amount_final > 0 ? 'justify-start' : 'justify-start'
                  } col-span-2 flex items-center justify-start text-center size-full text-[#141522] font-semibold text-sm-default 3xl:py-4 py-2`}
                >
                  {+product.amount_final > 0 ? `${formatNumber(+product.amount_final)} đ` : '-'}
                </h4>
              </div>
            ))
          ) : (
            <NoData className="mt-0 col-span-16" type="table" />
          )}
        </div>

        {flagMaterialCost?.length > 0 && !isLoadingTable && (
          <div className="col-span-16 flex item justify-between">
            <div />
            {hasNextPage && (
              <div className=" flex justify-center py-2">
                <button
                  onClick={() => {
                    const currentLimit = isStateProvider?.productionsOrders?.limitSheet?.limitMaterialCost || 0
                    const newLimit = Math.min(currentLimit + 5, totalDataCount) // tăng thêm 5, nhưng không vượt quá total

                    queryStateProvider({
                      productionsOrders: {
                        ...isStateProvider.productionsOrders,
                        limitSheet: {
                          ...isStateProvider.productionsOrders.limitSheet,
                          limitMaterialCost: newLimit,
                        },
                      },
                    })
                  }}
                  disabled={isFetchingNextPage}
                  className="flex items-center gap-2 text-[#667085] 3xl:text-base text-sm hover:underline"
                >
                  <span>Xem Thêm Mặt Hàng</span>
                  <PiCaretDownBold className="3xl:size-5 size-4" />
                </button>
              </div>
            )}

            <LimitListDropdown
              limit={isStateProvider?.productionsOrders?.limitSheet?.limitMaterialCost}
              sLimit={(value) => {
                queryStateProvider({
                  productionsOrders: {
                    ...isStateProvider?.productionsOrders,
                    limitSheet: {
                      ...isStateProvider?.productionsOrders?.limitSheet,
                      limitMaterialCost: value,
                    },
                  },
                })
              }}
              dataLang={{ display: 'Hiển thị', on: 'trên', lsx: 'BTP' }}
              total={totalDataCount}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default TabMaterialCost
