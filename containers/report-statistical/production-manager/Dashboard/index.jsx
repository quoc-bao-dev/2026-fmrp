import CompleteKH from '@/components/icons/common/CompleteKH';
import ErrorQCIcon from '@/components/icons/common/ErrorQC';
import LateLSXIcon from '@/components/icons/common/LateLSX';
import SaleIcon from '@/components/icons/common/SaleIcon';
import ReportLayout from '@/components/layout/ReportLayout';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { usePersistedBranches } from '@/hooks/common/usePersistedBranches';
import useStatusExprired from '@/hooks/useStatusExprired';
import formatNumber from '@/utils/helpers/formatnumber';
import { useState } from 'react';
import QuickDateDropdown, { getDateRangeByQuickValue } from '../../components/QuickDateDropdown';
import {
  useGetLateManufacturingOrders,
  useGetMainMaterialStock,
  useGetMainMaterialStockInfinite,
  useGetManufacturingOrderCompletionClassification,
  useGetManufacturingOrderStatus,
  useGetManufacturingPlanCompletion,
  useGetOee,
  useGetQcErrorRate,
  useGetTrackProduction,
} from './hook';
import MainMaterialStock from './MainMaterialStock';
import OrderCompletionDonut from './OrderCompletionDonut';
import ProductionOrderStatusDonut from './ProductionOrderStatusDonut';
import ProductionTrackingChart from './ProductionTrackingChart';

const breadcrumbItems = [
  {
    label: `Báo cáo`,
  },
  {
    label: `Tổng quan sản xuất`,
    href: '/report-statistical/production-manager/dashboard',
  },
];

const Dashboard = () => {
  const statusExprired = useStatusExprired();
  const [quickDate, setQuickDate] = useState('this_week');
  const [dateRange, setDateRange] = useState(() => getDateRangeByQuickValue('this_week'));
  const { selectedBranches, setSelectedBranches } = usePersistedBranches();

  const { data: manufacturingPlanCompletion, refetch: refetchManufacturingPlanCompletion } = useGetManufacturingPlanCompletion({
    start_date: dateRange.start_date,
    end_date: dateRange.end_date,
    branch_ids: selectedBranches,
  });
  const { data: lateManufacturingOrders, refetch: refetchLateManufacturingOrders } = useGetLateManufacturingOrders({
    start_date: dateRange.start_date,
    end_date: dateRange.end_date,
    branch_ids: selectedBranches,
  });
  const { data: qcErrorRate, refetch: refetchQcErrorRate } = useGetQcErrorRate({ start_date: dateRange.start_date, end_date: dateRange.end_date, branch_ids: selectedBranches });
  const { data: oee, refetch: refetchOee } = useGetOee({ start_date: dateRange.start_date, end_date: dateRange.end_date, branch_ids: selectedBranches });
  const { data: manufacturingOrderStatus, refetch: refetchManufacturingOrderStatus } = useGetManufacturingOrderStatus({
    start_date: dateRange.start_date,
    end_date: dateRange.end_date,
    branch_ids: selectedBranches,
  });

  const { data: trackProduction, refetch: refetchTrackProduction } = useGetTrackProduction({ start_date: dateRange.start_date, end_date: dateRange.end_date, branch_ids: selectedBranches });
  const { data: manufacturingOrderCompletionClassification, refetch: refetchManufacturingOrderCompletionClassification } = useGetManufacturingOrderCompletionClassification({
    start_date: dateRange.start_date,
    end_date: dateRange.end_date,
    branch_ids: selectedBranches,
  });

  const { data: mainMaterialStock, refetch: refetchMainMaterialStock } = useGetMainMaterialStock({ start_date: dateRange.start_date, end_date: dateRange.end_date, branch_ids: selectedBranches });

  // Infinite cho tồn kho vật tư chính theo id_last
  const {
    data: mainMaterialStockPages,
    fetchNextPage: fetchNextMainMaterialStock,
    hasNextPage: hasNextMainMaterialStock,
    isFetchingNextPage: isFetchingNextMainMaterialStock,
    refetch: refetchMainMaterialStockInfinite,
  } = useGetMainMaterialStockInfinite({ start_date: dateRange.start_date, end_date: dateRange.end_date, branch_ids: selectedBranches });
console.log(hasNextMainMaterialStock)
  const mergedMainMaterialStock = {
    ...mainMaterialStockPages?.pages?.[0],
    data: {
      materials: (mainMaterialStockPages?.pages || []).flatMap(p => p?.materials || [])
    }
  };

  const reload = () => {
    refetchManufacturingPlanCompletion();
    refetchLateManufacturingOrders();
    refetchQcErrorRate();
    refetchOee();
    refetchManufacturingOrderStatus();
    refetchTrackProduction();
    refetchManufacturingOrderCompletionClassification();
    refetchMainMaterialStock();
    refetchMainMaterialStockInfinite();
  };

  // Map quickDate value sang label
  const getQuickDateLabel = value => {
    const labelMap = {
      today: 'Hôm nay',
      this_week: 'Tuần này',
      this_month: 'Tháng này',
      this_quarter: 'Quý này',
      this_year: 'Năm nay',
      last_year: 'Năm trước',
    };
    return labelMap[value] || 'Tháng 8';
  };

  // Map quickDate value sang label so sánh
  const getComparisonLabel = value => {
    const comparisonMap = {
      today: 'So với hôm qua',
      this_week: 'So với tuần trước',
      this_month: 'So với tháng trước',
      this_quarter: 'So với quý trước',
      this_year: 'So với năm trước',
      last_year: 'So với 2 năm trước',
    };
    return comparisonMap[value] || '';
  };

  const kpiItems = [
    {
      key: 'completion',
      icon: <CompleteKH className='w-6 h-6' />,
      label: 'Hoàn thành kế hoạch',
      containerBg: '#DCFCE7',
      iconBg: '#14B32E',
      labelColor: '#14B32E',
      valueText: () => `${formatNumber(manufacturingPlanCompletion?.percent ?? 0)}%`,
      subText: () => `Thực tế: ${formatNumber(manufacturingPlanCompletion?.actual ?? 0)}/ Kế hoạch: ${formatNumber(manufacturingPlanCompletion?.plan ?? 0)} SP`,
    },
    {
      key: 'late_orders',
      icon: <LateLSXIcon className='w-6 h-6' />,
      label: 'Lệnh sản xuất trễ hạn',
      containerBg: '#FFE2E5',
      iconBg: '#FA5A7D',
      labelColor: '#FA5A7D',
      valueText: () => `${formatNumber(lateManufacturingOrders?.late_count ?? 0)}`,
      subText: () => `Tổng số ${formatNumber(lateManufacturingOrders?.total_running ?? 0)} lệnh đang chạy`,
    },
    {
      key: 'qc_rate',
      icon: <ErrorQCIcon className='w-6 h-6' />,
      label: 'Tỷ lệ lỗi (QC)',
      containerBg: '#FFF4DE',
      iconBg: '#FF947A',
      labelColor: '#FF947A',
      valueText: () => `${formatNumber(qcErrorRate?.avg_error_rate_percent ?? 0)}%`,
      subText: () => `${formatNumber(qcErrorRate?.total_error ?? 0)} SP lỗi/${formatNumber(qcErrorRate?.total_completed ?? 0)} SP hoàn thành`,
    },
    {
      key: 'oee',
      icon: <SaleIcon className='w-6 h-6' />,
      label: 'Hiệu suất TB tổng thể (OEE)',
      containerBg: '#F3E8FF',
      iconBg: '#BF83FF',
      labelColor: '#BF83FF',
      valueText: () => `${formatNumber(oee?.oee_diff ?? 0)}%`,
      subText: () => getComparisonLabel(quickDate),
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
          <button className='bg-white border border-gray-200 rounded-md px-2 py-1 responsive-text-sm text-[#3A3E4C] font-semibold capitalize' onClick={reload}>
            Tải lại
          </button>
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
                    {item.icon}
                  </div>
                  <h3 className='responsive-text-lg font-medium capitalize text-[#3A3A3A]'>{item.label}</h3>
                </div>
                <p className='responsive-text-3xl font-semibold whitespace-nowrap' style={{ color: item.labelColor }}>
                  {item?.valueText?.()}
                </p>
                <p className='responsive-text-sm text-[#6B7280]'>{item?.subText?.()}</p>
              </div>
            ))}
          </div>
          <div className='grid grid-cols-2 gap-4 h-full min-h-0'>
            <ProductionOrderStatusDonut data={manufacturingOrderStatus} centerLabel={getQuickDateLabel(quickDate)} />
            <ProductionTrackingChart data={trackProduction} title={getQuickDateLabel(quickDate)} />
            <div className='flex flex-col gap-2'>
              <MainMaterialStock data={mergedMainMaterialStock} />
              {/* {hasNextMainMaterialStock && ( */}
                <div className='flex justify-center'>
                  <button
                    onClick={() => fetchNextMainMaterialStock()}
                    className='bg-white border border-gray-200 rounded-md px-3 py-1.5 responsive-text-sm text-[#3A3E4C] font-semibold'
                    // disabled={isFetchingNextMainMaterialStock}
                  >
                    {isFetchingNextMainMaterialStock ? 'Đang tải...' : 'Tải thêm'}
                  </button>
                </div>
              {/* )} */}
            </div>
            <OrderCompletionDonut data={manufacturingOrderCompletionClassification} />
          </div>
        </div>
      </Customscrollbar>
    </ReportLayout>
  );
};

export default Dashboard;
