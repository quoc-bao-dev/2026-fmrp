import React from "react";
import { twMerge } from "tailwind-merge";

const CheckboxDefault = ({
    label,
    checked,
    defaultChecked,
    onChange,
    disabled = false,
    className = "",
    onClick,
}) => {
    return (
        <label
            className={`inline-flex items-center space-x-2 cursor-pointer ${disabled ? "opacity-50 cursor-not-allowed" : ""
                } ${className}`}
            onClick={onClick}
        >
            <input
                type="checkbox"
                className="peer hidden"
                checked={checked}
                defaultChecked={defaultChecked}
                onChange={(e) => onChange?.(e.target.checked)}
                disabled={disabled}
            />
            <div
                className={twMerge(
                    "w-5 h-5 border-[1px] border-[#D0D5DD] rounded-md peer-checked:bg-[#0375F3] flex items-center justify-center transition",
                )}
            >
                <svg
                    width="12"
                    height="9"
                    viewBox="0 0 12 9"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M10.6663 1L4.24967 7.41667L1.33301 4.5"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
            {label && <span className="responsive-text-base text-gray-700">{label}</span>}
        </label>
    );
};

export default CheckboxDefault;
