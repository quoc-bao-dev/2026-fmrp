import apiImportOutput from '@/Api/apiPieceworkWage/import-output/apiImportOutput';
import FilterDropdown from '@/components/common/dropdown/FilterDropdown';
import SelectSearchableRadio from '@/components/common/select/SelectSearchableRadio';
import { CaretDownIcon, CloseXIcon, EqualizerIcon, FunnelIcon, SearchIcon } from '@/components/icons';
import { DropdownAvatar } from '@/components/layout/header';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import InfoTooltip from '@/components/UI/common/InfoTooltip';
import DateToDateComponent from '@/components/UI/filterComponents/dateTodateComponent';
import Loading from '@/components/UI/loading/loading';
import { IMAGES } from '@/constants/images';
import { useSocketContext } from '@/context/socket/SocketContext';
import { useInternalPlansSearchCombobox } from '@/hooks/common/useInternalPlans';
import { useOrdersSearchCombobox } from '@/hooks/common/useOrder';
import { useSearchStaffs } from '@/hooks/common/useStaffs';
import { useListImportOutput, useLookupGroupMembers, useLookupStaffs, useLookupStages } from '@/managers/api/piecework-wage/useImportOutput';
import { searchWithoutDiacritics } from '@/utils/helpers/stringHelper';
import moment from 'moment';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'use-debounce';
import StageColumn from './components/StageColumn';
import { useBranchList } from '@/hooks/common/useBranch';
import { useSelector } from 'react-redux';

const ImportOutput = () => {
  const { socket } = useSocketContext();
  const authState = useSelector(state => state.auth);

  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState([]);
  const [searchStaff, setSearchStaff] = useState('');
  const [selectedProcess, setSelectedProcess] = useState([]);
  const [searchProcess, setSearchProcess] = useState('');
  const [debouncedSearchProcess] = useDebounce(searchProcess, 300);
  const [searchReferenceNo, setSearchReferenceNo] = useState('');
  const [debouncedSearchReferenceNo] = useDebounce(searchReferenceNo, 300);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [searchOrder, setSearchOrder] = useState('');
  const [debouncedSearchOrder] = useDebounce(searchOrder, 300);
  const [selectedPlans, setSelectedPlans] = useState([]);
  const [searchPlan, setSearchPlan] = useState('');
  const [debouncedSearchPlan] = useDebounce(searchPlan, 300);

  // Mặc định filter theo 90 ngày gần đây
  const [dateFilter, setDateFilter] = useState({
    dateStart: moment().subtract(90, 'days').startOf('day').toDate(),
    dateEnd: moment().endOf('day').toDate(),
  });

  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  const filterParams = {
    start_date: dateFilter.dateStart ? moment(dateFilter.dateStart).format('DD/MM/YYYY') : null,
    end_date: dateFilter.dateEnd ? moment(dateFilter.dateEnd).format('DD/MM/YYYY') : null,
    ...(selectedEmployee?.value ? (selectedEmployee.value.startsWith('group_') ? { group_member_ids: [selectedEmployee.value.replace('group_', '')] } : { staff_ids: [selectedEmployee.value] }) : {}),
    stage_ids: Array.isArray(selectedProcess) && selectedProcess.length > 0 ? selectedProcess : null,
    order_ids: Array.isArray(selectedOrders) && selectedOrders.length > 0 ? selectedOrders : null,
    internal_plan_ids: Array.isArray(selectedPlans) && selectedPlans.length > 0 ? selectedPlans : null,
    search: debouncedSearchReferenceNo || '',
    ...(selectedBranch?.value ? { branch_ids: selectedBranch.value } : {}),
  };

  const { isLoading: isLoadingListImportOutput, data: listImportOutput, refetch: refetchListImportOutput } = useListImportOutput(filterParams);
  const { data: listStaffs } = useLookupStaffs({ is_shift_scheduling: 1 });
  const { data: listGroupMembers } = useLookupGroupMembers({ limit: 100, is_shift_scheduling: 1 });
  const { data: listStages } = useLookupStages({ search: debouncedSearchProcess || '' });
  const { data: listOrders = [] } = useOrdersSearchCombobox(debouncedSearchOrder);
  const { data: listPlan = [] } = useInternalPlansSearchCombobox(debouncedSearchPlan);
  const { data: listBranch = [] } = useBranchList();

  useEffect(() => {
    if (authState.branch?.length > 0 && !selectedBranch) {
      const firstBranch = {
        value: authState.branch[0].id,
        label: authState.branch[0].name,
      };
      setSelectedBranch(firstBranch);
    }
  }, [authState.branch]);

  // Lấy dữ liệu nhân viên từ API
  const staffs = listStaffs?.staffs || [];

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

  // Xử lý khi chọn công đoạn (hỗ trợ multi-select)
  const handleProcessChange = value => {
    if (value === 'all' || (Array.isArray(value) && value.length === 0)) {
      setSelectedProcess([]);
    } else {
      // value có thể là array (multi-select) hoặc string (single select)
      if (Array.isArray(value)) {
        setSelectedProcess(value);
      } else {
        setSelectedProcess([value]);
      }
    }
  };

  // Xử lý khi chọn đơn hàng bán
  const handleOrderChange = value => {
    if (!value || (Array.isArray(value) && value.length === 0) || value === 'all') {
      setSelectedOrders([]);
      return;
    }
    setSelectedOrders(Array.isArray(value) ? value : [value]);
  };

  const handleOrderSearch = searchText => {
    setSearchOrder(searchText);
  };

  const handleOrderClear = () => {
    setSelectedOrders([]);
    setSearchOrder('');
  };

  // Xử lý khi chọn chi nhánh
  const handleBranchChange = branchId => {
    const selectedOption = (listBranch || []).find(opt => String(opt?.value) === String(branchId));
    setSelectedBranch(
      selectedOption
        ? { value: selectedOption.value, label: selectedOption.label }
        : branchId
          ? { value: branchId, label: String(branchId) }
          : null
    );
  };

  const handleBranchClear = () => {
    setSelectedBranch(null);
  };

  // Xử lý khi chọn kế hoạch nội bộ
  const handlePlanChange = value => {
    if (!value || (Array.isArray(value) && value.length === 0) || value === 'all') {
      setSelectedPlans([]);
      return;
    }
    setSelectedPlans(Array.isArray(value) ? value : [value]);
  };

  const handlePlanSearch = searchText => {
    setSearchPlan(searchText);
  };

  const handlePlanClear = () => {
    setSelectedPlans([]);
    setSearchPlan('');
  };

  // Xử lý khi search công đoạn
  const handleProcessSearch = searchText => {
    setSearchProcess(searchText);
  };

  // Xử lý khi clear công đoạn
  const handleProcessClear = () => {
    setSelectedProcess([]);
    setSearchProcess('');
  };

  // State cục bộ quản lý danh sách stages để có thể cập nhật theo socket
  const [stages, setStages] = useState(listImportOutput?.stages || []);
  const hasStages = stages.length > 0;

  // Đồng bộ state stages mỗi khi dữ liệu từ API chính thay đổi (do filter, tìm kiếm, ...)
  useEffect(() => {
    setStages(listImportOutput?.stages || []);
  }, [listImportOutput]);

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

  useEffect(() => {
    if (!socket) return;
    const topic = `production_input`;

    const handleProductionInput = data => {
      console.log('production_input socket data:', data);

      // `data.data` đôi khi là object, đôi khi là chuỗi JSON: "{\"stage_id\":\"14\"}"
      let socketData = data?.data;
      if (typeof socketData === 'string') {
        try {
          socketData = JSON.parse(socketData);
        } catch (e) {
          // Không parse được => bỏ qua
          return;
        }
      }

      const stageIdFromSocket = Number(socketData?.stage_id);
      // Nếu không có stage_id hợp lệ thì bỏ qua
      if (!Number.isFinite(stageIdFromSocket)) return;

      if (stageIdFromSocket == 0) {
        refetchListImportOutput();
        return;
      }
      // Gọi API để lấy lại dữ liệu chỉ cho stage_id này, sau đó merge vào state cục bộ
      (async () => {
        try {
          const response = await apiImportOutput.apiListImportOutput({
            ...filterParams,
            // Ép filter chỉ lấy đúng stage_id từ socket
            stage_ids: [stageIdFromSocket],
          });

          const stagesFromApi = response?.data?.stages || [];
          if (!Array.isArray(stagesFromApi)) return;

          // Nếu API trả về rỗng => xóa công đoạn đó khỏi danh sách
          if (stagesFromApi.length === 0) {
            setStages(prevStages => {
              if (!Array.isArray(prevStages)) return [];
              return prevStages.filter(s => String(s.stage_id) !== String(stageIdFromSocket));
            });
            return;
          }

          const updatedStage = stagesFromApi[0];

          setStages(prevStages => {
            if (!Array.isArray(prevStages)) {
              return [updatedStage];
            }

            const targetId = String(updatedStage.stage_id);
            const existingIndex = prevStages.findIndex(s => String(s.stage_id) === targetId);

            // Nếu đã tồn tại stage này thì cập nhật lại
            if (existingIndex !== -1) {
              const newStages = [...prevStages];
              newStages[existingIndex] = updatedStage;
              return newStages;
            }

            // Nếu chưa có thì thêm mới vào đầu danh sách
            return [updatedStage, ...prevStages];
          });
        } catch (error) {
          console.error('Error updating stage from socket production_input:', error);
        }
      })();
    };

    socket.on(topic, handleProductionInput);

    return () => {
      socket.off(topic, handleProductionInput);
    };
  }, [socket, filterParams]);

  // Tính số lượng filter đang active
  const activeFilterCount = useMemo(() => {
    let count = 0;
    // Đếm date filter (chỉ tính 1 nếu có startDate hoặc endDate)
    if (dateFilter.dateStart || dateFilter.dateEnd) count++;
    if (selectedOrders.length > 0) count++;
    if (selectedPlans.length > 0) count++;
    if (selectedBranch?.value) count++;
    return count;
  }, [dateFilter.dateStart, dateFilter.dateEnd, selectedOrders.length, selectedPlans.length, selectedBranch?.value]);

  // Trigger button cho FilterDropdown
  const triggerFilterAll = (
    <button
      className={`${isFilterDropdownOpen || activeFilterCount > 0
        ? 'text-[#0F4F9E] border-[#3276FA] bg-[#EBF5FF]'
        : 'bg-white text-[#9295A4] border-[#D0D5DD] hover:text-[#0F4F9E] hover:bg-[#EBF5FF] hover:border-[#3276FA]'
        } flex items-center space-x-2 border rounded-lg h-10 px-3 group custom-transition`}
    >
      <EqualizerIcon className='size-4' />
      <span className={`${isFilterDropdownOpen || activeFilterCount > 0 ? 'text-[#0F4F9E]' : 'text-[#3A3E4C] group-hover:text-[#0F4F9E]'} text-nowrap text-sm custom-transition`}>Lọc</span>
      {activeFilterCount > 0 && <span className='rounded-full bg-[#0F4F9E] text-white text-xs size-5 flex items-center justify-center'>{activeFilterCount}</span>}
      <CaretDownIcon className={`${isFilterDropdownOpen ? 'rotate-180' : 'rotate-0'} size-3.5 custom-transition`} />
    </button>
  );

  return (
    <div className='flex flex-col gap-4 h-screen max-h-screen'>
      <Head>
        <title>Nhập sản lượng</title>
      </Head>
      <header className='sticky top-0 z-10 pr-4 pl-8 py-2 bg-new-blue flex gap-10 items-center justify-between'>
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

        </Link>
        <div className='flex items-center gap-3'>
          {/* <button className='bg-white px-4 py-1.5 rounded-lg flex items-center gap-2 border border-[#D0D5DD]'>
            <ClockIcon className='size-5 text-black' />
            <span className='responsive-text-sm font-medium text[#25387A]'>Ca sáng</span>
          </button> */}
          <Link href='/' className='px-2 py-1 rounded-full bg-[#E2F0FE] hover:bg-blue-fmrp transition-colors hover:text-white hover:border-white border border-transparent responsive-text-base font-medium text-new-blue capitalize'>
            Trang quản lý
          </Link>
          <DropdownAvatar />
        </div>
      </header>
      <div className='flex flex-col gap-4 flex-1 min-h-0 max-h-full overflow-hidden'>
        <div className='flex flex-col xl:flex-row items-center justify-between px-6'>
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
            {process.env.NODE_ENV === 'development' && (
              <button className='h-10 bg-white px-4 py-2 rounded-lg flex items-center gap-2 border border-[#D0D5DD]' onClick={refetchListImportOutput}>
                Tải lại
              </button>
            )}
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
              className='w-auto min-w-[180px] max-w-[300px] [&_.ant-select-selector]:h-10 [&_.ant-select-selector]:border-[#D0D5DD] [&_.ant-select-selector]:overflow-hidden [&_.ant-select-selection-overflow]:overflow-hidden [&_.ant-select-selection-overflow-item]:flex-shrink-0'
              mode='multiple'
            />
            <FilterDropdown
              trigger={triggerFilterAll}
              classNameContainer='!w-auto'
              style={{
                boxShadow: '0px 20px 24px -4px #10182814, 0px 4px 4px 0px #00000040',
              }}
              className='z-[999] flex flex-col gap-4 border-[#D8DAE5] rounded-lg min-w-[450px]'
              dropdownId='dropdownFilterImportOutput'
              isOpen={isFilterDropdownOpen}
              onToggle={setIsFilterDropdownOpen}
            >
              <div className='text-lg text-[#344054] font-medium'>Bộ lọc</div>
              <div className='flex flex-col gap-3'>
                <div className='space-y-1'>
                  <h3 className='text-xs text-[#051B44] font-normal'>Chi nhánh</h3>
                  <SelectSearchableRadio
                    placeholder='Chọn chi nhánh'
                    searchPlaceholder='Tìm chi nhánh'
                    options={listBranch}
                    value={selectedBranch}
                    onChange={handleBranchChange}
                    onClear={handleBranchClear}
                    icon={<FunnelIcon className='size-4 text-[#003DA0]' />}
                    className='w-auto min-w-[180px] [&_.ant-select-selector]:h-9 [&_.ant-select-selector]:border-[#D0D5DD]'
                  />
                </div>
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
                    className='text-base-default w-full h-10'
                  />
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <div className='space-y-1'>
                    <h3 className='text-xs text-[#051B44] font-normal'>Đơn hàng bán</h3>
                    <SelectSearchableRadio
                      placeholder='Chọn đơn hàng bán'
                      searchPlaceholder='Tìm đơn hàng bán'
                      options={listOrders}
                      value={selectedOrders}
                      onChange={handleOrderChange}
                      onSearch={handleOrderSearch}
                      onClear={handleOrderClear}
                      icon={<FunnelIcon className='size-4 text-[#003DA0]' />}
                      className='w-auto min-w-[180px] [&_.ant-select-selector]:h-9 [&_.ant-select-selector]:border-[#D0D5DD]'
                      mode='multiple'
                    />
                  </div>
                  <div className='space-y-1'>
                    <h3 className='text-xs text-[#051B44] font-normal'>Kế hoạch nội bộ</h3>
                    <SelectSearchableRadio
                      placeholder='Chọn kế hoạch nội bộ'
                      searchPlaceholder='Tìm kế hoạch nội bộ'
                      options={listPlan}
                      value={selectedPlans}
                      onChange={handlePlanChange}
                      onSearch={handlePlanSearch}
                      onClear={handlePlanClear}
                      icon={<FunnelIcon className='size-4 text-[#003DA0]' />}
                      className='w-auto min-w-[180px] [&_.ant-select-selector]:h-9 [&_.ant-select-selector]:border-[#D0D5DD]'
                      mode='multiple'
                    />
                  </div>
                </div>
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
