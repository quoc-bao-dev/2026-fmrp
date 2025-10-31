import apiReport from '@/Api/apiReport-Statistical/apiReport';
import { useQuery } from '@tanstack/react-query';
import { optionsQuery } from '@/configs/optionsQuery';

export const useGetSalesSummary = (data) => {
  const fetchSalesSummary = async () => {
    const response = await apiReport.apiGetSalesSummary({ params: data });
    return response.data;
  };
  return useQuery({
    queryKey: ['api_get_sales_summary', data],
    queryFn: fetchSalesSummary,
    ...optionsQuery
  });
};