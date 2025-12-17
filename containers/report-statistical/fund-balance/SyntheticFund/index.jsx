import OnResetData from '@/components/UI/btnResetData/btnReset';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import DropdowLimit from '@/components/UI/dropdowLimit/dropdowLimit';
import DateToDateReport from '@/components/UI/filterComponents/dateTodateReport';
import SearchComponent from '@/components/UI/filterComponents/searchComponent';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import Pagination from '@/components/UI/pagination';
import ExcelIcon from '@/components/icons/common/Excel';
import ReportLayout from '@/components/layout/ReportLayout';
import { useLanguageContext } from '@/context/ui/LanguageContext';
import { usePersistedBranches } from '@/hooks/common/usePersistedBranches';
import usePagination from '@/hooks/usePagination';
import useStatusExprired from '@/hooks/useStatusExprired';
import formatNumber from '@/utils/helpers/formatnumber';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useGetSyntheticFund } from './hook';
import { exportSyntheticFund } from './hook/useExportExcel';

const breadcrumbItems = [{ label: 'Báo cáo' }, { label: 'Tồn quỹ' }, { label: 'Tổng hợp tồn quỹ' }];

const SyntheticFund = () => {
  const router = useRouter();
  const { paginate } = usePagination();
  const dataLang = useLanguageContext();
  const statusExprired = useStatusExprired();
  const currentPage = Number(router.query.page) || 1;

  const [limit, setLimit] = useState(15);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue] = useDebounce(searchValue, 500);
  const [dateRange, setDateRange] = useState({
    startDate: undefined,
    endDate: undefined,
  });

  const { selectedBranches, setSelectedBranches } = usePersistedBranches('report_branch_ids');

  const {
    data: syntheticFundData,
    isFetching: isFetchingSyntheticFund,
    refetch: refetchSyntheticFund,
  } = useGetSyntheticFund({
    page: currentPage,
    limit: limit,
    search: debouncedSearchValue,
    filter: {
      // product_id: selectedItem ? selectedItem : undefined,
      // id_suppliers: selectedSupplier ? selectedSupplier : undefined,
      branch_ids: selectedBranches?.length > 0 ? selectedBranches : null,
      ...(dateRange?.startDate !== undefined && { start_date: dateRange.startDate }),
      ...(dateRange?.endDate !== undefined && { end_date: dateRange.endDate }),
    },
  });

  const handleDateChange = newValue => {
    setDateRange(newValue);
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
    exportSyntheticFund(syntheticFundData?.data || [], syntheticFundData?.rTotal || {}, 'Tong_hop_ton_quy.xlsx');
  };

  // Khai báo cột: dùng chung cho thead/tbody/tfoot
  // Cấu trúc cột hỗ trợ header 2 cấp (parent có children)
  const columns = [
    {
      key: 'stt',
      header: 'STT',
      thClass: 'min-w-20 h-2 p-0 text-center font-semibold text-gray-700 sticky left-0 bg-white z-20',
      tdClass: 'p-0 h-2 text-center text-neutral-07 align-middle sticky left-0 z-20 bg-white',
      rowSpan: 2,
      render: (_row, idx) => idx + 1,
      footer: (_rTotal, idx) => (idx === 1 ? 'Tổng cộng' : ''),
    },
    {
      key: 'name',
      header: 'Tên tài khoản',
      thClass: 'min-w-60 h-2 p-0 text-center font-semibold text-gray-700 sticky left-20 bg-white z-20',
      tdClass: 'p-0 h-2 text-neutral-07 align-middle sticky left-20 z-20 bg-white',
      rowSpan: 2,
      render: row => row?.name || '-',
    },
    {
      key: 'opening_balance',
      header: 'Số dư đầu kỳ',
      thClass: 'min-w-56 h-2 p-0 text-center font-semibold text-gray-700',
      children: [
        {
          key: 'opening_total_receipt',
          header: 'Thu',
          thClass: 'min-w-28 h-2 p-0 text-center font-semibold text-gray-700',
          tdClass: 'p-0 h-2 text-center text-neutral-07',
          render: row => {
            const value = Number(row?.opening_total);
            return value > 0 ? formatNumber(value) : '-';
          },
          footer: rTotal => {
            const value = Number(rTotal?.opening_total || 0);
            return value > 0 ? formatNumber(value) : '-';
          },
        },
        {
          key: 'opening_total_payment',
          header: 'Chi',
          thClass: 'min-w-28 h-2 p-0 text-center font-semibold text-gray-700',
          tdClass: 'p-0 h-2 text-center text-neutral-07',
          render: row => {
            const value = Number(row?.opening_total);
            return value < 0 ? formatNumber(Math.abs(value)) : '-';
          },
          // footer: rTotal => {
          //   const value = Number(rTotal?.opening_total || 0);
          //   return value < 0 ? formatNumber(Math.abs(value)) : '-';
          // },
        },
      ],
    },
    {
      key: 'phat_sinh',
      header: 'Phát sinh',
      thClass: 'min-w-56 h-2 p-0 text-center font-semibold text-gray-700',
      children: [
        {
          key: 'coupons_period',
          header: 'Thu',
          thClass: 'min-w-28 h-2 p-0 text-center font-semibold text-gray-700',
          tdClass: 'p-0 h-2 text-center text-neutral-07',
          render: row => (Number(row?.payslips_opening) !== 0 ? formatNumber(Number(row?.payslips_opening)) : '-'),
          footer: rTotal => (Number(rTotal?.payslips_opening) !== 0 ? formatNumber(Number(rTotal?.payslips_opening) || 0) : '-'),
        },
        {
          key: 'payslips_period',
          header: 'Chi',
          thClass: 'min-w-28 h-2 p-0 text-center font-semibold text-gray-700',
          tdClass: 'p-0 h-2 text-center text-neutral-07',
          render: row => (Number(row?.payslips_period) !== 0 ? formatNumber(Number(row?.payslips_period)) : '-'),
        },
      ],
    },
    {
      key: 'closing_balance',
      header: 'Số dư cuối kỳ',
      thClass: 'min-w-56 h-2 p-0 text-center font-semibold text-gray-700',
      children: [
        {
          key: 'closing_total_receipt',
          header: 'Thu',
          thClass: 'min-w-28 h-2 p-0 text-center font-semibold text-gray-700',
          tdClass: 'p-0 h-2 text-center text-blue-fmrp',
          render: row => {
            const value = Number(row?.closing_total);
            return value > 0 ? formatNumber(value) : '-';
          },
          footer: rTotal => {
            const value = Number(rTotal?.closing_total || 0);
            return value > 0 ? formatNumber(value) : '-';
          },
        },
        {
          key: 'closing_total_payment',
          header: 'Chi',
          thClass: 'min-w-28 h-2 p-0 text-center font-semibold text-gray-700',
          tdClass: 'p-0 h-2 text-center text-blue-fmrp',
          render: row => {
            const value = Number(row?.closing_total);
            return value < 0 ? formatNumber(Math.abs(value)) : '-';
          },
          // footer: rTotal => {
          //   const value = Number(rTotal?.closing_total || 0);
          //   return value < 0 ? formatNumber(Math.abs(value)) : '-';
          // },
        },
      ],
    },
  ];

  const leafColumns = columns.flatMap(col => (col.children ? col.children : [col]));

  return (
    <ReportLayout
      title='Tổng hợp tồn quỹ'
      statusExprired={statusExprired}
      breadcrumbItems={breadcrumbItems}
      branchValue={selectedBranches}
      onBranchChange={setSelectedBranches}
      onBranchClear={() => setSelectedBranches([])}
      filterSection={
        <div className='w-full items-center flex justify-between gap-4'>
          <div className='grid grid-cols-1 gap-3'>
            <DateToDateReport placeholder='Từ ngày đến ngày' value={dateRange} onChange={handleDateChange} className='w-full' />
          </div>
          <div className='flex justify-end gap-3 items-center w-auto flex-shrink-0'>
            <SearchComponent dataLang={dataLang} placeholder='Tìm kiếm theo phiếu' onChange={handleSearch} value={searchValue} classNameBox='!py-2 2xl:!p-2.5' />
            <OnResetData sOnFetching={refetchSyntheticFund} className='!py-3' />
            <button onClick={handleExportExcel} className='!py-3 3xl:py-3 3xl:px-4 px-3 flex items-center space-x-2 bg-white hover:bg-primary-07 rounded-lg border border-blue-fmrp transition'>
              <ExcelIcon className='3xl:size-5 size-4 text-blue-fmrp' />
              <span className='text-blue-fmrp responsive-text-sm font-medium whitespace-nowrap'>{dataLang?.client_list_exportexcel}</span>
            </button>
          </div>
        </div>
      }
      tableSection={
        isFetchingSyntheticFund ? (
          <Loading color='#0f4f9e' />
        ) : syntheticFundData?.data?.length > 0 ? (
          <Customscrollbar alwaysShowScrollbar={true} className='h-full flex-1 overflow-auto'>
            <table className='w-full border-0 p-0 m-0'>
              <thead>
                <tr className='responsive-text-sm sticky top-0 z-50 bg-white capitalize'>
                  {columns.map((col, index) => (
                    <th key={col.key} colSpan={col.children ? col.children.length : 1} rowSpan={col.children ? 1 : 2} className={col.thClass}>
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
                <tr className='responsive-text-sm sticky top-[34px] 2xl:top-[36px] z-40 bg-white capitalize'>
                  {columns
                    .filter(col => col.children)
                    .flatMap(col => col.children)
                    .map((col, index) => (
                      <th key={col.key} className={col.thClass}>
                        <div
                          className={`w-full h-full flex ${
                            col.thClass?.includes('text-center') ? 'items-center justify-center' : 'justify-start items-center'
                          }  px-3 py-2 border-b border-r border-[#E0E0E1]`}
                        >
                          {col.header}
                        </div>
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {syntheticFundData?.data?.map((row, rowIndex) => (
                  <tr key={`${row.id || 'row'}-${row.purchase_order_item_id || rowIndex}`} className='hover:bg-gray-50 responsive-text-sm relative'>
                    {leafColumns.map((col, index) => (
                      <td key={col.key} className={col.tdClass}>
                        <div
                          className={`w-full h-full flex items-center ${col.tdClass?.includes('text-center') ? 'justify-center' : ''} px-3 py-2 border-r ${
                            rowIndex === (syntheticFundData?.data?.length || 0) - 1 ? '' : 'border-b'
                          }
                            ${index === 0 ? 'border-l' : ''}
                            border-[#E0E0E1]`}
                        >
                          {col.render ? col.render(row, rowIndex) : '-'}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className='bg-white sticky bottom-[-1px] z-50 responsive-text-sm'>
                  {leafColumns.map((col, idx) => {
                    const content = typeof col.footer === 'function' ? col.footer(syntheticFundData?.rTotal || {}, idx) : col.key === 'code_purchase_order' ? 'Tổng cộng' : '';

                    return (
                      <td key={col.key} className={`${col.tdClass} font-semibold text-gray-700`}>
                        <div className={`w-full h-full flex items-center justify-center px-3 py-2 uppercase border-t border-[#E0E0E1]`}>{content}</div>
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
      totalSection={syntheticFundData?.data?.length > 0 && <Pagination postsPerPage={limit} totalPosts={Number(syntheticFundData?.recordsTotal) || 0} paginate={paginate} currentPage={currentPage} />}
      paginationSection={<DropdowLimit sLimit={handleLimitChange} limit={limit} dataLang={dataLang} />}
    />
  );
};

export default SyntheticFund;
