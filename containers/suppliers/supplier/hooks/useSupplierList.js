import apiSuppliers from "@/Api/apiSuppliers/suppliers/apiSuppliers";
import { optionsQuery } from "@/configs/optionsQuery";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const useSupplierList = (params) => {
    const { enabled, ...restParams } = params || {};

    return useQuery({
        queryKey: ["api_supplier_list", { ...restParams }],
        queryFn: async () => {

            const { rResult, output } = await apiSuppliers.apiListSuppliers({ params: restParams });

            return { rResult, output }
        },
        staleTime: 5 * 60 * 1000, // Cache 5 phút
        placeholderData: keepPreviousData,
        enabled: enabled !== undefined ? enabled : true,
        ...optionsQuery
    })
}