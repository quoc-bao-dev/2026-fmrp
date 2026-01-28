import React from 'react';
import Head from 'next/head';

export default function ApplicationPieceworkWage(props) {
    const { dataLang } = props;

    return (
        <div className='w-full'>
            <Head>
                <title>{dataLang?.piecework_wage || 'Lương sản lượng'}</title>
            </Head>

            <div className='rounded-2xl bg-white/70 backdrop-blur-sm border border-[#E5E7EB] p-6'>
                <h2 className='text-[#1D293D] font-semibold text-lg'>Application / Piecework Wage</h2>
                <p className='text-sm text-[#667085] mt-1'>Trang này là skeleton theo cấu trúc hệ thống. Bạn muốn hiển thị nội dung gì ở đây?</p>
            </div>
        </div>
    );
}

