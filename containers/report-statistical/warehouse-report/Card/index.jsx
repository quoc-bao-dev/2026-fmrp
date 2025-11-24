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
import { useLanguageContext } from '@/context/ui/LanguageContext';
import { useGetWarehouse } from '@/hooks/common/useWarehouses';
import usePagination from '@/hooks/usePagination';
import useStatusExprired from '@/hooks/useStatusExprired';
import formatMoneyOrDash from '@/utils/helpers/formatMoneyOrDash';
import formatNumber from '@/utils/helpers/formatnumber';
import moment from 'moment';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { PiPackage, PiWarehouseLight } from 'react-icons/pi';
import { useDebounce } from 'use-debounce';
import { useExportExcel } from './hooks/useExportExcel';
import { useGetCardStock } from './hooks/useGetListReportStock';
import { usePersistedBranches } from '@/hooks/common/usePersistedBranches';
import { useGetItemsWithBranch } from '@/hooks/useComboBoxReport';

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
  const { selectedBranches, setSelectedBranches } = usePersistedBranches();

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

  const currentPage = Number(router.query.page) || 1;

  const { data: warehouseData } = useGetWarehouse({
    filter: {
      branch_id: selectedBranches?.length > 0 ? selectedBranches : null,
    },
  });
  const { data: dataProduct } = useGetItemsWithBranch({
    search: debouncedSearchTerm,
    branch_ids: selectedBranches?.length > 0 ? selectedBranches : null,
  });
  const {
    data: dataReportStock,
    isFetching,
    refetch: refetchCardStock,
  } = useGetCardStock({
    data: {
      page: currentPage,
      limit: limit,
      search: debouncedSearchValue,
      filter: {
        warehouses_id: selectedWarehouse?.value,
        branch_ids: selectedBranches?.length > 0 ? selectedBranches : null,
        ...(dateRange?.startDate !== undefined && { start_date: dateRange.startDate }),
        ...(dateRange?.endDate !== undefined && { end_date: dateRange.endDate }),
        ...(selectedProduct && { items: selectedProduct.value }),
      },
    },
    enabled: !!selectedProduct, // Chỉ gọi API khi đã chọn mặt hàng
  });

  useEffect(() => {
    if (refetchCardStock && isInitialized && selectedProduct) {
      refetchCardStock();
    }
  }, [limit, dateRange, selectedWarehouse, selectedProduct, debouncedSearchValue, currentPage, refetchCardStock, isInitialized]);

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

  // Reset mặt hàng khi selectedBranches thay đổi
  useEffect(() => {
    setSelectedProduct(null);
    setProductOptions([]);
    setSearchTerm('');
  }, [selectedBranches]);

  // Xử lý kho khi warehouseData hoặc selectedBranches thay đổi
  useEffect(() => {
    if (warehouseData?.rResult && warehouseData.rResult.length > 0) {
      // Có dữ liệu: chọn kho đầu tiên
      const firstWarehouse = warehouseData.rResult[0];
      setSelectedWarehouse({
        value: firstWarehouse.id,
        label: firstWarehouse.name,
      });
      setIsInitialized(true);
    } else {
      // Không có dữ liệu: để trống
      setSelectedWarehouse(null);
      setIsInitialized(false);
    }
  }, [warehouseData?.rResult, selectedBranches]);

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

  // Tạo dữ liệu hiển thị: thêm dòng Đầu kỳ và Cuối kỳ
  const displayedData = useMemo(() => {
    const baseData = Array.isArray(dataReportStock) ? dataReportStock : [];

    // Nếu không có dữ liệu gốc, trả về mảng rỗng để hiển thị NoData
    if (baseData.length === 0) {
      return [];
    }

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
      closing_qty: baseData[0]?.opening_qty ?? 0,
    };

    const closingRow = {
      _rowType: 'closing',
      item_code: '',
      item_name: 'Tồn cuối kỳ',
      document_date: '',
      item_variation: '',
      unit_name: '',
      price: baseData.reduce((acc, item) => acc + Number(item.price || 0), 0),
      opening_qty: 0,
      opening_value: 0,
      in_qty: 0,
      in_value: 0,
      out_qty: 0,
      out_value: 0,
      closing_qty: baseData[baseData.length - 1]?.closing_qty ?? 0,
    };

    // Chỉ hiển thị dòng đầu/cuối khi có dữ liệu
    return [openingRow, ...baseData, closingRow];
  }, [dataReportStock]);

  const getSpecialRowBg = item => (item?._rowType === 'opening' ? 'bg-[#F3F6FF]' : item?._rowType === 'closing' ? 'bg-[#E8FFF3]' : '');

  const { multiDataSet } = useExportExcel(displayedData);

  return (
    <>
      <ReportLayout
        title={'Thẻ kho'}
        statusExprired={statusExprired}
        breadcrumbItems={breadcrumbItems}
        branchValue={selectedBranches}
        onBranchChange={setSelectedBranches}
        onBranchClear={() => setSelectedBranches([])}
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
              <OnResetData sOnFetching={() => {}} onClick={refetchCardStock} className='!py-3' />
              <ExcelFileComponent dataLang={dataLang} filename='Báo cáo thẻ kho' title='BCTK' multiDataSet={multiDataSet} classBtn='!py-3' />
            </div>
          </div>
        }
        tableSection={
          !selectedProduct ? (
            <div className='p-10 bg-gray-50 border border-[#E0E0E1] rounded-lg h-full'>
              <div className='text-center flex flex-col items-center justify-center gap-2'>
                <Image src='/data-not-found.png' alt='No Data' width={300} height={300} className='object-contain' />
                <p className='text-lg font-medium text-gray-600 mb-2'>Vui lòng chọn mặt hàng</p>
                <p className='text-sm text-gray-500'>Để xem báo cáo thẻ kho, bạn cần chọn mặt hàng từ combo box bên trên</p>
              </div>
            </div>
          ) : (
            <TableSection
              fixedColumns={[
                { title: 'STT', width: 'w-14', textAlign: 'center' },
                { title: 'Ngày duyệt kho', width: 'w-44 3xl:w-[200px]', textAlign: 'center' },
                { title: 'Ngày chứng từ', width: 'w-44 3xl:w-[200px]', textAlign: 'center' },
                { title: 'Mã chứng từ', width: 'w-44 3xl:w-[200px]', textAlign: 'left' },
              ]}
              scrollableColumns={[
                { title: 'Diễn giải', width: 'w-60', textAlign: 'center' },
                // { title: 'Đơn giá', width: 'w-48', textAlign: 'center' },
                { title: 'Số lượng nhập', width: 'w-40 2xl:w-[220px] 3xl:w-[300px]', textAlign: 'center' },
                { title: 'Số lượng xuất', width: 'w-40 2xl:w-[220px] 3xl:w-[300px]', textAlign: 'center' },
                { title: 'Số lượng tồn lũy kế', width: 'w-40 2xl:w-[220px] 3xl:w-[300px] !text-[#003DA0] ', textAlign: 'center' },
              ]}
              data={displayedData}
              isFetching={isFetching}
              renderFixedRow={(item, index) => (
                <>
                  <RowItemTable className={`w-14 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0 ${getSpecialRowBg(item)}`}>
                    {item._rowType ? '' : index}
                  </RowItemTable>
                  <RowItemTable
                    className={`w-44 3xl:w-[200px] flex flex-col justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0 ${getSpecialRowBg(item)}`}
                  >
                    <span>{item._rowType ? (item._rowType === 'opening' ? 'Tồn đầu kỳ' : 'Tồn cuối kỳ') : moment(item.warehouseman_date).format('DD/MM/YYYY')}</span>
                  </RowItemTable>
                  <RowItemTable
                    className={`w-44 3xl:w-[200px] flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0 ${getSpecialRowBg(item)}`}
                  >
                    <div className='flex flex-col gap-1 justify-start'>{item.document_date ? moment(item.document_date).format('DD/MM/YYYY') : ''}</div>
                  </RowItemTable>
                  <RowItemTable className={`w-44 3xl:w-[200px] flex items-center py-2 px-3 border-r border-[#E0E0E1] font-normal flex-shrink-0 ${getSpecialRowBg(item)}`}>
                    <div className='flex flex-col gap-1 justify-start'>{item.document_code}</div>
                  </RowItemTable>
                </>
              )}
              renderScrollableRow={item => (
                <>
                  <RowItemTable className={`w-60 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0 ${getSpecialRowBg(item)}`}>
                    {item.document_type}
                  </RowItemTable>
                  {/* <RowItemTable className={`w-48 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0 ${getSpecialRowBg(item)}`}>
                    {item._rowType === 'opening' ? '' : formatMoneyOrDash(Number(item.price || 0))}
                  </RowItemTable> */}
                  <RowItemTable
                    className={`w-40 2xl:w-[220px] 3xl:w-[300px] flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0 ${getSpecialRowBg(
                      item
                    )}`}
                  >
                    {item._rowType ? '' : Number(item.in_qty || 0) === 0 ? '-' : formatNumber(Number(item.in_qty || 0))}
                  </RowItemTable>
                  <RowItemTable
                    className={`w-40 2xl:w-[220px] 3xl:w-[300px] flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0 ${getSpecialRowBg(
                      item
                    )}`}
                  >
                    {item._rowType ? '' : Number(item.out_qty || 0) === 0 ? '-' : formatNumber(Number(item.out_qty || 0))}
                  </RowItemTable>
                  <RowItemTable
                    className={`w-40 2xl:w-[220px] 3xl:w-[300px] flex justify-center items-center py-2 px-3  text-neutral-07- font-normal flex-shrink-0 !text-[#003DA0] ${getSpecialRowBg(item)}`}
                  >
                    {Number(item.closing_qty || 0) === 0 ? '-' : formatNumber(Number(item.closing_qty || 0))}
                  </RowItemTable>
                </>
              )}
            />
          )
        }
        totalSection={
          selectedProduct &&
          dataReportStock?.recordsTotal > 0 && <Pagination postsPerPage={limit} totalPosts={Number(dataReportStock?.recordsTotal) || 0} paginate={paginate} currentPage={currentPage} />
        }
        paginationSection={selectedProduct && <DropdowLimit sLimit={handleLimitChange} limit={limit} dataLang={dataLang} />}
      />
    </>
  );
};

export default Card;
