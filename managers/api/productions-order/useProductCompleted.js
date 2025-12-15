import apiProductionsOrders from "@/Api/apiManufacture/manufacture/productionsOrders/apiProductionsOrders";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useProductCompleted = (id) => {
  return useQuery({
    queryKey: ["api_product_completed", id],
    queryFn: async () => {
      const response = await apiProductionsOrders.apiGetListProductCompleted(
        id
      );
      return response;
    },
    enabled: !!id,
  });
};

export const useHandlingProductCompleted = () => {
  const queryClient = useQueryClient();

  const handlingProductCompletedMutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      formData.append("po_id", data.po_id);
      formData.append("warehouse_id", data.warehouse_id);
      if (data.items && Array.isArray(data.items)) {
        data.items.forEach((item, index) => {
          const { error_tags = [], error_images = [], ...rest } = item;

          // Append all primitive fields (non-object) of the item (e.g., id, item_id, variation ids, quantities)
          Object.entries(rest).forEach(([key, value]) => {
            if (value !== undefined && typeof value !== "object") {
              formData.append(`items[${index}][${key}]`, value);
            }
          });

          // Explicit quantities (ensure defaults)
          formData.append(
            `items[${index}][quantity_success]`,
            rest.quantity_success ?? item.quantity_success ?? 0
          );
          formData.append(
            `items[${index}][quantity_error]`,
            rest.quantity_error ?? item.quantity_error ?? 0
          );
          if (item.quantity1 !== undefined)
            formData.append(`items[${index}][quantity1]`, item.quantity1);

          // Error tags: items[i][error_tags][j]
          error_tags.forEach((tag, tagIndex) => {
            if (tag !== undefined && tag !== null) {
              formData.append(`items[${index}][error_tags][${tagIndex}]`, tag);
            }
          });

          // Error images keyed by item id: error_images[item.id][j]
          error_images.forEach((file, imgIndex) => {
            if (file instanceof File) {
              formData.append(`error_images[${item.id}][${imgIndex}]`, file);
            }
          });
        });
      }
      const response = await apiProductionsOrders.apiHandlingProductCompleted(
        formData
      );
      return response;
    },
    onSuccess: (data, variables) => {
      if (data && data.isSuccess === 1) {
        queryClient.invalidateQueries({
          queryKey: ["api_product_completed", variables.po_id],
        });
        
        queryClient.invalidateQueries({
          queryKey: ["api_production_orders"],
        });
        
        queryClient.invalidateQueries({
          queryKey: ["apiDetailProductionOrders", variables.po_id],
        });
      }
      return data;
    },
    onError: (error) => {
      console.error("Lỗi khi xử lý sản phẩm hoàn thành:", error);
      throw error;
    },
  });

  const onSubmit = async (data) => {
    try {
      return await handlingProductCompletedMutation.mutate(data);
    } catch (error) {
      throw error;
    }
  };

  return {
    onSubmit,
    isLoading: handlingProductCompletedMutation.isPending,
    isSuccess: handlingProductCompletedMutation.isSuccess,
    isError: handlingProductCompletedMutation.isError,
    error: handlingProductCompletedMutation.error,
    data: handlingProductCompletedMutation.data,
  };
};
