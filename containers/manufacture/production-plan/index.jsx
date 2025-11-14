import apiProductionPlan from "@/Api/apiManufacture/manufacture/productionPlan/apiProductionPlan";
import { EmptyExprired } from "@/components/UI/common/EmptyExprired";
import { Container } from "@/components/UI/common/layout";
import PopupConfim from "@/components/UI/popupConfim/popupConfim";
import { optionsQuery } from "@/configs/optionsQuery";
import {
    CONFIRMATION_OF_CHANGES,
    TITLE_DELETE_ITEMS,
} from "@/constants/delete/deleteItems";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import { useCategoryOptions } from "@/containers/products/hooks/product/useCategoryOptions";
import { useBranchList } from "@/hooks/common/useBranch";
import { useClientComboboxNoSearchToParams } from "@/hooks/common/useClients";
import { useProductsVariantByBranchSearch } from "@/hooks/common/useProductTypeProducts";
import { useChangeValue } from "@/hooks/useChangeValue";
import { useSetData } from "@/hooks/useSetData";
import useStatusExprired from "@/hooks/useStatusExprired";
import useTab from "@/hooks/useTab";
import { useToggle } from "@/hooks/useToggle";
import { formatMoment } from "@/utils/helpers/formatMoment";
import { FnlocalStorage } from "@/utils/helpers/localStorage";
import {
    useInfiniteQuery
} from "@tanstack/react-query";
import { debounce } from "lodash";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { ProductionsOrdersProvider } from "../productions-orders/context/productionsOrders";
import GanttChart from "./components/gantt/ganttFinal";
import Header from "./components/header";

const initialData = {
    timeLine: [],
    listOrder: [],
    planStatus: [
        { id: "-1", value: "-1", label: "Tất cả" },
        // { id: uuid(), value: "outDate", label: "Đã quá hạn" },
        { id: "0", value: "0", label: "Chưa thực hiện" },
        { id: "1", value: "1", label: "Đang thực hiện" },
        { id: "2", value: "2", label: "Hoàn thành" },
        // 0: chưa thuc hien, 1 đang thic hien, 2 hoàn thành
    ],
    keySearchProducts: "",
    dataBackend: null,
};

const initialValues = {
    // startDate: null,
    // endDate: null,
    idClient: null,
    idProductGroup: null,
    idProduct: null,
    valueBr: null,
    planStatus: null,
    valueDate: { startDate: null, endDate: null },
};

const ProductionPlan = (props) => {
    const dataLang = props.dataLang;

    const router = useRouter();
    const tabParam = Array.isArray(router.query?.tab) ? router.query.tab[0] : router.query?.tab;
    const isTabEnabled = tabParam === undefined || tabParam === "order" || tabParam === "plan";

    const statusExprired = useStatusExprired();

    const { handleTab } = useTab("order");

    const [isSort, sIsSort] = useState("");

    const { setItem, removeItem, getItem } = FnlocalStorage();

    const [arrIdChecked, sArrIdChecked] = useState([]);

    // Bỏ auto-switch tab

    const { isData, updateData } = useSetData(initialData);

    const { isOpen, isKeyState, handleQueryId } = useToggle();

    const { isValue, onChangeValue } = useChangeValue(initialValues);

    const { data: listBranch = [] } = useBranchList();

    const { data: listCategory = [] } = useCategoryOptions({});

    const { data: listClient = [] } = useClientComboboxNoSearchToParams({});

    const { data: listProduct = [] } = useProductsVariantByBranchSearch(
        { value: 0 },
        isData.keySearchProducts
    );

    const params = {
        page: router.query?.page || 1,
        limit: 15,
        sort: isSort,
        status: isValue?.planStatus?.map((e) => e?.value),
        // date_start: isValue.startDate ? formatMoment(isValue.startDate, FORMAT_MOMENT.DATE_SLASH_LONG) : "",
        // date_end: isValue.endDate ? formatMoment(isValue.endDate, FORMAT_MOMENT.DATE_SLASH_LONG) : "",
        date_start:
            isValue.valueDate?.startDate != null
                ? formatMoment(isValue.valueDate?.startDate, FORMAT_MOMENT.DATE_SLASH_LONG)
                : null,
        date_end:
            isValue.valueDate?.endDate != null ? formatMoment(isValue.valueDate?.endDate, FORMAT_MOMENT.DATE_SLASH_LONG) : null,
        customer_id: isValue.idClient?.value ? isValue.idClient?.value : "",
        category_id: isValue.idProductGroup?.value
            ? isValue.idProductGroup?.value
            : "",
        branch_id: isValue.valueBr?.value ? isValue.valueBr?.value : "",
        product_id:
            isValue.idProduct?.length > 0
                ? isValue.idProduct.map((e) => e?.value)
                : null,
    };


    const _ServerFetching = async (req) => {
        const url =
            router.query?.tab == "plan"
                ? "/api_web/api_manufactures/getByInternalPlan?csrf_protection=true"
                : "/api_web/api_manufactures/getProductionPlan?csrf_protection=true";
        try {
            const { data } = await apiProductionPlan.apiListOrderPlan(url, {
                params: req,
            });
            const res = data?.rResult?.map((i) => {
                return {
                    ...i,
                    id: i?.id,
                    nameOrder: i?.nameOrder,
                    status: i?.status,
                    process: i?.process,
                    processDefault: i?.processDefault,
                    listProducts: i?.listProducts.map((s) => {
                        const check = arrIdChecked.includes(s?.id);
                        return {
                            ...s,
                            id: s?.id,
                            name: s?.name,
                            images: s?.images,
                            desription: s?.desription,
                            status: s?.status,
                            quantity: +s?.quantity,
                            quantityRemaining: +s?.quantity_rest,
                            quantityPlan: +s?.quantity_plan,
                            actions: s?.actions,
                            processArr: s?.processArr,
                            unitName: s?.unit_name,
                            checked: check,
                            productVariation: s?.product_variation,
                        };
                    }),
                };
            });
            // updateData({
            //     timeLine: data?.listDate?.map((e) => {
            //         return {
            //             id: uuid(),
            //             title: e?.title,
            //             month: formatMoment(e?.month_year, FORMAT_MOMENT.MONTH),
            //             days: e?.days?.map((i) => {
            //                 return {
            //                     ...i,
            //                     id: uuid(),
            //                     day: `${i?.day_name} ${formatMoment(i?.date, FORMAT_MOMENT.MONTH)}`,
            //                     date: formatMoment(i?.date, FORMAT_MOMENT.DATE_SLASH_LONG),
            //                 };
            //             }),
            //         };
            //     }),
            // });
            // updateTotalItems({ iTotalDisplayRecords: data?.output?.iTotalDisplayRecords, iTotalRecords: data?.output?.iTotalRecords });
            return {
                ...data,
                rResult: res,
            };
        } catch (error) {
            throw error;
        }
    };

    // const { isLoading, isFetching } = useQuery({
    //     queryKey: ['api_production_internal_plan', { ...params }, router.query.tab],
    //     queryFn: _ServerFetching,
    //     placeholderData: keepPreviousData,
    //     enabled: router.query.tab == 'order' || router.query.tab == 'plan',
    //     ...optionsQuery
    // })
    const { isLoading, isFetching, data, hasNextPage, fetchNextPage } =
        useInfiniteQuery({
            queryKey: [
                "api_production_internal_plan",
                { ...params },
                tabParam,
            ],
            queryFn: async ({ pageParam = 1 }) => {
                const data = await _ServerFetching({
                    ...params,
                    page: pageParam,
                });

                return data;
            },
            getNextPageParam: (lastPage, pages) => {
                return lastPage?.output?.next == 1 ? pages?.length + 1 : null;
            },
            retry: 5,
            retryDelay: 5000,
            initialPageParam: 1,
            enabled: router.isReady && isTabEnabled,
            ...optionsQuery,
        });

    const convertData = data
        ? data?.pages?.map((item) => item?.rResult).flat()
        : [];
    useEffect(() => {
        updateData({ listOrder: convertData });
    }, [data]);

    // Bỏ logic tự động chuyển tab

    const _HandleSeachApi = debounce(async (inputValue) => {
        try {
            updateData({ keySearchProducts: inputValue });
        } catch (error) {
            throw error;
        }
    }, 500);

    const [checkedItems, setCheckedItems] = useState([]);

    const handleCheked = (order, product) => {
        setCheckedItems((prev) => {
            const index = prev.findIndex((item) => item?.id === product?.id);

            if (index !== -1) {
                // Nếu sản phẩm đã có trong danh sách, bỏ chọn (xoá khỏi danh sách)
                return prev.filter((item) => item?.id !== product?.id);
            } else {
                // Nếu chưa có, thêm nguyên phần tử vào danh sách
                return [
                    ...prev,
                    { ...product, idParent: order?.id, nameOrder: order?.nameOrder },
                ];
            }
        });
    };

    const handleChekedAll = () => {
        setCheckedItems((prev) => {
            if (
                prev.length ===
                isData.listOrder?.flatMap((order) => order?.listProducts)?.length
            ) {
                // Nếu tất cả đã được chọn, thì bỏ chọn hết
                return [];
            } else {
                // Nếu chưa chọn hết, chọn tất cả và push nguyên phần tử
                return isData.listOrder?.flatMap((order) =>
                    order.listProducts?.map((product) => ({
                        ...product,
                    }))
                );
            }
        });
    };

    const handleSort = () =>
        sIsSort(isSort == "reference_no" ? "-reference_no" : "reference_no");

    useEffect(() => {
        removeItem("arrData");
    }, []);

    useEffect(() => {
        setItem("arrData", JSON.stringify(checkedItems));
        setItem("tab", router.query?.tab);
    }, [checkedItems]);

    const handleConfimTab = () => {
        checkedItems?.length > 0 && setCheckedItems([]);
        removeItem("arrData");
        handleTab(isKeyState);
        handleQueryId({ status: false });
    };

    const shareProps = {
        dataLang,
        isData: {
            ...isData,
            productGroup: listCategory,
            client: listClient,
            listBr: listBranch,
        },
        data: [],
        isValue,
        isFetching: isLoading,
        options: listProduct,
        _HandleSeachApi,
        handleQueryId,
        handleTab,
        arrIdChecked,
        handleChekedAll,
        checkedItems,
        router: router.query?.tab,
        page: router.query?.page,
        hasNextPage,
        fetchNextPage,
    };


    useEffect(() => {
        const dataFilter = getItem("planProductionStatusFilter") || "[]";
        if (JSON.parse(dataFilter).length > 0) {
            onChangeValue("planStatus")(JSON.parse(dataFilter));
            return;
        }
        const all = [{ id: "-1", value: "-1", label: "Tất cả" }];
        onChangeValue("planStatus")(all);
        setItem(JSON.stringify(all));
    }, []);

    return (
        <>
            <Head>
                <title>
                    {dataLang?.production_plan_title || "production_plan_title"}
                </title>
            </Head>
            <Container>
                {props.type == "mobile" ? null : statusExprired ? (
                    <EmptyExprired />
                ) : (
                    <Header {...shareProps} onChangeValue={onChangeValue} />
                )}
                <ProductionsOrdersProvider>
                    <div className="min-h-full  w-full">
                        <GanttChart
                            {...shareProps}
                            handleSort={handleSort}
                            data={[]}
                            timeLine={isData.timeLine}
                            isSort={isSort == "reference_no" ? false : true}
                            handleCheked={handleCheked}
                            dataOrder={isData.listOrder}
                        />
                    </div>

                </ProductionsOrdersProvider>
            </Container>
            <PopupConfim
                dataLang={dataLang}
                type="warning"
                title={TITLE_DELETE_ITEMS}
                subtitle={CONFIRMATION_OF_CHANGES}
                isOpen={isOpen}
                save={handleConfimTab}
                cancel={() => handleQueryId({ status: false })}
            />
        </>
    );
};
export default ProductionPlan;
