import apiReport from '@/Api/apiReport-Statistical/apiReport'
import { useQuery } from '@tanstack/react-query'

export const useGetListReportImportFinishedGoods = (data) => {
  return useQuery({
    queryKey: ['api_get_list_report_import_finished_goods', data],
    queryFn: () => apiReport.apiGetListReportImportFinishedGoods({ params: data }),
    staleTime: 5 * 60 * 1000, // 5 phút
    cacheTime: 10 * 60 * 1000, // 10 phút
  })
}
