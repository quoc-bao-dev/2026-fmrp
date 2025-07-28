import styleDatePicker from "@/configs/configDatePicker";
import "react-datepicker/dist/react-datepicker.css";
import Datepicker from "react-tailwindcss-datepicker";
import CalendarBlankIcon from "@/components/icons/common/CalendarBlankIcon";
import DropdownFilledIcon from "@/components/icons/common/DropdownFilledIcon";

const DateToDateComponent = ({ placeholder, value, onChange, colSpan, className }) => {
  return (
    <div
      id="parentDatepicker"
      className={`z-20 min-w-[250px] 2xl:min-w-[310px] w-auto flex items-center cursor-pointer parentDatepicker rounded-lg bg-white border border-border-gray-1 ${className} relative`}
      style={{ gridColumn: `span ${colSpan || 1}` }}
    >
      <CalendarBlankIcon
        size={17}
        color="#9295A4"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10"
      />
      <Datepicker
        {...styleDatePicker}
        value={value}
        onChange={onChange}
        placeholder={placeholder || 'dd/mm/yyyy → dd/mm/yyyy'}
        inputClassName={`${styleDatePicker.inputClassName} px-8 w-full`}
        toggleClassName="hidden"
      />
      <DropdownFilledIcon className="absolute right-3 top-1/2 -translate-y-1/2 z-10" />
    </div>
  );
};
export default DateToDateComponent;
