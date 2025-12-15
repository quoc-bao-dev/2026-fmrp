import apiProductionsOrders from "@/Api/apiManufacture/manufacture/productionsOrders/apiProductionsOrders";
import { useQuery } from "@tanstack/react-query";

export const useListSuggestPo = (data) => {
  return useQuery({
    queryKey: ["api_list_suggest_po", data],
    queryFn: async () => {
      const response = await apiProductionsOrders.apiListSuggestPo({data: data});
      return response.data;
    },
    enabled: !!data && !!data.po_id && Array.isArray(data.poi_ids) && data.poi_ids.length > 0,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always"
  });
};