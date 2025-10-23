import apiReport from '@/Api/apiReport-Statistical/apiReport';
import { useQuery } from '@tanstack/react-query';

export const useGetRawMaterialsUsed = data => {
  const fetchRawMaterialsUsed = async () => {
    const response = await apiReport.apiGetRawMaterialsUsed({ params: data });
    return response.data;
  };
  return useQuery({
    queryKey: ['api_get_raw_materials_used', data],
    queryFn: fetchRawMaterialsUsed,
  });
};

export const useGetMaterialsLookup = search => {
  const fetchMaterialsLookup = async () => {
    const response = await apiReport.apiGetMaterialsLookup(search);
    return response.data.materials;
  };
  return useQuery({
    queryKey: ['api_get_materials_lookup', search],
    queryFn: fetchMaterialsLookup,
  });
};
