import apiReport from '@/Api/apiReport-Statistical/apiReport';
import { useQuery } from '@tanstack/react-query';

export const useGetBOMs = data => {
  const fetchBOMs = async () => {
    const response = await apiReport.apiGetBOMs({ params: data });
    return response.data;
  };
  return useQuery({
    queryKey: ['api_get_bom_materials', data],
    queryFn: fetchBOMs,
  });
};
