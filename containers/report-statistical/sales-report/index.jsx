import { useRouter } from "next/router";
import { useEffect } from "react";

const SalesReport = (props) => {
    const router = useRouter();
    useEffect(() => {
        router.replace('/report-statistical/sales-report/sales-revenue');
    }, [])

    return null
};

export default SalesReport;
