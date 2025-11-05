import apiReport from '@/Api/apiReport-Statistical/apiReport'
import { useQuery } from '@tanstack/react-query'

export const useGetListReportExportDelivery = (data) => {
  return useQuery({
    queryKey: ['api_get_list_report_export_delivery'],
    queryFn: () => apiReport.apiGetListReportExportDelivery({ params: data }),
  })
}
