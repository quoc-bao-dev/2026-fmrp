import { IMAGES } from '@/constants/images';
import PopupCustom from '@/components/UI/popup';
import { Lexend_Deca } from '@next/font/google';
import Image from 'next/image';
import { SparkleIcon, ChatIcon } from '@/components/icons';
import useSetingServer from '@/hooks/useConfigNumber';
import { useMemo } from 'react';

const deca = Lexend_Deca({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

/**
 * Parse HTML string và extract text từ các thẻ <li>
 * Bỏ qua tất cả style, màu sắc, font chữ, chỉ lấy nội dung text
 */
const parseHtmlToList = (htmlString) => {
  if (!htmlString) return [];

  try {
    // Tạo DOM parser để parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    
    // Tìm tất cả thẻ <li>
    const listItems = doc.querySelectorAll('li');
    
    // Extract text content từ mỗi <li> (bỏ qua HTML tags và style)
    const items = Array.from(listItems).map(li => {
      return li.textContent?.trim() || '';
    }).filter(item => item.length > 0);

    return items;
  } catch (error) {
    console.error('Error parsing HTML:', error);
    return [];
  }
};

const PopupUpgradePro = ({ open, onClose, onUpgrade, onContact }) => {
  const dataSeting = useSetingServer();
  
  // Parse HTML từ description_extend và fallback về mảng mặc định
  const improvements = useMemo(() => {
    if (dataSeting?.description_extend) {
      const parsed = parseHtmlToList(dataSeting.description_extend);
      if (parsed.length > 0) {
        return parsed;
      }
    }
    // Fallback về mảng mặc định nếu không có dữ liệu
    // return [
    //   'Tăng tốc hiệu suất, giúp thao tác nhanh và mượt hơn.',
    //   'Giao diện tối ưu, trực quan và dễ sử dụng hơn.',
    //   'Bổ sung tính năng mới: [Mô tả ngắn về tính năng mới].',
    //   'Sửa lỗi & nâng cấp bảo mật, đảm bảo hệ thống ổn định và an toàn hơn',
    // ];
    return [];
  }, [dataSeting?.description_extend]);

  return (
    <PopupCustom 
      open={open} 
      onClose={onClose} 
      lockScroll={true} 
      closeOnDocumentClick={false} 
      className='popup-upgrade-pro' 
      type='no-close'
      overlayStyle={{
        background: "#25387A50",
        zIndex: 1000,
        backdropFilter: "blur(2.5px)",
        WebkitBackdropFilter: "blur(2.5px)",
      }}
    >
      <div className={`${deca.className} flex flex-col w-[90vw] xl:w-[480px] 2xl:w-[542px] h-fit rounded-2xl bg-white`}>
        {/* Hình ảnh upgrade - phần trên */}
        <div className='relative w-full 2xl:h-[144px] h-[124px] flex-shrink-0'>
          <Image
            src={IMAGES.upgrade_pro_gif}
            alt='Upgrade Pro'
            width={542}
            height={400}
            className='absolute bottom-0 left-1/2 -translate-x-1/2 w-[280px] xl:w-[300px] 2xl:w-[347px] object-cover'
            priority
          />
        </div>

        {/* Nội dung text - phần dưới */}
        <div className='flex flex-col items-center px-4 xl:px-5 2xl:px-6 pb-4 xl:pb-5 2xl:pb-6 pt-4 flex-1 justify-start'>
          {/* Tiêu đề */}
          <h2
            className='text-[22px] xl:text-[24px] 2xl:text-[28px] font-semibold leading-[20px] text-center capitalize mb-2 xl:mb-10 2xl:mb-6'
            style={{ color: '#0375F3', fontFamily: 'Lexend Deca', fontWeight: 600 }}
          >
            {dataSeting?.title_extend || 'Nâng cấp gói để chuyển đổi'}
          </h2>

          {/* Subtitle */}
          {/* <p
            className="text-sm xl:text-[15px] 2xl:text-base font-medium leading-5 xl:leading-6 2xl:leading-6 text-center mb-4 xl:mb-5 2xl:mb-6 w-full max-w-[250px] xl:max-w-[270px] 2xl:w-[297px]"
            style={{ color: '#9295A4', fontFamily: 'Lexend Deca', fontWeight: 500 }}
          >
            Chúng tôi vừa phát hành Phiên bản v3.0 với nhiều cải tiến quan trọng:
          </p> */}

          {/* Thông báo với danh sách cải tiến */}
          <div className='w-full max-w-[380px] xl:max-w-[400px] 2xl:w-[441px] h-fit rounded-2xl mb-4 xl:mb-5 2xl:mb-6 p-5 xl:p-5 2xl:p-6' style={{ background: '#EBF5FF' }}>
            <div className='flex flex-col gap-2 xl:gap-2.5 2xl:gap-3'>
              {improvements.map((item, index) => (
                <div key={index} className='flex items-start gap-2 xl:gap-2.5 2xl:gap-3'>
                  <Image src={IMAGES.bullet} alt='bullet' width={24} height={24} className='w-5 h-5 xl:w-[22px] xl:h-[22px] 2xl:w-6 2xl:h-6 flex-shrink-0 mt-0.5' />
                  <p className='text-xs xl:text-[13px] 2xl:text-sm font-normal text-[#101828] leading-4 xl:leading-[18px] 2xl:leading-5 flex-1'>{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className='flex items-center gap-3 w-[380px] xl:w-[400px] mx-auto justify-center'>
            <a href='https://zalo.me/fososoft' target='_blank' className='flex-1'>
              <button
                //   onClick={onContact}
                className='w-full flex items-center justify-center gap-2 py-2.5 xl:py-2.5 2xl:py-3 px-4 xl:px-4 2xl:px-6 rounded-lg text-sm xl:text-[15px] 2xl:text-base font-medium text-[#0375F3] bg-white transition-all hover:bg-[#EBF5FF] border'
                style={{ borderColor: '#0375F3' }}
              >
                <ChatIcon className='w-4 h-4 xl:w-[18px] xl:h-[18px] 2xl:w-5 2xl:h-5' />
                <span>Liên hệ</span>
              </button>
            </a>
            <button
              onClick={onUpgrade}
              className='flex-1 flex items-center justify-center gap-2 py-2.5 xl:py-2.5 2xl:py-3 rounded-lg text-sm xl:text-[15px] 2xl:text-base font-medium text-white transition-all hover:opacity-90'
              style={{ background: '#0375F3' }}
            >
              <SparkleIcon className='w-4 h-4 xl:w-[18px] xl:h-[18px] 2xl:w-5 2xl:h-5' />
              <span>Nâng cấp ngay</span>
            </button>
          </div>
        </div>
      </div>
    </PopupCustom>
  );
};

export default PopupUpgradePro;
