import apiReport from '@/Api/apiReport-Statistical/apiReport';
import { useQuery } from '@tanstack/react-query';

export const useGetSyntheticFund = data => {
  const fetchSyntheticFund = async () => {
    const response = await apiReport.apiGetAggregateFundBalance({ params: data });
    return response;
  };
  return useQuery({
    queryKey: ['api_get_synthetic_fund', data],
    queryFn: fetchSyntheticFund,
    enabled: !!data?.filter?.branch_ids
  });
};
