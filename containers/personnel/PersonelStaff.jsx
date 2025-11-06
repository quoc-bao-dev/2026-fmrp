import apiSatff from "@/Api/apiPersonnel/apiStaff";
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
import MultiValue from "@/components/UI/mutiValue/multiValue";
import NoData from "@/components/UI/noData/nodata";
import Pagination from "@/components/UI/pagination";
import PopupConfim from "@/components/UI/popupConfim/popupConfim";
import SelectOptionLever from "@/components/UI/selectOptionLever/selectOptionLever";
import {
  CONFIRMATION_OF_CHANGES,
  TITLE_STATUS,
} from "@/constants/changeStatus/changeStatus";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import {
  WARNING_STATUS_ROLE,
  WARNING_STATUS_ROLE_ADMIN,
} from "@/constants/warningStatus/warningStatus";
import { useBranchList } from "@/hooks/common/useBranch";
import { usePositionLits } from "@/hooks/common/usePositions";
import { useLimitAndTotalItems } from "@/hooks/useLimitAndTotalItems";
import usePagination from "@/hooks/usePagination";
import useStatusExprired from "@/hooks/useStatusExprired";
import useToast from "@/hooks/useToast";
import { useToggle } from "@/hooks/useToggle";
import { formatMoment } from "@/utils/helpers/formatMoment";
import { getColorByParam } from "@/utils/helpers/radomcolor";
import { useMutation } from "@tanstack/react-query";
import { Grid6 } from "iconsax-react";
import { debounce } from "lodash";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import ModalImage from "react-modal-image";
import { useSelector } from "react-redux";
import PopupStaff from "./components/staff/popup";
import PopupDetail from "./components/staff/popupDetail";
import { useStaffList } from "./hooks/staff/useStaffList";

const initalState = {
  onSending: false,
  idPos: null,
  room: [],
  valueBr: [],
  keySearch: "",
  refreshing: false,
};
const PersonelStaff = (props) => {
  const router = useRouter();

  const isShow = useToast();

  const dataLang = props.dataLang;

  // hook phân trang
  const { paginate } = usePagination();

  const [status, sStatus] = useState("");

  const [active, sActive] = useState("");

  const statusExprired = useStatusExprired();

  const [isState, sIsState] = useState(initalState);

  // cờ để show popup xóa
  const { isOpen, isKeyState, handleQueryId } = useToggle();

  const queryState = (key) => sIsState((prev) => ({ ...prev, ...key }));
  // hook set limit table
  const { limit, updateLimit: sLimit } = useLimitAndTotalItems();

  const { is_admin: role, permissions_current: auth } = useSelector(
    (state) => state.auth
  );

  // params lọc danh sách
  const params = {
    search: isState.keySearch,
    limit: limit,
    page: router.query?.page || 1,
    "filter[branch_id]":
      isState.valueBr?.length > 0 ? isState.valueBr.map((e) => e.value) : null,
    "filter[position_id]": isState.idPos?.value,
  };

  // danh sách chức vụ
  const { data: listPosition = [] } = usePositionLits();

  // danh sách chi nhánh
  const { data: listBranch = [] } = useBranchList();

  // danh sách table
  const { data, isFetching, isLoading, refetch } = useStaffList(params);

  // hàm tiếm kiếm trong table
  const _HandleOnChangeKeySearch = debounce(({ target: { value } }) => {
    queryState({ keySearch: value });
    router.replace({
      pathname: router.route,
      query: {
        tab: router.query?.tab,
      },
    });
  }, 500);

  // xóa trong table
  const handleDelete = async () => {
    sStatus(isKeyState);
    const index = data?.rResult.findIndex((x) => x.id === isKeyState);

    if (index !== -1) {
      if (data.rResult[index].active === "0") {
        data.rResult[index].active = "1";
        sActive("1");
      } else if (data.rResult[index].active === "1") {
        data.rResult[index].active = "0";
        sActive("0");
      }
    }
    handleQueryId({ status: false });
  };

  /// đổi trạng thái hoạt động
  const handingStatus = useMutation({
    mutationFn: (data) => {
      return apiSatff.apiHandingStatus(data, status);
    },
  });

  const _ServerSending = () => {
    let db = new FormData();
    db.append("active", active);
    handingStatus.mutate(db, {
      onSuccess: ({ isSuccess, message }) => {
        if (isSuccess) {
          isShow("success", dataLang[message] || message);
        } else {
          isShow("error", dataLang[message] || message);
        }
      },
      onError: (error) => {
        throw error;
      },
    });
  };

  useEffect(() => {
    isState.onSending && _ServerSending();
  }, [isState.onSending]);

  useEffect(() => {
    if (active || status) {
      queryState({ onSending: true });
    }
  }, [active, status]);

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
          title: `${dataLang?.personnels_staff_table_fullname}`,
          width: { wpx: 100 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.personnels_staff_table_code}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.personnels_staff_table_email}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.personnels_staff_table_depart}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.personnels_staff_position}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.personnels_staff_table_logged}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.personnels_staff_table_active}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.personnels_staff_popup_manager}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.personnels_staff_position}`,
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
        { value: `${e.full_name ? e.full_name : ""}` },
        { value: `${e.code ? e.code : ""}` },
        { value: `${e.email ? e.email : ""}` },
        { value: `${e.department ? e.department?.map((e) => e.name) : ""}` },
        { value: `${e.position_name ? e.position_name : ""}` },
        { value: `${e.last_login ? e.last_login : ""}` },
        {
          value: `${e.active
            ? e.active == "1"
              ? "Đang hoạt động"
              : "Không hoạt động"
            : ""
            }`,
        },
        {
          value: `${e.admin ? e.admin == "1" && "Có" : e.admin == "0" && "Không"
            }`,
        },
        { value: `${e.position_name ? e.position_name : ""}` },
        { value: `${e.branch ? e.branch?.map((i) => i.name) : ""}` },
      ]),
    },
  ];

  const breadcrumbItems = [
    {
      label: `${dataLang?.header_category_personnel || "header_category_personnel"}`,
      // href: "/",
    },
    {
      label: `${dataLang?.personnels_staff_title || "personnels_staff_title"}`,
    },
  ];

  return (
    <React.Fragment>
      <LayOutTableDynamic
        head={
          <Head>
            <title>{dataLang?.personnels_staff_title}</title>
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
              {dataLang?.personnels_staff_title}
            </h2>
            <div className="flex items-center justify-end gap-2">
              {role ? (
                <PopupStaff
                  isState={isState}
                  listBranch={listBranch}
                  listPosition={listPosition}
                  onRefresh={refetch.bind(this)}
                  dataLang={dataLang}
                  className="responsive-text-sm 3xl:py-3 3xl:px-4 py-2 px-3 text-sm font-normal rounded-md bg-background-blue-2 text-white btn-animation hover:scale-105"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    isShow("error", WARNING_STATUS_ROLE_ADMIN);
                  }}
                  className="responsive-text-sm 3xl:py-3 3xl:px-4 py-2 px-3 text-sm font-normal rounded-md bg-background-blue-2 text-white  btn-animation hover:scale-105"
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
                    ...listBranch,
                  ]}
                  onChange={(e) => queryState({ valueBr: e })}
                  value={isState.valueBr}
                  placeholder={
                    dataLang?.price_quote_branch || "price_quote_branch"
                  }
                  colSpan={3}
                  components={{ MultiValue }}
                  isMulti={true}
                  closeMenuOnSelect={false}
                />
                <SelectComponent
                  options={[
                    {
                      value: "",
                      label:
                        dataLang?.personnels_staff_position ||
                        "personnels_staff_position",
                      isDisabled: true,
                    },
                    ...listPosition,
                  ]}
                  isClearable={true}
                  formatOptionLabel={SelectOptionLever}
                  onChange={(e) => queryState({ idPos: e })}
                  value={isState.idPos}
                  placeholder={
                    dataLang?.personnels_staff_position ||
                    "personnels_staff_position"
                  }
                  colSpan={3}
                />
              </div>
              <div className="flex items-center justify-end space-x-2">
                <OnResetData
                  onClick={refetch.bind(this)}
                  sOnFetching={(e) => { }}
                />
                {role ? (
                  <div className={``}>
                    {data?.rResult?.length > 0 && (
                      <ExcelFileComponent
                        multiDataSet={multiDataSet}
                        filename="Danh sách người dùng"
                        title="Dsnd"
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
                <HeaderTable gridCols={13}>
                  <ColumnTable colSpan={1} textAlign={"center"}>
                    {dataLang?.personnels_staff_table_avtar ||
                      "personnels_staff_table_avtar"}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={"center"}>
                    {dataLang?.personnels_staff_table_fullname ||
                      "personnels_staff_table_fullname"}
                  </ColumnTable>
                  <ColumnTable colSpan={2} textAlign={"center"}>
                    {dataLang?.personnels_staff_table_code ||
                      "personnels_staff_table_code"}
                  </ColumnTable>
                  <ColumnTable colSpan={2} textAlign={"left"}>
                    {dataLang?.personnels_staff_table_email ||
                      "personnels_staff_table_email"}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={"center"}>
                    {dataLang?.personnels_staff_table_depart ||
                      "personnels_staff_table_depart"}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={"center"}>
                    {dataLang?.personnels_staff_position ||
                      "personnels_staff_position"}
                  </ColumnTable>
                  <ColumnTable colSpan={2} textAlign={"center"}>
                    {dataLang?.personnels_staff_table_logged ||
                      "personnels_staff_table_logged"}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={"center"}>
                    {dataLang?.personnels_staff_table_active ||
                      "personnels_staff_table_active"}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={"left"}>
                    {dataLang?.client_list_brand || "client_list_brand"}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={"center"}>
                    {dataLang?.branch_popup_properties ||
                      "branch_popup_properties"}
                  </ColumnTable>
                </HeaderTable>
                {isFetching || isLoading ? (
                  <Loading className="h-80" color="#0f4f9e" />
                ) : data?.rResult?.length > 0 ? (
                  <>
                    <div className="divide-y divide-slate-200 min:h-[400px] h-[100%] max:h-[600px]">
                      {data?.rResult?.map((e) => {
                        const randomColors = getColorByParam(e?.full_name);
                        return (
                          <RowTable gridCols={13} key={e?.id}>
                            <RowItemTable colSpan={1} textAlign={"center"}>
                              <div className="w-[60px] h-[60px] mx-auto">
                                {/* {e?.profile_image == null ?
                                                                    <ModalImage
                                                                        small="/icon/noimagelogo.png"
                                                                        large="/icon/noimagelogo.png"
                                                                        className="object-contain w-full h-full rounded"
                                                                    />
                                                                    :
                                                                    <ModalImage
                                                                        small={e?.profile_image}
                                                                        large={e?.profile_image}
                                                                        className="w-[60px] h-[60px]  rounded-[100%] object-cover"
                                                                    />
                                                                } */}
                                {e?.profile_image ? (
                                  <ModalImage
                                    small={e?.profile_image}
                                    large={e?.profile_image}
                                    className="w-[60px] h-[60px]  rounded-[100%] object-cover"
                                  />
                                ) : (
                                  <div className="text-[#0F4F9E] ">
                                    <div
                                      style={{
                                        backgroundImage: `linear-gradient(to left, ${randomColors[1]}, ${randomColors[0]})`,
                                      }}
                                      className=" text-lg  rounded-full h-[60px] uppercase  w-[60px] text-[#FFFFFF] flex items-center justify-center"
                                    >
                                      {e?.full_name[0]}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </RowItemTable>
                            <RowItemTable colSpan={1}>
                              <PopupDetail
                                dataLang={dataLang}
                                className="3xl:text-base 2xl:text-[12.5px] xl:text-[11px] font-medium text-[9px] text-[#0F4F9E] hover:textx-blue-600 transition-all ease-linear px-2 text-left"
                                name={e.full_name}
                                id={e?.id}
                              />
                            </RowItemTable>
                            <RowItemTable colSpan={2} textAlign={"center"}>
                              {e.code}
                            </RowItemTable>
                            <RowItemTable colSpan={2} textAlign={"left"}>
                              {e.email}
                            </RowItemTable>
                            <RowItemTable colSpan={1} textAlign={"center"}>
                              <div className="flex flex-wrap gap-2">
                                {e.department?.map((x) => {
                                  return <span key={x.id}>{x.name}</span>;
                                })}
                              </div>
                            </RowItemTable>
                            <RowItemTable colSpan={1} textAlign={"center"}>
                              {e.position_name}
                            </RowItemTable>
                            <RowItemTable colSpan={2} textAlign={"center"}>
                              {e.last_login != null
                                ? formatMoment(
                                  e.last_login,
                                  FORMAT_MOMENT.DATE_TIME_SLASH_LONG
                                )
                                : ""}
                            </RowItemTable>
                            <RowItemTable colSpan={1} textAlign={"center"}>
                              <label
                                htmlFor={e.id}
                                className="relative inline-flex items-center cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  value={e.active}
                                  id={e.id}
                                  checked={e.active == "0" ? false : true}
                                  onChange={() => {
                                    if (role) {
                                      handleQueryId({
                                        initialKey: e.id,
                                        status: true,
                                      });
                                    } else {
                                      isShow(
                                        "error",
                                        WARNING_STATUS_ROLE_ADMIN
                                      );
                                    }
                                  }}
                                />

                                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                              </label>
                            </RowItemTable>
                            <RowItemTable
                              colSpan={1}
                              className="flex flex-wrap gap-1 justify-start"
                            >
                              {e.branch?.map((i, indexB) => (
                                <span className="flex flex-wrap items-center justify-start gap-2" key={indexB}>
                                  {i.name}
                                  {/* <TagBranch key={indexB}>{i.name}</TagBranch> */}
                                </span>
                              ))}
                            </RowItemTable>

                            <RowItemTable
                              colSpan={1}
                              className="flex items-center justify-center space-x-2 text-center"
                            >
                              <PopupStaff
                                onRefresh={refetch.bind(this)}
                                className="text-xs xl:text-base "
                                dataLang={dataLang}
                                name={e.name}
                                code={e.code}
                                phone_number={e.phone_number}
                                email={e.email}
                                id={e?.id}
                                listBranch={listBranch}
                                listPosition={listPosition}
                                department={e.department}
                                position_name={e.position_name}
                                last_login={e.last_login}
                                isState={isState}
                              />
                              <BtnAction
                                onRefresh={refetch.bind(this)}
                                onRefreshGroup={() => { }}
                                dataLang={dataLang}
                                id={e?.id}
                                type="personnel_staff"
                              />
                            </RowItemTable>
                          </RowTable>
                        );
                      })}
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
            <DropdowLimit
              sLimit={sLimit}
              limit={limit}
              dataLang={dataLang}
            />
          </div>
        }
      />
      <PopupConfim
        dataLang={dataLang}
        type="warning"
        title={TITLE_STATUS}
        subtitle={CONFIRMATION_OF_CHANGES}
        nameModel="personnel_staff_status"
        isOpen={isOpen}
        save={handleDelete}
        cancel={() => handleQueryId({ status: false })}
      />
    </React.Fragment>
  );
};

export default PersonelStaff;
