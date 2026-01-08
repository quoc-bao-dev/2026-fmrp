import { CalendarIcon, CloseXIcon } from '@/components/icons';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useFloating, offset, flip, shift, useDismiss, useInteractions } from '@floating-ui/react';
import styleDatePicker from '@/configs/configDatePicker';

// Helper function để format date
const formatDate = date => {
  if (!date) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Helper function để tính toán các quick options
const getQuickOptions = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay() + 1); // Thứ 2 của tuần này

  const thisWeekEnd = new Date(thisWeekStart);
  thisWeekEnd.setDate(thisWeekStart.getDate() + 6); // Chủ nhật của tuần này

  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(thisWeekStart.getDate() - 7);

  const lastWeekEnd = new Date(thisWeekStart);
  lastWeekEnd.setDate(thisWeekStart.getDate() - 1);

  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

  return [
    {
      label: 'Tuần này',
      startDate: thisWeekStart,
      endDate: thisWeekEnd,
    },
    {
      label: 'Tuần trước',
      startDate: lastWeekStart,
      endDate: lastWeekEnd,
    },
    {
      label: 'Tháng này',
      startDate: thisMonthStart,
      endDate: thisMonthEnd,
    },
    {
      label: 'Tháng trước',
      startDate: lastMonthStart,
      endDate: lastMonthEnd,
    },
  ];
};

const DateRangePickerCustom = ({ value, onChange, className, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [startDate, setStartDate] = useState(value?.startDate ? new Date(value.startDate) : null);
  const [endDate, setEndDate] = useState(value?.endDate ? new Date(value.endDate) : null);
  const [tempStartDate, setTempStartDate] = useState(null);
  const [tempEndDate, setTempEndDate] = useState(null);
  const triggerRef = useRef(null);
  const quickOptions = getQuickOptions();

  // Sync với value từ props
  useEffect(() => {
    if (value) {
      setStartDate(value.startDate ? new Date(value.startDate) : null);
      setEndDate(value.endDate ? new Date(value.endDate) : null);
    }
  }, [value]);

  // Floating UI setup
  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [offset(8), flip(), shift({ padding: 8 })],
  });

  const dismiss = useDismiss(context);
  const { getFloatingProps } = useInteractions([dismiss]);

  // Gắn reference cho trigger
  useEffect(() => {
    if (triggerRef.current) {
      refs.setReference(triggerRef.current);
    }
  }, [refs]);

  // Xử lý chọn quick option
  const handleQuickOption = option => {
    setTempStartDate(option.startDate);
    setTempEndDate(option.endDate);
  };

  // Xử lý chọn lại
  const handleReset = () => {
    setTempStartDate(null);
    setTempEndDate(null);
  };

  // Xử lý hoàn thành
  const handleComplete = () => {
    if (tempStartDate && tempEndDate) {
      setStartDate(tempStartDate);
      setEndDate(tempEndDate);
      onChange?.({
        startDate: tempStartDate.toISOString().split('T')[0],
        endDate: tempEndDate.toISOString().split('T')[0],
      });
    }
    setIsOpen(false);
  };

  // Xử lý thay đổi từ DatePicker
  const handleDateChange = dates => {
    const [start, end] = dates;
    setTempStartDate(start);
    setTempEndDate(end);
  };

  // Xử lý mở/đóng
  const handleToggle = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      // Khi mở, khởi tạo temp dates từ current dates
      setTempStartDate(startDate);
      setTempEndDate(endDate);
      setIsOpen(true);
    }
  };

  // Xử lý xóa
  const handleClear = e => {
    e.stopPropagation();
    setStartDate(null);
    setEndDate(null);
    setTempStartDate(null);
    setTempEndDate(null);
    onChange?.({
      startDate: null,
      endDate: null,
    });
  };

  const displayText = startDate && endDate ? `${formatDate(startDate)} → ${formatDate(endDate)}` : placeholder || 'dd/mm/yyyy → dd/mm/yyyy';

  const hasValue = startDate && endDate;

  return (
    <>
      <div ref={triggerRef} onClick={handleToggle} className={`relative flex items-center cursor-pointer rounded-lg bg-white border border-[#D0D5DD] ${className || ''}`}>
        <CalendarIcon color='#9295A4' className='size-4 absolute left-3 top-1/2 -translate-y-1/2 z-10' />
        <div className='pl-10 pr-10 py-2.5 w-full text-left responsive-text-sm text-[#3A3E4C]'>{displayText}</div>
        {hasValue && (
          <button type='button' onClick={handleClear} className='absolute right-8 top-1/2 -translate-y-1/2 z-10 p-0.5 hover:bg-gray-100 rounded-full transition-colors' aria-label='Xóa ngày đã chọn'>
            <CloseXIcon className='size-3.5 text-[#9295A4] hover:text-[#3A3E4C]' />
          </button>
        )}
        <div className='absolute right-3 top-1/2 -translate-y-1/2 z-10'>
          <svg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path d='M1 1.5L6 6.5L11 1.5' stroke='#9295A4' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
        </div>
      </div>

      {isOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps()}
            className='z-[1000] bg-white rounded-lg shadow-[0px_4px_20px_0px_#00000033] border border-[#E5E7EB] p-4'
            onMouseDown={e => e.stopPropagation()}
          >
            <div className='flex flex-col gap-4'>
              {/* Quick Options */}
              <div className='flex flex-wrap gap-2'>
                {quickOptions.map((option, index) => {
                  const isSelected = tempStartDate && tempEndDate && tempStartDate.getTime() === option.startDate.getTime() && tempEndDate.getTime() === option.endDate.getTime();

                  return (
                    <button
                      key={index}
                      type='button'
                      onClick={() => handleQuickOption(option)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        isSelected ? 'bg-blue-fmrp text-white border-blue-fmrp' : 'bg-white text-[#3A3E4C] border-[#D0D5DD] hover:border-blue-fmrp hover:text-blue-fmrp'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              {/* Calendar */}
              <div className='flex justify-center'>
                <DatePicker
                  inputClassName={`${styleDatePicker.inputClassName} pl-8 pr-6 w-full`}
                  {...styleDatePicker}
                  selected={tempStartDate}
                  onChange={handleDateChange}
                  startDate={tempStartDate}
                  endDate={tempEndDate}
                  selectsRange
                  inline
                  portalId='menu-time'
                />
              </div>

              {/* Action Buttons */}
              <div className='flex items-center justify-end gap-3 pt-2 border-t border-[#E5E7EB]'>
                <button type='button' onClick={handleReset} className='px-4 py-2 rounded-lg border border-[#D0D5DD] text-sm font-medium text-[#3A3E4C] hover:bg-[#F9FAFB] transition-colors'>
                  Chọn lại
                </button>
                <button
                  type='button'
                  onClick={handleComplete}
                  disabled={!tempStartDate || !tempEndDate}
                  className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${
                    tempStartDate && tempEndDate ? 'bg-blue-fmrp hover:bg-blue-600' : 'bg-[#D0D5DD] cursor-not-allowed'
                  }`}
                >
                  Hoàn thành
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default DateRangePickerCustom;
