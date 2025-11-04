import { TiDeleteOutline } from "react-icons/ti";

const BtnClickDeleteItem = ({ dataBe, HandleCheckAll, type, parent, dataEmty, sDataEmty }) => {
    return (
        <>
            {dataBe?.length > 0 && (
                <div className="mx-2 mt-1">
                    <button
                        onClick={() => HandleCheckAll(type, parent, dataEmty, sDataEmty)}
                        className="focus:outline-white bg-white outline border-red-600 outline-1 shadow outline-gray-50 hover:bg-red-600 hover:text-white
                         border w-full transition-all duration-200 ease-linear p-2 rounded-md 3xl:text-[14px] xxl:text-[13px] 2xl:text-[12px] xl:text-[11px] text-[10px] font-medium hover:border-gray-200 flex items-center justify-center gap-2"
                    >
                        <TiDeleteOutline size={18} /> Bỏ chọn tất cả
                    </button>
                </div>
            )}
        </>
    );
};
export default BtnClickDeleteItem;
