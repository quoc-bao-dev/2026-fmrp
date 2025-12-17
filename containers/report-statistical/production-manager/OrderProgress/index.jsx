import SelectSearchReport from '@/components/common/select/SelectSearchReport';
import ReportLayout from '@/components/layout/ReportLayout';
import TableSection from '@/components/layout/ReportLayout/TableSection';
import OnResetData from '@/components/UI/btnResetData/btnReset';
import { RowItemTable } from '@/components/UI/common/Table';
import DropdowLimit from '@/components/UI/dropdowLimit/dropdowLimit';
import DateToDateReport from '@/components/UI/filterComponents/dateTodateReport';
import ExcelFileComponent from '@/components/UI/filterComponents/excelFilecomponet';
import SearchComponent from '@/components/UI/filterComponents/searchComponent';
import PaginationComponent from '@/components/UI/pagination';
import { useLanguageContext } from '@/context/ui/LanguageContext';
import { usePersistedBranches } from '@/hooks/common/usePersistedBranches';
import usePagination from '@/hooks/usePagination';
import useStatusExprired from '@/hooks/useStatusExprired';
import formatNumber from '@/utils/helpers/formatnumber';
import moment from 'moment';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import { PiCalendar, PiPackage, PiShoppingCart } from 'react-icons/pi';
import { useDebounce } from 'use-debounce';
import { useGetOrderProgress } from './hook';
import { useExportExcel } from './hook/useExportExcel';
import { useGetItemsWithBranch, useGetSalesOrderCombobox } from '@/hooks/useComboBoxReport';

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
    label: `Tiến độ theo đơn hàng`,
  },
];

const OrderProgress = () => {
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
  const [selectedOrder, setSelectedOrder] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState([]);
  const [limit, setLimit] = useState(15);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue] = useDebounce(searchValue, 500);
  const [orderSearch, setOrderSearch] = useState('');
  const [debouncedOrderSearch] = useDebounce(orderSearch, 500);
  const [productOptions, setProductOptions] = useState([]);
  const currentPage = Number(router.query.page) || 1;

  const { data: dataProduct } = useGetItemsWithBranch({
    search: debouncedSearchTerm,
    branch_ids: selectedBranches?.length > 0 ? selectedBranches : null,
  });
  // const { data: dataProduct } = useInventoryItems(debouncedSearchTerm);

  const { data: dataSalesOrderCombobox } = useGetSalesOrderCombobox({
    search: debouncedOrderSearch,
    branch_ids: selectedBranches?.length > 0 ? selectedBranches : null,
  });

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

  const {
    data,
    isFetching,
    refetch: refetchOrderProgress,
  } = useGetOrderProgress({
    page: currentPage,
    limit: limit,
    search: debouncedSearchValue,
    branch_ids: selectedBranches?.length > 0 ? selectedBranches : null,
    ...getFormattedDateRange(),
    ...(selectedOrder !== null && { order_ids: selectedOrder.map(item => item.value) }),
    ...(selectedProduct && selectedProduct.length > 0 && { product_id: selectedProduct.map(item => item.value) }),
  });

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
      const selectedOptionValues = selectedProduct && selectedProduct.length > 0 ? selectedProduct.map(item => item.value) : [];
      const existingSelectedOptions = productOptions.filter(opt => selectedOptionValues.includes(opt.value));

      // Kết hợp options mới với các options đã chọn, loại bỏ trùng lặp
      const combinedOptions = [...existingSelectedOptions, ...newOptions];
      const uniqueOptions = combinedOptions.filter((option, index, self) => index === self.findIndex(o => o.value === option.value));

      setProductOptions(uniqueOptions);
    }
  }, [dataProduct, selectedProduct]);

  const totals = useMemo(() => {
    const rows = data?.output?.aaData || [];
    return rows.reduce(
      (acc, item) => {
        const q = Number(item.quantity) || 0;
        const qSx = Number(item.quantity_sx) || 0;
        const qHt = Number(item.quantity_ht) || 0;
        const qDelivery = Number(item.quantity_delivery) || 0;
        const qNotDelivery = Number(item.quantity_not_delivery) || 0;
        acc.total_quantity += q;
        acc.total_produced += qSx;
        acc.total_finished += qHt;
        acc.total_delivered += qDelivery;
        acc.total_pending += qNotDelivery;
        return acc;
      },
      { total_quantity: 0, total_produced: 0, total_finished: 0, total_delivered: 0, total_pending: 0 }
    );
  }, [data?.output?.aaData]);

  const handleDateChange = newValue => {
    router.push({ pathname: router.pathname, query: { ...router.query, page: 1 } });
    setDateRange(newValue);
  };

  const handleOrderChange = values => {
    if (!values || values.length === 0) {
      setSelectedOrder([]);
      router.push({ pathname: router.pathname, query: { ...router.query, page: 1 } });
      return;
    }
    const orderOptions = (dataSalesOrderCombobox?.orders || []).map(item => ({ value: item.id, label: item.reference_no }));
    const selectedItems = values.map(v => orderOptions.find(opt => opt.value === v)).filter(Boolean);
    setSelectedOrder(selectedItems);
    router.push({ pathname: router.pathname, query: { ...router.query, page: 1 } });
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

  const handleClearOrder = () => {
    setSelectedOrder([]);
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

  const { multiDataSet } = useExportExcel(data?.output?.aaData || []);

  const getStatusColor = status => {
    switch (status) {
      case 'success':
        return 'text-green-600 border-green-600';
      case 'warning':
        return 'text-blue-600 border-blue-600';
      case 'secondary':
        return 'text-red-500 border-red-500';
      default:
        return 'text-neutral-07 border-neutral-07';
    }
  };

  return (
    <>
      <ReportLayout
        title={'Báo cáo tiến độ theo đơn hàng'}
        statusExprired={statusExprired}
        breadcrumbItems={breadcrumbItems}
        branchValue={selectedBranches}
        onBranchChange={setSelectedBranches}
        onBranchClear={() => setSelectedBranches([])}
        filterSection={
          <div className='w-full items-center flex justify-between gap-4'>
            <div className='grid grid-cols-3 gap-3'>
              <DateToDateReport placeholder='Từ ngày đến ngày' value={dateRange} onChange={handleDateChange} icon={<PiCalendar color='#9295A4' className='size-4' />} className='w-full' />
              <SelectSearchReport
                placeholder='Đơn hàng bán'
                onChange={handleOrderChange}
                onClear={handleClearOrder}
                onSearch={value => setOrderSearch(value)}
                icon={<PiShoppingCart color='#9295A4' className='size-4' />}
                className='w-full'
                options={dataSalesOrderCombobox?.orders?.map(item => ({ value: item.id, label: item.reference_no }))}
                value={selectedOrder}
                mode='multiple'
              />
              <SelectSearchReport
                placeholder='Mặt hàng'
                onSearch={value => {
                  setSearchTerm(value);
                }}
                onChange={handleProductChange}
                onClear={handleClearProduct}
                icon={<PiPackage color='#9295A4' className='size-4' />}
                className='w-full'
                options={productOptions}
                value={selectedProduct}
                mode='multiple'
              />
            </div>
            <div className='flex justify-end gap-3 items-center w-auto flex-shrink-0'>
              <SearchComponent dataLang={dataLang} onChange={handleSearch} value={searchValue} classNameBox='!py-2 2xl:!p-2.5' placeholder='Tìm kiếm...' />
              <OnResetData sOnFetching={() => {}} onClick={refetchOrderProgress} className='!py-3' />
              <ExcelFileComponent dataLang={dataLang} filename='Báo cáo tiến độ theo đơn hàng' title='BCTDTDH' multiDataSet={multiDataSet} classBtn='!py-3' />
            </div>
          </div>
        }
        tableSection={
          <TableSection
            fixedColumns={[
              // { title: 'STT', width: 'w-14', textAlign: 'center' },
              { title: 'Ngày đơn hàng', width: 'w-32 text-center', textAlign: 'center' },
              { title: 'Số đơn hàng', width: 'w-32', textAlign: 'left' },
              { title: 'Chi nhánh', width: 'w-40', textAlign: 'left' },
            ]}
            scrollableColumns={[
              { title: 'Tên sản phẩm', width: 'w-48', textAlign: 'left' },
              { title: 'Biến thể', width: 'w-48', textAlign: 'left' },
              { title: 'Đơn vị tính', width: 'w-24 text-center', textAlign: 'center' },
              { title: 'Ghi chú', width: 'w-40', textAlign: 'left' },
              { title: 'Số lượng', width: 'w-28', textAlign: 'center' },
              { title: 'Ngày cần hàng', width: 'w-32 text-center', textAlign: 'center' },
              { title: 'SL sản xuất', width: 'w-28', textAlign: 'center' },
              { title: 'SL đã hoàn thành sản xuất', width: 'w-32 text-center', textAlign: 'center' },
              { title: 'SL đã giao', width: 'w-28', textAlign: 'center' },
              { title: 'SL chưa giao', width: 'w-28 text-center', textAlign: 'center' },
              { title: 'Ngày hoàn thành mới nhất', width: 'w-36 text-center', textAlign: 'center' },
              { title: 'Ngày giao hàng mới nhất', width: 'w-36 text-center', textAlign: 'center' },
              { title: 'Trạng thái sản xuất', width: 'w-40 text-center', textAlign: 'center' },
            ]}
            data={data?.output?.aaData || []}
            isFetching={isFetching}
            renderFixedRow={(item, index) => (
              <>
                {/* <RowItemTable className='w-14 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0'>{index + 1}</RowItemTable> */}
                <RowItemTable className='w-32 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0'>
                  {moment(item.date).format('DD/MM/YYYY')}
                </RowItemTable>
                <RowItemTable className='w-32 flex items-center py-2 px-3 border-r border-[#E0E0E1] font-normal flex-shrink-0'>{item.reference_no}</RowItemTable>
                <RowItemTable className='w-40 flex items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0'>
                  <span className='text-left responsive-text-sm'>{item.branch_name}</span>
                </RowItemTable>
              </>
            )}
            renderScrollableRow={(item, index) => (
              <>
                <RowItemTable className='w-48 flex items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0'>
                  <span className='text-left responsive-text-sm'>{item.item_name}</span>
                </RowItemTable>
                <RowItemTable className='w-48 flex items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0'>
                  <span className='text-left responsive-text-sm'>{item.item_variant_name}</span>
                </RowItemTable>
                <RowItemTable className='w-24 flex items-center justify-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0'>
                  <span className='text-center responsive-text-sm'>{item.item_unit_name}</span>
                </RowItemTable>
                <RowItemTable className='w-40 flex items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0'>
                  <span className='text-left responsive-text-sm'>{item.note_item || '-'}</span>
                </RowItemTable>
                <RowItemTable className='w-28 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0'>
                  {Number(item.quantity) === 0 ? '-' : formatNumber(Number(item.quantity))}
                </RowItemTable>
                <RowItemTable className='w-32 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0'>
                  {moment(item.delivery_date).format('DD/MM/YYYY')}
                </RowItemTable>
                <RowItemTable className='w-28 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0'>
                  {Number(item.quantity_sx) === 0 ? '-' : formatNumber(Number(item.quantity_sx))}
                </RowItemTable>
                <RowItemTable className='w-32 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0'>
                  {Number(item.quantity_ht) === 0 ? '-' : formatNumber(Number(item.quantity_ht))}
                </RowItemTable>
                <RowItemTable className='w-28 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0'>
                  {Number(item.quantity_delivery) === 0 ? '-' : formatNumber(Number(item.quantity_delivery))}
                </RowItemTable>
                <RowItemTable className='w-28 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0'>
                  {Number(item.quantity_not_delivery) === 0 ? '-' : formatNumber(Number(item.quantity_not_delivery))}
                </RowItemTable>
                <RowItemTable className='w-36 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0'>
                  {item.max_purchase_date ? moment(item.max_purchase_date).format('DD/MM/YYYY') : '-'}
                </RowItemTable>
                <RowItemTable className='w-36 flex justify-center items-center py-2 px-3 border-r border-[#E0E0E1] text-neutral-07 font-normal flex-shrink-0'>
                  {item.max_delivery_date ? moment(item.max_delivery_date).format('DD/MM/YYYY') : '-'}
                </RowItemTable>
                <RowItemTable className='w-40 flex justify-center items-center py-2 px-3 text-neutral-07 font-normal flex-shrink-0'>
                  <span className={`responsive-text-sm font-medium border rounded-full px-2 py-1 ${getStatusColor(item.status_item_po_data.color)}`}>{item.status_item_po_data.name}</span>
                </RowItemTable>
              </>
            )}
            renderFooter={() => (
              <>
                {/* Fixed columns: STT, Ngày đơn hàng, Số đơn hàng, Chi nhánh xưởng */}
                <RowItemTable className='w-32 flex-shrink-0 bg-white sticky left-0 z-20'></RowItemTable>
                <RowItemTable className='w-32 flex-shrink-0 bg-white sticky left-[128px] z-20'></RowItemTable>
                <RowItemTable className='h-10 w-40 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white uppercase sticky left-[256px] z-20'>Tổng cộng</RowItemTable>

                {/* Scrollable columns: Tên SP, Biến thể, ĐVT, Ghi chú, ... */}
                <RowItemTable className='w-48 flex-shrink-0 bg-white'></RowItemTable>
                <RowItemTable className='h-10 w-48 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white'>-</RowItemTable>
                <RowItemTable className='h-10 w-24 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white'>-</RowItemTable>
                <RowItemTable className='h-10 w-40 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white'>-</RowItemTable>
                <RowItemTable className='h-10 w-28 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white'>{formatNumber(totals.total_quantity)}</RowItemTable>
                <RowItemTable className='h-10 w-32 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white'>-</RowItemTable>
                <RowItemTable className='h-10 w-28 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white'>{formatNumber(totals.total_produced)}</RowItemTable>
                <RowItemTable className='h-10 w-32 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white'>{formatNumber(totals.total_finished)}</RowItemTable>
                <RowItemTable className='h-10 w-28 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white'>{formatNumber(totals.total_delivered)}</RowItemTable>
                <RowItemTable className='h-10 w-28 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white'>{formatNumber(totals.total_pending)}</RowItemTable>
                <RowItemTable className='h-10 w-36 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white'>-</RowItemTable>
                <RowItemTable className='h-10 w-36 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white'>-</RowItemTable>
                <RowItemTable className='h-10 w-40 flex items-center justify-center px-3 text-neutral-07 font-semibold flex-shrink-0 bg-white'>-</RowItemTable>
              </>
            )}
          />
        }
        totalSection={<PaginationComponent postsPerPage={limit} totalPosts={Number(data?.output?.iTotalRecords) || 0} paginate={paginate} currentPage={currentPage} />}
        paginationSection={<DropdowLimit sLimit={handleLimitChange} limit={limit} dataLang={dataLang} />}
      />
    </>
  );
};

export default OrderProgress;
