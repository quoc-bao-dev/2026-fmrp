import OnResetData from '@/components/UI/btnResetData/btnReset';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import DateToDateReport from '@/components/UI/filterComponents/dateTodateReport';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import SelectSearchReport from '@/components/common/select/SelectSearchReport';
import ExcelIcon from '@/components/icons/common/Excel';
import ReportLayout from '@/components/layout/ReportLayout';
import { useLanguageContext } from '@/context/ui/LanguageContext';
import { useClientComboboxWithBranch } from '@/hooks/common/useClients';
import { usePersistedBranches } from '@/hooks/common/usePersistedBranches';
import useSetingServer from '@/hooks/useConfigNumber';
import useStatusExprired from '@/hooks/useStatusExprired';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import moment from 'moment';
import { Fragment, useState } from 'react';
import { FaUsers } from 'react-icons/fa';
import { useDebounce } from 'use-debounce';
import { useGetCustomerDebt } from './hook';
import { exportCustomerDebtExcel } from './hook/useExportExcel';
import { FaPlus } from 'react-icons/fa6';
import Image from 'next/image';

const breadcrumbItems = [
  {
    label: `Báo cáo`,
  },
  {
    label: `Báo cáo bán hàng`,
  },
  {
    label: `Báo cáo công nợ khách hàng`,
    href: '/report-statistical/sales-report/customer-debt',
  },
];

const CustomerDebt = props => {
  const dataSeting = useSetingServer();
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
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerSearchValue, setCustomerSearchValue] = useState('');
  const [debouncedCustomerSearchValue] = useDebounce(customerSearchValue, 500);

  const { selectedBranches, setSelectedBranches } = usePersistedBranches();

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

  const {
    data: dataCustomerDebt,
    isFetching: isFetchingCustomerDebt,
    refetch: refetchCustomerDebt,
  } = useGetCustomerDebt({
    ...getFormattedDateRange(),
    client_id: selectedCustomer ? selectedCustomer : undefined,
    branch_ids: selectedBranches?.length > 0 ? selectedBranches : null,
  });

  // Handler functions
  const handleDateChange = newValue => {
    setDateRange(newValue);
  };

  const handleCustomerChange = values => {
    setSelectedCustomer(values);
  };

  const handleExportExcel = () => {
    if (!dataCustomerDebt) return;
    const clientName = dataCustomerDebt?.debt?.client_name || 'Khach_hang';
    const filename = `Bao_cao_cong_no_${clientName}.xlsx`;
    exportCustomerDebtExcel(dataCustomerDebt, filename, dataSeting, getFormattedDateRange());
  };

  const noDataTitle = !selectedCustomer
    ? 'Chưa chọn khách hàng. Vui lòng chọn khách hàng để xem báo cáo.'
    : 'Chưa có dữ liệu';

  return (
    <ReportLayout
      title={'Báo cáo công nợ khách hàng'}
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
              onClear={() => setSelectedCustomer(null)}
              onSearch={setCustomerSearchValue}
              icon={<FaUsers color='#9295A4' className='size-4' />}
              options={dataClient || []}
              value={selectedCustomer}
            />
          </div>
          <div className='flex gap-3 items-center'>
            {/* <SearchComponent dataLang={dataLang} placeholder='Tìm kiếm theo phiếu' onChange={handleSearch} value={searchValue} classNameBox='!py-2 2xl:!p-2.5' /> */}
            <OnResetData sOnFetching={refetchCustomerDebt} className='!py-3' />
            <button onClick={handleExportExcel} className='!py-3 3xl:py-3 3xl:px-4 px-3 flex items-center space-x-2 bg-white hover:bg-primary-07 rounded-lg border border-background-blue-2 transition'>
              <ExcelIcon className='3xl:size-5 size-4 text-typo-blue-4' />
              <span className='text-typo-blue-4 responsive-text-sm font-medium whitespace-nowrap'>{dataLang?.client_list_exportexcel}</span>
            </button>
          </div>
        </div>
      }
      tableSection={
        isFetchingCustomerDebt ? (
          <Loading color='#0f4f9e' />
        ) : dataCustomerDebt ? (
          <div className='flex flex-col gap-4 relative h-full'>
            <div className='flex flex-col gap-1 responsive-text-sm px-4'>
              <h3>Khách hàng: {dataCustomerDebt?.debt?.client_name || '-'}</h3>
              <p>Địa chỉ: {dataCustomerDebt?.debt?.address || '-'}</p>
              <p>SĐT: {dataCustomerDebt?.debt?.phone_number || '-'}</p>
            </div>
            <Customscrollbar alwaysShowScrollbar={true} className='h-full flex-1 overflow-auto border border-[#E0E0E1]'>
              <table className='w-full border-0 p-0 m-0'>
                <thead>
                  <tr className='responsive-text-sm sticky top-0 z-50 bg-white capitalize'>
                    <th className='min-w-32 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Ngày chứng từ</div>
                    </th>
                    <th className='min-w-36 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Số chứng từ</div>
                    </th>
                    <th className='min-w-48 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Sản phẩm</div>
                    </th>
                    {/* Cột Biến thể mới thêm */}
                    <th className='min-w-36 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Biến thể</div>
                    </th>
                    <th className='min-w-24 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Đơn vị</div>
                    </th>
                    <th className='min-w-24 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Số lượng</div>
                    </th>
                    <th className='min-w-24 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Đơn giá</div>
                    </th>
                    <th className='min-w-24 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Tổng tiền</div>
                    </th>
                    <th className='min-w-24 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Chiết khấu</div>
                    </th>
                    <th className='min-w-24 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Thuế</div>
                    </th>
                    <th className='min-w-28 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-end px-3 py-2 border-b border-[#E0E0E1]'>Thành tiền sau thuế</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Công nợ đầu kỳ */}
                  <tr className='bg-gray-100 responsive-text-sm'>
                    <td colSpan={10} className='p-0 h-2 text-left text-gray-700'>
                      <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1] font-bold capitalize'>Công nợ đầu kỳ</div>
                    </td>
                    <td className='p-0 h-2 text-right font-semibold text-gray-800'>
                      <div className='w-full h-full px-3 py-2 border-b border-[#E0E0E1]'>{formatNumber(dataCustomerDebt?.raw_balance || 0)}</div>
                    </td>
                  </tr>
                  {Array.isArray(dataCustomerDebt?.deliveries) && dataCustomerDebt.deliveries.length > 0 && (
                    <>
                      <tr className='bg-blue-100 responsive-text-sm'>
                        <td colSpan={11} className='p-0 h-2 text-center text-gray-700'>
                          <div className='w-full h-full px-3 py-2 border-b border-[#E0E0E1] font-semibold uppercase'>Phiếu giao hàng</div>
                        </td>
                      </tr>
                      {/* Deliveries - summary row then items (for all orders) */}
                      {dataCustomerDebt?.deliveries?.map((delivery, dIdx) => (
                        <Fragment key={`delivery-${dIdx}`}>
                          {/* Summary row for all deliveries */}
                          <tr className='bg-blue-50 responsive-text-sm'>
                            <td className='p-0 h-2 text-center text-gray-700'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{moment(delivery?.delivery_date).format('DD/MM/YYYY') || '-'}</div>
                            </td>
                            <td className='p-0 h-2 text-center text-gray-700'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{delivery?.reference_no || '-'}</div>
                            </td>
                            <td className='p-0 h-2' colSpan={5}>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'></div>
                            </td>
                            <td className='p-0 h-2 text-right'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>
                                {Number(delivery?.total_amount_items) === 0 ? '-' : formatNumber(Number(delivery?.total_amount_items))}
                              </div>
                            </td>
                            <td className='p-0 h-2 text-center'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>
                                {Number(delivery?.total_discount_percent_items) === 0 ? '-' : formatNumber(Number(delivery?.total_discount_percent_items))}
                              </div>
                            </td>
                            <td className='p-0 h-2 text-right'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>
                                {Number(delivery?.total_tax_items) === 0 ? '-' : formatNumber(Number(delivery?.total_tax_items))}
                              </div>
                            </td>
                            <td className='p-0 h-2 text-right text-new-blue font-semibold'>
                              <div className='w-full h-full px-3 py-2 border-b border-[#E0E0E1]'>
                                {Number(delivery?.grand_total_items) === 0 ? '-' : formatNumber(Number(delivery?.grand_total_items))}
                              </div>
                            </td>
                          </tr>
                          {/* Item details */}
                          {delivery.items?.map((it, iIdx) => (
                            <tr key={`d-${dIdx}-${iIdx}`} className='hover:bg-gray-50 responsive-text-sm'>
                              <td className='p-0 h-2 text-center text-gray-700 align-middle'>
                                <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'></div>
                              </td>
                              <td className='p-0 h-2 text-center text-gray-700 align-middle'>
                                <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'></div>
                              </td>
                              <td className='p-0 h-2 text-left text-gray-700 align-middle'>
                                <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{it?.item_name || it?.item_code || '-'}</div>
                              </td>
                              {/* Cột Biến thể mới thêm */}
                              <td className='p-0 h-2 text-left text-gray-700 align-middle'>
                                <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{it?.variant_name || '-'}</div>
                              </td>
                              <td className='p-0 h-2 text-center text-gray-700 align-middle'>
                                <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{it?.unit_name || '-'}</div>
                              </td>
                              <td className='p-0 h-2 text-center text-gray-700 align-middle'>
                                <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{Number(it?.quantity) === 0 ? '-' : formatNumber(Number(it?.quantity))}</div>
                              </td>
                              <td className='p-0 h-2 text-center text-gray-700 align-middle'>
                                <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{Number(it?.price) === 0 ? '-' : formatNumber(Number(it?.price))}</div>
                              </td>
                              <td className='p-0 h-2 text-right text-gray-700 align-middle'>
                                <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{Number(it?.amount) === 0 ? '-' : formatNumber(Number(it?.amount))}</div>
                              </td>
                              <td className='p-0 h-2 text-center text-gray-700 align-middle'>
                                <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>
                                  {Number(it?.discount_percent_amount_item) === 0 ? '-' : formatNumber(Number(it?.discount_percent_amount_item))}
                                </div>
                              </td>
                              <td className='p-0 h-2 text-right text-gray-700 align-middle'>
                                <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{Number(it?.tax_amount_item) === 0 ? '-' : formatNumber(Number(it?.tax_amount_item))}</div>
                              </td>
                              <td className='p-0 h-2 text-right text-gray-700 align-middle'>
                                <div className='w-full h-full px-3 py-2 border-b border-[#E0E0E1] font-medium'>{Number(it?.total_amount) === 0 ? '-' : formatNumber(Number(it?.total_amount))}</div>
                              </td>
                            </tr>
                          ))}
                        </Fragment>
                      ))}
                      <tr className='bg-blue-50  responsive-text-sm'>
                        <td colSpan={5} className='p-0 h-2 font-semibold text-gray-700'>
                          <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1] capitalize'>Tổng cộng</div>
                        </td>
                        <td className='p-0 h-2 text-center font-semibold text-new-blue'>
                          <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>
                            {formatNumber(dataCustomerDebt?.deliveries?.reduce((acc, curr) => acc + Number(curr?.total_quantity), 0) || 0)}
                          </div>
                        </td>
                        <td colSpan={4} className='p-0 h-2 text-right font-semibold text-gray-700'>
                          <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'></div>
                        </td>
                        <td className='p-0 h-2 text-right font-semibold text-new-blue'>
                          <div className='w-full h-full px-3 py-2 border-b border-[#E0E0E1]'>{formatNumber(dataCustomerDebt?.total_deliveries || 0)}</div>
                        </td>
                      </tr>
                    </>
                  )}

                  {Array.isArray(dataCustomerDebt?.returns) && dataCustomerDebt.returns.length > 0 && (
                    <>
                      <tr className='bg-amber-100 responsive-text-sm'>
                        <td colSpan={11} className='p-0 h-2 text-center text-gray-700'>
                          <div className='w-full h-full px-3 py-2 border-b border-[#E0E0E1] font-semibold uppercase'>Trả lại hàng bán</div>
                        </td>
                      </tr>
                      {/* Returns items - từng item */}
                      {dataCustomerDebt?.returns?.map((ret, rIdx) => (
                        <Fragment key={`return-${rIdx}`}>
                          {/* Summary row for all returns */}
                          <tr className='bg-amber-50 responsive-text-sm'>
                            <td className='p-0 h-2 text-center text-gray-700'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{moment(ret?.date).format('DD/MM/YYYY') || '-'}</div>
                            </td>
                            <td className='p-0 h-2 text-center text-gray-700'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{ret?.reference_no || '-'}</div>
                            </td>
                            <td className='p-0 h-2' colSpan={5}>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'></div>
                            </td>
                            <td className='p-0 h-2 text-right'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>
                                {Number(ret?.total_amount_items) === 0 ? '-' : formatNumber(Number(ret?.total_amount_items))}
                              </div>
                            </td>
                            <td className='p-0 h-2 text-center'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>
                                {Number(ret?.total_discount_percent_items) === 0 ? '-' : formatNumber(Number(ret?.total_discount_percent_items))}
                              </div>
                            </td>
                            <td className='p-0 h-2 text-right'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{Number(ret?.total_tax_items) === 0 ? '-' : formatNumber(Number(ret?.total_tax_items))}</div>
                            </td>
                            <td className='p-0 h-2 text-right font-semibold text-orange-600'>
                              <div className='w-full h-full px-3 py-2 border-b border-[#E0E0E1]'>{Number(ret?.grand_total_items) === 0 ? '-' : formatNumber(Number(ret?.grand_total_items))}</div>
                            </td>
                          </tr>
                          {/* Item details */}
                          {ret.items?.map((it, iIdx) => (
                            <tr key={`r-${rIdx}-${iIdx}`} className='hover:bg-gray-50 responsive-text-sm'>
                              <td className='p-0 h-2 text-center text-gray-700 align-middle'>
                                <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'></div>
                              </td>
                              <td className='p-0 h-2 text-center text-gray-700 align-middle'>
                                <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'></div>
                              </td>
                              <td className='p-0 h-2 text-left text-gray-700 align-middle'>
                                <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{it?.item_name || it?.item_code || '-'}</div>
                              </td>
                              <td className='p-0 h-2 text-left text-gray-700 align-middle'>
                                <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{it?.variant_name || '-'}</div>
                              </td>
                              <td className='p-0 h-2 text-center text-gray-700 align-middle'>
                                <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{it?.unit_name || '-'}</div>
                              </td>
                              <td className='p-0 h-2 text-center text-gray-700 align-middle'>
                                <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{Number(it?.quantity) === 0 ? '-' : formatNumber(Number(it?.quantity))}</div>
                              </td>
                              <td className='p-0 h-2 text-center text-gray-700 align-middle'>
                                <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{Number(it?.price) === 0 ? '-' : formatNumber(Number(it?.price))}</div>
                              </td>
                              <td className='p-0 h-2 text-right text-gray-700 align-middle'>
                                <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{Number(it?.amount) === 0 ? '-' : formatNumber(Number(it?.amount))}</div>
                              </td>
                              <td className='p-0 h-2 text-center text-gray-700 align-middle'>
                                <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>
                                  {Number(it?.discount_percent_amount_item) === 0 ? '-' : formatNumber(Number(it?.discount_percent_amount_item))}
                                </div>
                              </td>
                              <td className='p-0 h-2 text-right text-gray-700 align-middle'>
                                <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{Number(it?.tax_price) === 0 ? '-' : formatNumber(Number(it?.tax_price))}</div>
                              </td>
                              <td className='p-0 h-2 text-right text-gray-700 align-middle'>
                                <div className='w-full h-full px-3 py-2 border-b border-[#E0E0E1] font-medium'>{Number(it?.total_amount) === 0 ? '-' : formatNumber(Number(it?.total_amount))}</div>
                              </td>
                            </tr>
                          ))}
                        </Fragment>
                      ))}
                      <tr className='bg-amber-50 responsive-text-sm'>
                        <td colSpan={5} className='p-0 h-2 font-semibold text-gray-700'>
                          <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1] capitalize'>Tổng cộng</div>
                        </td>
                        <td className='p-0 h-2 text-center font-semibold text-new-blue'>
                          <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>
                            {formatNumber(dataCustomerDebt?.returns?.reduce((acc, curr) => acc + Number(curr?.total_quantity), 0) || 0)}
                          </div>
                        </td>
                        <td colSpan={4} className='p-0 h-2 text-right font-semibold text-gray-700'>
                          <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'></div>
                        </td>
                        <td className='p-0 h-2 text-right font-semibold text-orange-600'>
                          <div className='w-full h-full px-3 py-2 border-b border-[#E0E0E1]'>{formatNumber(dataCustomerDebt.total_returns || 0)}</div>
                        </td>
                      </tr>
                    </>
                  )}

                  <tr className='bg-gray-100 responsive-text-sm'>
                    <td colSpan={10} className='p-0 h-2 text-left text-gray-700'>
                      <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1] font-semibold capitalize'>Tổng cộng phát sinh trong kỳ</div>
                    </td>
                    <td className='p-0 h-2 text-right font-semibold text-new-blue'>
                      <div className='w-full h-full px-3 py-2 border-b border-[#E0E0E1]'>{formatNumber(dataCustomerDebt.total_deliveries - dataCustomerDebt.total_returns || 0)}</div>
                    </td>
                  </tr>

                  {/* Phiếu khác trong kỳ */}
                  {Array.isArray(dataCustomerDebt?.other_payslips_coupon) && dataCustomerDebt.other_payslips_coupon.length > 0 && (
                    <>
                      <tr className='bg-emerald-500/80 responsive-text-sm'>
                        <td colSpan={11} className='p-0 h-2 text-center text-gray-700'>
                          <div className='w-full h-full px-3 py-2 border-b border-[#E0E0E1] font-semibold uppercase'>Phiếu thu trong kỳ</div>
                        </td>
                      </tr>
                      <tr className='bg-emerald-100 responsive-text-sm'>
                        <td className='p-0 h-2 font-semibold text-center text-gray-700'>
                          <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>Ngày chứng từ</div>
                        </td>
                        <td className='p-0 h-2 font-semibold text-center text-gray-700'>
                          <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>Mã phiếu</div>
                        </td>
                        <td className='p-0 h-2 font-semibold text-gray-700' colSpan={8}>
                          <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>Ghi chú</div>
                        </td>
                        <td className='p-0 h-2 text-right font-semibold text-gray-700'>
                          <div className='w-full h-full px-3 py-2 border-b border-[#E0E0E1]'>Số tiền</div>
                        </td>
                      </tr>

                      {dataCustomerDebt.other_payslips_coupon.map((cp, cIdx) => (
                        <tr key={`coupon-${cIdx}`} className='hover:bg-gray-50 responsive-text-sm'>
                          <td className='p-0 h-2 text-center text-gray-700'>
                            <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{cp?.date ? moment(cp.date).format('DD/MM/YYYY') : '-'}</div>
                          </td>
                          <td className='p-0 h-2 text-center text-gray-700'>
                            <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{cp?.code || '-'}</div>
                          </td>
                          <td className='p-0 h-2' colSpan={8}>
                            <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{cp?.note || '-'}</div>
                          </td>
                          <td className='p-0 h-2 text-right text-gray-700'>
                            <div className='w-full h-full px-3 py-2 border-b border-[#E0E0E1]'>{Number(cp?.total) ? formatNumber(Number(cp?.total)) : '-'}</div>
                          </td>
                        </tr>
                      ))}

                      {/* Tổng tiền phiếu khác trong kỳ */}
                      <tr className='bg-emerald-100 responsive-text-sm'>
                        <td colSpan={10} className='p-0 h-2 font-semibold text-gray-700'>
                          <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1] capitalize'>Tổng cộng</div>
                        </td>
                        <td className='p-0 h-2 text-right font-semibold text-gray-700'>
                          <div className='w-full h-full px-3 py-2 border-b border-[#E0E0E1]'>{formatNumber(dataCustomerDebt?.total_other_payslips_coupon || 0)}</div>
                        </td>
                      </tr>
                    </>
                  )}

                  {/* Số dư cuối kỳ */}
                  <tr className='bg-gray-100 responsive-text-sm'>
                    <td colSpan={10} className='p-0 h-2 font-bold text-gray-800'>
                      <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1] capitalize'>Số dư cuối kỳ</div>
                    </td>
                    <td className='p-0 h-2 text-right font-bold text-new-blue'>
                      <div className='w-full h-full px-3 py-2 border-b border-[#E0E0E1]'>{formatNumber(dataCustomerDebt?.final_debt || 0)}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Customscrollbar>
          </div>
        ) : !selectedCustomer ? (
          <div className='flex flex-col items-center justify-center h-full'>
            <Image src='/background/system/reportCustomer.webp' alt='Không có dữ liệu' width={165} height={100} priority unoptimized/>
            <div className='flex items-center gap-2 mt-2'>
              <FaPlus color='#000' className='size-4' />
              <p className='responsive-text-xl font-semibold text-neutral-05'>Chọn khách hàng</p>
            </div>
            <p className='responsive-text-lg text-neutral-03 mt-2'>{noDataTitle}</p>
          </div>
        ) : (
          <NoData titleText={noDataTitle} type='report' classNameImage='w-[245px]' />
        )
      }
    />
  );
};

export default CustomerDebt;
