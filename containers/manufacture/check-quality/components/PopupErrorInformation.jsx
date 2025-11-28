import CloseRoundedIcon from '@/components/icons/common/CloseRoundedIcon';
import { ArrowRightIcon, BackIcon } from '@/components/icons';
import { useCheckQualityDetail } from '../hooks/useCheckQualityDetail';
import { Lexend_Deca } from '@next/font/google';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

const deca = Lexend_Deca({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

const PopupErrorInformation = ({ onClose, stage = 'Vắt sổ', errorCount = 3, tags = ['sanphamloi'], images = [], product = {}, qcId }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(null);
  const hasImages = Array.isArray(images) && images.length > 0;
  const THUMBS_PER_ROW = 5;
  const MAX_ROWS = 1;
  const MAX_VISIBLE_THUMBS = THUMBS_PER_ROW * MAX_ROWS;
  const hasOverflow = hasImages && images.length > MAX_VISIBLE_THUMBS;
  const displayedThumbnails = hasImages ? (hasOverflow ? images.slice(0, MAX_VISIBLE_THUMBS - 1) : images.slice(0, MAX_VISIBLE_THUMBS)) : [];
  const hiddenCount = hasOverflow ? images.length - (MAX_VISIBLE_THUMBS - 1) : 0;
  const firstHiddenIndex = hasOverflow ? MAX_VISIBLE_THUMBS - 1 : null;

  // const { data, isLoading } = useCheckQualityDetail(isState.open, props?.id);

  const handleOpenImage = index => {
    if (!hasImages) return;
    setActiveImageIndex(index);
  };

  const handleCloseImageModal = () => setActiveImageIndex(null);

  const showPrevImage = e => {
    e.stopPropagation();
    setActiveImageIndex(prev => {
      if (prev === null || !hasImages) return prev;
      return prev > 0 ? prev - 1 : images.length - 1;
    });
  };

  const showNextImage = e => {
    e.stopPropagation();
    setActiveImageIndex(prev => {
      if (prev === null || !hasImages) return prev;
      return (prev + 1) % images.length;
    });
  };

  const currentImageSrc = hasImages && activeImageIndex !== null ? images[activeImageIndex] : null;

  const { data: qcDetail } = useCheckQualityDetail(Boolean(qcId), qcId);

  useEffect(() => {
    if (qcDetail) {
      console.log('QC detail popup:', qcDetail);
    }
  }, [qcDetail]);

  const formatNumber = value => {
    if (value === null || value === undefined || value === '') return null;
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return value;
    return new Intl.NumberFormat('vi-VN').format(numeric);
  };

  const productInfo = useMemo(() => {
    const fallbackImage = (hasImages && images[0]) || product?.image || '/icon/noimagelogo.png';
    return {
      name: product?.name || 'Áo sơ mi basic 01',
      status: product?.status || 'Đang thực hiện',
      quantity: product?.quantity !== undefined && product?.quantity !== null ? formatNumber(product.quantity) : null,
      unit: product?.unit || 'cái',
      variant: product?.variant || '(none)',
      code: product?.code || 'TP-000001',
      image: fallbackImage,
    };
  }, [product, hasImages, images]);
  return (
    <div className={`${deca.className} bg-white rounded-[24px] w-[546px] h-[310px]- p-6 relative`}>
      {/* Close Button */}
      <button onClick={onClose} className='absolute top-4 right-4 cursor-pointer bg-transparent rounded-full p-1 hover:bg-gray-100 transition-colors' aria-label='Đóng'>
        {/* <IconClose className='rotate-45' size={40} color='#6B7280' /> */}
        <CloseRoundedIcon />
      </button>

      {/* Title */}
      <h2 className='text-[24px] font-bold leading-[20px] capitalize mb-4 text-black'>Thông Tin Lỗi</h2>

      {/* Product information */}
      <div className='flex gap-3 rounded-2xl '>
        <div className='relative w-16 h-16 rounded-[4px] bg-[#E4E8F0] overflow-hidden flex items-center justify-center'>
          {productInfo.image ? <Image src={productInfo.image} alt={productInfo.name} fill sizes='64px' className='object-cover' /> : <span className='text-xs text-[#9295A4]'>No image</span>}
        </div>
        <div className='flex flex-col  gap-1 flex-1 min-w-0'>
          <div className='flex  flex-col items-start  gap-2'>
            {/* {productInfo.status && <span className='px-2 py-0.5 rounded-[4px] text-[10px] text-[#076A94] bg-[#D8F3FD]'>{productInfo.status}</span>} */}
            <p className='text-sm font-semibold text-[#141522] leading-tight'>{productInfo.name}</p>
          </div>
          <div className='flex gap-5'>
            <div className='flex flex-col gap-2  text-[#667085] h-full'>
              <p className='text-[10px]'>Số lượng</p>
              <p className='text-[#EE1E1E] text-[14px] font-medium leading-none'>
                {productInfo.quantity ?? '0'}
                <span className='mt-auto text-[#141522] text-[10px] font-medium'>/{productInfo.unit}</span>
              </p>
            </div>
            <div className='flex flex-col gap-2 '>
              <p className='text-[#667085] text-[10px]'>{productInfo.variant || '(none)'}</p>
              {productInfo.code && <p className='ml-auto text-[#3276FA] text-[12px] font-medium'>{productInfo.code}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Stage and Error Count Row */}
      <div className='flex items-center justify-between mt-[16px] h-[48px] border-b border-[#F3F3F4] px-3'>
        <span className='text-[14px] font-semibold leading-[20px] text-[#3276FA]'>Công đoạn: {stage}</span>
        <span className='text-[14px] font-semibold leading-[20px] text-[#EE1E1E]'>Số lượng lỗi: {errorCount} cái</span>
      </div>

      {/* Tags */}
      <div className='flex items-center gap-2 mb-5 flex-wrap mt-[24px] px-3'>
        {tags.map((tag, index) => (
          <span key={index} className='px-3 py-1 bg-[#DBEBFF] text-black text-sm rounded-lg font-normal lowercase'>
            {tag}
          </span>
        ))}
      </div>

      {/* Image Thumbnails */}
      <div className='grid grid-cols-5 gap-1 px-3 mb-2'>
        {hasImages
          ? displayedThumbnails.map((image, index) => (
              <button
                key={index}
                type='button'
                onClick={() => handleOpenImage(index)}
                className='w-full aspect-[87/64] rounded-[4px] overflow-hidden bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#3276FA]'
              >
                <Image src={image} alt={`Error image ${index + 1}`} width={174} height={128} className='w-full h-full object-cover' />
              </button>
            ))
          : Array.from({ length: 5 }).map((_, index) => <div key={index} className='w-full aspect-[87/64] rounded-[4px] bg-gray-100' />)}
        {hasOverflow && firstHiddenIndex !== null && (
          <div className='relative w-full aspect-[87/64] rounded-[4px] overflow-hidden' onClick={() => handleOpenImage(firstHiddenIndex)}>
            <button type='button' className='absolute inset-0 focus:outline-none focus:ring-2 focus:ring-[#3276FA]'>
              <Image src={images[firstHiddenIndex]} alt={`Error image ${firstHiddenIndex + 1}`} width={87} height={64} className='w-full h-full object-cover pointer-events-none' />
            </button>
            <div className='absolute inset-0 bg-[#1F1F1F]/60 text-white flex items-center justify-center text-sm font-semibold'>+{hiddenCount}</div>
          </div>
        )}
      </div>

      {currentImageSrc && (
        <div className='fixed inset-0 z-[1200] flex items-center justify-center bg-black/60 backdrop-blur-sm' onClick={handleCloseImageModal}>
          <div className='relative w-[50vw] max-w-[900px] h-[70vh] bg-[#0F0F11] rounded-[24px] overflow-hidden flex items-center justify-center' onClick={e => e.stopPropagation()}>
            <button
              type='button'
              onClick={handleCloseImageModal}
              className='absolute top-4 right-4 flex items-center justify-center rounded-full p-2 hover:bg-white/10 transition focus:outline-none focus:ring-2 focus:ring-white/50 z-[1210]'
              aria-label='Đóng'
            >
              <CloseRoundedIcon size={32} color='#FFFFFF' />
            </button>
            {images.length > 1 && (
              <>
                <button
                  type='button'
                  onClick={showPrevImage}
                  className='absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full p-3 bg-white/10 hover:bg-white/30 transition text-white focus:outline-none focus:ring-2 focus:ring-white/50 z-[1210]'
                  aria-label='Ảnh trước'
                >
                  <BackIcon className='w-6 h-6 text-white' />
                </button>
                <button
                  type='button'
                  onClick={showNextImage}
                  className='absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full p-3 bg-white/10 hover:bg-white/30 transition text-white focus:outline-none focus:ring-2 focus:ring-white/50 z-[1210]'
                  aria-label='Ảnh tiếp theo'
                >
                  <BackIcon className='w-6 h-6 text-white rotate-180' />
                </button>
              </>
            )}
            <div className='relative w-full h-full flex items-center justify-center px-6 py-8 '>
              <div className='relative w-full h-full'>
                <Image src={currentImageSrc} alt='Preview image' fill className='object-contain' sizes='(max-width: 1024px) 80vw, 50vw' />
              </div>
            </div>
            {images.length > 0 && activeImageIndex !== null && (
              <div className='absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm font-medium px-3 py-1 rounded-full z-[1210]'>
                {activeImageIndex + 1}/{images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PopupErrorInformation;
