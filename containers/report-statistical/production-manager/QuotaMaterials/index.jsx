'use client';
import SelectSearchReport from '@/components/common/select/SelectSearchReport';
import ReportLayout from '@/components/layout/ReportLayout';
import TableSection from '@/components/layout/ReportLayout/TableSection';
import OnResetData from '@/components/UI/btnResetData/btnReset';
import { RowItemTable } from '@/components/UI/common/Table';
import DropdowLimit from '@/components/UI/dropdowLimit/dropdowLimit';
import ExcelFileComponent from '@/components/UI/filterComponents/excelFilecomponet';
import SearchComponent from '@/components/UI/filterComponents/searchComponent';
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

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [selectedProduct, setSelectedProduct] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [limit, setLimit] = useState(15);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue] = useDebounce(searchValue, 500);
  const [productOptions, setProductOptions] = useState([]);

  const currentPage = Number(router.query.page) || 1;

  const { data: dataProduct } = useInventoryItems(debouncedSearchTerm);
  const { data } = useGetBOMs({
    page: currentPage,
    limit: limit,
    search: debouncedSearchValue,
    product_id: selectedProduct?.map(item => item.value) || [],
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

  const handleResetData = () => {
    setSearchTerm('');
    setSelectedProduct([]);
    setSelectedVersion(null);
    setSearchValue('');
    setLimit(15);
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
              <OnResetData sOnFetching={() => {}} onClick={handleResetData} className='!py-3' />
              <ExcelFileComponent dataLang={dataLang} filename='Báo cáo định mức NVL' title='BCDMNVL' multiDataSet={multiDataSet} classBtn='!py-3' />
            </div>
          </div>
        }
        tableSection={
          <TableSection
            fixedColumns={[
              { title: 'STT', width: 'w-14', textAlign: 'center' },
              { title: 'Mã nguyên vật liệu', width: 'w-64 2xl:w-80', textAlign: 'left' },
              { title: 'Tên nguyên vật liệu', width: 'w-64 2xl:w-80', textAlign: 'left' },
            ]}
            scrollableColumns={[
              { title: 'Loại', width: 'w-44 2xl:w-56', textAlign: 'left' },
              { title: 'Biến thể', width: 'w-40 2xl:w-72', textAlign: 'left' },
              { title: 'Đơn vị', width: 'w-28 2xl:w-36', textAlign: 'center' },
              { title: 'Số lượng định mức', width: 'w-40 2xl:w-48', textAlign: 'center' },
            ]}
            data={flattenedData}
            isFetching={false}
            renderFixedRow={(item, index) => (
              <>
                <RowItemTable
                  className={`w-14 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0 ${
                    item.isMainProduct ? 'bg-blue-50 font-semibold' : 'bg-gray-50'
                  }`}
                >
                  {item.displayIndex}
                </RowItemTable>
                <RowItemTable
                  className={`w-64 2xl:w-80 flex flex-col justify-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0 ${
                    item.isMainProduct ? 'bg-blue-50 font-semibold' : 'bg-gray-50'
                  }`}
                >
                  <span className={item.isMainProduct ? 'font-semibold' : ''}>{item.material_code}</span>
                </RowItemTable>
                <RowItemTable
                  className={`w-64 2xl:w-80 flex items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0 ${
                    item.isMainProduct ? 'bg-blue-50 font-semibold' : 'bg-gray-50'
                  }`}
                >
                  <div className='flex flex-col gap-1 justify-start'>
                    <p className={`text-left responsive-text-sm text-neutral-07 font-normal ${item.isMainProduct ? 'font-semibold' : ''}`}>{item.material_name}</p>
                  </div>
                </RowItemTable>
              </>
            )}
            renderScrollableRow={(item, index) => (
              <>
                <RowItemTable
                  className={`w-44 2xl:w-56 flex py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0 ${item.isMainProduct ? 'bg-blue-50 font-semibold' : 'bg-gray-50'}`}
                >
                  <span className={item.isMainProduct ? 'font-semibold' : ''}>{item.material_type}</span>
                </RowItemTable>
                <RowItemTable
                  className={`w-40 2xl:w-72 flex py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0 ${item.isMainProduct ? 'bg-blue-50 font-semibold' : 'bg-gray-50'}`}
                >
                  <span className={item.isMainProduct ? 'font-semibold' : ''}>{item.variant_name}</span>
                </RowItemTable>
                <RowItemTable
                  className={`w-28 2xl:w-36 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0 ${
                    item.isMainProduct ? 'bg-blue-50 font-semibold' : 'bg-gray-50'
                  }`}
                >
                  <span className={item.isMainProduct ? 'font-semibold' : ''}>{item.unit_name}</span>
                </RowItemTable>
                <RowItemTable
                  className={`w-40 2xl:w-48 flex justify-center items-center py-2 px-3 text-neutral-07 font-normal flex-shrink-0 ${item.isMainProduct ? 'bg-blue-50 font-semibold' : 'bg-gray-50'}`}
                >
                  <span className={item.isMainProduct ? 'font-semibold' : ''}>{formatNumber(Number(item.quota_quantity))}</span>
                </RowItemTable>
              </>
            )}
          />
        }
        totalSection={flattenedData?.length > 0 && <PaginationComponent postsPerPage={limit} totalPosts={Number(data?.output?.iTotalRecords) || 0} paginate={paginate} currentPage={currentPage} />}
        paginationSection={<DropdowLimit sLimit={handleLimitChange} limit={limit} dataLang={dataLang} />}
      />
    </>
  );
};

export default QuotaMaterials;
