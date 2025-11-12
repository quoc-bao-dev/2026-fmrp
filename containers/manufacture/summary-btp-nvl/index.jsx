import BreadcrumbCustom from '@/components/UI/breadcrumb/BreadcrumbCustom';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { Container } from '@/components/UI/common/layout';
import DateToDateReport from '@/components/UI/filterComponents/dateTodateReport';
import ExcelFileComponent from '@/components/UI/filterComponents/excelFilecomponet';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import ButtonAnimationNew from '@/components/common/button/ButtonAnimationNew';
import StatusCheckboxGroup from '@/components/common/checkbox/StatusCheckboxGroup';
import FilterDropdown from '@/components/common/dropdown/FilterDropdown';
import LimitListDropdown from '@/components/common/dropdown/LimitListDropdown';
import ProgressBar from '@/components/common/progress/ProgressBar';
import SelectComponentNew from '@/components/common/select/SelectComponentNew';
import TabSwitcherWithSlidingBackground from '@/components/common/tab/TabSwitcherWithSlidingBackground';
import TabSwitcherWithUnderline from '@/components/common/tab/TabSwitcherWithUnderline';
import ArrowCounterClockwiseIcon from '@/components/icons/common/ArrowCounterClockwiseIcon';
import CaretDownIcon from '@/components/icons/common/CaretDownIcon';
import ChartDonutIcon from '@/components/icons/common/ChartDonutIcon';
import FunnelIcon from '@/components/icons/common/FunnelIcon';
import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate';
import { IMAGES } from '@/constants/images';
import { useBranchList } from '@/hooks/common/useBranch';
import { useProductionOrdersList } from '@/managers/api/productions-order/useProductionOrdersList';
import { formatMoment } from '@/utils/helpers/formatMoment';
import { FnlocalStorage } from '@/utils/helpers/localStorage';
import Image from 'next/image';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { FaPlus } from 'react-icons/fa6';
import { useSelector } from 'react-redux';
import { listLsxStatus } from '../productions-orders/components/main/constants/listData';
import { useSummaryBtpNvl } from './hook';
import formatNumber from '@/utils/helpers/formatnumber';

const breadcrumbItems = [
  {
    label: `Sản xuất`,
    href: '/',
  },
  { label: `Tổng hợp kế hoạch BTP & NVL` },
];

const tabs = [
  { id: 'each_order', name: 'Chi tiết theo lệnh' },
  { id: 'by_product', name: 'Tổng hợp theo mặt hàng' },
];

const tabsMaterialFinishedProduct = [
  { id: 'material', name: 'nguyên vật liệu' },
  { id: 'finished_product', name: 'bán thành phẩm' },
];

const DEFAULT_ITEM_IMAGE = '/icon/default/default.png';
const EXCEL_HEADER_STYLE = {
  fill: { fgColor: { rgb: 'C7DFFB' } },
  font: { bold: true },
  alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
};

const parseNumber = value => {
  if (value === null || value === undefined || value === '') return 0;
  const numeric = typeof value === 'number' ? value : Number(String(value).replace(/,/g, ''));
  return Number.isNaN(numeric) ? 0 : numeric;
};

const createNumberCell = rawValue => {
  const hasValue = rawValue !== null && rawValue !== undefined && rawValue !== '';
  if (!hasValue) {
    return { value: '' };
  }

  return {
    value: parseNumber(rawValue),
    style: { numFmt: '#,##0.##' },
  };
};

const getProductTagLabel = type => {
  switch (type) {
    case 'semi_products':
      return 'Bán thành phẩm';
    case 'semi_products_outside':
      return 'Bán thành phẩm ngoài';
    case 'semi_products_inside':
      return 'Bán thành phẩm nội bộ';
    default:
      return '';
  }
};

const normalizeForFilename = value => {
  if (!value) return '';
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

const SummaryBtpNvl = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [activeTabMaterialFinishedProduct, setActiveTabMaterialFinishedProduct] = useState(tabsMaterialFinishedProduct[0]);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectStatusFilter, setSelectStatusFilter] = useState([]);
  const [limit, setLimit] = useState(10);
  const [valueBr, setValueBr] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: undefined,
    endDate: undefined,
  });
  const { setItem, getItem } = FnlocalStorage();
  const stateFilterDropdown = useSelector(state => state.stateFilterDropdown);
  const { data: listBr = [] } = useBranchList();

  // Load trạng thái từ localStorage khi component mount
  useEffect(() => {
    const dataFilter = getItem('productionsOrdersStatusFilter') || '[]';
    if (JSON.parse(dataFilter).length > 0) {
      setSelectStatusFilter(JSON.parse(dataFilter));
      return;
    }
    const defaultStatus = ['0', '1']; // Mặc định chọn "Chưa sản xuất" và "Đang sản xuất"
    setSelectStatusFilter(defaultStatus);
    setItem('productionsOrdersStatusFilter', JSON.stringify(defaultStatus));
  }, []);

  // Hàm toggle chọn trạng thái lọc lệnh sản xuất
  const toggleStatus = value => {
    const currentSelected = selectStatusFilter || [];
    const updatedSelected = currentSelected.includes(value) ? currentSelected.filter(v => v !== value) : [...currentSelected, value];

    setSelectStatusFilter(updatedSelected);

    // Lưu trạng thái mới vào localStorage
    setItem('productionsOrdersStatusFilter', JSON.stringify(updatedSelected));
  };

  // Hàm format date từ DateToDateReport (có thể là string hoặc Date) sang d/m/Y
  const formatDateToDMY = date => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (!dateObj || isNaN(dateObj.getTime())) return '';
    return formatMoment(dateObj, FORMAT_MOMENT.DATE_SLASH_LONG);
  };

  // call api list production
  const {
    data: dataProductionOrders,
    isLoading: isLoadingProductionOrderList,
    refetch: refetchProductionOrders,
  } = useProductionOrdersList({
    limit: limit,
    branch_id: valueBr?.value || '',
    date_start: formatDateToDMY(dateRange.startDate),
    date_end: formatDateToDMY(dateRange.endDate),
    ...(selectStatusFilter?.length > 0 && {
      status: selectStatusFilter,
    }),
  });
  const summaryParams = useMemo(
    () => ({
      po_ids: selectedOrders.map(o => o.id),
      ...(activeTab?.id === 'by_product' ? { is_sumpany: 1 } : {}),
    }),
    [selectedOrders, activeTab]
  );
  const selectedPoIds = summaryParams.po_ids || [];
  const { data: dataSummaryBtpNvl, isLoading: isLoadingSummaryBtpNvl, refetch: refetchSummaryBtpNvl } = useSummaryBtpNvl(summaryParams);
  // flag của list production
  const flagProductionOrders = useMemo(() => (dataProductionOrders ? dataProductionOrders?.pages?.flatMap(page => page?.productionOrders) : []), [dataProductionOrders]);

  const isEachOrderTab = activeTab?.id === 'each_order';

  const summaryData = dataSummaryBtpNvl?.data ?? dataSummaryBtpNvl ?? {};

  const productionOrdersSummary = useMemo(() => {
    if (!isEachOrderTab) return [];
    const orders = summaryData?.production_orders;
    if (!orders) return [];
    const orderEntries = Object.entries(orders);
    if (selectedPoIds.length > 0) {
      const selectedSet = new Set(selectedPoIds.map(id => String(id)));
      return orderEntries.filter(([id]) => selectedSet.has(String(id))).map(([, value]) => value);
    }
    return orderEntries.map(([, value]) => value);
  }, [summaryData, selectedPoIds, isEachOrderTab]);

  const buildBomRows = useMemo(() => {
    const aggregate = activeTab?.id === 'by_product';
    const orders = productionOrdersSummary;

    const enhanceRow = row => {
      const total = parseNumber(Number(row.quota_primary)) || parseNumber(Number(row.total_quota));
      const remaining = parseNumber(Number(row.quantity_rest_process)) || parseNumber(Number(row.quantity_rest));
      const progressTotal = total > 0 ? total : parseNumber(Number(row.total_quota));
      const progressCurrent = Math.max(0, progressTotal - remaining);
      return {
        ...row,
        progressTotal,
        progressCurrent,
      };
    };

    const buildRowsByKey = key => {
      if (!orders.length) return [];
      if (!aggregate) {
        return orders
          .flatMap(order =>
            (order?.[key] || []).map(item =>
              enhanceRow({
                ...item,
                reference_no: order?.reference_no,
                order_id: order?.id,
              })
            )
          )
          .filter(Boolean);
      }

      const grouped = new Map();
      orders.forEach(order => {
        (order?.[key] || []).forEach(item => {
          const groupedKey = item.item_variation_option_value_id || `${item.item_id}-${item.unit_name}-${item.unit_name_primary}`;
          if (!grouped.has(groupedKey)) {
            grouped.set(groupedKey, {
              ...item,
              total_quota: 0,
              quota_primary: 0,
              quantity_keep: 0,
              quantity_import: 0,
              quantity_rest: 0,
              quantity_rest_process: 0,
              reference_numbers: new Set(),
            });
          }

          const acc = grouped.get(groupedKey);
          acc.total_quota += parseNumber(item.total_quota);
          acc.quota_primary += parseNumber(item.quota_primary);
          acc.quantity_keep += parseNumber(item.quantity_keep);
          acc.quantity_import += parseNumber(item.quantity_import);
          acc.quantity_rest += parseNumber(item.quantity_rest);
          acc.quantity_rest_process += parseNumber(item.quantity_rest_process);
          if (order?.reference_no) {
            acc.reference_numbers.add(order.reference_no);
          }
        });
      });

      return Array.from(grouped.values()).map(item => {
        const { reference_numbers, ...rest } = item;
        return enhanceRow({
          ...rest,
          reference_no: reference_numbers ? Array.from(reference_numbers).join(', ') : undefined,
        });
      });
    };

    return {
      materials: buildRowsByKey('materials_boms'),
      products: buildRowsByKey('products_boms'),
    };
  }, [productionOrdersSummary, activeTab]);

  const materialsData = activeTab?.id === 'by_product' ? summaryData?.materials_boms || [] : buildBomRows.materials || [];

  const finishedProductsData = activeTab?.id === 'by_product' ? summaryData?.products_boms || [] : buildBomRows.products || [];

  const getReservedOrPurchased = item => {
    const keep = parseNumber(Number(item.quantity_keep));
    const imported = parseNumber(Number(item.quantity_import));
    return Math.max(keep, imported);
  };

  const excelSheets = useMemo(() => {
    const createColumn = (title, width) => ({
      title,
      width: { wch: width },
      style: EXCEL_HEADER_STYLE,
    });

    const materialsColumns = [
      createColumn('STT', 6),
      createColumn('Mã NVL', 15),
      createColumn('Tên NVL', 32),
      createColumn('Thuộc tính', 25),
      createColumn('Lệnh sản xuất', 28),
      createColumn('ĐVT', 10),
      createColumn('Số lượng cần', 18),
      createColumn('Quy đổi', 18),
      createColumn('Đã giữ/Mua', 18),
      createColumn('Thiếu', 18),
      createColumn('Đã nhập', 18),
      createColumn('Còn lại xử lý', 18),
    ];

    const materialsRows = (materialsData || []).map((item, index) => [
      { value: index + 1 },
      { value: item.item_code || '' },
      { value: item.item_name || '' },
      { value: item.item_variation || '' },
      { value: item.reference_no || '' },
      { value: item.unit_name || item.unit_name_primary || '' },
      createNumberCell(item.total_quota),
      createNumberCell(item.quota_primary),
      createNumberCell(item.quantity_keep),
      createNumberCell(item.quantity_rest),
      createNumberCell(item.quantity_import),
      createNumberCell(item.quantity_rest_process),
    ]);

    const finishedColumns = [
      createColumn('STT', 6),
      createColumn('Mã BTP', 15),
      createColumn('Tên BTP', 32),
      createColumn('Thuộc tính', 25),
      createColumn('Loại', 18),
      createColumn('Lệnh sản xuất', 28),
      createColumn('ĐVT', 10),
      createColumn('Số lượng cần', 18),
      createColumn('Đã giữ', 18),
      createColumn('Thiếu', 18),
      createColumn('Đã nhập', 18),
      createColumn('Còn lại xử lý', 18),
    ];

    const finishedRows = (finishedProductsData || []).map((item, index) => [
      { value: index + 1 },
      { value: item.item_code || '' },
      { value: item.item_name || '' },
      { value: item.item_variation || '' },
      { value: getProductTagLabel(item.type_products) || '' },
      { value: item.reference_no || '' },
      { value: item.unit_name || item.unit_name_primary || '' },
      createNumberCell(item.total_quota),
      createNumberCell(item.quantity_keep),
      createNumberCell(item.quantity_rest),
      createNumberCell(item.quantity_import),
      createNumberCell(item.quantity_rest_process),
    ]);

    return [
      {
        name: 'Nguyên vật liệu',
        dataSet: [
          {
            columns: materialsColumns,
            data: materialsRows,
          },
        ],
      },
      {
        name: 'Bán thành phẩm',
        dataSet: [
          {
            columns: finishedColumns,
            data: finishedRows,
          },
        ],
      },
    ];
  }, [materialsData, finishedProductsData]);

  const exportFilename = useMemo(() => {
    const base = 'Tong_hop_ke_hoach_BTP_NVL';
    const tabSuffix =
      activeTab?.id === 'each_order' ? 'Chi_tiet_theo_lenh' : 'Tong_hop_theo_mat_hang';

    const orderCodes =
      selectedOrders && selectedOrders.length > 0
        ? selectedOrders
            .map(order => normalizeForFilename(order?.reference_no || order?.code))
            .filter(Boolean)
            .join('_')
        : 'Tat_ca_lenh';

    return [base, tabSuffix, orderCodes].filter(Boolean).join('_');
  }, [activeTab, selectedOrders]);

  const allSelected = selectedOrders.length > 0 && selectedOrders.length === flagProductionOrders.length;
  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(flagProductionOrders);
    }
  };

  // Hàm xử lý filter
  const handleFilter = (type, value) => {
    if (type === 'valueBr') {
      setValueBr(value);
    }
  };

  // Đếm số bộ lọc đang active
  const activeFilterCount = [valueBr, dateRange.startDate].filter(item => item !== null && item !== undefined).length;

  // trigger của bộ lọc tổng
  const triggerFilterAll = (
    <button
      className={`${
        stateFilterDropdown?.open || activeFilterCount > 0
          ? 'text-[#0F4F9E] border-[#3276FA] bg-[#EBF5FF]'
          : 'bg-white text-[#9295A4] border-[#D0D5DD] hover:text-[#0F4F9E] hover:bg-[#EBF5FF] hover:border-[#3276FA]'
      } flex items-center space-x-2 border rounded-lg h-11 px-3 group custom-transition`}
    >
      <span className='3xl:size-5 size-4 shrink-0'>
        <FunnelIcon className='w-full h-full ' />
      </span>
      <span className={`${stateFilterDropdown?.open || activeFilterCount > 0 ? 'text-[#0F4F9E]' : 'text-[#3A3E4C] group-hover:text-[#0F4F9E]'} text-nowrap 3xl:text-base text-sm custom-transition`}>
        Bộ lọc
      </span>
      {activeFilterCount > 0 && <span className='rounded-full bg-[#0F4F9E] text-white text-xs xl:size-5 size-4 flex items-center justify-center'>{activeFilterCount}</span>}
      <span className='3xl:size-4 size-3.5 shrink-0'>
        <CaretDownIcon className={`${stateFilterDropdown?.open || activeFilterCount > 0 ? 'rotate-180' : 'rotate-0'} w-full h-full custom-transition`} />
      </span>
    </button>
  );

  const triggerFilterStatus = (
    <button
      className={`${
        stateFilterDropdown?.open || selectStatusFilter?.length > 0
          ? 'text-[#0F4F9E] border-[#3276FA] bg-[#EBF5FF]'
          : 'bg-white text-[#9295A4] border-[#D0D5DD] hover:text-[#0F4F9E] hover:bg-[#EBF5FF] hover:border-[#3276FA]'
      } relative flex items-center justify-between 3xl:space-x-2 space-x-0 border rounded-lg h-11 px-3 group custom-transition w-full`}
    >
      <ChartDonutIcon className='absolute -translate-y-1/2 top-1/2 3xl:size-5 size-4' />
      <span
        className={`${
          stateFilterDropdown?.open || selectStatusFilter?.length > 0 ? 'text-[#0F4F9E]' : 'text-[#3A3E4C] group-hover:text-[#0F4F9E]'
        } xl:pl-6 pl-4 text-nowrap 3xl:text-base text-sm custom-transition`}
      >
        Trạng thái
      </span>
      <span className='3xl:size-4 size-3.5 shrink-0'>
        <CaretDownIcon className={`${stateFilterDropdown?.open || selectStatusFilter?.length > 0 ? 'rotate-180' : 'rotate-0'} w-full h-full custom-transition`} />
      </span>
    </button>
  );

  return (
    <Container className='flex flex-col gap-2 !space-y-0 pb-4'>
      <BreadcrumbCustom items={breadcrumbItems} className='3xl:text-sm 2xl:text-xs xl:text-[10px] lg:text-[10px]' />
      <div className='flex items-center justify-between w-full'>
        <h2 className='text-title-section text-[#52575E] capitalize font-medium'>Tổng hợp kế hoạch BTP & NVL</h2>
        <div className='flex items-center gap-2'>
          <ButtonAnimationNew
            icon={
              <div className='size-4'>
                <ArrowCounterClockwiseIcon className='size-full' />
              </div>
            }
            title={'Làm mới dữ liệu'}
            className='3xl:h-10 h-9 xl:px-4 px-2 flex items-center gap-2 xl:text-sm text-xs font-normal text-[#0375F3] border border-[#0375F3] hover:bg-[#EBF5FF] hover:shadow-hover-button rounded-lg'
            onClick={refetchSummaryBtpNvl}
          />
          <ExcelFileComponent
            filename={exportFilename}
            title='THKHBTPNVL'
            multiDataSet={excelSheets?.[0]?.dataSet || []}
            sheets={excelSheets}
            classBtn='!py-3'
          />
          <TabSwitcherWithSlidingBackground tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          <FilterDropdown
            trigger={triggerFilterAll}
            style={{
              boxShadow: '0px 20px 24px -4px #10182814, 0px 4px 4px 0px #00000040',
            }}
            classNameContainer='!w-fit h-11'
            className='flex flex-col gap-4 border-[#D8DAE5] rounded-lg w-[600px]'
            dropdownId='dropdownFilterMain'
          >
            <div className='3xl:text-xl text-lg text-[#344054] font-medium'>Bộ lọc</div>
            <div className='grid w-full grid-cols-2 gap-3'>
              <div className='col-span-1 space-y-1'>
                <h3 className='text-xs text-[#051B44] font-normal'>Chi nhánh</h3>
                <SelectComponentNew
                  isClearable={true}
                  value={valueBr}
                  onChange={e => handleFilter('valueBr', e)}
                  options={listBr}
                  classParent='ml-0 !font-semibold focus:ring-none focus:outline-none text-sm focus-visible:ring-none focus-visible:outline-none placeholder:text-sm placeholder:text-[#52575E]'
                  classNamePrefix={'productionSmoothing'}
                  placeholder='Tất cả chi nhánh'
                />
              </div>
              <div className='col-span-1 space-y-1'>
                <h3 className='text-xs text-[#051B44] font-normal'>Từ ngày đến ngày</h3>
                <DateToDateReport
                  placeholder='dd/mm/yyyy - dd/mm/yyyy'
                  value={dateRange}
                  onChange={value => {
                    setDateRange(value || { startDate: undefined, endDate: undefined });
                  }}
                  className='w-full'
                />
              </div>
            </div>
          </FilterDropdown>
        </div>
      </div>
      <div className='flex gap-2 h-full w-full min-h-0'>
        <div className='w-[20%] 2xl:w-[15%] h-full max-h-full flex flex-col gap-2 min-h-0'>
          <FilterDropdown
            trigger={triggerFilterStatus}
            style={{
              boxShadow: '0px 20px 24px -4px #10182814, 0px 4px 4px 0px #00000040',
            }}
            className='flex flex-col gap-4 !p-0 border-[#D8DAE5] rounded-lg w-full shrink-0'
            dropdownId='dropdownFilterStatus'
            placement='bottom-left'
          >
            <StatusCheckboxGroup list={listLsxStatus} selected={selectStatusFilter} onChange={value => toggleStatus(value)} />
          </FilterDropdown>
          <div className='flex flex-col flex-1 min-h-0 gap-2'>
            <div onClick={toggleSelectAll} className='flex items-center justify-between px-2 py-1.5 rounded-md border border-[#E6E7EC] bg-[#FBFCFE] cursor-pointer'>
              <button type='button' className='flex items-center gap-2 select-none'>
                <span
                  className={`size-4 rounded-[4px] border flex items-center justify-center ${allSelected ? 'bg-[#0375F3] border-[#0375F3] text-white' : 'border-[#D0D5DD] bg-white text-transparent'}`}
                >
                  ✓
                </span>
                <span className='text-sm text-[#3A3E4C]'>Chọn tất cả</span>
              </button>
            </div>
            <Customscrollbar className='flex-1 min-h-0'>
              <div className='flex flex-col gap-1'>
                {isLoadingProductionOrderList ? (
                  <Loading className='h-full 3xl:h-full 2xl:h-full xl:h-full' />
                ) : flagProductionOrders?.length ? (
                  flagProductionOrders.map((item, eIndex) => {
                    const color = {
                      0: {
                        color: 'bg-[#FF811A]/15 text-[#C25705]',
                        title: 'Đã sản xuất',
                      },
                      1: {
                        color: 'bg-[#3ECeF7]/20 text-[#076A94]',
                        title: 'Đang sản xuất',
                      },
                      2: {
                        color: 'bg-[#35BD4B]/20 text-[#1A7526]',
                        title: 'Hoàn thành',
                      },
                    };

                    return (
                      <Fragment key={item?.id}>
                        <div
                          onClick={() => {
                            setSelectedOrders(prev => {
                              const exists = prev.find(o => o.id === item.id);
                              if (exists) {
                                return prev.filter(o => o.id !== item.id);
                              }
                              return [...prev, item];
                            });
                          }}
                          className={`pl-3 pr-3 py-2 rounded-lg hover:bg-[#F0F7FF] border-[#F7F8F9] cursor-pointer transition-all ease-linear relative
                          ${selectedOrders?.some(o => o.id === item.id) ? 'bg-[#F0F7FF]' : ''}
                          `}
                        >
                          {selectedOrders?.some(o => o.id === item.id) && <div className='absolute left-0 top-0 bottom-0 w-1 h-full bg-[#0375F3] rounded-l-lg'></div>}
                          {/* Checkbox trạng thái chọn - góc phải trên */}
                          <div className='absolute top-2 right-2 z-10'>
                            <div
                              className={`size-4 rounded border flex items-center justify-center ${
                                selectedOrders?.some(o => o.id === item.id) ? 'bg-[#0375F3] border-[#0375F3]' : 'border-[#D0D5DD] bg-white'
                              }`}
                            >
                              {selectedOrders?.some(o => o.id === item.id) && <span className='block text-[10px] leading-4 text-white text-center'>✓</span>}
                            </div>
                          </div>
                          <div className='relative flex items-center gap-3'>
                            <div className='flex flex-col gap-1'>
                              <span className={`${color[item?.status_manufacture]?.color} xl:text-sm text-xs px-2 py-1 rounded font-normal w-fit h-fit`}>{color[item?.status_manufacture]?.title}</span>
                              <h2 className='3xl:text-2xl xl:text-xl text-lg font-semibold text-[#003DA0]'>{item?.reference_no}</h2>

                              <div className='flex flex-col gap-0.5'>
                                <h3 className='text-[#667085] font-normal 3xl:text-base xl:text-sm text-xs'>
                                  <span>
                                    Ngày tạo
                                    {': '}
                                  </span>
                                  <span>{formatMoment(item?.date, FORMAT_MOMENT.DATE_SLASH_LONG)}</span>
                                </h3>

                                <div className='flex flex-wrap items-start gap-x-1'>
                                  <span className='text-[#667085] whitespace-nowrap font-normal 3xl:text-base xl:text-sm text-xs'>Lập theo:</span>
                                  {item?.listObject?.map((i, index) => (
                                    <span key={index} className='text-[#667085] font-normal 3xl:text-base xl:text-sm text-xs'>
                                      {i.reference_no}
                                      {index < item.listObject.length - 1 && <span>,</span>}
                                    </span>
                                  ))}
                                </div>

                                <h3 className='text-[#667085] font-normal 3xl:text-base xl:text-sm text-xs'>
                                  <span>Chi nhánh: </span>
                                  <span>{item?.name_branch}</span>
                                </h3>
                              </div>
                            </div>
                          </div>
                        </div>
                        {flagProductionOrders.length - 1 !== eIndex && <hr className='border-[#F7F8F9]' />}
                      </Fragment>
                    );
                  })
                ) : (
                  <NoData className='mt-0' />
                )}
              </div>
            </Customscrollbar>

            <div className='flex items-center'>
              <LimitListDropdown
                limit={limit}
                sLimit={value => {
                  setLimit(value);
                }}
                dataLang={{}}
                total={dataProductionOrders?.pages[0]?.countAll || 0}
              />
            </div>
          </div>
        </div>
        <div className='flex-1 h-full flex flex-col gap-2'>
          <TabSwitcherWithUnderline
            tabs={tabsMaterialFinishedProduct}
            activeTab={activeTabMaterialFinishedProduct}
            onChange={setActiveTabMaterialFinishedProduct}
            renderLabel={(tab, activeTab) => (
              <h3 className={`${activeTab?.id === tab.id ? 'text-[#0375F3]' : 'text-[#9295A4]'} font-medium group-hover:text-[#0375F3] transition-all duration-100 ease-linear origin-left capitalize`}>
                <span>{tab.name}</span>
              </h3>
            )}
          />

          {selectedOrders?.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-full'>
              <Image src={IMAGES.summary_LSX} alt='Không có dữ liệu' width={200} height={200} className='object-cover rounded-md' />
              <div className='flex items-center gap-2 mt-2'>
                <FaPlus color='#000' className='size-4' />
                <p className='responsive-text-xl font-semibold text-neutral-05'>Chọn lệnh sản xuất</p>
              </div>
              <p className='responsive-text-lg text-neutral-03 mt-2'>Hãy chọn lệnh sản xuất mà bạn muốn tổng hợp kế hoạch</p>
            </div>
          ) : isLoadingSummaryBtpNvl ? (
            <div className='flex flex-col items-center justify-center h-full'>
              <Loading className='h-16 w-16' />
            </div>
          ) : activeTabMaterialFinishedProduct?.id === 'material' ? (
            (() => {
              const data = materialsData;
              if (!data.length) {
                return <NoData className='mt-0' />;
              }

              const ColNum = ({ value, unit }) => (
                <div className='flex flex-col items-center gap-0.5'>
                  <span className='font-semibold text-[#3A3E4C]'>{Number(value) > 0 ? formatNumber(Number(value)) + '/' : '-'}</span>
                  {value > 0 && <span className='text-xs text-[#9295A4]'>{unit}</span>}
                </div>
              );

              return (
                <Customscrollbar className='w-full h-full flex-1 min-h-0'>
                  <table className='min-w-full table-auto responsive-text-sm relative'>
                    <thead className='bg-[#FBFCFE] text-[#667085] capitalize sticky top-0 z-20'>
                      <tr>
                        <th className='text-left px-3 py-2'>Nguyên vật liệu</th>
                        {activeTab?.id === 'each_order' && <th className='text-center px-3 py-2'>Lệnh sản xuất</th>}
                        <th className='text-center px-3 py-2'>Số lượng cần</th>
                        <th className='text-center px-3 py-2'>Quy đổi</th>
                        <th className='text-center px-3 py-2'>Đã giữ/Mua</th>
                        <th className='text-center px-3 py-2'>Thiếu</th>
                        <th className='text-center px-3 py-2'>Tiến độ</th>
                      </tr>
                    </thead>

                    <tbody className='[&>tr]:border-b [&>tr]:border-[#F3F3F4] [&>tr:last-child]:border-b-0'>
                      {data.map((item, index) => {
                        const rowKey = `${item.item_variation_option_value_id || item.item_id || index}-${item.order_id || 'summary'}`;

                        return (
                          <tr key={rowKey} className='hover:bg-slate-100/40'>
                            <td className='px-3 py-2'>
                              <div className='flex items-center gap-2'>
                                <Image src={item.images || DEFAULT_ITEM_IMAGE} alt={item.item_name || 'Nguyên vật liệu'} width={40} height={40} className='object-cover rounded-md' />
                                <div className='flex flex-col'>
                                  <span className='text-[#3A3E4C] font-semibold'>{item.item_name}</span>
                                  <span className='text-xs text-[#9295A4]'>{item.item_variation || '(None)'}</span>
                                  <span className='text-[11px] text-[#1D6AE5]'>{item.item_code}</span>
                                </div>
                              </div>
                            </td>
                            {activeTab?.id === 'each_order' && <td className='px-3 py-2 text-center text-[#3A3E4C]'>{item.reference_no || '-'}</td>}
                            <td className='px-3 py-2'>
                              <ColNum value={item.total_quota} unit={item.unit_name || '-'} />
                            </td>
                            <td className='px-3 py-2'>
                              <ColNum value={item.quota_primary} unit={item.unit_name_primary || '-'} />
                            </td>
                            <td className='px-3 py-2'>
                              <ColNum value={item.quantity_keep} unit={item.unit_name_primary || '-'} />
                            </td>
                            <td className='px-3 py-2 text-center text-[#9295A4]'>
                              <ColNum value={item.quantity_rest} unit={item.unit_name_primary || '-'} />
                            </td>
                            <td className='px-3 py-2'>
                              <ProgressBar
                                current={formatNumber(Number(item.quantity_import))}
                                total={formatNumber(Number(item.quantity_rest_process))}
                                name={item.unit_name_primary}
                                typeProgress='tablePlaning'
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </Customscrollbar>
              );
            })()
          ) : (
            (() => {
              const data = finishedProductsData;

              if (!data.length) {
                return <NoData className='mt-0' />;
              }

              return (
                <Customscrollbar className='w-full h-full flex-1 min-h-0'>
                  <table className='min-w-full table-auto responsive-text-sm relative'>
                    <thead className='bg-[#FBFCFE] text-[#667085] capitalize sticky top-0 z-20'>
                      <tr>
                        <th className='text-left px-3 py-2'>Bán thành phẩm</th>
                        {activeTab?.id === 'each_order' && <th className='text-center px-3 py-2'>Lệnh sản xuất</th>}
                        <th className='text-center px-3 py-2'>Đơn vị tính</th>
                        <th className='text-center px-3 py-2'>Số lượng cần</th>
                        <th className='text-center px-3 py-2'>Đã giữ</th>
                        <th className='text-center px-3 py-2'>Thiếu</th>
                        <th className='text-center px-3 py-2'>Tiến độ</th>
                      </tr>
                    </thead>
                    <tbody className='[&>tr]:border-b [&>tr]:border-[#F3F3F4] [&>tr:last-child]:border-b-0'>
                      {data.map((item, index) => {
                        const rowKey = `${item.item_variation_option_value_id || item.item_id || index}-${item.order_id || 'summary'}`;
                        const tagLabel = getProductTagLabel(item.type_products);

                        return (
                          <tr key={rowKey} className='hover:bg-slate-100/40'>
                            <td className='px-3 py-2'>
                              <div className='flex items-center gap-2'>
                                <Image src={item.images || DEFAULT_ITEM_IMAGE} alt={item.item_name || 'Bán thành phẩm'} width={40} height={40} className='object-cover rounded-md' />
                                <div className='flex flex-col'>
                                  <span className='text-[#3A3E4C] font-semibold'>{item.item_name}</span>
                                  <span className='text-xs text-[#9295A4]'>{item.item_variation || '(None)'}</span>
                                  <span className='text-[11px] text-[#1D6AE5] w-fit'>{item.item_code}</span>
                                  {tagLabel && <span className='px-2 py-0.5 text-[10px] rounded bg-[#E9F9EF] text-[#139D3E] w-fit mt-1'>{tagLabel}</span>}
                                </div>
                              </div>
                            </td>
                            {activeTab?.id === 'each_order' && <td className='px-3 py-2 text-center text-[#3A3E4C]'>{item.reference_no || '-'}</td>}
                            <td className='px-3 py-2 text-center text-[#3A3E4C]'>{item.unit_name}</td>
                            <td className='px-3 py-2 text-center text-[#3A3E4C]'>{Number(item.total_quota) > 0 ? formatNumber(Number(item.total_quota)) : '-'}</td>
                            <td className='px-3 py-2 text-center text-[#3A3E4C]'>{Number(item.quantity_keep) > 0 ? formatNumber(Number(item.quantity_keep)) : '-'}</td>
                            <td className='px-3 py-2 text-center text-[#3A3E4C]'>{Number(item.quantity_rest) > 0 ? formatNumber(Number(item.quantity_rest)) : '-'}</td>
                            <td className='px-3 py-2'>
                              <ProgressBar
                                current={formatNumber(Number(item.quantity_import))}
                                total={formatNumber(Number(item.quantity_rest_process))}
                                name={item.unit_name_primary}
                                typeProgress='tablePlaning'
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </Customscrollbar>
              );
            })()
          )}
        </div>
      </div>
    </Container>
  );
};

export default SummaryBtpNvl;
