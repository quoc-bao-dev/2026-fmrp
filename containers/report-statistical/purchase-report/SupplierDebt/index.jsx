import OnResetData from '@/components/UI/btnResetData/btnReset';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import DateToDateReport from '@/components/UI/filterComponents/dateTodateReport';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import SelectSearchReport from '@/components/common/select/SelectSearchReport';
import ExcelIcon from '@/components/icons/common/Excel';
import ReportLayout from '@/components/layout/ReportLayout';
import { useLanguageContext } from '@/context/ui/LanguageContext';
import { usePersistedBranches } from '@/hooks/common/usePersistedBranches';
import { useGetSuppliersWithBranch } from '@/hooks/useComboBoxReport';
import useSetingServer from '@/hooks/useConfigNumber';
import useStatusExprired from '@/hooks/useStatusExprired';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import moment from 'moment';
import { Fragment, useState } from 'react';
import { FaUsers } from 'react-icons/fa';
import { useDebounce } from 'use-debounce';
import { useGetDebtSuppliers } from './hook';
import { exportSupplierDebtExcel } from './hook/useExportExcel';
import Image from 'next/image';
import { FaPlus } from 'react-icons/fa6';

const breadcrumbItems = [
  { label: `Báo cáo` },
  { label: `Báo cáo mua hàng` },
  {
    label: `Báo cáo công nợ nhà cung cấp`,
    href: '/report-statistical/purchase-report/supplier-debt',
  },
];

const SupplierDebt = () => {
  const dataSeting = useSetingServer();
  const statusExprired = useStatusExprired();
  const dataLang = useLanguageContext();

  const formatNumber = number => {
    return formatNumberConfig(+number, dataSeting);
  };

  // State management
  const [dateRange, setDateRange] = useState({
    startDate: undefined,
    endDate: undefined,
  });
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [supplierSearchValue, setSupplierSearchValue] = useState('');
  const [debouncedSupplierSearchValue] = useDebounce(supplierSearchValue, 500);

  const { selectedBranches, setSelectedBranches } = usePersistedBranches();

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

  const { data: dataSupplier } = useGetSuppliersWithBranch({
    search: debouncedSupplierSearchValue,
    branch_ids: selectedBranches?.length > 0 ? selectedBranches : null,
  });

  const {
    data: dataSupplierDebt,
    isFetching: isFetchingSupplierDebt,
    refetch: refetchSupplierDebt,
  } = useGetDebtSuppliers({
    supplier_id: selectedSupplier || undefined,
    ...(dateRange?.startDate !== undefined && { start_date: dateRange.startDate }),
    ...(dateRange?.endDate !== undefined && { end_date: dateRange.endDate }),
  });
  // Handler functions
  const handleDateChange = newValue => {
    setDateRange(newValue);
  };

  const handleSupplierChange = values => {
    setSelectedSupplier(values);
  };

  const handleExportExcel = () => {
    if (!dataSupplierDebt) return;
    const supplierName = dataSupplierDebt?.debt?.supplier_name || 'Nhà_cung_cấp';
    const filename = `Bao_cao_cong_no_${supplierName}.xlsx`;
    exportSupplierDebtExcel(dataSupplierDebt, filename, dataSeting, getFormattedDateRange());
  };

  const noDataTitle = !selectedSupplier ? 'Chưa chọn nhà cung cấp. Vui lòng chọn nhà cung cấp để xem báo cáo.' : 'Chưa có dữ liệu';

  return (
    <ReportLayout
      title={'Báo cáo công nợ nhà cung cấp'}
      statusExprired={statusExprired}
      breadcrumbItems={breadcrumbItems}
      branchValue={selectedBranches}
      onBranchChange={setSelectedBranches}
      onBranchClear={() => setSelectedBranches([])}
      filterSection={
        <div className='w-full items-center flex justify-between gap-4'>
          <div className='grid grid-cols-3 gap-3'>
            <DateToDateReport placeholder='Từ ngày đến ngày' value={dateRange} onChange={handleDateChange} className='w-full' />
            <SelectSearchReport
              placeholder='Nhà cung cấp'
              onChange={handleSupplierChange}
              onClear={() => setSelectedSupplier(null)}
              onSearch={setSupplierSearchValue}
              icon={<FaUsers color='#9295A4' className='size-4' />}
              options={dataSupplier || []}
              value={selectedSupplier}
            />
          </div>
          <div className='flex gap-3 items-center'>
            <OnResetData sOnFetching={refetchSupplierDebt} className='!py-3' />
            <button onClick={handleExportExcel} className='!py-3 3xl:py-3 3xl:px-4 px-3 flex items-center space-x-2 bg-white hover:bg-primary-07 rounded-lg border border-background-blue-2 transition'>
              <ExcelIcon className='3xl:size-5 size-4 text-typo-blue-4' />
              <span className='text-typo-blue-4 responsive-text-sm font-medium whitespace-nowrap'>{dataLang?.client_list_exportexcel}</span>
            </button>
          </div>
        </div>
      }
      tableSection={
        isFetchingSupplierDebt ? (
          <Loading color='#0f4f9e' />
        ) : dataSupplierDebt ? (
          <div className='flex flex-col gap-4 relative h-full'>
            <div className='flex flex-col gap-1 responsive-text-sm px-4'>
              <h3>Nhà cung cấp: {dataSupplierDebt?.debt?.name || '-'}</h3>
              <p>Địa chỉ: {dataSupplierDebt?.debt?.address || '-'}</p>
            </div>
            <Customscrollbar alwaysShowScrollbar={true} className='h-full flex-1 overflow-auto border border-[#E0E0E1]'>
              <table className='w-full border-0 p-0 m-0'>
                <thead>
                  <tr className='responsive-text-sm sticky top-0 z-50 bg-white capitalize'>
                    <th className='min-w-32 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Ngày chứng từ</div>
                    </th>
                    <th className='min-w-36 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Số chứng từ</div>
                    </th>
                    <th className='min-w-48 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Sản phẩm</div>
                    </th>
                    {/* Cột Biến thể mới thêm */}
                    <th className='min-w-36 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Biến thể</div>
                    </th>
                    <th className='min-w-24 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Đơn vị</div>
                    </th>
                    <th className='min-w-24 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Số lượng</div>
                    </th>
                    <th className='min-w-24 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Đơn giá</div>
                    </th>
                    <th className='min-w-28 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Đơn giá SCK</div>
                    </th>
                    <th className='min-w-24 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-center px-3 py-2 border-b border-r border-[#E0E0E1]'>Thuế</div>
                    </th>
                    <th className='min-w-28 h-2 p-0 font-semibold text-gray-700'>
                      <div className='w-full h-full flex items-center justify-end px-3 py-2 border-b border-[#E0E0E1]'>Thành tiền sau thuế</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {/* Công nợ đầu kỳ */}
                  <tr className='bg-gray-100 responsive-text-sm'>
                    <td colSpan={9} className='p-0 h-2 text-left text-gray-700'>
                      <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1] font-bold capitalize'>Công nợ đầu kỳ</div>
                    </td>
                    <td className='p-0 h-2 text-right font-semibold text-gray-800'>
                      <div className='w-full h-full px-3 py-2 border-b border-[#E0E0E1]'>{Number(dataSupplierDebt?.debt?.begin_debt) !== 0 ? formatNumber(Number(dataSupplierDebt?.debt?.begin_debt)) : "-"}</div>
                    </td>
                  </tr>
                  {Array.isArray(dataSupplierDebt?.rsImports) && dataSupplierDebt.rsImports?.length > 0 && (
                    <>
                      <tr className='bg-blue-100 responsive-text-sm'>
                        <td colSpan={10} className='p-0 h-2 text-center text-gray-700'>
                          <div className='w-full h-full px-3 py-2 border-b border-[#E0E0E1] font-semibold uppercase'>Phiếu nhập hàng</div>
                        </td>
                      </tr>
                      {/* Deliveries - summary row then items (for all orders) */}
                      {dataSupplierDebt?.rsImports?.map((rsImport, dIdx) => (
                        <Fragment key={`rsImport-${dIdx}`}>
                          {/* Summary row for all deliveries */}
                          <tr className='bg-blue-50/50 responsive-text-sm'>
                            <td className='p-0 h-2 text-center text-gray-700'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{moment(rsImport?.date).format('DD/MM/YYYY') || '-'}</div>
                            </td>
                            <td className='p-0 h-2 text-center text-gray-700'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{rsImport?.code_import || '-'}</div>
                            </td>
                            <td className='p-0 h-2 text-left text-gray-700 align-middle'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{rsImport?.item_name || rsImport?.item_code || '-'}</div>
                            </td>
                            <td className='p-0 h-2 text-left text-gray-700 align-middle'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{rsImport?.item_variation || '-'}</div>
                            </td>
                            <td className='p-0 h-2 text-center text-gray-700 align-middle'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{rsImport?.unit_name || '-'}</div>
                            </td>
                            <td className='p-0 h-2 text-center text-gray-700 align-middle'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{Number(rsImport?.quantity) === 0 ? '-' : formatNumber(Number(rsImport?.quantity))}</div>
                            </td>
                            <td className='p-0 h-2 text-center text-gray-700 align-middle'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{Number(rsImport?.price) === 0 ? '-' : formatNumber(Number(rsImport?.price))}</div>
                            </td>
                            <td className='p-0 h-2 text-center'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>
                                {Number(rsImport?.price_after_discount) === 0 ? '-' : formatNumber(Number(rsImport?.price_after_discount))}
                              </div>
                            </td>
                            <td className='p-0 h-2 text-center'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{Number(rsImport?.tax_rate) !== 0 ? rsImport?.tax_rate + '%' : '-'}</div>
                            </td>
                            <td className='p-0 h-2 text-right text-gray-700 align-middle'>
                              <div className='w-full h-full px-3 py-2 border-b border-[#E0E0E1]'>{Number(rsImport?.amount) === 0 ? '-' : formatNumber(Number(rsImport?.amount))}</div>
                            </td>
                          </tr>
                        </Fragment>
                      ))}
                      <tr className='bg-blue-50  responsive-text-sm'>
                        <td colSpan={5} className='p-0 h-2 font-semibold text-gray-700'>
                          <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1] capitalize'>Tổng cộng</div>
                        </td>
                        <td className='p-0 h-2 text-center font-semibold text-new-blue'>
                          <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>
                            {formatNumber(dataSupplierDebt?.rsImports?.reduce((acc, curr) => acc + Number(curr?.quantity), 0) || 0)}
                          </div>
                        </td>
                        <td colSpan={3} className='p-0 h-2 text-right font-semibold text-gray-700'>
                          <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'></div>
                        </td>
                        <td className='p-0 h-2 text-right font-semibold text-new-blue'>
                          <div className='w-full h-full px-3 py-2 border-b border-[#E0E0E1]'>
                            {formatNumber(dataSupplierDebt?.rsImports?.reduce((acc, curr) => acc + Number(curr?.amount), 0) || 0)}
                          </div>
                        </td>
                      </tr>
                    </>
                  )}

                  {Array.isArray(dataSupplierDebt?.rsReturns) && dataSupplierDebt.rsReturns?.length > 0 && (
                    <>
                      <tr className='bg-amber-100 responsive-text-sm'>
                        <td colSpan={10} className='p-0 h-2 text-center text-gray-700'>
                          <div className='w-full h-full px-3 py-2 border-b border-[#E0E0E1] font-semibold uppercase'>Trả lại hàng mua</div>
                        </td>
                      </tr>
                      {/* Returns items - từng item */}
                      {dataSupplierDebt?.rsReturns?.map((ret, rIdx) => (
                        <Fragment key={`return-${rIdx}`}>
                          {/* Summary row for all returns */}
                          <tr className='bg-amber-50/50 responsive-text-sm'>
                            <td className='p-0 h-2 text-center text-gray-700'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{moment(ret?.date).format('DD/MM/YYYY') || '-'}</div>
                            </td>
                            <td className='p-0 h-2 text-center text-gray-700'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{ret?.code_import || '-'}</div>
                            </td>
                            <td className='p-0 h-2 text-left text-gray-700 align-middle'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{ret?.item_name || ret?.item_code || '-'}</div>
                            </td>
                            <td className='p-0 h-2 text-left text-gray-700 align-middle'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{ret?.item_variation || '-'}</div>
                            </td>
                            <td className='p-0 h-2 text-center text-gray-700 align-middle'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{ret?.unit_name || '-'}</div>
                            </td>
                            <td className='p-0 h-2 text-center text-gray-700 align-middle'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{Number(ret?.quantity) === 0 ? '-' : formatNumber(Number(ret?.quantity))}</div>
                            </td>
                            <td className='p-0 h-2 text-center text-gray-700 align-middle'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{Number(ret?.price) === 0 ? '-' : formatNumber(Number(ret?.price))}</div>
                            </td>
                            <td className='p-0 h-2 text-center'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>
                                {Number(ret?.price_after_discount) === 0 ? '-' : formatNumber(Number(ret?.price_after_discount))}
                              </div>
                            </td>
                            <td className='p-0 h-2 text-center'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{Number(ret?.tax_rate) !== 0 ? ret?.tax_rate + '%' : '-'}</div>
                            </td>
                            <td className='p-0 h-2 text-right text-gray-700 align-middle'>
                              <div className='w-full h-full px-3 py-2 border-b border-[#E0E0E1]'>{Number(ret?.amount) === 0 ? '-' : formatNumber(Number(ret?.amount))}</div>
                            </td>
                          </tr>
                        </Fragment>
                      ))}
                      <tr className='bg-amber-50 responsive-text-sm'>
                        <td colSpan={5} className='p-0 h-2 font-semibold text-gray-700'>
                          <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1] capitalize'>Tổng cộng</div>
                        </td>
                        <td className='p-0 h-2 text-center font-semibold text-new-blue'>
                          <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>
                            {formatNumber(dataSupplierDebt?.rsReturns?.reduce((acc, curr) => acc + Number(curr?.quantity), 0) || 0)}
                          </div>
                        </td>
                        <td colSpan={3} className='p-0 h-2 text-right font-semibold text-gray-700'>
                          <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'></div>
                        </td>
                        <td className='p-0 h-2 text-right font-semibold text-amber-600'>
                          <div className='w-full h-full px-3 py-2 border-b border-[#E0E0E1]'>
                            {formatNumber(dataSupplierDebt?.rsReturns?.reduce((acc, curr) => acc + Number(curr?.amount), 0) || 0)}
                          </div>
                        </td>
                      </tr>
                    </>
                  )}

                  {Array.isArray(dataSupplierDebt?.rsServices) && dataSupplierDebt.rsServices?.length > 0 && (
                    <>
                      <tr className='bg-purple-100 responsive-text-sm'>
                        <td colSpan={10} className='p-0 h-2 text-center text-gray-700'>
                          <div className='w-full h-full px-3 py-2 border-b border-[#E0E0E1] font-semibold uppercase'>Dịch vụ</div>
                        </td>
                      </tr>
                      {/* Returns items - từng item */}
                      {dataSupplierDebt?.rsServices?.map((rsService, rIdx) => (
                        <Fragment key={`rsService-${rIdx}`}>
                          {/* Summary row for all returns */}
                          <tr className='bg-purple-50/50 responsive-text-sm'>
                            <td className='p-0 h-2 text-center text-gray-700'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{moment(rsService?.date).format('DD/MM/YYYY') || '-'}</div>
                            </td>
                            <td className='p-0 h-2 text-center text-gray-700'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{rsService?.code_import || '-'}</div>
                            </td>
                            <td className='p-0 h-2 text-left text-gray-700 align-middle'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{rsService?.name_item || rsService?.item_code || '-'}</div>
                            </td>
                            <td className='p-0 h-2 text-left text-gray-700 align-middle'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'></div>
                            </td>
                            <td className='p-0 h-2 text-center text-gray-700 align-middle'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'></div>
                            </td>
                            <td className='p-0 h-2 text-center text-gray-700 align-middle'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{Number(rsService?.quantity) === 0 ? '-' : formatNumber(Number(rsService?.quantity))}</div>
                            </td>
                            <td className='p-0 h-2 text-center text-gray-700 align-middle'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{Number(rsService?.price) === 0 ? '-' : formatNumber(Number(rsService?.price))}</div>
                            </td>
                            <td className='p-0 h-2 text-center'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>
                                {Number(rsService?.price) === 0 ? '-' : formatNumber(Number(rsService?.price) * (1 - Number(rsService?.discount_percent) / 100))}
                              </div>
                            </td>
                            <td className='p-0 h-2 text-center'>
                              <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{Number(rsService?.tax_rate) !== 0 ? rsService?.tax_rate + '%' : '-'}</div>
                            </td>
                            <td className='p-0 h-2 text-right text-gray-700 align-middle'>
                              <div className='w-full h-full px-3 py-2 border-b border-[#E0E0E1]'>{Number(rsService?.amount) === 0 ? '-' : formatNumber(Number(rsService?.amount))}</div>
                            </td>
                          </tr>
                        </Fragment>
                      ))}
                      <tr className='bg-purple-50 responsive-text-sm'>
                        <td colSpan={5} className='p-0 h-2 font-semibold text-gray-700'>
                          <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1] capitalize'>Tổng cộng</div>
                        </td>
                        <td className='p-0 h-2 text-center font-semibold text-new-blue'>
                          <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>
                            {formatNumber(dataSupplierDebt?.rsServices?.reduce((acc, curr) => acc + Number(curr?.quantity), 0) || 0)}
                          </div>
                        </td>
                        <td colSpan={3} className='p-0 h-2 text-right font-semibold text-gray-700'>
                          <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'></div>
                        </td>
                        <td className='p-0 h-2 text-right font-semibold text-purple-600'>
                          <div className='w-full h-full px-3 py-2 border-b border-[#E0E0E1]'>
                            {formatNumber(dataSupplierDebt?.rsServices?.reduce((acc, curr) => acc + Number(curr?.amount), 0) || 0)}
                          </div>
                        </td>
                      </tr>
                    </>
                  )}

                  <tr className='bg-gray-100 responsive-text-sm'>
                    <td colSpan={9} className='p-0 h-2 text-left text-gray-700'>
                      <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1] font-semibold capitalize'>Tổng cộng phát sinh trong kỳ</div>
                    </td>
                    <td className='p-0 h-2 text-right font-semibold text-new-blue'>
                      <div className='w-full h-full px-3 py-2 border-b border-[#E0E0E1]'>
                        {
                          (() => {
                            const total = 
                              (Array.isArray(dataSupplierDebt?.rsImports)
                                ? dataSupplierDebt.rsImports.reduce((acc, curr) => acc + Number(curr?.amount || 0), 0)
                                : 0) -
                              (Array.isArray(dataSupplierDebt?.rsReturns)
                                ? dataSupplierDebt.rsReturns.reduce((acc, curr) => acc + Number(curr?.amount || 0), 0)
                                : 0) +
                              (Array.isArray(dataSupplierDebt?.rsServices)
                                ? dataSupplierDebt.rsServices.reduce((acc, curr) => acc + Number(curr?.amount || 0), 0)
                                : 0);

                            return total === 0 ? '-' : formatNumber(total);
                          })()
                        }
                      </div>
                    </td>
                  </tr>

                  {/* Phiếu khác trong kỳ */}
                  {Array.isArray(dataSupplierDebt?.rsPaySlips) && dataSupplierDebt.rsPaySlips?.length > 0 && (
                    <>
                      <tr className='bg-emerald-500/80 responsive-text-sm'>
                        <td colSpan={10} className='p-0 h-2 text-center text-gray-700'>
                          <div className='w-full h-full px-3 py-2 border-b border-[#E0E0E1] font-semibold uppercase'>Phiếu chi trong kỳ</div>
                        </td>
                      </tr>
                      <tr className='bg-emerald-100 responsive-text-sm'>
                        <td className='p-0 h-2 font-semibold text-center text-gray-700'>
                          <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>Ngày chứng từ</div>
                        </td>
                        <td className='p-0 h-2 font-semibold text-center text-gray-700'>
                          <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>Mã phiếu</div>
                        </td>
                        <td className='p-0 h-2 font-semibold text-gray-700' colSpan={7}>
                          <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>Ghi chú</div>
                        </td>
                        <td className='p-0 h-2 text-right font-semibold text-gray-700'>
                          <div className='w-full h-full px-3 py-2 border-b border-[#E0E0E1]'>Số tiền</div>
                        </td>
                      </tr>

                      {dataSupplierDebt.rsPaySlips.map((rsPaySlip, cIdx) => (
                        <tr key={`rsPaySlip-${cIdx}`} className='hover:bg-gray-50 responsive-text-sm'>
                          <td className='p-0 h-2 text-center text-gray-700'>
                            <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{rsPaySlip?.date ? moment(rsPaySlip.date).format('DD/MM/YYYY') : '-'}</div>
                          </td>
                          <td className='p-0 h-2 text-center text-gray-700'>
                            <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{rsPaySlip?.code || '-'}</div>
                          </td>
                          <td className='p-0 h-2' colSpan={7}>
                            <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1]'>{rsPaySlip?.note || '-'}</div>
                          </td>
                          <td className='p-0 h-2 text-right text-gray-700'>
                            <div className='w-full h-full px-3 py-2 border-b border-[#E0E0E1]'>{Number(rsPaySlip?.total) ? formatNumber(Number(rsPaySlip?.total)) : '-'}</div>
                          </td>
                        </tr>
                      ))}

                      {/* Tổng cộng phiếu thu trong kỳ */}
                      <tr className='bg-emerald-100 responsive-text-sm'>
                        <td colSpan={9} className='p-0 h-2 font-semibold text-gray-700'>
                          <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1] capitalize'>Tổng cộng</div>
                        </td>
                        <td className='p-0 h-2 text-right font-semibold text-gray-700'>
                          <div className='w-full h-full px-3 py-2 border-b border-[#E0E0E1]'>
                            {formatNumber(dataSupplierDebt?.rsPaySlips?.reduce((acc, curr) => acc + Number(curr?.total), 0) || 0)}
                          </div>
                        </td>
                      </tr>
                    </>
                  )}

                  {/* Số dư cuối kỳ */}
                  <tr className='bg-gray-100 responsive-text-sm'>
                    <td colSpan={9} className='p-0 h-2 font-bold text-gray-800'>
                      <div className='w-full h-full px-3 py-2 border-r border-b border-[#E0E0E1] capitalize'>Số dư cuối kỳ</div>
                    </td>
                    <td className='p-0 h-2 text-right font-bold text-new-blue'>
                      <div className='w-full h-full px-3 py-2 border-b border-[#E0E0E1]'>
                        {(() => {
                          const endingBalance =
                            Number(dataSupplierDebt?.debt?.begin_debt || 0) +
                            (
                              (Array.isArray(dataSupplierDebt?.rsImports)
                                ? dataSupplierDebt.rsImports.reduce((acc, curr) => acc + Number(curr?.amount || 0), 0)
                                : 0) -
                              (Array.isArray(dataSupplierDebt?.rsReturns)
                                ? dataSupplierDebt.rsReturns.reduce((acc, curr) => acc + Number(curr?.amount || 0), 0)
                                : 0) +
                              (Array.isArray(dataSupplierDebt?.rsServices)
                                ? dataSupplierDebt.rsServices.reduce((acc, curr) => acc + Number(curr?.amount || 0), 0)
                                : 0)
                            ) -
                            (Array.isArray(dataSupplierDebt?.rsPaySlips)
                              ? dataSupplierDebt.rsPaySlips.reduce((acc, curr) => acc + Number(curr?.total || 0), 0)
                              : 0);

                          return Number(endingBalance) === 0 ? "-" : formatNumber(endingBalance);
                        })()}
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </Customscrollbar>
          </div>
        ) : !selectedSupplier ? (
          <div className='flex flex-col items-center justify-center h-full'>
            <Image src='/background/system/repostSupplier.png' alt='Không có dữ liệu' width={165} height={100} />
            <div className='flex items-center gap-2 mt-2'>
              <FaPlus color='#000' className='size-4' />
              <p className='responsive-text-base font-semibold text-neutral-05'>Chọn nhà cung cấp</p>
            </div>
            <p className='responsive-text-sm text-neutral-03 mt-2'>{noDataTitle}</p>
          </div>
        ) : (
          <NoData titleText={noDataTitle} type='report' classNameImage='w-[245px]' />
        )
      }
    />
  );
};

export default SupplierDebt;
