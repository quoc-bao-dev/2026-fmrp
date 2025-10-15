import PopupCustom from "@/components/UI/popup";
import { CONFIRM_DELETION, TITLE_DELETE } from "@/constants/delete/deleteTable";
import { WARNING_STATUS_ROLE } from "@/constants/warningStatus/warningStatus";
import Popup_dspc from "@/containers/accountant/payment/components/popup";
import Popup_dspt from "@/containers/accountant/receipts/components/popup";
import Popup_Bom from "@/containers/products/components/product/popupBom";
import Popup_Products from "@/containers/products/components/product/popupProducts";
import Popup_Stage from "@/containers/products/components/product/popupStage";
import PopupPrintTemNVL from "@/containers/purchase-order/import/components/PopupPrintTemNVL";
import Popup_TableValidateDelete from "@/containers/purchase-order/order/components/validateDelete";
import Popup_TableValidateEdit from "@/containers/purchase-order/order/components/validateEdit";
import Popup_servie from "@/containers/purchase-order/servicev-voucher/components/popup";
import PopupDetailKeepStock from "@/containers/sales-export-product/sales-order/components/PopupDetailKeepStock";
import PopupKeepStock from "@/containers/sales-export-product/sales-order/components/PopupKeepStock";
import useFeature from "@/hooks/useConfigFeature";
import useSetingServer from "@/hooks/useConfigNumber";
import useActionRole from "@/hooks/useRole";
import { useSetData } from "@/hooks/useSetData";
import useToast from "@/hooks/useToast";
import { useToggle } from "@/hooks/useToggle";
import {
    fetchPDFPurchaseOrder,
    fetchPDFPurchaseOrderImport,
} from "@/managers/api/purchase-order/useLinkFilePDF";
import { fetchPDFDelivery, fetchPDFSaleOrder, fetchPDFReceipts, fetchPDFPayments } from "@/managers/api/sales-order/useLinkFilePDF";
import apiReturnSales from "@/Api/apiSalesExportProduct/returnSales/apiReturnSales";
import apiServiceVoucher from "@/Api/apiPurchaseOrder/apiServicevVoucher";
import {
    routerImport,
    routerOrder,
    routerPurchases,
    routerReturns,
} from "@/routers/buyImportGoods";
import {
    routerExportToOther,
    routerInternalPlan,
    routerProductionWarehouse,
    routerProductsWarehouse,
    routerRecall,
    routerWarehouseTransfer,
} from "@/routers/manufacture";
import {
    routerDeliveryReceipt,
    routerPriceQuote,
    routerReturnSales,
    routerSalesOrder,
} from "@/routers/sellingGoods";
import { Box1, BoxSearch, Trash } from "iconsax-react";
import { useRouter } from "next/router";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Tooltip } from "react-tooltip";
import { _ServerInstance as Axios } from "services/axios";
import PopupPrintItem from "../common/popup/PopupPrintItem";
import EditIcon from "../icons/common/EditIcon";
import PrinterIcon from "../icons/common/PrinterIcon";
import PrinterTem from "../icons/common/PrinterTem";
import StickerIcon from "../icons/common/StickerIcon";
import TrashIcon from "../icons/common/TrashIcon";
import ButtonPrintItem from "./button/ButtonPrintItem";
import FilePDF from "./FilePDF";
import PopupConfim from "./popupConfim/popupConfim";

pdfMake.vfs = pdfFonts.pdfMake.vfs;

// Hàm xử lý in PDF cho phiếu trả hàng bán
const fetchPDFReturnSales = async ({ id }) => {
    try {
        // Sử dụng apiDetailReturnOrder từ apiReturnSales để lấy thông tin phiếu
        const response = await apiReturnSales.apiDetailReturnOrder(id);
        
        if (response && response.result === 1) {
            return {
                isSuccess: 1,
                pdf_url: `/api_web/Api_return_order/print/${id}`,
            };
        }
        return { isSuccess: 0, message: response?.message || "Không thể lấy thông tin phiếu" };
    } catch (error) {
        console.error("Error fetching return sales PDF:", error);
        return { isSuccess: 0, message: error.message || "Lỗi không xác định" };
    }
};

// Hàm xử lý in PDF cho phiếu dịch vụ
const fetchPDFServiceVoucher = async ({ id }) => {
    try {
        const response = await apiServiceVoucher.apiPrintServiceVoucher({
            data: {
                id: id,
            },
        });
        
        if (response && response.isSuccess === 1) {
            return {
                isSuccess: 1,
                pdf_url: response.pdf_url,
            };
        }
        return { isSuccess: 0, message: response?.message || "Không thể in phiếu dịch vụ" };
    } catch (error) {
        console.error("Error fetching service voucher PDF:", error);
        return { isSuccess: 0, message: error.message || "Lỗi không xác định" };
    }
};

const Popup_Pdf = (props) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoadingPrint, setIsLoadingPrint] = useState(false);
    const dropdownRef = useRef(null);

    //kiếm hàm theo page 
    const fetchPDFMultiplePageByPrice = {
        import: fetchPDFPurchaseOrderImport,
        deliveryReceipt: fetchPDFDelivery
    }

    //xử lý hàm in tem PDF
    const handlePrintTem = async ({ typePrint, id, typePage }) => {
        setIsLoadingPrint(true);
        const fetchPDFhandle = fetchPDFMultiplePageByPrice[typePage]
        if (!fetchPDFhandle) {
            console.warn(`Không tìm thấy hàm fetchPDFhandle cho typePage: ${typePage}`);
            setIsLoadingPrint(false);
            return;
        }

        const typeNumber = typePrint === "notPrice" ? 1 : 2;
        try {
            const response = await fetchPDFhandle({
                id: id,
                type: typeNumber,
            });
            if (response?.isSuccess === 1 && response?.pdf_url) {
                window.open(response.pdf_url, "_blank");
            }
            setIsLoadingPrint(false);
        } catch (error) {
            setIsLoadingPrint(false);
        }
    };

    const shareProps = {
        dataMaterialExpiry: props?.dataMaterialExpiry,
        dataProductExpiry: props?.dataProductExpiry,
        dataProductSerial: props?.dataProductSerial,
        dataSeting: props?.dataSeting,
    };
    
    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    // Xử lý mở/đóng dropdown
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };
    
    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="group transition-all duration-200 ease-in-out flex items-center gap-2 2xl:text-sm xl:text-sm text-[8px] text-left cursor-pointer rounded-lg p-1 border border-transparent hover:border-[#003DA0] hover:bg-primary-05 text-neutral-03 hover:text-neutral-07 font-normal whitespace-nowrap"
            >
                <PrinterIcon
                    color="#003DA0"
                    className="size-5"
                />
            </button>
            {isOpen && (
                <div className="absolute top-full -right-5 p-1 mt-1 w-fit bg-white rounded-xl z-[999] border border-gray-200 shadow-[0px_20px_40px_-4px_#919EAB3D,0px_0px_2px_0px_#919EAB3D]">
                    <div className="">
                        {props.props?.type === "import" || props.props?.type === "deliveryReceipt" ? (
                            <PopupPrintItem
                                dataLang={props.dataLang}
                                type={props.props?.type}
                                onCLick={(type) =>
                                    handlePrintTem({ typePrint: type, id: props.props?.id, typePage: props.props?.type })
                                }
                                isLoading={isLoadingPrint}
                            />
                        ) : (
                            <FilePDF
                                {...shareProps}
                                props={props.props}
                                openAction={props.openAction}
                                setOpenAction={props.setOpenAction}
                                dataLang={props.dataLang}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export const BtnAction = React.memo((props) => {
    const dispatch = useDispatch();
    const [loadingButtonPrint, setLoadingButtonPrint] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showMoreIcons, setShowMoreIcons] = useState(false);
    const [printDropdownOpen, setPrintDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const moreIconsRef = useRef(null);
    const printDropdownRef = useRef(null);

    // Hàm để mở/đóng dropdown in cho component này
    const togglePrintDropdown = () => {
        setPrintDropdownOpen(!printDropdownOpen);
    };

    // Đóng tất cả dropdown in
    const closeAllDropdowns = () => {
        setPrintDropdownOpen(false);
        setShowDropdown(false);
        setShowMoreIcons(false);
    };

    // Xử lý đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Kiểm tra xem event.target có thuộc về popup nào không
            const isInsidePopup = event.target.closest('.popup-edit') || 
                                event.target.closest('.popup-content') || 
                                event.target.closest('.reactjs-popup');
            
            // Chỉ đóng dropdown nếu click outside và không nằm trong bất kỳ popup nào
            if (!isInsidePopup) {
                if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                    setShowDropdown(false);
                }
                if (moreIconsRef.current && !moreIconsRef.current.contains(event.target)) {
                    setShowMoreIcons(false);
                }
                if (printDropdownRef.current && !printDropdownRef.current.contains(event.target)) {
                    setPrintDropdownOpen(false);
                }
            }
        };

        // Thêm event listener khi dropdown đang mở
        if (showDropdown || showMoreIcons || printDropdownOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        // Cleanup event listener
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showDropdown, showMoreIcons, printDropdownOpen]);

    //kiếm hàm fetchPDF theo page 
    const fetchPDFMultiplePage = {
        order: fetchPDFPurchaseOrder,
        sales_product: fetchPDFSaleOrder,
        receipts: fetchPDFReceipts,
        payment: fetchPDFPayments,
        import: fetchPDFPurchaseOrderImport,
        deliveryReceipt: fetchPDFDelivery,
        returnSales: fetchPDFReturnSales,
        returns: fetchPDFPurchaseOrder,
        servicev_voucher: fetchPDFServiceVoucher
    };
    
    //Xử lý in PDF
    const handlePrintTem = async ({ idTem, typePage, typePrint }) => {
        // Đảm bảo luôn lấy đúng ID từ tham số, hoặc từ props nếu không có
        const currentId = idTem || props?.id;
        
        setLoadingButtonPrint(true);
        
        try {
            let response;
            
            // Trường hợp in PDF với type (có giá/không giá) cho import và deliveryReceipt
            if (typePrint && ['import', 'deliveryReceipt'].includes(typePage)) {
                const typeNumber = typePrint === "notPrice" ? 1 : 2;
                response = await fetchPDFMultiplePage[typePage]({
                    id: currentId,
                    type: typeNumber,
                });
            } 
            // Xử lý đặc biệt cho phiếu trả hàng
            else if (typePage === 'returnSales') {
                response = await fetchPDFReturnSales({
                    id: currentId,
                });
            }
            // Trường hợp in PDF thông thường cho các loại khác
            else {
                // Kiểm tra nếu không có hàm tương ứng với typePage
                if (!fetchPDFMultiplePage[typePage]) {
                    console.warn(`Không tìm thấy API in cho typePage: ${typePage}`);
                    isShow("error", `Chức năng in phiếu ${typePage} chưa được hỗ trợ`);
                    setLoadingButtonPrint(false);
                    return;
                }
                
                response = await fetchPDFMultiplePage[typePage]({
                    id: currentId,
                });
            }
            
            if (response?.isSuccess === 1 && response?.pdf_url) {
                window.open(response.pdf_url, "_blank");
            } else {
                isShow("error", response?.message || `Không thể in phiếu. Vui lòng thử lại sau.`);
            }
            setLoadingButtonPrint(false);
        } catch (error) {
            isShow("error", `Lỗi khi in phiếu: ${error.message || "Không xác định"}`);
            setLoadingButtonPrint(false);
        }
    };


    const router = useRouter();

    const isShow = useToast();

    const { isOpen, handleQueryId } = useToggle();

    const { isData, updateData } = useSetData();

    const [isOpenValidate, sIsOpenValidate] = useState(false);

    const [openAction, setOpenAction] = useState(false);

    const _ToggleModal = (e) => setOpenAction(e);

    const { dataMaterialExpiry, dataProductExpiry, dataProductSerial } =
        useFeature();

    const dataSeting = useSetingServer();

    const { is_admin: role, permissions_current: auth } = useSelector(
        (state) => state.auth
    );

    const { checkDelete, checkEdit } = useActionRole(auth, props?.type);

    const confimDelete = (url) => {
        Axios("DELETE", url, {}, (err, response) => {
            if (!err) {
                if (response && response.data) {
                    let { isSuccess, message, ...res } = response.data;
                    // này là do không đồng bộ cấu trúc api của be nên phải if thêp type
                    const modelOther = ["category_errors", "category_detail_errors"];

                    if (
                        isSuccess ||
                        (modelOther.includes(props.type) && res?.result == 1)
                    ) {
                        isShow("success", props.dataLang[message] || message);

                        props.onRefresh && props.onRefresh();

                        const checkType = [
                            "returnSales",
                            "purchases",
                            "servicev_voucher",
                            "returns",
                            "warehouseTransfer",
                            "production_warehouse",
                            "productsWarehouse",
                            "recall",
                            "exportToOther",
                            "client_customers",
                            "suppliers",
                            "warehouse",
                        ];

                        checkType.includes(props.type) &&
                            ((props.onRefreshGroup && props.onRefreshGroup()) ||
                                (props.onRefreshGr && props.onRefreshGr()));
                    } else {
                        if (modelOther.includes(props.type)) {
                            isShow("error", props.dataLang[message.error] || message.error);
                        } else {
                            isShow("error", props.dataLang[message] || message);
                        }
                    }
                } else {
                    isShow(
                        "error",
                        `${props?.dataLang?.aler_delete_fail || "aler_delete_fail"}`
                    );
                }
            }
        });
    };

    const handleDelete = () => {
        //Báo giá
        const initialApiDelete = {
            category_detail_errors: `api_web/Api_category_error/deleteDetailError/${props.id}?csrf_protection=true`,
            category_errors: `api_web/Api_category_error/deleteCategoryError/${props.id}?csrf_protection=true`,
            settings_variant: `/api_web/Api_variation/variation/${props.id}?csrf_protection=true`,
            units: `/api_web/Api_unit/unit/${props.id}?csrf_protection=true`,
            stages: `/api_web/api_product/stage/${props.id}?csrf_protection=true`,
            costs: `/api_web/Api_cost/cost/${props.id}?csrf_protection=true`,
            paymentmodes: `/api_web/Api_payment_method/payment_method/${props.id}?csrf_protection=true`,
            currencies: `/api_web/Api_currency/currency/${props.id}?csrf_protection=true`,
            taxes: `/api_web/Api_tax/tax/${props.id}?csrf_protection=true`,
            settings_branch: `/api_web/Api_Branch/branch/${props.id}?csrf_protection=true`,
            warehouse_location: `/api_web/api_warehouse/location/${props.id}?csrf_protection=true`,
            warehouse: `/api_web/api_warehouse/warehouse/${props.id}?csrf_protection=true`,
            personnel_roles: `/api_web/api_staff/position/${props.id}?csrf_protection=true`,
            department: `/api_web/api_staff/department/${props.id}?csrf_protection=true`,
            personnel_staff: `/api_web/api_staff/staff/${props.id}?csrf_protection=true`,
            products: `/api_web/api_product/product/${props.id}?csrf_protection=true`,
            category_products: `/api_web/api_product/category/${props.id}?csrf_protection=true`,
            materials: `/api_web/api_material/material/${props.id}?csrf_protection=true`,
            material_category: `/api_web/api_material/category/${props.id}?csrf_protection=true`,
            suppliers_groups: `/api_web/api_supplier/group/${props.id}?csrf_protection=true`,
            suppliers: `/api_web/api_supplier/supplier/${props.id}?csrf_protection=true`,
            client_customers: `/api_web/api_client/client/${props.id}?csrf_protection=true`,
            client_status: `/api_web/api_client/status/${props.id}?csrf_protection=true`,
            client_group: `/api_web/Api_client/group/${props.id}?csrf_protection=true`,
            price_quote: `/api_web/Api_quotation/quotation/${props.id}?csrf_protection=true`,
            sales_product: `/api_web/Api_sale_order/saleOrder/${props.id}?csrf_protection=true`,
            deliveryReceipt: `/api_web/api_delivery/delete/${props.id}?csrf_protection=true`,
            returnSales: `/api_web/Api_return_order/return_order/${props.id}?csrf_protection=true`,
            internal_plan: `/api_web/api_internal_plan/deleteInternalPlan/${props.id}?csrf_protection=true`,
            purchases: `/api_web/Api_purchases/purchases/${props.id}?csrf_protection=true`,
            order: `/api_web/Api_purchase_order/purchase_order/${props.id}?csrf_protection=true`,
            servicev_voucher: `/api_web/Api_service/service/${props.id}?csrf_protection=true`,
            import: `/api_web/Api_import/import/${props.id}?csrf_protection=true`,
            returns: `/api_web/Api_return_supplier/returnSupplier/${props.id}?csrf_protection=true`,
            warehouseTransfer: `/api_web/Api_transfer/transfer/${props.id}?csrf_protection=true`,
            production_warehouse: `/api_web/Api_stock/exportProduction/${props.id}?csrf_protection=true`,
            productsWarehouse: `/api_web/Api_product_receipt/productReceipt/${props.id}?csrf_protection=true`,
            recall: `/api_web/Api_material_recall/materialRecall/${props.id}?csrf_protection=true`,
            exportToOther: `/api_web/Api_export_other/exportOther/${props.id}?csrf_protection=true`,
            receipts: `/api_web/Api_expense_payslips/expenseCoupon/${props.id}?csrf_protection=true`,
            payment: `/api_web/Api_expense_voucher/expenseVoucher/${props.id}?csrf_protection=true`,
            check_quality: `/api_web/Api_Qc/delete/${props.id}`,
        };
        ///báo giá

        const typeConfig = initialApiDelete[props.type];

        if (props?.id && props?.type === "price_quote") {
            if (props?.status !== "ordered") {
                confimDelete(typeConfig);
            }
            if (props?.status === "ordered") {
                isShow(
                    "error",
                    `${props?.dataLang?.po_imported_cant_delete ||
                    "po_imported_cant_delete"
                    }`
                );
            }
        }
        ///Đơn hàng bán
        else if (props?.id && props?.type === "sales_product") {

            if (props?.status !== "approved") {
                confimDelete(typeConfig);
            }
            if (props?.status === "approved") {
                isShow(
                    "error",
                    `${props?.dataLang?.sales_product_cant_delete ||
                    "sales_product_cant_delete"
                    } `
                );
            }
        }
        // kế hoạch nội bộ
        else if (props?.id && props?.type === "internal_plan") {
            if (props?.status !== "1") {
                confimDelete(typeConfig);
            } else {
                isShow(
                    "error",
                    `Kế hoạch nội bộ đã được duyệt, không thể xóa. Vui lòng bỏ duyệt để xóa`
                );
            }
        } else {
            confimDelete(typeConfig);
        }

        handleQueryId({ status: false });
    };

    const handleClick = () => {
        const typeModel = {
            //trả lại hàng bán
            returnSales: routerReturnSales.form,
            ///Phiếu giao hàng
            deliveryReceipt: routerDeliveryReceipt.form,
            ///Xuất kho sản xuất
            production_warehouse: routerProductionWarehouse.form,
            // nhập kho thành phẩm
            productsWarehouse: routerProductsWarehouse.form,
            // Thu hồi NVL
            recall: routerRecall.form,
            //xuát kho khác
            exportToOther: routerExportToOther.form,
            // chuyển kho
            warehouseTransfer: routerWarehouseTransfer.form,
            // trả hàng
            returns: routerReturns.form,
            ///Kế hoạc nội bộ
            internal_plan: routerInternalPlan.form,
            // nhập hàng
            import: routerImport.form,
            ///Đơn đặt hàng PO
            order: routerOrder.form,
            ///Yêu cầu mua hàng
            purchases: routerPurchases.form,
            //báo giá
            price_quote: routerPriceQuote.form,
            //đơn hàng bán
            sales_product: routerSalesOrder.form,
            // kiểm tra chất lượng
            // check_quality: '#'
        };

        const handleQueryPage = () =>
            router.push(`${typeModel[props.type]}?id=${props.id}`);

        //Báo giá
        if (!!props?.id && props?.type === "price_quote") {
            if (props?.status === "ordered") {
                isShow(
                    "error",
                    `${props?.dataLang?.po_imported_cant_edit || "po_imported_cant_edit"}`
                );
            } else if (props?.status === "confirmed") {
                isShow(
                    "error",
                    `${props?.dataLang?.po_imported_cant_edit_with_confirm ||
                    "po_imported_cant_edit_with_confirm"
                    }`
                );
            } else {
                handleQueryPage();
            }
        }
        ///Đơn hàng bán
        if (!!props?.id && props?.type === "sales_product") {
            if (props?.status === "approved") {
                isShow(
                    "error",
                    `${props?.dataLang?.sales_product_cant_edit ||
                    "sales_product_cant_edit"
                    }`
                );
                return;
            }
            handleQueryPage();
        }
        ///Yêu cầu mua hàng
        if (!!props?.id && props?.type === "purchases") {
            if (props?.order?.status != "purchase_ordered") {
                isShow("error", `${props.dataLang?.purchases_ordered_cant_edit}`);
            } else if (props?.status === "1") {
                isShow("error", `${props.dataLang?.confirmed_cant_edit}`);
            } else {
                handleQueryPage();
            }
        }
        ///Đơn đặt hàng PO
        if (!!props?.id && props?.type === "order") {
            if (props?.status_pay != "not_spent" || props?.status != "not_stocked") {
                isShow(
                    "error",
                    `${(props?.status_pay != "not_spent" &&
                        "Đơn hàng mua đã có phiếu Nhập. Không thể sửa") ||
                    // isShow("error", `${(props?.status_pay != "not_spent" && (props.dataLang?.paid_cant_edit || "paid_cant_edit"))
                    (props?.status != "not_stocked" &&
                        "Đơn hàng mua đã có phiếu Nhập. Không thể sửa")
                    }`
                );
                return;
            }
            handleQueryPage();
        }
        //Nhập hàng
        if (!!props?.id && props?.type === "import") {
            if (props?.warehouseman_id != "0" || props?.status_pay != "not_spent") {
                isShow(
                    "error",
                    `${(props?.warehouseman_id != "0" &&
                        props.dataLang?.warehouse_confirmed_cant_edit) ||
                    (props?.status_pay != "not_spent" &&
                        (props.dataLang?.paid_cant_edit || "paid_cant_edit"))
                    }`
                );
                return;
            }
            handleQueryPage();
        }
        // kế hoạch nội bộ
        if (!!props?.id && props?.type === "internal_plan") {
            if (props?.status == "1") {
                isShow("error", `Kế hoạch nội bộ đã được duyệt. Không thể sửa`);
                return;
            }
            handleQueryPage();
        }

        const checkType = [
            "production_warehouse",
            "productsWarehouse",
            "recall",
            "exportToOther",
            "warehouseTransfer",
            "returns",
            "deliveryReceipt",
            "returnSales",
            "servicev_voucher",
        ];

        if (!!props?.id && checkType.includes(props.type)) {
            if (
                !!props?.type === "servicev_voucher" &&
                !!props?.status_pay != "not_spent"
            ) {
                isShow("error", `${"Phiếu dịch vụ đã chi. Không thể sửa"}`);
                return;
            }
            if (props?.referenceNoDetail) {
                isShow("error", `${"Phiếu đã có lệnh sản xuất. Không thể sửa"}`);
                return;
            }
            if (props?.warehouseman_id && props?.warehouseman_id != "0") {
                isShow(
                    "error",
                    `${props?.warehouseman_id != "0" &&
                    props.dataLang?.warehouse_confirmed_cant_edit
                    }`
                );
                return;
            } else {
                handleQueryPage();
            }
        }
    };

    const _ServerFetching_ValidatePayment = () => {
        Axios(
            "GET",
            `/api_web/Api_purchase_order/paymentStatus/${props?.id}?csrf_protection=true`,
            {},
            (err, response) => {
                if (!err) {
                    let db = response.data;
                    updateData(db);
                }
            }
        );
    };

    useEffect(() => {
        props.type == "order" && openAction && _ServerFetching_ValidatePayment();
    }, [openAction]);

    const shareProps = {
        dataMaterialExpiry,
        dataProductExpiry,
        dataProductSerial,
        dataSeting,
    };

    const calculateTotalButtons = () => {
        let count = 0;
        
        // Trường hợp đặc biệt cho products
        if (props.type === "products") {
            return 5; // 3 nút đặc biệt (Stage, Bom, Products) + FilePDF + Delete
        }
        
        // Count edit button
        count++;

        // Count print button
        if (!["deliveryReceipt", "returnSales", "import", "returns", "receipts", "payment"].includes(props?.type)) {
            if (props?.type === "order" || props?.type === "sales_product") {
                count++;
            } else {
                count++;
            }
        }

        // Count keep stock and see stock buttons for sales_product
        if (props.type === "sales_product") {
            count += 2;
        }

        // Count print tem button for import
        if (props.type === "import") {
            count++;
        }

        // Count delete button
        count++;

        return count;
    };

    const renderActionButtons = () => {
        if ([
            "client_customers",
            "client_status",
            "client_group",
            "suppliers",
            "suppliers_groups",
            "material_category",
            "materials",
            "category_products",
            "personnel_staff",
            "department",
            "personnel_roles",
            "warehouse",
            "warehouse_location",
            "settings_branch",
            "taxes",
            "currencies",
            "paymentmodes",
            "units",
            "stages",
            "costs",
            "settings_variant",
            "category_errors",
            "category_detail_errors",
            "check_quality",
        ].includes(props?.type)) {
            return (
                <button
                    type="button"
                    onClick={() => handleQueryId({ id: props?.id, status: true })}
                    className="group hover:border-red-01 hover:bg-red-02 rounded-lg w-full p-1 border border-transparent transition-all ease-in-out flex items-center gap-2 responsive-text-sm text-left cursor-pointer"
                >
                    <TrashIcon className="size-5 text-[#EE1E1E]"/>
                </button>
            );
        }

        const allButtons = [];
        const totalButtons = calculateTotalButtons();

        // Nút sửa - Edit
        if (props.type == "order") {
            allButtons.push(
                <Popup_TableValidateEdit
                    key="edit"
                    {...props}
                    {...shareProps}
                    isOpenValidate={isOpenValidate}
                    sIsOpenValidate={sIsOpenValidate}
                    data={isData}
                    className="2xl:text-sm xl:text-sm text-[8px] hover:bg-slate-50 text-left cursor-pointer rounded py-2.5"
                />
            );
        } else if (props.type == "servicev_voucher") {
            allButtons.push(
                <div key="edit" className="group transition-all ease-in-out flex items-center gap-2 2xl:text-sm xl:text-sm text-[8px] hover:bg-slate-50 text-left cursor-pointer rounded w-full">
                    {/* <EditIcon
                        color="#064E3B"
                        className="size-5 group-hover:text-sky-500 group-hover:shadow-md flex-shrink-0"
                    /> */}
                    <Popup_servie
                        status_pay={props?.status_pay}
                        onRefreshGr={props.onRefreshGr}
                        onClick={() => handleClick()}
                        onRefresh={props.onRefresh}
                        dataLang={props.dataLang}
                        id={props?.id}
                        {...shareProps}
                        className="2xl:text-sm xl:text-sm text-[8px] hover:bg-slate-50 text-left cursor-pointer rounded py-2.5"
                    >
                        {props.dataLang?.purchase_order_table_edit || "purchase_order_table_edit"}
                    </Popup_servie>
                </div>
            );
        } else if (props.type == "products") {
            allButtons.push(
                <Popup_Stage
                    key="stage"
                    dataLang={props.dataLang}
                    id={props.id}
                    name={props?.name}
                    code={props?.code}
                    type={props?.typeOpen}
                    dataProduct={props?.dataProduct}
                    onRefresh={props.onRefresh}
                    className="text-sm hover:bg-slate-50 text-left cursor-pointer whitespace-nowrap w-full"
                />
            );
            allButtons.push(
                <Popup_Bom
                    key="bom"
                    dataLang={props.dataLang}
                    id={props.id}
                    name={props?.name}
                    code={props?.code}
                    onRefresh={props.onRefresh}
                    type={props?.typeOpen}
                    dataProduct={props?.dataProduct}
                    bom={props?.bom}
                    className="text-sm hover:bg-slate-50 text-left cursor-pointer whitespace-nowrap w-full"
                />
            );
            allButtons.push(
                <Popup_Products
                    key="products"
                    onRefresh={props.onRefresh}
                    dataProductExpiry={props.dataProductExpiry}
                    dataLang={props.dataLang}
                    id={props?.id}
                    dataProduct={props?.dataProduct}
                    type={props?.typeOpen}
                    className="text-sm hover:bg-slate-50 text-left cursor-pointer whitespace-nowrap w-full"
                />
            );
        } else if (props.type == "receipts") {
            allButtons.push(
                <Popup_dspt
                    key="receipts"
                    onRefresh={props.onRefresh}
                    dataLang={props.dataLang}
                    id={props?.id}
                    className="text-sm hover:bg-slate-50 text-left cursor-pointer"
                >
                    {props.dataLang?.purchase_order_table_edit || "purchase_order_table_edit"}
                </Popup_dspt>
            );
        } else if (props.type == "payment") {
            allButtons.push(
                <Popup_dspc
                    key="payment"
                    onRefresh={props.onRefresh}
                    dataLang={props.dataLang}
                    id={props?.id}
                    className="text-sm hover:bg-slate-50 text-left cursor-pointer"
                >
                    {props.dataLang?.purchase_order_table_edit || "purchase_order_table_edit"}
                </Popup_dspc>
            );
        } else if (![
            "order",
            "products",
            "servicev_voucher",
            "receipts",
            "payment",
        ].includes(props.type)) {
            const totalButtons = calculateTotalButtons();

            allButtons.push(
                <button
                    key="edit"
                    onClick={() => {
                        if (role) {
                            handleClick();
                        } else if (checkEdit) {
                            handleClick();
                        } else {
                            isShow("error", WARNING_STATUS_ROLE);
                        }
                    }}
                    className={`group rounded-lg w-full p-1 border border-transparent transition-all ease-in-out flex items-center gap-2 responsive-text-sm text-left cursor-pointer
                                ${totalButtons > 3
                            ? 'hover:bg-primary-05'
                            : 'hover:border-[#064E3B] hover:bg-[#064E3B]/10'
                        }`
                    }
                >
                    <EditIcon
                        className={`size-5 transition-all duration-300 
                            ${totalButtons > 3 ? "text-neutral-03 group-hover:text-neutral-07" : ""}`}
                    />
                    {totalButtons > 3 && (
                        <p className="text-neutral-03 group-hover:text-neutral-07 font-normal whitespace-nowrap">Sửa phiếu</p>
                    )}
                </button>
            );
        }

        // Nút in - Print PDF 
        if ([
            "deliveryReceipt",
            "returnSales",
            "import",
            "returns",
            // "receipts",
            // "payment",
        ].includes(props?.type)) {
            if (props?.type !== "import") {
                allButtons.push(
                    <Popup_Pdf
                        dataLang={props.dataLang}
                        props={props}
                        openAction={openAction}
                        setOpenAction={setOpenAction}
                        {...shareProps}
                    />
                );
            }
        } else if (props?.type === "order" || props?.type === "sales_product" || props?.type === "receipts" || props?.type === "payment" || props?.type === "servicev_voucher") {
            const totalButtons = calculateTotalButtons();
            allButtons.push(
                <ButtonPrintItem
                    key="print"
                    onCLick={() =>
                        handlePrintTem({ idTem: props?.id, typePage: props?.type })
                    }
                    dataLang={props?.dataLang}
                    isLoading={loadingButtonPrint}
                    totalButtons={totalButtons}
                />
            );
        } else {
            allButtons.push(
                <FilePDF
                    key="pdf"
                    {...shareProps}
                    props={props}
                    openAction={openAction}
                    setOpenAction={setOpenAction}
                />
            );
        }

        // Nút giữ hàng - Keep Stock (chỉ cho sales_product)
        if (props.type == "sales_product") {
            if (role == true || auth?.orders?.is_create == 1 || auth?.orders?.is_edit == 1) {
                allButtons.push(<PopupKeepStock key="keep-stock" {...props} {...shareProps} totalButtons={totalButtons} />);
            } else {
                allButtons.push(
                    <button
                        key="keep-stock"
                        onClick={() => isShow("error", WARNING_STATUS_ROLE)}
                        type="button"
                        className={`${props.type == "sales_product" ? "" : "justify-center"} group transition-all ease-in-out flex items-center gap-2 2xl:text-sm xl:text-sm text-[8px] hover:bg-slate-50 text-left cursor-pointer`}
                    >
                        <Box1
                            size={20}
                            className="group-hover:text-orange-500 group-hover:shadow-md"
                        />
                        <p className="pr-4 group-hover:text-orange-500">
                            {props.dataLang?.salesOrder_keep_stock || "salesOrder_keep_stock"}
                        </p>
                    </button>
                );
            }
        }

        // Nút xem tồn kho - See Stock (chỉ cho sales_product)
        if (props.type == "sales_product") {
            if (role == true || auth?.orders?.is_create == 1 || auth?.orders?.is_edit == 1) {
                allButtons.push(<PopupDetailKeepStock key="detail-stock" {...props} {...shareProps} totalButtons={totalButtons} />);
            } else {
                allButtons.push(
                    <button
                        key="detail-stock"
                        type="button"
                        onClick={() => isShow("error", WARNING_STATUS_ROLE)}
                        className="group transition-all ease-in-out flex items-center justify-center gap-2 2xl:text-sm xl:text-sm text-[8px] hover:bg-slate-50 text-left cursor-pointer"
                    >
                        <BoxSearch
                            size={20}
                            className="group-hover:text-amber-500 group-hover:shadow-md"
                        />
                        <p className="group-hover:text-amber-500 pr-2.5">
                            {props.dataLang?.salesOrder_see_stock_keeping || "salesOrder_see_stock_keeping"}
                        </p>
                    </button>
                );
            }
        }

        // Nút in tem (chỉ cho import)
        if (props.type == "import") {
            // Lưu ID của phần tử hiện tại để đảm bảo sử dụng đúng ID khi xử lý các thao tác
            const currentId = props?.id;
            
            allButtons.push(
                <div key={`print-tem-${currentId}`} className="relative" ref={printDropdownRef}>
                    <button
                        onClick={togglePrintDropdown}
                        className="group transition-all duration-200 ease-in-out flex items-center gap-2 2xl:text-sm xl:text-sm text-[8px] text-left cursor-pointer rounded-lg p-1 border border-transparent hover:border-[#003DA0] hover:bg-primary-05 text-neutral-03 hover:text-neutral-07 font-normal whitespace-nowrap"
                        data-id={currentId} /* Store the ID as a data attribute */
                    >
                        <PrinterIcon
                            color="#003DA0"
                            className="size-5"
                        />
                    </button>
                    {printDropdownOpen && (
                        <div className="absolute top-full -right-5 p-1 mt-1 w-fit bg-white rounded-xl z-[999] border border-gray-200 shadow-[0px_20px_40px_-4px_#919EAB3D,0px_0px_2px_0px_#919EAB3D]">
                            <ul className="flex flex-col gap-1" data-row-id={currentId}>
                                <li
                                    onClick={() => {
                                        dispatch({
                                            type: "statePopupGlobal",
                                            payload: {
                                                open: true,
                                                children: (
                                                    <PopupPrintTemNVL
                                                        id={currentId}
                                                    />
                                                ),
                                            },
                                        });
                                        setPrintDropdownOpen(false);
                                    }}
                                    className="group transition-all duration-200 ease-in-out flex items-center gap-2 2xl:text-sm xl:text-sm text-[8px] text-left cursor-pointer px-1.5 py-2 rounded-lg hover:bg-primary-05 text-neutral-03 hover:text-neutral-07 font-normal whitespace-nowrap"
                                >
                                    <StickerIcon className="size-5" />
                                    <p>In tem</p>
                                </li>
                                <li
                                    onClick={() => {
                                        handlePrintTem({ typePrint: "notPrice", id: currentId, typePage: props?.type });
                                        setPrintDropdownOpen(false);
                                    }}
                                    className="group transition-all duration-200 ease-in-out flex items-center gap-2 2xl:text-sm xl:text-sm text-[8px] text-left cursor-pointer px-1.5 py-2 rounded-lg hover:bg-primary-05 text-neutral-03 hover:text-neutral-07 font-normal whitespace-nowrap"
                                >
                                    <PrinterTem className="size-5"/>
                                    <p className="whitespace-nowrap">
                                        {props?.dataLang?.btn_table_print_notprice || "In không giá"}
                                    </p>
                                </li>
                                <li
                                    onClick={() => {
                                        handlePrintTem({ typePrint: "price", id: currentId, typePage: props?.type });
                                        setPrintDropdownOpen(false);
                                    }}
                                    className="group transition-all duration-200 ease-in-out flex items-center gap-2 2xl:text-sm xl:text-sm text-[8px] text-left cursor-pointer px-1.5 py-2 rounded-lg hover:bg-primary-05 text-neutral-03 hover:text-neutral-07 font-normal whitespace-nowrap"
                                >
                                    <PrinterTem className="size-5"/>
                                    <p className="whitespace-nowrap">
                                        {props?.dataLang?.btn_table_print_price || "In có giá"}
                                    </p>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            );
        }

        // Nút xóa - Delete
        if (props.type == "order") {
            allButtons.push(
                <Popup_TableValidateDelete
                    key="delete"
                    {...shareProps}
                    isOpen={isOpen}
                    handleQueryId={handleQueryId}
                    {...props}
                    className="2xl:text-sm xl:text-sm text-[8px] hover:bg-slate-50 text-left cursor-pointer rounded py-2.5"
                />
            );
        } else {
            allButtons.push(
                <button
                    key="delete"
                    onClick={() => {
                        if (role) {
                            handleQueryId({ id: props?.id, status: true });
                        } else if (checkDelete) {
                            handleQueryId({ id: props?.id, status: true });
                        } else {
                            isShow("error", WARNING_STATUS_ROLE);
                        }
                    }}
                    className={`group rounded-lg w-full p-1 border border-transparent transition-all ease-in-out flex items-center gap-2 responsive-text-sm text-left cursor-pointer
                        ${totalButtons > 3
                            ? 'hover:bg-primary-05'
                            : 'hover:border-red-01 hover:bg-red-02'
                        }`
                    }
                    {...totalButtons <= 3 && {
                        "data-tooltip-id": "delete-tooltip",
                        "data-tooltip-content": props.dataLang?.btn_table_delete || "btn_table_delete"
                    }}
                >
                    <TrashIcon
                        className={`size-5 transition-all duration-300 
                            ${totalButtons > 3 ? "text-neutral-03 group-hover:text-neutral-07" : "text-[#EE1E1E]"}`}
                    />
                    {totalButtons > 3 && (
                        <p className="text-neutral-03 group-hover:text-neutral-07 font-normal whitespace-nowrap">
                            {props.dataLang?.btn_table_delete || "btn_table_delete"}
                        </p>
                    )}
                </button>
            );
        }

        // Hiển thị tối đa 3 nút, nếu nhiều hơn thì hiển thị dấu "..."
        if (allButtons.length <= 3) {
            return allButtons;
        } else {
            // Lưu ID của phần tử hiện tại để đảm bảo sử dụng đúng ID khi xử lý các thao tác
            const currentId = props?.id;
            
            return [
                <div key={`more-${currentId}`} className="relative" ref={moreIconsRef}>
                    <button
                        onClick={() => setShowMoreIcons(!showMoreIcons)}
                        data-tooltip-id={`more-actions-tooltip-${currentId}`}
                        data-tooltip-place="bottom-end"
                        className="group rounded-lg p-1 border border-transparent hover:border-[#555] hover:bg-gray-100 transition-all ease-in-out flex items-center justify-center text-left cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="#003DA0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="19" cy="12" r="1" />
                            <circle cx="5" cy="12" r="1" />
                        </svg>
                    </button>
                    <Tooltip
                        id={`more-actions-tooltip-${currentId}`}
                        place="bottom-end"
                        variant="light"
                        clickable={true}
                        isOpen={showMoreIcons}
                        setIsOpen={setShowMoreIcons}
                        className="z-[999999999] !border !border-gray-200 !rounded-xl !p-0 !bg-white opacity-100 overflow-hidden"
                        style={{
                            backgroundColor: 'white',
                            opacity: '1 !important',
                            borderRadius: '12px',
                            overflow: 'hidden'
                        }}
                        noArrow={true}
                        opacity={1}
                        delayHide={100}
                        trigger="mouseenter"
                        openOnClick={true}
                        onClickOutside={() => setShowMoreIcons(false)}
                    >
                        <div
                            className="flex flex-col gap-1 min-w-[120px] p-1 bg-white"
                            style={{ opacity: 1, borderRadius: '10px' }}
                            data-row-id={currentId} /* Store the ID as a data attribute */
                        >
                            {allButtons.map((button, index) => (
                                <div key={`action-${currentId}-${index}`} className="">{button}</div>
                            ))}
                        </div>
                    </Tooltip>
                </div>
            ];
        }
    };

    return (
        <div className="flex items-center justify-center gap-1">
            {renderActionButtons()}
            <PopupConfim
                dataLang={props.dataLang}
                type="warning"
                nameModel={props?.type}
                title={TITLE_DELETE}
                subtitle={CONFIRM_DELETION}
                isOpen={isOpen}
                save={() => handleDelete()}
                cancel={() => handleQueryId({ status: false })}
            />
            <Tooltip id="delete-tooltip" place="top" className="z-[999999]" style={{ borderRadius: '6px' }} />
        </div>
    );
});
