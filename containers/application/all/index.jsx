import { useGetParcel } from '@/managers/api/parcel/useGetParcel';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { useApplicationSearch } from '@/context/application/ApplicationSearchContext';
import Skeleton from '@/components/common/skeleton/Skeleton';
import NoData from '@/components/UI/noData/nodata';
import PopupInstallCompleted from './components/PopupInstallCompleted';
import PopupPayment from './components/PopupPayment';
import PopupPaymentSuccess from './components/PopupPaymentSuccess';
import PiceworkIntroPopup from './components/PopupPiceworkIntro';
import PopupProcessInstall from './components/PopupProcessInstall';

const IMAGE_COMING_SOON = '/application/comming-soon.png';
const IMAGE_INSTALLED = '/application/installed.png';

const BTN_ACTION = {
    install: 'install',
    install_free: 'install_free',
    installed: 'installed'
}


export default function ApplicationAll(props) {
    const { dataLang } = props;
    const router = useRouter();
    const { debouncedSearch } = useApplicationSearch();
    const [isOpenPiceworkIntro, setIsOpenPiceworkIntro] = useState(false);
    const [isOpenPayment, setIsOpenPayment] = useState(false);
    const [isOpenPaymentSuccess, setIsOpenPaymentSuccess] = useState(false);
    const [isOpenProcessInstall, setIsOpenProcessInstall] = useState(false);
    const [isOpenInstallCompleted, setIsOpenInstallCompleted] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);

    // Lấy id_category từ query param tab_id, mặc định là 0
    const idCategory = useMemo(() => {
        const tabId = router.query.tab_id;
        return tabId ? Number(tabId) : 0;
    }, [router.query.tab_id]);

    const { data: dataParcel, isLoading: isLoadingParcel } = useGetParcel({
        enabled: true,
        params: {
            id_category: idCategory,
            search: debouncedSearch || undefined
        },
        onSuccess: (data) => {
            console.log({ dataParcel: data });
        }
    });

    // Map dữ liệu từ API về cấu trúc cardsData
    const cardsData = useMemo(() => {
        if (!dataParcel?.success || !dataParcel?.data || !Array.isArray(dataParcel.data)) {
            return [];
        }

        return dataParcel.data.map((item) => {
            // status = 1: đã ra mắt, status = 2: sắp ra mắt
            const isComingSoon = item.status === '2';
            const isInstalledFromApi = item.is_use === 1;

            // type = free: miễn phí, type = charge: tính phí, type = contact: liên hệ
            const isFree = item.type === 'free';
            const isCharge = item.type === 'charge';
            const isContact = item.type === 'contact';

            // Xác định btnLabel và btnAction dựa trên type và status
            let btnLabel = 'Bắt đầu quản lý';
            let btnAction = BTN_ACTION.install;
            let type = 'primary';
            let btnLink = null;
            let disableBtn = false;

            if (isComingSoon) {
                // Sắp ra mắt
                btnLabel = 'Trải nghiệm thêm';
                disableBtn = true;
            } else if (isContact) {
                // Liên hệ
                btnLabel = 'Liên hệ báo giá';
                type = 'outline';
                btnLink = 'https://zalo.me/fososoft';
                btnAction = null;
            } else if (isCharge) {
                // Tính phí
                btnLabel = 'Bắt đầu quản lý';
                type = 'primary';
                btnAction = BTN_ACTION.install;
            } else if (isFree) {
                // Miễn phí
                btnLabel = 'Bắt đầu quản lý';
                btnAction = BTN_ACTION.install;
                type = 'primary';
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
                type,
                btnAction,
                btnLink,
                disableBtn,
                isComingSoon,
                isInstalled: isInstalledFromApi,
            };
        });
    }, [dataParcel]);

    const cards = useMemo(() => {
        return cardsData.map((card) => {
            return {
                ...card,
                btnLabel: card.isInstalled ? 'Mở' : card.btnLabel,
                btnAction: card.isInstalled ? BTN_ACTION.installed : card.btnAction,
            };
        });
    }, [cardsData]);

    const handleOpenPayment = () => {
        setIsOpenPiceworkIntro(false);
        setIsOpenPayment(true);
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
    };

    const handleBtnAction = (action, card = null) => {
        if (card) {
            setSelectedCard(card);
        }
        if (action === BTN_ACTION.install_free) {
            // open with type free
            setIsOpenPiceworkIntro(true);
        }
        if (action === BTN_ACTION.install) {
            setIsOpenPiceworkIntro(true);
        }
        if (action === BTN_ACTION.installed) {
        }
    }



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
                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
                    {cards.map((card, index) => (
                        <div
                            key={index}
                            className="relative flex h-full flex-col gap-[22px] rounded-[36px] border-white/60 bg-white p-4 shadow-sm cursor-pointer"
                            style={{ backgroundColor: card.bgColor }}
                            onClick={() => {
                                if (card.disableBtn) return;

                                if (card.btnLink) {
                                    if (typeof window !== 'undefined') {
                                        window.open(card.btnLink, '_blank', 'noopener,noreferrer');
                                    }
                                    return;
                                }
                                if (card.btnAction) {
                                    handleBtnAction(card.btnAction, card);
                                }
                            }}
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
                            <div className="flex flex-col justify-center">
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

                                <div className="flex flex-1 flex-col pt-[22px]">
                                    <h3 className="text-[20px] font-semibold leading-7 tracking-tight text-slate-900 capitalize">
                                        {card.title}
                                    </h3>

                                    <p className="pt-3 text-sm font-normal leading-5 text-[#141522] text-justify opacity-50">
                                        {card.description}
                                    </p>

                                    <div className="mt-5 flex justify-end">
                                        <ButtonAction
                                            type={card.type}
                                            label={card.btnLabel}
                                            disable={card.disableBtn}
                                            btnLink={card.btnLink}
                                            btnAction={card.btnAction}
                                            onActionClick={(action) => handleBtnAction(action, card)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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
            />

            {/* Popup payment */}
            <PopupPayment
                isOpen={isOpenPayment}
                onClose={() => setIsOpenPayment(false)}
                onPaymentSuccess={handlePaymentSuccess}
                closeOnBackdropClick={false}
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
            <PopupInstallCompleted isOpen={isOpenInstallCompleted} onClose={() => { setIsOpenInstallCompleted(false) }} closeOnBackdropClick={false} />
        </div>
    );
}


const ButtonAction = ({ type = 'primary', label, disable = false, btnLink, btnAction, onActionClick }) => {
    const handleClick = () => {
        if (disable) return;

        if (btnLink) {
            if (typeof window !== 'undefined') {
                window.open(btnLink, '_blank', 'noopener,noreferrer');
            }
            return;
        }

        if (btnAction && typeof onActionClick === 'function') {
            onActionClick(btnAction);
        }
    };

    if (type === 'secondary') {
        // Nút cam gradient - "Sắp ra mắt"
        return (
            <button
                type="button"
                className="inline-flex items-center rounded-[40px] border border-[#899CFD] bg-[#0375F3]  px-6 py-3.5 text-sm font-semibold text-white shadow-none transition-all duration-200 hover:bg-[#0A7FFF] hover:shadow-[0_8px_20px_rgba(3,117,243,0.25)]"
                onClick={handleClick}
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
                onClick={handleClick}
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
            onClick={handleClick}
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