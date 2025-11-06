import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import { formatMoment } from "@/utils/helpers/formatMoment";
import {
  ArrowRight,
  FilterRemove,
  Grid6 as IconExcel,
  SearchNormal1 as IconSearch
} from "iconsax-react";
import { useEffect, useMemo, useState } from "react";
import ReactExport from "react-data-export";
import PopupCustom from "/components/UI/popup";

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;

const Popup_status = (props) => {
  const dataLang = props?.dataLang;
  const [open, sOpen] = useState(false);
  const [sroll, sSroll] = useState(false);
  const [repositionOnResiz, sRepositionOnResiz] = useState(false);
  const [data_ex, sData_ex] = useState([]);

  useEffect(() => {
    sData_ex(props.data);
    props?.totalFalse > 0 && sOpen(true);
    props?.totalFalse > 0 && sSroll(true);
    props?.totalFalse > 0 && sRepositionOnResiz(true);
  }, [props.data, props.totalFalse]);

  //Nối mảng kahcsh hàng - Liên hệ - Địa chỉ
  // const { values, columns } = useMemo(() => {
  //   const arrayFormater = props.data?.map((e) => {
  //     if (e?.date_incorporation) {
  //       return {
  //         ...e,
  //         date_incorporation: e?.date_incorporation
  //           ? moment(e?.date_incorporation).format("DD/MM/YYYY")
  //           : "",
  //       };
  //     }
  //     return { ...e };
  //   });

  //   const newArr = (arrayFormater || []).filter(Boolean).map((e) => {
  //     const { rowIndex, error, ...newObject } = e;
  //     return newObject;
  //   });

  //   const mappedData = newArr.map((item) => {
  //     const rowData = {};
  //     props?.listData.forEach((column) => {
  //       const value = item[column?.dataFields?.value];
  //       rowData[column?.dataFields?.value] = value || "";
  //     });
  //     return rowData;
  //   });

  //   const columns = props?.listData?.map((header) => ({
  //     title: `${header?.dataFields?.label}`,
  //     width: { wpx: 150 },
  //     style: { fill: { fgColor: { rgb: "C7DFFB" } }, font: { bold: true } },
  //   }));

  //   const values = mappedData.map((i) =>
  //     Object.values(i)?.map((e) => ({
  //       value: e,
  //       style:
  //         e == ""
  //           ? { fill: { patternType: "solid", fgColor: { rgb: "FFCCEEFF" } } }
  //           : "",
  //     }))
  //   );

  //   return { values, columns };
  // }, [props.data, props?.listData]);

  const { values, columns } = useMemo(() => {
    if (props.router == 1) {
      const arrayFormater = props.data?.map((e) => {
        if (e?.date_incorporation) {
          return {
            ...e,
            date_incorporation: e?.date_incorporation
              ? formatMoment(e?.date_incorporation, FORMAT_MOMENT.DATE_SLASH_LONG)
              : "",
          };
        }
        return { ...e };
      });

      const newArr = (arrayFormater || []).filter(Boolean).map((e) => {
        const { rowIndex, error, ...newObject } = e;
        return newObject;
      });

      const allFields = [
        ...props.listData,
        ...props.listDataContact,
        ...props.listDataDelivery,
      ];

      const mappedData = newArr.map((item) => {
        const rowData = {};
        allFields.forEach((column) => {
          const value =
            item[column.dataFieldsContact?.value] ||
            item[column.dataFieldsDelivery?.value] ||
            item[column.dataFields?.value] ||
            item[column?.value];
          rowData[column.dataFields?.value] = value || "";
          rowData[column.dataFieldsContact?.value] =
            item[column.dataFieldsContact?.value] || "";
          rowData[column.dataFieldsDelivery?.value] =
            item[column.dataFieldsDelivery?.value] || "";
        });
        return rowData;
      });

      const columns = allFields.map((header) => ({
        title: `${header.dataFields?.label ||
          header.dataFieldsContact?.label ||
          header.dataFieldsDelivery?.label
          }`,
        width: { wpx: 150 },
        style: { fill: { fgColor: { rgb: "C7DFFB" } }, font: { bold: true } },
      }));

      const values = mappedData.map((i) =>
        allFields.map((header) => {
          const value =
            i[header.dataFieldsContact?.value] ||
            i[header.dataFieldsDelivery?.value] ||
            i[header.dataFields?.value] ||
            i[header.value] ||
            (header.dataFieldsContact?.value === "contact"
              ? JSON.stringify(i.contact)
              : "") ||
            (header.dataFieldsDelivery?.value === "arrAddress"
              ? JSON.stringify(i.arrAddress)
              : "");

          return {
            value: value || "",
            style:
              value === ""
                ? {
                  fill: {
                    patternType: "solid",
                    fgColor: { rgb: "FFCCEEFF" },
                  },
                }
                : "",
          };
        })
      );

      return { values, columns };
    } else {
      const arrayFormater = props.data?.map((e) => {
        if (e?.date_incorporation) {
          return {
            ...e,
            date_incorporation: e?.date_incorporation
              ? formatMoment(e?.date_incorporation, FORMAT_MOMENT.DATE_SLASH_LONG)
              : "",
          };
        }
        return { ...e };
      });

      const newArr = (arrayFormater || []).filter(Boolean).map((e) => {
        const { rowIndex, error, ...newObject } = e;
        return newObject;
      });

      const mappedData = newArr.map((item) => {
        const rowData = {};
        props?.listData.forEach((column) => {
          const value = item[column?.dataFields?.value];
          rowData[column?.dataFields?.value] = value || "";
        });
        return rowData;
      });

      const columns = props?.listData?.map((header) => ({
        title: `${header?.dataFields?.label}`,
        width: { wpx: 150 },
        style: { fill: { fgColor: { rgb: "C7DFFB" } }, font: { bold: true } },
      }));

      const values = mappedData.map((i) =>
        Object.values(i)?.map((e) => ({
          value: e,
          style:
            e == ""
              ? { fill: { patternType: "solid", fgColor: { rgb: "FFCCEEFF" } } }
              : "",
        }))
      );

      return { values, columns };
    }
  }, [
    props.data,
    props?.listData,
    props.listDataContact,
    props.listDataDelivery,
  ]);

  const multiDataSet = [{ columns: columns, data: values }];

  return (
    <PopupCustom
      title={
        <>
          <span className="text-red-500 capitalize">
            {`${dataLang?.import_total_detection || "import_total_detection"} ${props?.totalFalse
              } ${dataLang?.import_error || "import_error"} `}{" "}
          </span>{" "}
        </>
      }
      open={open}
      onClose={() => sOpen(false)}
      classNameBtn={props.className}
      lockScroll={sroll}
      repositionOnResiz={repositionOnResiz}
    >
      <div className="mt-4 space-x-5 w-[590px] h-auto">
        <div className="min:h-[200px] h-[82%] max:h-[500px]  overflow-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
          <div className="flex items-center justify-between p-1 bg-gray-50">
            <div className="flex items-center gap-2">
              <h2 className="text-lg text-[#52575E] font-semibold">
                {dataLang?.import_detailed_error || "import_detailed_error"}
              </h2>
              <FilterRemove
                size="20"
                color="red"
                className="transition-all animate-pulse"
              />
            </div>
            {props?.router != 5 && (
              <ExcelFile
                filename={`${dataLang?.import_error_data || "import_error_data"
                  } ${(props?.router == 1 && "danh mục khách hàng") ||
                  (props?.router == 2 && "danh mục nhà cung cấp") ||
                  (props?.router == 3 && "danh mục nguyên vật liệu") ||
                  (props?.router == 4 && "danh mục thành phẩm")
                  }`}
                title="DLL"
                element={
                  <button className="xl:px-4 px-3 xl:py-2.5 py-1.5 xl:text-sm text-xs flex items-center space-x-2 bg-[#C7DFFB] rounded hover:scale-105 transition">
                    <IconExcel size={18} />
                    <span>{props.dataLang?.client_list_exportexcel}</span>
                  </button>
                }
              >
                <ExcelSheet
                  dataSet={multiDataSet}
                  data={multiDataSet}
                  name="Organization"
                />
              </ExcelFile>
            )}
          </div>
          <div className="pr-2 w-[100%] lx:w-[110%] ">
            <div
              className={`grid-cols-12  grid sticky top-0 bg-white shadow-lg  z-10`}
            ></div>
            {data_ex?.length > 0 ? (
              <>
                <Customscrollbar className="min-h-[90px] max-h-[400px]" >
                  <div className=" divide-slate-200 min:h-[170px]  max:h-[170px]">
                    {data_ex?.map((e) => (
                      <div
                        className="grid items-center grid-cols-12 border-b hover:bg-slate-50"
                        key={e.id?.toString()}
                      >
                        <h6 className="text-[13px] col-span-12    py-2.5 text-left flex items-center gap-1">
                          <ArrowRight
                            size="18"
                            color="red"
                            className="transition-all animate-pulse animate-bounce-custom"
                          />
                          <h6 className="font-semibold text-blue-500">
                            Dòng {e?.rowIndex}
                          </h6>
                          <h6>-</h6>
                          {e?.error?.map((e, index, array) => (
                            <div key={e} className="flex items-center gap-1 ">
                              <h6
                                className={`${e.includes("*")
                                  ? "text-blue-500 font-bold"
                                  : "text-black-500 font-semibold"
                                  } text-[13px] col-span-12     py-2.5 text-left "`}
                              >
                                {" "}
                                {dataLang[e] || e?.replace("*", "") || e}
                                {index === array.length - 1 && "."}
                              </h6>
                            </div>
                          ))}
                        </h6>
                      </div>
                    ))}
                  </div>
                </Customscrollbar>
              </>
            ) : (
              <div className=" max-w-[352px] mt-24 mx-auto">
                <div className="text-center">
                  <div className="bg-[#EBF4FF] rounded-[100%] inline-block ">
                    <IconSearch />
                  </div>
                  <h1 className="textx-[#141522] text-base opacity-90 font-medium">
                    {props.dataLang?.purchase_order_table_item_not_found ||
                      "purchase_order_table_item_not_found"}
                  </h1>
                  <div className="flex items-center justify-around mt-6 "></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PopupCustom>
  );
};
export default Popup_status;
