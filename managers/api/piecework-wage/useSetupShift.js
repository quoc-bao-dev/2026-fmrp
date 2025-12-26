import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { optionsQuery } from '@/configs/optionsQuery'
import apiShiftSetting from '@/Api/apiPieceworkWage/shiftSetting/apiShiftSetting'

/**
 * Hook to fetch setup shift data
 * @param {Object} [param] - Optional query parameters
 * @param {number} [param.page] - Page number (default: 1)
 * @param {number} [param.limit] - Number of records per page
 * @param {string} [param.search] - Search keyword
 * @returns {Object} React Query result object
 * @returns {Object} returns.data - Response data containing rResult array and output object
 * @returns {Array} returns.data.rResult - Array of shift settings
 * @returns {Object} returns.data.output - Pagination and metadata information
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {Error} returns.error - Error object if request fails
 * @example
 * // Basic usage (no pagination)
 * const { data, isLoading, error } = useSetupShift();
 * 
 * // With pagination
 * const { data, isLoading } = useSetupShift({ page: 1, limit: 10 });
 * 
 * // With pagination and search
 * const { data, isLoading } = useSetupShift({ page: 1, limit: 10, search: 'Ca hành chính' });
 * 
 * // Access shift data
 * if (data?.rResult) {
 *   data.rResult.forEach(shift => {
 *     console.log(`${shift.name}: ${shift.time_start} - ${shift.time_end}`);
 *   });
 * }
 * 
 * // Access pagination info
 * console.log('Total records:', data?.output?.iTotalRecords);
 */
export const useSetupShift = (param = null) => {
  return useQuery({
    queryKey: ['api_setup_shift', param],
    queryFn: async () => {
      const result = await apiShiftSetting.apiSetupShift(param)
      return result
    },
    ...optionsQuery,
  })
}

/**
 * @typedef {Object} SaveSetupShiftPayload
 * @property {string} name - Shift name (e.g., "Ca hành chính")
 * @property {string} time_start - Start time in format "HH:mm:ss" (e.g., "08:00:00")
 * @property {string} time_end - End time in format "HH:mm:ss" (e.g., "17:00:00")
 * @property {string|number} branch_id - Branch ID
 * @property {string[]} days - Array of day codes (e.g., ["Mon", "Tue", "Wed"])
 * @property {string|number} [id] - Shift ID (for update, omit for create)
 */

/**
 * @typedef {Object} SaveSetupShiftResponse
 * @property {boolean|number} isSuccess - Indicates if the request was successful
 * @property {string} [message] - Response message
 * @property {Object} [data] - Response data payload
 */

/**
 * Hook to create or update setup shift
 * @param {Object} options - Hook options
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @param {boolean} [options.invalidateQueries=true] - Whether to invalidate query after success
 * @returns {Object} Mutation result
 * @returns {Function} returns.mutate - Mutation function
 * @returns {boolean} returns.isPending - Loading state
 * @returns {boolean} returns.isSuccess - Success state
 * @returns {boolean} returns.isError - Error state
 * @returns {Error} returns.error - Error object if request fails
 * @returns {SaveSetupShiftResponse} returns.data - Response data
 * @example
 * // Basic usage
 * const { mutate, isPending } = useSaveSetupShift({
 *   onSuccess: (data) => {
 *     console.log('Shift saved successfully:', data);
 *   },
 *   onError: (error) => {
 *     console.error('Failed to save shift:', error);
 *   }
 * });
 * 
 * // Create new shift
 * mutate({
 *   name: "Ca hành chính",
 *   time_start: "08:00:00",
 *   time_end: "17:00:00",
 *   branch_id: 1,
 *   days: ["Mon", "Tue", "Wed"]
 * });
 * 
 * // Update existing shift
 * mutate({
 *   id: "1",
 *   name: "Ca hành chính",
 *   time_start: "08:00:00",
 *   time_end: "17:00:00",
 *   branch_id: 1,
 *   days: ["Mon", "Tue", "Wed"]
 * });
 */
export const useSaveSetupShift = (options = {}) => {
  const queryClient = useQueryClient()
  const {
    onSuccess: onSuccessCallback,
    onError: onErrorCallback,
    invalidateQueries = true,
  } = options

  return useMutation({
    mutationKey: ['api_setup_shift_save'],
    mutationFn: async (payload) => {
      const res = await apiShiftSetting.apiSaveSetupShift(payload)
      
      if (res?.isSuccess === true || res?.isSuccess === 1) {
        if (invalidateQueries) {
          await queryClient.invalidateQueries({ queryKey: ['api_setup_shift'] })
          await queryClient.refetchQueries({ queryKey: ['api_setup_shift'] })
        }
        
        if (onSuccessCallback) {
          onSuccessCallback(res)
        }
      } else {
        const error = new Error(res?.message || 'Failed to save setup shift')
        if (onErrorCallback) {
          onErrorCallback(error)
        }
        throw error
      }
      
      return res
    },
  })
}

/**
 * @typedef {Object} UpdateSetupShiftPayload
 * @property {string} name - Shift name (e.g., "Ca hành chính")
 * @property {string} time_start - Start time in format "HH:mm:ss" (e.g., "08:00:00")
 * @property {string} time_end - End time in format "HH:mm:ss" (e.g., "17:00:00")
 * @property {string|number} branch_id - Branch ID
 * @property {string[]} days - Array of day codes (e.g., ["Mon", "Tue", "Wed"])
 */

/**
 * @typedef {Object} UpdateSetupShiftResponse
 * @property {boolean|number} isSuccess - Indicates if the request was successful
 * @property {string} [message] - Response message
 * @property {Object} [data] - Response data payload
 */

/**
 * Hook to update setup shift
 * @param {Object} options - Hook options
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @param {boolean} [options.invalidateQueries=true] - Whether to invalidate query after success
 * @returns {Object} Mutation result
 * @returns {Function} returns.mutate - Mutation function (accepts { id, payload })
 * @returns {boolean} returns.isPending - Loading state
 * @returns {boolean} returns.isSuccess - Success state
 * @returns {boolean} returns.isError - Error state
 * @returns {Error} returns.error - Error object if request fails
 * @returns {UpdateSetupShiftResponse} returns.data - Response data
 * @example
 * // Basic usage
 * const { mutate, isPending } = useUpdateSetupShift({
 *   onSuccess: (data) => {
 *     console.log('Shift updated successfully:', data);
 *   },
 *   onError: (error) => {
 *     console.error('Failed to update shift:', error);
 *   }
 * });
 * 
 * // Update shift
 * mutate({
 *   id: "1",
 *   payload: {
 *     name: "Ca hành chính",
 *     time_start: "08:00:00",
 *     time_end: "17:00:00",
 *     branch_id: 1,
 *     days: ["Mon", "Tue", "Wed"]
 *   }
 * });
 */
export const useUpdateSetupShift = (options = {}) => {
  const queryClient = useQueryClient()
  const {
    onSuccess: onSuccessCallback,
    onError: onErrorCallback,
    invalidateQueries = true,
  } = options

  return useMutation({
    mutationKey: ['api_setup_shift_update'],
    mutationFn: async ({ id, payload }) => {
      const res = await apiShiftSetting.apiUpdateSetupShift(id, payload)
      
      if (res?.isSuccess === true || res?.isSuccess === 1) {
        if (invalidateQueries) {
          await queryClient.invalidateQueries({ queryKey: ['api_setup_shift'] })
          await queryClient.refetchQueries({ queryKey: ['api_setup_shift'] })
        }
        
        if (onSuccessCallback) {
          onSuccessCallback(res)
        }
      } else {
        const error = new Error(res?.message || 'Failed to update setup shift')
        if (onErrorCallback) {
          onErrorCallback(error)
        }
        throw error
      }
      
      return res
    },
  })
}

/**
 * @typedef {Object} DeleteSetupShiftResponse
 * @property {boolean|number} isSuccess - Indicates if the request was successful
 * @property {string} [message] - Response message
 * @property {Object} [data] - Response data payload
 */

/**
 * Hook to delete setup shift
 * @param {Object} options - Hook options
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @param {boolean} [options.invalidateQueries=true] - Whether to invalidate query after success
 * @returns {Object} Mutation result
 * @returns {Function} returns.mutate - Mutation function (accepts id)
 * @returns {boolean} returns.isPending - Loading state
 * @returns {boolean} returns.isSuccess - Success state
 * @returns {boolean} returns.isError - Error state
 * @returns {Error} returns.error - Error object if request fails
 * @returns {DeleteSetupShiftResponse} returns.data - Response data
 * @example
 * // Basic usage
 * const { mutate, isPending } = useDeleteSetupShift({
 *   onSuccess: (data) => {
 *     console.log('Shift deleted successfully:', data);
 *   },
 *   onError: (error) => {
 *     console.error('Failed to delete shift:', error);
 *   }
 * });
 * 
 * // Delete shift
 * mutate("1");
 */
export const useDeleteSetupShift = (options = {}) => {
  const queryClient = useQueryClient()
  const {
    onSuccess: onSuccessCallback,
    onError: onErrorCallback,
    invalidateQueries = true,
  } = options

  return useMutation({
    mutationKey: ['api_setup_shift_delete'],
    mutationFn: async (id) => {
      const res = await apiShiftSetting.apiDeleteSetupShift(id)
      
      if (res?.isSuccess === true || res?.isSuccess === 1) {
        if (invalidateQueries) {
          await queryClient.invalidateQueries({ queryKey: ['api_setup_shift'] })
          await queryClient.refetchQueries({ queryKey: ['api_setup_shift'] })
        }
        
        if (onSuccessCallback) {
          onSuccessCallback(res)
        }
      } else {
        const error = new Error(res?.message || 'Failed to delete setup shift')
        if (onErrorCallback) {
          onErrorCallback(error)
        }
        throw error
      }
      
      return res
    },
  })
}

