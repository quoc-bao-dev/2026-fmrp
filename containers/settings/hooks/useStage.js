import apiCategory from '@/Api/apiSettings/apiCategory';
import useToast from '@/hooks/useToast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useStageStaff = params => {
  const fetchData = async () => {
    const data = await apiCategory.apiStageStaff({ params });
    return data.data;
  };

  return useQuery({
    queryKey: ['api_stage_staffs', { ...params }],
    queryFn: fetchData,
    enabled: !!params?.stage_id,
  });
};

export const useDeleteStageStaff = params => {
  const queryClient = useQueryClient();
  const showToast = useToast();

  return useMutation({
    mutationFn: id => apiCategory.apiDeleteStageStaff(id),
    onSuccess: res => {
      if (res?.isSuccess === 1) {
        showToast('success', res?.message || 'Xóa nhân viên khỏi công đoạn thành công');
        queryClient.invalidateQueries({ queryKey: ['api_stage_staffs', { ...params }] });
        return;
      }

      showToast('error', res?.message || 'Xóa nhân viên thất bại');
    },
    onError: () => {
      showToast('error', 'Có lỗi xảy ra khi xóa nhân viên');
    },
  });
};
