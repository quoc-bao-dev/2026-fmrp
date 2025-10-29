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
import { useLimitAndTotalItems } from "@/hooks/useLimitAndTotalItems";
import usePagination from "@/hooks/usePagination";
import useStatusExprired from "@/hooks/useStatusExprired";
import { debounce } from "lodash";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";
import "react-phone-input-2/lib/style.css";
import { useSelector } from "react-redux";
import PopupBranch from "./components/popupBranch";
import { useBranchPageList, useWarehousesList } from "./hooks/usseBranch";
import { ListBtn_Setting } from "./information";
const Branch = (props) => {
    const router = useRouter();

    const dataLang = props.dataLang;

    const { paginate } = usePagination();

    const statusExprired = useStatusExprired();

    const [keySearch, sKeySearch] = useState("");

    const { limit, updateLimit: sLimit } = useLimitAndTotalItems();

    const { data, isFetching, refetch } = useBranchPageList({ search: keySearch, limit: limit, page: router.query?.page || 1, })

    //data warehouse
    const { data: ListWarehouse, isLoading: isLoadingListWarehouse } =
        useWarehousesList();

    const _HandleOnChangeKeySearch = debounce(({ target: { value } }) => {
        sKeySearch(value);
        router.replace("/settings/branch");
    }, 500);
    const dataSetting = useSelector((state) => state.setings);
    return (
        <React.Fragment>
            <Head>
                <title>{dataLang?.branch_title}</title>
            </Head>
            <Container className="">
                {statusExprired ? (
                    <EmptyExprired />
                ) : (
                    <div className="flex space-x-1 mt-4 3xl:text-sm 2xl:text-[11px] xl:text-[10px] lg:text-[10px]">
                        <h6 className="text-[#141522]/40">{dataLang?.branch_seting || "branch_seting"}</h6>
                        <span className="text-[#141522]/40">/</span>
                        <h6>{dataLang?.branch_title || "branch_title"}</h6>
                    </div>
                )}
                <div className="grid grid-cols-9 gap-5 h-[99%] overflow-hidden">
                    <div className="col-span-2 sticky ">
                        <div className="h-fit p-5 rounded bg-[#E2F0FE] space-y-3 mb-3">
                            <ListBtn_Setting dataLang={dataLang} />
                        </div>
                        <p className="w-full text-center text-[#667085] font-normal text-sm">Phiên bản V{dataSetting?.versions}</p>
                    </div>
                    <ContainerBody>
                        <div className="space-y-3 h-[96%] overflow-hidden">
                            <div className="flex justify-between  mt-1 mr-2">
                                <h2 className=" 2xl:text-lg text-base text-[#52575E] capitalize">
                                    {dataLang?.branch_title}
                                </h2>
                                {/* <PopupBranch
                                    ListWarehouse={ListWarehouse}
                                    onRefresh={refetch.bind(this)}
                                    dataLang={dataLang}
                                    className="responsive-text-sm xl:px-5 px-3 xl:py-2.5 py-1.5 bg-background-blue-2 text-white rounded-lg btn-animation hover:scale-105"
                                /> */}

                            </div>
                            <div className="space-y-2 2xl:h-[95%] h-[92%] overflow-hidden">
                                <div className="xl:space-y-3 space-y-2">
                                    <div className="bg-slate-100 w-full rounded flex items-center justify-between xl:p-3 p-2">
                                        <SearchComponent
                                            dataLang={dataLang}
                                            onChange={_HandleOnChangeKeySearch.bind(this)}
                                        />
                                        <div>
                                            <DropdowLimit sLimit={sLimit} limit={limit} dataLang={dataLang} />
                                        </div>
                                    </div>
                                </div>
                                <Customscrollbar className="min:h-[200px] h-[83%] max:h-[500px] overflow-auto pb-2">
                                    <div className="w-full">
                                        <HeaderTable gridCols={12}>
                                            <ColumnTable colSpan={3} textAlign={"left"}>
                                                {dataLang?.branch_popup_name}
                                            </ColumnTable>
                                            <ColumnTable colSpan={3} textAlign={"left"}>
                                                {dataLang?.branch_popup_address}
                                            </ColumnTable>
                                            <ColumnTable colSpan={2} textAlign={"left"}>
                                                {dataLang?.branch_popup_phone}
                                            </ColumnTable>
                                            <ColumnTable colSpan={2} textAlign={"left"}>
                                                Kho thành phẩm
                                            </ColumnTable>
                                            <ColumnTable colSpan={2} textAlign={"center"}>
                                                {dataLang?.branch_popup_properties}
                                            </ColumnTable>
                                        </HeaderTable>
                                        {isFetching && isLoadingListWarehouse ? (
                                            <Loading className="h-80" color="#0f4f9e" />
                                        ) : data?.rResult?.length > 0 ? (
                                            <>
                                                <div className="divide-y divide-slate-200 min:h-[400px] h-[100%] max:h-[500px]">
                                                    {data?.rResult?.map((e) => (
                                                        <RowTable gridCols={12} key={e.id.toString()}>
                                                            <RowItemTable colSpan={3} textAlign={"left"}>
                                                                {e.name}
                                                            </RowItemTable>
                                                            <RowItemTable colSpan={3} textAlign={"left"}>
                                                                {e.address}
                                                            </RowItemTable>
                                                            <RowItemTable colSpan={2} textAlign={"left"}>
                                                                {e.number_phone}
                                                            </RowItemTable>
                                                            <RowItemTable colSpan={2} textAlign={"left"}>
                                                                {e.name_warehouse}
                                                            </RowItemTable>
                                                            <RowItemTable
                                                                colSpan={2}
                                                                className="flex justify-center items-center gap-2"
                                                            >
                                                                <PopupBranch
                                                                    onRefresh={refetch.bind(this)}
                                                                    className="xl:text-base text-xs"
                                                                    dataLang={dataLang}
                                                                    name={e.name}
                                                                    phone={e.number_phone}
                                                                    address={e.address}
                                                                    id={e.id}
                                                                    warehouse={e.name_warehouse}
                                                                    ListWarehouse={ListWarehouse}
                                                                />
                                                                {/* <BtnAction
                                                                    onRefresh={refetch.bind(this)}
                                                                    onRefreshGroup={() => { }}
                                                                    dataLang={dataLang}
                                                                    id={e?.id}
                                                                    type="settings_branch"
                                                                /> */}
                                                            </RowItemTable>
                                                        </RowTable>
                                                    ))}
                                                </div>
                                            </>
                                        ) : (
                                            <NoData />
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
export default Branch;
