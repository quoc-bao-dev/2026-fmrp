import { BtnAction } from "@/components/UI/BtnAction";
import ContainerPagination from "@/components/UI/common/ContainerPagination/ContainerPagination";
import TitlePagination from "@/components/UI/common/ContainerPagination/TitlePagination";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import { EmptyExprired } from "@/components/UI/common/EmptyExprired";
import { ColumnTable, HeaderTable, RowItemTable, RowTable } from "@/components/UI/common/Table";
import { Container, ContainerBody } from "@/components/UI/common/layout";
import DropdowLimit from "@/components/UI/dropdowLimit/dropdowLimit";
import SearchComponent from "@/components/UI/filterComponents/searchComponent";
import Loading from "@/components/UI/loading/loading";
import NoData from "@/components/UI/noData/nodata";
import Pagination from "@/components/UI/pagination";
import useSetingServer from "@/hooks/useConfigNumber";
import { useLimitAndTotalItems } from "@/hooks/useLimitAndTotalItems";
import usePagination from "@/hooks/usePagination";
import useStatusExprired from "@/hooks/useStatusExprired";
import useTab from "@/hooks/useTab";
import formatNumberConfig from "@/utils/helpers/formatnumber";
import { debounce } from "lodash";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";
import PopupFinance from "./components/popupFinance";
import { useFinanceList } from "./hooks/useFinance";
import { ListBtn_Setting } from "./information";
import { useSelector } from "react-redux";

const Finance = (props) => {
    const dataLang = props.dataLang;

    const router = useRouter();

    const datasSeting = useSetingServer();

    const { paginate } = usePagination();

    const statusExprired = useStatusExprired();

    const [keySearch, sKeySearch] = useState("");

    const { handleTab: _HandleSelectTab } = useTab('taxes');

    const { limit, updateLimit: sLimit } = useLimitAndTotalItems();

    const url = `/api_web/${(router.query?.tab === "taxes" && "Api_tax/tax?csrf_protection=true") || (router.query?.tab === "currencies" && "Api_currency/currency?csrf_protection=true") || (router.query?.tab === "paymentmodes" && "Api_payment_method/payment_method?csrf_protection=true")}`

    const { data, isFetching, refetch } = useFinanceList(url, { search: keySearch, limit: limit, page: router.query?.page || 1, tab: router.query?.tab })

    const formatnumber = (number) => {
        return formatNumberConfig(+number, datasSeting);
    };

    const _HandleOnChangeKeySearch = debounce(({ target: { value } }) => {
        sKeySearch(value);
        router.replace({
            pathname: "/settings/finance",
            query: { tab: router.query?.tab, }
        });
    }, 500);
    const dataSetting = useSelector((state) => state.setings);
    return (
        <React.Fragment>
            <Head>
                <title>{dataLang?.btn_seting_finance}</title>
            </Head>
            <Container>
                {statusExprired ? (
                    <EmptyExprired />
                ) : (
                    <div className="flex space-x-1 mt-4 3xl:text-sm 2xl:text-[11px] xl:text-[10px] lg:text-[10px]">
                        <h6 className="text-[#141522]/40">{dataLang?.branch_seting || "branch_seting"}</h6>
                        <span className="text-[#141522]/40">/</span>
                        <h6>{dataLang?.list_btn_seting_finance || "list_btn_seting_finance"}</h6>
                    </div>
                )}
                <div className="grid grid-cols-9 gap-5 h-[99%]">
                    <div className="col-span-2 sticky ">
                        <div className="h-fit p-5 rounded bg-[#E2F0FE] space-y-3 mb-3">
                            <ListBtn_Setting dataLang={dataLang} />
                        </div>
                        <p className="w-full text-center text-[#667085] font-normal text-sm">Phiên bản V{dataSetting?.versions}</p>
                    </div>
                    <ContainerBody>
                        <div className="space-y-3 h-[96%] overflow-hidden">
                            <div className="flex items-center justify-between  mt-1 mr-2">
                                <h2 className=" 2xl:text-lg text-base text-[#52575E] capitalize">
                                    {dataLang?.btn_seting_finance || "btn_seting_finance"}
                                </h2>
                                <div className="flex justify-end items-center gap-2">
                                    <PopupFinance
                                        onRefresh={refetch.bind(this)}
                                        dataLang={dataLang}
                                        className="responsive-text-sm xl:px-5 px-3 xl:py-2.5 py-1.5 bg-background-blue-2 text-white rounded-lg btn-animation hover:scale-105"
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-3 items-center justify-start">
                                <button
                                    onClick={_HandleSelectTab.bind(this, "taxes")}
                                    className={`${router.query?.tab === "taxes"
                                        ? "text-[#0F4F9E] bg-[#e2f0fe]"
                                        : "hover:text-[#0F4F9E] hover:bg-[#e2f0fe]/30"
                                        } rounded-lg px-4 py-2 outline-none`}
                                >
                                    {dataLang?.branch_popup_finance_exchange_rate}
                                </button>
                                {/* <button
                                    onClick={_HandleSelectTab.bind(this, "currencies")}
                                    className={`${router.query?.tab === "currencies"
                                        ? "text-[#0F4F9E] bg-[#e2f0fe]"
                                        : "hover:text-[#0F4F9E] hover:bg-[#e2f0fe]/30"
                                        } rounded-lg px-4 py-2 outline-none`}
                                >
                                    {dataLang?.branch_popup_finance_unittitle}
                                </button> */}
                                <button
                                    onClick={_HandleSelectTab.bind(this, "paymentmodes")}
                                    className={`${router.query?.tab === "paymentmodes"
                                        ? "text-[#0F4F9E] bg-[#e2f0fe]"
                                        : "hover:text-[#0F4F9E] hover:bg-[#e2f0fe]/30"
                                        } rounded-lg px-4 py-2 outline-none`}
                                >
                                    {dataLang?.branch_popup_finance_payment}
                                </button>
                            </div>
                            <div className="h-[93%] space-y-2">
                                <div className="xl:space-y-3 space-y-2">
                                    <div className="bg-slate-100 w-full rounded flex items-center justify-between xl:p-3 p-2">
                                        <SearchComponent
                                            dataLang={dataLang}
                                            onChange={_HandleOnChangeKeySearch.bind(this)}
                                        />
                                        <div className="">
                                            <DropdowLimit sLimit={sLimit} limit={limit} dataLang={dataLang} />
                                        </div>
                                    </div>
                                </div>
                                <Customscrollbar className="min:h-[200px] h-[100%] max:h-[500px]">
                                    <div className={`w-full`}>
                                        <HeaderTable
                                            gridCols={
                                                router.query?.tab === "taxes" || router.query?.tab === "currencies"
                                                    ? 6
                                                    : 9
                                            }
                                        >
                                            {(router.query?.tab === "taxes" || router.query?.tab === "currencies") && (
                                                <React.Fragment>
                                                    <ColumnTable colSpan={3} textAlign={"left"}>
                                                        {router.query?.tab === "taxes" &&
                                                            dataLang?.branch_popup_finance_name}
                                                        {router.query?.tab === "currencies" &&
                                                            dataLang?.branch_popup_currency_name}
                                                    </ColumnTable>
                                                    <ColumnTable colSpan={2} textAlign={"center"}>
                                                        {router.query?.tab === "taxes" &&
                                                            dataLang?.branch_popup_finance_rate}
                                                        {router.query?.tab === "currencies" &&
                                                            dataLang?.branch_popup_curency_symbol}
                                                    </ColumnTable>
                                                </React.Fragment>
                                            )}
                                            {router.query?.tab === "paymentmodes" && (
                                                <React.Fragment>
                                                    <ColumnTable colSpan={3} textAlign={"left"}>
                                                        {dataLang?.branch_popup_payment_name}
                                                    </ColumnTable>
                                                    <ColumnTable colSpan={1} textAlign={"left"}>
                                                        {dataLang?.branch_popup_payment_type}
                                                    </ColumnTable>
                                                    <ColumnTable colSpan={2} textAlign={"center"}>
                                                        {dataLang?.branch_popup_payment_balance}
                                                    </ColumnTable>
                                                    <ColumnTable colSpan={2} textAlign={"left"}>
                                                        {dataLang?.branch_popup_payment_bank}
                                                    </ColumnTable>
                                                </React.Fragment>
                                            )}
                                            <ColumnTable colSpan={1} textAlign={"center"}>
                                                {dataLang?.branch_popup_properties}
                                            </ColumnTable>
                                        </HeaderTable>
                                        {isFetching ? (
                                            <Loading className="h-80" color="#0f4f9e" />
                                        ) : (
                                            <React.Fragment>
                                                {data?.rResult?.length == 0 && <NoData />}
                                                <div className="divide-y divide-slate-200 min:h-[400px] h-[100%] max:h-[600px]">
                                                    {data?.rResult?.map((e) => (
                                                        <RowTable
                                                            key={e.id.toString()}
                                                            gridCols={router.query?.tab === "taxes" || router.query?.tab === "currencies" ? 6 : 9}
                                                        >
                                                            {(router.query?.tab === "taxes" || router.query?.tab === "currencies") && (
                                                                <React.Fragment>
                                                                    <RowItemTable colSpan={3}>
                                                                        {router.query?.tab === "taxes" && e?.name}
                                                                        {router.query?.tab === "currencies" && e?.code}
                                                                    </RowItemTable>
                                                                    <RowItemTable colSpan={2} textAlign={"center"}>
                                                                        {router.query?.tab === "taxes" &&
                                                                            formatnumber(e?.tax_rate)}
                                                                        {router.query?.tab === "currencies" &&
                                                                            e?.symbol}
                                                                    </RowItemTable>
                                                                </React.Fragment>
                                                            )}
                                                            {router.query?.tab === "paymentmodes" && (
                                                                <React.Fragment>
                                                                    <RowItemTable colSpan={3}>
                                                                        {router.query?.tab === "paymentmodes" && e?.name}
                                                                    </RowItemTable>
                                                                    <RowItemTable colSpan={2}>
                                                                        {router.query?.tab === "paymentmodes" && e?.cash_bank == "1"
                                                                            ? dataLang?.paymethod_cash
                                                                            : dataLang?.paymethod_bank}
                                                                    </RowItemTable>
                                                                    <RowItemTable colSpan={1} textAlign={"right"}>
                                                                        {router.query?.tab === "paymentmodes" && formatnumber(e?.opening_balance)}
                                                                    </RowItemTable>
                                                                    <RowItemTable colSpan={2}>
                                                                        {router.query?.tab === "paymentmodes" && e?.description}
                                                                    </RowItemTable>
                                                                </React.Fragment>
                                                            )}
                                                            <RowItemTable
                                                                colSpan={1}
                                                                className="flex space-x-2 items-center justify-center "
                                                            >
                                                                <PopupFinance
                                                                    onRefresh={refetch.bind(this)}
                                                                    className="xl:text-base text-xs "
                                                                    dataLang={dataLang}
                                                                    data={e}
                                                                />
                                                                <BtnAction
                                                                    onRefresh={refetch.bind(this)}
                                                                    onRefreshGroup={() => { }}
                                                                    dataLang={dataLang}
                                                                    id={e?.id}
                                                                    type={router.query?.tab}
                                                                />
                                                            </RowItemTable>
                                                        </RowTable>
                                                    ))}
                                                </div>{" "}
                                            </React.Fragment>
                                        )}
                                    </div>
                                </Customscrollbar>
                            </div>
                        </div>
                        {data?.rResult?.length != 0 && (
                            <ContainerPagination>
                                <TitlePagination dataLang={dataLang} totalItems={data?.output?.iTotalDisplayRecords} />
                                <Pagination
                                    postsPerPage={limit}
                                    totalPosts={Number(data?.output?.iTotalDisplayRecords)}
                                    paginate={paginate}
                                    currentPage={router.query?.page || 1}
                                />
                            </ContainerPagination>
                        )}
                    </ContainerBody>
                </div>
            </Container>
        </React.Fragment>
    );
};
export default Finance;
