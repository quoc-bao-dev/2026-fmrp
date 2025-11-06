import apiComons from "@/Api/apiComon/apiComon";
import { optionsQuery } from "@/configs/optionsQuery";
import { useQuery } from "@tanstack/react-query";

export const useInternalPlanItems = (idBranch, search) => {
    return useQuery({
        queryKey: ["api_internal_plan_items", idBranch, search],
        queryFn: async () => {
            const { data } = await apiComons.apiSearchProductsVariant({
                params: {
                    "filter[branch_id]": idBranch !== null ? +idBranch.value : null,
                },
                data: {
                    term: search,
                }
            });
            return data?.result?.map((e) => ({
                label: `${e.name}
                    <spa style={{display: none}}>${e.code}</spa
                    <span style={{display: none}}>${e.text_type} ${e.unit_name} </span>`,
                value: e.id,
                e,
            })) || [];
        },
        enabled: !!idBranch,
        ...optionsQuery
    })
}