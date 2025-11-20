import { CaretDownIcon } from "@/components/icons";
import useSetingServer from "@/hooks/useConfigNumber";
import { useEffect, useRef, useState } from "react";

const LimitListDropdown = ({ sLimit, limit, dataLang, total }) => {
    const dataSeting = useSetingServer();
    const [isOpen, setIsOpen] = useState(false);
    const [openDirection, setOpenDirection] = useState("bottom");
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    const data = [5, 10, 15, 20, 40, 60];

    if (dataSeting?.tables_pagination_limit && !data.includes(+dataSeting.tables_pagination_limit)) {
        data.push(+dataSeting.tables_pagination_limit);
        data.sort((a, b) => a - b);
    }

    const handleSelect = (value) => {
        sLimit(value);
        setIsOpen(false);
    };

    const handleToggleDropdown = () => {
        if (!buttonRef.current) return;

        const rect = buttonRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        if (spaceBelow < 150 && spaceAbove > 150) {
            setOpenDirection("top");
        } else {
            setOpenDirection("bottom");
        }

        setIsOpen(!isOpen);
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
        <div className="flex items-center gap-2 text-[#9295A4] 3xl:text-sm text-[13px] mt-1" ref={dropdownRef}>
            <span>{dataLang?.display || "Hiển thị"}</span>

            <div className="relative">
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={handleToggleDropdown}
                    className="outline-none cursor-pointer border border-[#D0D5DD] text-[#3A3E4C] font-normal bg-white hover:bg-[#D0D5DD]/50 rounded-lg 3xl:p-2 p-1 flex items-center gap-1 custom-transition"
                >
                    {limit === -1 ? "Tất cả" : limit}

                    <CaretDownIcon className={`${isOpen ? "rotate-180" : ""} transition-transform size-3 text-[#9295A4]`} />
                </button>

                {isOpen && (
                    <ul className={`absolute z-10 ${openDirection === "top" ? "bottom-full mb-1" : "mt-1"} bg-white border border-gray-300 rounded shadow-lg w-full`}>
                        {data.map((e, index) => (
                            <li
                                key={index}
                                onClick={() => handleSelect(e)}
                                className="text-xs px-2 py-1 cursor-pointer hover:bg-gray-100 text-gray-800"
                            >
                                {e}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <span>{dataLang?.on || "trên"} {total} {dataLang?.lsx || "LSX"}</span>
        </div>
    );
};

export default LimitListDropdown;
