import OnResetData from '@/components/UI/btnResetData/btnReset';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import DropdowLimit from '@/components/UI/dropdowLimit/dropdowLimit';
import DateToDateReport from '@/components/UI/filterComponents/dateTodateReport';
import SearchComponent from '@/components/UI/filterComponents/searchComponent';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import Pagination from '@/components/UI/pagination';
import SelectSearchReport from '@/components/common/select/SelectSearchReport';
import ExcelIcon from '@/components/icons/common/Excel';
import ReportLayout from '@/components/layout/ReportLayout';
import { useLanguageContext } from '@/context/ui/LanguageContext';
import usePagination from '@/hooks/usePagination';
import useStatusExprired from '@/hooks/useStatusExprired';
import formatNumber from '@/utils/helpers/formatnumber';
import moment from 'moment';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { PiPackage } from 'react-icons/pi';
import { useDebounce } from 'use-debounce';
import { useGetMaterialsLookup, useGetRawMaterialsUsed } from './hook';
import { exportWithMergeRawMaterialsUsed } from './hook/useExportExcel';
import { usePersistedBranches } from '@/hooks/common/usePersistedBranches';

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
  const { selectedBranches, setSelectedBranches } = usePersistedBranches();

  const [dateRange, setDateRange] = useState({
    startDate: undefined,
    endDate: undefined,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [limit, setLimit] = useState(15);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue] = useDebounce(searchValue, 500);
  const [productOptions, setProductOptions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState([]);

  const currentPage = Number(router.query.page) || 1;

  // Hàm chuyển đổi Date object sang định dạng d/m/Y
  const formatDateToDMY = date => {
    if (!date) return undefined;
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Tạo filter với định dạng ngày d/m/Y
  const getFormattedDateRange = () => {
    if (!dateRange?.startDate || !dateRange?.endDate) return {};

    return {
      start_date: formatDateToDMY(new Date(dateRange.startDate)),
      end_date: formatDateToDMY(new Date(dateRange.endDate)),
    };
  };

  const { data: dataMaterial } = useGetMaterialsLookup({
    search: debouncedSearchTerm,
    branch_ids: selectedBranches?.length > 0 ? selectedBranches : null,
  });

  const {
    data,
    isLoading,
    refetch: refetchRawMaterialsUsed,
  } = useGetRawMaterialsUsed({
    page: currentPage,
    limit: limit,
    ...getFormattedDateRange(),
    search: debouncedSearchValue,
    material_ids: selectedProduct?.map(item => item.value) || [],
    branch_ids: selectedBranches?.length > 0 ? selectedBranches : null,
  });

  // Tính tổng từ dữ liệu thực tế
  const calculateTotals = () => {
    if (!data?.output?.aaData) return { total_plan: 0, total_output: 0, total_return: 0, total_used: 0 };

    const flattenedData = [];
    data.output.aaData.forEach(orderItem => {
      orderItem.boms.forEach(bom => {
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

  useEffect(() => {
    if (dataMaterial) {
      const newOptions = Array.isArray(dataMaterial)
        ? dataMaterial.map(product => ({
            value: product.id,
            label: product.name,
            code: product.code,
          }))
        : [];

      // Giữ lại các options đã được chọn
      const selectedOptionValues = selectedProduct && selectedProduct.length > 0 ? selectedProduct.map(item => item.value) : [];
      const existingSelectedOptions = productOptions.filter(opt => selectedOptionValues.includes(opt.value));

      // Kết hợp options mới với các options đã chọn, loại bỏ trùng lặp
      const combinedOptions = [...existingSelectedOptions, ...newOptions];
      const uniqueOptions = combinedOptions.filter((option, index, self) => index === self.findIndex(o => o.value === option.value));

      setProductOptions(uniqueOptions);
    }
  }, [dataMaterial, selectedProduct]);

  const handleDateChange = newValue => {
    setDateRange(newValue);
  };

  const handleProductChange = values => {
    if (!values || values.length === 0) {
      setSelectedProduct([]);
      router.push({ pathname: router.pathname, query: { ...router.query, page: 1 } });
      return;
    }

    const selectedItems = values.map(value => {
      const selectedItem = productOptions.find(opt => opt.value === value);
      return {
        value: selectedItem.value,
        label: selectedItem.label,
        code: selectedItem.code,
      };
    });

    setSelectedProduct(selectedItems);
    router.push({ pathname: router.pathname, query: { ...router.query, page: 1 } });
  };

  const handleClearProduct = () => {
    setSelectedProduct([]);
    router.push({ pathname: router.pathname, query: { ...router.query, page: 1 } });
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

  // Export Excel với gộp ô theo nhóm BOM
  const handleExportExcel = () => {
    exportWithMergeRawMaterialsUsed(data?.output?.aaData || [], 'Báo cáo nguyên liệu sử dụng.xlsx');
  };

  return (
    <>
      <ReportLayout
        title={'Báo cáo nguyên liệu sử dụng'}
        statusExprired={statusExprired}
        breadcrumbItems={breadcrumbItems}
        branchValue={selectedBranches}
        onBranchChange={setSelectedBranches}
        onBranchClear={() => setSelectedBranches([])}
        filterSection={
          <div className='w-full items-center flex justify-between gap-4'>
            <div className='flex gap-3'>
              <DateToDateReport placeholder='Từ ngày đến ngày' value={dateRange} onChange={handleDateChange} className='w-[240px] 2xl:w-[250px]' />
              <SelectSearchReport
                placeholder='Nguyên liệu'
                onChange={handleProductChange}
                onClear={handleClearProduct}
                onSearch={value => setSearchTerm(value)}
                icon={<PiPackage color='#9295A4' className='size-4' />}
                className='w-[240px] 2xl:w-[250px]'
                options={productOptions}
                value={selectedProduct}
                mode='multiple'
              />
            </div>
            <div className='flex gap-3 items-center'>
              <SearchComponent dataLang={dataLang} onChange={handleSearch} value={searchValue} classNameBox='!py-2 2xl:!p-2.5' placeholder='Tìm kiếm...' />
              <OnResetData sOnFetching={() => {}} onClick={refetchRawMaterialsUsed} className='!py-3' />
              <button
                onClick={handleExportExcel}
                className='!py-3 3xl:py-3 3xl:px-4 px-3 flex items-center space-x-2 bg-white hover:bg-primary-07 rounded-lg border border-blue-fmrp transition'
              >
                <ExcelIcon className='3xl:size-5 size-4 text-blue-fmrp' />
                <span className='text-blue-fmrp responsive-text-sm font-medium whitespace-nowrap'>{dataLang?.client_list_exportexcel}</span>
              </button>
            </div>
          </div>
        }
        tableSection={
          isLoading ? (
            <Loading color='#0f4f9e' />
          ) : data?.output?.aaData?.length > 0 ? (
            <Customscrollbar alwaysShowScrollbar={true} className='h-full flex-1 overflow-auto'>
              <table className='w-full border-0 p-0 m-0'>
                <thead>
                  <tr className='responsive-text-sm sticky top-0 z-50 bg-white'>
                    {/* <th rowSpan={2} className='min-w-14 h-2 p-0 font-semibold text-gray-700 sticky left-0 bg-white z-20'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border border-[#E0E0E1]'>STT</div>
                    </th> */}
                    <th rowSpan={2} className='min-w-28 h-2 p-0 font-semibold text-gray-700 sticky left-0 bg-white z-20'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-y border-x border-[#E0E0E1]'>Ngày</div>
                    </th>
                    <th rowSpan={2} className='min-w-32 h-2 p-0 font-semibold text-gray-700 sticky left-[112px] bg-white z-20'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-y border-r border-[#E0E0E1]'>Đơn hàng bán/ Kế hoạch nội bộ</div>
                    </th>
                    <th rowSpan={2} className='min-w-40 h-2 p-0 font-semibold text-gray-700 sticky left-[240px] bg-white z-20'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-y border-r border-[#E0E0E1]'>Số lệnh SX chi tiết</div>
                    </th>
                    <th rowSpan={2} className='min-w-40 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-y border-r border-[#E0E0E1]'>Ghi chú đơn hàng</div>
                    </th>
                    <th rowSpan={2} className='min-w-36 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-y border-r border-[#E0E0E1]'>Chi nhánh</div>
                    </th>
                    <th rowSpan={2} className='min-w-32 h-2 p-0 font-semibold text-gray-700 border-r border-[#E0E0E1]'>
                      <div className='w-full h-full flex items-center px-3 py-2 border-y border-[#E0E0E1]'>Mã NVL</div>
                    </th>
                    <th rowSpan={2} className='min-w-52 h-2 p-0 font-semibold text-gray-700 border-r border-[#E0E0E1]'>
                      <div className='w-full h-full flex items-center px-3 py-2 border-y border-[#E0E0E1]'>Tên NVL</div>
                    </th>
                    <th rowSpan={2} className='min-w-52 h-2 p-0 font-semibold text-gray-700 border-r border-[#E0E0E1]'>
                      <div className='w-full h-full flex items-center px-3 py-2 border-y border-[#E0E0E1]'>Biến thể</div>
                    </th>
                    <th rowSpan={2} className='min-w-48 h-2 p-0 font-semibold text-gray-700 border-r border-[#E0E0E1]'>
                      <div className='w-full h-full flex items-center px-3 py-2 border-y border-[#E0E0E1]'>Loại</div>
                    </th>
                    <th rowSpan={2} className='min-w-28 h-2 p-0 font-semibold text-gray-700 border-r border-[#E0E0E1]'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-y border-[#E0E0E1]'>Đơn vị</div>
                    </th>
                    <th colSpan={4} className='min-w-[128px] h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-y border-r border-[#E0E0E1]'>Số lượng</div>
                    </th>
                  </tr>
                  <tr className='responsive-text-sm sticky top-[34px] 2xl:top-[40px] z-40 bg-white'>
                    <th className='min-w-32 h-2 p-0 font-semibold text-gray-700 border-r border-[#E0E0E1]'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-[#E0E0E1]'>Kế hoạch</div>
                    </th>
                    <th className='min-w-32 h-2 p-0 font-semibold text-gray-700 border-r border-[#E0E0E1]'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-[#E0E0E1]'>Đầu ra</div>
                    </th>
                    <th className='min-w-32 h-2 p-0 font-semibold text-gray-700 border-r border-[#E0E0E1]'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-[#E0E0E1]'>Nhập lại</div>
                    </th>
                    <th className='min-w-32 h-2 p-0 font-semibold text-gray-700 border-r border-[#E0E0E1]'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-[#E0E0E1]'>Đã sử dụng</div>
                    </th>
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
                          totalBoms: orderItem.boms.length,
                        });
                      });
                    });

                    return flattenedData.map((flattenedItem, index) => (
                      <tr key={`${flattenedItem.orderIndex}-${flattenedItem.bomIndex}`} className='hover:bg-gray-50 responsive-text-sm relative'>
                        {/* STT - chỉ hiển thị ở bom đầu tiên với rowspan */}
                        {/* {flattenedItem.isFirstBom && (
                          <td rowSpan={flattenedItem.totalBoms} className='p-0 h-2 text-center text-gray-700 align-middle sticky left-0 z-20 bg-white'>
                            <div className='w-full h-full flex items-center justify-center px-3 py-2 border-x border-b border-[#E0E0E1]'>{flattenedItem.orderIndex + 1}</div>
                          </td>
                        )} */}

                        {/* Ngày - chỉ hiển thị ở bom đầu tiên với rowspan */}
                        {flattenedItem.isFirstBom && (
                          <td rowSpan={flattenedItem.totalBoms} className='p-0 h-2 text-center text-gray-700 align-middle bg-white sticky left-0 z-20'>
                            <div className='w-full h-full flex items-center justify-center px-3 py-2 border-x border-b border-[#E0E0E1]'>{moment(flattenedItem.po_date).format('DD/MM/YYYY')}</div>
                          </td>
                        )}

                        {/* Đơn hàng bán - chỉ hiển thị ở bom đầu tiên với rowspan */}
                        {flattenedItem.isFirstBom && (
                          <td rowSpan={flattenedItem.totalBoms} className='p-0 h-2 text-center text-gray-700 align-middle sticky left-[112px] z-20 bg-white'>
                            <div className='w-full h-full flex items-center justify-center px-3 py-2 border-r border-b border-[#E0E0E1]'>{flattenedItem?.object_data?.reference_no}</div>
                          </td>
                        )}

                        {/* Số lệnh SX chi tiết - chỉ hiển thị ở bom đầu tiên với rowspan */}
                        {flattenedItem.isFirstBom && (
                          <td rowSpan={flattenedItem.totalBoms} className='p-0 h-2 text-center text-gray-700 align-middle sticky left-[240px] z-20 bg-white'>
                            <div className='w-full h-full flex items-center justify-center px-3 py-2 border-r border-b border-[#E0E0E1]'>{flattenedItem.reference_no_detail}</div>
                          </td>
                        )}

                        {/* Ghi chú đơn hàng - chỉ hiển thị ở bom đầu tiên với rowspan */}
                        {flattenedItem.isFirstBom && (
                          <td rowSpan={flattenedItem.totalBoms} className='p-0 h-2 text-center text-gray-700 align-middle'>
                            <div className='w-full h-full flex items-center justify-center px-3 py-2 border-r border-b border-[#E0E0E1]'>{flattenedItem?.object_data?.note || '-'}</div>
                          </td>
                        )}

                        {/* Chi nhánh - chỉ hiển thị ở bom đầu tiên với rowspan */}
                        {flattenedItem.isFirstBom && (
                          <td rowSpan={flattenedItem.totalBoms} className='p-0 h-2 text-center text-gray-700 align-middle bg-white'>
                            <div className='w-full h-full flex items-center justify-center px-3 py-2 border-r border-b border-[#E0E0E1]'>{flattenedItem?.branch_name || '-'}</div>
                          </td>
                        )}

                        {/* Mã NVL - hiển thị cho mỗi bom */}
                        <td className='px-3 py-2 text-left text-gray-700 border-r border-b border-[#E0E0E1]'>{flattenedItem.bom.item_code}</td>

                        {/* Tên NVL - hiển thị cho mỗi bom */}
                        <td className='px-3 py-2 text-left text-gray-700 border-r border-b border-[#E0E0E1]'>{flattenedItem.bom.item_name}</td>
                        <td className='px-3 py-2 text-left text-gray-700 border-r border-b border-[#E0E0E1]'>{flattenedItem.bom.variant_name}</td>

                        {/* Loại - hiển thị cho mỗi bom */}
                        <td className='px-3 py-2 text-left text-gray-700 border-r border-b border-[#E0E0E1]'>
                          {flattenedItem.bom.type_products === 'materials'
                            ? 'Nguyên vật liệu'
                            : flattenedItem.bom.type_products === 'semi_products'
                            ? 'Bán thành phẩm'
                            : flattenedItem.bom.type_products === 'semi_products_outside'
                            ? 'Bán thành phẩm ngoài'
                            : flattenedItem.bom.type_products}
                        </td>

                        {/* Đơn vị - hiển thị cho mỗi bom */}
                        <td className='px-3 py-2 text-center text-gray-700 border-r border-b border-[#E0E0E1]'>{flattenedItem.bom.unit_name}</td>

                        {/* Số lượng kế hoạch - hiển thị cho mỗi bom */}
                        <td className='px-3 py-2 text-center text-gray-700 border-r border-b border-[#E0E0E1]'>
                          {flattenedItem.bom.quota_primary == 0 ? '-' : formatNumber(Number(flattenedItem.bom.quota_primary))}
                        </td>

                        {/* Số lượng đầu ra - hiển thị cho mỗi bom */}
                        <td className='px-3 py-2 text-center text-gray-700 border-r border-b border-[#E0E0E1]'>
                          {flattenedItem.bom.quantity_export == 0 ? '-' : formatNumber(Number(flattenedItem.bom.quantity_export))}
                        </td>

                        {/* Số lượng nhập lại - hiển thị cho mỗi bom */}
                        <td className='px-3 py-2 text-center text-gray-700 border-r border-b border-[#E0E0E1]'>
                          {flattenedItem.bom.quantity_purchase_internal == 0 ? '-' : formatNumber(Number(flattenedItem.bom.quantity_purchase_internal))}
                        </td>

                        {/* Số lượng đã sử dụng - hiển thị cho mỗi bom */}
                        <td className='px-3 py-2 text-center text-gray-700 border-r border-b border-[#E0E0E1]'>
                          {flattenedItem.bom.quantity_used == 0 ? '-' : formatNumber(Number(flattenedItem.bom.quantity_used))}
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
                <tfoot>
                  <tr className='bg-white sticky bottom-0 z-50 responsive-text-sm'>
                    <td className='w-48 p-0 h-2 text-center font-semibold text-gray-700 sticky left-0 z-20 bg-white'>
                      <div className='w-full h-full border-t border-[#E0E0E1]'></div>
                    </td>
                    <td className='w-48 p-0 h-2 text-center font-semibold text-gray-700 sticky left-[112px] z-20 bg-white'>
                      <div className='w-full h-full border-t border-[#E0E0E1]'></div>
                    </td>
                    <td className='w-40 p-0 h-2 text-center font-semibold text-gray-700 sticky left-[240px] z-20 bg-white'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-t border-[#E0E0E1] uppercase'>Tổng cộng</div>
                    </td>
                    <td className='w-40 p-0 h-2 text-center font-semibold text-gray-700'>
                      <div className='w-full h-full border-t border-[#E0E0E1]'></div>
                    </td>
                    <td className='w-28 p-0 h-2 text-center font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-t border-[#E0E0E1]'></div>
                    </td>
                    <td className='w-32 p-0 h-2 text-center font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-t border-[#E0E0E1]'></div>
                    </td>
                    <td className='w-48 p-0 h-2 text-center font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-t border-[#E0E0E1]'></div>
                    </td>
                    <td className='w-32 p-0 h-2 text-center font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-t border-[#E0E0E1]'></div>
                    </td>
                    <td className='w-28 p-0 h-2 text-center font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-t border-[#E0E0E1]'></div>
                    </td>
                    <td className='w-28 p-0 h-2 text-center font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-t border-[#E0E0E1]'></div>
                    </td>
                    <td className='w-32 p-0 h-2 text-center font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-t border-[#E0E0E1]'>{formatNumber(totals.total_plan)}</div>
                    </td>
                    <td className='w-32 p-0 h-2 text-center font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-t border-[#E0E0E1]'>{formatNumber(totals.total_output)}</div>
                    </td>
                    <td className='w-32 p-0 h-2 text-center font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-t border-[#E0E0E1]'>{formatNumber(totals.total_return)}</div>
                    </td>
                    <td className='w-32 p-0 h-2 text-center font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-t border-[#E0E0E1]'>{formatNumber(totals.total_used)}</div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </Customscrollbar>
          ) : (
            <NoData type='report' classNameImage='w-[245px]' />
          )
        }
        totalSection={<Pagination postsPerPage={limit} totalPosts={Number(data?.output?.iTotalDisplayRecords) || 0} paginate={paginate} currentPage={currentPage} />}
        paginationSection={<DropdowLimit sLimit={handleLimitChange} limit={limit} dataLang={dataLang} />}
      />
    </>
  );
};

export default RawMaterialsUsed;
