import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import { ColumnTablePopup, HeaderTablePopup } from "@/components/UI/common/TablePopup";
import TagBranch from "@/components/UI/common/Tag/TagBranch";
import DropdowLimit from "@/components/UI/dropdowLimit/dropdowLimit";
import Loading from "@/components/UI/loading/loading";
import ExpandableContent from "@/components/UI/more";
import NoData from "@/components/UI/noData/nodata";
import Pagination from "@/components/UI/pagination";
import PopupCustom from "@/components/UI/popup";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import useSetingServer from "@/hooks/useConfigNumber";
import { useLimitAndTotalItems } from "@/hooks/useLimitAndTotalItems";
import { formatMoment } from "@/utils/helpers/formatMoment";
import formatMoneyConfig from "@/utils/helpers/formatMoney";
import { useMemo, useState } from "react";
import { useCustomerDebtDetailArises } from "../hooks/useCustomerDebtDetailArises";

const getRandomColors = () => {
    const colors = [
        ["#f0f9ff", "#0ea5e9"],
        ["#f0f9ff", "#3b82f6"],
        ["#fff7ed", "#ea580c"],
        ["#faf5ff", "#a855f7"],
        ["#fdf2f8", "#ec4899"],
        ["#f0fdf4", "#22c55e"],
        ["#fff1f2", "#f43f5e"],
        ["#ecfdf5", "#10b981"],
        ["#fefce8", "#eab308"],
        ["#f8fafc", "#64748b"],
        ["#fdf4ff", "#d946ef"],
    ];

    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
};

// Popup_chitietPhatsinh
const initialState = {
    open: false,
    currentPage: 1,
};
const PopupDetailArises = (props) => {
    const dataLang = props?.dataLang;

    const dataSeting = useSetingServer()

    const [isState, sIsState] = useState(initialState);

    const { limit, updateLimit: sLimit } = useLimitAndTotalItems()

    const _ToggleModal = (e) => sIsState((pver) => ({ ...pver, open: e }));

    const formatNumber = (number) => {
        return formatMoneyConfig(+number, dataSeting)
    };

    const params = {
        limit: limit,
        page: isState.currentPage,
        "filter[branch_id]": props?.idBranch != null ? props?.idBranch.value : null,
        "filter[supplier_id]": props?.idSupplier ? props?.idSupplier.value : null,
        "filter[start_date]": props?.date?.startDate ? formatMoment(props?.date?.startDate, FORMAT_MOMENT.DATE_LONG) : "",
        "filter[end_date]": props?.date?.endDate ? formatMoment(props?.date?.endDate, FORMAT_MOMENT.DATE_LONG) : "",
    }

    const { data, isLoading, isFetching } = useCustomerDebtDetailArises(isState.open, params, props?.id, props?.type)

    const updatedData = useMemo(() => {
        const typeToColors = {};

        return data?.rResult?.map((item) => {
            if (!typeToColors[item.type]) {
                typeToColors[item.type] = getRandomColors();
            }
            const randomColors = typeToColors[item.type];

            return {
                ...item,
                text: randomColors[1],
                bg: randomColors[0],
            };
        });
    }, [data?.rResult]);


    const handlePageChange = (pageNumber) => {
        sIsState((pver) => ({ ...pver, currentPage: pageNumber }));
    };
    return (
        <PopupCustom
            title={props?.type == "no_debt" ? dataLang?.debt_suppliers_detail_ps : dataLang?.debt_suppliers_detail_c}
            button={props?.name}
            onClickOpen={_ToggleModal.bind(this, true)}
            open={isState.open}
            onClose={_ToggleModal.bind(this, false)}
            classNameBtn={props?.className}
        >
            <div className="flex items-center space-x-4 my-2 border-[#E7EAEE] border-opacity-70 border-b-[1px]"></div>
            <div className=" space-x-5 3xl:w-[1200px] 2xl:w-[1150px] xl:w-[w-[900px] lg:w-[900px] w-[1200px] 3xl:h-auto  2xl:h-auto xl:h-auto lg:h-[400px] h-[500px] ">
                <div>
                    <div className="bg-slate-100">
                        <div className="flex justify-between gap-2 p-2 ">
                            <h2 className="flex gap-2 font-semibold 3xl:text-base 2xl:text-[12.5px] xl:text-[11px]">
                                {dataLang?.customerDebt_suppliert || "customerDebt_suppliert"}:
                                <h2 className="font-semibold capitalize text-blue-700 3xl:text-base 2xl:text-[12.5px] xl:text-[11px]">
                                    {props?.supplier_name}
                                </h2>
                            </h2>
                            <h2 className="font-medium flex gap-2 3xl:text-base 2xl:text-[12.5px] xl:text-[11px]">
                                <h2>{dataLang?.debt_suppliers_filter_Detail || "debt_suppliers_filter_Detail"}</h2>
                                <h2 className="text-blue-600">
                                    {props?.date?.startDate ? formatMoment(props?.date?.startDate, FORMAT_MOMENT.DATE_SLASH_LONG) : "-"}
                                </h2>
                                <h2>{dataLang?.debt_suppliers_todate_Detail || "debt_suppliers_todate_Detail"}</h2>
                                <h2 className="text-blue-600 3xl:text-base 2xl:text-[12.5px] xl:text-[11px]">
                                    {props?.date?.endDate ? formatMoment(props?.date?.endDate, FORMAT_MOMENT.DATE_SLASH_LONG) : "-"}
                                </h2>
                            </h2>
                        </div>
                    </div>
                    <div className="3xl:w-[1200px] 2xl:w-[1150px] xl:w-[w-[900px] lg:w-[900px] w-[1200px]">
                        <Customscrollbar className="min:h-[170px] h-[72%] max:h-[100px]">
                            <div className=" w-[100%]">
                                <HeaderTablePopup gridCols={12} className={'!rounded-none'}>
                                    <ColumnTablePopup colSpan={2}>
                                        {dataLang?.debt_suppliers_day_vouchers || "debt_suppliers_day_vouchers"}
                                    </ColumnTablePopup>
                                    <ColumnTablePopup colSpan={2}>
                                        {dataLang?.debt_suppliers_code_vouchers || "debt_suppliers_code_vouchers"}
                                    </ColumnTablePopup>
                                    <ColumnTablePopup colSpan={2}>
                                        {dataLang?.debt_suppliers_type || "debt_suppliers_type"}
                                    </ColumnTablePopup>
                                    <ColumnTablePopup colSpan={2}>
                                        {dataLang?.customerDebt || "customerDebt"}
                                    </ColumnTablePopup>
                                    <ColumnTablePopup colSpan={2}>
                                        {dataLang?.debt_suppliers_note || "debt_suppliers_note"}
                                    </ColumnTablePopup>
                                    <ColumnTablePopup colSpan={2}>
                                        {dataLang?.import_branch || "import_branch"}
                                    </ColumnTablePopup>
                                </HeaderTablePopup>
                                {(isLoading || isFetching) ? (
                                    <Loading
                                        className="3xl:max-h-auto  2xl:max-h-auto xl:max-h-auto lg:max-h-[400px] max-h-[500px]"
                                        color="#0f4f9e"
                                    />
                                ) : updatedData?.length > 0 ? (
                                    <Customscrollbar className="min-h-[90px] max-h-[170px] 3xl:max-h-[364px] 2xl:max-h-[250px] xl:max-h-[350px] lg:max-h-[186px]" >
                                        <div className="divide-y divide-slate-100 min:h-[170px]  max:h-[170px]">
                                            {updatedData?.map((e) => (
                                                <div
                                                    key={e.id?.toString()}
                                                    className="grid items-center grid-cols-12 border-b hover:bg-slate-50"
                                                >
                                                    <h6 className="text-[13px]   py-2.5 px-2 col-span-2 font-medium text-center ">
                                                        {formatMoment(e?.date, FORMAT_MOMENT.DATE_SLASH_LONG)}
                                                    </h6>
                                                    <h6 className="text-[13px]   py-2.5 px-2 col-span-2 font-medium text-center ">
                                                        {e?.code}
                                                    </h6>
                                                    <h6 className="text-[13px] flex items-center w-fit mx-auto  py-2.5 px-2 col-span-2 font-medium ">
                                                        <div className="mx-auto">
                                                            <span
                                                                style={{
                                                                    color: `${e?.text}`,
                                                                    backgroundColor: `${e?.bg}`,
                                                                }}
                                                                className="flex items-center justify-center gap-1 font-normal   rounded-xl py-1 px-2 xl:min-w-[100px] min-w-[70px]   text-center 3xl:items-center 3xl-text-[18px] 2xl:text-[13px] xl:text-xs text-[8px]"
                                                            >
                                                                {dataLang[e?.type] || e?.type}
                                                            </span>
                                                        </div>
                                                    </h6>
                                                    <h6 className="text-[13px]   py-2.5 px-2 col-span-2 font-medium text-right ">
                                                        {formatNumber(e?.total_amount)}
                                                    </h6>
                                                    <h6 className="text-[13px]   py-2.5 px-2 col-span-2 font-medium text-left">
                                                        <ExpandableContent content={e?.note} />
                                                    </h6>
                                                    <h6 className="col-span-2 mx-auto w-fit">
                                                        {/* <div className="cursor-default 3xl:text-[13px] 2xl:text-[10px] xl:text-[9px] text-[8px] text-[#0F4F9E] font-[300] px-1.5 py-0.5 border border-[#0F4F9E] bg-white rounded-[5.5px] uppercase">
                                                            {e?.branch_name}
                                                        </div> */}
                                                        <TagBranch className="w-fit">
                                                            {e?.branch_name}
                                                        </TagBranch>
                                                    </h6>
                                                </div>
                                            ))}
                                        </div>
                                    </Customscrollbar>
                                ) : <NoData />}
                            </div>
                            <div className="flex items-center justify-between space-x-5">
                                {data?.rResult?.length > 0 ? (
                                    <Pagination
                                        postsPerPage={limit}
                                        totalPosts={Number(data.output?.iTotalDisplayRecords)}
                                        paginate={handlePageChange}
                                        currentPage={isState.currentPage}
                                    />
                                ) : (
                                    <div></div>
                                )}
                                <div className="flex items-center gap-2">
                                    <DropdowLimit sLimit={sLimit} limit={limit} dataLang={dataLang} />
                                </div>
                            </div>
                            <div className="z-10 grid items-center grid-cols-12 border-t border-b rounded border-b-gray-200 border-t-gray-200 bg-slate-100">
                                <h2 className="font-semibold p-2 text-[13px] col-span-6 text-center border-l border-r uppercase">
                                    {dataLang?.debt_suppliers_totalAmount || "debt_suppliers_totalAmount"}
                                </h2>
                                <h2 className="font-medium p-2 text-[13px]   col-span-2 text-right border-r">
                                    {formatNumber(data?.rTotal?.total_amount)}
                                </h2>
                                <h2 className="font-medium p-[17px] text-[13px] col-span-2 text-right border-r"></h2>
                                <h2 className="font-medium p-[17px] text-[13px] col-span-2 text-right border-r"></h2>
                            </div>
                        </Customscrollbar>
                    </div>
                </div>
            </div>
        </PopupCustom>
    );
};
export default PopupDetailArises;
