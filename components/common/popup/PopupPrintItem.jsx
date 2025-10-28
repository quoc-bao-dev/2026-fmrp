import PrinterTem from "@/components/icons/common/PrinterTem";

const PopupPrintItem = ({
    dataLang,
    onCLick,
    className = "",
    disabled = false,
    isLoading = false,
    classLoading = "",
    type
}) => {
    const isDisabled = disabled || isLoading;

    return (
        <>
            {isLoading ? (
                <div className="w-full flex justify-center items-center py-4 gap-x-3">
                    <span
                        className={`${classLoading} inline-block size-6 shink animate-spin border-typo-blue-3 rounded-full border-[3px] border-solid border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]`}
                    />
                    <span className="text-base font-medium text-typo-blue-3">Loading...</span>
                </div>
            ) : (
                <ul className="flex flex-col gap-1">
                    <li
                        onClick={() => onCLick("notPrice")}
                        className="group transition-all duration-200 ease-in-out flex items-center gap-2 2xl:text-sm xl:text-sm text-[8px] text-left cursor-pointer px-1.5 py-2 rounded-lg hover:bg-primary-05 text-neutral-03 hover:text-neutral-07 font-normal whitespace-nowrap"
                    >
                        <PrinterTem className="size-5"/>
                        <p className="whitespace-nowrap">
                            {["payment", "receipts"].includes(type)
                                ? dataLang?.PDF_PrintOnelink || "PDF_PrintOnelink"
                                : dataLang?.btn_table_print_notprice || "In không giá"}
                        </p>
                    </li>
                    <li
                        onClick={() => onCLick("price")}
                        className="group transition-all duration-200 ease-in-out flex items-center gap-2 2xl:text-sm xl:text-sm text-[8px] text-left cursor-pointer px-1.5 py-2 rounded-lg hover:bg-primary-05 text-neutral-03 hover:text-neutral-07 font-normal whitespace-nowrap"
                    >
                        <PrinterTem className="size-5"/>
                        <p className="whitespace-nowrap">
                            {["payment", "receipts"].includes(type)
                                ? dataLang?.PDF_PrintTwolink || "PDF_PrintTwolink"
                                : dataLang?.btn_table_print_price || "In có giá"}
                        </p>
                    </li>
                </ul>
            )}
        </>
    );
};

export default PopupPrintItem;
