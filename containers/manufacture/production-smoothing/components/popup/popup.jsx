import SelectComponent from "components/UI/filterComponents/selectComponent";
import Zoom from "components/UI/zoomElement/zoomElement";
import Image from "next/image";
import { useState } from "react";
import DatePicker from "react-datepicker";
import { components } from "react-select";
import PopupCustom from "/components/UI/popup";

const initialValue = {
    startDate: null,
    endDate: null,
    stages: [],
    satff: [],
};

const PopupAdd = ({ data, listStaff }) => {
    const dataFake = { ...data };
    const [isOpenPopup, sIsOpenPopup] = useState(false);
    const [valueChange, sValueChange] = useState(initialValue);
    const handleOpenPopup = (e) => sIsOpenPopup(e);
    const [checkboxes, setCheckboxes] = useState(dataFake.data.map((i) => ({ ...i, checked: false })));

    const handleCheckboxChange = (id) => {
        setCheckboxes(
            checkboxes.map((checkbox) => (checkbox.id === id ? { ...checkbox, checked: !checkbox.checked } : checkbox))
        );
    };
    const handleSelectAll = () => {
        const anyChecked = checkboxes.some((checkbox) => checkbox.checked);
        setCheckboxes(
            checkboxes.map((checkbox) => ({
                ...checkbox,
                checked: !anyChecked,
            }))
        );
    };
    const handleChange = (type) => (event) => sValueChange((e) => ({ ...e, [type]: event }));

    const CustomOption = (props) => (
        <div className="">
            <components.Option {...props}>
                <div className="flex items-center gap-2 cursor-pointer">
                    <label
                        className="relative flex items-center cursor-pointer rounded-[4px] p-0.5"
                        htmlFor={props.value}
                    >
                        <input
                            type="checkbox"
                            id={props.value}
                            className="peer relative h-[18px] w-[18px] cursor-pointer appearance-none rounded-[4px] border border-gray-200 transition-all  checked:border-blue-500 checked:bg-blue-500 "
                            checked={props.isSelected}
                        // onChange={() => props.selectProps.onChange(props.data)}
                        />
                        <div className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-3 h-3"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                stroke="currentColor"
                                strokeWidth="1"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                ></path>
                            </svg>
                        </div>
                    </label>
                    <h1 className="text-xs font-normal ">{props.label}</h1>
                </div>
            </components.Option>
        </div>
    );

    return (
        <PopupCustom
            title={
                <>
                    <h1 className="font-medium text-xl text-[#101828]">Phân bổ nhân viên</h1>
                    <h1 className="font-light text-sm text-[#667085] my-1">
                        Thêm nhân viên vào các công đoạn của lệnh sản xuất
                    </h1>
                </>
            }
            classNameTittle="items-start"
            button={
                <button
                    type="button"
                    className="bg-[#003DA0] rounded-md hover:scale-105 transition-all duration-200 ease-linear 3xl:py-2.5 xxl:py-2 2xl:py-2 xl:py-1 lg:py-1 py-3  px-4 flex items-center gap-2"
                >
                    <Image src={"/productionSmoothing/Icon.png"} width={16} height={16} className="object-cover" />
                    <h3 className="text-sm font-medium text-white transition-all duration-200 ease-linear">
                        Phân bổ nhân viên
                    </h3>
                </button>
            }
            onClickOpen={() => handleOpenPopup(true)}
            open={isOpenPopup}
            onClose={() => handleOpenPopup(false)}
        // classNameBtn={props?.className}
        >
            <div className="flex items-center space-x-4 my-2 border-[#E7EAEE] border-opacity-70 border-b-[1px]"></div>
            <div className="space-x-1 3xl:w-[950px]  xxl:w-[650px] 2xl:w-[650px] xl:w-[640px] lg:w-[640px] w-[700px] 3xl:h-auto xxl:h-[480px]  2xl:h-[520px] xl:h-[480px] lg:h-[500px] h-[500px] ">
                <div className="flex items-center gap-6 my-4">
                    <div className="w-1/2 z-[999]">
                        <label
                            htmlFor="start"
                            className="3xl:text-sm xxl:text-[13px] 2xl:text-xs xl:text-[11px] lg:text-[10px] text-[13px]  text-[#344054] font-normal ml-1"
                        >
                            Ngày bắt đầu
                        </label>
                        <div className="relative w-full">
                            <DatePicker
                                id="start"
                                calendarClassName="rasta-stripes"
                                clearButtonClassName="text"
                                // selected={startDate}
                                onChange={handleChange("startDate")}
                                isClearable
                                portalId="menu-time"
                                placeholderText="Ngày bắt đầu"
                                className="p-2.5 placeholder:text-[12px] placeholder:text-[#6b7280] text-[14px] w-full outline-none focus:outline-none 
                                    border-[#E1E1E1] focus:border-[#0F4F9E] focus:border-2 border  rounded-[9px]"
                            />
                            <Image
                                alt=""
                                src={"/productionSmoothing/calendar.png"}
                                width={24}
                                height={24}
                                className="absolute right-0 -translate-x-1/2 -translate-y-1/2 top-1/2"
                            />
                        </div>
                    </div>
                    <div className="w-1/2 ">
                        <label
                            htmlFor="start"
                            className="3xl:text-sm xxl:text-[13px] 2xl:text-xs xl:text-[11px] lg:text-[10px] text-[13px]  text-[#344054] font-normal ml-1"
                        >
                            Ngày kết thúc
                        </label>
                        <div className="relative w-full">
                            <DatePicker
                                id="start"
                                calendarClassName="rasta-stripes"
                                clearButtonClassName="text"
                                // selected={startDate}
                                portalId="menu-time"
                                onChange={handleChange("endDate")}
                                isClearable
                                placeholderText="Ngày kết thúc"
                                className="p-2.5 placeholder:text-[12px] placeholder:text-[#6b7280] text-[14px] w-full outline-none focus:outline-none 
                                    border-[#E1E1E1] focus:border-[#0F4F9E] focus:border-2 border  rounded-[9px] z-[999]"
                            />
                            <Image
                                alt=""
                                src={"/productionSmoothing/calendar.png"}
                                width={24}
                                height={24}
                                className="absolute right-0 -translate-x-1/2 -translate-y-1/2 top-1/2"
                            />
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <h2 className="text-[#344054] font-normal 3xl:text-sm xxl:text-[13px] 2xl:text-xs xl:text-[11px] lg:text-[10px] text-[13px]">
                        Chọn lệnh sản xuất
                    </h2>
                    <button
                        onClick={() => handleSelectAll()}
                        type="button"
                        className="text-[#3276FA] 3xl:text-sm xxl:text-[13px] 2xl:text-xs xl:text-[11px] lg:text-[10px] text-[13px] font-normal transition-all duration-200 ease-linear hover:text-blue-700"
                    >
                        {checkboxes.filter((e) => e.checked).length > 0 ? `Bỏ chọn tất cả (${checkboxes.filter((e) => e.checked).length})` : `Chọn tất cả (${checkboxes.length})`}
                    </button>
                </div>
                <div
                    className={` flex flex-wrap justify-between 3xl:max-h-[250px] xxl:max-h-[150px] 2xl:max-h-[190px] xl:max-h-[150px] lg:max-h-[170px] overflow-y-auto overflow-x-hidden
                   scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 `}
                >
                    {checkboxes.map((checkbox) => (
                        <Zoom
                            key={checkbox.id}
                            className="w-fit"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 1.02 }}
                        >
                            <div className="border border-[#D0D5DD] my-3 mx-1 rounded-lg ">
                                <label htmlFor={checkbox.id} className="flex items-center gap-2 p-2 cursor-pointer">
                                    <label
                                        className="relative flex items-center  cursor-pointer rounded-[4px] p-0.5"
                                        htmlFor={checkbox.id}
                                    >
                                        <input
                                            type="checkbox"
                                            id={checkbox.id}
                                            className="peer relative h-[18px] w-[18px] cursor-pointer appearance-none rounded-[4px] border border-blue-gray-200 transition-all  checked:border-blue-500 checked:bg-blue-500 "
                                            checked={checkbox.checked}
                                            onChange={() => handleCheckboxChange(checkbox.id)}
                                        />
                                        <div className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-3 h-3"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                                stroke="currentColor"
                                                strokeWidth="1"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                ></path>
                                            </svg>
                                        </div>
                                    </label>
                                    <div className="grid items-center justify-center gap-1 grid-cols-13 ">
                                        <Image
                                            src={checkbox.image}
                                            alt=""
                                            className="object-cover col-span-3"
                                            width={44}
                                            height={44}
                                        />
                                        <div className="col-span-10">
                                            <h3 className="text-[#0F4F9E] text-left 3xl:text-sm xxl:text-[14px] 2xl:text-[14px] xl:text-[14px] lg:text-[14px] text-[14px] font-semibold my-0.5">
                                                {checkbox.name}
                                            </h3>
                                            <h3 className="text-[#52575E] text-left 3xl:text-sm xxl:text-[14px] 2xl:text-[14px] xl:text-[14px] lg:text-[14px] text-[14px] font-normal">
                                                {checkbox.desriptions}
                                            </h3>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </Zoom>
                    ))}
                </div>
                <div className="">
                    <h2 className="text-[#344054] font-normal my-3 3xl:text-sm xxl:text-[13px] 2xl:text-xs xl:text-[11px] lg:text-[10px] text-[13px]">
                        Chọn công đoạn
                    </h2>
                    <SelectComponent
                        isMulti={true}
                        closeMenuOnSelect={false}
                        value={valueChange.stages}
                        onChange={handleChange("stages")}
                        options={[
                            { label: "Cắt", value: "1" },
                            { label: "May", value: "2" },
                            { label: "Thêu", value: "3" },
                            { label: "In", value: "4" },
                            { label: "Giat", value: "5" },
                            { label: "Sấy", value: "6" },
                            { label: "Khâu", value: "7" },
                        ]}
                        components={{ MultiValue, Option: CustomOption }}
                        classNamePrefix={"productionSmoothingPopupStages"}
                        placeholder={"Chọn 1 hoặc nhiều công đoạn"}
                        styles={{
                            multiValue: (base) => ({
                                ...base,
                                backgroundColor: "#1760B9", // Đặt màu nền cho giá trị đã chọn,
                                borderRadius: "4px",
                                padding: "2px 0px", // Thêm padding 5px
                                color: "white", // Đặt màu chữ cho giá trị đã chọn
                            }),
                            multiValueLabel: (styles, { data }) => ({
                                ...styles,
                                color: "white",
                                fontSize: "12px",
                            }),
                            multiValueRemove: (styles, { data }) => ({
                                ...styles,
                                color: "white",
                                ":hover": {
                                    backgroundColor: "transparent",
                                    color: "white",
                                },
                            }),
                            option: (styles, { data, isDisabled, isFocused, isSelected }) => {
                                return {
                                    ...styles,
                                    backgroundColor: isDisabled
                                        ? undefined
                                        : isSelected
                                            ? "#1760B9"
                                            : isFocused
                                                ? "white"
                                                : undefined,
                                    cursor: isDisabled ? "not-allowed" : "default",
                                    color: !isDisabled ? (isSelected ? "white" : "black") : undefined,
                                    fontWeight: "500",
                                    ":active": {
                                        ...styles[":active"],
                                        backgroundColor: !isDisabled ? (isSelected ? "#1760B9" : "white") : undefined,
                                        color: "white",
                                    },
                                };
                            },
                        }}
                        maxMenuHeight="120px"
                        className="z-[999]"
                    />
                </div>
                <div className="">
                    <h2 className="text-[#344054] font-normal my-3 3xl:text-sm xxl:text-[13px] 2xl:text-xs xl:text-[11px] lg:text-[10px] text-[13px]">
                        Chọn nhân viên
                    </h2>
                    <SelectComponent
                        isMulti={true}
                        closeMenuOnSelect={false}
                        value={valueChange.satff}
                        onChange={handleChange("satff")}
                        options={listStaff}
                        components={{ MultiValue }}
                        classNamePrefix={"productionSmoothingPopupStaf"}
                        placeholder={"Chọn 1 hoặc nhiều nhân viên"}
                        formatOptionLabel={(option) => (
                            <div className="text-[#0F4F9E] w-fit flex items-center gap-1 py-1 pl-1 pr-8  font-medium text-sm bg-[#EBF5FF] rounded-2xl ">
                                <div
                                    style={{
                                        backgroundImage: `linear-gradient(to left, ${option.bland}, ${option.drak})`,
                                    }}
                                    // className="bg-gradient-to-l from-blue-400/80 to-[#1556D9] text-sm  rounded-full h-[20px]  w-[20px] text-[#FFFFFF] flex items-center justify-center">
                                    className="bg-gradient-to-l from-blue-400/80 to-[#1556D9] text-xs  rounded-full h-[20px]  w-[20px] text-[#FFFFFF] flex items-center justify-center"
                                >
                                    {option.label[0]}
                                </div>
                                <h1>{option.label}</h1>
                            </div>
                        )}
                        styles={{
                            multiValue: (base) => ({
                                ...base,
                                backgroundColor: "transparent", // Đặt màu nền cho giá trị đã chọn,
                                borderRadius: "4px",
                                color: "white", // Đặt màu chữ cho giá trị đã chọn
                                borderRadius: "12px",
                            }),
                            multiValueLabel: (styles, { data }) => ({
                                ...styles,
                                color: "white",
                                padding: "0",
                            }),
                            multiValueRemove: (styles, { data }) => ({
                                ...styles,
                                color: "#0F4F9E",
                                left: 0,
                                transform: "translate(-150%, 0)",
                                ":hover": {
                                    backgroundColor: "transparent",
                                    color: "#0F4F9E",
                                },
                            }),
                        }}
                        maxMenuHeight="120px"
                    />
                </div>
                <div className="mt-5 space-x-2 text-right">
                    <button
                        type="button"
                        onClick={() => handleOpenPopup(false)}
                        className="button text-[#344054] font-normal text-base py-2 px-4 rounded-[5.5px] border border-solid border-[#D0D5DD] hover:scale-105 transition-all ease-linear"
                    >
                        {"Hủy"}
                    </button>
                    <button
                        type="submit"
                        className="button text-[#FFFFFF]  font-normal text-base py-2 px-4 rounded-[5.5px] bg-[#003DA0] hover:scale-105 transition-all ease-linear"
                    >
                        {"Thực hiện"}
                    </button>
                </div>
            </div>
        </PopupCustom>
    );
};
const MoreSelectedBadge = ({ items }) => {
    const style = {
        marginLeft: "auto",
        background: "#d4eefa",
        borderRadius: "4px",
        fontSize: "14px",
        padding: "1px 3px",
        order: 99,
    };

    const title = items.join(", ");
    const length = items.length;
    const label = `+ ${length}`;

    return (
        <div style={style} title={title}>
            {label}
        </div>
    );
};
const MultiValue = ({ index, getValue, ...props }) => {
    const maxToShow = 3;
    const overflow = getValue()
        .slice(maxToShow)
        .map((x) => x.label);

    return index < maxToShow ? (
        <components.MultiValue {...props} />
    ) : index === maxToShow ? (
        <MoreSelectedBadge items={overflow} />
    ) : null;
};
export default PopupAdd;
