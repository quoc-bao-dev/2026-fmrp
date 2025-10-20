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
import { useLanguageContext } from '@/context/ui/LanguageContext';
import usePagination from '@/hooks/usePagination';
import useStatusExprired from '@/hooks/useStatusExprired';
import formatNumber from '@/utils/helpers/formatnumber';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { PiBookOpenText, PiPackage } from 'react-icons/pi';
import { useDebounce } from 'use-debounce';

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
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedVersion, setSelectedVersion] = useState(null);
    const [limit, setLimit] = useState(15);
    const [searchValue, setSearchValue] = useState('');
    const [debouncedSearchValue] = useDebounce(searchValue, 500);

    const currentPage = Number(router.query.page) || 1;

    // Mock data - thay thế bằng API thực tế
    const mockData = [
        {
            id: 1,
            material_code: 'NVL001',
            material_name: 'Vải cotton 100%',
            material_type: 'Vải',
            unit_name: 'Mét',
            quota_quantity: 2.5,
        },
        {
            id: 2,
            material_code: 'NVL002',
            material_name: 'Chỉ may',
            material_type: 'Phụ liệu',
            unit_name: 'Cuộn',
            quota_quantity: 1.0,
        },
        {
            id: 3,
            material_code: 'NVL003',
            material_name: 'Khóa kéo',
            material_type: 'Phụ liệu',
            unit_name: 'Cái',
            quota_quantity: 2.0,
        },
    ];

    const mockTotal = {
        total_records: mockData.length,
    };

    const handleProductChange = value => {
        setSelectedProduct(value);
    };

    const handleVersionChange = value => {
        setSelectedVersion(value);
    };

    const handleClearProduct = () => {
        setSelectedProduct(null);
    };

    const handleClearVersion = () => {
        setSelectedVersion(null);
    };

    const handleSearch = value => {
        const searchValue = value?.target?.value || (typeof value === 'string' ? value : '');
        setSearchValue(searchValue);
    };

    const handleLimitChange = newLimit => {
        setLimit(newLimit);
    };

    const handleResetData = () => {
        setSearchTerm('');
        setSelectedProduct(null);
        setSelectedVersion(null);
        setSearchValue('');
        setLimit(15);
        router.push({
            pathname: router.pathname,
            query: { ...router.query, page: 1 },
        });
    };

    // Mock export data
    const exportData = {
        headers: ['STT', 'Mã nguyên vật liệu', 'Tên nguyên vật liệu', 'Loại', 'Đơn vị', 'Số lượng định mức'],
        data: mockData.map((item, index) => [index + 1, item.material_code, item.material_name, item.material_type, item.unit_name, item.quota_quantity]),
    };

    return (
        <>
            <ReportLayout
                title={'Báo cáo định mức NVL'}
                statusExprired={statusExprired}
                breadcrumbItems={breadcrumbItems}
                filterSection={
                    <div className='w-full items-center flex justify-between gap-4'>
                        <div className='flex gap-3'>
                            <SearchComponent dataLang={dataLang} onChange={handleSearch} value={searchValue} classNameBox='!py-2 2xl:!p-2.5' placeholder='Tìm kiếm...' />

                            <SelectSearchReport
                                placeholder='Thành phẩm'
                                onChange={handleProductChange}
                                onClear={handleClearProduct}
                                icon={<PiPackage color='#9295A4' className='size-4' />}
                                className='w-[200px] 2xl:w-[250px]'
                                options={[
                                    { value: '1', label: 'Áo thun nam' },
                                    { value: '2', label: 'Quần jean nữ' },
                                    { value: '3', label: 'Áo khoác' },
                                ]}
                                value={selectedProduct}
                            />

                            <SelectSearchReport
                                placeholder='Phiên bản'
                                onChange={handleVersionChange}
                                onClear={handleClearVersion}
                                icon={<PiBookOpenText color='#9295A4' className='size-4' />}
                                className='w-[200px] 2xl:w-[250px]'
                                options={[
                                    { value: '1', label: 'V1.0' },
                                    { value: '2', label: 'V2.0' },
                                    { value: '3', label: 'V3.0' },
                                ]}
                                value={selectedVersion}
                            />
                        </div>
                        <div className='flex gap-3 items-center'>
                            <OnResetData sOnFetching={() => {}} onClick={handleResetData} className='!py-3' />
                            <ExcelFileComponent dataLang={dataLang} filename='Báo cáo định mức NVL' title='BCDMNVL' multiDataSet={exportData} classBtn='!py-3' />
                        </div>
                    </div>
                }
                tableSection={
                    <TableSection
                        fixedColumns={[
                            { title: 'STT', width: 'w-14', textAlign: 'center' },
                            { title: 'Mã nguyên vật liệu', width: 'w-64', textAlign: 'left' },
                            { title: 'Tên nguyên vật liệu', width: 'w-64', textAlign: 'left' },
                        ]}
                        scrollableColumns={[
                            { title: 'Loại', width: 'w-32', textAlign: 'center' },
                            { title: 'Đơn vị', width: 'w-28', textAlign: 'center' },
                            { title: 'Số lượng định mức', width: 'w-40', textAlign: 'center' },
                        ]}
                        data={mockData}
                        isFetching={false}
                        renderFixedRow={(item, index) => (
                            <>
                                <RowItemTable className='w-14 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0'>{index + 1}</RowItemTable>
                                <RowItemTable className='w-64 flex flex-col justify-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0'>
                                    <span>{item.material_code}</span>
                                </RowItemTable>
                                <RowItemTable className='w-64 flex items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0'>
                                    <div className='flex flex-col gap-1 justify-start'>
                                        <p className='text-left responsive-text-sm text-neutral-07 font-normal'>{item.material_name}</p>
                                    </div>
                                </RowItemTable>
                            </>
                        )}
                        renderScrollableRow={(item, index) => (
                            <>
                                <RowItemTable className='w-32 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0'>
                                    {item.material_type}
                                </RowItemTable>
                                <RowItemTable className='w-28 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0'>
                                    {item.unit_name}
                                </RowItemTable>
                                <RowItemTable className='w-40 flex justify-center items-center py-2 px-3 text-neutral-07 font-normal flex-shrink-0'>{formatNumber(item.quota_quantity)}</RowItemTable>
                            </>
                        )}
                    />
                }
                totalSection={mockData?.length > 0 && <PaginationComponent postsPerPage={limit} totalPosts={Number(mockTotal?.total_records) || 0} paginate={paginate} currentPage={currentPage} />}
                paginationSection={<DropdowLimit sLimit={handleLimitChange} limit={limit} dataLang={dataLang} />}
            />
        </>
    );
};

export default QuotaMaterials;
