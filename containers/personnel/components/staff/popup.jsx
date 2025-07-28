import apiSatff from "@/Api/apiPersonnel/apiStaff";
import EditIcon from "@/components/icons/common/EditIcon";
import PlusIcon from "@/components/icons/common/PlusIcon";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import SelectComponent from "@/components/UI/filterComponents/selectComponent";
import PopupCustom from "@/components/UI/popup";
import SelectOptionLever from "@/components/UI/selectOptionLever/selectOptionLever";
import { WARNING_STATUS_ROLE_ADMIN } from "@/constants/warningStatus/warningStatus";
import useToast from "@/hooks/useToast";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
    Trash as IconDelete,
    Edit as IconEdit,
    GalleryEdit as IconEditImg,
    Eye as IconEye,
    EyeSlash as IconEyeSlash,
    Image as IconImage,
    SearchNormal1
} from "iconsax-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { MdClear } from "react-icons/md";
import { useSelector } from "react-redux";


const initialData = {
    open: false,
    onFetching: false,
    onSending: false,
    onFetching_Manage: false,
    errInput: false,
    errInputBr: false,
    errInputPas: false,
    errInputManage: false,
    name: "",
    code: "",
    password: "",
    phone_number: "",
    email: "",
    admin: "0",
    valueBr: [],
    dataDepar: [],
    room: [],
    tab: 0,
    thumb: null,
    isDeleteThumb: false,
    typePassword: false,
    thumbFile: null,
    idPos: null,
    manage: [],
    valueManage: [],
    valueSearch: "",
};
const Popup_dsnd = (props) => {
    const isShow = useToast();

    const scrollAreaRef = useRef(null);

    const handleMenuOpen = () => {
        const menuPortalTarget = scrollAreaRef.current;
        return { menuPortalTarget };
    };

    const [isState, setIsState] = useState(initialData);

    const queryState = (key) => setIsState((prev) => ({ ...prev, ...key }));

    // change ảnh đại diện
    const _HandleChangeFileThumb = ({ target: { files } }) => {
        const [file] = files;
        if (file) {
            queryState({ thumb: URL.createObjectURL(file), thumbFile: file });
        }
        queryState({ isDeleteThumb: false });
    };

    const { is_admin: role, permissions_current: auth } = useSelector((state) => state.auth);

    // xóa ảnh đại diện
    const _DeleteThumb = (e) => {
        e.preventDefault();
        document.getElementById("upload").value = null;
        queryState({ thumb: null, thumbFile: null, isDeleteThumb: true });
    };

    useEffect(() => {
        queryState({ thumb: isState.thumb });
    }, [isState.thumb]);

    //  danh sách modlue
    useQuery({
        queryKey: ["api_permissions_staff"],
        queryFn: async () => {
            const params = {
                position_id: isState?.positionId != isState?.idPos?.value ? isState?.idPos?.value : 0,
            }
            const { data, isSuccess, message } = await apiSatff.apiPermissionsStaff(props?.id, { params })
            if (isSuccess == 1) {
                const permissionsArray = Object.entries(data.permissions)?.map(([key, value]) => ({
                    key,
                    ...value,
                    child: Object.entries(value?.child)?.map(([childKey, childValue]) => ({
                        key: childKey,
                        ...childValue,
                        permissions: Object.entries(childValue?.permissions)?.map(
                            ([permissionsKey, permissionsValue]) => ({
                                key: permissionsKey,
                                ...permissionsValue,
                            })
                        ),
                    })),
                }));
                queryState({ room: permissionsArray });
            }
            return data
        },
        enabled: !!isState.open
    })


    // không có chức vụ thì set rỗng nhân viên
    useEffect(() => {
        isState.idPos == null && queryState({ manage: [], valueManage: [] });
    }, [isState.idPos]);

    //  chi tiết người dùng
    useQuery({
        queryKey: ["api_handle_detail_staff"],
        queryFn: async () => {
            const db = await apiSatff.apiDetailStaff(props?.id)
            queryState({
                name: db?.full_name,
                code: db?.code,
                phone_number: db?.phonenumber,
                email: db?.email,
                admin: db?.admin,
                valueBr: db?.branch?.map((e) => ({
                    label: e.name,
                    value: e.id,
                })),
                valueManage: db?.manage?.map((x) => ({
                    label: x.full_name,
                    value: Number(x.id),
                })),
                positionId: db?.position_id,
                thumb: db?.profile_image,
                idPos: db?.position_id == "0" ? null : { value: db?.position_id, label: db?.position_name },
            });
            return db
        },
        enabled: !!isState.open && !!props?.id
    })

    // change modlue
    const handleChange = (parent, child = null, permissions = null) => {
        const newData = isState.room?.map((e) => {
            if (child == null && e?.key == parent?.key) {
                return {
                    ...e,
                    child: e?.child?.map((x) => {
                        return {
                            ...x,
                            permissions: x?.permissions?.map((y) => {
                                return {
                                    ...y,
                                    is_check: parent.is_check == 0 ? 1 : 0,
                                };
                            }),
                        };
                    }),
                    is_check: parent.is_check == 0 ? 1 : 0,
                };
            } else if (child != null && e?.key == parent && e?.is_check == 1) {
                return {
                    ...e,
                    child: e?.child?.map((x) => {
                        if (x?.key == child) {
                            return {
                                ...x,
                                permissions: x?.permissions?.map((y) => {
                                    if (y?.key == permissions?.key) {
                                        return {
                                            ...y,
                                            is_check: y.is_check === 0 ? 1 : 0,
                                        };
                                    }
                                    return y;
                                }),
                            };
                        }
                        return x;
                    }),
                };
            }
            return e;
        });
        queryState({ room: newData });
    };

    //post db
    const transformData = (data) => {
        const transformedData = {};
        data.forEach((item) => {
            const { key, is_check, name, child } = item;
            const transformedChild = {};

            if (child) {
                child.forEach((childItem) => {
                    const { key: childKey, name: childName, permissions } = childItem;
                    const transformedPermissions = {};
                    if (permissions) {
                        permissions.forEach((permission) => {
                            transformedPermissions[permission.key] = {
                                name: permission.name,
                                is_check: permission.is_check,
                            };
                        });
                    }

                    transformedChild[childKey] = {
                        name: childName,
                        permissions: transformedPermissions,
                    };
                });
            }
            transformedData[key] = {
                is_check,
                name,
                child: transformedChild,
            };
        });
        return transformedData;
    };

    // lưu người dùng
    const handingStaff = useMutation({
        mutationFn: (data) => {
            return apiSatff.apiHandingStaff(props?.id, data);
        }
    })

    const _ServerSending = () => {
        const transformedResult = transformData(isState.room);
        let form = new FormData();
        form.append("full_name", isState.name || "");
        form.append("code", isState.code || "");
        form.append("password", isState.password || "");
        // department_id là id phòng ban cũ
        form.append("admin", isState.admin || "");
        form.append("phone_number", isState.phone_number || "");
        form.append("email", isState.email || "");
        isState.valueBr.forEach((e) => form.append("branch_id[]", e?.value));
        isState.valueManage.forEach((e) => form.append("manage[]", e?.value));
        form.append("profile_image", isState.thumbFile || "");
        form.append("position_id", isState.idPos?.value || "");
        form.append("is_delete_image ", isState.isDeleteThumb || "");
        const utf8Bytes = JSON.stringify(transformedResult);
        form.append("permissions", utf8Bytes);
        handingStaff.mutate(form, {
            onSuccess: ({ isSuccess, message, branch_name }) => {
                if (isSuccess) {
                    isShow("success", props?.dataLang[message] || message);
                    props.onRefresh && props.onRefresh();
                    queryState({ open: false });
                } else {
                    isShow("error", props.dataLang[message] + " " + branch_name || message);
                }
            },
            onError: (err) => {

            }
        })
        queryState({ onSending: false });
    };

    useEffect(() => {
        isState.onSending && _ServerSending();
    }, [isState.onSending]);

    // danh sách chức vụ
    useQuery({
        queryKey: ["api_staff_manage", isState.idPos],
        queryFn: async () => {
            const data = await apiSatff.apiManageStaff(isState.idPos?.value ? isState.idPos?.value : -1);
            if (isState.valueManage?.length == 0) {
                queryState({
                    manage: data?.map((e) => ({
                        label: e.full_name,
                        value: Number(e.id),
                    })),
                });
            } else if (props?.id) {
                queryState({
                    manage: data
                        ?.map((e) => ({
                            label: e.full_name,
                            value: Number(e.id),
                        }))
                        ?.filter((e) => isState.valueManage.some((x) => e.value !== x.value)),
                });
            }
            return data
        },
        enabled: !!isState.idPos
    })

    // save form
    const _HandleSubmit = (e) => {
        e.preventDefault();
        if (isState.name == "" || isState.valueBr?.length == 0 || (!props?.id && isState.password == "")) {
            isState.name == "" && queryState({ errInput: true });
            isState.valueBr?.length == 0 && queryState({ errInputBr: true });
            !props?.id && isState.password == "" && queryState({ errInputPas: true });
            isShow("error", props.dataLang?.required_field_null);
        } else {
            queryState({ onSending: true });
        }
    };
    useEffect(() => {
        queryState({ errInput: false });
    }, [isState.name != ""]);

    useEffect(() => {
        queryState({ errInputBr: false });
    }, [isState.valueBr?.length > 0]);

    useEffect(() => {
        queryState({ errInputPas: false });
    }, [isState.password != ""]);


    // tìm kiếm thì ẩn hiện modlue theo key search
    useEffect(() => {
        const filteredData = isState.room.filter((item) =>
            item.name.toLowerCase().includes(isState.valueSearch.toLowerCase())
        );
        const newdb = isState.room.map((item) => {
            const itemChecked = filteredData.find((x) => item.key == x.key);
            if (itemChecked) {
                return {
                    ...item,
                    ...itemChecked,
                    hidden: false,
                };
            }
            return {
                ...item,
                hidden: true,
            };
        });
        queryState({ room: newdb });
    }, [isState.valueSearch]);

    return (
        <>
            <PopupCustom
                title={props.id ? `${props.dataLang?.personnels_staff_popup_edit}` : `${props.dataLang?.personnels_staff_popup_add}`}
                button={props.id ?
                    // <IconEdit />
                    <div className="group rounded-lg w-full p-1 border border-transparent transition-all ease-in-out flex items-center gap-2 responsive-text-sm text-left cursor-pointer hover:border-[#064E3B] hover:bg-[#064E3B]/10">
                        <EditIcon className={`size-5 transition-all duration-300 `} />
                    </div>
                    :
                    // `${props.dataLang?.branch_popup_create_new}`
                    <p className="flex flex-row justify-center items-center gap-x-1 responsive-text-sm text-sm font-normal">
                        <PlusIcon /> {props.dataLang?.branch_popup_create_new}
                    </p>
                }
                onClickOpen={() => queryState({ open: true })}
                open={isState.open}
                onClose={() => queryState({ open: false })}
                classNameBtn={props.className}
            >
                <div className="flex items-center space-x-4 my-3 border-[#E7EAEE] border-opacity-70 border-b-[1px]">
                    <button
                        onClick={() => queryState({ tab: 0 })}
                        className={`${isState.tab === 0 ? "text-[#0F4F9E]  border-b-2 border-[#0F4F9E]" : "hover:text-[#0F4F9E] "
                            }  px-4 py-2 outline-none font-semibold`}
                    >
                        {props.dataLang?.personnels_staff_popup_info}
                    </button>
                    <button
                        onClick={() => {
                            if (role) {
                                queryState({ tab: 1 });
                            } else {
                                isShow("error", WARNING_STATUS_ROLE_ADMIN);
                            }
                        }}
                        className={`${isState.tab === 1 ? "text-[#0F4F9E]  border-b-2 border-[#0F4F9E]" : "hover:text-[#0F4F9E] "
                            }  px-4 py-2 outline-none font-semibold`}
                    >
                        {props.dataLang?.personnels_staff_popup_power}
                    </button>
                </div>
                <div className="mt-4 w-[600px] ">
                    <form onSubmit={_HandleSubmit.bind(this)} className="">
                        {isState.tab == 0 && (
                            <Customscrollbar className="h-[480px] overflow-hidden">
                                <div className="">
                                    <div className="flex justify-between gap-5">
                                        <div className="w-1/2">
                                            <label className="text-[#344054] font-normal text-sm mb-1 ">
                                                {props.dataLang?.personnels_staff_popup_code}{" "}
                                            </label>
                                            <input
                                                value={isState.code}
                                                onChange={(e) => queryState({ code: e.target.value })}
                                                name="fname"
                                                type="text"
                                                placeholder={props.dataLang?.client_popup_sytem}
                                                className="focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-1.5 border outline-none mb-2"
                                            />

                                            <label className="text-[#344054] font-normal text-sm mb-1 ">
                                                {props.dataLang?.personnels_staff_popup_name}
                                                <span className="text-red-500">*</span>
                                            </label>
                                            <div>
                                                <input
                                                    value={isState.name}
                                                    onChange={(e) => queryState({ name: e.target.value })}
                                                    placeholder={props.dataLang?.personnels_staff_popup_name}
                                                    type="text"
                                                    className={`${isState.errInput
                                                        ? "border-red-500"
                                                        : "focus:border-[#92BFF7] border-[#d0d5dd]"
                                                        } placeholder:text-slate-300 w-full bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-1.5 border outline-none mb-2`}
                                                />

                                                {isState.errInput && (
                                                    <label className="mb-4  text-[14px] text-red-500">
                                                        {props.dataLang?.personnels_staff_popup_errName}
                                                    </label>
                                                )}
                                            </div>
                                            <div>
                                                <label className="text-[#344054] font-normal text-sm mb-1 ">
                                                    {props.dataLang?.client_list_brand}{" "}
                                                    <span className="text-red-500">*</span>
                                                </label>
                                                <SelectComponent
                                                    classParent="m-0"
                                                    closeMenuOnSelect={false}
                                                    placeholder={props.dataLang?.client_list_brand}
                                                    options={props?.listBranch}
                                                    isSearchable={true}
                                                    onChange={(e) => queryState({ valueBr: e })}
                                                    LoadingIndicator
                                                    isMulti
                                                    noOptionsMessage={() => "Không có dữ liệu"}
                                                    value={isState.valueBr}
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
                                                    className={`${isState.errInputBr ? "border-red-500" : "border-transparent"
                                                        } placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border `}
                                                />

                                                {isState.errInputBr && (
                                                    <label className="mb-2  text-[14px] text-red-500">
                                                        {props.dataLang?.client_list_bran}
                                                    </label>
                                                )}
                                            </div>
                                            <label className="text-[#344054] font-normal text-sm mb-1 ">
                                                {props.dataLang?.personnels_staff_popup_email}
                                            </label>
                                            <input
                                                value={isState.email}
                                                onChange={(e) => queryState({ email: e?.target?.value })}
                                                placeholder={props.dataLang?.personnels_staff_popup_email}
                                                name="fname"
                                                type="email"
                                                className="focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-1.5 border outline-none mb-2"
                                            />

                                            <div className="">
                                                <label className="text-[#344054] font-normal text-sm mb-1 ">
                                                    {props.dataLang?.personnels_staff_popup_phone}
                                                </label>
                                                <input
                                                    value={isState.phone_number}
                                                    onChange={(e) => queryState({ phone_number: e?.target?.value })}
                                                    placeholder={props.dataLang?.personnels_staff_popup_phone}
                                                    name="fname"
                                                    type="number"
                                                    className="focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-1.5 border outline-none mb-2"
                                                />
                                            </div>
                                            <div className="flex items-center ">
                                                <label
                                                    className="relative flex cursor-pointer items-center rounded-full p-3 gap-3.5"
                                                    for="checkbox-6"
                                                    data-ripple-dark="true"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-indigo-500 checked:bg-indigo-500 checked:before:bg-indigo-500 hover:before:opacity-10"
                                                        id="checkbox-6"
                                                        value={isState.admin}
                                                        checked={
                                                            isState.admin === "0"
                                                                ? false
                                                                : isState.admin === "1" && true
                                                        }
                                                        onChange={(e) => {
                                                            if (role) {
                                                                queryState({ admin: e.target?.checked ? "1" : "0" });
                                                            } else {
                                                                isShow("error", WARNING_STATUS_ROLE_ADMIN);
                                                            }
                                                        }}
                                                    />
                                                    <div className="pointer-events-none absolute top-2/4 left-[10%]   -translate-y-2/4 text-white opacity-0 transition-opacity peer-checked:opacity-100">
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
                                                    <div>
                                                        <span className="text-[#344054] font-normal text-sm ">
                                                            {props.dataLang?.personnels_staff_popup_manager}
                                                        </span>
                                                    </div>
                                                </label>
                                            </div>
                                            <div className="relative flex flex-col mt-3">
                                                <div>
                                                    <label className="text-[#344054] font-normal text-sm ">
                                                        {props.dataLang?.personnels_staff_popup_pas}
                                                        <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type={isState.typePassword ? "text" : "password"}
                                                        placeholder={props.dataLang?.personnels_staff_popup_pas}
                                                        value={isState.password}
                                                        id="userpwd"
                                                        onChange={(e) => queryState({ password: e?.target?.value })}
                                                        className={`${isState.errInputPas
                                                            ? "border-red-500"
                                                            : "focus:border-[#92BFF7] border-[#d0d5dd]"
                                                            } placeholder:text-slate-300 w-full bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal py-2 pl-3 pr-12  border outline-none `}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            queryState({ typePassword: !isState.typePassword })
                                                        }
                                                        className="absolute right-3 top-[50%]"
                                                    >
                                                        {isState.typePassword ? <IconEyeSlash /> : <IconEye />}
                                                    </button>
                                                </div>
                                                {isState.errInputPas && (
                                                    <label className="mb-2  text-[14px] text-red-500">
                                                        {props.dataLang?.personnels_staff_popup_errPas}
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-1/2">
                                            <div className="space-y-1 ">
                                                <label className="text-[#344054] font-normal text-sm">
                                                    {props.dataLang?.personnels_staff_table_avtar}
                                                </label>
                                                <div className="flex justify-center">
                                                    <div className="relative h-[180px] w-[180px] rounded bg-slate-200">
                                                        {isState.thumb && (
                                                            <Image
                                                                width={180}
                                                                height={180}
                                                                quality={100}
                                                                src={
                                                                    typeof isState.thumb === "string"
                                                                        ? isState.thumb
                                                                        : URL.createObjectURL(isState.thumb)
                                                                }
                                                                alt="thumb type"
                                                                className="w-[180px] h-[180px] rounded object-contain"
                                                                loading="lazy"
                                                                crossOrigin="anonymous"
                                                                blurDataURL="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                                                            />
                                                        )}
                                                        {!isState.thumb && (
                                                            <div className="flex flex-col items-center justify-center w-full h-full">
                                                                <IconImage />
                                                            </div>
                                                        )}
                                                        <div className="absolute bottom-0 flex flex-col space-y-2 -right-12">
                                                            <input
                                                                onChange={_HandleChangeFileThumb.bind(this)}
                                                                type="file"
                                                                id={`upload`}
                                                                accept="image/png, image/jpeg"
                                                                hidden
                                                            />
                                                            <label
                                                                htmlFor={`upload`}
                                                                title="Sửa hình"
                                                                className="flex flex-col items-center justify-center w-8 h-8 rounded-full cursor-pointer bg-slate-100"
                                                            >
                                                                <IconEditImg size="17" />
                                                            </label>
                                                            <button
                                                                disabled={!isState.thumb ? true : false}
                                                                onClick={_DeleteThumb.bind(this)}
                                                                title="Xóa hình"
                                                                className="flex flex-col items-center justify-center w-8 h-8 text-white bg-red-500 rounded-full disabled:opacity-30"
                                                            >
                                                                <IconDelete size="17" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Customscrollbar>
                        )}
                        {isState.tab == 1 && (
                            <div className="flex flex-wrap items-center justify-between gap-2 ">
                                <div className="flex items-center w-full gap-5">
                                    <div className="w-1/2">
                                        <div className="">
                                            <label className="text-[#344054] font-normal text-base">
                                                {props.dataLang?.personnels_staff_position}
                                            </label>
                                            <SelectComponent
                                                options={props?.listPosition}
                                                formatOptionLabel={SelectOptionLever}
                                                value={isState.idPos}
                                                maxMenuHeight="200px"
                                                isClearable={true}
                                                onChange={(e) => queryState({ idPos: e })}
                                                placeholder={props.dataLang?.personnels_staff_position}
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
                                                closeMenuOnSelect={false}
                                                LoadingIndicator
                                                noOptionsMessage={() => "Không có dữ liệu"}
                                                menuPortalTarget={document.body}
                                                onMenuOpen={handleMenuOpen}
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
                                                    control: (provided) => ({
                                                        ...provided,
                                                        border: "1px solid #d0d5dd",
                                                        "&:focus": {
                                                            outline: "none",
                                                            border: "none",
                                                        },
                                                    }),
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="w-1/2">
                                        <label className="text-[#344054] font-normal text-sm  ">
                                            {props.dataLang?.personnels_staff_popup_mana}{" "}
                                        </label>
                                        <SelectComponent
                                            closeMenuOnSelect={false}
                                            placeholder={props.dataLang?.personnels_staff_popup_mana}
                                            options={isState.manage}
                                            isSearchable={true}
                                            onChange={(e) => queryState({ valueManage: e })}
                                            LoadingIndicator
                                            isMulti
                                            noOptionsMessage={() => "Không có dữ liệu"}
                                            value={isState.valueManage}
                                            maxMenuHeight="200px"
                                            isClearable={true}
                                            menuPortalTarget={document.body}
                                            onMenuOpen={handleMenuOpen}
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
                                                control: (provided) => ({
                                                    ...provided,
                                                    border: "1px solid #d0d5dd",
                                                    "&:focus": {
                                                        outline: "none",
                                                        border: "none",
                                                    },
                                                }),
                                            }}
                                            className={` placeholder:text-slate-300  text-[#52575E] font-normal border outline-none rounded-[5.5px] bg-white border-none xl:text-base text-[14.5px]`}
                                        />
                                    </div>
                                </div>
                                <div className="w-full">
                                    <label>Tìm kiếm</label>
                                    <div className="relative flex items-center">
                                        <SearchNormal1
                                            size={20}
                                            className="absolute 2xl:left-3 z-10 text-[#cccccc] xl:left-[4%] left-[1%]"
                                        />
                                        <input
                                            onChange={(e) => queryState({ valueSearch: e?.target?.value })}
                                            dataLang={props.dataLang}
                                            value={isState.valueSearch}
                                            className={
                                                "border py-1.5 rounded border-gray-300 2xl:text-left 2xl:pl-10 xl:!text-left xl:pl-16 relative bg-white outline-[#D0D5DD] focus:outline-[#0F4F9E] 2xl:text-base text-xs  text-center 2xl:w-full xl:w-full w-[100%]"
                                            }
                                        />
                                        {isState.valueSearch != "" && (
                                            <MdClear
                                                size={32}
                                                onClick={() => queryState({ valueSearch: "" })}
                                                className="absolute cursor-pointer hover:bg-gray-300 p-2 right-5 bottom-0.5 rounded-full transition-all duration-200 ease-linear"
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="w-full">
                                    <div className="space-y-2 max-h-[380px] h-auto overflow-y-auo scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                                        <div className={`grid grid-cols-1`}>
                                            {isState.room?.map((e) => {
                                                return (
                                                    <div className={e?.hidden ? "hidden" : ""} key={e?.key}>
                                                        <div className="flex items-center w-max">
                                                            <div className="inline-flex items-center">
                                                                <label
                                                                    className="relative flex items-center p-3 rounded-full cursor-pointer"
                                                                    htmlFor={e?.key}
                                                                    data-ripple-dark="true"
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-indigo-500 checked:bg-indigo-500 checked:before:bg-indigo-500 hover:before:opacity-10"
                                                                        id={e?.key}
                                                                        value={e?.name}
                                                                        checked={e?.is_check == 1 ? true : false}
                                                                        onChange={(value) => handleChange(e)}
                                                                    />
                                                                    <div className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
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
                                                            </div>
                                                            <label
                                                                htmlFor={e?.key}
                                                                className="text-[#344054] font-medium text-base cursor-pointer"
                                                            >
                                                                {e?.name}
                                                            </label>
                                                        </div>
                                                        {e?.is_check == 1 && (
                                                            <div className="">
                                                                {e?.child?.map((i, index) => {
                                                                    return (
                                                                        <div
                                                                            key={i?.key}
                                                                            className={`${e?.child?.length - 1 == index &&
                                                                                "border-b"
                                                                                } ml-10 border-t border-x`}
                                                                        >
                                                                            <div className="p-2 text-sm border-b">
                                                                                {i?.name}
                                                                            </div>
                                                                            <div className="grid grid-cols-3 gap-1 ">
                                                                                {i?.permissions?.map((s) => {
                                                                                    return (
                                                                                        <div
                                                                                            key={s?.key}
                                                                                            className="flex items-center w-full"
                                                                                        >
                                                                                            <div className="inline-flex items-center">
                                                                                                <label
                                                                                                    className="relative flex items-center p-3 rounded-full cursor-pointer"
                                                                                                    htmlFor={
                                                                                                        s?.key +
                                                                                                        "" +
                                                                                                        i?.key
                                                                                                    }
                                                                                                    data-ripple-dark="true"
                                                                                                >
                                                                                                    <input
                                                                                                        type="checkbox"
                                                                                                        className="before:content[''] peer relative h-5 w-5 cursor-pointer appearance-none rounded-md border border-blue-gray-200 transition-all before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity checked:border-indigo-500 checked:bg-indigo-500 checked:before:bg-indigo-500 hover:before:opacity-10"
                                                                                                        id={
                                                                                                            s?.key +
                                                                                                            "" +
                                                                                                            i?.key
                                                                                                        }
                                                                                                        value={s?.name}
                                                                                                        checked={
                                                                                                            s?.is_check ==
                                                                                                                1
                                                                                                                ? true
                                                                                                                : false
                                                                                                        }
                                                                                                        onChange={(
                                                                                                            value
                                                                                                        ) => {
                                                                                                            handleChange(
                                                                                                                e?.key,
                                                                                                                i?.key,
                                                                                                                s
                                                                                                            );
                                                                                                        }}
                                                                                                    />
                                                                                                    <div className="absolute text-white transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
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
                                                                                            </div>
                                                                                            <label
                                                                                                htmlFor={
                                                                                                    s?.key + "" + i?.key
                                                                                                }
                                                                                                className="text-[#344054] font-medium text-sm cursor-pointer"
                                                                                            >
                                                                                                {s?.name}
                                                                                            </label>
                                                                                        </div>
                                                                                    );
                                                                                })}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="mt-5 space-x-2 text-right">
                            <button
                                type="button"
                                onClick={() => queryState({ open: false })}
                                className="button text-[#344054] font-normal text-base py-2 px-4 rounded-[5.5px] border border-solid border-[#D0D5DD]"
                            >
                                {props.dataLang?.branch_popup_exit}
                            </button>
                            <button
                                type="submit"
                                className="button text-[#FFFFFF]  font-normal text-base py-2 px-4 rounded-[5.5px] bg-[#003DA0]"
                            >
                                {props.dataLang?.branch_popup_save}
                            </button>
                        </div>
                    </form>
                </div>
            </PopupCustom>
        </>
    );
};
export default Popup_dsnd;
