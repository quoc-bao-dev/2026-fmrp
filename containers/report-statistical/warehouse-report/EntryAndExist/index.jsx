import OnResetData from '@/components/UI/btnResetData/btnReset'
import { RowItemTable } from '@/components/UI/common/Table'
import DropdowLimit from '@/components/UI/dropdowLimit/dropdowLimit'
import DateToDateReport from '@/components/UI/filterComponents/dateTodateReport'
import ExcelFileComponent from '@/components/UI/filterComponents/excelFilecomponet'
import SearchComponent from '@/components/UI/filterComponents/searchComponent'
import Pagination from '@/components/UI/pagination'
import SelectSearchReport from '@/components/common/select/SelectSearchReport'
import ReportLayout from '@/components/layout/ReportLayout'
import TableSection from '@/components/layout/ReportLayout/TableSection'
import { useInventoryItems } from '@/containers/manufacture/inventory/hooks/useInventoryItems'
import { useLanguageContext } from '@/context/ui/LanguageContext'
import { useGetWarehouse } from '@/hooks/common/useWarehouses'
import useFeature from '@/hooks/useConfigFeature'
import usePagination from '@/hooks/usePagination'
import useStatusExprired from '@/hooks/useStatusExprired'
import formatMoneyOrDash from '@/utils/helpers/formatMoneyOrDash'
import formatNumber from '@/utils/helpers/formatnumber'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { PiPackage, PiWarehouseLight } from 'react-icons/pi'
import { useSelector } from 'react-redux'
import { useDebounce } from 'use-debounce'
import { useExportExcel } from './hooks/useExportExcel'
import { useGetListReportStock } from './hooks/useGetListReportStock'
import PopupWarehouseDetail from './popup/popupWarehouseDetail'

const breadcrumbItems = [
  {
    label: `Báo cáo`,
    href: '/report-statistical',
  },
  {
    label: `Xuất nhập tồn`,
  },
]

const EntryAndExist = (props) => {
  const router = useRouter()
  const { paginate } = usePagination()
  const dataLang = useLanguageContext()
  const statusExprired = useStatusExprired()

  const [dateRange, setDateRange] = useState({
    startDate: undefined,
    endDate: undefined,
  })
  const [selectedWarehouse, setSelectedWarehouse] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500)
  const [productOptions, setProductOptions] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])
  const [limit, setLimit] = useState(15)
  const [searchValue, setSearchValue] = useState('')
  const [debouncedSearchValue] = useDebounce(searchValue, 500)
  const [showPopupImport, setShowPopupImport] = useState(false)
  const [selectedImportItem, setSelectedImportItem] = useState(null)
  const [showPopupExport, setShowPopupExport] = useState(false)
  const [selectedExportItem, setSelectedExportItem] = useState(null)

  const currentPage = Number(router.query.page) || 1

  const { data: warehouseData } = useGetWarehouse()
  // Luôn gọi API, dù có search term hay không để load danh sách mặc định
  const { data: dataProduct } = useInventoryItems(debouncedSearchTerm)

  const {
    data: dataReportStock,
    isFetching,
    refetch: refetchReportImport,
  } = useGetListReportStock({
    page: currentPage,
    limit: limit,
    search: debouncedSearchValue,
    filter: {
      warehouses_id: selectedWarehouse?.value,
      ...(dateRange?.startDate !== undefined && { start_date: dateRange.startDate }),
      ...(dateRange?.endDate !== undefined && { end_date: dateRange.endDate }),
      ...(selectedProducts.length > 0 && { items: selectedProducts.map((product) => product.value) }),
    },
  })

  useEffect(() => {
    if (refetchReportImport) {
      refetchReportImport()
    }
  }, [limit, dateRange, selectedWarehouse, selectedProducts, debouncedSearchValue, currentPage, refetchReportImport])

  useEffect(() => {
    // Cập nhật options khi dataProduct thay đổi
    if (dataProduct && Array.isArray(dataProduct)) {
      const newOptions = dataProduct.map((product) => ({
        value: product.value,
        label: product.name, // Sử dụng name từ API
        code: product.code,
      }))

      // Giữ lại các options đã được chọn
      const selectedOptionValues = selectedProducts.map((p) => p.value)
      const existingSelectedOptions = productOptions.filter((opt) => selectedOptionValues.includes(opt.value))
      
      // Kết hợp options mới với các options đã chọn, loại bỏ trùng lặp
      const combinedOptions = [...existingSelectedOptions, ...newOptions]
      const uniqueOptions = combinedOptions.filter(
        (option, index, self) => index === self.findIndex((o) => o.value === option.value)
      )
      
      setProductOptions(uniqueOptions)
    } else if (!dataProduct && selectedProducts.length > 0) {
      // Nếu không có dữ liệu mới nhưng có sản phẩm đã chọn, giữ lại chúng
      const selectedOptionValues = selectedProducts.map((p) => p.value)
      const existingSelectedOptions = productOptions.filter((opt) => selectedOptionValues.includes(opt.value))
      setProductOptions(existingSelectedOptions)
    }
  }, [dataProduct, selectedProducts])

  const handleDateChange = (newValue) => {
    setDateRange(newValue)
  }

  useEffect(() => {
    // Tự động chọn kho đầu tiên khi dữ liệu kho được tải về
    if (warehouseData?.rResult && warehouseData.rResult.length > 0) {
      const firstWarehouse = warehouseData.rResult[0]
      setSelectedWarehouse({
        value: firstWarehouse.id,
        label: firstWarehouse.name,
      })
    }
  }, [warehouseData?.rResult])

  const handleWarehouseChange = (value) => {
    const selected = warehouseData?.rResult?.find((w) => w.id === value)
    if (selected) {
      setSelectedWarehouse({
        value: selected.id,
        label: selected.name,
      })
    }
  }

  const handleClearWarehouse = () => {
    setSelectedWarehouse(null)
  }

  const handleProductChange = (selectedValues) => {
    if (!selectedValues || selectedValues.length === 0) {
      setSelectedProducts([])
      return
    }

    const selectedItems = selectedValues
      .map((value) => {
        const option = productOptions.find((opt) => opt.value === value)
        if (!option) return null
        return {
          value: option.value,
          label: option.label,
          code: option.code,
        }
      })
      .filter(Boolean)

    setSelectedProducts(selectedItems)
  }

  const handleClearProducts = () => {
    setSelectedProducts([])
    setSearchTerm('') // Reset search term khi clear products
    setProductOptions([]) // Reset product options
  }

  const handleSearch = (value) => {
    setSearchValue(value?.target?.value || value)
  }

  // Add limit handler
  const handleLimitChange = (newLimit) => {
    setLimit(newLimit)
  }

  const handleResetData = () => {
    // Reset date range
    setDateRange({
      startDate: undefined,
      endDate: undefined,
    })

    // Reset warehouse selection
    // setSelectedWarehouse(null)

    // Reset product search and selection
    setSearchTerm('')
    setSelectedProducts([])

    // Reset search value
    setSearchValue('')

    // Reset limit to default
    setLimit(15)

    // Reset to first page
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: 1 },
    })
  }

  const { multiDataSet } = useExportExcel(dataReportStock)

  // Xử lý click vào số lượng nhập kho
  const handleClickImportQuantity = (item) => {
    if (Number(item.in_qty) > 0) {
      setSelectedImportItem(item)
      setShowPopupImport(true)
    }
  }

  // Xử lý click vào số lượng xuất kho
  const handleClickExportQuantity = (item) => {
    if (Number(item.out_qty) > 0) {
      setSelectedExportItem(item)
      setShowPopupExport(true)
    }
  }

  // Đóng popup nhập kho
  const handleCloseImportPopup = () => {
    setShowPopupImport(false)
    setSelectedImportItem(null)
  }

  // Đóng popup xuất kho
  const handleCloseExportPopup = () => {
    setShowPopupExport(false)
    setSelectedExportItem(null)
  }

  return (
    <>
      <ReportLayout
        title={'Báo cáo nhập xuất tồn'}
        statusExprired={statusExprired}
        breadcrumbItems={breadcrumbItems}
        filterSection={
          <div className="w-full items-center flex justify-between gap-10">
            <div className="flex gap-3">
              <DateToDateReport placeholder="Giai đoạn" value={dateRange} onChange={handleDateChange} />

              <SelectSearchReport
                placeholder="Kho thành phẩm"
                onChange={handleWarehouseChange}
                onClear={handleClearWarehouse}
                icon={<PiWarehouseLight color="#9295A4" className="size-4" />}
                className="w-[200px] 2xl:w-[250px]"
                options={warehouseData?.rResult?.map((warehouse) => ({
                  value: warehouse.id,
                  label: warehouse.name,
                }))}
                value={selectedWarehouse}
              />

              <SelectSearchReport
                placeholder="Mặt hàng"
                onSearch={(value) => {
                  setSearchTerm(value)
                }}
                onClear={handleClearProducts}
                onChange={handleProductChange}
                icon={<PiPackage color="#9295A4" className="size-4" />}
                className="w-[250px] 2xl:w-[400px]"
                options={productOptions}
                value={selectedProducts}
                mode="multiple"
              />
            </div>
            <div className="flex gap-3 items-center">
              <SearchComponent
                dataLang={dataLang}
                onChange={handleSearch}
                value={searchValue}
                classNameBox="!py-2 2xl:!p-2.5"
              />
              <OnResetData sOnFetching={() => {}} onClick={handleResetData} className="!py-3" />
              <ExcelFileComponent
                dataLang={dataLang}
                filename="Báo cáo xuất nhập tồn"
                title="BCXNT"
                multiDataSet={multiDataSet}
                classBtn="!py-3"
              />
            </div>
          </div>
        }
        tableSection={
          <TableSection
            fixedColumns={[
              { title: 'STT', width: 'w-14', textAlign: 'center' },
              { title: 'Mã mặt hàng', width: 'w-32', textAlign: 'left' },
              { title: 'Mặt hàng', width: 'w-64', textAlign: 'center' },
            ]}
            scrollableColumns={[{ title: 'Đơn vị tính', width: 'w-28', textAlign: 'center' }]}
            groupedHeaders={[
              {
                title: 'Tồn đầu Kỳ',
                columns: [
                  { title: 'Số Lượng', width: 'w-32', textAlign: 'center' },
                  { title: 'Giá Trị', width: 'w-32', textAlign: 'center' },
                ],
              },
              {
                title: 'Nhập Kho',
                columns: [
                  { title: 'Số Lượng', width: 'w-32', textAlign: 'center' },
                  { title: 'Giá Trị', width: 'w-32', textAlign: 'center' },
                ],
              },
              {
                title: 'Xuất Kho',
                columns: [
                  { title: 'Số Lượng', width: 'w-32', textAlign: 'center' },
                  { title: 'Giá Trị', width: 'w-32', textAlign: 'center' },
                ],
              },
              {
                title: 'Tồn Cuối Kỳ',
                columns: [
                  { title: 'Số Lượng', width: 'w-32', textAlign: 'center' },
                  { title: 'Giá Trị', width: 'w-32', textAlign: 'center' },
                ],
              },
            ]}
            data={dataReportStock?.data}
            isFetching={isFetching}
            renderFixedRow={(item, index) => (
              <>
                <RowItemTable className="w-14 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0">
                  {index + 1}
                </RowItemTable>
                <RowItemTable className="w-32 flex flex-col justify-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0">
                  <span>{item.item_code}</span>
                </RowItemTable>
                <RowItemTable className="w-64 flex items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0">
                  <div className="flex flex-col gap-1 justify-start">
                    <p className="text-left responsive-text-sm text-neutral-07 font-normal">{item.item_name}</p>
                    <p className="text-left responsive-text-xxs text-neutral-03 font-normal">
                      {item.item_variation || ''}
                    </p>
                  </div>
                </RowItemTable>
              </>
            )}
            renderScrollableRow={(item, index) => (
              <>
                {/* Đơn vị tính */}
                <RowItemTable className="w-28 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0">
                  {item.unit_name}
                </RowItemTable>

                {/* Tồn đầu Kỳ */}
                <RowItemTable className="w-32 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0">
                  {Number(item.opening_qty) === 0 ? '-' : formatNumber(Number(Math.abs(item.opening_qty || 0)))}
                </RowItemTable>
                <RowItemTable className="w-32 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0">
                  {formatMoneyOrDash(Number(item.opening_value || 0))}
                </RowItemTable>

                {/* Nhập Kho */}
                <RowItemTable className="w-32 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] !text-new-blue font-normal flex-shrink-0">
                  {Number(item.in_qty) === 0 ? (
                    '-'
                  ) : (
                    <span className="cursor-pointer hover:underline" onClick={() => handleClickImportQuantity(item)}>
                      {formatNumber(Number(Math.abs(item.in_qty || 0)))}
                    </span>
                  )}
                </RowItemTable>
                <RowItemTable className="w-32 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0">
                  {formatMoneyOrDash(Number(item.in_value || 0))}
                </RowItemTable>

                {/* Xuất Kho */}
                <RowItemTable className="w-32 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] !text-new-blue font-normal flex-shrink-0">
                  {Number(item.out_qty) === 0 ? (
                    '-'
                  ) : (
                    <span className="cursor-pointer hover:underline" onClick={() => handleClickExportQuantity(item)}>
                      {formatNumber(Number(Math.abs(item.out_qty || 0)))}
                    </span>
                  )}
                </RowItemTable>
                <RowItemTable className="w-32 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0">
                  {formatMoneyOrDash(Number(item.out_value || 0))}
                </RowItemTable>

                {/* Tồn Cuối Kỳ */}
                <RowItemTable className="w-32 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0">
                  {Number(item.closing_qty) === 0 ? '-' : formatNumber(Number(Math.abs(item.closing_qty || 0)))}
                </RowItemTable>
                <RowItemTable className="w-32 flex justify-center items-center py-2 px-3 text-neutral-07 font-normal flex-shrink-0">
                  {formatMoneyOrDash(Number(item.closing_value || 0))}
                </RowItemTable>
              </>
            )}
            renderFooter={() => (
              <>
                <RowItemTable className="w-14 flex-shrink-0 bg-white"></RowItemTable>
                <RowItemTable className="w-32 flex-shrink-0 bg-white"></RowItemTable>
                <RowItemTable className="!w-64 flex-shrink-0 bg-white"></RowItemTable>

                {/* Đơn vị tính trong footer */}
                <RowItemTable className="h-10 w-28 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white">
                  Tổng cộng
                </RowItemTable>

                {/* Tồn đầu Kỳ - Footer */}
                <RowItemTable className="h-10 w-32 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white">
                  {Number(dataReportStock?.rTotal?.opening_qty) === 0
                    ? '-'
                    : formatNumber(Number(dataReportStock?.rTotal?.opening_qty))}
                </RowItemTable>
                <RowItemTable className="h-10 w-32 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white">
                  {formatMoneyOrDash(Number(dataReportStock?.rTotal?.opening_value || 0))}
                </RowItemTable>

                {/* Nhập Kho - Footer */}
                <RowItemTable className="h-10 w-32 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white">
                  {formatNumber(Number(dataReportStock?.rTotal?.in_qty || 0))}
                </RowItemTable>
                <RowItemTable className="h-10 w-32 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white">
                  {formatMoneyOrDash(Number(dataReportStock?.rTotal?.in_value || 0))}
                </RowItemTable>

                {/* Xuất Kho - Footer */}
                <RowItemTable className="h-10 w-32 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white">
                  {formatNumber(Number(dataReportStock?.rTotal?.out_qty || 0))}
                </RowItemTable>
                <RowItemTable className="h-10 w-32 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white">
                  {formatMoneyOrDash(Number(dataReportStock?.rTotal?.out_value || 0))}
                </RowItemTable>

                {/* Tồn Cuối Kỳ - Footer */}
                <RowItemTable className="h-10 w-32 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white">
                  {formatNumber(Number(dataReportStock?.rTotal?.closing_qty || 0))}
                </RowItemTable>
                <RowItemTable className="h-10 w-32 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white">
                  {formatMoneyOrDash(Number(dataReportStock?.rTotal?.closing_value || 0))}
                </RowItemTable>
              </>
            )}
          />
        }
        totalSection={
          <Pagination
            postsPerPage={limit}
            totalPosts={Number(dataReportStock?.recordsTotal) || 0}
            paginate={paginate}
            currentPage={currentPage}
          />
        }
        paginationSection={<DropdowLimit sLimit={handleLimitChange} limit={limit} dataLang={dataLang} />}
      />
      {/* Popup nhập kho */}
      {showPopupImport && (
        <PopupWarehouseDetail
          isOpen={showPopupImport}
          onClose={handleCloseImportPopup}
          itemData={selectedImportItem}
          dateRange={dateRange}
          selectedWarehouse={selectedWarehouse}
          type="import"
        />
      )}

      {/* Popup xuất kho */}
      {showPopupExport && (
        <PopupWarehouseDetail
          isOpen={showPopupExport}
          onClose={handleCloseExportPopup}
          itemData={selectedExportItem}
          dateRange={dateRange}
          selectedWarehouse={selectedWarehouse}
          type="export"
        />
      )}
    </>
  )
}

export default EntryAndExist
