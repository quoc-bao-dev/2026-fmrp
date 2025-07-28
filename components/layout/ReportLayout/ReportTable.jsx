import React from "react";
import { HeaderTable, RowTable } from "@/components/UI/common/Table";
import Loading from "@/components/UI/loading/loading";
import NoData from "@/components/UI/noData/nodata";

const ReportTable = ({
    isLoading,
    data,
    headerContent,
    renderRow,
}) => {
    return (
        <div className="2xl:w-[100%] pr-2">
            <HeaderTable>{headerContent}</HeaderTable>
            
            {isLoading ? (
                <Loading className="3xl:h-[620px] 2xl:h-[550px] h-[550px]" color="#0f4f9e" />
            ) : data?.length > 0 ? (
                <div className="min-h-[400px] h-[100%] w-full max-h-[600px]">
                    {data.map((item) => renderRow(item))}
                </div>
            ) : (
                <NoData />
            )}
        </div>
    );
};

export default ReportTable;