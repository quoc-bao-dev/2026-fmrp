import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export const timeRanges = [
    { label: "Hôm nay", value: "today" },
    { label: "Tuần này", value: "thisWeek" },
    { label: "Tháng này", value: "thisMonth" },
    { label: "Quý này", value: "thisQuarter" },
    { label: "Năm này", value: "thisYear" },
];

export const productionStatuses = [
    { label: "Chưa bắt đầu", value: "notStarted" },
    { label: "Đang chờ", value: "pending" },
    { label: "Đang sản xuất", value: "inProgress" },
    { label: "Hoàn thành", value: "completed" },
    { label: "Chậm tiến độ", value: "delayed" }
];

const CalendarDropdown = ({ sate, setState, dataRanges = timeRanges }) => {

    const [selectedRange, setSelectedRange] = useState(dataRanges[4]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleRangeSelect = (range) => {
        setSelectedRange(range);
        setIsOpen(false);
        setState(range)
    };



    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="relative w-fit" ref={dropdownRef}>
            <div
                onClick={toggleDropdown}
                className="h-10 w-fit flex items-center gap-2 std:px-3 std:py-2 px-2 py-2 bg-white rounded-lg border border-border-gray-2 cursor-pointer"
            >
                <div className="flex items-center gap-2">
                    <Image
                        src="/dashboard/CalendarBlank.svg"
                        alt="calendar"
                        width={24}
                        height={24}
                    />
                    <p className="std:text-sm  text-xs font-normal text-typo-gray-3">
                        {selectedRange.label}
                    </p>
                </div>
                <Image
                    src="/dashboard/CaretDown.svg"
                    alt="caretDown"
                    width={12}
                    height={12}
                    className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
            </div>

            {isOpen && (
                <div
                    className="absolute z-50 mt-1 w-full bg-white border border-neutral-02 rounded-lg shadow-lg animate-dropdown-enter
                     transform origin-top overflow-hidden"
                >
                    {dataRanges.map((range) => (
                        <div
                            key={range.value}
                            onClick={() => handleRangeSelect(range)}
                            className="px-3 py-2 hover:bg-background-gray-3 cursor-pointer text-sm font-normal text-neutral-07 
                         transition-colors duration-200 ease-in-out"
                        >
                            {range.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CalendarDropdown;
