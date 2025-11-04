import { TiInputChecked } from "react-icons/ti";

const BtnClickAddItem = ({ dataBe, HandleCheckAll, type, parent, dataEmty, sDataEmty }) => {
    return (
        <>
            {dataBe?.length > 0 && (
                <div className="mx-2 mt-1">
                    <button
                        onClick={() => HandleCheckAll(type, parent, dataEmty, sDataEmty)}
                        className="focus:outline-red-500 outline outline-1 shadow outline-gray-50 hover:bg-red-600 flex items-center justify-center gap-2
                        hover:text-white border-red-400 border hover:border-red-600 w-full transition-all duration-200 ease-linear p-2 rounded 3xl:text-[14px] xxl:text-[13px] 2xl:text-[12px] xl:text-[11px] text-[10px] font-medium "
                    >
                        <TiInputChecked size={18} /> Chọn tất cả
                    </button>
                </div>
            )}
        </>
    );
};
export default BtnClickAddItem;
