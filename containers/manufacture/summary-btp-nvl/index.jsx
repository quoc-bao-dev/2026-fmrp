import BreadcrumbCustom from '@/components/UI/breadcrumb/BreadcrumbCustom';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { Container } from '@/components/UI/common/layout';
import ExcelFileComponent from '@/components/UI/filterComponents/excelFilecomponet';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import StatusCheckboxGroup from '@/components/common/checkbox/StatusCheckboxGroup';
import FilterDropdown from '@/components/common/dropdown/FilterDropdown';
import LimitListDropdown from '@/components/common/dropdown/LimitListDropdown';
import ProgressBar from '@/components/common/progress/ProgressBar';
import TabSwitcherWithSlidingBackground from '@/components/common/tab/TabSwitcherWithSlidingBackground';
import TabSwitcherWithUnderline from '@/components/common/tab/TabSwitcherWithUnderline';
import CaretDownIcon from '@/components/icons/common/CaretDownIcon';
import ChartDonutIcon from '@/components/icons/common/ChartDonutIcon';
import FunnelIcon from '@/components/icons/common/FunnelIcon';
import SelectComponentNew from '@/components/common/select/SelectComponentNew';
import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate';
import { formatMoment } from '@/utils/helpers/formatMoment';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { listLsxStatus } from '../productions-orders/components/main/constants/listData';
import Image from 'next/image';
import { useProductionOrdersList } from '@/managers/api/productions-order/useProductionOrdersList';
import { FnlocalStorage } from '@/utils/helpers/localStorage';
import { useSelector } from 'react-redux';
import { useBranchList } from '@/hooks/common/useBranch';
import DateToDateReport from '@/components/UI/filterComponents/dateTodateReport';

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

// Dữ liệu mẫu để map ra bảng; thay thế bằng dữ liệu API khi tích hợp
const mockMaterialRows = [
  {
    id: 1,
    name: 'Đá kích cỡ 10-40mm',
    image: '/icon/default/default.png',
    sub: '(None)',
    code: 'DACUC10_40mm',
    lsx: 'LSX-20052505',
    unit: 'Tấn',
    qty: 400,
    convert: 400,
    reserved: 400,
    lack: '-',
    current: 400,
    total: 400,
  },
  {
    id: 2,
    name: 'tes 1',
    image: '/icon/default/default.png',
    sub: '(None)',
    code: 'test 1',
    lsx: 'LSX-20052505',
    unit: 'Tấn',
    qty: 400,
    convert: 400,
    reserved: 400,
    lack: '-',
    current: 400,
    total: 400,
  },
  {
    id: 3,
    name: 'tes 2',
    image: '/icon/default/default.png',
    sub: '(None)',
    code: 'test 2',
    lsx: 'LSX-20052505',
    unit: 'Tấn',
    qty: 300,
    convert: 300,
    reserved: 300,
    lack: '-',
    current: 300,
    total: 300,
  },
  {
    id: 4,
    name: 'tes 3',
    image: '/icon/default/default.png',
    sub: '(None)',
    code: 'test 3',
    lsx: 'LSX-20052505',
    unit: 'Tấn',
    qty: 200,
    convert: 200,
    reserved: 200,
    lack: '-',
    current: 200,
    total: 200,
  },
];

const mockFinishedRows = [
  {
    id: 1,
    name: 'Khung Xe winner X',
    image: '/icon/default/default.png',
    sub: '(None)',
    code: 'KhungXe',
    tag: 'Bán thành phẩm',
    unit: 'Cái',
    qty: 11,
    reserved: 0,
    lack: 11,
    current: 0,
    total: 11,
    lsx: 'LSX-20052505',
  },
  {
    id: 2,
    name: 'Khung Xe winner X',
    image: '/icon/default/default.png',
    sub: '(None)',
    code: 'KhungXe',
    tag: 'Bán thành phẩm',
    unit: 'Cái',
    qty: 11,
    reserved: 0,
    lack: 11,
    current: 5,
    total: 11,
    lsx: 'LSX-20052505',
  },
];

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

  // Params cho API với useMemo để đảm bảo refetch khi selectStatusFilter, limit, valueBr hoặc dateRange thay đổi
  const params = useMemo(
    () => ({
      branch_id: valueBr?.value || '',
      _po_id: '',
      search: '',
      _pod_id: '',
      orders_id: '',
      date_end: formatDateToDMY(dateRange.endDate),
      internal_plans_id: '',
      date_start: formatDateToDMY(dateRange.startDate),
      item_variation_id: null,
      limit: limit,
      ...(selectStatusFilter?.length > 0 && {
        status: selectStatusFilter,
      }),
    }),
    [selectStatusFilter, limit, valueBr, dateRange]
  );

  // call api list production
  const { data: dataProductionOrders, isLoading: isLoadingProductionOrderList } = useProductionOrdersList(params);

  // flag của list production
  const flagProductionOrders = useMemo(() => (dataProductionOrders ? dataProductionOrders?.pages?.flatMap(page => page?.productionOrders) : []), [dataProductionOrders]);

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
          <ExcelFileComponent filename='Tổng hợp kế hoạch BTP & NVL' title='THKHBTPNVL' multiDataSet={[]} classBtn='!py-3' />
          <TabSwitcherWithSlidingBackground tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
          <FilterDropdown
            trigger={triggerFilterAll}
            style={{
              boxShadow: '0px 20px 24px -4px #10182814, 0px 4px 4px 0px #00000040',
            }}
            classNameContainer='!w-fit h-11'
            className='flex flex-col gap-4 border-[#D8DAE5] rounded-lg 3xl:!min-w-[400px] 2xl:min-w-[350px] xl:min-w-[300px]'
            dropdownId='dropdownFilterMain'
          >
            <div className='3xl:text-xl text-lg text-[#344054] font-medium'>Bộ lọc</div>
            <div className='grid w-full grid-cols-1 gap-3'>
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
            <div className='w-full h-[300px] flex items-center justify-center text-[#667085]'>Hãy chọn một lệnh sản xuất ở panel bên trái để hiển thị dữ liệu</div>
          ) : activeTabMaterialFinishedProduct?.id === 'material' ? (
            (() => {
              const data = mockMaterialRows;

              const ColNum = ({ value, unit }) => (
                <div className='flex flex-col items-center gap-0.5'>
                  <span className='font-semibold text-[#3A3E4C]'>{value}/</span>
                  <span className='text-xs text-[#9295A4]'>{unit}</span>
                </div>
              );

              return (
                <div className='w-full overflow-hidden'>
                  <div className='overflow-auto'>
                    <table className='min-w-full table-auto responsive-text-sm'>
                      <thead className='bg-[#FBFCFE] text-[#667085] capitalize'>
                        <tr>
                          <th className='text-left px-3 py-2'>Nguyên vật liệu</th>
                          {activeTab?.id === 'each_order' && <th className='text-center px-3 py-2'>LSX</th>}
                          <th className='text-center px-3 py-2'>Số lượng cần</th>
                          <th className='text-center px-3 py-2'>Quy đổi</th>
                          <th className='text-center px-3 py-2'>Đã giữ/Mua</th>
                          <th className='text-center px-3 py-2'>Thiếu</th>
                          <th className='text-center px-3 py-2'>Tiến độ</th>
                        </tr>
                      </thead>
                      <tbody className='[&>tr]:border-b [&>tr]:border-[#F3F3F4] [&>tr:last-child]:border-b-0'>
                        {data.map(item => (
                          <tr key={item.id} className='hover:bg-slate-100/40'>
                            <td className='px-3 py-2'>
                              <div className='flex items-center gap-2'>
                                <Image src={item.image} alt={item.name} width={40} height={40} className='object-cover rounded-md' />
                                <div className='flex flex-col'>
                                  <span className='text-[#3A3E4C] font-semibold'>{item.name}</span>
                                  <span className='text-xs text-[#9295A4]'>{item.sub}</span>
                                  <span className='text-[11px] text-[#1D6AE5]'>{item.code}</span>
                                </div>
                              </div>
                            </td>
                            {activeTab?.id === 'each_order' && <td className='px-3 py-2 text-center text-[#3A3E4C]'>{item.lsx || '-'}</td>}
                            <td className='px-3 py-2'>
                              <ColNum value={item.qty} unit={item.unit} />
                            </td>
                            <td className='px-3 py-2'>
                              <ColNum value={item.convert} unit={item.unit} />
                            </td>
                            <td className='px-3 py-2'>
                              <ColNum value={item.reserved} unit={item.unit} />
                            </td>
                            <td className='px-3 py-2 text-center text-[#9295A4]'>{item.lack}</td>
                            <td className='px-3 py-2'>
                              <ProgressBar current={item.current} total={item.total} name={item.unit} typeProgress='tablePlaning' />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()
          ) : (
            (() => {
              const data = mockFinishedRows;

              return (
                <div className='w-full overflow-hidden'>
                  <div className='overflow-auto'>
                    <table className='min-w-full table-auto responsive-text-sm'>
                      <thead className='bg-[#FBFCFE] text-[#667085] capitalize'>
                        <tr>
                          <th className='text-left px-3 py-2'>Bán thành phẩm</th>
                          {activeTab?.id === 'each_order' && <th className='text-center px-3 py-2'>LSX</th>}
                          <th className='text-center px-3 py-2'>Đơn vị tính</th>
                          <th className='text-center px-3 py-2'>Số lượng cần</th>
                          <th className='text-center px-3 py-2'>Đã giữ</th>
                          <th className='text-center px-3 py-2'>Thiếu</th>
                          <th className='text-center px-3 py-2'>Tiến độ</th>
                        </tr>
                      </thead>
                      <tbody className='[&>tr]:border-b [&>tr]:border-[#F3F3F4] [&>tr:last-child]:border-b-0'>
                        {data.map(item => (
                          <tr key={item.id} className='hover:bg-slate-100/40'>
                            <td className='px-3 py-2'>
                              <div className='flex items-center gap-2'>
                                <Image src={item.image} alt={item.name} width={40} height={40} className='object-cover rounded-md' />
                                <div className='flex flex-col'>
                                  <span className='text-[#3A3E4C] font-semibold'>{item.name}</span>
                                  <span className='text-xs text-[#9295A4]'>{item.sub}</span>
                                  <span className='text-[11px] text-[#1D6AE5] w-fit'>{item.code}</span>
                                  <span className='px-2 py-0.5 text-[10px] rounded bg-[#E9F9EF] text-[#139D3E] w-fit mt-1'>{item.tag}</span>
                                </div>
                              </div>
                            </td>
                            {activeTab?.id === 'each_order' && <td className='px-3 py-2 text-center text-[#3A3E4C]'>{item.lsx || 'LSX-20052505'}</td>}
                            <td className='px-3 py-2 text-center text-[#3A3E4C]'>{item.unit}</td>
                            <td className='px-3 py-2 text-center text-[#3A3E4C]'>{item.qty}</td>
                            <td className='px-3 py-2 text-center text-[#3A3E4C]'>{item.reserved || '-'}</td>
                            <td className='px-3 py-2 text-center text-[#3A3E4C]'>{item.lack}</td>
                            <td className='px-3 py-2'>
                              <ProgressBar current={item.current} total={item.total} name={item.unit} typeProgress='tablePlaning' />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </div>
    </Container>
  );
};

export default SummaryBtpNvl;
