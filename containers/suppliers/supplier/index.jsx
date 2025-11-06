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
import DropdowLimit from "@/components/UI/dropdowLimit/dropdowLimit";
import ExcelFileComponent from "@/components/UI/filterComponents/excelFilecomponet";
import SearchComponent from "@/components/UI/filterComponents/searchComponent";
import SelectComponent from "@/components/UI/filterComponents/selectComponent";
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
import Popup_chitiet from "./components/popup/detail";
import Popup_dsncc from "./components/popup/popup";
import { useSupplierGroup } from "./hooks/useSupplierGroup";
import { useSupplierList } from "./hooks/useSupplierList";

const initalState = {
  keySearch: "",
  idBranch: null,
};

const Supplier = (props) => {
  const dataLang = props.dataLang;

  const isShow = useToast();

  const router = useRouter();

  const tabPage = router.query?.tab;

  const { paginate } = usePagination();

  const statusExprired = useStatusExprired();

  const { handleTab: _HandleSelectTab } = useTab("0");

  const [isState, setIsState] = useState(initalState);

  const { limit, updateLimit: sLimit } = useLimitAndTotalItems();

  const queryState = (key) => setIsState((prev) => ({ ...prev, ...key }));

  const { is_admin: role, permissions_current: auth } = useSelector(
    (state) => state.auth
  );

  const { checkAdd, checkEdit, checkExport } = useActionRole(auth, "suppliers");

  const params = {
    search: isState.keySearch,
    limit: limit,
    page: router.query?.page || 1,
    "filter[supplier_group_id]":
      tabPage !== "0" ? (tabPage !== "-1" ? tabPage : -1) : null,
    "filter[branch_id]":
      isState.idBranch?.length > 0
        ? isState.idBranch.map((e) => e.value)
        : null,
  };
  // danh sách nhà cung cấp
  const { data, isLoading, isFetching, refetch } = useSupplierList(params);
  // danh sách chi nhánh
  const { data: listBr = [] } = useBranchList({});
  // danh sách bộ lọc nhóm nhà cung cấp
  const { data: listGroup, refetch: refetchGroup } = useSupplierGroup(params);
  // danh sách tỉnh thành
  const { data: listProvince } = useProvinceList({});

  // tìm kiếm table
  const _HandleOnChangeKeySearch = debounce(({ target: { value } }) => {
    queryState({ keySearch: value });
    router.replace({
      pathname: router.route,
      query: {
        tab: router.query?.tab,
      },
    });
  }, 500);

  //excel
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
          title: `${dataLang?.suppliers_supplier_code} `,
          width: { wpx: 100 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.suppliers_supplier_name}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.suppliers_supplier_reper}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.suppliers_supplier_taxcode}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.suppliers_supplier_phone}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.suppliers_supplier_adress}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.suppliers_supplier_group}`,
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
          title: `${dataLang?.suppliers_supplier_date}`,
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
          value: `${e.supplier_group ? e.supplier_group?.map((i) => i.name) : ""
            }`,
        },
        { value: `${e.branch ? e.branch?.map((i) => i.name) : ""}` },
        { value: `${e.date_create ? e.date_create : ""}` },
      ]),
    },
  ];

  const breadcrumbItems = [
    {
      label: `${dataLang?.supplier || "suppliers_supplier_title"}`,
      // href: "/",
    },
    {
      label: `${dataLang?.suppliers_supplier_title || "suppliers_supplier_title"
        }`,
    },
  ];

  return (
    <React.Fragment>
      <LayOutTableDynamic
        head={
          <Head>
            <title>{dataLang?.suppliers_supplier_title}</title>
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
              {dataLang?.suppliers_supplier_title || "suppliers_supplier_title"}
            </h2>
            <div className="flex items-center justify-end gap-2">
              {role == true || checkAdd ? (
                <Popup_dsncc
                  listProvince={listProvince}
                  listBr={listBr}
                  isState={isState}
                  onRefresh={refetch.bind(this)}
                  onRefreshGroup={refetchGroup.bind(this)}
                  dataLang={dataLang}
                  nameModel={"suppliers"}
                  className="responsive-text-sm 3xl:py-3 3xl:px-4 py-2 px-3 text-sm font-normal bg-background-blue-2 text-white rounded-lg btn-animation hover:scale-105"
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
              listGroup?.map((e) => {
                return (
                  <div>
                    <TabFilter
                      backgroundColor="#e2f0fe"
                      key={e.id}
                      onClick={_HandleSelectTab.bind(this, `${e.id}`)}
                      total={e.count}
                      active={e.id}
                      className={`text-[#0F4F9E]`}
                    >
                      {dataLang[e.name] || e.name}
                    </TabFilter>
                  </div>
                );
              })}
          </>
        }
        table={
          <div className="flex flex-col h-full">
            <div className="w-full items-center flex justify-between gap-2">
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
                <OnResetData
                  onClick={refetch.bind(this)}
                  sOnFetching={(e) => { }}
                />
                {role == true || checkExport ? (
                  <div className={``}>
                    {data?.rResult?.length > 0 && (
                      <ExcelFileComponent
                        multiDataSet={multiDataSet}
                        filename="Danh sách nhà cung cấp"
                        title="Dsncc"
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
                <HeaderTable gridCols={8} display={"grid"}>
                  <ColumnTable colSpan={1} textAlign="center">
                    {dataLang?.suppliers_supplier_code ||
                      "suppliers_supplier_code"}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={"left"}>
                    {dataLang?.suppliers_supplier_name ||
                      "suppliers_supplier_name"}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={"center"}>
                    {dataLang?.suppliers_supplier_taxcode ||
                      "suppliers_supplier_taxcode"}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={"center"}>
                    {dataLang?.suppliers_supplier_phone ||
                      "suppliers_supplier_phone"}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={"left"}>
                    {dataLang?.suppliers_supplier_adress ||
                      "suppliers_supplier_adress"}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={"center"}>
                    {dataLang?.suppliers_supplier_group ||
                      "suppliers_supplier_group"}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={"left"}>
                    {dataLang?.client_list_brand || "client_list_brand"}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={"center"}>
                    {dataLang?.branch_popup_properties ||
                      "branch_popup_properties"}
                  </ColumnTable>
                </HeaderTable>
                {isLoading || isFetching ? (
                  <Loading className="h-80" color="#0f4f9e" />
                ) : data?.rResult?.length > 0 ? (
                  <>
                    <div className="divide-y divide-slate-200 min:h-[400px] h-[100%] max:h-[800px]">
                      {data?.rResult?.map((e) => (
                        <RowTable gridCols={8} key={e.id.toString()}>
                          <RowItemTable colSpan={1} textAlign={"center"}>
                            {/* {e.code} */}
                            <Popup_chitiet
                              dataLang={dataLang}
                              className="3xl:text-base 2xl:text-[12.5px] xl:text-[11px] font-medium text-[9px] px-2 py-0.5 col-span-1   rounded-md text-left text-[#0F4F9E] hover:text-blue-600 transition-all ease-linear"
                              name={e.code}
                              id={e?.id}
                            />
                          </RowItemTable>
                          <RowItemTable colSpan={1} textAlign={"left"}>
                            {/* <Popup_chitiet
                              dataLang={dataLang}
                              className="3xl:text-base 2xl:text-[12.5px] xl:text-[11px] font-medium text-[9px] px-2 py-0.5 col-span-1   rounded-md text-left text-[#0F4F9E] hover:text-blue-600 transition-all ease-linear"
                              name={e.name}
                              id={e?.id}
                            /> */}
                            {e.name}
                          </RowItemTable>
                          <RowItemTable colSpan={1} textAlign={"center"}>
                            {e.tax_code}
                          </RowItemTable>
                          <RowItemTable colSpan={1} textAlign={"center"}>
                            {e.phone_number}
                          </RowItemTable>
                          <RowItemTable colSpan={1} textAlign={"left"}>
                            {e.address}
                          </RowItemTable>
                          <RowItemTable
                            colSpan={1}
                            className="flex flex-wrap justify-start gap-x-1"
                          >
                            {e.supplier_group?.map((h) => {
                              return (
                                <span
                                  key={h.id}
                                  style={{ backgroundColor: "#e2f0fe" }}
                                  className={`text-[#0F4F9E] font-normal responsive-text-sm rounded-md py-0.5 px-1.5 2xl:py-1 2xl:px-2 w-fit`}
                                >
                                  {h.name}
                                </span>
                              );
                            })}
                          </RowItemTable>
                          <RowItemTable
                            colSpan={1}
                            className="items-center justify-start gap-1"
                          >
                            {e.branch?.map((i) => (
                              <span
                                className="flex flex-wrap items-center justify-start gap-2"
                                key={i}
                              >
                                {/* <TagBranch key={i}>{i.name}</TagBranch> */}
                                {i.name}
                              </span>
                            ))}
                          </RowItemTable>
                          <RowItemTable
                            colSpan={1}
                            className="flex items-center justify-center space-x-2 text-center"
                          >
                            {role == true || checkEdit ? (
                              <Popup_dsncc
                                onRefresh={refetch.bind(this)}
                                className="text-xs xl:text-base "
                                isState={isState}
                                dataLang={dataLang}
                                listProvince={listProvince}
                                listBr={listBr}
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
                                debt_begin={e.debt_begin}
                                city={e.city}
                                district={e.district}
                                ward={e.ward}
                                id={e?.id}
                                nameModel={"contacts_suppliers"}
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
                              type="suppliers"
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
                {/* <TitlePagination
                  dataLang={dataLang}
                  totalItems={data?.output?.iTotalDisplayRecords}
                /> */}
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
    </React.Fragment>
  );
};

export default Supplier;
