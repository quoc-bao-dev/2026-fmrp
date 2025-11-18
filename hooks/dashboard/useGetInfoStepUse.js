import apiDashboard from "@/Api/apiDashboard/apiDashboard";
import { optionsQuery } from "@/configs/optionsQuery";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const useGetInfoStepUse = () => {
    return useQuery({
        queryKey: ["api_get_info_step_use"],
        queryFn: async () => {
            const res = await apiDashboard.apiGetInfoStepUse();
            return res
        },
        placeholderData: keepPreviousData,
        ...optionsQuery
    })
}