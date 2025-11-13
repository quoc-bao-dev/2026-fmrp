import Head from 'next/head';
import React from 'react';
import { SearchNormal1 as IconSearch, SearchStatus1 } from 'iconsax-react';

const Page404 = () => {
  return (
    <React.Fragment>
      <Head>
        <title>404 - Không tìm thấy trang</title>
      </Head>
      <div className='min-h-screen w-screen flex flex-col justify-center items-center bg-gradient-to-br from-[#f1f5f9] via-[#c4d0e6] to-[#f8fafc] relative overflow-hidden'>
        <div className='absolute top-0 left-1/2 -translate-x-1/2 opacity-20 blur-[2px] pointer-events-none z-0'>
          <IconSearch size={440} className='text-[#c1cdf1]' />
        </div>
        <div className='relative z-10 flex flex-col items-center p-10 bg-white/80 rounded-xl shadow-2xl border border-gray-100 mt-6'>
          <SearchStatus1 size={72} className='mb-6 text-[#2563eb]' variant='Bulk' />
          <h1 className='text-4xl font-extrabold text-[#22223b] mb-3 tracking-tight'>404 - Không tìm thấy trang</h1>
          <h2 className='text-xl text-[#334155] mb-6'>Trang bạn tìm kiếm không tồn tại hoặc đã bị xoá</h2>
          <p className='text-[#64748b] mb-8 text-center max-w-md'>
            Có vẻ như đường dẫn này không hợp lệ hoặc đã bị thay đổi. Vui lòng kiểm tra lại địa chỉ hoặc quay về trang chủ để tiếp tục sử dụng dịch vụ.
          </p>
          <a href='/' className='inline-block px-6 py-3 bg-[#2563eb] text-white rounded-lg font-semibold transition hover:bg-[#1d4ed8] shadow'>
            Quay về trang chủ
          </a>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Page404;
