import apiReport from "@/Api/apiReport-Statistical/apiReport"
import { useQuery } from "@tanstack/react-query"

export const useGetSalesRevenue = data => {
  const fetchSalesRevenue = async () => {
    const response = await apiReport.apiGetSalesRevenue({ params: data })
    return response.data.output
  } 
  return useQuery({
    queryKey: ["api_get_sales_revenue", data],
    queryFn: fetchSalesRevenue,
  })
}