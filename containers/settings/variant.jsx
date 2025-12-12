import { BtnAction } from "@/components/UI/BtnAction";
import ContainerPagination from "@/components/UI/common/ContainerPagination/ContainerPagination";
import TitlePagination from "@/components/UI/common/ContainerPagination/TitlePagination";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import { EmptyExprired } from "@/components/UI/common/EmptyExprired";
import { ColumnTable, HeaderTable, RowItemTable, RowTable } from "@/components/UI/common/Table";
import TagBranch from "@/components/UI/common/Tag/TagBranch";
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
import PopupVariant from "./components/popupVariant";
import { useVariantList } from "./hooks/useVariant";
import { ListBtn_Setting } from "./information";
import { useSelector } from "react-redux";

const Variant = (props) => {
    const router = useRouter();

    const dataLang = props.dataLang;

    const { paginate } = usePagination();

    const statusExprired = useStatusExprired();

    const [keySearch, sKeySearch] = useState("");

    const { limit, updateLimit: sLimit } = useLimitAndTotalItems();

    const { data, isFetching, refetch } = useVariantList({ search: keySearch, limit: limit, page: router.query?.page || 1, })

    const _HandleOnChangeKeySearch = debounce(({ target: { value } }) => {
        sKeySearch(value);
        router.replace("/settings/variant");
    }, 500);
    const dataSetting = useSelector((state) => state.setings);
    return (
        <React.Fragment>
            <Head>
                <title>{dataLang?.list_btn_seting_variant}</title>
            </Head>
            <Container>
                {statusExprired ? (
                    <EmptyExprired />
                ) : (
                    <div className="flex space-x-1 mt-4 3xl:text-sm 2xl:text-[11px] xl:text-[10px] lg:text-[10px]">
                        <h6 className="text-[#141522]/40">{dataLang?.branch_seting || "branch_seting"}</h6>
                        <span className="text-[#141522]/40">/</span>
                        <h6>{dataLang?.list_btn_seting_variant || "list_btn_seting_variant"}</h6>
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
                                    {dataLang?.variant_title ? dataLang?.variant_title : "variant_title"}
                                </h2>
                                <div className="flex justify-end items-center gap-2">
                                    <PopupVariant
                                        onRefresh={refetch.bind(this)}
                                        dataLang={dataLang}
                                        className="responsive-text-sm xl:px-5 px-3 xl:py-2.5 py-1.5 bg-blue-fmrp text-white rounded-lg btn-animation hover:scale-105"
                                    />
                                </div>
                            </div>
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
                            <Customscrollbar className="min:h-[200px] h-[72%] max:h-[500px]">
                                <div className="w-full">
                                    <HeaderTable gridCols={10}>
                                        <ColumnTable colSpan={3} textAlign={"left"}>
                                            {dataLang?.variant_name}
                                        </ColumnTable>
                                        <ColumnTable colSpan={5} textAlign={"left"}>
                                            {dataLang?.branch_popup_variant_option}
                                        </ColumnTable>
                                        <ColumnTable colSpan={2} textAlign={"center"}>
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
                                                    <RowTable key={e.id.toString()} gridCols={10}>
                                                        <RowItemTable colSpan={3}>{e?.name}</RowItemTable>
                                                        <RowItemTable colSpan={5} className="gap-1 flex flex-wrap">
                                                            {e?.option?.map((e) => (
                                                                <TagBranch
                                                                    key={e.id.toString()}
                                                                    className="w-fit"
                                                                >
                                                                    {e.name}
                                                                </TagBranch>
                                                            ))}
                                                        </RowItemTable>
                                                        <RowItemTable
                                                            colSpan={2}
                                                            className="space-x-2 flex justify-center items-start"
                                                        >
                                                            <PopupVariant
                                                                onRefresh={refetch.bind(this)}
                                                                name={e.name}
                                                                option={e.option}
                                                                id={e.id}
                                                                className="xl:text-base text-xs"
                                                                dataLang={dataLang}
                                                            />
                                                            <BtnAction
                                                                onRefresh={refetch.bind(this)}
                                                                onRefreshGroup={() => { }}
                                                                dataLang={dataLang}
                                                                id={e?.id}
                                                                type={"settings_variant"}
                                                            />
                                                        </RowItemTable>
                                                    </RowTable>
                                                ))}
                                            </div>
                                        </React.Fragment>
                                    )}
                                </div>
                            </Customscrollbar>
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


export default Variant;
