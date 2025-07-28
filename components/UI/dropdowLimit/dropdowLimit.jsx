import { useEffect, useRef, useState } from "react";
import useSetingServer from "@/hooks/useConfigNumber";
import DropdownFilledIcon from "@/components/icons/common/DropdownFilledIcon";

const DropdowLimit = ({ sLimit, limit, dataLang }) => {
  const dataSeting = useSetingServer();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  // Khởi tạo mảng data với giá trị mặc định
  const data = [15, 20, 40, 60];

  // Thêm tables_pagination_limit nếu cần
  if (
    dataSeting?.tables_pagination_limit &&
    !data.includes(+dataSeting.tables_pagination_limit)
  ) {
    data.push(+dataSeting.tables_pagination_limit);
    data.sort((a, b) => a - b);
  }

  // Hàm xử lý khi chọn một giá trị
  const handleSelect = (value) => {
    sLimit(value);
    setIsOpen(false);
  };

  // Đóng dropdown khi nhấp ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Thêm sự kiện lắng nghe nhấp chuột
    document.addEventListener("mousedown", handleClickOutside);

    // Dọn dẹp sự kiện khi component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex items-center gap-4">
      {/* Label */}
      <div className="font-normal text-neutral-02 responsive-text-sm">
        {dataLang?.display}
      </div>

      {/* Dropdown tùy chỉnh */}
      <div className="relative" ref={dropdownRef}>
        {/* Nút hiển thị giá trị hiện tại */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`outline-none cursor-pointer text-neutral-05 responsive-text-base bg-white rounded-lg px-1.5 py-1 2xl:px-2 2xl:py-1.5 3xl:px-3 3xl:py-2 hover:bg-white/70 flex items-center gap-2 border transition-all duration-300 ${isOpen ? "border-[#003DA0]" : "border-border-gray-1"}`}
        >
          {limit === -1 ? "Tất cả" : limit}
          <DropdownFilledIcon
            className={`w-3 h-3 transition-transform duration-500 ${
              isOpen ? "rotate-180 text-[#003DA0]" : "text-neutral-02"
            }`}
          />
        </button>

        {/* Danh sách tùy chọn */}
        {isOpen && (
          <ul className="absolute bottom-full z-10 w-full mb-1 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg min-w-fit max-h-40">
            {data.map((e, index) => (
              <li
                key={index}
                onClick={() => handleSelect(e)}
                className="text-center responsive-text-base px-2 py-1 cursor-pointer hover:bg-gray-100 text-neutral-05"
              >
                {e}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DropdowLimit;
