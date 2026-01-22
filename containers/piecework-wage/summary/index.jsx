import FilterDropdown from '@/components/common/dropdown/FilterDropdown';
import SelectSearchableRadio from '@/components/common/select/SelectSearchableRadio';
import TabSwitcherWithUnderline from '@/components/common/tab/TabSwitcherWithUnderline';
import { CaretDownIcon, ExcelIcon2, FunnelIcon, UsersIcon } from '@/components/icons';
import Breadcrumb from '@/components/UI/breadcrumb/BreadcrumbCustom';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { Container } from '@/components/UI/common/layout';
import ResponsibleAvatar from '@/components/UI/common/user/ResponsibleAvatar';
import DateToDateComponent from '@/components/UI/filterComponents/dateTodateComponent';
import SearchComponent from '@/components/UI/filterComponents/searchComponent';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import { useSummaryDetail } from '@/managers/api/piecework-wage/useSummary';
import formatNumber from '@/utils/helpers/formatnumber';
import moment from 'moment';
import Head from 'next/head';
import Image from 'next/image';
import { useState } from 'react';

const breadcrumbItems = [
  { label: 'Lương sản lượng', },
  { label: 'Tổng hợp lương sản lượng', },
];

const tabs = [
  { id: 'summary', name: 'Tổng hợp' },
  { id: 'detail', name: 'Chi tiết' },
];

// Dữ liệu mẫu cho tab Tổng hợp
const mockData = [
  {
    id: 1,
    worker: { name: 'Thành', avatarUrl: '/icon/default/default.png' },
    quantity: 30,
    hours: '4h',
    salary: 1250000,
    stages: ['Cắt', 'May', 'Thêu', 'Đóng gói'],
  },
  {
    id: 2,
    worker: { name: 'My', avatarUrl: '/icon/default/default.png' },
    quantity: 30,
    hours: '6h',
    salary: 1250000,
    stages: ['Cắt', 'May', 'Đóng gói'],
  },
  {
    id: 3,
    worker: { name: 'Danh', avatarUrl: '/icon/default/default.png' },
    quantity: 30,
    hours: '8h',
    salary: 1250000,
    stages: ['Cắt', 'May'],
  },
  {
    id: 4,
    worker: { name: 'Tuấn', avatarUrl: '/icon/default/default.png' },
    quantity: 30,
    hours: '4h',
    salary: 1250000,
    stages: ['Cắt', 'Thêu', 'Đóng gói'],
  },
  {
    id: 5,
    worker: { name: 'Thành', avatarUrl: '/icon/default/default.png' },
    quantity: 30,
    hours: '12h',
    salary: 1250000,
    stages: ['May', 'Thêu', 'Đóng gói'],
  },
];

const Summary = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const { data: summaryDetail, isLoading: isLoadingSummaryDetail, refetch: refetchSummaryDetail } = useSummaryDetail({
    start_date: null,
    end_date: null,
    cursor: 0,
    limit: 10,
  }, {
    enabled: activeTab.id === 'detail',
  });

  const triggerFilterAll = (
    <button
      className={`
          bg-white text-[#9295A4] border border-[#D0D5DD] hover:text-[#0F4F9E] hover:bg-[#EBF5FF] hover:border-[#3276FA]
        } flex items-center space-x-2 rounded-lg h-10 px-3 group custom-transition`}
    >
      <FunnelIcon className='size-4' />
      {/* <span className={`${stateFilterDropdown?.open || activeFilterCount > 0 ? 'text-[#0F4F9E]' : 'text-[#3A3E4C] group-hover:text-[#0F4F9E]'} text-nowrap text-sm custom-transition`}>Lọc</span> */}
      {/* {activeFilterCount > 0 && <span className='rounded-full bg-[#0F4F9E] text-white text-xs size-5 flex items-center justify-center'>{activeFilterCount}</span>} */}
      <span className='responsive-text-base whitespace-nowrap text-[#3A3E4C]'>Bộ lọc</span>
      <span className='size-3.5 shrink-0'>
        <CaretDownIcon className={`rotate-0 w-full h-full custom-transition`} />
      </span>
    </button>
  );
  return (
    <Container className='flex flex-col gap-3 pb-4'>
      <Head>
        <title>Tổng hợp lương sản lượng</title>
      </Head>
      <div className='flex flex-col gap-1'>
        <Breadcrumb
          items={breadcrumbItems}
          className="3xl:text-sm 2xl:text-xs xl:text-[10px] lg:text-[10px]"
        />
        <div className='flex justify-between items-center gap-1'>
          <h2 className='text-title-section text-[#52575E] capitalize font-medium'>
            Tổng hợp lương sản lượng
          </h2>
          <div className='flex items-center gap-2'>
            {process.env.NODE_ENV === 'development' && (
              <button className='h-10 bg-white px-4 py-2 rounded-lg flex items-center gap-2 border border-[#D0D5DD]' onClick={refetchSummaryDetail}>
                Tải lại
              </button>
            )}
            <SearchComponent
              colSpan={1}
              placeholder="Tìm kiếm"
              onChange={() => { }}
            />
            <DateToDateComponent
              placeholder='Chọn ngày'
              value={{
                startDate: null,
                endDate: null,
              }}
              onChange={() => { }}
              className='text-base-default !min-w-[150px] !w-fit h-10'
            />
            <FilterDropdown
              trigger={triggerFilterAll}
              classNameContainer='!w-auto'
              style={{
                boxShadow: '0px 20px 24px -4px #10182814, 0px 4px 4px 0px #00000040',
              }}
              className='z-[999] flex flex-col gap-4 border-[#D8DAE5] rounded-lg min-w-[450px]'
              dropdownId='dropdownFilterImportOutput'
            >
              <div className='text-lg text-[#344054] font-medium'>Bộ lọc</div>
              <div className='flex flex-col gap-3'>

              </div>
            </FilterDropdown>
          </div>
        </div>
      </div>
      <TabSwitcherWithUnderline
        className='-mt-3'
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
      <div className='flex flex-col gap-3 flex-1 min-h-0'>
        <div className='flex items-center gap-3'>
          <SelectSearchableRadio
            placeholder='Chọn công nhân'
            label='Chọn công nhân'
            searchPlaceholder='Tìm công nhân'
            options={([
              { value: '1', label: 'Tháng 1' },
              { value: '2', label: 'Tháng 2' },
              { value: '3', label: 'Tháng 3' },
              { value: '4', label: 'Tháng 4' },
              { value: '5', label: 'Tháng 5' },
              { value: '6', label: 'Tháng 6' },
            ])}
            value={null}
            onChange={() => { }}
            onSearch={() => { }}
            onClear={() => { }}
            icon={<UsersIcon className='size-4 text-[#25387A]' />}
            className='w-[300px] [&_.ant-select-selector]:h-10 [&_.ant-select-selector]:border-[#D0D5DD]'
          />
          <button
            className='h-[42px] flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-white border border-[#D0D5DD] transition-all duration-200 ease-in-out hover:bg-[#F5F7FA] hover:border-[#0375F3] group'
          >
            <ExcelIcon2 />
            <span className='text-sm font-medium text-[#25387A] transition-colors duration-200 group-hover:text-[#0375F3]'>Xuất file excel</span>
          </button>
        </div>
        {activeTab.id === 'summary' ? (
          <div className='bg-white overflow-hidden flex flex-col flex-1 min-h-0'>
            {/* Header */}
            <div className='grid grid-cols-20 responsive-text-sm font-semibold text-[#9295A4] gap-4 px-4 py-3 border-b border-[#F3F3F4] bg-white'>
              <div className='col-span-1 text-center'>STT</div>
              <div className='col-span-4'>Công nhân</div>
              <div className='col-span-3'>Nhóm</div>
              <div className='col-span-2'>Số lượng (cái)</div>
              <div className='col-span-2'>Giờ làm</div>
              <div className='col-span-3'>Tổng lương (VNĐ)</div>
              <div className='col-span-5'>Công đoạn</div>
            </div>

            {/* Rows */}
            <Customscrollbar className='flex-1 min-h-0'>
              {mockData.map((item, index) => (
                <div
                  key={item.id}
                  className='grid grid-cols-20 gap-4 px-4 py-4 responsive-text-sm bg-white hover:bg-gray-50 transition-colors border-b border-[#F3F3F4]'
                >
                  <div className='col-span-1 text-center flex items-center justify-center font-semibold text-[#141522]'>
                    {index + 1}
                  </div>
                  <div className='col-span-4 flex items-center gap-2 text-start'>
                    <ResponsibleAvatar
                      avatarUrl={item.worker.avatarUrl}
                      fullName={item.worker.name}
                      size={32}
                    />
                    <span className='text-[#344054]'>{item.worker.name}</span>
                  </div>
                  <div className='col-span-3 font-semibold text-[#141522] flex items-center'>
                    {item.quantity}
                  </div>
                  <div className='col-span-2 font-semibold text-[#141522] flex items-center'>
                    {item.quantity}
                  </div>
                  <div className='col-span-2 font-semibold text-[#141522] flex items-center'>
                    {item.hours}
                  </div>
                  <div className='col-span-3 font-semibold text-[#0375F3] flex items-center'>
                    {formatNumber(item.salary)} đ
                  </div>
                  <div className='col-span-5 flex items-center gap-2 flex-wrap'>
                    {item.stages.map((stage, stageIndex) => (
                      <span
                        key={stageIndex}
                        className='px-2 py-1 bg-[#EBF5FF] text-[#035FD6] font-medium rounded'
                      >
                        {stage}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </Customscrollbar>

            {/* Summary Row */}
            <div className='mt-2 grid grid-cols-20 gap-4 px-4 py-4 responsive-text-base font-semibold text-[#141522] bg-[#F0F0F0] rounded-xl'>
              <div className='col-span-1'></div>
              <div className='col-span-4 text-xl'>Tổng</div>
              <div className='col-span-3'></div>
              <div className='col-span-2'>
                {mockData.reduce((sum, item) => sum + item.quantity, 0)} cái
              </div>
              <div className='col-span-2'>
                {mockData.reduce((sum, item) => {
                  const hours = parseFloat(item.hours.replace('h', ''));
                  return sum + hours;
                }, 0).toFixed(1)}h
              </div>
              <div className='col-span-3'>
                {formatNumber(mockData.reduce((sum, item) => sum + item.salary, 0))} đ
              </div>
              <div className='col-span-3'></div>
            </div>
          </div>
        ) : (
          <div className='bg-white overflow-hidden flex flex-col flex-1 min-h-0'>
            {/* Header */}
            <div className='grid grid-cols-24 responsive-text-sm font-semibold text-[#9295A4] gap-4 px-4 py-3 border-b border-[#F3F3F4] bg-white'>
              <div className='col-span-1 text-center'>STT</div>
              <div className='col-span-2 text-center'>Ngày</div>
              <div className='col-span-3'>Công nhân</div>
              <div className='col-span-2 text-center'>Công đoạn</div>
              <div className='col-span-2 text-center'>Giờ làm</div>
              <div className='col-span-6'>Sản phẩm</div>
              <div className='col-span-3 text-center'>Đơn giá</div>
              <div className='col-span-2 text-center'>Số lượng</div>
              <div className='col-span-3 text-center'>Thành tiền</div>
            </div>

            {/* Rows */}
            <Customscrollbar className='flex-1 min-h-0'>
              {isLoadingSummaryDetail ? (
                <Loading />
              ) : (summaryDetail?.items ?? []).length === 0 ? (
                <NoData />
              ) : (summaryDetail?.items ?? []).map((row, index) => (
                <div
                  key={row?.ppi_id || index}
                  className='grid grid-cols-24 gap-4 px-4 py-4 responsive-text-sm bg-white hover:bg-gray-50 transition-colors border-b border-[#F3F3F4]'
                >
                  <div className='col-span-1 text-center flex items-center justify-center font-semibold text-[#141522]'>
                    {index + 1}
                  </div>
                  <div className='col-span-2 text-center flex items-center justify-center font-semibold text-[#141522]'>
                    {row?.date ? moment(row.date).format('DD/MM/YYYY') : '-'}
                  </div>
                  <div className='col-span-3 flex items-center gap-2'>
                    {row?.staff ? (
                      <>
                        <ResponsibleAvatar
                          avatarUrl={row?.staff?.profile_image || '/icon/default/default.png'}
                          fullName={row?.staff?.full_name || '-'}
                          size={32}
                        />
                        <span className='text-[#344054]'>{row?.staff?.full_name || '-'}</span>
                      </>
                    ) : (
                      <span className='text-[#9295A4]'>-</span>
                    )}
                  </div>
                  <div className='col-span-2 text-center flex items-center justify-center text-[#141522] font-semibold'>
                    {row?.stage_name || '-'}
                  </div>
                  <div className='col-span-2 text-center flex items-center justify-center font-semibold text-[#141522]'>
                    {Number(row?.total_time) ? `${formatNumber(Number(row?.total_time))}h` : '-'}
                  </div>
                  <div className='col-span-6 flex items-center gap-2'>
                    <div className='size-12 shrink-0'>
                      <Image
                        unoptimized
                        alt={row?.item?.item_name || 'Sản phẩm'}
                        width={48}
                        height={48}
                        src={row?.item?.images || '/icon/default/default.png'}
                        className='size-full object-cover rounded-md'
                      />
                    </div>
                    <div className='flex flex-col gap-0.5'>
                      <p className='responsive-text-sm font-semibold text-[#141522]'>{row?.item?.item_name || '-'}</p>
                      <p className='responsive-text-xxs text-[#667085]'>{row?.item?.variation || '-'}</p>
                      <p className='responsive-text-xxs text-[#3276FA]'>{row?.item?.item_code || '-'}</p>
                      <p className='responsive-text-xxs text-[#3276FA]'>{row?.reference_no_detail || '-'}</p>
                    </div>
                  </div>
                  <div className='col-span-3 text-center flex items-center justify-center font-medium text-[#0375F3]'>
                    {formatNumber(Number(row?.price_salary) || 0)} ₫
                  </div>
                  <div className='col-span-2 text-center flex items-center justify-center font-semibold text-[#141522]'>
                    {formatNumber(Number(row?.total_quantity) || 0)}
                  </div>
                  <div className='col-span-3 text-center flex items-center justify-center font-medium text-[#0375F3]'>
                    {formatNumber(Number(row?.total_amount) || 0)} ₫
                  </div>
                </div>
              ))}
            </Customscrollbar>

            {/* Summary Row */}
            <div className='mt-2 grid grid-cols-24 gap-4 px-4 py-4 responsive-text-base font-semibold text-[#141522] bg-[#F0F0F0] rounded-xl'>
              <div className='col-span-1 text-xl'>Tổng</div>
              <div className='col-span-2'></div>
              <div className='col-span-3'></div>
              <div className='col-span-2'></div>
              <div className='col-span-2 text-center'>
                {(() => {
                  const total = (summaryDetail?.items ?? []).reduce((sum, row) => sum + (Number(row?.total_time) || 0), 0);
                  return total ? `${formatNumber(total)}h` : '-';
                })()}
              </div>
              <div className='col-span-6'></div>
              <div className='col-span-3'></div>
              <div className='col-span-2 text-center'>
                {formatNumber((summaryDetail?.items ?? []).reduce((sum, row) => sum + (Number(row?.total_quantity) || 0), 0))}
              </div>
              <div className='col-span-3 text-center'>
                {formatNumber((summaryDetail?.items ?? []).reduce((sum, row) => sum + (Number(row?.total_amount) || 0), 0))} đ
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  )
}

export default Summary
