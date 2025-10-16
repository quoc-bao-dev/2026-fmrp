import AuthLayout from './AuthLayout';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ForgotPass from './ForgotPass';
import Otp from './Otp';
import ResetPass from './ResetPass';
import Image from 'next/image';

/**
 * Forgot Password Page component
 * @description Multi-step forgot password flow with step-based rendering
 * @returns {JSX.Element} Rendered forgot password page
 * @example
 * // Basic usage - renders forgot password form by default
 * <ForgotPassPage />
 *
 * // With step parameter - renders specific step
 * // URL: /auth/forgot-password?step=otp
 * // URL: /auth/forgot-password?step=reset
 */
const ForgotPassPage = () => {
    const router = useRouter();
    const stepParam = Array.isArray(router.query.step) ? router.query.step[0] : router.query.step;
    const step = stepParam || 'forgot';

    return (
        <AuthLayout title='Quên Mật Khẩu'>
            <div className=''>
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
                    <Link href='https://fososoft.vn' target='_blank' className='w-[45px] h-auto'>
                        <Image src={'/icon/logo-green.png'} width={1280} height={1024} alt='@logo' className='object-contain w-full h-full' />
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
};

export default ForgotPassPage;
