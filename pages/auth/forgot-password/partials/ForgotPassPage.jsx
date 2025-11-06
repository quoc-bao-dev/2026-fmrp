import AuthLayout from './AuthLayout';
import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ForgotPass from './ForgotPass';
import Otp from './Otp';
import ResetPass from './ResetPass';
import Image from 'next/image';
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
