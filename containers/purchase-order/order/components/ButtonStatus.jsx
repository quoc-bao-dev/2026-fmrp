import DropdownFilledIcon from "@/components/icons/common/DropdownFilledIcon";
import { useEffect, useRef, useState } from "react";

const ButtonStatus = ({ _HandleChangeInput, warehouseman_id, id, currentStatus, options = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (targetStatus) => {
    // Luôn truyền currentStatus (giá trị hiện tại), không phụ thuộc vào option được chọn
    // Nếu status hiện tại là 0, dù chọn gì cũng truyền 0
    // Nếu status hiện tại là 1, dù chọn gì cũng truyền 1
    const statusToSend = String(currentStatus);
    const mockEvent = {
      target: {
        checked: targetStatus !== currentStatus,
        value: statusToSend // Luôn truyền currentStatus
      }
    };
    _HandleChangeInput(id, warehouseman_id, "browser", mockEvent);
    setIsOpen(false);
  };

  // Tìm option hiện tại dựa trên currentStatus (so sánh string)
  const currentOption = options.find(opt => String(opt.targetStatus) === String(currentStatus)) || options[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className={`${
          currentOption?.className || (warehouseman_id == "0"
            ? "bg-neutral-01 text-neutral-05 border-border-gray-1"
            : "bg-green-02 text-green-00 border-green-01")
        } 
            border rounded-lg px-1.5 py-1 2xl:px-2 2xl:py-1.5 3xl:px-3 3xl:py-2 flex items-center gap-2 ease-in-out transition-all`}
      >
        <span className="3xl:text-sm 2xl:text-13 xl:text-xs text-11 font-medium whitespace-nowrap">
          {currentOption?.label || "Chưa duyệt"}
        </span>
        <DropdownFilledIcon
          className={`w-3 h-3 transition-transform duration-300 ${currentOption?.iconColor || (warehouseman_id == "0" ? "text-neutral-02" : "text-green-01")} ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute p-1 mt-1 min-w-[120px] w-fit bg-white rounded-xl z-[999] shadow-[0px_20px_40px_-4px_#919EAB3D,0px_0px_2px_0px_#919EAB3D]">
          <ul className="flex flex-col gap-1">
            {options.map((option, index) => (
              <li
                key={index}
                className={`px-1.5 py-2 rounded-lg hover:bg-primary-05 3xl:text-sm 2xl:text-13 xl:text-xs text-11 text-neutral-07 font-normal whitespace-nowrap cursor-pointer flex items-center 
                  ${String(currentStatus) === String(option.targetStatus) ? "bg-primary-05" : ""}`}
                onClick={() => {
                  handleSelect(String(option.targetStatus)); // Đảm bảo là string
                }}
              >
                <span>{option.label}</span>
                {String(currentStatus) === String(option.targetStatus) && (
                  <svg
                    className="h-4 w-4 ml-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ButtonStatus;
