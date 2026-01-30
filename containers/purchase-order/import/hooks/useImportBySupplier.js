import apiImport from "@/Api/apiPurchaseOrder/apiImport";
import formatNumber from "@/utils/helpers/formatnumber";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";

export const useImportBySupplier = (idSupplier, id, search) => {
    return useQuery({
        queryKey: ['api_import_not_stock', idSupplier, search],
        queryFn: async () => {
            const db = await apiImport.apiNotStockCombobox(search ? "POST" : 'GET', {
                data: {
                    term: search,
                },
                params: {
                    "filter[supplier_id]": idSupplier ? idSupplier?.value : null,
                    import_id: id ? id : "",
                }
            });

            return db?.map((e) => ({
                label: e?.code,
                value: e?.id,
                subtitle: moment(e?.date).format('DD/MM/YYYY') + (+e?.total > 0 ? ' - ' + formatNumber(+e?.total) + ' đ' : '')
            })) || {
                label: db?.code,
                value: db?.id,
                subtitle: moment(db?.date).format('DD/MM/YYYY') + (+db?.total > 0 ? ' - ' + formatNumber(+db?.total) + ' đ' : ''),
            }
        },
        enabled: !!idSupplier
    })

}