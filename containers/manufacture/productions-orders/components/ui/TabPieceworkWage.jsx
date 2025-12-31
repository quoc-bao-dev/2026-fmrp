import ButtonAnimationNew from '@/components/common/button/ButtonAnimationNew';
import FilterDropdown from '@/components/common/dropdown/FilterDropdown';
import { ArrowCounterClockWiseIcon, CaretDownIcon, CaretDropDownThinIcon, CheckThinIcon, TrashIcon } from '@/components/icons';
import TimerIcon from '@/components/icons/common/TimerIcon';
import IncomeComparisonChart from '@/components/UI/common/charts/IncomeComparisonChart';
import PieceworkWageTable from '@/containers/piecework-wage/components/PieceworkWageTable';

const TabPieceworkWage = ({ dataLang, refreshData, handleQueryId, isStateProvider, groupButtonRef, listPrintTask }) => {
  // Trigger buttons cho dropdown
  const triggerCompleteStage = (
    <div className='3xl:h-10 h-9 xl:px-4 px-2 flex items-center xl:gap-4 gap-2 font-medium text-white border-[#0375F3] bg-[#0375F3] hover:bg-[#0375F3] hover:opacity-80 cursor-pointer hover:shadow-hover-button rounded-lg custom-transition'>
      <span className='flex items-center gap-1 xl:gap-2'>
        <CheckThinIcon className='xl:size-4 size-3.5 shrink-0' />
        <span className='responsive-text-base'>Tác vụ</span>
      </span>
      <CaretDropDownThinIcon className='xl:size-4 size-3.5 shrink-0' />
    </div>
  );

  const triggerPrintTask = (
    <div className='3xl:h-10 h-9 xl:px-4 px-2 flex items-center gap-2 border border-[#D0D5DD] hover:border-[#3276FA] bg-white hover:bg-[#EBF5FF] cursor-pointer hover:shadow-hover-button rounded-lg custom-transition'>
      <span className='responsive-text-base font-medium text-[#3A3E4C]'>Tác vụ in</span>
      <CaretDownIcon className='text-[#9295A4] size-4' />
    </div>
  );

  // Mock data for dropdowns - sẽ được thay thế bằng dữ liệu thực tế
  const listDropdownCompleteStage = [];

  // Mock data cho biểu đồ thu nhập
  const incomeChartData = [
    { id: 1, name: 'Thành', income: 950000 },
    { id: 2, name: 'Tuấn', income: 850000 },
    { id: 3, name: 'Thái', income: 1350000 },
    { id: 4, name: 'Thành', income: 1050000 },
    { id: 5, name: 'Nguyên', income: 1150000 },
    { id: 6, name: 'Dung', income: 1250000 },
    { id: 7, name: 'Thành', income: 1350000 },
    { id: 8, name: 'Thành', income: 750000 },
  ];

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
