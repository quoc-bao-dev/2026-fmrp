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
import { useGetBOMs, useGetRawMaterialsUsed } from './hook';
import { useExportExcel } from './hook/useExportExcel';
import moment from 'moment';

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
  const { data } = useGetRawMaterialsUsed({
    page: currentPage,
    limit: limit,
    search: debouncedSearchValue,
    material_id: selectedMaterial?.map(item => item.value) || [],
  });

  // Tính tổng từ dữ liệu thực tế
  const calculateTotals = () => {
    if (!data?.output?.aaData) return { total_plan: 0, total_output: 0, total_return: 0, total_used: 0 };
    
    const flattenedData = [];
    data.output.aaData.forEach((orderItem) => {
      orderItem.boms.forEach((bom) => {
        flattenedData.push(bom);
      });
    });
    
    return {
      total_plan: flattenedData.reduce((sum, bom) => sum + (parseFloat(bom.quota_primary) || 0), 0),
      total_output: flattenedData.reduce((sum, bom) => sum + (parseFloat(bom.quantity_export) || 0), 0),
      total_return: flattenedData.reduce((sum, bom) => sum + (parseFloat(bom.quantity_purchase_internal) || 0), 0),
      total_used: flattenedData.reduce((sum, bom) => sum + (parseFloat(bom.quantity_used) || 0), 0),
    };
  };
  
  const totals = calculateTotals();

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

  // const { multiDataSet } = useExportExcel(mockData || []);
  const { multiDataSet } = useExportExcel(data?.output?.aaData || []);

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
          <div className="relative w-full overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="responsive-text-sm">
                  <th className="min-w-14 px-3 py-2 text-center font-semibold text-gray-700 border border-gray-400 sticky left-0 bg-white z-20" style={{borderRight: '1px solid #9ca3af'}}>STT</th>
                  <th className="min-w-48 px-3 py-2 text-center font-semibold text-gray-700 border border-gray-400 sticky left-14 bg-white z-20" style={{borderRight: '1px solid #9ca3af'}}>Đơn hàng bán/ Kế hoạch nội bộ</th>
                  <th className="min-w-40 px-3 py-2 text-center font-semibold text-gray-700 border border-gray-400 sticky left-[248px] bg-white z-20" style={{borderRight: '1px solid #9ca3af'}}>Ghi chú đơn hàng</th>
                  <th className="min-w-40 px-3 py-2 text-center font-semibold text-gray-700 border border-gray-400 sticky left-[392px] bg-white z-20" style={{borderRight: '1px solid #9ca3af'}}>Số lệnh SX chi tiết</th>
                  <th className="min-w-28 px-3 py-2 text-center font-semibold text-gray-700 border border-gray-400">Ngày</th>
                  <th className="min-w-32 px-3 py-2 text-center font-semibold text-gray-700 border border-gray-400">Mã NVL</th>
                  <th className="min-w-52 px-3 py-2 text-center font-semibold text-gray-700 border border-gray-400">Tên NVL</th>
                  <th className="min-w-48 px-3 py-2 text-center font-semibold text-gray-700 border border-gray-400">Loại</th>
                  <th className="min-w-28 px-3 py-2 text-center font-semibold text-gray-700 border border-gray-400">Đơn vị</th>
                  <th className="min-w-32 px-3 py-2 text-center font-semibold text-gray-700 border border-gray-400">Kế hoạch</th>
                  <th className="min-w-32 px-3 py-2 text-center font-semibold text-gray-700 border border-gray-400">Đầu ra</th>
                  <th className="min-w-32 px-3 py-2 text-center font-semibold text-gray-700 border border-gray-400">Nhập lại</th>
                  <th className="min-w-32 px-3 py-2 text-center font-semibold text-gray-700 border border-gray-400">Đã sử dụng</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  // Tạo mảng dữ liệu đã được "flatten" để hiển thị từng bom item
                  const flattenedData = [];
                  let globalIndex = 0;
                  
                  data?.output?.aaData?.forEach((orderItem, orderIndex) => {
                    orderItem.boms.forEach((bom, bomIndex) => {
                      flattenedData.push({
                        ...orderItem,
                        bom,
                        globalIndex: globalIndex++,
                        orderIndex,
                        bomIndex,
                        isFirstBom: bomIndex === 0,
                        isLastBom: bomIndex === orderItem.boms.length - 1,
                        totalBoms: orderItem.boms.length
                      });
                    });
                  });
                  
                  return flattenedData.map((flattenedItem, index) => (
                    <tr key={`${flattenedItem.orderIndex}-${flattenedItem.bomIndex}`} className="hover:bg-gray-50">
                      {/* STT - chỉ hiển thị ở bom đầu tiên với rowspan */}
                      {flattenedItem.isFirstBom && (
                        <td 
                          rowSpan={flattenedItem.totalBoms}
                          className="w-14 px-3 py-2 text-center text-sm text-gray-700 border border-gray-400 align-middle sticky left-0 bg-white z-20"
                          style={{borderRight: '1px solid #9ca3af'}}
                        >
                          {flattenedItem.orderIndex + 1}
                        </td>
                      )}
                      
                      {/* Đơn hàng bán - chỉ hiển thị ở bom đầu tiên với rowspan */}
                      {flattenedItem.isFirstBom && (
                        <td 
                          rowSpan={flattenedItem.totalBoms}
                          className="w-48 px-3 py-2 text-center text-sm text-gray-700 border border-gray-400 align-middle sticky left-14 bg-white z-20"
                          style={{borderRight: '1px solid #9ca3af'}}
                        >
                          {flattenedItem.object_data.reference_no}
                        </td>
                      )}
                      
                      {/* Ghi chú đơn hàng - chỉ hiển thị ở bom đầu tiên với rowspan */}
                      {flattenedItem.isFirstBom && (
                        <td 
                          rowSpan={flattenedItem.totalBoms}
                          className="w-40 px-3 py-2 text-center text-sm text-gray-700 border border-gray-400 align-middle sticky left-[248px] bg-white z-20"
                          style={{borderRight: '1px solid #9ca3af'}}
                        >
                          {flattenedItem?.object_data?.note || '-'}
                        </td>
                      )}
                      
                      {/* Số lệnh SX chi tiết - chỉ hiển thị ở bom đầu tiên với rowspan */}
                      {flattenedItem.isFirstBom && (
                        <td 
                          rowSpan={flattenedItem.totalBoms}
                          className="w-40 px-3 py-2 text-center text-sm text-gray-700 border border-gray-400 align-middle sticky left-[392px] bg-white z-20"
                          style={{borderRight: '1px solid #9ca3af'}}
                        >
                          {flattenedItem.reference_no_detail}
                        </td>
                      )}
                      
                      {/* Ngày - chỉ hiển thị ở bom đầu tiên với rowspan */}
                      {flattenedItem.isFirstBom && (
                        <td 
                          rowSpan={flattenedItem.totalBoms}
                          className="w-28 px-3 py-2 text-center text-sm text-gray-700 border border-gray-400 align-middle"
                        >
                          {moment(flattenedItem.po_date).format('DD/MM/YYYY')}
                        </td>
                      )}
                      
                      {/* Mã NVL - hiển thị cho mỗi bom */}
                      <td className="w-32 px-3 py-2 text-center text-sm text-gray-700 border border-gray-400">
                        {flattenedItem.bom.item_code}
                      </td>
                      
                      {/* Tên NVL - hiển thị cho mỗi bom */}
                      <td className="w-48 px-3 py-2 text-left text-sm text-gray-700 border border-gray-400">
                        {flattenedItem.bom.item_name}
                      </td>
                      
                      {/* Loại - hiển thị cho mỗi bom */}
                      <td className="w-32 px-3 py-2 text-center text-sm text-gray-700 border border-gray-400">
                        {flattenedItem.bom.type_products === 'materials' ? 'Nguyên vật liệu' : 
                         flattenedItem.bom.type_products === 'semi_products' ? 'Bán thành phẩm' : 
                         flattenedItem.bom.type_products === 'semi_products_outside' ? 'Bán thành phẩm ngoài' : 
                         flattenedItem.bom.type_products}
                      </td>
                      
                      {/* Đơn vị - hiển thị cho mỗi bom */}
                      <td className="w-28 px-3 py-2 text-center text-sm text-gray-700 border border-gray-400">
                        {flattenedItem.bom.unit_name}
                      </td>
                      
                      {/* Số lượng kế hoạch - hiển thị cho mỗi bom */}
                      <td className="w-32 px-3 py-2 text-center text-sm text-gray-700 border border-gray-400">
                        {formatNumber(Number(flattenedItem.bom.quota_primary))}
                      </td>

                      {/* Số lượng đầu ra - hiển thị cho mỗi bom */}
                      <td className="w-32 px-3 py-2 text-center text-sm text-gray-700 border border-gray-400">
                        {formatNumber(Number(flattenedItem.bom.quantity_export))}
                      </td>
                      
                      {/* Số lượng nhập lại - hiển thị cho mỗi bom */}
                      <td className="w-32 px-3 py-2 text-center text-sm text-gray-700 border border-gray-400">
                        {formatNumber(Number(flattenedItem.bom.quantity_purchase_internal))}
                      </td>
                      
                      {/* Số lượng đã sử dụng - hiển thị cho mỗi bom */}
                      <td className="w-32 px-3 py-2 text-center text-sm text-gray-700 border border-gray-400">
                        {formatNumber(Number(flattenedItem.bom.quantity_used))}
                      </td>
                    </tr>
                  ));
                })()}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100">
                  <td className="w-14 px-3 py-2 text-center text-sm font-semibold text-gray-700 border border-gray-400 sticky left-0 bg-gray-100 z-20" style={{borderRight: '1px solid #9ca3af'}}></td>
                  <td className="w-48 px-3 py-2 text-center text-sm font-semibold text-gray-700 border border-gray-400 sticky left-14 bg-gray-100 z-20" style={{borderRight: '1px solid #9ca3af'}}></td>
                  <td className="w-40 px-3 py-2 text-center text-sm font-semibold text-gray-700 border border-gray-400 sticky left-[248px] bg-gray-100 z-20" style={{borderRight: '1px solid #9ca3af'}}></td>
                  <td className="w-40 px-3 py-2 text-center text-sm font-semibold text-gray-700 border border-gray-400 sticky left-[392px] bg-gray-100 z-20" style={{borderRight: '1px solid #9ca3af'}}></td>
                  <td className="w-28 px-3 py-2 text-center text-sm font-semibold text-gray-700 border border-gray-400 sticky left-[536px] bg-gray-100 z-20" style={{borderRight: '1px solid #9ca3af'}}>Tổng cộng</td>
                  <td className="w-32 px-3 py-2 text-center text-sm font-semibold text-gray-700 border border-gray-400">-</td>
                  <td className="w-48 px-3 py-2 text-center text-sm font-semibold text-gray-700 border border-gray-400">-</td>
                  <td className="w-32 px-3 py-2 text-center text-sm font-semibold text-gray-700 border border-gray-400">-</td>
                  <td className="w-28 px-3 py-2 text-center text-sm font-semibold text-gray-700 border border-gray-400">-</td>
                  <td className="w-32 px-3 py-2 text-center text-sm font-semibold text-gray-700 border border-gray-400">{formatNumber(totals.total_plan)}</td>
                  <td className="w-32 px-3 py-2 text-center text-sm font-semibold text-gray-700 border border-gray-400">{formatNumber(totals.total_output)}</td>
                  <td className="w-32 px-3 py-2 text-center text-sm font-semibold text-gray-700 border border-gray-400">{formatNumber(totals.total_return)}</td>
                  <td className="w-32 px-3 py-2 text-center text-sm font-semibold text-gray-700 border border-gray-400">{formatNumber(totals.total_used)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        }
        totalSection={<Pagination postsPerPage={limit} totalPosts={Number(data?.output?.iTotalDisplayRecords) || 0} paginate={paginate} currentPage={currentPage} />}
        paginationSection={<DropdowLimit sLimit={handleLimitChange} limit={limit} dataLang={dataLang} />}
      />
    </>
  );
};

export default RawMaterialsUsed;
