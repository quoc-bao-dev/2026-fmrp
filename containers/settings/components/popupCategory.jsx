import apiCategory from "@/Api/apiSettings/apiCategory";
import MultiValue from "@/components/UI/mutiValue/multiValue";
import PopupCustom from "@/components/UI/popup";
import SelectOptionLever from "@/components/UI/selectOptionLever/selectOptionLever";
import { useBranchList } from "@/hooks/common/useBranch";
import useToast from "@/hooks/useToast";
import { Edit as IconEdit } from "iconsax-react";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import { useCostCombobox } from "../hooks/useCategory";

const PopupCategory = (props) => {
    const router = useRouter();

    const isShow = useToast();

    const tabPage = router.query?.tab;

    const scrollAreaRef = useRef(null);
    const handleMenuOpen = () => {
        const menuPortalTarget = scrollAreaRef.current;
        return { menuPortalTarget };
    };

    const [open, sOpen] = useState(false);

    const _ToggleModal = (e) => sOpen(e);

    const [onSending, sOnSending] = useState(false);

    const [unit, sUnit] = useState("");

    const [stages_code, sTagesCode] = useState("");

    const [stages_name, sTagesName] = useState("");

    const [stages_status, sTagesStatus] = useState("0");

    const [stages_note, sTagesNote] = useState("");

    const [costs_code, sCosts_Code] = useState(null);

    const [costs_name, sCosts_Name] = useState(null);

    const [costs_branch, sCosts_Branch] = useState([]);

    const [errInput, sErrInput] = useState(false);

    const [errInputcode, sErrInputcode] = useState(false);

    const [errInputName, sErrInputName] = useState(false);

    const [errCode, sErrcode] = useState(false);

    const [errName, sErrName] = useState(false);

    const [errBranch, sErrBranch] = useState(false);

    const [idCategory, sIdCategory] = useState(null);

    const { data: dataBranch } = useBranchList();

    const { data: dataOption } = useCostCombobox(open, props.data?.id)

    useEffect(() => {
        sErrInput(false);
        open && sCosts_Code(props.data?.code ? props.data?.code : "");
        open && sCosts_Name(props.data?.name ? props.data?.name : "");
        open && sCosts_Branch(props.data?.branch?.length > 0 ? props.data?.branch?.map((e) => ({ label: e.name, value: e.id })) : []);
        open && sIdCategory(props.data?.parent_id ? props.data?.parent_id : null);
        sErrcode(false);
        sErrName(false);
        sErrBranch(false);
        sErrInputcode(false);
        sErrInputName(false);
        sTagesName(props.data?.name ? props.data?.name : "");
        sTagesCode(props.data?.code ? props.data?.code : "");
        sTagesStatus(props.data?.status_qc ? props.data?.status_qc : "");
        sTagesNote(props.data?.note ? props.data?.note : "");
        sUnit(props.data?.unit ? props.data?.unit : "");
    }, [open]);

    const _ServerSending = async () => {
        const id = props.data?.id;
        let data = new FormData();
        if (tabPage === "units") {
            data.append("unit", unit);
        }
        if (tabPage === "stages") {
            data.append("code", stages_code);
            data.append("name", stages_name);
            data.append("status_qc", stages_status);
            data.append("note", stages_note);
        }
        if (tabPage === "costs") {
            data.append("code", costs_code);
            data.append("name", costs_name);
            data.append("parent_id", idCategory);
            costs_branch?.map((e, index) => {
                data.append(`branch_id[${index}]`, e?.value);
            });
        }
        const url = id
            ? `${(tabPage === "units" && `/api_web/Api_unit/unit/${id}?csrf_protection=true `) ||
            (tabPage === "stages" && `/api_web/api_product/stage/${id}?csrf_protection=true`) ||
            (tabPage === "costs" && `/api_web/Api_cost/cost/${id}?csrf_protection=true`)
            } `
            : `${(tabPage === "units" && `/api_web/Api_unit/unit/?csrf_protection=true`) ||
            (tabPage === "stages" && `/api_web/api_product/stage/?csrf_protection=true`) ||
            (tabPage === "costs" && `/api_web/Api_cost/cost/?csrf_protection=true`)
            } `
        try {
            const { isSuccess, message } = await apiCategory.apiHandingCategory(url, data)
            if (isSuccess) {
                isShow("success", props.dataLang[message]);
                sUnit("");
                sTagesCode("");
                sTagesName("");
                sTagesNote("");
                sTagesStatus("");
                sErrInput(false);
                sErrcode(false);
                sErrName(false);
                sCosts_Code("");
                sCosts_Name("");
                sIdCategory(null);
                sErrInputcode(false);
                sErrInputName(false);
                sCosts_Branch([]);
                sErrBranch(false);
                sOpen(false);
                props.onRefresh && props.onRefresh();
            } else {
                isShow("error", props.dataLang[message]);
            }
        } catch (error) {

        }
        sOnSending(false);
    };

    useEffect(() => {
        onSending && _ServerSending();
    }, [onSending]);

    const _HandleChangeInput = (type, value) => {
        if (type == "unit") {
            sUnit(value.target?.value);
        } else if (type == "code") {
            sTagesCode(value.target?.value);
        } else if (type == "name") {
            sTagesName(value.target?.value);
        } else if (type === "status") {
            if (value.target?.checked === false) {
                sTagesStatus("0");
            } else if (value.target?.checked === true) {
                sTagesStatus("1");
            }
        } else if (type == "note") {
            sTagesNote(value.target?.value);
        } else if (type == "costs_code") {
            sCosts_Code(value.target?.value);
        } else if (type == "costs_name") {
            sCosts_Name(value.target?.value);
        } else if (type == "costs_branch") {
            sCosts_Branch(value);
        }
    };

    const valueIdCategory = (e) => sIdCategory(e?.value);


    const _HandleSubmit = (e) => {
        e.preventDefault();
        if (tabPage === "units") {
            if (unit == "") {
                unit == "" && sErrInput(true);
                isShow("error", props.dataLang?.required_field_null);
            } else {
                sOnSending(true);
            }
        } else if (tabPage === "stages") {
            if (stages_name == "") {
                stages_name == "" && sErrInputName(true);
                stages_code == "" && sErrInputcode(true);
                isShow("error", props.dataLang?.required_field_null);
            } else {
                sOnSending(true);
            }
        } else if (tabPage === "costs") {
            if (costs_code == "" || costs_name == "" || costs_branch?.length == 0) {
                costs_code == "" && sErrcode(true);
                costs_name == "" && sErrName(true);
                costs_branch?.length == 0 && sErrBranch(true);
                isShow("error", props.dataLang?.required_field_null);
            } else {
                sOnSending(true);
            }
        }
    };
    useEffect(() => {
        sErrInput(false);
    }, [unit.length > 0]);

    useEffect(() => {
        sErrInputName(false);
        sErrInputcode(false);
    }, [stages_code.length > 0, stages_name?.length > 0]);

    useEffect(() => {
        sErrcode(false);
    }, [costs_code != ""]);

    useEffect(() => {
        sErrName(false);
    }, [costs_name != ""]);

    useEffect(() => {
        sErrBranch(false);
    }, [costs_branch?.length > 0]);


    return (
        <PopupCustom
            title={
                props.data?.id
                    ? `${(tabPage === "units" && props.dataLang?.category_unit_edit) ||
                    (tabPage === "stages" && props.dataLang?.settings_category_stages_edit) ||
                    (tabPage === "costs" && props.dataLang?.expense_edit) ||
                    "expense_edit"
                    }`
                    : `${(tabPage === "units" && props.dataLang?.category_unit_add) ||
                    (tabPage === "stages" && props.dataLang?.settings_category_stages_add) ||
                    (tabPage === "costs" && props.dataLang?.expense_add) ||
                    "expense_add"
                    }`
            }
            button={props.data?.id ? <IconEdit /> : `${props.dataLang?.branch_popup_create_new}`}
            onClickOpen={_ToggleModal.bind(this, true)}
            open={open}
            onClose={_ToggleModal.bind(this, false)}
            classNameBtn={props.className}
        >
            <div className={`w-[33vw] mt-4`}>
                <form onSubmit={_HandleSubmit.bind(this)}>
                    <div>
                        {tabPage === "units" && (
                            <React.Fragment>
                                <div className="flex flex-wrap justify-between">
                                    <label className="text-[#344054] font-normal text-sm mb-1 ">
                                        {props.dataLang?.category_unit_name} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        value={unit}
                                        onChange={_HandleChangeInput.bind(this, "unit")}
                                        name="fname"
                                        type="text"
                                        className={`${errInput ? "border-red-500" : "focus:border-[#92BFF7] border-[#d0d5dd]"
                                            } placeholder:text-slate-300 w-full bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-1.5 border outline-none mb-2`}
                                    />
                                    {errInput && (
                                        <label className="mb-4  text-[14px] text-red-500">
                                            {"Vui lòng nhập tên đơn vị"}
                                        </label>
                                    )}
                                </div>
                            </React.Fragment>
                        )}
                        {tabPage === "stages" && (
                            <React.Fragment>
                                <div className="flex flex-wrap justify-between">
                                    {/* <div className="w-full">
                                        <label className="text-[#344054] font-normal text-sm mb-1 ">
                                            {props.dataLang?.settings_category_stages_codeAdd ||
                                                "settings_category_stages_codeAdd"}
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <div>
                                            <input
                                                // value={stages_code}
                                                // onChange={_HandleChangeInput.bind(this, "code")}
                                                placeholder={
                                                    props.dataLang?.settings_category_stages_codeAdd ||
                                                    "settings_category_stages_codeAdd"
                                                }
                                                name="fname"
                                                type="text"
                                                className={`"focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-1.5 border outline-none mb-2`}
                                            />
                                        </div>
                                    </div> */}
                                    <div className="w-full">
                                        <label className="text-[#344054] font-normal text-sm mb-1 ">
                                            {/* {props.dataLang?.settings_category_stages_codenName ||
                                                "settings_category_stages_codenName"} */}
                                            {props.dataLang?.settings_category_stages_codeAdd ||
                                                "settings_category_stages_codeAdd"}
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <div>
                                            <input
                                                value={stages_code}
                                                onChange={_HandleChangeInput.bind(this, "code")}
                                                placeholder={
                                                    // props.dataLang?.settings_category_stages_codenName ||
                                                    // "settings_category_stages_codenName"
                                                    props.dataLang?.settings_category_stages_codeAdd ||
                                                    "settings_category_stages_codeAdd"
                                                }
                                                name="fname"
                                                type="text"
                                                className={`${errInputcode
                                                    ? "border-red-500 border"
                                                    : "focus:border-[#92BFF7] border-[#d0d5dd]"
                                                    } placeholder:text-slate-300 w-full bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-1.5 border outline-none mb-2`}
                                            />
                                            {errInputcode && (
                                                <label className="mb-4  text-[14px] text-red-500">
                                                    {props.dataLang?.settings_category_stages_errCode}
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                    <div className="w-full">
                                        <label className="text-[#344054] font-normal text-sm mb-1 ">
                                            {props.dataLang?.settings_category_stages_name}
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <div>
                                            <input
                                                value={stages_name}
                                                onChange={_HandleChangeInput.bind(this, "name")}
                                                placeholder={props.dataLang?.settings_category_stages_name}
                                                name="fname"
                                                type="text"
                                                className={`${errInputName
                                                    ? "border-red-500"
                                                    : "focus:border-[#92BFF7] border-[#d0d5dd]"
                                                    } placeholder:text-slate-300 w-full bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-1.5 border outline-none mb-2`}
                                            />
                                            {errInputName && (
                                                <label className="mb-4  text-[14px] text-red-500">
                                                    {props.dataLang?.settings_category_stages_errName}
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    <div className="w-full flex justify-between flex-wrap">
                                        <div className="inline-flex items-center w-[50%] gap-3.5">
                                            <label
                                                className="relative flex cursor-pointer items-center rounded-full p-1"
                                                htmlFor="1"
                                                data-ripple-dark="true"
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-indigo-500 checked:bg-indigo-500 checked:before:bg-indigo-500 "
                                                    id="1"
                                                    value={stages_status}
                                                    checked={
                                                        stages_status === "0" ? false : stages_status === "1" && true
                                                    }
                                                    onChange={_HandleChangeInput.bind(this, "status")}
                                                />
                                                <div className="pointer-events-none absolute top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-3.5 w-3.5"
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
                                            <label
                                                htmlFor="1"
                                                className="text-[#344054] font-medium text-base  cursor-pointer "
                                            >
                                                {props.dataLang?.settings_category_stages_status}
                                            </label>
                                        </div>
                                    </div>

                                    <div className="w-full flex justify-between flex-wrap">
                                        <div className="w-full ">
                                            <label className="text-[#344054] font-normal text-sm mb-1 ">
                                                {props.dataLang?.settings_category_stages_note}
                                            </label>
                                            <textarea
                                                value={stages_note}
                                                placeholder={props.dataLang?.settings_category_stages_note}
                                                onChange={_HandleChangeInput.bind(this, "note")}
                                                name="fname"
                                                type="text"
                                                className="focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full min-h-[140px] h-[40px] max-h-[240px] bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-2 border outline-none mb-2"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </React.Fragment>
                        )}
                        {tabPage === "costs" && (
                            <React.Fragment>
                                <div className="py-4 space-y-5">
                                    <div className="space-y-1">
                                        <label className="text-[#344054] font-normal text-base">
                                            {props.dataLang?.expense_code || "expense_code"}{" "}
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            value={costs_code}
                                            onChange={_HandleChangeInput.bind(this, "costs_code")}
                                            type="text"
                                            placeholder={props.dataLang?.expense_code || "expense_code"}
                                            className={`${errCode ? "border-red-500" : "focus:border-[#92BFF7] border-[#d0d5dd] "
                                                } placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal  p-2 border outline-none`}
                                        />
                                        {errCode && (
                                            <label className="text-sm text-red-500">
                                                {props.dataLang?.expense_errCode || "expense_errCode"}
                                            </label>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[#344054] font-normal text-base">
                                            {props.dataLang?.expense_name || "expense_name"}{" "}
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            value={costs_name}
                                            onChange={_HandleChangeInput.bind(this, "costs_name")}
                                            type="text"
                                            placeholder={props.dataLang?.expense_name || "expense_name"}
                                            className={`${errName ? "border-red-500" : "focus:border-[#92BFF7] border-[#d0d5dd] "
                                                } placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal  p-2 border outline-none`}
                                        />
                                        {errName && (
                                            <label className="text-sm text-red-500">
                                                {props.dataLang?.expense_errName || "expense_errName"}
                                            </label>
                                        )}
                                    </div>
                                    <div className="col-span-6 max-h-[65px] min-h-[65px]">
                                        <label className="text-[#344054] font-normal text-base mb-1 ">
                                            {props.dataLang?.expense_branch || "expense_branch"}{" "}
                                            <span className="text-red-500">*</span>
                                        </label>
                                        <Select
                                            closeMenuOnSelect={true}
                                            placeholder={props.dataLang?.expense_branch || "expense_branch"}
                                            options={dataBranch}
                                            isSearchable={true}
                                            onChange={_HandleChangeInput.bind(this, "costs_branch")}
                                            value={costs_branch}
                                            isMulti
                                            components={{ MultiValue }}
                                            LoadingIndicator
                                            noOptionsMessage={() => "Không có dữ liệu"}
                                            maxMenuHeight="200px"
                                            isClearable={true}
                                            menuPortalTarget={document.body}
                                            onMenuOpen={handleMenuOpen}
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
                                                    zIndex: 9999,
                                                    position: "absolute",
                                                }),
                                            }}
                                            className={`${errBranch ? "border-red-500" : "border-transparent"
                                                } text-sm placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] mb-2 font-normal outline-none border `}
                                        />
                                        {errBranch && (
                                            <label className="mb-2 text-sm text-red-500">
                                                {props.dataLang?.expense_errBranch || "expense_errBranch"}
                                            </label>
                                        )}
                                    </div>
                                    <div className="space-y-1 mt-2">
                                        <label className="text-[#344054] font-normal text-base">
                                            {props.dataLang?.expense_group || "expense_group"}
                                        </label>
                                        <Select
                                            options={dataOption}
                                            formatOptionLabel={SelectOptionLever}
                                            defaultValue={
                                                idCategory == "0" || !idCategory
                                                    ? { label: `${"Nhóm cha"}` }
                                                    : {
                                                        label: dataOption.find((x) => x?.parent_id == idCategory)?.label,
                                                        code: dataOption.find((x) => x?.parent_id == idCategory)?.code,
                                                        value: idCategory
                                                    }
                                            }
                                            value={
                                                idCategory == "0" || !idCategory
                                                    ? {
                                                        label: "Nhóm cha",
                                                        code: "nhóm cha",
                                                    }
                                                    : {
                                                        label: dataOption.find((x) => x?.value == idCategory)?.label,
                                                        code: dataOption.find((x) => x?.value == idCategory)?.code,
                                                        value: idCategory,
                                                    }
                                            }
                                            onChange={valueIdCategory.bind(this)}
                                            isClearable={true}
                                            placeholder={"Nhóm cha"}
                                            className="placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal outline-none"
                                            isSearchable={true}
                                            theme={(theme) => ({
                                                ...theme,
                                                colors: {
                                                    ...theme.colors,
                                                    primary25: "#EBF5FF",
                                                    primary50: "#92BFF7",
                                                    primary: "#0F4F9E",
                                                },
                                            })}
                                        />
                                    </div>
                                </div>
                            </React.Fragment>
                        )}

                        <div className="text-right mt-5 space-x-2">
                            <button
                                type="button"
                                onClick={_ToggleModal.bind(this, false)}
                                className="button text-[#344054] font-normal text-base py-2 px-4 rounded-lg border border-solid border-[#D0D5DD]"
                            >
                                {props.dataLang?.branch_popup_exit}
                            </button>
                            <button
                                type="submit"
                                className="button text-[#FFFFFF]  font-normal text-base py-2 px-4 rounded-lg bg-[#003DA0]"
                            >
                                {props.dataLang?.branch_popup_save}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </PopupCustom>
    );
};
export default PopupCategory