import ButtonAnimationNew from '@/components/common/button/ButtonAnimationNew';
import CommentInputAdvanced from '@/components/common/input/CommentInputAdvanced';
import Skeleton from '@/components/common/skeleton/Skeleton';
import TabSwitcherWithUnderline from '@/components/common/tab/TabSwitcherWithUnderline';
import CloseXIcon from '@/components/icons/common/CloseXIcon';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import CostCardSkeleton from '@/containers/manufacture/productions-orders/components/skeleton/CostCardSkeleton';
import TabSwitcherWithUnderlineSkeleton from '@/containers/manufacture/productions-orders/components/skeleton/TabSwitcherWithUnderlineSkeleton';
import { StateContext } from '@/context/_state/productions-orders/StateContext';
import { useSheet } from '@/context/ui/SheetContext';
import useSetingServer from '@/hooks/useConfigNumber';
import useSettingExpiration from '@/hooks/useSettingExpiration';
import useToast from '@/hooks/useToast';
import { useItemOrderDetail } from '@/managers/api/productions-order/useItemOrderDetail';
import formatMoneyConfig from '@/utils/helpers/formatMoney';
import { motion } from 'framer-motion';
import { useRouter } from 'next/router';
import React, { memo, useContext, useEffect, useRef } from 'react';
import { PiLinkBold } from 'react-icons/pi';
import TabFGReceiptHistory from '../tab/TabFGReceiptHistory';
import TabInformation from '../tab/TabInformation';
import TabMaterialCost from '../tab/TabMaterialCost';
import TabMaterialIssueHistory from '../tab/TabMaterialIssueHistory';
import TabMaterialOutputTab from '../tab/TabMaterialOutput';
import TabMaterialReturn from '../tab/TabMaterialReturn';
import CostCard from '../ui/CostCard';
import { AvatarStack } from '@/components/UI/common/user';

const initialState = {
  isTab: 1,
  dataDetail: {},
};

const SheetProductionsOrderDetail = memo(({ dataLang, ...props }) => {
  const router = useRouter();
  const scrollRef = useRef(null);
  // const poiId = useMemo(() => router.query.poi_id, [router.query.poi_id])

  const { isStateProvider, queryStateProvider } = useContext(StateContext);

  const dataSeting = useSetingServer();

  const { isOpen: isOpenSheet, closeSheet } = useSheet();

  const {
    data: dataItemOrderDetail,
    isLoading: isLoadingItemOrderDetail,
    isFetching: isFetchingItemOrderDetail,
  } = useItemOrderDetail({
    poi_id: isStateProvider?.productionsOrders?.poiId,
    enabled: isOpenSheet && !!isStateProvider?.productionsOrders?.poiId && isStateProvider?.productionsOrders?.isTabSheet?.id == 1,
  });

  const listTab = [
    {
      id: 1,
      name: dataLang?.productions_orders_modal_information || 'productions_orders_modal_information',
      count: 0,
    },
    {
      id: 2,
      name: dataLang?.productions_orders_modal_appeared || 'productions_orders_modal_appeared',
      count: dataItemOrderDetail?.count_bom ?? 0,
    },
    {
      id: 3,
      name: dataLang?.productions_orders_modal_history_exporting_materials || 'productions_orders_modal_history_exporting_materials',
      count: dataItemOrderDetail?.count_suggest_exporting ?? 0,
    },
    {
      id: 4,
      name: dataLang?.productions_orders_modal_history_import_product || 'productions_orders_modal_history_import_product',
      count: dataItemOrderDetail?.count_purchase_products ?? 0,
    },
    {
      id: 5,
      name: dataLang?.productions_orders_modal_recovery_materials || 'productions_orders_modal_recovery_materials',
      count: dataItemOrderDetail?.count_purchase_internal ?? 0,
    },
    {
      id: 6,
      name: dataLang?.productions_orders_modal_costs_processing_new || 'productions_orders_modal_costs_processing_new',
      // name: dataLang?.productions_orders_modal_costs_processing_new || 'productions_orders_modal_costs_processing_new',
      count: 0,
    },
  ];

  useEffect(() => {
    if (isOpenSheet && scrollRef.current && isStateProvider?.productionsOrders?.poiId) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' }); // hoặc "auto"
    }
  }, [isOpenSheet, isStateProvider?.productionsOrders?.poiId]);

  useEffect(() => {
    if (isOpenSheet && isStateProvider?.productionsOrders?.poiId) {
      queryStateProvider({
        productionsOrders: {
          ...isStateProvider?.productionsOrders,
          isTabSheet: listTab[0],
        },
      });
    }
  }, [isOpenSheet, isStateProvider?.productionsOrders?.poiId]);

  // Manager detail (người phụ trách) nhận từ props (đã chuẩn bị ở list)
  const managerAvatars = props?.managerAvatars || [];

  const components = {
    1: <TabInformation dataLang={dataLang} scrollRef={scrollRef} {...props} />,
    2: <TabMaterialOutputTab dataLang={dataLang} {...props} />,
    3: <TabMaterialIssueHistory dataLang={dataLang} {...props} />,
    4: <TabFGReceiptHistory dataLang={dataLang} {...props} />,
    5: <TabMaterialReturn dataLang={dataLang} {...props} />,
    6: <TabMaterialCost dataLang={dataLang} {...props} />,
  };

  const formatMoney = number => {
    if (typeof number == 'string') {
      return formatMoneyConfig(+number ? +number : 0, dataSeting);
    } else if (typeof number == 'undefined') {
      return formatMoneyConfig(0, dataSeting);
    }
    return formatMoneyConfig(+number ? +number : 0, dataSeting);
  };

  const handleCloseSheet = () => {
    closeSheet('manufacture-productions-orders');

    queryStateProvider(prev => ({
      productionsOrders: {
        ...prev.productionsOrders,
        selectedImages: [],
        uploadProgress: {},
        inputCommentText: '',
        taggedUsers: [],
      },
    }));

    if (router.pathname.startsWith('/manufacture/productions-orders')) {
      router.push('/manufacture/productions-orders');
    }
  };

  const handleActiveTab = (value, type) => {
    if (type !== 'detail_sheet') return;

    const currentTabId = isStateProvider?.productionsOrders?.isTabSheet?.id;
    const newTabId = value?.id;

    // Nếu đang ở đúng tab → không làm gì cả
    if (currentTabId === newTabId) return;

    // Cập nhật state
    queryStateProvider({
      productionsOrders: {
        ...isStateProvider?.productionsOrders,
        isTabSheet: value,
      },
    });
  };
  const showToat = useToast();
  const handleCopyLink = () => {
    const currentUrl = window.location.href;
    navigator?.clipboard
      ?.writeText(currentUrl)
      .then(() => {
        // Có thể dùng toast hoặc alert thông báo
        showToat('success', `Đã sao chép liên kết!`);
      })
      .catch(err => {
        console.error('Lỗi khi sao chép URL:', err);
        showToat('error', `Không thể sao chép liên kết!`);
      });
  };

  // if (!poiId && isMounted) return <Loading className='3xl:h-full 2xl:h-full xl:h-full h-full col-span-16' />

  const { isNearlyExpired } = useSettingExpiration();
  const hasAlert = isNearlyExpired;
  const classNameSpace =  hasAlert ? "pt-[28px] " : "pt-[0px]"

  return (
    <div className={`flex flex-col overflow-hidden !bg-white h-full ${classNameSpace}`}>
      <div
        className='3xl:pl-6 pl-4 3xl:pr-4 pr-2 3xl:py-3 py-1 flex items-center justify-between bg-white'
        style={{
          boxShadow: '0px 4px 30px 0px #0000000D',
        }}
      >
        <h1 className='text-title-default font-bold text-[#11315B] capitalize'>Chi tiết lệnh sản xuất</h1>

        <div className='flex items-center gap-2'>
          {/* 
                    <ButtonAnimationNew
                        icon={
                            <CheckThinIcon className={`xl:size-4 size-3.5 shrink-0`} />
                        }
                        title="Hoàn thành công đoạn"
                        className="w-fit 3xl:h-10 h-9 xl:px-4 px-2 flex items-center gap-2 xl:text-sm text-xs font-medium text-white border border-[#0375F3] bg-[#0375F3] hover:shadow-hover-button rounded-lg"
                    /> */}

          <ButtonAnimationNew
            icon={<PiLinkBold className='xl:size-4 size-3.5' />}
            onClick={() => handleCopyLink()}
            title='Sao chép LSX'
            className='3xl:h-10 h-9 xl:px-4 px-2 flex items-center gap-2 xl:text-sm text-xs font-medium text-[#11315B] border border-[#D0D5DD] hover:bg-[#F7F8F9] hover:shadow-hover-button rounded-lg'
          />

          {/* <ButtonAnimationNew
                        icon={
                            <FileIcon className='xl:size-4 size-3.5' />
                        }
                        title="In PDF"
                        className="3xl:h-10 h-9 xl:px-4 px-2 flex items-center gap-2 xl:text-sm text-xs font-medium text-[#11315B] border border-[#D0D5DD] hover:bg-[#F7F8F9] hover:shadow-hover-button rounded-lg"
                    /> */}

          {/* <div
                        onClick={() => closeSheet(false)}
                        className='size-8 shrink-0 text-[#9295A4] cursor-pointer'
                    >
                        <CloseXIcon className='size-full' />
                    </div> */}
          <motion.div
            whileHover={{ scale: 1.2, rotate: 90 }}
            whileTap={{ scale: 0.9, rotate: -90 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className='size-6 shrink-0 text-[#9295A4] cursor-pointer'
            onClick={handleCloseSheet}
          >
            <CloseXIcon className='size-full' />
          </motion.div>
        </div>
      </div>

      <Customscrollbar ref={scrollRef} className='overflow-auto pb-0 3xl:pl-6 pl-4 pr-2 py-2 h-full min-h-0'>
        <div className='flex flex-col 3xl:gap-6 gap-4 pr-4'>
          {/* Information */}
          <div className='flex flex-col 3xl:gap-6 gap-4 w-full border border-[#D0D5DD] rounded-2xl bg-white 3xl:px-8 px-6 3xl:py-6 py-4'>
            <div className='flex items-center justify-between w-full'>
              <h2 className='text-title-small text-[#11315B] font-medium capitalize'>Thông tin chung</h2>
              <div className='w-fit'>{managerAvatars.length > 0 ? <AvatarStack people={managerAvatars} size={32} /> : <span className='text-sm text-[#9295A4]'>Chưa có người phụ trách</span>}</div>
            </div>
            <div className='grid grid-cols-2'>
              <div className='flex flex-col gap-1 col-span-1 w-full'>
                <div className='flex items-center gap-1'>
                  <h3 className={`text-base-default text-[#3A3E4C] font-light min-w-[170px]`}>{dataLang?.productions_orders_details_lxs_number || 'productions_orders_details_lxs_number'}:</h3>
                  {isLoadingItemOrderDetail ? (
                    <Skeleton className='w-[150px] h-6' />
                  ) : (
                    <h3 className={`text-base-default font-medium text-[#0375F3]`}>{dataItemOrderDetail?.poi?.reference_no_detail ?? ''}</h3>
                  )}
                </div>

                <div className='flex items-center gap-1'>
                  <h3 className={`text-base-default text-[#3A3E4C] font-light min-w-[170px]`}>{dataLang?.productions_orders_details_number || 'productions_orders_details_number'}:</h3>
                  {isLoadingItemOrderDetail ? (
                    <Skeleton className='w-[150px] h-6' />
                  ) : (
                    <h3 className={`text-base-default font-medium text-[#141522]`}>{dataItemOrderDetail?.poi?.reference_no_po ?? ''}</h3>
                  )}
                </div>

                <div className='flex items-center col-span-3 gap-1'>
                  <h3 className={`text-base-default text-[#3A3E4C] font-light min-w-[170px]`}>{dataLang?.productions_orders_details_plan || 'productions_orders_details_plan'}:</h3>

                  {isLoadingItemOrderDetail ? (
                    <Skeleton className='w-[150px] h-6' />
                  ) : (
                    <h3 className={`text-base-default font-medium text-[#141522]`}>{dataItemOrderDetail?.poi?.reference_no_pp ?? ''}</h3>
                  )}
                </div>
              </div>

              <div className='flex flex-col gap-1 col-span-1 w-full'>
                <div className={`flex items-center col-span-3 gap-1`}>
                  <h3 className={`text-base-default text-[#3A3E4C] font-light min-w-[170px]`}>{dataLang?.productions_orders_details_orders || 'productions_orders_details_orders'}:</h3>
                  {isLoadingItemOrderDetail ? (
                    <Skeleton className='w-[150px] h-6' />
                  ) : (
                    <h3 className={`text-base-default font-medium text-[#141522]`}>{dataItemOrderDetail?.poi?.object?.reference_no}</h3>
                  )}
                </div>

                <div className={`flex items-center col-span-3 gap-1`}>
                  <h3 className={`text-base-default text-[#3A3E4C] font-light min-w-[170px]`}>{dataLang?.productions_orders_details_client || 'productions_orders_details_client'}:</h3>

                  {isLoadingItemOrderDetail ? (
                    <Skeleton className='w-[150px] h-6' />
                  ) : (
                    <h3 className={`text-base-default font-medium text-[#141522]`}>{dataItemOrderDetail?.poi?.object?.company ?? ''}</h3>
                  )}
                </div>

                <div className={`flex items-center gap-1`}>
                  <h3 className={`text-base-default text-[#3A3E4C] font-light min-w-[170px]`}>{dataLang?.productions_orders_details_branch || 'productions_orders_details_branch'}:</h3>

                  {isLoadingItemOrderDetail ? <Skeleton className='w-[150px] h-6' /> : <h3 className={`text-base-default font-medium text-[#141522]`}>{dataItemOrderDetail?.poi?.branch_name}</h3>}
                </div>
              </div>
            </div>

            <div className='grid grid-cols-3 3xl:gap-4 gap-2'>
              {isLoadingItemOrderDetail ? (
                [...Array(3)].map((_, index) => (
                  <React.Fragment key={`skeleton-cost-${index}`}>
                    <CostCardSkeleton className='col-span-1 w-full' />
                  </React.Fragment>
                ))
              ) : (
                <React.Fragment>
                  <CostCard
                    className='col-span-1 w-full'
                    title='Chi phí vật tư'
                    amount={formatMoney(dataItemOrderDetail?.cost?.cost_material)}
                    color='text-[#25387A]'
                    percent={Math.abs(dataItemOrderDetail?.cost?.percent_cost_material ?? 0)}
                    isUp={(dataItemOrderDetail?.cost?.percent_cost_material ?? 0) >= 0}
                  />
                  <CostCard
                    className='col-span-1 w-full'
                    title='Chi phí khác'
                    amount={formatMoney(dataItemOrderDetail?.cost?.cost_other)}
                    color='text-[#DC6803]'
                    percent={Math.abs(dataItemOrderDetail?.cost?.percent_cost_other ?? 0)}
                    isUp={(dataItemOrderDetail?.cost?.percent_cost_other ?? 0) >= 0}
                  />
                  <CostCard
                    className='col-span-1 w-full'
                    title='Tổng chi phí'
                    amount={formatMoney(dataItemOrderDetail?.cost?.total_cost)}
                    color='text-[#991B1B]'
                    percent={Math.abs(dataItemOrderDetail?.cost?.percent_total_cost ?? 0)}
                    isUp={(dataItemOrderDetail?.cost?.percent_total_cost ?? 0) >= 0}
                  />
                </React.Fragment>
              )}
            </div>
          </div>

          {/* tab */}
          <div className='flex flex-col gap-2'>
            {isLoadingItemOrderDetail ? (
              <TabSwitcherWithUnderlineSkeleton tabCount={6} />
            ) : (
              <TabSwitcherWithUnderline
                tabs={listTab}
                activeTab={isStateProvider?.productionsOrders?.isTabSheet}
                onChange={tab => handleActiveTab(tab, 'detail_sheet')}
                className={'flex items-center justify-start xxl:gap-2 gap-0 w-full'}
                renderLabel={(tab, activeTab) => (
                  <h3
                    className={`${
                      isStateProvider?.productionsOrders?.isTabSheet?.id === tab.id ? 'text-[#0375F3] scale-[1.02]' : 'text-[#9295A4] scale-[1]'
                    } 3xl:text-base xxl:text-sm xl:text-xs lg:text-[10px] text-xs flex items-center gap-2 col-span-1 font-medium group-hover:text-[#0375F3] transition-all duration-100 ease-linear origin-left`}
                  >
                    <span>{tab.name}</span>
                    {tab.count > 0 && (
                      <span
                        className={`${
                          isStateProvider?.productionsOrders?.isTabSheet?.id === tab.id ? 'bg-[#0375F3]' : 'bg-[#9295A4] group-hover:bg-[#0375F3]'
                        } 3xl:size-5 size-4 3xl:text-[11px] text-[10px] text-white rounded-full flex items-center justify-center custom-transition`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </h3>
                )}
              />
            )}

            {/* content tab */}
            <div className='w-full my-2'>{components[isStateProvider?.productionsOrders?.isTabSheet?.id]}</div>
          </div>
        </div>
      </Customscrollbar>

      {isStateProvider?.productionsOrders?.isTabSheet?.id == 1 && <CommentInputAdvanced />}
    </div>
  );
});

export default SheetProductionsOrderDetail;
