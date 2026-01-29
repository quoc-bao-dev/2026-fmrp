import apiComons from '@/Api/apiComon/apiComon'
import apiStaff from '@/Api/apiPersonnel/apiStaff'
import { optionsQuery } from '@/configs/optionsQuery'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// danh sách nhân viên theo chi nhánh
export const useStaffComboboxByBranch = (params) => {
  return useQuery({
    queryKey: ['api_staff_branch', { ...params }],
    queryFn: async () => {
      const { data } = await apiComons.apiStaffBranch({ params })

      return data?.staffs?.map((e) => ({ label: e.full_name, value: e.staffid }))
    },
    ...optionsQuery,
  })
}
/// nhân viên
export const useStaffOptions = (params = {}) => {
  return useQuery({
    queryKey: ['api_staff_options', { ...params }],
    queryFn: async () => {
      const { rResult } = await apiComons.apiStaffOption({ params })

      return rResult?.map((e) => ({ label: e.name, value: e.staffid })) || []
    },
  })
}

/**
 * Custom hook for searching staffs (combobox)
 * @description Manages staff search operations with loading states and error handling for combobox usage
 * @param {Object} [options] - Hook options
 * @param {number[]} [options.branch_ids] - Array of branch IDs to filter staffs
 * @param {boolean} [options.enabled=true] - Whether the query is enabled
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @returns {Object} Hook return object
 * @returns {Object} returns.data - Response data with structure: { isSuccess: number, message: string, branch_name: string, data: { staffs: Array } }
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {Error} returns.error - Error object if any
 * @example
 * // Basic usage
 * const { data, isLoading, error } = useSearchStaffs({
 *   branch_ids: [1, 2],
 *   enabled: true,
 *   onSuccess: (response) => console.log('Staffs loaded successfully'),
 *   onError: (error) => console.error('Failed to load staffs')
 * });
 *
 * // Use in combobox
 * const staffOptions = data?.data?.staffs?.map((staff) => ({
 *   label: staff.full_name,
 *   value: staff.staffid
 * })) || [];
 */
export const useSearchStaffs = (options = {}) => {
  const { branch_ids, po_id, enabled = true, onSuccess, onError } = options;

  return useQuery({
    queryKey: ['api_search_staffs', { branch_ids, po_id }],
    queryFn: async () => {
      const params = branch_ids ? { branch_ids, po_id } : undefined;
      const res = await apiStaff.apiSearchStaffs(params);
      
      if (res?.isSuccess === 1 && onSuccess) {
        onSuccess(res);
      } else if (res?.isSuccess !== 1 && onError) {
        onError(new Error(res?.message || 'Failed to search staffs'));
      }
      
      return res;
    },
    enabled,
    ...optionsQuery,
  });
}

/**
 * Custom hook for fetching group members
 * @description Get list of groups with their members and branch information
 * @param {Object} [options] - Hook options
 * @param {boolean} [options.enabled=true] - Whether the query is enabled
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @returns {Object} Hook return object
 * @returns {Object} returns.data - Response data with structure: { rResult: GroupMember[], output: OutputData }
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {Error} returns.error - Error object if any
 * @example
 * // Basic usage
 * const { data, isLoading, error } = useGroupMembers();
 * 
 * // With callbacks
 * const { data } = useGroupMembers({
 *   onSuccess: (res) => console.log('Groups loaded:', res.rResult),
 *   onError: (err) => console.error('Failed:', err)
 * });
 */
export const useGroupMembers = (options = {}) => {
  const {
    enabled = true,
    onSuccess,
    onError,
    params,
  } = options;

  const normalizedParams = {
    branch_id:
      params?.branch_id && Array.isArray(params.branch_id)
        ? params.branch_id
        : [],
    id_group_members:
      params?.id_group_members && Array.isArray(params.id_group_members)
        ? params.id_group_members
        : [],
    search: params?.search || '',
    limit: params?.limit || undefined,
    page: params?.page || undefined,
  };

  return useQuery({
    queryKey: ['api_staff_group_members', normalizedParams],
    queryFn: async () => {
      const hasFilters =
        normalizedParams.branch_id.length > 0 ||
        normalizedParams.id_group_members.length > 0 ||
        !!normalizedParams.search ||
        !!normalizedParams.limit ||
        !!normalizedParams.page;

      const res = await apiStaff.apiGroupMembers(
        hasFilters ? normalizedParams : {}
      );

      if (onSuccess) {
        onSuccess(res);
      }

      if (onError && res?.output?.iTotalDisplayRecords === "0") {
        onError(new Error('No groups found'));
      }

      return res;
    },
    enabled,
    ...optionsQuery,
  });
}

/**
 * Custom hook for creating group member
 * @description Create a new group with staff members using FormData
 * @param {Object} [options] - Hook options
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @param {boolean} [options.invalidateQueries=true] - Whether to invalidate group members query after success
 * @returns {Object} Hook return object
 * @returns {Function} returns.mutate - Mutation function: (payload: { name: string, code?: string, id_staff: number[], branch_id: number }) => void
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {boolean} returns.isSuccess - Success state
 * @returns {boolean} returns.isError - Error state
 * @returns {Object} returns.data - Response data
 * @returns {Error} returns.error - Error object if any
 * @example
 * // Basic usage
 * const { mutate, isLoading, isSuccess } = useCreateGroupMember({
 *   onSuccess: (data) => {
 *     console.log('Group created:', data);
 *   },
 *   onError: (error) => {
 *     console.error('Failed:', error);
 *   }
 * });
 * 
 * // Call mutation
 * mutate({
 *   name: "Nhóm Gia Công",
 *   code: "N1",
 *   id_staff: [1, 2, 3],
 *   branch_id: 44
 * });
 */
export const useCreateGroupMember = (options = {}) => {
  const queryClient = useQueryClient();
  const {
    onSuccess: onSuccessCallback,
    onError: onErrorCallback,
    invalidateQueries = true,
  } = options;

  return useMutation({
    mutationKey: ['api_staff_create_group_member'],
    mutationFn: async (payload) => {
      const res = await apiStaff.apiCreateGroupMember(payload);
      
      // Kiểm tra isSuccess có thể là true (boolean) hoặc 1 (number)
      if (res?.isSuccess === true || res?.isSuccess === 1) {
        // Invalidate và refetch group members query để cập nhật danh sách
        if (invalidateQueries) {
          await queryClient.invalidateQueries({ queryKey: ['api_staff_group_members'] });
          // Refetch ngay để đảm bảo data được cập nhật
          await queryClient.refetchQueries({ queryKey: ['api_staff_group_members'] });
        }
        
        if (onSuccessCallback) {
          onSuccessCallback(res);
        }
      } else {
        const error = new Error(res?.message || 'Failed to create group member');
        if (onErrorCallback) {
          onErrorCallback(error);
        }
        throw error;
      }
      
      return res;
    },
  });
}

/**
 * Custom hook for updating group member
 * @description Update an existing group member by ID and automatically refetch the group members list
 * @param {Object} [options] - Hook options
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @param {boolean} [options.invalidateQueries=true] - Whether to invalidate group members query after success
 * @returns {Object} Hook return object
 * @returns {Function} returns.mutate - Mutation function: ({ id: string | number, payload: { name: string, code?: string, id_staff: number[], branch_id: number } }) => void
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {boolean} returns.isSuccess - Success state
 * @returns {boolean} returns.isError - Error state
 * @returns {Object} returns.data - Response data
 * @returns {Error} returns.error - Error object if any
 * @example
 * // Basic usage
 * const { mutate, isLoading, isSuccess } = useUpdateGroupMember({
 *   onSuccess: (data) => {
 *     console.log('Group updated:', data);
 *   },
 *   onError: (error) => {
 *     console.error('Failed:', error);
 *   }
 * });
 * 
 * // Call mutation
 * mutate({
 *   id: 5,
 *   name: "Nhóm Gia Công Cập Nhật",
 *   code: "N1",
 *   id_staff: [1, 2, 3],
 *   branch_id: 44
 * });
 */
export const useUpdateGroupMember = (options = {}) => {
  const queryClient = useQueryClient();
  const {
    onSuccess: onSuccessCallback,
    onError: onErrorCallback,
    invalidateQueries = true,
  } = options;

  return useMutation({
    mutationKey: ['api_staff_update_group_member'],
    mutationFn: async ({ id, ...payload }) => {
      const res = await apiStaff.apiUpdateGroupMember(id, payload);
      
      // Luôn gọi onSuccessCallback với response để component có thể xử lý message
      // Component sẽ tự kiểm tra isSuccess để quyết định toast type
      if (onSuccessCallback) {
        onSuccessCallback(res);
      }
      
      // Chỉ invalidate và refetch khi thành công
      if (res?.isSuccess === true || res?.isSuccess === 1) {
        // Invalidate và refetch group members query để cập nhật danh sách
        if (invalidateQueries) {
          await queryClient.invalidateQueries({ queryKey: ['api_staff_group_members'] });
          // Refetch ngay để đảm bảo data được cập nhật
          await queryClient.refetchQueries({ queryKey: ['api_staff_group_members'] });
        }
      }
      
      return res;
    },
  });
}

/**
 * Custom hook for deleting group member
 * @description Delete a group member by ID and automatically refetch the group members list
 * @param {Object} [options] - Hook options
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @param {boolean} [options.invalidateQueries=true] - Whether to invalidate group members query after success
 * @returns {Object} Hook return object
 * @returns {Function} returns.mutate - Mutation function: (id: string | number) => void
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {boolean} returns.isSuccess - Success state
 * @returns {boolean} returns.isError - Error state
 * @returns {Object} returns.data - Response data
 * @returns {Error} returns.error - Error object if any
 * @example
 * // Basic usage
 * const { mutate, isLoading, isSuccess } = useDeleteGroupMember({
 *   onSuccess: (data) => {
 *     console.log('Group deleted:', data);
 *   },
 *   onError: (error) => {
 *     console.error('Failed:', error);
 *   }
 * });
 * 
 * // Call mutation
 * mutate(5); // Delete group with ID 5
 */
export const useDeleteGroupMember = (options = {}) => {
  const queryClient = useQueryClient();
  const {
    onSuccess: onSuccessCallback,
    onError: onErrorCallback,
    invalidateQueries = true,
  } = options;

  return useMutation({
    mutationKey: ['api_staff_delete_group_member'],
    mutationFn: async (id) => {
      const res = await apiStaff.apiDeleteGroupMember(id);
      
      // Luôn gọi onSuccessCallback với response để component có thể xử lý message
      // Component sẽ tự kiểm tra isSuccess để quyết định toast type
      if (onSuccessCallback) {
        onSuccessCallback(res);
      }
      
      // Chỉ invalidate và refetch khi thành công
      if (res?.isSuccess === true || res?.isSuccess === 1) {
        // Invalidate và refetch group members query để cập nhật danh sách
        if (invalidateQueries) {
          await queryClient.invalidateQueries({ queryKey: ['api_staff_group_members'] });
          // Refetch ngay để đảm bảo data được cập nhật
          await queryClient.refetchQueries({ queryKey: ['api_staff_group_members'] });
        }
      }
      
      return res;
    },
  });
}
