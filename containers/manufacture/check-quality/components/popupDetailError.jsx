import ButtonSubmit from "@/components/UI/button/buttonSubmit";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import { ColumnTablePopup, GeneralInformation, HeaderTablePopup } from "@/components/UI/common/TablePopup";
import InPutNumericFormat from "@/components/UI/inputNumericFormat/inputNumericFormat";
import NoData from "@/components/UI/noData/nodata";
import useToast from "@/hooks/useToast";
import { isAllowedNumber } from "@/utils/helpers/common";
import { SelectCore, componentsCore } from "@/utils/lib/Select";
import { Trash as IconDelete } from "iconsax-react";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import PopupCustom from "/components/UI/popup";
const PopupDetailError = ({ data, id, quantityError, queryStateQlty, ...props }) => {
    const isShow = useToast();

    const initilaState = {
        open: false,
        dataDetailError: [
            {
                id: uuid(),
                code: "QVĐ01",
                name: "Quần vải đen 1",
                quantityDetailError: 1,
            },
            {
                id: uuid(),
                code: "QVĐ01",
                name: "Quần vải đen 2",
                quantityDetailError: 1,
            },
        ],
        dataCategoryError: [],
        dataDetailError: [],
        errorCategoryError: false,
        errorDetailError: false,
        idCategoryError: null,
        idDetailError: null,
    };

    const [isState, sIsState] = useState(initilaState);

    const queryState = (key) => sIsState((prev) => ({ ...prev, ...key }));

    const MenuList = (props) => {
        return (
            <componentsCore.MenuList {...props}>
                {/* {allItems?.length > 0 && ( */}
                <div className="grid grid-cols-2 items-center  cursor-pointer">
                    <div
                        className="hover:bg-slate-200 p-2 col-span-1 text-center text-sm"
                    // onClick={_HandleSelectAll.bind(this)}
                    >
                        Chọn tất cả
                    </div>
                    <div
                        className="hover:bg-slate-200 p-2 col-span-1 text-center text-sm"
                    // onClick={_HandleDeleteAll.bind(this)}
                    >
                        Bỏ chọn tất cả
                    </div>
                </div>
                {/* )} */}
                {props.children}
            </componentsCore.MenuList>
        );
    };

    const handeLeDelete = (id) => {
        const newData = isState.dataDetailError.filter((item) => item.id !== id);
        queryState({ dataDetailError: newData });
        addItemToParent(newData);
    };

    const addItemToParent = (arr) => {
        const arrData = data.map((e) => {
            if (e.id == id) {
                return {
                    ...e,
                    dataDetailError: arr,
                };
            }
            return e;
        });
        queryStateQlty({ listData: arrData });
    };

    useEffect(() => {
        addItemToParent(isState.dataDetailError);
    }, [isFinite.dataDetailError]);
    const _HandleChangeChild = (id, value) => {
        const newData = isState.dataDetailError.map((e) => {
            if (e.id == id) {
                return {
                    ...e,
                    quantityDetailError: +value?.value,
                };
            }
            return e;
        });
        addItemToParent(newData);
        queryState({ dataDetailError: newData });
    };

    const handeSave = () => {
        const { idCategoryError, idDetailError, dataDetailError } = isState;

        const hasInvalidQuantity = dataDetailError.some((e) => !e.quantityDetailError || e.quantityDetailError === 0);

        if (!idCategoryError || !idDetailError) {
            isShow("error", "Vui lòng kiểm tra dữ liệu");
            queryState({ errorCategoryError: !idCategoryError, errorDetailError: !idDetailError });
            return;
        }

        if (hasInvalidQuantity) {
            isShow("error", "Vui lòng nhập số lượng lỗi và số lượng lỗi phải lớn hơn 0");
            return;
        }

        queryState({ open: false });
    };

    return (
        <PopupCustom
            title={"Thêm chi tiết lỗi"}
            button={props?.name}
            onClickOpen={() => {
                if (+quantityError > 0) {
                    queryState({ open: true });
                } else {
                    isShow("error", "Vui lòng nhập số lượng lỗi và số lượng lỗi phải lớn hơn 0");
                }
            }}
            lockScroll={true}
            open={isState.open}
            onClose={() => queryState({ open: false })}
            classNameBtn={`${props?.className}`}
        >
            <div className="flex items-center space-x-4 my-2 border-[#E7EAEE] border-opacity-70 border-b-[1px]" />

            <div className="3xl:w-[600px] 2xl:w-[550px] xl:w-[500px] w-[500px] 3xl:h-auto 2xl:max-h-auto xl:h-auto h-auto ">
                <div className="overflow-auto pb-1 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 flex flex-col">
                    <GeneralInformation {...props} />
                </div>
                <div className="grid grid-cols-2 gap-5 mb-3">
                    <div className="">
                        <label className="text-[#344054] font-normal text-sm mb-1 ">
                            Danh mục lỗi
                            <span className="text-red-500 pl-1">*</span>
                        </label>
                        <SelectCore
                            options={isState.dataCategoryError}
                            onChange={(e) => {
                                queryStateQlty({ idCategoryError: e });
                            }}
                            value={isState.idCategoryError}
                            isClearable={true}
                            closeMenuOnSelect={true}
                            hideSelectedOptions={false}
                            placeholder={"Danh mục lỗi"}
                            className={`${isState.errorCategoryError && !isState.idCategoryError
                                ? "border-red-500"
                                : "border-transparent"
                                }  placeholder:text-slate-300 w-full z-30 bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border `}
                            isSearchable={true}
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
                                menu: (provided) => ({
                                    ...provided,
                                    // zIndex: 9999, // Giá trị z-index tùy chỉnh
                                }),
                                control: (base, state) => ({
                                    ...base,
                                    boxShadow: "none",
                                    padding: "2.7px",
                                    ...(state.isFocused && {
                                        border: "0 0 0 1px #92BFF7",
                                    }),
                                }),
                            }}
                        />
                    </div>
                    <div className="">
                        <label className="text-[#344054] font-normal text-sm mb-1 ">
                            Chi tiết lỗi
                            <span className="text-red-500  pl-1">*</span>
                        </label>
                        <SelectCore
                            options={isState.dataDetailError}
                            components={{ MenuList }}
                            onChange={(e) => {
                                queryStateQlty({ idDetailError: e });
                            }}
                            value={isState.idDetailError}
                            isClearable={true}
                            closeMenuOnSelect={true}
                            hideSelectedOptions={false}
                            placeholder={"Chi tiết lỗi"}
                            className={`${isState.errorDetailError && !isState.idDetailError
                                ? "border-red-500"
                                : "border-transparent"
                                }  placeholder:text-slate-300 w-full z-30 bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border `}
                            isSearchable={true}
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
                                menu: (provided) => ({
                                    ...provided,
                                    // zIndex: 9999, // Giá trị z-index tùy chỉnh
                                }),
                                control: (base, state) => ({
                                    ...base,
                                    boxShadow: "none",
                                    padding: "2.7px",
                                    ...(state.isFocused && {
                                        border: "0 0 0 1px #92BFF7",
                                    }),
                                }),
                            }}
                        />
                    </div>
                </div>
                <div className="w-full">
                    <HeaderTablePopup gridCols={6}>
                        <ColumnTablePopup colSpan={2}>{"Mã chi tiết lỗi"}</ColumnTablePopup>
                        <ColumnTablePopup colSpan={2}>{"Tên chi tiết lỗi"}</ColumnTablePopup>
                        <ColumnTablePopup colSpan={1}>{"Số lượng lỗi"}</ColumnTablePopup>
                        <ColumnTablePopup colSpan={1}>{"Tác vụ"}</ColumnTablePopup>
                    </HeaderTablePopup>
                    <Customscrollbar className="min-h-[250px] max-h-[250px] 2xl:max-h-[250px] overflow-hidden">
                        <div className="divide-y divide-slate-200 min:h-[250px]  max:h-[250px]">
                            {isState.dataDetailError?.length > 0 ? (
                                isState.dataDetailError?.map((e, index) => (
                                    <div
                                        className={`grid grid-cols-6 hover:bg-slate-50 items-center`}
                                        key={e.id?.toString()}
                                    >
                                        <h6 className="text-[13px] px-2 py-2 col-span-2 text-center">{e.code}</h6>
                                        <h6 className="text-[13px] py-2 col-span-2 font-medium text-left">{e.name}</h6>
                                        <h6 className="text-[13px] py-2 col-span-1 font-medium text-left">
                                            <InPutNumericFormat
                                                onValueChange={(event) => _HandleChangeChild(e?.id, event)}
                                                value={e.quantityDetailError || null}
                                                className={`${!e.quantityDetailError || e.quantityDetailError == 0
                                                    ? "border-red-500"
                                                    : "border-gray-300"
                                                    } border-b-2  bg-transparent appearance-none text-center 3xl:text-[12px] 2xl:text-[10px] xl:text-[9.5px] text-[9px] 3xl:px-1 2xl:px-0.5 xl:px-0.5 p-0 font-normal w-full  focus:outline-none `}
                                                isAllowed={isAllowedNumber}
                                            />
                                        </h6>
                                        <h6 className="text-[13px] py-2 col-span-1 font-medium mx-auto">
                                            <button
                                                title="Xóa"
                                                onClick={() => handeLeDelete(e.id)}
                                                className=" text-red-500 flex p-1 justify-center items-center hover:scale-110 bg-red-50  rounded-md hover:bg-red-200 transition-all ease-linear animate-bounce-custom"
                                            >
                                                <IconDelete size={24} />
                                            </button>
                                        </h6>
                                    </div>
                                ))
                            ) : (
                                <NoData />
                            )}
                        </div>
                    </Customscrollbar>
                </div>
                <div className="flex justify-end items-center">
                    <ButtonSubmit loading={false} onClick={() => handeSave()} dataLang={props.dataLang} />
                </div>
            </div>
        </PopupCustom>
    );
};
export default PopupDetailError;
