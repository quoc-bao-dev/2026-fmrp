import NoData from '@/components/UI/noData/nodata';
import { useGetTop5Customers } from '@/hooks/dashboard/useGetTop5Customers';
import useSetingServer from '@/hooks/useConfigNumber';
import formatNumberConfig from "@/utils/helpers/formatnumber";
import dynamic from "next/dynamic";

const Bar = dynamic(() => import("@ant-design/plots").then(({ Bar }) => Bar), { ssr: false, });

const BarChart = (props) => {
    const { dataLang } = props

    const { data: dataTop, isLoading } = useGetTop5Customers()

    const dataSeting = useSetingServer();

    const formatNumber = (number) => {
        return formatNumberConfig(+number, dataSeting);
    };

    const config = {
        data: dataTop?.data?.items ? dataTop?.data?.items : [],
        isGroup: true,
        xField: "total_quantity",
        yField: "name",
        marginRatio: 0,
        label: {
            position: "right",
            offset: 4,
        },
        meta: {
            total_quantity: {
                alias: dataLang?.bar_chart_production ?? "bar_chart_production",
                formatter: (val) => `${formatNumber(val)}`

            },
        }, // Đổi tên
        appendPadding: [10],
        barStyle: {
            radius: [2, 2, 0, 0],
        },
        animation: {
            appear: {
                animation: "path-in",
                duration: 5000,
            },
        },
        minBarWidth: 16,
        maxBarWidth: 16,
    };

    return (
        <div className="p-3 space-y-4 border rounded-lg bg-slate-50/60 border-slate-50">
            <div className="mt-[12px] mb-[24px] mx-2 ">
                <div className="flex items-center justify-between">
                    <h2>{dataLang?.bar_chart_top_5_customers_highest_production ?? "bar_chart_top_5_customers_highest_production"}</h2>
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
                        dataTop?.data?.items?.length > 0
                            ?
                            <div className="rounded-md bg-[#F9FAFB] w-full ">
                                <div className="mt-[28px]">
                                    <Bar {...config} />{" "}
                                </div>
                            </div>
                            :
                            <NoData type='dashboard' />
                }
            </div>
        </div>
    );
};

export default BarChart