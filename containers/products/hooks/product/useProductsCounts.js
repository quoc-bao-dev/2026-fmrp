import apiProducts from "@/Api/apiProducts/products/apiProducts";
import { useQuery } from "@tanstack/react-query";

export const useProductsCounts = (params) => {
    return useQuery({
        queryKey: ["api_products_counts", { ...params }],
        queryFn: async () => {
            const { data } = await apiProducts.apiProductsCounts({ params });
            return data.counts;
        }
    })
}