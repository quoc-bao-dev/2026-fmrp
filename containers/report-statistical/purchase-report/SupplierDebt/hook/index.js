import apiReport from '@/Api/apiReport-Statistical/apiReport';
import apiSalesOrder from '@/Api/apiSalesExportProduct/salesOrder/apiSalesOrder';
import { useQuery } from '@tanstack/react-query';

export const useGetOrderProgress = data => {
  const fetchOrderProgress = async () => {
    const response = await apiReport.apiGetOrderProgress({ params: data });
    return response.data;
  };
  return useQuery({
    queryKey: ['api_get_order_progress', data],
    queryFn: fetchOrderProgress,
  });
};
