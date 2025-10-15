import Breadcrumb from "@/components/UI/breadcrumb/BreadcrumbCustom";
import OnResetData from "@/components/UI/btnResetData/btnReset";
import ContainerPagination from "@/components/UI/common/ContainerPagination/ContainerPagination";
import TitlePagination from "@/components/UI/common/ContainerPagination/TitlePagination";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import { EmptyExprired } from "@/components/UI/common/EmptyExprired";
import {
  ColumnTable,
  HeaderTable,
  RowItemTable,
  RowTable,
} from "@/components/UI/common/Table";
import {
  ContainerTotal,
  LayOutTableDynamic,
} from "@/components/UI/common/layout";
import DropdowLimit from "@/components/UI/dropdowLimit/dropdowLimit";
import DateToDateComponent from "@/components/UI/filterComponents/dateTodateComponent";
import ExcelFileComponent from "@/components/UI/filterComponents/excelFilecomponet";
import SearchComponent from "@/components/UI/filterComponents/searchComponent";
import SelectComponent from "@/components/UI/filterComponents/selectComponent";
import Loading from "@/components/UI/loading/loading";
import NoData from "@/components/UI/noData/nodata";
import Pagination from "@/components/UI/pagination";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import { useBranchList } from "@/hooks/common/useBranch";
import { useClientComboboxNoSearchToParams } from "@/hooks/common/useClients";
import useSetingServer from "@/hooks/useConfigNumber";
import { useLimitAndTotalItems } from "@/hooks/useLimitAndTotalItems";
import usePagination from "@/hooks/usePagination";
import useStatusExprired from "@/hooks/useStatusExprired";
import { formatMoment } from "@/utils/helpers/formatMoment";
import formatMoneyConfig from "@/utils/helpers/formatMoney";
import { debounce } from "lodash";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import PopupDetailArises from "./components/details_arises";
import PopupDetailFirst from "./components/details_first";
import { useCustomerDebtList } from "./hooks/useCustomerDebtList";

const initialValue = {
  idClient: null,
  idBranch: null,
  valueDate: {
    startDate: null,
    endDate: null,
  },
};
const CustomerDebt = (props) => {
  const router = useRouter();
  const dataLang = props.dataLang;
  const dataSeting = useSetingServer();
  const { paginate } = usePagination();
  const [keySearch, sKeySearch] = useState("");
  const statusExprired = useStatusExprired();
  const [valueChange, sValueChange] = useState(initialValue);
  const { limit, updateLimit: sLimit } = useLimitAndTotalItems();

  useEffect(() => {
    const pastDays = 30;
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - pastDays);
    sValueChange((e) => ({
      ...e,
      valueDate: { startDate: pastDate, endDate: today },
    }));
  }, []);

  const params = {
    search: keySearch,
    limit: limit,
    page: router.query?.page || 1,
    "filter[branch_id]":
      valueChange.idBranch != null ? valueChange.idBranch.value : null,
    "filter[client_id]": valueChange.idClient
      ? valueChange.idClient.value
      : null,
    "filter[start_date]":
      valueChange.valueDate?.startDate != null
        ? formatMoment(
            valueChange.valueDate?.startDate,
            FORMAT_MOMENT.DATE_LONG
          )
        : null,
    "filter[end_date]":
      valueChange.valueDate?.endDate != null
        ? formatMoment(valueChange.valueDate?.endDate, FORMAT_MOMENT.DATE_LONG)
        : null,
  };

  const { data: listBranch = [] } = useBranchList();

  const { data: listClients = [] } = useClientComboboxNoSearchToParams({});

  const { data, refetch, isFetching, isLoading } = useCustomerDebtList(params);

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

  const onchangFilter = (type) => (value) =>
    sValueChange((e) => ({ ...e, [type]: value }));

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
          title: `${"Mã KH"}`,
          width: { wpx: 100 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
        {
          title: `${"Tên khách hàng"}`,
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
        { value: `${e?.thu_start ? formatNumber(e?.thu_start) : ""}` },
        { value: `${e?.no_debt ? formatNumber(e?.no_debt) : ""}` },
        { value: `${e?.thu_debt ? formatNumber(e?.thu_debt) : ""}` },
        { value: `${e?.no_end ? formatNumber(e?.no_end) : ""}` },
        { value: `${e?.thu_end ? formatNumber(e?.thu_end) : ""}` },
      ]),
    },
  ];

  const propsPopup = {
    dataLang,
    date: valueChange.valueDate,
    idBranch: valueChange.idBranch,
    idClient: valueChange.idClient,
  };

  // breadcrumb
  const breadcrumbItems = [
    {
      label: `Công nợ bán`,
      // href: "/",
    },
    {
      label: `${dataLang?.customerDebt_lits || "customerDebt_lits"}`,
    },
  ];

  return (
    <React.Fragment>
      <LayOutTableDynamic
        head={
          <Head>
            <title>
              {dataLang?.customerDebt_title || "customerDebt_title"}{" "}
            </title>
          </Head>
        }
        breadcrumb={
          <>
            {statusExprired ? (
              <EmptyExprired />
            ) : (
              // <div className="flex space-x-1 mt-4 3xl:text-sm 2xl:text-[11px] xl:text-[10px] lg:text-[10px]">
              //     <h6 className="text-[#141522]/40">{dataLang?.customerDebt_title || "customerDebt_title"}</h6>
              //     <span className="text-[#141522]/40">/</span>
              //     <h6>{dataLang?.customerDebt_lits || "customerDebt_lits"}</h6>
              // </div>
              <Breadcrumb
                items={breadcrumbItems}
                className="3xl:text-sm 2xl:text-xs xl:text-[10px] lg:text-[10px]"
              />
            )}
          </>
        }
        titleButton={
          <h2 className="text-title-section text-[#52575E] capitalize font-medium">
            {dataLang?.customerDebt_lits || "customerDebt_lits"}
          </h2>
        }
        table={
          <div className="flex flex-col h-full">
            <div className="w-full items-center flex justify-between gap-2">
              <div className="flex gap-3 items-center w-full">
                {/* <div className="grid grid-cols-4"> */}
                <SearchComponent
                  dataLang={dataLang}
                  colSpan={1}
                  onChange={_HandleOnChangeKeySearch.bind(this)}
                />
                <DateToDateComponent
                  colSpan={1}
                  value={valueChange.valueDate}
                  onChange={onchangFilter("valueDate")}
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
                  isClearable={true}
                  value={valueChange.idBranch}
                  onChange={onchangFilter("idBranch")}
                  placeholder={
                    dataLang?.purchase_order_table_branch ||
                    "purchase_order_table_branch"
                  }
                  colSpan={1}
                />
                <SelectComponent
                  options={[
                    {
                      value: "",
                      label:
                        dataLang?.customerDebt_suppliert ||
                        "customerDebt_suppliert",
                      isDisabled: true,
                    },
                    ...listClients,
                  ]}
                  colSpan={1}
                  isClearable={true}
                  onChange={onchangFilter("idClient")}
                  value={valueChange.idClient}
                  placeholder={
                    dataLang?.customerDebt_suppliert || "customerDebt_suppliert"
                  }
                />

                {/* </div> */}
              </div>
              <div className="col-span-2">
                <div className="flex items-center justify-end gap-2">
                  <OnResetData
                    sOnFetching={() => {}}
                    onClick={refetch.bind(this)}
                  />
                  <div>
                    {data?.rResult?.length > 0 && (
                      <ExcelFileComponent
                        multiDataSet={multiDataSet}
                        filename={
                          dataLang?.customerDebt_lits || "customerDebt_lits"
                        }
                        title="DSCNKH"
                        dataLang={dataLang}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
            <Customscrollbar className="h-full overflow-y-auto">
              <div className="w-[100%]">
                <HeaderTable gridCols={12}>
                  <ColumnTable colSpan={0.5} textAlign={"center"}>
                    {dataLang?.stt || "stt"}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={"left"}>
                    {dataLang?.customerDebt_code || "customerDebt_code"}
                  </ColumnTable>
                  <ColumnTable colSpan={1.5} textAlign={"left"}>
                    {dataLang?.customerDebt_suppliert ||
                      "customerDebt_suppliert"}
                  </ColumnTable>
                  <ColumnTable colSpan={3} textAlign={"left"}>
                    <ColumnTable colSpan={3} textAlign={"center"} className={"py-2"}>
                      {dataLang?.debt_suppliers_balance ||
                        "debt_suppliers_balance"}
                    </ColumnTable>
                    <div className="flex border-t border-gray-200">
                      <ColumnTable textAlign={"center"} className={"flex-1 border-r border-gray-200 pt-2"}>
                        {dataLang?.debt_suppliers_inDebt ||
                          "debt_suppliers_inDebt"}
                      </ColumnTable>
                      <ColumnTable textAlign={"center"} className={"flex-1 pt-2"}>
                        {dataLang?.customerDebt_collect ||
                          "customerDebt_collect"}
                      </ColumnTable>
                    </div>
                  </ColumnTable>
                  <ColumnTable colSpan={3} textAlign={"left"}>
                    <ColumnTable colSpan={3} textAlign={"center"} className={"py-2"}>
                      {dataLang?.debt_suppliers_Arise || "debt_suppliers_Arise"}
                    </ColumnTable>
                    <div className="flex border-t border-gray-200">
                      <ColumnTable textAlign={"center"} className={"flex-1 border-r border-gray-200 pt-2"}>
                        {dataLang?.debt_suppliers_inDebt ||
                          "debt_suppliers_inDebt"}
                      </ColumnTable>
                      <ColumnTable textAlign={"center"} className={"flex-1 pt-2"}>
                        {dataLang?.customerDebt_collect ||
                          "customerDebt_collect"}
                      </ColumnTable>
                    </div>
                  </ColumnTable>
                  <ColumnTable colSpan={3} textAlign={"left"}>
                    <ColumnTable colSpan={3} textAlign={"center"} className={"py-2"}>
                      {dataLang?.debt_suppliers_Ending ||
                        "debt_suppliers_Ending"}
                    </ColumnTable>
                    <div className="flex border-t border-gray-200">
                      <ColumnTable textAlign={"center"} className={"flex-1 border-r border-gray-200 pt-2"}>
                        {dataLang?.debt_suppliers_inDebt ||
                          "debt_suppliers_inDebt"}
                      </ColumnTable>
                      <ColumnTable textAlign={"center"} className={"flex-1 pt-2"}>
                        {dataLang?.customerDebt_collect ||
                          "customerDebt_collect"}
                      </ColumnTable>
                    </div>
                  </ColumnTable>
                </HeaderTable>
                {isLoading || isFetching ? (
                  <Loading className="h-80" color="#0f4f9e" />
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
                        <RowItemTable colSpan={1.5} textAlign={"center"} className={"!text-[#003DA0] !hover:text-blue-600"}>
                          {e.no_start == "0" ? (
                            "-"
                          ) : (
                            <PopupDetailFirst
                              name={
                                e.no_start == "0"
                                  ? "-"
                                  : formatNumber(e.no_start)
                              }
                              id={e?.id}
                              type={"no_start"}
                              className="text-left"
                              supplier_name={e.name}
                              {...propsPopup}
                            />
                          )}
                        </RowItemTable>
                        <RowItemTable colSpan={1.5} textAlign={"center"} className={"!text-[#003DA0] !hover:text-blue-600"}>
                          {e.thu_start == "0" ? (
                            "-"
                          ) : (
                            <PopupDetailFirst
                              name={
                                e.thu_start == "0"
                                  ? "-"
                                  : formatNumber(e.thu_start)
                              }
                              id={e?.id}
                              className="text-left"
                              supplier_name={e.name}
                              {...propsPopup}
                            />
                          )}
                        </RowItemTable>
                        <RowItemTable colSpan={1.5} textAlign={"center"} className={"!text-[#003DA0] !hover:text-blue-600"}>
                          {e.no_debt == "0" ? (
                            "-"
                          ) : (
                            <PopupDetailArises
                              name={
                                e.no_debt == "0" ? "-" : formatNumber(e.no_debt)
                              }
                              className="text-left uppercase"
                              id={e?.id}
                              type={"no_debt"}
                              supplier_name={e.name}
                              {...propsPopup}
                            />
                          )}
                        </RowItemTable>

                        <RowItemTable
                          colSpan={1.5}
                          textAlign={"center"}
                          className={"!text-[#003DA0] !hover:text-blue-600"}
                        >
                          {e.thu_debt == "0" ? (
                            "-"
                          ) : (
                            <PopupDetailArises
                              className="text-left uppercase"
                              name={
                                e.thu_debt == "0"
                                  ? "-"
                                  : formatNumber(e.thu_debt)
                              }
                              id={e?.id}
                              type={"thu_debt"}
                              supplier_name={e.name}
                              {...propsPopup}
                            />
                          )}
                        </RowItemTable>

                        <RowItemTable colSpan={1.5} textAlign={"center"}>
                          {e.no_end == "0" ? "-" : formatNumber(e.no_end)}
                        </RowItemTable>

                        <RowItemTable colSpan={1.5} textAlign={"center"}>
                          {e.thu_end == "0" ? "-" : formatNumber(e.thu_end)}
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
        showTotal
        total={
          <ContainerTotal className={"!grid-cols-24"}>
            <RowItemTable colSpan={3} className="p-2" textAlign={"right"}>
              {dataLang?.import_total || "import_total"}
            </RowItemTable>
            <RowItemTable colSpan={1.5} textAlign={"center"} className="p-2">
              {renderMoneyOrDash(data?.rTotal?.no_start)}
            </RowItemTable>
            <RowItemTable colSpan={1.5} textAlign={"center"} className="p-2">
              {renderMoneyOrDash(data?.rTotal?.thu_start)}
            </RowItemTable>
            <RowItemTable colSpan={1.5} textAlign={"center"} className="p-2">
              {renderMoneyOrDash(data?.rTotal?.no_debt)}
            </RowItemTable>
            <RowItemTable colSpan={1.5} textAlign={"center"} className="p-2">
              {renderMoneyOrDash(data?.rTotal?.thu_debt)}
            </RowItemTable>
            <RowItemTable colSpan={1.5} textAlign={"center"} className="p-2">
              {renderMoneyOrDash(data?.rTotal?.no_end)}
            </RowItemTable>
            <RowItemTable colSpan={1.5} textAlign={"center"} className="p-2">
              {renderMoneyOrDash(data?.rTotal?.thu_end)}
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
export default CustomerDebt;
