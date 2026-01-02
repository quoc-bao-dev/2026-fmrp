import styleDatePicker from '@/configs/configDatePicker';
import 'react-datepicker/dist/react-datepicker.css';
import Datepicker from 'react-tailwindcss-datepicker';
import DropdownFilledIcon from '@/components/icons/common/DropdownFilledIcon';
import { CalendarIcon, CloseXIcon } from '@/components/icons';

const DateToDateComponent = ({ placeholder, value, onChange, colSpan, className, useRange }) => {
  const hasValue = value?.startDate || value?.endDate;

  const handleClear = e => {
    e.stopPropagation();
    if (onChange) {
      onChange({
        startDate: null,
        endDate: null,
      });
    }
  };

  return (
    <div
      id='parentDatepicker'
      className={`z-20 min-w-[250px] 2xl:min-w-[310px] w-auto flex items-center cursor-pointer parentDatepicker rounded-lg bg-white border border-border-gray-1 ${className} relative`}
      style={{ gridColumn: `span ${colSpan || 1}` }}
    >
      <CalendarIcon color='#9295A4' className='size-4 absolute left-3 top-1/2 -translate-y-1/2 z-10' />
      <Datepicker
        {...styleDatePicker}
        value={value}
        onChange={onChange}
        placeholder={placeholder || 'dd/mm/yyyy → dd/mm/yyyy'}
        inputClassName={`${styleDatePicker.inputClassName} pl-8 pr-6 w-full`}
        toggleClassName='hidden'
        // asSingle={true}
        useRange={useRange}
      />
      {hasValue ? (
        <button type='button' onClick={handleClear} className='absolute right-6 top-1/2 -translate-y-1/2 z-10 p-0.5 hover:bg-gray-100 rounded-full transition-colors' aria-label='Xóa ngày đã chọn'>
          <CloseXIcon className='size-3.5 text-[#9295A4] hover:text-[#3A3E4C]' />
        </button>
      ) : null}
      <DropdownFilledIcon className='absolute right-3 top-1/2 -translate-y-1/2 z-10' />
    </div>
  );
};
export default DateToDateComponent;
