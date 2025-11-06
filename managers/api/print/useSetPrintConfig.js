import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiPrint from '@/Api/apiPrint/apiPrint';
import useToast from '@/hooks/useToast';
import { useLanguageContext } from '@/context/ui/LanguageContext';

/**
 * Custom hook to set selected print template
 * @description Calls setConfig API and invalidates print config query
 * @param {Object} [options]
 * @param {Function} [options.onSuccess]
 * @param {Function} [options.onError]
 * @returns {{ setPrintConfig: Function, isLoading: boolean, data: any, error: any }}
 * @example
 * const { setPrintConfig, isLoading } = useSetPrintConfig();
 * await setPrintConfig({ config_print_tem: id });
 */
export const useSetPrintConfig = (options = {}) => {
  const showToast = useToast();
  const dataLang = useLanguageContext();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async payload => {
      const res = await apiPrint.setConfig(payload);
      return res;
    },
    onSuccess: data => {
      // Invalidate current config so UI refreshes selected status
      queryClient.invalidateQueries({ queryKey: ['apiPrintConfig'] });

      if (data?.isSuccess) {
        showToast('success', dataLang?.[data?.message] || 'Cập nhật mẫu in thành công');
        if (options.onSuccess) options.onSuccess(data);
      } else {
        showToast('error', dataLang?.[data?.message] || 'Cập nhật mẫu in thất bại');
      }
    },
    onError: error => {
      showToast('error', 'Có lỗi xảy ra khi cập nhật mẫu in');
      if (options.onError) options.onError(error);
    },
  });

  const setPrintConfig = async payload => {
    return mutation.mutateAsync(payload);
  };

  return {
    setPrintConfig,
    isLoading: mutation.isPending,
    data: mutation.data,
    error: mutation.error,
  };
};
