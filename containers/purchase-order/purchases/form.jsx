import apiPurchases from "@/Api/apiPurchaseOrder/apiPurchases";
import ButtonBack from "@/components/UI/button/buttonBack";
import ButtonSubmit from "@/components/UI/button/buttonSubmit";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import { EmptyExprired } from "@/components/UI/common/EmptyExprired";
import { Container } from "@/components/UI/common/layout";
import SelectComponent from "@/components/UI/filterComponents/selectComponent";
import InPutNumericFormat from "@/components/UI/inputNumericFormat/inputNumericFormat";
import PopupConfim from "@/components/UI/popupConfim/popupConfim";
import { optionsQuery } from "@/configs/optionsQuery";
import { CONFIRMATION_OF_CHANGES } from "@/constants/changeStatus/changeStatus";
import { TITLE_DELETE_ITEMS } from "@/constants/delete/deleteItems";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import { useBranchList } from "@/hooks/common/useBranch";
import useSetingServer from "@/hooks/useConfigNumber";
import useStatusExprired from "@/hooks/useStatusExprired";
import useToast from "@/hooks/useToast";
import { useToggle } from "@/hooks/useToggle";
import { routerPurchases } from "@/routers/buyImportGoods";
import { isAllowedNumber } from "@/utils/helpers/common";
import { formatMoment } from "@/utils/helpers/formatMoment";
import formatNumberConfig from "@/utils/helpers/formatnumber";
import { useQuery } from "@tanstack/react-query";
import { Add, Trash as IconDelete, Minus } from "iconsax-react";
import { debounce } from "lodash";
import moment from "moment/moment";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { BsCalendarEvent } from "react-icons/bs";
import { MdClear } from "react-icons/md";
import Select from "react-select";
import { usePurchasesItems } from "./hooks/usePurchasesItems";

const PurchasesForm = (props) => {
    const router = useRouter();

    const id = router.query?.id;

    const dataLang = props.dataLang;

    const isShow = useToast();

    const statusExprired = useStatusExprired();

    const [idBranch, sIdBranch] = useState(null);

    const [code, sCode] = useState("");

    const [searchItems, setSearchItems] = useState("");

    const [selectedDate, setSelectedDate] = useState(moment().format(FORMAT_MOMENT.DATE_TIME_LONG));

    const [namePromis, sNamePromis] = useState("Yêu cầu mua hàng (PR)");

    const [note, sNote] = useState();

    const [totalSoluong, setTotalSoluong] = useState(0);

    const [totalQty, setTotalQty] = useState(0);

    const [startDate, sStartDate] = useState(new Date());

    const [errName, sErrName] = useState(false);

    const [errDate, sErrDate] = useState(false);

    const [errBranch, sErrBranch] = useState(false);

    const [onSending, sOnSending] = useState(false);

    const dataSeting = useSetingServer()

    const { isOpen, isKeyState, handleQueryId } = useToggle();

    const { data: listBr = [] } = useBranchList()

    const { data } = usePurchasesItems(idBranch, searchItems)

    useEffect(() => {
        router.query && sErrDate(false);
        router.query && sErrName(false);
        router.query && sErrBranch(false);
        router.query && sCode("");
        router.query && sNamePromis("Yêu cầu mua hàng (PR)");
        router.query && setSelectedDate(moment().format(FORMAT_MOMENT.DATE_TIME_LONG));
        router.query && sNote("");
        router.query && sStartDate(new Date());
    }, [router.query]);

    const [option, sOption] = useState([
        {
            id: Date.now(),
            items: null,
            unit: "",
            quantity: 0,
            note: "",
        },
    ]);

    const slicedArr = option.slice(1);

    const sortedArr = slicedArr.sort((a, b) => b.id - a.id);

    sortedArr.unshift(option[0]);

    useQuery({
        queryKey: ["api_detail_page_purchases", id],
        queryFn: async () => {
            const rResult = await apiPurchases.apiDetailPagePurchases(id)
            sCode(rResult?.code);
            sNamePromis(rResult?.name);
            sStartDate(moment(rResult?.date).toDate());
            sNote(rResult?.note);
            sIdBranch({
                label: rResult?.branch_name,
                value: rResult?.branch_id,
            });
            const itemlast = [{ items: null }];
            const item = itemlast?.concat(
                rResult?.items?.map((e) => ({
                    id: e.item.id,
                    data: e.item.id,
                    note: e.note,
                    unit: e.item.unit_name,
                    quantity: Number(e.quantity),
                    items: {
                        e: e.item,
                        label: `${e.item.name} <span style={{display: none}}>${e.item.code}</span><span style={{display: none}}>${e.item.product_variation} </span><span style={{display: none}}>${e.item.text_type} ${e.item.unit_name} </span>`,
                        value: e.item.id,
                    },
                }))
            );
            sOption(item);
            let listQty = rResult?.items;
            let totalQuantity = 0;
            for (let i = 0; i < listQty.length; i++) {
                totalQuantity += parseInt(listQty[i].quantity);
            }
            setTotalSoluong(totalQuantity);
            setTotalQty(rResult?.items?.length);
            return rResult
        },
        ...optionsQuery,
        enabled: !!id
    })

    const _HandleDelete = (id) => {
        if (id === option[0].id) {
            return isShow("error", `${"Mặc định hệ thống, không xóa"}`);
        }
        const newOption = option.filter((x) => x.id !== id); // loại bỏ phần tử cần xóa
        const newTotal = newOption.slice(1).reduce((total, item) => total + item.quantity, 0); // tính toán lại tổng số lượng bắt đầu từ phần tử thứ 2
        sOption(newOption); // cập nhật lại mảng
        setTotalSoluong(newTotal); // cập nhật lại tổng số lượng
        setTotalQty(newOption.slice(1).length); // cập nhật lại độ dài của mảng từ phần tử thứ 2 trở đi
    };
    const resetValue = () => {
        if (isKeyState?.type === "branch") {
            sIdBranch(isKeyState?.value);
            sOption([{
                id: Date.now(),
                items: null,
                unit: "",
                quantity: 0,
                note: "",
            }])
        }
        handleQueryId({ status: false });
    };
    const _HandleChangeInput = (type, value) => {
        if (type == "branch") {
            if (option?.length > 1) {
                if (idBranch != value) {
                    handleQueryId({ status: true, initialKey: { type, value } });
                }
            } else {
                sIdBranch(value);
            }
        } else if (type == "date") {
            setSelectedDate(formatMoment(value.target.value, FORMAT_MOMENT.DATE_TIME_LONG));
        } else if (type == "code") {
            sCode(value.target.value);
        } else if (type == "namePromis") {
            sNamePromis(value.target.value);
        } else if (type == "note") {
            sNote(value.target.value);
        }
    };

    const handleClearDate = (type) => {
        if (type === "effectiveDate") {
        }
        if (type === "startDate") {
            sStartDate(new Date());
        }
    };
    const handleTimeChange = (date) => {
        sStartDate(date);
    };

    const _HandleChangeInputOption = (id, type, index3, value) => {
        var index = option.findIndex((x) => x.id === id);
        if (type == "items") {
            const hasSelectedOption = option.some((o) => o.items?.value === value.value);
            if (hasSelectedOption) {
                return isShow("error", `${"Mặt hàng này đã được chọn "}`);
            } else {
                if (option[index].items) {
                    option[index].items = value;
                    option[index].unit = value?.e?.unit_name;
                } else {
                    const newData = {
                        id: Date.now(),
                        items: value,
                        unit: value?.e?.unit_name,
                        quantity: 1,
                        note: "",
                    };
                    option.push(newData);
                    const newOption = option.slice(1); // Tạo một mảng mới bắt đầu từ phần tử thứ hai của option
                    setTotalQty(newOption.length);
                    const newTotal = newOption.reduce((total, item) => total + item.quantity, 0); // Tính tổng số lượng trong mảng mới
                    setTotalSoluong(newTotal);
                }
            }
        } else if (type == "unit") {
            option[index].unit = value.target?.value;
        } else if (type === "quantity") {
            option[index].quantity = Number(value?.value);
            const newTotal = option.reduce((total, item) => {
                if (!isNaN(item.quantity)) {
                    return total + parseInt(item.quantity);
                } else {
                    return total;
                }
            }, 0);
            sOption([...option]);
            setTotalSoluong(newTotal);
        } else if (type == "note") {
            option[index].note = value?.target?.value;
        }
        sOption([...option]);
    };
    const handleIncrease = (id) => {
        const index = option.findIndex((x) => x.id === id);
        const newQuantity = option[index].quantity + 1;
        option[index].quantity = newQuantity;
        setTotalSoluong(totalSoluong + 1);
        sOption([...option]);
    };
    const handleDecrease = (id) => {
        const index = option.findIndex((x) => x.id === id);
        const newQuantity = option[index].quantity - 1;
        if (newQuantity >= 1) {
            // chỉ giảm số lượng khi nó lớn hơn hoặc bằng 1
            option[index].quantity = newQuantity;
            setTotalSoluong(totalSoluong - 1);
            sOption([...option]);
        } else {
            return isShow("error", `${"Số lượng tối thiểu"}`);
        }
    };
    const _HandleSubmit = (e) => {
        e.preventDefault();
        const checkData = newDataOption?.some((e) => e?.quantity == 0 || e?.quantity == "");
        const hasValue = namePromis?.length == 0 || selectedDate?.length == 0 || idBranch == null
        if (hasValue || checkData) {
            namePromis?.length == 0 && sErrName(true);
            selectedDate?.length == 0 && sErrDate(true);
            idBranch == null && sErrBranch(true);
            isShow("error", `${props.dataLang?.required_field_null}`);
        } else {
            sOnSending(true);
        }
    };

    const dataOption = sortedArr?.map((e) => {
        return {
            data: e?.items?.value,
            quantity: e.quantity,
            note: e.note,
        };
    });

    const newDataOption = dataOption?.filter((e) => e?.data !== undefined);

    const _ServerSending = async () => {
        let formData = new FormData();
        formData.append("code", code);
        formData.append("name", namePromis);
        formData.append("date", formatMoment(startDate, FORMAT_MOMENT.DATE_TIME_LONG));
        formData.append("branch_id", idBranch?.value);
        formData.append("note", note);
        newDataOption.forEach((item, index) => {
            formData.append(`items[${index}][item]`, item?.data);
            formData.append(`items[${index}][quantity]`, item?.quantity.toString());
            formData.append(`items[${index}][note]`, item?.note);
        });
        try {
            const { isSuccess, message } = await apiPurchases.apiHandingPurchases(id, formData)
            if (isSuccess) {
                isShow("success", dataLang[message] || message);
                sCode("");
                sNamePromis("Yêu cầu mua hàng (PR)");
                sStartDate(new Date());
                sNote("");
                sIdBranch(null);
                sErrDate(false);
                sErrName(false);
                sErrBranch(false);
                sOption([
                    {
                        id: Date.now(),
                        items: null,
                        unit: "",
                        quantity: 0,
                        note: "",
                    },
                ]);
                setTotalSoluong(0); // cập nhật lại tổng số lượng
                setTotalQty(0);
                router.push(routerPurchases.home);
            } else {
                if (totalQty == 0) {
                    isShow("success", `Chưa nhập thông tin mặt hàng`);
                } else {
                    isShow("error", dataLang[message] || message);
                }
            }
        } catch (error) {

        }
        sOnSending(false);
    };

    const _HandleSeachApi = debounce(async (inputValue) => {
        setSearchItems(inputValue);
    }, 500)

    useEffect(() => {
        onSending && _ServerSending();
    }, [onSending]);

    useEffect(() => {
        sErrName(false);
    }, [namePromis?.length > 0]);

    useEffect(() => {
        sErrDate(false);
    }, [selectedDate?.length > 0]);

    useEffect(() => {
        sErrBranch(false);
    }, [idBranch != null]);

    // };
    const formatNumber = (number) => {
        return formatNumberConfig(+number, dataSeting);
    };

    return (
        <React.Fragment>
            <Head>
                <title>
                    {id ? dataLang?.purchase_edit || "purchase_edit" : dataLang?.purchase_add || "purchase_add"}
                </title>
            </Head>
            <Container className="!h-auto">
                {statusExprired ? (
                    <EmptyExprired />
                ) : (
                    <div className="flex space-x-1 mt-4 3xl:text-sm 2xl:text-[11px] xl:text-[10px] lg:text-[10px]">
                        <h6 className="text-[#141522]/40">
                            {dataLang?.purchase_purchase || "purchase_purchase"}
                        </h6>
                        <span className="text-[#141522]/40">/</span>
                        <h6> {id ? dataLang?.purchase_edit || "purchase_edit" : dataLang?.purchase_add || "purchase_add"}</h6>
                    </div>
                )}
                <div className="h-[97%] space-y-3 overflow-hidden">
                    <div className="flex items-center justify-between">
                        <h2 className=" 2xl:text-lg text-base text-[#52575E] capitalize">
                            {id ? dataLang?.purchase_edit || "purchase_edit" : dataLang?.purchase_add || "purchase_add"}
                        </h2>
                        <div className="flex items-center justify-end">
                            <ButtonBack
                                onClick={() => router.push(routerPurchases.home)}
                                dataLang={dataLang}
                            />
                        </div>
                    </div>
                    <div className="w-full rounded ">
                        <div className="">
                            <h2 className="font-normal bg-[#ECF0F4] p-2 ">
                                {dataLang?.purchase_general || "purchase_general"}
                            </h2>

                            <div className="flex flex-wrap items-center justify-between mt-2">
                                <div className="w-[24.5%]">
                                    <label className="text-[#344054] font-normal text-sm mb-1  2xl:text-[12px] xl:text-[13px] text-[13px]">
                                        {dataLang?.purchase_code || "purchase_code"}{" "}
                                    </label>
                                    <input
                                        value={code}
                                        onChange={_HandleChangeInput.bind(this, "code")}
                                        name="fname"
                                        type="text"
                                        placeholder={dataLang?.purchase_err_Name_sytem || "purchase_err_Name_sytem"}
                                        className={`focus:border-[#92BFF7] border-[#d0d5dd]  placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal  p-2 border outline-none`}
                                    />
                                </div>
                                <div className="w-[24.5%] relative">
                                    <label className="text-[#344054] font-normal 2xl:text-[12px] xl:text-[13px] text-[13px] mb-1 ">
                                        {dataLang?.purchase_day || "purchase_day"}{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex flex-row custom-date-picker">
                                        <DatePicker
                                            blur
                                            fixedHeight
                                            showTimeSelect
                                            selected={startDate}
                                            onSelect={(date) => sStartDate(date)}
                                            onChange={(e) => handleTimeChange(e)}
                                            placeholderText="DD/MM/YYYY HH:mm:ss"
                                            dateFormat="dd/MM/yyyy h:mm:ss aa"
                                            timeInputLabel={"Time: "}
                                            placeholder={
                                                dataLang?.price_quote_system_default || "price_quote_system_default"
                                            }
                                            className={`border ${errDate ? "border-red-500" : "focus:border-[#92BFF7] border-[#d0d5dd]"
                                                } placeholder:text-slate-300 w-full z-[999] bg-[#ffffff] rounded text-[#52575E] font-normal p-2 outline-none cursor-pointer `}
                                        />
                                        {startDate && (
                                            <>
                                                <MdClear
                                                    className="absolute right-0 -translate-x-[320%] translate-y-[1%] h-10 text-[#CCCCCC] hover:text-[#999999] scale-110 cursor-pointer"
                                                    onClick={() => handleClearDate("startDate")}
                                                />
                                            </>
                                        )}
                                        <BsCalendarEvent className="absolute right-0 -translate-x-[75%] translate-y-[70%] text-[#CCCCCC] scale-110 cursor-pointer" />
                                    </div>
                                </div>
                                <div className="w-[24.5%]">
                                    <label className="text-[#344054] font-normal 2xl:text-[12px] xl:text-[13px] text-[13px] mb-1 ">
                                        {dataLang?.purchase_name || "purchase_name"}
                                    </label>
                                    <input
                                        value={namePromis}
                                        onChange={_HandleChangeInput.bind(this, "namePromis")}
                                        name="fname"
                                        type="text"
                                        placeholder={dataLang?.purchase_name || "purchase_name"}
                                        className={`${errName ? "border-red-500" : "focus:border-[#92BFF7] border-[#d0d5dd] "
                                            } placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal  p-2 border outline-none`}
                                    />
                                    {errName && (
                                        <label className="text-sm text-red-500">
                                            {dataLang?.purchase_err_Name || "purchase_err_Name"}
                                        </label>
                                    )}

                                    {/* <label className="text-[#344054] font-normal text-sm mb-1 ">{props.dataLang?.client_list_name}<span className="text-red-500">*</span></label> */}
                                </div>
                                <div className="w-[24.5%]">
                                    <label className="text-[#344054] font-normal 2xl:text-[12px] xl:text-[13px] text-[13px] mb-1 ">
                                        {dataLang?.purchase_branch || "purchase_branch"}{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <SelectComponent
                                        type="form"
                                        options={listBr}
                                        onChange={_HandleChangeInput.bind(this, "branch")}
                                        value={idBranch}
                                        placeholder={dataLang?.client_list_filterbrand}
                                        hideSelectedOptions={false}
                                        isClearable={true}
                                        className={`${errBranch ? "border-red-500" : "border-transparent"} placeholder:text-slate-300 w-full z-20 bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border `}
                                        isSearchable={true}
                                        noOptionsMessage={() => "Không có dữ liệu"}
                                        // components={{ MultiValue }}
                                        menuPortalTarget={document.body}
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
                                                zIndex: 20,
                                            }),
                                            control: (base, state) => ({
                                                ...base,
                                                // border: 'none',
                                                // outline: 'none',
                                                boxShadow: "none",
                                                padding: "2.7px",
                                                ...(state.isFocused && {
                                                    border: "0 0 0 1px #92BFF7",
                                                }),
                                            }),
                                        }}
                                    />

                                    {errBranch && (
                                        <label className="text-sm text-red-500">
                                            {dataLang?.purchase_err_branch || "purchase_err_branch"}
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <h2 className="font-normal bg-[#ECF0F4] p-2  2xl:text-[12px] xl:text-[13px] text-[13px] ">
                        {dataLang?.purchase_iteminfo || "purchase_iteminfo"}
                    </h2>
                    <div className="pr-2">
                        <div className="grid grid-cols-12 items-center  sticky top-0  bg-[#F7F8F9] py-2 z-10">
                            <h4 className="2xl:text-[12px] xl:text-[13px] text-[13px] px-2  text-[#667085] uppercase col-span-1      text-center  font-[400]">
                                {"Stt"}
                            </h4>
                            <h4 className="2xl:text-[12px] xl:text-[13px] text-[13px] px-2  text-[#667085] uppercase col-span-4   truncate font-[400]">
                                {dataLang?.purchase_items || "purchase_items"}
                            </h4>
                            <h4 className="2xl:text-[12px] xl:text-[13px] text-[13px] px-2  text-[#667085] uppercase col-span-1     text-center  truncate font-[400]">
                                {dataLang?.purchase_unit || "purchase_unit"}
                            </h4>
                            <h4 className="2xl:text-[12px] xl:text-[13px] text-[13px] px-2  text-[#667085] uppercase  col-span-2    text-center   truncate font-[400]">
                                {dataLang?.purchase_quantity || "purchase_quantity"}
                            </h4>
                            <h4 className="2xl:text-[12px] xl:text-[13px] text-[13px] px-2  text-[#667085] uppercase  col-span-3     truncate font-[400]">
                                {dataLang?.purchase_note || "purchase_note"}
                            </h4>
                            <h4 className="2xl:text-[12px] xl:text-[13px] text-[13px] px-2  text-[#667085] uppercase  col-span-1 text-center     truncate font-[400]">
                                {dataLang?.purchase_operation || "purchase_operation"}
                            </h4>
                        </div>
                    </div>
                    <Customscrollbar className="max-h-[400px] h-[400px]  overflow-auto pb-2">
                        {/* <div className='h-[400px] '> */}
                        {/* <div className=''> */}
                        <div className="w-full h-full">
                            <React.Fragment>
                                <div className="h-full divide-y divide-slate-200">
                                    {/* <ScrollArea className=" h-[400px] overflow-hidden" speed={1}  smoothScrolling={true}> */}
                                    {sortedArr.map((e, index) => (
                                        <div className="grid grid-cols-12 gap-1 py-1 " key={e.id}>
                                            <div className="flex items-center justify-center col-span-1">
                                                <h3 className="text-[#344054] font-normal text-center text-sm mb-1 ml-2 ">
                                                    {index + 1}
                                                </h3>
                                            </div>
                                            <div className="col-span-4  z-[100] my-auto">
                                                <Select
                                                    onInputChange={(event) => {
                                                        _HandleSeachApi(event)
                                                    }}
                                                    dangerouslySetInnerHTML={{
                                                        __html: option.label,
                                                    }}
                                                    options={data}
                                                    onChange={_HandleChangeInputOption.bind(
                                                        this,
                                                        e?.id,
                                                        "items",
                                                        index
                                                    )}
                                                    value={e?.items}
                                                    formatOptionLabel={(option) => (
                                                        <div className="flex items-center justify-between py-2">
                                                            <div className="flex items-center gap-2">
                                                                <div>
                                                                    {option.e?.images != null ? (
                                                                        <img
                                                                            src={option.e?.images}
                                                                            alt="Product Image"
                                                                            style={{
                                                                                width: "40px",
                                                                                height: "40px",
                                                                            }}
                                                                            className="object-cover rounded"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-[40px] h-[40px] object-cover  flex items-center justify-center rounded">
                                                                            <img
                                                                                src="/icon/noimagelogo.png"
                                                                                alt="Product Image"
                                                                                style={{
                                                                                    width: "40px",
                                                                                    height: "40px",
                                                                                }}
                                                                                className="object-cover rounded"
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-normal 2xl:text-[12px] xl:text-[13px] text-[12.5px]">
                                                                        {option.e?.name}
                                                                    </h3>
                                                                    <div className="flex gap-2">
                                                                        <h5 className="text-gray-400 font-normal 2xl:text-[12px] xl:text-[13px] text-[12.5px]">
                                                                            {option.e?.code}
                                                                        </h5>
                                                                        <h5 className="font-normal 2xl:text-[12px] xl:text-[13px] text-[12.5px]">
                                                                            {option?.e?.product_variation}
                                                                        </h5>
                                                                    </div>
                                                                    <div className="flex items-center gap-2 text-gray-400">
                                                                        <h5 className="text-gray-400 font-normal 2xl:text-[12px] xl:text-[13px] text-[12.5px]">
                                                                            {dataLang[option.e?.text_type]}
                                                                        </h5>
                                                                        {"-"}
                                                                        <div className="flex items-center gap-1">
                                                                            <h5 className="text-gray-400 font-normal 2xl:text-[12px] xl:text-[13px] text-[12.5px]">
                                                                                {dataLang?.purchase_survive || "purchase_survive"}  :
                                                                            </h5>
                                                                            <h5 className=" font-normal text-black 2xl:text-[12px] xl:text-[13px] text-[12.5px]">
                                                                                {option.e?.qty_warehouse ? formatNumber(option.e?.qty_warehouse) : "0"}
                                                                            </h5>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    placeholder={dataLang?.purchase_items || "purchase_items"}
                                                    hideSelectedOptions={false}
                                                    className="rounded-md bg-white  xl:text-base text-[14.5px] z-20 mb-2"
                                                    isSearchable={true}
                                                    noOptionsMessage={() => "Không có dữ liệu"}
                                                    menuPortalTarget={document.body}
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
                                                            zIndex: 9999,
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
                                            <div className="flex items-center justify-center col-span-1 text-center">
                                                <h3 className="2xl:text-[12px] xl:text-[13px] text-[13px]">
                                                    {e.unit}
                                                </h3>
                                            </div>
                                            <div className="flex items-center justify-center col-span-2">
                                                <div className="flex items-center justify-center">
                                                    <button
                                                        className=" text-gray-400 hover:bg-[#e2f0fe] hover:text-gray-600 font-bold flex items-center justify-center p-0.5  bg-slate-200 rounded-full"
                                                        onClick={() => handleDecrease(e.id)}
                                                        disabled={index === 0}
                                                    >
                                                        <Minus size="14" />
                                                    </button>
                                                    <InPutNumericFormat
                                                        value={e?.quantity}
                                                        onValueChange={_HandleChangeInputOption.bind(
                                                            this,
                                                            e.id,
                                                            "quantity",
                                                            e
                                                        )}
                                                        isAllowed={isAllowedNumber}
                                                        allowNegative={false}
                                                        className={`${e?.quantity == 0 && 'border-red-500' || e?.quantity == "" && 'border-red-500'} cursor-default appearance-none text-center 3xl:text-[13px] 2xl:text-[12px] xl:text-[11px] text-[10px] py-1 px-0.5 font-normal 2xl:w-24 xl:w-[90px] w-[63px]  focus:outline-none border-b-2 border-gray-200`}
                                                    />
                                                    <button
                                                        className=" text-gray-400 hover:bg-[#e2f0fe] hover:text-gray-600 font-bold flex items-center justify-center p-0.5  bg-slate-200 rounded-full"
                                                        onClick={() => handleIncrease(e.id)}
                                                        disabled={index === 0}
                                                    >
                                                        <Add size="14" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-center col-span-3">
                                                <input
                                                    value={e.note}
                                                    onChange={_HandleChangeInputOption.bind(
                                                        this,
                                                        e.id,
                                                        "note",
                                                        index
                                                    )}
                                                    name="optionEmail"
                                                    placeholder="Ghi chú"
                                                    type="text"
                                                    className="focus:border-[#92BFF7] border-[#d0d5dd]  placeholder:text-slate-300 w-full bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-1.5 border outline-none mb-2"
                                                />
                                            </div>
                                            <div className="flex items-center justify-center col-span-1">
                                                <button
                                                    onClick={_HandleDelete.bind(this, e.id)}
                                                    type="button"
                                                    title="Xóa"
                                                    className="transition  w-full bg-slate-100 h-10 rounded-[5.5px] text-red-500 flex flex-col justify-center items-center mb-2"
                                                >
                                                    <IconDelete />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* </ScrollArea> */}
                            </React.Fragment>
                        </div>
                    </Customscrollbar>
                    <h2 className="font-normal bg-[white] shadow-xl p-2 border-b border-b-[#a9b5c5] 2xl:text-[14px] xl:text-[13px] text-[13px]  border-t border-t-[#a9b5c5]">
                        {dataLang?.purchase_total || "purchase_total"}{" "}
                    </h2>
                </div>
                <div className="grid grid-cols-12">
                    <div className="col-span-9">
                        <div className="text-[#344054] font-normal 2xl:text-[14px] xl:text-[13px] text-[13px] mb-1 ">
                            {dataLang?.purchase_note || ""}
                        </div>
                        <textarea
                            value={note}
                            placeholder={props.dataLang?.client_popup_note}
                            onChange={_HandleChangeInput.bind(this, "note")}
                            name="fname"
                            type="text"
                            className="focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-[40%] min-h-[120px] max-h-[200px] bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-2 border outline-none "
                        />
                    </div>
                    <div className="flex-col justify-between col-span-3 mt-5 space-y-4 text-right ">
                        <div className="flex justify-between ">
                            <div className="font-normal 2xl:text-[14px] xl:text-[13px] text-[13px]">
                                <h3>{dataLang?.purchase_totalCount || "purchase_totalCount"}</h3>
                            </div>
                            <div className="font-normal 2xl:text-[14px] xl:text-[13px] text-[13px]">
                                <h3 className="text-blue-600">{formatNumber(totalSoluong)}</h3>
                            </div>
                        </div>
                        <div className="flex justify-between ">
                            <div className="font-normal 2xl:text-[14px] xl:text-[13px] text-[13px]">
                                <h3>{dataLang?.purchase_totalItem || "purchase_totalItem"}</h3>
                            </div>
                            <div className="font-normal 2xl:text-[14px] xl:text-[13px] text-[13px]">
                                <h3 className="text-blue-600">{formatNumber(totalQty)}</h3>
                            </div>
                        </div>
                        <div className="space-x-2">
                            <ButtonBack
                                onClick={() => router.push(routerPurchases.home)}
                                dataLang={dataLang}
                            />
                            <ButtonSubmit
                                onClick={_HandleSubmit.bind(this)}
                                dataLang={dataLang}
                                loading={onSending}
                            />
                        </div>
                    </div>
                </div>
            </Container>
            <PopupConfim
                dataLang={dataLang}
                type="warning"
                title={TITLE_DELETE_ITEMS}
                subtitle={CONFIRMATION_OF_CHANGES}
                isOpen={isOpen}
                nameModel={'change_item'}
                save={resetValue}
                cancel={() => handleQueryId({ status: false })}
            />
        </React.Fragment>
    );
};
export default PurchasesForm;
