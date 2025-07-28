import apiDashboard from "@/Api/apiDashboard/apiDashboard";
import { optionsQuery } from "@/configs/optionsQuery";
import { CookieCore } from "@/utils/lib/cookie";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import apiUpgradePackage from "@/Api/apiUpgradePackage/apiUpgradePackage";

export const useAuththentication = (auth) => {
    const dispatch = useDispatch();
    return useQuery({
        
        queryKey: ["api_authentication"],
        queryFn: async () => {
            const { isSuccess, info } = await apiDashboard.apiAuthentication();
            dispatch({ type: "auth/update", payload: isSuccess ? info : false });
            return info || false;
        },
        placeholderData: keepPreviousData,
        enabled: auth == null,
        ...optionsQuery,
    });
};

// thông tin tài khoản
export const useGetInfo = ({ open }) => {
    return useQuery({
        queryKey: ["api_get_info", open],
        queryFn: async () => {
            const res = await apiDashboard.apiGetInfo();
            return res;
        },
        placeholderData: keepPreviousData,
        enabled: open,
        ...optionsQuery,
    });
};

// đổi ảnh tài khoản
export const useUpdateAvatar = () => {
    const submitMutation = useMutation({
        mutationFn: (data) => {
            return apiDashboard.apiUpdateAvatarInfo(data);
        },
        retry: 5,
        retryDelay: 5000,
    });
    const onSubmit = async (image) => {
        let formtData = new FormData();
        formtData.append("profile_image", image);
        const r = await submitMutation.mutateAsync(formtData);
        return r;
    };
    return { onSubmit, isLoading: submitMutation.isPending };
};
// đổi mk
export const useChangePassword = () => {
    const submitMutation = useMutation({
        mutationFn: (data) => {
            return apiDashboard.apiChangePassword(data);
        },
        retry: 5,
        retryDelay: 5000,
    });
    const onSubmit = async (data) => {
        let formtData = new FormData();
        formtData.append("password", data?.newPassword);
        formtData.append("password_confirm", data?.confirmPassword);
        const r = await submitMutation.mutateAsync(formtData);
        return r;
    };
    return { onSubmit, isLoading: submitMutation.isPending };
};

export const useLanguage = (lang) => {
    return useQuery({
        queryKey: ["api_Language", lang],
        queryFn: async () => {
            const res = await apiDashboard.apiLang(lang);

            if (typeof res.isSuccess == "boolean" && !res.isSuccess) {
                CookieCore.remove("tokenFMRP");
                CookieCore.remove("databaseappFMRP");
            }
            return res;
        },
        placeholderData: keepPreviousData,
        ...optionsQuery,
    });
};

export const useSetings = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    return useQuery({
        queryKey: ["api_settings", router.pathname],
        queryFn: async () => {
            const res = await apiDashboard.apiSettings();
            dispatch({ type: "setings/server", payload: res?.settings });
            const fature = await apiDashboard.apiFeature();
            const newData = {
                dataMaterialExpiry: fature.find((x) => x.code == "material_expiry"),
                dataProductExpiry: fature.find((x) => x.code == "product_expiry"),
                dataProductSerial: fature.find((x) => x.code == "product_serial"),
            };
            dispatch({ type: "setings/feature", payload: newData });
            return newData;
        },
        placeholderData: keepPreviousData,
        staleTime: 5 * 60 * 1000, // Cache 5 phút
        ...optionsQuery
    })
}

// lấy thông tin gói nâng cấp
export const useGetUpgradePackage = () => {
    const query = useQuery({
        queryKey: ["api_get_upgrade_package"],
        queryFn: async () => {
            const res = await apiUpgradePackage.apiGetUpgradePackage();
            return res || []
        },
        placeholderData: keepPreviousData,
        ...optionsQuery
    });
    
    // Thêm hàm để lấy dữ liệu với nhiều cách thử khác nhau
    const getUpgradePackageWithRefresh = async (upgradePackageData, setBankData, showMessage) => {
        try {
            // Thử refetch từ hook trước
            try {
                const refetchResult = await query.refetch();
                
                if (refetchResult?.data && upgradePackageData) {
                    // Cập nhật dữ liệu
                    Object.assign(upgradePackageData, refetchResult.data);
                    
                    // Cập nhật thông tin ngân hàng nếu có
                    if (refetchResult.data.dataQR?.bank && setBankData) {
                        setBankData((prevBankData) => ({
                            accountNumber: refetchResult.data.dataQR.bank.account_number || prevBankData.accountNumber,
                            accountName: refetchResult.data.dataQR.bank.account_name || prevBankData.accountName,
                            transferContent: refetchResult.data.dataQR.bank.note || prevBankData.transferContent,
                        }));
                    }
                    
                    return refetchResult.data;
                }
            } catch (refetchError) {
                console.log("→ Lỗi khi gọi refetch trong hook:", refetchError);
            }
            
            // Nếu refetch thất bại, gọi API trực tiếp
            const response = await apiUpgradePackage.apiGetUpgradePackage();
            
            if (response && upgradePackageData) {
                // Cập nhật dữ liệu
                Object.assign(upgradePackageData, response);
                
                // Cập nhật thông tin ngân hàng nếu có
                if (response.dataQR?.bank && setBankData) {
                    setBankData((prevBankData) => ({
                        accountNumber: response.dataQR.bank.account_number || prevBankData.accountNumber,
                        accountName: response.dataQR.bank.account_name || prevBankData.accountName,
                        transferContent: response.dataQR.bank.note || prevBankData.transferContent,
                    }));
                    
                    if (showMessage) {
                        showMessage("success", "Đã cập nhật mã QR và thông tin chuyển khoản");
                    }
                }
            }
            
            return response;
        } catch (error) {
            console.error("→ Lỗi khi cập nhật thông tin gói:", error);
            if (showMessage) {
                showMessage("error", "Không thể cập nhật thông tin gói. Vui lòng thử lại.");
            }
            throw error;
        }
    };
    
    return {
        ...query,
        getUpgradePackageWithRefresh
    };
}

// lấy thông tin gói cụ thể
export const useGetPackage = (data) => {
    return useQuery({
        queryKey: ["api_get_package", data],
        queryFn: async () => {
            const res = await apiUpgradePackage.apiGetPackage(data);
            return res || []
        },
        placeholderData: keepPreviousData,
        ...optionsQuery
    })
}

// lấy thông tin dịch vụ bổ sung
export const useGetServiceAdd = (data) => {
    return useQuery({
        queryKey: ["api_get_service_add", data],
        queryFn: async () => {
            const res = await apiUpgradePackage.apiGetServiceAdd(data);
            return res || []
        },
        placeholderData: keepPreviousData,
        ...optionsQuery
    })
}

// nâng cấp gói
export const useUpgradePackage = () => {
    const submitMutation = useMutation({
        mutationFn: ({ data, id }) => {
            return apiUpgradePackage.apiUpgradePackage(data, id)
        },
        retry: 5,
        retryDelay: 5000
    })
    const onSubmit = async (data, id) => {
        const r = await submitMutation.mutateAsync({ data, id })
        return r
    }
    return { onSubmit, isLoading: submitMutation.isPending }
}

export const useGetPackageDetail = (id) => {
    return useQuery({
        queryKey: ["api_get_package_detail", id],
        queryFn: async () => {
            const res = await apiUpgradePackage.apiGetPackageDetail(id);
            return res || []
        },
        placeholderData: keepPreviousData,
        ...optionsQuery
    })
}

// // Đảm bảo hook chạy ngay khi ứng dụng khởi động
// export const SettingsInitializer = () => {
//     useSettings();
//     return null; // Không render UI, chỉ chạy hook
// };

export const useSettingApp = () => {
    return useQuery({
        queryKey: ["api_setting_app"],
        queryFn: async () => {
            const { settings } = await apiDashboard.apiSettings();
            return settings;
        },
        placeholderData: keepPreviousData,
        ...optionsQuery,
    });
};
