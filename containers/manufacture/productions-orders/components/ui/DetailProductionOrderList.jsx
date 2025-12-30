import ButtonAnimationNew from '@/components/common/button/ButtonAnimationNew';
import FilterDropdown from '@/components/common/dropdown/FilterDropdown';
import ProgressStageBar from '@/components/common/progress/ProgressStageBar';
import { ArrowCounterClockWiseIcon, CaretDownIcon, CaretDropDownThinIcon, CheckThinIcon, KanbanIcon, NoteIcon, TrashIcon, UserPlusIcon } from '@/components/icons';
import UnionStepIcon from '@/components/icons/common/UnionStepIcon';
import { AvatarStack } from '@/components/UI/common/user';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import { StateContext } from '@/context/_state/productions-orders/StateContext';
import { useSearchStaffs } from '@/hooks/common/useStaffs';
import useSetingServer from '@/hooks/useConfigNumber';
import { useProductionOrderManagerDetail } from '@/managers/api/productions-order/useProductionOrderManagerDetail';
import { useSaveProductionOrderManagerDetail } from '@/managers/api/productions-order/useSaveProductionOrderManagerDetail';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { memo, useCallback, useContext, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { listDropdownCompleteStage } from '../main/constants/listData';
import PopupConfimStage from '../popup/PopupConfimStage';
import ResponsiblePersonComboBox from '../popup/ResponsiblePersonComboBox';

// Sub-component for ProductRow to use hooks
const ProductRow = memo(
  ({ product, index, item, totalLength, formatNumber, handleToggleSheetDetail, isStateProvider, dataLang, openManagerComboId, setOpenManagerComboId, branchId, canManageManagers = true }) => {
  const po_id = item.po_id;
  const poi_id = product.poi_id;

  // Gọi hook để lấy manager detail
  const { data: managerDetailData, refetch: refetchManagerDetail } = useProductionOrderManagerDetail({
    po_id,
    poi_id,
    enabled: !!po_id && !!poi_id,
  });

  // Gọi hook để lấy danh sách staffs
  const { data: staffs } = useSearchStaffs({
    branch_ids: branchId ? [branchId] : [],
    enabled: !!branchId,
    po_id: po_id,
  });

  // Map dữ liệu từ API response
  const listStaffs = useMemo(() => {
    return (
      staffs?.data?.staffs?.map(e => ({
        id: e.staffid,
        name: e.full_name,
        avatarUrl: e.profile_image,
      })) || []
    );
  }, [staffs]);

  // Map dữ liệu từ API response - dùng để hiển thị selected
  const managerAvatars = useMemo(() => {
    const details = managerDetailData?.data?.production_order_manager_details || [];
    return details.map(mgr => ({
      id: mgr?.staff?.staffid || mgr?.staff_id,
      name: mgr?.staff?.full_name || 'Không tên',
      avatarUrl: mgr?.staff?.profile_image || '',
    }));
  }, [managerDetailData]);

  // Filter managerAvatars để chỉ lấy những người có trong listStaffs
  // Đảm bảo combo box có thể active đúng các item đã chọn
  const selectedManagers = useMemo(() => {
    if (!listStaffs || listStaffs.length === 0) return [];
    const staffIds = new Set(listStaffs.map(staff => staff.id));
    return managerAvatars.filter(manager => staffIds.has(manager.id));
  }, [managerAvatars, listStaffs]);

  // Hook để save production order manager detail
  const { saveProductionOrderManagerDetail, isLoading: isSaving } = useSaveProductionOrderManagerDetail({
    onSuccess: (response) => {
      console.log('Save manager detail success:', response);
      // Refresh lại dữ liệu manager detail
      refetchManagerDetail();
      // Đóng combo box
      setOpenManagerComboId(null);
    },
    onError: (error) => {
      console.error('Save manager detail error:', error);
    },
  });

  // Hàm handle submit để lưu danh sách người phụ trách
  const handleSubmit = useCallback(
    (selected) => {
      // Format payload theo yêu cầu
      const payload = {
        po_id: po_id,
        poi_id: poi_id,
        items: selected.map(person => ({
          staff_id: person.id,
          is_manufacture: 1, // 1: Phụ trách sản xuất
        })),
      };

      // Gọi API để lưu
      saveProductionOrderManagerDetail(payload);
    },
    [po_id, poi_id, saveProductionOrderManagerDetail]
  );

  const colorMap = {
    0: { color: 'bg-[#FF811A]/15 text-[#C25705]', title: dataLang?.productions_orders_produced || 'produced' },
    1: { color: 'bg-[#3ECeF7]/20 text-[#076A94]', title: dataLang?.productions_orders_in_progress || 'in progress' },
    2: { color: 'bg-[#35BD4B]/20 text-[#1A7526]', title: dataLang?.productions_orders_completed || 'completed' },
    3: { color: 'bg-[#F54A45]/20 text-[#C02A26]', title: dataLang?.productions_orders_overdue || 'overdue' },
  };
  const color = colorMap[product?.status_item];

  return (
    <div
      key={`product-${index}`}
      onClick={() => handleToggleSheetDetail(product, managerAvatars)}
      className={`col-span-16 grid grid-cols-23 gap-2 items-center group hover:bg-gray-100 cursor-pointer transition-all duration-150 ease-in-out 3xl:py-4 py-2 ${
        totalLength - 1 === index ? 'border-transparent' : 'border-b'
      }`}
    >
      <h4 className='col-span-1 flex items-center justify-center text-center text-[#141522] font-semibold xl:text-sm text-xs uppercase px-1'>{index + 1 ?? '-'}</h4>

      <h4 className='col-span-5 text-[#344054] font-normal flex items-center py-2 px-1'>
      {/* <h4 className='col-span-6 text-[#344054] font-normal flex items-center py-2 px-1'> */}
        <div className='flex items-start gap-2'>
          <div className='2xl:size-16 size-14 shrink-0'>
            <Image alt={product?.name ?? 'img'} width={200} height={200} src={product?.images ?? '/icon/default/default.png'} className='size-full object-cover rounded-md' />
          </div>

          <div className='flex flex-col 3xl:gap-1 gap-0.5'>
            <p
              className={`font-semibold 3xl:text-base xl:text-sm text-xs ${
                isStateProvider?.productionsOrders.dataModal.id === product.id ? 'text-[#0F4F9E]' : 'text-[#141522] group-hover:text-[#0F4F9E]'
              }`}
            >
              {product.item_name}
            </p>
            <div className='space-y-0.5'>
              <p className='text-[#667085] font-normal xl:text-[10px] text-[8px]'>{product.product_variation}</p>

              <p className='text-[#3276FA] font-normal 3xl:text-sm xl:text-xs text-[10px]'>{product.item_code}</p>

              <p className='text-[#3276FA] font-normal 3xl:text-sm xl:text-xs text-[10px]'>{product.reference_no_detail}</p>
            </div>
          </div>
        </div>
      </h4>

      <h4 className='col-span-2 text-start text-[#141522] font-semibold xl:text-sm text-xs px-1'>{product?.unit_name ?? ''}</h4>
      <h4 className='col-span-2 text-center text-[#141522] font-semibold xl:text-sm text-xs uppercase px-1'>{product.quantity > 0 ? formatNumber(product.quantity) : '-'}</h4>
      <h4 className='col-span-2 text-center text-[#141522] font-semibold xl:text-sm text-xs uppercase px-1'>{product.quantity_stage_end > 0 ? formatNumber(product.quantity_stage_end) : '-'}</h4>
      <h4 className='col-span-3 text-center text-[#141522] font-semibold xl:text-sm text-xs px-1 flex justify-center items-center'>
        {canManageManagers ? (
          <div
            onClick={e => {
              setOpenManagerComboId(product.poi_id);
              e.stopPropagation();
            }}
          >
            <ResponsiblePersonComboBox
              className='!max-h-[300px]'
              open={openManagerComboId === product.poi_id}
              onClose={() => setOpenManagerComboId(null)}
              data={listStaffs}
              selected={selectedManagers}
              hideSelected={false}
              onConfirm={selected => {
                handleSubmit(selected);
              }}
            >
              <div>
                {managerAvatars.length > 0 ? (
                  <AvatarStack people={managerAvatars} size={32} />
                ) : (
                  <button className='cursor-pointer flex items-center justify-start w-[112px] px-3 h-10 rounded-lg border border-[#003DA0] hover:bg-[#EBF5FF] transition-colors'>
                    <UserPlusIcon className='size-5 text-[#11315B]' />
                  </button>
                )}
              </div>
            </ResponsiblePersonComboBox>
          </div>
        ) : managerAvatars.length > 0 ? (
          <AvatarStack people={managerAvatars} size={32} />
        ) : null}
      </h4>

      <h4 className='col-span-3 flex items-center justify-start px-1'>
        <p className={`${color?.color} 3xl:text-sm text-xs px-2 py-1 rounded font-normal w-fit h-fit`}>{color?.title}</p>
      </h4>

      <h4 className='col-span-5 flex items-center justify-center xl:text-sm text-xs px-1'>
      {/* <h4 className='col-span-7 flex items-center justify-center xl:text-sm text-xs px-1'> */}
        <ProgressStageBar total={product?.count_stage} done={product?.count_stage_active} quantity={product?.quantity_stage} name_active={product?.stage_name_active ?? ''} />
      </h4>
    </div>
  );
});

ProductRow.displayName = 'ProductRow';

const DetailProductionOrderList = memo(({ 
  handleToggleAccordionList, 
  isLoadingRight, 
  dataLang, 
  handleToggleSheetDetail, 
  canManageManagers = true,
  // Props cho toolbar
  processSteps,
  managerAvatars,
  typePageMoblie,
  hasPoPermission,
  authState,
  isShow,
  handClickDropdownCompleteStage,
  listPrintTask,
  refreshData,
  handleQueryId,
  refetchProductionOrderList,
  groupButtonRef,
}) => {
  const dispatch = useDispatch();
  const dataSeting = useSetingServer();
  const formatNumber = useCallback(num => formatNumberConfig(+num, dataSeting), [dataSeting]);
  const { isStateProvider } = useContext(StateContext);
  const [visibleProducts, setVisibleProducts] = useState({});
  const [openManagerComboId, setOpenManagerComboId] = useState(null);

  // Lấy branch_id từ production order
  const branchId = isStateProvider?.productionsOrders?.dataProductionOrderDetail?.productionOrder?.branch_id;

  // Trigger buttons cho dropdown
  const triggerCompleteStage = (
    <div className='3xl:h-10 h-9 xl:px-4 px-2 flex items-center xl:gap-4 gap-2 font-medium text-white border-[#0375F3] bg-[#0375F3] hover:bg-[#0375F3] hover:opacity-80 cursor-pointer hover:shadow-hover-button rounded-lg custom-transition'>
      <span className='flex items-center gap-1 xl:gap-2'>
        <CheckThinIcon className='xl:size-4 size-3.5 shrink-0' />
        <span className='responsive-text-base'>Tác vụ</span>
      </span>
      <CaretDropDownThinIcon className='xl:size-4 size-3.5 shrink-0' />
    </div>
  );

  const triggerPrintTask = (
    <div className='3xl:h-10 h-9 xl:px-4 px-2 flex items-center gap-2 border border-[#D0D5DD] hover:border-[#3276FA] bg-white hover:bg-[#EBF5FF] cursor-pointer hover:shadow-hover-button rounded-lg custom-transition'>
      <span className='responsive-text-base font-medium text-[#3A3E4C]'>Tác vụ in</span>
      <CaretDownIcon className='text-[#9295A4] size-4' />
    </div>
  );

  const handleShowMoreProducts = useCallback((itemId, total) => {
    setVisibleProducts(prev => ({ ...prev, [itemId]: total }));
  }, []);

  const handleToggleAccordion = useCallback(
    id => {
      handleToggleAccordionList(id, 'listPOItems');
      setVisibleProducts(prev => ({ ...prev, [id]: 4 }));
    },
    [handleToggleAccordionList]
  );

  const renderProductRow = useCallback(
    (product, index, item, totalLength) => {
      return (
        <ProductRow
          product={product}
          index={index}
          item={item}
          totalLength={totalLength}
          formatNumber={formatNumber}
          handleToggleSheetDetail={handleToggleSheetDetail}
          isStateProvider={isStateProvider}
          dataLang={dataLang}
          openManagerComboId={openManagerComboId}
          setOpenManagerComboId={setOpenManagerComboId}
          branchId={branchId}
          canManageManagers={canManageManagers}
        />
      );
    },
    [formatNumber, handleToggleSheetDetail, isStateProvider, dataLang, openManagerComboId, setOpenManagerComboId]
  );

  if (isLoadingRight) return <Loading className='h-80' color='#0f4f9e' />;

  const list = isStateProvider?.productionsOrders?.dataProductionOrderDetail?.listPOItems || [];

  if (!list.length) return <NoData />;

  return (
    <div className='flex flex-col gap-4 h-full'>
      {/* Toolbar - Process Steps và Action Buttons */}
      <div className='flex items-center justify-between mb-4'>
        {/* Process Steps */}
        <div className='flex items-center gap-0'>
          <div className='relative z-[3] flex items-center justify-center min-w-[140px]'>
            <UnionStepIcon active={processSteps?.materials_plan?.is_active || false} className='h-11 2xl:h-[45px] w-auto flex-shrink-0' />
            <span
              className={`absolute inset-0 flex items-center justify-center font-medium text-xs whitespace-nowrap px-4 ${
                processSteps?.materials_plan?.is_active ? 'text-white' : 'text-[#9295A4]'
              }`}
            >
              1. Kế hoạch NVL
            </span>
          </div>

          <div className='relative z-[2] flex items-center justify-center min-w-[160px] -ml-[23px]'>
            <UnionStepIcon active={processSteps?.export_production?.is_active || false} className='h-11 2xl:h-[45px] w-auto flex-shrink-0' />
            <span
              className={`absolute inset-0 flex items-center justify-center font-medium text-xs whitespace-nowrap px-4 ml-3 ${
                processSteps?.export_production?.is_active ? 'text-white' : 'text-[#9295A4]'
              }`}
            >
              2. Xuất kho sản xuất
            </span>
          </div>

          <div className='relative z-[1] flex items-center justify-center min-w-[120px] -ml-[23px]'>
            <UnionStepIcon active={processSteps?.import_finished_goods?.is_active || false} className='h-11 2xl:h-[45px] w-auto flex-shrink-0' />
            <span
              className={`absolute inset-0 flex items-center justify-center font-medium text-xs whitespace-nowrap px-4 ${
                processSteps?.import_finished_goods?.is_active ? 'text-white' : 'text-[#9295A4]'
              }`}
            >
              3. Nhập kho TP
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div ref={groupButtonRef} className='flex items-center justify-end gap-2 p-0.5 mb-2'>
          {/* <div className='flex items-center gap-2 p-3 bg-[#FFF1D0] border border-[#F5BF40] rounded-lg'>

          </div> */}
          <div
            onClick={() => {
              dispatch({ type: 'statePopupListResponsiblePerson', payload: { open: true } });
            }}
            className='cursor-pointer'
          >
            {managerAvatars?.length > 0 ? (
              <AvatarStack people={managerAvatars} size={32} className='mr-2' />
            ) : (
              <ButtonAnimationNew
                icon={
                  <div className='size-4'>
                    <UserPlusIcon className='size-full text-[#11315B]' />
                  </div>
                }
                title='Thêm người phụ trách'
                className='3xl:h-10 h-9 xl:px-4 px-2 flex items-center gap-2 xl:text-sm text-xs font-medium text-[#11315B] bg-white border border-[#D0D5DD] hover:bg-[#F7F8F9] hover:shadow-hover-button rounded-lg'
              />
            )}
          </div>

          <FilterDropdown
            trigger={triggerCompleteStage}
            style={{
              boxShadow: '0px 5px 35px 0px #00000012',
            }}
            className='flex flex-col !p-0 border-[#D8DAE5] rounded-lg shrink-0 w-fit'
            classNameContainer='!w-fit'
            dropdownId='dropdownCompleteStage'
            placement='bottom-right'
          >
            {listDropdownCompleteStage?.map((tab, index) => {
              const isFirst = index === 0;
              const isLast = index === listDropdownCompleteStage.length - 1;
              const borderClass = isLast ? 'border-transparent rounded-b-lg border-t-transparent' : isFirst ? 'rounded-t-lg border-t-transparent' : 'border-t-transparent';
              const hasTabPermission = tab?.permission && hasPoPermission ? hasPoPermission(tab.permission) : true;

              return (
                <div
                  key={tab.id}
                  className={`hover:bg-[#F3F4F6] border-b border-[#F7F8F9] border-t flex items-center gap-3 cursor-pointer px-4 py-3 custom-transition whitespace-nowrap ${borderClass} select-none`}
                  onClick={() => {
                    if (!hasTabPermission) {
                      isShow('error', dataLang?.no_permission || 'Bạn không có quyền thực hiện thao tác này');
                      return;
                    }
                    handClickDropdownCompleteStage(tab.type);
                  }}
                >
                  {tab.type === 'complete_stage' ? (
                    <div className='flex items-center gap-2 w-full' onClick={e => !!hasTabPermission ? e.stopPropagation() : null}>
                      <div className='flex-1'>
                        {hasTabPermission ? (
                          <PopupConfimStage
                            dataLang={dataLang}
                            dataRight={isStateProvider?.productionsOrders}
                            typePageMoblie={typePageMoblie}
                            refetch={() => {
                              refetchProductionOrderList();
                            }}
                          />
                        ) : (
                          <div className='flex items-center gap-2'>
                            <span className='3xl:size-5 size-4 text-[#0375F3] shrink-0'>
                              <KanbanIcon className='size-full' />
                            </span>
                            <span className='3xl:text-base text-sm font-normal text-[#101828] text-left'>Hoàn thành chi tiết công đoạn</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className='flex items-center gap-2 cursor-pointer'>
                      <span className='3xl:size-5 size-4 text-[#0375F3] shrink-0'>{tab.icon}</span>
                      <span className={`3xl:text-base text-sm font-normal text-[#101828] ${tab.color}`}>{tab.label}</span>
                      {authState?.is_upgrade && tab.isPremium && <span className='ml-1 bg-red-500 text-white px-2 pb-1 pt-0.5 rounded-full text-xs shrink-0'>pro</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </FilterDropdown>

          <FilterDropdown
            trigger={triggerPrintTask}
            style={{
              boxShadow: '0px 5px 35px 0px #00000012',
            }}
            className='flex flex-col !p-0 border-[#D8DAE5] rounded-lg shrink-0 w-fit'
            classNameContainer='!w-fit'
            dropdownId='dropdownPrintTask'
            placement='bottom-left'
          >
            {listPrintTask?.map((tab, index) => {
              const isFirst = index === 0;
              const isLast = index === listPrintTask.length - 1;
              const borderClass = isLast ? 'border-transparent rounded-b-lg border-t-transparent' : isFirst ? 'rounded-t-lg border-t-transparent' : 'border-t-transparent';

              return (
                <div
                  key={tab.id}
                  className={`group hover:bg-[#F3F4F6] border-b border-[#F7F8F9] border-t flex items-center gap-3 cursor-pointer px-4 py-3 custom-transition whitespace-nowrap ${borderClass} select-none`}
                  onClick={() => tab.action()}
                >
                  {tab.icon}
                  <span className='responsive-text-base text-[#101828] group-hover:text-[#0375F3]'>{tab.label}</span>
                </div>
              );
            })}
          </FilterDropdown>

          <ButtonAnimationNew
            icon={<ArrowCounterClockWiseIcon className='size-4' />}
            title='Tải lại'
            className='3xl:h-10 h-9 xl:px-4 px-2 flex items-center gap-2 xl:text-sm text-xs font-normal text-[#0BAA2E] border border-[#0BAA2E] hover:bg-[#ebfff2] hover:shadow-hover-button rounded-lg'
            onClick={refreshData}
          />
          <ButtonAnimationNew
            icon={
              <div className='3xl:size-5 size-4'>
                <TrashIcon className='size-full' />
              </div>
            }
            onClick={() => {
              handleQueryId({
                status: true,
                id: isStateProvider?.productionsOrders.idDetailProductionOrder,
              });
            }}
            title='Xoá'
            className='3xl:h-10 h-9 xl:px-4 px-2 flex items-center gap-2 xl:text-sm text-xs font-normal text-[#EE1E1E] border border-[#EE1E1E] hover:bg-[#FFEEF0] hover:shadow-hover-button rounded-lg'
          />
        </div>
      </div>

      {/* Nội dung danh sách */}
      {list.map(item => (
        <div key={`product-${item.id}`} className='grid grid-cols-12 items-start select-none'>
          <div
            onClick={() => handleToggleAccordion(item.id)}
            className={`col-span-12 border flex items-center justify-between px-3 rounded-lg cursor-pointer custom-transition group ${
              item.showChild ? 'border-[#3276FA] bg-[#EBF5FF] text-[#0F4F9E]' : 'border-[#D0D5DD] bg-white text-[#3A3E4C] hover:border-[#3276FA] hover:bg-[#EBF5FF] hover:text-[#0F4F9E]'
            }`}
          >
            <div className='flex items-center gap-2'>
              <div className={`${item.showChild ? 'text-[#0F4F9E]' : 'text-[#9295A4] group-hover:text-[#0F4F9E]'} 3xl:size-5 size-4 custom-transition`}>
                <NoteIcon className='size-full' />
              </div>
              <h1 className='font-normal 3xl:text-base text-sm py-2 space-x-1'>
                <span>Đơn hàng:</span>
                <span>{item.title}</span>
              </h1>
              {item.showChild && (
                <span className='rounded-full bg-[#0F4F9E] !text-white xl:text-xs text-[8px] xl:size-5 size-4  flex items-center justify-center'>{item.items_products?.length ?? 0}</span>
              )}
            </div>
            <div className={`${item.showChild ? 'rotate-180 text-[#0F4F9E]' : 'text-[#9295A4] group-hover:text-[#0F4F9E]'} size-4 custom-transition`}>
              <CaretDownIcon className='size-full' />
            </div>
          </div>

          <AnimatePresence initial={false}>
            {item.showChild && (
              <motion.div
                key={`accordion-body-${item.id}-open`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className='col-span-12 grid grid-cols-16 mt-2'
              >
                {/* header */}
                <div className='col-span-16 grid grid-cols-23 gap-2 py-4 border-b'>
                  <h4 className='xl:text-sm text-xs text-center text-[#9295A4] font-semibold col-span-1 px-1'>STT</h4>
                  {/* <h4 className='xl:text-sm text-xs text-start text-[#9295A4] font-semibold col-span-6 px-1'>{dataLang?.Q_materials_finish_product || 'Q_materials_finish_product'}</h4> */}
                  <h4 className='xl:text-sm text-xs text-start text-[#9295A4] font-semibold col-span-5 px-1'>{dataLang?.Q_materials_finish_product || 'Q_materials_finish_product'}</h4>
                  <h4 className='xl:text-sm text-xs text-start text-[#9295A4] font-semibold col-span-2 px-1'>{dataLang?.Q_materials_unit || 'Q_materials_unit'}</h4>
                  <h4 className='xl:text-sm text-xs text-center text-[#9295A4] font-semibold col-span-2 px-1'>SL cần</h4>
                  <h4 className='xl:text-sm text-xs text-center text-[#9295A4] font-semibold col-span-2 px-1'>SL đã nhập</h4>
                  <h4 className='xl:text-sm text-xs text-center text-[#9295A4] font-semibold col-span-3 px-1'>Phụ trách sản xuất</h4>
                  <h4 className='xl:text-sm text-xs text-start text-[#9295A4] font-semibold col-span-3 px-1'>{dataLang?.Q_materials_status || 'Q_materials_status'}</h4>
                  {/* <h4 className='xl:text-sm text-xs text-center text-[#9295A4] font-semibold block col-span-7 px-1'>{dataLang?.Q_materials_progress || 'Q_materials_progress'}</h4> */}
                  <h4 className='xl:text-sm text-xs text-center text-[#9295A4] font-semibold block col-span-5 px-1'>{dataLang?.Q_materials_progress || 'Q_materials_progress'}</h4>
                </div>
                {item.items_products &&
                  item.items_products
                    ?.slice(0, visibleProducts[item.id] || 4)
                    ?.map((product, index) => renderProductRow(product, index, item, item.items_products?.length > 4 ? visibleProducts[item.id] || 4 : item.items_products?.length))}

                {/* load more click */}
                {(item.items_products?.length || 0) > (visibleProducts[item.id] || 4) && (
                  <div className='col-span-16 flex justify-center py-2'>
                    <button onClick={() => handleShowMoreProducts(item.id, item.items_products.length)} className='text-[#667085] 3xl:text-base text-sm hover:underline'>
                      Xem thêm ({item.items_products.length - (visibleProducts[item.id] || 4)}) Thành phẩm
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
});

export default DetailProductionOrderList;
