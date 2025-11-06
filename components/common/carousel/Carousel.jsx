import Image from "next/image";
import { useRef, useState } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { twMerge } from "tailwind-merge";
const Carousel = ({ lisTemItem }) => {
    const swiperRef = useRef(null);
    const [isBeginning, setIsBeginning] = useState(true);
    const [isEnd, setIsEnd] = useState(false);

    //xử lý custom-swiper-pagination
    const updateNavState = (swiper) => {
        setIsBeginning(swiper.isBeginning);
        setIsEnd(swiper.isEnd);
    };

    return (
        <div className="relative">
            {/* Custom arrows */}
            <div className="swiper-button-prev-custom left-4 absolute top-[40%] z-10 -translate-y-1/2 transition-all">
                <button
                    className={twMerge(
                        "p-2 bg-[#EBF5FF] rounded-full text-[#25387A] disabled:opacity-50",
                        isBeginning ? "opacity-50 pointer-events-none" : "opacity-100"
                    )}
                >
                    <FaArrowLeft />
                </button>
            </div>
            <div className="swiper-button-next-custom right-4 absolute top-[40%] z-10 -translate-y-1/2 transition-all ">
                <button
                    className={twMerge(
                        "p-2 bg-[#EBF5FF] rounded-full text-[#25387A] disabled:opacity-50",
                        isEnd ? "opacity-50 pointer-events-none" : "opacity-100"
                    )}
                >
                    <FaArrowRight />
                </button>
            </div>
            <Swiper
                slidesPerView={1}
                spaceBetween={30}
                loop={false}
                pagination={{
                    // clickable: true,
                    el: ".custom-swiper-pagination",
                    clickable: true,
                    renderBullet: (index, className) => {
                        return `<span class="${className} custom-dot"></span>`;
                    },
                }}
                // navigation={true}
                navigation={{
                    prevEl: ".swiper-button-prev-custom",
                    nextEl: ".swiper-button-next-custom",
                }}
                modules={[Pagination, Navigation]}
                className="mySwiper"
                //xử lý custom-swiper-pagination
                onInit={(swiper) => {
                    swiperRef.current = swiper;
                    updateNavState(swiper); // initial state
                }}
                onSlideChange={(swiper) => {
                    updateNavState(swiper);
                }}
            >
                {lisTemItem?.image_url?.map((item, index) => (
                    <SwiperSlide key={index}>
                        <div className="w-full flex flex-row justify-center">
                            <div className="flex flex-row justify-center gap-x-3 rounded-lg border border-[#DDDDE2] max-w-[500px] overflow-hidden">
                                <div className="">
                                    <Image
                                        alt={`tem-${index + 1}`}
                                        src={item}
                                        width={600}
                                        height={600}
                                        className="w-[400px] h-[250px]"
                                        loading="eager"
                                    />
                                </div>
                            </div>
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
            <div className="custom-swiper-pagination flex justify-center gap-1 mt-2" />
        </div>
    );
};

export default Carousel;
