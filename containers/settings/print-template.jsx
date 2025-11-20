import CheckThinIcon from '@/components/icons/common/CheckThinIcon';
import DocumentTemplateIcon from '@/components/icons/common/DocumentTemplateIcon';
import PrintTemplateIcon from '@/components/icons/common/PrintTemplateIcon';
import { useGetPrintConfig } from '@/managers/api/print/useGetPrintConfig';
import { useSetPrintConfig } from '@/managers/api/print/useSetPrintConfig';
import Head from 'next/head';
import Image from 'next/image';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa6';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import SettingLayout from './components/SettingLayout';
import { TemplateChecklistIcon } from '@/components/icons';

const PrintTemplate = props => {
  const dataLang = props.dataLang;
  const [activeTab, setActiveTab] = useState('print_lsx'); // 'production-order', 'finished-product', 'material'

  const { data: printConfig, isLoading: isLoadingPrintConfig } = useGetPrintConfig();
  const { setPrintConfig, isLoading: isSaving } = useSetPrintConfig();

  const listTemplate = useMemo(() => {
    if (!printConfig) return [];
    return printConfig.data[0][activeTab] || [];
  }, [printConfig, activeTab]);

  const swiperRef = useRef(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const message = {
    print_lsx: {
      title: 'Chọn mẫu lệnh sản xuất',
      description: 'Kéo sang ngang và dừng ở mẫu lệnh sản xuất mà bạn muốn chọn, bấm “Chọn mẫu” để sử dụng',
    },
    print_tem: {
      title: 'Chọn mẫu tem thành phẩm',
      description: 'Kéo sang ngang và dừng ở mẫu tem thành phẩm mà bạn muốn chọn, bấm “Chọn mẫu” để sử dụng',
    },
    print_tem_nvl: {
      title: 'Chọn mẫu tem NVL',
      description: 'Kéo sang ngang và dừng ở mẫu tem NVL mà bạn muốn chọn, bấm “Chọn mẫu” để sử dụng',
    },
  };

  const updateNavState = swiper => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  // Reset slide về 0 khi danh sách template thay đổi (vd: đổi tab)
  useEffect(() => {
    setActiveIndex(0);
    if (swiperRef.current) {
      try {
        swiperRef.current.slideTo(0, 0);
      } catch (e) {
        // ignore nếu swiper chưa sẵn sàng
      }
    }
  }, [listTemplate?.length]);

  const handleSetPrintConfig = isSelected => async () => {
    if (isSelected) return;
    const current = listTemplate?.[activeIndex];

    console.log(current);

    if (!current?.id) return;
    // Xác định key payload theo tab đang active
    const payloadKey = activeTab === 'print_lsx' ? 'config_print_lsx' : activeTab === 'print_tem' ? 'config_print_tem' : 'config_print_tem_nvl';
    await setPrintConfig({ [payloadKey]: current.id });
  };

  return (
    <React.Fragment>
      <Head>
        <title>Thiết lập mẫu in</title>
      </Head>
      <SettingLayout
        dataLang={dataLang}
        breadcrumb={
          <>
            <h6 className='text-[#141522]/40'>{dataLang?.branch_seting || 'branch_seting'}</h6>
            <span className='text-[#141522]/40'>/</span>
            <h6>Thiết lập mẫu in</h6>
          </>
        }
      >
        <div className='2xl:space-y-7'>
          <h2 className=' 2xl:text-lg text-base text-[#52575E] capitalize'>Thiết lập mẫu in</h2>
          <div className='grid grid-cols-3 gap-4 p-3 rounded-lg h-[calc(100vh-200px)]'>
            {/* ========= Tab ========= */}
            <div className='col-span-1 border-r border-gray-100 pr-8 flex flex-col gap-3'>
              <div
                onClick={() => setActiveTab('print_lsx')}
                className={`cursor-pointer p-3 rounded-lg flex gap-2 items-center shadow-[0px_1px_4px_0px_rgba(0,0,0,0.05)] hover:shadow-[0px_1px_8px_0px_rgba(0,0,0,0.05)] transition-all duration-300 ${
                  activeTab === 'print_lsx' ? 'bg-[#E2F0FE] text-[#0375F3]' : 'bg-white text-[#141522] hover:bg-gray-50/80'
                }`}
              >
                <TemplateChecklistIcon className='size-5 text-[#0375F3]' />
                <p className='text-sm font-medium'>Cài đặt mẫu lệnh sản xuất</p>
              </div>
              <div
                onClick={() => setActiveTab('print_tem')}
                className={`cursor-pointer p-3 rounded-lg flex gap-2 items-center shadow-[0px_1px_4px_0px_rgba(0,0,0,0.05)] hover:shadow-[0px_1px_8px_0px_rgba(0,0,0,0.05)] transition-all duration-300 ${
                  activeTab === 'print_tem' ? 'bg-[#E2F0FE] text-[#0375F3]' : 'bg-white text-[#141522] hover:bg-gray-50/80'
                }`}
              >
                <PrintTemplateIcon className='size-5 text-[#0375F3]' />
                <p className='text-sm font-medium'>Cài đặt mẫu tem thành phẩm</p>
              </div>
              <div
                onClick={() => setActiveTab('print_tem_nvl')}
                className={`cursor-pointer p-3 rounded-lg flex gap-2 items-center shadow-[0px_1px_4px_0px_rgba(0,0,0,0.05)] hover:shadow-[0px_1px_8px_0px_rgba(0,0,0,0.05)] transition-all duration-300 ${
                  activeTab === 'print_tem_nvl' ? 'bg-[#E2F0FE] text-[#0375F3]' : 'bg-white text-[#141522] hover:bg-gray-50/80'
                }`}
              >
                <DocumentTemplateIcon className='size-5 text-[#0375F3]' />
                <p className='text-sm font-medium'>Cài đặt mẫu tem NVL</p>
              </div>
            </div>

            {/* ========= View Template ========= */}
            <div className='col-span-2'>
              <div className='flex flex-col items-center gap-2 w-[80%] 2xl:w-[55%] mx-auto -mt-8  2xl:mt-0'>
                <h3 className=' text-lg font-semibold text-[#25387A] text-center'> {message[activeTab]?.title} </h3>

                <p className='text-base text-[#3A3E4C] text-center'>{message[activeTab]?.description}</p>

                <div className='relative w-full mt-4'>
                  {isLoadingPrintConfig ? (
                    // Skeleton khi đang load: giữ nguyên layout tổng thể để tránh layout shift
                    <div className='w-full flex flex-col items-center'>
                      {/* Khối item (khung ảnh) */}
                      <div className='p-3 rounded-lg bg-gray-50 w-full'>
                        <div className='flex items-center gap-2 h-[400px]'>
                          <div className='w-[360px] h-full mx-auto rounded-md bg-gray-200 animate-pulse' />
                        </div>
                      </div>
                      {/* Caption bên dưới ảnh */}
                      <div className='h-4 w-40 bg-gray-200 rounded mt-2 animate-pulse' />
                      {/* Pagination giả lập */}
                      <div className='flex justify-center gap-1 mt-3'>
                        <span className='w-2 h-2 bg-gray-200 rounded-full animate-pulse' />
                        <span className='w-2 h-2 bg-gray-200 rounded-full animate-pulse' />
                        <span className='w-2 h-2 bg-gray-200 rounded-full animate-pulse' />
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Nút điều hướng trái */}
                      <div className='swiper-button-prev-custom left-4 absolute top-[45%]  z-10 -translate-y-1/2 transition-all'>
                        <button className={`p-2 bg-[#EBF5FF] rounded-full text-[#25387A] ${isBeginning ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                          <FaArrowLeft />
                        </button>
                      </div>
                      {/* Nút điều hướng phải */}
                      <div className='swiper-button-next-custom right-4 absolute top-[45%] z-10 -translate-y-1/2 transition-all'>
                        <button className={`p-2 bg-[#EBF5FF] rounded-full text-[#25387A] ${isEnd ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                          <FaArrowRight />
                        </button>
                      </div>

                      {/* Carousel Swiper hiển thị item */}
                      <Swiper
                        slidesPerView={1}
                        spaceBetween={30}
                        loop={false}
                        pagination={{
                          el: '.custom-swiper-pagination',
                          clickable: true,
                          renderBullet: (index, className) => {
                            return `<span class="${className} custom-dot"></span>`;
                          },
                        }}
                        navigation={{
                          prevEl: '.swiper-button-prev-custom',
                          nextEl: '.swiper-button-next-custom',
                        }}
                        modules={[Pagination, Navigation]}
                        onInit={swiper => {
                          swiperRef.current = swiper;
                          updateNavState(swiper);
                          setActiveIndex(swiper.activeIndex ?? 0);
                        }}
                        onSlideChange={swiper => {
                          updateNavState(swiper);
                          setActiveIndex(swiper.activeIndex ?? 0);
                        }}
                      >
                        {listTemplate?.map((item, index) => (
                          <SwiperSlide key={item?.id ?? index}>
                            <div className='w-full flex flex-col items-center'>
                              {/* Khung item: dùng đúng UI mục tiêu */}
                              <div className='p-3 bg-white- rounded-lg bg-gray-50 w-full'>
                                <div className='flex items-center gap-2 h-[300px] 2xl:h-[400px]'>
                                  {item?.image ? (
                                    <Image alt={`template-${index + 1}`} src={item.image} width={600} height={600} className='w-[360px] h-full object-contain mx-auto' loading='eager' />
                                  ) : (
                                    <p className='text-sm font-medium text-[#141522] text-center mx-auto'>{item?.name || item?.title || `Mẫu ${index + 1}`}</p>
                                  )}
                                </div>
                              </div>

                              {/* Caption tên mẫu dưới ảnh */}
                              <p className='text-sm font-medium text-[#141522] text-center mx-auto pt-2'>{item?.name || item?.title || `Mẫu ${index + 1}`}</p>
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                      <div className='custom-swiper-pagination flex justify-center gap-1 mt-2' />
                    </>
                  )}
                </div>

                {(() => {
                  const isSelected = listTemplate?.[activeIndex]?.selected === 1;
                  return (
                    <button
                      onClick={handleSetPrintConfig(isSelected)}
                      // UI theo trạng thái: đã chọn -> light blue, text xanh đậm; chưa chọn -> primary
                      className={
                        `w-full flex items-center justify-center gap-2 px-8 py-2.5 rounded-lg font-medium mt-4 ` +
                        (isSelected ? 'bg-[#A9C8FB] text-[#25387A] cursor-default' : 'bg-[#0375F3] text-white transition hover:scale-105')
                      }
                      disabled={isSelected || isSaving}
                      aria-disabled={isSelected}
                    >
                      <CheckThinIcon className={`size-4 ${isSelected ? 'text-[#25387A]' : 'text-white'}`} />
                      <span>{isSelected ? 'Đã chọn mẫu này' : isSaving ? 'Đang lưu...' : 'Chọn mẫu'}</span>
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </SettingLayout>
    </React.Fragment>
  );
};

export default PrintTemplate;
