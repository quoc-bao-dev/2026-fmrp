import React from "react";
import CloseXIcon from "@/components/icons/common/CloseXIcon";

const CustomInput = React.forwardRef(
    (
        {
            value,
            onChange,
            placeholder,
            className = "",
            error,
            onClear,
            ...rest
        },
        ref
    ) => {
        const showClear = value !== undefined && value !== null && value !== "";

        const handleClear = (e) => {
            e.preventDefault();
            if (onChange) {
                onChange("");
            }
            if (onClear) {
                onClear();
            }
        };

        return (
            <div className="relative w-full">
                <input
                    ref={ref}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full rounded-[10px] border-none bg-[#F6F8FA] px-3 py-2 text-sm text-[#9295A4] outline-none placeholder:text-[#9295A4] ${
                        error ? "ring-1 ring-[#EE1E1E]" : ""
                    } ${className}`}
                    {...rest}
                />
                {showClear && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute inset-y-0 right-2 flex items-center text-base text-[#9295A4] hover:text-[#111827]"
                        aria-label="Clear input"
                    >
                        <CloseXIcon className="w-4 h-4" />
                    </button>
                )}
            </div>
        );
    }
);

CustomInput.displayName = "CustomInput";

export default CustomInput;

