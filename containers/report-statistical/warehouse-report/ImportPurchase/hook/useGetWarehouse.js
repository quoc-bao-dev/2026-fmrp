import apiReport from "@/Api/apiReport-Statistical/apiReport";
import { useQuery } from "@tanstack/react-query";

export const useGetWarehouse = () => {
  return useQuery({
    queryKey: ["api_get_warehouse"],
    queryFn: () => apiReport.apiGetWarehouse(),
  });
};