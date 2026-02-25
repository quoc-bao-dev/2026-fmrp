import { useRouter } from 'next/router';
import Head from 'next/head';
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useCheckIntroduce } from '@/managers/api/parcel/useCheckIntroduce';
import { useCheckModuleInstall } from '@/hooks/useCheckModuleInstall';
import useToast from '@/hooks/useToast';
import Image from 'next/image';

const IMAGE_INTRO_BACKGROUND = "/application/intro-background.png"

// Mapping tên tab từ key sang tên hiển thị
const TAB_NAMES = {
    'danh-sach-to-nhom': 'Danh sách tổ / nhóm',
    'thiet-lap-ca-lam-viec': 'Thiết lập ca làm việc',
    'bang-xep-ca': 'Bảng xếp ca',
    'nhap-san-luong': 'Nhập sản lượng',
    'tong-hop-luong-san-luong': 'Tổng hợp lương sản lượng',
};

const MODULE_CONFIG = {
    'luong-san-luong': {
        content:
            'Module Lương Sản Lượng giúp bạn quản lý và tính toán lương dựa trên sản lượng sản xuất một cách chính xác và hiệu quả.\n\nModule bao gồm các tính năng:\n\n• Danh sách tổ / nhóm: Quản lý thông tin các tổ, nhóm sản xuất và thành viên\n• Thiết lập ca làm việc: Cấu hình các ca làm việc với thời gian và quy định\n• Bảng xếp ca: Lập lịch và phân công ca làm việc cho nhân viên\n• Nhập sản lượng: Ghi nhận sản lượng sản xuất theo công đoạn và lệnh sản xuất\n• Tổng hợp lương sản lượng: Tự động tính toán và tạo báo cáo lương chi tiết',
        redirectUrl: '/piecework-wage',
        tabs: {
            'danh-sach-to-nhom': {
                redirectUrl: '/piecework-wage',
            },
            'thiet-lap-ca-lam-viec': {
                redirectUrl: '/piecework-wage/shift-setting',
            },
            'bang-xep-ca': {
                redirectUrl: '/piecework-wage/shift-schedule',
            },
            'nhap-san-luong': {
                redirectUrl: '/piecework-wage/import-output',
            },
            'tong-hop-luong-san-luong': {
                redirectUrl: '/piecework-wage/summary',
            },
        },
    },
};

const ModuleIntroduction = () => {
    const router = useRouter();
    const { module, tab } = router.query;
    const dispatch = useDispatch();
    const authState = useSelector(state => state.auth);
    const { checkIntroduce } = useCheckModuleInstall();
    const { mutateAsync: checkIntroduceMutate, isLoading: isCheckingIntroduce } = useCheckIntroduce({
        onSuccess: (data) => {
            if (data?.success) {
                // Cập nhật state sẽ được xử lý trong handleStartNow
            }
        },
        onError: (error) => {
            console.error('Failed to check introduce:', error);
        },
    });
    const isShow = useToast();

    // Lấy config cho module hiện tại
    const moduleConfig = MODULE_CONFIG[module] || null;

    // Nếu không có module hoặc không tìm thấy config, có thể hiển thị 404 hoặc default
    if (!module || !moduleConfig) {
        return (
            <div className='flex items-center justify-center h-screen'>
                <div className='text-center'>
                    <h1 className='text-2xl font-semibold text-gray-800 mb-2'>Module không tồn tại</h1>
                    <p className='text-gray-600'>Vui lòng kiểm tra lại đường dẫn.</p>
                </div>
            </div>
        );
    }

    // Lấy tab config nếu có tab trong query, nếu không thì lấy tab đầu tiên
    const tabKeys = moduleConfig.tabs ? Object.keys(moduleConfig.tabs) : [];
    const currentTabKey = tab && moduleConfig.tabs?.[tab] ? tab : tabKeys[0];
    const currentTabConfig = currentTabKey ? moduleConfig.tabs?.[currentTabKey] : null;

    // Lấy parcel ID từ parcel_use dựa trên module key
    const getParcelId = () => {
        if (!module || module !== 'luong-san-luong') return null;

        const moduleKey = 'production_output'; // Từ PARCEL_USE['luong-san-luong']
        const parcelItem = authState?.parcel_use?.find(item => item.key_menu_fe === moduleKey);
        return parcelItem?.id || null;
    };

    const handleStartNow = async () => {
        // Lấy parcel ID
        const parcelId = getParcelId();

        // Nếu có parcel ID và chưa giới thiệu, gọi API check introduce
        if (parcelId && !checkIntroduce('luong-san-luong')) {
            try {
                const result = await checkIntroduceMutate(parcelId);
                // Sau khi gọi API thành công, cập nhật authState và redirect đến trang đích
                // Response có cấu trúc: { success: true, message: "..." }
                if (result?.success) {
                    // Cập nhật authState: cập nhật introduce trong parcel_use từ "0" thành "1"
                    const updatedParcelUse = authState?.parcel_use?.map(item => {
                        if (item.id === parcelId) {
                            return {
                                ...item,
                                introduce: '1', // Đánh dấu đã xem giới thiệu
                            };
                        }
                        return item;
                    });

                    // Dispatch action để cập nhật authState
                    dispatch({
                        type: 'auth/update',
                        payload: {
                            ...authState,
                            parcel_use: updatedParcelUse,
                        },
                    });

                    // Redirect đến trang đích
                    if (currentTabConfig?.redirectUrl) {
                        router.push(currentTabConfig.redirectUrl);
                    } else {
                        router.push(moduleConfig.redirectUrl);
                    }
                } else {
                    isShow('error', result?.message || 'Không thể đánh dấu đã xem giới thiệu. Vui lòng thử lại.');
                }
            } catch (error) {
                isShow('error', 'Không thể đánh dấu đã xem giới thiệu. Vui lòng thử lại.');
                console.error('Error checking introduce:', error);
            }
        } else {
            // Nếu đã giới thiệu hoặc không có parcel ID, redirect bình thường
            if (currentTabConfig?.redirectUrl) {
                router.push(currentTabConfig.redirectUrl);
            } else {
                router.push(moduleConfig.redirectUrl);
            }
        }
    };


    // Lấy tên module để hiển thị
    const moduleDisplayName = module === 'luong-san-luong' ? 'Lương Sản Lượng' : module;

    return (
        <>
            <Head>
                <title>Giới thiệu {moduleDisplayName}</title>
            </Head>


            <div className="">

                {/* ==== content ==== */}
                <div className="max-w-[1300px] mx-auto">
                    <div className="pt-[62px]"></div>

                    <div className="flex gap-2 relative">

                        {/* ==== left content ==== */}
                        <div className="w-[41%] top-[62px] sticky h-fit">
                            <div className="">
                                <div className="relative">
                                    <div className="absolute -top-16 -left-12 h-[480px] ">
                                        <Image
                                            src={IMAGE_INTRO_BACKGROUND}
                                            alt="intro-background"
                                            width={500}
                                            height={500}
                                            className=" w-full h-full object-contain"
                                        />
                                    </div>


                                    <div className="pt-20px pl-[40px] pt-[40px] relative z-[1]">
                                        <h1 className="font-deca font-semibold text-[32px] leading-[40px] tracking-[0] text-[#101828] text-left capitalize">
                                            Lương sản lượng
                                        </h1>

                                        <p className="pt-[20px] opacity-50 font-deca font-normal text-sm 2xl:text-[16px] leading-[28px] tracking-[0] text-[#475467] text-justify">
                                            Giúp doanh nghiệp tính lương công nhân dựa trên sản lượng thực tế theo ca, tổ/nhóm hoặc từng người. Thay vì ghi chép rời rạc và cộng tay dễ sai, hệ thống chuẩn hóa dữ liệu từ khâu xếp ca – lệnh sản xuất – nhập sản lượng, để việc tính lương diễn ra đúng công thức, đúng số liệu.
                                            <br />
                                            <br />

                                            Điểm mạnh của lương sản lượng nằm ở tính minh bạch và công bằng: ai làm nhiều, đạt năng suất tốt sẽ được ghi nhận tương xứng. Nhờ có dữ liệu chi tiết theo thời gian, quản lý dễ đối soát, hạn chế thất thoát và kiểm soát tốt chênh lệch giữa kế hoạch – thực tế.
                                            <br />
                                            <br />

                                            Cuối kỳ, hệ thống tự động tổng hợp sản lượng và tính lương nhanh chóng, đồng thời cung cấp báo cáo năng suất theo ca/tổ/nhóm/người để doanh nghiệp ra quyết định điều phối nhân sự, tối ưu quy trình và nâng hiệu quả sản xuất.
                                        </p>

                                        <div className="pt-[24px]">
                                            <IntroPrimaryButton label="Bắt đầu" />
                                        </div>
                                    </div>

                                </div>


                            </div>

                        </div>

                        {/* ==== right content ==== */}
                        <div className="flex-1">
                            <div className="h-[100px] bg-blue-500"></div>

                            <div className="w-full h-[2000px] bg-gradient-to-b from-gray-100 to-gray-900"></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ModuleIntroduction;

const IntroPrimaryButton = ({ label = 'Bắt đầu', onClick }) => {
    return (
        <button
            type="button"
            className="inline-flex items-center gap-2 rounded-[40px] border border-[#899CFD] bg-[#0375F3] px-4 py-2 text-sm font-semibold text-white shadow-none transition-all duration-200 hover:bg-[#0A7FFF] hover:shadow-[0_8px_20px_rgba(3,117,243,0.3)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            onClick={onClick}
        >
            <span className="pl-[12px]">{label}</span>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="16" fill="white" />
                <path d="M21.938 11V19.125C21.938 19.3736 21.8392 19.6121 21.6634 19.7879C21.4876 19.9637 21.2491 20.0625 21.0005 20.0625C20.7518 20.0625 20.5134 19.9637 20.3375 19.7879C20.1617 19.6121 20.063 19.3736 20.063 19.125V13.2656L11.6637 21.6633C11.4876 21.8394 11.2487 21.9383 10.9997 21.9383C10.7506 21.9383 10.5117 21.8394 10.3356 21.6633C10.1595 21.4872 10.0605 21.2483 10.0605 20.9992C10.0605 20.7501 10.1595 20.5113 10.3356 20.3352L18.7348 11.9375H12.8755C12.6268 11.9375 12.3884 11.8387 12.2125 11.6629C12.0367 11.4871 11.938 11.2486 11.938 11C11.938 10.7514 12.0367 10.5129 12.2125 10.3371C12.3884 10.1613 12.6268 10.0625 12.8755 10.0625H21.0005C21.2491 10.0625 21.4876 10.1613 21.6634 10.3371C21.8392 10.5129 21.938 10.7514 21.938 11Z" fill="#206AFF" />
            </svg>
        </button>
    );
};
