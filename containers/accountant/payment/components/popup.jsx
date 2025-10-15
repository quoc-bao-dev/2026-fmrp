import apiPayments from "@/Api/apiAccountant/apiPayments";
import EditIcon from "@/components/icons/common/EditIcon";
import PlusIcon from "@/components/icons/common/PlusIcon";
import { Customscrollbar } from "@/components/UI/common/Customscrollbar";
import InPutMoneyFormat from "@/components/UI/inputNumericFormat/inputMoneyFormat";
import MultiValue from "@/components/UI/mutiValue/multiValue";
import PopupCustom from "@/components/UI/popup";
import PopupConfim from "@/components/UI/popupConfim/popupConfim";
import SelectOptionLever from "@/components/UI/selectOptionLever/selectOptionLever";
import { FORMAT_MOMENT } from "@/constants/formatDate/formatDate";
import { WARNING_STATUS_ROLE } from "@/constants/warningStatus/warningStatus";
import { useBranchList } from "@/hooks/common/useBranch";
import { useObjectCombobox, useObjectList } from "@/hooks/common/useObject";
import { useCostComboboxByBranch, useVoucherListVoucher, useVoucherPayTypeVoucher } from "@/hooks/common/useOther";
import { usePayment } from "@/hooks/common/usePayment";
import useActionRole from "@/hooks/useRole";
import useToast from "@/hooks/useToast";
import { formatMoment } from "@/utils/helpers/formatMoment";
import formatNumber from "@/utils/helpers/formatnumber";
import { CreatableSelectCore } from "@/utils/lib/CreatableSelect";
import { SelectCore } from "@/utils/lib/Select";
import { useMutation } from "@tanstack/react-query";
import { Add, Trash as IconDelete } from "iconsax-react";
import { debounce } from "lodash";
import moment from "moment/moment";
import { useEffect, useMemo, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BsCalendarEvent } from "react-icons/bs";
import { MdClear } from "react-icons/md";
import { useSelector } from "react-redux";
import { components } from "react-select";
import { v4 as uuidv4 } from "uuid";


const inistFetch = {
    onSending: false,
    onFetchingDetail: false,
    onFetchingTable: false,
};

const inistArrr = {
    dataTable: [],
};

const inistError = {
    errBranch: false,
    errObject: false,
    errListObject: false,
    errPrice: false,
    errMethod: false,
    errListTypeDoc: false,
    errSotien: false,
};

const Popup_dspc = (props) => {
    let id = props?.id;

    const dataLang = props.dataLang;

    const scrollAreaRef = useRef(null);

    const handleMenuOpen = () => {
        const menuPortalTarget = scrollAreaRef.current;
        return { menuPortalTarget };
    };

    const isShow = useToast();

    const { is_admin: role, permissions_current: auth } = useSelector((state) => state.auth);
    
    const authState = useSelector((state) => state.auth);

    const { checkAdd, checkEdit } = useActionRole(auth, "payment");

    const [open, sOpen] = useState(false);
    
    // Thêm lại hàm _ToggleModal đã bị xóa
    const _ToggleModal = (e) => sOpen(e);
    
    // Add new state for PopupConfim
    const [showBalanceConfirm, setShowBalanceConfirm] = useState(false);
    const [showAdjustConfirm, setShowAdjustConfirm] = useState(false);
    const [remainingAmount, setRemainingAmount] = useState(0);
    const [excessAmount, setExcessAmount] = useState(0);
    const [totalSotienErr, setTotalSotienErr] = useState(0);

    const [error, sError] = useState(inistError);

    const [data, sData] = useState(inistArrr);

    const [fetch, sFetch] = useState(inistFetch);

    const [date, sDate] = useState(new Date());

    const [code, sCode] = useState(null);

    const [branch, sBranch] = useState(null);

    const [object, sObject] = useState(null);

    const [listObject, sListObject] = useState(null);

    const [typeOfDocument, sTypeOfDocument] = useState(null);

    const [listTypeOfDocument, sListTypeOfDocument] = useState([]);

    const [searchListTypeofDoc, sSearchListTypeofDoc] = useState("");

    const [price, sPrice] = useState(null);

    const [method, sMethod] = useState(null);

    const [note, sNote] = useState("");

    const [option, sOption] = useState([
        {
            id: Date.now(),
            expense: "",
            price: null,
        },
    ]);

    // Sử dụng useMemo để tính toán sortedArr mỗi khi option thay đổi
    const sortedArr = useMemo(() => {
        // Trả về tất cả các chi phí, đảm bảo rằng các giá trị null được chuyển thành 0
        // để tránh trường hợp giá trị null khi hiển thị và tính toán
        return option.map(item => ({
            ...item,
            price: item.price === null || item.price === undefined || isNaN(item.price) ? 0 : item.price
        }));
    }, [option]);

    const { data: listPayment = [] } = usePayment()

    const { data: listBranch = [] } = useBranchList()

    const { data: objectCombobox = [] } = useObjectCombobox(dataLang)
    //Danh sách đối tượng
    //Api Danh sách đối tượng: truyền Đối tượng vào biến type, truyền Chi nhánh vào biến filter[branch_id]
    const { data: listObjectCombobox = [] } = useObjectList(dataLang, branch, object)
    // Loại chứng từ
    //Api Loại chứng từ: truyền Đối tượng vào biến type
    const { data: dataTypeofDoc = [] } = useVoucherPayTypeVoucher({ type: object?.value }, dataLang)

    //Danh sách chứng từ
    //Api Danh sách chứng từ: truyền Đối tượng vào biến type, truyền Loại chứng từ vào biến voucher_type, truyền Danh sách đối tượng vào object_id
    const params = {
        type: object?.value,
        voucher_type: typeOfDocument?.value,
        object_id: listObject?.value,
        "filter[branch_id]": branch?.value,
        expense_voucher_id: id ? id : "",
    }

    const { data: dataListTypeofDoc = [] } = useVoucherListVoucher(params, searchListTypeofDoc, open)

    //Loại chi phí
    const { data: dataListCost = [] } = useCostComboboxByBranch({ "filter[branch_id]": branch?.value })

    const initstialState = () => {
        sDate(new Date());
        sCode(null);
        sBranch(null);
        sObject(null);
        sListObject(null);
        sTypeOfDocument(null);
        sListTypeOfDocument([]);
        sPrice(null);
        sMethod(null);
        sNote("");
        sError(inistError);
        sOption([{ id: Date.now(), expense: "", price: 0 }]);
        sData(inistArrr);
        setCurrentFloatValue(0); // Reset currentFloatValue khi khởi tạo lại trạng thái
    };

    // Thêm state để theo dõi quá trình tải dữ liệu chi tiết
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    useEffect(() => {
        if (open) {
            initstialState();
            
            if (props?.id) {
                // Đánh dấu đang tải chi tiết để ngăn việc tự động chọn chi nhánh đầu tiên
                setIsLoadingDetails(true);
                sFetch((e) => ({ ...e, onFetchingDetail: true }));
            } else if (authState.branch?.length > 0) {
                // Chỉ tự động chọn chi nhánh đầu tiên khi tạo mới
                setTimeout(() => {
                    sBranch({
                        value: authState.branch[0].id,
                        label: authState.branch[0].name,
                    });
                }, 0);
            }
        }
    }, [open]);

    // Thêm useEffect riêng để xử lý trường hợp chi nhánh không được đặt sau khi mở popup
    useEffect(() => {
        if (open && !branch && !props?.id && !isLoadingDetails && authState.branch?.length > 0) {
            sBranch({
                value: authState.branch[0].id,
                label: authState.branch[0].name,
            });
        }
    }, [open, branch, authState.branch, isLoadingDetails]);

    // Thêm useEffect để cập nhật trạng thái sau khi tải xong chi tiết
    useEffect(() => {
        if (!fetch.onFetchingDetail && isLoadingDetails) {
            setIsLoadingDetails(false);
        }
    }, [fetch.onFetchingDetail]);

    const _ServerFetching_detail = async () => {
        try {
            const db = await apiPayments.apiDetailPayment(props?.id);
            sDate(moment(db?.date).toDate());
            sCode(db?.code);
            sBranch({ label: db?.branch_name, value: db?.branch_id });
            sMethod({
                label: db?.payment_mode_name,
                value: db?.payment_mode_id,
            });
            sObject({
                label: dataLang[db?.objects] || db?.objects,
                value: db?.objects,
            });
            const totalAmount = Number(db?.total);
            sPrice(totalAmount);
            setCurrentFloatValue(totalAmount); // Set currentFloatValue to match the total price
            sNote(db?.note);
            sListObject(
                db?.objects === "other"
                    ? { label: db?.object_text, value: db?.object_text }
                    : {
                        label: dataLang[db?.object_text] || db?.object_text,
                        value: db?.objects_id,
                    }
            );
            sTypeOfDocument(
                db?.type_vouchers
                    ? {
                        label: dataLang[db?.type_vouchers],
                        value: db?.type_vouchers,
                    }
                    : null
            );
            sListTypeOfDocument(
                db?.type_vouchers
                    ? db?.voucher?.map((e) => ({
                        label: e?.code,
                        value: e?.id,
                        money: e?.money,
                    }))
                    : []
            );
            sOption(
                db?.detail?.map((e) => ({
                    id: e?.id,
                    expense: {
                        label: e?.costs_name,
                        value: e?.id_costs,
                    },
                    price: Number(e?.total),
                }))
            );
            db?.type_vouchers == "import" && sData((e) => ({ ...e, dataTable: db?.tbDeductDeposit }));
            
        } catch (error) {
            isShow && isShow("error", "Có lỗi xảy ra khi tải dữ liệu chi tiết");
            console.error("Error fetching payment details:", error);
        } finally {
            sFetch((e) => ({ ...e, onFetchingDetail: false }));
            setIsLoadingDetails(false);
        }
    };

    useEffect(() => {
        if (fetch.onFetchingDetail && props?.id && open) {
            _ServerFetching_detail();
        }
    }, [fetch.onFetchingDetail, open]);

    useEffect(() => {
        typeOfDocument?.value == "import" && listTypeOfDocument && sFetch((e) => ({ ...e, onFetchingTable: true }));
    }, [listTypeOfDocument]);

    // useEffect này đã được thay thế bằng useEffect mới ở trên để xử lý việc gọi _ServerFetching_detail

    useEffect(() => {
        if (fetch.onFetchingTable) {
            _ServerFetching_ListTable();
        }
        if (fetch.onSending) {
            _ServerSending();
        }
    }, [
        fetch.onFetchingTable,
        fetch.onSending,
    ]);

    const _HandleSeachApi = debounce((inputValue) => {
        sSearchListTypeofDoc(inputValue);
    }, 500);

    const _ServerFetching_ListTable = async () => {
        let db = new FormData();

        listTypeOfDocument.forEach((e, index) => {
            db.append(`import_id[${index}]`, e?.value);
        });

        id && db.append("ignore_id", id ? id : "");

        try {
            const data = await apiPayments.apiDeductDeposit(db)
            sData((e) => ({
                ...e,
                dataTable: data,
            }));
            sFetch((e) => ({ ...e, onFetchingTable: false }));
        } catch (error) {

        }
    };
    const showToat = useToast();
    // Lưu trữ giá trị floatValue từ InPutMoneyFormat để sử dụng cho so sánh
    const [currentFloatValue, setCurrentFloatValue] = useState(0);
    
    // Đảm bảo currentFloatValue được cập nhật khi price thay đổi
    useEffect(() => {
        if (price !== null && price !== undefined && !isNaN(price)) {
            setCurrentFloatValue(Number(price));
        }
    }, [price]);
    
    // Theo dõi khi currentFloatValue thay đổi để cập nhật lại các chi phí
    useEffect(() => {
        if (currentFloatValue > 0 && option.length > 0) {
            // Phân bổ toàn bộ số tiền vào chi phí đầu tiên và reset các chi phí khác
            const newOptions = option.map((item, index) => {
                if (index === 0) {
                    return { ...item, price: currentFloatValue };
                } else {
                    return { ...item, price: 0 }; // Đặt giá trị là 0 thay vì null
                }
            });
            
            sOption(newOptions);
        }
    }, [currentFloatValue]);
    
    const _HandleChangeInput = (type, value) => {
        if (type == "date") {
            sDate(value);
        } else if (type == "code") {
            sCode(value?.target?.value);
        } else if (type === "clear") {
            sDate(new Date());
        } else if (type == "branch" && branch != value) {
            sBranch(value);
            sListObject(null);
            // Không reset giá trị price và currentFloatValue nếu đã có
            sListTypeOfDocument([]);
            sTypeOfDocument(null);
            // Giữ nguyên giá trị chi phí nếu đã có
            if (price === null || currentFloatValue === 0) {
                const updatedOptions = option.map((item) => {
                    return {
                        ...item,
                        expense: "",
                        price: 0,
                    };
                });
                sOption(updatedOptions);
            }
        } else if (type == "object" && object != value) {
            sObject(value);
            sListObject(null);
            sTypeOfDocument(null);
            sListTypeOfDocument([]);
            // Không reset giá trị price và currentFloatValue nếu đã có
            // Giữ nguyên giá trị chi phí nếu đã có
            if (price === null || currentFloatValue === 0) {
                sOption((prevOption) => {
                    const newOption = prevOption.map((item, index) => {
                        return { ...item, price: 0 };
                    });
                    return newOption;
                });
            }
        } else if (type == "listObject") {
            sListObject(value);
            // Reset danh sách chứng từ khi thay đổi danh sách đối tượng
            sListTypeOfDocument([]);
            
            // Reset số tiền về 0 khi thay đổi danh sách đối tượng
            sPrice(0);
            setCurrentFloatValue(0);
            
            // Reset tất cả chi phí về 0
            sOption(prevOption => {
                return prevOption.map(item => ({
                    ...item,
                    price: 0
                }));
            });
        } else if (type == "typeOfDocument" && typeOfDocument != value) {
            sTypeOfDocument(value);
            sListTypeOfDocument([]);
            // Không reset giá trị price và currentFloatValue nếu đã có
            // Giữ nguyên giá trị chi phí nếu đã có
            if (price === null || currentFloatValue === 0) {
                sOption((prevOption) => {
                    const newOption = prevOption.map((item, index) => {
                        return { ...item, price: 0 };
                    });
                    return newOption;
                });
            }
        } else if (type == "listTypeOfDocument") {
            sListTypeOfDocument(value);
            if (value && value.length > 0) {
                const totalMoney = value.reduce((total, item) => total + parseFloat(item.money || 0), 0);
                const formattedTotal = parseFloat(totalMoney);
                
                // Cập nhật đồng thời cả price và currentFloatValue
                sPrice(formattedTotal);
                setCurrentFloatValue(formattedTotal);
                
                // Cập nhật chi phí - chỉ giữ lại chi phí đầu tiên với giá trị mới
                if (option.length > 0) {
                    const firstOptionId = option[0].id;
                    const firstOptionExpense = option[0].expense;
                    
                    sOption(prevOptions => {
                        return [{
                            id: firstOptionId,
                            expense: firstOptionExpense,
                            price: formattedTotal
                        }];
                    });
                }
            } else if (value && value.length == 0) {
                // Không reset giá trị price và currentFloatValue nếu đã có
                if (price === null || currentFloatValue === 0) {
                    // Cập nhật chi phí - chỉ giữ lại chi phí đầu tiên với giá trị 0
                    if (option.length > 0) {
                        const firstOptionId = option[0].id;
                        const firstOptionExpense = option[0].expense;
                        
                        sOption(prevOptions => {
                            return [{
                                id: firstOptionId,
                                expense: firstOptionExpense,
                                price: 0
                            }];
                        });
                    }
                }
            }
        } else if (type === "price") {
            let totalMoney = listTypeOfDocument.reduce((total, item) => total + parseFloat(item.money || 0), 0);
            const priceChange = parseFloat(value?.target.value.replace(/,/g, ""));
            let isExceedTotal = false; // Biến flag để kiểm tra trạng thái vượt quá giá trị
            
            if (!isNaN(priceChange)) {
                if (listTypeOfDocument?.length > 0 && object?.value != "other") {
                    if (priceChange > totalMoney) {
                        // Giá nhập vượt quá tổng số tiền, trả về tổng ban đầu
                        showToat("error", `${dataLang?.payment_err_aler || "payment_err_aler"}`);
                        isExceedTotal = true; // Đánh dấu trạng thái vượt quá giá trị
                    }
                }
                
                // Cập nhật giá trị price - đảm bảo luôn cập nhật giá trị mới
                const newPriceValue = isExceedTotal ? totalMoney : priceChange;
                
                // Kiểm tra xem tổng tiền mới có nhỏ hơn tổng tiền hiện tại không
                const isTotalDecreased = currentFloatValue > 0 && newPriceValue < currentFloatValue;
                
                // Cập nhật cả price và currentFloatValue để đảm bảo nhất quán
                sPrice(newPriceValue);
                setCurrentFloatValue(newPriceValue);
                
                // Tính tổng chi phí hiện tại (trước khi cập nhật)
                const currentTotalExpenses = option.reduce((total, item) => {
                    return total + parseFloat(item.price || 0);
                }, 0);
                
                // Nếu đang giảm tổng tiền và tổng tiền mới nhỏ hơn tổng chi phí hiện tại
                if (isTotalDecreased && newPriceValue < currentTotalExpenses) {
                    showToat("error", `Tổng tiền giảm từ ${currentFloatValue.toLocaleString('en')} xuống ${newPriceValue.toLocaleString('en')}. Chi phí đầu tiên sẽ được giữ lại và các chi phí khác sẽ được đặt về 0.`, 4000);
                    
                    // Cập nhật chi phí - giữ chi phí đầu tiên với tổng tiền mới
                    // và đặt tất cả chi phí khác về 0 (không xóa chúng)
                    sOption(prevOptions => {
                        if (prevOptions.length <= 1) {
                            return [{
                                id: prevOptions[0].id,
                                expense: prevOptions[0].expense,
                                price: newPriceValue
                            }];
                        }
                        
                        // Cập nhật chi phí đầu tiên với tổng tiền mới
                        // và đặt tất cả chi phí khác về 0
                        return prevOptions.map((item, index) => {
                            if (index === 0) {
                                return {
                                    ...item,
                                    price: newPriceValue
                                };
                            } else {
                                return {
                                    ...item,
                                    price: 0
                                };
                            }
                        });
                    });
                } else if (option.length > 0 && (currentTotalExpenses === 0 || option[0].price === 0)) {
                    // Nếu chưa có chi phí nào hoặc chi phí đầu tiên là 0, cập nhật chi phí đầu tiên với giá trị mới
                    const firstOptionId = option[0].id;
                    const firstOptionExpense = option[0].expense;
                    
                    sOption(prevOptions => {
                        return [{
                            id: firstOptionId,
                            expense: firstOptionExpense,
                            price: newPriceValue
                        }];
                    });
                }
                // Nếu không thuộc các trường hợp trên, giữ nguyên chi phí hiện tại
            }
        } else if (type == "method") {
            sMethod(value);
        } else if (type == "note") {
            sNote(value?.target.value);
        }
    };

    const _HandleSubmit = (e) => {
        e.preventDefault();
        
        const hasNullLabel = option.some((item) => item.expense === "");
        const hasNullSotien = option.some((item) => item.price === "" || item.price === null || item.price === undefined);
        
        // Đảm bảo tính toán tổng chi phí một cách chính xác bằng cách parse mỗi giá trị thành số
        const totalSotienErr = option.reduce((total, item) => {
            const itemPrice = parseFloat(item.price || 0);
            return total + (isNaN(itemPrice) ? 0 : itemPrice);
        }, 0);
        setTotalSotienErr(totalSotienErr);
        
        // Cập nhật kiểm tra để yêu cầu tổng chi phí bằng đúng currentFloatValue (không lớn hơn hoặc nhỏ hơn)
        const isExpensesDifferent = Math.abs(totalSotienErr - currentFloatValue) > 0.01; // Cho phép sai số nhỏ
        
        if (branch == null || object == null || listObject == null || price == null || method == null || hasNullLabel || hasNullSotien || isExpensesDifferent || (typeOfDocument != null && listTypeOfDocument?.length == 0)) {
            sError((e) => ({
                ...e,
                errBranch: branch == null,
                errObject: object == null,
                errListObject: listObject == null,
                errPrice: typeOfDocument?.value == "import" && (price == 0 || price == null) ? true : price == 0 || price == null,
                errMethod: method == null,
                errCosts: hasNullLabel,
                errSotien: hasNullSotien || isExpensesDifferent, // Thêm lỗi khi tổng chi phí không bằng currentFloatValue
                errListTypeDoc: typeOfDocument != null && listTypeOfDocument?.length == 0,
            }));
            
            // Nếu lỗi duy nhất là tổng chi phí khác tổng tiền, hiển thị tùy chọn tự động cân bằng
            if (!hasNullLabel && !hasNullSotien && isExpensesDifferent && 
                branch != null && object != null && listObject != null && price != null && method != null && 
                !(typeOfDocument != null && listTypeOfDocument?.length == 0)) {
                
                if (totalSotienErr < currentFloatValue) {
                    const remainingAmount = currentFloatValue - totalSotienErr;
                    setRemainingAmount(remainingAmount);
                    
                    // isShow("error", `Tổng chi phí (${totalSotienErr.toLocaleString('en')}) phải bằng tổng số tiền (${currentFloatValue.toLocaleString('en')}). Còn ${remainingAmount.toLocaleString('en')} chưa được phân bổ.`, 3000);
                    
                    // Hiển thị PopupConfim thay vì window.confirm
                    setShowBalanceConfirm(true);
                    return;
                } else if (totalSotienErr > currentFloatValue) {
                    const excessAmount = totalSotienErr - currentFloatValue;
                    setExcessAmount(excessAmount);
                    
                    isShow("error", `Tổng chi phí (${totalSotienErr.toLocaleString('en')}) vượt quá tổng số tiền (${currentFloatValue.toLocaleString('en')}) ${excessAmount.toLocaleString('en')}. Vui lòng giảm bớt chi phí.`, 3000);
                    
                    // Hiển thị PopupConfim thay vì window.confirm
                    setShowAdjustConfirm(true);
                    return;
                }
            } else {
                isShow("error", props.dataLang?.required_field_null || "required_field_null");
            }
        } else {
            sFetch((e) => ({ ...e, onSending: true }));
        }
    };

    useEffect(() => {
        if (branch != null) {
            sError((e) => ({ ...e, errBranch: false }));
        }
        if (object != null) {
            sError((e) => ({ ...e, errObject: false }));
        }
        if (typeOfDocument == null && listTypeOfDocument?.length > 0) {
            sError((e) => ({ ...e, errListTypeDoc: false }));
        }
        if (listObject != null) {
            sError((e) => ({ ...e, errListObject: false }));
        }
        if (price != null) {
            sError((e) => ({ ...e, errPrice: false }));
        }
        if (method != null) {
            sError((e) => ({ ...e, errMethod: false }));
        }
    }, [price != null, branch != null, object != null, typeOfDocument == null && listTypeOfDocument?.length > 0, listObject != null, method != null,]);

    const _HandleChangeInputOption = (id, type, value) => {
        var index = option.findIndex((x) => x.id === id);
        if (type === "expense") {
            const hasSelectedOption = option.some((o) => o.expense === value);
            if (hasSelectedOption) {
                isShow("error", `${props?.dataLang?.payment_err_alerselected || "payment_err_alerselected"}`);
                return; // Dừng xử lý tiếp theo nếu đã hiển thị thông báo lỗi
            } else {
                option[index].expense = value;
            }
        } else if (type === "price") {
            // Parse giá trị mới nhập vào
            const newPrice = parseFloat(value?.value);
            
            // Bước 1: Kiểm tra nếu số tiền tổng là 0 hoặc không có
            if (currentFloatValue <= 0) {
                isShow("error", "Vui lòng nhập tổng số tiền trước khi phân bổ chi phí");
                return;
            }
            
            // Bước 2: Kiểm tra giá trị mới của chi phí đơn lẻ có vượt quá tổng không
            if (newPrice > currentFloatValue) {
                isShow("error", `Giá trị vượt quá tổng số tiền. Giá trị tối đa có thể nhập là ${currentFloatValue.toLocaleString("en")}`);
                
                // Tự động điều chỉnh về giá trị tối đa
                if (index === 0 && option.length === 1) {
                    // Nếu đây là chi phí duy nhất, đặt giá trị bằng tổng số tiền
                    option[index].price = currentFloatValue;
                    sOption([...option]);
                    return;
                }
            }
            
            // Bước 3: Tính tổng chi phí hiện tại của tất cả các chi phí khác
            const totalOtherExpenses = option.reduce((sum, opt, i) => {
                if (i !== index) {
                    return sum + parseFloat(opt.price || 0);
                }
                return sum;
            }, 0);
            
            // Bước 4: Tính số tiền còn lại có thể sử dụng
            const remainingBudget = currentFloatValue - totalOtherExpenses;
            
            // Bước 5: Kiểm tra xem giá trị mới có vượt quá số tiền còn lại không
            if (newPrice > remainingBudget) {
                // Hiển thị thông báo giá trị tối đa có thể nhập
                isShow("error", `Giá trị vượt quá số tiền còn lại. Giá trị tối đa có thể nhập là ${remainingBudget.toLocaleString("en")}`, 3000);
                
                // Tự động điều chỉnh về giá trị tối đa có thể nhập
                option[index].price = remainingBudget > 0 ? remainingBudget : 0;
                sOption([...option]);
                return;
            }
            
            // Nếu hợp lệ, cập nhật giá trị
            option[index].price = newPrice;
        }
        sOption([...option]);
    };

    const _AutoBalanceRemainingAmount = () => {
        if (currentFloatValue <= 0) {
            isShow("error", "Không có số tiền để phân bổ.");
            return;
        }
        
        // Tính tổng chi phí hiện tại
        const totalExpenses = option.reduce((total, item) => {
            return total + parseFloat(item.price || 0);
        }, 0);
        
        // Kiểm tra nếu đã sử dụng hết ngân sách
        if (totalExpenses >= currentFloatValue) {
            isShow("info", "Tổng chi phí đã bằng tổng số tiền. Không cần phân bổ thêm.", 3000);
            return;
        }
        
        // Tính số tiền còn lại cần phân bổ
        const remainingAmount = currentFloatValue - totalExpenses;
        
        // Tìm các chi phí chưa có giá trị (null hoặc 0)
        const emptyExpenses = option.filter(item => 
            (item.price === null || item.price === 0 || item.price === "") && 
            item.expense !== "" && 
            item.expense !== null
        );
        
        // Nếu không có chi phí nào chưa có giá trị nhưng có loại chi phí
        if (emptyExpenses.length === 0) {
            // Kiểm tra xem có chi phí nào đã có giá trị nhưng cũng có loại chi phí
            const validExpenses = option.filter(item => 
                item.price !== null && 
                item.price !== 0 && 
                item.expense !== "" && 
                item.expense !== null
            );
            
            if (validExpenses.length === 0) {
                isShow("error", "Không có chi phí hợp lệ để phân bổ. Vui lòng chọn loại chi phí trước.", 3000);
                return;
            }
            
            // Chia đều số tiền còn lại cho các chi phí đã có giá trị
            const amountPerExpense = remainingAmount / validExpenses.length;
            
            // Cập nhật giá trị cho các chi phí
            const updatedOptions = option.map(item => {
                if (item.expense !== "" && item.expense !== null && item.price !== null && item.price !== 0) {
                    return {
                        ...item,
                        price: parseFloat(item.price) + amountPerExpense
                    };
                }
                return item;
            });
            
            sOption(updatedOptions);
            isShow("success", `Đã phân bổ ${remainingAmount.toLocaleString("en")} vào ${validExpenses.length} chi phí hiện có.`, 3000);
        } else {
            // Nếu có chi phí chưa có giá trị và có loại chi phí, chia đều số tiền còn lại
            const amountPerExpense = remainingAmount / emptyExpenses.length;
            
            // Cập nhật giá trị cho các chi phí
            const updatedOptions = option.map(item => {
                if ((item.price === null || item.price === 0 || item.price === "") && item.expense !== "" && item.expense !== null) {
                    return {
                        ...item,
                        price: amountPerExpense
                    };
                }
                return item;
            });
            
            sOption(updatedOptions);
            isShow("success", `Đã phân bổ ${remainingAmount.toLocaleString("en")} vào ${emptyExpenses.length} chi phí chưa có giá trị.`, 3000);
        }
    };

    const _HandleAddNew = () => {
        // Kiểm tra tổng chi phí hiện tại
        const totalExpenses = option.reduce((total, item) => {
            return total + parseFloat(item.price || 0);
        }, 0);
        
        // Luôn đặt giá trị là 0 cho chi phí mới
        const newExpenseValue = 0;
        
        // Thêm mới luôn, không báo lỗi
        sOption([...option, { id: uuidv4(), expense: "", price: newExpenseValue }]);
    };

    const _HandleDelete = (id) => {
        if (id === option[0].id) {
            return isShow("error", `${props.dataLang?.payment_err_alerNotDelete || "payment_err_alerNotDelete"}`);
        }
        const newOption = option.filter((x) => x.id !== id); // loại bỏ phần tử cần xóa
        sOption(newOption); // cập nhật lại mảng
    };

    const handleSelectAll = () => {
        // Hiển thị thông báo nếu có nhiều chi phí sẽ bị xóa
        if (option.length > 1) {
            showToat("error", "Khi chọn tất cả chứng từ, chi phí đầu tiên sẽ nhận toàn bộ giá trị và các chi phí khác sẽ bị xóa.", 3000);
        }
        
        // Lấy tổng số tiền từ tất cả các chứng từ
        const totalMoney = dataListTypeofDoc.reduce((total, item) => {
            if (!isNaN(parseFloat(item.money))) {
                return total + parseFloat(item.money);
            } else {
                return total;
            }
        }, 0);
        
        // Cập nhật danh sách chứng từ
        sListTypeOfDocument(dataListTypeofDoc);
        
        // Cập nhật giá trị
        sPrice(totalMoney);
        setCurrentFloatValue(totalMoney);
        
        // Cập nhật chi phí - chỉ giữ lại chi phí đầu tiên với giá trị mới
        if (option.length > 0) {
            const firstOptionId = option[0].id;
            const firstOptionExpense = option[0].expense;
            
            sOption(prevOptions => {
                return [{
                    id: firstOptionId,
                    expense: firstOptionExpense,
                    price: totalMoney
                }];
            });
        }
    };

    const handleDeselectAll = () => {
        // Hiển thị thông báo nếu có nhiều chi phí sẽ bị xóa
        if (option.length > 1) {
            showToat("error", "Khi bỏ chọn tất cả chứng từ, tất cả chi phí sẽ được reset và chỉ giữ lại chi phí đầu tiên.", 3000);
        }
        
        // Cập nhật danh sách chứng từ
        sListTypeOfDocument([]);
        
        // Cập nhật giá trị
        sPrice(null);
        setCurrentFloatValue(0);
        
        // Cập nhật chi phí - chỉ giữ lại chi phí đầu tiên với giá trị rỗng
        if (option.length > 0) {
            const firstOptionId = option[0].id;
            const firstOptionExpense = option[0].expense;
            
            sOption(prevOptions => {
                return [{
                    id: firstOptionId,
                    expense: firstOptionExpense,
                    price: 0 // Đặt giá trị là 0 thay vì null
                }];
            });
        }
    };

    const MenuList = (props) => {
        return (
            <components.MenuList {...props}>
                {dataListTypeofDoc?.length > 0 && (
                    <div className="grid items-center grid-cols-2 cursor-pointer">
                        <div
                            onClick={handleSelectAll}
                            className="col-span-1 p-2 text-xs text-center hover:bg-slate-200 "
                        >
                            {dataLang?.payment_selectAll || "payment_selectAll"}
                        </div>
                        <div
                            onClick={handleDeselectAll}
                            className="col-span-1 p-2 text-xs text-center hover:bg-slate-200 "
                        >
                            {dataLang?.payment_DeselectAll || "payment_DeselectAll"}
                        </div>
                    </div>
                )}
                {props.children}
            </components.MenuList>
        );
    };

    const handingPayment = useMutation({
        mutationFn: async (data) => {
            return await apiPayments.apiHandingPayment(data, id)
        },
    })

    const _ServerSending = () => {
        let formData = new FormData();
        formData.append("code", code == null ? "" : code);
        formData.append("date", formatMoment(date, FORMAT_MOMENT.DATE_TIME_LONG));
        formData.append("branch_id", branch?.value);
        formData.append("objects", object?.value);
        formData.append("type_vouchers", typeOfDocument ? typeOfDocument?.value : "");
        formData.append("total", currentFloatValue); // Sử dụng currentFloatValue thay vì price
        formData.append("payment_modes", method?.value);
        if (object?.value == "other") {
            formData.append("objects_text", listObject?.value);
        } else {
            formData.append("objects_id", listObject?.value);
        }
        listTypeOfDocument?.forEach((e, index) => {
            formData.append(`voucher_id[${index}]`, e?.value);
        });
        formData.append("note", note);
        sortedArr.forEach((item, index) => {
            formData.append(`cost[${index}][id_costs]`, item?.expense ? item?.expense?.value : "");
            formData.append(`cost[${index}][total]`, item?.price ? item?.price : "");
        });

        handingPayment.mutate(formData, {
            onSuccess: ({ isSuccess, message }) => {
                if (isSuccess) {
                    isShow("success", `${dataLang[message]}`);
                    sDate(new Date());
                    sCode("");
                    sBranch(null);
                    sMethod(null);
                    sObject(null);
                    sListObject(null);
                    sTypeOfDocument(null);
                    sListTypeOfDocument([]);
                    sPrice("");
                    sNote("");
                    sError(inistError);
                    sOption([{ id: Date.now(), expense: "", price: null }]);
                    props.onRefresh && props.onRefresh();
                    sOpen(false);
                    sFetch((e) => ({ ...e, onSending: false }));
                    return
                }
                isShow("error", `${dataLang[message]}`);
            }
        })
    };

    return (
        <>
            <PopupCustom
                title={props.id ? `${props.dataLang?.payment_edit || "payment_edit"}` : `${props.dataLang?.payment_add || "payment_add"}`}
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
                            // onClick={() => {
                            //     if (role || checkAdd) {
                            //         sOpen(true);
                            //     } else {
                            //         isShow("error", WARNING_STATUS_ROLE);
                            //     }
                            // }}
                        >
                            <PlusIcon className="w-4 h-4" />
                            <span className="font-medium">{props.dataLang?.branch_popup_create_new || "branch_popup_create_new"}</span>
                        </div>
                    )
                }
                onClickOpen={() => {
                    if (role || checkAdd) {
                        sOpen(true);
                    } else {
                        isShow("error", WARNING_STATUS_ROLE);
                    }
                }}
                open={open}
                onClose={_ToggleModal.bind(this, false)}
                classNameBtn={props.className}
            >
                <div className="flex flex-col w-[60vw]">
                    {/* Header section with styling */}
                    <div className="border-b border-[#E7EAEE] mb-4">
                        <h2 className="mt-4 font-medium text-[#1A3353] bg-[#F1F5F9] px-3 py-2 rounded-md text-base mb-3">
                            {props.dataLang?.payment_general_information || "payment_general_information"}
                        </h2>
                    </div>
                    <form onSubmit={_HandleSubmit.bind(this)} className="space-y-4">
                        <Customscrollbar className="max-h-[70vh] overflow-auto pr-2 custom-scrollbar">
                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-4">
                                    <label className="block text-[#344054] font-medium text-sm mb-1.5">
                                        {dataLang?.serviceVoucher_day_vouchers || "Ngày chứng từ"}
                                    </label>
                                    <div className="relative">
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
                                            placeholder={dataLang?.price_quote_system_default || "price_quote_system_default"}
                                            className="w-full text-sm px-3 py-2.5 bg-white border border-[#d0d5dd] rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#003DA0] focus:border-[#003DA0] transition-all duration-200"
                                        />
                                        {date && (
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
                                        value={code}
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
                                        options={listBranch}
                                        isSearchable={true}
                                        onChange={_HandleChangeInput.bind(this, "branch")}
                                        value={branch}
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
                                        {props.dataLang?.payment_method || "Phương thức thanh toán"}{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <SelectCore
                                        closeMenuOnSelect={true}
                                        placeholder={props.dataLang?.payment_method || "Phương thức thanh toán"}
                                        options={listPayment}
                                        isSearchable={true}
                                        onChange={_HandleChangeInput.bind(this, "method")}
                                        value={method}
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
                                                borderColor: error.errMethod ? '#f43f5e' : state.isFocused ? '#003DA0' : '#d0d5dd',
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
                                    {error.errMethod && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {props.dataLang?.payment_errMethod || "Vui lòng chọn phương thức thanh toán"}
                                        </p>
                                    )}
                                </div>
                                
                                <div className="col-span-4">
                                    <label className="block text-[#344054] font-medium text-sm mb-1.5">
                                        {props.dataLang?.payment_ob || "Đối tượng"}{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <SelectCore
                                        closeMenuOnSelect={true}
                                        placeholder={props.dataLang?.payment_ob || "Đối tượng"}
                                        options={objectCombobox}
                                        isSearchable={true}
                                        onChange={_HandleChangeInput.bind(this, "object")}
                                        value={object}
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
                                                borderColor: error.errObject ? '#f43f5e' : state.isFocused ? '#003DA0' : '#d0d5dd',
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
                                    {error.errObject && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {props.dataLang?.payment_errOb || "Vui lòng chọn đối tượng"}
                                        </p>
                                    )}
                                </div>
                                
                                <div className="col-span-4">
                                    <label className="block text-[#344054] font-medium text-sm mb-1.5">
                                        {props.dataLang?.payment_listOb || "Danh sách đối tượng"}{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    {object?.value == "other" ? (
                                        <CreatableSelectCore
                                            options={listObjectCombobox}
                                            placeholder={props.dataLang?.payment_listOb || "Danh sách đối tượng"}
                                            onChange={_HandleChangeInput.bind(this, "listObject")}
                                            isClearable={true}
                                            value={listObject}
                                            classNamePrefix="Select"
                                            className="Select__custom removeDivide text-sm"
                                            isSearchable={true}
                                            noOptionsMessage={() => `Chưa có gợi ý`}
                                            formatCreateLabel={(value) => `Tạo "${value}"`}
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
                                                    borderColor: error.errListObject ? '#f43f5e' : state.isFocused ? '#003DA0' : '#d0d5dd',
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
                                                dropdownIndicator: (base) => ({
                                                    ...base,
                                                    display: "none",
                                                }),
                                                indicatorSeparator: () => null,
                                                clearIndicator: (base) => ({
                                                    ...base,
                                                    marginRight: '-6px',
                                                }),
                                            }}
                                        />
                                    ) : (
                                        <SelectCore
                                            closeMenuOnSelect={true}
                                            placeholder={props.dataLang?.payment_listOb || "Danh sách đối tượng"}
                                            options={listObjectCombobox}
                                            isSearchable={true}
                                            onChange={_HandleChangeInput.bind(this, "listObject")}
                                            value={listObject}
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
                                                    borderColor: error.errListObject ? '#f43f5e' : state.isFocused ? '#003DA0' : '#d0d5dd',
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
                                    )}
                                    {error.errListObject && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {props.dataLang?.payment_errListOb || "Vui lòng chọn danh sách đối tượng"}
                                        </p>
                                    )}
                                </div>
                                
                                <div className="col-span-4">
                                    <label className="block text-[#344054] font-medium text-sm mb-1.5">
                                        {props.dataLang?.payment_typeOfDocument || "Loại chứng từ"}
                                    </label>
                                    <SelectCore
                                        closeMenuOnSelect={true}
                                        placeholder={props.dataLang?.payment_typeOfDocument || "Loại chứng từ"}
                                        options={dataTypeofDoc}
                                        isSearchable={true}
                                        onChange={_HandleChangeInput.bind(this, "typeOfDocument")}
                                        value={typeOfDocument}
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
                                                borderColor: state.isFocused ? '#003DA0' : '#d0d5dd',
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
                                </div>
                                
                                <div className="col-span-4">
                                    <label className="block text-[#344054] font-medium text-sm mb-1.5">
                                        {props.dataLang?.payment_listOfDoc || "Danh sách chứng từ"}
                                    </label>
                                    <SelectCore
                                        closeMenuOnSelect={false}
                                        placeholder={props.dataLang?.payment_listOfDoc || "Danh sách chứng từ"}
                                        onInputChange={_HandleSeachApi.bind(this)}
                                        options={dataListTypeofDoc}
                                        isSearchable={true}
                                        onChange={_HandleChangeInput.bind(this, "listTypeOfDocument")}
                                        value={listTypeOfDocument}
                                        components={{ MenuList, MultiValue }}
                                        isMulti
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
                                                borderColor: error.errListTypeDoc && typeOfDocument != null && listTypeOfDocument?.length == 0 ? '#f43f5e' : state.isFocused ? '#003DA0' : '#d0d5dd',
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
                                            multiValue: (base) => ({
                                                ...base,
                                                backgroundColor: '#e0f2fe',
                                                borderRadius: '4px',
                                            }),
                                            multiValueLabel: (base) => ({
                                                ...base,
                                                color: '#0369a1',
                                                fontWeight: 500,
                                            }),
                                            multiValueRemove: (base) => ({
                                                ...base,
                                                color: '#0369a1',
                                                '&:hover': {
                                                    backgroundColor: '#0369a1',
                                                    color: '#fff',
                                                }
                                            }),
                                        }}
                                        className="text-sm"
                                    />
                                    {error.errListTypeDoc && typeOfDocument != null && listTypeOfDocument?.length == 0 && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {props.dataLang?.payment_errlistOfDoc || "Vui lòng chọn danh sách chứng từ"}
                                        </p>
                                    )}
                                </div>

                                <div className="col-span-4">
                                    <label className="block text-[#344054] font-medium text-sm mb-1.5">
                                        {props.dataLang?.payment_amountOfMoney || "Số tiền"}{" "}
                                        <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <InPutMoneyFormat
                                            value={price}
                                            onValueChange={(values) => {
                                                if (values.value) {
                                                    _HandleChangeInput("price", { target: { value: values.value } });
                                                }
                                            }}
                                            placeholder={((object == null || listObject == null) && (props.dataLang?.payment_errObList || "payment_errObList")) || (object != null && props.dataLang?.payment_amountOfMoney) || "payment_amountOfMoney"}
                                            isAllowed={(values) => {
                                                if (!values.value) return true;
                                                const { floatValue, formattedValue } = values;
                                                
                                                if (object?.value && listTypeOfDocument?.length > 0 && object?.value != "other") {
                                                    let totalMoney = listTypeOfDocument.reduce((total, item) => total + parseFloat(item.money || 0), 0);
                                                    if (floatValue > totalMoney) {
                                                        isShow("error", `${props.dataLang?.payment_errPlease || "payment_errPlease"} ${totalMoney.toLocaleString("en")}`);
                                                        return false;
                                                    }
                                                }
                                                
                                                setCurrentFloatValue(floatValue);
                                                return true;
                                            }}
                                            className={`w-full text-sm px-3 py-2.5 bg-white border ${error.errPrice && price == null ? "border-red-500" : "border-[#d0d5dd]"} rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#003DA0] focus:border-[#003DA0] transition-all duration-200 placeholder:text-gray-400`}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">đ</span>
                                    </div>
                                    {error.errPrice && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {props.dataLang?.payment_errAmount || "Vui lòng nhập số tiền"}
                                        </p>
                                    )}
                                </div>
                                
                                <div className="col-span-12">
                                    <label className="block text-[#344054] font-medium text-sm mb-1.5">
                                        {props.dataLang?.payment_note || "Ghi chú"}
                                    </label>
                                    <input
                                        value={note}
                                        onChange={_HandleChangeInput.bind(this, "note")}
                                        placeholder={props.dataLang?.payment_note || "Ghi chú"}
                                        type="text"
                                        className="w-full text-sm px-3 py-2.5 bg-white border border-[#d0d5dd] rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#003DA0] focus:border-[#003DA0] transition-all duration-200 placeholder:text-gray-400"
                                    />
                                </div>
                                {data.dataTable.length > 0 && (
                                    <div className="col-span-12 mt-3">
                                        <div className="bg-white border border-gray-200 rounded-md shadow-sm overflow-hidden">
                                            <div className="grid grid-cols-4 bg-gray-50 border-b">
                                                <h3 className="col-span-1 p-2.5 text-xs font-medium text-gray-600 text-center">
                                                    {props.dataLang?.payment_numberEnterd || "Mã nhập hàng"}
                                                </h3>
                                                <h3 className="col-span-1 p-2.5 text-xs font-medium text-gray-600 text-center border-l">
                                                    {props.dataLang?.payment_numberSlips || "Mã phiếu chi"}
                                                </h3>
                                                <h3 className="col-span-1 p-2.5 text-xs font-medium text-gray-600 text-center border-l">
                                                    {props.dataLang?.payment_deductionMoney || "Số tiền khấu trừ"}
                                                </h3>
                                                <h3 className="col-span-1 p-2.5 text-xs font-medium text-gray-600 text-center border-l">
                                                    {props.dataLang?.payment_cashInReturn || "Còn lại"}
                                                </h3>
                                            </div>
                                            <div className={`${data.dataTable.length > 5 ? "max-h-[170px] overflow-y-auto" : ""}`}>
                                                {data.dataTable.map((e, index) => (
                                                    <div key={index} className={`grid grid-cols-4 ${index !== data.dataTable.length - 1 ? "border-b" : ""} hover:bg-gray-50`}>
                                                        <div className="col-span-1 p-2 text-xs flex items-center justify-center">
                                                            <span className="px-2 py-1 text-purple-700 bg-purple-100 rounded-md font-medium">
                                                                {e.import_code}
                                                            </span>
                                                        </div>
                                                        <div className="col-span-1 p-2 text-xs flex items-center justify-center border-l">
                                                            <span className="px-2 py-1 text-orange-700 bg-orange-100 rounded-md font-medium">
                                                                {e.payslip_code}
                                                            </span>
                                                        </div>
                                                        <div className="col-span-1 p-2 text-xs flex items-center justify-center border-l font-medium text-gray-700">
                                                            {formatNumber(e.deposit_amount)}
                                                        </div>
                                                        <div className="col-span-1 p-2 text-xs flex items-center justify-center border-l font-medium text-gray-700">
                                                            {formatNumber(e.amount_left)}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Chi phí section */}
                                <div className="col-span-12 mt-6">
                                    <div className="border-t border-b border-[#E7EAEE] py-4 mb-4">
                                        <h2 className="font-medium text-[#1A3353] bg-[#F1F5F9] px-3 py-2 rounded-md text-base flex items-center">
                                            <span>{props.dataLang?.payment_costInfo || "Thông tin chi phí"}</span>
                                            <button
                                                type="button"
                                                onClick={_HandleAddNew}
                                                title="Thêm chi phí"
                                                className="ml-2 p-1 rounded-full bg-[#003DA0] hover:bg-[#0F4F9E] text-white flex items-center justify-center transition-colors duration-200"
                                            >
                                                <Add size={16} />
                                            </button>
                                        </h2>
                                    </div>
                                    
                                    <div className="grid grid-cols-12 bg-gray-50 rounded-t-md border border-b-0 border-gray-200">
                                        <div className="col-span-6 p-3 font-medium text-sm text-gray-700 flex items-center justify-center">
                                            {props.dataLang?.payment_costs || "Chi phí"}
                                        </div>
                                        <div className="col-span-4 p-3 font-medium text-sm text-gray-700 flex items-center justify-center">
                                            {props.dataLang?.payment_amountOfMoney || "Số tiền"}
                                        </div>
                                        <div className="col-span-2 p-3 font-medium text-sm text-gray-700 flex items-center justify-center">
                                            {props.dataLang?.payment_operation || "Thao tác"}
                                        </div>
                                    </div>
                                    
                                    <div className={`border border-t-0 border-gray-200 rounded-b-md overflow-hidden ${sortedArr.length > 4 ? "max-h-[230px] overflow-y-auto" : ""}`}>
                                        {sortedArr.map((e, index) => (
                                            <div key={e?.id} className={`grid grid-cols-12 gap-3 ${index !== sortedArr.length - 1 ? "border-b border-gray-200" : ""} p-3 hover:bg-gray-50`}>
                                                <div className="col-span-6">
                                                    <SelectCore
                                                        closeMenuOnSelect={true}
                                                        placeholder={props.dataLang?.payment_expense || "Chi phí"}
                                                        options={dataListCost}
                                                        isSearchable={true}
                                                        formatOptionLabel={SelectOptionLever}
                                                        onChange={_HandleChangeInputOption.bind(this, e?.id, "expense")}
                                                        value={e?.expense}
                                                        menuPlacement="top"
                                                        LoadingIndicator
                                                        noOptionsMessage={() => "Không có dữ liệu"}
                                                        maxMenuHeight="145px"
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
                                                                borderColor: error.errCosts && e?.expense === "" ? '#f43f5e' : state.isFocused ? '#003DA0' : '#d0d5dd',
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
                                                </div>
                                                <div className="col-span-4">
                                                    <div className="relative">
                                                        <InPutMoneyFormat
                                                            value={e?.price}
                                                            placeholder={price == null ? props.dataLang?.payment_errAmountAbove || "Vui lòng nhập số tiền trước" : ""}
                                                            onValueChange={_HandleChangeInputOption.bind(this, e?.id, "price")}
                                                            isAllowed={(values) => {
                                                                if (!values.value) return true;
                                                                const { floatValue } = values;
                                                                
                                                                if (currentFloatValue <= 0) {
                                                                    isShow("error", "Vui lòng nhập tổng số tiền trước khi phân bổ chi phí");
                                                                    return false;
                                                                }
                                                                
                                                                if (floatValue > currentFloatValue) {
                                                                    isShow("error", `Giá trị không được vượt quá tổng số tiền ${currentFloatValue.toLocaleString("en")}`);
                                                                    return false;
                                                                }
                                                                
                                                                const index = option.findIndex((x) => x.id === e?.id);
                                                                const totalOtherExpenses = option.reduce((sum, opt, i) => {
                                                                    if (i !== index) {
                                                                        return sum + parseFloat(opt.price || 0);
                                                                    }
                                                                    return sum;
                                                                }, 0);
                                                                
                                                                const remainingBudget = currentFloatValue - totalOtherExpenses;
                                                                
                                                                if (floatValue > remainingBudget) {
                                                                    isShow("error", `Giá trị tối đa có thể nhập là ${remainingBudget.toLocaleString("en")}`);
                                                                    return false;
                                                                }
                                                                
                                                                return true;
                                                            }}
                                                            className={`w-full text-sm px-3 py-2.5 bg-white border ${
                                                                error.errSotien && (e?.price === "" || e?.price === null) ? "border-red-500" : 
                                                                e?.price === null || e?.price === undefined || isNaN(e?.price) ? "border-orange-400" : 
                                                                "border-green-400"
                                                            } rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#003DA0] focus:border-[#003DA0] transition-all duration-200 placeholder:text-gray-400`}
                                                        />
                                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">đ</span>
                                                    </div>
                                                </div>
                                                <div className="col-span-2 flex items-center justify-center">
                                                    <button
                                                        onClick={_HandleDelete.bind(this, e?.id)}
                                                        type="button"
                                                        title="Xóa chi phí"
                                                        className={`w-10 h-10 rounded-md flex items-center justify-center ${
                                                            index === 0 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                                                        }`}
                                                        disabled={index === 0}
                                                    >
                                                        <IconDelete size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
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
            
            {/* PopupConfim for balance remaining amount */}
            <PopupConfim
                isOpen={showBalanceConfirm}
                onClose={() => setShowBalanceConfirm(false)}
                cancel={() => setShowBalanceConfirm(false)}
                save={() => {
                    setShowBalanceConfirm(false);
                    _AutoBalanceRemainingAmount();
                }}
                title="Phân bổ số tiền còn lại"
                subtitle={
                  <div>
                    <p>Tổng chi phí ({totalSotienErr.toLocaleString('en')}) chưa bằng tổng số tiền ({currentFloatValue.toLocaleString('en')}).</p>
                    <p>Bạn có muốn tự động phân bổ {remainingAmount.toLocaleString('en')} còn lại không?</p>
                  </div>
                }
                type="warning"
                nameModel="payment"
            />
            
            {/* PopupConfim for adjust expenses */}
            <PopupConfim
                isOpen={showAdjustConfirm}
                onClose={() => setShowAdjustConfirm(false)}
                cancel={() => setShowAdjustConfirm(false)}
                save={() => {
                    setShowAdjustConfirm(false);
                    // Tự động điều chỉnh chi phí để khớp với tổng số tiền
                    // Giữ tỷ lệ giữa các chi phí
                    const ratio = currentFloatValue / totalSotienErr;
                    const updatedOptions = option.map(item => {
                        if (item.expense !== "" && item.expense !== null && item.price !== null && item.price !== 0) {
                            return {
                                ...item,
                                price: parseFloat(item.price) * ratio
                            };
                        }
                        return item;
                    });
                    
                    sOption(updatedOptions);
                    isShow("success", `Đã điều chỉnh chi phí để khớp với tổng số tiền ${currentFloatValue.toLocaleString("en")}.`, 3000);
                }}
                title="Điều chỉnh chi phí"
                subtitle={
                  <div>
                    <p>Tổng chi phí ({totalSotienErr.toLocaleString('en')}) vượt quá tổng số tiền ({currentFloatValue.toLocaleString('en')}).</p>
                    <p>Bạn có muốn tự động điều chỉnh chi phí để khớp với tổng số tiền không?</p>
                  </div>
                }
                type="warning"
                nameModel="payment"
            />
        </>
    );
};

export default Popup_dspc;
