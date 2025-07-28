import apiReceipts from "@/Api/apiAccountant/apiReceipts";
import EditIcon from "@/components/icons/common/EditIcon";
import PlusIcon from "@/components/icons/common/PlusIcon";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import InPutMoneyFormat from "@/components/UI/inputNumericFormat/inputMoneyFormat";
import MultiValue from "@/components/UI/mutiValue/multiValue";
import PopupCustom from "@/components/UI/popup";
import { optionsQuery } from "@/configs/optionsQuery";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import { WARNING_STATUS_ROLE } from "@/constants/warningStatus/warningStatus";
import { useBranchList } from "@/hooks/common/useBranch";
import { useObjectListPaySlipCombobox, useObjectPaySlipCombobox } from "@/hooks/common/useObject";
import { useVoucherListPayPaySlip, useVoucherPayTypePaySlip } from "@/hooks/common/useOther";
import { usePayment } from "@/hooks/common/usePayment";
import useSetingServer from "@/hooks/useConfigNumber";
import useActionRole from "@/hooks/useRole";
import useToast from "@/hooks/useToast";
import { formatMoment } from "@/utils/helpers/formatMoment";
import formatMoneyConfig from "@/utils/helpers/formatMoney";
import { CreatableSelectCore } from "@/utils/lib/CreatableSelect";
import { SelectCore } from "@/utils/lib/Select";
import { useMutation, useQuery } from "@tanstack/react-query";
import configSelectPopup from "configs/configSelectPopup";
import { debounce } from "lodash";
import moment from "moment/moment";
import { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BsCalendarEvent } from "react-icons/bs";
import { MdClear } from "react-icons/md";
import { useSelector } from "react-redux";
import { components } from "react-select";

const inistialFetch = {
    onSending: false,
    onFetchingLisObject: false,
};

const inistialError = {
    errBranch: false,
    errObject: false,
    errListObject: false,
    errPrice: false,
    errMethod: false,
    errListTypeDoc: false,
    errSotien: false,
};

const inistialValue = {
    date: new Date(),
    code: null,
    branch: null,
    object: null,
    listObject: null,
    typeOfDocument: null,
    listTypeOfDocument: [],
    adjustedDocuments: [],
    price: null,
    method: null,
    note: null,
    searchListTypeofDoc: ""
};

const Popup_dspt = (props) => {
    let id = props?.id;

    const dataLang = props.dataLang;

    const scrollAreaRef = useRef(null);
    const handleMenuOpen = () => {
        const menuPortalTarget = scrollAreaRef.current;
        return { menuPortalTarget };
    };

    const isShow = useToast();

    const dataSeting = useSetingServer();

    const [open, sOpen] = useState(false);

    const [error, sError] = useState(inistialError);

    const [fetch, sFetch] = useState(inistialFetch);

    const [listValue, sListValue] = useState(inistialValue);

    const [currentFloatValue, setCurrentFloatValue] = useState(0);

    // Thêm state để theo dõi quá trình tải dữ liệu chi tiết
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    const _ToggleModal = (e) => sOpen(e);

    const updateFetch = (update) => sFetch((e) => ({ ...e, ...update }));

    const updateListValue = (updates) => sListValue((e) => ({ ...e, ...updates }));

    const updateError = (update) => sError((e) => ({ ...e, ...update }));

    const { is_admin: role, permissions_current: auth } = useSelector((state) => state.auth);
    
    // Thêm authState để lấy thông tin chi nhánh
    const authState = useSelector((state) => state.auth);

    const { checkAdd, checkEdit } = useActionRole(auth, "receipts");

    const { data: dataMethod = [] } = usePayment()

    const { data: dataBranch = [] } = useBranchList()

    const { data: dataObject = [] } = useObjectPaySlipCombobox(dataLang)

    const { data: dataObjectList = [] } = useObjectListPaySlipCombobox({ type: listValue.object?.value, "filter[branch_id]": listValue.branch?.value }, dataLang)

    const { data: dataTypeofDoc = [] } = useVoucherPayTypePaySlip({ type: listValue.object?.value, branch: listValue.branch, typeOfDocument: listValue.typeOfDocument }, dataLang)
    const showToat = useToast();
    let param = {
        type: listValue.object?.value,
        voucher_type: listValue.typeOfDocument?.value,
        object_id: listValue.listObject?.value,
        "filter[branch_id]": listValue.branch?.value,
        expense_voucher_id: id ? id : "",
    };

    const { data: dataListTypeofDoc = [] } = useVoucherListPayPaySlip(param, listValue.searchListTypeofDoc)

    const initstialState = () => {
        // Không reset price và currentFloatValue khi khởi tạo lại form
        const currentPrice = listValue.price;
        const currentFloatVal = currentFloatValue;
        
        sListValue(inistialValue);
        sError(inistialError);
        
        // Khôi phục lại giá trị price và currentFloatValue
        if (currentPrice && currentFloatVal) {
            updateListValue({ price: currentPrice });
            setCurrentFloatValue(currentFloatVal);
        }
    };

    const formatNumber = (number) => {
        return formatMoneyConfig(+number, dataSeting);
    };

    useEffect(() => {
        if (open) {
            initstialState();
            
            if (props?.id) {
                // Đánh dấu đang tải chi tiết để ngăn việc tự động chọn chi nhánh đầu tiên
                setIsLoadingDetails(true);
            } else if (authState.branch?.length > 0) {
                // Chỉ tự động chọn chi nhánh đầu tiên khi tạo mới
                setTimeout(() => {
                    updateListValue({
                        branch: {
                            value: authState.branch[0].id,
                            label: authState.branch[0].name,
                        }
                    });
                }, 0);
            }
        }
    }, [open]);

    // Thêm useEffect riêng để xử lý trường hợp chi nhánh không được đặt sau khi mở popup
    useEffect(() => {
        if (open && !listValue.branch && !props?.id && !isLoadingDetails && authState.branch?.length > 0) {
            updateListValue({
                branch: {
                    value: authState.branch[0].id,
                    label: authState.branch[0].name,
                }
            });
        }
    }, [open, listValue.branch, authState.branch, isLoadingDetails]);

    // Thêm useEffect để cập nhật trạng thái sau khi tải xong chi tiết
    useEffect(() => {
        if (!fetch.onFetchingDetail && isLoadingDetails) {
            setIsLoadingDetails(false);
        }
    }, [fetch.onFetchingDetail]);

    useQuery({
        queryKey: ["api_detail_receipts_form", id],
        queryFn: async () => {
            const result = await apiReceipts.apiReceiptsDetail(id);
            console.log(result)
            updateListValue({
                date: moment(result?.date).toDate(),
                code: result?.code,
                branch: { label: result?.branch_name, value: result?.branch_id },
                object: { label: dataLang[result?.objects] || result?.objects, value: result?.objects },
                listObject: result?.objects === "other"
                    ? { label: result?.object_text, value: result?.object_text }
                    : { label: dataLang[result?.object_text] || result?.object_text, value: result?.objects_id },
                typeOfDocument: result?.type_vouchers ? { label: dataLang[result?.type_vouchers] || result?.type_vouchers, value: result?.type_vouchers } : null,
                listTypeOfDocument: result?.type_vouchers ? result?.voucher?.map(({ code, id, money, total }) => {
                    return {
                        label: code,
                        value: id,
                        money: money,
                        total: total || money, // Fallback to money if total is not available
                    };
                }) : [],
                price: +result?.total,
                method: { label: result?.payment_mode_name, value: result?.payment_mode_id },
                note: result?.note,
            });

            return result;
        },
        enabled: open && !!id,
        ...optionsQuery,
    })

    const _HandleSeachApi = debounce((inputValue) => {
        updateListValue({ searchListTypeofDoc: inputValue });
    }, 500);

    useEffect(() => {
        if (fetch.onSending) {
            _ServerSending();
        }
    }, [fetch.onSending,]);

    const _HandleChangeInput = (type, value) => {
        const totalMoney = listValue.listTypeOfDocument.reduce((total, item) => total + parseFloat(item.money), 0);

        let isExceedTotal = false;

        const valueType = {
            [type]: value,
            listObject: null,
            price: "",
            listTypeOfDocument: [],
            typeOfDocument: null,
            adjustedDocuments: [],
        };

        switch (type) {
            case "date":
                updateListValue({ date: value });
                break;
            case "code":
                updateListValue({ code: value?.target?.value });
                break;
            case "clear":
                updateListValue({ date: new Date() });
                break;
            case "branch":
                listValue[type] !== value && updateListValue(valueType);
                break;
            case "object":
                listValue[type] !== value && updateListValue(valueType);
                break;
            case "listObject":
                updateListValue({ listObject: value });
                listValue[type]?.value != value?.value && updateListValue({ listTypeOfDocument: [] });
                break;
            case "typeOfDocument":
                listValue[type]?.value != value?.value &&
                    updateListValue({
                        [type]: value,
                        listTypeOfDocument: [],
                        price: "",
                    });
                break;
            case "listTypeOfDocument":
                updateListValue({ listTypeOfDocument: value });
                if (value && value.length > 0) {
                    // Đảm bảo mỗi item đều có total
                    const processedDocuments = value.map(item => ({
                        ...item,
                        total: parseFloat(item.total || item.money || 0),
                        money: parseFloat(item.money || item.total || 0)
                    }));

                    const formattedTotal = parseFloat(
                        processedDocuments.reduce((total, item) => total + (item.total || item.money || 0), 0)
                    );

                    updateListValue({ 
                        listTypeOfDocument: processedDocuments,
                        price: formattedTotal 
                    });
                    
                    // Khởi tạo adjustedDocuments với giá trị total
                    const initialAdjustedDocs = processedDocuments.map(item => ({
                        ...item,
                        adjustedMoney: item.total || item.money,
                        total: item.total || item.money
                    }));

                    updateListValue({ 
                        adjustedDocuments: initialAdjustedDocs 
                    });
                } else {
                    updateListValue({ 
                        price: "", 
                        listTypeOfDocument: [],
                        adjustedDocuments: [] 
                    });
                }
                break;
            case "price":
                const priceChange = parseFloat(value?.target.value.replace(/,/g, ""));
                if (!isNaN(priceChange)) {
                    if (listValue.listTypeOfDocument.length > 0 && listValue.object?.value != "other" && priceChange > totalMoney) {
                        showToat("error", dataLang?.payment_err_aler || "payment_err_aler");
                        updateListValue({ price: totalMoney });
                        setCurrentFloatValue(totalMoney);
                        isExceedTotal = true;
                    } else {
                        updateListValue({ price: priceChange });
                        setCurrentFloatValue(priceChange);
                        
                        // Cập nhật tỷ lệ số tiền cho từng chứng từ khi tổng số tiền thay đổi
                        if (listValue.listTypeOfDocument?.length > 0) {
                            const originalTotal = listValue.listTypeOfDocument.reduce(
                                (total, item) => total + parseFloat(item.money || 0),
                                0
                            );
                            
                            if (originalTotal > 0 && priceChange > 0) {
                                const ratio = priceChange / originalTotal;
                                
                                // Tạo bản sao mới của listTypeOfDocument với số tiền đã điều chỉnh
                                const updatedListTypeOfDocument = listValue.listTypeOfDocument.map(item => ({
                                    ...item,
                                    adjustedMoney: parseFloat((parseFloat(item.money) * ratio).toFixed(2))
                                }));
                                
                                // Cập nhật state
                                updateListValue({ 
                                    adjustedDocuments: updatedListTypeOfDocument
                                });
                            }
                        }
                    }
                }
                break;
            case "method":
                updateListValue({ method: value });
                break;
            case "note":
                updateListValue({ note: value?.target.value });
                break;
            default:
                break;
        }
    };

    const _HandleSubmit = (e) => {
        e.preventDefault();
        if (
            !listValue.branch ||
            !listValue.object ||
            !listValue.listObject ||
            !listValue.price ||
            !listValue.method ||
            (listValue.typeOfDocument != null && listValue.listTypeOfDocument?.length == 0)
        ) {
            updateError({
                errBranch: !listValue.branch,
                errObject: !listValue.object,
                errMethod: !listValue.method,
                errListObject: !listValue.listObject,
                errPrice: listValue.typeOfDocument?.value == "import" && (listValue.price == 0 || listValue.price == "" || listValue.price == null)
                    ? true
                    : listValue.price == 0 || listValue.price == null || listValue.price == "",
                errListTypeDoc: listValue.typeOfDocument != null && listValue.listTypeOfDocument?.length == 0,
            });
            showToat("error", `${props.dataLang?.required_field_null || "required_field_null"}`);
        } else {
            // Không cập nhật lại price từ currentFloatValue vì có thể gây reset
            // updateListValue({ price: currentFloatValue });
            updateFetch({ onSending: true });
        }
    };

    useEffect(() => {
        listValue.branch && updateError({ errBranch: false });
        listValue.object && updateError({ errObject: false });
        listValue.listObject && updateError({ errListObject: false });
        listValue.price && updateError({ errPrice: false });
        listValue.method && updateError({ errMethod: false });
        if (listValue.typeOfDocument == null && listValue.listTypeOfDocument?.length > 0) {
            updateError({ errListTypeDoc: false });
        }
    }, [
        listValue.price != null,
        listValue.price != "",
        listValue.branch != null,
        listValue.object != null,
        listValue.typeOfDocument == null && listValue.listTypeOfDocument?.length > 0,
        listValue.listObject != null,
        listValue.method != null,
    ]);

    const handleSelectAll = () => {
        // Lấy toàn bộ danh sách từ dataListTypeofDoc
        const allDocuments = [...dataListTypeofDoc].map(doc => ({
            ...doc,
            total: parseFloat(doc.total || doc.money || 0), // Đảm bảo luôn có total
            money: parseFloat(doc.money || doc.total || 0)  // Đảm bảo luôn có money
        }));

        // Tính tổng tiền từ tất cả chứng từ
        const totalMoney = allDocuments.reduce((total, item) => {
            return total + (parseFloat(item.total) || 0);
        }, 0);

        // Cập nhật danh sách và số tiền
        updateListValue({
            listTypeOfDocument: allDocuments,
            price: totalMoney,
            // Khởi tạo adjustedDocuments với giá trị ban đầu từ total
            adjustedDocuments: allDocuments.map(item => ({
                ...item,
                adjustedMoney: item.total,
                total: item.total
            }))
        });
        
        // Cập nhật currentFloatValue
        setCurrentFloatValue(totalMoney);
    };

    const handleDeselectAll = () => {
        updateListValue({ 
            price: "", 
            listTypeOfDocument: [],
            adjustedDocuments: []
        });
        setCurrentFloatValue(0);
    };

    const MenuList = (props) => {
        return (
            <components.MenuList {...props}>
                {dataListTypeofDoc?.length > 0 && (
                    <div className="grid items-center grid-cols-2 cursor-pointer">
                        <div
                            className="col-span-1 p-2 text-xs text-center hover:bg-slate-200 "
                            onClick={handleSelectAll}
                        >
                            {dataLang?.payment_selectAll || "payment_selectAll"}
                        </div>
                        <div
                            className="col-span-1 p-2 text-xs text-center hover:bg-slate-200 "
                            onClick={handleDeselectAll}
                        >
                            {dataLang?.payment_DeselectAll || "payment_DeselectAll"}
                        </div>
                    </div>
                )}
                {props.children}
            </components.MenuList>
        );
    };

    const handingReceip = useMutation({
        mutationFn: async (data) => {
            return await apiReceipts.apiHandingReceipts(id, data);
        }
    })
console.log(currentFloatValue)
    const _ServerSending = () => {
        let formData = new FormData();

        formData.append("code", listValue.code ? listValue.code : "");
        formData.append("date", formatMoment(listValue.date, FORMAT_MOMENT.DATE_TIME_LONG));
        formData.append("branch_id", listValue.branch?.value);
        formData.append("objects", listValue.object?.value);
        formData.append("type_vouchers", listValue.typeOfDocument ? listValue.typeOfDocument?.value : "");
        // Sử dụng currentFloatValue thay vì listValue.price
        formData.append("total", currentFloatValue);
        formData.append("payment_modes", listValue.method?.value);

        if (listValue.object?.value == "other") {
            formData.append("objects_text", listValue.listObject?.value);
        } else {
            formData.append("objects_id", listValue.listObject?.value);
        }
        
        // Sử dụng adjustedDocuments nếu có, nếu không thì sử dụng listTypeOfDocument
        const documentsToSend = listValue.adjustedDocuments?.length > 0 ? listValue.adjustedDocuments : listValue.listTypeOfDocument;
        
        documentsToSend.forEach((e, index) => {
            formData.append(`voucher_id[${index}]`, e?.value);
            // Gửi thêm thông tin về số tiền đã điều chỉnh nếu có
            if (e.adjustedMoney !== undefined) {
                formData.append(`voucher_money[${index}]`, e.adjustedMoney);
            }
            // Thêm dòng này để gửi total
            // if (e.total !== undefined) {
            //     formData.append(`voucher_money[${index}]`, e.total);
            // }
        });
        
        formData.append("note", listValue.note ? listValue.note : "");

        handingReceip.mutate(formData, {
            onSuccess: ({ isSuccess, message }) => {
                if (isSuccess) {
                    isShow("success", `${dataLang[message] || message}`);
                    initstialState();
                    sError(inistialError);
                    props.onRefresh && props.onRefresh();
                    sOpen(false);
                    return
                }
                isShow("error", `${dataLang[message] || message}`);
            },
            onError: (err) => {
                console.error("Error submitting form:", err);
            }
        });
        updateFetch({ onSending: false });
    };

    return (
        <PopupCustom
            title={props.id ? `${props.dataLang?.receipts_edit || "receipts_edit"}` : `${props.dataLang?.receipts_add || "receipts_add"}`}
            button={
                props?.id ? (
                    <div
                        onClick={() => {
                            if (role || checkEdit) {
                                sOpen(true);
                            } else {
                                isShow("error", WARNING_STATUS_ROLE);
                            }
                        }}
                        className="group rounded-lg w-full p-1 border border-transparent transition-all ease-in-out flex items-center gap-2 responsive-text-sm text-left cursor-pointer hover:border-[#064E3B] hover:bg-[#064E3B]/10"
                    >
                        <EditIcon
                            color="#064E3B"
                            className="size-5"
                        />
                    </div>
                ) : (
                    <div
                        className="flex items-center p-1 gap-2 text-white rounded-md transition-all duration-300 cursor-pointer"
                    >
                        <PlusIcon className="w-4 h-4" />
                        <span className="font-medium">{props.dataLang?.branch_popup_create_new || "branch_popup_create_new"}</span>
                    </div>
                )
            }
            open={open}
            onClickOpen={() => {
                    if (role || checkAdd) {
                        sOpen(true);
                    } else {
                        isShow("error", WARNING_STATUS_ROLE);
                    }
            }}
            onClose={_ToggleModal.bind(this, false)}
            classNameBtn={props.className}
        >
            <div className="flex flex-col w-[60vw] gap-4">
                {/* Header section with styling */}
                <div className="border-b border-[#E7EAEE]">
                    <h2 className="mt-4 font-medium text-[#1A3353] bg-[#F1F5F9] px-3 py-2 rounded-md text-base mb-3">
                        {props.dataLang?.payment_general_information || "payment_general_information"}
                    </h2>
                </div>
                <form onSubmit={_HandleSubmit.bind(this)} className="space-y-4">
                    <Customscrollbar className="max-h-[70vh] overflow-auto pr-2 custom-scrollbar">
                        <div className="grid grid-cols-12 gap-4 mb-4">
                            <div className="col-span-4">
                                <label className="block text-[#344054] font-medium text-sm mb-1.5">
                                    {dataLang?.serviceVoucher_day_vouchers || "Ngày chứng từ"}
                                </label>
                                <div className="relative">
                                    <DatePicker
                                        blur
                                        fixedHeight
                                        showTimeSelect
                                        selected={listValue.date}
                                        onSelect={(date) => _HandleChangeInput("date", date)}
                                        onChange={(e) => _HandleChangeInput("date", e)}
                                        placeholderText="DD/MM/YYYY HH:mm:ss"
                                        dateFormat="dd/MM/yyyy h:mm:ss aa"
                                        timeInputLabel={"Time: "}
                                        placeholder={dataLang?.price_quote_system_default || "price_quote_system_default"}
                                        className="w-full text-sm px-3 py-2.5 bg-white border border-[#d0d5dd] rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#003DA0] focus:border-[#003DA0] transition-all duration-200"
                                    />
                                    {listValue.date && (
                                        <MdClear
                                            onClick={() => _HandleChangeInput("clear")}
                                            className="absolute right-9 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors"
                                        />
                                    )}
                                    <BsCalendarEvent className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                </div>
                            </div>

                            <div className="col-span-4">
                                <label className="block text-[#344054] font-medium text-sm mb-1.5">
                                    {dataLang?.serviceVoucher_voucher_code || "Mã chứng từ"}
                                </label>
                                <input
                                    value={listValue.code}
                                    onChange={_HandleChangeInput.bind(this, "code")}
                                    placeholder={props.dataLang?.payment_systemDefaul || "payment_systemDefaul"}
                                    type="text"
                                    className="w-full text-sm px-3 py-2.5 bg-white border border-[#d0d5dd] rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#003DA0] focus:border-[#003DA0] transition-all duration-200 placeholder:text-gray-400"
                                />
                            </div>

                            <div className="col-span-4">
                                <label className="block text-[#344054] font-medium text-sm mb-1.5">
                                    {props.dataLang?.payment_branch || "Chi nhánh"}{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <SelectCore
                                    closeMenuOnSelect={true}
                                    placeholder={props.dataLang?.payment_branch || "Chi nhánh"}
                                    options={dataBranch}
                                    isSearchable={true}
                                    onChange={_HandleChangeInput.bind(this, "branch")}
                                    value={listValue.branch}
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
                                            primary: "#003DA0",
                                        },
                                    })}
                                    styles={{
                                        control: (base, state) => ({
                                            ...base,
                                            minHeight: '42px',
                                            boxShadow: state.isFocused ? '0 0 0 1px #003DA0' : 'none',
                                            borderColor: error.errBranch ? '#f43f5e' : state.isFocused ? '#003DA0' : '#d0d5dd',
                                            '&:hover': {
                                                borderColor: state.isFocused ? '#003DA0' : '#64748b',
                                            },
                                        }),
                                        placeholder: (base) => ({
                                            ...base,
                                            color: '#94a3b8',
                                        }),
                                        menuPortal: (base) => ({
                                            ...base,
                                            zIndex: 9999,
                                        }),
                                        indicatorSeparator: () => null,
                                        clearIndicator: (base) => ({
                                            ...base,
                                            marginRight: '-6px',
                                        }),
                                    }}
                                    className="text-sm"
                                />
                                {error.errBranch && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {props.dataLang?.payment_errBranch || "Vui lòng chọn chi nhánh"}
                                    </p>
                                )}
                            </div>

                            <div className="col-span-4">
                                <label className="block text-[#344054] font-medium text-sm mb-1.5">
                                    {props.dataLang?.payment_method || "Phương thức"}{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <SelectCore
                                    placeholder={props.dataLang?.payment_method || "Phương thức"}
                                    options={dataMethod}
                                    onChange={_HandleChangeInput.bind(this, "method")}
                                    value={listValue.method}
                                    maxMenuHeight="200px"
                                    closeMenuOnSelect={true}
                                    {...configSelectPopup}
                                    className={`${error.errMethod ? "border-red-500" : "border-transparent"} placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] 2xl:text-[12px] xl:text-[13px] text-[12px]  font-normal outline-none border `}
                                />
                                {error.errMethod && (
                                    <label className="mb-2  2xl:text-[12px] xl:text-[13px] text-[12px] text-red-500">
                                        {props.dataLang?.payment_errMethod || "payment_errMethod"}
                                    </label>
                                )}
                            </div>

                            <div className="col-span-4">
                                <label className="block text-[#344054] font-medium text-sm mb-1.5">
                                    {props.dataLang?.payment_ob || "Đối tượng"}{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <SelectCore
                                    placeholder={props.dataLang?.payment_ob || "Đối tượng"}
                                    options={dataObject}
                                    onChange={_HandleChangeInput.bind(this, "object")}
                                    value={listValue.object}
                                    {...configSelectPopup}
                                    menuPortalTarget={document.body}
                                    onMenuOpen={handleMenuOpen}
                                    closeMenuOnSelect={true}
                                    className={`${error.errObject ? "border-red-500" : "border-transparent"} 2xl:text-[12px] xl:text-[13px] text-[12px] placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E]  font-normal outline-none border `}
                                />
                                {error.errObject && (
                                    <label className="mb-2  2xl:text-[12px] xl:text-[13px] text-[12px] text-red-500">
                                        {props.dataLang?.payment_errOb || "payment_errOb"}
                                    </label>
                                )}
                            </div>

                            <div className="col-span-4">
                                <label className="block text-[#344054] font-medium text-sm mb-1.5">
                                    {props.dataLang?.payment_listOb || "Danh sách đối tượng"}{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                {listValue.object?.value == "other" ? (
                                    <CreatableSelectCore
                                        options={dataObjectList}
                                        placeholder={props.dataLang?.payment_listOb || "Danh sách đối tượng"}
                                        onChange={_HandleChangeInput.bind(this, "listObject")}
                                        isClearable={true}
                                        value={listValue.listObject}
                                        classNamePrefix="Select"
                                        className={`${error.errListObject ? "border-red-500" : "border-transparent"} Select__custom removeDivide  placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] 2xl:text-[12px] xl:text-[13px] text-[12px] font-normal outline-none border `}
                                        isSearchable={true}
                                        noOptionsMessage={() => `Chưa có gợi ý`}
                                        formatCreateLabel={(value) => `Tạo "${value}"`}
                                        menuPortalTarget={document.body}
                                        onMenuOpen={handleMenuOpen}
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
                                                position: "absolute",
                                            }),
                                            control: (base, state) => ({
                                                ...base,
                                                boxShadow: "none",
                                                ...(state.isFocused && {
                                                    border: "0 0 0 1px #92BFF7",
                                                }),
                                            }),
                                            dropdownIndicator: (base) => ({
                                                ...base,
                                                display: "none",
                                            }),
                                        }}
                                    />
                                ) : (
                                    <SelectCore
                                        placeholder={props.dataLang?.payment_listOb || "Danh sách đối tượng"}
                                        options={dataObjectList}
                                        onChange={_HandleChangeInput.bind(this, "listObject")}
                                        value={listValue.listObject}
                                        {...configSelectPopup}
                                        menuPortalTarget={document.body}
                                        onMenuOpen={handleMenuOpen}
                                        closeMenuOnSelect={true}
                                        className={`${error.errListObject ? "border-red-500" : "border-transparent"} placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] 2xl:text-[12px] xl:text-[13px] text-[12px] font-normal outline-none border `}
                                    />
                                )}
                                {error.errListObject && (
                                    <label className="mb-2  2xl:text-[12px] xl:text-[13px] text-[12px] text-red-500">
                                        {props.dataLang?.payment_errListOb || "payment_errListOb"}
                                    </label>
                                )}
                            </div>

                            <div className="col-span-4">
                                <label className="block text-[#344054] font-medium text-sm mb-1.5">
                                    {props.dataLang?.payment_typeOfDocument || "Loại chứng từ"}
                                </label>
                                <SelectCore
                                    placeholder={props.dataLang?.payment_typeOfDocument || "Loại chứng từ"}
                                    options={dataTypeofDoc}
                                    onChange={_HandleChangeInput.bind(this, "typeOfDocument")}
                                    value={listValue.typeOfDocument}
                                    closeMenuOnSelect={true}
                                    {...configSelectPopup}
                                    menuPortalTarget={document.body}
                                    onMenuOpen={handleMenuOpen}
                                    className={`border-transparent placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E] 2xl:text-[12px] xl:text-[13px] text-[12px] font-normal outline-none border `}
                                />
                            </div>

                            <div className="col-span-4">
                                <label className="block text-[#344054] font-medium text-sm mb-1.5">
                                    {props.dataLang?.payment_listOfDoc || "Danh sách loại chứng từ"}
                                </label>

                                <SelectCore
                                    placeholder={props.dataLang?.payment_listOfDoc || "Danh sách loại chứng từ"}
                                    options={dataListTypeofDoc}
                                    closeMenuOnSelect={false}
                                    hideSelectedOptions={false}
                                    onInputChange={(event) => {
                                        _HandleSeachApi(event);
                                    }}
                                    onChange={_HandleChangeInput.bind(this, "listTypeOfDocument")}
                                    value={listValue.listTypeOfDocument}
                                    components={{ MenuList, MultiValue }}
                                    {...configSelectPopup}
                                    isMulti
                                    menuPortalTarget={document.body}
                                    onMenuOpen={handleMenuOpen}
                                    className={`${error.errListTypeDoc && listValue.typeOfDocument != null && listValue.listTypeOfDocument?.length == 0
                                        ? "border-red-500"
                                        : "border-transparent"
                                        } 2xl:text-[12px] xl:text-[13px] text-[12px] placeholder:text-slate-300 w-full bg-[#ffffff] rounded text-[#52575E]  font-normal outline-none border `}
                                />
                                {error.errListTypeDoc && listValue.typeOfDocument != null && listValue.listTypeOfDocument?.length == 0 && (
                                    <label className="2xl:text-[12px] xl:text-[13px] text-[12px] text-red-500">
                                        {props.dataLang?.payment_errlistOfDoc || "payment_errlistOfDoc"}
                                    </label>
                                )}
                            </div>

                            <div className="col-span-4">
                                <label className="block text-[#344054] font-medium text-sm mb-1.5">
                                    {props.dataLang?.payment_amountOfMoney || "Số tiền"}{" "}
                                    <span className="text-red-500">*</span>
                                </label>
                                <InPutMoneyFormat
                                    value={listValue.price}
                                    disabled={listValue.object === null || listValue.listObject === null}
                                    onChange={_HandleChangeInput.bind(this, "price")}
                                    allowNegative={false}
                                    placeholder={
                                        ((listValue.object == null || listValue.listObject == null) && (props.dataLang?.payment_errObList || "payment_errObList"))
                                        ||
                                        (listValue.object != null && props.dataLang?.payment_amountOfMoney)
                                        ||
                                        "Số tiền"
                                    }
                                    isAllowed={(values) => {
                                        if (!values.value) return true;
                                        const { floatValue } = values;
                                        if (listValue.object?.value && listValue.listTypeOfDocument?.length > 0) {
                                            if (listValue.object?.value != "other") {
                                                console.log(listValue.listTypeOfDocument)
                                                let totalMoney = listValue.listTypeOfDocument.reduce(
                                                    (total, item) => total + parseFloat(item.total || 0),
                                                    0
                                                );
                                                console.log(floatValue, totalMoney)
                                                if (floatValue > totalMoney) {
                                                    isShow("error", `${props.dataLang?.payment_errPlease || "payment_errPlease"} ${formatNumber(totalMoney)}`);
                                                    return false;
                                                }
                                            }
                                        }
                                        setCurrentFloatValue(floatValue);
                                        
                                        // Cập nhật tỷ lệ số tiền cho từng chứng từ khi tổng số tiền thay đổi
                                        if (listValue.listTypeOfDocument?.length > 0) {
                                            const originalTotal = listValue.listTypeOfDocument.reduce(
                                                (total, item) => total + parseFloat(item.money || 0),
                                                0
                                            );
                                            console.log(originalTotal)
                                            if (originalTotal > 0 && floatValue > 0) {
                                                const ratio = floatValue / originalTotal;
                                                
                                                // Tạo bản sao mới của listTypeOfDocument với số tiền đã điều chỉnh
                                                const updatedListTypeOfDocument = listValue.listTypeOfDocument.map(item => ({
                                                    ...item,
                                                    adjustedMoney: parseFloat((parseFloat(item.money) * ratio).toFixed(2))
                                                }));
                                                
                                                // Cập nhật state
                                                updateListValue({ 
                                                    adjustedDocuments: updatedListTypeOfDocument
                                                });
                                            }
                                        }
                                        
                                        return true;
                                    }}
                                    className={`${error.errPrice && (listValue.price == null || listValue.price == "")
                                        ? "border-red-500"
                                        : "focus:border-[#92BFF7] border-[#d0d5dd] placeholder:text-slate-300"
                                        } 3xl:placeholder:text-[13px] 2xl:placeholder:text-[12px] xl:placeholder:text-[10px] placeholder:text-[9px] placeholder:text-slate-300  w-full disabled:bg-slate-100 bg-[#ffffff] rounded text-[#52575E] 2xl:text-[12px] xl:text-[13px] text-[12px]  font-normal outline-none border p-[9.5px]`}
                                />
                                {error.errPrice && (
                                    <label className="2xl:text-[12px] xl:text-[13px] text-[12px] text-red-500">
                                        {props.dataLang?.payment_errAmount || "payment_errAmount"}
                                    </label>
                                )}
                            </div>

                            <div className="col-span-12">
                                <label className="block text-[#344054] font-medium text-sm mb-1.5">
                                    {props.dataLang?.payment_note || "Ghi chú"}
                                </label>
                                <input
                                    value={listValue.note}
                                    onChange={_HandleChangeInput.bind(this, "note")}
                                    placeholder={props.dataLang?.payment_note || "Ghi chú"}
                                    type="text"
                                    className="w-full text-sm px-3 py-2.5 bg-white border border-[#d0d5dd] rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#003DA0] focus:border-[#003DA0] transition-all duration-200 placeholder:text-gray-400"
                                />
                            </div>
                        </div>
                        <h2 className="font-normal bg-[#ECF0F4] p-1 2xl:text-[12px] xl:text-[13px] text-[12px]  w-full col-span-12 mt-0.5">
                            {props.dataLang?.receipts_info || "Thông tin chứng từ"}
                        </h2>
                        {listValue.listTypeOfDocument.length > 0 && (
                            <div className="col-span-12 mt-4">
                                <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
                                    <div className="grid grid-cols-12 bg-gray-50 border-b">
                                        <h3 className="col-span-2 p-2.5 text-xs font-medium text-gray-600 text-center">
                                            #
                                        </h3>
                                        <h3 className="col-span-5 p-2.5 text-xs font-medium text-gray-600 text-center border-l">
                                            {props.dataLang?.receipts_code || "Mã chứng từ"}
                                        </h3>
                                        <h3 className="col-span-5 p-2.5 text-xs font-medium text-gray-600 text-center border-l">
                                            {props.dataLang?.receipts_money || "Số tiền"}
                                        </h3>
                                    </div>
                                    <div className={`${listValue.listTypeOfDocument.length > 5 ? "max-h-[170px] overflow-y-auto" : ""}`}>
                                        {(listValue.adjustedDocuments?.length > 0 ? listValue.adjustedDocuments : listValue.listTypeOfDocument).map((e, index) => (
                                            <div key={e.value} className={`grid grid-cols-12 ${index !== listValue.listTypeOfDocument.length - 1 ? "border-b" : ""} hover:bg-gray-50`}>
                                                <div className="col-span-2 p-2 text-xs flex items-center justify-center">
                                                    <span className="px-2 py-1 text-purple-700 bg-purple-100 rounded-md font-medium">
                                                        {index + 1}
                                                    </span>
                                                </div>
                                                <div className="col-span-5 p-2 text-xs flex items-center justify-center border-l">
                                                    <span className="px-2 py-1 text-orange-700 bg-orange-100 rounded-md font-medium">
                                                        {e.label}
                                                    </span>
                                                </div>
                                                <div className="col-span-5 p-2 text-xs flex items-center justify-center border-l font-medium text-gray-700">
                                                    {formatNumber(e.adjustedMoney !== undefined ? e.adjustedMoney : (e.money))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Customscrollbar>
                    
                    <div className="border-t border-gray-200 pt-4 mt-2 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={_ToggleModal.bind(this, false)}
                            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium transition-colors duration-200"
                        >
                            {props.dataLang?.branch_popup_exit || "Hủy"}
                        </button>
                        
                        <button
                            type="submit"
                            className="px-4 py-2.5 bg-[#003DA0] hover:bg-[#0F4F9E] text-white rounded-md text-sm font-medium transition-colors duration-200"
                        >
                            {props.dataLang?.branch_popup_save || "Lưu"}
                        </button>
                    </div>
                </form>
            </div>
        </PopupCustom>
    );
};

export default Popup_dspt;
