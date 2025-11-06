import NoData from '@/components/UI/noData/nodata';
import { useGetProductionPlan } from '@/hooks/dashboard/useGetProductionPlan';
import useSetingServer from '@/hooks/useConfigNumber';
import formatNumberConfig from "@/utils/helpers/formatnumber";
import dynamic from "next/dynamic";
import React from 'react';

const Column = dynamic(() => import("@ant-design/plots").then(({ Column }) => Column), { ssr: false });

const ColumnChart = React.memo((props) => {
    const { dataLang } = props

    const dataSeting = useSetingServer();

    const formatNumber = (number) => {
        return formatNumberConfig(+number, dataSeting);
    };

    const { data: dataProductionPlan, isLoading } = useGetProductionPlan()

    const dataConvert = dataProductionPlan?.data?.items?.flatMap((item) => [
        { item_name: item?.item_name, type: dataLang?.column_chart_actual ?? "column_chart_actual", value: +item?.quantity },
        { item_name: item?.item_name, type: dataLang?.column_chart_plan ?? "column_chart_plan", value: +item?.quantity_plan }
    ]);


    const config = {
        data: dataConvert ? dataConvert : [],
        isStack: true,
        xField: "item_name",
        yField: "value",
        seriesField: "type",
        color: ["#C7DFFB", "#5599EC"],
        minColumnWidth: 16,
        maxColumnWidth: 16,
        barStyle: {
            radius: [2, 2, 0, 0],
        },
        legend: {
            position: "top",
        },
        meta: {
            value: {
                formatter: (val) => formatNumber(val),
            },
        },
    };
    return (
        <div className="p-3 border rounded-lg bg-slate-50/60 border-slate-50">
            <div className="mt-[12px] mb-[24px] mx-2 ">
                <div className="flex items-center justify-between">
                    <h2>{dataLang?.column_chart_production_plan ?? "column_chart_production_plan"}</h2>
                    {/* <button className="text-[#667085] bg-[#F3F4F6] px-4 py-2 rounded flex space-x-2 items-center hover:scale-105 transition">
                        <span>Xem chi tiết</span>
                        <ArrowRight2 size={18} />
                    </button> */}
                </div>
                {
                    isLoading
                        ?
                        <div className='h-[420px] w-full bg-slate-100 animate-pulse rounded-md'></div>
                        :
                        dataConvert?.length > 0
                            ?
                            <div className="rounded-md bg-[#F9FAFB] w-full ">
                                <div className="mt-[28px]">
                                    <Column {...config} />
                                </div>
                            </div>
                            :
                            <NoData type='dashboard' />
                }
            </div>
        </div>
    );
});

export default ColumnChart