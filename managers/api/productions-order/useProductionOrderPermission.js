import { useCallback, useMemo } from "react";
import { useAuththentication } from "@/hooks/useAuth";
import { useProductionOrderDetail } from "@/managers/api/productions-order/useProductionOrderDetail";

/**
 * Hook kiểm tra quyền của nhân viên trên LSX
 * - Lấy staff_id từ api authentication
 * - Lấy danh sách staff_managers từ chi tiết LSX
 * - So sánh để trả về role và hàm kiểm tra quyền
 */
export const useProductionOrderPermission = ({ poId, auth, enabled = true } = {}) => {
    const authQuery = useAuththentication(auth);

    const productionOrderDetailQuery = useProductionOrderDetail({
        id: poId,
        enabled: Boolean(poId) && enabled,
    });

    const authStaffId = auth?.staff_id ?? authQuery.data?.staff_id;
    const isAdmin = auth?.is_admin ?? authQuery.data?.is_admin;
    const staffManagers = productionOrderDetailQuery.data?.staff_managers || [];

    const role = useMemo(() => {
        if (!authStaffId || !Array.isArray(staffManagers)) {
            return null;
        }
        return staffManagers.find((item) => String(item?.staff_id) === String(authStaffId)) || null;
    }, [authStaffId, staffManagers]);

    const hasPermission = useCallback(
        (keys = []) => {
            if (isAdmin === true || isAdmin === 1 || isAdmin === "1") return true;
            if (!role) return false;
            const list = Array.isArray(keys) ? keys : [keys];

            return list.some((key) => {
                const value = role?.[key];
                return value === 1 || value === "1" || value === true;
            });
        },
        [role]
    );

    return {
        role,
        hasPermission,
        isAdmin: isAdmin === true || isAdmin === 1 || isAdmin === "1",
        auth: authQuery.data ?? auth ?? null,
        isLoading: authQuery.isLoading || productionOrderDetailQuery.isLoading,
        isFetching: authQuery.isFetching || productionOrderDetailQuery.isFetching,
        refetch: async () => {
            await Promise.all([
                authQuery?.refetch ? authQuery.refetch() : Promise.resolve(),
                productionOrderDetailQuery?.refetch ? productionOrderDetailQuery.refetch() : Promise.resolve(),
            ]);
        },
    };
};

