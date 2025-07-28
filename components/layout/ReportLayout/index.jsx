import React from 'react'
import { Container } from '@/components/UI/common/layout'
import { EmptyExprired } from '@/components/UI/common/EmptyExprired'
import Navbar from '@/containers/report-statistical/components/navbar'
import TitleHeader from '@/containers/report-statistical/components/titleHeader'
import TableSection from './TableSection'

const ReportLayout = ({
  title,
  filterSection,
  tableSection,
  totalSection,
  paginationSection,
  statusExprired,
  breadcrumbItems,
}) => {
  return (
    <Container className="bg-gray-color">
      {statusExprired ? <EmptyExprired /> : null}
        <div className="flex flex-col gap-5 h-full">
          <TitleHeader title={title} breadcrumbItems={breadcrumbItems} />
          <div className="flex gap-4 h-full flex-1 min-h-0">
            <Navbar />
            <div className="w-[calc(83%-16px)] max-h-full flex-1 min-h-0 h-full flex flex-col py-3 bg-white rounded-lg">
              {/* Filter Section */}
              <div className="px-4">{filterSection}</div>

              {/* Table Section */}
              <div className="mt-5 flex-1 overflow-auto h-full">{tableSection}</div>

              {/* Total Section */}
              <div className="flex items-center justify-between px-4">
                {totalSection}
                {paginationSection}
              </div>
            </div>
          </div>
        </div>
    </Container>
  )
}

// Export the TableSection component for easy access
export { TableSection }
export default ReportLayout
