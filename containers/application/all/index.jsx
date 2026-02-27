import Skeleton from '@/components/common/skeleton/Skeleton';
import NoData from '@/components/UI/noData/nodata';
import { useApplicationSearch } from '@/context/application/ApplicationSearchContext';
import { ApplicationInstallProvider, useApplicationInstall } from '@/context/application/ApplicationInstallContext';
import { useGetParcel } from '@/managers/api/parcel/useGetParcel';
import { useInstallParcel } from '@/managers/api/parcel/useInstallParcel';
import { axiosCustom } from '@/services/axios';
import { useCheckModuleInstall } from '@/hooks/useCheckModuleInstall';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import PopupInstallCompleted from './components/PopupInstallCompleted';
import PopupPayment from './components/PopupPayment';
import PopupPaymentSuccess from './components/PopupPaymentSuccess';
import PiceworkIntroPopup from './components/PopupPiceworkIntro';
import PopupProcessInstall from './components/PopupProcessInstall';
import formatMoney from '@/utils/helpers/formatMoney';
import { useQueryClient } from '@tanstack/react-query';

const IMAGE_COMING_SOON = '/application/comming-soon.png';
const IMAGE_INSTALLED = '/application/installed.png';

const BTN_ACTION = {
    install: 'install',
    install_free: 'install_free',
    installed: 'installed'
}


function ApplicationAllInner(props) {
    const { dataLang } = props;
    const router = useRouter();
    const { debouncedSearch } = useApplicationSearch();
    const [isOpenPiceworkIntro, setIsOpenPiceworkIntro] = useState(false);
    const [isOpenPayment, setIsOpenPayment] = useState(false);
    const [isOpenPaymentSuccess, setIsOpenPaymentSuccess] = useState(false);
    const [isOpenProcessInstall, setIsOpenProcessInstall] = useState(false);
    const [isOpenInstallCompleted, setIsOpenInstallCompleted] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    const [paymentData, setPaymentData] = useState(null);

    const { setFeatureName } = useApplicationInstall();
    const queryClient = useQueryClient();
    const { checkIntroduce } = useCheckModuleInstall();
    const authState = useSelector(state => state.auth);

    // Hàm helper để lấy link với kiểm tra introduce
    const getLinkWithIntroduce = (originalLink) => {
        // Chỉ áp dụng cho module lương sản lượng
        // if (!originalLink?.startsWith('/piecework-wage')) {
        //     return originalLink;
        // }

        // Kiểm tra nếu chưa giới thiệu, redirect đến introduction page với tab đầu tiên
        if (!checkIntroduce('luong-san-luong')) {
            return `/piecework-wage/introduction?module=luong-san-luong&tab=danh-sach-to-nhom`;
        }

        return originalLink;
    };

    const { installParcel, isLoading: isLoadingInstallParcel } = useInstallParcel({
        onSuccess: async (res) => {
            // API install_parcel trả về { success, need_payment, qr, url_install, message }
            if (!res?.success) return;

            // Trường hợp cần thanh toán qua QR/bank
            if (res.need_payment && res.qr) {
                setPaymentData(res);
                setIsOpenPiceworkIntro(false);
                setIsOpenPayment(true);
                return;
            }

            // Trường hợp không cần thanh toán nhưng có url_install: gọi GET để hoàn tất cài đặt
            if (!res.need_payment && res.url_install) {
                try {
                    await axiosCustom('GET', res.url_install, {});
                } catch (error) {
                    // Có thể log nếu cần, nhưng vẫn cho chạy tiếp flow cài đặt
                    console.error('Error calling url_install:', error);
                }
            }

            // Sau khi xử lý xong (có hoặc không url_install), chuyển sang bước cài đặt
            setIsOpenPiceworkIntro(false);
            setIsOpenProcessInstall(true);
        },
    });


    // Lấy id_category từ query param tab_id, mặc định là 0
    const idCategory = useMemo(() => {
        const tabId = router.query.tab_id;
        return tabId ? Number(tabId) : 0;
    }, [router.query.tab_id]);

    const { data: dataParcel, isLoading: isLoadingParcel, refetch: refetchParcel } = useGetParcel({
        enabled: true,
        params: {
            id_category: idCategory,
            search: debouncedSearch || undefined
        },
    });

    // Map dữ liệu từ API về cấu trúc cardsData
    const cardsData = useMemo(() => {
        if (!dataParcel?.success || !dataParcel?.data || !Array.isArray(dataParcel.data)) {
            return [];
        }

        return dataParcel.data.map((item) => {
            // status = 1: đã ra mắt, status = 2: sắp ra mắt
            const isComingSoon = item.status === '2';
            const isInstalledFromApi = Number(item.is_use) == 1;

            // type = free: miễn phí, type = charge: tính phí, type = contact: liên hệ
            const isFree = item.type === 'free';
            const isCharge = item.type === 'charge';
            const isContact = item.type === 'contact';

            // Xác định btnLabel và btnAction dựa trên type và status
            let btnLabel = 'Bắt đầu quản lý';
            let btnAction = BTN_ACTION.install;
            let btnType = 'primary';
            let btnLink = null;
            let disableBtn = false;

            if (isComingSoon) {
                // Sắp ra mắt
                btnLabel = 'Trải nghiệm thêm';
                disableBtn = true;
            } else if (isContact) {
                // Liên hệ
                btnLabel = 'Liên hệ báo giá';
                btnType = 'outline';
                btnLink = 'https://zalo.me/fososoft';
                btnAction = null;
            } else if (isCharge) {
                // Tính phí
                btnLabel = 'Bắt đầu quản lý';
                btnType = 'primary';
                btnAction = BTN_ACTION.install;
            } else if (isFree) {
                // Miễn phí
                btnLabel = 'Bắt đầu quản lý';
                btnAction = BTN_ACTION.install_free;
                btnType = 'primary';
            }


            if (isInstalledFromApi) {
                btnLink = item.link_url;
            }

            return {
                id: item.id,
                title: item.name,
                description: item.content,
                content: item.content, // Lưu content để truyền vào popup
                introduce: item.introduce, // Nội dung tab Giới thiệu
                directing: item.directing, // Nội dung tab Hướng dẫn
                imageSrc: item.image,
                price: item.price,
                bgColor: '#E4EFFF',
                btnLabel,
                btnType,
                btnAction,
                btnLink,
                disableBtn,
                isComingSoon,
                isInstalled: isInstalledFromApi,
                type: item.type,
            };
        });
    }, [dataParcel]);

    const cards = useMemo(() => {
        return cardsData.map((card) => {
            // Cập nhật btnLink với logic check introduce nếu có btnLink
            const updatedBtnLink = card.isInstalled ? getLinkWithIntroduce(card.btnLink) : card.btnLink;

            return {
                ...card,
                btnLabel: card.isInstalled ? 'Mở' : card.btnLabel,
                btnAction: card.isInstalled ? BTN_ACTION.installed : card.btnAction,
                btnLink: updatedBtnLink,
            };
        });
    }, [cardsData]);

    const handleOpenPayment = (type = 'free') => {
        if (!selectedCard) return;

        installParcel(selectedCard.id);
    };

    const handlePaymentSuccess = () => {
        setIsOpenPayment(false);
        setIsOpenPaymentSuccess(true);
    };

    const handleClosePaymentSuccess = () => {
        setIsOpenPaymentSuccess(false);
        setIsOpenProcessInstall(true);
    };

    const handleProcessInstallComplete = () => {
        setIsOpenProcessInstall(false);
        setIsOpenInstallCompleted(true);
        refetchParcel();
    };

    // Khi bấm "Bắt đầu trải nghiệm" ở popup hoàn tất cài đặt
    // → tìm link trong authState.parcel_use theo id của selectedCard và chuyển trang
    const handleInstallCompletedStart = () => {
        if (!selectedCard) {
            setIsOpenInstallCompleted(false);
            return;
        }

        const parcelList = authState?.parcel_use || [];
        const parcelItem = parcelList.find(
            item => String(item.id) === String(selectedCard.id)
        );

        if (!parcelItem) {
            setIsOpenInstallCompleted(false);
            return;
        }

        // Nếu chưa xem giới thiệu (introduce === "0") và có link_introduce → ưu tiên đi vào trang giới thiệu
        const targetLink =
            parcelItem.introduce === '0' && parcelItem.link_introduce
                ? parcelItem.link_introduce
                : parcelItem.link_url;

        if (targetLink) {
            router.push(targetLink);
        }

        setIsOpenInstallCompleted(false);
    };

    const handleBtnAction = (action, card = null) => {
        if (card) {
            setSelectedCard(card);
            if (card?.title) {
                setFeatureName(card.title);
            }
        }
        if (action === BTN_ACTION.install_free) {
            setIsOpenPiceworkIntro(true);
        }
        if (action === BTN_ACTION.install) {
            setIsOpenPiceworkIntro(true);
        }
        if (action === BTN_ACTION.installed) {
        }
    }

    const handleCardClick = (card) => {
        if (!card) return;
        if (card.disableBtn) return;
        setSelectedCard(card);
        if (card?.title) {
            setFeatureName(card.title);
        }
        setIsOpenPiceworkIntro(true);
    };

    const handleCardButtonClick = (action, card) => {
        handleBtnAction(action, card);
    };



    return (
        <div className='w-full'>
            <Head>
                <title>{'Tất cả ứng dụng'}</title>
            </Head>

            {isLoadingParcel ? (
                // Skeleton loading
                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div
                            key={`skeleton-card-${index}`}
                            className="relative flex h-full flex-col gap-[22px] rounded-[36px] border-white/60 bg-white p-4 shadow-sm"
                            style={{ backgroundColor: '#E4EFFF' }}
                        >
                            {/* Image skeleton */}
                            <div className="flex justify-center w-full">
                                <Skeleton className="h-[136px] w-[136px] rounded-full" />
                            </div>

                            {/* Content skeleton */}
                            <div className="flex flex-1 flex-col pt-[22px] gap-3">
                                <Skeleton className="h-7 w-3/4 rounded" />
                                <Skeleton className="h-4 w-full rounded" />
                                <Skeleton className="h-4 w-5/6 rounded" />
                                <Skeleton className="h-4 w-4/6 rounded" />

                                {/* Button skeleton */}
                                <div className="mt-5 flex justify-end">
                                    <Skeleton className="h-10 w-32 rounded-[40px]" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : cards.length === 0 ? (
                // No data
                <NoData type="table" className="min-h-[400px]" />
            ) : (
                // Cards
                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 h-full'>
                    {cards.map((card, index) => (
                        <div
                            key={index}
                            className="relative flex min-h-0 h-full flex-col gap-[22px] rounded-[36px] border-white/60  p-4 shadow-sm cursor-pointer"
                            style={{ backgroundColor: card.bgColor }}
                            onClick={() => handleCardClick(card)}
                        >
                            {card.isComingSoon ? (
                                <div className="absolute top-0 left-0">
                                    <Image src={IMAGE_COMING_SOON} alt="coming soon" className="w-[110px] h-[31px]" width={200} height={31} />
                                </div>
                            ) : null}
                            {card.isInstalled ? (
                                <div className="absolute top-0 left-0">
                                    <Image src={IMAGE_INSTALLED} alt="installed" className="w-[110px] h-[31px]" width={200} height={31} />
                                </div>
                            ) : null}
                            <div className="flex-1 flex flex-col justify-center">
                                <div className="flex justify-center w-full">
                                    <div
                                        className=" h-[136px] w-[136px] items-center justify-center rounded-full "
                                        style={{ boxShadow: card.imageShadow }}
                                    >
                                        <Image
                                            src={card.imageSrc}
                                            alt={card.title}
                                            width={136}
                                            height={136}
                                            className="object-contain w-full h-full"
                                        />
                                    </div>
                                </div>

                                <div className="min-h-0 flex flex-1 flex-col pt-[22px]">
                                    <h3 className="text-[20px] font-semibold leading-7 tracking-tight text-slate-900 capitalize">
                                        {card.title}
                                    </h3>

                                    <p className="pt-3 text-sm font-normal leading-5 text-[#141522] text-justify opacity-50">
                                        {card.description}
                                    </p>
                                    {/* Giá / Miễn phí */}
                                    {card.price != null && card.type !== 'contact' && (
                                        <p className="pt-2 font-deca font-medium text-[16px] leading-6 tracking-[0] text-[#0375F3]">
                                            {(() => {
                                                const numericPrice = Number(card.price) || 0;
                                                if (card.type === 'free' || numericPrice <= 0) {
                                                    return 'Miễn phí';
                                                }
                                                return `${formatMoney(numericPrice, null)} đ`;
                                            })()}
                                        </p>
                                    )}
                                    <div className="mt-auto pt-5 flex justify-end">
                                        <ButtonAction
                                            type={card.btnType}
                                            label={card.btnLabel}
                                            disable={card.disableBtn}
                                            btnLink={card.btnLink}
                                            btnAction={card.btnAction}
                                            onActionClick={(action) => handleCardButtonClick(action, card)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className="pt-12"></div>


            {/* ===== Popup ===== */}
            {/* Popup Picework Intro */}
            <PiceworkIntroPopup
                isOpen={isOpenPiceworkIntro}
                onClose={() => {
                    setIsOpenPiceworkIntro(false);
                    setSelectedCard(null);
                }}
                onOpenPayment={handleOpenPayment}
                closeOnBackdropClick={false}
                title={selectedCard?.title}
                content={selectedCard?.content}
                introduce={selectedCard?.introduce}
                directing={selectedCard?.directing}
                image={selectedCard?.imageSrc}
                price={selectedCard?.price}
                type={selectedCard?.type}
                isInstalled={selectedCard?.isInstalled}
                appLink={selectedCard?.btnLink}
                isComingSoon={selectedCard?.isComingSoon}
            />

            {/* Popup payment */}
            <PopupPayment
                isOpen={isOpenPayment}
                onClose={() => setIsOpenPayment(false)}
                onPaymentSuccess={handlePaymentSuccess}
                closeOnBackdropClick={false}
                paymentData={paymentData}
            />

            {/* Popup successful payment */}
            <PopupPaymentSuccess
                isOpen={isOpenPaymentSuccess}
                onClose={handleClosePaymentSuccess}
                closeOnBackdropClick={false}

            />

            {/* Popup process install */}
            <PopupProcessInstall
                isOpen={isOpenProcessInstall}
                onClose={() => setIsOpenProcessInstall(false)}
                onComplete={handleProcessInstallComplete}
                closeOnBackdropClick={false}
            />

            {/* Popup install completed */}
            <PopupInstallCompleted
                isOpen={isOpenInstallCompleted}
                onClose={() => { setIsOpenInstallCompleted(false) }}
                onStart={handleInstallCompletedStart}
                closeOnBackdropClick={false}
            />
        </div>
    );
}

export default function ApplicationAll(props) {
    return (
        <ApplicationInstallProvider>
            <ApplicationAllInner {...props} />
        </ApplicationInstallProvider>
    );
}


const ButtonAction = ({ type = 'primary', label, disable = false, btnLink, btnAction, onActionClick }) => {
    const handleClick = () => {
        if (disable) return;
        if (btnAction && typeof onActionClick === 'function') {
            onActionClick(btnAction);
            return;
        }

        if (btnLink) {
            if (typeof window !== 'undefined') {
                window.open(btnLink, '_blank');
            }
            return;
        }


    };

    if (type === 'secondary') {
        // Nút cam gradient - "Sắp ra mắt"
        return (
            <button
                type="button"
                className="inline-flex items-center rounded-[40px] border border-[#899CFD] bg-[#0375F3]  px-6 py-3.5 text-sm font-semibold text-white shadow-none transition-all duration-200 hover:bg-[#0A7FFF] hover:shadow-[0_8px_20px_rgba(3,117,243,0.25)]"
                onClick={(e) => {
                    e.stopPropagation();
                    handleClick();
                }}
                disabled={disable}
            >
                {label}
            </button>
        );
    }

    if (type === 'outline') {
        // Nút viền xanh - "Liên hệ báo giá"
        return (
            <button
                type="button"
                className="inline-flex items-center gap-2 rounded-[40px] border border-transparent bg-[#EAF2FF] px-2 py-2 text-sm font-semibold text-[#0375F3] shadow-none ring-1 ring-[#0375F3]/40 transition-all duration-200 hover:bg-[#F0F7FF] hover:shadow-[0_6px_16px_rgba(3,117,243,0.15)] active:scale-95"
                onClick={(e) => {
                    e.stopPropagation();
                    handleClick();
                }}
                disabled={disable}
            >
                <span className="pl-[12px]">{label}</span>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="32" height="32" rx="16" fill="#0375F3" />
                    <path d="M21.938 11V19.125C21.938 19.3736 21.8392 19.6121 21.6634 19.7879C21.4876 19.9637 21.2491 20.0625 21.0005 20.0625C20.7518 20.0625 20.5134 19.9637 20.3375 19.7879C20.1617 19.6121 20.063 19.3736 20.063 19.125V13.2656L11.6637 21.6633C11.4876 21.8394 11.2487 21.9383 10.9997 21.9383C10.7506 21.9383 10.5117 21.8394 10.3356 21.6633C10.1595 21.4872 10.0605 21.2483 10.0605 20.9992C10.0605 20.7501 10.1595 20.5113 10.3356 20.3352L18.7348 11.9375H12.8755C12.6268 11.9375 12.3884 11.8387 12.2125 11.6629C12.0367 11.4871 11.938 11.2486 11.938 11C11.938 10.7514 12.0367 10.5129 12.2125 10.3371C12.3884 10.1613 12.6268 10.0625 12.8755 10.0625H21.0005C21.2491 10.0625 21.4876 10.1613 21.6634 10.3371C21.8392 10.5129 21.938 10.7514 21.938 11Z" fill="#EAF2FF" />
                </svg>
            </button>
        );
    }

    // Nút xanh primary - "Trải nghiệm thêm"
    return (
        <button
            type="button"
            className="inline-flex items-center gap-2 rounded-[40px] border border-[#899CFD] bg-[#0375F3] px-2 py-2 text-sm font-semibold text-white shadow-none transition-all duration-200 hover:bg-[#0A7FFF] hover:shadow-[0_8px_20px_rgba(3,117,243,0.3)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            onClick={(e) => {
                e.stopPropagation();
                handleClick();
            }}
            disabled={disable}
        >
            <span className="pl-[12px]">{label}</span>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="16" fill="white" />
                <path d="M21.938 11V19.125C21.938 19.3736 21.8392 19.6121 21.6634 19.7879C21.4876 19.9637 21.2491 20.0625 21.0005 20.0625C20.7518 20.0625 20.5134 19.9637 20.3375 19.7879C20.1617 19.6121 20.063 19.3736 20.063 19.125V13.2656L11.6637 21.6633C11.4876 21.8394 11.2487 21.9383 10.9997 21.9383C10.7506 21.9383 10.5117 21.8394 10.3356 21.6633C10.1595 21.4872 10.0605 21.2483 10.0605 20.9992C10.0605 20.7501 10.1595 20.5113 10.3356 20.3352L18.7348 11.9375H12.8755C12.6268 11.9375 12.3884 11.8387 12.2125 11.6629C12.0367 11.4871 11.938 11.2486 11.938 11C11.938 10.7514 12.0367 10.5129 12.2125 10.3371C12.3884 10.1613 12.6268 10.0625 12.8755 10.0625H21.0005C21.2491 10.0625 21.4876 10.1613 21.6634 10.3371C21.8392 10.5129 21.938 10.7514 21.938 11Z" fill="#206AFF" />
            </svg>
        </button>
    );
};