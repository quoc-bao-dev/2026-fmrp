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
import usePagination from '@/hooks/usePagination';
import useStatusExprired from '@/hooks/useStatusExprired';
import moment from 'moment';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { PiPackage } from 'react-icons/pi';
import { useDebounce } from 'use-debounce';
import { useGetOrderTracking, useSalesOrderComboboxWithBranch } from './hook';
import { exportWithMergeSalesRevenue } from './hook/useExportExcel';
import formatNumber from '@/utils/helpers/formatnumber';

const breadcrumbItems = [
  { label: 'Báo cáo' },
  { label: 'Báo cáo mua hàng' },
  {
    label: 'Theo dõi đơn đặt hàng',
    href: '/report-statistical/purchase-report/order-tracking',
  },
];

const OrderTracking = props => {
  const router = useRouter();
  const { paginate } = usePagination();
  const statusExprired = useStatusExprired();
  const dataLang = useLanguageContext();

  // State management
  const [dateRange, setDateRange] = useState({
    startDate: undefined,
    endDate: undefined,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [selectedCustomer, setSelectedCustomer] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState([]);
  const [limit, setLimit] = useState(15);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue] = useDebounce(searchValue, 500);

  // Search values riêng cho từng API
  const [customerSearchValue, setCustomerSearchValue] = useState('');
  const [debouncedCustomerSearchValue] = useDebounce(customerSearchValue, 500);
  const [orderSearchValue, setOrderSearchValue] = useState('');
  const [debouncedOrderSearchValue] = useDebounce(orderSearchValue, 500);
  const { selectedBranches, setSelectedBranches } = usePersistedBranches('report_branch_ids');

  const currentPage = Number(router.query.page) || 1;

  // Hàm chuyển đổi Date object sang định dạng d/m/Y
  const formatDateToDMY = date => {
    if (!date) return undefined;
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Tạo filter với định dạng ngày d/m/Y
  const getFormattedDateRange = () => {
    if (!dateRange?.startDate || !dateRange?.endDate) return {};

    return {
      start_date: formatDateToDMY(new Date(dateRange.startDate)),
      end_date: formatDateToDMY(new Date(dateRange.endDate)),
    };
  };

  const { data: dataCode } = useSalesOrderComboboxWithBranch(debouncedOrderSearchValue, selectedBranches?.length > 0 ? selectedBranches : null);

  const {
    data: dataSalesRevenue,
    isFetching: isFetchingSalesRevenue,
    refetch: refetchSalesRevenue,
  } = useGetOrderTracking({
    page: currentPage,
    limit: limit,
    ...getFormattedDateRange(),
    search: debouncedSearchValue,
    client_ids: selectedCustomer?.length > 0 ? selectedCustomer : undefined,
    order_ids: selectedOrder?.length > 0 ? selectedOrder : undefined,
    branch_ids: selectedBranches?.length > 0 ? selectedBranches : null,
  });

  // Dữ liệu dạng phẳng: dùng trực tiếp rResult
  const flattenedRows = useMemo(() => {
    return Array.isArray(dataSalesRevenue?.rResult) ? dataSalesRevenue.rResult : [];
  }, [dataSalesRevenue]);

  const flattenedDataForExport = useMemo(() => flattenedRows.map(r => ({ ...r, ...r.item })), [flattenedRows]);

  // Handler functions
  const handleDateChange = newValue => {
    setDateRange(newValue);
  };

  const handleOrderChange = values => {
    setSelectedOrder(Array.isArray(values) ? values : []);
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
    exportWithMergeSalesRevenue(flattenedDataForExport || [], 'Báo cáo doanh số theo bán hàng.xlsx');
  };

  // Khai báo cột: dùng chung cho thead/tbody/tfoot
  const columns = [
    {
      key: 'date',
      header: 'Ngày chứng từ',
      thClass: 'min-w-40 h-2 p-0 text-center font-semibold text-gray-700 sticky left-0 bg-white z-20',
      tdClass: 'p-0 h-2 text-center text-gray-700 align-middle sticky left-0 z-20 bg-white',
      rowSpan: false,
      render: row => (row?.date ? moment(row.date).format('DD/MM/YYYY HH:mm:ss') : '-'),
      footer: (_rTotal, idx) => (idx === 1 ? 'Tổng cộng' : ''),
    },
    {
      key: 'code_purchase_order',
      header: 'Mã chứng từ',
      thClass: 'min-w-36 h-2 p-0 text-center font-semibold text-gray-700 sticky left-40 bg-white z-20',
      tdClass: 'p-0 h-2 text-center text-gray-700 align-middle sticky left-40 z-20 bg-white',
      rowSpan: false,
      render: row => row?.code_purchase_order || '-',
    },
    {
      key: 'item_code',
      header: 'Mã hàng',
      thClass: 'min-w-32 h-2 p-0 font-semibold text-gray-700',
      tdClass: 'p-0 h-2 text-gray-700 align-middle',
      rowSpan: false,
      render: row => row?.item_code || '-',
    },
    {
      key: 'item_name',
      header: 'Tên hàng',
      thClass: 'min-w-40 h-2 p-0 font-semibold text-gray-700',
      tdClass: 'p-0 h-2 text-gray-700 align-middle',
      rowSpan: false,
      render: row => row?.item_name || '-',
    },
    {
      key: 'item_variation',
      header: 'Biến thể',
      thClass: 'min-w-40 h-2 p-0 font-semibold text-gray-700',
      tdClass: 'p-0 h-2 text-gray-700',
      rowSpan: false,
      render: row => row?.item_variation || '-',
    },
    {
      key: 'unit_name',
      header: 'ĐVT',
      thClass: 'min-w-24 h-2 p-0 text-center font-semibold text-gray-700',
      tdClass: 'p-0 h-2 text-center text-gray-700',
      rowSpan: false,
      render: row => row?.unit_name || '-',
    },
    {
      key: 'quantity',
      header: 'Số lượng',
      thClass: 'min-w-28 h-2 p-0 text-center font-semibold text-gray-700',
      tdClass: 'p-0 h-2 text-center text-gray-700',
      rowSpan: false,
      render: row => formatNumber(Number(row?.quantity)),
      footer: rTotal => formatNumber(Number(rTotal?.total_quantity) || 0),
    },
    {
      key: 'quantity_import',
      header: 'Số lượng đã nhập',
      thClass: 'min-w-36 h-2 p-0 text-center font-semibold text-gray-700',
      tdClass: 'p-0 h-2 text-center text-gray-700',
      rowSpan: false,
      render: row => formatNumber(Number(row?.quantity_import)),
      footer: rTotal => formatNumber(Number(rTotal?.total_quantity_import) || 0),
    },
    {
      key: 'quantity_left',
      header: 'Số lượng còn lại',
      thClass: 'min-w-36 h-2 p-0 text-center font-semibold text-gray-700',
      tdClass: 'p-0 h-2 text-center text-gray-700',
      rowSpan: false,
      render: row => formatNumber(Number(row?.quantity_left)),
      footer: rTotal => formatNumber(Number(rTotal?.total_quantity_left) || 0),
    },
  ];

  return (
    <ReportLayout
      title='Theo dõi đơn đặt hàng'
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
              placeholder='Mặt hàng'
              onSearch={value => {
                setSearchTerm(value);
              }}
              onChange={handleOrderChange}
              onClear={() => setSelectedOrder([])}
              icon={<PiPackage color='#9295A4' className='size-4' />}
              className='w-full'
              options={dataCode || []}
              value={selectedOrder}
              mode='multiple'
            />
          </div>
          <div className='flex gap-3 items-center'>
            <SearchComponent dataLang={dataLang} placeholder='Tìm kiếm theo phiếu' onChange={handleSearch} value={searchValue} classNameBox='!py-2 2xl:!p-2.5' />
            <OnResetData sOnFetching={refetchSalesRevenue} className='!py-3' />
            <button onClick={handleExportExcel} className='!py-3 3xl:py-3 3xl:px-4 px-3 flex items-center space-x-2 bg-white hover:bg-primary-07 rounded-lg border border-background-blue-2 transition'>
              <ExcelIcon className='3xl:size-5 size-4 text-typo-blue-4' />
              <span className='text-typo-blue-4 responsive-text-sm font-medium whitespace-nowrap'>{dataLang?.client_list_exportexcel}</span>
            </button>
          </div>
        </div>
      }
      tableSection={
        isFetchingSalesRevenue ? (
          <Loading color='#0f4f9e' />
        ) : dataSalesRevenue?.rResult?.length > 0 ? (
          <Customscrollbar alwaysShowScrollbar={true} className='h-full flex-1 overflow-auto'>
            <table className='w-full border-0 p-0 m-0'>
              <thead>
                <tr className='responsive-text-sm sticky top-0 z-50 bg-white capitalize'>
                  {columns.map((col, index) => (
                    <th key={col.key} className={col.thClass}>
                      <div className={`w-full h-full flex ${col.thClass?.includes('text-center') ? 'items-center justify-center' : ''}  px-3 py-2 border-y border-r border-[#E0E0E1] ${index === 0 ? 'border-l' : ''}`}>{col.header}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {flattenedRows.map((row, rowIndex) => (
                  <tr key={`${row.id || 'row'}-${row.purchase_order_item_id || rowIndex}`} className='hover:bg-gray-50 responsive-text-sm relative'>
                    {columns.map((col, index) => {
                      if (col.rowSpan) {
                        if (!row.isFirstItem) return null;
                        return (
                          <td key={col.key} rowSpan={row.totalItems} className={col.tdClass}>
                            <div
                              className={`w-full h-full flex items-center px-3 py-2 border-r border-[#E0E0E1] 
                                ${col.tdClass?.includes('text-center') ? 'justify-center' : ''} 
                                ${index === 0 ? 'border-l' : ''} 
                                ${rowIndex === flattenedRows.length - 1 ? '' : 'border-b'}`}
                            >
                              {col.render(row)}
                            </div>
                          </td>
                        );
                      }
                      return (
                        <td key={col.key} className={col.tdClass}>
                          <div
                            className={`w-full h-full flex items-center ${col.tdClass?.includes('text-center') ? 'justify-center' : ''} px-3 py-2 border-r ${
                              rowIndex === flattenedRows.length - 1 ? '' : 'border-b'
                            }
                            ${index === 0 ? 'border-l' : ''}
                            border-[#E0E0E1]`}
                          >
                            {col.render(row)}
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
                    const content = typeof col.footer === 'function'
                      ? col.footer(dataSalesRevenue?.rTotal || {}, idx)
                      : (idx === 1 ? 'Tổng cộng' : '');

                    return (
                      <td key={col.key} className={`${col.tdClass} font-semibold text-gray-700`}>
                        <div className={`w-full h-full flex items-center justify-center px-3 py-2 uppercase border-t border-[#E0E0E1]`}>
                          {content}
                        </div>
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
        dataSalesRevenue?.rResult?.length > 0 && (
          <Pagination postsPerPage={limit} totalPosts={Number(dataSalesRevenue?.output?.iTotalDisplayRecords) || 0} paginate={paginate} currentPage={currentPage} />
        )
      }
      paginationSection={<DropdowLimit sLimit={handleLimitChange} limit={limit} dataLang={dataLang} />}
    />
  );
};

export default OrderTracking;
