import React from "react";
import CloseXIcon from "@/components/icons/common/CloseXIcon";

const InputClearable = React.forwardRef(
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
                    className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-[#141522] outline-none hover:border-[#003DA0] focus:shadow-[0_0_0_1px_#003DA0] ${
                        error ? "border-[#EE1E1E] focus:border-[#EE1E1E]" : "border-[#D0D5DD] focus:border-[#003DA0]"
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

InputClearable.displayName = "InputClearable";

export default InputClearable;

