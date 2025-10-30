'use client';
import SelectSearchReport from '@/components/common/select/SelectSearchReport';
import ReportLayout from '@/components/layout/ReportLayout';
import OnResetData from '@/components/UI/btnResetData/btnReset';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import DropdowLimit from '@/components/UI/dropdowLimit/dropdowLimit';
import ExcelFileComponent from '@/components/UI/filterComponents/excelFilecomponet';
import SearchComponent from '@/components/UI/filterComponents/searchComponent';
import NoData from '@/components/UI/noData/nodata';
import PaginationComponent from '@/components/UI/pagination';
import { useInventoryItems } from '@/containers/manufacture/inventory/hooks/useInventoryItems';
import { useLanguageContext } from '@/context/ui/LanguageContext';
import usePagination from '@/hooks/usePagination';
import useStatusExprired from '@/hooks/useStatusExprired';
import formatNumber from '@/utils/helpers/formatnumber';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { PiPackage } from 'react-icons/pi';
import { useDebounce } from 'use-debounce';
import { useGetBOMs } from './hook';
import { useExportExcel } from './hook/useExportExcel';
import { useGetItemsWithBranch } from '../OrderProgress/hook';
import { usePersistedBranches } from '@/hooks/common/usePersistedBranches';

const breadcrumbItems = [
  {
    label: `Báo cáo`,
  },
  {
    label: `Quản lý sản xuất`,
    href: '/report-statistical/production-manager',
  },
  {
    label: `Định mức NVL`,
  },
];

const QuotaMaterials = () => {
  const router = useRouter();
  const { paginate } = usePagination();
  const dataLang = useLanguageContext();
  const statusExprired = useStatusExprired();
  const { selectedBranches, setSelectedBranches } = usePersistedBranches();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [selectedProduct, setSelectedProduct] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [limit, setLimit] = useState(15);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue] = useDebounce(searchValue, 500);
  const [productOptions, setProductOptions] = useState([]);

  const currentPage = Number(router.query.page) || 1;

  const { data: dataProduct } = useGetItemsWithBranch({
    search: debouncedSearchTerm,
    branch_ids: selectedBranches?.length > 0 ? selectedBranches : null,
  });
  const { data, refetch: refetchQuotaMaterials } = useGetBOMs({
    page: currentPage,
    limit: limit,
    search: debouncedSearchValue,
    product_id: selectedProduct?.map(item => item.value) || [],
    branch_ids: selectedBranches?.length > 0 ? selectedBranches : null,
  });

  // Cập nhật productOptions khi dataProduct thay đổi
  useEffect(() => {
    if (dataProduct) {
      const newOptions = Array.isArray(dataProduct)
        ? dataProduct.map(product => ({
            value: product.value,
            label: product.name,
            code: product.code,
          }))
        : [];

      // Giữ lại các options đã được chọn
      const selectedOptionValues = selectedProduct?.map(item => item.value) || [];
      const existingSelectedOptions = productOptions.filter(opt => selectedOptionValues.includes(opt.value));

      // Kết hợp options mới với các options đã chọn, loại bỏ trùng lặp
      const combinedOptions = [...existingSelectedOptions, ...newOptions];
      const uniqueOptions = combinedOptions.filter((option, index, self) => index === self.findIndex(o => o.value === option.value));

      setProductOptions(uniqueOptions);
    }
  }, [dataProduct, selectedProduct]);

  const handleProductChange = values => {
    if (!values || values.length === 0) {
      setSelectedProduct([]);
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
  };

  const handleClearProduct = () => {
    setSelectedProduct([]);
    setSearchTerm(''); // Reset search term khi clear
  };

  const handleSearch = value => {
    const searchValue = value?.target?.value || (typeof value === 'string' ? value : '');
    setSearchValue(searchValue);
  };

  const handleLimitChange = newLimit => {
    setLimit(newLimit);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: 1 },
    });
  };

  // Flatten data để hiển thị bom_items dưới mỗi sản phẩm chính
  const flattenedData =
    data?.output?.aaData?.reduce((acc, product, productIndex) => {
      // Thêm sản phẩm chính
      acc.push({
        ...product,
        isMainProduct: true,
        displayIndex: productIndex + 1,
        material_code: product.product_code,
        material_name: product.product_name,
        unit_name: product.unit_name,
        quota_quantity: product.quantity,
      });

      // Thêm các bom_items
      if (product.bom_items && product.bom_items.length > 0) {
        product.bom_items.forEach((bomItem, bomIndex) => {
          acc.push({
            ...bomItem,
            isMainProduct: false,
            displayIndex: '', // Không hiển thị số thứ tự cho phần tử con
            material_code: bomItem.item_code,
            variant_name: bomItem.item_variant_name,
            material_name: bomItem.item_name,
            material_type: bomItem.type_item === 'material' ? 'Nguyên vật liệu' : 'BTP - thành phẩm',
            unit_name: bomItem.unit_name,
            quota_quantity: bomItem.quota,
            stage_name: bomItem.stage_name,
            parentProduct: product.product_name,
          });
        });
      }

      return acc;
    }, []) || [];

  const { multiDataSet } = useExportExcel(flattenedData);

  return (
    <>
      <ReportLayout
        title={'Báo cáo định mức NVL'}
        statusExprired={statusExprired}
        breadcrumbItems={breadcrumbItems}
        maginBottom={true}
        branchValue={selectedBranches}
        onBranchChange={setSelectedBranches}
        onBranchClear={() => setSelectedBranches([])}
        filterSection={
          <div className='w-full items-center flex justify-between gap-4'>
            <div className='flex gap-3'>
              <SelectSearchReport
                placeholder='Thành phẩm'
                onSearch={value => {
                  setSearchTerm(value);
                }}
                onChange={handleProductChange}
                onClear={handleClearProduct}
                icon={<PiPackage color='#9295A4' className='size-4' />}
                className='w-[200px] 2xl:w-[250px]'
                options={productOptions}
                value={selectedProduct}
                mode='multiple'
              />
            </div>
            <div className='flex gap-3 items-center'>
              <SearchComponent dataLang={dataLang} onChange={handleSearch} value={searchValue} classNameBox='!py-2 2xl:!p-2.5' placeholder='Tìm kiếm...' />
              <OnResetData sOnFetching={() => {}} onClick={refetchQuotaMaterials} className='!py-3' />
              <ExcelFileComponent dataLang={dataLang} filename='Báo cáo định mức NVL' title='BCDMNVL' multiDataSet={multiDataSet} classBtn='!py-3' />
            </div>
          </div>
        }
        tableSection={
          flattenedData?.length > 0 ? (
            <Customscrollbar alwaysShowScrollbar={true} className='h-full flex-1 overflow-auto border border-[#E0E0E1]'>
              <table className='w-full border-0 p-0 m-0'>
                <thead>
                  <tr className='responsive-text-sm bg-white sticky top-0 z-50 capitalize'>
                    <th className='min-w-40 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Mã nguyên vật liệu</div>
                    </th>
                    <th className='min-w-64 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Tên nguyên vật liệu</div>
                    </th>
                    <th className='min-w-44 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Loại</div>
                    </th>
                    <th className='min-w-40 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Biến thể</div>
                    </th>
                    <th className='min-w-28 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Đơn vị</div>
                    </th>
                    <th className='min-w-40 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-[#E0E0E1]'>Số lượng định mức</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {flattenedData.map((item, index) => (
                    <tr key={index} className='hover:bg-gray-50 responsive-text-sm'>
                      <td className={`px-3 py-2 text-left text-gray-700 border-r border-b border-[#E0E0E1] ${
                        item.isMainProduct ? 'bg-blue-50 font-semibold' : 'bg-gray-50'
                      }`}>
                        <span className={item.isMainProduct ? 'font-semibold' : ''}>{item.material_code}</span>
                      </td>
                      <td className={`px-3 py-2 text-left text-gray-700 border-r border-b border-[#E0E0E1] ${
                        item.isMainProduct ? 'bg-blue-50 font-semibold' : 'bg-gray-50'
                      }`}>
                        <span className={item.isMainProduct ? 'font-semibold' : ''}>{item.material_name}</span>
                      </td>
                      <td className={`px-3 py-2 text-left text-gray-700 border-r border-b border-[#E0E0E1] ${
                        item.isMainProduct ? 'bg-blue-50 font-semibold' : 'bg-gray-50'
                      }`}>
                        <span className={item.isMainProduct ? 'font-semibold' : ''}>{item.material_type}</span>
                      </td>
                      <td className={`px-3 py-2 text-left text-gray-700 border-r border-b border-[#E0E0E1] ${
                        item.isMainProduct ? 'bg-blue-50 font-semibold' : 'bg-gray-50'
                      }`}>
                        <span className={item.isMainProduct ? 'font-semibold' : ''}>{item.variant_name}</span>
                      </td>
                      <td className={`px-3 py-2 text-center text-gray-700 border-r border-b border-[#E0E0E1] ${
                        item.isMainProduct ? 'bg-blue-50 font-semibold' : 'bg-gray-50'
                      }`}>
                        <span className={item.isMainProduct ? 'font-semibold' : ''}>{item.unit_name}</span>
                      </td>
                      <td className={`px-3 py-2 text-center text-gray-700 border-b border-[#E0E0E1] ${
                        item.isMainProduct ? 'bg-blue-50 font-semibold' : 'bg-gray-50'
                      }`}>
                        <span className={item.isMainProduct ? 'font-semibold' : ''}>{formatNumber(Number(item.quota_quantity))}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Customscrollbar>
          ) : (
            <NoData type='report' classNameImage='w-[245px]' />
          )
        }
        totalSection={flattenedData?.length > 0 && <PaginationComponent postsPerPage={limit} totalPosts={Number(data?.output?.iTotalRecords) || 0} paginate={paginate} currentPage={currentPage} />}
        paginationSection={<DropdowLimit sLimit={handleLimitChange} limit={limit} dataLang={dataLang} />}
      />
    </>
  );
};

export default QuotaMaterials;
