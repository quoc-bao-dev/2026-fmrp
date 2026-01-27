import apiWarehouse from "@/Api/apiManufacture/warehouse/apiWarehouse/apiWarehouse";
import { optionsQuery } from "@/configs/optionsQuery";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const useWarehouseList = (params) => {
    return useQuery({
        queryKey: ["api_warehouse_list", { ...params }],
        queryFn: async () => {
            const { rResult, output } = await apiWarehouse.apiListWarehouse({ params });

            return { rResult, output }
        },
        placeholderData: keepPreviousData,
        ...optionsQuery
    })
}