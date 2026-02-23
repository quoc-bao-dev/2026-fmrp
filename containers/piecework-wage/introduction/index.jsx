import { useRouter } from 'next/router';
import React from 'react';
import Head from 'next/head';
import { useSelector, useDispatch } from 'react-redux';
import { useCheckIntroduce } from '@/managers/api/parcel/useCheckIntroduce';
import { useCheckModuleInstall } from '@/hooks/useCheckModuleInstall';
import useToast from '@/hooks/useToast';

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

    // Chuyển đổi content từ text có \n thành các đoạn văn
    const renderContent = () => {
        if (!moduleConfig?.content) {
            return <p className='text-gray-600'>Không có nội dung cho module này.</p>;
        }

        const lines = moduleConfig.content.split('\n');
        const elements = [];
        let currentParagraph = [];

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();

            if (!trimmedLine) {
                // Dòng trống - kết thúc paragraph hiện tại
                if (currentParagraph.length > 0) {
                    elements.push(
                        <p key={`para-${elements.length}`} className='text-lg leading-relaxed text-gray-700 mb-4'>
                            {currentParagraph.join(' ')}
                        </p>
                    );
                    currentParagraph = [];
                }
            } else if (trimmedLine.startsWith('•')) {
                // Bullet point
                const bulletText = trimmedLine.substring(1).trim();
                elements.push(
                    <div key={`bullet-${index}`} className='flex items-start mb-2'>
                        <span className='mr-3 text-blue-fmrp text-xl leading-none'>•</span>
                        <span className='text-gray-700 flex-1'>{bulletText}</span>
                    </div>
                );
            } else {
                // Thêm vào paragraph hiện tại
                currentParagraph.push(trimmedLine);
            }
        });

        // Thêm paragraph cuối cùng nếu còn
        if (currentParagraph.length > 0) {
            elements.push(
                <p key={`para-${elements.length}`} className='text-lg leading-relaxed text-gray-700 mb-4'>
                    {currentParagraph.join(' ')}
                </p>
            );
        }

        return elements;
    };

    // Lấy tên module để hiển thị
    const moduleDisplayName = module === 'luong-san-luong' ? 'Lương Sản Lượng' : module;

    return (
        <>
            <Head>
                <title>Giới thiệu {moduleDisplayName}</title>
            </Head>
            <div className='min-h-screen  bg-gray-50  h-full flex flex-col items-center justify-center'>
                <div className='container mx-auto px-4 py-8 max-w-7xl'>
                    {/* Layout 2 cột */}
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[calc(100vh-300px)]- mt-8'>
                        {/* Cột Content */}
                        <div className='flex flex-col justify-center space-y-6'>
                            <div>
                                <h1 className='text-4xl font-bold text-gray-900 mb-6'>
                                    Giới thiệu {moduleDisplayName}
                                </h1>
                                <div className='space-y-2'>
                                    {renderContent()}
                                </div>
                            </div>
                        </div>

                        {/* Cột Visual */}
                        <div className='flex items-center justify-center'>
                            <div className='w-full max-w-md'>
                                <div className='bg-white rounded-lg shadow-lg p-8 flex items-center justify-center'>
                                    <div className='text-center'>
                                        <div className='w-64 h-64 bg-gradient-to-br from-blue-fmrp/10 to-blue-fmrp/5 rounded-lg flex items-center justify-center mb-4'>
                                            <svg
                                                className='w-32 h-32 text-blue-fmrp'
                                                fill='none'
                                                stroke='currentColor'
                                                viewBox='0 0 24 24'
                                                xmlns='http://www.w3.org/2000/svg'
                                            >
                                                <path
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    strokeWidth={2}
                                                    d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                                                />
                                            </svg>
                                        </div>
                                        <p className='text-gray-600 text-sm'>Lương Sản Lượng</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Nút Bắt đầu ngay ở dưới cùng */}
                    <div className='flex justify-center  mt-16 pb-8'>
                        <button
                            onClick={handleStartNow}
                            disabled={isCheckingIntroduce}
                            className='px-8 py-3 bg-blue-fmrp text-white rounded-lg font-semibold text-lg hover:bg-blue-fmrp/90 transition-colors duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {isCheckingIntroduce ? 'Đang xử lý...' : 'Bắt đầu ngay'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ModuleIntroduction;
