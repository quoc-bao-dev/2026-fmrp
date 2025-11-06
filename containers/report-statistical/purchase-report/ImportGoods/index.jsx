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
import PopupDetailProduct from '@/containers/sales-export-product/sales-order/components/PopupDetailProduct';
import { useLanguageContext } from '@/context/ui/LanguageContext';
import { useClientComboboxWithBranch } from '@/hooks/common/useClients';
import { usePersistedBranches } from '@/hooks/common/usePersistedBranches';
import useSetingServer from '@/hooks/useConfigNumber';
import usePagination from '@/hooks/usePagination';
import useStatusExprired from '@/hooks/useStatusExprired';
import formatMoneyOrDash from '@/utils/helpers/formatMoneyOrDash';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import moment from 'moment';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { PiPackage } from 'react-icons/pi';
import { useDebounce } from 'use-debounce';
import { useGetSalesRevenue, useSalesOrderComboboxWithBranch } from './hook';
import { exportWithMergeSalesRevenue } from './hook/useExportExcel';

const breadcrumbItems = [
  { label: 'Báo cáo' },
  { label: 'Báo cáo mua hàng' },
  {
    label: 'Báo cáo nhập hàng',
    href: '/report-statistical/purchase-report/import-goods',
  },
];

const ImportGoods = props => {
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

  const { data: dataClient } = useClientComboboxWithBranch(debouncedCustomerSearchValue, selectedBranches?.length > 0 ? selectedBranches : null);
  const { data: dataCode } = useSalesOrderComboboxWithBranch(debouncedOrderSearchValue, selectedBranches?.length > 0 ? selectedBranches : null);

  const {
    data: dataSalesRevenue,
    isFetching: isFetchingSalesRevenue,
    refetch: refetchSalesRevenue,
  } = useGetSalesRevenue({
    page: currentPage,
    limit: limit,
    ...getFormattedDateRange(),
    search: debouncedSearchValue,
    client_ids: selectedCustomer?.length > 0 ? selectedCustomer : undefined,
    order_ids: selectedOrder?.length > 0 ? selectedOrder : undefined,
    branch_ids: selectedBranches?.length > 0 ? selectedBranches : null,
  });

  // Dữ liệu flatten dùng chung cho body/footer/export
  const flattenedRows = useMemo(() => {
    const rows = [];
    let globalIndex = 0;
    dataSalesRevenue?.aaData?.forEach((order, orderIndex) => {
      const totalItems = order.items?.length || 1;
      order.items?.forEach((item, itemIndex) => {
        rows.push({
          ...order,
          item,
          globalIndex: globalIndex++,
          orderIndex,
          itemIndex,
          isFirstItem: itemIndex === 0,
          isLastItem: itemIndex === (order.items?.length || 1) - 1,
          totalItems,
        });
      });
    });
    return rows;
  }, [dataSalesRevenue]);

  const flattenedDataForExport = useMemo(() => flattenedRows.map(r => ({ ...r, ...r.item })), [flattenedRows]);

  // Handler functions
  const handleDateChange = newValue => {
    setDateRange(newValue);
  };

  const handleCustomerChange = values => {
    setSelectedCustomer(Array.isArray(values) ? values : []);
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
      thClass: 'min-w-32 h-2 p-0 font-semibold text-gray-700 sticky left-0 bg-white z-20',
      tdClass: 'p-0 h-2 text-center text-gray-700 align-middle sticky left-0 z-20 bg-white',
      rowSpan: true,
      render: row => (row?.date ? moment(row.date).format('DD/MM/YYYY HH:mm:ss') : '-'),
    },
    {
      key: 'customer_name',
      header: 'Khách hàng',
      thClass: 'min-w-36 h-2 p-0 font-semibold text-gray-700 sticky left-[128px] bg-white z-20',
      tdClass: 'p-0 h-2 text-center text-gray-700 align-middle sticky left-[128px] z-20 bg-white',
      rowSpan: true,
      render: row => row?.customer_name || '-',
    },
    {
      key: 'reference_no',
      header: 'Mã chứng từ',
      thClass: 'min-w-32 h-2 p-0 font-semibold text-gray-700',
      tdClass: 'p-0 h-2 text-center text-gray-700 align-middle',
      rowSpan: true,
      render: row => (
        <PopupDetailProduct
          dataLang={dataLang}
          className='3xl:text-sm 2xl:text-13 xl:text-xs text-11 font-medium col-span-1 text-center text-[#0F4F9E] hover:text-blue-500 transition-all duration-200 ease-in-out cursor-pointer'
          name={row?.reference_no ? row?.reference_no : ''}
          id={row?.id}
        />
      ),
    },
    {
      key: 'branch_name',
      header: 'Chi nhánh',
      thClass: 'min-w-32 h-2 p-0 font-semibold text-gray-700',
      tdClass: 'p-0 h-2 text-center text-gray-700 align-middle bg-white',
      rowSpan: true,
      render: row => row?.branch_name || '-',
    },
    {
      key: 'employee_name',
      header: 'Nhân viên',
      thClass: 'min-w-32 h-2 p-0 font-semibold text-gray-700',
      tdClass: 'p-0 h-2 text-center text-gray-700 align-middle bg-white',
      rowSpan: true,
      render: row => row?.employee_name || '-',
    },
    {
      key: 'delivery_date',
      header: 'Ngày giao hàng',
      thClass: 'min-w-40 h-2 p-0 font-semibold text-gray-700',
      tdClass: 'p-0 h-2 text-center text-gray-700',
      rowSpan: false,
      render: row => (row.item?.delivery_date ? moment(row.item.delivery_date).format('DD/MM/YYYY') : '-'),
    },
    {
      key: 'item_code',
      header: 'Mã hàng',
      thClass: 'min-w-32 h-2 p-0 font-semibold text-gray-700',
      tdClass: 'p-0 h-2 text-left text-gray-700',
      rowSpan: false,
      render: row => row.item?.item_code || '-',
    },
    {
      key: 'item_name',
      header: 'Tên hàng',
      thClass: 'min-w-32 h-2 p-0 font-semibold text-gray-700',
      tdClass: 'p-0 h-2 text-left text-gray-700',
      rowSpan: false,
      render: row => row.item?.item_name || '-',
    },
    {
      key: 'variant_name',
      header: 'Biến thể',
      thClass: 'min-w-32 h-2 p-0 font-semibold text-gray-700',
      tdClass: 'p-0 h-2 text-left text-gray-700',
      rowSpan: false,
      render: row => row.item?.variant_name || '-',
    },
    {
      key: 'unit_name',
      header: 'ĐVT',
      thClass: 'min-w-32 h-2 p-0 font-semibold text-gray-700',
      tdClass: 'p-0 h-2 text-center text-gray-700',
      rowSpan: false,
      render: row => row.item?.unit_name || '-',
    },
  ];

  return (
    <ReportLayout
      title='Báo cáo nhập hàng'
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
        ) : dataSalesRevenue?.aaData?.length > 0 ? (
          <Customscrollbar alwaysShowScrollbar={true} className='h-full flex-1 overflow-auto'>
            <table className='w-full border-0 p-0 m-0'>
              <thead>
                <tr className='responsive-text-sm sticky top-0 z-50 bg-white capitalize'>
                  {columns.map((col, index) => (
                    <th key={col.key} className={col.thClass}>
                      <div className={`w-full h-full flex items-center justify-center px-3 py-2 border-y border-r border-[#E0E0E1] ${index === 0 ? 'border-l' : ''}`}>{col.header}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {flattenedRows.map(row => (
                  <tr key={`${row.orderIndex}-${row.itemIndex}`} className='hover:bg-gray-50 responsive-text-sm relative'>
                    {columns.map((col, index) => {
                      if (col.rowSpan) {
                        if (!row.isFirstItem) return null;
                        return (
                          <td key={col.key} rowSpan={row.totalItems} className={col.tdClass}>
                            <div
                              className={`w-full h-full flex items-center px-3 py-2 border-r border-[#E0E0E1] 
                                ${col.tdClass?.includes('text-center') ? 'justify-center' : ''} 
                                ${index === 0 ? 'border-l' : ''} 
                                ${
                                  index === columns.length - 1 ||
                                  (row.globalIndex + row.totalItems - 1) === (flattenedRows.length - 1)
                                    ? ''
                                    : 'border-b'
                                }`}
                            >
                              {col.render(row)}
                            </div>
                          </td>
                        );
                      }
                      return (
                        <td key={col.key} className={col.tdClass}>
                          <div className={`w-full h-full flex items-center ${col.tdClass?.includes('text-center') ? 'justify-center' : ''} px-3 py-2 border-r ${row.globalIndex === (flattenedRows.length - 1) ? '' : 'border-b'} border-[#E0E0E1]`}>
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
                  {columns.map((col, idx) => (
                    <td key={col.key} className={`${col.tdClass} font-semibold text-gray-700`}>
                      <div className={`w-full h-full ${idx === 1 ? 'flex items-center justify-center px-3 py-2 uppercase' : ''} border-t border-[#E0E0E1]`}>{idx === 1 ? 'Tổng cộng' : ''}</div>
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </Customscrollbar>
        ) : (
          <NoData type='report' classNameImage='w-[245px]' />
        )
      }
      totalSection={
        dataSalesRevenue?.aaData?.length > 0 && <Pagination postsPerPage={limit} totalPosts={Number(dataSalesRevenue?.iTotalDisplayRecords) || 0} paginate={paginate} currentPage={currentPage} />
      }
      paginationSection={<DropdowLimit sLimit={handleLimitChange} limit={limit} dataLang={dataLang} />}
    />
  );
};

export default ImportGoods;
