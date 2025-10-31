import apiReport from '@/Api/apiReport-Statistical/apiReport';
import { useQuery } from '@tanstack/react-query';
import { optionsQuery } from '@/configs/optionsQuery';

export const useGetProductionSummary = (data) => {
  const fetchProductionSummary = async () => {
    const response = await apiReport.apiGetProductionSummary({ params: data });
    return response.data;
  };
  return useQuery({
    queryKey: ['api_get_production_summary', data],
    queryFn: fetchProductionSummary,
    ...optionsQuery
  });
};