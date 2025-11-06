import { BtnAction } from "@/components/UI/BtnAction";
import TabFilter from "@/components/UI/TabFilter";
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
import AvatarText from "@/components/UI/common/user/AvatarText";
import DropdowLimit from "@/components/UI/dropdowLimit/dropdowLimit";
import ExcelFileComponent from "@/components/UI/filterComponents/excelFilecomponet";
import SearchComponent from "@/components/UI/filterComponents/searchComponent";
import SelectComponent from "@/components/UI/filterComponents/selectComponent";
import ImageErrors from "@/components/UI/imageErrors";
import Loading from "@/components/UI/loading/loading";
import MultiValue from "@/components/UI/mutiValue/multiValue";
import NoData from "@/components/UI/noData/nodata";
import Pagination from "@/components/UI/pagination";
import { WARNING_STATUS_ROLE } from "@/constants/warningStatus/warningStatus";
import { useProvinceList } from "@/hooks/common/useAddress";
import { useBranchList } from "@/hooks/common/useBranch";
import { useLimitAndTotalItems } from "@/hooks/useLimitAndTotalItems";
import usePagination from "@/hooks/usePagination";
import useActionRole from "@/hooks/useRole";
import useStatusExprired from "@/hooks/useStatusExprired";
import useTab from "@/hooks/useTab";
import useToast from "@/hooks/useToast";
import { Grid6, Edit as IconEdit } from "iconsax-react";
import { debounce } from "lodash";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Tooltip } from "react-tippy";
import Popup_dskh from "./components/popup/popupAdd";
import Popup_chitiet from "./components/popup/popupDetail";
import { useClientGroup } from "./hooks/useClientGroup";
import { useClientList } from "./hooks/useClientList";

const initalState = {
  keySearch: "",
  idBranch: null,
};
const Client = (props) => {
  // show toast
  const isShow = useToast();

  // data lanng
  const dataLang = props.dataLang;

  const router = useRouter();

  const { paginate } = usePagination();

  // check xem tài khoản user tới hạn hay chưa
  const statusExprired = useStatusExprired();

  // hook tab filter
  const { handleTab: _HandleSelectTab } = useTab("0");

  const [isState, setIsState] = useState(initalState);

  // phân quyền
  const { is_admin: role, permissions_current: auth } = useSelector(
    (state) => state.auth
  );

  // phân quyền
  const { checkAdd, checkEdit, checkExport } = useActionRole(
    auth,
    "client_customers"
  );

  const queryState = (key) => setIsState((prev) => ({ ...prev, ...key }));

  // phân trang
  const { limit, updateLimit: sLimit } = useLimitAndTotalItems();

  // params lọc
  const params = {
    search: isState.keySearch,
    limit: limit,
    page: router.query?.page || 1,
    "filter[client_group_id]":
      router.query?.tab != "0"
        ? router.query?.tab != "-1"
          ? router.query?.tab
          : -1
        : null,
    "filter[branch_id]":
      isState.idBranch?.length > 0
        ? isState.idBranch.map((e) => e.value)
        : null,
  };

  // danh sách chi nhánh
  const { data: listBr = [] } = useBranchList({});

  // danh sách tỉnh thành
  const { data: listSelectCt } = useProvinceList({});

  // danh sách nhóm khách hàng
  const { data: listGroup, refetch: refetchGroup } = useClientGroup(params);

  //  danh sách khách hàng
  const { data, isLoading, isFetching, refetch } = useClientList(params);

  // bộ lọc tìm kiếm
  const _HandleOnChangeKeySearch = debounce(({ target: { value } }) => {
    queryState({ keySearch: value });
    router.replace({
      pathname: router.route,
      query: {
        tab: router.query?.tab,
      },
    });
  }, 500);

  // xuất excel
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
          title: `${dataLang?.client_list_namecode}`,
          width: { wpx: 100 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.client_list_name}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.client_list_repre}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.client_list_taxtcode}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },

        {
          title: `${dataLang?.client_list_phone}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.client_list_adress}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.client_list_charge}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.client_list_group}`,
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
        {
          title: `${dataLang?.client_list_datecre}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
      ],
      data: data?.rResult?.map((e) => [
        { value: `${e.id}`, style: { numFmt: "0" } },
        { value: `${e.code ? e.code : ""}` },
        { value: `${e.name ? e.name : ""}` },
        { value: `${e.representative ? e.representative : ""}` },
        { value: `${e.tax_code ? e.tax_code : ""}` },
        { value: `${e.phone_number ? e.phone_number : ""}` },
        { value: `${e.address ? e.address : ""}` },
        {
          value: `${e.staff_charge ? e.staff_charge?.map((i) => i.full_name) : ""
            }`,
        },
        {
          value: `${e.client_group ? e.client_group?.map((i) => i.name) : ""}`,
        },
        { value: `${e.branch ? e.branch?.map((i) => i.name) : ""}` },
        { value: `${e.date_create ? e.date_create : ""}` },
      ]),
    },
  ];

  // breadcrumb
  const breadcrumbItems = [
    {
      label: `${dataLang?.client_group_client || "client_list_title"}`,
      // href: "/",
    },
    {
      label: `${dataLang?.client_list_title || "client_list_title"}`,
    },
  ];

  return (
    <React.Fragment>
      <LayOutTableDynamic
        head={
          <Head>
            <title>{dataLang?.client_list_title}</title>
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
              {dataLang?.client_list_title}
            </h2>
            <div className="flex items-center justify-end gap-2">
              {role == true || checkAdd ? (
                <Popup_dskh
                  listBr={listBr || []}
                  listSelectCt={listSelectCt}
                  onRefresh={refetch.bind(this)}
                  dataLang={dataLang}
                  nameModel={"client_contact"}
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
        fillterTab={
          <>
            {listGroup &&
              listGroup.map((e) => {
                return (
                  <div key={e.id}>
                    <TabFilter
                      // backgroundColor={e.color}
                      backgroundColor="#e2f0fe"
                      onClick={_HandleSelectTab.bind(this, `${e.id}`)}
                      total={e.count}
                      active={e.id}
                      // className={`${e.color ? "text-white" : "text-[#0F4F9E] bg-[#e2f0fe] "}`}
                      className={"text-[#0F4F9E] "}
                    >
                      {e.name}
                    </TabFilter>
                  </div>
                );
              })}
          </>
        }
        table={
          <div className="flex flex-col h-full">
            <div className="w-full items-center flex justify-between gap-2">
              {/* <div className="bg-slate-100 w-full rounded-t-lg items-center grid grid-cols-6 2xl:xl:p-2 xl:p-1.5 p-1.5"> */}
              <div className="flex gap-3 items-center w-full">
                <SearchComponent
                  dataLang={dataLang}
                  onChange={_HandleOnChangeKeySearch.bind(this)}
                  colSpan={2}
                />
                <SelectComponent
                  options={[
                    {
                      value: "",
                      label:
                        dataLang?.price_quote_branch || "price_quote_branch",
                      isDisabled: true,
                    },
                    ...listBr,
                  ]}
                  onChange={(e) => queryState({ idBranch: e })}
                  value={isState.idBranch}
                  placeholder={
                    dataLang?.price_quote_branch || "price_quote_branch"
                  }
                  colSpan={3}
                  components={{ MultiValue }}
                  isMulti={true}
                  closeMenuOnSelect={false}
                />
              </div>
              <div className="flex items-center justify-end space-x-2">
                <OnResetData onClick={() => refetch()} sOnFetching={() => { }} />
                {role == true || checkExport ? (
                  <div className={``}>
                    {data?.rResult?.length > 0 && (
                      <ExcelFileComponent
                        multiDataSet={multiDataSet}
                        filename="Danh sách khách hàng"
                        title="Dskh"
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
            <Customscrollbar className="h-full overflow-y-auto ">
              <div className="w-full">
                <HeaderTable gridCols={12}>
                  <ColumnTable colSpan={1} textAlign={"center"}>
                    {dataLang?.client_list_namecode}
                  </ColumnTable>
                  <ColumnTable colSpan={2} textAlign={"left"}>
                    {dataLang?.client_list_name}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={"left"}>
                    {dataLang?.client_list_taxtcode}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={"center"}>
                    {dataLang?.client_list_phone}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={"left"}>
                    {dataLang?.client_list_adress}
                  </ColumnTable>
                  <ColumnTable colSpan={2} textAlign={"center"}>
                    {dataLang?.client_list_charge}
                  </ColumnTable>
                  <ColumnTable colSpan={2} textAlign={"left"}>
                    {dataLang?.client_list_group}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={"left"}>
                    {dataLang?.client_list_brand}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={"center"}>
                    {dataLang?.branch_popup_properties}
                  </ColumnTable>
                </HeaderTable>
                {isLoading || isFetching ? (
                  <Loading className="h-80" color="#0f4f9e" />
                ) : data?.rResult?.length > 0 ? (
                  <div className="divide-y divide-slate-200 h-[100%]">
                    {data?.rResult?.map((e) => (
                      <RowTable gridCols={12} key={e.id.toString()}>
                        <RowItemTable colSpan={1} textAlign={"center"}>
                          {/* {e.code} */}
                          <Popup_chitiet
                            dataLang={dataLang}
                            className="3xl:text-sm 2xl:text-13 xl:text-xs text-11 font-semibold text-center text-[#003DA0] hover:text-blue-600 transition-all ease-linear cursor-pointer "
                            name={e.code}
                            id={e?.id}
                          />
                        </RowItemTable>
                        <RowItemTable colSpan={2} textAlign={"left"}>
                          {/* <Popup_chitiet
                            dataLang={dataLang}
                            className="3xl:text-base 2xl:text-[12.5px] xl:text-[11px] font-medium text-[9px] px-2 py-0.5  rounded-md text-left text-[#0F4F9E] hover:text-blue-600 transition-all ease-linear"
                            name={e.name}
                            id={e?.id}
                          /> */}
                          {e.name}
                        </RowItemTable>
                        <RowItemTable colSpan={1} textAlign={"left"}>
                          {e.tax_code}
                        </RowItemTable>
                        <RowItemTable colSpan={1} textAlign={"center"}>
                          {e.phone_number}
                        </RowItemTable>
                        <RowItemTable colSpan={1} textAlign={"left"}>
                          {e.address}
                        </RowItemTable>
                        <RowItemTable
                          colSpan={2}
                          className="flex flex-wrap items-center justify-center object-cover gap-2"
                        >
                          {e?.staff_charge
                            ? e.staff_charge?.map((d) => {
                              return (
                                <Tooltip
                                  title={d.full_name}
                                  arrow
                                  key={d?.id}
                                  theme="dark"
                                >
                                  {d?.profile_image ? (
                                    <ImageErrors
                                      src={d.profile_image}
                                      width={40}
                                      height={40}
                                      defaultSrc="/user-placeholder.jpg"
                                      alt="Image"
                                      className="min-w-8 max-w-8 min-h-8 max-h-8 h-8 w-8 object-cover rounded-[100%] text-left cursor-pointer"
                                    />
                                  ) : (
                                    <AvatarText fullName={d?.full_name} />
                                  )}
                                </Tooltip>
                              );
                            })
                            : ""}
                        </RowItemTable>
                        <RowItemTable
                          colSpan={2}
                          className="flex flex-col items-start justify-start gap-y-1"
                        >
                          {e.client_group?.map((h) => {
                            return (
                              <span
                                key={h.id}
                                style={{
                                  backgroundColor: `${h.color == "" || h.color == null
                                    ? "#e2f0fe"
                                    : h.color
                                    }`,
                                  color: `${h.color == "" || h.color == null
                                    ? "#0F4F9E"
                                    : "white"
                                    }`,
                                }}
                                // className={`mr-2 mb-1 w-fit 3xl:text-[13px] 2xl:text-[10px] xl:text-[9px] font-[500] text-[8px] px-2 rounded-full  py-0.5`}
                                className="3xl:text-sm 2xl:text-13 xl:text-xs text-11 font-semibold px-2 py-1 border rounded-md "
                              >
                                {h.name}
                              </span>
                            );
                          })}
                        </RowItemTable>
                        <RowItemTable
                          colSpan={1}
                          className="flex flex-wrap items-center gap-1 justify-start"
                        >
                          {e.branch?.map((i, index) => (
                            <span className="flex flex-wrap items-center justify-start gap-2" key={index}>
                              {/* <TagBranch key={index}>{i.name}</TagBranch> */}
                              {i.name}
                            </span>
                          ))}
                        </RowItemTable>
                        <RowItemTable
                          colSpan={1}
                          className="flex items-center justify-center space-x-2 text-center"
                        >
                          {role == true || checkEdit ? (
                            <Popup_dskh
                              listBr={listBr || []}
                              listSelectCt={listSelectCt}
                              onRefresh={refetch.bind(this)}
                              className="text-xs xl:text-base "
                              listDs={listGroup}
                              dataLang={dataLang}
                              name={e.name}
                              representative={e.representative}
                              code={e.code}
                              tax_code={e.tax_code}
                              phone_number={e.phone_number}
                              address={e.address}
                              date_incorporation={e.date_incorporation}
                              note={e.note}
                              email={e.email}
                              website={e.website}
                              debt_limit={e.debt_limit}
                              debt_limit_day={e.debt_limit_day}
                              debt_begin={e.debt_begin}
                              city={e.city}
                              district={e.district}
                              ward={e.ward}
                              id={e?.id}
                              nameModel={"client_contact"}
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
                            onRefreshGroup={refetchGroup.bind(this)}
                            dataLang={dataLang}
                            id={e?.id}
                            type="client_customers"
                          />
                        </RowItemTable>
                      </RowTable>
                    ))}
                  </div>
                ) : (
                  <NoData />
                )}
              </div>
            </Customscrollbar>
          </div >
        }
        pagination={
          <div div className="flex items-center justify-between gap-2" >
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
    </React.Fragment >
  );
};
export default Client;
