import apiReport from '@/Api/apiReport-Statistical/apiReport'
import { useQuery } from '@tanstack/react-query'

export const useGetListReportExportManufacture = (data) => {
  return useQuery({
    queryKey: ['api_get_list_report_export_manufacture', data],
    queryFn: () => apiReport.apiGetListReportExportManufacture({ params: data }),
    staleTime: 5 * 60 * 1000, // 5 phút
    cacheTime: 10 * 60 * 1000, // 10 phút
  })
}
