import ButtonAnimationNew from "@/components/common/button/ButtonAnimationNew";
import ExcelFileComponent from "@/components/common/excel/ExcelFileComponent";
import Loading from "@/components/UI/loading/loading";
import useSetingServer from "@/hooks/useConfigNumber";
import formatNumberConfig from "@/utils/helpers/formatnumber";
import dynamic from "next/dynamic";
import { memo, useCallback, useMemo, useRef } from "react";
import { PiImageBold, PiTable } from "react-icons/pi";

const Bar = dynamic(() => import("@ant-design/plots").then(({ Bar }) => Bar), { ssr: false });

const StackedBarChart = memo(({ rawData, dataLang, multiDataSet, isLoadingMaterialOutput }) => {
    const chartInstanceRef = useRef(null);

    const onReady = (plot) => {
        chartInstanceRef.current = plot;
    };
    const dataSeting = useSetingServer();

    const formatNumber = useCallback((num) => formatNumberConfig(+num, dataSeting), [dataSeting]);

    const data = useMemo(() => {
        const chartData = [];

        rawData?.forEach((item) => {
            const name = item?.item_name;
            const item_code = item?.item_code;

            chartData.push(
                // { item_code, name, type: 'Đã xuất', value: formatNumber(item.quantity_exported) },
                // { item_code, name, type: 'Còn lại', value: formatNumber(item.quantity_rest) },
                // { item_code, name, type: 'Thu hồi', value: formatNumber(item.quantity_recovery) },
                // { item_code, name, type: 'Kế hoạch', value: formatNumber(item.quantity_total_quota) },
                { item_code, name, type: 'Đã xuất', value: +item.quantity_exported },
                { item_code, name, type: 'Còn lại', value: +item.quantity_rest },
                { item_code, name, type: 'Thu hồi', value: +item.quantity_recovery },
                { item_code, name, type: 'Kế hoạch', value: +item.quantity_total_quota }
            );
        });

        return chartData;
    }, [rawData, formatNumber]);

    const config = {
        data,
        // autoFit: true,
        isRange: true,
        isStack: true,
        xField: 'value', // value phải là [start, end]
        yField: 'item_code',
        seriesField: 'type',
        color: ({ type }) => {
            const colors = {
                'Kế hoạch': '#0375F3',
                'Đã xuất': '#1FC583',
                'Còn lại': '#8571F4',
                'Thu hồi': '#FF8F0D'
            };
            return colors[type];
        },
        // barStyle: ({ type }) => {

        //     const radiusMap = {
        //         'Đã xuất': [8, 8, 8, 8],       // đầu trái
        //         'Còn lại': [8, 8, 8, 8],
        //         'Thu hồi': [8, 8, 8, 8],
        //         'Kế hoạch': [8, 8, 8, 8],     // cuối phải
        //     };

        //     return {
        //         lineWidth: 1,
        //         radius: radiusMap[type] || [0, 0, 0, 0],
        //     };
        // },
        barWidthRatio: 0.5,
        minBarWidth: 16,
        maxBarWidth: 20,
        marginRatio: 0.05, // 🔥 giảm khoảng cách giữa bar
        appendPadding: [10, 10, 10, 10], // giảm padding tổng thể
        // tooltip: {
        //     shared: true,
        //     showMarkers: false,
        //     customContent: (title, items) => {
        //         return `
        //             <div class="p-2">
        //                 <div class="font-bold text-blue-500">${title}</div>
        //                     ${items.map((item) => `
        //                     <div class="flex justify-between text-sm text-gray-700">
        //                         <span>${item.name}</span>
        //                         <span>${formatNumber(item.value)}</span>
        //                     </div>`
        //         ).join('')}
        //             </div>`;
        //     },
        // },
        legend: {
            position: 'bottom',       // đưa xuống dưới
            layout: 'horizontal',     // các item nằm ngang
            align: 'start',            // căn trái
            itemSpacing: 16,          // khoảng cách giữa các item
            itemName: {
                style: {
                    fontSize: 13,
                    fill: '#3A3E4C',
                    fontWeight: 500,
                },
            },
            marker: {
                symbol: 'circle',       // hình tròn
                style: {
                    r: 6,                 // bán kính marker
                    d: 10
                },
            },
        },

        // label: {
        //     position: 'middle',
        //     content: ({ value }) => `${formatNumber(value)}`,
        //     style: {
        //         fill: '#fff',
        //         fontWeight: 500,
        //     },
        // },

        interactions: [
            { type: 'tooltip' }, // vẫn giữ tooltip
        ],
        state: {
            active: {
                style: {
                    opacity: 1,
                    stroke: '#00000000', // không có viền
                },
            },
            inactive: {
                style: {
                    opacity: 1, // 👈 ngăn không cho bị làm mờ khi không active
                },
            },
        },
    };

    const handleExportPNG = useCallback(() => {
        const chart = chartInstanceRef.current;
        if (!chart) return;

        // Cách 1 (dễ nhất): dùng API gốc của G2Plot
        chart.downloadImage?.("chart", "image/png");

        // Cách 2: dùng dataURL (nếu cần custom)
        // const dataUrl = chart.toDataURL?.("image/png");
        // if (dataUrl) {
        //   const link = document.createElement("a");
        //   link.download = "chart.png";
        //   link.href = dataUrl;
        //   link.click();
        // } else {
        //   console.error("Không thể lấy hình ảnhs từ chart.");
        // }
    }, []);

    return (
        <div className="bg-white w-full min-h-[330px] px-4 pt-4 pb-2">
            {
                isLoadingMaterialOutput ?
                    <Loading className='3xl:h-full 2xl:h-full xl:h-full h-full col-span-16' />
                    :
                    <div ref={chartInstanceRef} className="chart-wrapper" >
                        <Bar {...config} onReady={(plot) => chartInstanceRef.current = plot} />
                    </div>
            }
            <div className="flex justify-end gap-2 mt-4">
                {/* <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-100">📤 Xuất PNG</button> */}
                {/* <button className="px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-100">📊 Xuất Excel</button> */}
                <ButtonAnimationNew
                    onClick={handleExportPNG}
                    icon={
                        <PiImageBold className='xl:size-4 size-3.5' />
                    }
                    title="Xuất PNG"
                    className="3xl:h-10 h-9 xl:px-4 px-2 flex items-center gap-2 xl:text-sm text-xs font-medium text-[#11315B] border border-[#D0D5DD] hover:bg-[#F7F8F9] hover:shadow-hover-button rounded-lg"
                />
                <ExcelFileComponent
                    dataLang={dataLang}
                    filename={"Danh sách dữ liệu thu hồi NVL"}
                    multiDataSet={multiDataSet}
                    title="DSDL Thu hồi NVL"
                >
                    <ButtonAnimationNew
                        icon={
                            <PiTable className='xl:size-4 size-3.5' />
                        }
                        title="Xuất Excel"
                        className="3xl:h-10 h-9 xl:px-4 px-2 flex items-center gap-2 xl:text-sm text-xs font-medium text-[#11315B] border border-[#D0D5DD] hover:bg-[#F7F8F9] hover:shadow-hover-button rounded-lg"
                    />
                </ExcelFileComponent>
            </div>
        </div>
    )
})

export default StackedBarChart;