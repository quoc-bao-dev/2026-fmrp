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
import PopupDetail from '@/containers/sales-export-product/delivery-receipt/components/PopupDetail';
import { useSalesOrderCombobox } from '@/containers/sales-export-product/sales-order/hooks/useSalesOrderCombobox';
import { useLanguageContext } from '@/context/ui/LanguageContext';
import { useClientCombobox } from '@/hooks/common/useClients';
import useSetingServer from '@/hooks/useConfigNumber';
import usePagination from '@/hooks/usePagination';
import useStatusExprired from '@/hooks/useStatusExprired';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { FaFileInvoice, FaUsers } from 'react-icons/fa';
import { useDebounce } from 'use-debounce';
import { useGetDeliveries } from './hook';
import { exportWithMergeSalesRevenue } from './hook/useExportExcel';

const breadcrumbItems = [
  {
    label: `Báo cáo`,
  },
  {
    label: `Báo cáo bán hàng`,
  },
  {
    label: `Báo cáo giao hàng`,
    href: '/report-statistical/sales-report/deliveries',
  },
];

const Deliveries = props => {
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
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [limit, setLimit] = useState(15);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue] = useDebounce(searchValue, 500);

  // Search values riêng cho từng API
  const [customerSearchValue, setCustomerSearchValue] = useState('');
  const [debouncedCustomerSearchValue] = useDebounce(customerSearchValue, 500);
  const [orderSearchValue, setOrderSearchValue] = useState('');
  const [debouncedOrderSearchValue] = useDebounce(orderSearchValue, 500);

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

  const { data: dataClient } = useClientCombobox(debouncedCustomerSearchValue);
  const { data: dataCode } = useSalesOrderCombobox(debouncedOrderSearchValue);

  const {
    data: dataSalesRevenue,
    isFetching: isFetchingSalesRevenue,
    refetch: refetchSalesRevenue,
  } = useGetDeliveries({
    page: currentPage,
    limit: limit,
    ...getFormattedDateRange(),
    search: debouncedSearchValue,
    client_ids: selectedCustomer?.value,
    order_ids: selectedOrder?.value,
  });

  // Handler functions
  const handleDateChange = newValue => {
    setDateRange(newValue);
  };

  const handleCustomerChange = value => {
    const selectedOption = dataClient?.find(option => option.value === value);
    setSelectedCustomer(selectedOption || null);
  };

  const handleOrderChange = value => {
    const selectedOption = dataCode?.find(option => option.value === value);
    setSelectedOrder(selectedOption || null);
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
        title={'Báo cáo giao hàng'}
        statusExprired={statusExprired}
        breadcrumbItems={breadcrumbItems}
        filterSection={
          <div className='w-full items-center flex justify-between gap-4'>
            <div className='grid grid-cols-3 gap-3'>
              <DateToDateReport placeholder='Từ ngày đến ngày' value={dateRange} onChange={handleDateChange} className='w-full' />
              <SelectSearchReport
                placeholder='Khách hàng'
                onChange={handleCustomerChange}
                onClear={() => setSelectedCustomer(null)}
                onSearch={setCustomerSearchValue}
                icon={<FaUsers color='#9295A4' className='size-4' />}
                options={dataClient || []}
                value={selectedCustomer}
              />
              <SelectSearchReport
                placeholder='Phiếu bán hàng'
                onChange={handleOrderChange}
                onClear={() => setSelectedOrder(null)}
                onSearch={setOrderSearchValue}
                icon={<FaFileInvoice color='#9295A4' className='size-4' />}
                options={dataCode || []}
                value={selectedOrder}
              />
            </div>
            <div className='flex gap-3 items-center'>
              <SearchComponent dataLang={dataLang} placeholder='Tìm kiếm theo phiếu' onChange={handleSearch} value={searchValue} classNameBox='!py-2 2xl:!p-2.5' />
              <OnResetData sOnFetching={refetchSalesRevenue} className='!py-3' />
              <button
                onClick={handleExportExcel}
                className='!py-3 3xl:py-3 3xl:px-4 px-3 flex items-center space-x-2 bg-white hover:bg-primary-07 rounded-lg border border-background-blue-2 transition'
              >
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
            <Customscrollbar alwaysShowScrollbar={true} className='h-full flex-1 overflow-auto border border-[#E0E0E1]'>
              <table className='w-full border-0 p-0 m-0'>
                <thead>
                  <tr className='responsive-text-sm sticky top-0 z-50 bg-white'>
                    <th className='min-w-24 h-2 p-0 font-semibold text-gray-700 sticky left-0 bg-white z-20'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Ngày</div>
                    </th>
                    <th className='min-w-36 h-2 p-0 font-semibold text-gray-700 sticky left-[96px] bg-white z-20'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Số giao hàng</div>
                    </th>
                    <th className='min-w-32 h-2 p-0 font-semibold text-gray-700 sticky left-[240px] bg-white z-20'>
                      <div className='w-full h-full flex items-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Khách hàng</div>
                    </th>
                    <th className='min-w-40 h-2 p-0 font-semibold text-gray-700 sticky left-[368px] bg-white z-20'>
                      <div className='w-full h-full flex items-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Địa chỉ giao</div>
                    </th>
                    <th className='min-w-32 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center px-2 py-2 border-b border-r border-[#E0E0E1]'>Nhân viên phụ trách</div>
                    </th>
                    <th className='min-w-28 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Mã hàng</div>
                    </th>
                    <th className='min-w-48 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Tên hàng</div>
                    </th>
                    <th className='min-w-24 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>ĐVT</div>
                    </th>
                    <th className='min-w-24 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Số lượng</div>
                    </th>
                    <th className='min-w-24 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Giá</div>
                    </th>
                    <th className='min-w-24 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-end px-3 py-2 border-b border-[#E0E0E1]'>Thành tiền</div>
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
                            <div className='w-full h-full flex items-center justify-center px-3 py-2 border-r border-b border-[#E0E0E1]'>{flattenedItem?.delivery_date || '-'}</div>
                          </td>
                        )}

                        {/* Số giao hàng - chỉ hiển thị ở item đầu tiên với rowspan */}
                        {flattenedItem.isFirstItem && (
                          <td rowSpan={flattenedItem.totalItems} className='p-0 h-2 text-center text-gray-700 align-middle sticky left-[96px] z-20 bg-white'>
                            <div className='w-full h-full flex items-center justify-center px-3 py-2 border-r border-b border-[#E0E0E1]'>
                              <PopupDetail
                                dataLang={dataLang}
                                className='transition-all text-[#0F4F9E] hover:text-blue-600 ease-linear font-semibold cursor-pointer'
                                name={flattenedItem?.reference_no}
                                id={flattenedItem?.delivery_id}
                              />
                            </div>
                          </td>
                        )}

                        {/* Khách hàng - chỉ hiển thị ở item đầu tiên với rowspan */}
                        {flattenedItem.isFirstItem && (
                          <td rowSpan={flattenedItem.totalItems} className='p-0 h-2 text-center text-gray-700 align-middle sticky left-[240px] z-20 bg-white'>
                            <div className='w-full h-full flex items-center justify-center px-3 py-2 border-r border-b border-[#E0E0E1]'>{flattenedItem?.customer_name || '-'}</div>
                          </td>
                        )}

                        {/* Địa chỉ giao - chỉ hiển thị ở item đầu tiên với rowspan */}
                        {flattenedItem.isFirstItem && (
                          <td rowSpan={flattenedItem.totalItems} className='p-0 h-2 text-center text-gray-700 align-middle sticky left-[368px] z-20 bg-white'>
                            <div className='w-full h-full flex items-center px-3 py-2 border-r border-b border-[#E0E0E1]'>{flattenedItem?.address_delivery || '-'}</div>
                          </td>
                        )}

                        {/* Nhân viên phụ trách - chỉ hiển thị ở item đầu tiên với rowspan */}
                        {flattenedItem.isFirstItem && (
                          <td rowSpan={flattenedItem.totalItems} className='p-0 h-2 text-center text-gray-700 align-middle bg-white'>
                            <div className='w-full h-full flex items-center px-2 py-2 border-r border-b border-[#E0E0E1]'>{flattenedItem?.employee_name || '-'}</div>
                          </td>
                        )}

                        {/* Mã hàng - hiển thị cho mỗi item */}
                        <td className='p-0 h-2'>
                          <div className='h-full flex items-center justify-center px-3 py-2 text-left text-gray-700 border-r border-b border-[#E0E0E1]'>{flattenedItem.item?.item_code || '-'}</div>
                        </td>

                        {/* Tên hàng - hiển thị cho mỗi item */}
                        <td className='p-0 h-2'>
                          <div className='h-full flex items-center px-3 py-2 text-left text-gray-700 border-r border-b border-[#E0E0E1]'>{flattenedItem.item?.item_name || '-'}</div>
                        </td>

                        {/* Số lượng đơn hàng - hiển thị cho mỗi item */}
                        <td className='p-0 h-2'>
                          <div className='h-full flex items-center justify-center px-3 py-2 text-left text-gray-700 border-r border-b border-[#E0E0E1]'>{flattenedItem.item?.unit_name}</div>
                        </td>

                        {/* Số lượng đã giao - hiển thị cho mỗi item */}
                        <td className='p-0 h-2'>
                          <div className='h-full flex items-center justify-center px-3 py-2 text-left text-gray-700 border-r border-b border-[#E0E0E1]'>
                            {/* {Number(flattenedItem.item?.quantity_delivery) === 0 ? '-' : formatNumber(flattenedItem.item?.quantity_delivery)} */}
                            {flattenedItem.item?.quantity}
                          </div>
                        </td>

                        {/* Đơn giá - hiển thị cho mỗi item */}
                        <td className='p-0 h-2'>
                          <div className='h-full flex items-center justify-center px-3 py-2 text-left text-gray-700 border-r border-b border-[#E0E0E1]'>
                            {Number(flattenedItem.item?.price) === 0 ? '-' : formatNumber(flattenedItem.item?.price)}
                          </div>
                        </td>

                        {/* Thành tiền - hiển thị cho mỗi item */}
                        <td className='p-0 h-2'>
                          <div className='h-full flex items-center justify-end px-3 py-2 text-left text-new-blue font-semibold border-b border-[#E0E0E1]'>
                            {Number(flattenedItem.item?.amount) === 0 ? '-' : formatNumber(flattenedItem.item?.amount)}
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
                <tfoot>
                  <tr className='bg-white sticky bottom-0 z-50 responsive-text-sm'>
                    <td className='w-40 p-0 h-2 text-center font-semibold text-gray-700'>
                      <div className='w-full h-full border-t border-[#E0E0E1]'></div>
                    </td>
                    <td className='w-40 p-0 h-2 text-center font-semibold text-gray-700'>
                      <div className='w-full h-full border-t border-[#E0E0E1]'></div>
                    </td>
                    <td className='w-32 p-0 h-2 text-center font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-t border-[#E0E0E1] uppercase'>Tổng cộng</div>
                    </td>
                    <td className='w-32 p-0 h-2 text-center font-semibold text-gray-700'>
                      <div className='w-full h-full border-t border-[#E0E0E1]'></div>
                    </td>
                    <td className='w-40 p-0 h-2 text-center font-semibold text-gray-700'>
                      <div className='w-full h-full border-t border-[#E0E0E1]'></div>
                    </td>
                    <td className='w-32 p-0 h-2 text-center font-semibold text-gray-700'>
                      <div className='w-full h-full border-t border-[#E0E0E1]'>-</div>
                    </td>
                    <td className='w-60 p-0 h-2 text-center font-semibold text-gray-700'>
                      <div className='w-full h-full border-t border-[#E0E0E1]'>-</div>
                    </td>
                    <td className='w-40 p-0 h-2 text-center font-semibold text-gray-700'>
                      <div className='w-full h-full border-t border-[#E0E0E1]'>-</div>
                    </td>
                    <td className='w-40 p-0 h-2 text-center font-semibold text-gray-700'>
                      <div className='w-full h-full border-t border-[#E0E0E1]'>-</div>
                    </td>
                    <td className='w-32 p-0 h-2 text-center font-semibold text-gray-700'>
                      <div className='w-full h-full border-t border-[#E0E0E1]'>-</div>
                    </td>
                    <td className='w-32 p-0 h-2 text-center font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-t border-[#E0E0E1]'>
                        {formatNumber(flattenedData.reduce((sum, item) => sum + (Number(item?.quantity) || 0), 0))}
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
        totalSection={
          dataSalesRevenue?.aaData?.length > 0 && <Pagination postsPerPage={limit} totalPosts={Number(dataSalesRevenue?.iTotalDisplayRecords) || 0} paginate={paginate} currentPage={currentPage} />
        }
        paginationSection={<DropdowLimit sLimit={handleLimitChange} limit={limit} dataLang={dataLang} />}
      />
    </React.Fragment>
  );
};

export default Deliveries;
