import OnResetData from '@/components/UI/btnResetData/btnReset';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import DateToDateReport from '@/components/UI/filterComponents/dateTodateReport';
import SearchComponent from '@/components/UI/filterComponents/searchComponent';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import SelectSearchReport from '@/components/common/select/SelectSearchReport';
import ExcelIcon from '@/components/icons/common/Excel';
import ReportLayout from '@/components/layout/ReportLayout';
import { useLanguageContext } from '@/context/ui/LanguageContext';
import { useCostComboboxByBranch } from '@/hooks/common/useOther';
import { usePersistedBranches } from '@/hooks/common/usePersistedBranches';
import useStatusExprired from '@/hooks/useStatusExprired';
import formatNumber from '@/utils/helpers/formatnumber';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { PiPackage } from 'react-icons/pi';
import { useDebounce } from 'use-debounce';
import ExpenseDetailPopup from './ExpenseDetailPopup';
import { useGetExpense } from './hook';
import { exportExpense } from './hook/useExportExcel';

const breadcrumbItems = [{ label: 'Báo cáo' }, { label: 'Tồn quỹ' }, { label: 'Báo cáo chi phí' }];

// Các hằng số hỗ trợ tính toán vị trí vẽ line/tree
const STT_COLUMN_WIDTH = 73; // px - w-24 (24 * 4)
const INDENT_WIDTH_PER_LEVEL = 48; // px - mỗi level thụt vào 48px
const CONNECTOR_OFFSET = 0; // px - offset để căn đường nối/đường cong

const Expense = () => {
  const router = useRouter();
  // const { paginate } = usePagination();
  const dataLang = useLanguageContext();
  const statusExprired = useStatusExprired();
  const currentPage = Number(router.query.page) || 1;

  const [limit, setLimit] = useState(15);
  const [selectedCost, setSelectedCost] = useState(null);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue] = useDebounce(searchValue, 500);
  const [dateRange, setDateRange] = useState({
    startDate: undefined,
    endDate: undefined,
  });

  const { selectedBranches, setSelectedBranches } = usePersistedBranches('report_branch_ids');
  const { data: costOptions = [], refetch: refetchCostOptions } = useCostComboboxByBranch({ 'filter[branch_id]': selectedBranches?.length > 0 ? selectedBranches : null });
  const {
    data: expenseData,
    isFetching: isFetchingExpense,
    refetch: refetchExpense,
  } = useGetExpense({
    page: currentPage,
    limit: limit,
    search: debouncedSearchValue,
    filter: {
      branch_ids: selectedBranches?.length > 0 ? selectedBranches : null,
      cost_id: selectedCost ? selectedCost : undefined,
      ...(dateRange?.startDate !== undefined && { start_date: dateRange.startDate }),
      ...(dateRange?.endDate !== undefined && { end_date: dateRange.endDate }),
    },
  });

  const handleRefetch = () => {
    refetchCostOptions();
    refetchExpense();
  };

  const handleDateChange = newValue => {
    setDateRange(newValue);
  };

  const handleCostChange = value => {
    setSelectedCost(value || null);
  };

  const handleSearch = value => {
    const searchValue = value?.target?.value || (typeof value === 'string' ? value : '');
    setSearchValue(searchValue);
  };

  const handleExportExcel = () => {
    exportExpense(dataSource || [], expenseData || {}, 'Bao_cao_chi_phi.xlsx');
  };

  const dataSource = expenseData?.data || [];

  const formattedCostOptions = useMemo(() => {
    return (costOptions || []).map(option => {
      const prefix = option?.level && option.level > 0 ? `${'-'.repeat(option.level)} ` : '';
      return {
        ...option,
        label: `${prefix}${option.label}`,
      };
    });
  }, [costOptions]);

  // Render row cho item (thụt đều theo level và giữ đường cong)
  const renderRow = (item, isLevel0 = false) => {
    const { level = 0, displayIndex, code, name, total } = item;
    const depth = level || 0;
    const numericTotal = Number(total ?? 0);
    const displayTotal = numericTotal === 0 ? '-' : formatNumber(total);

    return (
      <div key={item.id} className='w-full flex items-center responsive-text-sm border-x border-[#E0E0E1] relative'>
        <div className={`w-24 px-3 py-2 text-center font-medium text-gray-700 border-r border-[#E0E0E1] min-h-9 2xl:h-[41px] ${!isLevel0 ? 'h-9 2xl:h-[41px]' : ''}`}>{displayIndex || ''}</div>

        {depth > 0 && (
          <div className='px-3 py-2 font-medium text-gray-700 relative pl-4' style={{ width: INDENT_WIDTH_PER_LEVEL * depth }}>
            {/* Đường cong từ parent sang con */}
            <div className='absolute right-[-8px] top-[-6px] -translate-y-1/2 w-8 h-6 border-l-2 border-b-2 border-gray-100 rounded-bl-xl' />
          </div>
        )}

        <div className={`w-60 flex-1 px-3 py-2 text-gray-700 ${isLevel0 ? 'font-semibold' : 'font-normal'}`}>
          {code} - {name}
        </div>

        <div className='w-40 px-3 py-2 text-right font-medium text-blue-fmrp border-l border-[#E0E0E1] min-h-9 2xl:h-[41px]'>
          {numericTotal > 0 ? (
            <ExpenseDetailPopup item={item} dateRange={dateRange}>
              {displayTotal}
            </ExpenseDetailPopup>
          ) : (
            displayTotal
          )}
        </div>
      </div>
    );
  };

  // Render tree đệ quy, mỗi cấp con được bọc 1 div relative để vẽ đường thẳng dài
  const renderTree = (nodes, level = 0) => {
    if (!nodes || nodes.length === 0) return null;

    // Chỉ vẽ line dọc cho level > 0 và khi có từ 2 phần tử trở lên
    const shouldDrawVerticalLine = level > 0 && nodes.length > 1;

    // Tính vị trí ngang (left) của line theo level
    const leftPosition = STT_COLUMN_WIDTH + INDENT_WIDTH_PER_LEVEL * level + CONNECTOR_OFFSET;

    return (
      <div className='relative'>
        {shouldDrawVerticalLine && <div className='absolute top-0 bottom-10 border-l-2 border-gray-100' style={{ left: `${leftPosition}px` }} />}

        {nodes.map((node, idx) => {
          const isRootLevel = level === 0;
          const displayIndex = isRootLevel ? idx + 1 : null;
          const isLastRootNode = isRootLevel && idx === nodes.length - 1;

          return (
            <div key={node.id} className={isRootLevel && !isLastRootNode ? 'border-b border-[#E0E0E1]' : ''}>
              {renderRow(
                {
                  ...node,
                  level,
                  displayIndex,
                },
                isRootLevel
              )}

              {node.children && node.children.length > 0 && renderTree(node.children, level + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <ReportLayout
      title='Báo cáo chi phí'
      statusExprired={statusExprired}
      breadcrumbItems={breadcrumbItems}
      branchValue={selectedBranches}
      onBranchChange={setSelectedBranches}
      onBranchClear={() => setSelectedBranches([])}
      maginBottom={true}
      filterSection={
        <div className='w-full items-center flex justify-between gap-4'>
          <div className='grid grid-cols-2 gap-3'>
            <DateToDateReport placeholder='Từ ngày đến ngày' value={dateRange} onChange={handleDateChange} className='w-full' />
            <SelectSearchReport
              placeholder='Chi phí'
              onChange={handleCostChange}
              onClear={() => setSelectedCost(null)}
              icon={<PiPackage color='#9295A4' className='size-4' />}
              className='w-full'
              options={formattedCostOptions || []}
              showCode={false}
              value={selectedCost}
            />
          </div>
          <div className='flex justify-end gap-3 items-center w-auto flex-shrink-0'>
            {/* <SearchComponent dataLang={dataLang} placeholder='Tìm kiếm...' onChange={handleSearch} value={searchValue} classNameBox='!py-2 2xl:!p-2.5' /> */}
            <OnResetData sOnFetching={handleRefetch} className='!py-3' />
            <button onClick={handleExportExcel} className='!py-3 3xl:py-3 3xl:px-4 px-3 flex items-center space-x-2 bg-white hover:bg-primary-07 rounded-lg border border-blue-fmrp transition'>
              <ExcelIcon className='3xl:size-5 size-4 text-blue-fmrp' />
              <span className='text-blue-fmrp responsive-text-sm font-medium whitespace-nowrap'>{dataLang?.client_list_exportexcel}</span>
            </button>
          </div>
        </div>
      }
      tableSection={
        isFetchingExpense ? (
          <Loading color='#0f4f9e' />
        ) : dataSource?.length > 0 ? (
          <Customscrollbar alwaysShowScrollbar={true} className='h-full flex-1 overflow-auto border-t border-[#E0E0E1]'>
            <div className='w-full h-full relative'>
              <div className='sticky top-0 z-50 bg-white responsive-text-sm capitalize border-x border-b border-[#E0E0E1]'>
                <div className='flex items-center'>
                  <div className='w-24 px-3 py-2 text-center font-semibold text-gray-700 border-r border-[#E0E0E1]'>STT</div>
                  <div className='w-60 flex-1 px-3 py-2 font-semibold text-gray-700'>Tên khoản chi phí</div>
                  <div className='w-40 px-3 py-2 text-right font-semibold text-gray-700 border-l border-[#E0E0E1]'>Chi phí</div>
                </div>
              </div>
              <div>{renderTree(dataSource, 0)}</div>
              {expenseData?.grand_total !== undefined && (
                <div className='sticky bottom-0 border border-[#E0E0E1]'>
                  <div className='w-full flex items-center responsive-text-sm bg-[#F8FAFF]'>
                    <div className='w-24 h-8 2xl:h-9 px-3 py-2 text-center font-semibold text-gray-700 border-r border-[#E0E0E1]'></div>
                    <div className='w-60 flex-1 px-3 py-2 font-semibold text-gray-700 uppercase'>Tổng cộng</div>
                    <div className='w-40 px-3 py-2 text-right font-semibold text-blue-fmrp border-l border-[#E0E0E1]'>{formatNumber(Number(expenseData?.grand_total || 0))}</div>
                  </div>
                </div>
              )}
            </div>
          </Customscrollbar>
        ) : (
          <NoData type='report' classNameImage='w-[245px]' />
        )
      }
      // totalSection={dataSource?.length > 0 && <Pagination postsPerPage={limit} totalPosts={Number(expenseData?.recordsTotal) || 0} paginate={paginate} currentPage={currentPage} />}
      // paginationSection={<DropdowLimit sLimit={handleLimitChange} limit={limit} dataLang={dataLang} />}
    />
  );
};

export default Expense;
