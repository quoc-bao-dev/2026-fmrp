import React from "react";
import SearchComponent from "@/components/UI/filterComponents/searchComponent";
import SelectComponent from "@/components/UI/filterComponents/selectComponent";
import OnResetData from "@/components/UI/btnResetData/btnReset";
import DropdowLimit from "@/components/UI/dropdowLimit/dropdowLimit";

const ReportFilter = ({
    onSearch,
    onReset,
    onExport,
    filterOptions,
    limit,
    sLimit,
    dataLang,
}) => {
    return (
        <div className="3xl:space-y-3 space-y-2">
            <div className="w-full items-center flex justify-between gap-2">
                <div className="flex gap-3 items-center w-full">
                    <div className="grid grid-cols-5 gap-2">
                        <SearchComponent
                            colSpan={1}
                            dataLang={dataLang}
                            placeholder={dataLang?.branch_search}
                            onChange={onSearch}
                        />
                        {filterOptions.map((option, index) => (
                            <SelectComponent
                                key={index}
                                options={option.options}
                                placeholder={option.placeholder}
                                isSearchable={true}
                                colSpan={1}
                                onChange={option.onChange}
                            />
                        ))}
                    </div>
                </div>
                <div className="flex justify-end gap-2 space-x-2 items-center">
                    <OnResetData sOnFetching={onReset} />
                    {onExport && (
                        <button
                            onClick={onExport}
                            className="xl:px-4 px-3 xl:py-2.5 py-1.5 2xl:text-xs xl:text-xs text-[7px] flex items-center space-x-2 bg-[#C7DFFB] rounded hover:scale-105 transition"
                        >
                            <span>{dataLang?.client_list_exportexcel}</span>
                        </button>
                    )}
                    <DropdowLimit sLimit={sLimit} limit={limit} dataLang={dataLang} />
                </div>
            </div>
        </div>
    );
};

export default ReportFilter;
