import apiExportToOther from "@/Api/apiManufacture/warehouse/exportToOther/apiExportToOther"
import { optionsQuery } from "@/configs/optionsQuery"
import { useQuery } from "@tanstack/react-query"

export const useExportToOtherItems = (idBranch, idExportWarehouse, search, warehouseStockOnly = null) => {
    return useQuery({
        queryKey: ['api_export_other_items', idBranch, idExportWarehouse, search, warehouseStockOnly],
        queryFn: async () => {
            const params = {
                "filter[branch_id]": idBranch ? idBranch?.value : null,
                "filter[warehouse_id]": idExportWarehouse ? idExportWarehouse?.value : null,
            }
            if (warehouseStockOnly != null) {
                params["filter[warehouse_stock_only]"] = warehouseStockOnly
            }
            const { data } = await apiExportToOther.apiItemComboboxExportToOther(search ? 'POST' : 'GET', {
                params,
                data: {
                    term: search,
                },
            })
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
        enabled: !!idBranch && !!idExportWarehouse,
        ...optionsQuery
    })
}