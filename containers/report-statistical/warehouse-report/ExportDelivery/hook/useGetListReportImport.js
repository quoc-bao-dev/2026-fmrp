import apiReport from '@/Api/apiReport-Statistical/apiReport'
import { useQuery } from '@tanstack/react-query'

export const useGetListReportImport = (data) => {
  return useQuery({
    queryKey: ['api_get_list_report_import'],
    queryFn: () => apiReport.apiGetListReportImport({ params: data }),
  })
}
