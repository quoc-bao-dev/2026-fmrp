import SaleIcon from '@/components/icons/common/SaleIcon';
import ReportLayout from '@/components/layout/ReportLayout';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { usePersistedBranches } from '@/hooks/common/usePersistedBranches';
import useStatusExprired from '@/hooks/useStatusExprired';
import formatNumber from '@/utils/helpers/formatnumber';
import { useState } from 'react';
import QuickDateDropdown, { getDateRangeByQuickValue } from '../../components/QuickDateDropdown';
import { useGetProductionSummary } from './hook';
import MainMaterialStock from './MainMaterialStock';
import OrderCompletionDonut from './OrderCompletionDonut';
import ProductionOrderStatusDonut from './ProductionOrderStatusDonut';
import ProductionTrackingChart from './ProductionTrackingChart';

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

  const { data: productionSummary } = useGetProductionSummary({ start_date: dateRange.start_date, end_date: dateRange.end_date, branch_ids: selectedBranches });

  // Normalize dữ liệu theo nhiều khả năng tên field khác nhau từ API
  const completion = {
    percent: productionSummary?.completion_rate_percent ?? productionSummary?.plan_completion?.percent ?? 92.5,
    actual: productionSummary?.completion_actual ?? productionSummary?.plan_completion?.actual ?? 1850,
    planned: productionSummary?.completion_planned ?? productionSummary?.plan_completion?.planned ?? 2000,
  };
  const lateOrders = {
    count: productionSummary?.late_orders_count ?? productionSummary?.late_orders?.count ?? 8,
    totalRunning: productionSummary?.total_running_orders ?? productionSummary?.late_orders?.total_running ?? 185,
  };
  const qc = {
    percent: productionSummary?.qc_error_percent ?? productionSummary?.qc?.error_percent ?? 2.1,
    defects: productionSummary?.qc_defects ?? productionSummary?.qc?.defects ?? 39,
    finished: productionSummary?.qc_finished ?? productionSummary?.qc?.finished ?? 1850,
  };
  const oee = {
    percent: productionSummary?.oee_percent ?? productionSummary?.oee?.percent ?? 78,
    lines: productionSummary?.oee_lines ?? productionSummary?.oee?.lines ?? 5,
  };

  const kpiItems = [
    {
      key: 'completion',
      label: 'Hoàn thành kế hoạch',
      containerBg: '#DCFCE7',
      iconBg: '#14B32E',
      labelColor: '#14B32E',
      valueText: () => `${formatNumber(completion.percent)}%`,
      subText: () => `Thực tế: ${formatNumber(completion.actual)}/ Kế hoạch: ${formatNumber(completion.planned)} SP`,
    },
    {
      key: 'late_orders',
      label: 'Lệnh sản xuất trễ hạn',
      containerBg: '#FFE2E5',
      iconBg: '#FA5A7D',
      labelColor: '#FA5A7D',
      valueText: () => `${formatNumber(lateOrders.count)}`,
      subText: () => `Tổng số ${formatNumber(lateOrders.totalRunning)} lệnh đang chạy`,
    },
    {
      key: 'qc_rate',
      label: 'Tỷ lệ lỗi (QC)',
      containerBg: '#FFF4DE',
      iconBg: '#FF947A',
      labelColor: '#FF947A',
      valueText: () => `${formatNumber(qc.percent)}%`,
      subText: () => `${formatNumber(qc.defects)} SP lỗi/${formatNumber(qc.finished)} SP hoàn thành`,
    },
    {
      key: 'oee',
      label: 'Hiệu suất TB tổng thể (OEE)',
      containerBg: '#F3E8FF',
      iconBg: '#BF83FF',
      labelColor: '#BF83FF',
      valueText: () => `${formatNumber(oee.percent)}%`,
      subText: () => `Trung bình ${formatNumber(oee.lines)} chuyền chính`,
    },
  ];

  return (
    <ReportLayout
      title={'Tổng quan sản xuất'}
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
      <Customscrollbar alwaysShowScrollbar={true} className='h-full'>
        <div className='h-full px-3 flex flex-col gap-4'>
          <div className='grid grid-cols-4 gap-4 h-fit'>
            {kpiItems.map(item => (
              <div key={item.key} className='flex flex-col gap-2 rounded-2xl shadow-[0px_1px_8px_0px_#00000012] py-3 px-4 2xl:px-6' style={{ backgroundColor: item.containerBg }}>
                <div className='flex gap-2 items-center'>
                  <div className='rounded-full p-2' style={{ backgroundColor: item.iconBg }}>
                    <SaleIcon className='w-6 h-6' />
                  </div>
                  <h3 className='responsive-text-lg font-medium capitalize text-[#3A3A3A]'>{item.label}</h3>
                </div>
                <p className='responsive-text-3xl font-semibold whitespace-nowrap' style={{ color: item.labelColor }}>
                  {item.valueText()}
                </p>
                <p className='responsive-text-sm text-[#6B7280]'>{item.subText()}</p>
              </div>
            ))}
          </div>
          <div className='grid grid-cols-2 gap-4 h-full min-h-0'>
            <ProductionOrderStatusDonut completed={30} running={30} late={15} notStarted={25} centerLabel={'Tháng 10'} />
            <ProductionTrackingChart />
            <MainMaterialStock />
            <OrderCompletionDonut onTimePercent={40} />
          </div>
        </div>
      </Customscrollbar>
    </ReportLayout>
  );
};

export default Dashboard;
