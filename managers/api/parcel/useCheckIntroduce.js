import { useMutation } from '@tanstack/react-query';
import apiParcel from '@/Api/apiParcel/apiParcel';

/**
 * Custom hook for checking introduce (marking parcel as introduced)
 * @description Manages check introduce API call with loading states and error handling
 * @param {Object} [options] - Hook options
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @returns {Object} Hook return object
 * @returns {Function} returns.mutate - Mutation function to call the API
 * @returns {Function} returns.mutateAsync - Async mutation function
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {boolean} returns.isSuccess - Success state
 * @returns {boolean} returns.isError - Error state
 * @returns {Object} returns.data - Response data
 * @returns {Error} returns.error - Error object if any
 * @example
 * // Basic usage
 * const { mutate, isLoading } = useCheckIntroduce({
 *   onSuccess: (data) => {
 *     console.log('Parcel marked as introduced:', data);
 *   },
 *   onError: (error) => {
 *     console.error('Failed to check introduce:', error);
 *   }
 * });
 *
 * // Call the mutation
 * mutate(1); // Pass parcel ID
 *
 * // Or use async version
 * const { mutateAsync } = useCheckIntroduce();
 * try {
 *   const result = await mutateAsync(1);
 *   if (result.isSuccess) {
 *     console.log('Success');
 *   }
 * } catch (error) {
 *   console.error('Error:', error);
 * }
 */
export const useCheckIntroduce = (options = {}) => {
    const { onSuccess, onError } = options;

    const mutation = useMutation({
        mutationFn: async (id) => {
            if (!id) {
                throw new Error('Parcel ID is required');
            }
            const response = await apiParcel.apiCheckIntroduce(id);
            return response;
        },
        onSuccess: (data) => {
            if (onSuccess) onSuccess(data);
        },
        onError: (error) => {
            if (onError) onError(error);
        },
    });

    return {
        mutate: mutation.mutate,
        mutateAsync: mutation.mutateAsync,
        isLoading: mutation.isLoading,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        data: mutation.data,
        error: mutation.error,
    };
};
