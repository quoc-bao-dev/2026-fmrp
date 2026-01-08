import apiInternalPlan from "@/Api/apiManufacture/manufacture/internalPlan/apiInternalPlan";
import { optionsQuery } from "@/configs/optionsQuery";
import { useQuery } from "@tanstack/react-query";

export const useStatusInternalPlan = (params) => {
    return useQuery({
        queryKey: ["api_status_internal_plan", { ...params }],
        queryFn: async () => {
            const { data } = await apiInternalPlan.apiGetStatusInternalPlan({ params: params });
            return data
        },
        ...optionsQuery
    })
}