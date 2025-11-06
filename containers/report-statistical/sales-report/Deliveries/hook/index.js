import apiReport from "@/Api/apiReport-Statistical/apiReport"
import { useQuery } from "@tanstack/react-query"

export const useGetDeliveries = data => {
  const fetchDeliveries = async () => {
    const response = await apiReport.apiGetDeliveries({ params: data })
    return response.data.output
  } 
  return useQuery({
    queryKey: ["api_get_deliveries", data],
    queryFn: fetchDeliveries,
  })
}