import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { FaQuoteLeft, FaQuoteRight } from 'react-icons/fa';
import ForgotPass from './ForgotPass';
import Otp from './Otp';
import ResetPass from './ResetPass';
import { useForgotPassword } from './ForgotPasswordContext';

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
                    <div className="absolute top-4 left-4">
                        <div className="scale-75 origin-top-left">
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
                    <div className="absolute bottom-4 left-4">
                        <div className="scale-75 origin-bottom-left">
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
                    <div className="absolute bottom-4 right-4 z-[100]">
                        <button
                            type='button'
                            onClick={() => window.open('https://zalo.me/fososoft', '_blank', 'noopener,noreferrer')}
                            className='flex items-center justify-center gap-2 cursor-pointer px-3 py-1.5 shadow-xl'
                            style={{
                                borderRadius: '12px',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(16px)',
                                WebkitBackdropFilter: 'blur(16px)',
                                border: '1px solid #D7EEFF',
                            }}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 1.5C10.0109 1.5 8.10322 2.29018 6.6967 3.6967C5.29018 5.10322 4.5 7.01088 4.5 9V15.75H3V9C3 7.8181 3.23279 6.64778 3.68508 5.55585C4.13738 4.46392 4.80031 3.47177 5.63604 2.63604C6.47177 1.80031 7.46392 1.13738 8.55585 0.685084C9.64778 0.232792 10.8181 0 12 0C13.1819 0 14.3522 0.232792 15.4442 0.685084C16.5361 1.13738 17.5282 1.80031 18.364 2.63604C19.1997 3.47177 19.8626 4.46392 20.3149 5.55585C20.7672 6.64778 21 7.8181 21 9V15.75H19.5V9C19.5 8.01509 19.306 7.03982 18.9291 6.12987C18.5522 5.21993 17.9997 4.39314 17.3033 3.6967C16.6069 3.00026 15.7801 2.44781 14.8701 2.0709C13.9602 1.69399 12.9849 1.5 12 1.5Z" fill="#1556D9" />
                                <path d="M16.5 12C16.5 11.6022 16.658 11.2206 16.9393 10.9393C17.2206 10.658 17.6022 10.5 18 10.5H21V16.5C21 16.8978 20.842 17.2794 20.5607 17.5607C20.2794 17.842 19.8978 18 19.5 18H18C17.6022 18 17.2206 17.842 16.9393 17.5607C16.658 17.2794 16.5 16.8978 16.5 16.5V12ZM7.5 12C7.5 11.6022 7.34196 11.2206 7.06066 10.9393C6.77936 10.658 6.39782 10.5 6 10.5H3V16.5C3 16.8978 3.15804 17.2794 3.43934 17.5607C3.72064 17.842 4.10218 18 4.5 18H6C6.39782 18 6.77936 17.842 7.06066 17.5607C7.34196 17.2794 7.5 16.8978 7.5 16.5V12Z" fill="#1556D9" />
                                <path fillRule="evenodd" clipRule="evenodd" d="M20.25 12.75C20.4489 12.75 20.6397 12.829 20.7803 12.9697C20.921 13.1103 21 13.3011 21 13.5V18C21 18.9946 20.6049 19.9484 19.9017 20.6517C19.1984 21.3549 18.2446 21.75 17.25 21.75H12C11.8011 21.75 11.6103 21.671 11.4697 21.5303C11.329 21.3897 11.25 21.1989 11.25 21C11.25 20.8011 11.329 20.6103 11.4697 20.4697C11.6103 20.329 11.8011 20.25 12 20.25H17.25C17.8467 20.25 18.419 20.0129 18.841 19.591C19.2629 19.169 19.5 18.5967 19.5 18V13.5C19.5 13.3011 19.579 13.1103 19.7197 12.9697C19.8603 12.829 20.0511 12.75 20.25 12.75Z" fill="#1556D9" />
                                <path d="M9.75 21C9.75 20.6022 9.90804 20.2206 10.1893 19.9393C10.4706 19.658 10.8522 19.5 11.25 19.5H12.75C13.1478 19.5 13.5294 19.658 13.8107 19.9393C14.092 20.2206 14.25 20.6022 14.25 21C14.25 21.3978 14.092 21.7794 13.8107 22.0607C13.5294 22.342 13.1478 22.5 12.75 22.5H11.25C10.8522 22.5 10.4706 22.342 10.1893 22.0607C9.90804 21.7794 9.75 21.3978 9.75 21Z" fill="#1556D9" />
                            </svg>

                            <p className="font-deca font-semibold text-[12px] text-[#1556D9]">Hỗ trợ</p>
                        </button>
                    </div>
                </div>

                {/* ========== CONTENT FORGOT PASSWORD ========== */}
                <div className='z-10 flex justify-center w-full space-x-20'>
                    {/* ========== IMAGE ILLUSTRATION ========== */}
                    <div className='space-y-4 hidden lg:block'>
                        <Image
                            src='/image-login.png'
                            alt=''
                            width={500}
                            height={500}
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
