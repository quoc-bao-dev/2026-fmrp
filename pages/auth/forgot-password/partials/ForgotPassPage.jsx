import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { FaQuoteLeft, FaQuoteRight } from 'react-icons/fa';
import ForgotPass from './ForgotPass';
import Otp from './Otp';
import ResetPass from './ResetPass';
import { useForgotPassword } from './ForgotPasswordContext';
import QuickSupportButton from '../../login/QuickSupportButton';

/**
 * Forgot Password Page component
 * @description Multi-step forgot password flow with step-based rendering using global state
 * @returns {JSX.Element} Rendered forgot password page
 * @example
 * // Basic usage - renders forgot password form by default
 * <ForgotPassPage />
 */
const ForgotPassPage = () => {
    const { step } = useForgotPassword();
    const router = useRouter();

    // Handle navigation to login page when step is 'login'
    useEffect(() => {
        if (step === 'login') {
            router.push('/auth/login');
        }
    }, [step, router]);

    return (
        <div className='bg-[#EEF1F8]'>
            <div className="bg-[url('/Logo-BG.png')] relative bg-repeat-round h-screen w-screen flex flex-col justify-center items-center overflow-hidden">
                {/* ========== BACKGROUND AUTH FORGOT ========== */}
                <div className=''>
                    {/* Logo góc trên trái */}
                    <div className="absolute top-4 left-4 2xl:top-8 2xl:left-8">
                        <div className="scale-75 2xl:scale-110 origin-top-left">
                            <Image
                                alt=''
                                width={200}
                                src='/LOGOLOGIN-1.png'
                                height={70}
                                quality={100}
                                className='object-contain'
                                loading='lazy'
                                crossOrigin='anonymous'
                                placeholder='blur'
                                blurDataURL='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
                            />
                        </div>
                    </div>

                    {/* Khối text + QR góc dưới trái */}
                    <div className="absolute bottom-4 left-4 2xl:bottom-8 2xl:left-8">
                        <div className="scale-75 2xl:scale-110 origin-bottom-left">
                            <div className='space-y-1'>
                                <p className='text-[#344054] font-medium text-[32px] capitalize'>Trợ lý sản xuất</p>
                                <div className='space-y-1'>
                                    <p className='text-[#344054] font-normal text-[16px] flex items-center'>
                                        <FaQuoteLeft className='w-3 h-3 text-[#344054]' />
                                        <span className='mx-2'>Tối ưu sản xuất, tối đa năng suất, tối thiểu lãng phí</span>
                                        <FaQuoteRight className='w-3 h-3 text-[#344054]' />
                                    </p>
                                    <p className='text-[#667085] font-light text-[16px]'>
                                        Hotline:
                                        <span className='text-[#0F4F9E] font-normal ml-1'>0901.13.6968 - 0981.89.3353</span>
                                    </p>
                                </div>
                            </div>
                            <Link href='https://zalo.me/fososoft' target='_blank' className="">
                                <Image
                                    alt=''
                                    src='/qr.png'
                                    width={120}
                                    height={120}
                                    quality={100}
                                    className='object-contain w-auto h-auto mt-2'
                                    loading='lazy'
                                    crossOrigin='anonymous'
                                    placeholder='blur'
                                    blurDataURL='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
                                />
                            </Link>
                        </div>
                    </div>

                    {/* Nút hỗ trợ góc dưới phải */}
                    <div className="absolute bottom-4 right-4 z-[100] 2xl:bottom-8 2xl:right-8">
                        <QuickSupportButton typingSpeed={100} repeatDelay={3500} />
                    </div>
                </div>

                {/* ========== CONTENT FORGOT PASSWORD ========== */}
                <div className='z-10 flex justify-center w-full space-x-20'>
                    {/* ========== IMAGE ILLUSTRATION ========== */}
                    <div className='space-y-4 hidden lg:block'>
                        <Image
                            src='/image-login.png'
                            alt=''
                            width={1000}
                            height={1000}
                            quality={100}
                            className='object-contain w-[600px] 2xl:w-[800px] h-auto'
                            loading='lazy'
                            crossOrigin='anonymous'
                            placeholder='blur'
                            blurDataURL='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='
                        />
                    </div>

                    {/* ========= FORM FORGOT PASSWORD ========= */}
                    <div className='mx-4 lg:mx-0 w-full lg:w-fit flex flex-col justify-center'>
                        <div className="relative">
                            {/* Rocket animation trên form */}
                            <div className="absolute -top-10 -right-16">
                                <Image src='/dashboard/rocket-boy.gif' alt='@logo' width={100} height={100} className='object-contain size-[200px]' />
                            </div>

                            <div className='bg-white px-4 lg:px-16 py-8 flex flex-col gap-3 rounded-lg w-full lg:w-[600px]'>

                                {/* ========= STEP CONTENT SECTION ========= */}
                                {step === 'forgot' && <ForgotPass />}
                                {step === 'otp' && <Otp />}
                                {step === 'reset' && <ResetPass />}

                                {/* === Registration Link === */}
                                <div className='flex justify-center space-x-2 mt-8'>
                                    <span className='font-[300] '>Bạn chưa có tài khoản?</span>
                                    <Link href='/auth/register' className='text-[#5599EC]'>
                                        Đăng ký ngay
                                    </Link>
                                </div>

                                {/* === Footer Copyright === */}
                                {/* <div className='text-center text-[#667085] text-sm font-light mt-4'>FOSOSOFT © 2021</div> */}
                                <div className='text-center text-[#667085] text-sm font-light flex items-center gap-1 w-full justify-center mt-6'>
                                    <p>Power by</p>
                                    <Link href='https://fososoft.com' target='_blank' className='w-[45px] h-auto'>
                                        <Image src={'/icon/logo-green.png'} width={1280} height={1024} alt='@logo' className='object-contain w-full h-full' />
                                    </Link>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassPage;
