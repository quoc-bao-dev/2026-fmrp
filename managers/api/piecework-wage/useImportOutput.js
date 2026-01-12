import apiProductionsOrders from '@/Api/apiManufacture/manufacture/productionsOrders/apiProductionsOrders';
import apiImportOutput from '@/Api/apiPieceworkWage/import-output/apiImportOutput';
import useToast from '@/hooks/useToast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

//Danh sách công đoạn
export const useListImportOutput = params => {
  const showToast = useToast();
  const fetchListImportOutput = async () => {
    const response = await apiImportOutput.apiListImportOutput({ params: params });
    if (response.isSuccess === false) {
      showToast('error', response?.message);
    }
    return response.data;
  };
  return useQuery({
    queryKey: ['api_list_import_output', { ...params }],
    queryFn: fetchListImportOutput,
  });
};

//Gọi thêm các công đoạn nếu nhiều
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

//Gọi danh sách công đoạn
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

//Gọi danh sách công đoạn trong popup
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

//Thêm người phụ trách vào công đoạn
export const useSavePomStages = (options = {}) => {
  const showToast = useToast();
  const queryClient = useQueryClient();

  const fetchSavePomStages = async params => {
    const response = await apiImportOutput.apiSavePomStages({ params });
    return response;
  };

  // Lưu onSuccess từ options để merge với logic của hook
  const { onSuccess: onSuccessFromOptions, ...restOptions } = options;

  return useMutation({
    mutationFn: fetchSavePomStages,
    onSuccess: data => {
      // Logic của hook: showToast và invalidateQueries
      if (data?.isSuccess) {
        showToast('success', data?.message);
        queryClient.invalidateQueries({ queryKey: ['api_list_import_output'] });
      } else {
        showToast('error', data?.message);
      }
      // Gọi callback từ options nếu có
      onSuccessFromOptions?.(data);
    },
    ...restOptions,
  });
};

//Danh sách nhân viên phụ trách
export const useListPomStages = (params, options = {}) => {
  const fetchListPomStages = async () => {
    const response = await apiImportOutput.apiListPomStages({ params: params });
    return response.data;
  };
  return useQuery({
    queryKey: ['api_list_pom_stages', { ...params }],
    queryFn: fetchListPomStages,
    ...options, // Cho phép truyền các options như enabled, refetchOnMount, etc.
  });
};

// Lưu nhân viên chi tiết
export const useSavePomStagesDetail = (options = {}) => {
  const showToast = useToast();
  const queryClient = useQueryClient();
  const { onSuccess: onSuccessFromOptions, ...restOptions } = options;

  return useMutation({
    mutationFn: async params => {
      const response = await apiImportOutput.apiSavePomStagesDetail({ params });
      return response;
    },
    onSuccess: data => {
      if (data?.isSuccess) {
        showToast('success', data?.message);
        queryClient.invalidateQueries({ queryKey: ['api_list_import_output'] });
      } else {
        showToast('error', data?.message);
      }
      onSuccessFromOptions?.(data);
    },
    ...restOptions,
  });
};
