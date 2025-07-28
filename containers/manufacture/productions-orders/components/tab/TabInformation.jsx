import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import ProductionSteps from '../ui/ProductionStep'
import { useSheet } from '@/context/ui/SheetContext'
import { useRouter } from 'next/router'
import { useIsFetching, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
// import ProductionSteps2 from '../ui/ProductionStep2'
import useSetingServer from '@/hooks/useConfigNumber'

import formatNumberConfig from '@/utils/helpers/formatnumber'
import ProgressCircle from '../ui/ProgressCircle'
import LimitListDropdown from '@/components/common/dropdown/LimitListDropdown'
import NoData from '@/components/UI/noData/nodata'
import Loading from '@/components/UI/loading/loading'
import ModalImage from 'react-modal-image'
import ProductInfoSkeleton from '@/containers/manufacture/productions-orders/components/skeleton/ProductInfoSkeleton'
import ProductionStepsSkeleton from '@/containers/manufacture/productions-orders/components/skeleton/ProductionStepsSkeleton'
import { PiCaretDownBold, PiChatsTeardropFill } from 'react-icons/pi'
import { useItemOrderDetail } from '@/managers/api/productions-order/useItemOrderDetail'
import { StateContext } from '@/context/_state/productions-orders/StateContext'
import CommentList from '../ui/comment/CommentList'
import { useInView } from 'react-intersection-observer'
import LoadingComponent from '@/components/common/loading/loading/LoadingComponent'
import { useSelector } from 'react-redux'
import { useGetListComment } from '@/managers/api/productions-order/comment/useGetListComment'
import CommentSkeleton from '../skeleton/CommentSkeleton'
import { useSocketContext } from '@/context/socket/SocketContext'

const dataFakeItem = [
  {
    id: '211',
    item_code: 'KhungXe',
    item_name: 'Khung Xe winner X',
    quota_primary: '10',
    reference_no_detail: 'LSXCT-27032550',
    unit_name: 'Cái',
    quantity_keep: '0',
    product_variation: '(NONE)',
    stages: [
      {
        id: '244',
        po_id: '39',
        poi_id: '50',
        stage_id: '17',
        number: '1',
        final_stage: '0',
        type: '2',
        bom_id: '211',
        begin_production: '0',
        date_production: null,
        staff_production: '0',
        staff_active: '0',
        active: '0',
        date_active: null,
        stage_code: 'Cắt',
        stage_name: 'Cắt',
        purchase_items: null,
      },
      {
        id: '245',
        po_id: '39',
        poi_id: '50',
        stage_id: '18',
        number: '2',
        final_stage: '0',
        type: 3,
        bom_id: '211',
        begin_production: '0',
        date_production: null,
        staff_production: '0',
        staff_active: '0',
        active: '0',
        date_active: null,
        stage_code: 'Hàn thép',
        stage_name: 'Hàn thép',
        purchase_items: null,
      },
      {
        id: '246',
        po_id: '39',
        poi_id: '50',
        stage_id: '10',
        number: '3',
        final_stage: '1',
        type: 3,
        bom_id: '211',
        begin_production: '0',
        date_production: null,
        staff_production: '0',
        staff_active: '0',
        active: '0',
        date_active: null,
        stage_code: 'HOANTHANH',
        stage_name: 'Hoàn Thành',
        purchase_items: null,
      },
    ],
    quantity_need_manufactures: 10,
    count_stage_active: 0,
    count_stage: 3,
    stage_name_active: '',
    quantity_stage: 0,
  },
  {
    id: '32',
    item_code: 'KhungXe',
    item_name: 'Khung Xe winner X',
    quota_primary: '10',
    reference_no_detail: 'LSXCT-27032550',
    unit_name: 'Cái',
    quantity_keep: '0',
    product_variation: '(NONE)',
    stages: [
      {
        id: '244',
        po_id: '39',
        poi_id: '50',
        stage_id: '17',
        number: '1',
        final_stage: '0',
        type: '2',
        bom_id: '211',
        begin_production: '0',
        date_production: null,
        staff_production: '0',
        staff_active: '0',
        active: '0',
        date_active: null,
        stage_code: 'Cắt',
        stage_name: 'Cắt',
        purchase_items: null,
      },
      {
        id: '245',
        po_id: '39',
        poi_id: '50',
        stage_id: '18',
        number: '2',
        final_stage: '0',
        type: 3,
        bom_id: '211',
        begin_production: '0',
        date_production: null,
        staff_production: '0',
        staff_active: '0',
        active: '0',
        date_active: null,
        stage_code: 'Hàn thép',
        stage_name: 'Hàn thép',
        purchase_items: null,
      },
      {
        id: '246',
        po_id: '39',
        poi_id: '50',
        stage_id: '10',
        number: '3',
        final_stage: '1',
        type: 3,
        bom_id: '211',
        begin_production: '0',
        date_production: null,
        staff_production: '0',
        staff_active: '0',
        active: '0',
        date_active: null,
        stage_code: 'HOANTHANH',
        stage_name: 'Hoàn Thành',
        purchase_items: null,
      },
    ],
    quantity_need_manufactures: 10,
    count_stage_active: 0,
    count_stage: 3,
    stage_name_active: '',
    quantity_stage: 0,
  },
  {
    id: '33333',
    item_code: 'KhungXe',
    item_name: 'Khung Xe winner X',
    quota_primary: '10',
    reference_no_detail: 'LSXCT-27032550',
    unit_name: 'Cái',
    quantity_keep: '0',
    product_variation: '(NONE)',
    stages: [
      {
        id: '244',
        po_id: '39',
        poi_id: '50',
        stage_id: '17',
        number: '1',
        final_stage: '0',
        type: '2',
        bom_id: '211',
        begin_production: '0',
        date_production: null,
        staff_production: '0',
        staff_active: '0',
        active: '0',
        date_active: null,
        stage_code: 'Cắt',
        stage_name: 'Cắt',
        purchase_items: null,
      },
      {
        id: '245',
        po_id: '39',
        poi_id: '50',
        stage_id: '18',
        number: '2',
        final_stage: '0',
        type: 3,
        bom_id: '211',
        begin_production: '0',
        date_production: null,
        staff_production: '0',
        staff_active: '0',
        active: '0',
        date_active: null,
        stage_code: 'Hàn thép',
        stage_name: 'Hàn thép',
        purchase_items: null,
      },
      {
        id: '246',
        po_id: '39',
        poi_id: '50',
        stage_id: '10',
        number: '3',
        final_stage: '1',
        type: 3,
        bom_id: '211',
        begin_production: '0',
        date_production: null,
        staff_production: '0',
        staff_active: '0',
        active: '0',
        date_active: null,
        stage_code: 'HOANTHANH',
        stage_name: 'Hoàn Thành',
        purchase_items: null,
      },
    ],
    quantity_need_manufactures: 10,
    count_stage_active: 0,
    count_stage: 3,
    stage_name_active: '',
    quantity_stage: 0,
  },
  {
    id: '3434343',
    item_code: 'KhungXe',
    item_name: 'Khung Xe winner X',
    quota_primary: '10',
    reference_no_detail: 'LSXCT-27032550',
    unit_name: 'Cái',
    quantity_keep: '0',
    product_variation: '(NONE)',
    stages: [
      {
        id: '244',
        po_id: '39',
        poi_id: '50',
        stage_id: '17',
        number: '1',
        final_stage: '0',
        type: '2',
        bom_id: '211',
        begin_production: '0',
        date_production: null,
        staff_production: '0',
        staff_active: '0',
        active: '0',
        date_active: null,
        stage_code: 'Cắt',
        stage_name: 'Cắt',
        purchase_items: null,
      },
      {
        id: '245',
        po_id: '39',
        poi_id: '50',
        stage_id: '18',
        number: '2',
        final_stage: '0',
        type: 3,
        bom_id: '211',
        begin_production: '0',
        date_production: null,
        staff_production: '0',
        staff_active: '0',
        active: '0',
        date_active: null,
        stage_code: 'Hàn thép',
        stage_name: 'Hàn thép',
        purchase_items: null,
      },
      {
        id: '246',
        po_id: '39',
        poi_id: '50',
        stage_id: '10',
        number: '3',
        final_stage: '1',
        type: 3,
        bom_id: '211',
        begin_production: '0',
        date_production: null,
        staff_production: '0',
        staff_active: '0',
        active: '0',
        date_active: null,
        stage_code: 'HOANTHANH',
        stage_name: 'Hoàn Thành',
        purchase_items: null,
      },
    ],
    quantity_need_manufactures: 10,
    count_stage_active: 0,
    count_stage: 3,
    stage_name_active: '',
    quantity_stage: 0,
  },
  {
    id: '23232323',
    item_code: 'KhungXe',
    item_name: 'Khung Xe winner X',
    quota_primary: '10',
    reference_no_detail: 'LSXCT-27032550',
    unit_name: 'Cái',
    quantity_keep: '0',
    product_variation: '(NONE)',
    stages: [
      {
        id: '244',
        po_id: '39',
        poi_id: '50',
        stage_id: '17',
        number: '1',
        final_stage: '0',
        type: '2',
        bom_id: '211',
        begin_production: '0',
        date_production: null,
        staff_production: '0',
        staff_active: '0',
        active: '0',
        date_active: null,
        stage_code: 'Cắt',
        stage_name: 'Cắt',
        purchase_items: null,
      },
      {
        id: '245',
        po_id: '39',
        poi_id: '50',
        stage_id: '18',
        number: '2',
        final_stage: '0',
        type: 3,
        bom_id: '211',
        begin_production: '0',
        date_production: null,
        staff_production: '0',
        staff_active: '0',
        active: '0',
        date_active: null,
        stage_code: 'Hàn thép',
        stage_name: 'Hàn thép',
        purchase_items: null,
      },
      {
        id: '246',
        po_id: '39',
        poi_id: '50',
        stage_id: '10',
        number: '3',
        final_stage: '1',
        type: 3,
        bom_id: '211',
        begin_production: '0',
        date_production: null,
        staff_production: '0',
        staff_active: '0',
        active: '0',
        date_active: null,
        stage_code: 'HOANTHANH',
        stage_name: 'Hoàn Thành',
        purchase_items: null,
      },
    ],
    quantity_need_manufactures: 10,
    count_stage_active: 0,
    count_stage: 3,
    stage_name_active: '',
    quantity_stage: 0,
  },
  {
    id: '4242424',
    item_code: 'KhungXe',
    item_name: 'Khung Xe winner X',
    quota_primary: '10',
    reference_no_detail: 'LSXCT-27032550',
    unit_name: 'Cái',
    quantity_keep: '0',
    product_variation: '(NONE)',
    stages: [
      {
        id: '244',
        po_id: '39',
        poi_id: '50',
        stage_id: '17',
        number: '1',
        final_stage: '0',
        type: '2',
        bom_id: '211',
        begin_production: '0',
        date_production: null,
        staff_production: '0',
        staff_active: '0',
        active: '0',
        date_active: null,
        stage_code: 'Cắt',
        stage_name: 'Cắt',
        purchase_items: null,
      },
      {
        id: '245',
        po_id: '39',
        poi_id: '50',
        stage_id: '18',
        number: '2',
        final_stage: '0',
        type: 3,
        bom_id: '211',
        begin_production: '0',
        date_production: null,
        staff_production: '0',
        staff_active: '0',
        active: '0',
        date_active: null,
        stage_code: 'Hàn thép',
        stage_name: 'Hàn thép',
        purchase_items: null,
      },
      {
        id: '246',
        po_id: '39',
        poi_id: '50',
        stage_id: '10',
        number: '3',
        final_stage: '1',
        type: 3,
        bom_id: '211',
        begin_production: '0',
        date_production: null,
        staff_production: '0',
        staff_active: '0',
        active: '0',
        date_active: null,
        stage_code: 'HOANTHANH',
        stage_name: 'Hoàn Thành',
        purchase_items: null,
      },
    ],
    quantity_need_manufactures: 10,
    count_stage_active: 0,
    count_stage: 3,
    stage_name_active: '',
    quantity_stage: 0,
  },
  {
    id: '5454545',
    item_code: 'KhungXe',
    item_name: 'Khung Xe winner X',
    quota_primary: '10',
    reference_no_detail: 'LSXCT-27032550',
    unit_name: 'Cái',
    quantity_keep: '0',
    product_variation: '(NONE)',
    stages: [
      {
        id: '244',
        po_id: '39',
        poi_id: '50',
        stage_id: '17',
        number: '1',
        final_stage: '0',
        type: '2',
        bom_id: '211',
        begin_production: '0',
        date_production: null,
        staff_production: '0',
        staff_active: '0',
        active: '0',
        date_active: null,
        stage_code: 'Cắt',
        stage_name: 'Cắt',
        purchase_items: null,
      },
      {
        id: '245',
        po_id: '39',
        poi_id: '50',
        stage_id: '18',
        number: '2',
        final_stage: '0',
        type: 3,
        bom_id: '211',
        begin_production: '0',
        date_production: null,
        staff_production: '0',
        staff_active: '0',
        active: '0',
        date_active: null,
        stage_code: 'Hàn thép',
        stage_name: 'Hàn thép',
        purchase_items: null,
      },
      {
        id: '246',
        po_id: '39',
        poi_id: '50',
        stage_id: '10',
        number: '3',
        final_stage: '1',
        type: 3,
        bom_id: '211',
        begin_production: '0',
        date_production: null,
        staff_production: '0',
        staff_active: '0',
        active: '0',
        date_active: null,
        stage_code: 'HOANTHANH',
        stage_name: 'Hoàn Thành',
        purchase_items: null,
      },
    ],
    quantity_need_manufactures: 10,
    count_stage_active: 0,
    count_stage: 3,
    stage_name_active: '',
    quantity_stage: 0,
  },
]

function smoothScrollTo(container, targetY, duration = 500) {
  const startY = container.scrollTop
  const change = targetY - startY
  const startTime = performance.now()

  function animateScroll(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    const ease = easeInOutCubic(progress)

    container.scrollTop = startY + change * ease

    if (progress < 1) {
      requestAnimationFrame(animateScroll)
    }
  }

  requestAnimationFrame(animateScroll)
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

const TabInformation = ({ scrollRef }) => {
  const router = useRouter()
  const { isOpen: isOpenSheet, ...props } = useSheet()
  const poiId = useMemo(() => router.query.poi_id, [router.query])
  const { isStateProvider, queryStateProvider } = useContext(StateContext)

  const auth = useSelector((state) => state.auth)
  const dataSetting = useSelector((state) => state.setings)

  const { socket } = useSocketContext()

  const commentTopRef = useRef(null)

  const [selectedIdSection, setSelectedIdSection] = useState('section-list-comment')

  // api dữ liệu user
  // const { data: dataAuth, isLoading } = useAuththentication(auth)

  const [limit, setLimit] = useState(5)
  const { ref: refInviewListComment, inView: inViewListComment } = useInView()

  const {
    data: dataItemOrderDetail,
    isLoading: isLoadingItemOrderDetail,
    isFetching: isFetchingItemOrderDetail,
  } = useItemOrderDetail({
    poi_id: isStateProvider?.productionsOrders?.poiId,
    enabled: isOpenSheet && !!isStateProvider?.productionsOrders?.poiId,
  })

  const {
    data: dataListComment,
    fetchNextPage: fetchNextPageListComment,
    hasNextPage: hasNextPageListComment,
    refetch: refetchListComment,
  } = useGetListComment({
    poiId: isStateProvider?.productionsOrders?.poiId,
    type: 1,
    enabled:
      isOpenSheet &&
      !!isStateProvider?.productionsOrders?.poiId &&
      isStateProvider?.productionsOrders?.isTabSheet?.id == 1,
  })

  const flagListComment = useMemo(
    () => (dataListComment ? dataListComment?.pages?.flatMap((page) => page.comments) : []),
    [dataListComment]
  )

  // loadmore list LSX
  useEffect(() => {
    if (inViewListComment && hasNextPageListComment) {
      fetchNextPageListComment()
    }
  }, [inViewListComment, fetchNextPageListComment])

  const dataSeting = useSetingServer()
  const formatNumber = useCallback((num) => formatNumberConfig(+num, dataSeting), [dataSeting])

  const stages = ['Cắt vải', 'May', 'Vắt sổ']

  const handleClickSection = (id) => {
    // isScrollingByClick.current = true; // Chặn Observer
    setSelectedIdSection(id)

    // setTimeout(() => {
    //     isScrollingByClick.current = false; // Cho phép Observer chạy lại sau khi cuộn hoàn tất
    // }, 1000);
  }

  useEffect(() => {
    if (!socket || !isStateProvider?.productionsOrders?.poiId) return
    const topic = `comment_pod_${isStateProvider.productionsOrders.poiId}`

    socket.on(topic, (data) => {
      if (data && data.data) {
        if (data.data === '1') {
          refetchListComment()
          return
        } else {
          refetchListComment().then(() => {
            if (scrollRef?.current && commentTopRef?.current) {
              const containerTop = scrollRef.current.getBoundingClientRect().top
              const elementTop = commentTopRef.current.getBoundingClientRect().top
              const offset = 16

              const targetY = scrollRef.current.scrollTop + (elementTop - containerTop) - offset

              smoothScrollTo(scrollRef.current, targetY, 600) // mượt hơn
            }
          })
        }
      }
    })

    return () => {
      socket.off(topic)
    }
  }, [socket, isStateProvider?.productionsOrders?.poiId])

  return (
    <div className="space-y-4">
      <div className="flex items-start xl:gap-4 gap-2 border-b border-[#D0D5DD]">
        <div className="flex flex-col xl:gap-4 gap-2 3xl:w-[25%] xxl:w-[30%] w-[28%]">
          <h4 className="text-[#344054] font-normal flex items-center py-2 3xl:px-4 px-2 gap-2">
            {isFetchingItemOrderDetail ? (
              <ProductInfoSkeleton className="" />
            ) : (
              <div className="flex items-start gap-2">
                <div className="3xl:size-16 xxl:size-12 size-10 shrink-0">
                  <Image
                    alt={dataItemOrderDetail?.poi?.item_name ?? 'img'}
                    width={200}
                    height={200}
                    src={dataItemOrderDetail?.poi?.images ?? '/icon/default/default.png'}
                    className="size-full object-cover rounded-md"
                  />
                </div>

                <div className="flex flex-col 3xl:gap-1.5 gap-1 w-full">
                  <p className="text-[#141522] font-semibold text-sm-default">{dataItemOrderDetail?.poi?.item_name}</p>

                  <div className="grid grid-cols-3 gap-2">
                    <p className="col-span-1 text-[#667085] font-normal xl:text-xs text-[10px]">Số lượng</p>

                    <p className="col-span-2 text-[#667085] font-normal xl:text-xs text-[10px]">
                      {dataItemOrderDetail?.poi?.product_variation}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 items-center gap-2">
                    <p className="col-span-1 font-medium flex items-center">
                      <span className="text-sm-default text-[#EE1E1E]">{dataItemOrderDetail?.poi?.quantity}</span>
                      <span className="text-[10px] text-[#141522]">/{dataItemOrderDetail?.poi?.unit_name}</span>
                    </p>

                    <p className="col-span-2 text-[#3276FA] font-normal xl:text-xs text-[10px]">
                      {dataItemOrderDetail?.poi?.item_code}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </h4>

          {isFetchingItemOrderDetail ? (
            <ProductionStepsSkeleton count={3} />
          ) : (
            <ProductionSteps stages={dataItemOrderDetail?.poi?.stages} />
          )}

          {/* <ProductionSteps2 /> */}
        </div>

        <div className="3xl:w-[75%] xxl:w-[70%] w-[72%]">
          <div className="col-span-12 grid grid-cols-16 mt-2">
            {/* header */}
            <div className="col-span-16 grid grid-cols-16 gap-2 py-3 border-b">
              <h4 className="text-xs-default text-center text-[#9295A4] font-semibold col-span-1">STT</h4>
              <h4 className="text-xs-default text-start text-[#9295A4] font-semibold col-span-4">Bán thành phẩm</h4>
              <h4 className="text-xs-default text-start text-[#9295A4] font-semibold xxl:col-span-2 col-span-1">ĐVT</h4>
              <h4 className="text-xs-default text-center text-[#9295A4] font-semibold xxl:col-span-1 col-span-2">
                SL cần
              </h4>
              <h4 className="text-xs-default text-center text-[#9295A4] font-semibold block col-span-2">SL giữ kho</h4>
              <h4 className="text-xs-default text-center text-[#9295A4] font-semibold block col-span-2">SL sản xuất</h4>
              <h4 className="text-xs-default text-center text-[#9295A4] font-semibold block col-span-4">Tiến trình</h4>
            </div>

            {/* body */}
            <div className="col-span-16 grid grid-cols-16 min-h-[240px]">
              {isFetchingItemOrderDetail ? (
                <Loading className="3xl:h-full 2xl:h-full xl:h-full h-full col-span-16" />
              ) : dataItemOrderDetail && dataItemOrderDetail?.items_semi?.length > 0 ? (
                dataItemOrderDetail?.items_semi?.slice(0, limit)?.map((product, index) => (
                  <div
                    key={`product-${index}`}
                    // onClick={() => handleShowModel(product)}
                    className={`col-span-16 grid grid-cols-16 gap-2 items-start group hover:bg-gray-100 cursor-pointer transition-all duration-150 ease-in-out 3xl:py-4 py-2`}
                  >
                    <h4 className="col-span-1 flex items-center justify-center size-full text-center text-[#141522] font-semibold text-sm-default uppercase">
                      {index + 1 ?? '-'}
                    </h4>

                    <h4 className="col-span-4 flex items-center size-full text-[#344054] font-normal gap-2">
                      <div className="flex items-start gap-2">
                        <ModalImage
                          small={
                            product?.images && product?.images !== '' ? product?.images : '/icon/default/default.png'
                          }
                          large={
                            product?.images && product?.images !== '' ? product?.images : '/icon/default/default.png'
                          }
                          width={200}
                          height={200}
                          alt={product?.name ?? 'image'}
                          className={`3xl:size-10 3xl:min-w-10 size-8 min-w-8 text-xs-default object-cover rounded-md shrink-0`}
                        />

                        <div className="flex flex-col 3xl:gap-1 gap-0.5">
                          <p className={`font-semibold text-sm-default text-[#141522] group-hover:text-[#0F4F9E]`}>
                            {product.item_name}
                          </p>

                          <p className="text-[#667085] font-normal xl:text-[10px] text-[8px]">
                            {product.product_variation}
                          </p>

                          <p className="text-[#3276FA] font-normal 3xl:text-sm xl:text-xs text-[10px]">
                            {product.item_code}
                          </p>
                        </div>
                      </div>
                    </h4>

                    <h4 className="xxl:col-span-2 col-span-1 flex items-center size-full text-start text-[#141522] font-semibold text-sm-default">
                      {product?.unit_name ?? ''}
                    </h4>

                    <h4 className="xxl:col-span-1 col-span-2 flex items-center justify-center size-full text-center text-[#141522] font-semibold text-sm-default">
                      {+product.quantity_need_manufactures > 0
                        ? formatNumber(+product.quantity_need_manufactures)
                        : '-'}
                    </h4>

                    <h4 className="col-span-2 flex items-center justify-center size-full text-center text-[#141522] font-semibold text-sm-default">
                      {+product.quantity_keep > 0 ? formatNumber(+product.quantity_keep) : '-'}
                    </h4>

                    <h4 className="col-span-2 flex items-center justify-center size-full text-center text-[#141522] font-semibold text-sm-default">
                      {+product.quantity_stage > 0 ? formatNumber(+product.quantity_stage) : '-'}
                    </h4>

                    <ProgressCircle
                      title={product?.stage_name_active ?? ''}
                      step={product?.count_stage_active}
                      total={product?.count_stage}
                      quantity={product?.quantity_stage}
                      stages={stages}
                      className="col-span-4 flex items-center justify-center size-full text-xs-default"
                    />
                  </div>
                ))
              ) : (
                <NoData className="mt-0 col-span-16" type="table" />
              )}
              {/* load more click */}
              {dataItemOrderDetail?.items_semi?.length > 0 && (
                <div className="col-span-16 flex item justify-between">
                  <div />
                  {
                    // (dataItemOrderDetail?.items_semi?.length || 0) > (visibleProducts["info"] || 4) && (
                    limit < dataItemOrderDetail?.items_semi.length && (
                      <div className=" flex justify-center py-2">
                        <button
                          onClick={() => setLimit(dataItemOrderDetail?.items_semi.length)}
                          className="flex items-center gap-2 text-[#667085] 3xl:text-base text-sm hover:underline"
                        >
                          <div className="space-x-2">
                            <span>Xem thêm</span>
                            <span>({dataItemOrderDetail?.items_semi.length - limit})</span>
                            <span>thành phẩm</span>
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
                    total={dataItemOrderDetail?.items_semi.length}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <section id="section-list-comment" ref={commentTopRef} className="flex flex-col xl:gap-4 gap-2">
        <div className="flex items-center gap-2">
          <PiChatsTeardropFill className="3xl:size-6 size-5 shrink-0 text-[#003DA0]" />

          <p className="3xl:text-xl text-lg text-[#003DA0] font-medium">Thảo luận</p>
        </div>

        <div className="flex flex-col xl:gap-4 gap-2">
          {flagListComment && flagListComment?.length > 0 ? (
            <CommentList
              data={flagListComment}
              currentUser={{ id: auth?.staff_id, name: auth?.user_full_name }}
              onRefresh={refetchListComment}
            />
          ) : (
            <NoData
              className="mt-0 col-span-16"
              type="comment"
              classNameTitle="3xl:text-2xl xl:text-xl text-lg !text-[#11315B]"
            />
          )}

          {hasNextPageListComment && <CommentSkeleton ref={refInviewListComment} />}
        </div>
      </section>
    </div>
  )
}

export default TabInformation
