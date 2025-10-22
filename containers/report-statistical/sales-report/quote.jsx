import OnResetData from '@/components/UI/btnResetData/btnReset';
import { RowItemTable } from '@/components/UI/common/Table';
import DropdowLimit from '@/components/UI/dropdowLimit/dropdowLimit';
import DateToDateReport from '@/components/UI/filterComponents/dateTodateReport';
import ExcelFileComponent from '@/components/UI/filterComponents/excelFilecomponet';
import SearchComponent from '@/components/UI/filterComponents/searchComponent';
import SelectComponent from '@/components/UI/filterComponents/selectComponent';
import Pagination from '@/components/UI/pagination';
import ReportLayout from '@/components/layout/ReportLayout';
import TableSection from '@/components/layout/ReportLayout/TableSection';
import useSetingServer from '@/hooks/useConfigNumber';
import usePagination from '@/hooks/usePagination';
import useStatusExprired from '@/hooks/useStatusExprired';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import { Grid6 } from 'iconsax-react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { useDebounce } from 'use-debounce';

const breadcrumbItems = [
    {
        label: `Báo cáo`,
    },
    {
        label: `Báo cáo bán hàng`,
    },
    {
        label: `Báo cáo đơn hàng theo báo giá`,
        href: '/report-statistical/sales-report/quote',
    },
];

const Quote = props => {
    const dataLang = props.dataLang;
    const dataSeting = useSetingServer();
    const router = useRouter();
    const { paginate } = usePagination();
    const statusExprired = useStatusExprired();

    const formatNumber = number => {
        return formatNumberConfig(+number, dataSeting);
    };

    // State management
    const [dateRange, setDateRange] = useState({
        startDate: undefined,
        endDate: undefined,
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [limit, setLimit] = useState(15);
    const [searchValue, setSearchValue] = useState('');
    const [debouncedSearchValue] = useDebounce(searchValue, 500);

    const currentPage = Number(router.query.page) || 1;

    const initialState = {
        total: {},
        data: [],
        onFetching: false,
    };

    const [isState, setState] = useState(initialState);

    const queryState = key => setState(prev => ({ ...prev, ...key }));

    // Handler functions
    const handleDateChange = newValue => {
        setDateRange(newValue);
    };

    const handleCustomerChange = value => {
        setSelectedCustomer(value);
    };

    const handleOrderChange = value => {
        setSelectedOrder(value);
    };

    const handleSearch = value => {
        const searchValue = value?.target?.value || (typeof value === 'string' ? value : '');
        setSearchValue(searchValue);
    };

    const handleLimitChange = newLimit => {
        setLimit(newLimit);
    };

    const handleResetData = () => {
        // Reset date range
        setDateRange({
            startDate: undefined,
            endDate: undefined,
        });

        // Reset selections
        setSelectedCustomer(null);
        setSelectedOrder(null);

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

    // Mock data for export (you can replace this with actual data)
    const multiDataSet = [
        {
            sheetName: 'Báo cáo đơn hàng theo báo giá',
            data: isState.data || [],
            columns: [
                { header: 'Khách hàng', key: 'customer_name' },
                { header: 'Báo giá', key: 'quote_code' },
                { header: 'Ngày', key: 'date' },
                { header: 'Đơn hàng bán', key: 'order_code' },
                { header: 'Mã thành phẩm', key: 'product_code' },
                { header: 'Tên thành phẩm', key: 'product_name' },
                { header: 'Đơn vị', key: 'unit' },
                { header: 'Số lượng báo giá', key: 'quote_quantity' },
                { header: 'Số lượng đơn hàng', key: 'order_quantity' },
                { header: 'Số lượng đã giao', key: 'delivered_quantity' },
                { header: 'Còn lại chưa giao', key: 'remaining_quantity' },
            ],
        },
    ];

    return (
        <React.Fragment>
            <ReportLayout
                title={'Báo cáo đơn hàng theo báo giá'}
                statusExprired={statusExprired}
                breadcrumbItems={breadcrumbItems}
                filterSection={
                    <div className='w-full items-center flex justify-between gap-4'>
                        <div className='flex gap-3'>
                            <DateToDateReport placeholder='Giai đoạn' value={dateRange} onChange={handleDateChange} />

                            <SelectComponent
                                options={[
                                    {
                                        value: '',
                                        label: 'Khách hàng',
                                        isDisabled: true,
                                    },
                                ]}
                                placeholder={'Khách hàng'}
                                isSearchable={true}
                                value={selectedCustomer}
                                onChange={handleCustomerChange}
                                className='w-[200px] 2xl:w-[250px]'
                            />

                            <SelectComponent
                                options={[
                                    {
                                        value: '',
                                        label: 'Đơn hàng bán',
                                        isDisabled: true,
                                    },
                                ]}
                                placeholder={'Đơn hàng bán'}
                                isSearchable={true}
                                value={selectedOrder}
                                onChange={handleOrderChange}
                                className='w-[200px] 2xl:w-[250px]'
                            />
                        </div>
                        <div className='flex gap-3 items-center'>
                            <SearchComponent dataLang={dataLang} onChange={handleSearch} value={searchValue} classNameBox='!py-2 2xl:!p-2.5' />
                            <OnResetData sOnFetching={handleResetData} onClick={handleResetData} className='!py-3' />
                            <ExcelFileComponent dataLang={dataLang} filename='Báo cáo đơn hàng theo báo giá' title='BCDHBG' multiDataSet={multiDataSet} classBtn='!py-3' />
                        </div>
                    </div>
                }
                tableSection={
                    <TableSection
                        fixedColumns={[
                            { title: 'STT', width: 'w-14', textAlign: 'center' },
                            { title: 'Khách hàng', width: 'w-40', textAlign: 'left' },
                            { title: 'Báo giá', width: 'w-32', textAlign: 'center' },
                        ]}
                        scrollableColumns={[
                            { title: 'Ngày', width: 'w-32', textAlign: 'center' },
                            { title: 'Đơn hàng bán', width: 'w-40', textAlign: 'center' },
                            { title: 'Mã thành phẩm', width: 'w-32', textAlign: 'left' },
                            { title: 'Tên thành phẩm', width: 'w-60', textAlign: 'left' },
                            { title: 'Đơn vị', width: 'w-20', textAlign: 'center' },
                            { title: 'Số lượng báo giá', width: 'w-32', textAlign: 'center' },
                            { title: 'Số lượng đơn hàng', width: 'w-32', textAlign: 'center' },
                            { title: 'Số lượng đã giao', width: 'w-32', textAlign: 'center' },
                            { title: 'Còn lại chưa giao', width: 'w-32', textAlign: 'center' },
                        ]}
                        data={isState?.data}
                        isFetching={isState?.onFetching}
                        renderFixedRow={(item, index) => (
                            <>
                                <RowItemTable className='w-14 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 !responsive-text-sm font-normal flex-shrink-0'>
                                    {index + 1}
                                </RowItemTable>
                                <RowItemTable className='w-40 flex justify-start items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 !responsive-text-sm font-normal flex-shrink-0'>
                                    {item?.customer_name || '-'}
                                </RowItemTable>
                                <RowItemTable className='w-32 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] !text-new-blue !responsive-text-sm font-semibold flex-shrink-0'>
                                    {item?.quote_code || '-'}
                                </RowItemTable>
                            </>
                        )}
                        renderScrollableRow={(item, index) => (
                            <>
                                <RowItemTable className='w-32 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 !responsive-text-sm font-normal flex-shrink-0'>
                                    {item?.date || '-'}
                                </RowItemTable>
                                <RowItemTable className='w-40 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 !responsive-text-sm font-normal flex-shrink-0'>
                                    {item?.order_code || '-'}
                                </RowItemTable>
                                <RowItemTable className='w-32 flex justify-start items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 !responsive-text-sm font-normal flex-shrink-0'>
                                    {item?.product_code || '-'}
                                </RowItemTable>
                                <RowItemTable className='w-60 flex justify-start items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 !responsive-text-sm font-normal flex-shrink-0'>
                                    {item?.product_name || '-'}
                                </RowItemTable>
                                <RowItemTable className='w-20 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 !responsive-text-sm font-normal flex-shrink-0'>
                                    {item?.unit || '-'}
                                </RowItemTable>
                                <RowItemTable className='w-32 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 !responsive-text-sm font-normal flex-shrink-0'>
                                    {formatNumber(item?.quote_quantity || 0)}
                                </RowItemTable>
                                <RowItemTable className='w-32 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 !responsive-text-sm font-normal flex-shrink-0'>
                                    {formatNumber(item?.order_quantity || 0)}
                                </RowItemTable>
                                <RowItemTable className='w-32 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 !responsive-text-sm font-normal flex-shrink-0'>
                                    {formatNumber(item?.delivered_quantity || 0)}
                                </RowItemTable>
                                <RowItemTable className='w-32 flex justify-center items-center py-2 px-3 text-neutral-07 !responsive-text-sm font-normal flex-shrink-0'>
                                    {formatNumber(item?.remaining_quantity || 0)}
                                </RowItemTable>
                            </>
                        )}
                        renderFooter={() => (
                            <>
                                <RowItemTable className='w-14 flex-shrink-0 bg-white'></RowItemTable>
                                <RowItemTable className='w-40 flex-shrink-0 bg-white'></RowItemTable>
                                <RowItemTable className='w-32 flex-shrink-0 bg-white'></RowItemTable>
                                <RowItemTable className='w-32 flex-shrink-0 bg-white'></RowItemTable>
                                <RowItemTable className='w-40 flex-shrink-0 bg-white'></RowItemTable>
                                <RowItemTable className='w-32 flex-shrink-0 bg-white'></RowItemTable>
                                <RowItemTable className='w-60 flex-shrink-0 bg-white'></RowItemTable>
                                <RowItemTable className='w-20 flex-shrink-0 bg-white'></RowItemTable>
                                <RowItemTable className='h-10 w-32 flex items-center justify-center px-3 text-neutral-07 !responsive-text-sm font-semibold flex-shrink-0 bg-white'>
                                    Tổng cộng
                                </RowItemTable>
                                <RowItemTable className='h-10 w-32 flex items-center justify-center px-3 text-neutral-07 !responsive-text-sm font-semibold flex-shrink-0 bg-white'>
                                    {formatNumber(isState?.total?.total_quote_quantity || 0)}
                                </RowItemTable>
                                <RowItemTable className='h-10 w-32 flex items-center justify-center px-3 text-neutral-07 !responsive-text-sm font-semibold flex-shrink-0 bg-white'>
                                    {formatNumber(isState?.total?.total_order_quantity || 0)}
                                </RowItemTable>
                                <RowItemTable className='h-10 w-32 flex items-center justify-center px-3 text-neutral-07 !responsive-text-sm font-semibold flex-shrink-0 bg-white'>
                                    {formatNumber(isState?.total?.total_delivered_quantity || 0)}
                                </RowItemTable>
                                <RowItemTable className='h-10 w-32 flex items-center justify-center px-3 text-neutral-07 !responsive-text-sm font-semibold flex-shrink-0 bg-white'>
                                    {formatNumber(isState?.total?.total_remaining_quantity || 0)}
                                </RowItemTable>
                            </>
                        )}
                    />
                }
                totalSection={
                    isState?.data?.length > 0 && <Pagination postsPerPage={limit} totalPosts={Number(isState?.total?.iTotalDisplayRecords) || 0} paginate={paginate} currentPage={currentPage} />
                }
                paginationSection={<DropdowLimit sLimit={handleLimitChange} limit={limit} dataLang={dataLang} />}
            />
        </React.Fragment>
    );
};

export default Quote;
