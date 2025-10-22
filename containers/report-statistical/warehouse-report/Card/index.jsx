'use client';
import OnResetData from '@/components/UI/btnResetData/btnReset';
import { RowItemTable } from '@/components/UI/common/Table';
import DropdowLimit from '@/components/UI/dropdowLimit/dropdowLimit';
import DateToDateReport from '@/components/UI/filterComponents/dateTodateReport';
import ExcelFileComponent from '@/components/UI/filterComponents/excelFilecomponet';
import SearchComponent from '@/components/UI/filterComponents/searchComponent';
import Pagination from '@/components/UI/pagination';
import SelectSearchReport from '@/components/common/select/SelectSearchReport';
import ReportLayout from '@/components/layout/ReportLayout';
import TableSection from '@/components/layout/ReportLayout/TableSection';
import { useInventoryItems } from '@/containers/manufacture/inventory/hooks/useInventoryItems';
import { useLanguageContext } from '@/context/ui/LanguageContext';
import { useGetWarehouse } from '@/hooks/common/useWarehouses';
import usePagination from '@/hooks/usePagination';
import useStatusExprired from '@/hooks/useStatusExprired';
import formatNumber from '@/utils/helpers/formatnumber';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { PiPackage, PiWarehouseLight } from 'react-icons/pi';
import { useDebounce } from 'use-debounce';
import { useExportExcel } from './hooks/useExportExcel';
import { useGetCardStock } from './hooks/useGetListReportStock';
import moment from 'moment';

const breadcrumbItems = [
  {
    label: `Báo cáo`,
  },
  {
    label: `Báo cáo tồn kho`,
  },
  {
    label: `Thẻ kho`,
    href: '/report-statistical/warehouse-report/card',
  },
];

const Card = props => {
  const router = useRouter();
  const { paginate } = usePagination();
  const dataLang = useLanguageContext();
  const statusExprired = useStatusExprired();

  const [dateRange, setDateRange] = useState({
    startDate: undefined,
    endDate: undefined,
  });
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [productOptions, setProductOptions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [limit, setLimit] = useState(15);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue] = useDebounce(searchValue, 500);
  const [showPopupImport, setShowPopupImport] = useState(false);
  const [selectedImportItem, setSelectedImportItem] = useState(null);
  const [showPopupExport, setShowPopupExport] = useState(false);
  const [selectedExportItem, setSelectedExportItem] = useState(null);

  const currentPage = Number(router.query.page) || 1;

  const { data: warehouseData } = useGetWarehouse();
  // Luôn gọi API, dù có search term hay không để load danh sách mặc định
  const { data: dataProduct } = useInventoryItems(debouncedSearchTerm);

  const {
    data: dataReportStock,
    isFetching,
    refetch: refetchReportImport,
  } = useGetCardStock({
    page: currentPage,
    limit: limit,
    search: debouncedSearchValue,
    // filter: {
    //     warehouses_id: selectedWarehouse?.value,
    //     ...(dateRange?.startDate !== undefined && { start_date: dateRange.startDate }),
    //     ...(dateRange?.endDate !== undefined && { end_date: dateRange.endDate }),
    //     ...(selectedProduct && { items: [selectedProduct.value] }),
    // },
  });
  console.log(dataReportStock);

  useEffect(() => {
    if (refetchReportImport && isInitialized) {
      refetchReportImport();
    }
  }, [limit, dateRange, selectedWarehouse, selectedProduct, debouncedSearchValue, currentPage, refetchReportImport, isInitialized]);

  useEffect(() => {
    // Cập nhật options khi dataProduct thay đổi
    if (dataProduct && Array.isArray(dataProduct)) {
      const newOptions = dataProduct.map(product => ({
        value: product.value,
        label: product.name, // Sử dụng name từ API
        code: product.code,
      }));

      // Giữ lại option đã được chọn
      const selectedOptionValue = selectedProduct?.value;
      const existingSelectedOption = productOptions.filter(opt => opt.value === selectedOptionValue);

      // Kết hợp options mới với option đã chọn, loại bỏ trùng lặp
      const combinedOptions = [...existingSelectedOption, ...newOptions];
      const uniqueOptions = combinedOptions.filter((option, index, self) => index === self.findIndex(o => o.value === option.value));

      setProductOptions(uniqueOptions);
    } else if (!dataProduct && selectedProduct) {
      // Nếu không có dữ liệu mới nhưng có sản phẩm đã chọn, giữ lại nó
      const selectedOptionValue = selectedProduct.value;
      const existingSelectedOption = productOptions.filter(opt => opt.value === selectedOptionValue);
      setProductOptions(existingSelectedOption);
    }
  }, [dataProduct, selectedProduct]);

  const handleDateChange = newValue => {
    setDateRange(newValue);
  };

  useEffect(() => {
    // Tự động chọn kho đầu tiên khi dữ liệu kho được tải về
    if (warehouseData?.rResult && warehouseData.rResult.length > 0 && !isInitialized) {
      const firstWarehouse = warehouseData.rResult[0];
      setSelectedWarehouse({
        value: firstWarehouse.id,
        label: firstWarehouse.name,
      });
      setIsInitialized(true);
    }
  }, [warehouseData?.rResult, isInitialized]);

  const handleWarehouseChange = value => {
    const selected = warehouseData?.rResult?.find(w => w.id === value);
    if (selected) {
      setSelectedWarehouse({
        value: selected.id,
        label: selected.name,
      });
    }
  };

  const handleClearWarehouse = () => {
    setSelectedWarehouse(null);
  };

  const handleProductChange = value => {
    if (!value) {
      setSelectedProduct(null);
      return;
    }

    const selected = productOptions.find(opt => opt.value === value);
    if (selected) {
      setSelectedProduct({
        value: selected.value,
        label: selected.label,
        code: selected.code,
      });
    }
  };

  const handleClearProducts = () => {
    setSelectedProduct(null);
    setSearchTerm(''); // Reset search term khi clear products
    setProductOptions([]); // Reset product options
  };

  const handleSearch = value => {
    // Đảm bảo luôn lấy string value, không phải object
    const searchValue = value?.target?.value || (typeof value === 'string' ? value : '');
    setSearchValue(searchValue);
  };

  // Add limit handler
  const handleLimitChange = newLimit => {
    setLimit(newLimit);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: 1 },
    });
  };

  const handleResetData = () => {
    // Reset date range
    setDateRange({
      startDate: undefined,
      endDate: undefined,
    });

    // Reset warehouse selection
    // setSelectedWarehouse(null)

    // Reset product search and selection
    setSearchTerm('');
    setSelectedProduct(null);

    // Reset search value
    setSearchValue('');

    // Reset limit to default
    setLimit(15);

    // Reset to first page
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: 1 },
    });
  };

  const { multiDataSet } = useExportExcel(dataReportStock);

  // Tạo dữ liệu hiển thị: thêm dòng Đầu kỳ và Cuối kỳ
  const displayedData = useMemo(() => {
    const baseData = Array.isArray(dataReportStock) ? dataReportStock : [];
    const openingRow = {
      _rowType: 'opening',
      item_code: '',
      item_name: 'Tồn đầu kỳ',
      document_date: '',
      item_variation: '',
      unit_name: '',
      opening_qty: dataReportStock?.rTotal?.opening_qty ?? 0,
      opening_value: dataReportStock?.rTotal?.opening_value ?? 0,
      in_qty: 0,
      in_value: 0,
      out_qty: 0,
      out_value: 0,
      closing_qty: 0,
      closing_value: 0,
    };

    const closingRow = {
      _rowType: 'closing',
      item_code: '',
      item_name: 'Tồn cuối kỳ',
      document_date: '',
      item_variation: '',
      unit_name: '',
      opening_qty: 0,
      opening_value: 0,
      in_qty: 0,
      in_value: 0,
      out_qty: 0,
      out_value: 0,
      closing_qty: dataReportStock?.rTotal?.closing_qty ?? 0,
      closing_value: dataReportStock?.rTotal?.closing_value ?? 0,
    };

    // Nếu không có dữ liệu, vẫn hiển thị 2 dòng đầu/cuối
    return [openingRow, ...baseData, closingRow];
  }, [dataReportStock]);

  const getSpecialRowBg = item => (item?._rowType === 'opening' ? 'bg-[#F3F6FF]' : item?._rowType === 'closing' ? 'bg-[#E8FFF3]' : '');

  // Xử lý click vào số lượng nhập kho
  const handleClickImportQuantity = item => {
    if (Number(item.in_qty) > 0) {
      setSelectedImportItem(item);
      setShowPopupImport(true);
    }
  };

  // Xử lý click vào số lượng xuất kho
  const handleClickExportQuantity = item => {
    if (Number(item.out_qty) > 0) {
      setSelectedExportItem(item);
      setShowPopupExport(true);
    }
  };

  // Đóng popup nhập kho
  const handleCloseImportPopup = () => {
    setShowPopupImport(false);
    setSelectedImportItem(null);
  };

  // Đóng popup xuất kho
  const handleCloseExportPopup = () => {
    setShowPopupExport(false);
    setSelectedExportItem(null);
  };

  return (
    <>
      <ReportLayout
        title={'Thẻ kho'}
        statusExprired={statusExprired}
        breadcrumbItems={breadcrumbItems}
        filterSection={
          <div className='w-full items-center flex justify-between gap-4'>
            <div className='flex gap-3'>
              <DateToDateReport placeholder='Giai đoạn' value={dateRange} onChange={handleDateChange} />

              <SelectSearchReport
                placeholder='Kho thành phẩm'
                onChange={handleWarehouseChange}
                onClear={handleClearWarehouse}
                icon={<PiWarehouseLight color='#9295A4' className='size-4' />}
                className='w-[200px] 2xl:w-[250px]'
                options={warehouseData?.rResult?.map(warehouse => ({
                  value: warehouse.id,
                  label: warehouse.name,
                }))}
                value={selectedWarehouse}
              />

              <SelectSearchReport
                placeholder='Mặt hàng'
                onSearch={value => {
                  setSearchTerm(value);
                }}
                onClear={handleClearProducts}
                onChange={handleProductChange}
                icon={<PiPackage color='#9295A4' className='size-4' />}
                className='w-[250px] 2xl:w-[400px]'
                options={productOptions}
                value={selectedProduct}
              />
            </div>
            <div className='flex gap-3 items-center'>
              <SearchComponent dataLang={dataLang} onChange={handleSearch} value={searchValue} classNameBox='!py-2 2xl:!p-2.5' />
              <OnResetData sOnFetching={() => {}} onClick={handleResetData} className='!py-3' />
              <ExcelFileComponent dataLang={dataLang} filename='Báo cáo xuất nhập tồn' title='BCXNT' multiDataSet={multiDataSet} classBtn='!py-3' />
            </div>
          </div>
        }
        tableSection={
          <TableSection
            fixedColumns={[
              { title: 'STT', width: 'w-14', textAlign: 'center' },
              { title: 'Ngày duyệt kho', width: 'w-44', textAlign: 'center' },
              { title: 'Ngày chứng từ', width: 'w-44', textAlign: 'center' },
              { title: 'Mã chứng từ', width: 'w-44', textAlign: 'left' },
            ]}
            scrollableColumns={[
              { title: 'Diễn giải', width: 'w-80', textAlign: 'center' },
              { title: 'Đơn giá', width: 'w-48', textAlign: 'center' },
              { title: 'Số lượng nhập', width: 'w-36', textAlign: 'center' },
              { title: 'Số lượng xuất', width: 'w-40', textAlign: 'center' },
              { title: 'Số lượng tồn lũy kế', width: 'w-40', textAlign: 'center' },
            ]}
            data={displayedData}
            isFetching={isFetching}
            renderFixedRow={(item, index) => (
              <>
                <RowItemTable className={`w-14 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0 ${getSpecialRowBg(item)}`}>
                  {item._rowType ? '' : index}
                </RowItemTable>
                <RowItemTable className={`w-44 flex flex-col justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0 ${getSpecialRowBg(item)}`}>
                  <span>{item._rowType ? (item._rowType === 'opening' ? 'Tồn đầu kỳ' : 'Tồn cuối kỳ') : moment(item.document_date).format('DD/MM/YYYY')}</span>
                </RowItemTable>
                <RowItemTable className={`w-44 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0 ${getSpecialRowBg(item)}`}>
                  <div className='flex flex-col gap-1 justify-start'>{item.document_date ? moment(item.document_date).format('DD/MM/YYYY') : ''}</div>
                </RowItemTable>
                <RowItemTable className={`w-44 flex items-center py-2 px-3 border-r border-[#E0E0E1] !text-new-blue hover:underline cursor-pointer font-normal flex-shrink-0 ${getSpecialRowBg(item)}`}>
                  <div className='flex flex-col gap-1 justify-start'>{item.document_code}</div>
                </RowItemTable>
              </>
            )}
            renderScrollableRow={(item, index) => (
              <>
                <RowItemTable className={`w-80 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0 ${getSpecialRowBg(item)}`}>
                  {item.document_type}
                </RowItemTable>
                <RowItemTable className={`w-48 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0 ${getSpecialRowBg(item)}`}>
                  {}
                </RowItemTable>
                <RowItemTable className={`w-36 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0 ${getSpecialRowBg(item)}`}>
                  {formatNumber(Number(item.in_qty || 0))}
                </RowItemTable>
                <RowItemTable className={`w-40 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0 ${getSpecialRowBg(item)}`}>
                  {formatNumber(Number(item.out_qty || 0))}
                </RowItemTable>
                <RowItemTable className={`w-40 flex justify-center items-center py-2 px-3  text-neutral-07 font-normal flex-shrink-0 ${getSpecialRowBg(item)}`}>
                  {item.closing_qty}
                </RowItemTable>
              </>
            )}
          />
        }
        totalSection={dataReportStock?.recordsTotal > 0 && <Pagination postsPerPage={limit} totalPosts={Number(dataReportStock?.recordsTotal) || 0} paginate={paginate} currentPage={currentPage} />}
        paginationSection={<DropdowLimit sLimit={handleLimitChange} limit={limit} dataLang={dataLang} />}
      />
    </>
  );
};

export default Card;
