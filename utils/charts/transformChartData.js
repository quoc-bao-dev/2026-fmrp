import { useCallback } from "react";
import useSetingServer from "@/hooks/useConfigNumber";
import formatNumberConfig from "@/utils/helpers/formatnumber";

// utils/transformChartData.ts
export function transformChartData(data) {
    const dataSeting = useSetingServer();

    const formatNumber = useCallback((num) => formatNumberConfig(+num, dataSeting), [dataSeting]);

    const chartData = [];

    data?.forEach((item) => {
        const name = item?.item_name;
        const item_code = item?.item_code;

        chartData.push(
            { item_code: item_code, name, type: 'Đã xuất', value: formatNumber(item.quantity_exported) },
            { item_code: item_code, name, type: 'Còn lại', value: formatNumber(item.quantity_rest) },
            { item_code: item_code, name, type: 'Thu hồi', value: formatNumber(item.quantity_recovery) },
            { item_code: item_code, name, type: 'Kế hoạch', value: formatNumber(item.quantity_total_quota) }
        );
    });

    return chartData;
}
