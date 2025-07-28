import apiFinance from "@/Api/apiSettings/apiFinance";
import InPutMoneyFormat from "@/components/UI/inputNumericFormat/inputMoneyFormat";
import InPutNumericFormat from "@/components/UI/inputNumericFormat/inputNumericFormat";
import PopupCustom from "@/components/UI/popup";
import useToast from "@/hooks/useToast";
import { isAllowedNumber } from "@/utils/helpers/common";
import { Edit as IconEdit } from "iconsax-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
const PopupFinance = (props) => {
    const router = useRouter();

    const isShow = useToast();

    const tabPage = router.query?.tab;

    const [open, sOpen] = useState(false);

    const _ToggleModal = (e) => sOpen(e);

    const [onSending, sOnSending] = useState(false);

    const [nameTax, sNameTax] = useState("");

    const [rateTax, sRateTax] = useState(null);

    const [codeCu, sCodeCu] = useState("");

    const [symbolCu, sSymbolCu] = useState("");

    const [nameMe, sNameMe] = useState("");

    const [methodMe, sMethodMe] = useState("0");

    const [balanceMe, sBalanceMe] = useState(null);

    const [descriptionMe, sDescriptionMe] = useState("");

    const [errInput, sErrInput] = useState(false);

    const [errInputCu, sErrInputCu] = useState(false);

    const [errInputCusynm, sErrInputCusynm] = useState(false);

    const [errInputMe, sErrInputMe] = useState(false);

    useEffect(() => {
        sErrInput(false);
        sErrInputMe(false);
        sErrInputCu(false);
        sErrInputCusynm(false);
        sNameTax(props.data?.name ? props.data?.name : "");
        sRateTax(props.data?.tax_rate ? props.data?.tax_rate : null);
        sCodeCu(props.data?.code ? props.data?.code : "");
        sSymbolCu(props.data?.symbol ? props.data?.symbol : "");
        sNameMe(props.data?.name ? props.data?.name : "");
        sMethodMe(props.data?.cash_bank ? props.data?.cash_bank : "0");
        sBalanceMe(props.data?.opening_balance ? props.data?.opening_balance : null);
        sDescriptionMe(props.data?.description ? props.data?.description : "");
    }, [open]);

    const _HandleChangeInput = (type, value) => {
        if (type == "nameTax") {
            sNameTax(value.target?.value);
        } else if (type == "rateTax") {
            sRateTax(value.target?.value);
        } else if (type == "codeCu") {
            sCodeCu(value.target?.value);
        } else if (type == "symbolCu") {
            sSymbolCu(value.target?.value);
        } else if (type == "nameMe") {
            sNameMe(value.target?.value);
        } else if (type == "methodMe") {
            sMethodMe(value.target?.value);
        } else if (type == "balanceMe") {
            sBalanceMe(Number(value.value));
        } else if (type == "descriptionMe") {
            sDescriptionMe(value.target?.value);
        }
    };

    const _ServerSending = async () => {
        const id = props.data?.id;
        let data = new FormData();
        data.append("name", (tabPage === "taxes" && nameTax) || (tabPage === "paymentmodes" && nameMe));
        data.append("tax_rate", rateTax);
        data.append("code", codeCu);
        data.append("symbol", symbolCu);
        data.append("cash_bank", methodMe);
        data.append("opening_balance", balanceMe);
        data.append("description", descriptionMe);
        const url = id
            ? `${(tabPage === "taxes" && `/api_web/Api_tax/tax/${id}?csrf_protection=true`) || (tabPage === "currencies" && `/api_web/Api_currency/currency/${id}?csrf_protection=true`) || (tabPage === "paymentmodes" && `/api_web/Api_payment_method/payment_method/${id}?csrf_protection=true`)} `
            : `${(tabPage === "taxes" && `/api_web/Api_tax/tax?csrf_protection=true`) || (tabPage === "currencies" && `/api_web/Api_currency/currency?csrf_protection=true`) || (tabPage === "paymentmodes" && `/api_web/Api_payment_method/payment_method?csrf_protection=true`)} `
        try {
            const { isSuccess, message } = await apiFinance.apiHandingFinance(url, data)
            if (isSuccess) {
                isShow("success", props.dataLang[message]);
                sErrInputCu(false);
                sErrInputCusynm(false);
                sErrInput(false);
                sErrInputMe(false);

                sNameTax("");
                sRateTax(null);
                sCodeCu("");
                sSymbolCu("");
                sNameMe("");
                sMethodMe("0");
                sBalanceMe(null);
                sDescriptionMe("");
                sOpen(false);
                props.onRefresh && props.onRefresh();
            } else {
                isShow("error", props.dataLang[message] || message);
            }
        } catch (error) {

        }
        sOnSending(false);
    };

    useEffect(() => {
        onSending && _ServerSending();
    }, [onSending]);

    const _HandleSubmit = (e) => {
        e.preventDefault();
        // || nameMe.length == 0  || balanceMe == 0
        if (nameTax.length == 0) {
            sErrInput(true);
        } else {
            sErrInput(false);
        }
        if (codeCu.length == 0) {
            sErrInputCu(true);
        } else {
            sErrInputCu(false);
        }
        if (symbolCu.length == 0) {
            sErrInputCusynm(true);
        } else {
            sErrInputCusynm(false);
        }
        if (nameMe.length == 0) {
            sErrInputMe(true);
        } else {
            sErrInputMe(false);
        }
        sOnSending(true);
    };

    useEffect(() => {
        sErrInput(false);
        sErrInputCu(false);
        sErrInputMe(false);
        sErrInputCusynm(false);
    }, [nameTax.length > 0, symbolCu.length > 0, codeCu.length > 0, nameMe.length > 0]);

    return (
        <PopupCustom
            title={
                props.data?.id
                    ? `${(tabPage === "taxes" && props.dataLang?.branch_popup_finance_edit) ||
                    (tabPage === "currencies" && props.dataLang?.branch_popup_finance_editunit) ||
                    (tabPage === "paymentmodes" && props.dataLang?.branch_popup_payment_edit)
                    }`
                    : `${(tabPage === "taxes" && props.dataLang?.branch_popup_finance_addnew) ||
                    (tabPage === "currencies" && props.dataLang?.branch_popup_finance_unit) ||
                    (tabPage === "paymentmodes" && props.dataLang?.branch_popup_payment_addnew)
                    }`
            }
            button={props.data?.id ? <IconEdit /> : `${props.dataLang?.branch_popup_create_new}`}
            onClickOpen={_ToggleModal.bind(this, true)}
            open={open}
            onClose={_ToggleModal.bind(this, false)}
            classNameBtn={props.className}
        >
            <div className={`w-96 mt-4`}>
                <form onSubmit={_HandleSubmit.bind(this)}>
                    <div>
                        {tabPage === "taxes" && (
                            <React.Fragment>
                                <div className="flex flex-wrap justify-between">
                                    <label className="text-[#344054] font-normal text-sm mb-1 ">
                                        {props.dataLang?.branch_popup_finance_name}{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        value={nameTax}
                                        onChange={_HandleChangeInput.bind(this, "nameTax")}
                                        name="fname"
                                        type="text"
                                        className={`${errInput ? "border-red-500" : "focus:border-[#92BFF7] border-[#d0d5dd]"
                                            } placeholder:text-slate-300 w-full bg-[#ffffff] rounded-lg text-[#52575E] font-normal p-2 border outline-none mb-1`}
                                    />
                                    {errInput && (
                                        <label className="mb-2 text-[14px] text-red-500">
                                            Vui lòng nhập tên loại thuế
                                        </label>
                                    )}

                                    {/* {nameTax ==="" ?  <label className="mb-6 mt-2 text-[14px] text-red-500">Vui lòng nhập tên loại thuế</label> :"" } */}
                                </div>
                                <div className="flex flex-wrap justify-between">
                                    <label className="text-[#344054] font-normal text-sm mb-1 ">
                                        {props.dataLang?.branch_popup_finance_rate}{" "}
                                    </label>
                                    <InPutNumericFormat
                                        value={rateTax}
                                        isAllowed={isAllowedNumber}
                                        onChange={_HandleChangeInput.bind(this, "rateTax")}
                                        className="placeholder-[color:#667085] w-full bg-[#ffffff] rounded-lg focus:border-[#92BFF7] text-[#52575E] font-normal  p-2 border border-[#d0d5dd] outline-none mb-6"
                                    />
                                </div>
                            </React.Fragment>
                        )}
                        {tabPage === "currencies" && (
                            <React.Fragment>
                                <div className="flex flex-wrap justify-between">
                                    <label className="text-[#344054] font-normal text-sm mb-1 ">
                                        {props.dataLang?.branch_popup_currency_name}{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        // required
                                        value={codeCu}
                                        onChange={_HandleChangeInput.bind(this, "codeCu")}
                                        name="fname"
                                        type="text"
                                        className={`${errInputCu ? "border-red-500" : "focus:border-[#92BFF7] border-[#d0d5dd]"
                                            } placeholder:text-slate-300 w-full bg-[#ffffff] rounded-lg text-[#52575E] font-normal p-2 border outline-none mb-1`}
                                    />
                                    {errInputCu && (
                                        <label className="mb-2 text-[14px] text-red-500">
                                            Vui lòng nhập mã tiền tệ
                                        </label>
                                    )}
                                </div>
                                <div className="flex flex-wrap justify-between">
                                    <label className="text-[#344054] font-normal text-sm mb-1 ">
                                        {props.dataLang?.branch_popup_curency_symbol}{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        // required
                                        value={symbolCu}
                                        onChange={_HandleChangeInput.bind(this, "symbolCu")}
                                        name="symbol"
                                        type="text"
                                        className={`${errInputCusynm
                                            ? "border-red-500"
                                            : "focus:border-[#92BFF7] border-[#d0d5dd]"
                                            } placeholder:text-slate-300 w-full bg-[#ffffff] rounded-lg text-[#52575E] font-normal p-2 border outline-none`}
                                    />
                                    {errInputCusynm && (
                                        <label className=" mt-2 text-[14px] text-red-500">Vui lòng nhập kí hiệu</label>
                                    )}
                                </div>
                            </React.Fragment>
                        )}
                        {tabPage === "paymentmodes" && (
                            <React.Fragment>
                                <div className="flex flex-wrap justify-between">
                                    <label className="text-[#344054] font-normal text-sm mb-1 ">
                                        {props.dataLang?.branch_popup_payment_name}{" "}
                                        <span className="text-red-500">*</span>{" "}
                                    </label>
                                    <input
                                        // required
                                        value={nameMe}
                                        onChange={_HandleChangeInput.bind(this, "nameMe")}
                                        name="fname"
                                        type="text"
                                        className={`${errInputMe ? "border-red-500" : "focus:border-[#92BFF7] border-[#d0d5dd]"
                                            } placeholder:text-slate-300 w-full bg-[#ffffff] rounded-lg text-[#52575E] font-normal p-2 border outline-none mb-1`}
                                    />
                                    {errInputMe && (
                                        <label className="mb-2 text-[14px] text-red-500">
                                            Vui lòng nhập phương thức thanh toán
                                        </label>
                                    )}
                                </div>
                                <div className="flex flex-wrap justify-between">
                                    <label className="text-[#344054] font-normal text-sm mb-1 ">
                                        {props.dataLang?.branch_popup_payment_balance}{" "}
                                    </label>
                                    {/* <input
                      // required
                      pattern="[0-9]*"
                      value={balanceMe}
                      onChange={_HandleChangeInput.bind(this, "balanceMe")}
                      id="#key"
                      name="opening_balance"                       
                      type="text"
                      className= "focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded-lg text-[#52575E] font-normal p-2 border outline-none mb-6"
                      /> */}

                                    <InPutMoneyFormat
                                        value={balanceMe}
                                        isAllowed={isAllowedNumber}
                                        onValueChange={_HandleChangeInput.bind(this, "balanceMe")}
                                        className={`focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full bg-[#ffffff] rounded-lg text-[#52575E] font-normal p-2 border outline-none`}
                                    />
                                </div>
                                <div className="flex flex-wrap ">
                                    <label className="text-[#344054] font-normal text-sm mb-1 ">
                                        {props.dataLang?.branch_popup_payment_bank}{" "}
                                    </label>
                                    <textarea
                                        value={descriptionMe}
                                        onChange={_HandleChangeInput.bind(this, "descriptionMe")}
                                        name="description"
                                        className="border border-gray-300 w-full min-h-[100px] outline-none p-2"
                                    />
                                </div>
                                <div className=" mt-2">
                                    <div className="flex justify-between p-2">
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                id="nganhang"
                                                value={"0"}
                                                onChange={_HandleChangeInput.bind(this, "methodMe")}
                                                checked={methodMe === "0" ? true : false}
                                                className="scale-150 outline-none"
                                            />
                                            <label
                                                htmlFor="nganhang"
                                                className="relative flex cursor-pointer items-center rounded-full p-3"
                                                data-ripple-dark="true"
                                            >
                                                {props.dataLang?.branch_popup_payment_banking}
                                            </label>
                                        </div>
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                id="tienmat"
                                                value={"1"}
                                                onChange={_HandleChangeInput.bind(this, "methodMe")}
                                                checked={methodMe === "1" ? true : false}
                                                className="scale-150 outline-none"
                                            />
                                            <label
                                                htmlFor="tienmat"
                                                className="relative flex cursor-pointer items-center rounded-full p-3"
                                                data-ripple-dark="true"
                                            >
                                                {props.dataLang?.branch_popup_payment_cash}
                                            </label>
                                        </div>
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
export default PopupFinance