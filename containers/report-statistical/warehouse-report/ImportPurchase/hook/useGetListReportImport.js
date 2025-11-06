import apiReport from '@/Api/apiReport-Statistical/apiReport'
import { useQuery } from '@tanstack/react-query'

export const useGetListReportImport = (data) => {
  return useQuery({
    queryKey: ['api_get_list_report_import_purchase', data],
    queryFn: () => apiReport.apiGetListReportImport({ params: data }),
    staleTime: 5 * 60 * 1000, // 5 phút
    cacheTime: 10 * 60 * 1000, // 10 phút
  })
}
