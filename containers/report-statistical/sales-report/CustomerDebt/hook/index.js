import apiReport from '@/Api/apiReport-Statistical/apiReport';
import { useQuery } from '@tanstack/react-query';

export const useGetCustomerDebt = data => {
  const fetchCustomerDebt = async () => {
    const response = await apiReport.apiGetCustomerDebt({ params: data });
    return response.data?.output;
  };
  return useQuery({
    queryKey: ['api_get_customer_debt', data],
    queryFn: fetchCustomerDebt,
    enabled: !!data?.branch_ids && !!data?.client_id,
  });
};
