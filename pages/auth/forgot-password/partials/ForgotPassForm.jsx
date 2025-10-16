import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useForgotPassword } from '@/managers/api/auth/useForgotPassword';
import { useRouter } from 'next/router';
import Input from './Input';

// Zod schema for form validation
const forgotPasswordSchema = z.object({
    phone: z
        .string()
        .min(1, 'Vui lòng nhập số điện thoại')
        .regex(/^[0-9+\-\s()]+$/, 'Số điện thoại không hợp lệ')
        .min(10, 'Số điện thoại phải có ít nhất 10 số'),
    companyCode: z
        .string()
        .min(1, 'Vui lòng nhập mã công ty')
        .min(3, 'Mã công ty phải có ít nhất 3 ký tự')
        .max(20, 'Mã công ty không được vượt quá 20 ký tự')
        .regex(/^[A-Za-z0-9]+$/, 'Mã công ty chỉ được chứa chữ cái và số'),
});

/**
 * @typedef {Object} ForgotPassFormProps
 * @property {Function} [onSubmit] - Form submission handler
 * @param {Object} onSubmit.data - Form data
 * @param {string} onSubmit.data.phone - Phone number
 * @param {string} onSubmit.data.companyCode - Company code
 */

/**
 * Forgot Password Form component
 * @description Form for entering phone number to initiate password reset
 * @param {ForgotPassFormProps} props - Component props
 * @returns {JSX.Element} Rendered forgot password form
 * @example
 * // Basic usage
 * <ForgotPassForm onSubmit={handleSubmit} />
 *
 * // Without submit handler
 * <ForgotPassForm />
 */
const ForgotPassForm = ({ onSubmit: onSubmitProp }) => {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
    } = useForm({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const { forgotPassword, isLoading } = useForgotPassword({
        onSuccess: data => {
            if (data?.isSuccess) {
                try {
                    const phoneValue = watch('phone');
                    if (phoneValue) sessionStorage.setItem('forgot_phone', phoneValue);
                    sessionStorage.setItem('company_code', data.company_code);
                    sessionStorage.setItem('company_name', data.company_name);
                } catch (e) {}
                router.push('/auth/forgot-password?step=otp');
            }
            if (typeof onSubmitProp === 'function') onSubmitProp(data);
        },
        onError: error => {
            console.error('Forgot password error:', error);
        },
    });

    const onSubmit = async data => {
        // Transform form data to match API payload
        const payload = {
            phone_number: data.phone,
            company_code: data.companyCode,
        };

        await forgotPassword(payload);
        // console.log(payload);
    };

    return (
        <>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-8 mt-20'>
                {/* [Form Fields] */}
                <Input type='text' placeholder='Nhập số điện thoại' {...register('phone')} error={errors.phone} />

                {/* [Mã công ty] */}
                <Input type='text' placeholder='Mã công ty' {...register('companyCode')} error={errors.companyCode} />

                {/* [Form Actions] */}
                <button
                    type='submit'
                    disabled={isLoading}
                    className={`text-[#FFFFFF] font-normal text-lg py-3 w-full rounded-md bg-gradient-to-l from-[#0375f3] via-[#296dc1] to-[#0375f3] btn-animation hover:scale-105 ${
                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                >
                    {isLoading ? 'Đang xử lý...' : 'Tiếp theo'}
                </button>
            </form>
        </>
    );
};

export default ForgotPassForm;
