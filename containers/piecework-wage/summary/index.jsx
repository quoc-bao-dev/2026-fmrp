import FilterDropdown from '@/components/common/dropdown/FilterDropdown';
import SelectSearchableRadio from '@/components/common/select/SelectSearchableRadio';
import TabSwitcherWithUnderline from '@/components/common/tab/TabSwitcherWithUnderline';
import { CaretDownIcon, ExcelIcon2, FunnelIcon, UserGroupIcon, UsersIcon } from '@/components/icons';
import Breadcrumb from '@/components/UI/breadcrumb/BreadcrumbCustom';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { Container } from '@/components/UI/common/layout';
import ResponsibleAvatar from '@/components/UI/common/user/ResponsibleAvatar';
import DateToDateComponent from '@/components/UI/filterComponents/dateTodateComponent';
import SearchComponent from '@/components/UI/filterComponents/searchComponent';
import Loading from '@/components/UI/loading/loading';
import NoData from '@/components/UI/noData/nodata';
import { IMAGES } from '@/constants/images';
import { useSearchStaffs } from '@/hooks/common/useStaffs';
import { useLookupGroupMembers } from '@/managers/api/piecework-wage/useImportOutput';
import { useSummary, useSummaryDetail } from '@/managers/api/piecework-wage/useSummary';
import formatNumber from '@/utils/helpers/formatnumber';
import { searchWithoutDiacritics } from '@/utils/helpers/stringHelper';
import moment from 'moment';
import Head from 'next/head';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';

const breadcrumbItems = [
  { label: 'Lương sản lượng', },
  { label: 'Tổng hợp lương sản lượng', },
];

const tabs = [
  { id: 'summary', name: 'Tổng hợp' },
  { id: 'detail', name: 'Chi tiết' },
];

const Summary = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [searchStaff, setSearchStaff] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState([]);
  const [searchGroup, setSearchGroup] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearchStaff] = useDebounce(searchStaff, 300);
  const [debouncedSearchGroup] = useDebounce(searchGroup, 300);
  const [debouncedSearch] = useDebounce(search, 300);

  const [dateFilter, setDateFilter] = useState({
    startDate: null,
    endDate: null,
  });

  const { data: listStaffs } = useSearchStaffs();
  const { data: listGroupMembers } = useLookupGroupMembers({ limit: 100 });

  // Tạo options cho công nhân với filter theo search
  const employeeOptions = useMemo(() => {
    const staffs = listStaffs?.data?.staffs || [];
    const filteredStaffs = debouncedSearchStaff
      ? staffs.filter(staff => {
        return searchWithoutDiacritics(staff?.full_name || '', debouncedSearchStaff);
      })
      : staffs;

    return filteredStaffs.map(item => ({
      value: String(item.staffid),
      label: item.full_name,
      avatar: item.profile_image || IMAGES.noImage,
    }));
  }, [listStaffs?.data?.staffs, debouncedSearchStaff]);

  // Tạo options cho tổ/nhóm với filter theo search
  const groupOptions = useMemo(() => {
    const groups = listGroupMembers?.group_members || [];
    const filteredGroups = debouncedSearchGroup
      ? groups.filter(group => {
        return searchWithoutDiacritics(group?.name || '', debouncedSearchGroup) ||
          searchWithoutDiacritics(group?.code || '', debouncedSearchGroup);
      })
      : groups;

    return filteredGroups.map(item => ({
      value: String(item.id),
      label: item.name,
      avatar: item.avatar || IMAGES.groupUser,
    }));
  }, [listGroupMembers?.group_members, debouncedSearchGroup]);

  // Tạo filter params từ selectedEmployee và selectedGroup
  const filterParams = useMemo(() => {
    const params = {};
    if (selectedEmployee.length > 0) {
      params.staff_ids = selectedEmployee;
    }
    if (selectedGroup.length > 0) {
      params.group_member_ids = selectedGroup;
    }
    return params;
  }, [selectedEmployee, selectedGroup]);

  const { data: summary, isLoading: isLoadingSummary, refetch: refetchSummary } = useSummary({
    start_date: dateFilter.startDate ? moment(dateFilter.startDate).format('DD/MM/YYYY') : null,
    end_date: dateFilter.endDate ? moment(dateFilter.endDate).format('DD/MM/YYYY') : null,
    cursor: 0,
    limit: 10,
    search: debouncedSearch || '',
    ...filterParams,
  }, {
    enabled: activeTab.id === 'summary',
  });

  const { data: summaryDetail, isLoading: isLoadingSummaryDetail, refetch: refetchSummaryDetail } = useSummaryDetail({
    start_date: dateFilter.startDate ? moment(dateFilter.startDate).format('DD/MM/YYYY') : null,
    end_date: dateFilter.endDate ? moment(dateFilter.endDate).format('DD/MM/YYYY') : null,
    cursor: 0,
    limit: 10,
    search: debouncedSearch || '',
    ...filterParams,
  }, {
    enabled: activeTab.id === 'detail',
  });

  // Xử lý khi chọn nhân viên (multiple mode)
  const handleEmployeeChange = (values) => {
    setSelectedEmployee(Array.isArray(values) ? values : []);
  };

  // Xử lý khi search
  const handleEmployeeSearch = searchText => {
    setSearchStaff(searchText);
  };

  // Xử lý khi clear
  const handleEmployeeClear = () => {
    setSelectedEmployee([]);
    setSearchStaff('');
  };

  // Xử lý khi chọn tổ/nhóm (multiple mode)
  const handleGroupChange = (values) => {
    setSelectedGroup(Array.isArray(values) ? values : []);
  };

  // Xử lý khi search tổ/nhóm
  const handleGroupSearch = searchText => {
    setSearchGroup(searchText);
  };

  // Xử lý khi clear tổ/nhóm
  const handleGroupClear = () => {
    setSelectedGroup([]);
    setSearchGroup('');
  };

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
              <button className='h-10 bg-white px-4 py-2 rounded-lg flex items-center gap-2 border border-[#D0D5DD]'
                onClick={() => { refetchSummaryDetail(); refetchSummary(); }}
              >
                Tải lại
              </button>
            )}
            <SearchComponent
              colSpan={1}
              placeholder="Tìm kiếm"
              onChange={(e) => {
                setSearch(e?.target?.value || '');
              }}
            />
            <DateToDateComponent
              placeholder='Chọn ngày'
              value={dateFilter}
              onChange={(value) => {
                setDateFilter({
                  startDate: value?.startDate || null,
                  endDate: value?.endDate || null,
                });
              }}
              className='text-base-default !w-fit h-10'
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
            options={employeeOptions}
            value={selectedEmployee}
            onChange={handleEmployeeChange}
            onSearch={handleEmployeeSearch}
            onClear={handleEmployeeClear}
            icon={<UsersIcon className='size-4 text-[#25387A]' />}
            className='w-[250px] [&_.ant-select-selector]:h-10 [&_.ant-select-selector]:border-[#D0D5DD]'
            mode='multiple'
          />
          <SelectSearchableRadio
            placeholder='Chọn tổ/nhóm'
            label='Chọn tổ/nhóm'
            searchPlaceholder='Tìm tổ/nhóm'
            options={groupOptions}
            value={selectedGroup}
            onChange={handleGroupChange}
            onSearch={handleGroupSearch}
            onClear={handleGroupClear}
            icon={<UserGroupIcon className='size-4 text-[#25387A]' />}
            className='w-[250px] [&_.ant-select-selector]:h-10 [&_.ant-select-selector]:border-[#D0D5DD]'
            mode='multiple'
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
              {isLoadingSummary ? (
                <Loading />
              ) : (summary?.aggregate ?? []).length === 0 ? (
                <NoData />
              ) : (summary?.aggregate ?? []).map((row, index) => (
                <div
                  key={row?.staff_id || index}
                  className='grid grid-cols-20 gap-4 px-4 py-4 responsive-text-sm bg-white hover:bg-gray-50 transition-colors border-b border-[#F3F3F4]'
                >
                  <div className='col-span-1 text-center flex items-center justify-center font-semibold text-[#141522]'>
                    {index + 1}
                  </div>
                  <div className='col-span-4 flex items-center gap-2 text-start'>
                    <ResponsibleAvatar
                      avatarUrl={row?.staff?.profile_image || '/icon/default/default.png'}
                      fullName={row?.staff?.full_name || '-'}
                      size={32}
                    />
                    <span className='text-[#344054]'>{row?.staff?.full_name || '-'}</span>
                  </div>
                  <div className='col-span-3 font-semibold text-[#141522] flex items-center'>
                    -
                  </div>
                  <div className='col-span-2 font-semibold text-[#141522] flex items-center'>
                    {Number(row?.total_produced) ? formatNumber(Number(row?.total_produced)) : '-'}
                  </div>
                  <div className='col-span-2 font-semibold text-[#141522] flex items-center'>
                    {row?.total_time != null && row.total_time > 0
                      ? (Math.floor(row.total_time / 3600) > 0
                        ? `${Math.floor(row.total_time / 3600)}h `
                        : '') + `${Math.floor((row.total_time % 3600) / 60)}m`
                      : '-'}
                  </div>
                  <div className='col-span-3 font-semibold text-[#0375F3] flex items-center'>
                    {Number(row?.total_amount) ? `${formatNumber(Number(row?.total_amount))} đ` : '-'}
                  </div>
                  <div className='col-span-5 flex items-center gap-2 flex-wrap'>
                    {(row?.stages ?? []).map((stage) => (
                      <span
                        key={stage?.id}
                        className='px-2 py-1 bg-[#EBF5FF] text-[#035FD6] font-medium rounded'
                      >
                        {stage?.name}
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
                {(() => {
                  const total = (summary?.aggregate ?? []).reduce(
                    (sum, row) => sum + (Number(row?.total_produced) || 0),
                    0,
                  );
                  return total ? `${formatNumber(total)} cái` : '-';
                })()}
              </div>
              <div className='col-span-2'>
                {(() => {
                  const totalSeconds = (summary?.aggregate ?? []).reduce(
                    (sum, row) => sum + (Number(row?.total_time) || 0),
                    0,
                  );
                  if (!totalSeconds) return "-";
                  const hours = Math.floor(totalSeconds / 3600);
                  const minutes = Math.floor((totalSeconds % 3600) / 60);
                  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
                })()}
              </div>
              <div className='col-span-3'>
                {(() => {
                  const total = (summary?.aggregate ?? []).reduce(
                    (sum, row) => sum + (Number(row?.total_amount) || 0),
                    0,
                  );
                  return total ? `${formatNumber(total)} đ` : '-';
                })()}
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
                    {row?.total_time != null && row.total_time > 0
                      ? (Math.floor(row.total_time / 3600) > 0
                        ? `${Math.floor(row.total_time / 3600)}h `
                        : '') + `${Math.floor((row.total_time % 3600) / 60)}m`
                      : '-'}
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
                    {Number(row?.price_salary) ? `${formatNumber(Number(row?.price_salary))} ₫` : '-'}
                  </div>
                  <div className='col-span-2 text-center flex items-center justify-center font-semibold text-[#141522]'>
                    {Number(row?.total_quantity) ? formatNumber(Number(row?.total_quantity)) : '-'}
                  </div>
                  <div className='col-span-3 text-center flex items-center justify-center font-medium text-[#0375F3]'>
                    {Number(row?.total_amount) ? `${formatNumber(Number(row?.total_amount))} ₫` : '-'}
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
                {(() => {
                  const total = (summaryDetail?.items ?? []).reduce((sum, row) => sum + (Number(row?.total_quantity) || 0), 0);
                  return total ? formatNumber(total) : '-';
                })()}
              </div>
              <div className='col-span-3 text-center'>
                {(() => {
                  const total = (summaryDetail?.items ?? []).reduce((sum, row) => sum + (Number(row?.total_amount) || 0), 0);
                  return total ? `${formatNumber(total)} đ` : '-';
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  )
}

export default Summary
