import apiComons from '@/Api/apiComon/apiComon'
import apiStaff from '@/Api/apiPersonnel/apiStaff'
import { optionsQuery } from '@/configs/optionsQuery'
import { useQuery } from '@tanstack/react-query'

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
