import { BtnAction } from "@/components/UI/BtnAction";
import Breadcrumb from "@/components/UI/breadcrumb/BreadcrumbCustom";
import OnResetData from "@/components/UI/btnResetData/btnReset";
import ContainerPagination from "@/components/UI/common/ContainerPagination/ContainerPagination";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import { EmptyExprired } from "@/components/UI/common/EmptyExprired";
import {
  ColumnTable,
  HeaderTable,
  RowItemTable,
  RowTable,
} from "@/components/UI/common/Table";
import {
  LayOutTableDynamic
} from "@/components/UI/common/layout";
import DropdowLimit from "@/components/UI/dropdowLimit/dropdowLimit";
import ExcelFileComponent from "@/components/UI/filterComponents/excelFilecomponet";
import SearchComponent from "@/components/UI/filterComponents/searchComponent";
import SelectComponent from "@/components/UI/filterComponents/selectComponent";
import Loading from "@/components/UI/loading/loading";
import NoData from "@/components/UI/noData/nodata";
import Pagination from "@/components/UI/pagination";
import { WARNING_STATUS_ROLE } from "@/constants/warningStatus/warningStatus";
import { useBranchList } from "@/hooks/common/useBranch";
import { useLimitAndTotalItems } from "@/hooks/useLimitAndTotalItems";
import usePagination from "@/hooks/usePagination";
import useActionRole from "@/hooks/useRole";
import useStatusExprired from "@/hooks/useStatusExprired";
import useToast from "@/hooks/useToast";
import { Grid6, Edit as IconEdit } from "iconsax-react";
import { debounce } from "lodash";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";
import "react-phone-input-2/lib/style.css";
import { useSelector } from "react-redux";
import Popup_groupKh from "./components/popup";
import { useGroupClientList } from "./hooks/useGroupClientList";

const initilaState = {
  keySearch: "",
  onFetchingBranch: false,
  idBranch: [],
};
const GroupClient = (props) => {
  const isShow = useToast();

  const router = useRouter();

  const dataLang = props.dataLang;

  const { paginate } = usePagination();

  const statusExprired = useStatusExprired();

  const [isState, sIsState] = useState(initilaState);

  const { limit, updateLimit: sLimit } = useLimitAndTotalItems();

  const queryState = (key) => sIsState((prev) => ({ ...prev, ...key }));

  // phân quyền
  const { is_admin: role, permissions_current: auth } = useSelector(
    (state) => state.auth
  );

  // phân quyền
  const { checkExport, checkEdit, checkAdd } = useActionRole(
    auth,
    "client_group"
  );

  // bộ lọc nhóm
  const params = {
    search: isState.keySearch,
    limit: limit,
    page: router.query?.page || 1,
    // "filter[branch_id]":
    //   isState.idBranch?.length > 0
    //     ? isState.idBranch.map((e) => e.value)
    //     : null,
    "filter[branch_id]": isState.idBranch?.value ?? null,
  };


  // danh sách nhóm khách hàng
  const {
    data,
    isLoading: loadingGroup,
    isFetching,
    refetch,
  } = useGroupClientList(params);

  // danh sách chi nhánh
  const { data: listBr = [] } = useBranchList({});

  // hàm tìm kiếm
  const _HandleOnChangeKeySearch = debounce(({ target: { value } }) => {
    queryState({ keySearch: value });
    router.replace("/clients/groups");
  }, 500);

  // xuất exel
  const multiDataSet = [
    {
      columns: [
        {
          title: "ID",
          width: { wch: 4 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.client_group_name}`,
          width: { wpx: 100 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.client_group_colorcode}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.client_list_brand}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
      ],
      data: data?.rResult?.map((e) => [
        { value: `${e.id}`, style: { numFmt: "0" } },
        { value: `${e.name ? e.name : ""}` },
        { value: `${e.color ? e.color : ""}` },
        { value: `${e.branch ? e.branch?.map((i) => i.name).join(", ") : ""}` },
      ]),
    },
  ];

  const breadcrumbItems = [
    {
      label: `${dataLang?.client_group_client || "client_group_client"}`,
      // href: "/",
    },
    {
      label: `${dataLang?.client_groupuser_title || "client_groupuser_title"}`,
    },
  ];

  return (
    <LayOutTableDynamic
      head={
        <Head>
          <title>{dataLang?.client_groupuser_title}</title>
        </Head>
      }
      breadcrumb={
        <>
          {statusExprired ? (
            <EmptyExprired />
          ) : (
            <React.Fragment>
              <Breadcrumb
                items={breadcrumbItems}
                className="3xl:text-sm 2xl:text-xs xl:text-[10px] lg:text-[10px]"
              />
            </React.Fragment>
          )}
        </>
      }
      titleButton={
        <>
          <h2 className="text-title-section text-[#52575E] capitalize font-medium">
            {dataLang?.client_groupuser || "client_groupuser"}
          </h2>
          <div className="flex items-center justify-end">
            {role == true || checkAdd ? (
              <Popup_groupKh
                listBr={listBr}
                onRefresh={refetch.bind(this)}
                dataLang={dataLang}
                className="responsive-text-sm 3xl:py-3 3xl:px-4 py-2 px-3 text-sm font-normal rounded-md bg-background-blue-2 text-white btn-animation hover:scale-105"
              />
            ) : (
              <button
                type="button"
                onClick={() => {
                  isShow("error", WARNING_STATUS_ROLE);
                }}
                className="responsive-text-sm 3xl:py-3 3xl:px-4 py-2 px-3 text-sm font-normal bg-background-blue-2 text-white rounded-lg btn-animation hover:scale-105"
              >
                {dataLang?.branch_popup_create_new}
              </button>
            )}
          </div>
        </>
      }
      table={
        <div className="flex flex-col h-full">
          <div className="w-full items-center flex justify-between gap-2">
            <div className="flex gap-3 items-center w-full">
              <SearchComponent
                dataLang={dataLang}
                onChange={_HandleOnChangeKeySearch.bind(this)}
                colSpan={1}
              />
              {/* <SelectComponentNew
                isClearable={true}
                value={isState.idBranch}
                onChange={(e) => queryState({ idBranch: e })}
                options={[
                  {
                    value: "",
                    label: dataLang?.price_quote_branch || "price_quote_branch",
                    isDisabled: true,
                  },
                  ...listBr,
                ]}
                colSpan={2}
                classParent="ml-0 !font-semibold focus:ring-none focus:outline-none text-sm focus-visible:ring-none focus-visible:outline-none placeholder:text-sm placeholder:text-[#52575E]"
                classNamePrefix={"productionSmoothing"}
                placeholder={
                  dataLang?.price_quote_branch || "price_quote_branch"
                }
              /> */}
              <SelectComponent
                options={[
                  {
                    value: "",
                    label: dataLang?.price_quote_branch || "price_quote_branch",
                    isDisabled: true,
                  },
                  ...listBr,
                ]}
                colSpan={1}
                onChange={(e) => queryState({ idBranch: e })}
                value={isState.idBranch}
                placeholder={
                  dataLang?.price_quote_branch || "price_quote_branch"
                }
                isClearable={true}
              />
            </div>

            <div className="flex items-center justify-end space-x-2">
              <OnResetData onClick={() => refetch()} sOnFetching={(e) => { }} />
              {role == true || checkExport ? (
                <div className={``}>
                  {data?.rResult?.length > 0 && (
                    <ExcelFileComponent
                      multiDataSet={multiDataSet}
                      filename="Nhóm khách hàng"
                      title="Nkh"
                      dataLang={dataLang}
                    />
                  )}
                </div>
              ) : (
                <button
                  onClick={() => isShow("error", WARNING_STATUS_ROLE)}
                  className={`xl:px-4 px-3 xl:py-2.5 py-1.5 2xl:text-xs xl:text-xs text-[7px] flex items-center space-x-2 bg-[#C7DFFB] rounded hover:scale-105 transition`}
                >
                  <Grid6
                    className="scale-75 2xl:scale-100 xl:scale-100"
                    size={18}
                  />
                  <span>{dataLang?.client_list_exportexcel}</span>
                </button>
              )}
            </div>
          </div>
          <Customscrollbar className="h-full overflow-auto">
            <div className="w-full">
              <HeaderTable gridCols={12}>
                <ColumnTable colSpan={4} textAlign={"left"}>
                  {dataLang?.client_group_name}
                </ColumnTable>
                <ColumnTable colSpan={2} textAlign={"center"}>
                  {dataLang?.client_group_colorcode}
                </ColumnTable>
                <ColumnTable colSpan={2} textAlign={"center"}>
                  {dataLang?.client_group_color}
                </ColumnTable>
                <ColumnTable colSpan={2} textAlign={"left"}>
                  {dataLang?.client_list_brand}
                </ColumnTable>
                <ColumnTable colSpan={2} textAlign={"center"}>
                  {dataLang?.branch_popup_properties}
                </ColumnTable>
              </HeaderTable>

              {loadingGroup || isFetching ? (
                <Loading className="h-80" color="#0f4f9e" />
              ) : data?.rResult?.length > 0 ? (
                <>
                  <div className="divide-y divide-slate-200 h-[100%] ">
                    {data?.rResult?.map((e) => (
                      <RowTable gridCols={12} key={e.id.toString()}>
                        <RowItemTable colSpan={4} textAlign={"left"}>
                          {e.name}
                        </RowItemTable>
                        <RowItemTable colSpan={2} textAlign={"center"}>
                          {e.color}
                        </RowItemTable>
                        <RowItemTable
                          backgroundColor={e.color}
                          colSpan={2}
                          textAlign={"center"}
                          className={"py-1 rounded-md "}
                        >
                          {" "}
                          {e.color}
                        </RowItemTable>
                        <RowItemTable colSpan={2}>
                          {e?.branch?.map((e) => (
                            <span
                              className="flex flex-wrap items-center justify-start gap-2"
                              key={e.id}
                            >
                              {/* <TagBranch
                                key={e.id}
                                className="py-0.5 px-1.5 2xl:py-1 2xl:px-2"
                              >
                                {e.name}
                              </TagBranch> */}
                              {e.name}
                            </span>
                          ))}
                        </RowItemTable>
                        <RowItemTable
                          colSpan={2}
                          className="flex items-center justify-center space-x-2 text-center"
                        >
                          {role == true || checkEdit ? (
                            <Popup_groupKh
                              onRefresh={refetch.bind(this)}
                              className="xl:text-base "
                              listBr={listBr}
                              sValueBr={e.branch}
                              dataLang={dataLang}
                              name={e.name}
                              color={e.color}
                              id={e.id}
                            />
                          ) : (
                            <IconEdit
                              className="cursor-pointer"
                              onClick={() =>
                                isShow("error", WARNING_STATUS_ROLE)
                              }
                            />
                          )}
                          <BtnAction
                            onRefresh={refetch.bind(this)}
                            onRefreshGroup={() => { }}
                            dataLang={dataLang}
                            id={e?.id}
                            type="client_group"
                          />
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
      }
      pagination={
        <div className="flex items-center justify-between gap-2">
          {data?.rResult?.length != 0 && (
            <ContainerPagination>
              <Pagination
                postsPerPage={limit}
                totalPosts={Number(data?.output?.iTotalDisplayRecords)}
                paginate={paginate}
                currentPage={router.query?.page || 1}
              />
            </ContainerPagination>
          )}

          <DropdowLimit sLimit={sLimit} limit={limit} dataLang={dataLang} />
        </div>
      }
    />
  );
};

export default GroupClient;
