import apiProductionsOrders from "@/Api/apiManufacture/manufacture/productionsOrders/apiProductionsOrders";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useListExportProductionOrder = (id) => {
  return useQuery({
    queryKey: ["api_list_export_production_order", id],
    queryFn: async () => {
      const response = await apiProductionsOrders.apiGetListExportProductionOrder(
        id
      );
      return response.data;
    },
    enabled: !!id,
  });
};

// export const useHandlingExportProductionOrder = () => {
//   const queryClient = useQueryClient();

//   const handlingProductCompletedMutation = useMutation({
//     mutationFn: async (data) => {
//       const formData = new FormData();
//       formData.append("po_id", data.po_id);

//       if (data.items && Array.isArray(data.items)) {
//         data.items.forEach((item, index) => {
//           Object.entries(item).forEach(([key, value]) => {
//             if (value !== undefined && typeof value !== "object") {
//               formData.append(`items[${index}][${key}]`, value);
//             }
//           });
//           formData.append(
//             `items[${index}][quantity_success]`,
//             item.quantity_success || 0
//           );
//           formData.append(
//             `items[${index}][quantity_error]`,
//             item.quantity_error || 0
//           );
//           if (item.quantity1 !== undefined)
//             formData.append(`items[${index}][quantity1]`, item.quantity1);
//         });
//       }
//       const response = await apiProductionsOrders.apiHandlingProductCompleted(
//         formData
//       );
//       return response;
//     },
//     onSuccess: (data, variables) => {
//       if (data && data.isSuccess === 1) {
//         queryClient.invalidateQueries({
//           queryKey: ["api_product_completed", variables.po_id],
//         });
        
//         queryClient.invalidateQueries({
//           queryKey: ["api_production_orders"],
//         });
        
//         queryClient.invalidateQueries({
//           queryKey: ["apiDetailProductionOrders", variables.po_id],
//         });
//       }
//       return data;
//     },
//     onError: (error) => {
//       console.error("Lỗi khi xử lý sản phẩm hoàn thành:", error);
//       throw error;
//     },
//   });

//   const onSubmit = async (data) => {
//     try {
//       return await handlingProductCompletedMutation.mutate(data);
//     } catch (error) {
//       throw error;
//     }
//   };

//   return {
//     onSubmit,
//     isLoading: handlingProductCompletedMutation.isPending,
//     isSuccess: handlingProductCompletedMutation.isSuccess,
//     isError: handlingProductCompletedMutation.isError,
//     error: handlingProductCompletedMutation.error,
//     data: handlingProductCompletedMutation.data,
//   };
// };

export const useWarehousesBOM = (params) => {
  return useQuery({
    queryKey: ["api_get_warehouses_bom", params],
    queryFn: async () => {
      const formData = new FormData();
      if (params && typeof params === 'object') {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });
      }
      const response = await apiProductionsOrders.apiGetWarehousesBOM(formData);
      return response.data;
    },
    enabled: !!params,
  });
};

export const useHandlingExportTotalPO = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      formData.append("po_id", data.po_id);
      formData.append("is_app", 0);

      // Xử lý dữ liệu BOM
      if (data.bom && Array.isArray(data.bom)) {
        data.bom.forEach((item, index) => {
          Object.entries(item).forEach(([key, value]) => {
            if (key === 'warehouses' && Array.isArray(value)) {
              value.forEach((warehouse, wIndex) => {
                Object.entries(warehouse).forEach(([wKey, wValue]) => {
                  if (wValue !== undefined) {
                    formData.append(`bom[${index}][warehouses][${wIndex}][${wKey}]`, wValue === null ? 'null' : wValue);
                  }
                });
              });
            } else if (value !== undefined) {
              formData.append(`bom[${index}][${key}]`, value === null ? 'null' : value);
            }
          });
        });
      }

      // Xử lý dữ liệu BOM POI
      if (data.bom_poi && typeof data.bom_poi === 'object') {
        Object.entries(data.bom_poi).forEach(([poiId, items]) => {
          if (Array.isArray(items)) {
            items.forEach((item, itemIndex) => {
              Object.entries(item).forEach(([key, value]) => {
                if (value !== undefined) {
                  formData.append(`bom_poi[${poiId}][${itemIndex}][${key}]`, value === null ? 'null' : value);
                }
              });
            });
          }
        });
      }

      // Xử lý dữ liệu BOM Semi Keep
      if (data.bom_semi_keep && typeof data.bom_semi_keep === 'object') {
        Object.entries(data.bom_semi_keep).forEach(([poiId, poiData]) => {
          // Thêm thông tin poi_id và reference_no
          formData.append(`bom_semi_keep[${poiId}][poi_id]`, poiData.poi_id);
          formData.append(`bom_semi_keep[${poiId}][reference_no]`, poiData.reference_no);

          // Xử lý mảng items
          if (Array.isArray(poiData.items)) {
            poiData.items.forEach((item, itemIndex) => {
              Object.entries(item).forEach(([key, value]) => {
                if (key === 'warehouses' && Array.isArray(value)) {
                  // Xử lý mảng warehouses
                  value.forEach((warehouse, warehouseIndex) => {
                    Object.entries(warehouse).forEach(([wKey, wValue]) => {
                      if (wValue !== undefined) {
                        formData.append(
                          `bom_semi_keep[${poiId}][items][${itemIndex}][warehouses][${warehouseIndex}][${wKey}]`,
                          wValue === null ? 'null' : wValue
                        );
                      }
                    });
                  });
                } else if (value !== undefined) {
                  formData.append(
                    `bom_semi_keep[${poiId}][items][${itemIndex}][${key}]`,
                    value === null ? 'null' : value
                  );
                }
              });
            });
          }
        });
      }

      const response = await apiProductionsOrders.apiHandlingExportTotalPO(formData);
      return response;
    },
    onSuccess: (data, variables) => {
      if (data && data.isSuccess === 1) {
        // Cập nhật lại các queries liên quan
        queryClient.invalidateQueries({
          queryKey: ["api_list_export_production_order", variables.po_id],
        });
        
        // Thêm invalidate cho các query khác có thể bị ảnh hưởng
        queryClient.invalidateQueries({
          queryKey: ["api_get_warehouses_bom"],
        });
        
        queryClient.invalidateQueries({
          queryKey: ["api_production_orders"],
        });
      }
      return data;
    },
    onError: (error) => {
      console.error("Lỗi khi xử lý xuất kho LSX tổng:", error);
      throw error;
    },
  });

  const onSubmit = async (data) => {
    try {
      return await mutation.mutateAsync(data);
    } catch (error) {
      throw error;
    }
  };

  return {
    onSubmit,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
  };
};
