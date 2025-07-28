import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import {
  ColumnTable,
  HeaderTable,
  RowItemTable,
  RowTable,
} from "@/components/UI/common/Table";
import Loading from "@/components/UI/loading/loading";
import NoData from "@/components/UI/noData/nodata";
import ProgressBar from "@/components/common/progress/ProgressBar";
import { StateContext } from "@/context/_state/productions-orders/StateContext";
import useSetingServer from "@/hooks/useConfigNumber";
import { useListBomProductPlan } from "@/managers/api/productions-order/useListBomProductPlan";
import { memo, useContext, useState } from "react";

import Cardtable from "@/components/common/card/Cardtable";
import formatNumberConfig from "@/utils/helpers/formatnumber";


const TablePlaning = ({ Title, typeTable, dataLang, data }) => {
  const [limit, setLimit] = useState(5);
  const dataSeting = useSetingServer();
  const dataFormat = data?.map((item) => {
    return {
      ...item,
      total_quota: +item.total_quota < 0 ? 0 : +item.total_quota,
      quota_primary: +item.quota_primary < 0 ? 0 : +item.quota_primary,
      quantity_keep: +item.quantity_keep < 0 ? 0 : +item.quantity_keep,
      quantity_rest: +item.quantity_rest < 0 ? 0 : +item.quantity_rest,
      quantity_import: +item.quantity_import < 0 ? 0 : +item.quantity_import,
    }
  })

  const formatNumber = (number) => {
    return formatNumberConfig(+number, dataSeting);
  };

  return (
    <div className="flex flex-col h-full">
      <h3 className="font-medium text-xl leading-5 text-typo-blue-1 capitalize mb-6">
        {" "}
        {Title}
      </h3>

      {/* table */}
      <div className="flex-1 min-h-0">
        <Customscrollbar
          className={`min-h-0 h-full w-full overflow-x-auto bg-white`}
        >
          <div>
            <HeaderTable
              gridCols={12}
              display={"grid"}
              className="pt-0 px-1 pb-1"
            >
              <ColumnTable
                colSpan={1}
                textAlign={"center"}
                className={`normal-case leading-2 text-typo-gray-1 3xl:!text-[14px] xl:text-[11px]`}
              >
                STT
              </ColumnTable>
              <ColumnTable
                colSpan={3}
                textAlign={"left"}
                className={`border-none normal-case leading-2 text-typo-gray-1 3xl:px-3 px-1 std:!text-[13px] xl:text-[11px]`}
              >
                {typeTable === "products"
                  ? dataLang?.materials_planning_semi
                  : dataLang?.import_materials}
              </ColumnTable>
              {typeTable === "products" && (
                <ColumnTable
                  colSpan={2}
                  textAlign={"center"}
                  className={`border-none  normal-case leading-2 text-typo-gray-1 std:!text-[13px] xl:text-[11px]`}
                >
                  {dataLang?.category_unit || "Đơn vị tính"}
                </ColumnTable>
              )}
              <ColumnTable
                colSpan={1}
                textAlign={"center"}
                className={`px-0 border-none normal-case leading-2 text-typo-gray-1 std:!text-[13px] xl:text-[11px]`}
              >
                {/* {dataLang?.materials_planning_use || "Sử dụng"} */}
                SL
              </ColumnTable>
              {typeTable === "materials" && (
                <ColumnTable
                  colSpan={2}
                  textAlign={"center"}
                  className={`border-none normal-case leading-2 text-typo-gray-1 std:!text-[13px] xl:text-[11px]`}
                >
                  {dataLang?.materials_planning_change || "Quy đổi"}
                </ColumnTable>
              )}
              <ColumnTable
                colSpan={2}
                textAlign={"center"}
                className={`border-none  normal-case  px-0  leading-2 text-typo-gray-1 std:!text-[13px] xl:text-[11px]`}
              >
                {dataLang?.materials_planning_held || " Đã giữ"}{typeTable === "materials" ? "/Mua" : ""}
              </ColumnTable>
              <ColumnTable
                colSpan={1}
                textAlign={"center"}
                className={`border-none normal-case leading-2 text-typo-gray-1 px-0 std:!text-[13px] xl:text-[11px]`}
              >
                {dataLang?.materials_planning_lack || " Thiếu"}
              </ColumnTable>
              <ColumnTable
                colSpan={2}
                textAlign={"center"}
                className={`border-none normal-case leading-2 text-typo-gray-1 std:!text-[12px] xl:text-[11px]`}
              >
                Tiến độ
              </ColumnTable>
            </HeaderTable>
            {dataFormat && dataFormat?.length > 0 ? (
              <>
                {dataFormat?.slice(0, limit).map((item, index) => (
                  <div
                    className="divide-y divide-slate-200 h-[100%] "
                    key={item.item_id}
                  >
                    {
                      <RowTable gridCols={12}>
                        {/* stt */}
                        <RowItemTable
                          colSpan={1}
                          textAlign={"center"}
                          // textSize={`"!text-sm"`}
                          className="font-semibold xlg:text-sm leading-6 text-typo-black-1  std:!text-[12px] xl:text-[11px]"
                        >
                          {index + 1}
                        </RowItemTable>
                        <RowItemTable
                          colSpan={3}
                          textAlign={"start"}
                        // textSize={`"!text-xs"`}
                        >
                          {/* card */}
                          <Cardtable
                            name={item.item_name}
                            code={item.item_code}
                            typeProduct={item.type_products}
                            imageURL={item.images}
                            variation={item.item_variation}
                            typeTable={typeTable}
                            dataLang={dataLang}
                          />
                        </RowItemTable>
                        {typeTable === "products" && (
                          <RowItemTable
                            colSpan={2}
                            textAlign={"center"}
                            // textSize={`"!text-sm"`}
                            className="font-semibold  leading-2 text-typo-black-1 std:text-[12px] xl:text-[11px]"
                          >
                            {/* Đơn vị tính */}
                            {item.unit_name}
                          </RowItemTable>
                        )}

                        <RowItemTable
                          colSpan={1}
                          textAlign={"center"}
                          // textSize={`"!text-sm"`}
                          className="font-semibold  leading-2 text-typo-black-1 std:text-[12px] xl:text-[11px]"
                        >
                          {/* sử dụng  */}
                          {typeTable === "materials" ? (
                            <p className="std:text-[12px] xl:text-[11px]">
                              {item.total_quota <= 0 ? (
                                " - "
                              ) : (
                                <span className="std:text-[12px] xl:text-[11px]">
                                  {formatNumber(item.total_quota)}/ <br />{" "}
                                  <span className="font-normal std:text-[11px] xl:text-[9px] text-typo-black-1">
                                    {" "}
                                    {item.unit_name}
                                  </span>
                                </span>
                              )}
                            </p>
                          ) : (
                            <p className="std:text-[12px] xl:text-[11px]">
                              {item.total_quota <= 0
                                ? " - "
                                : formatNumber(item.total_quota)}
                            </p>
                          )}
                        </RowItemTable>
                        {typeTable === "materials" && (
                          <RowItemTable
                            colSpan={2}
                            textAlign={"center"}
                            // textSize={`"!text-sm"`}
                            className="font-semibold  leading-2 text-typo-black-1 std:text-[12px] xl:text-[11px]"
                          >
                            {/* quy đổi  */}
                            {item.quota_primary <= 0 ? (
                              " - "
                            ) : (
                              <span className="std:text-[12px] xl:text-[11px]">
                                {formatNumber(item.quota_primary)}/ <br />{" "}
                                <span className="font-normal std:text-[11px] xl:text-[9px] text-typo-black-1">
                                  {" "}
                                  {item.unit_name_primary}
                                </span>
                              </span>
                            )}
                          </RowItemTable>
                        )}
                        <RowItemTable
                          colSpan={2}
                          textAlign={"center"}
                          textSize={`"!text-sm"`}
                          className="font-semibold  leading-2 text-typo-black-1 std:text-[12px] xl:text-[11px]"
                        >
                          {/* Đã giữ */}

                          {typeTable === "materials" ? (
                            <p className="std:text-[12px] xl:text-[11px]">
                              {item.quantity_keep <= 0 ? (
                                " - "
                              ) : (
                                <span className="std:text-[12px] xl:text-[11px]">
                                  {formatNumber(item.quantity_keep)}/ <br />{" "}
                                  <span className="font-normal std:text-[11px] xl:text-[9px] text-typo-black-1">
                                    {" "}
                                    {item.unit_name_primary}
                                  </span>
                                </span>
                              )}
                            </p>
                          ) : (
                            <p className="std:text-[12px] xl:text-[11px]">
                              {item.quantity_keep <= 0
                                ? " - "
                                : formatNumber(item.quantity_keep)}
                            </p>
                          )}
                        </RowItemTable>
                        <RowItemTable
                          colSpan={1}
                          textAlign={"center"}
                          // textSize={`"!text-sm"`}
                          className="font-semibold  leading-2 text-typo-black-1 std:text-[12px] xl:text-[11px]"
                        >
                          {/* Thiếu */}
                          {typeTable === "materials" ? (
                            <p className="std:text-[12px] xl:text-[11px]">
                              {item.quantity_rest <= 0 ? (
                                " - "
                              ) : (
                                <span className="std:text-[12px] xl:text-[11px]">
                                  {formatNumber(item.quantity_rest)}/ <br />{" "}
                                  <span className="font-normal std:text-[11px] xl:text-[9px] text-typo-black-1">
                                    {" "}
                                    {item.unit_name_primary}
                                  </span>
                                </span>
                              )}
                            </p>
                          ) : (
                            <p className="std:text-[12px] xl:text-[11px]">
                              {item.quantity_rest <= 0
                                ? " - "
                                : formatNumber(item.quantity_rest)}
                            </p>
                          )}
                        </RowItemTable>
                        <RowItemTable
                          colSpan={2}
                          textAlign={"start"}
                          // textSize={`"!text-sm"`}
                          className={
                            "font-semibold std:text-[11px] xl:text-[9px]"
                          }
                        >
                          <ProgressBar
                            current={formatNumber(item.quantity_import)}
                            total={formatNumber(item.quantity_rest_process)}
                            name={item.unit_name_primary}
                            typeProgress="tablePlaning"
                          />
                        </RowItemTable>
                      </RowTable>
                    }
                  </div>
                ))}
              </>
            ) : (
              <>
                <NoData className="mt-0 col-span-16" type="table" />
              </>
            )}
          </div>
          <div className="w-full">
            {data?.length > 0 && (
              <div className="flex items-center w-full justify-center h-fit">
                <div />
                {limit < data.length && (
                  <div className=" flex justify-center py-2">
                    <button
                      onClick={() => setLimit(data.length)}
                      className="text-[#667085] 3xl:text-base xl:text-sm text-xs hover:underline font-semibold"
                    >
                      Xem thêm ({data.length - limit}){" "}
                      {typeTable === "products"
                        ? `${dataLang?.materials_planning_semi}`
                        : `${dataLang?.import_materials}`}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Customscrollbar>
      </div>
    </div>
  );
};

const PlaningProductionOrder = memo(({ dataLang }) => {
  const { isStateProvider, queryStateProvider } = useContext(StateContext);
  //truyền id của kế hoạch sản xuất
  const { data: dataListBom, isLoading: isLoadingDataListBom } =
    useListBomProductPlan({
      id: isStateProvider?.productionsOrders?.dataProductionOrderDetail?.pp_id,
    });

  return (
    <div className="flex flex-row w-full h-full items-start justify-between">
      {/* bảng nguyên liêu */}
      <div className=" w-[50%] h-full  border-r border-border-gray-1 pr-4">
        {isLoadingDataListBom ? (
          <Loading className="h-80" color="#0f4f9e" />
        ) : (
          <TablePlaning
            Title="kế hoạch nguyên vật liệu"
            dataLang={dataLang}
            data={dataListBom?.data?.materialsBom}
            typeTable="materials"
          />
        )}
      </div>

      {/* bảng bán thành phẩm  */}
      <div className="w-[50%] h-full  pl-4">
        {isLoadingDataListBom ? (
          <Loading className="h-80" color="#0f4f9e" />
        ) : (
          <TablePlaning
            Title="kế hoạch bán thành phẩm"
            dataLang={dataLang}
            data={dataListBom?.data?.productsBom}
            typeTable="products"
          />
        )}
      </div>
    </div>
  );
});

export default PlaningProductionOrder;
