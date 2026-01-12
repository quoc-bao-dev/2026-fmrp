import apiWarehouseTransfer from "@/Api/apiManufacture/warehouse/warehouseTransfer/apiWarehouseTransfer";
import { optionsQuery } from "@/configs/optionsQuery";
import { useQuery } from "@tanstack/react-query";

export const useWarehouseTransferItems = (idBranch, idExportWarehouse, warehouseStockOnly) => {
  return useQuery({
    queryKey: ["api_warehouse_transfer_items_all", idBranch, idExportWarehouse, warehouseStockOnly],
    queryFn: async () => {
      const params = {
        "filter[branch_id]": idBranch ? idBranch?.value : null,
        "filter[warehouse_id]": idExportWarehouse ? idExportWarehouse?.value : null,
      };

      // Chỉ thêm filter[warehouse_stock_only] khi có truyền vào (ví dụ: = 1)
      if (warehouseStockOnly !== undefined && warehouseStockOnly !== null) {
        params["filter[warehouse_stock_only]"] = warehouseStockOnly;
      }

      const { data } = await apiWarehouseTransfer.apiGetSemiItems("GET", {
        params,
      });

      return data?.result?.map((e) => ({
        label: `${e.name}
                        <span style={{display: none}}>${e.code}</span>
                        <span style={{display: none}}>${e.product_variation} </span>
                        <span style={{display: none}}>${e.serial} </span>
                        <span style={{display: none}}>${e.lot} </span>
                        <span style={{display: none}}>${e.expiration_date} </span>
                        <span style={{display: none}}>${e.text_type} ${e.unit_name} </span>`,
        value: e.id,
        e,
      }));
    },
    ...optionsQuery,
    enabled: !!idExportWarehouse,
  });
}