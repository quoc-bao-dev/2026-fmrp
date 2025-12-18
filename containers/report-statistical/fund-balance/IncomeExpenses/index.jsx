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
import PopupDetailThere from '@/containers/accountant/components/detailThere';
import PopupPaymentDetail from '@/containers/accountant/payment/components/detail';
import PopupReceiptsDetail from '@/containers/accountant/receipts/components/detail';
import { useLanguageContext } from '@/context/ui/LanguageContext';
import { useObjectCombobox, useObjectList } from '@/hooks/common/useObject';
import { usePayment } from '@/hooks/common/usePayment';
import { usePersistedBranches } from '@/hooks/common/usePersistedBranches';
import usePagination from '@/hooks/usePagination';
import useStatusExprired from '@/hooks/useStatusExprired';
import formatNumber from '@/utils/helpers/formatnumber';
import moment from 'moment';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { PiPackage } from 'react-icons/pi';
import { useDebounce } from 'use-debounce';
import { useGetDiaryOfRevenueAndExpenditure } from './hook';
import { exportIncomeExpenses } from './hook/useExportExcel';

const breadcrumbItems = [{ label: 'Báo cáo' }, { label: 'Tồn quỹ' }, { label: 'Nhật ký thu - chi' }];

const IncomeExpenses = () => {
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
  const [selectedObjectType, setSelectedObjectType] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue] = useDebounce(searchValue, 500);

  const { selectedBranches, setSelectedBranches } = usePersistedBranches('report_branch_ids');
  const { data: objectCombobox = [] } = useObjectCombobox(dataLang);

  const { data: objectList = [] } = useObjectList(dataLang, selectedBranches, selectedObjectType ? { value: selectedObjectType } : null);
  const { data: paymentModes = [] } = usePayment();

  const {
    data: diaryData,
    isFetching: isFetchingDiary,
    refetch: refetchDiary,
  } = useGetDiaryOfRevenueAndExpenditure({
    page: currentPage,
    limit: limit,
    search: debouncedSearchValue,
    ...(selectedObjectType ? { ch_objects_idd: selectedObjectType } : {}),
    ...(selectedObject ? { objects_ids_ch: selectedObject } : {}),
    ...(selectedPaymentMode ? { id_account_thuchi: selectedPaymentMode } : {}),
    filter: {
      branch_ids: selectedBranches?.length > 0 ? selectedBranches : null,
      ...(dateRange?.startDate !== undefined && { start_date: dateRange.startDate }),
      ...(dateRange?.endDate !== undefined && { end_date: dateRange.endDate }),
    },
  });

  const handleDateChange = newValue => {
    setDateRange(newValue);
  };

  const handleObjectTypeChange = value => {
    setSelectedObjectType(value || null);
    setSelectedObject(null);
  };

  const handleObjectChange = value => {
    setSelectedObject(value || null);
  };

  const handlePaymentModeChange = value => {
    setSelectedPaymentMode(value || null);
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
    exportIncomeExpenses(diaryData?.data || [], diaryData?.rTotal || {}, 'Nhat_ky_thu_chi.xlsx', dataLang);
  };

  // Hàm parse số tổng cộng (rTotal trả về dạng string có dấu phẩy)
  const parseTotalNumber = value => {
    if (value === null || value === undefined) return 0;
    const raw = String(value).replace(/,/g, '');
    const num = Number(raw);
    return Number.isNaN(num) ? 0 : num;
  };

  // Khai báo cột: dùng chung cho thead/tbody/tfoot
  const columns = [
    {
      key: 'stt',
      header: 'STT',
      thClass: 'min-w-20 h-2 p-0 text-center font-semibold text-gray-700 sticky left-0 bg-white z-20',
      tdClass: 'p-0 h-2 text-center text-gray-700 align-middle sticky left-0 z-20 bg-white',
      rowSpan: false,
      render: (_row, idx) => idx + 1,
      footer: (_rTotal, idx) => (idx === 1 ? 'Tổng cộng' : ''),
    },
    {
      key: 'date',
      header: 'Ngày',
      thClass: 'min-w-32 h-2 p-0 text-center font-semibold text-gray-700 sticky left-20 bg-white z-20',
      tdClass: 'p-0 h-2 text-center text-gray-700 align-middle sticky left-20 z-20 bg-white',
      rowSpan: false,
      render: row => (row?.date ? moment(row.date).format('DD/MM/YYYY HH:mm:ss') : '-'),
      footer: (_rTotal, idx) => (idx === 1 ? 'Tổng cộng' : ''),
    },
    {
      key: 'code',
      header: 'Số chứng từ',
      thClass: 'min-w-36 h-2 p-0 text-center font-semibold text-gray-700 sticky left-52 bg-white z-20',
      tdClass: 'p-0 h-2 text-center text-gray-700 align-middle sticky left-52 z-20 bg-white',
      rowSpan: false,
      render: row => {
        if (!row?.code) return '-';

        // type: 1 = thu, 2 = chi
        if (row?.type == 1 && row?.idd) {
          return (
            <PopupReceiptsDetail
              id={row.idd}
              dataLang={dataLang}
              className='responsive-text-sm font-medium hover:text-blue-600 transition-all ease-in-out rounded-md text-center text-[#0F4F9E]'
              name={row.code}
            />
          );
        }

        if (row?.type == 2 && row?.idd) {
          return (
            <PopupPaymentDetail
              id={row.idd}
              dataLang={dataLang}
              className='responsive-text-sm font-medium hover:text-blue-600 transition-all ease-in-out rounded-md text-center text-[#0F4F9E]'
              name={row.code}
            />
          );
        }

        return row.code || '-';
      },
    },
    {
      key: 'payment_mode_name',
      header: 'PTTT',
      thClass: 'min-w-24 h-2 p-0 font-semibold text-gray-700',
      tdClass: 'p-0 h-2 text-gray-700 align-middle',
      rowSpan: false,
      render: row => row?.payment_mode_name || '-',
    },
    {
      key: 'objects',
      header: 'Loại đối tượng',
      thClass: 'min-w-40 h-2 p-0 text-center font-semibold text-gray-700',
      tdClass: 'p-0 h-2 text-gray-700 align-middle',
      rowSpan: false,
      render: row => dataLang[row?.objects] || row?.objects || '-',
    },
    {
      key: 'object_code',
      header: 'Mã đối tượng',
      thClass: 'min-w-40 h-2 p-0 text-center font-semibold text-gray-700',
      tdClass: 'p-0 h-2 text-gray-700',
      rowSpan: false,
      render: row => row?.object_code || '-',
    },
    {
      key: 'object_text',
      header: 'Đối tượng',
      thClass: 'min-w-40 h-2 p-0 text-center font-semibold text-gray-700',
      tdClass: 'p-0 h-2 text-gray-700',
      rowSpan: false,
      render: row => row?.object_text || '-',
    },
    {
      key: 'unit_name',
      header: 'Danh sách chứng từ',
      thClass: 'min-w-44 h-2 p-0 text-center font-semibold text-gray-700',
      tdClass: 'p-0 h-2 text-center text-gray-700',
      rowSpan: false,
      render: row => {
        return (
          <div className='flex flex-col gap-1'>
            {row?.voucher && row.voucher.length > 0
              ? row.voucher.map((voucher, index) => (
                  <span key={voucher?.id || index}>
                    <PopupDetailThere
                      dataLang={dataLang}
                      className='responsive-text-sm font-semibold text-center text-[#003DA0] hover:text-blue-600 transition-all ease-linear cursor-pointer'
                      type={voucher?.voucher_type}
                      id={voucher?.id}
                      name={voucher?.code}
                    >
                      {voucher?.code}
                    </PopupDetailThere>
                  </span>
                ))
              : '-'}
          </div>
        );
      },
    },
    {
      key: 'staff_name',
      header: 'Nhân viên',
      thClass: 'min-w-44 h-2 p-0 text-center font-semibold text-gray-700',
      tdClass: 'p-0 h-2 text-center text-gray-700',
      rowSpan: false,
      render: row => row?.staff_name || '-',
    },
    {
      key: 'branch_name',
      header: 'Chi nhánh',
      thClass: 'min-w-44 h-2 p-0 text-center font-semibold text-gray-700',
      tdClass: 'p-0 h-2 text-center text-gray-700',
      rowSpan: false,
      render: row => row?.branch_name || '-',
    },
    {
      key: 'note',
      header: 'Nội dung',
      thClass: 'min-w-36 h-2 p-0 text-center font-semibold text-gray-700',
      tdClass: 'p-0 h-2 text-center text-gray-700',
      rowSpan: false,
      render: row => row?.note || '-',
    },
    {
      key: 'thu',
      header: 'Thu',
      thClass: 'min-w-36 h-2 p-0 text-center font-semibold text-gray-700',
      tdClass: 'p-0 h-2 text-center text-blue-fmrp',
      rowSpan: false,
      render: row => (Number(row?.thu) !== 0 ? formatNumber(Number(row?.thu)) : '-'),
      footer: rTotal => {
        const totalThu = parseTotalNumber(rTotal?.thu);
        return totalThu !== 0 ? formatNumber(totalThu) : '-';
      },
    },
    {
      key: 'chi',
      header: 'Chi',
      thClass: 'min-w-36 h-2 p-0 text-center font-semibold text-gray-700',
      tdClass: 'p-0 h-2 text-center text-blue-fmrp',
      rowSpan: false,
      render: row => (Number(row?.chi) !== 0 ? formatNumber(Number(row?.chi)) : '-'),
      footer: rTotal => {
        const totalChi = parseTotalNumber(rTotal?.chi);
        return totalChi !== 0 ? formatNumber(totalChi) : '-';
      },
    },
  ];

  return (
    <ReportLayout
      title='Nhật ký thu - chi'
      statusExprired={statusExprired}
      breadcrumbItems={breadcrumbItems}
      branchValue={selectedBranches}
      onBranchChange={setSelectedBranches}
      onBranchClear={() => setSelectedBranches([])}
      filterSection={
        <div className='w-full items-center flex justify-between gap-4'>
          <div className='grid grid-cols-4 gap-3'>
            <DateToDateReport placeholder='Từ ngày đến ngày' value={dateRange} onChange={handleDateChange} className='w-full' />
            <SelectSearchReport
              placeholder='Loại đối tượng'
              onChange={handleObjectTypeChange}
              onClear={() => setSelectedObjectType(null)}
              icon={<PiPackage color='#9295A4' className='size-4' />}
              className='w-full'
              options={objectCombobox || []}
              value={selectedObjectType}
            />
            <SelectSearchReport
              placeholder='Danh sách đối tượng'
              onChange={handleObjectChange}
              onClear={() => setSelectedObject(null)}
              icon={<PiPackage color='#9295A4' className='size-4' />}
              className='w-full'
              options={objectList || []}
              value={selectedObject}
            />
            <SelectSearchReport
              placeholder='PTTT'
              onChange={handlePaymentModeChange}
              onClear={() => setSelectedPaymentMode(null)}
              icon={<PiPackage color='#9295A4' className='size-4' />}
              className='w-full'
              options={paymentModes || []}
              value={selectedPaymentMode}
            />
          </div>
          <div className='flex justify-end gap-3 items-center w-auto flex-shrink-0'>
            <SearchComponent dataLang={dataLang} placeholder='Tìm kiếm ...' onChange={handleSearch} value={searchValue} classNameBox='!py-2 2xl:!p-2.5' />
            <OnResetData sOnFetching={refetchDiary} className='!py-3' />
            <button onClick={handleExportExcel} className='!py-3 3xl:py-3 3xl:px-4 px-3 flex items-center space-x-2 bg-white hover:bg-primary-07 rounded-lg border border-blue-fmrp transition'>
              <ExcelIcon className='3xl:size-5 size-4 text-blue-fmrp' />
              <span className='text-blue-fmrp responsive-text-sm font-medium whitespace-nowrap'>{dataLang?.client_list_exportexcel}</span>
            </button>
          </div>
        </div>
      }
      tableSection={
        isFetchingDiary ? (
          <Loading color='#0f4f9e' />
        ) : diaryData?.data?.length > 0 ? (
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
                {diaryData?.data?.map((row, rowIndex) => (
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
                                ${rowIndex === (diaryData?.data?.length || 0) - 1 ? '' : 'border-b'}`}
                            >
                              {col.render(row, rowIndex)}
                            </div>
                          </td>
                        );
                      }
                      return (
                        <td key={col.key} className={col.tdClass}>
                          <div
                            className={`w-full h-full flex items-center ${col.tdClass?.includes('text-center') ? 'justify-center' : ''} px-3 py-2 border-r ${
                              rowIndex === (diaryData?.data?.length || 0) - 1 ? '' : 'border-b'
                            }
                            ${index === 0 ? 'border-l' : ''}
                            border-[#E0E0E1]`}
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
                    const content = typeof col.footer === 'function' ? col.footer(diaryData?.rTotal || {}, idx) : idx === 1 ? 'Tổng cộng' : '';

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
      totalSection={diaryData?.data?.length > 0 && <Pagination postsPerPage={limit} totalPosts={Number(diaryData?.recordsTotal) || 0} paginate={paginate} currentPage={currentPage} />}
      paginationSection={<DropdowLimit sLimit={handleLimitChange} limit={limit} dataLang={dataLang} />}
    />
  );
};

export default IncomeExpenses;
