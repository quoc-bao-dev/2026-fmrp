import CustomSelectBranch from '@/components/common/orderManagement/CustomSelectBranch';
import { EmptyExprired } from '@/components/UI/common/EmptyExprired';
import { Container } from '@/components/UI/common/layout';
import Navbar from '@/containers/report-statistical/components/navbar';
import TitleHeader from '@/containers/report-statistical/components/titleHeader';
import { useState } from 'react';
import TableSection from './TableSection';

const ReportLayout = ({
  title,
  filterHeader,
  filterSection,
  tableSection,
  totalSection,
  paginationSection,
  statusExprired,
  breadcrumbItems,
  maginBottom = false,
  branchValue,
  onBranchChange,
  onBranchClear,
  children,
}) => {
  const [internalSelectedBranches, setInternalSelectedBranches] = useState([]);

  return (
    <Container className='bg-gray-color'>
      {statusExprired ? <EmptyExprired /> : null}
      <div className='flex flex-col gap-5 h-full'>
        <div className='flex items-end justify-between'>
          <TitleHeader title={title} breadcrumbItems={breadcrumbItems} />
          <div className='flex items-center gap-4'>
            {filterHeader}
            <div className='min-w-48'>
              <CustomSelectBranch
                placeholderText={'Lọc chi nhánh'}
                value={branchValue !== undefined ? branchValue : internalSelectedBranches}
                onChange={values => (onBranchChange ? onBranchChange(values) : setInternalSelectedBranches(values))}
                onClear={() => (onBranchClear ? onBranchClear() : setInternalSelectedBranches([]))}
                isError={false}
                errMess={null}
              />
            </div>
          </div>
        </div>

        <div className='flex gap-4 h-full flex-1 min-h-0 pb-3'>
          <Navbar />
          <div className='w-[calc(83%-16px)] max-h-full flex-1 min-h-0 h-full flex flex-col py-3 bg-white rounded-lg'>
            {children ? (
              children
            ) : (
              <>
                {/* Filter Section */}
                <div className='px-4'>{filterSection}</div>

                {/* Table Section */}
                <div className={`mt-5 flex-1 overflow-auto h-full ${maginBottom ? 'mb-4' : ''}`}>{tableSection}</div>

                {/* Total Section */}
                <div className='flex items-center justify-between px-4'>
                  {totalSection}
                  {paginationSection}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
};

// Export the TableSection component for easy access
export { TableSection };
export default ReportLayout;
