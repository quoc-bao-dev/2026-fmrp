import apiCategory from "@/Api/apiSettings/apiCategory"
import { optionsQuery } from "@/configs/optionsQuery"
import { keepPreviousData, useQuery } from "@tanstack/react-query"

export const useCategoryList = (url, params) => {
    return useQuery({
        queryKey: ["api_category_list", { ...params }],
        queryFn: async () => {
            const { rResult, output } = await apiCategory.apiListCategory(url, { params: params })
            return { rResult, output }
        },
        placeholderData: keepPreviousData,
        ...optionsQuery
    })
}

export const useCostCombobox = (open, id) => {
    return useQuery({
        queryKey: ["api_cost_combobox", open, id],
        queryFn: async () => {
            const { rResult } = await apiCategory.apiCostCombobox(id)
            return rResult.map((e) => ({
                label: e.name + " " + "(" + e.code + ")",
                value: e.id,
                level: e.level,
            }))
        },
        enabled: open,
        ...optionsQuery
    })

}