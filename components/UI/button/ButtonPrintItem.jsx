import { PrinterIcon } from "@/components/icons";
import { twMerge } from "tailwind-merge";

const ButtonPrintItem = ({
  dataLang,
  onCLick,
  className = "",
  disabled = false,
  isLoading = false,
  classLoading = "",
  totalButtons = 0,
}) => {
  const isDisabled = disabled || isLoading;

  return (
    <button
      onClick={isDisabled ? undefined : onCLick}
      disabled={isDisabled}
      className={twMerge(
        `group rounded-lg w-full p-1 border border-transparent transition-all ease-in-out flex items-center gap-2 responsive-text-sm text-left cursor-pointer
        ${totalButtons > 3
          ? 'hover:bg-primary-05'
          : 'hover:border-[#003DA0] hover:bg-primary-05'
        }
        ${isDisabled
          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
          : "cursor-pointer"
        }`,
        className
      )}
    >
      {isLoading && (
        <span
          className={`${classLoading} inline-block size-4 shink animate-spin rounded-full border-[3px] border-solid border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]`}
        />
      )}
      {!isLoading && (
        <PrinterIcon
          className={`size-5 transition-all duration-300 
            ${totalButtons > 3 ? "text-neutral-03 group-hover:text-neutral-07" : "text-[#003DA0]"}`}
        />
      )}
      {totalButtons > 3 && (
        <p className="text-neutral-03 group-hover:text-neutral-07 font-normal whitespace-nowrap">
          {dataLang?.btn_table_print || "In phiếu"}
        </p>
      )}
    </button>
  );
};

export default ButtonPrintItem;
