import apiBranch from "@/Api/apiSettings/apiBranch";
import PopupCustom from "@/components/UI/popup";
import useToast from "@/hooks/useToast";
import { Edit as IconEdit } from "iconsax-react";
import { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useWarehousesList } from "../hooks/usseBranch";
import Loading from "@/components/UI/loading/loading";
import SelectComponentNew from "@/components/common/select/SelectComponentNew";
const PopupBranch = (props) => {

    const [open, sOpen] = useState(false);

    const isShow = useToast();

    const _ToggleModal = (e) => sOpen(e);

    const [onSending, sOnSending] = useState(false);

    const [name, sName] = useState("");

    const [address, sAddress] = useState("");

    const [phone, sPhone] = useState("");

    const [warehouse, setWarehouse] = useState({
        value: "",
        label: "",
    });

    const [required, sRequired] = useState(false);

    const handleSelect = (value) => {
        setWarehouse(value);
    };

    useEffect(() => {
        const findIdWarehouseByName = props.ListWarehouse?.data?.warehouses
            .find((item) => item?.name === props?.warehouse)

        const selectedWarehouse = findIdWarehouseByName
            ? { label: findIdWarehouseByName.name, value: findIdWarehouseByName.id }
            : null;


        setWarehouse(props.warehouse ? selectedWarehouse : "");
        sName(props.name ? props.name : "");
        sAddress(props.address ? props.address : "");
        sPhone(props.phone ? props.phone : "");
        sRequired(false);
    }, [open]);

    const _HandleChangeInput = (type, value) => {
        if (type == "name") {
            sName(value.target?.value);
        } else if (type == "address") {
            sAddress(value.target?.value);
        } else if (type == "phone") {
            sPhone(value.target?.value);
        }
    };

    const _ServerSending = async () => {
        let data = new FormData();

        data.append("name", name);
        data.append("number_phone", phone);
        data.append("address", address);
        data.append("warehouse_import_id", warehouse.value);

        try {
            const { isSuccess, message } = await apiBranch.apiHandingBranch(
                props?.id ? props?.id : undefined,
                data
            );
            if (isSuccess) {
                isShow("success", props.dataLang[message] || message);
                sName("");
                sAddress("");
                sPhone("");
                setWarehouse("")
                props.onRefresh && props.onRefresh();
                sOpen(false);
                sOnSending(false);
            } else {
                isShow("error", props.dataLang[message] || message);
            }
        } catch (error) { }
    };

    useEffect(() => {
        onSending && _ServerSending();
    }, [onSending]);

    const _HandleSubmit = (e) => {
        e.preventDefault();
        if (name.length == 0) {
            sRequired(true);
        } else {
            sRequired(false);
        }
        sOnSending(true);
    };

    useEffect(() => {
        sRequired(false);
    }, [name.length > 0]);

    return (
        <PopupCustom
            title={
                props.id
                    ? `${props.dataLang?.branch_popup_edit}`
                    : `${props.dataLang?.branch_popup_create_new_branch}`
            }
            button={
                props.id ? <IconEdit /> : `${props.dataLang?.branch_popup_create_new}`
            }
            onClickOpen={_ToggleModal.bind(this, true)}
            open={open}
            onClose={_ToggleModal.bind(this, false)}
            classNameBtn={props.className}
        >
            <div className="pt-5 w-96">
                <form onSubmit={_HandleSubmit.bind(this)} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-[#344054] font-normal text-base">
                            {props.dataLang?.branch_popup_name}
                            <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={name}
                            onChange={_HandleChangeInput.bind(this, "name")}
                            name="fname"
                            type="text"
                            className={`${required
                                ? "border-red-500"
                                : "focus:border-[#92BFF7] border-[#d0d5dd] "
                                } placeholder-[color:#667085] w-full bg-[#ffffff] rounded-lg text-[#52575E] font-normal  p-2 border outline-none`}
                        />
                        {required && (
                            <label className="text-sm text-red-500">
                                Vui lòng nhập tên chi nhánh
                            </label>
                        )}
                    </div>
                    <div className="space-y-1">
                        <label className="text-[#344054] font-normal">
                            {props.dataLang?.branch_popup_address}{" "}
                        </label>
                        <input
                            value={address}
                            onChange={_HandleChangeInput.bind(this, "address")}
                            name="adress"
                            type="text"
                            className="placeholder-[color:#667085] w-full bg-[#ffffff] rounded-lg focus:border-[#92BFF7] text-[#52575E] font-normal  p-2 border border-[#d0d5dd] outline-none"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[#344054] font-normal text-base">
                            {props.dataLang?.Warehouse_poppup_name}
                            <span className="text-red-500">*</span>
                        </label>
                        <SelectComponentNew
                            isClearable={true}
                            value={warehouse}
                            onChange={(e) => handleSelect(e)}
                            options={
                                props.ListWarehouse &&
                                    props.ListWarehouse?.data?.warehouses.length > 0
                                    ? props.ListWarehouse?.data?.warehouses.map((item) => {
                                        return {
                                            label: item.name,
                                            value: item.id,
                                        };
                                    })
                                    : []
                            }
                            classParent="ml-0 !font-semibold focus:ring-none focus:outline-none text-sm focus-visible:ring-none focus-visible:outline-none placeholder:text-sm placeholder:text-[#52575E]"
                            classNamePrefix={"productionSmoothing"}
                            className={required ? "border border-red-500 rounded-md" : ""}
                            required={true}
                            placeholder={
                                props.dataLang?.Warehouse_poppup_name || "Warehouse_poppup_name"
                            }
                        />
                        {required && (
                            <label className="text-sm text-red-500">
                                Vui lòng chọn kho hàng{" "}
                            </label>
                        )}
                    </div>
                    <div className="space-y-1">
                        <label className="text-[#344054] font-normal">
                            {props.dataLang?.branch_popup_phone}
                        </label>
                        <PhoneInput
                            country={"vn"}
                            value={phone}
                            onChange={(phone) => sPhone(phone)}
                            inputProps={{
                                required: true,
                                autoFocus: true,
                            }}
                            inputStyle={{
                                width: "100%",
                                border: "1px solid #d0d5dd",
                                borderRadius: "8px",
                                paddingTop: "8px",
                                paddingBottom: "8px",
                                height: "auto",
                            }}
                        />
                    </div>
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
                </form>
            </div>
        </PopupCustom>
    );
};
export default PopupBranch;
