import { useGetStatusManufactures } from '@/hooks/dashboard/useGetStatusManufactures';
import useSetingServer from '@/hooks/useConfigNumber';
import formatNumberConfig from "@/utils/helpers/formatnumber";
import { ArrowDown, ArrowUp } from "iconsax-react";
import React from 'react';


const ListTask = React.memo((props) => {
    const { dataLang } = props

    const { data: dataStatus } = useGetStatusManufactures()

    const dataSeting = useSetingServer();

    const formatNumber = (number) => {
        return formatNumberConfig(+number, dataSeting);
    };


    const data = [
        {
            title: dataLang?.list_task_in_production ?? "list_task_in_production",
            number: formatNumber(dataStatus?.data?.status?.pending?.count) ?? 0,
            bgColor: "#EBF5FF",
            bgSmall: "#1760B9",
            percent: dataStatus?.data?.status?.pending?.percent ?? 0,
            key: "pending",
        },
        {
            title: dataLang?.list_task_not_produced ?? "list_task_not_produced",
            number: formatNumber(dataStatus?.data?.status?.not_started?.count) ?? 0,
            bgColor: "#F3F4F6",
            bgSmall: "#9295A4",
            percent: dataStatus?.data?.status?.not_started?.percent ?? 0,
            key: "not_started",
        },
        {
            title: dataLang?.list_task_completed ?? "list_task_completed",
            number: formatNumber(dataStatus?.data?.status?.completed?.count) ?? 0,
            bgColor: "#EBFEF2",
            bgSmall: "#0BAA2E",
            percent: dataStatus?.data?.status?.completed?.percent ?? 0,
            key: "completed",
        },
        {
            title: dataLang?.list_task_paused ?? "list_task_paused",
            number: 0,
            bgColor: "#FEF8EC",
            bgSmall: "#FF8F0D",
            percent: 0,
            key: "paused",
        },
        {
            title: dataLang?.list_task_canceled ?? "list_task_canceled",
            number: 0,
            bgColor: "#FFEEF0",
            bgSmall: "#EE1E1E",
            percent: 0,
            key: "pending",
        },
    ];


    return (
        <div className="grid grid-cols-5 gap-5">
            {data.map((e, i) => (
                <div className={`w-full p-4 rounded space-y-1.5`} style={{ backgroundColor: `${e.bgColor}` }} key={i}>
                    <h4 className="text-[#3A3E4C] font-normal text-sm">{e.title}</h4>
                    <div className="flex items-end justify-between">
                        <h6
                            className="flex flex-col items-center justify-center w-12 h-12 text-lg font-medium text-white rounded"
                            style={{ backgroundColor: `${e.bgSmall}` }}
                        >
                            {e.number}
                        </h6>
                        {e.percent > 0 ? (
                            <h6 className="font-[400] text-lg text-[#0BAA2E] flex space-x-0.5 items-center">
                                <span>{e.percent}%</span>
                                <ArrowUp size={20} />
                            </h6>
                        ) : (
                            <h6 className="font-[400] text-lg text-[#EE1E1E] flex space-x-0.5 items-center">
                                <span>{e.percent}%</span>
                                <ArrowDown size={20} />
                            </h6>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
});

export default ListTask