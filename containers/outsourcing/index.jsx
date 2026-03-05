import ButtonAnimationNew from '@/components/common/button/ButtonAnimationNew';
import StatusCheckboxGroup from '@/components/common/checkbox/StatusCheckboxGroup';
import FilterDropdown from '@/components/common/dropdown/FilterDropdown';
import LimitListDropdown from '@/components/common/dropdown/LimitListDropdown';
import TabSwitcherWithUnderline from '@/components/common/tab/TabSwitcherWithUnderline';
import { CaretDownIcon, MagnifyingGlassIcon, PlusIcon, PrinterIcon, TrashIcon } from '@/components/icons';
import UnionStepIcon from '@/components/icons/common/UnionStepIcon';
import FunnelIcon from '@/components/icons/common/FunnelIcon';
import BreadcrumbCustom from '@/components/UI/breadcrumb/BreadcrumbCustom';
import DateToDateComponent from '@/components/UI/filterComponents/dateTodateComponent';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import NoData from '@/components/UI/noData/nodata';
import { Container } from '@/components/UI/common/layout';
import Head from 'next/head';
import Image from 'next/image';
import React, { useMemo, useState } from 'react';
import PopupConfim from '@/components/UI/popupConfim/popupConfim';
import SelectComponentNew from '@/components/common/select/SelectComponentNew';
import { useSelector } from 'react-redux';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const OutsourcingStatusDonutTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;

  return (
    <div className='bg-white border border-[#E5E7EB] rounded-lg shadow-lg px-3 py-2'>
      <div className='text-sm font-semibold text-[#101828]'>{d.label}</div>
      <div className='mt-1 text-xs text-[#667085] flex items-center justify-between gap-6'>
        <span>Số lượng</span>
        <span className='font-medium text-[#101828]'>{d.count ?? 0}</span>
      </div>
      <div className='mt-0.5 text-xs text-[#667085] flex items-center justify-between gap-6'>
        <span>Tỷ lệ</span>
        <span className='font-medium text-[#101828]'>{d.value ?? 0}%</span>
      </div>
    </div>
  );
};

const OutsourcingSteps = ({ statusKey }) => {
  const stepState = useMemo(() => {
    switch (statusKey) {
      case 'created':
        return { step1: true, step2: false, step3: false };
      case 'exported':
        return { step1: true, step2: true, step3: false };
      case 'received':
        return { step1: true, step2: true, step3: true };
      default:
        return { step1: false, step2: false, step3: false };
    }
  }, [statusKey]);

  return (
    <div className='flex items-center gap-0'>
      <div className='relative z-[3] flex items-center justify-center w-[100px]'>
        <UnionStepIcon active={stepState.step1} className='h-11 2xl:h-[45px] w-auto flex-shrink-0' />
        <span
          className={`absolute inset-0 flex items-center justify-center font-medium text-xs whitespace-nowrap px-4 ${stepState.step1 ? 'text-white' : 'text-[#9295A4]'}`}
        >
          Mới khởi tạo
        </span>
      </div>

      <div className='relative z-[2] flex items-center justify-center min-w-[70px] -ml-[23px]'>
        <UnionStepIcon active={stepState.step2} className='h-11 2xl:h-[45px] w-auto flex-shrink-0' />
        <span
          className={`absolute inset-0 flex items-center justify-center font-medium text-xs whitespace-nowrap px-4 ml-3 ${stepState.step2 ? 'text-white' : 'text-[#9295A4]'
            }`}
        >
          Xuất kho <br /> gia công
        </span>
      </div>

      <div className='relative z-[1] flex items-center justify-center min-w-[70px] -ml-[23px]'>
        <UnionStepIcon active={stepState.step3} className='h-11 2xl:h-[45px] w-auto flex-shrink-0' />
        <span
          className={`absolute inset-0 flex items-center justify-center font-medium text-xs whitespace-nowrap px-4 ${stepState.step3 ? 'text-white' : 'text-[#9295A4]'
            }`}
        >
          Nhập gia công
        </span>
      </div>
    </div>
  );
};

const OutsourcingOrderDetail = ({ order, stats }) => {
  if (!order) {
    return (
      <div className='w-full h-full rounded-lg border border-dashed border-[#F3F4F6] bg-white/40 flex items-center justify-center text-sm text-[#667085]'>
        Chưa có dữ liệu đơn gia công
      </div>
    );
  }

  const { total, completed, processing, pending, overdue } = stats || {};
  const [activeIndex, setActiveIndex] = useState(null);

  const chartData = useMemo(() => {
    const safeTotal = Number(total ?? 0) || 0;
    const toPercent = n => {
      if (!safeTotal) return 0;
      return Math.round((Number(n ?? 0) / safeTotal) * 100);
    };

    return [
      // Hoàn thành
      { key: 'completed', label: 'Hoàn thành', count: completed ?? 0, value: toPercent(completed), color: '#A2DFB2' },
      // Đang gia công
      { key: 'processing', label: 'Đang gia công', count: processing ?? 0, value: toPercent(processing), color: '#75BDE0' },
      // Chưa gia công
      { key: 'pending', label: 'Chưa gia công', count: pending ?? 0, value: toPercent(pending), color: '#FEDFAE' },
      // Quá hạn
      { key: 'overdue', label: 'Quá hạn', count: overdue ?? 0, value: toPercent(overdue), color: '#EF8F99' },
    ];
  }, [total, completed, processing, pending, overdue]);

  const filteredChartData = useMemo(() => chartData.filter(d => (d.value ?? 0) > 0), [chartData]);
  const hasNoData = filteredChartData.length === 0;

  return (
    <div className='w-full h-full rounded-2xl border border-[#F3F4F6] bg-white shadow-sm flex flex-col overflow-hidden'>
      <div className='p-4 3xl:p-6 flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto'>
        {/* Steps */}
        <OutsourcingSteps statusKey={order.statusKey} />

        {/* Thông tin đơn gia công */}
        <div className='mt-4 flex flex-col gap-4'>
          <h3 className='text-[20px] leading-6 font-medium text-[#003DA0]'>Thông Tin Đơn Gia Công</h3>

          <div className='flex flex-col gap-3 text-sm text-[#344054]'>
            <div className='flex items-center justify-between gap-4'>

              <div className='flex flex-col gap-3'>
                <span className='text-base text-[#637381]'>Ngày tạo đơn</span>
                <div className="flex gap-2 items-center pl-3">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 2H11.5V1.5C11.5 1.36739 11.4473 1.24021 11.3536 1.14645C11.2598 1.05268 11.1326 1 11 1C10.8674 1 10.7402 1.05268 10.6464 1.14645C10.5527 1.24021 10.5 1.36739 10.5 1.5V2H5.5V1.5C5.5 1.36739 5.44732 1.24021 5.35355 1.14645C5.25979 1.05268 5.13261 1 5 1C4.86739 1 4.74021 1.05268 4.64645 1.14645C4.55268 1.24021 4.5 1.36739 4.5 1.5V2H3C2.73478 2 2.48043 2.10536 2.29289 2.29289C2.10536 2.48043 2 2.73478 2 3V13C2 13.2652 2.10536 13.5196 2.29289 13.7071C2.48043 13.8946 2.73478 14 3 14H13C13.2652 14 13.5196 13.8946 13.7071 13.7071C13.8946 13.5196 14 13.2652 14 13V3C14 2.73478 13.8946 2.48043 13.7071 2.29289C13.5196 2.10536 13.2652 2 13 2ZM4.5 3V3.5C4.5 3.63261 4.55268 3.75979 4.64645 3.85355C4.74021 3.94732 4.86739 4 5 4C5.13261 4 5.25979 3.94732 5.35355 3.85355C5.44732 3.75979 5.5 3.63261 5.5 3.5V3H10.5V3.5C10.5 3.63261 10.5527 3.75979 10.6464 3.85355C10.7402 3.94732 10.8674 4 11 4C11.1326 4 11.2598 3.94732 11.3536 3.85355C11.4473 3.75979 11.5 3.63261 11.5 3.5V3H13V5H3V3H4.5ZM13 13H3V6H13V13Z" fill="#9295A4" />
                  </svg>
                  <span className='text-[#141522]'>{order.createdAt}</span>
                </div>
              </div>

            </div>

            <div className='flex flex-col gap-3'>
              <span className='text-base text-[#637381]'>Nhà gia công</span>
              <div className="flex gap-2 items-center pl-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.5 3.5H11V3C11 2.60218 10.842 2.22064 10.5607 1.93934C10.2794 1.65804 9.89782 1.5 9.5 1.5H6.5C6.10218 1.5 5.72064 1.65804 5.43934 1.93934C5.15804 2.22064 5 2.60218 5 3V3.5H2.5C2.23478 3.5 1.98043 3.60536 1.79289 3.79289C1.60536 3.98043 1.5 4.23478 1.5 4.5V12.5C1.5 12.7652 1.60536 13.0196 1.79289 13.2071C1.98043 13.3946 2.23478 13.5 2.5 13.5H13.5C13.7652 13.5 14.0196 13.3946 14.2071 13.2071C14.3946 13.0196 14.5 12.7652 14.5 12.5V4.5C14.5 4.23478 14.3946 3.98043 14.2071 3.79289C14.0196 3.60536 13.7652 3.5 13.5 3.5ZM6 3C6 2.86739 6.05268 2.74021 6.14645 2.64645C6.24021 2.55268 6.36739 2.5 6.5 2.5H9.5C9.63261 2.5 9.75979 2.55268 9.85355 2.64645C9.94732 2.74021 10 2.86739 10 3V3.5H6V3ZM10 4.5V12.5H6V4.5H10ZM2.5 4.5H5V12.5H2.5V4.5ZM13.5 12.5H11V4.5H13.5V12.5Z" fill="#9295A4" />
                </svg>
                <span className='text-[#141522]'>{order.vendorName}</span>
              </div>
            </div>

            <div className='flex items-center justify-between gap-4 w-full'>
              <div className='flex flex-col gap-3 w-full'>
                <span className='text-base text-[#667085]'>Loại gia công</span>
                <div className="flex justify-between w-full">
                  <div className="flex gap-2 items-center pl-3">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M3.18838 8L0.264375 9.559C0.184503 9.60168 0.11772 9.66524 0.0711572 9.74291C0.0245944 9.82058 0 9.90944 0 10C0 10.0906 0.0245944 10.1794 0.0711572 10.2571C0.11772 10.3348 0.184503 10.3983 0.264375 10.441L7.76438 14.441C7.83672 14.4795 7.91742 14.4997 7.99938 14.4997C8.08133 14.4997 8.16204 14.4795 8.23438 14.441L15.7344 10.441C15.8142 10.3983 15.881 10.3348 15.9276 10.2571C15.9742 10.1794 15.9988 10.0906 15.9988 10C15.9988 9.90944 15.9742 9.82058 15.9276 9.74291C15.881 9.66524 15.8142 9.60168 15.7344 9.559L12.8134 8L11.7504 8.567L14.4384 10L8.00038 13.433L1.56238 10L4.25038 8.567L3.18738 8H3.18838Z" fill="#9295A4" />
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M7.76438 1.55916C7.83672 1.52064 7.91742 1.50049 7.99938 1.50049C8.08133 1.50049 8.16203 1.52064 8.23438 1.55916L15.7344 5.55915C15.8142 5.60183 15.881 5.6654 15.9276 5.74307C15.9742 5.82074 15.9988 5.9096 15.9988 6.00015C15.9988 6.09071 15.9742 6.17957 15.9276 6.25724C15.881 6.33491 15.8142 6.39848 15.7344 6.44115L8.23438 10.4412C8.16203 10.4797 8.08133 10.4998 7.99938 10.4998C7.91742 10.4998 7.83672 10.4797 7.76438 10.4412L0.264375 6.44115C0.184503 6.39848 0.11772 6.33491 0.0711572 6.25724C0.0245944 6.17957 0 6.09071 0 6.00015C0 5.9096 0.0245944 5.82074 0.0711572 5.74307C0.11772 5.6654 0.184503 5.60183 0.264375 5.55915L7.76438 1.55916ZM1.56238 6.00015L7.99938 9.43315L14.4374 6.00015L7.99938 2.56716L1.56138 6.00015H1.56238Z" fill="#9295A4" />
                    </svg>
                    <span className='text-[#141522]'>Bán TP</span>
                  </div>

                  <div className="">
                    <span className='text-[#141522]'>Công đoạn:</span> {' '}
                    <span className='text-[#0375F3] font-medium'>May</span>
                  </div>
                </div>
              </div>
            </div>

            <div className='flex flex-col gap-3'>
              <span className='text-base text-[#667085]'>Loại hàng gia công</span>
              <div className='flex flex-wrap gap-2 pl-3'>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M4.97978 4C4.90484 4.00011 4.83088 4.01706 4.76338 4.0496C4.69587 4.08214 4.63654 4.12944 4.58978 4.188L1.53978 8H5.99978C6.13239 8 6.25957 8.05268 6.35334 8.14645C6.4471 8.24021 6.49978 8.36739 6.49978 8.5C6.49978 8.89782 6.65782 9.27936 6.93912 9.56066C7.22043 9.84196 7.60196 10 7.99978 10C8.39761 10 8.77914 9.84196 9.06044 9.56066C9.34175 9.27936 9.49978 8.89782 9.49978 8.5C9.49978 8.36739 9.55246 8.24021 9.64623 8.14645C9.74 8.05268 9.86717 8 9.99978 8H14.4598L11.4098 4.188C11.363 4.12944 11.3037 4.08214 11.2362 4.0496C11.1687 4.01706 11.0947 4.00011 11.0198 4H4.97978ZM14.9338 9H10.4498C10.335 9.56514 10.0284 10.0732 9.58191 10.4382C9.13541 10.8031 8.57646 11.0025 7.99978 11.0025C7.4231 11.0025 6.86416 10.8031 6.41765 10.4382C5.97115 10.0732 5.66454 9.56514 5.54978 9H1.06578L1.38578 11.562C1.40091 11.6831 1.45979 11.7944 1.55134 11.8751C1.64288 11.9558 1.76076 12.0002 1.88278 12H14.1168C14.2386 12 14.3563 11.9554 14.4476 11.8748C14.5389 11.7941 14.5977 11.6829 14.6128 11.562L14.9328 9H14.9338ZM3.80878 3.563C3.94938 3.38724 4.12773 3.24537 4.33061 3.14791C4.53349 3.05045 4.75571 2.9999 4.98078 3H11.0188C11.2439 2.9999 11.4661 3.05045 11.669 3.14791C11.8718 3.24537 12.0502 3.38724 12.1908 3.563L15.8908 8.188C15.9324 8.24018 15.9631 8.30016 15.9811 8.36439C15.9991 8.42862 16.0041 8.49581 15.9958 8.562L15.6058 11.686C15.5604 12.0489 15.3841 12.3827 15.1099 12.6247C14.8357 12.8667 14.4825 13.0001 14.1168 13H1.88278C1.51707 13.0001 1.16391 12.8667 0.889698 12.6247C0.61549 12.3827 0.43913 12.0489 0.393782 11.686L0.00378209 8.562C-0.00441416 8.49574 0.000742512 8.42851 0.0189479 8.36428C0.0371533 8.30004 0.0680387 8.24011 0.109782 8.188L3.80978 3.563H3.80878Z" fill="#9295A4" />
                </svg>
                {(order.followRefs || []).map(ref => (
                  <button
                    key={ref}
                    type='button'
                    className=' font-medium text-[#0375F3]  '
                  >
                    <span className=''>{ref}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="w-full h-[1px] flex-shrink-0 bg-[#F3F3F4]"></div>
        {/* Thống kê trạng thái */}
        <div className='mt-4 flex-1 flex flex-col gap-4'>
          <h3 className='text-[20px] leading-6 font-medium text-[#003DA0]'>Thống Kê Trạng Thái</h3>
          <div className='flex-1 flex gap-4 items-center'>
            {/* Legend + total */}
            <div className='flex flex-col gap-3 min-w-[140px]'>
              <div className='flex items-baseline gap-2'>
                <span className='text-[32px] leading-none font-medium text-[#0375F3]'>{total}</span>
                <span className='text-sm font-medium text-[#101828]'>Đơn gia công</span>
              </div>
              <div className='flex flex-col gap-2 text-sm'>
                {/* Hoàn thành */}
                <div className='flex items-center gap-2'>
                  <span
                    className='w-7 h-7 rounded-md flex items-center justify-center'
                    style={{ backgroundColor: '#35BD4B33', borderColor: '#35BD4B33' }}
                  >
                    <span className='text-xs font-medium' style={{ color: '#1A7526' }}>
                      {completed}
                    </span>
                  </span>
                  <span className='flex-1 text-[#637381]'>Hoàn thành</span>
                </div>
                {/* Đang gia công */}
                <div className='flex items-center gap-2'>
                  <span
                    className='w-7 h-7 rounded-md flex items-center justify-center'
                    style={{ backgroundColor: '#D8F3FD', borderColor: '#D8F3FD' }}
                  >
                    <span className='text-xs font-medium' style={{ color: '#14729B' }}>
                      {processing}
                    </span>
                  </span>
                  <span className='flex-1 text-[#637381]'>Đang gia công</span>
                </div>
                {/* Chưa gia công */}
                <div className='flex items-center gap-2'>
                  <span
                    className='w-7 h-7 rounded-md flex items-center justify-center'
                    style={{ backgroundColor: '#FFECDD', borderColor: '#FFECDD' }}
                  >
                    <span className='text-xs font-medium' style={{ color: '#C25705' }}>
                      {pending}
                    </span>
                  </span>
                  <span className='flex-1 text-[#637381]'>Chưa gia công</span>
                </div>
                {/* Quá hạn */}
                <div className='flex items-center gap-2'>
                  <span
                    className='w-7 h-7 rounded-md flex items-center justify-center'
                    style={{ backgroundColor: '#FDDBDA', borderColor: '#FDDBDA' }}
                  >
                    <span className='text-xs font-medium' style={{ color: '#C02A26' }}>
                      {overdue}
                    </span>
                  </span>
                  <span className='flex-1 text-[#637381]'>Quá hạn</span>
                </div>
              </div>
            </div>

            {/* Donut chart style */}
            <div className='flex-1 flex items-center justify-center'>
              <div className='relative w-[223px] h-[223px]'>
                {hasNoData ? (
                  <div className='w-full h-full rounded-full bg-[#F3F4F6] flex items-center justify-center'>
                    <span className='text-sm text-[#667085]'>Không có dữ liệu</span>
                  </div>
                ) : (
                  <ResponsiveContainer width='100%' height='100%'>
                    <PieChart>
                      <Pie
                        data={filteredChartData}
                        dataKey='value'
                        startAngle={90}
                        endAngle={-270}
                        innerRadius={'60%'}
                        outerRadius={'95%'}
                        stroke='none'
                        isAnimationActive={false}
                        animationDuration={100}
                        animationEasing='cubic-bezier(0.4, 0, 0.2, 1)'
                        cornerRadius={8}
                        paddingAngle={2}
                        labelLine={false}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
                          if (!value) return null;
                          const RAD = Math.PI / 180;
                          const r = (innerRadius + outerRadius) / 2;
                          const x = cx + r * Math.cos(-midAngle * RAD);
                          const y = cy + r * Math.sin(-midAngle * RAD);
                          return (
                            <text
                              x={x}
                              y={y}
                              fill='#101828'
                              textAnchor='middle'
                              dominantBaseline='central'
                              style={{ pointerEvents: 'none' }}
                              className='text-[13px]'
                            >
                              {`${value}%`}
                            </text>
                          );
                        }}
                        onMouseEnter={(_, index) => setActiveIndex(index)}
                        onMouseLeave={() => setActiveIndex(null)}
                      >
                        {filteredChartData.map((d, idx) => (
                          <Cell
                            key={d.key}
                            fill={d.color}
                            opacity={activeIndex === null || activeIndex === idx ? 1 : 0.35}
                            style={{ transition: 'opacity 200ms ease-in-out', cursor: 'pointer' }}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<OutsourcingStatusDonutTooltip />} wrapperStyle={{ zIndex: 50 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}

                {/* Vòng tròn nét đứt bên trong (bán kính nhỏ hơn) */}
                <div className='absolute inset-[54px] rounded-full border border-dashed border-[#E5E7EB] pointer-events-none' />

                <div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none'>
                  <div className="size-[95px] aspect-square bg-white rounded-full flex items-center justify-center shadow-[0px_0px_10px_0px_rgba(0,0,0,0.1)]">
                    <span className='text-[28px] font-semibold text-[#0375F3]'>{total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
};

const OutsourcingMain = props => {
  const [dateFilter, setDateFilter] = useState({
    startDate: null,
    endDate: null,
  });
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState([]);
  const [sidebarStatusFilter, setSidebarStatusFilter] = useState([]);
  const [sidebarLimit, setSidebarLimit] = useState(5);
  const [activeOrderId, setActiveOrderId] = useState('PGC-26022604-1');
  const [activeMainTab, setActiveMainTab] = useState({ id: 'info', name: 'Thông tin', type: 'info' });
  const [tableLimit, setTableLimit] = useState(4);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const stateFilterDropdown = useSelector(state => state.stateFilterDropdown);

  // Mock data cho nhà gia công
  const mockVendors = [
    { value: 'vendor-1', label: 'NHÀ GIA CÔNG A' },
    { value: 'vendor-2', label: 'NHÀ GIA CÔNG B' },
    { value: 'vendor-3', label: 'NHÀ GIA CÔNG C' },
  ];

  // Mock data cho trạng thái
  const statusList = [
    { id: 'draft', value: 'Nháp' },
    { id: 'created', value: 'Mới khởi tạo' },
    { id: 'exported', value: 'Xuất kho gia công' },
    { id: 'partial_import', value: 'Nhập 1 phần' },
    { id: 'imported', value: 'Đã nhập' },
    { id: 'not_imported', value: 'Chưa nhập' },
  ];

  // Trạng thái dùng cho filter trong sidebar (đúng shape với StatusCheckboxGroup)
  const sidebarStatusList = [
    {
      label: 'Nhập gia công',
      value: 'received',
      color: 'bg-[#35BD4B]/20 text-[#1A7526]',
    },
    {
      label: 'Mới khởi tạo',
      value: 'created',
      color: 'bg-[#5B65F5]/20 text-[#4752E6]',
    },
    {
      label: 'Xuất kho gia công',
      value: 'exported',
      color: 'bg-[#D8F3FD] text-[#076A94]',
    },
  ];

  // Mock danh sách đơn gia công cho sidebar
  const mockOutsourcingOrders = [
    {
      id: 'PGC-26022604-1',
      code: 'PGC-26022604',
      vendorName: 'NHÀ GIA CÔNG A',
      createdAt: '26/02/2026, 10:20',
      statusKey: 'received',
      statusLabel: 'Nhập gia công',
      brandName: 'Foso',
      followRefs: ['LSX-161225109', 'LSX-161225109'],
    },
    {
      id: 'PGC-26022604-2',
      code: 'PGC-26022604',
      vendorName: 'NHÀ GIA CÔNG A',
      createdAt: '26/02/2026, 10:20',
      statusKey: 'created',
      statusLabel: 'Mới khởi tạo',
      brandName: 'Foso',
      followRefs: ['LSX-161225109', 'LSX-161225109'],
    },
    {
      id: 'PGC-26022604-3',
      code: 'PGC-26022604',
      vendorName: 'NHÀ GIA CÔNG A',
      createdAt: '26/02/2026, 10:20',
      statusKey: 'exported',
      statusLabel: 'Xuất kho gia công',
      brandName: 'Foso',
      followRefs: ['LSX-161225109', 'LSX-161225109'],
    },
    {
      id: 'PGC-26022604-4',
      code: 'PGC-26022604',
      vendorName: 'NHÀ GIA CÔNG A',
      createdAt: '26/02/2026, 10:20',
      statusKey: 'received',
      statusLabel: 'Nhập gia công',
      brandName: 'Foso',
      followRefs: ['LSX-161225109', 'LSX-161225109'],
    },
  ];

  // Mock dữ liệu bảng thành phẩm gia công
  const mockOutsourcingItems = [
    {
      id: 1,
      name: 'Áo sơ mi basic 01',
      variation: 'Màu trắng / Size M',
      code: 'TP-000001',
      unit: 'Chiếc',
      qtyOutsourcing: 4,
      qtyCompleted: 4,
      qtyError: 0,
      unitPrice: 400000,
      status: 'done',
    },
    {
      id: 2,
      name: 'Áo sơ mi basic 01',
      variation: 'Màu trắng / Size L',
      code: 'TP-000002',
      unit: 'Chiếc',
      qtyOutsourcing: 4,
      qtyCompleted: 3,
      qtyError: 1,
      unitPrice: 400000,
      status: 'partial',
    },
    {
      id: 3,
      name: 'Áo sơ mi basic 01',
      variation: 'Màu trắng / Size XL',
      code: 'TP-000003',
      unit: 'Chiếc',
      qtyOutsourcing: 4,
      qtyCompleted: 4,
      qtyError: 0,
      unitPrice: 400000,
      status: 'imported',
    },
    {
      id: 4,
      name: 'Áo sơ mi basic 01',
      variation: 'Màu trắng / Size S',
      code: 'TP-000004',
      unit: 'Chiếc',
      qtyOutsourcing: 4,
      qtyCompleted: 0,
      qtyError: 4,
      unitPrice: 400000,
      status: 'not_imported',
    },
    {
      id: 5,
      name: 'Áo sơ mi basic 01',
      variation: 'Màu trắng / Size S',
      code: 'TP-000004',
      unit: 'Chiếc',
      qtyOutsourcing: 4,
      qtyCompleted: 0,
      qtyError: 4,
      unitPrice: 400000,
      status: 'not_imported',
    },

    {
      id: 6,
      name: 'Áo sơ mi basic 01',
      variation: 'Màu trắng / Size S',
      code: 'TP-000004',
      unit: 'Chiếc',
      qtyOutsourcing: 4,
      qtyCompleted: 0,
      qtyError: 4,
      unitPrice: 400000,
      status: 'not_imported',
    },
  ];

  const activeOrder = useMemo(
    () => mockOutsourcingOrders.find(order => order.id === activeOrderId) || mockOutsourcingOrders[0] || null,
    [activeOrderId, mockOutsourcingOrders]
  );

  const statusStats = useMemo(
    () => ({
      total: 42,
      completed: 12,
      processing: 12,
      pending: 12,
      overdue: 6,
    }),
    []
  );

  const mainTabs = [
    { id: 'info', name: 'Thông tin', type: 'info' },
    { id: 'history', name: 'Lịch sử xuất giao kho', type: 'history' },
  ];

  const breadcrumbItems = [
    {
      label: 'Khác',
      href: '/',
    },
    {
      label: 'Gia công ngoài',
    },
    {
      label: 'Đơn gia công',
    },
  ];

  const handleToggleStatus = value => {
    const currentSelected = selectedStatusFilter || [];
    const updatedSelected = currentSelected.includes(value)
      ? currentSelected.filter(v => v !== value)
      : [...currentSelected, value];

    setSelectedStatusFilter(updatedSelected);
  };

  const handleToggleSidebarStatus = value => {
    const currentSelected = sidebarStatusFilter || [];
    const updatedSelected = currentSelected.includes(value)
      ? currentSelected.filter(v => v !== value)
      : [...currentSelected, value];

    setSidebarStatusFilter(updatedSelected);
  };

  const formatNumber = value =>
    value?.toLocaleString('vi-VN', {
      maximumFractionDigits: 0,
    });

  const renderStatusBadge = status => {
    const map = {
      done: {
        label: 'Hoàn thành',
        className: 'bg-[#E3F8E8] text-[#1A7526]',
      },
      partial: {
        label: 'Nhập 1 phần',
        className: 'bg-[#FEE4E2] text-[#B42318]',
      },
      imported: {
        label: 'Đã nhập',
        className: 'bg-[#D8F3FD] text-[#076A94]',
      },
      not_imported: {
        label: 'Chưa nhập',
        className: 'bg-[#FFF4E5] text-[#C25705]',
      },
    };

    const current = map[status] || map.not_imported;

    return (
      <span className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${current.className}`}>
        {current.label}
      </span>
    );
  };

  // Trigger cho filter Nhà gia công
  const triggerFilterVendor = (
    <button
      className={`${selectedVendor
        ? 'text-[#0F4F9E] border-[#3276FA] bg-[#EBF5FF]'
        : 'bg-white text-[#9295A4] border-[#D0D5DD] hover:text-[#0F4F9E] hover:bg-[#EBF5FF] hover:border-[#3276FA]'
        } flex items-center justify-between space-x-2 border rounded-lg h-9 px-3 group custom-transition w-full`}
    >
      <span className='flex items-center space-x-2 flex-1 min-w-0'>
        <FunnelIcon className='size-4' />
        <span className='text-sm text-[#3A3E4C] group-hover:text-[#0F4F9E] truncate'>
          {selectedVendor ? mockVendors.find(v => v.value === selectedVendor)?.label : 'Nhà gia công'}
        </span>
      </span>
      <CaretDownIcon className='size-3.5' />
    </button>
  );

  // Trigger cho filter Trạng thái
  const triggerFilterStatus = (
    <button
      className={`${stateFilterDropdown?.open || selectedStatusFilter?.length > 0
        ? 'text-[#0F4F9E] border-[#3276FA] bg-[#EBF5FF]'
        : 'bg-white text-[#9295A4] border-[#D0D5DD] hover:text-[#0F4F9E] hover:bg-[#EBF5FF] hover:border-[#3276FA]'
        } relative flex items-center justify-between space-x-2 border rounded-lg h-9 px-3 group custom-transition w-full`}
    >
      <span className='flex items-center space-x-2'>
        <FunnelIcon className='size-4' />
        <span className='text-sm text-[#3A3E4C] group-hover:text-[#0F4F9E]'>
          Trạng thái
        </span>
      </span>
      <CaretDownIcon
        className={`${stateFilterDropdown?.open || selectedStatusFilter?.length > 0 ? 'rotate-180' : 'rotate-0'
          } size-3.5 custom-transition`}
      />
    </button>
  );

  return (

    <div className='flex-1 min-h-0 h-full flex flex-col gap-2 pb-4'>
      {/* Breadcrumb */}
      <div>
        <BreadcrumbCustom
          items={breadcrumbItems}
          className='3xl:text-sm 2xl:text-xs xl:text-[10px] lg:text-[10px]'
        />
      </div>

      {/* Title + Filters */}
      <div className='flex items-center justify-between w-full'>
        <h2 className='text-title-section text-[#52575E] capitalize font-medium'>
          Đơn gia công
        </h2>

        <div className='flex items-center gap-2 xl:max-w-[70%]'>
          {/* Chọn ngày */}
          <DateToDateComponent
            placeholder='Chọn ngày'
            value={{
              startDate: dateFilter.startDate || null,
              endDate: dateFilter.endDate || null,
            }}
            onChange={value => {
              setDateFilter({
                startDate: value?.startDate || null,
                endDate: value?.endDate || null,
              });
            }}
            className='text-base-default w-[260px] z-[51]'
          />

          {/* Nhà gia công */}
          <FilterDropdown
            trigger={triggerFilterVendor}
            style={{
              boxShadow: '0px 20px 24px -4px #10182814, 0px 4px 4px 0px #00000040',
            }}
            className='z-[999] flex flex-col gap-4 !p-0 border-[#D8DAE5] rounded-lg min-w-[270px]'
            dropdownId='dropdownFilterVendor'
            placement='bottom-left'
          >
            <StatusCheckboxGroup
              list={mockVendors.map(v => ({
                label: v.label,
                value: v.value,
              }))}
              selected={selectedVendor ? [selectedVendor] : []}
              onChange={value => {
                setSelectedVendor(prev => (prev === value ? null : value));
              }}
            />
          </FilterDropdown>

          {/* Trạng thái */}
          <FilterDropdown
            trigger={triggerFilterStatus}
            style={{
              boxShadow: '0px 20px 24px -4px #10182814, 0px 4px 4px 0px #00000040',
            }}
            className='flex flex-col gap-4 !p-0 border-[#D8DAE5] rounded-lg w-[260px]'
            dropdownId='dropdownFilterStatus'
            placement='bottom-left'
          >
            <StatusCheckboxGroup
              list={statusList.map(item => ({
                label: item.value, // text hiển thị
                value: item.id, // giá trị filter (draft / created / ...)
              }))}
              selected={selectedStatusFilter}
              onChange={handleToggleStatus}
            />
          </FilterDropdown>

          {/* Tạo mới */}
          <ButtonAnimationNew
            icon={
              <div className='size-5 flex items-center justify-center'>
                <PlusIcon className=' text-white' />
              </div>
            }
            title='Tạo mới'
            className='3xl:h-10 h-9 xl:px-4 px-2 flex items-center justify-center gap-2 bg-[#0375F3] text-white rounded-lg text-sm hover:bg-[#0265D9]'
          />
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <div className='flex-1 min-h-0 h-full flex items-start w-full gap-4 3xl:gap-6 mt-4'>
        {/* ===== SIDEBAR ===== */}
        <div className='max-w-[15%] h-full flex-1 min-h-0 flex flex-col space-y-4 border-none border-[#D0D5DD] border rounded-lg bg-white'>
          {/* filter */}
          <div className='pb-2'>
            <FilterDropdown
              trigger={
                <button
                  className={`${sidebarStatusFilter?.length > 0
                    ? 'text-[#0F4F9E] border-[#3276FA] bg-[#EBF5FF]'
                    : 'bg-white text-[#9295A4] border-[#D0D5DD] hover:text-[#0F4F9E] hover:bg-[#EBF5FF] hover:border-[#3276FA]'
                    } relative flex items-center justify-between space-x-2 border rounded-lg h-9 px-3 group custom-transition w-full`}
                >
                  <span className='flex items-center space-x-2'>
                    <FunnelIcon className='size-4' />
                    <span className='text-xs text-[#3A3E4C] group-hover:text-[#0F4F9E]'>
                      Trạng thái
                    </span>
                  </span>
                  <CaretDownIcon
                    className={`${sidebarStatusFilter?.length > 0 ? 'rotate-180' : 'rotate-0'
                      } size-3.5 custom-transition`}
                  />
                </button>
              }
              style={{
                boxShadow: '0px 20px 24px -4px #10182814, 0px 4px 4px 0px #00000040',
              }}
              className='flex flex-col gap-4 !p-0 border-[#D8DAE5] rounded-lg w-full'
              dropdownId='dropdownOutsourcingSidebarStatus'
              placement='bottom-left'
            >
              <StatusCheckboxGroup
                list={sidebarStatusList}
                selected={sidebarStatusFilter}
                onChange={handleToggleSidebarStatus}
              />
            </FilterDropdown>
          </div>

          <Customscrollbar className='flex-1 min-h-0'>
            {mockOutsourcingOrders?.length > 0 ? (
              mockOutsourcingOrders
                .filter(order => {
                  if (!sidebarStatusFilter?.length) return true;
                  return sidebarStatusFilter.includes(order.statusKey);
                })
                .slice(0, sidebarLimit)
                .map((item, index, arr) => {
                  const isActive = item.id === activeOrderId;

                  const statusColorMap = {
                    received: 'bg-[#35BD4B]/20 text-[#1A7526]',
                    created: 'bg-[#5B65F5]/20 text-[#4752E6]',
                    exported: 'bg-[#D8F3FD] text-[#076A94]',
                  };

                  const badgeClass =
                    statusColorMap[item.statusKey] || 'bg-[#F4F4F5] text-[#667085]';

                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveOrderId(item.id)}
                      className={`
                      pl-1 pr-3
                      ${isActive && 'bg-[#F0F7FF]'}
                      ${arr.length - 1 === index ? 'border-b-none' : 'border-b'}
                      py-2 hover:bg-[#F0F7FF] border-[#F7F8F9] cursor-pointer transition-all ease-linear relative`}
                      style={{
                        background: isActive
                          ? 'linear-gradient(90.1deg, rgba(199, 223, 251, 0.21) 0.07%, rgba(226, 240, 254, 0) 94.35%)'
                          : '',
                      }}
                    >
                      <div className='relative pl-5 space-y-1.5 xl:space-y-2'>
                        {isActive && (
                          <div className='absolute left-0 top-0 bottom-0 w-1 h-full bg-[#0375F3] rounded-l-lg' />
                        )}

                        <span
                          className={`${badgeClass} xl:text-xs text-[11px] px-2 py-1 rounded font-normal w-fit h-fit`}
                        >
                          {item.statusLabel}
                        </span>

                        <h1 className='3xl:text-2xl xl:text-xl text-lg font-semibold text-[#003DA0]'>
                          {item.code}
                        </h1>

                        <div className='flex flex-col gap-0.5'>
                          <h3 className='text-[#667085] font-normal 3xl:text-base xl:text-sm text-xs'>
                            <span>{item.vendorName}</span>
                          </h3>

                          <h3 className='text-[#667085] font-normal 3xl:text-base xl:text-sm text-xs'>
                            <span>{item.createdAt}</span>
                          </h3>
                        </div>
                      </div>
                    </div>
                  );
                })
            ) : (
              <NoData className='mt-0' />
            )}
          </Customscrollbar>

          <div className='flex items-center h-fit flex-shrink-0 px-2 pb-2'>
            <LimitListDropdown
              limit={sidebarLimit}
              sLimit={value => setSidebarLimit(value)}
              dataLang={{ display: 'Hiển thị', on: 'trên', lsx: 'đơn' }}
              total={mockOutsourcingOrders.length}
            />
          </div>
        </div>

        {/* ===== MAIN ===== */}
        <div className='flex-1 min-w-0 h-full flex flex-col space-y-3'>
          {/* Search + actions */}
          <div className='flex items-center justify-between gap-3'>
            <div className='flex items-center gap-2 flex-1 max-w-[50%]'>
              <div className='relative w-full'>
                <input
                  className='w-full h-9 pl-9 pr-3 border border-[#D0D5DD] rounded-lg text-sm text-[#141522] placeholder:text-[#9295A4] focus:outline-none focus:border-[#3276FA]'
                  placeholder='Tìm kiếm theo tên và mã sản phẩm'
                />
                <MagnifyingGlassIcon className='size-4 text-[#9295A4] absolute left-3 top-1/2 -translate-y-1/2' />
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <FilterDropdown
                trigger={
                  <div className='3xl:h-10 h-9 xl:px-4 px-2 flex items-center xl:gap-4 gap-2 font-medium text-white border-[#0375F3] bg-[#0375F3] hover:bg-[#0375F3] hover:opacity-80 cursor-pointer hover:shadow-hover-button rounded-lg custom-transition'>
                    <span className='flex items-center gap-1 xl:gap-2 min-w-0'>
                      <span className='responsive-text-base truncate'>Tác vụ</span>
                    </span>
                    <CaretDownIcon className='text-white size-4 shrink-0' />
                  </div>
                }
                style={{
                  boxShadow: '0px 5px 35px 0px #00000012',
                }}
                className='flex flex-col !p-0 border-[#D8DAE5] rounded-lg shrink-0 w-fit'
                classNameContainer='!w-fit'
                dropdownId='dropdownOutsourcingTask'
                placement='bottom-left'
              >
                {/* dropdown để trống theo yêu cầu */}
                <div className='p-0' />
              </FilterDropdown>

              <ButtonAnimationNew
                icon={
                  <div className='3xl:size-5 size-4'>
                    <PrinterIcon className='size-full text-[#11315B]' />
                  </div>
                }
                title='In phiếu gia công'
                className='3xl:h-10 h-9 xl:px-4 px-2 flex items-center gap-2 xl:text-sm text-xs font-normal text-[#11315B] bg-white border border-[#D0D5DD] hover:bg-[#F7F8F9] hover:shadow-hover-button rounded-lg'
              />

              <ButtonAnimationNew
                icon={
                  <div className='3xl:size-5 size-4'>
                    <TrashIcon className='size-full' />
                  </div>
                }
                onClick={() => setShowDeleteConfirm(true)}
                title='Xoá'
                className='3xl:h-10 h-9 xl:px-4 px-2 flex items-center gap-2 xl:text-sm text-xs font-normal text-[#EE1E1E] border border-[#EE1E1E] hover:bg-[#FFEEF0] hover:shadow-hover-button rounded-lg'
              />
            </div>
          </div>

          {/* Tabs */}
          <TabSwitcherWithUnderline
            tabs={mainTabs}
            activeTab={activeMainTab}
            onChange={tab => setActiveMainTab(tab)}
            renderLabel={tab => (
              <h3
                className={`${activeMainTab?.id === tab.id ? 'text-[#0375F3] scale-[1.02]' : 'text-[#9295A4] scale-[1]'
                  } font-medium group-hover:text-[#0375F3] transition-all duration-100 ease-linear origin-left flex items-center gap-1`}
              >
                <span>{tab.name}</span>
              </h3>
            )}
          />

          {/* Table + Footer luôn dưới cùng */}
          <div className='flex-1 min-h-0 flex flex-col'>
            {activeMainTab?.id === 'info' ? (
              <>
                <div className='w-full flex-1 min-h-0'>
                  <div className='w-full h-full overflow-x-auto'>
                    <div className='min-w-[1100px] h-full overflow-y-auto'>
                      <div className='grid grid-cols-17'>
                        {/* header */}
                        <div className='col-span-17 grid grid-cols-17 gap-2 py-3 border-b bg-white sticky top-0 z-10'>
                          <h4 className='text-xs-default text-center text-[#9295A4] font-semibold col-span-1 px-1'>
                            STT
                          </h4>
                          <h4 className='text-xs-default text-start text-[#9295A4] font-semibold col-span-3 px-1'>
                            Thành phẩm
                          </h4>
                          <h4 className='text-xs-default text-start text-[#9295A4] font-semibold col-span-1 px-1'>
                            ĐVT
                          </h4>
                          <h4 className='text-xs-default text-center text-[#9295A4] font-semibold block col-span-2 px-1'>
                            SL gia công
                          </h4>
                          <h4 className='text-xs-default text-center text-[#9295A4] font-semibold block col-span-2 px-1'>
                            SL hoàn thành
                          </h4>
                          <h4 className='text-xs-default text-center text-[#9295A4] font-semibold block col-span-2 px-1'>
                            SL lỗi
                          </h4>
                          <h4 className='text-xs-default text-center text-[#9295A4] font-semibold block col-span-2 px-1'>
                            Đơn giá
                          </h4>
                          <h4 className='text-xs-default text-center text-[#9295A4] font-semibold block col-span-2 px-1'>
                            Thành tiền
                          </h4>
                          <h4 className='text-xs-default text-center text-[#9295A4] font-semibold block col-span-2 px-1'>
                            Trạng thái
                          </h4>
                        </div>

                        <div className='col-span-17 grid grid-cols-17 min-h-[240px]'>
                          {mockOutsourcingItems && mockOutsourcingItems.length > 0 ? (
                            mockOutsourcingItems.slice(0, tableLimit).map((item, index) => {
                              const totalMoney = item.unitPrice * item.qtyCompleted;

                              return (
                                <div
                                  key={item.id}
                                  className={`${mockOutsourcingItems.slice(0, tableLimit).length - 1 !== index
                                    ? 'border-[#F3F3F4]'
                                    : 'border-transparent'
                                    } border-b col-span-17 grid grid-cols-17 gap-2 items-start group hover:bg-gray-50 cursor-pointer transition-all duration-150 ease-in-out`}
                                >
                                  <h4 className='col-span-1 flex items-center justify-center size-full text-center text-[#141522] font-semibold text-sm-default uppercase 3xl:py-4 py-2 px-1'>
                                    {index + 1}
                                  </h4>

                                  <h4 className='col-span-3 text-[#344054] font-normal flex items-center 3xl:py-4 py-2 px-1'>
                                    <div className='flex items-start gap-2 w-full'>
                                      {/* Hình ảnh thành phẩm */}
                                      <div className='2xl:size-16 size-14 shrink-0 rounded-md bg-[#F3F4F6] overflow-hidden flex items-center justify-center'>
                                        <Image
                                          alt={item?.name ?? 'img'}
                                          width={200}
                                          height={200}
                                          src={item?.image || '/icon/default/default.png'}
                                          className='size-full object-cover'
                                        />
                                      </div>

                                      {/* Thông tin thành phẩm */}
                                      <div className='flex flex-col 3xl:gap-1 gap-0.5'>
                                        <p className='font-semibold text-sm-default text-[#141522] group-hover:text-[#0F4F9E]'>
                                          {item.name}
                                        </p>
                                        <div className='space-y-0.5'>
                                          {/* Biến thể */}
                                          <p className='text-[#667085] font-normal xl:text-[10px] text-[8px]'>
                                            {item.variation}
                                          </p>

                                          {/* Mã thành phẩm */}
                                          <p className='text-[#3276FA] font-normal 3xl:text-sm xl:text-xs text-[10px]'>
                                            {item.code}
                                          </p>

                                          {/* Mã lệnh gia công */}
                                          <p className='text-[#3276FA] font-normal 3xl:text-sm xl:text-xs text-[10px]'>
                                            {activeOrder?.code}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </h4>

                                  <h4 className='col-span-1 flex items-center justify-start size-full text-start text-[#141522] font-semibold text-sm-default 3xl:py-4 py-2 px-1'>
                                    {item.unit}
                                  </h4>

                                  <h4 className='col-span-2 flex items-center justify-center size-full text-center text-[#141522] font-semibold text-sm-default 3xl:py-4 py-2 px-1'>
                                    {item.qtyOutsourcing > 0 ? formatNumber(item.qtyOutsourcing) : '-'}
                                  </h4>

                                  <h4 className='col-span-2 flex items-center justify-center size-full text-[#141522] font-semibold text-sm-default 3xl:py-4 py-2 px-1'>
                                    {item.qtyCompleted > 0 ? formatNumber(item.qtyCompleted) : '-'}
                                  </h4>

                                  <h4 className='col-span-2 flex items-center justify-center size-full text-[#F04438] font-semibold text-sm-default 3xl:py-4 py-2 px-1'>
                                    {item.qtyError > 0 ? formatNumber(item.qtyError) : '-'}
                                  </h4>

                                  <h4 className='col-span-2 flex items-center justify-center size-full text-[#141522] font-semibold text-sm-default 3xl:py-4 py-2 px-1'>
                                    {item.unitPrice > 0 ? `${formatNumber(item.unitPrice)} đ` : '-'}
                                  </h4>

                                  <h4 className='col-span-2 flex items-center justify-center size-full text-[#141522] font-semibold text-sm-default 3xl:py-4 py-2 px-1'>
                                    {totalMoney > 0 ? `${formatNumber(totalMoney)} đ` : '-'}
                                  </h4>

                                  <div className='col-span-2 flex items-center justify-center size-full 3xl:py-4 py-2 px-1 truncate'>
                                    {renderStatusBadge(item.status)}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <NoData className='mt-0 col-span-17' type='table' />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* load more + limit (luôn ở cuối, ngoài vùng scroll dọc) */}
                {mockOutsourcingItems.length > 0 && (
                  <div className='flex item justify-between mt-2'>
                    <div />
                    {tableLimit < mockOutsourcingItems.length && (
                      <div className='flex justify-center py-2'>
                        <button
                          onClick={() => setTableLimit(mockOutsourcingItems.length)}
                          className='flex items-center gap-2 text-[#667085] 3xl:text-base xl:text-sm text-xs hover:underline'
                        >
                          <div className='space-x-2'>
                            <span>Xem thêm</span>
                            <span>({mockOutsourcingItems.length - tableLimit})</span>
                            <span>Thành phẩm</span>
                          </div>
                          <CaretDownIcon className='size-4' />
                        </button>
                      </div>
                    )}

                    <LimitListDropdown
                      limit={tableLimit}
                      sLimit={value => setTableLimit(value)}
                      dataLang={{ display: 'Hiển thị', on: 'trên', lsx: 'Thành phẩm' }}
                      total={mockOutsourcingItems.length}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className='flex-1 flex items-center justify-center text-sm text-[#667085]'>
                Lịch sử xuất giao kho
              </div>
            )}
          </div>
        </div>

        {/* ===== DETAIL ===== */}
        <div className='w-[30%] min-w-[320px] h-full'>
          <OutsourcingOrderDetail order={activeOrder} stats={statusStats} />
        </div>
      </div>

      {/* Modal xác nhận xoá đơn gia công - dùng PopupConfim để đồng bộ UI & quyền */}
      <PopupConfim
        dataLang={props.dataLang}
        type='warning'
        nameModel='outsourcing_orders'
        title='Xoá đơn gia công'
        subtitle='Bạn có chắc chắn muốn xoá đơn gia công hiện tại? Hành động này không thể hoàn tác.'
        isOpen={showDeleteConfirm}
        save={() => {
          // TODO: Thay bằng logic xoá đơn gia công thực tế (gọi API xoá, refetch list, v.v.)
          setShowDeleteConfirm(false);
        }}
        cancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

const Outsourcing = props => {
  // giữ pattern giống `containers/manufacture/productions-orders/index.jsx`
  const propsDefault = { dataLang: props?.dataLang, typeScreen: props?.type };

  return (
    <React.Fragment>
      <Head>
        <title>{propsDefault?.dataLang?.outsourcing_orders || 'Đơn gia công'}</title>
      </Head>

      <Container className={''}>
        <OutsourcingMain {...propsDefault} />
      </Container>
    </React.Fragment>
  );
};

export default Outsourcing;
