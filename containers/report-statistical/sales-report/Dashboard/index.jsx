import SaleIcon from '@/components/icons/common/SaleIcon';
import ReportLayout from '@/components/layout/ReportLayout';
import { useLanguageContext } from '@/context/ui/LanguageContext';
import { usePersistedBranches } from '@/hooks/common/usePersistedBranches';
import useSetingServer from '@/hooks/useConfigNumber';
import useStatusExprired from '@/hooks/useStatusExprired';
import formatNumberConfig from '@/utils/helpers/formatnumber';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useDebounce } from 'use-debounce';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';

const breadcrumbItems = [
  {
    label: `Báo cáo`,
  },
  {
    label: `Báo cáo bán hàng`,
  },
  {
    label: `Tổng quan bán hàng`,
    href: '/report-statistical/sales-report/dashboard',
  },
];

const Dashboard = props => {
  const dataSeting = useSetingServer();
  const router = useRouter();
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
  const [selectedCustomer, setSelectedCustomer] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState([]);
  const [limit, setLimit] = useState(15);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue] = useDebounce(searchValue, 500);

  // Search values riêng cho từng API
  const [customerSearchValue, setCustomerSearchValue] = useState('');
  const [debouncedCustomerSearchValue] = useDebounce(customerSearchValue, 500);
  const [orderSearchValue, setOrderSearchValue] = useState('');
  const [debouncedOrderSearchValue] = useDebounce(orderSearchValue, 500);

  const { selectedBranches, setSelectedBranches } = usePersistedBranches();

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

  const handleSearch = value => {
    const searchValue = value?.target?.value || (typeof value === 'string' ? value : '');
    setSearchValue(searchValue);
  };

  const handleLimitChange = newLimit => {
    setLimit(newLimit);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: 1, limit: newLimit },
    });
  };

  return (
    <ReportLayout
      title={'Tổng quan bán hàng'}
      statusExprired={statusExprired}
      breadcrumbItems={breadcrumbItems}
      maginBottom={true}
      branchValue={selectedBranches}
      onBranchChange={setSelectedBranches}
      onBranchClear={() => setSelectedBranches([])}
    >
      <div className='h-full px-3'>
        <div className='grid grid-rows-2 gap-4 h-full min-h-0'>
          {/* Hàng 1 */}
          <div className='grid grid-cols-5 gap-4'>
            <div className='col-span-3'>
              <div className='grid h-full grid-rows-10 gap-3'>
                <div className='row-span-3 grid grid-cols-4 gap-3'>
                  <div className='flex flex-col gap-3 rounded-2xl bg-[#FFE2E5] shadow-[0px_1px_8px_0px_#00000012] py-3 px-4 2xl:px-6'>
                    <div className='flex gap-2 items-center'>
                      <div className='bg-[#FA5A7D] rounded-full p-2'>
                        <SaleIcon className='w-6 h-6' />
                      </div>
                      <h3 className='responsive-text-sm text-[#FA5A7D] font-medium'>Bán hàng</h3>
                    </div>
                    <p className='responsive-text-3xl text-[#425166] font-medium whitespace-nowrap'>300.000 đ</p>
                  </div>
                  <div className='flex flex-col gap-3 rounded-2xl bg-[#FFF4DE] shadow-[0px_1px_8px_0px_#00000012] py-3 px-4 2xl:px-6'>
                    <div className='flex gap-2 items-center'>
                      <div className='bg-[#FF947A] rounded-full p-2'>
                        <SaleIcon className='w-6 h-6' />
                      </div>
                      <h3 className='responsive-text-sm text-[#FF947A] font-medium'>Thu tiền</h3>
                    </div>
                    <p className='responsive-text-3xl text-[#425166] font-medium whitespace-nowrap'>300.000 đ</p>
                  </div>
                  <div className='flex flex-col gap-3 rounded-2xl bg-[#DCFCE7] shadow-[0px_1px_8px_0px_#00000012] py-3 px-4 2xl:px-6'>
                    <div className='flex gap-2 items-center'>
                      <div className='bg-[#14B32E] rounded-full p-2'>
                        <SaleIcon className='w-6 h-6' />
                      </div>
                      <h3 className='responsive-text-sm text-[#14B32E] font-medium'>Doanh thu</h3>
                    </div>
                    <p className='responsive-text-3xl text-[#425166] font-medium whitespace-nowrap'>300.000 đ</p>
                  </div>
                  <div className='flex flex-col gap-3 rounded-2xl bg-[#F3E8FF] shadow-[0px_1px_8px_0px_#00000012] py-3 px-4 2xl:px-6'>
                    <div className='flex gap-2 items-center'>
                      <div className='bg-[#BF83FF] rounded-full p-2'>
                        <SaleIcon className='w-6 h-6' />
                      </div>
                      <h3 className='responsive-text-sm text-[#BF83FF] font-medium'>Lợi nhuận</h3>
                    </div>
                    <p className='responsive-text-3xl text-[#425166] font-medium whitespace-nowrap'>300.000 đ</p>
                  </div>
                </div>
                <div className='row-span-7 rounded-[20px] bg-[#EEF6FF] p-4 flex flex-col'>
                  <h2 className='text-center font-semibold responsive-text-xl'>Công Nợ</h2>
                  <ResponsiveContainer width='100%' height={220}>
                    <LineChart
                      data={[
                        { name: '0', value: 10000 },
                        { name: '30', value: 55000 },
                        { name: '60', value: 35000 },
                        { name: '90', value: 60000 },
                        { name: '180', value: 48000 },
                        { name: '>180', value: 75000 },
                      ]}
                      margin={{ top: 32, right: 32, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid stroke="#D9D9D9" strokeDasharray="0" vertical={false} />
                      <XAxis
                        dataKey='name'
                        tick={{ fill: '#828383', fontSize: 14, fontWeight: 400 }}
                        padding={{ left: 0, right: 60 }}
                        tickMargin={14}
                        allowDuplicatedCategory={false}
                        interval={0}
                        minTickGap={32}
                        tickFormatter={value => value === '0' ? '' : value}
                        tickLine={{ strokeWidth: 0, y2: 0 }}
                        axisLine={{ stroke: '#D9D9D9', strokeWidth: 1 }}
                      >
                        <Label
                          value='(Ngày)'
                          position='insideRight'
                          offset={-8}
                          style={{
                            textAnchor: 'end',
                            fill: '#003DA0',
                            fontSize: 10,
                            fontWeight: 400,
                            transform: 'translateY(8px)',
                          }}
                        />
                      </XAxis>
                      <YAxis
                        tickFormatter={v => v.toLocaleString('vi-VN')}
                        domain={[0, 100000]}
                        tick={{ fill: '#828383', fontSize: 14, fontWeight: 400 }}
                        tickLine={{ strokeWidth: 0, y2: 0 }}
                        axisLine={{ stroke: '#D9D9D9', strokeWidth: 1 }}
                      >
                        <Label
                          value='(Ngàn đồng)'
                          position='top'
                          offset={10}
                          style={{
                            textAnchor: 'start',
                            fill: '#003DA0',
                            fontSize: 10,
                            fontWeight: 400,
                            transform: 'translateY(-10px)',
                          }}
                        />
                      </YAxis>
                      <YAxis
                        orientation="right"
                        axisLine={{ stroke: '#D9D9D9', strokeWidth: 1 }}
                        tickLine={false}
                        ticks={[]}
                        label={false}
                      />
                      <Tooltip formatter={value => value.toLocaleString('vi-VN')} />
                      <Line
                        dataKey='value'
                        stroke='#69A6D2'
                        fill='#69A6D2'
                        strokeWidth={3}
                        dot={{ r: 5, stroke: '#69A6D2', fill: '#fff', strokeWidth: 3 }}
                        activeDot={{ r: 8, stroke: '#69A6D2', fill: '#fff', strokeWidth: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className='col-span-2 bg-green-100 rounded p-4'>Ô 2, hàng 1 (40%)</div>
          </div>
          {/* Hàng 2 */}
          <div className='grid grid-cols-3 gap-4'>
            <div className='bg-yellow-100 rounded p-4'>Ô 1, hàng 2 (1/3)</div>
            <div className='bg-pink-100 rounded p-4'>Ô 2, hàng 2 (1/3)</div>
            <div className='bg-purple-100 rounded p-4'>Ô 3, hàng 2 (1/3)</div>
          </div>
        </div>
      </div>
    </ReportLayout>
  );
};

export default Dashboard;
