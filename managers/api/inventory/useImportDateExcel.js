import { useMutation } from '@tanstack/react-query';
import apiInventory from '@/Api/apiManufacture/warehouse/inventory/apiInventory';
import useToast from '@/hooks/useToast';

/**
 * @typedef {Object} ImportDateExcelPayload
 * @property {File} file_excel - Excel file to import
 * @property {string} warehouse_id - Warehouse ID for the import
 */

/**
 * @typedef {Object} ImportDateExcelResponse
 * @property {boolean} isSuccess - Indicates if the request was successful
 * @property {string} [message] - Response message
 * @property {Object} [data] - Response data payload
 * @property {number} [status] - HTTP status code
 */

/**
 * Custom hook for importing Excel data
 * @description Manages Excel import operations with loading states and error handling
 * @param {Object} [options] - Hook options
 * @param {Function} [options.onSuccess] - Success callback
 * @param {Function} [options.onError] - Error callback
 * @returns {Object} Hook return object
 * @returns {Function} returns.importDateExcel - Function to trigger import
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {Object} returns.data - Response data
 * @returns {Error} returns.error - Error object if any
 * @example
 * // Basic usage
 * const { importDateExcel, isLoading, data, error } = useImportDateExcel({
 *   onSuccess: (response) => console.log('Import successful'),
 *   onError: (error) => console.error('Import failed')
 * });
 *
 * // Trigger import
 * const handleImport = async (file, warehouseId) => {
 *   const formData = new FormData();
 *   formData.append('file_excel', file);
 *   formData.append('warehouse_id', warehouseId);
 *   await importDateExcel(formData);
 * };
 */
export const useImportDateExcel = (options = {}) => {
  const showToast = useToast();

  const importDateExcelMutation = useMutation({
    mutationFn: async payload => {
      const res = await apiInventory.apiImportDateExcel(payload);
      return res;
    },
    onSuccess: data => {
      if (data?.isSuccess) {
        showToast('success', data?.message || 'Import Excel successful');
        if (options.onSuccess) options.onSuccess(data);
      } else {
        showToast('error', data?.message || 'Import Excel failed');
        if (options.onError) options.onError(new Error(data?.message || 'Import Excel failed'));
      }
    },
    onError: error => {
      showToast('error', 'An error occurred during Excel import');
      if (options.onError) options.onError(error);
    },
  });

  const importDateExcel = async payload => {
    importDateExcelMutation.mutate(payload);
  };

  return {
    importDateExcel,
    isLoading: importDateExcelMutation.isPending,
    data: importDateExcelMutation.data,
    error: importDateExcelMutation.error,
  };
};
