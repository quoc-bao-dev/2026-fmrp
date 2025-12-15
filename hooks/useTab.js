import { useEffect, useCallback } from "react";
import { useRouter } from "next/router";

const useTab = (initialTab = "all") => {
    const router = useRouter();

    const handleTab = useCallback(
        (e) => {
            router.push({
                pathname: router.route,
                query: { ...router.query, tab: e, page: 1 },
            });
        },
        [router.query?.tab]
    );

    useEffect(() => {
        const defaultTab = router.query?.tab || initialTab;
        router.push({
            pathname: router.route,
            query: { ...router.query, tab: defaultTab },
        });
    }, [router.query?.tab]);

    return {
        handleTab,
    };
};

export default useTab;
