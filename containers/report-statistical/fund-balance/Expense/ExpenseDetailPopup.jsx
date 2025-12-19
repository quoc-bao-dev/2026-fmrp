import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import DropdowLimit from '@/components/UI/dropdowLimit/dropdowLimit';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import Pagination from '@/components/UI/pagination';
import PopupCustom from '@/components/UI/popup';
import ExcelIcon from '@/components/icons/common/Excel';
import { useLanguageContext } from '@/context/ui/LanguageContext';
import { usePersistedBranches } from '@/hooks/common/usePersistedBranches';
import formatNumber from '@/utils/helpers/formatnumber';
import moment from 'moment';
import { useState } from 'react';
import { useGetExpenseDetail } from './hook';
import { exportExpenseDetailExcel } from './hook/useExportExcel';

const ExpenseDetailPopup = ({ item, children, dateRange }) => {
  const [open, setOpen] = useState(false);
  const [limit, setLimit] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const dataLang = useLanguageContext();

  if (!item) return null;
  const { selectedBranches } = usePersistedBranches('report_branch_ids');

  const { data: expenseDetailData, isLoading: isLoadingExpenseDetail } = useGetExpenseDetail(
    {
      page: currentPage,
      limit: limit,
      cost_id: item?.id,
      filter: {
        branch_ids: selectedBranches?.length > 0 ? selectedBranches : null,
        ...(dateRange?.startDate !== undefined && { start_date: dateRange.startDate }),
        ...(dateRange?.endDate !== undefined && { end_date: dateRange.endDate }),
      },
    },
    open
  );

  const handleToggle = value => setOpen(value);

  const grandTotal = Array.isArray(expenseDetailData?.data) ? expenseDetailData.data.reduce((sum, row) => sum + (+row?.total || 0), 0) : 0;

  const handleLimitChange = newLimit => {
    setLimit(newLimit);
    setCurrentPage(1);
  };

  const handlePaginate = page => {
    setCurrentPage(page);
  };

  const handleExportExcel = () => {
    if (!Array.isArray(expenseDetailData?.data) || expenseDetailData.data.length === 0) return;
    exportExpenseDetailExcel(expenseDetailData.data, 'chi_tiet_chi_phi.xlsx');
  };

  return (
    <PopupCustom
      title={
        <div>
          Thông tin chi tiết chi phí
          <span className='text-blue-fmrp'>{` (${item?.code || ''}${item?.name ? ` - ${item.name}` : ''})`}</span>
        </div>
      }
      button={<span className='block w-fit text-left truncate hover:text-blue-fmrp'>{children}</span>}
      onClickOpen={handleToggle.bind(null, true)}
      open={open}
      onClose={handleToggle.bind(null, false)}
      classNameBtn='w-fit h-full text-left'
    >
      <div className='mt-4 w-[900px] max-w-[95vw]'>
        <div className='flex items-center justify-end mb-3'>
          <button type='button' onClick={handleExportExcel} className='px-3 py-2 flex items-center space-x-2 bg-white hover:bg-primary-07 rounded-lg border border-blue-fmrp transition'>
            <ExcelIcon className='size-4 text-blue-fmrp' />
            <span className='text-blue-fmrp responsive-text-sm font-medium whitespace-nowrap'>{dataLang?.client_list_exportexcel || 'Xuất Excel'}</span>
          </button>
        </div>
        {/* Header bảng */}
        <div className='grid grid-cols-[60px,160px,160px,200px,1fr] bg-[#F8FAFF] border border-[#E0E0E1] rounded-t-lg text-xs 2xl:text-sm font-semibold text-gray-700'>
          <div className='px-3 py-2 text-center align-middle border-r border-[#E0E0E1]'>STT</div>
          <div className='px-3 py-2 border-r border-[#E0E0E1]'>Ngày chứng từ</div>
          <div className='px-3 py-2 border-r border-[#E0E0E1] align-middle'>Danh sách chứng từ</div>
          <div className='px-3 py-2 border-r border-[#E0E0E1] text-right align-middle'>Giá trị</div>
          <div className='px-3 py-2 align-middle'>Nội dung</div>
        </div>

        {/* Nội dung bảng */}
        <div className='border border-t-0 border-[#E0E0E1] rounded-b-lg max-h-[420px] overflow-auto'>
          <Customscrollbar alwaysShowScrollbar={true} className='h-full flex-1 relative'>
            {isLoadingExpenseDetail ? (
              <Loading color='#0f4f9e' />
            ) : expenseDetailData?.data?.length > 0 ? (
              <div className='relative'>
                {expenseDetailData?.data?.map((row, index) => (
                  <div
                    key={row?.id ? row.id.toString() : `${index}`}
                    className='grid grid-cols-[60px,160px,160px,200px,1fr] text-xs 2xl:text-sm text-gray-700 border-b last:border-b-0 border-[#E0E0E1]'
                  >
                    <div className='px-3 py-2 text-center border-r border-[#E0E0E1]'>{index + 1}</div>
                    <div className='px-3 py-2 border-r border-[#E0E0E1]'>{row?.date ? moment(row.date).format('DD/MM/YYYY HH:mm:ss') : '—'}</div>
                    <div className='px-3 py-2 border-r border-[#E0E0E1] break-words'>{row?.code || '—'}</div>
                    <div className='px-3 py-2 border-r border-[#E0E0E1] text-right font-semibold text-blue-fmrp'>{formatNumber(+row?.total || 0)}</div>
                    <div className='px-3 py-2 border-[#E0E0E1] break-words'>{row?.note || '—'}</div>
                  </div>
                ))}
              </div>
            ) : (
              <NoData type='report' titleText='Không có dữ liệu' classNameImage='w-[245px]' />
            )}
          </Customscrollbar>
          <div className='sticky bottom-0 left-0 grid grid-cols-[60px,160px,160px,200px,1fr] text-xs 2xl:text-sm font-semibold bg-[#F8FAFF] text-gray-700 border-t border-[#E0E0E1]'>
            <div className='px-3 py-2 text-center border-r border-[#E0E0E1]'></div>
            <div className='px-3 py-2 border-r border-[#E0E0E1] col-span-2 uppercase'>Tổng cộng</div>
            <div className='px-3 py-2 border-r border-[#E0E0E1] text-right text-blue-fmrp'>{formatNumber(grandTotal)}</div>
            <div className='px-3 py-2'></div>
          </div>
        </div>
        <div className='flex items-center justify-between mt-4 gap-4'>
          <Pagination postsPerPage={limit} totalPosts={expenseDetailData?.recordsTotal} paginate={handlePaginate} currentPage={currentPage} />
          <DropdowLimit sLimit={handleLimitChange} limit={limit} dataLang={dataLang} />
        </div>
      </div>
    </PopupCustom>
  );
};

export default ExpenseDetailPopup;
