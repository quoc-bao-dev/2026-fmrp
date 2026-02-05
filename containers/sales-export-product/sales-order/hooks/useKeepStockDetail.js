import apiSalesOrder from "@/Api/apiSalesExportProduct/salesOrder/apiSalesOrder";
import { optionsQuery } from "@/configs/optionsQuery";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const useKeepStockDetail = (open, id) => {
    return useQuery({
        queryKey: ['api_keep_stock_detail', id],
        queryFn: async () => {
            const db = await apiSalesOrder.apiDetailKeepStockOrder(id);
            return db
        },
        enabled: open && !!id,
        ...optionsQuery
    })
}
