import apiReport from '@/Api/apiReport-Statistical/apiReport';
import { useQuery } from '@tanstack/react-query';

export const useGetExpense = data => {
  const fetchExpense = async () => {
    const response = await apiReport.apiGetExpense({ params: data });
    return response;
  };
  return useQuery({
    queryKey: ['api_get_expense', data],
    queryFn: fetchExpense,
    enabled: !!data?.filter?.branch_ids
  });
};
