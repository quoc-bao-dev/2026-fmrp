import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import apiMainstreamGoods from '@/Api/mainstream-goods/apiMainstreamGoods';
import useToast from '@/hooks/useToast';

/**
 * @typedef {Object} MainstreamGoodsPriceHookOptions
 * @property {FormData|Object} [data] - Initial payload used when autoTrigger is true
 * @property {boolean} [autoTrigger=false] - Whether the mutation should run automatically when valid data is provided
 * @property {Function} [onSuccess] - Callback invoked when the request succeeds
 * @property {Function} [onError] - Callback invoked when the request fails
 */

/**
 * Validates supplier identifier value.
 * @param {any} value
 * @returns {boolean}
 */
const hasValidSupplierId = value => {
  if (value === undefined || value === null) return false;
  return `${value}`.trim() !== '';
};

/**
 * Validates list of item variation identifiers.
 * @param {any} value
 * @returns {boolean}
 */
const hasValidItemVariationIds = value => Array.isArray(value) && value.length > 0;

/**
 * Builds a FormData payload from provided input.
 * @param {FormData|{supplier_id: string|number, item_variation_ids: Array<string|number>}} payload
 * @returns {FormData}
 */
const buildFormDataPayload = payload => {
  if (payload instanceof FormData) {
    const hasSupplier = hasValidSupplierId(payload.get('supplier_id'));
    const hasItems = payload.getAll('item_variation_ids[]')?.length > 0;
    if (!hasSupplier || !hasItems) {
      throw new Error('supplier_id and item_variation_ids are required to fetch mainstream goods prices');
    }
    return payload;
  }

  const supplierId = payload?.supplier_id;
  const itemVariationIds = payload?.item_variation_ids;

  if (!hasValidSupplierId(supplierId) || !hasValidItemVariationIds(itemVariationIds)) {
    throw new Error('supplier_id and item_variation_ids are required to fetch mainstream goods prices');
  }

  const formData = new FormData();
  formData.append('supplier_id', supplierId);
  itemVariationIds.forEach(id => {
    formData.append('item_variation_ids[]', id);
  });

  return formData;
};

/**
 * Custom hook for fetching mainstream goods prices and QR data
 * @description Sends a POST request to `/api_web/mainstream-goods/prices` using FormData payload
 * @param {MainstreamGoodsPriceHookOptions} [options] - Hook options
 * @returns {Object} Hook utilities
 * @returns {Function} returns.fetchMainstreamGoodsPrices - Function to trigger the mutation manually
 * @returns {boolean} returns.isLoading - Loading state
 * @returns {Object} returns.data - Response data from the API
 * @returns {Error} returns.error - Error object when mutation fails
 * @example
 * const { fetchMainstreamGoodsPrices, data, isLoading } = useMainstreamGoodsPrices();
 *
 * const handleFetch = () => {
 *   fetchMainstreamGoodsPrices({
 *     supplier_id: 40,
 *     item_variation_ids: [944],
 *   });
 * };
 */
export const useMainstreamGoodsPrices = (options = {}) => {
  const showToast = useToast();
  const { onSuccess, onError, autoTrigger = false, data: initialData } = options;

  const mutation = useMutation({
    mutationFn: async payload => {
      const formDataPayload = buildFormDataPayload(payload);
      const response = await apiMainstreamGoods.getMainstreamGoodsPrices(formDataPayload);
      return response;
    },

    onSuccess: response => {
      if (response?.result) {
        if (onSuccess) onSuccess(response);
      } else {
        const message = response?.message || 'Failed to fetch mainstream goods prices';
        // showToast('error', message);
        if (onError) onError(new Error(message));
      }
    },
    onError: error => {
      showToast('error', 'An error occurred while fetching mainstream goods prices');
      if (onError) onError(error);
    },
  });

  const buildValidPayload = payload => {
    try {
      const nextPayload = payload ?? initialData;
      const hasPayload = nextPayload !== undefined && nextPayload !== null;

      if (!hasPayload) {
        throw new Error('Payload is required to fetch mainstream goods prices');
      }

      return nextPayload;
    } catch (error) {
      showToast('error', error.message);
      if (onError) onError(error);
      throw error;
    }
  };

  const fetchMainstreamGoodsPrices = payload => {
    try {
      const validPayload = buildValidPayload(payload);
      mutation.mutate(validPayload);
    } catch (error) {
      // errors already handled in buildValidPayload
    }
  };

  const fetchMainstreamGoodsPricesAsync = async payload => {
    try {
      const validPayload = buildValidPayload(payload);
      const response = await mutation.mutateAsync(validPayload);
      return response;
    } catch (error) {
      // errors already handled in buildValidPayload / mutateAsync
      throw error;
    }
  };

  useEffect(() => {
    if (!autoTrigger) return;
    if (!initialData) return;
    fetchMainstreamGoodsPrices(initialData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoTrigger, initialData]);

  return {
    fetchMainstreamGoodsPrices,
    fetchMainstreamGoodsPricesAsync,
    data: mutation.data,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
  };
};

export default useMainstreamGoodsPrices;
