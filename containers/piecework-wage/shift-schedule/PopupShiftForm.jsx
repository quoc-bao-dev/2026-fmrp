import { CloseXIcon, SearchIcon } from '@/components/icons';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Danh sách các ca có sẵn
const AVAILABLE_SHIFTS = [
  { id: 'morning', label: 'Ca sáng', time: '08:00 - 12:00' },
  { id: 'afternoon', label: 'Ca chiều', time: '11:00 - 16:00' },
  { id: 'noon', label: 'Ca trưa', time: '12:00 - 14:00' },
  { id: 'night', label: 'Ca tối', time: '18:00 - 21:30' },
  { id: 'training', label: 'Training', time: '09:00 - 17:00' },
];

// Tên các ngày trong tuần
const DAY_NAMES = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const DAY_NAMES_FULL = ['Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy', 'Chủ nhật'];
const DAY_DATES = ['23/10', '24/10', '25/10', '26/10', '27/10', '28/10', '29/10'];

const PopupShiftForm = ({
  open,
  onClose,
  dayIndex,
  mode = 'add', // 'add' hoặc 'edit'
  initialShift = null, // Ca hiện tại khi sửa (ví dụ: 'morning', 'afternoon', ...)
  onSave,
  selectedEmployees = [], // Danh sách nhân viên đã chọn
}) => {
  const [selectedShift, setSelectedShift] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDays, setSelectedDays] = useState(new Set()); // Các ngày đã chọn
  const [employees, setEmployees] = useState(selectedEmployees); // Danh sách nhân viên trong popup

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
      setEmployees(selectedEmployees);
      // Lock scroll khi modal mở
      document.body.style.overflow = 'hidden';
    } else {
      // Unlock scroll khi modal đóng
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open, mode, initialShift, selectedEmployees]);

  // Reset state khi popup đóng
  const handleClose = () => {
    setSelectedShift(null);
    setSearchQuery('');
    setSelectedDays(new Set());
    onClose();
  };

  // Xử lý xóa nhân viên khỏi danh sách
  const handleRemoveEmployee = employeeId => {
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
  };

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
  const filteredShifts = AVAILABLE_SHIFTS.filter(shift => shift.label.toLowerCase().includes(searchQuery.toLowerCase()));

  // Xử lý lưu ca
  const handleSave = () => {
    if (selectedShift && selectedDays.size > 0) {
      onSave?.(selectedShift, Array.from(selectedDays), mode, employees);
      handleClose();
    }
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
        <div className='px-4 2xl:px-8 py-4 flex flex-col gap-6 overflow-y-auto max-h-[70vh]'>
          {/* Section Nhân viên */}
          <div className='flex items-center gap-10'>
            <label className='responsive-text-base font-medium text-neutral-05 whitespace-nowrap'>Nhân viên</label>
            <div className='flex flex-wrap w-full gap-2.5 px-2 py-1.5 bg-[#F8F9FB] rounded-lg'>
              {employees.length > 0 ? (
                employees.map(employee => (
                  <div key={employee.id} className='inline-flex items-center gap-2 px-3 py-1 bg-[#EAECEF] rounded-lg'>
                    <span className='responsive-text-sm text-[#4A5565]'>{employee.name}</span>
                    <button type='button' onClick={() => handleRemoveEmployee(employee.id)} className='flex items-center justify-center hover:bg-blue-fmrp/10 rounded-full p-0.5 transition-colors'>
                      <CloseXIcon className='size-3.5 text-[#4A5565]' />
                    </button>
                  </div>
                ))
              ) : (
                <span className='responsive-text-sm text-neutral-02'>Chưa chọn nhân viên</span>
              )}
            </div>
          </div>

          {/* Section Chọn ca */}
          <div className='flex flex-col gap-4'>
            <label className='responsive-text-base font-medium text-neutral-05'>Chọn ca</label>
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
              {filteredShifts.length === 0 && <div className='text-center py-4 text-neutral-02 responsive-text-sm'>Không tìm thấy ca nào</div>}
            </div>
          </div>

          {/* Section Chọn thứ trong tuần */}
          <div className='flex flex-col gap-4'>
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
          </div>

          {/* Nút Lưu */}
          <button type='button' onClick={handleSave} className='mx-auto w-[126px] py-3 px-4 rounded-lg text-white font-medium responsive-text-sm transition-colors bg-blue-fmrp hover:bg-blue-600'>
            Lưu
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default PopupShiftForm;
