import { TiTick, TiTimes, TiArrowRight } from "react-icons/ti";
import Zoom from "./zoomElement";
const ListItem = ({ dataColumnNew, type, dataLang, HandlePushItem, isShow, dataEmty, sDataEmty }) => {

    return (
        <div className="h-full overflow-y-auto">
            {/* <div className="scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 overflow-auto 3xl:h-[50vh] xxl:h-[26vh] 2xl:h-[40vh] xl:h-[26vh] lg:h-[28vh]"> */}
            {dataColumnNew && dataColumnNew?.map((e, index) => {
                return (
                    <div key={index} className="mx-2 my-2">
                        <Zoom>
                            <button
                                onClick={() => HandlePushItem(e.value, type, dataEmty, sDataEmty)}
                                className="inline-flex items-center justify-between w-full gap-2 p-2 text-sm font-medium transition-all duration-200 ease-in-out border group hover:bg-gray-100 rounded-xl hover:border-gray-200"
                            >
                                <span className="3xl:text-[14px] xxl:text-[13px] 2xl:text-[11px] xl:text-[10px] text-[11px]">
                                    {dataLang[e.label] || e.label}
                                </span>
                                {isShow ? (
                                    <>
                                        <TiTick
                                            size="20"
                                            color="green"
                                            className="transition-all duration-200 ease-in-out group-hover:hidden"
                                        />
                                        <TiTimes
                                            size="20"
                                            color="red"
                                            className="hidden transition-all duration-200 ease-in-out group-hover:block"
                                        />
                                    </>
                                ) : (
                                    <TiArrowRight size="20" color="gray" className="" />
                                )}
                            </button>
                        </Zoom>
                    </div>
                );
            })}
        </div>
    );
};
export default ListItem;
