import apiImport from "@/Api/apiPurchaseOrder/apiImport";
import apiOrder from "@/Api/apiPurchaseOrder/apiOrder";
import { useQuery } from "@tanstack/react-query";

export const useImportItemByOrder = (id, idTheOrder, idBranch, idSupplier, inputValue, warehouseId = null) => {
    return useQuery({
        queryKey: ["api_import_search_items", idTheOrder, idBranch, inputValue, idSupplier, warehouseId],
        queryFn: async () => {
            if (idTheOrder) {
                const { data } = await apiImport.apiSearchItems({
                    params: {
                        "filter[purchase_order_id]": idTheOrder ? idTheOrder?.value : null,
                        import_id: id ? id : "",
                    }
                });
                return data?.result

            }
            if (idBranch && !idTheOrder) {
                let form = new FormData();
                form.append(`branch_id[]`, +idBranch?.value ? +idBranch?.value : "");
                form.append(`id_suppliers`, idSupplier?.value ?? "");
                form.append(`term`, inputValue);
                // Thêm warehouse_id vào FormData nếu có giá trị
                if (warehouseId?.value) {
                    form.append(`warehouse_id`, warehouseId.value);
                }
                const { data } = await apiOrder.apiSearchProductItems(form)
                return data?.result
            }
        },
        enabled: !!idTheOrder || !!idBranch || !!idSupplier,
    })
}