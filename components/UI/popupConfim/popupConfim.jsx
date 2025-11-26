import { AlertTriangleIcon } from "@/components/icons";
import useActionRole from "@/hooks/useRole";
import useToast from "@/hooks/useToast";
import { Inter } from "@next/font/google";
import Image from "next/image";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import Popup from "reactjs-popup";
import Zoom from "../zoomElement/zoomElement";

const inter = Inter({ subsets: ["latin"] });

const PopupConfim = (props) => {

    const { is_admin: role, permissions_current: auth } = useSelector((state) => state.auth);

    const { checkBrowser: checkAuth, checkDelete } = useActionRole(auth, props?.nameModel)

    const showToat = useToast()
    const tryForceConfirm = () => {
        if (props?.forceConfirm) {
            props?.save?.();
            return true;
        }
        return false;
    };
    const handleConfimDelete = () => {
        if (tryForceConfirm()) {
            return;
        }
        switch (props?.nameModel) {
            case "client_contact":
            //Xóa biến liên hệ KH
            // if (!props?.isIdChild && !checkDelete) {
            //     props.save();
            // } else {
            //     showToat('warning', 'Bạn không có quyền truy cập');
            // }
            case "contacts_suppliers":
            //Xóa biến liên hệ ncc
            // if (!props?.isIdChild && !checkDelete) {
            //     props.save();
            // } else {
            //     showToat('warning', 'Bạn không có quyền truy cập');
            // }
            case "change_item":
            //Xóa các item ở form change_item
            case "material_variation":
            //Xóa biến thể nvl
            case 'product_variant':
            //Xóa biến thể thành phẩm
            case 'personnel_staff_status':
                // Đổi trạng thái hoạt động của người dùng
                props.save();
                break;
            case 'bom_require_stage':
                // Cảnh báo phải thiết kế công đoạn trước khi thiết kế BOM
                props.save();
                break;
            case "personnel_staff":
                ///Xóa người dùng
                if (role) {
                    props.save();
                } else {
                    showToat('error', 'Bạn không phải admin không thể xóa người dùng')
                }
                break
            default:
                if (role || checkDelete) {
                    props.save();
                } else {
                    showToat('error', 'Bạn không có quyền truy cập');
                }
                break;
        }
    }

    // Xử lý phím Enter để kích hoạt nút xác nhận
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Enter' && props.isOpen) {
                event.preventDefault();
                if (tryForceConfirm()) {
                    return;
                }
                
                // Xác định nút xác nhận nào cần được kích hoạt
                if (props.nameModel === "price_quote_status") {
                    // Kích hoạt nút xác nhận đầu tiên (nút đỏ)
                    if (role) {
                        props.save();
                    } else if (auth?.quotes?.is_agree == 1) {
                        props.save();
                    } else {
                        showToat('error', 'Bạn không có quyền thay đổi trạng thái');
                    }
                } else if (props.nameModel === "sales_product_status") {
                    // Kích hoạt nút xác nhận
                    if (role) {
                        props.save();
                    } else if (auth?.orders?.is_agree == 1) {
                        props.save();
                    } else {
                        showToat('error', 'Bạn không có quyền thay đổi trạng thái');
                    }
                } else if (['client_customers',
                    'client_contact',
                    'client_status',
                    'client_group',
                    'suppliers',
                    'contacts_suppliers',
                    'suppliers_groups',
                    'material_category',
                    'material_variation',
                    'materials',
                    'category_products',
                    'price_quote',
                    'sales_product',
                    'product_variant',
                    'personnel_staff',
                    'personnel_staff_status',
                    'department',
                    'personnel_roles',
                    'warehouse',
                    'warehouse_location',
                    'inventory',
                    'change_item',
                    'bom_require_stage'
                ].includes(props.nameModel)) {
                    // Kích hoạt handleConfimDelete
                    handleConfimDelete();
                } else {
                    // Kích hoạt nút xác nhận mặc định
                    if (role) {
                        props.save();
                    } else if (checkAuth) {
                        props.save();
                    } else {
                        showToat('error', 'Bạn không có quyền thay đổi trạng thái');
                    }
                }
            }
        };

        if (props.isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [props.isOpen, props.nameModel, role, auth, checkAuth, checkDelete]);

    return (
        <Popup
            open={props.isOpen}
            closeOnDocumentClick={false}
            onClose={props.onClose}
            className={`${props.className} popup-edit`}
            overlayStyle={{ zIndex: 1100 }}
        >
            <div
                className={`min-w-[400px] max-w-[400px] ${props.nameModel == "price_quote_status" && "min-w-[500px]"
                    // className={`3xl:mt-48 2xl:mt-32 xl:mt-32 mt-36 min-w-[400px] ${props.nameModel == "price_quote_status" && "min-w-[500px]"
                    }`}
            >
                <div className={`${inter.className} bg-[#ffffff] p-4 shadow-xl rounded-xl flex flex-col gap-3`}>
                    <div className="relative inline-block">
                        {props.type == "warning" ? (
                            <AlertTriangleIcon className="text-yellow-500 size-6" />
                        ) : (
                            <Image
                                alt="teddd"
                                src="/popup/check-circle.png"
                                width={24}
                                height={24}
                                className="object-cover"
                            />
                        )}
                    </div>
                    <h1 className="text-[#101828] font-medium 3xl:text-[22px] 2xl:text-[18px] text-lg">
                        {props.title}
                    </h1>
                    <h2 className="text-[#667085] font-medium responsive-text-lg tracking-widest-[0.14px]	">
                        {props.subtitle}
                    </h2>
                    <div className="flex items-center justify-between gap-4">
                        {props.nameModel == "price_quote_status" && (
                            <>
                                <Zoom className="w-1/2">
                                    <button
                                        onClick={props.cancel}
                                        className="text-base text-white transition-all duration-150 ease-linear tran font-normal rounded-lg w-full  border-red-600 border px-[18px] py-[10px] shadow-[0px 1px 2px 0px rgba(16, 24, 40, 0.05)]"
                                    >
                                        Hủy
                                    </button>
                                </Zoom>
                                <Zoom className="w-1/2">
                                    <button
                                        onClick={() => {
                                            if (tryForceConfirm()) {
                                                return;
                                            }
                                            if (role) {
                                                return props.save()
                                            }
                                            else if (auth?.quotes?.is_agree == 1) {
                                                return props.save()
                                            } else {
                                                showToat('error', 'Bạn không có quyền thay đổi trạng thái')
                                            }
                                        }}
                                        className="text-base text-red-600 hover:bg-red-100 transition-all duration-150 ease-linear tran font-normal rounded-lg w-full  border-red-600 border px-[18px] py-[10px] shadow-[0px 1px 2px 0px rgba(16, 24, 40, 0.05)]"
                                        >
                                        {props.status === "confirmed" ? props.dataLang?.aler_not_yet_approved : props.dataLang?.aler_approved}
                                    </button>
                                </Zoom>
                                <Zoom className="w-1/2">
                                    <button
                                        onClick={() => {
                                            if (tryForceConfirm()) {
                                                return;
                                            }
                                            if (role) {
                                                return props.handleNoconfim()
                                            }
                                            else if (auth?.quotes?.is_agree == 1) {
                                                return props.handleNoconfim()
                                            } else {
                                                showToat('error', 'Bạn không có quyền thay đổi trạng thái')
                                            }
                                        }}
                                        className="text-base text-white bg-[#003DA0] hover:bg-[#0375F3] transition-all duration-150 ease-linear tran font-normal rounded-lg w-full border-[#D0D5DD] border px-[18px] py-[10px] shadow-[0px 1px 2px 0px rgba(16, 24, 40, 0.05)]"
                                        >
                                        {props.status === "no_confirmed" ? props.dataLang?.aler_not_yet_approved : props.dataLang?.aler_no_approved}
                                    </button>
                                </Zoom>
                            </>
                        )}
                        {props.nameModel == "sales_product_status" && (
                            <>
                                <Zoom className="w-1/2">
                                    <button
                                        onClick={props.cancel}
                                        className="text-base text-red-600 hover:bg-red-100 transition-all duration-150 ease-linear tran font-normal rounded-lg w-full  border-red-600 border px-[18px] py-[10px] shadow-[0px 1px 2px 0px rgba(16, 24, 40, 0.05)]"
                                        >
                                        Hủy
                                    </button>
                                </Zoom>
                                <Zoom className="w-1/2">
                                    <button
                                        onClick={() => {
                                            if (tryForceConfirm()) {
                                                return;
                                            }
                                            if (role) {
                                                return props.save()
                                            } else if (auth?.orders?.is_agree == 1) {
                                                return props.save()
                                            }
                                            else {
                                                showToat('error', 'Bạn không có quyền thay đổi trạng thái')
                                            }
                                        }}
                                        className="text-base text-white bg-[#003DA0] hover:bg-[#0375F3] transition-all duration-150 ease-linear tran font-normal rounded-lg w-full border-[#D0D5DD] border px-[18px] py-[10px] shadow-[0px 1px 2px 0px rgba(16, 24, 40, 0.05)]"
                                        >
                                        {props.status === "approved" ? props.dataLang?.aler_not_yet_approved : props.dataLang?.aler_approved}
                                    </button>
                                </Zoom>
                            </>
                        )}
                        {/* // nút xóa model không phải poup và xóa biến thể, chuyển đổi trạng thái status */}
                        {
                            ['client_customers',
                                'client_contact',
                                'client_status',
                                'client_group',
                                'suppliers',
                                'contacts_suppliers',
                                'suppliers_groups',
                                'material_category',
                                'material_variation',
                                'materials',
                                'category_products',
                                'price_quote',
                                'sales_product',
                                'product_variant',
                                'personnel_staff',
                                'personnel_staff_status',
                                'department',
                                'personnel_roles',
                                'warehouse',
                                'warehouse_location',
                                'inventory',
                                'change_item',
                                'bom_require_stage'
                            ].includes(props.nameModel) && (
                                <>
                                    <Zoom className="w-1/2">
                                        <button
                                            onClick={props.cancel}
                                            className="text-base text-red-600 hover:bg-red-100 transition-all duration-150 ease-linear tran font-normal rounded-lg w-full  border-red-600 border px-[18px] py-[10px] shadow-[0px 1px 2px 0px rgba(16, 24, 40, 0.05)]"
                                        >
                                            Hủy
                                        </button>
                                    </Zoom>
                                    <Zoom className="w-1/2">
                                        <button
                                            onClick={() => handleConfimDelete()}
                                            className="text-base text-white bg-[#003DA0] hover:bg-[#0375F3] transition-all duration-150 ease-linear tran font-normal rounded-lg w-full border-[#D0D5DD] border px-[18px] py-[10px] shadow-[0px 1px 2px 0px rgba(16, 24, 40, 0.05)]"
                                        >
                                            Xác nhận
                                        </button>
                                    </Zoom>
                                </>
                            )}
                        {/* // nút xóa các model có nút popup tác vụ */}
                        {![
                            "price_quote",
                            "sales_product",
                            'client_customers',
                            'client_contact',
                            'client_status',
                            'client_group',
                            'suppliers',
                            'contacts_suppliers',
                            'suppliers_groups',
                            'material_category',
                            'material_variation',
                            'materials',
                            'category_products',
                            'price_quote_status',
                            'sales_product_status',
                            'product_variant',
                            'personnel_staff',
                            'personnel_staff_status',
                            'department',
                            'personnel_roles',
                            'warehouse',
                            'warehouse_location',
                            'inventory',
                            'change_item',
                            'bom_require_stage'
                        ].includes(props.nameModel) && (
                                <>
                                    <Zoom className="w-1/2">
                                        <button
                                            onClick={props.cancel}
                                            className="text-base text-red-600 hover:bg-red-100 transition-all duration-150 ease-linear tran font-normal rounded-lg w-full  border-red-600 border px-[18px] py-[10px] shadow-[0px 1px 2px 0px rgba(16, 24, 40, 0.05)]"
                                        >
                                            Hủy
                                        </button>
                                    </Zoom>
                                    <Zoom className="w-1/2">
                                        <button
                                            onClick={() => {
                                            if (tryForceConfirm()) {
                                                return;
                                            }
                                                if (role) {
                                                    props.save()
                                                } else if (checkAuth) {
                                                    props.save()
                                                }
                                                else {
                                                    showToat('error', 'Bạn không có quyền thay đổi trạng thái')
                                                }
                                            }}
                                            className="text-base text-white bg-[#003DA0] hover:bg-[#0375F3] transition-all duration-150 ease-linear tran font-normal rounded-lg w-full border-[#D0D5DD] border px-[18px] py-[10px] shadow-[0px 1px 2px 0px rgba(16, 24, 40, 0.05)]"
                                        >
                                            Xác nhận
                                        </button>
                                    </Zoom>
                                </>
                            )}
                    </div>
                    {/* {props.children} */}
                </div>
            </div>
        </Popup>
    );
};
export default PopupConfim;
