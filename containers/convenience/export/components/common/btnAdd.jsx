import { TiInputChecked } from "react-icons/ti";

const BtnClickAddItem = ({ dataBe, HandleCheckAll, type, parent, dataEmty, sDataEmty }) => {
    return (
        <>
            {dataBe?.length > 0 && (
                <div className="mx-2 mt-1">
                    <div
                        onClick={() => HandleCheckAll(type, parent, dataEmty, sDataEmty)}
                        className="focus:outline-teal-500 cursor-pointer outline bg-white outline-1 shadow outline-gray-50 hover:bg-teal-600 flex items-center justify-center gap-2
                        hover:text-white border-teal-400 border hover:border-teal-600 w-full transition-all duration-200 ease-linear p-2 rounded-md 3xl:text-[14px] xxl:text-[13px] 2xl:text-[12px] xl:text-[11px] text-[10px] font-medium "
                    >
                        <TiInputChecked size={18} /> Chọn tất cả
                    </div>
                </div>
            )}
        </>
    );
};
export default BtnClickAddItem;
