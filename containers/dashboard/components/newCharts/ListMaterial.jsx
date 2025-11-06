import Cardtable from "@/components/common/card/Cardtable";
import CalendarDropdown, {
  timeRanges,
} from "@/components/common/dropdown/CalendarDropdown";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import {
  ColumnTable,
  HeaderTable,
  RowItemTable,
  RowTable,
} from "@/components/UI/common/Table";
import NoData from "@/components/UI/noData/nodata";
import { useGetMaterialsToPurchase } from "@/hooks/dashboard/useGetMaterialsToPurchase";
import useSetingServer from "@/hooks/useConfigNumber";
import formatNumberConfig from "@/utils/helpers/formatnumber";
import { getDateRangeFromValue } from "@/utils/helpers/getDateRange";
import { useEffect, useState } from "react";
const ListMaterial = () => {
  const [materials, setMaterials] = useState([]);
  const [limit, setLimit] = useState(5);
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [date, setDate] = useState(timeRanges[4]);
  const { data, isLoading } = useGetMaterialsToPurchase({
    dateEnd: dateEnd,
    dateStart: dateStart,
  });
  const dataSeting = useSetingServer();
  const formatNumber = (number) => {
    return formatNumberConfig(+number, dataSeting);
  };

  useEffect(() => {
    if (date) {
      const range = getDateRangeFromValue(date.value);
      setDateStart(range ? range.startDate : "");
      setDateEnd(range ? range.endDate : "");
    }
  }, [date]);

  useEffect(() => {
    if (!isLoading && data) {
      setMaterials(data?.items);
    }
  }, [isLoading, data]);

  return (
    <div className="max-h-[600px] rounded-2xl h-full flex flex-col overflow-hidden bg-white w-full shadow-[0px_12px_24px_-4px_rgba(145,158,171,0.12),0px_0px_2px_0px_rgba(145,158,171,0.20)]">
      <div className="py-6 px-4 flex justify-between items-center">
        <h2 className="flex-1 capitalize text-lg font-medium text-typo-black-1">
          Nguyên Vật Liệu Cần Mua
        </h2>
        <CalendarDropdown setState={setDate} />
      </div>
      <div className="flex-1 min-h-0 h-full">
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
                className={`normal-case leading-2 text-typo-gray-5 3xl:!text-[14px] xl:text-[11px]
                                          }`}
              >
                STT
              </ColumnTable>
              <ColumnTable
                colSpan={5}
                textAlign={"left"}
                className={`border-none normal-case leading-2 text-typo-gray-5 3xl:px-3 px-1 std:!text-[13px] xl:text-[11px]
                                          }`}
              >
                Nguyên vật liệu
              </ColumnTable>
              <ColumnTable
                colSpan={3}
                textAlign={"center"}
                className={`border-none  normal-case leading-2 text-typo-gray-5 std:!text-[13px] xl:text-[11px]
                                              }`}
              >
                Đơn vị tính
              </ColumnTable>
              <ColumnTable
                colSpan={3}
                textAlign={"center"}
                className={`px-0 border-none normal-case leading-2 text-typo-gray-5 std:!text-[13px] xl:text-[11px]
                                          }`}
              >
                Số lượng
              </ColumnTable>
            </HeaderTable>
            {materials && materials?.length > 0 ? (
              <>
                {materials?.slice(0, limit).map((item, index) => (
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
                          className="font-semibold xlg:text-sm leading-2 text-typo-black-1  std:!text-[12px] xl:text-[11px]"
                        >
                          {index + 1}
                        </RowItemTable>
                        <RowItemTable
                          colSpan={5}
                          textAlign={"start"}
                        // textSize={`"!text-xs"`}
                        >
                          {/* card */}
                          <Cardtable
                            code={item.item_code}
                            name={item.item_name}
                            typeTable="materials"
                            classNameImage="2xl:size-10 size-8"
                            variation={item?.item_variation}
                            imageURL={item?.images}
                          />
                        </RowItemTable>
                        <RowItemTable
                          colSpan={3}
                          textAlign={"center"}
                          // textSize={`"!text-sm"`}
                          className="font-semibold  leading-2 text-typo-black-1 std:text-[12px] xl:text-[11px]"
                        >
                          {/* Đơn vị tính */}
                          {item.unit_name}
                        </RowItemTable>

                        <RowItemTable
                          colSpan={3}
                          textAlign={"center"}
                          // textSize={`"!text-sm"`}
                          className="font-semibold  leading-2 text-typo-black-1 std:text-[12px] xl:text-[11px]"
                        >
                          {formatNumber(+item.quantity)}
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
            {materials?.length > 0 && (
              <div className="flex items-center w-full justify-center h-fit">
                <div />
                {limit < materials.length && (
                  <div className=" flex justify-center py-2">
                    <button
                      onClick={() => setLimit(materials.length)}
                      className="text-[#667085] 3xl:text-base xl:text-sm text-xs hover:underline font-semibold"
                    >
                      Xem thêm ({materials.length - limit}){" "}
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

export default ListMaterial;
