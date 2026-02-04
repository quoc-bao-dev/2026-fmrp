import { PrinterIcon } from "@/components/icons";
import { Tooltip } from "react-tooltip";
import { twMerge } from "tailwind-merge";

const ButtonPrintPDF = ({
  onClick,
  isLoading = false,
  disabled = false,
  tooltipText = "In PDF",
  tooltipId,
  className = "",
  iconClassName = "",
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <>
      <button
        onClick={isDisabled ? undefined : onClick}
        disabled={isDisabled}
        data-tooltip-id={tooltipId}
        data-tooltip-content={tooltipText}
        className={twMerge(
          `group transition-all duration-200 ease-in-out flex items-center gap-2 2xl:text-sm xl:text-sm text-[8px] text-left cursor-pointer rounded-lg p-1 border border-transparent hover:border-[#003DA0] hover:bg-primary-05 text-neutral-03 hover:text-neutral-07 font-normal whitespace-nowrap aspect-square w-fit h-fit
          ${isDisabled
            ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
            : "cursor-pointer"
          }`,
          className
        )}
      >
        {isLoading ? (
          <span
            className="inline-block size-4 shrink-0 animate-spin rounded-full border-[3px] border-solid border-[#003DA0] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
          />
        ) : (
          <PrinterIcon
            className={twMerge(
              "size-5 text-[#003DA0]",
              iconClassName
            )}
          />
        )}
      </button>
      {tooltipId && (
        <Tooltip
          id={tooltipId}
          place="top"
          className="z-[999999] !opacity-100"
          style={{ borderRadius: "6px" }}
        />
      )}
    </>
  );
};

export default ButtonPrintPDF;

