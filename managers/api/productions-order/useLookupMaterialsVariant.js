import apiProductionsOrders from "@/Api/apiManufacture/manufacture/productionsOrders/apiProductionsOrders";
import { useQuery } from "@tanstack/react-query";

export const useLookupMaterialsVariant = (params = null, queryOptions = {}) => {
  const fetchLookupMaterialsVariant = async () => {
    if (!params) return null;
    const response = await apiProductionsOrders.apiLookupMaterialsVariant({ params });
    return response.data;
  };

  return useQuery({
    queryKey: ["api_lookup_materials_variant", params],
    queryFn: fetchLookupMaterialsVariant,
    enabled: !!params,
    ...queryOptions,
  });
};