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
import { ContainerTotal, LayOutTableDynamic } from "@/components/UI/common/layout";
import DropdowLimit from "@/components/UI/dropdowLimit/dropdowLimit";
import DateToDateComponent from "@/components/UI/filterComponents/dateTodateComponent";
import ExcelFileComponent from "@/components/UI/filterComponents/excelFilecomponet";
import SearchComponent from "@/components/UI/filterComponents/searchComponent";
import SelectComponent from "@/components/UI/filterComponents/selectComponent";
import Loading from "@/components/UI/loading/loading";
import NoData from "@/components/UI/noData/nodata";
import Pagination from "@/components/UI/pagination";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import { useSupplierList } from "@/containers/suppliers/supplier/hooks/useSupplierList";
import { useBranchList } from "@/hooks/common/useBranch";
import { useChangeValue } from "@/hooks/useChangeValue";
import useSetingServer from "@/hooks/useConfigNumber";
import { useLimitAndTotalItems } from "@/hooks/useLimitAndTotalItems";
import usePagination from "@/hooks/usePagination";
import useStatusExprired from "@/hooks/useStatusExprired";
import { formatMoment } from "@/utils/helpers/formatMoment";
import formatMoneyConfig from "@/utils/helpers/formatMoney";
import { debounce } from "lodash";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";
import PopupArises from "./components/details_arises";
import PopupDetailFirst from "./components/details_first";
import { useSupplierDebtList } from "./hooks/useSupplierDebtList";

const DebtSuppliers = (props) => {
  const dataLang = props.dataLang;

  const router = useRouter();

  const { paginate } = usePagination();

  const dataSeting = useSetingServer();

  const statusExprired = useStatusExprired();

  const [keySearch, sKeySearch] = useState("");

  const { limit, updateLimit: sLimit } = useLimitAndTotalItems();

  const pastDays = 30;

  const today = new Date();

  const pastDate = new Date(today);

  pastDate.setDate(today.getDate() - pastDays);

  const inistialValue = {
    idCode: null,
    idSupplier: null,
    idBranch: null,
    valueDate: { startDate: pastDate, endDate: today },
  };

  const { isValue, onChangeValue } = useChangeValue(inistialValue);

  const params = {
    search: keySearch,
    limit: limit,
    page: router.query?.page || 1,
    "filter[branch_id]":
      isValue?.idBranch != null ? isValue?.idBranch.value : null,
    "filter[supplier_id]": isValue?.idSupplier
      ? isValue?.idSupplier.value
      : null,
    "filter[start_date]":
      isValue?.valueDate?.startDate != null
        ? formatMoment(isValue?.valueDate?.startDate, FORMAT_MOMENT.DATE_LONG)
        : null,
    "filter[end_date]":
      isValue?.valueDate?.endDate != null
        ? formatMoment(isValue?.valueDate?.endDate, FORMAT_MOMENT.DATE_LONG)
        : null,
  };

  const { data: listBranch = [] } = useBranchList();

  const { data: dataSupplier } = useSupplierList({});

  const { data, refetch, isFetching, isLoading } = useSupplierDebtList(params);

  const listSupplier =
    dataSupplier?.rResult?.map((e) => ({ label: e.name, value: e.id })) || [];

  const formatNumber = (number) => {
    return formatMoneyConfig(+number, dataSeting);
  };

  const renderMoneyOrDash = (value) => {
    return Number(value) === 0 ? (
      "-"
    ) : (
      <>
        {formatNumber(value)} <span className="underline">đ</span>
      </>
    );
  };

  const _HandleOnChangeKeySearch = debounce(({ target: { value } }) => {
    sKeySearch(value);
  }, 500);

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
          title: `${dataLang?.debt_suppliers_code || "debt_suppliers_code"}`,
          width: { wpx: 100 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.debt_suppliers_name || "debt_suppliers_name"}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
        {
          title: `${
            dataLang?.debt_suppliers_detail_opening ||
            "debt_suppliers_detail_opening"
          }`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
        {
          title: `${
            dataLang?.debt_suppliers_detail_period ||
            "debt_suppliers_detail_period"
          }`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
        {
          title: `${
            dataLang?.debt_suppliers_detail_incurred ||
            "debt_suppliers_detail_incurred"
          }`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
        {
          title: `${
            dataLang?.debt_suppliers_detail_expenses ||
            "debt_suppliers_detail_expenses"
          }`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
        {
          title: `${
            dataLang?.debt_suppliers_detail_debt_period ||
            "debt_suppliers_detail_debt_period"
          }`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
        {
          title: `${
            dataLang?.debt_suppliers_detail_Ending ||
            "debt_suppliers_detail_Ending"
          }`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
      ],
      data: data?.rResult?.map((e) => [
        { value: `${e?.id ? e.id : ""}`, style: { numFmt: "0" } },
        { value: `${e?.code ? e?.code : ""}` },
        { value: `${e?.name ? e?.name : ""}` },
        { value: `${e?.no_start ? formatNumber(e?.no_start) : ""}` },
        { value: `${e?.chi_start ? formatNumber(e?.chi_start) : ""}` },
        { value: `${e?.no_debt ? formatNumber(e?.no_debt) : ""}` },
        { value: `${e?.chi_debt ? formatNumber(e?.chi_debt) : ""}` },
        { value: `${e?.no_end ? formatNumber(e?.no_end) : ""}` },
        { value: `${e?.chi_end ? formatNumber(e?.chi_end) : ""}` },
      ]),
    },
  ];

  // breadcrumb
  const breadcrumbItems = [
    {
      label: `Công nợ mua`,
      // href: "/",
    },
    {
      label: `${dataLang?.debt_suppliers || "debt_suppliers"}`,
    },
  ];
  return (
    <React.Fragment>
      <LayOutTableDynamic
        head={
          <Head>
            <title>{dataLang?.debt_suppliers || "debt_suppliers"} </title>
          </Head>
        }
        breadcrumb={
          <>
            {statusExprired ? (
              <EmptyExprired />
            ) : (
              <Breadcrumb
                items={breadcrumbItems}
                className="3xl:text-sm 2xl:text-xs xl:text-[10px] lg:text-[10px]"
              />
              // <div className="flex space-x-1 mt-4 3xl:text-sm 2xl:text-[11px] xl:text-[10px] lg:text-[10px]">
              //     <h6 className="text-[#141522]/40">{dataLang?.debt_suppliers || "debt_suppliers"}</h6>
              //     <span className="text-[#141522]/40">/</span>
              //     <h6>{dataLang?.debt_suppliers || "debt_suppliers"}</h6>
              // </div>
            )}
          </>
        }
        titleButton={
          <h2 className="text-title-section text-[#52575E] capitalize font-medium">
            {dataLang?.debt_suppliers || "debt_suppliers"}
          </h2>
        }
        table={
          <div className="flex flex-col h-full">
            <div className="w-full items-center flex justify-between gap-2">
              <div className="flex gap-3 items-center w-full">
                {/* <div className="grid grid-cols-5"> */}
                <SearchComponent
                  dataLang={dataLang}
                  colSpan={1}
                  onChange={_HandleOnChangeKeySearch.bind(this)}
                />
                <DateToDateComponent
                  value={isValue?.valueDate}
                  onChange={onChangeValue("valueDate")}
                />
                <SelectComponent
                  options={[
                    {
                      value: "",
                      label:
                        dataLang?.purchase_order_table_branch ||
                        "purchase_order_table_branch",
                      isDisabled: true,
                    },
                    ...listBranch,
                  ]}
                  colSpan={1}
                  isClearable={true}
                  value={isValue.idBranch}
                  onChange={onChangeValue("idBranch")}
                  placeholder={
                    dataLang?.purchase_order_table_branch ||
                    "purchase_order_table_branch"
                  }
                />
                <SelectComponent
                  options={[
                    {
                      value: "",
                      label:
                        dataLang?.purchase_order_table_supplier ||
                        "purchase_order_table_supplier",
                      isDisabled: true,
                    },
                    ...listSupplier,
                  ]}
                  colSpan={1}
                  isClearable={true}
                  value={isValue?.idSupplier}
                  onChange={onChangeValue("idSupplier")}
                  placeholder={
                    dataLang?.purchase_order_table_supplier ||
                    "purchase_order_table_supplier"
                  }
                />
                {/* </div> */}
              </div>
              <div className="col-span-1">
                <div className="flex items-center justify-end gap-2">
                  <OnResetData
                    sOnFetching={(e) => {}}
                    onClick={refetch.bind(this)}
                  />
                  <div>
                    {data?.rResult?.length > 0 && (
                      <ExcelFileComponent
                        multiDataSet={multiDataSet}
                        filename={"Danh sách công nợ nhà cung cấp"}
                        title="DSCNNCC"
                        dataLang={dataLang}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
            <Customscrollbar className="h-full min-h-0 overflow-y-auto">
              <div className="w-full">
                <HeaderTable gridCols={12}>
                  <ColumnTable colSpan={0.5} textAlign={"center"}>
                    {dataLang?.stt || "stt"}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={"left"}>
                    {dataLang?.debt_suppliers_code || "debt_suppliers_code"}
                  </ColumnTable>
                  <ColumnTable colSpan={1.5} textAlign={"left"}>
                    {dataLang?.debt_suppliers_name || "debt_suppliers_name"}
                  </ColumnTable>
                  <ColumnTable colSpan={3} textAlign={"left"}>
                    <ColumnTable
                      colSpan={3}
                      textAlign={"center"}
                      className={"py-2"}
                    >
                      {dataLang?.debt_suppliers_balance ||
                        "debt_suppliers_balance"}
                    </ColumnTable>
                    <div className="flex border-t border-gray-200">
                      <ColumnTable
                        textAlign={"center"}
                        className={"flex-1 border-r border-gray-200 pt-2"}
                      >
                        {dataLang?.debt_suppliers_inDebt ||
                          "debt_suppliers_inDebt"}
                      </ColumnTable>
                      <ColumnTable
                        textAlign={"center"}
                        className={"flex-1 pt-2"}
                      >
                        {dataLang?.debt_suppliers_Spend ||
                          "debt_suppliers_Spend"}
                      </ColumnTable>
                    </div>
                  </ColumnTable>
                  <ColumnTable colSpan={3} textAlign={"left"}>
                    <ColumnTable
                      colSpan={3}
                      textAlign={"center"}
                      className={"py-2"}
                    >
                      {dataLang?.debt_suppliers_Ending ||
                        "debt_suppliers_Ending"}
                    </ColumnTable>
                    <div className="flex border-t border-gray-200">
                      <ColumnTable
                        textAlign={"center"}
                        className={"flex-1 border-r border-gray-200 pt-2"}
                      >
                        {dataLang?.debt_suppliers_inDebt ||
                          "debt_suppliers_inDebt"}
                      </ColumnTable>
                      <ColumnTable
                        textAlign={"center"}
                        className={"flex-1 pt-2"}
                      >
                        {dataLang?.debt_suppliers_Spend ||
                          "debt_suppliers_Spend"}
                      </ColumnTable>
                    </div>
                  </ColumnTable>
                  <ColumnTable colSpan={3} textAlign={"left"}>
                    <ColumnTable
                      colSpan={3}
                      textAlign={"center"}
                      className={"py-2"}
                    >
                      {dataLang?.debt_suppliers_Ending ||
                        "debt_suppliers_Ending"}
                    </ColumnTable>
                    <div className="flex border-t border-gray-200">
                      <ColumnTable
                        textAlign={"center"}
                        className={"flex-1 border-r border-gray-200 pt-2"}
                      >
                        {dataLang?.debt_suppliers_inDebt ||
                          "debt_suppliers_inDebt"}
                      </ColumnTable>
                      <ColumnTable
                        textAlign={"center"}
                        className={"flex-1 pt-2"}
                      >
                        {dataLang?.customerDebt_collect ||
                          "customerDebt_collect"}
                      </ColumnTable>
                    </div>
                  </ColumnTable>
                </HeaderTable>
                {isFetching || isLoading ? (
                  <Loading className="h-full" color="#0f4f9e" />
                ) : data?.rResult?.length > 0 ? (
                  <div className="h-full divide-y divide-slate-200">
                    {data?.rResult?.map((e, index) => (
                      <RowTable gridCols={12} key={e.id.toString()}>
                        <RowItemTable colSpan={0.5} textAlign={"center"}>
                          {index + 1}
                        </RowItemTable>
                        <RowItemTable colSpan={1} textAlign={"left"}>
                          {e.code}
                        </RowItemTable>
                        <RowItemTable colSpan={1.5} textAlign={"left"}>
                          {e.name}
                        </RowItemTable>
                        {/* <div className="grid items-center justify-center grid-cols-4 col-span-3"> */}
                        <RowItemTable
                          colSpan={1.5}
                          textAlign={"center"}
                          className={"!text-[#003DA0] !hover:text-blue-600"}
                        >
                          {e.no_start == "0" ? (
                            "-"
                          ) : (
                            <PopupDetailFirst
                              dataLang={dataLang}
                              className="text-left"
                              name={
                                e.no_start == "0"
                                  ? "-"
                                  : formatNumber(e.no_start)
                              }
                              id={e?.id}
                              type={"no_start"}
                              date={isValue.valueDate}
                              supplier_name={e.name}
                              idBranch={isValue?.idBranch}
                              idSupplier={isValue?.idSupplier}
                            />
                          )}
                        </RowItemTable>
                        <RowItemTable
                          colSpan={1.5}
                          textAlign={"center"}
                          className={"!text-[#003DA0] !hover:text-blue-600"}
                        >
                          {e.chi_start == "0" ? (
                            "-"
                          ) : (
                            <PopupDetailFirst
                              dataLang={dataLang}
                              className="text-left"
                              name={
                                e.chi_start == "0"
                                  ? "-"
                                  : formatNumber(e.chi_start)
                              }
                              date={isValue.valueDate}
                              supplier_name={e.name}
                              id={e?.id}
                              type={"chi_start"}
                              idBranch={isValue?.idBranch}
                              idSupplier={isValue?.idSupplier}
                            />
                          )}
                        </RowItemTable>
                        {/* </div> */}
                        <RowItemTable
                          colSpan={1.5}
                          textAlign={"center"}
                          className={"!text-[#003DA0] !hover:text-blue-600"}
                        >
                          {e.no_debt == "0" ? (
                            "-"
                          ) : (
                            <PopupArises
                              dataLang={dataLang}
                              className="text-left uppercase"
                              supplier_name={e.name}
                              name={
                                e.no_debt == "0" ? "-" : formatNumber(e.no_debt)
                              }
                              id={e?.id}
                              date={isValue.valueDate}
                              type={"no_debt"}
                              idBranch={isValue?.idBranch}
                              idSupplier={isValue?.idSupplier}
                            />
                          )}
                        </RowItemTable>

                        <RowItemTable
                          colSpan={1.5}
                          textAlign={"center"}
                          className={"!text-[#003DA0] !hover:text-blue-600"}
                        >
                          {e.chi_debt == "0" ? (
                            "-"
                          ) : (
                            <PopupArises
                              dataLang={dataLang}
                              className="text-left uppercase"
                              supplier_name={e.name}
                              name={
                                e.chi_debt == "0"
                                  ? "-"
                                  : formatNumber(e.chi_debt)
                              }
                              id={e?.id}
                              date={isValue.valueDate}
                              type={"chi_debt"}
                              idBranch={isValue?.idBranch}
                              idSupplier={isValue?.idSupplier}
                            />
                          )}
                        </RowItemTable>

                        <RowItemTable colSpan={1.5} textAlign={"center"}>
                          {e.no_end == "0" ? "-" : formatNumber(e.no_end)}
                        </RowItemTable>
                        <RowItemTable colSpan={1.5} textAlign={"center"}>
                          {e.chi_end == "0" ? "-" : formatNumber(e.chi_end)}
                        </RowItemTable>
                      </RowTable>
                    ))}
                  </div>
                ) : (
                  <NoData />
                )}
              </div>
            </Customscrollbar>
          </div>
        }
        showTotal={true}
        total={
          <ContainerTotal className={"!grid-cols-24"}>
            <RowItemTable colSpan={3} className="p-2" textAlign={"right"}>
                     {dataLang?.import_total || "import_total"}
            </RowItemTable>
            <RowItemTable colSpan={1.5} textAlign={"center"} className="p-2">
              {renderMoneyOrDash(data?.rTotal?.no_start)}
            </RowItemTable>
            <RowItemTable colSpan={1.5} textAlign={"center"} className="p-2">
              {renderMoneyOrDash(data?.rTotal?.chi_start)}
            </RowItemTable>
            <RowItemTable colSpan={1.5} textAlign={"center"} className="p-2">
              {renderMoneyOrDash(data?.rTotal?.no_debt)}
            </RowItemTable>
            <RowItemTable colSpan={1.5} textAlign={"center"} className="p-2">
              {renderMoneyOrDash(data?.rTotal?.chi_debt)}
            </RowItemTable>
            <RowItemTable colSpan={1.5} textAlign={"center"} className="p-2">
              {renderMoneyOrDash(data?.rTotal?.no_end)}
            </RowItemTable>
            <RowItemTable colSpan={1.5} textAlign={"center"} className="p-2">
              {renderMoneyOrDash(data?.rTotal?.chi_end)}
            </RowItemTable>
          </ContainerTotal>
        }
        pagination={
          <div className="flex items-center justify-between gap-2">
            {data?.rResult?.length != 0 && (
              <ContainerPagination>
                {/* <TitlePagination dataLang={dataLang} totalItems={data?.output?.iTotalDisplayRecords} /> */}
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

export default DebtSuppliers;
