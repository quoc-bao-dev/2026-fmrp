import FilterDropdown from '@/components/common/dropdown/FilterDropdown';
import SelectSearchableRadio from '@/components/common/select/SelectSearchableRadio';
import TabSwitcherWithUnderline from '@/components/common/tab/TabSwitcherWithUnderline';
import { CaretDownIcon, ExcelIcon2, FunnelIcon, UserGroupIcon, UsersIcon } from '@/components/icons';
import Breadcrumb from '@/components/UI/breadcrumb/BreadcrumbCustom';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { Container } from '@/components/UI/common/layout';
import ResponsibleAvatar from '@/components/UI/common/user/ResponsibleAvatar';
import DateToDateComponent from '@/components/UI/filterComponents/dateTodateComponent';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import { IMAGES } from '@/constants/images';
import { useProductionOrdersCombobox } from '@/containers/manufacture/productions-orders/hooks/useProductionOrdersCombobox';
import { useExportExcel } from '@/containers/piecework-wage/summary/hooks/useExportExcel';
import { useItemsVariantSearchCombobox } from '@/hooks/common/useItems';
import { useSearchStaffs } from '@/hooks/common/useStaffs';
import useToast from '@/hooks/useToast';
import { useLookupGroupMembers } from '@/managers/api/piecework-wage/useImportOutput';
import { useSummary, useSummaryDetail } from '@/managers/api/piecework-wage/useSummary';
import formatNumber from '@/utils/helpers/formatnumber';
import { formatSecondsToHours } from '@/utils/helpers/formatSecondsToHours';
import moment from 'moment';
import Head from 'next/head';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { PiClipboardTextLight } from 'react-icons/pi';
import { useDebounce } from 'use-debounce';

const breadcrumbItems = [
  { label: 'Lương sản lượng', },
  { label: 'Tổng hợp lương sản lượng', },
];

const tabs = [
  { id: 'summary', name: 'Tổng hợp' },
  { id: 'detail', name: 'Chi tiết' },
];

// Lưu item đang chọn ra ngoài, và luôn đưa item đó lên đầu danh sách options (loại trùng)
const normalizeTop = (pinned, options) => {
  if (!pinned || pinned.length === 0) return options || [];
  const pinnedKeys = new Set(pinned.map(p => String(p.value)));
  const list = options || [];
  return [...pinned, ...list.filter(o => !pinnedKeys.has(String(o?.value)))];
};

const Summary = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [selectedStaffIds, setSelectedStaffIds] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState([]);
  const [selectedProductionOrder, setSelectedProductionOrder] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState([]);
  const [pinnedProductionOrders, setPinnedProductionOrders] = useState([]);
  const [pinnedProducts, setPinnedProducts] = useState([]);
  const [searchProductionOrder, setSearchProductionOrder] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [debouncedSearchProductionOrder] = useDebounce(searchProductionOrder, 300);
  const [debouncedSearchProduct] = useDebounce(searchProduct, 300);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);
  const showToast = useToast();
  const [dateFilter, setDateFilter] = useState({
    startDate: moment().startOf('month').toDate(),
    endDate: moment().endOf('month').toDate(),
  });
  const { data: listStaffs } = useSearchStaffs();
  const { data: listGroupMembers } = useLookupGroupMembers({ limit: 100 });
  const { data: comboboxProductionOrders = [], isLoading: isLoadingProductionOrder, isFetching: isFetchingProductionOrder } = useProductionOrdersCombobox(debouncedSearchProductionOrder);
  const { data: listProducts = [], isLoading: isLoadingProduct, isFetching: isFetchingProduct } = useItemsVariantSearchCombobox(debouncedSearchProduct);

  // Tạo options cho nhân sự/công nhân
  const staffOptions = useMemo(() => {
    const staffs = listStaffs?.data?.staffs || [];
    return staffs.map(item => ({
      value: String(item.staffid),
      label: item.full_name,
      avatar: item.profile_image || IMAGES.noImage,
    }));
  }, [listStaffs?.data?.staffs]);

  // Tạo options cho tổ/nhóm
  const groupOptions = useMemo(() => {
    const groups = listGroupMembers?.group_members || [];
    return groups.map(item => ({
      value: String(item.id),
      label: item.name,
      avatar: item.avatar || IMAGES.groupUser,
    }));
  }, [listGroupMembers?.group_members]);

  // Tạo options cho Lệnh sản xuất (từ comboboxProductionOrders)
  const productionOrderOptions = useMemo(() => {
    return (comboboxProductionOrders || []).map(item => ({
      value: String(item.value),
      label: item.label,
    }));
  }, [comboboxProductionOrders]);

  // Tạo options cho Mặt hàng (từ listProducts)
  const productOptions = useMemo(() => {
    return (listProducts || []).map(item => ({
      value: String(item.value),
      label: item.e?.item_name || item.label,
      subtitle: item.e?.product_variation || '',
      avatar: item.e?.images || IMAGES.noImage,
    }));
  }, [listProducts]);

  const productionOrderOptionsWithPinned = normalizeTop(pinnedProductionOrders, productionOrderOptions);
  const productOptionsWithPinned = normalizeTop(pinnedProducts, productOptions);

  // Tạo filter params từ selectedStaffIds và selectedGroup
  const filterParams = useMemo(() => {
    const params = {};
    if (selectedStaffIds.length > 0) {
      params.staff_ids = selectedStaffIds;
    }
    if (selectedGroup.length > 0) {
      params.group_ids = selectedGroup;
    }
    return params;
  }, [selectedStaffIds, selectedGroup]);

  // Chuẩn hóa params dùng chung cho 2 API để tránh lặp và lệch state
  const dateParams = useMemo(() => ({
    start_date: dateFilter.startDate ? moment(dateFilter.startDate).format('DD/MM/YYYY') : null,
    end_date: dateFilter.endDate ? moment(dateFilter.endDate).format('DD/MM/YYYY') : null,
  }), [dateFilter.startDate, dateFilter.endDate]);

  const commonQueryParams = useMemo(() => {
    const params = {
      ...dateParams,
      cursor: 0,
      limit: 10,
      search: debouncedSearch || '',
      ...filterParams,
    };
    if (selectedProductionOrder.length > 0) {
      params.po_ids = selectedProductionOrder;
    }
    if (selectedProduct.length > 0) {
      params.item_ids = selectedProduct;
    }
    return params;
  }, [dateParams, debouncedSearch, filterParams, selectedProductionOrder, selectedProduct]);

  const { data: summary, isLoading: isLoadingSummary, refetch: refetchSummary } = useSummary(
    commonQueryParams,
    { enabled: activeTab.id === 'summary' },
  );

  const { data: summaryDetail, isLoading: isLoadingSummaryDetail, refetch: refetchSummaryDetail } = useSummaryDetail(
    commonQueryParams,
    { enabled: activeTab.id === 'detail' },
  );

  const summaryDetailItems = useMemo(() => (summaryDetail?.items ?? []), [summaryDetail?.items]);

  const excelFileName = useMemo(() => {
    const s = dateFilter.startDate ? moment(dateFilter.startDate).format('DD-MM-YYYY') : 'all';
    const e = dateFilter.endDate ? moment(dateFilter.endDate).format('DD-MM-YYYY') : 'all';
    return `tong-hop-luong-san-luong_${s}_${e}`;
  }, [dateFilter.startDate, dateFilter.endDate]);

  const { isExporting, exportExcel } = useExportExcel({
    commonQueryParams,
    excelFileName,
    showToast,
  });

  // Tính rowspan cho "Công nhân" và "Công đoạn" (gộp các dòng LIỀN KỀ nhau)
  const detailRowSpans = useMemo(() => {
    const items = summaryDetailItems;
    const staffRowSpan = Array(items.length).fill(1);
    const staffShowCell = Array(items.length).fill(true);

    const stageRowSpan = Array(items.length).fill(1);
    const stageShowCell = Array(items.length).fill(true);

    // Staff grouping
    for (let i = 0; i < items.length; i++) {
      const staffKey = String(items[i]?.staff_id ?? '');
      if (i > 0 && staffKey === String(items[i - 1]?.staff_id ?? '')) {
        staffShowCell[i] = false;
        continue;
      }
      let j = i + 1;
      while (j < items.length && String(items[j]?.staff_id ?? '') === staffKey) j++;
      staffRowSpan[i] = j - i;
    }

    // Stage grouping within same staff (tránh gộp công đoạn giữa 2 staff khác nhau)
    for (let i = 0; i < items.length; i++) {
      const staffKey = String(items[i]?.staff_id ?? '');
      const stageKey = String(items[i]?.stage_id ?? items[i]?.stage_name ?? '');
      const composite = `${staffKey}__${stageKey}`;
      const prevComposite = i > 0
        ? `${String(items[i - 1]?.staff_id ?? '')}__${String(items[i - 1]?.stage_id ?? items[i - 1]?.stage_name ?? '')}`
        : null;

      if (i > 0 && composite === prevComposite) {
        stageShowCell[i] = false;
        continue;
      }
      let j = i + 1;
      while (j < items.length) {
        const nextComposite = `${String(items[j]?.staff_id ?? '')}__${String(items[j]?.stage_id ?? items[j]?.stage_name ?? '')}`;
        if (nextComposite !== composite) break;
        j++;
      }
      stageRowSpan[i] = j - i;
    }

    return { staffRowSpan, staffShowCell, stageRowSpan, stageShowCell };
  }, [summaryDetailItems]);

  const totalDetailTime = useMemo(
    () =>
      summaryDetailItems.reduce(
        (sum, row) => sum + (Number(row?.total_time) || 0),
        0,
      ),
    [summaryDetailItems],
  );

  const totalDetailQuantity = useMemo(
    () =>
      summaryDetailItems.reduce(
        (sum, row) => sum + (Number(row?.total_quantity) || 0),
        0,
      ),
    [summaryDetailItems],
  );

  const totalDetailAmount = useMemo(
    () =>
      summaryDetailItems.reduce(
        (sum, row) => sum + (Number(row?.total_amount) || 0),
        0,
      ),
    [summaryDetailItems],
  );

  // Xử lý khi chọn công nhân (multiple mode)
  const handleStaffChange = (values) => {
    setSelectedStaffIds(Array.isArray(values) ? values : []);
  };

  // Xử lý khi search
  const handleStaffClear = () => {
    setSelectedStaffIds([]);
  };

  // Xử lý khi chọn tổ/nhóm (multiple mode)
  const handleGroupChange = (values) => {
    setSelectedGroup(Array.isArray(values) ? values : []);
  };

  // Xử lý khi clear tổ/nhóm
  const handleGroupClear = () => {
    setSelectedGroup([]);
  };

  // Xử lý chọn Lệnh sản xuất (multiple mode)
  const handleProductionOrderChange = (values) => {
    const selectedValues = Array.isArray(values) ? values : [];
    setSelectedProductionOrder(selectedValues);
    
    // Cập nhật pinned items: giữ lại các item cũ nếu vẫn còn trong selectedValues, thêm item mới
    setPinnedProductionOrders(prev => {
      const selectedKeys = new Set(selectedValues.map(v => String(v)));
      
      // Giữ lại các pinned items cũ nếu vẫn còn được chọn
      const keptPinned = prev.filter(p => selectedKeys.has(String(p.value)));
      
      // Tìm các item mới được chọn nhưng chưa có trong pinned
      const existingKeys = new Set(keptPinned.map(p => String(p.value)));
      const newPinned = selectedValues
        .filter(val => !existingKeys.has(String(val)))
        .map(val => {
          // Ưu tiên tìm trong options hiện tại
          const found = productionOrderOptions.find(o => String(o?.value) === String(val));
          if (found) return found;
          // Nếu không tìm thấy trong options hiện tại, tìm trong pinned cũ
          return prev.find(p => String(p.value) === String(val));
        })
        .filter(Boolean);
      
      return [...keptPinned, ...newPinned];
    });
  };

  const handleProductionOrderClear = () => {
    setSelectedProductionOrder([]);
    setPinnedProductionOrders([]);
  };

  // Xử lý chọn Mặt hàng (multiple mode)
  const handleProductChange = (values) => {
    const selectedValues = Array.isArray(values) ? values : [];
    setSelectedProduct(selectedValues);
    
    // Cập nhật pinned items: giữ lại các item cũ nếu vẫn còn trong selectedValues, thêm item mới
    setPinnedProducts(prev => {
      const selectedKeys = new Set(selectedValues.map(v => String(v)));
      
      // Giữ lại các pinned items cũ nếu vẫn còn được chọn
      const keptPinned = prev.filter(p => selectedKeys.has(String(p.value)));
      
      // Tìm các item mới được chọn nhưng chưa có trong pinned
      const existingKeys = new Set(keptPinned.map(p => String(p.value)));
      const newPinned = selectedValues
        .filter(val => !existingKeys.has(String(val)))
        .map(val => {
          // Ưu tiên tìm trong options hiện tại
          const found = productOptions.find(o => String(o?.value) === String(val));
          if (found) return found;
          // Nếu không tìm thấy trong options hiện tại, tìm trong pinned cũ
          return prev.find(p => String(p.value) === String(val));
        })
        .filter(Boolean);
      
      return [...keptPinned, ...newPinned];
    });
  };

  const handleProductClear = () => {
    setSelectedProduct([]);
    setPinnedProducts([]);
  };

  // Tính số lượng filter đang active
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedProductionOrder.length > 0) count++;
    if (selectedProduct.length > 0) count++;
    return count;
  }, [selectedProductionOrder.length, selectedProduct.length]);

  const triggerFilterAll = (
    <button
      className={`${activeFilterCount > 0
        ? 'text-[#0F4F9E] border-[#3276FA] bg-[#EBF5FF]'
        : 'bg-white text-[#9295A4] border-[#D0D5DD] hover:text-[#0F4F9E] hover:bg-[#EBF5FF] hover:border-[#3276FA]'
        } flex items-center space-x-2 border rounded-lg h-10 px-3 group custom-transition`}
    >
      <FunnelIcon className='size-4' />
      <span className='responsive-text-base whitespace-nowrap custom-transition'>Bộ lọc</span>
      {activeFilterCount > 0 && <span className='rounded-full bg-[#0F4F9E] text-white text-xs size-5 flex items-center justify-center'>{activeFilterCount}</span>}
      <CaretDownIcon className='size-3.5 shrink-0 rotate-0' />
    </button>
  );

  return (
    <Container className='flex flex-col gap-3 pb-4'>
      <Head>
        <title>Tổng hợp lương sản lượng</title>
      </Head>
      <div className='flex flex-col gap-1'>
        <Breadcrumb
          items={breadcrumbItems}
          className="3xl:text-sm 2xl:text-xs xl:text-[10px] lg:text-[10px]"
        />
        <div className='flex justify-between items-center gap-1'>
          <h2 className='text-title-section text-[#52575E] capitalize font-medium'>
            Tổng hợp lương sản lượng
          </h2>
          <div className='flex items-center gap-2'>
            {process.env.NODE_ENV === 'development' && (
              <button className='h-10 bg-white px-4 py-2 rounded-lg flex items-center gap-2 border border-[#D0D5DD]'
                onClick={() => { refetchSummaryDetail(); refetchSummary(); }}
              >
                Tải lại
              </button>
            )}
            <DateToDateComponent
              placeholder='Chọn ngày'
              value={dateFilter}
              onChange={(value) => {
                setDateFilter({
                  startDate: value?.startDate || null,
                  endDate: value?.endDate || null,
                });
              }}
              className='text-base-default !w-fit h-10'
            />
            <FilterDropdown
              trigger={triggerFilterAll}
              classNameContainer='!w-auto'
              style={{
                boxShadow: '0px 20px 24px -4px #10182814, 0px 4px 4px 0px #00000040',
              }}
              className='z-[999] flex flex-col gap-4 border-[#D8DAE5] rounded-lg min-w-[450px]'
              dropdownId='dropdownFilterImportOutput'
            >
              <div className='text-lg text-[#344054] font-medium'>Bộ lọc</div>
              <div className='flex flex-col gap-3'>
                <div className='space-y-1'>
                  <h3 className='text-xs text-[#051B44] font-normal'>Lệnh sản xuất</h3>
                  <SelectSearchableRadio
                    placeholder='Chọn lệnh sản xuất'
                    searchPlaceholder='Tìm lệnh sản xuất'
                    options={productionOrderOptionsWithPinned}
                    value={selectedProductionOrder}
                    onChange={handleProductionOrderChange}
                    onClear={handleProductionOrderClear}
                    onSearch={setSearchProductionOrder}
                    icon={<PiClipboardTextLight className='size-4 text-[#003DA0]' />}
                    className='w-auto min-w-[180px] [&_.ant-select-selector]:h-9 [&_.ant-select-selector]:border-[#D0D5DD]'
                    mode='multiple'
                    loading={isLoadingProductionOrder || isFetchingProductionOrder}
                  />
                </div>
                <div className='space-y-1'>
                  <h3 className='text-xs text-[#051B44] font-normal'>Mặt hàng</h3>
                  <SelectSearchableRadio
                    placeholder='Chọn mặt hàng'
                    searchPlaceholder='Tìm mặt hàng'
                    options={productOptionsWithPinned}
                    value={selectedProduct}
                    onChange={handleProductChange}
                    onClear={handleProductClear}
                    onSearch={setSearchProduct}
                    icon={<FunnelIcon className='size-4 text-[#003DA0]' />}
                    className='w-auto min-w-[180px] [&_.ant-select-selector]:h-9 [&_.ant-select-selector]:border-[#D0D5DD]'
                    avatarClassName='rounded-md'
                    mode='multiple'
                    loading={isLoadingProduct || isFetchingProduct}
                  />
                </div>
              </div>
            </FilterDropdown>
          </div>
        </div>
      </div>
      <TabSwitcherWithUnderline
        className='-mt-3'
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
      <div className='flex flex-col gap-3 flex-1 min-h-0'>
        <div className='flex items-center gap-3'>
          <SelectSearchableRadio
            placeholder='Chọn công nhân'
            label='Chọn công nhân'
            searchPlaceholder='Tìm công nhân'
            options={staffOptions}
            value={selectedStaffIds}
            onChange={handleStaffChange}
            onClear={handleStaffClear}
            icon={<UsersIcon className='size-4 text-[#25387A]' />}
            className='w-[250px] [&_.ant-select-selector]:h-10 [&_.ant-select-selector]:border-[#D0D5DD]'
            mode='multiple'
          />
          <SelectSearchableRadio
            placeholder='Chọn tổ/nhóm'
            label='Chọn tổ/nhóm'
            searchPlaceholder='Tìm tổ/nhóm'
            options={groupOptions}
            value={selectedGroup}
            onChange={handleGroupChange}
            onClear={handleGroupClear}
            icon={<UserGroupIcon className='size-4 text-[#25387A]' />}
            className='w-[250px] [&_.ant-select-selector]:h-10 [&_.ant-select-selector]:border-[#D0D5DD]'
            mode='multiple'
          />
          <button
            type='button'
            onClick={exportExcel}
            disabled={isExporting}
            className={`h-[42px] flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-white border border-[#D0D5DD] transition-all duration-200 ease-in-out hover:bg-[#F5F7FA] hover:border-[#0375F3] group ${isExporting ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <ExcelIcon2 />
            <span className='text-sm font-medium text-[#25387A] transition-colors duration-200 group-hover:text-[#0375F3]'>
              {isExporting ? 'Đang xuất...' : 'Xuất file excel'}
            </span>
          </button>
        </div>
        {activeTab.id === 'summary' ? (
          <div className='bg-white overflow-hidden flex flex-col flex-1 min-h-0'>
            {/* Header */}
            <div className='grid grid-cols-20 responsive-text-sm font-semibold text-[#9295A4] gap-4 px-4 py-3 border-b border-[#F3F3F4] bg-white'>
              <div className='col-span-1 text-center'>STT</div>
              <div className='col-span-4'>Công nhân</div>
              <div className='col-span-3'>Nhóm</div>
              <div className='col-span-2'>Số lượng (cái)</div>
              <div className='col-span-2'>Giờ làm</div>
              <div className='col-span-3'>Tổng lương (VNĐ)</div>
              <div className='col-span-5'>Công đoạn</div>
            </div>

            {/* Rows */}
            <Customscrollbar className='flex-1 min-h-0'>
              {isLoadingSummary ? (
                <Loading />
              ) : (summary?.aggregate ?? []).length === 0 ? (
                <NoData />
              ) : (summary?.aggregate ?? []).map((row, index) => (
                <div
                  key={row?.staff_id || index}
                  className='grid grid-cols-20 gap-4 px-4 py-4 responsive-text-sm bg-white hover:bg-gray-50 transition-colors border-b border-[#F3F3F4]'
                >
                  <div className='col-span-1 text-center flex items-center justify-center font-semibold text-[#141522]'>
                    {index + 1}
                  </div>
                  <div className='col-span-4 flex items-center gap-2 text-start'>
                    <ResponsibleAvatar
                      avatarUrl={row?.staff?.profile_image || '/icon/default/default.png'}
                      fullName={row?.staff?.full_name || '-'}
                      size={32}
                    />
                    <span className='text-[#344054]'>{row?.staff?.full_name || '-'}</span>
                  </div>
                  <div className='col-span-3 font-semibold text-[#141522] flex items-center'>
                    {row?.groups.map(group => group.name).join(', ')}
                  </div>
                  <div className='col-span-2 font-semibold text-[#141522] flex items-center'>
                    {Number(row?.total_produced) ? formatNumber(Number(row?.total_produced)) : '-'}
                  </div>
                  <div className='col-span-2 font-semibold text-[#141522] flex items-center'>
                    {formatSecondsToHours(row?.total_time)}
                  </div>
                  <div className='col-span-3 font-semibold text-[#0375F3] flex items-center'>
                    {Number(row?.total_amount) ? `${formatNumber(Number(row?.total_amount))} đ` : '-'}
                  </div>
                  <div className='col-span-5 flex items-center gap-2 flex-wrap'>
                    {(row?.stages ?? []).map((stage) => (
                      <span
                        key={stage?.id}
                        className='px-2 py-1 bg-[#EBF5FF] text-[#035FD6] font-medium rounded'
                      >
                        {stage?.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </Customscrollbar>

            {/* Summary Row */}
            <div className='mt-2 grid grid-cols-20 gap-4 px-4 py-4 responsive-text-base font-semibold text-[#141522] bg-[#F0F0F0] rounded-xl'>
              <div className='col-span-1'></div>
              <div className='col-span-4 text-xl'>Tổng</div>
              <div className='col-span-3'></div>
              <div className='col-span-2'>
                {(() => {
                  const total = (summary?.aggregate ?? []).reduce(
                    (sum, row) => sum + (Number(row?.total_produced) || 0),
                    0,
                  );
                  return total ? `${formatNumber(total)} cái` : '-';
                })()}
              </div>
              <div className='col-span-2'>
                {(() => {
                  const totalSeconds = (summary?.aggregate ?? []).reduce(
                    (sum, row) => sum + (Number(row?.total_time) || 0),
                    0,
                  );
                  if (!totalSeconds) return "-";
                  return formatSecondsToHours(totalSeconds);
                })()}
              </div>
              <div className='col-span-3'>
                {(() => {
                  const total = (summary?.aggregate ?? []).reduce(
                    (sum, row) => sum + (Number(row?.total_amount) || 0),
                    0,
                  );
                  return total ? `${formatNumber(total)} đ` : '-';
                })()}
              </div>
              <div className='col-span-3'></div>
            </div>
          </div>
        ) : (
          <div className='bg-white overflow-hidden flex flex-col flex-1 min-h-0'>
            {/* Rows */}
            {isLoadingSummaryDetail ? (
              <Loading />
            ) : summaryDetailItems.length === 0 ? (
              <NoData />
            ) : (
              <div className='flex flex-col flex-1 min-h-0'>
                <div className='px-4 flex-1 min-h-0'>
                  <Customscrollbar className='flex-1 min-h-0' fullHeight>
                    <table className='w-full table-fixed border-separate border-spacing-0'>
                      <colgroup>
                        <col style={{ width: 40 }} />
                        <col style={{ width: 120 }} />
                        <col />
                        <col />
                        <col />
                        <col />
                        <col />
                        <col />
                        <col />
                      </colgroup>
                      <thead className='sticky top-0 bg-white z-[1]'>
                        <tr className='responsive-text-sm font-semibold text-[#9295A4]'>
                          <th className='w-[40px] px-2 py-3 text-center border-b border-[#F3F3F4]'>STT</th>
                          <th className='w-[120px] px-2 py-3 text-center border-b border-[#F3F3F4]'>Ngày</th>
                          <th className='px-2 py-3 text-left border-b border-[#F3F3F4]'>Công nhân</th>
                          <th className='px-2 py-3 text-center border-b border-[#F3F3F4]'>Công đoạn</th>
                          <th className='px-2 py-3 text-center border-b border-[#F3F3F4]'>Giờ làm</th>
                          <th className='px-2 py-3 text-left border-b border-[#F3F3F4]'>Sản phẩm</th>
                          <th className='px-2 py-3 text-center border-b border-[#F3F3F4]'>Đơn giá</th>
                          <th className='px-2 py-3 text-center border-b border-[#F3F3F4]'>Số lượng</th>
                          <th className='px-2 py-3 text-center border-b border-[#F3F3F4]'>Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summaryDetailItems.map((row, index) => {
                          const showStaff = detailRowSpans.staffShowCell[index];
                          const staffSpan = detailRowSpans.staffRowSpan[index];

                          const showStage = detailRowSpans.stageShowCell[index];
                          const stageSpan = detailRowSpans.stageRowSpan[index];

                          return (
                            <tr
                              key={row?.ppi_id || index}
                              className='responsive-text-sm bg-white hover:bg-gray-50 transition-colors'
                            >
                              <td className='bg-white px-2 py-4 text-center font-semibold text-[#141522] border-b border-r border-[#F3F3F4] align-middle'>
                                {index + 1}
                              </td>
                              <td className='bg-white px-2 py-4 text-center font-semibold text-[#141522] border-b border-r border-[#F3F3F4] align-middle'>
                                {row?.date ? moment(row.date).format('DD/MM/YYYY') : '-'}
                              </td>

                              {showStaff ? (
                                <td
                                  rowSpan={staffSpan}
                                  className='bg-white px-2 py-4 text-left border-b border-r border-[#F3F3F4] align-middle'
                                >
                                  {row?.staff ? (
                                    <div className='flex items-center gap-2 justify-start'>
                                      <ResponsibleAvatar
                                        avatarUrl={row?.staff?.profile_image || '/icon/default/default.png'}
                                        fullName={row?.staff?.full_name || '-'}
                                        size={32}
                                      />
                                      <span className='text-[#344054]'>{row?.staff?.full_name || '-'}</span>
                                    </div>
                                  ) : (
                                    <div className='text-center text-[#9295A4]'>-</div>
                                  )}
                                </td>
                              ) : null}

                              {showStage ? (
                                <td
                                  rowSpan={stageSpan}
                                  className='bg-white px-2 py-4 text-center text-[#141522] font-semibold border-b border-r border-[#F3F3F4] align-middle'
                                >
                                  {row?.stage_name || '-'}
                                </td>
                              ) : null}

                              <td className='px-2 py-4 text-center font-semibold text-[#141522] border-b border-r border-[#F3F3F4] align-middle'>
                                {formatSecondsToHours(row?.total_time)}
                              </td>

                              <td className='p-3 2xl:p-4 border-b border-[#F3F3F4] align-middle'>
                                <div className='flex items-center gap-2'>
                                  <div className='size-12 shrink-0'>
                                    <Image
                                      unoptimized
                                      alt={row?.item?.item_name || 'Sản phẩm'}
                                      width={48}
                                      height={48}
                                      src={row?.item?.images || '/icon/default/default.png'}
                                      className='size-full object-cover rounded-md'
                                    />
                                  </div>
                                  <div className='flex flex-col gap-0.5 min-w-0'>
                                    <p className='responsive-text-sm font-semibold text-[#141522] truncate'>{row?.item?.item_name || '-'}</p>
                                    <p className='responsive-text-xxs text-[#667085] truncate'>{row?.item?.variation || '-'}</p>
                                    <p className='responsive-text-xxs text-[#3276FA] truncate'>{row?.item?.item_code || '-'}</p>
                                    <p className='responsive-text-xxs text-[#3276FA] truncate'>{row?.reference_no_detail || '-'}</p>
                                  </div>
                                </div>
                              </td>

                              <td className='px-2 py-4 text-center font-medium text-[#0375F3] border-b border-[#F3F3F4] align-middle'>
                                {Number(row?.price_salary) ? `${formatNumber(Number(row?.price_salary))} ₫` : '-'}
                              </td>
                              <td className='px-2 py-4 text-center font-semibold text-[#141522] border-b border-[#F3F3F4] align-middle'>
                                {Number(row?.total_quantity) ? formatNumber(Number(row?.total_quantity)) : '-'}
                              </td>
                              <td className='px-2 py-4 text-center font-medium text-[#0375F3] border-b border-[#F3F3F4] align-middle'>
                                {Number(row?.total_amount) ? `${formatNumber(Number(row?.total_amount))} ₫` : '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </Customscrollbar>
                </div>

                <div className='px-4 pb-4 pt-2 bg-white'>
                  <table className='w-full table-fixed border-separate border-spacing-0'>
                    <colgroup>
                      <col style={{ width: 40 }} />
                      <col style={{ width: 120 }} />
                      <col />
                      <col />
                      <col />
                      <col />
                      <col />
                      <col />
                      <col />
                    </colgroup>
                    <tbody>
                      <tr className='responsive-text-base font-semibold text-[#141522] bg-[#F0F0F0]'>
                        <td className='px-2 py-4 text-left border-t border-[#F3F3F4]'>Tổng</td>
                        <td className='px-2 py-4 border-t border-[#F3F3F4]'></td>
                        <td className='px-2 py-4 border-t border-[#F3F3F4]'></td>
                        <td className='px-2 py-4 border-t border-[#F3F3F4]'></td>
                        <td className='px-2 py-4 text-center border-t border-[#F3F3F4]'>
                          {totalDetailTime ? formatSecondsToHours(totalDetailTime) : '-'}
                        </td>
                        <td className='px-2 py-4 border-t border-[#F3F3F4]'></td>
                        <td className='px-2 py-4 border-t border-[#F3F3F4]'></td>
                        <td className='px-2 py-4 text-center border-t border-[#F3F3F4]'>
                          {totalDetailQuantity ? formatNumber(totalDetailQuantity) : '-'}
                        </td>
                        <td className='px-2 py-4 text-center border-t border-[#F3F3F4]'>
                          {totalDetailAmount ? `${formatNumber(totalDetailAmount)} đ` : '-'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Container>
  )
}

export default Summary
