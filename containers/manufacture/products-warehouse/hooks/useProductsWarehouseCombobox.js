import apiProductsWarehouse from "@/Api/apiManufacture/warehouse/productsWarehouse/apiProductsWarehouse";
import { useQuery } from "@tanstack/react-query";

export const useProductsWarehouseCombobox = (search) => {
    return useQuery({
        queryKey: ["api_products_warehouse_combobox", search],
        queryFn: async () => {
            const { result } = await apiProductsWarehouse.apiComboboxProductWarehouse("POST", { data: { term: search } });
            return result?.map((e) => ({ label: e.code, value: e.id })) || []
        }
    })
}