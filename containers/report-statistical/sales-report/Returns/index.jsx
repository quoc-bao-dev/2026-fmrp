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
import PopupDetail from '@/containers/sales-export-product/return-sales/components/PopupDetail';
import { useLanguageContext } from '@/context/ui/LanguageContext';
import { useClientComboboxWithBranch } from '@/hooks/common/useClients';
import { usePersistedBranches } from '@/hooks/common/usePersistedBranches';
import useSetingServer from '@/hooks/useConfigNumber';
import usePagination from '@/hooks/usePagination';
import useStatusExprired from '@/hooks/useStatusExprired';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { FaFileInvoice, FaUsers } from 'react-icons/fa';
import { useDebounce } from 'use-debounce';
import { useGetReturns, useGetReturnsComboboxWithBranch } from './hook';
import { exportWithMergeReturns } from './hook/useExportExcel';
import moment from 'moment';
import formatMoneyOrDash from '@/utils/helpers/formatMoneyOrDash';

const breadcrumbItems = [
  {
    label: `Báo cáo`,
  },
  {
    label: `Báo cáo bán hàng`,
  },
  {
    label: `Báo cáo trả lại hàng bán`,
    href: '/report-statistical/sales-report/returns',
  },
];

const Returns = props => {
  const dataSeting = useSetingServer();
  const router = useRouter();
  const { paginate } = usePagination();
  const statusExprired = useStatusExprired();
  const dataLang = useLanguageContext();

  const formatNumber = number => {
    return formatNumberConfig(+number, dataSeting);
  };

  // State management
  const [dateRange, setDateRange] = useState({
    startDate: undefined,
    endDate: undefined,
  });
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

  const { selectedBranches, setSelectedBranches } = usePersistedBranches();

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
  const { data: dataCode } = useGetReturnsComboboxWithBranch(debouncedOrderSearchValue, selectedBranches?.length > 0 ? selectedBranches : null);

  const {
    data: dataReturns,
    isFetching: isFetchingReturns,
    refetch: refetchReturns,
  } = useGetReturns({
    page: currentPage,
    limit: limit,
    ...getFormattedDateRange(),
    search: debouncedSearchValue,
    client_ids: selectedCustomer?.length > 0 ? selectedCustomer : undefined,
    return_ids: selectedOrder?.length > 0 ? selectedOrder : undefined,
    branch_ids: selectedBranches?.length > 0 ? selectedBranches : null,
  });

  const flattenedRows = useMemo(() => {
    const rows = [];
    let globalIndex = 0;
    dataReturns?.aaData?.forEach((order, orderIndex) => {
      const total = order.items?.length || 1;
      order.items?.forEach((item, itemIndex) => {
        rows.push({
          ...order,
          item,
          globalIndex: globalIndex++,
          orderIndex,
          itemIndex,
          isFirstItem: itemIndex === 0,
          isLastItem: itemIndex === total - 1,
          totalItems: total,
        });
      });
    });
    return rows;
  }, [dataReturns]);

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

  const flattenedData =
    dataReturns?.aaData?.flatMap(
      order =>
        order.items?.map(item => ({
          ...order,
          ...item,
        })) || []
    ) || [];

    const handleExportExcel = () => {
    exportWithMergeReturns(flattenedData || [], 'Báo cáo trả lại hàng bán.xlsx');
  };

  return (
    <ReportLayout
      title={'Báo cáo trả lại hàng bán'}
      statusExprired={statusExprired}
      breadcrumbItems={breadcrumbItems}
      maginBottom={true}
      branchValue={selectedBranches}
      onBranchChange={setSelectedBranches}
      onBranchClear={() => setSelectedBranches([])}
      filterSection={
        <div className='w-full items-center flex justify-between gap-4'>
          <div className='grid grid-cols-3 gap-3'>
            <DateToDateReport placeholder='Từ ngày đến ngày' value={dateRange} onChange={handleDateChange} className='w-full' />
            <SelectSearchReport
              placeholder='Khách hàng'
              onChange={handleCustomerChange}
              onClear={() => setSelectedCustomer([])}
              onSearch={setCustomerSearchValue}
              icon={<FaUsers color='#9295A4' className='size-4' />}
              options={dataClient || []}
              value={selectedCustomer}
              mode='multiple'
            />
            <SelectSearchReport
              placeholder='Mã chứng từ'
              onChange={handleOrderChange}
              onClear={() => setSelectedOrder([])}
              onSearch={setOrderSearchValue}
              icon={<FaFileInvoice color='#9295A4' className='size-4' />}
              options={dataCode || []}
              value={selectedOrder}
              mode='multiple'
            />
          </div>
          <div className='flex gap-3 items-center'>
            <SearchComponent dataLang={dataLang} placeholder='Tìm kiếm theo phiếu' onChange={handleSearch} value={searchValue} classNameBox='!py-2 2xl:!p-2.5' />
            <OnResetData sOnFetching={refetchReturns} className='!py-3' />
            <button onClick={handleExportExcel} className='!py-3 3xl:py-3 3xl:px-4 px-3 flex items-center space-x-2 bg-white hover:bg-primary-07 rounded-lg border border-background-blue-2 transition'>
              <ExcelIcon className='3xl:size-5 size-4 text-blue-fmrp' />
              <span className='text-blue-fmrp responsive-text-sm font-medium whitespace-nowrap'>{dataLang?.client_list_exportexcel}</span>
            </button>
          </div>
        </div>
      }
      tableSection={
        isFetchingReturns ? (
          <Loading color='#0f4f9e' />
        ) : dataReturns?.aaData?.length > 0 ? (
          <Customscrollbar alwaysShowScrollbar={true} className='h-full flex-1 overflow-auto border border-[#E0E0E1]'>
            <table className='w-full border-0 p-0 m-0'>
              <thead>
                <tr className='responsive-text-sm sticky top-0 z-50 bg-white capitalize'>
                  <th className='min-w-24 h-2 p-0 font-semibold text-gray-700 sticky left-0 bg-white z-20'>
                    <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Ngày trả hàng</div>
                  </th>
                  <th className='min-w-36 h-2 p-0 font-semibold text-gray-700 sticky left-[96px] 2xl:left-[104px] bg-white z-20'>
                    <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Số phiếu</div>
                  </th>
                  <th className='min-w-44 h-2 p-0 font-semibold text-gray-700 sticky left-[240px] 2xl:left-[248px] bg-white z-20'>
                    <div className='w-full h-full flex items-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Khách hàng</div>
                  </th>
                  <th className='min-w-40 h-2 p-0 font-semibold text-gray-700'>
                    <div className='w-full h-full flex items-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Chi nhánh</div>
                  </th>
                  <th className='min-w-40 h-2 p-0 font-semibold text-gray-700'>
                    <div className='w-full h-full flex items-center px-2 py-2 border-b border-r border-[#E0E0E1]'>Mã hàng</div>
                  </th>
                  <th className='min-w-48 h-2 p-0 font-semibold text-gray-700'>
                    <div className='w-full h-full flex items-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Tên hàng</div>
                  </th>
                  <th className='min-w-44 h-2 p-0 font-semibold text-gray-700'>
                    <div className='w-full h-full flex items-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Biến thể</div>
                  </th>
                  <th className='min-w-24 h-2 p-0 font-semibold text-gray-700'>
                    <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>ĐVT</div>
                  </th>
                  <th className='min-w-24 h-2 p-0 font-semibold text-gray-700'>
                    <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Số lượng</div>
                  </th>
                  <th className='min-w-24 h-2 p-0 font-semibold text-gray-700'>
                    <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Đơn giá</div>
                  </th>
                  <th className='min-w-24 h-2 p-0 font-semibold text-gray-700'>
                    <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Chiết khấu</div>
                  </th>
                  <th className='min-w-24 h-2 p-0 font-semibold text-gray-700'>
                    <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Thuế</div>
                  </th>
                  <th className='min-w-24 h-2 p-0 font-semibold text-gray-700'>
                    <div className='w-full h-full flex items-center justify-end px-3 py-2 border-b border-r border-[#E0E0E1]'>Thành tiền</div>
                  </th>
                  <th className='min-w-28 h-2 p-0 font-semibold text-gray-700'>
                    <div className='w-full h-full flex items-center justify-end px-3 py-2 border-b border-[#E0E0E1]'>Tổng cộng</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {flattenedRows.map((flattenedItem, index) => (
                  <tr key={`${flattenedItem.orderIndex}-${flattenedItem.itemIndex}`} className='hover:bg-gray-50 responsive-text-sm relative'>
                    {/* Ngày - chỉ hiển thị ở item đầu tiên với rowspan */}
                    {flattenedItem.isFirstItem && (
                      <td rowSpan={flattenedItem.totalItems} className='p-0 h-2 text-center text-gray-700 align-middle sticky left-0 z-20 bg-white'>
                        <div className='w-full h-full flex items-center justify-center px-3 py-2 border-r border-b border-[#E0E0E1]'>
                          {moment(flattenedItem?.date).format('DD/MM/YYYY HH:mm:ss') || '-'}
                        </div>
                      </td>
                    )}

                    {/* Số phiếu - chỉ hiển thị ở item đầu tiên với rowspan */}
                    {flattenedItem.isFirstItem && (
                      <td rowSpan={flattenedItem.totalItems} className='p-0 h-2 text-center text-gray-700 align-middle sticky left-[96px] 2xl:left-[104px] z-20 bg-white'>
                        <div className='w-full h-full flex items-center justify-center px-3 py-2 border-r border-b border-[#E0E0E1]'>
                          <PopupDetail
                            dataLang={dataLang}
                            className='transition-all text-[#0F4F9E] hover:text-blue-600 ease-linear font-semibold cursor-pointer'
                            name={flattenedItem?.reference_no}
                            id={flattenedItem?.id}
                          />
                        </div>
                      </td>
                    )}

                    {/* Khách hàng - chỉ hiển thị ở item đầu tiên với rowspan */}
                    {flattenedItem.isFirstItem && (
                      <td rowSpan={flattenedItem.totalItems} className='p-0 h-2 text-center text-gray-700 align-middle sticky left-[240px] 2xl:left-[248px] z-20 bg-white'>
                        <div className='w-full h-full flex items-center px-3 py-2 border-r border-b border-[#E0E0E1]'>
                          {flattenedItem?.customer_name || '-'}
                        </div>
                      </td>
                    )}

                    {/* Chi nhánh - chỉ hiển thị ở item đầu tiên với rowspan */}
                    {flattenedItem.isFirstItem && (
                      <td rowSpan={flattenedItem.totalItems} className='p-0 h-2 text-center text-gray-700 align-middle bg-white'>
                        <div className='w-full h-full flex items-center px-3 py-2 border-r border-b border-[#E0E0E1]'>
                          {flattenedItem?.branch_name || '-'}
                        </div>
                      </td>
                    )}

                    {/* Mã hàng - hiển thị cho mỗi item */}
                    <td className='p-0 h-2 text-center text-gray-700 align-middle'>
                      <div className='w-full h-full flex items-center px-2 py-2 border-r border-b border-[#E0E0E1]'>{flattenedItem?.item?.item_code || '-'}</div>
                    </td>

                    {/* Tên hàng - hiển thị cho mỗi item */}
                    <td className='p-0 h-2'>
                      <div className='h-full flex items-center px-3 py-2 text-left text-gray-700 border-r border-b border-[#E0E0E1]'>{flattenedItem.item?.item_name || '-'}</div>
                    </td>

                    {/* biến thể - hiển thị cho mỗi item */}
                    <td className='p-0 h-2'>
                      <div className='h-full flex items-center px-3 py-2 text-left text-gray-700 border-r border-b border-[#E0E0E1]'>{flattenedItem.item?.variant_name || '-'}</div>
                    </td>

                    {/* Đơn vị - hiển thị cho mỗi item */}
                    <td className='p-0 h-2'>
                      <div className='h-full flex items-center justify-center px-3 py-2 text-left text-gray-700 border-r border-b border-[#E0E0E1]'>{flattenedItem.item?.unit_name || '-'}</div>
                    </td>

                    {/* Số lượng đã giao - hiển thị cho mỗi item */}
                    <td className='p-0 h-2'>
                      <div className='h-full flex items-center justify-center px-3 py-2 text-left text-gray-700 border-r border-b border-[#E0E0E1]'>
                        {Number(flattenedItem.item?.quantity) === 0 ? '-' : formatNumber(Number(flattenedItem.item?.quantity))}
                      </div>
                    </td>

                    {/* Đơn giá - hiển thị cho mỗi item */}
                    <td className='p-0 h-2'>
                      <div className='h-full flex items-center justify-center px-3 py-2 text-left text-gray-700 border-r border-b border-[#E0E0E1]'>
                        {formatMoneyOrDash(Number(flattenedItem.item?.price))}
                      </div>
                    </td>
                    {/* Chiết khấu - hiển thị theo discount_amount */}
                    <td className='p-0 h-2'>
                      <div className='h-full flex items-center justify-center px-3 py-2 text-left text-gray-700 border-r border-b border-[#E0E0E1]'>
                        {Number(flattenedItem.item?.discount_percent_item) === 0 ? '-' : formatNumber(Number(flattenedItem.item?.discount_percent_item)) + '%'}
                      </div>
                    </td>
                    {/* Thuế - hiển thị theo tax_amount */}
                    <td className='p-0 h-2'>
                      <div className='h-full flex items-center justify-center px-3 py-2 text-left text-gray-700 border-r border-b border-[#E0E0E1]'>
                        {Number(flattenedItem.item?.tax_rate) === 0 ? '-' : formatNumber(Number(flattenedItem.item?.tax_rate)) + '%'}
                      </div>
                    </td>

                    {/* Thành tiền - hiển thị cho mỗi item */}
                    <td className='p-0 h-2'>
                      <div className='h-full flex items-center justify-end px-3 py-2 text-left border-b border-r border-[#E0E0E1]'>
                        {formatMoneyOrDash(Number(flattenedItem.item?.total_amount))}
                      </div>
                    </td>

                    {/* Tổng cộng đơn - chỉ hiển thị ở item đầu tiên với rowspan */}
                    {flattenedItem.isFirstItem && (
                      <td rowSpan={flattenedItem.totalItems} className='p-0 h-2 text-right text-new-blue font-semibold align-middle bg-white'>
                        <div className='w-full h-full flex items-center justify-end px-3 py-2 border-b border-[#E0E0E1]'>
                          {formatMoneyOrDash(Number(flattenedItem?.grand_total))}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className='bg-white sticky bottom-0 z-50 responsive-text-sm'>
                  <td className='w-40 p-0 h-2 text-center font-semibold text-gray-700 sticky left-0 bg-white z-50'>
                    <div className='w-full h-full border-t border-[#E0E0E1]'></div>
                  </td>
                  <td className='w-40 p-0 h-2 text-center font-semibold text-gray-700 sticky left-[96px] 2xl:left-[104px] bg-white z-50'>
                    <div className='w-full h-full border-t border-[#E0E0E1]'></div>
                  </td>
                  <td className='w-32 p-0 h-2 text-center font-semibold text-gray-700 sticky left-[240px] 2xl:left-[248px] bg-white z-50'>
                    <div className='w-full h-full border-t border-[#E0E0E1] uppercase px-3 py-2'>Tổng cộng</div>
                  </td>
                  <td className='w-40 p-0 h-2 text-center font-semibold text-gray-700'>
                    <div className='w-full h-full border-t border-[#E0E0E1]'></div>
                  </td>
                  <td className='w-40 p-0 h-2 text-center font-semibold text-gray-700'>
                    <div className='w-full h-full border-t border-[#E0E0E1]'></div>
                  </td>
                  <td className='w-40 p-0 h-2 text-center font-semibold text-gray-700'>
                    <div className='w-full h-full border-t border-[#E0E0E1]'></div>
                  </td>
                  <td className='w-32 p-0 h-2 text-center font-semibold text-gray-700'>
                    <div className='w-full h-full border-t border-[#E0E0E1]'></div>
                  </td>
                  <td className='w-60 p-0 h-2 text-center font-semibold text-gray-700'>
                    <div className='w-full h-full border-t border-[#E0E0E1]'></div>
                  </td>
                  <td className='w-40 p-0 h-2 text-center font-semibold text-gray-700'>
                    <div className='w-full h-full flex items-center justify-center px-3 py-2 border-t border-[#E0E0E1]'>
                      {formatNumber(flattenedData.reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0))}
                    </div>
                  </td>
                  <td className='w-32 p-0 h-2 text-center font-semibold text-gray-700'>
                    <div className='w-full h-full border-t border-[#E0E0E1]'></div>
                  </td>              
                  <td className='w-32 p-0 h-2 text-center font-semibold text-gray-700'>
                    <div className='w-full h-full border-t border-[#E0E0E1]'></div>
                  </td>
                  <td className='w-32 p-0 h-2 text-center font-semibold text-gray-700'>
                    <div className='w-full h-full border-t border-[#E0E0E1]'></div>
                  </td>
                  <td className='w-32 p-0 h-2 text-center font-semibold text-gray-700'>
                    <div className='w-full h-full border-t border-[#E0E0E1]'></div>
                  </td>
                  <td className='w-32 p-0 h-2 text-center font-semibold text-new-blue'>
                    <div className='w-full h-full flex items-center justify-end px-3 py-2 border-t border-[#E0E0E1]'>
                      {formatMoneyOrDash(flattenedData.reduce((sum, item) => sum + (Number(item?.total_amount) || 0), 0))}
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </Customscrollbar>
        ) : (
          <NoData type='report' classNameImage='w-[245px]' />
        )
      }
      totalSection={dataReturns?.aaData?.length > 0 && <Pagination postsPerPage={limit} totalPosts={Number(dataReturns?.iTotalDisplayRecords) || 0} paginate={paginate} currentPage={currentPage} />}
      paginationSection={<DropdowLimit sLimit={handleLimitChange} limit={limit} dataLang={dataLang} />}
    />
  );
};

export default Returns;
