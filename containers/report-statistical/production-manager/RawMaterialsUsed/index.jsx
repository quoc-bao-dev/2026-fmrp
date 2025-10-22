import OnResetData from '@/components/UI/btnResetData/btnReset';
import { RowItemTable } from '@/components/UI/common/Table';
import DropdowLimit from '@/components/UI/dropdowLimit/dropdowLimit';
import DateToDateReport from '@/components/UI/filterComponents/dateTodateReport';
import ExcelFileComponent from '@/components/UI/filterComponents/excelFilecomponet';
import SearchComponent from '@/components/UI/filterComponents/searchComponent';
import SelectSearchReport from '@/components/common/select/SelectSearchReport';
import ReportLayout from '@/components/layout/ReportLayout';
import TableSection from '@/components/layout/ReportLayout/TableSection';
import Pagination from '@/components/UI/pagination';
import { useLanguageContext } from '@/context/ui/LanguageContext';
import usePagination from '@/hooks/usePagination';
import useStatusExprired from '@/hooks/useStatusExprired';
import formatNumber from '@/utils/helpers/formatnumber';
import { PiPackage, PiCalendar, PiBox } from 'react-icons/pi';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useInventoryItems } from '@/containers/manufacture/inventory/hooks/useInventoryItems';
import { useGetBOMs } from './hook';
import { useExportExcel } from './hook/useExportExcel';

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
    label: `Nguyên liệu sử dụng`,
  },
];

// Mock data - thay thế bằng API thực tế
const mockData = [
  {
    id: 1,
    order_number: 'DH001',
    order_note: 'Giao hàng gấp',
    production_order: 'SX001',
    date: '2024-01-15',
    material_code: 'NVL001',
    material_name: 'Vải cotton 100%',
    material_type: 'Vải',
    unit_name: 'Mét',
    output_quantity: 100,
    return_quantity: 5,
    used_quantity: 95,
  },
  {
    id: 2,
    order_number: 'DH002',
    order_note: '',
    production_order: 'SX002',
    date: '2024-01-16',
    material_code: 'NVL002',
    material_name: 'Chỉ may',
    material_type: 'Phụ liệu',
    unit_name: 'Cuộn',
    output_quantity: 50,
    return_quantity: 0,
    used_quantity: 50,
  },
  {
    id: 3,
    order_number: 'DH003',
    order_note: 'Màu đen',
    production_order: 'SX003',
    date: '2024-01-17',
    material_code: 'NVL003',
    material_name: 'Khóa kéo',
    material_type: 'Phụ liệu',
    unit_name: 'Cái',
    output_quantity: 75,
    return_quantity: 2,
    used_quantity: 73,
  },
];

const RawMaterialsUsed = () => {
  const router = useRouter();
  const { paginate } = usePagination();
  const dataLang = useLanguageContext();
  const statusExprired = useStatusExprired();

  const [dateRange, setDateRange] = useState({
    startDate: undefined,
    endDate: undefined,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [limit, setLimit] = useState(15);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue] = useDebounce(searchValue, 500);

  const currentPage = Number(router.query.page) || 1;

  const { data: dataProduct } = useInventoryItems(debouncedSearchTerm);
  const { data } = useGetBOMs({
    page: currentPage,
    limit: limit,
    search: debouncedSearchValue,
    material_id: selectedMaterial?.map(item => item.value) || [],
  });

  const mockTotal = {
    total_records: mockData.length,
    total_output: mockData.reduce((sum, item) => sum + item.output_quantity, 0),
    total_return: mockData.reduce((sum, item) => sum + item.return_quantity, 0),
    total_used: mockData.reduce((sum, item) => sum + item.used_quantity, 0),
  };

  const handleDateChange = newValue => {
    setDateRange(newValue);
  };

  const handleMaterialChange = value => {
    setSelectedMaterial(value);
  };

  const handleClearMaterial = () => {
    setSelectedMaterial(null);
  };

  const handleSearch = value => {
    const searchValue = value?.target?.value || (typeof value === 'string' ? value : '');
    setSearchValue(searchValue);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: 1 },
    });
  };

  const handleLimitChange = newLimit => {
    setLimit(newLimit);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: 1 },
    });
  };

  const handleResetData = () => {
    setDateRange({
      startDate: undefined,
      endDate: undefined,
    });
    setSearchTerm('');
    setSelectedMaterial(null);
    setSearchValue('');
    setLimit(15);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: 1 },
    });
  };

  const { multiDataSet } = useExportExcel(mockData || []);
  // const { multiDataSet } = useExportExcel(data?.output?.aaData || []);

  return (
    <>
      <ReportLayout
        title={'Báo cáo nguyên liệu sử dụng'}
        statusExprired={statusExprired}
        breadcrumbItems={breadcrumbItems}
        filterSection={
          <div className='w-full items-center flex justify-between gap-4'>
            <div className='flex gap-3'>
              <DateToDateReport
                placeholder='Từ ngày đến ngày'
                value={dateRange}
                onChange={handleDateChange}
                icon={<PiCalendar color='#9295A4' className='size-4' />}
                className='w-[240px] 2xl:w-[250px]'
              />
              <SelectSearchReport
                placeholder='Nguyên liệu'
                onChange={handleMaterialChange}
                onClear={handleClearMaterial}
                icon={<PiPackage color='#9295A4' className='size-4' />}
                className='w-[240px] 2xl:w-[250px]'
                options={[
                  { value: '1', label: 'NVL001 - Vải cotton 100%' },
                  { value: '2', label: 'NVL002 - Chỉ may' },
                  { value: '3', label: 'NVL003 - Khóa kéo' },
                ]}
                value={selectedMaterial}
              />
            </div>
            <div className='flex gap-3 items-center'>
              <SearchComponent dataLang={dataLang} onChange={handleSearch} value={searchValue} classNameBox='!py-2 2xl:!p-2.5' placeholder='Tìm kiếm...' />
              <OnResetData sOnFetching={() => {}} onClick={handleResetData} className='!py-3' />
              <ExcelFileComponent dataLang={dataLang} filename='Báo cáo nguyên liệu sử dụng' title='BCNLSD' multiDataSet={multiDataSet} classBtn='!py-3' />
            </div>
          </div>
        }
        tableSection={
          <TableSection
            fixedColumns={[
              { title: 'STT', width: 'w-14', textAlign: 'center' },
              { title: 'Đơn hàng bán/ Kế hoạch nội bộ', width: 'w-48', textAlign: 'center', className: 'text-center' },
              { title: 'Ghi chú đơn hàng', width: 'w-40', textAlign: 'center', className: 'text-center' },
              { title: 'Số lệnh SX chi tiết', width: 'w-40', textAlign: 'center' },
            ]}
            scrollableColumns={[
              { title: 'Ngày', width: 'w-28', textAlign: 'center' },
              { title: 'Mã NVL', width: 'w-32', textAlign: 'center' },
              { title: 'Tên NVL', width: 'w-48', textAlign: 'left' },
              { title: 'Loại', width: 'w-32', textAlign: 'center' },
              { title: 'Đơn vị', width: 'w-28', textAlign: 'center' },
            ]}
            groupedHeaders={[
              {
                title: 'Số lượng',
                columns: [
                  { title: 'Đầu ra', width: 'w-32', textAlign: 'center' },
                  { title: 'Nhập lại', width: 'w-32', textAlign: 'center' },
                  { title: 'Đã sử dụng', width: 'w-32', textAlign: 'center' },
                ],
              },
            ]}
            data={mockData}
            isFetching={false}
            renderFixedRow={(item, index) => (
              <>
                <RowItemTable className='w-14 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0'>{index + 1}</RowItemTable>
                <RowItemTable className='w-48 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0'>{item.order_number}</RowItemTable>
                <RowItemTable className='w-40 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0'>
                  <span className='text-center responsive-text-sm'>{item.order_note || '-'}</span>
                </RowItemTable>
                <RowItemTable className='w-40 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0'>{item.production_order}</RowItemTable>
              </>
            )}
            renderScrollableRow={(item, index) => (
              <>
                <RowItemTable className='w-28 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0'>
                  {new Date(item.date).toLocaleDateString('vi-VN')}
                </RowItemTable>
                <RowItemTable className='w-32 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0'>{item.material_code}</RowItemTable>
                <RowItemTable className='w-48 flex items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0'>
                  <span className='text-left responsive-text-sm'>{item.material_name}</span>
                </RowItemTable>
                <RowItemTable className='w-32 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0'>{item.material_type}</RowItemTable>
                <RowItemTable className='w-28 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0'>{item.unit_name}</RowItemTable>
                <RowItemTable className='w-32 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0'>
                  {formatNumber(item.output_quantity)}
                </RowItemTable>
                <RowItemTable className='w-32 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0'>
                  {formatNumber(item.return_quantity)}
                </RowItemTable>
                <RowItemTable className='w-32 flex justify-center items-center py-2 px-3 text-neutral-07 font-normal flex-shrink-0'>{formatNumber(item.used_quantity)}</RowItemTable>
              </>
            )}
            renderFooter={() => (
              <>
                <RowItemTable className='w-14 flex-shrink-0 bg-white'></RowItemTable>
                <RowItemTable className='w-48 flex-shrink-0 bg-white'></RowItemTable>
                <RowItemTable className='w-40 flex-shrink-0 bg-white'></RowItemTable>
                <RowItemTable className='w-40 flex-shrink-0 bg-white'></RowItemTable>

                <RowItemTable className='h-10 w-28 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white'>Tổng cộng</RowItemTable>
                <RowItemTable className='h-10 w-32 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white'>-</RowItemTable>
                <RowItemTable className='h-10 w-48 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white'>-</RowItemTable>
                <RowItemTable className='h-10 w-32 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white'>-</RowItemTable>
                <RowItemTable className='h-10 w-28 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white'>-</RowItemTable>
                <RowItemTable className='h-10 w-32 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white'>{formatNumber(mockTotal.total_output)}</RowItemTable>
                <RowItemTable className='h-10 w-32 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white'>{formatNumber(mockTotal.total_return)}</RowItemTable>
                <RowItemTable className='h-10 w-32 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white'>{formatNumber(mockTotal.total_used)}</RowItemTable>
              </>
            )}
          />
        }
        totalSection={<Pagination postsPerPage={limit} totalPosts={Number(data?.output?.iTotalDisplayRecords) || 0} paginate={paginate} currentPage={currentPage} />}
        paginationSection={<DropdowLimit sLimit={handleLimitChange} limit={limit} dataLang={dataLang} />}
      />
    </>
  );
};

export default RawMaterialsUsed;
