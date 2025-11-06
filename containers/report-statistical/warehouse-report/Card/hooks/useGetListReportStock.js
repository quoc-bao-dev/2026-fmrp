import apiReport from '@/Api/apiReport-Statistical/apiReport';
import { useQuery } from '@tanstack/react-query';

export const useGetCardStock = ({ data, enabled }) => {
  const hasBranch = data?.filter?.branch_ids && (Array.isArray(data.filter.branch_ids) ? data.filter.branch_ids.length > 0 : true)
  const fetchCardStock = async () => {
    const response = await apiReport.apiGetCardStock({ params: data });
    return response.data;
  };
  return useQuery({
    queryKey: ['api_get_card_stock', data],
    queryFn: fetchCardStock,
    enabled: !!enabled && !!hasBranch,
    staleTime: 5 * 60 * 1000, // 5 phút
    cacheTime: 10 * 60 * 1000, // 10 phút
  });
};
