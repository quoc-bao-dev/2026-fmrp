import apiSuppliers from "@/Api/apiSuppliers/suppliers/apiSuppliers";
import { useQuery } from "@tanstack/react-query";

export const useSupplierGroupSupplier = (key, enabled = true) => {
    return useQuery({
        queryKey: ["api_supplier_group_supplier", key],
        queryFn: async () => {

            const params = {
                "filter[branch_id]": key?.length > 0 ? key?.map((e) => e.value) : -1,
            }

            const { rResult } = await apiSuppliers.apiGroupSuppliers({ params: params });

            return rResult?.map((e) => ({ label: e.name, value: e.id })) || []
        },
        enabled: enabled,
    })
}