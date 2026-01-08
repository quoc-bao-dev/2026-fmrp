import IncomeComparisonChart from '@/components/UI/common/charts/IncomeComparisonChart';
import PieceworkWageTable from '@/containers/piecework-wage/components/PieceworkWageTable';

const TabPieceworkWage = ({ dataLang, refreshData, handleQueryId, isStateProvider, groupButtonRef, listPrintTask, incomeChartData }) => {
  return (
    <div className='flex flex-col gap-2 h-full relative'>
      {/* Action Buttons */}
      {/* Table Section - 2 boxes */}
      <div className='flex gap-4 w-full'>
        {/* Box 1 - 70% width */}
        <div className='w-[60%]'>
          {/* Table content sẽ được thêm sau */}
          <PieceworkWageTable />
        </div>

        {/* Box 2 - 30% width */}
        <div className='w-[40%]'>
          <IncomeComparisonChart data={incomeChartData} />
        </div>
      </div>
    </div>
  );
};

export default TabPieceworkWage;
