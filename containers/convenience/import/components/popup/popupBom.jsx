import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import {
  ArrowRight,
  FilterRemove,
  SearchNormal1 as IconSearch
} from "iconsax-react";
import { useEffect, useState } from "react";
import PopupCustom from "/components/UI/popup";

const Popup_bom = (props) => {
  const dataLang = props?.dataLang;
  const [open, sOpen] = useState(false);
  const [sroll, sSroll] = useState(false);
  const [repositionOnResiz, sRepositionOnResiz] = useState(false);
  const [data_ex, sData_ex] = useState([]);

  useEffect(() => {
    sData_ex(props.data);
    props?.data?.length > 0 && sOpen(true);
    props?.data?.length > 0 && sSroll(true);
    props?.data?.length > 0 && sRepositionOnResiz(true);
  }, [props.data]);

  return (
    <PopupCustom
      title={
        <>
          <span className="text-red-500 capitalize">
            {`${dataLang?.import_total_detection || "import_total_detection"} ${props?.data?.length
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
      <div className="mt-4 space-x-5 3xl:w-[850px] xxl:w-[840px] 2xl:w-[830px] xl:w-[820px] lg:w-[810px] w-[810px] h-auto">
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
                            Dòng {e?.row}
                          </h6>
                          <h6>-</h6>
                          <h6 className="font-bold text-black-500">Mã</h6>
                          <h6 className="font-bold text-blue-500">{e?.code}</h6>
                          <h6 className="font-bold text-black-500">tên</h6>
                          <h6 className="font-bold text-blue-500">{e?.name}</h6>
                          <h6 className="font-semibold text-black-500">
                            {e?.error}.
                          </h6>
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
export default Popup_bom;
