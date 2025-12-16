import apiReport from '@/Api/apiReport-Statistical/apiReport';
import { useQuery } from '@tanstack/react-query';

export const useGetOrderTracking = data => {
  const fetchOrderTracking = async () => {
    const response = await apiReport.apiGetOrderTracking({ params: data });
    return response;
  };
  return useQuery({
    queryKey: ['api_get_order_tracking', data],
    queryFn: fetchOrderTracking,
    enabled: !!data?.filter?.branch_ids
  });
};
