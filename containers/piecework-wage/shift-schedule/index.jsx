import Skeleton from '@/components/common/skeleton/Skeleton';
import SmartTooltip from '@/components/common/tooltip/SmartTooltip';
import { BackIcon, CheckDoubleIcon, CloseXIcon, SearchIcon, UsersIcon } from '@/components/icons';
import Breadcrumb from '@/components/UI/breadcrumb/BreadcrumbCustom';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { EmptyExprired } from '@/components/UI/common/EmptyExprired';
import InfoTooltip from '@/components/UI/common/InfoTooltip';
import { Container } from '@/components/UI/common/layout';
import AvatarText from '@/components/UI/common/user/AvatarText';
import DateToDateComponent from '@/components/UI/filterComponents/dateTodateComponent';
import SelectComponent from '@/components/UI/filterComponents/selectComponent';
import NoData from '@/components/UI/noData/nodata';
import { useBranchList } from '@/hooks/common/useBranch';
import useStatusExprired from '@/hooks/useStatusExprired';
import useToast from '@/hooks/useToast';
import useActionRole from '@/hooks/useRole';
import { WARNING_ACTION_STATUS_ROLE } from '@/constants/warningStatus/warningStatus';
import { useGetScheduleTable } from '@/managers/api/shift-schedule/useGetScheduleTable';
import { useGetShiftsByBranch } from '@/managers/api/shift-schedule/useGetShiftsByBranch';
import Head from 'next/head';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import PopupShiftForm from './PopupShiftForm';
import ShiftCell from './ShiftCell';
import MultiValue from '@/components/UI/mutiValue/multiValue';

const breadcrumbItems = [{ label: `Lương sản lượng` }, { label: `Bảng xếp ca` }];

// Component wrapper để hiển thị tooltip chỉ khi text bị cắt
const TruncatedTooltip = ({ children, text, placement = 'right' }) => {
  const containerRef = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const checkTruncation = () => {
      if (containerRef.current) {
        const textElement = containerRef.current.querySelector('p');
        if (textElement) {
          const isTruncated = textElement.scrollWidth > textElement.clientWidth;
          setShowTooltip(isTruncated);
        }
      }
    };

    // Delay để đảm bảo DOM đã render
    const timeoutId = setTimeout(checkTruncation, 0);
    window.addEventListener('resize', checkTruncation);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkTruncation);
    };
  }, [text]);

  const content = (
    <div ref={containerRef} className='flex-1 min-w-0'>
      {children}
    </div>
  );

  if (showTooltip) {
    return (
      <SmartTooltip tooltip={text} placement={placement} classNameTrigger='flex-1 min-w-0'>
        {content}
      </SmartTooltip>
    );
  }

  return content;
};

const ShiftSchedule = () => {
  const statusExprired = useStatusExprired();
  const toast = useToast();
  const [isShiftPopupOpen, setIsShiftPopupOpen] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState(null);
  const [popupMode, setPopupMode] = useState('add'); // 'add' hoặc 'edit'
  const [currentShift, setCurrentShift] = useState(null); // Ca hiện tại khi sửa
  const [openDropdown, setOpenDropdown] = useState(null); // Key của dropdown đang mở: `${rowId}-day-${dayIndex}`
  const [showSelectMode, setShowSelectMode] = useState(false); // Hiển thị checkbox để chọn nhân viên
  const [selectedEmployees, setSelectedEmployees] = useState(new Set()); // Danh sách nhân viên đã chọn
  const [selectedBranch, setSelectedBranch] = useState(null); // Chi nhánh đã chọn
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null }); // Khoảng ngày được chọn
  const [searchTerm, setSearchTerm] = useState(''); // Từ khóa tìm kiếm
  const [imageErrors, setImageErrors] = useState(new Set()); // Track các ảnh bị lỗi
  const [slideDirection, setSlideDirection] = useState(null); // 'left' hoặc 'right' cho animation
  const [opacity, setOpacity] = useState(1); // Opacity cho fade in/out
  const [selectedShifts, setSelectedShifts] = useState([]); // Các ca được chọn để lọc
  const dropdownRefs = useRef({});
  const isHandlingMenuActionRef = useRef(false); // Flag để biết đang xử lý action từ menu

  // Lấy thông tin auth và branch từ Redux
  const authState = useSelector(state => state.auth);
  const { is_admin: role, permissions_current: auth } = useSelector(state => state.auth);
  const { data: listBranch = [] } = useBranchList();

  // Lấy các quyền từ useActionRole
  const { checkAdd, checkEdit, checkDelete } = useActionRole(auth, 'shift_schedule');

  // Kiểm tra quyền xem
  const canView = useMemo(() => {
    return !auth || !!Number(auth?.shift_schedule?.is_view);
  }, [auth]);

  // Lấy staff_id của tài khoản hiện tại (ưu tiên field staff_id, fallback sang id)
  const currentStaffId = useMemo(() => {
    if (!authState) return null;
    return authState.staff_id || authState.id || authState.staff_id_current || null;
  }, [authState]);

  // Khởi tạo branch mặc định từ branch hiện tại
  useEffect(() => {
    const branchId = authState?.branch[0]?.id;
    if (branchId && listBranch?.length > 0 && !selectedBranch) {
      const currentBranchOption = listBranch.find(branch => branch.value === branchId || branch.value === String(branchId));
      if (currentBranchOption) {
        setSelectedBranch(currentBranchOption);
      }
    }
  }, [authState, listBranch, selectedBranch]);

  // Tạo branch options
  const branchOptions = useMemo(() => listBranch || [], [listBranch]);

  // Tạo branch_id từ selected branch
  const branchId = useMemo(() => {
    return selectedBranch?.value || null;
  }, [selectedBranch]);

  // Lấy danh sách ca theo chi nhánh (phục vụ filter ca)
  const branchIdArray = useMemo(() => {
    return branchId ? [branchId] : null;
  }, [branchId]);

  const { data: shiftsFilterData, isLoading: isLoadingShiftFilter } = useGetShiftsByBranch({
    params: branchIdArray ? { branch_id: branchIdArray } : {},
    enabled: !!branchIdArray,
  });

  // Map dữ liệu ca sang options cho SelectComponent
  const shiftFilterOptions = useMemo(() => {
    if (!shiftsFilterData?.result || !Array.isArray(shiftsFilterData?.data)) {
      return [];
    }

    const formatTime = time => {
      if (!time) return '';
      return time.substring(0, 5); // HH:mm từ HH:mm:ss
    };

    return shiftsFilterData.data.map(shift => ({
      value: shift.id,
      label: `${shift.name || ''} (${formatTime(shift.time_start)} - ${formatTime(shift.time_end)})`,
    }));
  }, [shiftsFilterData]);

  // Tạo params cho API với branch_id, start_date và end_date
  const apiParams = useMemo(() => {
    const params = {};
    if (branchId) {
      params.branch_id = branchId;
    }
    // Thêm start_date và end_date nếu có
    if (dateRange.startDate) {
      params.start_date = dateRange.startDate;
    }
    if (dateRange.endDate) {
      params.end_date = dateRange.endDate;
    }
    return params;
  }, [branchId, dateRange]);

  const { data: scheduleTableData, isLoading: isLoadingScheduleTable } = useGetScheduleTable({
    // enabled: canView,
    params: apiParams,
  });

  // Lấy branch_ids từ API response (từ rows[0].branch_ids)
  // const branchIdsFromApi = useMemo(() => {
  //   if (!scheduleTableData?.success || !scheduleTableData?.data?.rows || scheduleTableData.data.rows.length === 0) {
  //     return [];
  //   }
  //   // Lấy branch_ids từ row đầu tiên
  //   const firstRow = scheduleTableData.data.rows[0];
  //   return firstRow?.branch_ids || [];
  // }, [scheduleTableData]);

  // Map dữ liệu từ API ra format cần thiết
  const mappedRows = useMemo(() => {
    if (!scheduleTableData?.success || !scheduleTableData?.data?.rows) {
      return [];
    }

    return scheduleTableData.data.rows.map(row => ({
      id: row.staff_id,
      name: row.staff_name,
      avatar: row.avatar,
      days: row.shifts || [],
      branch_ids: row.branch_ids || [],
    }));
  }, [scheduleTableData]);

  // Filter rows dựa trên search term
  const filteredRows = useMemo(() => {
    let rows = mappedRows;

    // Lọc theo từ khóa tìm kiếm
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      rows = rows.filter(row => row.name.toLowerCase().includes(searchLower));
    }

    // Lọc theo ca nếu có chọn ca
    if (selectedShifts && selectedShifts.length > 0) {
      const selectedIds = new Set(selectedShifts.map(s => String(s.value)));
      rows = rows.filter(row =>
        row.days?.some(dayShifts => {
          if (!Array.isArray(dayShifts)) return false;
          return dayShifts.some(shift => shift && typeof shift === 'object' && shift.id && selectedIds.has(String(shift.id)));
        })
      );
    }

    // Nếu không có thông tin staff hiện tại thì giữ nguyên thứ tự
    if (!currentStaffId) return rows;

    const currentIdStr = String(currentStaffId);

    // Đưa lịch của tài khoản hiện tại (staff_id trùng với authState) lên đầu
    const currentUserRows = [];
    const otherRows = [];

    rows.forEach(row => {
      if (String(row.id) === currentIdStr) {
        currentUserRows.push(row);
      } else {
        otherRows.push(row);
      }
    });

    return [...currentUserRows, ...otherRows];
  }, [mappedRows, searchTerm, selectedShifts, currentStaffId]);

  const headers = useMemo(() => {
    if (!scheduleTableData?.success || !scheduleTableData?.data?.headers) {
      return [];
    }
    return scheduleTableData.data.headers;
  }, [scheduleTableData]);

  // Hàm kiểm tra xem một ngày có phải là hôm nay không
  const isToday = useMemo(() => {
    const today = new Date();
    const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    return dateString => {
      if (!dateString) return false;
      // So sánh chỉ phần date (YYYY-MM-DD), bỏ qua phần time nếu có
      const dateOnly = dateString.split(' ')[0];
      return dateOnly === todayString;
    };
  }, []);

  // Khởi tạo dateRange từ headers khi có data và chưa được set
  useEffect(() => {
    if (headers && headers.length > 0 && (!dateRange.startDate || !dateRange.endDate)) {
      const startDate = headers[0]?.date || null;
      const endDate = headers[headers.length - 1]?.date || null;
      if (startDate && endDate) {
        setDateRange({ startDate, endDate });
      }
    }
  }, [headers]);

  // Xử lý thay đổi tuần (next/back)
  const handleWeekChange = direction => {
    if (!dateRange.startDate || !dateRange.endDate) return;

    // Trigger slide animation
    setSlideDirection(direction === 'next' ? 'right' : 'left');

    const startDateObj = new Date(dateRange.startDate);
    const endDateObj = new Date(dateRange.endDate);
    const daysDiff = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24)) + 1; // Số ngày trong tuần hiện tại

    if (direction === 'next') {
      // Tăng 7 ngày
      startDateObj.setDate(startDateObj.getDate() + 7);
      endDateObj.setDate(endDateObj.getDate() + 7);
    } else if (direction === 'back') {
      // Giảm 7 ngày
      startDateObj.setDate(startDateObj.getDate() - 7);
      endDateObj.setDate(endDateObj.getDate() - 7);
    }

    // Format lại về YYYY-MM-DD
    const formatDate = date => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Sequence: Slide + Fade out cùng lúc → Update data → Fade in
    // Bắt đầu trượt và fade out cùng lúc
    setOpacity(0);

    // Sau khi animation hoàn thành (200ms), update data và reset
    setTimeout(() => {
      // Update data khi đã fade out hoàn toàn
      setDateRange({
        startDate: formatDate(startDateObj),
        endDate: formatDate(endDateObj),
      });

      // Reset transform về 0 ngay lập tức (không có transition)
      setSlideDirection(null);

      // Fade in với data mới (sau một chút delay để đảm bảo data đã render)
      requestAnimationFrame(() => {
        setTimeout(() => {
          setOpacity(1);
        }, 30);
      });
    }, 150); // Thời gian cho slide + fade out (cùng lúc)
  };

  // Xử lý onChange từ DateToDateComponent
  const handleDateRangeChange = newDateRange => {
    if (newDateRange?.startDate && newDateRange?.endDate) {
      setDateRange({
        startDate: newDateRange.startDate,
        endDate: newDateRange.endDate,
      });
    }
  };

  // Xử lý chọn/bỏ chọn nhân viên
  const handleToggleEmployee = employeeId => {
    setSelectedEmployees(prev => {
      const newSet = new Set(prev);
      if (newSet.has(employeeId)) {
        newSet.delete(employeeId);
      } else {
        newSet.add(employeeId);
      }
      return newSet;
    });
  };

  // Xử lý xác nhận và mở popup
  const handleConfirmSelection = () => {
    if (role != true && !checkAdd) {
      toast('error', WARNING_ACTION_STATUS_ROLE);
      return;
    }
    if (selectedEmployees.size === 0) {
      toast('error', 'Vui lòng chọn nhân viên');
      return;
    }
    isHandlingMenuActionRef.current = true;
    setOpenDropdown(null);
    setSelectedDayIndex(0); // Mặc định chọn ngày đầu tiên
    setPopupMode('add');
    setCurrentShift(null);
    setIsShiftPopupOpen(true);
    setTimeout(() => {
      isHandlingMenuActionRef.current = false;
    }, 100);
  };

  // Lấy danh sách nhân viên đã chọn
  const getSelectedEmployeesData = () => {
    return filteredRows.filter(row => selectedEmployees.has(row.id));
  };

  // Giữ lại các hàm popup để tạm thời không dùng (có thể dùng lại sau)
  const handleOpenAddShiftPopup = dayIndex => {
    // Tạm thời không dùng popup, dùng dropdown thay thế
    // isHandlingMenuActionRef.current = true;
    // setOpenDropdown(null);
    // setSelectedDayIndex(dayIndex);
    // setPopupMode('add');
    // setCurrentShift(null);
    // setIsShiftPopupOpen(true);
    // setTimeout(() => {
    //   isHandlingMenuActionRef.current = false;
    // }, 100);
  };

  const handleOpenEditShiftPopup = (dayIndex, shiftType) => {
    // Tạm thời không dùng popup, dùng dropdown thay thế
    // isHandlingMenuActionRef.current = true;
    // setOpenDropdown(null);
    // setSelectedDayIndex(dayIndex);
    // setPopupMode('edit');
    // setCurrentShift(shiftType);
    // setIsShiftPopupOpen(true);
    // setTimeout(() => {
    //   isHandlingMenuActionRef.current = false;
    // }, 100);
  };

  const handleCloseShiftPopup = () => {
    setIsShiftPopupOpen(false);
    setSelectedDayIndex(null);
    setPopupMode('add');
    setCurrentShift(null);
  };

  // Xử lý lưu ca từ popup
  const handleSaveShift = (shiftId, selectedDays, mode, employees) => {
    // TODO: Xử lý lưu ca cho các nhân viên đã chọn
    console.log(`Lưu ca ${shiftId} cho các ngày:`, selectedDays, 'cho các nhân viên:', employees);
    handleCloseShiftPopup();
    // Reset chế độ chọn sau khi lưu
    setShowSelectMode(false);
    setSelectedEmployees(new Set());
  };

  // Xử lý lưu ca từ dropdown
  const handleSelectShift = (shiftId, dayIndex, mode, oldShiftType = null) => {
    // TODO: Xử lý lưu ca vào đây
    console.log(`${mode === 'edit' ? 'Sửa' : 'Thêm'} ca:`, shiftId, 'cho ngày:', dayIndex);
    if (mode === 'edit') {
      console.log('Ca cũ:', oldShiftType);
    }
  };

  // Xử lý mở dropdown "Xem thêm"
  const handleToggleDropdown = (e, rowId, dayIndex) => {
    e.stopPropagation();
    const key = `${rowId}-day-${dayIndex}`;

    if (openDropdown === key) {
      setOpenDropdown(null);
      return;
    }

    setOpenDropdown(key);
  };

  // Đóng dropdown khi click outside
  useEffect(() => {
    if (!openDropdown) return;

    const handleClickOutside = event => {
      // Nếu đang xử lý action từ menu, không làm gì cả
      if (isHandlingMenuActionRef.current) {
        return;
      }

      const key = openDropdown;
      const ref = dropdownRefs.current[key];

      // Kiểm tra xem có phải click vào menu actions của ShiftCell không
      const menu = event.target.closest('[data-shift-menu="true"]');
      if (menu) {
        // Nếu click vào menu actions, không đóng dropdown ngay
        // Để callback trong ShiftCell tự xử lý
        return;
      }

      // Kiểm tra xem có phải click vào nút "Xem thêm" không
      const button = event.target.closest('button');
      if (button && button.textContent?.includes('Xem thêm')) {
        return;
      }

      // Kiểm tra xem có phải click vào dropdown không
      if (ref && !ref.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    // Sử dụng setTimeout để đảm bảo event được xử lý sau các handler khác
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  return (
    <Container className='flex flex-col gap-5 pb-4'>
      <Head>
        <title>Bảng xếp ca</title>
      </Head>
      <div className='flex flex-col gap-1'>
        {statusExprired ? <EmptyExprired /> : <Breadcrumb items={breadcrumbItems} className='responsive-text-sm' />}
        <div className='flex items-center justify-between'>
          <h2 className='responsive-text-3xl text-neutral-04 font-medium capitalize flex items-center gap-2'>
            Bảng xếp ca
            <InfoTooltip
              content='Bảng xếp ca cho phép bạn quản lý và phân công ca làm việc cho công nhân theo từng ngày trong tuần. Nhân công sẽ dựa vào lịch ca đã được xếp để bấm giờ làm (chấm công) khi đến ca làm việc của mình.'
              iconProps={{
                className: '2xl:size-[21px] xl:size-[18px] size-[16px]',
              }}
            />
          </h2>
          <div className='flex items-center gap-3'>
            <SelectComponent
              options={branchOptions}
              colSpan={1}
              onChange={selected => setSelectedBranch(selected || null)}
              value={selectedBranch}
              placeholder='Chi nhánh'
              isClearable={true}
              closeMenuOnSelect={true}
            />
            <SelectComponent
              options={shiftFilterOptions}
              value={selectedShifts}
              onChange={value => setSelectedShifts(value || [])}
              isMulti
              isClearable
              placeholder='Lọc theo ca'
              closeMenuOnSelect={false}
              className='min-w-[220px]'
              maxShowMuti={1}
              components={{ MultiValue }}
            />
            <DateToDateComponent value={dateRange} onChange={handleDateRangeChange} className='text-base-default !w-[290px] h-fit z-[51]' useRange={false} />
            <button
              onClick={() => handleWeekChange('back')}
              disabled={!dateRange.startDate || !dateRange.endDate}
              className='group size-10 rounded-lg border border-[#D0D5DD] hover:border-blue-fmrp flex items-center justify-center transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <BackIcon className='size-5 text-neutral-02 group-hover:text-blue-fmrp transition-all duration-300 ease-in-out' />
            </button>
            <button
              onClick={() => handleWeekChange('next')}
              disabled={!dateRange.startDate || !dateRange.endDate}
              className='group size-10 rounded-lg border border-[#D0D5DD] hover:border-blue-fmrp flex items-center justify-center transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <BackIcon className='rotate-180 size-5 text-neutral-02 group-hover:text-blue-fmrp transition-all duration-300 ease-in-out' />
            </button>
            {showSelectMode ? (
              <>
                <button
                  onClick={() => {
                    setShowSelectMode(false);
                    setSelectedEmployees(new Set());
                  }}
                  className='px-4 py-2.5 rounded-lg bg-neutral-02 hover:bg-neutral-02/80 flex gap-2 items-center justify-center transition-all duration-300 ease-in-out'
                >
                  <CloseXIcon className='size-5 text-white' />
                  <span className='responsive-text-sm font-medium text-white'>Hủy</span>
                </button>
                <button onClick={handleConfirmSelection} className='px-4 py-2.5 rounded-lg flex gap-2 items-center justify-center transition-all duration-300 ease-in-out bg-red-01 hover:bg-red-01/80'>
                  <CheckDoubleIcon className='size-5 text-white' />
                  <span className='responsive-text-sm font-medium text-white'>Xác nhận {selectedEmployees.size > 0 && `(${selectedEmployees.size})`}</span>
                </button>
              </>
            ) : role == true || checkAdd ? (
              <button
                onClick={() => setShowSelectMode(true)}
                className='px-4 py-2.5 rounded-lg bg-blue-fmrp hover:bg-blue-fmrp/80 flex gap-2 items-center justify-center transition-all duration-300 ease-in-out'
              >
                <UsersIcon className='size-5 text-white' />
                <span className='responsive-text-sm font-medium text-white'>Chọn nhân viên</span>
              </button>
            ) : (
              <button
                onClick={() => toast('error', WARNING_ACTION_STATUS_ROLE)}
                className='px-4 py-2.5 rounded-lg bg-blue-fmrp hover:bg-blue-fmrp/80 flex gap-2 items-center justify-center transition-all duration-300 ease-in-out'
              >
                <UsersIcon className='size-5 text-white' />
                <span className='responsive-text-sm font-medium text-white'>Chọn nhân viên</span>
              </button>
            )}
          </div>
        </div>
      </div>
      <Customscrollbar className='flex flex-col flex-1 min-h-0 relative' style={{ zIndex: openDropdown ? 50 : 'auto' }}>
        <div style={{ minWidth: headers.length > 0 ? `${200 + headers.length * 170}px` : '100%' }}>
          {/* Skeleton loading */}
          {isLoadingScheduleTable ? (
            <>
              {/* Header skeleton */}
              <div
                className='sticky top-0 z-20 grid responsive-text-sm font-semibold text-neutral-02 bg-[#EDF5FE] h-12 border-b border-[#E5E7EB]'
                style={{ gridTemplateColumns: `230px repeat(7, 1fr)` }}
              >
                <div className='sticky left-0 z-30 px-4 flex gap-2 items-center border-r border-[#E5E7EB] bg-[#EDF5FE]'>
                  <Skeleton className='w-full h-6 rounded' />
                </div>
                {Array.from({ length: 7 }).map((_, index) => (
                  <div key={index} className='flex items-center justify-center border-r border-[#E5E7EB]'>
                    <Skeleton className='w-16 h-4 rounded' />
                  </div>
                ))}
              </div>
              {/* Rows skeleton */}
              {Array.from({ length: 8 }).map((_, rowIndex) => (
                <div key={rowIndex} className='grid border-b border-[#E5E7EB]' style={{ gridTemplateColumns: `230px repeat(7, 1fr)` }}>
                  <div className='sticky left-0 z-10 pl-4 py-2 flex gap-3 items-center border-x border-[#E5E7EB] bg-white'>
                    <Skeleton className='size-8 rounded-full' />
                    <Skeleton className='h-4 w-24 rounded' />
                  </div>
                  {Array.from({ length: 7 }).map((_, colIndex) => (
                    <div key={colIndex} className='p-2 flex flex-col gap-2 border-r border-[#E5E7EB]'>
                      <Skeleton className='h-[50px] w-full rounded' />
                    </div>
                  ))}
                </div>
              ))}
            </>
          ) : (
            <>
              {/* Header cột ngày */}
              {headers.length > 0 && (
                <div
                  className='sticky top-0 z-20 grid responsive-text-sm font-semibold text-neutral-02 bg-[#EDF5FE] h-12 border-b border-[#E5E7EB]'
                  style={{ gridTemplateColumns: `230px repeat(${headers.length}, 1fr)` }}
                >
                  <div className='sticky left-0 z-30 px-4 flex gap-2 items-center border-r border-[#E5E7EB] bg-[#EDF5FE]'>
                    <SearchIcon className='size-4 text-[#99A1AF] flex-shrink-0' />
                    <input
                      type='text'
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className='responsive-text-sm font-normal text-neutral-02 bg-transparent border-none outline-none flex-1'
                      placeholder='Tìm kiếm'
                    />
                    {searchTerm && (
                      <button type='button' onClick={() => setSearchTerm('')} className='flex-shrink-0 cursor-pointer hover:opacity-70 transition-opacity' aria-label='Xóa tìm kiếm'>
                        <CloseXIcon className='size-4 text-[#99A1AF]' />
                      </button>
                    )}
                  </div>
                  {headers.map((header, index) => {
                    const isTodayDate = isToday(header.date);
                    return (
                      <div
                        key={index}
                        className='flex items-center justify-center border-r border-[#E5E7EB] min-w-[160px] text-[#000]'
                        style={{
                          transform: slideDirection === 'left' ? 'translateX(-50px)' : slideDirection === 'right' ? 'translateX(50px)' : 'translateX(0)',
                          opacity: opacity,
                          transition: slideDirection ? 'transform 200ms ease-in-out, opacity 200ms ease-in-out' : 'opacity 200ms ease-in-out',
                          backgroundColor: isTodayDate ? '#D3E8FF' : 'transparent',
                        }}
                      >
                        <p>{header.label}</p>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* Các dòng nhân sự */}
              {filteredRows.length > 0
                ? filteredRows.map(row => (
                    <div key={row.id} className='grid border-b border-[#E5E7EB]' style={{ gridTemplateColumns: `230px repeat(${headers.length}, 1fr)` }}>
                      <div
                        className={`sticky left-0 z-10 pl-4 py-2 flex gap-3 items-center border-x border-[#E5E7EB] bg-white ${
                          showSelectMode ? 'cursor-pointer hover:bg-[#F9FAFB] transition-colors' : ''
                        }`}
                        onClick={showSelectMode ? () => handleToggleEmployee(row.id) : undefined}
                      >
                        {showSelectMode && (
                          <input
                            type='checkbox'
                            checked={selectedEmployees.has(row.id)}
                            onChange={() => handleToggleEmployee(row.id)}
                            className='flex-shrink-0 size-4 text-blue-fmrp border-[#D0D5DD] border rounded-full cursor-pointer outline-none focus:outline-none focus:ring-0 appearance-none checked:bg-blue-fmrp checked:border-blue-fmrp relative checked:after:content-[""] checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:after:w-2 checked:after:h-2 checked:after:bg-white checked:after:rounded-full'
                            onClick={e => e.stopPropagation()}
                          />
                        )}
                        {row.avatar && !imageErrors.has(row.id) ? (
                          <div className='flex-shrink-0 size-8 rounded-full overflow-hidden flex items-center justify-center bg-[#DBF3FF]'>
                            <img
                              src={row.avatar}
                              alt={row.name}
                              className='size-[32px] object-cover'
                              onError={() => {
                                setImageErrors(prev => new Set([...prev, row.id]));
                              }}
                            />
                          </div>
                        ) : (
                          <div>
                            <AvatarText fullName={row.name} className='size-8' />
                          </div>
                        )}
                        <TruncatedTooltip text={row.name} placement='bottom'>
                          <p className='responsive-text-sm font-medium text-neutral-05 flex-1 truncate'>{row.name}</p>
                        </TruncatedTooltip>
                      </div>

                      {row.days.map((dayShifts, index) => {
                        // dayShifts là mảng các shift objects
                        // Lọc ra các shift objects thực tế (bỏ null, undefined, 'empty')
                        const allShifts = Array.isArray(dayShifts) ? dayShifts.filter(shift => shift && shift !== 'empty' && typeof shift === 'object' && shift.id) : [];
                        const visibleShifts = allShifts.slice(0, 2);
                        const remainingShifts = allShifts.slice(2);
                        const remainingCount = remainingShifts.length;
                        // Chỉ hiển thị empty khi không có shift nào
                        const hasEmpty = allShifts.length === 0;
                        const dropdownKey = `${row.id}-day-${index}`;
                        const isDropdownOpen = openDropdown === dropdownKey;
                        const branchIdsFromApi = row.branch_ids;

                        const isTodayDate = isToday(headers[index]?.date);
                        return (
                          <div
                            key={`${row.id}-day-${index}`}
                            className='p-2 flex flex-col gap-2 border-r border-[#E5E7EB] relative min-w-[160px]'
                            style={{
                              transform: slideDirection === 'left' ? 'translateX(-50px)' : slideDirection === 'right' ? 'translateX(50px)' : 'translateX(0)',
                              opacity: opacity,
                              transition: slideDirection ? 'transform 200ms ease-in-out, opacity 200ms ease-in-out' : 'opacity 200ms ease-in-out',
                              zIndex: isDropdownOpen ? 100 : 'auto',
                              backgroundColor: isTodayDate ? '#F4F8FC' : 'transparent',
                            }}
                          >
                            {/* Hiển thị ô trống nếu không có ca nào */}
                            {hasEmpty && (
                              <ShiftCell
                                key={`${row.id}-day-${index}-empty`}
                                shift={null}
                                onAddShift={handleOpenAddShiftPopup}
                                onEditShift={handleOpenEditShiftPopup}
                                onSelectShift={handleSelectShift}
                                dayIndex={index}
                                rowId={row.id}
                                branchIds={branchIdsFromApi}
                                date={headers[index]?.date}
                                existingShifts={allShifts}
                                role={role}
                                checkAdd={checkAdd}
                                checkEdit={checkEdit}
                                checkDelete={checkDelete}
                                toast={toast}
                              />
                            )}
                            {/* Hiển thị tối đa 2 ca */}
                            {visibleShifts.map((shift, idx) => (
                              <ShiftCell
                                key={`${row.id}-day-${index}-shift-${idx}`}
                                shift={shift}
                                onAddShift={handleOpenAddShiftPopup}
                                onEditShift={handleOpenEditShiftPopup}
                                onSelectShift={handleSelectShift}
                                dayIndex={index}
                                rowId={row.id}
                                branchIds={branchIdsFromApi}
                                date={headers[index]?.date}
                                existingShifts={allShifts}
                                role={role}
                                checkAdd={checkAdd}
                                checkEdit={checkEdit}
                                checkDelete={checkDelete}
                                toast={toast}
                              />
                            ))}
                            {/* Hiển thị "Xem thêm" nếu có nhiều hơn 2 ca */}
                            {remainingCount > 0 && (
                              <>
                                <button type='button' onClick={e => handleToggleDropdown(e, row.id, index)} className='responsive-text-xs text-blue-fmrp hover:underline w-fit'>
                                  Xem thêm ({remainingCount})
                                </button>
                                {/* Dropdown hiển thị các ca còn lại */}
                                {isDropdownOpen && (
                                  <div
                                    ref={el => {
                                      if (el) dropdownRefs.current[dropdownKey] = el;
                                    }}
                                    className='absolute top-[20%] left-0 p-2 pb-4 mt-1 z-[100] flex flex-col gap-2 bg-white rounded-lg border border-[#E5E7EB] shadow-[0px_4px_20px_0px_#00000033] w-full max-h-[400px] overflow-y-auto'
                                    style={{ isolation: 'isolate' }}
                                    onClick={e => e.stopPropagation()}
                                  >
                                    <div className='flex items-center justify-end sticky top-0 bg-white'>
                                      <button onClick={() => setOpenDropdown(null)} className='p-0.5 flex items-center justify-center transition rounded-full outline-none hover:bg-slate-100'>
                                        <CloseXIcon className='size-5 text-[#99A1AF]' />
                                      </button>
                                    </div>
                                    {remainingShifts.map((shift, idx) => (
                                      <ShiftCell
                                        key={`${row.id}-day-${index}-remaining-${idx}`}
                                        shift={shift}
                                        onAddShift={handleOpenAddShiftPopup}
                                        onEditShift={handleOpenEditShiftPopup}
                                        onSelectShift={handleSelectShift}
                                        dayIndex={index}
                                        rowId={row.id}
                                        branchIds={branchIdsFromApi}
                                        date={headers[index]?.date}
                                        existingShifts={allShifts}
                                        role={role}
                                        checkAdd={checkAdd}
                                        checkEdit={checkEdit}
                                        checkDelete={checkDelete}
                                        toast={toast}
                                      />
                                    ))}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))
                : !isLoadingScheduleTable && (
                    <div className='w-full flex items-center justify-center' style={{ minHeight: 'calc(100vh - 300px)' }}>
                      <NoData type='calendar' />
                    </div>
                  )}
            </>
          )}
        </div>
      </Customscrollbar>

      {/* Popup Thêm/Sửa ca */}
      <PopupShiftForm
        open={isShiftPopupOpen}
        onClose={handleCloseShiftPopup}
        dayIndex={selectedDayIndex}
        mode={popupMode}
        initialShift={currentShift}
        onSave={handleSaveShift}
        selectedEmployees={getSelectedEmployeesData()}
        selectedBranch={selectedBranch}
        defaultDateRange={dateRange}
        availableEmployees={mappedRows}
        onEmployeesChange={newEmployees => {
          // Đồng bộ selectedEmployees trong index.jsx với employees trong PopupShiftForm
          const newSelectedSet = new Set(newEmployees.map(emp => emp.id));
          setSelectedEmployees(newSelectedSet);
        }}
      />
    </Container>
  );
};

export default ShiftSchedule;
