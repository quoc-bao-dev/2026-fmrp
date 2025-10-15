import apiServiceVoucher from "@/Api/apiPurchaseOrder/apiServicevVoucher";
import EditIcon from "@/components/icons/common/EditIcon";
import PlusIcon from "@/components/icons/common/PlusIcon";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import InPutMoneyFormat from "@/components/UI/inputNumericFormat/inputMoneyFormat";
import InPutNumericFormat from "@/components/UI/inputNumericFormat/inputNumericFormat";
import PopupCustom from "@/components/UI/popup";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import { WARNING_STATUS_ROLE } from "@/constants/warningStatus/warningStatus";
import { useSupplierList } from "@/containers/suppliers/supplier/hooks/useSupplierList";
import { useBranchList } from "@/hooks/common/useBranch";
import { useTaxList } from "@/hooks/common/useTaxs";
import useSetingServer from "@/hooks/useConfigNumber";
import useActionRole from "@/hooks/useRole";
import useToast from "@/hooks/useToast";
import { isAllowedDiscount, isAllowedNumber } from "@/utils/helpers/common";
import { formatMoment } from "@/utils/helpers/formatMoment";
import formatMoneyConfig from "@/utils/helpers/formatMoney";
import formatNumberConfig from "@/utils/helpers/formatnumber";
import { SelectCore } from "@/utils/lib/Select";
import { useMutation, useQuery } from "@tanstack/react-query";
import vi from "date-fns/locale/vi";
import { Add, Trash as IconDelete, Minus } from "iconsax-react";
import moment from "moment/moment";
import { useEffect, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BsCalendarEvent } from "react-icons/bs";
import { MdClear } from "react-icons/md";
import { useSelector } from "react-redux";
import Select from "react-select";
import { v4 as uuidv4 } from "uuid";
registerLocale("vi", vi);

const PopupServieVoucher = (props) => {
    let id = props?.id;

    const dataLang = props.dataLang;

    const [open, sOpen] = useState(false);

    const isShow = useToast();

    const dataSeting = useSetingServer();

    const authState = useSelector((state) => state.auth);

    const { is_admin: role, permissions_current: auth } = useSelector((state) => state.auth);

    const { checkAdd, checkEdit, checkExport } = useActionRole(auth, "servicev_voucher");

    const _HandleCloseModal = () => sOpen(false);

    const [onSending, sOnSending] = useState(false);

    const [option, sOption] = useState([
        {
            id: Date.now(),
            idData: "",
            service: "",
            quantity: 1,
            price: 0,
            discount: 0,
            affterPriceDiscount: 0,
            tax: 0,
            money: 0,
            note: "",
        },
    ]);
    const slicedArr = option.slice(1);

    const sortedArr = slicedArr.sort((a, b) => b.id - a.id);

    sortedArr.unshift(option[0]);

    const [code, sCode] = useState(null);

    const [date, sDate] = useState(new Date());

    const [valueBr, sValueBr] = useState(null);

    const [valueSupplier, sValueSupplier] = useState(null);

    const [note, sNote] = useState("");

    const [discount, sDiscount] = useState(0);

    const [tax, sTax] = useState(0);

    const [errDate, sErrDate] = useState(false);

    const [errBranch, sErrBranch] = useState(false);

    const [errSupplier, sErrSupplier] = useState(false);

    const [errService, sErrService] = useState(false);

    const [total, setTotal] = useState({
        totalMoney: 0,
        totalDiscount: 0,
        totalAffterDiscount: 0,
        totalTax: 0,
        totalAmountMoney: 0,
    });

    const { data: dataBranch = [] } = useBranchList();

    const { data: dataTasxes = [] } = useTaxList();

    const { data: listSupplier } = useSupplierList({ "filter[branch_id]": valueBr != null ? valueBr.value : null, });

    const dataSupplier = valueBr ? listSupplier?.rResult?.map((e) => ({ label: e.name, value: e.id })) : []
    
    // Tự động chọn chi nhánh đầu tiên từ authState khi component mount
    useEffect(() => {
        if (authState.branch?.length > 0 && !valueBr && open) {
            const firstBranch = {
                label: authState.branch[0].name,
                value: authState.branch[0].id,
            }
            sValueBr(firstBranch)
        }
    }, [authState.branch, open])

    const _HandleOpenModal = (e) => {
        if (id) {
            if (role || checkEdit) {
                if (props?.status_pay != "not_spent") {
                    sOpen(false);
                    isShow("error", `${"Phiếu dịch vụ đã chi. Không thể sửa"}`);
                } else {
                    sOpen(true);
                }
            } else {
                isShow("error", WARNING_STATUS_ROLE);
            }
        } else {
            sOpen(true);
        }
    };

    useEffect(() => {
        open && sDate(new Date());
        open && sCode("");
        open && sValueSupplier(null);
        open && sOption([
            {
                id: Date.now(),
                idData: " ",
                service: "",
                quantity: 1,
                price: 0,
                discount: 0,
                affterPriceDiscount: 0,
                tax: 0,
                money: 0,
                note: "",
            },
        ]);
        open && sTax(0);
        open && sDiscount(0);
        open && sNote("");
        open && sErrBranch(false);
        open && sErrSupplier(false);
        open && sErrService(false);
        
        // Không reset chi nhánh tại đây để giữ lại giá trị từ useEffect tự động chọn
    }, [open]);

    useQuery({
        queryKey: ['api_detail_service', id],
        queryFn: async () => {
            const db = await apiServiceVoucher.apiDetailService(id);
            sDate(moment(db?.date).toDate());
            sCode(db?.code);
            sValueBr({ label: db?.branch_name, value: db?.branch_id });
            sNote(db?.note);
            sValueSupplier({
                label: db?.supplier_name,
                value: db?.suppliers_id,
            });
            sOption(
                db?.item?.map((e) => ({
                    id: e?.id,
                    idData: e?.id,
                    service: e?.name,
                    quantity: Number(e?.quantity),
                    price: Number(e?.price),
                    discount: Number(e?.discount_percent),
                    affterPriceDiscount: Number(e?.price) * (1 - Number(e?.discount_percent) / 100),
                    tax: {
                        label: e?.tax_name ? e?.tax_name : "Miễn thuế",
                        value: e?.tax_id,
                        tax_rate: Number(e?.tax_rate),
                    },
                    money: Number(e?.amount),
                    note: e?.note,
                }))
            );
            return db
        },
        enabled: open && !!id
    })

    const taxOptions = [{ label: "Miễn thuế", value: "0", tax_rate: "0" }, ...dataTasxes];

    // add option form
    const _HandleAddNew = () => {
        sOption([
            ...option,
            {
                id: Date.now(),
                idData: "",
                service: "",
                quantity: 1,
                price: 0,
                discount: 0,
                affterPriceDiscount: 0,
                tax: 0,
                money: 0,
                note: "",
            },
        ]);
    };

    const _HandleChangeInput = (type, value) => {
        if (type === "date") {
            sDate(value);
        } else if (type === "clear") {
            sDate(new Date());
        } else if (type === "code") {
            sCode(value?.target.value);
        } else if (type === "valueBr" && valueBr != value) {
            sValueBr(value);
            sValueSupplier(null);
        } else if (type === "valueSupplier") {
            sValueSupplier(value);
        } else if (type === "note") {
            sNote(value?.target.value);
        } else if (type == "tax") {
            sTax(value);
        } else if (type == "discount") {
            sDiscount(value?.value);
        }
    };

    useEffect(() => {
        if (tax == null) return;
        sOption((prevOption) => {
            const newOption = [...prevOption];
            const taxValue = tax?.tax_rate || 0;
            const chietKhauValue = discount || 0;
            newOption.forEach((item, index) => {
                const affterPriceDiscount = item?.price * (1 - chietKhauValue / 100);
                const money = affterPriceDiscount * (1 + taxValue / 100) * item.quantity;
                item.tax = tax;
                item.money = isNaN(money) ? 0 : money;
            });
            return newOption;
        });
    }, [tax]);

    useEffect(() => {
        if (discount == null) return;
        sOption((prevOption) => {
            const newOption = [...prevOption];
            const taxValue = tax?.tax_rate != undefined ? tax?.tax_rate : 0;
            const chietKhauValue = discount ? discount : 0;
            newOption.forEach((item, index) => {
                const affterPriceDiscount = item?.price * (1 - chietKhauValue / 100);
                const money = affterPriceDiscount * (1 + taxValue / 100) * item.quantity;
                item.tax = tax;
                item.discount = Number(discount);
                item.affterPriceDiscount = isNaN(affterPriceDiscount) ? 0 : affterPriceDiscount;
                item.money = isNaN(money) ? 0 : money;
            });
            return newOption;
        });
    }, [discount]);
    const _HandleSubmit = (e) => {
        e.preventDefault();

        const hasNullLabel = option.some((item) => item.service === "");
        const check = option.some(
            (item) => item.quantity == 0 || item.quantity == "" || item.price == 0 || item.price == ""
        );
        if (date == null || valueSupplier == null || valueBr == null || hasNullLabel || check) {
            date == null && sErrDate(true);
            valueBr == null && sErrBranch(true);
            valueSupplier == null && sErrSupplier(true);
            hasNullLabel && sErrService(true);
            isShow("error", `${dataLang?.required_field_null}`);
        } else {
            sOnSending(true);
        }
    };

    useEffect(() => {
        option?.filter((e) => e.service === "") && sErrService(false);
    }, [option]);

    useEffect(() => {
        sErrDate(false);
    }, [date != null]);

    useEffect(() => {
        sErrSupplier(false);
    }, [valueSupplier != null]);

    useEffect(() => {
        sErrBranch(false);
    }, [valueBr != null]);

    const _HandleChangeInputOption = (id, type, index3, value) => {
        var index = option.findIndex((x) => x.id === id);
        if (type === "service") {
            option[index].service = value.target.value;
            if (value.target.value.length > 0 && index === option.length - 1) {
                option.push({
                    id: uuidv4(),
                    idData: "",
                    service: "",
                    quantity: 1,
                    price: 0,
                    discount: discount ? discount : 0,
                    affterPriceDiscount: 0,
                    tax: tax ? tax : 0,
                    money: 0,
                });
                sOption([...option]);
            }
        } else if (type == "donvitinh") {
            option[index].donvitinh = value.target?.value;
        } else if (type === "quantity") {
            option[index].quantity = Number(value?.value);
            if (option[index].tax?.tax_rate == undefined) {
                const tien = Number(option[index].affterPriceDiscount) * (1 + Number(0) / 100) * Number(option[index].quantity);
                option[index].money = Number(tien.toFixed(2));
            } else {
                const tien =
                    Number(option[index].affterPriceDiscount) *
                    (1 + Number(option[index].tax?.tax_rate) / 100) *
                    Number(option[index].quantity);
                option[index].money = Number(tien.toFixed(2));
            }
            sOption([...option]);
        } else if (type == "price") {
            option[index].price = Number(value.value);
            option[index].affterPriceDiscount = +option[index].price * (1 - option[index].discount / 100);
            option[index].affterPriceDiscount = +(Math.round(option[index].affterPriceDiscount + "e+2") + "e-2");
            if (option[index].tax?.tax_rate == undefined) {
                const tien = Number(option[index].affterPriceDiscount) * (1 + Number(0) / 100) * Number(option[index].quantity);
                option[index].money = Number(tien.toFixed(2));
            } else {
                const tien =
                    Number(option[index].affterPriceDiscount) *
                    (1 + Number(option[index].tax?.tax_rate) / 100) *
                    Number(option[index].quantity);
                option[index].money = Number(tien.toFixed(2));
            }
        } else if (type == "discount") {
            option[index].discount = Number(value.value);
            option[index].affterPriceDiscount = +option[index].price * (1 - option[index].discount / 100);
            option[index].affterPriceDiscount = +(Math.round(option[index].affterPriceDiscount + "e+2") + "e-2");
            if (option[index].tax?.tax_rate == undefined) {
                const tien = Number(option[index].affterPriceDiscount) * (1 + Number(0) / 100) * Number(option[index].quantity);
                option[index].money = Number(tien.toFixed(2));
            } else {
                const tien =
                    Number(option[index].affterPriceDiscount) *
                    (1 + Number(option[index].tax?.tax_rate) / 100) *
                    Number(option[index].quantity);
                option[index].money = Number(tien.toFixed(2));
            }
        } else if (type == "tax") {
            option[index].tax = value;
            if (option[index].tax?.tax_rate == undefined) {
                const tien = Number(option[index].affterPriceDiscount) * (1 + Number(0) / 100) * Number(option[index].quantity);
                option[index].money = Number(tien.toFixed(2));
            } else {
                const tien =
                    Number(option[index].affterPriceDiscount) *
                    (1 + Number(option[index].tax?.tax_rate) / 100) *
                    Number(option[index].quantity);
                option[index].money = Number(tien.toFixed(2));
            }
        } else if (type == "note") {
            option[index].note = value?.target?.value;
        }
        sOption([...option]);
    };

    const handleIncrease = (id) => {
        const index = option.findIndex((x) => x.id === id);
        const newQuantity = option[index].quantity + 1;
        option[index].quantity = newQuantity;
        if (option[index].tax?.tax_rate == undefined) {
            const tien = Number(option[index].affterPriceDiscount) * (1 + Number(0) / 100) * Number(option[index].quantity);
            option[index].money = Number(tien.toFixed(2));
        } else {
            const tien =
                Number(option[index].affterPriceDiscount) *
                (1 + Number(option[index].tax?.tax_rate) / 100) *
                Number(option[index].quantity);
            option[index].money = Number(tien.toFixed(2));
        }
        sOption([...option]);
    };

    const handleDecrease = (id) => {
        const index = option.findIndex((x) => x.id === id);
        const newQuantity = Number(option[index].quantity) - 1;
        if (newQuantity >= 1) {
            // chỉ giảm số lượng khi nó lớn hơn hoặc bằng 1
            option[index].quantity = Number(newQuantity);
            if (option[index].tax?.tax_rate == undefined) {
                const tien = Number(option[index].affterPriceDiscount) * (1 + Number(0) / 100) * Number(option[index].quantity);
                option[index].money = Number(tien.toFixed(2));
            } else {
                const tien =
                    Number(option[index].affterPriceDiscount) *
                    (1 + Number(option[index].tax?.tax_rate) / 100) *
                    Number(option[index].quantity);
                option[index].money = Number(tien.toFixed(2));
            }
            sOption([...option]);
        } else {
            return isShow("error", `${"Số lượng tối thiểu"}`);
        }
    };

    const _HandleDelete = (id) => {
        if (id === option[0].id) {
            return isShow("error", `${"Mặc định hệ thống, không xóa"}`);
        }
        const newOption = option.filter((x) => x.id !== id); // loại bỏ phần tử cần xóa
        sOption(newOption); // cập nhật lại mảng
    };


    const formatNumber = (number) => {
        return formatNumberConfig(+number, dataSeting);
    };

    const formatMoney = (number) => {
        return formatMoneyConfig(+number, dataSeting);
    };

    const caculateMoney = (option) => {
        const totalMoney = option?.reduce(
            (accumulator, currentValue) => accumulator + currentValue?.price * currentValue?.quantity,
            0
        );

        const totalDiscount = option?.reduce((acc, item) => {
            const caculateMoney = item?.price * (item?.discount / 100) * item?.quantity;
            return acc + caculateMoney;
        }, 0);

        const totalAffterDiscount = option?.reduce((acc, item) => {
            const caculateMoney = item?.quantity * item?.affterPriceDiscount;
            return acc + caculateMoney;
        }, 0);

        const totalTax = option?.reduce((acc, item) => {
            const caculateMoney =
                item?.affterPriceDiscount * (isNaN(item?.tax?.tax_rate) ? 0 : item?.tax?.tax_rate / 100) * item?.quantity;
            return acc + caculateMoney;
        }, 0);

        const totalAmountMoney = option?.reduce((acc, item) => acc + item?.money, 0);
        return {
            totalMoney: totalMoney || 0,
            totalDiscount: totalDiscount || 0,
            totalAffterDiscount: totalAffterDiscount || 0,
            totalTax: totalTax || 0,
            totalAmountMoney: totalAmountMoney || 0,
        };
    };


    useEffect(() => {
        const totalMoney = caculateMoney(option);
        setTotal(totalMoney);
    }, [option]);

    const handingService = useMutation({
        mutationFn: (data) => {
            return apiServiceVoucher.apiHandingService(id, data);
        },
    });

    const _ServerSending = () => {
        const formData = new FormData();
        formData.append("code", code);
        formData.append("date", formatMoment(date, FORMAT_MOMENT.DATE_TIME_LONG));
        formData.append("branch_id", valueBr.value);
        formData.append("suppliers_id", valueSupplier.value);
        formData.append("note", note);
        sortedArr.forEach((item, index) => {
            formData.append(`items[${index}][id]`, props?.id ? item?.idData : "");
            formData.append(`items[${index}][name]`, item?.service ? item?.service : "");
            formData.append(`items[${index}][price]`, item?.price ? item?.price : "");
            formData.append(`items[${index}][quantity]`, item?.quantity ? item?.quantity : "");
            formData.append(`items[${index}][discount_percent]`, item?.discount ? item?.discount : "");
            formData.append(`items[${index}][tax_id]`, item?.tax?.value != undefined ? item?.tax?.value : "");
            formData.append(`items[${index}][note]`, item?.note ? item?.note : "");
        });
        handingService.mutate(formData, {
            onSuccess: ({ isSuccess, message }) => {
                if (isSuccess) {
                    isShow("success", dataLang[message] || message);
                    sDate(new Date());
                    sCode("");
                    sValueBr(null);
                    sValueSupplier(null);
                    sNote("");
                    sErrBranch(false);
                    sErrService(false);
                    sErrSupplier(false);
                    sOption([
                        {
                            id: Date.now(),
                            idData: "",
                            service: "",
                            quantity: 1,
                            price: 0,
                            discount: 0,
                            affterPriceDiscount: 0,
                            tax: 0,
                            money: 0,
                        },
                    ]);
                    props.onRefresh && props.onRefresh();
                    props.onRefreshGr && props.onRefreshGr();
                    sOpen(false);
                } else {
                    isShow("error", dataLang[message] || message);
                }
            },
        });

        sOnSending(false);
    };
    useEffect(() => {
        onSending && _ServerSending();
    }, [onSending]);

    return (
        <>
            <PopupCustom
                title={props.id ? `${props.dataLang?.serviceVoucher_edit || "serviceVoucher_edit"}` : `${props.dataLang?.serviceVoucher_add || "serviceVoucher_add"}`}
                button={props.id ? 
                <div className="group rounded-lg p-1 border border-transparent hover:border-[#064E3B] hover:bg-[#064E3B]/10 transition-all ease-in-out flex items-center gap-2  2xl:text-sm xl:text-sm text-[8px] text-left cursor-pointer">
                    <EditIcon
                        color="#064E3B"
                        className="size-5 transition-all duration-300"
                    />
                </div> : 
                <div className="flex items-center gap-2">
                    <PlusIcon />
                    {props.dataLang?.branch_popup_create_new}
                </div>
            }
                onClickOpen={_HandleOpenModal.bind(this)}
                open={open}
                onClose={_HandleCloseModal.bind(this)}
                classNameBtn={props.className}
            >
                <div className="mt-4  max-w-[75vw] 2xl:max-w-[65vw] xl:max-w-[75vw]">
                    <h2 className="font-normal bg-[#ECF0F4] 2xl:text-[12px] xl:text-[13px] text-[12px] p-1">
                        {dataLang?.serviceVoucher_general_information || "serviceVoucher_general_information"}
                    </h2>
                    <form onSubmit={_HandleSubmit.bind(this)} className="">
                        <div className="max-w-[75vw] 2xl:max-w-[65vw] xl:max-w-[75vw] ">
                            <div className="grid grid-cols-5 gap-5 items-center">
                                <div className="col-span-2 max-h-[70px] min-h-[70px] relative">
                                    <label className="text-[#344054] font-normal 2xl:text-[12px] xl:text-[13px] text-[12px] mb-1 ">
                                        {dataLang?.serviceVoucher_day_vouchers}{" "}
                                    </label>
                                    <div className="custom-date-picker flex flex-row ">
                                        <DatePicker
                                            blur
                                            fixedHeight
                                            showTimeSelect
                                            selected={date}
                                            onSelect={(date) => _HandleChangeInput("date", date)}
                                            onChange={(e) => _HandleChangeInput("date", e)}
                                            placeholderText="DD/MM/YYYY HH:mm:ss"
                                            dateFormat="dd/MM/yyyy h:mm:ss aa"
                                            timeInputLabel={"Time: "}
                                            placeholder={
                                                dataLang?.price_quote_system_default || "price_quote_system_default"
                                            }
                                            className={`border focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300 w-full z-[999] bg-[#ffffff] rounded text-[#52575E] font-normal p-2 outline-none cursor-pointer `}
                                        />
                                        {date && (
                                            <>
                                                <MdClear
                                                    className="absolute right-0 -translate-x-[320%] translate-y-[1%] h-10 text-[#CCCCCC] hover:text-[#999999] scale-110 cursor-pointer"
                                                    onClick={() => _HandleChangeInput("clear")}
                                                />
                                            </>
                                        )}
                                        <BsCalendarEvent className="absolute right-0 -translate-x-[75%] translate-y-[70%] text-[#CCCCCC] scale-110 cursor-pointer" />
                                    </div>
                                </div>
                                <div className="col-span-1 max-h-[70px] min-h-[70px]">
                                    <label className="text-[#344054] font-normal 2xl:text-[12px] xl:text-[13px] text-[12px] mb-1 ">
                                        {props.dataLang?.serviceVoucher_branch} <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        closeMenuOnSelect={true}
                                        placeholder={props.dataLang?.serviceVoucher_branch}
                                        options={dataBranch}
                                        isSearchable={true}
                                        onChange={_HandleChangeInput.bind(this, "valueBr")}
                                        LoadingIndicator
                                        noOptionsMessage={() => "Không có dữ liệu"}
                                        value={valueBr}
                                        maxMenuHeight="200px"
                                        isClearable={true}
                                        menuPortalTarget={document.body}
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
                                            } placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] 2xl:text-[12px] xl:text-[13px] text-[12px] mb-2 font-normal outline-none border `}
                                    />
                                    {errBranch && (
                                        <label className="mb-2  2xl:text-[12px] xl:text-[13px] text-[12px] text-red-500">
                                            {props.dataLang?.client_list_bran}
                                        </label>
                                    )}
                                </div>
                                <div className="col-span-1 max-h-[70px] min-h-[70px]">
                                    <label className="text-[#344054] font-normal 2xl:text-[12px] xl:text-[13px] text-[12px] mb-1 ">
                                        {dataLang?.serviceVoucher_voucher_code || "serviceVoucher_voucher_code"}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        value={code}
                                        onChange={_HandleChangeInput.bind(this, "code")}
                                        placeholder={"Mặc định theo hệ thống"}
                                        type="text"
                                        className="focus:border-[#92BFF7] border-[#d0d5dd] 2xl:text-[12px] xl:text-[13px] text-[12px] placeholder:text-slate-300 w-full bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-2.5 border outline-none mb-2"
                                    />
                                </div>
                                <div className="col-span-1  max-h-[70px] min-h-[70px]">
                                    <label className="text-[#344054] font-normal 2xl:text-[12px] xl:text-[13px] text-[12px] mb-1 ">
                                        {dataLang?.serviceVoucher_supplier || "serviceVoucher_supplier"}{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <Select
                                        closeMenuOnSelect={true}
                                        placeholder={dataLang?.serviceVoucher_supplier || "serviceVoucher_supplier"}
                                        options={dataSupplier}
                                        isSearchable={true}
                                        onChange={_HandleChangeInput.bind(this, "valueSupplier")}
                                        LoadingIndicator
                                        noOptionsMessage={() => "Không có dữ liệu"}
                                        value={valueSupplier}
                                        maxMenuHeight="200px"
                                        isClearable={true}
                                        menuPortalTarget={document.body}
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
                                        className={`${errSupplier ? "border-red-500" : "border-transparent"
                                            } 2xl:text-[12px] xl:text-[13px] text-[12px] placeholder:text-slate-300 w-full bg-[#ffffff] mb-2 rounded text-[#52575E] font-normal outline-none border `}
                                    />
                                    {errSupplier && (
                                        <label className="mb-2  2xl:text-[12px] xl:text-[13px] text-[12px] text-red-500">
                                            {props.dataLang?.purchase_order_errSupplier}
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>
                        <h2 className="font-normal bg-[#ECF0F4] p-1 2xl:text-[12px] xl:text-[13px] text-[12px]  mb-1 ">
                            {dataLang?.serviceVoucher_information_services || "serviceVoucher_information_services"}
                        </h2>
                        <div className="grid grid-cols-12 items-center  sticky top-0  bg-[#F7F8F9] py-2 z-10">
                            <h4 className="2xl:text-[12px] xl:text-[13px] text-[12px] px-2  text-[#667085] uppercase  col-span-2    text-center    truncate font-[400] flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={_HandleAddNew.bind(this)}
                                    title="Thêm"
                                    className="transition hover:bg-red-100 hover:animate-pulse	 rounded-full bg-slate-200 flex flex-col justify-center items-center"
                                >
                                    <Add color="red" size={20} className="" />
                                </button>
                                {dataLang?.serviceVoucher_services_arising || "serviceVoucher_services_arising"}
                            </h4>
                            <h4 className="2xl:text-[12px] xl:text-[13px] text-[12px] px-2  text-[#667085] uppercase  col-span-2    text-center  truncate font-[400]">
                                {dataLang?.serviceVoucher_quantity || "serviceVoucher_quantity"}
                            </h4>
                            <h4 className="2xl:text-[12px] xl:text-[13px] text-[12px] px-2  text-[#667085] uppercase  col-span-1    text-center  truncate font-[400]">
                                {dataLang?.serviceVoucher_unit_price || "serviceVoucher_unit_price"}
                            </h4>
                            <h4 className="2xl:text-[12px] xl:text-[13px] text-[12px] px-2  text-[#667085] uppercase  col-span-1    text-center  truncate font-[400]">
                                {"% CK"}
                            </h4>
                            <h4 className="2xl:text-[12px] xl:text-[13px] text-[12px] px-2  text-[#667085] uppercase  col-span-1    text-center  truncate font-[400]">
                                {"ĐGSCK"}
                            </h4>
                            <h4 className="2xl:text-[12px] xl:text-[13px] text-[12px] px-2  text-[#667085] uppercase  col-span-2    text-center  truncate font-[400]">
                                {dataLang?.serviceVoucher_tax || "serviceVoucher_tax"}
                            </h4>
                            <h4 className="2xl:text-[12px] xl:text-[13px] text-[12px] px-2  text-[#667085] uppercase  col-span-1    text-center    truncate font-[400]">
                                {dataLang?.serviceVoucher_into_money || "serviceVoucher_into_money"}
                            </h4>
                            <h4 className="2xl:text-[12px] xl:text-[13px] text-[12px] px-2  text-[#667085] uppercase  col-span-1    text-center    truncate font-[400]">
                                {dataLang?.serviceVoucher_note || "serviceVoucher_note"}
                            </h4>
                            <h4 className="2xl:text-[12px] xl:text-[13px] text-[12px] px-2  text-[#667085] uppercase  col-span-1    text-center    truncate font-[400]">
                                {dataLang?.serviceVoucher_operation || "serviceVoucher_operation"}
                            </h4>
                        </div>
                        <Customscrollbar className="min-h-[140px] xl:min-h-[140px] 2xl:min-h-[180px] max-h-[140px] xl:max-h-[140px] 2xl:max-h-[180px]">
                            {sortedArr.map((e, index) => (
                                <div className="grid grid-cols-12 gap-1 py-1 " key={e?.id}>
                                    <div className="col-span-2  my-auto ">
                                        <textarea
                                            value={e?.service}
                                            onChange={_HandleChangeInputOption.bind(this, e?.id, "service", index)}
                                            name="optionEmail"
                                            placeholder="Dịch vụ"
                                            type="text"
                                            className={`${errService && e?.service == "" ? "border-red-500" : "border-gray-300"} placeholder:text-slate-300 bg-[#ffffff] rounded text-[#52575E] min-h-[40px] h-[40px] max-h-[80px] 2xl:text-[12px] xl:text-[13px] text-[12px] w-full font-normal outline-none border  p-1.5 `}
                                        />
                                    </div>
                                    <div className="col-span-2 flex items-center justify-center">
                                        <div className="flex items-center justify-center">
                                            <button
                                                type="button"
                                                className=" text-gray-400 hover:bg-[#e2f0fe] hover:text-gray-600 font-bold flex items-center justify-center p-[1px]  bg-slate-200 rounded-full"
                                                onClick={() => handleDecrease(e?.id)}
                                            >
                                                <Minus className="scale-70" size="16" />
                                            </button>
                                            <InPutNumericFormat
                                                className={`${(e?.quantity == 0 && "border-red-500") || (e?.quantity == "" && "border-red-500")} appearance-none text-center 2xl:text-[12px] xl:text-[13px] text-[12px] py-2 px-0.5 font-normal 2xl:w-20 xl:w-[55px] w-[63px]  focus:outline-none border-b-2 border-gray-200`}
                                                onValueChange={_HandleChangeInputOption.bind(this, e?.id, "quantity", e)}
                                                value={e?.quantity}
                                                isAllowed={isAllowedNumber}
                                            />
                                            <button
                                                type="button"
                                                className=" text-gray-400 hover:bg-[#e2f0fe] hover:text-gray-600 font-bold flex items-center justify-center p-[1px]  bg-slate-200 rounded-full"
                                                onClick={() => handleIncrease(e.id)}
                                            >
                                                <Add className="scale-70" size="16" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-span-1 text-center flex items-center justify-center">
                                        <InPutMoneyFormat
                                            value={e?.price}
                                            onValueChange={_HandleChangeInputOption.bind(this, e?.id, "price", index)}
                                            className={`${(e?.price == 0 && "border-red-500") || (e?.price == "" && "border-red-500")} appearance-none 2xl:text-[12px] xl:text-[13px] text-[12px] text-center py-1 px-1 font-normal w-[90%] focus:outline-none border-b-2 border-gray-200`}
                                        />
                                    </div>
                                    <div className="col-span-1 text-center flex items-center justify-center">
                                        <InPutNumericFormat
                                            value={e?.discount}
                                            onValueChange={_HandleChangeInputOption.bind(this, e?.id, "discount", index)}
                                            className="appearance-none text-center py-1 px-1 font-normal w-[90%]  focus:outline-none border-b-2 2xl:text-[12px] xl:text-[13px] text-[12px] border-gray-200"
                                            isAllowed={isAllowedDiscount}
                                        />
                                    </div>
                                    <div className="col-span-1 text-right flex items-center justify-end">
                                        <h3 className="px-2 2xl:text-[12px] xl:text-[13px] text-[12px]">
                                            {formatNumber(e?.affterPriceDiscount)}
                                        </h3>
                                    </div>
                                    <div className="col-span-2 flex justify-center items-center">
                                        <SelectCore
                                            closeMenuOnSelect={true}
                                            placeholder={props.dataLang?.serviceVoucher_tax || "serviceVoucher_tax"}
                                            options={taxOptions}
                                            isSearchable={true}
                                            onChange={_HandleChangeInputOption.bind(this, e?.id, "tax", index)}
                                            LoadingIndicator
                                            noOptionsMessage={() => "Không có dữ liệu"}
                                            value={e?.tax}
                                            maxMenuHeight="200px"
                                            isClearable={true}
                                            menuPortalTarget={document.body}
                                            formatOptionLabel={(option) => (
                                                <div className="flex justify-start items-center gap-1 ">
                                                    <h2 className="2xl:text-[12px] xl:text-[13px] text-[12px]">
                                                        {option?.label}
                                                    </h2>
                                                    <h2 className="2xl:text-[12px] xl:text-[13px] text-[12px]">{`(${option?.tax_rate})`}</h2>
                                                </div>
                                            )}
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
                                            className="border-transparent placeholder:text-slate-300 w-full 2xl:text-[12px] xl:text-[13px] text-[12px] bg-[#ffffff] rounded text-[#52575E] mb-2 font-normal outline-none border"
                                        />
                                    </div>
                                    <div className="col-span-1 text-right flex items-center justify-end">
                                        <h3 className="px-2 2xl:text-[12px] xl:text-[13px] text-[12px]">
                                            {formatMoney(e?.money)}
                                        </h3>
                                    </div>
                                    <div className="col-span-1 flex items-center justify-center">
                                        <textarea
                                            value={e?.note}
                                            onChange={_HandleChangeInputOption.bind(this, e?.id, "note", index)}
                                            name="optionEmail"
                                            placeholder="Ghi chú"
                                            type="text"
                                            className="focus:border-[#92BFF7] border-[#d0d5dd] min-h-[40px] h-[40px] max-h-[80px] 2xl:text-[12px] xl:text-[13px] text-[12px]  placeholder:text-slate-300 w-full bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-1.5 border outline-none mb-2"
                                        />
                                    </div>
                                    <div className="col-span-1 flex items-center justify-center">
                                        <button
                                            onClick={_HandleDelete.bind(this, e?.id)}
                                            type="button"
                                            title="Xóa"
                                            className="transition  w-full bg-slate-100 h-10 rounded-[5.5px] text-red-500 flex flex-col justify-center items-center mb-2"
                                        >
                                            <IconDelete />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </Customscrollbar>
                        <div className="grid grid-cols-11 mb-1 font-normal bg-[#ecf0f475] p-1.5 items-center">
                            <div className="col-span-3  flex items-center gap-2">
                                <h2 className="2xl:text-[12px] xl:text-[13px] text-[12px]">
                                    {dataLang?.purchase_order_detail_discount || "purchase_order_detail_discount"}
                                </h2>
                                <div className="col-span-1 text-center flex items-center justify-center">
                                    <InPutNumericFormat
                                        isAllowed={isAllowedDiscount}
                                        value={discount}
                                        onValueChange={_HandleChangeInput.bind(this, "discount")}
                                        className=" text-center 2xl:text-[12px] xl:text-[13px] text-[12px] py-1 px-2 bg-transparent font-normal w-20 focus:outline-none border-b-2 border-gray-300"
                                    />
                                </div>
                            </div>
                            <div className="col-span-3 flex items-center">
                                <h2 className="w-[30%] 2xl:text-[12px] xl:text-[13px] text-[12px]">
                                    {dataLang?.purchase_order_detail_tax || "purchase_order_detail_tax"}
                                </h2>
                                <SelectCore
                                    closeMenuOnSelect={true}
                                    placeholder={dataLang?.serviceVoucher_tax || "serviceVoucher_tax"}
                                    options={taxOptions}
                                    isSearchable={true}
                                    onChange={_HandleChangeInput.bind(this, "tax")}
                                    LoadingIndicator
                                    noOptionsMessage={() => "Không có dữ liệu"}
                                    value={tax}
                                    maxMenuHeight="200px"
                                    isClearable={true}
                                    menuPortalTarget={document.body}
                                    formatOptionLabel={(option) => (
                                        <div className="flex justify-start items-center gap-1 ">
                                            <h2 className="2xl:text-[12px] xl:text-[13px] text-[12px]">
                                                {option?.label}
                                            </h2>
                                            <h2 className="2xl:text-[12px] xl:text-[13px] text-[12px]">{`(${option?.tax_rate})`}</h2>
                                        </div>
                                    )}
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
                                        control: (provided, state) => ({
                                            ...provided,
                                            minHeight: 30,
                                            maxHeight: 30,
                                        }),
                                    }}
                                    className=" text-[12px] border-transparent placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] font-normal outline-none border"
                                />
                            </div>
                        </div>
                        <h2 className="font-normal bg-[white] 2xl:text-[12px] xl:text-[13px] text-[12px]  p-1 border-b border-b-[#a9b5c5]  border-t border-t-[#a9b5c5]">
                            {dataLang?.purchase_order_table_total_outside || "purchase_order_table_total_outside"}{" "}
                        </h2>
                        <div className="grid grid-cols-5">
                            <div className="col-span-3">
                                <div className="text-[#344054] font-normal text-sm mb-1 ">
                                    {dataLang?.purchase_order_note || "purchase_order_note"}
                                </div>
                                <textarea
                                    value={note}
                                    placeholder={dataLang?.purchase_order_note || "purchase_order_note"}
                                    onChange={_HandleChangeInput.bind(this, "note")}
                                    name="fname"
                                    type="text"
                                    className="focus:border-[#92BFF7] 2xl:text-[12px] xl:text-[13px] text-[12px] border-[#d0d5dd] placeholder:text-slate-300 w-[60%] min-h-[120px] max-h-[150px] bg-[#ffffff] rounded-[5.5px] text-[#52575E] font-normal p-2 border outline-none "
                                />
                            </div>
                            <div className="text-right mt-2 space-y-1 col-span-2 flex-col justify-between ">
                                <div className="flex justify-between "></div>
                                <div className="flex justify-between ">
                                    <div className="font-normal 2xl:text-[14px] xl:text-[13px] text-[12.5px] ">
                                        <h3>{dataLang?.purchase_order_table_total || "purchase_order_table_total"}</h3>
                                    </div>
                                    <div className="font-normal 2xl:text-[14px] xl:text-[13px] text-[12.5px]">
                                        <h3 className="text-blue-600">{formatMoney(total.totalMoney)}</h3>
                                    </div>
                                </div>
                                <div className="flex justify-between ">
                                    <div className="font-normal 2xl:text-[14px] xl:text-[13px] text-[12.5px]">
                                        <h3>
                                            {dataLang?.purchase_order_detail_discounty ||
                                                "purchase_order_detail_discounty"}
                                        </h3>
                                    </div>
                                    <div className="font-normal 2xl:text-[14px] xl:text-[13px] text-[12.5px]">
                                        <h3 className="text-blue-600">{formatMoney(total.totalDiscount)}</h3>
                                    </div>
                                </div>
                                <div className="flex justify-between ">
                                    <div className="font-normal 2xl:text-[14px] xl:text-[13px] text-[12.5px]">
                                        <h3>
                                            {dataLang?.purchase_order_detail_money_after_discount || "purchase_order_detail_money_after_discount"}
                                        </h3>
                                    </div>
                                    <div className="font-normal 2xl:text-[14px] xl:text-[13px] text-[12.5px]">
                                        <h3 className="text-blue-600">{formatMoney(total.totalAffterDiscount)}</h3>
                                    </div>
                                </div>
                                <div className="flex justify-between ">
                                    <div className="font-normal 2xl:text-[14px] xl:text-[13px] text-[12.5px]">
                                        <h3>
                                            {dataLang?.purchase_order_detail_tax_money || "purchase_order_detail_tax_money"}
                                        </h3>
                                    </div>
                                    <div className="font-normal 2xl:text-[14px] xl:text-[13px] text-[12.5px]">
                                        <h3 className="text-blue-600">{formatMoney(total.totalTax)}</h3>
                                    </div>
                                </div>
                                <div className="flex justify-between ">
                                    <div className="font-normal 2xl:text-[14px] xl:text-[13px] text-[12.5px]">
                                        <h3>
                                            {dataLang?.purchase_order_detail_into_money || "purchase_order_detail_into_money"}
                                        </h3>
                                    </div>
                                    <div className="font-normal 2xl:text-[14px] xl:text-[13px] text-[12.5px]">
                                        <h3 className="text-blue-600">{formatMoney(total.totalAmountMoney)}</h3>
                                    </div>
                                </div>
                                <div className="space-x-2">
                                    <button
                                        type="button"
                                        onClick={_HandleCloseModal.bind(this)}
                                        className="button text-[#344054] font-normal 2xl:text-[12px] xl:text-[13px] text-[12px] py-2 px-4 rounded-[5.5px] border border-solid border-[#D0D5DD]"
                                    >
                                        {dataLang?.purchase_order_purchase_back || "purchase_order_purchase_back"}
                                    </button>
                                    <button
                                        onClick={_HandleSubmit.bind(this)}
                                        type="submit"
                                        className="button text-[#FFFFFF]  font-normal 2xl:text-[12px] xl:text-[13px] text-[12px] py-2 px-4 rounded-[5.5px] bg-[#003DA0]"
                                    >
                                        {dataLang?.purchase_order_purchase_save || "purchase_order_purchase_save"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </PopupCustom>
        </>
    );
};
export default PopupServieVoucher;
