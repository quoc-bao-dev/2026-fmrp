import apiComons from "@/Api/apiComon/apiComon";
import { optionsQuery } from "@/configs/optionsQuery";
import { useQuery } from "@tanstack/react-query";

// đối tượng
export const useObject = (dataLang) => {
    return useQuery({
        queryKey: ['api_object'],
        queryFn: async () => {
            const data = await apiComons.apiListObject();
            return data?.map((e) => ({ label: dataLang[e?.name], value: e?.id })) || []
        },
        ...optionsQuery
    })
}
// danh sách đối tượng
export const useObjectList = (dataLang, idBranch, idObject) => {
    // Hỗ trợ truyền nhiều chi nhánh (array) => filter[branch_ids][0], [1], ...
    const normalizeBranchIds = () => {
        if (Array.isArray(idBranch)) {
            return idBranch
                .map((b) => b?.value || b?.id || b)
                .filter(Boolean);
        }
        const single = idBranch?.value || idBranch?.id || idBranch;
        return single ? [single] : [];
    };

    const branchIds = normalizeBranchIds();

    const buildBranchParams = () => {
        if (!branchIds.length) return {};
        // Nếu chỉ có 1 chi nhánh => filter[branch_id]
        if (branchIds.length === 1) {
            return { "filter[branch_id]": branchIds[0] };
        }
        // Nếu nhiều chi nhánh => filter[branch_ids][0], [1], ...
        return branchIds.reduce((acc, value, idx) => {
            acc[`filter[branch_ids][${idx}]`] = value;
            return acc;
        }, {});
    };

    return useQuery({
        queryKey: ['api_object_list', branchIds.join(','), idObject?.value || idObject],
        queryFn: async () => {
            const { rResult } = await apiComons.apiObjectList({
                params: {
                    type: idObject?.value,
                    ...buildBranchParams(),
                }
            });
            return rResult?.map((e) => ({ label: dataLang[e?.name] || e?.name, value: e?.staffid || e?.id })) || []
        },
        enabled: !!idObject,
        ...optionsQuery
    })
}

///combobox đối tượng
export const useObjectCombobox = (dataLang) => {
    return useQuery({
        queryKey: ['api_object_list_combobox'],
        queryFn: async () => {
            const data = await apiComons.apiObjectCombobox();
            return data?.map(({ name, id }) => ({ label: dataLang[name], value: id }))
        },
        ...optionsQuery
    })
}
///combobox đối tượng trong phiếu thu
export const useObjectPaySlipCombobox = (dataLang) => {
    return useQuery({
        queryKey: ['api_object_combobox_payslip'],
        queryFn: async () => {
            const data = await apiComons.apiObjectPaySlipCombobox();
            return data?.map(({ name, id }) => ({ label: dataLang[name], value: id }))
        },
        ...optionsQuery
    })
}

///combobox ds đối tượng trong phiếu thu
export const useObjectListPaySlipCombobox = (params, dataLang) => {
    return useQuery({
        queryKey: ['api_object_list_combobox_payslip', { ...params }],
        queryFn: async () => {
            const { rResult } = await apiComons.apiObjectListPaySlipCombobox({ params });

            return rResult?.map(({ name, id }) => ({ label: name, value: id }))
        },
        ...optionsQuery
    })
}