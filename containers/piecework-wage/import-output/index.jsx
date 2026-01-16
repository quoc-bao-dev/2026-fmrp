import FilterDropdown from '@/components/common/dropdown/FilterDropdown';
import SelectSearchableRadio from '@/components/common/select/SelectSearchableRadio';
import { CaretDownIcon, ClockIcon, CloseXIcon, EqualizerIcon, FunnelIcon, SearchIcon } from '@/components/icons';
import { DropdownAvatar } from '@/components/layout/header';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import InfoTooltip from '@/components/UI/common/InfoTooltip';
import DateToDateComponent from '@/components/UI/filterComponents/dateTodateComponent';
import Loading from '@/components/UI/loading/loading';
import { IMAGES } from '@/constants/images';
import { useSearchStaffs } from '@/hooks/common/useStaffs';
import { useListImportOutput, useLookupGroupMembers, useLookupStages } from '@/managers/api/piecework-wage/useImportOutput';
import { searchWithoutDiacritics } from '@/utils/helpers/stringHelper';
import moment from 'moment';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useDebounce } from 'use-debounce';
import StageColumn from './components/StageColumn';

const ImportOutput = () => {
  const [selectedEmployee, setSelectedEmployee] = useState([]);
  const [searchStaff, setSearchStaff] = useState('');
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [searchProcess, setSearchProcess] = useState('');
  const [debouncedSearchProcess] = useDebounce(searchProcess, 300);
  const [searchReferenceNo, setSearchReferenceNo] = useState('');
  const [debouncedSearchReferenceNo] = useDebounce(searchReferenceNo, 300);
  // Mặc định filter theo 90 ngày gần đây
  const [dateFilter, setDateFilter] = useState({
    dateStart: moment().subtract(90, 'days').startOf('day').toDate(),
    dateEnd: moment().endOf('day').toDate(),
  });

  const stateFilterDropdown = useSelector(state => state.stateFilterDropdown);

  const filterParams = {
    start_date: dateFilter.dateStart ? moment(dateFilter.dateStart).format('DD/MM/YYYY') : null,
    end_date: dateFilter.dateEnd ? moment(dateFilter.dateEnd).format('DD/MM/YYYY') : null,
    ...(selectedEmployee?.value ? (selectedEmployee.value.startsWith('group_') ? { group_member_ids: [selectedEmployee.value.replace('group_', '')] } : { staff_ids: [selectedEmployee.value] }) : {}),
    stage_ids: selectedProcess?.value,
    search: debouncedSearchReferenceNo || '',
    // limit: 3,
    // page:1,
  };

  const { isLoading: isLoadingListImportOutput, data: listImportOutput, refetch: refetchListImportOutput } = useListImportOutput(filterParams);
  const { data: listStaffs } = useSearchStaffs();
  const { data: listGroupMembers } = useLookupGroupMembers({ limit: 100 });
  const { data: listStages } = useLookupStages({ search: debouncedSearchProcess || '' });
  // Lấy dữ liệu nhân viên từ API
  const staffs = listStaffs?.data?.staffs || [];

  // Lấy dữ liệu công đoạn từ API (đã được filter từ server)
  const stagesList = listStages?.stages || [];

  // Format options cho SelectSearchableRadio với filter theo search
  const employeeOptions = useMemo(() => {
    const options = [];

    // Filter nhân viên theo search
    const filteredStaffs = searchStaff
      ? staffs.filter(staff => {
          return searchWithoutDiacritics(staff?.full_name || '', searchStaff);
        })
      : staffs;

    // Thêm các nhân viên
    filteredStaffs.forEach(staff => {
      if (staff?.staffid && staff?.full_name) {
        options.push({
          value: String(staff.staffid),
          label: staff.full_name,
          avatar: staff.profile_image || IMAGES.noImage, // Fallback nếu không có avatar
        });
      }
    });

    // Filter nhóm theo search
    const filteredGroups = searchStaff
      ? listGroupMembers?.group_members?.filter(group => {
          return searchWithoutDiacritics(group.name, searchStaff) || searchWithoutDiacritics(group.code, searchStaff);
        })
      : listGroupMembers?.group_members;

    // Thêm các nhóm
    filteredGroups?.forEach(group => {
      options.push({
        value: `group_${group.id}`,
        label: group.name,
        avatar: IMAGES.groupUser,
      });
    });

    return options;
  }, [searchStaff, staffs, listGroupMembers]);

  // Xử lý khi chọn nhân viên
  const handleEmployeeChange = value => {
    if (value === 'all') {
      setSelectedEmployee(null);
    } else {
      const selectedOption = employeeOptions.find(opt => opt.value === value);
      setSelectedEmployee(selectedOption ? { value, label: selectedOption.label } : null);
    }
  };

  // Xử lý khi search
  const handleEmployeeSearch = searchText => {
    setSearchStaff(searchText);
  };

  // Xử lý khi clear
  const handleEmployeeClear = () => {
    setSelectedEmployee(null);
    setSearchStaff('');
  };

  // Format options cho SelectSearchableRadio công đoạn (dữ liệu đã được filter từ API)
  const processOptions = useMemo(() => {
    return stagesList
      .filter(stage => stage?.id && stage?.name)
      .map(stage => ({
        value: String(stage.id),
        label: stage.name,
      }));
  }, [stagesList]);

  // Xử lý khi chọn công đoạn
  const handleProcessChange = value => {
    if (value === 'all') {
      setSelectedProcess(null);
    } else {
      const selectedOption = processOptions.find(opt => opt.value === value);
      setSelectedProcess(selectedOption ? { value, label: selectedOption.label } : null);
    }
  };

  // Xử lý khi search công đoạn
  const handleProcessSearch = searchText => {
    setSearchProcess(searchText);
  };

  // Xử lý khi clear công đoạn
  const handleProcessClear = () => {
    setSelectedProcess(null);
    setSearchProcess('');
  };

  const stages = listImportOutput?.stages || [];
  const hasStages = stages.length > 0;

  // Dùng để reset chế độ chọn lệnh trên tất cả StageColumn khi mở PersonSelector ở cột khác
  const [selectModeResetKey, setSelectModeResetKey] = useState(0);
  const [activePersonSelectorStageId, setActivePersonSelectorStageId] = useState(null);

  const handlePersonSelectorClick = stageId => {
    // Mỗi lần bấm nút chọn người phụ trách:
    // - tăng key để các StageColumn khác thoát chế độ chọn lệnh
    // - lưu stageId hiện tại để KHÔNG đóng PersonSelector của chính cột đó
    setSelectModeResetKey(prev => prev + 1);
    setActivePersonSelectorStageId(stageId);
  };

  // Tính số lượng filter đang active
  const activeFilterCount = useMemo(() => {
    let count = 0;

    // Đếm date filter (chỉ tính 1 nếu có startDate hoặc endDate)
    if (dateFilter.dateStart || dateFilter.dateEnd) count++;

    return count;
  }, [dateFilter.dateStart, dateFilter.dateEnd]);

  // Trigger button cho FilterDropdown
  const triggerFilterAll = (
    <button
      className={`${
        stateFilterDropdown?.open || activeFilterCount > 0
          ? 'text-[#0F4F9E] border-[#3276FA] bg-[#EBF5FF]'
          : 'bg-white text-[#9295A4] border-[#D0D5DD] hover:text-[#0F4F9E] hover:bg-[#EBF5FF] hover:border-[#3276FA]'
      } flex items-center space-x-2 border rounded-lg h-10 px-3 group custom-transition`}
    >
      <span className='size-4 shrink-0'>
        <EqualizerIcon className='w-full h-full' />
      </span>
      <span className={`${stateFilterDropdown?.open || activeFilterCount > 0 ? 'text-[#0F4F9E]' : 'text-[#3A3E4C] group-hover:text-[#0F4F9E]'} text-nowrap text-sm custom-transition`}>Lọc</span>
      {activeFilterCount > 0 && <span className='rounded-full bg-[#0F4F9E] text-white text-xs size-5 flex items-center justify-center'>{activeFilterCount}</span>}
      <span className='size-3.5 shrink-0'>
        <CaretDownIcon className={`${stateFilterDropdown?.open || activeFilterCount > 0 ? 'rotate-180' : 'rotate-0'} w-full h-full custom-transition`} />
      </span>
    </button>
  );

  return (
    <div className='flex flex-col gap-5 h-screen max-h-screen'>
      <Head>
        <title>Nhập sản lượng</title>
      </Head>
      <header className='sticky top-0 z-10 pr-4 pl-8 py-5 bg-new-blue flex gap-10 items-center justify-between'>
        <Link href='/' className='relative flex items-center gap-5'>
          <Image
            alt=''
            src='/LOGO_HEADER.png'
            width={100}
            height={45}
            quality={100}
            className='3xl:w-[110px] 2xl:w-[100px] xl:w-[90px] w-[90px] h-auto object-contain'
            loading='lazy'
            crossOrigin='anonymous'
            placeholder='blur'
            blurDataURL='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
          />
          <h2 className='p-2 rounded-full bg-[#E2F0FE] hover:bg-blue-fmrp transition-colors hover:text-white hover:border-white border border-transparent responsive-text-base font-medium text-new-blue capitalize'>
            Trang quản lý
          </h2>
        </Link>
        <div className='flex items-center gap-3'>
          <button className='h-10 bg-white px-4 py-2 rounded-lg flex items-center gap-2 border border-[#D0D5DD]'>
            <ClockIcon className='size-5 text-black' />
            <span className='responsive-text-sm font-medium text[#25387A]'>Ca sáng</span>
          </button>
          <DropdownAvatar />
        </div>
      </header>
      <div className='flex flex-col gap-4 flex-1 min-h-0 max-h-full overflow-hidden'>
        <div className='flex items-center justify-between px-6'>
          <div className='flex items-center gap-2'>
            <h2 className='responsive-text-4xl font-medium text-neutral-07 capitalize'>Nhập sản lượng</h2>
            <InfoTooltip
              content=''
              iconProps={{
                className: '2xl:size-[21px] xl:size-[18px] size-[16px]',
              }}
            />
          </div>
          <div className='flex items-center gap-2'>
            <button className='h-10 bg-white px-4 py-2 rounded-lg flex items-center gap-2 border border-[#D0D5DD]' onClick={refetchListImportOutput}>
              Làm mới
            </button>
            <div className='h-10 w-[340px] bg-white px-3 py-2 rounded-lg flex items-center justify-between gap-2 border border-[#D0D5DD]'>
              <input
                className='flex-1 border-none outline-none responsive-text-base text[#3A3E4C]'
                placeholder='Tìm kiếm mã lệnh sản xuất'
                value={searchReferenceNo}
                onChange={e => setSearchReferenceNo(e.target.value)}
                onClick={e => e.stopPropagation()}
              />
              {searchReferenceNo && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setSearchReferenceNo('');
                  }}
                  className='flex items-center justify-center p-0.5 rounded hover:bg-[#F3F4F6] transition-colors'
                >
                  <CloseXIcon className='size-4 text-[#667085]' />
                </button>
              )}
              <div className='p-1 rounded-lg bg-[#1760B9]'>
                <SearchIcon className='size-4 text-white' />
              </div>
            </div>
            <SelectSearchableRadio
              placeholder='Lọc nhân viên'
              label='Lọc nhân viên'
              searchPlaceholder='Tìm nhân viên'
              options={employeeOptions}
              value={selectedEmployee}
              onChange={handleEmployeeChange}
              onSearch={handleEmployeeSearch}
              onClear={handleEmployeeClear}
              icon={<FunnelIcon className='size-4 text-[#003DA0]' />}
              className='w-auto min-w-[180px] [&_.ant-select-selector]:h-10 [&_.ant-select-selector]:border-[#D0D5DD]'
            />
            <SelectSearchableRadio
              placeholder='Lọc công đoạn'
              label='Lọc công đoạn'
              searchPlaceholder='Tìm công đoạn'
              options={processOptions}
              value={selectedProcess}
              onChange={handleProcessChange}
              onSearch={handleProcessSearch}
              onClear={handleProcessClear}
              icon={<FunnelIcon className='size-4 text-[#003DA0]' />}
              className='w-auto min-w-[180px] [&_.ant-select-selector]:h-10 [&_.ant-select-selector]:border-[#D0D5DD]'
            />
            <FilterDropdown
              trigger={triggerFilterAll}
              classNameContainer='!w-auto'
              style={{
                boxShadow: '0px 20px 24px -4px #10182814, 0px 4px 4px 0px #00000040',
              }}
              className='z-[999] flex flex-col gap-4 border-[#D8DAE5] rounded-lg min-w-[400px]'
              dropdownId='dropdownFilterImportOutput'
            >
              <div className='text-lg text-[#344054] font-medium'>Bộ lọc</div>
              <div className='space-y-1'>
                <h3 className='text-xs text-[#051B44] font-normal'>Thời gian</h3>
                <DateToDateComponent
                  placeholder='dd/mm/yyyy → dd/mm/yyyy'
                  value={{
                    startDate: dateFilter.dateStart || null,
                    endDate: dateFilter.dateEnd || null,
                  }}
                  onChange={value => {
                    setDateFilter({
                      dateStart: value?.startDate || null,
                      dateEnd: value?.endDate || null,
                    });
                  }}
                  className='text-base-default w-full'
                />
              </div>
            </FilterDropdown>
          </div>
        </div>

        <div className='w-full h-full flex-1 min-h-0 overflow-y-hidden'>
          {isLoadingListImportOutput ? (
            <div className='flex items-center justify-center h-full'>
              <Loading />
            </div>
          ) : hasStages ? (
            <Customscrollbar horizontalOnly={true} showOnHover={true} className='flex-1 min-h-0 h-full overflow-y-hidden'>
              <div className='px-6 flex gap-2 w-full h-full min-w-max overflow-y-hidden'>
                {stages.map(stage => (
                  <StageColumn
                    key={stage.stage_id}
                    stage={stage}
                    selectModeResetKey={selectModeResetKey}
                    activePersonSelectorStageId={activePersonSelectorStageId}
                    onPersonSelectorClick={handlePersonSelectorClick}
                    filterParams={filterParams}
                    listGroupMembers={listGroupMembers}
                    listStaffs={listStaffs}
                  />
                ))}
              </div>
            </Customscrollbar>
          ) : (
            <div className='flex flex-col gap-4 h-full w-full items-center justify-center'>
              <Image src={IMAGES.nodataStage || IMAGES.nodata} alt='nodata' width={165} height={165} className='object-contain' />
              <p className='responsive-text-sm font-normal text-[#637381]'>Chưa có công đoạn, vui lòng thiết kế ngay.</p>
              <Link href='/settings/category?tab=stages&page=1' className='px-3 py-2 rounded-lg responsive-text-lg font-medium text-white bg-blue-fmrp'>
                Thiết kế công đoạn
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportOutput;
