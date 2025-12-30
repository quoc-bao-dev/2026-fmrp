import { CalendarIcon, CaretDownIcon, Clock2Icon, EqualizerIcon, FunnelIcon, PresentationChartIcon, ProgressIcon, SearchIcon } from '@/components/icons';
import { DropdownAvatar } from '@/components/layout/header';
import { Customscrollbar } from '@/components/UI/common/Customscrollbar';
import { IMAGES } from '@/constants/images';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

const ProductItem = () => {
  return (
    <div className='p-1 flex items-center gap-2 w-full'>
      <Image src={IMAGES.noImage} alt='default' width={100} height={100} className='size-11 bg-[#E2E5E9] rounded-lg overflow-hidden object-cover border border-[#DDDDE2]' />
      <div className='flex flex-col flex-1'>
        <div className='flex items-center gap-2'>
          <span className='responsive-text-xxs font-normal text-blue-fmrp'>TP-000001</span>
          <span className='responsive-text-xxs font-normal text-[#D0D5DD]'>|</span>
          <span className='responsive-text-xxs font-normal text-blue-fmrp'>LSXCT-13032519</span>
        </div>
        <div className='flex flex-col gap-0.5'>
          <h4 className='responsive-text-sm font-semibold text-[#141522]'>Dép tổ ong màu vàng</h4>
          <p className='responsive-text-xxs font-normal text-[#667085]'>Vàng - 40</p>
        </div>
      </div>
      <div className='responsive-text-xs font-medium text-[#2BB38A]'>5.000/cái</div>
    </div>
  );
};

const AvatarTimeGroup = () => {
  return (
    <div className='flex items-center gap-2 justify-between w-full'>
      <div className='p-1 flex rounded-full bg-[#D6EAFE]'>
        <Image src='/shift-schedule.png' alt='default' width={100} height={100} className='size-[30px] bg-[#E2E5E9] rounded-full overflow-hidden object-cover border-2 border-[#549AE8] -ml-0 z-1' />
        <Image src='/shift-schedule.png' alt='default' width={100} height={100} className='size-[30px] bg-[#E2E5E9] rounded-full overflow-hidden object-cover border-2 border-[#549AE8] -ml-2 z-[2]' />
        <Image src='/shift-schedule.png' alt='default' width={100} height={100} className='size-[30px] bg-[#E2E5E9] rounded-full overflow-hidden object-cover border-2 border-[#549AE8] -ml-2 z-[3]' />
      </div>
      {/* <div className='py-1 px-1.5 flex items-center gap-1 rounded-full bg-[#FEF3DA]'>
        <Clock2Icon className='size-5 text-[#505050]' />
        <p className='responsive-text-xs font-medium text-[#505050]'>04:12:33</p>
      </div> */}
    </div>
  );
};

const ProductionOrderCard = ({ borderColor = '#EEB600' }) => {
  return (
    <div className='flex flex-col items-start gap-3 p-4 rounded-xl bg-white border border-[#F3F4F680]'>
      <div className='w-full flex items-center justify-between gap-2'>
        <div className='py-0.5 px-2 border-l-2' style={{ borderColor }}>
          <h4 className='responsive-text-sm font-semibold mb-1' style={{ color: borderColor }}>
            LSX-161225109
          </h4>
          <p className='responsive-text-xs font-normal text-[#667085]'>Đơn hàng SO_000010</p>
        </div>
        <div className='flex items-center gap-1.5'>
          <CalendarIcon className='size-3.5 text-[#667085]' />
          <p className='responsive-text-xxs font-normal text-[#667085]'>25/12/2025</p>
        </div>
      </div>
      <AvatarTimeGroup />

      <div className='px-1 flex items-center gap-3 w-full'>
        <div className='flex items-center gap-1 flex-shrink-0'>
          <ProgressIcon className='size-4 text-[#99A1AF]' />
          <p className='responsive-text-xs font-normal text-[#667085]'>Tiến trình</p>
          <p className='responsive-text-xs font-medium text-blue-fmrp ml-1'>4/5</p>
        </div>
        <div className='relative bg-[#EEEFF0] rounded-full h-1.5 w-full overflow-hidden'>
          <div className='absolute left-0 top-0 bg-blue-fmrp rounded-full h-full w-3/4' />
        </div>
      </div>
      <div className='flex flex-col gap-1 w-full'>
        <ProductItem />
        <ProductItem />
        <ProductItem />
      </div>
      <span className='px-1 responsive-text-sm font-normal text-[#667085]'>Xem thêm (2)</span>
    </div>
  );
};

const Complete = () => {
  return (
    <div className='flex flex-col gap-5 h-screen max-h-screen'>
      <Head>
        <title>Nhập sản lượng</title>
      </Head>
      <header className='sticky top-0 z-10 pr-4 pl-8 py-5 bg-new-blue flex gap-10 items-center justify-between'>
        <div className='flex items-center gap-5'>
          <Link href='/' className='relative '>
            <Image
              alt=''
              src='/LOGO_HEADER.png'
              width={100}
              height={45}
              quality={100}
              className='3xl:w-[110px] 2xl:w-[100px] xl:w-[90px] w-[90px] h-auto object-contain'
              loading='lazy'
              crossOrigin='anonymous'
              placeholder='blur'
              blurDataURL='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
            />
          </Link>
          <h2 className='py-0.5 px-2 rounded-lg bg-[#E2F0FE] responsive-text-lg font-medium text-new-blue capitalize'>Trang quản lý</h2>
        </div>
        <div className='flex items-center gap-3'>
          <button className='h-10 bg-white px-4 py-2 rounded-lg flex items-center gap-2 border border-[#D0D5DD]'>
            <FunnelIcon className='size-4 text-[#003DA0]' />
            <span className='responsive-text-sm font-medium text[#25387A]'>Lọc nhân viên</span>
            <CaretDownIcon className='size-3 text-[#9295A4]' />
          </button>
          <button className='h-10 bg-white px-4 py-2 rounded-lg flex items-center gap-2 border border-[#D0D5DD]'>
            <FunnelIcon className='size-4 text-[#003DA0]' />
            <span className='responsive-text-sm font-medium text[#25387A]'>Lọc công đoạn</span>
            <CaretDownIcon className='size-3 text-[#9295A4]' />
          </button>
          <button className='h-10 w-[340px] bg-white px-3 py-2 rounded-lg flex items-center justify-between gap-2 border border-[#D0D5DD]'>
            <input className='w-full border-none outline-none responsive-text-base text[#3A3E4C]' placeholder='Tìm kiếm mã lệnh sản xuất' />
            <div className='p-1 rounded-lg bg-[#1760B9]'>
              <SearchIcon className='size-4 text-white' />
            </div>
          </button>
          <DropdownAvatar />
        </div>
      </header>
      <div className='flex flex-col gap-4 flex-1 min-h-0 max-h-full overflow-hidden'>
        <div className='flex items-center justify-between px-6'>
          <h2 className='responsive-text-4xl font-medium text-neutral-07 capitalize'>Nhập sản lượng</h2>
          <button className='h-10 bg-white px-4 py-2 rounded-lg flex items-center gap-2 border border-[#D0D5DD]'>
            <EqualizerIcon className='size-4 text-[#9295A4]' />
            <span className='responsive-text-base font-normal text[#3A3E4C]'>Lọc</span>
            <CaretDownIcon className='size-3 text-[#9295A4]' />
          </button>
        </div>

        <div className='flex gap-6 w-full h-full flex-1 min-h-0'>
          <div className='px-6 flex gap-6 w-full h-full overflow-x-scroll overflow-y-hidden'>
            <div className='w-[420px] flex-shrink-0 rounded-lg pt-1 pb-4 flex flex-col gap-3 bg-[#EBEBEB]'>
              <div className='px-4 py-3 flex items-center gap-2'>
                <PresentationChartIcon className='size-6' />
                <h3 className='responsive-text-2xl font-medium text-blue-fmrp'>Cắt</h3>
                <span className='bg-[#FD2424] size-4 flex items-center justify-center rounded-full px-1 responsive-text-xs font-normal text-white -mt-3 -ml-1'>2</span>
              </div>
              <Customscrollbar className='flex-1 min-h-0'>
                <div className='flex flex-col gap-2.5 px-4'>
                  <ProductionOrderCard borderColor='#EEB600' />
                  <ProductionOrderCard borderColor='#1A7526' />
                  <ProductionOrderCard borderColor='#1A7526' />
                </div>
              </Customscrollbar>
            </div>
            <div className='w-[420px] flex-shrink-0 rounded-lg pt-1 pb-4 flex flex-col gap-3 bg-[#EBEBEB]'>
              <div className='px-4 py-3 flex items-center gap-2'>
                <PresentationChartIcon className='size-6' />
                <h3 className='responsive-text-2xl font-medium text-blue-fmrp'>Thêu</h3>
                <span className='bg-[#FD2424] size-4 flex items-center justify-center rounded-full px-1 responsive-text-xs font-normal text-white -mt-3 -ml-1'>2</span>
              </div>
              <div className='flex flex-col gap-2.5 px-4'>
                <ProductionOrderCard borderColor='#EEB600' />
                <ProductionOrderCard borderColor='#1A7526' />
              </div>
            </div>
            <div className='w-[420px] flex-shrink-0 rounded-lg pt-1 pb-4 flex flex-col gap-3 bg-[#EBEBEB]'>
              <div className='px-4 py-3 flex items-center gap-2'>
                <PresentationChartIcon className='size-6' />
                <h3 className='responsive-text-2xl font-medium text-blue-fmrp'>May</h3>
                <span className='bg-[#FD2424] size-4 flex items-center justify-center rounded-full px-1 responsive-text-xs font-normal text-white -mt-3 -ml-1'>2</span>
              </div>
              <div className='flex flex-col gap-2.5 px-4'>
                <ProductionOrderCard borderColor='#EEB600' />
                <ProductionOrderCard borderColor='#1A7526' />
              </div>
            </div>
            <div className='w-[420px] flex-shrink-0 rounded-lg pt-1 pb-4 flex flex-col gap-3 bg-[#EBEBEB]'>
              <div className='px-4 py-3 flex items-center gap-2'>
                <PresentationChartIcon className='size-6' />
                <h3 className='responsive-text-2xl font-medium text-blue-fmrp'>Đóng gói</h3>
                <span className='bg-[#FD2424] size-4 flex items-center justify-center rounded-full px-1 responsive-text-xs font-normal text-white -mt-3 -ml-1'>2</span>
              </div>
              <div className='flex flex-col gap-2.5 px-4'>
                <ProductionOrderCard borderColor='#EEB600' />
                <ProductionOrderCard borderColor='#1A7526' />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Complete;
