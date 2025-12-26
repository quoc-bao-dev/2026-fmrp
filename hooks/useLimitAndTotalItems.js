import { useState, useEffect } from "react";
import useSetingServer from "./useConfigNumber";

export const useLimitAndTotalItems = (initialLimit = 15, initialTotalItems = {}) => {
    const dataSeting = useSetingServer()

    const [limit, sLimit] = useState(dataSeting?.tables_pagination_limit ?? initialLimit);

    const [totalItems, sTotalItems] = useState(initialTotalItems);

    // Cập nhật limit khi dataSeting thay đổi
    useEffect(() => {
        if (dataSeting?.tables_pagination_limit) {
            sLimit(dataSeting.tables_pagination_limit);
        }
    }, [dataSeting?.tables_pagination_limit]);

    const updateLimit = (newLimit) => sLimit(newLimit);

    const updateTotalItems = (newTotalItems) => sTotalItems(newTotalItems);

    return { limit, totalItems, updateLimit, updateTotalItems };
};
