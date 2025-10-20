import OnResetData from '@/components/UI/btnResetData/btnReset'
import { RowItemTable } from '@/components/UI/common/Table'
import DropdowLimit from '@/components/UI/dropdowLimit/dropdowLimit'
import DateToDateReport from '@/components/UI/filterComponents/dateTodateReport'
import ExcelFileComponent from '@/components/UI/filterComponents/excelFilecomponet'
import SearchComponent from '@/components/UI/filterComponents/searchComponent'
import SelectSearchReport from '@/components/common/select/SelectSearchReport'
import ReportLayout from '@/components/layout/ReportLayout'
import TableSection from '@/components/layout/ReportLayout/TableSection'
import Pagination from '@/components/UI/pagination'
import { useLanguageContext } from '@/context/ui/LanguageContext'
import usePagination from '@/hooks/usePagination'
import useStatusExprired from '@/hooks/useStatusExprired'
import formatNumber from '@/utils/helpers/formatnumber'
import { PiPackage, PiShoppingCart, PiCalendar } from 'react-icons/pi'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useDebounce } from 'use-debounce'

const breadcrumbItems = [
  {
    label: `Báo cáo`,
    href: '/report-statistical',
  },
  {
    label: `Quản lý sản xuất`,
    href: '/report-statistical/production-manager',
  },
  {
    label: `Tiến độ theo đơn hàng`,
  },
]

const OrderProgress = () => {
  const router = useRouter()
  const { paginate } = usePagination()
  const dataLang = useLanguageContext()
  const statusExprired = useStatusExprired()

  const [dateRange, setDateRange] = useState({
    startDate: undefined,
    endDate: undefined,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [limit, setLimit] = useState(15)
  const [searchValue, setSearchValue] = useState('')
  const [debouncedSearchValue] = useDebounce(searchValue, 500)

  const currentPage = Number(router.query.page) || 1

  // Mock data - thay thế bằng API thực tế
  const mockData = [
    {
      id: 1,
      order_date: '2024-01-15',
      order_number: 'DH001',
      branch_name: 'Xưởng A',
      product_name: 'Áo thun nam',
      note: 'Giao hàng gấp',
      quantity: 100,
      required_date: '2024-01-25',
      produced_quantity: 80,
      delivered_quantity: 60,
      pending_quantity: 40,
      completion_date: '2024-01-23',
      delivery_date: '2024-01-24',
      status: 'Đang sản xuất',
    },
    {
      id: 2,
      order_date: '2024-01-16',
      order_number: 'DH002',
      branch_name: 'Xưởng B',
      product_name: 'Quần jean nữ',
      note: '',
      quantity: 50,
      required_date: '2024-01-30',
      produced_quantity: 50,
      delivered_quantity: 50,
      pending_quantity: 0,
      completion_date: '2024-01-28',
      delivery_date: '2024-01-29',
      status: 'Hoàn thành',
    },
    {
      id: 3,
      order_date: '2024-01-17',
      order_number: 'DH003',
      branch_name: 'Xưởng A',
      product_name: 'Áo khoác',
      note: 'Màu đen',
      quantity: 75,
      required_date: '2024-02-05',
      produced_quantity: 30,
      delivered_quantity: 0,
      pending_quantity: 75,
      completion_date: null,
      delivery_date: null,
      status: 'Chưa bắt đầu',
    },
  ]

  const mockTotal = {
    total_records: mockData.length,
    total_quantity: mockData.reduce((sum, item) => sum + item.quantity, 0),
    total_produced: mockData.reduce((sum, item) => sum + item.produced_quantity, 0),
    total_delivered: mockData.reduce((sum, item) => sum + item.delivered_quantity, 0),
    total_pending: mockData.reduce((sum, item) => sum + item.pending_quantity, 0),
  }

  const handleDateChange = (newValue) => {
    setDateRange(newValue)
  }

  const handleOrderChange = (value) => {
    setSelectedOrder(value)
  }

  const handleProductChange = (value) => {
    setSelectedProduct(value)
  }

  const handleClearOrder = () => {
    setSelectedOrder(null)
  }

  const handleClearProduct = () => {
    setSelectedProduct(null)
  }

  const handleSearch = (value) => {
    const searchValue = value?.target?.value || (typeof value === 'string' ? value : '')
    setSearchValue(searchValue)
  }

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit)
  }

  const handleResetData = () => {
    setDateRange({
      startDate: undefined,
      endDate: undefined,
    })
    setSearchTerm('')
    setSelectedOrder(null)
    setSelectedProduct(null)
    setSearchValue('')
    setLimit(15)
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: 1 },
    })
  }

  // Mock export data
  const exportData = {
    headers: [
      'STT',
      'Ngày đơn hàng',
      'Số đơn hàng',
      'Chi nhánh xưởng',
      'Tên sản phẩm',
      'Ghi chú',
      'Số lượng',
      'Ngày cần hàng',
      'SL sản xuất',
      'SL đã giao',
      'SL chưa giao',
      'Ngày hoàn thành sx',
      'Ngày giao hàng đủ',
      'Trạng thái',
    ],
    data: mockData.map((item, index) => [
      index + 1,
      item.order_date,
      item.order_number,
      item.branch_name,
      item.product_name,
      item.note,
      item.quantity,
      item.required_date,
      item.produced_quantity,
      item.delivered_quantity,
      item.pending_quantity,
      item.completion_date || '-',
      item.delivery_date || '-',
      item.status,
    ]),
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Hoàn thành':
        return 'text-green-600'
      case 'Đang sản xuất':
        return 'text-blue-600'
      case 'Chưa bắt đầu':
        return 'text-gray-600'
      default:
        return 'text-neutral-07'
    }
  }

  return (
    <>
      <ReportLayout
        title={'Báo cáo tiến độ theo đơn hàng'}
        statusExprired={statusExprired}
        breadcrumbItems={breadcrumbItems}
        filterSection={
          <div className="w-full items-center flex justify-between gap-4">
            <div className="flex gap-3">
              <SearchComponent
                dataLang={dataLang}
                onChange={handleSearch}
                value={searchValue}
                classNameBox="!py-2 2xl:!p-2.5"
                placeholder="Tìm kiếm..."
              />

              <SelectSearchReport
                placeholder="Đơn hàng bán"
                onChange={handleOrderChange}
                onClear={handleClearOrder}
                icon={<PiShoppingCart color="#9295A4" className="size-4" />}
                className="w-[200px] 2xl:w-[250px]"
                options={[
                  { value: '1', label: 'DH001 - Áo thun nam' },
                  { value: '2', label: 'DH002 - Quần jean nữ' },
                  { value: '3', label: 'DH003 - Áo khoác' },
                ]}
                value={selectedOrder}
              />

              <SelectSearchReport
                placeholder="Mặt hàng"
                onChange={handleProductChange}
                onClear={handleClearProduct}
                icon={<PiPackage color="#9295A4" className="size-4" />}
                className="w-[200px] 2xl:w-[250px]"
                options={[
                  { value: '1', label: 'Áo thun nam' },
                  { value: '2', label: 'Quần jean nữ' },
                  { value: '3', label: 'Áo khoác' },
                ]}
                value={selectedProduct}
              />

              <DateToDateReport
                placeholder="Từ ngày đến ngày"
                value={dateRange}
                onChange={handleDateChange}
                icon={<PiCalendar color="#9295A4" className="size-4" />}
                className="w-[200px] 2xl:w-[250px]"
              />
            </div>
            <div className="flex gap-3 items-center">
              <OnResetData sOnFetching={() => {}} onClick={handleResetData} className="!py-3" />
              <ExcelFileComponent
                dataLang={dataLang}
                filename="Báo cáo tiến độ theo đơn hàng"
                title="BCTDTDH"
                multiDataSet={exportData}
                classBtn="!py-3"
              />
            </div>
          </div>
        }
        tableSection={
          <TableSection
            fixedColumns={[
              { title: 'STT', width: 'w-14', textAlign: 'center' },
              { title: 'Ngày đơn hàng', width: 'w-32', textAlign: 'center' },
              { title: 'Số đơn hàng', width: 'w-32', textAlign: 'center' },
              { title: 'Chi nhánh xưởng', width: 'w-40', textAlign: 'left' },
            ]}
            scrollableColumns={[
              { title: 'Tên sản phẩm', width: 'w-48', textAlign: 'left' },
              { title: 'Ghi chú', width: 'w-32', textAlign: 'left' },
              { title: 'Số lượng', width: 'w-28', textAlign: 'center' },
              { title: 'Ngày cần hàng', width: 'w-32', textAlign: 'center' },
              { title: 'SL sản xuất', width: 'w-28', textAlign: 'center' },
              { title: 'SL đã giao', width: 'w-28', textAlign: 'center' },
              { title: 'SL chưa giao', width: 'w-28', textAlign: 'center' },
              { title: 'Ngày hoàn thành sx', width: 'w-36', textAlign: 'center' },
              { title: 'Ngày giao hàng đủ', width: 'w-36', textAlign: 'center' },
              { title: 'Trạng thái', width: 'w-32', textAlign: 'center' },
            ]}
            data={mockData}
            isFetching={false}
            renderFixedRow={(item, index) => (
              <>
                <RowItemTable className="w-14 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0">
                  {index + 1}
                </RowItemTable>
                <RowItemTable className="w-32 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0">
                  {new Date(item.order_date).toLocaleDateString('vi-VN')}
                </RowItemTable>
                <RowItemTable className="w-32 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0">
                  {item.order_number}
                </RowItemTable>
                <RowItemTable className="w-40 flex items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0">
                  <span className="text-left responsive-text-sm">{item.branch_name}</span>
                </RowItemTable>
              </>
            )}
            renderScrollableRow={(item, index) => (
              <>
                <RowItemTable className="w-48 flex items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0">
                  <span className="text-left responsive-text-sm">{item.product_name}</span>
                </RowItemTable>
                <RowItemTable className="w-32 flex items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0">
                  <span className="text-left responsive-text-sm">{item.note || '-'}</span>
                </RowItemTable>
                <RowItemTable className="w-28 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0">
                  {formatNumber(item.quantity)}
                </RowItemTable>
                <RowItemTable className="w-32 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0">
                  {new Date(item.required_date).toLocaleDateString('vi-VN')}
                </RowItemTable>
                <RowItemTable className="w-28 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0">
                  {formatNumber(item.produced_quantity)}
                </RowItemTable>
                <RowItemTable className="w-28 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0">
                  {formatNumber(item.delivered_quantity)}
                </RowItemTable>
                <RowItemTable className="w-28 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0">
                  {formatNumber(item.pending_quantity)}
                </RowItemTable>
                <RowItemTable className="w-36 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0">
                  {item.completion_date ? new Date(item.completion_date).toLocaleDateString('vi-VN') : '-'}
                </RowItemTable>
                <RowItemTable className="w-36 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0">
                  {item.delivery_date ? new Date(item.delivery_date).toLocaleDateString('vi-VN') : '-'}
                </RowItemTable>
                <RowItemTable className="w-32 flex justify-center items-center py-2 px-3 text-neutral-07 font-normal flex-shrink-0">
                  <span className={`responsive-text-sm font-medium ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </RowItemTable>
              </>
            )}
            renderFooter={() => (
              <>
                <RowItemTable className="w-14 flex-shrink-0 bg-white"></RowItemTable>
                <RowItemTable className="w-32 flex-shrink-0 bg-white"></RowItemTable>
                <RowItemTable className="w-32 flex-shrink-0 bg-white"></RowItemTable>
                <RowItemTable className="w-40 flex-shrink-0 bg-white"></RowItemTable>

                <RowItemTable className="h-10 w-48 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white">
                  Tổng cộng
                </RowItemTable>
                <RowItemTable className="h-10 w-32 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white">
                  -
                </RowItemTable>
                <RowItemTable className="h-10 w-28 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white">
                  {formatNumber(mockTotal.total_quantity)}
                </RowItemTable>
                <RowItemTable className="h-10 w-32 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white">
                  -
                </RowItemTable>
                <RowItemTable className="h-10 w-28 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white">
                  {formatNumber(mockTotal.total_produced)}
                </RowItemTable>
                <RowItemTable className="h-10 w-28 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white">
                  {formatNumber(mockTotal.total_delivered)}
                </RowItemTable>
                <RowItemTable className="h-10 w-28 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white">
                  {formatNumber(mockTotal.total_pending)}
                </RowItemTable>
                <RowItemTable className="h-10 w-36 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white">
                  -
                </RowItemTable>
                <RowItemTable className="h-10 w-36 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white">
                  -
                </RowItemTable>
                <RowItemTable className="h-10 w-32 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white">
                  -
                </RowItemTable>
              </>
            )}
          />
        }
        totalSection={
          mockData?.length > 0 && (
            <Pagination
              postsPerPage={limit}
              totalPosts={Number(mockTotal?.total_records) || 0}
              paginate={paginate}
              currentPage={currentPage}
            />
          )
        }
        paginationSection={<DropdowLimit sLimit={handleLimitChange} limit={limit} dataLang={dataLang} />}
      />
    </>
  )
}

export default OrderProgress
