import OnResetData from '@/components/UI/btnResetData/btnReset';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import DropdowLimit from '@/components/UI/dropdowLimit/dropdowLimit';
import DateToDateReport from '@/components/UI/filterComponents/dateTodateReport';
import SearchComponent from '@/components/UI/filterComponents/searchComponent';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import Pagination from '@/components/UI/pagination';
import SelectSearchReport from '@/components/common/select/SelectSearchReport';
import ExcelIcon from '@/components/icons/common/Excel';
import ReportLayout from '@/components/layout/ReportLayout';
import { useLanguageContext } from '@/context/ui/LanguageContext';
import { usePersistedBranches } from '@/hooks/common/usePersistedBranches';
import { useGetItemsWithBranch, useGetSuppliersWithBranch } from '@/hooks/useComboBoxReport';
import usePagination from '@/hooks/usePagination';
import useStatusExprired from '@/hooks/useStatusExprired';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { PiPackage } from 'react-icons/pi';
import { useDebounce } from 'use-debounce';
import { useGetOrderTracking } from './hook';
import { exportOrderTracking } from './hook/useExportExcel';

const breadcrumbItems = [{ label: 'Báo cáo' }, { label: 'Tồn quỹ' }, { label: 'Báo cáo chi phí' }];

// Mock dữ liệu mẫu khi chưa có API
const rawMockExpense = [
  {
    0: '4',
    1: '',
    2: '6422',
    3: '<a onclick="view_costs_detail(4)">CHI PHÍ CÔNG TY</a>',
    4: "<p class='text-right'>397,302,704</p>",
  },
  {
    0: '26',
    1: '6422',
    2: '64221',
    3: '<a onclick="view_costs_detail(26)">Chi phí văn phòng</a>',
    4: "<p class='text-right'>15,056,000</p>",
  },
  ['35', '64221', '', '<a onclick="view_costs_detail(35)">Chi phí máy in</a>', "<p class='text-right'>1,550,000</p>"],
  ['36', '64221', '', '<a onclick="view_costs_detail(36)">Chi phí mua vật dụng VP</a>', "<p class='text-right'>10,000,000</p>"],
  ['37', '64221', '', '<a onclick="view_costs_detail(37)">Chi CPN</a>', "<p class='text-right'>116,000</p>"],
  ['38', '64221', '', '<a onclick="view_costs_detail(38)">Chi tiền điện thoại</a>', "<p class='text-right'>100,000</p>"],
  ['43', '64221', '', '<a onclick="view_costs_detail(43)">Chi phí hoạt động công ty</a>', "<p class='text-right'>3,290,000</p>"],
  {
    0: '27',
    1: '6422',
    2: '64222',
    3: '<a onclick="view_costs_detail(27)">Chi phí ngân hàng</a>',
    4: "<p class='text-right'>100,429</p>",
  },
  {
    0: '28',
    1: '6422',
    2: '64223',
    3: '<a onclick="view_costs_detail(28)">Chi phí vận chuyển</a>',
    4: "<p class='text-right'>5,500,000</p>",
  },
  {
    0: '29',
    1: '6422',
    2: '64224',
    3: '<a onclick="view_costs_detail(29)">Chi phí thuê kho xưởng</a>',
    4: "<p class='text-right'>110,775,000</p>",
  },
  {
    0: '30',
    1: '6422',
    2: '64225',
    3: '<a onclick="view_costs_detail(30)">Chi phí vật dụng kho</a>',
    4: "<p class='text-right'>1,302,000</p>",
  },
  {
    0: '31',
    1: '6422',
    2: '64226',
    3: '<a onclick="view_costs_detail(31)">Chi phí tiền điện</a>',
    4: "<p class='text-right'>6,470,656</p>",
  },
  {
    0: '32',
    1: '6422',
    2: '64227',
    3: '<a onclick="view_costs_detail(32)">Chi phí mua đồ cúng</a>',
    4: "<p class='text-right'>608,000</p>",
  },
  {
    0: '33',
    1: '6422',
    2: '64228',
    3: '<a onclick="view_costs_detail(33)">Chi phí khác</a>',
    4: "<p class='text-right'>701,000</p>",
  },
  {
    0: '34',
    1: '6422',
    2: '64229',
    3: '<a onclick="view_costs_detail(34)">Chi phí lương nhân viên</a>',
    4: "<p class='text-right'>256,637,609</p>",
  },
  {
    0: '45',
    1: '6422',
    2: '64230',
    3: '<a onclick="view_costs_detail(45)">Chi phí vật dụng vệ sinh</a>',
    4: "<p class='text-right'>122,000</p>",
  },
  {
    0: '5',
    1: '',
    2: '331',
    3: '<a onclick="view_costs_detail(5)">CHI TRẢ TIỀN MUA HÀNG</a>',
    4: "<p class='text-right'>5,982,760,069</p>",
  },
  {
    0: '6',
    1: '',
    2: '6411',
    3: '<a onclick="view_costs_detail(6)">CHI PHÍ XE MÁY</a>',
    4: "<p class='text-right'>45,000</p>",
  },
  {
    0: '9',
    1: '6411',
    2: '64112',
    3: '<a onclick="view_costs_detail(9)">Chi phí sửa xe máy - 52T8 5449 - Wave</a>',
    4: "<p class='text-right'>25,000</p>",
  },
  {
    0: '48',
    1: '6411',
    2: '64113',
    3: '<a onclick="view_costs_detail(48)">Chi phí sửa xe máy - 59S2 386.67 - Blade</a>',
    4: "<p class='text-right'>20,000</p>",
  },
  {
    0: '11',
    1: '',
    2: '6412',
    3: '<a onclick="view_costs_detail(11)">CHI PHÍ BA GÁC</a>',
    4: "<p class='text-right'>1,795,000</p>",
  },
  {
    0: '12',
    1: '6412',
    2: '64121',
    3: '<a onclick="view_costs_detail(12)">Chi phí xăng xe ba gác</a>',
    4: "<p class='text-right'>445,000</p>",
  },
  {
    0: '13',
    1: '6412',
    2: '64122',
    3: '<a onclick="view_costs_detail(13)">Chi phí sửa xe ba gác</a>',
    4: "<p class='text-right'>1,350,000</p>",
  },
  ['8', '64122', '64111', '<a onclick="view_costs_detail(8)">Chi phí xăng xe máy</a>', "<p class='text-right'>1,200,000</p>"],
  {
    0: '14',
    1: '',
    2: '6413',
    3: '<a onclick="view_costs_detail(14)">CHI PHÍ XE NÂNG</a>',
    4: "<p class='text-right'>2,000,000</p>",
  },
  {
    0: '16',
    1: '6413',
    2: '64131',
    3: '<a onclick="view_costs_detail(16)">Chi phí dầu xe nâng</a>',
    4: "<p class='text-right'>2,000,000</p>",
  },
  {
    0: '18',
    1: '',
    2: '6414',
    3: '<a onclick="view_costs_detail(18)">CHI PHÍ XE TẢI</a>',
    4: "<p class='text-right'>6,207,000</p>",
  },
  {
    0: '19',
    1: '6414',
    2: '64141',
    3: '<a onclick="view_costs_detail(19)">Chi phí dầu xe tải ISUZU - 51C 46965</a>',
    4: "<p class='text-right'>1,000,000</p>",
  },
  {
    0: '20',
    1: '6414',
    2: '64142',
    3: '<a onclick="view_costs_detail(20)">Chi phí sửa xe tải ISUZU - 51C 46965</a>',
    4: "<p class='text-right'>2,057,000</p>",
  },
  {
    0: '21',
    1: '6414',
    2: '64143',
    3: '<a onclick="view_costs_detail(21)">Chi phí dầu xe tải KIA - 51C 78531</a>',
    4: "<p class='text-right'>1,820,000</p>",
  },
  {
    0: '22',
    1: '6414',
    2: '64144',
    3: '<a onclick="view_costs_detail(22)">Chi phí sửa xe tải KIA - 51C 78531</a>',
    4: "<p class='text-right'>330,000</p>",
  },
  {
    0: '46',
    1: '6414',
    2: '64145',
    3: '<a onclick="view_costs_detail(46)">Chi phí xăng, dầu xe tải khác (mượn, đổi)</a>',
    4: "<p class='text-right'>1,000,000</p>",
  },
  {
    0: '23',
    1: '',
    2: '6415',
    3: '<a onclick="view_costs_detail(23)">CHI PHÍ XE VAN</a>',
    4: "<p class='text-right'>1,580,000</p>",
  },
  {
    0: '24',
    1: '6415',
    2: '64151',
    3: '<a onclick="view_costs_detail(24)">Chi phí xăng xe Van - 50G 02556</a>',
    4: "<p class='text-right'>1,500,000</p>",
  },
  {
    0: '25',
    1: '6415',
    2: '64152',
    3: '<a onclick="view_costs_detail(25)">Chi phí sửa xe Van - 50G 02556</a>',
    4: "<p class='text-right'>80,000</p>",
  },
  {
    0: '44',
    1: '',
    2: '333',
    3: '<a onclick="view_costs_detail(44)">Chi nộp thuế</a>',
    4: "<p class='text-right'>20,340,529</p>",
  },
  {
    0: '49',
    1: '333',
    2: '33311',
    3: '<a onclick="view_costs_detail(49)">Thuế GTGT đầu ra</a>',
    4: "<p class='text-right'>20,340,529</p>",
  },
];

const stripHtml = str => (str ? str.replace(/<[^>]*>/g, '').trim() : '');
const numberFromMoney = str => {
  if (!str) return 0;
  const onlyDigits = str.replace(/[^\d]/g, '');
  return onlyDigits ? Number(onlyDigits) : 0;
};
const normalizeMockExpense = rawMockExpense.map(item => {
  const arr = Array.isArray(item) ? item : [item?.['0'], item?.['1'], item?.['2'], item?.['3'], item?.['4']];
  return {
    id: arr?.[0] || '-',
    code_purchase_order: arr?.[1] || '-',
    item_code: arr?.[2] || '-',
    item_name: stripHtml(arr?.[3]) || '-',
    quantity_left: numberFromMoney(stripHtml(arr?.[4])),
  };
});

const Expense = () => {
  const router = useRouter();
  const { paginate } = usePagination();
  const dataLang = useLanguageContext();
  const statusExprired = useStatusExprired();
  const currentPage = Number(router.query.page) || 1;

  const [dateRange, setDateRange] = useState({
    startDate: undefined,
    endDate: undefined,
  });
  const [limit, setLimit] = useState(15);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue] = useDebounce(searchValue, 500);
  const [itemSearchValue, setItemSearchValue] = useState('');
  const [debouncedItemSearchValue] = useDebounce(itemSearchValue, 500);
  const [supplierSearchValue, setSupplierSearchValue] = useState('');
  const [debouncedSupplierSearchValue] = useDebounce(supplierSearchValue, 500);

  const { selectedBranches, setSelectedBranches } = usePersistedBranches('report_branch_ids');

  const { data: itemsWithBranch } = useGetItemsWithBranch({
    search: debouncedItemSearchValue,
    branch_ids: selectedBranches?.length > 0 ? selectedBranches : null,
  });

  const { data: suppliersWithBranch } = useGetSuppliersWithBranch({
    search: debouncedSupplierSearchValue,
    branch_ids: selectedBranches?.length > 0 ? selectedBranches : null,
  });

  const {
    data: orderTrackingData,
    isFetching: isFetchingOrderTracking,
    refetch: refetchOrderTracking,
  } = useGetOrderTracking({
    page: currentPage,
    limit: limit,
    search: debouncedSearchValue,
    filter: {
      product_id: selectedItem ? selectedItem : undefined,
      id_suppliers: selectedSupplier ? selectedSupplier : undefined,
      branch_ids: selectedBranches?.length > 0 ? selectedBranches : null,
      ...(dateRange?.startDate !== undefined && { start_date: dateRange.startDate }),
      ...(dateRange?.endDate !== undefined && { end_date: dateRange.endDate }),
    },
  });

  const handleDateChange = newValue => {
    setDateRange(newValue);
  };

  const handleItemChange = value => {
    setSelectedItem(value || null);
  };

  const handleSupplierChange = value => {
    setSelectedSupplier(value || null);
  };

  const handleSearch = value => {
    const searchValue = value?.target?.value || (typeof value === 'string' ? value : '');
    setSearchValue(searchValue);
  };

  const handleLimitChange = newLimit => {
    setLimit(newLimit);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: 1, limit: newLimit },
    });
  };

  const handleExportExcel = () => {
    exportOrderTracking(dataSource || [], orderTrackingData?.rTotal || {}, 'Theo dõi đơn đặt hàng.xlsx');
  };

  // Ưu tiên dữ liệu API, fallback mock để hiển thị mẫu
  const dataSource = normalizeMockExpense;
  // const dataSource = orderTrackingData?.rResult?.length ? orderTrackingData?.rResult : normalizeMockExpense;

  // Tính cấp độ theo chuỗi mã mục cha (đệ quy)
  const codeMap = new Map((dataSource || []).map(r => [r?.item_code || r?.id, r]));
  const depthMemo = {};
  const getDepth = row => {
    const key = row?.item_code || row?.id || row?.code_purchase_order || `row-${Math.random()}`;
    if (depthMemo[key]) return depthMemo[key];

    let depth = 1;
    let current = row;
    const visited = new Set();
    while (current?.code_purchase_order) {
      const currentKey = current?.item_code || current?.id || current?.code_purchase_order;
      if (currentKey && visited.has(currentKey)) {
        depth = Math.max(depth, 3); // phát hiện vòng lặp, coi như cấp 3+
        break;
      }
      if (currentKey) visited.add(currentKey);

      const parent = codeMap.get(current.code_purchase_order);
      if (!parent) {
        depth += 1;
        break;
      }
      depth += 1;
      current = parent;
      if (depth > 10) break; // tránh vòng lặp sâu bất thường
    }

    depthMemo[key] = depth;
    return depth;
  };

  const getRowBg = row => {
    const depth = getDepth(row);
    if (depth === 1) return '#DFF0D8';
    if (depth === 2) return '#FCF8E3';
    return '#ffffff';
  };

  // Khai báo cột: dùng chung cho thead/tbody/tfoot
  const columns = [
    {
      key: 'date',
      header: 'STT',
      thClass: 'w-24 h-2 p-0 text-center font-semibold text-gray-700 sticky left-0 bg-white z-20',
      tdClass: 'p-0 h-2 text-center text-gray-700 align-middle sticky left-0 z-20 bg-white',
      rowSpan: false,
      render: (_row, idx) => idx + 1,
      // footer: (_rTotal, idx) => (idx === 1 ? 'Tổng cộng' : ''),
    },
    {
      key: 'code_purchase_order',
      header: 'Mã mục cha',
      thClass: 'min-w-36 h-2 p-0 text-center font-semibold text-gray-700 sticky left-24 bg-white z-20',
      tdClass: 'p-0 h-2 text-center text-gray-700 align-middle sticky left-24 z-20 bg-white',
      rowSpan: false,
      render: row => row?.code_purchase_order || '-',
    },
    {
      key: 'item_code',
      header: 'Mã chi phí',
      thClass: 'min-w-24 h-2 p-0 font-semibold text-gray-700',
      tdClass: 'p-0 h-2 text-gray-700 align-middle',
      rowSpan: false,
      render: row => row?.item_code || '-',
    },
    {
      key: 'item_name',
      header: 'Tên khoản chi phí',
      thClass: 'min-w-60 h-2 p-0 font-semibold text-gray-700',
      tdClass: 'p-0 h-2 text-gray-700 align-middle',
      rowSpan: false,
      render: row => row?.item_name || '-',
    },
    {
      key: 'item_variation',
      header: 'Đã chi',
      thClass: 'min-w-40 h-2 p-0 text-center font-semibold text-gray-700',
      tdClass: 'p-0 h-2 text-center text-gray-700',
      rowSpan: false,
      render: row => row?.quantity_left || '-',
    },
  ];

  return (
    <ReportLayout
      title='Báo cáo chi phí'
      statusExprired={statusExprired}
      breadcrumbItems={breadcrumbItems}
      branchValue={selectedBranches}
      onBranchChange={setSelectedBranches}
      onBranchClear={() => setSelectedBranches([])}
      filterSection={
        <div className='w-full items-center flex justify-between gap-4'>
          <div className='grid grid-cols-2 gap-3'>
            <DateToDateReport placeholder='Từ ngày đến ngày' value={dateRange} onChange={handleDateChange} className='w-full' />
            <SelectSearchReport
              placeholder='Danh mục'
              onSearch={value => {
                setItemSearchValue(value);
              }}
              onChange={handleItemChange}
              onClear={() => setSelectedItem(null)}
              icon={<PiPackage color='#9295A4' className='size-4' />}
              className='w-full'
              options={itemsWithBranch || []}
              value={selectedItem}
            />
          </div>
          <div className='flex justify-end gap-3 items-center w-auto flex-shrink-0'>
            <SearchComponent dataLang={dataLang} placeholder='Tìm kiếm theo phiếu' onChange={handleSearch} value={searchValue} classNameBox='!py-2 2xl:!p-2.5' />
            <OnResetData sOnFetching={refetchOrderTracking} className='!py-3' />
            <button onClick={handleExportExcel} className='!py-3 3xl:py-3 3xl:px-4 px-3 flex items-center space-x-2 bg-white hover:bg-primary-07 rounded-lg border border-blue-fmrp transition'>
              <ExcelIcon className='3xl:size-5 size-4 text-blue-fmrp' />
              <span className='text-blue-fmrp responsive-text-sm font-medium whitespace-nowrap'>{dataLang?.client_list_exportexcel}</span>
            </button>
          </div>
        </div>
      }
      tableSection={
        isFetchingOrderTracking ? (
          <Loading color='#0f4f9e' />
        ) : dataSource?.length > 0 ? (
          <Customscrollbar alwaysShowScrollbar={true} className='h-full flex-1 overflow-auto'>
            <table className='w-full border-0 p-0 m-0'>
              <thead>
                <tr className='responsive-text-sm sticky top-0 z-50 bg-white capitalize'>
                  {columns.map((col, index) => (
                    <th key={col.key} className={col.thClass}>
                      <div
                        className={`w-full h-full flex ${
                          col.thClass?.includes('text-center') ? 'items-center justify-center' : 'justify-start items-center'
                        }  px-3 py-2 border-y border-r border-[#E0E0E1] ${index === 0 ? 'border-l' : ''}`}
                      >
                        {col.header}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataSource?.map((row, rowIndex) => (
                  <tr
                    key={`${row.id || 'row'}-${row.purchase_order_item_id || rowIndex}`}
                    className='hover:bg-gray-50 responsive-text-sm relative'
                    style={{ backgroundColor: getRowBg(row) }}
                  >
                    {columns.map((col, index) => {
                      if (col.rowSpan) {
                        if (!row.isFirstItem) return null;
                        return (
                          <td key={col.key} rowSpan={row.totalItems} className={col.tdClass} style={{ backgroundColor: getRowBg(row) }}>
                            <div
                              className={`w-full h-full flex items-center px-3 py-2 border-r border-[#E0E0E1] 
                                ${col.tdClass?.includes('text-center') ? 'justify-center' : ''} 
                                ${index === 0 ? 'border-l' : ''} 
                                ${rowIndex === (orderTrackingData?.rResult?.length || 0) - 1 ? '' : 'border-b'}`}
                              style={{ backgroundColor: getRowBg(row) }}
                            >
                              {col.render(row)}
                            </div>
                          </td>
                        );
                      }
                      return (
                        <td key={col.key} className={col.tdClass} style={{ backgroundColor: getRowBg(row) }}>
                          <div
                            className={`w-full h-full flex items-center ${col.tdClass?.includes('text-center') ? 'justify-center' : ''} px-3 py-2 border-r ${
                              rowIndex === (orderTrackingData?.rResult?.length || 0) - 1 ? '' : 'border-b'
                            }
                            ${index === 0 ? 'border-l' : ''}
                            border-[#E0E0E1]`}
                            style={{ backgroundColor: getRowBg(row) }}
                          >
                            {col.render(row, rowIndex)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className='bg-white sticky bottom-[-1px] z-50 responsive-text-sm'>
                  {columns.map((col, idx) => {
                    // const content = typeof col.footer === 'function' ? col.footer(orderTrackingData?.rTotal || {}, idx) : idx === 1 ? 'Tổng cộng' : '';

                    return (
                      <td key={col.key} className={`${col.tdClass} font-semibold text-gray-700`}>
                        <div className={`w-full h-full flex items-center justify-center px-3 py-2 uppercase border-t border-[#E0E0E1]`}></div>
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            </table>
          </Customscrollbar>
        ) : (
          <NoData type='report' classNameImage='w-[245px]' />
        )
      }
      totalSection={
        dataSource?.length > 0 && (
          <Pagination postsPerPage={limit} totalPosts={Number(orderTrackingData?.output?.iTotalDisplayRecords) || 0} paginate={paginate} currentPage={currentPage} />
        )
      }
      paginationSection={<DropdowLimit sLimit={handleLimitChange} limit={limit} dataLang={dataLang} />}
    />
  );
};

export default Expense;
