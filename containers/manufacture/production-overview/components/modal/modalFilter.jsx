import Zoom from "components/UI/zoomElement/zoomElement";
import Image from "next/image";
import { useState } from "react";
import DatePicker from "react-datepicker";
import Select from "react-select";

const ModalFilter = ({ isShow, handleIsShowFilter }) => {
    const [startDate, setStartDate] = useState(new Date());
    const [progresbar, sProgressbar] = useState([
        {
            name: "Đơn hàng",
            height: 10,
        },
        {
            name: "Khách hàng",
            height: 75,
        },
        {
            name: "Sản phẩm",
            height: 80,
        },
        {
            name: "Trạng thái",
            height: 30,
        },
    ]);
    return (
        <>
            <div
                style={{
                    transform: isShow.showFillter ? "translateX(0%)" : "translateX(100%)", // Thêm transform translatex
                }}
                className={`bg-[#FFFFFF] absolute 3xl:top-[70px] xxl:top-[53px] 2xl:top-[60px] xl:top-[52px] lg:top-[44px]  right-0  transition-all duration-300 ease-linear h-[100vh] w-[500px] shadow-md z-[999]`}
            >
                <div className="px-6">
                    <div className="border-b border-gray-300 flex justify-between py-4 ">
                        <h1 className="text-[#0284c7]">Bộ lọc</h1>
                        <button
                            onClick={() => handleIsShowFilter(!isShow.showFillter)}
                            type="button"
                            className="w-[20px] h-[20px]  hover:animate-spin transition-all duration-300 ease-linear"
                        >
                            <Image
                                alt=""
                                src={"/manufacture/x.png"}
                                width={20}
                                height={20}
                                className="w-full h-full object-cover"
                            />
                        </button>
                    </div>
                    <div className="flex items-center gap-4 mt-7">
                        <div className="w-1/2">
                            <label htmlFor="start" className="text-sm text-gray-500 font-medium">
                                Từ ngày
                            </label>
                            <div className="w-full">
                                <DatePicker
                                    id="start"
                                    calendarClassName="rasta-stripes"
                                    clearButtonClassName="text"
                                    selected={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    isClearable
                                    placeholderText="Từ ngày"
                                    className="p-3 placeholder:text-[12px] placeholder:text-[#6b7280] text-[14px] my-1 w-full outline-none focus:outline-none border-none bg-[#f9fafb] rounded-lg"
                                />
                            </div>
                        </div>
                        <div className="w-1/2">
                            <label htmlFor="start" className="text-sm text-gray-500 font-medium">
                                Đến ngày
                            </label>
                            <div className="w-full">
                                <DatePicker
                                    id="start"
                                    calendarClassName="rasta-stripes"
                                    clearButtonClassName="text"
                                    selected={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    isClearable
                                    placeholderText="Đến ngày"
                                    className="p-3 placeholder:text-[12px] placeholder:text-[#6b7280] text-[14px] my-1 w-full outline-none focus:outline-none border-none bg-[#f9fafb] rounded-lg"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="my-3">
                        <label htmlFor="order" className="text-sm text-gray-500 font-medium">
                            Đơn hàng
                        </label>
                        <Select
                            options={[
                                { label: "test", value: 1 },
                                { label: "test", value: 2 },
                            ]}
                            value={{ label: "test", value: 1 }}
                            placeholder={"Chọn đơn hàng"}
                            hideSelectedOptions={false}
                            isClearable={true}
                            className=""
                            classNamePrefix="customSlectFilter"
                            isSearchable={true}
                            noOptionsMessage={() => "Không có dữ liệu"}
                            closeMenuOnSelect={true}
                            style={{
                                border: "none",
                                boxShadow: "none",
                                outline: "none",
                            }}
                            theme={(theme) => ({
                                ...theme,
                                colors: {
                                    ...theme.colors,
                                    primary25: "#EBF5FF",
                                    primary50: "#92BFF7",
                                    primary: "#0F4F9E",
                                },
                            })}
                            styles={{
                                placeholder: (base) => ({
                                    ...base,
                                    color: "#cbd5e1",
                                }),
                                menuPortal: (base) => ({
                                    ...base,
                                    // zIndex: 9999,
                                }),
                                control: (base, state) => ({
                                    ...base,
                                    ...(state.isFocused && {
                                        border: "0 0 0 1px #92BFF7",
                                        boxShadow: "none",
                                    }),
                                }),
                            }}
                        />
                    </div>
                    <div className="my-3">
                        <label htmlFor="user" className="text-sm text-gray-500 font-medium">
                            Khách hàng
                        </label>
                        <Select
                            className="placeholder:text-xs"
                            placeholder="Chọn khách hàng"
                            menuPortalTarget={document.body}
                            classNamePrefix="customSlectFilter"
                            style={{
                                border: "none",
                                boxShadow: "none",
                                outline: "none",
                            }}
                            theme={(theme) => ({
                                ...theme,
                                colors: {
                                    ...theme.colors,
                                    primary25: "#EBF5FF",
                                    primary50: "#92BFF7",
                                    primary: "#0F4F9E",
                                },
                            })}
                            styles={{
                                placeholder: (base) => ({
                                    ...base,
                                    color: "#cbd5e1",
                                }),
                                menuPortal: (base) => ({
                                    ...base,
                                    // zIndex: 9999,
                                }),
                                control: (base, state) => ({
                                    ...base,
                                    ...(state.isFocused && {
                                        border: "0 0 0 1px #92BFF7",
                                        boxShadow: "none",
                                    }),
                                }),
                            }}
                        />
                    </div>
                    <div className="my-3">
                        <label htmlFor="product" className="text-sm text-gray-500 font-medium">
                            Sản phẩm
                        </label>
                        <Select
                            className=""
                            placeholder="Chọn sản phẩm"
                            menuPortalTarget={document.body}
                            classNamePrefix="customSlectFilter"
                            style={{
                                border: "none",
                                boxShadow: "none",
                                outline: "none",
                            }}
                            theme={(theme) => ({
                                ...theme,
                                colors: {
                                    ...theme.colors,
                                    primary25: "#EBF5FF",
                                    primary50: "#92BFF7",
                                    primary: "#0F4F9E",
                                },
                            })}
                            styles={{
                                placeholder: (base) => ({
                                    ...base,
                                    color: "#cbd5e1",
                                }),
                                menuPortal: (base) => ({
                                    ...base,
                                    // zIndex: 9999,
                                }),
                                control: (base, state) => ({
                                    ...base,
                                    ...(state.isFocused && {
                                        border: "0 0 0 1px #92BFF7",
                                        boxShadow: "none",
                                    }),
                                }),
                            }}
                        />
                    </div>
                    <div className="my-3">
                        <label htmlFor="product" className="text-sm text-gray-500 font-medium">
                            Trạng thái
                        </label>
                        <Select
                            className="placeholder:text-xs"
                            menuPortalTarget={document.body}
                            placeholder="Chọn trạng thái"
                            classNamePrefix="customSlectFilter"
                            style={{
                                border: "none",
                                boxShadow: "none",
                                outline: "none",
                            }}
                            theme={(theme) => ({
                                ...theme,
                                colors: {
                                    ...theme.colors,
                                    primary25: "#EBF5FF",
                                    primary50: "#92BFF7",
                                    primary: "#0F4F9E",
                                },
                            })}
                            styles={{
                                placeholder: (base) => ({
                                    ...base,
                                    color: "#cbd5e1",
                                }),
                                menuPortal: (base) => ({
                                    ...base,
                                    // zIndex: 9999,
                                }),
                                control: (base, state) => ({
                                    ...base,
                                    ...(state.isFocused && {
                                        border: "0 0 0 1px #92BFF7",
                                        boxShadow: "none",
                                    }),
                                }),
                            }}
                        />
                    </div>
                    <div className="flex justify-around items-center gap-10 mt-6">
                        <Zoom>
                            <button
                                type="button"
                                className="bg-white hover:bg-blue-600 transition-all duration-300 ease-in hover:text-white hover:scale-x-105 my-4 outline-none border-gray-100 border py-3 w-[90%] rounded-2xl text-gray-600 text-sm font-medium"
                            >
                                Xóa bộ lọc
                            </button>
                        </Zoom>
                        <Zoom>
                            <button
                                type="button"
                                className="bg-white hover:bg-blue-600 transition-all duration-300 ease-in hover:text-white hover:scale-x-105 my-4 outline-none border-gray-100 border py-3 w-[90%] rounded-2xl text-gray-600 text-sm font-medium"
                            >
                                Tìm kiếm
                            </button>
                        </Zoom>
                    </div>
                    {/* <div className="flex justify-around items-center border-b 3xl:mt-12 2xl:mt-0">
                        {progresbar.map((e, index) => (
                            <div className="">
                                <div className="w-2 mx-auto 3xl:h-[200px] 2xl:h-[100px] relative bg-gray-200 rounded-full  dark:bg-gray-700">
                                    <div
                                        className="absolute bottom-0 bg-blue-600 w-full rounded-full rounded-b-none transition-all duration-1000 ease-linear"
                                        style={{
                                            height: `${e.height}%`,
                                        }}
                                    ></div>
                                    <div className="absolute top-0 -left-1/2 -translate-x-full text-gray-300 font-medium text-[8px]">
                                        {e.height}%
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div> */}
                </div>
            </div>
        </>
    );
};
export default ModalFilter;
