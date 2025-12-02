import { FORMAT_MOMENT } from '@/constants/formatDate/formatDate';
import { formatMoment } from '@/utils/helpers/formatMoment';
import { Lexend_Deca } from '@next/font/google';
import { Add as IconClose } from 'iconsax-react';
import Image from 'next/image';
import { useDispatch, useSelector } from 'react-redux';

const deca = Lexend_Deca({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
});

const PopupSuccessfulBuyMoreUser = props => {
  const { dataLang, data } = props;
  const dispatch = useDispatch();

  const statePopupSuccessfulBuyMoreUser = useSelector(state => state.statePopupSuccessfulBuyMoreUser);

  const handleClose = () => {
    dispatch({
      type: 'statePopupSuccessfulBuyMoreUser',
      payload: {
        open: false,
      },
    });
  };

  return (
    <div className={`${deca.className} bg-[#F9FAFC] rounded-3xl p-6 2xl:p-9`}>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4 w-full'>
          <Image src='/icon/Sparkle.png' alt='logo' width={32} height={32} />
          <h2 className='text-2xl font-semibold text-[#25387A]'>{dataLang?.buy_more_user ?? 'Mua thêm user thành công'}</h2>
        </div>
        <button
          onClick={() => {
            dispatch({
              type: 'statePopupGlobal',
              payload: { open: false },
            });
          }}
          className='cursor-pointer bg-white rounded-full p-1.5'
        >
          <IconClose className='rotate-45' />
        </button>
      </div>
      <div className={`w-[750px] max-h-[75vh] flex flex-col items-center justify-center gap-3 2xl:gap-6 pt-4 2xl:pt-9 ${deca.className}`}>
        <div className=''>
          <Image width={323} height={250} src={'/popup/commandCompleted.webp'} alt='commandCompleted' className='object-cover w-[270px] 2xl:w-[323px] ' priority unoptimized />
        </div>
        <div className='flex gap-4 w-full'>
          <div className='p-3 py-2 2xl:py-3 rounded-xl border border-[#919EAB3D] w-full'>
            <h3 className='text-lg font-medium text-typo-gray-4'>Ngày mua hàng:</h3>
            <p className='text-lg font-medium text-typo-black-4'>{formatMoment(data?.date, FORMAT_MOMENT.DATE_TIME_SLASH_LONG)}</p>
          </div>
          <div className='p-3 py-2 2xl:py-3 rounded-xl border border-[#919EAB3D] w-full'>
            <h3 className='text-lg font-medium text-typo-gray-4'>Mã đơn hàng:</h3>
            <p className='text-lg font-medium text-[#003DA0]'>{data?.code_upgrade_package}</p>
          </div>
        </div>
        <p className='text-base 2xl:text-lg font-normal text-typo-gray-4'>
          🎉 Cảm ơn bạn đã tin tưởng và mua thêm <span className='text-[#003DA0]'>{data?.number_of_users ?? ''} user</span> cho gói <span className='text-[#003DA0]'>{data?.name_package}</span>
          .
          <br /> Gói của bạn sẽ có hiệu lực đến <span className='text-[#EE1E1E]'>{data?.expiration_date}</span>
          .
          <br />
          Bạn có thể tải về hóa đơn ngay tại đây hoặc kiểm tra email đã đăng ký tài khoản để xem chi tiết.
          <br /> Nếu cần hỗ trợ thêm trong quá trình sử dụng, đừng ngần ngại liên hệ{' '}
          <a href='https://zalo.me/fososoft' target='_blank' className='text-typo-blue-2 underline'>
            bộ phận CSKH
          </a>{' '}
          của chúng tôi. Đội ngũ FMRP luôn sẵn sàng đồng hành cùng bạn!
        </p>
        <div className='w-full'>
          <p className='text-base 2xl:text-lg font-normal text-typo-black-4'>
            Trân trọng, <br />
            Đội ngũ FMRP <br /> Quản lý xưởng dễ dàng hơn bao giờ hết.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PopupSuccessfulBuyMoreUser;
