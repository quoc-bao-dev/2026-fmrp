import Skeleton from '@/components/common/skeleton/Skeleton';
import { CloseXIcon, SearchIcon, CheckIcon } from '@/components/icons';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import DateToDateComponent from '@/components/UI/filterComponents/dateTodateComponent';
import useToast from '@/hooks/useToast';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useGetShiftsByBranch } from '@/managers/api/shift-schedule/useGetShiftsByBranch';
import { useSaveShiftScheduleRange } from '@/managers/api/shift-schedule/useSaveShiftScheduleRange';

// Tên các ngày trong tuần
const DAY_NAMES = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const DAY_DATES = ['23/10', '24/10', '25/10', '26/10', '27/10', '28/10', '29/10'];

const PopupShiftForm = ({
  open,
  onClose,
  dayIndex,
  mode = 'add', // 'add' hoặc 'edit'
  initialShift = null, // Ca hiện tại khi sửa (ví dụ: 'morning', 'afternoon', ...)
  onSave,
  selectedEmployees = [], // Danh sách nhân viên đã chọn
  selectedBranch = null, // Chi nhánh đã chọn
  defaultDateRange = null, // Khoảng ngày mặc định từ component cha
  availableEmployees = [], // Danh sách nhân viên có sẵn từ component cha
  onEmployeesChange, // Callback để đồng bộ employees với component cha
}) => {
  const [selectedShift, setSelectedShift] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDays, setSelectedDays] = useState(new Set()); // Các ngày đã chọn
  const [employees, setEmployees] = useState(selectedEmployees); // Danh sách nhân viên trong popup
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null }); // Khoảng ngày được chọn
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false); // Hiển thị dropdown chọn nhân viên
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState(''); // Từ khóa tìm kiếm nhân viên
  const employeeDropdownRef = useRef(null);
  const employeeMenuRef = useRef(null);
  const toast = useToast();

  // Tính toán T2 và CN của tuần hiện tại
  const getCurrentWeekRange = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = CN, 1 = T2, ..., 6 = T7

    // Tính T2 (Thứ 2) của tuần hiện tại
    // Nếu hôm nay là CN (0), T2 là 6 ngày trước
    // Nếu hôm nay là T2 (1), T2 là hôm nay
    // Nếu hôm nay là T3 (2), T2 là 1 ngày trước
    // Công thức: T2 = today - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - mondayOffset);
    monday.setHours(0, 0, 0, 0);

    // Tính CN (Chủ nhật) của tuần hiện tại
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    // Format về YYYY-MM-DD
    const formatDate = date => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    return {
      startDate: formatDate(monday),
      endDate: formatDate(sunday),
    };
  };

  // Lấy danh sách ca theo chi nhánh
  const branchId = selectedBranch?.value ? [selectedBranch.value] : null;
  const { data: shiftsData, isLoading: isLoadingShifts } = useGetShiftsByBranch({
    params: branchId ? { branch_id: branchId } : {},
    enabled: open && !!branchId,
  });

  // Hook để lưu ca làm việc
  const { saveShiftScheduleRange, isLoading: isSaving } = useSaveShiftScheduleRange({
    onSuccess: () => {
      handleClose();
    },
  });

  // Map dữ liệu ca từ API
  const availableShifts = useMemo(() => {
    if (!shiftsData?.result || !shiftsData?.data || !Array.isArray(shiftsData.data)) {
      return [];
    }
    return shiftsData.data.map(shift => {
      // Format time từ "08:00:00" thành "08:00"
      const formatTime = time => {
        if (!time) return '';
        return time.substring(0, 5); // Lấy 5 ký tự đầu (HH:mm)
      };
      return {
        id: shift.id,
        label: shift.name || '',
        time: `${formatTime(shift.time_start)} - ${formatTime(shift.time_end)}`,
      };
    });
  }, [shiftsData]);

  // Khởi tạo state khi mở popup
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialShift) {
        setSelectedShift(initialShift);
      } else {
        setSelectedShift(null);
      }
      setSearchQuery('');
      // Mặc định chọn tất cả các thứ trong tuần (T2-T7), trừ Chủ nhật (CN)
      // 0 = T2, 1 = T3, 2 = T4, 3 = T5, 4 = T6, 5 = T7, 6 = CN
      setSelectedDays(new Set([0, 1, 2, 3, 4, 5]));
      // Chỉ đồng bộ employees khi popup mới mở (không reset khi selectedEmployees thay đổi từ bên ngoài)
      setEmployees(selectedEmployees);
      // Mặc định chọn dateRange từ component cha, nếu không có thì dùng tuần hiện tại
      if (defaultDateRange?.startDate && defaultDateRange?.endDate) {
        setDateRange(defaultDateRange);
      } else {
        const weekRange = getCurrentWeekRange();
        setDateRange(weekRange);
      }
      // Lock scroll khi modal mở
      document.body.style.overflow = 'hidden';
    } else {
      // Unlock scroll khi modal đóng
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, initialShift, defaultDateRange]);

  // Reset state khi popup đóng
  const handleClose = () => {
    // Đồng bộ employees với component cha trước khi đóng
    if (onEmployeesChange) {
      onEmployeesChange(employees);
    }
    setSelectedShift(null);
    setSearchQuery('');
    setSelectedDays(new Set());
    onClose();
  };

  // Lọc và sắp xếp danh sách nhân viên: đã chọn lên trước, sau đó filter theo search term
  const filteredAndSortedEmployees = useMemo(() => {
    if (!availableEmployees || availableEmployees.length === 0) return [];

    const selectedIds = new Set(employees.map(emp => emp.id));
    // Sắp xếp: nhân viên đã chọn lên trước
    const selected = availableEmployees.filter(emp => selectedIds.has(emp.id));
    const unselected = availableEmployees.filter(emp => !selectedIds.has(emp.id));
    const sorted = [...selected, ...unselected];

    // Filter theo search term
    if (!employeeSearchTerm.trim()) {
      return sorted;
    }

    const searchLower = employeeSearchTerm.toLowerCase().trim();
    return sorted.filter(emp => emp.name.toLowerCase().includes(searchLower));
  }, [availableEmployees, employees, employeeSearchTerm]);

  // Xử lý xóa nhân viên khỏi danh sách
  const handleRemoveEmployee = employeeId => {
    setEmployees(prev => {
      const newEmployees = prev.filter(emp => emp.id !== employeeId);
      // Đồng bộ với component cha
      if (onEmployeesChange) {
        onEmployeesChange(newEmployees);
      }
      return newEmployees;
    });
  };

  // Xử lý toggle chọn/bỏ chọn nhân viên
  const handleToggleEmployee = employee => {
    const isSelected = employees.some(emp => emp.id === employee.id);
    setEmployees(prev => {
      const newEmployees = isSelected ? prev.filter(emp => emp.id !== employee.id) : [...prev, employee];
      // Đồng bộ với component cha
      if (onEmployeesChange) {
        onEmployeesChange(newEmployees);
      }
      return newEmployees;
    });
  };

  // Kiểm tra nhân viên có được chọn không
  const isEmployeeSelected = employeeId => {
    return employees.some(emp => emp.id === employeeId);
  };

  // Đóng dropdown khi click outside
  useEffect(() => {
    if (!showEmployeeDropdown) return;

    const handleClickOutside = event => {
      if (employeeDropdownRef.current && !employeeDropdownRef.current.contains(event.target) && employeeMenuRef.current && !employeeMenuRef.current.contains(event.target)) {
        setShowEmployeeDropdown(false);
        setEmployeeSearchTerm('');
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmployeeDropdown]);

  // Xử lý toggle chọn ngày
  const handleToggleDay = dayIndex => {
    setSelectedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dayIndex)) {
        newSet.delete(dayIndex);
      } else {
        newSet.add(dayIndex);
      }
      return newSet;
    });
  };

  // Lọc danh sách ca theo từ khóa tìm kiếm
  const filteredShifts = useMemo(() => {
    if (!searchQuery.trim()) {
      return availableShifts;
    }
    const query = searchQuery.toLowerCase();
    return availableShifts.filter(shift => shift.label.toLowerCase().includes(query));
  }, [availableShifts, searchQuery]);

  // Xử lý thay đổi dateRange
  const handleDateRangeChange = newDateRange => {
    if (newDateRange?.startDate && newDateRange?.endDate) {
      setDateRange({
        startDate: newDateRange.startDate,
        endDate: newDateRange.endDate,
      });
    }
  };

  // Xử lý lưu ca
  const handleSave = () => {
    // Validate: Kiểm tra nhân viên trước
    if (!employees || employees.length === 0) {
      toast('error', 'Vui lòng chọn nhân viên');
      return;
    }

    // Validate: Kiểm tra ngày
    if (!dateRange.startDate || !dateRange.endDate) {
      toast('error', 'Vui lòng chọn khoảng ngày');
      return;
    }

    // Validate: Kiểm tra ca (quan trọng nhất - hiển thị toast)
    if (!selectedShift) {
      toast('error', 'Vui lòng chọn ca');
      return;
    }

    // Chuẩn bị payload
    const payload = {
      start_date: dateRange.startDate,
      end_date: dateRange.endDate,
      staff_id: employees.map(emp => emp.id),
      shift_id: selectedShift,
    };

    // Gọi API
    saveShiftScheduleRange(payload);
  };

  // Tạo title dựa trên mode
  const getTitle = () => {
    const dayInfo = dayIndex !== null ? `(${DAY_NAMES[dayIndex]} ${DAY_DATES[dayIndex]})` : '';
    return mode === 'edit' ? `Sửa Ca ${dayInfo}` : `Thêm Ca Làm`;
  };

  if (!open) return null;

  const modalContent = (
    <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-[2px] font-deca'>
      <div className='py-3 bg-white rounded-[14px] shadow-[0px_25px_50px_-12px_#00000040] w-[600px] 2xl:w-[800px] overflow-hidden flex flex-col' onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className='flex items-center justify-between p-4 2xl:p-8'>
          <h3 className='text-neutral-07 font-bold responsive-text-2xl capitalize'>{getTitle()}</h3>
          <button onClick={handleClose} className='flex items-center justify-center transition rounded-full outline-none p-1 hover:bg-slate-100'>
            <CloseXIcon className='size-6 text-neutral-02' />
          </button>
        </div>

        {/* Content */}
        <div className='px-4 2xl:px-8 py-4 flex flex-col gap-4 overflow-y-auto max-h-[79vh]'>
          {/* Section Nhân viên */}
          <div className='flex flex-col gap-2'>
            <div className='flex items-center gap-4'>
              <label className='responsive-text-base font-medium text-neutral-05 whitespace-nowrap w-[100px]'>Nhân viên</label>
              <div className='flex-1 relative' ref={employeeDropdownRef}>
                {/* UI hiển thị danh sách nhân viên - luôn hiển thị */}
                <div
                  onClick={() => {
                    setShowEmployeeDropdown(true);
                  }}
                  className='flex flex-wrap flex-1 gap-2.5 px-2 py-1.5 bg-[#F8F9FB] rounded-lg cursor-pointer hover:bg-[#F0F2F5] transition-colors min-h-[42px]'
                >
                  {employees.length > 0 ? (
                    employees.map(employee => (
                      <div key={employee.id} className='inline-flex items-center gap-2 px-3 py-1 bg-[#EAECEF] rounded-lg'>
                        <span className='responsive-text-sm text-[#4A5565]'>{employee.name}</span>
                        <button
                          type='button'
                          onClick={e => {
                            e.stopPropagation();
                            handleRemoveEmployee(employee.id);
                          }}
                          className='flex items-center justify-center hover:bg-blue-fmrp/10 rounded-full p-0.5 transition-colors'
                        >
                          <CloseXIcon className='size-3.5 text-[#4A5565]' />
                        </button>
                      </div>
                    ))
                  ) : (
                    <span className='responsive-text-sm text-neutral-02 py-1'>Chưa chọn nhân viên</span>
                  )}
                </div>
                {/* Dropdown menu tùy chỉnh */}
                {showEmployeeDropdown &&
                  createPortal(
                    <div
                      ref={employeeMenuRef}
                      className='absolute bg-white rounded-[10px] shadow-[0px_4px_20px_0px_#00000033] border border-[#E5E7EB] min-w-[300px] max-w-[500px] z-[10001]'
                      style={{
                        top: employeeDropdownRef.current ? `${employeeDropdownRef.current.getBoundingClientRect().bottom + window.scrollY + 4}px` : '0',
                        left: employeeDropdownRef.current ? `${employeeDropdownRef.current.getBoundingClientRect().left + window.scrollX}px` : '0',
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      {/* Search input */}
                      <div className='relative p-2 border-b border-[#E5E7EB]'>
                        <SearchIcon className='absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#99A1AF]' />
                        <input
                          type='text'
                          value={employeeSearchTerm}
                          onChange={e => setEmployeeSearchTerm(e.target.value)}
                          placeholder='Tìm kiếm nhân viên...'
                          className='w-full pl-10 pr-3 py-2 bg-[#F6F8FA] rounded-lg border-none outline-none responsive-text-sm text-[#141522] placeholder:text-[#9295A4]'
                          autoFocus
                        />
                      </div>
                      {/* Employee list */}
                      <Customscrollbar className='max-h-[300px]'>
                        <div className='flex flex-col'>
                          {filteredAndSortedEmployees.length > 0 ? (
                            filteredAndSortedEmployees.map(employee => {
                              const isSelected = isEmployeeSelected(employee.id);
                              return (
                                <div
                                  key={employee.id}
                                  onClick={() => handleToggleEmployee(employee)}
                                  className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                                    isSelected ? 'bg-blue-fmrp/5 hover:bg-blue-fmrp/15 text-blue-fmrp' : 'hover:bg-[#F9FAFB] text-[#141522]'
                                  }`}
                                >
                                  <span className='responsive-text-sm font-medium'>{employee.name}</span>
                                  {isSelected && <CheckIcon className='size-4 text-blue-fmrp' />}
                                </div>
                              );
                            })
                          ) : (
                            <div className='px-4 py-8 text-center responsive-text-sm text-[#9295A4]'>{employeeSearchTerm.trim() ? 'Không tìm thấy nhân viên' : 'Không có nhân viên'}</div>
                          )}
                        </div>
                      </Customscrollbar>
                    </div>,
                    document.body
                  )}
              </div>
            </div>
            {employees.length === 0 && <p className='responsive-text-sm text-red-500 ml-[116px]'>Vui lòng chọn nhân viên</p>}
          </div>

          {/* Section Chọn ngày */}
          <div className='flex items-center gap-4'>
            <label className='responsive-text-base font-medium text-neutral-05 w-[100px]'>Chọn ngày</label>
            <DateToDateComponent value={dateRange} onChange={handleDateRangeChange} className='text-base-default flex-1  z-[51]' useRange={false} placeholder='Chọn khoảng ngày' />
          </div>

          {/* Section Chọn ca */}
          <div className='flex flex-col gap-4 mt-2'>
            <label className='responsive-text-base font-medium text-neutral-05'>Chọn ca</label>
            {/* Input tìm kiếm */}
            <div className='relative'>
              <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[#99A1AF]' />
              <input
                type='text'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder='Tìm kiếm ca...'
                className='w-full pl-10 pr-4 py-2.5 border border-[#D0D5DD] rounded-lg responsive-text-sm text-neutral-05 placeholder:text-neutral-02 focus:outline-none focus:ring-2 focus:ring-blue-fmrp/20 focus:border-blue-fmrp'
              />
            </div>
            {isLoadingShifts ? (
              <Customscrollbar className='h-[200px]'>
                <div className='flex flex-col'>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className='flex items-center gap-3 py-4 px-2 border-b border-[#F3F4F6] last:border-b-0'>
                      <Skeleton className='size-5 rounded-full' />
                      <div className='flex-1 flex flex-col gap-2'>
                        <Skeleton className='h-4 w-32 rounded' />
                        <Skeleton className='h-3 w-24 rounded' />
                      </div>
                    </div>
                  ))}
                </div>
              </Customscrollbar>
            ) : (
              <Customscrollbar className='h-[200px]'>
                <div className='flex flex-col'>
                  {filteredShifts.map(shift => (
                    <label key={shift.id} className='flex items-center gap-3 py-4 px-2 border-b border-[#F3F4F6] hover:bg-[#F9FAFB] cursor-pointer transition-colors last:border-b-0'>
                      <input
                        type='radio'
                        name='shift'
                        value={shift.id}
                        checked={selectedShift === shift.id}
                        onChange={() => setSelectedShift(shift.id)}
                        className='size-5 text-blue-fmrp cursor-pointer outline-none focus:outline-none focus:ring-0'
                      />
                      <span className='responsive-text-sm font-medium text-neutral-05'>
                        {shift.label} <span className='text-neutral-02 font-normal'>({shift.time})</span>
                      </span>
                    </label>
                  ))}
                  {filteredShifts.length === 0 && !isLoadingShifts && (
                    <div className='text-center py-4 text-neutral-02 responsive-text-sm'>{!selectedBranch ? 'Vui lòng chọn chi nhánh' : 'Không tìm thấy ca nào'}</div>
                  )}
                </div>
              </Customscrollbar>
            )}
          </div>

          {/* Section Chọn thứ trong tuần */}
          {/* <div className='flex flex-col gap-4'>
            <label className='responsive-text-base font-medium text-neutral-05'>Chọn thứ trong tuần</label>
            <div className='flex items-center justify-between gap-3'>
              {DAY_NAMES_FULL.map((dayName, index) => (
                <label key={index} className='flex items-center gap-2 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={selectedDays.has(index)}
                    onChange={() => handleToggleDay(index)}
                    className='size-4 text-blue-fmrp border-[#D1D5DC] border rounded cursor-pointer outline-none focus:outline-none focus:ring-0'
                  />
                  <span className='responsive-text-sm text-neutral-05'>{dayName}</span>
                </label>
              ))}
            </div>
          </div> */}

          {/* Nút Lưu */}
          <button
            type='button'
            onClick={handleSave}
            disabled={isSaving}
            className='mx-auto w-[126px] py-3 px-4 rounded-lg text-white font-medium responsive-text-sm transition-colors bg-blue-fmrp hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {isSaving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default PopupShiftForm;
