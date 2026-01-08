import apiReport from '@/Api/apiReport-Statistical/apiReport';
import { useQuery } from '@tanstack/react-query';

export const useGetDiaryOfRevenueAndExpenditure = data => {
  const fetchDiaryOfRevenueAndExpenditure = async () => {
    const response = await apiReport.apiGetDiaryOfRevenueAndExpenditure({ params: data });
    return response;
  };
  return useQuery({
    queryKey: ['api_get_diary_of_revenue_and_expenditure', data],
    queryFn: fetchDiaryOfRevenueAndExpenditure,
    enabled: !!data?.filter?.branch_ids
  });
};
