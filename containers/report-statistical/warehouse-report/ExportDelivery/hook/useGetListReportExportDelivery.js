import apiReport from '@/Api/apiReport-Statistical/apiReport'
import { useQuery } from '@tanstack/react-query'

export const useGetListReportExportDelivery = (data) => {
  const hasBranch = data?.filter?.branch_ids && (Array.isArray(data.filter.branch_ids) ? data.filter.branch_ids.length > 0 : true)
  return useQuery({
    queryKey: ['api_get_list_report_export_delivery', data],
    queryFn: () => apiReport.apiGetListReportExportDelivery({ params: data }),
    enabled: !!hasBranch,
    staleTime: 5 * 60 * 1000, // 5 phút
    cacheTime: 10 * 60 * 1000, // 10 phút
  })
}
