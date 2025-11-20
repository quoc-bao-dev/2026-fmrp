import apiLocationWarehouse from "@/Api/apiManufacture/warehouse/apiWarehouseLocation/apiWarehouseLocation";
import { PlusIcon } from "@/components/icons";
import EditIcon from "@/components/icons/common/EditIcon";
import ButtonCancel from "@/components/UI/button/buttonCancel";
import ButtonSubmit from "@/components/UI/button/buttonSubmit";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import PopupCustom from "@/components/UI/popup";
import useToast from "@/hooks/useToast";
import { SelectCore } from "@/utils/lib/Select";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";

const PopupLocationWarehouse = (props) => {
    const [open, sOpen] = useState(false);

    const _ToggleModal = (e) => sOpen(e);

    const scrollAreaRef = useRef(null);
    const handleMenuOpen = () => {
        const menuPortalTarget = scrollAreaRef.current;
        return { menuPortalTarget };
    };

    const isShow = useToast();

    const [onSending, sOnSending] = useState(false);

    const [name, sName] = useState("");

    const [code, sCode] = useState("");

    const [errInputCode, sErrInputCode] = useState(false);

    const [errInputName, sErrInputName] = useState(false);

    const [errInputWarehouse, sErrInputWarehouse] = useState(false);

    const [valueWarehouse, sValueWarehouse] = useState(null);

    // set state khi mở popup lên
    useEffect(() => {
        sErrInputCode(false);
        sErrInputName(false);
        sErrInputWarehouse(false);
        sName(props.name ? props.name : "");
        sCode(props.code ? props.code : "");
        sValueWarehouse(props.id ? { label: props.warehouse_name, value: props.warehouse_id } : null);
    }, [open]);

    // change input
    const _HandleChangeInput = (type, value) => {
        if (type == "name") {
            sName(value.target?.value);
        } else if (type == "valueWarehouse") {
            sValueWarehouse(value);
        } else if (type == "code") {
            sCode(value.target?.value);
        }
    };

    // lưu vị trí kho
    const handingLocation = useMutation({
        mutationFn: ({ url, data }) => {
            return apiLocationWarehouse.apiHandingLocation(url, data);
        }
    })

    const _ServerSending = async () => {
        const id = props.id;

        let data = new FormData();

        data.append("name", name ? name : "");

        data.append("code", code ? code : "");

        data.append("warehouse_id", valueWarehouse?.value ? valueWarehouse?.value : "");

        const url = id ? `/api_web/api_warehouse/location/${id}?csrf_protection=true` : "/api_web/api_warehouse/location/?csrf_protection=true";

        handingLocation.mutate({ url, data }, {
            onSuccess: ({ isSuccess, message }) => {
                if (isSuccess) {
                    isShow("success", `${props.dataLang[message] || message}`);
                    props.onRefresh && props.onRefresh();
                    sOpen(false);
                    sErrInputCode(false);
                    sErrInputName(false);
                    sErrInputWarehouse(false);
                    sName("");
                    sCode("");
                    sValueWarehouse(null);
                    sOnSending(false);
                } else {
                    isShow("error", `${props.dataLang[message]}`);
                }
            }
        })
    };

    //da up date
    useEffect(() => {
        onSending && _ServerSending();
    }, [onSending]);

    const _HandleSubmit = (e) => {
        e.preventDefault();
        if (code.length == 0 || valueWarehouse?.length == 0 || name.length == 0 || valueWarehouse == null) {
            code?.length == 0 && sErrInputCode(true);

            name?.length == 0 && sErrInputName(true);

            valueWarehouse?.length == 0 && sErrInputWarehouse(true);

            valueWarehouse == null && sErrInputWarehouse(true);

            isShow("error", `${props.dataLang?.required_field_null}`);
        } else {
            sOnSending(true);
        }
    };

    useEffect(() => {
        sErrInputCode(false);
    }, [code?.length > 0]);

    useEffect(() => {
        sErrInputName(false);
    }, [name?.length > 0]);

    useEffect(() => {
        sErrInputWarehouse(false);
    }, [valueWarehouse?.length > 0, valueWarehouse != null]);

    return (
        <>
            <PopupCustom
                title={props.id ? `${props.dataLang?.warehouses_localtion_edit}` : `${props.dataLang?.warehouses_localtion_add}`}
                button={props.id ? 
                    <div className="group hover:border-[#064E3B] hover:bg-[#064E3B]/10 rounded-lg w-full p-1 border border-transparent transition-all ease-in-out flex items-center gap-2 responsive-text-sm text-left cursor-pointer">
                        <EditIcon className="size-5" color="#064E3B"/>
                    </div> : 
                    <div className="flex items-center gap-2">
                        <PlusIcon />
                        {props.dataLang?.branch_popup_create_new}
                    </div>}
                onClickOpen={_ToggleModal.bind(this, true)}
                open={open}
                onClose={_ToggleModal.bind(this, false)}
                classNameBtn={props.className}
            >
                <div className="w-[30vw] mt-4">
                    <form onSubmit={_HandleSubmit.bind(this)} className="">
                        <Customscrollbar className="h-[280px]">
                            <div className="">
                                <div className="flex flex-wrap justify-between ">
                                    <div className="w-full">
                                        <div>
                                            <label className="text-[#344054] font-normal text-sm mb-1 ">
                                                {props.dataLang?.warehouses_localtion_code}
                                                <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                value={code}
                                                onChange={_HandleChangeInput.bind(this, "code")}
                                                placeholder={props.dataLang?.warehouses_localtion_code}
                                                name="fname"
                                                type="text"
                                                className={`${errInputCode ? "border-red-500" : "focus:border-[#92BFF7] border-[#d0d5dd]"} placeholder:text-slate-300 w-full bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-1.5 border outline-none mb-2`}
                                            />
                                            {errInputCode && (
                                                <label className="mb-4  text-[14px] text-red-500">
                                                    {props.dataLang?.warehouses_localtion_errCode}
                                                </label>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-[#344054] font-normal text-sm mb-1 ">
                                                {props.dataLang?.warehouses_localtion_NAME}
                                                <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                value={name}
                                                onChange={_HandleChangeInput.bind(this, "name")}
                                                placeholder={props.dataLang?.warehouses_localtion_NAME}
                                                name="fname"
                                                type="text"
                                                className={`${errInputName
                                                    ? "border-red-500"
                                                    : "focus:border-[#92BFF7] border-[#d0d5dd]"
                                                    } placeholder:text-slate-300 w-full bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-1.5 border outline-none mb-2`}
                                            />
                                            {errInputName && (
                                                <label className="mb-4  text-[14px] text-red-500">
                                                    {props.dataLang?.warehouses_localtion_errName}
                                                </label>
                                            )}
                                        </div>

                                        <div>
                                            <label className="text-[#344054] font-normal text-sm mb-1 ">
                                                {props.dataLang?.warehouses_localtion_ware}{" "}
                                                <span className="text-red-500">*</span>
                                            </label>
                                            <SelectCore
                                                placeholder={props.dataLang?.warehouses_localtion_ware}
                                                options={props?.dataWarehouse}
                                                isSearchable={true}
                                                onChange={_HandleChangeInput.bind(this, "valueWarehouse")}
                                                noOptionsMessage={() => "Không có dữ liệu"}
                                                value={valueWarehouse}
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
                                                className={`${errInputWarehouse ? "border-red-500" : "border-transparent"
                                                    } placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border `}
                                            />
                                            {errInputWarehouse && (
                                                <label className="mb-2  text-[14px] text-red-500">
                                                    {props.dataLang?.warehouses_localtion_errWare}
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Customscrollbar>
                        <div className="mt-5 space-x-2 text-right">
                            <ButtonCancel dataLang={props.dataLang} onClick={_ToggleModal.bind(this, false)} />
                            <ButtonSubmit
                                dataLang={props.dataLang}
                                loading={handingLocation.isPending}
                                onClick={_HandleSubmit.bind(this)}
                            />
                        </div>
                    </form>
                </div>
            </PopupCustom>
        </>
    );
};
export default PopupLocationWarehouse;
