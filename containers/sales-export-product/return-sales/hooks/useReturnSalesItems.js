import apiReturnSales from '@/Api/apiSalesExportProduct/returnSales/apiReturnSales'
import { useQuery } from '@tanstack/react-query'

export const useReturnSalesItems = (params, enabled = true) => {
  return useQuery({
    queryKey: ['api_return_sales_items', { ...params }],
    queryFn: async () => {
      const {
        data: { result },
      } = await apiReturnSales.apiDeliveriItems({ params: params })
      return result || []
    },
    enabled,
  })
}
