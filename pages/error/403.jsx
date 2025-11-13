import Head from 'next/head';
import React from 'react';
import { SearchNormal1 as IconSearch } from 'iconsax-react';
import { Lock1 } from 'iconsax-react';

const Page403 = () => {
  return (
    <React.Fragment>
      <Head>
        <title>403 - Không có quyền truy cập</title>
      </Head>
      <div className='min-h-screen w-screen flex flex-col justify-center items-center bg-gradient-to-br from-[#f1f5f9] via-[#c4d0e6] to-[#f8fafc] relative overflow-hidden'>
        <div className='absolute top-0 left-1/2 -translate-x-1/2 opacity-20 blur-[2px] pointer-events-none z-0'>
          <IconSearch size={440} className='text-[#a0aec0]' />
        </div>
        <div className='relative z-10 flex flex-col items-center p-12 bg-white/70 rounded-xl shadow-2xl border border-gray-100'>
          <Lock1 size={72} className='mb-6 text-[#2563eb]' variant='Bulk' />
          <h1 className='text-4xl font-extrabold text-[#22223b] mb-3 tracking-tight'>403 - Forbidden</h1>
          <h2 className='text-xl text-[#334155] mb-6'>Bạn không có quyền truy cập vào trang này</h2>
          <p className='text-[#64748b] mb-8 text-center max-w-md'>
            Có vẻ như bạn đang cố truy cập một trang mà bạn không có quyền. Hãy liên hệ quản trị viên để được cấp quyền hoặc quay lại trang chủ.
          </p>
          <a href='/' className='inline-block px-6 py-3 bg-[#2563eb] text-white rounded-lg font-semibold transition hover:bg-[#1d4ed8] shadow'>
            Quay về trang chủ
          </a>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Page403;
