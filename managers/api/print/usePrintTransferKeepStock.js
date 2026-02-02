import { useMutation } from "@tanstack/react-query";
import apiPrint from "@/Api/apiPrint/apiPrint";
import useToast from "@/hooks/useToast";

/**
 * Custom hook for printing transfer keep stock labels
 * @description Manages transfer keep stock label printing with loading states and error handling
 * @param {Object} [options] - Hook options
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @returns {Object} Hook return object
 * @returns {Function} returns.printTransferKeepStock - Function to print labels
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {Object} returns.data - Response data
 * @returns {Error} returns.error - Error object if any
 * @example
 * // Basic usage
 * const { printTransferKeepStock, isLoading, data, error } = usePrintTransferKeepStock({
 *   onSuccess: (response) => {
 *     console.log('Print successful:', response.pdf_url);
 *   },
 *   onError: (error) => {
 *     console.error('Print failed:', error);
 *   }
 * });
 *
 * // Print labels
 * const handlePrint = async () => {
 *   const formData = new FormData();
 *   formData.append('id', '179');
 *   formData.append('data[0][id]', '222');
 *   // ... add more fields
 *   await printTransferKeepStock(formData);
 * };
 */

export const usePrintTransferKeepStock = (options = {}) => {
    const showToast = useToast();

    const printMutation = useMutation({
        mutationFn: async (formData) => {
            const res = await apiPrint.printTransferKeepStock(formData);
            return res;
        },
        onSuccess: (data) => {
            if (data?.isSuccess === 1) {
                showToast("success", data?.message || "In tem thành công");
                if (options.onSuccess) options.onSuccess(data);
            } else {
                showToast("error", data?.message || "In tem thất bại");
            }
        },
        onError: (error) => {
            showToast("error", error?.message || "Lỗi khi in tem giữ kho");
            if (options.onError) options.onError(error);
        }
    });

    const printTransferKeepStock = async (formData) => {
        return new Promise((resolve, reject) => {
            printMutation.mutate(formData, {
                onSuccess: (data) => {
                    resolve(data);
                },
                onError: (error) => {
                    reject(error);
                }
            });
        });
    };

    return {
        printTransferKeepStock,
        isLoading: printMutation.isPending,
        data: printMutation.data,
        error: printMutation.error
    };
};
