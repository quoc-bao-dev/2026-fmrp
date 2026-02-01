import { PrinterTemIcon } from "@/components/icons";

const PopupPrintItem = ({
    dataLang,
    onCLick,
    className = "",
    disabled = false,
    isLoading = false,
    loadingOption = null, // 'price' hoặc 'notPrice' hoặc null
    classLoading = "",
    type
}) => {
    const isNotPriceLoading = loadingOption === 'notPrice';
    const isPriceLoading = loadingOption === 'price';
    const isNotPriceDisabled = disabled || isNotPriceLoading;
    const isPriceDisabled = disabled || isPriceLoading;

    return (
        <ul className="flex flex-col gap-1">
            <li
                onClick={() => !isNotPriceDisabled && onCLick("notPrice")}
                className={`group transition-all duration-200 ease-in-out flex items-center gap-2 2xl:text-sm xl:text-sm text-[8px] text-left px-1.5 py-2 rounded-lg font-normal whitespace-nowrap ${isNotPriceDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer hover:bg-primary-05 text-neutral-03 hover:text-neutral-07'
                    }`}
            >
                {isNotPriceLoading && (
                    <span
                        className={`${classLoading} inline-block size-3 shink animate-spin border-typo-blue-3 rounded-full border-[2px] border-solid border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]`}
                    />
                )}
                {!isNotPriceLoading && <PrinterTemIcon className="size-5" />}
                <p className="whitespace-nowrap">
                    {["payment", "receipts"].includes(type)
                        ? dataLang?.PDF_PrintOnelink || "PDF_PrintOnelink"
                        : dataLang?.btn_table_print_notprice || "In không giá"}
                </p>
            </li>
            <li
                onClick={() => !isPriceDisabled && onCLick("price")}
                className={`group transition-all duration-200 ease-in-out flex items-center gap-2 2xl:text-sm xl:text-sm text-[8px] text-left px-1.5 py-2 rounded-lg font-normal whitespace-nowrap ${isPriceDisabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer hover:bg-primary-05 text-neutral-03 hover:text-neutral-07'
                    }`}
            >
                {isPriceLoading && (
                    <span
                        className={`${classLoading} inline-block size-3 shink animate-spin border-typo-blue-3 rounded-full border-[2px] border-solid border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]`}
                    />
                )}
                {!isPriceLoading && <PrinterTemIcon className="size-5" />}
                <p className="whitespace-nowrap">
                    {["payment", "receipts"].includes(type)
                        ? dataLang?.PDF_PrintTwolink || "PDF_PrintTwolink"
                        : dataLang?.btn_table_print_price || "In có giá"}
                </p>
            </li>
        </ul>
    );
};

export default PopupPrintItem;
