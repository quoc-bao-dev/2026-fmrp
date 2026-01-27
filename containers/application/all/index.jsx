import Head from 'next/head';
import Image from 'next/image';
import ApplicationLayout from '../components/ApplicationLayout';

const cards = [
    {
        title: 'Lương sản lượng',
        description: 'Thống kê lương và giờ làm của công nhân dựa trên sản lượng thực tế, giúp doanh nghiệp tính lương chính xác, minh bạch và nhanh chóng.',
        imageSrc: '/application/card-1.png',
        bgColor: '#E4EFFF',
        imageShadow: '0 0 80px rgba(89, 132, 255, 0.55)',
        btnLabel: 'Trải nghiệm thêm',
        type: 'primary',
    },
    {
        title: 'Gia công ngoài',
        description: 'Thống kê lương và giờ làm của công nhân dựa trên sản lượng thực tế, giúp doanh nghiệp tính lương chính xác, minh bạch và nhanh chóng.',
        imageSrc: '/application/card-2.png',
        bgColor: '#FFEBE8',
        imageShadow: '0 0 80px rgba(250, 148, 132, 0.55)',
        btnLabel: 'Sắp ra mắt',
        type: 'secondary',
    },
    {
        title: 'API phần mềm kế toán Misa',
        description: 'Thống kê lương và giờ làm của công nhân dựa trên sản lượng thực tế, giúp doanh nghiệp tính lương chính xác, minh bạch và nhanh chóng.',
        imageSrc: '/application/card-3.png',
        bgColor: '#E2F5E5',
        imageShadow: '0 0 80px rgba(43, 179, 138, 0.55)',
        btnLabel: 'Liên hệ báo giá',
        type: 'outline',
    },
];

export default function ApplicationAll(props) {
    const { dataLang } = props;

    return (
        <ApplicationLayout>
            <div className='w-full'>
                <Head>
                    <title>{dataLang?.all || 'Tất cả'}</title>
                </Head>

                <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
                    {cards.map((card, index) => (
                        <div
                            key={index}
                            className="flex h-full flex-col gap-[22px] rounded-[36px] border-white/60 bg-white p-4 shadow-sm"
                            style={{ backgroundColor: card.bgColor }}
                        >
                            <div className="flex flex-col justify-center">
                                <div className="flex justify-center w-full">
                                    <div
                                        className=" h-[136px] w-[136px] items-center justify-center rounded-full border-[12px] border-white"
                                        style={{ boxShadow: card.imageShadow }}
                                    >
                                        <Image
                                            src={card.imageSrc}
                                            alt={card.title}
                                            width={136}
                                            height={136}
                                            className="object-contain"
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
                                        <ButtonAction type={card.type} label={card.btnLabel} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </ApplicationLayout>
    );
}


// 

const ButtonAction2 = () => {


    return (

        <div className="">
            {/* type 1 */}
            <button
            // gap: 4px;
            // angle: 0 deg;
            // opacity: 1;
            // border-radius: 40px;
            // padding: 8px;
            // border-width: 0.5px;
            // bg-#0375F3
            // border: 0.5px solid #899CFD
            >
                <p className=""
                // font-family: Lexend Deca;
                // font-weight: 600;
                // font-style: SemiBold;
                // font-size: 16px;
                // leading-trim: NONE;
                // line-height: 150%;
                // letter-spacing: 0%;
                // text-align: center;

                >
                    Trải nghiệm thêm
                </p>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="32" height="32" rx="16" fill="white" />
                    <path d="M21.938 11V19.125C21.938 19.3736 21.8392 19.6121 21.6634 19.7879C21.4876 19.9637 21.2491 20.0625 21.0005 20.0625C20.7518 20.0625 20.5134 19.9637 20.3375 19.7879C20.1617 19.6121 20.063 19.3736 20.063 19.125V13.2656L11.6637 21.6633C11.4876 21.8394 11.2487 21.9383 10.9997 21.9383C10.7506 21.9383 10.5117 21.8394 10.3356 21.6633C10.1595 21.4872 10.0605 21.2483 10.0605 20.9992C10.0605 20.7501 10.1595 20.5113 10.3356 20.3352L18.7348 11.9375H12.8755C12.6268 11.9375 12.3884 11.8387 12.2125 11.6629C12.0367 11.4871 11.938 11.2486 11.938 11C11.938 10.7514 12.0367 10.5129 12.2125 10.3371C12.3884 10.1613 12.6268 10.0625 12.8755 10.0625H21.0005C21.2491 10.0625 21.4876 10.1613 21.6634 10.3371C21.8392 10.5129 21.938 10.7514 21.938 11Z" fill="#206AFF" />
                </svg>

            </button>

            {/* type 2 */}
            <button className=""
            // gap: 4px;
            // angle: 0 deg;
            // opacity: 1;
            // border-radius: 40px;
            // padding: 8px;
            // border-width: 0.5px;
            // background: linear-gradient(75.76deg, #F3654A 58.94%, #FFB9AC 88.4%);
            // border: 0.5px solid #FAC1B7
            >
                <p className="">
                    Sắp ra mắt
                </p>
            </button>

            {/* type 3 */}
            <button
            // gap: 4px;
            // angle: 0 deg;
            // opacity: 1;
            // border-radius: 40px;
            // padding: 8px;
            // border-width: 1px;
            // background: var(--50, #EAF2FF);
            // border: 1px solid;

            // border-image-source: linear-gradient(84.59deg, #0375F3 29.4%, #BEDDFF 92.54%);


            >
                <p
                // #0375F3
                >
                    Liên hệ báo giá
                </p>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="32" height="32" rx="16" fill="#0375F3" />
                    <path d="M21.938 11V19.125C21.938 19.3736 21.8392 19.6121 21.6634 19.7879C21.4876 19.9637 21.2491 20.0625 21.0005 20.0625C20.7518 20.0625 20.5134 19.9637 20.3375 19.7879C20.1617 19.6121 20.063 19.3736 20.063 19.125V13.2656L11.6637 21.6633C11.4876 21.8394 11.2487 21.9383 10.9997 21.9383C10.7506 21.9383 10.5117 21.8394 10.3356 21.6633C10.1595 21.4872 10.0605 21.2483 10.0605 20.9992C10.0605 20.7501 10.1595 20.5113 10.3356 20.3352L18.7348 11.9375H12.8755C12.6268 11.9375 12.3884 11.8387 12.2125 11.6629C12.0367 11.4871 11.938 11.2486 11.938 11C11.938 10.7514 12.0367 10.5129 12.2125 10.3371C12.3884 10.1613 12.6268 10.0625 12.8755 10.0625H21.0005C21.2491 10.0625 21.4876 10.1613 21.6634 10.3371C21.8392 10.5129 21.938 10.7514 21.938 11Z" fill="#EAF2FF" />
                </svg>

            </button>
        </div>
    )
}

const ButtonAction = ({ type = 'primary', label }) => {
    if (type === 'secondary') {
        // Nút cam gradient - "Sắp ra mắt"
        return (
            <button
                type="button"
                className="inline-flex items-center rounded-[40px] border border-[#FAC1B7] bg-gradient-to-r from-[#F3654A] to-[#FFB9AC] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(243,101,74,0.45)] transition-all duration-200 hover:shadow-[0_14px_32px_rgba(243,101,74,0.6)] hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-[#F3654A]/60 focus:ring-offset-2"
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
                className="inline-flex items-center gap-2 rounded-[40px] border border-transparent bg-[#EAF2FF] px-6 py-3 text-sm font-semibold text-[#0375F3] shadow-none ring-1 ring-[#0375F3]/40 transition-all duration-200 hover:bg-white hover:shadow-[0_10px_25px_rgba(3,117,243,0.28)]"
            >
                <span>{label}</span>
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
            className="inline-flex items-center gap-2 rounded-[40px] border border-[#899CFD] bg-[#0375F3] px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(3,117,243,0.45)] transition-all duration-200 hover:bg-[#0263de] hover:shadow-[0_14px_32px_rgba(3,117,243,0.6)] focus:outline-none focus:ring-2 focus:ring-[#0375F3]/70 focus:ring-offset-2"
        >
            <span>{label}</span>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="16" fill="white" />
                <path d="M21.938 11V19.125C21.938 19.3736 21.8392 19.6121 21.6634 19.7879C21.4876 19.9637 21.2491 20.0625 21.0005 20.0625C20.7518 20.0625 20.5134 19.9637 20.3375 19.7879C20.1617 19.6121 20.063 19.3736 20.063 19.125V13.2656L11.6637 21.6633C11.4876 21.8394 11.2487 21.9383 10.9997 21.9383C10.7506 21.9383 10.5117 21.8394 10.3356 21.6633C10.1595 21.4872 10.0605 21.2483 10.0605 20.9992C10.0605 20.7501 10.1595 20.5113 10.3356 20.3352L18.7348 11.9375H12.8755C12.6268 11.9375 12.3884 11.8387 12.2125 11.6629C12.0367 11.4871 11.938 11.2486 11.938 11C11.938 10.7514 12.0367 10.5129 12.2125 10.3371C12.3884 10.1613 12.6268 10.0625 12.8755 10.0625H21.0005C21.2491 10.0625 21.4876 10.1613 21.6634 10.3371C21.8392 10.5129 21.938 10.7514 21.938 11Z" fill="#206AFF" />
            </svg>
        </button>
    );
};