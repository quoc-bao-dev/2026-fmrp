import CalendarDropdown, { timeRanges } from "@/components/common/dropdown/CalendarDropdown";
import { useGetTop5Customers } from "@/hooks/dashboard/useGetTop5Customers";
import { handleTicksBarChart } from "@/utils/helpers/deviceTicksChart";
import { getDateRangeFromValue } from "@/utils/helpers/getDateRange";
import React, { useEffect, useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

const BarChartHorizontal = () => {
    const [ticks, setTicks] = useState([0, 800, 1600, 2400, 3200]);
    const [customers, setCustomers] = useState();
    const [dateStart, setDateStart] = useState("");
    const [dateEnd, setDateEnd] = useState("");
    const [date, setDate] = useState(timeRanges[4]);

    const { data, isLoading } = useGetTop5Customers({
        limited: 5,
        dateEnd: dateEnd,
        dateStart: dateStart,

    });

    useEffect(() => {
        if (date) {
            const range = getDateRangeFromValue(date.value);
            setDateStart(range ? range.startDate : "");
            setDateEnd(range ? range.endDate : "");
        }
    }, [date]);

    useEffect(() => {
        if (!isLoading && data) {
            setCustomers(data?.items);
            const allValues = data?.items?.flatMap((item) => [
                item.total_quantity
            ]);
            const dynamicTicks = allValues?.length > 0 ? handleTicksBarChart(allValues) : [0, 800, 1600, 2400, 3200];
            setTicks(dynamicTicks);
        }
    }, [isLoading, data]);

    return (
        <div className="xlg:p-6 p-3  rounded-2xl bg-neutral-00 w-full shadow-[0px_12px_24px_-4px_rgba(145,158,171,0.12),0px_0px_2px_0px_rgba(145,158,171,0.20)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-6">
                <h2 className="flex-1 capitalize text-lg font-medium  text-typo-black-1">
                    Top 5 Khách Hàng Có Sản Lượng Nhiều Nhất
                </h2>
                <CalendarDropdown setState={setDate} />
            </div>

            <ResponsiveContainer width="100%" height={316}>
                <BarChart
                    data={customers}
                    layout="vertical"
                    margin={{ top: 30, right: 40, left: 0, bottom: 0 }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        horizontal={false}
                        vertical={true}
                    />
                    <XAxis
                        type="number"
                        axisLine={false}
                        tickLine={false}
                        // domain={[0, 3200]}
                        domain={[0, ticks[ticks.length - 1]]}
                        ticks={ticks}
                        tick={{ fontSize: 12, fill: "#9295A4" }}
                        dy={3}
                        label={{
                            value: "Sản lượng",
                            position: "insideLeft",
                            offset: -40,
                            style: { textAnchor: "middle", fill: "#667085", fontSize: 12 },
                        }}
                        tickFormatter={(value) => value.toLocaleString()}
                    />
                    <YAxis
                        type="category"
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        width={120}
                        tick={{
                            fontSize: 11,
                            fill: "#9295A4",
                        }}
                        tickFormatter={(value) => value.toString()}
                        label={{
                            value: "Khách hàng",
                            position: "top",
                            offset: 10,
                            dx: 20,
                            style: { textAnchor: "", fill: "#667085", fontSize: 12 },
                        }}
                    />
                    <Tooltip
                        formatter={(value) => value.toLocaleString()}
                        cursor={false}
                        content={({ active, payload, coordinate }) => {
                            if (active && payload && payload.length) {
                                return (
                                    <div className="relative">
                                        <div
                                            className="bg-neutral-900 text-white py-1 px-3 rounded-md shadow-md"
                                            style={{
                                                position: "absolute",
                                                left: coordinate?.x != null ? coordinate.x + 20 : 0,
                                                top: coordinate?.y != null ? coordinate.y - 15 : 0,
                                            }}
                                        >
                                            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[8px] border-r-neutral-900 border-b-[6px] border-b-transparent" />

                                            <p className="text-sm font-medium">{payload[0].value.toLocaleString()}</p>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Bar
                        dataKey="total_quantity"
                        fill="#1E88E5"
                        barSize={8}
                        radius={[0, 4, 4, 0]}
                        name="Sản lượng"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default BarChartHorizontal;
