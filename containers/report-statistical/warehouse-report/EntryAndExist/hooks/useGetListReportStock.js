import apiReport from '@/Api/apiReport-Statistical/apiReport'
import { useQuery } from '@tanstack/react-query'

export const useGetListReportStock = (data) => {
  return useQuery({
    queryKey: ['api_get_list_report_stock', data],
    queryFn: () => apiReport.apiGetListReportStock({ params: data }),
    enabled: !!data,
  })
} 