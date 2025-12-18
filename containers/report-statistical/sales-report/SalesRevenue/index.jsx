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
import formatNumberConfig from '@/utils/helpers/formatnumber';
import moment from 'moment';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { FaFileInvoice, FaUsers } from 'react-icons/fa';
import { useDebounce } from 'use-debounce';
import { useGetSalesRevenue, useSalesOrderComboboxWithBranch } from './hook';
import { exportWithMergeSalesRevenue } from './hook/useExportExcel';
import formatMoneyOrDash from '@/utils/helpers/formatMoneyOrDash';

const breadcrumbItems = [
  {
    label: `Báo cáo`,
  },
  {
    label: `Báo cáo bán hàng`,
  },
  {
    label: `Doanh số theo bán hàng`,
    href: '/report-statistical/sales-report/sales-revenue',
  },
];

const SalesRevenue = props => {
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
    dataSalesRevenue?.aaData?.flatMap(
      order =>
        order.items?.map(item => ({
          ...order,
          ...item,
        })) || []
    ) || [];

  const handleExportExcel = () => {
    exportWithMergeSalesRevenue(flattenedData || [], 'Báo cáo doanh số theo bán hàng.xlsx');
  };

  return (
    <React.Fragment>
      <ReportLayout
        title={'Doanh số theo bán hàng'}
        statusExprired={statusExprired}
        breadcrumbItems={breadcrumbItems}
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
                placeholder='Phiếu bán hàng'
                onChange={handleOrderChange}
                onClear={() => setSelectedOrder([])}
                onSearch={setOrderSearchValue}
                icon={<FaFileInvoice color='#9295A4' className='size-4' />}
                options={dataCode || []}
                value={selectedOrder}
                mode='multiple'
              />
            </div>
            <div className='flex justify-end gap-3 items-center w-auto flex-shrink-0'>
              <SearchComponent dataLang={dataLang} placeholder='Tìm kiếm theo phiếu' onChange={handleSearch} value={searchValue} classNameBox='!py-2 2xl:!p-2.5' />
              <OnResetData sOnFetching={refetchSalesRevenue} className='!py-3' />
              <button
                onClick={handleExportExcel}
                className='!py-3 3xl:py-3 3xl:px-4 px-3 flex items-center space-x-2 bg-white hover:bg-primary-07 rounded-lg border border-blue-fmrp transition'
              >
                <ExcelIcon className='3xl:size-5 size-4 text-blue-fmrp' />
                <span className='text-blue-fmrp responsive-text-sm font-medium whitespace-nowrap'>{dataLang?.client_list_exportexcel}</span>
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
                    <th rowSpan={2} className='min-w-32 h-2 p-0 font-semibold text-gray-700 sticky left-0 bg-white z-20'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border border-[#E0E0E1]'>Ngày đơn hàng</div>
                    </th>
                    <th rowSpan={2} className='min-w-36 h-2 p-0 font-semibold text-gray-700 sticky left-[128px] bg-white z-20'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-y border-r border-[#E0E0E1]'>Khách hàng</div>
                    </th>
                    <th rowSpan={2} className='min-w-32 h-2 p-0 font-semibold text-gray-700 sticky left-[272px] bg-white z-20'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-y border-r border-[#E0E0E1]'>Phiếu bán hàng</div>
                    </th>
                    <th rowSpan={2} className='min-w-32 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-y border-r border-[#E0E0E1]'>Ngày giao hàng (dự kiến)</div>
                    </th>
                    <th rowSpan={2} className='min-w-32 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-y border-r border-[#E0E0E1]'>Mã sản phẩm</div>
                    </th>
                    <th rowSpan={2} className='min-w-40 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center px-3 py-2 border-y border-r border-[#E0E0E1]'>Tên sản phẩm</div>
                    </th>
                    <th rowSpan={2} className='min-w-40 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center px-3 py-2 border-y border-r border-[#E0E0E1]'>Biến thể</div>
                    </th>
                    <th rowSpan={2} className='min-w-24 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-y border-r border-[#E0E0E1]'>Đơn vị</div>
                    </th>
                    <th colSpan={3} className='min-w-[96px] h-2 p-0 font-semibold text-gray-700 bg-blue-50'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-y border-r border-[#E0E0E1]'>Số lượng</div>
                    </th>
                    <th colSpan={9} className='min-w-[224px] h-2 p-0 font-semibold text-gray-700 bg-blue-50'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-y border-r border-[#E0E0E1]'>Giá trị</div>
                    </th>
                    <th rowSpan={2} className='min-w-32 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center px-3 py-2 border-y border-r border-[#E0E0E1]'>Chi nhánh</div>
                    </th>
                    <th rowSpan={2} className='min-w-32 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-y border-r border-[#E0E0E1]'>Nhân viên</div>
                    </th>
                  </tr>
                  <tr className='responsive-text-sm sticky top-[34px] 2xl:top-[38px] z-40 bg-white capitalize'>
                    <th className='min-w-32 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Đơn hàng</div>
                    </th>
                    <th className='min-w-32 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Đã giao</div>
                    </th>
                    <th className='min-w-32 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Còn lại</div>
                    </th>
                    <th className='min-w-32 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Đơn giá</div>
                    </th>
                    <th className='min-w-32 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>% chiết khấu</div>
                    </th>
                    <th className='min-w-32 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-end px-3 py-2 border-b border-r border-[#E0E0E1]'>Tiền chiết khấu</div>
                    </th>
                    <th className='min-w-32 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>% thuế</div>
                    </th>
                    <th className='min-w-32 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-end px-3 py-2 border-b border-r border-[#E0E0E1]'>Tiền thuế</div>
                    </th>
                    <th className='min-w-32 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-end px-3 py-2 border-b border-r border-[#E0E0E1]'>Thành tiền</div>
                    </th>
                    <th className='min-w-32 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-end px-3 py-2 border-b border-r border-[#E0E0E1]'>Tổng cộng</div>
                    </th>
                    <th className='min-w-32 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-end px-3 py-2 border-b border-r border-[#E0E0E1]'>Đã thu</div>
                    </th>
                    <th className='min-w-32 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-end px-3 py-2 border-b border-r border-[#E0E0E1]'>Còn lại</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // Tạo mảng dữ liệu đã được "flatten" để hiển thị từng item
                    const flattenedData = [];
                    let globalIndex = 0;

                    dataSalesRevenue?.aaData?.forEach((order, orderIndex) => {
                      order.items?.forEach((item, itemIndex) => {
                        flattenedData.push({
                          ...order,
                          item,
                          globalIndex: globalIndex++,
                          orderIndex,
                          itemIndex,
                          isFirstItem: itemIndex === 0,
                          isLastItem: itemIndex === (order.items?.length || 1) - 1,
                          totalItems: order.items?.length || 1,
                        });
                      });
                    });

                    return flattenedData.map((flattenedItem, index) => (
                      <tr key={`${flattenedItem.orderIndex}-${flattenedItem.itemIndex}`} className='hover:bg-gray-50 responsive-text-sm relative'>
                        {/* Ngày - chỉ hiển thị ở item đầu tiên với rowspan */}
                        {flattenedItem.isFirstItem && (
                          <td rowSpan={flattenedItem.totalItems} className='p-0 h-2 text-center text-gray-700 align-middle sticky left-0 z-20 bg-white'>
                            <div className='w-full h-full flex items-center justify-center px-3 py-2 border-x border-b border-[#E0E0E1]'>
                              {flattenedItem?.date ? moment(flattenedItem.date).format('DD/MM/YYYY HH:mm:ss') : '-'}
                            </div>
                          </td>
                        )}

                        {/* Khách hàng - chỉ hiển thị ở item đầu tiên với rowspan */}
                        {flattenedItem.isFirstItem && (
                          <td rowSpan={flattenedItem.totalItems} className='p-0 h-2 text-center text-gray-700 align-middle sticky left-[128px] z-20 bg-white'>
                            <div className='w-full h-full flex items-center justify-center px-3 py-2 border-r border-b border-[#E0E0E1]'>{flattenedItem?.customer_name || '-'}</div>
                          </td>
                        )}

                        {/* Phiếu bán hàng - chỉ hiển thị ở item đầu tiên với rowspan */}
                        {flattenedItem.isFirstItem && (
                          <td rowSpan={flattenedItem.totalItems} className='p-0 h-2 text-center text-gray-700 align-middle sticky left-[272px] z-20 bg-white'>
                            <div className='w-full h-full flex items-center justify-center px-3 py-2 border-r border-b border-[#E0E0E1] !text-new-blue font-semibold'>
                              <PopupDetailProduct
                                dataLang={dataLang}
                                className='3xl:text-sm 2xl:text-13 xl:text-xs text-11 font-medium col-span-1 text-center text-[#0F4F9E] hover:text-blue-500 transition-all duration-200 ease-in-out cursor-pointer'
                                name={flattenedItem?.reference_no ? flattenedItem?.reference_no : ''}
                                id={flattenedItem?.id}
                              />
                              {/* {flattenedItem?.reference_no || '-'} */}
                            </div>
                          </td>
                        )}

                        {/* Ngày giao hàng - hiển thị cho mỗi item */}
                        <td className='p-0 h-2 text-center text-gray-700'>
                          <div className='w-full h-full flex items-center justify-center px-3 py-2 border-r border-b border-[#E0E0E1]'>
                            {flattenedItem.item?.delivery_date ? moment(flattenedItem.item.delivery_date).format('DD/MM/YYYY') : '-'}
                          </div>
                        </td>

                        {/* Mã sản phẩm - hiển thị cho mỗi item */}
                        <td className='p-0 h-2 text-left text-gray-700'>
                          <div className='w-full h-full flex items-center justify-center px-3 py-2 border-r border-b border-[#E0E0E1]'>{flattenedItem.item?.item_code || '-'}</div>
                        </td>

                        {/* Tên sản phẩm - hiển thị cho mỗi item */}
                        <td className='p-0 h-2 text-left text-gray-700'>
                          <div className='w-full h-full flex items-center px-3 py-2 border-r border-b border-[#E0E0E1]'>{flattenedItem.item?.item_name || '-'}</div>
                        </td>

                        {/* Biến thể - hiển thị cho mỗi item */}
                        <td className='p-0 h-2 text-left text-gray-700'>
                          <div className='w-full h-full flex items-center px-3 py-2 border-r border-b border-[#E0E0E1]'>{flattenedItem.item?.variant_name || '-'}</div>
                        </td>

                        {/* Đơn vị - hiển thị cho mỗi item */}
                        <td className='p-0 h-2 text-center text-gray-700'>
                          <div className='w-full h-full flex items-center justify-center px-3 py-2 border-r border-b border-[#E0E0E1]'>{flattenedItem.item?.unit_name || '-'}</div>
                        </td>

                        {/* Số lượng đơn hàng - hiển thị cho mỗi item */}
                        <td className='p-0 h-2 text-center text-gray-700'>
                          <div className='w-full h-full flex items-center justify-center px-3 py-2 border-r border-b border-[#E0E0E1]'>
                            {Number(flattenedItem.item?.quantity) === 0 ? '-' : formatNumber(flattenedItem.item?.quantity)}
                          </div>
                        </td>

                        {/* Số lượng đã giao - hiển thị cho mỗi item */}
                        <td className='p-0 h-2 text-center text-gray-700'>
                          <div className='w-full h-full flex items-center justify-center px-3 py-2 border-r border-b border-[#E0E0E1]'>
                            {Number(flattenedItem.item?.quantity_delivery) === 0 ? '-' : formatNumber(flattenedItem.item?.quantity_delivery)}
                          </div>
                        </td>

                        {/* Số lượng còn lại - hiển thị cho mỗi item */}
                        <td className='p-0 h-2 text-center text-gray-700'>
                          <div className='w-full h-full flex items-center justify-center px-3 py-2 border-r border-b border-[#E0E0E1]'>
                            {Number(flattenedItem.item?.quantity_not_delivery) === 0 ? '-' : formatNumber(flattenedItem.item?.quantity_not_delivery)}
                          </div>
                        </td>

                        {/* Đơn giá - hiển thị cho mỗi item */}
                        <td className='p-0 h-2 text-center text-gray-700'>
                          <div className='w-full h-full flex items-center justify-center px-3 py-2 border-r border-b border-[#E0E0E1]'>{formatMoneyOrDash(Number(flattenedItem.item?.price))}</div>
                        </td>

                        {/* Chiết khấu % - hiển thị cho mỗi item */}
                        <td className='p-0 h-2 text-center text-gray-700'>
                          <div className='w-full h-full flex items-center justify-center px-3 py-2 border-r border-b border-[#E0E0E1]'>
                            {Number(flattenedItem.item?.discount_percent_item) === 0 ? '-' : formatNumber(flattenedItem.item?.discount_percent_item) + '%'}
                          </div>
                        </td>

                        {/* Chiết khấu tiền - hiển thị cho mỗi item */}
                        <td className='p-0 h-2 text-end text-gray-700'>
                          <div className='w-full h-full flex items-center justify-end px-3 py-2 border-r border-b border-[#E0E0E1]'>
                            {formatMoneyOrDash(Number(flattenedItem.item?.discount_percent_amount_item))}
                          </div>
                        </td>

                        {/* % thuế - hiển thị cho mỗi item */}
                        <td className='p-0 h-2 text-center text-gray-700'>
                          <div className='w-full h-full flex items-center justify-center px-3 py-2 border-r border-b border-[#E0E0E1]'>
                            {Number(flattenedItem.item?.tax_rate_item) === 0 ? '-' : formatNumber(flattenedItem.item?.tax_rate_item) + '%'}
                          </div>
                        </td>

                        {/* Tiền thuế - hiển thị cho mỗi item */}
                        <td className='p-0 h-2 text-end text-gray-700'>
                          <div className='w-full h-full flex items-center justify-end px-3 py-2 border-r border-b border-[#E0E0E1]'>
                            {formatMoneyOrDash(Number(flattenedItem.item?.tax_amount_item))}
                          </div>
                        </td>

                        {/* Thành tiền - hiển thị cho mỗi item */}
                        <td className='p-0 h-2 text-end text-gray-700'>
                          <div className='w-full h-full flex items-center justify-end px-3 py-2 border-r border-b border-[#E0E0E1]'>{formatMoneyOrDash(Number(flattenedItem.item?.total_amount))}</div>
                        </td>

                        {/* Tổng cộng - chỉ hiển thị ở item đầu tiên với rowspan */}
                        {flattenedItem.isFirstItem && (
                          <td rowSpan={flattenedItem.totalItems} className='p-0 h-2 text-center text-new-blue font-semibold align-middle bg-white'>
                            <div className='w-full h-full flex items-center justify-end px-3 py-2 border-r border-b border-[#E0E0E1]'>{formatMoneyOrDash(Number(flattenedItem?.grand_total))}</div>
                          </td>
                        )}

                        {/* Đã thu - chỉ hiển thị ở item đầu tiên với rowspan */}
                        {flattenedItem.isFirstItem && (
                          <td rowSpan={flattenedItem.totalItems} className='p-0 h-2 text-center text-red-01 font-semibold align-middle bg-white'>
                            <div className='w-full h-full flex items-center justify-end px-3 py-2 border-r border-b border-[#E0E0E1]'>{formatMoneyOrDash(Number(flattenedItem?.total_payment))}</div>
                          </td>
                        )}

                        {/* Còn lại - chỉ hiển thị ở item đầu tiên với rowspan */}
                        {flattenedItem.isFirstItem && (
                          <td rowSpan={flattenedItem.totalItems} className='p-0 h-2 text-center text-red-01 font-semibold align-middle bg-white'>
                            <div className='w-full h-full flex items-center justify-end px-3 py-2 border-r border-b border-[#E0E0E1]'>{formatMoneyOrDash(Number(flattenedItem?.total_rest))}</div>
                          </td>
                        )}

                        {/*Chi nhánh - chỉ hiển thị ở item đầu tiên với rowspan */}
                        {flattenedItem.isFirstItem && (
                          <td rowSpan={flattenedItem.totalItems} className='p-0 h-2 text-center text-gray-700 align-middle bg-white'>
                            <div className='w-full h-full flex items-center px-3 py-2 border-r border-b border-[#E0E0E1]'>{flattenedItem?.branch_name || '-'}</div>
                          </td>
                        )}

                        {/* Nhân viên - chỉ hiển thị ở item đầu tiên với rowspan */}
                        {flattenedItem.isFirstItem && (
                          <td rowSpan={flattenedItem.totalItems} className='p-0 h-2 text-center text-gray-700 align-middle bg-white'>
                            <div className='w-full h-full flex items-center justify-center px-3 py-2 border-r border-b border-[#E0E0E1]'>{flattenedItem?.employee_name || '-'}</div>
                          </td>
                        )}
                      </tr>
                    ));
                  })()}
                </tbody>
                <tfoot>
                  <tr className='bg-white sticky bottom-[-1px] z-50 responsive-text-sm'>
                    <td className='w-40 p-0 h-2 text-center font-semibold text-gray-700 sticky left-0 bg-white z-20'>
                      <div className='w-full h-full border-t border-[#E0E0E1]'></div>
                    </td>
                    <td className='w-32 p-0 h-2 text-center font-semibold text-gray-700 sticky left-[128px] bg-white z-20'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-t border-[#E0E0E1] uppercase'>Tổng cộng</div>
                    </td>
                    <td className='w-32 p-0 h-2 text-center font-semibold text-gray-700 sticky left-[272px] bg-white z-20'>
                      <div className='w-full h-full border-t border-[#E0E0E1]'></div>
                    </td>
                    <td className='w-32 p-0 h-2 text-center font-semibold text-gray-700'>
                      <div className='w-full h-full border-t border-[#E0E0E1]'></div>
                    </td>
                    <td className='w-60 p-0 h-2 text-center font-semibold text-gray-700'>
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
                    <td className='w-32 p-0 h-2 text-center font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-t border-[#E0E0E1]'>
                        {formatNumber(flattenedData.reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0))}
                      </div>
                    </td>
                    <td className='w-32 p-0 h-2 text-center font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-t border-[#E0E0E1]'>
                        {formatNumber(flattenedData.reduce((sum, item) => sum + (Number(item?.quantity_delivery) || 0), 0))}
                      </div>
                    </td>
                    <td className='w-32 p-0 h-2 text-center font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-t border-[#E0E0E1]'>
                        {formatNumber(flattenedData.reduce((sum, item) => sum + (Number(item?.quantity_not_delivery) || 0), 0))}
                      </div>
                    </td>
                    <td className='w-40 p-0 h-2 text-center font-semibold text-gray-700'>
                      <div className='w-full h-full border-t border-[#E0E0E1]'></div>
                    </td>
                    <td className='w-32 p-0 h-2 text-center font-semibold text-gray-700'>
                      <div className='w-full h-full border-t border-[#E0E0E1]'></div>
                    </td>
                    <td className='w-32 p-0 h-2 text-center font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-end px-3 py-2 border-t border-[#E0E0E1]'>
                        {formatMoneyOrDash(flattenedData.reduce((sum, item) => sum + (Number(item?.discount_percent_amount_item) || 0), 0))}
                      </div>
                    </td>
                    <td className='w-32 p-0 h-2 text-center font-semibold text-gray-700'>
                      <div className='w-full h-full border-t border-[#E0E0E1]'></div>
                    </td>
                    <td className='w-32 p-0 h-2 text-center font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-end px-3 py-2 border-t border-[#E0E0E1]'>
                        {formatMoneyOrDash(flattenedData.reduce((sum, item) => sum + (Number(item?.tax_amount_item) || 0), 0))}
                      </div>
                    </td>
                    <td className='w-32 p-0 h-2 text-end font-semibold text-gray-700'>
                      <div className='w-full h-full border-t border-[#E0E0E1]'></div>
                    </td>
                    <td className='w-32 p-0 h-2 text-center font-semibold text-new-blue'>
                      <div className='w-full h-full flex items-center justify-end px-3 py-2 border-t border-[#E0E0E1]'>
                        {formatMoneyOrDash(dataSalesRevenue?.aaData?.reduce((sum, order) => sum + (Number(order?.grand_total) || 0), 0) || 0)}
                      </div>
                    </td>
                    <td className='w-32 p-0 h-2 text-center font-semibold text-red-01'>
                      <div className='w-full h-full flex items-center justify-end px-3 py-2 border-t border-[#E0E0E1]'>
                        {formatMoneyOrDash(dataSalesRevenue?.aaData?.reduce((sum, order) => sum + (Number(order?.total_payment) || 0), 0) || 0)}
                      </div>
                    </td>
                    <td className='w-32 p-0 h-2 text-center font-semibold text-red-01'>
                      <div className='w-full h-full flex items-center justify-end px-3 py-2 border-t border-[#E0E0E1]'>
                        {formatMoneyOrDash(dataSalesRevenue?.aaData?.reduce((sum, order) => sum + (Number(order?.total_rest) || 0), 0) || 0)}
                      </div>
                    </td>
                    <td className='w-40 p-0 h-2 text-center font-semibold text-gray-700'>
                      <div className='w-full h-full border-t border-[#E0E0E1]'></div>
                    </td>
                    <td className='w-40 p-0 h-2 text-center font-semibold text-gray-700'>
                      <div className='w-full h-full border-t border-[#E0E0E1]'></div>
                    </td>
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
    </React.Fragment>
  );
};

export default SalesRevenue;
