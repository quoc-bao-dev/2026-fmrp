import { useRouter } from 'next/router';
import Head from 'next/head';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useCheckIntroduce } from '@/managers/api/parcel/useCheckIntroduce';
import { useCheckModuleInstall } from '@/hooks/useCheckModuleInstall';
import useToast from '@/hooks/useToast';
import Image from 'next/image';

const IMAGE_INTRO_BACKGROUND = "/application/intro-background.png"
const IMAGE_BULLET_NUMBER = "/application/frame-polygon.png"
const IMAGE_BULLET_NUMBER_ACTIVE = "/application/frame-polygon-active.png"

const INFO_CONTENT = [
    '/application/intro-conent-1.png',
    '/application/intro-conent-2.png',
    '/application/intro-conent-3.png',
    '/application/intro-conent-4.png',
    '/application/intro-conent-5.png',
    '/application/intro-conent-6.png',
]

const content = [
    { title: 'Danh sách tổ / nhóm', content: 'Tạo & quản lý tổ/nhóm, phân nhân sự để theo dõi sản lượng đúng đối tượng.', image: INFO_CONTENT[0] },
    { title: 'Thiết lập ca làm việc', content: 'Khai báo ca (giờ vào/ra, tăng ca, quy tắc tính công) làm chuẩn vận hành.', image: INFO_CONTENT[1] },
    { title: 'Bảng xếp ca', content: 'Lên lịch theo ngày/tuần/tháng cho từng tổ/nhóm & nhân sự, đảm bảo đúng ca – đúng người.', image: INFO_CONTENT[2] },
    { title: 'Khởi tạo lệnh sản xuất', content: 'Tạo lệnh theo sản phẩm/công đoạn/số lượng, gắn tổ/nhóm và ca để làm “điều kiện” nhập sản lượng.', image: INFO_CONTENT[3] },
    { title: 'Nhập sản lượng', content: 'Ghi nhận sản lượng theo lệnh/ca/tổ/ nhóm/người, bám sát thực tế phát sinh.', image: INFO_CONTENT[4] },
    { title: 'Tổng hợp lương sản lượng', content: 'Tự động tổng hợp sản lượng & công theo kỳ, tính lương nhanh và xuất báo cáo đối soát.', image: INFO_CONTENT[5] },
]

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

// Ngưỡng khoảng cách từ mép trên màn hình để kích hoạt section (có thể cấu hình lại)
const SECTION_ACTIVE_OFFSET = 1000;

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

    const [activeIndex, setActiveIndex] = useState(null);
    const sectionRefs = useRef([]);
    const [isStarting, setIsStarting] = useState(false);


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
        if (isStarting) return;
        setIsStarting(true);
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
            } finally {
                setIsStarting(false);
            }
        } else {
            // Nếu đã giới thiệu hoặc không có parcel ID, redirect bình thường
            if (currentTabConfig?.redirectUrl) {
                router.push(currentTabConfig.redirectUrl);
            } else {
                router.push(moduleConfig.redirectUrl);
            }
            setIsStarting(false);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            if (!sectionRefs.current || sectionRefs.current.length === 0) return;

            // Tìm section đầu tiên mà khoảng cách từ mép trên viewport
            // đến mép trên component (rect.top) nằm trong [0, SECTION_ACTIVE_OFFSET]
            const index = sectionRefs.current.findIndex((el) => {
                if (!el) return false;
                const rect = el.getBoundingClientRect();
                const distanceFromTop = rect.top; // khoảng cách từ mép trên màn hình tới mép trên component
                return distanceFromTop >= 0 && distanceFromTop <= SECTION_ACTIVE_OFFSET;
            });

            setActiveIndex(index === -1 ? null : index);
        };

        // Gọi 1 lần khi mount để set active ban đầu (nếu đang ở giữa trang)
        handleScroll();

        if (typeof window !== 'undefined') {
            window.addEventListener('scroll', handleScroll, { passive: true });
            window.addEventListener('resize', handleScroll);
            // Lắng nghe scroll trên document (capture) để bắt cả các container cuộn bên trong
            document.addEventListener('scroll', handleScroll, { passive: true, capture: true });
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('scroll', handleScroll);
                window.removeEventListener('resize', handleScroll);
                document.removeEventListener('scroll', handleScroll, { capture: true });
            }
        };
    }, []);


    // Lấy tên module để hiển thị
    const moduleDisplayName = module === 'luong-san-luong' ? 'Lương Sản Lượng' : module;

    return (
        <>
            <Head>
                <title>Giới thiệu {moduleDisplayName}</title>
            </Head>


            <div className="">

                {/* ==== content ==== */}
                <div className="max-w-[1300px] 2xl:max-w-[1350px] mx-auto">
                    <div className="flex gap-[100px] relative">

                        {/* ==== left content ==== */}
                        <div className=" w-[486px] top-0 sticky h-screen flex flex-col justify-center">
                            <div className="">
                                <div className="relative">
                                    <div className="absolute -top-28 -left-12 h-[480px] ">
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

                                        <div className="pt-[20px] flex flex-col gap-4 opacity-80 font-deca font-normal text-sm- 2xl:text-[16px] leading-[26px] tracking-[0] text-[#475467] text-justify">
                                            <p className="">
                                                Giúp doanh nghiệp tính lương theo sản lượng thực tế từng ca, tổ/nhóm hoặc cá nhân. Hệ thống chuẩn hóa dữ liệu từ xếp ca đến nhập sản lượng, đảm bảo tính lương chính xác, hạn chế sai sót.
                                            </p>
                                            <p className="">
                                                Lương sản lượng đảm bảo minh bạch, công bằng: làm nhiều hưởng nhiều. Dữ liệu chi tiết giúp quản lý dễ đối soát và kiểm soát chênh lệch kế hoạch – thực tế.
                                            </p>
                                            <p className="">
                                                Cuối kỳ, hệ thống tự động tổng hợp, tính lương và xuất báo cáo năng suất, hỗ trợ tối ưu nhân sự và nâng cao hiệu quả sản xuất.
                                            </p>
                                        </div>

                                        <div className="pt-[24px]">
                                            <IntroPrimaryButton label={isStarting ? 'Đang xử lý...' : 'Bắt đầu'} onClick={handleStartNow} disabled={isStarting} />
                                        </div>
                                    </div>

                                </div>


                            </div>

                        </div>

                        {/* ==== right content ==== */}
                        <div className="flex-1">
                            <div className="h-[100px]"></div>
                            <div className="flex flex-col gap-6">
                                {content.map((item, index) => (
                                    <div
                                        key={index}
                                        ref={(el) => {
                                            sectionRefs.current[index] = el;
                                        }}
                                    >
                                        <IntroSection
                                            number={index + 1}
                                            title={item.title}
                                            content={item.content}
                                            image={item.image}
                                            contentPosition={index % 2 === 0 ? 'left' : 'right'}
                                            hiddenLine={index === content.length - 1}
                                            isActive={activeIndex === index}
                                        />
                                    </div>
                                ))}
                                <div className="h-[150px]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </>
    );
};

export default ModuleIntroduction;

const IntroPrimaryButton = ({ label = 'Bắt đầu', onClick, disabled = false }) => {
    return (
        <button
            type="button"
            className="inline-flex items-center gap-2 rounded-[40px] border border-[#899CFD] bg-[#0375F3] pl-4 pr-2 py-2 text-sm font-semibold text-white shadow-none transition-all duration-200 hover:bg-[#0A7FFF] hover:shadow-[0_8px_20px_rgba(3,117,243,0.3)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            onClick={disabled ? undefined : onClick}
            disabled={disabled}
        >
            <span className="pl-[0px]">{label}</span>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="16" fill="white" />
                <path d="M21.938 11V19.125C21.938 19.3736 21.8392 19.6121 21.6634 19.7879C21.4876 19.9637 21.2491 20.0625 21.0005 20.0625C20.7518 20.0625 20.5134 19.9637 20.3375 19.7879C20.1617 19.6121 20.063 19.3736 20.063 19.125V13.2656L11.6637 21.6633C11.4876 21.8394 11.2487 21.9383 10.9997 21.9383C10.7506 21.9383 10.5117 21.8394 10.3356 21.6633C10.1595 21.4872 10.0605 21.2483 10.0605 20.9992C10.0605 20.7501 10.1595 20.5113 10.3356 20.3352L18.7348 11.9375H12.8755C12.6268 11.9375 12.3884 11.8387 12.2125 11.6629C12.0367 11.4871 11.938 11.2486 11.938 11C11.938 10.7514 12.0367 10.5129 12.2125 10.3371C12.3884 10.1613 12.6268 10.0625 12.8755 10.0625H21.0005C21.2491 10.0625 21.4876 10.1613 21.6634 10.3371C21.8392 10.5129 21.938 10.7514 21.938 11Z" fill="#206AFF" />
            </svg>
        </button>
    );
};


const BulletNumber = ({ number, isActive = true }) => {
    return (
        <div className="relative w-fit">
            <div className="relative">
                <Image
                    src={IMAGE_BULLET_NUMBER}
                    alt="bullet-number"
                    width={94}
                    height={94}
                    className={`w-[94px] h-[94px] relative z-[0] ${isActive ? 'opacity-0' : 'opacity-100'} transition-all duration-300`}
                />
                <Image
                    src={IMAGE_BULLET_NUMBER_ACTIVE}
                    alt="bullet-number-active"
                    width={94}
                    height={94}
                    className={`w-[94px] h-[94px] z-[2] absolute inset-0 ${isActive ? 'opacity-100' : 'opacity-0'} transition-all duration-300`}
                />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
                <p className="font-deca font-semibold text-[32px] leading-[28px] tracking-[0] text-[#0375F3]">
                    #{number}
                </p>
            </div>
        </div>
    );
};

const IntroSection = ({ number, title, content, image, contentPosition = 'left', hiddenLine = false, isActive = true }) => {
    const contentRef = useRef(null);
    const [isContentTall, setIsContentTall] = useState(false);

    useLayoutEffect(() => {
        if (!contentRef.current) return;
        const height = contentRef.current.offsetHeight || 0;
        if (height > 48) {
            setIsContentTall(true);
        } else {
            setIsContentTall(false);
        }
    }, [content]);
    return (
        <div className="flex flex-col gap-6">
            <div className="flex justify-between gap-8 2xl:gap-[160px]">
                <div className={`w-[308px] ${contentPosition === 'left' ? 'order-1' : 'order-2'}`}>
                    <div className="relative left-[-15px]" >
                        <BulletNumber number={number} isActive={isActive} />
                    </div>
                    <h3 className="font-deca font-semibold text-[24px] leading-[32px] tracking-[0] text-[#101828] text-left capitalize">
                        {title}
                    </h3>
                    <p
                        ref={contentRef}
                        className="mt-3 font-deca font-normal text-[16px] leading-[24px] tracking-[0] text-justify text-[#475467] opacity-50"
                    >
                        {content}
                    </p>
                </div>
                <div className={`flex-shrink-0 ${contentPosition === 'left' ? 'order-2' : 'order-1'}`}>
                    <Image
                        src={image}
                        alt="image"
                        width={300}
                        height={300}
                        className="w-[300px] h-[300px] object-contain"
                    />
                </div>
            </div>

            {!hiddenLine && (
                <div className={`relative h-[0px] w-full ${isContentTall ? '' : 'mt-[-20px]'}`}>
                    <div className={`absolute inset-0 flex items-center justify-center pointer-events-none`}>
                        <svg
                            width="459"
                            height="195"
                            viewBox="0 0 459 195"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="max-w-[459px] w-full h-auto"
                            style={{ transform: contentPosition === 'left' ? 'scaleX(-1)' : 'none' }}
                        >
                            <path
                                d="M458.5 0V87C458.5 93.6274 453.127 99 446.5 99H12.5C5.87259 99 0.5 104.373 0.5 111V195"
                                stroke="black"
                                strokeDasharray="6 6"
                            />
                        </svg>
                    </div>
                </div>
            )}

        </div>
    );
};