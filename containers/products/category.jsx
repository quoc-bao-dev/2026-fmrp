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
import SelectOptionLever from "@/components/UI/selectOptionLever/selectOptionLever";
import { WARNING_STATUS_ROLE } from "@/constants/warningStatus/warningStatus";
import { useBranchList } from "@/hooks/common/useBranch";
import { useLimitAndTotalItems } from "@/hooks/useLimitAndTotalItems";
import usePagination from "@/hooks/usePagination";
import useActionRole from "@/hooks/useRole";
import useStatusExprired from "@/hooks/useStatusExprired";
import useToast from "@/hooks/useToast";
import {
  Grid6,
  ArrowDown2 as IconDown,
  Edit as IconEdit,
  Minus as IconMinus,
} from "iconsax-react";
import { debounce } from "lodash";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Popup_Products from "./components/category/popup";
import { useProductCategory } from "./hooks/category/useProductCategory";
import { useCategoryOptions } from "./hooks/product/useCategoryOptions";

const ProductsCategory = (props) => {
  const dataLang = props.dataLang;

  const router = useRouter();

  const isShow = useToast();

  const { paginate } = usePagination();

  const statusExprired = useStatusExprired();

  const [keySearch, sKeySearch] = useState("");

  const [idBranch, sIdBranch] = useState(null);

  const [idCategory, sIdCategory] = useState(null);

  const { limit, updateLimit: sLimit } = useLimitAndTotalItems();

  const { is_admin: role, permissions_current: auth } = useSelector(
    (state) => state.auth
  );

  const { checkAdd, checkExport } = useActionRole(auth, "category_products");

  const params = {
    search: keySearch,
    limit: limit,
    page: router.query?.page || 1,
    "filter[id]": idCategory?.value ? idCategory?.value : null,
    "filter[branch_id][]":
      idBranch?.length > 0 ? idBranch.map((e) => e.value) : null,
  };

  // danh sách chi nhánh
  const { data: dataBranchOption = [] } = useBranchList();
  // danh sách nhóm thành phẩm
  const { data, isFetching, refetch } = useProductCategory(params);
  // nhóm danh mục con
  const { data: dataCategoryOption = [], refetch: refetchSup } =
    useCategoryOptions();
  // const { data: dataCategoryOption = [], refetch: refetchSup } = useItemCategoryCombobox()

  const _HandleFilterOpt = (type, value) => {
    if (type == "category") {
      sIdCategory(value);
    } else if (type == "branch") {
      sIdBranch(value);
    }
  };

  const _HandleOnChangeKeySearch = debounce(({ target: { value } }) => {
    sKeySearch(value);
    router.replace(router.route);
  }, 500);

  //Set data cho bộ lọc chi nhánh
  const hiddenOptions = idBranch?.length > 2 ? idBranch?.slice(0, 2) : [];

  const options = dataBranchOption.filter(
    (x) => !hiddenOptions.includes(x.value)
  );

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
          title: `${dataLang?.category_material_group_code ||
            "category_material_group_code"
            }`,
          width: { wpx: 150 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.category_material_group_name ||
            "category_material_group_name"
            }`,
          width: { wch: 30 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.note || "note"}`,
          width: { wch: 30 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
        {
          title: `${dataLang?.client_list_brand || "client_list_brand"}`,
          width: { wch: 40 },
          style: {
            fill: { fgColor: { rgb: "C7DFFB" } },
            font: { bold: true },
          },
        },
      ],
      data: data?.rResult?.map((e) => [
        { value: `${e.id}`, style: { numFmt: "0" } },
        { value: `${e.code}` },
        { value: `${e.name}` },
        { value: `${e.note}` },
        { value: `${e.branch?.map((e) => e.name).join(", ")}` },
      ]),
    },
  ];

  const breadcrumbItems = [
    {
      label: `${dataLang?.header_category_material || "header_category_material"
        }`,
      // href: "/",
    },
    {
      label: `${dataLang?.header_category_finishedProduct_group ||
        "header_category_finishedProduct_group"
        }`,
    },
  ];

  return (
    <React.Fragment>
      <LayOutTableDynamic
        head={
          <Head>
            <title>
              {dataLang?.header_category_finishedProduct_group ||
                "header_category_finishedProduct_group"}
            </title>
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
              {dataLang?.catagory_finishedProduct_group_title ||
                "catagory_finishedProduct_group_title"}
            </h2>
            <div className="flex items-center justify-end gap-2">
              {role == true || checkAdd ? (
                <Popup_Products
                  onRefresh={refetch.bind(this)}
                  onRefreshSub={refetchSup.bind(this)}
                  dataLang={dataLang}
                  // nameModel={"client_contact"}
                  className="responsive-text-sm 3xl:py-3 3xl:px-4 py-2 px-3 text-sm font-normal rounded-md bg-background-blue-2 text-white btn-animation hover:scale-105"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    isShow("error", WARNING_STATUS_ROLE);
                  }}
                  className="responsive-text-sm 3xl:py-3 3xl:px-4 py-2 px-3 text-sm font-normal rounded-md bg-background-blue-2 text-white btn-animation hover:scale-105"
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
                    ...options,
                  ]}
                  onChange={_HandleFilterOpt.bind(this, "branch")}
                  value={idBranch}
                  placeholder={
                    dataLang?.price_quote_branch || "price_quote_branch"
                  }
                  colSpan={3}
                  components={{ MultiValue }}
                  isMulti={true}
                  isClearable={true}
                  closeMenuOnSelect={false}
                />
                <SelectComponent
                  options={[
                    {
                      value: "",
                      label:
                        dataLang?.category_material_group_code ||
                        "category_material_group_code",
                      isDisabled: true,
                    },
                    ...dataCategoryOption,
                  ]}
                  formatOptionLabel={SelectOptionLever}
                  onChange={_HandleFilterOpt.bind(this, "category")}
                  value={idCategory}
                  placeholder={
                    dataLang?.category_material_group_code ||
                    "category_material_group_code"
                  }
                  colSpan={3}
                  isClearable={true}
                  closeMenuOnSelect={true}
                />
              </div>
              <div className="flex items-center justify-end space-x-2">
                <OnResetData
                  sOnFetching={() => { }}
                  onClick={refetch.bind(this)}
                />
                {role == true || checkExport ? (
                  <div className={``}>
                    {data?.rResult?.length > 0 && (
                      <ExcelFileComponent
                        multiDataSet={multiDataSet}
                        filename={
                          dataLang?.header_category_finishedProduct_group ||
                          "header_category_finishedProduct_group"
                        }
                        title="DSNTP"
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
              <div className="w-[100%] lg:w-[100%] ">
                <HeaderTable gridCols={11}>
                  <ColumnTable colSpan={1} />
                  <ColumnTable colSpan={2} textAlign={"left"}>
                    {dataLang?.category_material_group_code ||
                      "category_material_group_code"}
                  </ColumnTable>
                  <ColumnTable colSpan={3} textAlign={"left"}>
                    {dataLang?.category_material_group_name ||
                      "category_material_group_name"}
                  </ColumnTable>
                  <ColumnTable colSpan={2} textAlign={"left"}>
                    {dataLang?.note || "note"}
                  </ColumnTable>
                  <ColumnTable colSpan={2} textAlign={"left"}>
                    {dataLang?.client_list_brand || "client_list_brand"}
                  </ColumnTable>
                  <ColumnTable colSpan={1} textAlign={"center"}>
                    {dataLang?.branch_popup_properties ||
                      "branch_popup_properties"}
                  </ColumnTable>
                </HeaderTable>
                <div className="divide-y divide-slate-200">
                  {isFetching ? (
                    <Loading />
                  ) : data?.rResult?.length > 0 ? (
                    data?.rResult?.map((e) => (
                      <Item
                        onRefresh={refetch.bind(this)}
                        onRefreshSub={refetchSup.bind(this)}
                        dataLang={dataLang}
                        key={e.id}
                        data={e}
                      />
                    ))
                  ) : (
                    <NoData />
                  )}
                </div>
              </div>
            </Customscrollbar>
          </div>
        }
        pagination={
          <div className="flex items-center justify-between gap-2">
            {data?.rResult?.length != 0 && (
              <ContainerPagination className="flex items-center my-2 space-x-5">
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

const Item = React.memo((props) => {
  const [hasChild, sHasChild] = useState(false);

  const isShow = useToast();

  const _ToggleHasChild = () => sHasChild(!hasChild);

  const { is_admin: role, permissions_current: auth } = useSelector(
    (state) => state.auth
  );

  const { checkEdit } = useActionRole(auth, "category_products");

  useEffect(() => {
    sHasChild(false);
  }, [props.data?.children?.length == null]);

  return (
    <div key={props.data?.id}>
      <RowTable gridCols={11}>
        <RowItemTable colSpan={1} className="flex justify-center">
          <button
            disabled={props.data?.children?.length > 0 ? false : true}
            onClick={_ToggleHasChild.bind(this)}
            className={`${hasChild ? "bg-red-600" : "bg-green-600 disabled:bg-slate-300"
              } hover:opacity-80 hover:disabled:opacity-100 transition relative flex flex-col justify-center items-center h-5 w-5 rounded-full text-white outline-none`}
          >
            <IconMinus size={16} />
            <IconMinus
              size={16}
              className={`${hasChild ? "" : "rotate-90"} transition absolute`}
            />
          </button>
        </RowItemTable>
        <RowItemTable colSpan={2} textAlign={"left"}>
          {props.data?.code}
        </RowItemTable>
        <RowItemTable colSpan={3} textAlign={"left"}>
          {props.data?.name}
        </RowItemTable>
        <RowItemTable colSpan={2} textAlign={"left"}>
          {props.data?.note}
        </RowItemTable>
        <RowItemTable colSpan={2}>
          {props.data?.branch?.map((e, index) => (
            <span className="flex flex-wrap justify-start gap-2 " key={index}>
              {/* <TagBranch key={e?.id}>{e.name}</TagBranch> */}
              {e.name}
            </span>
          ))}
        </RowItemTable>
        <RowItemTable
          colSpan={1}
          className="flex justify-center px-2 space-x-2"
        >
          {role == true || checkEdit ? (
            <Popup_Products
              onRefresh={props.onRefresh}
              onRefreshSub={props.onRefreshSub}
              dataLang={props.dataLang}
              id={props.data?.id}
            />
          ) : (
            <IconEdit
              className="cursor-pointer"
              onClick={() => isShow("error", WARNING_STATUS_ROLE)}
            />
          )}
          <BtnAction
            onRefresh={props.onRefresh}
            onRefreshGroup={props.onRefreshOpt}
            dataLang={props.dataLang}
            id={props.data?.id}
            type="category_products"
          />
        </RowItemTable>
      </RowTable>
      {hasChild && (
        <div className="bg-slate-50/50">
          {props.data?.children?.map((e) => (
            <ItemsChild
              onRefresh={props.onRefresh}
              onRefreshSub={props.onRefreshSub}
              dataLang={props.dataLang}
              key={e.id}
              data={e}
              grandchild="0"
              children={e?.children?.map((e) => (
                <ItemsChild
                  onRefresh={props.onRefresh}
                  onRefreshSub={props.onRefreshSub}
                  dataLang={props.dataLang}
                  key={e.id}
                  data={e}
                  grandchild="1"
                  children={e?.children?.map((e) => (
                    <ItemsChild
                      onRefresh={props.onRefresh}
                      onRefreshSub={props.onRefreshSub}
                      dataLang={props.dataLang}
                      key={e.id}
                      data={e}
                      grandchild="2"
                    />
                  ))}
                />
              ))}
            />
          ))}
        </div>
      )}
    </div>
  );
});

const ItemsChild = React.memo((props) => {
  const isShow = useToast();

  const { is_admin: role, permissions_current: auth } = useSelector(
    (state) => state.auth
  );

  const { checkEdit } = useActionRole(auth, "category_products");
  return (
    <React.Fragment key={props.data?.id}>
      <RowTable gridCols={11}>
        {props.data?.level == "3" && (
          <RowItemTable
            colSpan={1}
            className="flex items-center justify-center h-full pl-24"
          >
            <IconDown className="rotate-45" />
          </RowItemTable>
        )}
        {props.data?.level == "2" && (
          <RowItemTable
            colSpan={1}
            className="flex items-center justify-center h-full pl-12"
          >
            <IconDown className="rotate-45" />
            <IconMinus className="mt-1.5" />
            <IconMinus className="mt-1.5" />
          </RowItemTable>
        )}
        {props.data?.level == "1" && (
          <RowItemTable
            colSpan={1}
            className="flex items-center justify-center h-full "
          >
            <IconDown className="rotate-45" />
            <IconMinus className="mt-1.5" />
            <IconMinus className="mt-1.5" />
            <IconMinus className="mt-1.5" />
            <IconMinus className="mt-1.5" />
          </RowItemTable>
        )}
        <RowItemTable colSpan={2} textAlign={"left"}>
          {props.data?.code}
        </RowItemTable>
        <RowItemTable colSpan={3} textAlign={"left"}>
          {props.data?.name}
        </RowItemTable>
        <RowItemTable colSpan={2} textAlign={"left"}>
          {props.data?.note}
        </RowItemTable>
        <RowItemTable colSpan={2}>
          {props.data?.branch.map((e, index ) => (
            <span className="flex flex-wrap justify-start gap-2 " key={index}>
              {/* <TagBranch key={e?.id}>{e.name}</TagBranch> */}
              {e.name}
            </span>
          ))}
        </RowItemTable>
        <RowItemTable colSpan={1} className="flex justify-center space-x-2">
          {role == true || checkEdit ? (
            <Popup_Products
              onRefresh={props.onRefresh}
              onRefreshSub={props.onRefreshSub}
              dataLang={props.dataLang}
              data={props.data}
              id={props.data?.id}
            />
          ) : (
            <IconEdit
              className="cursor-pointer"
              onClick={() => isShow("error", WARNING_STATUS_ROLE)}
            />
          )}
          <BtnAction
            onRefresh={props.onRefresh}
            onRefreshGroup={props.onRefreshOpt}
            dataLang={props.dataLang}
            id={props.data?.id}
            type="category_products"
          />
        </RowItemTable>
      </RowTable>
      {props.children}
    </React.Fragment>
  );
});

export default ProductsCategory;
