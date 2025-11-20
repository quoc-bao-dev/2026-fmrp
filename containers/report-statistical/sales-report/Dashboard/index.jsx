import ReportLayout from '@/components/layout/ReportLayout';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { usePersistedBranches } from '@/hooks/common/usePersistedBranches';
import useStatusExprired from '@/hooks/useStatusExprired';
import formatNumber from '@/utils/helpers/formatnumber';
import { useState } from 'react';
import { Tooltip } from 'react-tippy';
import QuickDateDropdown, { getDateRangeByQuickValue } from '../../components/QuickDateDropdown';
import CompletionDonut from './CompletionDonut';
import CustomerTypeSales from './CustomerTypeSales';
import DebtChart from './DebtChart';
import { useGetCustomerTypeSales, useGetDebtTrend, useGetMonthlyReorderRate, useGetOrderCompletionRate, useGetProductGroupRevenue, useGetSalesSummary } from './hook';
import RepeatOrderDonut from './RepeatOrderDonut';
import RevenueStructurePie from './RevenueStructurePie';
import { SaleIcon } from '@/components/icons';

const breadcrumbItems = [
  {
    label: `Báo cáo`,
  },
  {
    label: `Báo cáo bán hàng`,
  },
  {
    label: `Tổng quan bán hàng`,
    href: '/report-statistical/sales-report/dashboard',
  },
];

// Hàm format số lớn thành dạng viết tắt (chỉ format từ 1 tỷ trở lên)
const formatLargeNumber = num => {
  if (!num && num !== 0) return '0';
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (absNum >= 1000000000000) {
    return `${sign}${(absNum / 1000000000000).toFixed(1)}T`;
  }
  if (absNum >= 1000000000) {
    return `${sign}${(absNum / 1000000000).toFixed(1)}B`;
  }

  return null; // Trả về null nếu không cần format
};

// Hàm format số: nếu >= 1 tỷ thì dùng formatLargeNumber, còn lại dùng formatNumber
const formatKpiValue = num => {
  const absNum = Math.abs(num || 0);
  if (absNum >= 1000000000) {
    return { value: formatLargeNumber(num), showUnit: false };
  }
  return { value: formatNumber(num), showUnit: true };
};

const Dashboard = () => {
  const statusExprired = useStatusExprired();
  const [quickDate, setQuickDate] = useState('this_week');
  const [dateRange, setDateRange] = useState(() => getDateRangeByQuickValue('this_week'));
  const { selectedBranches, setSelectedBranches } = usePersistedBranches();

  const { data: salesSummary, refetch: refetchSalesSummary } = useGetSalesSummary({ start_date: dateRange.start_date, end_date: dateRange.end_date, branch_ids: selectedBranches });
  const { data: debtTrend, refetch: refetchDebtTrend } = useGetDebtTrend({ start_date: dateRange.start_date, end_date: dateRange.end_date, branch_ids: selectedBranches });
  const { data: productGroupRevenue, refetch: refetchProductGroupRevenue } = useGetProductGroupRevenue({
    start_date: dateRange.start_date,
    end_date: dateRange.end_date,
    branch_ids: selectedBranches,
  });
  const { data: orderCompletionRate, refetch: refetchOrderCompletionRate } = useGetOrderCompletionRate({ start_date: dateRange.start_date, end_date: dateRange.end_date, branch_ids: selectedBranches });
  const { data: customerTypeSales, refetch: refetchCustomerTypeSales } = useGetCustomerTypeSales({ start_date: dateRange.start_date, end_date: dateRange.end_date, branch_ids: selectedBranches });
  const { data: monthlyReorderRate, refetch: refetchMonthlyReorderRate } = useGetMonthlyReorderRate({ start_date: dateRange.start_date, end_date: dateRange.end_date, branch_ids: selectedBranches });

  // const reload = () => {
  //   refetchSalesSummary();
  //   refetchDebtTrend();
  //   refetchProductGroupRevenue();
  //   refetchOrderCompletionRate();
  //   refetchCustomerTypeSales();
  //   refetchMonthlyReorderRate();
  // };

  const kpiItems = [
    {
      key: 'orders',
      label: 'Doanh thu',
      containerBg: '#DCFCE7',
      iconBg: '#14B32E',
      labelColor: '#14B32E',
      value: () => formatKpiValue(salesSummary?.orders || 0),
      rawValue: () => salesSummary?.orders || 0,
    },
    {
      key: 'deliveries',
      label: 'Xuất giao',
      containerBg: '#FFE2E5',
      iconBg: '#FA5A7D',
      labelColor: '#FA5A7D',
      value: () => formatKpiValue(salesSummary?.deliveries || 0),
      rawValue: () => salesSummary?.deliveries || 0,
    },
    {
      key: 'other_payslips_coupon',
      label: 'Thu tiền',
      containerBg: '#FFF4DE',
      iconBg: '#FF947A',
      labelColor: '#FF947A',
      value: () => formatKpiValue(salesSummary?.other_payslips_coupon || 0),
      rawValue: () => salesSummary?.other_payslips_coupon || 0,
    },
    {
      key: 'debt',
      label: 'Công nợ',
      containerBg: '#F3E8FF',
      iconBg: '#BF83FF',
      labelColor: '#BF83FF',
      value: () => formatKpiValue(salesSummary?.debt || 0),
      rawValue: () => salesSummary?.debt || 0,
    },
  ];

  return (
    <ReportLayout
      title={'Tổng quan bán hàng'}
      statusExprired={statusExprired}
      breadcrumbItems={breadcrumbItems}
      maginBottom={true}
      filterHeader={
        <div className='flex items-center gap-2'>
          {/* <button className='responsive-text-sm text-[#3A3E4C] font-semibold capitalize' onClick={reload}>
            Tải lại
          </button> */}
          <p className='responsive-text-base text-[#3A3E4C] font-semibold capitalize'>Lọc theo</p>
          <QuickDateDropdown
            value={quickDate}
            onChange={range => {
              setQuickDate(range.value);
              setDateRange(range);
            }}
          />
        </div>
      }
      branchValue={selectedBranches}
      onBranchChange={setSelectedBranches}
      onBranchClear={() => setSelectedBranches([])}
    >
      <Customscrollbar alwaysShowScrollbar={true} className='h-full'>
        <div className='h-full px-3 flex flex-col gap-4'>
          {/* Hàng 1 */}
          <div className='grid grid-cols-5 gap-4 h-full'>
            <div className='col-span-3 h-full'>
              <div className='grid h-full grid-rows-10 gap-3'>
                <div className='row-span-3 grid grid-cols-4 gap-3'>
                  {kpiItems.map(item => {
                    const formatted = item.value();
                    const rawValue = item.rawValue();
                    const displayValue = formatted.showUnit ? `${formatted.value} đ` : formatted.value;
                    const tooltipContent = `${formatNumber(rawValue)} đ`;
                    const shouldShowTooltip = Math.abs(rawValue) >= 1000000000;

                    const valueElement = <p className={`responsive-text-lg text-[#425166] w-fit font-medium whitespace-nowrap ${shouldShowTooltip ? 'cursor-pointer' : ''}`}>{displayValue}</p>;

                    return (
                      <div key={item.key} className={`flex flex-col gap-3 rounded-2xl shadow-[0px_1px_8px_0px_#00000012] py-3 px-4 2xl:px-6`} style={{ backgroundColor: item.containerBg }}>
                        <div className='flex gap-2 items-center'>
                          <div className='rounded-full p-2' style={{ backgroundColor: item.iconBg }}>
                            <SaleIcon className='w-6 h-6' />
                          </div>
                          <h3 className='responsive-text-sm font-medium capitalize' style={{ color: item.labelColor }}>
                            {item.label}
                          </h3>
                        </div>
                        {shouldShowTooltip ? (
                          <Tooltip title={tooltipContent} arrow theme='dark' className='w-fit'>
                            {valueElement}
                          </Tooltip>
                        ) : (
                          valueElement
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className='row-span-7 rounded-[20px] h-[280px] 2xl:h-[320px] bg-[#EEF6FF] p-4 flex flex-col'>
                  <h2 className='text-center font-semibold responsive-text-xl text-neutral-04 capitalize'>Công Nợ</h2>
                  <DebtChart debtTrend={debtTrend} />
                </div>
              </div>
            </div>
            <div className='col-span-2 h-full min-h-0'>
              <RevenueStructurePie data={productGroupRevenue}/>
            </div>
          </div>
          {/* Hàng 2 */}
          <div className='grid grid-cols-3 gap-4 h-[400px] min-h-[400px]'>
            <div className='rounded-[20px] h-full'>
              <CompletionDonut data={orderCompletionRate}/>
            </div>
            <div className='rounded-[20px] h-full'>
              <CustomerTypeSales data={customerTypeSales}/>
            </div>
            <div className='rounded-[20px] h-full'>
              <RepeatOrderDonut dataRepeatRate={monthlyReorderRate}/>
            </div>
          </div>
        </div>
      </Customscrollbar>
    </ReportLayout>
  );
};

export default Dashboard;
