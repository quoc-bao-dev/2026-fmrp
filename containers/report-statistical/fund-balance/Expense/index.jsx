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
import { useGetItemsWithBranch } from '@/hooks/useComboBoxReport';
import usePagination from '@/hooks/usePagination';
import useStatusExprired from '@/hooks/useStatusExprired';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { PiPackage } from 'react-icons/pi';
import { useDebounce } from 'use-debounce';
import { useGetExpense } from './hook';
import { exportExpense } from './hook/useExportExcel';

const breadcrumbItems = [{ label: 'Báo cáo' }, { label: 'Tồn quỹ' }, { label: 'Báo cáo chi phí' }];

// Mock data
const mockExpenseData = [
  {
    id: 1,
    code: '6422',
    name: 'CHI PHÍ CÔNG TY',
    amount: 397302704,
    children: [
      {
        id: 11,
        code: '64221',
        name: 'Chi phí văn phòng 1',
        amount: 397302704,
        children: [
          {
            id: 111,
            code: '642211',
            name: 'Chi phí văn phòng 11',
            amount: 397302704,
          },
          {
            id: 112,
            code: '642212',
            name: 'Chi phí văn phòng 12',
            amount: 397302704,
          },
          {
            id: 113,
            code: '642213',
            name: 'Chi phí văn phòng 13',
            amount: 397302704,
          },
        ],
      },
      {
        id: 12,
        code: '64222',
        name: 'Chi phí văn phòng 2',
        amount: 397302704,
      },
      {
        id: 13,
        code: '64223',
        name: 'Chi phí văn phòng 3',
        amount: 397302704,
      },
      {
        id: 14,
        code: '64224',
        name: 'Chi phí văn phòng 4',
        amount: 397302704,
      },
    ],
  },
  {
    id: 2,
    code: '6423',
    name: 'CHI PHÍ SẢN XUẤT',
    amount: 250000000,
    children: [
      {
        id: 21,
        code: '64231',
        name: 'Chi phí nguyên vật liệu',
        amount: 150000000,
        children: [
          {
            id: 211,
            code: '642311',
            name: 'Nguyên vật liệu trực tiếp',
            amount: 100000000,
          },
          {
            id: 212,
            code: '642312',
            name: 'Nguyên vật liệu gián tiếp',
            amount: 50000000,
          },
        ],
      },
      {
        id: 22,
        code: '64232',
        name: 'Chi phí nhân công',
        amount: 100000000,
      },
    ],
  },
  {
    id: 3,
    code: '6424',
    name: 'CHI PHÍ BÁN HÀNG',
    amount: 180000000,
    children: [
      {
        id: 31,
        code: '64241',
        name: 'Chi phí quảng cáo',
        amount: 120000000,
      },
      {
        id: 32,
        code: '64242',
        name: 'Chi phí vận chuyển',
        amount: 60000000,
      },
    ],
  },
  {
    id: 4,
    code: '6424',
    name: 'CHI PHÍ BÁN HÀNG',
    amount: 180000000,
    children: [
      {
        id: 31,
        code: '64241',
        name: 'Chi phí quảng cáo',
        amount: 120000000,
      },
      {
        id: 32,
        code: '64242',
        name: 'Chi phí vận chuyển',
        amount: 60000000,
      },
    ],
  },
  {
    id: 5,
    code: '6424',
    name: 'CHI PHÍ BÁN HÀNG',
    amount: 180000000,
    children: [
      {
        id: 31,
        code: '64241',
        name: 'Chi phí quảng cáo',
        amount: 120000000,
      },
      {
        id: 32,
        code: '64242',
        name: 'Chi phí vận chuyển',
        amount: 60000000,
      },
    ],
  },
];

// Hàm flatten tree thành mảng phẳng với thông tin level
const flattenTree = (items, level = 0, parentIndex = 0, allItems = []) => {
  let result = [];
  let index = parentIndex;

  items.forEach((item, idx) => {
    if (level === 0) {
      index = idx + 1;
    }

    const flattenedItem = {
      ...item,
      level,
      displayIndex: level === 0 ? index : null,
      hasChildren: item.children && item.children.length > 0,
      isLastChild: idx === items.length - 1,
      isFirstChild: level > 0 && idx === 0,
    };

    result.push(flattenedItem);
    const currentIndex = allItems.length + result.length - 1;

    if (item.children && item.children.length > 0) {
      const children = flattenTree(item.children, level + 1, index, [...allItems, ...result]);
      result = result.concat(children);
    }
  });

  return result;
};

// Hàm format số tiền
const formatAmount = amount => {
  return new Intl.NumberFormat('vi-VN').format(amount);
};

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

  const { selectedBranches, setSelectedBranches } = usePersistedBranches('report_branch_ids');

  const { data: itemsWithBranch } = useGetItemsWithBranch({
    search: debouncedItemSearchValue,
    branch_ids: selectedBranches?.length > 0 ? selectedBranches : null,
  });

  const {
    data: expenseData,
    isFetching: isFetchingExpense,
    refetch: refetchExpense,
  } = useGetExpense({
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
    exportExpense(dataSource || [], expenseData?.recordsTotal || {}, 'Theo dõi đơn đặt hàng.xlsx');
  };

  const dataSource = expenseData?.data || [];

  const flattenedData = useMemo(() => {
    return flattenTree(dataSource || []);
  }, [dataSource]);

  // Nhóm các items theo parent level 0
  const groupedData = useMemo(() => {
    const groups = [];
    let currentGroup = null;

    flattenedData.forEach(item => {
      if (item.level === 0) {
        if (currentGroup) {
          groups.push(currentGroup);
        }
        currentGroup = { parent: item, children: [] };
      } else if (currentGroup) {
        currentGroup.children.push(item);
      }
    });

    if (currentGroup) {
      groups.push(currentGroup);
    }

    return groups;
  }, [flattenedData]);

  // Render row cho item
  const renderRow = (item, isLevel0 = false) => {
    const { level, displayIndex, code, name, total } = item;
    const isLevel1 = level === 1;
    const isLevel2 = level === 2;

    return (
      <div key={item.id} className='w-full flex items-center responsive-text-sm border-x border-[#E0E0E1] relative'>
        <div className={`w-24 px-3 py-2 text-center font-medium text-gray-700 border-r border-[#E0E0E1] ${!isLevel0 ? 'h-8 2xl:h-9' : ''}`}>{displayIndex || ''}</div>

        {isLevel1 && (
          <div className='w-12 px-3 py-2 font-medium text-gray-700 relative pl-4 before:absolute before:left-5 before:top-1/3 before:-translate-y-1/2 before:w-[calc(32px)] before:h-4 before:border-l-2 before:border-b-2 before:border-gray-100 before:rounded-bl-xl'></div>
        )}

        {isLevel2 && (
          <>
            <div className='w-16 px-3 py-2 text-center font-medium text-gray-700 '></div>
            <div className='w-12 px-3 py-2 font-medium text-gray-700 relative pl-4 before:absolute before:left-5 before:top-1/3 before:-translate-y-1/2 before:w-[calc(32px)] before:h-4 before:border-l-2 before:border-b-2 before:border-gray-100 before:rounded-bl-xl'></div>
          </>
        )}

        <div className={`w-60 flex-1 px-3 py-2 text-gray-700 ${isLevel0 ? 'font-semibold' : 'font-normal'}`}>
          {code} - {name}
        </div>

        <div className='w-40 px-3 py-2 text-right font-medium text-blue-fmrp border-l border-[#E0E0E1]'>{formatAmount(total)}</div>
      </div>
    );
  };

  const renderChildren = children => {
    // Nhóm children theo level 1 parent
    const level1Groups = [];
    let currentLevel1Group = null;

    children.forEach(child => {
      if (child.level === 1) {
        if (currentLevel1Group) {
          level1Groups.push(currentLevel1Group);
        }
        currentLevel1Group = { parent: child, children: [] };
      } else if (child.level === 2 && currentLevel1Group) {
        currentLevel1Group.children.push(child);
      }
    });

    if (currentLevel1Group) {
      level1Groups.push(currentLevel1Group);
    }

    return (
      <div className='relative'>
        {level1Groups.length > 1 && <div className='absolute left-[117px] w-0.5 bg-gray-100 z-0 top-0 bottom-0 h-[calc(100%-24px)]'></div>}

        {level1Groups.map((group, groupIndex) => (
          <div key={group.parent.id}>
            {renderRow(group.parent)}

            {group.children.length > 0 && (
              <div className='relative'>
                <div className='absolute left-[181px] w-0.5 bg-gray-100 z-0 top-0 bottom-0 h-[calc(100%-24px)]'></div>
                {group.children.map(child => renderRow(child))}
              </div>
            )}
          </div>
        ))}
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
            <OnResetData sOnFetching={refetchExpense} className='!py-3' />
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
        ) : flattenedData?.length > 0 ? (
          <Customscrollbar alwaysShowScrollbar={true} className='h-full flex-1 overflow-auto  border-y border-[#E0E0E1]'>
            <div className='w-full h-full relative'>
              <div className='sticky top-0 z-50 bg-white responsive-text-sm capitalize border-x border-b border-[#E0E0E1]'>
                <div className='flex items-center'>
                  <div className='w-24 px-3 py-2 text-center font-semibold text-gray-700 border-r border-[#E0E0E1]'>STT</div>
                  <div className='w-60 flex-1 px-3 py-2 font-semibold text-gray-700'>Tên khoản chi phí</div>
                  <div className='w-40 px-3 py-2 text-right font-semibold text-gray-700 border-l border-[#E0E0E1]'>Chi phí</div>
                </div>
              </div>
              {groupedData.map(group => (
                <div key={group.parent.id} className='border-b border-[#E0E0E1]'>
                  {renderRow(group.parent, true)}
                  {group.children.length > 0 && renderChildren(group.children)}
                </div>
              ))}
              {expenseData?.grand_total !== undefined && (
                <div className='sticky bottom-0 border-b border-x border-[#E0E0E1]'>
                  <div className='w-full flex items-center responsive-text-sm bg-[#F8FAFF]'>
                    <div className='w-24 h-8 2xl:h-9 px-3 py-2 text-center font-semibold text-gray-700 border-r border-[#E0E0E1]'></div>
                    <div className='w-60 flex-1 px-3 py-2 font-semibold text-gray-700 uppercase'>Tổng cộng</div>
                    <div className='w-40 px-3 py-2 text-right font-semibold text-blue-fmrp border-l border-[#E0E0E1]'>{formatAmount(Number(expenseData?.grand_total || 0))}</div>
                  </div>
                </div>
              )}
            </div>
          </Customscrollbar>
        ) : (
          <NoData type='report' classNameImage='w-[245px]' />
        )
      }
      totalSection={dataSource?.length > 0 && <Pagination postsPerPage={limit} totalPosts={Number(expenseData?.recordsTotal) || 0} paginate={paginate} currentPage={currentPage} />}
      paginationSection={<DropdowLimit sLimit={handleLimitChange} limit={limit} dataLang={dataLang} />}
    />
  );
};

export default Expense;
