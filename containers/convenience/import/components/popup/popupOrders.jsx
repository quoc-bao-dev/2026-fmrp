import { useEffect, useState } from "react";
import { ArrowRight, FilterRemove } from "iconsax-react";
import PopupCustom from "/components/UI/popup";

const Popup_orders = (props) => {
  const dataLang = props?.dataLang;
  const [open, setOpen] = useState(false);
  const [lockScroll, setLockScroll] = useState(false);
  const [repositionOnResiz, setRepositionOnResiz] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(props.data || []);
    if (props?.totalFalse > 0) {
      setOpen(true);
      setLockScroll(true);
      setRepositionOnResiz(true);
    }
  }, [props.data, props.totalFalse]);

  return (
    <PopupCustom
      title={
        <>
          <span className="text-red-500 capitalize">
            {`${dataLang?.import_total_detection || "import_total_detection"} ${props?.totalFalse || 0
              } ${dataLang?.import_error || "import_error"}`}
          </span>
        </>
      }
      open={open}
      onClose={() => setOpen(false)}
      classNameBtn={props.className}
      lockScroll={lockScroll}
      repositionOnResiz={repositionOnResiz}
    >
      <div className="mt-4 space-x-5 w-[620px] h-auto">
        <div className="min:h-[200px] h-[82%] max:h-[500px] overflow-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
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
          <div className="pr-2 w-full">
            {data?.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {data.map((item) => (
                  <div
                    key={item.id}
                    className="py-3 hover:bg-slate-50"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <ArrowRight
                        size="18"
                        color="red"
                        className="transition-all animate-pulse animate-bounce-custom"
                      />
                      {item.order_code && (
                        <span className="font-semibold text-blue-600 text-sm">
                          {`Order: ${item.order_code}`}
                        </span>
                      )}
                      {item.rowIndex && (
                        <span className="responsive-text-base text-gray-600">
                          {`${dataLang?.row || "Dòng"} ${item.rowIndex}:`}
                        </span>
                      )}
                    </div>
                     <div className="pl-6">
                       <ul className="list-disc list-inside space-y-1">
                         {(item.error || []).map((err, idx) => (
                           <li
                             key={`${item.id}-${idx}`}
                             className="responsive-text-sm text-gray-800"
                           >
                             {err}
                           </li>
                         ))}
                       </ul>
                     </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="max-w-[352px] mt-24 mx-auto text-center">
                <h1 className="text-[#141522] text-base opacity-90 font-medium">
                  {props.dataLang?.purchase_order_table_item_not_found ||
                    "purchase_order_table_item_not_found"}
                </h1>
              </div>
            )}
          </div>
        </div>
      </div>
    </PopupCustom>
  );
};

export default Popup_orders;

