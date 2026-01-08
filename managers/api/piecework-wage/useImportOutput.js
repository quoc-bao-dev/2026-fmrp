import apiProductionsOrders from '@/Api/apiManufacture/manufacture/productionsOrders/apiProductionsOrders';
import apiImportOutput from '@/Api/apiPieceworkWage/import-output/apiImportOutput';
import { useQuery } from '@tanstack/react-query';

export const useListImportOutput = params => {
  const fetchListImportOutput = async () => {
    const response = await apiImportOutput.apiListImportOutput({ params: params });
    return response.data;
  };
  return useQuery({
    queryKey: ['api_list_import_output', { ...params }],
    queryFn: fetchListImportOutput,
  });
};

export const useListImportOutputItems = (params, options = {}) => {
  const fetchListImportOutputItems = async () => {
    const response = await apiImportOutput.apiListImportOutputItems({ params: params });
    return response.data;
  };
  return useQuery({
    queryKey: ['api_list_import_output_items', { ...params }],
    queryFn: fetchListImportOutputItems,
    ...options, // Cho phép truyền các options như enabled, refetchOnMount, etc.
  });
};

export const useLookupStages = data => {
  const fetchLookupStages = async () => {
    const response = await apiImportOutput.apiLookupStages({ params: data });
    return response.data;
  };
  return useQuery({
    queryKey: ['api_lookup_stages', { ...data }],
    queryFn: fetchLookupStages,
  });
};

export const useActiveStages = (params, options = {}) => {
  const fetchActiveStages = async () => {
    const response = await apiProductionsOrders.apiActiveStages({ params: params });
    return response.data;
  };
  return useQuery({
    queryKey: ['api_active_stages', { ...params }],
    queryFn: fetchActiveStages,
    ...options,
  });
};
