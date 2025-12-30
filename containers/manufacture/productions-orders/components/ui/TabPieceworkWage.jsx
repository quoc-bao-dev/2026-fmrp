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
      <div ref={groupButtonRef} className='sticky top-0 z-50 bg-white flex items-center justify-start gap-2 p-0.5 mb-2'>
        {/* <FilterDropdown
          trigger={triggerCompleteStage}
          style={{
            boxShadow: '0px 5px 35px 0px #00000012',
          }}
          className='flex flex-col !p-0 border-[#D8DAE5] rounded-lg shrink-0 w-fit'
          classNameContainer='!w-fit'
          dropdownId='dropdownCompleteStage'
          placement='bottom-right'
        >
          {listDropdownCompleteStage?.map((tab, index) => {
            const isFirst = index === 0;
            const isLast = index === listDropdownCompleteStage.length - 1;
            const borderClass = isLast ? 'border-transparent rounded-b-lg border-t-transparent' : isFirst ? 'rounded-t-lg border-t-transparent' : 'border-t-transparent';

            return (
              <div
                key={tab.id}
                className={`hover:bg-[#F3F4F6] border-b border-[#F7F8F9] border-t flex items-center gap-3 cursor-pointer px-4 py-3 custom-transition whitespace-nowrap ${borderClass} select-none`}
                onClick={() => tab.action?.()}
              >
                <div className='flex items-center gap-2 cursor-pointer'>
                  <span className='3xl:size-5 size-4 text-[#0375F3] shrink-0'>{tab.icon}</span>
                  <span className={`3xl:text-base text-sm font-normal text-[#101828] ${tab.color}`}>{tab.label}</span>
                </div>
              </div>
            );
          })}
        </FilterDropdown>

        <FilterDropdown
          trigger={triggerPrintTask}
          style={{
            boxShadow: '0px 5px 35px 0px #00000012',
          }}
          className='flex flex-col !p-0 border-[#D8DAE5] rounded-lg shrink-0 w-fit'
          classNameContainer='!w-fit'
          dropdownId='dropdownPrintTask'
          placement='bottom-left'
        >
          {listPrintTask?.map((tab, index) => {
            const isFirst = index === 0;
            const isLast = index === listPrintTask.length - 1;
            const borderClass = isLast ? 'border-transparent rounded-b-lg border-t-transparent' : isFirst ? 'rounded-t-lg border-t-transparent' : 'border-t-transparent';

            return (
              <div
                key={tab.id}
                className={`group hover:bg-[#F3F4F6] border-b border-[#F7F8F9] border-t flex items-center gap-3 cursor-pointer px-4 py-3 custom-transition whitespace-nowrap ${borderClass} select-none`}
                onClick={() => tab.action()}
              >
                {tab.icon}
                <span className='responsive-text-base text-[#101828] group-hover:text-[#0375F3]'>{tab.label}</span>
              </div>
            );
          })}
        </FilterDropdown>

        <ButtonAnimationNew
          icon={<ArrowCounterClockWiseIcon className='size-4' />}
          title='Tải lại'
          className='3xl:h-10 h-9 xl:px-4 px-2 flex items-center gap-2 xl:text-sm text-xs font-normal text-[#0BAA2E] border border-[#0BAA2E] hover:bg-[#ebfff2] hover:shadow-hover-button rounded-lg'
          onClick={refreshData}
        />
        <ButtonAnimationNew
          icon={
            <div className='3xl:size-5 size-4'>
              <TrashIcon className='size-full' />
            </div>
          }
          onClick={() => {
            handleQueryId({
              status: true,
              id: isStateProvider?.productionsOrders.idDetailProductionOrder,
            });
          }}
          title='Xoá'
          className='3xl:h-10 h-9 xl:px-4 px-2 flex items-center gap-2 xl:text-sm text-xs font-normal text-[#EE1E1E] border border-[#EE1E1E] hover:bg-[#FFEEF0] hover:shadow-hover-button rounded-lg'
        /> */}
      </div>

      {/* Table Section - 2 boxes */}
      <div className='flex gap-4 w-full'>
        {/* Box 1 - 70% width */}
        <div className='w-[60%] '>
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
