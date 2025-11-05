import { useEffect, useRef, useState } from 'react';
import CaretDownIcon from '@/components/icons/common/CaretDownIcon';

const OPTIONS = [
  { value: 'today', label: 'Hôm nay' },
  { value: 'this_week', label: 'Tuần này' },
  { value: 'this_month', label: 'Tháng này' },
  { value: 'this_quarter', label: 'Quý này' },
  { value: 'this_year', label: 'Năm nay' },
  { value: 'last_year', label: 'Năm trước' },
];

const Radio = ({ checked }) => {
  return (
    <div className='relative flex items-center justify-center'>
      <div className={`w-4 h-4 rounded-full border ${checked ? 'border-blue-color' : 'border-border-gray-1'} flex items-center justify-center`}>
        {checked && <div className='w-2 h-2 rounded-full bg-blue-color' />}
      </div>
    </div>
  );
};

// Helper: format Date -> d/m/Y
export const formatDMY = date => {
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
};

// Helper: tính khoảng ngày theo lựa chọn nhanh
export const getDateRangeByQuickValue = (quickValue, now = new Date()) => {
  const current = new Date(now);
  current.setHours(0, 0, 0, 0);

  const startOfWeek = () => {
    const day = current.getDay(); // 0 CN ... 6 T7
    const diff = (day === 0 ? 6 : day - 1); // tuần bắt đầu Thứ 2
    const s = new Date(current);
    s.setDate(current.getDate() - diff);
    return s;
  };

  const endOfWeek = s => {
    const e = new Date(s);
    e.setDate(s.getDate() + 6);
    return e;
  };

  const startOfMonth = () => new Date(current.getFullYear(), current.getMonth(), 1);
  const endOfMonth = () => new Date(current.getFullYear(), current.getMonth() + 1, 0);

  const quarterIndex = Math.floor(current.getMonth() / 3); // 0..3
  const startOfQuarter = () => new Date(current.getFullYear(), quarterIndex * 3, 1);
  const endOfQuarter = () => new Date(current.getFullYear(), quarterIndex * 3 + 3, 0);

  const startOfYear = () => new Date(current.getFullYear(), 0, 1);
  const endOfYear = () => new Date(current.getFullYear(), 11, 31);

  let startDate = current;
  let endDate = current;

  switch (quickValue) {
    case 'today':
      startDate = current;
      endDate = current;
      break;
    case 'this_week': {
      const s = startOfWeek();
      startDate = s;
      endDate = endOfWeek(s);
      break;
    }
    case 'this_month':
      startDate = startOfMonth();
      endDate = endOfMonth();
      break;
    case 'this_quarter':
      startDate = startOfQuarter();
      endDate = endOfQuarter();
      break;
    case 'this_year':
      startDate = startOfYear();
      endDate = endOfYear();
      break;
    case 'last_year':
      startDate = new Date(current.getFullYear() - 1, 0, 1);
      endDate = new Date(current.getFullYear() - 1, 11, 31);
      break;
    default:
      break;
  }

  return {
    value: quickValue,
    start_date: formatDMY(startDate),
    end_date: formatDMY(endDate),
  };
};

const QuickDateDropdown = ({ value = 'this_week', onChange, className = '', options = OPTIONS, buttonClassName = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const current = options.find(o => o.value === value) || options[1];

  useEffect(() => {
    const onClickOutside = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type='button'
        onClick={() => setIsOpen(o => !o)}
        className={`flex items-center justify-between gap-2 h-10 px-3 border rounded-lg transition-all duration-300 bg-white hover:bg-[#EBF5FF] hover:border-[#3276FA] group ${
          isOpen ? 'border-[#3276FA] bg-[#EBF5FF]' : 'border-[#D0D5DD]'
        } ${buttonClassName}`}
      >
        <span className='responsive-text-sm text-neutral-07'>{current?.label}</span>
        <CaretDownIcon className={`size-4 text-[#9295A4] transition-all duration-300 group-hover:text-[#0F4F9E] ${isOpen ? 'rotate-180 ' : ''}`} />
      </button>

      {isOpen && (
        <div className='absolute top-full left-0 mt-1 z-50 bg-white border border-gray-200 rounded-2xl shadow-lg w-44 overflow-hidden'>
          <div className='max-h-64 overflow-auto'>
            {options.map((opt, idx) => {
              const checked = opt.value === value;
              return (
                <div
                  key={opt.value}
                  className={`flex items-center gap-2 p-3 cursor-pointer hover:bg-gray-50 responsive-text-sm ${idx !== options.length - 1 ? 'border-b border-gray-100' : ''}`}
                  onClick={() => {
                    const range = getDateRangeByQuickValue(opt.value);
                    onChange?.(range);
                    setIsOpen(false);
                  }}
                >
                  <Radio checked={checked} />
                  <span className='font-normal'>{opt.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickDateDropdown;
