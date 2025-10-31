import SaleIcon from '@/components/icons/common/SaleIcon';
import ReportLayout from '@/components/layout/ReportLayout';
import { usePersistedBranches } from '@/hooks/common/usePersistedBranches';
import useStatusExprired from '@/hooks/useStatusExprired';
import { useState } from 'react';
import QuickDateDropdown, { getDateRangeByQuickValue } from '../../components/QuickDateDropdown';
import CompletionDonut from './CompletionDonut';
import CustomerTypeSales from './CustomerTypeSales';
import DebtChart from './DebtChart';
import { useGetSalesSummary } from './hook';
import RepeatOrderDonut from './RepeatOrderDonut';
import RevenueStructurePie from './RevenueStructurePie';
import formatNumber from '@/utils/helpers/formatnumber';

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

const Dashboard = () => {
  const statusExprired = useStatusExprired();
  const [quickDate, setQuickDate] = useState('this_week');
  const [dateRange, setDateRange] = useState(() => getDateRangeByQuickValue('this_week'));
  const { selectedBranches, setSelectedBranches } = usePersistedBranches();

  const { data: salesSummary } = useGetSalesSummary({ start_date: dateRange.start_date, end_date: dateRange.end_date, branch_ids: selectedBranches });

  const kpiItems = [
    {
      key: 'orders',
      label: 'Doanh thu',
      containerBg: '#DCFCE7',
      iconBg: '#14B32E',
      labelColor: '#14B32E',
      value: () => formatNumber(salesSummary?.orders),
    },
    {
      key: 'deliveries',
      label: 'Xuất giao',
      containerBg: '#FFE2E5',
      iconBg: '#FA5A7D',
      labelColor: '#FA5A7D',
      value: () => formatNumber(salesSummary?.deliveries),
    },
    {
      key: 'other_payslips_coupon',
      label: 'Thu tiền',
      containerBg: '#FFF4DE',
      iconBg: '#FF947A',
      labelColor: '#FF947A',
      value: () => formatNumber(salesSummary?.other_payslips_coupon),
    },
    {
      key: 'debt',
      label: 'Công nợ',
      containerBg: '#F3E8FF',
      iconBg: '#BF83FF',
      labelColor: '#BF83FF',
      value: () => formatNumber(salesSummary?.debt),
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
      <div className='h-full px-3'>
        <div className='grid grid-rows-2 gap-4 h-full min-h-0'>
          {/* Hàng 1 */}
          <div className='grid grid-cols-5 gap-4 h-full'>
            <div className='col-span-3 h-full'>
              <div className='grid h-full grid-rows-10 gap-3'>
                <div className='row-span-3 grid grid-cols-4 gap-3'>
                  {kpiItems.map(item => (
                    <div key={item.key} className={`flex flex-col gap-3 rounded-2xl shadow-[0px_1px_8px_0px_#00000012] py-3 px-4 2xl:px-6`} style={{ backgroundColor: item.containerBg }}>
                      <div className='flex gap-2 items-center'>
                        <div className='rounded-full p-2' style={{ backgroundColor: item.iconBg }}>
                          <SaleIcon className='w-6 h-6' />
                        </div>
                        <h3 className='responsive-text-sm font-medium capitalize' style={{ color: item.labelColor }}>{item.label}</h3>
                      </div>
                      <p className='responsive-text-lg text-[#425166] font-medium whitespace-nowrap'>{item.value()} đ</p>
                    </div>
                  ))}
                </div>
                <div className='row-span-7 rounded-[20px] bg-[#EEF6FF] p-4 flex flex-col'>
                  <h2 className='text-center font-semibold responsive-text-xl text-neutral-04 capitalize'>Công Nợ</h2>
                  <DebtChart />
                </div>
              </div>
            </div>
            <div className='col-span-2 h-full min-h-0'>
              <RevenueStructurePie />
            </div>
          </div>
          {/* Hàng 2 */}
          <div className='grid grid-cols-3 gap-4 h-full'>
            <div className='rounded-[20px] h-full'>
              <CompletionDonut percent={70} />
            </div>
            <div className='rounded-[20px] h-full'>
              <CustomerTypeSales />
            </div>
            <div className='rounded-[20px] h-full'>
              <RepeatOrderDonut repeatPercent={40} />
            </div>
          </div>
        </div>
      </div>
    </ReportLayout>
  );
};

export default Dashboard;
