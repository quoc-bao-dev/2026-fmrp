import PopupAdd from "../popup/popup";

const Header = ({ data, listStaff }) => {
    return (
        <>
            <div className="flex space-x-1 mt-4 3xl:text-sm 2xl:text-[11px] xl:text-[10px] lg:text-[10px]">
                <h6 className="text-[#141522]/40">{"Sản xuất"}</h6>
                <span className="text-[#141522]/40">/</span>
                <h6>{"Điều độ sản xuất"}</h6>
            </div>
            <div className="flex justify-between items-center">
                <h2 className=" 2xl:text-lg text-base text-[#52575E] capitalize">
                    Điều độ sản xuất
                </h2>
                <div>
                    <PopupAdd data={data} listStaff={listStaff} className="text-left" />
                </div>
            </div>
        </>
    );
};
export default Header;
